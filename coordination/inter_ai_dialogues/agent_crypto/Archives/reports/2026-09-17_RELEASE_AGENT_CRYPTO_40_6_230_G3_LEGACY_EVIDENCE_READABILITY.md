# Agent-Crypto 40.6.230 — G3 Legacy Evidence Readability

Date: 2026-09-17
Parent: 40.6.229
Market Core: 38.15.11
Mode: PAPER ONLY
Gate 3: PENDING
Gate 9: LOCKED

## Terrain received before release

Firefox terrain for 40.6.229 confirms:
- Build 40.6.229 · Administrator;
- Market Core 38.15.11;
- Binance LIVE 5/5;
- strict 40.6.228 outcome authority visible with 3 joined decisions and 9/9 strict horizons anchored on `decision_at`;
- strict 40.6.229 execution-realism surface visible;
- data + outcomes certified;
- lifecycle / partial-fill mechanism present;
- laboratory acceptance 19 checks PASS;
- actual Strategy A after-cost terrain remains 0 trades / INSUFFICIENT_SAMPLE;
- execution latency NOT_PROVEN;
- execution liquidity NOT_PROVEN;
- G3 remains PENDING and G9 remains LOCKED.

## Purpose of 40.6.230

Reduce operator confusion caused by older G3 proof panels remaining visible beside current truth.

This release changes presentation only. It does not delete, collapse, rewrite, recalculate or promote any historical evidence.

## Readability contract

Older evidence panels are labelled as one of:
- `PREUVE HISTORIQUE · lecture audit` when they remain useful as prior evidence;
- `SUPERSEDED` when their operator-level conclusion has been replaced by the strict 40.6.228 / 40.6.229 authority.

Current authority panels are labelled:
- `ACTUEL · vérité données + outcomes` for 40.6.228;
- `ACTUEL · chantier G3 · réalisme d’exécution` for 40.6.229.

No automatic collapse is introduced. Original evidence remains readable and auditable.

## Protected invariants

Unchanged:
- Strategy A business logic and thresholds;
- Market Core 38.15.11;
- Atlas CURRENT;
- Oracle;
- Risk Governor;
- PAPER lifecycle;
- storage ownership;
- network/business requests;
- real-order lock;
- Gate states.

No new recurring timer, MutationObserver, storage owner or business-network request is introduced.

## Terrain proof requested

1. Reload Administrator until `Build 40.6.230 · Administrator` is visible.
2. Open Strategy A / Evidence normally.
3. Verify legacy G3 panels display `PREUVE HISTORIQUE` or `SUPERSEDED` badges.
4. Verify 40.6.228 and 40.6.229 display `ACTUEL` badges and their contents remain unchanged.
5. Export the markdown report.

No trade, backtest or PAPER proof button is required.
