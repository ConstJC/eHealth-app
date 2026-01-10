import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class DiscontinuePrescriptionDto {
  @ApiProperty({
    description: 'Reason for discontinuing the prescription',
    example: 'Patient reported adverse reaction',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional notes about discontinuation',
    example: 'Patient experienced nausea and dizziness',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

