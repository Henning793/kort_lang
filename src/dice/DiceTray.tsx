import { useEffect, useState } from 'react';
import { Maximize2, Smartphone, Table2 } from 'lucide-react';
import { useDiceGame } from './context';
import { DiceFace } from './DiceFace';
import { canRoll, type Roll } from './roll';
import { MAX_ROLLS } from './types';
import { MIN_SHAKE_MS, useShake } from './useShake';

/** Liten skjevhet per terning, så kastet ser naturlig ut. */
const tilt = (i: number, face: number) => `${((i * 37 + face * 13) % 21) - 10}deg`;

type Forced = { name: string; points: number; auto: boolean; onScore: () => void };

/**
 * Terningene i en tur. Et stort terningbrett midt på skjermen mens man kaster, og en
 * liten linje nederst når man ser på tabellen. Rist telefonen i minst to sekunder
 * (eller trykk Kast) for å kaste. Etter første og andre kast kan man ta bort terninger
 * man vil beholde.
 */
export function DiceTray({
  rollKey,
  roll,
  name,
  color,
  turnNo,
  num,
  onRoll,
  onToggle,
  forced,
}: {
  rollKey: string;
  roll: Roll;
  name: string;
  color: string;
  turnNo: number;
  num: number;
  onRoll: () => void;
  onToggle: (i: number) => void;
  /** Tvungen: ruten som skal fylles, hva kastet gir nå, og om det føres av seg selv. */
  forced?: Forced;
}) {
  const { def } = useDiceGame();
  const [anim, setAnim] = useState<number | null>(null);
  // Brettet er åpent ved starten av hver tur.
  const [closedFor, setClosedFor] = useState<string | null>(null);
  const open = closedFor !== rollKey;
  const can = canRoll(roll);
  const canHold = roll.used > 0 && roll.used < MAX_ROLLS;

  useEffect(() => {
    if (anim == null) return;
    const t = window.setTimeout(() => setAnim(null), 700);
    return () => window.clearTimeout(t);
  }, [anim]);

  function doRoll() {
    if (!can) return;
    onRoll();
    setClosedFor(null);
    setAnim(Date.now());
    navigator.vibrate?.(60);
  }

  const { perm, shakingSince, tooShort, request } = useShake(doRoll, can && !forced?.auto);
  const shaking = shakingSince > 0;
  const [shortShown, setShortShown] = useState(0);
  const showShort = tooShort > shortShown;
  useEffect(() => {
    if (!tooShort) return;
    const t = window.setTimeout(() => setShortShown(tooShort), 1800);
    return () => window.clearTimeout(t);
  }, [tooShort]);

  // Rister man mens tabellen vises, kommer brettet frem.
  useEffect(() => {
    if (shaking) setClosedFor(null);
  }, [shaking]);

  function pressRoll() {
    if (perm === 'needs-permission') void request();
    if (!open) setClosedFor(null);
    doRoll();
  }

  const shake = perm === 'granted' || perm === 'needs-permission';
  const idx = roll.dice.map((_, i) => i);
  const cup = idx.filter((i) => !roll.held[i]);
  const kept = idx.filter((i) => roll.held[i]);

  const hint = shaking
    ? 'Rist videre …'
    : showShort
      ? 'Rist litt lenger: minst 2 sekunder.'
      : roll.used === 0
        ? perm === 'needs-permission'
          ? 'Trykk Kast første gang. Etterpå kan du riste telefonen.'
          : shake
            ? 'Rist telefonen i 2 sekunder for å kaste.'
            : 'Trykk Kast for å kaste.'
        : forced
          ? forced.auto
            ? `${forced.points} poeng føres i ${forced.name}.`
            : `Terningene som passer til ${forced.name} er tatt bort. Kast resten.`
          : roll.used < MAX_ROLLS
            ? 'Trykk på terningene du vil beholde. Kast resten, eller velg rute.'
            : 'Siste kast. Velg rute i tabellen.';

  const dots = (
    <span className="flex gap-1" aria-label={`Kast ${roll.used} av ${MAX_ROLLS}`}>
      {Array.from({ length: MAX_ROLLS }, (_, k) => (
        <i
          key={k}
          className="block w-3 h-3 rounded-full border-2"
          style={{ borderColor: color, background: k < roll.used ? color : 'transparent' }}
        />
      ))}
    </span>
  );

  const rollLabel = roll.used === 0 ? 'Kast' : 'Kast igjen';

  if (!open) {
    // Liten linje nederst mens man velger rute i tabellen.
    return (
      <div
        className="sticky bottom-0 z-10 mt-auto px-3 pt-2 pb-[max(10px,env(safe-area-inset-bottom))] bg-bg border-t-2 shadow-[0_-6px_16px_rgba(0,0,0,0.06)]"
        style={{ borderColor: color }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setClosedFor(null)}
            aria-label="Vis terningbrettet"
            className="flex-1 min-w-0 flex items-center gap-1.5 cursor-pointer"
          >
            {roll.dice.map((d, i) => (
              <DiceFace key={i} kind={def.kind} face={d} size={38} className={roll.used === 0 ? 'opacity-45' : ''} />
            ))}
            <Maximize2 size={18} strokeWidth={2.5} className="ml-1 opacity-50 flex-none" />
          </button>
          <button
            onClick={pressRoll}
            disabled={!can}
            className="h-[44px] px-3 rounded-pill font-heading text-[14px] text-bg cursor-pointer disabled:opacity-40 disabled:cursor-default"
            style={{ background: color }}
          >
            {rollLabel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/45 flex items-center justify-center p-3" role="dialog" aria-label="Terningbrett">
      <div className="w-full max-w-[440px] rounded-card bg-bg p-4 flex flex-col gap-3 shadow-lg yz-pop">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full flex-none" style={{ background: color }} />
          <div className="min-w-0 flex-1">
            <div className="font-heading text-[20px] leading-tight truncate">{name} sin tur</div>
            <div className="text-[13px] opacity-65">{forced ? `Runde: ${forced.name}` : `Tur ${turnNo} av ${num}`}</div>
          </div>
          {dots}
        </div>

        {/* Bordet med terningene som skal kastes */}
        <div
          className="relative rounded-[20px] min-h-[178px] px-3 py-4 flex flex-wrap items-center justify-center content-center gap-3 overflow-hidden"
          style={{ background: `color-mix(in srgb, ${color} 16%, var(--color-surface))` }}
        >
          {cup.length === 0 ? (
            <span className="text-[14px] font-semibold opacity-60">Alle terningene er tatt bort.</span>
          ) : (
            cup.map((i) => (
              <button
                key={`${i}-${anim ?? 'x'}`}
                onClick={() => onToggle(i)}
                disabled={!canHold}
                aria-label={roll.used ? `Ta bort terning ${i + 1}` : `Terning ${i + 1}`}
                className="cursor-pointer disabled:cursor-default"
              >
                <DiceFace
                  kind={def.kind}
                  face={roll.dice[i]}
                  size={68}
                  className={`${shaking ? 'dice-rattle' : anim != null ? 'yz-roll' : ''} ${roll.used === 0 && !shaking ? 'opacity-45' : ''}`}
                  style={{
                    ['--r' as string]: tilt(i, roll.dice[i]),
                    animationDelay: shaking ? `${-i * 37}ms` : `${i * 50}ms`,
                    rotate: anim == null && !shaking ? tilt(i, roll.dice[i]) : undefined,
                  }}
                />
              </button>
            ))
          )}

          {/* Måler for hvor lenge man har ristet */}
          {shaking && (
            <div className="absolute left-3 right-3 bottom-2.5 h-2 rounded-pill bg-black/10 overflow-hidden">
              <div
                key={shakingSince}
                className="h-full rounded-pill dice-shake-meter"
                style={{ background: color, animationDuration: `${MIN_SHAKE_MS}ms` }}
              />
            </div>
          )}
        </div>

        {/* Terninger som er tatt bort */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] tracking-wider uppercase font-bold opacity-55">Beholdt</span>
          <div
            className="min-h-[62px] rounded-[16px] px-2 py-1.5 flex items-center gap-2 border-2 border-dashed"
            style={{ borderColor: `color-mix(in srgb, ${color} 45%, transparent)` }}
          >
            {kept.map((i) => (
              <button
                key={i}
                onClick={() => onToggle(i)}
                disabled={!canHold}
                aria-label={`Legg terning ${i + 1} tilbake i koppen`}
                className="cursor-pointer disabled:cursor-default rounded-[22%]"
                style={{ outline: `2.5px solid ${color}`, outlineOffset: 1 }}
              >
                <DiceFace kind={def.kind} face={roll.dice[i]} size={48} />
              </button>
            ))}
          </div>
        </div>

        <p className={`m-0 text-[14px] leading-snug min-h-[2.6em] ${showShort ? 'font-semibold' : 'opacity-75'}`} role="status">
          {hint}
        </p>

        <div className="flex gap-2">
          <button
            onClick={pressRoll}
            disabled={!can || forced?.auto}
            className="flex-1 h-[56px] rounded-pill flex items-center justify-center gap-2 text-bg font-heading text-[18px] cursor-pointer disabled:cursor-default disabled:opacity-40 active:scale-95 transition-transform"
            style={{ background: color }}
          >
            <Smartphone size={22} strokeWidth={2.25} className={can && roll.used === 0 && !shaking ? 'dice-wiggle' : ''} />
            {rollLabel}
          </button>
          {roll.used > 0 &&
            (forced ? (
              <button
                onClick={forced.onScore}
                disabled={forced.auto}
                className="h-[56px] px-4 rounded-pill border-2 font-heading text-[16px] cursor-pointer disabled:cursor-default"
                style={{ borderColor: color, color: forced.auto ? '#f9f4ed' : color, background: forced.auto ? color : 'transparent' }}
              >
                {forced.auto ? 'Føres …' : `Før ${forced.points} p`}
              </button>
            ) : (
              <button
                onClick={() => setClosedFor(rollKey)}
                className="h-[56px] px-4 rounded-pill border-2 font-heading text-[16px] flex items-center gap-1.5 cursor-pointer"
                style={{ borderColor: color, color }}
              >
                <Table2 size={18} strokeWidth={2.5} />
                Velg rute
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
