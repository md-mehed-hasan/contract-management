'use client';

import Link from 'next/link';
import { Menu, Send } from 'lucide-react';
import LogoutButton from './LogoutButton';

export default function Header({ title = 'Dashboard' }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <button className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Open navigation">
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-ink">{title}</h1>
          <p className="hidden text-xs text-slate-500 sm:block">Upload, send, sign, and track SOAS contracts.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/admin/send" className="hidden items-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 sm:inline-flex">
          <Send size={16} />
          Send
        </Link>
        <LogoutButton />
      </div>
    </header>
  );
}
