import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { tokenStorage } from '@/lib/auth';

// Get backend API URL - use environment variable or fallback
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4081/api/v1';

export async function POST(request: NextRequest) {
  try {
    // Get cookies from the incoming request
    const cookies = request.cookies;
    const cookieHeader = cookies.toString();
    
    // Call backend logout endpoint to invalidate refresh token
    try {
      await axios.post(
        `${BACKEND_API_URL}/auth/logout`,
        {}, // Empty body - refresh token comes from cookie
        {
          headers: {
            'Content-Type': 'application/json',
            Cookie: cookieHeader, // Forward cookies to backend
            Authorization: request.headers.get('authorization') || '', // Forward access token
          },
          withCredentials: true,
        }
      );
    } catch {
      // Even if backend call fails, clear client-side state
      // Error is logged but not used
    }
    
    // Clear client-side token storage
    tokenStorage.clear();
    
    // Create response and clear refresh token cookie
    const nextResponse = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );
    
    // Clear the refresh token cookie
    nextResponse.cookies.delete('refreshToken');
    
    return nextResponse;
  } catch {
    return NextResponse.json(
      { message: 'Logout failed' },
      { status: 500 }
    );
  }
}

