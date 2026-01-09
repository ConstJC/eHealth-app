import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import type { AuthTokens } from '@/lib/auth';

// Get backend API URL - use environment variable or fallback
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4081/api/v1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;
    
    if (!refreshToken) {
      return NextResponse.json(
        { message: 'Refresh token is required' },
        { status: 400 }
      );
    }
    
    // Call backend API directly
    const response = await axios.post<AuthTokens>(
      `${BACKEND_API_URL}/auth/refresh`,
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Token refresh failed';
    
    return NextResponse.json(
      { message },
      { status }
    );
  }
}

