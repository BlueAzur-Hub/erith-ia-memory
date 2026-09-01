(() => {
  "use strict";
  const BUILD = "40.4.164";

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

  document.documentElement.dataset.marketsDomainContractBuild = BUILD;
})();
