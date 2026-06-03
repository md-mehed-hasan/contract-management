import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Template from '@/lib/models/Template';
import { createDocumentFromUpload } from '@/lib/documentService';

export async function GET(request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  await connectDB();
  const templates = await Template.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ success: true, templates });
}

export async function POST(request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    await connectDB();
    const formData = await request.formData();
    const template = await createDocumentFromUpload(formData.get('file'), {
      isTemplate: true,
      description: formData.get('description') || ''
    });
    return NextResponse.json({ success: true, template }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
