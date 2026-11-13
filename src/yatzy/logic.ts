import type { Player } from '../game/types';
import { YATZY_CATEGORIES, YATZY_NUM, UPPER_COUNT, BONUS, BONUS_LIMIT, type YatzyMode } from './rules';

export type Sheet = (number | null)[];
export type Sheets = Record<string, Sheet>;

export function emptySheet(): Sheet {
  return Array(YATZY_NUM).fill(null);
}

export function upperSum(sheet: Sheet): number {
  return sheet.slice(0, UPPER_COUNT).reduce<number>((a, v) => a + (v ?? 0), 0);
}

export function bonus(sheet: Sheet): number {
  return upperSum(sheet) >= BONUS_LIMIT ? BONUS : 0;
}

export function total(sheet: Sheet): number {
  return sheet.reduce<number>((a, v) => a + (v ?? 0), 0) + bonus(sheet);
}

export function filledCount(sheet: Sheet): number {
  return sheet.filter((v) => v != null).length;
}

export function isComplete(sheets: Sheets, players: Player[]): boolean {
  return players.every((p) => filledCount(sheets[p.id] ?? emptySheet()) === YATZY_NUM);
}

/** Neste rute i tvungen spillmåte, eller -1 når arket er fullt. */
export function nextForced(sheet: Sheet): number {
  return sheet.findIndex((v) => v == null);
}

/** Om ruten kan fylles inn eller rettes. Utfylte ruter kan alltid rettes. */
export function canEdit(sheet: Sheet, cat: number, mode: YatzyMode): boolean {
  if (sheet[cat] != null) return true;
  return mode === 'fri' || nextForced(sheet) === cat;
}

/** Den som har fylt ut færrest ruter står for tur (første i rekkefølgen ved likt). */
export function turnIndex(sheets: Sheets, players: Player[]): number {
  let best = 0;
  players.forEach((p, i) => {
    if (filledCount(sheets[p.id] ?? emptySheet()) < filledCount(sheets[players[best].id] ?? emptySheet())) best = i;
  });
  return best;
}

export type YatzyStanding = { id: string; name: string; total: number; rank: number };

/** Høyest poengsum vinner. Likt antall poeng deler plass. */
export function yatzyStandings(players: Player[], sheets: Sheets): YatzyStanding[] {
  const rows = players
    .map((p) => ({ id: p.id, name: p.name, total: total(sheets[p.id] ?? emptySheet()), rank: 0 }))
    .sort((a, b) => b.total - a.total);
  rows.forEach((r, i) => {
    r.rank = i > 0 && r.total === rows[i - 1].total ? rows[i - 1].rank : i + 1;
  });
  return rows;
}

export function isValid(cat: number, value: number): boolean {
  return YATZY_CATEGORIES[cat].values.includes(value);
}

/** Hvor mye spilleren ligger foran (+) eller bak (−) tre av hver på de utfylte øverste rutene. */
export function parDiff(sheet: Sheet): number {
  return sheet
    .slice(0, UPPER_COUNT)
    .reduce<number>((a, v, i) => (v == null ? a : a + v - 3 * (i + 1)), 0);
}

export { playerColor } from '../components/game/colors';
