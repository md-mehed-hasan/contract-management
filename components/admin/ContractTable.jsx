'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, Eye, RefreshCw, ShieldOff, MoreVertical, Trash2, MoreHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import ContractDetailsModal from './ContractDetailsModal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const statusClasses = {
  pending: 'bg-amber-100 text-amber-700',
  viewed: 'bg-sky-100 text-sky-700',
  signed: 'bg-emerald-100 text-emerald-700',
  expired: 'bg-rose-100 text-rose-700',
  revoked: 'bg-slate-200 text-slate-700'
};

export default function ContractTable() {
  const [contracts, setContracts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleCloseDropdown = (e) => {
      if (!e.target.closest('.action-dropdown-container') && !e.target.closest('.portal-dropdown-menu')) {
        setOpenDropdownId(null);
      }
    };
    const handleWindowClose = () => setOpenDropdownId(null);

    window.addEventListener('click', handleCloseDropdown);
    window.addEventListener('scroll', handleWindowClose);
    window.addEventListener('resize', handleWindowClose);

    return () => {
      window.removeEventListener('click', handleCloseDropdown);
      window.removeEventListener('scroll', handleWindowClose);
      window.removeEventListener('resize', handleWindowClose);
    };
  }, []);

  const activeContract = useMemo(() => {
    return contracts.find((c) => c._id === openDropdownId);
  }, [contracts, openDropdownId]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({ page: String(pagination.page), limit: String(pagination.limit), status, search });
    return params.toString();
  }, [pagination.page, pagination.limit, search, status]);

  const loadContracts = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/contracts?${queryString}`);
    const data = await res.json();
    if (data.success) {
      setContracts(data.contracts);
      setPagination(data.pagination);
    }
    setLoading(false);
  }, [queryString]);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  const action = async (path, method = 'POST', actionLabel = 'Processing', confirmMessage = 'Are you sure?') => {
    if (!window.confirm(confirmMessage)) return;
    const toastId = toast.loading(`${actionLabel}...`, { position: 'top-center' });
    try {
      const res = await fetch(path, { method });
      const data = await res.json();
      toast.dismiss(toastId);
      if (data.success) {
        toast.success(`${actionLabel} completed`, { position: 'top-center' });
        loadContracts();
      } else {
        toast.error(data.message || `${actionLabel} failed`, { position: 'top-center' });
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(`${actionLabel} failed`, { position: 'top-center' });
    }
  };

  const exportCsv = () => {
    const headers = ['Contract ID', 'Client Name', 'Client Email', 'Document Name', 'Sent Date', 'Status', 'Last Opened', 'Signed Date'];
    const rows = contracts.map((contract) => [
      contract._id,
      contract.clientName,
      contract.clientEmail,
      contract.documentName,
      new Date(contract.sentDate || contract.createdAt).toISOString(),
      contract.status,
      contract.lastOpened ? new Date(contract.lastOpened).toISOString() : '',
      contract.signedDate ? new Date(contract.signedDate).toISOString() : ''
    ]);
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'soas-contracts.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(event) => {
              setPagination((current) => ({ ...current, page: 1 }));
              setSearch(event.target.value);
            }}
            placeholder="Search client or email"
            className="min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-500"
          />
          <select
            value={status}
            onChange={(event) => {
              setPagination((current) => ({ ...current, page: 1 }));
              setStatus(event.target.value);
            }}
            className="min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-500"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="viewed">Viewed</option>
            <option value="signed">Signed</option>
            <option value="expired">Expired</option>
            <option value="revoked">Revoked</option>
          </select>
          <select
            value={pagination.limit}
            onChange={(event) => setPagination((current) => ({ ...current, page: 1, limit: Number(event.target.value) }))}
            className="min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-500"
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={loadContracts} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" title="Refresh list">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button onClick={exportCsv} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Download size={16} />
            CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-6">
          <LoadingSpinner label="Loading contracts" />
        </div>
      ) : (
        <div className="overflow-x-auto h-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs capitalize text-slate-500">
              <tr>
                {/* <th className="px-4 py-3">Contract ID</th> */}
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Document Name</th>
                <th className="px-4 py-3">Sent</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last opened</th>
                <th className="px-4 py-3">Signed Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {contracts.map((contract, index) => (
                <tr key={contract._id}>
                  {/* <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{contract._id.slice(-8)}</td> */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{contract.clientName}</p>
                    <p className="text-xs text-slate-500">{contract.clientEmail}</p>
                  </td>
                  <td className="px-4 py-3">{contract.documentName}</td>
                  <td className="whitespace-nowrap px-4 py-3">{new Date(contract.sentDate || contract.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${statusClasses[contract.status] || statusClasses.pending}`}>{contract.status}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{contract.lastOpened ? new Date(contract.lastOpened).toLocaleDateString() : '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3">{contract.signedDate ? new Date(contract.signedDate).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 relative">
                    <div className="relative inline-block text-left action-dropdown-container">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (openDropdownId === contract._id) {
                            setOpenDropdownId(null);
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const dropdownWidth = 192;
                            const dropdownHeight = 200; // approximate height
                            let top = rect.bottom + window.scrollY;
                            
                            // If it overflows the screen bottom, open it upwards in screen space instead
                            if (rect.bottom + dropdownHeight > window.innerHeight) {
                              top = rect.top - dropdownHeight + window.scrollY;
                            }
                            
                            const left = rect.right - dropdownWidth + window.scrollX;
                            setDropdownCoords({ top, left });
                            setOpenDropdownId(contract._id);
                          }
                        }}
                        className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
                        title="Actions"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!contracts.length && <p className="p-6 text-sm text-slate-500">No contracts found.</p>}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-200 p-4 text-sm text-slate-500">
        <span>
          Page {pagination.page} of {pagination.pages}
        </span>
        <div className="flex gap-2">
          <button disabled={pagination.page <= 1} onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))} className="rounded-md border px-3 py-1 disabled:opacity-50">
            Previous
          </button>
          <button disabled={pagination.page >= pagination.pages} onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))} className="rounded-md border px-3 py-1 disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
      <ContractDetailsModal contract={selected} open={Boolean(selected)} onClose={() => setSelected(null)} />

      {mounted && activeContract && createPortal(
        <div 
          className="portal-dropdown-menu absolute z-50 w-48 rounded-md border border-slate-200 bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          style={{ 
            top: `${dropdownCoords.top}px`, 
            left: `${dropdownCoords.left}px` 
          }}
        >
          <div className="py-1">
            <button
              onClick={() => {
                setSelected(activeContract);
                setOpenDropdownId(null);
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Eye size={16} className="text-slate-400" />
              View details
            </button>
            {activeContract.status !== 'revoked' && (
              <button
                onClick={() => {
                  action(`/api/admin/contracts/${activeContract._id}/resend`, 'POST', 'Resending email', 'Are you sure you want to resend the contract email to the client?');
                  setOpenDropdownId(null);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <RefreshCw size={16} className="text-slate-400" />
                Resend email
              </button>
            )}
            {activeContract.status !== 'revoked' && (
              <button
                onClick={() => {
                  action(`/api/admin/contracts/${activeContract._id}/revoke`, 'DELETE', 'Canceling contract', 'Are you sure you want to cancel this contract?');
                  setOpenDropdownId(null);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <ShieldOff size={16} className="text-rose-400" />
                Cancel Contract
              </button>
            )}
            {activeContract.signedPdfUrl && (
              <a
                href={activeContract.signedPdfUrl}
                onClick={() => setOpenDropdownId(null)}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-50 transition-colors"
              >
                <Download size={16} className="text-emerald-500" />
                Download PDF
              </a>
            )}
            <button
              onClick={() => {
                action(`/api/admin/contracts/${activeContract._id}`, 'DELETE', 'Deleting contract', 'Are you sure you want to permanently delete this contract? This cannot be undone.');
                setOpenDropdownId(null);
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 size={16} className="text-rose-400" />
              Delete Contract
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
