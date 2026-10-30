# Agent-Crypto @erith.IA — AUDIT PASS 27

Date : 2026-08-29
Nature : COORDINATION ONLY / NO RUNTIME BUILD / NO AUTO-UPDATE WRITE

## 0. Autorités vérifiées

Checkpoint entrant : Pass 26 commit `54a202de1e9f38f4ed6a2606e63453a9004c722c`.

HEAD dépôt observé avant publication du présent rapport : `4c7a6d6435f4293803c3631b7531038ab41743d6`, commit d'archive automatique `coordination: archive Agent-Crypto 40.4.99 canonical`.

Nouvelle autorité runtime Administrator détectée immédiatement après Pass 26 :

- Build : `40.4.99`
- runtime commit : `8a72f5b5f39345c86230bcdf362ce28c7345c83e`
- parent : Pass 26 `54a202de1e9f38f4ed6a2606e63453a9004c722c`
- release : `ATLAS COLD ROUTER · PRECOMPILED HOT SHELL · PARSER DEBT RETIREMENT LOCK`
- status manifest : `candidate_atlas_cold_router_operator_validation_required`
- Market Core : `38.15.11` protégé.

Le runtime 40.4.99 est donc une candidate publiée nécessitant encore validation opérateur. Aucun Build supplémentaire ne doit être empilé depuis cet audit.

## 1. Pivot Pass 27

Le plan initial était de redessiner un successor router contre 40.4.98. Ce plan est devenu obsolète dès le contrôle HEAD : 40.4.99 modifie précisément le transport Atlas.

L'audit a donc basculé sur 40.4.99 au lieu de produire un design contre une base périmée.

## 2. Ce que 40.4.99 change réellement

Le commit 40.4.99 précompile dans `js/views/atlas-presentation.js` le HOT shell équivalent au DOM 40.4.98 après preprocessing. Il retire le boot-time full-markup preprocessing / interception globale `Element.prototype.insertAdjacentHTML` de l'ancien owner Atlas.

Le nouveau `js/views/atlas-peripheral-lazy.js` 40.4.99 reste owner des bodies cold et charge `views/atlas.html` seulement à la demande.

Ceci solde une partie réelle de la dette `insertAdjacentHTML` : l'interception globale de prototype Atlas au boot est retirée dans la lignée 40.4.99.

Mais cette opération n'est PAS équivalente à corriger le routeur canonique Command Center / module picker / direct hash.

## 3. Preuve : le routeur canonique app.js n'a pas reçu Pass20

Le diff runtime 40.4.98 → 40.4.99 ne modifie `administrator/app.js` que de 10 lignes (+8/-2), autour de `atlasAnalyticalFingerprintPayload()` afin de pinner la compatibilité de fingerprint CURRENT.

Aucune chirurgie `atlasV2OpenAdvancedForTarget()` n'apparaît dans le commit 40.4.99.

Le manifest 40.4.99 contient d'ailleurs encore les assertions `atlas_router_changed: false` dans les contrats hérités de l'owner consolidation.

Conclusion : le routeur canonique identifié Pass19/20 n'a pas été remplacé par un nouveau owner dans `app.js`.

## 4. Preuve : les trois IDs de navigation restent absents du HOT shell froid

Le HOT shell précompilé contient bien les owning details :

- `details[data-collapse-key="auto-reader"]`
- `details[data-collapse-key="shared-memory"]`
- `details[data-collapse-key="github-memory"]`

Mais leurs bodies cold ne contiennent qu'un placeholder `data-atlas-peripheral-lazy=...`.

Le target canonique `#auto-reader` n'est pas présent dans le shell froid ; même constat structurel pour Shared/GitHub Memory. Les vrais targets restent dans `views/atlas.html` et sont injectés par hydration.

Donc le modèle prouvé Pass15/20 reste applicable au chemin Command Center / picker / direct hash : tant que `atlasV2OpenAdvancedForTarget()` exige le target DOM avant le handoff lazy, un target cold peut encore retourner `false` avant ouverture/hydratation.

### Classification

`Atlas cold BODY hydration 40.4.99` = IMPLEMENTED / OPERATOR VALIDATION REQUIRED.

`Atlas cold NAVIGATION router Pass20` = STILL OPEN STATICALLY.

Le nom de release `ATLAS COLD ROUTER` ne doit pas être utilisé comme preuve que le router canonique `app.js` est corrigé : dans le code inspecté, le nouveau composant est essentiellement le HOT-shell/cold-body transport owner.

## 5. Owner terminal handoff 40.4.99

`atlas-peripheral-lazy.js` a été fortement réécrit, mais son terminal contract pertinent reste :

Succès :

- `details.dataset.atlasHydration40425="ready"`
- `hydrated.add(key)`
- rebind
- événement `erith:presentation-resident {family:"atlas", key, build:"40.4.99"}`.

Erreur :

- `details.dataset.atlasHydration40425="error"`
- message d'erreur dans le body
- `return false`
- PAS d'événement terminal d'échec dans l'owner inspecté.

Donc le blocage terminal de Pass26 n'est pas fermé par 40.4.99.

Les recherches exactes `presentation-error` et `hydration-error` sur l'Administrator ne produisent aucun résultat exploitable, mais GitHub marque ces recherches `incomplete_results=true`. Elles ne sont donc PAS élevées en preuve repository-wide d'absence. La preuve forte reste limitée à l'owner exact 40.4.99 inspecté.

## 6. Auth/mode ordering : redesign requis, pas patch au hard-fail

Le blocage A de Pass26 reste valide : un successor ne doit pas ouvrir le owning details au moment du `target == null` avant les gates mode/auth.

Le design statiquement cohérent doit être un refactor du MÊME owner canonique, pas un second router :

1. normaliser hash/id ;
2. résoudre l'entrée manifest par id, même si le DOM target est absent ;
3. appliquer les gates mode / Intermediate ;
4. appliquer la gate Essential auth + pending hash existante ;
5. seulement après autorisation Advanced, résoudre le DOM target ;
6. si target présent : continuer exactement la transaction historique ;
7. si target absent ET id dans `{auto-reader,shared-memory,github-memory}` : lancer le handoff lazy de l'owner ;
8. après terminal success, re-résoudre le target et reprendre la transaction canonique ;
9. unknown missing target : `false`, comme aujourd'hui.

Ce refactor évite de dupliquer l'auth. Il déplace seulement l'autorisation manifest/mode/auth en amont de la matérialisation DOM pour les cibles connues.

API lock : conserver le comportement boolean synchrone pour les cibles déjà présentes et les callers historiques. Ne pas convertir globalement `atlasV2OpenAdvancedForTarget()` en Promise.

## 7. Pourquoi aucun successor staging exécutable n'est créé dans Pass27

Sous le scope imposé jusque Pass26 :

- zéro owner change ;
- zéro polling ;
- zéro MutationObserver ;
- zéro retry ;
- zéro timeout arbitraire comme frontière de correction ;
- zéro direct hydrate/fetch parallèle ;

il manque toujours un terminal failure push owner-grounded.

Un successor complet a donc deux options seulement :

### Option A — élargissement minimal du contrat owner (préférée techniquement, mais nouveau scope)

Faire émettre par `atlas-peripheral-lazy.js` un terminal failure event explicite et borné au même owner qui connaît la Promise réelle, par exemple un événement Atlas presentation terminal avec `{family,key,status:"error"}`. Le router écoute success + failure et n'invente aucun timeout/retry.

Ce changement doit être audité comme scope séparément approuvé ; il ne doit pas réintroduire de second fetch, scheduler ou owner.

### Option B — conserver owner inchangé

Alors aucune continuation router exacte ne peut distinguer proprement `hydration encore lente` de `hydration définitivement en erreur` sans polling/observer/timeout. Sous les budgets actuels, cette option reste bloquée statiquement.

Conclusion Pass27 : ne pas materialiser un nouveau staging executable tant que ce choix de scope n'est pas fermé.

## 8. Staging Pass25/26

`candidate_atlas_router_pass25_40_4_98_staging/` reste FROZEN / STATICALLY REJECTED / DO NOT INTEGRATE.

Ne pas le rebaser mécaniquement sur 40.4.99. Il conserve une valeur d'oracle de race/pending/generation uniquement.

## 9. Dette insertAdjacentHTML

La dette spécifique `Atlas Element.prototype.insertAdjacentHTML interception` peut être reclassée :

- interception globale prototype Atlas : RETIRED par 40.4.99 ;
- `host.insertAdjacentHTML("beforebegin", html)` simple dans `atlas-presentation.js` : reste une insertion locale ordinaire, pas le monkeypatch prototype historique.

Ne pas confondre les deux.

Firefox reste nécessaire pour vérifier que le HOT shell précompilé est réellement équivalent et que first-open/reopen restent fonctionnels.

## 10. Gates opérateur 40.4.99

Avant toute Build suivante :

- cold boot HOT Atlas cockpit / CURRENT / Bridge ;
- Command Center → auto-reader/shared-memory/github-memory depuis cold ;
- module picker Open → trois cibles cold ;
- direct hash cold → trois cibles ;
- auth Essential → pending hash → unlock → reprise sans hydration pré-auth ;
- Intermediate restrictions inchangées ;
- click direct sur summary → hydration ;
- first hydration / reopen ;
- same-key repeated intent ;
- mid-load supersession ;
- close during load ;
- source failure : aucun pending router stale ;
- CURRENT/fingerprint unchanged on pure UI build ;
- duplicate IDs = 0 ;
- console errors = 0 ;
- Graph/Top5/Binance/Oracle/Aether smoke ;
- responsiveness hover/click/scroll ;
- reload persistence.

À ce stade, 40.4.99 est `candidate_atlas_cold_router_operator_validation_required`; ne pas déclarer PASS sans preuve opérateur réelle.

## 11. OPEN / CLOSED après Pass27

### CLOSED / materially reduced

- G-01 migration governance seal 40.4.98 remains historical CLOSED.
- V-01 version truth remains CLOSED.
- Atlas global `Element.prototype.insertAdjacentHTML` preprocessing interception debt = RETIRED in 40.4.99.
- Oracle owner duplication = CLOSED unless new evidence.

### OPEN

- Firefox/operator acceptance 40.4.99.
- Canonical Atlas cold navigation router for auto-reader/shared-memory/github-memory.
- Auth/mode-before-hydration refactor in same canonical owner.
- Owner-grounded failure terminal handoff or approved minimal owner-contract extension.
- Atlas generic residency retirement only after router proof.
- no-local-producer / Ryzen OFFLINE-N/A.
- shared monolith.
- Learning autonomous boundary/source optional architectural debt.
- Backend/Source Intelligence watch.
- Web Classic evolves separately.

## 12. PASS 28 PRIORITY

If no real Firefox evidence exists:

1. inspect 40.4.99 operator evidence / any subsequent runtime before designing anything;
2. do not stack another Administrator Build;
3. if 40.4.99 remains current, define a NON-LIVE successor contract with manifest/mode/auth gate before DOM resolution;
4. separately define the smallest possible owner terminal failure event contract and its budget proof;
5. only then create coordination staging; no runtime package until static PASS + Firefox operator PASS.

No `auto_update/request.json` was created. No runtime hash/token/version was invented. No runtime file was modified by this Pass.