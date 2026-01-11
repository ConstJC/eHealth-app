'use client';

import { Card } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  ArrowUpRight, 
  Users, 
  CreditCard,
  Calendar
} from "lucide-react";

const DATA = [
  { name: 'Mon', revenue: 4000, visits: 24 },
  { name: 'Tue', revenue: 3000, visits: 18 },
  { name: 'Wed', revenue: 2000, visits: 12 },
  { name: 'Thu', revenue: 2780, visits: 20 },
  { name: 'Fri', revenue: 1890, visits: 15 },
  { name: 'Sat', revenue: 2390, visits: 16 },
  { name: 'Sun', revenue: 3490, visits: 22 },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground">Detailed insights into clinic performance.</p>
        </div>
        <div className="flex gap-2">
            <button className="px-4 py-2 bg-card border border-border/50 rounded-lg text-sm font-medium hover:bg-secondary transition-colors">Export CSV</button>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Download PDF</button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard title="Total Revenue" value="$45,231.89" change="+20.1% from last month" icon={CreditCard} />
        <KPICard title="New Patients" value="+573" change="+12% from last month" icon={Users} />
        <KPICard title="Total Visits" value="2,340" change="+8% from last month" icon={Calendar} />
      </div>

      {/* Main Chart */}
      <Card className="p-6 border-border/50 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Revenue Overview</h2>
          <p className="text-sm text-muted-foreground">Weekly earnings breakdown</p>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DATA}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'currentColor' }} 
                tickLine={false} 
                axisLine={false} 
                className="text-xs text-muted-foreground" 
              />
              <YAxis 
                tick={{ fill: 'currentColor' }} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `$${value}`}
                className="text-xs text-muted-foreground"
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="revenue" 
                fill="var(--primary)" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function KPICard({ title, value, change, icon: Icon }: any) {
  return (
    <Card className="p-6 border-border/50 shadow-sm flex flex-col justify-between group hover:border-primary/50 transition-colors">
       <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-secondary rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
          </div>
          <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            {change.split(' ')[0]} <ArrowUpRight className="h-3 w-3 ml-1" />
          </span>
       </div>
       <div>
         <p className="text-sm font-medium text-muted-foreground">{title}</p>
         <h3 className="text-2xl font-bold tracking-tight mt-1">{value}</h3>
       </div>
    </Card>
  )
}
