# Agent-Crypto 40.4.272 — Strategy A V2

## Release
STRATEGY A V2 · COST-AWARE ENTRY + PATIENT EXIT + OPERATOR RESULTS LOCK

## Evidence that motivated V2
Operator-exported 40.4.271 sample: 10 closed BTC Paper trades, gross reference-price movement approximately +0.1139 EUR in aggregate, simulated fees approximately 2.4959 EUR, simulated entry/exit impact approximately 0.4986 EUR, net approximately -2.8806 EUR. Six of ten reference-price moves were positive, but the largest observed gross move was only about +0.1310%, far below the ~0.60% simulated round-trip cost.

## Changes
- Cost-aware entry gate reads existing Simulation buy/sell fee and entry/exit impact assumptions.
- Required upside = max(0.80%, round-trip cost + 0.20 percentage point safety margin).
- Uses the existing Oracle hausse envelope; if unavailable, entry is blocked rather than guessed.
- 5 minutes becomes the first Paper review point, not an automatic exit.
- A Paper position closes on Strategy A invalidation, when gross move reaches the cost-aware target after first review, or at a 60-minute Paper ceiling.
- Large visible operator result: trades, wins, losses, gross, fees, impact, net.
- One-click JSON trade journal export.
- Technical details disclosure no longer snaps shut on every rerender.

## Safety
Paper only. No real orders. No Kraken network. No credentials. No wallet. No withdrawal. Risk Governor and reconciliation math unchanged. Market Core remains 38.15.11.
