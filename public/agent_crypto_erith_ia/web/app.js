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
  chartCache: {}
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
  trustLockText: $("trustLockText")
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

function renderAll() {
  renderMetrics();
  renderTicker();
  renderMarketTable();
  renderWatchlist();
  renderScore(getSelectedCoin() || state.coins[0] || null);
  renderRiskGrid();
  renderColdRead(true);
  renderBeginnerSummary();

  requestAnimationFrame(() => {
    renderAnalystPanel();
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
  const rows = state.coins
    .filter(c => !q || c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q))
    .slice(0, 30);

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
    `Données récupérées depuis ${state.mainSource}. Heure : ${new Date(state.timestamp).toLocaleString("fr-FR")}. Sécurité contrat non validée par cette table.`
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
    <div class="risk warn"><span>Sécurité</span><b>Non vérifiée V0.8</b></div>
    <div class="risk warn"><span>Social</span><b>Non vérifié</b></div>
    <div class="risk warn"><span>On-chain</span><b>Non vérifié</b></div>`;
}

function renderSourceGrid() {
  if (!els.sourceGrid) return;

  if (!state.sourceStatus.length) {
    els.sourceGrid.innerHTML = liveSources.map(s =>
      `<div class="source-item"><strong>${s.name}</strong><span>${s.kind}</span><span>En attente</span></div>`
    ).join("");
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
      `Lecture froide : prix, volumes et market cap sont disponibles, mais sécurité contrat, social et on-chain restent non validés par cette interface RC8.`;
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
updateSourceMetric(0);
renderTicker();
renderEmptyMarket("Livecheck requis. Aucun prix inventé.");
renderScore(null);
renderWatchlist();
renderRiskGrid();
renderColdRead(false);

renderBeginnerSummary();
requestAnimationFrame(() => renderAnalystPanel());
