import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const hasGuest = request.cookies.get('guest_id')?.value;
  if (!hasGuest) {
    // Use Web Crypto in Edge runtime
    const id = `guest_${crypto.randomUUID()}`;
    response.cookies.set('guest_id', id, {
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 365 // 1 year
    });
  }
  return response;
}

// Apply to all routes except Next internals and static assets
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};

