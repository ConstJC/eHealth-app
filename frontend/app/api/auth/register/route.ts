import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import type { RegisterData } from '@/types';

// Get backend API URL - use environment variable or fallback
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4081/api/v1';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterData = await request.json();
    
    // Call backend API directly
    const response = await axios.post(
      `${BACKEND_API_URL}/auth/register`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    return NextResponse.json(response.data, { status: 201 });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Registration failed';
    
    return NextResponse.json(
      { message },
      { status }
    );
  }
}

