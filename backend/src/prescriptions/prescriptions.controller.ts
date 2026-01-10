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
import { PrescriptionsService } from './prescriptions.service';
import {
  CreatePrescriptionDto,
  UpdatePrescriptionDto,
  DiscontinuePrescriptionDto,
  SearchPrescriptionDto,
} from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Role, PrescriptionStatus } from '@prisma/client';

@ApiTags('Prescriptions')
@Controller('prescriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class PrescriptionsController {
  constructor(
    private readonly prescriptionsService: PrescriptionsService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Create a new prescription' })
  @ApiResponse({
    status: 201,
    description: 'Prescription created successfully',
  })
  @ApiResponse({ status: 404, description: 'Patient or visit not found' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async create(
    @Body() createPrescriptionDto: CreatePrescriptionDto,
    @GetUser('id') userId: string,
  ) {
    return this.prescriptionsService.create(createPrescriptionDto, userId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get all prescriptions with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Prescriptions retrieved successfully',
  })
  async findAll(@Query() query: SearchPrescriptionDto) {
    return this.prescriptionsService.findAll(query);
  }

  @Get('patient/:patientId')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get prescriptions for a specific patient' })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  @ApiResponse({
    status: 200,
    description: 'Patient prescriptions retrieved successfully',
  })
  async getPatientPrescriptions(
    @Param('patientId') patientId: string,
    @Query('status') status?: PrescriptionStatus,
  ) {
    return this.prescriptionsService.findByPatient(patientId, status);
  }

  @Get('patient/:patientId/active')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get active medications for a patient' })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  @ApiResponse({
    status: 200,
    description: 'Active medications retrieved successfully',
  })
  async getActiveMedications(@Param('patientId') patientId: string) {
    return this.prescriptionsService.getActiveMedications(patientId);
  }

  @Get('visit/:visitId')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get prescriptions for a specific visit' })
  @ApiParam({ name: 'visitId', description: 'Visit ID' })
  @ApiResponse({
    status: 200,
    description: 'Visit prescriptions retrieved successfully',
  })
  async getVisitPrescriptions(@Param('visitId') visitId: string) {
    return this.prescriptionsService.findByVisit(visitId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get prescription details by ID' })
  @ApiParam({ name: 'id', description: 'Prescription ID' })
  @ApiResponse({
    status: 200,
    description: 'Prescription retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  async findOne(@Param('id') id: string) {
    return this.prescriptionsService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Update prescription information' })
  @ApiParam({ name: 'id', description: 'Prescription ID' })
  @ApiResponse({
    status: 200,
    description: 'Prescription updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot update discontinued prescription',
  })
  async update(
    @Param('id') id: string,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto,
  ) {
    return this.prescriptionsService.update(id, updatePrescriptionDto);
  }

  @Patch(':id/discontinue')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Discontinue prescription' })
  @ApiParam({ name: 'id', description: 'Prescription ID' })
  @ApiResponse({
    status: 200,
    description: 'Prescription discontinued successfully',
  })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  @ApiResponse({
    status: 409,
    description: 'Prescription is already discontinued',
  })
  async discontinue(
    @Param('id') id: string,
    @Body() discontinueDto: DiscontinuePrescriptionDto,
    @GetUser('id') userId: string,
  ) {
    return this.prescriptionsService.discontinue(id, discontinueDto, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete prescription' })
  @ApiParam({ name: 'id', description: 'Prescription ID' })
  @ApiResponse({
    status: 204,
    description: 'Prescription deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  async remove(@Param('id') id: string) {
    return this.prescriptionsService.remove(id);
  }
}

