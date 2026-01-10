/**
 * Route helper utilities for language-aware routing
 */

export const DEFAULT_LANGUAGE = 'en';

/**
 * Extract language from pathname
 */
export function getLanguageFromPath(pathname: string): string {
  const match = pathname.match(/^\/([^/]+)/);
  return match ? match[1] : DEFAULT_LANGUAGE;
}

/**
 * Get route with language prefix
 */
export function getLocalizedRoute(path: string, language?: string): string {
  const lang = language || DEFAULT_LANGUAGE;
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `/${lang}/${cleanPath}`;
}

/**
 * Check if route is public (doesn't require authentication)
 */
export function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/sign-in',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
  ];

  // Remove language prefix for checking
  const pathWithoutLang = pathname.replace(/^\/[^/]+/, '');
  return publicRoutes.some(route => pathWithoutLang.startsWith(route));
}

/**
 * Get dashboard route with language
 */
export function getDashboardRoute(language?: string): string {
  return getLocalizedRoute('dashboard', language);
}

/**
 * Get login route with language
 */
export function getLoginRoute(language?: string): string {
  return getLocalizedRoute('sign-in', language);
}

