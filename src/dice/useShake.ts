import { useCallback, useEffect, useRef, useState } from 'react';

type Perm = 'unsupported' | 'needs-permission' | 'granted' | 'denied';

type DMEWithPermission = typeof DeviceMotionEvent & { requestPermission?: () => Promise<'granted' | 'denied'> };

function initialPerm(): Perm {
  if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) return 'unsupported';
  const DME = window.DeviceMotionEvent as DMEWithPermission;
  return typeof DME.requestPermission === 'function' ? 'needs-permission' : 'granted';
}

/** Et «rykk»: bevegelse (uten tyngdekraft) over dette, i m/s². */
const JOLT = 6;
/** Så mange rykk innen JOLT_WINDOW_MS før det regnes som risting (ikke bare å løfte telefonen). */
const JOLTS_TO_START = 2;
const JOLT_WINDOW_MS = 800;
/** Ristingen regnes som stoppet etter så lang tid uten rykk. */
const SETTLE_MS = 400;
/** Man må riste minst så lenge før terningene kastes. Kortere risting gir ikke kast. */
export const MIN_SHAKE_MS = 2000;
/** Lengste risting før terningene kastes uansett. */
const MAX_SHAKE_MS = 5000;
/** Minste tid fra et kast til neste risting kan starte. */
const COOLDOWN_MS = 600;

export type ShakeState = {
  perm: Perm;
  /** Når ristingen startet (ms), eller 0 når telefonen ligger stille. */
  shakingSince: number;
  /** Øker hver gang noen slutter å riste før MIN_SHAKE_MS. */
  tooShort: number;
  request: () => Promise<void>;
};

/**
 * Følger med på bevegelsessensoren. Mens telefonen ristes er `shakingSince` satt. Når
 * ristingen stopper etter minst MIN_SHAKE_MS kalles `onShake` én gang. På iPhone må tillatelse be om fra et trykk:
 * kall `request()` fra en knapp (f.eks. første «Kast»).
 */
export function useShake(onShake: () => void, enabled: boolean): ShakeState {
  const [perm, setPerm] = useState<Perm>(initialPerm);
  const [shakingSince, setShakingSince] = useState(0);
  const [tooShort, setTooShort] = useState(0);
  const cb = useRef(onShake);
  useEffect(() => {
    cb.current = onShake;
  });

  useEffect(() => {
    // Lytt også før tillatelse er gitt: der det ikke trengs (Android) kommer målingene uansett.
    if (perm === 'unsupported' || perm === 'denied' || !enabled) return;
    let gravity: { x: number; y: number; z: number } | null = null;
    let jolts: number[] = [];
    let shakeStart = 0;
    let lastJolt = 0;
    let lastRoll = 0;
    let settle: number | undefined;
    let first = true;

    const finish = () => {
      window.clearTimeout(settle);
      settle = undefined;
      const long = Date.now() - shakeStart >= MIN_SHAKE_MS;
      shakeStart = 0;
      jolts = [];
      setShakingSince(0);
      if (long) {
        lastRoll = Date.now();
        cb.current();
      } else {
        setTooShort((n) => n + 1);
      }
    };

    const handler = (e: DeviceMotionEvent) => {
      // Bevegelse uten tyngdekraft. Finnes ikke den, trekkes tyngdekraften fra selv (lavpass).
      let lin: { x: number; y: number; z: number } | null = null;
      const a = e.acceleration;
      if (a && a.x != null && a.y != null && a.z != null) {
        lin = { x: a.x, y: a.y, z: a.z };
      } else {
        const g = e.accelerationIncludingGravity;
        if (!g || g.x == null || g.y == null || g.z == null) return;
        gravity = gravity
          ? { x: 0.85 * gravity.x + 0.15 * g.x, y: 0.85 * gravity.y + 0.15 * g.y, z: 0.85 * gravity.z + 0.15 * g.z }
          : { x: g.x, y: g.y, z: g.z };
        lin = { x: g.x - gravity.x, y: g.y - gravity.y, z: g.z - gravity.z };
      }
      if (first) {
        first = false;
        setPerm('granted');
      }

      const now = Date.now();
      const mag = Math.hypot(lin.x, lin.y, lin.z);
      if (mag < JOLT || now - lastRoll < COOLDOWN_MS) return;
      lastJolt = now;

      if (!shakeStart) {
        jolts = [...jolts.filter((t) => now - t < JOLT_WINDOW_MS), now];
        if (jolts.length < JOLTS_TO_START) return;
        shakeStart = now;
        setShakingSince(now);
      }
      if (now - shakeStart > MAX_SHAKE_MS) {
        finish();
        return;
      }
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        if (Date.now() - lastJolt >= SETTLE_MS - 20) finish();
      }, SETTLE_MS);
    };

    window.addEventListener('devicemotion', handler);
    return () => {
      window.removeEventListener('devicemotion', handler);
      window.clearTimeout(settle);
      setShakingSince(0);
    };
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

  return { perm, shakingSince, tooShort, request };
}
