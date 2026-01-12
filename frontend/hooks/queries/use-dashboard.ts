import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { DashboardStats, PatientQueueItem, RecentActivity } from '@/types/dashboard.types';
import { format } from 'date-fns';

// Dashboard Stats
export function useDashboardStats() {
  return useQuery<DashboardStats, Error>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      try {
        // Fetch data from multiple endpoints
        const [patientsRes, appointmentsRes, revenueRes] = await Promise.all([
          apiClient.get('/reports/administrative/patient-census').catch(() => ({ data: { total: 0, change: '0%' } })),
          apiClient.get(`/appointments?date=${today}`).catch(() => ({ data: [] })),
          apiClient.get(`/reports/financial/daily?date=${today}`).catch(() => ({ data: { total: 0, change: '0%' } })),
        ]);

        const appointments = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [];
        const completedToday = appointments.filter((apt: any) => apt.status === 'COMPLETED').length;
        const remaining = appointments.filter((apt: any) => 
          apt.status === 'SCHEDULED' || apt.status === 'ARRIVED' || apt.status === 'IN_PROGRESS'
        ).length;

        // Calculate average wait time from in-progress appointments
        const inProgress = appointments.filter((apt: any) => apt.status === 'IN_PROGRESS');
        const avgWaitTime = inProgress.length > 0
          ? Math.round(inProgress.reduce((acc: number, apt: any) => {
              const wait = apt.waitTime || 15; // Default 15 min if not provided
              return acc + wait;
            }, 0) / inProgress.length)
          : 14; // Default average

        return {
          totalPatients: patientsRes.data.total || 0,
          totalPatientsChange: patientsRes.data.change || '+0%',
          todayAppointments: appointments.length || 0,
          remainingAppointments: remaining,
          revenueToday: revenueRes.data.total || 0,
          revenueChange: revenueRes.data.change || '+0%',
          avgWaitTime,
          waitTimeChange: -2, // Hardcoded for now, can be calculated from historical data
        };
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Return default stats on error
        return {
          totalPatients: 0,
          totalPatientsChange: '+0%',
          todayAppointments: 0,
          remainingAppointments: 0,
          revenueToday: 0,
          revenueChange: '+0%',
          avgWaitTime: 0,
          waitTimeChange: 0,
        };
      }
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });
}

// Patient Queue
export function usePatientQueue() {
  return useQuery<PatientQueueItem[], Error>({
    queryKey: ['dashboard', 'queue'],
    queryFn: async () => {
      try {
        // Get appointments that are arrived or in progress
        const response = await apiClient.get('/appointments', {
          params: {
            status: 'ARRIVED,IN_PROGRESS',
            date: format(new Date(), 'yyyy-MM-dd'),
          },
        });

        const appointments = Array.isArray(response.data) ? response.data : [];

        return appointments.map((apt: any) => ({
          id: apt.id,
          appointmentId: apt.id,
          patientId: apt.patientId,
          patientName: apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : 'Unknown',
          firstName: apt.patient?.firstName || '',
          lastName: apt.patient?.lastName || '',
          reason: apt.reason || apt.type || 'General Consultation',
          appointmentTime: apt.appointmentTime || apt.scheduledTime || '',
          status: apt.status,
          waitTime: apt.waitTime,
        }));
      } catch (error) {
        console.error('Error fetching patient queue:', error);
        return [];
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  });
}

// Recent Activity
export function useRecentActivity(limit: number = 5) {
  return useQuery<RecentActivity[], Error>({
    queryKey: ['dashboard', 'activity', limit],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/audit', {
          params: {
            limit,
          },
        });

        const logs = Array.isArray(response.data) ? response.data : response.data.data || [];

        return logs.map((log: any) => ({
          id: log.id,
          type: log.action || log.entityType || 'Activity',
          action: log.action,
          userId: log.userId,
          userName: log.user ? `${log.user.firstName} ${log.user.lastName}` : undefined,
          entityType: log.entityType,
          entityId: log.entityId,
          details: log.details,
          createdAt: log.createdAt,
        }));
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        return [];
      }
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });
}

// Combined dashboard data
export function useDashboard() {
  const stats = useDashboardStats();
  const queue = usePatientQueue();
  const activity = useRecentActivity(5);

  return {
    stats: stats.data,
    queue: queue.data || [],
    activity: activity.data || [],
    isLoading: stats.isLoading || queue.isLoading || activity.isLoading,
    isError: stats.isError || queue.isError || activity.isError,
    refetchAll: () => {
      stats.refetch();
      queue.refetch();
      activity.refetch();
    },
  };
}
