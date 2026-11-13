import { Fragment, useState } from 'react';
import { Dices } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { BackButton } from '../components/BackButton';
import { useYatzyStore } from './store';
import { YATZY_CATEGORIES, UPPER_COUNT, BONUS, BONUS_LIMIT } from './rules';
import { upperSum, bonus, total, canEdit, turnIndex, isComplete, emptySheet } from './logic';

type Target = { playerId: string; cat: number };

export function YatzyPlay() {
  const s = useYatzyStore();
  const [target, setTarget] = useState<Target | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const turn = turnIndex(s.sheets, s.players);
  const done = isComplete(s.sheets, s.players);
  const sheetOf = (id: string) => s.sheets[id] ?? emptySheet();

  const th = 'px-1 py-2 text-center font-heading text-[13px] font-normal';
  const label = 'sticky left-0 z-[1] bg-bg pl-1 pr-2 py-1.5 text-left text-[13px] whitespace-nowrap';
  const sumRow = 'border-t border-divider';

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center gap-2 px-5 pt-4 pb-2">
        <BackButton />
        <div className="flex items-center gap-2 font-heading text-[17px] mr-auto">
          <Dices size={18} strokeWidth={2.5} color="#c67139" />
          Yatzy
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-pill bg-accent2-100 text-accent2-800">
          {s.mode === 'fri' ? 'Fri' : 'Tvungen'}
        </span>
        <Button variant="ghost" onClick={() => setConfirmOpen(true)}>
          Nytt spill
        </Button>
      </div>

      <div className="px-5 pb-3 text-sm">
        {done ? (
          <span className="font-semibold">Alle ruter er fylt ut.</span>
        ) : (
          <>
            <span className="font-heading text-base">{s.players[turn].name}</span>
            <span className="opacity-70"> sin tur. Trykk på en rute for å føre poeng.</span>
          </>
        )}
      </div>

      <div className="px-3 overflow-x-auto">
        <table className="w-full border-collapse tabular-nums">
          <thead>
            <tr>
              <th className={`${label} font-normal`} />
              {s.players.map((p, i) => (
                <th key={p.id} className={th}>
                  <span
                    className={`inline-block max-w-[72px] truncate align-bottom px-2 py-0.5 rounded-pill ${
                      i === turn && !done ? 'bg-accent text-bg' : ''
                    }`}
                  >
                    {p.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {YATZY_CATEGORIES.map((c, cat) => (
              <Fragment key={c.name}>
                {cat === UPPER_COUNT && (
                  <>
                    <tr key="sum" className={sumRow}>
                      <td className={`${label} opacity-70`}>Sum</td>
                      {s.players.map((p) => (
                        <td key={p.id} className="text-center text-[13px] opacity-70 py-1.5">
                          {upperSum(sheetOf(p.id))}
                        </td>
                      ))}
                    </tr>
                    <tr key="bonus">
                      <td className={`${label} opacity-70`}>
                        Bonus <span className="text-[11px]">({BONUS_LIMIT}+)</span>
                      </td>
                      {s.players.map((p) => {
                        const b = bonus(sheetOf(p.id));
                        return (
                          <td
                            key={p.id}
                            className={`text-center text-[13px] py-1.5 ${b ? 'text-accent2-700 font-bold' : 'opacity-40'}`}
                          >
                            {b ? BONUS : '–'}
                          </td>
                        );
                      })}
                    </tr>
                  </>
                )}
                <tr className={cat === UPPER_COUNT ? sumRow : ''}>
                  <td className={label}>{c.name}</td>
                  {s.players.map((p) => {
                    const sheet = sheetOf(p.id);
                    const v = sheet[cat];
                    const editable = canEdit(sheet, cat, s.mode);
                    return (
                      <td key={p.id} className="p-[3px]">
                        <button
                          onClick={() => setTarget({ playerId: p.id, cat })}
                          disabled={!editable}
                          aria-label={`${p.name}, ${c.name}`}
                          className={`w-full min-w-[40px] h-[34px] rounded-[10px] text-[15px] font-bold cursor-pointer disabled:cursor-default ${
                            v != null
                              ? v === 0
                                ? 'bg-surface opacity-50 line-through'
                                : 'bg-surface'
                              : editable
                                ? 'border-[1.5px] border-dashed border-accent bg-accent-100/60'
                                : 'bg-surface/40'
                          }`}
                        >
                          {v ?? ''}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              </Fragment>
            ))}
            <tr className={sumRow}>
              <td className={`${label} font-heading text-[15px]`}>Total</td>
              {s.players.map((p) => (
                <td key={p.id} className="text-center font-heading text-base py-2">
                  {total(sheetOf(p.id))}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="px-5 pt-4 pb-7 mt-auto">
        <Button variant="primary" block onClick={s.showResult} disabled={!done} className="text-base p-3.5">
          Se sluttresultat
        </Button>
      </div>

      {target && <ScoreDialog target={target} onClose={() => setTarget(null)} />}

      <Dialog
        open={confirmOpen}
        title="Start nytt Yatzy-spill?"
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Avbryt
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                s.resetGame();
                setConfirmOpen(false);
              }}
            >
              Start nytt
            </Button>
          </>
        }
      >
        <div className="text-sm opacity-85">Dette nullstiller alle spillere og poeng i Yatzy. Du kan ikke angre dette.</div>
      </Dialog>
    </div>
  );
}

function ScoreDialog({ target, onClose }: { target: Target; onClose: () => void }) {
  const s = useYatzyStore();
  const c = YATZY_CATEGORIES[target.cat];
  const player = s.players.find((p) => p.id === target.playerId);
  const current = s.sheets[target.playerId]?.[target.cat];

  function pick(v: number | null) {
    s.setScore(target.playerId, target.cat, v);
    onClose();
  }

  return (
    <Dialog
      open
      title={`${player?.name ?? ''} · ${c.name}`}
      actions={
        <>
          {current != null && (
            <Button variant="ghost" onClick={() => pick(null)} className="mr-auto">
              Tøm rute
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Avbryt
          </Button>
        </>
      }
    >
      <div className="text-sm opacity-75">{c.hint}</div>
      <div className="grid grid-cols-4 gap-2">
        {c.values.map((v) => (
          <button
            key={v}
            onClick={() => pick(v)}
            className={`h-11 rounded-pill font-bold text-base tabular-nums cursor-pointer border ${
              v === current
                ? 'bg-accent text-bg border-accent'
                : v === 0
                  ? 'border-divider text-sm font-semibold opacity-80 hover:bg-black/5'
                  : 'border-divider bg-bg hover:bg-accent-100'
            } ${v === 0 ? 'col-span-2' : ''}`}
          >
            {v === 0 ? 'Stryk (0)' : v}
          </button>
        ))}
      </div>
    </Dialog>
  );
}
