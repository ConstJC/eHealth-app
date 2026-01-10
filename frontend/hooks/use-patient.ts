import { useState, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { tokenStorage } from '@/lib/auth';
import type { Patient, CreatePatientInput, UpdatePatientInput, PatientSearchParams, PaginatedResponse } from '@/types/patient.types';

export function usePatient() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPatients = useCallback(async (params?: PatientSearchParams): Promise<PaginatedResponse<Patient>> => {
    setIsLoading(true);
    setError(null);
    try {
      // Call Next.js API route
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.name) queryParams.append('name', params.name);
      if (params?.patientId) queryParams.append('patientId', params.patientId);
      if (params?.dateOfBirth) queryParams.append('dateOfBirth', params.dateOfBirth);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.phone) queryParams.append('phone', params.phone);
      if (params?.email) queryParams.append('email', params.email);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const accessToken = tokenStorage.getAccessToken();
      const response = await fetch(`/api/patients?${queryParams.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch patients');
      }

      return await response.json();
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to fetch patients';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPatient = useCallback(async (id: string): Promise<Patient> => {
    setIsLoading(true);
    setError(null);
    try {
      const accessToken = tokenStorage.getAccessToken();
      const response = await fetch(`/api/patients/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch patient');
      }

      return await response.json();
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to fetch patient';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPatient = useCallback(async (data: CreatePatientInput): Promise<Patient> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<Patient>('/patients', data);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to create patient';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePatient = useCallback(async (id: string, data: UpdatePatientInput): Promise<Patient> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch<Patient>(`/patients/${id}`, data);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to update patient';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deletePatient = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/patients/${id}`);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to delete patient';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getPatients,
    getPatient,
    createPatient,
    updatePatient,
    deletePatient,
    isLoading,
    error,
  };
}
