const state = {
  liveOk: false,
  mainSource: null,
  timestamp: null,
  coins: [],
  global: null,
  watchIds: ["bitcoin","ethereum","solana","binancecoin","ripple","tether","usd-coin","usds","cardano","tron","dogecoin","chainlink","toncoin","avalanche-2","polkadot","litecoin","sui","aptos","arbitrum","optimism","polygon-ecosystem-token","uniswap","aave","ondo-finance","maker","pendle","near","bittensor","render-token","internet-computer","shiba-inu","pepe","monero","zcash"],
  sourceStatus: [],
  sourceStatusExpectedTotal: 8,
  selectedCoinId: "bitcoin",
  chartPeriodDays: 1,
  chartCache: {},
  chartRenderToken: 0,
  chartEngineV2: {
    token: 0,
    controller: null,
    lastKey: "",
    loading: false,
    realChart: null,
    lastRenderedKey: "",
    lastFingerprint: ""
  },
  sourceLock: {
    canonical: "CoinGecko",
    valid: false,
    mode: "none",
    snapshotId: null,
    timestamp: null,
    reason: "Livecheck requis"
  },
  dataBroker: {
    market: {
      status: "idle",
      source: "CoinGecko",
      mode: "none",
      timestamp: null,
      snapshotId: null,
      assetsCount: 0,
      quoteCurrencies: []
    },
    spot: {
      status: "idle",
      coinId: null,
      source: "CoinGecko",
      mode: "none",
      eur: null,
      usd: null,
      timestamp: null,
      token: 0,
      controller: null,
      error: null
    },
    chart: {
      status: "idle",
      coinId: null,
      period: 1,
      source: "CoinGecko",
      mode: "none",
      timestamp: null,
      pointCount: 0,
      result: null,
      error: null
    },
    comparison: {
      mode: "single",
      limit: 3,
      ids: []
    }
  },
  assetFilter: "all",
  sortKey: "rank-asc",
  sim: null,
  math: null,
  auto: {
    enabled: true,
    cadence: "adaptive",
    intervalMs: 60000,
    timer: null,
    countdownTimer: null,
    nextAt: null,
    lastStartedAt: null,
    lastRunMs: 0,
    livecheckBusy: false,
    bootStarted: false
  }
};
const $ = (id) => document.getElementById(id); const els = { liveStatus: $("liveStatus"), sourceName: $("sourceName"), sourceTime: $("sourceTime"), sourceDecision: $("sourceDecision"), tableDecision: $("tableDecision"), offlineNotice: $("offlineNotice"), tickerTrack: $("tickerTrack"), marketRows: $("marketRows"), tableNote: $("tableNote"), searchInput: $("searchInput"), metricMarketCap: $("metricMarketCap"), metricMarketCapHint: $("metricMarketCapHint"), metricVolume: $("metricVolume"), metricVolumeHint: $("metricVolumeHint"), metricBtcDom: $("metricBtcDom"), metricBtcDomHint: $("metricBtcDomHint"), metricSources: $("metricSources"), metricSourcesHint: $("metricSourcesHint"), sourceGrid: $("sourceGrid"), scoreRing: $("scoreRing"), scoreValue: $("scoreValue"), scoreLabel: $("scoreLabel"), scoreBreakdown: $("scoreBreakdown"), watchInput: $("watchInput"), watchCards: $("watchCards"), watchBasketSummary: $("watchBasketSummary"), riskGrid: $("riskGrid"), newsInput: $("newsInput"), newsOutput: $("newsOutput"), fomoInput: $("fomoInput"), fomoOutput: $("fomoOutput"), coldRead: $("coldRead"), beginnerSummary: $("beginnerSummary"), advancedPanel: $("advancedPanel"), advancedGrid: $("advancedGrid"), btnToggleAdvanced: $("btnToggleAdvanced"), selectedAssetTitle: $("selectedAssetTitle"), mainChart: $("mainChart"), chartCaption: $("chartCaption"), assetDetailGrid: $("assetDetailGrid"), assetDetailWhy: $("assetDetailWhy"), brokerMarket: $("brokerMarket"), brokerMarketTime: $("brokerMarketTime"), brokerSpot: $("brokerSpot"), brokerSpotTime: $("brokerSpotTime"), brokerChart: $("brokerChart"), brokerChartTime: $("brokerChartTime"), trustLockText: $("trustLockText"), sourceDiagnosticTitle: $("sourceDiagnosticTitle"), sourceDiagnosticNote: $("sourceDiagnosticNote"), sourceDiagnosticGrid: $("sourceDiagnosticGrid"), sortSelect: $("sortSelect"), commandInput: $("commandInput"), commandOutput: $("commandOutput"), commandHuman: $("commandHuman"), btnRunCommand: $("btnRunCommand"), simCash: $("simCash"), simPositionsValue: $("simPositionsValue"), simTotalValue: $("simTotalValue"), simPnL: $("simPnL"), simSymbol: $("simSymbol"), simAmount: $("simAmount"), btnSimBuy: $("btnSimBuy"), btnSimSell: $("btnSimSell"), btnSimReset: $("btnSimReset"), simPositions: $("simPositions"), simLog: $("simLog"), simProfileStatus: $("simProfileStatus"), schoolResult: $("schoolResult"), btnBuildSimSummary: $("btnBuildSimSummary"), btnDownloadLearningJournal: $("btnDownloadLearningJournal"), btnDownloadSimJSON: $("btnDownloadSimJSON"), simLearningOutput: $("simLearningOutput"), btnSaveCollectorSnapshot: $("btnSaveCollectorSnapshot"), btnShowCollectorMemory: $("btnShowCollectorMemory"), btnDownloadCollectorJSON: $("btnDownloadCollectorJSON"), btnDownloadCollectorJSONL: $("btnDownloadCollectorJSONL"), btnClearCollectorMemory: $("btnClearCollectorMemory"), collectorCount: $("collectorCount"), collectorLast: $("collectorLast"), collectorOutput: $("collectorOutput"), btnExploreMemory: $("btnExploreMemory"), btnCompareMemory: $("btnCompareMemory"), btnSummarizeRefusals: $("btnSummarizeRefusals"), btnDownloadMemoryReport: $("btnDownloadMemoryReport"), memoryExplorerOutput: $("memoryExplorerOutput"), btnSaveReferenceSnapshot: $("btnSaveReferenceSnapshot"), btnSaveAfterTestSnapshot: $("btnSaveAfterTestSnapshot"), btnSaveLaterSnapshot: $("btnSaveLaterSnapshot"), btnCollectionChecklist: $("btnCollectionChecklist"), btnDownloadCollectionPlan: $("btnDownloadCollectionPlan"), collectionProgressTitle: $("collectionProgressTitle"), collectionProgressText: $("collectionProgressText"), collectionProgressBar: $("collectionProgressBar"), collectionPlanOutput: $("collectionPlanOutput"), actionFeedback: $("actionFeedback"), btnShowWakePlan: $("btnShowWakePlan"), btnDownloadWakePlan: $("btnDownloadWakePlan"), btnMarkPauseReady: $("btnMarkPauseReady"), resumeAssistantOutput: $("resumeAssistantOutput"), autoModeStatus: $("autoModeStatus"), btnAutoToggle: $("btnAutoToggle"), btnAutoNow: $("btnAutoNow"), autoCadenceSelect: $("autoCadenceSelect"), autoLastRead: $("autoLastRead"), autoNextRead: $("autoNextRead"), autoActiveCadence: $("autoActiveCadence"), autoSnapshots: $("autoSnapshots"), autoMarketPulse: $("autoMarketPulse"), autoWatchStatus: $("autoWatchStatus"), autoReaderOutput: $("autoReaderOutput"), collectorIdInput: $("collectorIdInput"), collectorIdentityBadge: $("collectorIdentityBadge"), btnSaveCollectorId: $("btnSaveCollectorId"), btnExportAutoMemory: $("btnExportAutoMemory"), autoMemoryImport: $("autoMemoryImport"), btnClearAutoMemory: $("btnClearAutoMemory"), sharedCollectorId: $("sharedCollectorId"), sharedLocalCount: $("sharedLocalCount"), sharedCollectorsCount: $("sharedCollectorsCount"), sharedLastImport: $("sharedLastImport"), sharedMemoryOutput: $("sharedMemoryOutput"), githubMemoryStatus: $("githubMemoryStatus"), btnLoadGithubMemory: $("btnLoadGithubMemory"), githubMemoryLatest: $("githubMemoryLatest"), githubMemoryRecords: $("githubMemoryRecords"), githubMemoryCollectors: $("githubMemoryCollectors"), githubMemoryFusion: $("githubMemoryFusion"), githubMemoryOutput: $("githubMemoryOutput")
}; const MARKET_CACHE_KEY = "agent_crypto_erith_ia_market_cache_v1_1_alpha_26_34_source_lock";
const fmtEUR = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
const fmtCompactEUR = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", notation: "compact", maximumFractionDigits: 2 });
const fmtUSD = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const fmtCompactUSD = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2 });
function atlasPriceDigits(value) {
  const n = Math.abs(Number(value));
  if (!Number.isFinite(n)) return 2;
  if (n >= 1000) return 2;
  if (n >= 1) return 4;
  if (n >= 0.01) return 6;
  if (n >= 0.0001) return 8;
  return 10;
}
function atlasFormatCurrency(value, currency = "EUR") {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  const digits = atlasPriceDigits(n);
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency, minimumFractionDigits: Math.min(2, digits), maximumFractionDigits: digits }).format(n);
}
function atlasFormatEUR(value) { return atlasFormatCurrency(value, "EUR"); }
function atlasFormatUSD(value) { return atlasFormatCurrency(value, "USD"); }
const fmtPct = (n) => typeof n === "number" ? `${n >= 0 ? "+" : ""}${n.toFixed(2)} %` : "Donnée manquante";
const clsPct = (n) => typeof n !== "number" ? "neutral" : n > 0 ? "pos" : n < 0 ? "neg" : "neutral";
const clamp = (min, max, value) => Math.max(min, Math.min(max, value)); function setText(el, value) { if (el) el.textContent = value;
} function setTableDecision(text, mode = "") { setText(els.sourceDecision, text); setText(els.tableDecision, text); for (const el of [els.sourceDecision, els.tableDecision]) { if (!el) continue; el.classList.remove("ok", "fail", "warn"); if (mode) el.classList.add(mode); }
} function setHTML(el, value) { if (el) el.innerHTML = value;
} function escapeHtml(str) { return String(str ?? "").replace(/[&<>'"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[c]));
} function num(value, formatter = fmtEUR.format.bind(fmtEUR)) { return typeof value === "number" && Number.isFinite(value) ? formatter(value) : "Donnée manquante";
} async function fetchWithTimeout(url, options = {}, timeout = 9000) { const controller = new AbortController(); const id = setTimeout(() => controller.abort(), timeout); try { const response = await fetch(url, { ...options, signal: controller.signal, cache: "no-store" }); if (!response.ok) throw new Error(`HTTP ${response.status}`); return await response.json(); } finally { clearTimeout(id); }
} const ATLAS_CANONICAL_MARKET_SOURCE = "CoinGecko";


const ATLAS_COMPARISON_MAX_SERIES = 5;
const ATLAS_SPOT_REFRESH_MS = 30 * 1000;
const ATLAS_SPOT_TIMEOUT_MS = 5000;

function atlasBrokerAgeLabel(timestamp) {
  const parsed = typeof timestamp === "number" ? timestamp : Date.parse(timestamp || "");
  if (!Number.isFinite(parsed)) return "heure inconnue";
  const minutes = Math.max(0, Math.round((Date.now() - parsed) / 60000));
  if (minutes < 2) return "moins de 2 min";
  if (minutes < 90) return `${minutes} min`;
  const hours = minutes / 60;
  return hours < 48 ? `${hours.toFixed(1)} h` : `${(hours / 24).toFixed(1)} j`;
}

function atlasBrokerModeLabel(mode) {
  if (mode === "direct") return "CoinGecko direct";
  if (mode === "github-cache") return "CoinGecko · cache GitHub";
  if (mode === "local-cache") return "CoinGecko · cache navigateur";
  if (mode === "browser-cache") return "CoinGecko · historique navigateur";
  if (mode === "coingecko-direct") return "CoinGecko direct";
  return "En attente";
}

function atlasBrokerCommitMarket(snapshot, mode) {
  state.dataBroker.market = {
    status: "ready",
    source: ATLAS_CANONICAL_MARKET_SOURCE,
    mode: mode || "none",
    timestamp: snapshot?.timestamp || new Date().toISOString(),
    snapshotId: snapshot?.snapshotId || null,
    assetsCount: Array.isArray(snapshot?.coins) ? snapshot.coins.length : 0,
    quoteCurrencies: [...new Set((snapshot?.coins || []).flatMap(coin => coin.quoteCurrencies || ["EUR"]))]
  };
}

function atlasBrokerResetMarket(reason = "Marché indisponible") {
  state.dataBroker.market = {
    status: "blocked",
    source: ATLAS_CANONICAL_MARKET_SOURCE,
    mode: "none",
    timestamp: null,
    snapshotId: null,
    assetsCount: 0,
    quoteCurrencies: [],
    error: reason
  };
}

function atlasBrokerSeedSpot(coin) {
  if (!coin) return;
  const current = state.dataBroker.spot;
  if (current?.coinId === coin.id && current?.status === "direct" && Number.isFinite(Date.parse(current.timestamp || "")) && Date.now() - Date.parse(current.timestamp) < ATLAS_SPOT_REFRESH_MS) return;
  state.dataBroker.spot = {
    status: "snapshot",
    coinId: coin.id,
    source: ATLAS_CANONICAL_MARKET_SOURCE,
    mode: state.dataBroker.market?.mode || state.sourceLock?.mode || "none",
    eur: Number.isFinite(Number(coin.priceEur ?? coin.price)) ? Number(coin.priceEur ?? coin.price) : null,
    usd: Number.isFinite(Number(coin.priceUsd)) ? Number(coin.priceUsd) : null,
    timestamp: coin.lastUpdated || coin.timestamp || state.timestamp || null,
    token: Number(current?.token || 0),
    controller: current?.controller || null,
    error: null
  };
}

function atlasBrokerCommitChart(coin, period, result, status = "ready") {
  const metrics = result?.integrity?.metrics || {};
  state.dataBroker.chart = {
    status,
    coinId: coin?.id || null,
    period: Number(period || 1),
    source: ATLAS_CANONICAL_MARKET_SOURCE,
    mode: result?.sourceMode || "none",
    timestamp: Number.isFinite(metrics.lastTimestamp) ? new Date(metrics.lastTimestamp).toISOString() : result?.generatedAt || null,
    pointCount: Number(metrics.pointCount || result?.series?.length || 0),
    result: result || null,
    error: result?.technicalReason || result?.reason || null
  };
}

function atlasRenderBrokerStrip() {
  const market = state.dataBroker.market || {};
  const spot = state.dataBroker.spot || {};
  const chart = state.dataBroker.chart || {};
  setText(els.brokerMarket, market.status === "ready" ? atlasBrokerModeLabel(market.mode) : "Indisponible");
  setText(els.brokerMarketTime, market.timestamp ? `${market.assetsCount || 0} actifs · ${atlasBrokerAgeLabel(market.timestamp)}` : "—");
  const spotReady = spot.coinId === state.selectedCoinId && ["direct", "snapshot"].includes(spot.status);
  setText(els.brokerSpot, spotReady ? (spot.status === "direct" ? "CoinGecko spot direct" : `Snapshot · ${atlasBrokerModeLabel(spot.mode)}`) : spot.status === "loading" ? "Actualisation…" : "En attente");
  setText(els.brokerSpotTime, spotReady && spot.timestamp ? atlasBrokerAgeLabel(spot.timestamp) : "—");
  const chartReady = chart.coinId === state.selectedCoinId && chart.period === Number(state.chartPeriodDays || 1) && chart.status === "ready";
  setText(els.brokerChart, chartReady ? atlasBrokerModeLabel(chart.mode) : chart.status === "loading" ? "Chargement…" : chart.status === "blocked" ? "Indisponible" : "En attente");
  setText(els.brokerChartTime, chartReady ? `${chart.pointCount || 0} points · ${atlasBrokerAgeLabel(chart.timestamp)}` : "—");
}

function atlasRenderMarketAccessNotice() {
  if (!els.offlineNotice) return;
  const market = state.dataBroker.market || {};
  if (!state.liveOk || market.status !== "ready") {
    els.offlineNotice.style.display = "block";
    els.offlineNotice.innerHTML = '<strong>ACCÈS MARCHÉ EN ATTENTE</strong><p>Aucun snapshot CoinGecko canonique n’est disponible. Atlas n’injecte aucune autre source de prix.</p>';
    return;
  }
  if (market.mode === "direct") {
    els.offlineNotice.style.display = "none";
    return;
  }
  const origin = market.mode === "github-cache" ? "GitHub" : "ce navigateur";
  els.offlineNotice.style.display = "block";
  els.offlineNotice.innerHTML = `<strong>MODE CACHE COINGECKO</strong><p>Snapshot réel chargé depuis ${origin} · ${escapeHtml(atlasBrokerAgeLabel(market.timestamp))}. L’actualisation directe continue en arrière-plan ; les données visibles ne changent pas de fournisseur.</p>`;
}

async function atlasRefreshSelectedSpot(coin) {
  if (!coin?.id) return null;
  const broker = state.dataBroker.spot;
  if (broker?.coinId === coin.id && broker?.status === "direct" && Number.isFinite(Date.parse(broker.timestamp || "")) && Date.now() - Date.parse(broker.timestamp) < ATLAS_SPOT_REFRESH_MS) return broker;
  if (broker?.controller) {
    try { broker.controller.abort(); } catch {}
  }
  const token = Number(broker?.token || 0) + 1;
  const controller = new AbortController();
  state.dataBroker.spot = { ...state.dataBroker.spot, status: "loading", coinId: coin.id, token, controller, error: null };
  atlasRenderBrokerStrip();
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coin.id)}&vs_currencies=eur,usd&include_last_updated_at=true&precision=full`;
    const payload = await atlasFetchJson(url, { signal: controller.signal, timeoutMs: ATLAS_SPOT_TIMEOUT_MS });
    const row = payload?.[coin.id] || {};
    const eur = Number(row.eur);
    const usd = Number(row.usd);
    if (!Number.isFinite(eur) || eur <= 0) throw new Error("prix spot EUR absent");
    if (state.dataBroker.spot.token !== token || state.selectedCoinId !== coin.id) return null;
    const timestamp = Number(row.last_updated_at) ? new Date(Number(row.last_updated_at) * 1000).toISOString() : new Date().toISOString();
    state.dataBroker.spot = {
      status: "direct",
      coinId: coin.id,
      source: ATLAS_CANONICAL_MARKET_SOURCE,
      mode: "direct",
      eur,
      usd: Number.isFinite(usd) && usd > 0 ? usd : null,
      timestamp,
      token,
      controller: null,
      error: null
    };
    atlasRenderBrokerStrip();
    atlasRefreshSelectedDetailOnly();
    return state.dataBroker.spot;
  } catch (error) {
    if (error?.name === "AbortError") return null;
    if (state.dataBroker.spot.token !== token || state.selectedCoinId !== coin.id) return null;
    const seeded = state.dataBroker.spot;
    state.dataBroker.spot = { ...seeded, status: Number.isFinite(Number(seeded.eur)) ? "snapshot" : "blocked", controller: null, error: String(error?.message || error) };
    atlasRenderBrokerStrip();
    atlasRefreshSelectedDetailOnly();
    return null;
  }
}
const SourceAdapter = {
  async coingeckoMarkets() {
    const eurUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=1h,24h,7d,30d&locale=fr&precision=full";
    const eurRows = await fetchWithTimeout(eurUrl, {}, 9000);
    if (!Array.isArray(eurRows) || !eurRows.length) throw new Error("Format CoinGecko EUR invalide");
    const ids = eurRows.map(coin => coin.id).filter(Boolean).join(",");
    let usdById = {};
    if (ids) {
      try {
        const usdUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd&include_last_updated_at=true&precision=full`;
        usdById = await fetchWithTimeout(usdUrl, {}, 7000);
      } catch (error) {
        console.debug("[Atlas Source Lock] USD CoinGecko indisponible", error);
      }
    }
    return eurRows.map((coin) => {
      const usd = usdById?.[coin.id] || {};
      const updatedAt = coin.last_updated || (Number(usd.last_updated_at) ? new Date(Number(usd.last_updated_at) * 1000).toISOString() : new Date().toISOString());
      return {
        id: coin.id,
        rank: coin.market_cap_rank,
        name: coin.name,
        symbol: String(coin.symbol || "").toUpperCase(),
        image: coin.image,
        price: Number(coin.current_price),
        priceEur: Number(coin.current_price),
        priceUsd: Number.isFinite(Number(usd.usd)) ? Number(usd.usd) : null,
        change1h: coin.price_change_percentage_1h_in_currency,
        change24h: coin.price_change_percentage_24h_in_currency ?? coin.price_change_percentage_24h,
        change7d: coin.price_change_percentage_7d_in_currency,
        change30d: coin.price_change_percentage_30d_in_currency,
        high24h: coin.high_24h,
        low24h: coin.low_24h,
        marketCap: coin.market_cap,
        volume24h: coin.total_volume,
        sparkline7d: Array.isArray(coin.sparkline_in_7d?.price) ? coin.sparkline_in_7d.price : [],
        lastUpdated: updatedAt,
        source: ATLAS_CANONICAL_MARKET_SOURCE,
        sourceMode: "direct",
        quoteCurrencies: ["EUR", ...(Number.isFinite(Number(usd.usd)) ? ["USD"] : [])],
        timestamp: updatedAt
      };
    }).filter(coin => coin.id && coin.symbol && Number.isFinite(coin.priceEur) && coin.priceEur > 0);
  },
  async coingeckoGlobal() {
    const data = await fetchWithTimeout("https://api.coingecko.com/api/v3/global", {}, 9000);
    if (!data || !data.data) throw new Error("Format global CoinGecko invalide");
    return data.data;
  },
  async dexScreenerPing() { const data = await fetchWithTimeout("https://api.dexscreener.com/latest/dex/search?q=bitcoin"); if (!data || !Array.isArray(data.pairs)) throw new Error("Format DEX Screener invalide"); return { pairs: data.pairs.length }; },
  async geckoTerminalPing() { const data = await fetchWithTimeout("https://api.geckoterminal.com/api/v2/networks"); if (!data || !Array.isArray(data.data)) throw new Error("Format GeckoTerminal invalide"); return { networks: data.data.length }; },
  async defiLlamaPing() { const data = await fetchWithTimeout("https://api.llama.fi/protocols"); if (!Array.isArray(data)) throw new Error("Format DefiLlama invalide"); return { protocols: data.length }; },
  async binancePing() { const data = await fetchWithTimeout("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT"); if (!data || !data.symbol) throw new Error("Format Binance invalide"); return { symbol: data.symbol }; },
  async krakenPing() { const data = await fetchWithTimeout("https://api.kraken.com/0/public/Ticker?pair=BTCEUR"); if (!data || data.error?.length) throw new Error(data.error?.join(", ") || "Format Kraken invalide"); return { ok: true }; },
  async coinLorePing() {
    const data = await fetchWithTimeout("https://api.coinlore.net/api/tickers/?start=0&limit=5");
    if (!data || !Array.isArray(data.data) || !data.data.length) throw new Error("Format CoinLore invalide");
    return { diagnosticOnly: true, assets: data.data.length, quoteCurrency: "USD", detail: "Joignable en diagnostic uniquement · jamais injecté dans Atlas" };
  },
  async coinbasePing() { return { backendRequired: true, detail: "Backend requis : endpoint Coinbase non testé depuis GitHub Pages." }; }
};
const liveSources = [
  { key: "coingecko", name: "CoinGecko", kind: "source canonique EUR + USD", canonicalMarket: true, fn: async () => ({ markets: await SourceAdapter.coingeckoMarkets(), global: await SourceAdapter.coingeckoGlobal(), canonicalMarket: true }) },
  { key: "coinlore", name: "CoinLore", kind: "diagnostic USD seulement", diagnosticOnly: true, fn: SourceAdapter.coinLorePing },
  { key: "dexscreener", name: "DEX Screener", kind: "DEX", fn: SourceAdapter.dexScreenerPing },
  { key: "geckoterminal", name: "GeckoTerminal", kind: "DEX pools", fn: SourceAdapter.geckoTerminalPing },
  { key: "defillama", name: "DefiLlama", kind: "DeFi", fn: SourceAdapter.defiLlamaPing },
  { key: "binance", name: "Binance", kind: "exchange · diagnostic", fn: SourceAdapter.binancePing },
  { key: "kraken", name: "Kraken", kind: "exchange · diagnostic", fn: SourceAdapter.krakenPing },
  { key: "coinbase", name: "Coinbase", kind: "exchange", fn: SourceAdapter.coinbasePing }
]; function setLiveStatus(mode, text) { if (!els.liveStatus) return; els.liveStatus.className = `pill ${mode}`; els.liveStatus.textContent = text;
} function cleanError(error) { return String(error?.message || error || "Erreur inconnue") .replace(/AbortError/i, "Timeout") .slice(0, 72);
} function detailFromResult(result) { if (!result) return "OK"; if (result.backendRequired) return result.detail || "Backend requis"; if (result.diagnosticOnly) return result.detail || "Diagnostic uniquement"; if (result.markets) return `${result.markets.length} actifs CoinGecko verrouillés`; if (result.pairs !== undefined) return `${result.pairs} paires`; if (result.networks !== undefined) return `${result.networks} réseaux`; if (result.protocols !== undefined) return `${result.protocols} protocoles`; if (result.symbol) return result.symbol; return "OK";
} function normalizeSourceStatusList(list = state.sourceStatus) { const map = new Map(); for (const item of list || []) { if (!item || !item.key) continue; map.set(item.key, item); } return [...map.values()];
} function pushSourceStatus(record) { if (!record || !record.key) return; state.sourceStatus = normalizeSourceStatusList(state.sourceStatus).filter(item => item.key !== record.key); state.sourceStatus.push(record);
} function updateSourceMetric(doneOverride = null) { state.sourceStatus = normalizeSourceStatusList(state.sourceStatus); const total = Math.max(1, Number(state.sourceStatusExpectedTotal || liveSources.length)); const done = Math.min(total, doneOverride ?? state.sourceStatus.length); const ok = Math.min(total, state.sourceStatus.filter(s => s.status === "OK").length); const backend = state.sourceStatus.filter(s => s.status === "BACKEND").length; const fail = Math.max(0, done - ok - backend); const backendText = backend ? ` · ${backend} backend requis` : ""; const failText = fail === 1 ? "1 échec" : `${fail} échecs`; setText(els.metricSources, `${ok}/${total}`); if (!done) { setText(els.metricSourcesHint, `0/${total} interrogées`); } else if (done < total) { setText(els.metricSourcesHint, `${done}/${total} interrogées · ${ok} réussies${backendText}`); } else { setText(els.metricSourcesHint, `${done}/${total} interrogées · ${failText}${backendText}`); }
} function clearMarketDisplay(reason = "Marché live indisponible.") { state.liveOk = false; state.mainSource = null; state.timestamp = null; state.coins = []; state.global = null; atlasBrokerResetMarket(reason); setText(els.metricMarketCap, "—"); setText(els.metricMarketCapHint, "Donnée non récupérée"); setText(els.metricVolume, "—"); setText(els.metricVolumeHint, "Donnée non récupérée"); setText(els.metricBtcDom, "—"); setText(els.metricBtcDomHint, "Donnée non récupérée"); setHTML( els.tickerTrack, `<span class="ticker-meta">${escapeHtml(reason)} · aucun prix affiché · pas de tableau fictif</span>` ); renderEmptyMarket(`${reason.toUpperCase()} — aucun tableau chiffré.`); renderScore(null); renderWatchlist(); renderRiskGrid(); renderColdRead(false); renderBeginnerSummary(); renderAnalystPanel(); renderDecisionBoard();
} function atlasSetSourceLock(mode, timestamp, reason = "Source canonique CoinGecko", valid = true, snapshotId = null) {
  state.sourceLock = {
    canonical: ATLAS_CANONICAL_MARKET_SOURCE,
    valid: !!valid,
    mode: mode || "none",
    snapshotId: snapshotId || null,
    timestamp: timestamp || null,
    reason: String(reason || "")
  };
}
function atlasCanonicalCoin(coin) {
  return !!coin && String(coin.source || "").toLowerCase() === "coingecko" && Number.isFinite(Number(coin.priceEur ?? coin.price)) && Number(coin.priceEur ?? coin.price) > 0;
}
function atlasCanonicalSnapshot(coins) {
  return Array.isArray(coins) && coins.length > 0 && coins.every(atlasCanonicalCoin);
}
function saveMarketCache() {
  if (!state.coins?.length || !state.sourceLock?.valid || !atlasCanonicalSnapshot(state.coins)) return;
  try {
    localStorage.setItem(MARKET_CACHE_KEY, JSON.stringify({
      schema: "atlas_market_cache_source_lock_v1",
      version: "V1.1-alpha.26.35",
      saved_at: new Date().toISOString(),
      canonical_source: ATLAS_CANONICAL_MARKET_SOURCE,
      source_mode: state.sourceLock.mode,
      snapshot_id: state.sourceLock.snapshotId,
      source: state.mainSource || ATLAS_CANONICAL_MARKET_SOURCE,
      timestamp: state.timestamp || new Date().toISOString(),
      coins: state.coins,
      global: state.global
    }));
  } catch {}
}
function loadMarketCache() {
  try {
    const raw = localStorage.getItem(MARKET_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || parsed.canonical_source !== ATLAS_CANONICAL_MARKET_SOURCE || !atlasCanonicalSnapshot(parsed.coins)) return null;
    return parsed;
  } catch { return null; }
}
function atlasMapGithubAsset(asset, record, payload) {
  const priceEur = Number(asset.price_eur);
  const priceUsd = Number(asset.price_usd);
  const timestamp = asset.last_updated || record?.saved_at || payload?.generated_at || null;
  return {
    id: asset.id,
    rank: asset.rank,
    name: asset.name,
    symbol: String(asset.symbol || "").toUpperCase(),
    image: asset.image || "",
    price: priceEur,
    priceEur,
    priceUsd: Number.isFinite(priceUsd) && priceUsd > 0 ? priceUsd : null,
    change1h: Number.isFinite(Number(asset.change_1h_pct)) ? Number(asset.change_1h_pct) : null,
    change24h: Number.isFinite(Number(asset.change_24h_pct)) ? Number(asset.change_24h_pct) : null,
    change7d: Number.isFinite(Number(asset.change_7d_pct)) ? Number(asset.change_7d_pct) : null,
    change30d: Number.isFinite(Number(asset.change_30d_pct)) ? Number(asset.change_30d_pct) : null,
    high24h: Number.isFinite(Number(asset.high_24h_eur)) ? Number(asset.high_24h_eur) : null,
    low24h: Number.isFinite(Number(asset.low_24h_eur)) ? Number(asset.low_24h_eur) : null,
    marketCap: Number(asset.market_cap_eur),
    volume24h: Number(asset.volume_24h_eur),
    sparkline7d: Array.isArray(asset.sparkline_7d_eur) ? asset.sparkline_7d_eur : [],
    lastUpdated: timestamp,
    source: ATLAS_CANONICAL_MARKET_SOURCE,
    sourceMode: "github-cache",
    quoteCurrencies: ["EUR", ...(Number.isFinite(priceUsd) && priceUsd > 0 ? ["USD"] : [])],
    timestamp
  };
}
async function loadGithubCanonicalMarketSnapshot() {
  const payload = await fetchWithTimeout(`../data/latest.json?t=${Date.now()}`, {}, 6000);
  const record = Array.isArray(payload?.records) ? payload.records[payload.records.length - 1] : null;
  const source = String(payload?.source || record?.source || "");
  if (payload?.live_ok !== true || source.toLowerCase() !== "coingecko") throw new Error("Snapshot GitHub non canonique");
  const rawAssets = Array.isArray(payload?.live_assets) && payload.live_assets.length ? payload.live_assets : Array.isArray(record?.assets) ? record.assets : [];
  const coins = rawAssets.map(asset => atlasMapGithubAsset(asset, record, payload)).filter(atlasCanonicalCoin);
  if (!coins.length) throw new Error("Snapshot GitHub CoinGecko vide");
  const global = record?.global ? {
    total_market_cap: { eur: record.global.market_cap_eur },
    total_volume: { eur: record.global.volume_24h_eur },
    market_cap_percentage: { btc: record.global.btc_dominance_pct }
  } : null;
  return {
    coins,
    global,
    timestamp: record?.saved_at || payload.generated_at || new Date().toISOString(),
    snapshotId: record?.snapshot_id || record?.id || payload.generated_at || null,
    sourceLabel: "CoinGecko · cache GitHub"
  };
}
function atlasApplyCanonicalSnapshot(snapshot, mode) {
  if (!snapshot || !atlasCanonicalSnapshot(snapshot.coins)) return false;
  state.coins = snapshot.coins;
  state.global = snapshot.global || null;
  state.mainSource = snapshot.sourceLabel || `CoinGecko · ${mode}`;
  state.timestamp = snapshot.timestamp || new Date().toISOString();
  state.liveOk = true;
  atlasSetSourceLock(mode, state.timestamp, "Toutes les données de marché et d’analyse proviennent de CoinGecko.", true, snapshot.snapshotId || null);
  atlasBrokerCommitMarket({ ...snapshot, coins: state.coins, timestamp: state.timestamp, snapshotId: snapshot.snapshotId || null }, mode);
  if (!state.selectedCoinId || !state.coins.some(c => c.id === state.selectedCoinId)) state.selectedCoinId = state.coins[0]?.id || "bitcoin";
  saveMarketCache();
  return true;
}
function applyMarketCache(reason = "CoinGecko direct indisponible : dernier snapshot CoinGecko local conservé.") {
  const cache = loadMarketCache();
  if (!cache) return false;
  const applied = atlasApplyCanonicalSnapshot({ coins: cache.coins, global: cache.global, timestamp: cache.timestamp, snapshotId: cache.snapshot_id, sourceLabel: "CoinGecko · cache local" }, "local-cache");
  if (!applied) return false;
  setLiveStatus("warn", "CoinGecko en cache");
  setText(els.sourceName, state.mainSource);
  setText(els.sourceTime, new Date(state.timestamp).toLocaleString("fr-FR"));
  setTableDecision("Source Lock CoinGecko · snapshot local", "warn");
  atlasRenderMarketAccessNotice();
  renderAll();
  return true;
}
function explainForBeginnerLiveFailure(okCount = 0) {
  const total = Math.max(1, Number(state.sourceStatusExpectedTotal || liveSources.length));
  return `CoinGecko direct est indisponible. ${Math.min(okCount, total)}/${total} sources techniques ont répondu, mais Atlas refuse de mélanger leurs prix. ` + "Atlas conserve uniquement un snapshot CoinGecko GitHub ou local ; sinon les prix et scores sont bloqués.";
}
async function runLivecheck() {
  if (state.auto?.livecheckBusy) return;
  state.auto.livecheckBusy = true;
  state.auto.lastStartedAt = new Date().toISOString();
  state.auto.lastRunMs = Date.now();
  state.sourceStatusExpectedTotal = liveSources.length;
  const hadCanonical = state.liveOk && state.sourceLock?.valid && atlasCanonicalSnapshot(state.coins);
  try {
    renderAutoReader();
    setLiveStatus("warn", "CoinGecko en vérification");
    setTableDecision("Source Lock · vérification CoinGecko", "warn");
    setText(els.sourceName, "CoinGecko en vérification...");
    state.sourceStatus = [];
    if (!hadCanonical) clearMarketDisplay("Livecheck CoinGecko en cours");
    loadSimulation(); renderSimulation(); renderSimpleCommandIntro(); renderSourceGrid(); updateSourceMetric(0);

    let marketLoaded = false;
    const canonicalSource = liveSources.find(src => src.canonicalMarket);
    const canonicalStarted = performance.now();
    try {
      const result = await canonicalSource.fn();
      const ms = Math.round(performance.now() - canonicalStarted);
      pushSourceStatus({ ...canonicalSource, status: "OK", ms, detail: detailFromResult(result) });
      marketLoaded = atlasApplyCanonicalSnapshot({
        coins: result.markets,
        global: result.global,
        timestamp: result.markets[0]?.timestamp || new Date().toISOString(),
        snapshotId: `browser-direct_${new Date().toISOString()}`,
        sourceLabel: "CoinGecko · direct EUR + USD"
      }, "direct");
    } catch (error) {
      pushSourceStatus({ ...canonicalSource, status: "ÉCHEC", ms: null, detail: cleanError(error) });
      try { marketLoaded = atlasApplyCanonicalSnapshot(await loadGithubCanonicalMarketSnapshot(), "github-cache"); }
      catch (githubError) { console.debug("[Atlas Source Lock] GitHub indisponible", githubError); }
      if (!marketLoaded && !hadCanonical) marketLoaded = applyMarketCache("CoinGecko direct et GitHub sont indisponibles.");
      if (!marketLoaded && hadCanonical) {
        marketLoaded = true;
        setLiveStatus("warn", "Dernière lecture CoinGecko conservée");
        setTableDecision("Source Lock CoinGecko · actualisation différée", "warn");
      }
    }

    if (marketLoaded && state.liveOk && state.sourceLock?.valid) {
      const direct = state.sourceLock.mode === "direct";
      setLiveStatus(direct ? "ok" : "warn", direct ? "Livecheck CoinGecko OK" : "CoinGecko en cache");
      setText(els.sourceName, state.mainSource);
      setText(els.sourceTime, new Date(state.timestamp).toLocaleString("fr-FR"));
      setTableDecision(direct ? "Source Lock CoinGecko · direct" : "Source Lock CoinGecko · cache réel", direct ? "ok" : "warn");
      atlasRenderMarketAccessNotice();
      renderAll();
    } else {
      atlasSetSourceLock("none", null, "Aucun snapshot CoinGecko disponible", false);
      setLiveStatus("fail", "CoinGecko indisponible");
      clearMarketDisplay("Source canonique indisponible");
      setText(els.sourceName, "Aucune source canonique");
      setText(els.sourceTime, "—");
      setTableDecision("Bloqué · Source Lock", "fail");
      setText(els.coldRead, explainForBeginnerLiveFailure(0));
    }
    renderSourceGrid(); updateSourceMetric();

    const secondarySources = liveSources.filter(src => !src.canonicalMarket);
    await Promise.allSettled(secondarySources.map(async src => {
      const started = performance.now();
      try {
        const result = await src.fn();
        const ms = Math.round(performance.now() - started);
        pushSourceStatus({ ...src, status: result?.backendRequired ? "BACKEND" : "OK", ms, detail: detailFromResult(result) });
      } catch (error) {
        pushSourceStatus({ ...src, status: "ÉCHEC", ms: null, detail: cleanError(error) });
      }
      renderSourceGrid(); updateSourceMetric();
    }));
    renderTrustLock(state.liveOk && state.sourceLock?.valid);
    atlasAfterLivecheck();
  } catch (fatal) {
    console.error("Livecheck fatal", fatal);
    setLiveStatus("fail", "Livecheck erreur");
    setTableDecision("Erreur interface · relancer", "fail");
  } finally { state.auto.livecheckBusy = false; }
}
async function refreshMarketOnly() {
  if (state.auto?.livecheckBusy) return;
  state.auto.livecheckBusy = true;
  state.auto.lastStartedAt = new Date().toISOString();
  state.auto.lastRunMs = Date.now();
  const previous = { coins: state.coins, global: state.global, mainSource: state.mainSource, timestamp: state.timestamp, sourceLock: state.sourceLock };
  let refreshed = false;
  try {
    try {
      const [markets, global] = await Promise.all([SourceAdapter.coingeckoMarkets(), SourceAdapter.coingeckoGlobal().catch(() => null)]);
      refreshed = atlasApplyCanonicalSnapshot({ coins: markets, global, timestamp: markets[0]?.timestamp || new Date().toISOString(), snapshotId: `browser-direct_${new Date().toISOString()}`, sourceLabel: "CoinGecko · direct EUR + USD" }, "direct");
    } catch (directError) {
      try { refreshed = atlasApplyCanonicalSnapshot(await loadGithubCanonicalMarketSnapshot(), "github-cache"); }
      catch (githubError) { console.debug("[Atlas Source Lock] actualisation différée", directError, githubError); }
    }
    if (!refreshed && previous.sourceLock?.valid && atlasCanonicalSnapshot(previous.coins)) {
      state.coins = previous.coins; state.global = previous.global; state.mainSource = previous.mainSource; state.timestamp = previous.timestamp; state.sourceLock = previous.sourceLock; state.liveOk = true;
      setLiveStatus("warn", "Dernière lecture CoinGecko conservée");
      setTableDecision("Source Lock CoinGecko · actualisation différée", "warn");
      renderAll();
    } else if (refreshed) {
      setLiveStatus(state.sourceLock.mode === "direct" ? "ok" : "warn", state.sourceLock.mode === "direct" ? "Marché CoinGecko actualisé" : "CoinGecko GitHub");
      setText(els.sourceName, state.mainSource);
      setText(els.sourceTime, new Date(state.timestamp).toLocaleString("fr-FR"));
      setTableDecision("Source Lock CoinGecko", state.sourceLock.mode === "direct" ? "ok" : "warn");
      atlasRenderMarketAccessNotice();
      renderAll();
    } else if (!applyMarketCache("Aucune actualisation CoinGecko disponible.")) {
      atlasSetSourceLock("none", null, "Aucun snapshot CoinGecko disponible", false);
      clearMarketDisplay("Source canonique indisponible");
    }
  } finally {
    state.auto.livecheckBusy = false;
    if (refreshed) atlasAfterLivecheck(); else { renderAutoReader(); scheduleNextAutoRun(60000); }
  }
}function classifyAsset(c) { if (!c) return "À vérifier"; const id = String(c.id || "").toLowerCase(); const sym = String(c.symbol || "").toUpperCase(); const rank = Number(c.rank || 999999); const change24 = typeof c.change24h === "number" ? c.change24h : 0; const change7 = typeof c.change7d === "number" ? c.change7d : 0; const ratio = c.volume24h && c.marketCap ? c.volume24h / c.marketCap : 0; const meme = ["DOGE","SHIB","PEPE","BONK","WIF","FLOKI"].includes(sym) || /dog|shib|pepe|bonk|floki|meme/i.test(id); if (id === "bitcoin" || id === "ethereum" || sym === "BTC" || sym === "ETH") return "Socle marché"; if (["USDT","USDC","DAI","FDUSD","TUSD","USDE","USDS"].includes(sym)) return "Stablecoin"; if (meme && rank <= 100) return "Spéculatif liquide"; if (rank <= 20) return "Grand actif solide"; if (rank <= 100 && change24 > 0 && change7 > 0 && ratio >= 0.025) return "Opportunité à surveiller"; if (rank <= 120) return "À vérifier"; if (rank > 200 || ratio < 0.003 || Math.abs(change24) > 35) return "À éviter"; return "À vérifier";
} function atlasActionForCoin(c) { const type = classifyAsset(c); const s = scoreCoin(c); if (!c || s.score === null) return "Attendre"; if (type === "Socle marché") return "Observer / comparer"; if (type === "Stablecoin") return "Surveiller stabilité"; if (type === "Grand actif solide") return "Comparer"; if (type === "Opportunité à surveiller") return "Simulation possible"; if (type === "Spéculatif liquide") return "Surveiller fortement"; if (type === "À éviter") return "Écarter"; return "Vérifier";
} function beginnerDecision(c) { return atlasActionForCoin(c);
} function whyDecision(c) { if (!c) return "Aucune donnée live exploitable."; const type = classifyAsset(c); const action = atlasActionForCoin(c); const bits = []; bits.push(`Catégorie Atlas : ${type}.`); bits.push(`Action de travail : ${action}.`); if (type === "Stablecoin") bits.push("Un stablecoin n’est pas une crypto de hausse : on surveille surtout stabilité, liquidité et risque de désancrage."); if (type === "Socle marché") bits.push("Actif repère : il sert à lire l’état général du marché."); if (type === "Spéculatif liquide") bits.push("Actif liquide mais narratif/spéculatif : prudence renforcée."); if (type === "À éviter") bits.push("Signaux trop fragiles ou trop nerveux pour une simulation simple."); if (typeof c.change24h === "number") bits.push(`Variation 24h : ${fmtPct(c.change24h)}.`); if (typeof c.change7d === "number") bits.push(`Variation 7j : ${fmtPct(c.change7d)}.`); if (c.volume24h && c.marketCap) bits.push(`Ratio volume/market cap : ${((c.volume24h / c.marketCap) * 100).toFixed(2)} %.`); bits.push("Sécurité, social, news et on-chain non encore validés automatiquement."); return bits.join(" ");
} function renderBeginnerSummary() { if (!els.beginnerSummary) return; if (!state.liveOk || !state.coins.length) { els.beginnerSummary.textContent = "Le marché n’est pas lisible pour l’instant. Aucune source marché principale n’a fourni un tableau fiable. Donc : pas de prix, pas de conclusion, pas de tableau fictif."; if (els.advancedGrid) { els.advancedGrid.innerHTML = ` <div><b>État</b><span>Livecheck absent ou échec</span></div> <div><b>Tableau</b><span>Bloqué</span></div> <div><b>Données</b><span>Non récupérées</span></div> <div><b>Règle</b><span>Pas de source live, pas de prix</span></div>`; } return; } const btc = state.coins.find(c => c.id === "bitcoin"); const eth = state.coins.find(c => c.id === "ethereum"); const first = state.coins[0]; els.beginnerSummary.textContent = `Marché lisible depuis ${state.mainSource}. ` + `Le tableau montre des données de marché réelles : prix, variation, volume et capitalisation. ` + `Bitcoin et Ethereum servent de repères. ` + `Les stablecoins ne sont pas des opportunités de hausse : ils servent surtout à lire stabilité et liquidité. ` + `Ce cockpit aide à observer, pas à acheter.`; if (els.advancedGrid) { const ratio = first?.volume24h && first?.marketCap ? ((first.volume24h / first.marketCap) * 100).toFixed(2) + " %" : "Donnée manquante"; els.advancedGrid.innerHTML = ` <div><b>Source</b><span>${escapeHtml(state.mainSource || "—")}</span></div> <div><b>Actifs chargés</b><span>${state.coins.length}</span></div> <div><b>BTC 24h</b><span>${btc ? fmtPct(btc.change24h) : "Donnée manquante"}</span></div> <div><b>ETH 24h</b><span>${eth ? fmtPct(eth.change24h) : "Donnée manquante"}</span></div> <div><b>Premier actif</b><span>${first ? escapeHtml(first.name) : "—"}</span></div> <div><b>Type</b><span>${escapeHtml(classifyAsset(first))}</span></div> <div><b>Vol/Market cap</b><span>${ratio}</span></div> <div><b>Données manquantes</b><span>Sécurité · social · on-chain</span></div>`; }
} function getSelectedCoin() { if (!state.coins.length) return null; const selected = state.coins.find(c => c.id === state.selectedCoinId); return selected || state.coins[0];
} function safeMoney(value) { return atlasFormatEUR(value);
} function atlasChartPeriodLabel(days) {
  const d = Number(days || 1);
  if (d === 1) return "24h";
  return `${d}j`;
}

function atlasChartSetPeriodButtons(days, loading = false) {
  const active = Number(days || 1);
  if (state.chartEngineV2) state.chartEngineV2.loading = !!loading;
  document.querySelectorAll(".period-btn[data-period]").forEach(btn => {
    const period = Number(btn.dataset.period) || 1;
    btn.classList.toggle("active", period === active);
    btn.classList.toggle("loading", !!loading && period === active);
    btn.setAttribute("aria-busy", !!loading && period === active ? "true" : "false");
  });
}

const ATLAS_CHART_CACHE_BASE = "../data/charts";
const ATLAS_CHART_LOCAL_CACHE_KEY = "agent_crypto_erith_ia_real_charts_v1_1_alpha_26_34_source_lock";
const ATLAS_CHART_ASSET_CACHE_BASE = `${ATLAS_CHART_CACHE_BASE}/assets`;
const ATLAS_CHART_MAX_FUTURE_MS = 5 * 60 * 1000;
const ATLAS_CHART_PRICE_GAP_WARN_PCT = 2.5;
const ATLAS_CHART_DIRECT_TIMEOUT_MS = 6500;
const ATLAS_CHART_RULES = Object.freeze({
  1: Object.freeze({ minPoints: 20, minCoverageHours: 20, refreshMs: 2 * 60 * 1000, delayedMs: 6 * 60 * 60 * 1000, archiveMs: 7 * 24 * 60 * 60 * 1000 }),
  7: Object.freeze({ minPoints: 40, minCoverageHours: 132, refreshMs: 10 * 60 * 1000, delayedMs: 24 * 60 * 60 * 1000, archiveMs: 14 * 24 * 60 * 60 * 1000 }),
  30: Object.freeze({ minPoints: 100, minCoverageHours: 600, refreshMs: 30 * 60 * 1000, delayedMs: 72 * 60 * 60 * 1000, archiveMs: 60 * 24 * 60 * 60 * 1000 })
});

function atlasChartRules(days) {
  return ATLAS_CHART_RULES[Number(days || 1)] || ATLAS_CHART_RULES[1];
}

function atlasChartKey(c, days) {
  return `${String(c?.id || "unknown").toLowerCase()}:${Number(days || 1)}`;
}

function atlasChartLegacySlug(c, days) {
  const id = String(c?.id || "").toLowerCase();
  const symbol = String(c?.symbol || "").toUpperCase();
  const period = Number(days || 1);
  const suffix = period === 1 ? "24h" : period === 7 ? "7d" : period === 30 ? "30d" : `${period}d`;
  const core = { bitcoin: "btc", ethereum: "eth", solana: "sol" };
  const bySymbol = { BTC: "btc", ETH: "eth", SOL: "sol" };
  const prefix = core[id] || bySymbol[symbol] || null;
  return prefix ? `${prefix}_${suffix}.json` : null;
}

function atlasChartAssetCacheFile(c) {
  const id = String(c?.id || "").toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
  return id ? `${id}_30d.json` : null;
}

function atlasSliceSeriesForPeriod(prices, days) {
  const rows = atlasNormalizeChartPayload({ prices });
  if (!rows.length) return [];
  const period = Number(days || 1);
  const end = Number(rows[rows.length - 1][0]);
  const start = end - period * 24 * 60 * 60 * 1000;
  const sliced = rows.filter(point => Number(point[0]) >= start);
  const previous = [...rows].reverse().find(point => Number(point[0]) < start);
  if (previous && sliced.length) sliced.unshift(previous);
  return sliced;
}

function atlasNormalizeChartPayload(payload) {
  const raw = Array.isArray(payload?.prices) ? payload.prices : [];
  const byTimestamp = new Map();
  for (const point of raw) {
    const timestamp = Number(point?.[0]);
    const price = Number(point?.[1]);
    if (!Number.isFinite(timestamp) || timestamp <= 0 || !Number.isFinite(price) || price <= 0) continue;
    byTimestamp.set(timestamp, price);
  }
  return [...byTimestamp.entries()].sort((a, b) => a[0] - b[0]);
}

function atlasChartCoverageHours(series) {
  if (!Array.isArray(series) || series.length < 2) return 0;
  return Math.max(0, (Number(series[series.length - 1][0]) - Number(series[0][0])) / 3600000);
}

function atlasChartAgeLabel(timestamp) {
  const t = typeof timestamp === "number" ? timestamp : Date.parse(timestamp || "");
  if (!Number.isFinite(t)) return "âge inconnu";
  const minutes = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (minutes < 2) return "moins de 2 min";
  if (minutes < 90) return `${minutes} min`;
  const hours = minutes / 60;
  if (hours < 48) return `${hours.toFixed(1)} h`;
  return `${(hours / 24).toFixed(1)} j`;
}

function atlasChartFreshness(days, lastTimestamp, generatedAt = null) {
  const rules = atlasChartRules(days);
  const generatedTimestamp = Date.parse(generatedAt || "");
  const reference = Number.isFinite(Number(lastTimestamp)) ? Number(lastTimestamp) : generatedTimestamp;
  const ageMs = Number.isFinite(reference) ? Math.max(0, Date.now() - reference) : Infinity;
  let level = "fresh";
  if (ageMs > rules.archiveMs) level = "expired";
  else if (ageMs > rules.delayedMs) level = "archive";
  else if (ageMs > rules.refreshMs) level = "delayed";
  return { level, ageMs, label: atlasChartAgeLabel(reference) };
}

function atlasCoinPriceIsComparable(c, chartTimestamp) {
  const source = String(c?.source || "").toLowerCase();
  const priceTimestamp = Date.parse(c?.timestamp || state.timestamp || "");
  const seriesTimestamp = Number(chartTimestamp);
  if (!source.includes("coingecko")) return false;
  if (!Number.isFinite(priceTimestamp) || !Number.isFinite(seriesTimestamp)) return false;
  if (priceTimestamp > Date.now() + ATLAS_CHART_MAX_FUTURE_MS || seriesTimestamp > Date.now() + ATLAS_CHART_MAX_FUTURE_MS) return false;
  return Math.abs(priceTimestamp - seriesTimestamp) <= 20 * 60 * 1000;
}

function atlasValidateChartSeries({ c, days, prices, payload = null, sourceMode = "coingecko-direct" }) {
  const period = Number(days || 1);
  const rules = atlasChartRules(period);
  const fail = (reason, metrics = {}) => ({ ok: false, reason, metrics, warnings: [] });
  const warnings = [];

  if (!c?.id) return fail("actif absent");
  if (!Array.isArray(prices)) return fail("série absente");
  if (prices.length < rules.minPoints) return fail(`série trop courte : ${prices.length}/${rules.minPoints} points minimum`);

  const firstTimestamp = Number(prices[0]?.[0]);
  const lastTimestamp = Number(prices[prices.length - 1]?.[0]);
  const firstPrice = Number(prices[0]?.[1]);
  const lastPrice = Number(prices[prices.length - 1]?.[1]);
  const coverageHours = atlasChartCoverageHours(prices);

  if (!Number.isFinite(firstTimestamp) || !Number.isFinite(lastTimestamp) || lastTimestamp <= firstTimestamp) return fail("chronologie invalide");
  if (!Number.isFinite(firstPrice) || firstPrice <= 0 || !Number.isFinite(lastPrice) || lastPrice <= 0) return fail("prix invalides");
  if (coverageHours < rules.minCoverageHours) return fail(`couverture insuffisante : ${coverageHours.toFixed(1)} h/${rules.minCoverageHours} h minimum`, { coverageHours });
  if (lastTimestamp > Date.now() + ATLAS_CHART_MAX_FUTURE_MS) return fail("dernier point daté dans le futur");

  if (sourceMode === "github-cache") {
    if (payload?.live_ok !== true) return fail("cache GitHub non validé");
    if (String(payload?.source || "").toLowerCase() !== "coingecko") return fail("source cache différente de CoinGecko");
    if (String(payload?.coin_id || "").toLowerCase() !== String(c.id || "").toLowerCase()) return fail("cache associé à un autre actif");
    if (payload?.symbol && String(payload.symbol).toUpperCase() !== String(c.symbol || "").toUpperCase()) return fail("symbole du cache incohérent");
    if (String(payload?.vs_currency || "").toLowerCase() !== "eur") return fail("devise du cache différente de EUR");
    if (Number(payload?.days) < period) return fail("période du cache insuffisante");
    if (!Number.isFinite(Date.parse(payload?.generated_at || ""))) return fail("horodatage du cache absent");
  }

  const freshness = atlasChartFreshness(period, lastTimestamp, payload?.generated_at || null);
  if (freshness.level === "expired") return fail(`série réelle trop ancienne : ${freshness.label}`, { coverageHours, freshness });
  if (freshness.level === "delayed") warnings.push(`mise à jour retardée : ${freshness.label}`);
  if (freshness.level === "archive") warnings.push(`archive réelle datée : ${freshness.label}`);

  let priceGapPct = null;
  if (atlasCoinPriceIsComparable(c, lastTimestamp) && Number.isFinite(Number(c.price)) && Number(c.price) > 0) {
    priceGapPct = Math.abs(lastPrice - Number(c.price)) / Number(c.price) * 100;
    if (priceGapPct > ATLAS_CHART_PRICE_GAP_WARN_PCT) warnings.push(`écart prix/courbe : ${priceGapPct.toFixed(2)} %`);
  }

  const values = prices.map(point => Number(point[1]));
  const minPrice = Math.min(...values);
  const maxPrice = Math.max(...values);
  const changePct = firstPrice ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;
  return {
    ok: true,
    reason: warnings.length ? warnings.join(" · ") : "intégrité validée",
    warnings,
    metrics: {
      pointCount: prices.length,
      coverageHours,
      firstTimestamp,
      lastTimestamp,
      firstPrice,
      lastPrice,
      minPrice,
      maxPrice,
      changePct,
      priceGapPct,
      freshness
    }
  };
}

function atlasReadLocalChartStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ATLAS_CHART_LOCAL_CACHE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function atlasWriteLocalChartStore(store) {
  try { localStorage.setItem(ATLAS_CHART_LOCAL_CACHE_KEY, JSON.stringify(store)); } catch {}
}

function atlasStoreChartResult(c, days, result) {
  if (!result || result.blocked || !Array.isArray(result.series) || !result.series.length) return;
  const key = atlasChartKey(c, days);
  const savedAt = Date.now();
  const stored = { ...result, savedAt };
  state.chartCache[key] = { createdAt: savedAt, result: stored };
  const local = atlasReadLocalChartStore();
  local[key] = stored;
  const keys = Object.keys(local).sort((a, b) => Number(local[b]?.savedAt || 0) - Number(local[a]?.savedAt || 0));
  for (const staleKey of keys.slice(60)) delete local[staleKey];
  atlasWriteLocalChartStore(local);
}

function atlasGetStoredChartResult(c, days) {
  const key = atlasChartKey(c, days);
  const memory = state.chartCache[key]?.result;
  const candidates = [];
  if (memory) candidates.push(memory);
  const local = atlasReadLocalChartStore()[key];
  if (local) candidates.push({ ...local, sourceMode: local.sourceMode || "browser-cache", source: local.source || "Cache navigateur · série réelle CoinGecko" });
  for (const candidate of candidates) {
    const prices = atlasNormalizeChartPayload({ prices: candidate?.series });
    const integrity = atlasValidateChartSeries({ c, days, prices, sourceMode: "browser-cache" });
    if (!integrity.ok) continue;
    return { ...candidate, series: prices, blocked: false, integrity, periodDays: Number(days || 1), sourceMode: candidate.sourceMode || "browser-cache" };
  }
  return null;
}

function atlasChartResultFingerprint(result) {
  const metrics = result?.integrity?.metrics || {};
  return `${Number(metrics.lastTimestamp || 0)}:${Number(metrics.pointCount || result?.series?.length || 0)}:${String(result?.sourceMode || "")}`;
}

function atlasChartNeedsRefresh(result, days) {
  if (!result) return true;
  const rules = atlasChartRules(days);
  const savedAt = Number(result.savedAt || 0);
  if (savedAt && Date.now() - savedAt <= rules.refreshMs) return false;
  const freshness = result?.integrity?.metrics?.freshness;
  return !freshness || freshness.level !== "fresh";
}

function atlasChartAbortError() {
  try { return new DOMException("Requête annulée", "AbortError"); }
  catch { const error = new Error("Requête annulée"); error.name = "AbortError"; return error; }
}

async function atlasFetchJson(url, { signal = null, timeoutMs = ATLAS_CHART_DIRECT_TIMEOUT_MS } = {}) {
  if (signal?.aborted) throw atlasChartAbortError();
  const controller = new AbortController();
  let timedOut = false;
  const onAbort = () => controller.abort();
  signal?.addEventListener?.("abort", onAbort, { once: true });
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  try {
    const response = await fetch(url, { cache: "no-store", signal: controller.signal, headers: { accept: "application/json" } });
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return await response.json();
  } catch (error) {
    if (signal?.aborted) throw atlasChartAbortError();
    if (timedOut) {
      const timeoutError = new Error("délai réseau dépassé");
      timeoutError.name = "TimeoutError";
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener?.("abort", onAbort);
  }
}

async function fetchAtlasChartCache(c, days, options = {}) {
  const period = Number(days || 1);
  const candidates = [];
  const assetFile = atlasChartAssetCacheFile(c);
  if (assetFile) candidates.push({ url: `${ATLAS_CHART_ASSET_CACHE_BASE}/${assetFile}`, label: `assets/${assetFile}`, slice: true });
  const legacy = atlasChartLegacySlug(c, period);
  if (legacy) candidates.push({ url: `${ATLAS_CHART_CACHE_BASE}/${legacy}`, label: legacy, slice: false });
  const errors = [];

  for (const candidate of candidates) {
    try {
      const payload = await atlasFetchJson(`${candidate.url}?t=${Date.now()}`, { signal: options.signal, timeoutMs: 4500 });
      const full = atlasNormalizeChartPayload(payload);
      const prices = candidate.slice ? atlasSliceSeriesForPeriod(full, period) : full;
      const integrity = atlasValidateChartSeries({ c, days: period, prices, payload, sourceMode: "github-cache" });
      if (!integrity.ok) {
        errors.push(`${candidate.label} non utilisable · ${integrity.reason}`);
        continue;
      }
      const freshness = integrity.metrics.freshness;
      return {
        ok: true,
        result: {
          series: prices,
          source: `Cache GitHub CoinGecko EUR · ${candidate.label} · dernier point ${freshness.label}`,
          blocked: false,
          kind: "coingecko-cache",
          sourceMode: "github-cache",
          periodDays: period,
          pointCount: prices.length,
          generatedAt: payload.generated_at || null,
          cacheSlug: candidate.label,
          integrity
        }
      };
    } catch (error) {
      if (error?.name === "AbortError") throw error;
      errors.push(`${candidate.label} indisponible · ${String(error?.message || error || "erreur réseau")}`);
    }
  }
  return { ok: false, error: errors.join(" · ") || "cache GitHub non encore constitué pour cet actif" };
}

function atlasSparklineChartResult() { return null; }

function atlasAttachCurrentCoinGeckoPoint(c, result) { return result; }

async function fetchCoinGeckoChartDirect(c, days, options = {}) {
  const period = Number(days || 1);
  const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(c.id)}/market_chart?vs_currency=eur&days=${encodeURIComponent(period)}&precision=full`;
  const payload = await atlasFetchJson(url, { signal: options.signal, timeoutMs: ATLAS_CHART_DIRECT_TIMEOUT_MS });
  const prices = atlasNormalizeChartPayload(payload);
  const integrity = atlasValidateChartSeries({ c, days: period, prices, payload, sourceMode: "coingecko-direct" });
  if (!integrity.ok) throw new Error(`série CoinGecko refusée · ${integrity.reason}`);
  return {
    series: prices,
    source: "CoinGecko market_chart EUR · direct",
    blocked: false,
    kind: "coingecko-direct",
    sourceMode: "coingecko-direct",
    periodDays: period,
    pointCount: prices.length,
    generatedAt: new Date(integrity.metrics.lastTimestamp).toISOString(),
    integrity
  };
}

async function fetchChartSeries(c, days, options = {}) {
  if (!c?.id) return { series: [], blocked: true, reason: "actif absent" };
  const period = Number(days || 1);
  const stored = options.fallback || atlasGetStoredChartResult(c, period);
  const diagnostics = [];
  const settle = (kind, promise) => promise.then(value => ({ kind, ok: true, value }), error => ({ kind, ok: false, error }));
  const directTask = settle("direct", fetchCoinGeckoChartDirect(c, period, options));
  const cacheTask = settle("cache", fetchAtlasChartCache(c, period, options));

  const first = await Promise.race([directTask, cacheTask]);
  if (first.ok && first.kind === "direct") return first.value;
  if (first.ok && first.kind === "cache" && first.value?.ok && first.value.result) {
    const cached = first.value.result;
    const directLater = await Promise.race([
      directTask,
      new Promise(resolve => setTimeout(() => resolve({ kind: "direct", ok: false, pending: true }), 1200))
    ]);
    if (directLater.ok) return directLater.value;
    return { ...cached, refreshWarning: "Série GitHub réelle affichée immédiatement ; actualisation directe en arrière-plan.", backgroundDirect: directTask };
  }

  diagnostics.push(first.kind === "cache" ? first.value?.error || first.error : first.error);
  const second = first.kind === "direct" ? await cacheTask : await directTask;
  if (second.ok && second.kind === "direct") return second.value;
  if (second.ok && second.kind === "cache" && second.value?.ok && second.value.result) return second.value.result;
  diagnostics.push(second.kind === "cache" ? second.value?.error || second.error : second.error);

  if (stored) {
    return {
      ...stored,
      blocked: false,
      refreshWarning: "Actualisation temporairement indisponible. Dernière série réelle conservée.",
      technicalReason: diagnostics.filter(Boolean).map(value => String(value?.message || value)).join(" · ")
    };
  }
  return {
    series: [],
    blocked: true,
    reason: "Aucune série réelle disponible pour le moment.",
    technicalReason: diagnostics.filter(Boolean).map(value => String(value?.message || value)).join(" · ")
  };
}

function atlasChartLabelForTime(ts, days) {
  const d = new Date(Number(ts));
  if (Number(days || 1) === 1) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

function atlasChartLabelFull(ts) {
  return new Date(Number(ts)).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function atlasChartSeriesSummary(series) {
  const rows = Array.isArray(series)
    ? series.map(p => ({ t: Number(p[0]), price: Number(p[1]) })).filter(p => Number.isFinite(p.t) && Number.isFinite(p.price) && p.price > 0).sort((a, b) => a.t - b.t)
    : [];
  if (rows.length < 3) return "série insuffisante";
  const values = rows.map(r => r.price);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const first = values[0];
  const last = values[values.length - 1];
  const changePct = first ? ((last - first) / first) * 100 : 0;
  return `dernier ${safeMoney(last)} · variation ${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)} % · min ${safeMoney(min)} · max ${safeMoney(max)} · ${rows.length} points`;
}

function atlasDestroyRealChart() {
  if (state.chartEngineV2?.realChart) {
    try { state.chartEngineV2.realChart.destroy(); } catch {}
    state.chartEngineV2.realChart = null;
  }
}

function atlasSetChartShellState(canvas, mode, summary = "", freshness = "fresh") {
  const shell = canvas?.closest?.(".chart-shell");
  if (!shell) return;
  delete shell.dataset.realChart;
  delete shell.dataset.chartSummary;
  delete shell.dataset.chartFreshness;
  shell.dataset.chartState = mode || "blocked";
  if (mode === "valid") {
    shell.dataset.realChart = "coingecko";
    shell.dataset.chartFreshness = freshness || "fresh";
  }
  if (summary) shell.dataset.chartSummary = summary;
}

function atlasCanvasWrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !current) current = candidate;
    else {
      lines.push(current);
      current = word;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
}

function drawChartMessage(canvas, mode, title, detail, footer) {
  atlasDestroyRealChart();
  if (!canvas) return;
  atlasSetChartShellState(canvas, mode);
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(560, Math.floor(rect.width || canvas.clientWidth || 980));
  const height = Math.max(380, Math.floor(rect.height || canvas.clientHeight || 400));
  if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(3,10,20,.08)";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "rgba(255,240,200,0.94)";
  ctx.font = "900 18px system-ui, sans-serif";
  ctx.fillText(title, 54, 86);
  ctx.fillStyle = "rgba(205,220,240,0.84)";
  ctx.font = "700 12px system-ui, sans-serif";
  atlasCanvasWrapText(ctx, detail, 54, 118, Math.max(320, width - 150), 19, 3);
  ctx.fillStyle = "rgba(255,214,122,0.84)";
  ctx.font = "800 11px system-ui, sans-serif";
  atlasCanvasWrapText(ctx, footer, 54, height - 42, Math.max(320, width - 150), 17, 2);
}

function drawChartLoading(canvas, title = "Chargement du graphique réel…", detail = "Atlas cherche la dernière série disponible.") {
  drawChartMessage(canvas, "loading", title, detail, "La page reste active pendant la vérification.");
}

function drawChartBlocked(canvas) {
  drawChartMessage(
    canvas,
    "blocked",
    "Graphique temporairement indisponible",
    "Aucune série réelle n’est encore disponible pour cet actif et cette période.",
    "Réessayer plus tard. Les prix, la mémoire et la simulation restent actifs."
  );
}

function drawLineChart(canvas, series, label = "", result = {}, chartKey = "") {
  if (!canvas) return;
  const period = Number(result?.periodDays || state.chartPeriodDays || 1);
  const rows = Array.isArray(series)
    ? series.map(point => ({ t: Number(point[0]), price: Number(point[1]) })).filter(point => Number.isFinite(point.t) && Number.isFinite(point.price) && point.price > 0).sort((a, b) => a.t - b.t)
    : [];
  if (rows.length < atlasChartRules(period).minPoints) { drawChartBlocked(canvas); return; }
  const values = rows.map(row => row.price);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const first = values[0];
  const last = values[values.length - 1];
  const changePct = first ? ((last - first) / first) * 100 : 0;
  const yPad = Math.max((max - min) * 0.06, Math.abs(max) * 0.00035, Math.pow(10, -atlasPriceDigits(max)) * 4);
  const sourceMode = result?.sourceMode === "github-cache" ? "cache GitHub" : result?.sourceMode === "browser-cache" ? "cache navigateur" : "direct";
  const freshness = result?.integrity?.metrics?.freshness?.level || "fresh";
  const summary = `${label} · ${atlasFormatEUR(last)} · ${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)} % · min ${atlasFormatEUR(min)} · max ${atlasFormatEUR(max)} · ${rows.length} pts · CoinGecko EUR · ${sourceMode}`;
  atlasDestroyRealChart();
  atlasSetChartShellState(canvas, "valid", summary, freshness);
  state.chartEngineV2.lastRenderedKey = chartKey;
  state.chartEngineV2.lastFingerprint = atlasChartResultFingerprint(result);
  if (window.Chart) {
    const data = rows.map(row => ({ x: row.t, y: row.price }));
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.clientHeight || 400);
    gradient.addColorStop(0, "rgba(98,236,255,0.20)");
    gradient.addColorStop(0.55, "rgba(98,236,255,0.055)");
    gradient.addColorStop(1, "rgba(98,236,255,0.006)");
    state.chartEngineV2.realChart = new Chart(ctx, {
      type: "line",
      data: { datasets: [{ label: `${label} · CoinGecko EUR`, data, parsing: false, borderWidth: 2.1, pointRadius: 0, pointHoverRadius: 3, pointHitRadius: 14, tension: 0.08, fill: true, backgroundColor: gradient, borderColor: "rgba(112,244,255,0.96)", borderCapStyle: "round", borderJoinStyle: "round" }] },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false, normalized: true, parsing: false,
        interaction: { mode: "nearest", intersect: false, axis: "x" },
        layout: { padding: { top: 36, right: 18, bottom: 22, left: 10 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true, displayColors: false, backgroundColor: "rgba(3,10,20,0.90)", titleColor: "#fff0c8", bodyColor: "#e8f6ff", borderColor: "rgba(98,236,255,0.34)", borderWidth: 1, padding: 10,
            callbacks: {
              title(items) { return atlasChartLabelFull(items?.[0]?.parsed?.x || Date.now()); },
              label(item) { return `Prix EUR : ${atlasFormatEUR(item.parsed.y)}`; },
              afterBody() { return `Source verrouillée : CoinGecko market_chart EUR · ${sourceMode}`; }
            }
          }
        },
        scales: {
          x: {
            type: "linear", min: rows[0].t, max: rows[rows.length - 1].t,
            grid: { color: "rgba(176,236,255,0.075)", drawTicks: true },
            ticks: { color: "rgba(226,244,255,0.84)", maxTicksLimit: period === 1 ? 9 : 10, autoSkip: true, maxRotation: 0, font: { size: 11, weight: "700" }, callback(value) { return atlasChartLabelForTime(Number(value), period); } }
          },
          y: {
            position: "right", min: min - yPad, max: max + yPad,
            grid: { color: "rgba(176,236,255,0.105)" },
            ticks: { color: "rgba(226,244,255,0.86)", maxTicksLimit: 7, callback(value) { return atlasFormatEUR(Number(value)); }, font: { size: 11, weight: "700" }, padding: 8 }
          }
        }
      }
    });
    return;
  }
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(560, Math.floor(rect.width || canvas.clientWidth || 980));
  const height = Math.max(380, Math.floor(rect.height || canvas.clientHeight || 400));
  canvas.width = Math.floor(width * dpr); canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
  const left = 52, right = 100, top = 42, bottom = 42;
  const plotW = width - left - right, plotH = height - top - bottom;
  const lo = min - yPad, hi = max + yPad, startTime = rows[0].t, endTime = rows[rows.length - 1].t;
  const xFor = time => left + ((time - startTime) / (endTime - startTime || 1)) * plotW;
  const yFor = value => top + plotH - ((value - lo) / (hi - lo || 1)) * plotH;
  ctx.strokeStyle = "rgba(176,236,255,0.075)";
  for (let i = 0; i <= 5; i++) { const y = top + (plotH / 5) * i; ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(left + plotW, y); ctx.stroke(); }
  ctx.beginPath(); rows.forEach((row, index) => { const x = xFor(row.t), y = yFor(row.price); if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
  ctx.strokeStyle = "rgba(112,244,255,.96)"; ctx.lineWidth = 2.1; ctx.stroke();
}

function atlasNormalizeSparkline(values) {
  if (!Array.isArray(values)) return [];
  return values.map(Number).filter(value => Number.isFinite(value) && value > 0);
}

function sparkSvg(c) {
  const data = atlasNormalizeSparkline(c?.sparkline7d);
  if (data.length < 10) return '<span class="sparkline-empty" title="Sparkline réelle CoinGecko indisponible">—</span>';
  const min = Math.min(...data);
  const max = Math.max(...data);
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 112;
    const y = 26 - ((value - min) / (max - min || 1)) * 24;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const trendClass = data[data.length - 1] >= data[0] ? "spark-up" : "spark-down";
  return `<svg class="sparkline ${trendClass}" viewBox="0 0 112 28" role="img" aria-label="Sparkline réelle CoinGecko sur 7 jours"><polyline points="${points}" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" opacity=".95"/></svg>`;
}


function atlasSelectedSpotFor(coin) {
  const spot = state.dataBroker.spot;
  if (!coin || spot?.coinId !== coin.id || !["direct", "snapshot"].includes(spot?.status)) return null;
  return spot;
}

function atlasCurrentDetailChartResult() {
  const chart = state.dataBroker.chart;
  if (chart?.coinId !== state.selectedCoinId || chart?.period !== Number(state.chartPeriodDays || 1)) return null;
  return chart?.result || null;
}

function atlasRefreshSelectedDetailOnly() {
  const coin = getSelectedCoin();
  if (!coin) return;
  const chart = state.dataBroker.chart;
  const mode = chart?.coinId === coin.id && chart?.period === Number(state.chartPeriodDays || 1)
    ? chart.status === "ready" ? "valid" : chart.status === "blocked" ? "blocked" : "loading"
    : "loading";
  atlasRenderAssetDetail(coin, Number(state.chartPeriodDays || 1), atlasCurrentDetailChartResult(), mode);
}

function atlasRenderAssetDetail(c, period, result = null, mode = "loading") {
  const periodLabel = atlasChartPeriodLabel(period);
  const ratio = c?.volume24h && c?.marketCap ? `${((c.volume24h / c.marketCap) * 100).toFixed(2)} %` : "Donnée manquante";
  const integrity = result?.integrity;
  const metrics = integrity?.metrics || {};
  const freshness = metrics.freshness || {};
  const spot = atlasSelectedSpotFor(c);
  const spotEur = Number.isFinite(Number(spot?.eur)) ? Number(spot.eur) : Number(c?.priceEur ?? c?.price);
  const spotUsd = Number.isFinite(Number(spot?.usd)) ? Number(spot.usd) : null;
  const spotMode = spot?.status === "direct" ? "CoinGecko simple_price direct" : `Snapshot marché · ${atlasBrokerModeLabel(spot?.mode || state.dataBroker.market?.mode)}`;
  const spotTime = spot?.timestamp || c?.lastUpdated || c?.timestamp || state.timestamp || null;
  const chartSourceMode = result?.sourceMode === "github-cache" ? "Cache GitHub CoinGecko" : result?.sourceMode === "browser-cache" ? "Cache navigateur CoinGecko" : result?.sourceMode === "coingecko-direct" ? "CoinGecko direct" : "En attente";
  const lastPoint = Number.isFinite(metrics.lastPrice) ? atlasFormatEUR(metrics.lastPrice) : "—";
  const lastTime = Number.isFinite(metrics.lastTimestamp) ? atlasChartLabelFull(metrics.lastTimestamp) : "—";
  const coverage = Number.isFinite(metrics.coverageHours) ? (metrics.coverageHours < 48 ? `${metrics.coverageHours.toFixed(1)} h` : `${(metrics.coverageHours / 24).toFixed(1)} j`) : "—";
  const spotGapPct = Number.isFinite(spotEur) && spotEur > 0 && Number.isFinite(metrics.lastPrice) ? Math.abs(Number(metrics.lastPrice) - spotEur) / spotEur * 100 : null;
  const gap = Number.isFinite(spotGapPct) ? `${spotGapPct.toFixed(2)} %` : Number.isFinite(metrics.priceGapPct) ? `${metrics.priceGapPct.toFixed(2)} %` : "non calculé";
  const integrityLabel = mode === "valid" ? (freshness.level === "archive" ? "Validée · archive datée" : freshness.level === "delayed" ? "Validée · mise à jour retardée" : "Validée") : mode === "blocked" ? "Indisponible" : "Vérification en cours";
  if (els.assetDetailGrid) {
    els.assetDetailGrid.innerHTML = `
      <div><b>Actif</b><span>${escapeHtml(c.name)} (${escapeHtml(c.symbol)})</span></div>
      <div><b>Type</b><span>${escapeHtml(classifyAsset(c))}</span></div>
      <div><b>Décision</b><span>${escapeHtml(beginnerDecision(c))}</span></div>
      <div><b>Ratio vol/cap</b><span>${ratio}</span></div>
      <div><b>Prix spot EUR</b><span>${atlasFormatEUR(spotEur)}</span></div>
      <div><b>Prix spot USD</b><span>${spotUsd ? atlasFormatUSD(spotUsd) : "Non fourni · aucune estimation"}</span></div>
      <div><b>Source prix spot</b><span>${escapeHtml(spotMode)}</span></div>
      <div><b>Heure prix spot</b><span>${spotTime ? new Date(spotTime).toLocaleString("fr-FR") : "—"}</span></div>
      <div><b>Snapshot marché</b><span>${escapeHtml(atlasBrokerModeLabel(state.dataBroker.market?.mode))}</span></div>
      <div><b>Heure marché</b><span>${state.dataBroker.market?.timestamp ? new Date(state.dataBroker.market.timestamp).toLocaleString("fr-FR") : "—"}</span></div>
      <div><b>Période graphique</b><span>${periodLabel}</span></div>
      <div><b>Source graphique</b><span>${escapeHtml(chartSourceMode)}</span></div>
      <div><b>Points / couverture</b><span>${Number.isFinite(metrics.pointCount) ? metrics.pointCount : "—"} · ${coverage}</span></div>
      <div><b>Dernier point</b><span>${lastPoint} · ${lastTime}</span></div>
      <div><b>Actualisation graphique</b><span>${freshness.label || "—"}</span></div>
      <div><b>Écart spot/courbe</b><span>${gap}</span></div>
      <div><b>Intégrité graphique</b><span>${integrityLabel}</span></div>`;
  }
  if (els.assetDetailWhy) {
    let chartReason = "Atlas cherche uniquement une série CoinGecko réelle.";
    if (mode === "valid") chartReason = result?.refreshWarning ? "La dernière série CoinGecko reste affichée pendant l’actualisation." : "La série CoinGecko a passé les contrôles actif, devise, période et couverture.";
    else if (mode === "blocked") chartReason = "Aucune série CoinGecko n’est disponible pour cette sélection. Le prix spot et le snapshot marché restent indépendants.";
    els.assetDetailWhy.textContent = `${whyDecision(c)} ${chartReason}`;
  }
  atlasRenderBrokerStrip();
}

function atlasRenderChartResult(c, period, result, chartKey, forceRedraw = false) {
  atlasBrokerCommitChart(c, period, result, "ready");
  const periodLabel = atlasChartPeriodLabel(period);
  const fingerprint = atlasChartResultFingerprint(result);
  const alreadyRendered = state.chartEngineV2.lastRenderedKey === chartKey && state.chartEngineV2.lastFingerprint === fingerprint && state.chartEngineV2.realChart;
  if (forceRedraw || !alreadyRendered) drawLineChart(els.mainChart, result.series, `${c.symbol} ${periodLabel}`, result, chartKey);
  atlasRenderAssetDetail(c, period, result, "valid");
  if (els.chartCaption) {
    const freshness = result?.integrity?.metrics?.freshness;
    const warning = result?.refreshWarning ? ` · ${result.refreshWarning}` : freshness?.level === "delayed" ? ` · mise à jour retardée (${freshness.label})` : freshness?.level === "archive" ? ` · archive réelle datée (${freshness.label})` : "";
    const axisNote = "";
    els.chartCaption.textContent = `Graphique ${c.symbol} · période ${periodLabel} · ${atlasChartSeriesSummary(result.series)} · source : ${result.source}${axisNote}${warning}.`;
  }
}

async function renderAnalystPanel() {
  const c = getSelectedCoin();
  const renderToken = ++state.chartRenderToken;
  if (state.chartEngineV2?.controller) {
    try { state.chartEngineV2.controller.abort(); } catch {}
  }
  if (!c) {
    atlasChartSetPeriodButtons(Number(state.chartPeriodDays || 1), false);
    setText(els.selectedAssetTitle, "Aucun actif sélectionné");
    state.dataBroker.chart = { ...state.dataBroker.chart, status: "blocked", coinId: null, result: null };
    drawChartBlocked(els.mainChart);
    if (els.chartCaption) els.chartCaption.textContent = "Graphique indisponible · Livecheck requis.";
    atlasRenderBrokerStrip();
    return;
  }

  state.selectedCoinId = c.id;
  atlasBrokerSeedSpot(c);
  atlasRenderBrokerStrip();
  void atlasRefreshSelectedSpot(c);

  const coinId = c.id;
  const period = Number(state.chartPeriodDays || 1);
  const periodLabel = atlasChartPeriodLabel(period);
  const chartKey = atlasChartKey(c, period);
  const controller = new AbortController();
  state.chartEngineV2.token = renderToken;
  state.chartEngineV2.controller = controller;
  state.chartEngineV2.lastKey = chartKey;
  setText(els.selectedAssetTitle, `${c.name} — ${c.symbol}`);

  const stored = atlasGetStoredChartResult(c, period);
  if (stored) {
    atlasRenderChartResult(c, period, stored, chartKey);
    if (!atlasChartNeedsRefresh(stored, period)) {
      atlasChartSetPeriodButtons(period, false);
      return;
    }
    atlasChartSetPeriodButtons(period, true);
    if (els.chartCaption) els.chartCaption.textContent += " · Actualisation discrète en cours.";
  } else {
    state.dataBroker.chart = { status: "loading", coinId, period, source: ATLAS_CANONICAL_MARKET_SOURCE, mode: "none", timestamp: null, pointCount: 0, result: null, error: null };
    atlasRenderAssetDetail(c, period, null, "loading");
    atlasChartSetPeriodButtons(period, true);
    drawChartLoading(els.mainChart, `${c.symbol} ${periodLabel} · chargement`, "Atlas interroge en parallèle CoinGecko direct et le cache GitHub réel.");
    if (els.chartCaption) els.chartCaption.textContent = `Graphique ${c.symbol} · période ${periodLabel} · première série réelle en cours.`;
  }

  try {
    const result = await fetchChartSeries(c, period, { signal: controller.signal, fallback: stored });
    if (renderToken !== state.chartRenderToken || state.selectedCoinId !== coinId || Number(state.chartPeriodDays || 1) !== period) return;
    if (result.blocked || !Array.isArray(result.series) || !result.series.length) {
      if (stored) atlasRenderChartResult(c, period, { ...stored, refreshWarning: "Actualisation indisponible. Dernière série réelle conservée." }, chartKey);
      else {
        state.dataBroker.chart = { status: "blocked", coinId, period, source: ATLAS_CANONICAL_MARKET_SOURCE, mode: "none", timestamp: null, pointCount: 0, result, error: result.technicalReason || result.reason || null };
        drawChartBlocked(els.mainChart);
        atlasRenderAssetDetail(c, period, result, "blocked");
        if (els.chartCaption) els.chartCaption.textContent = `Graphique ${c.symbol} · période ${periodLabel} · temporairement indisponible.`;
      }
      return;
    }

    const backgroundDirect = result.backgroundDirect;
    const cleanResult = { ...result };
    delete cleanResult.backgroundDirect;
    atlasStoreChartResult(c, period, cleanResult);
    atlasRenderChartResult(c, period, cleanResult, chartKey);

    if (backgroundDirect) {
      const upgraded = await backgroundDirect;
      if (upgraded?.ok && upgraded.value && renderToken === state.chartRenderToken && state.selectedCoinId === coinId && Number(state.chartPeriodDays || 1) === period) {
        atlasStoreChartResult(c, period, upgraded.value);
        atlasRenderChartResult(c, period, upgraded.value, chartKey, true);
      }
    }
  } catch (error) {
    if (error?.name === "AbortError") return;
    if (renderToken !== state.chartRenderToken || state.selectedCoinId !== coinId || Number(state.chartPeriodDays || 1) !== period) return;
    if (stored) atlasRenderChartResult(c, period, { ...stored, refreshWarning: "Actualisation indisponible. Dernière série réelle conservée." }, chartKey);
    else {
      state.dataBroker.chart = { status: "blocked", coinId, period, source: ATLAS_CANONICAL_MARKET_SOURCE, mode: "none", timestamp: null, pointCount: 0, result: null, error: String(error?.message || error) };
      drawChartBlocked(els.mainChart);
      atlasRenderAssetDetail(c, period, { reason: "indisponibilité réseau" }, "blocked");
    }
  } finally {
    if (renderToken === state.chartRenderToken && Number(state.chartPeriodDays || 1) === period) atlasChartSetPeriodButtons(period, false);
    atlasRenderBrokerStrip();
  }
}

function getSourceRecord(key) { return state.sourceStatus.find(s => s.key === key) || null;
} function renderSourceDiagnostic() { return;
} function matchAssetFilter(c) { const type = classifyAsset(c); if (state.assetFilter === "pillar") return type === "Pilier marché"; if (state.assetFilter === "stablecoin") return type === "Stablecoin"; if (state.assetFilter === "major") return type === "Altcoin majeur"; if (state.assetFilter === "speculative") return type === "Token spéculatif" || type === "Altcoin"; return true;
} function volCapRatio(c) { return c?.volume24h && c?.marketCap ? c.volume24h / c.marketCap : 0;
} function sortAssets(rows) { const list = [...rows]; const key = state.sortKey || "rank-asc"; const byNumber = (getter, dir = "desc") => list.sort((a, b) => { const av = Number(getter(a)); const bv = Number(getter(b)); const aa = Number.isFinite(av) ? av : -Infinity; const bb = Number.isFinite(bv) ? bv : -Infinity; return dir === "asc" ? aa - bb : bb - aa; }); if (key === "score-desc") return byNumber(c => scoreCoin(c).score ?? -1, "desc"); if (key === "volume-desc") return byNumber(c => c.volume24h ?? -1, "desc"); if (key === "change24-desc") return byNumber(c => c.change24h ?? -Infinity, "desc"); if (key === "change24-asc") return byNumber(c => c.change24h ?? Infinity, "asc"); if (key === "ratio-desc") return byNumber(c => volCapRatio(c), "desc"); return byNumber(c => c.rank ?? 999999, "asc");
} function commandError(message, details = {}) { return { ok: false, error: message, ...details };
} function commandOk(command, payload) { return { ok: true, command, mode: "observation_only", trading: "blocked", timestamp: new Date().toISOString(), payload };
} function normalizeSymbol(value) { return String(value || "").trim().replace(/[^a-zA-Z0-9_-]/g, "").toUpperCase();
} function findCoinByQuery(query) { const q = normalizeSymbol(query); if (!q) return null; return state.coins.find(c => String(c.symbol || "").toUpperCase() === q || String(c.id || "").toUpperCase() === q || String(c.name || "").toUpperCase() === q ) || null;
} function coinPayload(c) { if (!c) return null; const s = scoreCoin(c); const ratio = c.volume24h && c.marketCap ? c.volume24h / c.marketCap : null; return { id: c.id, rank: c.rank ?? null, name: c.name, symbol: c.symbol, type: classifyAsset(c), price_eur: c.price ?? null, change_24h_pct: c.change24h ?? null, change_7d_pct: c.change7d ?? null, market_cap_eur: c.marketCap ?? null, volume_24h_eur: c.volume24h ?? null, volume_marketcap_ratio: ratio, score: s.score, score_label: s.label, decision: beginnerDecision(c), limits: ["no_contract_security", "no_social_validation", "no_onchain_validation", "not_financial_advice"] };
} function sourceHealthPayload() { const total = liveSources.length; const status = liveSources.map(src => { const rec = state.sourceStatus.find(s => s.key === src.key); return { key: src.key, name: src.name, role: src.key === "coingecko" ? "canonical_market_source" : src.key === "coinlore" ? "diagnostic_only" : "secondary_source", kind: src.kind, status: rec ? rec.status : "WAIT", ms: rec?.ms ?? null, detail: rec?.detail ?? "not_tested" }; }); const ok = status.filter(s => s.status === "OK").length; const fail = status.filter(s => s.status === "ÉCHEC").length; return { live_ok: state.liveOk, main_source: state.mainSource, total_sources: total, successful_sources: ok, failed_sources: fail, tested_sources: state.sourceStatus.length, critical_rule: "CoinGecko is the only canonical market source. GitHub/local CoinGecko snapshots are allowed fallbacks. CoinLore is diagnostic only.", sources: status };
} const SIM_PROFILE = { key: "solo_beginner_100_v1_1_alpha_13", label: "Solo Débutant 100 €", startCash: 100, allowedSymbols: ["BTC", "ETH", "SOL"], defaultAmount: 5, maxPerOperation: 10, maxExposure: 30, minReserve: 70
};
const SIM_STORAGE_KEY = "agent_crypto_erith_ia_sim_v1_1_alpha_13";
const SIM_START_CASH = SIM_PROFILE.startCash; function loadSimulation() { try { const raw = localStorage.getItem(SIM_STORAGE_KEY); if (raw) { const parsed = JSON.parse(raw); if (parsed && typeof parsed.cash === "number" && parsed.positions && parsed.profileKey === SIM_PROFILE.key) { state.sim = parsed; return; } } } catch {} state.sim = { cash: SIM_START_CASH, initialCash: SIM_START_CASH, profileKey: SIM_PROFILE.key, positions: {}, logs: [{ time: new Date().toISOString(), type: "PROFILE", message: "Profil Solo Débutant 100 € chargé." }] };
} function saveSimulation() { try { localStorage.setItem(SIM_STORAGE_KEY, JSON.stringify(state.sim)); } catch {}
} function resetSimulation() { state.sim = { cash: SIM_START_CASH, initialCash: SIM_START_CASH, profileKey: SIM_PROFILE.key, positions: {}, logs: [{ time: new Date().toISOString(), type: "RESET", message: "Simulation réinitialisée sur profil Solo Débutant 100 €." }] }; saveSimulation(); renderSimulation();
} function simLog(entry) { if (!state.sim) loadSimulation(); state.sim.logs.unshift({ time: new Date().toISOString(), ...entry }); state.sim.logs = state.sim.logs.slice(0, 50);
} function getPositionValue(symbol) { if (!state.sim) loadSimulation(); const pos = state.sim.positions[symbol]; if (!pos) return 0; const coin = findCoinByQuery(symbol); const price = coin?.price ?? pos.lastPrice ?? pos.avgPrice ?? 0; return pos.qty * price;
} function getSimulationTotals() { if (!state.sim) loadSimulation(); const positionsValue = Object.keys(state.sim.positions).reduce((sum, sym) => sum + getPositionValue(sym), 0); const total = state.sim.cash + positionsValue; return { positionsValue, total, pnl: total - state.sim.initialCash };
} function getSimulationProfileStatus() { if (!state.sim) loadSimulation(); const totals = getSimulationTotals(); const remainingExposure = Math.max(0, SIM_PROFILE.maxExposure - totals.positionsValue); return { profile: SIM_PROFILE.label, start_cash_eur: SIM_PROFILE.startCash, allowed_symbols: SIM_PROFILE.allowedSymbols, default_amount_eur: SIM_PROFILE.defaultAmount, max_per_operation_eur: SIM_PROFILE.maxPerOperation, max_exposure_eur: SIM_PROFILE.maxExposure, current_exposure_eur: totals.positionsValue, remaining_exposure_eur: remainingExposure, min_reserve_eur: SIM_PROFILE.minReserve, cash_eur: state.sim.cash };
} function profileRefusal(message, extra = {}) { return commandError(message, { profile: getSimulationProfileStatus(), ...extra });
} function simulationRefusal(message, extra = {}) { if (!state.sim) loadSimulation(); simLog({ type: "REFUS", message }); saveSimulation(); renderSimulation(); return profileRefusal(message, extra);
} function simulationPayload() { if (!state.sim) loadSimulation(); const totals = getSimulationTotals(); const positions = Object.keys(state.sim.positions).map(sym => { const pos = state.sim.positions[sym]; const coin = findCoinByQuery(sym); const price = coin?.price ?? pos.lastPrice ?? pos.avgPrice; const value = pos.qty * price; return { symbol: sym, name: pos.name, qty: pos.qty, avg_price_eur: pos.avgPrice, current_price_eur: price, invested_eur: pos.invested, value_eur: value, pnl_eur: value - pos.invested }; }); return { mode: "paper_trading_only", profile: getSimulationProfileStatus(), cash_eur: state.sim.cash, initial_cash_eur: state.sim.initialCash, positions_value_eur: totals.positionsValue, total_value_eur: totals.total, pnl_eur: totals.pnl, positions, logs: state.sim.logs.slice(0, 10) };
} function simulateOrder(side, symbolInput = null, amountInput = null) { if (!state.liveOk || !state.coins.length || !state.sourceLock?.valid) return simulationRefusal("Source Lock CoinGecko requis avant simulation.", sourceHealthPayload()); const symbol = normalizeSymbol(symbolInput || els.simSymbol?.value || ""); const amount = Number(amountInput ?? els.simAmount?.value ?? 0); if (!symbol) return simulationRefusal("Actif manquant."); if (!Number.isFinite(amount) || amount <= 0) return simulationRefusal("Montant invalide."); if (!SIM_PROFILE.allowedSymbols.includes(symbol)) { return simulationRefusal(`Profil débutant : ${symbol} refusé. Autorisés : ${SIM_PROFILE.allowedSymbols.join(" / ")}.`, { requested_symbol: symbol }); } const coin = findCoinByQuery(symbol); if (!coin) return simulationRefusal(`Actif autorisé mais non chargé par le Livecheck : ${symbol}. Relance Livecheck.`, { requested_symbol: symbol }); if (!state.sim) loadSimulation(); const price = coin.price; if (!Number.isFinite(price) || price <= 0) return simulationRefusal("Prix indisponible pour simulation."); const sym = coin.symbol.toUpperCase(); if (amount > SIM_PROFILE.maxPerOperation) { return simulationRefusal(`Profil débutant : maximum par opération = ${fmtEUR.format(SIM_PROFILE.maxPerOperation)}.`, { requested_amount_eur: amount }); } const pos = state.sim.positions[sym] || { symbol: sym, name: coin.name, qty: 0, avgPrice: 0, invested: 0, lastPrice: price }; if (side === "buy") { const totals = getSimulationTotals(); if (amount > state.sim.cash) return simulationRefusal("Capital virtuel insuffisant.", { cash: state.sim.cash, requested: amount }); if (state.sim.cash - amount < SIM_PROFILE.minReserve) { return simulationRefusal(`Profil débutant : réserve minimale obligatoire = ${fmtEUR.format(SIM_PROFILE.minReserve)}.`, { cash_after_order_eur: state.sim.cash - amount }); } if (totals.positionsValue + amount > SIM_PROFILE.maxExposure) { return simulationRefusal(`Profil débutant : exposition maximale = ${fmtEUR.format(SIM_PROFILE.maxExposure)}.`, { exposure_after_order_eur: totals.positionsValue + amount }); } const qty = amount / price; const newQty = pos.qty + qty; const newInvested = pos.invested + amount; pos.qty = newQty; pos.invested = newInvested; pos.avgPrice = newInvested / newQty; pos.lastPrice = price; state.sim.positions[sym] = pos; state.sim.cash -= amount; simLog({ type: "SIM_BUY", symbol: sym, amount_eur: amount, price_eur: price, qty, message: `Achat simulé ${sym} pour ${fmtEUR.format(amount)} · profil 100 €.` }); } else if (side === "sell") { if (!pos.qty || pos.qty <= 0) return simulationRefusal(`Aucune position virtuelle à vendre pour ${sym}.`); const maxValue = pos.qty * price; const sellValue = Math.min(amount, maxValue); const qty = sellValue / price; const soldRatio = qty / pos.qty; pos.qty -= qty; pos.invested = Math.max(0, pos.invested * (1 - soldRatio)); pos.lastPrice = price; state.sim.cash += sellValue; if (pos.qty <= 0.00000001) delete state.sim.positions[sym]; else state.sim.positions[sym] = pos; simLog({ type: "SIM_SELL", symbol: sym, amount_eur: sellValue, price_eur: price, qty, message: `Vente simulée ${sym} pour ${fmtEUR.format(sellValue)} · profil 100 €.` }); } saveSimulation(); renderSimulation(); return commandOk(`sim_${side} ${sym} ${amount}`, { side, symbol: sym, amount_eur: amount, price_eur: price, portfolio: simulationPayload() });
} function simLogTypeLabel(type) { if (type === "SIM_BUY") return "ACHAT SIMULÉ"; if (type === "SIM_SELL") return "VENTE SIMULÉE"; if (type === "REFUS") return "REFUS"; if (type === "RESET") return "RESET"; return String(type || "INFO");
} function simLogLine(entry) { const time = entry?.time ? new Date(entry.time).toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit", second:"2-digit" }) : ""; const label = simLogTypeLabel(entry?.type); const msg = entry?.message || ""; return time ? `${label} · ${msg} · ${time}` : `${label} · ${msg}`;
} function renderSimulation() { if (!state.sim) loadSimulation(); const totals = getSimulationTotals(); if (els.simProfileStatus) { const profile = getSimulationProfileStatus(); els.simProfileStatus.textContent = `${profile.allowed_symbols.join(" / ")} · ticket ${fmtEUR.format(profile.default_amount_eur)} · max ${fmtEUR.format(profile.max_per_operation_eur)} · exposé ${fmtEUR.format(profile.current_exposure_eur)} / ${fmtEUR.format(profile.max_exposure_eur)} · réserve min ${fmtEUR.format(profile.min_reserve_eur)}`; } setText(els.simCash, fmtEUR.format(state.sim.cash)); setText(els.simPositionsValue, fmtEUR.format(totals.positionsValue)); setText(els.simTotalValue, fmtEUR.format(totals.total)); if (els.simPnL) { els.simPnL.textContent = `${totals.pnl >= 0 ? "+" : ""}${fmtEUR.format(totals.pnl)}`; els.simPnL.classList.toggle("pnl-pos", totals.pnl >= 0); els.simPnL.classList.toggle("pnl-neg", totals.pnl < 0); } const positions = Object.keys(state.sim.positions); if (els.simPositions) { els.simPositions.innerHTML = positions.length ? positions.map(sym => { const pos = state.sim.positions[sym]; const coin = findCoinByQuery(sym); const price = coin?.price ?? pos.lastPrice ?? pos.avgPrice; const value = pos.qty * price; const pnl = value - pos.invested; return `<div class="sim-position-row"><b>${escapeHtml(sym)}</b><span>${pos.qty.toFixed(8)}</span><span>${fmtEUR.format(value)}</span><span class="${pnl >= 0 ? "pnl-pos" : "pnl-neg"}">${pnl >= 0 ? "+" : ""}${fmtEUR.format(pnl)}</span></div>`; }).join("") : "Aucune position simulée."; } if (els.simLog) { els.simLog.textContent = state.sim.logs.length ? state.sim.logs.map(simLogLine).join("\n") : "Aucune simulation lancée."; }
} function situationPayload() { return { version: "V1.1-alpha.26.35", active_now: [ "public_market_observation", "charts", "source_diagnostic", "human_readable_tests", "local_paper_trading", "solo_beginner_profile_100_eur", "briefing_questions" ], prepared_only: [ "private_backend", "remote_access", "kraken_read_only", "physical_security_layer" ], locked: [ "real_wallet_connection", "private_key", "withdraw_key", "real_order", "automatic_trading" ], current_step: "collect_information_before_private_backend" };
} function nextStepsPayload() { return { next_steps: [ "confirm_priority_assets", "define_virtual_simulation_amount", "define_forbidden_risks", "select_news_sources", "describe_private_machine", "choose_access_security_model" ], next_version_candidate: "V1.1-beta_local_private_preparation" };
} function boundariesPayload() { return { hard_boundaries: [ "no_real_exchange_key_now", "no_real_wallet_connection", "no_seed_phrase_in_ui_or_files", "no_withdraw_permission", "no_real_order_from_public_frontend", "no_public_remote_access", "no_nominative_labels_in_public_interface" ] };
} function briefingPayload() { return { mode: "preparation_session", purpose: "collect_information_before_private_backend", collect: [ "target_mode_observation_simulation_or_future_semi_auto", "priority_assets", "risk_limits", "news_sources", "private_machine_context", "remote_access_preference", "physical_security_preference" ], forbidden_during_session: [ "create_real_exchange_key", "connect_real_wallet", "enter_seed_phrase", "enable_withdraw_permission", "start_real_trading", "open_public_remote_access" ] };
} function questionsPayload() { return { questions: [ "Quel montant virtuel utiliser pour la simulation ?", "Quelles cryptos suivre en priorité ?", "Quels risques sont interdits ?", "Quelles sources d'information surveiller ?", "Quelle machine privée est envisagée ?", "Quel accès renforcé est préféré ?", "Quelle validation humaine est obligatoire ?" ] };
} function doNotDoPayload() { return { do_not_do: [ "Pas de clé Kraken réelle maintenant.", "Pas de wallet réel connecté maintenant.", "Pas de seed phrase dans l'interface.", "Pas de trading automatique.", "Pas d'accès distant public.", "Pas d'argent réel avant dry-run long." ] };
} function backendBlueprintPayload() { return { version: "V1.1-alpha.26.35", principle: "separate_public_frontend_from_private_backend", public_layer: { host: "GitHub Pages", allowed: [ "market_observation", "charts", "watchlist", "command_layer_observation", "local_paper_trading" ], forbidden: [ "private_api_keys", "withdraw_keys", "real_orders", "admin_remote_access", "wallet_connection" ] }, private_layer_future: { host: "private_machine_or_secure_local_server", allowed: [ "encrypted_api_secrets", "Kraken_read_only_client", "server_side_paper_trading", "logs", "kill_switch", "restricted_remote_access" ], access: ["authorized_operator_1", "authorized_operator_2"] }, exchange_layer_future: { primary: "Kraken", first_mode: "read_only", later_modes_locked: [ "paper_trading_server", "human_validated_order", "real_micro_transaction" ], never_allowed_initially: [ "withdraw_permission", "fully_autonomous_trading" ] } };
} function krakenReadonlyPlanPayload() { return { exchange: "Kraken", target_stage: "read_only_only", allowed_first: [ "account_balance_read", "ticker_read", "trade_history_read_if_needed", "open_positions_read_if_applicable" ], forbidden_first: [ "create_order", "cancel_order", "withdraw", "transfer", "margin", "leverage" ], required_before_connection: [ "backend_not_github_pages", "encrypted_secret_storage", "separate_user_accounts", "logs", "manual_disable", "test_key_permissions", "no_withdraw_permission" ] };
} function remoteBlueprintPayload() { return { scope: "future_private_machine_only", authorized_people: ["authorized_operator_1", "authorized_operator_2"], rules: [ "no_public_admin_panel", "no_shared_cleartext_password", "unique_accounts", "strong_authentication", "admin_actions_logged", "emergency_disable_path", "regular_security_review" ], current_public_frontend: "no_remote_access_capability" };
} function securityReviewPayload() { return { review_type: "pre_backend_security_checklist", checklist: [ { item: "GitHub Pages contains no secrets", status: "required" }, { item: "Kraken key read-only", status: "future_required" }, { item: "Withdraw permission disabled", status: "mandatory" }, { item: "Backend logs every command", status: "future_required" }, { item: "Kill switch tested", status: "future_required" }, { item: "Paper trading runs before real money", status: "mandatory" }, { item: "Human validation before any real order", status: "mandatory" }, { item: "Remote access reviewed regularly", status: "future_required" } ], conclusion: "No real-money phase without passing all mandatory items." };
} function safetyPlanPayload() { return { mode: "safety_first", confirmed_context: { yohan_requires_sandbox: true, remote_access_for_christophe_and_yohan_only: true, human_validation_required: true, simulation_before_real_money: true, modification_possible_if_failure: true }, sandbox_boundaries: [ "public_frontend_observation_only", "paper_trading_local_only", "no_real_exchange_order", "no_wallet_connection", "no_private_api_key_in_github_pages", "no_withdraw_permission" ], required_before_real_backend: [ "separate_machine_or_backend", "restricted_remote_access", "encrypted_secret_storage", "read_only_kraken_key_first", "paper_trading_logs", "kill_switch", "human_confirmation_flow", "regular_security_review" ] };
} function killSwitchPayload() { return { status: "planned_not_active_in_github_pages", purpose: "Stop the future backend/agent if abnormal behavior appears.", manual_steps_future: [ "disable_backend_service", "revoke_exchange_api_keys", "disable_remote_access_temporarily", "freeze_paper_trading_state", "export_logs", "review_last_commands", "human_restart_only" ], current_public_app_limits: [ "no_real_orders_possible", "no_api_keys_present", "simulation_only" ] };
} function accessPlanPayload() { return { access_model: "two_people_only", authorized_people: ["authorized_operator_1", "authorized_operator_2"], public_app: "no_remote_admin_capability", future_backend_requirements: [ "strong_authentication", "unique_accounts", "no_shared_cleartext_password", "logs_for_admin_actions", "regular_access_review", "no_public_open_admin_panel", "emergency_disable_path" ], warning: "Remote access must be configured outside GitHub Pages." };
} function gatesPayload() { return { current_gate: "G3_paper_trading", gates: [ { id: "G1", name: "observatory_public", status: "done" }, { id: "G2", name: "crypto_command_layer", status: "done" }, { id: "G3", name: "paper_trading_sandbox", status: "active" }, { id: "G4", name: "kraken_read_only_connection", status: "locked" }, { id: "G5", name: "semi_auto_human_validation", status: "locked" }, { id: "G6", name: "real_micro_transactions", status: "locked" } ], unlock_rule: "No gate opens without logs, tests, explicit human validation, and security review." };
} function planningPayload() { return { project_stage: "public_observatory_to_controlled_agent", confirmed_project_context: { micro_transactions: true, main_wallet_reference: "Kraken", mode: "semi_automatic_human_validation", remote_access: "two_people_only", simulation_before_real_money: true, news_references_required: true }, phases: [ "observation_dashboard", "crypto_command_layer", "paper_trading_simulation", "read_only_exchange_connection", "human_validated_orders", "real_micro_transactions_locked" ], hard_rules: [ "no_private_api_key_in_github_pages", "no_withdraw_key", "no_real_order_from_public_frontend", "dry_run_before_real_money", "logs_required", "emergency_stop_required" ] };
} function exchangePlanPayload() { return { primary_reference: { exchange: "Kraken", role: "wallet_account_security_reference", first_connection: "read_only_then_simulation" }, secondary_reference: { exchange: "Bybit", role: "api_trading_reference_to_compare", first_connection: "research_only" }, inspiration: { exchange: "Binance", role: "command_layer_market_data_inspiration" }, next_backend_need: [ "secure_local_or_server_backend", "encrypted_api_keys", "access_control_for_authorized_operators", "paper_trading_engine", "logs_and_kill_switch" ] };
} function newsPlanPayload() { return { rule: "News never triggers buy/sell automatically.", global_press: ["Reuters", "AP", "AFP", "BBC", "Le Monde", "Financial Times"], crypto_press: ["CoinDesk", "The Block", "Decrypt", "Cointelegraph"], institutions: ["AMF", "ESMA", "BCE", "SEC", "CFTC", "central banks"], exchanges: ["Kraken announcements", "Bybit announcements", "Binance announcements", "exchange status pages"], classification: [ "source_identified", "reliability_estimated", "possible_market_impact", "missing_verifications", "action: ignore | monitor | verify | wait" ] };
} const CryptoCommands = { help() { return commandOk("help", { available_commands: [ "market_snapshot", "asset BTC", "chart ETH 7d", "compare BTC ETH", "sources", "category USDT", "risk SOL", "planning", "exchange_plan", "news_sources", "sim_buy BTC 5", "sim_sell BTC 5", "portfolio", "reset_sim", "safety_plan", "kill_switch", "access_plan", "gates", "Plan architecture", "Plan Kraken lecture seule", "Plan accès distant", "Contrôle sécurité" ], blocked_commands: ["buy", "sell", "order", "trade", "withdraw", "transfer"], rule: "Observation only. No real trading from GitHub Pages." }); }, market_snapshot() { if (!state.liveOk || !state.coins.length) { return commandError("Livecheck requis : aucune donnée marché fiable chargée.", sourceHealthPayload()); } const btc = findCoinByQuery("BTC"); const eth = findCoinByQuery("ETH"); return commandOk("market_snapshot", { source: state.mainSource, timestamp: state.timestamp, global: { market_cap_eur: state.global?.total_market_cap?.eur ?? null, volume_24h_eur: state.global?.total_volume?.eur ?? null, btc_dominance_pct: state.global?.market_cap_percentage?.btc ?? null }, loaded_assets: state.coins.length, btc: coinPayload(btc), eth: coinPayload(eth), source_health: sourceHealthPayload() }); }, asset(symbol) { if (!state.liveOk || !state.coins.length) return commandError("Livecheck requis avant lecture actif.", sourceHealthPayload()); const c = findCoinByQuery(symbol); if (!c) return commandError(`Actif introuvable dans le top chargé : ${symbol}`, { loaded_assets: state.coins.length }); return commandOk(`asset ${symbol}`, coinPayload(c)); }, category(symbol) { if (!state.liveOk || !state.coins.length) return commandError("Livecheck requis avant classification.", sourceHealthPayload()); const c = findCoinByQuery(symbol); if (!c) return commandError(`Actif introuvable : ${symbol}`); return commandOk(`category ${symbol}`, { symbol: c.symbol, name: c.name, category: classifyAsset(c), reading: whyDecision(c) }); }, risk(symbol) { if (!state.liveOk || !state.coins.length) return commandError("Livecheck requis avant lecture risque.", sourceHealthPayload()); const c = findCoinByQuery(symbol); if (!c) return commandError(`Actif introuvable : ${symbol}`); return commandOk(`risk ${symbol}`, { asset: coinPayload(c), risk_flags: [ "contract_security_not_checked", "social_signal_not_checked", "onchain_signal_not_checked", "public_market_data_only" ], no_fomo_rule: "Une occasion ratée ne coûte rien. Une mauvaise position peut coûter très cher.", conclusion: "Observation only. Human validation required." }); }, sources() { return commandOk("sources", sourceHealthPayload()); }, simulation_profile() { return commandOk("simulation_profile", getSimulationProfileStatus()); }, chart(symbol, period = "24h") { if (!state.liveOk || !state.coins.length) return commandError("Livecheck requis avant graphique.", sourceHealthPayload()); const c = findCoinByQuery(symbol); if (!c) return commandError(`Actif introuvable : ${symbol}`); const normalized = String(period || "24h").toLowerCase(); const days = normalized.includes("30") ? 30 : normalized.includes("7") ? 7 : 1; state.selectedCoinId = c.id; state.chartPeriodDays = days; document.querySelectorAll(".period-btn[data-period]").forEach(btn => { btn.classList.toggle("active", Number(btn.dataset.period) === days); }); renderScore(c); renderMarketTable(); requestAnimationFrame(() => renderAnalystPanel()); return commandOk(`chart ${symbol} ${period}`, { selected_asset: coinPayload(c), period_days: days, action: "chart_panel_updated" }); }, compare(symbolA, symbolB) { if (!state.liveOk || !state.coins.length) return commandError("Livecheck requis avant comparaison.", sourceHealthPayload()); const a = findCoinByQuery(symbolA); const b = findCoinByQuery(symbolB); if (!a || !b) return commandError("Comparaison impossible : un actif est introuvable.", { symbolA, foundA: !!a, symbolB, foundB: !!b }); const ap = coinPayload(a); const bp = coinPayload(b); return commandOk(`compare ${symbolA} ${symbolB}`, { left: ap, right: bp, delta: { price_eur: (a.price ?? 0) - (b.price ?? 0), change_24h_pct: (a.change24h ?? 0) - (b.change24h ?? 0), change_7d_pct: (a.change7d ?? 0) - (b.change7d ?? 0), market_cap_eur: (a.marketCap ?? 0) - (b.marketCap ?? 0), volume_24h_eur: (a.volume24h ?? 0) - (b.volume24h ?? 0), score: (ap.score ?? 0) - (bp.score ?? 0) }, warning: "Comparison is observational; it does not rank investment quality." }); }, planning() { return commandOk("planning", planningPayload()); }, exchange_plan() { return commandOk("exchange_plan", exchangePlanPayload()); }, news_sources() { return commandOk("news_sources", newsPlanPayload()); }
}; function parseCommandLine(input) { const raw = String(input || "").trim(); if (!raw) return commandError("Commande vide. Tape help."); const parts = raw.split(/\s+/); let cmd = parts[0].toLowerCase(); const lowerRaw = raw.toLowerCase().trim(); if (lowerRaw === "plan architecture" || lowerRaw === "architecture" || lowerRaw === "plan") cmd = "backend_blueprint"; if (lowerRaw === "controle securite" || lowerRaw === "contrôle sécurité" || lowerRaw === "securite" || lowerRaw === "sécurité") cmd = "security_review"; if (lowerRaw === "plan kraken" || lowerRaw === "kraken lecture seule") cmd = "kraken_readonly_plan"; if (lowerRaw === "sources info" || lowerRaw === "journaux") cmd = "news_sources"; if (lowerRaw === "resume marche" || lowerRaw === "résumé marché") cmd = "market_snapshot"; if (lowerRaw === "portefeuille virtuel") cmd = "portfolio"; if (["buy", "sell", "order", "trade", "withdraw", "transfer"].includes(cmd)) { return commandError("Commande bloquée : aucun ordre réel, retrait ou transfert depuis cette interface publique.", { command: raw, rule: "Trading must require backend, API keys protected, dry-run, logs, limits, and human validation." }); } if (cmd === "help") return CryptoCommands.help(); if (cmd === "market_snapshot" || cmd === "snapshot" || cmd === "market") return CryptoCommands.market_snapshot(); if (cmd === "asset" || cmd === "quote") return CryptoCommands.asset(parts[1]); if (cmd === "chart" || cmd === "graph") return CryptoCommands.chart(parts[1], parts[2] || "24h"); if (cmd === "compare") return CryptoCommands.compare(parts[1], parts[2]); if (cmd === "sources" || cmd === "health" || cmd === "source_health") return CryptoCommands.sources(); if (cmd === "simulation_profile" || cmd === "profil_simulation" || cmd === "profil") return CryptoCommands.simulation_profile(); if (cmd === "sim_buy" || cmd === "paper_buy") return simulateOrder("buy", parts[1], parts[2]); if (cmd === "sim_sell" || cmd === "paper_sell") return simulateOrder("sell", parts[1], parts[2]); if (cmd === "portfolio" || cmd === "paper_portfolio") return commandOk("portfolio", simulationPayload()); if (cmd === "reset_sim" || cmd === "paper_reset") { resetSimulation(); return commandOk("reset_sim", simulationPayload()); } if (cmd === "questionnaire_status" || cmd === "questionnaire") return commandOk("questionnaire_status", questionnaireStatusPayload()); if (cmd === "situation" || cmd === "status") return commandOk("situation", situationPayload()); if (cmd === "next_steps" || cmd === "suite") return commandOk("next_steps", nextStepsPayload()); if (cmd === "boundaries" || cmd === "limites") return commandOk("boundaries", boundariesPayload()); if (cmd === "briefing" || cmd === "session") return commandOk("briefing", briefingPayload()); if (cmd === "questions") return commandOk("questions", questionsPayload()); if (cmd === "do_not_do" || cmd === "interdits") return commandOk("do_not_do", doNotDoPayload()); if (cmd === "backend_blueprint" || cmd === "backend") return commandOk("backend_blueprint", backendBlueprintPayload()); if (cmd === "kraken_readonly_plan" || cmd === "kraken_readonly") return commandOk("kraken_readonly_plan", krakenReadonlyPlanPayload()); if (cmd === "remote_access_plan" || cmd === "remote_blueprint" || cmd === "remote") return commandOk("remote_access_plan", remoteBlueprintPayload()); if (cmd === "security_review" || cmd === "security_check") return commandOk("security_review", securityReviewPayload()); if (cmd === "safety_plan" || cmd === "safety") return commandOk("safety_plan", safetyPlanPayload()); if (cmd === "kill_switch" || cmd === "killswitch") return commandOk("kill_switch", killSwitchPayload()); if (cmd === "access_plan" || cmd === "remote_access") return commandOk("access_plan", accessPlanPayload()); if (cmd === "gates" || cmd === "gate_status") return commandOk("gates", gatesPayload()); if (cmd === "planning" || cmd === "roadmap") return CryptoCommands.planning(); if (cmd === "exchange_plan" || cmd === "exchanges") return CryptoCommands.exchange_plan(); if (cmd === "news_sources" || cmd === "news" || cmd === "journaux") return CryptoCommands.news_sources(); if (cmd === "category" || cmd === "cat") return CryptoCommands.category(parts[1]); if (cmd === "risk" || cmd === "risk_readout") return CryptoCommands.risk(parts[1]); return commandError(`Commande inconnue : ${cmd}`, { hint: "Tape help.", received: raw });
} function renderSimpleCommandIntro() { if (!els.commandHuman) return; els.commandHuman.classList.add("ok"); els.commandHuman.classList.remove("err"); els.commandHuman.innerHTML = ` <b>Mode simple prêt</b> <p>Clique un bouton au-dessus. La carte verte suffit.</p> <ul> <li>Résumé marché : vérifie les données principales.</li> <li>Plan architecture : explique public / privé / Kraken.</li> <li>Contrôle sécurité : liste les protections obligatoires.</li> <li>Portefeuille virtuel : simulation 100 €, sans argent réel.</li> </ul> <div class="cmd-tags"><span>aucun achat réel</span><span>profil 100 €</span><span>simulation only</span></div> `;
} function humanCommandSummary(result) { const cmd = String(result?.command || "").toLowerCase(); if (!result || result.ok === false) { const isProfileRefusal = !!result?.profile; return { title: isProfileRefusal ? "Simulation refusée : sécurité OK" : "Commande bloquée ou impossible", text: result?.error || "La commande n’a pas pu être exécutée.", bullets: isProfileRefusal ? [ "Le refus est normal : le profil débutant protège le capital virtuel.", "Aucun ordre réel n’a été envoyé.", "Le refus est inscrit dans le journal simulation." ] : [ "Aucun ordre réel n’a été envoyé.", "Aucune clé API n’est utilisée dans cette page.", "Vérifie Livecheck si la commande dépend des données marché." ], tags: isProfileRefusal ? ["refus visible", "profil 100 €", "sécurité"] : ["sécurité", "observation only"] }; } if (cmd === "questionnaire_status") { return { title: "Questionnaire : OK", text: "Cette carte vérifie l’état de la fiche de session locale.", bullets: [ "Les notes restent dans le navigateur.", "Aucune clé réelle ne doit être saisie.", "Aucun wallet réel ne doit être connecté.", "La fiche sert à préparer la discussion et peut être exportée en note Markdown." ], tags: ["questionnaire", "local", "aucun secret"] }; } if (cmd === "situation") { return { title: "Situation : OK", text: "Cette carte résume où en est le projet maintenant.", bullets: [ "Actif : observation, graphiques, sources, simulation locale.", "Préparé : backend privé, accès renforcé, Kraken lecture seule.", "Verrouillé : wallet réel, clé privée, retrait, ordre réel.", "Étape actuelle : collecter les informations de session." ], tags: ["situation", "clair", "aucun réel"] }; } if (cmd === "next_steps") { return { title: "Prochaines étapes : OK", text: "Cette carte liste ce qu’il faut clarifier avant de développer la machine privée.", bullets: [ "Cryptos prioritaires.", "Montant virtuel de simulation.", "Risques interdits.", "Sources d’actualité.", "Machine privée et accès renforcé." ], tags: ["suite", "briefing", "préparation"] }; } if (cmd === "boundaries") { return { title: "Limites verrouillées : OK", text: "Cette carte rappelle ce que l’app publique ne doit jamais faire.", bullets: [ "Pas de clé réelle.", "Pas de wallet réel.", "Pas de seed phrase.", "Pas d’ordre réel.", "Pas d’accès distant public." ], tags: ["verrou", "sécurité", "zéro argent réel"] }; } if (cmd === "briefing") { return { title: "Briefing session : OK", text: "Cette carte prépare la discussion : on collecte les informations avant toute décision technique.", bullets: [ "Clarifier le but exact.", "Lister les cryptos prioritaires.", "Définir les limites de risque.", "Noter les sources d’information.", "Ne connecter aucun wallet réel." ], tags: ["préparation", "aucun réel", "sécurité"] }; } if (cmd === "questions") { return { title: "Questions à poser : OK", text: "Cette carte liste les points à éclaircir avant la prochaine étape.", bullets: [ "Montant virtuel de simulation.", "Cryptos prioritaires.", "Sources d’actualité.", "Machine privée.", "Accès renforcé.", "Validation humaine." ], tags: ["questions", "session", "clarifier"] }; } if (cmd === "do_not_do") { return { title: "À ne pas faire : OK", text: "Cette carte rappelle les actions interdites pour éviter une erreur dangereuse.", bullets: [ "Pas de clé réelle.", "Pas de wallet réel.", "Pas de seed phrase.", "Pas de trading automatique.", "Pas d’accès public." ], tags: ["interdits", "sécurité", "zéro argent réel"] }; } if (cmd === "backend_blueprint") { return { title: "Backend Blueprint : test OK", text: "Le bouton “Plan architecture” montre simplement où seront rangées les parties du futur système. Il ne connecte rien et ne fait aucun achat.", bullets: [ "Site public : ce que tu vois ici, sans clé et sans argent réel.", "Machine privée : futur machine privée ou serveur sécurisé.", "Kraken : plus tard, d’abord en lecture seule.", "Interdit : achat réel, retrait, clé API dans GitHub." ], tags: ["plan validé", "aucune connexion réelle", "Kraken plus tard"] }; } if (cmd === "security_review") { return { title: "Security Review : checklist OK", text: "Le bouton “Contrôle sécurité” affiche la liste des protections obligatoires avant toute vraie connexion.", bullets: [ "Aucune clé dans GitHub Pages.", "Clé Kraken lecture seule au départ.", "Retrait désactivé.", "Logs, kill switch et validation humaine obligatoires.", "Paper trading avant argent réel." ], tags: ["sécurité", "checklist", "avant réel"] }; } if (cmd === "kraken_readonly_plan") { return { title: "Kraken lecture seule : plan OK", text: "La commande décrit le futur premier niveau Kraken : lire des données, sans acheter, vendre, transférer ou retirer.", bullets: [ "Lecture solde / prix / historique uniquement.", "Aucun ordre autorisé.", "Aucun retrait autorisé.", "Backend sécurisé requis." ], tags: ["Kraken", "lecture seule", "future étape"] }; } if (cmd === "remote_access_plan" || cmd === "remote_blueprint") { return { title: "Accès distant : plan OK", text: "La commande décrit le futur accès réservé à operateur_autorise et operateur_autorise uniquement.", bullets: [ "Pas de panneau admin public.", "Comptes séparés.", "Authentification forte.", "Actions admin journalisées.", "Désactivation d’urgence prévue." ], tags: ["accès renforcé", "2 personnes", "hors GitHub Pages"] }; } if (cmd === "market_snapshot") { return { title: "Snapshot marché : OK", text: "La commande résume l’état du marché chargé par Livecheck.", bullets: [ "Source principale utilisée.", "Capitalisation globale.", "Volume 24h.", "BTC / ETH comme repères." ], tags: ["marché", "lecture live"] }; } if (cmd.startsWith("asset ")) { return { title: "Lecture actif : OK", text: "La commande a récupéré les données d’une crypto chargée dans le tableau.", bullets: [ "Prix.", "Variation 24h / 7j.", "Type d’actif.", "Score de veille.", "Limites : pas sécurité contrat, pas social, pas on-chain." ], tags: ["actif", "observation"] }; } if (cmd.startsWith("chart ")) { return { title: "Graphique mis à jour", text: "La commande a sélectionné l’actif et la période dans le panneau graphique.", bullets: [ "Le graphique change dans la zone Analyste.", "Le score et le détail actif se synchronisent.", "Ce n’est pas un signal d’achat." ], tags: ["graphique", "analyste"] }; } if (cmd === "simulation_profile") { return { title: "Profil simulateur : OK", text: "Le profil Solo Débutant 100 € est actif.", bullets: [ "Capital virtuel : 100 €.", "Cryptos autorisées : BTC, ETH, SOL.", "Ticket conseillé : 5 €.", "Maximum opération : 10 €.", "Exposition maximale : 30 €." ], tags: ["profil 100 €", "débutant", "simulation"] }; } if (cmd === "portfolio" || cmd.startsWith("sim_") || cmd === "reset_sim") { return { title: "Simulation : OK", text: "La commande agit uniquement sur le portefeuille virtuel local.", bullets: [ "Aucun argent réel.", "Aucun wallet connecté.", "Aucune clé API.", "Stockage local navigateur.", "Profil actif : 100 € virtuels, ticket conseillé 5 €, maximum 10 €." ], tags: ["paper trading", "profil 100 €", "simulation only"] }; } if (cmd === "sources") { return { title: "Sources : diagnostic OK", text: "La commande affiche l’état des sources interrogées.", bullets: [ "CoinGecko est critique pour le tableau.", "Les sources secondaires peuvent échouer sans bloquer si CoinGecko répond.", "Les erreurs restent visibles." ], tags: ["diagnostic", "sources"] }; } return { title: "Test exécuté", text: "Le bouton a répondu correctement. La partie importante est cette carte, pas les détails techniques.", bullets: [ "Résultat reçu.", "Aucun ordre réel.", "Mode observation only." ], tags: ["OK", "dry-run"] };
} function renderHumanCommand(result) { if (!els.commandHuman) return; const summary = humanCommandSummary(result); els.commandHuman.classList.toggle("ok", result?.ok !== false); els.commandHuman.classList.toggle("err", result?.ok === false); const bullets = summary.bullets.map(item => `<li>${escapeHtml(item)}</li>`).join(""); const tags = summary.tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join(""); els.commandHuman.innerHTML = ` <b>${escapeHtml(summary.title)}</b> <p>${escapeHtml(summary.text)}</p> <ul>${bullets}</ul> <div class="cmd-tags">${tags}</div> `;
} function renderCommandOutput(result) { renderHumanCommand(result); if (els.commandOutput) { els.commandOutput.textContent = ""; }
} function runCommandFromInput(commandText = null) { const text = commandText ?? els.commandInput?.value ?? ""; if (els.commandInput && commandText !== null) { const label = document.querySelector(`.cmd-preset[data-command="${CSS.escape(commandText)}"]`)?.textContent?.trim(); els.commandInput.value = label || commandText; } const result = parseCommandLine(text); if (els.commandOutput) els.commandOutput.dataset.userRan = "1"; renderCommandOutput(result);
} 

/* =========================================================
   V1.1-alpha.26.35 — Atlas Decision Board
   Lecture décisionnelle prudente depuis marché live + mémoire locale.
   ========================================================= */
function atlasDecisionPct(value) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${value >= 0 ? "+" : ""}${value.toFixed(2)} %`
    : "—";
}

function atlasDecisionRatio(c) {
  if (!c || !c.volume24h || !c.marketCap) return 0;
  const ratio = Number(c.volume24h) / Number(c.marketCap);
  return Number.isFinite(ratio) ? ratio : 0;
}

function atlasDecisionLine(c) {
  if (!c) return "—";
  const score = scoreCoin(c);
  const action = atlasActionForCoin(c);
  return `${String(c.symbol || c.name || "ACTIF").toUpperCase()} · ${atlasDecisionPct(c.change24h)} · ${action} · score ${score.score ?? "—"}`;
}

function atlasDecisionMemoryStats() {
  const records = typeof readAutoMemory === "function" ? readAutoMemory() : [];
  const collectors = [...new Set(records.map(r => r && (r.collector_id || "local-legacy")).filter(Boolean))];
  const last = records.length ? records[records.length - 1] : null;
  const previous = records.length > 1 ? records[records.length - 2] : null;
  return { records, collectors, last, previous };
}

function atlasDecisionSectorRows(coins) {
  const groups = {};
  for (const c of coins || []) {
    const key = classifyAsset(c);
    if (!groups[key]) groups[key] = { key, count: 0, avg24: 0, best: null };
    groups[key].count += 1;
    groups[key].avg24 += Number(c.change24h || 0);
    if (!groups[key].best || Number(c.change24h || -999) > Number(groups[key].best.change24h || -999)) groups[key].best = c;
  }
  return Object.values(groups)
    .map(g => ({ ...g, avg24: g.count ? g.avg24 / g.count : 0 }))
    .sort((a, b) => b.avg24 - a.avg24)
    .slice(0, 3);
}

function atlasDecisionDeltaLines(last, previous) {
  if (!last || !previous || !Array.isArray(last.assets) || !Array.isArray(previous.assets)) return [];
  return last.assets
    .map(a => {
      const prev = typeof findAutoAsset === "function" ? findAutoAsset(previous, a.id || a.symbol) : null;
      const delta = typeof priceDeltaPct === "function" ? priceDeltaPct(a, prev) : null;
      return { asset: a, delta };
    })
    .filter(x => typeof x.delta === "number" && Math.abs(x.delta) >= 0.12)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 3)
    .map(x => `${String(x.asset.symbol || x.asset.name || "ACTIF").toUpperCase()} ${x.delta >= 0 ? "+" : ""}${x.delta.toFixed(2)} % depuis dernier relevé`);
}

function renderDecisionBoard() {
  const status = document.getElementById("decisionBoardStatus");
  const grid = document.getElementById("decisionBoardGrid");
  const verdict = document.getElementById("decisionBoardVerdict");
  if (!grid) return;

  const memory = atlasDecisionMemoryStats();
  const okSources = (state.sourceStatus || []).filter(s => s.status === "OK").length;
  const totalSources = state.sourceStatusExpectedTotal || (state.sourceStatus || []).length || 0;

  const renderVerdictEmpty = () => {
    if (!verdict) return;
    verdict.innerHTML = `
      <div class="decision-verdict-title">Décision Atlas : attendre le Livecheck</div>
      <div class="decision-verdict-body">
        <div><b>Pourquoi</b><span>Aucune décision froide sans source réelle active.</span></div>
        <div><b>Confirmations</b><span>${memory.records.length} snapshots mémoire · ${memory.collectors.length || 0} collecteur(s).</span></div>
        <div><b>Risques</b><span>Prix live absent ou non chargé. Atlas refuse les signaux fictifs.</span></div>
        <div><b>Action de travail</b><span>Lancer Livecheck, puis comparer BTC / ETH / SOL avant toute lecture d’altcoins.</span></div>
      </div>
    `;
  };

  if (!state.liveOk || !state.coins.length) {
    if (status) {
      status.textContent = "Livecheck requis";
      status.className = "pill warn";
    }
    grid.innerHTML = `
      <article class="decision-card"><b>À observer</b><span>Livecheck requis. Aucun actif classé.</span></article>
      <article class="decision-card"><b>À comparer</b><span>BTC / ETH / SOL après source réelle.</span></article>
      <article class="decision-card"><b>Anomalies</b><span>Atlas refuse les signaux sans prix live.</span></article>
      <article class="decision-card"><b>Secteurs forts</b><span>En attente du tableau marché.</span></article>
      <article class="decision-card"><b>Mémoire active</b><span>${memory.records.length} snapshots · ${memory.collectors.length || 0} collecteur(s).</span></article>
      <article class="decision-card decision-card-wide"><b>Décision froide</b><span>Attendre. Pas de prix fictif, pas d’achat, pas de FOMO.</span></article>
    `;
    renderVerdictEmpty();
    return;
  }

  const coins = [...state.coins];
  const nonStable = coins.filter(c => classifyAsset(c) !== "Stablecoin");
  const observe = nonStable
    .filter(c => Number(c.change24h || 0) > 2 && Number(c.change7d || 0) >= 0)
    .sort((a, b) => Number(b.change24h || 0) - Number(a.change24h || 0))
    .slice(0, 4);

  const compare = nonStable
    .filter(c => ["Socle marché", "Grand actif solide", "Opportunité à surveiller"].includes(classifyAsset(c)))
    .sort((a, b) => atlasDecisionRatio(b) - atlasDecisionRatio(a))
    .slice(0, 4);

  const anomalies = coins
    .filter(c => Math.abs(Number(c.change24h || 0)) >= 7 || atlasDecisionRatio(c) >= 0.08 || scoreCoin(c).score < 40)
    .sort((a, b) => Math.abs(Number(b.change24h || 0)) - Math.abs(Number(a.change24h || 0)))
    .slice(0, 4);

  const sectors = atlasDecisionSectorRows(coins);
  const deltas = atlasDecisionDeltaLines(memory.last, memory.previous);
  const selected = getSelectedCoin();
  const selectedScore = scoreCoin(selected);
  const sourceLine = `${state.mainSource || "Source marché"} · ${okSources}/${totalSources || "?"} sources`;
  const confidence =
    okSources >= 7 && memory.records.length >= 20 ? "confiance correcte" :
    okSources >= 5 && memory.records.length >= 5 ? "confiance moyenne" :
    "confiance prudente";

  if (status) {
    status.textContent = `Mémoire ${memory.records.length} · ${confidence}`;
    status.className = `pill ${confidence === "confiance correcte" ? "ok" : "warn"}`;
  }

  const observeHtml = observe.length
    ? observe.map(atlasDecisionLine).join("<br>")
    : "Aucun actif clairement confirmé. Observer le socle marché.";

  const compareHtml = compare.length
    ? compare.map(atlasDecisionLine).join("<br>")
    : "Comparer BTC / ETH / SOL après plusieurs relevés.";

  const anomaliesHtml = anomalies.length
    ? anomalies.map(c => `${String(c.symbol || c.name).toUpperCase()} · ${atlasDecisionPct(c.change24h)} · ratio vol/cap ${(atlasDecisionRatio(c)*100).toFixed(2)} %`).join("<br>")
    : "Pas d’anomalie majeure détectée dans le tableau actuel.";

  const sectorsHtml = sectors.length
    ? sectors.map(s => `${escapeHtml(s.key)} · ${atlasDecisionPct(s.avg24)} · repère ${escapeHtml(s.best?.symbol || "—")}`).join("<br>")
    : "Secteurs en attente.";

  const memoryHtml = [
    `${memory.records.length} snapshots locaux`,
    `${memory.collectors.length || 0} collecteur(s)`,
    memory.last?.saved_at ? `dernier : ${new Date(memory.last.saved_at).toLocaleTimeString("fr-FR")}` : "dernier : en attente",
    deltas.length ? deltas.join("<br>") : "pas assez d’écart mémoire significatif"
  ].join("<br>");

  const coldHtml = [
    `Actif courant : ${escapeHtml(selected?.symbol || "—")} · score ${selectedScore.score ?? "—"}`,
    `Action : ${escapeHtml(selected ? atlasActionForCoin(selected) : "Attendre")}`,
    `Validation : ${escapeHtml(sourceLine)}`,
    "Règle : observer / comparer, aucun ordre réel."
  ].join("<br>");

  grid.innerHTML = `
    <article class="decision-card"><b>À observer</b><span>${observeHtml}</span></article>
    <article class="decision-card"><b>À comparer</b><span>${compareHtml}</span></article>
    <article class="decision-card"><b>Anomalies / prudence</b><span>${anomaliesHtml}</span></article>
    <article class="decision-card"><b>Secteurs forts</b><span>${sectorsHtml}</span></article>
    <article class="decision-card"><b>Mémoire active</b><span>${memoryHtml}</span></article>
    <article class="decision-card decision-card-wide"><b>Décision froide</b><span>${coldHtml}</span></article>
  `;

  if (verdict) {
    const action = selected ? atlasActionForCoin(selected) : "observer";
    const currentSymbol = escapeHtml(selected?.symbol || "marché");
    const topObserve = observe.slice(0, 3).map(c => escapeHtml(String(c.symbol || c.name).toUpperCase())).join(" · ") || "aucun actif confirmé";
    const topCompare = compare.slice(0, 3).map(c => escapeHtml(String(c.symbol || c.name).toUpperCase())).join(" · ") || "BTC · ETH · SOL";
    const riskFocus = anomalies.slice(0, 3).map(c => escapeHtml(String(c.symbol || c.name).toUpperCase())).join(" · ") || "pas d’anomalie majeure";
    const sectorFocus = sectors.slice(0, 3).map(s => `${escapeHtml(s.key)} ${atlasDecisionPct(s.avg24)}`).join(" · ") || "secteurs en attente";
    const memoryFocus = deltas.length ? deltas.slice(0, 2).map(escapeHtml).join("<br>") : "mémoire stable ou écart insuffisant entre les derniers relevés";

    verdict.innerHTML = `
      <div class="decision-verdict-title">Décision Atlas : ${escapeHtml(action)} · ${escapeHtml(confidence)}</div>
      <div class="decision-verdict-body">
        <div>
          <b>Pourquoi</b>
          <span>Marché lisible mais décision limitée à l’observation. ${currentSymbol} sert de repère, pas de signal d’achat.</span>
        </div>
        <div>
          <b>À suivre maintenant</b>
          <span>${topObserve}<br>Comparaison utile : ${topCompare}</span>
        </div>
        <div>
          <b>Confirmations</b>
          <span>${memory.records.length} snapshots · ${memory.collectors.length || 0} collecteur(s) · ${escapeHtml(sourceLine)}.</span>
        </div>
        <div>
          <b>Lecture secteurs</b>
          <span>${sectorFocus}</span>
        </div>
        <div>
          <b>Risques / prudence</b>
          <span>${riskFocus}. Sécurité, social, news et on-chain restent à vérifier hors tableau.</span>
        </div>
        <div>
          <b>Mémoire récente</b>
          <span>${memoryFocus}</span>
        </div>
      </div>
      <div class="decision-verdict-action">
        Action de travail : observer les actifs forts, comparer au socle BTC / ETH / SOL, attendre confirmation mémoire. Aucun achat automatique.
      </div>
    `;
  }
}

function renderAll() { atlasRenderMarketAccessNotice(); atlasRenderBrokerStrip(); renderMetrics(); renderTicker(); renderMarketTable(); renderWatchlist(); renderScore(getSelectedCoin() || state.coins[0] || null); renderRiskGrid(); renderColdRead(true); renderBeginnerSummary(); renderDecisionBoard(); renderSimulation(); requestAnimationFrame(() => { renderAnalystPanel(); if (els.commandOutput && !els.commandOutput.dataset.userRan) { renderCommandOutput(CryptoCommands.market_snapshot()); } });
} function renderMetrics() { const g = state.global; if (g) { setText(els.metricMarketCap, num(g.total_market_cap?.eur, fmtCompactEUR.format.bind(fmtCompactEUR))); setText(els.metricMarketCapHint, `${state.mainSource || "Source marché"} global`); setText(els.metricVolume, num(g.total_volume?.eur, fmtCompactEUR.format.bind(fmtCompactEUR))); setText(els.metricVolumeHint, "Volume global 24h"); const btc = g.market_cap_percentage?.btc; setText(els.metricBtcDom, typeof btc === "number" ? `${btc.toFixed(2)} %` : "Donnée manquante"); setText(els.metricBtcDomHint, "Dominance BTC"); } updateSourceMetric();
} function renderTicker() { if (!state.liveOk || !state.coins.length) { setHTML(els.tickerTrack, `<span class="ticker-meta">Livecheck requis · aucune donnée chiffrée chargée · pas de tableau fictif</span>`); return; } const items = state.coins.slice(0, 18).map(c => { const cls = clsPct(c.change24h); return `<span class="ticker-item"> <span class="ticker-symbol">${escapeHtml(c.symbol)}</span> <span class="ticker-price">${atlasFormatEUR(c.priceEur ?? c.price)}</span> <span class="ticker-change ${cls}">${fmtPct(c.change24h)}</span> </span>`; }).join(""); const meta = `<span class="ticker-meta">Source : ${escapeHtml(state.mainSource)} · Heure : ${new Date(state.timestamp).toLocaleTimeString("fr-FR")}</span>`; setHTML(els.tickerTrack, `<span>${items}${meta}</span><span>${items}${meta}</span>`);
} function scoreCoin(c) {
  if (!c) return { score: null, label: "En attente", parts: {} };
  if (!state.sourceLock?.valid || !atlasCanonicalCoin(c)) return { score: null, label: "Source Lock", parts: {} };

  const parts = {
    information: 12,
    market: c.marketCap ? 14 : 6,
    liquidity: c.volume24h && c.marketCap ? clamp(3, 15, (c.volume24h / c.marketCap) * 350) : 4,
    momentum: typeof c.change24h === "number" ? clamp(1, 10, 8 - Math.abs(c.change24h) / 7) : 4,
    risk: 8
  };

  const base = (
    parts.information / 15 * 18 +
    parts.market / 15 * 22 +
    parts.liquidity / 15 * 22 +
    parts.momentum / 10 * 18 +
    parts.risk / 15 * 20
  );

  let penalty = 0;
  if (typeof c.change24h === "number" && Math.abs(c.change24h) > 18) penalty += 12;
  if (c.volume24h && c.marketCap && c.volume24h / c.marketCap < 0.01) penalty += 10;
  penalty += 16;

  const score = Math.round(clamp(0, 100, base - penalty));
  let label = "Veille";
  if (score <= 40) label = "Veille fragile";
  else if (score <= 55) label = "Veille";
  else if (score <= 65) label = "Signal faible";
  else if (score <= 75) label = "Analyse approfondie";
  else label = "Signal fort mais risqué";

  return { score, label, parts };
}

function decisionFromScore(score) { if (score === null || score === undefined) return "Livecheck requis"; if (score <= 40) return "Veille fragile"; if (score <= 55) return "Veille"; if (score <= 65) return "Signal faible"; if (score <= 75) return "Analyse approfondie"; return "Signal fort mais risqué";
} function renderMarketTable() { if (!els.marketRows) return; if (!state.liveOk || !state.coins.length) { renderEmptyMarket("Livecheck requis. Aucun prix inventé."); return; } const q = (els.searchInput?.value || "").toLowerCase().trim(); const filtered = state.coins .filter(c => !q || c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)) .filter(matchAssetFilter); const rows = sortAssets(filtered).slice(0, 50); if (!rows.length) { renderEmptyMarket("Aucun actif ne correspond au filtre."); return; } els.marketRows.innerHTML = rows.map(c => { const s = scoreCoin(c); return `<tr class="asset-row ${c.id === state.selectedCoinId ? 'is-selected' : ''}" data-id="${escapeHtml(c.id)}"> <td>${c.rank ?? "—"}</td> <td><div class="coin-cell">${c.image ? `<img src="${escapeHtml(c.image)}" alt="" loading="lazy">` : ""}<div><strong>${escapeHtml(c.name)}</strong><br><small>${escapeHtml(c.symbol)}</small><br><span class="asset-badge">${escapeHtml(classifyAsset(c))}</span></div></div></td> <td><div class="price-dual"><b>${atlasFormatEUR(c.priceEur ?? c.price)}</b><small>${Number.isFinite(Number(c.priceUsd)) ? atlasFormatUSD(c.priceUsd) : "USD —"}</small></div></td> <td class="${clsPct(c.change24h)}">${fmtPct(c.change24h)}</td> <td class="${clsPct(c.change7d)}">${fmtPct(c.change7d)}</td> <td>${num(c.marketCap, fmtCompactEUR.format.bind(fmtCompactEUR))}</td> <td>${num(c.volume24h, fmtCompactEUR.format.bind(fmtCompactEUR))}</td> <td class="spark-cell">${sparkSvg(c)}</td> <td>${s.score ?? "—"}</td> <td>${beginnerDecision(c)}</td> </tr>`; }).join(""); setText( els.tableNote, `${rows.length}/${filtered.length} actifs affichés · filtre : ${state.assetFilter} · tri : ${state.sortKey}. Source : ${state.mainSource}.` ); [...els.marketRows.querySelectorAll("tr[data-id]")].forEach(row => { row.addEventListener("click", () => { const coin = state.coins.find(c => c.id === row.dataset.id); if (!coin) return; state.selectedCoinId = coin.id; atlasBrokerSeedSpot(coin); renderScore(coin); renderMarketTable(); renderAnalystPanel(); renderDecisionBoard(); }); });
} function renderEmptyMarket(message) { if (els.marketRows) { els.marketRows.innerHTML = `<tr><td colspan="10" class="empty">${escapeHtml(message)}</td></tr>`; } setText(els.tableNote, "Pas de source live, pas de prix.");
} function renderScore(coin) { const s = scoreCoin(coin); if (!els.scoreRing || !els.scoreValue || !els.scoreLabel || !els.scoreBreakdown) return; if (s.score === null) { els.scoreRing.style.setProperty("--score", 0); els.scoreValue.textContent = "—"; els.scoreLabel.textContent = "En attente"; els.scoreBreakdown.innerHTML = ` <div><span>Information</span><b>—</b></div> <div><span>Marché</span><b>—</b></div> <div><span>Liquidité</span><b>—</b></div> <div><span>Momentum</span><b>—</b></div> <div><span>Risque</span><b>—</b></div>`; return; } els.scoreRing.style.setProperty("--score", s.score); els.scoreValue.textContent = s.score; els.scoreLabel.textContent = s.label; els.scoreBreakdown.innerHTML = ` <div><span>Information</span><b>${Math.round(s.parts.information)}/15</b></div> <div><span>Marché</span><b>${Math.round(s.parts.market)}/15</b></div> <div><span>Liquidité</span><b>${Math.round(s.parts.liquidity)}/15</b></div> <div><span>Momentum</span><b>${Math.round(s.parts.momentum)}/10</b></div> <div><span>Risque</span><b>pénalité active</b></div> <div class="why-box">${escapeHtml(whyDecision(coin))}</div>`;
} function renderWatchlist() { if (!els.watchCards) return; const selectedCount = (state.watchIds || []).length; if (els.watchBasketSummary) { els.watchBasketSummary.textContent = `Atlas Watchlist V2 auto · ${selectedCount} actifs suivis · ${ATLAS_WATCH_BASKETS.length} paniers compacts.`; } if (!state.liveOk || !state.coins.length) { els.watchCards.innerHTML = `<div class="mini-card muted">Livecheck requis. Atlas V2 est prêt, sans inventer de prix.</div>`; return; } const topMovers = state.coins .filter(c => typeof c.change24h === "number") .slice() .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h)) .slice(0, 6) .map(c => `${escapeHtml(c.symbol)} <b class="${clsPct(c.change24h)}">${fmtPct(c.change24h)}</b>`) .join(" · "); const basketRows = ATLAS_WATCH_BASKETS.map(basket => { const coins = watchBasketCoins(basket); const status = basketStatus(coins); const leaders = coins .slice() .sort((a, b) => Math.abs(Number(b.change24h) || 0) - Math.abs(Number(a.change24h) || 0)) .slice(0, 4); const leaderText = leaders.length ? leaders.map(c => `${escapeHtml(c.symbol)} <b class="${clsPct(c.change24h)}">${fmtPct(c.change24h)}</b>`).join(" · ") : "aucun actif dans le top chargé"; return `<article class="watch-compact-row ${status.mode}"> <div> <b>${escapeHtml(basket.label)}</b> <span>${escapeHtml(basket.role)}</span> </div> <strong>${status.label}${typeof status.avg === "number" ? ` · ${fmtPct(status.avg)}` : ""}</strong> <em>${leaderText}</em> <small>${coins.length}/${basket.ids.length} actifs visibles</small> </article>`; }).join(""); els.watchCards.innerHTML = [ `<div class="watch-v2-diagnostic compact"> <b>Lecture Atlas V2 compacte</b> <span>${selectedCount} actifs suivis · ${state.coins.length} actifs chargés · mouvements : ${topMovers || "en attente"}</span> </div>`, `<div class="watch-compact-list">${basketRows}</div>` ].join("");
} function renderRiskGrid() { if (!els.riskGrid) return; els.riskGrid.innerHTML = ` <div class="risk ${state.liveOk ? "ok" : "wait"}"><span>Marché</span><b>${state.sourceLock?.valid ? "Source Lock CoinGecko" : "Source canonique absente"}</b></div> <div class="risk warn"><span>Sécurité</span><b>Non vérifiée V1.1-alpha.26.35</b></div> <div class="risk warn"><span>Social</span><b>Non vérifié</b></div> <div class="risk warn"><span>On-chain</span><b>Non vérifié</b></div>`;
} function renderSourceGrid() { if (!els.sourceGrid) { renderSourceDiagnostic(); return; } if (!state.sourceStatus.length) { els.sourceGrid.innerHTML = liveSources.map(s => `<div class="source-item"><strong>${s.name}</strong><span>${s.kind}</span><span>En attente</span></div>` ).join(""); renderSourceDiagnostic(); return; } els.sourceGrid.innerHTML = state.sourceStatus.map(s => `<div class="source-item ${s.status === "OK" ? "ok" : s.status === "BACKEND" ? "warn" : "fail"}"> <strong>${s.name}</strong> <span>${s.kind}</span> <span>${s.status}${s.ms ? ` · ${s.ms} ms` : ""}</span> <span>${escapeHtml(s.detail || "")}</span> </div>` ).join(""); renderSourceDiagnostic();
} function atlasMarketTone() { if (!state.liveOk || !state.coins.length) return { label: "En attente", mode: "wait" }; const btc = state.coins.find(c => c.id === "bitcoin" || c.symbol === "BTC"); const eth = state.coins.find(c => c.id === "ethereum" || c.symbol === "ETH"); const avgTop = state.coins.slice(0, 10).reduce((s, c) => s + (Number(c.change24h) || 0), 0) / Math.max(1, Math.min(10, state.coins.length)); const btcMove = Number(btc?.change24h) || 0; const ethMove = Number(eth?.change24h) || 0; const momentum = (avgTop + btcMove + ethMove) / 3; if (momentum >= 4) return { label: "Marché très positif, risque FOMO élevé", mode: "hot" }; if (momentum >= 1) return { label: "Marché positif, observation active", mode: "ok" }; if (momentum <= -3) return { label: "Marché sous pression, prudence renforcée", mode: "cold" }; return { label: "Marché neutre à surveiller", mode: "calm" };
} function atlasTopSymbols(list, limit = 4) { return list.slice(0, limit).map(c => `${c.symbol} ${fmtPct(c.change24h)}`).join(" · ");
} function atlasDecisionBriefText() {
  if (!state.liveOk || !state.coins.length || !state.sourceLock?.valid) return "ATLAS DECISION BRIEF\nSource Lock CoinGecko requis. Aucun score ni conclusion avec une source mélangée.";
  const tone = atlasMarketTone();
  const nonStable = state.coins.filter(c => classifyAsset(c) !== "Stablecoin" && typeof c.change24h === "number");
  const hot = nonStable.slice().sort((a, b) => b.change24h - a.change24h).filter(c => c.change24h > 3);
  const cold = nonStable.slice().sort((a, b) => a.change24h - b.change24h).filter(c => c.change24h < -3);
  const hotText = hot.length ? atlasTopSymbols(hot, 5) : "aucun mouvement haussier majeur";
  const coldText = cold.length ? atlasTopSymbols(cold, 4) : "aucun décrochage majeur dans le top chargé";
  return [
    "ATLAS DECISION BRIEF",
    `État : ${tone.label}.`,
    `Source Lock : CoinGecko · ${state.sourceLock.mode} · snapshot ${new Date(state.timestamp).toLocaleString("fr-FR")}.`,
    "Prix EUR et USD : fournis directement par CoinGecko, sans conversion fixe.",
    "Graphique : CoinGecko market_chart EUR uniquement ; aucune courbe CoinLore, mémoire ou sparkline reconstruite.",
    `À observer : ${hotText}.`,
    `À protéger : ${coldText}.`,
    "Décision de travail : observer / comparer. Pas d’achat automatique, pas de FOMO, pas d’ordre réel."
  ].join("\n");
}
function renderTrustLock(live = false) {
  if (!els.trustLockText) return;
  const locked = !!live && !!state.sourceLock?.valid;
  els.trustLockText.classList.toggle("ok-lock", locked);
  els.trustLockText.classList.toggle("warn-lock", !locked);
  if (locked) {
    els.trustLockText.textContent = `SOURCE CANONIQUE · CoinGecko uniquement. Marché : ${state.dataBroker.market?.mode || state.sourceLock.mode}. ` +
      "Prix EUR et USD fournis directement par CoinGecko ; aucune conversion fixe. " +
      "Les sources secondaires servent au diagnostic, jamais au calcul des prix, du score, de la simulation ou du graphique. " +
      "En cas de panne, le dernier snapshot CoinGecko daté est conservé.";
  } else {
    els.trustLockText.textContent = "Source canonique CoinGecko absente : prix, score Atlas et simulation bloqués. Les autres sources ne remplacent pas CoinGecko.";
  }
}
function renderColdRead(live = false) { renderTrustLock(live); if (!els.coldRead) return; const box = els.coldRead.closest(".cold-read"); if (box) { box.classList.toggle("live", live); box.classList.toggle("offline", !live); } if (live) { els.coldRead.textContent = atlasDecisionBriefText(); } else { els.coldRead.textContent = "ATLAS DECISION BRIEFLivecheck absent. L’observatoire refuse d’afficher un tableau chiffré et ne donne aucune lecture de marché."; }
} function analyzeNews() { const text = els.newsInput?.value.trim() || ""; if (!text) { setText(els.newsOutput, "Colle une actualité à classifier."); return; } const lower = text.toLowerCase(); const isRumor = /rumeur|serait|peut-être|insider|leak|telegram|x\.com|twitter/.test(lower); const isCritical = /hack|exploit|bridge|faillite|sec|amf|delisting|suspension|procès|attaque/.test(lower); const isListing = /listing|listé|binance|coinbase|kraken/.test(lower); const type = isRumor ? "rumeur / non confirmé" : isCritical ? "information critique potentielle" : isListing ? "catalyseur listing potentiel" : "information à qualifier"; const score = isCritical ? 78 : isListing ? 64 : isRumor ? 36 : 48; setText( els.newsOutput, `NEWS SENTINEL\n\nType : ${type}\nScore News Impact : ${score}/100\nDécision : ${score >= 60 ? "analyse approfondie" : "veille"}\n\nRègle : ce score déclenche une vérification, pas une position.\nSources à vérifier : source primaire, communiqué officiel, source secondaire fiable, réaction marché, risque de manipulation.` );
} function analyzeFomo() { const text = els.fomoInput?.value.trim() || ""; if (!text) { setText(els.fomoOutput, "Écris ce qui déclenche la FOMO."); return; } const hasBigMove = /\+\s?\d{2,}|explos|pump|rate|raté|peur|vite|maintenant/i.test(text); setText( els.fomoOutput, `MODE NO-FOMO\n\nSignal émotionnel : ${hasBigMove ? "élevé" : "à vérifier"}\nDécision : position théorique interdite tant que l’analyse froide n’est pas faite.\n\nQuestions :\n1. La hausse est-elle déjà pricée ?\n2. Qui vend si tu entres maintenant ?\n3. Quelle source primaire confirme le signal ?\n4. Où est l’invalidation ?\n5. La perte maximale est-elle acceptée ?\n\nConclusion : une occasion ratée ne coûte rien. Une mauvaise position peut coûter très cher.` );
} const WATCH_STORAGE_KEY = "agent_crypto_erith_ia_watchlist_v2_alpha_26_8"; const ATLAS_WATCH_BASKETS = [ { key: "core", label: "Socle marché", role: "Repères marché.", ids: ["bitcoin", "ethereum", "solana", "binancecoin", "ripple"] }, { key: "liquidity", label: "Stablecoins / liquidité", role: "Flux et stabilité.", ids: ["tether", "usd-coin", "usds"] }, { key: "majors", label: "Grands actifs solides", role: "Grandes capitalisations.", ids: ["cardano", "tron", "dogecoin", "chainlink", "toncoin", "avalanche-2", "polkadot", "litecoin"] }, { key: "defi", label: "DeFi / oracles / RWA", role: "Infrastructure et tokenisation.", ids: ["chainlink", "uniswap", "aave", "ondo-finance", "maker", "pendle"] }, { key: "ai", label: "IA / compute / data", role: "Narratif IA et calcul.", ids: ["near", "bittensor", "render-token", "internet-computer"] }, { key: "l1l2", label: "Layer 1 / Layer 2", role: "Écosystèmes et scalabilité.", ids: ["sui", "aptos", "arbitrum", "optimism", "polygon-ecosystem-token"] }, { key: "speculative", label: "Spéculatif liquide", role: "Température du risque.", ids: ["dogecoin", "shiba-inu", "pepe"] }, { key: "privacy", label: "Privacy / risque réglementaire", role: "Flux atypiques.", ids: ["monero", "zcash"] }
]; const WATCH_ALIAS = { btc: "bitcoin", bitcoin: "bitcoin", eth: "ethereum", ethereum: "ethereum", sol: "solana", solana: "solana", bnb: "binancecoin", binance: "binancecoin", binancecoin: "binancecoin", xrp: "ripple", ripple: "ripple", usdt: "tether", tether: "tether", usdc: "usd-coin", "usd-coin": "usd-coin", usds: "usds", dai: "dai", ada: "cardano", cardano: "cardano", trx: "tron", tron: "tron", doge: "dogecoin", dogecoin: "dogecoin", link: "chainlink", chainlink: "chainlink", ton: "toncoin", toncoin: "toncoin", avax: "avalanche-2", avalanche: "avalanche-2", dot: "polkadot", polkadot: "polkadot", ltc: "litecoin", litecoin: "litecoin", uni: "uniswap", uniswap: "uniswap", aave: "aave", ondo: "ondo-finance", "ondo-finance": "ondo-finance", mkr: "maker", maker: "maker", sky: "maker", pendle: "pendle", near: "near", tao: "bittensor", bittensor: "bittensor", render: "render-token", rndr: "render-token", "render-token": "render-token", icp: "internet-computer", "internet-computer": "internet-computer", sui: "sui", apt: "aptos", aptos: "aptos", arb: "arbitrum", arbitrum: "arbitrum", op: "optimism", optimism: "optimism", pol: "polygon-ecosystem-token", matic: "polygon-ecosystem-token", polygon: "polygon-ecosystem-token", shib: "shiba-inu", "shiba-inu": "shiba-inu", pepe: "pepe", xmr: "monero", monero: "monero", zec: "zcash", zcash: "zcash"
}; function atlasWatchDefaultIds() { return [...new Set(ATLAS_WATCH_BASKETS.flatMap(b => b.ids))];
} function normalizeWatchId(value) { const raw = String(value || "").trim().toLowerCase(); if (!raw) return ""; return WATCH_ALIAS[raw] || raw.replace(/\s+/g, "-");
} function saveWatchIds() { try { localStorage.setItem(WATCH_STORAGE_KEY, JSON.stringify(state.watchIds)); } catch {}
} function loadWatchIds() { try { const raw = localStorage.getItem(WATCH_STORAGE_KEY); const parsed = raw ? JSON.parse(raw) : null; if (Array.isArray(parsed) && parsed.length >= 12) { state.watchIds = [...new Set(parsed.map(normalizeWatchId).filter(Boolean))].slice(0, 48); return; } } catch {} state.watchIds = atlasWatchDefaultIds(); saveWatchIds();
} function addWatch() { const id = normalizeWatchId(els.watchInput?.value); if (!id) return; if (!state.watchIds.includes(id)) state.watchIds.push(id); state.watchIds = [...new Set(state.watchIds)].slice(0, 48); saveWatchIds(); if (els.watchInput) els.watchInput.value = ""; renderWatchlist(); renderAutoReader();
} function seedWatch() { state.watchIds = atlasWatchDefaultIds(); saveWatchIds(); renderWatchlist(); renderAutoReader();
} function watchCoinById(id) { return state.coins.find(c => c.id === id) || null;
} function watchBasketCoins(basket) { return basket.ids.map(watchCoinById).filter(Boolean);
} function basketStatus(coins) { if (!coins.length) return { label: "À charger", mode: "wait", avg: null }; const avg = coins.reduce((s, c) => s + (Number(c.change24h) || 0), 0) / coins.length; const mode = avg > 3 ? "hot" : avg < -3 ? "cold" : "calm"; const label = mode === "hot" ? "En hausse" : mode === "cold" ? "Sous pression" : "Calme"; return { label, mode, avg };
} function publicMarketSnapshot() { const wanted = SIM_PROFILE.allowedSymbols; const coins = state.coins .filter(c => wanted.includes(String(c.symbol || "").toUpperCase())) .map(c => ({ id: c.id, symbol: String(c.symbol || "").toUpperCase(), name: c.name, price_eur: c.price, change_24h_pct: c.change24h, change_7d_pct: c.change7d, market_cap_eur: c.marketCap, volume_24h_eur: c.volume, source: state.mainSource?.name || "source live" })); return { generated_at: new Date().toISOString(), source: state.mainSource?.name || null, source_time: state.timestamp || null, live_ok: !!state.liveOk, public_only: true, assets: coins };
} function simulationDataSnapshot() { if (!state.sim) loadSimulation(); const totals = getSimulationTotals(); return { generated_at: new Date().toISOString(), version: "V1.1-alpha.26.35", public_only: true, warning: "Données publiques et simulation locale uniquement. Aucun compte réel, aucune clé API, aucun wallet.", profile: getSimulationProfileStatus(), simulation: simulationPayload(), totals: { cash_eur: state.sim.cash, positions_value_eur: totals.positionsValue, total_value_eur: totals.total, pnl_eur: totals.pnl }, market_snapshot: publicMarketSnapshot() };
} function learningFactsFromLogs() { if (!state.sim) loadSimulation(); const logs = state.sim.logs || []; const hasBuy = logs.some(l => l.type === "SIM_BUY"); const hasSell = logs.some(l => l.type === "SIM_SELL"); const hasTooBig = logs.some(l => String(l.message || "").includes("maximum par opération")); const hasForbidden = logs.some(l => String(l.message || "").includes("refusé. Autorisés")); const hasReserve = logs.some(l => String(l.message || "").includes("réserve minimale")); const hasLivecheckRefusal = logs.some(l => String(l.message || "").includes("Livecheck requis")); const facts = []; if (hasBuy) facts.push("Tu as testé au moins un achat simulé : l’app sait transformer un montant virtuel en position fictive."); if (hasSell) facts.push("Tu as testé une vente simulée : l’app sait réduire une position fictive."); if (hasTooBig) facts.push("Tu as déclenché la protection “montant trop gros” : le profil bloque toute opération au-dessus de 10 €."); if (hasForbidden) facts.push("Tu as déclenché la protection “crypto non autorisée” : le profil débutant reste limité à BTC / ETH / SOL."); if (hasReserve) facts.push("Tu as déclenché la protection “réserve minimale” : l’app empêche de dépasser 30 € exposés."); if (hasLivecheckRefusal) facts.push("Tu as vérifié la règle “pas de prix inventé” : le simulateur exige Livecheck avant d’agir."); if (!facts.length) { facts.push("Aucun test pédagogique important n’est encore enregistré. Lance les boutons du Mode École guidé pour générer une vraie mémoire."); } return facts;
} function positionLinesForMarkdown() { if (!state.sim) loadSimulation(); const positions = Object.keys(state.sim.positions || {}); if (!positions.length) return ["Aucune position simulée."]; return positions.map(sym => { const pos = state.sim.positions[sym]; const value = getPositionValue(sym); return `- ${sym} : ${fmtEUR.format(value)} simulés, quantité fictive ${Number(pos.qty || 0).toFixed(8)}.`; });
} function marketLinesForMarkdown() { const snap = publicMarketSnapshot(); if (!snap.live_ok || !snap.assets.length) { return ["Livecheck non disponible dans le résumé courant."]; } return snap.assets.map(asset => { const price = Number.isFinite(asset.price_eur) ? fmtEUR.format(asset.price_eur) : "prix manquant"; const ch24 = typeof asset.change_24h_pct === "number" ? `${asset.change_24h_pct >= 0 ? "+" : ""}${asset.change_24h_pct.toFixed(2)} %` : "variation manquante"; return `- ${asset.symbol} : ${price}, variation 24h ${ch24}.`; });
} function buildLearningJournalMarkdown() { if (!state.sim) loadSimulation(); const totals = getSimulationTotals(); const profile = getSimulationProfileStatus(); const facts = learningFactsFromLogs(); const lines = [ "# JOURNAL PÉDAGOGIQUE — Agent-Crypto @erith.IA", "", `Version : V1.1-alpha.26.35`, `Date locale : ${new Date().toISOString()}`, "", "## Statut sécurité", "", "- Simulation locale uniquement.", "- Aucun argent réel.", "- Aucune clé API.", "- Aucun wallet.", "- Aucun ordre réel.", "", "## Profil actif", "", `- Profil : ${profile.profile}`, `- Capital virtuel initial : ${fmtEUR.format(profile.start_cash_eur)}`, `- Ticket conseillé : ${fmtEUR.format(profile.default_amount_eur)}`, `- Maximum par opération : ${fmtEUR.format(profile.max_per_operation_eur)}`, `- Exposition maximale : ${fmtEUR.format(profile.max_exposure_eur)}`, `- Réserve minimale : ${fmtEUR.format(profile.min_reserve_eur)}`, `- Cryptos autorisées : ${profile.allowed_symbols.join(" / ")}`, "", "## Résumé de session", "", `- Capital virtuel restant : ${fmtEUR.format(state.sim.cash)}`, `- Valeur positions simulées : ${fmtEUR.format(totals.positionsValue)}`, `- Total simulé : ${fmtEUR.format(totals.total)}`, `- P/L virtuel : ${totals.pnl >= 0 ? "+" : ""}${fmtEUR.format(totals.pnl)}`, "", "## Positions simulées", "", ...positionLinesForMarkdown(), "", "## Ce que j’ai appris", "", ...facts.map(f => `- ${f}`), "", "## Snapshot marché public", "", ...marketLinesForMarkdown(), "", "## Conclusion pédagogique", "", "Le simulateur sert à apprendre les règles de prudence avant toute connexion réelle. Les refus sont normaux : ils prouvent que le profil protège le capital virtuel.", "", "## Prochaine étape possible", "", "Construire une mémoire locale sur PC Ryzen 7 avec historique de snapshots, journaux de simulation et scoring pédagogique, sans clé réelle au départ." ]; return lines.join("\n");
} function renderLearningSummary() { const text = buildLearningJournalMarkdown(); if (els.simLearningOutput) els.simLearningOutput.textContent = text; return text;
} function downloadTextFile(filename, mimeType, text) { const blob = new Blob([text], { type: `${mimeType};charset=utf-8` }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
} function downloadLearningJournal() { const stamp = new Date().toISOString().slice(0, 10); downloadTextFile(`agent_crypto_journal_pedagogique_${stamp}.md`, "text/markdown", buildLearningJournalMarkdown()); renderLearningSummary();
} function downloadSimulationJSON() { const stamp = new Date().toISOString().slice(0, 10); const data = simulationDataSnapshot(); downloadTextFile(`agent_crypto_data_snapshot_${stamp}.json`, "application/json", JSON.stringify(data, null, 2)); if (els.simLearningOutput) { els.simLearningOutput.textContent = [ "DATA SNAPSHOT JSON PRÊT", "", "Contenu :", "- profil 100 € ;", "- simulation locale ;", "- positions fictives ;", "- logs de simulation ;", "- snapshot public BTC / ETH / SOL si Livecheck est actif.", "", "Sécurité :", "- aucune clé API ;", "- aucun wallet ;", "- aucun compte réel ;", "- aucune donnée personnelle." ].join("\n"); }
} const COLLECTOR_STORAGE_KEY = "agent_crypto_erith_ia_collector_v1_1_alpha_13";
const COLLECTOR_MAX_RECORDS = 500; function readCollectorMemory() { try { const raw = localStorage.getItem(COLLECTOR_STORAGE_KEY); const parsed = raw ? JSON.parse(raw) : []; return Array.isArray(parsed) ? parsed : []; } catch { return []; }
} function writeCollectorMemory(records) { const safe = Array.isArray(records) ? records.slice(-COLLECTOR_MAX_RECORDS) : []; localStorage.setItem(COLLECTOR_STORAGE_KEY, JSON.stringify(safe)); renderCollectorStatus(); renderCollectionProgress(); return safe;
} function collectorRecordReasonFromLogs(logs) { const messages = (logs || []).map(l => String(l.message || "")).join(" | "); const reasons = []; if (messages.includes("maximum par opération")) reasons.push("montant_trop_gros"); if (messages.includes("refusé. Autorisés")) reasons.push("crypto_non_autorisee"); if (messages.includes("réserve minimale")) reasons.push("plafond_ou_reserve"); if ((logs || []).some(l => l.type === "SIM_BUY")) reasons.push("achat_simule"); if ((logs || []).some(l => l.type === "SIM_SELL")) reasons.push("vente_simulee"); return reasons.length ? reasons : ["observation"];
} function makeCollectorRecord() { const snapshot = simulationDataSnapshot(); const logs = snapshot?.simulation?.logs || []; const marketAssets = snapshot?.market_snapshot?.assets || []; return { id: `snapshot_${Date.now()}`, saved_at: new Date().toISOString(), version: "V1.1-alpha.26.35", public_only: true, source: snapshot?.market_snapshot?.source || "source live", live_ok: !!snapshot?.market_snapshot?.live_ok, symbols: marketAssets.map(a => a.symbol), learning_tags: collectorRecordReasonFromLogs(logs), snapshot };
} function renderCollectorStatus() { const records = readCollectorMemory(); if (els.collectorCount) { els.collectorCount.textContent = records.length === 1 ? "1 snapshot enregistré" : `${records.length} snapshots enregistrés`; } const last = records[records.length - 1]; if (els.collectorLast) { els.collectorLast.textContent = last?.saved_at ? new Date(last.saved_at).toLocaleString("fr-FR") : "Aucun"; }
} function collectorPreview(records) { if (!records.length) { return [ "Mémoire locale vide.", "", "Conseil :", "1. Lance Livecheck.", "2. Lance quelques tests guidés.", "3. Clique “Enregistrer snapshot maintenant”." ].join("\n"); } const last = records[records.length - 1]; const lines = [ "MÉMOIRE LOCALE — DATA COLLECTOR", "", `Snapshots enregistrés : ${records.length}`, `Dernier snapshot : ${new Date(last.saved_at).toLocaleString("fr-FR")}`, `Symboles : ${(last.symbols || []).join(" / ") || "—"}`, `Tags apprentissage : ${(last.learning_tags || []).join(", ")}`, "", "Derniers enregistrements :" ]; records.slice(-8).reverse().forEach((record, index) => { const totals = record?.snapshot?.totals || {}; const exposure = totals.positions_value_eur ?? record?.snapshot?.profile?.current_exposure_eur ?? 0; lines.push( `${index + 1}. ${new Date(record.saved_at).toLocaleString("fr-FR")} · exposé ${fmtEUR.format(Number(exposure) || 0)} · ${(record.learning_tags || []).join(", ")}` ); }); lines.push(""); lines.push("Sécurité : mémoire locale navigateur uniquement. Aucune clé, aucun wallet, aucun compte réel."); return lines.join("\n");
} function showCollectorMemory() { const records = readCollectorMemory(); renderCollectorStatus(); if (els.collectorOutput) els.collectorOutput.textContent = collectorPreview(records);
} function saveCollectorSnapshot() { const records = readCollectorMemory(); const record = makeCollectorRecord(); records.push(record); const saved = writeCollectorMemory(records); if (els.collectorOutput) { els.collectorOutput.textContent = [ "SNAPSHOT ENREGISTRÉ", "", `Heure : ${new Date(record.saved_at).toLocaleString("fr-FR")}`, `Mémoire locale : ${saved.length}/${COLLECTOR_MAX_RECORDS} snapshots`, `Symboles : ${(record.symbols || []).join(" / ") || "—"}`, `Tags : ${(record.learning_tags || []).join(", ")}`, "", "Ce snapshot contient :", "- profil 100 € ;", "- simulation locale ;", "- positions fictives ;", "- logs pédagogiques ;", "- données publiques BTC / ETH / SOL si Livecheck est actif.", "", "Il ne contient pas :", "- clé API ;", "- wallet ;", "- compte réel ;", "- seed phrase ;", "- ordre réel." ].join("\n"); }
} function downloadCollectorJSON() { const records = readCollectorMemory(); const payload = { exported_at: new Date().toISOString(), version: "V1.1-alpha.26.35", public_only: true, warning: "Export mémoire locale public-compatible. Aucun compte réel, aucune clé API, aucun wallet.", count: records.length, records }; downloadTextFile( `agent_crypto_collector_memory_${new Date().toISOString().slice(0, 10)}.json`, "application/json", JSON.stringify(payload, null, 2) ); showCollectorMemory();
} function downloadCollectorJSONL() { const records = readCollectorMemory(); const header = { exported_at: new Date().toISOString(), version: "V1.1-alpha.26.35", public_only: true, type: "agent_crypto_collector_memory_jsonl_header" }; const lines = [JSON.stringify(header), ...records.map(r => JSON.stringify(r))]; downloadTextFile( `agent_crypto_collector_memory_${new Date().toISOString().slice(0, 10)}.jsonl`, "application/x-ndjson", lines.join("\n") ); showCollectorMemory();
} function clearCollectorMemory() { localStorage.removeItem(COLLECTOR_STORAGE_KEY); renderCollectorStatus(); renderCollectionProgress(); if (els.collectorOutput) { els.collectorOutput.textContent = [ "MÉMOIRE LOCALE EFFACÉE", "", "Le Data Collector local est revenu à zéro.", "Cela ne touche pas GitHub.", "Cela ne touche aucun compte réel." ].join("\n"); }
} function safeNumber(value) { const n = Number(value); return Number.isFinite(n) ? n : null;
} function recordAssetsMap(record) { const assets = record?.snapshot?.market_snapshot?.assets || []; const map = {}; assets.forEach(asset => { const sym = String(asset.symbol || "").toUpperCase(); if (!sym) return; map[sym] = asset; }); return map;
} function pctChange(first, last) { const a = safeNumber(first); const b = safeNumber(last); if (a === null || b === null || a === 0) return null; return ((b - a) / a) * 100;
} function signedPct(value) { if (value === null || !Number.isFinite(value)) return "n/a"; return `${value >= 0 ? "+" : ""}${value.toFixed(2)} %`;
} function countLearningTags(records) { const counts = {}; records.forEach(record => { (record.learning_tags || []).forEach(tag => { counts[tag] = (counts[tag] || 0) + 1; }); }); return counts;
} function countRefusalTypes(records) { const counts = { montant_trop_gros: 0, crypto_non_autorisee: 0, plafond_ou_reserve: 0, livecheck_requis: 0, autres_refus: 0 }; records.forEach(record => { const logs = record?.snapshot?.simulation?.logs || []; logs.forEach(log => { const msg = String(log.message || ""); if (log.type !== "REFUS") return; if (msg.includes("maximum par opération")) counts.montant_trop_gros += 1; else if (msg.includes("refusé. Autorisés")) counts.crypto_non_autorisee += 1; else if (msg.includes("réserve minimale")) counts.plafond_ou_reserve += 1; else if (msg.includes("Livecheck requis")) counts.livecheck_requis += 1; else counts.autres_refus += 1; }); }); return counts;
} function memoryDominantTags(records) { const counts = countLearningTags(records); const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]); if (!entries.length) return "aucun tag dominant"; return entries.map(([tag, count]) => `${tag} (${count})`).join(", ");
} function memoryExplorerEmptyText() { return [ "MÉMOIRE VIDE", "", "Aucun snapshot à explorer.", "", "Procédure :", "1. Lance Livecheck.", "2. Lance un ou deux tests guidés.", "3. Clique “Enregistrer snapshot maintenant”.", "4. Reviens ici et clique “Lire mémoire”." ].join("\n");
} function exploreMemoryText(records = readCollectorMemory()) { if (!records.length) return memoryExplorerEmptyText(); const first = records[0]; const last = records[records.length - 1]; const lastTotals = last?.snapshot?.totals || {}; const lastProfile = last?.snapshot?.profile || {}; const refusalCounts = countRefusalTypes(records); const lines = [ "EXPLORATEUR DE MÉMOIRE LOCALE", "", `Snapshots enregistrés : ${records.length}`, `Premier snapshot : ${new Date(first.saved_at).toLocaleString("fr-FR")}`, `Dernier snapshot : ${new Date(last.saved_at).toLocaleString("fr-FR")}`, `Tags dominants : ${memoryDominantTags(records)}`, "", "Dernier état simulé :", `- Capital virtuel : ${fmtEUR.format(Number(lastTotals.cash_eur ?? lastProfile.cash_eur ?? 0))}`, `- Positions simulées : ${fmtEUR.format(Number(lastTotals.positions_value_eur ?? 0))}`, `- Total simulé : ${fmtEUR.format(Number(lastTotals.total_value_eur ?? 0))}`, `- P/L virtuel : ${fmtEUR.format(Number(lastTotals.pnl_eur ?? 0))}`, "", "Refus observés :", `- Montant trop gros : ${refusalCounts.montant_trop_gros}`, `- Crypto non autorisée : ${refusalCounts.crypto_non_autorisee}`, `- Plafond / réserve : ${refusalCounts.plafond_ou_reserve}`, `- Livecheck requis : ${refusalCounts.livecheck_requis}`, `- Autres refus : ${refusalCounts.autres_refus}`, "", "Lecture pédagogique :", memoryLearningConclusion(records) ]; return lines.join("\n");
} function compareMemoryText(records = readCollectorMemory()) { if (!records.length) return memoryExplorerEmptyText(); if (records.length === 1) { const one = records[0]; const assets = recordAssetsMap(one); const lines = [ "COMPARAISON IMPOSSIBLE POUR L’INSTANT", "", "Il y a seulement 1 snapshot.", "Il faut au moins 2 snapshots pour comparer une évolution.", "", "Snapshot actuel :" ]; SIM_PROFILE.allowedSymbols.forEach(sym => { const asset = assets[sym]; const price = asset?.price_eur; lines.push(`- ${sym} : ${Number.isFinite(price) ? fmtEUR.format(price) : "prix manquant"}`); }); lines.push(""); lines.push("Action : enregistre un autre snapshot plus tard, puis relance la comparaison."); return lines.join("\n"); } const first = records[0]; const last = records[records.length - 1]; const firstMap = recordAssetsMap(first); const lastMap = recordAssetsMap(last); const lines = [ "COMPARAISON PREMIER / DERNIER SNAPSHOT", "", `Premier : ${new Date(first.saved_at).toLocaleString("fr-FR")}`, `Dernier : ${new Date(last.saved_at).toLocaleString("fr-FR")}`, "", "Variations observées :" ]; SIM_PROFILE.allowedSymbols.forEach(sym => { const a = firstMap[sym]; const b = lastMap[sym]; const pa = safeNumber(a?.price_eur); const pb = safeNumber(b?.price_eur); const delta = pctChange(pa, pb); lines.push( `- ${sym} : ${pa !== null ? fmtEUR.format(pa) : "n/a"} → ${pb !== null ? fmtEUR.format(pb) : "n/a"} (${signedPct(delta)})` ); }); lines.push(""); lines.push("Lecture :"); lines.push(memoryMarketConclusion(firstMap, lastMap)); return lines.join("\n");
} function refusalSummaryText(records = readCollectorMemory()) { if (!records.length) return memoryExplorerEmptyText(); const counts = countRefusalTypes(records); const total = Object.values(counts).reduce((sum, n) => sum + n, 0); const lines = [ "RÉSUMÉ DES REFUS DE SÉCURITÉ", "", `Total refus observés : ${total}`, "", `- Montant trop gros : ${counts.montant_trop_gros}`, `- Crypto non autorisée : ${counts.crypto_non_autorisee}`, `- Plafond / réserve : ${counts.plafond_ou_reserve}`, `- Livecheck requis : ${counts.livecheck_requis}`, `- Autres refus : ${counts.autres_refus}`, "", "Interprétation :" ]; if (total === 0) { lines.push("Aucun refus enregistré. Il faut tester les protections pour vérifier que le profil débutant bloque bien les actions risquées."); } else { if (counts.montant_trop_gros) lines.push("- Tu testes la limite de montant : le profil bloque les opérations supérieures à 10 €."); if (counts.crypto_non_autorisee) lines.push("- Tu testes le périmètre crypto : le profil reste limité à BTC / ETH / SOL."); if (counts.plafond_ou_reserve) lines.push("- Tu testes la réserve : le profil protège les 70 € virtuels minimum."); if (counts.livecheck_requis) lines.push("- Tu as testé la règle anti-prix inventé : Livecheck doit être OK avant simulation."); } lines.push(""); lines.push("Conclusion : un refus n’est pas un échec de l’app. C’est une preuve que la règle de sécurité fonctionne."); return lines.join("\n");
} function memoryMarketConclusion(firstMap, lastMap) { const parts = []; SIM_PROFILE.allowedSymbols.forEach(sym => { const delta = pctChange(firstMap[sym]?.price_eur, lastMap[sym]?.price_eur); if (delta === null) return; if (delta > 1) parts.push(`${sym} monte nettement dans la mémoire courte.`); else if (delta < -1) parts.push(`${sym} baisse nettement dans la mémoire courte.`); else parts.push(`${sym} reste relativement stable dans la mémoire courte.`); }); if (!parts.length) return "Pas assez de prix exploitables pour conclure."; return parts.join("\n");
} function memoryLearningConclusion(records) { const tags = countLearningTags(records); const refusals = countRefusalTypes(records); const totalRefusals = Object.values(refusals).reduce((sum, n) => sum + n, 0); const hasExposure = records.some(record => Number(record?.snapshot?.totals?.positions_value_eur || 0) > 0); const lines = []; if (hasExposure) { lines.push("- La mémoire contient au moins une exposition simulée : le simulateur commence à enregistrer des scénarios."); } else { lines.push("- La mémoire contient surtout des tests de refus : c’est normal au début, on valide d’abord les sécurités."); } if (totalRefusals) { lines.push("- Les refus enregistrés montrent que le profil Solo Débutant protège le capital virtuel."); } if (tags.montant_trop_gros) { lines.push("- Le tag dominant “montant_trop_gros” indique que la règle de maximum 10 € est testée."); } if (tags.crypto_non_autorisee) { lines.push("- Le tag “crypto_non_autorisee” indique que le périmètre BTC / ETH / SOL est bien contrôlé."); } if (tags.plafond_ou_reserve) { lines.push("- Le tag “plafond_ou_reserve” indique que la réserve minimale de 70 € est protégée."); } lines.push("- Cette mémoire reste locale navigateur : elle prépare la future base Ryzen 7, sans donnée sensible."); return lines.join("\n");
} function buildMemoryReportMarkdown() { const records = readCollectorMemory(); const lines = [ "# RAPPORT MÉMOIRE LOCALE — Agent-Crypto @erith.IA", "", "Version : V1.1-alpha.26.35", `Date : ${new Date().toISOString()}`, "", "## Statut sécurité", "", "- Mémoire locale navigateur uniquement.", "- Données public-compatible.", "- Aucun compte réel.", "- Aucune clé API.", "- Aucun wallet.", "- Aucun ordre réel.", "", "## Lecture mémoire", "", exploreMemoryText(records), "", "## Comparaison premier / dernier", "", compareMemoryText(records), "", "## Refus de sécurité", "", refusalSummaryText(records), "", "## Conclusion", "", "L’explorateur transforme les snapshots en lecture pédagogique. La prochaine vraie étape sera de déplacer ce principe vers une base locale plus solide sur PC Ryzen 7." ]; return lines.join("\n");
} function renderMemoryExplorer(text) { if (els.memoryExplorerOutput) els.memoryExplorerOutput.textContent = text;
} function exploreMemory() { renderMemoryExplorer(exploreMemoryText()); setActionFeedback("info", "Mémoire lue", "L’Explorateur affiche les snapshots, tags et refus observés.", els.memoryExplorerOutput);
} function compareMemory() { renderMemoryExplorer(compareMemoryText()); setActionFeedback("info", "Comparaison affichée", "L’Explorateur compare le premier et le dernier snapshot quand il y en a au moins deux.", els.memoryExplorerOutput);
} function summarizeRefusals() { renderMemoryExplorer(refusalSummaryText()); setActionFeedback("info", "Refus résumés", "Les refus de sécurité sont comptés et expliqués.", els.memoryExplorerOutput);
} function downloadMemoryReport() { const stamp = new Date().toISOString().slice(0, 10); const report = buildMemoryReportMarkdown(); downloadTextFile(`agent_crypto_rapport_memoire_${stamp}.md`, "text/markdown", report); renderMemoryExplorer(report); setActionFeedback("ok", "Rapport téléchargé", "Le rapport mémoire .md est prêt.", els.memoryExplorerOutput);
} function setActionFeedback(kind, title, text, target = null) { const el = els.actionFeedback || document.getElementById("actionFeedback"); if (!el) return; el.classList.remove("ok", "warn", "info", "neutral", "feedback-flash"); el.classList.add(kind || "neutral"); el.innerHTML = `<b>${escapeHtml(title)}</b><span>${escapeHtml(text)}</span>`; void el.offsetWidth; el.classList.add("feedback-flash"); if (target?.scrollIntoView) { target.scrollIntoView({ behavior: "smooth", block: "center" }); }
} function flashPanel(panel) { if (!panel) return; panel.classList.remove("feedback-flash"); void panel.offsetWidth; panel.classList.add("feedback-flash");
} function buildWakePlanText() { const records = readCollectorMemory(); const count = records.length; const last = records[count - 1]; const lastLine = last?.saved_at ? new Date(last.saved_at).toLocaleString("fr-FR") : "Aucun snapshot"; return [ "# NOTE DE REPRISE — Agent-Crypto @erith.IA", "", "Version : V1.1-alpha.26.35", `Date : ${new Date().toISOString()}`, "", "## État validé avant pause", "", "- Simulateur-école Solo Débutant 100 €.", "- Mode École guidé.", "- Refus visibles.", "- Journal pédagogique.", "- Data Collector local.", "- Explorateur de mémoire.", "- Plan de collecte guidé.", "- Feedback visuel ajouté.", "", "## Mémoire locale", "", `- Snapshots enregistrés : ${count}`, `- Dernier snapshot : ${lastLine}`, "- Objectif conseillé : 3 snapshots", "", "## Reprise au réveil", "", "1. Ouvrir la page publique.", "2. Faire Ctrl + F5.", "3. Vérifier : GitHub Pack V1.1-alpha.26.35.", "4. Lancer Livecheck.", "5. Aller dans Simulation.", "6. Si la mémoire affiche 2/3, cliquer “3 · Snapshot plus tard”.", "7. Cliquer “Comparer premier / dernier”.", "8. Lire la conclusion de l’Explorateur.", "9. Exporter le rapport mémoire .md si besoin.", "", "## Suite produit après repos", "", "Préparer V1.2-local-plan : architecture backend local Ryzen 7.", "", "## Sécurité", "", "- Aucun argent réel.", "- Aucune clé API.", "- Aucun wallet.", "- Aucun compte exchange.", "- Aucun ordre réel.", "- Aucun trading automatique." ].join("\n");
} function showWakePlan() { const text = buildWakePlanText(); if (els.resumeAssistantOutput) els.resumeAssistantOutput.textContent = text; setActionFeedback("info", "Reprise affichée", "La note de reprise au réveil est prête dans le bloc Assistant de reprise.", els.resumeAssistantOutput);
} function downloadWakePlan() { const stamp = new Date().toISOString().slice(0, 10); const text = buildWakePlanText(); downloadTextFile(`agent_crypto_reprise_apres_pause_${stamp}.md`, "text/markdown", text); if (els.resumeAssistantOutput) els.resumeAssistantOutput.textContent = text; setActionFeedback("ok", "Reprise téléchargée", "Le fichier .md de reprise est prêt.", els.resumeAssistantOutput);
} function markPauseReady() { const records = readCollectorMemory(); const text = [ "PAUSE VALIDÉE", "", "État conseillé avant coupure :", "- Version : V1.1-alpha.26.35", `- Snapshots mémoire : ${records.length}`, "- Prochaine action : revenir plus tard, lancer Livecheck, créer le snapshot plus tard, comparer.", "", "Tu peux fermer sans perdre la mémoire locale tant que tu gardes le même navigateur et que tu n’effaces pas les données du site." ].join("\n"); if (els.resumeAssistantOutput) els.resumeAssistantOutput.textContent = text; setActionFeedback("ok", "Prêt pour pause", "Version de reprise préparée. Tu peux couper.", els.resumeAssistantOutput);
} function collectionCount() { return readCollectorMemory().length;
} function renderCollectionProgress() { const count = collectionCount(); const target = 3; const pct = Math.min(100, Math.round((count / target) * 100)); if (els.collectionProgressText) { els.collectionProgressText.textContent = `${Math.min(count, target)}/${target}`; } if (els.collectionProgressBar) { els.collectionProgressBar.style.width = `${pct}%`; } if (els.collectionProgressTitle) { if (count <= 0) els.collectionProgressTitle.textContent = "Objectif : créer un premier snapshot de référence"; else if (count === 1) els.collectionProgressTitle.textContent = "Objectif : ajouter un deuxième snapshot pour comparer"; else if (count === 2) els.collectionProgressTitle.textContent = "Objectif : ajouter un troisième snapshot pour stabiliser la lecture"; else els.collectionProgressTitle.textContent = "Objectif atteint : mémoire comparable"; }
} function collectionPlanText() { const count = collectionCount(); const records = readCollectorMemory(); const lines = [ "PLAN DE COLLECTE GUIDÉ", "", `Snapshots actuels : ${count}`, "", "Routine simple :", "1. Lancer Livecheck.", "2. Enregistrer un snapshot de référence.", "3. Lancer un test guidé : opération prudente ou refus.", "4. Enregistrer un snapshot après test.", "5. Revenir plus tard et enregistrer un troisième snapshot.", "6. Utiliser l’Explorateur pour comparer.", "", "Pourquoi 3 snapshots ?", "- 1 snapshot : on voit seulement un état.", "- 2 snapshots : on peut comparer premier / dernier.", "- 3 snapshots : on commence à voir une mini-tendance.", "", "État actuel :" ]; if (!count) { lines.push("- Aucun snapshot. Commence par “Snapshot de référence”."); } else { const last = records[records.length - 1]; lines.push(`- Dernier snapshot : ${new Date(last.saved_at).toLocaleString("fr-FR")}.`); lines.push(`- Tags : ${(last.learning_tags || []).join(", ") || "observation"}.`); if (count === 1) lines.push("- Prochaine action : créer un snapshot après test."); else if (count === 2) lines.push("- Prochaine action : créer un snapshot plus tard pour stabiliser la lecture."); else lines.push("- Tu peux maintenant utiliser “Comparer premier / dernier”."); } lines.push(""); lines.push("Sécurité : ces snapshots restent public-compatible, sans clé, sans wallet, sans compte réel."); return lines.join("\n");
} function saveCollectionSnapshot(kind) { const recordsBefore = collectionCount(); const record = makeCollectorRecord(); record.collection_kind = kind; record.collection_note = kind === "reference" ? "Snapshot de référence." : kind === "after_test" ? "Snapshot après test guidé." : "Snapshot plus tard pour comparaison."; const records = readCollectorMemory(); records.push(record); const saved = writeCollectorMemory(records); renderCollectionProgress(); const label = kind === "reference" ? "SNAPSHOT DE RÉFÉRENCE ENREGISTRÉ" : kind === "after_test" ? "SNAPSHOT APRÈS TEST ENREGISTRÉ" : "SNAPSHOT PLUS TARD ENREGISTRÉ"; const next = saved.length < 2 ? "Ajoute un snapshot après test pour pouvoir comparer." : saved.length < 3 ? "Tu peux déjà comparer. Un troisième snapshot donnera une lecture plus solide." : "Objectif 3 snapshots atteint : utilise l’Explorateur de mémoire."; if (els.collectionPlanOutput) { els.collectionPlanOutput.textContent = [ label, "", `Heure : ${new Date(record.saved_at).toLocaleString("fr-FR")}`, `Mémoire locale : ${saved.length}/500 snapshots`, `Progression objectif : ${Math.min(saved.length, 3)}/3`, `Type : ${record.collection_note}`, `Tags : ${(record.learning_tags || []).join(", ") || "observation"}`, "", next, "", "Rappel : aucun argent réel, aucune clé API, aucun wallet." ].join("\n"); } setActionFeedback("ok", "Snapshot enregistré", `Mémoire locale : ${saved.length}/3 pour la lecture guidée.`, els.collectionPlanOutput); if (recordsBefore === 0 && kind !== "reference") { if (els.collectionPlanOutput) { els.collectionPlanOutput.textContent += "\n\nNote : tu n’avais pas encore de référence. Ce snapshot servira quand même de premier point."; } }
} function buildCollectionPlanMarkdown() { const records = readCollectorMemory(); const lines = [ "# PLAN DE COLLECTE GUIDÉ — Agent-Crypto @erith.IA", "", "Version : V1.1-alpha.26.35", `Date : ${new Date().toISOString()}`, "", "## Objectif", "", "Construire une mémoire comparable avant le futur backend local Ryzen 7.", "", "## Règle", "", "- 1 snapshot : état isolé.", "- 2 snapshots : comparaison possible.", "- 3 snapshots : mini-tendance exploitable.", "", "## Routine", "", "1. Lancer Livecheck.", "2. Enregistrer un snapshot de référence.", "3. Lancer un test guidé.", "4. Enregistrer un snapshot après test.", "5. Revenir plus tard.", "6. Enregistrer un snapshot plus tard.", "7. Comparer premier / dernier dans l’Explorateur.", "", "## État actuel", "", `Snapshots enregistrés : ${records.length}`, "", ...records.slice(-10).map((record, index) => { const kind = record.collection_kind || "snapshot"; const tags = (record.learning_tags || []).join(", ") || "observation"; return `- ${index + 1}. ${new Date(record.saved_at).toLocaleString("fr-FR")} · ${kind} · ${tags}`; }), "", "## Sécurité", "", "- Données public-compatible.", "- Aucun compte réel.", "- Aucune clé API.", "- Aucun wallet.", "- Aucun ordre réel.", "", "## Suite", "", "Quand la logique de collecte est claire, migrer vers une base locale plus solide : JSONL durable ou SQLite sur PC Ryzen 7." ]; return lines.join("\n");
} function showCollectionChecklist() { renderCollectionProgress(); const text = collectionPlanText(); if (els.collectionPlanOutput) els.collectionPlanOutput.textContent = text; flashPanel(document.getElementById("collectionPlanPanel")); setActionFeedback("info", "Routine de collecte affichée", "Lis le bloc Plan de collecte guidé : il indique la prochaine action et l’objectif 3 snapshots.", els.collectionPlanOutput);
} function downloadCollectionPlan() { const stamp = new Date().toISOString().slice(0, 10); const text = buildCollectionPlanMarkdown(); downloadTextFile(`agent_crypto_plan_collecte_${stamp}.md`, "text/markdown", text); if (els.collectionPlanOutput) els.collectionPlanOutput.textContent = text;
} function setSimManualFields(symbol, amount) { if (els.simSymbol) els.simSymbol.value = symbol; if (els.simAmount) els.simAmount.value = String(amount);
} function renderSchoolResult(kind, title, text, bullets = []) { const el = els.schoolResult || document.getElementById("schoolResult"); if (!el) return; el.classList.remove("ok", "refusal", "err", "neutral"); el.classList.add(kind || "neutral"); const items = bullets.map(item => `<li>${escapeHtml(item)}</li>`).join(""); el.innerHTML = ` <b>${escapeHtml(title)}</b> <p>${escapeHtml(text)}</p> <ul>${items}</ul> `;
} function schoolNeedsLivecheck() { if (state.liveOk && state.coins.length) return false; renderSchoolResult("err", "Livecheck requis", "Clique d’abord sur Lancer Livecheck. Le simulateur refuse de travailler sans prix réel chargé.", [ "Aucun prix n’est inventé.", "Aucun test n’est lancé tant que la source marché n’est pas prête.", "Après Livecheck OK, recommence le test guidé." ]); return true;
} function runSchoolTest(testName) { if (testName === "reset_100") { resetSimulation(); setSimManualFields("BTC", SIM_PROFILE.defaultAmount); renderCommandOutput(commandOk("reset_sim", simulationPayload())); renderSchoolResult("neutral", "Simulateur remis à 100 €", "Tu repars d’un portefeuille virtuel propre.", [ "Capital virtuel : 100 €.", "Position : 0 €.", "Tu peux lancer le test 1." ]); return; } if (schoolNeedsLivecheck()) return; let result = null; if (testName === "safe_btc_5") { resetSimulation(); setSimManualFields("BTC", 5); result = simulateOrder("buy", "BTC", 5); renderCommandOutput(result); renderSchoolResult(result?.ok ? "ok" : "err", result?.ok ? "Accepté : opération prudente" : "Erreur inattendue", result?.ok ? "BTC 5 € est accepté parce que le ticket conseillé est de 5 € et le maximum est de 10 €." : (result?.error || "Le test n’a pas donné le résultat attendu."), result?.ok ? [ "Tu as investi 5 € virtuels.", "Il reste 95 € virtuels.", "Ce test apprend la notion de petite opération contrôlée." ] : [ "Aucun argent réel.", "Regarde le journal pour le détail." ]); return; } if (testName === "too_big_btc_50") { resetSimulation(); setSimManualFields("BTC", 50); result = simulateOrder("buy", "BTC", 50); renderCommandOutput(result); renderSchoolResult(result?.ok === false ? "refusal" : "err", result?.ok === false ? "Refus normal : opération trop grosse" : "Erreur : ce test aurait dû être refusé", result?.ok === false ? "Tu as demandé 50 €, mais le profil débutant limite chaque opération à 10 €." : "Le test n’a pas respecté la règle attendue.", result?.ok === false ? [ "Le refus protège ton capital virtuel.", "Aucun ordre réel n’a été envoyé.", "La règle apprise : ne pas mettre trop gros d’un coup." ] : [ "Ce test doit être revu." ]); return; } if (testName === "forbidden_doge_5") { resetSimulation(); setSimManualFields("DOGE", 5); result = simulateOrder("buy", "DOGE", 5); renderCommandOutput(result); renderSchoolResult(result?.ok === false ? "refusal" : "err", result?.ok === false ? "Refus normal : crypto non autorisée" : "Erreur : DOGE aurait dû être refusé", result?.ok === false ? "Le profil débutant autorise seulement BTC, ETH et SOL. DOGE est volontairement bloqué dans cette phase." : "Le test n’a pas respecté la règle attendue.", result?.ok === false ? [ "Tu apprends à limiter le périmètre.", "Moins d’actifs = moins de confusion au début.", "Les autres cryptos pourront être surveillées plus tard, pas utilisées en simulation débutant." ] : [ "Ce test doit être revu." ]); return; } if (testName === "fill_ceiling") { resetSimulation(); setSimManualFields("SOL", 10); const r1 = simulateOrder("buy", "BTC", 10); const r2 = simulateOrder("buy", "ETH", 10); const r3 = simulateOrder("buy", "SOL", 10); renderCommandOutput(r3); const ok = r1?.ok && r2?.ok && r3?.ok; renderSchoolResult(ok ? "ok" : "err", ok ? "Plafond rempli : 30 € exposés" : "Erreur pendant le remplissage du plafond", ok ? "Le simulateur a placé 10 € virtuels sur BTC, 10 € sur ETH et 10 € sur SOL." : "Une des trois opérations n’a pas été acceptée.", ok ? [ "Capital restant : environ 70 €.", "Exposition virtuelle : environ 30 €.", "Le profil débutant a atteint son plafond de sécurité." ] : [ r1?.error || "BTC : état inconnu.", r2?.error || "ETH : état inconnu.", r3?.error || "SOL : état inconnu." ]); return; } if (testName === "exceed_ceiling") { resetSimulation(); simulateOrder("buy", "BTC", 10); simulateOrder("buy", "ETH", 10); simulateOrder("buy", "SOL", 10); setSimManualFields("BTC", 5); result = simulateOrder("buy", "BTC", 5); renderCommandOutput(result); renderSchoolResult(result?.ok === false ? "refusal" : "err", result?.ok === false ? "Refus normal : plafond déjà atteint" : "Erreur : le dépassement aurait dû être refusé", result?.ok === false ? "Après 30 € virtuels exposés, l’app bloque tout nouvel achat simulé." : "Le simulateur n’a pas bloqué le dépassement.", result?.ok === false ? [ "Exposition maximale du profil : 30 €.", "Réserve minimale conservée : 70 €.", "La règle apprise : ne pas tout exposer, même en simulation." ] : [ "Ce test doit être revu." ]); return; }
} /* ========================================================= V1.1-alpha.26.35 — Atlas Auto Reader Ouverture page -> Livecheck auto -> snapshots -> lecture marché. ========================================================= */ const AUTO_MEMORY_KEY = "agent_crypto_erith_ia_auto_reader_v1_1_alpha_13";
const AUTO_MAX_RECORDS = 3000; function readAutoMemory() { try { const raw = localStorage.getItem(AUTO_MEMORY_KEY); const parsed = raw ? JSON.parse(raw) : []; return Array.isArray(parsed) ? parsed : []; } catch { return []; }
} function writeAutoMemory(records) { let safe = Array.isArray(records) ? records.slice(-AUTO_MAX_RECORDS) : []; try { localStorage.setItem(AUTO_MEMORY_KEY, JSON.stringify(safe)); } catch { safe = safe.slice(Math.floor(safe.length / 2)); try { localStorage.setItem(AUTO_MEMORY_KEY, JSON.stringify(safe)); } catch {} } return safe;
} function compactCoinForAuto(c) { const s = scoreCoin(c); return { id: c.id, symbol: String(c.symbol || "").toUpperCase(), name: c.name, rank: c.rank ?? null, price_eur: c.price ?? null, change_24h_pct: c.change24h ?? null, change_7d_pct: c.change7d ?? null, market_cap_eur: c.marketCap ?? null, volume_24h_eur: c.volume24h ?? null, category: classifyAsset(c), action: atlasActionForCoin(c), score: s.score, source: c.source || state.mainSource || null };
} function makeAutoSnapshot() { const collectorId = getCollectorId(); const wanted = new Set(state.watchIds || []); const watch = state.coins.filter(c => wanted.has(c.id)); const leaders = state.coins.slice(0, 20); const merged = [...leaders, ...watch].filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i); const created = new Date().toISOString(); return { id: `${collectorId}_${created.replace(/[:.]/g, "-")}`, snapshot_id: `${collectorId}_${created.replace(/[:.]/g, "-")}`, collector_id: collectorId, collector_type: "local_browser", saved_at: created, version: "V1.1-alpha.26.35", source: state.mainSource || null, source_time: state.timestamp || null, live_ok: !!state.liveOk, cadence_ms: state.auto?.intervalMs || 60000, global: { market_cap_eur: state.global?.total_market_cap?.eur ?? null, volume_24h_eur: state.global?.total_volume?.eur ?? null, btc_dominance_pct: state.global?.market_cap_percentage?.btc ?? null }, assets: merged.map(compactCoinForAuto) };
} function lastAutoSnapshot() { const records = readAutoMemory(); return records.length ? records[records.length - 1] : null;
} function saveAutoSnapshot() { if (!state.liveOk || !state.coins.length) return null; const records = readAutoMemory(); const snapshot = makeAutoSnapshot(); records.push(snapshot); const saved = writeAutoMemory(records); return saved[saved.length - 1] || snapshot;
} function findAutoAsset(snapshot, idOrSymbol) { if (!snapshot || !Array.isArray(snapshot.assets)) return null; const q = String(idOrSymbol || "").toUpperCase(); return snapshot.assets.find(a => String(a.id || "").toUpperCase() === q || String(a.symbol || "").toUpperCase() === q) || null;
} function priceDeltaPct(nowAsset, prevAsset) { const a = Number(nowAsset?.price_eur); const b = Number(prevAsset?.price_eur); if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return null; return ((a - b) / b) * 100;
} function autoMarketPulse(snapshot = null, previous = null) { const snap = snapshot || makeAutoSnapshot(); const assets = snap.assets || []; if (!assets.length) return { label: "En attente", mode: "wait", lines: ["Aucune donnée marché exploitable."] }; const btc = assets.find(a => a.symbol === "BTC"); const eth = assets.find(a => a.symbol === "ETH"); const watchAssets = assets.filter(a => (state.watchIds || []).includes(a.id)); const strongest = [...assets].filter(a => typeof a.change_24h_pct === "number").sort((a, b) => b.change_24h_pct - a.change_24h_pct).slice(0, 3); const weakest = [...assets].filter(a => typeof a.change_24h_pct === "number").sort((a, b) => a.change_24h_pct - b.change_24h_pct).slice(0, 3); const maxMove = Math.max(...assets.map(a => Math.abs(Number(a.change_24h_pct) || 0)), 0); const btcMove = Number(btc?.change_24h_pct || 0); const ethMove = Number(eth?.change_24h_pct || 0); let label = "Marché calme"; let mode = "ok"; if (maxMove >= 12) { label = "Marché nerveux"; mode = "warn"; } if (btcMove > 2 && ethMove > 1) { label = "Marché positif"; mode = "ok"; } if (btcMove < -2 && ethMove < -1) { label = "Marché sous pression"; mode = "warn"; } const deltaLines = []; if (previous) { for (const a of watchAssets.slice(0, 6)) { const prev = findAutoAsset(previous, a.id); const delta = priceDeltaPct(a, prev); if (typeof delta === "number" && Math.abs(delta) >= 0.15) { deltaLines.push(`${a.symbol} ${delta >= 0 ? "monte" : "baisse"} depuis le dernier relevé : ${delta >= 0 ? "+" : ""}${delta.toFixed(2)} %`); } } } const lines = [ `État : ${label}.`, btc ? `BTC : ${btc.change_24h_pct >= 0 ? "+" : ""}${Number(btc.change_24h_pct || 0).toFixed(2)} % sur 24h · catégorie ${btc.category}.` : "BTC non chargé.", eth ? `ETH : ${eth.change_24h_pct >= 0 ? "+" : ""}${Number(eth.change_24h_pct || 0).toFixed(2)} % sur 24h · catégorie ${eth.category}.` : "ETH non chargé.", `Hausse 24h : ${strongest.map(a => `${a.symbol} ${Number(a.change_24h_pct).toFixed(2)} %`).join(" · ") || "—"}.`, `Baisse 24h : ${weakest.map(a => `${a.symbol} ${Number(a.change_24h_pct).toFixed(2)} %`).join(" · ") || "—"}.`, ...deltaLines.slice(0, 4) ]; return { label, mode, lines, maxMove };
} function chooseAutoIntervalMs(snapshot, previous) { const manual = state.auto?.cadence; if (manual === "30") return 30000; if (manual === "60") return 60000; if (manual === "300") return 300000; const pulse = autoMarketPulse(snapshot, previous); if (pulse.maxMove >= 10) return 30000; if (snapshot && previous) { const watch = (snapshot.assets || []).filter(a => (state.watchIds || []).includes(a.id)); const deltas = watch.map(a => priceDeltaPct(a, findAutoAsset(previous, a.id))).filter(v => typeof v === "number"); const maxDelta = Math.max(...deltas.map(v => Math.abs(v)), 0); if (maxDelta >= 0.75) return 30000; if (maxDelta < 0.10 && pulse.maxMove < 2) return 300000; } return 60000;
} function formatAutoDelay(ms) { const sec = Math.max(0, Math.round(ms / 1000)); if (sec >= 60) { const min = Math.floor(sec / 60); const rest = sec % 60; return rest ? `${min} min ${rest} s` : `${min} min`; } return `${sec} s`;
} function renderAutoReader(snapshot = null, previous = null) { const records = readAutoMemory(); const last = snapshot || records[records.length - 1] || null; const pulse = last ? autoMarketPulse(last, previous || records[records.length - 2] || null) : { label: "En attente", mode: "wait", lines: ["Atlas attend la première lecture."] }; if (els.autoModeStatus) { els.autoModeStatus.textContent = state.auto?.enabled ? "Auto ON" : "Auto OFF"; els.autoModeStatus.className = `pill ${state.auto?.enabled ? "ok" : "warn"}`; } if (els.btnAutoToggle) els.btnAutoToggle.textContent = state.auto?.enabled ? "Auto ON" : "Auto OFF"; if (els.autoLastRead) els.autoLastRead.textContent = last?.saved_at ? new Date(last.saved_at).toLocaleTimeString("fr-FR") : "En attente"; if (els.autoSnapshots) els.autoSnapshots.textContent = `${records.length}/${AUTO_MAX_RECORDS}`; if (els.autoActiveCadence) els.autoActiveCadence.textContent = formatAutoDelay(state.auto?.intervalMs || 60000); if (els.autoMarketPulse) els.autoMarketPulse.textContent = pulse.label; if (els.autoWatchStatus) els.autoWatchStatus.textContent = `Atlas V2 · ${(state.watchIds || []).length} actifs · ${ATLAS_WATCH_BASKETS.length} paniers`; if (els.autoReaderOutput) { const watchLines = last?.assets ? last.assets.filter(a => (state.watchIds || []).includes(a.id)).slice(0, 8).map(a => `${a.symbol} · ${a.category} · ${a.action} · 24h ${typeof a.change_24h_pct === "number" ? (a.change_24h_pct >= 0 ? "+" : "") + a.change_24h_pct.toFixed(2) + " %" : "—"}` ) : []; els.autoReaderOutput.textContent = [ "ATLAS AUTO READER — V1.1-alpha.26.35", "", state.auto?.enabled ? "Mode : collecte automatique active." : "Mode : collecte automatique désactivée.", `Snapshots enregistrés : ${records.length}`, last?.saved_at ? `Dernier relevé : ${new Date(last.saved_at).toLocaleString("fr-FR")}` : "Dernier relevé : en attente", "", "Lecture marché :", ...pulse.lines, "", "Watchlist :", ...(watchLines.length ? watchLines : ["BTC / ETH / SOL se rempliront après Livecheck."]), "", "Règle : Atlas observe, enregistre, compare et propose une action de travail. Achat/vente désactivés sur GitHub Pages." ].join("\n"); }
} function updateAutoCountdown() { if (!els.autoNextRead) return; if (!state.auto?.enabled) { els.autoNextRead.textContent = "Auto OFF"; return; } if (state.auto?.livecheckBusy) { els.autoNextRead.textContent = "Lecture en cours"; return; } if (!state.auto?.nextAt) { els.autoNextRead.textContent = "Préparation"; return; } els.autoNextRead.textContent = formatAutoDelay(new Date(state.auto.nextAt).getTime() - Date.now());
} function scheduleAutoRead(ms = null) { if (!state.auto?.enabled) return; if (state.auto.timer) clearTimeout(state.auto.timer); const delay = ms ?? state.auto.intervalMs ?? 60000; state.auto.nextAt = new Date(Date.now() + delay).toISOString(); updateAutoCountdown(); state.auto.timer = setTimeout(() => { state.auto.timer = null; if (state.auto?.enabled) refreshMarketOnly(); }, delay);
} function atlasAfterLivecheck() { if (!state.liveOk || !state.coins.length) { renderAutoReader(); if (state.auto?.enabled) scheduleAutoRead(60000); return; } const previous = lastAutoSnapshot(); const snapshot = saveAutoSnapshot(); state.auto.intervalMs = chooseAutoIntervalMs(snapshot, previous); renderAutoReader(snapshot, previous); if (state.auto?.enabled) scheduleAutoRead(state.auto.intervalMs);
} function startAutoReader() { state.auto.livecheckBusy = false; loadWatchIds(); if (els.autoCadenceSelect) state.auto.cadence = els.autoCadenceSelect.value || "adaptive"; renderAutoReader(); if (state.auto.countdownTimer) clearInterval(state.auto.countdownTimer); state.auto.countdownTimer = setInterval(updateAutoCountdown, 1000); if (state.auto.enabled) { setTimeout(() => runLivecheck(), 650); }
} function toggleAutoReader() { state.auto.enabled = !state.auto.enabled; if (!state.auto.enabled && state.auto.timer) { clearTimeout(state.auto.timer); state.auto.timer = null; state.auto.nextAt = null; } renderAutoReader(); updateAutoCountdown(); if (state.auto.enabled) scheduleAutoRead(1000);
} function setAutoCadence(value) { state.auto.cadence = String(value || "adaptive"); state.auto.intervalMs = state.auto.cadence === "30" ? 30000 : state.auto.cadence === "300" ? 300000 : 60000; renderAutoReader(); if (state.auto.enabled) scheduleAutoRead(1000);
} const COLLECTOR_ID_KEY = "agent_crypto_erith_ia_collector_id_v1";
const COLLECTOR_CONFIGURED_KEY = "agent_crypto_erith_ia_collector_configured_v1";
const COLLECTOR_MIGRATION_NOTE_KEY = "agent_crypto_erith_ia_collector_migration_note_v1";
const AUTO_LAST_IMPORT_KEY = "agent_crypto_erith_ia_last_import_v1";
const GITHUB_MEMORY_LATEST_URL = "../data/latest.json";
const GITHUB_MEMORY_STATUS_URL = "../data/status.json"; function cleanCollectorId(value) { return String(value || "") .trim() .toLowerCase() .normalize("NFD").replace(/[\u0300-\u036f]/g, "") .replace(/[^a-z0-9_-]+/g, "-") .replace(/^-+|-+$/g, "") .slice(0, 64);
} function defaultCollectorId() { const ua = navigator.userAgent || ""; const platform = navigator.platform || "browser"; const guess = /Android|Mobile/i.test(ua) ? "mobile" : /Win/i.test(platform) ? "windows" : "browser"; return `collector-${guess}-${Math.random().toString(36).slice(2, 8)}`;
} function isGeneratedCollectorId(id) { return /^collector-(windows|browser|mobile)-[a-z0-9]+$/i.test(String(id || ""));
} function isLegacyCollectorId(id) { const value = String(id || "").trim(); return !value || value === "local-legacy" || isGeneratedCollectorId(value);
} function isCollectorConfigured() { const stored = cleanCollectorId(localStorage.getItem(COLLECTOR_ID_KEY)); const flag = localStorage.getItem(COLLECTOR_CONFIGURED_KEY) === "1"; return !!stored && (flag || !isGeneratedCollectorId(stored));
} function getCollectorId() { let id = cleanCollectorId(localStorage.getItem(COLLECTOR_ID_KEY)); if (!id) { id = defaultCollectorId(); localStorage.setItem(COLLECTOR_ID_KEY, id); localStorage.setItem(COLLECTOR_CONFIGURED_KEY, "0"); } return id;
} function migrateLocalCollectorRecords(targetId, silent = false) { const id = cleanCollectorId(targetId || getCollectorId()); if (!id || isGeneratedCollectorId(id)) return { changed: 0, total: 0, collectors_before: [] }; const records = readAutoMemory(); const beforeCollectors = collectorStats(records).collectors; let changed = 0; const migrated = records.map(record => { if (!record || typeof record !== "object") return record; const current = record.collector_id || "local-legacy"; if (!isLegacyCollectorId(current)) return record; changed += 1; const saved = record.saved_at || new Date().toISOString(); const key = `${id}_${String(saved).replace(/[:.]/g, "-")}`; return { ...record, id: key, snapshot_id: key, collector_id: id, collector_type: record.collector_type || "local_browser", migrated_from_collector_id: current, migrated_at: new Date().toISOString() }; }); if (changed) { writeAutoMemory(normalizeSharedRecords(migrated, id)); } const note = changed ? `${new Date().toLocaleString("fr-FR")} · ${changed} anciens snapshots rattachés à ${id}` : `${new Date().toLocaleString("fr-FR")} · aucun ancien snapshot à migrer`; localStorage.setItem(COLLECTOR_MIGRATION_NOTE_KEY, note); if (!silent && els.sharedMemoryOutput) { els.sharedMemoryOutput.textContent = [ "ID COLLECTEUR SAUVÉ", "", `Machine configurée : ${id}`, `Anciens snapshots rattachés : ${changed}`, "", "Cette configuration est conservée dans Firefox.", "Tu n’as pas à refaire cette étape à chaque ouverture." ].join("\n"); } return { changed, total: records.length, collectors_before: beforeCollectors };
} function setCollectorId(value) { const id = cleanCollectorId(value); if (!id) return getCollectorId(); localStorage.setItem(COLLECTOR_ID_KEY, id); localStorage.setItem(COLLECTOR_CONFIGURED_KEY, "1"); migrateLocalCollectorRecords(id, false); return id;
} function normalizeSharedRecords(records, fallbackCollectorId = null) { const map = new Map(); const fallback = cleanCollectorId(fallbackCollectorId || getCollectorId()); for (const record of records || []) { if (!record || typeof record !== "object") continue; const existingCollector = record.collector_id || ""; const collector = existingCollector || fallback || "local-legacy"; const saved = record.saved_at || record.id || new Date().toISOString(); const key = record.snapshot_id || record.id || `${collector}_${String(saved).replace(/[:.]/g, "-")}`; map.set(key, { ...record, id: key, snapshot_id: key, collector_id: collector }); } return [...map.values()] .sort((a, b) => String(a.saved_at || "").localeCompare(String(b.saved_at || ""))) .slice(-AUTO_MAX_RECORDS);
} function collectorStats(records = readAutoMemory()) { const counts = {}; for (const r of records || []) { const id = r.collector_id || "local-legacy"; counts[id] = (counts[id] || 0) + 1; } const collectors = Object.keys(counts).sort(); return { count: records.length, collectors, counts };
} function formatCollectorCounts(stats) { if (!stats || !stats.collectors?.length) return "aucun"; return stats.collectors.map(id => `${id} (${stats.counts[id] || 0})`).join(" / ");
} function setSharedOutputStatus(kind = "") { if (!els.sharedMemoryOutput) return; els.sharedMemoryOutput.classList.remove("ok", "warn", "fail"); if (kind) els.sharedMemoryOutput.classList.add(kind);
} function renderSharedMemory() { const id = getCollectorId(); if (isCollectorConfigured()) { migrateLocalCollectorRecords(id, true); } const records = readAutoMemory(); const stats = collectorStats(records); const configured = isCollectorConfigured(); const migrationNote = localStorage.getItem(COLLECTOR_MIGRATION_NOTE_KEY) || "Aucune migration encore nécessaire."; const lastImport = localStorage.getItem(AUTO_LAST_IMPORT_KEY) || "Aucun import effectué"; const last = records[records.length - 1]; if (els.collectorIdInput && !els.collectorIdInput.value) els.collectorIdInput.value = id; if (els.collectorIdentityBadge) els.collectorIdentityBadge.textContent = configured ? `Configuré · ${id}` : "À configurer"; if (els.sharedCollectorId) els.sharedCollectorId.textContent = configured ? `${id} · sauvegardé dans Firefox` : `${id} · temporaire`; if (els.sharedLocalCount) els.sharedLocalCount.textContent = records.length === 1 ? "1 snapshot fusionné" : `${records.length} snapshots fusionnés`; if (els.sharedCollectorsCount) els.sharedCollectorsCount.textContent = `${stats.collectors.length} · ${formatCollectorCounts(stats)}`; if (els.sharedLastImport) els.sharedLastImport.textContent = lastImport; if (els.sharedMemoryOutput) { setSharedOutputStatus(configured ? "ok" : "warn"); els.sharedMemoryOutput.textContent = [ "ATLAS SHARED MARKET MEMORY — V1.1-alpha.26.35", "", configured ? `✅ Machine configurée : ${id}` : `⚠️ Machine non finalisée : ${id}`, configured ? "Configuration : gardée automatiquement dans ce Firefox." : "Action : remplace l’ID temporaire par ryzen7-christophe / transformer-book-christophe / yohan-machine puis clique Sauver ID une fois.", "", "ÉTAT MÉMOIRE", `Total disponible : ${records.length} snapshots fusionnés`, `Collecteurs fusionnés : ${formatCollectorCounts(stats)}`, last?.saved_at ? `Dernier snapshot disponible : ${new Date(last.saved_at).toLocaleString("fr-FR")}` : "Dernier snapshot disponible : aucun", `Dernière opération : ${lastImport}`, `Migration : ${migrationNote}`, "", "LECTURE SIMPLE", records.length ? "Les données visibles ici sont disponibles localement pour Atlas sur cette machine." : "Aucune donnée fusionnée pour l’instant.", stats.collectors.length > 1 ? "Fusion multi-machine active : les relevés de plusieurs collecteurs sont présents." : "Fusion multi-machine non active : une seule machine est présente pour l’instant.", "", "RÈGLE", "Export/import fusionne les relevés sans écraser. La prochaine étape projet est l’automatisation GitHub pour éviter ces imports manuels." ].join("\n"); }
} function exportAutoMemory() { const records = normalizeSharedRecords(readAutoMemory(), getCollectorId()); const payload = { schema: "atlas_shared_market_memory_v1", exported_at: new Date().toISOString(), exporter_collector_id: getCollectorId(), record_count: records.length, collectors: collectorStats(records).collectors, records }; const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-"); downloadTextFile(`atlas_shared_market_memory_${getCollectorId()}_${stamp}.json`, "application/json", JSON.stringify(payload, null, 2)); renderSharedMemory();
} async function importAutoMemoryFile(file) { if (!file) return; try { const text = await file.text(); const payload = JSON.parse(text); const incoming = Array.isArray(payload) ? payload : Array.isArray(payload.records) ? payload.records : []; if (!incoming.length) { setSharedOutputStatus("fail"); if (els.sharedMemoryOutput) els.sharedMemoryOutput.textContent = "IMPORT REFUSÉ\n\nAucun snapshot trouvé dans ce fichier JSON."; return; } const before = readAutoMemory(); const beforeStats = collectorStats(before); const merged = normalizeSharedRecords([...before, ...incoming]); writeAutoMemory(merged); const afterStats = collectorStats(merged); const imported = Math.max(0, merged.length - before.length); const newCollectors = afterStats.collectors.filter(id => !beforeStats.collectors.includes(id)); const line = `${new Date().toLocaleString("fr-FR")} · import OK · ${incoming.length} lus · ${imported} nouveaux`; localStorage.setItem(AUTO_LAST_IMPORT_KEY, line); renderSharedMemory(); renderAutoReader(); setSharedOutputStatus("ok"); if (els.sharedMemoryOutput) { els.sharedMemoryOutput.textContent = [ "✅ IMPORT RÉUSSI", "", `Fichier lu : ${file.name || "mémoire JSON"}`, `Snapshots lus dans le fichier : ${incoming.length}`, `Nouveaux snapshots ajoutés : ${imported}`, `Total mémoire fusionnée : ${merged.length}`, "", "COLLECTEURS APRÈS IMPORT", formatCollectorCounts(afterStats), newCollectors.length ? `Nouveau(x) collecteur(s) détecté(s) : ${newCollectors.join(" / ")}` : "Aucun nouveau collecteur, données déjà connues ou mises à jour.", "", "RÉSULTAT", "Les données importées sont maintenant disponibles sur ce Ryzen dans la mémoire fusionnée locale.", "Prochaine étape projet : automatiser ce transfert via GitHub pour ne plus passer par Exporter / Importer." ].join("\n"); } } catch (error) { setSharedOutputStatus("fail"); if (els.sharedMemoryOutput) { els.sharedMemoryOutput.textContent = [ "❌ IMPORT REFUSÉ", "", "Le fichier choisi n’a pas pu être lu comme mémoire Atlas JSON.", String(error?.message || error) ].join("\n"); } }
} function setGithubMemoryStatus(kind = "", text = "") { if (els.githubMemoryStatus) { els.githubMemoryStatus.classList.remove("ok", "warn", "fail"); if (kind) els.githubMemoryStatus.classList.add(kind); if (text) els.githubMemoryStatus.textContent = text; } if (els.githubMemoryOutput) { els.githubMemoryOutput.classList.remove("ok", "warn", "fail"); if (kind) els.githubMemoryOutput.classList.add(kind); }
} function normalizeGithubMemoryPayload(payload) { if (!payload) return []; if (Array.isArray(payload)) return payload; if (Array.isArray(payload.records)) return payload.records; if (payload.latest && typeof payload.latest === "object") return [payload.latest]; if (Array.isArray(payload.snapshots)) return payload.snapshots; if (payload.assets && Array.isArray(payload.assets)) return [payload]; return [];
} function githubMemoryCollectorStats(records) { const counts = {}; for (const record of records || []) { const id = record.collector_id || record.exporter_collector_id || "github-action-main"; counts[id] = (counts[id] || 0) + 1; } const collectors = Object.keys(counts).sort(); return { collectors, counts, text: collectors.length ? collectors.map(id => `${id} (${counts[id]})`).join(" / ") : "aucun" };
} function stampGithubRecords(records) { return (records || []).map((record, index) => { const saved = record.saved_at || record.created_at || record.source_time || record.timestamp || new Date().toISOString(); const collector = record.collector_id || "github-action-main"; const key = record.snapshot_id || record.id || `${collector}_${String(saved).replace(/[:.]/g, "-")}_${index}`; return { ...record, id: key, snapshot_id: key, collector_id: collector, collector_type: record.collector_type || "github_shared_memory", imported_from_github: true, github_imported_at: new Date().toISOString(), saved_at: saved }; });
} async function fetchJsonNoCache(url) { const cacheBuster = `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`; const response = await fetch(cacheBuster, { cache: "no-store" }); if (!response.ok) { const error = new Error(`HTTP ${response.status}`); error.status = response.status; throw error; } return response.json();
} async function loadGithubSharedMemory(showMessages = true) { setGithubMemoryStatus("warn", "Chargement"); try { const payload = await fetchJsonNoCache(GITHUB_MEMORY_LATEST_URL); const records = stampGithubRecords(normalizeGithubMemoryPayload(payload)); if (!records.length) { setGithubMemoryStatus("fail", "Vide"); if (els.githubMemoryOutput) { els.githubMemoryOutput.textContent = [ "MÉMOIRE GITHUB VIDE", "", "Le fichier data/latest.json existe, mais aucun snapshot exploitable n’a été trouvé.", "Alpha.25 devra écrire un format records[] ou latest{}." ].join("\n"); } return { ok: false, records: [] }; } const before = readAutoMemory(); const beforeCount = before.length; const merged = normalizeSharedRecords([...before, ...records], getCollectorId()); writeAutoMemory(merged); const added = Math.max(0, merged.length - beforeCount); const stats = githubMemoryCollectorStats(records); const last = records[records.length - 1]; if (els.githubMemoryLatest) { els.githubMemoryLatest.textContent = last?.saved_at ? new Date(last.saved_at).toLocaleString("fr-FR") : "date inconnue"; } if (els.githubMemoryRecords) els.githubMemoryRecords.textContent = `${records.length}`; if (els.githubMemoryCollectors) els.githubMemoryCollectors.textContent = stats.text; if (els.githubMemoryFusion) els.githubMemoryFusion.textContent = `${added} nouveaux · ${merged.length} total`; setGithubMemoryStatus("ok", "GitHub OK"); renderSharedMemory(); renderAutoReader(); if (showMessages && els.githubMemoryOutput) { els.githubMemoryOutput.textContent = [ "✅ MÉMOIRE GITHUB CHARGÉE", "", `Snapshots lus depuis GitHub : ${records.length}`, `Nouveaux snapshots ajoutés localement : ${added}`, `Total mémoire fusionnée locale : ${merged.length}`, `Collecteurs GitHub : ${stats.text}`, "", "Résultat : Atlas peut maintenant fusionner mémoire locale + mémoire GitHub.", "Étape active : alpha.26.30 installe GitHub Action Collector pour créer data/latest.json automatiquement." ].join("\n"); } return { ok: true, records, added }; } catch (error) { const missing = error?.status === 404; setGithubMemoryStatus(missing ? "warn" : "fail", missing ? "À créer" : "Erreur"); if (els.githubMemoryLatest) els.githubMemoryLatest.textContent = missing ? "Fichier absent" : "Erreur"; if (els.githubMemoryRecords) els.githubMemoryRecords.textContent = "0"; if (els.githubMemoryCollectors) els.githubMemoryCollectors.textContent = "aucun"; if (els.githubMemoryFusion) els.githubMemoryFusion.textContent = "locale seulement"; if (showMessages && els.githubMemoryOutput) { els.githubMemoryOutput.textContent = missing ? [ "MÉMOIRE GITHUB PAS ENCORE INSTALLÉE", "", "Le fichier ../data/latest.json n’existe pas encore.", "Ce n’est pas une panne de l’application.", "", "État actuel :", "- Ryzen collecte localement ;", "- Transformer Book collecte localement ;", "- Export/import manuel fonctionne ;", "- GitHub ne collecte pas encore.", "", "Action attendue : attendre l’exécution GitHub Action, puis recharger la page." ].join("\n") : [ "ERREUR LECTURE MÉMOIRE GITHUB", "", String(error?.message || error), "", "L’application continue avec la mémoire locale." ].join("\n"); } return { ok: false, error }; }
} function clearAutoMemory() { const ok = confirm("Effacer la mémoire Auto Reader locale de ce navigateur ?"); if (!ok) return; localStorage.removeItem(AUTO_MEMORY_KEY); localStorage.removeItem(COLLECTOR_MIGRATION_NOTE_KEY); renderSharedMemory(); renderAutoReader(); setSharedOutputStatus("warn"); if (els.sharedMemoryOutput) { els.sharedMemoryOutput.textContent = "MÉMOIRE LOCALE EFFACÉE\n\nL’ID machine est conservée. Les snapshots devront être recollectés ou réimportés."; }
} els.btnSaveCollectorSnapshot?.addEventListener("click", saveCollectorSnapshot);
els.btnShowCollectorMemory?.addEventListener("click", showCollectorMemory);
els.btnDownloadCollectorJSON?.addEventListener("click", downloadCollectorJSON);
els.btnDownloadCollectorJSONL?.addEventListener("click", downloadCollectorJSONL);
els.btnClearCollectorMemory?.addEventListener("click", clearCollectorMemory);
renderCollectorStatus(); els.btnShowWakePlan?.addEventListener("click", showWakePlan);
els.btnDownloadWakePlan?.addEventListener("click", downloadWakePlan);
els.btnMarkPauseReady?.addEventListener("click", markPauseReady); els.btnSaveReferenceSnapshot?.addEventListener("click", () => saveCollectionSnapshot("reference"));
els.btnSaveAfterTestSnapshot?.addEventListener("click", () => saveCollectionSnapshot("after_test"));
els.btnSaveLaterSnapshot?.addEventListener("click", () => saveCollectionSnapshot("later"));
els.btnCollectionChecklist?.addEventListener("click", showCollectionChecklist);
els.btnDownloadCollectionPlan?.addEventListener("click", downloadCollectionPlan);
renderCollectionProgress(); els.btnExploreMemory?.addEventListener("click", exploreMemory);
els.btnCompareMemory?.addEventListener("click", compareMemory);
els.btnSummarizeRefusals?.addEventListener("click", summarizeRefusals);
els.btnDownloadMemoryReport?.addEventListener("click", downloadMemoryReport); els.btnBuildSimSummary?.addEventListener("click", renderLearningSummary);
els.btnDownloadLearningJournal?.addEventListener("click", downloadLearningJournal);
els.btnDownloadSimJSON?.addEventListener("click", downloadSimulationJSON); els.btnSimBuy?.addEventListener("click", () => renderCommandOutput(simulateOrder("buy")));
els.btnSimSell?.addEventListener("click", () => renderCommandOutput(simulateOrder("sell")));
els.btnSimReset?.addEventListener("click", () => { resetSimulation(); renderCommandOutput(commandOk("reset_sim", simulationPayload()));
}); document.querySelectorAll("[data-school-test]").forEach(btn => { btn.addEventListener("click", () => runSchoolTest(btn.dataset.schoolTest));
}); els.btnRunCommand?.addEventListener("click", () => runCommandFromInput());
els.commandInput?.addEventListener("keydown", event => { if (event.key === "Enter") runCommandFromInput();
});
document.querySelectorAll(".cmd-preset[data-command]").forEach(btn => { btn.addEventListener("click", () => runCommandFromInput(btn.dataset.command));
}); window.AgentCryptoCommands = CryptoCommands; els.btnAutoToggle?.addEventListener("click", toggleAutoReader);
els.btnAutoNow?.addEventListener("click", () => refreshMarketOnly());
els.autoCadenceSelect?.addEventListener("change", () => setAutoCadence(els.autoCadenceSelect.value)); els.btnSaveCollectorId?.addEventListener("click", () => { setCollectorId(els.collectorIdInput?.value); renderSharedMemory(); renderAutoReader();
});
els.btnExportAutoMemory?.addEventListener("click", exportAutoMemory);
els.autoMemoryImport?.addEventListener("change", () => importAutoMemoryFile(els.autoMemoryImport.files?.[0]));
els.btnClearAutoMemory?.addEventListener("click", clearAutoMemory);
els.btnLoadGithubMemory?.addEventListener("click", () => loadGithubSharedMemory(true)); $("btnLivecheck")?.addEventListener("click", runLivecheck);
$("btnRefresh")?.addEventListener("click", refreshMarketOnly);
$("btnNoFomo")?.addEventListener("click", () => document.querySelector("#nofomo")?.scrollIntoView({ behavior: "smooth" }));
$("btnAddWatch")?.addEventListener("click", addWatch); document.querySelectorAll(".period-btn[data-period]").forEach(btn => { btn.addEventListener("click", () => { const period = Number(btn.dataset.period) || 1; state.chartPeriodDays = period; atlasChartSetPeriodButtons(period, true); requestAnimationFrame(() => renderAnalystPanel()); });
}); window.addEventListener("resize", () => { if (state.chartEngineV2?.realChart) { requestAnimationFrame(() => state.chartEngineV2.realChart.resize()); }
}); $("btnSeedWatch")?.addEventListener("click", seedWatch);
$("btnAnalyzeNews")?.addEventListener("click", analyzeNews);
$("btnAnalyzeFomo")?.addEventListener("click", analyzeFomo); els.searchInput?.addEventListener("input", renderMarketTable); document.querySelectorAll(".filter-btn[data-filter]").forEach(btn => { btn.addEventListener("click", () => { state.assetFilter = btn.dataset.filter || "all"; document.querySelectorAll(".filter-btn[data-filter]").forEach(b => b.classList.toggle("active", b === btn)); renderMarketTable(); });
}); els.sortSelect?.addEventListener("change", () => { state.sortKey = els.sortSelect.value || "rank-asc"; renderMarketTable();
}); const advancedButton = document.getElementById("btnToggleAdvanced");
const advancedPanel = document.getElementById("advancedPanel");
if (advancedButton && advancedPanel) { advancedButton.type = "button"; advancedButton.addEventListener("click", () => { advancedPanel.classList.toggle("is-collapsed"); const open = !advancedPanel.classList.contains("is-collapsed"); advancedButton.textContent = open ? "Masquer avancé" : "Afficher avancé"; });
} 
function initAtlasCollapsibleLayout() {
  const collapses = document.querySelectorAll(".atlas-collapse");
  collapses.forEach(details => {
    details.open = false;
    details.classList.toggle("is-open", false);
    const icon = details.querySelector(".atlas-collapse-icon");
    if (icon) icon.textContent = "▶";
    details.addEventListener("toggle", () => {
      details.classList.toggle("is-open", details.open);
      const currentIcon = details.querySelector(".atlas-collapse-icon");
      if (currentIcon) currentIcon.textContent = details.open ? "▼" : "▶";
    });
  });

  const openTargetFromHash = () => {
    const hash = String(window.location.hash || "").trim();
    if (!hash || hash === "#") return;
    let target = null;
    try { target = document.querySelector(hash); } catch {}
    if (!target) return;
    const container = target.closest(".atlas-collapse");
    if (container) {
      container.open = true;
      const icon = container.querySelector(".atlas-collapse-icon");
      if (icon) icon.textContent = "▼";
      requestAnimationFrame(() => target.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  };

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", () => setTimeout(openTargetFromHash, 30));
  });
  window.addEventListener("hashchange", openTargetFromHash);
  openTargetFromHash();
}

function atlasSafeBoot(label, fn) { try { return fn(); } catch (error) { console.warn(`Boot Atlas ignoré : ${label}`, error); return null; }
} atlasSafeBoot("collapsible layout", initAtlasCollapsibleLayout);
atlasSafeBoot("source grid", renderSourceGrid);
atlasSafeBoot("source diagnostic", renderSourceDiagnostic);
atlasSafeBoot("source metric", () => updateSourceMetric(0));
atlasSafeBoot("ticker", renderTicker);
atlasSafeBoot("empty market", () => renderEmptyMarket("Livecheck requis. Aucun prix inventé."));
atlasSafeBoot("score", () => renderScore(null));
atlasSafeBoot("watch ids", loadWatchIds);
atlasSafeBoot("watchlist", renderWatchlist);
atlasSafeBoot("risk grid", renderRiskGrid);
atlasSafeBoot("cold read", () => renderColdRead(false));
atlasSafeBoot("auto reader render", renderAutoReader);
atlasSafeBoot("shared memory render", renderSharedMemory);
atlasSafeBoot("github memory initial state", () => loadGithubSharedMemory(false));
atlasSafeBoot("beginner summary", renderBeginnerSummary);
atlasSafeBoot("data broker strip", atlasRenderBrokerStrip);
requestAnimationFrame(() => atlasSafeBoot("analyst panel", renderAnalystPanel));
atlasSafeBoot("auto reader start", startAutoReader); const QUESTIONNAIRE_STORAGE_KEY = "agent_crypto_erith_ia_questionnaire_v1"; function questionnaireFields() { return { objective: document.getElementById("qObjective"), assets: document.getElementById("qAssets"), virtualAmount: document.getElementById("qVirtualAmount"), risks: document.getElementById("qRisks"), news: document.getElementById("qNews"), machine: document.getElementById("qMachine"), access: document.getElementById("qAccess"), physical: document.getElementById("qPhysical") };
} function getQuestionnaireData() { const f = questionnaireFields(); return { objective: f.objective?.value?.trim() || "", assets: f.assets?.value?.trim() || "", virtualAmount: f.virtualAmount?.value?.trim() || "", risks: f.risks?.value?.trim() || "", news: f.news?.value?.trim() || "", machine: f.machine?.value?.trim() || "", access: f.access?.value?.trim() || "", physical: f.physical?.value?.trim() || "", updatedAt: new Date().toISOString() };
} function setQuestionnaireData(data = {}) { const f = questionnaireFields(); if (f.objective) f.objective.value = data.objective || ""; if (f.assets) f.assets.value = data.assets || ""; if (f.virtualAmount) f.virtualAmount.value = data.virtualAmount || ""; if (f.risks) f.risks.value = data.risks || ""; if (f.news) f.news.value = data.news || ""; if (f.machine) f.machine.value = data.machine || ""; if (f.access) f.access.value = data.access || ""; if (f.physical) f.physical.value = data.physical || "";
} function saveQuestionnaire() { const data = getQuestionnaireData(); try { localStorage.setItem(QUESTIONNAIRE_STORAGE_KEY, JSON.stringify(data)); } catch {} return data;
} function loadQuestionnaire() { try { const raw = localStorage.getItem(QUESTIONNAIRE_STORAGE_KEY); if (raw) { setQuestionnaireData(JSON.parse(raw)); } } catch {}
} function clearQuestionnaire() { try { localStorage.removeItem(QUESTIONNAIRE_STORAGE_KEY); } catch {} setQuestionnaireData({}); const out = document.getElementById("questionnaireOutput"); if (out) out.textContent = "Fiche effacée localement.";
} function cleanBriefField(value) { return String(value || "") .replace(/^Champ\s+Objectif\s+de\s+la\s+session\s*:\s*/i, "") .replace(/^Champ\s+Cryptos\s+prioritaires\s*:\s*/i, "") .replace(/^Champ\s+Risques\s+interdits\s*:\s*/i, "") .replace(/^Objectif\s+de\s+la\s+session\s*:\s*/i, "") .replace(/^Cryptos\s+prioritaires\s*:\s*/i, "") .replace(/^Risques\s+interdits\s*:\s*/i, "") .trim();
} function buildSessionBrief() { const data = saveQuestionnaire(); const lines = [ "# NOTE DE REPRISE — Agent-Crypto @erith.IA", "", "## Statut", "", "- Préparation avant backend privé.", "- Aucune clé réelle.", "- Aucun wallet réel.", "- Aucun trading réel.", "- Aucune information nominative.", "", "## 1. Objectif de la session", "", cleanBriefField(data.objective) || "À compléter.", "", "## 2. Cryptos prioritaires", "", cleanBriefField(data.assets) || "À compléter.", "", "## 3. Montant virtuel de simulation", "", cleanBriefField(data.virtualAmount) || "À compléter.", "", "## 4. Risques interdits", "", cleanBriefField(data.risks) || "À compléter.", "", "## 5. Sources d'information", "", cleanBriefField(data.news) || "À compléter.", "", "## 6. Machine privée envisagée", "", cleanBriefField(data.machine) || "À compléter.", "", "## 7. Accès renforcé", "", cleanBriefField(data.access) || "À compléter.", "", "## 8. Sécurité physique / wallet matériel", "", cleanBriefField(data.physical) || "À compléter.", "", "## Interdits rappelés", "", "- Pas de seed phrase.", "- Pas de clé API réelle.", "- Pas de retrait.", "- Pas d'ordre réel.", "- Pas d'accès distant public.", "- Pas de nom personnel.", "", `Dernière mise à jour locale : ${data.updatedAt}` ]; const text = lines.join("\n"); const out = document.getElementById("questionnaireOutput"); if (out) out.textContent = text; return text;
} function questionnaireStatusPayload() { const data = getQuestionnaireData(); const filled = Object.entries(data) .filter(([key, value]) => key !== "updatedAt" && String(value || "").trim()) .map(([key]) => key); return { version: "RC23", filled_fields: filled, missing_fields: ["objective","assets","virtualAmount","risks","news","machine","access","physical"].filter(k => !filled.includes(k)), rule: "local_browser_notes_only_no_secrets" };
} document.getElementById("btnSaveQuestionnaire")?.addEventListener("click", () => { saveQuestionnaire(); const out = document.getElementById("questionnaireOutput"); if (out) out.textContent = "Fiche sauvegardée localement dans ce navigateur.";
}); document.getElementById("btnBuildBrief")?.addEventListener("click", buildSessionBrief);
document.getElementById("btnCopyBrief")?.addEventListener("click", copySessionBrief);
document.getElementById("btnDownloadBrief")?.addEventListener("click", downloadSessionBrief);
document.getElementById("btnClearQuestionnaire")?.addEventListener("click", clearQuestionnaire);
loadQuestionnaire(); async function copySessionBrief() { const text = buildSessionBrief(); const out = document.getElementById("questionnaireOutput"); try { await navigator.clipboard.writeText(text); if (out) out.textContent = text + "\n\n---\nCopie presse-papiers : OK."; } catch { if (out) out.textContent = text + "\n\n---\nCopie automatique impossible : sélectionne le texte et copie manuellement."; }
} function downloadSessionBrief() { const text = buildSessionBrief(); const blob = new Blob([text], { type: "text/markdown;charset=utf-8" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); const stamp = new Date().toISOString().slice(0, 10); a.href = url; a.download = `agent_crypto_note_reprise_${stamp}.md`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
} /* Atlas-10 Crypto — Math Core intégré V1.1-alpha.26.35 Source: modules .md Atlas Math. Exécution: traduction JS condensée. Lecture seule : aucun ordre réel, aucune clé API, aucun capital engagé. */
function atlasFmtPct(n) { return typeof n === "number" && Number.isFinite(n) ? `${n >= 0 ? "+" : ""}${n.toFixed(2)} %` : "—";
} function atlasFmtEUR(n) { return typeof n === "number" && Number.isFinite(n) ? fmtEUR.format(n) : "—";
} function atlasSelectedCoin() { if (!Array.isArray(state.coins) || !state.coins.length) return null; return state.coins.find(c => c.id === state.selectedCoinId) || state.coins[0] || null;
} function computeAtlasDataQuality(coin) { const missing = []; if (!coin) missing.push("actif"); if (coin && typeof coin.price !== "number") missing.push("prix EUR"); if (coin && typeof coin.volume24h !== "number") missing.push("volume 24h"); if (coin && !atlasCanonicalCoin(coin)) missing.push("source canonique"); if (!state.sourceLock?.valid) missing.push("Source Lock"); if (coin && !coin.timestamp) missing.push("timestamp"); const score = clamp(0, 100, 100 - missing.length * 24); return { score, status: score >= 80 ? "ok" : score >= 50 ? "faible" : "refus", missing };
} function computeAtlasMarketMath(coin) { if (!coin) { return { score: 0, reason: "Livecheck requis", human: "aucune lecture marché sans source", change24h: null, change7d: null, fomoPenalty: 0 }; } const change24h = typeof coin.change24h === "number" ? coin.change24h : null; const change7d = typeof coin.change7d === "number" ? coin.change7d : null; const volumeScore = typeof coin.volume24h === "number" && coin.volume24h > 0 ? 20 : 0; const momentumScore = change24h === null ? 0 : clamp(0, 35, 18 + change24h * 2); const fomoPenalty = change24h !== null && Math.abs(change24h) > 12 ? 20 : 0; const score = clamp(0, 100, 35 + volumeScore + momentumScore - fomoPenalty); return { score, reason: fomoPenalty ? "Mouvement fort : prudence" : "Marché lisible en observation", human: fomoPenalty ? "marché actif, entrée possiblement tardive" : "marché lisible, pas un signal d’achat", change24h, change7d, fomoPenalty };
} function computeAtlasSignalQuality(coin, market) { if (!coin) return { score: 0, reason: "Aucun signal sans donnée", human: "signal absent" }; let score = 45; if (coin.source) score += 20; if (typeof coin.change24h === "number") score += 10; if (typeof coin.change7d === "number") score += 10; if (market?.fomoPenalty) score -= 15; score = clamp(0, 100, score); return { score, reason: score >= 70 ? "Signal exploitable en simulation" : "Signal à surveiller seulement", human: score >= 70 ? "signal utile pour simulation, pas pour achat réel" : "signal trop faible pour agir" };
} function computeAtlasScenarioMath(coin, signal) { if (!coin || typeof coin.price !== "number") { return { score: 0, reason: "Scénario impossible sans prix", human: "pas de scénario sans prix" }; } const price = coin.price; return { score: clamp(0, 100, (signal?.score || 0) - 5), reason: "Scénario prudent ±3 %", human: `si +3 % : ${atlasFmtEUR(price * 1.03)} · si -3 % : ${atlasFmtEUR(price * 0.97)}` };
} function computeAtlasRiskMath(coin, market) { if (!coin) return { score: 80, reason: "Risque inconnu : données absentes", human: "risque non borné" }; const change = typeof coin.change24h === "number" ? Math.abs(coin.change24h) : 8; const score = clamp(0, 100, 25 + change * 4 + (market?.fomoPenalty || 0)); const reason = score > 70 ? "Risque élevé : simulation seulement" : score > 45 ? "Risque moyen : prudence" : "Risque contenu en observation"; return { score, reason, human: score > 70 ? "action réelle bloquée" : score > 45 ? "prudence nécessaire" : "risque compatible lecture seule" };
} function computeAtlasMicroTransactionMath() { return { score: 50, reason: "Frais, spread et slippage non connectés", human: "micro-transaction réelle impossible pour l’instant" };
} function computeAtlasExecutionMath(data, market, signal, scenario, risk, micro) { if (!data || data.status !== "ok") { return { verdict: "OBSERVER SEULEMENT", action: "lecture seule", score: 0, reason: "Livecheck requis ou données incomplètes", tone: "warn" }; } if (risk.score >= 75) { return { verdict: "SIMULATION SEULEMENT", action: "aucun ordre", score: 25, reason: risk.reason, tone: "warn" }; } const score = clamp(0, 100, (market.score + signal.score + scenario.score + micro.score) / 4 - risk.score * 0.35); if (score >= 70) { return { verdict: "SIMULATION SEULEMENT", action: "aucun ordre", score, reason: "Signal correct, mais réel verrouillé", tone: "ok" }; } if (score >= 45) { return { verdict: "OBSERVER SEULEMENT", action: "lecture seule", score, reason: "Hypothèse à surveiller", tone: "warn" }; } return { verdict: "REFUS", action: "lecture seule", score, reason: "Conditions insuffisantes", tone: "refus" };
} function atlasHumanSummary(data, market, signal, risk, micro, execution, coin) { if (!coin) { return { verdict: "OBSERVER SEULEMENT", why: "Aucune source marché n’a encore répondu.", action: "Cliquer sur Lancer Livecheck.", data: "en attente", market: "en attente", signal: "en attente", risk: "non lu" }; } return { verdict: execution.verdict, why: `${coin.symbol} est lisible. ${market.human}. ${micro.human}.`, action: `${execution.action}. Aucun ordre réel.`, data: data.status === "ok" ? "bonnes" : "faibles", market: market.score >= 60 ? "lisible" : "fragile", signal: signal.score >= 70 ? "simulation possible" : "surveillance", risk: risk.score < 45 ? "contenu" : "prudence" };
} function atlasMathCard(title, value, detail, human = "") { return ` <div class="atlas-math-card"> <span>${escapeHtml(title)}</span> <b>${escapeHtml(value)}</b> <small>${escapeHtml(detail || "")}</small> ${human ? `<em>${escapeHtml(human)}</em>` : ""} </div>`;
} function renderAtlasMathCore() { const coin = atlasSelectedCoin(); const data = computeAtlasDataQuality(coin); const market = computeAtlasMarketMath(coin); const signal = computeAtlasSignalQuality(coin, market); const scenario = computeAtlasScenarioMath(coin, signal); const risk = computeAtlasRiskMath(coin, market); const micro = computeAtlasMicroTransactionMath(); const execution = computeAtlasExecutionMath(data, market, signal, scenario, risk, micro); const summary = atlasHumanSummary(data, market, signal, risk, micro, execution, coin); state.math = { asset: coin ? `${coin.name} (${coin.symbol})` : null, data, market, signal, scenario, risk, micro, execution, updated_at: new Date().toISOString() }; const human = document.getElementById("atlasHumanVerdict"); if (human) { human.classList.remove("ok", "warn", "refus"); human.classList.add(execution.tone || "warn"); human.innerHTML = `<b>Verdict :</b> ${escapeHtml(summary.verdict)}<br>` + `<b>Pourquoi :</b> ${escapeHtml(summary.why)}<br>` + `<b>Action :</b> ${escapeHtml(summary.action)}`; } const summaryGrid = document.getElementById("atlasSummaryGrid"); if (summaryGrid) { summaryGrid.innerHTML = ` <div><span>Données</span><b>${escapeHtml(summary.data)}</b></div> <div><span>Marché</span><b>${escapeHtml(summary.market)}</b></div> <div><span>Signal</span><b>${escapeHtml(summary.signal)}</b></div> <div><span>Risque</span><b>${escapeHtml(summary.risk)}</b></div>`; } const panel = document.getElementById("atlasMathCorePanel"); if (panel) { panel.innerHTML = [ atlasMathCard("Actif", coin ? `${coin.symbol}` : "—", coin ? coin.name : "Livecheck requis", coin ? `${coin.source || "source"} · ${atlasFmtEUR(coin.price)}` : ""), atlasMathCard("Data Quality", `${Math.round(data.score)}/100`, data.status, data.status === "ok" ? "données utilisables" : "données insuffisantes"), atlasMathCard("Market Math", `${Math.round(market.score)}/100`, `${atlasFmtPct(market.change24h)} 24h`, market.human), atlasMathCard("Signal Quality", `${Math.round(signal.score)}/100`, signal.reason, signal.human), atlasMathCard("Scenario Math", `${Math.round(scenario.score)}/100`, scenario.reason, scenario.human), atlasMathCard("Risk Math", `${Math.round(risk.score)}/100`, risk.reason, risk.human), atlasMathCard("Micro-Transaction", `${Math.round(micro.score)}/100`, "lecture seule", micro.human), `<div class="atlas-math-card wide"><span>Execution Math</span><b>${Math.round(execution.score)}/100</b><small>${escapeHtml(execution.verdict)}</small><em>${escapeHtml(execution.reason)}</em></div>` ].join(""); } const verdict = document.getElementById("atlasMathVerdict"); if (verdict) { verdict.classList.remove("ok", "warn", "refus"); verdict.classList.add(execution.tone || "warn"); verdict.innerHTML = `<b>Verrou :</b> aucun ordre réel · aucune clé API · aucun capital engagé`; } const riskPanel = document.getElementById("atlasRiskMathPanel"); if (riskPanel) riskPanel.innerHTML = `<b>Atlas Risk Math</b><span>Score risque : ${Math.round(risk.score)}/100 · ${escapeHtml(risk.reason)}</span>`; const noFomoPanel = document.getElementById("atlasNoFomoMathPanel"); if (noFomoPanel) { const noFomo = market.fomoPenalty ? "ralentir / simulation seulement" : "continuer en observation"; noFomoPanel.innerHTML = `<b>Atlas No-FOMO Math</b><span>${escapeHtml(noFomo)} · ${escapeHtml(market.reason)}</span>`; } const simPanel = document.getElementById("atlasSimulationMathPanel"); if (simPanel) simPanel.innerHTML = `<b>Atlas Simulation Math</b><span>Verdict : ${escapeHtml(execution.verdict)} · simulation locale uniquement · aucun ordre réel.</span>`;
} renderAtlasMathCore();
setInterval(renderAtlasMathCore, 5000);
