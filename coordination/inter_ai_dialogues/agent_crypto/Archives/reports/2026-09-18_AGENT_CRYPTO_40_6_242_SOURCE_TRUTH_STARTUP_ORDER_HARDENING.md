# AGENT-CRYPTO 40.6.242 — SOURCE TRUTH STARTUP ORDER HARDENING

Date: 2026-09-18
Release: 40.6.242
Parent: 40.6.241
Market Core: 38.15.11
Mode: PAPER ONLY
G3: PENDING
G9: LOCKED

## Purpose

Harden Source Intelligence startup ordering.

## Terrain closure from 40.6.241

Firefox proves Source Intelligence V1.3 is hydrated and coherent:

- CEX 5/5
- DEX 5/5 + 5/5
- DEX identity 2 proven + 1 bounded
- Atlas eligible 3/5
- anomalies 2
- DeFi 3/3
- freshness 4 min

40.6.241 is closed.

## Repair

Modified:

`js/views/private-source-demand-loader.js`

Removed eager startup of:

- DEX diagnostics
- CEX divergence guard
- Atlas Decision Context

These readers now start only from the canonical `afterSourceOwners()` path.

Loader ready state is settled only after the ordered source-owner chain completes.

Canonical order:

`Source Truth -> DEX freshness -> downstream source readers -> ready/runtime-loaded`

## Protected

Unchanged:

- Market Core 38.15.11
- private backend
- provider list
- thresholds
- DEX identity rules
- Binance primary truth
- Atlas algorithm
- Oracle
- Lecture Technique
- Strategy A
- Gate state

No timer.
No MutationObserver.
No trading.

## Commits

Code:
`4718ff2630279fd909025388b15e2e0ea93ee6ce`

Release:
`24c74241675a3ec35e35240bee9c9da72e9412bf`

## Firefox proof

Reload to Build 40.6.242.

Open the same Source Intelligence panel once.

If it appears normally and remains coherent, close 40.6.242.
