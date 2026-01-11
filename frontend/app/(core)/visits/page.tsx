'use client';

import { 
  ClipboardList, 
  Search, 
  UserPlus, 
  Thermometer, 
  Heart, 
  Scale, 
  ArrowRight,
  Stethoscope,
  Weight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

// Dummy Data for Intake Queue (Patients waiting for Triage)
const INTAKE_QUEUE = [
  { id: 1, name: "John Wick", time: "10:00 AM", status: "Waiting", reason: "Injury", age: 45, gender: "Male" },
  { id: 2, name: "Sarah Connor", time: "10:15 AM", status: "Waiting", reason: "Checkup", age: 35, gender: "Female" },
  { id: 3, name: "Diana Prince", time: "10:30 AM", status: "Arrived", reason: "Dermatology", age: 28, gender: "Female" },
  { id: 4, name: "Clark Kent", time: "10:45 AM", status: "Scheduled", reason: "Vision", age: 34, gender: "Male" },
];

export default function VisitsIntakePage() {
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1 flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-blue-600" />
            Triage & Vitals
          </h1>
          <p className="text-slate-600 text-base">Patient Intake</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">
             <Search className="mr-2 h-4 w-4" />
             Find Patient
           </Button>
           <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
             <UserPlus className="mr-2 h-4 w-4" />
             Walk-in Registration
           </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        
        {/* LEFT: Waiting List */}
        <Card className="lg:col-span-1 border-slate-200 shadow-sm bg-white flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-800 text-lg">Waiting Station</h2>
            <p className="text-xs text-slate-500">Patients waiting for intake</p>
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input placeholder="Filter queue..." className="pl-9 bg-white border-slate-200" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {INTAKE_QUEUE.map((patient) => (
              <div 
                key={patient.id}
                onClick={() => setSelectedPatient(patient.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedPatient === patient.id
                    ? 'bg-blue-50 border-blue-200 shadow-md ring-1 ring-blue-500/20' 
                    : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`font-bold text-base ${selectedPatient === patient.id ? 'text-blue-700' : 'text-slate-900'}`}>
                    {patient.name}
                  </span>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal">
                    {patient.time}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                   <span>{patient.age}y</span>
                   <span>•</span>
                   <span>{patient.gender}</span>
                   <span>•</span>
                   <span className="text-slate-700 font-medium">{patient.reason}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                   <Badge className={`${
                     patient.status === 'Waiting' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                   } border-none shadow-none`}>
                     {patient.status}
                   </Badge>
                   {selectedPatient === patient.id && (
                     <span className="text-xs font-semibold text-blue-600 flex items-center animate-pulse">
                       Taking Vitals <ArrowRight className="h-3 w-3 ml-1" />
                     </span>
                   )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* RIGHT: Vitals Input Form */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {selectedPatient ? (
            <Card className="flex-1 p-6 border-slate-200 shadow-sm bg-white flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Record Vitals</h2>
                  <p className="text-slate-500">Recording intake for <strong className="text-slate-900">
                    {INTAKE_QUEUE.find(p => p.id === selectedPatient)?.name}
                  </strong></p>
                </div>
                <Badge variant="outline" className="text-xs border-blue-200 bg-blue-50 text-blue-700 px-3 py-1">
                  Step 1 of 2
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                {/* Blood Pressure */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <div className="p-1.5 bg-red-50 rounded text-red-600"><Heart className="h-4 w-4" /></div>
                    Blood Pressure
                  </label>
                  <div className="flex gap-2 items-center">
                    <Input className="text-lg font-mono font-medium h-12 border-slate-200 focus:border-red-400 focus:ring-red-400/20" placeholder="120" />
                    <span className="text-xl text-slate-300">/</span>
                    <Input className="text-lg font-mono font-medium h-12 border-slate-200 focus:border-red-400 focus:ring-red-400/20" placeholder="80" />
                    <span className="text-sm text-slate-400 font-medium ml-1">mmHg</span>
                  </div>
                </div>

                {/* Heart Rate */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <div className="p-1.5 bg-rose-50 rounded text-rose-600"><ActivityPulseIcon className="h-4 w-4" /></div>
                    Heart Rate
                  </label>
                  <div className="relative">
                    <Input className="text-lg font-mono font-medium h-12 pl-4 pr-12 border-slate-200 focus:border-rose-400 focus:ring-rose-400/20" placeholder="72" />
                    <span className="absolute right-4 top-3.5 text-sm text-slate-400 font-medium">bpm</span>
                  </div>
                </div>

                {/* Temperature */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <div className="p-1.5 bg-orange-50 rounded text-orange-600"><Thermometer className="h-4 w-4" /></div>
                    Temperature
                  </label>
                  <div className="relative">
                    <Input className="text-lg font-mono font-medium h-12 pl-4 pr-12 border-slate-200 focus:border-orange-400 focus:ring-orange-400/20" placeholder="36.5" />
                    <span className="absolute right-4 top-3.5 text-sm text-slate-400 font-medium">°C</span>
                  </div>
                </div>

                {/* Weight */}
                <div className="space-y-2">
                   <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-50 rounded text-indigo-600"><Weight className="h-4 w-4" /></div>
                    Weight
                  </label>
                  <div className="relative">
                    <Input className="text-lg font-mono font-medium h-12 pl-4 pr-12 border-slate-200 focus:border-indigo-400 focus:ring-indigo-400/20" placeholder="70" />
                    <span className="absolute right-4 top-3.5 text-sm text-slate-400 font-medium">kg</span>
                  </div>
                </div>
                
                {/* Height */}
                <div className="space-y-2">
                   <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 rounded text-blue-600"><Scale className="h-4 w-4" /></div>
                    Height
                  </label>
                  <div className="relative">
                    <Input className="text-lg font-mono font-medium h-12 pl-4 pr-12 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20" placeholder="170" />
                    <span className="absolute right-4 top-3.5 text-sm text-slate-400 font-medium">cm</span>
                  </div>
                </div>

              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="space-y-3">
                   <label className="text-sm font-semibold text-slate-700">Initial Notes / Complaints (Nurse)</label>
                   <textarea className="w-full h-28 rounded-xl border-slate-200 p-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm resize-none" placeholder="Patient complains of..." />
                </div>
              </div>

              <div className="mt-auto pt-6 flex justify-end gap-4">
                 <Button variant="ghost" size="lg" className="text-slate-500">Cancel</Button>
                 <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 px-8 text-base h-12 rounded-xl">
                   <Stethoscope className="mr-2 h-5 w-5" />
                   Send to Doctor
                 </Button>
              </div>

            </Card>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 p-12 text-center">
               <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                 <ClipboardList className="h-10 w-10 text-slate-300" />
               </div>
               <h3 className="text-xl font-bold text-slate-700 mb-2">No Patient Selected</h3>
               <p className="max-w-sm mx-auto">Select a patient from the waiting room list to start recording their vitals and intake information.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityPulseIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
