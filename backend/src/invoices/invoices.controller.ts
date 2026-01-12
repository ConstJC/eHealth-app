import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  PaymentDto,
  ApplyDiscountDto,
  RefundDto,
  SearchInvoiceDto,
} from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Invoices')
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({
    status: 201,
    description: 'Invoice created successfully',
  })
  @ApiResponse({ status: 404, description: 'Patient or visit not found' })
  @ApiResponse({ status: 409, description: 'Invoice already exists for visit' })
  async create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @GetUser('id') userId: string,
  ) {
    return this.invoicesService.create(createInvoiceDto, userId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get all invoices with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Invoices retrieved successfully',
  })
  async findAll(@Query() query: SearchInvoiceDto) {
    return this.invoicesService.findAll(query);
  }

  @Get('stats')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get billing statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.invoicesService.getStats(startDate, endDate);
  }

  @Get('patient/:patientId')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get invoices for a specific patient' })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  @ApiResponse({
    status: 200,
    description: 'Patient invoices retrieved successfully',
  })
  async getPatientInvoices(@Param('patientId') patientId: string) {
    return this.invoicesService.findByPatient(patientId);
  }

  @Get('visit/:visitId')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get invoice for a specific visit' })
  @ApiParam({ name: 'visitId', description: 'Visit ID' })
  @ApiResponse({
    status: 200,
    description: 'Visit invoice retrieved successfully',
  })
  async getVisitInvoice(@Param('visitId') visitId: string) {
    return this.invoicesService.findByVisit(visitId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get invoice details by ID' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({
    status: 200,
    description: 'Invoice retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Update invoice information' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({
    status: 200,
    description: 'Invoice updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 400, description: 'Cannot update paid invoice' })
  async update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.update(id, updateInvoiceDto);
  }

  @Patch(':id/discount')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apply discount to invoice' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({
    status: 200,
    description: 'Discount applied successfully',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 400, description: 'Cannot apply discount to paid invoice' })
  async applyDiscount(
    @Param('id') id: string,
    @Body() discountDto: ApplyDiscountDto,
  ) {
    return this.invoicesService.applyDiscount(id, discountDto);
  }

  @Post(':id/payments')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Record payment for invoice' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({
    status: 201,
    description: 'Payment recorded successfully',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 400, description: 'Invalid payment amount' })
  async addPayment(
    @Param('id') id: string,
    @Body() paymentDto: PaymentDto,
    @GetUser('id') userId: string,
  ) {
    return this.invoicesService.addPayment(id, paymentDto, userId);
  }

  @Get(':id/payments')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get payment history for invoice' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment history retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async getPayments(@Param('id') id: string): Promise<any[]> {
    return this.invoicesService.getPayments(id);
  }

  @Post(':id/refund')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Process refund for invoice' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({
    status: 201,
    description: 'Refund processed successfully',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 400, description: 'Invalid refund amount' })
  async processRefund(
    @Param('id') id: string,
    @Body() refundDto: RefundDto,
    @GetUser('id') userId: string,
  ) {
    return this.invoicesService.processRefund(id, refundDto, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete invoice' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({
    status: 204,
    description: 'Invoice deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete paid invoice' })
  async remove(@Param('id') id: string) {
    return this.invoicesService.remove(id);
  }
}

