import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Patient, CreatePatientInput, UpdatePatientInput, PatientSearchParams, PaginatedResponse } from '@/types/patient.types';
import { toast } from 'sonner';

// Query Keys
export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (params: PatientSearchParams) => [...patientKeys.lists(), params] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
};

// Get paginated patients list with filters
export function usePatients(params?: PatientSearchParams) {
  return useQuery({
    queryKey: patientKeys.list(params || {}),
    queryFn: async () => {
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

      const response = await apiClient.get<PaginatedResponse<Patient>>(
        `/patients?${queryParams.toString()}`
      );
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get single patient by ID
export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: patientKeys.detail(id || ''),
    queryFn: async () => {
      const response = await apiClient.get<Patient>(`/patients/${id}`);
      return response.data;
    },
    enabled: !!id, // Only fetch if ID exists
    staleTime: 5 * 60 * 1000, // 5 minutes - patient demographics don't change often
  });
}

// Create new patient
export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePatientInput) => {
      const response = await apiClient.post<Patient>('/patients', data);
      return response.data;
    },
    onSuccess: (newPatient) => {
      // Invalidate patients list to refetch
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      
      // Add the new patient to the cache
      queryClient.setQueryData(patientKeys.detail(newPatient.id), newPatient);
      
      toast.success('Patient created successfully!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create patient';
      toast.error(message);
    },
  });
}

// Update existing patient
export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePatientInput }) => {
      const response = await apiClient.put<Patient>(`/patients/${id}`, data);
      return response.data;
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: patientKeys.detail(id) });

      // Snapshot the previous value
      const previousPatient = queryClient.getQueryData(patientKeys.detail(id));

      // Optimistically update to the new value
      queryClient.setQueryData(patientKeys.detail(id), (old: Patient | undefined) => {
        if (!old) return old;
        return { ...old, ...data };
      });

      return { previousPatient };
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousPatient) {
        queryClient.setQueryData(patientKeys.detail(id), context.previousPatient);
      }
      const message = error?.response?.data?.message || 'Failed to update patient';
      toast.error(message);
    },
    onSuccess: (updatedPatient) => {
      // Update the cache with server response
      queryClient.setQueryData(patientKeys.detail(updatedPatient.id), updatedPatient);
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      
      toast.success('Patient updated successfully!');
    },
  });
}

// Delete patient (soft delete)
export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/patients/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: patientKeys.detail(deletedId) });
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      
      toast.success('Patient deleted successfully!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete patient';
      toast.error(message);
    },
  });
}

// Update patient status
export function useUpdatePatientStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'ACTIVE' | 'INACTIVE' }) => {
      const response = await apiClient.patch<Patient>(`/patients/${id}/status`, { status });
      return response.data;
    },
    onSuccess: (updatedPatient) => {
      queryClient.setQueryData(patientKeys.detail(updatedPatient.id), updatedPatient);
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      toast.success('Patient status updated!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update status';
      toast.error(message);
    },
  });
}
