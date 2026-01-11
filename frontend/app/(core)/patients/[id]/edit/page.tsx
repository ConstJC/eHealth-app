'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usePatient } from '@/hooks/use-patient';
import { PatientForm } from '@/components/features/patients/patient-form';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import { Alert } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ErrorMessage } from '@/components/common/error-message';
import type { Patient, UpdatePatientInput } from '@/types/patient.types';

export default function EditPatientPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  const { getPatient, updatePatient, isLoading, error } = usePatient();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const data = await getPatient(patientId);
        setPatient(data);
      } catch (err) {
        console.error('Failed to load patient:', err);
      }
    };

    if (patientId) {
      loadPatient();
    }
  }, [patientId, getPatient]);

  const handleSubmit = async (data: UpdatePatientInput) => {
    setIsSubmitting(true);
    try {
      const updatedPatient = await updatePatient(patientId, data);
      router.push(`/patients/${updatedPatient.id}`);
    } catch (err) {
      console.error('Failed to update patient:', err);
      setIsSubmitting(false);
    }
  };

  if (isLoading && !patient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !patient) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Patients', href: '/patients' }, { label: 'Edit Patient' }]} />
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs
          items={[
            { label: 'Patients', href: '/patients' },
            { label: patient.firstName + ' ' + patient.lastName, href: `/patients/${patient.id}` },
            { label: 'Edit' },
          ]}
        />
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Edit Patient</h1>
        <p className="text-gray-600 mt-1">Update patient information</p>
      </div>

      {error && (
        <Alert className="bg-red-50 text-red-800 border-red-200">
          {error}
        </Alert>
      )}

      <PatientForm
        patient={patient}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/patients/${patient.id}`)}
        isLoading={isSubmitting || isLoading}
      />
    </div>
  );
}

