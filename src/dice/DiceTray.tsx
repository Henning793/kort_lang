import { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';
import { useDiceGame } from './context';
import { DiceFace } from './DiceFace';
import { canRoll, type Roll } from './roll';
import { MAX_ROLLS } from './types';
import { useShake } from './useShake';

/** Liten skjevhet per terning, så kastet ser naturlig ut. */
const tilt = (i: number, face: number) => `${((i * 37 + face * 13) % 21) - 10}deg`;

/**
 * Terningkoppen nederst på skjermen. Rist telefonen (eller trykk Kast) for å kaste.
 * Etter første og andre kast kan man ta bort terninger man vil beholde.
 */
export function DiceTray({
  roll,
  name,
  color,
  turnNo,
  num,
  onRoll,
  onToggle,
}: {
  rollKey: string;
  roll: Roll;
  name: string;
  color: string;
  turnNo: number;
  num: number;
  onRoll: () => void;
  onToggle: (i: number) => void;
}) {
  const { def } = useDiceGame();
  const [anim, setAnim] = useState<number | null>(null);
  const can = canRoll(roll);
  const canHold = roll.used > 0 && roll.used < MAX_ROLLS;

  useEffect(() => {
    if (anim == null) return;
    const t = window.setTimeout(() => setAnim(null), 650);
    return () => window.clearTimeout(t);
  }, [anim]);

  function doRoll() {
    if (!can) return;
    onRoll();
    setAnim(Date.now());
    navigator.vibrate?.(35);
  }

  const { perm, request } = useShake(doRoll, can);
  const shake = perm === 'granted' || perm === 'needs-permission';

  const idx = roll.dice.map((_, i) => i);
  const cup = idx.filter((i) => !roll.held[i]);
  const kept = idx.filter((i) => roll.held[i]);

  const hint =
    roll.used === 0
      ? perm === 'needs-permission'
        ? 'Trykk Kast første gang. Etterpå kan du riste telefonen.'
        : shake
          ? 'Rist telefonen for å kaste.'
          : 'Trykk Kast for å kaste.'
      : roll.used < MAX_ROLLS
        ? 'Trykk på terningene du vil beholde, og kast resten. Eller velg rute.'
        : 'Siste kast. Velg en rute i tabellen.';

  return (
    <div
      className="sticky bottom-0 z-10 mt-auto px-3 pt-2 pb-[max(10px,env(safe-area-inset-bottom))] bg-bg border-t-2 shadow-[0_-6px_16px_rgba(0,0,0,0.06)]"
      style={{ borderColor: color }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-2.5 h-2.5 rounded-full flex-none" style={{ background: color }} />
        <span className="font-heading text-[15px] truncate">{name} sin tur</span>
        <span className="text-[12px] opacity-60 whitespace-nowrap">
          · tur {turnNo} av {num}
        </span>
        <span className="ml-auto flex gap-1" aria-label={`Kast ${roll.used} av ${MAX_ROLLS}`}>
          {Array.from({ length: MAX_ROLLS }, (_, k) => (
            <i
              key={k}
              className="block w-2.5 h-2.5 rounded-full border-2"
              style={{ borderColor: color, background: k < roll.used ? color : 'transparent' }}
            />
          ))}
        </span>
      </div>

      <div className="flex items-stretch gap-2">
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          {/* Terninger som er tatt bort */}
          <div
            className="h-[40px] rounded-[12px] px-1.5 flex items-center gap-1.5 border-[1.5px] border-dashed"
            style={{ borderColor: `color-mix(in srgb, ${color} 45%, transparent)` }}
          >
            {kept.length === 0 ? (
              <span className="text-[12px] font-semibold opacity-60 px-1 leading-tight line-clamp-2">{hint}</span>
            ) : (
              kept.map((i) => (
                <button
                  key={i}
                  onClick={() => onToggle(i)}
                  disabled={!canHold}
                  aria-label={`Legg terning ${i + 1} tilbake i koppen`}
                  className="cursor-pointer disabled:cursor-default rounded-[22%]"
                  style={{ outline: `2px solid ${color}`, outlineOffset: 1 }}
                >
                  <DiceFace kind={def.kind} face={roll.dice[i]} size={30} />
                </button>
              ))
            )}
          </div>

          {/* Koppen */}
          <div className="h-[46px] flex items-center gap-1.5">
            {cup.map((i) => (
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
                  size={44}
                  className={`${anim != null ? 'yz-roll' : ''} ${roll.used === 0 ? 'opacity-45' : ''}`}
                  style={{ ['--r' as string]: tilt(i, roll.dice[i]), animationDelay: `${i * 40}ms`, rotate: anim == null ? tilt(i, roll.dice[i]) : undefined }}
                />
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            if (perm === 'needs-permission') void request();
            doRoll();
          }}
          disabled={!can}
          className="w-[76px] flex-none rounded-card flex flex-col items-center justify-center gap-1 text-bg font-heading cursor-pointer disabled:cursor-default disabled:opacity-40 active:scale-95 transition-transform"
          style={{ background: color }}
        >
          <Smartphone size={22} strokeWidth={2.25} className={can && roll.used === 0 ? 'dice-wiggle' : ''} />
          <span className="text-[15px] leading-none">{roll.used === 0 ? 'Kast' : 'Kast igjen'}</span>
        </button>
      </div>

    </div>
  );
}
