import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsDateString,
  IsEnum,
  IsOptional,
  IsArray,
  IsPhoneNumber,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class CreatePatientDto {
  @ApiProperty({
    description: 'Patient first name',
    example: 'John',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiPropertyOptional({
    description: 'Patient middle name',
    example: 'Michael',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  middleName?: string;

  @ApiProperty({
    description: 'Patient last name',
    example: 'Doe',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({
    description: 'Patient date of birth',
    example: '1990-01-15',
  })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({
    description: 'Patient gender',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({
    description: 'Patient phone number',
    example: '+1234567890',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phone: string;

  @ApiPropertyOptional({
    description: 'Patient email address',
    example: 'john.doe@email.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Patient home address',
    example: '123 Main St, Springfield, IL 62701',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  // Emergency Contact
  @ApiPropertyOptional({
    description: 'Emergency contact name',
    example: 'Jane Doe',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  emergencyContactName?: string;

  @ApiPropertyOptional({
    description: 'Emergency contact phone',
    example: '+1234567891',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  emergencyContactPhone?: string;

  @ApiPropertyOptional({
    description: 'Emergency contact relation',
    example: 'Spouse',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  emergencyContactRelation?: string;

  // Medical Information
  @ApiPropertyOptional({
    description: 'Blood type',
    example: 'O+',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  bloodType?: string;

  @ApiPropertyOptional({
    description: 'List of known allergies',
    example: ['Penicillin', 'Peanuts'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @ApiPropertyOptional({
    description: 'List of chronic conditions',
    example: ['Hypertension', 'Diabetes'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  chronicConditions?: string[];

  @ApiPropertyOptional({
    description: 'Current medications before clinic visit',
    example: ['Metformin 500mg', 'Lisinopril 10mg'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  currentMedications?: string[];

  @ApiPropertyOptional({
    description: 'Family medical history',
    example: 'Father: Heart disease, Mother: Diabetes',
  })
  @IsOptional()
  @IsString()
  familyHistory?: string;

  // Insurance
  @ApiPropertyOptional({
    description: 'Insurance provider name',
    example: 'BlueCross BlueShield',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  insuranceProvider?: string;

  @ApiPropertyOptional({
    description: 'Insurance policy number',
    example: 'BC123456789',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  insuranceNumber?: string;

  @ApiPropertyOptional({
    description: 'Insurance policy expiry date',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  insurancePolicyExpiry?: string;

  // Notes
  @ApiPropertyOptional({
    description: 'General notes about the patient',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
