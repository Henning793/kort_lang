import type { CSSProperties } from 'react';
import { Die } from '../components/ui/Die';
import type { DiceKind } from './types';
import { ANIMALS } from './animals';

type Props = { face: number; size?: number; className?: string; style?: CSSProperties };

/** Terning med et dyr. Side 0 er blank. */
export function AnimalDie({ face, size = 32, className = '', style }: Props) {
  const a = ANIMALS[face - 1];
  return (
    <span
      aria-hidden
      className={`relative inline-grid place-items-center flex-none rounded-[22%] border border-divider shadow-sm leading-none select-none ${className}`}
      style={{ width: size, height: size, background: '#f9f4ed', fontSize: Math.round(size * 0.62), ...style }}
    >
      {a?.emoji}
    </span>
  );
}

/** Tallterning eller dyreterning, etter spillet. */
export function DiceFace({ kind, ...rest }: Props & { kind: DiceKind }) {
  return kind === 'dyr' ? <AnimalDie {...rest} /> : <Die {...rest} />;
}
