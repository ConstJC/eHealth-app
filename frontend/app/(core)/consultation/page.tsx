'use client';

import { 
  Stethoscope, 
  Clock, 
  CalendarCheck, 
  ChevronRight,
  AlertCircle,
  History as HistoryIcon,
  FileText,
  User,
  MoreVertical,
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
import { useVisits, Visit } from "@/hooks/use-visits";
import { useCertificates } from "@/hooks/use-certificates";
import { useAppointments } from "@/hooks/use-appointments";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { format } from "date-fns";
import { toast } from "sonner";

const CONSULTATION_QUEUE: any[] = [];

export default function ConsultationPage() {
  const [activeTab, setActiveTab] = useState("soap");
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [queue, setQueue] = useState<Visit[]>([]);
  const [selectedCertType, setSelectedCertType] = useState<string | null>(null);
  const [certFormData, setCertFormData] = useState({
    diagnosis: "",
    recommendation: "",
    startDate: "",
    endDate: "",
    returnDate: "",
  });

  const { getVisits, isLoading: visitsLoading } = useVisits();
  const { createCertificate, downloadCertificate, isLoading: certLoading } = useCertificates();
  const { getAppointments, isLoading: appointmentsLoading } = useAppointments();

  useEffect(() => {
    const loadQueue = async () => {
      try {
        const data = await getAppointments({ status: "ARRIVED" });
        setQueue(data as any);
        if (data.length > 0 && !selectedVisit) {
          // For now, map appointment to visit-like structure
          setSelectedVisit(data[0] as any);
        }
      } catch (err) {
        console.error("Failed to load queue", err);
      }
    };
    loadQueue();
  }, [getAppointments]);

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
      
      {/* LEFT: Patient Queue (Doctor's Line) */}
      <Card className="lg:col-span-1 border-slate-200 shadow-sm flex flex-col overflow-hidden bg-white">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              Waiting List
            </h2>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
              {CONSULTATION_QUEUE.length} Patients
            </Badge>
          </div>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="border-slate-200 text-slate-600 bg-white">Next Up</Badge>
            <Badge variant="outline" className="border-slate-200 text-slate-600 bg-white">Completed</Badge>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-3">
            {appointmentsLoading ? (
              <div className="flex justify-center p-8"><LoadingSpinner /></div>
            ) : queue.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No patients in queue</div>
            ) : queue.map((appt: any) => (
              <div 
                key={appt.id}
                onClick={() => setSelectedVisit(appt)}
                className={`group p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedVisit?.id === appt.id 
                    ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-500/20' 
                    : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      selectedVisit?.id === appt.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {appt.patient.firstName.charAt(0)}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block text-sm">{appt.patient.firstName} {appt.patient.lastName}</span>
                      <span className="text-xs text-slate-500">{appt.reason || 'General Consultation'}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded-md text-slate-600">{format(new Date(appt.startTime), "hh:mm a")}</span>
                </div>
                
                {selectedVisit?.id === appt.id && (
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
        
        {/* Patient Header Card */}
        <Card className="p-4 border-slate-200 shadow-sm bg-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
              {selectedVisit?.patient.firstName[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {selectedVisit?.patient.firstName} {selectedVisit?.patient.lastName}
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none shadow-none font-semibold">Active</Badge>
              </h1>
              <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {selectedVisit ? (new Date().getFullYear() - new Date(selectedVisit.patient.dateOfBirth).getFullYear()) : '?'} Years, {selectedVisit?.patient.gender}</span>
                <span className="flex items-center gap-1.5"><HistoryIcon className="h-3.5 w-3.5" /> Visit Date: {selectedVisit ? format(new Date(selectedVisit.visitDate), "MMM dd, yyyy") : '-'}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" className="text-slate-600 border-slate-200 hover:bg-slate-50">Patient History</Button>
             <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20">
               <CheckCircle2 className="mr-2 h-4 w-4" />
               Complete Session
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
                <VitalDisplay label="BP" value="120/80" unit="mmHg" />
                <VitalDisplay label="HR" value="72" unit="bpm" />
                <VitalDisplay label="Temp" value="36.5" unit="°C" />
                <VitalDisplay label="Weight" value="70" unit="kg" />
                <VitalDisplay label="Height" value="165" unit="cm" />
                <VitalDisplay label="BMI" value="25.7" unit="" />
              </div>
            </Card>

            {/* Previous Conditions */}
            <Card className="p-5 border-slate-200 shadow-sm bg-white">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Ongoing Conditions</h3>
              <div className="space-y-2">
                <Badge variant="outline" className="w-full justify-between py-2 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100">
                  Hypertension <span className="text-xs opacity-70">Diagnosed 2022</span>
                </Badge>
                <Badge variant="outline" className="w-full justify-between py-2 border-slate-200 text-slate-700">
                  Type 2 Diabetes <span className="text-xs opacity-70">Diagnosed 2018</span>
                </Badge>
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
                  <TabsTrigger value="files" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Attachments</TabsTrigger>
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
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="rx" className="mt-0 h-full flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>Prescription module loading...</p>
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
