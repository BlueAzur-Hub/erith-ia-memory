# Agent-Crypto — Consultation V1 Certification — 2026-10-07

## Certified baseline

- Trader / Administrator: **40.6.621**
- Aether Control: **2.3.2R21**
- Bridge: **1.9.13**
- Private Backend: **1.4.6 R2 · Market Instrument Resolver**
- Market Core: **38.15.11**

Certification scope: **engineering baseline for read-only market consultation**.
This is not an external security audit, financial certification, or guarantee of exchange availability.

## Terrain evidence

Validated on Firefox / operator machine:

1. **M / MemeCore** → Bitget → `M-USDT` → candles + FRESH orderbook: PASS.
2. **XAUT** → OKX → `XAUT-USDT` → candles + FRESH orderbook: PASS.
3. **OKB** → OKX → `OKB-USDC` → candles + FRESH orderbook: PASS.

The 2026-10-07 final operator capture shows OKB candles and OKX orderbook both FRESH under Trader 40.6.621.

## Code invariants verified

- Canonical asset identity is shared by Bougies, Profondeur and Market Instrument Resolver.
- Single-character ticker `M` is accepted.
- Bougies and Profondeur no longer use the old private 2-character minimum asset grammar.
- Backend 1.4.6 self-test: PASS.
- Backend write methods POST / PUT / DELETE are blocked.
- Real orders remain disabled.
- R21 expects Backend 1.4.6.
- R21 displays incompatible Backend versions as INCOMPATIBLE.
- R21 automatically retires only the specifically known quarantined 1.4.7 process owned by AtlasCryptoBridge/private_backend.py.
- Unknown listeners are never automatically killed.

## Package integrity

R21 ZIP:
`f18292040c40a0cce75bdf33318682461f9d8146b8e02818ffd349c93beed932`

R21 EXE:
`141bb7817fed9a14115f939c0bbd1a77322ac99d9b860ea9d4d1f4c367f63a53`

Bridge 1.9.13:
`abc821e68bc77d183894581c743a085a450edfa06b49348a7c0f374a834b7ec4`

Backend 1.4.6 R2:
`990134125c77dd7ba774d0225a00edb89f1668ec200c416fb7b8d72960ed158f`

## CI / Guards

Verified successful guards on the certified line:
- Agent-Crypto Version Truth Guard
- Agent-Crypto Version Delivery Guard
- Agent-Crypto Trader Current
- Agent-Crypto Depth Current
- Agent-Crypto Market Microscope Current
- GitHub Pages deployment for R21

## Known limit

The certified Backend 1.4.6 provides:
- OKX: candles + orderbook
- Bitget: candles + orderbook
- Binance: candles/ticker resolution, **orderbook not yet certified**

Therefore “all listed assets fully consultable with depth” is **not** certified until Binance Book passes its own off-production qualification.

## Frozen zones

Do not change without evidence of a defect:
- Market Core 38.15.11
- Bridge 1.9.13 protocol
- canonical asset identity
- Bougies owner
- Profondeur owner
- Lecture Technique
- Trader 40.6.621 consultation baseline

## Roadmap

1. **40.6.622 — Top 10 Explorer**
   - Top 10 Hausse 24h
   - Top 10 Baisse 24h
   - Top 10 Volume
   - Top 10 Nouveaux Listings
   - row click routes through canonical selected asset
   - no transport/Core change

2. **Binance Book LAB — no production version**
   - develop public orderbook support off-production
   - Windows startup PASS
   - /health PASS
   - immediate stop/restart PASS
   - M/Bitget regression PASS
   - XAUT/OKX regression PASS
   - Binance-only asset candles + book PASS
   - unavailable asset remains explicit, never BTC fallback

3. **Aether Control R22 + Backend 1.4.7**
   - only if LAB qualification is fully PASS
   - promote Binance orderbook
   - preserve Bridge 1.9.13 unless evidence proves otherwise

4. **40.6.623 — OKX Account READ ONLY**
   - balances, holdings, valuation
   - secrets local Backend only
   - no browser key
   - no orders

5. **40.6.624 — Instrument Truth + Fee Truth + Micro-Ticket Validator**

6. **40.6.625 — OKX Demo / Paper execution evidence**

Real execution remains outside scope until a later explicit decision.
