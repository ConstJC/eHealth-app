'use client';

import { PatientCard } from './patient-card';
import { PatientTable } from './patient-table';
import { EmptyState } from '@/components/common/empty-state';
import { Users } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import type { Patient } from '@/types/patient.types';
import type { ViewType } from '@/components/common/view-toggle';

interface PatientListProps {
  patients: Patient[];
  isLoading?: boolean;
  view?: ViewType;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onNewVisit?: (id: string) => void;
  onCreateNew?: () => void;
}

export function PatientList({
  patients,
  isLoading,
  view = 'card',
  onView,
  onEdit,
  onNewVisit,
  onCreateNew,
}: PatientListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-12 w-12" />}
        title="No patients found"
        description="Get started by registering a new patient."
        action={
          onCreateNew
            ? {
                label: 'Register New Patient',
                onClick: onCreateNew,
              }
            : undefined
        }
      />
    );
  }

  if (view === 'list') {
    return (
      <PatientTable
        patients={patients}
        onView={onView}
        onEdit={onEdit}
        onNewVisit={onNewVisit}
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {patients.map((patient) => (
        <PatientCard
          key={patient.id}
          patient={patient}
          onView={onView}
          onEdit={onEdit}
          onNewVisit={onNewVisit}
        />
      ))}
    </div>
  );
}

