'use client';

import { PDFDocument } from 'pdf-lib';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SignaturePad from './SignaturePad';
import Toolbar from './Toolbar';
import { getSavedPages } from './SavedProgressLoader';

function applyInteractivity(canvas, mode) {
  canvas.selection = mode === 'move';
  canvas.getObjects().forEach((object) => {
    object.selectable = mode === 'move';
    object.evented = true;
  });
  canvas.defaultCursor = mode === 'text' ? 'text' : mode === 'delete' ? 'not-allowed' : 'default';
  canvas.renderAll();
}

export default function PDFViewer({ contract }) {
  const containerRef = useRef(null);
  const pageRefs = useRef(new Map());
  const fabricCanvases = useRef(new Map());
  const pdfCanvases = useRef(new Map());
  const pendingSignature = useRef(null);
  const modeRef = useRef('move');
  const [mode, setMode] = useState('move');
  const [loading, setLoading] = useState(true);
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [signedUrl, setSignedUrl] = useState(contract.signedPdfUrl || '');

  useEffect(() => {
    modeRef.current = mode;
    fabricCanvases.current.forEach((canvas) => applyInteractivity(canvas, mode));
  }, [mode]);

  useEffect(() => {
    let cancelled = false;
    const fabricCanvasStore = fabricCanvases.current;

    async function renderPdf() {
      setLoading(true);
      const pdfjsLib = await import('pdfjs-dist/build/pdf');
      const { fabric } = await import('fabric');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const loadingTask = pdfjsLib.getDocument(contract.pdfPreviewUrl);
      const pdf = await loadingTask.promise;
      if (cancelled || !containerRef.current) return;
      containerRef.current.innerHTML = '';
      fabricCanvases.current.forEach((canvas) => canvas.dispose());
      pageRefs.current.clear();
      fabricCanvases.current.clear();
      pdfCanvases.current.clear();

      const savedPages = getSavedPages(contract.signatureData);
      const maxWidth = Math.min(containerRef.current.clientWidth - 24, 920);

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1 });
        const scale = Math.min(maxWidth / viewport.width, 1.35);
        const scaled = page.getViewport({ scale });

        const wrapper = document.createElement('div');
        wrapper.className = 'pdf-page relative mx-auto my-5 rounded-lg bg-white shadow-sm';
        wrapper.style.width = `${scaled.width}px`;
        wrapper.style.height = `${scaled.height}px`;

        const pdfCanvas = document.createElement('canvas');
        pdfCanvas.width = scaled.width;
        pdfCanvas.height = scaled.height;
        pdfCanvas.className = 'absolute inset-0';
        wrapper.appendChild(pdfCanvas);

        const overlayCanvas = document.createElement('canvas');
        overlayCanvas.width = scaled.width;
        overlayCanvas.height = scaled.height;
        overlayCanvas.className = 'absolute inset-0';
        wrapper.appendChild(overlayCanvas);
        containerRef.current.appendChild(wrapper);

        await page.render({ canvasContext: pdfCanvas.getContext('2d'), viewport: scaled }).promise;

        const fabricCanvas = new fabric.Canvas(overlayCanvas, {
          width: scaled.width,
          height: scaled.height,
          preserveObjectStacking: true
        });

        fabricCanvas.on('mouse:down', (event) => {
          const pointer = fabricCanvas.getPointer(event.e);
          if (modeRef.current === 'text') {
            const text = new fabric.IText('Text', {
              left: pointer.x,
              top: pointer.y,
              fill: '#172033',
              fontSize: 18,
              fontFamily: 'Arial',
              backgroundColor: 'rgba(255,255,255,0.75)'
            });
            fabricCanvas.add(text).setActiveObject(text);
          }
          if (modeRef.current === 'signature') {
            setSignatureOpen(true);
            pendingSignature.current = { canvas: fabricCanvas, x: pointer.x, y: pointer.y };
          }
          if (modeRef.current === 'delete' && event.target) {
            fabricCanvas.remove(event.target);
          }
        });

        if (savedPages[pageNumber]) {
          await new Promise((resolve) => fabricCanvas.loadFromJSON(savedPages[pageNumber], resolve));
        }

        applyInteractivity(fabricCanvas, modeRef.current);
        fabricCanvases.current.set(pageNumber, fabricCanvas);
        pdfCanvases.current.set(pageNumber, pdfCanvas);
        pageRefs.current.set(pageNumber, { width: scaled.width, height: scaled.height });
      }

      setLoading(false);
    }

    renderPdf().catch((error) => {
      setLoading(false);
      toast.error(error.message || 'Could not load PDF');
    });

    return () => {
      cancelled = true;
      fabricCanvasStore.forEach((canvas) => canvas.dispose());
    };
  }, [contract.pdfPreviewUrl, contract.signatureData]);

  const insertSignature = async (dataUrl) => {
    const { fabric } = await import('fabric');
    const target = pendingSignature.current;
    if (!target) return;
    fabric.Image.fromURL(dataUrl, (image) => {
      image.set({
        left: target.x,
        top: target.y,
        scaleX: 0.35,
        scaleY: 0.35
      });
      target.canvas.add(image).setActiveObject(image);
      target.canvas.renderAll();
      setMode('move');
    });
  };

  const serialize = () => {
    const pages = {};
    fabricCanvases.current.forEach((canvas, pageNumber) => {
      pages[pageNumber] = canvas.toJSON();
    });
    return { pages, savedAt: new Date().toISOString() };
  };

  const saveProgress = async () => {
    setSaving(true);
    const res = await fetch('/api/contract/save-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: contract.token, signatureData: serialize() })
    });
    const data = await res.json();
    setSaving(false);
    data.success ? toast.success('Progress saved') : toast.error(data.message || 'Save failed');
  };

  const createSignedPdfDataUrl = async () => {
    const pdfDoc = await PDFDocument.create();

    for (const [pageNumber, pageInfo] of pageRefs.current.entries()) {
      const pdfCanvas = pdfCanvases.current.get(pageNumber);
      const fabricCanvas = fabricCanvases.current.get(pageNumber);
      const combined = document.createElement('canvas');
      combined.width = pageInfo.width;
      combined.height = pageInfo.height;
      const ctx = combined.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, combined.width, combined.height);
      ctx.drawImage(pdfCanvas, 0, 0);
      ctx.drawImage(fabricCanvas.toCanvasElement(), 0, 0);

      const png = await pdfDoc.embedPng(combined.toDataURL('image/png'));
      const page = pdfDoc.addPage([pageInfo.width, pageInfo.height]);
      page.drawImage(png, { x: 0, y: 0, width: pageInfo.width, height: pageInfo.height });
    }

    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  const finalize = async () => {
    if (!window.confirm('Submit this contract as final?')) return;
    setFinalizing(true);
    try {
      const signedPdfDataUrl = await createSignedPdfDataUrl();
      const res = await fetch('/api/contract/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: contract.token, signatureData: serialize(), signedPdfDataUrl })
      });
      const data = await res.json();
      if (data.success) {
        setSignedUrl(data.signedPdfUrl);
        toast.success('Contract signed successfully');
      } else {
        toast.error(data.message || 'Final submission failed');
      }
    } finally {
      setFinalizing(false);
    }
  };

  if (signedUrl) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg border border-emerald-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-ink">Contract signed successfully</h2>
        <p className="mt-2 text-slate-500">A signed copy has been saved and sent by email.</p>
        <a href={signedUrl} className="mt-5 inline-flex rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700">
          Download signed PDF
        </a>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm">
      <Toolbar mode={mode} setMode={setMode} onSave={saveProgress} onFinalize={finalize} saving={saving} finalizing={finalizing} />
      {loading && (
        <div className="p-6">
          <LoadingSpinner label="Rendering document" />
        </div>
      )}
      <div ref={containerRef} className="min-h-[70vh] overflow-auto p-3" />
      <SignaturePad open={signatureOpen} onClose={() => setSignatureOpen(false)} onInsert={insertSignature} />
    </div>
  );
}
