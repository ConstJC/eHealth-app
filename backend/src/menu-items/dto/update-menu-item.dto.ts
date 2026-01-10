import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Matches,
  IsBoolean,
} from 'class-validator';

export class UpdateMenuItemDto {
  @ApiPropertyOptional({
    description: 'Display name of the menu item',
    example: 'Dashboard',
  })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiPropertyOptional({
    description: 'Route path (must start with /)',
    example: '/dashboard',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\/.*/, {
    message: 'href must start with /',
  })
  href?: string;

  @ApiPropertyOptional({
    description: 'Icon identifier (Lucide icon name)',
    example: 'LayoutDashboard',
  })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Display order (lower = first)',
    example: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({
    description: 'Whether the menu item is active',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
