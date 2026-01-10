import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import type { Patient, UpdatePatientInput } from '@/types/patient.types';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4081/api/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');

    const response = await axios.get<Patient>(
      `${BACKEND_API_URL}/patients/${id}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { Authorization: authHeader }),
        },
      }
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } }).response?.status || 500;
    const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch patient';

    return NextResponse.json({ message }, { status });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdatePatientInput = await request.json();
    const authHeader = request.headers.get('authorization');

    const response = await axios.patch<Patient>(
      `${BACKEND_API_URL}/patients/${id}`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { Authorization: authHeader }),
        },
      }
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } }).response?.status || 500;
    const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to update patient';

    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');

    await axios.delete(
      `${BACKEND_API_URL}/patients/${id}`,
      {
        headers: {
          ...(authHeader && { Authorization: authHeader }),
        },
      }
    );

    return NextResponse.json({ message: 'Patient deleted successfully' }, { status: 200 });
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } }).response?.status || 500;
    const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to delete patient';

    return NextResponse.json({ message }, { status });
  }
}

