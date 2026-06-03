import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Document from '@/lib/models/Document';
import Template from '@/lib/models/Template';

export async function POST(request, { params }) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  await connectDB();
  const document = await Document.findById(params.id);
  if (!document) {
    return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
  }

  const template = await Template.create({
    name: document.name,
    templateType: document.documentType,
    originalFileUrl: document.originalFileUrl,
    originalFilePublicId: document.originalFilePublicId,
    pdfPreviewUrl: document.pdfPreviewUrl,
    pdfPreviewPublicId: document.pdfPreviewPublicId,
    description: 'Saved from document library'
  });

  document.isTemplate = true;
  await document.save();

  return NextResponse.json({ success: true, template });
}
