import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Contract from '@/lib/models/Contract';

export async function GET(request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  await connectDB();
  await Contract.updateMany({ status: { $in: ['pending', 'viewed'] }, expiryDate: { $lt: new Date() } }, { status: 'expired' });

  const [total, signed, pending, expired, recent] = await Promise.all([
    Contract.countDocuments({}),
    Contract.countDocuments({ status: 'signed' }),
    Contract.countDocuments({ status: { $in: ['pending', 'viewed'] } }),
    Contract.countDocuments({ status: 'expired' }),
    Contract.find({}).sort({ createdAt: -1 }).limit(5).lean()
  ]);

  return NextResponse.json({ success: true, stats: { total, signed, pending, expired }, recent });
}
