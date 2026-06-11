import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { requireAdmin, unauthorized } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Template from '@/lib/models/Template';
import { templateUpdateSchema } from '@/lib/validation';

export async function PUT(request, { params }) {
  const session = await requireAdmin();
  if (!session) return unauthorized();
  const userId = session.user.id;

  await connectDB();
  const body = templateUpdateSchema.parse(await request.json());
  const template = await Template.findOneAndUpdate({ _id: params.id, userId }, body, { new: true });
  if (!template) {
    return NextResponse.json({ success: false, message: 'Template not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, template });
}

export async function DELETE(request, { params }) {
  const session = await requireAdmin();
  if (!session) return unauthorized();
  const userId = session.user.id;

  await connectDB();
  const template = await Template.findOne({ _id: params.id, userId });
  if (!template) {
    return NextResponse.json({ success: false, message: 'Template not found' }, { status: 404 });
  }

  await Template.findOneAndDelete({ _id: params.id, userId });
  return NextResponse.json({ success: true });
}
