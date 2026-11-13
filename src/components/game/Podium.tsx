import { playerColor } from './colors';

export type PodiumRow = { id: string; name: string; rank: number; index: number; label: string };

/** Pall for de tre beste, i rekkefølgen 2 – 1 – 3. */
export function Podium({ rows }: { rows: PodiumRow[] }) {
  const order = [rows[1], rows[0], rows[2]].filter(Boolean);
  return (
    <div className="px-5 pt-4 flex items-end justify-center gap-2.5" aria-label="Pallen">
      {order.map((r) => {
        const h = r.rank === 1 ? 120 : r.rank === 2 ? 88 : 64;
        return (
          <div key={r.id} className="flex-1 max-w-[110px] flex flex-col items-center gap-1.5">
            <span className="font-heading text-[15px] truncate max-w-full">{r.name}</span>
            <span className="text-[13px] font-bold tabular-nums opacity-80">{r.label}</span>
            <div
              className="w-full rounded-t-[16px] grid place-items-start justify-center pt-2 font-heading text-[28px] text-bg"
              style={{ height: h, background: playerColor(r.index) }}
            >
              {r.rank}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Resten av plasseringene under pallen. */
export function RestList({ rows }: { rows: PodiumRow[] }) {
  if (rows.length <= 3) return null;
  const td = 'py-2 border-b border-black/10';
  return (
    <div className="px-5 pt-3">
      <table className="w-full border-collapse text-sm tabular-nums">
        <tbody>
          {rows.slice(3).map((r) => (
            <tr key={r.id}>
              <td className={`${td} font-heading w-12`}>{r.rank}.</td>
              <td className={td}>{r.name}</td>
              <td className={`${td} text-right font-bold`}>{r.label}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
