import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { requireAdmin, unauthorized } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Contract from '@/lib/models/Contract';

export async function DELETE(request, { params }) {
  const session = await requireAdmin();
  if (!session) return unauthorized();
  const userId = session.user.id;

  await connectDB();
  const contract = await Contract.findOne({ _id: params.id, userId });
  if (!contract) {
    return NextResponse.json({ success: false, message: 'Contract not found' }, { status: 404 });
  }

  await Contract.findOneAndDelete({ _id: params.id, userId });

  return NextResponse.json({ success: true });
}
