# Agent-Crypto 40.6.451 — EXECUTION COST TABLE LAYOUT FIX

## Objet unique
Corriger le chevauchement central des en-têtes de tableaux Kraken / OKX observé après la validation terrain 40.6.450.

## Cause prouvée
Le CSS global Administrator impose encore :
```css
table { min-width: 790px; }
```
Chaque carte Execution Cost n'offre qu'environ 745 px dans la géométrie opérateur montrée. Le tableau dépasse donc physiquement sa carte et son dernier en-tête traverse la séparation centrale.

## Correction
Dans le propriétaire de présentation Strategy existant `strategy-human-readability.css` uniquement :
- `min-width:0` local sur le tableau Execution Cost ;
- `max-width:100%` ;
- `table-layout:fixed` ;
- retour à la ligne autorisé dans TH/TD ;
- colonnes 18 / 24 / 24 / 34 % ;
- carte en containment visuel.

Le contrat global des autres tableaux reste intact.

## Test avant commit
Chromium headless à viewport 1644×920 sur DOM représentatif :
- baseline : carte 745 px, tableau 790 px, débordement **68 px** ;
- candidat : tableau 721 px, débordement **0 px**.

Receipt : `EXECUTION_COST_TABLE_LAYOUT_TEST_40.6.451.json`.

## Protégé
40.6.450 freshness PASS terrain · 40.6.449 lisibilité · 40.6.448 HTML · 40.6.446 loader · Backend .441 · Graphique .442 · Oracle .445 · Market Core 38.15.11 · Aether.

Aucun JS modifié.
