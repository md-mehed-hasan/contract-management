import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    documentType: { type: String, enum: ['pdf', 'doc', 'docx'], required: true },
    originalFileUrl: { type: String, required: true },
    originalFilePublicId: { type: String },
    pdfPreviewUrl: { type: String, required: true },
    pdfPreviewPublicId: { type: String },
    isTemplate: { type: Boolean, default: false },
    size: { type: Number }
  },
  { timestamps: true }
);

export default mongoose.models.Document || mongoose.model('Document', DocumentSchema);
