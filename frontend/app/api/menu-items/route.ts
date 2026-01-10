import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4081/api/v1';

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: string | null;
  order: number;
  parentId: string | null;
  children?: MenuItem[];
}

export async function GET(request: NextRequest) {
  try {
    // Get access token from request headers
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Authorization header required' },
        { status: 401 }
      );
    }

    const response = await axios.get<MenuItem[]>(
      `${BACKEND_API_URL}/menu-items/my-menu`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
      }
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } }).response?.status || 500;
    const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch menu items';

    return NextResponse.json({ message }, { status });
  }
}

