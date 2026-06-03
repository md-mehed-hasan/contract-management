'use client';

import { useEffect, useState } from 'react';
import { Edit3, Eye, Send, Trash2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import AdminShell from '@/components/admin/AdminShell';
import DocumentUploader from '@/components/admin/DocumentUploader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTemplates = async () => {
    setLoading(true);
    const data = await fetch('/api/admin/templates').then((res) => res.json());
    setTemplates(data.templates || []);
    setLoading(false);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const renameTemplate = async (template) => {
    const name = window.prompt('Template name', template.name);
    if (!name) return;
    const data = await fetch(`/api/admin/templates/${template._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    }).then((res) => res.json());
    data.success ? toast.success('Template updated') : toast.error(data.message || 'Update failed');
    loadTemplates();
  };

  const deleteTemplate = async (id) => {
    if (!window.confirm('Delete this template?')) return;
    const data = await fetch(`/api/admin/templates/${id}`, { method: 'DELETE' }).then((res) => res.json());
    data.success ? toast.success('Template deleted') : toast.error(data.message || 'Delete failed');
    loadTemplates();
  };

  return (
    <AdminShell title="Templates">
      <div className="space-y-6">
        <DocumentUploader endpoint="/api/admin/templates/upload" template onUploaded={loadTemplates} />
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <h2 className="font-semibold text-ink">Reusable templates</h2>
          </div>
          {loading ? (
            <div className="p-5">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
              {templates.map((template) => (
                <div key={template._id} className="rounded-lg border border-slate-200 p-4">
                  <p className="font-semibold text-ink">{template.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{template.description || 'No description'}</p>
                  <p className="mt-3 text-xs uppercase text-slate-400">{template.templateType}</p>
                  <div className="mt-4 flex gap-1">
                    <a href={template.pdfPreviewUrl} target="_blank" className="rounded-md p-2 text-slate-600 hover:bg-slate-100" title="Preview">
                      <Eye size={16} />
                    </a>
                    <button onClick={() => renameTemplate(template)} className="rounded-md p-2 text-slate-600 hover:bg-slate-100" title="Edit">
                      <Edit3 size={16} />
                    </button>
                    <Link href={`/admin/send?template=${template._id}`} className="rounded-md p-2 text-brand-700 hover:bg-brand-50" title="Create contract">
                      <Send size={16} />
                    </Link>
                    <button onClick={() => deleteTemplate(template._id)} className="rounded-md p-2 text-rose-600 hover:bg-rose-50" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {!templates.length && <p className="text-sm text-slate-500">No templates uploaded yet.</p>}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
