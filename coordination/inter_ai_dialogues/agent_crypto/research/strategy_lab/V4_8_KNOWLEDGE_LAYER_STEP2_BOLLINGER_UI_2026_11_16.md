# Seven Heaven Strategy Lab — V4.8 Knowledge Layer — Step 2 Bollinger + UI — 2026-11-16

## Objet

Deuxième étape après validation visuelle de la fiche EMA.

## Correctifs UI

- colonne d'action `Source active / Utiliser` réservée dans chaque ligne d'historique ;
- `scrollbar-gutter: stable` pour éviter que le scroll rogne les boutons ;
- tailles de texte du navigateur et des métadonnées augmentées ;
- alignements et densité de la Bibliothèque de marchés harmonisés ;
- aucun changement du moteur PAPER.

## Nouvelle fiche professionnelle : Bollinger

La Knowledge Layer couvre maintenant deux méthodes : EMA et Bandes de Bollinger.

La fiche Bollinger explique :

- moyenne centrale, bande haute, bande basse ;
- formule `SMA(N) ± k × sigma(N)` ;
- paramètres classiques `20 × 2` ;
- contraction/squeeze et expansion de volatilité ;
- `walking the band` et danger d'interpréter une touche de bande comme un retournement automatique ;
- forces et limites ;
- impact du timeframe ;
- règles exactes Seven : entrée si clôture sous bande basse, sortie si clôture au-dessus de la bande haute, fill PAPER à l'ouverture suivante ;
- lecture du backtest et références.

## Sources documentaires

- TradingView Help Center — Bollinger Bands (BB) ;
- Fidelity Learning Center — Bollinger Bands ;
- vérité locale : `src/engine.py`.

## Validation

- 123 tests : OK ;
- Knowledge catalog : 2 fiches (EMA + Bollinger) ;
- `node --check web/app.js` : OK ;
- `src/engine.py` inchangé.

SHA-256 moteur : `f4de4a9cb8dbfd17a665785b6b06cfff3473039624457e721d3f3fd9e2aeb7c2`

## Paquet de test du fil

`SEVEN_HEAVEN_STRATEGY_LAB_V4_8_KNOWLEDGE_LAYER_STEP2_DEV.zip`

SHA-256 : `969302db7f9bf059e2b6524f71afcf84951bee5ebaf821a0c80d570570ae41ba`

Le ZIP contient zéro `workspace/`, zéro `coordination/`, zéro `__pycache__` et zéro `.pyc`.

## Étape suivante prévue

Après contrôle Firefox : fiche professionnelle Donchian, en s'appuyant sur les nombreuses études Donchian déjà archivées dans le répertoire partagé, sans changer la règle native du moteur.
