"use server"
import { NextResponse } from 'next/server';
import { verifyUser } from '@/utils/verifyUser';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/login (login page)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|auth/login).*)',
  ]
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Check both authorization header and cookies
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || request.cookies.get('token')?.value;

  // If no token found, redirect to login
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const user = await verifyUser(token);
    if (!user) {
      throw new Error('Invalid token');
    }

    // Clone the request headers and add the user info
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);

    // Return response with modified headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    console.error('Authentication Error:', error);
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}
