import { useCallback, useEffect, useRef, useState } from 'react';

type Perm = 'unsupported' | 'needs-permission' | 'granted' | 'denied';

type DMEWithPermission = typeof DeviceMotionEvent & { requestPermission?: () => Promise<'granted' | 'denied'> };

function initialPerm(): Perm {
  if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) return 'unsupported';
  const DME = window.DeviceMotionEvent as DMEWithPermission;
  return typeof DME.requestPermission === 'function' ? 'needs-permission' : 'granted';
}

/** Hvor hardt det må ristes (endring i m/s² mellom to målinger, på minst to akser). */
const THRESHOLD = 12;
/** Minste tid mellom to kast. */
const COOLDOWN_MS = 900;

/**
 * Kaller `onShake` når telefonen ristes. På iPhone må tillatelse be om fra et trykk:
 * kall `request()` fra en knapp (f.eks. første «Kast»).
 */
export function useShake(onShake: () => void, enabled: boolean) {
  const [perm, setPerm] = useState<Perm>(initialPerm);
  const cb = useRef(onShake);
  const last = useRef(0);
  useEffect(() => {
    cb.current = onShake;
  });

  useEffect(() => {
    // Lytt også før tillatelse er gitt: der det ikke trengs (Android) kommer målingene uansett.
    if (perm === 'unsupported' || perm === 'denied' || !enabled) return;
    let prev: { x: number; y: number; z: number } | null = null;
    const handler = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a || a.x == null || a.y == null || a.z == null) return;
      const cur = { x: a.x, y: a.y, z: a.z };
      if (!prev) setPerm('granted');
      else {
        const dx = Math.abs(cur.x - prev.x);
        const dy = Math.abs(cur.y - prev.y);
        const dz = Math.abs(cur.z - prev.z);
        const strong = [dx, dy, dz].filter((d) => d > THRESHOLD).length >= 2;
        const now = Date.now();
        if (strong && now - last.current > COOLDOWN_MS) {
          last.current = now;
          cb.current();
        }
      }
      prev = cur;
    };
    window.addEventListener('devicemotion', handler);
    return () => window.removeEventListener('devicemotion', handler);
  }, [perm, enabled]);

  /** Ber om tillatelse til bevegelsessensoren (iPhone). Må kalles fra et trykk. */
  const request = useCallback(async () => {
    if (perm !== 'needs-permission') return;
    try {
      const DME = window.DeviceMotionEvent as DMEWithPermission;
      const res = await DME.requestPermission!();
      setPerm(res === 'granted' ? 'granted' : 'denied');
    } catch {
      setPerm('denied');
    }
  }, [perm]);

  return { perm, request };
}
