import micromatch from 'micromatch';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

import env from './lib/env';

// Constants for security headers
const SECURITY_HEADERS = {
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=()',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-site',
} as const;

// Generate CSP
const generateCSP = (): string => {
  const policies = {
    'default-src': ["'self'"],
    'img-src': [
      "'self'",
      'boxyhq.com',
      '*.boxyhq.com',
      '*.dicebear.com',
      'data:',
    ],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      '*.gstatic.com',
      '*.google.com',
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    'connect-src': [
      "'self'",
      '*.google.com',
      '*.gstatic.com',
      'boxyhq.com',
      '*.ingest.sentry.io',
      '*.mixpanel.com',
    ],
    'frame-src': ["'self'", '*.google.com', '*.gstatic.com'],
    'font-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  };

  return Object.entries(policies)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .concat(['upgrade-insecure-requests'])
    .join('; ');
};

// Add routes that don't require authentication
const unAuthenticatedRoutes = [
  '/api/hello',
  '/api/health',
  '/api/auth/**',
  '/api/oauth/**',
  '/api/invitations/*',
  '/api/webhooks/stripe',
  '/auth/**',
  '/invitations/*',
  '/terms-condition',
  '/unlock-account',
  '/.well-known/*',
];

// Use NextAuth v4 middleware pattern
export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Bypass routes that don't require authentication
  if (micromatch.isMatch(pathname, unAuthenticatedRoutes)) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  const token = await getToken({ req, secret: env.nextAuth.secret });

  if (!token) {
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('callbackUrl', encodeURI(req.url));
    return NextResponse.redirect(redirectUrl);
  }

  // Set security headers
  const requestHeaders = new Headers(req.headers);
  const csp = generateCSP();

  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (env.securityHeadersEnabled) {
    // Set security headers
    response.headers.set('Content-Security-Policy', csp);
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  // All good, let the request through
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
};
