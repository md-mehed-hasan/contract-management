'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileSignature } from 'lucide-react';
import PDFViewer from '@/components/signing/PDFViewer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function SignContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [contract, setContract] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError('Missing signing token');
      setLoading(false);
      return;
    }

    fetch(`/api/contract/verify?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((payload) => {
        if (payload.error) setError(payload.error);
        else setContract(payload.data);
      })
      .catch(() => setError('Unable to verify this signing link'))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <main className="min-h-screen bg-mist">
      <header className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-brand-600 text-white">
            <FileSignature size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-ink">SOAS Contract Signing</h1>
            {contract && <p className="text-sm text-slate-500">{contract.documentName}</p>}
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6">
        {loading && <LoadingSpinner label="Verifying signing link" />}
        {error && <div className="rounded-lg border border-rose-100 bg-white p-6 text-rose-700 shadow-sm">{error}</div>}
        {contract && <PDFViewer contract={contract} />}
      </div>
    </main>
  );
}

export default function SignPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading signer" />}>
      <SignContent />
    </Suspense>
  );
}
