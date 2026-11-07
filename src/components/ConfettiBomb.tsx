import { useEffect, useRef, type RefObject } from 'react';

type Props = {
  /** Element the bomb explodes from (its centre). Falls back to upper middle of the screen. */
  originRef?: RefObject<HTMLElement | null>;
  /** Called when the bomb goes off, e.g. to shake the screen. */
  onBlast?: () => void;
};

type Kind = 'rect' | 'ribbon' | 'dot' | 'suit';
type Particle = {
  x: number; y: number; vx: number; vy: number;
  kind: Kind; suit: string; c: string;
  w: number; h: number; rot: number; vr: number;
  flip: number; vf: number; drag: number;
  life: number; max: number; sway: number;
};

const COLORS = ['#c67139', '#f6a06b', '#ffc6a5', '#7a8a5e', '#aebf92', '#f9f4ed', '#e0b13a', '#d6336c'];
const SUITS = ['♠', '♥', '♦', '♣'];
const SUIT_COLORS: Record<string, string> = { '♠': '#201e1d', '♣': '#201e1d', '♥': '#c8332a', '♦': '#c8332a' };
const COUNT = 250;
const DRIZZLE_MS = 4000;
const GRAVITY = 900;

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function make(x: number, y: number, vx: number, vy: number): Particle {
  const r = Math.random();
  const kind: Kind = r < 0.55 ? 'rect' : r < 0.8 ? 'ribbon' : r < 0.9 ? 'dot' : 'suit';
  return {
    x, y, vx, vy, kind,
    suit: SUITS[Math.floor(Math.random() * SUITS.length)],
    c: COLORS[Math.floor(Math.random() * COLORS.length)],
    w: rand(6, 11), h: rand(9, 16), rot: rand(0, Math.PI * 2), vr: rand(-12, 12),
    flip: rand(0, Math.PI * 2), vf: rand(6, 14), drag: rand(0.86, 0.93),
    life: 0, max: rand(3.5, 5.5), sway: rand(0, Math.PI * 2),
  };
}

function draw(ctx: CanvasRenderingContext2D, p: Particle, alpha: number) {
  const s = Math.cos(p.flip);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  if (p.kind === 'suit') {
    ctx.scale(1, Math.abs(s) * 0.7 + 0.3);
    ctx.fillStyle = '#f9f4ed';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-8, -10, 16, 20, 3);
    else ctx.rect(-8, -10, 16, 20);
    ctx.fill();
    ctx.fillStyle = SUIT_COLORS[p.suit];
    ctx.font = '700 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.suit, 0, 1);
  } else if (p.kind === 'dot') {
    ctx.fillStyle = p.c;
    ctx.beginPath();
    ctx.arc(0, 0, p.w * 0.4, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.kind === 'ribbon') {
    ctx.scale(1, s);
    ctx.strokeStyle = p.c;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.bezierCurveTo(-4, -8, 4, 8, 10, 0);
    ctx.stroke();
  } else {
    ctx.scale(1, s);
    ctx.fillStyle = p.c;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    if (s < 0) {
      ctx.fillStyle = 'rgba(0,0,0,.18)';
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    }
  }
  ctx.restore();
}

/** Full-screen confetti explosion that fires once when mounted. */
export function ConfettiBomb({ originRef, onBlast }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const onBlastRef = useRef(onBlast);
  useEffect(() => {
    onBlastRef.current = onBlast;
  }, [onBlast]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0;
    let H = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let parts: Particle[] = [];
    let drizzleUntil = 0;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      if (now < drizzleUntil && Math.random() < 0.5) {
        const p = make(rand(0, W), -20, rand(-30, 30), rand(60, 140));
        p.drag = 0.98;
        parts.push(p);
      }
      ctx.clearRect(0, 0, W, H);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life += dt;
        const k = Math.pow(p.drag, dt * 60);
        p.vx *= k;
        p.vy = Math.min(p.vy * k + GRAVITY * dt, 260 + p.h * 6);
        p.sway += dt * 3;
        p.x += (p.vx + Math.sin(p.sway) * 25) * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        p.flip += p.vf * dt;
        if (p.y > H + 30 || p.life > p.max + 2) {
          parts.splice(i, 1);
          continue;
        }
        draw(ctx, p, p.life > p.max ? 1 - (p.life - p.max) / 2 : 1);
      }
      if (parts.length || now < drizzleUntil) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, W, H);
    };

    const start = window.setTimeout(() => {
      if (reduce) {
        // Calm drizzle only: no flash, shake or explosion.
        parts = Array.from({ length: 60 }, () => make(rand(0, W), rand(-H, 0), 0, rand(40, 120)));
      } else {
        const rect = originRef?.current?.getBoundingClientRect();
        const cx = rect ? rect.left + rect.width / 2 : W / 2;
        const cy = rect ? rect.top + rect.height / 2 : H * 0.3;
        if (flashRef.current) {
          flashRef.current.style.background = `radial-gradient(circle at ${cx}px ${cy}px, rgba(255,245,210,.95), rgba(255,200,120,.35) 160px, transparent 380px)`;
          flashRef.current.classList.add('kol-flash');
        }
        onBlastRef.current?.();
        for (let i = 0; i < COUNT; i++) {
          const a = rand(0, Math.PI * 2);
          const sp = Math.pow(Math.random(), 0.5) * rand(700, 1300);
          parts.push(make(cx + rand(-6, 6), cy + rand(-6, 6), Math.cos(a) * sp, Math.sin(a) * sp - 250));
        }
        drizzleUntil = performance.now() + DRIZZLE_MS;
      }
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }, 250);

    return () => {
      window.clearTimeout(start);
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [originRef]);

  return (
    <>
      <div ref={flashRef} aria-hidden className="fixed inset-0 pointer-events-none z-40 opacity-0" />
      <canvas ref={canvasRef} aria-hidden className="fixed inset-0 w-full h-full pointer-events-none z-50" />
    </>
  );
}
