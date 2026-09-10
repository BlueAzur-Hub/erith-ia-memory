# Agent-Crypto Administrator — 40.6.67

## TRADUS PAPER SHADOW · INDEPENDENT MICRO-TRANSACTION LIFECYCLE

Parent: **40.6.66 R1**  
Market Core protected: **38.15.11**

Functional change:

- TRADUS/Yohan BUY/SELL observations can open a strictly local PAPER shadow position;
- one virtual position at a time, ticket 50 €, initial capital 1 000 €, exposure cap 100 €;
- repeated same-direction signals do not stack exposure;
- an opposite signal closes the existing position and never flips on the same observation;
- mark-to-market, realized net P/L, simulated fees and equity are visible;
- cost model is explicit and hypothetical: 10 bp fee/side + 5 bp slippage/side + observed spread;
- Paper state is session-local and exportable as JSON;
- independent from Strategy A and historical Paper workspace « STRATÉGIE B ».

Safety:

- PAPER ONLY;
- no exchange order endpoint;
- no API key;
- no wallet;
- no recurring TRADUS timer;
- no profitability claim.

Protected / unchanged: Aether, Graphique, Lecture Technique, Atlas, Oracle, Strategy A thresholds and Market Core 38.15.11.
