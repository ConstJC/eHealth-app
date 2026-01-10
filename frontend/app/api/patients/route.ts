import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import type { Patient, CreatePatientInput, PatientSearchParams, PaginatedResponse } from '@/types/patient.types';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4081/api/v1';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get('status');
    const params: PatientSearchParams = {
      search: searchParams.get('search') || undefined,
      name: searchParams.get('name') || undefined,
      patientId: searchParams.get('patientId') || undefined,
      dateOfBirth: searchParams.get('dateOfBirth') || undefined,
      status: statusParam ? (statusParam as PatientSearchParams['status']) : undefined,
      phone: searchParams.get('phone') || undefined,
      email: searchParams.get('email') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
    };

    // Get access token from request headers
    const authHeader = request.headers.get('authorization');
    
    const response = await axios.get<PaginatedResponse<Patient>>(
      `${BACKEND_API_URL}/patients`,
      {
        params,
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { Authorization: authHeader }),
        },
      }
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } }).response?.status || 500;
    const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch patients';

    return NextResponse.json({ message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePatientInput = await request.json();
    const authHeader = request.headers.get('authorization');

    const response = await axios.post<Patient>(
      `${BACKEND_API_URL}/patients`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { Authorization: authHeader }),
        },
      }
    );

    return NextResponse.json(response.data, { status: 201 });
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } }).response?.status || 500;
    const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to create patient';

    return NextResponse.json({ message }, { status });
  }
}

