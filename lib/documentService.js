import { uploadBufferToCloudinary } from '@/lib/cloudinary';
import Document from '@/lib/models/Document';
import Template from '@/lib/models/Template';
import { getDocumentType, validateUpload } from '@/lib/validation';

export async function fileToBuffer(file) {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function createDocumentFromUpload(file, { isTemplate = false, description = '' } = {}) {
  const validationError = validateUpload(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const buffer = await fileToBuffer(file);
  const result = await uploadBufferToCloudinary(buffer, file.name, isTemplate ? 'soas_contracts/templates' : 'soas_contracts/documents');
  const documentType = getDocumentType(file.name);

  const payload = {
    name: file.name,
    documentType,
    originalFileUrl: result.secure_url,
    originalFilePublicId: result.public_id,
    pdfPreviewUrl: result.secure_url,
    pdfPreviewPublicId: result.public_id,
    size: file.size
  };

  if (isTemplate) {
    return Template.create({
      name: file.name,
      templateType: documentType,
      originalFileUrl: result.secure_url,
      originalFilePublicId: result.public_id,
      pdfPreviewUrl: result.secure_url,
      pdfPreviewPublicId: result.public_id,
      description
    });
  }

  return Document.create({ ...payload, isTemplate: false });
}
