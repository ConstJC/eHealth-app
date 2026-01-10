import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // Clinical Reports
  @Get('clinical/visit-summary/:visitId')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @ApiOperation({ summary: 'Generate visit summary report' })
  @ApiParam({ name: 'visitId', description: 'Visit ID' })
  @ApiResponse({
    status: 200,
    description: 'Visit summary generated successfully',
  })
  async getVisitSummary(@Param('visitId') visitId: string) {
    return this.reportsService.generateVisitSummary(visitId);
  }

  @Get('clinical/patient-history/:patientId')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @ApiOperation({ summary: 'Generate patient history report' })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  @ApiResponse({
    status: 200,
    description: 'Patient history generated successfully',
  })
  async getPatientHistory(@Param('patientId') patientId: string) {
    return this.reportsService.generatePatientHistory(patientId);
  }

  @Get('clinical/prescription/:prescriptionId')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @ApiOperation({ summary: 'Generate prescription printout' })
  @ApiParam({ name: 'prescriptionId', description: 'Prescription ID' })
  @ApiResponse({
    status: 200,
    description: 'Prescription printout generated successfully',
  })
  async getPrescriptionPrintout(
    @Param('prescriptionId') prescriptionId: string,
  ) {
    return this.reportsService.generatePrescriptionPrintout(prescriptionId);
  }

  @Post('clinical/medical-certificate')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Generate medical certificate' })
  @ApiResponse({
    status: 201,
    description: 'Medical certificate generated successfully',
  })
  async generateMedicalCertificate(
    @Body('visitId') visitId: string,
    @Body('reason') reason: string,
  ) {
    return this.reportsService.generateMedicalCertificate(visitId, reason);
  }

  // Administrative Reports
  @Get('administrative/patient-census')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Get patient census report' })
  @ApiResponse({
    status: 200,
    description: 'Patient census retrieved successfully',
  })
  async getPatientCensus(@Query() query: ReportQueryDto) {
    return this.reportsService.getPatientCensus(query);
  }

  @Get('administrative/revenue')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get revenue report' })
  @ApiResponse({
    status: 200,
    description: 'Revenue report retrieved successfully',
  })
  async getRevenueReport(@Query() query: ReportQueryDto) {
    return this.reportsService.getRevenueReport(query);
  }

  @Get('administrative/diagnoses')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Get most common diagnoses' })
  @ApiResponse({
    status: 200,
    description: 'Diagnoses report retrieved successfully',
  })
  async getDiagnosesReport(
    @Query() query: ReportQueryDto,
    @Query('limit') limit?: number,
  ) {
    return this.reportsService.getDiagnosesReport(query, limit);
  }

  @Get('administrative/prescriptions')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Get prescription patterns' })
  @ApiResponse({
    status: 200,
    description: 'Prescription patterns retrieved successfully',
  })
  async getPrescriptionPatterns(
    @Query() query: ReportQueryDto,
    @Query('limit') limit?: number,
  ) {
    return this.reportsService.getPrescriptionPatterns(query, limit);
  }

  @Get('administrative/doctor-productivity')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Get doctor productivity report' })
  @ApiResponse({
    status: 200,
    description: 'Doctor productivity retrieved successfully',
  })
  async getDoctorProductivity(@Query() query: ReportQueryDto) {
    return this.reportsService.getDoctorProductivity(query);
  }

  @Get('administrative/outstanding-payments')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get outstanding payments report' })
  @ApiResponse({
    status: 200,
    description: 'Outstanding payments retrieved successfully',
  })
  async getOutstandingPayments(@Query() query: ReportQueryDto) {
    return this.reportsService.getOutstandingPayments(query);
  }

  // Financial Reports
  @Get('financial/daily')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get daily revenue' })
  @ApiResponse({
    status: 200,
    description: 'Daily revenue retrieved successfully',
  })
  async getDailyRevenue(@Query('date') date: string) {
    return this.reportsService.getDailyRevenue(date);
  }

  @Get('financial/weekly')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get weekly revenue' })
  @ApiResponse({
    status: 200,
    description: 'Weekly revenue retrieved successfully',
  })
  async getWeeklyRevenue(@Query('startDate') startDate: string) {
    return this.reportsService.getWeeklyRevenue(startDate);
  }

  @Get('financial/monthly')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get monthly revenue' })
  @ApiResponse({
    status: 200,
    description: 'Monthly revenue retrieved successfully',
  })
  async getMonthlyRevenue(
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return this.reportsService.getMonthlyRevenue(year, month);
  }

  @Get('financial/yearly')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get yearly revenue' })
  @ApiResponse({
    status: 200,
    description: 'Yearly revenue retrieved successfully',
  })
  async getYearlyRevenue(@Query('year') year: number) {
    return this.reportsService.getYearlyRevenue(year);
  }

  @Get('financial/payment-methods')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get revenue by payment method' })
  @ApiResponse({
    status: 200,
    description: 'Revenue by payment method retrieved successfully',
  })
  async getRevenueByPaymentMethod(@Query() query: ReportQueryDto) {
    return this.reportsService.getRevenueByPaymentMethod(query);
  }

  @Get('financial/aging')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get aging report (30/60/90 days)' })
  @ApiResponse({
    status: 200,
    description: 'Aging report retrieved successfully',
  })
  async getAgingReport() {
    return this.reportsService.getAgingReport();
  }
}

