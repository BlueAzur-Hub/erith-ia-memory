# Agent-Crypto — Aether External Wake Decoupling

Build **40.6.415** · parent **40.6.414** · rollback **40.6.414** · Market Core **38.15.11**.

## Parent 40.6.414 — preuve Firefox

La 40.6.414 est retenue comme checkpoint fonctionnel : Decision Board active YES, rendered 4, deferred 25, deduped 20, forced 1, errors 0 ; Strategy READY ; Postboot READY.
Performance parent : Consultation 61,63 s · Strategy Core 66,38 s · Postboot runtime 109,72 s · system-hydrated 193–199 s · POSTBOOT TIMER drift 30 256 ms.

## Intention unique 40.6.415

Empêcher l'ancien propriétaire `index.html#atlasDebtSettlementRuntime` de réveiller Aether pendant la fenêtre critique de boot.

Correction :
- réveil externe au DOMContentLoaded bloqué pendant le boot ;
- pulse Astro/Celestial conservé ; son appel Aether est autorisé seulement après `postboot-runtime-ready` ;
- retour de visibilité : refresh forcé conservé seulement après Postboot ;
- aucun nouveau timer, observer, fetch owner ou stockage ;
- rapport : `AETHER EXTERNAL WAKE · 40.6.415` avec compteurs skipped/allowed.

## Protections

Market Core 38.15.11, Decision Board .414, Aether métier/géométrie, Chronos/Astro/Celestial, Atlas/CURRENT/N+1, Strategy A/Paper/Gates, Oracle, Math, Lecture Technique, Storage, Shared Memory, Window Manager/F11 : inchangés.

## Validation statique

- atlasDebtSettlementRuntime : syntaxe PASS ;
- rapport de démarrage inline : syntaxe PASS ;
- setInterval / MutationObserver / fetch() dans le propriétaire : topologie inchangée ;
- identité Administrator : 40.6.415 ;
- snapshot immutable : index-40.6.415.html.

## Test Firefox

Ctrl+F5 → confirmer Build 40.6.415 → laisser booter → Rapport → Actualiser → Copier.
Vérifier Decision Board .414 toujours active/errors 0, section AETHER EXTERNAL WAKE présente, skipped >= 1 avant Postboot, allowed seulement après Postboot, puis comparer les temps et surtout la dérive POSTBOOT TIMER au parent 30 256 ms.

## Stop point

Ne pas ouvrir .416 avant lecture du terrain .415.
