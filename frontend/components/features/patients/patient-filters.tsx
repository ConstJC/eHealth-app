'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';
import { PatientStatus } from '@/types/patient.types';

export interface PatientFilters {
  name?: string;
  patientId?: string;
  dateOfBirth?: string;
  status?: PatientStatus;
  phone?: string;
  email?: string;
}

interface PatientFiltersProps {
  filters: PatientFilters;
  onFiltersChange: (filters: PatientFilters) => void;
  onClear: () => void;
}

export function PatientFilters({ filters, onFiltersChange, onClear }: PatientFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined && value !== '');

  const updateFilter = (key: keyof PatientFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleClear = () => {
    onClear();
    setIsExpanded(false);
  };

  return (
    <div className="space-y-4">
      {/* Quick Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            value={filters.name || ''}
            onChange={(e) => updateFilter('name', e.target.value)}
            placeholder="Search by patient name..."
            className="pl-10 pr-10"
          />
          {(filters.name || hasActiveFilters) && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className={hasActiveFilters ? 'border-blue-500 bg-blue-50 text-gray-900' : 'text-gray-700'}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs">
              {Object.values(filters).filter((v) => v !== undefined && v !== '').length}
            </span>
          )}
        </Button>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Patient ID</label>
            <Input
              type="text"
              value={filters.patientId || ''}
              onChange={(e) => updateFilter('patientId', e.target.value)}
              placeholder="Enter patient ID"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Date of Birth</label>
            <Input
              type="date"
              value={filters.dateOfBirth || ''}
              onChange={(e) => updateFilter('dateOfBirth', e.target.value)}
              placeholder="Select date"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <Select
              value={filters.status || ''}
              onChange={(e) => updateFilter('status', e.target.value || undefined)}
            >
              <option value="">All statuses</option>
              <option value={PatientStatus.ACTIVE}>Active</option>
              <option value={PatientStatus.INACTIVE}>Inactive</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <Input
              type="tel"
              value={filters.phone || ''}
              onChange={(e) => updateFilter('phone', e.target.value)}
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              value={filters.email || ''}
              onChange={(e) => updateFilter('email', e.target.value)}
              placeholder="Enter email address"
            />
          </div>

          <div className="flex items-end">
            <Button variant="outline" onClick={handleClear} className="w-full">
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

