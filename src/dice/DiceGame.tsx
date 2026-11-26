import { DiceGameContext } from './context';
import type { DiceGameDef } from './types';
import type { DiceStore } from './store';
import { DiceSetup } from './DiceSetup';
import { DicePlay } from './DicePlay';
import { DiceResult } from './DiceResult';

function Screens({ useStore }: { useStore: DiceStore }) {
  const screen = useStore((s) => s.screen);
  if (screen === 'play') return <DicePlay />;
  if (screen === 'result') return <DiceResult />;
  return <DiceSetup />;
}

/** Yatzy og Dyreyatzy: samme poengblokk og terningkopp, ulike regler. */
export function DiceGame({ def, useStore }: { def: DiceGameDef; useStore: DiceStore }) {
  return (
    <DiceGameContext.Provider value={{ def, useStore }}>
      <Screens useStore={useStore} />
    </DiceGameContext.Provider>
  );
}
