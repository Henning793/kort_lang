# Spillbordet

Installerbar PWA for poengtelling i kort- og terningspill. Appen åpner på en startside med
alle spillene, og hvert spill lagrer sitt eget pågående spill.

- **Kort og lang**: se `design/design_handoff_kort_og_lang/README.md` for regler og design.
- **Femkamp**: 5 runder, 3–8 spillere, færrest poeng vinner. Regler og poeng ligger i
  `src/femkamp/rules.ts` og `src/femkamp/logic.ts`.

## Tester

```bash
npx tsx src/game/logic.test.ts
npx tsx src/femkamp/logic.test.ts
```

## Utvikling

```bash
npm install
npm run dev
```

## Bygg

```bash
npm run build
```

Produserer en `dist/`-mappe klar for statisk hosting (Netlify, se `netlify.toml`).

## Stack

Vite, React, TypeScript, Tailwind CSS v4, Zustand (localStorage-persistens), vite-plugin-pwa, lucide-react.
