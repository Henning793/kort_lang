import type { Tab } from '../game/types';

export function TabSwitcher({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="inline-flex overflow-hidden border border-divider rounded-pill self-start">
      {(['poeng', 'stilling'] as Tab[]).map((t) => (
        <label
          key={t}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] cursor-pointer ${
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
