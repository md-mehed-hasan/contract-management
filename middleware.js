import { NextResponse } from 'next/server';

export function middleware(request) {
  const adminSession = request.cookies.get('admin_session');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  if (isAdminRoute && !isLoginPage && adminSession?.value !== 'true') {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (isLoginPage && adminSession?.value === 'true') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*'
};
