# Agent-Crypto @erith.IA — Market Core V2.0-Alpha

**Version publique préparée :** Market Core V2.0-Alpha · Build 28.3.22  
**Build :** 28.3.22  
**Mission :** Guided Step Focus & Pedagogy Lock

## Build 28.3.22 — Guided Step Focus & Pedagogy Lock

Cette Build part exactement de la 28.3.21 validée sous Firefox.

### Mission unique

Corriger l’ergonomie du Module 02 — Spot et carnet d’ordres : un clic, un rerender, un seul cadrage sur l’étape suivante.

- Étape 1 validée → cadrage Étape 2.
- Bid / Ask terminés → cadrage Étape 3.
- Marché / Limite terminés → cadrage Étape 4.
- Position BTC fictive créée → cadrage Étape 5.
- Le feedback n’effectue plus de scroll concurrent.
- Ask / Bid et la Situation B sont reformulés pour réduire l’ambiguïté pédagogique.
- Aucun changement HTML/CSS/runtime_config.
- Noyau de versionnage 28.3.21 conservé ; seules les constantes d’identité Build/token évoluent.

## Build 28.3.21 — Two-File Version Control Final Lock

Cette Build part exactement de la 28.3.20 validée sous Firefox.

### Mission unique

Terminer la séparation du versionnage.

Le noyau actif est désormais :

- `web/app.js` → identité locale exécutée + contrôleur de mise à jour ;
- `web/version.json` → identité distante publiée + empreintes d’intégrité.

### `index.html` libéré

`index.html` ne contient plus :

- `meta[name="atlas-build"]` ;
- `meta[name="atlas-asset-token"]` ;
- numéro de Build dans les URLs de `style.css` et `app.js`.

Les libellés visibles de version sont remplis dynamiquement par `app.js`.

### `style.css` libéré

`style.css` ne contient plus :

- `ATLAS_ASSET_BUILD` ;
- `ATLAS_ASSET_TOKEN` ;
- `--atlas-asset-build` ;
- `--atlas-asset-token`.

La feuille de style ne porte plus le numéro de Build.

### Intégrité de publication

`version.json` conserve les empreintes SHA-256 de :

- `app.js` ;
- `index.html` ;
- `style.css` ;
- `runtime_config.json`.

Cela ne versionne pas HTML/CSS : cela permet seulement au contrôleur de vérifier qu’une publication distante est complète avant de proposer ou d’installer la mise à jour.

### Conséquence pour les prochaines Builds

Si une future Build ne modifie ni HTML, ni CSS, ni configuration runtime :

- `index.html` reste inchangé ;
- `style.css` reste inchangé ;
- `runtime_config.json` reste inchangé ;
- le versionnage peut évoluer uniquement avec `app.js` + `version.json`.

`build_history.md` et `README.md` restent documentaires et peuvent être mis à jour sans être lus par le runtime.
