import { Minus, Plus } from 'lucide-react';

type Props = { value: number; onChange: (delta: number) => void; label: string; size?: 'md' | 'lg' };

/** − tall + for små tellinger (stikk, kløver, kort igjen). */
export function Stepper({ value, onChange, label, size = 'md' }: Props) {
  const lg = size === 'lg';
  const btn =
    (lg ? 'w-11 h-11 ' : 'w-9 h-9 ') +
    'grid place-items-center rounded-full hover:bg-black/5 active:bg-black/10 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed';
  return (
    <div className="flex items-center gap-0.5 bg-bg rounded-pill p-[3px]">
      <button className={btn} onClick={() => onChange(-1)} disabled={value <= 0} aria-label={`Færre ${label}`}>
        <Minus size={lg ? 20 : 16} strokeWidth={2.75} />
      </button>
      <output className={`text-center font-bold tabular-nums ${lg ? 'min-w-[30px] text-xl' : 'min-w-[26px] text-base'}`}>{value}</output>
      <button className={btn} onClick={() => onChange(1)} aria-label={`Flere ${label}`}>
        <Plus size={lg ? 20 : 16} strokeWidth={2.75} />
      </button>
    </div>
  );
}
