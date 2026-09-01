# Kort og lang

Installerbar PWA for poengtelling i kortspillet "Kort og lang". Se
`design/design_handoff_kort_og_lang/README.md` for spillregler og designspesifikasjon.

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
