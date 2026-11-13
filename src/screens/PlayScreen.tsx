import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { ROUNDS } from '../game/rounds';
import { CardIcon } from '../components/ui/CardIcon';
import { Button } from '../components/ui/Button';
import { RoundProgressDots } from '../components/RoundProgressDots';
import { TabSwitcher } from '../components/TabSwitcher';
import { NewGameDialog } from '../components/NewGameDialog';
import { BackButton } from '../components/BackButton';
import { TurnBanner } from '../components/game/TurnBanner';
import { playerColor } from '../components/game/colors';
import { dealerIndex } from '../game/logic';
import { PoengTab } from './PoengTab';
import { StillingTab } from './StillingTab';

export function PlayScreen() {
  const round = useGameStore((s) => s.round);
  const tab = useGameStore((s) => s.tab);
  const setTab = useGameStore((s) => s.setTab);
  const players = useGameStore((s) => s.players);
  const dIdx = dealerIndex(round, players.length);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const roundDef = ROUNDS[round] ?? ROUNDS[0];

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center gap-2 px-5 pt-4 pb-2">
        <BackButton />
        <div className="flex items-center gap-2 font-heading text-[17px] mr-auto">
          <CardIcon size={18} />
          Kort og lang
        </div>
        <Button variant="ghost" onClick={() => setConfirmOpen(true)}>
          Nytt spill
        </Button>
      </div>

      <div className="px-5 pt-1 pb-3.5">
        <h2 className="m-0 mb-2.5 text-[23px]">
          Runde {round + 1} <span className="font-body text-sm opacity-50">av 7</span>
        </h2>
        <RoundProgressDots current={round} />
        <div>
          <TurnBanner
            animKey={`stokk-${round}`}
            color={playerColor(dIdx)}
            title={`${players[dIdx]?.name ?? ''} stokker`}
            subtitle={`Runde ${round + 1} · ${roundDef.label}`}
            art={roundDef.combo.map((h, i) => (
              <span
                key={i}
                className="yz-roll block w-[16px] rounded-[4px] bg-bg/90 border-[1.5px] border-bg self-end"
                style={{ height: h * 0.75, ['--r' as string]: '0deg', animationDelay: `${i * 70}ms` }}
              />
            ))}
          />
        </div>
      </div>

      <div className="mx-5 mb-4">
        <TabSwitcher tab={tab} onChange={setTab} />
      </div>

      {tab === 'poeng' ? <PoengTab /> : <StillingTab />}

      <NewGameDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} />
    </div>
  );
}
