import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { requireAdmin } from '@/lib/auth';
import { deleteCloudinaryAsset } from '@/lib/cloudinary';
import { connectDB } from '@/lib/mongodb';
import Document from '@/lib/models/Document';

export async function DELETE(request, { params }) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  await connectDB();
  const document = await Document.findById(params.id);
  if (!document) {
    return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
  }

  await deleteCloudinaryAsset(document.originalFilePublicId).catch(() => null);
  await Document.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
