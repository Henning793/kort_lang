import type { Player, Scores } from '../game/types';
import { FEMKAMP_ROUNDS, FEMKAMP_NUM_ROUNDS } from './rules';

export type Kabal = { pass: number[]; left: number[]; phase: 'live' | 'count' };

/** Det som trengs for å regne poeng. Tellingene er indeksert etter spillerrekkefølge. */
export type FemkampTally = {
  counts: number[][];
  kabal: Kabal;
  saved: boolean[];
};

/** Poeng for én spiller i én runde, ut fra det som er talt (lagret eller ikke). */
export function roundPoints(t: FemkampTally, round: number, i: number): number {
  const def = FEMKAMP_ROUNDS[round];
  if (def.kind === 'kabal') return (t.kabal.pass[i] ?? 0) + (t.kabal.left[i] ?? 0);
  return (t.counts[round]?.[i] ?? 0) * (def.mult ?? 1);
}

/** Lagrede poeng per spiller og runde, null for runder som ikke er lagret. */
export function femkampScores(players: Player[], t: FemkampTally): Scores {
  const scores: Scores = {};
  players.forEach((p, i) => {
    scores[p.id] = Array.from({ length: FEMKAMP_NUM_ROUNDS }, (_, r) =>
      t.saved[r] ? roundPoints(t, r, i) : null
    );
  });
  return scores;
}

export type CountCheck =
  | { state: 'ok'; text: string }
  | { state: 'over'; text: string }
  | { state: 'partial'; text: string };

/** Sjekker summen av det som er talt mot hvor mange det kan være. */
export function checkCount(round: number, counts: number[], tricksPerRound: number): CountCheck {
  const def = FEMKAMP_ROUNDS[round];
  const sum = counts.reduce((a, b) => a + b, 0);
  const max = def.tricks ? tricksPerRound : def.inDeck ?? 0;
  const unit = def.unit ?? '';
  if (sum > max) {
    return {
      state: 'over',
      text: def.tricks
        ? `Det blir bare ${max} stikk per runde. Nå er ${sum} registrert.`
        : `Det er bare ${max} ${unit} i stokken. Nå er ${sum} registrert.`,
    };
  }
  if (sum === max) {
    return { state: 'ok', text: def.tricks ? `Alle ${max} stikk er fordelt` : `Alle ${max} ${unit} er fordelt` };
  }
  return { state: 'partial', text: `${sum} av ${max} ${unit} registrert` };
}

/** Kabalen kan lagres når nøyaktig én spiller er ferdig (0 kort igjen). */
export function kabalFinishers(left: number[]): number[] {
  return left.flatMap((n, i) => (n === 0 ? [i] : []));
}

/** Minuspoeng vises med ekte minustegn. */
export function fmtPoints(p: number): string {
  return p < 0 ? `−${-p}` : String(p);
}
