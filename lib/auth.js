import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './authOptions';

export function unauthorized() {
  return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return null;
  return session;
}
