import { Clock, FileCheck2, FileText, TimerOff } from 'lucide-react';

const cards = [
  { key: 'total', label: 'Total sent', icon: FileText, tone: 'bg-slate-900 text-white' },
  { key: 'signed', label: 'Signed', icon: FileCheck2, tone: 'bg-emerald-600 text-white' },
  { key: 'pending', label: 'Pending', icon: Clock, tone: 'bg-amber-500 text-white' },
  { key: 'expired', label: 'Expired', icon: TimerOff, tone: 'bg-rose-600 text-white' }
];

export default function StatsCards({ stats = {} }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.key} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold text-ink">{stats[card.key] || 0}</p>
              </div>
              <div className={`grid h-11 w-11 place-items-center rounded-md ${card.tone}`}>
                <Icon size={20} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
