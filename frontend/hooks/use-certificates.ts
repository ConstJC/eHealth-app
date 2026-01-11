import { useState, useCallback } from 'react';
import api from '@/lib/api-client';

export interface Certificate {
  id: string;
  certificateNo: string;
  patientId: string;
  visitId?: string;
  doctorId: string;
  type: 'SICK_LEAVE' | 'FIT_TO_WORK' | 'MEDICAL_CLEARANCE' | 'REFERRAL_LETTER';
  diagnosis?: string;
  recommendation: string;
  startDate?: string;
  endDate?: string;
  returnDate?: string;
  issuedAt: string;
}

export interface CreateCertificateDto {
  patientId: string;
  visitId?: string;
  type: string;
  diagnosis?: string;
  recommendation: string;
  startDate?: string;
  endDate?: string;
  returnDate?: string;
}

export function useCertificates() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCertificate = useCallback(async (data: CreateCertificateDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<Certificate>('/certificates', data);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create certificate';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPatientCertificates = useCallback(async (patientId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<Certificate[]>(`/certificates/patient/${patientId}`);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch certificates';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const downloadCertificate = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // This will be implemented when backend supports PDF download
      const response = await api.get(`/certificates/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response as any]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to download certificate';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createCertificate,
    getPatientCertificates,
    downloadCertificate,
    isLoading,
    error,
  };
}
