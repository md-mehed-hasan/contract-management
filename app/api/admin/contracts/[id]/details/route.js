import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { requireAdmin, unauthorized } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Contract from '@/lib/models/Contract';

export async function GET(request, { params }) {
  const session = await requireAdmin();
  if (!session) return unauthorized();
  const userId = session.user.id;

  await connectDB();
  const contract = await Contract.findOne({ _id: params.id, userId }).lean();
  if (!contract) {
    return NextResponse.json({ success: false, message: 'Contract not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, contract });
}
