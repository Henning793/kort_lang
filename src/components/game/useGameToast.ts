import { useCallback, useEffect, useState } from 'react';

export type Toast = { id: number; text: string; sub?: string; color: string; big?: boolean };

/** Kort popup som spretter opp og forsvinner av seg selv. */
export function useGameToast() {
  const [toast, setToast] = useState<Toast | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(t);
  }, [toast]);
  const show = useCallback((t: Omit<Toast, 'id'>) => setToast({ ...t, id: Date.now() + Math.random() }), []);
  return { toast, show };
}

