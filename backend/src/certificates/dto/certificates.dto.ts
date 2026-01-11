import { IsEnum, IsString, IsNotEmpty, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { CertificateType } from '@prisma/client';

export class CreateCertificateDto {
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsString()
  @IsOptional()
  visitId?: string;

  @IsEnum(CertificateType)
  @IsNotEmpty()
  type: CertificateType;

  @IsString()
  @IsOptional()
  diagnosis?: string;

  @IsString()
  @IsNotEmpty()
  recommendation: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsDateString()
  @IsOptional()
  returnDate?: string;
}

export class UpdateCertificateDto {
  @IsEnum(CertificateType)
  @IsOptional()
  type?: CertificateType;

  @IsString()
  @IsOptional()
  diagnosis?: string;

  @IsString()
  @IsOptional()
  recommendation?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsDateString()
  @IsOptional()
  returnDate?: string;
}
