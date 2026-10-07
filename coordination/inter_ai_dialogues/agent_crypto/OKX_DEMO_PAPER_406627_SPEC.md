# 40.6.627 — OKX Demo / Paper execution evidence

Status: **PREPARED ONLY · NOT IMPLEMENTED**

## D

Prove the complete order lifecycle without real capital.

## Inputs

Only a ticket that has passed 40.6.626 validation.

## Modes

1. Local Paper lifecycle can be used for deterministic application testing.
2. OKX Demo may be enabled only through the local Backend if demo credentials/environment are configured safely.

Both modes must be unmistakably labelled.

## Required evidence

- request identity
- canonical instrument
- side
- normalized quantity
- normalized price / market intent
- fee assumptions/source
- submission timestamp
- acknowledgement
- order id in Demo/Paper namespace
- fill / partial fill / rejection
- cancellation when applicable
- realized simulated/demo fees
- final state
- durable local evidence/log

## Hard gates

- REAL execution flag absent/off
- no production-order endpoint reachable from the public/static surface
- Demo/Paper environment truth explicit
- account/instrument/fee truth available
- Kill Switch / STOP remains authoritative
- human validation remains required for any later scope expansion

Passing 40.6.627 does **not** authorize real trading.
