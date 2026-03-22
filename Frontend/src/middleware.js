import { NextResponse } from 'next/server';

export function middleware(request) {
  // Since JWT is in localStorage (not cookies), we do auth check client-side.
  // This middleware only handles the basic routing shell.
  // Client-side auth guard is in AppLayout.jsx.
  const isAuthPage =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup') ||
    request.nextUrl.pathname.startsWith('/forgot-password');

  // Allow all requests through; client-side layout handles redirect
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
