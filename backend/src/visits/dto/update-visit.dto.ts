import { PartialType } from '@nestjs/swagger';
import { CreateVisitDto } from './create-visit.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsDateString } from 'class-validator';

export class UpdateVisitDto extends PartialType(CreateVisitDto) {
  // SOAP Notes
  @ApiPropertyOptional({
    description: 'Subjective - History of present illness, ROS',
  })
  @IsOptional()
  @IsString()
  subjective?: string;

  @ApiPropertyOptional({
    description: 'Objective - Physical examination findings',
  })
  @IsOptional()
  @IsString()
  objective?: string;

  @ApiPropertyOptional({
    description: 'Assessment - Diagnosis and clinical impression',
  })
  @IsOptional()
  @IsString()
  assessment?: string;

  @ApiPropertyOptional({
    description: 'Plan - Treatment plan and follow-up',
  })
  @IsOptional()
  @IsString()
  plan?: string;

  // Diagnosis
  @ApiPropertyOptional({
    description: 'Primary diagnosis',
    example: 'Essential Hypertension',
  })
  @IsOptional()
  @IsString()
  primaryDiagnosis?: string;

  @ApiPropertyOptional({
    description: 'Secondary diagnoses',
    example: ['Type 2 Diabetes', 'Hyperlipidemia'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secondaryDiagnoses?: string[];

  @ApiPropertyOptional({
    description: 'ICD-10 codes',
    example: ['I10', 'E11.9'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  icdCodes?: string[];

  // Follow-up
  @ApiPropertyOptional({
    description: 'Follow-up date',
    example: '2024-02-15T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @ApiPropertyOptional({
    description: 'Follow-up reason',
    example: 'Recheck blood pressure',
  })
  @IsOptional()
  @IsString()
  followUpReason?: string;

  // Additional notes
  @ApiPropertyOptional({
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
