import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

export interface FileMetadata {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy?: string;
}

@Injectable()
export class FilesService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private readonly maxFileSize = {
    PATIENT_PHOTO: 5 * 1024 * 1024, // 5MB
    VISIT_ATTACHMENT: 10 * 1024 * 1024, // 10MB
    DOCUMENT: 10 * 1024 * 1024, // 10MB
  };
  private readonly allowedMimeTypes = {
    PATIENT_PHOTO: ['image/jpeg', 'image/png', 'image/jpg'],
    VISIT_ATTACHMENT: [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    DOCUMENT: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ],
  };

  constructor(private readonly prisma: PrismaService) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Validate file type
   */
  private validateFileType(mimeType: string, fileType: string): boolean {
    const allowed = this.allowedMimeTypes[fileType] || [];
    return allowed.includes(mimeType);
  }

  /**
   * Validate file size
   */
  private validateFileSize(size: number, fileType: string): boolean {
    const maxSize = this.maxFileSize[fileType] || this.maxFileSize.DOCUMENT;
    return size <= maxSize;
  }

  /**
   * Generate file URL
   */
  private generateFileUrl(filename: string): string {
    return `/api/files/${filename}`;
  }

  /**
   * Upload file
   */
  async upload(
    file: Express.Multer.File,
    fileType: string = 'DOCUMENT',
    userId?: string,
  ): Promise<FileMetadata> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    if (!this.validateFileType(file.mimetype, fileType)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed for ${fileType}`,
      );
    }

    // Validate file size
    if (!this.validateFileSize(file.size, fileType)) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size for ${fileType}`,
      );
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${randomUUID()}${fileExtension}`;
    const filePath = path.join(this.uploadDir, uniqueFilename);

    // Save file
    fs.writeFileSync(filePath, file.buffer);

    // Return metadata
    return {
      id: uniqueFilename,
      filename: uniqueFilename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: this.generateFileUrl(uniqueFilename),
      uploadedAt: new Date(),
      uploadedBy: userId,
    };
  }

  /**
   * Upload patient photo
   */
  async uploadPatientPhoto(
    patientId: string,
    file: Express.Multer.File,
    userId?: string,
  ): Promise<FileMetadata> {
    // Verify patient exists
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Upload file
    const metadata = await this.upload(file, 'PATIENT_PHOTO', userId);

    // Update patient photo URL
    await this.prisma.patient.update({
      where: { id: patientId },
      data: { photoUrl: metadata.url },
    });

    return metadata;
  }

  /**
   * Upload visit attachment
   */
  async uploadVisitAttachment(
    visitId: string,
    file: Express.Multer.File,
    userId?: string,
  ): Promise<FileMetadata> {
    // Verify visit exists
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    // Upload file
    const metadata = await this.upload(file, 'VISIT_ATTACHMENT', userId);

    // Update visit attachments
    const attachments = (visit.attachments || []) as string[];
    attachments.push(metadata.url);

    await this.prisma.visit.update({
      where: { id: visitId },
      data: { attachments },
    });

    return metadata;
  }

  /**
   * Get file metadata
   */
  async findOne(filename: string): Promise<FileMetadata> {
    const filePath = path.join(this.uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    const stats = fs.statSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    return {
      id: filename,
      filename,
      originalName: filename,
      mimeType: mimeTypes[ext] || 'application/octet-stream',
      size: stats.size,
      url: this.generateFileUrl(filename),
      uploadedAt: stats.birthtime,
    };
  }

  /**
   * Download file
   */
  async download(filename: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const filePath = path.join(this.uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    return {
      buffer,
      mimeType: mimeTypes[ext] || 'application/octet-stream',
    };
  }

  /**
   * Get patient files
   */
  async findByPatient(patientId: string): Promise<string[]> {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const files: string[] = [];
    if (patient.photoUrl) {
      files.push(patient.photoUrl);
    }

    return files;
  }

  /**
   * Get visit attachments
   */
  async findByVisit(visitId: string): Promise<string[]> {
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    return (visit.attachments || []) as string[];
  }

  /**
   * Delete file
   */
  async remove(filename: string): Promise<void> {
    const filePath = path.join(this.uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    fs.unlinkSync(filePath);

    // Remove from patient photo if exists
    await this.prisma.patient.updateMany({
      where: { photoUrl: { contains: filename } },
      data: { photoUrl: null },
    });

    // Remove from visit attachments if exists
    // Note: Prisma doesn't support array contains directly, so we'll filter in memory
    const allVisits = await this.prisma.visit.findMany({
      where: {
        attachments: { not: null },
      },
    });
    
    const visits = allVisits.filter((visit) => {
      const attachments = (visit.attachments || []) as string[];
      return attachments.some((url) => url.includes(filename));
    });

    for (const visit of visits) {
      const attachments = (visit.attachments || []) as string[];
      const updated = attachments.filter((url) => !url.includes(filename));
      await this.prisma.visit.update({
        where: { id: visit.id },
        data: { attachments: updated },
      });
    }
  }
}

