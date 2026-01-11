'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Shield, 
  Menu,
  Plus,
  Search,
  MoreVertical,
  Activity
} from "lucide-react";

type SettingsSection = 'users' | 'roles' | 'menus';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsSection>('users');

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">System Settings</h1>
          <p className="text-slate-600">Configure administrative access, roles, and navigation menus.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 rounded-xl px-5 h-11 transition-all cursor-pointer">
          <Plus className="h-5 w-5 mr-2" />
          Add {activeTab === 'users' ? 'User' : activeTab === 'roles' ? 'Role' : 'Menu Item'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <nav className="flex flex-col space-y-2">
          <SettingsLink 
            icon={Users} 
            label="User Management" 
            active={activeTab === 'users'} 
            onClick={() => setActiveTab('users')}
          />
          <SettingsLink 
            icon={Shield} 
            label="Roles & Permissions" 
            active={activeTab === 'roles'} 
            onClick={() => setActiveTab('roles')}
          />
          <SettingsLink 
            icon={Menu} 
            label="Navigation Menus" 
            active={activeTab === 'menus'} 
            onClick={() => setActiveTab('menus')}
          />
        </nav>

        {/* Dynamic Content Section */}
        <div className="md:col-span-3 space-y-6">
          <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 capitalize">{activeTab} List</h2>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder={`Search ${activeTab}...`} 
                  className="pl-9 h-9 bg-white border-slate-200 text-sm w-64 rounded-lg focus:ring-2 focus:ring-blue-500/10" 
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {activeTab === 'users' && <UsersTable />}
              {activeTab === 'roles' && <RolesTable />}
              {activeTab === 'menus' && <MenusTable />}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SettingsLink({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
      }`}
    >
      <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-slate-400'}`} />
      {label}
    </button>
  );
}

// --- Placeholder Tables for Interactivity ---

function UsersTable() {
  const users = [
    { name: 'Dr. John Smith', email: 'dr.smith@example.com', role: 'DOCTOR', status: 'Active' },
    { name: 'Admin User', email: 'admin@example.com', role: 'ADMIN', status: 'Active' },
    { name: 'Nurse Williams', email: 'nurse.williams@example.com', role: 'NURSE', status: 'Active' },
  ];

  return (
    <table className="w-full text-sm">
      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
        <tr>
          <th className="px-6 py-4 text-left">Name</th>
          <th className="px-6 py-4 text-left">Role</th>
          <th className="px-6 py-4 text-left">Status</th>
          <th className="px-6 py-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {users.map((u, i) => (
          <tr key={i} className="hover:bg-slate-50 transition-colors group cursor-pointer">
            <td className="px-6 py-4">
              <div className="font-bold text-slate-900">{u.name}</div>
              <div className="text-xs text-slate-500">{u.email}</div>
            </td>
            <td className="px-6 py-4">
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold border border-blue-100 uppercase tracking-wider">{u.role}</span>
            </td>
            <td className="px-6 py-4">
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {u.status}
              </span>
            </td>
            <td className="px-6 py-4 text-right">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 cursor-pointer">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RolesTable() {
  const roles = [
    { name: 'ADMIN', permissions: 'Full System Access', users: 1 },
    { name: 'DOCTOR', permissions: 'Clinical + Patient Records', users: 4 },
    { name: 'NURSE', permissions: 'Intake + Vitals Only', users: 3 },
  ];

  return (
    <table className="w-full text-sm">
      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
        <tr>
          <th className="px-6 py-4 text-left">Role Name</th>
          <th className="px-6 py-4 text-left">Scope</th>
          <th className="px-6 py-4 text-left">Assigned Users</th>
          <th className="px-6 py-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {roles.map((r, i) => (
          <tr key={i} className="hover:bg-slate-50 transition-colors group cursor-pointer">
            <td className="px-6 py-4 font-bold text-slate-900">{r.name}</td>
            <td className="px-6 py-4 text-slate-600">{r.permissions}</td>
            <td className="px-6 py-4 font-semibold text-slate-700">{r.users}</td>
            <td className="px-6 py-4 text-right">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 cursor-pointer">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MenusTable() {
  const menus = [
    { label: 'Dashboard', href: '/dashboard', rolesCount: 4 },
    { label: 'Patients', href: '/patients', rolesCount: 4 },
    { label: 'Consultation', href: '/consultation', rolesCount: 2 },
  ];

  return (
    <table className="w-full text-sm">
      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
        <tr>
          <th className="px-6 py-4 text-left">Menu Label</th>
          <th className="px-6 py-4 text-left">Route Path</th>
          <th className="px-6 py-4 text-left">Access Scopes</th>
          <th className="px-6 py-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {menus.map((m, i) => (
          <tr key={i} className="hover:bg-slate-50 transition-colors group cursor-pointer">
            <td className="px-6 py-4 font-bold text-slate-900">{m.label}</td>
            <td className="px-6 py-4 font-mono text-xs text-blue-600 bg-blue-50/50 rounded inline-block my-3 ml-6">{m.href}</td>
            <td className="px-6 py-4">
              <span className="text-slate-600 font-medium">{m.rolesCount} Roles Assigned</span>
            </td>
            <td className="px-6 py-4 text-right">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 cursor-pointer">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
