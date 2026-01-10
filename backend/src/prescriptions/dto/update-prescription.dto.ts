import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class UpdatePrescriptionDto {
  @ApiPropertyOptional({
    description: 'Medication name',
    example: 'Paracetamol',
  })
  @IsOptional()
  @IsString()
  medicationName?: string;

  @ApiPropertyOptional({
    description: 'Generic name of the medication',
    example: 'Acetaminophen',
  })
  @IsOptional()
  @IsString()
  genericName?: string;

  @ApiPropertyOptional({
    description: 'Brand name of the medication',
    example: 'Tylenol',
  })
  @IsOptional()
  @IsString()
  brandName?: string;

  @ApiPropertyOptional({
    description: 'Dosage (e.g., "500mg", "10ml")',
    example: '500mg',
  })
  @IsOptional()
  @IsString()
  dosage?: string;

  @ApiPropertyOptional({
    description: 'Frequency (e.g., "twice daily", "once daily")',
    example: 'twice daily',
  })
  @IsOptional()
  @IsString()
  frequency?: string;

  @ApiPropertyOptional({
    description: 'Route of administration',
    example: 'ORAL',
  })
  @IsOptional()
  @IsString()
  route?: string;

  @ApiPropertyOptional({
    description: 'Duration of treatment',
    example: '7 days',
  })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({
    description: 'Quantity to dispense',
    example: '14 tablets',
  })
  @IsOptional()
  @IsString()
  quantity?: string;

  @ApiPropertyOptional({
    description: 'Number of refills allowed',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(12)
  refills?: number;

  @ApiPropertyOptional({
    description: 'Special instructions for the patient',
    example: 'Take with food',
  })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Patient has history of gastric issues',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

