'use client';

import { CheckCircle2, MousePointer2, PenLine, Save, Trash2, Type, Bold, Italic, Minus, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';

const buttons = [
  { mode: 'move', label: 'Move', icon: MousePointer2 },
  { mode: 'text', label: 'Text', icon: Type },
  { mode: 'signature', label: 'Signature', icon: PenLine },
  { mode: 'delete', label: 'Delete', icon: Trash2 }
];

export default function Toolbar({ mode, setMode, onSave, onFinalize, saving, finalizing, activeObject, setActiveObject }) {
  const [, setTick] = useState(0);
  const forceUpdate = () => setTick((t) => t + 1);

  // Re-render when activeObject changes
  useEffect(() => {
    forceUpdate();
  }, [activeObject]);

  const isText = activeObject && (activeObject.type === 'i-text' || activeObject.type === 'textbox');
  const isSelected = !!activeObject;

  const updateText = (key, value) => {
    if (!activeObject) return;
    activeObject.set(key, value);
    activeObject.canvas.renderAll();
    forceUpdate();
  };

  const deleteActive = () => {
    if (!activeObject) return;
    const canvas = activeObject.canvas;
    canvas.remove(activeObject);
    canvas.discardActiveObject();
    setActiveObject(null);
  };

  return (
    <div className="sticky top-[73px] z-20 flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-3 rounded-t-lg">
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

      {isText && (
        <div className="flex items-center gap-1 rounded-md border border-slate-200 p-1 mr-auto">
          <input
            type="color"
            value={activeObject.fill || '#172033'}
            onChange={(e) => updateText('fill', e.target.value)}
            className="h-9 w-9 cursor-pointer rounded border-0 bg-transparent p-1"
            title="Text Color"
          />
          <div className="mx-1 h-6 w-px bg-slate-200"></div>
          <button
            onClick={() => updateText('fontSize', Math.max(8, (activeObject.fontSize || 18) - 2))}
            className="inline-flex h-9 w-9 items-center justify-center rounded text-slate-600 hover:bg-slate-100"
            title="Decrease Size"
          >
            <Minus size={16} />
          </button>
          <span className="min-w-[2rem] text-center text-sm font-medium text-slate-600">{activeObject.fontSize || 18}</span>
          <button
            onClick={() => updateText('fontSize', Math.min(120, (activeObject.fontSize || 18) + 2))}
            className="inline-flex h-9 w-9 items-center justify-center rounded text-slate-600 hover:bg-slate-100"
            title="Increase Size"
          >
            <Plus size={16} />
          </button>
          <div className="mx-1 h-6 w-px bg-slate-200"></div>
          <button
            onClick={() => updateText('fontWeight', activeObject.fontWeight === 'bold' ? 'normal' : 'bold')}
            className={`inline-flex h-9 w-9 items-center justify-center rounded ${activeObject.fontWeight === 'bold' ? 'bg-brand-100 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}
            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => updateText('fontWeight', activeObject.fontWeight === '300' ? 'normal' : '300')}
            className={`inline-flex h-9 px-2 items-center justify-center rounded text-sm font-medium ${activeObject.fontWeight === '300' ? 'bg-brand-100 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}
            title="Light text"
          >
            Light
          </button>
          <button
            onClick={() => updateText('fontStyle', activeObject.fontStyle === 'italic' ? 'normal' : 'italic')}
            className={`inline-flex h-9 w-9 items-center justify-center rounded ${activeObject.fontStyle === 'italic' ? 'bg-brand-100 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}
            title="Italic"
          >
            <Italic size={16} />
          </button>
        </div>
      )}

      {!isText && <div className="mr-auto"></div>}

      {isSelected && (
        <button onClick={deleteActive} type="button" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 text-sm font-medium text-rose-600 hover:bg-rose-100 mr-2">
          <Trash2 size={16} />
          Delete Selected
        </button>
      )}
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
