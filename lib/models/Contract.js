import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    message: { type: String, required: true },
    at: { type: Date, default: Date.now }
  },
  { _id: false }
);

const ContractSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true, index: true },
    documentName: { type: String, required: true },
    documentType: { type: String, enum: ['pdf', 'doc', 'docx'], required: true },
    originalFileUrl: { type: String, required: true },
    pdfPreviewUrl: { type: String, required: true },
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true, lowercase: true },
    status: { type: String, enum: ['pending', 'viewed', 'signed', 'expired', 'revoked'], default: 'pending', index: true },
    sentDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },
    lastOpened: { type: Date },
    signedDate: { type: Date },
    signedPdfUrl: { type: String },
    signedFileData: { type: Buffer },
    signedContentType: { type: String },
    signatureData: { type: mongoose.Schema.Types.Mixed, default: null },
    customMessage: { type: String },
    viewedCount: { type: Number, default: 0 },
    activityLog: { type: [ActivitySchema], default: [] }
  },
  { timestamps: true }
);

export default mongoose.models.Contract || mongoose.model('Contract', ContractSchema);
