'use client';

import { useRouter } from 'next/navigation';
import { usePatient } from '@/hooks/use-patient';
import { PatientForm } from '@/components/features/patients/patient-form';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import { Alert } from '@/components/ui/alert';
import type { CreatePatientInput } from '@/types/patient.types';

export function NewPatientContent() {
  const router = useRouter();
  const { createPatient, isLoading, error } = usePatient();

  const handleSubmit = async (data: CreatePatientInput) => {
    try {
      const patient = await createPatient(data);
      router.push(`/en/patients/${patient.id}`);
    } catch (err) {
      console.error('Failed to create patient:', err);
      // Error is handled by the hook and displayed via error state
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs
          items={[
            { label: 'Patients', href: '/en/patients' },
            { label: 'New Patient' },
          ]}
        />
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Register New Patient</h1>
        <p className="text-gray-600 mt-1">Enter patient information to create a new record</p>
      </div>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <PatientForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/en/patients')}
        isLoading={isLoading}
      />
    </div>
  );
}

