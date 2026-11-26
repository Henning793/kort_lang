import type { Player } from '../game/types';
import type { DiceGameDef, SheetMode } from './types';

export type Sheet = (number | null)[];
export type Sheets = Record<string, Sheet>;

export function emptySheet(def: DiceGameDef): Sheet {
  return Array(def.categories.length).fill(null);
}

export function upperSum(def: DiceGameDef, sheet: Sheet): number {
  return sheet.slice(0, def.upperCount).reduce<number>((a, v) => a + (v ?? 0), 0);
}

export function bonus(def: DiceGameDef, sheet: Sheet): number {
  return upperSum(def, sheet) >= def.bonusLimit ? def.bonus : 0;
}

export function total(def: DiceGameDef, sheet: Sheet): number {
  return sheet.reduce<number>((a, v) => a + (v ?? 0), 0) + bonus(def, sheet);
}

export function filledCount(sheet: Sheet): number {
  return sheet.filter((v) => v != null).length;
}

export function isComplete(def: DiceGameDef, sheets: Sheets, players: Player[]): boolean {
  return players.every((p) => filledCount(sheets[p.id] ?? emptySheet(def)) === def.categories.length);
}

/** Neste rute i tvungen spillmåte, eller -1 når arket er fullt. */
export function nextForced(sheet: Sheet): number {
  return sheet.findIndex((v) => v == null);
}

/** Om ruten kan fylles inn eller rettes. Utfylte ruter kan alltid rettes. */
export function canEdit(sheet: Sheet, cat: number, mode: SheetMode): boolean {
  if (sheet[cat] != null) return true;
  return mode === 'fri' || nextForced(sheet) === cat;
}

/** Den som har fylt ut færrest ruter står for tur (første i rekkefølgen ved likt). */
export function turnIndex(sheets: Sheets, players: Player[]): number {
  const n = (id: string) => (sheets[id] ? filledCount(sheets[id]) : 0);
  let best = 0;
  players.forEach((p, i) => {
    if (n(p.id) < n(players[best].id)) best = i;
  });
  return best;
}

export type Standing = { id: string; name: string; total: number; rank: number };

/** Høyest poengsum vinner. Likt antall poeng deler plass. */
export function standings(def: DiceGameDef, players: Player[], sheets: Sheets): Standing[] {
  const rows = players
    .map((p) => ({ id: p.id, name: p.name, total: total(def, sheets[p.id] ?? emptySheet(def)), rank: 0 }))
    .sort((a, b) => b.total - a.total);
  rows.forEach((r, i) => {
    r.rank = i > 0 && r.total === rows[i - 1].total ? rows[i - 1].rank : i + 1;
  });
  return rows;
}

export function isValid(def: DiceGameDef, cat: number, value: number): boolean {
  return def.categories[cat].values.includes(value);
}

/** Hvor mye spilleren ligger foran (+) eller bak (−) skjema på de utfylte øvre rutene. */
export function parDiff(def: DiceGameDef, sheet: Sheet): number {
  const par = def.par;
  if (!par) return 0;
  return sheet.slice(0, def.upperCount).reduce<number>((a, v, i) => (v == null ? a : a + v - par(i)), 0);
}

/** Antall av hver side: counts[1] er antall enere (eller første dyr), osv. */
export function counts(dice: number[]): number[] {
  const c = Array(7).fill(0);
  dice.forEach((d) => {
    if (d >= 1 && d <= 6) c[d]++;
  });
  return c;
}

export function rollDie(rand: () => number = Math.random): number {
  return 1 + Math.floor(rand() * 6);
}
