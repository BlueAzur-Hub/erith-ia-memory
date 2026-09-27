# Agent-Crypto 40.6.442 — CHART FRAME 40.6.428 EXACT CSS RESTORE

## Objectif unique
Restaurer le cadrage Graphique validé en 40.6.428, perdu lors de la récupération 40.6.438.

## Restauration exacte
Dans le bloc canonique `.chart-shell` existant :

```css
height: clamp(525px, calc(61.5vh + 42px), 720px) !important;
min-height: 525px !important;
max-height: 720px !important;
```

Source : 40.6.428 · commit `46d273d05d36b654a76697be7564160e2faa73c5`.

## Protégé
Backend/API 40.6.441 reste validé et gelé.
Aucun code Backend, Source Truth, post-boot, app.js, Aether, Market Core, Oracle, Risk, Paper, Strategy ou Execution Cost Truth n'est modifié.
