import type { Toast } from './useGameToast';

export function GameToast({ toast }: { toast: Toast | null }) {
  if (!toast) return null;
  return (
    <div
      key={toast.id}
      role="status"
      className="yz-toast fixed left-1/2 top-[22%] z-[60] pointer-events-none rounded-card px-6 py-3 text-center shadow-lg text-bg w-max max-w-[90vw]"
      style={{ background: toast.color }}
    >
      <div className={`font-heading leading-none ${toast.big ? 'text-[36px]' : 'text-[26px]'}`}>{toast.text}</div>
      {toast.sub && <div className="text-[12px] mt-1 opacity-90">{toast.sub}</div>}
    </div>
  );
}
