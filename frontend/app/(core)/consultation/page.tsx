'use client';

import { 
  Stethoscope, 
  ChevronRight,
  AlertCircle,
  History as HistoryIcon,
  FileText,
  User,
  CheckCircle2,
  ShieldCheck,
  ClipboardList,
  Plus,
  X,
  Trash2,
  Pill,
  AlertTriangle,
  Eye,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useVisits, useUpdateVisit, useCompleteVisit, useCancelVisit } from "@/hooks/queries/use-visits";
import { useCertificates } from "@/hooks/use-certificates";
import { 
  useVisitPrescriptions, 
  useCreatePrescription, 
  useDiscontinuePrescription,
  CreatePrescriptionInput 
} from "@/hooks/queries/use-prescriptions";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { format } from "date-fns";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { PatientDetailsDrawer } from "@/components/features/patients/patient-details-drawer";
import { usePatient } from "@/hooks/use-patient";
import type { Patient } from "@/types/patient.types";

export default function ConsultationPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("soap");
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [selectedCertType, setSelectedCertType] = useState<string | null>(null);
  
  const [soapData, setSoapData] = useState({
    chiefComplaint: '',
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });

  // Review of Systems (ROS) checklist
  const [rosChecklist, setRosChecklist] = useState<Record<string, { checked: boolean; notes: string }>>({
    constitutional: { checked: false, notes: '' },
    cardiovascular: { checked: false, notes: '' },
    respiratory: { checked: false, notes: '' },
    gastrointestinal: { checked: false, notes: '' },
    genitourinary: { checked: false, notes: '' },
    musculoskeletal: { checked: false, notes: '' },
    neurological: { checked: false, notes: '' },
    integumentary: { checked: false, notes: '' },
    endocrine: { checked: false, notes: '' },
    hematologic: { checked: false, notes: '' },
    psychiatric: { checked: false, notes: '' },
  });

  // Physical Examination findings
  const [physicalExam, setPhysicalExam] = useState<Record<string, string>>({
    generalAppearance: '',
    headNeck: '',
    cardiovascular: '',
    respiratory: '',
    abdomen: '',
    extremities: '',
    neurological: '',
    other: '',
  });
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveFailed, setAutoSaveFailed] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPatientDetailsOpen, setIsPatientDetailsOpen] = useState(false);
  const [patientDetails, setPatientDetails] = useState<Patient | null>(null);
  
  const { getPatient, isLoading: isLoadingPatient, error: patientError } = usePatient();

  const [certFormData, setCertFormData] = useState({
    diagnosis: "",
    recommendation: "",
    startDate: "",
    endDate: "",
    returnDate: "",
  });

  // Prescription form state
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState<CreatePrescriptionInput>({
    patientId: '',
    visitId: '',
    medicationName: '',
    dosage: '',
    frequency: 'once daily',
    route: 'ORAL',
    duration: '',
    quantity: '',
    refills: 0,
    instructions: '', // Special instructions for the patient
  });

  // Fetch visits with status IN_PROGRESS for today only
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: visitsRaw, isLoading: visitsLoading, refetch: refetchVisits } = useVisits({ 
    status: 'IN_PROGRESS',
    startDate: today,
    endDate: today
  });
  
  // Filter to only show today's visits, then sort by visitDate ascending (earliest first)
  const visits = (visitsRaw?.filter((visit: any) => {
    const visitDate = new Date(visit.visitDate);
    const todayDate = new Date();
    return visitDate.toDateString() === todayDate.toDateString();
  }) || []).sort((a: any, b: any) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime());
  
  const updateVisit = useUpdateVisit();
  const completeVisit = useCompleteVisit();
  const cancelVisit = useCancelVisit();
  const { createCertificate, downloadCertificate, isLoading: certLoading } = useCertificates();

  // Prescription hooks
  const { data: prescriptions, isLoading: prescriptionsLoading } = useVisitPrescriptions(selectedVisitId || undefined);
  const createPrescription = useCreatePrescription();
  const discontinuePrescription = useDiscontinuePrescription();

  const selectedVisit = visits?.find((v: any) => v.id === selectedVisitId);

  // Select visit from URL (e.g. from dashboard Patient Queue) or auto-select first
  useEffect(() => {
    if (!visits || visits.length === 0) return;
    const visitIdFromUrl = searchParams.get('visitId');
    if (visitIdFromUrl && visits.some((v: any) => v.id === visitIdFromUrl)) {
      setSelectedVisitId(visitIdFromUrl);
    } else if (!selectedVisitId) {
      setSelectedVisitId(visits[0].id);
    }
  }, [visits, searchParams, selectedVisitId]);

  // Load SOAP data when visit is selected
  useEffect(() => {
    if (selectedVisit) {
      setSoapData({
        chiefComplaint: selectedVisit.chiefComplaint || '',
        subjective: selectedVisit.subjective || '',
        objective: selectedVisit.objective || '',
        assessment: selectedVisit.assessment || '',
        plan: selectedVisit.plan || '',
      });
      setLastSaved(null);
      
      // Reset prescription form with patient/visit IDs
      setPrescriptionForm(prev => ({
        ...prev,
        patientId: selectedVisit.patientId,
        visitId: selectedVisit.id,
      }));
    } else {
      setSoapData({
        chiefComplaint: '',
        subjective: '',
        objective: '',
        assessment: '',
        plan: '',
      });
      setLastSaved(null);
    }
  }, [selectedVisit]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const handleSoapChange = (field: keyof typeof soapData, value: string) => {
    setSoapData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    
    // Auto-save after 2 seconds of inactivity
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      handleAutoSave();
    }, 2000);
  };

  const handleAutoSave = useCallback(async () => {
    if (!selectedVisitId || !selectedVisit) return;
    
    // Don't auto-save if visit is locked
    if (selectedVisit.isLocked) return;
    
    setIsAutoSaving(true);
    try {
      await updateVisit.mutateAsync({
        id: selectedVisitId,
        data: soapData
      });
      setLastSaved(new Date());
    } catch (err) {
      console.error('Failed to auto-save SOAP notes:', err);
    } finally {
      setIsAutoSaving(false);
    }
  }, [selectedVisitId, soapData, updateVisit, selectedVisit]);

  const handleSaveSOAP = async () => {
    if (!selectedVisitId) return;
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    setIsAutoSaving(true);
    setAutoSaveFailed(false);
    try {
      await updateVisit.mutateAsync({
        id: selectedVisitId,
        data: soapData
      });
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      setAutoSaveFailed(false);
      toast.success('SOAP notes saved successfully!');
    } catch (err) {
      console.error('Failed to save SOAP notes:', err);
      setAutoSaveFailed(true);
      const errorMessage = (err as any)?.response?.data?.message || 'Failed to save SOAP notes';
      toast.error(errorMessage);
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleCompleteVisit = async () => {
    if (!selectedVisitId) return;
    
    // Validate required fields
    if (!soapData.chiefComplaint) {
      toast.error('Chief complaint is required to complete the visit.');
      return;
    }
    
    if (!soapData.assessment || !soapData.plan) {
      toast.error('Please complete at least Assessment and Plan before completing the visit.');
      return;
    }

    try {
      // Clear any pending auto-save
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      // Save SOAP notes first
      await updateVisit.mutateAsync({
        id: selectedVisitId,
        data: soapData
      });

      // Then complete the visit
      await completeVisit.mutateAsync(selectedVisitId);
      
      // Clear selection and refetch
      setSelectedVisitId(null);
      refetchVisits();
    } catch (err) {
      console.error('Failed to complete visit:', err);
    }
  };

  const handleCreateCert = async () => {
    if (!selectedVisit || !selectedCertType) return;
    try {
      const cert = await createCertificate({
        patientId: selectedVisit.patientId,
        visitId: selectedVisit.id,
        type: selectedCertType,
        ...certFormData
      });
      toast.success("Certificate generated successfully!");
      if (cert?.id) {
        await downloadCertificate(cert.id);
      }
      setSelectedCertType(null);
    } catch (err) {
      toast.error("Failed to generate certificate");
    }
  };

  const handleCreatePrescription = async () => {
    if (!selectedVisit) return;
    
    if (!prescriptionForm.medicationName || !prescriptionForm.dosage || 
        !prescriptionForm.frequency || !prescriptionForm.duration || !prescriptionForm.quantity) {
      toast.error('Please fill in all required prescription fields');
      return;
    }

    try {
      await createPrescription.mutateAsync(prescriptionForm);
      setShowPrescriptionForm(false);
      setPrescriptionForm({
        patientId: selectedVisit.patientId,
        visitId: selectedVisit.id,
        medicationName: '',
        dosage: '',
        frequency: 'once daily',
        route: 'ORAL',
        duration: '',
        quantity: '',
        refills: 0,
        instructions: '',
      });
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleDiscontinuePrescription = async (prescriptionId: string) => {
    if (!confirm('Are you sure you want to discontinue this prescription?')) return;
    
    try {
      await discontinuePrescription.mutateAsync({
        id: prescriptionId,
        data: { reason: 'Discontinued by doctor' }
      });
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleRosChange = (system: string, field: 'checked' | 'notes', value: boolean | string) => {
    setRosChecklist(prev => ({
      ...prev,
      [system]: {
        ...prev[system],
        [field]: value
      }
    }));
  };

  const handlePhysicalExamChange = (section: string, value: string) => {
    setPhysicalExam(prev => ({
      ...prev,
      [section]: value
    }));
  };

  const calculateBMI = (weight?: number, height?: number) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const handleViewPatientDetails = async () => {
    if (!selectedVisit?.patientId) return;
    
    try {
      setIsPatientDetailsOpen(true);
      const patient = await getPatient(selectedVisit.patientId);
      setPatientDetails(patient);
    } catch (err) {
      console.error('Failed to load patient details:', err);
      toast.error('Failed to load patient details');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 h-[calc(100vh-8rem)]">
      
      {/* LEFT: Patient Queue (Doctor's Line) */}
      <Card className="lg:col-span-1 border-slate-200 shadow-sm flex flex-col overflow-hidden bg-white">
        <div className="p-3 md:p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm md:text-base font-bold text-slate-800 flex items-center gap-2">
              <User className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600" />
              <span className="hidden sm:inline">Active Consultations</span>
              <span className="sm:hidden">Queue</span>
            </h2>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10px] md:text-xs">
              {visits?.length || 0}
            </Badge>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 md:p-3 space-y-2 md:space-y-3">
            {visitsLoading ? (
              <div className="flex justify-center p-6 md:p-8"><LoadingSpinner /></div>
            ) : !visits || visits.length === 0 ? (
              <div className="text-center py-6 md:py-8 text-slate-400 text-xs md:text-sm">
                <User className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2 md:mb-3 opacity-20" />
                <p>No patients in consultation</p>
              </div>
            ) : visits.map((visit: any) => (
              <div 
                key={visit.id}
                onClick={() => setSelectedVisitId(visit.id)}
                className={`group p-2.5 md:p-3 rounded-lg md:rounded-xl border transition-all cursor-pointer ${
                  selectedVisitId === visit.id 
                    ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-500/20' 
                    : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start mb-1.5 md:mb-2">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                    <div className={`h-7 w-7 md:h-8 md:w-8 rounded-full flex items-center justify-center font-bold text-[10px] md:text-xs shrink-0 shadow-sm ${
                      selectedVisitId === visit.id ? 'bg-white border-2 border-blue-500 text-blue-600' : 'bg-white border-2 border-slate-300 text-slate-600'
                    }`}>
                      {visit.patient.firstName.charAt(0)}{visit.patient.lastName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-slate-900 block text-xs md:text-sm truncate">
                        {visit.patient.firstName} {visit.patient.lastName}
                      </span>
                      <span className="text-[10px] md:text-xs text-slate-500">{visit.visitType}</span>
                    </div>
                  </div>
                  <span className="text-[10px] md:text-xs font-mono bg-slate-100 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md text-slate-600 shrink-0 ml-2">
                    {format(new Date(visit.visitDate), "hh:mm a")}
                  </span>
                </div>
                
                {selectedVisitId === visit.id && (
                  <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-blue-100 flex items-center justify-between">
                    <span className="text-[10px] md:text-xs font-semibold text-blue-700 flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                      In Consultation
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-400" />
                  </div>
                )}
                
                {/* Cancel Visit Button - Only show for cancellable visits */}
                {visit.status !== 'COMPLETED' && visit.status !== 'CANCELLED' && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to cancel this visit? This action cannot be undone.')) {
                          cancelVisit.mutate({ id: visit.id });
                          if (selectedVisitId === visit.id) {
                            setSelectedVisitId(null);
                          }
                        }
                      }}
                      disabled={cancelVisit.isPending}
                      className="w-full text-xs h-7 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                    >
                      <XCircle className="h-3 w-3 mr-1.5" />
                      Cancel Visit
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* RIGHT: Active Consultation Workspace */}
      <div className="lg:col-span-3 flex flex-col gap-5 h-full overflow-hidden">
        
        {selectedVisit ? (
          <>
            {/* Patient Header Card */}
            <Card className="p-3 md:p-4 border-slate-200 shadow-sm bg-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center text-blue-600 font-bold text-lg md:text-xl shadow-sm shrink-0">
                    {selectedVisit.patient.firstName.charAt(0)}{selectedVisit.patient.lastName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-base md:text-xl font-bold text-slate-900 flex flex-wrap items-center gap-2">
                      <span className="truncate">{selectedVisit.patient.firstName} {selectedVisit.patient.lastName}</span>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 shadow-none font-semibold text-[10px] md:text-xs">Active</Badge>
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-slate-500 mt-1">
                      {selectedVisit.patient.dateOfBirth && (
                        <span className="flex items-center gap-1.5">
                          <User className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0" /> 
                          <span className="whitespace-nowrap">{new Date().getFullYear() - new Date(selectedVisit.patient.dateOfBirth).getFullYear()} Years{selectedVisit.patient.gender && `, ${selectedVisit.patient.gender}`}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <HistoryIcon className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0" /> 
                        <span className="whitespace-nowrap">{format(new Date(selectedVisit.visitDate), "MMM dd, yyyy")}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
                  <div className="flex items-center justify-end sm:justify-start text-[10px] md:text-xs gap-2">
                    {isAutoSaving && (
                      <span className="flex items-center gap-1.5 text-blue-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                        Saving...
                      </span>
                    )}
                    {lastSaved && !isAutoSaving && !autoSaveFailed && (
                      <span className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Saved {format(lastSaved, 'HH:mm:ss')}
                      </span>
                    )}
                    {autoSaveFailed && (
                      <span className="flex items-center gap-1.5 text-red-600 font-medium">
                        <AlertCircle className="h-3 w-3" />
                        Save failed
                      </span>
                    )}
                    {hasUnsavedChanges && !isAutoSaving && !autoSaveFailed && (
                      <span className="flex items-center gap-1.5 text-amber-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                        Unsaved changes
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-slate-600 border-slate-200 hover:bg-slate-50 text-xs md:text-sm h-8 md:h-9 flex-1 sm:flex-none"
                      onClick={handleViewPatientDetails}
                    >
                      <Eye className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden sm:inline">View Patient Details</span>
                      <span className="sm:hidden">Details</span>
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className={`${
                        autoSaveFailed 
                          ? "bg-red-50 border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800" 
                          : "text-slate-600 border-slate-200 hover:bg-slate-50"
                      } text-xs md:text-sm h-8 md:h-9 flex-1 sm:flex-none ${
                        hasUnsavedChanges && !autoSaveFailed ? "ring-2 ring-amber-500/20" : ""
                      }`}
                      onClick={handleSaveSOAP}
                      disabled={updateVisit.isPending || selectedVisit?.isLocked}
                    >
                      {updateVisit.isPending ? (
                        <LoadingSpinner />
                      ) : (
                        <>
                          {autoSaveFailed && <AlertCircle className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />}
                          {autoSaveFailed ? 'Retry Save' : 'Save'}
                        </>
                      )}
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 text-xs md:text-sm h-8 md:h-9 flex-1 sm:flex-none"
                      onClick={handleCompleteVisit}
                      disabled={completeVisit.isPending || selectedVisit?.isLocked}
                    >
                      <CheckCircle2 className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden sm:inline">Complete</span>
                      <span className="sm:hidden">Done</span>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Main Workspace */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 min-h-0">
              
              {/* Vitals & History Panel */}
              <div className="lg:col-span-1 space-y-4 md:space-y-5 overflow-y-auto pr-1">
                {/* Vitals Summary */}
                <Card className="p-3 md:p-5 border-slate-200 shadow-sm bg-blue-50/50">
                  <h3 className="text-xs md:text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 md:mb-4 flex items-center gap-2">
                    <ActivityPulseIcon className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600" />
                    Current Vitals
                  </h3>
                  <div className="grid grid-cols-2 gap-2 md:gap-4">
                    <VitalDisplay 
                      label="BP" 
                      value={selectedVisit.bloodPressureSystolic && selectedVisit.bloodPressureDiastolic 
                        ? `${selectedVisit.bloodPressureSystolic}/${selectedVisit.bloodPressureDiastolic}` 
                        : 'N/A'} 
                      unit="mmHg" 
                    />
                    <VitalDisplay 
                      label="HR" 
                      value={selectedVisit.heartRate?.toString() || 'N/A'} 
                      unit="bpm" 
                    />
                    <VitalDisplay 
                      label="Temp" 
                      value={selectedVisit.temperature?.toString() || 'N/A'} 
                      unit="°C" 
                    />
                    <VitalDisplay 
                      label="Weight" 
                      value={selectedVisit.weight?.toString() || 'N/A'} 
                      unit="kg" 
                    />
                    <VitalDisplay 
                      label="Height" 
                      value={selectedVisit.height?.toString() || 'N/A'} 
                      unit="cm" 
                    />
                    <VitalDisplay 
                      label="BMI" 
                      value={selectedVisit.bmi?.toString() || calculateBMI(selectedVisit.weight, selectedVisit.height) || 'N/A'} 
                      unit="" 
                    />
                  </div>
                  {selectedVisit.notes && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-blue-100">
                      <p className="text-xs font-semibold text-slate-600 mb-1">Nurse Notes:</p>
                      <p className="text-sm text-slate-700">{selectedVisit.notes}</p>
                    </div>
                  )}
                </Card>

                {/* Patient Info */}
                <Card className="p-5 border-slate-200 shadow-sm bg-white">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Patient Info</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-500">Patient ID</p>
                      <p className="font-semibold">{selectedVisit.patient.patientId}</p>
                    </div>
                    {selectedVisit.patient.phone && (
                      <div>
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="font-semibold">{selectedVisit.patient.phone}</p>
                      </div>
                    )}
                    {selectedVisit.patient.email && (
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="font-medium text-blue-600">{selectedVisit.patient.email}</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Clinical Notes (SOAP) */}
              <Card className="lg:col-span-2 border-slate-200 shadow-sm bg-white flex flex-col overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <div className="px-3 md:px-5 pt-3 md:pt-4 border-b border-slate-100 shrink-0">
                    <TabsList className="bg-slate-100 w-full grid grid-cols-3">
                      <TabsTrigger value="soap" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs md:text-sm">SOAP Notes</TabsTrigger>
                      <TabsTrigger value="rx" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs md:text-sm">Prescription</TabsTrigger>
                      <TabsTrigger value="certificates" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs md:text-sm">Certificates</TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 overflow-y-auto bg-slate-50/30 p-3 md:p-6 min-h-0">
                    <TabsContent value="soap" className="mt-0 space-y-4 md:space-y-6">
                      {selectedVisit?.isLocked && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
                          <span className="text-xs md:text-sm text-amber-800 font-medium">This visit is locked and cannot be edited.</span>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <label className="text-xs md:text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <span className="w-5 h-5 md:w-6 md:h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] md:text-xs font-bold">CC</span>
                          Chief Complaint <span className="text-red-500">*</span>
                        </label>
                        <Textarea 
                          className="w-full h-20 md:h-24 rounded-xl border-slate-200 bg-white p-3 md:p-4 text-xs md:text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm resize-none"
                          placeholder="Main reason for visit..."
                          value={soapData.chiefComplaint}
                          onChange={(e) => handleSoapChange('chiefComplaint', e.target.value)}
                          disabled={selectedVisit?.isLocked}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs md:text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <span className="w-5 h-5 md:w-6 md:h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] md:text-xs font-bold">S</span>
                          Subjective (History & Symptoms)
                        </label>
                        <Textarea 
                          className="w-full h-20 md:h-24 rounded-xl border-slate-200 bg-white p-3 md:p-4 text-xs md:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm resize-none"
                          placeholder="Patient reports..."
                          value={soapData.subjective}
                          onChange={(e) => handleSoapChange('subjective', e.target.value)}
                          disabled={selectedVisit?.isLocked}
                        />
                        
                        {/* Review of Systems (ROS) Checklist */}
                        <Card className="p-3 md:p-4 border-slate-200 bg-white/50 mt-3">
                          <label className="text-xs md:text-sm font-semibold text-slate-600 mb-3 block">Review of Systems</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                            {Object.entries(rosChecklist).map(([system, data]) => (
                              <div key={system} className="flex items-start gap-2">
                                <Checkbox
                                  id={`ros-${system}`}
                                  checked={data.checked}
                                  onChange={(e) => handleRosChange(system, 'checked', e.target.checked)}
                                  disabled={selectedVisit?.isLocked}
                                  className="mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                  <label htmlFor={`ros-${system}`} className="text-xs md:text-sm text-slate-700 capitalize cursor-pointer">
                                    {system.replace(/([A-Z])/g, ' $1').trim()}
                                  </label>
                                  {data.checked && (
                                    <Input
                                      type="text"
                                      placeholder="Notes..."
                                      value={data.notes}
                                      onChange={(e) => handleRosChange(system, 'notes', e.target.value)}
                                      disabled={selectedVisit?.isLocked}
                                      className="mt-1 h-7 text-xs"
                                    />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs md:text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <span className="w-5 h-5 md:w-6 md:h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] md:text-xs font-bold">O</span>
                          Objective (Physical Examination)
                        </label>
                        
                        {/* Physical Examination Sections */}
                        <Card className="p-3 md:p-4 border-slate-200 bg-white/50 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-slate-600">General Appearance</Label>
                              <Textarea
                                className="h-16 text-xs md:text-sm"
                                placeholder="Appearance, alertness, distress..."
                                value={physicalExam.generalAppearance}
                                onChange={(e) => handlePhysicalExamChange('generalAppearance', e.target.value)}
                                disabled={selectedVisit?.isLocked}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-slate-600">Head & Neck</Label>
                              <Textarea
                                className="h-16 text-xs md:text-sm"
                                placeholder="HEENT findings..."
                                value={physicalExam.headNeck}
                                onChange={(e) => handlePhysicalExamChange('headNeck', e.target.value)}
                                disabled={selectedVisit?.isLocked}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-slate-600">Cardiovascular</Label>
                              <Textarea
                                className="h-16 text-xs md:text-sm"
                                placeholder="Heart sounds, pulses, JVD..."
                                value={physicalExam.cardiovascular}
                                onChange={(e) => handlePhysicalExamChange('cardiovascular', e.target.value)}
                                disabled={selectedVisit?.isLocked}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-slate-600">Respiratory</Label>
                              <Textarea
                                className="h-16 text-xs md:text-sm"
                                placeholder="Lung sounds, respiratory effort..."
                                value={physicalExam.respiratory}
                                onChange={(e) => handlePhysicalExamChange('respiratory', e.target.value)}
                                disabled={selectedVisit?.isLocked}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-slate-600">Abdomen</Label>
                              <Textarea
                                className="h-16 text-xs md:text-sm"
                                placeholder="Bowel sounds, tenderness, masses..."
                                value={physicalExam.abdomen}
                                onChange={(e) => handlePhysicalExamChange('abdomen', e.target.value)}
                                disabled={selectedVisit?.isLocked}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-slate-600">Extremities</Label>
                              <Textarea
                                className="h-16 text-xs md:text-sm"
                                placeholder="Edema, pulses, range of motion..."
                                value={physicalExam.extremities}
                                onChange={(e) => handlePhysicalExamChange('extremities', e.target.value)}
                                disabled={selectedVisit?.isLocked}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-slate-600">Neurological</Label>
                              <Textarea
                                className="h-16 text-xs md:text-sm"
                                placeholder="Mental status, reflexes, coordination..."
                                value={physicalExam.neurological}
                                onChange={(e) => handlePhysicalExamChange('neurological', e.target.value)}
                                disabled={selectedVisit?.isLocked}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-slate-600">Other Findings</Label>
                              <Textarea
                                className="h-16 text-xs md:text-sm"
                                placeholder="Additional findings..."
                                value={physicalExam.other}
                                onChange={(e) => handlePhysicalExamChange('other', e.target.value)}
                                disabled={selectedVisit?.isLocked}
                              />
                            </div>
                          </div>
                        </Card>
                        
                        <Textarea 
                          className="w-full h-20 md:h-24 rounded-xl border-slate-200 bg-white p-3 md:p-4 text-xs md:text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm resize-none"
                          placeholder="Additional objective observations..."
                          value={soapData.objective}
                          onChange={(e) => handleSoapChange('objective', e.target.value)}
                          disabled={selectedVisit?.isLocked}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">A</span>
                          Assessment (Diagnosis) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <AlertCircle className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                          <input 
                            type="text"
                            className="w-full h-11 pl-10 pr-4 rounded-xl border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
                            placeholder="Enter diagnosis (ICD-10 optional)..."
                            value={soapData.assessment}
                            onChange={(e) => handleSoapChange('assessment', e.target.value)}
                            disabled={selectedVisit?.isLocked}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold">P</span>
                          Plan (Treatment) <span className="text-red-500">*</span>
                        </label>
                        <Textarea 
                          className="w-full h-24 rounded-xl border-slate-200 bg-white p-4 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm resize-none disabled:bg-slate-50 disabled:cursor-not-allowed"
                          placeholder="Medication, therapy, advice..."
                          value={soapData.plan}
                          onChange={(e) => handleSoapChange('plan', e.target.value)}
                          disabled={selectedVisit?.isLocked}
                        />
                      </div>

                      <div className="pt-3 md:pt-4 border-t border-slate-200">
                        <Button 
                          onClick={handleSaveSOAP}
                          disabled={updateVisit.isPending}
                          className="w-full bg-blue-600 hover:bg-blue-700 h-9 md:h-10 text-xs md:text-sm"
                        >
                          {updateVisit.isPending ? <LoadingSpinner /> : 'Save SOAP Notes'}
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="rx" className="mt-0 space-y-4 md:space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm md:text-base font-bold text-slate-800">Prescriptions</h3>
                        <Button
                          size="sm"
                          onClick={() => setShowPrescriptionForm(true)}
                          disabled={selectedVisit?.isLocked || !selectedVisit}
                          className="h-8 md:h-9 text-xs md:text-sm"
                        >
                          <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                          Add Prescription
                        </Button>
                      </div>

                      {/* Prescription Form */}
                      {showPrescriptionForm && (
                        <Card className="p-4 md:p-6 border-slate-200 bg-white space-y-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-slate-800 text-sm md:text-base">New Prescription</h4>
                            <Button variant="ghost" size="sm" onClick={() => setShowPrescriptionForm(false)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            <div className="md:col-span-2 space-y-1.5">
                              <Label className="text-xs font-semibold">Medication Name <span className="text-red-500">*</span></Label>
                              <Input
                                value={prescriptionForm.medicationName}
                                onChange={(e) => setPrescriptionForm({...prescriptionForm, medicationName: e.target.value})}
                                placeholder="e.g. Paracetamol"
                                className="h-9 md:h-10 text-xs md:text-sm"
                                disabled={selectedVisit?.isLocked}
                              />
                            </div>
                            
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold">Dosage <span className="text-red-500">*</span></Label>
                              <Input
                                value={prescriptionForm.dosage}
                                onChange={(e) => setPrescriptionForm({...prescriptionForm, dosage: e.target.value})}
                                placeholder="e.g. 500mg"
                                className="h-9 md:h-10 text-xs md:text-sm"
                                disabled={selectedVisit?.isLocked}
                              />
                            </div>
                            
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold">Frequency <span className="text-red-500">*</span></Label>
                              <Select
                                value={prescriptionForm.frequency}
                                onValueChange={(value) => setPrescriptionForm({...prescriptionForm, frequency: value})}
                                disabled={selectedVisit?.isLocked}
                              >
                                <SelectTrigger className="h-9 md:h-10 text-xs md:text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="once daily">Once daily</SelectItem>
                                  <SelectItem value="twice daily">Twice daily</SelectItem>
                                  <SelectItem value="three times daily">Three times daily</SelectItem>
                                  <SelectItem value="four times daily">Four times daily</SelectItem>
                                  <SelectItem value="every 6 hours">Every 6 hours</SelectItem>
                                  <SelectItem value="every 8 hours">Every 8 hours</SelectItem>
                                  <SelectItem value="every 12 hours">Every 12 hours</SelectItem>
                                  <SelectItem value="as needed">As needed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold">Route <span className="text-red-500">*</span></Label>
                              <Select
                                value={prescriptionForm.route}
                                onValueChange={(value) => setPrescriptionForm({...prescriptionForm, route: value})}
                                disabled={selectedVisit?.isLocked}
                              >
                                <SelectTrigger className="h-9 md:h-10 text-xs md:text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ORAL">Oral</SelectItem>
                                  <SelectItem value="TOPICAL">Topical</SelectItem>
                                  <SelectItem value="INJECTION">Injection</SelectItem>
                                  <SelectItem value="INHALATION">Inhalation</SelectItem>
                                  <SelectItem value="NASAL">Nasal</SelectItem>
                                  <SelectItem value="OPHTHALMIC">Ophthalmic</SelectItem>
                                  <SelectItem value="OTIC">Otic</SelectItem>
                                  <SelectItem value="RECTAL">Rectal</SelectItem>
                                  <SelectItem value="SUBLINGUAL">Sublingual</SelectItem>
                                  <SelectItem value="TRANSDERMAL">Transdermal</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold">Duration <span className="text-red-500">*</span></Label>
                              <Input
                                value={prescriptionForm.duration}
                                onChange={(e) => setPrescriptionForm({...prescriptionForm, duration: e.target.value})}
                                placeholder="e.g. 7 days"
                                className="h-9 md:h-10 text-xs md:text-sm"
                                disabled={selectedVisit?.isLocked}
                              />
                            </div>
                            
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold">Quantity <span className="text-red-500">*</span></Label>
                              <Input
                                value={prescriptionForm.quantity}
                                onChange={(e) => setPrescriptionForm({...prescriptionForm, quantity: e.target.value})}
                                placeholder="e.g. 14 tablets"
                                className="h-9 md:h-10 text-xs md:text-sm"
                                disabled={selectedVisit?.isLocked}
                              />
                            </div>
                            
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold">Refills</Label>
                              <Input
                                type="number"
                                min="0"
                                max="12"
                                value={prescriptionForm.refills || 0}
                                onChange={(e) => setPrescriptionForm({...prescriptionForm, refills: parseInt(e.target.value) || 0})}
                                className="h-9 md:h-10 text-xs md:text-sm"
                                disabled={selectedVisit?.isLocked}
                              />
                            </div>
                            
                            <div className="md:col-span-2 space-y-1.5">
                              <Label className="text-xs font-semibold">Special Instructions</Label>
                              <Textarea
                                value={prescriptionForm.instructions || ''}
                                onChange={(e) => setPrescriptionForm({...prescriptionForm, instructions: e.target.value})}
                                placeholder="e.g. Take with food. Avoid alcohol."
                                className="h-16 text-xs md:text-sm"
                                disabled={selectedVisit?.isLocked}
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={handleCreatePrescription}
                              disabled={createPrescription.isPending || selectedVisit?.isLocked}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 h-9 md:h-10 text-xs md:text-sm"
                            >
                              {createPrescription.isPending ? <LoadingSpinner /> : 'Add Prescription'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowPrescriptionForm(false)}
                              className="h-9 md:h-10 text-xs md:text-sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </Card>
                      )}

                      {/* Prescriptions List */}
                      {prescriptionsLoading ? (
                        <div className="flex justify-center p-8">
                          <LoadingSpinner />
                        </div>
                      ) : !prescriptions || prescriptions.length === 0 ? (
                        <div className="p-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                          <Pill className="h-10 w-10 mb-3 opacity-20" />
                          <p className="text-xs md:text-sm font-medium">No prescriptions added yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {prescriptions.map((prescription: any) => (
                            <Card key={prescription.id} className="p-4 border-slate-200 bg-white">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-slate-900 text-sm md:text-base">{prescription.medicationName}</h4>
                                    <Badge 
                                      variant={prescription.status === 'ACTIVE' ? 'default' : 'secondary'}
                                      className="text-[10px] md:text-xs"
                                    >
                                      {prescription.status}
                                    </Badge>
                                  </div>
                                  <div className="text-xs md:text-sm text-slate-600 space-y-0.5">
                                    <p><span className="font-semibold">Dosage:</span> {prescription.dosage}</p>
                                    <p><span className="font-semibold">Frequency:</span> {prescription.frequency}</p>
                                    <p><span className="font-semibold">Route:</span> {prescription.route}</p>
                                    <p><span className="font-semibold">Duration:</span> {prescription.duration}</p>
                                    <p><span className="font-semibold">Quantity:</span> {prescription.quantity}</p>
                                    {prescription.refills > 0 && (
                                      <p><span className="font-semibold">Refills:</span> {prescription.refills}</p>
                                    )}
                                    {prescription.instructions && (
                                      <p className="mt-1 text-slate-700"><span className="font-semibold">Instructions:</span> {prescription.instructions}</p>
                                    )}
                                    {prescription.notes && (
                                      <div className="mt-1 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-xs">
                                        <AlertTriangle className="h-3 w-3 inline mr-1" />
                                        {prescription.notes}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {prescription.status === 'ACTIVE' && !selectedVisit?.isLocked && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDiscontinuePrescription(prescription.id)}
                                    disabled={discontinuePrescription.isPending}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="certificates" className="mt-0 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <CertificateCard 
                          title="Sick Leave / Medical Certificate" 
                          onClick={() => setSelectedCertType("SICK_LEAVE")}
                          selected={selectedCertType === "SICK_LEAVE"}
                          description="Excuse patient from work or school due to illness."
                          icon={<ClipboardList className="h-5 w-5 text-orange-600" />}
                        />
                        <CertificateCard 
                          title="Fit to Work" 
                          onClick={() => setSelectedCertType("FIT_TO_WORK")}
                          selected={selectedCertType === "FIT_TO_WORK"}
                          description="Certify that the patient is physically capable of resuming duties."
                          icon={<ShieldCheck className="h-5 w-5 text-emerald-600" />}
                        />
                        <CertificateCard 
                          title="Medical Clearance" 
                          onClick={() => setSelectedCertType("MEDICAL_CLEARANCE")}
                          selected={selectedCertType === "MEDICAL_CLEARANCE"}
                          description="General clearance for employment or travel."
                          icon={<CheckCircle2 className="h-5 w-5 text-blue-600" />}
                        />
                      </div>

                      {selectedCertType ? (
                        <Card className="p-6 border-slate-200 bg-white space-y-4">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-slate-800">Generate {selectedCertType.replace("_", " ")}</h3>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedCertType(null)}>Cancel</Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1.5">
                              <label className="text-xs font-bold text-slate-500 uppercase">Diagnosis / Reason</label>
                              <textarea 
                                className="w-full rounded-lg border-slate-200 text-sm p-3 min-h-[80px]"
                                value={certFormData.diagnosis}
                                onChange={(e) => setCertFormData({...certFormData, diagnosis: e.target.value})}
                                placeholder="Brief clinical diagnosis..."
                              />
                            </div>
                            <div className="col-span-2 space-y-1.5">
                              <label className="text-xs font-bold text-slate-500 uppercase">Recommendation</label>
                              <textarea 
                                className="w-full rounded-lg border-slate-200 text-sm p-3 min-h-[80px]"
                                value={certFormData.recommendation}
                                onChange={(e) => setCertFormData({...certFormData, recommendation: e.target.value})}
                                placeholder="e.g. Advised home rest for 3 days..."
                              />
                            </div>
                            
                            {selectedCertType === "SICK_LEAVE" && (
                              <>
                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-slate-500 uppercase">Start Date</label>
                                  <input 
                                    type="date" 
                                    className="w-full rounded-lg border-slate-200 text-sm p-2"
                                    value={certFormData.startDate}
                                    onChange={(e) => setCertFormData({...certFormData, startDate: e.target.value})}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-slate-500 uppercase">End Date</label>
                                  <input 
                                    type="date" 
                                    className="w-full rounded-lg border-slate-200 text-sm p-2"
                                    value={certFormData.endDate}
                                    onChange={(e) => setCertFormData({...certFormData, endDate: e.target.value})}
                                  />
                                </div>
                              </>
                            )}

                            {selectedCertType === "FIT_TO_WORK" && (
                              <div className="col-span-2 space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase">Return Date</label>
                                <input 
                                  type="date" 
                                  className="w-full rounded-lg border-slate-200 text-sm p-2"
                                  value={certFormData.returnDate}
                                  onChange={(e) => setCertFormData({...certFormData, returnDate: e.target.value})}
                                />
                              </div>
                            )}
                          </div>

                          <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={certLoading || !certFormData.recommendation}
                            onClick={handleCreateCert}
                          >
                            {certLoading ? <LoadingSpinner /> : "Generate & Download PDF"}
                          </Button>
                        </Card>
                      ) : (
                        <div className="p-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                          <ClipboardList className="h-10 w-10 mb-3 opacity-20" />
                          <p className="text-sm font-medium">Select a certificate type to begin generation</p>
                        </div>
                      )}
                    </TabsContent>
                  </div>
                </Tabs>
              </Card>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
            <Stethoscope className="h-20 w-20 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Active Consultation</h3>
            <p className="text-slate-500">Select a patient from the queue to start consultation</p>
          </div>
        )}
      </div>

      {/* Patient Details Drawer */}
      <PatientDetailsDrawer
        open={isPatientDetailsOpen}
        onOpenChange={setIsPatientDetailsOpen}
        patient={patientDetails}
        isLoading={isLoadingPatient}
        error={patientError}
      />
    </div>
  );
}

function VitalDisplay({ label, value, unit }: { label: string, value: string, unit: string }) {
  return (
    <div className="bg-white p-2 md:p-3 rounded-lg md:rounded-xl border border-blue-100 shadow-sm flex flex-col items-center text-center">
      <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5 md:mb-1">{label}</span>
      <div className="flex items-baseline gap-0.5">
        <span className="text-base md:text-lg font-bold text-slate-900 leading-none">{value}</span>
        <span className="text-[9px] md:text-[10px] text-slate-500 font-medium">{unit}</span>
      </div>
    </div>
  )
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

function CertificateCard({ title, description, icon, onClick, selected }: { title: string, description: string, icon: React.ReactNode, onClick: () => void, selected: boolean }) {
  return (
    <Card 
      onClick={onClick}
      className={`p-4 border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group ${selected ? 'ring-2 ring-blue-500 border-transparent bg-blue-50/30' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg transition-colors ${selected ? 'bg-blue-100' : 'bg-slate-50 group-hover:bg-blue-50'}`}>
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">{title}</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
    </Card>
  )
}
