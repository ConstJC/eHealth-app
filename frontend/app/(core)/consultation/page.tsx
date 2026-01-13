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
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useVisits, useUpdateVisit, useCompleteVisit } from "@/hooks/queries/use-visits";
import { useCertificates } from "@/hooks/use-certificates";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ConsultationPage() {
  const [activeTab, setActiveTab] = useState("soap");
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [selectedCertType, setSelectedCertType] = useState<string | null>(null);
  
  const [soapData, setSoapData] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });

  const [certFormData, setCertFormData] = useState({
    diagnosis: "",
    recommendation: "",
    startDate: "",
    endDate: "",
    returnDate: "",
  });

  // Fetch visits with status IN_PROGRESS
  const { data: visits, isLoading: visitsLoading, refetch: refetchVisits } = useVisits({ 
    status: 'IN_PROGRESS' 
  });
  
  const updateVisit = useUpdateVisit();
  const completeVisit = useCompleteVisit();
  const { createCertificate, downloadCertificate, isLoading: certLoading } = useCertificates();

  const selectedVisit = visits?.find((v: any) => v.id === selectedVisitId);

  // Auto-select first visit if none selected
  useEffect(() => {
    if (visits && visits.length > 0 && !selectedVisitId) {
      setSelectedVisitId(visits[0].id);
    }
  }, [visits, selectedVisitId]);

  // Load SOAP data when visit is selected
  useEffect(() => {
    if (selectedVisit?.soap) {
      setSoapData({
        subjective: selectedVisit.soap.subjective || '',
        objective: selectedVisit.soap.objective || '',
        assessment: selectedVisit.soap.assessment || '',
        plan: selectedVisit.soap.plan || '',
      });
    } else {
      setSoapData({
        subjective: '',
        objective: '',
        assessment: '',
        plan: '',
      });
    }
  }, [selectedVisit]);

  const handleSoapChange = (field: keyof typeof soapData, value: string) => {
    setSoapData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSOAP = async () => {
    if (!selectedVisitId) return;
    
    try {
      await updateVisit.mutateAsync({
        id: selectedVisitId,
        data: { soap: soapData }
      });
    } catch (err) {
      console.error('Failed to save SOAP notes:', err);
    }
  };

  const handleCompleteVisit = async () => {
    if (!selectedVisitId) return;
    
    if (!soapData.assessment || !soapData.plan) {
      toast.error('Please complete at least Assessment and Plan before completing the visit.');
      return;
    }

    try {
      // Save SOAP notes first
      await updateVisit.mutateAsync({
        id: selectedVisitId,
        data: { soap: soapData }
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

  const calculateBMI = (weight?: number, height?: number) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
      
      {/* LEFT: Patient Queue (Doctor's Line) */}
      <Card className="lg:col-span-1 border-slate-200 shadow-sm flex flex-col overflow-hidden bg-white">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              Active Consultations
            </h2>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
              {visits?.length || 0} Patients
            </Badge>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-3">
            {visitsLoading ? (
              <div className="flex justify-center p-8"><LoadingSpinner /></div>
            ) : !visits || visits.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No patients in consultation</p>
              </div>
            ) : visits.map((visit: any) => (
              <div 
                key={visit.id}
                onClick={() => setSelectedVisitId(visit.id)}
                className={`group p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedVisitId === visit.id 
                    ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-500/20' 
                    : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      selectedVisitId === visit.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {visit.patient.firstName.charAt(0)}{visit.patient.lastName.charAt(0)}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block text-sm">
                        {visit.patient.firstName} {visit.patient.lastName}
                      </span>
                      <span className="text-xs text-slate-500">{visit.visitType}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded-md text-slate-600">
                    {format(new Date(visit.visitDate), "hh:mm a")}
                  </span>
                </div>
                
                {selectedVisitId === visit.id && (
                  <div className="mt-3 pt-3 border-t border-blue-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-700 flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                      In Consultation
                    </span>
                    <ChevronRight className="h-4 w-4 text-blue-400" />
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
            <Card className="p-4 border-slate-200 shadow-sm bg-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                  {selectedVisit.patient.firstName[0]}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    {selectedVisit.patient.firstName} {selectedVisit.patient.lastName}
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none shadow-none font-semibold">Active</Badge>
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" /> 
                      {new Date().getFullYear() - new Date(selectedVisit.patient.dateOfBirth).getFullYear()} Years, {selectedVisit.patient.gender}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <HistoryIcon className="h-3.5 w-3.5" /> 
                      Visit Date: {format(new Date(selectedVisit.visitDate), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="text-slate-600 border-slate-200 hover:bg-slate-50"
                  onClick={handleSaveSOAP}
                  disabled={updateVisit.isPending}
                >
                  {updateVisit.isPending ? <LoadingSpinner /> : 'Save Notes'}
                </Button>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                  onClick={handleCompleteVisit}
                  disabled={completeVisit.isPending}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {completeVisit.isPending ? 'Completing...' : 'Complete Session'}
                </Button>
              </div>
            </Card>

            {/* Main Workspace */}
            <div className="flex-1 grid grid-cols-3 gap-5 min-h-0">
              
              {/* Vitals & History Panel */}
              <div className="col-span-1 space-y-5 overflow-y-auto pr-1">
                {/* Vitals Summary */}
                <Card className="p-5 border-slate-200 shadow-sm bg-blue-50/50">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ActivityPulseIcon className="h-4 w-4 text-blue-600" />
                    Current Vitals
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <VitalDisplay 
                      label="BP" 
                      value={selectedVisit.vitals?.bpSystolic && selectedVisit.vitals?.bpDiastolic 
                        ? `${selectedVisit.vitals.bpSystolic}/${selectedVisit.vitals.bpDiastolic}` 
                        : 'N/A'} 
                      unit="mmHg" 
                    />
                    <VitalDisplay 
                      label="HR" 
                      value={selectedVisit.vitals?.heartRate?.toString() || 'N/A'} 
                      unit="bpm" 
                    />
                    <VitalDisplay 
                      label="Temp" 
                      value={selectedVisit.vitals?.temperature?.toString() || 'N/A'} 
                      unit="°C" 
                    />
                    <VitalDisplay 
                      label="Weight" 
                      value={selectedVisit.vitals?.weight?.toString() || 'N/A'} 
                      unit="kg" 
                    />
                    <VitalDisplay 
                      label="Height" 
                      value={selectedVisit.vitals?.height?.toString() || 'N/A'} 
                      unit="cm" 
                    />
                    <VitalDisplay 
                      label="BMI" 
                      value={calculateBMI(selectedVisit.vitals?.weight, selectedVisit.vitals?.height) || 'N/A'} 
                      unit="" 
                    />
                  </div>
                  {selectedVisit.vitals?.notes && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-blue-100">
                      <p className="text-xs font-semibold text-slate-600 mb-1">Nurse Notes:</p>
                      <p className="text-sm text-slate-700">{selectedVisit.vitals.notes}</p>
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
              <Card className="col-span-2 border-slate-200 shadow-sm bg-white flex flex-col overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                  <div className="px-5 pt-4 border-b border-slate-100">
                    <TabsList className="bg-slate-100">
                      <TabsTrigger value="soap" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">SOAP Notes</TabsTrigger>
                      <TabsTrigger value="rx" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Prescription</TabsTrigger>
                      <TabsTrigger value="certificates" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Certificates</TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 overflow-y-auto bg-slate-50/30 p-6">
                    <TabsContent value="soap" className="mt-0 space-y-6 h-full">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">S</span>
                          Subjective (Chief Complaint)
                        </label>
                        <textarea 
                          className="w-full h-24 rounded-xl border-slate-200 bg-white p-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm resize-none"
                          placeholder="Patient reports..."
                          value={soapData.subjective}
                          onChange={(e) => handleSoapChange('subjective', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">O</span>
                          Objective (Observations)
                        </label>
                        <textarea 
                          className="w-full h-24 rounded-xl border-slate-200 bg-white p-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm resize-none"
                          placeholder="Physical exam findings..."
                          value={soapData.objective}
                          onChange={(e) => handleSoapChange('objective', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">A</span>
                          Assessment (Diagnosis)
                        </label>
                        <div className="relative">
                          <AlertCircle className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                          <input 
                            type="text"
                            className="w-full h-11 pl-10 pr-4 rounded-xl border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                            placeholder="Enter diagnosis (ICD-10 optional)..."
                            value={soapData.assessment}
                            onChange={(e) => handleSoapChange('assessment', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold">P</span>
                          Plan (Treatment)
                        </label>
                        <textarea 
                          className="w-full h-24 rounded-xl border-slate-200 bg-white p-4 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm resize-none"
                          placeholder="Medication, therapy, advice..."
                          value={soapData.plan}
                          onChange={(e) => handleSoapChange('plan', e.target.value)}
                        />
                      </div>

                      <div className="pt-4 border-t border-slate-200">
                        <Button 
                          onClick={handleSaveSOAP}
                          disabled={updateVisit.isPending}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          {updateVisit.isPending ? <LoadingSpinner /> : 'Save SOAP Notes'}
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="rx" className="mt-0 h-full flex items-center justify-center text-slate-400">
                      <div className="text-center">
                        <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p>Prescription module coming soon...</p>
                      </div>
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
    </div>
  );
}

function VitalDisplay({ label, value, unit }: { label: string, value: string, unit: string }) {
  return (
    <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm flex flex-col items-center text-center">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{label}</span>
      <div className="flex items-baseline gap-0.5">
        <span className="text-lg font-bold text-slate-900 leading-none">{value}</span>
        <span className="text-[10px] text-slate-500 font-medium">{unit}</span>
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
