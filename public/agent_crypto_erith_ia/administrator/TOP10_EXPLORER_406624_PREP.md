# Agent-Crypto 40.6.624 — Top 10 Explorer · Bureaux PREP

## State

**Prepared only. Do not merge during Christophe's pause.**

Promotion gate:

1. 40.6.623 Firefox proof must PASS first.
2. 40.6.624 CI must PASS.
3. Then Christophe validates 40.6.624 in Firefox.
4. Only after those proofs may 40.6.624 become the canonical checkpoint.

## Product destination

One compact, collapsible Top 10 Explorer inside the existing Market workspace:

- Hausse 24h
- Baisse 24h
- Volume 24h
- Nouveaux listings

Maximum 10 rows per view.

Clicking a row selects the asset through the already-existing canonical owner. The Explorer never creates a second Market, Graph, Fiche, Bougies or Profondeur.

## Owners reused

### Core rankings

Source:

`AtlasMarketUniverse1000.universe(250)`

Selection:

`atlasSelectMarketCoin(coin)`

This reuses the current Market state and the canonical selection event already consumed by Bougies / Profondeur / shared Trader surfaces.

No additional market fetch is created for Hausse/Baisse/Volume.

### New listings

Discovery and selection:

`AgentCryptoNewListingsNativeCategory.discover({force:false})`

`AgentCryptoNewListingsNativeCategory.select(spec)`

The Explorer does not duplicate Bitget/OKX/new-listing plumbing. Discovery occurs only after the operator explicitly selects the Nouveaux listings tab.

## UI placement

`#marketWorkspaceGrid` before `#marketSnapshotPanel`.

The panel spans the full Market grid, can be collapsed, and remains part of the shared Administrator runtime used by Trader.

## Safety / non-regression

Unchanged:

- Market Core 38.15.11
- Bridge 1.9.13
- Backend 1.4.6 R2
- Market Instrument Resolver
- Graph owner
- Market Snapshot owner
- Math Core
- Lecture Technique
- Bougies owner
- Profondeur owner
- S/R formulas
- real execution remains disabled

Added:

- no recurring timer
- no MutationObserver
- no storage owner
- no new business-network owner
- no order path

## Static proof expected

- JavaScript syntax PASS
- Trader Current PASS
- Version Truth PASS
- Version Delivery PASS
- Market Microscope / Depth remain PASS
- Top10 self-test PASS

## Firefox proof after 40.6.623 is validated

1. Livecheck / Refresh Market.
2. Open Top 10 Explorer.
3. Hausse 24h: ten highest available resident 24h changes.
4. Baisse 24h: ten lowest available resident 24h changes.
5. Volume 24h: ten highest available resident volumes.
6. Click one core row:
   - canonical asset selection changes;
   - Graphique follows;
   - Bougies follows;
   - Profondeur follows when a compatible book exists;
   - Lecture Technique follows.
7. Open Nouveaux listings:
   - existing native discovery owner is reused;
   - click a listing;
   - no duplicate graph/market/fiche appears.
8. Return to a normal core asset and confirm the external context is released normally.

## STOP

No merge, no Pages publication and no persisted ZIP while Christophe is away.
