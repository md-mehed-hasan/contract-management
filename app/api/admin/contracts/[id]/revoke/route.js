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
  if (contract.status === 'signed') {
    return NextResponse.json({ success: false, message: 'Signed contracts cannot be revoked' }, { status: 400 });
  }

  contract.status = 'revoked';
  contract.activityLog.push({ type: 'revoked', message: 'Signing token revoked by admin' });
  await contract.save();

  return NextResponse.json({ success: true });
}
