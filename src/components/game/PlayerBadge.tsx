import type { CSSProperties } from 'react';
import { Crown } from 'lucide-react';
import { playerColor, GOLD, GOLD_LIGHT } from './colors';

type Props = { name: string; index: number; size?: number; crown?: boolean; glow?: boolean };

/** Rundt merke med initialer i spillerens farge. Krone på den som leder. */
export function PlayerBadge({ name, index, size = 32, crown = false, glow = false }: Props) {
  const color = playerColor(index);
  const style: CSSProperties & Record<string, string> = {
    width: `${size}px`,
    height: `${size}px`,
    background: color,
    fontSize: `${Math.round(size * 0.4)}px`,
    '--glow': color,
    '--tw-ring-color': color,
  };
  return (
    <span className="relative inline-grid flex-none">
      {crown && (
        <Crown
          size={Math.round(size * 0.48)}
          strokeWidth={2.5}
          color={GOLD}
          fill={GOLD_LIGHT}
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: -Math.round(size * 0.42) }}
          aria-label="Leder"
        />
      )}
      <span
        className={`rounded-full grid place-items-center font-heading text-bg ${
          glow ? 'yz-glow ring-2 ring-offset-2 ring-offset-bg' : ''
        }`}
        style={style}
      >
        {name.slice(0, 2).toUpperCase()}
      </span>
    </span>
  );
}
