import type { ReactNode } from 'react';
import { Plus, X, Play } from 'lucide-react';
import { BackButton } from '../BackButton';
import { PlayerBadge } from './PlayerBadge';
import { playerColor } from './colors';

/** Farget toppkort på oppsettsiden, i samme stil som rundekortet i spillet. */
export function SetupHero({ color, title, tagline, art }: { color: string; title: string; tagline: string; art: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <BackButton />
        <span className="text-base font-semibold opacity-60">Nytt spill</span>
      </div>
      <div className="rounded-card px-4 py-4 flex items-center gap-4 text-bg" style={{ background: color }}>
        <div className="flex-none flex items-center">{art}</div>
        <div className="min-w-0">
          <h1 className="m-0 font-heading text-[30px] leading-none">{title}</h1>
          <p className="m-0 mt-1.5 text-[15px] leading-snug opacity-90">{tagline}</p>
        </div>
      </div>
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="text-xs tracking-wider uppercase font-bold opacity-55 px-1">{children}</div>;
}

type SetupPlayer = { id: string; name: string };

/** Spillerliste med farge og merke per spiller, som i selve spillet. */
export function PlayerSetupList({
  players,
  onName,
  onRemove,
  onAdd,
  canAdd,
  canRemove,
  firstLabel,
}: {
  players: SetupPlayer[];
  onName: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
  canAdd: boolean;
  canRemove: boolean;
  /** Merke ved første spiller, f.eks. «Deler først». */
  firstLabel?: string;
}) {
  const next = players.length;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <SectionLabel>Spillere</SectionLabel>
        <span className="text-sm font-semibold opacity-60 px-1">{players.length} med</span>
      </div>
      {players.map((p, i) => (
        <div
          key={p.id}
          className="yz-pop flex items-center gap-3 pl-2.5 pr-2 py-2 rounded-card bg-surface"
          style={{
            backgroundImage: `linear-gradient(90deg, ${playerColor(i)}33, transparent 55%)`,
            ['--pc' as string]: playerColor(i),
          }}
        >
          <PlayerBadge name={p.name.trim() || String(i + 1)} index={i} size={40} />
          <div className="flex-1 min-w-0 flex flex-col">
            <input
              aria-label={`Navn på spiller ${i + 1}`}
              placeholder={`Spiller ${i + 1}`}
              value={p.name}
              onChange={(e) => onName(p.id, e.target.value)}
              className="w-full bg-transparent font-heading text-lg text-ink placeholder:text-ink/35 placeholder:font-body outline-none border-b-2 border-transparent focus:border-[var(--pc)] py-0.5"
            />
            {i === 0 && firstLabel && (
              <span className="text-[13px] font-semibold" style={{ color: playerColor(0) }}>
                {firstLabel}
              </span>
            )}
          </div>
          <button
            onClick={() => onRemove(p.id)}
            disabled={!canRemove}
            aria-label={`Fjern ${p.name || `spiller ${i + 1}`}`}
            className="w-10 h-10 flex-none grid place-items-center rounded-full opacity-50 hover:bg-black/5 hover:opacity-80 disabled:opacity-15 cursor-pointer disabled:cursor-not-allowed"
          >
            <X size={20} strokeWidth={2.75} />
          </button>
        </div>
      ))}
      <button
        onClick={onAdd}
        disabled={!canAdd}
        className="flex items-center gap-3 pl-[16px] pr-3 py-2 rounded-card border-2 border-dashed border-divider hover:bg-black/5 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
      >
        <span
          className="w-10 h-10 flex-none rounded-full grid place-items-center text-bg"
          style={{ background: playerColor(next) }}
        >
          <Plus size={22} strokeWidth={3} />
        </span>
        <span className="font-heading text-lg">Legg til spiller</span>
      </button>
    </div>
  );
}

/** Stor startknapp med spillernes merker stablet. */
export function StartButton({ players, onClick }: { players: SetupPlayer[]; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-3 bg-accent text-bg rounded-pill px-5 py-4 font-heading text-xl hover:bg-accent-600 active:scale-[0.98] transition-transform cursor-pointer shadow-[0_4px_0_var(--color-accent-700)]"
    >
      <span className="flex -space-x-1.5" aria-hidden>
        {players.map((p, i) => (
          <span key={p.id} className="w-5 h-5 rounded-full ring-2 ring-bg" style={{ background: playerColor(i) }} />
        ))}
      </span>
      Start spill
      <Play size={20} strokeWidth={3} fill="currentColor" />
    </button>
  );
}
