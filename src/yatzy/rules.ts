import { counts } from '../dice/logic';
import type { DiceCategory, DiceGameDef, SheetMode } from '../dice/types';
import { playerColor } from '../components/game/colors';

export type YatzyMode = SheetMode;
export type YatzyCategory = DiceCategory;

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const uniqSorted = (xs: number[]) => [...new Set(xs)].sort((a, b) => a - b);
const sum = (dice: number[]) => dice.reduce((a, d) => a + d, 0);
const faces = [1, 2, 3, 4, 5, 6];

/** Høyeste side med minst n like, eller 0. */
function bestOfKind(dice: number[], n: number): number {
  const c = counts(dice);
  for (let f = 6; f >= 1; f--) if (c[f] >= n) return f;
  return 0;
}

function upper(face: number, name: string): YatzyCategory {
  return {
    name,
    hint: `Summen av alle ${face}-ere.`,
    values: range(6).map((k) => k * face),
    upper: true,
    face,
    score: (dice) => counts(dice)[face] * face,
  };
}

/** Skandinavisk Yatzy med fem terninger. */
export const YATZY_CATEGORIES: YatzyCategory[] = [
  upper(1, 'Enere'),
  upper(2, 'Toere'),
  upper(3, 'Treere'),
  upper(4, 'Firere'),
  upper(5, 'Femmere'),
  upper(6, 'Seksere'),
  {
    name: 'Ett par',
    hint: 'Summen av to like.',
    values: [0, ...faces.map((f) => 2 * f)],
    score: (d) => 2 * bestOfKind(d, 2),
  },
  {
    name: 'To par',
    hint: 'Summen av to ulike par.',
    values: uniqSorted([0, ...faces.flatMap((a) => faces.filter((b) => b > a).map((b) => 2 * a + 2 * b))]),
    score: (d) => {
      const c = counts(d);
      const pairs = faces.filter((f) => c[f] >= 2).sort((a, b) => b - a);
      return pairs.length >= 2 ? 2 * pairs[0] + 2 * pairs[1] : 0;
    },
  },
  {
    name: 'Tre like',
    hint: 'Summen av tre like.',
    values: [0, ...faces.map((f) => 3 * f)],
    score: (d) => 3 * bestOfKind(d, 3),
  },
  {
    name: 'Fire like',
    hint: 'Summen av fire like.',
    values: [0, ...faces.map((f) => 4 * f)],
    score: (d) => 4 * bestOfKind(d, 4),
  },
  {
    name: 'Liten straight',
    hint: '1-2-3-4-5 gir 15 poeng.',
    values: [0, 15],
    score: (d) => ([...d].sort().join('') === '12345' ? 15 : 0),
  },
  {
    name: 'Stor straight',
    hint: '2-3-4-5-6 gir 20 poeng.',
    values: [0, 20],
    score: (d) => ([...d].sort().join('') === '23456' ? 20 : 0),
  },
  {
    name: 'Hus',
    hint: 'Tre like og et par. Summen av alle terningene.',
    values: uniqSorted([0, ...faces.flatMap((a) => faces.filter((b) => b !== a).map((b) => 3 * a + 2 * b))]),
    score: (d) => {
      const c = counts(d);
      return c.includes(3) && c.includes(2) ? sum(d) : 0;
    },
  },
  {
    name: 'Sjanse',
    hint: 'Summen av alle terningene.',
    values: [0, ...range(26).map((i) => i + 5)],
    score: (d) => (d.every((x) => x >= 1) ? sum(d) : 0),
  },
  {
    name: 'Yatzy',
    hint: 'Fem like gir 50 poeng.',
    values: [0, 50],
    yatzy: true,
    score: (d) => (bestOfKind(d, 5) ? 50 : 0),
  },
];

export const YATZY_NUM = YATZY_CATEGORIES.length;
export const UPPER_COUNT = 6;
export const BONUS_LIMIT = 63;
export const BONUS = 50;
export const YATZY_MIN_PLAYERS = 1;
export const YATZY_MAX_PLAYERS = 8;

export const YATZY: DiceGameDef = {
  id: 'yatzy',
  title: 'Yatzy',
  tagline: 'Fem terninger, tre kast. Høyest poengsum vinner.',
  kind: 'tall',
  color: playerColor(1),
  categories: YATZY_CATEGORIES,
  upperCount: UPPER_COUNT,
  bonusLimit: BONUS_LIMIT,
  bonus: BONUS,
  par: (cat) => 3 * (cat + 1),
  minPlayers: YATZY_MIN_PLAYERS,
  maxPlayers: YATZY_MAX_PLAYERS,
};
