import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceItemDto } from './invoice-item.dto';

export class CreateInvoiceDto {
  @ApiProperty({
    description: 'Patient ID',
    example: 'clx1234567890',
  })
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @ApiPropertyOptional({
    description: 'Visit ID (if invoice is linked to a visit)',
    example: 'clx1234567891',
  })
  @IsOptional()
  @IsUUID()
  visitId?: string;

  @ApiProperty({
    description: 'Invoice items',
    type: [InvoiceItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  @IsNotEmpty()
  items: InvoiceItemDto[];

  @ApiPropertyOptional({
    description: 'Discount amount (fixed)',
    example: 50.0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({
    description: 'Discount percentage',
    example: 10,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiPropertyOptional({
    description: 'Reason for discount',
    example: 'Senior citizen discount',
  })
  @IsOptional()
  @IsString()
  discountReason?: string;

  @ApiPropertyOptional({
    description: 'Tax rate (percentage)',
    example: 12,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate?: number;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Payment due within 30 days',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

