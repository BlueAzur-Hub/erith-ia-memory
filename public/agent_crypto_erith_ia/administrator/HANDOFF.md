# Agent-Crypto — Handoff Seven

Build **40.6.424 — AETHER SINGLE PHASE OWNER**  
Parent **40.6.423** · Market Core **38.15.11**.

## Preuve terrain
40.6.423 : plusieurs News distinctes, mais ligne vide encore visible entre les phases et avant le retour menu.

## Root cause
Le bandeau avait encore plusieurs horloges CSS indépendantes + un ancien operator bridge capable de redémarrer les animations.

## 40.6.424
- phase time owner unique : `aether.js` ;
- CSS phase keyframes retirées ;
- cycle automatique : INFO 15 s → 12×18 s News → SYSTEM 9 s → INFO ;
- **plus de menu natif automatique** ;
- menu natif manuel seulement ;
- pause onglet + pause menu conservent le temps restant ;
- bridge .424 ne touche plus directement animation/opacité/visibilité et ne force plus de layout restart ;
- exposition Aether exige 12 News qualifiées.

## Nouveau timer
Un seul `setTimeout` auto-réarmé est introduit comme propriétaire de phase. Maximum : 1 pending. Aucun interval/observer/fetch/storage/order ajouté.

## Test
Firefox : **INFO → 1/12 → … → 12/12 → SYSTEM → INFO**, zéro ligne vide.
Changer d'onglet vers 4/12.
Tester menu manuel via ♥ VEILLE puis reprise via Aether ATTENTION.

## Protégé
Market Core · News collector/Taxonomy · Oracle · LT · Atlas CURRENT · Strategy/TRADUS · Storage.

## Suite
Si PASS : **40.6.425 Storyline Clustering / Diversity**.
