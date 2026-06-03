import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    templateType: { type: String, enum: ['pdf', 'doc', 'docx'], required: true },
    originalFileUrl: { type: String, required: true },
    pdfPreviewUrl: { type: String, required: true },
    fileData: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    description: { type: String }
  },
  { timestamps: true }
);

export default mongoose.models.Template || mongoose.model('Template', TemplateSchema);
