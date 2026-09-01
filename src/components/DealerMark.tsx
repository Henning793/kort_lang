import type { CSSProperties } from 'react';
import { CardIcon } from './ui/CardIcon';

export function DealerMark({ size = 14, style }: { size?: number; style?: CSSProperties }) {
  return (
    <span className="absolute rotate-[30deg]" style={style}>
      <CardIcon size={size} color="#c67139" />
    </span>
  );
}
