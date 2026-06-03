import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Document from '@/lib/models/Document';
import { createDocumentFromUpload } from '@/lib/documentService';

export async function GET(request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  await connectDB();
  const documents = await Document.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ success: true, documents });
}

export async function POST(request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    await connectDB();
    const formData = await request.formData();
    const file = formData.get('file');
    const document = await createDocumentFromUpload(file);
    return NextResponse.json({ success: true, document }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
