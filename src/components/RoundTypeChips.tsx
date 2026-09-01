export function RoundTypeChips({ combo, label }: { combo: number[]; label: string }) {
  return (
    <div className="flex items-center gap-2 bg-surface px-3.5 py-3 rounded-card">
      <div className="flex gap-1 items-end">
        {combo.map((h, i) => (
          <div
            key={i}
            className="w-[18px] rounded-[4px] bg-accent-300 border-[1.5px] border-accent-700"
            style={{ height: h }}
          />
        ))}
      </div>
      <div className="font-heading text-base">{label}</div>
    </div>
  );
}
