import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, createRemoteJWKSet } from 'jose';

const PUBLIC_PATHS = ['/login', '/register', '/marketplace', '/', '/api'];

// Firebase Auth JWKS endpoint for your project
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'nextgenoutreach';
const JWKS_URI = `https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`;

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS() {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(JWKS_URI));
  }
  return jwks;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (isPublic) return NextResponse.next();

  if (pathname.startsWith('/dashboard')) {
    const session = request.cookies.get('session')?.value;
    
    // CRITICAL: Verify the JWT is valid, not just present
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify the Firebase ID token
      const { payload } = await jwtVerify(session, getJWKS(), {
        issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
        audience: FIREBASE_PROJECT_ID,
        algorithms: ['RS256'],
        clockTolerance: 60, // Allow 60 seconds of clock skew
      });

      // Validate required claims
      if (!payload.sub || !payload.email) {
        throw new Error('Invalid token payload');
      }

      // Check token expiration (Firebase tokens expire after 1 hour)
      const exp = payload.exp;
      if (exp && Date.now() >= exp * 1000) {
        throw new Error('Token expired');
      }

      // Add role-based redirects for cleaner UX
      const role = (payload.role as string) || 'client';
      
      // Redirect /dashboard root to role-appropriate sub-route
      if (pathname === '/dashboard' || pathname === '/dashboard/') {
        const roleRedirects: Record<string, string> = {
          admin: '/dashboard/admin/overview',
          super_admin: '/dashboard/admin/overview',
          rep: '/dashboard/rep/overview',
          client: '/dashboard/client/overview',
        };
        const redirectTo = roleRedirects[role];
        if (redirectTo) {
          return NextResponse.redirect(new URL(redirectTo, request.url));
        }
      }

      // Role-based access control for admin routes
      const adminRoutes = ['/dashboard/admin'];
      const isAdminRoute = adminRoutes.some((r) => pathname.startsWith(r));
      if (isAdminRoute && !['admin', 'super_admin'].includes(role)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      return NextResponse.next();
    } catch (error) {
      // Token is invalid or expired - clear cookie and redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      loginUrl.searchParams.set('error', 'session_expired');
      
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
