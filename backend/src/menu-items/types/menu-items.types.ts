import { Role } from '@prisma/client';

export interface MenuItemResponse {
  id: string;
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
  id: string;
  label: string;
  href: string;
  icon: string | null;
  order: number;
  parentId: string | null;
  children?: MyMenuResponse[];
}

export interface MenuItemQuery {
  includeInactive?: boolean;
  role?: Role;
}
