import { DICE_COUNT, MAX_ROLLS } from './types';

/** Kastet som pågår. `key` er spiller + tur, så et kast hører alltid til én tur. */
export type Roll = { key: string; dice: number[]; held: boolean[]; used: number };

export function freshRoll(key: string): Roll {
  return { key, dice: Array(DICE_COUNT).fill(0), held: Array(DICE_COUNT).fill(false), used: 0 };
}

/** Kastet for denne turen, eller et nytt et hvis det lagrede hører til en annen tur. */
export function activeRoll(roll: Roll | null, key: string): Roll {
  return roll && roll.key === key ? roll : freshRoll(key);
}

/** Det er kast igjen, og minst én terning ligger i koppen. */
export function canRoll(r: Roll): boolean {
  return r.used < MAX_ROLLS && !(r.used > 0 && r.held.every(Boolean));
}
