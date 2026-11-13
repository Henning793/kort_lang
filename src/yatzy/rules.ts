export type YatzyMode = 'fri' | 'tvungen';

export type YatzyCategory = {
  name: string;
  /** Kort forklaring som vises når man skal føre poeng. */
  hint: string;
  /** Lovlige poeng for ruten, 0 (stryk) først. */
  values: number[];
  upper?: boolean;
};

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const uniqSorted = (xs: number[]) => [...new Set(xs)].sort((a, b) => a - b);

function upper(face: number, name: string): YatzyCategory {
  return {
    name,
    hint: `Summen av alle ${face}-ere.`,
    values: range(6).map((k) => k * face),
    upper: true,
  };
}

const faces = [1, 2, 3, 4, 5, 6];

/** Skandinavisk Yatzy med fem terninger. */
export const YATZY_CATEGORIES: YatzyCategory[] = [
  upper(1, 'Enere'),
  upper(2, 'Toere'),
  upper(3, 'Treere'),
  upper(4, 'Firere'),
  upper(5, 'Femmere'),
  upper(6, 'Seksere'),
  { name: 'Ett par', hint: 'Summen av to like.', values: [0, ...faces.map((f) => 2 * f)] },
  {
    name: 'To par',
    hint: 'Summen av to ulike par.',
    values: uniqSorted([0, ...faces.flatMap((a) => faces.filter((b) => b > a).map((b) => 2 * a + 2 * b))]),
  },
  { name: 'Tre like', hint: 'Summen av tre like.', values: [0, ...faces.map((f) => 3 * f)] },
  { name: 'Fire like', hint: 'Summen av fire like.', values: [0, ...faces.map((f) => 4 * f)] },
  { name: 'Liten straight', hint: '1-2-3-4-5 gir 15 poeng.', values: [0, 15] },
  { name: 'Stor straight', hint: '2-3-4-5-6 gir 20 poeng.', values: [0, 20] },
  {
    name: 'Hus',
    hint: 'Tre like og et par. Summen av alle terningene.',
    values: uniqSorted([0, ...faces.flatMap((a) => faces.filter((b) => b !== a).map((b) => 3 * a + 2 * b))]),
  },
  { name: 'Sjanse', hint: 'Summen av alle terningene.', values: [0, ...range(26).map((i) => i + 5)] },
  { name: 'Yatzy', hint: 'Fem like gir 50 poeng.', values: [0, 50] },
];

export const YATZY_NUM = YATZY_CATEGORIES.length;
export const UPPER_COUNT = 6;
export const BONUS_LIMIT = 63;
export const BONUS = 50;
export const YATZY_MIN_PLAYERS = 1;
export const YATZY_MAX_PLAYERS = 8;
