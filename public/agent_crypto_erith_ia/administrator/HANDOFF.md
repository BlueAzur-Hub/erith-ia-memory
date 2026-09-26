# Agent-Crypto — Handoff Seven

Build **40.6.422 — AETHER 12/12 BATCH TRUTH**  
Parent **40.6.421** · Market Core **38.15.11**.

## P0 courant
Aether affichait 3–4 News, pouvait répéter les mêmes histoires, puis laisser une bande vide avant le retour du menu.

## Cause isolée
1. le CSS possédait la cadence 270 s ;
2. JS possédait l'avance News ;
3. `document.hidden` faisait jeter des pulses JS ;
4. `aetherVeilleEvents()` était recalculé à chaque avance : l'index pointait une liste mouvante.

## 40.6.422
- lot 12 identités figé par fenêtre VEILLE ;
- pas de wrap dans le lot ;
- cadence entière pause quand l'onglet est caché ;
- reprise au même point ;
- diagnostics batch + violation flag.

Owners :
- `administrator/js/aether.js`
- `administrator/admin-ribbons.css`

## Protégé
News collector / Taxonomy 40.6.421 · Market Core 38.15.11 · Oracle · LT · Atlas CURRENT · Strategy/TRADUS · Storage.

## Test
Firefox :
**1/12 → … → 12/12 → SYSTEM → menu**, sans blackout.
Tester aussi un aller-retour vers un autre onglet pendant VEILLE.

## Suite
Si PASS :
**40.6.423 Storyline Clustering / Diversity**.
