(() => {
  "use strict";
  const BUILD = "40.4.166";
  const REVISION = "R1";

  const METALS_FOUNDATION = Object.freeze({
    build: "40.4.164",
    canonical_revision: "40.4.166R1",
    state: "CANONICAL_EXISTING_RUNTIME",
    routing_owner: "app.js::atlasParallelMarketSetDomain + atlasParallelMarketInit",
    demand_owner: "globalThis.AtlasParallelMarketDemand40465.ensure",
    archive_root: "../data/metals/",
    symbols: Object.freeze(["XAU","XAG","XPT","XPD","HG"]),
    asset_ids: Object.freeze(["gold","silver","platinum","palladium","copper"]),
    current_quote_source: "Gold API public archive",
    history_source: "Yahoo Finance Futures public archive",
    eur_conversion: "ECB indicative only",
    structural_sources: Object.freeze(["USGS","IEA","RMIS","World Bank"]),
    current_quote_and_futures_history_separate: true,
    structural_data_never_replaces_market_quote: true,
    crypto_cache_reuse_forbidden: true,
    fabricated_values_forbidden: true,
    observation_only: true,
    default_crypto_boot_metals_dormant: true,
    market_core_changed: false,
    new_network_owner: false,
    new_timer: false,
    new_observer: false,
    new_storage_owner: false
  });
  globalThis.ErithMetalsFoundation404164 = METALS_FOUNDATION;

  const METALS_MULTI_HORIZON = Object.freeze({
    build: "40.4.165",
    canonical_revision: "40.4.166R1",
    state: "CANONICAL_EXISTING_ENGINE",
    owner: "app.js::atlasMetalsQuoteFoundationHorizonReading + atlasMetalsQuoteFoundationRenderAnalysisHorizons",
    horizons: Object.freeze([
      Object.freeze({id:"24h",hours:24,series:"Yahoo Finance Futures intraday",interval:"5m",measured:true}),
      Object.freeze({id:"7d",days:7,series:"Yahoo Finance Futures daily",measured:true}),
      Object.freeze({id:"30d",days:30,series:"Yahoo Finance Futures daily",measured:true}),
      Object.freeze({id:"90d",days:90,series:"Yahoo Finance Futures daily",measured:true}),
      Object.freeze({id:"1y",days:365,series:"Yahoo Finance Futures daily",measured:true})
    ]),
    current_quote_excluded_from_historical_return_path: true,
    spot_futures_mix_forbidden: true,
    sample_count_must_be_visible: true,
    source_period_and_units_preserved: true,
    no_new_calculation_engine: true,
    no_new_fetch: true,
    no_new_timer: true,
    market_core_changed: false,
    audit() {
      const demand = globalThis.AtlasParallelMarketDemand40465;
      return Object.freeze({
        build: BUILD,
        revision: REVISION,
        demand_owner_available: typeof demand?.ensure === "function",
        dom_horizons: Object.freeze([...document.querySelectorAll("[data-metals-analysis-horizon]")].map(node => Number(node.dataset.metalsAnalysisHorizon)).filter(Number.isFinite))
      });
    }
  });
  globalThis.ErithMetalsMultiHorizon404165 = METALS_MULTI_HORIZON;

  const PARALLEL_MARKETS_ROUTER = Object.freeze({
    build: BUILD,
    revision: REVISION,
    state: "CANONICAL_FACADE_OVER_EXISTING_PARALLEL_MARKET_RUNTIME",
    routing_owner: "app.js::atlasParallelMarketSetDomain + atlasParallelMarketInit",
    metals_demand_owner: "globalThis.AtlasParallelMarketDemand40465.ensure",
    active_domains: Object.freeze({
      crypto: Object.freeze({id:"crypto",state:"ACTIVE",engine:"Market Core 38.15.11",data_scope:"crypto only"}),
      metals: Object.freeze({id:"metals",state:"ACTIVE_DEMAND",engine:"existing Parallel Markets / Metals runtime",data_scope:"metals only"})
    }),
    future_domains: Object.freeze({
      indices: Object.freeze({id:"indices",state:"PLANNED_INERT"}),
      energy: Object.freeze({id:"energy",state:"PLANNED_INERT"}),
      commodities: Object.freeze({id:"commodities",state:"PLANNED_INERT"}),
      cross_market: Object.freeze({id:"cross_market",state:"PLANNED_INERT"})
    }),
    separation: Object.freeze({
      crypto_state_is_authority_for_crypto: true,
      metals_state_is_authority_for_metals: true,
      cross_domain_cache_reuse_forbidden: true,
      source_truth_kept_per_domain: true,
      no_cross_domain_average: true,
      no_automatic_financial_action: true
    }),
    readiness() {
      return Object.freeze({
        crypto: true,
        metals_router: typeof globalThis.atlasParallelMarketInit === "function",
        metals_demand_owner: typeof globalThis.AtlasParallelMarketDemand40465?.ensure === "function",
        indices: false,
        energy: false,
        commodities: false,
        cross_market: false
      });
    },
    direct_reinitialize_forbidden: true,
    second_engine_created: false,
    new_network_owner: false,
    new_timer: false,
    new_observer: false,
    new_storage_owner: false
  });
  globalThis.ErithParallelMarketsRouter404166 = PARALLEL_MARKETS_ROUTER;

  document.documentElement.dataset.marketsDomainContractBuild = BUILD;
  document.documentElement.dataset.marketsDomainContractRevision = REVISION;
})();
