import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Contract from '@/lib/models/Contract';
import Document from '@/lib/models/Document';
import Template from '@/lib/models/Template';
import { sendContractEmail } from '@/lib/email';
import { sendContractSchema } from '@/lib/validation';
import { defaultExpiryDate, formatDate } from '@/utils/dateHelpers';
import { generateToken } from '@/utils/generateToken';

export async function POST(request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    await connectDB();
    const body = sendContractSchema.parse(await request.json());
    const source = body.templateId ? await Template.findById(body.templateId) : await Document.findById(body.documentId);

    if (!source) {
      return NextResponse.json({ success: false, message: 'Selected document or template was not found' }, { status: 404 });
    }

    const token = generateToken();
    const expiryDate = body.expiryDate ? new Date(body.expiryDate) : defaultExpiryDate();
    const documentType = source.documentType || source.templateType;
    const contract = await Contract.create({
      token,
      documentName: source.name,
      documentType,
      originalFileUrl: source.originalFileUrl,
      originalFilePublicId: source.originalFilePublicId,
      pdfPreviewUrl: source.pdfPreviewUrl,
      pdfPreviewPublicId: source.pdfPreviewPublicId,
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      expiryDate,
      customMessage: body.customMessage || '',
      activityLog: [{ type: 'sent', message: `Contract sent to ${body.clientEmail}` }]
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const signLink = `${appUrl}/sign?token=${token}`;
    await sendContractEmail(body.clientEmail, body.clientName, source.name, signLink, formatDate(expiryDate), body.customMessage);

    return NextResponse.json({ success: true, contract, signLink }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
