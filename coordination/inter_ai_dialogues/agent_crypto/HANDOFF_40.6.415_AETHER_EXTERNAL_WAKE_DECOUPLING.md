# HANDOFF — Agent-Crypto 40.6.415 · Aether External Wake Decoupling

## Parent
40.6.414 = checkpoint Firefox fonctionnel : Decision Board active YES · rendered 4 · deferred 25 · deduped 20 · forced 1 · errors 0 ; Strategy READY ; Postboot READY.
Temps parent : Consultation 61,63 s · Strategy 66,38 s · Postboot 109,72 s · system-hydrated 193–199 s · POSTBOOT TIMER drift 30 256 ms.

## Changement 40.6.415
Owner unique : `index.html#atlasDebtSettlementRuntime`.

Le réveil Aether externe est maintenant `POSTBOOT_READY_ONLY` :
- DOMContentLoaded : réveil bloqué ;
- Celestial pulse : Astro/Celestial continue, Aether est bloqué avant Postboot puis autorisé après ;
- visibility resume : refresh forcé conservé uniquement après Postboot.

Aucune modification de `aether.js`, Strategy métier, Atlas métier, Market Core, Oracle, Math, Lecture Technique ou Storage.

## Preuve
Functional checkpoint commit : `4927c4e711fa3f8a3bb0a40e26d8839130bcb21c`.
Rapport : section **AETHER EXTERNAL WAKE · 40.6.415**.
API : `AgentCryptoAetherExternalWake406415.snapshot()`.

## Test
Ctrl+F5 → confirmer 40.6.415 → laisser booter → Rapport → Actualiser → Copier.
Comparer à .414 et envoyer le rapport.
Ne pas lancer une .416 avant lecture du terrain .415.
