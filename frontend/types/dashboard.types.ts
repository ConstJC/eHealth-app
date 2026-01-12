// Dashboard Statistics Types

export interface DashboardStats {
  totalPatients: number;
  totalPatientsChange: string;
  todayAppointments: number;
  remainingAppointments: number;
  revenueToday: number;
  revenueChange: string;
  avgWaitTime: number;
  waitTimeChange: number;
}

export interface PatientQueueItem {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  firstName: string;
  lastName: string;
  reason: string;
  appointmentTime: string;
  status: 'SCHEDULED' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  waitTime?: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  action: string;
  userId: string;
  userName?: string;
  entityType: string;
  entityId: string;
  details?: string;
  createdAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  patientQueue: PatientQueueItem[];
  recentActivity: RecentActivity[];
}
