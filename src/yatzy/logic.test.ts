import { YATZY_CATEGORIES } from './rules';
import { emptySheet, upperSum, bonus, total, canEdit, nextForced, turnIndex, yatzyStandings, isValid, parDiff } from './logic';

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error('Feilet: ' + msg);
}

check(YATZY_CATEGORIES.length === 15, '15 ruter');
check(YATZY_CATEGORIES[2].values.join() === '0,3,6,9,12,15', 'treere');
check(YATZY_CATEGORIES[7].values.join() === '0,6,8,10,12,14,16,18,20,22', 'to par');
check(isValid(12, 28) && !isValid(12, 30) && isValid(12, 7), 'hus: 6-6-6-5-5=28, 1-1-1-2-2=7, ikke 30');
check(isValid(13, 5) && isValid(13, 30) && !isValid(13, 4), 'sjanse 5–30');

const s = emptySheet();
[3, 6, 9, 12, 15, 18].forEach((v, i) => (s[i] = v));
check(upperSum(s) === 63 && bonus(s) === 50, '63 gir bonus');
s[14] = 50;
check(total(s) === 63 + 50 + 50, 'total med bonus og yatzy');
const t = emptySheet();
t[0] = 2;
check(bonus(t) === 0, 'ingen bonus under 63');

check(nextForced(t) === 1, 'neste tvungne rute');
check(canEdit(t, 1, 'tvungen') && !canEdit(t, 5, 'tvungen'), 'tvungen: bare neste');
check(canEdit(t, 0, 'tvungen'), 'utfylt rute kan rettes');
check(canEdit(t, 9, 'fri'), 'fri: alle tomme');

const players = [
  { id: 'a', name: 'A' },
  { id: 'b', name: 'B' },
];
check(turnIndex({ a: t, b: emptySheet() }, players) === 1, 'B står for tur');
check(turnIndex({ a: emptySheet(), b: emptySheet() }, players) === 0, 'A starter');

const st = yatzyStandings(players, { a: s, b: t });
check(st[0].id === 'a' && st[0].rank === 1 && st[1].rank === 2, 'høyest vinner');
const tie = yatzyStandings(players, { a: t, b: t });
check(tie[0].rank === 1 && tie[1].rank === 1, 'delt plass');

console.log('Alle Yatzy-tester bestått.');

const par = emptySheet();
par[0] = 4; // 4 enere: +1
par[5] = 12; // 2 seksere: −6
check(parDiff(par) === -5, 'skjema: +1 og −6');
console.log('Skjema-test bestått.');
