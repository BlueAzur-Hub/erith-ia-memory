# Agent-Crypto 40.6.450 — EXECUTION COST SOURCE TRUTH FRESHNESS

## Objet
Fermer la dette temporelle de `STRATEGY A · EXECUTION COST TRUTH` sans modifier Strategy A métier.

## Défaut reproduit par l'audit Astra
Une quote OKX datée de 2020 pouvait conserver `ok=true` parce que le lecteur validait le fournisseur, le statut, le bid/ask et le croisement, mais pas l'âge de `observed_at_utc`. La latence de requête affichée n'était pas la fraîcheur du prix.

## Contrat appliqué
Aucun seuil indépendant n'est inventé :
- contrat fallback = `architecture/private-backend-sources.json → cache.ttl_seconds = 15` ;
- si le payload Source Truth expose un seuil CEX explicite, il prévaut ;
- tolérance timestamp futur = 30 s, cohérente avec le garde de fraîcheur canonique existant.

États :
- **FRESH** : quote exploitable pour cette mesure ;
- **STALE** : quote trop ancienne, non exploitable ;
- **UNKNOWN** : timestamp absent, invalide ou incohérent dans le futur, non exploitable.

## Durcissements associés demandés par l'audit
- heure de quote, heure de réception et heure de calcul séparées ;
- paire/devise BTC/EUR contrôlée avant d'accepter les alias bid/ask génériques ;
- booléens, objets et chaînes blanches ne sont plus des nombres ;
- quote croisée reste refusée ;
- Kraken reste disponible : si OKX est STALE/UNKNOWN/INVALID, résultat global = PARTIAL si Kraken est valide.

## Tests avant commit
Le module candidat réel a été exécuté dans un runtime JS isolé et son `self_test()` retourne PASS :
fresh · stale 2020 · timestamp absent · timestamp futur · crossed book · mauvaise devise · booléens/blancs · epoch numérique · Kraken préservé en PARTIAL.

Receipt : `EXECUTION_COST_FRESHNESS_TEST_40.6.450.json`.

## Protégé
Backend .441 · Graphique .442 · Oracle .445 · loader comportement .446 · HTML .448 · lisibilité .449 · Market Core 38.15.11 · Aether.

Le loader .446 ne change pas de comportement : seul son token d'asset Execution Cost passe à 40.6.450 pour éviter de servir l'ancien JS depuis le cache.
