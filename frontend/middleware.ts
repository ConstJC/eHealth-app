import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutePaths = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Simple redirect from root to dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // TODO: Add auth token verification here if needed in the future
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
