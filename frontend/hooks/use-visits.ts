import { useState, useCallback } from 'react';
import api from '@/lib/api-client';

export interface Visit {
  id: string;
  patientId: string;
  doctorId: string;
  visitDate: string;
  visitType: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  patient: {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth: string;
  };
  vitals?: {
    bpSystemic?: number;
    bpDiastolic?: number;
    hr?: number;
    temp?: number;
    weight?: number;
  };
}

export function useVisits() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getVisits = useCallback(async (filters: any = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: Visit[] }>('/visits', { params: filters });
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch visits';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getVisitDetails = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<Visit>(`/visits/${id}`);
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch visit details';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getVisits,
    getVisitDetails,
    isLoading,
    error,
  };
}
