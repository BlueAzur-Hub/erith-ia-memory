from pathlib import Path
import json

ROOT = Path('public/agent_crypto_erith_ia')
ADMIN = ROOT / 'administrator'
INDEX = ADMIN / 'index.html'
PARALLEL = ADMIN / 'js/parallel-markets.js'
STACK = ADMIN / 'js/market-stack.js'
APP = ADMIN / 'app.js'
BUILD = '40.4.198'
ENGINE = '38.15.11'


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected exactly 1 occurrence, got {count}')
    return text.replace(old, new, 1)


def replace_all_checked(text, old, new, minimum, label):
    count = text.count(old)
    if count < minimum:
        raise RuntimeError(f'{label}: expected at least {minimum} occurrence(s), got {count}')
    return text.replace(old, new)

# ---------------- Parallel runtime: Energy lazy long history ----------------
p = PARALLEL.read_text(encoding='utf-8')
p = replace_once(p, 'const BUILD = "40.4.197";', 'const BUILD = "40.4.198";', 'parallel build')
p = replace_once(p, 'const DEPTH_LEVEL = 197;', 'const DEPTH_LEVEL = 198;', 'parallel depth')
p = replace_once(
    p,
    'energy: Object.freeze({ label: "ÉNERGIE", title: "Énergie & matières premières", path: "../data/energy/market.json", expected: 3, accent: "#e79b57", source: "Yahoo Finance", defaultPeriod: "1a", depthAt: 191 }),',
    'energy: Object.freeze({ label: "ÉNERGIE", title: "Énergie & matières premières", path: "../data/energy/market.json", historyBase: "../data/energy/history", expected: 3, accent: "#e79b57", source: "Yahoo Finance", defaultPeriod: "1a", depthAt: 191 }),',
    'energy history base'
)
p = replace_once(
    p,
    'if (!LONG_PERIODS.includes(period) || domain !== "indices") return;',
    'if (!LONG_PERIODS.includes(period) || !["indices", "energy"].includes(domain)) return;',
    'parallel long click domains'
)
old_loader = '''  function loadHistorical(domain, period) {
    const cfg = CONFIG[domain];
    if (!cfg?.historyBase || domain !== "indices" || !isLongPeriod(period)) return Promise.reject(new Error("historique long non activé pour ce domaine"));
    const key = historyKey(domain, period);
    if (state.history.has(key)) return Promise.resolve(state.history.get(key));
    if (state.historyLoad.has(key)) return state.historyLoad.get(key);
    const promise = fetch(`${cfg.historyBase}/${period}.json?v=${encodeURIComponent(BUILD)}`, { cache:"no-store", credentials:"same-origin" })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(payload => {
        if (!payload || payload.status !== "ready" || payload.schema !== "agent_crypto_historical_depth_v1" || !Array.isArray(payload.assets)) throw new Error("archive historique non READY");
        if (payload.domain !== domain || payload.horizon !== period || payload.integrity?.lazy_browser_load_required !== true || payload.integrity?.boot_payload_forbidden !== true) throw new Error("contrat lazy historique invalide");
        state.history.set(key, payload);
        return payload;
      })
      .finally(() => state.historyLoad.delete(key));
    state.historyLoad.set(key, promise);
    return promise;
  }'''
new_loader = '''  function loadHistorical(domain, period) {
    const cfg = CONFIG[domain];
    if (!cfg?.historyBase || !["indices", "energy"].includes(domain) || !isLongPeriod(period)) return Promise.reject(new Error("historique long non activé pour ce domaine"));
    const key = historyKey(domain, period);
    if (state.history.has(key)) return Promise.resolve(state.history.get(key));
    if (state.historyLoad.has(key)) return state.historyLoad.get(key);
    const expectedSchema = domain === "energy"
      ? "agent_crypto_commodity_historical_depth_v1"
      : "agent_crypto_historical_depth_v1";
    const promise = fetch(`${cfg.historyBase}/${period}.json?v=${encodeURIComponent(BUILD)}`, { cache:"no-store", credentials:"same-origin" })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(payload => {
        if (!payload || payload.status !== "ready" || payload.schema !== expectedSchema || !Array.isArray(payload.assets)) throw new Error("archive historique non READY");
        if (payload.domain !== domain || payload.horizon !== period || payload.integrity?.lazy_browser_load_required !== true || payload.integrity?.boot_payload_forbidden !== true) throw new Error("contrat lazy historique invalide");
        if (domain === "energy" && (payload.integrity?.future_continuous_only !== true || payload.integrity?.spot_semantics_forbidden !== true)) throw new Error("contrat Futures historique invalide");
        state.history.set(key, payload);
        return payload;
      })
      .finally(() => state.historyLoad.delete(key));
    state.historyLoad.set(key, promise);
    return promise;
  }'''
p = replace_once(p, old_loader, new_loader, 'parallel historical loader')
old_energy = '''  function energyDepth(payload, rowsByAsset, metricByAsset) {
    const selected = selectedAsset("energy", rowsByAsset);'''
new_energy = '''  function energyDepth(payload, rowsByAsset, metricByAsset) {
    const activePeriod = state.period.get("energy") || "1a";
    if (isLongPeriod(activePeriod) && payload?.schema === "agent_crypto_commodity_historical_depth_v1") {
      const selected = selectedAsset("energy", rowsByAsset);
      const counts = rowsByAsset.map(x => x.rows.length).filter(Number.isFinite);
      const starts = rowsByAsset.map(x => x.rows[0]?.time).filter(Boolean).sort();
      const ends = rowsByAsset.map(x => x.rows[x.rows.length-1]?.time).filter(Boolean).sort();
      return `${selectedSheet("energy", selected, metricByAsset)}
        <section class="parallel-depth-section"><b>Historical Depth · ${esc(activePeriod.toUpperCase())}</b><div class="parallel-depth-grid">
          <span><small>Instrument</small><strong>FUTURE CONTINU</strong></span>
          <span><small>Résolution</small><strong>${esc(payload.resolution || "historique")}</strong></span>
          <span><small>Points / actif</small><strong>${counts.length ? `${Math.min(...counts)}–${Math.max(...counts)}` : "—"}</strong></span>
          <span><small>Début commun approx.</small><strong>${esc(starts[starts.length-1] ? dateText(starts[starts.length-1]) : "—")}</strong></span>
          <span><small>Dernier point</small><strong>${esc(ends[0] ? dateText(ends[0]) : "—")}</strong></span>
        </div><p class="parallel-depth-note"><b>FUTURE CONTINU · HISTORIQUE FOURNISSEUR.</b> Archive Yahoo Finance chargée uniquement après appel opérateur. Ce n’est pas une série spot homogène ; aucune interpolation et aucune valeur inventée.</p></section>
        <section class="parallel-depth-section"><b>Risque historique long</b><p>Volatilité maximale observée ${pct(Math.max(...metricByAsset.map(x=>x.metric.volatility||0)))} · drawdown le plus profond ${pct(Math.min(...metricByAsset.map(x=>x.metric.drawdown||0)))}. Lecture historique uniquement, aucune prévision.</p></section>
        <section class="parallel-depth-section"><b>Provenance & lazy contract</b><p>${esc(payload.source || "Yahoo Finance chart endpoint")} · snapshot ${esc(dateText(payload.generated_at))} · ${payload.assets_count}/${payload.assets_expected || payload.assets_count}. Le fichier long reste absent de la mémoire navigateur tant que 5a / 10a / MAX n’est pas demandé.</p></section>`;
    }
    const selected = selectedAsset("energy", rowsByAsset);'''
p = replace_once(p, old_energy, new_energy, 'energy long depth')
p = replace_once(
    p,
    'const available = domain === "indices";',
    'const available = domain === "indices" || domain === "energy";',
    'long toolbar availability'
)
p = replace_once(
    p,
    'historical_domains:Object.freeze({indices:true,energy:false,"cross-market":false}),',
    'historical_domains:Object.freeze({indices:true,energy:true,"cross-market":false}),',
    'historical runtime domains'
)
PARALLEL.write_text(p, encoding='utf-8')

# ---------------- Market stack build truth only; geometry contract untouched ----------------
s = STACK.read_text(encoding='utf-8')
s = replace_once(s, 'const BUILD = "40.4.197";', 'const BUILD = "40.4.198";', 'market stack build')
if 'ALL_MARKETS_STATIC_CRYPTO_SLOT_PARITY_DOMAIN_CONTENT_404189' not in s:
    raise RuntimeError('40.4.189 geometry contract missing')
STACK.write_text(s, encoding='utf-8')

# ---------------- Native Metals lazy long history ----------------
a = APP.read_text(encoding='utf-8')
anchor = 'const atlasMarketRegistryState = {'
if anchor not in a:
    raise RuntimeError('Metals state insertion anchor missing')
helper = r'''
// 40.4.198 — METALS HISTORICAL DEPTH · LAZY CONTINUOUS FUTURES
// Long archives are absent from boot. They are fetched only after an operator
// clicks 5a / 10a / MAX, cached in memory for this page session, and never
// persisted as the native Metals period.
const ATLAS_METALS_LONG_HISTORY_404198 = Object.freeze({
  build: "40.4.198",
  schema: "agent_crypto_commodity_historical_depth_v1",
  base: "../data/metals/history_long",
  days: Object.freeze({ "5a": 1825, "10a": 3650, "max": 99999 })
});
const atlasMetalsLongHistoryState404198 = {
  active: null,
  cache: new Map(),
  load: new Map()
};

function atlasMetalsLongHistoryKeyFromDays404198(days) {
  const value = Number(days);
  return Object.entries(ATLAS_METALS_LONG_HISTORY_404198.days)
    .find(([, count]) => count === value)?.[0] || null;
}

function atlasMetalsLongHistoryEffectiveDays404198(fallback) {
  const key = atlasMetalsLongHistoryState404198.active;
  return key ? ATLAS_METALS_LONG_HISTORY_404198.days[key] : Number(fallback || 365);
}

function atlasMetalsLongHistoryPeriodLabel404198(fallback) {
  const key = atlasMetalsLongHistoryState404198.active;
  if (key === "5a") return "5 ans";
  if (key === "10a") return "10 ans";
  if (key === "max") return "MAX";
  return atlasChartPeriodLabel(Number(fallback || 365));
}

function atlasMetalsLongHistoryRows404198(key) {
  const payload = atlasMetalsLongHistoryState404198.cache.get(key);
  if (!payload?.assets?.length) return [];
  const unique = new Map();
  payload.assets.forEach(asset => {
    (Array.isArray(asset?.history_points) ? asset.history_points : []).forEach(point => {
      const time = Date.parse(String(point?.time || point?.date || ""));
      if (Number.isFinite(time)) unique.set(String(time), { time });
    });
  });
  return [...unique.values()].sort((left, right) => left.time - right.time);
}

function atlasMetalsLongHistoryAssetPoints404198(assetId, key) {
  const payload = atlasMetalsLongHistoryState404198.cache.get(key);
  const asset = (Array.isArray(payload?.assets) ? payload.assets : [])
    .find(item => String(item?.asset_id || "") === String(assetId || "")
      && String(item?.instrument_type || "") === "future_continuous");
  if (!asset) return [];
  return (Array.isArray(asset.history_points) ? asset.history_points : [])
    .map(point => ({
      x: Date.parse(String(point?.time || point?.date || "")),
      y: Number(point?.close),
      currency: String(asset?.currency || "USD").toUpperCase(),
      unit: String(asset?.unit || ""),
      source: "yahoo_finance_future_continuous_long"
    }))
    .filter(point => Number.isFinite(point.x) && Number.isFinite(point.y) && point.y > 0)
    .sort((left, right) => left.x - right.x);
}

function atlasMetalsLongHistoryLoad404198(key) {
  if (!Object.hasOwn(ATLAS_METALS_LONG_HISTORY_404198.days, key)) return Promise.reject(new Error("horizon long inconnu"));
  if (atlasMetalsLongHistoryState404198.cache.has(key)) return Promise.resolve(atlasMetalsLongHistoryState404198.cache.get(key));
  if (atlasMetalsLongHistoryState404198.load.has(key)) return atlasMetalsLongHistoryState404198.load.get(key);
  const promise = fetch(`${ATLAS_METALS_LONG_HISTORY_404198.base}/${key}.json?v=${ATLAS_METALS_LONG_HISTORY_404198.build}`, {
    cache: "no-store",
    credentials: "same-origin"
  }).then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }).then(payload => {
    if (!payload || payload.status !== "ready" || payload.schema !== ATLAS_METALS_LONG_HISTORY_404198.schema || payload.domain !== "metals" || payload.horizon !== key || !Array.isArray(payload.assets)) throw new Error("archive Métaux longue non READY");
    if (payload.integrity?.lazy_browser_load_required !== true || payload.integrity?.boot_payload_forbidden !== true || payload.integrity?.future_continuous_only !== true || payload.integrity?.spot_semantics_forbidden !== true) throw new Error("contrat Source Truth Métaux long invalide");
    atlasMetalsLongHistoryState404198.cache.set(key, payload);
    return payload;
  }).finally(() => atlasMetalsLongHistoryState404198.load.delete(key));
  atlasMetalsLongHistoryState404198.load.set(key, promise);
  return promise;
}

async function atlasMetalsLongHistoryActivate404198(key) {
  await atlasMetalsLongHistoryLoad404198(key);
  atlasMetalsLongHistoryState404198.active = key;
  atlasParallelMarketRenderMetals();
  atlasWorkspaceRenderStrip?.();
  return true;
}

function atlasMetalsLongHistoryClear404198() {
  atlasMetalsLongHistoryState404198.active = null;
}

'''
a = replace_once(a, anchor, helper + anchor, 'Metals lazy helper insertion')

old_set = '''function atlasParallelMarketSetMetalsPeriod(period) {
  const value = Number(period);
  if (![1, 7, 30, 90, 365].includes(value)) return false;
  atlasParallelMarketMetalsState().period = value;
  atlasParallelMarketMetalsWrite();
  atlasParallelMarketRenderMetals();
  atlasWorkspaceRenderStrip?.();
  atlasWorkspaceScheduleSave?.(120);
  void atlasMetalsQuoteFoundationReloadHistory();
  return true;
}'''
new_set = '''function atlasParallelMarketSetMetalsPeriod(period) {
  const value = Number(period);
  if (![1, 7, 30, 90, 365].includes(value)) return false;
  atlasMetalsLongHistoryClear404198();
  atlasParallelMarketMetalsState().period = value;
  atlasParallelMarketMetalsWrite();
  atlasParallelMarketRenderMetals();
  atlasWorkspaceRenderStrip?.();
  atlasWorkspaceScheduleSave?.(120);
  void atlasMetalsQuoteFoundationReloadHistory();
  return true;
}'''
a = replace_once(a, old_set, new_set, 'Metals native period setter')

old_rows = '''function atlasMetalsQuoteFoundationPeriodRows(periodDays) {
  const days = Number(periodDays || 365);
  if (days === 1) {
    return atlasMetalsQuoteFoundationIntradayPoints(atlasParallelMarketActiveMetal().id)
      .map(point => ({ time: point.x, point }));
  }
  const rows = atlasMetalsQuoteFoundationHistoryRows();'''
new_rows = '''function atlasMetalsQuoteFoundationPeriodRows(periodDays) {
  const days = Number(periodDays || 365);
  const longKey = atlasMetalsLongHistoryKeyFromDays404198(days);
  if (longKey) return atlasMetalsLongHistoryRows404198(longKey);
  if (days === 1) {
    return atlasMetalsQuoteFoundationIntradayPoints(atlasParallelMarketActiveMetal().id)
      .map(point => ({ time: point.x, point }));
  }
  const rows = atlasMetalsQuoteFoundationHistoryRows();'''
a = replace_once(a, old_rows, new_rows, 'Metals period rows long hook')

old_points = '''function atlasMetalsQuoteFoundationAssetPoints(assetId, periodDays = null) {
  if (Number(periodDays) === 1) {
    return atlasMetalsQuoteFoundationIntradayPoints(assetId);
  }
  const rows = periodDays === null'''
new_points = '''function atlasMetalsQuoteFoundationAssetPoints(assetId, periodDays = null) {
  const longKey = atlasMetalsLongHistoryKeyFromDays404198(periodDays);
  if (longKey) return atlasMetalsLongHistoryAssetPoints404198(assetId, longKey);
  if (Number(periodDays) === 1) {
    return atlasMetalsQuoteFoundationIntradayPoints(assetId);
  }
  const rows = periodDays === null'''
a = replace_once(a, old_points, new_points, 'Metals asset points long hook')

a = replace_once(a, 'const periodDays = Number(metals.period || 365);', 'const periodDays = atlasMetalsLongHistoryEffectiveDays404198(metals.period);', 'Metals chart effective period')
a = replace_once(a, 'const periodDays = Number(metals.period || 7);', 'const periodDays = atlasMetalsLongHistoryEffectiveDays404198(metals.period);', 'Metals Math Core effective period')
a = replace_once(
    a,
    '  const intraday = days === 1;\n  const points = atlasMetalsQuoteFoundationAssetPoints(assetId, days);\n  const unitLabel = intraday ? "points Futures intraday" : "séances Futures";',
    '  const intraday = days === 1;\n  const longKey = atlasMetalsLongHistoryKeyFromDays404198(days);\n  const points = atlasMetalsQuoteFoundationAssetPoints(assetId, days);\n  const unitLabel = longKey ? "points Futures historiques" : intraday ? "points Futures intraday" : "séances Futures";',
    'Metals horizon long unit label'
)
a = replace_once(
    a,
    '    source: intraday ? "yahoo_finance_futures_intraday" : "yahoo_finance_futures_daily"',
    '    source: longKey ? "yahoo_finance_future_continuous_long" : intraday ? "yahoo_finance_futures_intraday" : "yahoo_finance_futures_daily"',
    'Metals horizon long source'
)
old_period_label = '''function atlasMetalsHumanReadingPeriodLabel(periodDays) {
  const days = Number(periodDays || 7);
  if (days === 1) return "24 heures";
  if (days === 365) return "1 an";
  return `${days} jours`;
}'''
new_period_label = '''function atlasMetalsHumanReadingPeriodLabel(periodDays) {
  const days = Number(periodDays || 7);
  if (days === 1) return "24 heures";
  if (days === 365) return "1 an";
  if (days === 1825) return "5 ans";
  if (days === 3650) return "10 ans";
  if (days === 99999) return "MAX";
  return `${days} jours`;
}'''
a = replace_once(a, old_period_label, new_period_label, 'Metals human long labels')
a = replace_once(
    a,
    'const days = Number(periodDays ?? atlasParallelMarketMetalsState().period ?? 7);',
    'const days = Number(periodDays ?? atlasMetalsLongHistoryEffectiveDays404198(atlasParallelMarketMetalsState().period));',
    'Metals human effective period'
)
old_source = '''  source.textContent = spot
    ? "Historique Yahoo Finance Futures intraday · cotation Gold API distincte · observation uniquement, aucune prévision."
    : "Historique Yahoo Finance Futures · cotation Gold API distincte · observation uniquement, aucune prévision.";'''
new_source = '''  const longKey = atlasMetalsLongHistoryKeyFromDays404198(days);
  source.textContent = longKey
    ? "FUTURE CONTINU · HISTORIQUE FOURNISSEUR · Yahoo Finance · cotation Gold API spot distincte · observation uniquement."
    : spot
      ? "Historique Yahoo Finance Futures intraday · cotation Gold API distincte · observation uniquement, aucune prévision."
      : "Historique Yahoo Finance Futures · cotation Gold API distincte · observation uniquement, aucune prévision.";'''
a = replace_once(a, old_source, new_source, 'Metals human Source Truth')

a = replace_once(
    a,
    'const active = value === Number(metals.period);',
    'const active = atlasMetalsLongHistoryState404198.active === null && value === Number(metals.period);',
    'Metals regular button active state'
)
old_loop_end = '''    }
  });

  const section = metals.section;'''
new_loop_end = '''    }
  });

  document.querySelectorAll("[data-metals-long-period]").forEach(button => {
    const key = String(button.dataset.metalsLongPeriod || "");
    const active = key === atlasMetalsLongHistoryState404198.active;
    button.classList.toggle("is-active", active);
    button.classList.toggle("is-building", button.getAttribute("aria-busy") === "true");
    button.setAttribute("aria-pressed", active ? "true" : "false");
    button.title = active
      ? "FUTURE CONTINU · HISTORIQUE FOURNISSEUR · chargé à la demande"
      : "Historique long Yahoo Finance Futures chargé uniquement à l’appel";
  });

  const section = metals.section;'''
a = replace_once(a, old_loop_end, new_loop_end, 'Metals long button render state')

a = replace_once(
    a,
    '+ `${atlasChartPeriodLabel(metals.period)} · `',
    '+ `${atlasMetalsLongHistoryPeriodLabel404198(metals.period)} · `',
    'Metals truth long period label'
)

old_event = '''  metalsToolbar?.addEventListener("click", event => {
    const period = event.target.closest("[data-metals-period]");'''
new_event = '''  metalsToolbar?.addEventListener("click", event => {
    const longPeriod = event.target.closest("[data-metals-long-period]");
    if (longPeriod) {
      event.preventDefault();
      const key = String(longPeriod.dataset.metalsLongPeriod || "");
      longPeriod.setAttribute("aria-busy", "true");
      void atlasMetalsLongHistoryActivate404198(key)
        .catch(error => {
          longPeriod.title = `Historique long indisponible · ${String(error?.message || error)}`;
        })
        .finally(() => longPeriod.removeAttribute("aria-busy"));
      return;
    }
    const period = event.target.closest("[data-metals-period]");'''
a = replace_once(a, old_event, new_event, 'Metals lazy click owner')
APP.write_text(a, encoding='utf-8')

# ---------------- HTML build truth, controls and last-loaded truth reader ----------------
i = INDEX.read_text(encoding='utf-8')
for old, new, label in [
    ('<meta name="atlas-build" content="40.4.197" />', '<meta name="atlas-build" content="40.4.198" />', 'index atlas build'),
    ('<meta name="administrator-build" content="40.4.197" />', '<meta name="administrator-build" content="40.4.198" />', 'index administrator build'),
    ('<meta name="administrator-release" content="HISTORICAL DEPTH FOUNDATION · LAZY LONG HISTORY · INDICES 5Y 10Y MAX" />', '<meta name="administrator-release" content="COMMODITY HISTORICAL DEPTH · LAZY ENERGY METALS · VERSION TRUTH" />', 'index release'),
    ('<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.4.197" />', '<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.4.198" />', 'index token'),
    ('<title>Agent-Crypto @erith.IA — Build 40.4.197 · Administrator</title>', '<title>Agent-Crypto @erith.IA — Build 40.4.198 · Administrator</title>', 'index title'),
]:
    i = replace_once(i, old, new, label)

i = replace_all_checked(i, 'parallel-markets.css?v=40.4.197', 'parallel-markets.css?v=40.4.198', 1, 'parallel css cache token')
i = replace_all_checked(i, 'parallel-markets.js?v=40.4.197', 'parallel-markets.js?v=40.4.198', 1, 'parallel js cache token')
i = replace_all_checked(i, 'market-stack.js?v=40.4.197', 'market-stack.js?v=40.4.198', 1, 'market stack cache token')

old_metals_periods = '''                <button type="button" data-metals-period="90">90j</button>
                <button type="button" data-metals-period="365">1a</button>'''
new_metals_periods = '''                <button type="button" data-metals-period="90">90j</button>
                <button type="button" data-metals-period="365">1a</button>
                <button type="button" data-metals-long-period="5a" aria-pressed="false" title="Historique long chargé uniquement à l’appel">5a</button>
                <button type="button" data-metals-long-period="10a" aria-pressed="false" title="Historique long chargé uniquement à l’appel">10a</button>
                <button type="button" data-metals-long-period="max" aria-pressed="false" title="Historique long chargé uniquement à l’appel">MAX</button>'''
i = replace_once(i, old_metals_periods, new_metals_periods, 'Metals long buttons')

if './js/version-truth.js' not in i:
    i = replace_once(i, '</body>', '  <script src="./js/version-truth.js?v=40.4.198"></script>\n</body>', 'Version Truth loader')
else:
    i = i.replace('version-truth.js?v=40.4.197', 'version-truth.js?v=40.4.198')
INDEX.write_text(i, encoding='utf-8')

# ---------------- Manifest + invariant gates ----------------
manifest = ADMIN / 'build.json'
data = json.loads(manifest.read_text(encoding='utf-8'))
data.update({
    'build': BUILD,
    'engine': ENGINE,
    'release': 'COMMODITY HISTORICAL DEPTH · LAZY ENERGY METALS · VERSION TRUTH',
    'published': True,
})
manifest.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

# Strong release assertions.
index_final = INDEX.read_text(encoding='utf-8')
parallel_final = PARALLEL.read_text(encoding='utf-8')
app_final = APP.read_text(encoding='utf-8')
stack_final = STACK.read_text(encoding='utf-8')
version_truth = (ADMIN / 'js/version-truth.js').read_text(encoding='utf-8')

assert f'content="{ENGINE}"' in index_final
assert 'ALL_MARKETS_STATIC_CRYPTO_SLOT_PARITY_DOMAIN_CONTENT_404189' in stack_final
assert 'transform' not in helper and 'transition' not in helper
assert 'setInterval' not in helper and 'MutationObserver' not in helper
assert 'setInterval' not in version_truth and 'MutationObserver' not in version_truth
assert 'domain === "energy" || domain === "indices"' not in parallel_final  # preserve explicit reviewed order
assert 'historical_domains:Object.freeze({indices:true,energy:true,"cross-market":false})' in parallel_final
assert 'future_continuous_only' in parallel_final
assert 'data-metals-long-period="5a"' in index_final
assert 'ATLAS_METALS_LONG_HISTORY_404198' in app_final
assert 'spot_semantics_forbidden' in app_final
assert 'version-truth.js?v=40.4.198' in index_final
assert 'propagation' not in version_truth.lower()
assert 'orders_allowed:false' in parallel_final
print('40.4.198 patch complete · geometry contract preserved · engine', ENGINE)
