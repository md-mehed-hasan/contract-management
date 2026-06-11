import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { requireAdmin, unauthorized } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Contract from '@/lib/models/Contract';

export async function GET(request) {
  const session = await requireAdmin();
  if (!session) return unauthorized();
  const userId = session.user.id;

  await connectDB();
  await Contract.updateMany({ userId, status: { $in: ['pending', 'viewed'] }, expiryDate: { $lt: new Date() } }, { status: 'expired' });

  const [total, signed, pending, expired, recent] = await Promise.all([
    Contract.countDocuments({ userId }),
    Contract.countDocuments({ userId, status: 'signed' }),
    Contract.countDocuments({ userId, status: { $in: ['pending', 'viewed'] } }),
    Contract.countDocuments({ userId, status: 'expired' }),
    Contract.find({ userId }).sort({ createdAt: -1 }).limit(5).lean()
  ]);

  return NextResponse.json({ success: true, stats: { total, signed, pending, expired }, recent });
}
