import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';

export interface Visit {
  id: string;
  patientId: string;
  doctorId: string;
  visitDate: string;
  visitType: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  // Vital signs (flat structure from backend)
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  painScale?: number;
  // SOAP notes (flat structure from backend)
  chiefComplaint?: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  // Diagnosis
  primaryDiagnosis?: string;
  secondaryDiagnoses?: string[];
  icdCodes?: string[];
  // Additional
  notes?: string;
  followUpDate?: string;
  followUpReason?: string;
  isLocked?: boolean;
  lockedAt?: string;
  lockedBy?: string;
  // Relations
  patient: {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    gender?: string;
    dateOfBirth?: string;
    phone?: string;
    email?: string;
    allergies?: string[];
    chronicConditions?: string[];
  };
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisitInput {
  patientId: string;
  visitType: string;
  visitDate?: string;
  chiefComplaint?: string;
  // Vital signs
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  painScale?: number;
}

export interface UpdateVisitInput {
  // SOAP notes
  chiefComplaint?: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  // Diagnosis
  primaryDiagnosis?: string;
  secondaryDiagnoses?: string[];
  icdCodes?: string[];
  // Vital signs
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  painScale?: number;
  // Follow-up
  followUpDate?: string;
  followUpReason?: string;
  // Additional
  notes?: string;
}

// Query Keys
export const visitKeys = {
  all: ['visits'] as const,
  lists: () => [...visitKeys.all, 'list'] as const,
  list: (filters: any) => [...visitKeys.lists(), filters] as const,
  details: () => [...visitKeys.all, 'detail'] as const,
  detail: (id: string) => [...visitKeys.details(), id] as const,
};

// Get visits list with filters
export function useVisits(
  filters?: { status?: string; date?: string; patientId?: string; startDate?: string; endDate?: string },
  options?: { enabled?: boolean; refetchInterval?: number }
) {
  return useQuery({
    queryKey: visitKeys.list(filters || {}),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.date) params.append('date', filters.date);
      if (filters?.patientId) params.append('patientId', filters.patientId);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response = await apiClient.get<{ data: Visit[]; meta?: any }>(`/visits?${params.toString()}`);
      // Backend returns { data: [], meta: {} } structure
      return Array.isArray(response.data) ? response.data : response.data.data || [];
    },
    enabled: options?.enabled !== false,
    staleTime: 15000, // 15 seconds
    refetchInterval: options?.refetchInterval ?? 15000, // Refetch every 15 seconds so Active Consultations list updates in real time
  });
}

// Get single visit by ID
export function useVisit(id: string | undefined) {
  return useQuery({
    queryKey: visitKeys.detail(id || ''),
    queryFn: async () => {
      const response = await apiClient.get<Visit>(`/visits/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
}

// Get appointments waiting for triage (for visits/triage page)
export function useTriageQueue() {
  return useQuery({
    queryKey: ['triage', 'queue'],
    queryFn: async () => {
      // Get appointments that have arrived but don't have visits yet
      const response = await apiClient.get('/appointments', {
        params: {
          status: 'ARRIVED,SCHEDULED',
          date: new Date().toISOString().split('T')[0],
        },
      });
      return response.data;
    },
    staleTime: 15000, // 15 seconds
    refetchInterval: 20000, // Refetch every 20 seconds
  });
}

// Create new visit (when patient is triaged)
export function useCreateVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateVisitInput) => {
      const response = await apiClient.post<Visit>('/visits', data);
      return response.data;
    },
    onSuccess: async (newVisit) => {
      // Invalidate and refetch all visits lists so Active Consultations etc. update in real time
      queryClient.invalidateQueries({ queryKey: visitKeys.lists() });
      await queryClient.refetchQueries({ queryKey: visitKeys.lists() });

      // Add to cache
      queryClient.setQueryData(visitKeys.detail(newVisit.id), newVisit);

      // Invalidate triage queue and dashboard Patient Queue
      queryClient.invalidateQueries({ queryKey: ['triage', 'queue'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'queue'] });

      toast.success('Visit created successfully! Patient sent to doctor.');
    },
    onError: (error: any) => {
      // Extract error message from backend response
      let errorMessage = 'Failed to create visit';
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        
        // Handle validation errors (array of messages)
        if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(', ');
        } 
        // Handle single message string
        else if (typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        }
        // Handle error object with field-specific errors
        else if (typeof errorData.message === 'object') {
          const messages = Object.values(errorData.message).flat();
          errorMessage = messages.length > 0 
            ? messages.join(', ')
            : 'Validation failed. Please check your input.';
        }
        // Handle status text as fallback
        else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    },
  });
}

// Update visit (SOAP notes, vitals, status)
export function useUpdateVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateVisitInput }) => {
      const response = await apiClient.put<Visit>(`/visits/${id}`, data);
      return response.data;
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: visitKeys.detail(id) });

      // Snapshot previous value
      const previousVisit = queryClient.getQueryData(visitKeys.detail(id));

      // Optimistically update
      queryClient.setQueryData(visitKeys.detail(id), (old: Visit | undefined) => {
        if (!old) return old;
        return { ...old, ...data };
      });

      return { previousVisit };
    },
    onError: (error: any, { id }, context) => {
      // Rollback on error
      if (context?.previousVisit) {
        queryClient.setQueryData(visitKeys.detail(id), context.previousVisit);
      }
      const message = error?.response?.data?.message || 'Failed to update visit';
      toast.error(message);
    },
    onSuccess: (updatedVisit) => {
      // Update cache
      queryClient.setQueryData(visitKeys.detail(updatedVisit.id), updatedVisit);
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: visitKeys.lists() });
      
      // Don't show toast for auto-saves (silent updates)
      // toast.success('Visit updated successfully!');
    },
  });
}

// Complete visit (uses dedicated endpoint)
export function useCompleteVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch<Visit>(`/visits/${id}/complete`);
      return response.data;
    },
    onSuccess: (completedVisit) => {
      queryClient.setQueryData(visitKeys.detail(completedVisit.id), completedVisit);
      queryClient.invalidateQueries({ queryKey: visitKeys.lists() });
      toast.success('Visit completed successfully!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to complete visit';
      toast.error(message);
    },
  });
}

// Cancel visit
export function useCancelVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await apiClient.patch<Visit>(`/visits/${id}/cancel`, { reason });
      return response.data;
    },
    onSuccess: (cancelledVisit) => {
      queryClient.setQueryData(visitKeys.detail(cancelledVisit.id), cancelledVisit);
      queryClient.invalidateQueries({ queryKey: visitKeys.lists() });
      toast.success('Visit cancelled successfully!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to cancel visit';
      toast.error(message);
    },
  });
}
