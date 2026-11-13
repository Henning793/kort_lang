import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { computeStandings } from '../game/logic';
import { ROUNDS } from '../game/rounds';
import { DealerMark } from '../components/DealerMark';
import { PlayerBadge } from '../components/game/PlayerBadge';
import { EditScoreDialog } from '../components/EditScoreDialog';

export function StillingTab() {
  const players = useGameStore((s) => s.players);
  const scores = useGameStore((s) => s.scores);
  const round = useGameStore((s) => s.round);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<{ playerId: string; round: number } | null>(null);

  const standings = computeStandings(players, scores, round);
  const expandedPlayer = players.find((p) => p.id === expandedId) ?? null;

  return (
    <div className="px-5 pb-7 flex flex-col gap-4">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="text-left text-[11px] tracking-wider uppercase opacity-60 py-2 border-b border-divider">
              Plass
            </th>
            <th className="text-left text-[11px] tracking-wider uppercase opacity-60 py-2 border-b border-divider">
              Spiller
            </th>
            <th className="text-right text-[11px] tracking-wider uppercase opacity-60 py-2 border-b border-divider">
              Poeng
            </th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s) => (
            <tr
              key={s.id}
              className="cursor-pointer hover:bg-black/5"
              onClick={() => setExpandedId((cur) => (cur === s.id ? null : s.id))}
            >
              <td className="font-heading py-2 border-b border-black/10">{s.rankLabel}</td>
              <td className="py-2 border-b border-black/10">
                <span className="inline-flex items-center gap-2">
                <PlayerBadge
                  name={s.name}
                  index={players.findIndex((p) => p.id === s.id)}
                  size={24}
                  crown={round > 0 && s.rank === 1}
                />
                <span className="relative inline-block">
                  {s.name}
                  {s.isDealer && <DealerMark size={13} style={{ top: -8, right: -8 }} />}
                </span>
                </span>
              </td>
              <td className="text-right font-bold py-2 border-b border-black/10">{s.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {expandedPlayer && (
        <div className="bg-surface rounded-card p-4 flex flex-col gap-2">
          <div className="font-heading text-base">{expandedPlayer.name} — poeng per runde</div>
          {ROUNDS.map((r, i) => {
            const v = scores[expandedPlayer.id]?.[i];
            const played = v != null;
            return (
              <div
                key={i}
                onClick={() => played && setEditTarget({ playerId: expandedPlayer.id, round: i })}
                className="flex justify-between items-center py-2 px-1 border-b border-divider"
                style={{ cursor: played ? 'pointer' : 'default' }}
              >
                <span className="text-[13px] opacity-75">
                  Runde {i + 1}: {r.label}
                </span>
                <span className="flex items-center gap-1.5 font-bold">
                  {played ? String(v) : '–'}
                  {played && <Pencil size={13} strokeWidth={2.75} className="opacity-50" />}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <EditScoreDialog
        open={editTarget != null}
        playerId={editTarget?.playerId ?? null}
        playerName={players.find((p) => p.id === editTarget?.playerId)?.name ?? ''}
        round={editTarget?.round ?? 0}
        onClose={() => setEditTarget(null)}
      />
    </div>
  );
}
