# 40.6.625 — OKX Account READ ONLY · specification

Status: **PREPARED ONLY · NOT IMPLEMENTED**

## D

Display the operator's OKX account state inside Trader without exposing secrets and without enabling execution.

## Read-only data

Target only what the authenticated OKX account API can truthfully expose:

- balances by currency
- available balance
- frozen / unavailable balance when supplied
- total account valuation fields when supplied
- timestamp / source / freshness
- account mode metadata when safe and useful

No synthetic portfolio values when the source is unavailable.

## Boundary

Credentials live only in the local private Backend environment.

Forbidden in:

- static HTML/JS
- browser localStorage/sessionStorage/IndexedDB
- GitHub
- Notion
- query strings
- client-visible logs

Browser talks only to localhost Backend read-only routes.

## Mutations forbidden

- order create
- order amend
- order cancel
- transfer
- withdrawal
- API-key management

Unknown state = unavailable, never zero by invention.

## Promotion gates

- 40.6.623 terrain PASS
- 40.6.624 terrain PASS
- threat/secret boundary review
- backend self-test
- browser network proof
- explicit human validation

No real order.
