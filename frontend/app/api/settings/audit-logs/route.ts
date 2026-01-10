import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || API_BASE_URL;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const queryParams = new URLSearchParams();
    if (searchParams.get('page')) queryParams.append('page', searchParams.get('page')!);
    if (searchParams.get('limit')) queryParams.append('limit', searchParams.get('limit')!);
    if (searchParams.get('userId')) queryParams.append('userId', searchParams.get('userId')!);
    if (searchParams.get('action')) queryParams.append('action', searchParams.get('action')!);
    if (searchParams.get('entityType')) queryParams.append('entityType', searchParams.get('entityType')!);
    if (searchParams.get('startDate')) queryParams.append('startDate', searchParams.get('startDate')!);
    if (searchParams.get('endDate')) queryParams.append('endDate', searchParams.get('endDate')!);

    // Note: Audit logs endpoint may need to be implemented in backend
    // For now, return empty response or placeholder
    const response = await axios.get(
      `${BACKEND_API_URL}/audit-logs?${queryParams.toString()}`,
      {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      }
    ).catch(() => {
      // Return empty response if endpoint doesn't exist yet
      return {
        data: {
          logs: [],
          pagination: {
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '20'),
            total: 0,
            pages: 0,
          },
        },
      };
    });

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { message: error.response?.data?.message || 'Failed to fetch audit logs' },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

