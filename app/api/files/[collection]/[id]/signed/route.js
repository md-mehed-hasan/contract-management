import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Contract from '@/lib/models/Contract';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { collection, id } = params;

  if (collection !== 'contracts') {
    return new NextResponse('Invalid collection', { status: 400 });
  }

  try {
    await connectDB();
    
    const contract = await Contract.findById(id);
    if (!contract || !contract.signedFileData) {
      return new NextResponse('Signed file not found', { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', contract.signedContentType || 'application/pdf');
    headers.set('Content-Disposition', `inline; filename="${contract.documentName || 'signed_document'}.pdf"`);

    return new NextResponse(contract.signedFileData, { status: 200, headers });
  } catch (error) {
    console.error('Error serving signed file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
