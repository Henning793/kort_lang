import { ROUNDS } from '../game/rounds';

export function RoundProgressDots({ current }: { current: number }) {
  return (
    <div className="flex gap-1.5 mb-3">
      {ROUNDS.map((_, i) => {
        const bg =
          i < current ? 'bg-accent2-500' : i === current ? 'bg-accent-500' : 'bg-neutral-300';
        return <div key={i} className={`flex-1 h-1.5 rounded-pill ${bg}`} />;
      })}
    </div>
  );
}
