# Agent-Crypto @erith.IA — Market Core V2.0-Alpha

**Version publique préparée :** Market Core V2.0-Alpha · Build 28.3.34  
**Build :** 28.3.34  
**Mission :** Module 02 Spot Position Single Render Viewport Lock




## Build 28.3.34 — Module 02 Spot Position Single Render Viewport Lock

Cette Build part exactement de la 28.3.33.

### Mission unique

Supprimer la « valse » encore visible après `Créer la position BTC fictive de 50 €` en traitant la cause réelle : plusieurs reconstructions successives du cockpit pendant une seule action.

- `resetSimulation()` et `simulateOrder()` continuent de mettre à jour la simulation exactement comme avant.
- Pendant cette action du Module 02 uniquement, les rerendus du cockpit pédagogique sont regroupés : trois reconstructions successives deviennent une seule reconstruction finale.
- Le scroll préparatoire de la 28.3.33 est retiré : aucun déplacement vers l’étape 5 n’est demandé avant la fin de la simulation.
- L’ancrage automatique du navigateur est neutralisé uniquement pendant cette transaction afin que Firefox ne compense pas les changements de hauteur.
- Après la reconstruction finale, l’étape 5 est positionnée directement puis contrôlée trois fois sur une courte fenêtre de stabilisation.
- Le verrou d’ancrage est ensuite restauré.
- Aucune modification de la logique de simulation, des preuves, d’IndexedDB, des bulles d’aide, d’Ask/Bid ou de Marché/Limite.
- Modification fonctionnelle : `web/app.js` uniquement.
- `web/index.html`, `web/style.css` et `web/runtime_config.json` restent strictement inchangés.
- Version Control Protected Core : logique strictement inchangée ; seules les constantes d’identité passent à 28.3.34.

## Build 28.3.33 — Module 02 Spot Position Direct Focus Lock

Cette Build part exactement de la 28.3.32.

### Mission unique

Supprimer le détour visuel observé après le clic `Créer la position BTC fictive de 50 €`.

- Le bouton conserve exactement la même simulation fictive, les mêmes preuves et la même validation de l’étape 4.
- Avant que la simulation ne reconstruise ses panneaux, le cockpit cadre directement la destination pédagogique attendue : l’étape 5.
- Le moteur de cadrage existant est réutilisé : aucun second système de scroll n’est créé.
- Le cadrage préparatoire est immédiat, sans animation ni flash, afin d’éviter l’effet de « valse ».
- Après la simulation, le ciblage existant de l’étape 5 reste en place comme vérification finale.
- La correction est limitée au chemin Module 02 `spot` ; le Module 03 n’est pas modifié.
- Les bulles d’aide, le rappel actif Ask/Bid et Marché/Limite restent inchangés.
- Modification fonctionnelle : `web/app.js`, bloc pédagogique / navigation uniquement.
- `web/index.html`, `web/style.css` et `web/runtime_config.json` restent strictement inchangés.
- Version Control Protected Core : logique strictement inchangée ; seules les constantes d’identité passent à 28.3.33.

## Build 28.3.32 — Module 02 Market / Limit Active Recall Lock

Cette Build part exactement de la 28.3.31.

### Mission unique

Transformer l’étape 3 du Module 02 en rappel actif compréhensible : répondre d’abord, puis lire l’explication du type d’ordre.

- Situation A : l’utilisateur choisit d’abord entre `Ordre au marché` et `Ordre limite` pour un achat immédiat.
- Situation B : même logique pour un prix maximum d’achat fixé à 59 500 €.
- La première tentative de chaque situation est conservée séparément.
- Une erreur révèle l’explication correspondante, ne valide pas la situation et permet une correction.
- Une bonne réponse désactive uniquement la situation déjà validée ; l’autre reste active.
- Après la première tentative, le cockpit explique en langage humain : `ordre = instruction`, `marché = priorité à l’exécution`, `limite = priorité au prix choisi`.
- Des bulles `ⓘ` fournissent des indices facultatifs sans imposer leur lecture.
- L’étape 3 ne devient complète qu’après les deux réponses correctes ; le moteur de cadrage existant cible alors l’étape 4.
- Modification fonctionnelle : `web/app.js`, bloc 09 uniquement.
- `web/index.html`, `web/style.css` et `web/runtime_config.json` restent strictement inchangés.
- Version Control Protected Core : logique strictement inchangée ; seules les constantes d’identité passent à 28.3.32.


## Build 28.3.31 — Module 02 Ask / Bid Active Recall Lock

Cette Build part exactement de la 28.3.30.

### Mission unique

Transformer l’étape 2 du Module 02 en véritable rappel actif, sans toucher au carnet d’ordres réel, au Market, à la simulation ou au Version Control.

- La règle « meilleur Ask / meilleur Bid » n’est plus donnée avant le premier choix.
- Ask : l’utilisateur choisit d’abord entre les deux vendeurs ; la première tentative est mémorisée, puis l’explication apparaît.
- Bid : même logique côté acheteurs.
- Une première erreur ne valide pas l’étape ; elle est conservée comme trace d’apprentissage et l’utilisateur peut corriger.
- Une réponse correcte désactive uniquement le côté déjà validé afin de guider vers l’autre colonne.
- Le Spread pédagogique n’est révélé qu’une fois Ask et Bid correctement identifiés.
- Des bulles `ⓘ` donnent un indice sémantique sur Ask et Bid sans révéler le prix correct avant la tentative.
- Quand les deux côtés sont validés, le viewport reste dans le moteur pédagogique existant et cible directement l’étape 3.
- Modification fonctionnelle : `web/app.js`, bloc 09 uniquement.
- `web/index.html`, `web/style.css` et `web/runtime_config.json` restent strictement inchangés.
- Version Control Protected Core : logique strictement inchangée ; seules les constantes d’identité passent à 28.3.31.


## Build 28.3.30 — Livecheck Direct Market Focus Lock

Cette Build part exactement de la 28.3.29.

### Mission unique

Supprimer le détour visuel observé au clic sur `Lancer Livecheck` pendant le Module 01 : le parcours doit aller directement au Market, sans passage bref par l’ancienne position ou le haut de page.

- Avant de lancer le rafraîchissement réseau, le cockpit cadre immédiatement `market-workspace`.
- La couche de continuité du Market mémorise donc le bon viewport avant la reconstruction de la table.
- Le Livecheck, le Market Snapshot, la ligne Bitcoin, les preuves pédagogiques et IndexedDB ne changent pas.
- Le ciblage final de la ligne Bitcoin après validation de l’étape 2 reste en place.
- En cas d’échec Livecheck, le retour vers la zone pédagogique reste inchangé.
- Modification fonctionnelle : `web/app.js` uniquement.
- `web/index.html`, `web/style.css` et `web/runtime_config.json` restent strictement inchangés.
- Version Control Protected Core : logique strictement inchangée ; seules les constantes d’identité passent à 28.3.30.



## Build 28.3.29 — Learning Viewport Settle & Reset Hover Lock

Cette Build part exactement de la 28.3.28 testée visuellement.

### Mission unique

Corriger le cadrage encore trop bas après certains rerenders, en particulier après `Repartir de zéro`, sans toucher aux données du parcours ni au Version Control Protected Core.

- Le moteur de focus pédagogique garde une cible unique, mais vérifie maintenant sa position après les petits changements de mise en page qui suivent un clic.
- Le premier cadrage reste immédiat ; deux contrôles courts corrigent uniquement une dérive réelle supérieure à 4 px.
- Après un reset/rechargement, trois contrôles dédiés à 120 ms, 420 ms et 1000 ms ramènent `learningSessionPlan` à 18 px du haut si Firefox l'a décalé pendant la stabilisation de la page.
- Aucun scroll supplémentaire n'est effectué si la cible est déjà correctement placée.
- Le bouton `Repartir de zéro` reçoit une bulle native au survol qui précise exactement ce qui est effacé et ce qui est conservé.
- Fichiers fonctionnels modifiés : `web/app.js` et la seule balise du bouton reset dans `web/index.html`.
- `web/style.css` et `web/runtime_config.json` restent strictement inchangés.
- Version Control Protected Core : logique inchangée ; seules les constantes d'identité passent à 28.3.29.


## Build 28.3.28 — Learning Viewport Focus & Reset Lock

Cette Build part exactement de la 28.3.27 validée sur le Transformer Book et le Ryzen.

### Mission unique

Stabiliser le cadrage du parcours pédagogique après les clics, et garantir qu’un « Repartir de zéro » revient bien sur `01 · Marché et données · session guidée` à `0/5 étapes`.

- Le reset conserve son effacement limité à Agent-Crypto, puis recharge proprement l’application.
- Après rechargement, Firefox ne doit plus restaurer l’ancienne position verticale : le cockpit revient sur `learningSessionPlan`.
- Le gestionnaire de focus pédagogique résout désormais la cible **après** le rerender du cockpit (double `requestAnimationFrame`), puis la place en haut avec un décalage constant.
- Le scroll pédagogique est immédiat par défaut : plus de long déplacement fluide à travers la page (« envoyé valser »).
- Toutes les actions existantes qui utilisent `scrollToLearningTarget()` bénéficient de ce cadrage sans réécriture de leurs blocs fonctionnels.
- Aucun changement de contenu pédagogique, Market, Graphique, Simulation, Métaux, Bridge, IndexedDB schema, HTML, CSS ou `runtime_config.json`.
- Version Control Protected Core : logique inchangée ; seules les constantes d’identité passent à 28.3.28.


## Build 28.3.27 — Active Recall & Learning Guidance Lock

Cette Build part exactement de la 28.3.26 validée après rechargement forcé sur le Transformer Book.

### Mission unique

Renforcer l’apprentissage du Module 01 sans modifier son contenu de marché ni le Version Control Protected Core.

- Étape 5 : les preuves sont affichées avant la question, mais la conclusion n’est plus donnée avant la réponse.
- Ordre pédagogique : **question → réponse → validation → explication**.
- La première réponse est conservée comme trace d’apprentissage ; une erreur ne détruit aucune progression.
- La réponse correcte `Non` valide l’étape et révèle l’explication complète avant l’archivage.
- `Synthèse automatique` et `Notes personnelles` sont désormais deux zones visuellement distinctes ; le stockage historique reste compatible.
- Les anciennes auto-synthèses Modules 01/02/03 sont séparées à l’affichage sans migration destructive des archives.
- Ajout de bulles `ⓘ` accessibles au survol et au clavier sur Prix/24 h/7 j, provenance et rappel actif.
- Aucun changement Market, Graphique, Simulation, Métaux, Bridge, IndexedDB schema ou logique Version Control.


## Build 28.3.26 — Current Build Reverify Stability Lock

Cette Build part exactement de la 28.3.25 publiée.

### Mission unique

Corriger le faux état « Publication Build courant incomplète » observé sur le Transformer Book lors d’une revérification manuelle du Build déjà chargé.

- Si `version.json` annonce le même Build et le même token que `app.js`, le contrôleur confirme désormais l’identité courante sans retélécharger ni re-hasher HTML/CSS/runtime_config.
- Une incohérence même-Build / token différent reste refusée.
- Toute Build supérieure continue d’être vérifiée avec l’intégrité SHA-256 complète avant proposition d’installation.
- Le préchargement fort avant installation d’une nouvelle Build reste inchangé.
- Modules 01, 02, 03, Market, Graphique, Métaux, Simulation, HTML, CSS et runtime_config restent inchangés.



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
