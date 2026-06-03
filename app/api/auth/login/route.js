import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '@/lib/auth';

export async function POST(request) {
  const { email, password } = await request.json();

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const response = NextResponse.json({ success: true, message: 'Login successful' });
    response.cookies.set('admin_session', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/'
    });
    return response;
  }

  return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
}
