import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Template from '@/lib/models/Template';
import Contract from '@/lib/models/Contract';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { collection, id } = params;

  try {
    await connectDB();
    
    let model;
    if (collection === 'templates') model = Template;
    else if (collection === 'contracts') model = Contract;
    else return new NextResponse('Invalid collection', { status: 400 });

    const item = await model.findById(id);
    if (!item || !item.fileData) {
      return new NextResponse('File not found', { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', item.contentType || 'application/octet-stream');
    headers.set('Content-Disposition', `inline; filename="${item.name || item.documentName || 'document'}.${item.documentType || 'pdf'}"`);

    return new NextResponse(item.fileData, { status: 200, headers });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
