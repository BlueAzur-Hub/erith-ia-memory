# Agent-Crypto @erith.IA — Market Core V2.0-Alpha

**Version publique préparée :** Market Core V2.0-Alpha · Build 28.3.19  
**Build :** 28.3.19  
**Mission :** Runtime Config Separation Lock

## Build 28.3.19 — Runtime Config Separation Lock

Cette Build part exactement de la 28.3.18 validée et ne change volontairement aucune fonctionnalité du produit.

### Changement structurel unique

- `version.json` : manifeste de version encore allégé ;
- `web/runtime_config.json` : nouveau fichier dédié à la configuration stable des assets et registries ;
- `assets` et `registries` sont déplacés à l’identique depuis `version.json` ;
- `coherence_contract` reste temporairement dans `version.json`, car il appartient encore au contrôleur de version actuel ;
- `app.js`, `index.html` et `style.css` ne changent fonctionnellement pas : seule l’identité Build/token passe à 28.3.19.

### Principe

Une responsabilité par fichier :

- `version.json` → identité de publication ;
- `runtime_config.json` → configuration runtime stable ;
- `build_history.md` → historique humain.

### Étape suivante prévue

La prochaine chirurgie dédiée pourra réduire le versionnage au noyau `app.js` + `version.json` et retirer les marqueurs de version de `index.html` et `style.css`, après validation Firefox de cette Build.

### Base

Build 28.3.18 — Version Manifest Separation Lock.
