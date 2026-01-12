'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usePatient } from '@/hooks/use-patient';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ErrorMessage } from '@/components/common/error-message';
import { EmptyState } from '@/components/common/empty-state';
import { 
  Edit, 
  FileText, 
  Pill, 
  Receipt, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  Heart,
  Shield,
  Stethoscope,
} from 'lucide-react';
import { format } from 'date-fns';
import type { Patient } from '@/types/patient.types';
import { Gender, PatientStatus } from '@/types/patient.types';

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  const { getPatient, isLoading, error } = usePatient();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const data = await getPatient(patientId);
        setPatient(data);
      } catch (err) {
        console.error('Failed to load patient:', err);
      }
    };

    if (patientId) {
      loadPatient();
    }
  }, [patientId, getPatient]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Patients', href: '/patients' }, { label: 'Patient Details' }]} />
        <ErrorMessage message={error || 'Patient not found'} />
      </div>
    );
  }

  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
  const initials = `${patient.firstName[0]}${patient.lastName[0]}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumbs
            items={[
              { label: 'Patients', href: '/patients' },
              { label: `${patient.firstName} ${patient.lastName}` },
            ]}
          />
          <div className="flex items-center gap-4 mt-2">
            <Avatar className="h-16 w-16">
              <AvatarImage src={patient.photoUrl} alt={`${patient.firstName} ${patient.lastName}`} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {patient.firstName} {patient.middleName ? `${patient.middleName} ` : ''}{patient.lastName}
              </h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                <span className="font-mono">{patient.patientId}</span>
                <span>•</span>
                <span>{age} years old</span>
                <span>•</span>
                <span>{patient.gender}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/patients/${patient.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button onClick={() => router.push(`/patients/${patient.id}/visits/new`)}>
            <FileText className="h-4 w-4 mr-2" />
            New Visit
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={patient.status === PatientStatus.ACTIVE ? 'default' : 'secondary'}>
          {patient.status}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="visits">Visits</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patient.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{patient.phone}</span>
                  </div>
                )}
                {patient.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{patient.email}</span>
                  </div>
                )}
                {patient.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span>{patient.address}</span>
                  </div>
                )}
                {!patient.phone && !patient.email && !patient.address && (
                  <p className="text-sm text-gray-500">No contact information available</p>
                )}
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.emergencyContactName ? (
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {patient.emergencyContactName}
                    </div>
                    {patient.emergencyContactPhone && (
                      <div>
                        <span className="font-medium">Phone:</span> {patient.emergencyContactPhone}
                      </div>
                    )}
                    {patient.emergencyContactRelation && (
                      <div>
                        <span className="font-medium">Relationship:</span> {patient.emergencyContactRelation}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No emergency contact information</p>
                )}
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patient.bloodType && (
                  <div className="text-sm">
                    <span className="font-medium">Blood Type:</span> {patient.bloodType}
                  </div>
                )}
                {patient.allergies && patient.allergies.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium">Allergies:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {patient.allergies.map((allergy, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {patient.chronicConditions && patient.chronicConditions.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium">Chronic Conditions:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {patient.chronicConditions.map((condition, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {patient.currentMedications && patient.currentMedications.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium">Current Medications:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {patient.currentMedications.map((med, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {med}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {patient.familyHistory && (
                  <div className="text-sm">
                    <span className="font-medium">Family History:</span>
                    <p className="mt-1 text-gray-600">{patient.familyHistory}</p>
                  </div>
                )}
                {!patient.bloodType &&
                  (!patient.allergies || patient.allergies.length === 0) &&
                  (!patient.chronicConditions || patient.chronicConditions.length === 0) &&
                  !patient.familyHistory && (
                    <p className="text-sm text-gray-500">No medical information available</p>
                  )}
              </CardContent>
            </Card>

            {/* Insurance Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Insurance Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.insuranceProvider ? (
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Provider:</span> {patient.insuranceProvider}
                    </div>
                    {patient.insuranceNumber && (
                      <div>
                        <span className="font-medium">Policy Number:</span> {patient.insuranceNumber}
                      </div>
                    )}
                    {patient.insurancePolicyExpiry && (
                      <div>
                        <span className="font-medium">Expiry Date:</span>{' '}
                        {format(new Date(patient.insurancePolicyExpiry), 'MMM dd, yyyy')}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No insurance information</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional Notes */}
          {patient.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{patient.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Patient Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Record Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span>{format(new Date(patient.createdAt), 'MMM dd, yyyy HH:mm')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span>{format(new Date(patient.updatedAt), 'MMM dd, yyyy HH:mm')}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visits" className="mt-6">
          <EmptyState
            title="No visits yet"
            description="Visit history will appear here once visits are created for this patient."
            actionLabel="Create Visit"
            onAction={() => router.push(`/patients/${patient.id}/visits/new`)}
          />
        </TabsContent>

        <TabsContent value="prescriptions" className="mt-6">
          <EmptyState
            title="No prescriptions yet"
            description="Prescription history will appear here once prescriptions are created for this patient."
          />
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <EmptyState
            title="No billing records yet"
            description="Billing history will appear here once invoices are created for this patient."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

