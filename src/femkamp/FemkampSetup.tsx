import { Plus, X } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { BackButton } from '../components/BackButton';
import { useFemkampStore } from './store';
import {
  FEMKAMP_ROUNDS,
  FEMKAMP_MAX_PLAYERS,
  FEMKAMP_MIN_PLAYERS,
  cardsPerPlayer,
  cardsRemoved,
} from './rules';

export function FemkampSetup() {
  const players = useFemkampStore((s) => s.players);
  const addPlayer = useFemkampStore((s) => s.addPlayer);
  const removePlayer = useFemkampStore((s) => s.removePlayer);
  const updateName = useFemkampStore((s) => s.updateName);
  const startGame = useFemkampStore((s) => s.startGame);

  const n = players.length;
  const removed = cardsRemoved(n);

  return (
    <div className="px-5 pt-4 pb-10 flex flex-col gap-6">
      <div className="flex items-center gap-1.5">
        <BackButton />
        <h1 className="text-[28px] m-0">Femkamp</h1>
      </div>

      <p className="m-0 opacity-75 text-sm">
        Legg inn spillerne i den rekkefølgen dere sitter. Første spiller deler ut i runde 1, så går det
        på rundgang.
      </p>

      <div className="flex flex-col gap-2.5">
        {players.map((p, i) => (
          <div key={p.id} className="flex items-center gap-2.5">
            <div className="w-[30px] h-[30px] flex-none rounded-full bg-accent2-100 text-accent2-800 flex items-center justify-center font-heading text-[13px]">
              {i + 1}
            </div>
            <Input
              placeholder={`Spiller ${i + 1}`}
              value={p.name}
              onChange={(e) => updateName(p.id, e.target.value)}
              className="flex-1"
            />
            <Button
              variant="icon"
              onClick={() => removePlayer(p.id)}
              disabled={n <= FEMKAMP_MIN_PLAYERS}
              aria-label="Fjern spiller"
            >
              <X size={16} strokeWidth={2.75} />
            </Button>
          </div>
        ))}
      </div>

      <Button
        variant="secondary"
        block
        onClick={addPlayer}
        disabled={n >= FEMKAMP_MAX_PLAYERS}
        className="border-dashed"
      >
        <Plus size={16} strokeWidth={2.75} />
        Legg til spiller
      </Button>

      <div className="mt-2">
        <Button variant="primary" block onClick={startGame} className="text-[17px] p-3.5">
          Start spill
        </Button>
      </div>

      <div className="mt-2 px-4 py-3.5 bg-surface rounded-card text-[13px] flex flex-col gap-2">
        <div>
          <b>Fem runder, minst tre spillere.</b> Færrest poeng til slutt vinner.
        </div>
        <ol className="m-0 pl-5 flex flex-col gap-0.5 list-decimal">
          {FEMKAMP_ROUNDS.map((r) => (
            <li key={r.name}>{r.name}</li>
          ))}
        </ol>
        <div className="opacity-75">
          {removed > 0
            ? `Med ${n} spillere tar dere ut ${removed} kort før utdeling, så får alle ${cardsPerPlayer(n)} kort.`
            : `Med ${n} spillere får alle ${cardsPerPlayer(n)} kort.`}
        </div>
      </div>
    </div>
  );
}
