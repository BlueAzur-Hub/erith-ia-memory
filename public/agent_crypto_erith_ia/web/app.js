const state = {
  liveOk: false,
  mainSource: null,
  timestamp: null,
  coins: [],
  global: null,
  watchIds: ["bitcoin", "ethereum", "solana"],
  sourceStatus: [],
  selectedCoinId: "bitcoin",
  chartPeriodDays: 1,
  chartCache: {},
  assetFilter: "all",
  sortKey: "rank-asc",
  sim: null
};

const $ = (id) => document.getElementById(id);

const els = {
  liveStatus: $("liveStatus"),
  sourceName: $("sourceName"),
  sourceTime: $("sourceTime"),
  sourceDecision: $("sourceDecision"),
  tableDecision: $("tableDecision"),
  offlineNotice: $("offlineNotice"),
  tickerTrack: $("tickerTrack"),
  marketRows: $("marketRows"),
  tableNote: $("tableNote"),
  searchInput: $("searchInput"),
  metricMarketCap: $("metricMarketCap"),
  metricMarketCapHint: $("metricMarketCapHint"),
  metricVolume: $("metricVolume"),
  metricVolumeHint: $("metricVolumeHint"),
  metricBtcDom: $("metricBtcDom"),
  metricBtcDomHint: $("metricBtcDomHint"),
  metricSources: $("metricSources"),
  metricSourcesHint: $("metricSourcesHint"),
  sourceGrid: $("sourceGrid"),
  scoreRing: $("scoreRing"),
  scoreValue: $("scoreValue"),
  scoreLabel: $("scoreLabel"),
  scoreBreakdown: $("scoreBreakdown"),
  watchInput: $("watchInput"),
  watchCards: $("watchCards"),
  riskGrid: $("riskGrid"),
  newsInput: $("newsInput"),
  newsOutput: $("newsOutput"),
  fomoInput: $("fomoInput"),
  fomoOutput: $("fomoOutput"),
  coldRead: $("coldRead"),
  beginnerSummary: $("beginnerSummary"),
  advancedPanel: $("advancedPanel"),
  advancedGrid: $("advancedGrid"),
  btnToggleAdvanced: $("btnToggleAdvanced"),
  selectedAssetTitle: $("selectedAssetTitle"),
  mainChart: $("mainChart"),
  chartCaption: $("chartCaption"),
  assetDetailGrid: $("assetDetailGrid"),
  assetDetailWhy: $("assetDetailWhy"),
  trustLockText: $("trustLockText"),
  sourceDiagnosticTitle: $("sourceDiagnosticTitle"),
  sourceDiagnosticNote: $("sourceDiagnosticNote"),
  sourceDiagnosticGrid: $("sourceDiagnosticGrid"),
  sortSelect: $("sortSelect"),
  commandInput: $("commandInput"),
  commandOutput: $("commandOutput"),
  commandHuman: $("commandHuman"),
  btnRunCommand: $("btnRunCommand"),
  simCash: $("simCash"),
  simPositionsValue: $("simPositionsValue"),
  simTotalValue: $("simTotalValue"),
  simPnL: $("simPnL"),
  simSymbol: $("simSymbol"),
  simAmount: $("simAmount"),
  btnSimBuy: $("btnSimBuy"),
  btnSimSell: $("btnSimSell"),
  btnSimReset: $("btnSimReset"),
  simPositions: $("simPositions"),
  simLog: $("simLog")
};

const fmtEUR = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
const fmtCompactEUR = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", notation: "compact", maximumFractionDigits: 2 });
const fmtPct = (n) => typeof n === "number" ? `${n >= 0 ? "+" : ""}${n.toFixed(2)} %` : "Donnée manquante";
const clsPct = (n) => typeof n !== "number" ? "neutral" : n > 0 ? "pos" : n < 0 ? "neg" : "neutral";
const clamp = (min, max, value) => Math.max(min, Math.min(max, value));

function setText(el, value) {
  if (el) el.textContent = value;
}

function setTableDecision(text, mode = "") {
  setText(els.sourceDecision, text);
  setText(els.tableDecision, text);

  for (const el of [els.sourceDecision, els.tableDecision]) {
    if (!el) continue;
    el.classList.remove("ok", "fail", "warn");
    if (mode) el.classList.add(mode);
  }
}

function setHTML(el, value) {
  if (el) el.innerHTML = value;
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>'"]/g, c => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    "'":"&#39;",
    '"':"&quot;"
  }[c]));
}

function num(value, formatter = fmtEUR.format.bind(fmtEUR)) {
  return typeof value === "number" && Number.isFinite(value) ? formatter(value) : "Donnée manquante";
}

async function fetchWithTimeout(url, options = {}, timeout = 9000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal, cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(id);
  }
}

const SourceAdapter = {
  async coingeckoMarkets() {
    const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h,7d&locale=fr";
    const data = await fetchWithTimeout(url);
    if (!Array.isArray(data) || !data.length) throw new Error("Format CoinGecko invalide");
    return data.map((coin) => ({
      id: coin.id,
      rank: coin.market_cap_rank,
      name: coin.name,
      symbol: String(coin.symbol || "").toUpperCase(),
      image: coin.image,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h_in_currency ?? coin.price_change_percentage_24h,
      change7d: coin.price_change_percentage_7d_in_currency,
      marketCap: coin.market_cap,
      volume24h: coin.total_volume,
      source: "CoinGecko",
      timestamp: new Date().toISOString()
    }));
  },

  async coingeckoGlobal() {
    const data = await fetchWithTimeout("https://api.coingecko.com/api/v3/global");
    if (!data || !data.data) throw new Error("Format global CoinGecko invalide");
    return data.data;
  },

  async dexScreenerPing() {
    const data = await fetchWithTimeout("https://api.dexscreener.com/latest/dex/search?q=bitcoin");
    if (!data || !Array.isArray(data.pairs)) throw new Error("Format DEX Screener invalide");
    return { pairs: data.pairs.length };
  },

  async geckoTerminalPing() {
    const data = await fetchWithTimeout("https://api.geckoterminal.com/api/v2/networks");
    if (!data || !Array.isArray(data.data)) throw new Error("Format GeckoTerminal invalide");
    return { networks: data.data.length };
  },

  async defiLlamaPing() {
    const data = await fetchWithTimeout("https://api.llama.fi/protocols");
    if (!Array.isArray(data)) throw new Error("Format DefiLlama invalide");
    return { protocols: data.length };
  },

  async binancePing() {
    const data = await fetchWithTimeout("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT");
    if (!data || !data.symbol) throw new Error("Format Binance invalide");
    return { symbol: data.symbol };
  },

  async krakenPing() {
    const data = await fetchWithTimeout("https://api.kraken.com/0/public/Ticker?pair=BTCEUR");
    if (!data || data.error?.length) throw new Error(data.error?.join(", ") || "Format Kraken invalide");
    return { ok: true };
  },

  async coinbasePing() {
    const data = await fetchWithTimeout("https://api.coinbase.com/api/v3/brokerage/market/products?limit=5");
    if (!data || (!Array.isArray(data.products) && !Array.isArray(data))) throw new Error("Format Coinbase invalide");
    return { ok: true };
  }
};

const liveSources = [
  { key: "coingecko", name: "CoinGecko", kind: "marché", fn: async () => ({ markets: await SourceAdapter.coingeckoMarkets(), global: await SourceAdapter.coingeckoGlobal() }) },
  { key: "dexscreener", name: "DEX Screener", kind: "DEX", fn: SourceAdapter.dexScreenerPing },
  { key: "geckoterminal", name: "GeckoTerminal", kind: "DEX pools", fn: SourceAdapter.geckoTerminalPing },
  { key: "defillama", name: "DefiLlama", kind: "DeFi", fn: SourceAdapter.defiLlamaPing },
  { key: "binance", name: "Binance", kind: "exchange", fn: SourceAdapter.binancePing },
  { key: "kraken", name: "Kraken", kind: "exchange", fn: SourceAdapter.krakenPing },
  { key: "coinbase", name: "Coinbase", kind: "exchange", fn: SourceAdapter.coinbasePing }
];

function setLiveStatus(mode, text) {
  if (!els.liveStatus) return;
  els.liveStatus.className = `pill ${mode}`;
  els.liveStatus.textContent = text;
}

function cleanError(error) {
  return String(error?.message || error || "Erreur inconnue")
    .replace(/AbortError/i, "Timeout")
    .slice(0, 72);
}

function detailFromResult(result) {
  if (!result) return "OK";
  if (result.markets) return `${result.markets.length} actifs marché`;
  if (result.pairs !== undefined) return `${result.pairs} paires`;
  if (result.networks !== undefined) return `${result.networks} réseaux`;
  if (result.protocols !== undefined) return `${result.protocols} protocoles`;
  if (result.symbol) return result.symbol;
  return "OK";
}

function updateSourceMetric(doneOverride = null) {
  const total = liveSources.length;
  const done = doneOverride ?? state.sourceStatus.length;
  const ok = state.sourceStatus.filter(s => s.status === "OK").length;
  const fail = Math.max(0, done - ok);
  const failText = fail === 1 ? "1 échec" : `${fail} échecs`;

  setText(els.metricSources, `${ok}/${total}`);

  if (!done) {
    setText(els.metricSourcesHint, `0/${total} interrogées`);
  } else if (done < total) {
    setText(els.metricSourcesHint, `${done}/${total} interrogées · ${ok} réussies`);
  } else {
    setText(els.metricSourcesHint, `${done}/${total} interrogées · ${failText}`);
  }
}


function clearMarketDisplay(reason = "Marché live indisponible.") {
  state.liveOk = false;
  state.mainSource = null;
  state.timestamp = null;
  state.coins = [];
  state.global = null;

  setText(els.metricMarketCap, "—");
  setText(els.metricMarketCapHint, "Donnée non récupérée");
  setText(els.metricVolume, "—");
  setText(els.metricVolumeHint, "Donnée non récupérée");
  setText(els.metricBtcDom, "—");
  setText(els.metricBtcDomHint, "Donnée non récupérée");

  setHTML(
    els.tickerTrack,
    `<span class="ticker-meta">${escapeHtml(reason)} · aucun prix affiché · pas de tableau fictif</span>`
  );

  renderEmptyMarket(`${reason.toUpperCase()} — aucun tableau chiffré.`);
  renderScore(null);
  renderWatchlist();
  renderRiskGrid();
  renderColdRead(false);
  renderBeginnerSummary();
  renderAnalystPanel();
}

function explainForBeginnerLiveFailure(okCount = 0) {
  return `Livecheck échec : ${okCount}/${liveSources.length} sources ont répondu, mais aucune source marché exploitable n’a fourni le tableau principal. ` +
    "Ce n’est pas une erreur utilisateur. L’interface doit refuser les prix tant que le marché principal n’est pas récupéré.";
}

async function runLivecheck() {
  setLiveStatus("warn", "Livecheck en cours");
  setTableDecision("Tests sources en cours", "warn");
  setText(els.sourceName, "Recherche...");
  setText(els.sourceTime, "—");

  state.sourceStatus = [];
  clearMarketDisplay("Livecheck en cours");
  loadSimulation();
renderSimulation();
renderSourceGrid();
  updateSourceMetric(0);
setTableDecision("Refusé avant Livecheck", "fail");

  for (const src of liveSources) {
    const started = performance.now();

    try {
      const result = await src.fn();
      const ms = Math.round(performance.now() - started);
      state.sourceStatus.push({ ...src, status: "OK", ms, detail: detailFromResult(result) });

      if (src.key === "coingecko" && result.markets?.length) {
        state.coins = result.markets;
        state.global = result.global;
        state.mainSource = "CoinGecko";
        state.timestamp = new Date().toISOString();
        state.liveOk = true;
        if (!state.selectedCoinId || !state.coins.some(c => c.id === state.selectedCoinId)) {
          state.selectedCoinId = state.coins[0]?.id || "bitcoin";
        }

        // Affichage immédiat dès que la source marché est valide.
        renderAll();
      }
    } catch (error) {
      state.sourceStatus.push({ ...src, status: "ÉCHEC", ms: null, detail: cleanError(error) });
    }

    renderSourceGrid();
    updateSourceMetric();
  }

  const okCount = state.sourceStatus.filter(s => s.status === "OK").length;

  if (state.liveOk && state.coins.length) {
    setLiveStatus("ok", "Livecheck OK");
    setText(els.sourceName, state.mainSource);
    setText(els.sourceTime, new Date(state.timestamp).toLocaleString("fr-FR"));
    setTableDecision("Autorisé · source réelle", "ok");
    if (els.offlineNotice) els.offlineNotice.style.display = "none";
    renderAll();
  } else {
    setLiveStatus("fail", "Livecheck échec");
    clearMarketDisplay("Recherche live échouée");
    if (els.offlineNotice) {
      els.offlineNotice.style.display = "block";
      els.offlineNotice.innerHTML = `<strong>ACCÈS LIVE INDISPONIBLE</strong><p>${escapeHtml(explainForBeginnerLiveFailure(okCount))}</p>`;
    }
    setText(els.sourceName, "Aucune source marché exploitable");
    setText(els.sourceTime, "—");
    setTableDecision("Refusé · pas de source live", "fail");
    setText(els.coldRead, explainForBeginnerLiveFailure(okCount));
  }
  updateSourceMetric();
}


function classifyAsset(c) {
  if (!c) return "À vérifier";
  const id = String(c.id || "").toLowerCase();
  const sym = String(c.symbol || "").toUpperCase();

  if (id === "bitcoin" || id === "ethereum" || sym === "BTC" || sym === "ETH") return "Pilier marché";
  if (["USDT","USDC","DAI","FDUSD","TUSD","USDE"].includes(sym)) return "Stablecoin";
  if ((c.rank || 9999) <= 20) return "Altcoin majeur";
  if ((c.rank || 9999) <= 100) return "Altcoin";
  return "Token spéculatif";
}

function beginnerDecision(c) {
  const type = classifyAsset(c);
  if (type === "Stablecoin") return "Surveillance stabilité";
  if (type === "Pilier marché") return "Repère marché";
  const s = scoreCoin(c);
  if (s.score === null) return "Données insuffisantes";
  if (s.score <= 55) return "Observer";
  if (s.score <= 75) return "Vérifier";
  return "Risque élevé";
}

function whyDecision(c) {
  if (!c) return "Aucune donnée live exploitable.";
  const type = classifyAsset(c);
  const bits = [];
  bits.push(`Type : ${type}.`);
  if (type === "Stablecoin") bits.push("Un stablecoin ne se lit pas comme une crypto de hausse : on surveille surtout la stabilité, la liquidité et le risque d’ancrage.");
  if (type === "Pilier marché") bits.push("Actif repère : utile pour lire l’état général du marché.");
  if (typeof c.change24h === "number") bits.push(`Variation 24h : ${fmtPct(c.change24h)}.`);
  if (c.volume24h && c.marketCap) bits.push(`Ratio volume/market cap : ${((c.volume24h / c.marketCap) * 100).toFixed(2)} %.`);
  bits.push("Sécurité, social et on-chain non validés par cette interface.");
  bits.push("Conclusion : observation seulement, pas conseil d’achat.");
  return bits.join(" ");
}

function renderBeginnerSummary() {
  if (!els.beginnerSummary) return;

  if (!state.liveOk || !state.coins.length) {
    els.beginnerSummary.textContent =
      "Le marché n’est pas lisible pour l’instant. Aucune source marché principale n’a fourni un tableau fiable. Donc : pas de prix, pas de conclusion, pas de tableau fictif.";
    if (els.advancedGrid) {
      els.advancedGrid.innerHTML = `
        <div><b>État</b><span>Livecheck absent ou échec</span></div>
        <div><b>Tableau</b><span>Bloqué</span></div>
        <div><b>Données</b><span>Non récupérées</span></div>
        <div><b>Règle</b><span>Pas de source live, pas de prix</span></div>`;
    }
    return;
  }

  const btc = state.coins.find(c => c.id === "bitcoin");
  const eth = state.coins.find(c => c.id === "ethereum");
  const first = state.coins[0];

  els.beginnerSummary.textContent =
    `Marché lisible depuis ${state.mainSource}. ` +
    `Le tableau montre des données de marché réelles : prix, variation, volume et capitalisation. ` +
    `Bitcoin et Ethereum servent de repères. ` +
    `Les stablecoins ne sont pas des opportunités de hausse : ils servent surtout à lire stabilité et liquidité. ` +
    `Ce cockpit aide à observer, pas à acheter.`;

  if (els.advancedGrid) {
    const ratio = first?.volume24h && first?.marketCap ? ((first.volume24h / first.marketCap) * 100).toFixed(2) + " %" : "Donnée manquante";
    els.advancedGrid.innerHTML = `
      <div><b>Source</b><span>${escapeHtml(state.mainSource || "—")}</span></div>
      <div><b>Actifs chargés</b><span>${state.coins.length}</span></div>
      <div><b>BTC 24h</b><span>${btc ? fmtPct(btc.change24h) : "Donnée manquante"}</span></div>
      <div><b>ETH 24h</b><span>${eth ? fmtPct(eth.change24h) : "Donnée manquante"}</span></div>
      <div><b>Premier actif</b><span>${first ? escapeHtml(first.name) : "—"}</span></div>
      <div><b>Type</b><span>${escapeHtml(classifyAsset(first))}</span></div>
      <div><b>Vol/Market cap</b><span>${ratio}</span></div>
      <div><b>Données manquantes</b><span>Sécurité · social · on-chain</span></div>`;
  }
}


function getSelectedCoin() {
  if (!state.coins.length) return null;
  const selected = state.coins.find(c => c.id === state.selectedCoinId);
  return selected || state.coins[0];
}

function safeMoney(value) {
  return typeof value === "number" && Number.isFinite(value) ? fmtEUR.format(value) : "—";
}

function pseudoSeries(c, points = 36) {
  if (!c || typeof c.price !== "number") return [];
  const period = Number(state.chartPeriodDays || 1);
  const change = period === 1
    ? (typeof c.change24h === "number" ? c.change24h : 0)
    : (typeof c.change7d === "number" ? c.change7d : (typeof c.change24h === "number" ? c.change24h : 0));

  const start = c.price / (1 + change / 100 || 1);
  const now = Date.now();
  const spanMs = period * 24 * 60 * 60 * 1000;

  return Array.from({ length: points }, (_, i) => {
    const t = points <= 1 ? 1 : i / (points - 1);
    const wave = Math.sin(t * Math.PI * 3) * 0.004 + Math.cos(t * Math.PI * 7) * 0.002;
    const v = Math.max(0, start + (c.price - start) * t + c.price * wave);
    return [now - spanMs + spanMs * t, v];
  });
}

async function fetchChartSeries(c, days) {
  if (!c?.id) return [];
  const key = `${c.id}:${days}`;
  if (state.chartCache[key]) return state.chartCache[key];

  const fallback = pseudoSeries(c, days === 1 ? 28 : days === 7 ? 48 : 72);
  state.chartCache[key] = fallback;

  const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(c.id)}/market_chart?vs_currency=eur&days=${encodeURIComponent(days)}&precision=full`;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return fallback;
    const data = await response.json();
    const prices = Array.isArray(data.prices) && data.prices.length > 2 ? data.prices : fallback;
    state.chartCache[key] = prices;
    return prices;
  } catch {
    return fallback;
  }
}

function drawLineChart(canvas, series, label = "") {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(320, Math.floor(rect.width || canvas.clientWidth || 900));
  const height = Math.max(220, Math.floor(rect.height || canvas.clientHeight || 260));

  if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const grd = ctx.createLinearGradient(0, 0, 0, height);
  grd.addColorStop(0, "rgba(98,236,255,0.08)");
  grd.addColorStop(1, "rgba(98,236,255,0.01)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 5; i++) {
    const y = (height / 5) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  if (!series || series.length < 2) {
    ctx.fillStyle = "rgba(255,240,200,0.92)";
    ctx.font = "700 18px system-ui, sans-serif";
    ctx.fillText("Graphique en attente", 18, 34);
    return;
  }

  const values = series.map(p => Number(p[1])).filter(Number.isFinite);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max((max - min) * 0.12, Math.abs(max) * 0.001, 0.0001);
  const lo = min - pad;
  const hi = max + pad;

  const yFor = (v) => height - ((v - lo) / (hi - lo || 1)) * height;

  ctx.beginPath();
  series.forEach((p, i) => {
    const x = (i / (series.length - 1)) * width;
    const y = yFor(Number(p[1]));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "rgba(98,236,255,0.98)";
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();

  const last = Number(series[series.length - 1][1]);
  ctx.fillStyle = "rgba(255,240,200,0.96)";
  ctx.font = "800 15px system-ui, sans-serif";
  ctx.fillText(`${label} · ${safeMoney(last)}`, 16, 24);

  ctx.fillStyle = "rgba(205,220,240,0.80)";
  ctx.font = "600 11px system-ui, sans-serif";
  ctx.fillText(`min ${safeMoney(min)} · max ${safeMoney(max)}`, 16, height - 14);
}

function sparkSvg(c) {
  const oldPeriod = state.chartPeriodDays;
  state.chartPeriodDays = 7;
  const data = pseudoSeries(c, 18).map(p => p[1]);
  state.chartPeriodDays = oldPeriod;

  if (!data.length) return "—";
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 112;
    const y = 26 - ((v - min) / (max - min || 1)) * 24;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return `<svg class="sparkline" viewBox="0 0 112 28" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" opacity=".95"/></svg>`;
}

async function renderAnalystPanel() {
  const c = getSelectedCoin();

  if (!c) {
    setText(els.selectedAssetTitle, "Aucun actif sélectionné");
    drawLineChart(els.mainChart, [], "");
    if (els.chartCaption) els.chartCaption.textContent = "Livecheck requis.";
    if (els.assetDetailGrid) {
      els.assetDetailGrid.innerHTML = `
        <div><b>Actif</b><span>En attente</span></div>
        <div><b>Type</b><span>—</span></div>
        <div><b>Décision</b><span>—</span></div>
        <div><b>Ratio vol/cap</b><span>—</span></div>`;
    }
    if (els.assetDetailWhy) els.assetDetailWhy.textContent = "Livecheck requis avant lecture détaillée.";
    return;
  }

  state.selectedCoinId = c.id;
  setText(els.selectedAssetTitle, `${c.name} — ${c.symbol}`);

  const ratio = c.volume24h && c.marketCap ? `${((c.volume24h / c.marketCap) * 100).toFixed(2)} %` : "Donnée manquante";

  if (els.assetDetailGrid) {
    els.assetDetailGrid.innerHTML = `
      <div><b>Actif</b><span>${escapeHtml(c.name)} (${escapeHtml(c.symbol)})</span></div>
      <div><b>Type</b><span>${escapeHtml(classifyAsset(c))}</span></div>
      <div><b>Décision</b><span>${escapeHtml(beginnerDecision(c))}</span></div>
      <div><b>Ratio vol/cap</b><span>${ratio}</span></div>
      <div><b>Prix</b><span>${safeMoney(c.price)}</span></div>
      <div><b>24h / 7j</b><span>${fmtPct(c.change24h)} · ${fmtPct(c.change7d)}</span></div>`;
  }

  if (els.assetDetailWhy) els.assetDetailWhy.textContent = whyDecision(c);

  const periodLabel = state.chartPeriodDays === 1 ? "24h" : `${state.chartPeriodDays}j`;

  // Affichage immédiat : jamais de grand bloc vide.
  drawLineChart(els.mainChart, pseudoSeries(c, state.chartPeriodDays === 1 ? 28 : state.chartPeriodDays === 7 ? 48 : 72), `${c.symbol} ${periodLabel}`);

  if (els.chartCaption) {
    els.chartCaption.textContent = `Graphique ${c.symbol} · période ${periodLabel} · chargement CoinGecko si disponible.`;
  }

  const series = await fetchChartSeries(c, state.chartPeriodDays);
  drawLineChart(els.mainChart, series, `${c.symbol} ${periodLabel}`);

  if (els.chartCaption) {
    els.chartCaption.textContent = `Graphique ${c.symbol} · période ${periodLabel} · source CoinGecko si disponible, fallback visuel sinon.`;
  }
}


function getSourceRecord(key) {
  return state.sourceStatus.find(s => s.key === key) || null;
}

function renderSourceDiagnostic() {
  // RC10 : plus de diagnostic dupliqué en haut.
  // Le diagnostic principal reste dans le panneau Live Sources en bas de page.
  return;
}

function matchAssetFilter(c) {
  const type = classifyAsset(c);
  if (state.assetFilter === "pillar") return type === "Pilier marché";
  if (state.assetFilter === "stablecoin") return type === "Stablecoin";
  if (state.assetFilter === "major") return type === "Altcoin majeur";
  if (state.assetFilter === "speculative") return type === "Token spéculatif" || type === "Altcoin";
  return true;
}

function volCapRatio(c) {
  return c?.volume24h && c?.marketCap ? c.volume24h / c.marketCap : 0;
}

function sortAssets(rows) {
  const list = [...rows];
  const key = state.sortKey || "rank-asc";

  const byNumber = (getter, dir = "desc") => list.sort((a, b) => {
    const av = Number(getter(a));
    const bv = Number(getter(b));
    const aa = Number.isFinite(av) ? av : -Infinity;
    const bb = Number.isFinite(bv) ? bv : -Infinity;
    return dir === "asc" ? aa - bb : bb - aa;
  });

  if (key === "score-desc") return byNumber(c => scoreCoin(c).score ?? -1, "desc");
  if (key === "volume-desc") return byNumber(c => c.volume24h ?? -1, "desc");
  if (key === "change24-desc") return byNumber(c => c.change24h ?? -Infinity, "desc");
  if (key === "change24-asc") return byNumber(c => c.change24h ?? Infinity, "asc");
  if (key === "ratio-desc") return byNumber(c => volCapRatio(c), "desc");

  return byNumber(c => c.rank ?? 999999, "asc");
}


function commandError(message, details = {}) {
  return { ok: false, error: message, ...details };
}

function commandOk(command, payload) {
  return {
    ok: true,
    command,
    mode: "observation_only",
    trading: "blocked",
    timestamp: new Date().toISOString(),
    payload
  };
}

function normalizeSymbol(value) {
  return String(value || "").trim().replace(/[^a-zA-Z0-9_-]/g, "").toUpperCase();
}

function findCoinByQuery(query) {
  const q = normalizeSymbol(query);
  if (!q) return null;

  return state.coins.find(c =>
    String(c.symbol || "").toUpperCase() === q ||
    String(c.id || "").toUpperCase() === q ||
    String(c.name || "").toUpperCase() === q
  ) || null;
}

function coinPayload(c) {
  if (!c) return null;
  const s = scoreCoin(c);
  const ratio = c.volume24h && c.marketCap ? c.volume24h / c.marketCap : null;
  return {
    id: c.id,
    rank: c.rank ?? null,
    name: c.name,
    symbol: c.symbol,
    type: classifyAsset(c),
    price_eur: c.price ?? null,
    change_24h_pct: c.change24h ?? null,
    change_7d_pct: c.change7d ?? null,
    market_cap_eur: c.marketCap ?? null,
    volume_24h_eur: c.volume24h ?? null,
    volume_marketcap_ratio: ratio,
    score: s.score,
    score_label: s.label,
    decision: beginnerDecision(c),
    limits: ["no_contract_security", "no_social_validation", "no_onchain_validation", "not_financial_advice"]
  };
}

function sourceHealthPayload() {
  const total = liveSources.length;
  const status = liveSources.map(src => {
    const rec = state.sourceStatus.find(s => s.key === src.key);
    return {
      key: src.key,
      name: src.name,
      role: src.key === "coingecko" ? "critical_market_source" : "secondary_source",
      kind: src.kind,
      status: rec ? rec.status : "WAIT",
      ms: rec?.ms ?? null,
      detail: rec?.detail ?? "not_tested"
    };
  });

  const ok = status.filter(s => s.status === "OK").length;
  const fail = status.filter(s => s.status === "ÉCHEC").length;

  return {
    live_ok: state.liveOk,
    main_source: state.mainSource,
    total_sources: total,
    successful_sources: ok,
    failed_sources: fail,
    tested_sources: state.sourceStatus.length,
    critical_rule: "CoinGecko market must be OK to authorize table/prices/charts in this public build.",
    sources: status
  };
}



const SIM_STORAGE_KEY = "agent_crypto_erith_ia_sim_v1";
const SIM_START_CASH = 1000;

function loadSimulation() {
  try {
    const raw = localStorage.getItem(SIM_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.cash === "number" && parsed.positions) {
        state.sim = parsed;
        return;
      }
    }
  } catch {}
  state.sim = { cash: SIM_START_CASH, initialCash: SIM_START_CASH, positions: {}, logs: [] };
}

function saveSimulation() {
  try { localStorage.setItem(SIM_STORAGE_KEY, JSON.stringify(state.sim)); } catch {}
}

function resetSimulation() {
  state.sim = {
    cash: SIM_START_CASH,
    initialCash: SIM_START_CASH,
    positions: {},
    logs: [{ time: new Date().toISOString(), type: "RESET", message: "Simulation réinitialisée." }]
  };
  saveSimulation();
  renderSimulation();
}

function simLog(entry) {
  if (!state.sim) loadSimulation();
  state.sim.logs.unshift({ time: new Date().toISOString(), ...entry });
  state.sim.logs = state.sim.logs.slice(0, 50);
}

function getPositionValue(symbol) {
  if (!state.sim) loadSimulation();
  const pos = state.sim.positions[symbol];
  if (!pos) return 0;
  const coin = findCoinByQuery(symbol);
  const price = coin?.price ?? pos.lastPrice ?? pos.avgPrice ?? 0;
  return pos.qty * price;
}

function getSimulationTotals() {
  if (!state.sim) loadSimulation();
  const positionsValue = Object.keys(state.sim.positions).reduce((sum, sym) => sum + getPositionValue(sym), 0);
  const total = state.sim.cash + positionsValue;
  return { positionsValue, total, pnl: total - state.sim.initialCash };
}

function simulationPayload() {
  if (!state.sim) loadSimulation();
  const totals = getSimulationTotals();
  const positions = Object.keys(state.sim.positions).map(sym => {
    const pos = state.sim.positions[sym];
    const coin = findCoinByQuery(sym);
    const price = coin?.price ?? pos.lastPrice ?? pos.avgPrice;
    const value = pos.qty * price;
    return {
      symbol: sym,
      name: pos.name,
      qty: pos.qty,
      avg_price_eur: pos.avgPrice,
      current_price_eur: price,
      invested_eur: pos.invested,
      value_eur: value,
      pnl_eur: value - pos.invested
    };
  });
  return {
    mode: "paper_trading_only",
    cash_eur: state.sim.cash,
    initial_cash_eur: state.sim.initialCash,
    positions_value_eur: totals.positionsValue,
    total_value_eur: totals.total,
    pnl_eur: totals.pnl,
    positions,
    logs: state.sim.logs.slice(0, 10)
  };
}

function simulateOrder(side, symbolInput = null, amountInput = null) {
  if (!state.liveOk || !state.coins.length) return commandError("Livecheck requis avant simulation.", sourceHealthPayload());

  const symbol = normalizeSymbol(symbolInput || els.simSymbol?.value || "");
  const amount = Number(amountInput ?? els.simAmount?.value ?? 0);
  const coin = findCoinByQuery(symbol);

  if (!coin) return commandError(`Actif introuvable pour simulation : ${symbol}`);
  if (!Number.isFinite(amount) || amount <= 0) return commandError("Montant invalide.");
  if (!state.sim) loadSimulation();

  const price = coin.price;
  if (!Number.isFinite(price) || price <= 0) return commandError("Prix indisponible pour simulation.");

  const sym = coin.symbol.toUpperCase();
  const pos = state.sim.positions[sym] || { symbol: sym, name: coin.name, qty: 0, avgPrice: 0, invested: 0, lastPrice: price };

  if (side === "buy") {
    if (amount > state.sim.cash) return commandError("Capital virtuel insuffisant.", { cash: state.sim.cash, requested: amount });
    const qty = amount / price;
    const newQty = pos.qty + qty;
    const newInvested = pos.invested + amount;
    pos.qty = newQty;
    pos.invested = newInvested;
    pos.avgPrice = newInvested / newQty;
    pos.lastPrice = price;
    state.sim.positions[sym] = pos;
    state.sim.cash -= amount;
    simLog({ type: "SIM_BUY", symbol: sym, amount_eur: amount, price_eur: price, qty, message: `Achat simulé ${sym} pour ${fmtEUR.format(amount)}.` });
  } else if (side === "sell") {
    if (!pos.qty || pos.qty <= 0) return commandError(`Aucune position virtuelle à vendre pour ${sym}.`);
    const maxValue = pos.qty * price;
    const sellValue = Math.min(amount, maxValue);
    const qty = sellValue / price;
    const soldRatio = qty / pos.qty;
    pos.qty -= qty;
    pos.invested = Math.max(0, pos.invested * (1 - soldRatio));
    pos.lastPrice = price;
    state.sim.cash += sellValue;
    if (pos.qty <= 0.00000001) delete state.sim.positions[sym];
    else state.sim.positions[sym] = pos;
    simLog({ type: "SIM_SELL", symbol: sym, amount_eur: sellValue, price_eur: price, qty, message: `Vente simulée ${sym} pour ${fmtEUR.format(sellValue)}.` });
  }

  saveSimulation();
  renderSimulation();
  return commandOk(`sim_${side} ${sym} ${amount}`, { side, symbol: sym, amount_eur: amount, price_eur: price, portfolio: simulationPayload() });
}

function renderSimulation() {
  if (!state.sim) loadSimulation();
  const totals = getSimulationTotals();
  setText(els.simCash, fmtEUR.format(state.sim.cash));
  setText(els.simPositionsValue, fmtEUR.format(totals.positionsValue));
  setText(els.simTotalValue, fmtEUR.format(totals.total));
  if (els.simPnL) {
    els.simPnL.textContent = `${totals.pnl >= 0 ? "+" : ""}${fmtEUR.format(totals.pnl)}`;
    els.simPnL.classList.toggle("pnl-pos", totals.pnl >= 0);
    els.simPnL.classList.toggle("pnl-neg", totals.pnl < 0);
  }
  const positions = Object.keys(state.sim.positions);
  if (els.simPositions) {
    els.simPositions.innerHTML = positions.length ? positions.map(sym => {
      const pos = state.sim.positions[sym];
      const coin = findCoinByQuery(sym);
      const price = coin?.price ?? pos.lastPrice ?? pos.avgPrice;
      const value = pos.qty * price;
      const pnl = value - pos.invested;
      return `<div class="sim-position-row"><b>${escapeHtml(sym)}</b><span>${pos.qty.toFixed(8)}</span><span>${fmtEUR.format(value)}</span><span class="${pnl >= 0 ? "pnl-pos" : "pnl-neg"}">${pnl >= 0 ? "+" : ""}${fmtEUR.format(pnl)}</span></div>`;
    }).join("") : "Aucune position simulée.";
  }
  if (els.simLog) {
    els.simLog.textContent = state.sim.logs.length ? state.sim.logs.map(l => `[${l.time}] ${l.type} · ${l.message || ""}`).join("\n") : "Aucune simulation lancée.";
  }
}



function backendBlueprintPayload() {
  return {
    version: "RC15",
    principle: "separate_public_frontend_from_private_backend",
    public_layer: {
      host: "GitHub Pages",
      allowed: [
        "market_observation",
        "charts",
        "watchlist",
        "command_layer_observation",
        "local_paper_trading"
      ],
      forbidden: [
        "private_api_keys",
        "withdraw_keys",
        "real_orders",
        "admin_remote_access",
        "wallet_connection"
      ]
    },
    private_layer_future: {
      host: "PC_Yohan_or_secure_local_server",
      allowed: [
        "encrypted_api_secrets",
        "Kraken_read_only_client",
        "server_side_paper_trading",
        "logs",
        "kill_switch",
        "restricted_remote_access"
      ],
      access: ["Christophe", "Yohan"]
    },
    exchange_layer_future: {
      primary: "Kraken",
      first_mode: "read_only",
      later_modes_locked: [
        "paper_trading_server",
        "human_validated_order",
        "real_micro_transaction"
      ],
      never_allowed_initially: [
        "withdraw_permission",
        "fully_autonomous_trading"
      ]
    }
  };
}

function krakenReadonlyPlanPayload() {
  return {
    exchange: "Kraken",
    target_stage: "read_only_only",
    allowed_first: [
      "account_balance_read",
      "ticker_read",
      "trade_history_read_if_needed",
      "open_positions_read_if_applicable"
    ],
    forbidden_first: [
      "create_order",
      "cancel_order",
      "withdraw",
      "transfer",
      "margin",
      "leverage"
    ],
    required_before_connection: [
      "backend_not_github_pages",
      "encrypted_secret_storage",
      "separate_user_accounts",
      "logs",
      "manual_disable",
      "test_key_permissions",
      "no_withdraw_permission"
    ]
  };
}

function remoteBlueprintPayload() {
  return {
    scope: "future_private_machine_only",
    authorized_people: ["Christophe", "Yohan"],
    rules: [
      "no_public_admin_panel",
      "no_shared_cleartext_password",
      "unique_accounts",
      "strong_authentication",
      "admin_actions_logged",
      "emergency_disable_path",
      "regular_security_review"
    ],
    current_public_frontend: "no_remote_access_capability"
  };
}

function securityReviewPayload() {
  return {
    review_type: "pre_backend_security_checklist",
    checklist: [
      { item: "GitHub Pages contains no secrets", status: "required" },
      { item: "Kraken key read-only", status: "future_required" },
      { item: "Withdraw permission disabled", status: "mandatory" },
      { item: "Backend logs every command", status: "future_required" },
      { item: "Kill switch tested", status: "future_required" },
      { item: "Paper trading runs before real money", status: "mandatory" },
      { item: "Human validation before any real order", status: "mandatory" },
      { item: "Remote access reviewed regularly", status: "future_required" }
    ],
    conclusion: "No real-money phase without passing all mandatory items."
  };
}

function safetyPlanPayload() {
  return {
    mode: "safety_first",
    confirmed_context: {
      yohan_requires_sandbox: true,
      remote_access_for_christophe_and_yohan_only: true,
      human_validation_required: true,
      simulation_before_real_money: true,
      modification_possible_if_failure: true
    },
    sandbox_boundaries: [
      "public_frontend_observation_only",
      "paper_trading_local_only",
      "no_real_exchange_order",
      "no_wallet_connection",
      "no_private_api_key_in_github_pages",
      "no_withdraw_permission"
    ],
    required_before_real_backend: [
      "separate_machine_or_backend",
      "restricted_remote_access",
      "encrypted_secret_storage",
      "read_only_kraken_key_first",
      "paper_trading_logs",
      "kill_switch",
      "human_confirmation_flow",
      "regular_security_review"
    ]
  };
}

function killSwitchPayload() {
  return {
    status: "planned_not_active_in_github_pages",
    purpose: "Stop the future backend/agent if abnormal behavior appears.",
    manual_steps_future: [
      "disable_backend_service",
      "revoke_exchange_api_keys",
      "disable_remote_access_temporarily",
      "freeze_paper_trading_state",
      "export_logs",
      "review_last_commands",
      "human_restart_only"
    ],
    current_public_app_limits: [
      "no_real_orders_possible",
      "no_api_keys_present",
      "simulation_only"
    ]
  };
}

function accessPlanPayload() {
  return {
    access_model: "two_people_only",
    authorized_people: ["Christophe", "Yohan"],
    public_app: "no_remote_admin_capability",
    future_backend_requirements: [
      "strong_authentication",
      "unique_accounts",
      "no_shared_cleartext_password",
      "logs_for_admin_actions",
      "regular_access_review",
      "no_public_open_admin_panel",
      "emergency_disable_path"
    ],
    warning: "Remote access must be configured outside GitHub Pages."
  };
}

function gatesPayload() {
  return {
    current_gate: "G3_paper_trading",
    gates: [
      { id: "G1", name: "observatory_public", status: "done" },
      { id: "G2", name: "crypto_command_layer", status: "done" },
      { id: "G3", name: "paper_trading_sandbox", status: "active" },
      { id: "G4", name: "kraken_read_only_connection", status: "locked" },
      { id: "G5", name: "semi_auto_human_validation", status: "locked" },
      { id: "G6", name: "real_micro_transactions", status: "locked" }
    ],
    unlock_rule: "No gate opens without logs, tests, explicit human validation, and security review."
  };
}

function planningPayload() {
  return {
    project_stage: "public_observatory_to_controlled_agent",
    confirmed_by_yohan: {
      micro_transactions: true,
      main_wallet_reference: "Kraken",
      mode: "semi_automatic_human_validation",
      remote_access: "two_people_only",
      simulation_before_real_money: true,
      news_references_required: true
    },
    phases: [
      "observation_dashboard",
      "crypto_command_layer",
      "paper_trading_simulation",
      "read_only_exchange_connection",
      "human_validated_orders",
      "real_micro_transactions_locked"
    ],
    hard_rules: [
      "no_private_api_key_in_github_pages",
      "no_withdraw_key",
      "no_real_order_from_public_frontend",
      "dry_run_before_real_money",
      "logs_required",
      "emergency_stop_required"
    ]
  };
}

function exchangePlanPayload() {
  return {
    primary_reference: {
      exchange: "Kraken",
      role: "wallet_account_security_reference",
      first_connection: "read_only_then_simulation"
    },
    secondary_reference: {
      exchange: "Bybit",
      role: "api_trading_reference_to_compare",
      first_connection: "research_only"
    },
    inspiration: {
      exchange: "Binance",
      role: "command_layer_market_data_inspiration"
    },
    next_backend_need: [
      "secure_local_or_server_backend",
      "encrypted_api_keys",
      "access_control_for_christophe_and_yohan",
      "paper_trading_engine",
      "logs_and_kill_switch"
    ]
  };
}

function newsPlanPayload() {
  return {
    rule: "News never triggers buy/sell automatically.",
    global_press: ["Reuters", "AP", "AFP", "BBC", "Le Monde", "Financial Times"],
    crypto_press: ["CoinDesk", "The Block", "Decrypt", "Cointelegraph"],
    institutions: ["AMF", "ESMA", "BCE", "SEC", "CFTC", "central banks"],
    exchanges: ["Kraken announcements", "Bybit announcements", "Binance announcements", "exchange status pages"],
    classification: [
      "source_identified",
      "reliability_estimated",
      "possible_market_impact",
      "missing_verifications",
      "action: ignore | monitor | verify | wait"
    ]
  };
}

const CryptoCommands = {
  help() {
    return commandOk("help", {
      available_commands: [
        "market_snapshot",
        "asset BTC",
        "chart ETH 7d",
        "compare BTC ETH",
        "sources",
        "category USDT",
        "risk SOL",
        "planning",
        "exchange_plan",
        "news_sources",
        "sim_buy BTC 25",
        "sim_sell BTC 10",
        "portfolio",
        "reset_sim",
        "safety_plan",
        "kill_switch",
        "access_plan",
        "gates",
        "backend_blueprint",
        "kraken_readonly_plan",
        "remote_blueprint",
        "security_review"
      ],
      blocked_commands: ["buy", "sell", "order", "trade", "withdraw", "transfer"],
      rule: "Observation only. No real trading from GitHub Pages."
    });
  },

  market_snapshot() {
    if (!state.liveOk || !state.coins.length) {
      return commandError("Livecheck requis : aucune donnée marché fiable chargée.", sourceHealthPayload());
    }

    const btc = findCoinByQuery("BTC");
    const eth = findCoinByQuery("ETH");

    return commandOk("market_snapshot", {
      source: state.mainSource,
      timestamp: state.timestamp,
      global: {
        market_cap_eur: state.global?.total_market_cap?.eur ?? null,
        volume_24h_eur: state.global?.total_volume?.eur ?? null,
        btc_dominance_pct: state.global?.market_cap_percentage?.btc ?? null
      },
      loaded_assets: state.coins.length,
      btc: coinPayload(btc),
      eth: coinPayload(eth),
      source_health: sourceHealthPayload()
    });
  },

  asset(symbol) {
    if (!state.liveOk || !state.coins.length) return commandError("Livecheck requis avant lecture actif.", sourceHealthPayload());
    const c = findCoinByQuery(symbol);
    if (!c) return commandError(`Actif introuvable dans le top chargé : ${symbol}`, { loaded_assets: state.coins.length });
    return commandOk(`asset ${symbol}`, coinPayload(c));
  },

  category(symbol) {
    if (!state.liveOk || !state.coins.length) return commandError("Livecheck requis avant classification.", sourceHealthPayload());
    const c = findCoinByQuery(symbol);
    if (!c) return commandError(`Actif introuvable : ${symbol}`);
    return commandOk(`category ${symbol}`, {
      symbol: c.symbol,
      name: c.name,
      category: classifyAsset(c),
      reading: whyDecision(c)
    });
  },

  risk(symbol) {
    if (!state.liveOk || !state.coins.length) return commandError("Livecheck requis avant lecture risque.", sourceHealthPayload());
    const c = findCoinByQuery(symbol);
    if (!c) return commandError(`Actif introuvable : ${symbol}`);
    return commandOk(`risk ${symbol}`, {
      asset: coinPayload(c),
      risk_flags: [
        "contract_security_not_checked",
        "social_signal_not_checked",
        "onchain_signal_not_checked",
        "public_market_data_only"
      ],
      no_fomo_rule: "Une occasion ratée ne coûte rien. Une mauvaise position peut coûter très cher.",
      conclusion: "Observation only. Human validation required."
    });
  },

  sources() {
    return commandOk("sources", sourceHealthPayload());
  },

  chart(symbol, period = "24h") {
    if (!state.liveOk || !state.coins.length) return commandError("Livecheck requis avant graphique.", sourceHealthPayload());
    const c = findCoinByQuery(symbol);
    if (!c) return commandError(`Actif introuvable : ${symbol}`);

    const normalized = String(period || "24h").toLowerCase();
    const days = normalized.includes("30") ? 30 : normalized.includes("7") ? 7 : 1;

    state.selectedCoinId = c.id;
    state.chartPeriodDays = days;
    document.querySelectorAll(".period-btn[data-period]").forEach(btn => {
      btn.classList.toggle("active", Number(btn.dataset.period) === days);
    });
    renderScore(c);
    renderMarketTable();
    requestAnimationFrame(() => renderAnalystPanel());

    return commandOk(`chart ${symbol} ${period}`, {
      selected_asset: coinPayload(c),
      period_days: days,
      action: "chart_panel_updated"
    });
  },

  compare(symbolA, symbolB) {
    if (!state.liveOk || !state.coins.length) return commandError("Livecheck requis avant comparaison.", sourceHealthPayload());
    const a = findCoinByQuery(symbolA);
    const b = findCoinByQuery(symbolB);
    if (!a || !b) return commandError("Comparaison impossible : un actif est introuvable.", { symbolA, foundA: !!a, symbolB, foundB: !!b });

    const ap = coinPayload(a);
    const bp = coinPayload(b);

    return commandOk(`compare ${symbolA} ${symbolB}`, {
      left: ap,
      right: bp,
      delta: {
        price_eur: (a.price ?? 0) - (b.price ?? 0),
        change_24h_pct: (a.change24h ?? 0) - (b.change24h ?? 0),
        change_7d_pct: (a.change7d ?? 0) - (b.change7d ?? 0),
        market_cap_eur: (a.marketCap ?? 0) - (b.marketCap ?? 0),
        volume_24h_eur: (a.volume24h ?? 0) - (b.volume24h ?? 0),
        score: (ap.score ?? 0) - (bp.score ?? 0)
      },
      warning: "Comparison is observational; it does not rank investment quality."
    });
  },

  planning() {
    return commandOk("planning", planningPayload());
  },

  exchange_plan() {
    return commandOk("exchange_plan", exchangePlanPayload());
  },

  news_sources() {
    return commandOk("news_sources", newsPlanPayload());
  }
};

function parseCommandLine(input) {
  const raw = String(input || "").trim();
  if (!raw) return commandError("Commande vide. Tape help.");

  const parts = raw.split(/\s+/);
  const cmd = parts[0].toLowerCase();

  if (["buy", "sell", "order", "trade", "withdraw", "transfer"].includes(cmd)) {
    return commandError("Commande bloquée : aucun ordre réel, retrait ou transfert depuis cette interface publique.", {
      command: raw,
      rule: "Trading must require backend, API keys protected, dry-run, logs, limits, and human validation."
    });
  }

  if (cmd === "help") return CryptoCommands.help();
  if (cmd === "market_snapshot" || cmd === "snapshot" || cmd === "market") return CryptoCommands.market_snapshot();
  if (cmd === "asset" || cmd === "quote") return CryptoCommands.asset(parts[1]);
  if (cmd === "chart" || cmd === "graph") return CryptoCommands.chart(parts[1], parts[2] || "24h");
  if (cmd === "compare") return CryptoCommands.compare(parts[1], parts[2]);
  if (cmd === "sources" || cmd === "health" || cmd === "source_health") return CryptoCommands.sources();
  if (cmd === "sim_buy" || cmd === "paper_buy") return simulateOrder("buy", parts[1], parts[2]);
  if (cmd === "sim_sell" || cmd === "paper_sell") return simulateOrder("sell", parts[1], parts[2]);
  if (cmd === "portfolio" || cmd === "paper_portfolio") return commandOk("portfolio", simulationPayload());
  if (cmd === "reset_sim" || cmd === "paper_reset") { resetSimulation(); return commandOk("reset_sim", simulationPayload()); }
  if (cmd === "backend_blueprint" || cmd === "backend") return commandOk("backend_blueprint", backendBlueprintPayload());
  if (cmd === "kraken_readonly_plan" || cmd === "kraken_readonly") return commandOk("kraken_readonly_plan", krakenReadonlyPlanPayload());
  if (cmd === "remote_blueprint" || cmd === "remote") return commandOk("remote_blueprint", remoteBlueprintPayload());
  if (cmd === "security_review" || cmd === "security_check") return commandOk("security_review", securityReviewPayload());
  if (cmd === "safety_plan" || cmd === "safety") return commandOk("safety_plan", safetyPlanPayload());
  if (cmd === "kill_switch" || cmd === "killswitch") return commandOk("kill_switch", killSwitchPayload());
  if (cmd === "access_plan" || cmd === "remote_access") return commandOk("access_plan", accessPlanPayload());
  if (cmd === "gates" || cmd === "gate_status") return commandOk("gates", gatesPayload());
  if (cmd === "planning" || cmd === "roadmap") return CryptoCommands.planning();
  if (cmd === "exchange_plan" || cmd === "exchanges") return CryptoCommands.exchange_plan();
  if (cmd === "news_sources" || cmd === "news" || cmd === "journaux") return CryptoCommands.news_sources();
  if (cmd === "category" || cmd === "cat") return CryptoCommands.category(parts[1]);
  if (cmd === "risk" || cmd === "risk_readout") return CryptoCommands.risk(parts[1]);

  return commandError(`Commande inconnue : ${cmd}`, {
    hint: "Tape help.",
    received: raw
  });
}


function humanCommandSummary(result) {
  const cmd = String(result?.command || "").toLowerCase();

  if (!result || result.ok === false) {
    return {
      title: "Commande bloquée ou impossible",
      text: result?.error || "La commande n’a pas pu être exécutée.",
      bullets: [
        "Aucun ordre réel n’a été envoyé.",
        "Aucune clé API n’est utilisée dans cette page.",
        "Vérifie Livecheck si la commande dépend des données marché."
      ],
      tags: ["sécurité", "observation only"]
    };
  }

  if (cmd === "backend_blueprint") {
    return {
      title: "Backend Blueprint : test OK",
      text: "La commande a affiché le plan public / privé / Kraken. Elle ne connecte rien : elle vérifie seulement que l’architecture future est bien décrite.",
      bullets: [
        "Public : GitHub Pages, sans clé, observation et simulation seulement.",
        "Privé : futur PC Yohan ou backend local sécurisé.",
        "Exchange : Kraken en lecture seule d’abord.",
        "Interdit : ordre réel, clé de retrait, clé API dans GitHub."
      ],
      tags: ["plan validé", "aucune connexion réelle", "Kraken plus tard"]
    };
  }

  if (cmd === "security_review") {
    return {
      title: "Security Review : checklist OK",
      text: "La commande affiche les sécurités obligatoires avant tout passage à une machine privée ou à Kraken.",
      bullets: [
        "Aucune clé dans GitHub Pages.",
        "Clé Kraken lecture seule au départ.",
        "Retrait désactivé.",
        "Logs, kill switch et validation humaine obligatoires.",
        "Paper trading avant argent réel."
      ],
      tags: ["sécurité", "checklist", "avant réel"]
    };
  }

  if (cmd === "kraken_readonly_plan") {
    return {
      title: "Kraken lecture seule : plan OK",
      text: "La commande décrit le futur premier niveau Kraken : lire des données, sans acheter, vendre, transférer ou retirer.",
      bullets: [
        "Lecture solde / prix / historique uniquement.",
        "Aucun ordre autorisé.",
        "Aucun retrait autorisé.",
        "Backend sécurisé requis."
      ],
      tags: ["Kraken", "lecture seule", "future étape"]
    };
  }

  if (cmd === "remote_blueprint") {
    return {
      title: "Accès distant : plan OK",
      text: "La commande décrit le futur accès réservé à Christophe et Yohan uniquement.",
      bullets: [
        "Pas de panneau admin public.",
        "Comptes séparés.",
        "Authentification forte.",
        "Actions admin journalisées.",
        "Désactivation d’urgence prévue."
      ],
      tags: ["accès renforcé", "2 personnes", "hors GitHub Pages"]
    };
  }

  if (cmd === "market_snapshot") {
    return {
      title: "Snapshot marché : OK",
      text: "La commande résume l’état du marché chargé par Livecheck.",
      bullets: [
        "Source principale utilisée.",
        "Capitalisation globale.",
        "Volume 24h.",
        "BTC / ETH comme repères."
      ],
      tags: ["marché", "lecture live"]
    };
  }

  if (cmd.startsWith("asset ")) {
    return {
      title: "Lecture actif : OK",
      text: "La commande a récupéré les données d’une crypto chargée dans le tableau.",
      bullets: [
        "Prix.",
        "Variation 24h / 7j.",
        "Type d’actif.",
        "Score de veille.",
        "Limites : pas sécurité contrat, pas social, pas on-chain."
      ],
      tags: ["actif", "observation"]
    };
  }

  if (cmd.startsWith("chart ")) {
    return {
      title: "Graphique mis à jour",
      text: "La commande a sélectionné l’actif et la période dans le panneau graphique.",
      bullets: [
        "Le graphique change dans la zone Analyste.",
        "Le score et le détail actif se synchronisent.",
        "Ce n’est pas un signal d’achat."
      ],
      tags: ["graphique", "analyste"]
    };
  }

  if (cmd === "portfolio" || cmd.startsWith("sim_") || cmd === "reset_sim") {
    return {
      title: "Simulation : OK",
      text: "La commande agit uniquement sur le portefeuille virtuel local.",
      bullets: [
        "Aucun argent réel.",
        "Aucun wallet connecté.",
        "Aucune clé API.",
        "Stockage local navigateur."
      ],
      tags: ["paper trading", "simulation only"]
    };
  }

  if (cmd === "sources") {
    return {
      title: "Sources : diagnostic OK",
      text: "La commande affiche l’état des sources interrogées.",
      bullets: [
        "CoinGecko est critique pour le tableau.",
        "Les sources secondaires peuvent échouer sans bloquer si CoinGecko répond.",
        "Les erreurs restent visibles."
      ],
      tags: ["diagnostic", "sources"]
    };
  }

  return {
    title: "Commande exécutée",
    text: "La commande a produit un résultat technique. Le résumé JSON reste disponible dessous.",
    bullets: [
      "Résultat reçu.",
      "Aucun ordre réel.",
      "Mode observation only."
    ],
    tags: ["OK", "dry-run"]
  };
}

function renderHumanCommand(result) {
  if (!els.commandHuman) return;

  const summary = humanCommandSummary(result);
  els.commandHuman.classList.toggle("ok", result?.ok !== false);
  els.commandHuman.classList.toggle("err", result?.ok === false);

  const bullets = summary.bullets.map(item => `<li>${escapeHtml(item)}</li>`).join("");
  const tags = summary.tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join("");

  els.commandHuman.innerHTML = `
    <b>${escapeHtml(summary.title)}</b>
    <p>${escapeHtml(summary.text)}</p>
    <ul>${bullets}</ul>
    <div class="cmd-tags">${tags}</div>
  `;
}

function renderCommandOutput(result) {
  renderHumanCommand(result);
  if (!els.commandOutput) return;
  els.commandOutput.textContent = JSON.stringify(result, null, 2);
}

function runCommandFromInput(commandText = null) {
  const text = commandText ?? els.commandInput?.value ?? "";
  if (els.commandInput && commandText !== null) els.commandInput.value = commandText;
  const result = parseCommandLine(text);
  if (els.commandOutput) els.commandOutput.dataset.userRan = "1";
  renderCommandOutput(result);
}

function renderAll() {
  renderMetrics();
  renderTicker();
  renderMarketTable();
  renderWatchlist();
  renderScore(getSelectedCoin() || state.coins[0] || null);
  renderRiskGrid();
  renderColdRead(true);
  renderBeginnerSummary();
  renderSimulation();

  requestAnimationFrame(() => {
    renderAnalystPanel();
    if (els.commandOutput && !els.commandOutput.dataset.userRan) {
      renderCommandOutput(CryptoCommands.market_snapshot());
    }
  });
}

function renderMetrics() {
  const g = state.global;

  if (g) {
    setText(els.metricMarketCap, num(g.total_market_cap?.eur, fmtCompactEUR.format.bind(fmtCompactEUR)));
    setText(els.metricMarketCapHint, "CoinGecko global");
    setText(els.metricVolume, num(g.total_volume?.eur, fmtCompactEUR.format.bind(fmtCompactEUR)));
    setText(els.metricVolumeHint, "Volume global 24h");

    const btc = g.market_cap_percentage?.btc;
    setText(els.metricBtcDom, typeof btc === "number" ? `${btc.toFixed(2)} %` : "Donnée manquante");
    setText(els.metricBtcDomHint, "Dominance BTC");
  }

  updateSourceMetric();
}

function renderTicker() {
  if (!state.liveOk || !state.coins.length) {
    setHTML(els.tickerTrack, `<span class="ticker-meta">Livecheck requis · aucune donnée chiffrée chargée · pas de tableau fictif</span>`);
    return;
  }

  const items = state.coins.slice(0, 18).map(c => {
    const cls = clsPct(c.change24h);
    return `<span class="ticker-item">
      <span class="ticker-symbol">${escapeHtml(c.symbol)}</span>
      <span class="ticker-price">${num(c.price, fmtEUR.format.bind(fmtEUR))}</span>
      <span class="ticker-change ${cls}">${fmtPct(c.change24h)}</span>
    </span>`;
  }).join("");

  const meta = `<span class="ticker-meta">Source : ${escapeHtml(state.mainSource)} · Heure : ${new Date(state.timestamp).toLocaleTimeString("fr-FR")}</span>`;

  setHTML(els.tickerTrack, `<span>${items}${meta}</span><span>${items}${meta}</span>`);
}

function scoreCoin(c) {
  if (!c) return { score: null, label: "En attente", parts: {} };

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
  penalty += 16; // sécurité/social/on-chain non vérifiés dans le prototype public.

  const score = Math.round(clamp(0, 100, base - penalty));
  let label = "Veille";
  if (score <= 40) label = "Veille fragile";
  else if (score <= 55) label = "Veille";
  else if (score <= 65) label = "Signal faible";
  else if (score <= 75) label = "Analyse approfondie";
  else label = "Signal fort mais risqué";

  return { score, label, parts };
}

function decisionFromScore(score) {
  if (score === null || score === undefined) return "Livecheck requis";
  if (score <= 40) return "Veille fragile";
  if (score <= 55) return "Veille";
  if (score <= 65) return "Signal faible";
  if (score <= 75) return "Analyse approfondie";
  return "Signal fort mais risqué";
}

function renderMarketTable() {
  if (!els.marketRows) return;

  if (!state.liveOk || !state.coins.length) {
    renderEmptyMarket("Livecheck requis. Aucun prix inventé.");
    return;
  }

  const q = (els.searchInput?.value || "").toLowerCase().trim();
  const filtered = state.coins
    .filter(c => !q || c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q))
    .filter(matchAssetFilter);

  const rows = sortAssets(filtered).slice(0, 50);

  if (!rows.length) {
    renderEmptyMarket("Aucun actif ne correspond au filtre.");
    return;
  }

  els.marketRows.innerHTML = rows.map(c => {
    const s = scoreCoin(c);
    return `<tr class="asset-row ${c.id === state.selectedCoinId ? 'is-selected' : ''}" data-id="${escapeHtml(c.id)}">
      <td>${c.rank ?? "—"}</td>
      <td><div class="coin-cell">${c.image ? `<img src="${escapeHtml(c.image)}" alt="" loading="lazy">` : ""}<div><strong>${escapeHtml(c.name)}</strong><br><small>${escapeHtml(c.symbol)}</small><br><span class="asset-badge">${escapeHtml(classifyAsset(c))}</span></div></div></td>
      <td>${num(c.price, fmtEUR.format.bind(fmtEUR))}</td>
      <td class="${clsPct(c.change24h)}">${fmtPct(c.change24h)}</td>
      <td class="${clsPct(c.change7d)}">${fmtPct(c.change7d)}</td>
      <td>${num(c.marketCap, fmtCompactEUR.format.bind(fmtCompactEUR))}</td>
      <td>${num(c.volume24h, fmtCompactEUR.format.bind(fmtCompactEUR))}</td>
      <td class="spark-cell">${sparkSvg(c)}</td>
      <td>${s.score}</td>
      <td>${beginnerDecision(c)}</td>
    </tr>`;
  }).join("");

  setText(
    els.tableNote,
    `${rows.length}/${filtered.length} actifs affichés · filtre : ${state.assetFilter} · tri : ${state.sortKey}. Source : ${state.mainSource}.`
  );

  [...els.marketRows.querySelectorAll("tr[data-id]")].forEach(row => {
    row.addEventListener("click", () => {
      const coin = state.coins.find(c => c.id === row.dataset.id);
      if (!coin) return;
      state.selectedCoinId = coin.id;
      renderScore(coin);
      renderMarketTable();
      renderAnalystPanel();
    });
  });
}

function renderEmptyMarket(message) {
  if (els.marketRows) {
    els.marketRows.innerHTML = `<tr><td colspan="10" class="empty">${escapeHtml(message)}</td></tr>`;
  }
  setText(els.tableNote, "Pas de source live, pas de prix.");
}

function renderScore(coin) {
  const s = scoreCoin(coin);

  if (!els.scoreRing || !els.scoreValue || !els.scoreLabel || !els.scoreBreakdown) return;

  if (s.score === null) {
    els.scoreRing.style.setProperty("--score", 0);
    els.scoreValue.textContent = "—";
    els.scoreLabel.textContent = "En attente";
    els.scoreBreakdown.innerHTML = `
      <div><span>Information</span><b>—</b></div>
      <div><span>Marché</span><b>—</b></div>
      <div><span>Liquidité</span><b>—</b></div>
      <div><span>Momentum</span><b>—</b></div>
      <div><span>Risque</span><b>—</b></div>`;
    return;
  }

  els.scoreRing.style.setProperty("--score", s.score);
  els.scoreValue.textContent = s.score;
  els.scoreLabel.textContent = s.label;
  els.scoreBreakdown.innerHTML = `
    <div><span>Information</span><b>${Math.round(s.parts.information)}/15</b></div>
    <div><span>Marché</span><b>${Math.round(s.parts.market)}/15</b></div>
    <div><span>Liquidité</span><b>${Math.round(s.parts.liquidity)}/15</b></div>
    <div><span>Momentum</span><b>${Math.round(s.parts.momentum)}/10</b></div>
    <div><span>Risque</span><b>pénalité active</b></div>
    <div class="why-box">${escapeHtml(whyDecision(coin))}</div>`;
}

function renderWatchlist() {
  if (!els.watchCards) return;

  if (!state.liveOk || !state.coins.length) {
    els.watchCards.innerHTML = `<div class="mini-card muted">Livecheck requis. Aucune donnée watchlist inventée.</div>`;
    return;
  }

  const cards = state.watchIds
    .map(id => state.coins.find(c => c.id === id))
    .filter(Boolean)
    .map(c => {
      const s = scoreCoin(c);
      return `<div class="mini-card">
        <strong>${escapeHtml(c.name)} · ${escapeHtml(c.symbol)}</strong>
        <div class="meta">${num(c.price, fmtEUR.format.bind(fmtEUR))} · 24h <span class="${clsPct(c.change24h)}">${fmtPct(c.change24h)}</span></div>
        <div class="meta">Score ${s.score} · ${decisionFromScore(s.score)}</div>
      </div>`;
    });

  els.watchCards.innerHTML = cards.length
    ? cards.join("")
    : `<div class="mini-card muted">Aucun actif de watchlist trouvé dans le top chargé.</div>`;
}

function renderRiskGrid() {
  if (!els.riskGrid) return;

  els.riskGrid.innerHTML = `
    <div class="risk ${state.liveOk ? "ok" : "wait"}"><span>Marché</span><b>${state.liveOk ? "Source live OK" : "Non récupéré"}</b></div>
    <div class="risk warn"><span>Sécurité</span><b>Non vérifiée RC16</b></div>
    <div class="risk warn"><span>Social</span><b>Non vérifié</b></div>
    <div class="risk warn"><span>On-chain</span><b>Non vérifié</b></div>`;
}

function renderSourceGrid() {
  if (!els.sourceGrid) {
    renderSourceDiagnostic();
    return;
  }

  if (!state.sourceStatus.length) {
    els.sourceGrid.innerHTML = liveSources.map(s =>
      `<div class="source-item"><strong>${s.name}</strong><span>${s.kind}</span><span>En attente</span></div>`
    ).join("");
    renderSourceDiagnostic();
    return;
  }

  els.sourceGrid.innerHTML = state.sourceStatus.map(s =>
    `<div class="source-item ${s.status === "OK" ? "ok" : "fail"}">
      <strong>${s.name}</strong>
      <span>${s.kind}</span>
      <span>${s.status}${s.ms ? ` · ${s.ms} ms` : ""}</span>
      <span>${escapeHtml(s.detail || "")}</span>
    </div>`
  ).join("");

  renderSourceDiagnostic();
}


function renderTrustLock(live = false) {
  if (!els.trustLockText) return;

  els.trustLockText.classList.toggle("ok-lock", !!live);
  els.trustLockText.classList.toggle("warn-lock", !live);

  if (live) {
    const total = liveSources.length;
    const done = state.sourceStatus.length;
    const ok = state.sourceStatus.filter(s => s.status === "OK").length;
    const fail = Math.max(0, done - ok);
    const failText = fail === 1 ? "1 source secondaire a échoué" : `${fail} sources secondaires ont échoué`;

    els.trustLockText.textContent =
      `Source marché active : ${state.mainSource || "source réelle"}. ` +
      `Tableau autorisé parce que les prix viennent d’une source live. ` +
      `Sources : ${ok}/${total} réussies, ${done}/${total} interrogées. ` +
      `${fail ? failText + ". " : ""}` +
      "Achat interdit : sécurité, social et on-chain restent à vérifier.";
  } else {
    const total = liveSources.length;
    const done = state.sourceStatus.length;
    const ok = state.sourceStatus.filter(s => s.status === "OK").length;

    if (done) {
      els.trustLockText.textContent =
        `Source marché principale indisponible. ${ok}/${total} sources ont répondu, ${done}/${total} ont été interrogées. ` +
        "Rouge = tableau bloqué, pas erreur utilisateur.";
    } else {
      els.trustLockText.textContent =
        "Pas de source marché active : pas de prix, pas de tableau chiffré, pas de score fiable.";
    }
  }
}

function renderColdRead(live = false) {
  renderTrustLock(live);
  if (!els.coldRead) return;

  const box = els.coldRead.closest(".cold-read");
  if (box) {
    box.classList.toggle("live", live);
    box.classList.toggle("offline", !live);
  }

  if (live) {
    els.coldRead.textContent =
      `Snapshot live récupéré depuis ${state.mainSource}. Tableau autorisé : données marché réelles. ` +
      `Lecture froide : prix, volumes et market cap sont disponibles, mais sécurité contrat, social et on-chain restent non validés par cette interface RC16.`;
  } else {
    els.coldRead.textContent =
      "Accès live absent ou source marché principale indisponible. L’observatoire refuse d’afficher un tableau chiffré.";
  }
}

function analyzeNews() {
  const text = els.newsInput?.value.trim() || "";
  if (!text) {
    setText(els.newsOutput, "Colle une actualité à classifier.");
    return;
  }

  const lower = text.toLowerCase();
  const isRumor = /rumeur|serait|peut-être|insider|leak|telegram|x\.com|twitter/.test(lower);
  const isCritical = /hack|exploit|bridge|faillite|sec|amf|delisting|suspension|procès|attaque/.test(lower);
  const isListing = /listing|listé|binance|coinbase|kraken/.test(lower);
  const type = isRumor ? "rumeur / non confirmé" : isCritical ? "information critique potentielle" : isListing ? "catalyseur listing potentiel" : "information à qualifier";
  const score = isCritical ? 78 : isListing ? 64 : isRumor ? 36 : 48;

  setText(
    els.newsOutput,
    `NEWS SENTINEL\n\nType : ${type}\nScore News Impact : ${score}/100\nDécision : ${score >= 60 ? "analyse approfondie" : "veille"}\n\nRègle : ce score déclenche une vérification, pas une position.\nSources à vérifier : source primaire, communiqué officiel, source secondaire fiable, réaction marché, risque de manipulation.`
  );
}

function analyzeFomo() {
  const text = els.fomoInput?.value.trim() || "";
  if (!text) {
    setText(els.fomoOutput, "Écris ce qui déclenche la FOMO.");
    return;
  }

  const hasBigMove = /\+\s?\d{2,}|explos|pump|rate|raté|peur|vite|maintenant/i.test(text);

  setText(
    els.fomoOutput,
    `MODE NO-FOMO\n\nSignal émotionnel : ${hasBigMove ? "élevé" : "à vérifier"}\nDécision : position théorique interdite tant que l’analyse froide n’est pas faite.\n\nQuestions :\n1. La hausse est-elle déjà pricée ?\n2. Qui vend si tu entres maintenant ?\n3. Quelle source primaire confirme le signal ?\n4. Où est l’invalidation ?\n5. La perte maximale est-elle acceptée ?\n\nConclusion : une occasion ratée ne coûte rien. Une mauvaise position peut coûter très cher.`
  );
}

function addWatch() {
  const id = els.watchInput?.value.trim().toLowerCase();
  if (!id) return;
  if (!state.watchIds.includes(id)) state.watchIds.push(id);
  els.watchInput.value = "";
  renderWatchlist();
}

function seedWatch() {
  state.watchIds = ["bitcoin", "ethereum", "solana", "chainlink", "render-token", "near"];
  renderWatchlist();
}



els.btnSimBuy?.addEventListener("click", () => renderCommandOutput(simulateOrder("buy")));
els.btnSimSell?.addEventListener("click", () => renderCommandOutput(simulateOrder("sell")));
els.btnSimReset?.addEventListener("click", () => {
  resetSimulation();
  renderCommandOutput(commandOk("reset_sim", simulationPayload()));
});

els.btnRunCommand?.addEventListener("click", () => runCommandFromInput());
els.commandInput?.addEventListener("keydown", event => {
  if (event.key === "Enter") runCommandFromInput();
});
document.querySelectorAll(".cmd-preset[data-command]").forEach(btn => {
  btn.addEventListener("click", () => runCommandFromInput(btn.dataset.command));
});

window.AgentCryptoCommands = CryptoCommands;

$("btnLivecheck")?.addEventListener("click", runLivecheck);
$("btnRefresh")?.addEventListener("click", runLivecheck);
$("btnNoFomo")?.addEventListener("click", () => document.querySelector("#nofomo")?.scrollIntoView({ behavior: "smooth" }));
$("btnAddWatch")?.addEventListener("click", addWatch);

document.querySelectorAll(".period-btn[data-period]").forEach(btn => {
  btn.addEventListener("click", () => {
    state.chartPeriodDays = Number(btn.dataset.period) || 1;
    document.querySelectorAll(".period-btn[data-period]").forEach(b => b.classList.toggle("active", b === btn));
    requestAnimationFrame(() => renderAnalystPanel());
  });
});

window.addEventListener("resize", () => {
  if (state.liveOk && state.coins.length) {
    requestAnimationFrame(() => renderAnalystPanel());
  }
});

$("btnSeedWatch")?.addEventListener("click", seedWatch);
$("btnAnalyzeNews")?.addEventListener("click", analyzeNews);
$("btnAnalyzeFomo")?.addEventListener("click", analyzeFomo);

els.searchInput?.addEventListener("input", renderMarketTable);

document.querySelectorAll(".filter-btn[data-filter]").forEach(btn => {
  btn.addEventListener("click", () => {
    state.assetFilter = btn.dataset.filter || "all";
    document.querySelectorAll(".filter-btn[data-filter]").forEach(b => b.classList.toggle("active", b === btn));
    renderMarketTable();
  });
});

els.sortSelect?.addEventListener("change", () => {
  state.sortKey = els.sortSelect.value || "rank-asc";
  renderMarketTable();
});


const advancedButton = document.getElementById("btnToggleAdvanced");
const advancedPanel = document.getElementById("advancedPanel");
if (advancedButton && advancedPanel) {
  advancedButton.type = "button";
  advancedButton.addEventListener("click", () => {
    advancedPanel.classList.toggle("is-collapsed");
    const open = !advancedPanel.classList.contains("is-collapsed");
    advancedButton.textContent = open ? "Masquer avancé" : "Afficher avancé";
  });
}

renderSourceGrid();
renderSourceDiagnostic();
updateSourceMetric(0);
renderTicker();
renderEmptyMarket("Livecheck requis. Aucun prix inventé.");
renderScore(null);
renderWatchlist();
renderRiskGrid();
renderColdRead(false);

renderBeginnerSummary();
requestAnimationFrame(() => renderAnalystPanel());
