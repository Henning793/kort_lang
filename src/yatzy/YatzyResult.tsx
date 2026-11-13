import { useRef, useState } from 'react';
import { Award, Dices } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { BackButton } from '../components/BackButton';
import { ConfettiBomb } from '../components/ConfettiBomb';
import { useAppStore } from '../store/appStore';
import { useYatzyStore } from './store';
import { yatzyStandings } from './logic';

export function YatzyResult() {
  const s = useYatzyStore();
  const open = useAppStore((a) => a.open);
  const [shaking, setShaking] = useState(false);
  const winnerCardRef = useRef<HTMLDivElement>(null);

  const standings = yatzyStandings(s.players, s.sheets);
  const winners = standings.filter((r) => r.rank === 1);
  const th = 'text-[11px] tracking-wider uppercase opacity-60 py-2 border-b border-divider';
  const td = 'py-2 border-b border-black/10';

  return (
    <>
      <ConfettiBomb originRef={winnerCardRef} onBlast={() => setShaking(true)} />
      <div
        className={`flex flex-col flex-1 pb-7 ${shaking ? 'kol-shake' : ''}`}
        onAnimationEnd={(e) => e.target === e.currentTarget && setShaking(false)}
      >
        <div className="flex items-center gap-2 px-5 pt-4">
          <BackButton />
          <div className="flex items-center gap-2 font-heading text-[17px]">
            <Dices size={18} strokeWidth={2.5} color="#c67139" />
            Yatzy
          </div>
        </div>

        <div
          ref={winnerCardRef}
          className="relative m-5 mb-2 p-9 px-6 rounded-card bg-surface text-center overflow-visible animate-[kolPop_0.5s_ease]"
        >
          <Award size={40} color="#c67139" strokeWidth={2.75} className="mx-auto mb-2" />
          <div className="text-[10px] tracking-[0.1em] uppercase text-accent mb-1">Vinner</div>
          <h1 className="m-0 mb-1.5 text-[30px]">{winners.map((w) => w.name).join(' og ')}</h1>
          <div className="opacity-70 text-sm">
            {winners[0]?.total} poeng{winners.length > 1 ? ' (delt seier)' : ''}
          </div>
        </div>

        <div className="px-5 pt-2">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead>
              <tr>
                <th className={`${th} text-left`}>Plass</th>
                <th className={`${th} text-left`}>Spiller</th>
                <th className={`${th} text-right`}>Poeng</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((r) => (
                <tr key={r.id}>
                  <td className={`${td} font-heading`}>{r.rank}.</td>
                  <td className={td}>{r.name}</td>
                  <td className={`${td} text-right font-bold`}>{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 pt-6 mt-auto flex gap-2">
          <Button variant="secondary" className="flex-1 p-3.5 text-base" onClick={() => open('hub')}>
            Alle spill
          </Button>
          <Button variant="primary" className="flex-1 p-3.5 text-base" onClick={s.playAgain}>
            Spill igjen
          </Button>
        </div>
      </div>
    </>
  );
}
