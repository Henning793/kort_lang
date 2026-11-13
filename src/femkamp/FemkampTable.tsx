import type { Scores, StandingRow } from '../game/types';
import { DealerMark } from '../components/DealerMark';
import { FEMKAMP_ROUNDS } from './rules';
import { fmtPoints as fmt } from './logic';


const th = 'text-[10px] tracking-wider uppercase opacity-60 py-2 px-1 border-b border-divider font-bold';
const td = 'py-2 px-1 border-b border-black/10';

/** Stilling med én kolonne per runde, så man ser hvor poengene kom fra. */
export function FemkampTable({
  standings,
  scores,
  showDealer = false,
}: {
  standings: StandingRow[];
  scores: Scores;
  showDealer?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm tabular-nums">
        <thead>
          <tr>
            <th className={`${th} text-left`}>Plass</th>
            <th className={`${th} text-left`}>Spiller</th>
            {FEMKAMP_ROUNDS.map((_, k) => (
              <th key={k} className={`${th} text-center`}>
                {k + 1}
              </th>
            ))}
            <th className={`${th} text-right`}>Sum</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s) => (
            <tr key={s.id} className={s.rank === 1 ? 'bg-accent2/10' : ''}>
              <td className={`${td} font-heading`}>{s.rankLabel}</td>
              <td className={td}>
                <span className="relative inline-block">
                  {s.name}
                  {showDealer && s.isDealer && <DealerMark size={13} style={{ top: -8, right: -10 }} />}
                </span>
              </td>
              {FEMKAMP_ROUNDS.map((_, k) => {
                const v = scores[s.id]?.[k];
                return (
                  <td
                    key={k}
                    className={`${td} text-center text-[13px] ${v != null && v < 0 ? 'text-accent2-700' : 'opacity-70'}`}
                  >
                    {v == null ? '–' : fmt(v)}
                  </td>
                );
              })}
              <td className={`${td} text-right font-bold`}>{fmt(s.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
