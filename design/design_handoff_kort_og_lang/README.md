# Handoff: "Kort og lang" poengtellings-app (PWA)

## Overview
A mobile-first, installable PWA for tracking scores in the card game "Kort og lang". Used by a group sitting around a table passing one phone around. 7 fixed rounds, variable number of players (2–8), lowest total score wins. Language: Norwegian (all copy in the app is Norwegian and should stay Norwegian).

## About the Design Files
The file `Kort og lang - design reference.html` is a **design reference built in HTML** (a "Design Component" from the design tool) — it shows the intended look, content, layout and interaction behavior. It is not production code to copy verbatim. It is a self-contained template format (`{{ }}` bindings, `<sc-if>`/`<sc-for>` control-flow tags, a custom logic-class syntax) specific to the design tool — do not try to run it as-is in a real app. **Recreate this design in the target codebase's existing environment** (React Native/Expo, React web, SwiftUI, native Android, etc. — whatever the project already uses; if no environment exists yet, React is a sensible default for a PWA). Read the HTML/CSS in the file to extract exact copy, layout, spacing and colors, and the description below to understand structure and state — then rebuild it idiomatically.

## Fidelity
**High-fidelity.** Colors, type, spacing and copy in the reference file are final. Recreate pixel-close using the design tokens below (or the attached `design-tokens.css`, which is the actual source-of-truth stylesheet the reference file loads).

## Design system
The design uses "Organic": a warm cream ground, terracotta primary accent, sage second accent, Caprasimo display headings over Figtree body text, heavily rounded corners (pills for buttons/inputs/tags, 24–28px radius for cards/dialogs). See `design-tokens.css` for the full token set (`:root` CSS variables) and component classes (`.btn`, `.input`, `.card`, `.table`, `.dialog`, `.seg`, `.tag`, `.nav`). Key tokens:

- Background: `#f5ead8` · Surface (cards/rows): `#ebddc5` · Text: `#201e1d`
- Accent (terracotta): `#c67139`, ramp 100→900 from `#fff2eb` to `#402310`
- Accent-2 (sage): `#7a8a5e`, ramp 100→900 from `#f0fae1` to `#272e1b`
- Heading font: Caprasimo (Google Font) · Body font: Figtree (Google Font)
- Radius: buttons/inputs/tags = pill (999px); cards/dialogs ≈ 28–32px
- Icons: simple stroke icons, stroke-width 2.75, terracotta color for the recurring "dealer" card icon

## Game rules (must be implemented exactly)
- 7 fixed rounds, in this order, never changing:
  1. kort + kort
  2. kort + lang
  3. lang + lang
  4. kort + kort + kort
  5. kort + kort + lang
  6. kort + lang + lang
  7. lang + lang + lang
- Any number of players, 2–8, set once at setup (cannot add/remove players after the game starts).
- Each player gets a score every round. After round 7, total scores are summed. **Lowest total wins.**
- Ties: players with equal totals share the same rank (e.g. two players both show "1." if tied for lowest).
- Dealer ("stokker"): rotates one player per round, in player-list order, wrapping around. `dealerIndex = roundIndex % numberOfPlayers` (0-based round index). The dealer is marked with a small card icon.
- Scores may be negative (some rounds/bonuses might warrant it) — the UI supports a sign toggle; this can be a config flag (`allowNegativeScores`, default true).

## Screens / Views

### 1. Setup ("Oppsett")
**Purpose:** add players before starting.
- Title "Kort og lang" with a small card icon (terracotta, stroke 2.75) next to it, Caprasimo 28px.
- Short instruction paragraph under the title (see exact copy in the HTML file).
- A vertical list of player rows, one per player:
  - A small circular number badge (sage-tinted, 30px) showing the player's order number (1, 2, 3…).
  - A text input (pill, `.input` style) with placeholder "Spiller N", bound to the player's name.
  - A secondary icon button (X icon) to remove that player, disabled when only 2 players remain (minimum 2).
- "Legg til spiller" button below the list — dashed secondary button with a "+" icon, full width, disabled once 8 players are reached (maximum 8).
- Primary "Start spill" button, full width, large (14px padding, 17px font).
- A small info box (surface-tinted, rounded) below, restating the 7 rounds and the "lowest score wins" rule.
- On start: any blank name defaults to "Spiller N" (its 1-based position). Game moves to round 1.

### 2. Play — Poeng tab ("Skriv poeng")
**Purpose:** enter every player's score for the current round, all at once, no per-player modal (this was a deliberate design decision — see "Design decision" note below).
- Top nav bar: brand mark (card icon + "Kort og lang", Caprasimo 17px) left, ghost "Nytt spill" button right (opens a confirm dialog, resets everything).
- Round header: "Runde N av 7" (N large, "av 7" small/muted).
- A row of 7 thin pill segments (progress dots), one per round: sage-filled for completed rounds, terracotta-filled for the current round, neutral-outline for future rounds.
- A round-type indicator: 2–3 small vertical card-shaped chips (18px wide, terracotta-tinted, height varies — "kort" chips are short/26px tall, "lang" chips are tall/44px tall, bottom-aligned, small gap between them) next to the round's text label (e.g. "kort + kort + kort"), inside a surface-tinted rounded row.
- A segmented control (`.seg`, 2 options) to switch between "Poeng" and "Stilling" tabs.
- **Score entry list:** one row per player, all visible at once (no scrolling required for typical group sizes), surface-tinted rounded rows:
  - Left: player name (Caprasimo 15px). If this player is the current round's dealer, a small card icon is overlaid **rotated 30° clockwise, positioned just above and slightly to the right of the last letter of the name** (absolutely positioned relative to the name, `top:-9px; right:-9px`) — a playful touch, not an inline icon with a gap.
  - Right: a small pill numeric input (`.input`, ~68px wide, centered text, bold, `inputmode="numeric"` so mobile shows the numeric keyboard), pre-filled with the player's existing score for this round if any.
- A single primary "Lagre runde" button (full width) at the bottom saves all entered values for every player in one action and advances to the next round. On round 7 this button reads "Se sluttresultat" and instead navigates to the Result screen. Blank fields save as 0.

**Design decision (important context):** an earlier iteration used a big "one player at a time" calculator-style number pad that pushed the row list down and required scrolling with more players. It was replaced with this always-visible, per-row numeric input approach specifically to avoid scrolling on a phone with many players. Do not reintroduce a full-screen number pad as the primary entry method.

### 3. Play — Stilling tab ("Løpende poengoversikt")
**Purpose:** show running standings while playing, and allow correcting a mistake from an earlier round.
- Same top nav + round header + seg control as the Poeng tab (same screen, different tab).
- A table (`.table` styling: uppercase muted small headers, hairline row dividers) with columns: Plass (rank) / Spiller (name) / Poeng (total, right-aligned, bold).
  - Sorted ascending by total (lowest first = current leader).
  - Tied totals share the same rank label.
  - The current round's dealer gets the same rotated card-icon treatment next to their name (same absolute positioning trick as above).
  - Tapping a row expands a detail card below the table.
- **Expanded detail card** (surface-tinted, rounded): "{Name} — poeng per runde", listing all 7 rounds with a round label and that round's score (or "–" if not yet played). Rounds already played show a small pencil icon and are tappable to edit.
- **Edit dialog:** tapping a played round opens a modal (`.dialog-backdrop` + `.dialog`) titled "Rediger runde N" with the player's name, a big numeric display, a 4×3 calculator keypad (digits 1–9, ±, 0, backspace), and Avbryt/Bekreft actions. Confirming overwrites that round's score for that player. This is the one place a full keypad modal is appropriate — it's a rare, deliberate action, not the primary fast-entry flow.

### 4. Result ("Sluttresultat")
**Purpose:** clear winner announcement once all 7 rounds are done.
- Top nav (brand only, no "Nytt spill" button here — it's below instead).
- Winner hero card (surface-tinted, rounded, pop-in scale animation on entry): a trophy/award icon, "Vinner" kicker label (small, uppercase, terracotta), winner's name in large Caprasimo (joins multiple names with " og " on a tie), and their total point count as a subtitle. Optional small floating "confetti" dots (a handful of small circles in accent colors, gentle floating animation) — controllable via a `winnerEffect` flag (`confetti` | `none`).
- Full standings table below, same styling as the Stilling tab table, static (no row interaction needed here).
- Primary "Nytt spill" button, full width, at the bottom — opens the same reset-confirm dialog as elsewhere.

### Shared: New game confirmation dialog
Triggered from the "Nytt spill" ghost button (play screens) or button (result screen). Standard `.dialog`: title "Start nytt spill?", body warning that all players and scores will be cleared and this can't be undone, Avbryt / "Start nytt" actions. Confirming clears all state and returns to Setup with 2 blank player slots.

## Interactions & Behavior summary
- All primary actions (start game, save round, confirm edit, confirm new game) are single full-width buttons at the natural bottom of their context — no floating action buttons.
- Destructive/irreversible actions (new game) always go through a confirm dialog.
- Editing a past round's score always goes through a confirm dialog (open the edit modal, review, tap "Bekreft").
- No animations beyond: winner-card pop-in on the Result screen, and optional gentle floating confetti dots.
- Numeric inputs should bring up the device's numeric keyboard (`inputmode="numeric"`).

## State management
Suggested state shape:
```
players: [{ id, name }]              // order matters — it drives dealer rotation
scores: { [playerId]: number[7] }    // null/undefined = not yet entered
round: number                        // 0-based, 0..6
screen: 'setup' | 'play' | 'result'
```
Derived (not stored): `dealerIndex = round % players.length`; per-player total = sum of that player's 7 scores (treat unset as 0 for a running total mid-game); standings = players sorted ascending by total with shared ranks for ties; winner(s) = the rank-1 player(s) once round 7 is saved.

**Persistence:** the whole state above should auto-save (e.g. to local storage / device storage) so the game survives an accidental page reload or app switch mid-game, and reloads back into the same round/screen.

## Design tokens
See attached `design-tokens.css` for the authoritative values (this is the real stylesheet used to build the reference). Highlights already summarized above under "Design system".

## Assets
No photographs or external images are used. All icons are simple inline stroke SVGs (stroke-width 2.75, currentColor/terracotta) — recreate them with any icon set the target codebase already uses (Lucide icons were used as the visual reference: a stacked-cards icon for "dealer", an award/ribbon icon for the winner screen, plus/x icons on the setup screen).

## Files in this bundle
- `Kort og lang - design reference.html` — the full interactive design reference (open in a browser to click through every screen and state).
- `design-tokens.css` — the design system stylesheet (CSS variables + component classes) the reference file is built on.
