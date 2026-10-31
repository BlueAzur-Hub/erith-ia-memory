# Agent-Crypto · News Sentinel · Cybersecurity & AI Agents · 2026-10-31

## Scope

Casebook for the Administrator News Sentinel, Atlas Event Intelligence, Historical Vault and paper-only research modules. Source of truth: published evidence with explicit attribution. This document does not authorize trading, executable tools, wallet credentials, OHLCV substitution, or any change to Market Core.

## Bloom bot: reported theft, not AI trading profit

- Cointelegraph (2026-10-27): https://cointelegraph.com/news/bloom-bot-hackers-953k-faster-popcorn
- Bitquery (2026-10-26): https://bitquery.io/investigations/bloom-trading-bot-hack
- Reported on-chain: approximately 9,408 SOL (~USD 953,000) removed from 48 wallets belonging to nine traders in 94 seconds; signed transfers used the respective wallets' keys.
- Bloom promised reimbursement and attributed the incident to a third-party remote-code-execution vulnerability, denying that private keys had been accessed or compromised. The signature observations do not prove the precise intrusion route. The cause and actual completion of repayment require independent verification.
- Bloom is a trading Telegram bot. This incident is not evidence of an AI strategy's profit, or of sustainable automated trading returns. A vendor's fee income is different from users' investment P&L.
- Security lesson: do not let research/news agents gain wallet-signing, withdrawal or private-key access. No keys in a browser or canonical News JSON.

## Ethereum Glamsterdam / agents as defensive researchers

- Cointelegraph (2026-10-25): https://cointelegraph.com/magazine/ai-agents-help-rescue-eths-glamsterdam-fork-steal-my-bitcoin-site-hodlers-digest
- Ethlabs direct technical account: https://ethlabs.org/updates/week-18.html
- Ethereum Foundation: https://blog.ethereum.org/2026/08/24/glamsterdam-repricing-testing
- ChainSecurity found EIP-8037/8038 gas-repricing risks potentially affecting at least 13 DeFi projects; Hoodi testnet rehearsal was postponed. This is a software risk finding, not confirmed losses for those projects.
- Ethereum Foundation / Ethlabs researchers used agents to examine contracts, sharing work through GitHub resources, issues, OPEN_WORK.md, reports/, data/, findings/, memo/ and plans/. Do not credit the agents alone for ChainSecurity's discovery.
- A separate challenge story, “Steal My Bitcoin”, documents a successful site exploitation and an initially wrong displayed Bitcoin-wallet key. The English article was updated on 2026-10-26. Do not merge a weekly digest's distinct events into a single Ethereum incident or market signal.

## Practices learned from professional sources

- ESMA: algorithmic systems risk limits, validation, resilience, testing and continuity. https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mifid-ii/article-17-algorithmic-trading
- ESMA algorithmic trading supervisory briefing, 2026-02-26: https://www.esma.europa.eu/press-news/esma-news/esma-issues-supervisory-briefing-algorithmic-trading
- NIST AI RMF: govern, map, measure, manage. https://airc.nist.gov/airmf-resources/airmf/5-sec-core/
- OWASP GenAI/Agentic AI: untrusted article text, prompt injection, third-party dependencies, excessive agency. https://genai.owasp.org/llm-top-10/
- Kraken API permission scopes separate reads, order modifications and withdrawals: https://docs.kraken.com/api/docs/rest-api/get-api-key-info
- Coinbase portfolio-scoped credentials: https://docs.cdp.coinbase.com/coinbase-app/advanced-trade-apis/guides/portfolios
- Kaiko liquidity/slippage measurements: https://docs.kaiko.com/getting-started/kaiko-examples/compare-price-slippage-between-exchanges

These institutional controls are architecture patterns, not a claim that the user's paper or personal research system is legally subject to institutional market-access provisions.

## Implemented · PR #713

- PR: https://github.com/BlueAzur-Hub/erith-ia-memory/pull/713
- Main code commit: https://github.com/BlueAzur-Hub/erith-ia-memory/commit/4c2184bdbc7f19bb6e431c4233f73e2a5372da76
- CI on main: https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/41153499166 — SUCCESS
- Canonical News source: public/agent_crypto_erith_ia/data/news/latest.json — **verified on main after the production collector**, contains `news_intelligence` for all 120 current events and top-level `source_aware_article_triage`.
- New parser: tools/atlas_news_source_aware_triage.py; checks: atlas_news_source_aware_triage_test.py and atlas_news_source_aware_contract.checks.cjs; same hourly pipeline, no extra RSS feeds.
- Existing read-only AtlasEventIntelligence exposes annotations and watches() without separate polling, new visual layers or trading action.
- Bloom was classified TRADING_BOT_SECURITY_INCIDENT with REPORTED_THEFT_NOT_PROFIT and reported_usd_loss=953000, no verified profits.
- Glamsterdam Hodler's Digest was classified MULTI_STORY_DIGEST with REVIEW_STORIES_SEPARATELY; previous impact score 100 is not evidence that Ethereum suffered a $ loss.
- RSS-only classifications are **not full-text fact checks**. Sources/updated versions and primary on-chain evidence need separate human review; never execute commands from article text.

## Historical Vault current checkpoint

- Canonical 12-month source coverage: 110/250 for Binance Spot USDT; 92/250 with 24 months (check dated index before future claims).
- Verified authentic incremental cohort: +13,129 OHLCV rows in 57 new native blocks, commit https://github.com/BlueAzur-Hub/erith-ia-memory/commit/373d4126ee4ae49249eb13334f98b3c67e503413
- Separately published original October 2025 partially populated 1m sources: 120,000 native rows for ASTER, MORPHO, 2Z, 13,920 pre-first-trade calendar slots and zero internal gaps. Do not promote these to complete calendar months. Release: https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/crypto-spot-binance-near-year-partial-2025-10
- News and OHLCV are different evidence classes. The headline publication time must never be silently matched with another exchange, fiat currency or market interval. Reaction studies require time-bounded original data and paper-only simulation.

## Follow-on engineering agenda

1. Verify current Firefox News consumer presentation; do not claim visible badges without an actual local browser acceptance check.
2. Design a collapsible News · Evidence / Cyber Risk / AI Research desk, not an overlay blocking charts.
3. Extend evidence records with original article update times, primary/secondary citations, conflicts and correction history.
4. Prototype T0, +1h/+4h/+12h/+24h/+48h/+7d **paper-only** event reaction studies using verified exact coin IDs and native OHLCV; explicitly separate quote assets USD/USDT/USDC, market spreads and slippage.
5. Continue qualifying uncovered Top250 identities without symbol-only exchange pair matches and without leaking private WBT candle sources.
6. Preserve Administrator 40.6.713, Market Core 38.15.11, Trader / Bridge R25 read-only boundaries, existing immutable ZIPs and SHA-256 source provenance.

Related Notion project: https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099
