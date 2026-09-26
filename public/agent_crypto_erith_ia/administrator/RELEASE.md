# Agent-Crypto — Aether True Late Load

Build **40.6.416** · parent **40.6.415** · rollback **40.6.415** · Market Core **38.15.11**.

## Intention unique

Corriger uniquement l'ordre de chargement Aether.

Le Fil Crypto demandait la priorité suivante :

1. prix / Livecheck ;
2. Market ;
3. Graphique ;
4. Math Core ;
5. seulement ensuite Aether.

La 40.6.415 gardait encore `aether.js` dans le stack parser direct puis tentait de contrôler ses réveils. La 40.6.416 retire cette résidence précoce.

## Correction

- suppression du `<script src="./js/aether.js">` parser-résident ;
- `consultation-first-406286.js` devient le propriétaire automatique unique du chargement `aether.js` ;
- chargement automatique après `consultation-ready` ;
- fallback borné existant conservé ;
- hover/focus ne peuvent plus charger Aether prématurément ;
- clic explicite opérateur conservé ;
- les marques `aether-script-before` / `aether-script-after` sont désormais émises au vrai moment du chargement dynamique ;
- le gate `POSTBOOT_READY_ONLY` introduit en 40.6.415 est retiré : il n'a plus de raison d'exister si Aether n'est plus chargé trop tôt ;
- Celestial / visibilité réutilisent simplement Aether s'il existe déjà ; avant son chargement, leurs appels sont des no-op.

## Ce qui ne change pas

- contenu du Fil Aether ;
- News Sentinel ;
- traduction FR/EN ;
- ranking / sélection des News ;
- Aether métier ;
- Market Core 38.15.11 ;
- Graphique ;
- Math Core ;
- Atlas / CURRENT ;
- Oracle ;
- Strategy A / Paper / Gates ;
- Lecture Technique ;
- Storage / Shared Memory ;
- aucun ordre réel.

## Preuve statique

- `index.html` ne contient plus aucun chargement direct de `./js/aether.js` ;
- `consultation-first-406286.js` : syntaxe PASS ;
- `atlasDebtSettlementRuntime` : syntaxe PASS ;
- aucun nouveau timer récurrent ;
- aucun nouvel observer ;
- aucun nouveau fetch owner ;
- aucun nouveau fichier `index-40.6.416.html` n'est créé.

## Test Firefox

Ctrl+F5 → confirmer **Build 40.6.416** → laisser le démarrage travailler → Rapport → Actualiser → Copier.

Le résultat attendu est simple :

- Market / Graphique / Market Snapshot / Math Core avant Aether ;
- `Aether script start` et `Aether script end` postérieurs à `Consultation prête` ;
- plus de chargement Aether à ~0,6 s ;
- plus de `aether-ready · reason=already-loaded` avant Consultation ;
- VEILLE apparaît seulement après le chargement tardif Aether.

## Stop point

Ne pas modifier encore le contenu News / français / rotation. D'abord valider l'ordre de chargement.
