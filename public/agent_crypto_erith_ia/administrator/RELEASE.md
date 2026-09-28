# Agent-Crypto 40.6.456 — PRIVATE SOURCE LOADER READY FAIL-CLOSED

## Objet unique
Corriger le contrat interne `ready` du loader Source Truth sans modifier Source Truth lui-même.

## Cause prouvée
Depuis 40.6.440, `sourceOwnerReady()` appelait `settleReady()` avant de vérifier le résultat de `downstreamBounded()`. Un timeout ou une erreur downstream pouvait donc produire simultanément :
- `state = ready` ;
- `ensure() = true` ;
- événement `erith:private-source-runtime-loaded` ;
- et `last_error = downstream-timeout/error`.

Le marqueur DOM `dataset.loaded=true` du DEX freshness guard pouvait aussi être accepté comme prêt même si `AgentCryptoDexFreshnessGuard.active !== true`.

## Correction
`READY` exige maintenant les quatre conditions :
1. propriétaire Source Truth présent et montable ;
2. `mount()` sans erreur ;
3. `AgentCryptoDexFreshnessGuard.active === true` ;
4. downstream borné = `ready`.

Sinon : `state=error`, `ensure()=false`, `last_error` explicite et **aucun événement runtime-ready**.

Une demande explicite ultérieure retente le downstream en réutilisant le Source Truth déjà chargé.

## Observabilité
`snapshot()` expose maintenant `runtime_ready`, `source_owner_ready`, `freshness_guard_ready`, `downstream_state`. Un `self_test()` pur vérifie le contrat fail-closed.

## Protégé
Market Core 38.15.11 · Backend Source Truth métier · Aether .453 · cycle event .454 · Execution Cost auto .455 · Strategy / Oracle / Risk / Paper.

Aucun nouveau timer, observer, storage owner, endpoint métier ou ordre réel.
