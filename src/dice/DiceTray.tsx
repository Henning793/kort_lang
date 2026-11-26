import { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';
import { useDiceGame } from './context';
import { DiceFace } from './DiceFace';
import { canRoll, type Roll } from './roll';
import { MAX_ROLLS } from './types';
import { MIN_SHAKE_MS, useShake } from './useShake';

/** Liten skjevhet per terning, så kastet ser naturlig ut. */
const tilt = (i: number, face: number) => `${((i * 37 + face * 13) % 21) - 10}deg`;

/** Hvor lenge de nye terningene vises store før de legger seg på plass. */
const LANDING_MS = 1100;

export type Forced = { name: string; points: number; auto: boolean; onScore: () => void };

export type DiceTurn = ReturnType<typeof useDiceTurn>;

/**
 * Tilstanden for terningene i en tur:
 * - rister man (minst 2 sek) eller trykker Kast, popper terningene opp store midt på skjermen
 * - etterpå legger de seg: i fri over tabellen, i tvungen nede i bunnlinjen
 * - beholdte terninger ligger i beholdt-linjen nederst
 */
export function useDiceTurn({
  roll,
  onRoll,
  onToggle,
  forced,
  color,
  name,
  enabled,
}: {
  enabled: boolean;
  roll: Roll;
  onRoll: () => void;
  onToggle: (i: number) => void;
  forced?: Forced;
  color: string;
  name: string;
}) {
  const { def } = useDiceGame();
  const can = canRoll(roll);
  // Terningene som ble kastet sist (de som lå i koppen), og når.
  const [landing, setLanding] = useState<{ at: number; idx: number[] } | null>(null);

  useEffect(() => {
    if (!landing) return;
    const t = window.setTimeout(() => setLanding(null), LANDING_MS);
    return () => window.clearTimeout(t);
  }, [landing]);

  function doRoll() {
    if (!can) return;
    const idx = roll.used === 0 ? roll.dice.map((_, i) => i) : roll.dice.map((_, i) => i).filter((i) => !roll.held[i]);
    onRoll();
    setLanding({ at: Date.now(), idx });
    navigator.vibrate?.(60);
  }

  const { perm, shakingSince, tooShort, request } = useShake(doRoll, enabled && can && !forced?.auto);
  const [shortShown, setShortShown] = useState(0);
  useEffect(() => {
    if (!tooShort) return;
    const t = window.setTimeout(() => setShortShown(tooShort), 1800);
    return () => window.clearTimeout(t);
  }, [tooShort]);

  function pressRoll() {
    if (perm === 'needs-permission') void request();
    doRoll();
  }

  const shaking = shakingSince > 0;
  const busy = shaking || landing != null;
  return {
    def,
    roll,
    color,
    name,
    forced,
    can,
    canHold: roll.used > 0 && roll.used < MAX_ROLLS && !busy,
    perm,
    shaking,
    shakingSince,
    landing,
    busy,
    tooShort: tooShort > shortShown,
    pressRoll,
    onToggle,
  };
}

/** Store terninger midt på skjermen, uten bakgrunn: rister mens man rister, og viser kastet. */
export function DiceCenter({ t }: { t: DiceTurn }) {
  const { def, roll, color, shaking, shakingSince, landing, forced } = t;
  if (!shaking && !landing) return null;
  const idx = shaking
    ? roll.dice.map((_, i) => i).filter((i) => roll.used === 0 || !roll.held[i])
    : (landing?.idx ?? []);

  return (
    <div className="fixed inset-0 z-40 pointer-events-none flex flex-col items-center justify-center gap-4 px-4" aria-live="polite">
      <div className="flex flex-wrap justify-center gap-3 max-w-[360px]">
        {idx.map((i) => {
          const hit = !shaking && forced != null && roll.held[i];
          return (
            <DiceFace
              key={`${i}-${landing?.at ?? 's'}`}
              kind={def.kind}
              face={shaking ? (roll.used === 0 ? 0 : roll.dice[i]) : roll.dice[i]}
              size={84}
              className={`${shaking ? 'dice-rattle' : 'yz-roll'} shadow-[0_10px_28px_rgba(0,0,0,0.35)]`}
              style={{
                ['--r' as string]: tilt(i, roll.dice[i]),
                animationDelay: shaking ? `${-i * 37}ms` : `${idx.indexOf(i) * 60}ms`,
                ...(hit ? { outline: `4px solid ${color}`, outlineOffset: 3, scale: '1.08' } : {}),
              }}
            />
          );
        })}
      </div>
      {shaking && (
        <div className="w-[220px] h-2.5 rounded-pill bg-black/15 overflow-hidden shadow">
          <div
            key={shakingSince}
            className="h-full rounded-pill dice-shake-meter"
            style={{ background: color, animationDuration: `${MIN_SHAKE_MS}ms` }}
          />
        </div>
      )}
    </div>
  );
}

/** Fri: terningene som ikke er beholdt blir liggende over tabellen. Trykk for å beholde. */
export function DiceTopRow({ t }: { t: DiceTurn }) {
  const { def, roll, forced, busy, canHold, onToggle } = t;
  const cup = roll.dice.map((_, i) => i).filter((i) => !roll.held[i]);
  if (forced || roll.used === 0 || busy || cup.length === 0) return null;
  return (
    <div className="px-3 pb-1 flex flex-col items-center gap-0.5">
      <div className="flex justify-center gap-2">
        {cup.map((i) => (
          <button
            key={i}
            onClick={() => onToggle(i)}
            disabled={!canHold}
            aria-label={`Behold terning ${i + 1}`}
            className="cursor-pointer disabled:cursor-default dice-fly-up"
          >
            <DiceFace kind={def.kind} face={roll.dice[i]} size={54} style={{ rotate: tilt(i, roll.dice[i]) }} />
          </button>
        ))}
      </div>
      {canHold && <span className="text-[11px] font-semibold opacity-55">Trykk på terningene du vil beholde</span>}
    </div>
  );
}

/** Bunnlinjen: hvem sin tur, beholdte terninger, og Kast. */
export function DiceBottomBar({ t, turnText }: { t: DiceTurn; turnText: string }) {
  const { def, roll, color, name, forced, can, canHold, perm, busy, tooShort, pressRoll, onToggle, shaking } = t;
  const idx = roll.dice.map((_, i) => i);
  const kept = idx.filter((i) => roll.held[i]);
  // Tvungen (og før første kast): også terningene som ikke er beholdt ligger her, små og bleke.
  const rest = forced || roll.used === 0 ? idx.filter((i) => !roll.held[i]) : [];
  const shake = perm === 'granted' || perm === 'needs-permission';

  const hint = shaking
    ? 'Rist videre …'
    : tooShort
      ? 'Rist litt lenger: minst 1 sekund.'
      : roll.used === 0
        ? perm === 'needs-permission'
          ? 'Trykk Kast første gang, så kan du riste.'
          : shake
            ? 'Rist telefonen i 1 sekund.'
            : 'Trykk Kast.'
        : forced?.auto
          ? `${forced.points} p føres i ${forced.name}.`
          : roll.used >= MAX_ROLLS
            ? 'Velg rute i tabellen.'
            : forced
              ? kept.length
                ? `Beholdt til ${forced.name}.`
                : `Ingen passer til ${forced.name}. Kast igjen.`
              : 'Beholdt';

  return (
    <div
      className="sticky bottom-0 z-10 mt-auto px-3 pt-2 pb-[max(10px,env(safe-area-inset-bottom))] bg-bg border-t-2 shadow-[0_-6px_16px_rgba(0,0,0,0.06)]"
      style={{ borderColor: color }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2.5 h-2.5 rounded-full flex-none" style={{ background: color }} />
        <span className="font-heading text-[15px] truncate">{name} sin tur</span>
        <span className="text-[12px] opacity-60 whitespace-nowrap truncate">· {turnText}</span>
        <span className="ml-auto flex gap-1 flex-none" aria-label={`Kast ${roll.used} av ${MAX_ROLLS}`}>
          {Array.from({ length: MAX_ROLLS }, (_, k) => (
            <i
              key={k}
              className="block w-2.5 h-2.5 rounded-full border-2"
              style={{ borderColor: color, background: k < roll.used ? color : 'transparent' }}
            />
          ))}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <span className={`text-[11px] leading-tight truncate ${tooShort ? 'font-bold' : 'font-semibold opacity-60'}`} role="status">
            {hint}
          </span>
          <div className="h-[44px] flex items-center gap-1.5">
            {!busy &&
              kept.map((i) => (
                <button
                  key={`k${i}`}
                  onClick={() => onToggle(i)}
                  disabled={!canHold || forced != null}
                  aria-label={`Legg terning ${i + 1} tilbake`}
                  className="cursor-pointer disabled:cursor-default rounded-[22%] dice-fly-down"
                  style={{ outline: `2.5px solid ${color}`, outlineOffset: 1 }}
                >
                  <DiceFace kind={def.kind} face={roll.dice[i]} size={38} />
                </button>
              ))}
            {!busy &&
              rest.map((i) => (
                <button
                  key={`r${i}`}
                  onClick={() => onToggle(i)}
                  disabled={!canHold}
                  aria-label={`Behold terning ${i + 1}`}
                  className={`cursor-pointer disabled:cursor-default ${roll.used > 0 ? 'dice-fly-down' : ''}`}
                >
                  <DiceFace kind={def.kind} face={roll.dice[i]} size={34} className="opacity-40" />
                </button>
              ))}
            {busy && kept.length === 0 && <span className="text-[12px] opacity-40">…</span>}
            {busy &&
              kept
                .filter((i) => !t.landing?.idx.includes(i))
                .map((i) => (
                  <span key={`b${i}`} className="rounded-[22%]" style={{ outline: `2.5px solid ${color}`, outlineOffset: 1 }}>
                    <DiceFace kind={def.kind} face={roll.dice[i]} size={38} />
                  </span>
                ))}
          </div>
        </div>

        <div className="flex-none flex flex-col gap-1">
          <button
            onClick={pressRoll}
            disabled={!can || forced?.auto || busy}
            className={`${forced && roll.used > 0 ? 'h-[34px]' : 'h-[52px]'} px-4 rounded-pill flex items-center justify-center gap-1.5 text-bg font-heading text-[15px] cursor-pointer disabled:cursor-default disabled:opacity-40 active:scale-95 transition-transform`}
            style={{ background: color }}
          >
            <Smartphone size={18} strokeWidth={2.25} className={can && roll.used === 0 && !busy ? 'dice-wiggle' : ''} />
            {roll.used === 0 ? 'Kast' : 'Kast igjen'}
          </button>
          {forced && roll.used > 0 && (
            <button
              onClick={forced.onScore}
              disabled={forced.auto || busy}
              className="h-[30px] px-3 rounded-pill border-2 font-heading text-[13px] cursor-pointer disabled:cursor-default"
              style={{ borderColor: color, color: forced.auto ? '#f9f4ed' : color, background: forced.auto ? color : 'transparent' }}
            >
              {forced.auto ? 'Føres …' : `Før ${forced.points} p`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
