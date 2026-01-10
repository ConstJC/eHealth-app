import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  Matches,
  IsEnum,
} from 'class-validator';
import { Role } from '@prisma/client';

export class CreateMenuItemDto {
  @ApiProperty({
    description: 'Display name of the menu item',
    example: 'Dashboard',
  })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({
    description: 'Route path (must start with /)',
    example: '/dashboard',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\/.*/, {
    message: 'href must start with /',
  })
  href: string;

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
    default: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({
    description: 'Roles to assign this menu item to',
    example: ['ADMIN', 'DOCTOR'],
    enum: Role,
    isArray: true,
  })
  @IsArray()
  @IsEnum(Role, { each: true })
  @IsOptional()
  roles?: Role[];
}
