'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FileText, LayoutTemplate, Send } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import StatsCards from '@/components/admin/StatsCards';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    fetch('/api/admin/contracts/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
          setRecent(data.recent);
        }
      });
  }, []);

  return (
    <AdminShell title="Dashboard">
      <div className="space-y-6">
        {stats ? <StatsCards stats={stats} /> : <LoadingSpinner label="Loading dashboard" />}

        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/admin/send" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-brand-200">
            <Send className="mb-4 text-brand-600" size={24} />
            <p className="font-semibold text-ink">Send Contract</p>
            <p className="mt-1 text-sm text-slate-500">Create a signing request from a template.</p>
          </Link>
          <Link href="/admin/templates" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-brand-200">
            <LayoutTemplate className="mb-4 text-brand-600" size={24} />
            <p className="font-semibold text-ink">Manage Templates</p>
            <p className="mt-1 text-sm text-slate-500">Keep reusable agreements ready for sending.</p>
          </Link>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <h2 className="font-semibold text-ink">Recent contracts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Template</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recent.map((contract) => (
                  <tr key={contract._id}>
                    <td className="px-4 py-3">{contract.clientName}</td>
                    <td className="px-4 py-3">{contract.documentName}</td>
                    <td className="px-4 py-3 capitalize">{contract.status}</td>
                    <td className="px-4 py-3">{new Date(contract.sentDate || contract.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!recent.length && <p className="p-4 text-sm text-slate-500">No contracts sent yet.</p>}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
