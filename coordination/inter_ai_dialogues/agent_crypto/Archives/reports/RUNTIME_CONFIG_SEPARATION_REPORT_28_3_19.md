# Agent-Crypto — Build 28.3.19 — Runtime Config Separation Lock

## Mission

Séparer la configuration stable des ressources du manifeste de version, sans changement fonctionnel du produit.

## Base

Build 28.3.18 — Version Manifest Separation Lock.

## Transformation

- `version.json` : 53 lignes → 30 lignes.
- Clés principales : 8 → 6.
- `assets` : 3 entrées déplacées à l’identique.
- `registries` : 16 entrées déplacées à l’identique.
- Nouveau fichier : `web/runtime_config.json` (26 lignes).
- `runtime_config.json` ne contient aucun numéro de Build, token ou date de publication. Il ne doit évoluer que si la configuration change.

## version.json après séparation

Il conserve uniquement :

- `schema`
- `release`
- `build`
- `asset_token`
- `published_at`
- `coherence_contract`

Le `coherence_contract` reste volontairement pour cette étape car le contrôleur actuel vérifie encore les témoins `index.html`, `app.js` et `style.css`. Sa suppression relève de la prochaine chirurgie du versionnage.

## Non-régression

- `app.js` : syntaxe JavaScript valide.
- `app.js`, `index.html`, `style.css` : après neutralisation mécanique de la seule identité 28.3.19, les fichiers redeviennent identiques à la 28.3.18.
- Le lecteur `version.json` de `app.js` ne consomme que les champs d’identité Build/token et leurs alias de compatibilité.
- Aucun accès runtime à `manifest.assets` ou `manifest.registries` n’a été trouvé.
- Valeurs `assets` et `registries` transférées sans modification.

## Contrôles ciblés

**26/26 réussis — 0 échec.**

## Limite honnête

La validation publique Firefox reste nécessaire pour confirmer le cycle réel : détection 28.3.19 → installation → confirmation → état courant.
