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

export default function DashboardPage() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-1">Dashboard</h1>
          <p className="text-slate-600 text-base">Welcome back! Here's your clinic overview for today.</p>
        </div>
        <div className="flex items-center gap-2.5 text-sm bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
          <span className="font-semibold text-slate-900">Clinic Open</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-600">{currentDate}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard 
          title="Total Patients" 
          value="1,284" 
          change="+12.5%" 
          changeLabel="from last month"
          icon={Users}
          trend="up"
          gradient="from-blue-500 to-blue-600"
        />
        <StatsCard 
          title="Today's Appointments" 
          value="24" 
          change="8" 
          changeLabel="remaining"
          icon={CalendarCheck}
          trend="neutral"
          gradient="from-purple-500 to-purple-600"
        />
        <StatsCard 
          title="Revenue Today" 
          value="₱3,450" 
          change="+5.2%" 
          changeLabel="vs yesterday"
          icon={Receipt}
          trend="up"
          gradient="from-emerald-500 to-emerald-600"
        />
        <StatsCard 
          title="Avg Wait Time" 
          value="14 min" 
          change="-2 min" 
          changeLabel="improvement"
          icon={Clock}
          trend="down"
          gradient="from-amber-500 to-amber-600"
        />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Patient Queue (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ActivityIcon className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Patient Queue</h2>
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
                {DUMMY_QUEUE.length}
              </span>
            </div>
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:gap-2 transition-all">
              View All
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {DUMMY_QUEUE.map((patient, i) => (
              <div 
                key={i}
                className="group flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20">
                    {patient.initials}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-base mb-0.5">{patient.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span>{patient.reason}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-400" />
                      <span className="font-medium">{patient.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${getStatusColor(patient.status)}`}>
                    {patient.status}
                  </span>
                  <button className="p-2.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                    <ArrowUpRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Stethoscope className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <QuickAction label="New Patient" icon={UserPlus} color="blue" />
              <QuickAction label="New Visit" icon={Stethoscope} color="purple" />
              <QuickAction label="Prescription" icon={Pill} color="emerald" />
              <QuickAction label="Billing" icon={Receipt} color="amber" />
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-orange-50 rounded-lg">
                <HistoryIcon className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Recent Patient History</h2>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
              {RECENT_HISTORY.map((item, i) => (
                <div key={i} className="flex items-center gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0 hover:bg-slate-50 -mx-2 px-2 py-2 rounded-lg transition-colors cursor-pointer">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-white flex items-center justify-center shadow-sm">
                    <HistoryIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{item.type}</p>
                    <p className="text-xs text-slate-600">{item.patient} • {item.time}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                </div>
              ))}
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
    <Card className="relative p-6 border-none shadow-sm bg-white hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer">
      {/* Background Gradient Accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 rounded-full -mr-16 -mt-16 group-hover:opacity-10 transition-opacity`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg shadow-${gradient.split('-')[1]}-500/20`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          {isPositive && (
            <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
              <TrendingUp className="h-4 w-4" />
              {change}
            </div>
          )}
          {isNegative && (
            <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
              <TrendingUp className="h-4 w-4 rotate-180" />
              {change}
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
          <p className="text-xs text-slate-500">{changeLabel}</p>
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
    <button className={`flex flex-col items-center justify-center p-5 rounded-xl bg-gradient-to-br ${colorMap[color]} text-white shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95`}>
      <Icon className="h-6 w-6 mb-2" />
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

// -- Data --

const DUMMY_QUEUE = [
  { name: "Eleanor Rigby", initials: "ER", reason: "Follow-up", time: "10:00 AM", status: "In Consultation" },
  { name: "John Wick", initials: "JW", reason: "Emergency", time: "10:30 AM", status: "Waiting" },
  { name: "Sarah Connor", initials: "SC", reason: "Lab Results", time: "10:45 AM", status: "Checked In" },
  { name: "Bruce Wayne", initials: "BW", reason: "General Checkup", time: "11:00 AM", status: "Confirmed" },
];

const RECENT_HISTORY = [
  { type: "Consultation", patient: "Sarah Connor", time: "2h ago" },
  { type: "Follow-up", patient: "John Wick", time: "4h ago" },
  { type: "Laboratory", patient: "Eleanor Rigby", time: "5h ago" },
];

function getStatusColor(status: string) {
  switch (status) {
    case 'In Consultation': return 'bg-blue-500 text-white shadow-sm';
    case 'Waiting': return 'bg-amber-500 text-white shadow-sm';
    case 'Checked In': return 'bg-emerald-500 text-white shadow-sm';
    default: return 'bg-slate-500 text-white shadow-sm';
  }
}
