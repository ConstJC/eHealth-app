import { useState, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { tokenStorage } from '@/lib/auth';
import type {
  User,
  UpdateProfileInput,
  ChangePasswordInput,
  CreateUserInput,
  UpdateUserInput,
  UpdateUserRoleInput,
  UserSearchParams,
  PaginatedUsersResponse,
  AuditLogSearchParams,
  PaginatedAuditLogsResponse,
  SystemConfig,
  MenuItem,
  CreateMenuItemInput,
  UpdateMenuItemInput,
  AssignRoleInput,
  ReorderMenuItemInput,
} from '../settings-types';

export function useSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile Management
  const getProfile = useCallback(async (): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const accessToken = tokenStorage.getAccessToken();
      const response = await fetch('/api/settings/profile', {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch profile');
      }

      return await response.json();
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to fetch profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileInput): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch<User>('/users/me', data);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (data: ChangePasswordInput): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/settings/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenStorage.getAccessToken()}`,
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to change password';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // User Management (Admin only)
  const getUsers = useCallback(async (params?: UserSearchParams): Promise<PaginatedUsersResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.role) queryParams.append('role', params.role);
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const accessToken = tokenStorage.getAccessToken();
      const response = await fetch(`/api/settings/users?${queryParams.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch users');
      }

      return await response.json();
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to fetch users';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUser = useCallback(async (id: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const accessToken = tokenStorage.getAccessToken();
      const response = await fetch(`/api/settings/users/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch user');
      }

      return await response.json();
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to fetch user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createUser = useCallback(async (data: CreateUserInput): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<User>('/users', data);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to create user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id: string, data: UpdateUserInput): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch<User>(`/users/${id}`, data);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to update user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserRole = useCallback(async (id: string, data: UpdateUserRoleInput): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch<User>(`/users/${id}/role`, data);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to update user role';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const activateUser = useCallback(async (id: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch<User>(`/users/${id}/activate`, {});
      return response.data;
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to activate user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deactivateUser = useCallback(async (id: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch<User>(`/users/${id}/deactivate`, {});
      return response.data;
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to deactivate user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to delete user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Audit Logs (Admin only)
  const getAuditLogs = useCallback(async (params?: AuditLogSearchParams): Promise<PaginatedAuditLogsResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (params?.userId) queryParams.append('userId', params.userId);
      if (params?.action) queryParams.append('action', params.action);
      if (params?.entityType) queryParams.append('entityType', params.entityType);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const accessToken = tokenStorage.getAccessToken();
      const response = await fetch(`/api/settings/audit-logs?${queryParams.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch audit logs');
      }

      return await response.json();
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to fetch audit logs';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // System Config (Admin only)
  const getSystemConfig = useCallback(async (): Promise<SystemConfig> => {
    setIsLoading(true);
    setError(null);
    try {
      const accessToken = tokenStorage.getAccessToken();
      const response = await fetch('/api/settings/system', {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch system config');
      }

      return await response.json();
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to fetch system config';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSystemConfig = useCallback(async (data: SystemConfig): Promise<SystemConfig> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch<SystemConfig>('/settings/system', data);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to update system config';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Menu Items Management (Admin only)
  const getMenuItems = useCallback(async (includeInactive?: boolean, role?: string): Promise<MenuItem[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (includeInactive) queryParams.append('includeInactive', 'true');
      if (role) queryParams.append('role', role);

      const accessToken = tokenStorage.getAccessToken();
      const response = await fetch(`/api/settings/menus?${queryParams.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch menu items');
      }

      return await response.json();
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to fetch menu items';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMenuItem = useCallback(async (id: string): Promise<MenuItem> => {
    setIsLoading(true);
    setError(null);
    try {
      const accessToken = tokenStorage.getAccessToken();
      const response = await fetch(`/api/settings/menus/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch menu item');
      }

      return await response.json();
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to fetch menu item';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createMenuItem = useCallback(async (data: CreateMenuItemInput): Promise<MenuItem> => {
    setIsLoading(true);
    setError(null);
    try {
      const accessToken = tokenStorage.getAccessToken();
      const response = await fetch('/api/settings/menus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create menu item');
      }

      return await response.json();
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to create menu item';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateMenuItem = useCallback(async (id: string, data: UpdateMenuItemInput): Promise<MenuItem> => {
    setIsLoading(true);
    setError(null);
    try {
      const accessToken = tokenStorage.getAccessToken();
      const response = await fetch(`/api/settings/menus/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update menu item');
      }

      return await response.json();
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to update menu item';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteMenuItem = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const accessToken = tokenStorage.getAccessToken();
      const response = await fetch(`/api/settings/menus/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete menu item');
      }
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to delete menu item';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const assignRoleToMenuItem = useCallback(async (id: string, data: AssignRoleInput): Promise<MenuItem> => {
    setIsLoading(true);
    setError(null);
    try {
      const accessToken = tokenStorage.getAccessToken();
      const response = await fetch(`/api/settings/menus/${id}/assign-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to assign role');
      }

      return await response.json();
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to assign role';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeRoleFromMenuItem = useCallback(async (id: string, role: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const accessToken = tokenStorage.getAccessToken();
      const response = await fetch(`/api/settings/menus/${id}/remove-role/${role}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove role');
      }
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to remove role';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reorderMenuItem = useCallback(async (id: string, data: ReorderMenuItemInput): Promise<MenuItem> => {
    setIsLoading(true);
    setError(null);
    try {
      const accessToken = tokenStorage.getAccessToken();
      const response = await fetch(`/api/settings/menus/${id}/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reorder menu item');
      }

      return await response.json();
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to reorder menu item';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // Profile
    getProfile,
    updateProfile,
    changePassword,
    // Users
    getUsers,
    getUser,
    createUser,
    updateUser,
    updateUserRole,
    activateUser,
    deactivateUser,
    deleteUser,
    // Audit Logs
    getAuditLogs,
    // System Config
    getSystemConfig,
    updateSystemConfig,
    // Menu Items
    getMenuItems,
    getMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    assignRoleToMenuItem,
    removeRoleFromMenuItem,
    reorderMenuItem,
    // State
    isLoading,
    error,
  };
}

