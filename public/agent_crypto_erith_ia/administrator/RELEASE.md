# Agent-Crypto 40.6.458 — EXECUTION COST PENDING CYCLE RESUME

## Objet unique
Fermer la dette Astra où un événement Strategy A `experiment-cycle` reçu pendant un rafraîchissement manuel Kraken + OKX pouvait rester en attente après la fin de cette mesure.

## Cause
`pendingExperimentMeasure` était posé pendant `busy=true`, mais la sortie commune n'appelait `finishPendingExperiment()` que pour un trigger `auto:`.

## Correction
La sortie de toute mesure appelle maintenant `finishPendingExperiment()`.

Contrat :
- une seule mesure simultanée ;
- au maximum une reprise en attente ;
- une reprise est consommée une seule fois après la fin de la mesure courante.

## Protégé
Market Core 38.15.11 · seuils Strategy A · Oracle · Source Truth · Aether · frais · calculs Execution Cost · Paper.

Aucun nouveau timer, observer, stockage, owner réseau ou ordre réel.
