import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { requireAdmin, unauthorized } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Contract from '@/lib/models/Contract';
import Template from '@/lib/models/Template';
import { sendContractEmail } from '@/lib/email';
import { sendContractSchema } from '@/lib/validation';
import { defaultExpiryDate, formatDate } from '@/utils/dateHelpers';
import { generateToken } from '@/utils/generateToken';

export async function POST(request) {
  const session = await requireAdmin();
  if (!session) return unauthorized();
  const userId = session.user.id;

  try {
    await connectDB();
    const body = sendContractSchema.parse(await request.json());
    const source = await Template.findOne({ _id: body.templateId, userId });

    if (!source) {
      return NextResponse.json({ success: false, message: 'Selected template was not found' }, { status: 404 });
    }

    const token = generateToken();
    const expiryDate = body.expiryDate ? new Date(body.expiryDate) : defaultExpiryDate();
    const documentType = source.templateType;
    const contract = await Contract.create({
      userId,
      token,
      documentName: source.name,
      documentType,
      originalFileUrl: source.originalFileUrl,
      pdfPreviewUrl: source.pdfPreviewUrl,
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
