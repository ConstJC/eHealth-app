'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, User, Calendar } from 'lucide-react';
import { calculateAge, formatDate, formatPatientId } from '@/lib/formatters';
import type { Patient, PatientStatus } from '@/types/patient.types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PatientCardProps {
  patient: Patient;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onNewVisit?: (id: string) => void;
}

export function PatientCard({ patient, onView, onEdit, onNewVisit }: PatientCardProps) {
  const age = calculateAge(patient.dateOfBirth);
  const initials = `${patient.firstName[0]}${patient.lastName[0]}`;
  const statusVariant = patient.status === 'ACTIVE' ? 'success' : 'outline';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Link href={`/patients/${patient.id}`}>
              <Avatar
                src={patient.photoUrl}
                alt={`${patient.firstName} ${patient.lastName}`}
                fallback={initials}
                size="md"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/patients/${patient.id}`}>
                <h3 className="font-semibold text-lg truncate hover:text-blue-600 transition-colors">
                  {patient.firstName} {patient.lastName}
                </h3>
              </Link>
              <p className="text-sm text-gray-500 font-mono">
                {formatPatientId(patient.patientId)}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {age !== null && (
                  <span className="text-sm text-gray-600">
                    {age} yrs
                  </span>
                )}
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-600 capitalize">
                  {patient.gender.toLowerCase()}
                </span>
                <Badge variant={statusVariant} className="text-xs">
                  {patient.status}
                </Badge>
              </div>
              {patient.phone && (
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {patient.phone}
                </p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(patient.id)}>
                <User className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(patient.id)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNewVisit?.(patient.id)}>
                <Calendar className="h-4 w-4 mr-2" />
                New Visit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

