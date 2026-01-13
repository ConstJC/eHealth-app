import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';

export interface Visit {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  visitDate: string;
  visitType: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  patient: {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    gender: string;
    dateOfBirth: string;
    phone?: string;
    email?: string;
  };
  appointment?: {
    id: string;
    startTime: string;
    endTime: string;
    reason?: string;
    status: string;
  };
  vitals?: {
    id?: string;
    bpSystolic?: number;
    bpDiastolic?: number;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    notes?: string;
  };
  soap?: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisitInput {
  patientId: string;
  appointmentId?: string;
  visitType: string;
  vitals?: {
    bpSystolic?: number;
    bpDiastolic?: number;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    notes?: string;
  };
}

export interface UpdateVisitInput {
  status?: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  vitals?: {
    bpSystolic?: number;
    bpDiastolic?: number;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    notes?: string;
  };
  soap?: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
  };
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
export function useVisits(filters?: { status?: string; date?: string; patientId?: string }) {
  return useQuery({
    queryKey: visitKeys.list(filters || {}),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.date) params.append('date', filters.date);
      if (filters?.patientId) params.append('patientId', filters.patientId);

      const response = await apiClient.get<Visit[]>(`/visits?${params.toString()}`);
      return response.data;
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
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
    onSuccess: (newVisit) => {
      // Invalidate visits list
      queryClient.invalidateQueries({ queryKey: visitKeys.lists() });
      
      // Add to cache
      queryClient.setQueryData(visitKeys.detail(newVisit.id), newVisit);
      
      // Invalidate triage queue
      queryClient.invalidateQueries({ queryKey: ['triage', 'queue'] });
      
      toast.success('Visit created successfully! Patient sent to doctor.');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create visit';
      toast.error(message);
    },
  });
}

// Update visit (SOAP notes, vitals, status)
export function useUpdateVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateVisitInput }) => {
      const response = await apiClient.patch<Visit>(`/visits/${id}`, data);
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
      
      toast.success('Visit updated successfully!');
    },
  });
}

// Complete visit
export function useCompleteVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch<Visit>(`/visits/${id}`, {
        status: 'COMPLETED',
      });
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
