# Agent-Crypto @erith.IA — Audit cumulatif Pass 05

Date: 2026-08-28
Mode: READ-ONLY RUNTIME AUDIT / COORDINATION ONLY
Runtime live authority: `public/agent_crypto_erith_ia/administrator/`
Runtime live build: `40.4.88`
Market Core: `38.15.11` — PROTECTED
Base audit authority: Pass 04 `da3e8ae359d7be938c40ada34ca9dcba576420e7`

## 1. HEAD dépôt vs runtime live

Au début du passage, le HEAD dépôt n'était plus Pass 04 : deux commits automatiques d'archive avaient été ajoutés après Pass 04 :

- `6b248da1dab2c633520b729ccdda1cc0a04335a9` — archive atlas top 50 market snapshot ;
- `f7e7ed76d58e8463f0796cdbe47602042cf7e739` — archive news sentinel world to market feed.

Ils ne modifient pas l'Administrator runtime. Le dernier commit runtime autoritaire reste `0b8672c4d2481bf21205e2cc74082ea591175d08` / 40.4.88.

## 2. APIs legacy relues

### Projects

`projects-demand-residency.js` ne possède qu'une responsabilité : appeler `ErithPresentationLifecycle.registerClosedBodyFamily()` pour les cinq shells Projects puis exposer `globalThis.ErithProjectsDemandResidency40412` comme snapshot/diagnostic de cette registration.

Aucun moteur métier, fetch, timer, observer, storage write ou rebind n'est détenu par ce fichier.

État Pass 05 : **PROVEN RETIRABLE AS PRODUCTION LOAD OWNER**, sous réserve finale de recherche de compatibilité repo-wide.

### Operations

`operations-demand-residency.js` suit exactement le même modèle : registration générique des quatre shells + exposition de `globalThis.ErithOperationsDemandResidency40413`.

Le vrai runtime d'actions questionnaire/commandes appartient déjà à `operations-presentation.js` et à ses rebinds après hydratation.

État Pass 05 : **PROVEN RETIRABLE AS PRODUCTION LOAD OWNER**, sous réserve finale de recherche de compatibilité repo-wide.

### System

`system-demand-residency.js` 40.4.88 expose :

- `ErithSystemDemandResidency40488` ;
- alias de compatibilité `ErithSystemDemandResidency40414` ;
- `__AGENT_CRYPTO_SYSTEM04_RECOVERY_40488__`.

Le commentaire du code précise que l'alias 40414 existe pour d'anciens diagnostics. Le fichier ne détient aucun moteur métier. Sa registration actuelle couvre Simulation + Commandes + Backend + Safety + Physical Security.

Pass 05 confirme la cible minimale : conserver cette couche uniquement pour `details[data-collapse-key="simulation"]`. Les quatre autres shells ont déjà leur vrai owner true-lazy dans `system-presentation.js`.

État : **PARTIAL RETIRE PROVEN; SIMULATION RETAIN**.

## 3. Diagnostic stale confirmé

`residency-audit.js` 40.4.41 encode toujours :

- `EXPECTED_REGISTERED = [projects, operations, system, atlas]` ;
- `EXPECTED_TRUE_LAZY = [oracle]`.

Il vérifierait donc artificiellement comme erreurs une consolidation correcte de Projects/Operations. Il ne peut pas servir de gate de Candidate A sans mise à jour.

Le diagnostic est cependant demand-loaded et read-only ; son obsolescence ne crée pas de coût de cold boot.

## 4. Candidate A — payload minimal exact proposé

Aucune Candidate A n'est encore créée dans ce passage. Le payload minimal qui devra être prouvé avant génération est maintenant borné à trois fichiers runtime seulement :

1. `administrator/index.html`
   - retirer uniquement les deux `<script>` production-load de `projects-demand-residency.js` et `operations-demand-residency.js` ;
   - conserver `view-lifecycle.js` car System/Simulation et Atlas main l'utilisent encore ;
   - conserver `system-demand-residency.js` ;
   - ne toucher à aucun script Market/Graph/CURRENT/Oracle/Atlas/Learning/Bridge.

2. `administrator/js/views/system-demand-residency.js`
   - réduire `selectors` à `details[data-collapse-key="simulation"]` seulement ;
   - conserver Storage Health + Grey Plate résidents ;
   - conserver les aliases System nécessaires tant que leur non-utilisation n'est pas démontrée repo-wide ;
   - aucun nouveau handler/timer/fetch/observer/storage owner.

3. `administrator/js/views/residency-audit.js`
   - remplacer l'attente historique par un diagnostic owner-aware ;
   - expected generic registrations : System(Simulation) + Atlas main/per-current contract seulement ;
   - true-lazy transports reconnus : Projects, Operations, Oracle, System peripheral ; Atlas peripheral reporté tant que router debt reste ouvert ;
   - vérifier duplicate IDs, protected cockpit, open-detached incohérences, owners attendus et absence de double ownership prouvée ;
   - rester read-only/manual/demand-loaded, zéro timer/observer/fetch/storage mutation.

Les fichiers Projects/Operations legacy peuvent rester dans le dépôt comme historique/tombstone dans cette première candidate. **Pas de DELETE automatique.**

## 5. Budget runtime statique

Le changement conceptuel Candidate A est monotone vers moins de travail :

- deux scripts parser-load retirés ;
- deux familles de registrations génériques retirées ;
- quatre selectors System retirés d'une registration ;
- aucun timer ajouté ;
- aucun observer ajouté ;
- aucun WebSocket ajouté ;
- aucun fetch métier ajouté ;
- aucun storage write ajouté ;
- aucun nouveau DOM owner métier ajouté.

Donc le budget runtime ne peut pas augmenter par conception de ce payload. Cette conclusion reste **statique** : la preuve Firefox/opérateur reste obligatoire avant toute publication live.

## 6. Compatibilité cachée — état de preuve

Les fichiers relus montrent que les globals Projects/Operations sont des APIs diagnostics/snapshot, et que l'alias System 40414 est explicitement un alias de compatibilité diagnostic.

Cependant, la recherche de code GitHub connectée a retourné des résultats incomplets/vides pour les symboles exacts. Il serait incorrect d'écrire « aucune référence repo-wide » comme fait définitivement prouvé sur cette seule base.

Classification honnête :

- responsabilité métier cachée dans les trois legacy owners : **NON OBSERVÉE / très improbable** ;
- absence absolue de référence textuelle repo-wide aux globals legacy : **NON ENCORE PROUVÉE** ;
- Candidate A : **BOUNDARY READY, NOT YET AUTHORIZED**.

La prochaine preuve doit utiliser une méthode de recherche de contenu exhaustive ou l'inventaire complet des scripts runtime/manifests avant de retirer les deux scripts du graphe.

## 7. Invariants protégés

Candidate A ne doit modifier :

- ni Market Core 38.15.11 ;
- ni Graph Context V7 ;
- ni Graphique ;
- ni Target Top 5 ;
- ni CURRENT critique / IndexedDB ;
- ni Oracle ;
- ni Atlas routing/peripheral hook/main cockpit ;
- ni Learning 40.4.47 ;
- ni Bridge / Source Intelligence ;
- ni Window Manager geometry ;
- ni Aether one-lane status geometry ;
- ni monolithe métier partagé.

## 8. Décision Pass 05

**Pas de Build. Pas de candidate package. Pas de modification runtime live.**

La Candidate A est maintenant réduite à un payload conceptuel de trois fichiers et ne mélange plus aucune dette Atlas/Learning/producer. Mais une dernière preuve de compatibilité repo-wide des aliases/globals est exigée avant création du package.

## 9. Prochaine cible — Pass 06

1. obtenir une recherche exhaustive des références runtime aux globals :
   - `ErithProjectsDemandResidency40412` ;
   - `ErithOperationsDemandResidency40413` ;
   - `ErithSystemDemandResidency40488` ;
   - `ErithSystemDemandResidency40414` ;
   - `__AGENT_CRYPTO_SYSTEM04_RECOVERY_40488__` ;
2. inspecter manifests/architecture ownership pour références indirectes ;
3. figer la matrice diagnostic VNext ;
4. si toutes références sont uniquement historiques/diagnostic, autoriser la création d'un package Candidate A dans `coordination/inter_ai_dialogues/agent_crypto/` sans toucher au live Administrator ;
5. Firefox/operator validation reste le gate avant publication runtime.
