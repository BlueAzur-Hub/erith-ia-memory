# Agent-Crypto 40.6.471 — OKX POTENTIAL DURABLE BASELINE RECOVERY

40.6.470 a correctement signalé BASELINE_DRIFT : 65/144 et 1/16.
La cause est la préférence du Cost-Wait Outcome Audit pour le Experiment Ledger visible.

40.6.471 reconstruit la référence .467 exclusivement depuis AgentCryptoStrategyADurableEvidence.read_cycles() :
- unwrap payload;
- déduplication cycle_id;
- tri chronologique;
- filtre COST_GATE_WAIT;
- prix T0 valide;
- gel des 144 premiers COST WAIT;
- POTENTIAL si expected_move_pct >= 0,6109 %.

Attendu : 144/144 et 16/16 si la preuve durable locale correspond à .467.
Aucun snapshot OKX courant, aucun seuil, aucun gate, aucune écriture storage, aucun ordre réel.
