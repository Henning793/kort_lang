export type Player = { id: string; name: string };
export type Scores = Record<string, (number | null)[]>;
export type Screen = 'setup' | 'play' | 'result';
export type Tab = 'poeng' | 'stilling';

export type StandingRow = {
  id: string;
  name: string;
  total: number;
  rank: number;
  rankLabel: string;
  isDealer: boolean;
};
