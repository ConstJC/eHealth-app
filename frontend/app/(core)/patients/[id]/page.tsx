'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usePatient } from '@/hooks/use-patient';
import { useUpdatePatient } from '@/hooks/queries/use-patients';
import { useVisits, useVisit } from '@/hooks/queries/use-visits';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
} from '@/components/ui/sheet';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ErrorMessage } from '@/components/common/error-message';
import { EmptyState } from '@/components/common/empty-state';
import { PatientFormDrawer } from '@/components/features/patients/patient-form-drawer';
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
  FileCheck,
  ChevronDown,
} from 'lucide-react';
import { format } from 'date-fns';
import type { Patient, UpdatePatientInput } from '@/types/patient.types';
import { Gender, PatientStatus } from '@/types/patient.types';

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  const { getPatient, isLoading, error } = usePatient();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);

  const updatePatient = useUpdatePatient();
  const { data: visitsRaw } = useVisits(
    { patientId: patient?.id },
    { enabled: !!patient?.id, refetchInterval: 60000 }
  );
  const visits = (visitsRaw || [])
    .sort((a: any, b: any) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());

  const { data: selectedVisitDetail } = useVisit(selectedVisitId ?? undefined);

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

  const handleEditPatient = () => {
    setIsEditDrawerOpen(true);
  };

  const handleUpdatePatient = async (data: UpdatePatientInput) => {
    if (patient) {
      await updatePatient.mutateAsync({ id: patient.id, data });
      // Refresh patient data after update
      const updatedData = await getPatient(patientId);
      setPatient(updatedData);
    }
  };

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
              <AvatarFallback className="text-lg bg-white border-2 border-blue-500 text-blue-600">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {patient.firstName} {patient.middleName ? `${patient.middleName} ` : ''}{patient.lastName}
                </h1>
                <Badge variant={patient.status === PatientStatus.ACTIVE ? 'default' : 'secondary'} className={`text-xs ${patient.status === PatientStatus.ACTIVE ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200' : ''}`}>
                  {patient.status}
                </Badge>
              </div>
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
            onClick={handleEditPatient}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          
          {/* Certificate Generation Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileCheck className="h-4 w-4 mr-2" />
                Generate Certificate
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => console.log('Generate Medical Clearance')}>
                <FileCheck className="h-4 w-4 mr-2" />
                Medical Clearance
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Generate Sick Leave')}>
                <FileText className="h-4 w-4 mr-2" />
                Sick Leave Certificate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Generate Fitness Certificate')}>
                <Heart className="h-4 w-4 mr-2" />
                Fitness Certificate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => console.log('Generate Medical Report')}>
                <Stethoscope className="h-4 w-4 mr-2" />
                Medical Report
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Generate Prescription')}>
                <Pill className="h-4 w-4 mr-2" />
                Prescription
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => router.push(`/patients/${patient.id}/visits/new`)}>
            <FileText className="h-4 w-4 mr-2" />
            New Visit
          </Button>
        </div>
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
                <span>{format(new Date(patient.createdAt), 'MMM dd, yyyy h:mm a')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span>{format(new Date(patient.updatedAt), 'MMM dd, yyyy h:mm a')}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visits" className="mt-6">
          {visits.length === 0 ? (
            <EmptyState
              title="No visits yet"
              description="Visit history will appear here once visits are created for this patient."
              actionLabel="Create Visit"
              onAction={() => router.push('/visits')}
            />
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Visit History</CardTitle>
                <Button size="sm" variant="outline" onClick={() => router.push('/visits')}>
                  <Stethoscope className="h-4 w-4 mr-1.5" />
                  Create Visit
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {visits.map((visit: any) => (
                    <div
                      key={visit.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50/50 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedVisitId(visit.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white border border-gray-200">
                          <Calendar className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {format(new Date(visit.visitDate), 'MMM dd, yyyy')} at {format(new Date(visit.visitDate), 'h:mm a')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {visit.visitType}
                            {visit.chiefComplaint && ` · ${visit.chiefComplaint}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            visit.status === 'COMPLETED'
                              ? 'default'
                              : visit.status === 'CANCELLED'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {visit.status.replace('_', ' ')}
                        </Badge>
                        <ChevronDown className="h-4 w-4 -rotate-90 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
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

      {/* Visit Details Sheet */}
      <Sheet open={!!selectedVisitId} onOpenChange={(open) => !open && setSelectedVisitId(null)}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Visit Details</SheetTitle>
          </SheetHeader>
          <SheetBody>
            {selectedVisitDetail ? (
              <div className="space-y-6">
                {/* Date, Type, Status */}
                <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="font-medium text-gray-900">
                      {format(new Date(selectedVisitDetail.visitDate), 'EEEE, MMM dd, yyyy')} at {format(new Date(selectedVisitDetail.visitDate), 'h:mm a')}
                    </p>
                    <Badge
                      variant={
                        selectedVisitDetail.status === 'COMPLETED'
                          ? 'default'
                          : selectedVisitDetail.status === 'CANCELLED'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {selectedVisitDetail.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{selectedVisitDetail.visitType}</p>
                  {selectedVisitDetail.doctor && (
                    <p className="text-xs text-gray-500">
                      Dr. {selectedVisitDetail.doctor.firstName} {selectedVisitDetail.doctor.lastName}
                    </p>
                  )}
                </div>

                {/* Chief Complaint */}
                {selectedVisitDetail.chiefComplaint && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Chief Complaint</h4>
                    <p className="text-sm text-gray-800">{selectedVisitDetail.chiefComplaint}</p>
                  </div>
                )}

                {/* Vital Signs */}
                {(selectedVisitDetail.bloodPressureSystolic != null || selectedVisitDetail.heartRate != null || selectedVisitDetail.temperature != null) && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Vital Signs</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                      {(selectedVisitDetail.bloodPressureSystolic != null || selectedVisitDetail.bloodPressureDiastolic != null) && (
                        <span className="text-gray-700">
                          BP: {selectedVisitDetail.bloodPressureSystolic}/{selectedVisitDetail.bloodPressureDiastolic} mmHg
                        </span>
                      )}
                      {selectedVisitDetail.heartRate != null && <span className="text-gray-700">HR: {selectedVisitDetail.heartRate} bpm</span>}
                      {selectedVisitDetail.temperature != null && <span className="text-gray-700">Temp: {selectedVisitDetail.temperature} °C</span>}
                      {selectedVisitDetail.weight != null && <span className="text-gray-700">Weight: {selectedVisitDetail.weight} kg</span>}
                      {selectedVisitDetail.height != null && <span className="text-gray-700">Height: {selectedVisitDetail.height} cm</span>}
                    </div>
                  </div>
                )}

                {/* SOAP Notes */}
                <div className="space-y-4">
                  {selectedVisitDetail.subjective && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Subjective</h4>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedVisitDetail.subjective}</p>
                    </div>
                  )}
                  {selectedVisitDetail.objective && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Objective</h4>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedVisitDetail.objective}</p>
                    </div>
                  )}
                  {selectedVisitDetail.assessment && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Assessment</h4>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedVisitDetail.assessment}</p>
                    </div>
                  )}
                  {selectedVisitDetail.plan && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Plan</h4>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedVisitDetail.plan}</p>
                    </div>
                  )}
                </div>

                {/* Diagnosis */}
                {(selectedVisitDetail.primaryDiagnosis || (selectedVisitDetail.secondaryDiagnoses?.length)) && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Diagnosis</h4>
                    <ul className="text-sm text-gray-800 list-disc list-inside space-y-0.5">
                      {selectedVisitDetail.primaryDiagnosis && <li>{selectedVisitDetail.primaryDiagnosis}</li>}
                      {selectedVisitDetail.secondaryDiagnoses?.map((d: string, i: number) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Follow-up */}
                {(selectedVisitDetail.followUpDate || selectedVisitDetail.followUpReason) && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Follow-up</h4>
                    <p className="text-sm text-gray-800">
                      {selectedVisitDetail.followUpDate && format(new Date(selectedVisitDetail.followUpDate), 'MMM dd, yyyy')}
                      {selectedVisitDetail.followUpReason && ` · ${selectedVisitDetail.followUpReason}`}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            )}
          </SheetBody>
          {selectedVisitDetail && (
            <SheetFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedVisitId(null)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setSelectedVisitId(null);
                  router.push(`/consultation?visitId=${selectedVisitDetail.id}`);
                }}
              >
                <Stethoscope className="h-4 w-4 mr-2" />
                Open in Consultation
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Patient Drawer */}
      <PatientFormDrawer
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        patient={patient || undefined}
        onSubmit={handleUpdatePatient}
        isLoading={updatePatient.isPending}
      />
    </div>
  );
}

