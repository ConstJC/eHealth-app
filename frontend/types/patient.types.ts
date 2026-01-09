export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum PatientStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | string;
  gender: Gender;
  phone: string;
  email?: string;
  address?: string;
  photoUrl?: string;
  status: PatientStatus;
  allergies: string[];
  chronicConditions: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreatePatientInput {
  firstName: string;
  lastName: string;
  dateOfBirth: Date | string;
  gender: Gender;
  phone: string;
  email?: string;
  address?: string;
  allergies?: string[];
  chronicConditions?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface UpdatePatientInput extends Partial<CreatePatientInput> {
  status?: PatientStatus;
}

export interface PatientSearchParams {
  search?: string;
  status?: PatientStatus;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

