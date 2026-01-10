import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MenuItemsService } from './menu-items.service';
import {
  CreateMenuItemDto,
  UpdateMenuItemDto,
  AssignRoleDto,
  ReorderMenuItemDto,
} from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Role } from '@prisma/client';
import type { MenuItemQuery } from './types';

@ApiTags('Menu Items')
@Controller('menu-items')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Get('my-menu')
  @ApiOperation({ summary: "Get menu items for current user's role" })
  @ApiResponse({
    status: 200,
    description: 'Menu items retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          label: { type: 'string' },
          href: { type: 'string' },
          icon: { type: 'string', nullable: true },
          order: { type: 'number' },
        },
      },
    },
  })
  async findMyMenu(@GetUser('role') userRole: Role) {
    return this.menuItemsService.findMyMenu(userRole);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all menu items (Admin only)' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive menu items',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: Role,
    description: 'Filter by role',
  })
  @ApiResponse({
    status: 200,
    description: 'Menu items retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async findAll(@Query() query: MenuItemQuery) {
    return this.menuItemsService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get single menu item by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Menu item ID' })
  @ApiResponse({
    status: 200,
    description: 'Menu item retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async findOne(@Param('id') id: string) {
    return this.menuItemsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create new menu item (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Menu item created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Menu item with this href already exists',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async create(@Body() createMenuItemDto: CreateMenuItemDto) {
    return this.menuItemsService.create(createMenuItemDto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update menu item (Admin only)' })
  @ApiParam({ name: 'id', description: 'Menu item ID' })
  @ApiResponse({
    status: 200,
    description: 'Menu item updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  @ApiResponse({
    status: 409,
    description: 'Menu item with this href already exists',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async update(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ) {
    return this.menuItemsService.update(id, updateMenuItemDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete menu item (Admin only - soft delete)' })
  @ApiParam({ name: 'id', description: 'Menu item ID' })
  @ApiResponse({
    status: 200,
    description: 'Menu item deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async remove(@Param('id') id: string) {
    return this.menuItemsService.remove(id);
  }

  @Post(':id/assign-role')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Assign menu item to a role (Admin only)' })
  @ApiParam({ name: 'id', description: 'Menu item ID' })
  @ApiResponse({
    status: 201,
    description: 'Menu item assigned to role successfully',
  })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  @ApiResponse({
    status: 409,
    description: 'Menu item already assigned to this role',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async assignRole(
    @Param('id') id: string,
    @Body() assignRoleDto: AssignRoleDto,
  ) {
    return this.menuItemsService.assignRole(id, assignRoleDto);
  }

  @Delete(':id/assign-role/:role')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove menu item from a role (Admin only)' })
  @ApiParam({ name: 'id', description: 'Menu item ID' })
  @ApiParam({ name: 'role', enum: Role, description: 'Role to remove' })
  @ApiResponse({
    status: 200,
    description: 'Menu item removed from role successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Menu item or role assignment not found',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async removeRole(@Param('id') id: string, @Param('role') role: Role) {
    return this.menuItemsService.removeRole(id, role);
  }

  @Patch(':id/reorder')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update menu item order (Admin only)' })
  @ApiParam({ name: 'id', description: 'Menu item ID' })
  @ApiResponse({
    status: 200,
    description: 'Menu item order updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async reorder(
    @Param('id') id: string,
    @Body() reorderDto: ReorderMenuItemDto,
  ) {
    return this.menuItemsService.reorder(id, reorderDto);
  }
}
