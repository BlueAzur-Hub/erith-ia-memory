(() => {
  "use strict";

  const BUILD = "40.4.199";
  const DEPTH_LEVEL = 199;
  const ACTIVE = new Set(["indices", "energy", "cross-market"]);
  const ENABLE_MATH = true;
  const PERIODS = Object.freeze(["24h", "7j", "30j", "60j", "90j", "1a"]);
  const LONG_PERIODS = Object.freeze(["5a", "10a", "max"]);
  const CONFIG = Object.freeze({
    indices: Object.freeze({ label: "INDICES", title: "Indices / Bourse", path: "../data/indices/market.json", historyBase: "../data/indices/history", expected: 5, accent: "#aa91ee", source: "Yahoo Finance", defaultPeriod: "1a", depthAt: 190 }),
    energy: Object.freeze({ label: "ÉNERGIE", title: "Énergie & matières premières", path: "../data/energy/market.json", historyBase: "../data/energy/history", expected: 3, accent: "#e79b57", source: "Yahoo Finance", defaultPeriod: "1a", depthAt: 191 }),
    "cross-market": Object.freeze({ label: "CROSS", title: "Cross-Market Observatory", path: "../data/cross_market/market.json", historyBase: "../data/cross_market/history", expected: 5, accent: "#dce5ec", source: "Archives canoniques", defaultPeriod: "90j", base100Only: true, depthAt: 192 }),
  });
  const COLORS = ["#ffd35b", "#72d8ff", "#89f4d1", "#cf93f4", "#ff8b5c", "#e5edf4"];
  const state = { current: "crypto", data: new Map(), period: new Map(), load: new Map(), history: new Map(), historyLoad: new Map(), selected: new Map(), canvasHostReady: false };

  const byId = id => document.getElementById(id);
  const safeText = v => String(v ?? "");
  const finite = v => Number.isFinite(Number(v)) ? Number(v) : null;
  const esc = v => safeText(v).replace(/[&<>"\']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const pct = v => Number.isFinite(v) ? `${v >= 0 ? "+" : ""}${v.toFixed(2)} %` : "—";
  const num = (v, digits=2) => Number.isFinite(v) ? v.toLocaleString("fr-FR", {maximumFractionDigits:digits}) : "—";
  const dateText = value => {
    if (!value) return "—";
    const d = new Date(value);
    return Number.isFinite(d.getTime()) ? d.toLocaleString("fr-FR", {year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}) : safeText(value);
  };

  function stage(){ return byId("atlasCyclicMarketInertStage404168"); }
  function toolbar(){ return byId("atlasCyclicMarketMirrorToolbar404168"); }
  function detail(){ return byId("atlasParallelDomainRailHost404189") || byId("atlasCyclicMarketInertDetail404168"); }

  function ensureShell() {
    const host = stage(), bar = toolbar(), rail = detail();
    if (!host || !bar || !rail) return false;
    if (!byId("atlasParallelLiveCanvas404170")) {
      host.innerHTML = `
        <div class="atlas-parallel-live-shell" data-parallel-live-shell>
          <div class="atlas-parallel-live-heading">
            <div><small>ERITH.IA · MARKETS OBSERVATORY</small><h3 data-parallel-title>Marché</h3><p data-parallel-subtitle>Source Truth publique · observation uniquement.</p></div>
            <div class="atlas-parallel-live-badges"><span data-parallel-source>Source</span><span data-parallel-count>0/0</span></div>
          </div>
          <div class="atlas-parallel-live-stage">
            <canvas id="atlasParallelLiveCanvas404170" aria-label="Graphique marché parallèle"></canvas>
            <div class="atlas-parallel-live-overlay" data-parallel-overlay></div>
          </div>
          <div class="atlas-parallel-live-summary" data-parallel-summary>En attente du domaine.</div>
          <div class="atlas-parallel-live-legend" data-parallel-legend></div>
        </div>`;
    }
    if (bar.dataset.parallelToolbarBound !== "1") {
      bar.dataset.parallelToolbarBound = "1";
      bar.innerHTML = `
        <span class="mirror-group atlas-toolbar-view-404195"><small>VUE</small><button type="button" disabled aria-disabled="true" title="Vue Prix non disponible pour ce domaine">Prix</button><b class="active">Base 100</b></span>
        <span class="mirror-group atlas-toolbar-scale-404195 atlas-toolbar-disabled-slot-404195"><small>ÉCHELLE</small><button type="button" disabled aria-disabled="true" title="Échelle native non disponible pour ce domaine">Normale</button><button type="button" disabled aria-disabled="true" title="Échelle logarithmique non disponible pour ce domaine">Log</button></span>
        <span class="mirror-group atlas-toolbar-section-404195 atlas-toolbar-history-404197"><small>AFFICHER</small><button type="button" data-parallel-long-period="5a" title="Historique long chargé uniquement à la demande">5a</button><button type="button" data-parallel-long-period="10a" title="Historique long chargé uniquement à la demande">10a</button><button type="button" data-parallel-long-period="max" title="Historique MAX hebdomadaire chargé uniquement à la demande">MAX</button></span>
        <span class="mirror-group atlas-toolbar-period-404195 atlas-parallel-periods"><small>PÉRIODE</small>${PERIODS.map(p => `<button type="button" data-parallel-period="${p}">${p}</button>`).join("")}</span>`;
      bar.addEventListener("click", event => {
        const button = event.target instanceof Element ? event.target.closest("[data-parallel-period]") : null;
        if (!button || !CONFIG[state.current] || !ACTIVE.has(state.current)) return;
        const period = button.getAttribute("data-parallel-period");
        if (!PERIODS.includes(period)) return;
        if (state.current === "cross-market" && period === "24h") return;
        state.period.set(state.current, period);
        render(state.current);
      });
      bar.addEventListener("click", async event => {
        const button = event.target instanceof Element ? event.target.closest("[data-parallel-long-period]") : null;
        if (!button || !CONFIG[state.current] || !ACTIVE.has(state.current)) return;
        const domain = state.current;
        const period = button.getAttribute("data-parallel-long-period");
        if (!LONG_PERIODS.includes(period) || !longDomainEnabled(domain)) return;
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
      });
    }
    if (rail.dataset.parallelRailBound !== "1") {
      rail.dataset.parallelRailBound = "1";
      rail.addEventListener("click", event => {
        const button = event.target instanceof Element ? event.target.closest("[data-parallel-asset]") : null;
        if (!button || !CONFIG[state.current] || DEPTH_LEVEL < CONFIG[state.current].depthAt) return;
        const id = button.getAttribute("data-parallel-asset");
        if (!id) return;
        state.selected.set(state.current, id);
        render(state.current);
      });
    }
    state.canvasHostReady = true;
    return true;
  }

  function setStatus(domain, cfg, payload) {
    const live = byId("liveStatus"), metals = byId("atlasMetalsLiveStatus");
    if (domain === "crypto") {
      if (live) live.hidden = false;
      if (metals) metals.hidden = true;
      return;
    }
    if (domain === "metals") return;
    if (live) live.hidden = true;
    if (metals) {
      metals.hidden = false;
      metals.textContent = `${cfg.title} · Public ${payload?.assets_count ?? 0}/${cfg.expected}`;
      metals.classList.toggle("ok", Number(payload?.assets_count) === cfg.expected);
      metals.classList.toggle("warn", Number(payload?.assets_count) !== cfg.expected);
    }
  }

  function loadDomain(domain) {
    if (state.data.has(domain)) return Promise.resolve(state.data.get(domain));
    if (state.load.has(domain)) return state.load.get(domain);
    const cfg = CONFIG[domain];
    if (!cfg || !ACTIVE.has(domain)) return Promise.resolve(null);
    const promise = fetch(cfg.path + `?v=${encodeURIComponent(BUILD)}`, { cache: "no-store", credentials: "same-origin" })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(payload => {
        if (!payload || payload.status !== "ready" || !Array.isArray(payload.assets)) throw new Error("archive non READY");
        state.data.set(domain, payload);
        return payload;
      })
      .finally(() => state.load.delete(domain));
    state.load.set(domain, promise);
    return promise;
  }

  function historyKey(domain, period) { return `${domain}:${period}`; }
  function isLongPeriod(period) { return LONG_PERIODS.includes(period); }
  function longDomainEnabled(domain) { return domain === "indices" || domain === "energy" || (DEPTH_LEVEL >= 202 && domain === "cross-market"); }

  function loadHistorical(domain, period) {
    const cfg = CONFIG[domain];
    if (!cfg?.historyBase || !longDomainEnabled(domain) || !isLongPeriod(period)) return Promise.reject(new Error("historique long non activé pour ce domaine"));
    const key = historyKey(domain, period);
    if (state.history.has(key)) return Promise.resolve(state.history.get(key));
    if (state.historyLoad.has(key)) return state.historyLoad.get(key);
    const expectedSchema = domain === "cross-market"
      ? "agent_crypto_cross_historical_depth_v1"
      : domain === "energy"
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
  }

  function payloadForPeriod(domain, period) {
    if (isLongPeriod(period)) return state.history.get(historyKey(domain, period)) || null;
    return state.data.get(domain) || null;
  }

  function periodDays(period) {
    return period === "7j" ? 7 : period === "30j" ? 30 : period === "60j" ? 60 : period === "90j" ? 90 : period === "1a" ? 370 : 1;
  }

  function pickSeries(asset, period, cross) {
    if (isLongPeriod(period)) return (asset.history_points || []).map(p => ({ time:p.time || p.date, close:finite(p.close), volume:finite(p.volume), high:finite(p.high), low:finite(p.low), open:finite(p.open) })).filter(p => p.close !== null && p.time);
    if (period === "24h" && !cross) return (asset.intraday_24h || []).map(p => ({ time:p.time, close:finite(p.close), volume:finite(p.volume) })).filter(p => p.close !== null);
    const rows = (asset.daily || []).map(p => ({ time:p.time || p.date, close:finite(p.close), volume:finite(p.volume), high:finite(p.high), low:finite(p.low), open:finite(p.open) })).filter(p => p.close !== null && p.time);
    if (!rows.length) return [];
    const last = new Date(rows[rows.length - 1].time).getTime();
    const cutoff = last - periodDays(period) * 86400000;
    return rows.filter(p => new Date(p.time).getTime() >= cutoff);
  }

  function normalize(rows) {
    if (!rows.length || !rows[0].close) return [];
    const base = rows[0].close;
    return rows.map(p => ({ time:p.time, value:(p.close / base) * 100, raw:p.close }));
  }

  function metrics(rows) {
    if (rows.length < 2) return { change:null, volatility:null, drawdown:null, amplitude:null };
    const first = rows[0].close, last = rows[rows.length - 1].close;
    const change = first ? ((last / first) - 1) * 100 : null;
    const returns = [];
    let peak = rows[0].close, maxDd = 0, low = rows[0].close, high = rows[0].close;
    for (let i=1;i<rows.length;i++) {
      const prev = rows[i-1].close, cur = rows[i].close;
      if (prev && cur) returns.push(((cur / prev) - 1) * 100);
      if (cur > peak) peak = cur;
      if (cur < low) low = cur;
      if (cur > high) high = cur;
      if (peak > 0) maxDd = Math.min(maxDd, ((cur / peak) - 1) * 100);
    }
    let volatility = null;
    if (returns.length > 1) {
      const mean = returns.reduce((a,b)=>a+b,0) / returns.length;
      volatility = Math.sqrt(returns.reduce((a,b)=>a + Math.pow(b-mean,2),0) / (returns.length-1));
    }
    const amplitude = low ? ((high / low) - 1) * 100 : null;
    return { change, volatility, drawdown:maxDd, amplitude };
  }

  function drawCanvas(series, period, accent) {
    const canvas = byId("atlasParallelLiveCanvas404170");
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(640, Math.round(rect.width || canvas.parentElement?.clientWidth || 980));
    const height = Math.max(340, Math.round(rect.height || canvas.parentElement?.clientHeight || 470));
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,width,height);
    const pad = {l:54,r:24,t:24,b:34}, w = width-pad.l-pad.r, h=height-pad.t-pad.b;
    ctx.fillStyle = "rgba(3,10,18,.72)"; ctx.fillRect(0,0,width,height);
    ctx.strokeStyle = "rgba(140,175,200,.13)"; ctx.lineWidth = 1;
    for (let i=0;i<=5;i++){ const y=pad.t+(h/5)*i; ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(width-pad.r,y);ctx.stroke(); }
    for (let i=0;i<=6;i++){ const x=pad.l+(w/6)*i; ctx.beginPath();ctx.moveTo(x,pad.t);ctx.lineTo(x,height-pad.b);ctx.stroke(); }
    const all = series.flatMap(s => s.points.map(p => p.value));
    let min = Math.min(...all), max = Math.max(...all); if (!Number.isFinite(min)||!Number.isFinite(max)) return;
    const span = Math.max(.1,max-min); min -= span*.08; max += span*.08;
    ctx.font = "11px system-ui"; ctx.fillStyle = "rgba(197,215,226,.72)";
    for (let i=0;i<=5;i++){ const v=max-(max-min)*(i/5); ctx.fillText(v.toFixed(1),8,pad.t+(h/5)*i+4); }
    series.forEach((s, idx) => {
      if (s.points.length < 2) return;
      ctx.strokeStyle = COLORS[idx % COLORS.length]; ctx.lineWidth = idx===0 ? 2.6 : 2.1; ctx.beginPath();
      s.points.forEach((p,i) => {
        const x = pad.l + (i / Math.max(1,s.points.length-1))*w;
        const y = pad.t + (1 - ((p.value-min)/(max-min)))*h;
        if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }); ctx.stroke();
      const last=s.points[s.points.length-1], x=width-pad.r, y=pad.t+(1-((last.value-min)/(max-min)))*h;
      ctx.fillStyle=COLORS[idx%COLORS.length];ctx.beginPath();ctx.arc(x,y,3.7,0,Math.PI*2);ctx.fill();
    });
    ctx.fillStyle = accent || "#dce5ec"; ctx.font = "800 10px system-ui"; ctx.fillText(`BASE 100 · ${period.toUpperCase()}`, pad.l, height-10);
  }

  function latestValue(asset, rows) {
    const current = finite(asset?.current?.price);
    if (current !== null) return current;
    return finite(rows?.[rows.length - 1]?.close);
  }

  function horizonSnapshot(payload, domain, period) {
    const values = payload.assets.map(asset => {
      const rows = pickSeries(asset, period, domain === "cross-market");
      return { asset, rows, metric: metrics(rows) };
    }).filter(x => x.rows.length >= 2 && x.metric.change !== null);
    values.sort((a,b) => b.metric.change - a.metric.change);
    const leader = values[0], laggard = values[values.length - 1];
    const up = values.filter(x => x.metric.change > .05).length;
    const down = values.filter(x => x.metric.change < -.05).length;
    return {
      count: values.length, leader, laggard, up, down, flat: values.length-up-down,
      dispersion: leader && laggard ? leader.metric.change-laggard.metric.change : null,
      worstDrawdown: values.length ? Math.min(...values.map(x => x.metric.drawdown ?? 0)) : null,
      maxVolatility: values.length ? Math.max(...values.map(x => x.metric.volatility ?? 0)) : null,
    };
  }

  function horizonCards(payload, domain) {
    return ["7j","30j","90j","1a"].map(period => {
      const snap = horizonSnapshot(payload, domain, period);
      const l = snap.leader, r = snap.laggard;
      return `<div class="parallel-depth-horizon"><b>${period}</b><span>${l ? `${esc(l.asset.symbol||l.asset.name)} ${pct(l.metric.change)}` : "—"}</span><small>retard ${r ? `${esc(r.asset.symbol||r.asset.name)} ${pct(r.metric.change)}` : "—"} · écart ${num(snap.dispersion)} pt</small></div>`;
    }).join("");
  }

  function selectedAsset(domain, rowsByAsset) {
    const selectedId = state.selected.get(domain);
    return rowsByAsset.find(x => safeText(x.asset.asset_id || x.asset.symbol) === selectedId) || rowsByAsset[0] || null;
  }

  function selectedSheet(domain, selected, metricByAsset) {
    if (!selected) return "";
    const { asset, rows } = selected;
    const id = safeText(asset.asset_id || asset.symbol);
    state.selected.set(domain, id);
    const metric = metricByAsset.find(x => x.asset === asset)?.metric || metrics(rows);
    const last = latestValue(asset, rows);
    const latestRow = rows[rows.length - 1] || {};
    const unit = safeText(asset.currency || asset.unit || "");
    return `<section class="parallel-depth-sheet">
      <b>Fiche actif · ${esc(asset.name || asset.symbol)}</b>
      <div class="parallel-depth-grid">
        <span><small>Symbole</small><strong>${esc(asset.symbol || "—")}</strong></span>
        <span><small>Dernier</small><strong>${num(last,4)} ${esc(unit)}</strong></span>
        <span><small>Fenêtre</small><strong>${pct(metric.change)}</strong></span>
        <span><small>Volatilité / séance</small><strong>${pct(metric.volatility)}</strong></span>
        <span><small>Drawdown max</small><strong>${pct(metric.drawdown)}</strong></span>
        <span><small>Amplitude</small><strong>${pct(metric.amplitude)}</strong></span>
        <span><small>Points</small><strong>${rows.length}</strong></span>
        <span><small>Dernier relevé</small><strong>${esc(dateText(latestRow.time))}</strong></span>
      </div>
    </section>`;
  }

  function indicesDepth(payload, rowsByAsset, metricByAsset) {
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
    const snap = horizonSnapshot(payload, "indices", activePeriod);
    const selected = selectedAsset("indices", rowsByAsset);
    const volumes = rowsByAsset.map(({asset,rows}) => {
      const vals = rows.map(r => finite(r.volume)).filter(v => v !== null);
      const latest = vals[vals.length-1];
      return latest === undefined ? null : `<li><b>${esc(asset.symbol||asset.name)}</b><span>${num(latest,0)}</span><small>volume source · non agrégé</small></li>`;
    }).filter(Boolean).join("");
    return `${selectedSheet("indices", selected, metricByAsset)}
      <section class="parallel-depth-section"><b>Lecture multi-horizon</b><div class="parallel-depth-horizons">${horizonCards(payload,"indices")}</div></section>
      <section class="parallel-depth-section"><b>Breadth & dispersion</b><p>${snap.up} hausses · ${snap.down} baisses · ${snap.flat} stables sur la fenêtre active. Dispersion ${num(snap.dispersion)} pt. Pire drawdown ${pct(snap.worstDrawdown)}.</p></section>
      <section class="parallel-depth-section"><b>Participation publiée</b><ul class="parallel-depth-list">${volumes || "<li>Volumes non fournis par la source.</li>"}</ul><p class="parallel-depth-note">Les volumes restent attachés à chaque indice : aucune somme inter-indices n'est calculée.</p></section>
      <section class="parallel-depth-section"><b>Provenance & intégrité</b><p>${esc(payload.source || "Yahoo Finance")} · snapshot ${esc(dateText(payload.generated_at))} · couverture ${payload.assets_count}/${payload.assets_expected || payload.assets_count}. Cotations, devises et unités restent séparées.</p></section>`;
  }

  function energyDepth(payload, rowsByAsset, metricByAsset) {
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
    const selected = selectedAsset("energy", rowsByAsset);
    const map = new Map(rowsByAsset.map(x => [safeText(x.asset.symbol), x]));
    const wti = map.get("CL=F"), brent = map.get("BZ=F"), gas = map.get("NG=F");
    const wtiValue = wti ? latestValue(wti.asset,wti.rows) : null;
    const brentValue = brent ? latestValue(brent.asset,brent.rows) : null;
    const spread = wtiValue !== null && brentValue !== null ? brentValue-wtiValue : null;
    const gasValue = gas ? latestValue(gas.asset,gas.rows) : null;
    return `${selectedSheet("energy", selected, metricByAsset)}
      <section class="parallel-depth-section"><b>Lecture multi-horizon</b><div class="parallel-depth-horizons">${horizonCards(payload,"energy")}</div></section>
      <section class="parallel-depth-section"><b>Structure énergie</b><div class="parallel-depth-grid">
        <span><small>WTI</small><strong>${num(wtiValue,3)} USD</strong></span>
        <span><small>Brent</small><strong>${num(brentValue,3)} USD</strong></span>
        <span><small>Brent − WTI</small><strong>${spread===null?"—":`${spread>=0?"+":""}${num(spread,3)} USD`}</strong></span>
        <span><small>Gaz naturel</small><strong>${num(gasValue,4)} USD</strong></span>
      </div><p class="parallel-depth-note">Le spread Brent–WTI n'est calculé que lorsque les deux cotations USD sont présentes. Le gaz reste séparé des pétroles.</p></section>
      <section class="parallel-depth-section"><b>Risque historique</b><p>Volatilité maximale observée ${pct(Math.max(...metricByAsset.map(x=>x.metric.volatility||0)))} · drawdown le plus profond ${pct(Math.min(...metricByAsset.map(x=>x.metric.drawdown||0)))}. Mesures historiques, aucune prévision.</p></section>
      <section class="parallel-depth-section"><b>Provenance & intégrité</b><p>${esc(payload.source || "Yahoo Finance")} · snapshot ${esc(dateText(payload.generated_at))} · couverture ${payload.assets_count}/${payload.assets_expected || payload.assets_count}. Aucun mélange d'unités ou de contrats.</p></section>`;
  }

  function alignedReturns(asset) {
    const rows = (asset.daily || []).map(p => ({date:safeText(p.date || p.time).slice(0,10), close:finite(p.close)})).filter(x=>x.date&&x.close!==null);
    const out = new Map();
    for(let i=1;i<rows.length;i++){
      if (!rows[i-1].close || !rows[i].close) continue;
      out.set(rows[i].date, (rows[i].close/rows[i-1].close)-1);
    }
    return out;
  }

  function correlation(a,b) {
    const ra=alignedReturns(a), rb=alignedReturns(b), xs=[], ys=[];
    for(const [d,x] of ra){ if(rb.has(d)){ xs.push(x); ys.push(rb.get(d)); } }
    if(xs.length<12) return null;
    const mx=xs.reduce((s,v)=>s+v,0)/xs.length, my=ys.reduce((s,v)=>s+v,0)/ys.length;
    let cov=0,vx=0,vy=0;
    for(let i=0;i<xs.length;i++){ const dx=xs[i]-mx,dy=ys[i]-my; cov+=dx*dy;vx+=dx*dx;vy+=dy*dy; }
    return vx>0&&vy>0 ? cov/Math.sqrt(vx*vy) : null;
  }

  function crossDepth(payload, rowsByAsset, metricByAsset) {
    const selected = selectedAsset("cross-market", rowsByAsset);
    const pairs=[];
    for(let i=0;i<payload.assets.length;i++) for(let j=i+1;j<payload.assets.length;j++){
      const value=correlation(payload.assets[i],payload.assets[j]);
      if(value!==null) pairs.push({a:payload.assets[i],b:payload.assets[j],value});
    }
    pairs.sort((a,b)=>b.value-a.value);
    const pos=pairs[0], inv=[...pairs].sort((a,b)=>a.value-b.value)[0];
    const snap=horizonSnapshot(payload,"cross-market",state.period.get("cross-market")||"90j");
    return `${selectedSheet("cross-market", selected, metricByAsset)}
      <section class="parallel-depth-section"><b>Lecture multi-horizon</b><div class="parallel-depth-horizons">${horizonCards(payload,"cross-market")}</div></section>
      <section class="parallel-depth-section"><b>Corrélations observées</b><div class="parallel-depth-grid">
        <span><small>Plus positive</small><strong>${pos?`${esc(pos.a.symbol||pos.a.name)} / ${esc(pos.b.symbol||pos.b.name)} · ${pos.value.toFixed(2)}`:"—"}</strong></span>
        <span><small>Plus inverse</small><strong>${inv?`${esc(inv.a.symbol||inv.a.name)} / ${esc(inv.b.symbol||inv.b.name)} · ${inv.value.toFixed(2)}`:"—"}</strong></span>
        <span><small>Dispersion fenêtre</small><strong>${num(snap.dispersion)} pt</strong></span>
        <span><small>Breadth</small><strong>${snap.up} ↑ · ${snap.down} ↓ · ${snap.flat} =</strong></span>
      </div><p class="parallel-depth-note">Corrélations de rendements quotidiens sur dates communes ; observation statistique, aucune causalité supposée.</p></section>
      <section class="parallel-depth-section"><b>Provenance & séparation</b><p>${esc(payload.source_note || "Séries issues des archives canoniques et comparées en Base 100.")} Chaque série conserve son origine ; aucune moyenne inter-source.</p></section>`;
  }

  function depthContent(domain,payload,rowsByAsset,metricByAsset){
    const cfg=CONFIG[domain];
    if(!cfg || DEPTH_LEVEL < cfg.depthAt) return "";
    if(domain==="indices") return indicesDepth(payload,rowsByAsset,metricByAsset);
    if(domain==="energy") return energyDepth(payload,rowsByAsset,metricByAsset);
    if(domain==="cross-market") return crossDepth(payload,rowsByAsset,metricByAsset);
    return "";
  }

  function renderRail(domain, cfg, payload, rowsByAsset, metricByAsset) {
    const rail = detail(); if (!rail) return;
    const ranked = [...metricByAsset].filter(x => x.metric.change !== null).sort((a,b)=>b.metric.change-a.metric.change);
    const leader = ranked[0], laggard = ranked[ranked.length-1];
    const depthActive = DEPTH_LEVEL >= cfg.depthAt;
    if (depthActive && !state.selected.has(domain) && rowsByAsset[0]) state.selected.set(domain, safeText(rowsByAsset[0].asset.asset_id || rowsByAsset[0].asset.symbol));
    const selectedId = state.selected.get(domain);
    const basket = rowsByAsset.map(({asset,rows}) => {
      const last = latestValue(asset, rows);
      const found = metricByAsset.find(x => x.asset === asset)?.metric;
      const symbol = safeText(asset.symbol || asset.name || "ACTIF");
      const name = safeText(asset.name || asset.label || symbol);
      const unit = safeText(asset.currency || asset.unit || "");
      const value = last === null || last === undefined ? "—" : Number(last).toLocaleString("fr-FR", {maximumFractionDigits:4});
      const change = found?.change === null || found?.change === undefined ? "—" : `${found.change >= 0 ? "+" : ""}${found.change.toFixed(2)} %`;
      const assetId = safeText(asset.asset_id || asset.symbol);
      return `<li${selectedId===assetId?' class="is-selected"':""}>${depthActive?`<button type="button" data-parallel-asset="${esc(assetId)}" title="Ouvrir la fiche ${esc(name)}">`:"<span>"}<span><b>${esc(symbol)}</b><small>${esc(name)}</small></span><strong>${esc(value)}${unit ? ` ${esc(unit)}` : ""}</strong><em>${esc(change)}</em>${depthActive?"</button>":"</span>"}</li>`;
    }).join("");
    const math = ENABLE_MATH && ranked.length ? `
      <section class="atlas-parallel-math"><b>Math Core · historique mesuré</b>
        <div class="atlas-parallel-math-grid">
          <span><small>Leader</small><strong>${esc(leader.asset.symbol || leader.asset.name)} ${pct(leader.metric.change)}</strong></span>
          <span><small>Retard</small><strong>${esc(laggard.asset.symbol || laggard.asset.name)} ${pct(laggard.metric.change)}</strong></span>
          <span><small>Dispersion</small><strong>${num(leader.metric.change-laggard.metric.change)} pt</strong></span>
          <span><small>Prévision</small><strong>AUCUNE</strong></span>
        </div>
      </section>` : "";
    rail.innerHTML = `
      <header><span class="eyebrow">DÉTAIL ACTIF</span><strong>Lecture ${esc(cfg.title)}</strong><small>Observation seulement · Source Truth publique</small></header>
      <div class="atlas-parallel-detail-state"><span><small>Domaine</small><b>${esc(cfg.label)}</b></span><span><small>Couverture</small><b>${payload.assets_count}/${cfg.expected}</b></span><span><small>Source</small><b>${esc(payload.source || cfg.source)}</b></span><span><small>Build</small><b>${BUILD}</b></span></div>
      <section><b>Lecture synthétique</b><p>${leader ? `Leader ${esc(leader.asset.name)} ; retard ${esc(laggard.asset.name)}. Les séries restent indépendantes et sont comparées en Base 100.` : "Données insuffisantes."}</p></section>
      <section class="atlas-parallel-basket-404189"><b>Panier actif · ${esc(state.period.get(domain) || cfg.defaultPeriod)}</b><ul>${basket || "<li>Données insuffisantes.</li>"}</ul></section>
      ${math}
      ${depthContent(domain,payload,rowsByAsset,metricByAsset)}
      <section><b>Intégrité</b><p>Aucune valeur inventée · aucune moyenne inter-source · aucune exécution · décision humaine uniquement.</p></section>`;
  }

  function render(domain) {
    if (!ensureShell()) return;
    const cfg = CONFIG[domain]; if (!cfg) return;
    const period = state.period.get(domain) || cfg.defaultPeriod;
    const payload = payloadForPeriod(domain, period);
    if (!payload) return;
    state.period.set(domain, period);
    document.documentElement.dataset.parallelMarketRuntime = domain;
    document.documentElement.dataset.parallelMarketBuild = BUILD;
    document.documentElement.dataset.parallelDepthLevel = String(DEPTH_LEVEL);
    const shell = stage()?.querySelector("[data-parallel-live-shell]"); if (!shell) return;
    shell.querySelector("[data-parallel-title]").textContent = cfg.title;
    shell.querySelector("[data-parallel-subtitle]").textContent = isLongPeriod(period)
      ? `Historical Depth ${period.toUpperCase()} · archive chargée à la demande · ${payload.resolution || "1wk"}`
      : domain === "cross-market" ? (payload.source_note || "Comparaison transversale Base 100.") : "Cotations publiques et historique conservés séparément · Base 100 pour la comparaison.";
    shell.querySelector("[data-parallel-source]").textContent = safeText(payload.source || cfg.source);
    shell.querySelector("[data-parallel-count]").textContent = `${payload.assets_count}/${cfg.expected}`;
    const buttons = toolbar()?.querySelectorAll("[data-parallel-period]") || [];
    buttons.forEach(b => { const p=b.getAttribute("data-parallel-period"); b.classList.toggle("is-active", p===period); b.disabled = domain==="cross-market" && p==="24h"; });
    const longButtons = toolbar()?.querySelectorAll("[data-parallel-long-period]") || [];
    longButtons.forEach(b => {
      const p=b.getAttribute("data-parallel-long-period");
      const available = longDomainEnabled(domain);
      b.classList.toggle("is-active", available && p === period);
      b.disabled = !available;
      b.setAttribute("aria-disabled", available ? "false" : "true");
      b.title = available ? "Historique long chargé uniquement à la demande" : "Historique long activé dans une version dédiée ultérieure";
    });
    const rowsByAsset = [], metricByAsset = [], series = [];
    payload.assets.forEach((asset, idx) => {
      const rows = pickSeries(asset, period, domain==="cross-market");
      if (rows.length < 2) return;
      const norm = normalize(rows); if (norm.length < 2) return;
      rowsByAsset.push({asset,rows}); metricByAsset.push({asset,metric:metrics(rows)}); series.push({asset,points:norm,color:COLORS[idx%COLORS.length]});
    });
    drawCanvas(series, period, cfg.accent);
    const ranked = [...metricByAsset].filter(x=>x.metric.change!==null).sort((a,b)=>b.metric.change-a.metric.change);
    const leader=ranked[0], lag=ranked[ranked.length-1];
    const summary = shell.querySelector("[data-parallel-summary]");
    if (summary) summary.innerHTML = ranked.length ? `<b>${series.length}/${cfg.expected} SÉRIES</b><span>Leader ${esc(leader.asset.symbol||leader.asset.name)} ${pct(leader.metric.change)} · retard ${esc(lag.asset.symbol||lag.asset.name)} ${pct(lag.metric.change)}</span>` : "Données insuffisantes";
    const legend = shell.querySelector("[data-parallel-legend]");
    if (legend) legend.innerHTML = metricByAsset.map((x,i)=>`<span style="--series:${COLORS[i%COLORS.length]}"><i></i><b>${esc(x.asset.symbol||x.asset.name)}</b><small>${pct(x.metric.change)}</small></span>`).join("");
    renderRail(domain,cfg,payload,rowsByAsset,metricByAsset);
    setStatus(domain,cfg,payload);
  }

  function showPending(domain) {
    const cfg = CONFIG[domain]; if (!cfg || !ensureShell()) return;
    const host = stage();
    if (host) host.innerHTML = `<div class="atlas-parallel-pending"><small>ERITH.IA · MARKETS OBSERVATORY</small><h3>${esc(cfg.title)}</h3><p>Domaine préparé. Source Truth non activée dans ce build.</p><b>PLANNED · INERT</b></div>`;
    const rail=detail(); if(rail) rail.innerHTML=`<header><span class="eyebrow">DÉTAIL ACTIF</span><strong>Lecture ${esc(cfg.title)}</strong><small>Aucune donnée inventée</small></header><section><b>État</b><p>PLANNED · INERT · activation après validation de la source, de l’unité, de l’historique et de la fraîcheur.</p></section>`;
    const bar=toolbar(); if(bar) bar.querySelector("[data-parallel-state]")?.replaceChildren(document.createTextNode(`${cfg.label} · SOURCE TRUTH REQUISE`));
  }

  async function sync(domain) {
    state.current = domain;
    if (!CONFIG[domain]) { setStatus(domain, {}, null); return; }
    if (!ACTIVE.has(domain)) { showPending(domain); return; }
    if (!ensureShell()) return;
    const bar=toolbar(); if(bar) bar.querySelector("[data-parallel-state]")?.replaceChildren(document.createTextNode(`${CONFIG[domain].label} · PUBLIC`));
    try {
      const payload = await loadDomain(domain);
      if (state.current !== domain) return;
      render(domain);
    } catch (error) {
      const host=stage(); if(host) host.innerHTML=`<div class="atlas-parallel-pending"><small>${esc(CONFIG[domain].label)}</small><h3>Archive indisponible</h3><p>${esc(error?.message||error)}</p><b>UNKNOWN STATE = STOP</b></div>`;
      const rail=detail(); if(rail) rail.innerHTML=`<header><span class="eyebrow">DÉTAIL ACTIF</span><strong>Lecture ${esc(CONFIG[domain].title)}</strong></header><section><b>STOP</b><p>Source publique non lisible. Aucun calcul et aucune décision automatique.</p></section>`;
    }
  }

  document.addEventListener("erith:market-domain-change", event => sync(event?.detail?.domain || document.documentElement.dataset.cyclicMarketDomain || "crypto"));
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => sync(document.documentElement.dataset.cyclicMarketDomain || "crypto"), {once:true});
  else sync(document.documentElement.dataset.cyclicMarketDomain || "crypto");

  function measuredSnapshot404199(domain, requestedPeriod=null) {
    const cfg = CONFIG[domain];
    if (!cfg || !ACTIVE.has(domain)) return { loaded:false, domain, period:requestedPeriod || null, reason:"domain_inactive" };
    const period = requestedPeriod || state.period.get(domain) || cfg.defaultPeriod;
    const payload = payloadForPeriod(domain, period);
    if (!payload) return { loaded:false, domain, period, long:isLongPeriod(period), reason:isLongPeriod(period)?"not_loaded":"payload_unavailable" };
    const assets=[];
    for (const asset of payload.assets || []) {
      const rows=pickSeries(asset,period,domain==="cross-market");
      if(rows.length<2) continue;
      const metric=metrics(rows);
      assets.push({
        asset_id:safeText(asset.asset_id||asset.symbol), name:safeText(asset.name||asset.label||asset.symbol), symbol:safeText(asset.symbol||asset.name),
        provider_symbol:safeText(asset.provider_symbol||asset.symbol), currency:safeText(asset.currency||asset.unit||""), instrument_type:safeText(asset.instrument_type||""),
        metric:{change:metric.change,volatility:metric.volatility,drawdown:metric.drawdown,amplitude:metric.amplitude},
        series:rows.map(row=>({time:row.time,close:row.close})), points:rows.length
      });
    }
    return {loaded:true,domain,period,long:isLongPeriod(period),source:safeText(payload.source||cfg.source),resolution:safeText(payload.resolution||""),generated_at:payload.generated_at||null,assets_count:assets.length,expected:cfg.expected,assets};
  }

  async function ensureHistorical404199(domain, period) {
    if (!longDomainEnabled(domain) || !isLongPeriod(period)) return measuredSnapshot404199(domain,period);
    await loadHistorical(domain,period);
    return measuredSnapshot404199(domain,period);
  }

  globalThis.ErithParallelMarketsRuntime = Object.freeze({
    build:BUILD,
    active:[...ACTIVE],
    math_core:ENABLE_MATH,
    periods:PERIODS,
    source_truth:true,
    one_shared_surface:true,
    depth_level:DEPTH_LEVEL,
    depth_domains:Object.freeze({indices:DEPTH_LEVEL>=190,energy:DEPTH_LEVEL>=191,"cross-market":DEPTH_LEVEL>=192}),
    depth_contract:DEPTH_LEVEL>=193 ? "shared_shell/domain_owned_depth/source_truth/no_execution" : "progressive",
    historical_depth_lazy:true,
    historical_boot_fetch:false,
    historical_resident_at_boot:false,
    historical_domains:Object.freeze({indices:true,energy:true,"cross-market":DEPTH_LEVEL>=202}),
    historical_long_periods:LONG_PERIODS,
    new_timer:false,
    new_observer:false,
    storage_owner:false,
    orders_allowed:false,
    snapshot:measuredSnapshot404199,
    ensureHistorical:ensureHistorical404199,
    refresh:domain=>{state.data.delete(domain);for(const key of [...state.history.keys()]) if(key.startsWith(`${domain}:`)) state.history.delete(key);return sync(domain);}
  });
})();