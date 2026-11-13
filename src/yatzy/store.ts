import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Player, Screen } from '../game/types';
import { useAppStore } from '../store/appStore';
import { YATZY_MAX_PLAYERS, YATZY_MIN_PLAYERS, type YatzyMode } from './rules';
import { emptySheet, isComplete, yatzyStandings, type Sheets } from './logic';

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function blankPlayers(n = 2): Player[] {
  return Array.from({ length: n }, () => ({ id: makeId(), name: '' }));
}

function freshSheets(players: Player[]): Sheets {
  return Object.fromEntries(players.map((p) => [p.id, emptySheet()]));
}

type YatzyState = {
  screen: Screen;
  players: Player[];
  mode: YatzyMode;
  sheets: Sheets;
  addPlayer: () => void;
  removePlayer: (id: string) => void;
  updateName: (id: string, name: string) => void;
  setMode: (mode: YatzyMode) => void;
  startGame: () => void;
  setScore: (playerId: string, cat: number, value: number | null) => void;
  showResult: () => void;
  playAgain: () => void;
  resetGame: () => void;
};

const start = blankPlayers();

export const useYatzyStore = create<YatzyState>()(
  persist(
    (set) => ({
      screen: 'setup',
      players: start,
      mode: 'fri',
      sheets: freshSheets(start),

      addPlayer: () =>
        set((s) =>
          s.players.length >= YATZY_MAX_PLAYERS ? {} : { players: [...s.players, { id: makeId(), name: '' }] }
        ),
      removePlayer: (id) =>
        set((s) => (s.players.length <= YATZY_MIN_PLAYERS ? {} : { players: s.players.filter((p) => p.id !== id) })),
      updateName: (id, name) =>
        set((s) => ({ players: s.players.map((p) => (p.id === id ? { ...p, name } : p)) })),
      setMode: (mode) => set({ mode }),

      startGame: () =>
        set((s) => {
          const players = s.players.map((p, i) => ({ ...p, name: p.name.trim() || `Spiller ${i + 1}` }));
          return { players, sheets: freshSheets(players), screen: 'play' };
        }),

      setScore: (playerId, cat, value) =>
        set((s) => ({
          sheets: { ...s.sheets, [playerId]: s.sheets[playerId].map((v, i) => (i === cat ? value : v)) },
        })),

      showResult: () =>
        set((s) => {
          if (!isComplete(s.sheets, s.players)) return {};
          const st = yatzyStandings(s.players, s.sheets);
          useAppStore.getState().recordResult(
            'yatzy',
            st.filter((r) => r.rank === 1).map((r) => r.name)
          );
          return { screen: 'result' };
        }),

      playAgain: () => set((s) => ({ screen: 'setup', sheets: freshSheets(s.players) })),

      resetGame: () => {
        const players = blankPlayers();
        set({ screen: 'setup', players, sheets: freshSheets(players) });
      },
    }),
    { name: 'yatzy_state' }
  )
);
