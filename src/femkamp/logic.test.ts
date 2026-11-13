import { roundPoints, femkampScores, checkCount, kabalFinishers, fmtPoints, type FemkampTally } from './logic';
import { cardsPerPlayer, cardsRemoved } from './rules';
import { computeStandings, winnersOf } from '../game/logic';
import type { Player } from '../game/types';

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error('Feilet: ' + msg);
}

check(cardsRemoved(3) === 1 && cardsPerPlayer(3) === 17, '3 spillere: ta ut 1 kort, 17 stikk');
check(cardsRemoved(4) === 0 && cardsPerPlayer(4) === 13, '4 spillere: ingen ut, 13 stikk');
check(cardsRemoved(5) === 2 && cardsPerPlayer(5) === 10, '5 spillere: ta ut 2 kort');

const t: FemkampTally = {
  counts: [
    [5, 8, 4],
    [3, 7, 3],
    [1, 2, 1],
    [0, 0, 0],
    [6, 4, 7],
  ],
  kabal: { pass: [2, 4, 1], left: [3, 0, 5], phase: 'count' },
  saved: [true, true, true, true, true],
};

check(roundPoints(t, 0, 1) === 8, 'runde 1: 1 p per stikk');
check(roundPoints(t, 1, 1) === 7, 'runde 2: 1 p per kløver');
check(roundPoints(t, 2, 1) === 8, 'runde 3: 4 p per dame');
check(roundPoints(t, 3, 0) === 5, 'runde 4: pass + kort igjen');
check(roundPoints(t, 3, 1) === 4, 'runde 4: den som ble ferdig får bare pass');
check(roundPoints(t, 4, 2) === -7, 'runde 5: −1 per stikk');

const players: Player[] = [
  { id: 'a', name: 'Mamma' },
  { id: 'b', name: 'Pappa' },
  { id: 'c', name: 'Emma' },
];
const scores = femkampScores(players, t);
// Mamma 5+3+4+5−6=11, Pappa 8+7+8+4−4=23, Emma 4+3+4+6−7=10
const st = computeStandings(players, scores, 0);
check(st[0].name === 'Emma' && st[0].total === 10, 'Emma leder med 10');
check(winnersOf(st).length === 1, 'én vinner');

const partly = femkampScores(players, { ...t, saved: [true, false, false, false, false] });
check(partly.a[0] === 5 && partly.a[1] === null, 'ulagrede runder er null');

check(checkCount(1, [3, 7, 3], 17).state === 'ok', '13 kløver er ok');
check(checkCount(1, [3, 7, 4], 17).state === 'over', '14 kløver er for mange');
check(checkCount(2, [1, 1, 1], 17).state === 'partial', '3 av 4 damer');
check(checkCount(0, [5, 8, 4], 17).state === 'ok', '17 stikk med 3 spillere');
check(checkCount(4, [5, 8, 5], 17).state === 'over', '18 stikk er for mange');

check(kabalFinishers([3, 0, 5]).join() === '1', 'én ferdig');
check(kabalFinishers([0, 0, 0]).length === 3, 'alle 0 er ikke gyldig');
check(fmtPoints(-3) === '−3' && fmtPoints(4) === '4', 'formatering');

console.log('Alle Femkamp-tester bestått.');
