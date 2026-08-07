# Agent-Crypto @erith.IA — Market Core V2.0-Alpha

**Version publique préparée :** Market Core V2.0-Alpha · Build 28.3.23  
**Build :** 28.3.23  
**Mission :** Module 02 Auto-Synthesis & Archive Prefill Lock

## Build 28.3.23 — Module 02 Auto-Synthesis & Archive Prefill Lock

Cette Build part exactement de la 28.3.22 validée dans le parcours Module 02.

### Mission unique

À la validation 5/5 de `02 · Spot et carnet d’ordres`, le cockpit transforme automatiquement les preuves déjà produites en mémoire pédagogique exploitable.

- Préremplissage automatique de `Mes notes libres` avec une auto-synthèse clairement balisée.
- Les éventuelles notes personnelles existantes sont conservées intégralement.
- Création d’un objet `spot_archive_prefill` dans les preuves pédagogiques : Ask, Bid, spread, types d’ordre, position fictive, capital restant, conclusion et sécurité.
- Création d’un journal pédagogique dérivé de ces mêmes preuves.
- Les frais réels, spreads réels de plateforme et slippage réel restent explicitement `non vérifiés` ; aucune valeur n’est inventée.
- Une session Module 02 déjà à 5/5 en 28.3.22 reçoit automatiquement le préremplissage lors du premier rendu 28.3.23.
- L’archive IndexedDB conserve automatiquement ces données lorsque l’utilisateur clique sur `Terminer et archiver le module`.
- `index.html`, `style.css` et `runtime_config.json` restent strictement inchangés.
- Le noyau de versionnage reste inchangé ; seules les constantes d’identité Build/token passent à 28.3.23.

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
