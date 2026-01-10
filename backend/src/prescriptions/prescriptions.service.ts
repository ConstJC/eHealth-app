import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePrescriptionDto,
  UpdatePrescriptionDto,
  DiscontinuePrescriptionDto,
  SearchPrescriptionDto,
} from './dto';
import { Prescription, Prisma, PrescriptionStatus } from '@prisma/client';

@Injectable()
export class PrescriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new prescription
   */
  async create(
    dto: CreatePrescriptionDto,
    doctorId: string,
  ): Promise<Prescription> {
    // Verify patient exists
    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // If visitId is provided, verify visit exists
    if (dto.visitId) {
      const visit = await this.prisma.visit.findUnique({
        where: { id: dto.visitId },
      });

      if (!visit) {
        throw new NotFoundException('Visit not found');
      }

      // Verify visit belongs to the patient
      if (visit.patientId !== dto.patientId) {
        throw new BadRequestException(
          'Visit does not belong to the specified patient',
        );
      }
    }

    // Check for allergies (basic check - can be enhanced with drug database)
    const allergyWarnings = this.checkAllergies(
      dto.medicationName,
      patient.allergies,
    );

    // Create prescription
    const prescription = await this.prisma.prescription.create({
      data: {
        ...dto,
        doctorId,
        refills: dto.refills || 0,
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
        visit: {
          select: {
            id: true,
            visitDate: true,
            visitType: true,
          },
        },
      },
    });

    // Return prescription with allergy warnings if any
    return {
      ...prescription,
      notes: allergyWarnings
        ? `${prescription.notes || ''}\n⚠️ Allergy Warning: ${allergyWarnings}`.trim()
        : prescription.notes,
    } as Prescription;
  }

  /**
   * Get all prescriptions with filters and pagination
   */
  async findAll(query: SearchPrescriptionDto) {
    const { search, status, patientId, visitId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PrescriptionWhereInput = {
      ...(status && { status }),
      ...(patientId && { patientId }),
      ...(visitId && { visitId }),
      ...(search && {
        OR: [
          { medicationName: { contains: search, mode: 'insensitive' } },
          { genericName: { contains: search, mode: 'insensitive' } },
          { brandName: { contains: search, mode: 'insensitive' } },
          {
            patient: {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        ],
      }),
    };

    const [prescriptions, total] = await Promise.all([
      this.prisma.prescription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: {
              id: true,
              patientId: true,
              firstName: true,
              lastName: true,
            },
          },
          visit: {
            select: {
              id: true,
              visitDate: true,
              visitType: true,
            },
          },
        },
      }),
      this.prisma.prescription.count({ where }),
    ]);

    return {
      data: prescriptions,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get prescription by ID
   */
  async findOne(id: string): Promise<Prescription> {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
            allergies: true,
          },
        },
        visit: {
          select: {
            id: true,
            visitDate: true,
            visitType: true,
            status: true,
          },
        },
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    return prescription as Prescription;
  }

  /**
   * Get prescriptions for a specific patient
   */
  async findByPatient(patientId: string, status?: PrescriptionStatus) {
    const where: Prisma.PrescriptionWhereInput = {
      patientId,
      ...(status && { status }),
    };

    const prescriptions = await this.prisma.prescription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        visit: {
          select: {
            id: true,
            visitDate: true,
            visitType: true,
          },
        },
      },
    });

    return prescriptions;
  }

  /**
   * Get prescriptions for a specific visit
   */
  async findByVisit(visitId: string) {
    const prescriptions = await this.prisma.prescription.findMany({
      where: { visitId },
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return prescriptions;
  }

  /**
   * Get active medications for a patient
   */
  async getActiveMedications(patientId: string) {
    return this.findByPatient(patientId, PrescriptionStatus.ACTIVE);
  }

  /**
   * Update prescription
   */
  async update(
    id: string,
    dto: UpdatePrescriptionDto,
  ): Promise<Prescription> {
    const prescription = await this.findOne(id);

    // Cannot update discontinued prescriptions
    if (prescription.status === PrescriptionStatus.DISCONTINUED) {
      throw new BadRequestException(
        'Cannot update a discontinued prescription',
      );
    }

    const updated = await this.prisma.prescription.update({
      where: { id },
      data: dto,
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
          },
        },
        visit: {
          select: {
            id: true,
            visitDate: true,
            visitType: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Discontinue prescription
   */
  async discontinue(
    id: string,
    dto: DiscontinuePrescriptionDto,
    userId: string,
  ): Promise<Prescription> {
    const prescription = await this.findOne(id);

    if (prescription.status === PrescriptionStatus.DISCONTINUED) {
      throw new ConflictException('Prescription is already discontinued');
    }

    const updated = await this.prisma.prescription.update({
      where: { id },
      data: {
        status: PrescriptionStatus.DISCONTINUED,
        discontinuedAt: new Date(),
        discontinuedBy: userId,
        discontinueReason: dto.reason,
        notes: dto.notes
          ? `${prescription.notes || ''}\nDiscontinued: ${dto.notes}`.trim()
          : prescription.notes,
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
        visit: {
          select: {
            id: true,
            visitDate: true,
            visitType: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete prescription (soft delete - future enhancement)
   * For now, we'll just discontinue it
   */
  async remove(id: string): Promise<void> {
    const prescription = await this.findOne(id);
    
    // For now, we'll discontinue instead of deleting
    // In future, we can implement soft delete
    await this.discontinue(
      id,
      { reason: 'Deleted by user' },
      prescription.doctorId,
    );
  }

  /**
   * Check patient allergies against medication
   * Basic implementation - can be enhanced with drug database
   */
  private checkAllergies(
    medicationName: string,
    allergies: string[],
  ): string | null {
    if (!allergies || allergies.length === 0) {
      return null;
    }

    const medicationLower = medicationName.toLowerCase();
    const allergyMatches = allergies.filter((allergy) => {
      const allergyLower = allergy.toLowerCase();
      return (
        medicationLower.includes(allergyLower) ||
        allergyLower.includes(medicationLower)
      );
    });

    if (allergyMatches.length > 0) {
      return `Patient has known allergies: ${allergyMatches.join(', ')}. Please verify compatibility.`;
    }

    return null;
  }
}

