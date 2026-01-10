'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Patient, PatientSearchParams } from './patients-types';

interface PatientsContextType {
  patients: Patient[];
  selectedPatient: Patient | null;
  searchParams: PatientSearchParams;
  isLoading: boolean;
  error: string | null;
  setPatients: (patients: Patient[]) => void;
  setSelectedPatient: (patient: Patient | null) => void;
  setSearchParams: (params: PatientSearchParams) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const PatientsContext = createContext<PatientsContextType | null>(null);

export function PatientsProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchParams, setSearchParams] = useState<PatientSearchParams>({
    page: 1,
    limit: 50,
  });
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <PatientsContext.Provider
      value={{
        patients,
        selectedPatient,
        searchParams,
        isLoading,
        error,
        setPatients,
        setSelectedPatient,
        setSearchParams,
        setLoading,
        setError,
      }}
    >
      {children}
    </PatientsContext.Provider>
  );
}

export function usePatientsContext() {
  const context = useContext(PatientsContext);
  if (!context) {
    throw new Error('usePatientsContext must be used within PatientsProvider');
  }
  return context;
}

