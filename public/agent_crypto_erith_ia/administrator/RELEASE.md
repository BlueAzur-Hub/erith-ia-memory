# Agent-Crypto 40.6.452 — STRATEGY DEMAND LOADER RETRY + SELF TEST

## Objet
Fermer les deux défauts loader confirmés par l'audit Astra, sans toucher au métier Strategy.

## Défaut 1 — script chargé sans API
Avant .452, un événement `load` pouvait poser `dataset.loaded=1` même si le script n'avait pas créé son API attendue. La tentative suivante retrouvait ce nœud `loaded=1`, retournait encore `false` et ne recréait jamais le script.

### Correction
- succès transport ≠ succès module ;
- succès seulement si `load` **et** API attendue présente ;
- si API absente : nœud marqué failed puis retiré ;
- si un ancien nœud `loaded=1` existe sans API : il est considéré stale, retiré et recréé dans la demande explicite courante ;
- aucun retry automatique : la reprise vient uniquement d'un nouvel `ensure()` / nouvel événement opérateur.

## Défaut 2 — self_test trompeur
Les anciennes clés `recurring_timer:false`, `observer:false`, `storage_write:false` étaient passées dans `every(Boolean)`. Le test ne pouvait donc jamais être vrai.

### Correction
Assertions positives :
- `no_recurring_timer:true`
- `no_observer:true`
- `no_storage_write:true`
- `no_automatic_retry_loop:true`

Les métadonnées réelles restent séparément à `false`.

## Test avant commit
Harness Node isolé avec faux DOM :
1. load transport sans API → FAIL CLOSED + script retiré ;
2. deuxième demande explicite → 3/3 APIs chargées ;
3. nœud historique `loaded=1` sans API → retiré + remplacé ;
4. `self_test().pass === true`.

Receipt : `STRATEGY_AUDIT_LOADER_RETRY_TEST_40.6.452.json`.

## Protégé
.441 Backend · .442 Graphique · .445 Oracle · .448 HTML · .449 lisibilité · .450 fraîcheur · .451 tableaux · Market Core 38.15.11 · Aether.
