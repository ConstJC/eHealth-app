import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, Min, Max, IsOptional, IsString } from 'class-validator';

export class ApplyDiscountDto {
  @ApiPropertyOptional({
    description: 'Discount amount (fixed)',
    example: 50.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({
    description: 'Discount percentage',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiProperty({
    description: 'Reason for discount',
    example: 'Senior citizen discount',
  })
  @IsString()
  discountReason: string;
}

