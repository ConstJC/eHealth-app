import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto, UpdatePatientDto, SearchPatientDto } from './dto';
import { Patient, Prisma, PatientStatus } from '@prisma/client';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new patient
   */
  async create(dto: CreatePatientDto): Promise<Patient> {
    // Check for duplicate patients by phone or email
    const existing = await this.prisma.patient.findFirst({
      where: {
        OR: [
          { phone: dto.phone },
          ...(dto.email ? [{ email: dto.email }] : []),
        ],
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictException(
        'A patient with this phone number or email already exists',
      );
    }

    // Generate unique patient ID
    const patientId = await this.generatePatientId();

    // Create patient
    const patient = await this.prisma.patient.create({
      data: {
        ...dto,
        patientId,
        dateOfBirth: new Date(dto.dateOfBirth),
        insurancePolicyExpiry: dto.insurancePolicyExpiry
          ? new Date(dto.insurancePolicyExpiry)
          : null,
        allergies: dto.allergies || [],
        chronicConditions: dto.chronicConditions || [],
        currentMedications: dto.currentMedications || [],
      },
    });

    return patient;
  }

  /**
   * Find all patients with search and pagination
   */
  async findAll(query: SearchPatientDto) {
    const { search, status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.PatientWhereInput = {
      deletedAt: null,
      ...(status && { status }),
      ...(search && {
        OR: [
          {
            patientId: {
              contains: search,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
          {
            firstName: {
              contains: search,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
          {
            lastName: {
              contains: search,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
          {
            phone: {
              contains: search,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
          ...(search.includes('@')
            ? [
                {
                  email: {
                    contains: search,
                    mode: 'insensitive' as Prisma.QueryMode,
                  },
                },
              ]
            : []),
        ],
      }),
    };

    // Execute query
    const [patients, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              visits: true,
              prescriptions: true,
            },
          },
        },
      }),
      this.prisma.patient.count({ where }),
    ]);

    return {
      data: patients,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find one patient by ID
   */
  async findOne(id: string): Promise<Patient> {
    const patient = await this.prisma.patient.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        visits: {
          orderBy: { visitDate: 'desc' },
          take: 10,
          include: {
            doctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        prescriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }

  /**
   * Find patient by patient ID (e.g., P2024-00001)
   */
  async findByPatientId(patientId: string): Promise<Patient> {
    const patient = await this.prisma.patient.findFirst({
      where: {
        patientId,
        deletedAt: null,
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }

  /**
   * Update patient information
   */
  async update(id: string, dto: UpdatePatientDto): Promise<Patient> {
    // Check if patient exists
    await this.findOne(id);

    // Check for duplicate phone/email if being updated
    if (dto.phone || dto.email) {
      const existing = await this.prisma.patient.findFirst({
        where: {
          OR: [
            ...(dto.phone ? [{ phone: dto.phone }] : []),
            ...(dto.email ? [{ email: dto.email }] : []),
          ],
          id: { not: id },
          deletedAt: null,
        },
      });

      if (existing) {
        throw new ConflictException(
          'Another patient with this phone number or email already exists',
        );
      }
    }

    // Update patient
    const patient = await this.prisma.patient.update({
      where: { id },
      data: {
        ...dto,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        insurancePolicyExpiry: dto.insurancePolicyExpiry
          ? new Date(dto.insurancePolicyExpiry)
          : undefined,
      },
    });

    return patient;
  }

  /**
   * Update patient status
   */
  async updateStatus(id: string, status: PatientStatus): Promise<Patient> {
    // Check if patient exists
    await this.findOne(id);

    const patient = await this.prisma.patient.update({
      where: { id },
      data: { status },
    });

    return patient;
  }

  /**
   * Soft delete patient
   */
  async remove(id: string): Promise<{ message: string }> {
    // Check if patient exists
    await this.findOne(id);

    // Check if patient has any visits
    const visitsCount = await this.prisma.visit.count({
      where: { patientId: id },
    });

    if (visitsCount > 0) {
      throw new BadRequestException(
        'Cannot delete patient with existing visits. Deactivate instead.',
      );
    }

    // Soft delete
    await this.prisma.patient.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: PatientStatus.INACTIVE,
      },
    });

    return { message: 'Patient deleted successfully' };
  }

  /**
   * Restore soft deleted patient
   */
  async restore(id: string): Promise<Patient> {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    if (!patient.deletedAt) {
      throw new BadRequestException('Patient is not deleted');
    }

    const restored = await this.prisma.patient.update({
      where: { id },
      data: {
        deletedAt: null,
        status: PatientStatus.ACTIVE,
      },
    });

    return restored;
  }

  /**
   * Get patient statistics
   */
  async getStats() {
    const [total, active, inactive, recentCount] = await Promise.all([
      this.prisma.patient.count({ where: { deletedAt: null } }),
      this.prisma.patient.count({
        where: { deletedAt: null, status: PatientStatus.ACTIVE },
      }),
      this.prisma.patient.count({
        where: { deletedAt: null, status: PatientStatus.INACTIVE },
      }),
      this.prisma.patient.count({
        where: {
          deletedAt: null,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    return {
      total,
      active,
      inactive,
      recentCount,
    };
  }

  /**
   * Generate unique patient ID
   */
  private async generatePatientId(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `P${year}`;

    // Get the count of patients created this year
    const count = await this.prisma.patient.count({
      where: {
        patientId: { startsWith: prefix },
      },
    });

    // Format: P2024-00001
    const sequence = String(count + 1).padStart(5, '0');
    return `${prefix}-${sequence}`;
  }
}
