import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitDto, UpdateVisitDto, SearchVisitDto } from './dto';
import { Visit, Prisma, VisitStatus } from '@prisma/client';

@Injectable()
export class VisitsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new visit
   */
  async create(dto: CreateVisitDto, doctorId: string): Promise<Visit> {
    // Verify patient exists
    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Handle custom visit types - we now allow any string in the database
    const visitTypeForDb = dto.visitType as string;
    
    // Calculate BMI if height and weight are provided
    let bmi: number | null = null;
    if (dto.height && dto.weight) {
      const heightInMeters = dto.height / 100;
      bmi = dto.weight / (heightInMeters * heightInMeters);
      bmi = Math.round(bmi * 10) / 10; // Round to 1 decimal
    }

    // Create visit
    const visit = await this.prisma.visit.create({
      data: {
        ...dto,
        visitType: visitTypeForDb,
        doctorId,
        visitDate: dto.visitDate ? new Date(dto.visitDate) : new Date(),
        bmi,
        vitalSignsRecordedBy: dto.bloodPressureSystolic ? doctorId : null,
        vitalSignsRecordedAt: dto.bloodPressureSystolic ? new Date() : null,
      },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return visit;
  }

  /**
   * Find all visits with filters and pagination
   */
  async findAll(query: SearchVisitDto) {
    const {
      patientId,
      doctorId,
      status,
      visitType,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.VisitWhereInput = {
      ...(patientId && { patientId }),
      ...(doctorId && { doctorId }),
      ...(status && { status }),
      ...(visitType && { visitType }),
      ...(startDate || endDate
        ? {
            visitDate: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    };

    // Execute query
    const [visits, total] = await Promise.all([
      this.prisma.visit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { visitDate: 'desc' },
        include: {
          patient: {
            select: {
              id: true,
              patientId: true,
              firstName: true,
              lastName: true,
            },
          },
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              prescriptions: true,
            },
          },
        },
      }),
      this.prisma.visit.count({ where }),
    ]);

    return {
      data: visits,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find one visit by ID
   */
  async findOne(id: string): Promise<Visit> {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true,
            allergies: true,
            chronicConditions: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        prescriptions: {
          orderBy: { createdAt: 'desc' },
        },
        invoice: true,
      },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    return visit;
  }

  /**
   * Update visit
   */
  async update(
    id: string,
    dto: UpdateVisitDto,
    userId: string,
  ): Promise<Visit> {
    // Check if visit exists
    const existingVisit = await this.findOne(id);

    // Check if visit is locked
    if (existingVisit.isLocked) {
      throw new BadRequestException(
        'Cannot update locked visit. Unlock it first or create an addendum.',
      );
    }

    // Calculate BMI if height and weight are provided
    let bmi: number | undefined = undefined;
    if (dto.height && dto.weight) {
      const heightInMeters = dto.height / 100;
      bmi = dto.weight / (heightInMeters * heightInMeters);
      bmi = Math.round(bmi * 10) / 10;
    }

    // Extract fields that should not be updated (core identifiers)
    const { patientId, visitType, ...updateableFields } = dto;

    // Update visit
    const visit = await this.prisma.visit.update({
      where: { id },
      data: {
        ...updateableFields,
        visitDate: dto.visitDate ? new Date(dto.visitDate) : undefined,
        followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : undefined,
        bmi,
      },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return visit;
  }

  /**
   * Complete and lock visit
   */
  async completeVisit(id: string, userId: string): Promise<Visit> {
    // Check if visit exists
    const existingVisit = await this.findOne(id);

    // Check if already completed
    if (existingVisit.status === VisitStatus.COMPLETED) {
      throw new BadRequestException('Visit is already completed');
    }

    // Check if visit is locked
    if (existingVisit.isLocked) {
      throw new BadRequestException('Visit is already locked');
    }

    // Validate required fields for completion
    if (!existingVisit.chiefComplaint) {
      throw new BadRequestException(
        'Chief complaint is required to complete visit',
      );
    }

    // Update visit status
    const visit = await this.prisma.visit.update({
      where: { id },
      data: {
        status: VisitStatus.COMPLETED,
        isLocked: true,
        lockedAt: new Date(),
        lockedBy: userId,
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    return visit;
  }

  /**
   * Unlock visit (admin/doctor only)
   */
  async unlockVisit(id: string): Promise<Visit> {
    // Check if visit exists
    await this.findOne(id);

    const visit = await this.prisma.visit.update({
      where: { id },
      data: {
        isLocked: false,
        lockedAt: null,
        lockedBy: null,
      },
    });

    return visit;
  }

  /**
   * Cancel visit
   */
  async cancelVisit(id: string, reason?: string): Promise<Visit> {
    // Check if visit exists
    const existingVisit = await this.findOne(id);

    // Check if visit is completed
    if (existingVisit.status === VisitStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed visit');
    }

    // Update visit status
    const visit = await this.prisma.visit.update({
      where: { id },
      data: {
        status: VisitStatus.CANCELLED,
        notes: reason
          ? `${existingVisit.notes || ''}\n\nCancelled: ${reason}`.trim()
          : existingVisit.notes,
      },
    });

    return visit;
  }

  /**
   * Get visit statistics
   */
  async getStats(startDate?: string, endDate?: string) {
    const dateFilter = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) }),
    };

    const [total, completed, inProgress, cancelled] = await Promise.all([
      this.prisma.visit.count({
        where: { visitDate: dateFilter },
      }),
      this.prisma.visit.count({
        where: { visitDate: dateFilter, status: VisitStatus.COMPLETED },
      }),
      this.prisma.visit.count({
        where: { visitDate: dateFilter, status: VisitStatus.IN_PROGRESS },
      }),
      this.prisma.visit.count({
        where: { visitDate: dateFilter, status: VisitStatus.CANCELLED },
      }),
    ]);

    return {
      total,
      completed,
      inProgress,
      cancelled,
    };
  }

  /**
   * Get visits by patient ID
   */
  async getPatientVisits(patientId: string, limit = 10) {
    const visits = await this.prisma.visit.findMany({
      where: { patientId },
      orderBy: { visitDate: 'desc' },
      take: limit,
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        prescriptions: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    return visits;
  }
}
