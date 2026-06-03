'use client';

import Modal from '@/components/ui/Modal';

function Row({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm text-ink">{value || '—'}</p>
    </div>
  );
}

export default function ContractDetailsModal({ contract, open, onClose }) {
  return (
    <Modal title="Contract details" open={open} onClose={onClose}>
      {contract ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Row label="Full token" value={contract.token} />
            <Row label="Status" value={contract.status} />
            <Row label="Client" value={`${contract.clientName} <${contract.clientEmail}>`} />
            <Row label="Document" value={contract.documentName} />
            <Row label="Sent" value={new Date(contract.sentDate || contract.createdAt).toLocaleString()} />
            <Row label="Expires" value={new Date(contract.expiryDate).toLocaleString()} />
            <Row label="Last opened" value={contract.lastOpened ? new Date(contract.lastOpened).toLocaleString() : '—'} />
            <Row label="Signed" value={contract.signedDate ? new Date(contract.signedDate).toLocaleString() : '—'} />
          </div>

          <div className="flex flex-wrap gap-2">
            <a href={contract.originalFileUrl} target="_blank" className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Original document
            </a>
            {contract.signedPdfUrl && (
              <a href={contract.signedPdfUrl} target="_blank" className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                Signed PDF
              </a>
            )}
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-ink">Activity log</h3>
            <div className="space-y-2">
              {(contract.activityLog || []).length ? (
                contract.activityLog.map((activity, index) => (
                  <div key={`${activity.at}-${index}`} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-sm text-ink">{activity.message}</p>
                    <p className="text-xs text-slate-500">{new Date(activity.at).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No activity recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
