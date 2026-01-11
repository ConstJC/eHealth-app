'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill, AlertTriangle, Plus, Search } from "lucide-react";

export default function PrescriptionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Prescription Management</h1>
          <p className="text-muted-foreground">Manage active prescriptions and medication history.</p>
        </div>
        <Button className="bg-primary hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          New Prescription
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6 border-border/50 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Active Medications</h3>
              <p className="text-sm text-muted-foreground">Patient: Eleanor Rigby</p>
            </div>
          </div>

          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                  Rx
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-foreground">Amoxicillin 500mg</h4>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Active</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Take 1 capsule every 8 hours for 7 days.</p>
                  <div className="flex items-center gap-4 mt-3 text-xs font-medium text-muted-foreground">
                    <span>Qty: 21</span>
                    <span>Refills: 0</span>
                    <span>Dr. Smith</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Alerts / Interactions */}
        <Card className="p-6 border-red-200 bg-red-50 text-red-900 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
             <AlertTriangle className="h-5 w-5 text-red-600" />
             <h3 className="font-bold">Drug Interaction Alerts</h3>
          </div>
          <p className="text-sm mb-4">
            Warnings for active prescriptions based on patient allergies and known interactions.
          </p>
          <div className="p-4 bg-white rounded-lg border border-red-100 shadow-sm">
            <p className="text-sm font-semibold text-red-700">Allergy Warning</p>
            <p className="text-sm text-gray-600 mt-1">Patient has a reported allergy to <span className="font-bold">Penicillin</span>. Please verify Amoxicillin prescription.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
