# Agent-Crypto 40.6.467 — SHADOW CANONICAL TICKET + DURABLE READINESS TRUTH

Deux anomalies d'affichage de 40.6.466 sont corrigées, sans modifier Strategy A.

## 1. Ticket canonique

Le panneau Real Venue Cost Shadow Truth pouvait afficher `— €` quand l'Audit Demand montait avant la résidence de `AgentCryptoStrategyACanonicalSpec`.

40.6.467 garde l'autorité du spec canonique et utilise **50 €** comme fallback explicite de pré-résidence, valeur déjà définie dans `strategy-a-canonical-spec.js > profile.ticket_eur`.

## 2. Durable Evidence

En .466, Reconciliation/Crosswalk/Completeness pouvaient rendre des zéros alors que l'IndexedDB Durable Evidence n'était pas encore hydratée.

40.6.467 distingue désormais :
- **DURABLE_LOADING** : API absente ou store pas encore ready → valeurs durables affichées `…`, aucune conclusion d'absence;
- état réel après `ready=true` : comptes durables, liens et complétude calculés normalement.

Les surfaces se rafraîchissent sur :
- `agent-crypto:strategy-a-durable-evidence-ready`;
- `agent-crypto:strategy-core-ready`;
- `agent-crypto:postboot-runtime-ready`.

Aucune écriture IndexedDB ajoutée, aucun backfill, aucun seuil, aucun ordre réel, Market Core 38.15.11 intact.
