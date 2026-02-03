import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';

export interface Prescription {
  id: string;
  patientId: string;
  visitId?: string;
  doctorId: string;
  medicationName: string;
  genericName?: string;
  brandName?: string;
  dosage: string;
  frequency: string;
  route: string;
  duration: string;
  quantity: string;
  refills: number;
  instructions?: string;
  notes?: string;
  status: 'ACTIVE' | 'DISCONTINUED' | 'COMPLETED';
  discontinuedAt?: string;
  discontinuedReason?: string;
  patient?: {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
  };
  visit?: {
    id: string;
    visitDate: string;
    visitType: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePrescriptionInput {
  patientId: string;
  visitId?: string;
  medicationName: string;
  genericName?: string;
  brandName?: string;
  dosage: string;
  frequency: string;
  route: string;
  duration: string;
  quantity: string;
  refills?: number;
  instructions?: string; // Special instructions for the patient
  notes?: string;
}

export interface UpdatePrescriptionInput {
  medicationName?: string;
  genericName?: string;
  brandName?: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  duration?: string;
  quantity?: string;
  refills?: number;
  instructions?: string;
  notes?: string;
}

export interface DiscontinuePrescriptionInput {
  reason: string;
}

// Query Keys
export const prescriptionKeys = {
  all: ['prescriptions'] as const,
  lists: () => [...prescriptionKeys.all, 'list'] as const,
  list: (filters: any) => [...prescriptionKeys.lists(), filters] as const,
  details: () => [...prescriptionKeys.all, 'detail'] as const,
  detail: (id: string) => [...prescriptionKeys.details(), id] as const,
  patient: (patientId: string) => [...prescriptionKeys.all, 'patient', patientId] as const,
  visit: (visitId: string) => [...prescriptionKeys.all, 'visit', visitId] as const,
  active: (patientId: string) => [...prescriptionKeys.patient(patientId), 'active'] as const,
};

// Get prescriptions list with filters
export function usePrescriptions(filters?: {
  status?: string;
  patientId?: string;
  visitId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: prescriptionKeys.list(filters || {}),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.patientId) params.append('patientId', filters.patientId);
      if (filters?.visitId) params.append('visitId', filters.visitId);
      if (filters?.search) params.append('search', filters.search);

      const response = await apiClient.get<{ data: Prescription[]; meta?: any }>(
        `/prescriptions?${params.toString()}`
      );
      return Array.isArray(response.data) ? response.data : response.data.data || [];
    },
    staleTime: 30000,
  });
}

// Get patient prescriptions
export function usePatientPrescriptions(patientId: string | undefined) {
  return useQuery({
    queryKey: prescriptionKeys.patient(patientId || ''),
    queryFn: async () => {
      const response = await apiClient.get<Prescription[]>(
        `/prescriptions/patient/${patientId}`
      );
      return Array.isArray(response.data) ? response.data : response.data.data || [];
    },
    enabled: !!patientId,
    staleTime: 60000,
  });
}

// Get active prescriptions for a patient
export function useActivePrescriptions(patientId: string | undefined) {
  return useQuery({
    queryKey: prescriptionKeys.active(patientId || ''),
    queryFn: async () => {
      const response = await apiClient.get<Prescription[]>(
        `/prescriptions/patient/${patientId}/active`
      );
      return Array.isArray(response.data) ? response.data : response.data.data || [];
    },
    enabled: !!patientId,
    staleTime: 60000,
  });
}

// Get prescriptions for a visit
export function useVisitPrescriptions(visitId: string | undefined) {
  return useQuery({
    queryKey: prescriptionKeys.visit(visitId || ''),
    queryFn: async () => {
      const response = await apiClient.get<Prescription[]>(
        `/prescriptions/visit/${visitId}`
      );
      return Array.isArray(response.data) ? response.data : response.data.data || [];
    },
    enabled: !!visitId,
    staleTime: 60000,
  });
}

// Get single prescription by ID
export function usePrescription(id: string | undefined) {
  return useQuery({
    queryKey: prescriptionKeys.detail(id || ''),
    queryFn: async () => {
      const response = await apiClient.get<Prescription>(`/prescriptions/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 60000,
  });
}

// Create new prescription
export function useCreatePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePrescriptionInput) => {
      const response = await apiClient.post<Prescription>('/prescriptions', data);
      return response.data;
    },
    onSuccess: (newPrescription) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.lists() });
      if (newPrescription.patientId) {
        queryClient.invalidateQueries({
          queryKey: prescriptionKeys.patient(newPrescription.patientId),
        });
      }
      if (newPrescription.visitId) {
        queryClient.invalidateQueries({
          queryKey: prescriptionKeys.visit(newPrescription.visitId),
        });
      }
      queryClient.setQueryData(prescriptionKeys.detail(newPrescription.id), newPrescription);
      toast.success('Prescription created successfully!');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Failed to create prescription';
      toast.error(message);
    },
  });
}

// Update prescription
export function useUpdatePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePrescriptionInput;
    }) => {
      const response = await apiClient.put<Prescription>(
        `/prescriptions/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (updatedPrescription) => {
      queryClient.setQueryData(
        prescriptionKeys.detail(updatedPrescription.id),
        updatedPrescription
      );
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.lists() });
      if (updatedPrescription.patientId) {
        queryClient.invalidateQueries({
          queryKey: prescriptionKeys.patient(updatedPrescription.patientId),
        });
      }
      toast.success('Prescription updated successfully!');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Failed to update prescription';
      toast.error(message);
    },
  });
}

// Discontinue prescription
export function useDiscontinuePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: DiscontinuePrescriptionInput;
    }) => {
      const response = await apiClient.patch<Prescription>(
        `/prescriptions/${id}/discontinue`,
        data
      );
      return response.data;
    },
    onSuccess: (discontinuedPrescription) => {
      queryClient.setQueryData(
        prescriptionKeys.detail(discontinuedPrescription.id),
        discontinuedPrescription
      );
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.lists() });
      if (discontinuedPrescription.patientId) {
        queryClient.invalidateQueries({
          queryKey: prescriptionKeys.patient(discontinuedPrescription.patientId),
        });
      }
      toast.success('Prescription discontinued successfully!');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Failed to discontinue prescription';
      toast.error(message);
    },
  });
}
