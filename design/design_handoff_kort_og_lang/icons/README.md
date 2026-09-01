# App-ikon

Valgt design: tre fanede kort (kremhvit/aprikos, terracotta, sage), på kremhvit bakgrunn — fra `design-tokens.css`.

## Filer
- `icon-source.svg` — vektorkilde (100×100 viewBox), rediger denne og re-eksporter ved behov.
- `icon-192.png`, `icon-512.png` — standard PWA-ikoner (med avrundede hjørner bakt inn i bildet).
- `apple-touch-icon-180.png` — for iOS home screen.
- `icon-maskable-512.png` — "maskable" variant: bakgrunnen fyller hele kanten, motivet er skalert ned til innenfor det trygge området (~62%) slik at Android ikke klipper det når den runder av selv.

## manifest.json snutt
```json
{
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```
Legg også til i `<head>`:
```html
<link rel="apple-touch-icon" href="icons/apple-touch-icon-180.png">
```
