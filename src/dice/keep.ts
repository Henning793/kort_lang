import { counts } from './logic';

/** Hvilke terninger som passer til en rute, så de kan legges blant de man beholder. */
export type KeepFn = (dice: number[]) => boolean[];

/** Merker inntil `want[f]` terninger med side f. */
function pick(dice: number[], want: Record<number, number>): boolean[] {
  const left = { ...want };
  return dice.map((d) => {
    if ((left[d] ?? 0) > 0) {
      left[d]--;
      return true;
    }
    return false;
  });
}

/** Alle terninger med denne siden (enere, kuer …). */
export const keepFace =
  (face: number): KeepFn =>
  (dice) =>
    dice.map((d) => d === face);

/** Flest like (høyeste side ved likt), inntil n stykker. Ingenting hvis ingen er like. */
export const keepOfKind =
  (n: number): KeepFn =>
  (dice) => {
    const c = counts(dice);
    let best = 0;
    for (let f = 6; f >= 1; f--) if (c[f] > (c[best] ?? 0)) best = f;
    return best && c[best] >= 2 ? pick(dice, { [best]: n }) : dice.map(() => false);
  };

/** De to høyeste parene (eller ett par hvis det bare er ett). */
export const keepTwoPairs: KeepFn = (dice) => {
  const c = counts(dice);
  const pairs = [6, 5, 4, 3, 2, 1].filter((f) => c[f] >= 2).slice(0, 2);
  return pick(dice, Object.fromEntries(pairs.map((f) => [f, 2])));
};

/** Tre av det vanligste og to av det nest vanligste. */
export const keepHouse: KeepFn = (dice) => {
  const c = counts(dice);
  const order = [6, 5, 4, 3, 2, 1].filter((f) => c[f] >= 2).sort((a, b) => c[b] - c[a]);
  const want: Record<number, number> = {};
  if (order[0]) want[order[0]] = 3;
  if (order[1]) want[order[1]] = 2;
  return pick(dice, want);
};

/** Én av hver av sidene som trengs (straight). */
export const keepRun =
  (faces: number[]): KeepFn =>
  (dice) =>
    pick(dice, Object.fromEntries(faces.map((f) => [f, 1])));

/** Én av hver forskjellige side (ulike dyr). */
export const keepDistinct: KeepFn = (dice) => pick(dice, Object.fromEntries([1, 2, 3, 4, 5, 6].map((f) => [f, 1])));

/** Høye terninger (sjanse). */
export const keepHigh: KeepFn = (dice) => dice.map((d) => d >= 4);
