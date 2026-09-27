# Agent-Crypto 40.6.447 — STRATEGY HUMAN READABILITY

## Pourquoi cette version existe
La dette n'est pas nouvelle : le Fil Crypto avait déjà fixé une règle simple — à 100 % dans Firefox, chaque phrase doit être lisible sans zoom. Strategy a pourtant réaccumulé des libellés à 7–10 px et des grilles trop compactes.

## Correction
- couche canonique `strategy-human-readability.css`, nom stable et non versionné ;
- texte courant : 13 px ;
- libellés techniques : 12,5 px minimum ;
- valeurs : 14 px ;
- titres : 16 à 18 px ;
- boutons : 13 px, hauteur minimale 38 px ;
- résumé 9 Gates : 3 colonnes au lieu de 9 sur grand écran, texte autorisé à revenir à la ligne ;
- Cost-Wait : 3 colonnes ;
- Oracle/Cost : 2 colonnes ;
- grilles After-Cost / Evidence / Replay / Paper V2 / TRADUS décompressées ;
- aucune information supprimée ou cachée.

Quatre propriétaires qui forçaient encore des boutons microscopiques avec des déclarations prioritaires sont corrigés à la source :
- `strategy-a-execution-cost-truth.js`
- `strategy-a-paper-lifecycle.js`
- `strategy-a-replay.js`
- `strategy-a-g3-prospective-t0-capture.js`

## Tests avant commit
- CSS : aucune taille de texte définie sous 12,5 px ;
- CSS : aucune nouvelle déclaration prioritaire ;
- cascade locale : la couche canonique gagne contre les anciens styles 7–10 px même lorsqu'ils sont injectés après elle ;
- rendu représentatif local : PASS ;
- aucun changement de seuil, calcul, stockage, réseau, timer ou ordre d'exécution.

## Gel
40.6.441 Backend · 40.6.442 Graphique · 40.6.445 Oracle metrics · 40.6.446 loader Strategy · Market Core 38.15.11.
