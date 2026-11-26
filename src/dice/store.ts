import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Player, Screen } from '../game/types';
import { useAppStore } from '../store/appStore';
import { DICE_COUNT, MAX_ROLLS, type DiceGameDef, type DiceMode, type SheetMode } from './types';
import { emptySheet, isComplete, rollDie, standings, type Sheets } from './logic';
import { activeRoll, canRoll, type Roll } from './roll';

export type { Roll } from './roll';

export type DiceState = {
  screen: Screen;
  players: Player[];
  mode: SheetMode;
  diceMode: DiceMode;
  sheets: Sheets;
  roll: Roll | null;
  addPlayer: () => void;
  removePlayer: (id: string) => void;
  updateName: (id: string, name: string) => void;
  setMode: (mode: SheetMode) => void;
  setDiceMode: (mode: DiceMode) => void;
  startGame: () => void;
  setScore: (playerId: string, cat: number, value: number | null) => void;
  /** Kaster terningene som ikke er tatt bort. */
  /** `keep` legger terninger som passer ruten blant de man beholder (tvungen). */
  rollDice: (key: string, keep?: (dice: number[]) => boolean[]) => void;
  /** Tar bort en terning (beholder den) eller legger den tilbake i koppen. */
  toggleHold: (key: string, i: number) => void;
  /** Beholder akkurat disse terningene (f.eks. de som passer en rute man trykket på). */
  holdDice: (key: string, held: boolean[]) => void;
  clearRoll: () => void;
  showResult: () => void;
  playAgain: () => void;
  resetGame: () => void;
};

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function blankPlayers(n = 2): Player[] {
  return Array.from({ length: n }, () => ({ id: makeId(), name: '' }));
}

export function createDiceStore(def: DiceGameDef, storageKey: string) {
  const freshSheets = (players: Player[]): Sheets => Object.fromEntries(players.map((p) => [p.id, emptySheet(def)]));
  const start = blankPlayers();

  return create<DiceState>()(
    persist(
      (set) => ({
        screen: 'setup',
        players: start,
        mode: 'fri',
        diceMode: 'fysisk',
        sheets: freshSheets(start),
        roll: null,

        addPlayer: () =>
          set((s) => (s.players.length >= def.maxPlayers ? {} : { players: [...s.players, { id: makeId(), name: '' }] })),
        removePlayer: (id) =>
          set((s) => (s.players.length <= def.minPlayers ? {} : { players: s.players.filter((p) => p.id !== id) })),
        updateName: (id, name) => set((s) => ({ players: s.players.map((p) => (p.id === id ? { ...p, name } : p)) })),
        setMode: (mode) => set({ mode }),
        setDiceMode: (diceMode) => set({ diceMode }),

        startGame: () =>
          set((s) => {
            const players = s.players.map((p, i) => ({ ...p, name: p.name.trim() || `Spiller ${i + 1}` }));
            return { players, sheets: freshSheets(players), roll: null, screen: 'play' };
          }),

        setScore: (playerId, cat, value) =>
          set((s) => ({
            sheets: { ...s.sheets, [playerId]: (s.sheets[playerId] ?? emptySheet(def)).map((v, i) => (i === cat ? value : v)) },
          })),

        rollDice: (key, keep) =>
          set((s) => {
            const r = activeRoll(s.roll, key);
            if (!canRoll(r)) return {};
            const held = r.used === 0 ? Array(DICE_COUNT).fill(false) : r.held;
            const dice = r.dice.map((d, i) => (held[i] ? d : rollDie()));
            return { roll: { key, dice, held: keep ? keep(dice) : held, used: r.used + 1 } };
          }),

        holdDice: (key, held) =>
          set((s) => {
            const r = s.roll;
            if (!r || r.key !== key || r.used === 0 || r.used >= MAX_ROLLS) return {};
            return { roll: { ...r, held } };
          }),

        toggleHold: (key, i) =>
          set((s) => {
            const r = s.roll;
            if (!r || r.key !== key || r.used === 0 || r.used >= MAX_ROLLS) return {};
            return { roll: { ...r, held: r.held.map((h, j) => (j === i ? !h : h)) } };
          }),

        clearRoll: () => set({ roll: null }),

        showResult: () =>
          set((s) => {
            if (!isComplete(def, s.sheets, s.players)) return {};
            const st = standings(def, s.players, s.sheets);
            useAppStore.getState().recordResult(
              def.id,
              st.filter((r) => r.rank === 1).map((r) => r.name)
            );
            return { screen: 'result', roll: null };
          }),

        playAgain: () => set((s) => ({ screen: 'setup', sheets: freshSheets(s.players), roll: null })),

        resetGame: () => {
          const players = blankPlayers();
          set({ screen: 'setup', players, sheets: freshSheets(players), roll: null });
        },
      }),
      { name: storageKey }
    )
  );
}

export type DiceStore = ReturnType<typeof createDiceStore>;
