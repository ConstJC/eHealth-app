import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import type { LoginCredentials, AuthResponse } from '@/types';

// Get backend API URL - use environment variable or fallback
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4081/api/v1';

export async function POST(request: NextRequest) {
  try {
    const body: LoginCredentials = await request.json();
    console.log(BACKEND_API_URL);
    
    // Call backend API directly
    const response = await axios.post<AuthResponse>(
      `${BACKEND_API_URL}/auth/login`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Login failed';
    
    return NextResponse.json(
      { message },
      { status }
    );
  }
}

