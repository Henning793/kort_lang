import { createContext, useContext } from 'react';
import type { DiceGameDef } from './types';
import type { DiceStore } from './store';

export type DiceGameCtx = { def: DiceGameDef; useStore: DiceStore };

export const DiceGameContext = createContext<DiceGameCtx | null>(null);

export function useDiceGame(): DiceGameCtx {
  const ctx = useContext(DiceGameContext);
  if (!ctx) throw new Error('useDiceGame må brukes inne i et terningspill');
  return ctx;
}
