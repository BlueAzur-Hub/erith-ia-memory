# Seven Heaven Strategy Lab — Help Layer V1 global

## But

Un seul bouton `?` global, placé dans l’en-tête du Lab, active une aide contextuelle non bloquante sur l’ensemble de l’application.

## Couverture

- en-tête, navigation et Observatoire ;
- Navigateur guidé, bibliothèques de marchés et stratégies ;
- Knowledge Layer ;
- sources et provenance ;
- Atelier, paramètres, profils et StrategySpec ;
- simulation PAPER et résultats ;
- Microscope, Quant et Forensics ;
- Comparateur ;
- Aether Scientific ;
- Aether Research ;
- Coffre local et relecture des rapports.

## Contrat

- présentation uniquement ;
- aucun `fetch`, stockage ou endpoint métier dans `lab-help-layer.js` ;
- aucun changement de `src/engine.py` ;
- second clic sur `?` ou `Échap` ferme l’aide ;
- les éléments dynamiques sont résolus par délégation au survol/focus ;
- les assets Help/CSS portent un identifiant de build dans l’URL afin d’éviter un mélange de cache entre deux DEV.
