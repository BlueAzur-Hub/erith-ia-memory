# Agent-Crypto @erith.IA — FIN DE FIL FINALE · PASS 19

Date : 2026-08-28
Nature : HANDOFF CANONIQUE / COORDINATION ONLY / NO RUNTIME BUILD
Runtime live : `public/agent_crypto_erith_ia/administrator/`
Build runtime publié : `40.4.88`
Commit runtime authority : `0b8672c4d2481bf21205e2cc74082ea591175d08`
Release : `SYSTEM 04 INTERACTION RECOVERY · VERSION TRUTH LOCK`
Market Core : `38.15.11` — PROTÉGÉ
Dernier audit coordination : Pass 19 — `18126e3a42edc31fa6d028b04ec8372c4e6ddd24`
Parent handoff détaillé : `2026-08-28_AGENT_CRYPTO_END_OF_THREAD_FINAL_PASS18_40_4_88_HANDOFF.md`

Ce document est le solde final du fil. Il supersède Pass18 uniquement là où Pass19 apporte une preuve nouvelle. Il ne crée aucune Build et ne modifie pas le runtime live.

## 1. Autorité de vérité

Toujours vérifier dans cet ordre :
1. GitHub public réellement publié et HEAD réel ;
2. commit runtime exact de l’Administrator ;
3. handoffs/audits coordination les plus récents ;
4. `Fil.Crypto.ChatGPT.22.07.2026(20260828-002851).txt` et sauvegardes plus récentes du même fil ;
5. Firefox opérateur ;
6. archives exactes des Builds ;
7. anciennes reprises ;
8. intuition.

HEAD dépôt et runtime live sont deux vérités distinctes. Au moment de ce handoff, le HEAD a déjà avancé au-delà de Pass19 avec les fichiers de fin de fil, sans modification du runtime Administrator.

## 2. Contrat historique à ne plus perdre

- Ne jamais recréer tardivement Graphique, Top 5, cockpit Atlas critique ou contrôles critiques sous les bindings.
- Same critical node = same node pendant la session.
- `CURRENT` est indépendant de l’écran et doit rester lisible sans démarrer un moteur local.
- Un owner = une responsabilité.
- Une section fermée peut être froide, mais l’ouverture doit conserver le comportement opérateur.
- Phase 2 = runtime réellement à la demande, pas seulement DOM compact.
- Firefox réel est une gate de publication.
- Ne jamais reproduire la dérive `.67/.68 → .80` hydrate/rebind/replay du cockpit critique.
- `40.4.66` est un témoin de réactivité, pas un gold absolu.
- Market Core, Binance, CURRENT, Graph Context V7, Graphique, Top 5, Oracle Math et IndexedDB critique sont protégés.

## 3. Runtime courant

`40.4.88` reste l’autorité runtime. Il corrige la régression Section 04 introduite par 40.4.85 : Storage Health et Grey Plate restent de vrais nœuds résidents ; leur root identity Window Manager ne doit plus être remplacée après binding.

Aucun audit Pass01→19 n’a publié une nouvelle Build runtime.

## 4. Dette CLOSED — ne pas rouvrir sans nouvelle preuve

### Oracle owner consolidation — CLOSED
`oracle-presentation.js` est l’owner canonique ; ancien demand residency = tombstone/inactif. Aucun second owner.

### Cause Section 04 / 40.4.85 — CLOSED
Cause prouvée : remplacement Storage/Grey après capture/binding. 40.4.88 retire ce mauvais owner.

### Projects generic residency responsibility — CLOSED
Projects 40.4.20 possède son vrai true-lazy presentation/hydration. Le vieux generic residency n’est ni owner Window Manager, ni owner des summary anchors, ni owner du body true-lazy.

### Operations generic residency responsibility — CLOSED
Même conclusion pour Operations 40.4.21.

### System ownership split — CLOSED comme cartographie
- Storage Health : RESIDENT/PROTECTED — `#atlasStorageHealth40198`.
- Grey Plate : RESIDENT/PROTECTED — `#atlasGreyPlateForensic40393`.
- Simulation : generic closed-body residency conservée pour la première candidate.
- Commandes, Backend, Safety, Physical Security : true-lazy via System presentation.

### Backend hydration handoff — CLOSED comme contrat
`system-presentation.js` émet `erith:system-hydrated`; Backend/Source Intelligence peut remonter sur le vrai body. Backend reste WATCH, pas chirurgie sans bug observé.

### Aether one-lane header — CLOSED/PROTECTED
Une seule lane physique ; pas de seconde ligne permanente ; Relancer/Rafraîchir et géométrie Graphique protégés.

### Atlas navigation attachment owner — CLOSED par Pass19
Correction importante par rapport au Pass18 : l’owner n’est plus « non résolu ».
Le root `public/agent_crypto_erith_ia/administrator/app.js` chargé dans le load graph est le propriétaire canonique de la navigation Atlas avancée :
- Command Center ;
- advanced anchors ;
- module picker `#atlasV2AdvancedModuleSelect` via `atlasV2OpenSelectedModule()` ;
- bouton `#btnOpenAdvancedModule` ;
- direct hash/hashchange via `atlasV2HandleHashTarget()`.
Tous convergent vers `atlasV2OpenAdvancedForTarget()`.

## 5. Candidate A — READY STATICALLY / BLOCKED BY FIREFOX

Staging non-live : `coordination/inter_ai_dialogues/agent_crypto/candidate_a_pass10_staging/`.

Périmètre exact :
1. `index.html` — retirer seulement les deux parser loaders generic Projects/Operations ;
2. `js/views/system-demand-residency.js` — generic System = Simulation seulement ;
3. `js/views/residency-audit.js` — VNext demand-only/read-only owner-aware ;
4. `architecture/administrator-ownership.json` — vérité owners actuelle ;
5. `version.json` — uniquement après staging final réel ;
6. `administrator-version.json` — idem.

Legacy Projects/Operations files restent physiquement présents pour rollback/forensic ; aucun delete.

Static proof : -2 parser scripts ; -2 generic registrations ; System selectors 5→1 ; aucun `app.js/js/app.js` métier changé ; aucun timer/observer/WebSocket/business fetch/storage writer ajouté ; JS syntax PASS.

BLOCAGE : Firefox baseline↔staging réel. Ne pas créer une Build pour « essayer ».

Acceptance : cold boot, Administration, 5 hashes Projects, 4 hashes Operations, first demand/reopen, Simulation, System peripherals, Backend event handoff, Storage/Grey connected, Window Manager, Atlas/Oracle smoke, Graph/Top5/CURRENT, duplicate IDs=0, console errors=0, responsiveness, reload persistence, Residency VNext healthy.

## 6. Atlas peripheral routing — OPEN, frontière exacte PROUVÉE

Targets : `#auto-reader`, `#shared-memory`, `#github-memory`.
Le lazy owner 40.4.35 retire leurs bodies au boot ; les IDs canoniques sont donc absents avant hydratation.

Pass19 ferme la cause exacte : `atlasV2OpenAdvancedForTarget()` est déjà LE routeur canonique unique, mais commence par résoudre `document.getElementById(id)` et retourne `false` si le target n’existe pas. Le bug n’est donc PAS « aucun handler » ; c’est un hard-fail pré-hydratation dans le routeur existant.

Future candidate Atlas séparée : étendre le routeur existant juste avant ce hard-fail, uniquement pour les trois lazy IDs :
`target -> key -> owning details -> pending/generation -> listener one-shot avant open -> details.open=true -> owner lazy existant hydrate -> erith:presentation-resident atlas/key -> re-resolve canonical ID -> continuer les semantics existantes scroll/focus/hash`.

Already hydrated : résolution immédiate.
Repeated same-key : join pending router operation.
Mid-load new hash : invalider ancienne génération, pas de stale focus.
Close during load : cancel/cleanup.
Failed sourcePromise : ne pas inventer retry policy.

INTERDIT : second router/click/hashchange owner ; fetch direct de `views/atlas.html` ; duplication/exposition de `hydrate()` privé ; retrait Atlas generic residency dans la même candidate ; refactor `insertAdjacentHTML` dans la même candidate ; toucher `#atlas-local-ai-collapse`.

## 7. Atlas insertAdjacentHTML — OPEN / HIGH RISK

Monkeypatch temporaire global mais borné. Dette architecturale réelle. Candidate séparée après router stabilisé : transport/preprocess Atlas explicite, sans prototype interception globale. Ne pas mélanger avec Candidate A ni premier router.

## 8. Atlas generic peripheral residency — OPEN après router

Auto Reader / Shared Memory / GitHub Memory sont déjà true-lazy et probablement redondants dans generic residency. Ne retirer ces selectors qu’après router + Firefox proof. Main cockpit `#atlas-local-ai-collapse` reste protégé.

## 9. No-local-producer / Ryzen — OPEN / PROUVÉ

La machine productrice Ryzen n’existe plus dans le système opérateur. L’ancien runtime peut déduire PRODUCTION hors Transformer Book et démarrer une supervision Bridge autorisée.

Vérité cible : producteur absent = `N/A / OFFLINE / NON CONFIGURÉ`; CPU/GPU/Ollama/Bridge local ne doivent pas afficher un faux idle 0%; aucun polling Bridge si aucun producteur explicitement configuré ; CURRENT/mémoires/Graph Context historiques restent lisibles.

Candidate séparée. Auth Admin ≠ compute role ≠ producer configured ≠ Bridge connected.

## 10. Learning — OPEN / PROTECTED

40.4.82 a rendu le runtime Learning demand. Recovery 40.4.47 reste protégée : valid DOM -> sibling range detach -> shell -> source `views/system.html` -> clone/rebind. Dette restante : contenu encore parsé avant retrait. Future amélioration = source/boundary autonome. Ne jamais revenir à une gate regex/string destructive.

## 11. Diagnostics — CLOSED pour le design / BLOCKED pour runtime

Ancien `residency-audit` 40.4.41 et architecture-freeze sont historiques/stale. VNext est défini dans Candidate A : owner-aware, read-only, demand-only, generic expected System+Atlas, System generic keys `[simulation]`, true-lazy Projects/Operations/System/Oracle, protected nodes connected, duplicate IDs=0. Ne pas réécrire les snapshots historiques pour faire croire qu’ils sont CURRENT.

## 12. Backend / Source Intelligence — WATCH

Demand loading déjà présent. Aucun bug runtime actuel justifiant une chirurgie supplémentaire. Observer seulement.

## 13. Shared monolith — OPEN / HIGH RISK

Le gros monolithe partagé reste une dette structurelle. Pas de refactor large tant que les petites frontières propriétaires et les Firefox gates ne sont pas stabilisées. Extraire seulement avec owner, invariants, diff et rollback prouvés.

## 14. Market / CURRENT / Graph / Top5 — PROTECTED

Ne pas toucher pour solder les dettes de residency/router :
- Market Core 38.15.11 ;
- Binance live ;
- Graph Context V7 ;
- Graphique ;
- Target Top 5 ;
- CURRENT critique ;
- IndexedDB critique ;
- Oracle math/model/data ;
- Window Manager geometry hors test de non-régression.

## 15. Ordre strict de reprise

1. Vérifier HEAD dépôt et runtime authority séparément.
2. Relire ce handoff + Pass19 + protocole AETHER auto-update.
3. Ne pas construire Candidate A avant Firefox baseline↔staging.
4. Si Candidate A PASS opérateur : seulement alors matérialiser version/hash/package exact et suivre protocole de publication.
5. Ensuite Candidate Atlas router séparée : patch minimal dans le routeur canonique existant.
6. Firefox proof Atlas.
7. Ensuite seulement considérer retrait generic Atlas peripherals.
8. Puis candidate no-local-producer séparée.
9. Learning parse debt après cela.
10. `insertAdjacentHTML` et monolithe en dernier, avec forte preuve.

## 16. Discipline de publication

Aucun write silencieux dans `public/agent_crypto_erith_ia/administrator/`.
Une candidate test doit être isolée sous coordination jusqu’à preuve.
Une vraie Build = version cohérente + hashes réels + package exact + contrôle syntax/static/non-régression + Firefox/operator + ZIP propre + cible GitHub + commit explicite.
Aucun Build juste pour avancer le numéro.

## 17. État final du fil

- Runtime live : 40.4.88 inchangé.
- Candidate A : statiquement prête, pas encore viable faute de Firefox réel.
- Atlas routing : cause et owner canonique désormais prouvés ; design de correction borné, aucune Build.
- Oracle : fermé.
- Backend : watch.
- No-local-producer : dette prouvée, candidate séparée.
- Learning : dette parse ouverte/protégée.
- Atlas hook : ouverte/high-risk.
- Shared monolith : ouverte/high-risk.
- Invariants Market/Graph/Top5/CURRENT : protégés.

Ne prétends jamais « toutes les dettes corrigées ». Elles sont ici SOLDÉES AU LEDGER : fermées, prouvées, bloquées ou ordonnées. La prochaine sœur doit reprendre à cet état exact, sans recommencer l’archéologie.