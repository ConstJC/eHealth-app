import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';

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
    middleName?: string;
    gender: string;
    dateOfBirth: string;
  };
}

export interface CreateAppointmentInput {
  patientId: string;
  doctorId?: string;
  startTime: string;
  endTime: string;
  reason?: string;
  status?: string;
  notes?: string;
}

export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters: any) => [...appointmentKeys.lists(), filters] as const,
};

export function useAppointments(filters: any = {}) {
  return useQuery({
    queryKey: appointmentKeys.list(filters),
    queryFn: async () => {
      const response = await apiClient.get<Appointment[]>('/appointments', { params: filters });
      return response.data;
    },
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAppointmentInput) => {
      const response = await apiClient.post<Appointment>('/appointments', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({ queryKey: ['triage', 'queue'] });
      toast.success('Patient checked in successfully!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create appointment';
      toast.error(message);
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiClient.patch<Appointment>(`/appointments/${id}`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({ queryKey: ['triage', 'queue'] });
    },
  });
}
