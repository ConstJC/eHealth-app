import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import type { AuthTokens } from '@/lib/auth';

// Get backend API URL - use environment variable or fallback
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4081/api/v1';

export async function POST(request: NextRequest) {
  try {
    // Get cookies from the incoming request
    const cookies = request.cookies;
    const cookieHeader = cookies.toString();
    
    // Call backend API with cookies (refresh token is in httpOnly cookie)
    const response = await axios.post<AuthTokens>(
      `${BACKEND_API_URL}/auth/refresh`,
      {}, // Empty body - refresh token comes from cookie
      {
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieHeader, // Forward cookies to backend
        },
        withCredentials: true, // Send and receive cookies
      }
    );
    
    // Create Next.js response with data
    const nextResponse = NextResponse.json(response.data, { status: 200 });
    
    // Forward Set-Cookie header from backend to frontend (for updated refresh token)
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
      setCookieHeader.forEach((cookie) => {
        nextResponse.headers.append('Set-Cookie', cookie);
      });
    }
    
    return nextResponse;
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } }).response?.status || 500;
    const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Token refresh failed';
    
    return NextResponse.json(
      { message },
      { status }
    );
  }
}

