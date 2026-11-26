/** Fri: velg rute selv. Tvungen: ovenfra og ned. */
export type SheetMode = 'fri' | 'tvungen';
/** Fysiske terninger på bordet, eller trill i appen ved å riste telefonen. */
export type DiceMode = 'fysisk' | 'app';
/** Vanlige tallterninger eller dyreterninger. */
export type DiceKind = 'tall' | 'dyr';

export type DiceCategory = {
  name: string;
  /** Kort forklaring som vises når man skal føre poeng. */
  hint: string;
  /** Lovlige poeng for ruten, 0 (stryk) først. */
  values: number[];
  /** Ruter som teller mot bonus. */
  upper?: boolean;
  /** Terningside (1–6) som vises ved ruten. */
  face?: number;
  /** Fem like: feires ekstra. */
  yatzy?: boolean;
  /** Poeng for ruten med disse fem terningene (0 hvis de ikke passer). */
  score: (dice: number[]) => number;
  /** Terningene som passer ruten. Brukes i tvungen spillmåte for å beholde dem automatisk. */
  keep: (dice: number[]) => boolean[];
};

export type DiceGameId = 'yatzy' | 'dyreyatzy';

export type DiceGameDef = {
  id: DiceGameId;
  title: string;
  tagline: string;
  kind: DiceKind;
  /** Farge på toppkortet i oppsettet. */
  color: string;
  categories: DiceCategory[];
  upperCount: number;
  bonusLimit: number;
  bonus: number;
  /** «Skjema» per øvre rute (f.eks. tre av hver), eller utelatt for å skjule. */
  par?: (cat: number) => number;
  minPlayers: number;
  maxPlayers: number;
};

export const DICE_COUNT = 5;
export const MAX_ROLLS = 3;
