'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, FileSignature, FileText, LayoutTemplate, Send, ScrollText } from 'lucide-react';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/templates', label: 'Templates', icon: LayoutTemplate },
  { href: '/admin/send', label: 'Send Contract', icon: Send },
  { href: '/admin/contracts', label: 'Tracking', icon: ScrollText }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
        <div className="grid h-9 w-9 place-items-center rounded-md bg-brand-600 text-white">
          <FileSignature size={20} />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">SOAS</p>
          <p className="text-xs text-slate-500">Contract Signing</p>
        </div>
      </div>
      <nav className="space-y-1 p-3">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-ink'
              }`}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
