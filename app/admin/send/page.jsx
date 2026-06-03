'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import AdminShell from '@/components/admin/AdminShell';

function formatInputDate(date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
  return date.toISOString().slice(0, 10);
}

function SendContractContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    templateId: searchParams.get('template') || '',
    expiryDate: formatInputDate(),
    customMessage: ''
  });

  useEffect(() => {
    fetch('/api/admin/templates').then((res) => res.json()).then((templateData) => {
      setTemplates(templateData.templates || []);
    });
  }, []);

  const update = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const res = await fetch('/api/admin/contracts/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      toast.success('Contract sent');
      router.push('/admin/contracts');
    } else {
      toast.error(data.message || 'Could not send contract');
    }
  };

  return (
    <AdminShell title="Send Contract">
      <form onSubmit={submit} className="max-w-3xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-ink">
            Client name
            <input required value={form.clientName} onChange={(event) => update('clientName', event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand-500" />
          </label>
          <label className="space-y-1 text-sm font-medium text-ink">
            Client email
            <input required type="email" value={form.clientEmail} onChange={(event) => update('clientEmail', event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand-500" />
          </label>

          <label className="space-y-1 text-sm font-medium text-ink">
            Select template
            <select value={form.templateId} onChange={(event) => update('templateId', event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand-500">
              <option value="">Choose a template</option>
              {templates.map((template) => (
                <option key={template._id} value={template._id}>
                  {template.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium text-ink">
            Expiry date
            <input type="date" value={form.expiryDate} onChange={(event) => update('expiryDate', event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand-500" />
          </label>
          <label className="space-y-1 text-sm font-medium text-ink sm:col-span-2">
            Custom message
            <textarea rows={4} value={form.customMessage} onChange={(event) => update('customMessage', event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand-500" />
          </label>
        </div>
        <div className="mt-5 flex justify-end">
          <button disabled={loading} className="rounded-md bg-brand-600 px-5 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-60">
            {loading ? 'Sending...' : 'Send Contract'}
          </button>
        </div>
      </form>
    </AdminShell>
  );
}

export default function SendContractPage() {
  return (
    <Suspense fallback={<AdminShell title="Send Contract"><div className="text-sm text-slate-500">Loading send form...</div></AdminShell>}>
      <SendContractContent />
    </Suspense>
  );
}
