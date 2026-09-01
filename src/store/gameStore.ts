import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Player, Scores, Screen, Tab } from '../game/types';
import { emptyScoreRow } from '../game/logic';

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function initialPlayers(): Player[] {
  return [
    { id: makeId(), name: '' },
    { id: makeId(), name: '' },
  ];
}

function initialScores(players: Player[]): Scores {
  return players.reduce<Scores>((acc, p) => {
    acc[p.id] = emptyScoreRow();
    return acc;
  }, {});
}

type GameState = {
  screen: Screen;
  players: Player[];
  scores: Scores;
  round: number;
  tab: Tab;
  addPlayer: () => void;
  removePlayer: (id: string) => void;
  updateName: (id: string, name: string) => void;
  startGame: () => void;
  setTab: (tab: Tab) => void;
  saveRound: (draft: Record<string, string>) => void;
  editScore: (playerId: string, round: number, value: number) => void;
  resetGame: () => void;
};

const initPlayers = initialPlayers();

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      screen: 'setup',
      players: initPlayers,
      scores: initialScores(initPlayers),
      round: 0,
      tab: 'poeng',

      addPlayer: () =>
        set((s) => {
          if (s.players.length >= 8) return {};
          const id = makeId();
          return {
            players: [...s.players, { id, name: '' }],
            scores: { ...s.scores, [id]: emptyScoreRow() },
          };
        }),

      removePlayer: (id) =>
        set((s) => {
          if (s.players.length <= 2) return {};
          const scores = { ...s.scores };
          delete scores[id];
          return { players: s.players.filter((p) => p.id !== id), scores };
        }),

      updateName: (id, name) =>
        set((s) => ({
          players: s.players.map((p) => (p.id === id ? { ...p, name } : p)),
        })),

      startGame: () =>
        set((s) => ({
          players: s.players.map((p, i) => ({
            ...p,
            name: p.name.trim() ? p.name.trim() : `Spiller ${i + 1}`,
          })),
          screen: 'play' as Screen,
          round: 0,
          tab: 'poeng' as Tab,
        })),

      setTab: (tab) => set({ tab }),

      saveRound: (draft) =>
        set((s) => {
          const newScores: Scores = { ...s.scores };
          s.players.forEach((p) => {
            const raw = draft[p.id];
            const val = raw === undefined || raw === '' || raw === '-' ? 0 : parseInt(raw, 10);
            newScores[p.id] = s.scores[p.id].map((v, i) => (i === s.round ? val : v));
          });
          if (s.round < 6) {
            return { scores: newScores, round: s.round + 1 };
          }
          return { scores: newScores, screen: 'result' as Screen };
        }),

      editScore: (playerId, round, value) =>
        set((s) => ({
          scores: {
            ...s.scores,
            [playerId]: s.scores[playerId].map((v, i) => (i === round ? value : v)),
          },
        })),

      resetGame: () => {
        const players = initialPlayers();
        set({
          screen: 'setup',
          players,
          scores: initialScores(players),
          round: 0,
          tab: 'poeng',
        });
      },
    }),
    { name: 'kol_state' }
  )
);
