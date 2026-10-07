# Bureaux — Agent-Crypto · 2026-10-07

## Canonical checkpoint while Christophe is away

Main remains **40.6.623**.

- Market Core: **38.15.11**
- Aether Control: **2.3.2R21**
- Bridge: **1.9.13**
- Private Backend: **1.4.6 R2**
- real orders: **disabled**
- 40.6.623 code/CI/Pages: PASS
- 40.6.623 Firefox proof: **PENDING**

Do not merge a terrain-dependent runtime while the operator is absent.

## What is already done

### Consultation V1

Proven terrain chain:

- M → Bitget → M-USDT → Candles + Book
- XAUT → OKX → XAUT-USDT → Candles + Book
- OKB → OKX → OKB-USDC → Candles + Book

Known limitation:

- Binance Candles/Ticker exists in the current resolver path.
- Binance Book is not yet certified.

### Trader architecture

Trader is a filtered presentation of the same Administrator runtime, not a second application.

Shared owners remain authoritative for:

- Market
- Graph
- Technical Reading
- Candles
- Depth
- Math Core

Trader-specific work should consume those owners rather than recreate them.

### 40.6.622

Support/Resistance current-edge fallback added while keeping `PIVOTS_VISIBLES_W2`.

### 40.6.623

Asset Context / Stale Canvas Truth:

- unavailable new/external asset cannot keep the previous asset's candle canvas;
- empty-series canvas + geometry + inspector are cleared;
- old S/R context is cleared;
- current Ligne/Bougies mode is preserved;
- existing provider path is reused.

## What still needs proof

### Human terrain gate first

40.6.623 Firefox:

BTC/PUMP/OKB with valid candles → STONK without compatible candles → no previous BTC graph/inspector/SR remains → return to valid asset → fresh graph repaints.

No next runtime is merged before this gate.

## Prepared next version

### 40.6.624 — Top 10 Explorer

Draft branch:

`aerith7/top10-explorer-406624-prep`

Destination:

- Top 10 Hausse 24h
- Top 10 Baisse 24h
- Top 10 Volume 24h
- Top 10 Nouveaux listings
- row click = canonical asset selection

Owners:

- Core rankings: `AtlasMarketUniverse1000.universe(250)`
- Core selection: `atlasSelectMarketCoin`
- New listings: `AgentCryptoNewListingsNativeCategory`

No new Market/Graph/Fiche/Candles/Depth owner.

## Parallel LAB — Binance Book

Remain outside the operator stack until:

- Windows startup PASS
- /health PASS
- stop/restart PASS
- M/Bitget regression PASS
- XAUT/OKX regression PASS
- OKB/OKX regression PASS
- one Binance-only asset has real Candles + Book PASS

Only then consider Aether Control R22 / Backend 1.4.7 promotion. Bridge 1.9.13 stays protected unless a separate owner defect proves otherwise.

## 40.6.625 — OKX Account READ ONLY

Prepare after 40.6.624 terrain PASS.

Destination:

- account balances
- held assets
- available / frozen amounts when supported
- USD valuation
- account source/freshness truth

Security:

- OKX credentials only in the local Backend environment
- nothing secret in Firefox, GitHub, Notion or static JS
- browser calls local read-only Backend routes only
- no withdrawal
- no transfer
- no order creation/cancel/amend
- backend must continue to fail closed on mutating methods

Acceptance proof:

- account endpoint works locally;
- secret scan PASS;
- browser network contains no OKX secret/header;
- no order route exposed;
- disconnected account produces UNKNOWN / unavailable, never fabricated balances.

## 40.6.626 — Instrument Truth + Fee Truth + Micro-Ticket Validator

Inputs:

- instrument / pair selected canonically
- tick size
- lot size
- minimum quantity / minimum notional where applicable
- account fee tier read-only
- best bid/ask from real Book
- spread
- bounded slippage estimate from available depth

Outputs:

- smallest valid quantity
- rounded valid quantity/price
- estimated gross ticket
- estimated fees
- estimated spread/slippage cost
- estimated total entry cost
- explicit rejection reason if a ticket is too small / not executable by venue rules

No order submission.

## 40.6.627 — OKX Demo / Paper evidence

Goal:

prove the execution lifecycle without real capital.

Required evidence:

- candidate ticket from 40.6.626
- create simulated/demo order
- venue/demo acknowledgement or local Paper acknowledgement
- partial/full fill state when available
- fees
- cancel path
- durable evidence/log
- clear REAL = OFF gate

No promotion to real execution from this version.

## Trader-specific controls after 40.6.627

BUY / SELL may become a **DEMO-only ticket surface** only after the previous gates pass.

REDIVIDER remains protected and is not reopened merely because BUY/SELL work starts.

Real execution remains a later explicit decision, not an automatic continuation of the roadmap.
