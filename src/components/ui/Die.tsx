import type { CSSProperties } from 'react';

const PIPS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[28, 22], [72, 22], [28, 50], [72, 50], [28, 78], [72, 78]],
};

type Props = { face: number; size?: number; className?: string; style?: CSSProperties; pip?: string; bg?: string };

/** Terning med prikker. */
export function Die({ face, size = 32, className = '', style, pip = '#201e1d', bg = '#f9f4ed' }: Props) {
  const dot = Math.max(3, Math.round(size * 0.19));
  return (
    <span
      aria-hidden
      className={`relative inline-block flex-none rounded-[22%] border border-divider shadow-sm ${className}`}
      style={{ width: size, height: size, background: bg, ...style }}
    >
      {(PIPS[face] ?? []).map(([x, y], i) => (
        <i
          key={i}
          className="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${x}%`, top: `${y}%`, width: dot, height: dot, background: pip }}
        />
      ))}
    </span>
  );
}
