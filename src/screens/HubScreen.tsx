import type { ReactNode } from 'react';
import { ChevronRight, Dices } from 'lucide-react';
import { CardIcon } from '../components/ui/CardIcon';
import { PlayingCard } from '../components/ui/PlayingCard';
import { useAppStore, relativeDay, type GameId } from '../store/appStore';
import { FEMKAMP_ROUNDS } from '../femkamp/rules';

function GameCard({
  game,
  art,
  artBg,
  title,
  badge,
  text,
  tags,
}: {
  game: GameId;
  art: ReactNode;
  artBg: string;
  title: string;
  badge?: string;
  text: string;
  tags: string[];
}) {
  const open = useAppStore((s) => s.open);
  const last = useAppStore((s) => s.lastResults[game]);
  return (
    <button
      onClick={() => open(game)}
      className="w-full text-left bg-surface rounded-card p-3.5 flex items-center gap-3.5 hover:bg-black/5 cursor-pointer"
    >
      <div className={`w-[78px] h-[78px] flex-none rounded-[20px] grid place-items-center ${artBg}`}>{art}</div>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="font-heading text-[19px] flex items-center gap-2">
          {title}
          {badge && (
            <span className="font-body text-[11px] font-semibold px-2 py-0.5 rounded-pill bg-accent2-100 text-accent2-800">
              {badge}
            </span>
          )}
        </div>
        <p className="m-0 text-[13px] opacity-60">{text}</p>
        <div className="flex gap-1.5 flex-wrap">
          {tags.map((t) => (
            <span key={t} className="text-[11px] font-semibold px-2 py-0.5 rounded-pill bg-neutral-100 text-neutral-600">
              {t}
            </span>
          ))}
        </div>
        {last && (
          <p className="m-0 text-xs opacity-60">
            Sist spilt {relativeDay(last.date)} · {last.winners} vant
          </p>
        )}
      </div>
      <ChevronRight size={20} strokeWidth={2.5} className="flex-none opacity-40" />
    </button>
  );
}

export function HubScreen() {
  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center gap-2 px-5 pt-5 pb-2 font-heading text-[19px]">
        <CardIcon size={20} />
        Kortana
      </div>

      <div className="px-5 pt-1 pb-8 flex flex-col gap-3.5">
        <div className="text-[11px] tracking-wider uppercase font-bold opacity-55 mt-1">Kortspill</div>
        <GameCard
          game="kortlang"
          artBg="bg-accent-100"
          art={
            <div className="flex items-end gap-1 h-[46px]">
              {[22, 38, 38].map((h, i) => (
                <i key={i} className="block w-[15px] rounded-[4px] bg-accent-200 border-[1.5px] border-accent" style={{ height: h }} />
              ))}
            </div>
          }
          title="Kort og lang"
          text="Lavest poengsum etter sju runder vinner."
          tags={['7 runder', '2–8 spillere']}
        />
        <GameCard
          game="femkamp"
          artBg="bg-accent2-100"
          art={
            <div className="relative w-[62px] h-11">
              {FEMKAMP_ROUNDS.map((r, k) => (
                <PlayingCard
                  key={r.name}
                  glyph={r.glyph}
                  red={r.red}
                  className="absolute bottom-0 left-1/2"
                  style={{ transform: `translateX(-50%) rotate(${(k - 2) * 14}deg)`, transformOrigin: '50% 120%' }}
                />
              ))}
            </div>
          }
          title="Femkamp"
          badge="Ny"
          text="Fem runder med ulike mål. Færrest poeng vinner."
          tags={['5 runder', '3–8 spillere']}
        />

        <div className="text-[11px] tracking-wider uppercase font-bold opacity-55 mt-1">Terningspill</div>
        <div className="border-[1.5px] border-dashed border-divider rounded-card p-4 flex gap-3.5 items-center">
          <Dices size={30} strokeWidth={2.25} className="flex-none opacity-50" />
          <p className="m-0 text-[13px]">
            <span className="block font-heading text-base">Ingen terningspill ennå</span>
            Her havner Yatzy, Mexico eller det dere spiller, når vi legger det til.
          </p>
        </div>
      </div>
    </div>
  );
}
