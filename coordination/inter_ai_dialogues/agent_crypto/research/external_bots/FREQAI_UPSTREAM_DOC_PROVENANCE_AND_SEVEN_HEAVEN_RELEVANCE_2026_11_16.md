# FreqAI upstream document — provenance and Seven Heaven relevance

**Captured:** 2026-11-16  
**Project:** Seven Heaven Strategy Lab / Agent Crypto  
**Status:** external reference, not runtime dependency

## Source

- Upstream repository: https://github.com/freqtrade/freqtrade
- Upstream document: https://github.com/freqtrade/freqtrade/blob/develop/docs/freqai.md
- Upstream Git blob observed on 2026-11-16: `ab525e9decfe124ce715356449b30794b5128b67`
- User-supplied local copy SHA-256: `784af9a1da69638095f6a21b1dd8a2e1b69b47a02370cb51cd69d8467a4211fa`
- Preserved copy: `upstream_docs/freqtrade/freqai.md`
- Freqtrade license family: GPL-3.0. Preserve attribution and license obligations; do not silently copy implementation code into Seven Heaven.

## Why this document matters to Seven Heaven

FreqAI is useful as an architectural and research reference for a future Seven Heaven ML layer. The relevant ideas include:

- supervised feature/label design;
- adaptive model retraining;
- historical backtesting that reproduces periodic retraining;
- feature engineering pipelines;
- outlier handling, normalization and NaN cleaning;
- dimensionality reduction;
- persistent model storage / crash recovery;
- producer-consumer model distribution;
- clear separation of training, testing and inference.

## Architecture boundary

This document is **not** authorization to make Seven Heaven depend on FreqAI or Freqtrade.

Canonical rule:
- Seven Heaven remains owner-facing and independently runnable;
- external engines remain optional research/validation sidecars;
- useful ideas may be reimplemented in Seven Heaven after explicit design review;
- external code is not copied blindly;
- disappearance of Freqtrade/FreqAI must not make Seven Heaven unusable.

## Continuity rule

Chat attachments and ChatGPT Library are not canonical project storage. Any source, report, design note, proof or external reference needed to continue the project across LLMs must be mirrored or indexed in the public GitHub repository, unless it is private/sensitive and intentionally belongs in the private vault.
