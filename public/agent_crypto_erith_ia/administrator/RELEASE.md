# Agent-Crypto 40.6.464 — EXECUTION COST EVIDENCE CAPTURE DELIVERY RECOVERY

40.6.463 a échoué au terrain: le panneau EXECUTION COST EVIDENCE CAPTURE était absent.
Cause: strategy-core-ready est dispatché sur window, le module l'écoutait sur document; le premier render pouvait aussi arriver avant son ancre.
Correction: écoute window, rendu après audits, ancres .460/.461/.462, fallback via Strategy A Audit Demand Loader.
Aucun backfill historique, aucune injection after-cost, aucun seuil modifié, aucun ordre réel. Market Core 38.15.11 intact.
