'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePatient } from '@/hooks/use-patient';
import { PatientList } from '@/components/features/patients/patient-list';
import { PatientFilters, type PatientFilters as PatientFiltersType } from '@/components/features/patients/patient-filters';
import { ViewToggle, type ViewType } from '@/components/common/view-toggle';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import { UserPlus } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import type { Patient } from '@/types/patient.types';

export function PatientsContent() {
  const router = useRouter();
  const { getPatients, isLoading, error } = usePatient();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [view, setView] = useState<ViewType>('card');
  const [filters, setFilters] = useState<PatientFiltersType>({});
  
  // Debounce filters for better performance
  const debouncedFilters = useDebounce(filters, 300);

  useEffect(() => {
    let cancelled = false;
    
    const loadPatients = async () => {
      try {
        // Build search params from filters
        const searchParams: any = {
          page: 1,
          limit: 50,
        };

        // If name filter exists, use it as the main search
        if (debouncedFilters.name) {
          searchParams.search = debouncedFilters.name;
        }

        // Add specific filters
        if (debouncedFilters.patientId) {
          searchParams.patientId = debouncedFilters.patientId;
        }
        if (debouncedFilters.dateOfBirth) {
          searchParams.dateOfBirth = debouncedFilters.dateOfBirth;
        }
        if (debouncedFilters.status) {
          searchParams.status = debouncedFilters.status;
        }
        if (debouncedFilters.phone) {
          searchParams.phone = debouncedFilters.phone;
        }
        if (debouncedFilters.email) {
          searchParams.email = debouncedFilters.email;
        }

        const response = await getPatients(searchParams);
        if (!cancelled) {
          setPatients(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load patients:', err);
        }
      }
    };

    loadPatients();
    
    return () => {
      cancelled = true;
    };
  }, [debouncedFilters, getPatients]);

  const handleFiltersChange = (newFilters: PatientFiltersType) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumbs items={[{ label: 'Patients' }]} />
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Patients</h1>
        </div>
        <Button onClick={() => router.push('/en/patients/new')}>
          <UserPlus className="h-4 w-4 mr-2" />
          New Patient
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <PatientFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClear={handleClearFilters}
          />
        </div>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <PatientList
        patients={patients}
        isLoading={isLoading}
        view={view}
        onView={(id) => router.push(`/en/patients/${id}`)}
        onEdit={(id) => router.push(`/en/patients/${id}/edit`)}
        onNewVisit={(id) => router.push(`/en/patients/${id}/visits/new`)}
        onCreateNew={() => router.push('/en/patients/new')}
      />
    </div>
  );
}

