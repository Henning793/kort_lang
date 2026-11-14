import type { Tab } from '../game/types';

export function TabSwitcher({
  tab,
  onChange,
  large = false,
}: {
  tab: Tab;
  onChange: (t: Tab) => void;
  large?: boolean;
}) {
  return (
    <div className={`${large ? 'flex w-full' : 'inline-flex self-start'} overflow-hidden border border-divider rounded-pill`}>
      {(['poeng', 'stilling'] as Tab[]).map((t) => (
        <label
          key={t}
          className={`inline-flex items-center justify-center gap-1.5 cursor-pointer ${
            large ? 'flex-1 py-2 text-base font-semibold' : 'px-3 py-1.5 text-[13px]'
          } ${
            tab === t ? 'bg-accent text-bg' : 'hover:bg-black/5'
          }`}
        >
          <input
            type="radio"
            name="tab"
            className="sr-only"
            checked={tab === t}
            onChange={() => onChange(t)}
          />
          {t === 'poeng' ? 'Poeng' : 'Stilling'}
        </label>
      ))}
    </div>
  );
}
