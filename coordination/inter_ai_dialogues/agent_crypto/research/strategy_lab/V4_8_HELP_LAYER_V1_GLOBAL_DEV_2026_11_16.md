# Seven Heaven Strategy Lab — V4.8 Help Layer V1 global — DEV — 2026-11-16

## Objet

Étendre l'aide contextuelle validée après le correctif Step 4 à l'ensemble du Strategy Lab, sans modifier le moteur PAPER ni le gros runtime applicatif.

## Base exacte

Paquet parent validé visuellement dans Firefox :
`SEVEN_HEAVEN_STRATEGY_LAB_V4_8_KNOWLEDGE_LAYER_STEP4_UNIFIED_HELP_FIXED_DEV.zip`

SHA-256 parent :
`45637608b22e8767cb488f7cb293e03f9792e205c37c0d2708b6cc50c82ca047`

Le premier paquet Step 4 Action Help (`3bfaf427...`) reste rejeté : deux systèmes d'aide concurrents et validation DOM insuffisante.

## Help Layer V1 global

- un seul bouton `?` ;
- déclencheur déplacé dans l'en-tête global du Lab, à côté de BUILD / LOCAL / PAPER ONLY ;
- le mode Aide reste actif pendant la navigation dans la page ;
- second clic sur `?` ou `Échap` ferme l'aide ;
- une seule carte flottante non bloquante ;
- délégation au survol/focus pour les éléments dynamiques ;
- aucun petit bouton d'aide supplémentaire ajouté dans les sections.

## Couverture

Le Help Layer couvre désormais :

- en-tête et navigation ;
- Observatoire et lecture stratégique ;
- Navigateur guidé ;
- bibliothèque de marchés et choix d'une source ;
- bibliothèque de stratégies et Knowledge Layer ;
- Source active / provenance / collecte publique ;
- Atelier, timeframe, capital, frais, glissement et paramètres de stratégie ;
- profils et StrategySpec ;
- simulation PAPER ;
- résultats, rendement, drawdown, frais, inventaire et courbe de capital ;
- Microscope ;
- Quant / Profit Factor / réalisé-latent ;
- Forensics ;
- Comparateur et bouton Examiner ;
- Aether Scientific ;
- Aether Research ;
- Coffre local, anciens rapports et anciennes comparaisons.

## Isolation technique

`src/engine.py` est byte-identique au parent :
`f4de4a9cb8dbfd17a665785b6b06cfff3473039624457e721d3f3fd9e2aeb7c2`

`web/app.js` est byte-identique au parent :
`10c02e34e837f0e58d09fb35aa81c0e8d3bd27071396198840a70e5f20eafcbb`

Le Help Layer reste dans `web/lab-help-layer.js`, sans `fetch`, WebSocket, stockage, endpoint API ou logique financière propre.

Les URLs du CSS et du Help Layer portent un identifiant de build afin d'éviter qu'un cache Firefox mélange un HTML neuf avec un ancien JS/CSS.

## Validation

- 131 / 131 tests : PASS ;
- `node --check web/app.js` : PASS ;
- `node --check web/lab-help-layer.js` : PASS ;
- ZIP réextrait puis retesté : 131 / 131 PASS ;
- aucun `workspace/`, `__pycache__`, `.pyc` ou `.pyo` dans le ZIP ;
- le Chromium du conteneur bloque toujours localhost/file par politique administrateur : la réception Firefox propriétaire reste la preuve visuelle finale.

## Paquet DEV

`SEVEN_HEAVEN_STRATEGY_LAB_V4_8_HELP_LAYER_V1_GLOBAL_DEV.zip`

SHA-256 :
`3ff751bba56b84ebd2efa202a4df4beff19829968a5037a44159f7841ef50399`

## Gate suivant

Réception Firefox du propriétaire. Si le Help Layer global est lisible, non gênant et cohérent sur les grandes zones, considérer Help Layer V1 comme terminé avant de reprendre l'expansion scientifique du Lab.
