import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
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
import { VisitsService } from './visits.service';
import { CreateVisitDto, UpdateVisitDto, SearchVisitDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Visits')
@Controller('visits')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @ApiOperation({ summary: 'Create a new visit' })
  @ApiResponse({
    status: 201,
    description: 'Visit created successfully',
  })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async create(
    @Body() createVisitDto: CreateVisitDto,
    @GetUser('id') userId: string,
  ) {
    return this.visitsService.create(createVisitDto, userId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get all visits with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Visits retrieved successfully',
  })
  async findAll(@Query() query: SearchVisitDto) {
    return this.visitsService.findAll(query);
  }

  @Get('stats')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Get visit statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.visitsService.getStats(startDate, endDate);
  }

  @Get('patient/:patientId')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get visits for a specific patient' })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  @ApiResponse({
    status: 200,
    description: 'Patient visits retrieved successfully',
  })
  async getPatientVisits(
    @Param('patientId') patientId: string,
    @Query('limit') limit?: number,
  ) {
    return this.visitsService.getPatientVisits(patientId, limit);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get visit details by ID' })
  @ApiParam({ name: 'id', description: 'Visit ID' })
  @ApiResponse({
    status: 200,
    description: 'Visit retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  async findOne(@Param('id') id: string) {
    return this.visitsService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @ApiOperation({ summary: 'Update visit information' })
  @ApiParam({ name: 'id', description: 'Visit ID' })
  @ApiResponse({
    status: 200,
    description: 'Visit updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  @ApiResponse({ status: 400, description: 'Visit is locked' })
  async update(
    @Param('id') id: string,
    @Body() updateVisitDto: UpdateVisitDto,
    @GetUser('id') userId: string,
  ) {
    return this.visitsService.update(id, updateVisitDto, userId);
  }

  @Patch(':id/complete')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete and lock visit' })
  @ApiParam({ name: 'id', description: 'Visit ID' })
  @ApiResponse({
    status: 200,
    description: 'Visit completed successfully',
  })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  @ApiResponse({ status: 400, description: 'Visit is already completed' })
  async completeVisit(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.visitsService.completeVisit(id, userId);
  }

  @Patch(':id/unlock')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlock visit for editing (Admin/Doctor only)' })
  @ApiParam({ name: 'id', description: 'Visit ID' })
  @ApiResponse({
    status: 200,
    description: 'Visit unlocked successfully',
  })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  async unlockVisit(@Param('id') id: string) {
    return this.visitsService.unlockVisit(id);
  }

  @Patch(':id/cancel')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel visit' })
  @ApiParam({ name: 'id', description: 'Visit ID' })
  @ApiResponse({
    status: 200,
    description: 'Visit cancelled successfully',
  })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  @ApiResponse({ status: 400, description: 'Cannot cancel completed visit' })
  async cancelVisit(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.visitsService.cancelVisit(id, reason);
  }
}
