# Agent-Crypto — Handoff

Build **40.6.409** · parent **40.6.408** · rollback **40.6.407**.

## Une seule variable

Suppression de `yieldMain(160)` + `sleep(18)` **uniquement entre les 8 modules Strategy Core**.

## Invariants

- ordre des modules inchangé ;
- chargement séquentiel inchangé ;
- Strategy métier inchangée ;
- Auto A inchangé ;
- Evidence inchangé ;
- Secondary / TRADUS / Market Demand inchangés ;
- Market Core 38.15.11 inchangé ;
- sonde 40.6.408 conservée.

## PASS attendu

`queue/yield/sleep` Strategy proches de zéro et `Strategy Core ready` plus tôt, sans régression fonctionnelle.

**Aucune 40.6.410 avant analyse terrain 40.6.409.**
