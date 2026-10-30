# Agent-Crypto @erith.IA — AUDIT PASS 23

Date : 2026-08-29
Nature : AUDIT CUMULATIF / COORDINATION ONLY / NO NEW RUNTIME BUILD

## 0. Autorités vérifiées

HEAD dépôt observé juste avant publication de ce rapport : `027149c589fd7269fca3a4a8385f35c58281eaa1` (`coordination: archive Agent-Crypto 40.4.95 canonical`).

Runtime Administrator courant :

- build : `40.4.95`
- runtime commit : `812f323014f2f4248068c0f8a9c9935efb398b53`
- release : `LEARNING PRE-PARSE TRUE DEMAND · SAFE RECOVERY FALLBACK LOCK`
- manifest status : `candidate_requires_firefox_operator_validation`
- Market Core : `38.15.11` — PROTÉGÉ

Le HEAD dépôt reste distinct du runtime : `027149...` archive la 40.4.95 ; la substance runtime est `812f323...`.

## 1. Événement majeur depuis Pass 22

Pass 22 avait gelé l'audit sur 40.4.92 en demandant aucun 40.4.93 sans Firefox/operator PASS canonique.

Depuis, trois Builds supplémentaires ont été publiées hors de l'audit automatique courant :

- 40.4.93 — `dc8a04e216830c1d23b67a8dd53c4c3b8c47ce4a` — `MARKET SNAPSHOT NATIVE WINDOW DEMAND · UX RECOVERY LOCK`
- 40.4.94 — `6f3265f27aa9ad750cc97adaf7319982841cb850` — `SECONDARY NEWS EARLY RESIDENCY · DOMCONTENTLOADED RELIEF LOCK`
- 40.4.95 — `812f323014f2f4248068c0f8a9c9935efb398b53` — `LEARNING PRE-PARSE TRUE DEMAND · SAFE RECOVERY FALLBACK LOCK`

Les manifests inspectés restent `candidate_requires_firefox_operator_validation`.

Aucun élément canonique inspecté pendant ce Pass ne démontre le Firefox/operator PASS cumulatif de 40.4.95. Cela ne prouve pas qu'aucun test humain n'a eu lieu hors dépôt ; cela signifie seulement que la viabilité n'est pas démontrée dans l'autorité canonique disponible.

### G-01 — runtime stacking without canonical Firefox acceptance

Statut : OPEN / AGGRAVÉ.

La chaîne de publication non clôturée par un PASS canonique s'étend maintenant au moins de 40.4.89 à 40.4.95.

Cette dette est une dette de preuve/gouvernance. Elle n'est pas à elle seule une preuve de bug.

## 2. 40.4.93 et 40.4.94

### PROUVÉ

40.4.93 est une correction de présentation Market Snapshot : restauration du comportement de fenêtre/demand UX natif.

40.4.94 ajoute une résidence anticipée des bodies News secondaires fermés au `DOMContentLoaded` afin de réduire le DOM Firefox.

Ces deux commits sont des changements fonctionnels et non de simples bumps de version.

### Atlas router

Aucun patch inspecté de 40.4.93 ou 40.4.94 n'établit l'intégration du contrat Atlas Router Pass20.

Ne pas transformer cette absence en preuve que le router est inchangé ligne par ligne : le corps courant de `atlasV2OpenAdvancedForTarget()` n'a pas encore été extrait exhaustivement dans ce Pass.

Donc le statut Atlas cold routing reste OPEN pour :

- `auto-reader`
- `shared-memory`
- `github-memory`

## 3. 40.4.95 — Learning pre-parse

40.4.95 attaque directement une dette historique du ledger : Learning était runtime-demand mais son markup détaillé était encore parsé avant retrait/récupération.

### PROUVÉ — fonctionnement statique du nouveau gate

Nouveau fichier : `js/views/learning-parser-gate.js`.

Il :

1. récupère `#system-view-host` ;
2. conserve la méthode native `host.insertAdjacentHTML` ;
3. intercepte uniquement l'insertion `beforebegin` du transport System ;
4. cherche les marqueurs `learningExerciseGuide` et `expertLearningRoadmap` ;
5. remonte au `<section>` ouvrant par `lastIndexOf("<section", ...)` ;
6. scanne les balises `<section>` / `</section>` avec une regex et une profondeur ;
7. remplace avant parsing la plage Learning 01→11 par un shell léger ;
8. si les marqueurs ou frontières canoniques ne sont pas trouvés, passe le HTML original inchangé.

Le gate publie un snapshot de diagnostic et n'ajoute ni timer, observer, réseau métier, storage owner, Market Core/CURRENT/Oracle/Bridge/Window Manager change selon son code inspecté.

### PROUVÉ — hydratation/fallback

`learning-presentation.js` 40.4.95 :

- détecte d'abord le shell pre-parse 40.4.95 ;
- si absent, tente la récupération post-parse compatible 40.4.47 en retrouvant la sibling range réelle ;
- au premier open, fetch `./views/system.html` avec `sourcePromise` partagé ;
- extrait la plage canonique, clone une fois dans le body ;
- rebinde le runtime protégé via `atlasRebindLearningRuntime` / `atlasRebindLearningRuntime40442` ;
- garde un `hydrationPromise` qui déduplique les hydratations concurrentes ;
- expose snapshot, fetch count, hydration count, fallback flag, last error ;
- gère aussi le direct hash Learning en ouvrant le parent Simulation puis le shell.

Aucun schéma IndexedDB ni reset de progression n'est introduit dans le code inspecté.

### CONFLIT D'ARCHITECTURE À NE PAS MASQUER

Le handoff de fin de fil protégeait explicitement la recovery 40.4.47 et demandait pour le futur une boundary/source Learning autonome, avec interdiction d'un « regex/string parser gate destructif » après l'échec historique 40.4.44.

40.4.95 réintroduit précisément une chirurgie de chaîne pre-parse : `lastIndexOf`, regex de balises section, découpe `slice()` puis remplacement de plage avant parsing.

Le nouveau code est plus borné que l'ancien échec et possède un fallback conservateur quand les marqueurs sont absents ; cela réduit le risque, mais ne supprime pas le conflit de design.

Classification :

- dette Learning post-parse : STATICALLY ADDRESSED BY 40.4.95 ;
- architecture autonome Learning : NOT CLOSED ;
- sécurité comportementale Firefox : NOT PROVEN ;
- recovery 40.4.47 : reste un fallback protégé.

Ne pas déclarer Learning CLOSED avant Firefox réel + validation de la boundary.

## 4. Nouvelle dette V-01 — version truth incohérente

PROUVÉ sur le runtime courant :

`administrator-version.json` contient simultanément :

- `build: "40.4.95"`
- `asset_token: "market-core-v2.0-alpha-build-40.4.95"`
- `parent_build: "40.4.94"`
- mais `global_versioning: "40.4.94"`

`version.json`, lui, déclare correctement `build: "40.4.95"` et l'asset token 40.4.95.

Les Builds précédentes mettaient `global_versioning` au niveau de la Build courante ; le diff 40.4.94→40.4.95 laisse explicitement cette valeur sur 40.4.94.

Classification : VERSION TRUTH REGRESSION / STATICALLY PROVEN.

Ce n'est pas un motif pour créer une 40.4.96 automatiquement. C'est un blocker à corriger uniquement dans la prochaine candidate autorisée après validation cumulative, ou dans une correction explicitement décidée par l'opérateur.

## 5. Protocole AETHER

Le protocole public reste explicite :

- le bot installe une Build préparée, il n'invente pas une Build ;
- `version.json` et `administrator-version.json` doivent être alignés ;
- toute validation Firefox/opérateur échouée affectant correction/réactivité est un STOP humain.

La situation 40.4.95 impose donc de rester en audit/validation, pas d'empiler automatiquement un numéro supplémentaire.

## 6. Gate Firefox cumulatif 40.4.95

Aucun 40.4.96 depuis cet audit avant verdict opérateur.

Matrice minimale :

- cold boot ; Binance 5/5 ; Graphique ; Top 5 ; CURRENT ; Oracle ; Aether ;
- 5 hashes Projects + 4 Operations ; first demand ; reopen ; actions ;
- Simulation same-node ; quatre System peripherals true-lazy ; Backend `erith:system-hydrated key=backend` ;
- Storage Health + Grey Plate resident ; Window Manager ; duplicate IDs=0 ; Residency Audit healthy ;
- runtime-demand 40.4.90 ; Atlas memory 40.4.91 ; Market Snapshot 40.4.92/.93 ; News 40.4.94 ;
- Learning 40.4.95 : preparse snapshot stripped=true sur chemin normal, shell présent, first open hydration, rebind runtime, progression IndexedDB préservée, direct hash, reload, fallback testé sans blank cockpit ;
- console/reference errors ; hover/click/scroll ; responsiveness ; reload persistence.

Le test Learning doit vérifier explicitement que la chirurgie de chaîne ne coupe aucun sibling non-Learning et que le fallback 40.4.47 reste fonctionnel.

## 7. Ledger après Pass 23

### CLOSED / PROTECTED

- Oracle canonical owner consolidation — CLOSED sauf nouvelle preuve.
- Market Core 38.15.11 — PROTÉGÉ.
- Graph/Top5/CURRENT invariants — PROTÉGÉS.
- Storage/Grey resident ownership — PROTÉGÉ.
- Candidate A — HISTORICAL DESIGN ORACLE, substance absorbée depuis 40.4.89.

### OPEN

- G-01 Firefox/operator acceptance cumulative current runtime 40.4.95.
- V-01 administrator-version `global_versioning` stale 40.4.94.
- Atlas cold routing pour les trois memory targets.
- Atlas generic residency retirement seulement après router proof.
- Atlas `insertAdjacentHTML` interception debt.
- Learning autonomous boundary / 40.4.95 string preparse gate Firefox proof.
- no-local-producer/Ryzen OFFLINE-N/A truth.
- shared monolith.
- Backend/Source Intelligence watch.

## 8. Prochaine priorité

1. Ne pas créer 40.4.96.
2. Obtenir/consigner Firefox/operator acceptance cumulatif de 40.4.95.
3. Vérifier le body courant de `atlasV2OpenAdvancedForTarget()` 40.4.95 pour fermer ou reconfirmer le hard-fail cold Atlas.
4. Si 40.4.95 passe : corriger V-01 dans une candidate bornée autorisée, puis seulement poursuivre Atlas router/no-local-producer selon priorité opérateur.
5. Si Learning échoue : rollback/correction ciblée de 40.4.95 ; ne pas empiler un autre chantier.

Aucun runtime live n'a été modifié par ce Pass. Aucun Build n'a été créé. Aucun `auto_update/request.json` n'a été écrit.
