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
        const [patientsRes, visitsRes, revenueRes] = await Promise.all([
          apiClient.get('/reports/administrative/patient-census').catch(() => ({ data: { total: 0, change: '0%' } })),
          apiClient.get(`/visits?startDate=${today}&endDate=${today}`).catch(() => ({ data: { data: [] } })),
          apiClient.get(`/reports/financial/daily?date=${today}`).catch(() => ({ data: { total: 0, change: '0%' } })),
        ]);

        // Visits API returns { data: [], meta: {} } structure
        const visits = Array.isArray(visitsRes.data) 
          ? visitsRes.data 
          : Array.isArray(visitsRes.data?.data) 
            ? visitsRes.data.data 
            : [];
        
        const completedToday = visits.filter((visit: any) => visit.status === 'COMPLETED').length;
        const remaining = visits.filter((visit: any) => visit.status === 'IN_PROGRESS').length;

        // Calculate average wait time from in-progress visits
        const inProgress = visits.filter((visit: any) => visit.status === 'IN_PROGRESS');
        const avgWaitTime = inProgress.length > 0
          ? Math.round(inProgress.reduce((acc: number, visit: any) => {
              // Calculate wait time from visit date if available
              if (visit.visitDate) {
                const waitMinutes = Math.floor((new Date().getTime() - new Date(visit.visitDate).getTime()) / 60000);
                return acc + (waitMinutes > 0 ? waitMinutes : 15);
              }
              return acc + 15; // Default 15 min if not provided
            }, 0) / inProgress.length)
          : 14; // Default average

        return {
          totalPatients: patientsRes.data.total || 0,
          totalPatientsChange: patientsRes.data.change || '+0%',
          todayVisits: visits.length || 0,
          remainingVisits: remaining,
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
          todayVisits: 0,
          remainingVisits: 0,
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

// Patient Queue: visits IN_PROGRESS for today (same as Active Consultations)
export function usePatientQueue() {
  return useQuery<PatientQueueItem[], Error>({
    queryKey: ['dashboard', 'queue'],
    queryFn: async () => {
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        const response = await apiClient.get<{ data?: any[] }>('/visits', {
          params: {
            status: 'IN_PROGRESS',
            startDate: today,
            endDate: today,
          },
        });

        const visits = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];

        const todayDate = new Date();
        const filtered = visits.filter((visit: any) => {
          const visitDate = new Date(visit.visitDate);
          return visitDate.toDateString() === todayDate.toDateString();
        });

        const sorted = filtered.sort(
          (a: any, b: any) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime()
        );

        return sorted.map((visit: any) => {
          const patient = visit.patient || {};
          const patientName = patient.firstName && patient.lastName
            ? `${patient.firstName} ${patient.lastName}`
            : 'Unknown';
          return {
            id: visit.id,
            appointmentId: visit.id,
            patientId: visit.patientId,
            patientName,
            firstName: patient.firstName || '',
            lastName: patient.lastName || '',
            reason: visit.chiefComplaint || visit.visitType || 'Consultation',
            appointmentTime: visit.visitDate,
            status: visit.status,
            waitTime: visit.visitDate
              ? Math.floor((Date.now() - new Date(visit.visitDate).getTime()) / 60000)
              : undefined,
          };
        });
      } catch (error) {
        console.error('Error fetching patient queue:', error);
        return [];
      }
    },
    refetchInterval: 15000, // Match consultation page refresh
    staleTime: 15000,
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
