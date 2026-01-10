'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, Receipt, TrendingUp } from 'lucide-react';

export function DashboardContent() {
  // Mock data - will be replaced with real API calls
  const stats = [
    {
      title: 'Total Patients',
      value: '1,234',
      change: '+12%',
      icon: Users,
      color: 'blue',
    },
    {
      title: "Today's Visits",
      value: '45',
      change: '+5%',
      icon: FileText,
      color: 'green',
    },
    {
      title: 'Pending Invoices',
      value: '23',
      change: '-8%',
      icon: Receipt,
      color: 'yellow',
    },
    {
      title: 'Monthly Revenue',
      value: '$45,678',
      change: '+18%',
      icon: TrendingUp,
      color: 'blue',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">
                  <span
                    className={
                      stat.change.startsWith('+')
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {stat.change}
                  </span>{' '}
                  from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-gray-500">Visit #1234</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Jane Smith</p>
                  <p className="text-sm text-gray-500">Visit #1233</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Bob Johnson</p>
                  <p className="text-sm text-gray-500">Visit #1232</p>
                </div>
                <Badge variant="warning">Pending</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                Register New Patient
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                Create New Visit
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                Generate Report
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                View All Invoices
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

