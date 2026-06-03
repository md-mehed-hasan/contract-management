import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Contract from '@/lib/models/Contract';

export async function GET(request, { params }) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  await connectDB();
  const contract = await Contract.findById(params.id).lean();
  if (!contract) {
    return NextResponse.json({ success: false, message: 'Contract not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, contract });
}
