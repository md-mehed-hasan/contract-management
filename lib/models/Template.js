import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    templateType: { type: String, enum: ['pdf', 'doc', 'docx'], required: true },
    originalFileUrl: { type: String, required: true },
    originalFilePublicId: { type: String },
    pdfPreviewUrl: { type: String, required: true },
    pdfPreviewPublicId: { type: String },
    description: { type: String }
  },
  { timestamps: true }
);

export default mongoose.models.Template || mongoose.model('Template', TemplateSchema);
