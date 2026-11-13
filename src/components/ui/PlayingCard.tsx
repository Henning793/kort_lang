import type { CSSProperties } from 'react';

type Props = { glyph: string; red?: boolean; size?: 'sm' | 'md'; className?: string; style?: CSSProperties };

/** Lite spillkort med et symbol, brukt for å vise hva en runde handler om. */
export function PlayingCard({ glyph, red, size = 'sm', className = '', style }: Props) {
  const dims = size === 'md' ? 'w-[34px] h-[46px] text-lg' : 'w-[26px] h-9 text-sm';
  return (
    <span
      aria-hidden
      style={style}
      className={`${dims} flex-none grid place-items-center rounded-[6px] bg-neutral-100 border border-divider shadow-sm font-bold font-body ${
        red ? 'text-[#b23a2b]' : 'text-ink'
      } ${className}`}
    >
      {glyph}
    </span>
  );
}
