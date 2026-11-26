import { Fragment, useEffect, useState } from 'react';
import { Crown, Dices, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { BackButton } from '../components/BackButton';
import { ConfettiBomb } from '../components/ConfettiBomb';
import { playerColor } from '../components/game/colors';
import { useDiceGame } from './context';
import { DiceFace } from './DiceFace';
import { DiceBottomBar, DiceCenter, DiceTopRow, useDiceTurn } from './DiceTray';
import { activeRoll, canRoll } from './roll';
import {
  upperSum,
  bonus,
  total,
  canEdit,
  turnIndex,
  isComplete,
  emptySheet,
  filledCount,
  nextForced,
  parDiff,
  type Sheet,
} from './logic';
import type { DiceGameDef } from './types';

type Target = { playerId: string; cat: number };
type Toast = { id: number; text: string; sub?: string; color: string; big?: boolean };

export function DicePlay() {
  const { def, useStore } = useDiceGame();
  const s = useStore();
  const [target, setTarget] = useState<Target | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [boom, setBoom] = useState(0);
  const [popped, setPopped] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const cats = def.categories;
  const num = cats.length;
  const turn = turnIndex(s.sheets, s.players);
  const done = isComplete(def, s.sheets, s.players);
  const sheetOf = (id: string): Sheet => s.sheets[id] ?? emptySheet(def);
  const turnPlayer = s.players[turn];
  const turnColor = playerColor(turn);
  const totals = s.players.map((p) => total(def, sheetOf(p.id)));
  const best = Math.max(...totals);
  const filled = filledCount(sheetOf(turnPlayer.id));
  const turnNo = Math.min(filled + 1, num);

  const inApp = s.diceMode === 'app' && !done;
  const rollKey = `${turnPlayer.id}:${filled}`;
  const roll = activeRoll(s.roll, rollKey);
  const rolled = inApp && roll.used > 0;
  // Tvungen: bare én rute er mulig, så appen beholder terningene som passer og fører poengene selv.
  const forcedCat = inApp && s.mode === 'tvungen' ? nextForced(sheetOf(turnPlayer.id)) : -1;
  const forced = forcedCat >= 0 ? cats[forcedCat] : null;
  const autoScore = forced != null && roll.used > 0 && !canRoll(roll);

  function scoreForced() {
    if (!forced) return;
    score({ playerId: turnPlayer.id, cat: forcedCat }, forced.score(roll.dice));
    s.clearRoll();
  }

  useEffect(() => {
    if (!autoScore) return;
    const t = window.setTimeout(scoreForced, 2200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoScore, rollKey]);

  const dice = useDiceTurn({
    enabled: inApp,
    roll,
    color: turnColor,
    name: turnPlayer.name,
    onRoll: () => s.rollDice(rollKey, forced?.keep),
    onToggle: (i) => s.toggleHold(rollKey, i),
    forced: forced
      ? { name: forced.name, points: forced.score(roll.dice), auto: autoScore, onScore: scoreForced }
      : undefined,
  });

  function score(t: Target, value: number | null) {
    const idx = s.players.findIndex((p) => p.id === t.playerId);
    const before = sheetOf(t.playerId);
    const after = before.map((v, i) => (i === t.cat ? value : v));
    s.setScore(t.playerId, t.cat, value);
    setPopped(`${t.playerId}:${t.cat}:${Date.now()}`);
    if (value == null) return;
    const name = s.players[idx].name;
    const color = playerColor(idx);
    const cat = cats[t.cat];
    if (cat.yatzy && value > 0) {
      setBoom((b) => b + 1);
      setToast({ id: Date.now(), text: 'YATZY!', sub: `${name} fikk fem like`, color, big: true });
    } else if (bonus(def, after) > 0 && bonus(def, before) === 0) {
      setBoom((b) => b + 1);
      setToast({ id: Date.now(), text: `Bonus! +${def.bonus}`, sub: `${name} nådde ${def.bonusLimit}`, color, big: true });
    } else if (value === 0) {
      setToast({ id: Date.now(), text: 'Strøket', sub: `${name} · ${cat.name}`, color: '#82796a' });
    } else if (value === Math.max(...cat.values)) {
      setToast({ id: Date.now(), text: `Maks! +${value}`, sub: `${name} · ${cat.name}`, color });
    } else {
      setToast({ id: Date.now(), text: `+${value}`, sub: `${name} · ${cat.name}`, color });
    }
  }

  function onCell(playerId: string, cat: number, suggestion: number | null) {
    if (suggestion != null) {
      score({ playerId, cat }, suggestion);
      s.clearRoll();
      return;
    }
    setTarget({ playerId, cat });
  }

  const compact = inApp;
  const label = `sticky left-0 z-[1] bg-bg pl-1 pr-2 ${compact ? 'py-0' : 'py-1'} text-left text-[13px] whitespace-nowrap`;

  return (
    <div className="flex flex-col flex-1">
      {boom > 0 && <ConfettiBomb key={boom} />}

      <div className={`flex items-center gap-2 px-5 ${compact ? 'pt-2.5 pb-1' : 'pt-4 pb-2'}`}>
        <BackButton />
        <div className="flex items-center gap-2 font-heading text-[17px] mr-auto">
          <Dices size={18} strokeWidth={2.5} color="#c67139" />
          {def.title}
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-pill bg-accent2-100 text-accent2-800">
          {s.mode === 'fri' ? 'Fri' : 'Tvungen'}
        </span>
        <Button variant="ghost" onClick={() => setConfirmOpen(true)}>
          Nytt spill
        </Button>
      </div>

      {/* Hvem sin tur. Med terninger i appen står dette i terningkoppen nederst. */}
      {!inApp && (
        <div className="px-5 pb-3">
          {done ? (
            <div className="rounded-card px-4 py-3.5 bg-ink text-bg flex items-center gap-3">
              <Crown size={26} strokeWidth={2.5} color="#f6a06b" />
              <div className="flex-1">
                <div className="font-heading text-lg">Alle ruter er fylt ut!</div>
                <div className="text-[13px] opacity-75">Trykk på knappen nederst for å se hvem som vant.</div>
              </div>
            </div>
          ) : (
            <div
              key={turnPlayer.id + turnNo}
              className="rounded-card px-4 py-3 flex items-center gap-3 text-bg"
              style={{ background: turnColor }}
            >
              <div className="flex gap-1">
                {(def.kind === 'dyr' ? [1, 6, 5] : [5, 2, 6]).map((f, i) => (
                  <DiceFace
                    key={i}
                    kind={def.kind}
                    face={f}
                    size={26}
                    className="yz-roll"
                    style={{ ['--r' as string]: `${(i - 1) * 12}deg`, animationDelay: `${i * 70}ms` }}
                  />
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-heading text-lg leading-tight truncate">{turnPlayer.name} sin tur</div>
                <div className="text-[12px] opacity-85">
                  Tur {turnNo} av {num} · tre kast
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {inApp && <DiceTopRow t={dice} />}

      <div className="px-3 overflow-x-auto">
        <table className="w-full border-collapse tabular-nums">
          <thead>
            <tr>
              <th className={`${label} font-normal`} />
              {s.players.map((p, i) => {
                const lead = best > 0 && totals[i] === best;
                const isTurn = i === turn && !done;
                return (
                  <th key={p.id} className={`px-[3px] ${compact ? 'pt-2.5' : 'pt-3'} pb-1 align-bottom`}>
                    <div className="relative flex flex-col items-center gap-0.5">
                      {lead && (
                        <Crown
                          size={15}
                          strokeWidth={2.5}
                          color="#d9a521"
                          fill="#f3d27a"
                          className="absolute -top-3.5"
                          aria-label="Leder"
                        />
                      )}
                      <span
                        className={`${compact ? 'w-7 h-7 text-[12px]' : 'w-8 h-8 text-[13px]'} rounded-full grid place-items-center font-heading text-bg ${
                          isTurn ? 'yz-glow ring-2 ring-offset-2 ring-offset-bg' : ''
                        }`}
                        style={{ background: playerColor(i), ['--glow' as string]: playerColor(i), ['--tw-ring-color' as string]: playerColor(i) }}
                      >
                        {p.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="max-w-[64px] truncate text-[11px] font-semibold">{p.name}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {cats.map((c, cat) => (
              <Fragment key={c.name}>
                {cat === def.upperCount && (
                  <UpperSummary def={def} players={s.players} sheetOf={sheetOf} label={label} showPar={!compact} />
                )}
                <tr>
                  <td className={label}>
                    <span className="flex items-center gap-1.5">
                      {c.face ? <DiceFace kind={def.kind} face={c.face} size={def.kind === 'dyr' ? 20 : 16} /> : null}
                      <span className="flex flex-col leading-tight">{c.name}</span>
                    </span>
                  </td>
                  {s.players.map((p, i) => {
                    const sheet = sheetOf(p.id);
                    const v = sheet[cat];
                    const editable = canEdit(sheet, cat, s.mode);
                    const color = playerColor(i);
                    const isTurn = i === turn && !done;
                    const suggestion = rolled && !dice.busy && isTurn && v == null && editable ? c.score(roll.dice) : null;
                    const justPopped = popped?.startsWith(`${p.id}:${cat}:`);
                    const maxed = v != null && v > 0 && v === Math.max(...c.values);
                    return (
                      <td
                        key={p.id}
                        className={compact ? 'px-[3px] py-[1.5px]' : 'p-[3px]'}
                        style={isTurn ? { background: `color-mix(in srgb, ${color} 9%, transparent)` } : undefined}
                      >
                        <button
                          onClick={() => onCell(p.id, cat, suggestion)}
                          disabled={!editable}
                          aria-label={
                            suggestion != null ? `${p.name}, ${c.name}: før ${suggestion} poeng` : `${p.name}, ${c.name}`
                          }
                          className={`relative w-full min-w-[40px] ${compact ? 'h-[28px]' : 'h-[34px]'} rounded-[10px] text-[15px] font-bold cursor-pointer disabled:cursor-default grid place-items-center ${
                            justPopped ? 'yz-pop' : ''
                          }`}
                          style={
                            v != null
                              ? v === 0
                                ? { background: 'var(--color-surface)', color: '#a19786' }
                                : maxed
                                  ? { background: color, color: '#f9f4ed' }
                                  : { background: `color-mix(in srgb, ${color} 22%, var(--color-surface))` }
                              : suggestion != null
                                ? suggestion > 0
                                  ? { border: `2px solid ${color}`, background: 'var(--color-bg)', color }
                                  : { border: `1.5px dashed ${color}`, background: 'transparent', color: '#a19786' }
                                : editable && isTurn
                                  ? { border: `1.5px dashed ${color}`, background: `color-mix(in srgb, ${color} 10%, transparent)` }
                                  : { background: 'color-mix(in srgb, var(--color-surface) 55%, transparent)' }
                          }
                        >
                          {v === 0 ? (
                            <X size={14} strokeWidth={3} />
                          ) : v != null ? (
                            v
                          ) : suggestion != null ? (
                            suggestion > 0 ? (
                              `+${suggestion}`
                            ) : (
                              <X size={12} strokeWidth={2.5} className="opacity-60" />
                            )
                          ) : (
                            ''
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              </Fragment>
            ))}
            <tr className="border-t border-divider">
              <td className={`${label} font-heading text-[15px] py-2`}>Total</td>
              {s.players.map((p, i) => (
                <td key={p.id} className={`text-center ${compact ? 'py-1' : 'py-2'}`}>
                  <span
                    className="inline-block min-w-[40px] px-1.5 py-1 rounded-pill font-heading text-base"
                    style={best > 0 && totals[i] === best ? { background: '#f3d27a', color: '#402310' } : undefined}
                  >
                    {totals[i]}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {inApp && <DiceBottomBar t={dice} turnText={forced ? forced.name : `tur ${turnNo} av ${num}`} />}
      {inApp && <DiceCenter t={dice} />}

      {!inApp && (
        <div className="px-5 pt-4 pb-7 mt-auto">
          <Button
            variant="primary"
            block
            onClick={s.showResult}
            disabled={!done}
            className={`text-base p-3.5 ${done ? 'yz-glow' : ''}`}
          >
            Se sluttresultat
          </Button>
        </div>
      )}

      {toast && (
        <div
          key={toast.id}
          role="status"
          className="yz-toast fixed left-1/2 top-[22%] z-[60] pointer-events-none rounded-card px-6 py-3 text-center shadow-lg text-bg"
          style={{ background: toast.color }}
        >
          <div className={`font-heading leading-none ${toast.big ? 'text-[40px]' : 'text-[26px]'}`}>{toast.text}</div>
          {toast.sub && <div className="text-[12px] mt-1 opacity-90 whitespace-nowrap">{toast.sub}</div>}
        </div>
      )}

      {target && (
        <ScoreDialog
          target={target}
          onPick={(v) => {
            score(target, v);
            setTarget(null);
          }}
          onClose={() => setTarget(null)}
        />
      )}

      <Dialog
        open={confirmOpen}
        title={`Start nytt ${def.title}-spill?`}
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Avbryt
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                s.resetGame();
                setConfirmOpen(false);
              }}
            >
              Start nytt
            </Button>
          </>
        }
      >
        <div className="text-sm opacity-85">
          Dette nullstiller alle spillere og poeng i {def.title}. Du kan ikke angre dette.
        </div>
      </Dialog>
    </div>
  );
}

/** Sum øverst, bonusmåler og om spilleren ligger foran eller bak skjema. */
function UpperSummary({
  def,
  players,
  sheetOf,
  label,
  showPar,
}: {
  def: DiceGameDef;
  showPar: boolean;
  players: { id: string }[];
  sheetOf: (id: string) => Sheet;
  label: string;
}) {
  return (
    <tr className="border-y border-divider">
      <td className={`${label} py-1.5`}>
        <span className="flex flex-col leading-tight">
          <span>Bonus</span>
          <span className="text-[10px] opacity-60">
            {def.bonusLimit} gir +{def.bonus}
          </span>
        </span>
      </td>
      {players.map((p, i) => {
        const sheet = sheetOf(p.id);
        const sum = upperSum(def, sheet);
        const got = bonus(def, sheet) > 0;
        const diff = parDiff(def, sheet);
        const pct = Math.min(100, Math.round((sum / def.bonusLimit) * 100));
        return (
          <td key={p.id} className="px-[3px] py-1.5">
            <div className="flex flex-col items-center gap-1">
              <div className="w-full h-2 rounded-pill bg-neutral-300 overflow-hidden">
                <div
                  className="h-full rounded-pill transition-[width] duration-500"
                  style={{ width: `${pct}%`, background: got ? '#d9a521' : playerColor(i) }}
                />
              </div>
              <span className={`text-[11px] font-bold ${got ? 'text-accent-700' : ''}`}>
                {got ? `+${def.bonus}` : `${sum}/${def.bonusLimit}`}
              </span>
              {showPar && !got && diff !== 0 && (
                <span className={`text-[10px] font-semibold ${diff > 0 ? 'text-accent2-700' : 'text-accent-600'}`}>
                  {diff > 0 ? `+${diff}` : `−${-diff}`} skjema
                </span>
              )}
            </div>
          </td>
        );
      })}
    </tr>
  );
}

function ScoreDialog({
  target,
  onPick,
  onClose,
}: {
  target: Target;
  onPick: (v: number | null) => void;
  onClose: () => void;
}) {
  const { def, useStore } = useDiceGame();
  const s = useStore();
  const c = def.categories[target.cat];
  const idx = s.players.findIndex((p) => p.id === target.playerId);
  const player = s.players[idx];
  const color = playerColor(idx);
  const current = s.sheets[target.playerId]?.[target.cat];
  const face = c.face;
  const top = Math.max(...c.values);
  const cols = c.values.length <= 2 ? 'grid-cols-2' : 'grid-cols-4';

  return (
    <Dialog
      open
      title={`${player?.name ?? ''} · ${c.name}`}
      actions={
        <>
          {current != null && (
            <Button variant="ghost" onClick={() => onPick(null)} className="mr-auto">
              Tøm rute
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Avbryt
          </Button>
        </>
      }
    >
      <div className="text-sm opacity-75 flex items-center gap-2">
        {face && <DiceFace kind={def.kind} face={face} size={20} />}
        {c.hint}
      </div>
      <div className={`grid ${cols} gap-2`}>
        {c.values.map((v) => {
          const selected = v === current;
          const isTop = v === top && v > 0;
          const stk = face && v > 0 && def.kind === 'tall' ? v / face : null;
          return (
            <button
              key={v}
              onClick={() => onPick(v)}
              className={`relative h-12 rounded-[14px] font-bold tabular-nums cursor-pointer border active:scale-95 transition-transform flex flex-col items-center justify-center leading-none ${
                v === 0 && cols === 'grid-cols-4' ? 'col-span-2 text-sm font-semibold border-divider opacity-80' : 'text-lg border-divider'
              } ${v === 0 ? 'text-sm font-semibold opacity-80' : ''}`}
              style={
                selected
                  ? { background: color, color: '#f9f4ed', borderColor: color }
                  : isTop
                    ? { background: `color-mix(in srgb, ${color} 18%, var(--color-bg))`, borderColor: color }
                    : v === 0
                      ? undefined
                      : { background: 'var(--color-bg)' }
              }
            >
              {v === 0 ? 'Stryk (0)' : v}
              {stk != null && <span className="text-[10px] font-semibold opacity-60 mt-0.5">{stk} stk</span>}
              {stk == null && isTop && <span className="text-[10px] font-semibold opacity-70 mt-0.5">maks</span>}
            </button>
          );
        })}
      </div>
    </Dialog>
  );
}
