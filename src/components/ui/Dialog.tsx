import type { ReactNode } from 'react';

type Props = {
  open: boolean;
  title: string;
  children: ReactNode;
  actions: ReactNode;
};

export function Dialog({ open, title, children, actions }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 grid place-items-center p-4 bg-black/50 z-50">
      <div className="w-full max-w-[440px] flex flex-col gap-3 p-4 rounded-card bg-surface shadow-lg">
        <div className="font-heading text-xl">{title}</div>
        {children}
        <div className="flex justify-end gap-2 mt-2">{actions}</div>
      </div>
    </div>
  );
}
