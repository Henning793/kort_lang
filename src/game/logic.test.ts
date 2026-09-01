import { dealerIndex, computeStandings, winnersOf, totalFor } from './logic';
import type { Player, Scores } from './types';

console.assert(dealerIndex(0, 3) === 0, 'dealer round0');
console.assert(dealerIndex(2, 3) === 2, 'dealer round2');
console.assert(dealerIndex(3, 3) === 0, 'dealer wraps');

console.assert(totalFor([1, null, 3]) === 4, 'total skips null');
console.assert(totalFor(undefined) === 0, 'total undefined is 0');

const players: Player[] = [
  { id: 'a', name: 'A' },
  { id: 'b', name: 'B' },
  { id: 'c', name: 'C' },
];
const scores: Scores = {
  a: [5, null, null, null, null, null, null],
  b: [5, null, null, null, null, null, null],
  c: [9, null, null, null, null, null, null],
};
const standings = computeStandings(players, scores, 0);
console.assert(standings.find((s) => s.id === 'a')!.rank === 1, 'a rank 1');
console.assert(standings.find((s) => s.id === 'b')!.rank === 1, 'b rank 1');
console.assert(standings.find((s) => s.id === 'c')!.rank === 3, 'c rank 3 (dense skip)');

const winners = winnersOf(standings);
console.assert(winners.length === 2, 'two winners on tie');

console.log('All logic smoke assertions passed.');
