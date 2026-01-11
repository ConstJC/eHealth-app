import { useState, useCallback } from 'react';
import api from '@/lib/api-client';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  reason?: string;
  status: 'SCHEDULED' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NOSHOW';
  notes?: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export function useAppointments() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAppointments = useCallback(async (filters: any = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<Appointment[]>('/appointments', { params: filters });
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch appointments';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAppointmentStatus = useCallback(async (id: string, status: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.put<Appointment>(`/appointments/${id}`, { status });
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update appointment';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getAppointments,
    updateAppointmentStatus,
    isLoading,
    error,
  };
}
