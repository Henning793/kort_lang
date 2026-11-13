import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Player, Screen, Tab } from '../game/types';
import { computeStandings, winnersOf } from '../game/logic';
import { useAppStore } from '../store/appStore';
import { FEMKAMP_NUM_ROUNDS, FEMKAMP_MAX_PLAYERS, FEMKAMP_MIN_PLAYERS } from './rules';
import { femkampScores, type Kabal } from './logic';

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function blankPlayers(n = FEMKAMP_MIN_PLAYERS): Player[] {
  return Array.from({ length: n }, () => ({ id: makeId(), name: '' }));
}

function freshTally(n: number) {
  return {
    counts: Array.from({ length: FEMKAMP_NUM_ROUNDS }, () => Array(n).fill(0) as number[]),
    kabal: { pass: Array(n).fill(0), left: Array(n).fill(0), phase: 'live' } as Kabal,
    saved: Array(FEMKAMP_NUM_ROUNDS).fill(false) as boolean[],
  };
}

type FemkampState = {
  screen: Screen;
  players: Player[];
  /** Runden som spilles nå (0–4). */
  current: number;
  /** Runden som vises (kan være en tidligere runde som rettes). */
  view: number;
  tab: Tab;
  counts: number[][];
  kabal: Kabal;
  saved: boolean[];

  addPlayer: () => void;
  removePlayer: (id: string) => void;
  updateName: (id: string, name: string) => void;
  startGame: () => void;
  setTab: (tab: Tab) => void;
  setView: (round: number) => void;
  adjustCount: (round: number, i: number, delta: number) => void;
  adjustPass: (i: number, delta: number) => void;
  adjustLeft: (i: number, delta: number) => void;
  setKabalPhase: (phase: Kabal['phase']) => void;
  saveRound: () => void;
  playAgain: () => void;
  resetGame: () => void;
};

const start = blankPlayers();

export const useFemkampStore = create<FemkampState>()(
  persist(
    (set) => ({
      screen: 'setup',
      players: start,
      current: 0,
      view: 0,
      tab: 'poeng',
      ...freshTally(start.length),

      addPlayer: () =>
        set((s) =>
          s.players.length >= FEMKAMP_MAX_PLAYERS ? {} : { players: [...s.players, { id: makeId(), name: '' }] }
        ),

      removePlayer: (id) =>
        set((s) =>
          s.players.length <= FEMKAMP_MIN_PLAYERS ? {} : { players: s.players.filter((p) => p.id !== id) }
        ),

      updateName: (id, name) =>
        set((s) => ({ players: s.players.map((p) => (p.id === id ? { ...p, name } : p)) })),

      startGame: () =>
        set((s) => ({
          players: s.players.map((p, i) => ({ ...p, name: p.name.trim() || `Spiller ${i + 1}` })),
          ...freshTally(s.players.length),
          screen: 'play',
          current: 0,
          view: 0,
          tab: 'poeng',
        })),

      setTab: (tab) => set({ tab }),

      setView: (round) =>
        set((s) => (round <= s.current && round < FEMKAMP_NUM_ROUNDS ? { view: round, tab: 'poeng' } : {})),

      adjustCount: (round, i, delta) =>
        set((s) => ({
          counts: s.counts.map((row, r) =>
            r === round ? row.map((v, k) => (k === i ? Math.max(0, v + delta) : v)) : row
          ),
        })),

      adjustPass: (i, delta) =>
        set((s) => ({
          kabal: { ...s.kabal, pass: s.kabal.pass.map((v, k) => (k === i ? Math.max(0, v + delta) : v)) },
        })),

      adjustLeft: (i, delta) =>
        set((s) => ({
          kabal: { ...s.kabal, left: s.kabal.left.map((v, k) => (k === i ? Math.max(0, v + delta) : v)) },
        })),

      setKabalPhase: (phase) => set((s) => ({ kabal: { ...s.kabal, phase } })),

      saveRound: () =>
        set((s) => {
          const saved = s.saved.map((v, r) => (r === s.view ? true : v));
          if (s.view !== s.current) {
            return { saved, view: s.current };
          }
          const current = s.current + 1;
          if (current < FEMKAMP_NUM_ROUNDS) {
            return { saved, current, view: current, tab: 'poeng' };
          }
          const scores = femkampScores(s.players, { counts: s.counts, kabal: s.kabal, saved });
          const winners = winnersOf(computeStandings(s.players, scores, 0)).map((w) => w.name);
          useAppStore.getState().recordResult('femkamp', winners);
          return { saved, current: FEMKAMP_NUM_ROUNDS - 1, view: FEMKAMP_NUM_ROUNDS - 1, screen: 'result' };
        }),

      playAgain: () =>
        set((s) => ({ screen: 'setup', ...freshTally(s.players.length), current: 0, view: 0, tab: 'poeng' })),

      resetGame: () => {
        const players = blankPlayers();
        set({ screen: 'setup', players, ...freshTally(players.length), current: 0, view: 0, tab: 'poeng' });
      },
    }),
    { name: 'femkamp_state' }
  )
);
