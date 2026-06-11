import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { requireAdmin, unauthorized } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Template from '@/lib/models/Template';
import { createTemplateFromUpload } from '@/lib/documentService';

export async function GET(request) {
  const session = await requireAdmin();
  if (!session) return unauthorized();
  const userId = session.user.id;

  await connectDB();
  const templates = await Template.find({ userId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ success: true, templates });
}

export async function POST(request) {
  const session = await requireAdmin();
  if (!session) return unauthorized();
  const userId = session.user.id;

  try {
    await connectDB();
    const formData = await request.formData();
    const template = await createTemplateFromUpload(formData.get('file'), {
      description: formData.get('description') || '',
      userId
    });
    return NextResponse.json({ success: true, template }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
