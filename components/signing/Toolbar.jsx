'use client';

import { CheckCircle2, MousePointer2, PenLine, Save, Trash2, Type } from 'lucide-react';

const buttons = [
  { mode: 'move', label: 'Move', icon: MousePointer2 },
  { mode: 'text', label: 'Text', icon: Type },
  { mode: 'signature', label: 'Signature', icon: PenLine },
  { mode: 'delete', label: 'Delete', icon: Trash2 }
];

export default function Toolbar({ mode, setMode, onSave, onFinalize, saving, finalizing }) {
  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-3">
      <div className="flex rounded-md border border-slate-200 p-1">
        {buttons.map((button) => {
          const Icon = button.icon;
          return (
            <button
              key={button.mode}
              onClick={() => setMode(button.mode)}
              className={`inline-flex min-h-9 items-center gap-2 rounded px-3 text-sm font-medium ${
                mode === button.mode ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
              type="button"
            >
              <Icon size={16} />
              {button.label}
            </button>
          );
        })}
      </div>
      <button onClick={onSave} disabled={saving} type="button" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60">
        <Save size={16} />
        {saving ? 'Saving...' : 'Save Progress'}
      </button>
      <button onClick={onFinalize} disabled={finalizing} type="button" className="inline-flex min-h-10 items-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60">
        <CheckCircle2 size={16} />
        {finalizing ? 'Submitting...' : 'Submit Final'}
      </button>
    </div>
  );
}
