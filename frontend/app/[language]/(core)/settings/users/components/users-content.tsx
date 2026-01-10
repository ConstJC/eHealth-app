'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useSettings } from '../../hooks/use-settings';
import { UserList } from './user-list';
import { UserForm } from './user-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { SearchBar } from '@/components/common/search-bar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserPlus } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { useAuthStore } from '@/store/auth-store';
import { USER_ROLE_OPTIONS, USER_STATUS_OPTIONS } from '../../settings-constants';
import type { User, CreateUserInput, UpdateUserInput, UserRole } from '../../settings-types';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';

export function UsersContent() {
  const router = useRouter();
  const params = useParams();
  const language = (params?.language as string) || 'en';
  const { getUsers, createUser, updateUser, activateUser, deactivateUser, deleteUser, isLoading, error } = useSettings();
  const { user: currentUser } = useAuthStore();
  
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; userId: string | null }>({
    open: false,
    userId: null,
  });

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    loadUsers();
  }, [debouncedSearch, roleFilter, statusFilter, pagination.page]);

  const loadUsers = async () => {
    try {
      const response = await getUsers({
        search: debouncedSearch || undefined,
        role: roleFilter ? (roleFilter as UserRole) : undefined,
        isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
        page: pagination.page,
        limit: pagination.limit,
      });
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handleCreate = async (data: CreateUserInput | UpdateUserInput) => {
    try {
      // Type assertion is safe here because we know in create context it's always CreateUserInput
      await createUser(data as CreateUserInput);
      setIsCreateDialogOpen(false);
      loadUsers();
    } catch (err) {
      console.error('Failed to create user:', err);
    }
  };

  const handleEdit = async (data: UpdateUserInput) => {
    if (!selectedUser) return;
    try {
      await updateUser(selectedUser.id, data);
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await activateUser(id);
      loadUsers();
    } catch (err) {
      console.error('Failed to activate user:', err);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await deactivateUser(id);
      loadUsers();
    } catch (err) {
      console.error('Failed to deactivate user:', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.userId) return;
    try {
      await deleteUser(deleteConfirm.userId);
      setDeleteConfirm({ open: false, userId: null });
      loadUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage system users and their roles (Admin only)</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          New User
        </Button>
      </div>

      <div className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="search-filter">Search</Label>
                  <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search by name or email..."
                  />
                </div>
                <div>
                  <Label htmlFor="role-filter">Role</Label>
                  <Select
                    id="role-filter"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="">All Roles</option>
                    {USER_ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    {USER_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User List */}
          <UserList
            users={users}
            isLoading={isLoading}
            onEdit={(id) => {
              const user = users.find(u => u.id === id);
              if (user) {
                setSelectedUser(user);
                setIsEditDialogOpen(true);
              }
            }}
            onActivate={handleActivate}
            onDeactivate={handleDeactivate}
            onDelete={(id) => setDeleteConfirm({ open: true, userId: id })}
            currentUserId={currentUser?.id}
          />

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} users
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page >= pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
      </div>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <UserForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={isLoading}
            error={error}
          />
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserForm
              user={selectedUser}
              onSubmit={handleEdit}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedUser(null);
              }}
              isLoading={isLoading}
              error={error}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={deleteConfirm.open}
        onOpenChange={useCallback((open: boolean) => {
          setDeleteConfirm({ open, userId: null });
        }, [])}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}

