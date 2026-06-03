import { z } from 'zod';

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const ALLOWED_TYPES = ['pdf'];

export const sendContractSchema = z.object({
  clientName: z.string().trim().min(1, 'Client name is required'),
  clientEmail: z.string().trim().email('A valid client email is required'),
  templateId: z.string().min(1, 'Choose a template'),
  expiryDate: z.string().optional(),
  customMessage: z.string().optional()
});

export const progressSchema = z.object({
  token: z.string().min(10),
  signatureData: z.any()
});

export const finalizeSchema = z.object({
  token: z.string().min(10),
  signatureData: z.any().optional(),
  signedPdfDataUrl: z.string().startsWith('data:application/pdf;base64,')
});

export const templateUpdateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().optional()
});

export function getDocumentType(filename = '') {
  const match = filename.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match ? match[1] : '';
}

export function validateUpload(file) {
  if (!file) return 'A file is required';
  const type = getDocumentType(file.name);
  if (!ALLOWED_TYPES.includes(type)) return 'Only PDF files are allowed';
  if (file.size > MAX_FILE_SIZE) return 'Maximum file size is 10MB';
  return null;
}
