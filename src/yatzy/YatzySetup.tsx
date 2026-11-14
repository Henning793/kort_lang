import { Die } from '../components/ui/Die';
import { SetupHero, PlayerSetupList, StartButton, SectionLabel } from '../components/game/SetupParts';
import { playerColor } from '../components/game/colors';
import { useYatzyStore } from './store';
import { YATZY_MAX_PLAYERS, YATZY_MIN_PLAYERS, type YatzyMode } from './rules';

const MODES: { id: YatzyMode; label: string; text: string; faces: number[] }[] = [
  { id: 'fri', label: 'Fri', text: 'Velg selv hvilken rute du fyller ut.', faces: [6, 2, 4] },
  { id: 'tvungen', label: 'Tvungen', text: 'Fyll ut rutene ovenfra og ned.', faces: [1, 2, 3] },
];

export function YatzySetup() {
  const s = useYatzyStore();
  const n = s.players.length;

  return (
    <div className="px-5 pt-3 pb-10 flex flex-col gap-5">
      <SetupHero
        color={playerColor(1)}
        title="Yatzy"
        tagline="Fem terninger, tre kast. Høyest poengsum vinner."
        art={
          <div className="relative w-[64px] h-[56px]">
            <Die face={5} size={36} className="absolute! left-0 top-0 yz-roll" style={{ ['--r' as string]: '-12deg' }} />
            <Die
              face={3}
              size={32}
              className="absolute! right-0 bottom-0 yz-roll"
              style={{ ['--r' as string]: '10deg', animationDelay: '90ms' }}
            />
          </div>
        }
      />

      <div className="flex flex-col gap-2">
        <SectionLabel>Spillmåte</SectionLabel>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Spillmåte">
          {MODES.map((m) => {
            const on = s.mode === m.id;
            return (
              <button
                key={m.id}
                role="radio"
                aria-checked={on}
                onClick={() => s.setMode(m.id)}
                className={`rounded-card p-3 flex flex-col items-start gap-1.5 text-left border-2 cursor-pointer transition-colors ${
                  on ? 'bg-accent border-accent text-bg' : 'bg-surface border-transparent hover:bg-black/5'
                }`}
              >
                <span className="flex gap-1">
                  {m.faces.map((f, i) => (
                    <Die key={i} face={f} size={22} />
                  ))}
                </span>
                <span className="font-heading text-lg leading-tight">{m.label}</span>
                <span className={`text-[13px] leading-snug ${on ? 'opacity-90' : 'opacity-65'}`}>{m.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      <PlayerSetupList
        players={s.players}
        onName={s.updateName}
        onRemove={s.removePlayer}
        onAdd={s.addPlayer}
        canAdd={n < YATZY_MAX_PLAYERS}
        canRemove={n > YATZY_MIN_PLAYERS}
        firstLabel="Starter"
      />

      <StartButton players={s.players} onClick={s.startGame} />

      <p className="m-0 px-1 text-sm opacity-65">
        50 poeng i bonus hvis du får minst 63 på enere til seksere.
      </p>
    </div>
  );
}
