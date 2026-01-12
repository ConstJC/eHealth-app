'use client';

import { Card } from "@/components/ui/card";
import { 
  Users, 
  CalendarCheck, 
  DollarSign, 
  TrendingUp, 
  Activity as ActivityIcon,
  ArrowUpRight,
  Clock,
  FileText,
  UserPlus,
  Stethoscope,
  Pill,
  Receipt,
  ChevronRight,
  History as HistoryIcon
} from "lucide-react";
import { useDashboard } from "@/hooks/queries/use-dashboard";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const { stats, queue, activity, isLoading, isError, refetchAll } = useDashboard();

  // Helper to get initials
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Helper to format time ago
  const getTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-red-500 mb-4">Failed to load dashboard data</div>
        <button 
          onClick={refetchAll}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 mb-1">Dashboard</h1>
          <p className="text-slate-600 text-xs md:text-sm lg:text-base">Welcome back! Here's your clinic overview for today.</p>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2.5 text-xs md:text-sm bg-white px-3 md:px-4 lg:px-5 py-2 md:py-2.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="h-2 w-2 md:h-2.5 md:w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
          <span className="font-semibold text-slate-900">Clinic Open</span>
          <span className="text-slate-400 hidden md:inline">•</span>
          <span className="text-slate-600 hidden md:inline">{currentDate}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard 
          title="Total Patients" 
          value={stats?.totalPatients?.toLocaleString() || '0'} 
          change={stats?.totalPatientsChange || '+0%'} 
          changeLabel="from last month"
          icon={Users}
          trend={stats?.totalPatientsChange?.startsWith('+') ? 'up' : 'down'}
          gradient="from-blue-500 to-blue-600"
        />
        <StatsCard 
          title="Today's Appointments" 
          value={stats?.todayAppointments?.toString() || '0'} 
          change={stats?.remainingAppointments?.toString() || '0'} 
          changeLabel="remaining"
          icon={CalendarCheck}
          trend="neutral"
          gradient="from-purple-500 to-purple-600"
        />
        <StatsCard 
          title="Revenue Today" 
          value={`₱${stats?.revenueToday?.toLocaleString() || '0'}`} 
          change={stats?.revenueChange || '+0%'} 
          changeLabel="vs yesterday"
          icon={Receipt}
          trend={stats?.revenueChange?.startsWith('+') ? 'up' : 'down'}
          gradient="from-emerald-500 to-emerald-600"
        />
        <StatsCard 
          title="Avg Wait Time" 
          value={`${stats?.avgWaitTime || 0} min`} 
          change={`${stats?.waitTimeChange || 0} min`} 
          changeLabel="vs yesterday"
          icon={Clock}
          trend={stats?.waitTimeChange && stats.waitTimeChange < 0 ? 'down' : 'up'}
          gradient="from-amber-500 to-amber-600"
        />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Patient Queue (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-2.5">
              <div className="p-1.5 md:p-2 bg-blue-50 rounded-lg">
                <ActivityIcon className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
              </div>
              <h2 className="text-base md:text-lg lg:text-xl font-bold text-slate-900">Patient Queue</h2>
              <span className="px-2 md:px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] md:text-xs font-semibold rounded-full">
                {queue.length}
              </span>
            </div>
            <button className="text-xs md:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:gap-2 transition-all">
              View All
              <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {queue.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <ActivityIcon className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">No patients in queue</p>
              </div>
            ) : (
              queue.map((patient) => (
                <div 
                  key={patient.id}
                  className="group flex items-center justify-between p-3 md:p-4 lg:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
                    <div className="h-8 w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 rounded-full bg-white border-2 border-blue-500 text-blue-600 flex items-center justify-center font-bold text-xs md:text-sm shadow-sm">
                      {getInitials(patient.firstName, patient.lastName)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm md:text-base mb-0.5">{patient.patientName}</h3>
                      <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-slate-600">
                        <span>{patient.reason}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-400" />
                        <span className="font-medium">{patient.appointmentTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className={`px-2 md:px-3 lg:px-4 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs font-semibold ${getStatusColor(patient.status)}`}>
                      {patient.status.replace('_', ' ')}
                    </span>
                    <button className="p-1.5 md:p-2 lg:p-2.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                      <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div>
            <div className="flex items-center gap-2 md:gap-2.5 mb-3 md:mb-4">
              <div className="p-1.5 md:p-2 bg-purple-50 rounded-lg">
                <Stethoscope className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
              </div>
              <h2 className="text-base md:text-lg lg:text-xl font-bold text-slate-900">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              <QuickAction label="New Patient" icon={UserPlus} color="blue" />
              <QuickAction label="New Visit" icon={Stethoscope} color="purple" />
              <QuickAction label="Prescription" icon={Pill} color="emerald" />
              <QuickAction label="Billing" icon={Receipt} color="amber" />
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center gap-2 md:gap-2.5 mb-3 md:mb-4">
              <div className="p-1.5 md:p-2 bg-orange-50 rounded-lg">
                <HistoryIcon className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
              </div>
              <h2 className="text-base md:text-lg lg:text-xl font-bold text-slate-900">Recent History</h2>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 md:p-4 space-y-2 md:space-y-3">
              {activity.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <HistoryIcon className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs">No recent activity</p>
                </div>
              ) : (
                activity.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 md:gap-3 pb-2 md:pb-3 border-b border-slate-100 last:border-0 last:pb-0 hover:bg-slate-50 -mx-2 px-2 py-2 rounded-lg transition-colors cursor-pointer">
                    <div className="h-9 w-9 md:h-10 md:w-10 lg:h-11 lg:w-11 rounded-xl bg-white border-2 border-orange-500 text-orange-600 flex items-center justify-center shadow-sm">
                      <HistoryIcon className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-semibold text-slate-900 truncate">{item.type}</p>
                      <p className="text-[10px] md:text-xs text-slate-600">
                        {item.userName || 'System'} • {getTimeAgo(item.createdAt)}
                      </p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-400 flex-shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -- Components --

function StatsCard({ title, value, change, changeLabel, icon: Icon, trend, gradient }: any) {
  const isPositive = trend === 'up';
  const isNegative = trend === 'down';
  
  return (
    <Card className="relative p-4 md:p-5 lg:p-6 border-none shadow-sm bg-white hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer">
      {/* Background Gradient Accent */}
      <div className={`absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br ${gradient} opacity-5 rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16 group-hover:opacity-10 transition-opacity`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className={`p-2 md:p-2.5 lg:p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg shadow-${gradient.split('-')[1]}-500/20`}>
            <Icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
          </div>
          {isPositive && (
            <div className="flex items-center gap-0.5 md:gap-1 text-emerald-600 text-xs md:text-sm font-semibold">
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
              {change}
            </div>
          )}
          {isNegative && (
            <div className="flex items-center gap-0.5 md:gap-1 text-emerald-600 text-xs md:text-sm font-semibold">
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 rotate-180" />
              {change}
            </div>
          )}
        </div>
        
        <div className="space-y-0.5 md:space-y-1">
          <p className="text-xs md:text-sm font-medium text-slate-600">{title}</p>
          <p className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
          <p className="text-[10px] md:text-xs text-slate-500">{changeLabel}</p>
        </div>
      </div>
    </Card>
  );
}

function QuickAction({ label, icon: Icon, color }: { label: string; icon: any; color: string }) {
  const colorMap: any = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    emerald: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
    amber: 'from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
  };

  return (
    <button className={`flex flex-col items-center justify-center p-3 md:p-4 lg:p-5 rounded-xl bg-gradient-to-br ${colorMap[color]} text-white shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95`}>
      <Icon className="h-5 w-5 md:h-6 md:w-6 mb-1.5 md:mb-2" />
      <span className="text-xs md:text-sm font-semibold">{label}</span>
    </button>
  );
}

// -- Helper Functions --

function getStatusColor(status: string) {
  switch (status) {
    case 'IN_PROGRESS': return 'bg-blue-500 text-white shadow-sm';
    case 'ARRIVED': return 'bg-emerald-500 text-white shadow-sm';
    case 'SCHEDULED': return 'bg-slate-500 text-white shadow-sm';
    case 'COMPLETED': return 'bg-green-500 text-white shadow-sm';
    case 'CANCELLED': return 'bg-red-500 text-white shadow-sm';
    default: return 'bg-slate-500 text-white shadow-sm';
  }
}
