import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import type { LoginCredentials, AuthResponse } from '@/types';

// Get backend API URL - use environment variable or fallback
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4081/api/v1';

export async function POST(request: NextRequest) {
  try {
    const body: LoginCredentials = await request.json();
    
    // Call backend API with credentials to receive cookies
    const response = await axios.post<AuthResponse>(
      `${BACKEND_API_URL}/auth/login`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true, // Send and receive cookies
      }
    );
    
    // Create Next.js response with data
    const nextResponse = NextResponse.json(response.data, { status: 200 });
    
    // Forward Set-Cookie header from backend to frontend
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
      // Set the cookie in the Next.js response
      setCookieHeader.forEach((cookie) => {
        nextResponse.headers.append('Set-Cookie', cookie);
      });
    }
    
    return nextResponse;
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } }).response?.status || 500;
    const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Login failed';
    
    return NextResponse.json(
      { message },
      { status }
    );
  }
}

