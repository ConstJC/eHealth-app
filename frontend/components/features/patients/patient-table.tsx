'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MoreVertical, User, Calendar } from 'lucide-react';
import { calculateAge, formatPatientId, formatDate, formatPhone } from '@/lib/formatters';
import type { Patient } from '@/types/patient.types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PatientTableProps {
  patients: Patient[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onNewVisit?: (id: string) => void;
}

export function PatientTable({ patients, onView, onEdit, onNewVisit }: PatientTableProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-[200px]">Patient</TableHead>
            <TableHead className="w-[120px]">Patient ID</TableHead>
            <TableHead className="w-[100px]">Date of Birth</TableHead>
            <TableHead className="w-[80px]">Age</TableHead>
            <TableHead className="w-[100px]">Gender</TableHead>
            <TableHead className="w-[150px]">Contact</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[120px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => {
            const age = calculateAge(patient.dateOfBirth);
            const initials = `${patient.firstName[0]}${patient.lastName[0]}`;
            const statusVariant = patient.status === 'ACTIVE' ? 'success' : 'outline';

            return (
              <TableRow key={patient.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Link href={`/patients/${patient.id}`}>
                      <Avatar
                        src={patient.photoUrl}
                        alt={`${patient.firstName} ${patient.lastName}`}
                        fallback={initials}
                        size="sm"
                      />
                    </Link>
                    <div className="min-w-0">
                      <Link href={`/patients/${patient.id}`}>
                        <div className="font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate">
                          {patient.firstName} {patient.lastName}
                        </div>
                      </Link>
                      {patient.email && (
                        <div className="text-sm text-gray-500 truncate">{patient.email}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600 font-mono">
                    {formatPatientId(patient.patientId)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-700">
                    {formatDate(patient.dateOfBirth)}
                  </span>
                </TableCell>
                <TableCell>
                  {age !== null ? (
                    <span className="text-sm text-gray-700">{age} yrs</span>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-700 capitalize">
                    {patient.gender.toLowerCase()}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {patient.phone && (
                      <div className="text-sm text-gray-700">{formatPhone(patient.phone)}</div>
                    )}
                    {patient.address && (
                      <div className="text-xs text-gray-500 truncate max-w-[140px]">
                        {patient.address}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant} className="text-xs">
                    {patient.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-gray-900">
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

