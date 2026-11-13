import type { ReactNode } from 'react';
import { ChevronRight, Dices } from 'lucide-react';
import { CardIcon } from '../components/ui/CardIcon';
import { PlayingCard } from '../components/ui/PlayingCard';
import { useAppStore, relativeDay, type GameId } from '../store/appStore';
import { useGameStore } from '../store/gameStore';
import { computeStandings } from '../game/logic';
import { NUM_ROUNDS } from '../game/rounds';
import { useFemkampStore } from '../femkamp/store';
import { femkampScores, fmtPoints } from '../femkamp/logic';
import { FEMKAMP_ROUNDS, FEMKAMP_NUM_ROUNDS } from '../femkamp/rules';

type Ongoing = {
  game: GameId;
  title: string;
  round: number;
  rounds: number;
  players: string[];
  leader: string;
  leaderTotal: number;
};

function useOngoing(): Ongoing[] {
  const kol = useGameStore();
  const fk = useFemkampStore();
  const list: Ongoing[] = [];

  if (fk.screen === 'play') {
    const st = computeStandings(fk.players, femkampScores(fk.players, fk), 0);
    list.push({
      game: 'femkamp',
      title: 'Femkamp',
      round: fk.current,
      rounds: FEMKAMP_NUM_ROUNDS,
      players: fk.players.map((p) => p.name),
      leader: st.filter((x) => x.rank === 1).map((x) => x.name).join(' og '),
      leaderTotal: st[0]?.total ?? 0,
    });
  }
  if (kol.screen === 'play') {
    const st = computeStandings(kol.players, kol.scores, 0);
    list.push({
      game: 'kortlang',
      title: 'Kort og lang',
      round: kol.round,
      rounds: NUM_ROUNDS,
      players: kol.players.map((p) => p.name),
      leader: st.filter((x) => x.rank === 1).map((x) => x.name).join(' og '),
      leaderTotal: st[0]?.total ?? 0,
    });
  }
  return list;
}

function ResumeCard({ g }: { g: Ongoing }) {
  const open = useAppStore((s) => s.open);
  const started = g.round > 0;
  return (
    <div className="bg-ink text-bg rounded-card px-4.5 py-4 flex flex-col gap-2.5">
      <div className="min-w-0">
        <div className="text-[10px] tracking-[0.1em] uppercase font-bold text-accent-200">Pågående spill</div>
        <div className="font-heading text-xl">
          {g.title} · runde {g.round + 1} av {g.rounds}
        </div>
        <div className="text-[13px] opacity-75">
          {g.players.join(', ')}
          {started && ` · ${g.leader} leder med ${fmtPoints(g.leaderTotal)} p`}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {Array.from({ length: g.rounds }, (_, k) => (
            <i
              key={k}
              className={`block w-4 h-[5px] rounded-pill ${
                k < g.round ? 'bg-accent2-300' : k === g.round ? 'bg-accent' : 'bg-bg/25'
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => open(g.game)}
          className="ml-auto bg-accent text-bg rounded-pill px-5 py-2 font-heading text-sm hover:bg-accent-600 cursor-pointer"
        >
          Fortsett
        </button>
      </div>
    </div>
  );
}

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
  const ongoing = useOngoing();

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center gap-2 px-5 pt-5 pb-2 font-heading text-[19px]">
        <CardIcon size={20} />
        Spillbordet
      </div>

      <div className="px-5 pt-1 pb-8 flex flex-col gap-3.5">
        {ongoing.map((g) => (
          <ResumeCard key={g.game} g={g} />
        ))}

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
