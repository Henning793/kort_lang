import { useRef, useState } from 'react';
import { Award } from 'lucide-react';
import { CardIcon } from '../components/ui/CardIcon';
import { Button } from '../components/ui/Button';
import { BackButton } from '../components/BackButton';
import { ConfettiBomb } from '../components/ConfettiBomb';
import { computeStandings, winnersOf } from '../game/logic';
import { useAppStore } from '../store/appStore';
import { useFemkampStore } from './store';
import { femkampScores, fmtPoints } from './logic';
import { FemkampTable } from './FemkampTable';

export function FemkampResult() {
  const s = useFemkampStore();
  const open = useAppStore((a) => a.open);
  const [shaking, setShaking] = useState(false);
  const winnerCardRef = useRef<HTMLDivElement>(null);

  const scores = femkampScores(s.players, s);
  const standings = computeStandings(s.players, scores, 0);
  const winners = winnersOf(standings);

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
            <CardIcon size={18} />
            Femkamp
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
            {winners.length ? `${fmtPoints(winners[0].total)} poeng etter fem runder` : ''}
            {winners.length > 1 ? ' (delt seier)' : ''}
          </div>
        </div>

        <div className="px-5 pt-2">
          <FemkampTable standings={standings} scores={scores} />
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
