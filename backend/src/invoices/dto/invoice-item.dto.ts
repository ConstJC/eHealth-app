import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, IsNotEmpty } from 'class-validator';

export class InvoiceItemDto {
  @ApiProperty({
    description: 'Item description',
    example: 'Consultation Fee',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Quantity',
    example: 1,
  })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({
    description: 'Unit price',
    example: 500.0,
  })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({
    description: 'Total amount for this item (quantity * unitPrice)',
    example: 500.0,
  })
  @IsNumber()
  @Min(0)
  total: number;
}

