'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserPlus, 
  Phone,
  Calendar,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

const PATIENTS = [
  { id: 1, name: "Eleanor Rigby", age: 72, gender: "Female", phone: "+1 (555) 012-3456", lastVisit: "24 Oct, 2024", condition: "Hypertension", status: "Active" },
  { id: 2, name: "John Wick", age: 45, gender: "Male", phone: "+1 (555) 098-7654", lastVisit: "20 Oct, 2024", condition: "General Checkup", status: "Active" },
  { id: 3, name: "Sarah Connor", age: 35, gender: "Female", phone: "+1 (555) 123-4567", lastVisit: "18 Oct, 2024", condition: "Pregnancy", status: "Active" },
  { id: 4, name: "Bruce Wayne", age: 42, gender: "Male", phone: "+1 (555) 999-8888", lastVisit: "15 Oct, 2024", condition: "Orthopedic", status: "Archived" },
  { id: 5, name: "Diana Prince", age: 28, gender: "Female", phone: "+1 (555) 777-6666", lastVisit: "10 Oct, 2024", condition: "Dermatology", status: "Active" },
  { id: 6, name: "Clark Kent", age: 34, gender: "Male", phone: "+1 (555) 555-0199", lastVisit: "08 Oct, 2024", condition: "Vision Check", status: "Active" },
];

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = PATIENTS.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">Patients</h1>
          <p className="text-slate-600 text-base">Manage patient records, history, and demographics.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 px-5 h-11 rounded-xl transition-all">
          <UserPlus className="mr-2 h-5 w-5" />
          Add New Patient
        </Button>
      </div>

      {/* Filters & Search */}
      <Card className="p-1.5 border border-slate-200 shadow-sm bg-white rounded-2xl">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="Search by name, phone, or ID..." 
              className="pl-12 h-12 bg-slate-50 border-none focus-visible:ring-0 focus-visible:bg-slate-100 placeholder:text-slate-400 text-base rounded-xl transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="ghost" className="h-12 px-6 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl">
            <Filter className="mr-2 h-5 w-5" />
            <span>Filters</span>
          </Button>
        </div>
      </Card>

      {/* Table List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-5 text-left font-semibold text-slate-600 text-sm">Patient Name</th>
                <th className="px-6 py-5 text-left font-semibold text-slate-600 text-sm">Demographics</th>
                <th className="px-6 py-5 text-left font-semibold text-slate-600 text-sm">Contact</th>
                <th className="px-6 py-5 text-left font-semibold text-slate-600 text-sm">Last Visit</th>
                <th className="px-6 py-5 text-left font-semibold text-slate-600 text-sm">Status</th>
                <th className="px-6 py-5 text-right font-semibold text-slate-600 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((patient) => (
                <tr key={patient.id} className="group hover:bg-slate-50/80 transition-colors cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-base">{patient.name}</div>
                        <div className="text-sm text-slate-500 font-medium">ID: #{1000 + patient.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{patient.age} Years</div>
                    <div className="text-sm text-slate-500">{patient.gender}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <div className="p-1.5 bg-slate-100 rounded-lg">
                        <Phone className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-medium">{patient.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5 text-slate-900">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="font-medium">{patient.lastVisit}</span>
                    </div>
                    <div className="text-xs font-semibold text-blue-600 mt-1 ml-6.5">{patient.condition}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                      patient.status === 'Active' 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-500 text-white'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="p-16 text-center text-slate-500">
            <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No patients found</h3>
            <p>We couldn't find any patients matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
