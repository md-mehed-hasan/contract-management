import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { requireAdmin } from '@/lib/auth';
import { deleteCloudinaryAsset } from '@/lib/cloudinary';
import { connectDB } from '@/lib/mongodb';
import Template from '@/lib/models/Template';
import { templateUpdateSchema } from '@/lib/validation';

export async function PUT(request, { params }) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  await connectDB();
  const body = templateUpdateSchema.parse(await request.json());
  const template = await Template.findByIdAndUpdate(params.id, body, { new: true });
  if (!template) {
    return NextResponse.json({ success: false, message: 'Template not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, template });
}

export async function DELETE(request, { params }) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  await connectDB();
  const template = await Template.findById(params.id);
  if (!template) {
    return NextResponse.json({ success: false, message: 'Template not found' }, { status: 404 });
  }

  await deleteCloudinaryAsset(template.originalFilePublicId).catch(() => null);
  await Template.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
