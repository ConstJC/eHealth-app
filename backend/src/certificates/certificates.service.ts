import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCertificateDto, UpdateCertificateDto } from './dto/certificates.dto';
import { toUTCDateOnly } from '../common/utils/date.utils';

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  async create(doctorId: string, dto: CreateCertificateDto) {
    const certificateNo = `CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return this.prisma.medicalCertificate.create({
      data: {
        ...dto,
        doctorId,
        certificateNo,
        startDate: dto.startDate ? toUTCDateOnly(dto.startDate) : null,
        endDate: dto.endDate ? toUTCDateOnly(dto.endDate) : null,
        returnDate: dto.returnDate ? toUTCDateOnly(dto.returnDate) : null,
      },
      include: {
        patient: true,
      }
    });
  }

  async findAll() {
    return this.prisma.medicalCertificate.findMany({
      include: {
        patient: true,
      }
    });
  }

  async findOne(id: string) {
    const certificate = await this.prisma.medicalCertificate.findUnique({
      where: { id },
      include: {
        patient: true,
      }
    });

    if (!certificate) {
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    }

    return certificate;
  }

  async findByPatient(patientId: string) {
    return this.prisma.medicalCertificate.findMany({
      where: { patientId },
      include: {
        patient: true,
      }
    });
  }

  async update(id: string, dto: UpdateCertificateDto) {
    return this.prisma.medicalCertificate.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? toUTCDateOnly(dto.startDate) : undefined,
        endDate: dto.endDate ? toUTCDateOnly(dto.endDate) : undefined,
        returnDate: dto.returnDate ? toUTCDateOnly(dto.returnDate) : undefined,
      }
    });
  }

  async remove(id: string) {
    return this.prisma.medicalCertificate.delete({
      where: { id }
    });
  }
}
