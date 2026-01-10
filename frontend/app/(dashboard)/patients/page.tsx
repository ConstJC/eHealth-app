'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePatient } from '@/hooks/use-patient';
import { PatientList } from '@/components/features/patients/patient-list';
import { SearchBar } from '@/components/common/search-bar';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import { UserPlus } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import type { Patient } from '@/types/patient.types';

export default function PatientsPage() {
  const router = useRouter();
  const { getPatients, isLoading, error } = usePatient();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    let cancelled = false;
    
    const loadPatients = async () => {
      try {
        const response = await getPatients({
          search: debouncedSearch || undefined,
          page: 1,
          limit: 50,
        });
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
  }, [debouncedSearch, getPatients]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumbs items={[{ label: 'Patients' }]} />
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Patients</h1>
          <p className="text-gray-600 mt-1">Manage patient records and information</p>
        </div>
        <Button onClick={() => router.push('/patients/new')}>
          <UserPlus className="h-4 w-4 mr-2" />
          New Patient
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by name, patient ID, or phone..."
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <PatientList
        patients={patients}
        isLoading={isLoading}
        onView={(id) => router.push(`/patients/${id}`)}
        onEdit={(id) => router.push(`/patients/${id}/edit`)}
        onNewVisit={(id) => router.push(`/patients/${id}/visits/new`)}
        onCreateNew={() => router.push('/patients/new')}
      />
    </div>
  );
}

