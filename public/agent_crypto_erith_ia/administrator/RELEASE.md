# Agent-Crypto 40.6.455 — EXECUTION COST AUTO MEASURE

## Objet unique
Supprimer le clic obligatoire sur **MESURER KRAKEN + OKX** sans ajouter de timer ou de polling.

## Comportement
- au premier montage réel de `STRATEGY A · EXECUTION COST TRUTH` dans Simulation : mesure automatique Kraken + OKX ;
- après chaque vrai `agent-crypto:strategy-a-experiment-cycle` émis par 40.6.454 : nouvelle mesure automatique ;
- si une mesure est déjà en cours : pas de deuxième mesure concurrente ; au plus une reprise après le cycle est conservée ;
- le bouton reste présent comme **RAFRAÎCHIR KRAKEN + OKX** de secours, mais il n'est plus requis.

## Propriétaire fonctionnel
`js/strategy-a-execution-cost-truth.js` → build interne 40.6.455.

## Livraison cache
Le comportement du loader Strategy reste **40.6.452**, mais son token de livraison passe à **40.6.455** afin de demander explicitement `strategy-a-execution-cost-truth.js?v=40.6.455`. Aucun changement de logique du loader.

## Réseau
Cette automatisation déclenche les mêmes lectures déjà utilisées par le bouton :
- Kraken REST public ;
- OKX uniquement via Source Truth CEX / backend local 8790.

Elle n'ajoute aucun WebSocket, aucun timer récurrent, aucun polling, aucune clé, aucun wallet et aucun ordre réel.

## Protégé
Market Core 38.15.11 · Backend .441 · Graphique .442 · Oracle .445 · structure .448 · lisibilité .449 · freshness Execution Cost .450 · layout .451 · Strategy loader .452 · Aether readiness .453 · cycle event .454.
