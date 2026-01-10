'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSettings } from '../../hooks/use-settings';
import { MenuList } from './menu-list';
import { MenuForm } from './menu-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Menu as MenuIcon } from 'lucide-react';
import type { MenuItem, CreateMenuItemInput, UpdateMenuItemInput, UserRole } from '../../settings-types';
import { UserRole as UserRoleEnum } from '../../settings-types';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';

export function MenusContent() {
  const {
    getMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    assignRoleToMenuItem,
    removeRoleFromMenuItem,
    reorderMenuItem,
    isLoading,
    error,
  } = useSettings();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; menuItemId: string | null }>({
    open: false,
    menuItemId: null,
  });

  useEffect(() => {
    loadMenuItems();
  }, [roleFilter, includeInactive]);

  const loadMenuItems = async () => {
    try {
      const items = await getMenuItems(includeInactive, roleFilter || undefined);
      // Sort by order
      const sorted = [...items].sort((a, b) => a.order - b.order);
      setMenuItems(sorted);
    } catch (err) {
      console.error('Failed to load menu items:', err);
    }
  };

  const handleCreate = async (data: CreateMenuItemInput | UpdateMenuItemInput) => {
    try {
      await createMenuItem(data as CreateMenuItemInput);
      setIsCreateDialogOpen(false);
      loadMenuItems();
    } catch (err) {
      console.error('Failed to create menu item:', err);
    }
  };

  const handleEdit = async (data: UpdateMenuItemInput) => {
    if (!selectedMenuItem) return;
    try {
      await updateMenuItem(selectedMenuItem.id, data);
      setIsEditDialogOpen(false);
      setSelectedMenuItem(null);
      loadMenuItems();
    } catch (err) {
      console.error('Failed to update menu item:', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.menuItemId) return;
    try {
      await deleteMenuItem(deleteConfirm.menuItemId);
      setDeleteConfirm({ open: false, menuItemId: null });
      loadMenuItems();
    } catch (err) {
      console.error('Failed to delete menu item:', err);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const item = menuItems.find((m) => m.id === id);
      if (item) {
        await updateMenuItem(id, { isActive: !item.isActive });
        loadMenuItems();
      }
    } catch (err) {
      console.error('Failed to toggle menu item status:', err);
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    try {
      const item = menuItems.find((m) => m.id === id);
      if (!item) return;

      const currentIndex = menuItems.findIndex((m) => m.id === id);
      if (direction === 'up' && currentIndex === 0) return;
      if (direction === 'down' && currentIndex === menuItems.length - 1) return;

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const targetItem = menuItems[targetIndex];

      // Swap orders
      await Promise.all([
        reorderMenuItem(id, { order: targetItem.order }),
        reorderMenuItem(targetItem.id, { order: item.order }),
      ]);

      loadMenuItems();
    } catch (err) {
      console.error('Failed to reorder menu item:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600 mt-1">Manage navigation menu items and role assignments (Admin only)</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Menu Item
        </Button>
      </div>

      <div className="space-y-4">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="role-filter">Filter by Role</Label>
                <Select
                  id="role-filter"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value={UserRoleEnum.ADMIN}>Admin</option>
                  <option value={UserRoleEnum.DOCTOR}>Doctor</option>
                  <option value={UserRoleEnum.NURSE}>Nurse</option>
                  <option value={UserRoleEnum.RECEPTIONIST}>Receptionist</option>
                </Select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeInactive}
                    onChange={(e) => setIncludeInactive(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Include inactive items</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu List */}
        <MenuList
          menuItems={menuItems}
          isLoading={isLoading}
          onEdit={(id) => {
            const item = menuItems.find((m) => m.id === id);
            if (item) {
              setSelectedMenuItem(item);
              setIsEditDialogOpen(true);
            }
          }}
          onDelete={(id) => setDeleteConfirm({ open: true, menuItemId: id })}
          onToggleActive={handleToggleActive}
          onReorder={handleReorder}
        />
      </div>

      {/* Create Menu Item Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Menu Item</DialogTitle>
          </DialogHeader>
          <MenuForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={isLoading}
            error={error}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Menu Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          {selectedMenuItem && (
            <MenuForm
              menuItem={selectedMenuItem}
              onSubmit={handleEdit}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedMenuItem(null);
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
          setDeleteConfirm({ open, menuItemId: null });
        }, [])}
        title="Delete Menu Item"
        description="Are you sure you want to delete this menu item? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}

