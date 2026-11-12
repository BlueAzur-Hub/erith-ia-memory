# Seven Heaven — August–September 2026 BTC/ETH L2, minute and event-time spread persistence

**Pre-registered on 2026-11-12, BEFORE the new Aug/Sep minute and event-time replays.** No live orders, account access, private keys, or scheduled monitoring.

## Dates and instruments, immutably fixed

Only **2026-08-15** and **2026-09-15**, UTC, each on OKX public Spot 400lv L2 **BTC-USDC and ETH-USDC**. The already validated **2026-10-15** is retained unchanged as comparator. No replacement dates/pairs, no selection of days from their market outcomes.

Pinned previously published 96-quarter-hour sources (Git blob SHA-1):
- 2026-08-15 BTC-USDC `ae4d975242a113f8ab81a28bca334b8d62973ce8`, archive SHA-256 `a8af512dabf96c6e5c8af37a0e19eb11ebce88ed232308cba9a63a37053fc130`.
- 2026-08-15 ETH-USDC `afd81ec52fbbc03c51a946a0dea5ce93f9732275`, archive SHA-256 `9da303d949bce4f25248f7d3f6b7e34e2be6ed426b4945a395c3097d7932bfca`.
- 2026-09-15 BTC-USDC `1d173cd27be2ac971326850e1d81dfe5ad4a0857`, archive SHA-256 `53ab528063479e83dbd833be63615d09cee209897d39021403a88fd6f2d31460`.
- 2026-09-15 ETH-USDC `eb882de160670bc8f7099645af86a07ab3a31dd6`, archive SHA-256 `694464feb71a39dccff0188087079f3d200b50e51efc4a4120b454e4a9213924`.

All compressed archive SHA and member SHA must match the previously published 96-snapshot source proofs. Their 20 first NDJSON hashes must match the previously pinned first-day proof, and their **96 quarter-hour states must match exactly**: UTC, event number, timestamp, best bid/ask, spread and all 5 buy+sell hypothetical depth costs.

## Frozen methodology, identical to October

- Retain **1440 UTC minute anchors from 00:00 through 23:59**, first valid event state at or after anchor with maximum 60 seconds delay, else missing. Do not silently fill gaps.
- Stream **every complete NDJSON event**, bounded by **230 MB compressed / 1.4 GB uncompressed**, hash full archive and member, validate gzip CRC, single expected tar `.data` member, monotonic UTC timestamp, exact instrument, valid noncrossed book, proper snapshots and updates (size=0 removes a level). Do **not** commit source archive.
- Thresholds **strictly greater than** **0.1, 0.5, 1.0, 2.0 bp**, where 1 bp = 0.01%, spread=(best ask-best bid)/mid × 10,000. Identical thresholds for both pairs and both new days.
- Integrate event-time held states **[ts_i,ts_(i+1))** with spread observed **after** event i, and treat zero-time events as zero duration. Coverage from first event to last event, **not** assumed to be exactly 24 h. Sum duration above each threshold, episode count of positive-duration continuous states, maximum continuous length, number lasting at least 1s/10s/60s, and whether an episode remains right-censored at the final event (no extension after final source event).
- Calculate minute-sampled mean/median/p90 and fraction above thresholds separately from duration-weighted event-time mean and time fraction. Compare to the historical 96 quarter-hour snapshot mean without claiming it is a continuous-day mean.

## Required evidence and stop conditions

For each four new day/pair cells: **source full SHA+CRC**, 20 hash comparisons, **96 previous snap checks** (all previous prices, timestamps, events and five per-side price costs), **1440 calendar minute rows**, **4 threshold-duration integrity checks** (integrated ms equal summed positive-episode ms), 20 longest episodes per threshold, complete-but-limited JSON proof, CSV minute/spread rows, and explicit failed quality status if any check fails. No numbers fabricated for missing data.

Only **after** all four source cells validate, compare to unchanged Oct 15 minute/event-time evidence (original Git blob BTC `ce90a9d8e84bb257eafe994d1d31a4ffae51f0b9`, ETH `589778261ecd2ce419c6df2f0fba3e44e195439d`). Report all 3 calendar dates separately, and only then combine for *descriptive* statistics: **3 × 2 × 1440 = 8640 minute states** and **6 distinct event-held streams**, not six continuous 24-hour market trajectories.

Scientific limitations: Source files lack proof of upstream `seqId/prevSeqId` chain, CRC/SHA validate received bytes only; missing original updates may bias durations. The event-held constant-state model is an assumption, not an executed order or guarantee of contemporaneous market liquidity. Three historical days are not prospective validation or representative monthly averages; quoted OKX USDC should not replace Bitstamp USD EMA backtest costs. No trading, no Bridge/Trader/Operator/Administrator changes, no `schedule`.

Archive only compact proof and checked reports into `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/`, update inter-AI handoff after verification.
