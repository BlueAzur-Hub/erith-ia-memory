# Agent-Crypto @erith.IA — Audit cumulatif Pass 06

Date: 2026-08-28
Mode: READ-ONLY RUNTIME AUDIT / COORDINATION ONLY
Runtime live authority: `public/agent_crypto_erith_ia/administrator/`
Runtime live build: `40.4.88`
Runtime commit authority: `0b8672c4d2481bf21205e2cc74082ea591175d08`
Market Core: `38.15.11` — PROTECTED
Base audit authority: Pass 05 `b1dcb3475cf25f10381d74d7c2965dd92dc65b95`

## 1. HEAD dépôt vs runtime live

Au début du Pass 06, le HEAD réel du dépôt est `b1dcb3475cf25f10381d74d7c2965dd92dc65b95` (Pass 05).

Aucun commit runtime Administrator n'est apparu après `0b8672c4d2481bf21205e2cc74082ea591175d08`.

Conclusion :

- HEAD dépôt : Pass 05 coordination ;
- runtime live : 40.4.88 inchangé ;
- Market Core : 38.15.11 inchangé.

## 2. Nouvelle preuve — ownership manifest indirectement dépendant

`architecture/administrator-ownership.json` est encore en build documentaire `40.4.85` et déclare actuellement :

- Projects presentation owner = `projects-presentation.js + projects-demand-residency.js + views/projects.html` ;
- Operations presentation owner = `operations-presentation.js + operations-demand-residency.js + views/operations.html` ;
- System peripheral presentation owner = `system-presentation.js + views/system.html` avec Storage/Grey/Simulation protégés ;
- Atlas peripheral lazy owner = `atlas-peripheral-lazy.js + views/atlas.html`.

Cette preuve change la frontière de Candidate A : retirer les legacy Projects/Operations du graphe sans corriger ce manifeste laisserait une **ownership truth documentaire fausse**.

Classification : **PROUVÉ — indirect compatibility/truth dependency**.

Ce manifeste n'est pas un moteur runtime, mais il est explicitement une source d'ownership et ne doit pas raconter une topologie retirée.

## 3. Correction du concept “payload minimal trois fichiers”

Le Pass 05 avait borné la chirurgie fonctionnelle à trois fichiers :

1. `index.html` ;
2. `js/views/system-demand-residency.js` ;
3. `js/views/residency-audit.js`.

Cette frontière reste correcte comme **delta fonctionnel runtime**, mais elle n'est pas suffisante comme package publiable.

Le protocole `AETHER_AGENT_CRYPTO_AUTO_UPDATE_PROTOCOL.md` et le workflow `.github/workflows/agent-crypto-auto-update.yml` imposent aussi systématiquement :

- `version.json` ;
- `administrator-version.json` ;
- hashes SHA-256 exacts de tous fichiers déclarés ;
- chaque fichier fonctionnel modifié déclaré dans `version.json`.

Et si `architecture/administrator-ownership.json` est corrigé pour conserver la vérité d'ownership, il doit lui aussi être inclus et hashé dans le package.

Donc Candidate A doit désormais distinguer :

### Delta fonctionnel

- `index.html` ;
- `js/views/system-demand-residency.js` ;
- `js/views/residency-audit.js`.

### Delta de vérité / publication

- `architecture/administrator-ownership.json` ;
- `version.json` ;
- `administrator-version.json`.

Minimum publiable réaliste : **6 fichiers**, sous réserve de preuve finale de compatibilité textuelle et de versioning.

Classification : **PROUVÉ**.

## 4. Références legacy — état de preuve

Symboles cibles :

- `ErithProjectsDemandResidency40412` ;
- `ErithOperationsDemandResidency40413` ;
- `ErithSystemDemandResidency40488` ;
- `ErithSystemDemandResidency40414` ;
- `__AGENT_CRYPTO_SYSTEM04_RECOVERY_40488__` ;
- `ErithPresentationLifecycle`.

La recherche GitHub Code connectée continue de renvoyer des résultats incomplets/vides pour les symboles exacts. Une tentative de clone sparse local n'a pas pu résoudre `github.com` depuis le runtime outil ; elle ne constitue donc aucune preuve négative.

Ce qui est maintenant prouvé directement :

- les globals Projects/Operations sont exposés par leurs fichiers legacy comme snapshots de registration ;
- l'alias `ErithSystemDemandResidency40414` est explicitement décrit comme compatibilité pour anciens diagnostics ;
- `residency-audit.js` 40.4.41 dépend du **nom de registration** (`projects`, `operations`, `system`, `atlas`), pas des globals Projects/Operations eux-mêmes ;
- `administrator-ownership.json` dépend indirectement des filenames Projects/Operations legacy comme vérité d'ownership.

Ce qui n'est toujours pas honnêtement prouvé :

- absence absolue de toute référence textuelle à ces globals dans l'ensemble du dépôt.

Classification : **COMPATIBILITY SEARCH STILL PARTIALLY BLOCKED; NO BUSINESS OWNER FOUND**.

## 5. Candidate A — état révisé

Candidate A reste **NOT YET AUTHORIZED**.

La raison n'est plus le périmètre fonctionnel — il est bien borné — mais deux gates de vérité :

1. la recherche de compatibilité textuelle repo-wide n'est pas exhaustive ;
2. le package doit inclure la correction du manifeste d'ownership et les deux manifests de version, donc la préparation doit être faite comme vraie candidate versionnée et non comme simple patch de trois fichiers.

Aucun Build n'est créé juste pour avancer le numéro.

## 6. Diagnostic VNext — matrice désormais figée

Le futur `residency-audit.js` doit rester demand-loaded, manuel et read-only.

Il doit vérifier :

### Generic registrations attendues

- `system` : uniquement `simulation` ;
- `atlas` : uniquement les responsabilités encore réellement résidentes / main cockpit tant que dette router Atlas ouverte.

### True-lazy owners attendus

- Projects : `ErithProjectsPresentation40420` ;
- Operations : `ErithOperationsPresentation40421` ;
- Oracle : `ErithOraclePresentation` / 40.4.41 ;
- System peripheral : `ErithSystemPresentation40424` ;
- Atlas peripheral : présent mais **non consolidé** tant que target-map/hash router n'est pas fermé.

### Invariants

- protected cockpit `#analyste`, `#detailPanel` connecté ;
- Storage Health + Grey Plate connectés ;
- aucun `open && detached` ;
- duplicate IDs = 0 ;
- aucune registration Projects/Operations legacy active ;
- System registration ne contient aucun selector périphérique true-lazy ;
- aucune mutation effectuée par l'audit ;
- aucun timer/observer/fetch/storage write ajouté.

## 7. Budget runtime — toujours monotone

La Candidate A conceptuelle retire :

- deux scripts parser-load ;
- deux registrations de familles ;
- quatre selectors System d'un generic lifecycle.

Elle n'ajoute :

- aucun `setInterval(` ;
- aucun `MutationObserver` ;
- aucun `IntersectionObserver` ;
- aucun `new WebSocket` ;
- aucun `localStorage.setItem` ;
- aucun fetch métier ;
- aucun storage owner.

`app.js` et `js/app.js` restent hors chirurgie fonctionnelle.

Classification : **STATIC NON-INCREASE PROVEN BY DESIGN; FIREFOX STILL REQUIRED**.

## 8. Invariants protégés

Toujours hors Candidate A :

- Market Core 38.15.11 ;
- Graph Context V7 ;
- Graphique ;
- Target Top 5 ;
- CURRENT critique / IndexedDB ;
- Oracle ;
- Atlas router / peripheral hook / main cockpit ;
- Learning 40.4.47 ;
- no-local-producer ;
- Bridge / Source Intelligence ;
- Private Backend ;
- Window Manager geometry ;
- Aether one-lane status geometry ;
- monolithe métier partagé.

## 9. Nouvelle dette documentaire classée

`architecture/administrator-ownership.json` porte encore un état 40.4.85 et mentionne des owners que l'audit propose précisément de retirer.

État : **OPEN / MUST UPDATE WITH CANDIDATE A TRUTH**.

`architecture-freeze.js` reste stale/historique et demand-loaded. Il ne doit pas être promu gate Candidate A sans modernisation séparée.

## 10. Décision Pass 06

**Pas de Build. Pas de package Candidate A. Pas de modification runtime live.**

Néanmoins, Candidate A est mieux bornée qu'au Pass 05 : le delta fonctionnel est stable, et le delta de vérité/publication est maintenant explicitement identifié.

## 11. Prochaine cible — Pass 07

1. inspecter `administrator-version.json` et la section `files` complète de `version.json` pour définir les hashes/manifests exacts requis par une Candidate A ;
2. vérifier si `architecture/administrator-ownership.json` est actuellement hashé dans les manifests et comment sa version doit évoluer ;
3. cartographier les références indirectes dans les diagnostics/manifests/workflows aux legacy residency filenames ;
4. figer le futur état ownership après consolidation ;
5. si aucune nouvelle dépendance fonctionnelle n'apparaît, préparer un **candidate design package non-déployant** sous `coordination/inter_ai_dialogues/agent_crypto/`, sans `auto_update/request.json` et sans toucher au live ;
6. Firefox/operator validation reste obligatoire avant toute publication runtime.
