import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, Min, IsNotEmpty, IsOptional } from 'class-validator';

export class RefundDto {
  @ApiProperty({
    description: 'Refund amount',
    example: 100.0,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Reason for refund',
    example: 'Service not provided',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Refund processed via original payment method',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

