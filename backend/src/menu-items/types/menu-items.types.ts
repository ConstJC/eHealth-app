import { Role } from '@prisma/client';

export interface MenuItemResponse {
  id: number;
  label: string;
  href: string;
  icon: string | null;
  order: number;
  isActive: boolean;
  roles: Role[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MyMenuResponse {
  id: number;
  label: string;
  href: string;
  icon: string | null;
  order: number;
  parentId: number | null;
  children?: MyMenuResponse[];
}

export interface MenuItemQuery {
  includeInactive?: boolean;
  role?: Role;
}
