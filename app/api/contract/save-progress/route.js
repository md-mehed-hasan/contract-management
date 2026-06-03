import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/mongodb';
import Contract from '@/lib/models/Contract';
import { progressSchema } from '@/lib/validation';
import { isExpired } from '@/utils/dateHelpers';

export async function POST(request) {
  try {
    await connectDB();
    const body = progressSchema.parse(await request.json());
    const contract = await Contract.findOne({ token: body.token });

    if (!contract || ['revoked', 'signed'].includes(contract.status) || isExpired(contract.expiryDate)) {
      return NextResponse.json({ success: false, message: 'Signing session is not available' }, { status: 400 });
    }

    contract.signatureData = body.signatureData;
    contract.activityLog.push({ type: 'saved', message: 'Client saved signing progress' });
    await contract.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
