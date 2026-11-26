import type { Player } from '../game/types';
import * as g from '../dice/logic';
import { YATZY } from './rules';

export type { Sheet, Sheets } from '../dice/logic';
export type YatzyStanding = g.Standing;
export { filledCount, nextForced, canEdit, turnIndex } from '../dice/logic';

export const emptySheet = () => g.emptySheet(YATZY);
export const upperSum = (s: g.Sheet) => g.upperSum(YATZY, s);
export const bonus = (s: g.Sheet) => g.bonus(YATZY, s);
export const total = (s: g.Sheet) => g.total(YATZY, s);
export const isComplete = (sheets: g.Sheets, players: Player[]) => g.isComplete(YATZY, sheets, players);
export const yatzyStandings = (players: Player[], sheets: g.Sheets) => g.standings(YATZY, players, sheets);
export const isValid = (cat: number, value: number) => g.isValid(YATZY, cat, value);
/** Hvor mye spilleren ligger foran (+) eller bak (−) tre av hver på de utfylte øverste rutene. */
export const parDiff = (s: g.Sheet) => g.parDiff(YATZY, s);

export { playerColor } from '../components/game/colors';
