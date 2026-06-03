'use client';

import { ImagePlus, PenLine, Type } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Modal from '@/components/ui/Modal';

export default function SignaturePad({ open, onClose, onInsert }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [tab, setTab] = useState('draw');
  const [typed, setTyped] = useState('');
  const [color, setColor] = useState('#172033');
  const [fontFamily, setFontFamily] = useState('Caveat');

  useEffect(() => {
    if (!open || tab !== 'draw' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
  }, [open, tab]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = color;
  }, [color]);

  const point = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  const start = (event) => {
    drawing.current = true;
    const ctx = canvasRef.current.getContext('2d');
    const p = point(event);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };

  const move = (event) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const p = point(event);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const finish = () => {
    drawing.current = false;
  };

  const insertDrawn = () => {
    onInsert(canvasRef.current.toDataURL('image/png'));
    onClose();
  };

  const insertTyped = () => {
    if (!typed.trim()) return;
    const canvas = document.createElement('canvas');
    canvas.width = 560;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.font = `56px "${fontFamily}", cursive`;
    ctx.fillText(typed.trim(), 32, 95);
    onInsert(canvas.toDataURL('image/png'));
    onClose();
  };

  const upload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onInsert(reader.result);
      onClose();
    };
    reader.readAsDataURL(file);
  };

  return (
    <Modal title="Add signature" open={open} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex rounded-md border border-slate-200 p-1">
          {[
            ['draw', PenLine, 'Draw'],
            ['type', Type, 'Type'],
            ['upload', ImagePlus, 'Upload']
          ].map(([value, Icon, label]) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              type="button"
              className={`inline-flex min-h-9 items-center gap-2 rounded px-3 text-sm font-medium ${tab === value ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
          <div className="ml-auto flex items-center border-l border-slate-200 pl-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-9 w-9 cursor-pointer rounded border-0 bg-transparent p-1"
              title="Signature Color"
            />
          </div>
        </div>

        {tab === 'draw' && (
          <div className="space-y-3">
            <canvas
              ref={canvasRef}
              width={560}
              height={180}
              onPointerDown={start}
              onPointerMove={move}
              onPointerUp={finish}
              onPointerLeave={finish}
              style={{
                cursor: `url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%231e293b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 20h9'/%3E%3Cpath d='M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z'/%3E%3C/svg%3E") 3 20, crosshair`
              }}
              className="h-44 w-full touch-none rounded-md border border-slate-300 bg-white"
            />
            <button onClick={insertDrawn} type="button" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
              Insert Signature
            </button>
          </div>
        )}

        {tab === 'type' && (
          <div className="space-y-4">
            <input
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              placeholder="Type your signature"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-2xl outline-none focus:border-brand-500"
            />
            
            <div className="flex gap-2">
              {[
                { name: 'Handwriting', value: 'Caveat' },
                { name: 'Cursive', value: 'Dancing Script' },
                { name: 'Calligraphy', value: 'Great Vibes' }
              ].map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFontFamily(f.value)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
                    fontFamily === f.value ? 'border-brand-600 bg-brand-50 text-brand-700 font-semibold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  style={{ fontFamily: f.value }}
                >
                  {f.name}
                </button>
              ))}
            </div>

            {/* Live Preview Box */}
            <div 
              className="flex h-32 w-full items-center justify-center rounded-md border border-slate-200 bg-slate-50 p-4 text-center text-4xl overflow-hidden"
              style={{ fontFamily, color }}
            >
              {typed.trim() || 'Signature Preview'}
            </div>

            <button onClick={insertTyped} type="button" className="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700">
              Insert Signature
            </button>
          </div>
        )}

        {tab === 'upload' && (
          <label className="block rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600 hover:bg-slate-50">
            Choose a PNG or JPG signature image
            <input type="file" accept="image/png,image/jpeg" onChange={upload} className="sr-only" />
          </label>
        )}
      </div>
    </Modal>
  );
}
