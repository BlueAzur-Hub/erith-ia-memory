#!/usr/bin/env python3
from pathlib import Path
import re
import subprocess

BASE = Path("public/agent_crypto_erith_ia/administrator")
BUILD = "40.4.197"
PARENT = "40.4.196"
RELEASE = "HISTORICAL DEPTH FOUNDATION · LAZY LONG HISTORY · INDICES 5Y 10Y MAX"
STATUS = "historical_depth_lazy_indices_404197"


def read(path):
    return path.read_text(encoding="utf-8")


def write(path, text):
    path.write_text(text, encoding="utf-8")


def replace_one(text, old, new, label):
    if old not in text:
        raise SystemExit(f"404197 anchor missing: {label}")
    return text.replace(old, new, 1)


parallel_path = BASE / "js" / "parallel-markets.js"
parallel = read(parallel_path)
parallel = replace_one(parallel, 'const BUILD = "40.4.196";', 'const BUILD = "40.4.197";', "parallel build")
parallel = replace_one(parallel, 'const DEPTH_LEVEL = 196;', 'const DEPTH_LEVEL = 197;', "depth level")
parallel = replace_one(
    parallel,
    'const PERIODS = Object.freeze(["24h", "7j", "30j", "60j", "90j", "1a"]);',
    'const PERIODS = Object.freeze(["24h", "7j", "30j", "60j", "90j", "1a"]);\n  const LONG_PERIODS = Object.freeze(["5a", "10a", "max"]);',
    "long periods",
)
parallel = replace_one(
    parallel,
    'indices: Object.freeze({ label: "INDICES", title: "Indices / Bourse", path: "../data/indices/market.json", expected: 5, accent: "#aa91ee", source: "Yahoo Finance", defaultPeriod: "1a", depthAt: 190 }),',
    'indices: Object.freeze({ label: "INDICES", title: "Indices / Bourse", path: "../data/indices/market.json", historyBase: "../data/indices/history", expected: 5, accent: "#aa91ee", source: "Yahoo Finance", defaultPeriod: "1a", depthAt: 190 }),',
    "indices history base",
)
parallel = replace_one(
    parallel,
    'const state = { current: "crypto", data: new Map(), period: new Map(), load: new Map(), selected: new Map(), canvasHostReady: false };',
    'const state = { current: "crypto", data: new Map(), period: new Map(), load: new Map(), history: new Map(), historyLoad: new Map(), selected: new Map(), canvasHostReady: false };',
    "history state",
)
parallel = replace_one(
    parallel,
    '<span class="mirror-group atlas-toolbar-section-404195"><small>AFFICHER</small><b class="atlas-toolbar-info-404196" data-parallel-state>Source Truth</b></span>',
    '<span class="mirror-group atlas-toolbar-section-404195 atlas-toolbar-history-404197"><small>AFFICHER</small><button type="button" data-parallel-long-period="5a" title="Historique long chargé uniquement à la demande">5a</button><button type="button" data-parallel-long-period="10a" title="Historique long chargé uniquement à la demande">10a</button><button type="button" data-parallel-long-period="max" title="Historique MAX hebdomadaire chargé uniquement à la demande">MAX</button></span>',
    "AFFICHER long controls",
)

click_anchor = '''      bar.addEventListener("click", event => {
        const button = event.target instanceof Element ? event.target.closest("[data-parallel-period]") : null;
        if (!button || !CONFIG[state.current] || !ACTIVE.has(state.current)) return;
        const period = button.getAttribute("data-parallel-period");
        if (!PERIODS.includes(period)) return;
        if (state.current === "cross-market" && period === "24h") return;
        state.period.set(state.current, period);
        render(state.current);
      });'''
long_click = click_anchor + '''
      bar.addEventListener("click", async event => {
        const button = event.target instanceof Element ? event.target.closest("[data-parallel-long-period]") : null;
        if (!button || !CONFIG[state.current] || !ACTIVE.has(state.current)) return;
        const domain = state.current;
        const period = button.getAttribute("data-parallel-long-period");
        if (!LONG_PERIODS.includes(period) || domain !== "indices") return;
        button.dataset.historyLoading = "1";
        button.setAttribute("aria-busy", "true");
        try {
          await loadHistorical(domain, period);
          if (state.current !== domain) return;
          state.period.set(domain, period);
          render(domain);
        } catch (error) {
          button.title = `Historique indisponible : ${safeText(error?.message || error)}`;
          state.period.set(domain, CONFIG[domain].defaultPeriod);
          render(domain);
        } finally {
          delete button.dataset.historyLoading;
          button.removeAttribute("aria-busy");
        }
      });'''
parallel = replace_one(parallel, click_anchor, long_click, "long click handler")

load_anchor = '''  function periodDays(period) {
    return period === "7j" ? 7 : period === "30j" ? 30 : period === "60j" ? 60 : period === "90j" ? 90 : period === "1a" ? 370 : 1;
  }
'''
load_block = '''  function historyKey(domain, period) { return `${domain}:${period}`; }
  function isLongPeriod(period) { return LONG_PERIODS.includes(period); }

  function loadHistorical(domain, period) {
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
  }

  function payloadForPeriod(domain, period) {
    if (isLongPeriod(period)) return state.history.get(historyKey(domain, period)) || null;
    return state.data.get(domain) || null;
  }

''' + load_anchor
parallel = replace_one(parallel, load_anchor, load_block, "lazy history loader")

parallel = replace_one(
    parallel,
    '''  function pickSeries(asset, period, cross) {
    if (period === "24h" && !cross) return (asset.intraday_24h || []).map(p => ({ time:p.time, close:finite(p.close), volume:finite(p.volume) })).filter(p => p.close !== null);''',
    '''  function pickSeries(asset, period, cross) {
    if (isLongPeriod(period)) return (asset.history_points || []).map(p => ({ time:p.time || p.date, close:finite(p.close), volume:finite(p.volume), high:finite(p.high), low:finite(p.low), open:finite(p.open) })).filter(p => p.close !== null && p.time);
    if (period === "24h" && !cross) return (asset.intraday_24h || []).map(p => ({ time:p.time, close:finite(p.close), volume:finite(p.volume) })).filter(p => p.close !== null);''',
    "long series picker",
)

indices_anchor = '''  function indicesDepth(payload, rowsByAsset, metricByAsset) {
    const snap = horizonSnapshot(payload, "indices", state.period.get("indices") || "1a");'''
indices_new = '''  function indicesDepth(payload, rowsByAsset, metricByAsset) {
    const activePeriod = state.period.get("indices") || "1a";
    if (isLongPeriod(activePeriod) && payload?.schema === "agent_crypto_historical_depth_v1") {
      const selected = selectedAsset("indices", rowsByAsset);
      const counts = rowsByAsset.map(x => x.rows.length).filter(Number.isFinite);
      const starts = rowsByAsset.map(x => x.rows[0]?.time).filter(Boolean).sort();
      const ends = rowsByAsset.map(x => x.rows[x.rows.length-1]?.time).filter(Boolean).sort();
      return `${selectedSheet("indices", selected, metricByAsset)}
        <section class="parallel-depth-section"><b>Historical Depth · ${esc(activePeriod.toUpperCase())}</b><div class="parallel-depth-grid">
          <span><small>Résolution</small><strong>${esc(payload.resolution || "1wk")}</strong></span>
          <span><small>Points / actif</small><strong>${counts.length ? `${Math.min(...counts)}–${Math.max(...counts)}` : "—"}</strong></span>
          <span><small>Début commun approx.</small><strong>${esc(starts[starts.length-1] ? dateText(starts[starts.length-1]) : "—")}</strong></span>
          <span><small>Dernier point</small><strong>${esc(ends[0] ? dateText(ends[0]) : "—")}</strong></span>
        </div><p class="parallel-depth-note">Archive hebdomadaire Yahoo Finance chargée uniquement après appel opérateur. Les fenêtres 5a et 10a sont des sous-ensembles déterministes de MAX ; aucune interpolation et aucune valeur inventée.</p></section>
        <section class="parallel-depth-section"><b>Risque historique long</b><p>Volatilité maximale observée ${pct(Math.max(...metricByAsset.map(x=>x.metric.volatility||0)))} · drawdown le plus profond ${pct(Math.min(...metricByAsset.map(x=>x.metric.drawdown||0)))}. Lecture historique uniquement, aucune prévision.</p></section>
        <section class="parallel-depth-section"><b>Provenance & lazy contract</b><p>${esc(payload.source || "Yahoo Finance")} · snapshot ${esc(dateText(payload.generated_at))} · ${payload.assets_count}/${payload.assets_expected || payload.assets_count}. Ce fichier n'appartient pas au payload de boot et reste absent de la mémoire navigateur tant que l'horizon long n'est pas demandé.</p></section>`;
    }
    const snap = horizonSnapshot(payload, "indices", activePeriod);'''
parallel = replace_one(parallel, indices_anchor, indices_new, "indices long depth")

render_anchor = '''    const cfg = CONFIG[domain]; if (!cfg) return;
    const payload = state.data.get(domain); if (!payload) return;
    const period = state.period.get(domain) || cfg.defaultPeriod;
    state.period.set(domain, period);'''
render_new = '''    const cfg = CONFIG[domain]; if (!cfg) return;
    const period = state.period.get(domain) || cfg.defaultPeriod;
    const payload = payloadForPeriod(domain, period);
    if (!payload) return;
    state.period.set(domain, period);'''
parallel = replace_one(parallel, render_anchor, render_new, "render lazy payload")

subtitle_anchor = '''    shell.querySelector("[data-parallel-subtitle]").textContent = domain === "cross-market" ? (payload.source_note || "Comparaison transversale Base 100.") : "Cotations publiques et historique conservés séparément · Base 100 pour la comparaison.";'''
subtitle_new = '''    shell.querySelector("[data-parallel-subtitle]").textContent = isLongPeriod(period)
      ? `Historical Depth ${period.toUpperCase()} · archive chargée à la demande · ${payload.resolution || "1wk"}`
      : domain === "cross-market" ? (payload.source_note || "Comparaison transversale Base 100.") : "Cotations publiques et historique conservés séparément · Base 100 pour la comparaison.";'''
parallel = replace_one(parallel, subtitle_anchor, subtitle_new, "historical subtitle")

buttons_anchor = '''    const buttons = toolbar()?.querySelectorAll("[data-parallel-period]") || [];
    buttons.forEach(b => { const p=b.getAttribute("data-parallel-period"); b.classList.toggle("is-active", p===period); b.disabled = domain==="cross-market" && p==="24h"; });'''
buttons_new = buttons_anchor + '''
    const longButtons = toolbar()?.querySelectorAll("[data-parallel-long-period]") || [];
    longButtons.forEach(b => {
      const p=b.getAttribute("data-parallel-long-period");
      const available = domain === "indices";
      b.classList.toggle("is-active", available && p === period);
      b.disabled = !available;
      b.setAttribute("aria-disabled", available ? "false" : "true");
      b.title = available ? "Historique long chargé uniquement à la demande" : "Historique long activé dans une version dédiée ultérieure";
    });'''
parallel = replace_one(parallel, buttons_anchor, buttons_new, "long button states")

runtime_anchor = '''    depth_contract:DEPTH_LEVEL>=193 ? "shared_shell/domain_owned_depth/source_truth/no_execution" : "progressive",
    new_timer:false,'''
runtime_new = '''    depth_contract:DEPTH_LEVEL>=193 ? "shared_shell/domain_owned_depth/source_truth/no_execution" : "progressive",
    historical_depth_lazy:true,
    historical_boot_fetch:false,
    historical_resident_at_boot:false,
    historical_domains:Object.freeze({indices:true,energy:false,"cross-market":false}),
    historical_long_periods:LONG_PERIODS,
    new_timer:false,'''
parallel = replace_one(parallel, runtime_anchor, runtime_new, "runtime lazy contract")
parallel = replace_one(
    parallel,
    'refresh:domain=>{state.data.delete(domain);return sync(domain);}',
    'refresh:domain=>{state.data.delete(domain);for(const key of [...state.history.keys()]) if(key.startsWith(`${domain}:`)) state.history.delete(key);return sync(domain);}',
    "refresh history cache",
)
write(parallel_path, parallel)

stack_path = BASE / "js" / "market-stack.js"
stack = read(stack_path)
stack = replace_one(stack, 'const BUILD = "40.4.196";', 'const BUILD = "40.4.197";', "market-stack build")
write(stack_path, stack)

css_path = BASE / "parallel-markets.css"
css = read(css_path)
css_block = r'''

/* =========================================================
   40.4.197 — HISTORICAL DEPTH LAZY CONTROLS
   Long histories occupy the already-reserved AFFICHER slot.
   No shell geometry change. 5a / 10a / MAX load only on click.
   ========================================================= */
@media (min-width:901px){
  html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168>.atlas-toolbar-history-404197{
    display:grid!important;
    grid-template-columns:58px repeat(3,minmax(44px,1fr))!important;
    align-items:center!important;
    gap:4px!important;
    overflow:hidden!important;
  }
  .atlas-toolbar-history-404197>small{white-space:nowrap!important}
  .atlas-toolbar-history-404197>button{
    min-height:28px!important;padding:5px 8px!important;border:1px solid rgba(150,170,190,.18)!important;border-radius:999px!important;
    background:rgba(8,16,28,.65)!important;color:#91a3b1!important;font-size:9px!important;font-weight:900!important;cursor:pointer!important;
  }
  .atlas-toolbar-history-404197>button.is-active{
    color:#fff!important;border-color:rgba(105,235,244,.58)!important;background:linear-gradient(180deg,rgba(31,168,184,.34),rgba(8,43,58,.86))!important;box-shadow:0 0 12px rgba(66,225,239,.14)!important;
  }
  .atlas-toolbar-history-404197>button:disabled{opacity:.28!important;filter:saturate(.30)!important;cursor:default!important;pointer-events:none!important}
  .atlas-toolbar-history-404197>button[data-history-loading="1"]{opacity:.68!important;cursor:progress!important}
}
'''
if "40.4.197 — HISTORICAL DEPTH LAZY CONTROLS" not in css:
    css += css_block
write(css_path, css)

# Keep cache tokens for the changed multi-market runtime coherent when present.
index_path = BASE / "index.html"
index = read(index_path)
index = re.sub(r'(\.\/js\/parallel-markets\.js\?v=)[^"\']+', rf'\g<1>{BUILD}', index)
index = re.sub(r'(\.\/js\/market-stack\.js\?v=)[^"\']+', rf'\g<1>{BUILD}', index)
index = re.sub(r'(\.\/parallel-markets\.css\?v=)[^"\']+', rf'\g<1>{BUILD}', index)
write(index_path, index)

subprocess.run([
    "python", ".github/scripts/agent_crypto_release_driver.py",
    "--build", BUILD,
    "--parent", PARENT,
    "--release", RELEASE,
    "--status", STATUS,
    "--lineage-note", "40.4.197 Historical Depth Foundation: Indices 5a/10a/MAX weekly archive, browser lazy-on-call only; 40.4.196 toolbar geometry preserved",
], check=True)

print("40.4.197 patch complete")
