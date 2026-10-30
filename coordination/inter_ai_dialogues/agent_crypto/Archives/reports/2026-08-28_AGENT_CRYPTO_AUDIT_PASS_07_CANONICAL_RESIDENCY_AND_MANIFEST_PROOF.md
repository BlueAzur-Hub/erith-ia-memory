# Agent-Crypto @erith.IA — Audit cumulatif Pass 07

Date: 2026-08-28
Mode: READ-ONLY RUNTIME AUDIT / COORDINATION ONLY
Runtime live authority: `public/agent_crypto_erith_ia/administrator/`
Runtime live build: `40.4.88`
Runtime commit authority: `0b8672c4d2481bf21205e2cc74082ea591175d08`
Market Core: `38.15.11` — PROTECTED
Base audit authority: Pass 06 `1730f236b8a9c0e90e3e43bcc3c22f591914edc1`

## 1. HEAD dépôt vs runtime live

Au début du Pass 07, HEAD réel du dépôt = `1730f236b8a9c0e90e3e43bcc3c22f591914edc1` (Pass 06).

Aucun commit Administrator runtime n'est apparu après `0b8672c4d2481bf21205e2cc74082ea591175d08`.

Conclusion :
- HEAD dépôt = coordination Pass 06 ;
- runtime live = 40.4.88 inchangé ;
- Market Core = 38.15.11 inchangé.

## 2. Nouvelle preuve forte — `architecture/final-residency.json` est déjà aligné avec la consolidation recherchée

`architecture/final-residency.json`, build documentaire 40.4.48, déclare explicitement :

- Projects heavy bodies = TRUE_LAZY ; owner = `js/views/projects-presentation.js + views/projects.html` ;
- Operations heavy bodies = TRUE_LAZY ; owner = `js/views/operations-presentation.js + views/operations.html` ;
- System peripherals = TRUE_LAZY ; owner = `js/views/system-presentation.js + views/system.html` ;
- Storage Health / Grey Plate / Simulation runtime = RESIDENT_PROTECTED ;
- Atlas peripheral = TRUE_LAZY_PARTIAL_FAMILY ;
- Oracle heavy presentation = TRUE_LAZY.

Ce document canonique historique ne mentionne déjà **aucun** `projects-demand-residency.js` ni `operations-demand-residency.js` comme owner de Projects/Operations.

Classification : **PROUVÉ**.

Conséquence : Candidate A ne crée pas une nouvelle architecture Projects/Operations ; elle retire du graphe runtime une couche generic residency qui contredit déjà la topologie de résidence finale 40.4.48.

## 3. Contradiction documentaire 40.4.85 désormais qualifiée

`architecture/administrator-ownership.json` build 40.4.85 déclare encore :

- Projects owner = `projects-presentation.js + projects-demand-residency.js + views/projects.html` ;
- Operations owner = `operations-presentation.js + operations-demand-residency.js + views/operations.html`.

Son `purpose` 40.4.85 est lié à une vague qui cherchait aussi à déplacer Storage Health et Grey Plate derrière demand residency.

Or 40.4.88 a précisément restauré Storage/Grey résidents après régression System 04.

Donc `administrator-ownership.json` 40.4.85 n'est pas seulement ancien : son état d'ownership est **partiellement régressif/stale par rapport au final-residency 40.4.48 et au recovery 40.4.88**.

Classification : **PROUVÉ — CURRENT OWNERSHIP TRUTH MUST BE CORRECTED WITH CANDIDATE A**.

## 4. `version.json` — frontière exacte des hashes Candidate A

Le manifest 40.4.88 hash déjà :

- `index.html` ;
- `js/views/system-demand-residency.js` ;
- `architecture/administrator-ownership.json`.

Il ne contient pas de hash pour :

- `js/views/projects-demand-residency.js` ;
- `js/views/operations-demand-residency.js`.

C'est compatible avec une consolidation **sans suppression de fichiers** : les deux fichiers legacy peuvent rester physiquement présents mais ne plus être parser-loadés par `index.html`.

`residency-audit.js` est référencé comme diagnostic demand-loaded dans l'historique du manifest, mais n'est pas actuellement un fichier hashé dans la map `files`. Si Candidate A modifie ce diagnostic, son nouveau fichier devra être ajouté explicitement à la map SHA-256 de `version.json`, conformément au workflow.

Classification : **PROUVÉ**.

## 5. Important — retrait du graphe ≠ suppression physique

Le protocole AETHER interdit les suppressions automatiques non prouvées.

Candidate A n'a pas besoin de supprimer :

- `projects-demand-residency.js` ;
- `operations-demand-residency.js`.

Le changement minimal sûr est :

- retirer leurs `<script src=...>` de `index.html` ;
- laisser les fichiers historiques dans le dépôt pour rollback/forensic tant qu'une phase de tombstone/cleanup séparée n'est pas explicitement prouvée.

Cette stratégie respecte `delete: empty` et réduit le risque de compatibilité indirecte.

Classification : **PROUVÉ — SAFER RETIREMENT MODE**.

## 6. `administrator-version.json` — présence legacy ≠ owner actif

Le mirror manifest Administrator contient encore dans son inventaire plusieurs chemins legacy, dont :

- `projects-demand-residency.js` ;
- `operations-demand-residency.js` ;
- `oracle-demand-residency.js` ;
- `oracle-ui-continuity.js`.

Or Oracle est déjà canoniquement consolidé et ses deux anciens fichiers sont des tombstones inertes/unloaded.

Donc la simple présence d'un filename legacy dans cet inventaire ne constitue **pas** une preuve qu'il doit rester un owner actif/parser-loaded.

Candidate A devra toutefois mettre à jour `administrator-version.json` pour la nouvelle build et enregistrer explicitement la consolidation, sans prétendre que les fichiers historiques ont été supprimés.

Classification : **PROUVÉ**.

## 7. `runtime-boot-residency-audit-40.4.66.json` — historique à conserver, pas vérité CURRENT

Le snapshot 40.4.66 conserve logiquement dans son `parser_blocking_script_order` :

- Projects demand residency ;
- Operations demand residency ;
- System demand residency ;
- anciens readers encore eager à cette époque.

Ce fichier est un **snapshot historique de 40.4.66**, pas une topologie CURRENT 40.4.88.

Il ne doit donc pas être réécrit pour faire semblant qu'il décrivait Candidate A. Le futur diagnostic VNext doit porter la nouvelle vérité ; les audits versionnés historiques restent intacts.

Classification : **PROUVÉ — HISTORICAL IMMUTABILITY BOUNDARY**.

## 8. Compatibilité repo-wide — limite restante honnête

GitHub Code Search renvoie encore `incomplete_results:true` pour les symboles legacy exacts. Une tentative de récupération locale intégrale du zip du dépôt est bloquée par les contraintes du runtime outil.

Donc l'absence absolue de toute référence textuelle repo-wide ne peut toujours pas être affirmée.

Mais trois faits réduisent fortement le risque :

1. final-residency 40.4.48 définit déjà Projects/Operations sans generic owners ;
2. les deux fichiers legacy n'apportent aucun business owner, seulement une registration generic lifecycle ;
3. Candidate A ne supprime pas les fichiers, elle les retire seulement du load graph, préservant rollback et forensic.

Classification : **GLOBAL SEARCH PARTIALLY BLOCKED, FUNCTIONAL RETIREMENT EVIDENCE STRONG**.

## 9. Candidate A — frontière fonctionnelle désormais figée

### Delta runtime fonctionnel

1. `index.html`
   - retirer seulement les deux scripts :
     - `projects-demand-residency.js`
     - `operations-demand-residency.js`
   - conserver `view-lifecycle.js` ;
   - conserver `system-demand-residency.js` ;
   - conserver `atlas-family-demand-residency.js` ;
   - aucun changement Market/Graph/Oracle/Atlas CURRENT/Window Manager.

2. `js/views/system-demand-residency.js`
   - registration `system` réduite à Simulation seulement ;
   - ne pas toucher Storage/Grey ;
   - ne pas enregistrer Commandes/Backend/Safety/Physical Security déjà true-lazy ;
   - conserver aliases diagnostics nécessaires ou fournir compatibilité explicite.

3. `js/views/residency-audit.js`
   - diagnostic VNext demand-only/read-only ;
   - Projects + Operations attendus comme true-lazy, pas generic registrations ;
   - System generic attendu = Simulation seulement ;
   - Atlas generic encore attendu pour main cockpit / dette router non fermée ;
   - Oracle true-lazy canonical ;
   - duplicate IDs = 0 ;
   - protected cockpit/Storage/Grey connectés ;
   - aucune mutation/timer/observer/fetch/storage write.

### Delta vérité/publication

4. `architecture/administrator-ownership.json`
   - aligner CURRENT ownership sur la topologie réellement active ;
   - Projects/Operations sans generic residency ;
   - System peripherals true-lazy ; Simulation séparée ;
   - ne pas réécrire l'histoire 40.4.48/40.4.66.

5. `version.json`
   - nouvelle build/parent/token/release ;
   - hashes exacts ;
   - ajouter `js/views/residency-audit.js` à `files` si modifié ;
   - Market Core reste 38.15.11.

6. `administrator-version.json`
   - nouvelle build/parent/token ;
   - enregistrer owner consolidation ;
   - fichiers historiques legacy peuvent rester inventoriés comme legacy/unloaded, pas active owners.

Minimum publiable Candidate A : **6 fichiers**.

## 10. Budget runtime

Candidate A reste strictement monotone :

- 2 scripts parser-blocking en moins ;
- 2 generic registrations en moins ;
- 4 selectors true-lazy retirés de la registration System ;
- aucun nouveau moteur métier ;
- aucun nouveau `setInterval(` ;
- aucun MutationObserver ;
- aucun IntersectionObserver ;
- aucun WebSocket ;
- aucun `localStorage.setItem` ;
- aucun fetch métier ;
- aucun changement app.js/js/app.js.

Le workflow vérifiera en plus les budgets des deux main runtimes, les hashes, Market Core 38.15.11, duplicate IDs et syntaxe JS.

Classification : **STATIC NON-INCREASE STRONG / FIREFOX STILL FINAL AUTHORITY**.

## 11. Invariants protégés — inchangés

Hors Candidate A :

- Market Core 38.15.11 ;
- Graph Context V7 ;
- Graphique ;
- Top 5 ;
- CURRENT critique / IndexedDB ;
- Oracle ;
- Atlas router / peripheral lazy / insertAdjacentHTML hook / main cockpit ;
- Learning 40.4.47 ;
- no-local-producer ;
- Bridge / Private Backend / Source Intelligence ;
- Window Manager geometry ;
- monolithe métier partagé.

## 12. Décision Pass 07

**Pas de Build. Pas de staging auto_update. Pas de modification runtime live.**

Mais la Candidate A passe de `NOT YET AUTHORIZED` à :

**DESIGN BOUNDARY PROVEN / NON-DEPLOYING CANDIDATE DESIGN AUTHORIZED**.

Cela signifie qu'un package de conception/staging hors `auto_update/request.json` peut maintenant être préparé pour revue statique, sans publication runtime.

La publication réelle reste interdite avant :

- génération cohérente des six fichiers Candidate A ;
- hashes exacts ;
- contrôle statique ;
- Firefox/operator validation ;
- puis seulement activation du protocole de publication.

## 13. Prochaine cible — Pass 08

1. préparer un **Candidate A design package non-déployant** dans `coordination/inter_ai_dialogues/agent_crypto/` sans `auto_update/request.json` ;
2. produire les deltas exacts attendus des 6 fichiers sans toucher au live ;
3. construire la matrice de validation Firefox : cold boot, Administration first click, Projects, Operations, Simulation, Backend lazy handoff, Storage/Grey, Window Manager, Atlas/Oracle smoke, duplicate IDs ;
4. vérifier que le diagnostic VNext ne dépend d'aucun owner retiré ;
5. seulement après PASS opérateur, envisager une vraie build versionnée.
