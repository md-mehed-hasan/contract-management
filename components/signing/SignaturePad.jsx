'use client';

import { ImagePlus, PenLine, Type } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Modal from '@/components/ui/Modal';

export default function SignaturePad({ open, onClose, onInsert }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [tab, setTab] = useState('draw');
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#172033';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
  }, [open, tab]);

  const point = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
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
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#172033';
    ctx.font = '52px Georgia, serif';
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
              className="h-44 w-full touch-none rounded-md border border-slate-300 bg-white"
            />
            <button onClick={insertDrawn} type="button" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
              Insert Signature
            </button>
          </div>
        )}

        {tab === 'type' && (
          <div className="space-y-3">
            <input value={typed} onChange={(event) => setTyped(event.target.value)} placeholder="Type your signature" className="w-full rounded-md border border-slate-300 px-3 py-2 text-2xl outline-none focus:border-brand-500" />
            <button onClick={insertTyped} type="button" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
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
