import { Plus, X, Dices } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { BackButton } from '../components/BackButton';
import { useYatzyStore } from './store';
import { YATZY_MAX_PLAYERS, YATZY_MIN_PLAYERS, type YatzyMode } from './rules';

const MODES: { id: YatzyMode; label: string; text: string }[] = [
  { id: 'fri', label: 'Fri', text: 'Du velger selv hvilken rute du fyller ut etter hvert kast.' },
  { id: 'tvungen', label: 'Tvungen', text: 'Rutene fylles ut i rekkefølge ovenfra og ned. Enere først, Yatzy sist.' },
];

export function YatzySetup() {
  const s = useYatzyStore();
  const n = s.players.length;
  const mode = MODES.find((m) => m.id === s.mode) ?? MODES[0];

  return (
    <div className="px-5 pt-4 pb-10 flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <BackButton />
        <Dices size={26} strokeWidth={2.5} color="#c67139" />
        <h1 className="text-[28px] m-0">Yatzy</h1>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-[11px] tracking-wider uppercase font-bold opacity-55">Spillmåte</div>
        <div className="flex border border-divider rounded-pill overflow-hidden" role="radiogroup" aria-label="Spillmåte">
          {MODES.map((m, i) => (
            <button
              key={m.id}
              role="radio"
              aria-checked={s.mode === m.id}
              onClick={() => s.setMode(m.id)}
              className={`flex-1 py-2.5 font-heading text-[15px] cursor-pointer ${i > 0 ? 'border-l border-divider' : ''} ${
                s.mode === m.id ? 'bg-accent text-bg' : 'hover:bg-black/5'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="m-0 text-[13px] opacity-70 px-1">{mode.text}</p>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="text-[11px] tracking-wider uppercase font-bold opacity-55">Spillere</div>
        {s.players.map((p, i) => (
          <div key={p.id} className="flex items-center gap-2.5">
            <div className="w-[30px] h-[30px] flex-none rounded-full bg-accent2-100 text-accent2-800 flex items-center justify-center font-heading text-[13px]">
              {i + 1}
            </div>
            <Input
              placeholder={`Spiller ${i + 1}`}
              value={p.name}
              onChange={(e) => s.updateName(p.id, e.target.value)}
              className="flex-1"
            />
            <Button
              variant="icon"
              onClick={() => s.removePlayer(p.id)}
              disabled={n <= YATZY_MIN_PLAYERS}
              aria-label="Fjern spiller"
            >
              <X size={16} strokeWidth={2.75} />
            </Button>
          </div>
        ))}
        <Button
          variant="secondary"
          block
          onClick={s.addPlayer}
          disabled={n >= YATZY_MAX_PLAYERS}
          className="border-dashed"
        >
          <Plus size={16} strokeWidth={2.75} />
          Legg til spiller
        </Button>
      </div>

      <Button variant="primary" block onClick={s.startGame} className="text-[17px] p-3.5">
        Start spill
      </Button>

      <div className="px-4 py-3.5 bg-surface rounded-card text-[13px] opacity-80">
        Fem terninger og tre kast per tur. 50 poeng i bonus hvis du får minst 63 på enere til seksere. Høyest
        poengsum vinner.
      </div>
    </div>
  );
}
