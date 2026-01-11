export const DEFAULT_LANGUAGE = 'en';

export function getLanguageFromPath(_pathname: string): string {
  return DEFAULT_LANGUAGE;
}

export function getLocalizedRoute(path: string, _language?: string): string {
  // Return path as-is, ignoring language
  return path.startsWith('/') ? path : `/${path}`;
}

export function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
  ];
  return publicRoutes.some(route => pathname.startsWith(route));
}

export function getDashboardRoute(language?: string): string {
  return '/dashboard';
}

export function getLoginRoute(language?: string): string {
  return '/login';
}
