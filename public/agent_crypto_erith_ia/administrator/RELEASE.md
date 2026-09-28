# Agent-Crypto 40.6.453 — AETHER SOURCE READINESS TRUTH

## Objet unique
Empêcher Aether d'afficher **TOUTES LES SOURCES PRÊTES** lorsque la couche Source Truth / Source Intelligence n'est pas réellement prête et fraîche.

## Cause prouvée
Dans 40.6.452, `aetherSourcesModel()` décidait `PRÊTES` uniquement avec :
- Binance complet ;
- Book prêt ;
- Atlas Data disponible ;
- News disponibles.

Il ne lisait ni `ErithPrivateBackendSources.sourceIntelligence()`, ni le `freshness_gate` CEX. Le terrain a donc pu montrer simultanément Source Intelligence PARTIELLE / CEX périmé et Aether **TOUTES LES SOURCES PRÊTES**.

## Correction
Propriétaire unique : `js/aether.js`.

Le statut Aether `PRÊTES` exige maintenant :
1. Binance complet ;
2. Book prêt ;
3. Atlas prêt ;
4. News prêtes ;
5. Source Intelligence `state === "ready"` ;
6. `freshness_gate.ready === true` ;
7. CEX comparable complet.

API absente, intelligence absente, état partiel/stale ou fraîcheur non prête => **SOURCES PARTIELLES**.

Aether se repeint sur les événements existants :
- `erith:source-intelligence` ;
- `erith:source-intelligence-auto` ;
- `erith:private-source-runtime-loaded`.

## Test
Le workflow 40.6.453 exécute :
- `node --check js/aether.js` ;
- un harness du helper pur de readiness ;
- les cas API absente, intelligence absente, PARTIAL, freshness false, CEX incomplet et READY complet ;
- contrôle statique du câblage Aether et de la préservation du loader Strategy 40.6.452.

## Protégé
Backend .441 · Graphique .442 · Oracle .445 · HTML .448 · lisibilité .449 · fraîcheur Execution Cost .450 · tableaux .451 · loader Strategy .452 · Market Core 38.15.11.

Aucun seuil Strategy/Oracle, aucun calcul d'exécution, aucun Backend, aucun Market Core, aucun nouveau timer/observer/storage/network métier.
