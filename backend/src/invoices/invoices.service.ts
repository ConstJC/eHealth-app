import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  PaymentDto,
  ApplyDiscountDto,
  RefundDto,
  SearchInvoiceDto,
} from './dto';
import { Invoice, Prisma, InvoiceStatus } from '@prisma/client';

interface PaymentRecord {
  date: string;
  amount: number;
  method: string;
  receiptNo?: string;
  recordedBy: string;
  notes?: string;
}

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate unique invoice number
   */
  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.invoice.count({
      where: {
        invoiceNumber: { startsWith: `INV-${year}-` },
      },
    });

    return `INV-${year}-${String(count + 1).padStart(5, '0')}`;
  }

  /**
   * Calculate invoice totals
   */
  private calculateTotals(
    items: any[],
    discount: number = 0,
    discountPercentage: number = 0,
    taxRate: number = 0,
  ) {
    // Calculate subtotal from items
    const subtotal = items.reduce(
      (sum, item) => sum + (item.total || item.quantity * item.unitPrice),
      0,
    );

    // Apply discount (percentage takes precedence if both provided)
    let discountAmount = 0;
    if (discountPercentage > 0) {
      discountAmount = (subtotal * discountPercentage) / 100;
    } else {
      discountAmount = discount;
    }

    const afterDiscount = subtotal - discountAmount;

    // Calculate tax
    const tax = (afterDiscount * taxRate) / 100;

    // Calculate total
    const total = afterDiscount + tax;

    return {
      subtotal,
      discount: discountAmount,
      tax,
      total,
    };
  }

  /**
   * Create a new invoice
   */
  async create(dto: CreateInvoiceDto, userId: string): Promise<Invoice> {
    // Verify patient exists
    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // If visitId is provided, verify visit exists and check if invoice already exists
    if (dto.visitId) {
      const visit = await this.prisma.visit.findUnique({
        where: { id: dto.visitId },
      });

      if (!visit) {
        throw new NotFoundException('Visit not found');
      }

      // Check if invoice already exists for this visit
      const existingInvoice = await this.prisma.invoice.findUnique({
        where: { visitId: dto.visitId },
      });

      if (existingInvoice) {
        throw new ConflictException('Invoice already exists for this visit');
      }

      // Verify visit belongs to the patient
      if (visit.patientId !== dto.patientId) {
        throw new BadRequestException(
          'Visit does not belong to the specified patient',
        );
      }
    }

    // Calculate totals
    const { subtotal, discount, tax, total } = this.calculateTotals(
      dto.items,
      dto.discount || 0,
      dto.discountPercentage || 0,
      dto.taxRate || 0,
    );

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber();

    // Create invoice
    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        patientId: dto.patientId,
        visitId: dto.visitId,
        items: dto.items as any,
        subtotal,
        discount,
        discountReason: dto.discountReason,
        tax,
        taxRate: dto.taxRate || 0,
        total,
        balance: total, // Initially, balance equals total
        status: InvoiceStatus.UNPAID,
        payments: [],
        billedBy: userId,
        notes: dto.notes,
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

    return invoice;
  }

  /**
   * Get all invoices with filters and pagination
   */
  async findAll(query: SearchInvoiceDto) {
    const {
      search,
      status,
      patientId,
      visitId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = {
      ...(status && { status }),
      ...(patientId && { patientId }),
      ...(visitId && { visitId }),
      ...(startDate &&
        endDate && {
          billedAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      ...(search && {
        OR: [
          { invoiceNumber: { contains: search, mode: 'insensitive' } },
          {
            patient: {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { patientId: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        ],
      }),
    };

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
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
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data: invoices,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get invoice by ID
   */
  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
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

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  /**
   * Get invoices for a specific patient
   */
  async findByPatient(patientId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { patientId },
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

    return invoices;
  }

  /**
   * Get invoice for a specific visit
   */
  async findByVisit(visitId: string): Promise<Invoice | null> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { visitId },
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

    return invoice;
  }

  /**
   * Update invoice
   */
  async update(id: string, dto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findOne(id);

    // Cannot update paid invoices
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot update a paid invoice');
    }

    // Get current items or use existing
    const items = dto.items || (invoice.items as any[]);
    const discount = dto.discount ?? invoice.discount;
    const discountPercentage = dto.discountPercentage;
    const taxRate = dto.taxRate ?? invoice.taxRate;

    // Recalculate totals
    const { subtotal, discount: discountAmount, tax, total } =
      this.calculateTotals(items, discount, discountPercentage, taxRate);

    // Update balance based on new total and existing payments
    const existingPayments = (invoice.payments as PaymentRecord[]) || [];
    const totalPaid = existingPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );
    const newBalance = total - totalPaid;

    // Update status based on balance
    let status = invoice.status;
    if (newBalance <= 0) {
      status = InvoiceStatus.PAID;
    } else if (totalPaid > 0) {
      status = InvoiceStatus.PARTIAL;
    } else {
      status = InvoiceStatus.UNPAID;
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        ...(dto.items && { items: dto.items as any }),
        subtotal,
        discount: discountAmount,
        discountReason: dto.discountReason ?? invoice.discountReason,
        tax,
        taxRate,
        total,
        balance: newBalance,
        status,
        notes: dto.notes ?? invoice.notes,
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
   * Record payment
   */
  async addPayment(
    id: string,
    dto: PaymentDto,
    userId: string,
  ): Promise<Invoice> {
    const invoice = await this.findOne(id);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Invoice is already fully paid');
    }

    if (dto.amount > invoice.balance) {
      throw new BadRequestException(
        'Payment amount cannot exceed outstanding balance',
      );
    }

    // Get existing payments
    const existingPayments = (invoice.payments as PaymentRecord[]) || [];

    // Add new payment
    const newPayment: PaymentRecord = {
      date: new Date().toISOString(),
      amount: dto.amount,
      method: dto.method,
      receiptNo: dto.receiptNo,
      recordedBy: userId,
      notes: dto.notes,
    };

    const updatedPayments = [...existingPayments, newPayment];
    const totalPaid = invoice.amountPaid + dto.amount;
    const newBalance = invoice.total - totalPaid;

    // Update status
    let status: InvoiceStatus;
    if (newBalance <= 0) {
      status = InvoiceStatus.PAID;
    } else {
      status = InvoiceStatus.PARTIAL;
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        amountPaid: totalPaid,
        balance: newBalance,
        status,
        payments: updatedPayments as any,
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
   * Get payment history for an invoice
   */
  async getPayments(id: string): Promise<PaymentRecord[]> {
    const invoice = await this.findOne(id);
    return (invoice.payments as PaymentRecord[]) || [];
  }

  /**
   * Apply discount to invoice
   */
  async applyDiscount(
    id: string,
    dto: ApplyDiscountDto,
  ): Promise<Invoice> {
    const invoice = await this.findOne(id);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot apply discount to paid invoice');
    }

    const items = invoice.items as any[];
    const { subtotal, discount, tax, total } = this.calculateTotals(
      items,
      dto.discount || 0,
      dto.discountPercentage || 0,
      invoice.taxRate,
    );

    const existingPayments = (invoice.payments as PaymentRecord[]) || [];
    const totalPaid = existingPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );
    const newBalance = total - totalPaid;

    let status = invoice.status;
    if (newBalance <= 0) {
      status = InvoiceStatus.PAID;
    } else if (totalPaid > 0) {
      status = InvoiceStatus.PARTIAL;
    } else {
      status = InvoiceStatus.UNPAID;
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        discount,
        discountReason: dto.discountReason,
        subtotal,
        tax,
        total,
        balance: newBalance,
        status,
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
   * Process refund
   */
  async processRefund(
    id: string,
    dto: RefundDto,
    userId: string,
  ): Promise<Invoice> {
    const invoice = await this.findOne(id);

    if (dto.amount > invoice.amountPaid) {
      throw new BadRequestException(
        'Refund amount cannot exceed total paid amount',
      );
    }

    // Get existing payments
    const existingPayments = (invoice.payments as PaymentRecord[]) || [];

    // Add refund as negative payment
    const refundPayment: PaymentRecord = {
      date: new Date().toISOString(),
      amount: -dto.amount, // Negative amount for refund
      method: 'REFUND',
      receiptNo: `REF-${Date.now()}`,
      recordedBy: userId,
      notes: `Refund: ${dto.reason}. ${dto.notes || ''}`,
    };

    const updatedPayments = [...existingPayments, refundPayment];
    const totalPaid = invoice.amountPaid - dto.amount;
    const newBalance = invoice.total - totalPaid;

    // Update status
    let status: InvoiceStatus;
    if (newBalance <= 0) {
      status = InvoiceStatus.PAID;
    } else if (totalPaid > 0) {
      status = InvoiceStatus.PARTIAL;
    } else {
      status = InvoiceStatus.UNPAID;
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        amountPaid: totalPaid,
        balance: newBalance,
        status,
        payments: updatedPayments as any,
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
   * Get billing statistics
   */
  async getStats(startDate?: string, endDate?: string) {
    const where: Prisma.InvoiceWhereInput = {};

    if (startDate && endDate) {
      where.billedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const [
      totalInvoices,
      totalRevenue,
      unpaidInvoices,
      outstandingBalance,
      invoicesByStatus,
    ] = await Promise.all([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.aggregate({
        where,
        _sum: { total: true },
      }),
      this.prisma.invoice.count({
        where: { ...where, status: { not: InvoiceStatus.PAID } },
      }),
      this.prisma.invoice.aggregate({
        where: { ...where, status: { not: InvoiceStatus.PAID } },
        _sum: { balance: true },
      }),
      this.prisma.invoice.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
    ]);

    return {
      totalInvoices,
      totalRevenue: totalRevenue._sum.total || 0,
      unpaidInvoices,
      outstandingBalance: outstandingBalance._sum.balance || 0,
      invoicesByStatus: invoicesByStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
    };
  }

  /**
   * Delete invoice (soft delete - future enhancement)
   */
  async remove(id: string): Promise<void> {
    const invoice = await this.findOne(id);

    // For now, we'll just mark as cancelled
    // In future, we can implement soft delete
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot delete a paid invoice');
    }

    await this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.UNPAID,
        notes: `${invoice.notes || ''}\nInvoice cancelled/deleted`.trim(),
      },
    });
  }
}

