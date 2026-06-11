import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const isAuthPage = req.nextUrl.pathname === '/admin/login' || req.nextUrl.pathname === '/admin/signup';
    const isAuth = !!req.nextauth.token;

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
      return null;
    }

    if (!isAuth) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  },
  {
    callbacks: {
      authorized: () => true // Always call the middleware function above, let it handle logic
    }
  }
);

export const config = {
  matcher: ['/admin/:path*']
};
