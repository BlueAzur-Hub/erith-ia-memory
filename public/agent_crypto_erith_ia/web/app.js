const state = {
  liveOk: false,
  mainSource: null,
  timestamp: null,
  coins: [],
  global: null,
  watchIds: ["bitcoin", "ethereum", "solana"],
  sourceStatus: []
};

const $ = (id) => document.getElementById(id);
const els = {
  liveStatus: $("liveStatus"), sourceName: $("sourceName"), sourceTime: $("sourceTime"), offlineNotice: $("offlineNotice"),
  tickerTrack: $("tickerTrack"), marketRows: $("marketRows"), tableNote: $("tableNote"), searchInput: $("searchInput"),
  metricMarketCap: $("metricMarketCap"), metricMarketCapHint: $("metricMarketCapHint"), metricVolume: $("metricVolume"), metricVolumeHint: $("metricVolumeHint"),
  metricBtcDom: $("metricBtcDom"), metricBtcDomHint: $("metricBtcDomHint"), metricSources: $("metricSources"), metricSourcesHint: $("metricSourcesHint"),
  sourceGrid: $("sourceGrid"), sourceDecision: $("sourceDecision"), scoreRing: $("scoreRing"), scoreValue: $("scoreValue"), scoreLabel: $("scoreLabel"), scoreBreakdown: $("scoreBreakdown"),
  watchInput: $("watchInput"), watchCards: $("watchCards"), riskGrid: $("riskGrid"), newsInput: $("newsInput"), newsOutput: $("newsOutput"), fomoInput: $("fomoInput"), fomoOutput: $("fomoOutput")
};

const fmtEUR = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
const fmtCompact = new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 2 });
const fmtPct = (n) => typeof n === "number" ? `${n >= 0 ? "+" : ""}${n.toFixed(2)} %` : "Donnée manquante";
const clsPct = (n) => typeof n !== "number" ? "neutral" : n > 0 ? "pos" : n < 0 ? "neg" : "neutral";
const clamp = (min, max, value) => Math.max(min, Math.min(max, value));

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
  els.liveStatus.className = `pill ${mode}`;
  els.liveStatus.textContent = text;
}

async function runLivecheck() {
  setLiveStatus("warn", "Livecheck en cours");
  els.sourceDecision.textContent = "Tests sources en cours";
  state.sourceStatus = [];
  state.coins = [];
  state.global = null;
  renderSourceGrid();

  for (const src of liveSources) {
    const started = performance.now();
    try {
      const result = await src.fn();
      const ms = Math.round(performance.now() - started);
      state.sourceStatus.push({ ...src, status: "OK", ms, detail: detailFromResult(result) });
      if (src.key === "coingecko") {
        state.coins = result.markets;
        state.global = result.global;
        state.mainSource = "CoinGecko";
        state.timestamp = new Date().toISOString();
      }
    } catch (error) {
      state.sourceStatus.push({ ...src, status: "ÉCHEC", ms: null, detail: cleanError(error) });
    }
    renderSourceGrid();
  }

  const okCount = state.sourceStatus.filter(s => s.status === "OK").length;
  state.liveOk = state.coins.length > 0;

  if (state.liveOk) {
    setLiveStatus("ok", "Livecheck OK");
    els.offlineNotice.style.display = "none";
    els.sourceName.textContent = state.mainSource;
    els.sourceTime.textContent = new Date(state.timestamp).toLocaleString("fr-FR");
    els.sourceDecision.textContent = "Tableau autorisé : source marché réelle";
    renderAll();
  } else {
    setLiveStatus("fail", "Livecheck échec");
    els.offlineNotice.style.display = "block";
    els.offlineNotice.innerHTML = `<strong>ACCÈS LIVE INDISPONIBLE</strong><p>Aucune source marché exploitable n’a répondu. Aucun prix ne sera affiché. Aucun tableau chiffré ne sera produit.</p>`;
    els.sourceName.textContent = "Aucune source marché exploitable";
    els.sourceTime.textContent = "—";
    els.sourceDecision.textContent = "Tableau refusé : pas de source live";
    renderEmptyMarket("RECHERCHE LIVE ÉCHOUÉE — pas de tableau fictif.");
  }
  els.metricSources.textContent = `${okCount}/${liveSources.length}`;
  els.metricSourcesHint.textContent = state.liveOk ? "Source marché active" : "Pas de source marché exploitable";
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
function cleanError(error) {
  return String(error?.message || error || "Erreur inconnue").replace(/AbortError/i, "Timeout").slice(0, 72);
}

function renderAll() {
  renderMetrics();
  renderTicker();
  renderMarketTable();
  renderWatchlist();
  renderScore(state.coins[0]);
  renderRiskGrid();
}

function renderMetrics() {
  const g = state.global;
  if (!g) return;
  els.metricMarketCap.textContent = fmtEUR.format(g.total_market_cap?.eur || 0);
  els.metricMarketCapHint.textContent = "CoinGecko global";
  els.metricVolume.textContent = fmtEUR.format(g.total_volume?.eur || 0);
  els.metricVolumeHint.textContent = "Volume global 24h";
  const btc = g.market_cap_percentage?.btc;
  els.metricBtcDom.textContent = typeof btc === "number" ? `${btc.toFixed(2)} %` : "Donnée manquante";
  els.metricBtcDomHint.textContent = "Dominance BTC";
}

function renderTicker() {
  const items = state.coins.slice(0, 12).map(c => `${c.symbol} ${fmtEUR.format(c.price)} ${fmtPct(c.change24h)}`).join(" · ");
  els.tickerTrack.innerHTML = `<span>${items} · Source : ${state.mainSource} · </span><span>${items} · Source : ${state.mainSource} · </span>`;
}

function scoreCoin(c) {
  if (!c) return { score: null, label: "En attente", parts: {} };
  let parts = {
    information: 12,
    market: c.marketCap ? 14 : 6,
    liquidity: c.volume24h && c.marketCap ? clamp(3, 15, (c.volume24h / c.marketCap) * 350) : 4,
    momentum: typeof c.change24h === "number" ? clamp(1, 10, 8 - Math.abs(c.change24h) / 7) : 4,
    regime: 7,
    security: 8,
    social: 3,
    onchain: 4,
    asymmetry: 5,
    invalidation: 3
  };
  let positive = Object.values(parts).reduce((a,b)=>a+b,0) / 110 * 100;
  let penalty = 0;
  if (typeof c.change24h === "number" && Math.abs(c.change24h) > 18) penalty += 12;
  if (c.volume24h && c.marketCap && c.volume24h / c.marketCap < 0.01) penalty += 10;
  penalty += 16; // sécurité/social/on-chain non vérifiés dans le prototype public
  const score = Math.round(clamp(0, 100, positive - penalty));
  let label = score <= 40 ? "Veille fragile" : score <= 55 ? "Veille" : score <= 65 ? "Signal faible" : score <= 75 ? "Analyse approfondie" : "Signal fort mais risqué";
  return { score, label, parts };
}
function decisionFromScore(s) {
  if (s === null) return "Livecheck requis";
  if (s <= 40) return "Veille fragile";
  if (s <= 55) return "Veille";
  if (s <= 65) return "Signal faible";
  if (s <= 75) return "Analyse approfondie";
  return "Signal fort mais risqué";
}

function renderMarketTable() {
  const q = (els.searchInput.value || "").toLowerCase().trim();
  const rows = state.coins.filter(c => !q || c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)).slice(0, 30);
  if (!state.liveOk) return renderEmptyMarket("Livecheck requis. Aucun prix inventé.");
  if (!rows.length) return renderEmptyMarket("Aucun actif ne correspond au filtre.");
  els.marketRows.innerHTML = rows.map(c => {
    const s = scoreCoin(c);
    return `<tr data-id="${escapeHtml(c.id)}">
      <td>${c.rank ?? "—"}</td>
      <td><div class="coin-cell">${c.image ? `<img src="${c.image}" alt="" loading="lazy">` : ""}<div><strong>${escapeHtml(c.name)}</strong><br><small>${escapeHtml(c.symbol)}</small></div></div></td>
      <td>${num(c.price, fmtEUR)}</td>
      <td class="${clsPct(c.change24h)}">${fmtPct(c.change24h)}</td>
      <td class="${clsPct(c.change7d)}">${fmtPct(c.change7d)}</td>
      <td>${num(c.marketCap, v => fmtEUR.format(v))}</td>
      <td>${num(c.volume24h, v => fmtEUR.format(v))}</td>
      <td>${s.score}</td>
      <td>${decisionFromScore(s.score)}</td>
    </tr>`;
  }).join("");
  els.tableNote.textContent = `Données récupérées depuis ${state.mainSource}. Heure : ${new Date(state.timestamp).toLocaleString("fr-FR")}. Sécurité contrat non validée par cette table.`;
  [...els.marketRows.querySelectorAll("tr[data-id]")].forEach(row => row.addEventListener("click", () => {
    const coin = state.coins.find(c => c.id === row.dataset.id);
    renderScore(coin);
  }));
}
function renderEmptyMarket(message) {
  els.marketRows.innerHTML = `<tr><td colspan="9" class="empty">${escapeHtml(message)}</td></tr>`;
  els.tableNote.textContent = "Pas de source live, pas de prix.";
}
function renderScore(coin) {
  const s = scoreCoin(coin);
  if (s.score === null) {
    els.scoreRing.style.setProperty("--score", 0); els.scoreValue.textContent = "—"; els.scoreLabel.textContent = "En attente"; return;
  }
  els.scoreRing.style.setProperty("--score", s.score);
  els.scoreValue.textContent = s.score;
  els.scoreLabel.textContent = s.label;
  els.scoreBreakdown.innerHTML = `
    <div><span>Information</span><b>${Math.round(s.parts.information)}/15</b></div>
    <div><span>Marché</span><b>${Math.round(s.parts.market)}/15</b></div>
    <div><span>Liquidité</span><b>${Math.round(s.parts.liquidity)}/15</b></div>
    <div><span>Momentum</span><b>${Math.round(s.parts.momentum)}/10</b></div>
    <div><span>Pénalité sécurité</span><b>active</b></div>`;
}
function renderWatchlist() {
  if (!state.liveOk) { els.watchCards.innerHTML = `<div class="mini-card muted">Livecheck requis. Aucune donnée watchlist inventée.</div>`; return; }
  const cards = state.watchIds.map(id => state.coins.find(c => c.id === id)).filter(Boolean).map(c => {
    const s = scoreCoin(c);
    return `<div class="mini-card"><strong>${escapeHtml(c.name)} · ${escapeHtml(c.symbol)}</strong><div class="meta">${fmtEUR.format(c.price)} · 24h <span class="${clsPct(c.change24h)}">${fmtPct(c.change24h)}</span></div><div class="meta">Score ${s.score} · ${decisionFromScore(s.score)}</div></div>`;
  });
  els.watchCards.innerHTML = cards.length ? cards.join("") : `<div class="mini-card muted">Aucun actif de watchlist trouvé dans le top chargé.</div>`;
}
function renderRiskGrid() {
  els.riskGrid.innerHTML = `
    <div class="risk ok"><span>Marché</span><b>${state.liveOk ? "Validé source live" : "Non récupéré"}</b></div>
    <div class="risk warn"><span>Sécurité</span><b>Non vérifiée par V0.2</b></div>
    <div class="risk warn"><span>Social</span><b>Non vérifié</b></div>
    <div class="risk warn"><span>On-chain</span><b>Non vérifié</b></div>`;
}
function renderSourceGrid() {
  if (!state.sourceStatus.length) {
    els.sourceGrid.innerHTML = liveSources.map(s => `<div class="source-item"><strong>${s.name}</strong><span>${s.kind}</span><span>En attente</span></div>`).join("");
    return;
  }
  els.sourceGrid.innerHTML = state.sourceStatus.map(s => `<div class="source-item ${s.status === "OK" ? "ok" : "fail"}"><strong>${s.name}</strong><span>${s.kind}</span><span>${s.status}${s.ms ? ` · ${s.ms} ms` : ""}</span><span>${escapeHtml(s.detail || "")}</span></div>`).join("");
}
function analyzeNews() {
  const text = els.newsInput.value.trim();
  if (!text) { els.newsOutput.textContent = "Colle une actualité à classifier."; return; }
  const lower = text.toLowerCase();
  const isRumor = /rumeur|serait|peut-être|insider|leak|telegram|x\.com|twitter/.test(lower);
  const isCritical = /hack|exploit|bridge|faillite|sec|amf|delisting|suspension|procès|attaque/.test(lower);
  const isListing = /listing|listé|binance|coinbase|kraken/.test(lower);
  const type = isRumor ? "rumeur / non confirmé" : isCritical ? "information critique potentielle" : isListing ? "catalyseur listing potentiel" : "information à qualifier";
  const score = isCritical ? 78 : isListing ? 64 : isRumor ? 36 : 48;
  els.newsOutput.textContent = `NEWS SENTINEL\n\nType : ${type}\nScore News Impact : ${score}/100\nDécision : ${score >= 60 ? "analyse approfondie" : "veille"}\n\nRègle : ce score déclenche une vérification, pas une position.\nSources à vérifier : source primaire, communiqué officiel, source secondaire fiable, réaction marché, risque de manipulation.`;
}
function analyzeFomo() {
  const text = els.fomoInput.value.trim();
  if (!text) { els.fomoOutput.textContent = "Écris ce qui déclenche la FOMO."; return; }
  const hasBigMove = /\+\s?\d{2,}|explos|pump|rate|raté|peur|vite|maintenant/i.test(text);
  els.fomoOutput.textContent = `MODE NO-FOMO\n\nSignal émotionnel : ${hasBigMove ? "élevé" : "à vérifier"}\nDécision : position théorique interdite tant que l’analyse froide n’est pas faite.\n\nQuestions :\n1. La hausse est-elle déjà pricée ?\n2. Qui vend si tu entres maintenant ?\n3. Quelle source primaire confirme le signal ?\n4. Où est l’invalidation ?\n5. La perte maximale est-elle acceptée ?\n\nConclusion : une occasion ratée ne coûte rien. Une mauvaise position peut coûter très cher.`;
}
function addWatch() {
  const id = els.watchInput.value.trim().toLowerCase();
  if (!id) return;
  if (!state.watchIds.includes(id)) state.watchIds.push(id);
  els.watchInput.value = "";
  renderWatchlist();
}
function seedWatch() { state.watchIds = ["bitcoin", "ethereum", "solana", "chainlink", "render-token", "near"]; renderWatchlist(); }
function num(value, formatter) { return typeof value === "number" ? formatter(value) : "Donnée manquante"; }
function escapeHtml(str) { return String(str).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c])); }

$("btnLivecheck").addEventListener("click", runLivecheck);
$("btnRefresh").addEventListener("click", runLivecheck);
$("btnNoFomo").addEventListener("click", () => document.querySelector("#nofomo").scrollIntoView({ behavior: "smooth" }));
els.searchInput.addEventListener("input", renderMarketTable);
$("btnAddWatch").addEventListener("click", addWatch);
$("btnSeedWatch").addEventListener("click", seedWatch);
$("btnAnalyzeNews").addEventListener("click", analyzeNews);
$("btnAnalyzeFomo").addEventListener("click", analyzeFomo);

renderSourceGrid();
