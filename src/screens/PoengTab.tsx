import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { dealerIndex } from '../game/logic';
import { DealerMark } from '../components/DealerMark';
import { Button } from '../components/ui/Button';

function buildDraft(round: number, players: { id: string }[], scores: Record<string, (number | null)[]>) {
  const draft: Record<string, string> = {};
  players.forEach((p) => {
    const v = scores[p.id]?.[round];
    draft[p.id] = v != null ? String(v) : '';
  });
  return draft;
}

export function PoengTab() {
  const players = useGameStore((s) => s.players);
  const round = useGameStore((s) => s.round);
  const scores = useGameStore((s) => s.scores);
  const saveRound = useGameStore((s) => s.saveRound);

  const [draft, setDraft] = useState<Record<string, string>>(() => buildDraft(round, players, scores));

  useEffect(() => {
    setDraft(buildDraft(round, players, scores));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const dIdx = dealerIndex(round, players.length);

  function updateDraft(id: string, raw: string) {
    let v = raw.replace(/[^0-9-]/g, '');
    const neg = v.startsWith('-');
    v = v.replace(/-/g, '');
    if (v.length > 4) v = v.slice(0, 4);
    v = (neg ? '-' : '') + v;
    setDraft((d) => ({ ...d, [id]: v }));
  }

  function handleSave() {
    saveRound(draft);
  }

  const finishLabel = round === 6 ? 'Se sluttresultat' : 'Lagre runde';

  return (
    <div className="px-5 pb-7 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {players.map((p, i) => (
          <div
            key={p.id}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-card bg-surface"
          >
            <span className="relative inline-block font-heading text-[15px]">
              {p.name}
              {i === dIdx && <DealerMark size={14} style={{ top: -9, right: -9 }} />}
            </span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={draft[p.id] ?? ''}
              onChange={(e) => updateDraft(p.id, e.target.value)}
              className="w-[68px] text-center py-2 px-1.5 text-base font-bold bg-bg border border-divider rounded-pill"
            />
          </div>
        ))}
      </div>

      <Button variant="primary" block onClick={handleSave} className="text-base p-3.5">
        {finishLabel}
      </Button>
    </div>
  );
}
