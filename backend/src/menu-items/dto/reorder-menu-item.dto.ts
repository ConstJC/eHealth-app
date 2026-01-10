import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class ReorderMenuItemDto {
  @ApiProperty({
    description: 'New order value (lower = first)',
    example: 0,
  })
  @IsInt()
  @Min(0)
  order: number;
}
