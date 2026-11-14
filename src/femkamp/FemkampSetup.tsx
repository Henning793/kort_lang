import { PlayingCard } from '../components/ui/PlayingCard';
import { SetupHero, PlayerSetupList, StartButton, SectionLabel } from '../components/game/SetupParts';
import { playerColor } from '../components/game/colors';
import { useFemkampStore } from './store';
import {
  FEMKAMP_ROUNDS,
  FEMKAMP_MAX_PLAYERS,
  FEMKAMP_MIN_PLAYERS,
  cardsPerPlayer,
  cardsRemoved,
} from './rules';

function pointText(r: (typeof FEMKAMP_ROUNDS)[number]): string {
  if (r.kind === 'kabal') return '1 p per pass og kort igjen';
  const m = r.mult ?? 1;
  return `${m > 0 ? '+' : '−'}${Math.abs(m)} p per ${r.unit === 'damer' ? 'dame' : r.unit}`;
}

export function FemkampSetup() {
  const s = useFemkampStore();
  const n = s.players.length;
  const removed = cardsRemoved(n);

  return (
    <div className="px-5 pt-3 pb-10 flex flex-col gap-5">
      <SetupHero
        color={playerColor(2)}
        title="Femkamp"
        tagline="Fem runder med ulike mål. Færrest poeng vinner."
        art={
          <div className="relative w-[64px] h-[52px] yz-roll">
            {FEMKAMP_ROUNDS.map((r, k) => (
              <PlayingCard
                key={r.name}
                glyph={r.glyph}
                red={r.red}
                size="md"
                className="absolute bottom-0 left-1/2"
                style={{
                  transform: `translateX(-50%) rotate(${(k - 2) * 14}deg)`,
                  transformOrigin: '50% 120%',
                }}
              />
            ))}
          </div>
        }
      />

      <PlayerSetupList
        players={s.players}
        onName={s.updateName}
        onRemove={s.removePlayer}
        onAdd={s.addPlayer}
        canAdd={n < FEMKAMP_MAX_PLAYERS}
        canRemove={n > FEMKAMP_MIN_PLAYERS}
        firstLabel="Deler ut i runde 1"
      />
      <p className="m-0 -mt-2 px-1 text-sm opacity-60">Legg inn spillerne i den rekkefølgen dere sitter.</p>

      <StartButton players={s.players} onClick={s.startGame} />

      <div className="flex flex-col gap-2">
        <SectionLabel>Rundene</SectionLabel>
        <div className="rounded-card bg-surface p-2 flex flex-col">
          {FEMKAMP_ROUNDS.map((r, k) => (
            <div key={r.name} className="flex items-center gap-3 px-2 py-1.5">
              <span className="w-6 font-heading text-base opacity-45 text-center">{k + 1}</span>
              <PlayingCard glyph={r.glyph} red={r.red} />
              <span className="font-heading text-base flex-1">{r.name}</span>
              <span className={`text-sm font-semibold ${(r.mult ?? 1) < 0 ? 'text-accent2-700' : 'opacity-60'}`}>
                {pointText(r)}
              </span>
            </div>
          ))}
        </div>
        <p className="m-0 px-1 text-sm opacity-65">
          {removed > 0
            ? `Med ${n} spillere tar dere ut ${removed} kort før utdeling, så alle får ${cardsPerPlayer(n)} kort.`
            : `Med ${n} spillere får alle ${cardsPerPlayer(n)} kort.`}
        </p>
      </div>
    </div>
  );
}
