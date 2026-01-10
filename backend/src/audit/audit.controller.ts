import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { SearchAuditDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, AuditAction } from '@prisma/client';

@ApiTags('Audit Logs')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Get audit logs with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
  })
  async findAll(@Query() query: SearchAuditDto) {
    return this.auditService.findAll(query);
  }

  @Get('user/:userId')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Get audit logs for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User audit logs retrieved successfully',
  })
  async getUserLogs(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.findByUser(userId, limit);
  }

  @Get('patient/:patientId')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Get audit logs for a specific patient' })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  @ApiResponse({
    status: 200,
    description: 'Patient audit logs retrieved successfully',
  })
  async getPatientLogs(@Param('patientId') patientId: string) {
    return this.auditService.findByPatient(patientId);
  }

  @Get('visit/:visitId')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Get audit logs for a specific visit' })
  @ApiParam({ name: 'visitId', description: 'Visit ID' })
  @ApiResponse({
    status: 200,
    description: 'Visit audit logs retrieved successfully',
  })
  async getVisitLogs(@Param('visitId') visitId: string) {
    return this.auditService.findByVisit(visitId);
  }

  @Get('action/:action')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Get audit logs by action type' })
  @ApiParam({ name: 'action', description: 'Action type', enum: AuditAction })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
  })
  async getActionLogs(
    @Param('action') action: AuditAction,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.findByAction(action, limit);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Get audit log details by ID' })
  @ApiParam({ name: 'id', description: 'Audit log ID' })
  @ApiResponse({
    status: 200,
    description: 'Audit log retrieved successfully',
  })
  async findOne(@Param('id') id: string) {
    return this.auditService.findOne(id);
  }

  @Post('export')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Export audit logs' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs exported successfully',
  })
  async export(@Body() query: SearchAuditDto) {
    return this.auditService.export(query);
  }
}

