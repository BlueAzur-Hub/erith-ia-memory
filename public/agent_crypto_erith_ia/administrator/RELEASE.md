# Agent-Crypto — 40.6.437 · BACKEND SOURCE TRUTH RESIDENCY RECOVERY

Parent : 40.6.436.
Market Core : 38.15.11.

## Terrain
Backend / API peut être ouvert et hydraté avant l'arrivée du loader secondaire Source Truth.
Dans ce cas l'utilisateur ne voit que l'architecture statique (« Architecture future ») alors que le Backend local V1.4.2 et Source Truth CEX existent toujours.

## Cause
`private-source-demand-loader.js` ne rejouait pas la demande si Backend était déjà ouvert au moment où le loader arrivait.
Les événements click / toggle / erith:system-hydrated avaient alors déjà été consommés.

## Correction
- si Backend/API est déjà ouvert à l'arrivée du loader : `ensure("backend-already-open")` immédiatement ;
- Execution Cost Truth demande `ErithPrivateSourceDemand.ensure("execution-cost-truth")` si Source Truth CEX n'est pas encore chargé ;
- le helper fetchJson restauré en .436 reste présent ;
- le panneau Execution Cost Truth reste sous Oracle / Cost Calibration Truth.

## Non modifié
Private Backend V1.4.2, logique CEX, Strategy A métier, Cost Gate, Oracle, Risk, Paper, Market Core 38.15.11, Aether, CSS cockpit.

## Test
Ctrl+F5 > Build 40.6.437 > Backend / API.
Attendu : Architecture statique + Source Truth CEX dans le même Backend / API, sans devoir refermer/réouvrir au bon moment.
Puis Simulation / Strategy A > Execution Cost Truth > MESURER KRAKEN + OKX.
