import { ChevronLeft } from 'lucide-react';
import { useAppStore } from '../store/appStore';

/** Tilbake til startsiden. Spillet som er i gang blir liggende. */
export function BackButton() {
  const open = useAppStore((s) => s.open);
  return (
    <button
      onClick={() => open('hub')}
      aria-label="Til alle spill"
      className="w-9 h-9 -ml-2 grid place-items-center rounded-pill text-accent hover:bg-accent-100 cursor-pointer"
    >
      <ChevronLeft size={22} strokeWidth={2.5} />
    </button>
  );
}
