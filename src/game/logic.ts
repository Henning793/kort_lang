import type { Player, Scores, StandingRow } from './types';
import { NUM_ROUNDS } from './rounds';

export function dealerIndex(round: number, numPlayers: number): number {
  if (numPlayers <= 0) return 0;
  return round % numPlayers;
}

export function totalFor(playerScores: (number | null)[] | undefined): number {
  if (!playerScores) return 0;
  return playerScores.reduce((sum: number, v) => sum + (v || 0), 0);
}

export function emptyScoreRow(): (number | null)[] {
  return Array(NUM_ROUNDS).fill(null);
}

export function computeStandings(players: Player[], scores: Scores, round: number): StandingRow[] {
  const dIdx = dealerIndex(round, players.length);
  const totals = players.map((p, i) => ({
    id: p.id,
    name: p.name,
    isDealer: i === dIdx,
    total: totalFor(scores[p.id]),
  }));
  const sorted = [...totals].sort((a, b) => a.total - b.total);
  let rank = 0;
  let lastTotal: number | null = null;
  const result: StandingRow[] = sorted.map((r, i) => {
    if (lastTotal === null || r.total !== lastTotal) {
      rank = i + 1;
      lastTotal = r.total;
    }
    return { ...r, rank, rankLabel: rank + '.' };
  });
  return result;
}

export function winnersOf(standings: StandingRow[]): StandingRow[] {
  return standings.filter((s) => s.rank === 1);
}
