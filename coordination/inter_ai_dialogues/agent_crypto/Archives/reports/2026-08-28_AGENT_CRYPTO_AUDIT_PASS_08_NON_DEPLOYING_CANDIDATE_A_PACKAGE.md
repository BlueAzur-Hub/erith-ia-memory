# Agent-Crypto @erith.IA — Audit cumulatif Pass 08

Date: 2026-08-28
Mode: READ-ONLY RUNTIME AUDIT / COORDINATION WRITE ONLY
Runtime live authority: `public/agent_crypto_erith_ia/administrator/`
Runtime live build: `40.4.88`
Runtime commit authority: `0b8672c4d2481bf21205e2cc74082ea591175d08`
Market Core: `38.15.11` — PROTECTED
Pass 07 authority: `a044a403d19bd298fe1034b6e36ee92e15416133`

## 1. HEAD dépôt vs runtime live

HEAD réel au début du Pass 08 = `a044a403d19bd298fe1034b6e36ee92e15416133` (Pass 07).

Aucun nouveau runtime Administrator n'était apparu. La séparation reste donc :
- dépôt HEAD de départ = coordination Pass 07 ;
- runtime live = 40.4.88 ;
- runtime commit authority = `0b8672c4d2481bf21205e2cc74082ea591175d08` ;
- Market Core = 38.15.11 protégé.

## 2. Candidate A design package créé sans déploiement

Le fichier suivant est créé sous coordination uniquement :

`2026-08-28_AGENT_CRYPTO_CANDIDATE_A_NON_DEPLOYING_DESIGN_PACKAGE.md`

Il ne contient ni Build alloué, ni `auto_update/request.json`, ni runtime patch appliqué, ni faux SHA-256 anticipé.

Classification : **PROUVÉ — DESIGN PACKAGE EXISTS / RUNTIME UNTOUCHED**.

## 3. Exact load-graph delta confirmé

Le voisinage actuel de `index.html` charge dans cet ordre :
- `view-lifecycle.js` ;
- `js/app.js` ;
- `projects-demand-residency.js` ;
- `operations-demand-residency.js` ;
- `system-demand-residency.js` ;
- secondary-domain/private-source loaders ;
- Atlas family demand residency.

Candidate A retire exactement les deux script tags Projects/Operations et ne change aucun autre ordre.

Classification : **PROUVÉ**.

Budget statique attendu :
- parser scripts `-2` ;
- generic registrations `-2` ;
- aucun timer/observer/WebSocket/storage/business fetch ajouté.

## 4. System exact delta confirmé

`system-demand-residency.js` 40.4.88 contient actuellement cinq selectors :
- simulation ;
- commandes ;
- backend ;
- safety ;
- physical-security.

Candidate A conserve seulement `simulation` dans le generic lifecycle. Storage Health et Grey Plate restent résidents et ne sont pas pris en charge par ce wrapper.

Compatibilité design retenue pour la première candidate :
- garder alias `ErithSystemDemandResidency40414` ;
- garder alias `ErithSystemDemandResidency40488` pendant la première consolidation ;
- ajouter un alias neutre `ErithSystemDemandResidencyCurrent` pour VNext ;
- aucune suppression du fichier historique.

Classification : **PROUVÉ / LOW-RISK COMPATIBILITY PRESERVATION**.

## 5. Residency diagnostic VNext — indépendance fixée

Le diagnostic 40.4.41 actuel est officiellement stale : il attend `projects`, `operations`, `system`, `atlas` comme generic registrations et seulement Oracle comme true-lazy.

VNext doit attendre :
- generic registrations : `system`, `atlas` ;
- System generic = Simulation seulement ;
- true-lazy : Projects, Operations, System presentation, Oracle ;
- protected cockpit + Storage/Grey + Atlas main cockpit connectés ;
- duplicate IDs = 0 ;
- open+detached = violation ;
- aucune mutation automatique.

Règle critique : VNext ne doit faire aucune référence obligatoire à `ErithProjectsDemandResidency*` ni `ErithOperationsDemandResidency*`.

Classification : **DESIGN CONTRACT PROVEN**.

## 6. Ownership truth exact delta

`architecture/administrator-ownership.json` 40.4.85 doit seulement corriger les owners concernés :

Projects :
`projects-presentation.js + projects-demand-residency.js + views/projects.html`
→ `projects-presentation.js + views/projects.html`

Operations :
`operations-presentation.js + operations-demand-residency.js + views/operations.html`
→ `operations-presentation.js + views/operations.html`

System peripherals restent true-lazy via `system-presentation.js + views/system.html`; une note doit préciser que Simulation seule conserve generic closed-body residency.

Aucun historique sans rapport ne doit être réécrit.

Classification : **PROUVÉ**.

## 7. Manifest boundary confirmée

`version.json` 40.4.88 :
- runtime build 40.4.88 ;
- Market Core 38.15.11 protected ;
- Candidate A doit ajouter le SHA-256 de `residency-audit.js` si le fichier reste absent de la map `files` ;
- aucun SHA hypothétique ne doit être écrit avant staging final.

`administrator-version.json` 40.4.88 :
- doit refléter la consolidation mais ne doit pas prétendre que les deux fichiers legacy sont supprimés ;
- la présence de fichiers legacy dans l'inventaire reste compatible avec un état unloaded/tombstone, déjà démontré par le cas Oracle.

Classification : **PROUVÉ — SIX-FILE PUBLISHABLE MINIMUM RETAINED**.

## 8. Matrice Firefox/operator désormais explicite

Le design package contient les gates suivants :
1. cold boot ;
2. first-click Administration ;
3. Projects first hydration ;
4. Operations first hydration + actions ;
5. Simulation generic residency same-node restore ;
6. System peripherals true-lazy sans generic records ;
7. Backend hydration + Source Intelligence handoff ;
8. Storage Health/Grey Plate connected + clickable ;
9. Window Manager move/minimize/detach/maximize/hide-recall ;
10. Atlas/Oracle smoke ;
11. Residency VNext read-only + duplicate IDs = 0.

Firefox/operator reste l'autorité finale. Aucun PASS runtime n'est simulé par l'audit statique.

## 9. Dettes fermées / ouvertes

### Fermées au niveau design
- double generic residency Projects ;
- double generic residency Operations ;
- frontière System generic vs true-lazy ;
- six-file Candidate A minimum ;
- diagnostic VNext ownership model ;
- acceptance matrix Candidate A.

### Encore ouvertes
- aucune validation Firefox réelle de Candidate A, car aucun Build n'existe ;
- selectors DOM exacts Storage/Grey à recopier de la baseline au moment du staging ;
- Atlas target/hash routing ;
- Atlas insertAdjacentHTML hook ;
- Learning post-parse recovery ;
- no-local-producer/Ryzen OFFLINE/N/A ;
- Bridge/Ollama local producer supervision ;
- monolithe partagé ;
- architecture-freeze stale au-delà de la portée du residency audit.

## 10. État de Candidate A après Pass 08

`NON-DEPLOYING DESIGN PACKAGE COMPLETE / STATIC BOUNDARY READY / RUNTIME VIABILITY NOT YET PROVEN`.

Aucun Build n'est créé.
Aucun `auto_update/request.json` n'est créé.
Aucun fichier sous `public/agent_crypto_erith_ia/administrator/` n'est modifié.

## 11. Prochaine cible — Pass 09

Avant toute allocation de Build :
1. extraire les selectors/IDs canoniques exacts Storage Health et Grey Plate de la baseline 40.4.88 ;
2. dessiner le code VNext complet sans mutation et vérifier qu'il n'appelle aucun owner retiré ;
3. effectuer un static diff review du six-file design contre 40.4.88 ;
4. vérifier syntaxe JS/JSON sur un staging non-live si un staging est créé ;
5. seulement si ces gates se ferment, autoriser la préparation d'un package test versionné, toujours sans publication runtime automatique.
