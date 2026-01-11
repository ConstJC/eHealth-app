import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto, UpdateCertificateDto } from './dto/certificates.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Role } from '@prisma/client';
import { PdfService } from './pdf.service';

@ApiTags('Medical Certificates')
@Controller('certificates')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class CertificatesController {
  constructor(
    private readonly certificatesService: CertificatesService,
    private readonly pdfService: PdfService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Generate a new medical certificate' })
  @ApiResponse({ status: 201, description: 'Certificate created successfully' })
  async create(
    @Body() dto: CreateCertificateDto,
    @GetUser('id') userId: string,
  ) {
    return this.certificatesService.create(userId, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get all medical certificates' })
  async findAll() {
    return this.certificatesService.findAll();
  }

  @Get('patient/:patientId')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get certificates for a specific patient' })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  async findByPatient(@Param('patientId') patientId: string) {
    return this.certificatesService.findByPatient(patientId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get certificate details by ID' })
  @ApiParam({ name: 'id', description: 'Certificate ID' })
  async findOne(@Param('id') id: string) {
    return this.certificatesService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Update certificate information' })
  @ApiParam({ name: 'id', description: 'Certificate ID' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCertificateDto,
  ) {
    return this.certificatesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a certificate (Admin only)' })
  @ApiParam({ name: 'id', description: 'Certificate ID' })
  async remove(@Param('id') id: string) {
    return this.certificatesService.remove(id);
  }

  @Get(':id/download')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Download certificate as PDF' })
  @ApiParam({ name: 'id', description: 'Certificate ID' })
  async download(@Param('id') id: string, @Res() res: Response) {
    const certificate = await this.certificatesService.findOne(id);
    const buffer = await this.pdfService.generateCertificatePdf(certificate as any);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=certificate-${certificate.certificateNo}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
