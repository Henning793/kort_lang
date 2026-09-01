# Kort og lang PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an installable, offline-capable PWA in React+Vite+TS for tracking scores in the Norwegian card game "Kort og lang", matching `design/design_handoff_kort_og_lang/` pixel-for-pixel in tokens/copy and byte-for-byte in game logic.

**Architecture:** Single-page app, no router (screen switching driven by Zustand state: `setup | play | result`). One Zustand store (persisted to localStorage) holds all game state; derived values (dealer index, totals, standings, winners) are computed in pure selector functions, not stored. Tailwind is configured to consume the CSS custom properties already defined in `design-tokens.css` rather than duplicating hex values.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind CSS, Zustand (+ persist middleware), vite-plugin-pwa, lucide-react, Google Fonts (Caprasimo, Figtree).

**Spec:** `design/design_handoff_kort_og_lang/README.md` (source of truth for behavior/copy), `design/design_handoff_kort_og_lang/design-tokens.css` (source of truth for visual tokens), `design/design_handoff_kort_og_lang/Kort og lang - design reference.html` (source of truth for exact game logic — ranking/tie/dealer math is a direct, verified reference implementation in this file's `<script>` block).

## Global Constraints

- All UI copy is Norwegian, exactly matching the reference HTML strings (e.g. "Legg til spiller", "Start spill", "Nytt spill", "Rediger runde N", "Se sluttresultat").
- 7 rounds, fixed order, never reordered: kort+kort, kort+lang, lang+lang, kort+kort+kort, kort+kort+lang, kort+lang+lang, lang+lang+lang.
- Players: 2–8, fixed once game starts (no add/remove after `startGame`).
- `dealerIndex = round % players.length` (0-based round).
- Lowest total wins; ties share rank (dense ranking, matching reference `computeStandings`: rank increments only when total changes after sort).
- Blank score fields save as 0. Negative scores allowed (`allowNegativeScores` flag, default `true`).
- No full-screen calculator as the primary Poeng entry method — only used in the round-edit dialog from the Stilling tab.
- State persists across reload (localStorage) and resumes on the same screen/round.
- `npm run build` must succeed and produce `dist/`.

---

### Task 1: Scaffold project, install dependencies, base config

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `.gitignore`
- Create: `netlify.toml`

**Interfaces:**
- Produces: a running `npm run dev` Vite+React+TS app shell that later tasks fill in with `src/App.tsx` as the root component.

- [ ] **Step 1: Scaffold Vite React-TS app in repo root**

Run (repo root has no package.json yet, so scaffold into a temp dir and move contents in, since `design/` and `CLAUDE_CODE_PROMPT.md` already exist there):

```bash
npm create vite@latest . -- --template react-ts
```

If prompted about a non-empty directory, confirm proceeding (design/ and CLAUDE_CODE_PROMPT.md stay untouched).

- [ ] **Step 2: Install runtime and dev dependencies**

```bash
npm install zustand lucide-react
npm install -D tailwindcss postcss autoprefixer vite-plugin-pwa
npx tailwindcss init -p
```

- [ ] **Step 3: Verify base scaffold builds**

Run: `npm run build`
Expected: exits 0, `dist/` created.

- [ ] **Step 4: Add `netlify.toml`**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

- [ ] **Step 5: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold vite react-ts project with base deps"
```

---

### Task 2: Design tokens — CSS variables + Tailwind theme + fonts

**Files:**
- Create: `src/tokens.css` (verbatim `:root` variable block copied from `design/design_handoff_kort_og_lang/design-tokens.css`, plus the Google Fonts `@import`)
- Modify: `src/index.css` (import tokens.css, set body defaults, import component base styles)
- Modify: `tailwind.config.js` (map `theme.extend.colors`/`fontFamily`/`borderRadius` to the CSS variables)
- Modify: `index.html` (title "Kort og lang", `<meta name="theme-color" content="#c67139">`, viewport-fit=cover)

**Interfaces:**
- Produces: Tailwind utility classes `bg-bg`, `bg-surface`, `text-ink`, `bg-accent`, `bg-accent-2`, `text-accent`, `font-heading`, `font-body`, `rounded-pill`, `rounded-card`, usable by every later component.

- [ ] **Step 1: Copy the token `:root` block verbatim**

Create `src/tokens.css` with the exact `:root { ... }` block from `design-tokens.css` (all `--color-*`, `--font-*`, `--space-*`, `--radius-*`, `--shadow-*` variables) plus the Google Fonts `@import` line at the top. Do not modify values.

- [ ] **Step 2: Wire Tailwind config to the variables**

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        ink: 'var(--color-text)',
        divider: 'var(--color-divider)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          100: 'var(--color-accent-100)', 200: 'var(--color-accent-200)',
          300: 'var(--color-accent-300)', 400: 'var(--color-accent-400)',
          500: 'var(--color-accent-500)', 600: 'var(--color-accent-600)',
          700: 'var(--color-accent-700)', 800: 'var(--color-accent-800)',
          900: 'var(--color-accent-900)',
        },
        accent2: {
          DEFAULT: 'var(--color-accent-2)',
          100: 'var(--color-accent-2-100)', 200: 'var(--color-accent-2-200)',
          300: 'var(--color-accent-2-300)', 400: 'var(--color-accent-2-400)',
          500: 'var(--color-accent-2-500)', 600: 'var(--color-accent-2-600)',
          700: 'var(--color-accent-2-700)', 800: 'var(--color-accent-2-800)',
          900: 'var(--color-accent-2-900)',
        },
        neutral: {
          100: 'var(--color-neutral-100)', 200: 'var(--color-neutral-200)',
          300: 'var(--color-neutral-300)', 400: 'var(--color-neutral-400)',
          500: 'var(--color-neutral-500)', 600: 'var(--color-neutral-600)',
          700: 'var(--color-neutral-700)', 800: 'var(--color-neutral-800)',
          900: 'var(--color-neutral-900)',
        },
      },
      fontFamily: {
        heading: ['Caprasimo', 'system-ui', 'sans-serif'],
        body: ['Figtree', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        pill: '999px',
        card: 'var(--radius-lg)',
        md: 'var(--radius-md)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)', md: 'var(--shadow-md)', lg: 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 3: `src/index.css`**

```css
@import './tokens.css';
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root { height: 100%; }
body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  margin: 0;
}
h1, h2, h3, h4 { font-family: var(--font-heading); font-weight: 400; }

@keyframes kolFloat { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-12px) rotate(6deg); } }
@keyframes kolPop { 0% { transform: scale(.85); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
```

- [ ] **Step 4: Update `index.html` head**

Set `<title>Kort og lang</title>`, add `<meta name="theme-color" content="#c67139" />`, and viewport `width=device-width, initial-scale=1, viewport-fit=cover`.

- [ ] **Step 5: Verify build and visually spot-check**

Run: `npm run build` — expect exit 0.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: wire design tokens into tailwind config and base css"
```

---

### Task 3: Game domain types, round data, and pure logic (ranking/dealer/totals)

**Files:**
- Create: `src/game/types.ts`
- Create: `src/game/rounds.ts`
- Create: `src/game/logic.ts`
- Test: `src/game/logic.test.ts` (manual `console.assert` smoke script run via `node` is acceptable if no test runner is installed — see Step 2)

**Interfaces:**
- Produces:
  - `type Player = { id: string; name: string }`
  - `type Scores = Record<string, (number | null)[]>` (length-7 arrays)
  - `type Screen = 'setup' | 'play' | 'result'`
  - `ROUNDS: { label: string; combo: number[] }[]` (length 7, exact labels/heights from reference)
  - `dealerIndex(round: number, numPlayers: number): number`
  - `totalFor(scores: number[] | (number|null)[]): number`
  - `type StandingRow = { id: string; name: string; total: number; rank: number; rankLabel: string; isDealer: boolean }`
  - `computeStandings(players: Player[], scores: Scores, round: number): StandingRow[]`
  - `winnersOf(standings: StandingRow[]): StandingRow[]`

- [ ] **Step 1: Write `src/game/types.ts`**

```ts
export type Player = { id: string; name: string };
export type Scores = Record<string, (number | null)[]>;
export type Screen = 'setup' | 'play' | 'result';
export type Tab = 'poeng' | 'stilling';

export type StandingRow = {
  id: string;
  name: string;
  total: number;
  rank: number;
  rankLabel: string;
  isDealer: boolean;
};
```

- [ ] **Step 2: Write `src/game/rounds.ts`**

```ts
export type RoundDef = { label: string; combo: number[] };

export const ROUNDS: RoundDef[] = [
  { label: 'kort + kort', combo: [26, 26] },
  { label: 'kort + lang', combo: [26, 44] },
  { label: 'lang + lang', combo: [44, 44] },
  { label: 'kort + kort + kort', combo: [26, 26, 26] },
  { label: 'kort + kort + lang', combo: [26, 26, 44] },
  { label: 'kort + lang + lang', combo: [26, 44, 44] },
  { label: 'lang + lang + lang', combo: [44, 44, 44] },
];

export const NUM_ROUNDS = ROUNDS.length;
```

- [ ] **Step 3: Write `src/game/logic.ts`**

```ts
import type { Player, Scores, StandingRow } from './types';
import { NUM_ROUNDS } from './rounds';

export function dealerIndex(round: number, numPlayers: number): number {
  if (numPlayers <= 0) return 0;
  return round % numPlayers;
}

export function totalFor(playerScores: (number | null)[] | undefined): number {
  if (!playerScores) return 0;
  return playerScores.reduce((sum: number, v) => sum + (v || 0), 0);
}

export function emptyScoreRow(): (number | null)[] {
  return Array(NUM_ROUNDS).fill(null);
}

export function computeStandings(players: Player[], scores: Scores, round: number): StandingRow[] {
  const dIdx = dealerIndex(round, players.length);
  const totals = players.map((p, i) => ({
    id: p.id,
    name: p.name,
    isDealer: i === dIdx,
    total: totalFor(scores[p.id]),
  }));
  const sorted = [...totals].sort((a, b) => a.total - b.total);
  let rank = 0;
  let lastTotal: number | null = null;
  const result: StandingRow[] = sorted.map((r, i) => {
    if (lastTotal === null || r.total !== lastTotal) {
      rank = i + 1;
      lastTotal = r.total;
    }
    return { ...r, rank, rankLabel: rank + '.' };
  });
  return result;
}

export function winnersOf(standings: StandingRow[]): StandingRow[] {
  return standings.filter((s) => s.rank === 1);
}
```

- [ ] **Step 4: Write a smoke-test script and run it with `node` (no test runner configured yet)**

Create `src/game/logic.test.ts`:

```ts
import { dealerIndex, computeStandings, winnersOf, totalFor } from './logic';
import type { Player, Scores } from './types';

// dealer rotation wraps
console.assert(dealerIndex(0, 3) === 0, 'dealer round0');
console.assert(dealerIndex(2, 3) === 2, 'dealer round2');
console.assert(dealerIndex(3, 3) === 0, 'dealer wraps');

// totals treat null as 0
console.assert(totalFor([1, null, 3]) === 4, 'total skips null');
console.assert(totalFor(undefined) === 0, 'total undefined is 0');

// tie handling: two players tied for lowest share rank 1
const players: Player[] = [
  { id: 'a', name: 'A' },
  { id: 'b', name: 'B' },
  { id: 'c', name: 'C' },
];
const scores: Scores = {
  a: [5, null, null, null, null, null, null],
  b: [5, null, null, null, null, null, null],
  c: [9, null, null, null, null, null, null],
};
const standings = computeStandings(players, scores, 0);
console.assert(standings.find((s) => s.id === 'a')!.rank === 1, 'a rank 1');
console.assert(standings.find((s) => s.id === 'b')!.rank === 1, 'b rank 1');
console.assert(standings.find((s) => s.id === 'c')!.rank === 3, 'c rank 3 (dense skip)');

const winners = winnersOf(standings);
console.assert(winners.length === 2, 'two winners on tie');

console.log('All logic smoke assertions passed.');
```

Run: `npx tsx src/game/logic.test.ts` (install `tsx` as a dev dependency first: `npm install -D tsx`)
Expected output: `All logic smoke assertions passed.` with no assertion failure messages printed above it.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add game domain types, round data, and ranking logic with smoke test"
```

---

### Task 4: Zustand store with persist middleware

**Files:**
- Create: `src/store/gameStore.ts`

**Interfaces:**
- Consumes: `Player`, `Scores`, `Screen`, `Tab` from `src/game/types.ts`; `emptyScoreRow`, `NUM_ROUNDS` from `src/game/rounds.ts`/`logic.ts`.
- Produces (the store's public shape, consumed by every screen component in later tasks):

```ts
type GameState = {
  screen: Screen;
  players: Player[];
  nextId: number;
  scores: Scores;
  round: number; // 0-based
  tab: Tab;
  addPlayer(): void;
  removePlayer(id: string): void;
  updateName(id: string, name: string): void;
  startGame(): void;
  setTab(tab: Tab): void;
  saveRound(draft: Record<string, string>): void;
  editScore(playerId: string, round: number, value: number): void;
  resetGame(): void;
};
```

- [ ] **Step 1: Write `src/store/gameStore.ts`**

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Player, Scores, Screen, Tab } from '../game/types';
import { emptyScoreRow } from '../game/logic';

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function initialPlayers(): Player[] {
  return [
    { id: makeId(), name: '' },
    { id: makeId(), name: '' },
  ];
}

function initialScores(players: Player[]): Scores {
  return players.reduce<Scores>((acc, p) => {
    acc[p.id] = emptyScoreRow();
    return acc;
  }, {});
}

type GameState = {
  screen: Screen;
  players: Player[];
  scores: Scores;
  round: number;
  tab: Tab;
  addPlayer: () => void;
  removePlayer: (id: string) => void;
  updateName: (id: string, name: string) => void;
  startGame: () => void;
  setTab: (tab: Tab) => void;
  saveRound: (draft: Record<string, string>) => void;
  editScore: (playerId: string, round: number, value: number) => void;
  resetGame: () => void;
};

const initPlayers = initialPlayers();

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      screen: 'setup',
      players: initPlayers,
      scores: initialScores(initPlayers),
      round: 0,
      tab: 'poeng',

      addPlayer: () =>
        set((s) => {
          if (s.players.length >= 8) return {};
          const id = makeId();
          return {
            players: [...s.players, { id, name: '' }],
            scores: { ...s.scores, [id]: emptyScoreRow() },
          };
        }),

      removePlayer: (id) =>
        set((s) => {
          if (s.players.length <= 2) return {};
          const scores = { ...s.scores };
          delete scores[id];
          return { players: s.players.filter((p) => p.id !== id), scores };
        }),

      updateName: (id, name) =>
        set((s) => ({
          players: s.players.map((p) => (p.id === id ? { ...p, name } : p)),
        })),

      startGame: () =>
        set((s) => ({
          players: s.players.map((p, i) => ({
            ...p,
            name: p.name.trim() ? p.name.trim() : `Spiller ${i + 1}`,
          })),
          screen: 'play',
          round: 0,
          tab: 'poeng',
        })),

      setTab: (tab) => set({ tab }),

      saveRound: (draft) =>
        set((s) => {
          const newScores: Scores = { ...s.scores };
          s.players.forEach((p) => {
            const raw = draft[p.id];
            const val = raw === undefined || raw === '' || raw === '-' ? 0 : parseInt(raw, 10);
            newScores[p.id] = s.scores[p.id].map((v, i) => (i === s.round ? val : v));
          });
          if (s.round < 6) {
            return { scores: newScores, round: s.round + 1 };
          }
          return { scores: newScores, screen: 'result' as Screen };
        }),

      editScore: (playerId, round, value) =>
        set((s) => ({
          scores: {
            ...s.scores,
            [playerId]: s.scores[playerId].map((v, i) => (i === round ? value : v)),
          },
        })),

      resetGame: () => {
        const players = initialPlayers();
        set({
          screen: 'setup',
          players,
          scores: initialScores(players),
          round: 0,
          tab: 'poeng',
        });
      },
    }),
    { name: 'kol_state' }
  )
);

export function currentDraftFor(playerId: string, round: number, scores: Scores): string {
  const v = scores[playerId]?.[round];
  return v != null ? String(v) : '';
}
```

Note: `get` is unused in the body above — remove the unused parameter from the `create<GameState>()((set, get) => ...)` signature (use `(set) => ...`) to avoid a TS/lint unused-var error.

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add zustand game store with localStorage persistence"
```

---

### Task 5: Shared UI primitives (Button, Input, Dialog, CardIcon, dealer badge)

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/Dialog.tsx`
- Create: `src/components/ui/CardIcon.tsx` (the recurring stacked-card dealer icon, via `lucide-react`'s `Layers` or a custom inline SVG matching the reference path exactly — use the reference's exact SVG path since it's a specific two-rect card-stack icon, not a stock Lucide glyph)
- Create: `src/components/DealerMark.tsx` (absolutely-positioned, rotated 30°, top:-9px/right:-9px badge, per README §2/§3)

**Interfaces:**
- Produces: `<Button variant="primary"|"secondary"|"ghost"|"icon" block? disabled?>`, `<Input .../>` (thin wrapper applying `.input`-equivalent Tailwind classes, forwards all native input props), `<Dialog open title actions>children</Dialog>`, `<CardIcon size color />`, `<DealerMark small? />`.

- [ ] **Step 1: `src/components/ui/CardIcon.tsx`**

Reproduce the exact reference SVG (a rounded rect plus a second card peeking out top-right):

```tsx
type Props = { size?: number; className?: string; color?: string };

export function CardIcon({ size = 18, className, color = '#c67139' }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={2.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="6" width="14" height="14" rx="3" />
      <path d="M7 6V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    </svg>
  );
}
```

- [ ] **Step 2: `src/components/DealerMark.tsx`**

```tsx
import { CardIcon } from './ui/CardIcon';

export function DealerMark({ size = 14 }: { size?: number }) {
  return (
    <CardIcon
      size={size}
      className="absolute rotate-[30deg]"
      color="#c67139"
    />
  );
}
```

Usage note for consumers: wrap the player name in `<span className="relative inline-block font-heading">{name}<DealerMark ... /></span>` and set `style={{ top: -9, right: -9 }}` (Poeng tab, 14px icon) or `{ top: -8, right: -8 }` (Stilling tab, 13px icon) inline on the `DealerMark`'s wrapper via a `style` prop — extend `DealerMark` to accept `style?: React.CSSProperties` and pass it through to the `<CardIcon>`'s wrapping span. Revise `DealerMark` to:

```tsx
import { CardIcon } from './ui/CardIcon';
import type { CSSProperties } from 'react';

export function DealerMark({ size = 14, style }: { size?: number; style?: CSSProperties }) {
  return (
    <span className="absolute rotate-[30deg]" style={style}>
      <CardIcon size={size} color="#c67139" />
    </span>
  );
}
```

- [ ] **Step 3: `src/components/ui/Button.tsx`**

```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'icon';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  block?: boolean;
  children: ReactNode;
};

const base =
  'inline-flex items-center justify-center gap-1.5 font-heading text-sm leading-tight rounded-md disabled:opacity-45 disabled:cursor-not-allowed transition-colors';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-accent text-bg px-4 py-2 hover:bg-accent-600 active:bg-accent-700 rounded-pill',
  secondary: 'border border-divider px-4 py-2 hover:bg-black/5 active:bg-black/10 rounded-pill',
  ghost: 'text-accent px-1 hover:bg-accent-100 active:bg-accent-200 rounded-md',
  icon: 'border border-divider w-9 h-9 p-0 rounded-pill',
};

export function Button({ variant = 'primary', block, className = '', children, ...rest }: Props) {
  return (
    <button
      className={`${base} ${variantClasses[variant]} ${block ? 'w-full mt-2' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 4: `src/components/ui/Input.tsx`**

```tsx
import type { InputHTMLAttributes } from 'react';

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full min-h-9 px-3.5 py-1.5 text-sm text-ink bg-surface border border-divider rounded-pill focus-visible:outline-2 focus-visible:outline-accent ${className}`}
      {...rest}
    />
  );
}
```

- [ ] **Step 5: `src/components/ui/Dialog.tsx`**

```tsx
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
```

- [ ] **Step 6: Verify compile**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add shared UI primitives (button, input, dialog, dealer mark)"
```

---

### Task 6: NewGameDialog (shared confirm dialog)

**Files:**
- Create: `src/components/NewGameDialog.tsx`

**Interfaces:**
- Consumes: `Dialog`, `Button` from Task 5; `useGameStore` (`resetGame`) from Task 4.
- Produces: `<NewGameDialog open onCancel={...} />` — a self-contained confirm dialog; the "Start nytt" action calls `resetGame()` then `onCancel()` to close.

- [ ] **Step 1: Write the component**

```tsx
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { useGameStore } from '../store/gameStore';

type Props = { open: boolean; onClose: () => void };

export function NewGameDialog({ open, onClose }: Props) {
  const resetGame = useGameStore((s) => s.resetGame);

  return (
    <Dialog
      open={open}
      title="Start nytt spill?"
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            Avbryt
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              resetGame();
              onClose();
            }}
          >
            Start nytt
          </Button>
        </>
      }
    >
      <div className="text-sm opacity-85">
        Dette nullstiller alle spillere og poeng. Du kan ikke angre dette.
      </div>
    </Dialog>
  );
}
```

- [ ] **Step 2: Verify compile**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add shared new-game confirmation dialog"
```

---

### Task 7: Setup screen

**Files:**
- Create: `src/screens/SetupScreen.tsx`

**Interfaces:**
- Consumes: `useGameStore` (`players`, `addPlayer`, `removePlayer`, `updateName`, `startGame`), `Input`, `Button` from prior tasks, `CardIcon`, `Plus`/`X` icons from `lucide-react` (X for remove is used from the reference's inline SVG style — reuse a simple `X` from lucide-react since it matches; `Plus` from lucide-react for add).
- Produces: `<SetupScreen />`, rendered by `App.tsx` when `screen === 'setup'`.

- [ ] **Step 1: Write the component**

```tsx
import { Plus, X } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CardIcon } from '../components/ui/CardIcon';

export function SetupScreen() {
  const players = useGameStore((s) => s.players);
  const addPlayer = useGameStore((s) => s.addPlayer);
  const removePlayer = useGameStore((s) => s.removePlayer);
  const updateName = useGameStore((s) => s.updateName);
  const startGame = useGameStore((s) => s.startGame);

  const canAdd = players.length < 8;
  const canRemove = players.length > 2;

  return (
    <div className="px-5 pt-7 pb-10 flex flex-col gap-6">
      <div className="flex items-center gap-2.5">
        <CardIcon size={26} />
        <h1 className="text-[28px] m-0">Kort og lang</h1>
      </div>

      <p className="m-0 opacity-75 text-sm">
        Legg til spillerne som skal være med. Du kan endre navn, men ikke antall spillere etter at
        spillet er startet.
      </p>

      <div className="flex flex-col gap-2.5">
        {players.map((p, i) => (
          <div key={p.id} className="flex items-center gap-2.5">
            <div className="w-[30px] h-[30px] flex-none rounded-full bg-accent2-100 text-accent2-800 flex items-center justify-center font-heading text-[13px]">
              {i + 1}
            </div>
            <Input
              placeholder={`Spiller ${i + 1}`}
              value={p.name}
              onChange={(e) => updateName(p.id, e.target.value)}
              className="flex-1"
            />
            <Button
              variant="icon"
              onClick={() => removePlayer(p.id)}
              disabled={!canRemove}
              aria-label="Fjern spiller"
            >
              <X size={16} strokeWidth={2.75} />
            </Button>
          </div>
        ))}
      </div>

      <Button variant="secondary" block onClick={addPlayer} disabled={!canAdd} className="border-dashed">
        <Plus size={16} strokeWidth={2.75} />
        Legg til spiller
      </Button>

      <div className="mt-2">
        <Button variant="primary" block onClick={startGame} className="text-[17px] p-3.5">
          Start spill
        </Button>
      </div>

      <div className="mt-2 px-4 py-3.5 bg-surface rounded-card text-[12.5px] opacity-80">
        7 runder: kort+kort · kort+lang · lang+lang · kort+kort+kort · kort+kort+lang · kort+lang+lang
        · lang+lang+lang. Færrest poeng vinner.
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify compile**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: implement setup screen"
```

---

### Task 8: Play screen shell (nav, round header, progress dots, round-type chips, tab switcher)

**Files:**
- Create: `src/screens/PlayScreen.tsx` (shell only; renders `PoengTab` / `StillingTab` from Tasks 9–10 based on store `tab`)
- Create: `src/components/RoundProgressDots.tsx`
- Create: `src/components/RoundTypeChips.tsx`
- Create: `src/components/TabSwitcher.tsx`

**Interfaces:**
- Consumes: `ROUNDS` from `src/game/rounds.ts`, `useGameStore` (`round`, `tab`, `setTab`), `CardIcon`, `Button`, `NewGameDialog`.
- Produces: `<PlayScreen />`; `<RoundProgressDots current={round} />`; `<RoundTypeChips combo={number[]} />`; `<TabSwitcher tab={Tab} onChange={(t: Tab) => void} />`.

- [ ] **Step 1: `src/components/RoundProgressDots.tsx`**

```tsx
import { ROUNDS } from '../game/rounds';

export function RoundProgressDots({ current }: { current: number }) {
  return (
    <div className="flex gap-1.5 mb-3">
      {ROUNDS.map((_, i) => {
        const bg =
          i < current ? 'bg-accent2-500' : i === current ? 'bg-accent-500' : 'bg-neutral-300';
        return <div key={i} className={`flex-1 h-1.5 rounded-pill ${bg}`} />;
      })}
    </div>
  );
}
```

- [ ] **Step 2: `src/components/RoundTypeChips.tsx`**

```tsx
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
```

- [ ] **Step 3: `src/components/TabSwitcher.tsx`**

```tsx
import type { Tab } from '../game/types';

export function TabSwitcher({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="inline-flex overflow-hidden border border-divider rounded-pill self-start">
      {(['poeng', 'stilling'] as Tab[]).map((t) => (
        <label
          key={t}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] cursor-pointer ${
            tab === t ? 'bg-accent text-bg' : 'hover:bg-black/5'
          }`}
        >
          <input
            type="radio"
            name="tab"
            className="sr-only"
            checked={tab === t}
            onChange={() => onChange(t)}
          />
          {t === 'poeng' ? 'Poeng' : 'Stilling'}
        </label>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: `src/screens/PlayScreen.tsx`**

```tsx
import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { ROUNDS } from '../game/rounds';
import { CardIcon } from '../components/ui/CardIcon';
import { Button } from '../components/ui/Button';
import { RoundProgressDots } from '../components/RoundProgressDots';
import { RoundTypeChips } from '../components/RoundTypeChips';
import { TabSwitcher } from '../components/TabSwitcher';
import { NewGameDialog } from '../components/NewGameDialog';
import { PoengTab } from './PoengTab';
import { StillingTab } from './StillingTab';

export function PlayScreen() {
  const round = useGameStore((s) => s.round);
  const tab = useGameStore((s) => s.tab);
  const setTab = useGameStore((s) => s.setTab);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const roundDef = ROUNDS[round] ?? ROUNDS[0];

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center gap-4 px-5 pt-4 pb-2">
        <div className="flex items-center gap-2 font-heading text-[17px] mr-auto">
          <CardIcon size={18} />
          Kort og lang
        </div>
        <Button variant="ghost" onClick={() => setConfirmOpen(true)}>
          Nytt spill
        </Button>
      </div>

      <div className="px-5 pt-1 pb-3.5">
        <h2 className="m-0 mb-2.5 text-[23px]">
          Runde {round + 1} <span className="font-body text-sm opacity-50">av 7</span>
        </h2>
        <RoundProgressDots current={round} />
        <RoundTypeChips combo={roundDef.combo} label={roundDef.label} />
      </div>

      <div className="mx-5 mb-4">
        <TabSwitcher tab={tab} onChange={setTab} />
      </div>

      {tab === 'poeng' ? <PoengTab /> : <StillingTab />}

      <NewGameDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} />
    </div>
  );
}
```

- [ ] **Step 5: Verify compile (will fail until Tasks 9–10 add `PoengTab`/`StillingTab` — stub them minimally for now)**

Create placeholder `src/screens/PoengTab.tsx` and `src/screens/StillingTab.tsx` exporting empty `<div />` components so the build is green; Tasks 9 and 10 replace their contents.

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: implement play screen shell with round header and tab switcher"
```

---

### Task 9: Poeng tab (score entry)

**Files:**
- Modify: `src/screens/PoengTab.tsx` (replace placeholder)

**Interfaces:**
- Consumes: `useGameStore` (`players`, `round`, `scores`, `saveRound`), `dealerIndex` from `src/game/logic.ts`, `DealerMark`, `Button`.
- Local component state: `draft: Record<string, string>` initialized from current round's scores each time `round` changes.

- [ ] **Step 1: Write the component**

```tsx
import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { dealerIndex } from '../game/logic';
import { DealerMark } from '../components/DealerMark';
import { Button } from '../components/ui/Button';

function buildDraft(round: number, players: { id: string }[], scores: Record<string, (number | null)[]>) {
  const draft: Record<string, string> = {};
  players.forEach((p) => {
    const v = scores[p.id]?.[round];
    draft[p.id] = v != null ? String(v) : '';
  });
  return draft;
}

export function PoengTab() {
  const players = useGameStore((s) => s.players);
  const round = useGameStore((s) => s.round);
  const scores = useGameStore((s) => s.scores);
  const saveRound = useGameStore((s) => s.saveRound);

  const [draft, setDraft] = useState<Record<string, string>>(() => buildDraft(round, players, scores));

  useEffect(() => {
    setDraft(buildDraft(round, players, scores));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const dIdx = dealerIndex(round, players.length);

  function updateDraft(id: string, raw: string) {
    let v = raw.replace(/[^0-9-]/g, '');
    const neg = v.startsWith('-');
    v = v.replace(/-/g, '');
    if (v.length > 4) v = v.slice(0, 4);
    v = (neg ? '-' : '') + v;
    setDraft((d) => ({ ...d, [id]: v }));
  }

  function handleSave() {
    saveRound(draft);
  }

  const finishLabel = round === 6 ? 'Se sluttresultat' : 'Lagre runde';

  return (
    <div className="px-5 pb-7 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {players.map((p, i) => (
          <div
            key={p.id}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-card bg-surface"
          >
            <span className="relative inline-block font-heading text-[15px]">
              {p.name}
              {i === dIdx && <DealerMark size={14} style={{ top: -9, right: -9 }} />}
            </span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={draft[p.id] ?? ''}
              onChange={(e) => updateDraft(p.id, e.target.value)}
              className="w-[68px] text-center py-2 px-1.5 text-base font-bold bg-bg border border-divider rounded-pill"
            />
          </div>
        ))}
      </div>

      <Button variant="primary" block onClick={handleSave} className="text-base p-3.5">
        {finishLabel}
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Verify compile**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Manual check**

Run: `npm run dev`, open the app, add 3 players, start game, enter scores for round 1, save, confirm round advances to 2 and the dealer badge moves to the next player.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: implement poeng (score entry) tab"
```

---

### Task 10: Stilling tab (standings table, expandable row, edit dialog)

**Files:**
- Modify: `src/screens/StillingTab.tsx` (replace placeholder)
- Create: `src/components/EditScoreDialog.tsx`

**Interfaces:**
- Consumes: `computeStandings` from `src/game/logic.ts`, `ROUNDS` from `src/game/rounds.ts`, `useGameStore` (`players`, `scores`, `round`, `editScore`), `DealerMark`, `Dialog`, `Button`.
- `EditScoreDialog` props: `{ open: boolean; playerId: string | null; playerName: string; round: number; onClose: () => void }` — manages its own keypad-buffer state (`editPad: string`), commits via `editScore` on confirm.

- [ ] **Step 1: `src/components/EditScoreDialog.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { useGameStore } from '../store/gameStore';

type Props = {
  open: boolean;
  playerId: string | null;
  playerName: string;
  round: number;
  onClose: () => void;
};

export function EditScoreDialog({ open, playerId, playerName, round, onClose }: Props) {
  const scores = useGameStore((s) => s.scores);
  const editScore = useGameStore((s) => s.editScore);
  const [pad, setPad] = useState('');

  useEffect(() => {
    if (open && playerId != null) {
      const existing = scores[playerId]?.[round];
      setPad(existing != null ? String(existing) : '');
    }
  }, [open, playerId, round, scores]);

  if (!open || playerId == null) return null;

  function pressDigit(d: number) {
    setPad((p) => (p.replace('-', '').length >= 4 ? p : p + String(d)));
  }
  function backspace() {
    setPad((p) => p.slice(0, -1));
  }
  function toggleSign() {
    setPad((p) => (p.startsWith('-') ? p.slice(1) : '-' + p));
  }

  const empty = pad === '' || pad === '-';

  function confirm() {
    if (empty || playerId == null) return;
    editScore(playerId, round, parseInt(pad, 10));
    onClose();
  }

  return (
    <Dialog
      open={open}
      title={`Rediger runde ${round + 1}`}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            Avbryt
          </Button>
          <Button variant="primary" onClick={confirm} disabled={empty}>
            Bekreft
          </Button>
        </>
      }
    >
      <div className="text-sm opacity-85">{playerName}</div>
      <div className="bg-bg rounded-md p-3.5 text-center font-heading text-3xl">
        {pad === '' ? '0' : pad}
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <Button key={n} variant="secondary" onClick={() => pressDigit(n)} className="text-lg py-3.5">
            {n}
          </Button>
        ))}
        <Button variant="secondary" onClick={toggleSign} className="text-lg py-3.5">
          ±
        </Button>
        <Button variant="secondary" onClick={() => pressDigit(0)} className="text-lg py-3.5">
          0
        </Button>
        <Button variant="secondary" onClick={backspace} className="text-lg py-3.5">
          ⌫
        </Button>
      </div>
    </Dialog>
  );
}
```

- [ ] **Step 2: `src/screens/StillingTab.tsx`**

```tsx
import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { computeStandings } from '../game/logic';
import { ROUNDS } from '../game/rounds';
import { DealerMark } from '../components/DealerMark';
import { EditScoreDialog } from '../components/EditScoreDialog';
import { Pencil } from 'lucide-react';

export function StillingTab() {
  const players = useGameStore((s) => s.players);
  const scores = useGameStore((s) => s.scores);
  const round = useGameStore((s) => s.round);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<{ playerId: string; round: number } | null>(null);

  const standings = computeStandings(players, scores, round);
  const expandedPlayer = players.find((p) => p.id === expandedId) ?? null;

  return (
    <div className="px-5 pb-7 flex flex-col gap-4">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="text-left text-[11px] tracking-wider uppercase opacity-60 py-2 border-b border-divider">
              Plass
            </th>
            <th className="text-left text-[11px] tracking-wider uppercase opacity-60 py-2 border-b border-divider">
              Spiller
            </th>
            <th className="text-right text-[11px] tracking-wider uppercase opacity-60 py-2 border-b border-divider">
              Poeng
            </th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s) => (
            <tr
              key={s.id}
              className="cursor-pointer hover:bg-black/5"
              onClick={() => setExpandedId((cur) => (cur === s.id ? null : s.id))}
            >
              <td className="font-heading py-2 border-b border-black/10">{s.rankLabel}</td>
              <td className="py-2 border-b border-black/10">
                <span className="relative inline-block">
                  {s.name}
                  {s.isDealer && <DealerMark size={13} style={{ top: -8, right: -8 }} />}
                </span>
              </td>
              <td className="text-right font-bold py-2 border-b border-black/10">{s.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {expandedPlayer && (
        <div className="bg-surface rounded-card p-4 flex flex-col gap-2">
          <div className="font-heading text-base">{expandedPlayer.name} — poeng per runde</div>
          {ROUNDS.map((r, i) => {
            const v = scores[expandedPlayer.id]?.[i];
            const played = v != null;
            return (
              <div
                key={i}
                onClick={() => played && setEditTarget({ playerId: expandedPlayer.id, round: i })}
                className="flex justify-between items-center py-2 px-1 border-b border-divider"
                style={{ cursor: played ? 'pointer' : 'default' }}
              >
                <span className="text-[13px] opacity-75">
                  Runde {i + 1}: {r.label}
                </span>
                <span className="flex items-center gap-1.5 font-bold">
                  {played ? String(v) : '–'}
                  {played && <Pencil size={13} strokeWidth={2.75} className="opacity-50" />}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <EditScoreDialog
        open={editTarget != null}
        playerId={editTarget?.playerId ?? null}
        playerName={players.find((p) => p.id === editTarget?.playerId)?.name ?? ''}
        round={editTarget?.round ?? 0}
        onClose={() => setEditTarget(null)}
      />
    </div>
  );
}
```

- [ ] **Step 3: Verify compile**

Run: `npx tsc --noEmit`

- [ ] **Step 4: Manual check**

`npm run dev` — with a game in progress, switch to Stilling tab, confirm sorted-ascending order, shared rank on tie (temporarily enter equal scores for two players to verify), tap a row to expand, tap a played round to open the edit dialog, edit a value and confirm it updates the table.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: implement stilling tab with expandable rows and edit dialog"
```

---

### Task 11: Result screen

**Files:**
- Create: `src/screens/ResultScreen.tsx`

**Interfaces:**
- Consumes: `computeStandings`, `winnersOf` from `src/game/logic.ts` (call with `round = NUM_ROUNDS - 1`, i.e. `6`), `useGameStore` (`players`, `scores`), `CardIcon`, `NewGameDialog`.

- [ ] **Step 1: Write the component**

```tsx
import { useState } from 'react';
import { Award } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { computeStandings, winnersOf } from '../game/logic';
import { CardIcon } from '../components/ui/CardIcon';
import { Button } from '../components/ui/Button';
import { NewGameDialog } from '../components/NewGameDialog';

export function ResultScreen() {
  const players = useGameStore((s) => s.players);
  const scores = useGameStore((s) => s.scores);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const standings = computeStandings(players, scores, 6);
  const winners = winnersOf(standings);
  const winnerNames = winners.map((w) => w.name).join(' og ');
  const winnerTotalLabel = winners.length
    ? `${winners[0].total} poeng${winners.length > 1 ? ' (delt seier)' : ''}`
    : '';

  return (
    <div className="flex flex-col flex-1 pb-7">
      <div className="flex items-center gap-4 px-5 pt-4">
        <div className="flex items-center gap-2 font-heading text-[17px]">
          <CardIcon size={18} />
          Kort og lang
        </div>
      </div>

      <div className="relative m-5 mb-2 p-9 px-6 rounded-card bg-surface text-center overflow-visible animate-[kolPop_0.5s_ease]">
        <div
          className="absolute rounded-full bg-accent-400"
          style={{ top: -8, left: 14, width: 16, height: 16, animation: 'kolFloat 3.2s ease-in-out infinite' }}
        />
        <div
          className="absolute rounded-full bg-accent2-400"
          style={{ top: 6, right: 22, width: 12, height: 12, animation: 'kolFloat 2.6s ease-in-out infinite .3s' }}
        />
        <div
          className="absolute rounded-full bg-accent2-300"
          style={{ bottom: 10, left: 30, width: 10, height: 10, animation: 'kolFloat 3.6s ease-in-out infinite .6s' }}
        />
        <div
          className="absolute rounded-full bg-accent-300"
          style={{ top: -12, right: 60, width: 9, height: 9, animation: 'kolFloat 2.9s ease-in-out infinite .15s' }}
        />

        <Award size={40} color="#c67139" strokeWidth={2.75} className="mx-auto mb-2" />
        <div className="text-[10px] tracking-[0.1em] uppercase text-accent mb-1">Vinner</div>
        <h1 className="m-0 mb-1.5 text-[30px]">{winnerNames}</h1>
        <div className="opacity-70 text-sm">{winnerTotalLabel}</div>
      </div>

      <div className="px-5 pt-2">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="text-left text-[11px] tracking-wider uppercase opacity-60 py-2 border-b border-divider">
                Plass
              </th>
              <th className="text-left text-[11px] tracking-wider uppercase opacity-60 py-2 border-b border-divider">
                Spiller
              </th>
              <th className="text-right text-[11px] tracking-wider uppercase opacity-60 py-2 border-b border-divider">
                Poeng
              </th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s) => (
              <tr key={s.id}>
                <td className="font-heading py-2 border-b border-black/10">{s.rankLabel}</td>
                <td className="py-2 border-b border-black/10">{s.name}</td>
                <td className="text-right font-bold py-2 border-b border-black/10">{s.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 pt-6 mt-auto">
        <Button variant="primary" block onClick={() => setConfirmOpen(true)} className="text-base p-3.5">
          Nytt spill
        </Button>
      </div>

      <NewGameDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} />
    </div>
  );
}
```

- [ ] **Step 2: Verify compile**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: implement result screen with winner hero and confetti"
```

---

### Task 12: Wire up App.tsx (screen switching)

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useGameStore` (`screen`), `SetupScreen`, `PlayScreen`, `ResultScreen`.

- [ ] **Step 1: Write `src/App.tsx`**

```tsx
import { useGameStore } from './store/gameStore';
import { SetupScreen } from './screens/SetupScreen';
import { PlayScreen } from './screens/PlayScreen';
import { ResultScreen } from './screens/ResultScreen';

export default function App() {
  const screen = useGameStore((s) => s.screen);

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <div className="max-w-[480px] w-full mx-auto flex-1 flex flex-col min-h-screen">
        {screen === 'setup' && <SetupScreen />}
        {screen === 'play' && <PlayScreen />}
        {screen === 'result' && <ResultScreen />}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `src/main.tsx` sanity check**

Confirm it renders `<App />` inside `<React.StrictMode>` and imports `./index.css`. Adjust if Vite's scaffold used different naming.

- [ ] **Step 3: Full manual walkthrough**

Run: `npm run dev`. Walk through: Setup → add 4 players → Start spill → enter scores for all 7 rounds (Poeng tab) → verify round labels/chips match the fixed order in Global Constraints → verify Stilling tab standings/ranks/dealer badge each round → reach Result screen → verify winner name(s) and total → click Nytt spill → confirm dialog → confirm reset returns to Setup with 2 blank players.

- [ ] **Step 4: Reload persistence check**

Mid-game (e.g. round 4), reload the browser tab. Confirm the app resumes on the same round/screen with prior scores intact.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: wire up screen switching in App"
```

---

### Task 13: PWA manifest, icons, and service worker

**Files:**
- Modify: `vite.config.ts` (add `VitePWA` plugin)
- Create: `public/icon-192.png`, `public/icon-512.png` (simple generated icons — terracotta background `#c67139` with a light card glyph, or solid-color placeholder if no image tooling is available; must be valid PNGs at the stated sizes)
- Modify: `index.html` (link manifest is auto-injected by the plugin in dev; verify no manual `<link rel="manifest">` conflicts)

**Interfaces:**
- Produces: an installable PWA (Add to Home Screen works) with a manifest named "Kort og lang", `theme_color`/`background_color` set to the token values, and offline caching of the built assets.

- [ ] **Step 1: Configure `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Kort og lang',
        short_name: 'Kort og lang',
        description: 'Poengtelling for kortspillet Kort og lang',
        theme_color: '#c67139',
        background_color: '#f5ead8',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
});
```

- [ ] **Step 2: Generate the two icon PNGs**

Use a small Node script with an inline PNG encoder is overkill — instead generate them via a quick Node canvas-free approach: write a minimal script using the `sharp`-free technique of drawing an SVG and rasterizing is unnecessary complexity for a placeholder. Simplest reliable path: create the icons as flat terracotta squares.

Run (Node, no extra deps — writes a raw PNG using a tiny hand-rolled encoder is error-prone; instead use `npx` a pre-existing icon generator if available, or fall back to a single-color PNG produced with the `canvas`-less method below):

```bash
node -e "
const fs = require('fs');
const zlib = require('zlib');
function makePng(size, color) {
  const [r,g,b] = color;
  const raw = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 3);
    raw[rowStart] = 0;
    for (let x = 0; x < size; x++) {
      const px = rowStart + 1 + x * 3;
      raw[px] = r; raw[px+1] = g; raw[px+2] = b;
    }
  }
  const idat = zlib.deflateSync(raw);
  function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type);
    const crc = Buffer.alloc(4);
    const crc32 = require('zlib').crc32 ? null : null;
    const crcTable = (() => {
      let c, table = [];
      for (let n = 0; n < 256; n++) {
        c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[n] = c;
      }
      return table;
    })();
    function crc32calc(buf) {
      let c = 0xffffffff;
      for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
      return (c ^ 0xffffffff) >>> 0;
    }
    const crcVal = crc32calc(Buffer.concat([typeBuf, data]));
    crc.writeUInt32BE(crcVal, 0);
    return Buffer.concat([len, typeBuf, data, crc]);
  }
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8]=8; ihdr[9]=2; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0;
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}
fs.writeFileSync('public/icon-192.png', makePng(192, [198,113,57]));
fs.writeFileSync('public/icon-512.png', makePng(512, [198,113,57]));
console.log('icons written');
"
```

Expected: `icons written`, and `public/icon-192.png` / `public/icon-512.png` exist as valid flat-terracotta PNGs (`#c67139` = rgb(198,113,57)).

- [ ] **Step 3: Verify build produces manifest and service worker**

Run: `npm run build`
Expected: `dist/manifest.webmanifest` (or similar) and `dist/sw.js` exist alongside `dist/index.html`.

Run: `ls dist` — confirm the service worker and manifest files are present.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: configure PWA manifest, icons, and service worker"
```

---

### Task 14: Final build verification and README note

**Files:**
- No new files required; this task only verifies.

- [ ] **Step 1: Full typecheck and build**

```bash
npx tsc --noEmit
npm run build
```

Expected: both exit 0.

- [ ] **Step 2: Re-run the logic smoke test**

```bash
npx tsx src/game/logic.test.ts
```

Expected: `All logic smoke assertions passed.`

- [ ] **Step 3: Manual screen-by-screen comparison against `design/design_handoff_kort_og_lang/screenshots/`**

Run `npm run dev`, open each screen/state, and compare against `01-01-setup.png`, `01-shot.png`, `02-01-setup.png`, `02-shot.png`, `03-shot.png`, `04-shot.png`, `05-shot.png`, `06-shot.png`, `07-shot.png` for color, spacing, and copy fidelity. Note and fix any visible discrepancy before considering the task done.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final verification pass"
```
