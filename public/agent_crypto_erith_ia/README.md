# Agent-Crypto @erith.IA — Market Core V2.0-Alpha

**Version publique préparée :** Market Core V2.0-Alpha · Build 28.3.18  
**Build :** 28.3.18  
**Mission :** Version Manifest Separation Lock

## Build 28.3.18 — Version Manifest Separation Lock

Cette Build part exactement de la 28.3.17 validée et ne change volontairement aucune fonctionnalité du produit.

### Changement structurel unique

- `version.json` : manifeste actif allégé ;
- `build_history.md` : historique humain extrait du manifeste ;
- 64 sections historiques retirées de `version.json` et conservées sans perte dans `build_history.md` ;
- les informations actives de version, assets, registries et cohérence restent dans `version.json` pour cette étape ;
- le contrôleur de version reste inchangé hors identité Build/token.

### Principe

`version.json` ne doit plus raconter toute l’histoire du produit.  
`build_history.md` porte l’historique humain.

### Base

Build 28.3.17 — Human Code Architecture Foundation Lock.
