# Oppdrag: Bygg "Kort og lang" poengtellings-app

Du skal sette opp prosjektstrukturen fra bunnen av og bygge en installerbar PWA for poengtelling i kortspillet "Kort og lang", basert på en ferdig designspesifikasjon som ligger i dette repoet.

## Design-referanse (LES DENNE FØRST)

Hele designet er allerede spesifisert i mappen `design/design_handoff_kort_og_lang/`:

- `README.md` — den fullstendige spesifikasjonen: spillregler, skjermer, state-modell, interaksjoner. **Dette er kilden til sannhet for funksjonalitet og innhold.** Les den i sin helhet før du begynner å kode.
- `design-tokens.css` — fasit for farger, typografi, spacing, radius og komponent-klasser (`.btn`, `.input`, `.card`, `.table`, `.dialog`, `.seg`, `.tag`, `.nav`).
- `Kort og lang - design reference.html` — en interaktiv design-referanse (åpne i nettleser for å klikke gjennom alle skjermer/tilstander). Dette er IKKE produksjonskode — det er bygget i et proprietært template-format (`{{ }}`, `<sc-if>`, `<sc-for>`) fra designverktøyet og skal ikke kopieres direkte. Bruk den til å lese av eksakt kopi/tekst, layout, spacing og farger, og gjenskap dette idiomatisk i den valgte stacken.
- `screenshots/` — skjermbilder av hver skjerm, til visuell referanse.

Følg spesifikasjonen i README.md nøyaktig, spesielt:
- De 7 faste rundene og rekkefølgen (kort+kort, kort+lang, lang+lang, kort+kort+kort, kort+kort+lang, kort+lang+lang, lang+lang+lang) — aldri endre denne rekkefølgen.
- Laveste totalsum vinner; delt plassering ved likt poengtall.
- Stokke-rotasjon: `dealerIndex = roundIndex % antallSpillere`, markert med et lite kort-ikon (se README for eksakt plassering/rotasjon på navn).
- Poengregistrering skjer som én rad per spiller, alle synlige samtidig (ikke ett-og-ett-spiller-modal/kalkulator som primærflyt) — det var et bevisst designvalg for å unngå scrolling.
- All UI-tekst er på norsk.

## Teknologistack

- **React + Vite + TypeScript**
- **Tailwind CSS** for styling — sett opp Tailwind slik at design-tokens fra `design-tokens.css` (farger, radius, fonter) gjenspeiles i Tailwind-konfigen (f.eks. som `theme.extend` med CSS-variabler), fremfor å hardkode hex-verdier rundt om i komponentene.
- **vite-plugin-pwa** for installerbarhet (Add to Home Screen på iOS/Android) og offline-støtte via service worker.
- **Zustand** med en persist-middleware mot `localStorage` for spilltilstand — appen skal kunne lukkes og gjenåpnes senere og fortsette samme spill.
- Fontene **Caprasimo** (overskrifter) og **Figtree** (brødtekst) fra Google Fonts, slik `design-tokens.css` allerede refererer til dem.
- Ikoner: bruk **Lucide** (`lucide-react`) — det var visuell referanse i designet (stablede kort for "dealer", pokal/ribbon for vinner-skjermen, pluss/x på oppsett-skjermen).
- Ingen backend, ingen database — ren klient-app.

## State-modell (fra spesifikasjonen)

```ts
players: { id: string; name: string }[]      // rekkefølge styrer stokke-rotasjon
scores: Record<playerId, (number | null)[7]> // null/undefined = ikke registrert ennå
round: number                                  // 0-basert, 0..6
screen: 'setup' | 'play' | 'result'
```

Avledet (ikke lagret): `dealerIndex = round % players.length`; totalsum per spiller (uregistrert = 0 i løpende sum); stilling = spillere sortert stigende på totalsum med delt rangering ved likt; vinner(e) = spiller(e) med rang 1 når runde 7 er lagret.

## Skjermer som skal implementeres

1. **Oppsett** — legg til/fjern spillere (2–8), navn/initialer, "Start spill".
2. **Spill → Poeng** — registrer poeng for alle spillere for gjeldende runde i én operasjon, rundeindikator, fremdriftsprikker for de 7 rundene, runde-type vist med kort/lang-chips, stokker markert med kort-ikon.
3. **Spill → Stilling** — løpende poengoversikt (tabell), rangering med delt plassering ved likt, ekspanderbar rad per spiller som viser poeng per runde, redigering av tidligere runder via modal med talltastatur.
4. **Sluttresultat** — vinner-visning (håndterer uavgjort), full sluttabell, "Nytt spill".
5. **Delt "Nytt spill"-bekreftelsesdialog** — nullstiller alt, tilgjengelig fra Spill- og Sluttresultat-skjermene.

Se README.md for fullstendige detaljer per skjerm (eksakt kopi, layout, tilstander).

## Netlify-oppsett

- Legg til `netlify.toml` med riktig build-kommando (`npm run build`) og publish-mappe (`dist`) for et Vite-prosjekt.
- Sørg for at PWA-manifest og service worker fungerer i en statisk Netlify-deploy.
- Prosjektet skal kunne kobles til GitHub → Netlify for automatisk deploy ved push til main, men du trenger ikke sette opp selve GitHub/Netlify-koblingen — bare sørge for at prosjektet er byggbart og deploy-klart.

## Oppgaver

1. Sett opp et nytt Vite + React + TypeScript-prosjekt i repoets rot.
2. Installer og konfigurer Tailwind CSS, vite-plugin-pwa, Zustand, lucide-react.
3. Sett opp design-tokens (farger, fonter, radius) fra `design-tokens.css` i Tailwind-config/CSS-variabler.
4. Bygg state store (Zustand + persist) etter state-modellen over.
5. Implementer de 5 skjermene/dialogene i README.md, mobil-first, med korrekt spilllogikk (runder, stokke-rotasjon, poengsummering, rangering med delt plassering).
6. Sett opp PWA-manifest (navn, ikoner, theme-color fra tokens) og service worker.
7. Legg til `netlify.toml`.
8. Verifiser: `npm run build` går uten feil, og gå gjennom alle skjermene manuelt (eller med en enkel smoke-test) og sammenlign mot skjermbildene i `screenshots/`.

## Definition of done

- `npm run dev` viser en fungerende app som følger flyten Oppsett → 7 runder poengregistrering → Sluttresultat.
- Data overlever en sideoppdatering/lukking av appen (localStorage-persistens).
- Visuelt tett opptil design-referansen (farger, fonter, radius, spacing, kopi).
- `npm run build` produserer en `dist/`-mappe klar for Netlify-deploy.
- All UI-tekst er på norsk.
