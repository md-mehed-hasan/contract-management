import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Contract from '@/lib/models/Contract';
import { sendContractEmail } from '@/lib/email';
import { formatDate } from '@/utils/dateHelpers';

export async function POST(request, { params }) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  await connectDB();
  const contract = await Contract.findById(params.id);
  if (!contract) {
    return NextResponse.json({ success: false, message: 'Contract not found' }, { status: 404 });
  }
  if (['signed', 'revoked'].includes(contract.status)) {
    return NextResponse.json({ success: false, message: 'This contract can no longer be resent' }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const signLink = `${appUrl}/sign?token=${contract.token}`;
  await sendContractEmail(contract.clientEmail, contract.clientName, contract.documentName, signLink, formatDate(contract.expiryDate), contract.customMessage);

  contract.activityLog.push({ type: 'resent', message: `Signing email resent to ${contract.clientEmail}` });
  await contract.save();

  return NextResponse.json({ success: true });
}
