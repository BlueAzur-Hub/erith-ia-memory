(() => {
  "use strict";
  const BUILD = "40.4.165";

  const METALS_FOUNDATION = Object.freeze({
    build: "40.4.164",
    state: "CANONICAL_EXISTING_RUNTIME",
    runtime_owner: "app.js::atlasParallelMarketInit + atlasMetalsQuoteFoundation*",
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
    forecast_added: false,
    order_added: false,
    execution_signal_added: false,
    stop_if_date_currency_unit_or_state_incoherent: true,
    market_core_changed: false,
    new_network_owner: false,
    new_timer: false,
    new_observer: false,
    new_storage_owner: false
  });
  globalThis.ErithMetalsFoundation404164 = METALS_FOUNDATION;


  const METALS_MULTI_HORIZON = Object.freeze({
    build: "40.4.165",
    state: "CANONICAL_EXISTING_ENGINE",
    owner: "app.js::atlasMetalsQuoteFoundationHorizonReading + atlasMetalsQuoteFoundationRenderAnalysisHorizons",
    horizons: Object.freeze([
      Object.freeze({id:"7d",days:7,series:"Yahoo Finance Futures daily"}),
      Object.freeze({id:"30d",days:30,series:"Yahoo Finance Futures daily"}),
      Object.freeze({id:"90d",days:90,series:"Yahoo Finance Futures daily"}),
      Object.freeze({id:"1y",days:365,series:"Yahoo Finance Futures daily"})
    ]),
    intraday_24h_owner: "Yahoo Finance Futures intraday when available; never synthesized from daily data",
    current_quote_excluded_from_historical_return_path: true,
    sample_count_must_be_visible: true,
    source_period_and_units_preserved: true,
    no_new_calculation_engine: true,
    no_new_fetch: true,
    no_new_timer: true,
    market_core_changed: false,
    audit() {
      const names = ["atlasMetalsQuoteFoundationHorizonReading","atlasMetalsQuoteFoundationRenderAnalysisHorizons","atlasMetalsQuoteFoundationPeriodRows"];
      return Object.freeze({
        build: "40.4.165",
        owners: Object.freeze(Object.fromEntries(names.map(name => [name, typeof globalThis[name] === "function"]))),
        dom_horizons: Object.freeze([...document.querySelectorAll("[data-metals-analysis-horizon]")].map(node => Number(node.dataset.metalsAnalysisHorizon)).filter(Number.isFinite))
      });
    }
  });
  globalThis.ErithMetalsMultiHorizon404165 = METALS_MULTI_HORIZON;

  document.documentElement.dataset.marketsDomainContractBuild = BUILD;
})();
