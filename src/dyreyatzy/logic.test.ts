import { DYRE_CATEGORIES, DYREYATZY, DYRE_BONUS_LIMIT } from './rules';
import { YATZY_CATEGORIES } from '../yatzy/rules';
import { emptySheet, bonus, total } from '../dice/logic';
import { activeRoll, canRoll, freshRoll } from '../dice/roll';

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error('Feilet: ' + msg);
}

const byName = (name: string) => DYRE_CATEGORIES.find((c) => c.name === name)!;
const score = (name: string, dice: number[]) => byName(name).score(dice);

// 1 = ku, 2 = hest, 3 = sau, 4 = hane, 5 = gris, 6 = and
check(DYRE_CATEGORIES.length === 14, '6 dyr + 8 kombinasjoner');
check(DYRE_CATEGORIES[0].score([1, 1, 3, 1, 6]) === 3, 'tre kuer gir 3');
check(DYRE_CATEGORIES[5].score([6, 6, 6, 6, 6]) === 5, 'fem ender gir 5');
check(score('2 like', [1, 1, 2, 3, 4]) === 2, '2 like');
check(score('2 like', [1, 2, 3, 4, 5]) === 0, 'ingen like');
check(score('2×2 like', [6, 6, 2, 2, 3]) === 4, '2x2 like');
check(score('2×2 like', [6, 6, 6, 6, 3]) === 0, 'fire like er ikke 2x2');
check(score('3 like', [3, 3, 3, 1, 2]) === 3, '3 like');
check(score('4 like', [4, 4, 4, 4, 2]) === 4, '4 like');
check(score('4 like', [4, 4, 4, 1, 2]) === 0, 'bare tre like');
check(score('4 ulike', [1, 5, 6, 2, 2]) === 4, '4 ulike');
check(score('4 ulike', [1, 5, 5, 2, 2]) === 0, 'bare tre ulike');
check(score('5 ulike', [4, 1, 5, 6, 2]) === 5, '5 ulike');
check(score('Hus', [2, 2, 2, 5, 5]) === 5, 'hus');
check(score('Hus', [2, 2, 2, 2, 2]) === 0, 'yatzy er ikke hus');
check(score('Yatzy', [6, 6, 6, 6, 6]) === 10, 'yatzy');
check(score('2 like', [0, 0, 0, 0, 0]) === 0, 'ikke kastet gir 0');

const s = emptySheet(DYREYATZY);
[3, 3, 3, 3, 3, 0].forEach((v, i) => (s[i] = v));
check(bonus(DYREYATZY, s) === 10, `${DYRE_BONUS_LIMIT} dyr gir bonus`);
s[13] = 10;
check(total(DYREYATZY, s) === 15 + 10 + 10, 'total med bonus og yatzy');
[1, 1, 1, 1, 1, 0].forEach((v, i) => (s[i] = v));
check(bonus(DYREYATZY, s) === 0, 'ingen bonus under grensen');

// Vanlig Yatzy regnet ut fra terningene
const yz = (name: string, dice: number[]) => YATZY_CATEGORIES.find((c) => c.name === name)!.score(dice);
check(yz('Treere', [3, 3, 1, 3, 6]) === 9, 'treere');
check(yz('Ett par', [2, 2, 5, 5, 1]) === 10, 'høyeste par');
check(yz('To par', [2, 2, 5, 5, 1]) === 14, 'to par');
check(yz('To par', [5, 5, 5, 5, 1]) === 0, 'fire like er ikke to par');
check(yz('Tre like', [4, 4, 4, 1, 2]) === 12, 'tre like');
check(yz('Fire like', [6, 6, 6, 6, 6]) === 24, 'fire like av yatzy');
check(yz('Liten straight', [5, 3, 1, 2, 4]) === 15, 'liten straight');
check(yz('Stor straight', [6, 3, 5, 2, 4]) === 20, 'stor straight');
check(yz('Hus', [6, 6, 6, 5, 5]) === 28, 'hus');
check(yz('Sjanse', [6, 6, 6, 5, 5]) === 28, 'sjanse');
check(yz('Yatzy', [1, 1, 1, 1, 1]) === 50, 'yatzy');
YATZY_CATEGORIES.forEach((c) =>
  [[1, 1, 1, 1, 1], [6, 6, 6, 5, 5], [1, 2, 3, 4, 5], [2, 3, 4, 5, 6], [3, 3, 4, 4, 1]].forEach((d) =>
    check(c.values.includes(c.score(d)), `${c.name} gir lovlig verdi for ${d}`)
  )
);

// Kast
const r = freshRoll('a:0');
check(canRoll(r), 'kan kaste først');
check(!canRoll({ ...r, used: 3 }), 'maks tre kast');
check(!canRoll({ ...r, used: 1, held: [true, true, true, true, true] }), 'alle tatt bort');
check(activeRoll({ ...r, used: 2 }, 'b:0').used === 0, 'nytt kast for ny tur');

// Tvungen: terninger som passer runden beholdes automatisk
const keep = (cats: typeof DYRE_CATEGORIES, name: string, d: number[]) =>
  cats.find((c) => c.name === name)!.keep(d).map((k) => (k ? 1 : 0)).join('');
check(keep(DYRE_CATEGORIES, 'Ku', [1, 3, 1, 6, 2]) === '10100', 'beholder kuer');
check(keep(DYRE_CATEGORIES, '3 like', [4, 2, 4, 6, 2]) === '10100', 'beholder høyeste par mot 3 like');
check(keep(DYRE_CATEGORIES, '2×2 like', [4, 2, 4, 6, 2]) === '11101', 'beholder begge par');
check(keep(DYRE_CATEGORIES, '5 ulike', [4, 2, 4, 6, 2]) === '11010', 'én av hver');
check(keep(DYRE_CATEGORIES, 'Hus', [5, 5, 5, 1, 1]) === '11111', 'hus beholdes helt');
check(keep(DYRE_CATEGORIES, 'Yatzy', [1, 2, 3, 4, 5]) === '00000', 'ingen like');
check(keep(YATZY_CATEGORIES, 'Seksere', [6, 6, 1, 6, 2]) === '11010', 'beholder seksere');
check(keep(YATZY_CATEGORIES, 'Liten straight', [1, 2, 2, 5, 6]) === '11010', 'straight-terninger');
check(keep(YATZY_CATEGORIES, 'Sjanse', [1, 4, 6, 3, 5]) === '01101', 'høye til sjanse');

console.log('Alle Dyreyatzy-tester bestått.');
