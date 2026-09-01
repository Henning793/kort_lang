import { Plus, X } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CardIcon } from '../components/ui/CardIcon';

export function SetupScreen() {
  const players = useGameStore((s) => s.players);
  const addPlayer = useGameStore((s) => s.addPlayer);
  const removePlayer = useGameStore((s) => s.removePlayer);
  const updateName = useGameStore((s) => s.updateName);
  const startGame = useGameStore((s) => s.startGame);

  const canAdd = players.length < 8;
  const canRemove = players.length > 2;

  return (
    <div className="px-5 pt-7 pb-10 flex flex-col gap-6">
      <div className="flex items-center gap-2.5">
        <CardIcon size={26} />
        <h1 className="text-[28px] m-0">Kort og lang</h1>
      </div>

      <p className="m-0 opacity-75 text-sm">
        Legg til spillerne som skal være med. Du kan endre navn, men ikke antall spillere etter at
        spillet er startet.
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
              disabled={!canRemove}
              aria-label="Fjern spiller"
            >
              <X size={16} strokeWidth={2.75} />
            </Button>
          </div>
        ))}
      </div>

      <Button variant="secondary" block onClick={addPlayer} disabled={!canAdd} className="border-dashed">
        <Plus size={16} strokeWidth={2.75} />
        Legg til spiller
      </Button>

      <div className="mt-2">
        <Button variant="primary" block onClick={startGame} className="text-[17px] p-3.5">
          Start spill
        </Button>
      </div>

      <div className="mt-2 px-4 py-3.5 bg-surface rounded-card text-[12.5px] opacity-80">
        7 runder: kort+kort · kort+lang · lang+lang · kort+kort+kort · kort+kort+lang · kort+lang+lang
        · lang+lang+lang. Færrest poeng vinner.
      </div>
    </div>
  );
}
