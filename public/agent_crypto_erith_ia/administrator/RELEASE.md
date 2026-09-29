# Agent-Crypto 40.6.474 — PROSPECTIVE OUTCOME + OKX COST EVIDENCE

## Point de départ

40.6.471–.473 ont terminé le diagnostic historique :
- baseline durable .467 : 144/144 COST WAIT et 16/16 OKX POTENTIAL;
- un seul franchissement T+60 observé;
- ce franchissement est un point unique à +0,691 %, à 22,2 min, soit environ +0,080 % au-dessus du plancher 0,6109 % avant slippage;
- 8 inconnus T+60 : 4 PARTIAL_NO_CROSS et 4 TARGET_GAP_NO_SAMPLE.

L'historique ne doit plus être complété par interpolation.

## 40.6.474

La stratégie construit désormais une preuve prospective pour les **nouveaux COST_GATE_WAIT uniquement**.

À T0 :
- cycle_id, heure, prix BTC/EUR, expected_move, required_move;
- mesure OKX via l'owner existant `AgentCryptoStrategyAExecutionCostTruth`;
- bid/ask, spread, frais de référence et fee+spread observables;
- slippage laissé UNKNOWN s'il n'est pas prouvé;
- contexte analytique frais+spread+0,2 % enregistré sans modifier le gate.

Aux cycles suivants :
- endpoint T+5;
- endpoint T+15;
- endpoint T+60;
- gap exact à la cible;
- move endpoint;
- MFE / MAE et nombre d'échantillons jusqu'à l'endpoint.

Tolérance : ±150 s, inchangée.
Si la fenêtre est manquée : **MISSED_WINDOW**. Aucun prix inventé.

## Durabilité

Écriture dans le store `meta` de l'IndexedDB Durable Evidence existant :
`agent_crypto_strategy_a_durable_evidence_v1`

- DB_VERSION reste 1;
- aucun object store ajouté;
- aucun backfill;
- maximum mémoire opérationnelle 256 cycles.

## Effets

La nouvelle capture appelle l'owner Execution Cost Truth déjà existant sur chaque nouveau COST_GATE_WAIT, y compris en mode headless. Cela peut déclencher les requêtes Kraken/OKX déjà définies par cet owner. Aucun nouveau protocole réseau n'est implémenté.

Aucun changement de Cost Gate, Oracle, Risk, Paper, Market Core 38.15.11 ou autorisation d'ordre réel.
