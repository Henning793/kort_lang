export type RoundDef = { label: string; combo: number[] };

export const ROUNDS: RoundDef[] = [
  { label: 'kort + kort', combo: [26, 26] },
  { label: 'kort + lang', combo: [26, 44] },
  { label: 'lang + lang', combo: [44, 44] },
  { label: 'kort + kort + kort', combo: [26, 26, 26] },
  { label: 'kort + kort + lang', combo: [26, 26, 44] },
  { label: 'kort + lang + lang', combo: [26, 44, 44] },
  { label: 'lang + lang + lang', combo: [44, 44, 44] },
];

export const NUM_ROUNDS = ROUNDS.length;
