import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/mongodb';
import Contract from '@/lib/models/Contract';
import { isExpired } from '@/utils/dateHelpers';

export async function GET(request) {
  await connectDB();
  const token = new URL(request.url).searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Missing signing token' }, { status: 400 });
  }

  const contract = await Contract.findOne({ token });
  if (!contract) {
    return NextResponse.json({ error: 'Invalid signing token' }, { status: 404 });
  }
  if (contract.status === 'revoked') {
    return NextResponse.json({ error: 'This signing link has been revoked' }, { status: 410 });
  }
  if (contract.status !== 'signed' && isExpired(contract.expiryDate)) {
    contract.status = 'expired';
    contract.activityLog.push({ type: 'expired', message: 'Signing token expired' });
    await contract.save();
    return NextResponse.json({ error: 'This signing link has expired' }, { status: 410 });
  }

  if (contract.status === 'pending') contract.status = 'viewed';
  contract.lastOpened = new Date();
  contract.viewedCount += 1;
  contract.activityLog.push({ type: 'viewed', message: 'Client opened signing link' });
  await contract.save();

  return NextResponse.json({
    data: {
      id: contract._id,
      token: contract.token,
      documentName: contract.documentName,
      pdfPreviewUrl: contract.pdfPreviewUrl,
      status: contract.status,
      clientName: contract.clientName,
      clientEmail: contract.clientEmail,
      expiryDate: contract.expiryDate,
      signedPdfUrl: contract.signedPdfUrl,
      signatureData: contract.signatureData
    }
  });
}
