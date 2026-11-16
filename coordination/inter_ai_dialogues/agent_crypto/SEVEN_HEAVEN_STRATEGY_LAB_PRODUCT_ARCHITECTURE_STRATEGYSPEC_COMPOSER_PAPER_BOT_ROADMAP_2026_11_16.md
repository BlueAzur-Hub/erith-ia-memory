# Seven Heaven Strategy Lab — Product Architecture
## Strategy Composer · StrategySpec · Seven Core · PAPER Bot · Optional External Validators

**Date:** 2026-11-16  
**Status:** canonical product-orientation proposal adopted for the next development phase  
**Scope:** local Windows/Python Seven Heaven Strategy Lab; PAPER first; no real-order authorization  
**Historical base:** V4.6.2 stable owner-accepted; V4.7.0-RC1 Donchian pre-release validated in owner Firefox.

---

## 1. Product definition

Here, **product** does not mean a commercial SaaS. It means the complete owner-facing software experience: what Christophe opens, understands, configures, tests, learns from and later uses to run PAPER bots.

The Strategy Lab has accumulated a serious scientific engine, but the owner-facing experience is still too close to a researcher console. The next development phase therefore stops random feature accumulation and turns the existing engine into a coherent usable product.

The canonical objective remains:

> **Create a strategy visually → understand it → test it on verified history → compare it across markets/regimes → save it → run the same strategy as a Seven Heaven PAPER bot → only much later, optionally connect an isolated real exchange executor after explicit authorization.**

Seven Heaven must remain independently runnable even if Freqtrade, Hummingbot, FreqAI, NautilusTrader or any external project disappears.

---

## 2. Non-negotiable architectural principles

1. **Seven Heaven is the owner-facing home and primary runtime.**
2. **Seven Heaven owns its strategy format.**
3. **Seven Heaven owns its internal PAPER simulator/backtester.**
4. **Seven Heaven owns its risk controls, forensics, research journal and local vault.**
5. **External engines are optional validators/references/sidecars, never mandatory dependencies.**
6. **No real order by default.**
7. **The future OKX execution connector is isolated from the research core.**
8. **The same strategy definition must survive UI changes and engine changes.**
9. **Project-critical public knowledge lives in GitHub, not only in an LLM chat/library.**
10. **A feature is not product-complete until the owner can understand why it exists and use it from the interface.**

---

## 3. New canonical architecture

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    SEVEN HEAVEN — PRODUCT UI                        │
│                                                                     │
│  Guided Mode · Learn · Create · Compare · Test · PAPER · Expert    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 STRATEGY ATLAS / KNOWLEDGE LAYER                    │
│                                                                     │
│ Trend · Mean reversion · Momentum · DCA · Grid · Market making     │
│ Indicators · explanations · risks · compatible engines             │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STRATEGY COMPOSER                                │
│                                                                     │
│ No-code rules · entries · exits · filters · sizing · risk          │
│ Human-readable explanation generated before execution               │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   STRATEGYSPEC v1    │
                    │  Seven-owned format  │
                    └──────────┬───────────┘
                               │
           ┌───────────────────┼────────────────────┐
           │                   │                    │
           ▼                   ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
│ SEVEN BACKTEST   │  │ SEVEN PAPER BOT  │  │ OPTIONAL VALIDATORS  │
│ / SIMULATOR      │  │ runtime (V5)     │  │                      │
│                  │  │                  │  │ Freqtrade            │
│ causal fills     │  │ scheduler        │  │ Hummingbot           │
│ costs/inventory  │  │ public market    │  │ FreqAI               │
│ risk/forensics   │  │ simulated orders │  │ NautilusTrader later │
└────────┬─────────┘  │ risk / kill      │  └──────────┬───────────┘
         │            └────────┬─────────┘             │
         │                     │                       │
         └─────────────┬───────┴───────────────┬───────┘
                       ▼                       ▼
             ┌──────────────────┐    ┌────────────────────────┐
             │ EXPERIMENT LOG   │    │ RESULT NORMALIZATION   │
             │ / LOCAL VAULT    │    │ engine differences     │
             └────────┬─────────┘    └───────────┬────────────┘
                      │                          │
                      └────────────┬─────────────┘
                                   ▼
                       ┌──────────────────────┐
                       │ AETHER EXPLANATION   │
                       │ What happened? Why?  │
                       │ What next to test?   │
                       └──────────────────────┘

FUTURE, SEPARATE SAFETY BOUNDARY:

StrategySpec → Seven PAPER Bot → Risk Gate → isolated OKX connector
                                      │
                                      └── explicit owner activation only
```

---

## 4. StrategySpec v1 — the central independence layer

`StrategySpec` is the most important new abstraction.

It is a Seven Heaven-owned, versioned and human-readable strategy definition. It must not belong to Freqtrade, Hummingbot, OKX or a specific UI implementation.

Conceptual example:

```yaml
schema: seven.strategy_spec.v1
id: seven_trend_001
name: Seven Trend 001

market:
  asset_scope: BTC/USDT
  timeframe: 4h

entry:
  all:
    - EMA(20) crosses_above EMA(50)
    - RSI(14) < 55
    - volume > SMA(volume,20) * 1.2

exit:
  any:
    - EMA(20) crosses_below EMA(50)
    - stop_loss_pct: 5

risk:
  allocation_pct: 25
  max_open_positions: 1

execution:
  mode: PAPER
  signal_on: closed_candle
  hypothetical_fill: next_open

provenance:
  created_by: Seven Heaven Strategy Composer
```

The exact schema will be designed and tested before runtime adoption. The key contract is that the same StrategySpec can be consumed by:

- Seven internal historical simulator;
- Seven future PAPER Bot;
- a Freqtrade adapter when compatible;
- a Hummingbot adapter when compatible;
- future ML/AI research;
- future isolated real-execution adapters after explicit authorization.

No adapter is allowed to silently reinterpret an unsupported StrategySpec. It must declare compatibility or a model mismatch.

---

## 5. Owner-facing modes

### 5.1 Guided Mode — default

The owner should not start on a raw quant form.

Home questions:

- **Comprendre une stratégie**
- **Créer ma stratégie**
- **Comparer des stratégies**
- **Tester sur plusieurs marchés/périodes**
- **Lancer un robot PAPER**
- **Mode expert**

Every guided experiment must explain:

1. what the selected strategy is trying to do;
2. what the parameters mean in normal language;
3. what historical source is being used;
4. what happened;
5. why the result may have occurred;
6. what is known vs only hypothetical;
7. one logical next experiment.

### 5.2 Expert Mode

The current detailed controls remain available for advanced inspection:

- capital;
- fees/slippage;
- indicator periods;
- exact timeframe;
- scientific validation;
- Forensics;
- microscope;
- raw comparison tables.

Expert Mode is not removed; it stops being the default learning path.

---

## 6. Strategy Atlas becomes an active product component

The existing public Strategy Atlas must no longer be a passive reference page only.

It becomes the knowledge catalog behind the Composer.

Each strategy family should eventually expose structured metadata:

- human description;
- market behavior sought;
- common failure regimes;
- indicators/rules involved;
- editable parameters;
- risk characteristics;
- compatible Seven execution model;
- compatible optional external validators;
- whether the model is directional, inventory/grid, DCA, market-making, etc.

Initial families:

### Directional / trend
- EMA cross
- Donchian
- SuperTrend
- MACD-derived rules

### Mean reversion
- Bollinger
- RSI / oscillator rules
- VWAP-derived rules

### Accumulation
- DCA

### Inventory / market making
- Spot Grid
- PMM / Avellaneda-inspired research
- future inventory-aware strategies

Grid/market-making remain a separate execution family until their fill/inventory model is explicitly supported by Seven.

---

## 7. Data architecture

The current hardcoded OKX allowlist and 10/30/60/90-day UX is not sufficient as the long-term product interface.

Replace hardcoded UI assumptions with a **versioned Source Catalog**.

Conceptual source entry:

```json
{
  "source_id": "BINANCE_BTCUSDT_2024_1H_CERTIFIED",
  "exchange": "Binance Spot",
  "pair": "BTC/USDT",
  "timeframe": "1h",
  "first_utc": "...",
  "last_utc": "...",
  "rows": 8784,
  "sha256": "...",
  "integrity": "CERTIFIED_CONTIGUOUS",
  "location": "workspace/public_sources/..."
}
```

The product UI can then present:

- asset;
- exchange/source;
- year/window;
- timeframe;
- certification status;

without rewriting Python allowlists for every new dataset.

Already researched/certified corpora should progressively become catalog entries instead of remaining buried only in research reports.

---

## 8. Experiment Orchestrator

A new orchestration layer should automate the repetitive scientific workflow that is currently pushed onto the owner.

Example:

> “Test Seven Trend 001 on BTC, ETH, SOL across 2024, 2025 and 2026.”

The orchestrator should:

1. select only compatible verified sources;
2. run the same immutable StrategySpec;
3. preserve identical cost assumptions unless intentionally changed;
4. produce comparable results;
5. show positive and negative periods;
6. identify regime dependence without pretending to predict the future;
7. store one experiment bundle in the local vault.

This turns the existing Scientific/Forensics machinery into a product capability instead of a collection of buttons.

---

## 9. Aether Explanation Layer

Aether does not replace the mathematical engine.

**The engine calculates; Aether explains.**

For each experiment, the UI should produce a short owner-readable interpretation:

### What happened?
“Three Donchian positions were opened; two lost money; final PAPER return was -7.83%.”

### Why might this have happened?
“The strategy entered breakouts that did not persist during this historical window.”

### Compared with what?
“On the exact same source/cost assumptions, Bollinger and Hold performed differently.”

### What does this NOT prove?
“This does not predict future performance.”

### Logical next test
“Replay the identical StrategySpec on another certified period or asset.”

Every interpretation must remain traceable to engine outputs.

---

## 10. Seven PAPER Bot — V5 target

V5 is not “real trading”.

The Seven PAPER Bot should reuse StrategySpec directly.

Required components:

- market-data watcher using public data;
- closed-candle scheduler;
- StrategySpec evaluator;
- simulated order state machine;
- cash/inventory accounting;
- fees/slippage model;
- rejected-order handling;
- persistent PAPER positions;
- restart recovery;
- local event journal;
- risk limits;
- kill switch;
- explicit status: PAPER / NO REAL ORDER.

The major architectural achievement is:

> A strategy created in the Composer and validated historically runs **without being rewritten** in the PAPER Bot.

---

## 11. External engines — optional validation layer

### Freqtrade
Role:
- independent directional backtesting;
- dry-run research;
- lookahead/recursive diagnostics;
- Hyperopt reference;
- FreqAI architecture/ML reference.

### Hummingbot
Role:
- study controller/executor architecture;
- Grid / market making / inventory;
- exchange execution semantics.

### FreqAI
Role:
- architecture reference for future Aether ML:
  - features/labels;
  - adaptive retraining;
  - train/test/inference separation;
  - historical retraining;
  - model persistence;
  - producer/consumer patterns.

### NautilusTrader or future engines
Role:
- later execution-realism research if justified.

External engine status remains explicit:
`NOT_INSTALLED | AVAILABLE | VALIDATED | FAILED | UNVERIFIED`.

If every external validator disappears, Seven Heaven must still:
- open;
- load its sources;
- create StrategySpecs;
- backtest;
- compare;
- explain;
- run PAPER bots.

---

## 12. Future Aether ML

Machine learning is **not the next immediate milestone**.

It becomes relevant after:
- StrategySpec is stable;
- data catalog is coherent;
- PAPER bot runtime exists;
- train/test leakage controls are explicit.

Future Aether ML may study the ideas documented in FreqAI:

- features and labels;
- supervised models;
- adaptive retraining;
- realistic chronological retraining;
- normalization and outlier handling;
- model persistence;
- optional GPU acceleration.

The ML layer remains research/PAPER first and cannot bypass the risk engine.

---

## 13. Future real OKX execution — separate system boundary

Real execution must never be an accidental extension of the simulator.

Future path:

```text
StrategySpec
   ↓
Seven Strategy Runtime
   ↓
PAPER state machine
   ↓
RISK GATE
   ↓
explicit owner activation
   ↓
isolated OKX connector
   ↓
order
```

The connector must be replaceable. The strategy and research core must not depend on OKX-specific credentials or APIs.

Required before any real execution:
- explicit owner approval;
- account/key isolation;
- read/write permission separation;
- order-size/minimum/tick rules;
- rate-limit handling;
- kill switch;
- maximum capital/exposure limits;
- full event journal;
- safe restart and fail-closed behavior.

No such authorization is granted by this architecture document.

---

## 14. Updated version roadmap

### V4.7.0-RC1 — engine proof
Status: **completed as release candidate / pre-release**.

Purpose:
- native Donchian;
- causal/Forensics parity;
- scientific engine proof;
- owner Firefox reception.

It revealed that the engine is stronger than the current owner UX.

### V4.8 — Product Foundation
Primary goal: **make the Lab understandable and navigable**.

Target:
- Guided Mode;
- Expert Mode preserved;
- StrategySpec v1 schema;
- Strategy Composer rebuilt around StrategySpec;
- Source Catalog v1;
- human explanations for strategy parameters;
- current strategies migrated to StrategySpec-compatible representations where safe.

No new strategy family required for V4.8.

### V4.9 — Strategy Workshop
Target:
- Strategy Atlas integrated into Composer;
- reusable templates;
- multi-asset/multi-period Experiment Orchestrator;
- richer rule blocks;
- saved StrategySpec library;
- compatibility matrix per execution family;
- explainable experiment summaries.

### V5.0 — Seven PAPER Bot
Target:
- live public market monitoring;
- StrategySpec scheduler/evaluator;
- persistent fictitious orders and inventory;
- risk engine;
- kill switch;
- journal/restart recovery;
- zero real orders.

### V5.x — Optional validators and Aether ML research
Target:
- isolated Freqtrade adapter;
- isolated Hummingbot adapter for compatible models;
- optional FreqAI-inspired ML experiments;
- normalized result contract;
- no mandatory external runtime.

### Future execution stage — not version-promised
- isolated OKX real connector;
- explicit activation and guardrails;
- only after PAPER runtime maturity and separate owner authorization.

---

## 15. Development stop rules

The following patterns are now discouraged:

- adding another strategy only to increase the count;
- running large research campaigns without a product question;
- exposing a technical parameter without an explanation;
- duplicating mature external bot frameworks inside Seven without a specific independence reason;
- making an external framework mandatory;
- letting an LLM-only conversation become the sole location of a project decision.

Each new feature must answer:

1. What owner problem does it solve?
2. Where does it appear in the product flow?
3. Does it preserve StrategySpec portability?
4. Can Seven still function without external engines?
5. Is it PAPER-safe by default?
6. Is the decision documented in public GitHub?

---

## 16. Immediate next engineering gate

Do **not** start by adding another indicator or bot.

First build and validate, on an isolated branch:

1. `StrategySpec v1` schema and parser;
2. migration adapters for the existing native strategies;
3. a simple Guided Mode home;
4. Strategy Composer outputting a StrategySpec;
5. one end-to-end proof:
   - create Donchian 55/20 or EMA visually;
   - save StrategySpec;
   - replay it through Seven internal simulator;
   - display the result and human explanation;
   - reload the same StrategySpec and obtain deterministic equivalent results.

Only after that gate should V4.8 expand the Source Catalog and orchestration.

---

## 17. Durable continuity references

- Master architecture:
  `coordination/inter_ai_dialogues/agent_crypto/SEVEN_HEAVEN_STRATEGY_LAB_MASTER_ARCHITECTURE_PROFESSIONAL_BOTS_USB_STORAGE_VERSIONED_ROADMAP_2026_11_13.md`
- Versioned continuity manifest:
  `coordination/inter_ai_dialogues/agent_crypto/research/strategy_lab/SEVEN_HEAVEN_STRATEGY_LAB_VERSIONED_CONTINUITY_MANIFEST.json`
- External engines/ML index:
  `coordination/inter_ai_dialogues/agent_crypto/research/external_bots/README.md`
- Strategy Atlas:
  `assets/strategy_library/seven-heaven-crypto-strategy-atlas.html`
- FreqAI reference:
  `coordination/inter_ai_dialogues/agent_crypto/research/external_bots/upstream_docs/freqtrade/freqai.md`

This document supersedes **product-direction ambiguity**, not historical research evidence. Existing research remains valid as dated evidence.
