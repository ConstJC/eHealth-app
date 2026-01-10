import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DEFAULT_LANGUAGE } from '@/lib/constants';

// Public routes that don't require authentication (without language prefix)
const publicRoutePaths = [
  '/sign-in',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

// Check if route is an auth route (should use auth layout)
function isAuthRoute(routePath: string): boolean {
  return publicRoutePaths.some(path => routePath.startsWith(path));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect root to default language
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${DEFAULT_LANGUAGE}/dashboard`, request.url));
  }

  // Extract language from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const language = pathSegments[0];
  const routePath = '/' + pathSegments.slice(1).join('/');

  // Check if route is public (checking the route path without language)
  const isPublicRoute = publicRoutePaths.some(route => 
    routePath.startsWith(route)
  );

  // Allow public routes and API routes
  if (isPublicRoute || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Validate language code (optional - you can add more validation)
  const validLanguages = ['en', 'es', 'fr']; // Add more as needed
  if (language && !validLanguages.includes(language)) {
    // Redirect invalid language to default
    return NextResponse.redirect(new URL(`/${DEFAULT_LANGUAGE}${routePath}`, request.url));
  }

  // Check if user is trying to access dashboard without auth
  // In a real app, you'd verify the token here
  // For now, we'll let the client-side handle redirects
  // The auth store will handle redirecting unauthenticated users

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

