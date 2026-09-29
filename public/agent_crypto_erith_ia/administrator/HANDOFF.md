# HANDOFF — Agent-Crypto 40.6.475

## Objet unique

Prouver le raccordement réel de la capture prospective sans attendre un nouveau COST_GATE_WAIT de marché.

## Firefox minimal

1. Ctrl+F5.
2. Vérifier **Build 40.6.475 · Administrator**.
3. Ouvrir **Section 04 → Simulation**.
4. Repérer **STRATEGY A · PROSPECTIVE OUTCOME + OKX COST EVIDENCE · 40.6.475**.
5. Vérifier **État = ARMED**.
6. Regarder la nouvelle ligne **Plomberie**.
7. Attendre seulement le prochain cycle Auto A normal, même s'il finit NO_TRADE.

Attendu après ce cycle :
- `événements reçus` augmente ;
- `dernier event` n'est plus — ;
- `event` contient le cycle Auto A reçu ;
- `résolu` correspond au même cycle ;
- `mode = LEDGER_BY_ID` ;
- `erreur = —`.

Ce test ne dépend plus d'un COST_GATE_WAIT.

## Ensuite

Si un futur COST_GATE_WAIT réel arrive, `Cycles suivis` doit augmenter et le coût OKX T0 doit être demandé. T+5/T+15/T+60 restent prospectifs et sans interpolation.

## Protections

Market Core 38.15.11 intact. Aucun seuil, gate, Oracle, Risk ou PAPER modifié. Aucun backfill. Aucun ordre réel.
