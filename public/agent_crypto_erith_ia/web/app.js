/* V2.0-alpha · Build 28.1.42 — CLEAN HOME · INLINE DATA STATUS · ZERO EXTRA PANELS · ADMIN GRAPH TOGGLE · MARKET RECENTER · FORGE PRO BRIDGE
   SINGLE TIMELINE LOCK
   Correction cumulative du Graphique Analyste.
   - largeur réelle : Détail actif superposé, aucune colonne retirée au canvas ;
   - axes Prix et Date dessinés dans le chartArea, sans manger le tracé ;
   - ombrage de prix attaché exactement à la courbe ;
   - volumes dessinés derrière la courbe dans le même canvas et la même chronologie ;
   - aucune seconde zone graphique indépendante ;
   - chronologie canonique indépendante pour 24h / 7j / 30j / 60j / 90j / 1a / Max ;
   - Target Top 5 et Market Flow : clic simple = ajouter / retirer ;
   - Solo reste une action distincte depuis le Market Snapshot ;
   - protections Prix / Volume, comparaison atomique et dernier graphe valide préservés ;
   - Market, Math Rail, LIVE SOURCES, Watchlist V3, News V2,
     mémoires et gouverneur réseau préservés.
   - dernière lecture conservée séparée d’une nouvelle réponse directe ;
   - comparaison construite sur les points CoinGecko natifs, sans interpolation synthétique ;
   - statut de rafraîchissement exclusivement en surimpression, sans déplacement du graphique.
*/
const ATLAS_RELEASE = "V2.0-alpha · Build 28.1.42";
const ATLAS_MARKET_DEGRADE_AFTER_FAILURES = 2;
/* DIRECT-FIRST STARTUP · STATUS HARMONIZATION LOCK
   Le cache local est seulement préparé au démarrage. Il n'est rendu visible
   qu'après l'échec confirmé de la tentative CoinGecko directe.
*/
const atlasStartup = {
  started: false,
  completed: false,
  directAttemptAt: 0,
  cacheAvailable: false,
  cacheTimestamp: null,
  promise: null
};
/* MARKET PULSE & LIVE SPOT CANON LOCK
   Top 50: 60 s · spot sélection: 30 s · historique: 5 min.
   Onglet caché: pause réseau · retour: reprise immédiate.
   Backoff: 60 / 120 / 300 s · ancien état valide conservé.
*/
const state = {
  liveOk: false,
  mainSource: null,
  timestamp: null,
  coins: [],
  global: null,
  watchIds: ["bitcoin","ethereum","solana","binancecoin","ripple","tether","usd-coin","usds","cardano","tron","dogecoin","chainlink","toncoin","avalanche-2","polkadot","litecoin","sui","aptos","arbitrum","optimism","polygon-ecosystem-token","uniswap","aave","ondo-finance","maker","pendle","near","bittensor","render-token","internet-computer","shiba-inu","pepe","monero","zcash"],
  sourceStatus: [],
  sourceStatusExpectedTotal: 2,
  selectedCoinId: "bitcoin",
  graphSelectionCleared: false,
  chartPeriodDays: 1,
  chartCache: {},
  chartRenderToken: 0,
  comparisonRenderToken: 0,
  chartViewV2: { view: "price", scale: "linear", volume: true, legend: false, comparisonLegend: false, marketColumns: "essential" },
  chartEngineV2: {
    token: 0,
    controller: null,
    lastKey: "",
    loading: false,
    realChart: null,
    lastRenderedKey: "",
    lastFingerprint: "",
    retryTimer: null,
    retryKey: "",
    retryAttempts: Object.create(null),
    tooltipPin: null
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
      preset: "solo",
      limit: 5,
      ids: ["bitcoin"],
      results: {},
      renderedIds: [],
      pendingIds: [],
      unavailableIds: [],
      status: "idle",
      error: null,
      lastDirectRequestAt: 0,
      completionTimer: null,
      completionAttempt: 0,
      completionKey: null
    }
  },
  assetFilter: "all",
  sortKey: "rank-asc",
  sim: null,
  math: null,
  auto: {
    enabled: true,
    cadence: "adaptive",
    intervalMs: 300000,
    timer: null,
    countdownTimer: null,
    nextAt: null,
    lastStartedAt: null,
    lastRunMs: 0,
    livecheckBusy: false,
    bootStarted: false
  }
};

state.dataBroker.spotBook = {
  status: "idle",
  source: "CoinGecko",
  mode: "none",
  timestamp: null,
  ids: [],
  quotes: Object.create(null),
  token: 0,
  error: null
};

state.marketPulse = {
  initialized: false,
  paused: false,
  marketController: null,
  spotController: null,
  spotTimer: null,
  chartTimer: null,
  marketFailures: 0,
  spotFailures: 0,
  chartFailures: 0,
  lastMarketSuccessAt: 0,
  lastSpotSuccessAt: 0,
  lastChartSuccessAt: 0,
  spotBusy: false,
  chartBusy: false
};

state.marketContinuity = {
  lastGood: null,
  lastGoodAt: null,
  restoreCount: 0,
  lastReason: null
};

state.networkGovernor = {
  active: null,
  queue: [],
  sequence: 0,
  periodTimer: null,
  pendingPeriod: null
};

state.sourceDock = {
  activeCoinId: null,
  status: "idle",
  token: 0,
  controller: null,
  retryTimer: null,
  records: Object.create(null),
  failures: Object.create(null),
  nextRetryAt: Object.create(null),
  lastAttemptAt: Object.create(null),
  cacheLoaded: false,
  lastError: null
};

state.memoryTruth = {
  loaded: false,
  github: {
    loading: false,
    autoAttempted: false,
    lastMode: null,
    lastAttemptAt: null,
    lastSuccessAt: null,
    lastError: null,
    lastRecordAt: null,
    records: 0,
    added: 0,
    totalLocal: 0,
    collectors: []
  }
};

const $ = (id) => document.getElementById(id); const els = { liveStatus: $("liveStatus"), sourceName: $("sourceName"), sourceTime: $("sourceTime"), sourceDecision: $("sourceDecision"), tableDecision: $("tableDecision"), offlineNotice: $("offlineNotice"), top5Track: $("top5Track"), tickerTrack: $("tickerTrack"), marketRows: $("marketRows"), tableNote: $("tableNote"), searchInput: $("searchInput"), metricMarketCap: $("metricMarketCap"), metricMarketCapHint: $("metricMarketCapHint"), metricVolume: $("metricVolume"), metricVolumeHint: $("metricVolumeHint"), metricBtcDom: $("metricBtcDom"), metricBtcDomHint: $("metricBtcDomHint"), metricSources: $("metricSources"), metricSourcesHint: $("metricSourcesHint"), sourceGrid: $("sourceGrid"), scoreRing: $("scoreRing"), scoreValue: $("scoreValue"), scoreLabel: $("scoreLabel"), scoreBreakdown: $("scoreBreakdown"), watchInput: $("watchInput"), watchCards: $("watchCards"), watchBasketSummary: $("watchBasketSummary"), riskGrid: $("riskGrid"), newsInput: $("newsInput"), newsOutput: $("newsOutput"), fomoInput: $("fomoInput"), fomoOutput: $("fomoOutput"), coldRead: $("coldRead"), beginnerSummary: $("beginnerSummary"), advancedPanel: $("advancedPanel"), advancedGrid: $("advancedGrid"), btnToggleAdvanced: $("btnToggleAdvanced"), selectedAssetTitle: $("selectedAssetTitle"), mainChart: $("mainChart"), chartCaption: $("chartCaption"), assetDetailGrid: $("assetDetailGrid"), assetDetailWhy: $("assetDetailWhy"), brokerMarket: $("brokerMarket"), brokerMarketTime: $("brokerMarketTime"), brokerSpot: $("brokerSpot"), brokerSpotTime: $("brokerSpotTime"), brokerChart: $("brokerChart"), brokerChartTime: $("brokerChartTime"), diagSourceMode: $("diagSourceMode"), diagSourceDetail: $("diagSourceDetail"), diagMarketLatency: $("diagMarketLatency"), diagUsdLatency: $("diagUsdLatency"), diagChartMode: $("diagChartMode"), diagChartLatency: $("diagChartLatency"), diagRetryCount: $("diagRetryCount"), diagLastError: $("diagLastError"), trustLockText: $("trustLockText"), sortSelect: $("sortSelect"), commandInput: $("commandInput"), commandOutput: $("commandOutput"), commandHuman: $("commandHuman"), btnRunCommand: $("btnRunCommand"), simCash: $("simCash"), simPositionsValue: $("simPositionsValue"), simTotalValue: $("simTotalValue"), simPnL: $("simPnL"), simSymbol: $("simSymbol"), simAmount: $("simAmount"), btnSimBuy: $("btnSimBuy"), btnSimSell: $("btnSimSell"), btnSimReset: $("btnSimReset"), simPositions: $("simPositions"), simLog: $("simLog"), simProfileStatus: $("simProfileStatus"), schoolResult: $("schoolResult"), btnBuildSimSummary: $("btnBuildSimSummary"), btnDownloadLearningJournal: $("btnDownloadLearningJournal"), btnDownloadSimJSON: $("btnDownloadSimJSON"), simLearningOutput: $("simLearningOutput"), btnSaveCollectorSnapshot: $("btnSaveCollectorSnapshot"), btnShowCollectorMemory: $("btnShowCollectorMemory"), btnDownloadCollectorJSON: $("btnDownloadCollectorJSON"), btnDownloadCollectorJSONL: $("btnDownloadCollectorJSONL"), btnClearCollectorMemory: $("btnClearCollectorMemory"), collectorCount: $("collectorCount"), collectorLast: $("collectorLast"), collectorOutput: $("collectorOutput"), btnExploreMemory: $("btnExploreMemory"), btnCompareMemory: $("btnCompareMemory"), btnSummarizeRefusals: $("btnSummarizeRefusals"), btnDownloadMemoryReport: $("btnDownloadMemoryReport"), memoryExplorerOutput: $("memoryExplorerOutput"), btnSaveReferenceSnapshot: $("btnSaveReferenceSnapshot"), btnSaveAfterTestSnapshot: $("btnSaveAfterTestSnapshot"), btnSaveLaterSnapshot: $("btnSaveLaterSnapshot"), btnCollectionChecklist: $("btnCollectionChecklist"), btnDownloadCollectionPlan: $("btnDownloadCollectionPlan"), collectionProgressTitle: $("collectionProgressTitle"), collectionProgressText: $("collectionProgressText"), collectionProgressBar: $("collectionProgressBar"), collectionPlanOutput: $("collectionPlanOutput"), actionFeedback: $("actionFeedback"), btnShowWakePlan: $("btnShowWakePlan"), btnDownloadWakePlan: $("btnDownloadWakePlan"), btnMarkPauseReady: $("btnMarkPauseReady"), resumeAssistantOutput: $("resumeAssistantOutput"), autoModeStatus: $("autoModeStatus"), btnAutoToggle: $("btnAutoToggle"), btnAutoNow: $("btnAutoNow"), autoLastRead: $("autoLastRead"), autoNextRead: $("autoNextRead"), autoActiveCadence: $("autoActiveCadence"), autoSnapshots: $("autoSnapshots"), autoMarketPulse: $("autoMarketPulse"), autoWatchStatus: $("autoWatchStatus"), autoReaderOutput: $("autoReaderOutput"),
  autoReaderTruth: $("autoReaderTruth"), autoVisibilityTruth: $("autoVisibilityTruth"),
  autoLastSnapshotTruth: $("autoLastSnapshotTruth"), autoCollectorTruth: $("autoCollectorTruth"),
  autoGithubWriteTruth: $("autoGithubWriteTruth"), collectorIdInput: $("collectorIdInput"), collectorIdentityBadge: $("collectorIdentityBadge"), btnSaveCollectorId: $("btnSaveCollectorId"), btnExportAutoMemory: $("btnExportAutoMemory"), autoMemoryImport: $("autoMemoryImport"), btnClearAutoMemory: $("btnClearAutoMemory"), sharedCollectorId: $("sharedCollectorId"), sharedLocalCount: $("sharedLocalCount"), sharedCollectorsCount: $("sharedCollectorsCount"), sharedLastImport: $("sharedLastImport"), sharedMemoryOutput: $("sharedMemoryOutput"), githubMemoryStatus: $("githubMemoryStatus"), btnLoadGithubMemory: $("btnLoadGithubMemory"),
  githubMemoryAuto: $("githubMemoryAuto"), githubMemoryAutoAttempt: $("githubMemoryAutoAttempt"),
  githubMemorySuccess: $("githubMemorySuccess"), githubMemoryLatest: $("githubMemoryLatest"),
  githubMemoryRecords: $("githubMemoryRecords"), githubMemoryLocal: $("githubMemoryLocal"),
  githubMemoryAdded: $("githubMemoryAdded"), githubMemoryCollectors: $("githubMemoryCollectors"),
  githubMemoryFusion: $("githubMemoryFusion"), githubMemoryWrite: $("githubMemoryWrite"),
  collectorTruthList: $("collectorTruthList"), githubMemoryOutput: $("githubMemoryOutput"),
  sourceDock: $("source-dock"), sourceDockAsset: $("sourceDockAsset"), sourceDockStatus: $("sourceDockStatus"),
  sourceDockPortals: $("sourceDockPortals"), sourceDockOrigin: $("sourceDockOrigin"),
  sourceDockUpdated: $("sourceDockUpdated"), btnSourceDockRefresh: $("btnSourceDockRefresh"),
  sourceDockCompactState: $("sourceDockCompactState"),
  detailCompactAsset: $("detailCompactAsset"), detailCompactPrice: $("detailCompactPrice"),
  detailCompactDecision: $("detailCompactDecision"), detailCompactChange: $("detailCompactChange"),
  btnChartSolo: $("btnChartSolo"), btnChartTop3: $("btnChartTop3"), btnChartTop5: $("btnChartTop5"), btnChartGainers: $("btnChartGainers"), btnChartLosers: $("btnChartLosers"), btnChartVolume5: $("btnChartVolume5"), btnChartReset: $("btnChartReset"), btnChartClear: $("btnChartClear"), comparisonSelection: $("comparisonSelection"),
  multiHorizonTitle: $("multiHorizonTitle"), multiHorizonStatus: $("multiHorizonStatus"), multiHorizonSummary: $("multiHorizonSummary"),
  multiHorizon24Value: $("multiHorizon24Value"), multiHorizon24Label: $("multiHorizon24Label"),
  multiHorizon7Value: $("multiHorizon7Value"), multiHorizon7Label: $("multiHorizon7Label"),
  multiHorizon30Value: $("multiHorizon30Value"), multiHorizon30Label: $("multiHorizon30Label"),
  multiHorizonMeta: $("multiHorizonMeta"), multiHorizonTechnical: $("multiHorizonTechnical")
}; const MARKET_CACHE_KEY = "agent_crypto_erith_ia_market_cache_top50_v2";
const LEGACY_MARKET_CACHE_KEYS = ["agent_crypto_erith_ia_market_cache_v1_1_alpha_26_37_top50", "agent_crypto_erith_ia_market_cache_v1_1_alpha_26_36_atomic_250", "agent_crypto_erith_ia_market_cache_cmc_top50_v2"];
const ATLAS_SOURCE_DOCK_CACHE_KEY = "agent_crypto_erith_ia_source_dock_v27_2";
const ATLAS_SOURCE_DOCK_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const ATLAS_SOURCE_DOCK_STALE_MAX_MS = 7 * 24 * 60 * 60 * 1000;
const ATLAS_SOURCE_DOCK_MAX_RECORDS = 60;
const ATLAS_SOURCE_DOCK_RETRY_STEPS_MS = Object.freeze([60_000, 300_000, 900_000]);
const ATLAS_SOURCE_DOCK_MIN_ATTEMPT_GAP_MS = 15_000;
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
const atlasMoveStrengthClass = (value) => {
  const magnitude = Math.abs(Number(value));
  if (!Number.isFinite(magnitude)) return "move-unknown";
  if (magnitude >= 5) return "move-extreme";
  if (magnitude >= 2) return "move-strong";
  if (magnitude >= 1) return "move-medium";
  return "move-soft";
};
const clamp = (min, max, value) => Math.max(min, Math.min(max, value)); function setText(el, value) { if (el) el.textContent = value;
} function setTableDecision(text, mode = "") { setText(els.sourceDecision, text); setText(els.tableDecision, text); for (const el of [els.sourceDecision, els.tableDecision]) { if (!el) continue; el.classList.remove("ok", "fail", "warn"); if (mode) el.classList.add(mode); }
} function setHTML(el, value) { if (el) el.innerHTML = value;
} function escapeHtml(str) { return String(str ?? "").replace(/[&<>'"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[c]));
} function num(value, formatter = fmtEUR.format.bind(fmtEUR)) { return typeof value === "number" && Number.isFinite(value) ? formatter(value) : "Donnée manquante";
} 
const ATLAS_NETWORK_PRIORITY = Object.freeze({
  market: 1,
  chart: 2,
  spot: 3,
  usd: 4,
  source: 5
});

function atlasNetworkAbortError() {
  try { return new DOMException("Requête annulée", "AbortError"); }
  catch {
    const error = new Error("Requête annulée");
    error.name = "AbortError";
    return error;
  }
}

function atlasNetworkPump() {
  const governor = state.networkGovernor;
  if (!governor || governor.active || !governor.queue.length) return;

  governor.queue.sort((a, b) =>
    (ATLAS_NETWORK_PRIORITY[a.kind] || 99) - (ATLAS_NETWORK_PRIORITY[b.kind] || 99)
    || a.createdAt - b.createdAt
  );

  const job = governor.queue.shift();
  if (!job || job.cancelled) {
    atlasNetworkPump();
    return;
  }

  const token = `${job.kind}:${++governor.sequence}`;
  governor.active = {
    token,
    kind: job.kind,
    startedAt: Date.now()
  };
  job.cleanup();
  job.resolve(token);
}

function atlasAcquireNetwork(kind, signal = null, waitTimeoutMs = ATLAS_NETWORK_WAIT_TIMEOUT_MS) {
  const normalizedKind = ATLAS_NETWORK_PRIORITY[kind] ? kind : "source";
  if (signal?.aborted) return Promise.reject(atlasNetworkAbortError());

  return new Promise((resolve, reject) => {
    const governor = state.networkGovernor;
    const job = {
      kind: normalizedKind,
      createdAt: Date.now(),
      cancelled: false,
      resolve,
      reject,
      cleanup() {}
    };

    const onAbort = () => {
      job.cancelled = true;
      governor.queue = governor.queue.filter(item => item !== job);
      job.cleanup();
      reject(atlasNetworkAbortError());
      atlasNetworkPump();
    };

    const timer = setTimeout(() => {
      job.cancelled = true;
      governor.queue = governor.queue.filter(item => item !== job);
      signal?.removeEventListener?.("abort", onAbort);
      const error = new Error(`File réseau occupée · ${normalizedKind}`);
      error.name = "NetworkQueueTimeout";
      reject(error);
      atlasNetworkPump();
    }, Math.max(1000, Number(waitTimeoutMs) || ATLAS_NETWORK_WAIT_TIMEOUT_MS));

    job.cleanup = () => {
      clearTimeout(timer);
      signal?.removeEventListener?.("abort", onAbort);
    };

    signal?.addEventListener?.("abort", onAbort, { once: true });
    governor.queue.push(job);
    atlasNetworkPump();
  });
}

function atlasReleaseNetwork(token) {
  const governor = state.networkGovernor;
  if (!governor?.active || governor.active.token !== token) return;
  governor.active = null;
  queueMicrotask(atlasNetworkPump);
}

function atlasNetworkBusy() {
  return !!state.networkGovernor?.active || !!state.networkGovernor?.queue?.length;
}

function atlasMarketRetryDelay(failureCount = 1) {
  const index = Math.min(
    ATLAS_MARKET_RETRY_BACKOFF_MS.length - 1,
    Math.max(0, Number(failureCount || 1) - 1)
  );
  return ATLAS_MARKET_RETRY_BACKOFF_MS[index];
}

function atlasMarketRetryLabel(failureCount = 1) {
  return formatAutoDelay(atlasMarketRetryDelay(failureCount));
}

async function fetchWithTimeout(url, options = {}, timeout = 12000) {
  const controller = new AbortController();
  const externalSignal = options?.signal || null;
  const networkKind = options?.networkKind || null;
  const networkWaitMs = options?.networkWaitMs || ATLAS_NETWORK_WAIT_TIMEOUT_MS;
  let networkToken = null;
  const onExternalAbort = () => controller.abort();
  if (externalSignal?.aborted) controller.abort();
  else externalSignal?.addEventListener?.("abort", onExternalAbort, { once: true });
  const timer = setTimeout(() => controller.abort(), timeout);
  const requestOptions = { ...options };
  delete requestOptions.signal;
  delete requestOptions.networkKind;
  delete requestOptions.networkWaitMs;
  try {
    if (networkKind) networkToken = await atlasAcquireNetwork(networkKind, externalSignal, networkWaitMs);
    const response = await fetch(url, {
      credentials: "omit",
      mode: "cors",
      referrerPolicy: "no-referrer",
      headers: { accept: "application/json", ...(requestOptions.headers || {}) },
      ...requestOptions,
      signal: controller.signal,
      cache: "no-store"
    });
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return await response.json();
  } catch (error) {
    if (externalSignal?.aborted) {
      const aborted = new Error("Requête annulée");
      aborted.name = "AbortError";
      throw aborted;
    }
    if (error?.name === "AbortError") throw new Error("Délai réseau dépassé");
    throw error;
  } finally {
    clearTimeout(timer);
    externalSignal?.removeEventListener?.("abort", onExternalAbort);
    if (networkToken) atlasReleaseNetwork(networkToken);
  }
}
async function fetchJsonWithRetry(url, options = {}, timeout = 12000, attempts = 2) {
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try { return await fetchWithTimeout(url, options, timeout); }
    catch (error) {
      lastError = error;
      const retryable = !error?.status || error.status === 429 || error.status >= 500;
      if (!retryable || attempt >= attempts) break;
      await new Promise(resolve => setTimeout(resolve, 1800 * attempt + Math.round(Math.random() * 500)));
    }
  }
  throw lastError || new Error("Source indisponible");
}
const ATLAS_CANONICAL_MARKET_SOURCE = "CoinGecko";


const ATLAS_COMPARISON_MAX_SERIES = 5;
const ATLAS_COMPARISON_REQUEST_SPACING_MS = 1100;
const ATLAS_COMPARISON_LONG_HORIZON_SPACING_MS = 2200;
const ATLAS_COMPARISON_RETRY_DELAYS_MS = Object.freeze([0]);
const ATLAS_COMPARISON_DIRECT_TIMEOUT_MS = 24000;
const ATLAS_MARKET_REFRESH_MS = 60 * 1000;
const ATLAS_ANALYSIS_MAX_AGE_MS = 15 * 60 * 1000;
const ATLAS_DIRECT_GRACE_MS = 15 * 60 * 1000;
const ATLAS_MARKET_MIN_ASSETS = 40;
const ATLAS_SPOT_REFRESH_MS = 30 * 1000;
const ATLAS_CHART_BACKGROUND_REFRESH_MS = 5 * 60 * 1000;
const ATLAS_PULSE_BACKOFF_MS = Object.freeze([60 * 1000, 120 * 1000, 300 * 1000]);
const ATLAS_MARKET_RETRY_BACKOFF_MS = Object.freeze([15 * 1000, 45 * 1000, 120 * 1000]);
const ATLAS_NETWORK_WAIT_TIMEOUT_MS = 45 * 1000;
const ATLAS_PERIOD_DEBOUNCE_MS = 320;

function atlasPulseBackoffDelay(failureCount = 1) {
  const index = Math.min(ATLAS_PULSE_BACKOFF_MS.length - 1, Math.max(0, Number(failureCount || 1) - 1));
  return ATLAS_PULSE_BACKOFF_MS[index];
}

function atlasPulseVisible() {
  return document.visibilityState !== "hidden";
}

function atlasAbortPulseController(controller) {
  try { controller?.abort?.(); } catch {}
}

function atlasClearPulseTimer(name) {
  const key = `${name}Timer`;
  const timer = state.marketPulse?.[key];
  if (timer) clearTimeout(timer);
  if (state.marketPulse) state.marketPulse[key] = null;
}


function atlasBrokerAgeLabel(timestamp) {
  const parsed = typeof timestamp === "number" ? timestamp : Date.parse(timestamp || "");
  if (!Number.isFinite(parsed)) return "heure inconnue";
  const minutes = Math.max(0, Math.round((Date.now() - parsed) / 60000));
  if (minutes < 2) return "moins de 2 min";
  if (minutes < 90) return `${minutes} min`;
  const hours = minutes / 60;
  return hours < 48 ? `${hours.toFixed(1)} h` : `${(hours / 24).toFixed(1)} j`;
}

function atlasExactTimestampLabel(timestamp) {
  const parsed = typeof timestamp === "number"
    ? Number(timestamp)
    : Date.parse(timestamp || "");
  if (!Number.isFinite(parsed)) return "horodatage inconnu";
  return new Date(parsed).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function atlasTimestampAgeMs(timestamp) {
  const parsed = typeof timestamp === "number"
    ? Number(timestamp)
    : Date.parse(timestamp || "");
  return Number.isFinite(parsed)
    ? Math.max(0, Date.now() - parsed)
    : Infinity;
}

function atlasMarketTruth() {
  const market = state.dataBroker?.market || {};
  const mode = String(market.mode || state.sourceLock?.mode || "none");
  const timestamp = market.timestamp || state.timestamp || state.sourceLock?.timestamp || null;
  const ageMs = atlasTimestampAgeMs(timestamp);

  if (mode === "direct") {
    return {
      level: "direct",
      mode,
      timestamp,
      ageMs,
      exact: atlasExactTimestampLabel(timestamp),
      age: atlasBrokerAgeLabel(timestamp),
      label: "Direct CoinGecko",
      delayed24h: false
    };
  }

  if (mode === "direct-conserved") {
    return {
      level: "direct-conserved",
      mode,
      timestamp,
      ageMs,
      exact: atlasExactTimestampLabel(timestamp),
      age: atlasBrokerAgeLabel(timestamp),
      label: "Dernière lecture directe conservée",
      delayed24h: true
    };
  }

  if (mode === "recent-cache") {
    return {
      level: "recent-cache",
      mode,
      timestamp,
      ageMs,
      exact: atlasExactTimestampLabel(timestamp),
      age: atlasBrokerAgeLabel(timestamp),
      label: "Cache récent CoinGecko",
      delayed24h: true
    };
  }

  if (["local-cache", "github-cache", "browser-cache"].includes(mode)) {
    return {
      level: "stale-cache",
      mode,
      timestamp,
      ageMs,
      exact: atlasExactTimestampLabel(timestamp),
      age: atlasBrokerAgeLabel(timestamp),
      label: "Cache daté CoinGecko",
      delayed24h: true
    };
  }

  return {
    level: "blocked",
    mode,
    timestamp,
    ageMs,
    exact: atlasExactTimestampLabel(timestamp),
    age: atlasBrokerAgeLabel(timestamp),
    label: "Indisponible",
    delayed24h: true
  };
}

function atlasMarketChangeIsDelayed() {
  return atlasMarketTruth().delayed24h;
}

function atlasFmtMarketPct(value) {
  const formatted = fmtPct(value);
  if (!Number.isFinite(Number(value))) return formatted;
  return atlasMarketChangeIsDelayed()
    ? `≈ ${formatted}`
    : formatted;
}

function atlasChartSourceMode(result = null) {
  const mode = String(
    result?.sourceMode
    || state.dataBroker?.chart?.result?.sourceMode
    || state.dataBroker?.chart?.mode
    || "none"
  );

  if (mode === "coingecko-direct") return "direct";
  if (mode === "comparison-base100") {
    const entries = result?.entries || state.dataBroker?.chart?.result?.entries || [];
    return entries.some(entry => atlasChartSourceMode(entry?.result) !== "direct")
      ? "cache"
      : "direct";
  }
  if (["browser-cache", "local-cache", "github-cache", "recent-cache"].includes(mode)) {
    return "cache";
  }
  return "unknown";
}

function atlasChartWorstFreshness(result = null, period = Number(state.chartPeriodDays || 1)) {
  if (result?.comparison && Array.isArray(result.entries)) {
    const levels = result.entries.map(entry =>
      atlasChartWorstFreshness(entry?.result, period)
    );
    if (levels.includes("archive")) return "archive";
    if (levels.includes("delayed")) return "delayed";
    return "fresh";
  }

  const level = result?.integrity?.metrics?.freshness?.level;
  return ["fresh", "delayed", "archive"].includes(level)
    ? level
    : "fresh";
}

function atlasChartTruth(result = null, period = Number(state.chartPeriodDays || 1)) {
  const source = atlasChartSourceMode(result);
  const freshness = atlasChartWorstFreshness(result, period);
  const metrics = result?.integrity?.metrics || {};
  const timestamp = Number.isFinite(Number(metrics.lastTimestamp))
    ? Number(metrics.lastTimestamp)
    : result?.generatedAt || state.dataBroker?.chart?.timestamp || null;

  let label = "Historique indisponible";
  if (source === "direct" && freshness === "fresh") label = "Historique direct CoinGecko";
  else if (source === "direct") label = "Historique direct retardé";
  else if (source === "cache" && freshness === "fresh") label = "Historique en cache récent";
  else if (source === "cache" && freshness === "delayed") label = "Historique en cache retardé";
  else if (source === "cache") label = "Historique en archive datée";

  return {
    source,
    freshness,
    timestamp,
    exact: atlasExactTimestampLabel(timestamp),
    age: atlasBrokerAgeLabel(timestamp),
    label
  };
}

function atlasSpotQuoteIsFreshDirect(coinId) {
  const book = state.dataBroker?.spotBook || {};
  const quote = book.quotes?.[coinId];
  const timestamp = quote?.timestamp || book.timestamp || null;
  const eur = Number(quote?.eur);

  return book.status === "ready"
    && book.mode === "direct"
    && Number.isFinite(eur)
    && eur > 0
    && atlasTimestampAgeMs(timestamp) <= ATLAS_SPOT_REFRESH_MS * 2;
}

function atlasSyncTruthDatasets() {
  const truth = atlasMarketTruth();
  document.documentElement.dataset.marketTruth = truth.level;
  document.body.dataset.marketTruth = truth.level;
}

function atlasBrokerModeLabel(mode) {
  if (mode === "direct") return "Direct CoinGecko";
  if (mode === "direct-conserved") return "Dernière lecture directe conservée";
  if (mode === "recent-cache") return "Cache récent CoinGecko";
  if (mode === "github-cache") return "Archive GitHub CoinGecko";
  if (mode === "local-cache") return "Cache daté CoinGecko";
  if (mode === "browser-cache") return "Cache navigateur CoinGecko";
  if (mode === "coingecko-direct") return "Historique direct CoinGecko";
  if (mode === "comparison-base100") return "Comparaison Base 100";
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

function atlasBrokerQuoteFor(coinId) {
  const quote = state.dataBroker?.spotBook?.quotes?.[coinId];
  const eur = Number(quote?.eur);
  return Number.isFinite(eur) && eur > 0 ? quote : null;
}

function atlasHasPositiveQuote(value) {
  const number = Number(value);
  return value !== null && value !== undefined && value !== "" && Number.isFinite(number) && number > 0;
}

function atlasMergeSpotBookIntoCoins() {
  const quotes = state.dataBroker?.spotBook?.quotes || {};
  const changedIds = [];
  state.coins = (state.coins || []).map(coin => {
    const quote = quotes[coin.id];
    const eur = Number(quote?.eur);
    if (!Number.isFinite(eur) || eur <= 0) return coin;
    changedIds.push(coin.id);
    return {
      ...coin,
      price: eur,
      priceEur: eur,
      priceUsd: atlasHasPositiveQuote(quote.usd) ? Number(quote.usd) : coin.priceUsd,
      change24h: Number.isFinite(Number(quote.change24hEur)) ? Number(quote.change24hEur) : coin.change24h,
      lastUpdated: quote.timestamp || coin.lastUpdated,
      spotUpdatedAt: quote.timestamp || null,
      source: ATLAS_CANONICAL_MARKET_SOURCE
    };
  });
  return changedIds;
}

function atlasBrokerCommitSpotBook(result) {
  const quotes = result?.quotes && typeof result.quotes === "object"
    ? result.quotes
    : Object.create(null);
  const ids = Object.keys(quotes);
  state.dataBroker.spotBook = {
    status: ids.length ? "ready" : "blocked",
    source: ATLAS_CANONICAL_MARKET_SOURCE,
    mode: ids.length ? "direct" : "none",
    timestamp: result?.updatedAt || new Date().toISOString(),
    ids,
    quotes,
    token: Number(state.dataBroker?.spotBook?.token || 0) + 1,
    error: ids.length ? null : "Aucun prix spot valide"
  };
  const changedIds = atlasMergeSpotBookIntoCoins();
  const selected = getSelectedCoin();
  if (selected) atlasBrokerSeedSpot(selected);
  return changedIds;
}

function atlasCaptureUiContinuity() {
  const active = document.activeElement instanceof Element ? document.activeElement : null;
  const tableShell = els.marketRows?.closest?.(".table-wrap, .market-table-wrap, [data-scroll-shell]") || null;
  return {
    windowX: window.scrollX,
    windowY: window.scrollY,
    tableX: tableShell?.scrollLeft || 0,
    tableY: tableShell?.scrollTop || 0,
    activeId: active?.id || "",
    activeRowId: active?.closest?.("[data-id]")?.dataset?.id || "",
    activeAction: active?.dataset?.marketAction || "",
    activeCoinId: active?.dataset?.coinId || "",
    selectionStart: typeof active?.selectionStart === "number" ? active.selectionStart : null,
    selectionEnd: typeof active?.selectionEnd === "number" ? active.selectionEnd : null
  };
}

function atlasRestoreUiContinuity(snapshot) {
  if (!snapshot) return;
  requestAnimationFrame(() => {
    window.scrollTo(snapshot.windowX, snapshot.windowY);
    const tableShell = els.marketRows?.closest?.(".table-wrap, .market-table-wrap, [data-scroll-shell]") || null;
    if (tableShell) {
      tableShell.scrollLeft = snapshot.tableX;
      tableShell.scrollTop = snapshot.tableY;
    }
    let target = snapshot.activeId ? document.getElementById(snapshot.activeId) : null;
    if (!target && snapshot.activeAction && snapshot.activeCoinId) {
      target = document.querySelector(`[data-market-action="${CSS.escape(snapshot.activeAction)}"][data-coin-id="${CSS.escape(snapshot.activeCoinId)}"]`);
    }
    if (!target && snapshot.activeRowId) {
      target = document.querySelector(`[data-id="${CSS.escape(snapshot.activeRowId)}"]`);
    }
    if (target?.focus) {
      target.focus({ preventScroll: true });
      if (snapshot.selectionStart !== null && typeof target.setSelectionRange === "function") {
        try { target.setSelectionRange(snapshot.selectionStart, snapshot.selectionEnd ?? snapshot.selectionStart); } catch {}
      }
    }
  });
}

function atlasPatchMarketRowSpot(coin) {
  const row = els.marketRows?.querySelector?.(`tr[data-id="${CSS.escape(coin.id)}"]`);
  if (!row) return;
  const cells = row.children;
  const priceBox = cells[2]?.querySelector?.(".price-dual");
  if (priceBox) {
    const eur = priceBox.querySelector("b");
    const usd = priceBox.querySelector("small");
    if (eur) eur.textContent = atlasFormatEUR(coin.priceEur ?? coin.price);
    if (usd) usd.textContent = atlasHasPositiveQuote(coin.priceUsd) ? atlasFormatUSD(coin.priceUsd) : "USD —";
  }
  if (cells[3]) {
    cells[3].className = clsPct(coin.change24h);
    cells[3].textContent = atlasFmtMarketPct(coin.change24h);
  }
}

function atlasPatchTickerSpot(changedIds = []) {
  const changed = new Set(changedIds);
  state.coins.forEach(coin => {
    if (changed.size && !changed.has(coin.id)) return;

    els.top5Track?.querySelectorAll(`[data-top5-id="${CSS.escape(coin.id)}"]`).forEach(item => {
      const price = item.querySelector(".top5-price");
      const change = item.querySelector(".top5-change");
      if (price) price.textContent = atlasFormatEUR(coin.priceEur ?? coin.price);
      if (change) {
        change.className = `top5-change ${clsPct(coin.change24h)} ${atlasMoveStrengthClass(coin.change24h)}`;
        change.textContent = atlasFmtMarketPct(coin.change24h);
      }
    });

    els.tickerTrack?.querySelectorAll(`[data-ticker-id="${CSS.escape(coin.id)}"]`).forEach(item => {
      const price = item.querySelector(".ticker-price");
      const change = item.querySelector(".ticker-change");
      if (price) price.textContent = atlasFormatEUR(coin.priceEur ?? coin.price);
      if (change) {
        change.className = `ticker-change ${clsPct(coin.change24h)} ${atlasMoveStrengthClass(coin.change24h)}`;
        change.textContent = atlasFmtMarketPct(coin.change24h);
      }
    });
  });
}

function atlasMarketRowsForCurrentView() {
  const query = (els.searchInput?.value || "").toLowerCase().trim();
  const filtered = state.coins
    .filter(coin => !query || coin.name.toLowerCase().includes(query) || coin.symbol.toLowerCase().includes(query))
    .filter(matchAssetFilter);
  return sortAssets(filtered).slice(0, 50);
}

function atlasPatchMarketRowSnapshot(row, coin, selection) {
  if (!row || !coin) return;
  const cells = row.children;
  const score = scoreCoin(coin);
  const compared = selection.includes(coin.id);
  const primary = coin.id === state.selectedCoinId && compared;

  row.classList.toggle("is-selected", primary);
  row.classList.toggle("is-compared", compared);
  row.setAttribute("aria-pressed", compared ? "true" : "false");

  if (cells[0]) cells[0].textContent = coin.rank ?? "—";
  const identity = cells[1];
  const image = identity?.querySelector?.("img");
  const name = identity?.querySelector?.("strong");
  const symbol = identity?.querySelector?.("small");
  const badge = identity?.querySelector?.(".asset-badge");
  if (image && coin.image && image.src !== coin.image) image.src = coin.image;
  if (name) name.textContent = coin.name;
  if (symbol) symbol.textContent = coin.symbol;
  if (badge) badge.textContent = classifyAsset(coin);

  const priceBox = cells[2]?.querySelector?.(".price-dual");
  if (priceBox) {
    const eur = priceBox.querySelector("b");
    const usd = priceBox.querySelector("small");
    if (eur) eur.textContent = atlasFormatEUR(coin.priceEur ?? coin.price);
    if (usd) usd.textContent = atlasHasPositiveQuote(coin.priceUsd) ? atlasFormatUSD(coin.priceUsd) : "USD —";
  }

  if (cells[3]) {
    cells[3].className = clsPct(coin.change24h);
    cells[3].textContent = atlasFmtMarketPct(coin.change24h);
  }
  if (cells[4]) {
    cells[4].className = clsPct(coin.change7d);
    cells[4].textContent = fmtPct(coin.change7d);
  }
  if (cells[5]) cells[5].textContent = num(coin.marketCap, fmtCompactEUR.format.bind(fmtCompactEUR));
  if (cells[6]) cells[6].textContent = num(coin.volume24h, fmtCompactEUR.format.bind(fmtCompactEUR));

  const toggle = cells[7]?.querySelector?.(`[data-market-action="compare"][data-coin-id="${CSS.escape(coin.id)}"]`);
  if (toggle) {
    toggle.classList.toggle("is-on", compared);
    toggle.setAttribute("aria-pressed", compared ? "true" : "false");
    toggle.setAttribute("aria-label", compared ? `Retirer ${coin.symbol} de la comparaison` : `Ajouter ${coin.symbol} à la comparaison`);
    toggle.textContent = compared ? "Retirer" : "Ajouter";
  }

  if (cells[8]) cells[8].textContent = score.score ?? "—";
  if (cells[9]) cells[9].textContent = beginnerDecision(coin);
}

function atlasPatchMarketTableSnapshot() {
  if (!els.marketRows || !atlasHasDisplayableMarket()) return;
  const desired = atlasMarketRowsForCurrentView();
  const existing = [...els.marketRows.querySelectorAll("tr[data-id]")];
  const sameOrder = existing.length === desired.length
    && existing.every((row, index) => row.dataset.id === desired[index]?.id);

  if (!sameOrder) {
    renderMarketTable();
    return;
  }

  const selection = atlasComparisonIds();
  existing.forEach((row, index) => atlasPatchMarketRowSnapshot(row, desired[index], selection));
  const updated = state.timestamp ? new Date(state.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "—";
  setText(
    els.tableNote,
    atlasV2Mode() === "essential"
      ? `${desired.length} actifs · ${selection.length} sélectionnés · ${state.mainSource} · mise à jour ${updated}`
      : `${desired.length} affichés · ${state.coins.length} chargés · sélection ${selection.length}/${ATLAS_COMPARISON_MAX_SERIES} · filtre ${state.assetFilter} · tri ${state.sortKey} · source ${state.mainSource} · ${updated}`
  );
}

function atlasPatchSpotDom(changedIds = []) {
  const continuity = atlasCaptureUiContinuity();
  atlasPatchTickerSpot(changedIds);
  const changed = new Set(changedIds);
  state.coins.forEach(coin => {
    if (!changed.size || changed.has(coin.id)) atlasPatchMarketRowSpot(coin);
  });
  const selected = getSelectedCoin();
  if (selected) renderScore(selected);
  atlasWatchSyncProfiles();
  const watchEvaluation = atlasWatchEvaluateAlerts();
  atlasWatchRenderStatus(watchEvaluation);
  atlasWatchRenderAlerts(watchEvaluation);
  atlasWatchRenderHistory(watchEvaluation);
  atlasWatchRenderMemoryAssets();
  atlasRefreshSelectedDetailOnly();
  renderMultiHorizon();
  renderSimulation();
  atlasRenderBrokerStrip();
  if (typeof renderAtlasMathCore === "function") renderAtlasMathCore();
  atlasEnsureMarketDomIntegrity();
  atlasRestoreUiContinuity(continuity);
}

function atlasPatchMarketSnapshotDom() {
  const continuity = atlasCaptureUiContinuity();
  atlasRenderMarketAccessNotice();
  atlasRenderBrokerStrip();
  renderMetrics();
  atlasRenderMarketCoreAtomic();
  renderWatchlist();
  const selected = getSelectedCoin() || state.coins[0] || null;
  renderScore(selected);
  renderRiskGrid();
  renderColdRead(true);
  renderBeginnerSummary();
  renderMultiHorizon();
  atlasRenderComparisonControls();
  renderDecisionBoard();
  renderSimulation();
  atlasRefreshSelectedDetailOnly();
  if (typeof renderAtlasMathCore === "function") renderAtlasMathCore();
  atlasRestoreUiContinuity(continuity);
}

function atlasBrokerSeedSpot(coin) {
  if (!coin) return;
  const current = state.dataBroker.spot;
  const directQuote = atlasBrokerQuoteFor(coin.id);
  if (directQuote) {
    state.dataBroker.spot = {
      status: "direct",
      coinId: coin.id,
      source: ATLAS_CANONICAL_MARKET_SOURCE,
      mode: "direct",
      eur: Number(directQuote.eur),
      usd: atlasHasPositiveQuote(directQuote.usd) ? Number(directQuote.usd) : null,
      timestamp: directQuote.timestamp || state.dataBroker.spotBook?.timestamp || null,
      token: Number(state.dataBroker.spotBook?.token || current?.token || 0),
      controller: state.marketPulse?.spotController || null,
      error: null
    };
    return;
  }
  if (current?.coinId === coin.id && current?.status === "direct" && Number.isFinite(Date.parse(current.timestamp || "")) && Date.now() - Date.parse(current.timestamp) < ATLAS_SPOT_REFRESH_MS) return;
  state.dataBroker.spot = {
    status: "snapshot",
    coinId: coin.id,
    source: ATLAS_CANONICAL_MARKET_SOURCE,
    mode: state.dataBroker.market?.mode || state.sourceLock?.mode || "none",
    eur: Number.isFinite(Number(coin.priceEur ?? coin.price)) ? Number(coin.priceEur ?? coin.price) : null,
    usd: atlasHasPositiveQuote(coin.priceUsd) ? Number(coin.priceUsd) : null,
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
    seriesTimestamp: Number.isFinite(metrics.lastTimestamp) ? new Date(metrics.lastTimestamp).toISOString() : result?.generatedAt || null,
    spotPatchedAt: null,
    pointCount: Number(metrics.pointCount || result?.series?.length || 0),
    latencyMs: Number.isFinite(Number(result?.diagnostics?.latencyMs ?? result?.latencyMs)) ? Number(result?.diagnostics?.latencyMs ?? result?.latencyMs) : null,
    retryCount: Number.isFinite(Number(result?.diagnostics?.retryCount ?? result?.retryCount)) ? Number(result?.diagnostics?.retryCount ?? result?.retryCount) : 0,
    contextKey: atlasExpectedChartContextKey(coin?.id ? [coin.id] : [], Number(period || 1)),
    result: result || null,
    error: result?.technicalReason || result?.reason || null
  };
}

function atlasRenderBrokerStrip() {
  const market = state.dataBroker.market || {};
  const spot = state.dataBroker.spot || {};
  const chart = state.dataBroker.chart || {};
  const marketTruth = atlasMarketTruth();
  const chartTruth = atlasChartTruth(chart.result, chart.period);

  setText(
    els.brokerMarket,
    market.status === "ready" ? marketTruth.label : "Indisponible"
  );
  setText(
    els.brokerMarketTime,
    market.timestamp
      ? `${market.assetsCount || 0} actifs · ${marketTruth.exact} · ${marketTruth.age}`
      : "—"
  );

  const spotReady =
    spot.coinId === state.selectedCoinId
    && ["direct", "snapshot"].includes(spot.status);

  const spotDirect =
    spotReady
    && spot.mode === "direct"
    && atlasTimestampAgeMs(spot.timestamp) <= ATLAS_SPOT_REFRESH_MS * 2;

  setText(
    els.brokerSpot,
    !spotReady
      ? "En attente"
      : spotDirect
        ? "Prix spot direct"
        : "Prix du snapshot"
  );
  setText(
    els.brokerSpotTime,
    spotReady && spot.timestamp
      ? `${atlasExactTimestampLabel(spot.timestamp)} · ${atlasBrokerAgeLabel(spot.timestamp)}`
      : "—"
  );

  const chartReady =
    chart.coinId === state.selectedCoinId
    && chart.period === Number(state.chartPeriodDays || 1)
    && chart.status === "ready"
    && atlasChartContextMatches(chart);

  setText(
    els.brokerChart,
    chartReady
      ? chartTruth.label
      : chart.status === "loading"
        ? "Chargement…"
        : chart.status === "blocked"
          ? "Indisponible"
          : "En attente"
  );

  const chartTimestamp = chart.seriesTimestamp || chart.timestamp;
  const spotObservation =
    chart.spotObservedAt
      ? ` · spot observé ${atlasExactTimestampLabel(chart.spotObservedAt)}`
      : "";

  setText(
    els.brokerChartTime,
    chartReady
      ? `${chart.pointCount || 0} pts · série ${atlasExactTimestampLabel(chartTimestamp)}${spotObservation}`
      : "—"
  );

  atlasSyncTruthDatasets();
  atlasRenderDiagnostics();
}

function atlasRenderDiagnostics() {
  const market = state.dataBroker.market || {};
  const chart = state.dataBroker.chart || {};
  const eur = (state.sourceStatus || []).find(item => item?.key === "coingecko-eur") || null;
  const usd = (state.sourceStatus || []).find(item => item?.key === "coingecko-usd") || null;
  const coin = getSelectedCoin();
  const chartKey = coin ? atlasChartKey(coin, Number(state.chartPeriodDays || 1)) : "";
  const retryCount = Number.isFinite(Number(chart.retryCount))
    ? Number(chart.retryCount)
    : Number(state.chartEngineV2?.retryAttempts?.[chartKey] || 0);
  const chartContext = atlasChartContextStatus();
  const chartTruth = atlasChartTruth(chart.result, chart.period);
  const chartMode = chart.status === "ready" && chartContext.ready
    ? chartTruth.label
    : chartContext.stale ? "Contexte précédent ignoré"
      : chart.status === "loading" ? "Chargement direct" : chart.status === "blocked" ? "Indisponible" : "En attente";
  const sourceDetail = market.status === "ready"
    ? `${market.assetsCount || 0} actifs · ${(market.quoteCurrencies || []).join(" + ") || "EUR"}`
    : market.error || eur?.detail || "Aucun snapshot";
  const marketError = eur && eur.status !== "OK" ? eur.detail : null;
  const usdError = usd && !["OK", "NON LANCÉ"].includes(usd.status) ? usd.detail : null;
  const lastError = chart.error || marketError || usdError || "Aucune erreur";

  setText(els.diagSourceMode, market.status === "ready" ? atlasBrokerModeLabel(market.mode) : "Indisponible");
  setText(els.diagSourceDetail, sourceDetail);
  setText(els.diagMarketLatency, Number.isFinite(Number(eur?.ms)) ? `${Math.round(Number(eur.ms))} ms` : "—");
  setText(els.diagUsdLatency, `USD : ${Number.isFinite(Number(usd?.ms)) ? `${Math.round(Number(usd.ms))} ms` : usd?.status || "—"}`);
  setText(els.diagChartMode, chartMode);
  setText(els.diagChartLatency, `Latence : ${Number.isFinite(Number(chart.latencyMs)) ? `${Math.round(Number(chart.latencyMs))} ms` : chart.mode === "browser-cache" ? "cache local" : "—"}`);
  setText(els.diagRetryCount, `${retryCount} retry${retryCount > 1 ? "s" : ""}`);
  setText(els.diagLastError, lastError);
}

function atlasRenderMarketAccessNotice() {
  /* Build 28.1.42 — ZERO EXTRA PANELS LOCK
     Source truth is already exposed by the existing header controls:
     liveStatus, tableDecision, sourceName and sourceTime.
     No standalone notice is rendered between Home and Graphique. */
  const legacyNotice = els.offlineNotice;
  if (legacyNotice) legacyNotice.hidden = true;
}

async function atlasRefreshSelectedSpot(coin) {
  if (!coin?.id) return null;
  atlasBrokerSeedSpot(coin);
  atlasRenderBrokerStrip();
  atlasRefreshSelectedDetailOnly();
  return state.dataBroker.spot;
}

const SourceAdapter = {
  async coingeckoTop50Eur(options = {}) {
    const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=50&page=1&locale=fr&precision=full&sparkline=false&price_change_percentage=1h,24h,7d,30d";
    const rows = await fetchJsonWithRetry(url, { signal: options.signal, networkKind: "market" }, 14000, 1);
    if (!Array.isArray(rows) || rows.length < ATLAS_MARKET_MIN_ASSETS) {
      throw new Error(`Flux EUR incomplet : ${Array.isArray(rows) ? rows.length : 0}/50`);
    }

    const completedAt = new Date().toISOString();
    const markets = rows.map(coin => {
      const priceEur = Number(coin.current_price);
      if (!coin?.id || !Number.isFinite(priceEur) || priceEur <= 0) return null;
      const lastUpdated = Number.isFinite(Date.parse(coin.last_updated || "")) ? coin.last_updated : completedAt;
      return {
        id: coin.id,
        rank: Number(coin.market_cap_rank),
        name: coin.name,
        symbol: String(coin.symbol || "").toUpperCase(),
        image: coin.image,
        price: priceEur,
        priceEur,
        priceUsd: null,
        change1h: Number.isFinite(Number(coin.price_change_percentage_1h_in_currency)) ? Number(coin.price_change_percentage_1h_in_currency) : null,
        change24h: Number.isFinite(Number(coin.price_change_percentage_24h_in_currency ?? coin.price_change_percentage_24h)) ? Number(coin.price_change_percentage_24h_in_currency ?? coin.price_change_percentage_24h) : null,
        change7d: Number.isFinite(Number(coin.price_change_percentage_7d_in_currency)) ? Number(coin.price_change_percentage_7d_in_currency) : null,
        change30d: Number.isFinite(Number(coin.price_change_percentage_30d_in_currency)) ? Number(coin.price_change_percentage_30d_in_currency) : null,
        high24h: Number.isFinite(Number(coin.high_24h)) ? Number(coin.high_24h) : null,
        low24h: Number.isFinite(Number(coin.low_24h)) ? Number(coin.low_24h) : null,
        marketCap: Number.isFinite(Number(coin.market_cap)) ? Number(coin.market_cap) : null,
        marketCapUsd: null,
        volume24h: Number.isFinite(Number(coin.total_volume)) ? Number(coin.total_volume) : null,
        volume24hUsd: null,
        sparkline7d: [],
        lastUpdated,
        source: ATLAS_CANONICAL_MARKET_SOURCE,
        sourceMode: "direct",
        quoteCurrencies: ["EUR"],
        timestamp: completedAt
      };
    }).filter(Boolean).sort((a, b) => (a.rank || 999999) - (b.rank || 999999));

    if (markets.length < ATLAS_MARKET_MIN_ASSETS) throw new Error(`Top 50 EUR incomplet : ${markets.length}/50`);
    const totalMarketCapEur = markets.reduce((sum, coin) => sum + (Number(coin.marketCap) || 0), 0);
    const totalVolumeEur = markets.reduce((sum, coin) => sum + (Number(coin.volume24h) || 0), 0);
    const btc = markets.find(coin => coin.id === "bitcoin" || coin.symbol === "BTC");
    const btcShare = totalMarketCapEur > 0 && btc?.marketCap ? Number(btc.marketCap) / totalMarketCapEur * 100 : null;

    return {
      markets,
      global: {
        total_market_cap: { eur: totalMarketCapEur },
        total_volume: { eur: totalVolumeEur },
        market_cap_percentage: { btc: btcShare },
        scope: "top50"
      },
      generatedAt: completedAt,
      snapshotId: `coingecko-top50-eur_${completedAt}`,
      leg: { key: "coingecko-eur", name: "CoinGecko EUR", kind: "Top 50 marché", status: "OK", detail: `${markets.length} actifs` }
    };
  },

  async coingeckoUsdForIds(ids, options = {}) {
    const cleanIds = [...new Set((ids || []).filter(Boolean))].slice(0, 50);
    if (!cleanIds.length) return { prices: new Map(), updatedAt: null };
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(cleanIds.join(","))}&vs_currencies=usd&include_last_updated_at=true&precision=full`;
    const payload = await fetchJsonWithRetry(url, { signal: options.signal, networkKind: "usd" }, 11000, 1);
    if (!payload || typeof payload !== "object") throw new Error("Flux USD absent");
    const prices = new Map();
    let newest = 0;
    for (const id of cleanIds) {
      const row = payload[id];
      const usd = Number(row?.usd);
      if (!Number.isFinite(usd) || usd <= 0) continue;
      prices.set(id, usd);
      const updated = Number(row?.last_updated_at || 0) * 1000;
      if (Number.isFinite(updated) && updated > newest) newest = updated;
    }
    if (prices.size < Math.min(10, cleanIds.length)) throw new Error(`Flux USD incomplet : ${prices.size}/${cleanIds.length}`);
    return { prices, updatedAt: newest ? new Date(newest).toISOString() : new Date().toISOString() };
  },

  async coingeckoSpotForIds(ids, options = {}) {
    const cleanIds = [...new Set((ids || []).filter(Boolean))].slice(0, 10);
    if (!cleanIds.length) return { quotes: Object.create(null), updatedAt: null };
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(cleanIds.join(","))}&vs_currencies=eur,usd&include_24hr_change=true&include_last_updated_at=true&precision=full`;
    const payload = await fetchJsonWithRetry(url, { signal: options.signal, networkKind: "spot" }, 10000, 1);
    if (!payload || typeof payload !== "object") throw new Error("Flux spot absent");
    const quotes = Object.create(null);
    let newest = 0;
    for (const id of cleanIds) {
      const row = payload[id];
      const eur = Number(row?.eur);
      if (!Number.isFinite(eur) || eur <= 0) continue;
      const updatedMs = Number(row?.last_updated_at || 0) * 1000;
      newest = Math.max(newest, Number.isFinite(updatedMs) ? updatedMs : 0);
      quotes[id] = {
        eur,
        usd: Number.isFinite(Number(row?.usd)) && Number(row.usd) > 0 ? Number(row.usd) : null,
        change24hEur: Number.isFinite(Number(row?.eur_24h_change)) ? Number(row.eur_24h_change) : null,
        change24hUsd: Number.isFinite(Number(row?.usd_24h_change)) ? Number(row.usd_24h_change) : null,
        timestamp: Number.isFinite(updatedMs) && updatedMs > 0 ? new Date(updatedMs).toISOString() : new Date().toISOString()
      };
    }
    if (!Object.keys(quotes).length) throw new Error("Aucun prix spot valide");
    return { quotes, updatedAt: newest ? new Date(newest).toISOString() : new Date().toISOString() };
  }
};

function atlasApplyUsdEnrichment(result) {
  const prices = result?.prices;
  if (!(prices instanceof Map) || !prices.size || !state.coins.length) return 0;
  let count = 0;
  state.coins = state.coins.map(coin => {
    const usd = prices.get(coin.id);
    if (!Number.isFinite(Number(usd)) || Number(usd) <= 0) return coin;
    count += 1;
    return {
      ...coin,
      priceUsd: Number(usd),
      quoteCurrencies: ["EUR", "USD"],
      usdUpdatedAt: result.updatedAt || null
    };
  });
  if (state.dataBroker.market?.status === "ready") {
    state.dataBroker.market.quoteCurrencies = count ? ["EUR", "USD"] : ["EUR"];
  }
  const selected = state.coins.find(coin => coin.id === state.selectedCoinId);
  if (selected) atlasBrokerSeedSpot(selected);
  saveMarketCache();
  return count;
}

const liveSources = [
  { key: "coingecko-eur", name: "CoinGecko EUR", kind: "Top 50 marché · requis" },
  { key: "coingecko-usd", name: "CoinGecko USD", kind: "Enrichissement Top 50 · optionnel" }
]; function setLiveStatus(mode, text) { if (!els.liveStatus) return; els.liveStatus.className = `pill ${mode}`; els.liveStatus.textContent = text;
}
function atlasSetStableDirectMarketStatus() {
  const assetCount = Number(state.coins?.length || 0);
  setLiveStatus("ok", "Marché Top 50 EUR actualisé");
  setText(els.sourceName, "CoinGecko direct · Top 50 EUR");
  setText(els.sourceTime, atlasExactTimestampLabel(state.timestamp));
  setTableDecision(`${assetCount} actifs EUR directs · pulse 60 s`, "ok");
}

function atlasKeepDirectStatusDuringTransientFailure(previous, error, context = "Actualisation") {
  if (!previous || !atlasCanonicalSnapshot(previous.coins)) return false;
  if (Number(state.marketPulse.marketFailures || 0) >= ATLAS_MARKET_DEGRADE_AFTER_FAILURES) return false;

  const previousTime = Date.parse(previous.timestamp || "");
  const age = Number.isFinite(previousTime) ? Math.max(0, Date.now() - previousTime) : Infinity;
  if (age > ATLAS_DIRECT_GRACE_MS) return false;

  state.coins = previous.coins;
  state.global = previous.global;
  state.timestamp = previous.timestamp;
  state.mainSource = "CoinGecko · dernière lecture directe conservée";
  state.liveOk = true;

  atlasSetSourceLock(
    "direct-conserved",
    state.timestamp,
    `${context} différée · dernière réponse directe conservée · nouvelle tentative programmée · ${cleanError(error)}`,
    true,
    previous.snapshotId || previous.sourceLock?.snapshotId || null
  );

  atlasBrokerCommitMarket(
    {
      coins: state.coins,
      global: state.global,
      timestamp: state.timestamp,
      snapshotId: state.sourceLock.snapshotId
    },
    "direct-conserved"
  );

  setLiveStatus("ok", "Dernière lecture conservée · nouvel essai");
  setText(els.sourceName, state.mainSource);
  setText(els.sourceTime, atlasExactTimestampLabel(state.timestamp));
  setTableDecision(`${state.coins.length} actifs EUR · dernière lecture conservée`, "ok");

  atlasSyncTruthDatasets();
  atlasPatchMarketSnapshotDom();
  return true;
}
 function cleanError(error) { return String(error?.message || error || "Erreur inconnue") .replace(/AbortError/i, "Timeout") .slice(0, 72);
} function detailFromResult(result) { if (!result) return "OK"; if (result.backendRequired) return result.detail || "Backend requis"; if (result.diagnosticOnly) return result.detail || "Diagnostic uniquement"; if (result.markets) return `${result.markets.length} actifs EUR + USD fusionnés`; if (result.pairs !== undefined) return `${result.pairs} paires`; if (result.networks !== undefined) return `${result.networks} réseaux`; if (result.protocols !== undefined) return `${result.protocols} protocoles`; if (result.symbol) return result.symbol; return "OK";
} function normalizeSourceStatusList(list = state.sourceStatus) { const map = new Map(); for (const item of list || []) { if (!item || !item.key) continue; map.set(item.key, item); } return [...map.values()];
} function pushSourceStatus(record) { if (!record || !record.key) return; state.sourceStatus = normalizeSourceStatusList(state.sourceStatus).filter(item => item.key !== record.key); state.sourceStatus.push(record);
} function updateSourceMetric(doneOverride = null) {
  state.sourceStatus = normalizeSourceStatusList(state.sourceStatus);
  const eur = state.sourceStatus.find(item => item.key === "coingecko-eur");
  const usd = state.sourceStatus.find(item => item.key === "coingecko-usd");
  const eurOk = eur?.status === "OK";
  const usdOk = usd?.status === "OK";
  setText(els.metricSources, eurOk ? (usdOk ? "EUR + USD" : "EUR OK") : "—");
  if (!eur) setText(els.metricSourcesHint, "Marché EUR en attente");
  else if (!eurOk) setText(els.metricSourcesHint, `Marché EUR indisponible · ${escapeHtml(eur.detail || "échec")}`);
  else if (usdOk) setText(els.metricSourcesHint, "Top 50 EUR actif · prix USD directs disponibles");
  else setText(els.metricSourcesHint, "Top 50 EUR actif · USD optionnel indisponible");
} 
function atlasHasDisplayableMarket(coins = state.coins) {
  return atlasCanonicalSnapshot(coins) && coins.length > 0;
}

function atlasRememberGoodMarket(reason = "snapshot validé") {
  if (!atlasHasDisplayableMarket()) return false;
  state.marketContinuity.lastGood = {
    coins: state.coins,
    global: state.global,
    timestamp: state.timestamp,
    snapshotId: state.sourceLock?.snapshotId || null,
    mainSource: state.mainSource || ATLAS_CANONICAL_MARKET_SOURCE,
    sourceMode: state.sourceLock?.mode || "direct"
  };
  state.marketContinuity.lastGoodAt = new Date().toISOString();
  state.marketContinuity.lastReason = String(reason || "snapshot validé");
  return true;
}

function atlasRestoreRememberedMarket(reason = "réseau temporairement indisponible") {
  const remembered = state.marketContinuity?.lastGood;
  if (!remembered || !atlasCanonicalSnapshot(remembered.coins)) return false;

  state.coins = remembered.coins;
  state.global = remembered.global || null;
  state.timestamp = remembered.timestamp || new Date().toISOString();
  state.mainSource = remembered.mainSource || "CoinGecko · dernier snapshot valide";
  state.liveOk = true;

  const rememberedWasDirect = ["direct", "direct-conserved"].includes(remembered.sourceMode);
  const restoredMode = rememberedWasDirect && atlasMarketAgeMs() <= ATLAS_DIRECT_GRACE_MS
    ? "direct-conserved"
    : "local-cache";

  atlasSetSourceLock(
    restoredMode,
    state.timestamp,
    `Snapshot conservé : ${String(reason || "réseau différé")}`,
    true,
    remembered.snapshotId || null
  );

  atlasBrokerCommitMarket({
    coins: state.coins,
    global: state.global,
    timestamp: state.timestamp,
    snapshotId: remembered.snapshotId || null
  }, state.sourceLock.mode);

  state.marketContinuity.restoreCount += 1;
  state.marketContinuity.lastReason = String(reason || "réseau différé");

  const conservedDirect = state.sourceLock.mode === "direct-conserved";
  setLiveStatus("warn", conservedDirect ? "Dernière lecture conservée" : "Mode archive");
  setText(els.sourceName, conservedDirect
    ? "CoinGecko · dernière lecture directe conservée"
    : "CoinGecko · archive locale");
  setText(els.sourceTime, state.timestamp ? atlasExactTimestampLabel(state.timestamp) : "—");
  setTableDecision(
    conservedDirect
      ? "Top 50 conservé · nouvelle tentative programmée"
      : "Archive CoinGecko conservée · analyses live suspendues",
    "warn"
  );

  return true;
}

function atlasEnsureMarketDomIntegrity() {
  if (!atlasHasDisplayableMarket()) return false;

  if (!state.liveOk) state.liveOk = true;

  const rowCount = els.marketRows?.querySelectorAll?.("tr[data-id]")?.length || 0;
  if (!rowCount) renderMarketTable();

  const topFiveCount = els.top5Track?.querySelectorAll?.("[data-top5-id]")?.length || 0;
  if (!topFiveCount) atlasRenderTopFiveRibbon();

  const flowCount = els.tickerTrack?.querySelectorAll?.("[data-ticker-id]")?.length || 0;
  if (!flowCount) atlasRenderMarketFlowRibbon();

  return true;
}

function atlasRenderMarketCoreAtomic() {
  if (!atlasHasDisplayableMarket()) {
    renderEmptyMarket("Livecheck requis. Aucun prix inventé.");
    atlasRenderTopFiveRibbon();
    atlasRenderMarketFlowRibbon();
    return false;
  }

  if (!state.liveOk) state.liveOk = true;

  renderMarketTable();
  renderTicker();

  requestAnimationFrame(() => {
    atlasEnsureMarketDomIntegrity();
  });

  return true;
}

function clearMarketDisplay(reason = "Marché live indisponible.", options = {}) {
  const force = options?.force === true;

  if (!force) {
    if (atlasHasDisplayableMarket()) {
      state.liveOk = true;
      atlasRememberGoodMarket("état courant conservé avant effacement");
      atlasRenderMarketCoreAtomic();
      return false;
    }

    if (atlasRestoreRememberedMarket(reason) || applyMarketCache(reason)) {
      atlasRenderMarketCoreAtomic();
      return false;
    }
  }

  state.liveOk = false;
  state.mainSource = null;
  state.timestamp = null;
  state.coins = [];
  state.global = null;
  atlasBrokerResetMarket(reason);

  setText(els.metricMarketCap, "—");
  setText(els.metricMarketCapHint, "Donnée non récupérée");
  setText(els.metricVolume, "—");
  setText(els.metricVolumeHint, "Donnée non récupérée");
  setText(els.metricBtcDom, "—");
  setText(els.metricBtcDomHint, "Donnée non récupérée");
  setHTML(els.top5Track, `<span class="market-ribbon-empty">${escapeHtml(reason)}</span>`);
  setHTML(els.tickerTrack, `<span class="ticker-meta">${escapeHtml(reason)} · aucun prix affiché · pas de tableau fictif</span>`);

  renderEmptyMarket(`${reason.toUpperCase()} — aucun tableau chiffré.`);
  renderScore(null);
  renderWatchlist();
  renderRiskGrid();
  renderColdRead(false);
  renderBeginnerSummary();
  renderMultiHorizon();
  atlasRenderComparisonControls();
  renderAnalystPanel();
  renderDecisionBoard();
  return true;
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
function atlasMarketAgeMs() {
  const timestamp = Date.parse(state.timestamp || state.sourceLock?.timestamp || "");
  return Number.isFinite(timestamp) ? Math.max(0, Date.now() - timestamp) : Infinity;
}
function atlasAnalysisLiveReady() {
  return !!state.liveOk && state.sourceLock?.valid === true && state.sourceLock?.mode === "direct" && atlasCanonicalSnapshot(state.coins) && state.coins.length >= ATLAS_MARKET_MIN_ASSETS && atlasMarketAgeMs() <= ATLAS_ANALYSIS_MAX_AGE_MS;
}
function saveMarketCache() {
  if (!state.coins?.length || state.sourceLock?.mode !== "direct" || !atlasCanonicalSnapshot(state.coins)) return;
  try {
    localStorage.setItem(MARKET_CACHE_KEY, JSON.stringify({
      schema: "atlas_market_cache_top50_v1",
      version: ATLAS_RELEASE,
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
  const keys = [MARKET_CACHE_KEY, ...LEGACY_MARKET_CACHE_KEYS];
  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || parsed.canonical_source !== ATLAS_CANONICAL_MARKET_SOURCE || !atlasCanonicalSnapshot(parsed.coins)) continue;
      if (key !== MARKET_CACHE_KEY) {
        try { localStorage.setItem(MARKET_CACHE_KEY, JSON.stringify({ ...parsed, version: ATLAS_RELEASE, migrated_from: key })); } catch {}
      }
      return parsed;
    } catch {}
  }
  return null;
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
  if (!state.graphSelectionCleared && (!state.selectedCoinId || !state.coins.some(c => c.id === state.selectedCoinId))) state.selectedCoinId = state.coins[0]?.id || "bitcoin";
  saveMarketCache();
  atlasRememberGoodMarket(`snapshot ${mode || "direct"} validé`);
  return true;
}
function atlasPrimeMarketCacheSilently() {
  const cache = loadMarketCache();
  atlasStartup.cacheAvailable = !!cache;
  atlasStartup.cacheTimestamp = cache?.timestamp || null;
  return !!cache;
}

function atlasRenderDirectFirstStartup() {
  atlasSetSourceLock("none", null, "Vérification CoinGecko directe en cours", false);
  setLiveStatus("warn", "Vérification CoinGecko");
  setText(els.sourceName, "CoinGecko direct · vérification en cours");
  setText(els.sourceTime, "—");
  setTableDecision(
    atlasStartup.cacheAvailable
      ? "Vérification directe en cours · archive locale gardée en secours silencieux"
      : "Vérification directe en cours · aucun cache affiché avant échec confirmé",
    "warn"
  );
}

async function atlasRunStartupLivecheck() {
  if (atlasStartup.started) return atlasStartup.promise || false;

  atlasStartup.started = true;
  atlasStartup.directAttemptAt = Date.now();
  atlasRenderDirectFirstStartup();

  atlasStartup.promise = (async () => {
    try {
      return await runLivecheck();
    } finally {
      atlasStartup.completed = true;
    }
  })();

  return atlasStartup.promise;
}

function applyMarketCache(reason = "CoinGecko direct indisponible : dernière lecture directe conservée en archive locale.") {
  const cache = loadMarketCache();
  if (!cache) return false;
  const applied = atlasApplyCanonicalSnapshot({ coins: cache.coins, global: cache.global, timestamp: cache.timestamp, snapshotId: cache.snapshot_id, sourceLabel: "CoinGecko · archive locale" }, "local-cache");
  if (!applied) return false;
  setLiveStatus("warn", "Mode archive");
  setText(els.sourceName, state.mainSource);
  setText(els.sourceTime, atlasExactTimestampLabel(state.timestamp));
  setTableDecision(`ARCHIVE DATÉE · snapshot ${atlasExactTimestampLabel(state.timestamp)} · analyses suspendues`, "warn");
  atlasRenderMarketAccessNotice();
  renderAll();
  return true;
}
function explainForBeginnerLiveFailure(okCount = 0) {
  const total = Math.max(1, Number(state.sourceStatusExpectedTotal || liveSources.length));
  return `CoinGecko direct est indisponible. ${Math.min(okCount, total)}/${total} sources techniques ont répondu, mais Atlas refuse de mélanger leurs prix. ` + "Atlas conserve uniquement la dernière lecture CoinGecko locale ; sinon les prix et scores sont bloqués.";
}
function atlasRestorePreviousSnapshot(previous, error, context = "Actualisation") {
  if (!previous || !atlasCanonicalSnapshot(previous.coins)) return false;

  state.coins = previous.coins;
  state.global = previous.global;
  state.timestamp = previous.timestamp;
  state.liveOk = true;

  const age = atlasMarketAgeMs();
  const recent = age <= ATLAS_DIRECT_GRACE_MS;
  const restoredMode = recent ? "recent-cache" : "local-cache";

  state.mainSource = recent
    ? "CoinGecko · cache récent"
    : "CoinGecko · cache daté";

  atlasSetSourceLock(
    restoredMode,
    state.timestamp,
    `${context} différée : ${cleanError(error)}`,
    true,
    previous.snapshotId || previous.sourceLock?.snapshotId || null
  );

  atlasBrokerCommitMarket(
    {
      coins: state.coins,
      global: state.global,
      timestamp: state.timestamp,
      snapshotId: state.sourceLock.snapshotId
    },
    restoredMode
  );

  const exact = atlasExactTimestampLabel(state.timestamp);

  if (recent) {
    setLiveStatus("warn", "Cache récent · réseau différé");
    setText(els.sourceName, "CoinGecko · cache récent");
    setTableDecision(
      `CACHE RÉCENT · snapshot ${exact} · variation 24 h retardée`,
      "warn"
    );
  } else {
    setLiveStatus("warn", "Archive datée");
    setText(els.sourceName, "CoinGecko · cache daté");
    setTableDecision(
      `ARCHIVE DATÉE · snapshot ${exact} · analyses suspendues`,
      "warn"
    );
  }

  setText(els.sourceTime, exact);
  atlasSyncTruthDatasets();
  atlasRememberGoodMarket(`${context} : snapshot précédent restauré`);
  renderAll();
  return true;
}

function atlasDelay(ms) { return new Promise(resolve => setTimeout(resolve, Math.max(0, Number(ms) || 0))); }

function atlasPulseSelectedIds() {
  const fixedTopFive = atlasCuratedTopIds(5);
  const selected = atlasComparisonIds();
  const fallback = state.selectedCoinId ? [state.selectedCoinId] : [];
  return [...new Set(
    [...fixedTopFive, ...(selected.length ? selected : fallback)]
      .filter(id => state.coins.some(coin => coin.id === id))
  )].slice(0, 10);
}

function atlasScheduleSpotPulse(delayMs = ATLAS_SPOT_REFRESH_MS) {
  atlasClearPulseTimer("spot");
  if (!state.auto?.enabled || !atlasPulseVisible()) return;
  state.marketPulse.spotTimer = setTimeout(() => {
    state.marketPulse.spotTimer = null;
    void atlasRefreshSpotBook();
  }, Math.max(500, Number(delayMs) || ATLAS_SPOT_REFRESH_MS));
}

function atlasScheduleChartPulse(delayMs = ATLAS_CHART_BACKGROUND_REFRESH_MS) {
  atlasClearPulseTimer("chart");
  if (!state.auto?.enabled || !atlasPulseVisible()) return;
  state.marketPulse.chartTimer = setTimeout(() => {
    state.marketPulse.chartTimer = null;
    void atlasMaybeRefreshHistoricalChart();
  }, Math.max(1000, Number(delayMs) || ATLAS_CHART_BACKGROUND_REFRESH_MS));
}

async function atlasRefreshSpotBook(options = {}) {
  if (!state.auto?.enabled || !state.liveOk || !state.coins.length || !atlasPulseVisible()) return false;
  if (state.marketPulse.spotBusy) return false;
  if (!options.force && (state.auto?.livecheckBusy || state.chartEngineV2?.loading || atlasNetworkBusy())) {
    atlasScheduleSpotPulse(15 * 1000);
    return false;
  }

  const ids = atlasPulseSelectedIds();
  if (!ids.length) return false;

  const existing = state.dataBroker.spotBook || {};
  const sameIds = ids.join("|") === (existing.ids || []).join("|");
  const ageMs = Date.now() - Date.parse(existing.timestamp || 0);
  if (!options.force && sameIds && existing.status === "ready" && Number.isFinite(ageMs) && ageMs < ATLAS_SPOT_REFRESH_MS) {
    atlasScheduleSpotPulse(ATLAS_SPOT_REFRESH_MS - ageMs);
    return true;
  }

  state.marketPulse.spotBusy = true;
  atlasAbortPulseController(state.marketPulse.spotController);
  const controller = new AbortController();
  state.marketPulse.spotController = controller;
  state.dataBroker.spotBook = { ...existing, status: "loading", ids, error: null };

  try {
    const result = await SourceAdapter.coingeckoSpotForIds(ids, { signal: controller.signal });
    if (controller.signal.aborted || !atlasPulseVisible()) return false;

    const changedIds = atlasBrokerCommitSpotBook(result);
    state.marketPulse.spotFailures = 0;
    state.marketPulse.lastSpotSuccessAt = Date.now();

    atlasPatchSpotDom(changedIds);
    const sharedTimestamp = Date.parse(result.updatedAt || "") || Date.now();
    atlasPatchChartLastPoint(result.quotes, sharedTimestamp);
    atlasScheduleSpotPulse(ATLAS_SPOT_REFRESH_MS);
    return true;
  } catch (error) {
    if (error?.name === "AbortError") return false;
    state.marketPulse.spotFailures += 1;
    state.dataBroker.spotBook = {
      ...existing,
      status: Object.keys(existing.quotes || {}).length ? "stale" : "blocked",
      ids,
      error: cleanError(error)
    };
    atlasRenderBrokerStrip();
    atlasScheduleSpotPulse(atlasPulseBackoffDelay(state.marketPulse.spotFailures));
    return false;
  } finally {
    if (state.marketPulse.spotController === controller) state.marketPulse.spotController = null;
    state.marketPulse.spotBusy = false;
  }
}

async function atlasMaybeRefreshHistoricalChart(options = {}) {
  if (!state.auto?.enabled || !state.liveOk || !state.coins.length || !atlasPulseVisible()) return false;

  if (state.chartEngineV2?.loading || state.marketPulse.chartBusy) {
    atlasScheduleChartPulse(30 * 1000);
    return false;
  }

  const chart = state.dataBroker.chart;
  const reference = Date.parse(chart?.timestamp || chart?.result?.generatedAt || "");
  const ageMs = Number.isFinite(reference) ? Date.now() - reference : Infinity;
  if (!options.force && ageMs < ATLAS_CHART_BACKGROUND_REFRESH_MS) {
    atlasScheduleChartPulse(ATLAS_CHART_BACKGROUND_REFRESH_MS - ageMs);
    return true;
  }

  state.marketPulse.chartBusy = true;
  try {
    await renderAnalystPanel({ backgroundPulse: true });
    const ready = state.dataBroker.chart?.status === "ready" && atlasChartContextMatches(state.dataBroker.chart);
    if (ready) {
      state.marketPulse.chartFailures = 0;
      state.marketPulse.lastChartSuccessAt = Date.now();
      atlasScheduleChartPulse(ATLAS_CHART_BACKGROUND_REFRESH_MS);
      return true;
    }
    state.marketPulse.chartFailures += 1;
    atlasScheduleChartPulse(atlasPulseBackoffDelay(state.marketPulse.chartFailures));
    return false;
  } catch (error) {
    state.marketPulse.chartFailures += 1;
    atlasScheduleChartPulse(atlasPulseBackoffDelay(state.marketPulse.chartFailures));
    return false;
  } finally {
    state.marketPulse.chartBusy = false;
  }
}

function atlasPauseMarketPulse() {
  state.marketPulse.paused = true;
  if (state.auto.timer) clearTimeout(state.auto.timer);
  state.auto.timer = null;
  state.auto.nextAt = null;
  atlasClearPulseTimer("spot");
  atlasClearPulseTimer("chart");
  atlasAbortPulseController(state.marketPulse.marketController);
  atlasAbortPulseController(state.marketPulse.spotController);
  atlasAbortPulseController(state.chartEngineV2?.controller);
  updateAutoCountdown();
}

function atlasResumeMarketPulse() {
  state.marketPulse.paused = false;
  if (!state.auto?.enabled || !atlasPulseVisible()) return;

  if (!state.liveOk || !state.coins.length) {
    setTimeout(() => void runLivecheck(), 50);
    return;
  }

  setTimeout(() => void refreshMarketOnly({ force: true, reason: "visibility-resume" }), 50);
  setTimeout(() => void atlasRefreshSpotBook({ force: true }), 1200);
  setTimeout(() => void atlasMaybeRefreshHistoricalChart(), 2600);
}

function atlasInitMarketPulseController() {
  if (state.marketPulse.initialized) return;
  state.marketPulse.initialized = true;

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") atlasPauseMarketPulse();
    else atlasResumeMarketPulse();
  });

  window.addEventListener("pagehide", atlasPauseMarketPulse);
  window.addEventListener("online", () => {
    if (atlasPulseVisible()) atlasResumeMarketPulse();
  });
}


function atlasStartSelectedChart(delayMs = 180, force24h = false) {
  if (!state.liveOk || !state.coins.length) return;
  if (state.chartEngineV2?.bootTimer) clearTimeout(state.chartEngineV2.bootTimer);
  state.chartEngineV2.bootTimer = setTimeout(() => {
    state.chartEngineV2.bootTimer = null;
    const coin = getSelectedCoin();
    if (!coin) return;
    const period = force24h ? 1 : Number(state.chartPeriodDays || 1);
    const key = atlasChartKey(coin, period);
    const chartReady = state.dataBroker.chart?.status === "ready" && state.dataBroker.chart?.coinId === coin.id && Number(state.dataBroker.chart?.period || 1) === period;
    const requestAlreadyActive = state.chartEngineV2?.loading && state.chartEngineV2?.activeRequestKey === key;
    if (chartReady || requestAlreadyActive) return;
    atlasPrepareChartSelection(coin, period);
    void renderAnalystPanel({ autoStart: true });
  }, Math.max(0, Number(delayMs) || 0));
}

async function atlasWaitForChartIdle(maxWaitMs = 6500) {
  const started = Date.now();
  while (state.chartEngineV2?.loading && Date.now() - started < maxWaitMs) await atlasDelay(120);
}

async function runLivecheck() {
  if (state.auto?.livecheckBusy || !atlasPulseVisible()) return false;

  state.auto.livecheckBusy = true;
  state.auto.lastStartedAt = new Date().toISOString();
  state.auto.lastRunMs = Date.now();
  state.sourceStatusExpectedTotal = 2;

  const previousMarket = atlasHasDisplayableMarket()
    ? {
        coins: state.coins,
        global: state.global,
        mainSource: state.mainSource,
        timestamp: state.timestamp,
        snapshotId: state.sourceLock?.snapshotId || null,
        sourceLock: state.sourceLock
      }
    : state.marketContinuity?.lastGood;

  atlasAbortPulseController(state.marketPulse.marketController);
  const controller = new AbortController();
  state.marketPulse.marketController = controller;

  let eurStartedAt = 0;
  let succeeded = false;

  try {
    setLiveStatus("warn", "Chargement Top 50 EUR");
    setTableDecision("Marché EUR en cours", "warn");
    setText(els.sourceName, "CoinGecko · Top 50 EUR");
    state.sourceStatus = [];
    renderSourceGrid();
    updateSourceMetric(0);

    eurStartedAt = performance.now();
    const result = await SourceAdapter.coingeckoTop50Eur({ signal: controller.signal });
    if (controller.signal.aborted || !atlasPulseVisible()) return false;

    const eurLatencyMs = Math.round(performance.now() - eurStartedAt);
    state.sourceStatus = [{ ...result.leg, ms: eurLatencyMs }];

    const loaded = atlasApplyCanonicalSnapshot({
      coins: result.markets,
      global: result.global,
      timestamp: result.generatedAt,
      snapshotId: result.snapshotId,
      sourceLabel: "CoinGecko direct · Top 50 EUR"
    }, "direct");
    if (!loaded) throw new Error("Snapshot Top 50 EUR refusé");

    atlasMergeSpotBookIntoCoins();
    state.marketPulse.marketFailures = 0;
    state.marketPulse.lastMarketSuccessAt = Date.now();
    succeeded = true;

    atlasSetStableDirectMarketStatus();
    atlasTrackAudience("market_loaded", { assets: state.coins.length, mode: "direct" });
    setText(els.sourceTime, atlasExactTimestampLabel(state.timestamp));

    renderSourceGrid();
    updateSourceMetric(1);
    atlasPatchMarketSnapshotDom();
    renderTrustLock(true);

    atlasStartSelectedChart(160, true);
    await atlasDelay(260);
    await atlasWaitForChartIdle(30_000);

    try {
      const usdStartedAt = performance.now();
      const usdResult = await SourceAdapter.coingeckoUsdForIds(
        state.coins.map(coin => coin.id),
        { signal: controller.signal }
      );
      if (controller.signal.aborted || !atlasPulseVisible()) return false;

      const usdLatencyMs = Math.round(performance.now() - usdStartedAt);
      const enriched = atlasApplyUsdEnrichment(usdResult);
      atlasMergeSpotBookIntoCoins();

      state.sourceStatus = [
        state.sourceStatus.find(item => item.key === "coingecko-eur") || { ...result.leg },
        {
          key: "coingecko-usd",
          name: "CoinGecko USD",
          kind: "Enrichissement Top 50",
          status: "OK",
          ms: usdLatencyMs,
          detail: `${enriched}/${state.coins.length} prix USD`
        }
      ];

      atlasSetStableDirectMarketStatus();
      atlasPatchMarketSnapshotDom();
    } catch (usdError) {
      if (usdError?.name === "AbortError") return false;

      state.sourceStatus = [
        state.sourceStatus.find(item => item.key === "coingecko-eur") || { ...result.leg },
        {
          key: "coingecko-usd",
          name: "CoinGecko USD",
          kind: "Enrichissement Top 50",
          status: "INDISPONIBLE",
          detail: cleanError(usdError)
        }
      ];

      atlasSetStableDirectMarketStatus();
      atlasPatchMarketSnapshotDom();
    }

    renderSourceGrid();
    updateSourceMetric(2);
    return true;
  } catch (error) {
    if (error?.name === "AbortError") return false;

    state.marketPulse.marketFailures += 1;
    state.sourceStatus = [
      {
        key: "coingecko-eur",
        name: "CoinGecko EUR",
        kind: "Top 50 marché",
        status: "ÉCHEC",
        ms: eurStartedAt ? Math.round(performance.now() - eurStartedAt) : null,
        detail: cleanError(error)
      },
      {
        key: "coingecko-usd",
        name: "CoinGecko USD",
        kind: "Enrichissement Top 50",
        status: "NON LANCÉ",
        detail: "Le marché EUR requis a échoué"
      }
    ];

    if (atlasKeepDirectStatusDuringTransientFailure(previousMarket, error, "Livecheck")) {
      atlasMergeSpotBookIntoCoins();
    } else if (previousMarket && atlasRestorePreviousSnapshot(
      { ...previousMarket, snapshotId: previousMarket.snapshotId || previousMarket.sourceLock?.snapshotId || null },
      error,
      "Livecheck"
    )) {
      atlasPatchMarketSnapshotDom();
    } else if (!applyMarketCache()) {
      atlasSetSourceLock("none", null, "Aucun snapshot direct disponible", false);
      setLiveStatus("fail", "CoinGecko EUR indisponible");
      clearMarketDisplay("Aucun snapshot CoinGecko EUR direct disponible");
      setTableDecision("Marché indisponible", "fail");
    }

    renderSourceGrid();
    updateSourceMetric(2);
    atlasRenderMarketAccessNotice();
    renderTrustLock(false);
    return false;
  } finally {
    if (state.marketPulse.marketController === controller) state.marketPulse.marketController = null;
    state.auto.livecheckBusy = false;

    if (succeeded) {
      atlasAfterLivecheck({ marketDelayMs: ATLAS_MARKET_REFRESH_MS, spotDelayMs: 900 });
    } else if (state.auto?.enabled && atlasPulseVisible()) {
      scheduleAutoRead(atlasMarketRetryDelay(state.marketPulse.marketFailures || 1));
    }
  }
}

async function refreshMarketOnly(options = {}) {
  if (state.auto?.livecheckBusy || !state.auto?.enabled || !atlasPulseVisible()) return false;

  state.auto.livecheckBusy = true;
  state.auto.lastStartedAt = new Date().toISOString();
  state.auto.lastRunMs = Date.now();

  const previous = state.coins.length
    ? {
        coins: state.coins,
        global: state.global,
        timestamp: state.timestamp,
        snapshotId: state.sourceLock?.snapshotId,
        mainSource: state.mainSource
      }
    : null;

  atlasAbortPulseController(state.marketPulse.marketController);
  const controller = new AbortController();
  state.marketPulse.marketController = controller;

  let refreshed = false;
  let eurStartedAt = 0;

  try {
    eurStartedAt = performance.now();
    const result = await SourceAdapter.coingeckoTop50Eur({ signal: controller.signal });
    if (controller.signal.aborted || !atlasPulseVisible()) return false;

    const eurLatencyMs = Math.round(performance.now() - eurStartedAt);
    state.sourceStatus = [{ ...result.leg, ms: eurLatencyMs }];

    refreshed = atlasApplyCanonicalSnapshot({
      coins: result.markets,
      global: result.global,
      timestamp: result.generatedAt,
      snapshotId: result.snapshotId,
      sourceLabel: "CoinGecko direct · Top 50 EUR"
    }, "direct");
    if (!refreshed) throw new Error("Snapshot Top 50 EUR refusé");

    atlasMergeSpotBookIntoCoins();
    state.marketPulse.marketFailures = 0;
    state.marketPulse.lastMarketSuccessAt = Date.now();

    atlasSetStableDirectMarketStatus();
    atlasPatchMarketSnapshotDom();

    if (!state.chartEngineV2?.realChart && state.dataBroker.chart?.status !== "loading") {
      atlasStartSelectedChart(160, true);
    }

    await atlasWaitForChartIdle(30_000);

    try {
      const usdStartedAt = performance.now();
      const usdResult = await SourceAdapter.coingeckoUsdForIds(
        state.coins.map(coin => coin.id),
        { signal: controller.signal }
      );
      if (controller.signal.aborted || !atlasPulseVisible()) return false;

      const usdLatencyMs = Math.round(performance.now() - usdStartedAt);
      const enriched = atlasApplyUsdEnrichment(usdResult);
      atlasMergeSpotBookIntoCoins();

      state.sourceStatus = [
        state.sourceStatus.find(item => item.key === "coingecko-eur") || { ...result.leg },
        {
          key: "coingecko-usd",
          name: "CoinGecko USD",
          kind: "Enrichissement Top 50",
          status: "OK",
          ms: usdLatencyMs,
          detail: `${enriched}/${state.coins.length} prix USD`
        }
      ];

      atlasSetStableDirectMarketStatus();
      atlasPatchMarketSnapshotDom();
    } catch (usdError) {
      if (usdError?.name === "AbortError") return false;

      state.sourceStatus = [
        state.sourceStatus.find(item => item.key === "coingecko-eur") || { ...result.leg },
        {
          key: "coingecko-usd",
          name: "CoinGecko USD",
          kind: "Enrichissement Top 50",
          status: "INDISPONIBLE",
          detail: cleanError(usdError)
        }
      ];

      atlasSetStableDirectMarketStatus();
      atlasPatchMarketSnapshotDom();
    }

    return true;
  } catch (error) {
    if (error?.name === "AbortError") return false;

    state.marketPulse.marketFailures += 1;
    state.sourceStatus = [
      {
        key: "coingecko-eur",
        name: "CoinGecko EUR",
        kind: "Top 50 marché",
        status: "ÉCHEC",
        ms: eurStartedAt ? Math.round(performance.now() - eurStartedAt) : null,
        detail: cleanError(error)
      },
      {
        key: "coingecko-usd",
        name: "CoinGecko USD",
        kind: "Enrichissement Top 50",
        status: "NON LANCÉ",
        detail: "Le marché EUR requis a échoué"
      }
    ];

    if (atlasKeepDirectStatusDuringTransientFailure(previous, error, "Rafraîchissement")) {
      atlasMergeSpotBookIntoCoins();
    } else if (previous && atlasRestorePreviousSnapshot(
      { ...previous, mainSource: previous.mainSource || "CoinGecko · dernière lecture directe" },
      error,
      "Rafraîchissement"
    )) {
      atlasMergeSpotBookIntoCoins();
      atlasPatchMarketSnapshotDom();
    } else if (!applyMarketCache()) {
      clearMarketDisplay("Aucun snapshot CoinGecko EUR direct disponible");
    }

    return false;
  } finally {
    if (state.marketPulse.marketController === controller) state.marketPulse.marketController = null;
    state.auto.livecheckBusy = false;

    renderSourceGrid();
    updateSourceMetric(state.sourceStatus.length || 0);
    atlasRenderMarketAccessNotice();

    if (refreshed) {
      atlasAfterLivecheck({ marketDelayMs: ATLAS_MARKET_REFRESH_MS });
    } else {
      renderAutoReader();
      scheduleAutoRead(atlasMarketRetryDelay(state.marketPulse.marketFailures || 1));
    }

    atlasScheduleSpotPulse(refreshed ? 900 : atlasPulseBackoffDelay(state.marketPulse.spotFailures || 1));
  }
}

function classifyAsset(c) {
  if (!c) return "À vérifier";
  const id = String(c.id || "").toLowerCase();
  const sym = String(c.symbol || "").toUpperCase();
  const rank = Number(c.rank || 999999);
  const meme = ["DOGE","SHIB","PEPE","BONK","WIF","FLOKI"].includes(sym) || /dog|shib|pepe|bonk|floki|meme/i.test(id);
  if (id === "bitcoin" || id === "ethereum" || sym === "BTC" || sym === "ETH") return "Repère marché";
  if (["USDT","USDC","DAI","FDUSD","TUSD","USDE","USDS"].includes(sym)) return "Stablecoin";
  if (meme) return "Actif spéculatif";
  if (rank <= 20) return "Grande capitalisation";
  if (rank <= 100) return "Capitalisation intermédiaire";
  return "Hors Top 100";
}
function atlasActionForCoin(c) {
  if (!c) return "Attendre";
  if (!atlasAnalysisLiveReady()) return "Archive · consultation";
  const type = classifyAsset(c);
  if (type === "Stablecoin") return "Surveiller stabilité";
  if (type === "Repère marché") return "Observer / comparer";
  if (type === "Actif spéculatif") return "Volatilité élevée";
  return "Observer";
}
function beginnerDecision(c) { return atlasActionForCoin(c); }
function whyDecision(c) {
  if (!c) return "Aucune donnée exploitable.";
  const bits = [
    `Catégorie descriptive : ${classifyAsset(c)}.`,
    `Lecture : ${atlasActionForCoin(c)}.`
  ];
  if (typeof c.change24h === "number") bits.push(`Variation marché 24 h : ${atlasFmtMarketPct(c.change24h)}.`);
  if (typeof c.change7d === "number") bits.push(`Variation marché 7 j : ${fmtPct(c.change7d)}.`);
  if (c.volume24h && c.marketCap) bits.push(`Ratio volume/market cap : ${((c.volume24h / c.marketCap) * 100).toFixed(2)} %.`);
  bits.push("Sécurité, actualités, social et on-chain non validés automatiquement.");
  if (!atlasAnalysisLiveReady()) bits.push("Snapshot en archive : scores et simulation suspendus.");
  return bits.join(" ");
}
function renderBeginnerSummary() { if (!els.beginnerSummary) return; if (!state.liveOk || !state.coins.length) { els.beginnerSummary.textContent = "Le marché n’est pas lisible pour l’instant. Aucune source marché principale n’a fourni un tableau fiable. Donc : pas de prix, pas de conclusion, pas de tableau fictif."; if (els.advancedGrid) { els.advancedGrid.innerHTML = ` <div><b>État</b><span>Livecheck absent ou échec</span></div> <div><b>Tableau</b><span>Bloqué</span></div> <div><b>Données</b><span>Non récupérées</span></div> <div><b>Règle</b><span>Pas de source live, pas de prix</span></div>`; } return; } const btc = state.coins.find(c => c.id === "bitcoin"); const eth = state.coins.find(c => c.id === "ethereum"); const first = state.coins[0]; els.beginnerSummary.textContent = `Marché lisible depuis ${state.mainSource}. ` + `Le tableau montre des données de marché réelles : prix, variation, volume et capitalisation. ` + `Bitcoin et Ethereum servent de repères. ` + `Les stablecoins ne sont pas des opportunités de hausse : ils servent surtout à lire stabilité et liquidité. ` + `Ce cockpit aide à observer, pas à acheter.`; if (els.advancedGrid) { const ratio = first?.volume24h && first?.marketCap ? ((first.volume24h / first.marketCap) * 100).toFixed(2) + " %" : "Donnée manquante"; els.advancedGrid.innerHTML = ` <div><b>Source</b><span>${escapeHtml(state.mainSource || "—")}</span></div> <div><b>Actifs chargés</b><span>${state.coins.length}</span></div> <div><b>BTC 24h</b><span>${btc ? atlasFmtMarketPct(btc.change24h) : "Donnée manquante"}</span></div> <div><b>ETH 24h</b><span>${eth ? atlasFmtMarketPct(eth.change24h) : "Donnée manquante"}</span></div> <div><b>Premier actif</b><span>${first ? escapeHtml(first.name) : "—"}</span></div> <div><b>Type</b><span>${escapeHtml(classifyAsset(first))}</span></div> <div><b>Vol/Market cap</b><span>${ratio}</span></div> <div><b>Données manquantes</b><span>Sécurité · social · on-chain</span></div>`; }
} function getSelectedCoin() { if (!state.coins.length || state.graphSelectionCleared) return null; const selected = state.coins.find(c => c.id === state.selectedCoinId); return selected || state.coins[0];
} function safeMoney(value) { return atlasFormatEUR(value);
} function atlasChartPeriodLabel(days) {
  const d=Number(days||1); if(d===1)return "24h"; if(d===365)return "1 an"; if(d===36500)return "Tout"; return `${d}j`;
}


const ATLAS_CRYPTO_PALETTES = Object.freeze({
  bitcoin: Object.freeze({ primary: "#F7931A", stops: ["#F7931A", "#FFB347"] }),
  ethereum: Object.freeze({ primary: "#A7A9B6", stops: ["#73788A", "#B7BAC8", "#627EEA"] }),
  binancecoin: Object.freeze({ primary: "#F3BA2F", stops: ["#F3BA2F", "#FFE081"] }),
  ripple: Object.freeze({ primary: "#F7FAFC", stops: ["#FFFFFF", "#B9C3CE"] }),
  solana: Object.freeze({ primary: "#14F195", stops: ["#14F195", "#00D1FF", "#9945FF"] }),
  tether: Object.freeze({ primary: "#26A17B", stops: ["#26A17B", "#53D1AA"] }),
  "usd-coin": Object.freeze({ primary: "#2775CA", stops: ["#2775CA", "#62A6E8"] }),
  cardano: Object.freeze({ primary: "#3468D4", stops: ["#1E5AA8", "#67A7FF"] }),
  dogecoin: Object.freeze({ primary: "#C2A633", stops: ["#B89B2C", "#E8D46A"] }),
  tron: Object.freeze({ primary: "#FF2638", stops: ["#FF2638", "#FF6673"] }),
  chainlink: Object.freeze({ primary: "#2A5ADA", stops: ["#2A5ADA", "#6B8FFF"] }),
  "avalanche-2": Object.freeze({ primary: "#E84142", stops: ["#E84142", "#FF7575"] }),
  polkadot: Object.freeze({ primary: "#E6007A", stops: ["#E6007A", "#FF62B5"] }),
  litecoin: Object.freeze({ primary: "#B8B8B8", stops: ["#8C8C8C", "#E2E2E2"] }),
  sui: Object.freeze({ primary: "#6FBCF0", stops: ["#4DA2E0", "#9DD6FF"] }),
  toncoin: Object.freeze({ primary: "#0098EA", stops: ["#0098EA", "#59C7FF"] }),
  "shiba-inu": Object.freeze({ primary: "#F26B38", stops: ["#F26B38", "#FFC14E"] }),
  pepe: Object.freeze({ primary: "#4CAF50", stops: ["#3D8B40", "#8BD17C"] })
});

const ATLAS_COMPARISON_COLORS = [
  "#F7931A",
  "#A7A9B6",
  "#F3BA2F",
  "#F7FAFC",
  "#14F195"
];

const ATLAS_CURATED_TOP3_IDS = Object.freeze([
  "bitcoin",
  "ethereum",
  "binancecoin"
]);

const ATLAS_CURATED_TOP5_IDS = Object.freeze([
  "bitcoin",
  "ethereum",
  "binancecoin",
  "ripple",
  "solana"
]);

function atlasCuratedTopIds(limit = 5) {
  return Number(limit) <= 3
    ? [...ATLAS_CURATED_TOP3_IDS]
    : [...ATLAS_CURATED_TOP5_IDS];
}

function atlasCuratedTopCoins(limit = 5) {
  const byId = new Map((state.coins || []).map(coin => [coin.id, coin]));
  return atlasCuratedTopIds(limit)
    .map(id => byId.get(id))
    .filter(Boolean);
}

function atlasCryptoPalette(coin, fallbackIndex = 0) {
  const id = String(coin?.id || "").toLowerCase();
  const symbol = String(coin?.symbol || "").toUpperCase();
  const bySymbol = {
    BTC: "bitcoin",
    ETH: "ethereum",
    BNB: "binancecoin",
    XRP: "ripple",
    SOL: "solana",
    USDT: "tether",
    USDC: "usd-coin",
    ADA: "cardano",
    DOGE: "dogecoin",
    TRX: "tron",
    LINK: "chainlink",
    AVAX: "avalanche-2",
    DOT: "polkadot",
    LTC: "litecoin",
    SUI: "sui",
    TON: "toncoin",
    SHIB: "shiba-inu",
    PEPE: "pepe"
  };
  const key = ATLAS_CRYPTO_PALETTES[id] ? id : bySymbol[symbol];
  const canonical = key ? ATLAS_CRYPTO_PALETTES[key] : null;
  if (canonical) return canonical;
  const identity = `${id}|${symbol || "CRYPTO"}`;
  let hash = 2166136261;
  for (let index = 0; index < identity.length; index += 1) {
    hash ^= identity.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  const hue = Math.abs(hash) % 360;
  const secondaryHue = (hue + 34 + (Math.abs(hash >> 8) % 44)) % 360;
  const saturation = 68 + (Math.abs(hash >> 16) % 18);
  const lightness = 54 + (Math.abs(hash >> 24) % 10);
  const primary = `hsl(${hue} ${saturation}% ${lightness}%)`;
  const secondary = `hsl(${secondaryHue} ${Math.min(92, saturation + 8)}% ${Math.min(72, lightness + 10)}%)`;
  return {
    primary,
    stops: [primary, secondary],
    deterministic: true,
    identity
  };
}

function atlasCryptoGradientCss(coin, fallbackIndex = 0) {
  const palette = atlasCryptoPalette(coin, fallbackIndex);
  const stops = palette.stops.map((color, index) => {
    const position = palette.stops.length === 1 ? 0 : index / (palette.stops.length - 1) * 100;
    return `${color} ${position.toFixed(0)}%`;
  });
  return `linear-gradient(90deg, ${stops.join(", ")})`;
}

function atlasCryptoCanvasGradient(ctx, coin, fallbackIndex = 0, width = 980) {
  const palette = atlasCryptoPalette(coin, fallbackIndex);
  if (!ctx?.createLinearGradient || palette.stops.length < 2) return palette.primary;
  const gradient = ctx.createLinearGradient(0, 0, Math.max(1, Number(width) || 980), 0);
  palette.stops.forEach((color, index) => {
    const offset = palette.stops.length === 1 ? 0 : index / (palette.stops.length - 1);
    gradient.addColorStop(offset, color);
  });
  return gradient;
}

function atlasExpectedChartContextKey(ids = atlasComparisonIds(), period = Number(state.chartPeriodDays || 1)) {
  const normalizedIds = Array.isArray(ids) ? ids.filter(Boolean).slice(0, ATLAS_COMPARISON_MAX_SERIES) : [];
  const days = Number(period || 1);
  if (!normalizedIds.length) return `empty:${days}`;
  if (normalizedIds.length === 1) return `single:${normalizedIds[0]}:${days}`;
  return `comparison:${normalizedIds.join(",")}:${days}`;
}

function atlasChartContextMatches(chart = state.dataBroker?.chart) {
  if (!chart?.contextKey) return false;
  return chart.contextKey === atlasExpectedChartContextKey();
}

function atlasChartContextStatus() {
  const chart = state.dataBroker?.chart || {};
  const expected = atlasExpectedChartContextKey();
  return {
    expected,
    actual: chart.contextKey || null,
    ready: chart.status === "ready" && chart.contextKey === expected,
    loading: chart.status === "loading" && chart.contextKey === expected,
    stale: !!chart.contextKey && chart.contextKey !== expected
  };
}

function atlasComparisonIds() {
  const validIds = new Set((state.coins || []).map(coin => coin.id));
  const raw = Array.isArray(state.dataBroker?.comparison?.ids) ? state.dataBroker.comparison.ids : [];
  const ids = [];
  for (const id of raw) {
    if (validIds.has(id) && !ids.includes(id)) ids.push(id);
  }
  if (state.graphSelectionCleared && !ids.length) return [];
  const primary = validIds.has(state.selectedCoinId) ? state.selectedCoinId : ids[0] || null;
  if (primary && !ids.includes(primary)) ids.unshift(primary);
  return ids.slice(0, ATLAS_COMPARISON_MAX_SERIES);
}

function atlasComparisonCoins() {
  const ids = atlasComparisonIds();
  return ids.map(id => state.coins.find(coin => coin.id === id)).filter(Boolean);
}

function atlasComparisonActive() {
  return atlasComparisonIds().length > 1;
}


function atlasClearComparisonCompletionTimer() {
  const comparison = state.dataBroker.comparison;
  if (comparison.completionTimer) {
    clearTimeout(comparison.completionTimer);
    comparison.completionTimer = null;
  }
  comparison.completionKey = null;
}

function atlasComparisonCompletionKey(ids = atlasComparisonIds(), period = Number(state.chartPeriodDays || 1)) {
  return `${Number(period || 1)}:${(ids || []).join(",")}`;
}

function atlasSetComparisonIds(ids, primaryId = null, options = {}) {
  atlasClearComparisonCompletionTimer();
  const validIds = new Set((state.coins || []).map(coin => coin.id));
  const unique = [];
  for (const id of ids || []) {
    if (validIds.has(id) && !unique.includes(id)) unique.push(id);
    if (unique.length >= ATLAS_COMPARISON_MAX_SERIES) break;
  }

  if (!unique.length) {
    state.selectedCoinId = null;
    state.graphSelectionCleared = true;
    state.dataBroker.comparison.ids = [];
    state.dataBroker.comparison.pendingIds = [];
    state.dataBroker.comparison.unavailableIds = [];
    state.dataBroker.comparison.results = {};
    state.dataBroker.comparison.renderedIds = [];
    state.dataBroker.comparison.completionAttempt = 0;
    state.dataBroker.comparison.mode = "empty";
    state.dataBroker.comparison.preset = options.preset || "empty";
    state.dataBroker.comparison.status = "idle";
    state.dataBroker.comparison.error = null;
    atlasRenderComparisonControls();
    return;
  }

  state.graphSelectionCleared = false;
  const primary = validIds.has(primaryId) && unique.includes(primaryId)
    ? primaryId
    : validIds.has(state.selectedCoinId) && unique.includes(state.selectedCoinId)
      ? state.selectedCoinId
      : unique[0];
  const index = unique.indexOf(primary);
  if (index > 0) {
    unique.splice(index, 1);
    unique.unshift(primary);
  }
  state.selectedCoinId = primary;
  state.dataBroker.comparison.ids = unique;
  state.dataBroker.comparison.pendingIds = [];
  state.dataBroker.comparison.unavailableIds = [];
  state.dataBroker.comparison.results = {};
  state.dataBroker.comparison.renderedIds = [];
  state.dataBroker.comparison.completionAttempt = 0;
  state.dataBroker.comparison.mode = unique.length > 1 ? "compare" : "single";
  state.dataBroker.comparison.preset = options.preset || state.dataBroker.comparison.preset || (unique.length > 1 ? "manual" : "solo");
  state.dataBroker.comparison.status = "idle";
  state.dataBroker.comparison.error = null;
  atlasRenderComparisonControls();
  queueMicrotask(() => { void atlasRefreshSpotBook({ force: true }); });
}

function atlasRenderComparisonControls() {
  const coins = atlasComparisonCoins();
  const active = coins.length > 1;
  const preset = state.dataBroker.comparison.preset || "manual";
  const unavailableIds = new Set(state.dataBroker.comparison.unavailableIds || []);
  const renderedIds = new Set(state.dataBroker.comparison.renderedIds || []);
  const activeCurves = coins.filter(coin => renderedIds.has(coin.id)).length;
  const loading = state.dataBroker.comparison.status === "loading";

  if (els.btnChartSolo) els.btnChartSolo.classList.toggle("active", coins.length === 1);
  if (els.btnChartTop3) els.btnChartTop3.classList.toggle("active", active && preset === "rank-3");
  if (els.btnChartTop5) els.btnChartTop5.classList.toggle("active", active && preset === "rank-5");
  if (els.btnChartGainers) els.btnChartGainers.classList.toggle("active", active && preset === "gainers");
  if (els.btnChartLosers) els.btnChartLosers.classList.toggle("active", active && preset === "losers");
  if (els.btnChartVolume5) els.btnChartVolume5.classList.toggle("active", active && preset === "volume");
  if (els.btnChartReset) els.btnChartReset.classList.remove("active");
  if (els.btnChartClear) els.btnChartClear.classList.toggle("active", !coins.length && state.graphSelectionCleared);
  if (!els.comparisonSelection) return;

  if (!coins.length) {
    els.comparisonSelection.innerHTML = state.liveOk
      ? '<span class="compare-hint">Aucune crypto sélectionnée · clique une ligne du MARKET SNAPSHOT</span>'
      : '<span class="compare-hint">Livecheck requis avant comparaison</span>';
    return;
  }

  const chips = coins.map((coin, index) => {
    const unavailable = unavailableIds.has(coin.id);
    const rendered = renderedIds.has(coin.id);
    const stateLabel = unavailable
      ? "indisponible"
      : index === 0
        ? "principal"
        : "comparé";
    const stateTitle = unavailable
      ? `Aucune courbe ${atlasChartPeriodLabel(state.chartPeriodDays)} affichable pour ${coin.symbol}`
      : rendered
        ? `${coin.symbol} est réellement tracé sur le graphique`
        : loading
          ? `${coin.symbol} est en cours de chargement`
          : index === 0
            ? "Actif principal"
            : "Définir comme actif principal";

    return `
    <span class="compare-chip ${index === 0 ? "is-primary" : ""} ${unavailable ? "is-unavailable" : ""}" style="--atlas-series-color:${escapeHtml(atlasCryptoPalette(coin, index).primary)};--atlas-series-gradient:${escapeHtml(atlasCryptoGradientCss(coin, index))}" ${unavailable ? 'data-series-state="unavailable"' : ""}>
      <button class="compare-chip-main" type="button" data-compare-primary="${escapeHtml(coin.id)}" aria-label="${escapeHtml(stateTitle)}">
        <span>${escapeHtml(coin.symbol)}</span><small>${stateLabel}</small>
      </button>
      <button class="compare-chip-remove" type="button" data-compare-remove="${escapeHtml(coin.id)}" aria-label="Retirer ${escapeHtml(coin.symbol)} de la comparaison">×</button>
    </span>`;
  }).join("");

  let hint = '<span class="compare-hint">Clique la même ligne pour la retirer, ou une autre ligne pour comparer</span>';
  if (active) {
    if (loading) {
      hint = `<span class="compare-hint compare-hint-progress">Chargement atomique des ${coins.length} séries</span>`;
    } else if (activeCurves >= 2) {
      const unavailableCount = unavailableIds.size;
      hint = `<span class="compare-hint">${activeCurves}/${coins.length} courbes réellement affichées${unavailableCount ? ` · ${unavailableCount} indisponible${unavailableCount > 1 ? "s" : ""}` : ""}</span>`;
    } else if (unavailableIds.size) {
      hint = `<span class="compare-hint compare-hint-error">Comparaison non remplacée · moins de 2 courbes affichables</span>`;
    } else {
      hint = `<span class="compare-hint">${coins.length}/${ATLAS_COMPARISON_MAX_SERIES} actifs sélectionnés</span>`;
    }
  }

  els.comparisonSelection.innerHTML = `${chips}${hint}`;

  els.comparisonSelection.querySelectorAll("[data-compare-primary]").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      const id = button.dataset.comparePrimary;
      const coin = state.coins.find(item => item.id === id);
      if (!coin) return;
      const ids = atlasComparisonIds().filter(value => value !== id);
      atlasSetComparisonIds([id, ...ids], id, { preset: "manual" });
      atlasBrokerSeedSpot(coin);
      renderScore(coin);
      renderMarketTable();
      renderDecisionBoard();
      renderMultiHorizon();
      requestAnimationFrame(() => { void renderAnalystPanel({ comparisonPrimary: true }); });
    });
  });

  els.comparisonSelection.querySelectorAll("[data-compare-remove]").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      const id = button.dataset.compareRemove;
      const ids = atlasComparisonIds().filter(value => value !== id);
      if (!ids.length) {
        atlasSetComparisonIds([], null, { preset: "empty" });
        renderAnalystPanel({ comparisonRemove: true });
        return;
      }
      atlasSetComparisonIds(ids, ids[0], { preset: ids.length > 1 ? "manual" : "solo" });
      requestAnimationFrame(() => {
        void renderAnalystPanel({ comparisonRemove: true, forceSingle: ids.length === 1 });
      });
    });
  });
}

function atlasResetComparison(coin = getSelectedCoin() || state.coins?.[0] || null) {
  if (!coin?.id) return;
  atlasSetComparisonIds([coin.id], coin.id, { preset: "solo" });
  atlasPrepareChartSelection(coin, Number(state.chartPeriodDays || 1), { preserveComparison: true });
  renderScore(coin);
  if (typeof renderAtlasMathCore === "function") renderAtlasMathCore();
  renderMarketTable();
  renderDecisionBoard();
  renderMultiHorizon();
  requestAnimationFrame(() => { void renderAnalystPanel({ solo: true, forceSingle: true }); });
}

function atlasSelectTopComparison(limit = 3) {
  if (!state.liveOk || !state.coins.length) return;

  const count = Number(limit) <= 3 ? 3 : 5;
  const expectedIds = atlasCuratedTopIds(count);
  const coins = atlasCuratedTopCoins(count);
  const ids = coins.map(coin => coin.id);

  if (ids.length < 2) {
    if (els.chartCaption) {
      atlasSetChartCaptionText(
        `Preset Top ${count} indisponible · ${ids.length}/${expectedIds.length} actifs canoniques reçus.`
      );
    }
    return;
  }

  atlasSetComparisonIds(ids, ids[0], { preset: `rank-${count}` });
  atlasBrokerSeedSpot(getSelectedCoin());
  renderScore(getSelectedCoin());
  renderMarketTable();
  renderDecisionBoard();
  renderMultiHorizon();

  const symbols = coins.map(coin => coin.symbol).join(" · ");
  if (els.chartCaption) {
    atlasSetChartCaptionText(
      `Target Top ${count} · ${symbols} · comparaison normalisée en préparation.`
    );
  }

  requestAnimationFrame(() => {
    void renderAnalystPanel({
      topComparison: count,
      curatedIds: ids
    });
  });
}

function atlasResetGraphDefaults() {
  if (!state.liveOk || !state.coins.length) return;
  const preferred = state.coins.find(coin => coin.id === "bitcoin")
    || [...state.coins].sort((a, b) => Number(a.rank || 999999) - Number(b.rank || 999999))[0]
    || null;
  if (!preferred) return;
  state.chartPeriodDays = 1;
  atlasSetComparisonIds([preferred.id], preferred.id, { preset: "solo" });
  atlasPrepareChartSelection(preferred, 1, { preserveComparison: true, preset: "solo" });
  atlasTrackAudience("chart_comparison_changed", { ids: [preferred.id], period: 1, action: "reset" });
  renderScore(preferred);
  renderMarketTable();
  renderDecisionBoard();
  renderMultiHorizon();
  if (els.chartCaption) atlasSetChartCaptionText(`${preferred.symbol} seul · période 24 h · sélection réinitialisée.`);
  requestAnimationFrame(() => { void renderAnalystPanel({ resetGraph: true, forceSingle: true }); });
}

function atlasComparisonPeriodMetric(coin, period = Number(state.chartPeriodDays || 1)) {
  if (Number(period) === 30) return Number(coin?.change30d);
  if (Number(period) === 7) return Number(coin?.change7d);
  return Number(coin?.change24h);
}

function atlasSelectMarketPreset(kind = "gainers", limit = 5) {
  if (!state.liveOk || !state.coins.length) return;
  const count = Math.max(2, Math.min(ATLAS_COMPARISON_MAX_SERIES, Number(limit) || 5));
  const period = Number(state.chartPeriodDays || 1);
  let candidates = state.coins.filter(coin => classifyAsset(coin) !== "Stablecoin");
  if (kind === "volume") {
    candidates = [...state.coins].filter(coin => Number.isFinite(Number(coin.volume24h))).sort((a, b) => Number(b.volume24h) - Number(a.volume24h));
  } else {
    candidates = candidates.filter(coin => Number.isFinite(atlasComparisonPeriodMetric(coin, period)));
    candidates.sort((a, b) => kind === "losers"
      ? atlasComparisonPeriodMetric(a, period) - atlasComparisonPeriodMetric(b, period)
      : atlasComparisonPeriodMetric(b, period) - atlasComparisonPeriodMetric(a, period));
  }
  const selected = candidates.slice(0, count);
  if (selected.length < 2) {
    if (els.chartCaption) atlasSetChartCaptionText(`Pas assez de données comparables pour ce preset en ${atlasChartPeriodLabel(period)}.`);
    return;
  }
  const ids = selected.map(coin => coin.id);
  atlasSetComparisonIds(ids, ids[0], { preset: kind });
  atlasBrokerSeedSpot(getSelectedCoin());
  renderScore(getSelectedCoin());
  renderMarketTable();
  renderDecisionBoard();
  renderMultiHorizon();
  const label = kind === "losers" ? "5 plus fortes baisses" : kind === "volume" ? "5 plus gros volumes 24 h" : "5 plus fortes hausses";
  if (els.chartCaption) atlasSetChartCaptionText(`${label} sélectionnés · période de classement ${atlasChartPeriodLabel(period)} · comparaison normalisée en préparation.`);
  requestAnimationFrame(() => { void renderAnalystPanel({ marketPreset: kind }); });
}

function atlasRenderEmptyGraphSelection() {
  atlasClearChartRetryTimer();
  if (state.chartEngineV2?.controller) {
    try { state.chartEngineV2.controller.abort(); } catch {}
  }
  state.chartRenderToken += 1;
  state.comparisonRenderToken += 1;
  atlasDestroyRealChart();
  state.dataBroker.chart = { status: "blocked", coinId: null, period: Number(state.chartPeriodDays || 1), source: ATLAS_CANONICAL_MARKET_SOURCE, mode: "empty-selection", timestamp: null, pointCount: 0, contextKey: atlasExpectedChartContextKey([], Number(state.chartPeriodDays || 1)), result: null, error: null };
  setText(els.selectedAssetTitle, "Aucune crypto sélectionnée");
  drawChartMessage(els.mainChart, "loading", "Sélection libre", "Clique une ligne du MARKET SNAPSHOT pour afficher une crypto, ou utilise un preset Top 3 / Top 5 / hausses / baisses / volume.", "Aucune courbe n’est chargée tant que la sélection reste vide.");
  if (els.chartCaption) atlasSetChartCaptionText("Sélection vide · clique une ligne du MARKET SNAPSHOT pour charger son historique réel.");
  if (els.assetDetailGrid) els.assetDetailGrid.innerHTML = '<div><b>Actif</b><span>Aucune sélection</span></div><div><b>Graphique</b><span>En attente</span></div><div><b>Comparaison</b><span>0/5</span></div><div><b>Action</b><span>Choisir une crypto</span></div>';
  atlasSetCompactReading("Lecture : sélectionne une crypto dans le MARKET SNAPSHOT.");
  atlasRenderCompactDetailSummary(null);
  atlasEnsureSourceDock(null);
  renderScore(null);
  atlasRenderBrokerStrip();
  renderMarketTable();
  renderMultiHorizon();
  if (typeof renderAtlasMathCore === "function") renderAtlasMathCore();
}

function atlasClearGraphSelection() {
  atlasTrackAudience("chart_comparison_changed", { ids: [], period: Number(state.chartPeriodDays || 1), action: "clear" });
  atlasSetComparisonIds([], null, { preset: "empty" });
  atlasRenderEmptyGraphSelection();
}

function atlasToggleComparisonCoin(coin) {
  if (!coin?.id) return;
  atlasHideHelpLayer(true);
  let ids = atlasComparisonIds();
  if (!ids.length) {
    atlasSelectMarketCoin(coin);
    return;
  }

  if (ids.includes(coin.id)) {
    ids = ids.filter(id => id !== coin.id);
    if (!ids.length) {
      atlasClearGraphSelection();
      return;
    }
    const nextPrimaryId = state.selectedCoinId === coin.id ? ids[0] : state.selectedCoinId;
    atlasSetComparisonIds(ids, nextPrimaryId, { preset: "manual" });
  } else {
    if (ids.length >= ATLAS_COMPARISON_MAX_SERIES) {
      if (els.chartCaption) atlasSetChartCaptionText(`Comparaison limitée à ${ATLAS_COMPARISON_MAX_SERIES} actifs. Retire un actif avant d’en ajouter un autre.`);
      return;
    }
    ids.push(coin.id);
    atlasSetComparisonIds(ids, state.selectedCoinId || ids[0], { preset: "manual" });
  }

  const primary = getSelectedCoin();
  atlasTrackAudience("chart_comparison_changed", { ids: atlasComparisonIds(), period: Number(state.chartPeriodDays || 1) });
  if (primary) {
    atlasBrokerSeedSpot(primary);
    renderScore(primary);
  }
  renderMarketTable();
  renderDecisionBoard();
  renderMultiHorizon();
  requestAnimationFrame(() => { void renderAnalystPanel({ comparisonToggle: true, forceSingle: atlasComparisonIds().length === 1 }); });
}

function atlasFiniteMetric(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function atlasClassifyHorizonChange(value) {
  const n = atlasFiniteMetric(value);
  if (n === null) return { key: "missing", label: "Donnée manquante" };
  if (n <= -3) return { key: "strong-down", label: "Forte baisse" };
  if (n < -0.5) return { key: "down", label: "Baisse" };
  if (n < -0.05) return { key: "flat", label: "Repli léger" };
  if (n <= 0.05) return { key: "flat", label: "Stable" };
  if (n <= 0.5) return { key: "flat", label: "Hausse légère" };
  if (n < 3) return { key: "up", label: "Hausse" };
  return { key: "strong-up", label: "Forte hausse" };
}

function atlasMovementSentence(coin) {
  const h24 = atlasFiniteMetric(coin?.change24h);
  const d7 = atlasFiniteMetric(coin?.change7d);
  const d30 = atlasFiniteMetric(coin?.change30d);
  const available = [h24, d7, d30].filter(Number.isFinite).length;
  if (available < 2) return `${coin?.name || "L’actif"} ne dispose pas encore de suffisamment d’horizons comparables pour une lecture complète.`;
  const pos = value => Number.isFinite(value) && value > 0.05;
  const neg = value => Number.isFinite(value) && value < -0.05;
  const flat = value => Number.isFinite(value) && Math.abs(value) <= 0.05;
  const name = coin?.name || "L’actif";
  if (neg(h24) && pos(d7) && pos(d30)) return `${name} recule à court terme, mais reste en hausse sur 7 jours et 30 jours. Le mouvement ressemble à un repli court dans une tendance plus favorable à moyen terme.`;
  if (pos(h24) && neg(d7) && pos(d30)) return `${name} rebondit sur 24 heures, tandis que la semaine reste plus faible. La tendance mensuelle demeure positive mais le mouvement est irrégulier.`;
  if (pos(h24) && pos(d7) && pos(d30)) return `${name} progresse sur 24 heures, 7 jours et 30 jours. Les trois horizons racontent actuellement une direction positive cohérente.`;
  if (neg(h24) && neg(d7) && neg(d30)) return `${name} recule sur les trois horizons observés. La faiblesse n’est pas limitée à la seule journée.`;
  if (pos(h24) && pos(d7) && neg(d30)) return `${name} rebondit récemment, mais reste sous son niveau d’il y a 30 jours. Le redressement court n’efface pas encore la faiblesse mensuelle.`;
  if (neg(h24) && neg(d7) && pos(d30)) return `${name} montre une faiblesse récente, tout en restant positif sur 30 jours. Le court terme se dégrade dans une tendance mensuelle encore favorable.`;
  if ([h24, d7, d30].every(value => !Number.isFinite(value) || flat(value))) return `${name} reste relativement stable sur les horizons disponibles. Aucun mouvement commun fort ne se dégage.`;
  return `${name} présente une lecture mixte : les horizons 24 heures, 7 jours et 30 jours ne racontent pas encore une direction commune.`;
}

function atlasBestComparisonCoin(coins, field) {
  return coins.filter(coin => atlasFiniteMetric(coin?.[field]) !== null).sort((a, b) => atlasFiniteMetric(b[field]) - atlasFiniteMetric(a[field]))[0] || null;
}

function atlasCurrentChartGap() {
  const coin = getSelectedCoin();
  if (!atlasChartContextMatches(state.dataBroker.chart)) return null;
  const result = state.dataBroker.chart?.result;
  const metrics = result?.integrity?.metrics || {};
  const spot = Number(coin?.priceEur ?? coin?.price);
  const last = Number(metrics.lastPrice);
  return Number.isFinite(spot) && spot > 0 && Number.isFinite(last) ? Math.abs(last - spot) / spot * 100 : null;
}

function atlasSnapshotFieldForPeriod(period) {
  const days = Number(period || 1);
  if (days === 1) return "change24h";
  if (days === 7) return "change7d";
  if (days === 30) return "change30d";
  return null;
}

function atlasHorizonMetricForCoin(coin, period) {
  const days = Number(period || 1);
  const activeDays = Number(state.chartPeriodDays || 1);
  const chart = state.dataBroker.chart;
  const chartResult = chart?.result;
  if (days === activeDays && chart?.status === "ready" && atlasChartContextMatches(chart)) {
    if (chartResult?.comparison && Array.isArray(chartResult.entries)) {
      const entry = chartResult.entries.find(item => item?.coin?.id === coin?.id);
      const value = atlasFiniteMetric(entry?.result?.integrity?.metrics?.changePct);
      return value === null
        ? { value: null, source: "unavailable", label: "série indisponible" }
        : { value, source: "series", label: "série réelle" };
    }
    if (chart?.coinId === coin?.id) {
      const value = atlasFiniteMetric(chartResult?.integrity?.metrics?.changePct);
      if (value !== null) return { value, source: "series", label: "série réelle" };
    }
  }
  const field = atlasSnapshotFieldForPeriod(days);
  if (!field) return { value: null, source: "missing", label: "série réelle requise" };
  const value = atlasFiniteMetric(coin?.[field]);
  return value === null
    ? { value: null, source: "missing", label: "donnée manquante" }
    : { value, source: "snapshot", label: "snapshot marché" };
}

function atlasBestHorizonMetric(coins, period) {
  return coins
    .map(coin => ({ coin, metric: atlasHorizonMetricForCoin(coin, period) }))
    .filter(row => row.metric.value !== null)
    .sort((a, b) => b.metric.value - a.metric.value)[0] || null;
}

function atlasHorizonSourceShort(metric) {
  if (metric?.source === "series") return "série réelle";
  if (metric?.source === "snapshot") return "snapshot";
  if (metric?.source === "unavailable") return "indisponible";
  return "manquante";
}

function renderMultiHorizon() {
  if (!els.multiHorizonSummary) return;
  const coins = atlasComparisonCoins();
  const primary = getSelectedCoin();
  if (!state.liveOk || !primary) {
    setText(els.multiHorizonTitle, "Lecture temporelle du mouvement");
    setText(els.multiHorizonStatus, state.liveOk ? "Sélection requise" : "Livecheck requis");
    els.multiHorizonStatus.className = "pill warn";
    setText(els.multiHorizonSummary, state.liveOk
      ? "Sélectionne une crypto dans le MARKET SNAPSHOT pour afficher sa lecture 24 h, 7 jours et 30 jours."
      : "Atlas expliquera ensemble les mouvements 24 h, 7 jours et 30 jours sans produire de lecture décisionnelle.");
    for (const [valueEl, labelEl] of [[els.multiHorizon24Value, els.multiHorizon24Label], [els.multiHorizon7Value, els.multiHorizon7Label], [els.multiHorizon30Value, els.multiHorizon30Label]]) {
      setText(valueEl, "—"); setText(labelEl, state.liveOk ? "Sélection requise" : "En attente");
    }
    setHTML(els.multiHorizonMeta, `<span>Spot : —</span><span>Écart courbe : —</span><span>Source : ${state.liveOk ? escapeHtml(state.mainSource || "CoinGecko") : "—"}</span>`);
    setText(els.multiHorizonTechnical, state.liveOk ? "Aucune série sélectionnée." : "Les détails apparaîtront après le Livecheck.");
    return;
  }

  const activeComparison = coins.length > 1;
  const horizons = [
    [1, els.multiHorizon24Value, els.multiHorizon24Label, "24 h"],
    [7, els.multiHorizon7Value, els.multiHorizon7Label, "7 j"],
    [30, els.multiHorizon30Value, els.multiHorizon30Label, "30 j"]
  ];
  const activeDays = Number(state.chartPeriodDays || 1);
  const context = atlasChartContextStatus();
  const contextPending = !context.ready;
  setText(els.multiHorizonTitle, activeComparison ? `Comparaison ${coins.map(coin => coin.symbol).join(" / ")}` : `${primary.name} — ${primary.symbol}`);
  setText(els.multiHorizonStatus, contextPending ? "Mise à jour…" : activeComparison ? `Comparaison ${coins.length} actifs` : "Lecture individuelle");
  els.multiHorizonStatus.className = `pill ${contextPending ? "warn" : "ok"}`;

  if (activeComparison) {
    const bestRows = Object.fromEntries(horizons.map(([days]) => [days, atlasBestHorizonMetric(coins, days)]));
    const phrase = horizons.map(([days, , , periodLabel]) => {
      const best = bestRows[days];
      return best
        ? `Sur ${periodLabel === "24 h" ? "24 heures" : periodLabel === "7 j" ? "7 jours" : "30 jours"}, ${best.coin.symbol} mène (${atlasHorizonSourceShort(best.metric)}).`
        : `Sur ${periodLabel}, aucune valeur comparable n’est disponible.`;
    }).join(" ");
    const truthNote = context.ready
      ? "La période active utilise la série réelle CoinGecko ; les autres horizons restent explicitement issus du snapshot marché."
      : "Mise à jour de la comparaison : Atlas utilise provisoirement les snapshots disponibles et refuse de réutiliser une ancienne série hors contexte.";
    setText(els.multiHorizonSummary, `${phrase} ${truthNote}`);
    for (const [days, valueEl, labelEl, periodLabel] of horizons) {
      const best = bestRows[days];
      setText(valueEl, best ? `${best.coin.symbol} ${fmtPct(best.metric.value)}` : "—");
      setText(labelEl, best ? `Meilleur sur ${periodLabel} · ${atlasHorizonSourceShort(best.metric)}` : "Donnée manquante");
      valueEl?.closest?.(".horizon-card")?.setAttribute("data-source", best?.metric?.source || "missing");
    }
    setHTML(els.multiHorizonMeta, `<span>Mode : Base 100</span><span>Période active : ${escapeHtml(atlasChartPeriodLabel(activeDays))} · ${context.ready ? "market_chart EUR" : "mise à jour"}</span><span>Autres horizons : snapshot Top 50</span><span>Verrou contexte : ${context.ready ? "validé" : "ancien résultat ignoré"}</span>`);
    const rows = coins.map(coin => {
      const metrics = horizons.map(([days, , , label]) => {
        const metric = atlasHorizonMetricForCoin(coin, days);
        return `${label} ${metric.value !== null ? fmtPct(metric.value) : "—"} (${atlasHorizonSourceShort(metric)})`;
      });
      return `${coin.symbol} · ${metrics.join(" · ")}`;
    });
    setText(els.multiHorizonTechnical, `Source Truth Lock : ${rows.join(" | ")}. Contexte attendu : ${context.expected}. ${context.ready ? "Série active validée." : "Aucune ancienne série n’est réutilisée."}`);
    return;
  }

  const metricsByPeriod = Object.fromEntries(horizons.map(([days]) => [days, atlasHorizonMetricForCoin(primary, days)]));
  const sentenceCoin = {
    ...primary,
    change24h: metricsByPeriod[1].value,
    change7d: metricsByPeriod[7].value,
    change30d: metricsByPeriod[30].value
  };
  const truthNote = context.ready
    ? "La période active est issue de la série réelle ; les autres cartes sont marquées snapshot."
    : "Mise à jour de la série : la lecture reste provisoirement fondée sur le snapshot marché, sans reprendre un ancien graphique.";
  setText(els.multiHorizonSummary, `${atlasMovementSentence(sentenceCoin)} ${truthNote}`);
  for (const [days, valueEl, labelEl] of horizons) {
    const metric = metricsByPeriod[days];
    const classification = atlasClassifyHorizonChange(metric.value);
    setText(valueEl, metric.value !== null ? fmtPct(metric.value) : "—");
    setText(labelEl, `${classification.label} · ${atlasHorizonSourceShort(metric)}`);
    valueEl?.closest?.(".horizon-card")?.setAttribute("data-state", classification.key);
    valueEl?.closest?.(".horizon-card")?.setAttribute("data-source", metric.source);
  }
  const gap = atlasCurrentChartGap();
  const gapLabel = Number.isFinite(gap) ? `${gap.toFixed(2)} %` : "non calculé";
  const gapQuality = !Number.isFinite(gap) ? "en attente" : gap <= 0.25 ? "cohérence forte" : gap <= 0.75 ? "cohérence acceptable" : gap <= 1.5 ? "à surveiller" : "décalage important";
  setHTML(els.multiHorizonMeta, `<span>Spot : ${escapeHtml(atlasFormatEUR(primary.priceEur ?? primary.price))}</span><span>Période active : ${escapeHtml(atlasChartPeriodLabel(activeDays))} · ${context.ready ? "série réelle" : "mise à jour"}</span><span>Autres horizons : snapshot marché</span><span>Écart courbe : ${escapeHtml(gapLabel)} · ${escapeHtml(gapQuality)}</span><span>Verrou contexte : ${context.ready ? "validé" : "ancien résultat ignoré"}</span>`);
  const result = context.ready ? state.dataBroker.chart?.result : null;
  const chartMetrics = result?.integrity?.metrics || {};
  const technical = horizons.map(([days, , , label]) => {
    const metric = metricsByPeriod[days];
    return `${label} ${metric.value !== null ? fmtPct(metric.value) : "—"} (${atlasHorizonSourceShort(metric)})`;
  });
  technical.push(
    Number.isFinite(chartMetrics.firstPrice) ? `ouverture série active ${atlasFormatEUR(chartMetrics.firstPrice)}` : null,
    Number.isFinite(chartMetrics.lastPrice) ? `dernier point ${atlasFormatEUR(chartMetrics.lastPrice)}` : null,
    Number.isFinite(chartMetrics.pointCount) ? `${chartMetrics.pointCount} points` : null,
    result?.source || null,
    `contexte ${context.ready ? "validé" : "en attente"}`
  );
  setText(els.multiHorizonTechnical, technical.filter(Boolean).join(" · "));
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

const ATLAS_CHART_LOCAL_CACHE_KEY = "agent_crypto_erith_ia_real_charts_v1_1_alpha_26_37_top50";
const ATLAS_CHART_MAX_FUTURE_MS = 5 * 60 * 1000;
const ATLAS_CHART_PRICE_GAP_WARN_PCT = 2.5;
const ATLAS_CHART_DIRECT_TIMEOUT_MS = 12000;
const ATLAS_CHART_SELECTION_AUTO_RETRIES = 3;
const ATLAS_CHART_SELECTION_RETRY_DELAYS_MS = [15000, 45000, 120000];
const ATLAS_CHART_RULES = Object.freeze({
  1: Object.freeze({ minPoints: 20, minCoverageHours: 20, refreshMs: ATLAS_CHART_BACKGROUND_REFRESH_MS, delayedMs: 6 * 60 * 60 * 1000, archiveMs: 7 * 24 * 60 * 60 * 1000 }),
  7: Object.freeze({ minPoints: 40, minCoverageHours: 132, refreshMs: ATLAS_CHART_BACKGROUND_REFRESH_MS, delayedMs: 24 * 60 * 60 * 1000, archiveMs: 14 * 24 * 60 * 60 * 1000 }),
  30: Object.freeze({ minPoints: 100, minCoverageHours: 600, refreshMs: ATLAS_CHART_BACKGROUND_REFRESH_MS, delayedMs: 72 * 60 * 60 * 1000, archiveMs: 60 * 24 * 60 * 60 * 1000 }),
  60: Object.freeze({ minPoints: 120, minCoverageHours: 1200, refreshMs: 15 * 60 * 1000, delayedMs: 5 * 24 * 60 * 60 * 1000, archiveMs: 120 * 24 * 60 * 60 * 1000 }),
  90: Object.freeze({ minPoints: 180, minCoverageHours: 1800, refreshMs: 30 * 60 * 1000, delayedMs: 7 * 24 * 60 * 60 * 1000, archiveMs: 180 * 24 * 60 * 60 * 1000 }),
  365: Object.freeze({ minPoints: 180, minCoverageHours: 7600, refreshMs: 60 * 60 * 1000, delayedMs: 14 * 24 * 60 * 60 * 1000, archiveMs: 540 * 24 * 60 * 60 * 1000 }),
  36500: Object.freeze({ minPoints: 180, minCoverageHours: 7600, refreshMs: 6 * 60 * 60 * 1000, delayedMs: 30 * 24 * 60 * 60 * 1000, archiveMs: 900 * 24 * 60 * 60 * 1000 })
});

function atlasChartRules(days) {
  return ATLAS_CHART_RULES[Number(days || 1)] || ATLAS_CHART_RULES[1];
}

const ATLAS_CHART_MAX_TRUTH_KEY = "agent_crypto_erith_ia_chart_max_truth_v2811";

function atlasChartCoverageDays(result) {
  const series = Array.isArray(result?.series) ? result.series : [];
  if (series.length < 2) return 0;
  const first = Number(series[0]?.[0]);
  const last = Number(series[series.length - 1]?.[0]);
  if (!Number.isFinite(first) || !Number.isFinite(last) || last <= first) return 0;
  return (last - first) / 86400000;
}

function atlasChartMaxCoverageLabel(days) {
  const value = Number(days || 0);
  if (!Number.isFinite(value) || value <= 0) return "Max non mesuré";
  if (value < 45) return `${Math.max(1, Math.round(value))} j reçus`;
  if (value < 330) return `${Math.max(1, Math.round(value / 30))} mois reçus`;
  const years = value / 365.2425;
  return `${years.toFixed(years < 2 ? 1 : 0)} an${years >= 1.5 ? "s" : ""} reçus`;
}

function atlasReadChartMaxTruth() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ATLAS_CHART_MAX_TRUTH_KEY) || "null");
    if (!parsed || !Number.isFinite(Number(parsed.coverageDays))) return null;
    return parsed;
  } catch {
    return null;
  }
}

function atlasRenderChartMaxTruth(record = atlasReadChartMaxTruth()) {
  const button = document.getElementById("btnChartMaxPeriod");
  const label = document.getElementById("chartMaxPeriodTruth");
  if (!button || !label) return;

  if (!record) {
    button.textContent = "Max ?";
    button.setAttribute("aria-label", "Mesurer la couverture historique maximale réellement reçue");
    label.textContent = "Max non mesuré";
    label.dataset.state = "unknown";
    return;
  }

  const coverageLabel = atlasChartMaxCoverageLabel(record.coverageDays);
  button.textContent = record.coverageDays >= 330
    ? `Max ${Math.max(1, Math.round(record.coverageDays / 365.2425))}a`
    : "Max";
  button.setAttribute("aria-label", `${coverageLabel} · ${record.pointCount || 0} points · ${record.symbol || "actif"} · mesure locale`);
  label.textContent = coverageLabel;
  label.dataset.state = "measured";
}

function atlasWriteChartMaxTruth(result, coin) {
  const coverageDays = atlasChartCoverageDays(result);
  if (!coverageDays) return;
  const series = Array.isArray(result?.series) ? result.series : [];
  const firstTimestamp = Number(series[0]?.[0] || 0);
  const lastTimestamp = Number(series[series.length - 1]?.[0] || 0);
  const record = {
    coverageDays,
    pointCount: series.length,
    coinId: coin?.id || null,
    symbol: coin?.symbol || null,
    firstTimestamp: Number.isFinite(firstTimestamp) && firstTimestamp > 0 ? firstTimestamp : null,
    lastTimestamp: Number.isFinite(lastTimestamp) && lastTimestamp > 0 ? lastTimestamp : null,
    measuredAt: new Date().toISOString()
  };
  try { localStorage.setItem(ATLAS_CHART_MAX_TRUTH_KEY, JSON.stringify(record)); } catch {}
  atlasRenderChartMaxTruth(record);
}

function atlasChartApiDays(days){ return Number(days||1)===36500 ? "max" : String(Number(days||1)); }

function atlasChartKey(c, days) {
  return `${String(c?.id || "unknown").toLowerCase()}:${Number(days || 1)}`;
}

function atlasSanitizeChartRows(rows = []) {
  const ordered = (Array.isArray(rows) ? rows : [])
    .map(point => [Number(point?.[0]), Number(point?.[1])])
    .filter(point => Number.isFinite(point[0]) && point[0] > 0 && Number.isFinite(point[1]) && point[1] > 0)
    .sort((a, b) => a[0] - b[0]);

  if (ordered.length < 3) return ordered;

  const sanitized = [];
  for (const point of ordered) {
    const previous = sanitized[sanitized.length - 1];
    if (!previous) {
      sanitized.push(point);
      continue;
    }

    const ratio = point[1] / previous[1];
    if (!Number.isFinite(ratio) || ratio <= 0) continue;

    // Une multiplication/division instantanée par 8 entre deux points adjacents
    // est traitée comme une donnée corrompue, jamais comme une trajectoire réelle.
    if (ratio > 8 || ratio < 0.125) continue;
    sanitized.push(point);
  }

  return sanitized.length >= 2 ? sanitized : ordered;
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
  return atlasSanitizeChartRows([...byTimestamp.entries()]);
}
function atlasNormalizeVolumePayload(payload){ const raw=Array.isArray(payload?.total_volumes)?payload.total_volumes:[]; const map=new Map(); for(const p of raw){const t=Number(p?.[0]),v=Number(p?.[1]); if(Number.isFinite(t)&&t>0&&Number.isFinite(v)&&v>=0)map.set(t,v);} return [...map.entries()].sort((a,b)=>a[0]-b[0]); }

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
  if (memory) {
    candidates.push({
      ...memory,
      originalSourceMode: memory.sourceMode || null,
      sourceMode: "browser-cache",
      source: "Cache récent navigateur · série CoinGecko"
    });
  }
  const local = atlasReadLocalChartStore()[key];
  if (local) {
    candidates.push({
      ...local,
      originalSourceMode: local.sourceMode || null,
      sourceMode: "browser-cache",
      source: "Cache navigateur · série CoinGecko"
    });
  }
  for (const candidate of candidates) {
    const prices = atlasNormalizeChartPayload({ prices: candidate?.series });
    const integrity = atlasValidateChartSeries({ c, days, prices, sourceMode: "browser-cache" });
    if (!integrity.ok) continue;
    return {
      ...candidate,
      series: prices,
      blocked: false,
      integrity,
      periodDays: Number(days || 1),
      sourceMode: "browser-cache",
      source: candidate.source || "Cache navigateur · série CoinGecko"
    };
  }
  return null;
}

function atlasChartResultFingerprint(result) {
  const metrics = result?.integrity?.metrics || {};
  const firstPoint = result?.series?.[0] || [];
  const lastPoint = result?.series?.[
    Math.max(0, Number(result?.series?.length || 1) - 1)
  ] || [];

  const firstPrice = Number(
    metrics.firstPrice
    ?? firstPoint[1]
    ?? 0
  );
  const lastPrice = Number(
    metrics.lastPrice
    ?? lastPoint[1]
    ?? 0
  );

  return [
    Number(metrics.firstTimestamp || firstPoint[0] || 0),
    Number(metrics.lastTimestamp || lastPoint[0] || 0),
    Number(metrics.pointCount || result?.series?.length || 0),
    Number.isFinite(firstPrice)
      ? firstPrice.toPrecision(12)
      : "0",
    Number.isFinite(lastPrice)
      ? lastPrice.toPrecision(12)
      : "0",
    String(result?.sourceMode || "")
  ].join(":");
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
  let networkToken = null;
  const onAbort = () => controller.abort();
  signal?.addEventListener?.("abort", onAbort, { once: true });
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  try {
    networkToken = await atlasAcquireNetwork("chart", signal, ATLAS_NETWORK_WAIT_TIMEOUT_MS);
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
    if (networkToken) atlasReleaseNetwork(networkToken);
  }
}

async function fetchCoinGeckoChartDirect(c, days, options = {}) {
  const period=Number(days||1), apiDays=atlasChartApiDays(period);
  const url=`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(c.id)}/market_chart?vs_currency=eur&days=${encodeURIComponent(apiDays)}&precision=full`;
  const payload=await atlasFetchJson(url,{signal:options.signal,timeoutMs:Number(options.timeoutMs||ATLAS_CHART_DIRECT_TIMEOUT_MS)});
  const prices=atlasNormalizeChartPayload(payload), volumeSeries=atlasNormalizeVolumePayload(payload);
  const integrity=atlasValidateChartSeries({c,days:period,prices,payload,sourceMode:"coingecko-direct"});
  if(!integrity.ok)throw new Error(`série CoinGecko refusée · ${integrity.reason}`);
  return {series:prices,volumeSeries,source:"CoinGecko market_chart EUR · direct",blocked:false,kind:"coingecko-direct",sourceMode:"coingecko-direct",periodDays:period,apiDays,pointCount:prices.length,generatedAt:new Date(integrity.metrics.lastTimestamp).toISOString(),integrity};
}

async function fetchChartSeries(c, days, options = {}) {
  if (!c?.id) return { series: [], blocked: true, reason: "actif absent" };
  const period = Number(days || 1);
  const stored = options.fallback || atlasGetStoredChartResult(c, period);
  try {
    return await fetchCoinGeckoChartDirect(c, period, options);
  } catch (error) {
    if (stored) {
      return {
        ...stored,
        sourceMode: "browser-cache",
        source: "Cache navigateur · série CoinGecko",
        blocked: false,
        refreshWarning: `Actualisation directe indisponible · cache exact du ${atlasExactTimestampLabel(stored?.integrity?.metrics?.lastTimestamp || stored?.generatedAt)}`,
        technicalReason: String(error?.message || error)
      };
    }
    return {
      series: [],
      blocked: true,
      reason: "Historique CoinGecko direct temporairement indisponible.",
      technicalReason: String(error?.message || error)
    };
  }
}

function atlasChartLabelForTime(ts, days) {
  const d = new Date(Number(ts));
  const period = Number(days || 1);
  if (period <= 1) {
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }
  if (period <= 90) {
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
  }
  if (period <= 365) {
    return d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
  }
  return d.toLocaleDateString("fr-FR", { year: "numeric" });
}

function atlasChartAxisMetrics() {
  const width = Math.max(0, Number(window.innerWidth || 0));
  if (width >= 1500) return { xFont: 12, yFont: 12, xHeight: 32, yWidth: 88 };
  if (width >= 1180) return { xFont: 12, yFont: 12, xHeight: 31, yWidth: 84 };
  if (width >= 800) return { xFont: 11, yFont: 11, xHeight: 30, yWidth: 80 };
  return { xFont: 10, yFont: 10, xHeight: 28, yWidth: 74 };
}

function atlasChartAxisPriceLabel(value, view = "price") {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  if (view === "base100") return number.toFixed(1);

  const absolute = Math.abs(number);
  let maximumFractionDigits = 2;
  if (absolute >= 1000) maximumFractionDigits = 0;
  else if (absolute >= 100) maximumFractionDigits = 1;
  else if (absolute >= 1) maximumFractionDigits = 2;
  else if (absolute >= 0.01) maximumFractionDigits = 4;
  else maximumFractionDigits = 6;

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits
  }).format(number);
}

function atlasChartXAxisTickLimit(period) {
  const width = Math.max(0, Number(window.innerWidth || 0));
  if (width < 800) return 6;
  if (width < 1180) return 7;
  if (Number(period) >= 365) return 8;
  return width >= 1500 ? 10 : 9;
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
  return `dernier ${safeMoney(last)} · variation de la série ${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)} % · min ${safeMoney(min)} · max ${safeMoney(max)} · ${rows.length} points`;
}

function atlasDestroyRealChart() {
  atlasHideChartTooltip();
  atlasHideChartRefresh();
  if (state.chartEngineV2?.realChart) {
    try { state.chartEngineV2.realChart.destroy(); } catch {}
    state.chartEngineV2.realChart = null;
  }
}

function atlasSetChartShellState(
  canvas,
  mode,
  summary = "",
  freshness = "fresh",
  origin = "direct"
) {
  const shell = canvas?.closest?.(".chart-shell");
  if (!shell) return;

  delete shell.dataset.realChart;
  delete shell.dataset.chartSummary;
  delete shell.dataset.chartFreshness;
  delete shell.dataset.chartOrigin;

  shell.dataset.chartState = mode || "blocked";

  if (mode === "valid") {
    shell.dataset.realChart = "coingecko";
    shell.dataset.chartFreshness = freshness || "fresh";
    shell.dataset.chartOrigin = origin || "unknown";
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


const ATLAS_CLEAN_LENS_PANEL_KEY = "agent_crypto_erith_ia_clean_lens_detail_collapsed_v1";
const ATLAS_DETAIL_WINDOWS_KEY = "agent_crypto_erith_ia_detail_windows_v27_2_1";

function atlasCleanLensResizeChart() {
  const chart = state.chartEngineV2?.realChart;
  if (!chart) return;
  try { chart.resize(); } catch (error) { console.warn("Redimensionnement graphique ignoré", error); }
}

function atlasSetCleanLensCollapsed(collapsed, persist = true) {
  const deck = document.getElementById("analyste");
  const panel = document.getElementById("detailPanel");
  const toggle = document.getElementById("detailPanelToggle");
  const stateLabel = document.getElementById("detailPanelToggleState");
  const rail = document.getElementById("detailPanelRail");
  const railArrow = document.querySelector("#detailPanelRail b");
  if (!deck) return;

  const isCollapsed = !!collapsed;
  deck.classList.toggle("detail-collapsed", isCollapsed);
  toggle?.setAttribute("aria-expanded", String(!isCollapsed));
  rail?.setAttribute("aria-expanded", String(!isCollapsed));
  panel?.setAttribute("aria-hidden", String(isCollapsed));
  if (panel) {
    panel.inert = isCollapsed;
    panel.hidden = isCollapsed;
  }
  if (stateLabel) stateLabel.textContent = isCollapsed ? "Afficher ▼" : "Réduire ▲";
  if (railArrow) railArrow.textContent = isCollapsed ? "▼" : "▲";
  if (toggle) {
    toggle.disabled = false;
    toggle.tabIndex = 0;
  }

  if (persist) {
    try { localStorage.setItem(ATLAS_CLEAN_LENS_PANEL_KEY, isCollapsed ? "1" : "0"); } catch {}
  }

  requestAnimationFrame(atlasCleanLensResizeChart);
  setTimeout(atlasCleanLensResizeChart, 120);
  setTimeout(atlasCleanLensResizeChart, 320);
}

function atlasToggleCleanLensPanel(forceOpen = null) {
  const deck = document.getElementById("analyste");
  if (!deck) return;

  const currentlyCollapsed = deck.classList.contains("detail-collapsed");
  const nextCollapsed = forceOpen === true
    ? false
    : forceOpen === false
      ? true
      : !currentlyCollapsed;

  atlasSetCleanLensCollapsed(nextCollapsed);
}

function initAtlasCleanLensPanel() {
  const deck = document.getElementById("analyste");
  const toggle = document.getElementById("detailPanelToggle");
  const rail = document.getElementById("detailPanelRail");
  if (!deck || !toggle || !rail) return;

  let collapsed = true;
  try {
    const storedPanelState = localStorage.getItem(ATLAS_CLEAN_LENS_PANEL_KEY);
    collapsed = storedPanelState == null
      ? true
      : storedPanelState === "1";
  } catch {}

  atlasSetCleanLensCollapsed(collapsed, false);

  const bindControl = control => {
    if (!control || control.dataset.cleanLensDirectBound === "1") return;
    control.dataset.cleanLensDirectBound = "1";

    control.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();

      const action = control.dataset.cleanLensAction || "toggle";
      if (action === "open") atlasToggleCleanLensPanel(true);
      else atlasToggleCleanLensPanel();
    });
  };

  bindControl(rail);
  bindControl(toggle);

  deck.dataset.cleanLensBound = "direct-v28121";

  if (deck.dataset.cleanLensResizeBound !== "1") {
    deck.dataset.cleanLensResizeBound = "1";
    window.addEventListener("resize", () => {
      requestAnimationFrame(atlasCleanLensResizeChart);
    }, { passive: true });
  }
}


function atlasReadDetailWindowState() {
  const defaults = { asset: false, source: false, sources: false, network: false, integrity: false };
  try {
    const parsed = JSON.parse(localStorage.getItem(ATLAS_DETAIL_WINDOWS_KEY) || "{}");
    return { ...defaults, ...(parsed && typeof parsed === "object" ? parsed : {}) };
  } catch {
    return defaults;
  }
}

function atlasSaveDetailWindowState() {
  const stateMap = {};
  document.querySelectorAll("[data-detail-window]").forEach(windowEl => {
    stateMap[windowEl.dataset.detailWindow] = !!windowEl.open;
  });
  try { localStorage.setItem(ATLAS_DETAIL_WINDOWS_KEY, JSON.stringify(stateMap)); } catch {}
}

function atlasUpdateDetailWindowStateLabel(windowEl) {
  if (!windowEl) return;
  const label = windowEl.querySelector(":scope > summary [data-window-state]");
  if (label) label.textContent = windowEl.open ? "Réduire" : "Ouvrir";
}

function atlasCloseSiblingDetailWindows(activeWindow) {
  document.querySelectorAll("[data-detail-window]").forEach(windowEl => {
    if (windowEl === activeWindow || !windowEl.open) return;
    windowEl.open = false;
    atlasUpdateDetailWindowStateLabel(windowEl);
  });
}

function initAtlasDetailWindows() {
  const windows = [...document.querySelectorAll("[data-detail-window]")];
  const saved = atlasReadDetailWindowState();

  windows.forEach(windowEl => {
    const key = windowEl.dataset.detailWindow;
    windowEl.open = saved[key] === true;
    atlasUpdateDetailWindowStateLabel(windowEl);

    windowEl.addEventListener("toggle", () => {
      if (windowEl.open) atlasCloseSiblingDetailWindows(windowEl);
      atlasUpdateDetailWindowStateLabel(windowEl);
      atlasSaveDetailWindowState();
      if (windowEl.open && windowEl.dataset.detailWindow === "source") {
        const coin = getSelectedCoin() || state.coins[0] || null;
        if (coin) atlasEnsureSourceDock(coin, { force: false });
      }
      requestAnimationFrame(atlasCleanLensResizeChart);
      setTimeout(atlasCleanLensResizeChart, 120);
    });
  });
}

function drawChartMessage(canvas, mode, title, detail, footer) {
  atlasDestroyRealChart();
  if (!canvas) return;
  atlasSetChartShellState(canvas, mode);
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(560, Math.floor(rect.width || canvas.clientWidth || 980));
  const minimumHeight = mode === "valid" ? 300 : 220;
  const height = Math.max(minimumHeight, Math.floor(rect.height || canvas.clientHeight || minimumHeight));
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
  const preserved = atlasShowChartRefresh(canvas, title);
  if (preserved) return true;
  drawChartMessage(canvas, "loading", title, detail, "La page reste active pendant la vérification.");
  return false;
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

function atlasChartRefreshNode() {
  return document.getElementById("atlasChartRefresh");
}

function atlasChartRefreshTextNode() {
  return document.getElementById("atlasChartRefreshText");
}

function atlasShowChartRefresh(canvas, text = "Mise à jour du graphe…") {
  const shell = canvas?.closest?.(".chart-shell");
  const node = atlasChartRefreshNode();
  const label = atlasChartRefreshTextNode();
  if (!shell || !node || !state.chartEngineV2?.realChart) return false;
  atlasHideChartTooltip();
  if (label) label.textContent = String(text || "Mise à jour du graphe…");
  shell.dataset.chartRefreshing = "true";
  shell.setAttribute("aria-busy", "true");
  node.hidden = false;
  node.setAttribute("aria-hidden", "false");
  return true;
}

function atlasUpdateChartRefresh(text) {
  const label = atlasChartRefreshTextNode();
  if (label) label.textContent = String(text || "Mise à jour du graphe…");
}

function atlasHideChartRefresh() {
  const node = atlasChartRefreshNode();
  const shell = node?.closest?.(".chart-shell");
  if (node) {
    node.hidden = true;
    node.setAttribute("aria-hidden", "true");
  }
  if (shell) {
    delete shell.dataset.chartRefreshing;
    shell.removeAttribute("aria-busy");
  }
}


const ATLAS_CHART_V2_SETTINGS_KEY="agent_crypto_erith_ia_chart_v2_settings_v28_1_17";
function atlasReadChartV2Settings(){try{const p=JSON.parse(localStorage.getItem(ATLAS_CHART_V2_SETTINGS_KEY)||"{}");state.chartViewV2={view:p.view==="base100"?"base100":"price",scale:p.scale==="logarithmic"?"logarithmic":"linear",volume:p.volume!==false,legend:p.legend===true,comparisonLegend:p.comparisonLegend===true,marketColumns:p.marketColumns==="complete"?"complete":"essential"};}catch{} return state.chartViewV2;}
function atlasWriteChartV2Settings(){try{localStorage.setItem(ATLAS_CHART_V2_SETTINGS_KEY,JSON.stringify(state.chartViewV2));}catch{}}
function atlasChartV2ComparisonMode(){return atlasComparisonActive();}
function atlasChartV2EffectiveView(){return atlasChartV2ComparisonMode()?"base100":state.chartViewV2.view;}
function atlasChartV2EffectiveScale(){return atlasChartV2EffectiveView()==="base100"?"linear":state.chartViewV2.scale;}
function atlasChartV2SyncControls() {
  const comparison = atlasChartV2ComparisonMode();
  const view = atlasChartV2EffectiveView();
  const scale = atlasChartV2EffectiveScale();
  const legendActive = comparison ? state.chartViewV2.comparisonLegend : state.chartViewV2.legend;

  document.querySelectorAll("[data-chart-view]").forEach(button => {
    const active = button.dataset.chartView === view;
    button.classList.toggle("is-active", active);
    button.disabled = comparison && button.dataset.chartView === "price";
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });

  document.querySelectorAll("[data-chart-scale]").forEach(button => {
    const active = button.dataset.chartScale === scale;
    button.classList.toggle("is-active", active);
    button.disabled = view === "base100";
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });

  document.querySelectorAll("[data-chart-display='volume']").forEach(button => {
    const active = state.chartViewV2.volume && !comparison;
    button.classList.toggle("is-active", active);
    button.disabled = comparison;
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });

  document.querySelectorAll("[data-chart-display='legend']").forEach(button => {
    button.classList.toggle("is-active", legendActive);
    button.setAttribute("aria-pressed", legendActive ? "true" : "false");
  });

  document.querySelectorAll("[data-market-columns]").forEach(button => {
    const active = button.dataset.marketColumns === state.chartViewV2.marketColumns;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });

  const panel = document.getElementById("marketSnapshotPanel");
  if (panel) panel.dataset.marketColumns = atlasV2Mode() === "essential" ? "essential" : state.chartViewV2.marketColumns;
}

function atlasChartV2RenderLegend(entries = [], options = {}) {
  const node = document.getElementById("chartV2Legend");
  if (!node) return;

  const comparison = options.comparison === true;
  const enabled = comparison ? state.chartViewV2.comparisonLegend : state.chartViewV2.legend;

  if (!enabled || !entries.length) {
    node.hidden = true;
    node.innerHTML = "";
    if (!entries.length) atlasRenderChartValueOverlay([]);
    return;
  }

  node.hidden = false;
  node.innerHTML = entries.map((entry, index) => {
    const coin = entry.coin || entry;
    const palette = atlasCryptoPalette(coin, index);
    const gradient = atlasCryptoGradientCss(coin, index);
    const result = entry.result || options.result || null;
    const change = Number(result?.integrity?.metrics?.changePct);
    return `<span class="chart-v2-legend-item" style="--atlas-series-color:${escapeHtml(palette.primary)};--atlas-series-gradient:${escapeHtml(gradient)}">
      <i aria-hidden="true"></i><b>${escapeHtml(String(coin.symbol || coin.name || "ACTIF").toUpperCase())}</b>
      <small>${Number.isFinite(change) ? escapeHtml(fmtPct(change)) : "—"}</small>
    </span>`;
  }).join("");
}


function atlasRenderChartValueOverlay() {
  /* Build 28.1.38: fixed value board removed; tooltip and optional legend remain canonical. */
}

function atlasChartV2RedrawFromBroker() {
  const chart = state.dataBroker?.chart;
  if (chart?.status !== "ready" || !atlasChartContextMatches(chart)) {
    atlasChartV2SyncControls();
    return;
  }

  if (chart.result?.comparison && Array.isArray(chart.result.entries)) {
    const period = Number(chart.period || state.chartPeriodDays || 1);
    const drawn = drawComparisonChart(
      els.mainChart,
      chart.result.entries,
      period,
      chart.contextKey || `comparison:${period}`
    );
    atlasChartV2RenderLegend(drawn, { comparison: true });
    atlasRenderComparisonCaption(
      drawn,
      period,
      state.dataBroker.comparison.unavailableIds || [],
      atlasComparisonIds().length
    );
  } else {
    const coin = getSelectedCoin();
    if (!coin || !chart.result?.series?.length) return;
    const period = Number(chart.period || state.chartPeriodDays || 1);
    drawLineChart(
      els.mainChart,
      chart.result.series,
      `${coin.symbol} ${atlasChartPeriodLabel(period)}`,
      chart.result,
      chart.contextKey || atlasChartKey(coin, period)
    );
    atlasRenderSingleCaption(coin, atlasChartPeriodLabel(period), chart.result);
  }

  atlasChartV2SyncControls();
}

function atlasChartV2SetOption(kind, value) {
  const comparison = atlasChartV2ComparisonMode();

  if (kind === "view") {
    state.chartViewV2.view = value === "base100" ? "base100" : "price";
    if (state.chartViewV2.view === "base100") state.chartViewV2.scale = "linear";
  } else if (kind === "scale") {
    state.chartViewV2.scale = value === "logarithmic" ? "logarithmic" : "linear";
  } else if (kind === "volume") {
    state.chartViewV2.volume = !state.chartViewV2.volume;
  } else if (kind === "legend") {
    if (comparison) state.chartViewV2.comparisonLegend = !state.chartViewV2.comparisonLegend;
    else state.chartViewV2.legend = !state.chartViewV2.legend;
  } else if (kind === "marketColumns") {
    state.chartViewV2.marketColumns = value === "complete" ? "complete" : "essential";
  }

  atlasWriteChartV2Settings();
  atlasChartV2SyncControls();
  if (kind === "marketColumns") renderMarketTable();
  else atlasChartV2RedrawFromBroker();
}

function atlasInitChartV2Controls() {
  atlasReadChartV2Settings();
  atlasChartV2SyncControls();

  document.querySelectorAll("[data-chart-view]").forEach(button => {
    button.addEventListener("click", () => atlasChartV2SetOption("view", button.dataset.chartView));
  });
  document.querySelectorAll("[data-chart-scale]").forEach(button => {
    button.addEventListener("click", () => atlasChartV2SetOption("scale", button.dataset.chartScale));
  });
  document.querySelectorAll("[data-chart-display]").forEach(button => {
    button.addEventListener("click", () => atlasChartV2SetOption(button.dataset.chartDisplay, true));
  });
  document.querySelectorAll("[data-market-columns]").forEach(button => {
    button.addEventListener("click", () => atlasChartV2SetOption("marketColumns", button.dataset.marketColumns));
  });
}

function atlasChartTooltipNode() {
  return document.getElementById("atlasChartTooltip");
}

function atlasHideChartTooltip() {
  const node = atlasChartTooltipNode();
  if (!node) return;
  node.hidden = true;
  node.setAttribute("aria-hidden", "true");
  node.removeAttribute("data-dock");
  node.style.removeProperty("left");
  node.style.removeProperty("top");
}

function atlasChartTooltipCoinMarkup(coin, color, gradientCss = "") {
  const symbol = escapeHtml(String(coin?.symbol || "ACTIF").toUpperCase());
  const name = escapeHtml(coin?.name || symbol);
  const image = coin?.image
    ? `<img src="${escapeHtml(coin.image)}" alt="" loading="eager">`
    : `<span class="atlas-chart-tooltip-fallback" aria-hidden="true">${symbol.slice(0, 1)}</span>`;
  const style = `--atlas-series-color:${escapeHtml(color || "#F7931A")};--atlas-series-gradient:${escapeHtml(gradientCss || `linear-gradient(90deg, ${color || "#F7931A"}, ${color || "#F7931A"})`)}`;
  return `<span class="atlas-chart-tooltip-identity" style="${style}">${image}<span><b>${symbol}</b><small>${name}</small></span></span>`;
}

function atlasComparisonTooltipRows(chart, targetX) {
  const datasets = Array.isArray(chart?.data?.datasets) ? chart.data.datasets : [];
  return datasets.map(dataset => {
    const point = atlasNearestComparisonPoint(dataset, targetX);
    if (!point) return null;
    const rows = Array.isArray(dataset?.data) ? dataset.data : [];
    const nativeInterval = atlasMedianInterval(rows) || Infinity;
    const distance = Math.abs(Number(point.x) - Number(targetX));
    if (Number.isFinite(nativeInterval) && distance > nativeInterval * 4) return null;
    return {
      coin: dataset.atlasCoin || {},
      color: dataset.atlasPrimaryColor || dataset.borderColor,
      gradientCss: dataset.atlasGradientCss || "",
      baseValue: Number(point.y),
      rawPrice: Number(point.rawPrice),
      timestamp: Number(point.x)
    };
  }).filter(Boolean);
}

function atlasPositionChartTooltip(chart, tooltip, node) {
  const shell = chart?.canvas?.closest?.(".chart-shell");
  if (!shell || !node) return;

  const shellRect = shell.getBoundingClientRect();
  const canvasRect = chart.canvas.getBoundingClientRect();
  const measured = node.getBoundingClientRect();

  const anchorX = canvasRect.left - shellRect.left + Number(tooltip.caretX || 0);
  const anchorY = canvasRect.top - shellRect.top + Number(tooltip.caretY || 0);
  const canvasLeft = canvasRect.left - shellRect.left;
  const canvasWidth = canvasRect.width || shell.clientWidth;
  const cursorOnRight = anchorX > canvasLeft + canvasWidth * 0.58;

  let left = cursorOnRight
    ? anchorX - measured.width - 18
    : anchorX + 18;
  let top = anchorY - measured.height * 0.50;

  left = clamp(10, Math.max(10, shell.clientWidth - measured.width - 10), left);
  top = clamp(10, Math.max(10, shell.clientHeight - measured.height - 10), top);

  node.dataset.dock = cursorOnRight ? "left" : "right";
  node.style.left = `${Math.round(left)}px`;
  node.style.top = `${Math.round(top)}px`;
}


function atlasExternalChartTooltip(context) {
  const chart = context?.chart;
  const tooltip = context?.tooltip;
  const node = atlasChartTooltipNode();
  if (!chart || !node) return;

  if (!tooltip || tooltip.opacity === 0) {
    atlasHideChartTooltip();
    return;
  }

  const point = tooltip.dataPoints?.[0] || null;
  const targetX = Number(point?.parsed?.x);
  const comparison = chart.$atlasMode === "comparison";
  const rows = comparison
    ? atlasComparisonTooltipRows(chart, targetX, point?.dataIndex)
    : point ? [{
        coin: point.dataset?.atlasCoin || chart.$atlasCoin || {},
        color: point.dataset?.atlasPrimaryColor || point.dataset?.borderColor,
        gradientCss: point.dataset?.atlasGradientCss || "",
        baseValue: Number(point.raw?.baseValue),
        rawPrice: Number(point.raw?.rawPrice ?? point.parsed?.y),
        timestamp: targetX
      }] : [];

  if (!rows.length) {
    atlasHideChartTooltip();
    return;
  }

  const alignedTimestamp = Number.isFinite(Number(rows[0]?.timestamp))
    ? Number(rows[0].timestamp)
    : targetX;
  const title = atlasChartLabelFull(Number.isFinite(alignedTimestamp) ? alignedTimestamp : Date.now());

  const body = rows.map((row, index) => {
    const palette = atlasCryptoPalette(row.coin, index);
    const gradientCss = row.gradientCss || atlasCryptoGradientCss(row.coin, index);
    const price = Number.isFinite(row.rawPrice) ? atlasFormatEUR(row.rawPrice) : "Prix indisponible";
    const base = Number.isFinite(row.baseValue)
      ? `<small>Base 100 : ${row.baseValue.toFixed(2)}</small>`
      : '<small>Prix réel CoinGecko EUR</small>';
    const style = `--atlas-series-color:${escapeHtml(palette.primary)};--atlas-series-gradient:${escapeHtml(gradientCss)}`;
    return `<div class="atlas-chart-tooltip-row" style="${style}">${atlasChartTooltipCoinMarkup(row.coin, palette.primary, gradientCss)}<span class="atlas-chart-tooltip-color-bridge" aria-hidden="true"><i></i></span><span class="atlas-chart-tooltip-values"><strong>${escapeHtml(price)}</strong>${base}</span></div>`;
  }).join("");

  node.innerHTML = `<div class="atlas-chart-tooltip-date">${escapeHtml(title)}</div>${body}`;
  node.hidden = false;
  node.setAttribute("aria-hidden", "false");

  requestAnimationFrame(() => atlasPositionChartTooltip(chart, tooltip, node));
}

function atlasSetChartCaptionHtml(html, plainText) {
  if (!els.chartCaption) return;
  els.chartCaption.innerHTML = html;
  els.chartCaption.setAttribute("aria-label", plainText);
}

function atlasSetChartCaptionText(text) {
  if (!els.chartCaption) return;
  els.chartCaption.textContent = String(text || "");
  els.chartCaption.removeAttribute("aria-label");
}

function atlasRenderComparisonCaption(
  entries,
  period,
  unavailableItems = [],
  requestedCount = null
) {
  const periodLabel = atlasChartPeriodLabel(period);
  const unavailableCount = Array.isArray(unavailableItems)
    ? unavailableItems.length
    : Number(unavailableItems || 0);
  const selectedCount = Number(
    requestedCount || atlasComparisonIds().length || entries.length
  );
  const complete =
    entries.length === selectedCount
    && unavailableCount === 0;

  const truthResult = {
    comparison: true,
    entries,
    sourceMode: "comparison-base100"
  };
  const truth = atlasChartTruth(truthResult, period);
  const timestamps = entries
    .map(entry => Number(entry?.result?.integrity?.metrics?.lastTimestamp || 0))
    .filter(value => Number.isFinite(value) && value > 0);
  const exact = timestamps.length
    ? atlasExactTimestampLabel(Math.min(...timestamps))
    : "horodatage inconnu";

  const status =
    `Comparaison ${periodLabel} ${complete ? "complète" : "partielle"}`
    + ` · ${entries.length}/${selectedCount} séries`
    + `${unavailableCount ? ` · ${unavailableCount} indisponible${unavailableCount > 1 ? "s" : ""}` : ""}`
    + ` · ${truth.label}`
    + ` · série la plus ancienne : ${exact}.`;

  atlasSetChartCaptionText(status);
}

function atlasRenderSingleCaption(c, periodLabel, result, warning = "") {
  const metrics = result?.integrity?.metrics || {};
  const change = Number(metrics.changePct);
  const count = Array.isArray(result?.series) ? result.series.length : 0;
  const truth = atlasChartTruth(result, Number(state.chartPeriodDays || 1));
  const view =
    atlasChartV2EffectiveView() === "base100"
      ? "Base 100"
      : "Prix EUR";
  const scale =
    atlasChartV2EffectiveScale() === "logarithmic"
      ? "log"
      : "normal";
  const changeText = Number.isFinite(change)
    ? fmtPct(change)
    : "—";
  const seriesExact = truth.exact;

  const plain =
    `${c.symbol} · ${periodLabel} · ${view} · ${changeText}`
    + ` · ${count} points · ${truth.label}`
    + ` · série ${seriesExact}${warning}`;

  const asset =
    `<span class="chart-caption-asset" `
    + `style="--atlas-series-color:${escapeHtml(atlasCryptoPalette(c,0).primary)}">`
    + `<i></i><b>${escapeHtml(c.symbol)}</b>`
    + `<strong>${escapeHtml(changeText)}</strong></span>`;

  atlasSetChartCaptionHtml(
    `${asset}<span class="chart-caption-text">`
      + `${escapeHtml(periodLabel)} · ${escapeHtml(view)} · ${escapeHtml(scale)}`
      + ` · ${count} points · ${escapeHtml(truth.label)}`
      + ` · série ${escapeHtml(seriesExact)}${escapeHtml(warning)}`
      + `</span>`,
    plain
  );
}



function atlasHexToRgb(hex) {
  const normalized = String(hex || "#62ecff").replace("#", "").trim();
  const full = normalized.length === 3
    ? normalized.split("").map(char => char + char).join("")
    : normalized.padEnd(6, "f").slice(0, 6);
  const value = Number.parseInt(full, 16);
  if (!Number.isFinite(value)) return [98, 236, 255];
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function atlasRoundedRectPath(ctx, x, y, width, height, radius = 6) {
  const r = Math.max(0, Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function atlasMedianInterval(rows = []) {
  if (!Array.isArray(rows) || rows.length < 2) return null;
  const gaps = [];
  for (let index = 1; index < rows.length; index += 1) {
    const gap = Number(rows[index]?.t ?? rows[index]?.x) - Number(rows[index - 1]?.t ?? rows[index - 1]?.x);
    if (Number.isFinite(gap) && gap > 0) gaps.push(gap);
  }
  if (!gaps.length) return null;
  gaps.sort((a, b) => a - b);
  return gaps[Math.floor(gaps.length / 2)];
}

function atlasAlignVolumeToPriceTimeline(volumeSeries, priceRows, maximumBars = 420) {
  const prices = (Array.isArray(priceRows) ? priceRows : [])
    .map(point => ({ x: Number(point?.t ?? point?.x), price: Number(point?.price ?? point?.y) }))
    .filter(point => Number.isFinite(point.x) && Number.isFinite(point.price) && point.price > 0)
    .sort((a, b) => a.x - b.x);
  const volumes = (Array.isArray(volumeSeries) ? volumeSeries : [])
    .map(point => ({ x: Number(point?.[0] ?? point?.x), y: Number(point?.[1] ?? point?.y) }))
    .filter(point => Number.isFinite(point.x) && Number.isFinite(point.y) && point.y >= 0)
    .sort((a, b) => a.x - b.x);

  if (prices.length < 2 || !volumes.length) return [];

  const start = prices[0].x;
  const end = prices[prices.length - 1].x;
  const inRange = volumes.filter(point => point.x >= start && point.x <= end);
  if (!inRange.length) return [];

  const requested = Math.max(32, Math.min(Number(maximumBars || 420), prices.length));
  const stride = Math.max(1, Math.ceil(prices.length / requested));
  const timeline = prices.filter((_, index) => index % stride === 0 || index === prices.length - 1);
  const volumeStep = atlasMedianInterval(inRange) || atlasMedianInterval(prices) || Math.max(1, (end - start) / Math.max(1, timeline.length - 1));
  const priceStep = atlasMedianInterval(prices) || volumeStep;
  const maximumGap = Math.max(volumeStep * 2.5, priceStep * 2.5);

  let cursor = 0;
  return timeline.map(pricePoint => {
    while (cursor + 1 < inRange.length && inRange[cursor + 1].x <= pricePoint.x) cursor += 1;
    const left = inRange[cursor] || null;
    const right = inRange[cursor + 1] || null;
    const nearest = !left
      ? right
      : !right
        ? left
        : Math.abs(left.x - pricePoint.x) <= Math.abs(right.x - pricePoint.x) ? left : right;
    const distance = nearest ? Math.abs(nearest.x - pricePoint.x) : Infinity;
    return {
      x: pricePoint.x,
      y: nearest && distance <= maximumGap ? nearest.y : 0,
      price: pricePoint.price
    };
  });
}

/*
  Internal package Build 28.1.42.
  Release numbers are synchronized across the interface package.
*/
function atlasDrawCurveFollowingShadowBars({
  ctx,
  rows,
  xFor,
  yForPrice,
  baseline,
  clipLeft,
  clipTop,
  clipRight,
  clipBottom,
  color = "#62ecff",
  opacity = 0.18,
  heightRatio = 0.88,
  seriesIndex = 0,
  seriesCount = 1
}) {
  const safeRows = Array.isArray(rows)
    ? rows
        .filter(point =>
          Number.isFinite(Number(point?.x))
          && Number.isFinite(Number(point?.price))
          && Number(point.price) > 0
        )
        .sort((a, b) => Number(a.x) - Number(b.x))
    : [];

  if (!ctx || safeRows.length < 2) return;

  const safeBaseline = Math.min(
    Number(baseline),
    Number(clipBottom) - 1
  );
  const safeRatio = Math.max(
    0.10,
    Math.min(0.96, Number(heightRatio) || 0.88)
  );
  const safeOpacity = Math.max(
    0.025,
    Math.min(0.42, Number(opacity) || 0.18)
  );

  const pixelXs = safeRows
    .map(point => Number(xFor(point.x)))
    .filter(Number.isFinite)
    .sort((a, b) => a - b);

  const pixelGaps = pixelXs
    .slice(1)
    .map((value, index) => value - pixelXs[index])
    .filter(value => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);

  const medianPixelGap = pixelGaps.length
    ? pixelGaps[Math.floor(pixelGaps.length / 2)]
    : 4;

  const safeSeriesCount = Math.max(
    1,
    Math.min(12, Math.round(Number(seriesCount) || 1))
  );
  const safeSeriesIndex = Math.max(
    0,
    Math.min(
      safeSeriesCount - 1,
      Math.round(Number(seriesIndex) || 0)
    )
  );

  const groupWidth = Math.max(
    1.8,
    Math.min(6.4, medianPixelGap * 0.74)
  );
  const slotWidth = groupWidth / safeSeriesCount;
  const barWidth = safeSeriesCount === 1
    ? Math.max(1.25, Math.min(4.0, groupWidth * 0.58))
    : Math.max(0.68, Math.min(1.8, slotWidth * 0.78));
  const xOffset = safeSeriesCount === 1
    ? 0
    : (
        safeSeriesIndex - (safeSeriesCount - 1) / 2
      ) * slotWidth;

  const volumeValues = safeRows
    .map(point => Number(point?.y))
    .filter(value => Number.isFinite(value) && value >= 0);
  const maxVolume = Math.max(...volumeValues, 0);

  ctx.save();
  ctx.beginPath();
  ctx.rect(
    Number(clipLeft),
    Number(clipTop),
    Number(clipRight) - Number(clipLeft),
    Number(clipBottom) - Number(clipTop)
  );
  ctx.clip();

  /*
    Canonical geometry:
    - bars are vertical and parallel;
    - every bar starts from the exact bottom edge of the price plot;
    - no artificial date-axis reserve shifts the bars upward;
    - every bar follows its crypto curve point by point;
    - every bar reaches 88% of the baseline-to-curve distance;
    - the remaining 12% is the clean gap below the crypto line;
    - each series uses its own crypto color;
    - real volume only modulates opacity, never bar height.
  */
  for (const point of safeRows) {
    const rawX = Number(xFor(point.x));
    const rawCurveY = Number(yForPrice(point.price));
    if (!Number.isFinite(rawX) || !Number.isFinite(rawCurveY)) continue;

    const curveY = Math.max(
      Number(clipTop),
      Math.min(safeBaseline - 1, rawCurveY)
    );
    const distanceToCurve = Math.max(1, safeBaseline - curveY);
    const shadowHeight = distanceToCurve * safeRatio;
    const shadowTop = safeBaseline - shadowHeight;

    const volumeRatio = maxVolume > 0
      ? Math.max(
          0,
          Math.min(1, Number(point.y || 0) / maxVolume)
        )
      : 0;

    ctx.globalAlpha = safeOpacity * (0.78 + volumeRatio * 0.22);
    ctx.fillStyle = color;
    ctx.fillRect(
      rawX + xOffset - barWidth / 2,
      shadowTop,
      barWidth,
      Math.max(1, shadowHeight)
    );
  }

  ctx.restore();
}

const atlasChartMetadataPlugin = {
  id: "atlasChartMetadata",

  beforeInit(chart, _args, options = {}) {
    chart.$atlasMode = options.mode || "single";
    chart.$atlasCoin = options.coin || null;
    chart.$atlasView = options.view || (
      options.mode === "comparison"
        ? "base100"
        : "price"
    );
    chart.$atlasScale = options.scale || "linear";
    chart.$atlasPeriod = Number(
      options.period || state.chartPeriodDays || 1
    );
    chart.$atlasPriceAxisId =
      options.priceAxisId || "y";
    chart.$atlasVolumeAxisId =
      options.volumeAxisId || null;
    chart.$atlasVolume =
      options.volumeVisible === true;
    chart.$atlasVolumeVisible =
      options.volumeVisible === true;
    chart.$atlasVolumeRows =
      Array.isArray(options.volumeRows)
        ? options.volumeRows
        : [];
    chart.$atlasVolumeColor =
      options.volumeColor || "#62ecff";
    chart.$atlasShadowSeries =
      Array.isArray(options.shadowSeries)
        ? options.shadowSeries
        : [];
    chart.$atlasTimeline =
      Array.isArray(options.timeline)
        ? options.timeline
        : [];
  }
};

const atlasVolumeOverlayPlugin = {
  id: "atlasVolumeOverlay",
  beforeDatasetsDraw(chart) {
    if (!chart?.$atlasVolumeVisible) return;

    const area = chart.chartArea;
    const xScale = chart.scales?.x;
    const yScale = chart.scales?.[chart.$atlasPriceAxisId || "y"];
    if (!area || !xScale || !yScale) return;

    /*
      The Chart.js chartArea already excludes the x-axis labels.
      The shadow baseline must therefore use the true plot bottom.
    */
    const baseline = area.bottom;

    const configuredSeries = Array.isArray(chart.$atlasShadowSeries)
      ? chart.$atlasShadowSeries
      : [];

    const series = configuredSeries.length
      ? configuredSeries
      : Array.isArray(chart.$atlasVolumeRows) && chart.$atlasVolumeRows.length
        ? [{
            rows: chart.$atlasVolumeRows,
            color: chart.$atlasVolumeColor || "#62ecff",
            opacity: 0.20,
            heightRatio: 0.88
          }]
        : [];

    series.forEach((entry, index) => {
      atlasDrawCurveFollowingShadowBars({
        ctx: chart.ctx,
        rows: entry.rows,
        xFor: value => xScale.getPixelForValue(value),
        yForPrice: value => yScale.getPixelForValue(value),
        baseline,
        clipLeft: area.left,
        clipTop: area.top,
        clipRight: area.right,
        clipBottom: area.bottom,
        color: entry.color || "#62ecff",
        opacity: Number.isFinite(Number(entry.opacity))
          ? Number(entry.opacity)
          : index === 0 ? 0.18 : 0.10,
        heightRatio: 0.88,
        seriesIndex: index,
        seriesCount: series.length
      });
    });
  }
};

const atlasOverlayAxesPlugin = {
  id: "atlasOverlayAxes",
  afterDraw(chart) {
    const area = chart?.chartArea;
    const xScale = chart?.scales?.x;
    const yScale = chart?.scales?.y;
    if (!area || !xScale || !yScale) return;

    const ctx = chart.ctx;
    const view = chart.$atlasView === "base100" || chart.$atlasMode === "comparison" ? "base100" : "price";
    const period = Number(chart.$atlasPeriod || state.chartPeriodDays || 1);
    const width = area.right - area.left;
    const height = area.bottom - area.top;

    ctx.save();
    ctx.beginPath();
    ctx.rect(area.left, area.top, width, height);
    ctx.clip();

    const yTicks = (yScale.ticks || []).filter(tick => Number.isFinite(Number(tick.value)));
    const visibleY = yTicks.length > 6
      ? yTicks.filter((_, index) => index % Math.ceil(yTicks.length / 6) === 0)
      : yTicks;

    ctx.font = `750 ${atlasChartAxisMetrics().yFont}px system-ui, sans-serif`;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (const tick of visibleY) {
      const y = yScale.getPixelForValue(tick.value);
      if (y < area.top + 8 || y > area.bottom - 24) continue;
      const text = atlasChartAxisPriceLabel(tick.value, view);
      const textWidth = ctx.measureText(text).width;
      const boxWidth = textWidth + 16;
      const x = area.right - 6;

      atlasRoundedRectPath(ctx, x - boxWidth, y - 10, boxWidth, 20, 7);
      ctx.fillStyle = "rgba(3,10,20,.58)";
      ctx.fill();
      ctx.fillStyle = "rgba(239,249,255,.94)";
      ctx.fillText(text, x - 7, y);
    }

    const xTicks = (xScale.ticks || []).filter(tick => Number.isFinite(Number(tick.value)));
    const visibleX = xTicks.length > atlasChartXAxisTickLimit(period)
      ? xTicks.filter((_, index) => index % Math.ceil(xTicks.length / atlasChartXAxisTickLimit(period)) === 0)
      : xTicks;

    ctx.font = `700 ${atlasChartAxisMetrics().xFont}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    for (const tick of visibleX) {
      const x = xScale.getPixelForValue(tick.value);
      if (x < area.left + 24 || x > area.right - 72) continue;
      const text = atlasChartLabelForTime(Number(tick.value), period);
      const textWidth = ctx.measureText(text).width;
      atlasRoundedRectPath(ctx, x - textWidth / 2 - 6, area.bottom - 24, textWidth + 12, 20, 6);
      ctx.fillStyle = "rgba(3,10,20,.48)";
      ctx.fill();
      ctx.fillStyle = "rgba(226,244,255,.92)";
      ctx.fillText(text, x, area.bottom - 5);
    }

    ctx.restore();
  }
};

function drawLineChart(canvas, series, label = "", result = {}, chartKey = "") {
  if (!canvas) return;

  const period = Number(result?.periodDays || state.chartPeriodDays || 1);
  const rows = atlasSanitizeChartRows(series)
    .map(point => ({ t: Number(point?.[0]), price: Number(point?.[1]) }));

  if (rows.length < atlasChartRules(period).minPoints) {
    drawChartBlocked(canvas);
    atlasChartV2RenderLegend([]);
    return;
  }

  const coin = result?.coin || getSelectedCoin() || {};
  const palette = atlasCryptoPalette(coin, 0);
  const firstPrice = rows[0].price;
  const view = atlasChartV2EffectiveView();
  const scaleType = atlasChartV2EffectiveScale();
  const showVolume = state.chartViewV2.volume && !atlasChartV2ComparisonMode();

  const points = rows.map(row => ({
    x: row.t,
    y: view === "base100" ? row.price / firstPrice * 100 : row.price,
    rawPrice: row.price,
    baseValue: row.price / firstPrice * 100
  }));

  const values = points.map(point => point.y).filter(Number.isFinite);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const yPad = view === "base100"
    ? Math.max((max - min) * 0.08, 0.45)
    : Math.max((max - min) * 0.06, Math.abs(max) * 0.00035, 1e-8);


  const freshness = result?.integrity?.metrics?.freshness?.level || "fresh";
  atlasDestroyRealChart();
  atlasSetChartShellState(
    canvas,
    "valid",
    `${label} · ${view === "base100" ? "Base 100" : "Prix EUR"} · ${scaleType === "logarithmic" ? "log" : "normal"}`,
    freshness,
    atlasChartSourceMode(result)
  );
  state.chartEngineV2.lastRenderedKey = chartKey;
  state.chartEngineV2.lastFingerprint = `${atlasChartResultFingerprint(result)}:${view}:${scaleType}:${state.chartViewV2.volume}:${atlasChartV2ComparisonMode()?state.chartViewV2.comparisonLegend:state.chartViewV2.legend}`;

  if (window.Chart) {
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.clientHeight || 400);
    gradient.addColorStop(0, `${palette.primary}33`);
    gradient.addColorStop(0.55, `${palette.primary}10`);
    gradient.addColorStop(1, `${palette.primary}02`);

    const datasets = [{
      type: "line",
      label: `${label} · CoinGecko EUR`,
      atlasCoin: coin,
      atlasPrimaryColor: palette.primary,
      atlasGradientCss: atlasCryptoGradientCss(coin, 0),
      data: points,
      parsing: false,
      yAxisID: "y",
      borderWidth: 2.55,
      pointRadius(context) {
        return context.dataIndex === context.dataset.data.length - 1 ? 3.8 : 0;
      },
      pointHoverRadius: 5,
      pointHitRadius: 24,
      tension: 0.08,
      fill: { target: "start" },
      backgroundColor: gradient,
      borderColor: palette.primary,
      order: 1
    }];

    const volumeRows =
      atlasAlignVolumeToPriceTimeline(
        result?.volumeSeries,
        points.map(point => ({
          t: point.x,
          price: point.y
        }))
      );

    const shadowSeries = [{
      rows: volumeRows,
      color: palette.primary,
      opacity: 0.22,
      heightRatio: 0.88
    }];

    state.chartEngineV2.realChart = new Chart(ctx, {
      type: "line",
      data: { datasets },
      plugins: [atlasChartMetadataPlugin, atlasVolumeOverlayPlugin, atlasOverlayAxesPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        normalized: true,
        parsing: false,
        interaction: { mode: "nearest", intersect: false, axis: "x" },
        layout: { padding: { top: 8, right: 4, bottom: 0, left: 4 } },
        plugins: {
          atlasChartMetadata: {
            mode: "single",
            coin,
            view,
            scale: scaleType,
            period,
            priceAxisId: "y",
            volumeAxisId: null,
            volumeVisible: showVolume,
            volumeRows,
            volumeColor: palette.primary,
            shadowSeries
          },
          legend: { display: false },
          tooltip: {
            enabled: false,
            external: atlasExternalChartTooltip
          }
        },
        scales: {
          x: {
            type: "linear",
            min: rows[0].t,
            max: rows[rows.length - 1].t,
            bounds: "data",
            offset: false,
            afterFit(scale) { scale.height = 0; },
            border: { display: false },
            grid: { color: "rgba(176,236,255,.075)", drawTicks: false },
            ticks: {
              display: false,
              maxTicksLimit: atlasChartXAxisTickLimit(period),
              autoSkip: true,
              maxRotation: 0
            }
          },
          y: {
            type: scaleType,
            position: "right",
            min: scaleType === "linear" ? min - yPad : undefined,
            max: scaleType === "linear" ? max + yPad : undefined,
            afterFit(scale) { scale.width = 0; },
            border: { display: false },
            grid: { color: "rgba(176,236,255,.105)", drawTicks: false },
            ticks: { display: false, maxTicksLimit: 6 },
            title: { display: false }
          },
          yVolume: {
            display: false,
            min: 0,
            max: 1,
            grid: { display: false },
            ticks: { display: false },
            border: { display: false }
          }
        }
      }
    });

    atlasRefreshChartScale(
      state.chartEngineV2.realChart
    );
    state.chartEngineV2.realChart.update("none");
    atlasChartV2RenderLegend([{ coin, result }], { result });
    atlasRenderChartValueOverlay([{ coin, result, data: points, first: firstPrice }], { comparison: false, period });
    atlasChartV2SyncControls();
    return;
  }

  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(560, Math.floor(rect.width || canvas.clientWidth || 980));
  const height = Math.max(300, Math.floor(rect.height || canvas.clientHeight || 320));
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const left = 52, right = 100, top = 42, bottom = 42;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const low = min - yPad;
  const high = max + yPad;
  const startTime = rows[0].t;
  const endTime = rows[rows.length - 1].t;
  const xFor = time => left + ((time - startTime) / (endTime - startTime || 1)) * plotWidth;
  const yFor = value => top + plotHeight - ((value - low) / (high - low || 1)) * plotHeight;

  if (showVolume) {
    const fallbackVolumeRows = atlasAlignVolumeToPriceTimeline(
      result?.volumeSeries,
      points.map(point => ({ t: point.x, price: point.y }))
    );
    atlasDrawCurveFollowingShadowBars({
      ctx,
      rows: fallbackVolumeRows,
      xFor,
      yForPrice: yFor,
      baseline: top + plotHeight,
      clipLeft: left,
      clipTop: top,
      clipRight: left + plotWidth,
      clipBottom: top + plotHeight,
      color: palette.primary
    });
  }

  ctx.beginPath();
  points.forEach((point, index) => {
    const x = xFor(point.x);
    const y = yFor(point.y);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = palette.primary;
  ctx.lineWidth = 2.2;
  ctx.stroke();
  atlasChartV2RenderLegend([{ coin, result }], { result });
  atlasRenderChartValueOverlay([{ coin, result, data: points, first: firstPrice }], { comparison: false, period });
  atlasChartV2SyncControls();
}

function atlasChartPriceDatasets(chart) {
  return (chart?.data?.datasets || []).filter(dataset =>
    !dataset?.atlasVolumeDataset
    && (dataset?.yAxisID || "y") === "y"
  );
}

function atlasChartVolumeDatasets(chart) {
  return (chart?.data?.datasets || []).filter(dataset =>
    dataset?.atlasVolumeDataset
    || dataset?.yAxisID === "yVolume"
  );
}

function atlasRefreshChartScale(chart) {
  if (!chart?.data?.datasets?.length) return;

  const priceDatasets = atlasChartPriceDatasets(chart);
  const priceValues = priceDatasets
    .flatMap(dataset => (dataset.data || []).map(point => Number(point?.y)))
    .filter(value => Number.isFinite(value) && value > 0);

  const times = priceDatasets
    .flatMap(dataset => (dataset.data || []).map(point => Number(point?.x)))
    .filter(Number.isFinite);

  const yScale = chart.options?.scales?.y;
  if (priceValues.length && yScale) {
    const min = Math.min(...priceValues);
    const max = Math.max(...priceValues);
    const comparison = chart.$atlasMode === "comparison";
    const pad = comparison
      ? Math.max((max - min) * 0.08, 0.5)
      : Math.max((max - min) * 0.06, Math.abs(max) * 0.00035, 0.00000001);

    if (String(yScale.type || "linear") === "logarithmic") {
      delete yScale.min;
      delete yScale.max;
      yScale.suggestedMin = Math.max(Number.MIN_VALUE, min * 0.94);
      yScale.suggestedMax = max * 1.06;
    } else {
      delete yScale.suggestedMin;
      delete yScale.suggestedMax;
      yScale.min = min - pad;
      yScale.max = max + pad;
    }
  }

  const volumeValues = atlasChartVolumeDatasets(chart)
    .flatMap(dataset => (dataset.data || []).map(point => Number(point?.y)))
    .filter(value => Number.isFinite(value) && value >= 0);

  const volumeScale = chart.options?.scales?.yVolume;
  if (volumeScale && volumeValues.length) {
    const maxVolume = Math.max(...volumeValues);
    volumeScale.beginAtZero = true;
    volumeScale.suggestedMin = 0;
    volumeScale.suggestedMax = maxVolume > 0 ? maxVolume * 3.2 : 1;
  }

  if (times.length && chart.options?.scales?.x) {
    chart.options.scales.x.min = Math.min(...times);
    chart.options.scales.x.max = Math.max(...times);
  }
}

function atlasPatchChartLastPoint(
  quotes = state.dataBroker?.spotBook?.quotes || {},
  sharedTimestamp = Date.now()
) {
  const brokerChart =
    state.dataBroker?.chart;

  if (
    brokerChart?.status !== "ready"
    || !atlasChartContextMatches(
      brokerChart
    )
  ) {
    return false;
  }

  const relevantIds =
    brokerChart.result?.comparison
      ? (
          brokerChart.result.entries || []
        )
          .map(entry => entry?.coin?.id)
          .filter(Boolean)
      : [state.selectedCoinId]
          .filter(Boolean);

  const hasFreshDirectSpot =
    relevantIds.some(id => {
      const price =
        Number(quotes?.[id]?.eur);

      return (
        atlasSpotQuoteIsFreshDirect(id)
        && Number.isFinite(price)
        && price > 0
      );
    });

  if (!hasFreshDirectSpot) {
    return false;
  }

  /*
    Le spot direct continue d'alimenter
    les rubans, le tableau et le détail.
    Il ne réécrit jamais market_chart :
    - aucun déplacement de l'axe X ;
    - aucune fausse fraîcheur ;
    - aucune déformation Base 100 ;
    - aucun saut toutes les 30 secondes.
  */
  brokerChart.spotObservedAt =
    new Date(
      Number(
        sharedTimestamp || Date.now()
      )
    ).toISOString();

  brokerChart.spotPatchedAt = null;

  atlasRefreshSelectedDetailOnly();
  renderMultiHorizon();
  atlasRenderBrokerStrip();

  return true;
}

function atlasComparisonResultFingerprint(entries, period) {
  return `${Number(period || 1)}|${entries.map(entry => `${entry.coin.id}:${atlasChartResultFingerprint(entry.result)}`).join("|")}`;
}

function atlasComparisonSummary(entries) {
  return entries.map(entry => {
    const metrics = entry.result?.integrity?.metrics || {};
    return `${entry.coin.symbol} ${Number.isFinite(metrics.changePct) ? fmtPct(metrics.changePct) : "—"}`;
  }).join(" · ");
}

function atlasNearestComparisonPoint(dataset, targetX) {
  const data = Array.isArray(dataset?.data) ? dataset.data : [];
  if (!data.length || !Number.isFinite(Number(targetX))) return null;
  let low = 0;
  let high = data.length - 1;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (Number(data[mid]?.x) < Number(targetX)) low = mid + 1;
    else high = mid;
  }
  const right = data[low] || null;
  const left = data[Math.max(0, low - 1)] || null;
  if (!left) return right;
  if (!right) return left;
  return Math.abs(Number(left.x) - Number(targetX)) <= Math.abs(Number(right.x) - Number(targetX)) ? left : right;
}

function atlasComparisonRows(entry) {
  return atlasSanitizeChartRows(entry?.result?.series || [])
    .map(point => ({ t: Number(point?.[0]), price: Number(point?.[1]) }));
}

function atlasComparisonMaximumPoints(period) {
  const days = Number(period || 1);
  if (days <= 1) return 420;
  if (days <= 7) return 560;
  if (days <= 90) return 640;
  return 720;
}

function atlasDownsampleNativeComparisonRows(rows, maximumPoints) {
  const source = Array.isArray(rows) ? rows : [];
  const limit = Math.max(32, Number(maximumPoints || 640));
  if (source.length <= limit) return source;
  const stride = Math.max(1, Math.ceil((source.length - 2) / Math.max(1, limit - 2)));
  return source.filter((_, index) =>
    index === 0
    || index === source.length - 1
    || index % stride === 0
  );
}

function atlasBuildNativeComparisonTimeline(entries, maximumPoints = 720) {
  const timestamps = [...new Set(
    (Array.isArray(entries) ? entries : [])
      .flatMap(entry => (entry?.rows || []).map(row => Number(row?.t)))
      .filter(Number.isFinite)
  )].sort((a, b) => a - b);
  if (timestamps.length <= maximumPoints) return timestamps;
  const stride = Math.max(1, Math.ceil((timestamps.length - 2) / Math.max(1, maximumPoints - 2)));
  return timestamps.filter((_, index) =>
    index === 0
    || index === timestamps.length - 1
    || index % stride === 0
  );
}

function atlasBuildAlignedComparisonEntries(entries, period) {
  const minimum = atlasChartRules(period).minPoints;
  const maximumPoints = atlasComparisonMaximumPoints(period);
  const prepared = entries.map((entry, index) => ({
    ...entry,
    index,
    rows: atlasComparisonRows(entry)
  })).filter(entry => entry.rows.length >= minimum);

  if (!prepared.length) return [];

  const commonStart = Math.max(...prepared.map(entry => entry.rows[0].t));
  const commonEnd = Math.min(...prepared.map(entry => entry.rows[entry.rows.length - 1].t));
  if (!Number.isFinite(commonStart) || !Number.isFinite(commonEnd) || commonEnd <= commonStart) return [];

  const nativeEntries = prepared.map(entry => {
    const overlapRows = entry.rows.filter(row => row.t >= commonStart && row.t <= commonEnd);
    if (overlapRows.length < minimum) return null;
    const sampledRows = atlasDownsampleNativeComparisonRows(overlapRows, maximumPoints);
    const first = Number(sampledRows[0]?.price);
    if (!Number.isFinite(first) || first <= 0) return null;
    const data = sampledRows.map(row => ({
      x: row.t,
      y: row.price / first * 100,
      rawPrice: row.price
    })).filter(point =>
      Number.isFinite(point.x)
      && Number.isFinite(point.y)
      && Number.isFinite(point.rawPrice)
      && point.rawPrice > 0
    );
    if (data.length < minimum) return null;
    return {
      ...entry,
      rows: sampledRows,
      first,
      data,
      nativePointCount: overlapRows.length,
      sampledPointCount: data.length,
      missingPointCount: 0
    };
  }).filter(Boolean);

  if (!nativeEntries.length) return [];
  const nativeTimeline = atlasBuildNativeComparisonTimeline(nativeEntries, maximumPoints);
  return nativeEntries.map(entry => ({
    ...entry,
    alignedTimeline: nativeTimeline
  }));
}

function drawComparisonChart(canvas, entries, period, chartKey = "") {
  if (!canvas || !Array.isArray(entries) || entries.length < 2) {
    state.dataBroker.comparison.renderedIds = [];
    return [];
  }
  const normalizedEntries = atlasBuildAlignedComparisonEntries(entries, period);
  if (normalizedEntries.length < 2) {
    state.dataBroker.comparison.renderedIds = [];
    return [];
  }
  state.dataBroker.comparison.renderedIds = normalizedEntries.map(entry => entry.coin.id);

  const allValues = normalizedEntries.flatMap(entry => entry.data.filter(Boolean).map(point => point.y));
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const yPad = Math.max((max - min) * 0.08, 0.5);
  const timeline = normalizedEntries[0].alignedTimeline;
  const startTime = timeline[0];
  const endTime = timeline[timeline.length - 1];
  const summary = `${atlasComparisonSummary(normalizedEntries)} · ${normalizedEntries.length} séries · CoinGecko EUR`;

  const comparisonTruthResult = {
    comparison: true,
    entries: normalizedEntries,
    sourceMode: "comparison-base100"
  };
  const comparisonFreshness = atlasChartWorstFreshness(
    comparisonTruthResult,
    period
  );
  const comparisonOrigin = atlasChartSourceMode(comparisonTruthResult);

  const comparisonFingerprint =
    atlasComparisonResultFingerprint(
      normalizedEntries,
      period
    );

  const alreadyRendered =
    state.chartEngineV2.lastRenderedKey === chartKey
    && state.chartEngineV2.lastFingerprint
      === comparisonFingerprint
    && state.chartEngineV2.realChart
    && state.chartEngineV2.realChart.$atlasMode
      === "comparison";

  atlasSetChartShellState(
    canvas,
    "valid",
    summary,
    comparisonFreshness,
    comparisonOrigin
  );

  if (alreadyRendered) {
    return normalizedEntries;
  }

  atlasDestroyRealChart();

  state.chartEngineV2.lastRenderedKey =
    chartKey;
  state.chartEngineV2.lastFingerprint =
    comparisonFingerprint;

  if (window.Chart) {
    const ctx = canvas.getContext("2d");
    const gradientWidth = canvas.getBoundingClientRect().width || canvas.clientWidth || 980;
    const datasets = normalizedEntries.map((entry, index) => {
      const palette = atlasCryptoPalette(entry.coin, index);
      const stroke = atlasCryptoCanvasGradient(ctx, entry.coin, index, gradientWidth);
      return {
        label: `${entry.coin.symbol}`,
        atlasCoin: { id: entry.coin.id, symbol: entry.coin.symbol, name: entry.coin.name, image: entry.coin.image || "" },
        atlasPrimaryColor: palette.primary,
        atlasGradientCss: atlasCryptoGradientCss(entry.coin, index),
        data: entry.data,
        parsing: false,
        borderWidth: index === 0 ? 3.15 : 2.55,
        pointRadius(context) { return context.dataIndex === context.dataset.data.length - 1 ? 3.5 : 0; },
        pointHoverRadius: 5,
        pointHitRadius: 24,
        tension: 0.08,
        spanGaps: false,
        fill: false,
        borderColor: stroke,
        backgroundColor: palette.primary,
        pointBackgroundColor: palette.primary,
        pointBorderColor: "rgba(3,10,20,.92)",
        pointBorderWidth: 1.5,
        borderCapStyle: "round",
        borderJoinStyle: "round"
      };
    });
    state.chartEngineV2.realChart = new Chart(ctx, {
      type: "line",
      data: { datasets },
      plugins: [atlasChartMetadataPlugin, atlasVolumeOverlayPlugin, atlasOverlayAxesPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        normalized: false,
        parsing: false,
        interaction: { mode: "nearest", intersect: false, axis: "x" },
        layout: { padding: { top: 8, right: 4, bottom: 0, left: 4 } },
        plugins: {
          atlasChartMetadata: {
            mode: "comparison",
            view: "base100",
            scale: "linear",
            period,
            priceAxisId: "y",
            volumeAxisId: null,
            volumeVisible:
              state.chartViewV2.volume !== false,
            timeline,
            shadowSeries:
              normalizedEntries.map(
                (entry, index) => ({
                  rows: entry.data
                    .filter(Boolean)
                    .map(point => ({
                      x: point.x,
                      price: point.y,
                      y: 1
                    })),
                  color:
                    atlasCryptoPalette(
                      entry.coin,
                      index
                    ).primary,
                  opacity:
                    index === 0
                      ? 0.16
                      : Math.max(
                          0.065,
                          0.12 - index * 0.012
                        ),
                  heightRatio: 0.88
                })
              )
          },
          legend: {
            display: false,
            position: "top",
            align: "end",
            labels: {
              color: "rgba(236,248,255,0.90)",
              usePointStyle: false,
              boxWidth: 16,
              boxHeight: 2,
              padding: 10,
              font: { size: 10, weight: "800" },
              generateLabels(chart) {
                return chart.data.datasets.map((dataset, index) => ({
                  text: dataset.atlasCoin?.symbol || dataset.label || `S${index + 1}`,
                  strokeStyle: dataset.atlasPrimaryColor || "#62ecff",
                  fillStyle: dataset.atlasPrimaryColor || "#62ecff",
                  lineWidth: 3,
                  hidden: !chart.isDatasetVisible(index),
                  datasetIndex: index
                }));
              }
            }
          },
          tooltip: { enabled: false, external: atlasExternalChartTooltip }
        },
        scales: {
          x: {
            type: "linear",
            min: startTime,
            max: endTime,
            bounds: "data",
            offset: false,
            afterFit(scale) { scale.height = 0; },
            border: { display: false },
            grid: { color: "rgba(176,236,255,0.075)", drawTicks: false },
            ticks: {
              display: false,
              maxTicksLimit: atlasChartXAxisTickLimit(period),
              autoSkip: true,
              maxRotation: 0
            }
          },
          y: {
            position: "right",
            min: min - yPad,
            max: max + yPad,
            afterFit(scale) { scale.width = 0; },
            border: { display: false },
            grid: { color: "rgba(176,236,255,0.105)", drawTicks: false },
            ticks: { display: false, maxTicksLimit: 6 },
            title: { display: false }
          }
        }
      }
    });
    atlasRefreshChartScale(
      state.chartEngineV2.realChart
    );
    state.chartEngineV2.realChart.update("none");
    atlasRenderChartValueOverlay(normalizedEntries, { comparison: true, period });
    return normalizedEntries;
  }

  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(560, Math.floor(rect.width || canvas.clientWidth || 980));
  const height = Math.max(300, Math.floor(rect.height || canvas.clientHeight || 320));
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const left = 52, right = 100, top = 26, bottom = 42;
  const plotW = width - left - right, plotH = height - top - bottom;
  const xFor = time => left + ((time - startTime) / (endTime - startTime || 1)) * plotW;
  const yFor = value => top + plotH - ((value - (min - yPad)) / ((max + yPad) - (min - yPad) || 1)) * plotH;
  if (state.chartViewV2.volume !== false) {
    normalizedEntries.forEach((entry, index) => {
      const palette = atlasCryptoPalette(entry.coin, index);
      atlasDrawCurveFollowingShadowBars({
        ctx,
        rows: entry.data
          .filter(Boolean)
          .map(point => ({ x: point.x, price: point.y, y: 1 })),
        xFor,
        yForPrice: yFor,
        baseline: top + plotH,
        clipLeft: left,
        clipTop: top,
        clipRight: left + plotW,
        clipBottom: top + plotH,
        color: palette.primary,
        opacity: index === 0 ? 0.16 : Math.max(0.065, 0.12 - index * 0.012),
        heightRatio: 0.88,
        seriesIndex: index,
        seriesCount: normalizedEntries.length
      });
    });
  }

  normalizedEntries.forEach((entry, index) => {
    ctx.beginPath();
    entry.data.forEach((point, pointIndex) => {
      const x = xFor(point.x), y = yFor(point.y);
      if (pointIndex === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = atlasCryptoPalette(entry.coin, index).primary;
    ctx.lineWidth = index === 0 ? 2.8 : 2.2;
    ctx.stroke();
  });
  atlasRenderChartValueOverlay(normalizedEntries, { comparison: true, period });
  return normalizedEntries;
}

async function atlasMapComparisonWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const run = async () => {
    while (cursor < items.length) {
      const index = cursor++;
      try { results[index] = await worker(items[index], index); }
      catch (error) { results[index] = { error }; }
    }
  };
  const workers = Array.from({ length: Math.min(Math.max(1, limit), items.length) }, () => run());
  await Promise.all(workers);
  return results;
}

function atlasComparisonAbortError(error) {
  return error?.name === "AbortError";
}

function atlasComparisonRetryableError(error) {
  if (!error || atlasComparisonAbortError(error)) return false;
  const status = Number(error.status || 0);
  if (!status) return true;
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function atlasWaitWithSignal(ms, signal = null) {
  const delay = Math.max(0, Number(ms) || 0);
  if (!delay) return Promise.resolve();
  if (signal?.aborted) return Promise.reject(atlasChartAbortError());
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener?.("abort", onAbort);
      resolve();
    }, delay);
    const onAbort = () => {
      clearTimeout(timer);
      signal?.removeEventListener?.("abort", onAbort);
      reject(atlasChartAbortError());
    };
    signal?.addEventListener?.("abort", onAbort, { once: true });
  });
}

async function atlasRespectComparisonRequestSpacing(signal = null, period = Number(state.chartPeriodDays || 1)) {
  const comparison = state.dataBroker.comparison;
  const minimumSpacing = Number(period || 1) >= 60
    ? ATLAS_COMPARISON_LONG_HORIZON_SPACING_MS
    : ATLAS_COMPARISON_REQUEST_SPACING_MS;
  const elapsed = Date.now() - Number(comparison.lastDirectRequestAt || 0);
  const waitMs = Math.max(0, minimumSpacing - elapsed);
  if (waitMs) await atlasWaitWithSignal(waitMs, signal);
  comparison.lastDirectRequestAt = Date.now();
}

async function atlasFetchComparisonSeriesResilient(coin, period, options = {}) {
  const signal = options.signal || null;
  const stored = atlasGetStoredChartResult(coin, period);
  if (stored && !atlasChartNeedsRefresh(stored, period)) {
    return { coin, result: stored, attempts: 0, source: "fresh-cache" };
  }

  let lastError = null;
  for (let attempt = 0; attempt < ATLAS_COMPARISON_RETRY_DELAYS_MS.length; attempt += 1) {
    if (signal?.aborted) throw atlasChartAbortError();
    const retryDelay = ATLAS_COMPARISON_RETRY_DELAYS_MS[attempt];
    if (retryDelay) await atlasWaitWithSignal(retryDelay, signal);
    await atlasRespectComparisonRequestSpacing(signal, period);
    try {
      const result = await fetchCoinGeckoChartDirect(coin, period, {
        signal,
        timeoutMs: ATLAS_COMPARISON_DIRECT_TIMEOUT_MS
      });
      atlasStoreChartResult(coin, period, result);
      return { coin, result, attempts: attempt + 1, source: "direct" };
    } catch (error) {
      if (atlasComparisonAbortError(error)) throw error;
      lastError = error;
      if (!atlasComparisonRetryableError(error)) break;
    }
  }

  if (stored) {
    return {
      coin,
      result: {
        ...stored,
        sourceMode: "browser-cache",
        source: "Cache navigateur · série CoinGecko",
        blocked: false,
        refreshWarning: `Actualisation directe indisponible · cache exact du ${atlasExactTimestampLabel(stored?.integrity?.metrics?.lastTimestamp || stored?.generatedAt)}`,
        technicalReason: String(lastError?.message || lastError || "réseau indisponible")
      },
      attempts: ATLAS_COMPARISON_RETRY_DELAYS_MS.length,
      source: "stored-fallback"
    };
  }

  return {
    coin,
    result: {
      series: [],
      blocked: true,
      reason: "Historique CoinGecko direct temporairement indisponible après nouvelles tentatives.",
      technicalReason: String(lastError?.message || lastError || "réseau indisponible")
    },
    error: lastError || new Error("série indisponible"),
    attempts: ATLAS_COMPARISON_RETRY_DELAYS_MS.length,
    source: "blocked"
  };
}


/* Comparaison atomique : aucun complément ni retry silencieux. */

function atlasRenderComparisonDetail(entries, period) {
  const coins = entries.map(entry => entry.coin);
  const primary = getSelectedCoin() || coins[0];
  atlasBrokerSeedSpot(primary);
  const ranked = entries.map(entry => ({ coin: entry.coin, change: Number(entry.result?.integrity?.metrics?.changePct) })).filter(row => Number.isFinite(row.change)).sort((a, b) => b.change - a.change);
  if (els.assetDetailGrid) {
    els.assetDetailGrid.innerHTML = `
      <div><b>Mode</b><span>Comparaison normalisée</span></div>
      <div><b>Actif principal</b><span>${escapeHtml(primary?.name || "—")} (${escapeHtml(primary?.symbol || "—")})</span></div>
      <div><b>Actifs comparés</b><span>${escapeHtml(coins.map(coin => coin.symbol).join(" / "))}</span></div>
      <div><b>Période</b><span>${escapeHtml(atlasChartPeriodLabel(period))}</span></div>
      <div><b>Meilleure trajectoire</b><span>${ranked[0] ? `${escapeHtml(ranked[0].coin.symbol)} · ${fmtPct(ranked[0].change)}` : "—"}</span></div>
      <div><b>Trajectoire la plus faible</b><span>${ranked.at(-1) ? `${escapeHtml(ranked.at(-1).coin.symbol)} · ${fmtPct(ranked.at(-1).change)}` : "—"}</span></div>
      <div><b>Source</b><span>CoinGecko market_chart EUR</span></div>
      <div><b>Échelle</b><span>Chaque actif commence à 100</span></div>
      <div><b>Prix absolus</b><span>Visibles dans les infobulles</span></div>
      <div><b>Décision</b><span>Observation comparative uniquement</span></div>`;
  }
  atlasSetCompactReading(`Lecture : comparaison normalisée de ${coins.map(coin => coin.symbol).join(", ")} sur ${atlasChartPeriodLabel(period)}.`);
  atlasRenderBrokerStrip();
}

async function renderComparisonAnalystPanel(options = {}) {
  const coins = atlasComparisonCoins();
  if (coins.length < 2) {
    state.dataBroker.comparison.mode = "single";
    return renderAnalystPanel({ ...options, forceSingle: true });
  }

  atlasClearChartRetryTimer();
  atlasClearComparisonCompletionTimer();

  const renderToken = ++state.comparisonRenderToken;
  if (state.chartEngineV2?.controller) {
    try { state.chartEngineV2.controller.abort(); } catch {}
  }

  const controller = new AbortController();
  state.chartEngineV2.controller = controller;
  state.chartEngineV2.loading = true;

  const period = Number(state.chartPeriodDays || 1);
  const periodLabel = atlasChartPeriodLabel(period);
  const ids = coins.map(coin => coin.id);
  const chartKey = `comparison:${ids.join(",")}:${period}`;
  const previousChartState = state.dataBroker.chart;
  const previousRenderedIds = [...(state.dataBroker.comparison.renderedIds || [])];

  state.dataBroker.comparison.status = "loading";
  state.dataBroker.comparison.pendingIds = [];
  state.dataBroker.comparison.unavailableIds = [];
  state.dataBroker.comparison.results = {};
  state.dataBroker.comparison.renderedIds = previousRenderedIds;
  state.dataBroker.comparison.error = null;
  state.dataBroker.comparison.completionAttempt = 0;
  state.dataBroker.comparison.completionKey = null;

  state.dataBroker.chart = {
    status: "loading",
    coinId: state.selectedCoinId,
    period,
    source: ATLAS_CANONICAL_MARKET_SOURCE,
    mode: "comparison-base100",
    timestamp: null,
    pointCount: 0,
    contextKey: chartKey,
    result: null,
    error: null
  };

  atlasChartSetPeriodButtons(period, true);
  setText(els.selectedAssetTitle, `Comparaison ${coins.map(coin => coin.symbol).join(" + ")}`);

  const preservedChart = drawChartLoading(
    els.mainChart,
    `Comparaison ${periodLabel} · 0/${coins.length}`,
    "Le graphe précédent reste visible jusqu’à disposer d’au moins deux courbes cohérentes."
  );

  if (!preservedChart && els.chartCaption) {
    atlasSetChartCaptionText(
      `Comparaison ${periodLabel} en préparation atomique · aucune courbe partielle ne remplacera le graphe.`
    );
  }
  atlasRenderComparisonControls();

  const fetched = [];
  for (let index = 0; index < coins.length; index += 1) {
    if (renderToken !== state.comparisonRenderToken || controller.signal.aborted || !atlasComparisonActive()) return;
    const coin = coins[index];

    if (preservedChart) {
      atlasUpdateChartRefresh(`Série ${index + 1}/${coins.length} · ${coin.symbol}`);
    } else if (els.chartCaption) {
      atlasSetChartCaptionText(
        `Comparaison ${periodLabel} · lecture ${index + 1}/${coins.length} · ${coin.symbol}.`
      );
    }

    try {
      fetched.push(await atlasFetchComparisonSeriesResilient(coin, period, { signal: controller.signal }));
    } catch (error) {
      if (atlasComparisonAbortError(error)) return;
      fetched.push({
        coin,
        result: { series: [], blocked: true, reason: String(error?.message || error) },
        error
      });
    }
  }

  if (renderToken !== state.comparisonRenderToken || controller.signal.aborted || !atlasComparisonActive()) return;

  const rawEntries = fetched.filter(item =>
    item?.coin
    && item?.result
    && !item.result.blocked
    && Array.isArray(item.result.series)
    && item.result.series.length
  );

  const normalizedEntries = atlasBuildAlignedComparisonEntries(rawEntries, period);
  const normalizedIds = new Set(normalizedEntries.map(entry => entry.coin.id));
  const networkFailures = fetched.filter(item => item?.error || item?.result?.blocked);
  const alignmentFailures = rawEntries.filter(entry => !normalizedIds.has(entry.coin.id));
  const unavailableIds = [...new Set([
    ...networkFailures.map(item => item?.coin?.id),
    ...alignmentFailures.map(item => item?.coin?.id)
  ].filter(Boolean))];

  state.dataBroker.comparison.results = Object.fromEntries(
    normalizedEntries.map(entry => [entry.coin.id, entry.result])
  );
  state.dataBroker.comparison.pendingIds = [];
  state.dataBroker.comparison.unavailableIds = unavailableIds;
  state.dataBroker.comparison.error = null;

  if (normalizedEntries.length >= 2) {
    const drawnEntries = drawComparisonChart(els.mainChart, normalizedEntries, period, chartKey);

    if (drawnEntries.length >= 2) {
      const drawnIds = new Set(drawnEntries.map(entry => entry.coin.id));
      const finalUnavailableIds = [...new Set([
        ...unavailableIds,
        ...normalizedEntries.filter(entry => !drawnIds.has(entry.coin.id)).map(entry => entry.coin.id)
      ])];

      state.dataBroker.comparison.renderedIds = drawnEntries.map(entry => entry.coin.id);
      state.dataBroker.comparison.unavailableIds = finalUnavailableIds;
      state.dataBroker.comparison.results = Object.fromEntries(
        drawnEntries.map(entry => [entry.coin.id, entry.result])
      );
      state.dataBroker.comparison.status = finalUnavailableIds.length ? "partial" : "ready";

      const latestTimestamp = Math.max(...drawnEntries.map(entry =>
        Number(entry.result?.integrity?.metrics?.lastTimestamp || 0)
      ));
      const pointCount = drawnEntries.reduce(
        (sum, entry) => sum + Number(entry.result?.series?.length || 0),
        0
      );
      const comparisonResult = {
        comparison: true,
        entries: drawnEntries,
        periodDays: period,
        sourceMode: "comparison-base100",
        source: "CoinGecko market_chart EUR · Base 100"
      };
      const retryCount = fetched.reduce(
        (sum, item) => sum + Math.max(0, Number(item?.attempts || 0) - 1),
        0
      );

      state.dataBroker.chart = {
        status: "ready",
        coinId: state.selectedCoinId,
        period,
        source: ATLAS_CANONICAL_MARKET_SOURCE,
        mode: "comparison-base100",
        timestamp: Number.isFinite(latestTimestamp) && latestTimestamp > 0
          ? new Date(latestTimestamp).toISOString()
          : null,
        pointCount,
        latencyMs: null,
        retryCount,
        contextKey: chartKey,
        result: comparisonResult,
        error: finalUnavailableIds.length
          ? `${finalUnavailableIds.length} série(s) non affichable(s)`
          : null
      };

      setText(
        els.selectedAssetTitle,
        `Comparaison ${drawnEntries.map(entry => entry.coin.symbol).join(" + ")}`
      );
      atlasRenderComparisonDetail(drawnEntries, period);
      atlasChartV2RenderLegend(drawnEntries, { comparison: true });
      atlasRenderComparisonCaption(drawnEntries, period, finalUnavailableIds, coins.length);
      atlasChartV2SyncControls();
      atlasTrackAudience("chart_comparison_loaded", {
        assets: drawnEntries.map(entry => entry.coin.id),
        days: period,
        displayed: drawnEntries.length,
        unavailable: finalUnavailableIds.length
      });
    } else {
      state.dataBroker.comparison.renderedIds = previousRenderedIds;
      state.dataBroker.comparison.status = "blocked";
    }
  } else {
    state.dataBroker.comparison.renderedIds = previousRenderedIds;
    state.dataBroker.comparison.status = "blocked";
  }

  if (state.dataBroker.comparison.status === "blocked") {
    state.dataBroker.comparison.error = "moins de deux courbes cohérentes";
    if (previousChartState?.status === "ready") {
      state.dataBroker.chart = previousChartState;
      atlasUpdateChartRefresh("Nouvelle comparaison refusée · graphe précédent conservé");
      window.setTimeout(atlasHideChartRefresh, 3400);
      if (els.chartCaption) {
        atlasSetChartCaptionText(
          `Comparaison ${periodLabel} non remplacée : ${normalizedEntries.length}/${coins.length} courbe${normalizedEntries.length > 1 ? "s" : ""} cohérente${normalizedEntries.length > 1 ? "s" : ""}. Le graphe précédent reste affiché.`
        );
      }
    } else {
      state.dataBroker.chart = {
        status: "blocked",
        coinId: state.selectedCoinId,
        period,
        source: ATLAS_CANONICAL_MARKET_SOURCE,
        mode: "comparison-base100",
        timestamp: null,
        pointCount: 0,
        contextKey: chartKey,
        result: null,
        error: "moins de deux courbes cohérentes"
      };
      state.dataBroker.comparison.renderedIds = [];
      drawChartBlocked(els.mainChart);
      if (els.chartCaption) {
        atlasSetChartCaptionText(
          `Comparaison ${periodLabel} indisponible : moins de deux séries réelles cohérentes. Aucune courbe unique n’est présentée comme comparaison.`
        );
      }
    }
  }

  atlasRenderComparisonControls();
  atlasChartSetPeriodButtons(period, false);
  state.chartEngineV2.loading = false;
  atlasRenderBrokerStrip();
  renderMultiHorizon();
}

function atlasNormalizeSparkline(values) {
  if (!Array.isArray(values)) return [];
  return values.map(Number).filter(value => Number.isFinite(value) && value > 0);
}

function sparkSvg(c) {
  const data = atlasNormalizeSparkline(c?.sparkline7d);
  if (data.length < 10) return '<span class="sparkline-empty" aria-label="Sparkline réelle CoinGecko indisponible">—</span>';
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
  if (!coin) return null;
  const directQuote = atlasBrokerQuoteFor(coin.id);
  if (directQuote) {
    return {
      status: "direct",
      coinId: coin.id,
      source: ATLAS_CANONICAL_MARKET_SOURCE,
      mode: "direct",
      eur: Number(directQuote.eur),
      usd: atlasHasPositiveQuote(directQuote.usd) ? Number(directQuote.usd) : null,
      timestamp: directQuote.timestamp || state.dataBroker.spotBook?.timestamp || null,
      error: null
    };
  }
  const spot = state.dataBroker.spot;
  if (spot?.coinId !== coin.id || !["direct", "snapshot"].includes(spot?.status)) return null;
  return spot;
}

function atlasCurrentDetailChartResult() {
  const chart = state.dataBroker.chart;
  if (chart?.coinId !== state.selectedCoinId || chart?.period !== Number(state.chartPeriodDays || 1) || !atlasChartContextMatches(chart)) return null;
  return chart?.result || null;
}


function atlasSourceDockSafeUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  try {
    const url = new URL(raw, window.location.href);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.href;
  } catch {
    return null;
  }
}

function atlasSourceDockUniqueUrls(values = []) {
  const safe = [];
  const seen = new Set();
  for (const value of values.flat(Infinity)) {
    const url = atlasSourceDockSafeUrl(value);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    safe.push(url);
  }
  return safe;
}


function atlasSourceDockUrlKey(value) {
  const safe = atlasSourceDockSafeUrl(value);
  if (!safe) return null;
  try {
    const url = new URL(safe);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    return `${url.protocol}//${url.hostname.toLowerCase()}${pathname}${url.search}`;
  } catch {
    return null;
  }
}

function atlasSourceDockDistinctPortals(record = null) {
  const used = new Set();
  const take = value => {
    const safe = atlasSourceDockSafeUrl(value);
    const key = atlasSourceDockUrlKey(safe);
    if (!safe || !key || used.has(key)) return null;
    used.add(key);
    return safe;
  };
  return {
    homepage: take(record?.homepage),
    explorer: take(record?.explorer),
    whitepaper: take(record?.whitepaper),
    repository: take(record?.repository),
    community: take(record?.community)
  };
}

function atlasSourceDockRetryDelay(failureCount = 1) {
  const index = Math.min(
    ATLAS_SOURCE_DOCK_RETRY_STEPS_MS.length - 1,
    Math.max(0, Number(failureCount || 1) - 1)
  );
  return ATLAS_SOURCE_DOCK_RETRY_STEPS_MS[index];
}

function atlasSourceDockRetryRemaining(coinId) {
  const due = Number(state.sourceDock.nextRetryAt?.[coinId] || 0);
  return Math.max(0, due - Date.now());
}

function atlasSourceDockRetryLabel(ms) {
  const value = Math.max(0, Number(ms) || 0);
  if (value < 1_000) return "maintenant";
  if (value < 60_000) return `${Math.max(1, Math.ceil(value / 1_000))} s`;
  return `${Math.max(1, Math.ceil(value / 60_000))} min`;
}

function atlasSourceDockErrorLabel(error) {
  const text = String(error || "").toLowerCase();
  if (!text) return "Métadonnées indisponibles";
  if (text.includes("429")) return "Quota CoinGecko atteint";
  if (text.includes("403")) return "Accès CoinGecko refusé";
  if (text.includes("500") || text.includes("502") || text.includes("503") || text.includes("504")) {
    return "CoinGecko temporairement indisponible";
  }
  if (text.includes("networkerror") || text.includes("failed to fetch") || text.includes("network request failed")) {
    return "Réseau indisponible";
  }
  if (text.includes("timeout") || text.includes("timed out") || text.includes("abort")) {
    return "Délai dépassé";
  }
  if (text.includes("incohérente") || text.includes("invalid")) return "Réponse CoinGecko invalide";
  return "Métadonnées indisponibles";
}

function atlasSourceDockResetFailure(coinId) {
  if (!coinId) return;
  delete state.sourceDock.failures[coinId];
  delete state.sourceDock.nextRetryAt[coinId];
  delete state.sourceDock.lastAttemptAt[coinId];
}

function atlasSourceDockRegisterFailure(coinId) {
  const failures = Math.max(0, Number(state.sourceDock.failures?.[coinId] || 0)) + 1;
  const delay = atlasSourceDockRetryDelay(failures);
  state.sourceDock.failures[coinId] = failures;
  state.sourceDock.nextRetryAt[coinId] = Date.now() + delay;
  return delay;
}

function atlasSourceDockClearRetryTimer() {
  if (state.sourceDock.retryTimer) {
    clearTimeout(state.sourceDock.retryTimer);
    state.sourceDock.retryTimer = null;
  }
}

function atlasSourceDockScheduleRetry(coin) {
  atlasSourceDockClearRetryTimer();
  if (!coin?.id || state.sourceDock.activeCoinId !== coin.id) return;
  const remaining = atlasSourceDockRetryRemaining(coin.id);
  if (remaining <= 0) return;

  state.sourceDock.retryTimer = setTimeout(() => {
    state.sourceDock.retryTimer = null;
    if (state.sourceDock.activeCoinId !== coin.id) return;
    if (document.hidden) {
      state.sourceDock.nextRetryAt[coin.id] = Date.now() + 60_000;
      atlasSourceDockScheduleRetry(coin);
      return;
    }
    const active = state.coins.find(item => item.id === coin.id);
    if (active) void atlasLoadSourceDockMetadata(active, { retry: true });
  }, Math.max(1_000, remaining));
}

function atlasSourceDockLoadCache() {
  if (state.sourceDock.cacheLoaded) return;
  state.sourceDock.cacheLoaded = true;
  try {
    const parsed = JSON.parse(localStorage.getItem(ATLAS_SOURCE_DOCK_CACHE_KEY) || "{}");
    const records = parsed?.records && typeof parsed.records === "object" ? parsed.records : {};
    const now = Date.now();
    Object.entries(records).forEach(([coinId, record]) => {
      const fetchedAt = Date.parse(record?.fetchedAt || 0);
      if (!coinId || !Number.isFinite(fetchedAt) || now - fetchedAt > ATLAS_SOURCE_DOCK_STALE_MAX_MS) return;
      state.sourceDock.records[coinId] = record;
    });
  } catch {}
}

function atlasSourceDockSaveCache() {
  try {
    const records = Object.values(state.sourceDock.records || {})
      .filter(record => record?.coinId && record?.fetchedAt)
      .sort((a, b) => Date.parse(b.fetchedAt || 0) - Date.parse(a.fetchedAt || 0))
      .slice(0, ATLAS_SOURCE_DOCK_MAX_RECORDS);
    localStorage.setItem(
      ATLAS_SOURCE_DOCK_CACHE_KEY,
      JSON.stringify({
        schema: "agent_crypto_source_dock_v2",
        version: ATLAS_RELEASE,
        savedAt: new Date().toISOString(),
        records: Object.fromEntries(records.map(record => [record.coinId, record]))
      })
    );
  } catch {}
}

function atlasSourceDockNormalizeMetadata(payload, coin) {
  const links = payload?.links || {};
  const homepages = atlasSourceDockUniqueUrls(links.homepage || []);
  const explorers = atlasSourceDockUniqueUrls(links.blockchain_site || []);
  const whitepapers = atlasSourceDockUniqueUrls([links.whitepaper, links.whitepaper_link]);
  const repositories = atlasSourceDockUniqueUrls([
    ...(links?.repos_url?.github || []),
    ...(links?.repos_url?.bitbucket || [])
  ]);
  const community = atlasSourceDockUniqueUrls([
    ...(links.official_forum_url || []),
    ...(links.announcement_url || []),
    ...(links.chat_url || []),
    links.subreddit_url
  ]);
  return {
    coinId: String(payload?.id || coin?.id || ""),
    webSlug: String(payload?.web_slug || payload?.id || coin?.id || ""),
    name: String(payload?.name || coin?.name || ""),
    symbol: String(payload?.symbol || coin?.symbol || "").toUpperCase(),
    homepage: homepages[0] || null,
    explorer: explorers[0] || null,
    whitepaper: whitepapers[0] || null,
    repository: repositories[0] || null,
    community: community[0] || null,
    categories: Array.isArray(payload?.categories) ? payload.categories.filter(Boolean).slice(0, 4) : [],
    genesisDate: payload?.genesis_date || null,
    lastUpdated: payload?.last_updated || null,
    fetchedAt: new Date().toISOString(),
    source: "CoinGecko /coins/{id}"
  };
}

function atlasSourceDockRecordAge(record) {
  const time = Date.parse(record?.fetchedAt || 0);
  return Number.isFinite(time) ? Math.max(0, Date.now() - time) : Infinity;
}

function atlasSourceDockCoinGeckoUrl(coin, record = null) {
  const slug = String(record?.webSlug || coin?.id || "").trim();
  if (!slug) return null;
  return atlasSourceDockSafeUrl(`https://www.coingecko.com/en/coins/${encodeURIComponent(slug)}`);
}

function atlasSourceDockNewsUrl(coin) {
  if (!coin) return null;
  const query = `${coin.name || ""} ${coin.symbol || ""} crypto`.trim();
  return atlasSourceDockSafeUrl(`https://news.google.com/search?q=${encodeURIComponent(query)}&hl=fr&gl=FR&ceid=FR%3Afr`);
}

function atlasSourceDockPortal(kind, label, url, note = "", unavailableLabel = "Indisponible") {
  const safeUrl = atlasSourceDockSafeUrl(url);
  if (!safeUrl) {
    return `<span class="source-portal is-disabled" data-portal-kind="${escapeHtml(kind)}"><b>${escapeHtml(label)}</b><small>${escapeHtml(unavailableLabel)}</small></span>`;
  }
  return `<a class="source-portal" data-portal-kind="${escapeHtml(kind)}" href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer nofollow"><b>${escapeHtml(label)}</b><small>${escapeHtml(note || new URL(safeUrl).hostname.replace(/^www\./, ""))}</small></a>`;
}

function atlasRenderSourceDock(coin, record = null, mode = "idle", error = "") {
  if (!els.sourceDock) return;
  const palette = coin ? atlasCryptoPalette(coin, Math.max(0, Number(coin.rank || 1) - 1)) : null;
  if (palette) {
    els.sourceDock.style.setProperty("--source-dock-color", palette.primary);
    els.sourceDock.style.setProperty("--source-dock-gradient", atlasCryptoGradientCss(coin, Math.max(0, Number(coin.rank || 1) - 1)));
  } else {
    els.sourceDock.style.removeProperty("--source-dock-color");
    els.sourceDock.style.removeProperty("--source-dock-gradient");
  }

  if (!coin) {
    atlasSourceDockClearRetryTimer();
    setText(els.sourceDockAsset, "Aucun actif sélectionné");
    setText(els.sourceDockCompactState, "En attente");
    setText(els.sourceDockStatus, "En attente de sélection");
    setText(els.sourceDockOrigin, "CoinGecko · en attente");
    setText(els.sourceDockUpdated, "—");
    setHTML(els.sourceDockPortals, [
      atlasSourceDockPortal("coingecko", "CoinGecko", null),
      atlasSourceDockPortal("homepage", "Site officiel", null),
      atlasSourceDockPortal("explorer", "Explorateur", null),
      atlasSourceDockPortal("whitepaper", "Whitepaper", null),
      atlasSourceDockPortal("repository", "Code source", null),
      atlasSourceDockPortal("community", "Communauté", null)
    ].join(""));
    els.sourceDock.dataset.status = "idle";
    return;
  }

  const distinct = atlasSourceDockDistinctPortals(record);
  const coingeckoUrl = atlasSourceDockCoinGeckoUrl(coin, record);
  const newsUrl = atlasSourceDockNewsUrl(coin);
  const portals = [
    atlasSourceDockPortal("coingecko", "CoinGecko", coingeckoUrl, "fiche marché"),
    atlasSourceDockPortal("homepage", "Site officiel", distinct.homepage, "déclaré"),
    atlasSourceDockPortal("explorer", "Explorateur", distinct.explorer, "blockchain"),
    atlasSourceDockPortal("whitepaper", "Whitepaper", distinct.whitepaper, "document"),
    atlasSourceDockPortal("repository", "Code source", distinct.repository, "dépôt"),
    atlasSourceDockPortal("community", "Communauté", distinct.community, "officiel / forum"),
    atlasSourceDockPortal("news", "Actualités", newsUrl, "recherche ciblée"),
    `<a class="source-portal source-portal-internal" data-portal-kind="sentinel" href="#news-sentinel"><b>News Sentinel</b><small>veille @erith.IA</small></a>`
  ];

  const availablePortals = [
    coingeckoUrl,
    distinct.homepage,
    distinct.explorer,
    distinct.whitepaper,
    distinct.repository,
    distinct.community,
    newsUrl,
    "#news-sentinel"
  ].filter(Boolean).length;

  const age = atlasSourceDockRecordAge(record);
  const ageLabel = Number.isFinite(age)
    ? age < 60_000 ? "à l’instant"
      : age < 3_600_000 ? `${Math.max(1, Math.round(age / 60_000))} min`
      : age < 86_400_000 ? `${Math.max(1, Math.round(age / 3_600_000))} h`
      : `${Math.max(1, Math.round(age / 86_400_000))} j`
    : "—";

  const retryRemaining = atlasSourceDockRetryRemaining(coin.id);
  const errorLabel = atlasSourceDockErrorLabel(error || state.sourceDock.lastError);
  const statusText = mode === "direct"
    ? `Direct · ${availablePortals}/8 portails`
    : mode === "cache"
      ? retryRemaining > 0
        ? `Cache ${ageLabel} · ${errorLabel} · nouvel essai ${atlasSourceDockRetryLabel(retryRemaining)}`
        : `Cache local ${ageLabel} · ${availablePortals}/8 portails`
      : mode === "stale"
        ? `Cache ${ageLabel} visible · actualisation en cours`
        : mode === "loading"
          ? "Lecture CoinGecko en cours"
          : retryRemaining > 0
            ? `${errorLabel} · nouvel essai ${atlasSourceDockRetryLabel(retryRemaining)}`
            : `${errorLabel} · actualisation manuelle disponible`;

  setText(els.sourceDockAsset, `${coin.name} · ${String(coin.symbol || "").toUpperCase()}`);
  setText(
    els.sourceDockCompactState,
    mode === "direct" ? `${availablePortals}/8 · direct`
      : record ? `${availablePortals}/8 · cache`
      : mode === "loading" || mode === "stale" ? "Chargement"
      : `${availablePortals}/8 · limité`
  );
  setText(els.sourceDockStatus, statusText);
  setText(
    els.sourceDockOrigin,
    mode === "direct" ? "CoinGecko direct · métadonnées"
      : record ? "CoinGecko · cache navigateur"
      : "CoinGecko · fiche marché uniquement"
  );
  setText(
    els.sourceDockUpdated,
    record?.fetchedAt ? new Date(record.fetchedAt).toLocaleString("fr-FR") : "En attente"
  );
  setHTML(els.sourceDockPortals, portals.join(""));
  els.sourceDock.dataset.status = mode;
  els.sourceDock.dataset.coinId = coin.id;
  els.sourceDock.dataset.portalCount = String(availablePortals);
}


async function atlasLoadSourceDockMetadata(coin, options = {}) {
  if (!coin?.id) return false;
  atlasSourceDockLoadCache();

  const coinId = coin.id;
  const current = state.sourceDock.records[coinId] || null;
  const age = atlasSourceDockRecordAge(current);
  const now = Date.now();
  const remaining = atlasSourceDockRetryRemaining(coinId);
  const lastAttempt = Number(state.sourceDock.lastAttemptAt?.[coinId] || 0);

  if (!options.force && current && age < ATLAS_SOURCE_DOCK_CACHE_TTL_MS) {
    state.sourceDock.activeCoinId = coinId;
    state.sourceDock.status = "cache";
    atlasRenderSourceDock(coin, current, "cache");
    return true;
  }

  if (!options.force && remaining > 0 && !options.retry) {
    state.sourceDock.activeCoinId = coinId;
    state.sourceDock.status = current ? "cache" : "cooldown";
    atlasRenderSourceDock(coin, current, current ? "cache" : "cooldown", state.sourceDock.lastError);
    atlasSourceDockScheduleRetry(coin);
    return false;
  }

  if (!options.force && now - lastAttempt < ATLAS_SOURCE_DOCK_MIN_ATTEMPT_GAP_MS) {
    state.sourceDock.activeCoinId = coinId;
    atlasRenderSourceDock(coin, current, current ? "cache" : "cooldown", state.sourceDock.lastError);
    return false;
  }

  if (state.sourceDock.controller) {
    try { state.sourceDock.controller.abort(); } catch {}
  }
  atlasSourceDockClearRetryTimer();

  const controller = new AbortController();
  const token = ++state.sourceDock.token;
  state.sourceDock.controller = controller;
  state.sourceDock.activeCoinId = coinId;
  state.sourceDock.status = "loading";
  state.sourceDock.lastAttemptAt[coinId] = now;
  state.sourceDock.lastError = null;
  atlasRenderSourceDock(coin, current, current ? "stale" : "loading");

  const endpoint = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(coinId)}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`;
  try {
    const payload = await fetchWithTimeout(
      endpoint,
      { signal: controller.signal, networkKind: "source", networkWaitMs: 60_000 },
      12000
    );
    if (!payload?.id || String(payload.id) !== String(coinId)) throw new Error("Réponse CoinGecko incohérente");
    if (token !== state.sourceDock.token) return false;

    const record = atlasSourceDockNormalizeMetadata(payload, coin);
    state.sourceDock.records[coinId] = record;
    state.sourceDock.status = "direct";
    state.sourceDock.lastError = null;
    atlasSourceDockResetFailure(coinId);
    atlasSourceDockSaveCache();
    if (state.sourceDock.activeCoinId === coinId) atlasRenderSourceDock(coin, record, "direct");
    return true;
  } catch (error) {
    if (controller.signal.aborted || token !== state.sourceDock.token) return false;

    state.sourceDock.status = current ? "cache" : "cooldown";
    state.sourceDock.lastError = atlasSourceDockErrorLabel(cleanError(error));
    const delay = atlasSourceDockRegisterFailure(coinId);

    if (state.sourceDock.activeCoinId === coinId) {
      atlasRenderSourceDock(
        coin,
        current,
        current ? "cache" : "cooldown",
        state.sourceDock.lastError
      );
      atlasSourceDockScheduleRetry(coin);
    }
    return false;
  } finally {
    if (token === state.sourceDock.token) state.sourceDock.controller = null;
  }
}

function atlasEnsureSourceDock(coin, options = {}) {
  atlasSourceDockLoadCache();
  if (!coin?.id) {
    state.sourceDock.activeCoinId = null;
    atlasSourceDockClearRetryTimer();
    atlasRenderSourceDock(null);
    return;
  }

  const selectionChanged = state.sourceDock.activeCoinId !== coin.id;
  if (selectionChanged) {
    atlasSourceDockClearRetryTimer();
    if (state.sourceDock.controller) {
      try { state.sourceDock.controller.abort(); } catch {}
      state.sourceDock.controller = null;
    }
  }

  state.sourceDock.activeCoinId = coin.id;
  const record = state.sourceDock.records[coin.id] || null;
  const age = atlasSourceDockRecordAge(record);
  const fresh = !!record && age < ATLAS_SOURCE_DOCK_CACHE_TTL_MS;
  const retryRemaining = atlasSourceDockRetryRemaining(coin.id);
  const alreadyLoading = state.sourceDock.status === "loading"
    && state.sourceDock.controller
    && state.sourceDock.activeCoinId === coin.id;

  const mode = fresh ? "cache"
    : alreadyLoading ? (record ? "stale" : "loading")
    : retryRemaining > 0 ? (record ? "cache" : "cooldown")
    : record ? "stale"
    : "loading";

  atlasRenderSourceDock(coin, record, mode, state.sourceDock.lastError);

  const dockOpen = !!els.sourceDock?.open;
  if (!options.force && !dockOpen) {
    atlasSourceDockClearRetryTimer();
    return;
  }

  if (retryRemaining > 0 && !options.force) {
    atlasSourceDockScheduleRetry(coin);
    return;
  }

  if (options.force || (!fresh && !alreadyLoading)) {
    void atlasLoadSourceDockMetadata(coin, { force: !!options.force });
  }
}



function atlasRefreshSelectedDetailOnly() {
  const coin = getSelectedCoin();
  if (!coin) return;
  const chart = state.dataBroker.chart;
  const mode = chart?.coinId === coin.id && chart?.period === Number(state.chartPeriodDays || 1) && atlasChartContextMatches(chart)
    ? chart.status === "ready" ? "valid" : chart.status === "blocked" ? "blocked" : "loading"
    : "loading";
  atlasRenderAssetDetail(coin, Number(state.chartPeriodDays || 1), atlasCurrentDetailChartResult(), mode);
}


function atlasRenderCompactDetailSummary(coin = null) {
  if (!coin) {
    setText(els.detailCompactAsset, "Aucune sélection");
    setText(els.detailCompactPrice, "—");
    setText(els.detailCompactDecision, "Choisir un actif");
    setText(els.detailCompactChange, "—");
    els.detailCompactChange?.classList.remove("pos", "neg", "neutral");
    return;
  }

  const price = Number(coin.priceEur ?? coin.price);
  const change = Number(coin.change24h);
  setText(els.detailCompactAsset, String(coin.symbol || coin.name || "ACTIF").toUpperCase());
  setText(els.detailCompactPrice, Number.isFinite(price) ? atlasFormatEUR(price) : "—");
  setText(els.detailCompactDecision, beginnerDecision(coin));
  setText(els.detailCompactChange, Number.isFinite(change) ? fmtPct(change) : "—");
  if (els.detailCompactChange) {
    els.detailCompactChange.classList.remove("pos", "neg", "neutral");
    els.detailCompactChange.classList.add(clsPct(Number.isFinite(change) ? change : null));
  }
}

function atlasRenderAssetDetail(c, period, result = null, mode = "loading") {
  atlasRenderCompactDetailSummary(c);
  const periodLabel = atlasChartPeriodLabel(period);
  const ratio = c?.volume24h && c?.marketCap ? `${((c.volume24h / c.marketCap) * 100).toFixed(2)} %` : "Donnée manquante";
  const integrity = result?.integrity;
  const metrics = integrity?.metrics || {};
  const freshness = metrics.freshness || {};
  const spot = atlasSelectedSpotFor(c);
  const spotEur = Number.isFinite(Number(spot?.eur)) ? Number(spot.eur) : Number(c?.priceEur ?? c?.price);
  const spotUsd = Number.isFinite(Number(spot?.usd)) ? Number(spot.usd) : null;
  const spotMode = `Snapshot marché · ${atlasBrokerModeLabel(spot?.mode || state.dataBroker.market?.mode)}`;
  const spotTime = spot?.timestamp || c?.lastUpdated || c?.timestamp || state.timestamp || null;
  const chartSourceMode = result?.sourceMode === "browser-cache" ? "Historique navigateur CoinGecko" : result?.sourceMode === "coingecko-direct" ? "CoinGecko direct" : "En attente";
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
      <div><b>Variation de la série ${periodLabel}</b><span>${Number.isFinite(metrics.changePct) ? fmtPct(metrics.changePct) : "—"}</span></div>
      <div><b>Variation marché 24 h</b><span>${Number.isFinite(Number(c?.change24h)) ? fmtPct(Number(c.change24h)) : "—"}</span></div>
      <div><b>Source graphique</b><span>${escapeHtml(chartSourceMode)}</span></div>
      <div><b>Points / couverture</b><span>${Number.isFinite(metrics.pointCount) ? metrics.pointCount : "—"} · ${coverage}</span></div>
      <div><b>Dernier point</b><span>${lastPoint} · ${lastTime}</span></div>
      <div><b>Actualisation graphique</b><span>${freshness.label || "—"}</span></div>
      <div><b>Écart spot/courbe</b><span>${gap}</span></div>
      <div><b>Intégrité graphique</b><span>${integrityLabel}</span></div>`;
  }
  atlasSetCompactReading(atlasCompactAssetReading(c));
  atlasRenderBrokerStrip();
  atlasEnsureSourceDock(c);
}

function atlasSetCompactReading(text) {
  if (!els.assetDetailWhy) return;
  const value = String(text || "");
  const prefix = "Lecture :";
  if (value.startsWith(prefix)) {
    els.assetDetailWhy.innerHTML = `<strong>${prefix}</strong>${escapeHtml(value.slice(prefix.length))}`;
    return;
  }
  els.assetDetailWhy.textContent = value;
}

function atlasCompactAssetReading(c) {
  if (!c) return "Lecture : aucune crypto sélectionnée.";
  const symbol = String(c.symbol || c.name || "ACTIF").toUpperCase();
  const h24 = Number(c.change24h);
  const d7 = Number(c.change7d);
  const day = !Number.isFinite(h24) ? "n’a pas de variation 24 h disponible" : h24 < -0.05 ? "recule sur 24 h" : h24 > 0.05 ? "progresse sur 24 h" : "reste stable sur 24 h";
  const week = !Number.isFinite(d7) ? "la lecture 7 jours est indisponible" : d7 > 0.05 ? "reste positif sur 7 jours" : d7 < -0.05 ? "reste négatif sur 7 jours" : "reste stable sur 7 jours";
  return `Lecture : ${symbol} ${day}, ${week}.`;
}

function atlasRenderChartResult(c, period, result, chartKey, forceRedraw = false) {
  atlasBrokerCommitChart(c, period, result, "ready");
  const periodLabel = atlasChartPeriodLabel(period);
  const fingerprint = atlasChartResultFingerprint(result);
  const viewFingerprint = `${fingerprint}:${atlasChartV2EffectiveView()}:${atlasChartV2EffectiveScale()}:${state.chartViewV2.volume}:${atlasChartV2ComparisonMode()?state.chartViewV2.comparisonLegend:state.chartViewV2.legend}`;
  const alreadyRendered = state.chartEngineV2.lastRenderedKey === chartKey && state.chartEngineV2.lastFingerprint === viewFingerprint && state.chartEngineV2.realChart;
  if (forceRedraw || !alreadyRendered) drawLineChart(els.mainChart, result.series, `${c.symbol} ${periodLabel}`, result, chartKey);
  atlasRenderAssetDetail(c, period, result, "valid");
  renderMultiHorizon();
  if (els.chartCaption) {
    const freshness = result?.integrity?.metrics?.freshness;
    const truth = atlasChartTruth(result, period);
    const warning = result?.refreshWarning
      ? ` · ${result.refreshWarning}`
      : truth.source === "cache" && freshness?.level === "fresh"
        ? ` · cache récent exact du ${truth.exact}`
        : freshness?.level === "delayed"
          ? ` · mise à jour retardée (${freshness.label})`
          : freshness?.level === "archive"
            ? ` · archive réelle datée (${freshness.label})`
            : "";
    atlasRenderSingleCaption(c, periodLabel, result, warning);
  }
}


function atlasClearChartRetryTimer() {
  if (state.chartEngineV2?.retryTimer) {
    clearTimeout(state.chartEngineV2.retryTimer);
    state.chartEngineV2.retryTimer = null;
  }
}

function atlasResetChartRetry(key = "") {
  atlasClearChartRetryTimer();
  if (!state.chartEngineV2) return;
  state.chartEngineV2.retryKey = key;
  if (key) state.chartEngineV2.retryAttempts[key] = 0;
}

function atlasChartRetryPending(key) {
  return !!state.chartEngineV2?.retryTimer && state.chartEngineV2.retryKey === key;
}

function atlasScheduleChartAutoRetry(c, period, reason = "réponse réseau tardive") {
  if (!c?.id || !state.chartEngineV2) return false;
  const key = atlasChartKey(c, period);
  const attempts = Number(state.chartEngineV2.retryAttempts[key] || 0);
  if (attempts >= ATLAS_CHART_SELECTION_AUTO_RETRIES) return false;
  const retryDelayMs = ATLAS_CHART_SELECTION_RETRY_DELAYS_MS[Math.min(attempts, ATLAS_CHART_SELECTION_RETRY_DELAYS_MS.length - 1)];
  atlasClearChartRetryTimer();
  state.chartEngineV2.retryKey = key;
  state.chartEngineV2.retryAttempts[key] = attempts + 1;
  state.dataBroker.chart = {
    status: "loading", coinId: c.id, period: Number(period || 1), source: ATLAS_CANONICAL_MARKET_SOURCE,
    mode: "none", timestamp: null, pointCount: 0, latencyMs: null, retryCount: attempts + 1,
    contextKey: atlasExpectedChartContextKey([c.id], Number(period || 1)), result: null, error: String(reason || "")
  };
  atlasRenderAssetDetail(c, period, null, "loading");
  atlasChartSetPeriodButtons(period, true);
  drawChartLoading(
    els.mainChart,
    `${c.symbol} ${atlasChartPeriodLabel(period)} · nouvelle tentative automatique`,
    `La première lecture n’a pas répondu assez vite. Atlas réessaie automatiquement sans changer d’actif ni de période.`
  );
  if (els.chartCaption) {
    atlasSetChartCaptionText(`Graphique ${c.symbol} · période ${atlasChartPeriodLabel(period)} · nouvelle tentative automatique dans ${Math.round(retryDelayMs / 1000)} s.`);
  }
  state.chartEngineV2.retryTimer = setTimeout(() => {
    state.chartEngineV2.retryTimer = null;
    if (state.selectedCoinId !== c.id || Number(state.chartPeriodDays || 1) !== Number(period || 1)) return;
    void renderAnalystPanel({ recovery: true });
  }, retryDelayMs);
  return true;
}

function atlasPrepareChartSelection(coin, period = 1, options = {}) {
  if (!coin?.id) return;
  if (state.chartEngineV2?.controller) {
    try { state.chartEngineV2.controller.abort(); } catch {}
  }
  const normalizedPeriod = Number(period || 1);
  state.selectedCoinId = coin.id;
  state.chartPeriodDays = normalizedPeriod;
  if (!options.preserveComparison) atlasSetComparisonIds([coin.id], coin.id, { preset: options.preset || "solo" });
  const key = atlasChartKey(coin, normalizedPeriod);
  atlasResetChartRetry(key);
  state.dataBroker.chart = {
    status: "loading", coinId: coin.id, period: normalizedPeriod, source: ATLAS_CANONICAL_MARKET_SOURCE,
    mode: "none", timestamp: null, pointCount: 0,
    contextKey: atlasExpectedChartContextKey([coin.id], normalizedPeriod), result: null, error: null
  };
  atlasBrokerSeedSpot(coin);
  atlasChartSetPeriodButtons(normalizedPeriod, true);
}

function atlasSelectMarketCoin(coin) {
  if (!coin?.id) return;
  atlasTrackAudience("asset_selected", { asset: coin.id, symbol: coin.symbol || null, rank: coin.rank ?? null });
  atlasPrepareChartSelection(coin, Number(state.chartPeriodDays || 1), { preset: "solo" });
  renderScore(coin);
  renderMarketTable();
  renderDecisionBoard();
  renderMultiHorizon();
  atlasRenderComparisonControls();
  requestAnimationFrame(() => { void renderAnalystPanel({ selection: true, forceSingle: true }); });
}

async function renderAnalystPanel(options = {}) {
  if (!options.forceSingle && atlasComparisonActive()) return renderComparisonAnalystPanel(options);
  const c = getSelectedCoin();
  const anticipatedPeriod = Number(state.chartPeriodDays || 1);
  const anticipatedKey = c ? atlasChartKey(c, anticipatedPeriod) : "";
  if (c && !options.recovery && state.chartEngineV2?.loading && state.chartEngineV2?.activeRequestKey === anticipatedKey) {
    atlasRenderAssetDetail(c, anticipatedPeriod, state.dataBroker.chart?.result || null, "loading");
    atlasChartSetPeriodButtons(anticipatedPeriod, true);
    return;
  }
  atlasClearChartRetryTimer();
  const renderToken = ++state.chartRenderToken;
  if (state.chartEngineV2?.controller) {
    try { state.chartEngineV2.controller.abort(); } catch {}
  }
  if (!c) {
    atlasChartSetPeriodButtons(Number(state.chartPeriodDays || 1), false);
    setText(els.selectedAssetTitle, "Aucun actif sélectionné");
    state.dataBroker.chart = { ...state.dataBroker.chart, status: "blocked", coinId: null, contextKey: atlasExpectedChartContextKey([], Number(state.chartPeriodDays || 1)), result: null };
    if (state.liveOk) {
      drawChartMessage(els.mainChart, "loading", "Sélection libre", "Clique une ligne du MARKET SNAPSHOT pour afficher son historique réel.", "La sélection peut rester vide.");
      if (els.chartCaption) atlasSetChartCaptionText("Aucune crypto sélectionnée · clique une ligne du MARKET SNAPSHOT.");
    } else {
      drawChartBlocked(els.mainChart);
      if (els.chartCaption) atlasSetChartCaptionText("Graphique indisponible · Livecheck requis.");
    }
    atlasRenderBrokerStrip();
    renderMultiHorizon();
    return;
  }

  state.selectedCoinId = c.id;
  atlasBrokerSeedSpot(c);
  atlasRenderBrokerStrip();
  // Le snapshot Top 50 alimente déjà le détail. Aucun appel spot concurrent au graphique.

  const coinId = c.id;
  const period = Number(state.chartPeriodDays || 1);
  const periodLabel = atlasChartPeriodLabel(period);
  const chartKey = atlasChartKey(c, period);
  const controller = new AbortController();
  state.chartEngineV2.token = renderToken;
  state.chartEngineV2.controller = controller;
  state.chartEngineV2.lastKey = chartKey;
  state.chartEngineV2.activeRequestKey = chartKey;
  state.chartEngineV2.loading = true;
  setText(els.selectedAssetTitle, `${c.name} — ${c.symbol}`);

  const stored = atlasGetStoredChartResult(c, period);
  if (stored) {
    atlasRenderChartResult(c, period, stored, chartKey);
    if (!atlasChartNeedsRefresh(stored, period)) {
      delete state.chartEngineV2.retryAttempts[chartKey];
      state.chartEngineV2.retryKey = "";
      atlasChartSetPeriodButtons(period, false);
      return;
    }
    atlasChartSetPeriodButtons(period, true);
    atlasShowChartRefresh(els.mainChart, `${c.symbol} ${periodLabel} · actualisation discrète`);
  } else {
    state.dataBroker.chart = { status: "loading", coinId, period, source: ATLAS_CANONICAL_MARKET_SOURCE, mode: "none", timestamp: null, pointCount: 0, contextKey: atlasExpectedChartContextKey([coinId], period), result: null, error: null };
    atlasRenderAssetDetail(c, period, null, "loading");
    atlasChartSetPeriodButtons(period, true);
    drawChartLoading(els.mainChart, `${c.symbol} ${periodLabel} · chargement`, "Atlas interroge CoinGecko pour cette série historique réelle.");
    if (els.chartCaption) atlasSetChartCaptionText(`Graphique ${c.symbol} · période ${periodLabel} · première série réelle en cours.`);
  }

  const chartStartedAt = performance.now();
  try {
    const result = await fetchChartSeries(c, period, { signal: controller.signal, fallback: stored });
    const chartLatencyMs = Math.round(performance.now() - chartStartedAt);
    if (renderToken !== state.chartRenderToken || state.selectedCoinId !== coinId || Number(state.chartPeriodDays || 1) !== period) return;
    if (result.blocked || !Array.isArray(result.series) || !result.series.length) {
      if (stored) atlasRenderChartResult(c, period, { ...stored, refreshWarning: "Actualisation indisponible. Dernière série réelle conservée." }, chartKey);
      else if (!atlasScheduleChartAutoRetry(c, period, result.technicalReason || result.reason || "réponse réseau tardive")) {
        state.dataBroker.chart = { status: "blocked", coinId, period, source: ATLAS_CANONICAL_MARKET_SOURCE, mode: "none", timestamp: null, pointCount: 0, latencyMs: chartLatencyMs, retryCount: Number(state.chartEngineV2.retryAttempts[chartKey] || 0), contextKey: atlasExpectedChartContextKey([coinId], period), result, error: result.technicalReason || result.reason || null };
        drawChartBlocked(els.mainChart);
        atlasRenderAssetDetail(c, period, result, "blocked");
        if (els.chartCaption) atlasSetChartCaptionText(`Graphique ${c.symbol} · période ${periodLabel} · temporairement indisponible après nouvelle tentative automatique.`);
        atlasTrackAudience("chart_error", { asset: c.id, symbol: c.symbol, days: period, reason: String(result.technicalReason || result.reason || "indisponible") });
      }
      return;
    }

    const backgroundDirect = result.backgroundDirect;
    const cleanResult = {
      ...result,
      diagnostics: {
        ...(result?.diagnostics || {}),
        latencyMs: chartLatencyMs,
        retryCount: Number(state.chartEngineV2.retryAttempts[chartKey] || 0),
        cacheUsed: result?.sourceMode === "browser-cache"
      }
    };
    delete cleanResult.backgroundDirect;
    atlasStoreChartResult(c, period, cleanResult);
    if (period === 36500) atlasWriteChartMaxTruth(cleanResult, c);
    delete state.chartEngineV2.retryAttempts[chartKey];
    state.chartEngineV2.retryKey = "";
    atlasRenderChartResult(c, period, cleanResult, chartKey);
    atlasTrackAudience("chart_loaded", { asset: c.id, symbol: c.symbol, days: period, points: cleanResult.series?.length || 0 });

    if (backgroundDirect) {
      const upgraded = await backgroundDirect;
      if (upgraded?.ok && upgraded.value && renderToken === state.chartRenderToken && state.selectedCoinId === coinId && Number(state.chartPeriodDays || 1) === period) {
        atlasStoreChartResult(c, period, upgraded.value);
        if (period === 36500) atlasWriteChartMaxTruth(upgraded.value, c);
        atlasRenderChartResult(c, period, upgraded.value, chartKey, true);
      }
    }
  } catch (error) {
    if (error?.name === "AbortError") return;
    if (renderToken !== state.chartRenderToken || state.selectedCoinId !== coinId || Number(state.chartPeriodDays || 1) !== period) return;
    if (stored) atlasRenderChartResult(c, period, { ...stored, refreshWarning: "Actualisation indisponible. Dernière série réelle conservée." }, chartKey);
    else if (!atlasScheduleChartAutoRetry(c, period, String(error?.message || error))) {
      state.dataBroker.chart = { status: "blocked", coinId, period, source: ATLAS_CANONICAL_MARKET_SOURCE, mode: "none", timestamp: null, pointCount: 0, latencyMs: Math.round(performance.now() - chartStartedAt), retryCount: Number(state.chartEngineV2.retryAttempts[chartKey] || 0), contextKey: atlasExpectedChartContextKey([coinId], period), result: null, error: String(error?.message || error) };
      drawChartBlocked(els.mainChart);
      atlasRenderAssetDetail(c, period, { reason: "indisponibilité réseau" }, "blocked");
      if (els.chartCaption) atlasSetChartCaptionText(`Graphique ${c.symbol} · période ${periodLabel} · temporairement indisponible après nouvelle tentative automatique.`);
    }
  } finally {
    if (renderToken === state.chartRenderToken && Number(state.chartPeriodDays || 1) === period && !atlasChartRetryPending(chartKey)) {
      atlasChartSetPeriodButtons(period, false);
      if (state.chartEngineV2?.activeRequestKey === chartKey) {
        state.chartEngineV2.activeRequestKey = "";
        state.chartEngineV2.loading = false;
      }
    }
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
} function coinPayload(c) { if (!c) return null; const s = scoreCoin(c); const ratio = c.volume24h && c.marketCap ? c.volume24h / c.marketCap : null; return { id: c.id, rank: c.rank ?? null, name: c.name, symbol: c.symbol, type: classifyAsset(c), price_eur: c.price ?? null, change_24h_pct: c.change24h ?? null, change_7d_pct: c.change7d ?? null, change_30d_pct: c.change30d ?? null, market_cap_eur: c.marketCap ?? null, volume_24h_eur: c.volume24h ?? null, volume_marketcap_ratio: ratio, score: s.score, score_label: s.label, decision: beginnerDecision(c), limits: ["no_contract_security", "no_social_validation", "no_onchain_validation", "not_financial_advice"] };
} function sourceHealthPayload() { const total = liveSources.length; const status = liveSources.map(src => { const rec = state.sourceStatus.find(s => s.key === src.key); return { key: src.key, name: src.name, role: "atomic_market_leg", kind: src.kind, status: rec ? rec.status : "WAIT", ms: rec?.ms ?? null, detail: rec?.detail ?? "not_tested" }; }); const ok = status.filter(s => s.status === "OK").length; const fail = status.filter(s => s.status === "ÉCHEC").length; return { live_ok: atlasAnalysisLiveReady(), market_visible: state.liveOk, main_source: state.mainSource, total_flows: total, successful_flows: ok, failed_flows: fail, tested_flows: state.sourceStatus.length, critical_rule: "Le flux CoinGecko EUR Top 50 suffit au marché. Le flux USD est un enrichissement optionnel et ne peut jamais bloquer l’application.", sources: status };
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
} function simulateOrder(side, symbolInput = null, amountInput = null) { if (!atlasAnalysisLiveReady()) return simulationRefusal("Simulation suspendue : snapshot CoinGecko direct récent requis.", sourceHealthPayload()); const symbol = normalizeSymbol(symbolInput || els.simSymbol?.value || ""); const amount = Number(amountInput ?? els.simAmount?.value ?? 0); if (!symbol) return simulationRefusal("Actif manquant."); if (!Number.isFinite(amount) || amount <= 0) return simulationRefusal("Montant invalide."); if (!SIM_PROFILE.allowedSymbols.includes(symbol)) { return simulationRefusal(`Profil débutant : ${symbol} refusé. Autorisés : ${SIM_PROFILE.allowedSymbols.join(" / ")}.`, { requested_symbol: symbol }); } const coin = findCoinByQuery(symbol); if (!coin) return simulationRefusal(`Actif autorisé mais non chargé par le Livecheck : ${symbol}. Relance Livecheck.`, { requested_symbol: symbol }); if (!state.sim) loadSimulation(); const price = coin.price; if (!Number.isFinite(price) || price <= 0) return simulationRefusal("Prix indisponible pour simulation."); const sym = coin.symbol.toUpperCase(); if (amount > SIM_PROFILE.maxPerOperation) { return simulationRefusal(`Profil débutant : maximum par opération = ${fmtEUR.format(SIM_PROFILE.maxPerOperation)}.`, { requested_amount_eur: amount }); } const pos = state.sim.positions[sym] || { symbol: sym, name: coin.name, qty: 0, avgPrice: 0, invested: 0, lastPrice: price }; if (side === "buy") { const totals = getSimulationTotals(); if (amount > state.sim.cash) return simulationRefusal("Capital virtuel insuffisant.", { cash: state.sim.cash, requested: amount }); if (state.sim.cash - amount < SIM_PROFILE.minReserve) { return simulationRefusal(`Profil débutant : réserve minimale obligatoire = ${fmtEUR.format(SIM_PROFILE.minReserve)}.`, { cash_after_order_eur: state.sim.cash - amount }); } if (totals.positionsValue + amount > SIM_PROFILE.maxExposure) { return simulationRefusal(`Profil débutant : exposition maximale = ${fmtEUR.format(SIM_PROFILE.maxExposure)}.`, { exposure_after_order_eur: totals.positionsValue + amount }); } const qty = amount / price; const newQty = pos.qty + qty; const newInvested = pos.invested + amount; pos.qty = newQty; pos.invested = newInvested; pos.avgPrice = newInvested / newQty; pos.lastPrice = price; state.sim.positions[sym] = pos; state.sim.cash -= amount; simLog({ type: "SIM_BUY", symbol: sym, amount_eur: amount, price_eur: price, qty, message: `Achat simulé ${sym} pour ${fmtEUR.format(amount)} · profil 100 €.` }); } else if (side === "sell") { if (!pos.qty || pos.qty <= 0) return simulationRefusal(`Aucune position virtuelle à vendre pour ${sym}.`); const maxValue = pos.qty * price; const sellValue = Math.min(amount, maxValue); const qty = sellValue / price; const soldRatio = qty / pos.qty; pos.qty -= qty; pos.invested = Math.max(0, pos.invested * (1 - soldRatio)); pos.lastPrice = price; state.sim.cash += sellValue; if (pos.qty <= 0.00000001) delete state.sim.positions[sym]; else state.sim.positions[sym] = pos; simLog({ type: "SIM_SELL", symbol: sym, amount_eur: sellValue, price_eur: price, qty, message: `Vente simulée ${sym} pour ${fmtEUR.format(sellValue)} · profil 100 €.` }); } saveSimulation(); renderSimulation(); return commandOk(`sim_${side} ${sym} ${amount}`, { side, symbol: sym, amount_eur: amount, price_eur: price, portfolio: simulationPayload() });
} function simLogTypeLabel(type) { if (type === "SIM_BUY") return "ACHAT SIMULÉ"; if (type === "SIM_SELL") return "VENTE SIMULÉE"; if (type === "REFUS") return "REFUS"; if (type === "RESET") return "RESET"; return String(type || "INFO");
} function simLogLine(entry) { const time = entry?.time ? new Date(entry.time).toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit", second:"2-digit" }) : ""; const label = simLogTypeLabel(entry?.type); const msg = entry?.message || ""; return time ? `${label} · ${msg} · ${time}` : `${label} · ${msg}`;
} function renderSimulation() { if (!state.sim) loadSimulation(); const totals = getSimulationTotals(); if (els.simProfileStatus) { const profile = getSimulationProfileStatus(); els.simProfileStatus.textContent = `${profile.allowed_symbols.join(" / ")} · ticket ${fmtEUR.format(profile.default_amount_eur)} · max ${fmtEUR.format(profile.max_per_operation_eur)} · exposé ${fmtEUR.format(profile.current_exposure_eur)} / ${fmtEUR.format(profile.max_exposure_eur)} · réserve min ${fmtEUR.format(profile.min_reserve_eur)}`; } setText(els.simCash, fmtEUR.format(state.sim.cash)); setText(els.simPositionsValue, fmtEUR.format(totals.positionsValue)); setText(els.simTotalValue, fmtEUR.format(totals.total)); if (els.simPnL) { els.simPnL.textContent = `${totals.pnl >= 0 ? "+" : ""}${fmtEUR.format(totals.pnl)}`; els.simPnL.classList.toggle("pnl-pos", totals.pnl >= 0); els.simPnL.classList.toggle("pnl-neg", totals.pnl < 0); } const positions = Object.keys(state.sim.positions); if (els.simPositions) { els.simPositions.innerHTML = positions.length ? positions.map(sym => { const pos = state.sim.positions[sym]; const coin = findCoinByQuery(sym); const price = coin?.price ?? pos.lastPrice ?? pos.avgPrice; const value = pos.qty * price; const pnl = value - pos.invested; return `<div class="sim-position-row"><b>${escapeHtml(sym)}</b><span>${pos.qty.toFixed(8)}</span><span>${fmtEUR.format(value)}</span><span class="${pnl >= 0 ? "pnl-pos" : "pnl-neg"}">${pnl >= 0 ? "+" : ""}${fmtEUR.format(pnl)}</span></div>`; }).join("") : "Aucune position simulée."; } if (els.simLog) { els.simLog.textContent = state.sim.logs.length ? state.sim.logs.map(simLogLine).join("\n") : "Aucune simulation lancée."; }
} function situationPayload() { return { version: ATLAS_RELEASE, active_now: [ "public_market_observation", "charts", "source_diagnostic", "human_readable_tests", "local_paper_trading", "solo_beginner_profile_100_eur", "briefing_questions" ], prepared_only: [ "private_backend", "remote_access", "kraken_read_only", "physical_security_layer" ], locked: [ "real_wallet_connection", "private_key", "withdraw_key", "real_order", "automatic_trading" ], current_step: "collect_information_before_private_backend" };
} function nextStepsPayload() { return { next_steps: [ "confirm_priority_assets", "define_virtual_simulation_amount", "define_forbidden_risks", "select_news_sources", "describe_private_machine", "choose_access_security_model" ], next_version_candidate: "V1.1-beta_local_private_preparation" };
} function boundariesPayload() { return { hard_boundaries: [ "no_real_exchange_key_now", "no_real_wallet_connection", "no_seed_phrase_in_ui_or_files", "no_withdraw_permission", "no_real_order_from_public_frontend", "no_public_remote_access", "no_nominative_labels_in_public_interface" ] };
} function briefingPayload() { return { mode: "preparation_session", purpose: "collect_information_before_private_backend", collect: [ "target_mode_observation_simulation_or_future_semi_auto", "priority_assets", "risk_limits", "news_sources", "private_machine_context", "remote_access_preference", "physical_security_preference" ], forbidden_during_session: [ "create_real_exchange_key", "connect_real_wallet", "enter_seed_phrase", "enable_withdraw_permission", "start_real_trading", "open_public_remote_access" ] };
} function questionsPayload() { return { questions: [ "Quel montant virtuel utiliser pour la simulation ?", "Quelles cryptos suivre en priorité ?", "Quels risques sont interdits ?", "Quelles sources d'information surveiller ?", "Quelle machine privée est envisagée ?", "Quel accès renforcé est préféré ?", "Quelle validation humaine est obligatoire ?" ] };
} function doNotDoPayload() { return { do_not_do: [ "Pas de clé Kraken réelle maintenant.", "Pas de wallet réel connecté maintenant.", "Pas de seed phrase dans l'interface.", "Pas de trading automatique.", "Pas d'accès distant public.", "Pas d'argent réel avant dry-run long." ] };
} function backendBlueprintPayload() { return { version: ATLAS_RELEASE, principle: "separate_public_frontend_from_private_backend", public_layer: { host: "GitHub Pages", allowed: [ "market_observation", "charts", "watchlist", "command_layer_observation", "local_paper_trading" ], forbidden: [ "private_api_keys", "withdraw_keys", "real_orders", "admin_remote_access", "wallet_connection" ] }, private_layer_future: { host: "private_machine_or_secure_local_server", allowed: [ "encrypted_api_secrets", "Kraken_read_only_client", "server_side_paper_trading", "logs", "kill_switch", "restricted_remote_access" ], access: ["authorized_operator_1", "authorized_operator_2"] }, exchange_layer_future: { primary: "Kraken", first_mode: "read_only", later_modes_locked: [ "paper_trading_server", "human_validated_order", "real_micro_transaction" ], never_allowed_initially: [ "withdraw_permission", "fully_autonomous_trading" ] } };
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
} const CryptoCommands = { help() { return commandOk("help", { available_commands: [ "market_snapshot", "asset BTC", "chart ETH 7d", "compare BTC ETH", "sources", "category USDT", "risk SOL", "planning", "exchange_plan", "news_sources", "sim_buy BTC 5", "sim_sell BTC 5", "portfolio", "reset_sim", "safety_plan", "kill_switch", "access_plan", "gates", "Plan architecture", "Plan Kraken lecture seule", "Plan accès distant", "Contrôle sécurité" ], blocked_commands: ["buy", "sell", "order", "trade", "withdraw", "transfer"], rule: "Observation only. No real trading from GitHub Pages." }); }, market_snapshot() { if (!state.liveOk || !state.coins.length) { return commandError("Livecheck requis : aucune donnée marché fiable chargée.", sourceHealthPayload()); } const btc = findCoinByQuery("BTC"); const eth = findCoinByQuery("ETH"); return commandOk("market_snapshot", { source: state.mainSource, timestamp: state.timestamp, global: { market_cap_eur: state.global?.total_market_cap?.eur ?? null, volume_24h_eur: state.global?.total_volume?.eur ?? null, btc_dominance_pct: state.global?.market_cap_percentage?.btc ?? null }, loaded_assets: state.coins.length, btc: coinPayload(btc), eth: coinPayload(eth), source_health: sourceHealthPayload() }); }, asset(symbol) { if (!state.liveOk || !state.coins.length) return commandError("Livecheck requis avant lecture actif.", sourceHealthPayload()); const c = findCoinByQuery(symbol); if (!c) return commandError(`Actif introuvable dans le top chargé : ${symbol}`, { loaded_assets: state.coins.length }); return commandOk(`asset ${symbol}`, coinPayload(c)); }, category(symbol) { if (!state.liveOk || !state.coins.length) return commandError("Livecheck requis avant classification.", sourceHealthPayload()); const c = findCoinByQuery(symbol); if (!c) return commandError(`Actif introuvable : ${symbol}`); return commandOk(`category ${symbol}`, { symbol: c.symbol, name: c.name, category: classifyAsset(c), reading: whyDecision(c) }); }, risk(symbol) { if (!state.liveOk || !state.coins.length) return commandError("Livecheck requis avant lecture risque.", sourceHealthPayload()); const c = findCoinByQuery(symbol); if (!c) return commandError(`Actif introuvable : ${symbol}`); return commandOk(`risk ${symbol}`, { asset: coinPayload(c), risk_flags: [ "contract_security_not_checked", "social_signal_not_checked", "onchain_signal_not_checked", "public_market_data_only" ], no_fomo_rule: "Une occasion ratée ne coûte rien. Une mauvaise position peut coûter très cher.", conclusion: "Observation only. Human validation required." }); }, sources() { return commandOk("sources", sourceHealthPayload()); }, simulation_profile() { return commandOk("simulation_profile", getSimulationProfileStatus()); }, chart(symbol, period = "24h") { if (!state.liveOk || !state.coins.length) return commandError("Livecheck requis avant graphique.", sourceHealthPayload()); const c = findCoinByQuery(symbol); if (!c) return commandError(`Actif introuvable : ${symbol}`); const normalized = String(period || "24h").toLowerCase(); const days = normalized.includes("30") ? 30 : normalized.includes("7") ? 7 : 1; atlasPrepareChartSelection(c, days); renderScore(c); renderMarketTable(); requestAnimationFrame(() => { void renderAnalystPanel({ command: true }); }); return commandOk(`chart ${symbol} ${period}`, { selected_asset: coinPayload(c), period_days: days, action: "chart_panel_updated" }); }, compare(symbolA, symbolB) { if (!state.liveOk || !state.coins.length) return commandError("Livecheck requis avant comparaison.", sourceHealthPayload()); const a = findCoinByQuery(symbolA); const b = findCoinByQuery(symbolB); if (!a || !b) return commandError("Comparaison impossible : un actif est introuvable.", { symbolA, foundA: !!a, symbolB, foundB: !!b }); const ap = coinPayload(a); const bp = coinPayload(b); return commandOk(`compare ${symbolA} ${symbolB}`, { left: ap, right: bp, delta: { price_eur: (a.price ?? 0) - (b.price ?? 0), change_24h_pct: (a.change24h ?? 0) - (b.change24h ?? 0), change_7d_pct: (a.change7d ?? 0) - (b.change7d ?? 0), market_cap_eur: (a.marketCap ?? 0) - (b.marketCap ?? 0), volume_24h_eur: (a.volume24h ?? 0) - (b.volume24h ?? 0), score: (ap.score ?? 0) - (bp.score ?? 0) }, warning: "Comparison is observational; it does not rank investment quality." }); }, planning() { return commandOk("planning", planningPayload()); }, exchange_plan() { return commandOk("exchange_plan", exchangePlanPayload()); }, news_sources() { return commandOk("news_sources", newsPlanPayload()); }
}; function parseCommandLine(input) { const raw = String(input || "").trim(); if (!raw) return commandError("Commande vide. Tape help."); const parts = raw.split(/\s+/); let cmd = parts[0].toLowerCase(); const lowerRaw = raw.toLowerCase().trim(); if (lowerRaw === "plan architecture" || lowerRaw === "architecture" || lowerRaw === "plan") cmd = "backend_blueprint"; if (lowerRaw === "controle securite" || lowerRaw === "contrôle sécurité" || lowerRaw === "securite" || lowerRaw === "sécurité") cmd = "security_review"; if (lowerRaw === "plan kraken" || lowerRaw === "kraken lecture seule") cmd = "kraken_readonly_plan"; if (lowerRaw === "sources info" || lowerRaw === "journaux") cmd = "news_sources"; if (lowerRaw === "resume marche" || lowerRaw === "résumé marché") cmd = "market_snapshot"; if (lowerRaw === "portefeuille virtuel") cmd = "portfolio"; if (["buy", "sell", "order", "trade", "withdraw", "transfer"].includes(cmd)) { return commandError("Commande bloquée : validation humaine, retrait ou transfert depuis cette interface publique.", { command: raw, rule: "Trading must require backend, API keys protected, dry-run, logs, limits, and human validation." }); } if (cmd === "help") return CryptoCommands.help(); if (cmd === "market_snapshot" || cmd === "snapshot" || cmd === "market") return CryptoCommands.market_snapshot(); if (cmd === "asset" || cmd === "quote") return CryptoCommands.asset(parts[1]); if (cmd === "chart" || cmd === "graph") return CryptoCommands.chart(parts[1], parts[2] || "24h"); if (cmd === "compare") return CryptoCommands.compare(parts[1], parts[2]); if (cmd === "sources" || cmd === "health" || cmd === "source_health") return CryptoCommands.sources(); if (cmd === "simulation_profile" || cmd === "profil_simulation" || cmd === "profil") return CryptoCommands.simulation_profile(); if (cmd === "sim_buy" || cmd === "paper_buy") return simulateOrder("buy", parts[1], parts[2]); if (cmd === "sim_sell" || cmd === "paper_sell") return simulateOrder("sell", parts[1], parts[2]); if (cmd === "portfolio" || cmd === "paper_portfolio") return commandOk("portfolio", simulationPayload()); if (cmd === "reset_sim" || cmd === "paper_reset") { resetSimulation(); return commandOk("reset_sim", simulationPayload()); } if (cmd === "questionnaire_status" || cmd === "questionnaire") return commandOk("questionnaire_status", questionnaireStatusPayload()); if (cmd === "situation" || cmd === "status") return commandOk("situation", situationPayload()); if (cmd === "next_steps" || cmd === "suite") return commandOk("next_steps", nextStepsPayload()); if (cmd === "boundaries" || cmd === "limites") return commandOk("boundaries", boundariesPayload()); if (cmd === "briefing" || cmd === "session") return commandOk("briefing", briefingPayload()); if (cmd === "questions") return commandOk("questions", questionsPayload()); if (cmd === "do_not_do" || cmd === "interdits") return commandOk("do_not_do", doNotDoPayload()); if (cmd === "backend_blueprint" || cmd === "backend") return commandOk("backend_blueprint", backendBlueprintPayload()); if (cmd === "kraken_readonly_plan" || cmd === "kraken_readonly") return commandOk("kraken_readonly_plan", krakenReadonlyPlanPayload()); if (cmd === "remote_access_plan" || cmd === "remote_blueprint" || cmd === "remote") return commandOk("remote_access_plan", remoteBlueprintPayload()); if (cmd === "security_review" || cmd === "security_check") return commandOk("security_review", securityReviewPayload()); if (cmd === "safety_plan" || cmd === "safety") return commandOk("safety_plan", safetyPlanPayload()); if (cmd === "kill_switch" || cmd === "killswitch") return commandOk("kill_switch", killSwitchPayload()); if (cmd === "access_plan" || cmd === "remote_access") return commandOk("access_plan", accessPlanPayload()); if (cmd === "gates" || cmd === "gate_status") return commandOk("gates", gatesPayload()); if (cmd === "planning" || cmd === "roadmap") return CryptoCommands.planning(); if (cmd === "exchange_plan" || cmd === "exchanges") return CryptoCommands.exchange_plan(); if (cmd === "news_sources" || cmd === "news" || cmd === "journaux") return CryptoCommands.news_sources(); if (cmd === "category" || cmd === "cat") return CryptoCommands.category(parts[1]); if (cmd === "risk" || cmd === "risk_readout") return CryptoCommands.risk(parts[1]); return commandError(`Commande inconnue : ${cmd}`, { hint: "Tape help.", received: raw });
} function renderSimpleCommandIntro() { if (!els.commandHuman) return; els.commandHuman.classList.add("ok"); els.commandHuman.classList.remove("err"); els.commandHuman.innerHTML = ` <b>Mode simple prêt</b> <p>Clique un bouton au-dessus. La carte verte suffit.</p> <ul> <li>Résumé marché : vérifie les données principales.</li> <li>Plan architecture : explique public / privé / Kraken.</li> <li>Contrôle sécurité : liste les protections obligatoires.</li> <li>Portefeuille virtuel : simulation 100 €, sans argent réel.</li> </ul> <div class="cmd-tags"><span>aucun achat réel</span><span>profil 100 €</span><span>simulation only</span></div> `;
} function humanCommandSummary(result) { const cmd = String(result?.command || "").toLowerCase(); if (!result || result.ok === false) { const isProfileRefusal = !!result?.profile; return { title: isProfileRefusal ? "Simulation refusée : sécurité OK" : "Commande bloquée ou impossible", text: result?.error || "La commande n’a pas pu être exécutée.", bullets: isProfileRefusal ? [ "Le refus est normal : le profil débutant protège le capital virtuel.", "Validation humaine n’a été envoyé.", "Le refus est inscrit dans le journal simulation." ] : [ "Validation humaine n’a été envoyé.", "Aucune clé API n’est utilisée dans cette page.", "Vérifie Livecheck si la commande dépend des données marché." ], tags: isProfileRefusal ? ["refus visible", "profil 100 €", "sécurité"] : ["sécurité", "observation only"] }; } if (cmd === "questionnaire_status") { return { title: "Questionnaire : OK", text: "Cette carte vérifie l’état de la fiche de session locale.", bullets: [ "Les notes restent dans le navigateur.", "Aucune clé réelle ne doit être saisie.", "Aucun wallet réel ne doit être connecté.", "La fiche sert à préparer la discussion et peut être exportée en note Markdown." ], tags: ["questionnaire", "local", "aucun secret"] }; } if (cmd === "situation") { return { title: "Situation : OK", text: "Cette carte résume où en est le projet maintenant.", bullets: [ "Actif : observation, graphiques, sources, simulation locale.", "Préparé : backend privé, accès renforcé, Kraken lecture seule.", "Verrouillé : wallet réel, clé privée, retrait, ordre réel.", "Étape actuelle : collecter les informations de session." ], tags: ["situation", "clair", "aucun réel"] }; } if (cmd === "next_steps") { return { title: "Prochaines étapes : OK", text: "Cette carte liste ce qu’il faut clarifier avant de développer la machine privée.", bullets: [ "Cryptos prioritaires.", "Montant virtuel de simulation.", "Risques interdits.", "Sources d’actualité.", "Machine privée et accès renforcé." ], tags: ["suite", "briefing", "préparation"] }; } if (cmd === "boundaries") { return { title: "Limites verrouillées : OK", text: "Cette carte rappelle ce que l’app publique ne doit jamais faire.", bullets: [ "Pas de clé réelle.", "Pas de wallet réel.", "Pas de seed phrase.", "Pas d’ordre réel.", "Pas d’accès distant public." ], tags: ["verrou", "sécurité", "zéro argent réel"] }; } if (cmd === "briefing") { return { title: "Briefing session : OK", text: "Cette carte prépare la discussion : on collecte les informations avant toute décision technique.", bullets: [ "Clarifier le but exact.", "Lister les cryptos prioritaires.", "Définir les limites de risque.", "Noter les sources d’information.", "Ne connecter aucun wallet réel." ], tags: ["préparation", "aucun réel", "sécurité"] }; } if (cmd === "questions") { return { title: "Questions à poser : OK", text: "Cette carte liste les points à éclaircir avant la prochaine étape.", bullets: [ "Montant virtuel de simulation.", "Cryptos prioritaires.", "Sources d’actualité.", "Machine privée.", "Accès renforcé.", "Validation humaine." ], tags: ["questions", "session", "clarifier"] }; } if (cmd === "do_not_do") { return { title: "À ne pas faire : OK", text: "Cette carte rappelle les actions interdites pour éviter une erreur dangereuse.", bullets: [ "Pas de clé réelle.", "Pas de wallet réel.", "Pas de seed phrase.", "Pas de trading automatique.", "Pas d’accès public." ], tags: ["interdits", "sécurité", "zéro argent réel"] }; } if (cmd === "backend_blueprint") { return { title: "Backend Blueprint : test OK", text: "Le bouton “Plan architecture” montre simplement où seront rangées les parties du futur système. Il ne connecte rien et ne fait aucun achat.", bullets: [ "Site public : ce que tu vois ici, sans clé et sans argent réel.", "Machine privée : futur machine privée ou serveur sécurisé.", "Kraken : plus tard, d’abord en lecture seule.", "Interdit : achat réel, retrait, clé API dans GitHub." ], tags: ["plan validé", "aucune connexion réelle", "Kraken plus tard"] }; } if (cmd === "security_review") { return { title: "Security Review : checklist OK", text: "Le bouton “Contrôle sécurité” affiche la liste des protections obligatoires avant toute vraie connexion.", bullets: [ "Aucune clé dans GitHub Pages.", "Clé Kraken lecture seule au départ.", "Retrait désactivé.", "Logs, kill switch et validation humaine obligatoires.", "Paper trading avant argent réel." ], tags: ["sécurité", "checklist", "avant réel"] }; } if (cmd === "kraken_readonly_plan") { return { title: "Kraken lecture seule : plan OK", text: "La commande décrit le futur premier niveau Kraken : lire des données, sans acheter, vendre, transférer ou retirer.", bullets: [ "Lecture solde / prix / historique uniquement.", "Aucun ordre autorisé.", "Aucun retrait autorisé.", "Backend sécurisé requis." ], tags: ["Kraken", "lecture seule", "future étape"] }; } if (cmd === "remote_access_plan" || cmd === "remote_blueprint") { return { title: "Accès distant : plan OK", text: "La commande décrit le futur accès réservé à operateur_autorise et operateur_autorise uniquement.", bullets: [ "Pas de panneau admin public.", "Comptes séparés.", "Authentification forte.", "Actions admin journalisées.", "Désactivation d’urgence prévue." ], tags: ["accès renforcé", "2 personnes", "hors GitHub Pages"] }; } if (cmd === "market_snapshot") { return { title: "Snapshot marché : OK", text: "La commande résume l’état du marché chargé par Livecheck.", bullets: [ "Source principale utilisée.", "Capitalisation globale.", "Volume 24h.", "BTC / ETH comme repères." ], tags: ["marché", "lecture live"] }; } if (cmd.startsWith("asset ")) { return { title: "Lecture actif : OK", text: "La commande a récupéré les données d’une crypto chargée dans le tableau.", bullets: [ "Prix.", "Variation 24h / 7j.", "Type d’actif.", "Score de veille.", "Limites : pas sécurité contrat, pas social, pas on-chain." ], tags: ["actif", "observation"] }; } if (cmd.startsWith("chart ")) { return { title: "Graphique mis à jour", text: "La commande a sélectionné l’actif et la période dans le panneau graphique.", bullets: [ "Le graphique change dans la zone Analyste.", "Le score et le détail actif se synchronisent.", "Ce n’est pas un signal d’achat." ], tags: ["graphique", "analyste"] }; } if (cmd === "simulation_profile") { return { title: "Profil simulateur : OK", text: "Le profil Solo Débutant 100 € est actif.", bullets: [ "Capital virtuel : 100 €.", "Cryptos autorisées : BTC, ETH, SOL.", "Ticket conseillé : 5 €.", "Maximum opération : 10 €.", "Exposition maximale : 30 €." ], tags: ["profil 100 €", "débutant", "simulation"] }; } if (cmd === "portfolio" || cmd.startsWith("sim_") || cmd === "reset_sim") { return { title: "Simulation : OK", text: "La commande agit uniquement sur le portefeuille virtuel local.", bullets: [ "Aucun argent réel.", "Aucun wallet connecté.", "Aucune clé API.", "Stockage local navigateur.", "Profil actif : 100 € virtuels, ticket conseillé 5 €, maximum 10 €." ], tags: ["paper trading", "profil 100 €", "simulation only"] }; } if (cmd === "sources") { return { title: "Sources : diagnostic OK", text: "La commande affiche l’état des sources interrogées.", bullets: [ "CoinGecko est critique pour le tableau.", "Les sources secondaires peuvent échouer sans bloquer si CoinGecko répond.", "Les erreurs restent visibles." ], tags: ["diagnostic", "sources"] }; } return { title: "Test exécuté", text: "Le bouton a répondu correctement. La partie importante est cette carte, pas les détails techniques.", bullets: [ "Résultat reçu.", "Validation humaine.", "Mode observation only." ], tags: ["OK", "dry-run"] };
} function renderHumanCommand(result) { if (!els.commandHuman) return; const summary = humanCommandSummary(result); els.commandHuman.classList.toggle("ok", result?.ok !== false); els.commandHuman.classList.toggle("err", result?.ok === false); const bullets = summary.bullets.map(item => `<li>${escapeHtml(item)}</li>`).join(""); const tags = summary.tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join(""); els.commandHuman.innerHTML = ` <b>${escapeHtml(summary.title)}</b> <p>${escapeHtml(summary.text)}</p> <ul>${bullets}</ul> <div class="cmd-tags">${tags}</div> `;
} function renderCommandOutput(result) { renderHumanCommand(result); if (els.commandOutput) { els.commandOutput.textContent = ""; }
} function runCommandFromInput(commandText = null) { const text = commandText ?? els.commandInput?.value ?? ""; if (els.commandInput && commandText !== null) { const label = document.querySelector(`.cmd-preset[data-command="${CSS.escape(commandText)}"]`)?.textContent?.trim(); els.commandInput.value = label || commandText; } const result = parseCommandLine(text); if (els.commandOutput) els.commandOutput.dataset.userRan = "1"; renderCommandOutput(result);
} 

/* =========================================================
   V2.0-alpha · Build 28.1 — NEWS SENTINEL SOURCE INTELLIGENCE
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
  const rawRecords = typeof readAutoMemory === "function" ? readAutoMemory() : [];
  const records = [...rawRecords]
    .filter(record => record && record.saved_at)
    .sort((a, b) => Date.parse(a.saved_at || 0) - Date.parse(b.saved_at || 0));
  const collectors = [...new Set(records.map(r => r.collector_id || "local-legacy").filter(Boolean))];
  const last = records.length ? records[records.length - 1] : null;
  const lastCollector = last?.collector_id || "local-legacy";
  const previous = last
    ? [...records].reverse().find(r => r !== last && (r.collector_id || "local-legacy") === lastCollector && Array.isArray(r.assets)) || null
    : null;
  return { records, collectors, last, previous, lastCollector, comparable: !!(last && previous) };
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
    .map(x => `${String(x.asset.symbol || x.asset.name || "ACTIF").toUpperCase()} ${x.delta >= 0 ? "+" : ""}${x.delta.toFixed(2)} % depuis le relevé comparable`);
}

function atlasDecisionIsAnomaly(c) {
  if (!c) return false;
  const change = Math.abs(Number(c.change24h || 0));
  const ratio = atlasDecisionRatio(c);
  const score = scoreCoin(c).score;
  return change >= 7 || ratio >= 0.08 || Number(score || 0) < 40;
}

function atlasDecisionAnomalyReason(c) {
  const reasons = [];
  const change = Math.abs(Number(c.change24h || 0));
  const ratio = atlasDecisionRatio(c);
  const score = scoreCoin(c).score;
  if (change >= 7) reasons.push(`mouvement 24 h ${atlasDecisionPct(c.change24h)}`);
  if (ratio >= 0.08) reasons.push(`vol/cap ${(ratio * 100).toFixed(2)} %`);
  if (Number(score || 0) < 40) reasons.push(`score ${score ?? "—"}`);
  return reasons.join(" · ") || "vérification requise";
}

function atlasDecisionAnchorCoins(coins) {
  const ids = ["bitcoin", "ethereum", "solana"];
  return ids.map(id => (coins || []).find(c => c.id === id)).filter(Boolean);
}

function atlasDecisionBreadth(coins) {
  const values = (coins || []).filter(c => typeof c.change24h === "number");
  const up = values.filter(c => c.change24h > 0.5).length;
  const down = values.filter(c => c.change24h < -0.5).length;
  const flat = Math.max(0, values.length - up - down);
  return { total: values.length, up, down, flat };
}

function atlasDecisionSourceQuality(memory, okSources, totalSources) {
  const sourceRatio = totalSources > 0 ? okSources / totalSources : 0;
  const directReady = typeof atlasAnalysisLiveReady === "function" && atlasAnalysisLiveReady();
  const mode = state.sourceLock?.mode || "none";
  let confidence = "confiance prudente";
  if (directReady && sourceRatio >= 1 && memory.comparable && memory.records.length >= 20) confidence = "confiance correcte";
  else if (directReady && sourceRatio >= 0.5 && memory.records.length >= 5) confidence = "confiance moyenne";
  const label = directReady
    ? "données directes"
    : mode === "local-cache"
      ? "archive locale"
      : "snapshot récent conservé";
  return { sourceRatio, directReady, mode, confidence, label };
}

function renderDecisionBoard() {
  const status = document.getElementById("decisionBoardStatus");
  const grid = document.getElementById("decisionBoardGrid");
  const verdict = document.getElementById("decisionBoardVerdict");
  if (!grid) return;

  const memory = atlasDecisionMemoryStats();
  const okSources = (state.sourceStatus || []).filter(s => s.status === "OK").length;
  const totalSources = state.sourceStatusExpectedTotal || (state.sourceStatus || []).length || 0;

  if (!state.liveOk || !state.coins.length) {
    if (status) {
      status.textContent = "Livecheck requis";
      status.className = "pill warn";
    }
    grid.innerHTML = `
      <article class="decision-card"><b>Mouvements à vérifier</b><span>Livecheck requis · classement en attente.</span></article>
      <article class="decision-card"><b>Repères à comparer</b><span>BTC / ETH / SOL après source réelle.</span></article>
      <article class="decision-card"><b>Anomalies / prudence</b><span>La lecture démarre après réception d’un prix réel.</span></article>
      <article class="decision-card"><b>Lecture secteurs</b><span>En attente du tableau marché.</span></article>
      <article class="decision-card"><b>Mémoire comparable</b><span>${memory.records.length} snapshots · ${memory.collectors.length || 0} collecteur(s).</span></article>
      <article class="decision-card decision-card-wide"><b>Décision froide</b><span>Attendre le Livecheck · validation humaine avant toute décision.</span></article>
    `;
    if (verdict) {
      verdict.innerHTML = `
        <div class="decision-verdict-title">Décision Atlas : attendre le Livecheck</div>
        <div class="decision-verdict-body">
          <div><b>Situation marché</b><span>Aucune lecture sans source réelle active.</span></div>
          <div><b>Qualité des données</b><span>${memory.records.length} snapshots mémoire · ${memory.collectors.length || 0} collecteur(s).</span></div>
          <div><b>Action de travail</b><span>Lancer Livecheck, puis comparer BTC / ETH / SOL.</span></div>
        </div>
      `;
    }
    return;
  }

  const coins = [...state.coins];
  const nonStable = coins.filter(c => classifyAsset(c) !== "Stablecoin");
  const anomalies = coins
    .filter(atlasDecisionIsAnomaly)
    .sort((a, b) => Math.abs(Number(b.change24h || 0)) - Math.abs(Number(a.change24h || 0)))
    .slice(0, 4);
  const anomalyIds = new Set(anomalies.map(c => c.id));

  const observe = nonStable
    .filter(c => Number(c.change24h || 0) >= 2 && Number(c.change7d || 0) >= 0 && Number(scoreCoin(c).score || 0) >= 50 && !anomalyIds.has(c.id))
    .sort((a, b) => (Number(b.change24h || 0) + Number(b.change7d || 0) * 0.35) - (Number(a.change24h || 0) + Number(a.change7d || 0) * 0.35))
    .slice(0, 4);

  const anchors = atlasDecisionAnchorCoins(coins);
  const sectors = atlasDecisionSectorRows(coins);
  const deltas = atlasDecisionDeltaLines(memory.last, memory.previous);
  const breadth = atlasDecisionBreadth(coins);
  const quality = atlasDecisionSourceQuality(memory, okSources, totalSources);
  const selected = getSelectedCoin();
  const selectedScore = scoreCoin(selected);

  if (status) {
    status.textContent = `Mémoire ${memory.records.length} · ${quality.confidence}`;
    status.className = `pill ${quality.confidence === "confiance correcte" ? "ok" : "warn"}`;
  }

  const observeHtml = observe.length
    ? observe.map(c => `${String(c.symbol || c.name).toUpperCase()} · 24 h ${atlasDecisionPct(c.change24h)} · 7 j ${atlasDecisionPct(c.change7d)} · mouvement à confirmer`).join("<br>")
    : "Aucun mouvement haussier confirmé · conserver une observation neutre.";

  const compareHtml = anchors.length
    ? anchors.map(c => `${String(c.symbol || c.name).toUpperCase()} · 24 h ${atlasDecisionPct(c.change24h)} · 7 j ${atlasDecisionPct(c.change7d)}`).join("<br>")
    : "Repères BTC / ETH / SOL indisponibles dans le snapshot actuel.";

  const anomaliesHtml = anomalies.length
    ? anomalies.map(c => `${String(c.symbol || c.name).toUpperCase()} · ${atlasDecisionAnomalyReason(c)}`).join("<br>")
    : "Pas d’anomalie majeure détectée dans le tableau actuel.";

  const allSectorNegative = sectors.length > 0 && sectors.every(s => Number(s.avg24 || 0) < 0);
  const sectorsHtml = sectors.length
    ? `${allSectorNegative ? "Aucun secteur positif sur 24 h.<br>" : ""}${sectors.map(s => `${escapeHtml(s.key)} · ${atlasDecisionPct(s.avg24)} · repère ${escapeHtml(s.best?.symbol || "—")}`).join("<br>")}`
    : "Secteurs en attente.";

  const memoryHtml = [
    `${memory.records.length} snapshots locaux`,
    `${memory.collectors.length || 0} collecteur(s)`,
    memory.last?.saved_at ? `dernier comparable : ${new Date(memory.last.saved_at).toLocaleTimeString("fr-FR")} · ${escapeHtml(memory.lastCollector)}` : "dernier : en attente",
    memory.comparable ? (deltas.length ? deltas.join("<br>") : "écart insuffisant entre deux relevés du même collecteur") : "comparaison suspendue : aucun relevé antérieur du même collecteur"
  ].join("<br>");

  const selectedLine = selected
    ? `${escapeHtml(selected.symbol || selected.name)} · 24 h ${atlasDecisionPct(selected.change24h)} · 7 j ${atlasDecisionPct(selected.change7d)} · score ${selectedScore.score ?? "—"}`
    : "Actif courant indisponible";
  const coldHtml = [
    `Actif courant : ${selectedLine}`,
    `Action : ${escapeHtml(selected ? atlasActionForCoin(selected) : "Attendre")}`,
    `Données : ${escapeHtml(quality.label)} · ${okSources}/${totalSources || "?"} source(s)`,
    "Règle : observer / comparer, validation humaine."
  ].join("<br>");

  grid.innerHTML = `
    <article class="decision-card"><b>Mouvements à vérifier</b><span>${observeHtml}</span></article>
    <article class="decision-card"><b>Repères à comparer</b><span>${compareHtml}</span></article>
    <article class="decision-card"><b>Anomalies / prudence</b><span>${anomaliesHtml}</span></article>
    <article class="decision-card"><b>Lecture secteurs</b><span>${sectorsHtml}</span></article>
    <article class="decision-card"><b>Mémoire comparable</b><span>${memoryHtml}</span></article>
    <article class="decision-card decision-card-wide"><b>Décision froide</b><span>${coldHtml}</span></article>
  `;

  if (verdict) {
    const action = selected ? atlasActionForCoin(selected) : "Attendre";
    const anchorSummary = anchors.length
      ? anchors.map(c => `${escapeHtml(String(c.symbol || c.name).toUpperCase())} ${atlasDecisionPct(c.change24h)}`).join(" · ")
      : "BTC / ETH / SOL indisponibles";
    const riskFocus = anomalies.length
      ? anomalies.slice(0, 3).map(c => escapeHtml(String(c.symbol || c.name).toUpperCase())).join(" · ")
      : "aucune anomalie majeure";
    const memoryQuality = memory.comparable
      ? `comparaison interne au collecteur ${escapeHtml(memory.lastCollector)}`
      : "pas encore de paire comparable du même collecteur";

    verdict.innerHTML = `
      <div class="decision-verdict-title">Décision Atlas : ${escapeHtml(action)} · ${escapeHtml(quality.confidence)}</div>
      <div class="decision-verdict-body">
        <div>
          <b>Situation marché</b>
          <span>${breadth.up} hausses nettes · ${breadth.down} baisses nettes · ${breadth.flat} proches de l’équilibre sur ${breadth.total} actifs.</span>
        </div>
        <div>
          <b>Actif courant</b>
          <span>${selectedLine}. Lecture descriptive uniquement.</span>
        </div>
        <div>
          <b>Repères</b>
          <span>${anchorSummary}</span>
        </div>
        <div>
          <b>Qualité des données</b>
          <span>${escapeHtml(quality.label)} · ${okSources}/${totalSources || "?"} source(s) · ${memory.records.length} snapshots · ${memoryQuality}.</span>
        </div>
        <div>
          <b>Prudence</b>
          <span>${riskFocus}. ${escapeHtml(typeof window.atlasNewsDecisionRiskLine === "function" ? window.atlasNewsDecisionRiskLine() : "News Sentinel en attente. Sécurité, social et on-chain restent à confirmer.")}</span>
        </div>
        <div>
          <b>Action de travail</b>
          <span>Comparer au socle BTC / ETH / SOL, vérifier les mouvements rapides, attendre une confirmation mémoire. Validation humaine requise.</span>
        </div>
      </div>
    `;
  }
}

function renderAll(options = {}) {
  const refreshChart = options.refreshChart !== false;
  atlasRenderMarketAccessNotice(); atlasRenderBrokerStrip(); renderMetrics(); atlasRenderMarketCoreAtomic(); renderWatchlist(); renderScore(getSelectedCoin() || state.coins[0] || null); atlasEnsureSourceDock(getSelectedCoin() || state.coins[0] || null); renderRiskGrid(); renderColdRead(true); renderBeginnerSummary(); renderMultiHorizon(); atlasRenderComparisonControls(); renderDecisionBoard(); renderSimulation();
  const finish = () => { if (els.commandOutput && !els.commandOutput.dataset.userRan) { renderCommandOutput(CryptoCommands.market_snapshot()); } };
  if (refreshChart) requestAnimationFrame(() => { void renderAnalystPanel({ renderAll: true }); finish(); });
  else { atlasRefreshSelectedDetailOnly(); finish(); }
} function renderMetrics() { const g = state.global; if (g) { setText(els.metricMarketCap, num(g.total_market_cap?.eur, fmtCompactEUR.format.bind(fmtCompactEUR))); setText(els.metricMarketCapHint, `${state.coins.length} actifs CoinGecko · somme Top 50`); setText(els.metricVolume, num(g.total_volume?.eur, fmtCompactEUR.format.bind(fmtCompactEUR))); setText(els.metricVolumeHint, "Somme des volumes Top 50 · 24h"); const btc = g.market_cap_percentage?.btc; setText(els.metricBtcDom, typeof btc === "number" ? `${btc.toFixed(2)} %` : "Donnée manquante"); setText(els.metricBtcDomHint, "Part de BTC dans la capitalisation Top 50"); } updateSourceMetric();
} function atlasRibbonStyle(coin, fallbackIndex = 0) {
  const palette = atlasCryptoPalette(coin, fallbackIndex);
  const gradient = atlasCryptoGradientCss(coin, fallbackIndex);
  return `--crypto-color:${escapeHtml(palette.primary)};--crypto-gradient:${escapeHtml(gradient)}`;
}

function atlasTopFiveCoins() {
  return atlasCuratedTopCoins(5);
}

function atlasMarketFlowCoins() {
  const topFiveIds = new Set(atlasTopFiveCoins().map(coin => coin.id));
  return [...(state.coins || [])]
    .filter(coin => !topFiveIds.has(coin.id))
    .sort((a, b) => Number(a.rank || 9999) - Number(b.rank || 9999))
    .slice(0, 24);
}

function atlasRenderTopFiveRibbon() {
  if (!els.top5Track) return;
  if (!atlasHasDisplayableMarket()) {
    setHTML(els.top5Track, '<span class="market-ribbon-empty">Livecheck requis</span>');
    return;
  }

  const cards = atlasTopFiveCoins().map((coin, index) => {
    const variationClass = `${clsPct(coin.change24h)} ${atlasMoveStrengthClass(coin.change24h)}`;
    const image = coin.image
      ? `<img src="${escapeHtml(coin.image)}" alt="" loading="lazy">`
      : `<span class="top5-fallback">${escapeHtml(String(coin.symbol || "?").slice(0, 1))}</span>`;
    return `
      <span class="top5-item" data-top5-id="${escapeHtml(coin.id)}" data-market-open="${escapeHtml(coin.id)}" role="button" tabindex="0" aria-label="Ajouter ou retirer ${escapeHtml(coin.symbol)} de la comparaison" style="${atlasRibbonStyle(coin, index)}">
        <span class="top5-identity">${image}<b>${escapeHtml(String(coin.symbol || "").toUpperCase())}</b></span>
        <strong class="top5-price">${atlasFormatEUR(coin.priceEur ?? coin.price)}</strong>
        <small class="top5-change ${variationClass}">${atlasFmtMarketPct(coin.change24h)}</small>
      </span>`;
  }).join("");

  setHTML(els.top5Track, cards);
}

function atlasRenderMarketFlowRibbon() {
  if (!els.tickerTrack) return;
  if (!atlasHasDisplayableMarket()) {
    setHTML(
      els.tickerTrack,
      '<span class="ticker-meta">Livecheck requis · aucune donnée chiffrée chargée · pas de tableau fictif</span>'
    );
    return;
  }

  const flow = atlasMarketFlowCoins();
  const items = flow.map((coin, index) => {
    const variationClass = `${clsPct(coin.change24h)} ${atlasMoveStrengthClass(coin.change24h)}`;
    return `
      <span class="ticker-item" data-ticker-id="${escapeHtml(coin.id)}" data-market-open="${escapeHtml(coin.id)}" role="button" tabindex="0" aria-label="Ajouter ou retirer ${escapeHtml(coin.symbol)} de la comparaison" style="${atlasRibbonStyle(coin, index + 5)}">
        <i class="ticker-crypto-accent" aria-hidden="true"></i>
        <span class="ticker-symbol">${escapeHtml(coin.symbol)}</span>
        <span class="ticker-price">${atlasFormatEUR(coin.priceEur ?? coin.price)}</span>
        <span class="ticker-change ${variationClass}">${atlasFmtMarketPct(coin.change24h)}</span>
      </span>`;
  }).join("");

  const meta = `<span class="ticker-meta">Source : ${escapeHtml(state.mainSource)} · Heure : ${new Date(state.timestamp).toLocaleTimeString("fr-FR")}</span>`;
  const sequence = `<span class="ticker-sequence">${items}${meta}</span>`;
  setHTML(els.tickerTrack, `${sequence}${sequence}`);
}

function renderTicker() {
  atlasRenderTopFiveRibbon();
  atlasRenderMarketFlowRibbon();
}

function scoreCoin(c) {
  if (!c) return { score: null, label: "En attente", parts: {} };

  const usableSnapshot =
    atlasHasDisplayableMarket()
    && atlasCanonicalCoin(c)
    && state.sourceLock?.valid;

  if (!usableSnapshot) {
    return {
      score: null,
      label: state.sourceLock?.mode === "local-cache" ? "Archive indisponible" : "Données insuffisantes",
      parts: {}
    };
  }

  const parts = {
    information: 12,
    market: c.marketCap ? 14 : 6,
    liquidity: c.volume24h && c.marketCap
      ? clamp(3, 15, (c.volume24h / c.marketCap) * 350)
      : 4,
    momentum: typeof c.change24h === "number"
      ? clamp(1, 10, 8 - Math.abs(c.change24h) / 7)
      : 4,
    risk: 8
  };

  const base = (
    parts.information / 15 * 18
    + parts.market / 15 * 22
    + parts.liquidity / 15 * 22
    + parts.momentum / 10 * 18
    + parts.risk / 15 * 20
  );

  let penalty = 16;
  if (typeof c.change24h === "number" && Math.abs(c.change24h) > 18) penalty += 12;
  if (c.volume24h && c.marketCap && c.volume24h / c.marketCap < 0.01) penalty += 10;
  if (state.sourceLock?.mode === "direct-conserved") penalty += 3;
  else if (state.sourceLock?.mode !== "direct") penalty += 5;

  const score = Math.round(clamp(0, 100, base - penalty));

  let label = "Veille";
  if (score <= 40) label = "Données fragiles";
  else if (score <= 55) label = "Lecture prudente";
  else if (score <= 65) label = "Mouvement modéré";
  else if (score <= 75) label = "Mouvement marqué";
  else label = "Volatilité élevée";

  if (state.sourceLock?.mode === "direct-conserved") label = `${label} · conservé`;
  else if (state.sourceLock?.mode !== "direct") label = `${label} · archive`;

  return { score, label, parts };
}
function decisionFromScore(score) { if (score === null || score === undefined) return "Analyse suspendue"; if (score <= 40) return "Données fragiles"; if (score <= 55) return "Lecture prudente"; if (score <= 65) return "Mouvement modéré"; if (score <= 75) return "Mouvement marqué"; return "Volatilité élevée";
} 
function atlasMarketOpenCoin(coin,options={}){if(!coin?.id)return;options.compare?atlasToggleComparisonCoin(coin):atlasSelectMarketCoin(coin);$("analyste")?.scrollIntoView({behavior:"smooth",block:"start"});}
function atlasMarketEnsureWatchCoin(coin){if(!coin?.id)return;if(!state.watchIds.includes(coin.id)){state.watchIds.push(coin.id);state.watchIds=[...new Set(state.watchIds)].slice(0,48);saveWatchIds();atlasWatchSyncProfiles();}renderWatchlist();renderAutoReader();}
function atlasMarketPrepareAlert(coin){if(!coin?.id)return;atlasMarketEnsureWatchCoin(coin);renderWatchlist();const s=$("watchAlertCoin");if(s&&[...s.options].some(o=>o.value===coin.id))s.value=coin.id;atlasV2OpenAdvancedForTarget("#watchlist");setTimeout(()=>$("watchAlertThreshold")?.focus(),450);}
function atlasMarketOpenSources(coin){if(!coin?.id)return;atlasSelectMarketCoin(coin);if($("analyste")?.classList.contains("detail-collapsed"))$("detailPanelRail")?.click();const d=$("source-dock");if(d){d.open=true;atlasEnsureSourceDock(coin,{force:false});d.scrollIntoView({behavior:"smooth",block:"center"});}}
function atlasMarketHandleAction(action,coin,event){if(action==="open")atlasMarketOpenCoin(coin);else if(action==="compare")atlasToggleComparisonCoin(coin);else if(action==="watch")atlasMarketEnsureWatchCoin(coin);else if(action==="alert")atlasMarketPrepareAlert(coin);else if(action==="sources")atlasMarketOpenSources(coin);event?.preventDefault?.();}
function atlasInitMarketRibbonInteractions(){const act=e=>{const t=e.target.closest("[data-market-open]");if(!t)return;if(e.type==="keydown"&&!['Enter',' '].includes(e.key))return;const c=state.coins.find(x=>x.id===t.dataset.marketOpen);if(!c)return;if(e.type==="keydown")e.preventDefault();atlasToggleComparisonCoin(c);};els.top5Track?.addEventListener("click",act);els.top5Track?.addEventListener("keydown",act);els.tickerTrack?.addEventListener("click",act);els.tickerTrack?.addEventListener("keydown",act);}

function renderMarketTable() {
  if(!els.marketRows)return;
  atlasChartV2SyncControls();
  if(!atlasHasDisplayableMarket()){renderEmptyMarket("Livecheck requis. Aucun prix inventé.");return;}
  if(!state.liveOk)state.liveOk=true;
  const q=(els.searchInput?.value||"").toLowerCase().trim();
  const rows=sortAssets(state.coins.filter(c=>!q||c.name.toLowerCase().includes(q)||c.symbol.toLowerCase().includes(q)).filter(matchAssetFilter)).slice(0,50);
  if(!rows.length){renderEmptyMarket("Aucun actif ne correspond au filtre.");return;}
  const selection=atlasComparisonIds(),profiles=atlasWatchReadProfiles();
  els.marketRows.innerHTML=rows.map(c=>{
    const s=scoreCoin(c),compared=selection.includes(c.id),primary=c.id===state.selectedCoinId&&compared,watched=state.watchIds.includes(c.id);
    const compareLabel=compared?"Retirer":"Ajouter";
    return `<tr class="asset-row ${primary?'is-selected':''} ${compared?'is-compared':''}" data-id="${escapeHtml(c.id)}" data-market-help-id="${escapeHtml(c.id)}" data-crypto-id="${escapeHtml(c.id)}" style="${atlasRibbonStyle(c,Math.max(0,Number(c.rank||1)-1))}" tabindex="0" role="button" aria-pressed="${compared?'true':'false'}" aria-label="${escapeHtml(`${c.name}. ${compared?'Retirer de':'Ajouter à'} la comparaison.`)}"><td>${c.rank??'—'}</td><td><div class="coin-cell"><i class="market-identity-rail"></i>${c.image?`<img src="${escapeHtml(c.image)}" alt="" loading="lazy">`:''}<div><strong>${escapeHtml(c.name)}</strong><br><small>${escapeHtml(c.symbol)}</small><br><span class="asset-badge">${escapeHtml(classifyAsset(c))}</span></div></div></td><td><div class="price-dual"><b>${atlasFormatEUR(c.priceEur??c.price)}</b><small>${atlasHasPositiveQuote(c.priceUsd)?atlasFormatUSD(c.priceUsd):'USD —'}</small></div></td><td class="market-move-cell ${clsPct(c.change24h)} ${atlasMoveStrengthClass(c.change24h)}">${atlasFmtMarketPct(c.change24h)}</td><td class="${clsPct(c.change7d)}">${fmtPct(c.change7d)}</td><td class="market-col-advanced">${num(c.marketCap,fmtCompactEUR.format.bind(fmtCompactEUR))}</td><td class="market-col-advanced">${num(c.volume24h,fmtCompactEUR.format.bind(fmtCompactEUR))}</td><td class="spark-cell"><div class="spark-control"><button class="graph-row-toggle ${compared?'is-on':''}" type="button" data-market-action="compare" data-coin-id="${escapeHtml(c.id)}" aria-pressed="${compared?'true':'false'}" aria-label="${compareLabel} ${escapeHtml(c.symbol)} ${compared?'de':'à'} la comparaison">${compareLabel}</button>${sparkSvg(c)}</div></td><td class="market-col-advanced">${s.score??'—'}</td><td class="market-col-advanced">${beginnerDecision(c)}</td><td><div class="market-row-actions"><button type="button" data-market-action="open" data-coin-id="${escapeHtml(c.id)}">Solo</button><button type="button" data-market-action="watch" data-coin-id="${escapeHtml(c.id)}" class="${watched?'is-on':''}">${watched?'Suivi':'Suivre'}</button><button type="button" data-market-action="alert" data-coin-id="${escapeHtml(c.id)}">Alerte</button><button type="button" data-market-action="sources" data-coin-id="${escapeHtml(c.id)}">Sources</button></div>${profiles[c.id]?.note?`<small class="market-watch-note">${escapeHtml(profiles[c.id].note)}</small>`:''}</td></tr>`;
  }).join("");
  const updated=state.timestamp?new Date(state.timestamp).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}):"—";
  const essential=atlasV2Mode()==="essential";
  setText(els.tableNote,essential?`${rows.length} actifs · ${selection.length} sélectionnés · ${state.mainSource} · mise à jour ${updated}`:`${rows.length} affichés · ${state.coins.length} chargés · colonnes ${state.chartViewV2.marketColumns==='complete'?'complètes':'essentielles'} · sélection ${selection.length}/${ATLAS_COMPARISON_MAX_SERIES} · filtre ${state.assetFilter} · tri ${state.sortKey} · source ${state.mainSource} · ${updated}`);
  [...els.marketRows.querySelectorAll("tr[data-id]")].forEach(row=>{const act=e=>{const key=e.type==="keydown";if(key&&!['Enter',' '].includes(e.key))return;if(e.target!==row&&e.target.closest("button,a,input,select"))return;if(key)e.preventDefault();const c=state.coins.find(x=>x.id===row.dataset.id);if(c)atlasToggleComparisonCoin(c);};row.addEventListener("click",act);row.addEventListener("keydown",act);});
  els.marketRows.querySelectorAll("[data-market-action]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();atlasMarketHandleAction(b.dataset.marketAction,state.coins.find(c=>c.id===b.dataset.coinId),e);}));
} function renderEmptyMarket(message) { if (els.marketRows) { els.marketRows.innerHTML = `<tr><td colspan="11" class="empty">${escapeHtml(message)}</td></tr>`; } setText(els.tableNote, "Pas de source live, pas de prix.");
} 
function atlasMathScoreBand(score) {
  const value = Number(score);

  if (!Number.isFinite(value)) {
    return { id: "neutral", color: "#8EA4BA", label: "Analyse suspendue" };
  }

  if (value < 25) {
    return { id: "red", color: "#FF5C78", label: "Données insuffisantes" };
  }

  if (value < 55) {
    return { id: "orange", color: "#FF9F1C", label: "Lecture prudente" };
  }

  if (value < 75) {
    return { id: "turquoise", color: "#42E8E0", label: "Lecture structurée" };
  }

  return { id: "green", color: "#64EFA0", label: "Lecture étayée" };
}


function renderScore(coin) {
  const mathShell = document.getElementById("math");
  if (mathShell && coin) {
    const palette = atlasCryptoPalette(coin, Math.max(0, Number(coin.rank || 1) - 1));
    mathShell.style.setProperty("--crypto-color", palette.primary);
    mathShell.style.setProperty("--crypto-gradient", atlasCryptoGradientCss(coin, Math.max(0, Number(coin.rank || 1) - 1)));
    mathShell.dataset.cryptoId = coin.id || "";
  } else if (mathShell) {
    mathShell.style.removeProperty("--crypto-color");
    mathShell.style.removeProperty("--crypto-gradient");
    delete mathShell.dataset.cryptoId;
  }
  const s = scoreCoin(coin);
  if (!els.scoreRing || !els.scoreValue || !els.scoreLabel || !els.scoreBreakdown) return;

  const scoreBand = atlasMathScoreBand(s.score);
  if (mathShell) {
    mathShell.style.setProperty("--math-score-color", scoreBand.color);
    mathShell.dataset.mathScoreBand = scoreBand.id;
  }
  els.scoreRing.style.setProperty("--math-score-color", scoreBand.color);
  els.scoreValue.style.setProperty("--math-score-color", scoreBand.color);
  els.scoreLabel.style.setProperty("--math-score-color", scoreBand.color);

  if (s.score === null) {
    els.scoreRing.style.setProperty("--score", 0);
    els.scoreValue.textContent = "—";
    els.scoreLabel.textContent = scoreBand.label;
    els.scoreBreakdown.innerHTML = ` <div><span>Information</span><b>—</b></div> <div><span>Marché</span><b>—</b></div> <div><span>Liquidité</span><b>—</b></div> <div><span>Momentum</span><b>—</b></div> <div><span>Pénalité</span><b>—</b></div>`;
    return;
  }

  els.scoreRing.style.setProperty("--score", s.score);
  els.scoreValue.textContent = s.score;
  els.scoreLabel.textContent = scoreBand.label;
  els.scoreBreakdown.innerHTML = ` <div><span>Information</span><b>${Math.round(s.parts.information)}/15</b></div> <div><span>Marché</span><b>${Math.round(s.parts.market)}/15</b></div> <div><span>Liquidité</span><b>${Math.round(s.parts.liquidity)}/15</b></div> <div><span>Momentum</span><b>${Math.round(s.parts.momentum)}/10</b></div> <div><span>Pénalité</span><b>active</b></div> <div class="why-box">${escapeHtml(whyDecision(coin))}</div>`;
} 
const WATCH_PROFILE_STORAGE_KEY = "agent_crypto_erith_ia_watch_profiles_v3";
const WATCH_ALERT_STORAGE_KEY = "agent_crypto_erith_ia_watch_alerts_v3";
const WATCH_ALERT_HISTORY_KEY = "agent_crypto_erith_ia_watch_alert_history_v3";
const WATCH_ALERT_MAX = 48;
const WATCH_ALERT_HISTORY_MAX = 160;
const WATCH_ALERT_COOLDOWN_MS = 15 * 60 * 1000;

function atlasWatchReadJson(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "null");
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function atlasWatchWriteJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function atlasWatchReadProfiles() {
  const value = atlasWatchReadJson(WATCH_PROFILE_STORAGE_KEY, {});
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function atlasWatchWriteProfiles(profiles) {
  atlasWatchWriteJson(WATCH_PROFILE_STORAGE_KEY, profiles || {});
}

function atlasWatchReadAlerts() {
  const value = atlasWatchReadJson(WATCH_ALERT_STORAGE_KEY, []);
  return Array.isArray(value) ? value.slice(0, WATCH_ALERT_MAX) : [];
}

function atlasWatchWriteAlerts(alerts) {
  atlasWatchWriteJson(WATCH_ALERT_STORAGE_KEY, (alerts || []).slice(0, WATCH_ALERT_MAX));
}

function atlasWatchReadHistory() {
  const value = atlasWatchReadJson(WATCH_ALERT_HISTORY_KEY, []);
  return Array.isArray(value) ? value.slice(-WATCH_ALERT_HISTORY_MAX) : [];
}

function atlasWatchWriteHistory(history) {
  atlasWatchWriteJson(WATCH_ALERT_HISTORY_KEY, (history || []).slice(-WATCH_ALERT_HISTORY_MAX));
}

function atlasWatchMetricDefinition(metric) {
  const definitions = {
    price_eur: { label: "Prix EUR", unit: "€" },
    change_24h: { label: "Variation 24 h", unit: "%" },
    math_score: { label: "Score Math", unit: "/100" },
    volume_24h: { label: "Volume 24 h EUR", unit: "€" }
  };
  return definitions[metric] || definitions.price_eur;
}

function atlasWatchMetricValue(coin, metric) {
  if (!coin) return null;
  if (metric === "price_eur") {
    const value = Number(coin.priceEur ?? coin.price);
    return Number.isFinite(value) ? value : null;
  }
  if (metric === "change_24h") {
    const value = Number(coin.change24h);
    return Number.isFinite(value) ? value : null;
  }
  if (metric === "math_score") {
    const value = Number(scoreCoin(coin)?.score);
    return Number.isFinite(value) ? value : null;
  }
  if (metric === "volume_24h") {
    const value = Number(coin.volume);
    return Number.isFinite(value) ? value : null;
  }
  return null;
}

function atlasWatchFormatMetric(metric, value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  if (metric === "price_eur") return atlasFormatEUR(number);
  if (metric === "change_24h") return `${number >= 0 ? "+" : ""}${number.toFixed(2)} %`;
  if (metric === "math_score") return `${Math.round(number)}/100`;
  if (metric === "volume_24h") {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      notation: "compact",
      maximumFractionDigits: 2
    }).format(number);
  }
  return String(number);
}

function atlasWatchOperatorLabel(operator) {
  return operator === "lte" ? "≤" : "≥";
}

function atlasWatchConditionReached(operator, current, threshold) {
  if (!Number.isFinite(Number(current)) || !Number.isFinite(Number(threshold))) return false;
  return operator === "lte"
    ? Number(current) <= Number(threshold)
    : Number(current) >= Number(threshold);
}

function atlasWatchSyncProfiles() {
  const profiles = atlasWatchReadProfiles();
  const now = new Date().toISOString();

  (state.watchIds || []).forEach((coinId, order) => {
    const coin = watchCoinById(coinId);
    const previous = profiles[coinId] || {};
    profiles[coinId] = {
      id: coinId,
      addedAt: previous.addedAt || now,
      note: String(previous.note || "").slice(0, 120),
      order,
      lastSeenAt: coin ? now : previous.lastSeenAt || null,
      lastPriceEur: coin ? atlasWatchMetricValue(coin, "price_eur") : previous.lastPriceEur ?? null,
      lastChange24h: coin ? atlasWatchMetricValue(coin, "change_24h") : previous.lastChange24h ?? null,
      lastMathScore: coin ? atlasWatchMetricValue(coin, "math_score") : previous.lastMathScore ?? null,
      lastVolume24h: coin ? atlasWatchMetricValue(coin, "volume_24h") : previous.lastVolume24h ?? null
    };
  });

  Object.keys(profiles).forEach(coinId => {
    if (!(state.watchIds || []).includes(coinId)) delete profiles[coinId];
  });

  atlasWatchWriteProfiles(profiles);
  return profiles;
}

function atlasWatchSetProfileNote(coinId, note) {
  const profiles = atlasWatchReadProfiles();
  const current = profiles[coinId] || { id: coinId, addedAt: new Date().toISOString() };
  profiles[coinId] = { ...current, note: String(note || "").trim().slice(0, 120) };
  atlasWatchWriteProfiles(profiles);
}

function atlasWatchAddHistory(entry) {
  const history = atlasWatchReadHistory();
  history.push(entry);
  atlasWatchWriteHistory(history);
}

function atlasWatchEvaluateAlerts() {
  const alerts = atlasWatchReadAlerts();
  const history = atlasWatchReadHistory();
  const now = Date.now();
  let changed = false;
  let triggeredNow = 0;

  for (const alert of alerts) {
    if (!alert.enabled) {
      if (alert.lastState !== "disabled") {
        alert.lastState = "disabled";
        changed = true;
      }
      continue;
    }

    const coin = watchCoinById(alert.coinId);
    const current = atlasWatchMetricValue(coin, alert.metric);

    if (!Number.isFinite(Number(current))) {
      if (alert.lastState !== "unavailable") {
        alert.lastState = "unavailable";
        alert.lastEvaluatedAt = new Date(now).toISOString();
        changed = true;
      }
      continue;
    }

    const reached = atlasWatchConditionReached(alert.operator, current, alert.threshold);
    const previousReached = alert.lastState === "reached";
    alert.lastValue = Number(current);
    alert.lastEvaluatedAt = new Date(now).toISOString();
    alert.lastState = reached ? "reached" : "watching";

    if (reached && !previousReached) {
      const previousTrigger = Date.parse(alert.lastTriggeredAt || "") || 0;
      if (now - previousTrigger >= WATCH_ALERT_COOLDOWN_MS) {
        alert.lastTriggeredAt = new Date(now).toISOString();
        const definition = atlasWatchMetricDefinition(alert.metric);
        const symbol = String(coin?.symbol || alert.coinId).toUpperCase();
        history.push({
          id: `watch_trigger_${now}_${Math.random().toString(36).slice(2, 8)}`,
          alertId: alert.id,
          coinId: alert.coinId,
          symbol,
          metric: alert.metric,
          metricLabel: definition.label,
          operator: alert.operator,
          threshold: Number(alert.threshold),
          observed: Number(current),
          note: String(alert.note || ""),
          source: state.mainSource || "marché chargé",
          marketTimestamp: state.timestamp || null,
          triggeredAt: new Date(now).toISOString()
        });
        triggeredNow += 1;
      }
    }

    changed = true;
  }

  if (changed) atlasWatchWriteAlerts(alerts);
  if (triggeredNow) atlasWatchWriteHistory(history);

  return {
    alerts,
    history: triggeredNow ? history.slice(-WATCH_ALERT_HISTORY_MAX) : atlasWatchReadHistory(),
    triggeredNow
  };
}

function atlasWatchPopulateAlertCoins() {
  const select = $("watchAlertCoin");
  if (!select) return;
  const previous = select.value;
  const profiles = atlasWatchReadProfiles();

  select.innerHTML = (state.watchIds || []).map(coinId => {
    const coin = watchCoinById(coinId);
    const symbol = String(coin?.symbol || coinId).toUpperCase();
    const name = coin?.name || coinId;
    const note = profiles[coinId]?.note ? ` · ${profiles[coinId].note}` : "";
    return `<option value="${escapeHtml(coinId)}">${escapeHtml(symbol)} · ${escapeHtml(name)}${escapeHtml(note)}</option>`;
  }).join("");

  if ([...select.options].some(option => option.value === previous)) select.value = previous;
}

function atlasWatchAlertStateLabel(alert) {
  if (!alert.enabled) return { label: "Désactivée", tone: "disabled" };
  if (alert.lastState === "reached") return { label: "Condition atteinte", tone: "reached" };
  if (alert.lastState === "unavailable") return { label: "Donnée indisponible", tone: "unavailable" };
  return { label: "En surveillance", tone: "watching" };
}

function atlasWatchRenderStatus(evaluation = null) {
  const alerts = evaluation?.alerts || atlasWatchReadAlerts();
  const history = evaluation?.history || atlasWatchReadHistory();
  const enabled = alerts.filter(alert => alert.enabled).length;
  const reached = alerts.filter(alert => alert.enabled && alert.lastState === "reached").length;
  const profiles = atlasWatchReadProfiles();

  setText($("watchMemoryCount"), `${Object.keys(profiles).length}`);
  setText($("watchConditionCount"), `${enabled}`);
  setText($("watchTriggeredCount"), `${reached}`);
  setText($("watchLastEvaluation"), new Date().toLocaleTimeString("fr-FR"));
  setText($("watchHistoryCount"), `${history.length} déclenchement${history.length > 1 ? "s" : ""}`);

  const memoryStatus = $("watchMemoryStatus");
  if (memoryStatus) {
    memoryStatus.textContent = `${Object.keys(profiles).length} actifs mémorisés`;
    memoryStatus.className = "pill ok";
  }

  const alertStatus = $("watchAlertStatus");
  if (alertStatus) {
    alertStatus.textContent = reached
      ? `${reached} condition${reached > 1 ? "s" : ""} atteinte${reached > 1 ? "s" : ""}`
      : `${enabled} condition${enabled > 1 ? "s" : ""} active${enabled > 1 ? "s" : ""}`;
    alertStatus.className = `pill ${reached ? "warn" : enabled ? "ok" : ""}`;
  }
}

function atlasWatchRenderMemoryAssets() {
  const container = $("watchMemoryAssets");
  if (!container) return;
  const profiles = atlasWatchReadProfiles();
  const rows = (state.watchIds || []).map(coinId => profiles[coinId]).filter(Boolean);

  if (!rows.length) {
    container.innerHTML = '<p class="watch-empty">Aucun actif mémorisé.</p>';
    return;
  }

  container.innerHTML = rows.map(profile => {
    const coin = watchCoinById(profile.id);
    const symbol = String(coin?.symbol || profile.id).toUpperCase();
    return `
      <article class="watch-memory-asset">
        <div>
          <b>${escapeHtml(symbol)}</b>
          <span>${escapeHtml(coin?.name || profile.id)}</span>
        </div>
        <strong>${escapeHtml(atlasWatchFormatMetric("price_eur", profile.lastPriceEur))}</strong>
        <small>24 h ${escapeHtml(atlasWatchFormatMetric("change_24h", profile.lastChange24h))} · Math ${escapeHtml(atlasWatchFormatMetric("math_score", profile.lastMathScore))}</small>
        <em>${profile.note ? escapeHtml(profile.note) : "Aucune note"}</em>
        <button type="button" data-watch-remove="${escapeHtml(profile.id)}" aria-label="Retirer ${escapeHtml(symbol)}">Retirer</button>
      </article>`;
  }).join("");
}

function atlasWatchRenderAlerts(evaluation = null) {
  const container = $("watchAlertList");
  if (!container) return;
  const alerts = evaluation?.alerts || atlasWatchReadAlerts();

  if (!alerts.length) {
    container.innerHTML = '<p class="watch-empty">Aucune condition enregistrée.</p>';
    return;
  }

  container.innerHTML = alerts.map(alert => {
    const coin = watchCoinById(alert.coinId);
    const symbol = String(coin?.symbol || alert.coinId).toUpperCase();
    const definition = atlasWatchMetricDefinition(alert.metric);
    const stateInfo = atlasWatchAlertStateLabel(alert);
    return `
      <article class="watch-alert-card" data-state="${stateInfo.tone}">
        <div class="watch-alert-card-head">
          <b>${escapeHtml(symbol)} · ${escapeHtml(definition.label)}</b>
          <span>${escapeHtml(stateInfo.label)}</span>
        </div>
        <strong>${escapeHtml(atlasWatchOperatorLabel(alert.operator))} ${escapeHtml(atlasWatchFormatMetric(alert.metric, alert.threshold))}</strong>
        <small>Observé : ${escapeHtml(atlasWatchFormatMetric(alert.metric, alert.lastValue))} · ${alert.lastEvaluatedAt ? new Date(alert.lastEvaluatedAt).toLocaleTimeString("fr-FR") : "non évalué"}</small>
        <em>${alert.note ? escapeHtml(alert.note) : "Aucune note"}</em>
        <div class="watch-alert-card-actions">
          <button type="button" data-watch-alert-toggle="${escapeHtml(alert.id)}">${alert.enabled ? "Pause" : "Activer"}</button>
          <button type="button" data-watch-alert-delete="${escapeHtml(alert.id)}">Supprimer</button>
        </div>
      </article>`;
  }).join("");
}

function atlasWatchRenderHistory(evaluation = null) {
  const container = $("watchHistoryList");
  if (!container) return;
  const history = evaluation?.history || atlasWatchReadHistory();

  if (!history.length) {
    container.innerHTML = '<p class="watch-empty">Aucun déclenchement mémorisé.</p>';
    return;
  }

  container.innerHTML = [...history].reverse().slice(0, 40).map(entry => `
    <article class="watch-history-item">
      <b>${escapeHtml(entry.symbol || entry.coinId)} · ${escapeHtml(entry.metricLabel || atlasWatchMetricDefinition(entry.metric).label)}</b>
      <span>${escapeHtml(atlasWatchOperatorLabel(entry.operator))} ${escapeHtml(atlasWatchFormatMetric(entry.metric, entry.threshold))} · observé ${escapeHtml(atlasWatchFormatMetric(entry.metric, entry.observed))}</span>
      <small>${new Date(entry.triggeredAt).toLocaleString("fr-FR")} · ${escapeHtml(String(entry.source || "marché chargé"))}</small>
      <em>${entry.note ? escapeHtml(entry.note) : "Décision humaine requise · aucun ordre automatique"}</em>
    </article>`).join("");
}

function atlasWatchRefreshV3() {
  atlasWatchSyncProfiles();
  atlasWatchPopulateAlertCoins();
  const evaluation = atlasWatchEvaluateAlerts();
  atlasWatchRenderStatus(evaluation);
  atlasWatchRenderMemoryAssets();
  atlasWatchRenderAlerts(evaluation);
  atlasWatchRenderHistory(evaluation);
  return evaluation;
}

function atlasWatchAddCondition() {
  const coinId = normalizeWatchId($("watchAlertCoin")?.value);
  const metric = String($("watchAlertMetric")?.value || "price_eur");
  const operator = $("watchAlertOperator")?.value === "lte" ? "lte" : "gte";
  const threshold = Number($("watchAlertThreshold")?.value);
  const note = String($("watchAlertNote")?.value || "").trim().slice(0, 140);

  if (!coinId || !(state.watchIds || []).includes(coinId)) return;
  if (!Number.isFinite(threshold)) {
    const input = $("watchAlertThreshold");
    input?.focus();
    return;
  }

  const alerts = atlasWatchReadAlerts();
  alerts.unshift({
    id: `watch_alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    coinId,
    metric,
    operator,
    threshold,
    note,
    enabled: true,
    createdAt: new Date().toISOString(),
    lastEvaluatedAt: null,
    lastTriggeredAt: null,
    lastState: "watching",
    lastValue: null
  });
  atlasWatchWriteAlerts(alerts.slice(0, WATCH_ALERT_MAX));

  if ($("watchAlertThreshold")) $("watchAlertThreshold").value = "";
  if ($("watchAlertNote")) $("watchAlertNote").value = "";
  atlasWatchRefreshV3();
}

function atlasWatchToggleCondition(alertId) {
  const alerts = atlasWatchReadAlerts();
  const alert = alerts.find(item => item.id === alertId);
  if (!alert) return;
  alert.enabled = !alert.enabled;
  alert.lastState = alert.enabled ? "watching" : "disabled";
  atlasWatchWriteAlerts(alerts);
  atlasWatchRefreshV3();
}

function atlasWatchDeleteCondition(alertId) {
  const alerts = atlasWatchReadAlerts().filter(item => item.id !== alertId);
  atlasWatchWriteAlerts(alerts);
  atlasWatchRefreshV3();
}

function atlasWatchRemoveAsset(coinId) {
  state.watchIds = (state.watchIds || []).filter(id => id !== coinId);
  saveWatchIds();

  const profiles = atlasWatchReadProfiles();
  delete profiles[coinId];
  atlasWatchWriteProfiles(profiles);

  atlasWatchWriteAlerts(atlasWatchReadAlerts().filter(alert => alert.coinId !== coinId));
  renderWatchlist();
  renderAutoReader();
}

function atlasWatchClearHistory() {
  if (!confirm("Vider l’historique local des conditions Watchlist ?")) return;
  localStorage.removeItem(WATCH_ALERT_HISTORY_KEY);
  atlasWatchRenderHistory({ history: [] });
  atlasWatchRenderStatus({ alerts: atlasWatchReadAlerts(), history: [] });
}

function renderWatchlist() {
  if (!els.watchCards) return;

  const selectedCount = (state.watchIds || []).length;
  if (els.watchBasketSummary) {
    els.watchBasketSummary.textContent = `Atlas Watchlist V3 · ${selectedCount} actifs mémorisés · ${ATLAS_WATCH_BASKETS.length} paniers · conditions évaluées sans nouvelle requête.`;
  }

  atlasWatchRefreshV3();

  if (!state.liveOk || !state.coins.length) {
    els.watchCards.innerHTML = '<div class="mini-card muted">Livecheck requis. La mémoire et les conditions restent conservées, sans inventer de prix.</div>';
    return;
  }

  const topMovers = state.coins
    .filter(coin => (state.watchIds || []).includes(coin.id))
    .filter(coin => typeof coin.change24h === "number")
    .slice()
    .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
    .slice(0, 6)
    .map(coin => `${escapeHtml(coin.symbol)} <b class="${clsPct(coin.change24h)}">${atlasFmtMarketPct(coin.change24h)}</b>`)
    .join(" · ");

  const basketRows = ATLAS_WATCH_BASKETS.map(basket => {
    const coins = watchBasketCoins(basket);
    const status = basketStatus(coins);
    const leaders = coins
      .slice()
      .sort((a, b) => Math.abs(Number(b.change24h) || 0) - Math.abs(Number(a.change24h) || 0))
      .slice(0, 4);
    const leaderText = leaders.length
      ? leaders.map(coin => `${escapeHtml(coin.symbol)} <b class="${clsPct(coin.change24h)}">${atlasFmtMarketPct(coin.change24h)}</b>`).join(" · ")
      : "aucun actif suivi visible";
    return `
      <article class="watch-compact-row ${status.mode}">
        <div>
          <b>${escapeHtml(basket.label)}</b>
          <span>${escapeHtml(basket.role)}</span>
        </div>
        <strong>${status.label}${typeof status.avg === "number" ? ` · ${fmtPct(status.avg)}` : ""}</strong>
        <em>${leaderText}</em>
        <small>${coins.length}/${basket.ids.filter(id => (state.watchIds || []).includes(id)).length || 0} actifs suivis visibles</small>
      </article>`;
  }).join("");

  els.watchCards.innerHTML = [
    `<div class="watch-v2-diagnostic compact">
      <b>Lecture Atlas V3 compacte</b>
      <span>${selectedCount} actifs mémorisés · ${state.coins.length} actifs marché chargés · mouvements : ${topMovers || "calmes ou indisponibles"}</span>
    </div>`,
    `<div class="watch-compact-list">${basketRows}</div>`
  ].join("");
} function renderRiskGrid() { if (!els.riskGrid) return; els.riskGrid.innerHTML = ` <div class="risk ${state.liveOk ? "ok" : "wait"}"><span>Marché</span><b>${state.sourceLock?.valid ? "Source Lock CoinGecko" : "Source canonique absente"}</b></div> <div class="risk warn"><span>Sécurité</span><b>${ATLAS_RELEASE}</b></div> <div class="risk warn"><span>Social</span><b>Non vérifié</b></div> <div class="risk warn"><span>On-chain</span><b>Non vérifié</b></div>`;
} function renderSourceGrid() { atlasRenderDiagnostics(); if (!els.sourceGrid) { renderSourceDiagnostic(); return; } if (!state.sourceStatus.length) { els.sourceGrid.innerHTML = liveSources.map(s => `<div class="source-item"><strong>${s.name}</strong><span>${s.kind}</span><span>En attente</span></div>` ).join(""); renderSourceDiagnostic(); return; } els.sourceGrid.innerHTML = state.sourceStatus.map(s => `<div class="source-item ${s.status === "OK" ? "ok" : s.status === "BACKEND" ? "warn" : "fail"}"> <strong>${s.name}</strong> <span>${s.kind}</span> <span>${s.status}${s.ms ? ` · ${s.ms} ms` : ""}</span> <span>${escapeHtml(s.detail || "")}</span> </div>` ).join(""); renderSourceDiagnostic();
} function atlasMarketTone() { if (!state.liveOk || !state.coins.length) return { label: "En attente", mode: "wait" }; const btc = state.coins.find(c => c.id === "bitcoin" || c.symbol === "BTC"); const eth = state.coins.find(c => c.id === "ethereum" || c.symbol === "ETH"); const avgTop = state.coins.slice(0, 10).reduce((s, c) => s + (Number(c.change24h) || 0), 0) / Math.max(1, Math.min(10, state.coins.length)); const btcMove = Number(btc?.change24h) || 0; const ethMove = Number(eth?.change24h) || 0; const momentum = (avgTop + btcMove + ethMove) / 3; if (momentum >= 4) return { label: "Marché très positif, risque FOMO élevé", mode: "hot" }; if (momentum >= 1) return { label: "Marché positif, observation active", mode: "ok" }; if (momentum <= -3) return { label: "Marché sous pression, prudence renforcée", mode: "cold" }; return { label: "Marché neutre à surveiller", mode: "calm" };
} function atlasTopSymbols(list, limit = 4) { return list.slice(0, limit).map(c => `${c.symbol} ${atlasFmtMarketPct(c.change24h)}`).join(" · ");
} function atlasDecisionBriefText() {
  if (!atlasAnalysisLiveReady()) return "ATLAS DECISION BRIEF\nMode archive ou snapshot incomplet : scores et conclusion suspendus. Les prix restent consultables.";
  const tone = atlasMarketTone();
  const nonStable = state.coins.filter(c => classifyAsset(c) !== "Stablecoin" && typeof c.change24h === "number");
  const hot = nonStable.slice().sort((a, b) => b.change24h - a.change24h).filter(c => c.change24h > 3);
  const cold = nonStable.slice().sort((a, b) => a.change24h - b.change24h).filter(c => c.change24h < -3);
  const hotText = hot.length ? atlasTopSymbols(hot, 5) : "aucun mouvement haussier majeur";
  const coldText = cold.length ? atlasTopSymbols(cold, 4) : "aucun décrochage majeur dans le top chargé";
  return [
    "ATLAS DECISION BRIEF",
    `État : ${tone.label}.`,
    `Snapshot marché : CoinGecko Top 50 EUR ; USD en enrichissement optionnel · ${atlasExactTimestampLabel(state.timestamp)}.`,
    "Prix EUR : marché CoinGecko direct. Prix USD : enrichissement CoinGecko optionnel, jamais estimé.",
    "Graphique : CoinGecko market_chart EUR direct uniquement ; dernier historique direct du navigateur conservé en secours.",
    `À observer : ${hotText}.`,
    `À protéger : ${coldText}.`,
    "Décision de travail : observer / comparer. Pas d’achat automatique, pas de FOMO, pas d’ordre réel."
  ].join("\n");
}
function renderTrustLock(live = false) {
  if (!els.trustLockText) return;
  const locked = !!live && atlasAnalysisLiveReady();
  els.trustLockText.classList.toggle("ok-lock", locked);
  els.trustLockText.classList.toggle("warn-lock", !locked);
  if (locked) {
    els.trustLockText.textContent = `SOURCE CANONIQUE · CoinGecko uniquement. Marché EUR : ${state.dataBroker.market?.mode || state.sourceLock.mode}. ` +
      "Prix EUR fournis par le marché CoinGecko ; USD ajouté seulement s’il est disponible, sans estimation. " +
      "Les sources secondaires servent au diagnostic, jamais au calcul des prix, du score, de la simulation ou du graphique. " +
      "En cas de panne, le dernier snapshot CoinGecko daté est conservé.";
  } else {
    els.trustLockText.textContent = "Marché EUR direct absent : prix archivés consultables, scores Atlas et simulation suspendus. Le flux USD reste optionnel.";
  }
}
function renderColdRead(live = false) { renderTrustLock(live); if (!els.coldRead) return; const box = els.coldRead.closest(".cold-read"); if (box) { box.classList.toggle("live", live); box.classList.toggle("offline", !live); } if (live) { els.coldRead.textContent = atlasDecisionBriefText(); } else { els.coldRead.textContent = "ATLAS DECISION BRIEFLivecheck absent. L’observatoire refuse d’afficher un tableau chiffré et ne donne aucune lecture de marché."; }
}  function analyzeFomo() { const text = els.fomoInput?.value.trim() || ""; if (!text) { setText(els.fomoOutput, "Écris ce qui déclenche la FOMO."); return; } const hasBigMove = /\+\s?\d{2,}|explos|pump|rate|raté|peur|vite|maintenant/i.test(text); setText( els.fomoOutput, `MODE NO-FOMO\n\nSignal émotionnel : ${hasBigMove ? "élevé" : "à vérifier"}\nDécision : position théorique interdite tant que l’analyse froide n’est pas faite.\n\nQuestions :\n1. La hausse est-elle déjà pricée ?\n2. Qui vend si tu entres maintenant ?\n3. Quelle source primaire confirme le signal ?\n4. Où est l’invalidation ?\n5. La perte maximale est-elle acceptée ?\n\nConclusion : une occasion ratée ne coûte rien. Une mauvaise position peut coûter très cher.` );
} const WATCH_STORAGE_KEY = "agent_crypto_erith_ia_watchlist_v2_alpha_26_8"; const ATLAS_WATCH_BASKETS = [ { key: "core", label: "Socle marché", role: "Repères marché.", ids: ["bitcoin", "ethereum", "solana", "binancecoin", "ripple"] }, { key: "liquidity", label: "Stablecoins / liquidité", role: "Flux et stabilité.", ids: ["tether", "usd-coin", "usds"] }, { key: "majors", label: "Grands actifs solides", role: "Grandes capitalisations.", ids: ["cardano", "tron", "dogecoin", "chainlink", "toncoin", "avalanche-2", "polkadot", "litecoin"] }, { key: "defi", label: "DeFi / oracles / RWA", role: "Infrastructure et tokenisation.", ids: ["chainlink", "uniswap", "aave", "ondo-finance", "maker", "pendle"] }, { key: "ai", label: "IA / compute / data", role: "Narratif IA et calcul.", ids: ["near", "bittensor", "render-token", "internet-computer"] }, { key: "l1l2", label: "Layer 1 / Layer 2", role: "Écosystèmes et scalabilité.", ids: ["sui", "aptos", "arbitrum", "optimism", "polygon-ecosystem-token"] }, { key: "speculative", label: "Spéculatif liquide", role: "Température du risque.", ids: ["dogecoin", "shiba-inu", "pepe"] }, { key: "privacy", label: "Privacy / risque réglementaire", role: "Flux atypiques.", ids: ["monero", "zcash"] }
]; const WATCH_ALIAS = { btc: "bitcoin", bitcoin: "bitcoin", eth: "ethereum", ethereum: "ethereum", sol: "solana", solana: "solana", bnb: "binancecoin", binance: "binancecoin", binancecoin: "binancecoin", xrp: "ripple", ripple: "ripple", usdt: "tether", tether: "tether", usdc: "usd-coin", "usd-coin": "usd-coin", usds: "usds", dai: "dai", ada: "cardano", cardano: "cardano", trx: "tron", tron: "tron", doge: "dogecoin", dogecoin: "dogecoin", link: "chainlink", chainlink: "chainlink", ton: "toncoin", toncoin: "toncoin", avax: "avalanche-2", avalanche: "avalanche-2", dot: "polkadot", polkadot: "polkadot", ltc: "litecoin", litecoin: "litecoin", uni: "uniswap", uniswap: "uniswap", aave: "aave", ondo: "ondo-finance", "ondo-finance": "ondo-finance", mkr: "maker", maker: "maker", sky: "maker", pendle: "pendle", near: "near", tao: "bittensor", bittensor: "bittensor", render: "render-token", rndr: "render-token", "render-token": "render-token", icp: "internet-computer", "internet-computer": "internet-computer", sui: "sui", apt: "aptos", aptos: "aptos", arb: "arbitrum", arbitrum: "arbitrum", op: "optimism", optimism: "optimism", pol: "polygon-ecosystem-token", matic: "polygon-ecosystem-token", polygon: "polygon-ecosystem-token", shib: "shiba-inu", "shiba-inu": "shiba-inu", pepe: "pepe", xmr: "monero", monero: "monero", zec: "zcash", zcash: "zcash"
}; function atlasWatchDefaultIds() { return [...new Set(ATLAS_WATCH_BASKETS.flatMap(b => b.ids))];
} function normalizeWatchId(value) { const raw = String(value || "").trim().toLowerCase(); if (!raw) return ""; return WATCH_ALIAS[raw] || raw.replace(/\s+/g, "-");
} function saveWatchIds() { try { localStorage.setItem(WATCH_STORAGE_KEY, JSON.stringify(state.watchIds)); } catch {}
} function loadWatchIds() {
  try {
    const raw = localStorage.getItem(WATCH_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed)) {
      const ids = [...new Set(parsed.map(normalizeWatchId).filter(Boolean))].slice(0, 48);
      if (ids.length) {
        state.watchIds = ids;
        atlasWatchSyncProfiles();
        return;
      }
    }
  } catch {}
  state.watchIds = atlasWatchDefaultIds();
  saveWatchIds();
  atlasWatchSyncProfiles();
} function addWatch() {
  const id = normalizeWatchId(els.watchInput?.value);
  if (!id) return;

  if (!state.watchIds.includes(id)) state.watchIds.push(id);
  state.watchIds = [...new Set(state.watchIds)].slice(0, 48);
  saveWatchIds();

  const note = String($("watchNoteInput")?.value || "").trim();
  atlasWatchSyncProfiles();
  if (note) atlasWatchSetProfileNote(id, note);

  if (els.watchInput) els.watchInput.value = "";
  if ($("watchNoteInput")) $("watchNoteInput").value = "";

  renderWatchlist();
  renderAutoReader();
} function seedWatch() {
  state.watchIds = atlasWatchDefaultIds();
  saveWatchIds();
  atlasWatchSyncProfiles();
  renderWatchlist();
  renderAutoReader();
} function watchCoinById(id) { return state.coins.find(c => c.id === id) || null;
} function watchBasketCoins(basket) { return basket.ids.filter(id => (state.watchIds || []).includes(id)).map(watchCoinById).filter(Boolean);
} function basketStatus(coins) { if (!coins.length) return { label: "À charger", mode: "wait", avg: null }; const avg = coins.reduce((s, c) => s + (Number(c.change24h) || 0), 0) / coins.length; const mode = avg > 3 ? "hot" : avg < -3 ? "cold" : "calm"; const label = mode === "hot" ? "En hausse" : mode === "cold" ? "Sous pression" : "Calme"; return { label, mode, avg };
} function publicMarketSnapshot() { const wanted = SIM_PROFILE.allowedSymbols; const coins = state.coins .filter(c => wanted.includes(String(c.symbol || "").toUpperCase())) .map(c => ({ id: c.id, symbol: String(c.symbol || "").toUpperCase(), name: c.name, price_eur: c.price, change_24h_pct: c.change24h, change_7d_pct: c.change7d, market_cap_eur: c.marketCap, volume_24h_eur: c.volume, source: state.mainSource?.name || "source live" })); return { generated_at: new Date().toISOString(), source: state.mainSource?.name || null, source_time: state.timestamp || null, live_ok: !!state.liveOk, public_only: true, assets: coins };
} function simulationDataSnapshot() { if (!state.sim) loadSimulation(); const totals = getSimulationTotals(); return { generated_at: new Date().toISOString(), version: ATLAS_RELEASE, public_only: true, warning: "Données publiques et simulation locale uniquement. Aucun compte réel, aucune clé API, aucun wallet.", profile: getSimulationProfileStatus(), simulation: simulationPayload(), totals: { cash_eur: state.sim.cash, positions_value_eur: totals.positionsValue, total_value_eur: totals.total, pnl_eur: totals.pnl }, market_snapshot: publicMarketSnapshot() };
} function learningFactsFromLogs() { if (!state.sim) loadSimulation(); const logs = state.sim.logs || []; const hasBuy = logs.some(l => l.type === "SIM_BUY"); const hasSell = logs.some(l => l.type === "SIM_SELL"); const hasTooBig = logs.some(l => String(l.message || "").includes("maximum par opération")); const hasForbidden = logs.some(l => String(l.message || "").includes("refusé. Autorisés")); const hasReserve = logs.some(l => String(l.message || "").includes("réserve minimale")); const hasLivecheckRefusal = logs.some(l => String(l.message || "").includes("Livecheck requis")); const facts = []; if (hasBuy) facts.push("Tu as testé au moins un achat simulé : l’app sait transformer un montant virtuel en position fictive."); if (hasSell) facts.push("Tu as testé une vente simulée : l’app sait réduire une position fictive."); if (hasTooBig) facts.push("Tu as déclenché la protection “montant trop gros” : le profil bloque toute opération au-dessus de 10 €."); if (hasForbidden) facts.push("Tu as déclenché la protection “crypto non autorisée” : le profil débutant reste limité à BTC / ETH / SOL."); if (hasReserve) facts.push("Tu as déclenché la protection “réserve minimale” : l’app empêche de dépasser 30 € exposés."); if (hasLivecheckRefusal) facts.push("Tu as vérifié la règle “pas de prix inventé” : le simulateur exige Livecheck avant d’agir."); if (!facts.length) { facts.push("Aucun test pédagogique important n’est encore enregistré. Lance les boutons du Mode École guidé pour générer une vraie mémoire."); } return facts;
} function positionLinesForMarkdown() { if (!state.sim) loadSimulation(); const positions = Object.keys(state.sim.positions || {}); if (!positions.length) return ["Aucune position simulée."]; return positions.map(sym => { const pos = state.sim.positions[sym]; const value = getPositionValue(sym); return `- ${sym} : ${fmtEUR.format(value)} simulés, quantité fictive ${Number(pos.qty || 0).toFixed(8)}.`; });
} function marketLinesForMarkdown() { const snap = publicMarketSnapshot(); if (!snap.live_ok || !snap.assets.length) { return ["Livecheck non disponible dans le résumé courant."]; } return snap.assets.map(asset => { const price = Number.isFinite(asset.price_eur) ? fmtEUR.format(asset.price_eur) : "prix manquant"; const ch24 = typeof asset.change_24h_pct === "number" ? `${asset.change_24h_pct >= 0 ? "+" : ""}${asset.change_24h_pct.toFixed(2)} %` : "variation manquante"; return `- ${asset.symbol} : ${price}, variation 24h ${ch24}.`; });
} function buildLearningJournalMarkdown() { if (!state.sim) loadSimulation(); const totals = getSimulationTotals(); const profile = getSimulationProfileStatus(); const facts = learningFactsFromLogs(); const lines = [ "# JOURNAL PÉDAGOGIQUE — Agent-Crypto @erith.IA", "", `Version : ${ATLAS_RELEASE}`, `Date locale : ${new Date().toISOString()}`, "", "## Statut sécurité", "", "- Simulation locale uniquement.", "- Aucun argent réel.", "- Aucune clé API.", "- Aucun wallet.", "- Validation humaine.", "", "## Profil actif", "", `- Profil : ${profile.profile}`, `- Capital virtuel initial : ${fmtEUR.format(profile.start_cash_eur)}`, `- Ticket conseillé : ${fmtEUR.format(profile.default_amount_eur)}`, `- Maximum par opération : ${fmtEUR.format(profile.max_per_operation_eur)}`, `- Exposition maximale : ${fmtEUR.format(profile.max_exposure_eur)}`, `- Réserve minimale : ${fmtEUR.format(profile.min_reserve_eur)}`, `- Cryptos autorisées : ${profile.allowed_symbols.join(" / ")}`, "", "## Résumé de session", "", `- Capital virtuel restant : ${fmtEUR.format(state.sim.cash)}`, `- Valeur positions simulées : ${fmtEUR.format(totals.positionsValue)}`, `- Total simulé : ${fmtEUR.format(totals.total)}`, `- P/L virtuel : ${totals.pnl >= 0 ? "+" : ""}${fmtEUR.format(totals.pnl)}`, "", "## Positions simulées", "", ...positionLinesForMarkdown(), "", "## Ce que j’ai appris", "", ...facts.map(f => `- ${f}`), "", "## Snapshot marché public", "", ...marketLinesForMarkdown(), "", "## Conclusion pédagogique", "", "Le simulateur sert à apprendre les règles de prudence avant toute connexion réelle. Les refus sont normaux : ils prouvent que le profil protège le capital virtuel.", "", "## Prochaine étape possible", "", "Construire une mémoire locale sur PC Ryzen 7 avec historique de snapshots, journaux de simulation et scoring pédagogique, sans clé réelle au départ." ]; return lines.join("\n");
} function renderLearningSummary() { const text = buildLearningJournalMarkdown(); if (els.simLearningOutput) els.simLearningOutput.textContent = text; return text;
} function downloadTextFile(filename, mimeType, text) { const blob = new Blob([text], { type: `${mimeType};charset=utf-8` }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
} function downloadLearningJournal() { const stamp = new Date().toISOString().slice(0, 10); downloadTextFile(`agent_crypto_journal_pedagogique_${stamp}.md`, "text/markdown", buildLearningJournalMarkdown()); renderLearningSummary();
} function downloadSimulationJSON() { const stamp = new Date().toISOString().slice(0, 10); const data = simulationDataSnapshot(); downloadTextFile(`agent_crypto_data_snapshot_${stamp}.json`, "application/json", JSON.stringify(data, null, 2)); if (els.simLearningOutput) { els.simLearningOutput.textContent = [ "DATA SNAPSHOT JSON PRÊT", "", "Contenu :", "- profil 100 € ;", "- simulation locale ;", "- positions fictives ;", "- logs de simulation ;", "- snapshot public BTC / ETH / SOL si Livecheck est actif.", "", "Sécurité :", "- aucune clé API ;", "- aucun wallet ;", "- aucun compte réel ;", "- aucune donnée personnelle." ].join("\n"); }
} const COLLECTOR_STORAGE_KEY = "agent_crypto_erith_ia_collector_v1_1_alpha_13";
const COLLECTOR_MAX_RECORDS = 500; function readCollectorMemory() { try { const raw = localStorage.getItem(COLLECTOR_STORAGE_KEY); const parsed = raw ? JSON.parse(raw) : []; return Array.isArray(parsed) ? parsed : []; } catch { return []; }
} function writeCollectorMemory(records) { const safe = Array.isArray(records) ? records.slice(-COLLECTOR_MAX_RECORDS) : []; localStorage.setItem(COLLECTOR_STORAGE_KEY, JSON.stringify(safe)); renderCollectorStatus(); renderCollectionProgress(); return safe;
} function collectorRecordReasonFromLogs(logs) { const messages = (logs || []).map(l => String(l.message || "")).join(" | "); const reasons = []; if (messages.includes("maximum par opération")) reasons.push("montant_trop_gros"); if (messages.includes("refusé. Autorisés")) reasons.push("crypto_non_autorisee"); if (messages.includes("réserve minimale")) reasons.push("plafond_ou_reserve"); if ((logs || []).some(l => l.type === "SIM_BUY")) reasons.push("achat_simule"); if ((logs || []).some(l => l.type === "SIM_SELL")) reasons.push("vente_simulee"); return reasons.length ? reasons : ["observation"];
} function makeCollectorRecord() { const snapshot = simulationDataSnapshot(); const logs = snapshot?.simulation?.logs || []; const marketAssets = snapshot?.market_snapshot?.assets || []; return { id: `snapshot_${Date.now()}`, saved_at: new Date().toISOString(), version: ATLAS_RELEASE, public_only: true, source: snapshot?.market_snapshot?.source || "source live", live_ok: !!snapshot?.market_snapshot?.live_ok, symbols: marketAssets.map(a => a.symbol), learning_tags: collectorRecordReasonFromLogs(logs), snapshot };
} function renderCollectorStatus() { const records = readCollectorMemory(); if (els.collectorCount) { els.collectorCount.textContent = records.length === 1 ? "1 snapshot enregistré" : `${records.length} snapshots enregistrés`; } const last = records[records.length - 1]; if (els.collectorLast) { els.collectorLast.textContent = last?.saved_at ? new Date(last.saved_at).toLocaleString("fr-FR") : "Aucun"; }
} function collectorPreview(records) { if (!records.length) { return [ "Mémoire locale vide.", "", "Conseil :", "1. Lance Livecheck.", "2. Lance quelques tests guidés.", "3. Clique “Enregistrer snapshot maintenant”." ].join("\n"); } const last = records[records.length - 1]; const lines = [ "MÉMOIRE LOCALE — DATA COLLECTOR", "", `Snapshots enregistrés : ${records.length}`, `Dernier snapshot : ${new Date(last.saved_at).toLocaleString("fr-FR")}`, `Symboles : ${(last.symbols || []).join(" / ") || "—"}`, `Tags apprentissage : ${(last.learning_tags || []).join(", ")}`, "", "Derniers enregistrements :" ]; records.slice(-8).reverse().forEach((record, index) => { const totals = record?.snapshot?.totals || {}; const exposure = totals.positions_value_eur ?? record?.snapshot?.profile?.current_exposure_eur ?? 0; lines.push( `${index + 1}. ${new Date(record.saved_at).toLocaleString("fr-FR")} · exposé ${fmtEUR.format(Number(exposure) || 0)} · ${(record.learning_tags || []).join(", ")}` ); }); lines.push(""); lines.push("Sécurité : mémoire locale navigateur uniquement. Aucune clé, aucun wallet, aucun compte réel."); return lines.join("\n");
} function showCollectorMemory() { const records = readCollectorMemory(); renderCollectorStatus(); if (els.collectorOutput) els.collectorOutput.textContent = collectorPreview(records);
} function saveCollectorSnapshot() { const records = readCollectorMemory(); const record = makeCollectorRecord(); records.push(record); const saved = writeCollectorMemory(records); if (els.collectorOutput) { els.collectorOutput.textContent = [ "SNAPSHOT ENREGISTRÉ", "", `Heure : ${new Date(record.saved_at).toLocaleString("fr-FR")}`, `Mémoire locale : ${saved.length}/${COLLECTOR_MAX_RECORDS} snapshots`, `Symboles : ${(record.symbols || []).join(" / ") || "—"}`, `Tags : ${(record.learning_tags || []).join(", ")}`, "", "Ce snapshot contient :", "- profil 100 € ;", "- simulation locale ;", "- positions fictives ;", "- logs pédagogiques ;", "- données publiques BTC / ETH / SOL si Livecheck est actif.", "", "Il ne contient pas :", "- clé API ;", "- wallet ;", "- compte réel ;", "- seed phrase ;", "- ordre réel." ].join("\n"); }
} function downloadCollectorJSON() { const records = readCollectorMemory(); const payload = { exported_at: new Date().toISOString(), version: ATLAS_RELEASE, public_only: true, warning: "Export mémoire locale public-compatible. Aucun compte réel, aucune clé API, aucun wallet.", count: records.length, records }; downloadTextFile( `agent_crypto_collector_memory_${new Date().toISOString().slice(0, 10)}.json`, "application/json", JSON.stringify(payload, null, 2) ); showCollectorMemory();
} function downloadCollectorJSONL() { const records = readCollectorMemory(); const header = { exported_at: new Date().toISOString(), version: ATLAS_RELEASE, public_only: true, type: "agent_crypto_collector_memory_jsonl_header" }; const lines = [JSON.stringify(header), ...records.map(r => JSON.stringify(r))]; downloadTextFile( `agent_crypto_collector_memory_${new Date().toISOString().slice(0, 10)}.jsonl`, "application/x-ndjson", lines.join("\n") ); showCollectorMemory();
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
} function buildMemoryReportMarkdown() { const records = readCollectorMemory(); const lines = [ "# RAPPORT MÉMOIRE LOCALE — Agent-Crypto @erith.IA", "", "Version : ${ATLAS_RELEASE}", `Date : ${new Date().toISOString()}`, "", "## Statut sécurité", "", "- Mémoire locale navigateur uniquement.", "- Données public-compatible.", "- Aucun compte réel.", "- Aucune clé API.", "- Aucun wallet.", "- Validation humaine.", "", "## Lecture mémoire", "", exploreMemoryText(records), "", "## Comparaison premier / dernier", "", compareMemoryText(records), "", "## Refus de sécurité", "", refusalSummaryText(records), "", "## Conclusion", "", "L’explorateur transforme les snapshots en lecture pédagogique. La prochaine vraie étape sera de déplacer ce principe vers une base locale plus solide sur PC Ryzen 7." ]; return lines.join("\n");
} function renderMemoryExplorer(text) { if (els.memoryExplorerOutput) els.memoryExplorerOutput.textContent = text;
} function exploreMemory() { renderMemoryExplorer(exploreMemoryText()); setActionFeedback("info", "Mémoire lue", "L’Explorateur affiche les snapshots, tags et refus observés.", els.memoryExplorerOutput);
} function compareMemory() { renderMemoryExplorer(compareMemoryText()); setActionFeedback("info", "Comparaison affichée", "L’Explorateur compare le premier et le dernier snapshot quand il y en a au moins deux.", els.memoryExplorerOutput);
} function summarizeRefusals() { renderMemoryExplorer(refusalSummaryText()); setActionFeedback("info", "Refus résumés", "Les refus de sécurité sont comptés et expliqués.", els.memoryExplorerOutput);
} function downloadMemoryReport() { const stamp = new Date().toISOString().slice(0, 10); const report = buildMemoryReportMarkdown(); downloadTextFile(`agent_crypto_rapport_memoire_${stamp}.md`, "text/markdown", report); renderMemoryExplorer(report); setActionFeedback("ok", "Rapport téléchargé", "Le rapport mémoire .md est prêt.", els.memoryExplorerOutput);
} function setActionFeedback(kind, title, text, target = null) { const el = els.actionFeedback || document.getElementById("actionFeedback"); if (!el) return; el.classList.remove("ok", "warn", "info", "neutral", "feedback-flash"); el.classList.add(kind || "neutral"); el.innerHTML = `<b>${escapeHtml(title)}</b><span>${escapeHtml(text)}</span>`; void el.offsetWidth; el.classList.add("feedback-flash"); if (target?.scrollIntoView) { target.scrollIntoView({ behavior: "smooth", block: "center" }); }
} function flashPanel(panel) { if (!panel) return; panel.classList.remove("feedback-flash"); void panel.offsetWidth; panel.classList.add("feedback-flash");
} function buildWakePlanText() { const records = readCollectorMemory(); const count = records.length; const last = records[count - 1]; const lastLine = last?.saved_at ? new Date(last.saved_at).toLocaleString("fr-FR") : "Aucun snapshot"; return [ "# NOTE DE REPRISE — Agent-Crypto @erith.IA", "", "Version : ${ATLAS_RELEASE}", `Date : ${new Date().toISOString()}`, "", "## État validé avant pause", "", "- Simulateur-école Solo Débutant 100 €.", "- Mode École guidé.", "- Refus visibles.", "- Journal pédagogique.", "- Data Collector local.", "- Explorateur de mémoire.", "- Plan de collecte guidé.", "- Feedback visuel ajouté.", "", "## Mémoire locale", "", `- Snapshots enregistrés : ${count}`, `- Dernier snapshot : ${lastLine}`, "- Objectif conseillé : 3 snapshots", "", "## Reprise au réveil", "", "1. Ouvrir la page publique.", "2. Faire Ctrl + F5.", "3. Vérifier : GitHub Pack ${ATLAS_RELEASE}.", "4. Lancer Livecheck.", "5. Aller dans Simulation.", "6. Si la mémoire affiche 2/3, cliquer “3 · Snapshot plus tard”.", "7. Cliquer “Comparer premier / dernier”.", "8. Lire la conclusion de l’Explorateur.", "9. Exporter le rapport mémoire .md si besoin.", "", "## Suite produit après repos", "", "Préparer V1.2-local-plan : architecture backend local Ryzen 7.", "", "## Sécurité", "", "- Aucun argent réel.", "- Aucune clé API.", "- Aucun wallet.", "- Aucun compte exchange.", "- Validation humaine.", "- Aucun trading automatique." ].join("\n");
} function showWakePlan() { const text = buildWakePlanText(); if (els.resumeAssistantOutput) els.resumeAssistantOutput.textContent = text; setActionFeedback("info", "Reprise affichée", "La note de reprise au réveil est prête dans le bloc Assistant de reprise.", els.resumeAssistantOutput);
} function downloadWakePlan() { const stamp = new Date().toISOString().slice(0, 10); const text = buildWakePlanText(); downloadTextFile(`agent_crypto_reprise_apres_pause_${stamp}.md`, "text/markdown", text); if (els.resumeAssistantOutput) els.resumeAssistantOutput.textContent = text; setActionFeedback("ok", "Reprise téléchargée", "Le fichier .md de reprise est prêt.", els.resumeAssistantOutput);
} function markPauseReady() { const records = readCollectorMemory(); const text = [ "PAUSE VALIDÉE", "", "État conseillé avant coupure :", "- Version : ${ATLAS_RELEASE}", `- Snapshots mémoire : ${records.length}`, "- Prochaine action : revenir plus tard, lancer Livecheck, créer le snapshot plus tard, comparer.", "", "Tu peux fermer sans perdre la mémoire locale tant que tu gardes le même navigateur et que tu n’effaces pas les données du site." ].join("\n"); if (els.resumeAssistantOutput) els.resumeAssistantOutput.textContent = text; setActionFeedback("ok", "Prêt pour pause", "Version de reprise préparée. Tu peux couper.", els.resumeAssistantOutput);
} function collectionCount() { return readCollectorMemory().length;
} function renderCollectionProgress() { const count = collectionCount(); const target = 3; const pct = Math.min(100, Math.round((count / target) * 100)); if (els.collectionProgressText) { els.collectionProgressText.textContent = `${Math.min(count, target)}/${target}`; } if (els.collectionProgressBar) { els.collectionProgressBar.style.width = `${pct}%`; } if (els.collectionProgressTitle) { if (count <= 0) els.collectionProgressTitle.textContent = "Objectif : créer un premier snapshot de référence"; else if (count === 1) els.collectionProgressTitle.textContent = "Objectif : ajouter un deuxième snapshot pour comparer"; else if (count === 2) els.collectionProgressTitle.textContent = "Objectif : ajouter un troisième snapshot pour stabiliser la lecture"; else els.collectionProgressTitle.textContent = "Objectif atteint : mémoire comparable"; }
} function collectionPlanText() { const count = collectionCount(); const records = readCollectorMemory(); const lines = [ "PLAN DE COLLECTE GUIDÉ", "", `Snapshots actuels : ${count}`, "", "Routine simple :", "1. Lancer Livecheck.", "2. Enregistrer un snapshot de référence.", "3. Lancer un test guidé : opération prudente ou refus.", "4. Enregistrer un snapshot après test.", "5. Revenir plus tard et enregistrer un troisième snapshot.", "6. Utiliser l’Explorateur pour comparer.", "", "Pourquoi 3 snapshots ?", "- 1 snapshot : on voit seulement un état.", "- 2 snapshots : on peut comparer premier / dernier.", "- 3 snapshots : on commence à voir une mini-tendance.", "", "État actuel :" ]; if (!count) { lines.push("- Aucun snapshot. Commence par “Snapshot de référence”."); } else { const last = records[records.length - 1]; lines.push(`- Dernier snapshot : ${new Date(last.saved_at).toLocaleString("fr-FR")}.`); lines.push(`- Tags : ${(last.learning_tags || []).join(", ") || "observation"}.`); if (count === 1) lines.push("- Prochaine action : créer un snapshot après test."); else if (count === 2) lines.push("- Prochaine action : créer un snapshot plus tard pour stabiliser la lecture."); else lines.push("- Tu peux maintenant utiliser “Comparer premier / dernier”."); } lines.push(""); lines.push("Sécurité : ces snapshots restent public-compatible, sans clé, sans wallet, sans compte réel."); return lines.join("\n");
} function saveCollectionSnapshot(kind) { const recordsBefore = collectionCount(); const record = makeCollectorRecord(); record.collection_kind = kind; record.collection_note = kind === "reference" ? "Snapshot de référence." : kind === "after_test" ? "Snapshot après test guidé." : "Snapshot plus tard pour comparaison."; const records = readCollectorMemory(); records.push(record); const saved = writeCollectorMemory(records); renderCollectionProgress(); const label = kind === "reference" ? "SNAPSHOT DE RÉFÉRENCE ENREGISTRÉ" : kind === "after_test" ? "SNAPSHOT APRÈS TEST ENREGISTRÉ" : "SNAPSHOT PLUS TARD ENREGISTRÉ"; const next = saved.length < 2 ? "Ajoute un snapshot après test pour pouvoir comparer." : saved.length < 3 ? "Tu peux déjà comparer. Un troisième snapshot donnera une lecture plus solide." : "Objectif 3 snapshots atteint : utilise l’Explorateur de mémoire."; if (els.collectionPlanOutput) { els.collectionPlanOutput.textContent = [ label, "", `Heure : ${new Date(record.saved_at).toLocaleString("fr-FR")}`, `Mémoire locale : ${saved.length}/500 snapshots`, `Progression objectif : ${Math.min(saved.length, 3)}/3`, `Type : ${record.collection_note}`, `Tags : ${(record.learning_tags || []).join(", ") || "observation"}`, "", next, "", "Rappel : aucun argent réel, aucune clé API, aucun wallet." ].join("\n"); } setActionFeedback("ok", "Snapshot enregistré", `Mémoire locale : ${saved.length}/3 pour la lecture guidée.`, els.collectionPlanOutput); if (recordsBefore === 0 && kind !== "reference") { if (els.collectionPlanOutput) { els.collectionPlanOutput.textContent += "\n\nNote : tu n’avais pas encore de référence. Ce snapshot servira quand même de premier point."; } }
} function buildCollectionPlanMarkdown() { const records = readCollectorMemory(); const lines = [ "# PLAN DE COLLECTE GUIDÉ — Agent-Crypto @erith.IA", "", "Version : ${ATLAS_RELEASE}", `Date : ${new Date().toISOString()}`, "", "## Objectif", "", "Construire une mémoire comparable avant le futur backend local Ryzen 7.", "", "## Règle", "", "- 1 snapshot : état isolé.", "- 2 snapshots : comparaison possible.", "- 3 snapshots : mini-tendance exploitable.", "", "## Routine", "", "1. Lancer Livecheck.", "2. Enregistrer un snapshot de référence.", "3. Lancer un test guidé.", "4. Enregistrer un snapshot après test.", "5. Revenir plus tard.", "6. Enregistrer un snapshot plus tard.", "7. Comparer premier / dernier dans l’Explorateur.", "", "## État actuel", "", `Snapshots enregistrés : ${records.length}`, "", ...records.slice(-10).map((record, index) => { const kind = record.collection_kind || "snapshot"; const tags = (record.learning_tags || []).join(", ") || "observation"; return `- ${index + 1}. ${new Date(record.saved_at).toLocaleString("fr-FR")} · ${kind} · ${tags}`; }), "", "## Sécurité", "", "- Données public-compatible.", "- Aucun compte réel.", "- Aucune clé API.", "- Aucun wallet.", "- Validation humaine.", "", "## Suite", "", "Quand la logique de collecte est claire, migrer vers une base locale plus solide : JSONL durable ou SQLite sur PC Ryzen 7." ]; return lines.join("\n");
} function showCollectionChecklist() { renderCollectionProgress(); const text = collectionPlanText(); if (els.collectionPlanOutput) els.collectionPlanOutput.textContent = text; flashPanel(document.getElementById("collectionPlanPanel")); setActionFeedback("info", "Routine de collecte affichée", "Lis le bloc Plan de collecte guidé : il indique la prochaine action et l’objectif 3 snapshots.", els.collectionPlanOutput);
} function downloadCollectionPlan() { const stamp = new Date().toISOString().slice(0, 10); const text = buildCollectionPlanMarkdown(); downloadTextFile(`agent_crypto_plan_collecte_${stamp}.md`, "text/markdown", text); if (els.collectionPlanOutput) els.collectionPlanOutput.textContent = text;
} function setSimManualFields(symbol, amount) { if (els.simSymbol) els.simSymbol.value = symbol; if (els.simAmount) els.simAmount.value = String(amount);
} function renderSchoolResult(kind, title, text, bullets = []) { const el = els.schoolResult || document.getElementById("schoolResult"); if (!el) return; el.classList.remove("ok", "refusal", "err", "neutral"); el.classList.add(kind || "neutral"); const items = bullets.map(item => `<li>${escapeHtml(item)}</li>`).join(""); el.innerHTML = ` <b>${escapeHtml(title)}</b> <p>${escapeHtml(text)}</p> <ul>${items}</ul> `;
} function schoolNeedsLivecheck() { if (state.liveOk && state.coins.length) return false; renderSchoolResult("err", "Livecheck requis", "Clique d’abord sur Lancer Livecheck. Le simulateur refuse de travailler sans prix réel chargé.", [ "Aucun prix n’est inventé.", "Aucun test n’est lancé tant que la source marché n’est pas prête.", "Après Livecheck OK, recommence le test guidé." ]); return true;
} function runSchoolTest(testName) { if (testName === "reset_100") { resetSimulation(); setSimManualFields("BTC", SIM_PROFILE.defaultAmount); renderCommandOutput(commandOk("reset_sim", simulationPayload())); renderSchoolResult("neutral", "Simulateur remis à 100 €", "Tu repars d’un portefeuille virtuel propre.", [ "Capital virtuel : 100 €.", "Position : 0 €.", "Tu peux lancer le test 1." ]); return; } if (schoolNeedsLivecheck()) return; let result = null; if (testName === "safe_btc_5") { resetSimulation(); setSimManualFields("BTC", 5); result = simulateOrder("buy", "BTC", 5); renderCommandOutput(result); renderSchoolResult(result?.ok ? "ok" : "err", result?.ok ? "Accepté : opération prudente" : "Erreur inattendue", result?.ok ? "BTC 5 € est accepté parce que le ticket conseillé est de 5 € et le maximum est de 10 €." : (result?.error || "Le test n’a pas donné le résultat attendu."), result?.ok ? [ "Tu as investi 5 € virtuels.", "Il reste 95 € virtuels.", "Ce test apprend la notion de petite opération contrôlée." ] : [ "Aucun argent réel.", "Regarde le journal pour le détail." ]); return; } if (testName === "too_big_btc_50") { resetSimulation(); setSimManualFields("BTC", 50); result = simulateOrder("buy", "BTC", 50); renderCommandOutput(result); renderSchoolResult(result?.ok === false ? "refusal" : "err", result?.ok === false ? "Refus normal : opération trop grosse" : "Erreur : ce test aurait dû être refusé", result?.ok === false ? "Tu as demandé 50 €, mais le profil débutant limite chaque opération à 10 €." : "Le test n’a pas respecté la règle attendue.", result?.ok === false ? [ "Le refus protège ton capital virtuel.", "Validation humaine n’a été envoyé.", "La règle apprise : ne pas mettre trop gros d’un coup." ] : [ "Ce test doit être revu." ]); return; } if (testName === "forbidden_doge_5") { resetSimulation(); setSimManualFields("DOGE", 5); result = simulateOrder("buy", "DOGE", 5); renderCommandOutput(result); renderSchoolResult(result?.ok === false ? "refusal" : "err", result?.ok === false ? "Refus normal : crypto non autorisée" : "Erreur : DOGE aurait dû être refusé", result?.ok === false ? "Le profil débutant autorise seulement BTC, ETH et SOL. DOGE est volontairement bloqué dans cette phase." : "Le test n’a pas respecté la règle attendue.", result?.ok === false ? [ "Tu apprends à limiter le périmètre.", "Moins d’actifs = moins de confusion au début.", "Les autres cryptos pourront être surveillées plus tard, pas utilisées en simulation débutant." ] : [ "Ce test doit être revu." ]); return; } if (testName === "fill_ceiling") { resetSimulation(); setSimManualFields("SOL", 10); const r1 = simulateOrder("buy", "BTC", 10); const r2 = simulateOrder("buy", "ETH", 10); const r3 = simulateOrder("buy", "SOL", 10); renderCommandOutput(r3); const ok = r1?.ok && r2?.ok && r3?.ok; renderSchoolResult(ok ? "ok" : "err", ok ? "Plafond rempli : 30 € exposés" : "Erreur pendant le remplissage du plafond", ok ? "Le simulateur a placé 10 € virtuels sur BTC, 10 € sur ETH et 10 € sur SOL." : "Une des trois opérations n’a pas été acceptée.", ok ? [ "Capital restant : environ 70 €.", "Exposition virtuelle : environ 30 €.", "Le profil débutant a atteint son plafond de sécurité." ] : [ r1?.error || "BTC : état inconnu.", r2?.error || "ETH : état inconnu.", r3?.error || "SOL : état inconnu." ]); return; } if (testName === "exceed_ceiling") { resetSimulation(); simulateOrder("buy", "BTC", 10); simulateOrder("buy", "ETH", 10); simulateOrder("buy", "SOL", 10); setSimManualFields("BTC", 5); result = simulateOrder("buy", "BTC", 5); renderCommandOutput(result); renderSchoolResult(result?.ok === false ? "refusal" : "err", result?.ok === false ? "Refus normal : plafond déjà atteint" : "Erreur : le dépassement aurait dû être refusé", result?.ok === false ? "Après 30 € virtuels exposés, l’app bloque tout nouvel achat simulé." : "Le simulateur n’a pas bloqué le dépassement.", result?.ok === false ? [ "Exposition maximale du profil : 30 €.", "Réserve minimale conservée : 70 €.", "La règle apprise : ne pas tout exposer, même en simulation." ] : [ "Ce test doit être revu." ]); return; }
} /* ========================================================= V2.0-alpha · Build 28.1 — Atlas Auto Reader Ouverture page -> Livecheck auto -> snapshots -> lecture marché. ========================================================= */ const AUTO_MEMORY_KEY = "agent_crypto_erith_ia_auto_reader_v1_1_alpha_13";
const AUTO_MAX_RECORDS = 3000; function readAutoMemory() { try { const raw = localStorage.getItem(AUTO_MEMORY_KEY); const parsed = raw ? JSON.parse(raw) : []; return Array.isArray(parsed) ? parsed : []; } catch { return []; }
} function writeAutoMemory(records) { let safe = Array.isArray(records) ? records.slice(-AUTO_MAX_RECORDS) : []; try { localStorage.setItem(AUTO_MEMORY_KEY, JSON.stringify(safe)); } catch { safe = safe.slice(Math.floor(safe.length / 2)); try { localStorage.setItem(AUTO_MEMORY_KEY, JSON.stringify(safe)); } catch {} } return safe;
} function compactCoinForAuto(c) { const s = scoreCoin(c); return { id: c.id, symbol: String(c.symbol || "").toUpperCase(), name: c.name, rank: c.rank ?? null, price_eur: c.price ?? null, change_24h_pct: c.change24h ?? null, change_7d_pct: c.change7d ?? null, change_30d_pct: c.change30d ?? null, market_cap_eur: c.marketCap ?? null, volume_24h_eur: c.volume24h ?? null, category: classifyAsset(c), action: atlasActionForCoin(c), score: s.score, source: c.source || state.mainSource || null };
} function makeAutoSnapshot() { const collectorId = getCollectorId(); const wanted = new Set(state.watchIds || []); const watch = state.coins.filter(c => wanted.has(c.id)); const leaders = state.coins.slice(0, 20); const merged = [...leaders, ...watch].filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i); const created = new Date().toISOString(); return { id: `${collectorId}_${created.replace(/[:.]/g, "-")}`, snapshot_id: `${collectorId}_${created.replace(/[:.]/g, "-")}`, collector_id: collectorId, collector_type: "local_browser", saved_at: created, version: ATLAS_RELEASE, source: state.mainSource || null, source_time: state.timestamp || null, live_ok: !!state.liveOk, cadence_ms: state.auto?.intervalMs || ATLAS_MARKET_REFRESH_MS, global: { market_cap_eur: state.global?.total_market_cap?.eur ?? null, volume_24h_eur: state.global?.total_volume?.eur ?? null, btc_dominance_pct: state.global?.market_cap_percentage?.btc ?? null }, assets: merged.map(compactCoinForAuto) };
} function lastAutoSnapshot() { const records = readAutoMemory(); return records.length ? records[records.length - 1] : null;
} function saveAutoSnapshot() {
  if (!state.liveOk || !state.coins.length) return null;
  const records = readAutoMemory();
  const snapshot = makeAutoSnapshot();
  records.push(snapshot);
  const saved = writeAutoMemory(records);
  const finalSnapshot = saved[saved.length - 1] || snapshot;
  queueMicrotask(renderMemoryTruth);
  return finalSnapshot;
} function findAutoAsset(snapshot, idOrSymbol) { if (!snapshot || !Array.isArray(snapshot.assets)) return null; const q = String(idOrSymbol || "").toUpperCase(); return snapshot.assets.find(a => String(a.id || "").toUpperCase() === q || String(a.symbol || "").toUpperCase() === q) || null;
} function priceDeltaPct(nowAsset, prevAsset) { const a = Number(nowAsset?.price_eur); const b = Number(prevAsset?.price_eur); if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return null; return ((a - b) / b) * 100;
} function autoMarketPulse(snapshot = null, previous = null) { const snap = snapshot || makeAutoSnapshot(); const assets = snap.assets || []; if (!assets.length) return { label: "En attente", mode: "wait", lines: ["Aucune donnée marché exploitable."] }; const btc = assets.find(a => a.symbol === "BTC"); const eth = assets.find(a => a.symbol === "ETH"); const watchAssets = assets.filter(a => (state.watchIds || []).includes(a.id)); const strongest = [...assets].filter(a => typeof a.change_24h_pct === "number").sort((a, b) => b.change_24h_pct - a.change_24h_pct).slice(0, 3); const weakest = [...assets].filter(a => typeof a.change_24h_pct === "number").sort((a, b) => a.change_24h_pct - b.change_24h_pct).slice(0, 3); const maxMove = Math.max(...assets.map(a => Math.abs(Number(a.change_24h_pct) || 0)), 0); const btcMove = Number(btc?.change_24h_pct || 0); const ethMove = Number(eth?.change_24h_pct || 0); let label = "Marché calme"; let mode = "ok"; if (maxMove >= 12) { label = "Marché nerveux"; mode = "warn"; } if (btcMove > 2 && ethMove > 1) { label = "Marché positif"; mode = "ok"; } if (btcMove < -2 && ethMove < -1) { label = "Marché sous pression"; mode = "warn"; } const deltaLines = []; if (previous) { for (const a of watchAssets.slice(0, 6)) { const prev = findAutoAsset(previous, a.id); const delta = priceDeltaPct(a, prev); if (typeof delta === "number" && Math.abs(delta) >= 0.15) { deltaLines.push(`${a.symbol} ${delta >= 0 ? "monte" : "baisse"} depuis le dernier relevé : ${delta >= 0 ? "+" : ""}${delta.toFixed(2)} %`); } } } const lines = [ `État : ${label}.`, btc ? `BTC : ${btc.change_24h_pct >= 0 ? "+" : ""}${Number(btc.change_24h_pct || 0).toFixed(2)} % sur 24h · catégorie ${btc.category}.` : "BTC non chargé.", eth ? `ETH : ${eth.change_24h_pct >= 0 ? "+" : ""}${Number(eth.change_24h_pct || 0).toFixed(2)} % sur 24h · catégorie ${eth.category}.` : "ETH non chargé.", `Hausse 24h : ${strongest.map(a => `${a.symbol} ${Number(a.change_24h_pct).toFixed(2)} %`).join(" · ") || "—"}.`, `Baisse 24h : ${weakest.map(a => `${a.symbol} ${Number(a.change_24h_pct).toFixed(2)} %`).join(" · ") || "—"}.`, ...deltaLines.slice(0, 4) ]; return { label, mode, lines, maxMove };
} function chooseAutoIntervalMs(snapshot, previous) { return ATLAS_MARKET_REFRESH_MS;
} function formatAutoDelay(ms) { const sec = Math.max(0, Math.round(ms / 1000)); if (sec >= 60) { const min = Math.floor(sec / 60); const rest = sec % 60; return rest ? `${min} min ${rest} s` : `${min} min`; } return `${sec} s`;
} function renderAutoReader(snapshot = null, previous = null) {
  const records = readAutoMemory();
  const last = snapshot || records[records.length - 1] || null;
  const pulse = last
    ? autoMarketPulse(last, previous || records[records.length - 2] || null)
    : { label: "En attente", mode: "wait", lines: ["Atlas attend la première lecture."] };

  const runtime = atlasAutoRuntimeLabel();
  if (els.autoModeStatus) {
    els.autoModeStatus.textContent = runtime === "ACTIF" ? "Auto actif"
      : runtime === "SUSPENDU" ? "Auto suspendu"
      : runtime === "LECTURE EN COURS" ? "Lecture en cours"
      : "Auto pause";
    els.autoModeStatus.className = `pill ${runtime === "ACTIF" || runtime === "LECTURE EN COURS" ? "ok" : "warn"}`;
  }

  if (els.btnAutoToggle) els.btnAutoToggle.textContent = state.auto?.enabled ? "Auto ON" : "Auto OFF";
  if (els.autoLastRead) {
    els.autoLastRead.textContent = last?.saved_at
      ? new Date(last.saved_at).toLocaleString("fr-FR")
      : "En attente";
  }
  if (els.autoSnapshots) els.autoSnapshots.textContent = `${records.length}/${AUTO_MAX_RECORDS}`;
  if (els.autoActiveCadence) {
    els.autoActiveCadence.textContent = `${formatAutoDelay(state.auto?.intervalMs || ATLAS_MARKET_REFRESH_MS)} · marché`;
  }
  if (els.autoMarketPulse) els.autoMarketPulse.textContent = pulse.label;
  if (els.autoWatchStatus) {
    els.autoWatchStatus.textContent = `Atlas V2 · ${(state.watchIds || []).length} actifs · ${ATLAS_WATCH_BASKETS.length} paniers`;
  }

  atlasRenderAutoTruthLive();

  if (els.autoReaderOutput) {
    const watchLines = last?.assets
      ? last.assets
          .filter(asset => (state.watchIds || []).includes(asset.id))
          .slice(0, 8)
          .map(asset =>
            `${asset.symbol} · ${asset.category} · ${asset.action} · 24h ${
              typeof asset.change_24h_pct === "number"
                ? `${asset.change_24h_pct >= 0 ? "+" : ""}${asset.change_24h_pct.toFixed(2)} %`
                : "—"
            }`
          )
      : [];

    els.autoReaderOutput.textContent = [
      `ATLAS AUTO READER — ${ATLAS_RELEASE}`,
      "",
      `État réel : ${runtime}.`,
      atlasPulseVisible()
        ? "Onglet visible : la collecte locale peut continuer."
        : "Onglet masqué : les timers locaux sont suspendus.",
      "Écriture GitHub depuis cette page : NON. GitHub Pages reste en lecture seule.",
      `Collecteur de ce Firefox : ${getCollectorId()} (${isCollectorConfigured() ? "configuré" : "temporaire"}).`,
      `Snapshots locaux disponibles : ${records.length}.`,
      last?.saved_at
        ? `Dernier snapshot local : ${new Date(last.saved_at).toLocaleString("fr-FR")}.`
        : "Dernier snapshot local : aucun.",
      "",
      "Lecture marché :",
      ...pulse.lines,
      "",
      "Watchlist :",
      ...(watchLines.length ? watchLines : ["Les actifs suivis se rempliront après un Livecheck valide."]),
      "",
      "Vérité collecteur : un nom présent dans la mémoire prouve seulement qu’il a déjà écrit des snapshots. Cela ne prouve pas que sa machine tourne encore maintenant."
    ].join("\n");
  }

  renderMemoryTruth();
} function atlasAutoRuntimeLabel() {
  if (!state.auto?.enabled) return "PAUSE";
  if (!atlasPulseVisible()) return "SUSPENDU";
  if (state.auto?.livecheckBusy) return "LECTURE EN COURS";
  return "ACTIF";
}

function atlasRenderAutoTruthLive() {
  const visible = atlasPulseVisible();
  setText(els.autoReaderTruth, atlasAutoRuntimeLabel());
  setText(els.autoVisibilityTruth, visible ? "Visible · collecte autorisée" : "Masqué · collecte suspendue");
  setText(els.autoGithubWriteTruth, "NON · frontend lecture seule");

  const last = lastAutoSnapshot();
  setText(els.autoLastSnapshotTruth, last?.saved_at ? new Date(last.saved_at).toLocaleString("fr-FR") : "Aucun");

  const collectorId = getCollectorId();
  setText(els.autoCollectorTruth, `${collectorId} · ${isCollectorConfigured() ? "configuré" : "temporaire"}`);
}

function updateAutoCountdown() {
  atlasRenderAutoTruthLive();
  if (!els.autoNextRead) return;
  if (!state.auto?.enabled) {
    els.autoNextRead.textContent = "Auto OFF";
    return;
  }
  if (!atlasPulseVisible()) {
    els.autoNextRead.textContent = "Suspendu · onglet masqué";
    return;
  }
  if (state.auto?.livecheckBusy) {
    els.autoNextRead.textContent = "Lecture en cours";
    return;
  }
  if (!state.auto?.nextAt) {
    els.autoNextRead.textContent = "Préparation";
    return;
  }
  els.autoNextRead.textContent = formatAutoDelay(new Date(state.auto.nextAt).getTime() - Date.now());
} function scheduleAutoRead(ms = null) {
  if (!state.auto?.enabled) return;

  if (state.auto.timer) clearTimeout(state.auto.timer);
  state.auto.timer = null;

  if (!atlasPulseVisible()) {
    state.auto.nextAt = null;
    updateAutoCountdown();
    return;
  }

  const delay = ms ?? state.auto.intervalMs ?? ATLAS_MARKET_REFRESH_MS;
  state.auto.nextAt = new Date(Date.now() + delay).toISOString();
  updateAutoCountdown();

  state.auto.timer = setTimeout(() => {
    state.auto.timer = null;
    if (state.auto?.enabled && atlasPulseVisible()) {
      void refreshMarketOnly({ reason: "market-pulse" });
    }
  }, delay);
}

function atlasAfterLivecheck(options = {}) {
  if (!state.liveOk || !state.coins.length) {
    renderAutoReader();
    if (state.auto?.enabled) scheduleAutoRead(options.marketDelayMs ?? ATLAS_MARKET_REFRESH_MS);
    return;
  }

  const previous = lastAutoSnapshot();
  const snapshot = saveAutoSnapshot();
  state.auto.intervalMs = ATLAS_MARKET_REFRESH_MS;
  renderAutoReader(snapshot, previous);

  if (state.auto?.enabled && atlasPulseVisible()) {
    scheduleAutoRead(options.marketDelayMs ?? ATLAS_MARKET_REFRESH_MS);
    atlasScheduleSpotPulse(options.spotDelayMs ?? ATLAS_SPOT_REFRESH_MS);
    atlasScheduleChartPulse(ATLAS_CHART_BACKGROUND_REFRESH_MS);
  }
}

function startAutoReader() {
  state.auto.livecheckBusy = false;
  atlasInitMarketPulseController();
  loadWatchIds();

  state.auto.intervalMs = ATLAS_MARKET_REFRESH_MS;
  atlasPrimeMarketCacheSilently();
  atlasRenderDirectFirstStartup();
  renderAutoReader();

  if (state.auto.countdownTimer) clearInterval(state.auto.countdownTimer);
  state.auto.countdownTimer = setInterval(updateAutoCountdown, 1000);

  if (atlasPulseVisible()) {
    setTimeout(() => void atlasRunStartupLivecheck(), 50);
  }
}

function toggleAutoReader() {
  state.auto.enabled = !state.auto.enabled;

  if (!state.auto.enabled) {
    atlasPauseMarketPulse();
  } else if (atlasPulseVisible()) {
    atlasResumeMarketPulse();
  }

  renderAutoReader();
  updateAutoCountdown();
}

function setAutoCadence(value) {
  state.auto.cadence = String(value || "adaptive");
  state.auto.intervalMs = ATLAS_MARKET_REFRESH_MS;
  renderAutoReader();
  if (state.auto.enabled) scheduleAutoRead(ATLAS_MARKET_REFRESH_MS);
}

const COLLECTOR_ID_KEY = "agent_crypto_erith_ia_collector_id_v1";
const COLLECTOR_CONFIGURED_KEY = "agent_crypto_erith_ia_collector_configured_v1";
const COLLECTOR_MIGRATION_NOTE_KEY = "agent_crypto_erith_ia_collector_migration_note_v1";
const AUTO_LAST_IMPORT_KEY = "agent_crypto_erith_ia_last_import_v1";
const GITHUB_MEMORY_LATEST_URL = "../data/latest.json";
const GITHUB_MEMORY_STATUS_URL = "../data/status.json";
const ATLAS_MEMORY_TRUTH_KEY = "agent_crypto_erith_ia_memory_truth_v27_2_5"; function cleanCollectorId(value) { return String(value || "") .trim() .toLowerCase() .normalize("NFD").replace(/[\u0300-\u036f]/g, "") .replace(/[^a-z0-9_-]+/g, "-") .replace(/^-+|-+$/g, "") .slice(0, 64);
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
}

function atlasReadMemoryTruth() {
  if (state.memoryTruth?.loaded) return state.memoryTruth;
  state.memoryTruth.loaded = true;
  try {
    const parsed = JSON.parse(localStorage.getItem(ATLAS_MEMORY_TRUTH_KEY) || "{}");
    if (parsed?.github && typeof parsed.github === "object") {
      state.memoryTruth.github = {
        ...state.memoryTruth.github,
        ...parsed.github,
        collectors: Array.isArray(parsed.github.collectors) ? parsed.github.collectors : []
      };
    }
  } catch {}
  return state.memoryTruth;
}

function atlasPersistMemoryTruth() {
  try {
    localStorage.setItem(
      ATLAS_MEMORY_TRUTH_KEY,
      JSON.stringify({
        schema: "atlas_memory_truth_v1",
        version: ATLAS_RELEASE,
        savedAt: new Date().toISOString(),
        github: state.memoryTruth.github
      })
    );
  } catch {}
}

function atlasMemoryTruthTime(value, fallback = "Aucun") {
  const time = Date.parse(value || "");
  return Number.isFinite(time) ? new Date(time).toLocaleString("fr-FR") : fallback;
}

function atlasCollectorPresence(records = readAutoMemory()) {
  const map = new Map();
  for (const record of records || []) {
    const id = cleanCollectorId(record?.collector_id || record?.exporter_collector_id || "local-legacy") || "local-legacy";
    const timestamp = record?.saved_at || record?.source_time || null;
    const current = map.get(id) || { id, count: 0, latest: null };
    current.count += 1;
    if (timestamp && (!current.latest || Date.parse(timestamp) > Date.parse(current.latest))) {
      current.latest = timestamp;
    }
    map.set(id, current);
  }
  return [...map.values()].sort((a, b) => {
    const ta = Date.parse(a.latest || 0) || 0;
    const tb = Date.parse(b.latest || 0) || 0;
    return tb - ta || a.id.localeCompare(b.id);
  });
}

function atlasCollectorRuntimeTruth(id, currentId, githubCollectors = []) {
  if (id === currentId) {
    if (!state.auto?.enabled) return "Collecte locale en pause";
    if (!atlasPulseVisible()) return "Collecte locale suspendue · onglet masqué";
    if (!state.liveOk) return "Collecteur local prêt · marché en attente";
    return "Collecte locale active dans cet onglet";
  }
  if (githubCollectors.includes(id)) {
    return "Présent dans le dernier relevé GitHub · activité actuelle non prouvée";
  }
  return "Présent dans la mémoire locale · activité actuelle non prouvée";
}

function renderMemoryTruth() {
  atlasReadMemoryTruth();

  const localRecords = readAutoMemory();
  const localStats = collectorStats(localRecords);
  const presence = atlasCollectorPresence(localRecords);
  const currentId = getCollectorId();
  const github = state.memoryTruth.github;
  const githubCollectors = Array.isArray(github.collectors) ? github.collectors : [];

  setText(els.githubMemoryAuto, github.autoAttempted ? "OUI · au démarrage" : "En attente du démarrage");
  setText(els.githubMemoryAutoAttempt, atlasMemoryTruthTime(github.lastAttemptAt));
  setText(els.githubMemorySuccess, atlasMemoryTruthTime(github.lastSuccessAt));
  setText(els.githubMemoryLatest, atlasMemoryTruthTime(github.lastRecordAt, "Non chargé"));
  setText(els.githubMemoryRecords, `${Number(github.records || 0)}`);
  setText(els.githubMemoryLocal, `${localRecords.length}`);
  setText(els.githubMemoryAdded, `${Number(github.added || 0)}`);
  setText(els.githubMemoryCollectors, githubCollectors.length ? githubCollectors.join(" · ") : "Aucun relevé GitHub confirmé");
  setText(
    els.githubMemoryFusion,
    `${localRecords.length} total · ${localStats.collectors.length} collecteur${localStats.collectors.length > 1 ? "s" : ""} présent${localStats.collectors.length > 1 ? "s" : ""}`
  );
  setText(els.githubMemoryWrite, "NON · frontend lecture seule");

  if (els.githubMemoryStatus) {
    const kind = github.loading ? "warn"
      : github.lastSuccessAt ? "ok"
      : github.lastError ? "fail"
      : "warn";
    els.githubMemoryStatus.className = `pill ${kind}`;
    els.githubMemoryStatus.textContent = github.loading
      ? "Lecture GitHub"
      : github.lastSuccessAt
        ? github.lastMode === "manual" ? "GitHub OK · manuel" : "GitHub OK · auto"
        : github.lastError
          ? "GitHub indisponible"
          : "Auto en attente";
  }

  if (els.collectorTruthList) {
    if (!presence.length) {
      els.collectorTruthList.innerHTML = '<span class="collector-truth-empty">Aucun collecteur présent dans la mémoire locale.</span>';
    } else {
      els.collectorTruthList.innerHTML = presence.map(item => `
        <article class="collector-truth-card ${item.id === currentId ? "is-current" : ""}">
          <b>${escapeHtml(item.id)}</b>
          <span>${item.count} snapshot${item.count > 1 ? "s" : ""}</span>
          <small>Dernière trace : ${escapeHtml(atlasMemoryTruthTime(item.latest, "inconnue"))}</small>
          <em>${escapeHtml(atlasCollectorRuntimeTruth(item.id, currentId, githubCollectors))}</em>
        </article>
      `).join("");
    }
  }

  atlasRenderAutoTruthLive();
}
 function setSharedOutputStatus(kind = "") { if (!els.sharedMemoryOutput) return; els.sharedMemoryOutput.classList.remove("ok", "warn", "fail"); if (kind) els.sharedMemoryOutput.classList.add(kind);
} 
const ATLAS_MEMORY_COVERAGE_HORIZONS = Object.freeze([1, 7, 30, 60, 90]);
const ATLAS_MEMORY_MIN_GAP_MS = 5 * 60 * 1000;

function atlasMemoryRecordTimestamp(record) {
  const candidates = [record?.saved_at, record?.source_time, record?.generated_at];
  for (const value of candidates) {
    const timestamp = Date.parse(value || "");
    if (Number.isFinite(timestamp)) return timestamp;
  }
  return null;
}

function atlasMemoryDurationLabel(ms) {
  const value = Math.max(0, Number(ms) || 0);
  if (value < 60_000) return `${Math.max(0, Math.round(value / 1000))} s`;
  if (value < 3_600_000) return `${Math.round(value / 60_000)} min`;
  if (value < 86_400_000) {
    const hours = value / 3_600_000;
    return `${hours < 10 ? hours.toFixed(1) : Math.round(hours)} h`;
  }
  const days = value / 86_400_000;
  return `${days < 10 ? days.toFixed(1) : Math.round(days)} j`;
}

function atlasMemoryDateLabel(timestamp, fallback = "Aucune") {
  return Number.isFinite(Number(timestamp))
    ? new Date(Number(timestamp)).toLocaleString("fr-FR")
    : fallback;
}

function atlasMemoryMedian(values) {
  const valid = (values || []).map(Number).filter(value => Number.isFinite(value) && value > 0).sort((a, b) => a - b);
  if (!valid.length) return null;
  const middle = Math.floor(valid.length / 2);
  return valid.length % 2 ? valid[middle] : (valid[middle - 1] + valid[middle]) / 2;
}

function atlasMemoryAnalyzeRecords(records = readAutoMemory()) {
  const normalized = [];
  let invalidTimestamps = 0;

  for (const record of records || []) {
    const timestamp = atlasMemoryRecordTimestamp(record);
    if (!Number.isFinite(timestamp)) {
      invalidTimestamps += 1;
      continue;
    }
    normalized.push({
      record,
      timestamp,
      collectorId: cleanCollectorId(record?.collector_id || "local-legacy") || "local-legacy"
    });
  }

  normalized.sort((a, b) => a.timestamp - b.timestamp);
  const timestamps = normalized.map(item => item.timestamp);
  const deltas = [];
  for (let index = 1; index < timestamps.length; index += 1) {
    const delta = timestamps[index] - timestamps[index - 1];
    if (delta > 0) deltas.push(delta);
  }

  const medianCadenceMs = atlasMemoryMedian(deltas);
  const gapThresholdMs = Math.max(
    ATLAS_MEMORY_MIN_GAP_MS,
    Number.isFinite(medianCadenceMs) ? medianCadenceMs * 3 : ATLAS_MEMORY_MIN_GAP_MS
  );
  const gaps = deltas.filter(delta => delta > gapThresholdMs);
  const firstTimestamp = timestamps[0] ?? null;
  const lastTimestamp = timestamps[timestamps.length - 1] ?? null;
  const spanMs = Number.isFinite(firstTimestamp) && Number.isFinite(lastTimestamp)
    ? Math.max(0, lastTimestamp - firstTimestamp)
    : 0;

  const collectorMap = new Map();
  for (const item of normalized) {
    const bucket = collectorMap.get(item.collectorId) || [];
    bucket.push(item);
    collectorMap.set(item.collectorId, bucket);
  }

  const collectors = [...collectorMap.entries()].map(([collectorId, items]) => {
    const ordered = [...items].sort((a, b) => a.timestamp - b.timestamp);
    const collectorDeltas = [];
    for (let index = 1; index < ordered.length; index += 1) {
      const delta = ordered[index].timestamp - ordered[index - 1].timestamp;
      if (delta > 0) collectorDeltas.push(delta);
    }
    const cadence = atlasMemoryMedian(collectorDeltas);
    const threshold = Math.max(
      ATLAS_MEMORY_MIN_GAP_MS,
      Number.isFinite(cadence) ? cadence * 3 : ATLAS_MEMORY_MIN_GAP_MS
    );
    const collectorGaps = collectorDeltas.filter(delta => delta > threshold);
    const first = ordered[0]?.timestamp ?? null;
    const last = ordered[ordered.length - 1]?.timestamp ?? null;
    return {
      collectorId,
      count: ordered.length,
      firstTimestamp: first,
      lastTimestamp: last,
      spanMs: Number.isFinite(first) && Number.isFinite(last) ? Math.max(0, last - first) : 0,
      medianCadenceMs: cadence,
      gapThresholdMs: threshold,
      gapCount: collectorGaps.length,
      largestGapMs: collectorGaps.length ? Math.max(...collectorGaps) : 0,
      liveOkCount: ordered.filter(item => item.record?.live_ok === true).length
    };
  }).sort((a, b) => b.lastTimestamp - a.lastTimestamp);

  return {
    totalRecords: Array.isArray(records) ? records.length : 0,
    validRecords: normalized.length,
    invalidTimestamps,
    firstTimestamp,
    lastTimestamp,
    spanMs,
    medianCadenceMs,
    gapThresholdMs,
    gapCount: gaps.length,
    largestGapMs: gaps.length ? Math.max(...gaps) : 0,
    collectors
  };
}

function atlasMemoryHorizonStatus(analysis, days) {
  const periodMs = Math.max(1, Number(days || 1)) * 86_400_000;
  const spanRatio = Math.min(1, analysis.spanMs / periodMs);
  const cadence = Number.isFinite(analysis.medianCadenceMs)
    ? Math.max(30_000, analysis.medianCadenceMs)
    : ATLAS_MARKET_REFRESH_MS;
  const expectedRecords = Math.max(2, Math.floor(periodMs / cadence) + 1);
  const densityRatio = Math.min(1, analysis.validRecords / expectedRecords);
  const excessGapMs = analysis.gapCount
    ? Math.max(0, analysis.largestGapMs - analysis.gapThresholdMs)
    : 0;
  const continuityPenalty = Math.min(0.55, excessGapMs / periodMs);
  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round((spanRatio * 0.62 + densityRatio * 0.38) * (1 - continuityPenalty) * 100)
    )
  );

  let tone = "missing";
  let label = "Insuffisante";
  if (analysis.spanMs >= periodMs && score >= 70) {
    tone = "ok";
    label = "Solide";
  } else if (analysis.spanMs >= periodMs) {
    tone = "warn";
    label = "Fragmentée";
  } else if (analysis.spanMs >= periodMs * 0.25) {
    tone = "partial";
    label = "Partielle";
  }

  return {
    days,
    score,
    tone,
    label,
    spanRatio,
    densityRatio,
    expectedRecords
  };
}

function atlasChartCacheCoverageByPeriod() {
  const store = atlasReadLocalChartStore();
  const result = Object.fromEntries(ATLAS_MEMORY_COVERAGE_HORIZONS.map(days => [days, {
    valid: 0,
    total: 0,
    coins: [],
    latestSavedAt: null
  }]));

  for (const [key, stored] of Object.entries(store || {})) {
    const separator = key.lastIndexOf(":");
    const period = Number(separator >= 0 ? key.slice(separator + 1) : 0);
    if (!result[period]) continue;

    result[period].total += 1;
    const series = atlasNormalizeChartPayload({ prices: stored?.series });
    const coverageHours = atlasChartCoverageHours(series);
    const rules = atlasChartRules(period);
    if (
      Array.isArray(series)
      && series.length >= rules.minPoints
      && coverageHours >= rules.minCoverageHours
    ) {
      result[period].valid += 1;
      const coinId = separator >= 0 ? key.slice(0, separator) : key;
      if (coinId) result[period].coins.push(coinId);
      const savedAt = Number(stored?.savedAt || 0);
      if (savedAt > Number(result[period].latestSavedAt || 0)) {
        result[period].latestSavedAt = savedAt;
      }
    }
  }

  return result;
}

function atlasRenderMemoryCoverage() {
  const analysis = atlasMemoryAnalyzeRecords();
  const chartCoverage = atlasChartCacheCoverageByPeriod();

  setText($("memoryCoverageFirst"), atlasMemoryDateLabel(analysis.firstTimestamp));
  setText($("memoryCoverageLast"), atlasMemoryDateLabel(analysis.lastTimestamp));
  setText($("memoryCoverageSpan"), atlasMemoryDurationLabel(analysis.spanMs));
  setText(
    $("memoryCoverageValid"),
    `${analysis.validRecords}/${analysis.totalRecords}`
      + (analysis.invalidTimestamps ? ` · ${analysis.invalidTimestamps} invalide${analysis.invalidTimestamps > 1 ? "s" : ""}` : "")
  );
  setText(
    $("memoryCoverageCadence"),
    Number.isFinite(analysis.medianCadenceMs)
      ? atlasMemoryDurationLabel(analysis.medianCadenceMs)
      : "Non mesurable"
  );
  setText(
    $("memoryCoverageLargestGap"),
    analysis.gapCount
      ? `${atlasMemoryDurationLabel(analysis.largestGapMs)} · ${analysis.gapCount} trou${analysis.gapCount > 1 ? "s" : ""}`
      : analysis.validRecords > 1 ? "Aucun trou majeur" : "Non mesurable"
  );

  const horizonGrid = $("memoryHorizonGrid");
  if (horizonGrid) {
    horizonGrid.innerHTML = ATLAS_MEMORY_COVERAGE_HORIZONS.map(days => {
      const memory = atlasMemoryHorizonStatus(analysis, days);
      const chart = chartCoverage[days];
      const chartLabel = chart?.valid
        ? `${chart.valid} série${chart.valid > 1 ? "s" : ""} réelle${chart.valid > 1 ? "s" : ""}`
        : "aucune série validée";
      const chartCoins = chart?.coins?.length
        ? ` · ${chart.coins.slice(0, 5).map(id => String(id).toUpperCase()).join(" · ")}`
        : "";
      return `
        <article data-horizon="${days}" data-memory-tone="${memory.tone}" data-chart-ready="${chart?.valid ? "true" : "false"}">
          <span>${days === 1 ? "24 h" : `${days} jours`}</span>
          <b>Mémoire ${escapeHtml(memory.label)} · ${memory.score}/100</b>
          <small>Graphique : ${escapeHtml(chartLabel)}${escapeHtml(chartCoins)}</small>
        </article>`;
    }).join("");
  }

  const collectorList = $("memoryCollectorQuality");
  if (collectorList) {
    collectorList.innerHTML = analysis.collectors.length
      ? analysis.collectors.map(collector => {
          const validPct = collector.count
            ? Math.round((collector.liveOkCount / collector.count) * 100)
            : 0;
          return `
            <article class="memory-collector-card">
              <div>
                <b>${escapeHtml(collector.collectorId)}</b>
                <span>${collector.count} snapshot${collector.count > 1 ? "s" : ""} · ${validPct}% live_ok</span>
              </div>
              <small>${escapeHtml(atlasMemoryDateLabel(collector.firstTimestamp))} → ${escapeHtml(atlasMemoryDateLabel(collector.lastTimestamp))}</small>
              <em>Durée ${escapeHtml(atlasMemoryDurationLabel(collector.spanMs))} · cadence ${escapeHtml(Number.isFinite(collector.medianCadenceMs) ? atlasMemoryDurationLabel(collector.medianCadenceMs) : "—")} · ${collector.gapCount} trou${collector.gapCount > 1 ? "s" : ""}${collector.gapCount ? ` · max ${escapeHtml(atlasMemoryDurationLabel(collector.largestGapMs))}` : ""}</em>
            </article>`;
        }).join("")
      : '<span class="collector-truth-empty">Aucun collecteur exploitable.</span>';
  }

  const output = $("memoryCoverageOutput");
  if (output) {
    const horizonLines = ATLAS_MEMORY_COVERAGE_HORIZONS.map(days => {
      const memory = atlasMemoryHorizonStatus(analysis, days);
      const chart = chartCoverage[days];
      return `${days === 1 ? "24 h" : `${days} j`} · mémoire ${memory.label.toLowerCase()} ${memory.score}/100 · graphiques réels ${chart?.valid || 0}/${chart?.total || 0}`;
    });

    output.textContent = [
      `MEMORY HISTORY COVERAGE — ${ATLAS_RELEASE}`,
      "",
      "MÉMOIRE DE SNAPSHOTS",
      `Première trace : ${atlasMemoryDateLabel(analysis.firstTimestamp)}.`,
      `Dernière trace : ${atlasMemoryDateLabel(analysis.lastTimestamp)}.`,
      `Durée couverte : ${atlasMemoryDurationLabel(analysis.spanMs)}.`,
      `Snapshots valides : ${analysis.validRecords}/${analysis.totalRecords}.`,
      `Cadence médiane observée : ${Number.isFinite(analysis.medianCadenceMs) ? atlasMemoryDurationLabel(analysis.medianCadenceMs) : "non mesurable"}.`,
      `Trous majeurs : ${analysis.gapCount}${analysis.gapCount ? ` · maximum ${atlasMemoryDurationLabel(analysis.largestGapMs)}` : ""}.`,
      "",
      "COUVERTURE PAR HORIZON",
      ...horizonLines,
      "",
      "RÈGLE DE VÉRITÉ",
      "La mémoire de snapshots mesure des relevés successifs du marché ; elle ne remplace pas une série graphique.",
      "Les cartes Graphique comptent uniquement les séries CoinGecko présentes dans le cache navigateur et couvrant réellement l’horizon demandé.",
      "Une machine importée est considérée présente dans la mémoire, jamais déclarée active sans preuve en temps réel."
    ].join("\n");
  }
}

function renderSharedMemory() { const id = getCollectorId(); if (isCollectorConfigured()) { migrateLocalCollectorRecords(id, true); } const records = readAutoMemory(); const stats = collectorStats(records); const configured = isCollectorConfigured(); const migrationNote = localStorage.getItem(COLLECTOR_MIGRATION_NOTE_KEY) || "Aucune migration encore nécessaire."; const lastImport = localStorage.getItem(AUTO_LAST_IMPORT_KEY) || "Aucun import effectué"; const last = records[records.length - 1]; if (els.collectorIdInput && !els.collectorIdInput.value) els.collectorIdInput.value = id; if (els.collectorIdentityBadge) els.collectorIdentityBadge.textContent = configured ? `Configuré · ${id}` : "À configurer"; if (els.sharedCollectorId) els.sharedCollectorId.textContent = configured ? `${id} · sauvegardé dans Firefox` : `${id} · temporaire`; if (els.sharedLocalCount) els.sharedLocalCount.textContent = records.length === 1 ? "1 snapshot fusionné" : `${records.length} snapshots fusionnés`; if (els.sharedCollectorsCount) els.sharedCollectorsCount.textContent = `${stats.collectors.length} · ${formatCollectorCounts(stats)}`; if (els.sharedLastImport) els.sharedLastImport.textContent = lastImport; if (els.sharedMemoryOutput) { setSharedOutputStatus(configured ? "ok" : "warn"); els.sharedMemoryOutput.textContent = [ `ATLAS SHARED MARKET MEMORY — ${ATLAS_RELEASE}`, "", configured ? `✅ Machine configurée : ${id}` : `⚠️ Machine non finalisée : ${id}`, configured ? "Configuration : gardée automatiquement dans ce Firefox." : "Action : remplace l’ID temporaire par ryzen7-christophe / transformer-book-christophe / yohan-machine puis clique Sauver ID une fois.", "", "ÉTAT MÉMOIRE", `Total disponible : ${records.length} snapshots fusionnés`, `Collecteurs fusionnés : ${formatCollectorCounts(stats)}`, last?.saved_at ? `Dernier snapshot disponible : ${new Date(last.saved_at).toLocaleString("fr-FR")}` : "Dernier snapshot disponible : aucun", `Dernière opération : ${lastImport}`, `Migration : ${migrationNote}`, "", "LECTURE SIMPLE", records.length ? "Les données visibles ici sont disponibles localement pour Atlas sur cette machine." : "Aucune donnée fusionnée pour l’instant.", stats.collectors.length > 1 ? "Plusieurs collecteurs sont présents dans la mémoire. Cela ne prouve pas que leurs machines fonctionnent encore actuellement." : "Un seul collecteur est présent dans la mémoire locale pour l’instant.", "", "RÈGLE", "Export/import fusionne les relevés sans écraser. La mémoire GitHub est lue automatiquement au démarrage ; cette page publique ne peut pas écrire dans GitHub." ].join("\n"); }
  renderMemoryTruth();
  atlasRenderMemoryCoverage();
} function exportAutoMemory() { const records = normalizeSharedRecords(readAutoMemory(), getCollectorId()); const payload = { schema: "atlas_shared_market_memory_v1", exported_at: new Date().toISOString(), exporter_collector_id: getCollectorId(), record_count: records.length, collectors: collectorStats(records).collectors, records }; const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-"); downloadTextFile(`atlas_shared_market_memory_${getCollectorId()}_${stamp}.json`, "application/json", JSON.stringify(payload, null, 2)); renderSharedMemory();
} async function importAutoMemoryFile(file) { if (!file) return; try { const text = await file.text(); const payload = JSON.parse(text); const incoming = Array.isArray(payload) ? payload : Array.isArray(payload.records) ? payload.records : []; if (!incoming.length) { setSharedOutputStatus("fail"); if (els.sharedMemoryOutput) els.sharedMemoryOutput.textContent = "IMPORT REFUSÉ\n\nAucun snapshot trouvé dans ce fichier JSON."; return; } const before = readAutoMemory(); const beforeStats = collectorStats(before); const merged = normalizeSharedRecords([...before, ...incoming]); writeAutoMemory(merged); const afterStats = collectorStats(merged); const imported = Math.max(0, merged.length - before.length); const newCollectors = afterStats.collectors.filter(id => !beforeStats.collectors.includes(id)); const line = `${new Date().toLocaleString("fr-FR")} · import OK · ${incoming.length} lus · ${imported} nouveaux`; localStorage.setItem(AUTO_LAST_IMPORT_KEY, line); renderSharedMemory(); renderAutoReader(); setSharedOutputStatus("ok"); if (els.sharedMemoryOutput) { els.sharedMemoryOutput.textContent = [ "✅ IMPORT RÉUSSI", "", `Fichier lu : ${file.name || "mémoire JSON"}`, `Snapshots lus dans le fichier : ${incoming.length}`, `Nouveaux snapshots ajoutés : ${imported}`, `Total mémoire fusionnée : ${merged.length}`, "", "COLLECTEURS APRÈS IMPORT", formatCollectorCounts(afterStats), newCollectors.length ? `Nouveau(x) collecteur(s) détecté(s) : ${newCollectors.join(" / ")}` : "Aucun nouveau collecteur, données déjà connues ou mises à jour.", "", "RÉSULTAT", "Les données importées sont maintenant disponibles sur ce Ryzen dans la mémoire fusionnée locale.", "Prochaine étape projet : automatiser ce transfert via GitHub pour ne plus passer par Exporter / Importer." ].join("\n"); } } catch (error) { setSharedOutputStatus("fail"); if (els.sharedMemoryOutput) { els.sharedMemoryOutput.textContent = [ "❌ IMPORT REFUSÉ", "", "Le fichier choisi n’a pas pu être lu comme mémoire Atlas JSON.", String(error?.message || error) ].join("\n"); } }
} function setGithubMemoryStatus(kind = "", text = "") { if (els.githubMemoryStatus) { els.githubMemoryStatus.classList.remove("ok", "warn", "fail"); if (kind) els.githubMemoryStatus.classList.add(kind); if (text) els.githubMemoryStatus.textContent = text; } if (els.githubMemoryOutput) { els.githubMemoryOutput.classList.remove("ok", "warn", "fail"); if (kind) els.githubMemoryOutput.classList.add(kind); }
} function normalizeGithubMemoryPayload(payload) { if (!payload) return []; if (Array.isArray(payload)) return payload; if (Array.isArray(payload.records)) return payload.records; if (payload.latest && typeof payload.latest === "object") return [payload.latest]; if (Array.isArray(payload.snapshots)) return payload.snapshots; if (payload.assets && Array.isArray(payload.assets)) return [payload]; return [];
} function githubMemoryCollectorStats(records) { const counts = {}; for (const record of records || []) { const id = record.collector_id || record.exporter_collector_id || "github-action-main"; counts[id] = (counts[id] || 0) + 1; } const collectors = Object.keys(counts).sort(); return { collectors, counts, text: collectors.length ? collectors.map(id => `${id} (${counts[id]})`).join(" / ") : "aucun" };
} function stampGithubRecords(records) { return (records || []).map((record, index) => { const saved = record.saved_at || record.created_at || record.source_time || record.timestamp || new Date().toISOString(); const collector = record.collector_id || "github-action-main"; const key = record.snapshot_id || record.id || `${collector}_${String(saved).replace(/[:.]/g, "-")}_${index}`; return { ...record, id: key, snapshot_id: key, collector_id: collector, collector_type: record.collector_type || "github_shared_memory", imported_from_github: true, github_imported_at: new Date().toISOString(), saved_at: saved }; });
} async function fetchJsonNoCache(url) { const cacheBuster = `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`; const response = await fetch(cacheBuster, { cache: "no-store" }); if (!response.ok) { const error = new Error(`HTTP ${response.status}`); error.status = response.status; throw error; } return response.json();
} function atlasSafeMemoryUiRender(label, renderer) {
  try {
    renderer?.();
    return true;
  } catch (error) {
    console.error(`[Atlas Memory UI] ${label}`, error);
    return false;
  }
}

async function loadGithubSharedMemory(showMessages = true, loadMode = "manual") {
  atlasReadMemoryTruth();
  const mode = loadMode === "auto" ? "auto" : "manual";
  const attemptAt = new Date().toISOString();

  state.memoryTruth.github = {
    ...state.memoryTruth.github,
    loading: true,
    autoAttempted: state.memoryTruth.github.autoAttempted || mode === "auto",
    lastMode: mode,
    lastAttemptAt: attemptAt,
    lastError: null
  };
  atlasPersistMemoryTruth();
  setGithubMemoryStatus("warn", mode === "auto" ? "Auto GitHub" : "Lecture GitHub");
  atlasSafeMemoryUiRender("état initial GitHub", renderMemoryTruth);

  try {
    const payload = await fetchJsonNoCache(GITHUB_MEMORY_LATEST_URL);
    const records = stampGithubRecords(normalizeGithubMemoryPayload(payload));

    if (!records.length) {
      const errorText = "Le fichier data/latest.json ne contient aucun snapshot exploitable.";
      state.memoryTruth.github = {
        ...state.memoryTruth.github,
        loading: false,
        lastError: errorText,
        records: 0,
        added: 0,
        collectors: []
      };
      atlasPersistMemoryTruth();
      setGithubMemoryStatus("fail", "GitHub vide");
      if (els.githubMemoryOutput) {
        els.githubMemoryOutput.textContent = [
          "MÉMOIRE GITHUB VIDE",
          "",
          errorText,
          "Formats acceptés : records[] · snapshots[] · latest{} · snapshot unique avec assets[].",
          "",
          "La mémoire locale reste intacte."
        ].join("\n");
      }
      atlasSafeMemoryUiRender("vérité GitHub fichier vide", renderMemoryTruth);
      return { ok: false, records: [] };
    }

    const before = readAutoMemory();
    const beforeIds = new Set(before.map(record => record?.snapshot_id || record?.id).filter(Boolean));
    const merged = normalizeSharedRecords([...before, ...records], getCollectorId());
    writeAutoMemory(merged);

    const added = records.filter(record => {
      const id = record?.snapshot_id || record?.id;
      return id && !beforeIds.has(id);
    }).length;

    const stats = githubMemoryCollectorStats(records);
    const sortedRecords = [...records].sort((a, b) =>
      String(a?.saved_at || "").localeCompare(String(b?.saved_at || ""))
    );
    const last = sortedRecords[sortedRecords.length - 1];

    state.memoryTruth.github = {
      ...state.memoryTruth.github,
      loading: false,
      lastMode: mode,
      lastSuccessAt: new Date().toISOString(),
      lastError: null,
      lastRecordAt: last?.saved_at || last?.source_time || null,
      records: records.length,
      added,
      totalLocal: merged.length,
      collectors: stats.collectors
    };
    atlasPersistMemoryTruth();

    setGithubMemoryStatus("ok", mode === "auto" ? "GitHub OK · auto" : "GitHub OK · manuel");
    atlasSafeMemoryUiRender("Shared Memory après chargement GitHub", renderSharedMemory);
    atlasSafeMemoryUiRender("Auto Reader après chargement GitHub", renderAutoReader);

    if (els.githubMemoryOutput) {
      els.githubMemoryOutput.textContent = [
        "MÉMOIRE GITHUB CHARGÉE",
        "",
        `Mode : ${mode === "auto" ? "lecture automatique au démarrage" : "relecture manuelle forcée"}.`,
        `Snapshots lus depuis GitHub : ${records.length}.`,
        `Nouveaux snapshots ajoutés localement : ${added}.`,
        `Total mémoire locale fusionnée : ${merged.length}.`,
        `Collecteurs présents dans le relevé GitHub : ${stats.text}.`,
        "",
        "VÉRITÉ",
        "Les collecteurs listés sont présents dans les données chargées.",
        "Leur présence ne prouve pas que leurs machines collectent encore actuellement.",
        "Cette page GitHub Pages lit la mémoire, mais ne peut pas écrire dans le dépôt."
      ].join("\n");
    }

    atlasSafeMemoryUiRender("vérité GitHub après succès", renderMemoryTruth);
    return { ok: true, records, added };
  } catch (error) {
    const missing = error?.status === 404;
    const errorText = missing ? "data/latest.json absent" : cleanError(error);

    state.memoryTruth.github = {
      ...state.memoryTruth.github,
      loading: false,
      lastMode: mode,
      lastError: errorText
    };
    atlasPersistMemoryTruth();

    setGithubMemoryStatus(missing ? "warn" : "fail", missing ? "GitHub absent" : "GitHub indisponible");

    if (els.githubMemoryOutput) {
      els.githubMemoryOutput.textContent = [
        missing ? "MÉMOIRE GITHUB ABSENTE" : "LECTURE GITHUB IMPOSSIBLE",
        "",
        `Mode : ${mode === "auto" ? "tentative automatique au démarrage" : "relecture manuelle forcée"}.`,
        `Résultat : ${errorText}.`,
        "",
        `Snapshots locaux toujours disponibles : ${readAutoMemory().length}.`,
        "Aucune mémoire locale n’a été effacée.",
        "Le prochain chargement de page relancera automatiquement une lecture GitHub."
      ].join("\n");
    }

    atlasSafeMemoryUiRender("vérité GitHub après échec", renderMemoryTruth);
    return { ok: false, error };
  }
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
els.btnAutoNow?.addEventListener("click", () => { atlasTrackAudience("market_refresh_requested", { source: "auto_reader_button" }); refreshMarketOnly(); });
els.btnSaveCollectorId?.addEventListener("click", () => { setCollectorId(els.collectorIdInput?.value); renderSharedMemory(); renderAutoReader();
});
els.btnExportAutoMemory?.addEventListener("click", exportAutoMemory);
$("btnRecalculateCoverage")?.addEventListener("click", () => {
  atlasRenderMemoryCoverage();
  const button = $("btnRecalculateCoverage");
  if (button) {
    const previous = button.textContent;
    button.textContent = "Couverture recalculée";
    setTimeout(() => { button.textContent = previous || "Recalculer"; }, 1200);
  }
});
els.autoMemoryImport?.addEventListener("change", () => importAutoMemoryFile(els.autoMemoryImport.files?.[0]));
els.btnClearAutoMemory?.addEventListener("click", clearAutoMemory);
els.btnLoadGithubMemory?.addEventListener("click", () => loadGithubSharedMemory(true, "manual")); $("btnLivecheck")?.addEventListener("click", runLivecheck);
$("btnRefresh")?.addEventListener("click", () => { atlasTrackAudience("market_refresh_requested", { source: "market_button" }); refreshMarketOnly(); });
$("btnAddWatch")?.addEventListener("click", addWatch);
$("watchInput")?.addEventListener("keydown", event => {
  if (event.key === "Enter") addWatch();
});
$("btnAddWatchAlert")?.addEventListener("click", atlasWatchAddCondition);
$("watchAlertThreshold")?.addEventListener("keydown", event => {
  if (event.key === "Enter") atlasWatchAddCondition();
});
$("watchAlertList")?.addEventListener("click", event => {
  const toggle = event.target.closest("[data-watch-alert-toggle]");
  if (toggle) {
    atlasWatchToggleCondition(toggle.dataset.watchAlertToggle);
    return;
  }
  const remove = event.target.closest("[data-watch-alert-delete]");
  if (remove) atlasWatchDeleteCondition(remove.dataset.watchAlertDelete);
});
$("watchMemoryAssets")?.addEventListener("click", event => {
  const remove = event.target.closest("[data-watch-remove]");
  if (remove) atlasWatchRemoveAsset(remove.dataset.watchRemove);
});
$("btnClearWatchHistory")?.addEventListener("click", atlasWatchClearHistory); function atlasApplyRequestedPeriod(period) {
  const coin = getSelectedCoin();
  if (!coin) return;

  if (atlasComparisonActive()) {
    if (state.chartEngineV2?.controller) {
      try { state.chartEngineV2.controller.abort(); } catch {}
    }
    state.chartPeriodDays = period;
    atlasChartSetPeriodButtons(period, true);
    const preset = state.dataBroker.comparison.preset;
    if (preset === "gainers" || preset === "losers") {
      atlasSelectMarketPreset(preset, 5);
    } else {
      requestAnimationFrame(() => { void renderAnalystPanel({ periodChange: true }); });
    }
  } else {
    atlasPrepareChartSelection(coin, period);
    requestAnimationFrame(() => { void renderAnalystPanel({ periodChange: true, forceSingle: true }); });
  }
}

document.querySelectorAll(".period-btn[data-period]").forEach(btn => {
  btn.addEventListener("click", () => {
    const period = Number(btn.dataset.period) || 1;
    state.networkGovernor.pendingPeriod = period;
    atlasChartSetPeriodButtons(period, true);
    if (state.networkGovernor.periodTimer) clearTimeout(state.networkGovernor.periodTimer);
    state.networkGovernor.periodTimer = setTimeout(() => {
      state.networkGovernor.periodTimer = null;
      const requested = Number(state.networkGovernor.pendingPeriod || period);
      state.networkGovernor.pendingPeriod = null;
      atlasApplyRequestedPeriod(requested);
    }, ATLAS_PERIOD_DEBOUNCE_MS);
  });
});
els.btnChartSolo?.addEventListener("click", () => atlasResetComparison(getSelectedCoin() || state.coins?.[0] || null));
els.btnChartTop3?.addEventListener("click", () => atlasSelectTopComparison(3));
els.btnChartTop5?.addEventListener("click", () => atlasSelectTopComparison(5));
els.btnChartGainers?.addEventListener("click", () => atlasSelectMarketPreset("gainers", 5));
els.btnChartLosers?.addEventListener("click", () => atlasSelectMarketPreset("losers", 5));
els.btnChartVolume5?.addEventListener("click", () => atlasSelectMarketPreset("volume", 5));
els.btnChartReset?.addEventListener("click", atlasResetGraphDefaults);
els.btnChartClear?.addEventListener("click", atlasClearGraphSelection);
 window.addEventListener("resize", () => { if (state.chartEngineV2?.realChart) { requestAnimationFrame(() => state.chartEngineV2.realChart.resize()); }
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
    }
    const behavior = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? "auto" : "smooth";
    const scrollTarget = () => target.scrollIntoView({ behavior, block: "start" });
    requestAnimationFrame(scrollTarget);
    window.setTimeout(scrollTarget, 220);
  };

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", () => setTimeout(openTargetFromHash, 30));
  });
  window.addEventListener("hashchange", openTargetFromHash);
  openTargetFromHash();
}



/* =========================================================
   V2.0-alpha · Build 28.1 — Audience V2 moteur de session
   Événements uniques, séquence, journal local, heartbeat,
   état de livraison honnête et compatibilité console 26.42.
   La confirmation réception/déchiffrement/archive arrive en 26.45.
   ========================================================= */
const ATLAS_AUDIENCE_TOPIC = "erith-ia-crypto-286afc86493020aa82142cc25e759f6132709e1ee4578a25";
const ATLAS_AUDIENCE_PUBLISH_URL = `https://ntfy.sh/${ATLAS_AUDIENCE_TOPIC}`;
const ATLAS_AUDIENCE_PUBLIC_KEY_JWK = Object.freeze({"kty":"RSA","alg":"RSA-OAEP-256","ext":true,"n":"tH2iJ5Ii_HeGwA7FOvjCNnNZ5gwsfKo642GHEyWUiDZQpNcVqyhg-uEvn2RxbxzMHKcklPcz33JEH0fMqxe-EGvtB736AukhW_Ke6p5R7qOOlnqmelUQXq4uiJRaIcPKEWdBEXxvG4jQtYczDmuMVDC-svDzAHbwJ5iUy8fbeByvemni-ZUxpsH0u91-r5vU_oPD-qv8zy9UeqI51evO0iMSCqKzfAjHjSsCn1RjjKPyp1--uCKbfPEdBre2b1YMC_JcQs5ehLGgw4jYlxXGdOCs2D-Eoeoe4KVMMB-1et0Sb1g80Qr_6Fn47n-g3eo8X19otJn-BhsK6DaB-te2KQ","e":"AQAB"});
const ATLAS_AUDIENCE_MEMBER_KEY = "agent_crypto_erith_ia_audience_member_v2";
const ATLAS_AUDIENCE_VISITOR_KEY = "agent_crypto_erith_ia_audience_visitor_v2";
const ATLAS_AUDIENCE_SESSION_KEY = "agent_crypto_erith_ia_audience_session_v2";
const ATLAS_AUDIENCE_SESSION_META_KEY = "agent_crypto_erith_ia_audience_session_meta_v2";
const ATLAS_AUDIENCE_LEDGER_KEY = "agent_crypto_erith_ia_audience_ledger_v2";
const ATLAS_AUDIENCE_COUNTERS_KEY = "agent_crypto_erith_ia_audience_counters_v2";
const ATLAS_AUDIENCE_TOTAL_SUBMITTED_KEY = "agent_crypto_erith_ia_audience_submitted_total_v2";
const ATLAS_AUDIENCE_HEARTBEAT_MS = 90 * 1000;
const ATLAS_AUDIENCE_IDLE_MS = 5 * 60 * 1000;
const ATLAS_AUDIENCE_LEDGER_LIMIT = 120;
const ATLAS_AUDIENCE_DUPLICATE_WINDOW_MS = 700;
const ATLAS_AUDIENCE_BOOT_AT = Date.now();

function atlasAudienceStorageGet(storage, key, fallback = null) {
  try {
    const raw = storage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch { return fallback; }
}
function atlasAudienceStorageSet(storage, key, value) {
  try { storage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}
function atlasAudienceUuid(prefix = "evt") {
  const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${id}`;
}
function atlasAudienceEmptyCounters() {
  return { created: 0, encrypted: 0, attempted: 0, submitted: 0, failed: 0, suppressed: 0 };
}
function atlasAudienceLoadCounters() {
  const stored = atlasAudienceStorageGet(sessionStorage, ATLAS_AUDIENCE_COUNTERS_KEY, null);
  return stored && typeof stored === "object" ? { ...atlasAudienceEmptyCounters(), ...stored } : atlasAudienceEmptyCounters();
}
function atlasAudienceLoadLedger() {
  const stored = atlasAudienceStorageGet(sessionStorage, ATLAS_AUDIENCE_LEDGER_KEY, []);
  return Array.isArray(stored) ? stored.slice(-ATLAS_AUDIENCE_LEDGER_LIMIT) : [];
}
function atlasAudienceLoadSession() {
  const stored = atlasAudienceStorageGet(sessionStorage, ATLAS_AUDIENCE_SESSION_META_KEY, null);
  if (stored?.id && stored?.opened_at) {
    return {
      id: String(stored.id),
      opened_at: String(stored.opened_at),
      last_seen_at: String(stored.last_seen_at || stored.opened_at),
      closed_at: stored.closed_at || null,
      sequence: Number(stored.sequence) || 0,
      events_count: Number(stored.events_count) || 0,
      state: stored.state === "closed" ? "active" : String(stored.state || "active"),
      start_event_sent: Boolean(stored.start_event_sent)
    };
  }
  const id = atlasAudienceUuid("ses");
  try { sessionStorage.setItem(ATLAS_AUDIENCE_SESSION_KEY, id); } catch {}
  return {
    id,
    opened_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
    closed_at: null,
    sequence: 0,
    events_count: 0,
    state: "active",
    start_event_sent: false
  };
}

const atlasAudienceState = {
  network: null,
  cryptoKey: null,
  ready: false,
  lastError: null,
  lastEvent: null,
  lastHeartbeatAt: null,
  heartbeatTimer: null,
  renderTimer: null,
  lastActivityAt: Date.now(),
  lastActivityPersistAt: 0,
  idleReported: false,
  closing: false,
  lastSignature: "",
  lastSignatureAt: 0,
  counters: atlasAudienceLoadCounters(),
  ledger: atlasAudienceLoadLedger(),
  session: atlasAudienceLoadSession(),
  totalSubmitted: Number(atlasAudienceStorageGet(localStorage, ATLAS_AUDIENCE_TOTAL_SUBMITTED_KEY, 0)) || 0
};

function atlasAudiencePersist() {
  atlasAudienceStorageSet(sessionStorage, ATLAS_AUDIENCE_COUNTERS_KEY, atlasAudienceState.counters);
  atlasAudienceStorageSet(sessionStorage, ATLAS_AUDIENCE_LEDGER_KEY, atlasAudienceState.ledger.slice(-ATLAS_AUDIENCE_LEDGER_LIMIT));
  atlasAudienceStorageSet(sessionStorage, ATLAS_AUDIENCE_SESSION_META_KEY, atlasAudienceState.session);
  atlasAudienceStorageSet(localStorage, ATLAS_AUDIENCE_TOTAL_SUBMITTED_KEY, atlasAudienceState.totalSubmitted);
}
function atlasAudienceMember() {
  try {
    const params = new URLSearchParams(location.search);
    const fromUrl = String(params.get("member") || "").trim().slice(0, 80);
    if (fromUrl) localStorage.setItem(ATLAS_AUDIENCE_MEMBER_KEY, fromUrl);
    return fromUrl || String(localStorage.getItem(ATLAS_AUDIENCE_MEMBER_KEY) || "").trim();
  } catch { return ""; }
}
function atlasAudienceVisitorId() {
  try {
    let id = localStorage.getItem(ATLAS_AUDIENCE_VISITOR_KEY);
    if (!id) { id = atlasAudienceUuid("vis"); localStorage.setItem(ATLAS_AUDIENCE_VISITOR_KEY, id); }
    return id;
  } catch { return null; }
}
function atlasAudienceSessionId() {
  return atlasAudienceState.session?.id || atlasAudienceUuid("ses");
}
function atlasAudienceDevice() {
  const width = Math.max(screen?.width || 0, window.innerWidth || 0);
  if (/mobile|android|iphone|ipod/i.test(navigator.userAgent || "") || width < 700) return "mobile";
  if (/ipad|tablet/i.test(navigator.userAgent || "") || width < 1100) return "tablet";
  return "desktop";
}
function atlasAudienceBrowser() {
  const ua = navigator.userAgent || "";
  if (/Firefox\//i.test(ua)) return "Firefox";
  if (/Edg\//i.test(ua)) return "Edge";
  if (/Chrome\//i.test(ua)) return "Chrome";
  if (/Safari\//i.test(ua)) return "Safari";
  return "Other";
}
function atlasAudienceDurationSeconds() {
  const opened = Date.parse(atlasAudienceState.session?.opened_at || "");
  return Number.isFinite(opened) ? Math.max(0, Math.round((Date.now() - opened) / 1000)) : 0;
}
function atlasAudienceDurationLabel(seconds = atlasAudienceDurationSeconds()) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  if (total < 60) return `${total} s`;
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  if (minutes < 60) return `${minutes} min ${String(secs).padStart(2, "0")} s`;
  const hours = Math.floor(minutes / 60);
  return `${hours} h ${String(minutes % 60).padStart(2, "0")} min`;
}
function atlasAudienceB64(bytes) {
  let binary = "";
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < data.length; i += 0x8000) binary += String.fromCharCode(...data.subarray(i, i + 0x8000));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
async function atlasAudienceImportKey() {
  if (atlasAudienceState.cryptoKey) return atlasAudienceState.cryptoKey;
  atlasAudienceState.cryptoKey = await crypto.subtle.importKey("jwk", ATLAS_AUDIENCE_PUBLIC_KEY_JWK, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);
  return atlasAudienceState.cryptoKey;
}
async function atlasAudienceEncrypt(payload) {
  const encoder = new TextEncoder();
  const aesKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, encoder.encode(JSON.stringify(payload)));
  const rawAes = await crypto.subtle.exportKey("raw", aesKey);
  const rsaKey = await atlasAudienceImportKey();
  const encryptedKey = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, rsaKey, rawAes);
  return { v: 1, alg: "RSA-OAEP-256+A256GCM", event_id: payload.event_id, ek: atlasAudienceB64(encryptedKey), iv: atlasAudienceB64(iv), ct: atlasAudienceB64(ciphertext) };
}
async function atlasAudienceNetworkProfile() {
  if (atlasAudienceState.network) return atlasAudienceState.network;
  const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
  try {
    const response = await Promise.race([fetch("https://ipapi.co/json/", { cache: "no-store" }), timeout(5500)]);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    atlasAudienceState.network = {
      ip: data.ip || null, city: data.city || null, region: data.region || null,
      country: data.country_name || data.country || null, country_code: data.country_code || null,
      postal: data.postal || null, latitude: Number.isFinite(Number(data.latitude)) ? Number(data.latitude) : null,
      longitude: Number.isFinite(Number(data.longitude)) ? Number(data.longitude) : null,
      asn: data.asn || null, org: data.org || null
    };
  } catch {
    try {
      const response = await Promise.race([fetch("https://api64.ipify.org?format=json", { cache: "no-store" }), timeout(4500)]);
      const data = response.ok ? await response.json() : {};
      atlasAudienceState.network = { ip: data.ip || null, city: null, region: null, country: null, country_code: null, postal: null, latitude: null, longitude: null, asn: null, org: null };
    } catch { atlasAudienceState.network = { ip: null, city: null, region: null, country: null, country_code: null, postal: null, latitude: null, longitude: null, asn: null, org: null }; }
  }
  atlasRenderAudienceStatus();
  return atlasAudienceState.network;
}
function atlasAudienceEventSignature(eventName, detail = {}) {
  let detailText = "";
  try { detailText = JSON.stringify(detail); } catch { detailText = String(detail); }
  return `${String(eventName || "event")}|${location.hash || ""}|${detailText}`;
}
function atlasAudienceShouldSuppress(eventName, detail, options) {
  if (options?.allowDuplicate) return false;
  const signature = atlasAudienceEventSignature(eventName, detail);
  const now = Date.now();
  const duplicate = signature === atlasAudienceState.lastSignature && now - atlasAudienceState.lastSignatureAt < ATLAS_AUDIENCE_DUPLICATE_WINDOW_MS;
  atlasAudienceState.lastSignature = signature;
  atlasAudienceState.lastSignatureAt = now;
  if (duplicate) {
    atlasAudienceState.counters.suppressed += 1;
    atlasAudiencePersist();
  }
  return duplicate;
}
function atlasAudienceLedgerAdd(eventId, eventName, sequence, occurredAt) {
  const row = { event_id: eventId, event: eventName, sequence, occurred_at: occurredAt, state: "created", updated_at: occurredAt, error: null };
  atlasAudienceState.ledger.push(row);
  atlasAudienceState.ledger = atlasAudienceState.ledger.slice(-ATLAS_AUDIENCE_LEDGER_LIMIT);
  return row;
}
function atlasAudienceLedgerUpdate(eventId, state, error = null) {
  const row = [...atlasAudienceState.ledger].reverse().find(item => item.event_id === eventId);
  if (!row) return;
  row.state = state;
  row.updated_at = new Date().toISOString();
  row.error = error ? String(error).slice(0, 240) : null;
}
function atlasAudiencePayload(eventName, detail = {}, context = {}) {
  const network = atlasAudienceState.network || {};
  const occurredAt = context.occurredAt || new Date().toISOString();
  const session = atlasAudienceState.session;
  return {
    schema: "erith.audience.event.v2",
    audience_engine: "v2",
    app: "agent_crypto_erith_ia",
    version: ATLAS_RELEASE,
    event_id: context.eventId || atlasAudienceUuid("evt"),
    event: String(eventName || "event"),
    sequence: Number(context.sequence) || 0,
    occurred_at: occurredAt,
    visitor_id: atlasAudienceVisitorId(),
    session_id: atlasAudienceSessionId(),
    member_id: atlasAudienceMember() || null,
    session_opened_at: session.opened_at,
    session_last_seen_at: session.last_seen_at,
    session_duration_seconds: atlasAudienceDurationSeconds(),
    session_events_count: session.events_count,
    session_state: session.state,
    route: location.pathname,
    section: location.hash || "#analyste",
    title: document.title,
    language: navigator.language || null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
    local_hour: new Date().getHours(),
    browser: atlasAudienceBrowser(),
    platform: navigator.platform || null,
    user_agent: navigator.userAgent || null,
    device: atlasAudienceDevice(),
    viewport: `${window.innerWidth || 0}x${window.innerHeight || 0}`,
    screen: `${screen?.width || 0}x${screen?.height || 0}`,
    online: navigator.onLine !== false,
    visibility: document.visibilityState || null,
    connection: navigator.connection?.effectiveType || null,
    referrer: document.referrer || null,
    ip: network.ip || null,
    city: network.city || null,
    region: network.region || null,
    country: network.country || null,
    country_code: network.country_code || null,
    postal: network.postal || null,
    latitude: network.latitude ?? null,
    longitude: network.longitude ?? null,
    asn: network.asn || null,
    network_org: network.org || null,
    detail
  };
}
async function atlasTrackAudience(eventName, detail = {}, options = {}) {
  if (atlasAudienceShouldSuppress(eventName, detail, options)) return false;
  const occurredAt = new Date().toISOString();
  const eventId = atlasAudienceUuid("evt");
  atlasAudienceState.session.sequence += 1;
  atlasAudienceState.session.events_count += 1;
  atlasAudienceState.session.last_seen_at = occurredAt;
  atlasAudienceState.session.state = options.closing ? "closing" : "active";
  const sequence = atlasAudienceState.session.sequence;
  atlasAudienceState.counters.created += 1;
  atlasAudienceState.lastEvent = { name: String(eventName || "event"), at: occurredAt, event_id: eventId };
  atlasAudienceLedgerAdd(eventId, String(eventName || "event"), sequence, occurredAt);
  atlasAudiencePersist();
  atlasRenderAudienceStatus();
  try {
    if (!atlasAudienceState.network && !options.skipNetwork) await atlasAudienceNetworkProfile();
    const payload = atlasAudiencePayload(eventName, detail, { occurredAt, eventId, sequence });
    const envelope = await atlasAudienceEncrypt(payload);
    atlasAudienceState.counters.encrypted += 1;
    atlasAudienceLedgerUpdate(eventId, "encrypted");
    atlasAudienceState.counters.attempted += 1;
    atlasAudienceLedgerUpdate(eventId, "submit_attempted");
    atlasAudiencePersist();
    atlasRenderAudienceStatus();
    await fetch(ATLAS_AUDIENCE_PUBLISH_URL, {
      method: "POST",
      mode: "no-cors",
      cache: "no-store",
      keepalive: options.keepalive !== false,
      body: JSON.stringify(envelope)
    });
    atlasAudienceState.counters.submitted += 1;
    atlasAudienceState.totalSubmitted += 1;
    atlasAudienceState.ready = true;
    atlasAudienceState.lastError = null;
    atlasAudienceLedgerUpdate(eventId, "submitted_opaque");
    atlasAudiencePersist();
    atlasRenderAudienceStatus();
    return true;
  } catch (error) {
    atlasAudienceState.counters.failed += 1;
    atlasAudienceState.ready = false;
    atlasAudienceState.lastError = String(error?.message || error);
    atlasAudienceLedgerUpdate(eventId, "failed_local", atlasAudienceState.lastError);
    atlasAudiencePersist();
    atlasRenderAudienceStatus(atlasAudienceState.lastError);
    return false;
  }
}
function atlasAudienceSessionStateLabel() {
  if (navigator.onLine === false) return "Hors ligne";
  if (atlasAudienceState.closing) return "Fermeture";
  if (document.visibilityState === "hidden") return "Arrière-plan";
  const idle = Date.now() - atlasAudienceState.lastActivityAt;
  return idle >= ATLAS_AUDIENCE_IDLE_MS ? "Inactive" : "Active";
}
function atlasRenderAudienceStatus(errorText = "") {
  const network = atlasAudienceState.network || {};
  const counters = atlasAudienceState.counters;
  const locationText = [network.city, network.region, network.country].filter(Boolean).join(" · ") || "Localisation en attente";
  const moduleStatus = errorText ? "Erreur locale" : navigator.onLine === false ? "Hors ligne" : atlasAudienceState.ready ? "Audience V2 active" : "Initialisation";
  setText(document.getElementById("audienceModuleStatus"), moduleStatus);
  setText(document.getElementById("audienceIp"), network.ip || "En attente");
  setText(document.getElementById("audienceLocation"), locationText);
  setText(document.getElementById("audienceDevice"), `${atlasAudienceDevice()} · ${atlasAudienceBrowser()} · ${navigator.platform || "plateforme inconnue"}`);
  setText(document.getElementById("audienceMember"), atlasAudienceMember() || "visiteur non nommé");
  setText(document.getElementById("audienceSessionState"), atlasAudienceSessionStateLabel());
  setText(document.getElementById("audienceDuration"), atlasAudienceDurationLabel());
  setText(document.getElementById("audienceCreated"), String(counters.created));
  setText(document.getElementById("audienceAttempted"), String(counters.attempted));
  setText(document.getElementById("audienceSubmitted"), String(counters.submitted));
  setText(document.getElementById("audienceFailed"), String(counters.failed));
  setText(document.getElementById("audienceHeartbeat"), atlasAudienceState.lastHeartbeatAt ? new Date(atlasAudienceState.lastHeartbeatAt).toLocaleTimeString("fr-FR") : "En attente");
  setText(document.getElementById("audienceLast"), atlasAudienceState.lastEvent ? `${atlasAudienceState.lastEvent.name} · ${new Date(atlasAudienceState.lastEvent.at).toLocaleTimeString("fr-FR")}` : "—");
  setText(document.getElementById("audienceDeliveryCreated"), `Créé · ${counters.created}`);
  setText(document.getElementById("audienceDeliveryEncrypted"), `Chiffré · ${counters.encrypted}`);
  setText(document.getElementById("audienceDeliveryAttempted"), `Tenté · ${counters.attempted}`);
  setText(document.getElementById("audienceDeliverySubmitted"), `Remis navigateur · ${counters.submitted}`);
  setText(document.getElementById("audienceDeliveryConfirmed"), "Réception confirmée · console 26.45");
  const count = atlasAudienceState.ledger.length;
  setText(document.getElementById("audienceQueueState"), `Journal local : ${count} événement${count > 1 ? "s" : ""} · doublons évités : ${counters.suppressed}`);
}
function atlasAudienceMarkActivity() {
  const now = Date.now();
  atlasAudienceState.lastActivityAt = now;
  atlasAudienceState.session.last_seen_at = new Date(now).toISOString();
  atlasAudienceState.session.state = "active";
  atlasAudienceState.idleReported = false;
  if (now - atlasAudienceState.lastActivityPersistAt >= 5000) {
    atlasAudienceState.lastActivityPersistAt = now;
    atlasAudiencePersist();
  }
}
async function atlasAudienceHeartbeat() {
  if (atlasAudienceState.closing || document.visibilityState === "hidden" || navigator.onLine === false) {
    atlasRenderAudienceStatus();
    return false;
  }
  const idleSeconds = Math.max(0, Math.round((Date.now() - atlasAudienceState.lastActivityAt) / 1000));
  atlasAudienceState.lastHeartbeatAt = new Date().toISOString();
  const idle = idleSeconds * 1000 >= ATLAS_AUDIENCE_IDLE_MS;
  if (idle && atlasAudienceState.idleReported) {
    atlasRenderAudienceStatus();
    return false;
  }
  if (idle) atlasAudienceState.idleReported = true;
  return atlasTrackAudience(idle ? "session_idle" : "session_heartbeat", {
    duration_seconds: atlasAudienceDurationSeconds(),
    idle_seconds: idleSeconds,
    asset: state.selectedCoinId || null,
    page_visible: document.visibilityState !== "hidden"
  }, { allowDuplicate: true });
}
function atlasAudienceCloseSession(reason = "pagehide") {
  if (atlasAudienceState.closing) return;
  atlasAudienceState.closing = true;
  atlasAudienceState.session.state = "closing";
  atlasAudienceState.session.closed_at = new Date().toISOString();
  atlasAudiencePersist();
  atlasRenderAudienceStatus();
  void atlasTrackAudience("session_closed", {
    reason,
    duration_seconds: atlasAudienceDurationSeconds(),
    events_count: atlasAudienceState.session.events_count
  }, { allowDuplicate: true, skipNetwork: true, closing: true, keepalive: true });
}
function atlasAudienceExportDiagnostic() {
  const payload = {
    schema: "erith.audience.client_diagnostic.v2",
    version: ATLAS_RELEASE,
    exported_at: new Date().toISOString(),
    visitor_id: atlasAudienceVisitorId(),
    member_id: atlasAudienceMember() || null,
    session: atlasAudienceState.session,
    counters: atlasAudienceState.counters,
    total_submitted_local: atlasAudienceState.totalSubmitted,
    last_heartbeat_at: atlasAudienceState.lastHeartbeatAt,
    last_error: atlasAudienceState.lastError,
    ledger: atlasAudienceState.ledger
  };
  downloadTextFile(`ERITH_AUDIENCE_V2_SESSION_${new Date().toISOString().replace(/[:.]/g, "-")}.json`, "application/json", JSON.stringify(payload, null, 2));
}
async function atlasInitAudienceModule() {
  atlasAudiencePersist();
  atlasRenderAudienceStatus();
  await atlasDelay(900);
  await atlasAudienceNetworkProfile();
  if (!atlasAudienceState.session.start_event_sent) {
    atlasAudienceState.session.start_event_sent = true;
    atlasAudiencePersist();
    await atlasTrackAudience("session_started", { hash: location.hash || "#analyste", duration_seconds: atlasAudienceDurationSeconds() }, { allowDuplicate: true });
  }
  await atlasTrackAudience("app_open", { hash: location.hash || "#analyste", resumed_session: atlasAudienceState.session.events_count > 1 }, { allowDuplicate: true });
  document.querySelectorAll(".atlas-collapse").forEach(section => section.addEventListener("toggle", () => {
    if (section.open) void atlasTrackAudience("section_open", { key: section.dataset.collapseKey || section.id || "section" });
  }));
  document.querySelectorAll(".period-btn[data-period]").forEach(button => button.addEventListener("click", () => void atlasTrackAudience("chart_period", { asset: state.selectedCoinId || null, days: Number(button.dataset.period) || 1 })));
  window.addEventListener("hashchange", () => void atlasTrackAudience("section_change", { hash: location.hash || null }));
  window.addEventListener("online", () => { atlasAudienceMarkActivity(); void atlasTrackAudience("network_online", {}, { allowDuplicate: true }); });
  window.addEventListener("offline", () => { atlasAudienceMarkActivity(); atlasRenderAudienceStatus(); });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      atlasAudienceMarkActivity();
      void atlasTrackAudience("session_resumed", { duration_seconds: atlasAudienceDurationSeconds() }, { allowDuplicate: true });
    } else {
      void atlasTrackAudience("session_hidden", { duration_seconds: atlasAudienceDurationSeconds() }, { allowDuplicate: true, skipNetwork: true });
    }
  });
  ["pointerdown", "keydown", "touchstart"].forEach(type => window.addEventListener(type, atlasAudienceMarkActivity, { passive: true }));
  window.addEventListener("scroll", atlasAudienceMarkActivity, { passive: true });
  window.addEventListener("pagehide", () => atlasAudienceCloseSession("pagehide"), { capture: true });
  window.addEventListener("pageshow", event => {
    if (!event.persisted) return;
    atlasAudienceState.closing = false;
    atlasAudienceState.session.state = "active";
    atlasAudienceState.session.closed_at = null;
    atlasAudienceMarkActivity();
    void atlasTrackAudience("session_restored", { bfcache: true, duration_seconds: atlasAudienceDurationSeconds() }, { allowDuplicate: true });
  });
  document.getElementById("btnAudienceExport")?.addEventListener("click", atlasAudienceExportDiagnostic);
  atlasAudienceState.heartbeatTimer = window.setInterval(() => void atlasAudienceHeartbeat(), ATLAS_AUDIENCE_HEARTBEAT_MS);
  atlasAudienceState.renderTimer = window.setInterval(atlasRenderAudienceStatus, 1000);
}

function atlasInitNavigationSpy() {
  const links = [...document.querySelectorAll('.nav a[href^="#"]')];
  const entries = links.map(link => {
    const id = decodeURIComponent(String(link.getAttribute("href") || "").slice(1));
    return { link, id, target: document.getElementById(id) };
  }).filter(entry => entry.target);
  if (!entries.length) return;
  let scheduled = false;
  const update = () => {
    scheduled = false;
    const probe = window.scrollY + Math.min(window.innerHeight * 0.32, 260);
    let active = entries[0];
    for (const entry of entries) {
      if (entry.target.offsetTop <= probe) active = entry;
      else break;
    }
    for (const entry of entries) {
      const selected = entry === active;
      entry.link.classList.toggle("is-active", selected);
      if (selected) entry.link.setAttribute("aria-current", "location");
      else entry.link.removeAttribute("aria-current");
    }
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("hashchange", schedule);
  for (const { link } of entries) link.addEventListener("click", () => setTimeout(schedule, 0));
  update();
}


/* =========================================================
   Agent-Crypto V2 — global shell, palette and Math Dock
   ========================================================= */
const ATLAS_V2_MODE_KEY = "agent_crypto_erith_ia_v2_interface_mode";
const ATLAS_V2_MATH_DOCK_KEY = "agent_crypto_erith_ia_v2_math_dock";
const ATLAS_V2_ALLOWED_MODES = new Set(["essential", "advanced"]);
const ATLAS_V2_ALLOWED_MATH_DOCKS = new Set(["rail", "side", "top"]);

const ATLAS_V2_SECTION_MANIFEST = Object.freeze([
  { id: "livecheck", level: "essential", target: "self", group: "essential" },
  { id: "marche", level: "essential", target: "self", group: "essential" },
  { id: "market-workspace", level: "essential", target: "self", group: "essential" },
  { id: "analyste", level: "essential", target: "self", group: "essential" },
  { id: "watchlist", level: "advanced", target: "closest-collapse", group: "decision" },
  { id: "decision-board", level: "advanced", target: "self", group: "decision" },
  { id: "news-sentinel", level: "advanced", target: "self", group: "decision" },
  { id: "nofomo", level: "advanced", target: "closest-collapse", group: "decision" },

  { id: "math", level: "adaptive", target: "self", group: "analysis" },
  { id: "multi-horizon", level: "advanced", target: "self", group: "analysis" },
  { id: "lecture-froide", level: "advanced", target: "closest-collapse", group: "analysis" },
  { id: "risques", level: "advanced", target: "closest-collapse", group: "analysis" },
  { id: "debutant", level: "advanced", target: "closest-collapse", group: "analysis" },

  { id: "auto-reader", level: "advanced", target: "closest-collapse", group: "memory" },
  { id: "shared-memory", level: "advanced", target: "closest-collapse", group: "memory" },
  { id: "github-memory", level: "advanced", target: "closest-collapse", group: "memory" },
  { id: "newsSourceRegistry", level: "advanced", target: "self", group: "memory" },
  { id: "news-plan", level: "advanced", target: "closest-collapse", group: "memory" },

  { id: "situation", level: "advanced", target: "closest-collapse", group: "workshop" },
  { id: "questionnaire", level: "advanced", target: "closest-collapse", group: "workshop" },
  { id: "briefing", level: "advanced", target: "closest-collapse", group: "workshop" },
  { id: "impact", level: "advanced", target: "closest-collapse", group: "workshop" },
  { id: "simulation", level: "advanced", target: "closest-collapse", group: "workshop" },
  { id: "planning", level: "project", target: "closest-collapse", group: "workshop" },

  { id: "physical-security", level: "diagnostic", target: "closest-collapse", group: "system" },
  { id: "backend", level: "diagnostic", target: "closest-collapse", group: "system" },
  { id: "safety", level: "diagnostic", target: "closest-collapse", group: "system" },
  { id: "commandes", level: "diagnostic", target: "closest-collapse", group: "system" },
  { id: "sources", level: "adaptive", target: "closest-collapse", group: "system" },
  { id: "mesure-audience", level: "diagnostic", target: "self", group: "system" },

  { id: "missions-vie", level: "project", target: "self", group: "projects" },
  { id: "forge-aerith", level: "project", target: "self", group: "projects" },
  { id: "fonds-erith-ia", level: "project", target: "closest-collapse", group: "projects" },
  { id: "association-erith-ia", level: "project", target: "closest-collapse", group: "projects" },
  { id: "aerith-enfance", level: "project", target: "closest-collapse", group: "projects" },
  { id: "aerith-animaux", level: "project", target: "closest-collapse", group: "projects" },
  { id: "aerith-terre-vivante", level: "project", target: "closest-collapse", group: "projects" }
]);

const ATLAS_V2_MANIFEST_BY_ID = new Map(
  ATLAS_V2_SECTION_MANIFEST.map(entry => [entry.id, entry])
);

function atlasV2ManifestEntry(idOrHash) {
  const id = decodeURIComponent(String(idOrHash || "").replace(/^#/, ""));
  return ATLAS_V2_MANIFEST_BY_ID.get(id) || null;
}

function atlasV2ManifestTarget(entry) {
  if (!entry) return null;
  const element = document.getElementById(entry.id);
  if (!element) return null;
  if (entry.target === "closest-collapse") {
    return element.matches("details.atlas-collapse")
      ? element
      : element.closest("details.atlas-collapse") || element;
  }
  return element;
}

function atlasV2ClassifySections() {
  document.querySelectorAll(".v2-managed-section").forEach(element => {
    element.classList.remove("v2-managed-section", "v2-advanced-section");
    delete element.dataset.v2Section;
    delete element.dataset.v2Group;
    delete element.dataset.v2Level;
  });

  for (const entry of ATLAS_V2_SECTION_MANIFEST) {
    const target = atlasV2ManifestTarget(entry);
    if (!target) continue;

    target.classList.add("v2-managed-section");
    target.dataset.v2Level = entry.level;
    target.dataset.v2Group = entry.group;

    if (!["essential", "adaptive"].includes(entry.level)) {
      target.classList.add("v2-advanced-section");
      target.dataset.v2Section = "advanced";
    }

    if (entry.level === "project") target.dataset.v2Accent = "project";
    if (entry.level === "diagnostic") target.dataset.v2Accent = "diagnostic";
  }
}

function atlasV2ApplySectionVisibility(mode) {
  const advanced = mode === "advanced";
  const resolved = new Map();

  for (const entry of ATLAS_V2_SECTION_MANIFEST) {
    const target = atlasV2ManifestTarget(entry);
    if (!target || entry.level === "adaptive") continue;

    const visible = entry.level === "essential" || advanced;
    const previous = resolved.get(target);
    resolved.set(target, previous === true ? true : visible);
  }

  for (const [target, visible] of resolved) {
    target.hidden = !visible;
    target.setAttribute("aria-hidden", visible ? "false" : "true");
  }

  const risk = document.getElementById("risques");
  if (risk) {
    risk.hidden = !advanced;
    risk.setAttribute("aria-hidden", advanced ? "false" : "true");
  }

  const newsRegistry = document.getElementById("newsSourceRegistry");
  if (newsRegistry) {
    newsRegistry.hidden = !advanced;
    newsRegistry.setAttribute("aria-hidden", advanced ? "false" : "true");
  }
}

function atlasV2SyncMixedSectionLabels(mode) {
  const advanced = mode === "advanced";
  setText(
    document.getElementById("watchRiskCollapseTitle"),
    advanced ? "Watchlist V3 + Risques V2" : "Watchlist V3"
  );
  setText(
    document.getElementById("watchRiskCollapseSubtitle"),
    advanced
      ? "Actifs suivis, conditions et validation croisée"
      : "Actifs suivis et conditions locales"
  );
}

function atlasV2ModuleGroupLabel(group) {
  return {
    analysis: "Analyse V2",
    decision: "Décision et veille",
    memory: "Mémoire",
    workshop: "Atelier",
    system: "Système",
    projects: "Projets @erith.IA"
  }[group] || "Module V2";
}

function atlasCompactReleaseLabel() {
  return ATLAS_RELEASE.replace(" · Build ", " · ");
}

function atlasSyncReleaseLabels() {
  setText(document.getElementById("atlasV2ReleaseBadge"), atlasCompactReleaseLabel());
  setText(document.getElementById("situationReleaseBadge"), `${ATLAS_RELEASE} · Math Core V2`);
  setText(
    document.getElementById("footerRelease"),
    `Agent-Crypto @erith.IA ${ATLAS_RELEASE} — CLEAN HOME · INLINE DATA STATUS · ZERO EXTRA PANELS · ADMIN GRAPH TOGGLE · MARKET RECENTER · FORGE PRO BRIDGE`
  );
}

function atlasV2ReadSetting(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function atlasV2WriteSetting(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function atlasV2Mode() {
  const stored = atlasV2ReadSetting(ATLAS_V2_MODE_KEY, "essential");
  return ATLAS_V2_ALLOWED_MODES.has(stored) ? stored : "essential";
}

function atlasV2ApplyMode(mode, options = {}) {
  const next = ATLAS_V2_ALLOWED_MODES.has(mode) ? mode : "essential";
  document.documentElement.dataset.atlasMode = next;
  document.body.dataset.atlasMode = next;

  document.querySelectorAll("[data-atlas-mode]").forEach(button => {
    const active = button.dataset.atlasMode === next;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });

  const title = document.getElementById("atlasV2ModeTitle");
  const description = document.getElementById("atlasV2ModeDescription");
  const administrator = next === "advanced";

  document.documentElement.dataset.atlasRole =
    administrator ? "administrator" : "operator";
  document.body.dataset.atlasRole =
    administrator ? "administrator" : "operator";

  if (title) {
    title.textContent = administrator
      ? "Complet Administrateur"
      : "Essentiel";
  }

  if (description) {
    description.textContent = administrator
      ? "Administration locale · analyse · mémoire · décision · système · projets · sources."
      : "Accueil · graphique · marché · Math Core · liste crypto · sources.";
  }

  const accountToggle = document.getElementById("btnAdminAccountToggle");
  const accountText = document.getElementById("adminAccountLinkText");
  if (accountToggle) {
    accountToggle.classList.toggle("is-admin", administrator);
    accountToggle.setAttribute("aria-pressed", administrator ? "true" : "false");
    accountToggle.setAttribute(
      "aria-label",
      administrator
        ? "Retourner à l’interface Essentiel"
        : "Ouvrir le compte Administrateur"
    );
  }
  if (accountText) {
    accountText.textContent = administrator
      ? "Retour Essentiel"
      : "Compte Administrateur";
  }

  atlasV2ApplySectionVisibility(next);
  atlasV2SyncMixedSectionLabels(next);

  const liveSourcesCollapse = document.getElementById("liveSourcesCollapse");
  if (liveSourcesCollapse) {
    liveSourcesCollapse.hidden = false;
    liveSourcesCollapse.setAttribute("aria-hidden", "false");
  }

  document.querySelectorAll(".atlas-v2-nav-advanced").forEach(element => {
    element.hidden = next !== "advanced";
  });

  if (next === "essential") {
    const legacy = document.querySelector("[data-collapse-key='mode-debutant-avance']");
    if (legacy) legacy.hidden = true;

    atlasV2ApplyMathDock("top", { persist: false });
    atlasSetCleanLensCollapsed(true, false);

    const marketPanel = document.getElementById("marketSnapshotPanel");
    if (marketPanel) marketPanel.dataset.marketColumns = "essential";
  } else {
    atlasV2ApplyMathDock(atlasV2MathDockPosition(), { persist: false });

    let detailCollapsed = false;
    try { detailCollapsed = localStorage.getItem(ATLAS_CLEAN_LENS_PANEL_KEY) === "1"; } catch {}
    atlasSetCleanLensCollapsed(detailCollapsed, false);

    const marketPanel = document.getElementById("marketSnapshotPanel");
    if (marketPanel) marketPanel.dataset.marketColumns = state.chartViewV2?.marketColumns || "essential";
  }

  atlasChartV2SyncControls?.();
  if (typeof renderAtlasMathCore === "function") renderAtlasMathCore();

  if (options.persist !== false) atlasV2WriteSetting(ATLAS_V2_MODE_KEY, next);
  atlasScheduleStableChartResize();
  atlasScheduleRuntimeValidation("mode-apply");
  window.dispatchEvent(new CustomEvent("atlas:v2mode", { detail: { mode: next } }));
}

function atlasV2MathDockPosition() {
  const stored = atlasV2ReadSetting(ATLAS_V2_MATH_DOCK_KEY, "side");
  return ATLAS_V2_ALLOWED_MATH_DOCKS.has(stored) ? stored : "side";
}

function atlasV2SyncMathRail() {
  const scoreText = document.getElementById("scoreValue")?.textContent?.trim() || "—";
  const label = document.getElementById("scoreLabel")?.textContent?.trim() || "En attente";
  const score = Number(scoreText);
  const band = atlasMathScoreBand(score);
  const rail = document.getElementById("math");

  setText(document.getElementById("atlasMathRailScore"), scoreText);

  if (rail) {
    rail.dataset.mathRailBand = band.id;
    rail.style.setProperty("--math-rail-color", band.color);
  }
}

function atlasV2ApplyMathDock(position, options = {}) {
  const next = ATLAS_V2_ALLOWED_MATH_DOCKS.has(position) ? position : "side";
  const grid = document.getElementById("marketWorkspaceGrid");
  const market = document.getElementById("marketSnapshotPanel");
  const math = document.getElementById("math");
  const topDock = document.getElementById("mathTopDock");
  if (!grid || !market || !math || !topDock) return;

  grid.classList.remove("math-dock-side", "math-dock-rail", "math-dock-top");
  math.classList.remove("is-side", "is-rail", "is-top");
  math.dataset.mathDock = next;

  if (next === "top") {
    topDock.hidden = false;
    topDock.appendChild(math);
    grid.classList.add("math-dock-top");
    math.classList.add("is-top");
  } else {
    topDock.hidden = true;
    grid.appendChild(math);
    grid.classList.add(next === "rail" ? "math-dock-rail" : "math-dock-side");
    math.classList.add(next === "rail" ? "is-rail" : "is-side");
  }

  document.querySelectorAll("[data-math-position]").forEach(button => {
    button.classList.toggle("is-active", button.dataset.mathPosition === next);
  });

  atlasV2SyncMathRail();
  if (typeof renderAtlasMathCore === "function") renderAtlasMathCore();
  if (options.persist !== false) atlasV2WriteSetting(ATLAS_V2_MATH_DOCK_KEY, next);

  atlasScheduleStableChartResize();
  atlasScheduleRuntimeValidation("math-dock");
}

function atlasV2DecisionLockRefresh() {
  const chartReady = state.dataBroker?.chart?.status === "ready";
  const newsReady = ["ok", "partial"].includes(newsFeedState?.status);
  const marketReady = !!state.liveOk && !!state.coins?.length;

  setText(document.getElementById("decisionLockData"), marketReady ? "Marché réel chargé" : "Marché en attente");
  setText(document.getElementById("decisionLockChart"), chartReady ? "Série vérifiée" : "Graphe à confirmer");
  setText(
    document.getElementById("decisionLockNews"),
    newsReady
      ? `${newsFeedState.events.length} événement${newsFeedState.events.length > 1 ? "s" : ""}`
      : "Archive à confirmer"
  );
  setText(document.getElementById("decisionLockHuman"), "Validation humaine");
}

function atlasV2OpenAdvancedForTarget(hash, options = {}) {
  const id = decodeURIComponent(String(hash || "").replace(/^#/, ""));
  if (!id) return false;

  const entry = atlasV2ManifestEntry(id);
  const target = document.getElementById(id);
  if (!target) return false;

  if (entry && !["essential", "adaptive"].includes(entry.level) && atlasV2Mode() !== "advanced") {
    atlasV2ApplyMode("advanced");
  }

  const managed = entry ? atlasV2ManifestTarget(entry) : target;
  if (managed) {
    managed.hidden = false;
    managed.setAttribute("aria-hidden", "false");
  }

  const collapse = target.matches("details.atlas-collapse")
    ? target
    : target.closest("details.atlas-collapse");
  if (collapse) collapse.open = true;

  const selector = document.getElementById("atlasV2AdvancedModuleSelect");
  if (selector && [...selector.options].some(option => option.value === id)) {
    selector.value = id;
  }

  if (options.updateHash !== false) {
    try {
      history.pushState(null, "", `#${encodeURIComponent(id)}`);
    } catch {
      location.hash = id;
    }
  }

  if (options.scroll !== false) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: options.instant ? "auto" : "smooth", block: "start" });
      });
    });
  }

  return true;
}

function atlasV2OpenSelectedModule() {
  const selector = document.getElementById("atlasV2AdvancedModuleSelect");
  const id = selector?.value || "";
  if (!id) return;
  atlasV2OpenAdvancedForTarget(`#${id}`);
}

function atlasV2HandleHashTarget(options = {}) {
  if (!location.hash) return;
  const id = decodeURIComponent(location.hash.slice(1));
  const entry = atlasV2ManifestEntry(id);
  if (!entry) return;

  atlasV2OpenAdvancedForTarget(location.hash, {
    updateHash: false,
    scroll: options.scroll !== false,
    instant: options.instant === true
  });
}

function atlasV2SyncAdvancedSelectorFromViewport() {
  if (atlasV2Mode() !== "advanced") return;
  const selector = document.getElementById("atlasV2AdvancedModuleSelect");
  if (!selector) return;

  const probe = window.scrollY + Math.min(window.innerHeight * 0.3, 240);
  let current = "";

  for (const entry of ATLAS_V2_SECTION_MANIFEST) {
    if (["essential", "adaptive"].includes(entry.level)) continue;
    const target = document.getElementById(entry.id);
    if (!target || target.hidden) continue;
    if (target.offsetTop <= probe) current = entry.id;
  }

  if (current && [...selector.options].some(option => option.value === current)) {
    selector.value = current;
  }
}

function atlasInitV2Shell() {
  atlasV2ClassifySections();

  document.getElementById("btnAdminAccountToggle")?.addEventListener("click", () => {
    atlasV2ApplyMode(
      atlasV2Mode() === "advanced" ? "essential" : "advanced"
    );
  });

  document.querySelectorAll("[data-math-position]").forEach(button => {
    button.addEventListener("click", () => atlasV2ApplyMathDock(button.dataset.mathPosition));
  });

  document.querySelectorAll(".atlas-v2-nav-essential a").forEach(link => {
    link.addEventListener("click", () => {
      const hash = link.getAttribute("href");
      if (hash) atlasV2OpenAdvancedForTarget(hash, { updateHash: false, scroll: false });
    });
  });

  document.getElementById("btnOpenAdvancedModule")?.addEventListener("click", atlasV2OpenSelectedModule);
  document.addEventListener("click", event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute("href");
    const entry = atlasV2ManifestEntry(hash);
    if (!entry || ["essential", "adaptive"].includes(entry.level)) return;
    event.preventDefault();
    atlasV2OpenAdvancedForTarget(hash);
  });

  window.addEventListener("hashchange", () => atlasV2HandleHashTarget({ scroll: true }));

  let selectorScheduled = false;
  const scheduleSelectorSync = () => {
    if (selectorScheduled) return;
    selectorScheduled = true;
    requestAnimationFrame(() => {
      selectorScheduled = false;
      atlasV2SyncAdvancedSelectorFromViewport();
    });
  };
  window.addEventListener("scroll", scheduleSelectorSync, { passive: true });
  window.addEventListener("resize", scheduleSelectorSync, { passive: true });

  atlasV2ApplyMathDock(atlasV2MathDockPosition(), { persist: false });
  atlasV2ApplyMode(atlasV2Mode(), { persist: false });
  atlasV2DecisionLockRefresh();

  if (location.hash) {
    requestAnimationFrame(() => atlasV2HandleHashTarget({ scroll: false, instant: true }));
  }

  window.setInterval(() => {
    atlasV2SyncMathRail();
    atlasV2DecisionLockRefresh();
  }, 2000);
}



const ATLAS_RUNTIME_EXPECTED_CONTROLS = Object.freeze({
  view: 2,
  scale: 2,
  display: 2,
  period: 7,
  compare: 8
});

const ATLAS_RUNTIME_REQUIRED_IDS = Object.freeze([
  "atlasV2ModeTitle",
  "atlasV2ReleaseBadge",
  "btnAdminAccountToggle",
  "adminAccountLinkText",
  "livecheck",
  "analyste",
  "market-workspace",
  "marketSnapshotPanel",
  "marketWorkspaceGrid",
  "math",
  "atlasMathRailTrigger",
  "sources",
  "liveSourcesCollapse",
  "chart",
  "activeChartSummary"
]);

let atlasStableResizeFrame = 0;
let atlasStableResizeTimer = 0;
let atlasRuntimeValidationTimer = 0;

function atlasRuntimeControlCounts() {
  return {
    view: document.querySelectorAll("[data-chart-view]").length,
    scale: document.querySelectorAll("[data-chart-scale]").length,
    display: document.querySelectorAll("[data-chart-display]").length,
    period: document.querySelectorAll(".period-btn").length,
    compare: document.querySelectorAll(".compare-btn").length
  };
}

function atlasRuntimeViewportProfile(width = window.innerWidth) {
  const value = Number(width) || 0;
  if (value >= 1500) return "wide";
  if (value >= 1180) return "desktop";
  if (value >= 800) return "transformer";
  if (value >= 620) return "compact";
  return "mobile";
}

function atlasScheduleStableChartResize() {
  if (atlasStableResizeFrame) cancelAnimationFrame(atlasStableResizeFrame);
  if (atlasStableResizeTimer) clearTimeout(atlasStableResizeTimer);

  atlasStableResizeFrame = requestAnimationFrame(() => {
    atlasStableResizeFrame = 0;
    try { state.chartEngineV2?.realChart?.resize?.(); } catch {}
    try { atlasCleanLensResizeChart?.(); } catch {}
  });

  atlasStableResizeTimer = window.setTimeout(() => {
    atlasStableResizeTimer = 0;
    try { state.chartEngineV2?.realChart?.resize?.(); } catch {}
    try { atlasCleanLensResizeChart?.(); } catch {}
  }, 180);
}

function atlasSyncResponsiveRuntime() {
  const root = document.documentElement;
  const profile = atlasRuntimeViewportProfile();
  const previous = root.dataset.atlasViewport || "";

  root.dataset.atlasViewport = profile;
  root.style.setProperty("--atlas-runtime-width", `${Math.max(0, window.innerWidth)}px`);
  root.style.setProperty("--atlas-runtime-height", `${Math.max(0, window.innerHeight)}px`);

  if (previous !== profile) {
    window.dispatchEvent(new CustomEvent("atlas:viewport", {
      detail: { previous, profile, width: window.innerWidth, height: window.innerHeight }
    }));
  }

  atlasScheduleStableChartResize();
}

function atlasRuntimeVisibilityLeaks() {
  if (atlasV2Mode() !== "essential") return [];

  return ATLAS_V2_SECTION_MANIFEST
    .filter(entry => !["essential", "adaptive"].includes(entry.level))
    .filter(entry => {
      const target = atlasV2ManifestTarget(entry);
      if (!target) return false;
      return target.hidden === false && getComputedStyle(target).display !== "none";
    })
    .map(entry => entry.id);
}

function atlasRuntimeValidate(reason = "manual") {
  const missingIds = ATLAS_RUNTIME_REQUIRED_IDS.filter(id => !document.getElementById(id));
  const controls = atlasRuntimeControlCounts();
  const controlErrors = Object.entries(ATLAS_RUNTIME_EXPECTED_CONTROLS)
    .filter(([key, expected]) => controls[key] !== expected)
    .map(([key, expected]) => ({ key, expected, actual: controls[key] }));

  const leaks = atlasRuntimeVisibilityLeaks();
  const sources = document.getElementById("liveSourcesCollapse");
  const sourceVisible = !!sources && sources.hidden === false && getComputedStyle(sources).display !== "none";
  const releaseVisible = document.getElementById("atlasV2ReleaseBadge")?.textContent?.includes(ATLAS_RELEASE) === true;

  const report = {
    release: ATLAS_RELEASE,
    checked_at: new Date().toISOString(),
    reason,
    mode: atlasV2Mode(),
    viewport: document.documentElement.dataset.atlasViewport || atlasRuntimeViewportProfile(),
    missing_ids: missingIds,
    control_counts: controls,
    control_errors: controlErrors,
    advanced_leaks_in_essential: leaks,
    live_sources_visible: sourceVisible,
    release_visible: releaseVisible,
    ok: !missingIds.length && !controlErrors.length && !leaks.length && sourceVisible && releaseVisible
  };

  window.__ATLAS_RUNTIME_REPORT__ = report;
  document.documentElement.dataset.atlasRuntime = report.ok ? "ok" : "degraded";

  if (!report.ok) {
    console.warn("Atlas runtime validation", report);
  }

  return report;
}

function atlasScheduleRuntimeValidation(reason = "scheduled") {
  if (atlasRuntimeValidationTimer) clearTimeout(atlasRuntimeValidationTimer);
  atlasRuntimeValidationTimer = window.setTimeout(() => {
    atlasRuntimeValidationTimer = 0;
    atlasRuntimeValidate(reason);
  }, 90);
}

function atlasRestoreRuntimeUi(reason = "restore") {
  atlasV2ClassifySections();
  atlasV2ApplyMode(atlasV2Mode(), { persist: false });
  atlasV2ApplyMathDock(
    atlasV2Mode() === "essential" ? "rail" : atlasV2MathDockPosition(),
    { persist: false }
  );
  atlasChartV2SyncControls?.();
  atlasSyncReleaseLabels();
  atlasSyncResponsiveRuntime();
  atlasScheduleRuntimeValidation(reason);
}

function atlasInitRuntimeStability() {
  atlasSyncResponsiveRuntime();

  let resizeQueued = false;
  const onResize = () => {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(() => {
      resizeQueued = false;
      atlasSyncResponsiveRuntime();
      atlasScheduleRuntimeValidation("resize");
    });
  };

  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onResize, { passive: true });

  window.addEventListener("pageshow", event => {
    requestAnimationFrame(() => {
      atlasRestoreRuntimeUi(event.persisted ? "pageshow-cache" : "pageshow");
    });
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) atlasRestoreRuntimeUi("visibility-return");
  });

  window.addEventListener("atlas:v2mode", () => {
    atlasScheduleStableChartResize();
    atlasScheduleRuntimeValidation("mode-change");
  });

  window.addEventListener("atlas:viewport", () => {
    atlasScheduleRuntimeValidation("viewport-change");
  });

  requestAnimationFrame(() => {
    atlasScheduleRuntimeValidation("initial");
  });
}

const ATLAS_STORAGE_SCHEMA_KEY = "agent_crypto_erith_ia_storage_schema";
const ATLAS_STORAGE_SCHEMA_VERSION = 28113;

function atlasStorageSafeJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

function atlasMigrateStorage28111() {
  const mode = atlasV2ReadSetting(ATLAS_V2_MODE_KEY, "essential");
  if (!ATLAS_V2_ALLOWED_MODES.has(mode)) {
    atlasV2WriteSetting(ATLAS_V2_MODE_KEY, "essential");
  }

  const dock = atlasV2ReadSetting(ATLAS_V2_MATH_DOCK_KEY, "side");
  if (!ATLAS_V2_ALLOWED_MATH_DOCKS.has(dock)) {
    atlasV2WriteSetting(ATLAS_V2_MATH_DOCK_KEY, "side");
  }

  const storedChartSettings = atlasStorageSafeJson(ATLAS_CHART_V2_SETTINGS_KEY);
  const chartSettings = storedChartSettings && typeof storedChartSettings === "object"
    ? storedChartSettings
    : {};

  const previousSchema = Number(localStorage.getItem(ATLAS_STORAGE_SCHEMA_KEY) || 0);
  const preserveLegendChoice = previousSchema >= ATLAS_STORAGE_SCHEMA_VERSION;
  const sanitizedChartSettings = {
    view: chartSettings.view === "base100" ? "base100" : "price",
    scale: chartSettings.scale === "logarithmic" ? "logarithmic" : "linear",
    volume: chartSettings.volume !== false,
    legend: preserveLegendChoice && chartSettings.legend === true,
    comparisonLegend: preserveLegendChoice && chartSettings.comparisonLegend === true,
    marketColumns: chartSettings.marketColumns === "complete" ? "complete" : "essential"
  };

  try {
    localStorage.setItem(ATLAS_CHART_V2_SETTINGS_KEY, JSON.stringify(sanitizedChartSettings));
  } catch {}

  try {
    const panelState = localStorage.getItem(ATLAS_CLEAN_LENS_PANEL_KEY);
    if (previousSchema < ATLAS_STORAGE_SCHEMA_VERSION) {
      localStorage.setItem(ATLAS_CLEAN_LENS_PANEL_KEY, "1");
    } else if (!["0", "1", null].includes(panelState)) {
      localStorage.setItem(ATLAS_CLEAN_LENS_PANEL_KEY, "1");
    }
  } catch {}

  try {
    const watchIds = JSON.parse(localStorage.getItem(WATCH_STORAGE_KEY) || "null");
    if (watchIds !== null && !Array.isArray(watchIds)) {
      localStorage.removeItem(WATCH_STORAGE_KEY);
    }
  } catch {
    try { localStorage.removeItem(WATCH_STORAGE_KEY); } catch {}
  }

  try {
    const alerts = JSON.parse(localStorage.getItem(WATCH_ALERT_STORAGE_KEY) || "null");
    if (alerts !== null && !Array.isArray(alerts)) {
      localStorage.removeItem(WATCH_ALERT_STORAGE_KEY);
    }
  } catch {
    try { localStorage.removeItem(WATCH_ALERT_STORAGE_KEY); } catch {}
  }

  try {
    localStorage.setItem(ATLAS_STORAGE_SCHEMA_KEY, String(ATLAS_STORAGE_SCHEMA_VERSION));
  } catch {}
}

function atlasSafeBoot(label, fn) { try { return fn(); } catch (error) { console.warn(`Boot Atlas ignoré : ${label}`, error); return null; }
} atlasSafeBoot("release labels 28.1.15", atlasSyncReleaseLabels);
atlasSafeBoot("storage migration 28.1.15", atlasMigrateStorage28111);
atlasSafeBoot("navigation order and active section", atlasInitNavigationSpy);
atlasSafeBoot("Agent-Crypto V2 global shell", atlasInitV2Shell);
atlasSafeBoot("runtime responsive validation 28.1.15", atlasInitRuntimeStability);
atlasSafeBoot("Graphique Analyste V2 controls", atlasInitChartV2Controls);
atlasSafeBoot("Graphique Max coverage truth", atlasRenderChartMaxTruth);
atlasSafeBoot("Market ribbons V2 interactions", atlasInitMarketRibbonInteractions);
atlasSafeBoot("Champagne Luxe Clean Lens", initAtlasCleanLensPanel);
atlasSafeBoot("collapsible layout", initAtlasCollapsibleLayout);
atlasSafeBoot("audience module", atlasInitAudienceModule);
atlasSafeBoot("source grid", renderSourceGrid);
atlasSafeBoot("source diagnostic", renderSourceDiagnostic);
atlasSafeBoot("source metric", () => updateSourceMetric(0));
atlasSafeBoot("ticker", renderTicker);
atlasSafeBoot("empty market", () => renderEmptyMarket("Livecheck requis. Aucun prix inventé."));
atlasSafeBoot("score", () => renderScore(null));
atlasSafeBoot("watch ids", loadWatchIds);
atlasSafeBoot("watch memory V3", atlasWatchSyncProfiles);
atlasSafeBoot("watchlist", renderWatchlist);
atlasSafeBoot("risk grid", renderRiskGrid);
atlasSafeBoot("cold read", () => renderColdRead(false));
atlasSafeBoot("auto reader render", renderAutoReader);
atlasSafeBoot("shared memory render", renderSharedMemory);
atlasSafeBoot("memory truth render", renderMemoryTruth);
atlasSafeBoot("memory coverage render", atlasRenderMemoryCoverage);
atlasSafeBoot("github memory initial state", () => loadGithubSharedMemory(false, "auto"));
atlasSafeBoot("beginner summary", renderBeginnerSummary);
atlasSafeBoot("data broker strip", atlasRenderBrokerStrip);
atlasSafeBoot("silent local market fallback", atlasPrimeMarketCacheSilently);
requestAnimationFrame(() => atlasSafeBoot("market snapshot integrity", atlasEnsureMarketDomIntegrity));
window.addEventListener("pageshow", () => {
  requestAnimationFrame(() => atlasSafeBoot("market snapshot pageshow integrity", atlasEnsureMarketDomIntegrity));
});
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
} /* Atlas-10 Crypto — Math Core intégré V2.0-alpha · Build 28.1 Source: modules .md Atlas Math. Exécution: traduction JS condensée. Lecture seule : validation humaine, aucune clé API, aucun capital engagé. */
function atlasFmtPct(n) { return typeof n === "number" && Number.isFinite(n) ? `${n >= 0 ? "+" : ""}${n.toFixed(2)} %` : "—";
} function atlasFmtEUR(n) { return typeof n === "number" && Number.isFinite(n) ? fmtEUR.format(n) : "—";
} function atlasSelectedCoin() { if (!Array.isArray(state.coins) || !state.coins.length) return null; return state.coins.find(c => c.id === state.selectedCoinId) || state.coins[0] || null;
} function computeAtlasDataQuality(coin) { const missing = []; if (!coin) missing.push("actif"); if (coin && typeof coin.price !== "number") missing.push("prix EUR"); if (coin && typeof coin.volume24h !== "number") missing.push("volume 24h"); if (coin && !atlasCanonicalCoin(coin)) missing.push("source canonique"); if (!state.sourceLock?.valid) missing.push("Source Lock"); if (coin && !coin.timestamp) missing.push("timestamp"); const score = clamp(0, 100, 100 - missing.length * 24); return { score, status: score >= 80 ? "ok" : score >= 50 ? "faible" : "refus", missing };
} function computeAtlasMarketMath(coin) { if (!coin) { return { score: 0, reason: "Livecheck requis", human: "aucune lecture marché sans source", change24h: null, change7d: null, fomoPenalty: 0 }; } const change24h = typeof coin.change24h === "number" ? coin.change24h : null; const change7d = typeof coin.change7d === "number" ? coin.change7d : null; const volumeScore = typeof coin.volume24h === "number" && coin.volume24h > 0 ? 20 : 0; const momentumScore = change24h === null ? 0 : clamp(0, 35, 18 + change24h * 2); const fomoPenalty = change24h !== null && Math.abs(change24h) > 12 ? 20 : 0; const score = clamp(0, 100, 35 + volumeScore + momentumScore - fomoPenalty); return { score, reason: fomoPenalty ? "Mouvement fort : prudence" : "Marché lisible en observation", human: fomoPenalty ? "marché actif, entrée possiblement tardive" : "marché lisible en observation", change24h, change7d, fomoPenalty };
} function computeAtlasScenarioMath(coin) {
  if (!coin || typeof coin.price !== "number" || !Number.isFinite(coin.price) || coin.price <= 0) {
    return { reason: "Scénario indisponible sans prix réel", human: "Aucune projection locale" };
  }
  return {
    reason: "Hypothèse locale ±3 %",
    human: `+3 % : ${atlasFmtEUR(coin.price * 1.03)} · −3 % : ${atlasFmtEUR(coin.price * 0.97)}`
  };
}

function atlasMathCard(title, value, detail, human = "") { return ` <div class="atlas-math-card"> <span>${escapeHtml(title)}</span> <b>${escapeHtml(value)}</b> <small>${escapeHtml(detail || "")}</small> ${human ? `<em>${escapeHtml(human)}</em>` : ""} </div>`;
}
function atlasMathSourceCard(source, freshness) {
  return `<div class="atlas-math-card" data-atlas-math-card="source">
    <span>Source</span>
    <b>${escapeHtml(source || "En attente")}</b>
    <small>Fraîcheur <strong data-atlas-math-freshness>${escapeHtml(freshness || "Inconnue")}</strong></small>
  </div>`;
}
function atlasRefreshMathFreshnessOnly() {
  const freshness = atlasMathFreshnessLabel(atlasSelectedCoin());
  document.querySelectorAll("[data-atlas-math-freshness]").forEach(node => {
    node.textContent = freshness;
  });
} function atlasMathCoverageLabel(data) {
  if (!data || data.status !== "ok") return "Incomplète";
  if (Number(data.score) >= 90) return "Complète";
  if (Number(data.score) >= 65) return "Partielle";
  return "Limitée";
}
function atlasMathHorizonCoherence(coin) {
  const values = [coin?.change24h, coin?.change7d, coin?.change30d].map(Number).filter(Number.isFinite);
  if (values.length < 2) return "Données insuffisantes";
  const positive = values.filter(value => value > 0).length;
  const negative = values.filter(value => value < 0).length;
  if (positive === values.length) return "Cohérente haussière";
  if (negative === values.length) return "Cohérente baissière";
  return "Mixte";
}
function atlasMathAmplitudeLabel(change24h) {
  const value = Math.abs(Number(change24h));
  if (!Number.isFinite(value)) return "Non mesurée";
  if (value < 2) return "Faible";
  if (value < 5) return "Modérée";
  return "Forte";
}

function atlasMathFreshnessLabel(coin) {
  const raw = coin?.lastUpdated || coin?.timestamp || state.timestamp || null;
  const timestamp = Date.parse(raw || "");
  if (!Number.isFinite(timestamp)) return "Inconnue";
  const seconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000));
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.round(minutes / 60)} h`;
}

function atlasMathMovementPhrase(symbol, value, horizon) {
  const number = Number(value);
  if (!Number.isFinite(number)) return `${symbol} : variation ${horizon} indisponible`;
  if (Math.abs(number) < 0.005) return `${symbol} reste stable sur ${horizon}`;
  return `${symbol} ${number > 0 ? "progresse" : "recule"} de ${Math.abs(number).toFixed(2)} % sur ${horizon}`;
}

function atlasMathRatioLabel(coin) {
  const volume = Number(coin?.volume24h), cap = Number(coin?.marketCap);
  return Number.isFinite(volume) && volume >= 0 && Number.isFinite(cap) && cap > 0 ? `${(volume / cap * 100).toFixed(2)} %` : "—";
}

function renderAtlasMathCore() {
  const coin = atlasSelectedCoin();
  const shell = document.getElementById("math");

  if (shell && coin) {
    const palette = atlasCryptoPalette(coin, Math.max(0, Number(coin.rank || 1) - 1));
    shell.style.setProperty("--crypto-color", palette.primary);
    shell.style.setProperty("--crypto-gradient", atlasCryptoGradientCss(coin, Math.max(0, Number(coin.rank || 1) - 1)));
    shell.dataset.cryptoId = coin.id || "";
  } else if (shell) {
    shell.style.removeProperty("--crypto-color");
    shell.style.removeProperty("--crypto-gradient");
    delete shell.dataset.cryptoId;
  }

  const data = computeAtlasDataQuality(coin);
  const market = computeAtlasMarketMath(coin);
  const scenario = computeAtlasScenarioMath(coin);
  const coverage = atlasMathCoverageLabel(data);
  const coherence = atlasMathHorizonCoherence(coin);
  const amplitude = atlasMathAmplitudeLabel(coin?.change24h);
  const ratio = atlasMathRatioLabel(coin);
  const freshness = atlasMathFreshnessLabel(coin);
  const score = coin ? scoreCoin(coin).score : null;
  const source = coin?.source || state.mainSource || "En attente";

  state.math = {
    asset: coin ? `${coin.name} (${coin.symbol})` : null,
    heuristicScore: score,
    coverage,
    coherence,
    amplitude24h: amplitude,
    ratioVolumeMarketCap: ratio,
    source,
    freshness,
    riskGlobal: "Non évalué",
    updated_at: new Date().toISOString()
  };

  const human = document.getElementById("atlasHumanVerdict");
  if (human) {
    human.classList.remove("ok", "warn", "refus");
    human.classList.add(coin ? "warn" : "refus");
    human.innerHTML = coin
      ? `<b>Lecture factuelle :</b> ${escapeHtml(atlasMathMovementPhrase(coin.symbol, coin.change24h, "24 h"))} et ${escapeHtml(atlasMathMovementPhrase(coin.symbol, coin.change7d, "7 jours").replace(`${coin.symbol} `, ""))}.<br><b>Mesures :</b> vol./cap. ${escapeHtml(ratio)} · horizons ${escapeHtml(coherence.toLowerCase())} · amplitude ${escapeHtml(amplitude.toLowerCase())}.<br><b>Limites :</b> risque global, sécurité, données sociales et on-chain non évalués.`
      : `<b>Lecture factuelle :</b> en attente du Livecheck.<br><b>Faits :</b> aucune donnée de marché chargée.<br><b>Limites :</b> aucune conclusion sans source.`;
  }

  const summaryGrid = document.getElementById("atlasSummaryGrid");
  if (summaryGrid) {
    summaryGrid.innerHTML = `
      <div><span>Couverture</span><b>${escapeHtml(coverage)}</b></div>
      <div><span>24 h</span><b>${escapeHtml(coin ? atlasFmtPct(coin.change24h) : "—")}</b></div>
      <div><span>7 j</span><b>${escapeHtml(coin ? atlasFmtPct(coin.change7d) : "—")}</b></div>
      <div><span>Amplitude 24 h</span><b>${escapeHtml(amplitude)}</b></div>
    `;
  }

  const panel = document.getElementById("atlasMathCorePanel");
  if (panel) {
    panel.innerHTML = [
      atlasMathCard("Actif", coin ? coin.symbol : "—", coin ? coin.name : "Livecheck requis", coin ? `${source} · ${atlasFmtEUR(coin.price)}` : ""),
      atlasMathCard("Couverture des données", coverage, data.status === "ok" ? "Prix, volume, source et fraîcheur présents" : "Données insuffisantes"),
      atlasMathCard("Variation 24 h", coin ? atlasFmtPct(coin.change24h) : "—", "Snapshot marché"),
      atlasMathCard("Variation 7 j", coin ? atlasFmtPct(coin.change7d) : "—", "Snapshot marché"),
      atlasMathCard("Variation 30 j", coin ? atlasFmtPct(coin.change30d) : "—", "Snapshot marché"),
      atlasMathCard("Ratio volume / capitalisation", ratio, "Mesure descriptive"),
      atlasMathCard("Cohérence des horizons", coherence, "24 h · 7 j · 30 j"),
      atlasMathCard("Amplitude observée 24 h", amplitude, coin ? `Variation absolue ${Math.abs(Number(coin.change24h) || 0).toFixed(2)} %` : "Non mesurée"),
      atlasMathSourceCard(source, freshness),
      atlasMathCard("Risque global", "Non évalué", "Protocole, contrepartie, réglementation, profondeur et on-chain incomplets")
    ].join("");
  }

  const verdict = document.getElementById("atlasMathVerdict");
  if (verdict) {
    verdict.className = "atlas-verdict warn";
    verdict.innerHTML = `<b>Mode observation</b> · aucune exécution réelle`;
  }

  const riskPanel = document.getElementById("atlasRiskMathPanel");
  if (riskPanel) {
    riskPanel.innerHTML = `<b>Amplitude observée</b><span>24 h : ${escapeHtml(amplitude)} · risque global non évalué.</span>`;
  }

  const noFomoPanel = document.getElementById("atlasNoFomoMathPanel");
  if (noFomoPanel) {
    const noFomo = market.fomoPenalty ? "ralentir et vérifier" : "continuer en observation";
    noFomoPanel.innerHTML = `<b>Atlas No-FOMO</b><span>${escapeHtml(noFomo)} · ${escapeHtml(market.reason)}</span>`;
  }

  const simPanel = document.getElementById("atlasSimulationMathPanel");
  if (simPanel) {
    simPanel.innerHTML = `<b>Scénario de simulation</b><span>${escapeHtml(scenario.reason)} · ${escapeHtml(scenario.human)}.</span>`;
  }

  atlasV2SyncMathRail();
}

renderAtlasMathCore();
window.setInterval(atlasRefreshMathFreshnessOnly, 60 * 1000);


/* =========================================================
   V2.0-alpha · Build 28.1 — NEWS SENTINEL SOURCE INTELLIGENCE
   Analyse déterministe locale, mémoire dédupliquée, validation humaine.
   ========================================================= */
const NEWS_SENTINEL_STORAGE_KEY = "agent_crypto_erith_ia_news_sentinel_v1";
const NEWS_SENTINEL_MAX_EVENTS = 120;
const NEWS_SENTINEL_FEED_URL = "../data/news/latest.json";
const NEWS_SENTINEL_FEED_CACHE_KEY = "agent_crypto_erith_ia_news_feed_cache_v1";
const NEWS_SENTINEL_FEED_REFRESH_MS = 5 * 60 * 1000;
const NEWS_SENTINEL_VISIT_KEY = "agent_crypto_erith_ia_news_visit_v2";
const NEWS_SENTINEL_FEED_RETRY_MS = Object.freeze([60 * 1000, 180 * 1000, 5 * 60 * 1000]);
const newsFeedState = {
  status: "idle",
  payload: null,
  events: [],
  selectedId: null,
  filter: "all",
  error: null,
  lastLoadedAt: null,
  lastCheckedAt: null,
  nextRefreshAt: null,
  lastArchiveFingerprint: null,
  archiveChanged: null,
  startupAttempted: false,
  startupSucceeded: false,
  newSinceVisit: 0,
  visitBaselineAt: null,
  visitBaselineIds: null,
  consecutiveFailures: 0,
  timer: null,
  countdownTimer: null
};

const NEWS_SOURCE_GROUPS = {
  primary: {
    label: "Source primaire / officielle",
    domains: [
      "sec.gov", "cftc.gov", "amf-france.org", "esma.europa.eu", "ecb.europa.eu",
      "federalreserve.gov", "banque-france.fr", "europa.eu", "gov.uk",
      "ethereum.org", "bitcoin.org", "solana.com", "ripple.com", "cardano.org",
      "circle.com", "tether.to", "aave.com", "uniswap.org",
      "kraken.com", "coinbase.com", "binance.com", "bybit.com",
      "status.kraken.com", "status.coinbase.com", "binance.statuspage.io"
    ],
    base: 84
  },
  finance: {
    label: "Presse financière reconnue",
    domains: ["reuters.com", "apnews.com", "ft.com", "bloomberg.com", "bbc.com", "lemonde.fr", "afp.com"],
    base: 72
  },
  crypto: {
    label: "Média crypto spécialisé",
    domains: ["coindesk.com", "theblock.co", "decrypt.co", "cointelegraph.com"],
    base: 58
  },
  social: {
    label: "Réseau social / publication ouverte",
    domains: ["x.com", "twitter.com", "t.me", "telegram.org", "reddit.com", "medium.com", "youtube.com", "youtu.be"],
    base: 28
  }
};

const NEWS_ASSET_MAP = [
  ["BTC", /\bbitcoin\b|\bbtc\b/i], ["ETH", /\bethereum\b|\beth\b/i], ["SOL", /\bsolana\b|\bsol\b/i],
  ["BNB", /\bbnb\b|binance coin/i], ["XRP", /\bxrp\b|\bripple\b/i], ["USDT", /\busdt\b|\btether\b/i],
  ["USDC", /\busdc\b|usd coin/i], ["ADA", /\bcardano\b|\bada\b/i], ["DOGE", /\bdogecoin\b|\bdoge\b/i],
  ["AVAX", /\bavalanche\b|\bavax\b/i], ["LINK", /\bchainlink\b|\blink\b/i], ["DOT", /\bpolkadot\b|\bdot\b/i],
  ["SUI", /\bsui\b/i], ["AAVE", /\baave\b/i], ["UNI", /\buniswap\b|\buni\b/i], ["TON", /\btoncoin\b|\bton\b/i],
  ["XMR", /\bmonero\b|\bxmr\b/i], ["PEPE", /\bpepe\b/i], ["SHIB", /\bshiba inu\b|\bshib\b/i]
];

const NEWS_EVENT_RULES = [
  { id: "security", label: "Hack / exploit / sécurité", score: 86, re: /hack|exploit|attaque|bridge|drain|vol de fonds|vulnérabil|compromis|breach|pirat/i, direction: "pression négative potentielle" },
  { id: "bankruptcy", label: "Faillite / liquidité / retraits", score: 88, re: /faillite|insolvab|bankrupt|retraits? suspend|withdrawal.*suspend|liquidit[ée].*crise|défaut/i, direction: "pression négative potentielle" },
  { id: "regulation", label: "Régulation / justice", score: 78, re: /régulat|regulat|sec\b|cftc\b|amf\b|esma\b|procès|lawsuit|enquête|sanction|interdiction|licence|mifid|mica/i, direction: "orientation mixte selon la décision" },
  { id: "etf", label: "ETF / institutionnels", score: 76, re: /\betf\b|institutionnel|fonds coté|spot etf|approval|approbation|gestionnaire d'actifs|asset manager/i, direction: "catalyseur potentiel, sens à confirmer" },
  { id: "macro", label: "Macroéconomie / banque centrale", score: 72, re: /banque centrale|bce\b|fed\b|federal reserve|taux d'intérêt|inflation|emploi américain|fomc|cpi\b|pce\b|liquidité mondiale/i, direction: "impact de marché large, sens à confirmer" },
  { id: "listing", label: "Listing / delisting", score: 62, re: /listing|listé|delisting|délisting|retiré de la cote|ajout.*exchange|coté sur/i, direction: "volatilité potentielle" },
  { id: "tokenomics", label: "Tokenomics / unlock / burn", score: 61, re: /token unlock|déverrouillage|unlock|token burn|burn|émission|vesting|offre en circulation|supply/i, direction: "pression d’offre potentielle" },
  { id: "network", label: "Upgrade / mainnet / réseau", score: 54, re: /mainnet|upgrade|mise à niveau|hard fork|fork|testnet|validateur|consensus|protocole.*mise à jour/i, direction: "catalyseur technique potentiel" },
  { id: "governance", label: "Gouvernance", score: 50, re: /gouvernance|governance|vote on-chain|proposition dao|dao vote|snapshot vote/i, direction: "impact dépendant du résultat" },
  { id: "partnership", label: "Partenariat / adoption", score: 48, re: /partenariat|partnership|adoption|intégration|collaboration|paiement.*crypto|accept.*bitcoin/i, direction: "catalyseur potentiel" },
  { id: "rumor", label: "Rumeur / manipulation possible", score: 36, re: /rumeur|rumor|insider|leak|fuite|non confirmé|serait|pourrait annoncer|telegram|pump|shill/i, direction: "indéterminée" }
];

function newsNormalize(value) {
  return String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/https?:\/\/\S+/g, " ").replace(/[^a-z0-9€$%]+/g, " ").trim().replace(/\s+/g, " ");
}

function newsHash(value) {
  let hash = 2166136261;
  const text = String(value || "");
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function newsParseSourceUrl(raw) {
  const value = String(raw || "").trim();
  if (!value) return null;
  try { return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`); }
  catch { return null; }
}

function newsDomainMatches(host, domain) {
  return host === domain || host.endsWith(`.${domain}`);
}

function newsClassifySource(urlRaw, sourceName, text, declaredStatus, sourceCount) {
  const parsed = newsParseSourceUrl(urlRaw);
  const host = parsed?.hostname?.replace(/^www\./, "").toLowerCase() || "";
  let group = "unknown";
  let source = null;
  for (const [key, config] of Object.entries(NEWS_SOURCE_GROUPS)) {
    if (config.domains.some(domain => newsDomainMatches(host, domain))) { group = key; source = config; break; }
  }
  let score = source?.base ?? 38;
  const lower = `${sourceName || ""} ${text || ""}`.toLowerCase();
  if (declaredStatus === "confirmed" || /communiqué officiel|official statement|confirme|confirmed|publication officielle/.test(lower)) score += 12;
  if (declaredStatus === "reported") score += 4;
  if (declaredStatus === "rumor" || /rumeur|rumor|non confirmé|insider|leak|serait/.test(lower)) score -= 24;
  if (Number(sourceCount) >= 2) score += 8;
  if (Number(sourceCount) >= 3) score += 5;
  if (!host && !String(sourceName || "").trim()) score -= 12;
  score = clamp(0, 100, score);
  const level = score >= 82 ? "Élevé" : score >= 65 ? "Assez élevé" : score >= 45 ? "Moyen" : score >= 25 ? "Faible" : "Très faible";
  return {
    host: host || "source non fournie",
    url: parsed?.href || "",
    group,
    classLabel: source?.label || "Source non qualifiée",
    score,
    level
  };
}

function newsDetectEvent(text, declaredStatus) {
  const content = String(text || "");
  let rule = NEWS_EVENT_RULES.find(item => item.re.test(content));
  if (!rule) rule = { id: "general", label: "Information de marché à qualifier", score: 42, direction: "indéterminée" };
  if (declaredStatus === "rumor") rule = NEWS_EVENT_RULES.find(item => item.id === "rumor") || rule;
  return { ...rule };
}

function newsDetectAssets(text) {
  const content = String(text || "");
  const assets = NEWS_ASSET_MAP.filter(([, re]) => re.test(content)).map(([symbol]) => symbol);
  return [...new Set(assets)].slice(0, 12);
}

function newsDetectSectors(text) {
  const value = String(text || "").toLowerCase();
  const sectors = [];
  const tests = [
    ["DeFi", /defi|dex|lending|liquid staking|yield|bridge/],
    ["Stablecoins", /stablecoin|usdt|usdc|dai|depeg/],
    ["Exchanges", /exchange|binance|kraken|coinbase|bybit|listing|delisting/],
    ["Layer 1", /layer 1|l1\b|ethereum|solana|bitcoin|avalanche|cardano|sui/],
    ["Layer 2", /layer 2|l2\b|arbitrum|optimism|base network|rollup/],
    ["IA", /artificial intelligence|intelligence artificielle|\bia\b|\bai\b|gpu|compute/],
    ["RWA", /real world asset|\brwa\b|tokenisation|tokenization/],
    ["DePIN", /depin|decentralized physical infrastructure/],
    ["Gaming", /gaming|gamefi|jeu blockchain/],
    ["Privacy", /privacy|confidentialité|monero|zcash/],
    ["Marché global", /macro|banque centrale|fed\b|bce\b|inflation|taux d'intérêt|etf/]
  ];
  tests.forEach(([label, re]) => { if (re.test(value)) sectors.push(label); });
  return [...new Set(sectors)].slice(0, 8);
}

function newsFreshness(eventTimeRaw) {
  const raw = String(eventTimeRaw || "").trim();
  const date = raw ? new Date(raw) : new Date();
  const valid = Number.isFinite(date.getTime());
  const eventDate = valid ? date : new Date();
  const ageMs = Math.max(0, Date.now() - eventDate.getTime());
  const hours = ageMs / 3600000;
  const label = !raw ? "Heure d’analyse utilisée" : hours < 2 ? "Immédiate · moins de 2 h" : hours < 12 ? "Fraîche · moins de 12 h" : hours < 48 ? "Récente · moins de 48 h" : hours < 168 ? "Cette semaine" : "Ancienne · plus de 7 jours";
  return { iso: eventDate.toISOString(), hours, label, inferred: !raw };
}

function newsImpact(event, text, assets, source) {
  let score = Number(event.score || 42);
  const value = String(text || "").toLowerCase();
  if (/critique|massif|suspend.*retrait|fonds volés|emergency|urgence|attaque en cours/.test(value)) score += 10;
  if (/bitcoin|ethereum|btc|eth|marché global|etf|fed|bce/.test(value)) score += 5;
  if (assets.length >= 3) score += 4;
  if (source.score < 35) score -= 6;
  score = clamp(0, 100, score);
  const level = score >= 85 ? "Critique" : score >= 68 ? "Fort" : score >= 48 ? "Modéré" : "Faible";
  return { score, level };
}

function newsManipulationRisk(text, source, declaredStatus) {
  const value = String(text || "").toLowerCase();
  let score = 20;
  if (source.group === "social") score += 32;
  if (source.group === "unknown") score += 18;
  if (declaredStatus === "rumor") score += 30;
  if (/rumeur|rumor|insider|leak|telegram|pump|garanti|x100|to the moon|urgent.*acheter|faux partenariat|non confirmé/.test(value)) score += 26;
  if (source.group === "primary") score -= 15;
  score = clamp(0, 100, score);
  const level = score >= 70 ? "Élevé" : score >= 45 ? "Modéré" : "Faible";
  return { score, level };
}

function newsAlreadyPriced(assets, freshness, impact) {
  if (!state.liveOk || !Array.isArray(state.coins) || !state.coins.length) return { label: "Indéterminé", detail: "Livecheck ou actif comparable indisponible." };
  const coin = assets.map(symbol => state.coins.find(c => String(c.symbol || "").toUpperCase() === symbol)).find(Boolean);
  if (!coin) return { label: "Indéterminé", detail: "Aucun actif détecté ne correspond au snapshot courant." };
  const move24 = Number(coin.change24h);
  const move7 = Number(coin.change7d);
  if (!Number.isFinite(move24)) return { label: "Indéterminé", detail: "Variation 24 h indisponible." };
  if (freshness.hours < 2) return { label: "Trop tôt", detail: `${coin.symbol} ${atlasDecisionPct(move24)} sur 24 h · causalité non établie.` };
  if (freshness.hours <= 24 && Math.abs(move24) >= 2) return { label: "Réaction possible", detail: `${coin.symbol} ${atlasDecisionPct(move24)} sur 24 h · la nouvelle peut déjà être partiellement reflétée, sans preuve causale.` };
  if (freshness.hours > 24 && Number.isFinite(move7) && Math.abs(move7) >= 4) return { label: "Possiblement partiel", detail: `${coin.symbol} ${atlasDecisionPct(move7)} sur 7 j · effet déjà intégré possible, à confirmer.` };
  return { label: "Non démontré", detail: `${coin.symbol} ${atlasDecisionPct(move24)} sur 24 h · mouvement insuffisant pour conclure.` };
}

function newsDecision(evidence, impact, manipulation, freshness) {
  let action = "Surveillance";
  let checks = "Comparer la source primaire, la fraîcheur et la réaction du marché.";
  let tone = "warn";
  if (evidence.score < 45 || manipulation.score >= 70) {
    action = "Attendre une source primaire";
    checks = "Ne pas transmettre comme fait confirmé. Chercher un communiqué officiel ou deux sources concordantes.";
    tone = "danger";
  } else if (impact.score >= 85 && evidence.score >= 65) {
    action = "Alerte prioritaire · observation";
    checks = "Vérifier liquidité, volume, statut des plateformes et annonces officielles. Aucun ordre automatique.";
    tone = "danger";
  } else if (impact.score >= 68 && evidence.score >= 55) {
    action = "Surveillance renforcée";
    checks = "Comparer la réaction 24 h / 7 j, Risk Sentinel et la mémoire Atlas.";
    tone = "warn";
  } else if (freshness.hours > 168) {
    action = "Archiver / contextualiser";
    checks = "Information ancienne : vérifier si le marché l’a déjà absorbée.";
    tone = "neutral";
  }
  return { action, checks, tone };
}

function readNewsEvents() {
  try {
    const value = JSON.parse(localStorage.getItem(NEWS_SENTINEL_STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value.filter(Boolean).slice(-NEWS_SENTINEL_MAX_EVENTS) : [];
  } catch { return []; }
}

function writeNewsEvents(events) {
  const safe = (events || []).slice(-NEWS_SENTINEL_MAX_EVENTS);
  localStorage.setItem(NEWS_SENTINEL_STORAGE_KEY, JSON.stringify(safe));
  return safe;
}

function newsBuildAnalysis() {
  const title = String($("newsTitle")?.value || "").trim();
  const body = String($("newsInput")?.value || "").trim();
  if (!title && !body) return { error: "Ajoute un titre ou un contenu à analyser." };
  const sourceUrl = String($("newsSourceUrl")?.value || "").trim();
  const sourceName = String($("newsSourceName")?.value || "").trim();
  const sourceCount = Number($("newsSourceCount")?.value || 1);
  const declaredStatus = String($("newsDeclaredStatus")?.value || "unknown");
  const eventTimeRaw = String($("newsEventTime")?.value || "").trim();
  const combined = `${title}\n${body}\n${sourceName}\n${sourceUrl}`;
  const source = newsClassifySource(sourceUrl, sourceName, combined, declaredStatus, sourceCount);
  const event = newsDetectEvent(combined, declaredStatus);
  const assets = newsDetectAssets(combined);
  const sectors = newsDetectSectors(combined);
  const freshness = newsFreshness(eventTimeRaw);
  const impact = newsImpact(event, combined, assets, source);
  const manipulation = newsManipulationRisk(combined, source, declaredStatus);
  const priced = newsAlreadyPriced(assets, freshness, impact);
  const decision = newsDecision(source, impact, manipulation, freshness);
  const normalized = newsNormalize(`${title || body.slice(0, 160)} ${source.host} ${event.id} ${assets.join(" ")}`);
  const fingerprint = newsHash(normalized);
  const now = new Date().toISOString();
  const headline = title || body.split(/\n+/)[0].slice(0, 180) || event.label;
  return {
    id: `news_${fingerprint}`,
    event_id: `news_${fingerprint}`,
    fingerprint,
    version: ATLAS_RELEASE,
    headline,
    body,
    source_name: sourceName || source.host,
    source_url: source.url,
    source_host: source.host,
    source_group: source.group,
    source_class: source.classLabel,
    source_count: sourceCount,
    declared_status: declaredStatus,
    event_type: event.id,
    event_label: event.label,
    event_time: freshness.iso,
    first_seen_at: now,
    last_seen_at: now,
    freshness,
    evidence: { score: source.score, level: source.level },
    impact,
    direction: event.direction,
    assets,
    sectors,
    manipulation,
    priced,
    decision,
    confirmations: 1,
    observation_only: true
  };
}

function newsUpsertEvent(event) {
  const events = readNewsEvents();
  const index = events.findIndex(item => item.fingerprint === event.fingerprint);
  if (index >= 0) {
    const previous = events[index];
    events[index] = {
      ...previous,
      ...event,
      first_seen_at: previous.first_seen_at || event.first_seen_at,
      confirmations: Number(previous.confirmations || 1) + 1,
      source_count: Math.max(Number(previous.source_count || 1), Number(event.source_count || 1))
    };
  } else {
    events.push(event);
  }
  events.sort((a, b) => new Date(a.last_seen_at || 0) - new Date(b.last_seen_at || 0));
  return writeNewsEvents(events);
}

function newsToneClass(value) {
  return value === "danger" ? "danger" : value === "ok" ? "ok" : value === "neutral" ? "neutral" : "warn";
}


function newsSafeUrl(value) {
  try {
    const url = new URL(String(value || ""), window.location.href);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch {
    return "";
  }
}

function newsFeedAgeLabel(value) {
  const parsed = Date.parse(value || "");
  if (!Number.isFinite(parsed)) return "Heure inconnue";
  const minutes = Math.max(0, Math.round((Date.now() - parsed) / 60000));
  if (minutes < 2) return "moins de 2 min";
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  if (hours < 48) return `${hours.toFixed(hours < 10 ? 1 : 0)} h`;
  return `${(hours / 24).toFixed(1)} j`;
}

function newsFeedValidate(payload) {
  if (!payload || payload.schema !== "atlas_news_sentinel_world_to_market_v1") {
    throw new Error("Schéma News Sentinel invalide");
  }
  if (!Array.isArray(payload.events) || !payload.summary || !Array.isArray(payload.source_status)) {
    throw new Error("Archive News Sentinel incomplète");
  }
  return payload;
}


function newsFeedEventTimestamp(event) {
  const parsed = Date.parse(
    event?.event_time
    || event?.published_at
    || event?.updated_at
    || ""
  );
  return Number.isFinite(parsed) ? parsed : 0;
}

function newsFeedStemToken(token) {
  const value = String(token || "");
  const aliases = {
    filing: "file",
    files: "file",
    filed: "file",
    pools: "pool",
    bankruptcy: "bankrupt",
    bankruptcies: "bankrupt",
    biggest: "big",
    larger: "large",
    largest: "large"
  };
  if (aliases[value]) return aliases[value];
  if (value.length > 5 && value.endsWith("ing")) return value.slice(0, -3);
  if (value.length > 4 && value.endsWith("ed")) return value.slice(0, -2);
  if (value.length > 4 && value.endsWith("s")) return value.slice(0, -1);
  return value;
}

function newsFeedEventTokens(event) {
  const stopWords = new Set([
    "the", "a", "an", "of", "to", "for", "and", "or", "in", "on", "at",
    "is", "are", "was", "were", "be", "its", "it", "this", "that", "with",
    "de", "du", "des", "la", "le", "les", "un", "une", "et", "ou", "en",
    "sur", "pour", "dans", "est", "sont", "son", "sa", "ses", "au", "aux",
    "now", "as", "after", "before", "from", "by", "into", "about", "once",
    "one"
  ]);

  return new Set(
    newsNormalize(`${event?.headline || ""} ${event?.event_label || ""}`)
      .split(" ")
      .map(newsFeedStemToken)
      .filter(token =>
        token.length >= 3
        && !stopWords.has(token)
      )
  );
}

function newsFeedContainmentSimilarity(left, right) {
  const a = newsFeedEventTokens(left);
  const b = newsFeedEventTokens(right);
  if (!a.size || !b.size) return 0;

  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }

  return intersection / Math.min(a.size, b.size);
}

function newsFeedEventsEquivalent(left, right) {
  if (!left || !right) return false;

  const leftType = String(
    left.event_type
    || left.event_label
    || ""
  ).toLowerCase();
  const rightType = String(
    right.event_type
    || right.event_label
    || ""
  ).toLowerCase();

  if (leftType && rightType && leftType !== rightType) return false;

  const leftTime = newsFeedEventTimestamp(left);
  const rightTime = newsFeedEventTimestamp(right);
  if (
    leftTime
    && rightTime
    && Math.abs(leftTime - rightTime) > 72 * 60 * 60 * 1000
  ) {
    return false;
  }

  const leftAssets = new Set(
    Array.isArray(left.assets) ? left.assets : []
  );
  const rightAssets = new Set(
    Array.isArray(right.assets) ? right.assets : []
  );
  const sharedAsset = [...leftAssets].some(asset =>
    rightAssets.has(asset)
  );

  const similarity = newsFeedContainmentSimilarity(left, right);
  return similarity >= 0.74 || (sharedAsset && similarity >= 0.62);
}

function newsFeedSourceLink(event) {
  const url = newsSafeUrl(event?.source_url);
  const host = String(
    event?.source_host
    || event?.source_name
    || ""
  ).trim();

  if (!url && !host) return null;

  return {
    url,
    host: host || (() => {
      try {
        return new URL(url).hostname.replace(/^www\./, "");
      } catch {
        return "Source";
      }
    })()
  };
}

function newsMergeEquivalentEvents(primary, incoming) {
  const leftEvidence = Number(primary?.evidence?.score || 0);
  const rightEvidence = Number(incoming?.evidence?.score || 0);
  const leftImpact = Number(primary?.impact?.score || 0);
  const rightImpact = Number(incoming?.impact?.score || 0);

  const preferred = (
    rightEvidence > leftEvidence
    || (
      rightEvidence === leftEvidence
      && rightImpact > leftImpact
    )
  )
    ? incoming
    : primary;

  const secondary = preferred === incoming ? primary : incoming;
  const sourceLinks = [
    ...(Array.isArray(primary.source_links)
      ? primary.source_links
      : [newsFeedSourceLink(primary)]),
    ...(Array.isArray(incoming.source_links)
      ? incoming.source_links
      : [newsFeedSourceLink(incoming)])
  ].filter(Boolean);

  const uniqueLinks = [];
  const seen = new Set();

  for (const link of sourceLinks) {
    const key = `${link.host || ""}|${link.url || ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueLinks.push(link);
  }

  return {
    ...secondary,
    ...preferred,
    assets: [
      ...new Set([
        ...(Array.isArray(primary.assets) ? primary.assets : []),
        ...(Array.isArray(incoming.assets) ? incoming.assets : [])
      ])
    ],
    sectors: [
      ...new Set([
        ...(Array.isArray(primary.sectors) ? primary.sectors : []),
        ...(Array.isArray(incoming.sectors) ? incoming.sectors : [])
      ])
    ],
    source_links: uniqueLinks,
    source_count: Math.max(
      Number(primary.source_count || 1),
      Number(incoming.source_count || 1),
      uniqueLinks.length
    ),
    confirmations: Math.max(
      Number(primary.confirmations || 1),
      Number(incoming.confirmations || 1),
      uniqueLinks.length
    ),
    merged_event_ids: [
      ...new Set([
        ...(Array.isArray(primary.merged_event_ids)
          ? primary.merged_event_ids
          : [primary.id].filter(Boolean)),
        ...(Array.isArray(incoming.merged_event_ids)
          ? incoming.merged_event_ids
          : [incoming.id].filter(Boolean))
      ])
    ],
    deduplicated: true
  };
}

function newsDeduplicateFeedEvents(events) {
  const unique = [];

  for (const event of [...(Array.isArray(events) ? events : [])]
    .sort((a, b) => newsFeedEventTimestamp(b) - newsFeedEventTimestamp(a))) {
    const duplicateIndex = unique.findIndex(candidate =>
      newsFeedEventsEquivalent(candidate, event)
    );

    if (duplicateIndex < 0) {
      unique.push({
        ...event,
        source_links: [newsFeedSourceLink(event)].filter(Boolean),
        merged_event_ids: [event.id].filter(Boolean)
      });
    } else {
      unique[duplicateIndex] = newsMergeEquivalentEvents(
        unique[duplicateIndex],
        event
      );
    }
  }

  return unique.sort((a, b) => {
    const impact =
      Number(b?.impact?.score || 0)
      - Number(a?.impact?.score || 0);
    return impact || (
      newsFeedEventTimestamp(b)
      - newsFeedEventTimestamp(a)
    );
  });
}

function newsFeedReadCache() {
  try {
    const cached = JSON.parse(
      localStorage.getItem(
        NEWS_SENTINEL_FEED_CACHE_KEY
      ) || "null"
    );
    return newsFeedValidate(cached);
  } catch {
    return null;
  }
}

function newsFeedWriteCache(payload) {
  try {
    localStorage.setItem(
      NEWS_SENTINEL_FEED_CACHE_KEY,
      JSON.stringify(payload)
    );
  } catch {}
}

function newsFeedApplyPayload(payload, options = {}) {
  const validated = newsFeedValidate(payload);
  const events = newsDeduplicateFeedEvents(validated.events);

  const applied = {
    ...validated,
    events,
    summary: {
      ...validated.summary,
      raw_event_count: validated.events.length,
      unique_event_count: events.length
    }
  };

  newsFeedState.payload = applied;
  newsFeedState.events = events;
  newsFeedState.status = options.cached
    ? "partial"
    : applied.status === "partial"
      ? "partial"
      : applied.status === "pending"
        ? "pending"
        : applied.status === "error"
          ? "error"
          : "ok";

  if (options.cached) newsFeedState.archiveChanged = false;
  return applied;
}

function newsFeedUniqueStats() {
  const cutoff24h = Date.now() - 24 * 60 * 60 * 1000;
  const recent = newsFeedState.events.filter(event => {
    const timestamp = newsFeedEventTimestamp(event);
    return timestamp > 0 && timestamp >= cutoff24h;
  });

  return {
    events24: recent.length,
    priority24: recent.filter(event =>
      Number(event?.impact?.score || 0) >= 68
    ).length,
    critical24: recent.filter(event =>
      Number(event?.impact?.score || 0) >= 85
    ).length
  };
}

function newsFeedLeadEvent() {
  if (!newsFeedState.events.length) return null;
  const selected = newsFeedState.selectedId
    ? newsFeedState.events.find(item => item.id === newsFeedState.selectedId)
    : null;
  if (selected) return selected;
  const leadId = newsFeedState.payload?.summary?.lead_event_id;
  return newsFeedState.events.find(item => item.id === leadId) || newsFeedState.events[0] || null;
}

function newsFeedFilteredEvents() {
  const filter = newsFeedState.filter || "all";
  return newsFeedState.events.filter(event => {
    if (filter === "priority") return Number(event?.impact?.score || 0) >= 68;
    if (filter === "primary") return event.source_group === "primary";
    if (filter === "crypto") return event.source_group === "crypto";
    if (filter === "world") return event.source_group === "world" || event.source_group === "finance";
    return true;
  });
}



function newsVisitRead() {
  try {
    const parsed = JSON.parse(localStorage.getItem(NEWS_SENTINEL_VISIT_KEY) || "{}");
    return {
      seenIds: Array.isArray(parsed.seenIds) ? parsed.seenIds : [],
      lastVisitAt: parsed.lastVisitAt || null
    };
  } catch {
    return { seenIds: [], lastVisitAt: null };
  }
}

function newsVisitCompare(payload) {
  const currentIds = Array.isArray(payload?.events)
    ? payload.events.map(event => String(event?.id || event?.fingerprint || "")).filter(Boolean)
    : [];

  if (!Array.isArray(newsFeedState.visitBaselineIds)) {
    const visit = newsVisitRead();
    newsFeedState.visitBaselineIds = [...visit.seenIds];
    newsFeedState.visitBaselineAt = visit.lastVisitAt;
  }

  const seen = new Set(newsFeedState.visitBaselineIds || []);
  newsFeedState.newSinceVisit = seen.size
    ? currentIds.filter(id => !seen.has(id)).length
    : 0;

  try {
    localStorage.setItem(
      NEWS_SENTINEL_VISIT_KEY,
      JSON.stringify({
        lastVisitAt: new Date().toISOString(),
        seenIds: currentIds.slice(0, 240)
      })
    );
  } catch {}
}

function newsFeedFingerprint(payload) {
  const generated = String(payload?.generated_at || "");
  const ids = Array.isArray(payload?.events)
    ? payload.events.map(event => String(event?.id || event?.fingerprint || "")).filter(Boolean).join("|")
    : "";
  return newsHash(`${generated}|${ids}`);
}

function newsFeedVisible() {
  return document.visibilityState !== "hidden";
}

function newsFeedClearTimer() {
  if (newsFeedState.timer) clearTimeout(newsFeedState.timer);
  newsFeedState.timer = null;
}

function newsFeedSchedule(delayMs = NEWS_SENTINEL_FEED_REFRESH_MS) {
  newsFeedClearTimer();
  if (!newsFeedVisible()) {
    newsFeedState.nextRefreshAt = null;
    renderNewsFeedOverview();
    return;
  }
  const delay = Math.max(15000, Number(delayMs) || NEWS_SENTINEL_FEED_REFRESH_MS);
  newsFeedState.nextRefreshAt = new Date(Date.now() + delay).toISOString();
  newsFeedState.timer = window.setTimeout(() => {
    newsFeedState.timer = null;
    void loadNewsLiveFeed({ automatic: true });
  }, delay);
  renderNewsFeedOverview();
}

function newsFeedRetryDelay() {
  const index = Math.min(
    NEWS_SENTINEL_FEED_RETRY_MS.length - 1,
    Math.max(0, Number(newsFeedState.consecutiveFailures || 1) - 1)
  );
  return NEWS_SENTINEL_FEED_RETRY_MS[index];
}

function newsFeedCountdownLabel() {
  if (!newsFeedVisible()) return "Suspendu · onglet masqué";
  if (newsFeedState.status === "loading") return "Lecture en cours";
  if (!newsFeedState.nextRefreshAt) return "Préparation";
  return formatAutoDelay(Date.parse(newsFeedState.nextRefreshAt) - Date.now());
}

function newsFeedUpdateCountdown() {
  setText($("newsFeedNextCheck"), newsFeedCountdownLabel());
  const checked = newsFeedState.lastCheckedAt
    ? new Date(newsFeedState.lastCheckedAt).toLocaleString("fr-FR")
    : "Aucun contrôle";
  setText($("newsFeedLastCheck"), `Dernier contrôle : ${checked}`);
}

function newsFeedStatusText() {
  if (newsFeedState.status === "loading") return "Chargement du flux mondial";
  if (newsFeedState.status === "error") return "Flux indisponible · archive conservée";
  if (newsFeedState.status === "pending") return "Premier flux GitHub en attente";
  if (newsFeedState.status === "partial") return "Flux partiel · certaines sources indisponibles";
  if (newsFeedState.status === "ok") return newsFeedState.events.length ? "Flux mondial actif" : "Flux actif · aucun événement qualifié";
  return "Flux en attente";
}

function newsFeedTone() {
  const uniqueStats = newsFeedUniqueStats();
  if (uniqueStats.critical24 > 0) return "danger";
  if (uniqueStats.priority24 > 0 || newsFeedState.status === "partial") return "warn";
  if (newsFeedState.status === "ok") return "ok";
  return "neutral";
}

function renderNewsFeedList() {
  const list = $("newsLiveList");
  if (!list) return;
  if (newsFeedState.status === "loading" && !newsFeedState.events.length) {
    list.innerHTML = '<p class="news-live-empty">Chargement de l’archive News Sentinel…</p>';
    return;
  }
  if (newsFeedState.status === "error" && !newsFeedState.events.length) {
    list.innerHTML = `<p class="news-live-empty">Flux indisponible : ${escapeHtml(newsFeedState.error || "archive non accessible")}. Aucune nouvelle n’est inventée.</p>`;
    return;
  }
  const events = newsFeedFilteredEvents().slice(0, 16);
  if (!events.length) {
    list.innerHTML = '<p class="news-live-empty">Aucun événement ne correspond au filtre actuel. Le flux peut être actif sans produire d’alerte.</p>';
    return;
  }
  list.innerHTML = events.map(event => {
    const sourceLinks = (
      Array.isArray(event.source_links)
        ? event.source_links
        : [newsFeedSourceLink(event)]
    ).filter(link => link && (link.url || link.host));
    const url = newsSafeUrl(event.source_url);
    const tone = newsToneClass(event?.decision?.tone);
    const sourceCount = Math.max(
      Number(event.source_count || 1),
      sourceLinks.length
    );
    const sourceLabel = sourceCount > 1
      ? `${sourceCount} sources concordantes`
      : (
          event.source_name
          || event.source_host
          || "Source"
        );
    const meta = [
      `${event?.impact?.level || "Impact à qualifier"} ${Number(event?.impact?.score || 0)}/100`,
      `preuve ${String(event?.evidence?.level || "inconnue").toLowerCase()}`,
      event.assets?.length ? event.assets.join(" / ") : "marché global"
    ];
    return `
      <article class="news-live-item ${newsFeedState.selectedId === event.id ? "active" : ""}" data-tone="${tone}">
        <button class="news-live-select" type="button" data-live-news-id="${escapeHtml(event.id)}">
          <span class="news-live-topline">
            <span class="news-live-type">${escapeHtml(event.event_label || "Information à qualifier")}</span>
            <span class="news-live-freshness">${escapeHtml(event?.freshness?.label || newsFeedAgeLabel(event.event_time))}</span>
          </span>
          <h4>${escapeHtml(event.headline || "Événement sans titre")}</h4>
          <span class="news-live-meta">${meta.map(value => `<span>${escapeHtml(value)}</span>`).join("")}</span>
        </button>
        <div class="news-live-source-row">
          <small>${escapeHtml(sourceLabel)} · ${escapeHtml(event.source_class || "Source qualifiée")}</small>
          <span class="news-live-source-links">
            ${
              sourceLinks.length
                ? sourceLinks.slice(0, 3).map((link, index) =>
                    link.url
                      ? `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.host || `Source ${index + 1}`)} ↗</a>`
                      : `<span>${escapeHtml(link.host)}</span>`
                  ).join("")
                : url
                  ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Source ↗</a>`
                  : ""
            }
          </span>
        </div>
      </article>`;
  }).join("");
}

function renderNewsFeedOverview() {
  const payload = newsFeedState.payload || {};
  const summary = payload.summary || {};
  const uniqueStats = newsFeedUniqueStats();
  const events24 = uniqueStats.events24;
  const priority24 = uniqueStats.priority24;
  const sourcesOk = Number(summary.sources_ok || 0);
  const sourcesTotal = Number(summary.sources_total || 0);
  const sourcesFailed = Number(summary.sources_failed || 0);
  const generatedAt = payload.generated_at || null;

  const archiveState = newsFeedState.status === "ok"
    ? newsFeedState.archiveChanged === false ? "Archive valide · inchangée" : "Archive valide"
    : newsFeedState.status === "partial"
      ? "Archive partielle"
      : newsFeedState.status === "pending"
        ? "Premier passage requis"
        : newsFeedState.status === "error"
          ? newsFeedState.events.length ? "Archive conservée · contrôle échoué" : "Archive indisponible"
          : "En attente";

  setText($("newsFeedEvents24"), `${events24} événement${events24 > 1 ? "s" : ""}`);
  setText($("newsFeedPriority24"), `${priority24} prioritaire${priority24 > 1 ? "s" : ""}`);
  setText($("newsFeedSources"), `${sourcesOk}/${sourcesTotal} disponibles`);
  setText($("newsFeedFailures"), `${sourcesFailed} échec${sourcesFailed > 1 ? "s" : ""}`);
  setText($("newsFeedArchiveState"), archiveState);
  setText($("newsFeedArchiveAge"), newsFeedAgeLabel(generatedAt));
  setText($("newsFeedDecision"), summary.decision || (newsFeedState.status === "pending" ? "Collecte en attente" : "Surveillance"));

  const checkedLabel = newsFeedState.lastCheckedAt
    ? new Date(newsFeedState.lastCheckedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "—";
  setText(
    $("newsFeedUpdatedAt"),
    generatedAt
      ? `Archive GitHub : ${new Date(generatedAt).toLocaleString("fr-FR")} · ${newsFeedAgeLabel(generatedAt)}`
      : "Première archive en attente"
  );
  setText(
    $("newsFeedAutoState"),
    !newsFeedVisible()
      ? "Relecture suspendue · onglet masqué"
      : newsFeedState.status === "loading"
        ? "Contrôle automatique en cours"
        : `Archive vérifiée à ${checkedLabel} · prochaine relecture ${newsFeedCountdownLabel()}`
  );
  setText(
    $("newsSentinelFeedCount"),
    `Flux ${newsFeedState.events.length} événement${newsFeedState.events.length > 1 ? "s" : ""} unique${newsFeedState.events.length > 1 ? "s" : ""}`
  );
  setText($("newsCollapseState"), newsFeedStatusText());
  setText(
    $("newsCollapseMeta"),
    generatedAt
      ? `${events24} uniques sur 24 h · ${newsFeedAgeLabel(generatedAt)}`
      : "archive GitHub"
  );

  setText(
    $("newsPageReadState"),
    newsFeedState.status === "loading"
      ? "Lecture en cours"
      : newsFeedState.startupSucceeded
        ? "Démarrage OK"
        : newsFeedState.startupAttempted
          ? "Démarrage échoué"
          : "Démarrage"
  );
  setText(
    $("newsPageReadAt"),
    newsFeedState.lastCheckedAt
      ? `Page : ${new Date(newsFeedState.lastCheckedAt).toLocaleString("fr-FR")}`
      : "Aucune lecture"
  );
  setText(
    $("newsArchiveGenerationState"),
    generatedAt ? newsFeedAgeLabel(generatedAt) : "Inconnue"
  );
  setText(
    $("newsArchiveGeneratedAt"),
    generatedAt
      ? `GitHub : ${new Date(generatedAt).toLocaleString("fr-FR")}`
      : "Aucune archive"
  );
  setText(
    $("newsNewSinceVisit"),
    `${newsFeedState.newSinceVisit || 0} nouvelle${Number(newsFeedState.newSinceVisit || 0) > 1 ? "s" : ""}`
  );
  setText(
    $("newsVisitTruth"),
    newsFeedState.visitBaselineAt
      ? `Depuis ${new Date(newsFeedState.visitBaselineAt).toLocaleString("fr-FR")}`
      : "Premier état local"
  );

  document.querySelectorAll("[data-news-filter]").forEach(button => {
    button.classList.toggle("active", button.dataset.newsFilter === newsFeedState.filter);
  });

  newsFeedUpdateCountdown();
  renderNewsFeedList();
}

function newsCurrentEvent(manualEvent = null) {
  if (manualEvent) return manualEvent;
  return newsFeedLeadEvent() || readNewsEvents().slice(-1)[0] || null;
}

window.atlasNewsDecisionRiskLine = function atlasNewsDecisionRiskLine() {
  const summary = newsFeedState.payload?.summary || {};
  if (newsFeedState.status === "ok" || newsFeedState.status === "partial") {
    const uniqueStats = newsFeedUniqueStats();
    const count = uniqueStats.events24;
    const priority = uniqueStats.priority24;
    return `News Sentinel : ${count} événement${count > 1 ? "s" : ""} qualifié${count > 1 ? "s" : ""} sur 24 h, ${priority} prioritaire${priority > 1 ? "s" : ""}. Sécurité, social et on-chain restent à confirmer.`;
  }
  if (newsFeedState.status === "error") return "News Sentinel indisponible : aucune nouvelle n’est inventée. Sécurité, social et on-chain restent à confirmer.";
  return "News Sentinel en attente de sa première archive. Sécurité, social et on-chain restent à confirmer.";
};

async function loadNewsLiveFeed(options = {}) {
  const force = options.force === true;
  const automatic = options.automatic === true;
  if (automatic && !newsFeedState.startupAttempted) newsFeedState.startupAttempted = true;
  if (newsFeedState.status === "loading") return false;
  if (automatic && !newsFeedVisible()) {
    newsFeedSchedule(NEWS_SENTINEL_FEED_REFRESH_MS);
    return false;
  }

  const previousPayload = newsFeedState.payload;
  const previousEvents = [...newsFeedState.events];
  const previousStatus = newsFeedState.status;
  const previousFingerprint = newsFeedState.lastArchiveFingerprint
    || (previousPayload ? newsFeedFingerprint(previousPayload) : null);

  newsFeedState.status = "loading";
  newsFeedState.error = null;
  renderNewsFeedOverview();
  renderNewsSentinel();

  try {
    const cacheBust = `?t=${Date.now()}`;
    const payload = newsFeedValidate(
      await fetchJsonWithRetry(
        `${NEWS_SENTINEL_FEED_URL}${cacheBust}`,
        { networkKind: "source", networkWaitMs: 60_000 },
        12000,
        1
      )
    );

    const fingerprint = newsFeedFingerprint(payload);
    newsFeedState.archiveChanged = previousFingerprint
      ? fingerprint !== previousFingerprint
      : true;
    newsFeedState.lastArchiveFingerprint = fingerprint;

    const appliedPayload = newsFeedApplyPayload(
      payload,
      { cached: false }
    );

    newsVisitCompare(appliedPayload);
    newsFeedWriteCache(payload);
    newsFeedState.startupSucceeded = true;
    newsFeedState.lastLoadedAt = new Date().toISOString();
    newsFeedState.lastCheckedAt = newsFeedState.lastLoadedAt;
    newsFeedState.consecutiveFailures = 0;
    newsFeedState.error = null;

    if (newsFeedState.selectedId && !newsFeedState.events.some(item => item.id === newsFeedState.selectedId)) {
      newsFeedState.selectedId = null;
    }

    newsFeedSchedule(NEWS_SENTINEL_FEED_REFRESH_MS);
  } catch (error) {
    newsFeedState.lastCheckedAt = new Date().toISOString();
    newsFeedState.consecutiveFailures += 1;
    newsFeedState.error = error?.message || String(error);

    if (previousEvents.length) {
      newsFeedState.payload = previousPayload;
      newsFeedState.events = previousEvents;
      newsFeedState.status = "partial";
      newsFeedState.archiveChanged = false;
    } else {
      const cachedPayload = newsFeedReadCache();
      if (cachedPayload) {
        newsFeedApplyPayload(
          cachedPayload,
          { cached: true }
        );
      } else {
        newsFeedState.status = "error";
      }
    }

    newsFeedSchedule(newsFeedRetryDelay());
  }

  renderNewsFeedOverview();
  renderNewsSentinel();
  try { renderDecisionBoard(); } catch {}
  return newsFeedState.status !== "error";
}

function newsSelectLiveEvent(id) {
  if (!newsFeedState.events.some(item => item.id === id)) return;
  newsFeedState.selectedId = id;
  renderNewsFeedOverview();
  renderNewsSentinel(newsFeedLeadEvent());
}

function renderNewsSentinel(event = null) {
  const manualEvents = readNewsEvents();
  const current = newsCurrentEvent(event);
  const stateEl = $("newsSentinelState");
  const countEl = $("newsSentinelMemoryCount");
  if (countEl) countEl.textContent = `Manuel ${manualEvents.length}/${NEWS_SENTINEL_MAX_EVENTS}`;
  renderNewsFeedOverview();

  const tone = newsFeedTone();
  if (stateEl) {
    const label = current
      ? `${current.event_label} · ${current?.freshness?.label || newsFeedAgeLabel(current.event_time)}`
      : newsFeedStatusText();
    stateEl.textContent = label;
    stateEl.className = `pill ${newsToneClass(current?.decision?.tone || tone)} ${newsFeedState.status}`;
  }

  const bridge = $("decisionNewsBridge");
  if (!current) {
    setText($("newsSentinelLast"), newsFeedState.status === "pending" ? "Premier passage GitHub Actions requis" : "Aucun événement qualifié");
    setText($("newsSentinelFreshness"), newsFeedState.status === "error" ? "Archive indisponible" : "Flux en attente");
    setText($("newsSentinelEvidence"), "—");
    setText($("newsSentinelSourceClass"), "Aucune source retenue");
    setText($("newsSentinelImpact"), "—");
    setText($("newsSentinelDirection"), "Aucune orientation déduite");
    setText($("newsSentinelAssets"), "—");
    setText($("newsSentinelSectors"), "—");
    setText($("newsSentinelManipulation"), "—");
    setText($("newsSentinelPriced"), "Réaction marché : à comparer");
    setText($("newsSentinelDecision"), newsFeedState.payload?.summary?.decision || "Surveillance");
    setText($("newsSentinelChecks"), newsFeedState.status === "error" ? "Vérifier le workflow News Sentinel. Aucune information n’est inventée." : "Attendre une information qualifiée.");
    setText($("decisionNewsState"), newsFeedStatusText());
    setText($("decisionNewsImpact"), newsFeedState.status === "error" ? "Archive indisponible" : "Aucun événement prioritaire");
    setText($("decisionNewsAction"), newsFeedState.payload?.summary?.decision || "Surveillance");
    if (bridge) {
      bridge.dataset.tone = tone;
      bridge.dataset.state = newsFeedState.status;
    }
    renderNewsHistory(manualEvents);
    return;
  }

  setText($("newsSentinelLast"), current.headline);
  setText($("newsSentinelFreshness"), current?.freshness?.label || newsFeedAgeLabel(current.event_time));
  setText($("newsSentinelEvidence"), `${current.evidence.level} · ${current.evidence.score}/100`);
  setText($("newsSentinelSourceClass"), `${current.source_class} · ${current.source_host}`);
  setText($("newsSentinelImpact"), `${current.impact.level} · ${current.impact.score}/100`);
  setText($("newsSentinelDirection"), current.direction);
  setText($("newsSentinelAssets"), current.assets.length ? current.assets.join(" · ") : "Marché global");
  setText($("newsSentinelSectors"), current.sectors.length ? current.sectors.join(" · ") : "Secteur à qualifier");
  setText($("newsSentinelManipulation"), `${current.manipulation.level} · ${current.manipulation.score}/100`);
  setText($("newsSentinelPriced"), `Réaction marché : ${current?.priced?.label || "à comparer"}`);
  setText($("newsSentinelDecision"), current.decision.action);
  setText($("newsSentinelChecks"), current.decision.checks);
  setText($("decisionNewsState"), `${current.event_label} · ${current.assets.join(" / ") || "marché global"}`);
  setText($("decisionNewsImpact"), `${current.impact.level} · preuve ${current.evidence.level.toLowerCase()}`);
  setText($("decisionNewsAction"), current.decision.action);
  if (bridge) {
    bridge.dataset.tone = newsToneClass(current.decision.tone);
    bridge.dataset.state = "active";
  }
  renderNewsHistory(manualEvents, current.origin === "github_news_collector" ? null : current.id);
}

function newsOutputText(event, duplicate = false) {
  return [
    "NEWS SENTINEL — ANALYSE DÉTERMINISTE",
    "",
    `Événement : ${event.event_label}`,
    `Titre : ${event.headline}`,
    `Source : ${event.source_name || event.source_host}`,
    `Classe source : ${event.source_class}`,
    `Fraîcheur : ${event.freshness.label}`,
    `Niveau de preuve : ${event.evidence.level} (${event.evidence.score}/100)`,
    `Impact potentiel : ${event.impact.level} (${event.impact.score}/100)`,
    `Orientation : ${event.direction}`,
    `Actifs : ${event.assets.length ? event.assets.join(" / ") : "non détectés"}`,
    `Secteurs : ${event.sectors.length ? event.sectors.join(" / ") : "à qualifier"}`,
    `Risque de manipulation : ${event.manipulation.level} (${event.manipulation.score}/100)`,
    `Déjà intégré au prix : ${event.priced.label}`,
    `Lecture marché : ${event.priced.detail}`,
    "",
    `Décision Atlas : ${event.decision.action}`,
    `À vérifier : ${event.decision.checks}`,
    "",
    duplicate ? `Mémoire : événement dédupliqué, confirmation n°${event.confirmations}.` : "Mémoire : nouvel événement enregistré localement.",
    "Règle : impact potentiel ≠ causalité prouvée ≠ lecture décisionnelle. Aucun ordre automatique."
  ].join("\n");
}

function analyzeNews() {
  const analysis = newsBuildAnalysis();
  if (analysis.error) {
    setText($("newsOutput"), analysis.error);
    return;
  }
  const before = readNewsEvents();
  const duplicate = before.some(item => item.fingerprint === analysis.fingerprint);
  const events = newsUpsertEvent(analysis);
  const stored = events.find(item => item.fingerprint === analysis.fingerprint) || analysis;
  setText($("newsOutput"), newsOutputText(stored, duplicate));
  renderNewsSentinel(stored);
  try { atlasTrackAudience("news_sentinel_analyzed", { event_type: stored.event_type, evidence: stored.evidence.level, impact: stored.impact.level, assets: stored.assets }); } catch {}
}

function renderNewsHistory(events = readNewsEvents(), selectedId = null) {
  const list = $("newsHistoryList");
  const status = $("newsHistoryStatus");
  if (status) status.textContent = `${events.length} événement${events.length > 1 ? "s" : ""}`;
  if (!list) return;
  if (!events.length) {
    list.innerHTML = '<p class="news-history-empty">Aucun événement manuel mémorisé dans ce navigateur.</p>';
    return;
  }
  list.innerHTML = [...events].reverse().slice(0, 10).map(event => `
    <button class="news-history-item ${selectedId === event.id ? "active" : ""}" type="button" data-news-event-id="${escapeHtml(event.id)}">
      <span class="news-history-type">${escapeHtml(event.event_label)}</span>
      <b>${escapeHtml(event.headline)}</b>
      <small>${escapeHtml(event.impact.level)} · preuve ${escapeHtml(event.evidence.level.toLowerCase())} · ${escapeHtml(event.assets.join(" / ") || "marché")}</small>
      <em>${new Date(event.last_seen_at).toLocaleString("fr-FR")} · confirmation ${event.confirmations || 1}</em>
    </button>
  `).join("");
}

function newsLoadEvent(id) {
  const event = readNewsEvents().find(item => item.id === id);
  if (!event) return;
  if ($("newsTitle")) $("newsTitle").value = event.headline || "";
  if ($("newsInput")) $("newsInput").value = event.body || "";
  if ($("newsSourceUrl")) $("newsSourceUrl").value = event.source_url || "";
  if ($("newsSourceName")) $("newsSourceName").value = event.source_name || "";
  if ($("newsSourceCount")) $("newsSourceCount").value = String(Math.min(3, Number(event.source_count || 1)));
  if ($("newsDeclaredStatus")) $("newsDeclaredStatus").value = event.declared_status || "unknown";
  if ($("newsEventTime")) $("newsEventTime").value = String(event.event_time || "").slice(0, 16);
  setText($("newsOutput"), newsOutputText(event, Number(event.confirmations || 1) > 1));
  renderNewsSentinel(event);
}

function newsClearForm() {
  ["newsTitle", "newsSourceUrl", "newsSourceName", "newsEventTime", "newsInput"].forEach(id => { const node = $(id); if (node) node.value = ""; });
  if ($("newsSourceCount")) $("newsSourceCount").value = "1";
  if ($("newsDeclaredStatus")) $("newsDeclaredStatus").value = "unknown";
  setText($("newsOutput"), "Formulaire effacé. La mémoire News Sentinel est conservée.");
}

function newsExport() {
  const events = readNewsEvents();
  const payload = {
    version: ATLAS_RELEASE,
    exported_at: new Date().toISOString(),
    observation_only: true,
    warning: "Analyse événementielle locale. Aucun lecture décisionnelle, aucun ordre automatique.",
    count: events.length,
    events
  };
  downloadTextFile(`agent_crypto_news_sentinel_${new Date().toISOString().slice(0, 10)}.json`, "application/json", JSON.stringify(payload, null, 2));
}

function newsClearHistory() {
  if (!confirm("Effacer les événements News Sentinel mémorisés dans ce navigateur ?")) return;
  localStorage.removeItem(NEWS_SENTINEL_STORAGE_KEY);
  setText($("newsOutput"), "Historique manuel News Sentinel effacé. Le flux mondial est conservé.");
  renderNewsSentinel();
}

function initNewsSentinelV1() {
  const inputTime = $("newsEventTime");
  if (inputTime && !inputTime.value) {
    const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    inputTime.value = now.toISOString().slice(0, 16);
  }

  $("btnNewsClearForm")?.addEventListener("click", newsClearForm);
  $("btnNewsExport")?.addEventListener("click", newsExport);
  $("btnNewsClearHistory")?.addEventListener("click", newsClearHistory);
  $("btnNewsRefresh")?.addEventListener("click", () => {
    newsFeedClearTimer();
    void loadNewsLiveFeed({ force: true, automatic: false });
  });

  $("newsHistoryList")?.addEventListener("click", event => {
    const button = event.target.closest("[data-news-event-id]");
    if (button) newsLoadEvent(button.dataset.newsEventId);
  });
  $("newsLiveList")?.addEventListener("click", event => {
    const button = event.target.closest("[data-live-news-id]");
    if (button) newsSelectLiveEvent(button.dataset.liveNewsId);
  });

  document.querySelectorAll("[data-news-filter]").forEach(button => {
    button.addEventListener("click", () => {
      newsFeedState.filter = button.dataset.newsFilter || "all";
      renderNewsFeedOverview();
    });
  });

  document.addEventListener("visibilitychange", () => {
    if (!newsFeedVisible()) {
      newsFeedClearTimer();
      newsFeedState.nextRefreshAt = null;
      renderNewsFeedOverview();
      return;
    }
    void loadNewsLiveFeed({ automatic: true });
  });

  window.addEventListener("online", () => {
    if (newsFeedVisible()) void loadNewsLiveFeed({ automatic: true });
  });

  const cachedPayload = newsFeedReadCache();
  if (cachedPayload) {
    newsFeedApplyPayload(
      cachedPayload,
      { cached: true }
    );
  }

  renderNewsFeedOverview();
  renderNewsSentinel();
  void loadNewsLiveFeed({ automatic: true });

  if (newsFeedState.countdownTimer) clearInterval(newsFeedState.countdownTimer);
  newsFeedState.countdownTimer = window.setInterval(newsFeedUpdateCountdown, 1000);
}


/* =========================================================
   V2.0-alpha · Build 28.1 — HELP LAYER V1
   Aide contextuelle, exemples de saisie, carte marché au survol/focus.
   ========================================================= */
const ATLAS_HELP_DEFINITIONS = Object.freeze({
  searchInput: { title: "Filtrer le MARKET SNAPSHOT", body: "Saisis le nom, le symbole ou une partie du nom d’une crypto. Le filtre ne change pas les données ; il réduit seulement les lignes visibles.", example: "Exemple : bitcoin, ETH, sol ou tether." },
  sortSelect: { title: "Trier le marché", body: "Choisis l’ordre d’affichage des lignes : rang, score, volume ou variation. Le tri ne modifie ni les prix ni la sélection du graphique.", example: "Exemple : Hausse 24 h pour repérer les mouvements positifs du snapshot." },
  newsTitle: { title: "Titre de l’information", body: "Écris un titre factuel et court. Décris ce qui est annoncé, sans prédire la réaction du marché.", example: "Exemple : Un régulateur publie une décision concernant un ETF Bitcoin.", rule: "Évite : Bitcoin va forcément monter." },
  newsSourceUrl: { title: "URL ou domaine de la source", body: "Colle l’adresse de la publication d’origine ou d’un média identifiable. Atlas utilise le domaine pour qualifier la source.", example: "Exemple : https://www.sec.gov/... ou https://www.reuters.com/...", rule: "Ne saisis aucune URL privée ou contenant un jeton secret." },
  newsSourceName: { title: "Nom de la source", body: "Indique l’organisme, le média ou le projet qui publie l’information.", example: "Exemple : SEC, AMF, Reuters, Banque centrale européenne, projet officiel." },
  newsEventTime: { title: "Date et heure de l’événement", body: "Choisis l’heure de publication ou l’heure la plus proche connue. Elle sert à mesurer la fraîcheur de l’information.", example: "Exemple : heure du communiqué officiel, pas l’heure où tu l’as découvert." },
  newsSourceCount: { title: "Sources concordantes", body: "Indique combien de sources réellement distinctes confirment le même fait.", example: "Exemple : communiqué officiel + Reuters = 2 sources.", rule: "Trois reprises d’un même article ne comptent pas comme trois confirmations." },
  newsDeclaredStatus: { title: "Statut déclaré", body: "Choisis le niveau de confirmation que le contenu revendique. Atlas le confronte ensuite à la qualité de la source.", example: "Exemple : Confirmé / officiel uniquement pour une publication primaire identifiable." },
  newsInput: { title: "Contenu factuel à analyser", body: "Colle le passage utile ou rédige un résumé fidèle : qui, quoi, quand, où et décision exacte.", example: "Exemple : La SEC annonce… La décision prend effet le… Les actifs concernés sont…", rule: "Ne transforme pas une rumeur en fait et ne colle aucune donnée privée." },
  watchInput: { title: "Ajouter à la watchlist", body: "Saisis un symbole connu ou l’identifiant CoinGecko d’un actif. La watchlist sert à observer, pas à créer un ordre.", example: "Exemple : BTC, ETH, SOL, LINK ou ondo-finance." },
  autoCadenceLock: { title: "Cadences Auto Reader", body: "Cadences verrouillées : marché 60 secondes, spot 30 secondes, historique graphique 5 minutes.", example: "Ces cadences sont pilotées par le moteur réseau et ne sont pas modifiables dans cette version." },
  autoMemoryImport: { title: "Importer une mémoire Auto Reader", body: "Choisis uniquement un export JSON produit par Agent-Crypto. L’import fusionne des snapshots d’observation locaux.", example: "Exemple : agent_crypto_auto_memory_2026-07-23.json.", rule: "N’importe pas un fichier inconnu, une clé API ou une sauvegarde contenant des secrets." },
  collectorIdInput: { title: "Identifiant de collecteur", body: "Choisis un nom technique stable pour distinguer cette machine lors des exports et fusions de mémoire.", example: "Exemple : ryzen7-christophe ou transformer-book-christophe.", rule: "N’utilise ni mot de passe, ni adresse, ni identifiant sensible." },
  fomoInput: { title: "Décrire la FOMO", body: "Écris la pensée ou l’émotion qui pousse à agir trop vite. Le module reformule ensuite les questions de prudence.", example: "Exemple : Ce token a déjà fait +80 %, j’ai peur de rater la suite." },
  qObjective: { title: "Objectif de la session", body: "Note le résultat concret recherché pour cette séance, sans inclure de secret.", example: "Exemple : stabiliser le comparateur, préparer une lecture seule Bybit EU." },
  qAssets: { title: "Cryptos prioritaires", body: "Liste les actifs ou catégories qui doivent être observés en priorité.", example: "Exemple : BTC, ETH, SOL, stablecoins EUR/USD." },
  qVirtualAmount: { title: "Montant virtuel", body: "Décris uniquement le capital de simulation et la taille des essais fictifs.", example: "Exemple : 100 € virtuels, opérations simulées de 5 €.", rule: "Aucun dépôt réel n’est saisi ici." },
  qRisks: { title: "Risques interdits", body: "Écris les actions ou expositions qui doivent rester bloquées.", example: "Exemple : pas de levier, pas de margin, pas de retrait, pas de token inconnu." },
  qNews: { title: "Sources d’information", body: "Liste les sources qui devront être privilégiées ou recoupées.", example: "Exemple : AMF, BCE, Reuters, France 24, CoinDesk, statut officiel de l’exchange." },
  qMachine: { title: "Machine privée envisagée", body: "Décris le rôle technique de la machine future : local, sauvegarde, disponibilité, réseau.", example: "Exemple : PC Ryzen 7 local, SQLite, sauvegarde quotidienne, accès privé." },
  qAccess: { title: "Accès renforcé", body: "Décris les règles d’accès prévues sans écrire les identifiants eux-mêmes.", example: "Exemple : deux opérateurs autorisés, 2FA, VPN privé, journaux d’accès.", rule: "Ne saisis aucun mot de passe, token, numéro de téléphone ou clé API." },
  qPhysical: { title: "Sécurité physique", body: "Note les principes de conservation et de validation humaine autour d’un futur wallet matériel.", example: "Exemple : coffre froid, validation humaine, sauvegarde séparée.", rule: "Ne saisis jamais une seed phrase." },
  simSymbol: { title: "Actif simulé", body: "Saisis un symbole autorisé par le profil pédagogique. Cette zone ne contacte aucun exchange.", example: "Exemple : BTC, ETH ou SOL." },
  simAmount: { title: "Montant simulé", body: "Indique le montant fictif de l’essai. Le profil actuel recommande 5 € et bloque les opérations supérieures à 10 €.", example: "Exemple : 5.", rule: "Aucun argent réel n’est engagé." },
  commandInput: { title: "Commande avancée", body: "Écris une commande d’observation reconnue par l’assistante. Les boutons au-dessus restent la méthode la plus simple.", example: "Exemple : asset BTC, chart ETH 7d, compare BTC ETH ou sources.", rule: "Aucune commande buy, sell ou order réelle n’est autorisée." },
  btnChartSolo: { title: "Mode Solo", body: "Conserve un seul actif dans le graphique. La crypto principale reste sélectionnée." },
  btnChartTop3: { title: "Top 3", body: "Charge les trois premières capitalisations hors stablecoins et compare leurs trajectoires en Base 100." },
  btnChartTop5: { title: "Top 5", body: "Charge cinq grandes capitalisations hors stablecoins. Chaque ligne du Market peut ensuite être retirée séparément." },
  btnChartGainers: { title: "Hausses 5", body: "Sélectionne les cinq plus fortes hausses du snapshot pour la période active, puis charge leurs séries réelles." },
  btnChartLosers: { title: "Baisses 5", body: "Sélectionne les cinq plus fortes baisses du snapshot pour la période active, puis charge leurs séries réelles." },
  btnChartVolume5: { title: "Volumes 5", body: "Sélectionne les cinq plus gros volumes sur 24 heures. Classement calculé à partir du volume 24 heures réellement chargé." },
  btnChartReset: { title: "Réinitialiser", body: "Revient à Bitcoin seul sur 24 heures sans effacer les autres mémoires de l’application." },
  btnChartClear: { title: "Vider le graphique", body: "Retire toutes les cryptos du graphe. Clique ensuite une ligne du MARKET SNAPSHOT pour recommencer." },
  btnChartMaxPeriod: { title: "Couverture maximale", body: "Demande la série maximale puis affiche uniquement la couverture réellement reçue." },
  detailPanelToggle: { title: "Détail actif", body: "Réduit ou déploie la lecture technique de l’actif sélectionné." },
  btnSourceDockRefresh: { title: "Actualiser les sources", body: "Relit les métadonnées CoinGecko de l’actif sélectionné sans modifier le marché." }
});

let atlasHelpActiveTarget = null;
let atlasHelpHideTimer = null;

function atlasHelpDefinitionFor(target) {
  if (!target) return null;
  if (target.matches?.(".period-btn[data-period]")) {
    const label = atlasChartPeriodLabel(Number(target.dataset.period || 1));
    return { title: `Période ${label}`, body: `Charge les séries CoinGecko réelles sur ${label}. En comparaison, chaque actif est normalisé à 100 au premier point disponible.` };
  }
  if (target.matches?.("[data-math-position]")) {
    const position = target.dataset.mathPosition;
    return { title: `Math Core · ${position === "top" ? "Dessus" : position === "side" ? "Latéral" : "Réduit"}`, body: position === "top" ? "Affiche une synthèse compacte au-dessus du Market Snapshot." : position === "side" ? "Affiche le Math Core à droite, avec une hauteur indépendante du tableau." : "Réduit le Math Core en rail pour libérer la largeur du Market Snapshot." };
  }
  if (target.matches?.("[data-compare-primary]")) {
    return { title: "Actif principal", body: "Définit cet actif comme référence principale sans retirer les autres séries." };
  }
  if (target.matches?.("[data-compare-remove]")) {
    return { title: "Retirer de la comparaison", body: "Retire uniquement cet actif du graphique comparatif." };
  }
  if (target.matches?.("[data-market-open]")) {
    return { title: "Comparaison", body: "Ajoute ou retire cet actif du graphique comparatif. L’action Solo reste disponible dans le Market Snapshot." };
  }
  if (target.matches?.("[data-market-action]")) {
    const action = target.dataset.marketAction;
    const labels = { compare: ["Comparaison", "Ajoute ou retire cet actif du graphique comparatif."], open: ["Solo", "Ouvre cet actif seul dans le graphique."], watch: ["Suivre", "Ajoute ou conserve cet actif dans la Watchlist."], alert: ["Alerte", "Prépare une condition locale pour cet actif."], sources: ["Sources", "Ouvre le Source Dock de cet actif."] };
    const item = labels[action];
    return item ? { title: item[0], body: item[1] } : null;
  }
  return ATLAS_HELP_DEFINITIONS[target.id] || null;
}

function atlasHelpTargetFromNode(node) {
  if (!(node instanceof Element)) return null;
  const marketRow = node.closest?.("[data-market-help-id]");
  if (marketRow) return marketRow;
  const candidate = node.closest?.("input, textarea, select, button[id], button.period-btn, button.compare-btn, [data-math-position], [data-market-action], [data-compare-primary], [data-compare-remove], [data-market-open]");
  return candidate && atlasHelpDefinitionFor(candidate) ? candidate : null;
}

function atlasMarketHelpDefinition(row) {
  const coin = state.coins.find(item => item.id === row?.dataset?.marketHelpId);
  if (!coin) return null;
  const selection = atlasComparisonIds();
  const compared = selection.includes(coin.id);
  const score = scoreCoin(coin);
  const ratio = coin.volume24h && coin.marketCap ? coin.volume24h / coin.marketCap * 100 : null;
  const priceUsd = atlasHasPositiveQuote(coin.priceUsd) ? atlasFormatUSD(coin.priceUsd) : "USD —";
  const image = coin.image
    ? `<img class="atlas-help-market-icon" src="${escapeHtml(coin.image)}" alt="" loading="eager">`
    : `<span class="atlas-help-market-fallback" aria-hidden="true">${escapeHtml(coin.symbol.slice(0, 1))}</span>`;
  return {
    rich: true,
    liveText: `${coin.name} ${coin.symbol}. ${compared ? "Présent dans la comparaison. Clique la ligne pour le retirer." : "Clique la ligne pour l’ajouter à la comparaison."}`,
    html: `<div class="atlas-help-kicker">FICHE CRYPTO · MARKET SNAPSHOT</div>
      <div class="atlas-help-market-head">${image}<span><strong>${escapeHtml(coin.name)}</strong><b>${escapeHtml(coin.symbol)}</b><small>Rang ${escapeHtml(coin.rank ?? "—")} · ${escapeHtml(classifyAsset(coin))}</small></span></div>
      <div class="atlas-help-market-grid">
        <span><small>Prix EUR</small><strong>${escapeHtml(atlasFormatEUR(coin.priceEur ?? coin.price))}</strong></span>
        <span><small>Prix USD</small><strong>${escapeHtml(priceUsd)}</strong></span>
        <span><small>24 h</small><strong class="${clsPct(coin.change24h)}">${escapeHtml(atlasFmtMarketPct(coin.change24h))}</strong></span>
        <span><small>7 j</small><strong class="${clsPct(coin.change7d)}">${escapeHtml(fmtPct(coin.change7d))}</strong></span>
        <span><small>30 j</small><strong class="${clsPct(coin.change30d)}">${escapeHtml(fmtPct(coin.change30d))}</strong></span>
        <span><small>Vol./cap.</small><strong>${Number.isFinite(ratio) ? `${ratio.toFixed(2)} %` : "—"}</strong></span>
        <span><small>Capitalisation</small><strong>${escapeHtml(num(coin.marketCap, fmtCompactEUR.format.bind(fmtCompactEUR)))}</strong></span>
        <span><small>Volume 24 h</small><strong>${escapeHtml(num(coin.volume24h, fmtCompactEUR.format.bind(fmtCompactEUR)))}</strong></span>
        <span><small>Score Atlas</small><strong>${escapeHtml(score.score ?? "—")}</strong></span>
        <span><small>Décision</small><strong>${escapeHtml(beginnerDecision(coin))}</strong></span>
      </div>
      <div class="atlas-help-market-action ${compared ? "is-remove" : "is-add"}">${compared ? `Sélectionné ${selection.indexOf(coin.id) + 1}/${selection.length} · clique ou appuie sur Entrée pour retirer` : `Non sélectionné · clique ou appuie sur Entrée pour ajouter · ${selection.length}/${ATLAS_COMPARISON_MAX_SERIES}`}</div>`
  };
}

function atlasHelpMarkup(definition) {
  if (definition.rich) return definition.html;
  return `<div class="atlas-help-kicker">HELP LAYER V1</div><strong class="atlas-help-title">${escapeHtml(definition.title)}</strong><p>${escapeHtml(definition.body)}</p>${definition.example ? `<div class="atlas-help-example"><b>Exemple</b><span>${escapeHtml(definition.example.replace(/^Exemple\s*:\s*/i, ""))}</span></div>` : ""}${definition.rule ? `<div class="atlas-help-rule">${escapeHtml(definition.rule)}</div>` : ""}`;
}

function atlasPositionHelpLayer(layer, target, pointer = null) {
  layer.hidden = false;
  layer.style.visibility = "hidden";
  const measured = layer.getBoundingClientRect();
  const margin = 12;
  let left;
  let top;
  if (pointer && Number.isFinite(pointer.clientX) && Number.isFinite(pointer.clientY)) {
    left = pointer.clientX + 18;
    top = pointer.clientY + 18;
  } else {
    const rect = target.getBoundingClientRect();
    left = rect.right + margin;
    top = rect.top;
    if (left + measured.width > window.innerWidth - margin) left = rect.left - measured.width - margin;
  }
  left = clamp(margin, Math.max(margin, window.innerWidth - measured.width - margin), left);
  top = clamp(margin, Math.max(margin, window.innerHeight - measured.height - margin), top);
  layer.style.left = `${Math.round(left)}px`;
  layer.style.top = `${Math.round(top)}px`;
  layer.style.visibility = "visible";
}

function atlasShowHelpLayer(target, pointer = null) {
  window.clearTimeout(atlasHelpHideTimer);
  const layer = document.getElementById("atlasHelpLayer");
  const live = document.getElementById("atlasHelpLive");
  if (!layer || !target) return;
  const definition = target.matches?.("[data-market-help-id]") ? atlasMarketHelpDefinition(target) : atlasHelpDefinitionFor(target);
  if (!definition) return;
  if (atlasHelpActiveTarget && atlasHelpActiveTarget !== target) atlasRestoreHelpDescription(atlasHelpActiveTarget);
  atlasHelpActiveTarget = target;
  layer.innerHTML = atlasHelpMarkup(definition);
  layer.setAttribute("aria-hidden", "false");
  if (!("atlasHelpOriginalDescribedby" in target.dataset)) {
    target.dataset.atlasHelpOriginalDescribedby = target.getAttribute("aria-describedby") || "";
  }
  const describedBy = new Set((target.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean));
  describedBy.add("atlasHelpLayer");
  target.setAttribute("aria-describedby", [...describedBy].join(" "));
  if (live) live.textContent = definition.liveText || `${definition.title}. ${definition.body}${definition.example ? ` ${definition.example}` : ""}`;
  atlasPositionHelpLayer(layer, target, pointer);
}

function atlasRestoreHelpDescription(target) {
  if (!target) return;
  const original = target.dataset.atlasHelpOriginalDescribedby;
  if (original) target.setAttribute("aria-describedby", original);
  else target.removeAttribute("aria-describedby");
  delete target.dataset.atlasHelpOriginalDescribedby;
}

function atlasHideHelpLayer(immediate = false) {
  const hide = () => {
    const layer = document.getElementById("atlasHelpLayer");
    if (layer) {
      layer.hidden = true;
      layer.setAttribute("aria-hidden", "true");
    }
    atlasRestoreHelpDescription(atlasHelpActiveTarget);
    atlasHelpActiveTarget = null;
  };
  window.clearTimeout(atlasHelpHideTimer);
  if (immediate) hide();
  else atlasHelpHideTimer = window.setTimeout(hide, 110);
}

function initAtlasHelpLayerV1() {
  document.addEventListener("pointerover", event => {
    const target = atlasHelpTargetFromNode(event.target);
    if (!target) return;
    if (atlasHelpActiveTarget === target) return;
    atlasShowHelpLayer(target, event);
  });
  document.addEventListener("pointerout", event => {
    const target = atlasHelpTargetFromNode(event.target);
    if (!target || target !== atlasHelpActiveTarget) return;
    if (event.relatedTarget instanceof Node && target.contains(event.relatedTarget)) return;
    atlasHideHelpLayer();
  });
  document.addEventListener("focusin", event => {
    const target = atlasHelpTargetFromNode(event.target);
    if (target) atlasShowHelpLayer(target);
  });
  document.addEventListener("focusout", event => {
    const target = atlasHelpTargetFromNode(event.target);
    if (!target || target !== atlasHelpActiveTarget) return;
    atlasHideHelpLayer();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") atlasHideHelpLayer(true);
  });
  window.addEventListener("scroll", () => atlasHideHelpLayer(true), { passive: true });
  window.addEventListener("resize", () => atlasHideHelpLayer(true), { passive: true });
}

els.btnSourceDockRefresh?.addEventListener("click", () => {
  const coin = getSelectedCoin() || state.coins[0] || null;
  if (!coin) return;
  atlasSourceDockClearRetryTimer();
  delete state.sourceDock.nextRetryAt[coin.id];
  void atlasLoadSourceDockMetadata(coin, { force: true });
});

els.sourceDockPortals?.addEventListener("click", event => {
  const portal = event.target.closest?.("[data-portal-kind]");
  if (!portal || portal.classList.contains("is-disabled")) return;
  const coin = getSelectedCoin() || null;
  atlasTrackAudience("source_dock_portal_opened", {
    asset: coin?.id || null,
    portal: portal.dataset.portalKind || null
  });
});

document.addEventListener("visibilitychange", () => {
  renderAutoReader();
  renderMemoryTruth();
  if (document.hidden) {
    atlasSourceDockClearRetryTimer();
    return;
  }
  const coin = getSelectedCoin() || null;
  if (!coin || state.sourceDock.activeCoinId !== coin.id) return;
  if (atlasSourceDockRetryRemaining(coin.id) <= 0 && state.sourceDock.failures?.[coin.id]) {
    void atlasLoadSourceDockMetadata(coin, { retry: true });
  } else {
    atlasSourceDockScheduleRetry(coin);
  }
});

initAtlasCleanLensPanel();
initAtlasDetailWindows();
initNewsSentinelV1();
initAtlasHelpLayerV1();


/* =========================================================
   Build 28.1.42 — Clean Home + Inline Data Status + Admin Graph Toggle
   Interface envelope only. Protected Graphique, Détail actif,
   Target Top 5, Market Flow and Market internals stay unchanged.
   ========================================================= */
const ATLAS_ADMIN_CENTER_KEY = "atlas.admin.command.center.open.v1";
const ATLAS_ADMIN_GRAPH_KEY = "atlas.admin.graph.open.v1";

function atlasAdminCenterElements() {
  return {
    dock: document.querySelector(".atlas-admin-dock"),
    drawer: document.getElementById("atlasAdminCenterDrawer"),
    toggle: document.getElementById("atlasAdminCenterToggle"),
    state: document.getElementById("atlasAdminCenterToggleState"),
    close: document.getElementById("atlasAdminCenterClose")
  };
}

function atlasAdminCenterSet(open, options = {}) {
  const { drawer, toggle, state } = atlasAdminCenterElements();
  if (!drawer || !toggle) return;
  const next = !!open && atlasV2Mode() === "advanced";
  drawer.hidden = !next;
  toggle.setAttribute("aria-expanded", next ? "true" : "false");
  if (state) state.textContent = next ? "Replier −" : "Déployer +";
  document.querySelectorAll("[data-admin-cluster-target]").forEach(button => {
    button.setAttribute("aria-expanded", next ? "true" : "false");
  });
  document.body.classList.toggle("atlas-admin-center-open", next);
  if (options.persist !== false) {
    try { localStorage.setItem(ATLAS_ADMIN_CENTER_KEY, next ? "1" : "0"); } catch {}
  }
  if (next && options.target) {
    document.querySelectorAll("[data-admin-cluster]").forEach(cluster => {
      cluster.classList.toggle("is-targeted", cluster.dataset.adminCluster === options.target);
    });
    document.querySelectorAll("[data-admin-cluster-target]").forEach(button => {
      button.classList.toggle("is-selected", button.dataset.adminClusterTarget === options.target);
    });
    const cluster = drawer.querySelector(`[data-admin-cluster="${options.target}"]`);
    if (cluster) window.setTimeout(() => cluster.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" }), 30);
  } else if (!next) {
    document.querySelectorAll("[data-admin-cluster], [data-admin-cluster-target]").forEach(element => {
      element.classList.remove("is-targeted", "is-selected");
    });
  }
}

function initAtlasAdminCommandCenter() {
  const { drawer, toggle, close } = atlasAdminCenterElements();
  if (!drawer || !toggle) return;
  if (drawer.parentElement !== document.body) document.body.appendChild(drawer);
  toggle.addEventListener("click", () => atlasAdminCenterSet(drawer.hidden));
  close?.addEventListener("click", () => atlasAdminCenterSet(false));
  document.querySelectorAll("[data-admin-cluster-target]").forEach(button => {
    button.addEventListener("click", () => {
      const target = button.dataset.adminClusterTarget || "";
      const alreadyOpen = !drawer.hidden;
      const alreadySelected = button.classList.contains("is-selected");
      if (alreadyOpen && alreadySelected) atlasAdminCenterSet(false);
      else atlasAdminCenterSet(true, { target });
    });
  });
  drawer.addEventListener("click", event => {
    if (event.target.closest("a[href^='#']")) atlasAdminCenterSet(false);
  });
  document.addEventListener("pointerdown", event => {
    const { dock } = atlasAdminCenterElements();
    if (!drawer.hidden && dock && !dock.contains(event.target) && !drawer.contains(event.target)) atlasAdminCenterSet(false);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !drawer.hidden) atlasAdminCenterSet(false);
  });
  window.addEventListener("atlas:v2mode", event => {
    if (event.detail?.mode !== "advanced") atlasAdminCenterSet(false, { persist: false });
  });
}

function atlasAdminGraphRead() {
  try { return localStorage.getItem(ATLAS_ADMIN_GRAPH_KEY) !== "0"; }
  catch { return true; }
}

function atlasAdminGraphSyncControls(open) {
  document.querySelectorAll("[data-admin-graph-toggle]").forEach(button => {
    button.classList.toggle("is-open", open);
    button.setAttribute("aria-pressed", open ? "true" : "false");
    const compactState = button.querySelector("b");
    if (compactState) compactState.textContent = open ? "Ouvert" : "Fermé";
    const drawerText = button.querySelector("span:last-child");
    if (button.classList.contains("atlas-admin-graph-drawer-toggle") && drawerText) {
      drawerText.textContent = open ? "Graphique ouvert" : "Graphique fermé";
    }
    button.setAttribute(
      "aria-label",
      open
        ? "Fermer le Graphique Analyste, Détail actif, Target Top 5 et Market Flow"
        : "Rouvrir le Graphique Analyste, Détail actif, Target Top 5 et Market Flow"
    );
  });
}

function atlasAdminGraphSet(open, options = {}) {
  const zone = document.getElementById("market-zone");
  if (!zone) return;
  const next = !!open;
  zone.classList.toggle("atlas-graph-closed", !next);
  zone.dataset.graphOpen = next ? "true" : "false";
  atlasAdminGraphSyncControls(next);
  atlasAdminCenterSet(false, { persist: false });
  if (options.persist !== false) {
    try { localStorage.setItem(ATLAS_ADMIN_GRAPH_KEY, next ? "1" : "0"); } catch {}
  }
  if (options.scroll !== false) window.requestAnimationFrame(() => {
    const behavior = options.instant ? "auto" : "smooth";
    if (next) {
      document.getElementById("analyste")?.scrollIntoView({ block: "start", behavior });
      try { atlasScheduleStableChartResize(); } catch {}
      window.setTimeout(() => { try { atlasScheduleStableChartResize(); } catch {} }, 220);
    } else {
      document.getElementById("marketSnapshotPanel")?.scrollIntoView({ block: "start", behavior });
    }
  });
  window.dispatchEvent(new CustomEvent("atlas:admin-graph", { detail: { open: next } }));
}

function initAtlasAdminGraphToggle() {
  const zone = document.getElementById("market-zone");
  if (!zone) return;

  document.querySelectorAll("[data-admin-graph-toggle]").forEach(button => {
    button.addEventListener("click", () => {
      const currentlyOpen = !zone.classList.contains("atlas-graph-closed");
      atlasAdminGraphSet(!currentlyOpen);
    });
  });

  document.querySelectorAll('a[href="#analyste"]').forEach(link => {
    link.addEventListener("click", () => {
      if (zone.classList.contains("atlas-graph-closed")) {
        atlasAdminGraphSet(true, { persist: atlasV2Mode() === "advanced", instant: true });
      }
    });
  });

  window.addEventListener("atlas:v2mode", event => {
    const mode = event.detail?.mode;
    if (mode === "essential") {
      atlasAdminGraphSet(true, { persist: false, instant: true, scroll: false });
    } else if (mode === "advanced") {
      atlasAdminGraphSet(atlasAdminGraphRead(), { persist: false, instant: true, scroll: false });
    }
  });

  const initialOpen = atlasV2Mode() === "advanced" ? atlasAdminGraphRead() : true;
  atlasAdminGraphSet(initialOpen, { persist: false, instant: true, scroll: false });
}

initAtlasAdminCommandCenter();
initAtlasAdminGraphToggle();
