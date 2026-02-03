'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ErrorMessage } from '@/components/common/error-message';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Heart,
  Stethoscope,
  Shield,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import type { Patient } from '@/types/patient.types';
import { PatientStatus } from '@/types/patient.types';

interface PatientDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  isLoading?: boolean;
  error?: string | null;
}

export function PatientDetailsDrawer({
  open,
  onOpenChange,
  patient,
  isLoading = false,
  error = null,
}: PatientDetailsDrawerProps) {
  if (!open) return null;

  const age = patient
    ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
    : 0;
  const initials = patient
    ? `${patient.firstName[0]}${patient.lastName[0]}`
    : '';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Patient Details</SheetTitle>
          <SheetDescription>
            View complete patient information and medical records.
          </SheetDescription>
        </SheetHeader>

        <SheetBody>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : error || !patient ? (
            <ErrorMessage message={error || 'Patient not found'} />
          ) : (
            <div className="space-y-6">
              {/* Patient Header */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={patient.photoUrl}
                    alt={`${patient.firstName} ${patient.lastName}`}
                  />
                  <AvatarFallback className="text-lg bg-white border-2 border-blue-500 text-blue-600">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-bold text-gray-900 truncate">
                      {patient.firstName}{' '}
                      {patient.middleName ? `${patient.middleName} ` : ''}
                      {patient.lastName}
                    </h2>
                    <Badge
                      variant={
                        patient.status === PatientStatus.ACTIVE
                          ? 'default'
                          : 'secondary'
                      }
                      className={`text-xs ${
                        patient.status === PatientStatus.ACTIVE
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200'
                          : ''
                      }`}
                    >
                      {patient.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <span className="font-mono">{patient.patientId}</span>
                    <span>•</span>
                    <span>{age} years old</span>
                    <span>•</span>
                    <span>{patient.gender}</span>
                    {patient.dateOfBirth && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(patient.dateOfBirth), 'MMM dd, yyyy')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-4 w-4" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {patient.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                      <span>{patient.phone}</span>
                    </div>
                  )}
                  {patient.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="break-all">{patient.email}</span>
                    </div>
                  )}
                  {patient.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                      <span>{patient.address}</span>
                    </div>
                  )}
                  {!patient.phone && !patient.email && !patient.address && (
                    <p className="text-sm text-gray-500">
                      No contact information available
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Heart className="h-4 w-4" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.emergencyContactName ? (
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Name:</span>{' '}
                        {patient.emergencyContactName}
                      </div>
                      {patient.emergencyContactPhone && (
                        <div>
                          <span className="font-medium">Phone:</span>{' '}
                          {patient.emergencyContactPhone}
                        </div>
                      )}
                      {patient.emergencyContactRelation && (
                        <div>
                          <span className="font-medium">Relationship:</span>{' '}
                          {patient.emergencyContactRelation}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No emergency contact information
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Medical Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Stethoscope className="h-4 w-4" />
                    Medical Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {patient.bloodType && (
                    <div className="text-sm">
                      <span className="font-medium">Blood Type:</span>{' '}
                      {patient.bloodType}
                    </div>
                  )}
                  {patient.allergies && patient.allergies.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Allergies:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {patient.allergies.map((allergy, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {patient.chronicConditions &&
                    patient.chronicConditions.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">Chronic Conditions:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {patient.chronicConditions.map((condition, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  {patient.currentMedications &&
                    patient.currentMedications.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">Current Medications:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {patient.currentMedications.map((med, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {med}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  {patient.familyHistory && (
                    <div className="text-sm">
                      <span className="font-medium">Family History:</span>
                      <p className="mt-1 text-gray-600">
                        {patient.familyHistory}
                      </p>
                    </div>
                  )}
                  {!patient.bloodType &&
                    (!patient.allergies || patient.allergies.length === 0) &&
                    (!patient.chronicConditions ||
                      patient.chronicConditions.length === 0) &&
                    !patient.familyHistory && (
                      <p className="text-sm text-gray-500">
                        No medical information available
                      </p>
                    )}
                </CardContent>
              </Card>

              {/* Insurance Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="h-4 w-4" />
                    Insurance Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.insuranceProvider ? (
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Provider:</span>{' '}
                        {patient.insuranceProvider}
                      </div>
                      {patient.insuranceNumber && (
                        <div>
                          <span className="font-medium">Policy Number:</span>{' '}
                          {patient.insuranceNumber}
                        </div>
                      )}
                      {patient.insurancePolicyExpiry && (
                        <div>
                          <span className="font-medium">Expiry Date:</span>{' '}
                          {format(
                            new Date(patient.insurancePolicyExpiry),
                            'MMM dd, yyyy'
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No insurance information
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Additional Notes */}
              {patient.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Additional Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {patient.notes}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Patient Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Record Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span>
                      {format(new Date(patient.createdAt), 'MMM dd, yyyy h:mm a')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span>
                      {format(new Date(patient.updatedAt), 'MMM dd, yyyy h:mm a')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
