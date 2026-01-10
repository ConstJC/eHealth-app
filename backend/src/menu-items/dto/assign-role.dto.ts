import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class AssignRoleDto {
  @ApiProperty({
    description: 'Role to assign the menu item to',
    example: 'DOCTOR',
    enum: Role,
  })
  @IsEnum(Role)
  role: Role;
}
