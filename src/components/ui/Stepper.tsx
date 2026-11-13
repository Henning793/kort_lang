import { Minus, Plus } from 'lucide-react';

type Props = { value: number; onChange: (delta: number) => void; label: string };

/** − tall + for små tellinger (stikk, kløver, kort igjen). */
export function Stepper({ value, onChange, label }: Props) {
  const btn =
    'w-9 h-9 grid place-items-center rounded-full hover:bg-black/5 active:bg-black/10 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed';
  return (
    <div className="flex items-center gap-0.5 bg-bg rounded-pill p-[3px]">
      <button className={btn} onClick={() => onChange(-1)} disabled={value <= 0} aria-label={`Færre ${label}`}>
        <Minus size={16} strokeWidth={2.75} />
      </button>
      <output className="min-w-[26px] text-center font-bold text-base tabular-nums">{value}</output>
      <button className={btn} onClick={() => onChange(1)} aria-label={`Flere ${label}`}>
        <Plus size={16} strokeWidth={2.75} />
      </button>
    </div>
  );
}
