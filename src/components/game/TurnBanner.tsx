import type { ReactNode } from 'react';

type Props = { color: string; title: string; subtitle?: string; art?: ReactNode; animKey?: string };

/** Farget boks øverst som viser hvem det gjelder nå. Rulles inn på nytt når animKey endres. */
export function TurnBanner({ color, title, subtitle, art, animKey }: Props) {
  return (
    <div key={animKey} className="rounded-card px-4 py-3 flex items-center gap-3 text-bg" style={{ background: color }}>
      {art && <div className="flex gap-1">{art}</div>}
      <div className="flex-1 min-w-0">
        <div className="font-heading text-lg leading-tight truncate">{title}</div>
        {subtitle && <div className="text-[12px] opacity-85">{subtitle}</div>}
      </div>
    </div>
  );
}
