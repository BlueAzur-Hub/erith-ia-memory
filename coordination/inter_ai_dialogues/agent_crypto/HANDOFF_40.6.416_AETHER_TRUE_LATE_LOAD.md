# HANDOFF — Agent-Crypto 40.6.416 · Aether True Late Load

## But unique
Corriger l'ordre de chargement avant toute refonte du contenu Aether/News.

## Pourquoi
Le Fil Crypto voulait prix / Market / Graphique / Math Core d'abord, Aether ensuite. Pourtant 40.6.415 chargeait encore `aether.js` directement dans le parser puis essayait de bloquer ses réveils.

## Correction
- `index.html` ne charge plus directement `aether.js`.
- `consultation-first-406286.js` devient le propriétaire automatique du chargement.
- `aether.js?v=40.6.416` est ajouté dynamiquement après `consultation-ready` ou le fallback borné existant.
- hover/focus ne déclenchent plus Aether.
- clic opérateur explicite reste autorisé.
- le gate externe POSTBOOT_READY_ONLY de .415 est retiré.
- aucun changement News/FR/EN.

## Test
Ctrl+F5 → Build 40.6.416 → Rapport de démarrage.
Vérifier que `Consultation prête` précède `Aether script start/end` et que `Aether runtime` n'apparaît plus au début du parser.

## Stop
Après ce test seulement, reprendre le chantier News/Aether.
