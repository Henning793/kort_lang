import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GameId = 'kortlang' | 'femkamp' | 'yatzy';
export type View = 'hub' | GameId;

export type LastResult = { winners: string; date: string };

type AppState = {
  view: View;
  lastResults: Partial<Record<GameId, LastResult>>;
  open: (view: View) => void;
  recordResult: (game: GameId, winners: string[]) => void;
};

/** Navigasjon mellom startsiden og spillene, og hvem som vant sist i hvert spill. */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      view: 'hub',
      lastResults: {},
      open: (view) => set({ view }),
      recordResult: (game, winners) =>
        set((s) => ({
          lastResults: {
            ...s.lastResults,
            [game]: { winners: winners.join(' og '), date: new Date().toISOString() },
          },
        })),
    }),
    { name: 'spillbordet_app' }
  )
);

const WEEKDAYS = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];

/** «i dag», «i går», ukedag siste uke, ellers dato. */
export function relativeDay(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(d)) / 86_400_000);
  if (days <= 0) return 'i dag';
  if (days === 1) return 'i går';
  if (days < 7) return WEEKDAYS[d.getDay()];
  return `${d.getDate()}.${d.getMonth() + 1}.`;
}
