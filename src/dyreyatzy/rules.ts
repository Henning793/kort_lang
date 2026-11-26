import { counts } from '../dice/logic';
import { keepFace, keepOfKind, keepTwoPairs, keepHouse, keepDistinct, type KeepFn } from '../dice/keep';
import type { DiceCategory, DiceGameDef } from '../dice/types';
import { ANIMALS } from '../dice/animals';
import { playerColor } from '../components/game/colors';

/**
 * Hvor mange dyr som må til på de seks dyrerutene for å få bonus.
 * 12 dyr eller mer gir 10 poeng i bonus.
 */
export const DYRE_BONUS_LIMIT = 12;
export const DYRE_BONUS = 10;

const kinds = (d: number[]) => counts(d).slice(1);
const fixed = (
  name: string,
  hint: string,
  points: number,
  ok: (c: number[]) => boolean,
  keep: KeepFn,
  yatzy = false
): DiceCategory => ({
  name,
  hint: `${hint} Gir ${points} poeng.`,
  values: [0, points],
  yatzy,
  score: (d) => (d.every((x) => x >= 1) && ok(kinds(d)) ? points : 0),
  keep,
});

/** Dyreyatzy med fem dyreterninger, etter arket. */
export const DYRE_CATEGORIES: DiceCategory[] = [
  ...ANIMALS.map(
    (a, i): DiceCategory => ({
      name: a.name,
      hint: `Antall ${a.name.toLowerCase()}er: 1 poeng per dyr.`,
      values: [0, 1, 2, 3, 4, 5],
      upper: true,
      face: i + 1,
      score: (d) => counts(d)[i + 1],
      keep: keepFace(i + 1),
    })
  ),
  fixed('2 like', 'To like dyr.', 2, (c) => c.some((n) => n >= 2), keepOfKind(2)),
  fixed('2×2 like', 'To par med ulike dyr.', 4, (c) => c.filter((n) => n >= 2).length >= 2, keepTwoPairs),
  fixed('3 like', 'Tre like dyr.', 3, (c) => c.some((n) => n >= 3), keepOfKind(3)),
  fixed('4 like', 'Fire like dyr.', 4, (c) => c.some((n) => n >= 4), keepOfKind(4)),
  fixed('4 ulike', 'Fire forskjellige dyr.', 4, (c) => c.filter((n) => n >= 1).length >= 4, keepDistinct),
  fixed('5 ulike', 'Fem forskjellige dyr.', 5, (c) => c.filter((n) => n >= 1).length === 5, keepDistinct),
  fixed('Hus', 'Tre like og to like.', 5, (c) => c.includes(3) && c.includes(2), keepHouse),
  fixed('Yatzy', 'Fem like dyr.', 10, (c) => c.includes(5), keepOfKind(5), true),
];

export const DYREYATZY: DiceGameDef = {
  id: 'dyreyatzy',
  title: 'Dyreyatzy',
  tagline: 'Fem dyreterninger, tre kast. Høyest poengsum vinner.',
  kind: 'dyr',
  color: playerColor(2),
  categories: DYRE_CATEGORIES,
  upperCount: ANIMALS.length,
  bonusLimit: DYRE_BONUS_LIMIT,
  bonus: DYRE_BONUS,
  minPlayers: 1,
  maxPlayers: 8,
};
