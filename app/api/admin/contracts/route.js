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

  const { searchParams } = new URL(request.url);
  const page = Math.max(Number(searchParams.get('page') || 1), 1);
  const limit = Math.min(Math.max(Number(searchParams.get('limit') || 10), 1), 50);
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const query = {};

  if (status && status !== 'all') query.status = status;
  if (search) {
    query.$or = [{ clientName: new RegExp(search, 'i') }, { clientEmail: new RegExp(search, 'i') }, { documentName: new RegExp(search, 'i') }];
  }

  const [contracts, total] = await Promise.all([
    Contract.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Contract.countDocuments(query)
  ]);

  return NextResponse.json({
    success: true,
    contracts,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 }
  });
}
