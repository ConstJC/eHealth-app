import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  Min,
  IsNotEmpty,
  IsEnum,
  IsOptional,
} from 'class-validator';

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  MOBILE = 'MOBILE',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  INSURANCE = 'INSURANCE',
}

export class PaymentDto {
  @ApiProperty({
    description: 'Payment amount',
    example: 500.0,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  method: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Receipt number',
    example: 'RCP-2024-00001',
  })
  @IsOptional()
  @IsString()
  receiptNo?: string;

  @ApiPropertyOptional({
    description: 'Payment notes',
    example: 'Partial payment',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

