import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Contract from '@/lib/models/Contract';

export async function DELETE(request, { params }) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  await connectDB();
  const contract = await Contract.findById(params.id);
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
