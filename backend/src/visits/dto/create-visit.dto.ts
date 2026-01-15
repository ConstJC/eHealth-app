import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  IsNumber,
  Min,
  Max,
  IsDateString,
  IsArray,
} from 'class-validator';
import { VisitType } from '@prisma/client';

export class CreateVisitDto {
  @ApiProperty({
    description: 'Patient ID',
    example: 'clx1234567890',
  })
  @IsString()
  patientId: string;

  @ApiProperty({
    description: 'Visit type - can be one of the enum values or a custom string',
    enum: VisitType,
    example: VisitType.ROUTINE,
  })
  @IsString()
  visitType: VisitType | string;

  @ApiPropertyOptional({
    description: 'Visit date and time',
    example: '2024-01-15T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  visitDate?: string;

  @ApiPropertyOptional({
    description: 'Chief complaint - main reason for visit',
    example: 'Persistent headache for 3 days',
  })
  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  // Vital Signs
  @ApiPropertyOptional({
    description: 'Systolic blood pressure (mmHg)',
    example: 120,
  })
  @IsOptional()
  @IsInt()
  @Min(60)
  @Max(250)
  bloodPressureSystolic?: number;

  @ApiPropertyOptional({
    description: 'Diastolic blood pressure (mmHg)',
    example: 80,
  })
  @IsOptional()
  @IsInt()
  @Min(40)
  @Max(150)
  bloodPressureDiastolic?: number;

  @ApiPropertyOptional({
    description: 'Heart rate (BPM)',
    example: 72,
  })
  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(200)
  heartRate?: number;

  @ApiPropertyOptional({
    description: 'Respiratory rate (breaths per minute)',
    example: 16,
  })
  @IsOptional()
  @IsInt()
  @Min(8)
  @Max(40)
  respiratoryRate?: number;

  @ApiPropertyOptional({
    description: 'Temperature (Celsius)',
    example: 36.8,
  })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(45)
  temperature?: number;

  @ApiPropertyOptional({
    description: 'Oxygen saturation (SpO2 %)',
    example: 98,
  })
  @IsOptional()
  @IsInt()
  @Min(70)
  @Max(100)
  oxygenSaturation?: number;

  @ApiPropertyOptional({
    description: 'Weight (kg)',
    example: 70.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
  weight?: number;

  @ApiPropertyOptional({
    description: 'Height (cm)',
    example: 175,
  })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(250)
  height?: number;

  @ApiPropertyOptional({
    description: 'Pain scale (0-10)',
    example: 3,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  painScale?: number;
}
