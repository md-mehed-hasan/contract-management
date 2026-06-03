'use client';

import { useEffect, useState } from 'react';
import { Eye, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminShell from '@/components/admin/AdminShell';
import DocumentUploader from '@/components/admin/DocumentUploader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDocuments = async () => {
    setLoading(true);
    const data = await fetch('/api/admin/documents').then((res) => res.json());
    setDocuments(data.documents || []);
    setLoading(false);
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const deleteDocument = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    const data = await fetch(`/api/admin/documents/${id}`, { method: 'DELETE' }).then((res) => res.json());
    data.success ? toast.success('Document deleted') : toast.error(data.message || 'Delete failed');
    loadDocuments();
  };

  const saveTemplate = async (id) => {
    const data = await fetch(`/api/admin/documents/${id}/save-as-template`, { method: 'POST' }).then((res) => res.json());
    data.success ? toast.success('Saved as template') : toast.error(data.message || 'Could not save template');
    loadDocuments();
  };

  return (
    <AdminShell title="Documents">
      <div className="space-y-6">
        <DocumentUploader onUploaded={loadDocuments} />
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <h2 className="font-semibold text-ink">Uploaded documents</h2>
          </div>
          {loading ? (
            <div className="p-5">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">File name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Upload date</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {documents.map((document) => (
                    <tr key={document._id}>
                      <td className="px-4 py-3 font-medium text-ink">{document.name}</td>
                      <td className="px-4 py-3 uppercase">{document.documentType}</td>
                      <td className="px-4 py-3">{new Date(document.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <a href={document.pdfPreviewUrl} target="_blank" className="rounded-md p-2 text-slate-600 hover:bg-slate-100" title="Preview">
                            <Eye size={16} />
                          </a>
                          <button onClick={() => saveTemplate(document._id)} className="rounded-md p-2 text-brand-700 hover:bg-brand-50" title="Save as template">
                            <Save size={16} />
                          </button>
                          <button onClick={() => deleteDocument(document._id)} className="rounded-md p-2 text-rose-600 hover:bg-rose-50" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!documents.length && <p className="p-5 text-sm text-slate-500">No documents uploaded yet.</p>}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
