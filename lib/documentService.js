import Template from '@/lib/models/Template';
import { getDocumentType, validateUpload } from '@/lib/validation';
import mongoose from 'mongoose';

export async function fileToBuffer(file) {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function createTemplateFromUpload(file, { description = '' } = {}) {
  const validationError = validateUpload(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const buffer = await fileToBuffer(file);
  const documentType = getDocumentType(file.name);
  const contentType = file.type || 'application/octet-stream';
  
  const newId = new mongoose.Types.ObjectId();
  const url = `/api/files/templates/${newId}`;

  const payload = {
    _id: newId,
    name: file.name,
    documentType,
    originalFileUrl: url,
    pdfPreviewUrl: url,
    fileData: buffer,
    contentType,
    size: file.size
  };

  return Template.create({
    ...payload,
    templateType: documentType,
    description
  });
}
