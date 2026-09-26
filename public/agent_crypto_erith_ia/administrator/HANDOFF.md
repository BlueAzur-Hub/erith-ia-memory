# Agent-Crypto — Handoff Seven → Sœur IA

État comportemental corrigé : **Decision Board continuity fix 40.6.414** sur la branche de finalisation.
Base UI encore publiée en **40.6.413** tant que `index.html` et `build.json` ne sont pas finalisés.

## Diagnostic acquis

- Le split 40.6.413 a innocenté les cinq secondaires ciblés : leur eval réelle est courte.
- Les freezes coïncident avec plusieurs rendus `renderDecisionBoard()` d'environ 1,2–1,3 s.
- Cause certaine : le gate 40.6.412 utilisait un test exact `activeBuild === "40.6.412"`; en 40.6.413 il se désactivait.
- `app.js` a été corrigé pour garder le coalescing actif sur les builds `40.6.x >= 412`.

## Atlas

Le dump ne prouve pas deux lancements du même CURRENT.
Il montre un CURRENT restauré puis, plus tard, un **NOUVEAU CURRENT FERMÉ** sur un snapshot canonique ultérieur.
Conserver le mécanisme N+1 tant qu'un doublon de `marketId/fingerprint` identique n'est pas prouvé.

## À finaliser

1. Corriger le drapeau diagnostic dupliqué dans `js/post-boot-runtime-loader.js`.
2. Passer `build.json` à 40.6.414.
3. Passer `index.html` à 40.6.414 et charger `js/decision-board-continuity-probe-406414.js`.
4. Créer `index-40.6.414.html`.
5. Vérifier Firefox : `DECISION BOARD CONTINUITY · 40.6.414` → active YES, errors 0.
6. Livrer un ZIP PATCH-ONLY, jamais l'archive complète du dépôt.

## Protections

Market Core 38.15.11, Strategy métier, Aether métier, Atlas CURRENT métier, Oracle, Math et Lecture Technique restent protégés.
