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
  Weight,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useCreateVisit } from "@/hooks/queries/use-visits";
import { usePatients, useCreatePatient } from "@/hooks/queries/use-patients";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { format } from "date-fns";
import { PatientFormDrawer } from "@/components/features/patients/patient-form-drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Patient } from "@/types/patient.types";

export default function VisitsIntakePage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isPatientDrawerOpen, setIsPatientDrawerOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  
  const [visitType, setVisitType] = useState<string>('ROUTINE');
  const [customVisitType, setCustomVisitType] = useState<string>('');
  const [vitalsData, setVitalsData] = useState({
    bpSystolic: '',
    bpDiastolic: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: '',
    notes: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { data: searchResults, isLoading: isSearching } = usePatients({
    search: patientSearchTerm.trim() || undefined,
    limit: 10
  });
  
  const createVisit = useCreateVisit();
  const createPatient = useCreatePatient();

  const handleVitalChange = (field: string, value: string) => {
    setVitalsData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateVitals = (): boolean => {
    const errors: Record<string, string> = {};

    // Blood Pressure Validation
    if (vitalsData.bpSystolic) {
      const systolic = parseFloat(vitalsData.bpSystolic);
      if (isNaN(systolic) || systolic < 70 || systolic > 250) {
        errors.bpSystolic = 'Systolic BP must be between 70-250 mmHg';
      }
    }

    if (vitalsData.bpDiastolic) {
      const diastolic = parseFloat(vitalsData.bpDiastolic);
      if (isNaN(diastolic) || diastolic < 40 || diastolic > 150) {
        errors.bpDiastolic = 'Diastolic BP must be between 40-150 mmHg';
      }
    }

    // Check if systolic is higher than diastolic
    if (vitalsData.bpSystolic && vitalsData.bpDiastolic) {
      const systolic = parseFloat(vitalsData.bpSystolic);
      const diastolic = parseFloat(vitalsData.bpDiastolic);
      if (!isNaN(systolic) && !isNaN(diastolic) && systolic <= diastolic) {
        errors.bpSystolic = 'Systolic BP must be higher than Diastolic BP';
        errors.bpDiastolic = 'Diastolic BP must be lower than Systolic BP';
      }
    }

    // Heart Rate Validation
    if (vitalsData.heartRate) {
      const hr = parseFloat(vitalsData.heartRate);
      if (isNaN(hr) || hr < 30 || hr > 220) {
        errors.heartRate = 'Heart rate must be between 30-220 bpm';
      }
    }

    // Temperature Validation
    if (vitalsData.temperature) {
      const temp = parseFloat(vitalsData.temperature);
      if (isNaN(temp) || temp < 30 || temp > 45) {
        errors.temperature = 'Temperature must be between 30-45°C';
      }
    }

    // Weight Validation
    if (vitalsData.weight) {
      const weight = parseFloat(vitalsData.weight);
      if (isNaN(weight) || weight < 1 || weight > 500) {
        errors.weight = 'Weight must be between 1-500 kg';
      }
    }

    // Height Validation
    if (vitalsData.height) {
      const height = parseFloat(vitalsData.height);
      if (isNaN(height) || height < 50 || height > 250) {
        errors.height = 'Height must be between 50-250 cm';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleWalkInRegistration = async (data: any) => {
    try {
      const newPatient = await createPatient.mutateAsync(data);
      // Select the newly created patient
      setSelectedPatient(newPatient);
      setIsPatientDrawerOpen(false);
      toast.success('Patient registered and selected. You can now record vitals.');
    } catch (err) {
      console.error('Failed walk-in registration:', err);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    // Directly select the patient (no need to add to queue first)
    setSelectedPatient(patient);
    setIsSearchDialogOpen(false);
    setPatientSearchTerm("");
    toast.success('Patient selected. You can now record vitals.');
  };

  const handleSendToDoctor = async () => {
    if (!selectedPatient) return;

    // Validate visit type if "Others" is selected
    if (visitType === 'OTHERS' && !customVisitType.trim()) {
      toast.error('Please specify the visit type.');
      return;
    }

    // Validate vitals before submission
    if (!validateVitals()) {
      toast.error('Please correct the validation errors before sending to doctor.');
      return;
    }

    try {
      // Use custom visit type if "Others" is selected, otherwise use the selected enum value
      const finalVisitType = visitType === 'OTHERS' ? customVisitType.trim() : visitType;
      
      await createVisit.mutateAsync({
        patientId: selectedPatient.id,
        visitType: finalVisitType,
        vitals: {
          bpSystolic: vitalsData.bpSystolic ? parseFloat(vitalsData.bpSystolic) : undefined,
          bpDiastolic: vitalsData.bpDiastolic ? parseFloat(vitalsData.bpDiastolic) : undefined,
          heartRate: vitalsData.heartRate ? parseFloat(vitalsData.heartRate) : undefined,
          temperature: vitalsData.temperature ? parseFloat(vitalsData.temperature) : undefined,
          weight: vitalsData.weight ? parseFloat(vitalsData.weight) : undefined,
          height: vitalsData.height ? parseFloat(vitalsData.height) : undefined,
          notes: vitalsData.notes || undefined,
        },
      });

      // Reset form
      setSelectedPatient(null);
      setVisitType('ROUTINE');
      setCustomVisitType('');
      setVitalsData({
        bpSystolic: '',
        bpDiastolic: '',
        heartRate: '',
        temperature: '',
        weight: '',
        height: '',
        notes: '',
      });
      setValidationErrors({});
    } catch (err) {
      console.error('Failed to create visit:', err);
    }
  };

  const calculateAge = (dateOfBirth: Date | string): number => {
    const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  // Check if required fields are filled to enable/disable Send to Doctor button
  const isFormValid = () => {
    // Patient must be selected
    if (!selectedPatient) return false;
    
    // Visit type must be selected
    if (!visitType) return false;
    
    // If "Others" is selected, custom visit type must be provided
    if (visitType === 'OTHERS' && !customVisitType.trim()) return false;
    
    return true;
  };

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
           <Button
             variant="outline"
             className="border-slate-200 text-slate-700 hover:bg-slate-50"
             onClick={() => setIsSearchDialogOpen(true)}
           >
             <Search className="mr-2 h-4 w-4" />
             Find Patient
           </Button>
           <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
             <DialogContent className="max-w-2xl">
               <DialogHeader>
                 <DialogTitle className="text-xl font-bold text-slate-900">Find Existing Patient</DialogTitle>
                 <p className="text-sm text-slate-500 mt-1">Search by name, phone number, or patient ID</p>
               </DialogHeader>
               <div className="px-6 pt-2 pb-6 flex flex-col gap-4 overflow-hidden">
                 {/* Search Input */}
                 <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                   <Input
                     placeholder="Search by name, phone, or ID..."
                     className="pl-11 h-12 text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                     value={patientSearchTerm}
                     onChange={(e) => setPatientSearchTerm(e.target.value)}
                     autoFocus
                   />
                 </div>
                 
                 {/* Results List */}
                 <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                   <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 px-1">
                     {isSearching ? 'Searching...' : searchResults?.data?.length ? `${searchResults.data.length} result${searchResults.data.length !== 1 ? 's' : ''} found` : 'Results'}
                   </div>
                   <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                     {isSearching ? (
                       <div className="flex flex-col items-center justify-center py-12">
                         <LoadingSpinner />
                         <p className="text-sm text-slate-500 mt-4">Searching patients...</p>
                       </div>
                     ) : searchResults?.data?.length === 0 ? (
                       <div className="flex flex-col items-center justify-center py-12 text-center">
                         <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                           <Search className="h-8 w-8 text-slate-400" />
                         </div>
                         <p className="text-base font-medium text-slate-700 mb-1">
                           {patientSearchTerm ? `No patients found` : 'Start typing to search'}
                         </p>
                         <p className="text-sm text-slate-500 max-w-sm">
                           {patientSearchTerm 
                             ? `No patients match "${patientSearchTerm}". Try a different search term.`
                             : 'Enter a patient name, phone number, or ID to find their records.'}
                         </p>
                       </div>
                     ) : (
                       searchResults?.data?.map((patient: Patient) => {
                         const age = patient.dateOfBirth 
                           ? calculateAge(patient.dateOfBirth)
                           : null;
                         return (
                           <div
                             key={patient.id}
                             onClick={() => handlePatientSelect(patient)}
                             className="group flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all duration-200 hover:shadow-md"
                           >
                             <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                               <span className="text-white font-bold text-lg">
                                 {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                               </span>
                             </div>
                             <div className="flex-1 min-w-0">
                               <p className="font-semibold text-base text-slate-900 group-hover:text-blue-700 transition-colors">
                                 {patient.firstName} {patient.middleName && `${patient.middleName} `}{patient.lastName}
                               </p>
                               <div className="flex items-center gap-2 mt-1 flex-wrap">
                                 <p className="text-sm text-slate-600">ID: {patient.patientId}</p>
                                 <span className="text-slate-300">•</span>
                                 <p className="text-sm text-slate-600">{patient.phone}</p>
                                 {age && (
                                   <>
                                     <span className="text-slate-300">•</span>
                                     <p className="text-sm text-slate-600">{age} years</p>
                                   </>
                                 )}
                                 {patient.gender && (
                                   <>
                                     <span className="text-slate-300">•</span>
                                     <p className="text-sm text-slate-600 capitalize">{patient.gender.toLowerCase()}</p>
                                   </>
                                 )}
                               </div>
                             </div>
                             <Button 
                               size="sm" 
                               className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm group-hover:shadow-md transition-all"
                             >
                               Select
                             </Button>
                           </div>
                         );
                       })
                     )}
                   </div>
                 </div>
               </div>
             </DialogContent>
           </Dialog>

           <Button
             className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
             onClick={() => setIsPatientDrawerOpen(true)}
           >
             <UserPlus className="mr-2 h-4 w-4" />
             Walk-in Registration
           </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        
        {/* LEFT: Selected Patient Information */}
        <Card className="lg:col-span-1 border-slate-200 shadow-sm bg-white flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-800 text-lg">Patient Information</h2>
            <p className="text-xs text-slate-500">Selected patient details</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {!selectedPatient ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <User className="h-16 w-16 mb-3 text-slate-300" />
                <p className="text-sm font-medium text-slate-500 mb-1">No Patient Selected</p>
                <p className="text-xs text-center text-slate-400 max-w-xs">
                  Use "Walk-in Registration" or "Find Patient" to select a patient
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Patient Header */}
                <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-blue-700">
                      {selectedPatient.firstName.charAt(0)}{selectedPatient.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                      {selectedPatient.firstName} {selectedPatient.middleName && `${selectedPatient.middleName} `}{selectedPatient.lastName}
                    </h3>
                    <p className="text-sm text-slate-500">Patient ID: {selectedPatient.patientId}</p>
                  </div>
                </div>

                {/* Demographics */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Demographics</h4>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">
                        {selectedPatient.dateOfBirth 
                          ? `${format(new Date(selectedPatient.dateOfBirth), 'MMM dd, yyyy')} (${calculateAge(selectedPatient.dateOfBirth)} years)`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <User className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 capitalize">{selectedPatient.gender.toLowerCase()}</span>
                    </div>
                    {selectedPatient.bloodType && (
                      <div className="flex items-center gap-3 text-sm">
                        <Heart className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">Blood Type: {selectedPatient.bloodType}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Contact</h4>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">{selectedPatient.phone}</span>
                    </div>
                    {selectedPatient.email && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600 break-all">{selectedPatient.email}</span>
                      </div>
                    )}
                    {selectedPatient.address && (
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                        <span className="text-slate-600">{selectedPatient.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="pt-4 border-t border-slate-100">
                  <Badge className={`${
                    selectedPatient.status === 'ACTIVE' 
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  } border-none shadow-none`}>
                    {selectedPatient.status}
                  </Badge>
                </div>

                {/* Clear Selection Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-slate-200 text-slate-600 hover:bg-slate-50"
                  onClick={() => {
                    setSelectedPatient(null);
                    setVitalsData({
                      bpSystolic: '',
                      bpDiastolic: '',
                      heartRate: '',
                      temperature: '',
                      weight: '',
                      height: '',
                      notes: '',
                    });
                  }}
                >
                  Clear Selection
                </Button>
              </div>
            )}
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
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </strong></p>
                </div>
                <Badge variant="outline" className="text-xs border-blue-200 bg-blue-50 text-blue-700 px-3 py-1">
                  Step 1 of 2
                </Badge>
              </div>

              {/* Visit Type Selection */}
              <div className="mb-6 pb-6 border-b border-slate-100 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Visit Type <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={visitType} 
                    onValueChange={(value) => {
                      setVisitType(value);
                      if (value !== 'OTHERS') {
                        setCustomVisitType('');
                      }
                    }}
                  >
                    <SelectTrigger className="h-12 text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500/20">
                      <SelectValue placeholder="Select visit type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ROUTINE">Routine</SelectItem>
                      <SelectItem value="FOLLOWUP">Follow-up</SelectItem>
                      <SelectItem value="EMERGENCY">Emergency</SelectItem>
                      <SelectItem value="SPECIALIST">Specialist</SelectItem>
                      <SelectItem value="OTHERS">Others</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 mt-2">
                    Select the type of visit for this patient
                  </p>
                </div>
                
                {/* Custom Visit Type Input - Shows when "Others" is selected */}
                {visitType === 'OTHERS' && (
                  <div className="animate-in fade-in-0 slide-in-from-top-2 duration-200">
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Specify Visit Type <span className="text-red-500">*</span>
                    </label>
                    <Input
                      className="h-12 text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                      placeholder="Enter visit type (e.g., Consultation, Check-up, etc.)"
                      value={customVisitType}
                      onChange={(e) => setCustomVisitType(e.target.value)}
                      required
                    />
                    {!customVisitType.trim() && (
                      <p className="text-xs text-red-600 mt-1">
                        Please specify the visit type
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                {/* Blood Pressure */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <div className="p-1.5 bg-red-50 rounded text-red-600"><Heart className="h-4 w-4" /></div>
                    Blood Pressure
                  </label>
                  <div className="flex gap-2 items-center">
                    <Input 
                      className="text-lg font-mono font-medium h-12 border-slate-200 focus:border-red-400 focus:ring-red-400/20" 
                      placeholder="120"
                      value={vitalsData.bpSystolic}
                      onChange={(e) => handleVitalChange('bpSystolic', e.target.value)}
                      type="number"
                    />
                    <span className="text-xl text-slate-300">/</span>
                    <Input 
                      className="text-lg font-mono font-medium h-12 border-slate-200 focus:border-red-400 focus:ring-red-400/20" 
                      placeholder="80"
                      value={vitalsData.bpDiastolic}
                      onChange={(e) => handleVitalChange('bpDiastolic', e.target.value)}
                      type="number"
                    />
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
                    <Input 
                      className={`text-lg font-mono font-medium h-12 pl-4 pr-12 border-slate-200 focus:border-rose-400 focus:ring-rose-400/20 ${
                        validationErrors.heartRate ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                      }`}
                      placeholder="72"
                      value={vitalsData.heartRate}
                      onChange={(e) => handleVitalChange('heartRate', e.target.value)}
                      type="number"
                    />
                    <span className="absolute right-4 top-3.5 text-sm text-slate-400 font-medium">bpm</span>
                  </div>
                  {validationErrors.heartRate && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors.heartRate}</p>
                  )}
                </div>

                {/* Temperature */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <div className="p-1.5 bg-orange-50 rounded text-orange-600"><Thermometer className="h-4 w-4" /></div>
                    Temperature
                  </label>
                  <div className="relative">
                    <Input 
                      className={`text-lg font-mono font-medium h-12 pl-4 pr-12 border-slate-200 focus:border-orange-400 focus:ring-orange-400/20 ${
                        validationErrors.temperature ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                      }`}
                      placeholder="36.5"
                      value={vitalsData.temperature}
                      onChange={(e) => handleVitalChange('temperature', e.target.value)}
                      type="number"
                      step="0.1"
                    />
                    <span className="absolute right-4 top-3.5 text-sm text-slate-400 font-medium">°C</span>
                  </div>
                  {validationErrors.temperature && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors.temperature}</p>
                  )}
                </div>

                {/* Weight */}
                <div className="space-y-2">
                   <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-50 rounded text-indigo-600"><Weight className="h-4 w-4" /></div>
                    Weight
                  </label>
                  <div className="relative">
                    <Input 
                      className={`text-lg font-mono font-medium h-12 pl-4 pr-12 border-slate-200 focus:border-indigo-400 focus:ring-indigo-400/20 ${
                        validationErrors.weight ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                      }`}
                      placeholder="70"
                      value={vitalsData.weight}
                      onChange={(e) => handleVitalChange('weight', e.target.value)}
                      type="number"
                      step="0.1"
                    />
                    <span className="absolute right-4 top-3.5 text-sm text-slate-400 font-medium">kg</span>
                  </div>
                  {validationErrors.weight && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors.weight}</p>
                  )}
                </div>
                
                {/* Height */}
                <div className="space-y-2">
                   <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 rounded text-blue-600"><Scale className="h-4 w-4" /></div>
                    Height
                  </label>
                  <div className="relative">
                    <Input 
                      className={`text-lg font-mono font-medium h-12 pl-4 pr-12 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 ${
                        validationErrors.height ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                      }`}
                      placeholder="170"
                      value={vitalsData.height}
                      onChange={(e) => handleVitalChange('height', e.target.value)}
                      type="number"
                      step="0.1"
                    />
                    <span className="absolute right-4 top-3.5 text-sm text-slate-400 font-medium">cm</span>
                  </div>
                  {validationErrors.height && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors.height}</p>
                  )}
                </div>

                {/* BMI Display */}
                <div className="space-y-2">
                   <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-50 rounded text-emerald-600"><ActivityPulseIcon className="h-4 w-4" /></div>
                    Calculated BMI
                  </label>
                  <div className="h-12 flex items-center px-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-lg font-mono font-bold text-slate-700">
                      {vitalsData.weight && vitalsData.height 
                        ? (parseFloat(vitalsData.weight) / ((parseFloat(vitalsData.height) / 100) ** 2)).toFixed(1)
                        : '---'}
                    </span>
                    {vitalsData.weight && vitalsData.height && (
                      <Badge className="ml-auto bg-emerald-100 text-emerald-700 border-none">
                        {(() => {
                          const bmi = parseFloat(vitalsData.weight) / ((parseFloat(vitalsData.height) / 100) ** 2);
                          if (bmi < 18.5) return 'Underweight';
                          if (bmi < 25) return 'Normal';
                          if (bmi < 30) return 'Overweight';
                          return 'Obese';
                        })()}
                      </Badge>
                    )}
                  </div>
                </div>

              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="space-y-3">
                   <label className="text-sm font-semibold text-slate-700">Initial Notes / Complaints (Nurse)</label>
                   <textarea 
                     className="w-full h-28 rounded-xl border-slate-200 p-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm resize-none" 
                     placeholder="Patient complains of..."
                     value={vitalsData.notes}
                     onChange={(e) => handleVitalChange('notes', e.target.value)}
                   />
                </div>
              </div>

              <div className="mt-auto pt-6 flex justify-end gap-4">
                 <Button 
                   variant="ghost" 
                   size="lg" 
                   className="text-slate-500"
                   onClick={() => {
                     setSelectedPatient(null);
                     setVisitType('ROUTINE');
                     setCustomVisitType('');
                     setVitalsData({
                       bpSystolic: '',
                       bpDiastolic: '',
                       heartRate: '',
                       temperature: '',
                       weight: '',
                       height: '',
                       notes: '',
                     });
                     setValidationErrors({});
                   }}
                 >
                   Cancel
                 </Button>
                 <Button 
                   size="lg" 
                   className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 px-8 text-base h-12 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                   onClick={handleSendToDoctor}
                   disabled={createVisit.isPending || !isFormValid()}
                 >
                   <Stethoscope className="mr-2 h-5 w-5" />
                   {createVisit.isPending ? 'Sending...' : 'Send to Doctor'}
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
      <PatientFormDrawer
        open={isPatientDrawerOpen}
        onOpenChange={setIsPatientDrawerOpen}
        onSubmit={handleWalkInRegistration}
        isLoading={createPatient.isPending}
      />
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
