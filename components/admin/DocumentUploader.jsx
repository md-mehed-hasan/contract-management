'use client';

import { Upload } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function DocumentUploader({ endpoint = '/api/admin/documents/upload', onUploaded, template = false }) {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!file) {
      toast.error('Choose a PDF file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    if (template) formData.append('description', description);

    const res = await fetch(endpoint, { method: 'POST', body: formData });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      toast.success(template ? 'Template uploaded' : 'Document uploaded');
      setFile(null);
      setDescription('');
      onUploaded?.();
    } else {
      toast.error(data.message || 'Upload failed');
    }
  };

  return (
    <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-ink">{template ? 'Template file' : 'Document file'}</label>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm file:font-medium"
          />
          {template && (
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              placeholder="Template description"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          )}
          <p className="text-xs text-slate-500">PDF supported only. Maximum file size: 10MB.</p>
        </div>
      </div>
      <button disabled={loading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60 mt-4">
          <Upload size={16} />
          {loading ? 'Uploading...' : 'Upload'}
        </button>
    </form>
  );
}
