export function inlineMessage(message, type = 'info') {
  const tones = {
    info: 'border-brand-100 bg-brand-50 text-brand-700',
    success: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    error: 'border-rose-100 bg-rose-50 text-rose-700'
  };

  return <div className={`rounded-md border px-3 py-2 text-sm ${tones[type]}`}>{message}</div>;
}
