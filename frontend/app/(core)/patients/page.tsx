'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserPlus, 
  Phone,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  Eye,
  X,
} from "lucide-react";
import { useState, useMemo } from "react";
import { usePatients, useDeletePatient, useUpdatePatientStatus, useCreatePatient, useUpdatePatient, usePatient } from "@/hooks/queries/use-patients";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Pagination } from "@/components/common/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { PatientFormDrawer } from "@/components/features/patients/patient-form-drawer";
import type { CreatePatientInput, UpdatePatientInput } from "@/types/patient.types";

// Helper function to get initials from full name
const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

type SortField = 'firstName' | 'lastName' | 'dateOfBirth' | 'phone' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export default function PatientsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [nameFilter, setNameFilter] = useState("");
  const [dateOfBirthFilter, setDateOfBirthFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);

  // Fetch patients with filters
  const { data, isLoading, error, refetch } = usePatients({
    search: searchTerm || undefined,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    page: currentPage,
    limit: itemsPerPage,
  });

  // Fetch patient data when editing
  const { data: editingPatient } = usePatient(editingPatientId || undefined);

  const deletePatient = useDeletePatient();
  const updateStatus = useUpdatePatientStatus();
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();

  // Client-side sorting for the current page
  const sortedPatients = useMemo(() => {
    if (!data?.data) return [];
    
    const patients = [...data.data];
    
    patients.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'firstName':
          aValue = a.firstName.toLowerCase();
          bValue = b.firstName.toLowerCase();
          break;
        case 'lastName':
          aValue = a.lastName.toLowerCase();
          bValue = b.lastName.toLowerCase();
          break;
        case 'dateOfBirth':
          aValue = new Date(a.dateOfBirth).getTime();
          bValue = new Date(b.dateOfBirth).getTime();
          break;
        case 'phone':
          aValue = a.phone;
          bValue = b.phone;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return patients;
  }, [data?.data, sortField, sortOrder]);

  // Filter by gender, name, and date of birth (client-side)
  const filteredPatients = useMemo(() => {
    let filtered = sortedPatients;
    
    // Gender filter
    if (genderFilter !== "all") {
      filtered = filtered.filter(p => p.gender === genderFilter);
    }
    
    // Name filter
    if (nameFilter) {
      filtered = filtered.filter(p => 
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }
    
    // Date of birth filter
    if (dateOfBirthFilter) {
      filtered = filtered.filter(p => {
        const patientDob = new Date(p.dateOfBirth).toISOString().split('T')[0];
        return patientDob === dateOfBirthFilter;
      });
    }
    
    return filtered;
  }, [sortedPatients, genderFilter, nameFilter, dateOfBirthFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-2 text-slate-400" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-2 text-blue-600" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-2 text-blue-600" />
    );
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      await deletePatient.mutateAsync(id);
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await updateStatus.mutateAsync({ id, status: newStatus });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setGenderFilter("all");
    setNameFilter("");
    setDateOfBirthFilter("");
    setShowFilters(false);
  };

  const hasActiveFilters = searchTerm || statusFilter !== "all" || genderFilter !== "all" || nameFilter || dateOfBirthFilter;

  // Drawer handlers
  const handleAddPatient = () => {
    setEditingPatientId(null);
    setIsDrawerOpen(true);
  };

  const handleEditPatient = (id: string) => {
    setEditingPatientId(id);
    setIsDrawerOpen(true);
  };

  const handleFormSubmit = async (data: CreatePatientInput | UpdatePatientInput) => {
    if (editingPatientId) {
      // Update existing patient
      await updatePatient.mutateAsync({ id: editingPatientId, data: data as UpdatePatientInput });
    } else {
      // Create new patient
      await createPatient.mutateAsync(data as CreatePatientInput);
    }
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setEditingPatientId(null);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-red-500 mb-4">Failed to load patients</div>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 mb-1">Patients</h1>
          <p className="text-slate-600 text-xs md:text-sm lg:text-base">Manage patient records, history, and demographics.</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 px-4 md:px-5 h-9 md:h-10 lg:h-11 rounded-xl transition-all text-sm md:text-base"
          onClick={handleAddPatient}
        >
          <UserPlus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
          Add New Patient
        </Button>
      </div>

      {/* Filters & Search */}
      <Card className="p-1.5 border border-slate-200 shadow-sm bg-white rounded-2xl">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 md:left-4 top-2.5 md:top-3.5 h-4 w-4 md:h-5 md:w-5 text-slate-400" />
              <Input 
                placeholder="Search by name, phone, or ID..." 
                className="pl-9 md:pl-12 h-9 md:h-10 lg:h-12 bg-slate-50 border-none focus-visible:ring-0 focus-visible:bg-slate-100 placeholder:text-slate-400 text-xs md:text-sm lg:text-base rounded-xl transition-all"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 md:right-4 top-2.5 md:top-3.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              )}
            </div>
            <Button 
              variant="ghost" 
              className={`h-9 md:h-10 lg:h-12 px-4 md:px-6 rounded-xl text-xs md:text-sm lg:text-base ${showFilters ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="ml-2 h-2 w-2 rounded-full bg-blue-600"></span>
              )}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-3 px-2 pb-2 pt-2 border-t border-slate-100">
              <Input
                placeholder="Filter by name..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="w-[180px] h-10 rounded-lg text-sm"
              />

              <Input
                type="date"
                placeholder="Date of Birth"
                value={dateOfBirthFilter}
                onChange={(e) => setDateOfBirthFilter(e.target.value)}
                className="w-[180px] h-10 rounded-lg text-sm"
              />

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] h-10 rounded-lg text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-[180px] h-10 rounded-lg text-sm">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="h-10 text-sm"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Table List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <LoadingSpinner />
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No patients found</h3>
            <p>
              {searchTerm
                ? `We couldn't find any patients matching "${searchTerm}"`
                : "Start by adding your first patient"}
            </p>
            {!searchTerm && (
              <Button className="mt-4" onClick={handleAddPatient}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Patient
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 text-left">
                      <button
                        onClick={() => handleSort('firstName')}
                        className="flex items-center font-semibold text-slate-600 text-xs md:text-sm hover:text-slate-900 transition-colors"
                      >
                        Patient Name
                        {getSortIcon('firstName')}
                      </button>
                    </th>
                    <th className="px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 text-left">
                      <button
                        onClick={() => handleSort('dateOfBirth')}
                        className="flex items-center font-semibold text-slate-600 text-xs md:text-sm hover:text-slate-900 transition-colors"
                      >
                        Demographics
                        {getSortIcon('dateOfBirth')}
                      </button>
                    </th>
                    <th className="px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 text-left">
                      <button
                        onClick={() => handleSort('phone')}
                        className="flex items-center font-semibold text-slate-600 text-xs md:text-sm hover:text-slate-900 transition-colors"
                      >
                        Contact
                        {getSortIcon('phone')}
                      </button>
                    </th>
                    <th className="px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 text-left">
                      <button
                        onClick={() => handleSort('dateOfBirth')}
                        className="flex items-center font-semibold text-slate-600 text-xs md:text-sm hover:text-slate-900 transition-colors"
                      >
                        Birthdate
                        {getSortIcon('dateOfBirth')}
                      </button>
                    </th>
                    <th className="px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 text-left">
                      <button
                        onClick={() => handleSort('createdAt')}
                        className="flex items-center font-semibold text-slate-600 text-xs md:text-sm hover:text-slate-900 transition-colors"
                      >
                        Registered
                        {getSortIcon('createdAt')}
                      </button>
                    </th>
                    <th className="px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 text-left font-semibold text-slate-600 text-xs md:text-sm">Status</th>
                    <th className="px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 text-right font-semibold text-slate-600 text-xs md:text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.map((patient) => {
                    const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
                    
                    return (
                      <tr 
                        key={patient.id} 
                        className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                        onClick={() => router.push(`/patients/${patient.id}`)}
                      >
                        <td className="px-3 md:px-4 lg:px-6 py-3 md:py-4">
                          <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
                            <div className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center text-blue-600 font-bold text-xs md:text-sm shadow-sm">
                              {getInitials(patient.firstName, patient.lastName)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs md:text-sm lg:text-base">
                                {patient.firstName} {patient.middleName ? `${patient.middleName} ` : ''}{patient.lastName}
                              </div>
                              <div className="text-[10px] md:text-xs lg:text-sm text-slate-500 font-medium">
                                ID: {patient.patientId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 md:px-4 lg:px-6 py-3 md:py-4">
                          <div className="font-medium text-slate-900 text-xs md:text-sm">{age} Years</div>
                          <div className="text-[10px] md:text-xs lg:text-sm text-slate-500">{patient.gender}</div>
                        </td>
                        <td className="px-3 md:px-4 lg:px-6 py-3 md:py-4">
                          <div className="flex items-center gap-1.5 md:gap-2.5 text-slate-600">
                            <div className="p-1 md:p-1.5 bg-slate-100 rounded-lg">
                              <Phone className="h-2.5 w-2.5 md:h-3.5 md:w-3.5" />
                            </div>
                            <span className="font-medium text-xs md:text-sm">{patient.phone}</span>
                          </div>
                          {patient.email && (
                            <div className="text-[10px] md:text-xs text-slate-500 mt-1">{patient.email}</div>
                          )}
                        </td>
                        <td className="px-3 md:px-4 lg:px-6 py-3 md:py-4">
                          <span className="font-medium text-xs md:text-sm text-slate-900">
                            {format(new Date(patient.dateOfBirth), 'MMM dd, yyyy')}
                          </span>
                        </td>
                        <td className="px-3 md:px-4 lg:px-6 py-3 md:py-4">
                          <div className="flex items-center gap-1.5 md:gap-2.5 text-slate-900">
                            <Calendar className="h-3 w-3 md:h-4 md:w-4 text-slate-400" />
                            <span className="font-medium text-xs md:text-sm">
                              {format(new Date(patient.createdAt), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 md:px-4 lg:px-6 py-3 md:py-4">
                          <span className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded-md text-[9px] md:text-[10px] font-semibold ${
                            patient.status === 'ACTIVE' 
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {patient.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 md:h-9 md:w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <MoreHorizontal className="h-4 w-4 md:h-5 md:w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 md:w-48 text-xs md:text-sm">
                              <DropdownMenuItem onClick={() => router.push(`/patients/${patient.id}`)}>
                                <Eye className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditPatient(patient.id)}>
                                <Edit className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                                Edit Patient
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleStatusToggle(patient.id, patient.status)}
                              >
                                <Calendar className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                                {patient.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600"
                                onClick={() => handleDelete(patient.id, `${patient.firstName}${patient.middleName ? ` ${patient.middleName}` : ''} ${patient.lastName}`)}
                              >
                                <Trash2 className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                                Delete Patient
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data?.meta && data.meta.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={data.meta.totalPages}
                totalItems={data.meta.total}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>

      {/* Patient Form Drawer */}
      <PatientFormDrawer
        open={isDrawerOpen}
        onOpenChange={handleDrawerClose}
        patient={editingPatient}
        onSubmit={handleFormSubmit}
        isLoading={createPatient.isPending || updatePatient.isPending}
      />
    </div>
  );
}
