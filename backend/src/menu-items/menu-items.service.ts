import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateMenuItemDto,
  UpdateMenuItemDto,
  AssignRoleDto,
  ReorderMenuItemDto,
} from './dto';
import { Role } from '@prisma/client';
import { MenuItemResponse, MyMenuResponse, MenuItemQuery } from './types';

@Injectable()
export class MenuItemsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all menu items (Admin only)
   */
  async findAll(query?: MenuItemQuery): Promise<MenuItemResponse[]> {
    const where: any = {
      deletedAt: null,
    };

    if (!query?.includeInactive) {
      where.isActive = true;
    }

    if (query?.role) {
      where.roleMenus = {
        some: {
          role: query.role,
        },
      };
    }

    const menuItems = await this.prisma.menuItem.findMany({
      where,
      include: {
        roleMenus: {
          select: {
            role: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    return menuItems.map((item) => ({
      id: item.id,
      label: item.label,
      href: item.href,
      icon: item.icon,
      order: item.order,
      isActive: item.isActive,
      roles: item.roleMenus.map((rm) => rm.role),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }

  /**
   * Get menu items for current user's role
   */
  async findMyMenu(userRole: Role): Promise<MyMenuResponse[]> {
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        roleMenus: {
          some: {
            role: userRole,
            isVisible: true,
          },
        },
      },
      include: {
        roleMenus: {
          where: {
            role: userRole,
          },
          select: {
            order: true,
            label: true,
          },
        },
        children: {
          where: {
            deletedAt: null,
            isActive: true,
            roleMenus: {
              some: {
                role: userRole,
                isVisible: true,
              },
            },
          },
          include: {
            roleMenus: {
              where: {
                role: userRole,
              },
              select: {
                order: true,
                label: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    return menuItems
      .map((item) => {
        const roleMenu = item.roleMenus[0];
        const children = item.children
          .map((child) => {
            const childRoleMenu = child.roleMenus[0];
            return {
              id: child.id,
              label: childRoleMenu?.label || child.label,
              href: child.href,
              icon: child.icon,
              order: childRoleMenu?.order ?? child.order,
              parentId: child.parentId,
            };
          })
          .sort((a, b) => a.order - b.order);

        return {
          id: item.id,
          label: roleMenu?.label || item.label,
          href: item.href,
          icon: item.icon,
          order: roleMenu?.order ?? item.order,
          parentId: item.parentId,
          ...(children.length > 0 && { children }),
        };
      })
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Get single menu item by ID
   */
  async findOne(id: string): Promise<MenuItemResponse> {
    const menuItem = await this.prisma.menuItem.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        roleMenus: {
          select: {
            role: true,
          },
        },
      },
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    return {
      id: menuItem.id,
      label: menuItem.label,
      href: menuItem.href,
      icon: menuItem.icon,
      order: menuItem.order,
      isActive: menuItem.isActive,
      roles: menuItem.roleMenus.map((rm) => rm.role),
      createdAt: menuItem.createdAt,
      updatedAt: menuItem.updatedAt,
    };
  }

  /**
   * Create new menu item
   */
  async create(createDto: CreateMenuItemDto): Promise<MenuItemResponse> {
    // Validate href doesn't already exist (for active items)
    const existing = await this.prisma.menuItem.findFirst({
      where: {
        href: createDto.href,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictException('A menu item with this href already exists');
    }

    // Create menu item
    const menuItem = await this.prisma.menuItem.create({
      data: {
        label: createDto.label,
        href: createDto.href,
        icon: createDto.icon,
        order: createDto.order ?? 0,
      },
      include: {
        roleMenus: {
          select: {
            role: true,
          },
        },
      },
    });

    // Assign to roles if provided
    if (createDto.roles && createDto.roles.length > 0) {
      await Promise.all(
        createDto.roles.map((role) =>
          this.prisma.roleMenu.create({
            data: {
              role,
              menuItemId: menuItem.id,
            },
          }),
        ),
      );

      // Refetch with role assignments
      return this.findOne(menuItem.id);
    }

    return {
      id: menuItem.id,
      label: menuItem.label,
      href: menuItem.href,
      icon: menuItem.icon,
      order: menuItem.order,
      isActive: menuItem.isActive,
      roles: [],
      createdAt: menuItem.createdAt,
      updatedAt: menuItem.updatedAt,
    };
  }

  /**
   * Update menu item
   */
  async update(
    id: string,
    updateDto: UpdateMenuItemDto,
  ): Promise<MenuItemResponse> {
    // Check if menu item exists
    const existing = await this.prisma.menuItem.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException('Menu item not found');
    }

    // Check for href conflict if href is being updated
    if (updateDto.href && updateDto.href !== existing.href) {
      const conflict = await this.prisma.menuItem.findFirst({
        where: {
          href: updateDto.href,
          deletedAt: null,
          id: {
            not: id,
          },
        },
      });

      if (conflict) {
        throw new ConflictException(
          'A menu item with this href already exists',
        );
      }
    }

    // Update menu item
    await this.prisma.menuItem.update({
      where: { id },
      data: {
        ...(updateDto.label && { label: updateDto.label }),
        ...(updateDto.href && { href: updateDto.href }),
        ...(updateDto.icon !== undefined && { icon: updateDto.icon }),
        ...(updateDto.order !== undefined && { order: updateDto.order }),
        ...(updateDto.isActive !== undefined && {
          isActive: updateDto.isActive,
        }),
      },
    });

    return this.findOne(id);
  }

  /**
   * Soft delete menu item
   */
  async remove(id: string): Promise<{ message: string }> {
    const menuItem = await this.prisma.menuItem.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    await this.prisma.menuItem.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: 'Menu item deleted successfully' };
  }

  /**
   * Assign menu item to a role
   */
  async assignRole(
    menuItemId: string,
    assignRoleDto: AssignRoleDto,
  ): Promise<{ message: string; roleMenu: any }> {
    // Check if menu item exists
    const menuItem = await this.prisma.menuItem.findFirst({
      where: {
        id: menuItemId,
        deletedAt: null,
      },
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    // Check if assignment already exists
    const existing = await this.prisma.roleMenu.findUnique({
      where: {
        role_menuItemId: {
          role: assignRoleDto.role,
          menuItemId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Menu item is already assigned to this role');
    }

    // Create role assignment
    const roleMenu = await this.prisma.roleMenu.create({
      data: {
        role: assignRoleDto.role,
        menuItemId,
      },
    });

    return {
      message: 'Menu item assigned to role successfully',
      roleMenu,
    };
  }

  /**
   * Remove menu item from a role
   */
  async removeRole(
    menuItemId: string,
    role: Role,
  ): Promise<{ message: string }> {
    // Check if menu item exists
    const menuItem = await this.prisma.menuItem.findFirst({
      where: {
        id: menuItemId,
        deletedAt: null,
      },
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    // Check if assignment exists
    const roleMenu = await this.prisma.roleMenu.findUnique({
      where: {
        role_menuItemId: {
          role,
          menuItemId,
        },
      },
    });

    if (!roleMenu) {
      throw new NotFoundException('Menu item is not assigned to this role');
    }

    // Delete role assignment
    await this.prisma.roleMenu.delete({
      where: {
        id: roleMenu.id,
      },
    });

    return { message: 'Menu item removed from role successfully' };
  }

  /**
   * Update menu item order
   */
  async reorder(
    id: string,
    reorderDto: ReorderMenuItemDto,
  ): Promise<MenuItemResponse> {
    const menuItem = await this.prisma.menuItem.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    await this.prisma.menuItem.update({
      where: { id },
      data: {
        order: reorderDto.order,
      },
    });

    return this.findOne(id);
  }
}
