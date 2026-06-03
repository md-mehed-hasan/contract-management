import { PDFDocument } from 'pdf-lib';

export function dataUrlToBuffer(dataUrl) {
  const base64 = dataUrl.split(',')[1];
  return Buffer.from(base64, 'base64');
}

export async function ensurePdfBuffer(dataUrl) {
  const buffer = dataUrlToBuffer(dataUrl);
  await PDFDocument.load(buffer);
  return buffer;
}
