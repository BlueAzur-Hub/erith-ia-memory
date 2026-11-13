# Seven Heaven — OKX Spot BTC/ETH USDC public instrument eligibility

**2026-11-13 · READ ONLY, no account access or order.**

## Current public instrument snapshot (NOT proof of account-specific EEA trade eligibility)

| Pair | Public state | minSz base | lotSz base | tickSz quote | Bid USDC | Ask USDC | Minimum at ask USDC |
|---|---|---:|---:|---:|---:|---:|---:|
| BTC-USDC | live | 0.00001 | 0.00000001 | 0.1 | 70904.8 | 70904.9 | 0.709049 |
| ETH-USDC | live | 0.001 | 0.000001 | 0.01 | 2009.17 | 2009.18 | 2.00918 |

## Budget feasibility at public ask (indicative only)

Each calculation reserves 0.1% of quote budget for an assumed taker fee, floors base quantity to lotSz and checks ONLY minSz.
It does not test any additional quote-side minimum, account eligibility, actual fee currency, trading limits or eventual fill.

| Pair | Budget USDC | Estimated base quantity | minSz check only |
|---|---:|---:|---:|
| BTC-USDC | 10 | 0.00014089 | PASS |
| BTC-USDC | 20 | 0.00028178 | PASS |
| BTC-USDC | 100 | 0.00140893 | PASS |
| BTC-USDC | 1000 | 0.01408930 | PASS |
| ETH-USDC | 10 | 0.004972 | PASS |
| ETH-USDC | 20 | 0.009944 | PASS |
| ETH-USDC | 100 | 0.049721 | PASS |
| ETH-USDC | 1000 | 0.497218 | PASS |

## Cost hypotheses — do not double count

From the project's **authenticated fee screenshots** (06, 09 and 12 Nov 2026) the reference **Spot taker** is 0.10% per side, **Spot maker** 0.08% per side.
The **V5** slippage 0.05% per side is a **modelling choice**. At unchanged underlying price, hypothetical taker/taker V5 break-even rise is about 0.300550826113907955128865900 percent and a 10 USDC roundtrip consumes about 0.0299650224887556221889055470 USDC, excluding additional conditions.
The prior **historical L2 book study** measured much smaller *book friction at fixed historical snapshots* and includes spread in that friction; **do not add spread twice**. Different models have different scopes.

## Date, provenance, caveats

- Retrieved UTC: 2026-11-13T01:41:02.974322+00:00
- Pair-specific public API request URLs and SHA-256 hashes of response bodies are preserved in adjacent JSON.
- Public API state live does NOT establish accessibility to a specific EEA account or permission to execute orders.
- No authenticated trade or order, no personal account details, no Bridge changes.
- Prices are one-time quotes, **not** predictions, recommendations, or execution prices.
- Source of account-displayed fee: Notion OKX MEMORY CORE → 01 Trading Fees; DO NOT overwrite with generic EEA advertising tables.
- Next decision: retain PAPER-only; a human order-eligibility check for any actual account or pair remains separate.
