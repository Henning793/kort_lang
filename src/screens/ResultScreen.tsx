import { useState } from 'react';
import { Award } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { computeStandings, winnersOf } from '../game/logic';
import { CardIcon } from '../components/ui/CardIcon';
import { Button } from '../components/ui/Button';
import { NewGameDialog } from '../components/NewGameDialog';

export function ResultScreen() {
  const players = useGameStore((s) => s.players);
  const scores = useGameStore((s) => s.scores);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const standings = computeStandings(players, scores, 6);
  const winners = winnersOf(standings);
  const winnerNames = winners.map((w) => w.name).join(' og ');
  const winnerTotalLabel = winners.length
    ? `${winners[0].total} poeng${winners.length > 1 ? ' (delt seier)' : ''}`
    : '';

  return (
    <div className="flex flex-col flex-1 pb-7">
      <div className="flex items-center gap-4 px-5 pt-4">
        <div className="flex items-center gap-2 font-heading text-[17px]">
          <CardIcon size={18} />
          Kort og lang
        </div>
      </div>

      <div className="relative m-5 mb-2 p-9 px-6 rounded-card bg-surface text-center overflow-visible animate-[kolPop_0.5s_ease]">
        <div
          className="absolute rounded-full bg-accent-400"
          style={{ top: -8, left: 14, width: 16, height: 16, animation: 'kolFloat 3.2s ease-in-out infinite' }}
        />
        <div
          className="absolute rounded-full bg-accent2-400"
          style={{ top: 6, right: 22, width: 12, height: 12, animation: 'kolFloat 2.6s ease-in-out infinite .3s' }}
        />
        <div
          className="absolute rounded-full bg-accent2-300"
          style={{ bottom: 10, left: 30, width: 10, height: 10, animation: 'kolFloat 3.6s ease-in-out infinite .6s' }}
        />
        <div
          className="absolute rounded-full bg-accent-300"
          style={{ top: -12, right: 60, width: 9, height: 9, animation: 'kolFloat 2.9s ease-in-out infinite .15s' }}
        />

        <Award size={40} color="#c67139" strokeWidth={2.75} className="mx-auto mb-2" />
        <div className="text-[10px] tracking-[0.1em] uppercase text-accent mb-1">Vinner</div>
        <h1 className="m-0 mb-1.5 text-[30px]">{winnerNames}</h1>
        <div className="opacity-70 text-sm">{winnerTotalLabel}</div>
      </div>

      <div className="px-5 pt-2">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="text-left text-[11px] tracking-wider uppercase opacity-60 py-2 border-b border-divider">
                Plass
              </th>
              <th className="text-left text-[11px] tracking-wider uppercase opacity-60 py-2 border-b border-divider">
                Spiller
              </th>
              <th className="text-right text-[11px] tracking-wider uppercase opacity-60 py-2 border-b border-divider">
                Poeng
              </th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s) => (
              <tr key={s.id}>
                <td className="font-heading py-2 border-b border-black/10">{s.rankLabel}</td>
                <td className="py-2 border-b border-black/10">{s.name}</td>
                <td className="text-right font-bold py-2 border-b border-black/10">{s.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 pt-6 mt-auto">
        <Button variant="primary" block onClick={() => setConfirmOpen(true)} className="text-base p-3.5">
          Nytt spill
        </Button>
      </div>

      <NewGameDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} />
    </div>
  );
}
