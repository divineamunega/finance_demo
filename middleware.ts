import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from './lib/session';

const protectedPaths = ['/', '/transfer', '/deposit', '/withdraw', '/graph-analysis', '/chat'];

export async function middleware(request: NextRequest) {
  if (protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    const sessionCookie = request.cookies.get('session_user_id')?.value;
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const userId = await verify(sessionCookie);
    if (!userId) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session_user_id');
      return response;
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};
