'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { MenuItem, CreateMenuItemInput, UpdateMenuItemInput, UserRole } from '../../settings-types';
import { UserRole as UserRoleEnum } from '../../settings-types';

interface MenuFormProps {
  menuItem?: MenuItem;
  onSubmit: (data: CreateMenuItemInput | UpdateMenuItemInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

const ROLE_OPTIONS = [
  { value: UserRoleEnum.ADMIN, label: 'Admin' },
  { value: UserRoleEnum.DOCTOR, label: 'Doctor' },
  { value: UserRoleEnum.NURSE, label: 'Nurse' },
  { value: UserRoleEnum.RECEPTIONIST, label: 'Receptionist' },
];

export function MenuForm({ menuItem, onSubmit, onCancel, isLoading, error }: MenuFormProps) {
  const [formData, setFormData] = useState({
    label: menuItem?.label || '',
    href: menuItem?.href || '',
    icon: menuItem?.icon || '',
    order: menuItem?.order ?? 0,
    isActive: menuItem?.isActive ?? true,
    roles: menuItem?.roles || [] as UserRole[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData: CreateMenuItemInput | UpdateMenuItemInput = {
      label: formData.label,
      href: formData.href,
      icon: formData.icon || undefined,
      order: formData.order,
      ...(menuItem ? { isActive: formData.isActive } : {}),
      ...(!menuItem ? { roles: formData.roles } : {}),
    };
    onSubmit(submitData);
  };

  const handleRoleToggle = (role: UserRole) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <Label htmlFor="label">Label *</Label>
        <Input
          id="label"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          required
          placeholder="e.g., Dashboard"
        />
      </div>

      <div>
        <Label htmlFor="href">Route (href) *</Label>
        <Input
          id="href"
          value={formData.href}
          onChange={(e) => setFormData({ ...formData, href: e.target.value })}
          required
          placeholder="e.g., /dashboard"
          pattern="^/.*"
          title="Route must start with /"
        />
        <p className="text-sm text-gray-500 mt-1">Must start with /</p>
      </div>

      <div>
        <Label htmlFor="icon">Icon (Lucide icon name)</Label>
        <Input
          id="icon"
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          placeholder="e.g., LayoutDashboard"
        />
        <p className="text-sm text-gray-500 mt-1">Optional: Lucide icon name</p>
      </div>

      <div>
        <Label htmlFor="order">Display Order *</Label>
        <Input
          id="order"
          type="number"
          min="0"
          value={formData.order}
          onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
          required
        />
        <p className="text-sm text-gray-500 mt-1">Lower numbers appear first</p>
      </div>

      {!menuItem && (
        <div>
          <Label>Assign to Roles *</Label>
          <div className="space-y-2 mt-2">
            {ROLE_OPTIONS.map((role) => (
              <div key={role.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`role-${role.value}`}
                  checked={formData.roles?.includes(role.value) || false}
                  onChange={(e) => {
                    if (e.target.checked !== formData.roles?.includes(role.value)) {
                      handleRoleToggle(role.value);
                    }
                  }}
                />
                <Label
                  htmlFor={`role-${role.value}`}
                  className="font-normal cursor-pointer"
                >
                  {role.label}
                </Label>
              </div>
            ))}
          </div>
          {formData.roles.length === 0 && (
            <p className="text-sm text-red-500 mt-1">At least one role must be selected</p>
          )}
        </div>
      )}

      {menuItem && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isActive"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
          />
          <Label htmlFor="isActive" className="font-normal cursor-pointer">
            Active
          </Label>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !formData.label || !formData.href || (!menuItem && formData.roles.length === 0)}>
          {isLoading ? 'Saving...' : menuItem ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}

