import { PlayingCard } from '../components/ui/PlayingCard';
import { Button } from '../components/ui/Button';
import { FEMKAMP_ROUNDS } from './rules';

export function RulesSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center" onClick={onClose}>
      <div
        className="w-full max-w-[480px] max-h-[88vh] overflow-auto bg-bg rounded-t-[28px] p-5 pb-7 flex flex-col gap-3.5"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Regler for Femkamp"
      >
        <h3 className="m-0 text-[22px]">Regler for Femkamp</h3>
        <p className="m-0 text-[13px] opacity-75">
          Du må følge farge i alle rundene: legg i samme farge som første kort i stikket. Har du ikke den
          fargen, kan du legge hva som helst. Færrest poeng etter fem runder vinner.
        </p>
        {FEMKAMP_ROUNDS.map((r, k) => (
          <div key={r.name} className="flex gap-3 items-start">
            <PlayingCard glyph={r.glyph} red={r.red} />
            <div>
              <div className="font-heading text-[15px]">
                {k + 1}. {r.name}
              </div>
              <p className="m-0 text-[13px] opacity-70">{r.desc}</p>
            </div>
          </div>
        ))}
        <Button variant="primary" block onClick={onClose}>
          Lukk
        </Button>
      </div>
    </div>
  );
}
