import { NextResponse } from 'next/server';

export const ADMIN_EMAIL = 'admin@soas.com';
export const ADMIN_PASSWORD = 'SOASAdmin@2026';

export function isAdminRequest(request) {
  return request.cookies.get('admin_session')?.value === 'true';
}

export function unauthorized() {
  return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
}

export function requireAdmin(request) {
  if (!isAdminRequest(request)) return unauthorized();
  return null;
}
