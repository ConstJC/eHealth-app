import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportQueryDto } from './dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate visit summary report
   */
  async generateVisitSummary(visitId: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true,
            phone: true,
            email: true,
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
        prescriptions: true,
        invoice: true,
      },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    return {
      visit,
      summary: {
        visitDate: visit.visitDate,
        visitType: visit.visitType,
        status: visit.status,
        diagnosis: visit.primaryDiagnosis,
        prescriptionsCount: visit.prescriptions.length,
        totalAmount: visit.invoice?.total || 0,
      },
    };
  }

  /**
   * Generate patient history report
   */
  async generatePatientHistory(patientId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        visits: {
          orderBy: { visitDate: 'desc' },
          include: {
            doctor: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            prescriptions: true,
            invoice: true,
          },
        },
        prescriptions: {
          orderBy: { createdAt: 'desc' },
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return {
      patient,
      statistics: {
        totalVisits: patient.visits.length,
        totalPrescriptions: patient.prescriptions.length,
        totalInvoices: patient.invoices.length,
        totalAmount: patient.invoices.reduce(
          (sum, inv) => sum + inv.total,
          0,
        ),
        outstandingBalance: patient.invoices.reduce(
          (sum, inv) => sum + inv.balance,
          0,
        ),
      },
    };
  }

  /**
   * Generate prescription printout
   */
  async generatePrescriptionPrintout(prescriptionId: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        patient: {
          select: {
            patientId: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true,
            phone: true,
            allergies: true,
          },
        },
        visit: {
          include: {
            doctor: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    return prescription;
  }

  /**
   * Generate medical certificate
   */
  async generateMedicalCertificate(visitId: string, reason: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        patient: {
          select: {
            patientId: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true,
          },
        },
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    return {
      certificate: {
        patient: visit.patient,
        doctor: visit.doctor,
        visitDate: visit.visitDate,
        diagnosis: visit.primaryDiagnosis,
        reason,
        issuedDate: new Date(),
      },
    };
  }

  /**
   * Get patient census report
   */
  async getPatientCensus(query: ReportQueryDto) {
    const where: any = { deletedAt: null };

    if (query.startDate && query.endDate) {
      where.createdAt = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      };
    }

    const [total, active, inactive, byGender, byAgeGroup] = await Promise.all([
      this.prisma.patient.count({ where }),
      this.prisma.patient.count({
        where: { ...where, status: 'ACTIVE' },
      }),
      this.prisma.patient.count({
        where: { ...where, status: 'INACTIVE' },
      }),
      this.prisma.patient.groupBy({
        by: ['gender'],
        where,
        _count: true,
      }),
      this.prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) < 18 THEN '0-17'
            WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) < 30 THEN '18-29'
            WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) < 45 THEN '30-44'
            WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) < 60 THEN '45-59'
            ELSE '60+'
          END as age_group,
          COUNT(*) as count
        FROM patients
        WHERE deleted_at IS NULL
        GROUP BY age_group
      `,
    ]);

    return {
      total,
      active,
      inactive,
      byGender: byGender.map((item) => ({
        gender: item.gender,
        count: item._count,
      })),
      byAgeGroup,
    };
  }

  /**
   * Get revenue report
   */
  async getRevenueReport(query: ReportQueryDto) {
    const where: any = {};

    if (query.startDate && query.endDate) {
      where.billedAt = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      };
    }

    const [totalRevenue, paidInvoices, unpaidInvoices, byStatus] =
      await Promise.all([
        this.prisma.invoice.aggregate({
          where,
          _sum: { total: true },
        }),
        this.prisma.invoice.count({
          where: { ...where, status: 'PAID' },
        }),
        this.prisma.invoice.count({
          where: { ...where, status: { not: 'PAID' } },
        }),
        this.prisma.invoice.groupBy({
          by: ['status'],
          where,
          _count: true,
          _sum: {
            total: true,
            balance: true,
          },
        }),
      ]);

    return {
      totalRevenue: totalRevenue._sum.total || 0,
      paidInvoices,
      unpaidInvoices,
      byStatus: byStatus.map((item) => ({
        status: item.status,
        count: item._count,
        total: item._sum.total || 0,
        balance: item._sum.balance || 0,
      })),
    };
  }

  /**
   * Get most common diagnoses
   */
  async getDiagnosesReport(query: ReportQueryDto, limit: number = 10) {
    const where: any = {};

    if (query.startDate && query.endDate) {
      where.visitDate = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      };
    }

    const visits = await this.prisma.visit.findMany({
      where,
      select: {
        primaryDiagnosis: true,
        secondaryDiagnoses: true,
      },
    });

    const diagnosisCount: Record<string, number> = {};

    visits.forEach((visit) => {
      if (visit.primaryDiagnosis) {
        diagnosisCount[visit.primaryDiagnosis] =
          (diagnosisCount[visit.primaryDiagnosis] || 0) + 1;
      }
      visit.secondaryDiagnoses?.forEach((diagnosis) => {
        diagnosisCount[diagnosis] = (diagnosisCount[diagnosis] || 0) + 1;
      });
    });

    const sorted = Object.entries(diagnosisCount)
      .map(([diagnosis, count]) => ({ diagnosis, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return sorted;
  }

  /**
   * Get prescription patterns
   */
  async getPrescriptionPatterns(query: ReportQueryDto, limit: number = 10) {
    const where: any = {};

    if (query.startDate && query.endDate) {
      where.createdAt = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      };
    }

    const prescriptions = await this.prisma.prescription.findMany({
      where,
      select: {
        medicationName: true,
      },
    });

    const medicationCount: Record<string, number> = {};

    prescriptions.forEach((prescription) => {
      medicationCount[prescription.medicationName] =
        (medicationCount[prescription.medicationName] || 0) + 1;
    });

    const sorted = Object.entries(medicationCount)
      .map(([medication, count]) => ({ medication, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return sorted;
  }

  /**
   * Get doctor productivity report
   */
  async getDoctorProductivity(query: ReportQueryDto) {
    const where: any = {};

    if (query.startDate && query.endDate) {
      where.visitDate = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      };
    }

    const productivity = await this.prisma.visit.groupBy({
      by: ['doctorId'],
      where,
      _count: true,
    });

    const doctorIds = productivity.map((p) => p.doctorId);
    const doctors = await this.prisma.user.findMany({
      where: { id: { in: doctorIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    return productivity.map((item) => ({
      doctor: doctors.find((d) => d.id === item.doctorId),
      visitsCount: item._count,
    }));
  }

  /**
   * Get outstanding payments report
   */
  async getOutstandingPayments(query: ReportQueryDto) {
    const where: any = {
      status: { not: 'PAID' },
    };

    if (query.startDate && query.endDate) {
      where.billedAt = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      };
    }

    const invoices = await this.prisma.invoice.findMany({
      where,
      include: {
        patient: {
          select: {
            patientId: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
      orderBy: { balance: 'desc' },
    });

    const totalOutstanding = invoices.reduce(
      (sum, inv) => sum + inv.balance,
      0,
    );

    return {
      totalOutstanding,
      invoices,
      count: invoices.length,
    };
  }

  /**
   * Get daily revenue
   */
  async getDailyRevenue(date: string) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getRevenueReport({
      startDate: startOfDay.toISOString(),
      endDate: endOfDay.toISOString(),
    });
  }

  /**
   * Get weekly revenue
   */
  async getWeeklyRevenue(startDate: string) {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    return this.getRevenueReport({
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });
  }

  /**
   * Get monthly revenue
   */
  async getMonthlyRevenue(year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    return this.getRevenueReport({
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });
  }

  /**
   * Get yearly revenue
   */
  async getYearlyRevenue(year: number) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);

    return this.getRevenueReport({
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });
  }

  /**
   * Get revenue by payment method
   */
  async getRevenueByPaymentMethod(query: ReportQueryDto) {
    const where: any = {};

    if (query.startDate && query.endDate) {
      where.billedAt = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      };
    }

    const invoices = await this.prisma.invoice.findMany({
      where,
      select: {
        payments: true,
      },
    });

    const methodCount: Record<string, number> = {};

    invoices.forEach((invoice) => {
      const payments = invoice.payments as any[];
      payments?.forEach((payment) => {
        const method = payment.method || 'UNKNOWN';
        methodCount[method] = (methodCount[method] || 0) + payment.amount;
      });
    });

    return Object.entries(methodCount).map(([method, amount]) => ({
      method,
      amount,
    }));
  }

  /**
   * Get aging report (30/60/90 days)
   */
  async getAgingReport() {
    const now = new Date();
    const days30 = new Date(now);
    days30.setDate(days30.getDate() - 30);
    const days60 = new Date(now);
    days60.setDate(days60.getDate() - 60);
    const days90 = new Date(now);
    days90.setDate(days90.getDate() - 90);

    const [current, days30_60, days60_90, over90] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: {
          status: { not: 'PAID' },
          billedAt: { gte: days30 },
        },
        _sum: { balance: true },
        _count: true,
      }),
      this.prisma.invoice.aggregate({
        where: {
          status: { not: 'PAID' },
          billedAt: { gte: days60, lt: days30 },
        },
        _sum: { balance: true },
        _count: true,
      }),
      this.prisma.invoice.aggregate({
        where: {
          status: { not: 'PAID' },
          billedAt: { gte: days90, lt: days60 },
        },
        _sum: { balance: true },
        _count: true,
      }),
      this.prisma.invoice.aggregate({
        where: {
          status: { not: 'PAID' },
          billedAt: { lt: days90 },
        },
        _sum: { balance: true },
        _count: true,
      }),
    ]);

    return {
      '0-30 days': {
        amount: current._sum.balance || 0,
        count: current._count,
      },
      '31-60 days': {
        amount: days30_60._sum.balance || 0,
        count: days30_60._count,
      },
      '61-90 days': {
        amount: days60_90._sum.balance || 0,
        count: days60_90._count,
      },
      'Over 90 days': {
        amount: over90._sum.balance || 0,
        count: over90._count,
      },
    };
  }
}

