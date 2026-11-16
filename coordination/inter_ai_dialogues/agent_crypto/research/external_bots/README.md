# Seven Heaven — External Bots & ML Research Index

This directory is the durable public research index for external trading engines and machine-learning references used by Seven Heaven Strategy Lab.

## Canonical continuity rule

**Anything required to continue the project across AI/LLM providers must exist in, or be durably indexed from, the public GitHub repository.**

Chat threads, ChatGPT Library attachments and temporary local uploads are convenience sources only. They are **not canonical project storage**.

Exceptions:
- private/sensitive owner material;
- credentials, API keys, account data;
- private vault/persona material explicitly kept outside the public repository.

## External engines — preserved source archives

The exact user-supplied upstream source archives are already preserved as immutable GitHub Release assets:

- Hummingbot `master` source ZIP
- Freqtrade `develop` source ZIP

Registry with SHA-256, byte counts, license notes and direct release links:

[`SEVEN_HEAVEN_HUMMINGBOT_FREQTRADE_EXACT_SOURCE_ZIP_ARCHIVES_REGISTRY_2026_11_13.md`](../../SEVEN_HEAVEN_HUMMINGBOT_FREQTRADE_EXACT_SOURCE_ZIP_ARCHIVES_REGISTRY_2026_11_13.md)

The copies re-supplied by the owner on 2026-11-16 were re-hashed and matched the archived canonical assets exactly:

- Freqtrade: `6143b75fa418362c5de00388faaaff008900a2f778e77a73b31361423e25a453`
- Hummingbot: `6ceef7884b54ac7b3e2f156411249f58f78a079e2f9b6b6717aabc81f4ea6cfd`

Do not duplicate these large third-party ZIPs inside Git history.

## FreqAI reference

Preserved upstream document:

[`upstream_docs/freqtrade/freqai.md`](upstream_docs/freqtrade/freqai.md)

Seven Heaven provenance / relevance note:

[`FREQAI_UPSTREAM_DOC_PROVENANCE_AND_SEVEN_HEAVEN_RELEVANCE_2026_11_16.md`](FREQAI_UPSTREAM_DOC_PROVENANCE_AND_SEVEN_HEAVEN_RELEVANCE_2026_11_16.md)

Use FreqAI as an **architectural and scientific reference**, not as a mandatory runtime dependency.

Useful concepts for future Seven Heaven work:
- features / labels / supervised training;
- adaptive retraining;
- train/test/inference separation;
- realistic historical retraining;
- feature engineering;
- normalization / outlier handling / NaN cleaning;
- model persistence and crash recovery;
- producer-consumer model distribution.

## Existing Hummingbot research

This directory also contains the already executed/published Seven Heaven Hummingbot research probes and proof JSONs:

- frozen BTC January 2026 data gate;
- native offline provider probe;
- hypothetical native Grid Executor replay;
- regression tests.

These are evidence assets, not live-trading authorization.

## Architectural boundary

Canonical Seven Heaven rule:

1. Seven Heaven remains independently runnable.
2. Seven Heaven owns its UI, Strategy Composer, StrategySpec, PAPER simulation, historical research, risk controls and local vault.
3. Freqtrade, Hummingbot, FreqAI and future engines are optional external references/validators/sidecars.
4. If an external project disappears, Seven Heaven must continue to function.
5. External code is not copied blindly; license and model differences are documented.
6. Real-order capability is separate, isolated and never implied by research integration.

## Related project documents

- [Master professional bot architecture](../../SEVEN_HEAVEN_STRATEGY_LAB_MASTER_ARCHITECTURE_PROFESSIONAL_BOTS_USB_STORAGE_VERSIONED_ROADMAP_2026_11_13.md)
- [Freqtrade / Hummingbot / NautilusTrader research handoff](../../SEVEN_HEAVEN_FREQTRADE_HUMMINGBOT_AND_NAUTILUSTRADER_STRATEGY_LAB_RESEARCH_AND_OPERATOR_TRADUS_HANDOFF_2026_11_13.md)
- [Strategy Atlas](../../../../../assets/strategy_library/seven-heaven-crypto-strategy-atlas.html)

## Storage policy

- Small durable research documents, proof JSON and project-owned tools: commit under this directory.
- Large exact third-party source archives: GitHub Releases + registry + SHA-256.
- User-private files: never publish here.
