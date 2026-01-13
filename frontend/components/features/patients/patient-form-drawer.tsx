'use client';

import { PatientForm } from './patient-form';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from '@/components/ui/sheet';
import type { Patient, CreatePatientInput, UpdatePatientInput } from '@/types/patient.types';

interface PatientFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient;
  onSubmit: (data: CreatePatientInput | UpdatePatientInput) => Promise<void>;
  isLoading?: boolean;
}

export function PatientFormDrawer({
  open,
  onOpenChange,
  patient,
  onSubmit,
  isLoading = false,
}: PatientFormDrawerProps) {
  const handleSubmit = async (data: CreatePatientInput | UpdatePatientInput) => {
    await onSubmit(data);
    onOpenChange(false); // Close drawer on successful submit
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>
            {patient ? 'Edit Patient' : 'Add New Patient'}
          </SheetTitle>
          <SheetDescription>
            {patient
              ? 'Update patient information and medical records.'
              : 'Register a new patient with their personal and medical information.'}
          </SheetDescription>
        </SheetHeader>
        
        <SheetBody>
          <PatientForm
            patient={patient}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
