/**
 * Settings Module Type Definitions
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  RECEPTIONIST = 'RECEPTIONIST',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date | null;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface UpdateUserRoleInput {
  role: UserRole;
}

export interface UserSearchParams {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedUsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AuditLog {
  id: string;
  userId: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string | Date;
}

export interface AuditLogSearchParams {
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedAuditLogsResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SystemConfig {
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  clinicEmail?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
  currency?: string;
  backupEnabled?: boolean;
  backupFrequency?: string;
  sessionTimeout?: number;
}

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon?: string | null;
  order: number;
  isActive: boolean;
  roles: UserRole[];
  createdAt: string | Date;
  updatedAt: string | Date;
  parentId?: string | null;
  children?: MenuItem[];
}

export interface CreateMenuItemInput {
  label: string;
  href: string;
  icon?: string;
  order?: number;
  roles?: UserRole[];
}

export interface UpdateMenuItemInput {
  label?: string;
  href?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
}

export interface AssignRoleInput {
  role: UserRole;
}

export interface ReorderMenuItemInput {
  order: number;
}

