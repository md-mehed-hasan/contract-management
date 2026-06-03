import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/mongodb';
import Contract from '@/lib/models/Contract';

export async function GET(_request, { params }) {
  await connectDB();
  const contract = await Contract.findOne({ token: params.token, status: 'signed' }).lean();

  if (!contract?.signedPdfUrl) {
    return NextResponse.json({ success: false, message: 'Signed PDF not found' }, { status: 404 });
  }

  return NextResponse.redirect(contract.signedPdfUrl);
}
