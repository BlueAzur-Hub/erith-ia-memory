# Agent-Crypto 40.6.476 — PROSPECTIVE PANEL MOUNT PERSISTENCE

## Terrain parent

40.6.475 a validé la plomberie Firefox :
- panneau ARMED ;
- événements reçus 1 ;
- event = résolu = `A-CYCLE-00001-ebfa9b7e` ;
- mode `LEDGER_BY_ID` ;
- erreur `—`.

Quelques minutes plus tard le panneau .475 avait disparu, alors que `EXECUTION COST EVIDENCE CAPTURE · 40.6.469` restait visible.

## Correction bornée

Aucun changement de capture, ledger, IndexedDB, OKX, Cost Gate ou Strategy A métier.

Le panneau prospectif :
1. préfère désormais l'ancre stable `strategyAExecutionCostEvidenceCapture` ;
2. garde les ancres .473/.472/.471 en fallback de démarrage ;
3. se remonte après le propriétaire canonique `agent-crypto:administrator-presentation-settled` ;
4. se remonte également sur les événements bornés déjà existants : evidence-data-changed, audits-ready, strategy-core-ready, postboot-runtime-ready et cycle Auto A ;
5. n'ajoute aucun timer récurrent et aucun MutationObserver.

## Vérité

40.6.475 = **PLUMBING PASS / MOUNT PERSISTENCE FAIL**.

40.6.476 traite uniquement **MOUNT PERSISTENCE** et conserve la plomberie .475.
