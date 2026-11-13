export type FemkampRound = {
  name: string;
  /** Symbol på det lille spillkortet som viser runden. */
  glyph: string;
  red: boolean;
  kind: 'count' | 'kabal';
  /** Hva som telles i runden (stikk, kløver, damer). */
  unit?: string;
  /** Poeng per enhet. Negativt betyr at det er bra å få dem. */
  mult?: number;
  /** Hvor mange det finnes i en full kortstokk (kløver og damer). */
  inDeck?: number;
  /** Runden telles i stikk, så summen skal bli antall stikk. */
  tricks?: boolean;
  desc: string;
};

export const FEMKAMP_ROUNDS: FemkampRound[] = [
  {
    name: 'Unngå stikk',
    glyph: '♠',
    red: false,
    kind: 'count',
    unit: 'stikk',
    mult: 1,
    tricks: true,
    desc: 'Høyeste kort i fargen som ble spilt ut tar stikket. 1 poeng per stikk.',
  },
  {
    name: 'Unngå kløver',
    glyph: '♣',
    red: false,
    kind: 'count',
    unit: 'kløver',
    mult: 1,
    inDeck: 13,
    desc: '1 poeng per kløver du har i stikkene dine.',
  },
  {
    name: 'Unngå damer',
    glyph: 'D',
    red: true,
    kind: 'count',
    unit: 'damer',
    mult: 4,
    inDeck: 4,
    desc: '4 poeng per dame du har i stikkene dine.',
  },
  {
    name: 'Kabal',
    glyph: '7',
    red: true,
    kind: 'kabal',
    desc: 'Start med en 7-er og bygg opp og ned i hver farge. 1 poeng per pass, pluss 1 per kort du sitter igjen med når noen er ferdig.',
  },
  {
    name: 'Ta stikk',
    glyph: '♥',
    red: true,
    kind: 'count',
    unit: 'stikk',
    mult: -1,
    tricks: true,
    desc: 'Nå er stikk bra: hvert stikk gir 1 poeng mindre.',
  },
];

export const FEMKAMP_NUM_ROUNDS = FEMKAMP_ROUNDS.length;
export const FEMKAMP_MIN_PLAYERS = 3;
export const FEMKAMP_MAX_PLAYERS = 8;
export const DECK_SIZE = 52;

/** Kort som tas ut før utdeling, så alle får like mange. */
export function cardsRemoved(numPlayers: number): number {
  return DECK_SIZE % numPlayers;
}

/** Antall kort hver spiller får, og dermed antall stikk per runde. */
export function cardsPerPlayer(numPlayers: number): number {
  return Math.floor(DECK_SIZE / numPlayers);
}
