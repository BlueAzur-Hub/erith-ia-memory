# Agent-Crypto @erith.IA — Market Core V2.0-Alpha

**Version publique préparée :** Market Core V2.0-Alpha · Build 28.3.25  
**Build :** 28.3.25  
**Mission :** Module 03 Review Focus & Auto-Synthesis Lock



## Build 28.3.25 — Module 03 Review Focus & Auto-Synthesis Lock

Cette Build part exactement de la 28.3.24 validée.

### Mission unique

Mettre `03 · Frais et gestion du risque` au même standard de navigation et de mémoire que les Modules 01 et 02 avant la reprise pédagogique de Christophe.

- Parcours fonctionnel conservé : coûts école, position BTC fictive de 50 €, scénarios −3 % / +5 %, brut / net et conclusion guidée.
- Étapes 1 → 2 → 3 → 4 → 5 : cadrage unique sur la carte canonique après rerender.
- Suppression des doubles scrolls concurrents propres au Module 03 ; une mauvaise réponse ne déplace pas la page.
- À 5/5, `Mes notes libres` reçoit `[AUTO-SYNTHÈSE MODULE 03]` sans écraser les notes personnelles.
- `risk_archive_prefill` conserve modèle de coûts école, position figée, scénarios figés, conclusion et verrous de sécurité.
- Les frais réels, le spread réel et le slippage réel restent explicitement non vérifiés ; aucune valeur réelle n’est inventée.
- `risk_learning_journal` conserve la synthèse pédagogique dérivée.
- Modules 01/02, HTML, CSS, runtime_config et logique du Version Control Protected Core restent inchangés.

## Build 28.3.24 — Module 01 Review Focus & Auto-Synthesis Lock

Cette Build part exactement de la 28.3.23 validée avec le Module 02 archivé.

### Mission unique

Mettre `01 · Marché et données` au même niveau d’ergonomie et de mémoire pédagogique que le Module 02 avant la relecture complète de Christophe.

- Parcours fonctionnel Module 01 conservé : Livecheck, Prix / 24 h / 7 j, source + heure, conclusion guidée.
- Navigation des étapes 3 → 4 → 5 stabilisée : un rerender, un seul cadrage, aucun feedback concurrent.
- Les mauvaises réponses ne déplacent plus la page.
- À 5/5, `Mes notes libres` reçoit un bloc `[AUTO-SYNTHÈSE MODULE 01]` construit uniquement à partir des preuves figées de la session.
- Les notes personnelles existantes sont conservées.
- `market_archive_prefill` conserve observation BTC, variations 24 h / 7 j, source, heure, conclusion et verrous de sécurité.
- `market_learning_journal` conserve la synthèse pédagogique dérivée.
- Aucune recommandation, prédiction ou donnée manquante n’est inventée.
- Module 02 et Version Control Protected Core restent inchangés.
- `index.html`, `style.css` et `runtime_config.json` restent strictement inchangés.

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
