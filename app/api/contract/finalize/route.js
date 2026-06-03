import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { ADMIN_EMAIL } from '@/lib/auth';
import { sendAdminNotification, sendSignedConfirmation } from '@/lib/email';
import { connectDB } from '@/lib/mongodb';
import Contract from '@/lib/models/Contract';
import { finalizeSchema } from '@/lib/validation';
import { isExpired } from '@/utils/dateHelpers';
import { ensurePdfBuffer } from '@/utils/pdfHelpers';

export async function POST(request) {
  try {
    await connectDB();
    const body = finalizeSchema.parse(await request.json());
    const contract = await Contract.findOne({ token: body.token });

    if (!contract || ['revoked', 'signed'].includes(contract.status) || isExpired(contract.expiryDate)) {
      return NextResponse.json({ success: false, message: 'Signing session is not available' }, { status: 400 });
    }

    const pdfBuffer = await ensurePdfBuffer(body.signedPdfDataUrl);

    contract.status = 'signed';
    contract.signedDate = new Date();
    contract.signedPdfUrl = `/api/files/contracts/${contract._id}/signed`;
    contract.signedFileData = pdfBuffer;
    contract.signedContentType = 'application/pdf';
    contract.signatureData = body.signatureData || contract.signatureData;
    contract.activityLog.push({ type: 'signed', message: 'Client submitted final signed contract' });
    await contract.save();

    await Promise.allSettled([
      sendSignedConfirmation(contract.clientEmail, contract.clientName, contract.documentName, contract.signedPdfUrl, pdfBuffer),
      sendAdminNotification(process.env.ADMIN_EMAIL || ADMIN_EMAIL, contract.clientName, contract.documentName, contract.signedDate.toISOString(), contract.signedPdfUrl)
    ]);

    return NextResponse.json({ success: true, signedPdfUrl: contract.signedPdfUrl });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
