import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';

export class CreatePrescriptionDto {
  @ApiProperty({
    description: 'Patient ID',
    example: 'clx1234567890',
  })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiPropertyOptional({
    description: 'Visit ID (if prescription is linked to a visit)',
    example: 'clx1234567891',
  })
  @IsOptional()
  @IsString()
  visitId?: string;

  @ApiProperty({
    description: 'Medication name',
    example: 'Paracetamol',
  })
  @IsString()
  @IsNotEmpty()
  medicationName: string;

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

  @ApiProperty({
    description: 'Dosage (e.g., "500mg", "10ml")',
    example: '500mg',
  })
  @IsString()
  @IsNotEmpty()
  dosage: string;

  @ApiProperty({
    description: 'Frequency (e.g., "twice daily", "once daily", "every 8 hours")',
    example: 'twice daily',
  })
  @IsString()
  @IsNotEmpty()
  frequency: string;

  @ApiProperty({
    description: 'Route of administration',
    example: 'ORAL',
    enum: ['ORAL', 'TOPICAL', 'INJECTION', 'INHALATION', 'NASAL', 'OPHTHALMIC', 'OTIC', 'RECTAL', 'SUBLINGUAL', 'TRANSDERMAL'],
  })
  @IsString()
  @IsNotEmpty()
  route: string;

  @ApiProperty({
    description: 'Duration of treatment (e.g., "7 days", "2 weeks", "1 month")',
    example: '7 days',
  })
  @IsString()
  @IsNotEmpty()
  duration: string;

  @ApiProperty({
    description: 'Quantity to dispense (e.g., "14 tablets", "1 bottle")',
    example: '14 tablets',
  })
  @IsString()
  @IsNotEmpty()
  quantity: string;

  @ApiPropertyOptional({
    description: 'Number of refills allowed',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(12)
  refills?: number;

  @ApiPropertyOptional({
    description: 'Special instructions for the patient',
    example: 'Take with food. Avoid alcohol.',
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

