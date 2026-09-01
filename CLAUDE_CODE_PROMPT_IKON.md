# Oppdrag: Sett opp app-ikon for "Kort og lang"

Det er lagt til ferdige app-ikonfiler i `design/design_handoff_kort_og_lang/icons/`. Implementer dem slik at appen får riktig ikon når den installeres på hjemskjermen (Android og iOS), i tillegg til favicon i nettleser.

## Filer som allerede finnes

- `icons/icon-source.svg` — vektorkilden (tre fanede kort i terracotta/sage/aprikos på kremhvit bunn, avrundede hjørner). Kun til referanse/fremtidig redigering, ikke i bruk i selve manifestet.
- `icons/icon-192.png` — 192×192, PWA-ikon (`purpose: any`).
- `icons/icon-512.png` — 512×512, PWA-ikon (`purpose: any`).
- `icons/icon-maskable-512.png` — 512×512, maskable-variant (motiv skalert til ~62% for Android sin adaptive-icon-maskering).
- `icons/apple-touch-icon-180.png` — 180×180, for iOS "Legg til på Hjem-skjerm".
- `icons/README.md` — kort dokumentasjon av filene og forventet manifest-oppsett.

## Oppgaver

1. Flytt/kopier de fire PNG-ikonfilene (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon-180.png`) fra `design/design_handoff_kort_og_lang/icons/` til prosjektets `public/icons/`-mappe (opprett mappen om den ikke finnes), slik at Vite kopierer dem uendret til build-output.
2. Konfigurer `vite-plugin-pwa` sin `manifest`-seksjon (i `vite.config.ts`) med:
   ```json
   {
     "icons": [
       { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
       { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
       { "src": "icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
     ]
   }
   ```
   Bruk `icon-512.png` også som utgangspunkt for `theme_color`/`background_color` om disse ikke allerede er satt fra design-tokens (`--color-bg: #f5ead8` som `background_color`, `--color-accent: #c67139` som `theme_color`).
3. Legg til i `index.html` sin `<head>`:
   ```html
   <link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png">
   <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png">
   ```
4. Sørg for at `name`/`short_name` i manifestet er "Kort og lang" (eller en kort variant om `short_name` bør være kortere, f.eks. "Kort og lang").
5. Bygg prosjektet (`npm run build`) og verifiser at ikonene havner i `dist/icons/` og at `manifest.webmanifest` (generert av vite-plugin-pwa) refererer til dem med riktige stier.
6. Verifiser visuelt (f.eks. ved å installere PWA-en i en mobil nettleser, eller ved å inspisere de genererte ikonfilene) at ikonet vises korrekt både i vanlig og maskable form, samt som iOS-hjemskjermikon og som favicon.

## Ikke gjør

- Ikke regenerer eller endre selve ikonbildene — de er allerede ferdig eksportert i riktige størrelser og med riktig sikkerhetsmargin for maskable-varianten.
- Ikke legg `icon-source.svg` inn i manifestet — den er bare kildefil, ikke en av de bruksklare ikon-størrelsene.
