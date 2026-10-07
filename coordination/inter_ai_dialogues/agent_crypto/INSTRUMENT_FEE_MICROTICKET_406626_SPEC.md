# 40.6.626 — Instrument Truth + Fee Truth + Micro-Ticket Validator

Status: **PREPARED ONLY · NOT IMPLEMENTED**

## D

Before any Demo/Paper order, prove that a proposed micro-ticket obeys the venue's instrument rules and expose realistic costs.

## Instrument Truth

For the canonical resolved instrument:

- base / quote
- tick size
- lot size
- minimum quantity
- minimum notional / amount rule when exposed
- maximum limits only when materially relevant
- venue + instrument timestamp/source

No hidden quote conversion.

## Fee Truth

Prefer authenticated account fee tier from 40.6.625 when available.

If fee truth is unavailable:

- mark fee state UNKNOWN;
- do not replace it with an invented default for an execution-readiness verdict.

## Market-cost Truth

Read from the compatible real order book:

- best bid
- best ask
- spread
- depth available for the proposed size
- bounded slippage estimate for that size

## Validator output

For a requested amount:

- valid/invalid
- normalized quantity
- normalized limit price if applicable
- gross ticket
- expected fee
- spread/slippage estimate
- expected total cost
- explicit venue-rule rejection reasons

This version computes only. It submits nothing.

No real order.
