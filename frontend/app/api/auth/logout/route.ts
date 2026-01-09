import { NextRequest, NextResponse } from 'next/server';
import { tokenStorage } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Clear tokens on the server side if needed
    // For now, we'll just return success as tokens are stored client-side
    tokenStorage.clear();
    
    return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Logout failed' },
      { status: 500 }
    );
  }
}

