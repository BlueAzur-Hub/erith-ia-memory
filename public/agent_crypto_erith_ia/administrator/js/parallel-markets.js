(() => {
  "use strict";

  const BUILD = "40.4.182";
  const ACTIVE = new Set(["indices", "energy", "cross-market"]);
  const ENABLE_MATH = true;
  const PERIODS = Object.freeze(["24h", "7j", "30j", "90j", "1a"]);
  const CONFIG = Object.freeze({
    indices: Object.freeze({ label: "INDICES", title: "Indices / Bourse", path: "../data/indices/market.json", expected: 5, accent: "#aa91ee", source: "Yahoo Finance", defaultPeriod: "1a" }),
    energy: Object.freeze({ label: "ÉNERGIE", title: "Énergie & matières premières", path: "../data/energy/market.json", expected: 3, accent: "#e79b57", source: "Yahoo Finance", defaultPeriod: "1a" }),
    "cross-market": Object.freeze({ label: "CROSS", title: "Cross-Market Observatory", path: "../data/cross_market/market.json", expected: 5, accent: "#dce5ec", source: "Archives canoniques", defaultPeriod: "90j", base100Only: true }),
  });
  const COLORS = ["#ffd35b", "#72d8ff", "#89f4d1", "#cf93f4", "#ff8b5c", "#e5edf4"];
  const state = { current: "crypto", data: new Map(), period: new Map(), load: new Map(), canvasHostReady: false };

  const byId = id => document.getElementById(id);
  const safeText = v => String(v ?? "");
  const finite = v => Number.isFinite(Number(v)) ? Number(v) : null;

  function stage(){ return byId("atlasCyclicMarketInertStage404168"); }
  function toolbar(){ return byId("atlasCyclicMarketMirrorToolbar404168"); }
  function detail(){ return byId("atlasCyclicMarketInertDetail404168"); }

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
        <span class="mirror-group"><small>VUE</small><b class="active">Base 100</b></span>
        <span class="mirror-group atlas-parallel-periods"><small>PÉRIODE</small>${PERIODS.map(p => `<button type="button" data-parallel-period="${p}">${p}</button>`).join("")}</span>
        <span class="mirror-group"><small>SECTION</small><b data-parallel-state>Source Truth</b></span>`;
      bar.addEventListener("click", event => {
        const button = event.target instanceof Element ? event.target.closest("[data-parallel-period]") : null;
        if (!button || !CONFIG[state.current] || !ACTIVE.has(state.current)) return;
        const period = button.getAttribute("data-parallel-period");
        if (!PERIODS.includes(period)) return;
        if (state.current === "cross-market" && period === "24h") return;
        state.period.set(state.current, period);
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

  function periodDays(period) {
    return period === "7j" ? 7 : period === "30j" ? 30 : period === "90j" ? 90 : period === "1a" ? 370 : 1;
  }

  function pickSeries(asset, period, cross) {
    if (period === "24h" && !cross) return (asset.intraday_24h || []).map(p => ({ time:p.time, close:finite(p.close) })).filter(p => p.close !== null);
    const rows = (asset.daily || []).map(p => ({ time:p.time || p.date, close:finite(p.close) })).filter(p => p.close !== null && p.time);
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
    if (rows.length < 2) return { change:null, volatility:null, drawdown:null };
    const first = rows[0].close, last = rows[rows.length - 1].close;
    const change = first ? ((last / first) - 1) * 100 : null;
    const returns = [];
    let peak = rows[0].close, maxDd = 0;
    for (let i=1;i<rows.length;i++) {
      const prev = rows[i-1].close, cur = rows[i].close;
      if (prev && cur) returns.push(((cur / prev) - 1) * 100);
      if (cur > peak) peak = cur;
      if (peak > 0) maxDd = Math.min(maxDd, ((cur / peak) - 1) * 100);
    }
    let volatility = null;
    if (returns.length > 1) {
      const mean = returns.reduce((a,b)=>a+b,0) / returns.length;
      volatility = Math.sqrt(returns.reduce((a,b)=>a + Math.pow(b-mean,2),0) / (returns.length-1));
    }
    return { change, volatility, drawdown:maxDd };
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

  function renderRail(domain, cfg, payload, rowsByAsset, metricByAsset) {
    const rail = detail(); if (!rail) return;
    const ranked = [...metricByAsset].filter(x => x.metric.change !== null).sort((a,b)=>b.metric.change-a.metric.change);
    const leader = ranked[0], laggard = ranked[ranked.length-1];
    const math = ENABLE_MATH && ranked.length ? `
      <section class="atlas-parallel-math"><b>Math Core · historique mesuré</b>
        <div class="atlas-parallel-math-grid">
          <span><small>Leader</small><strong>${safeText(leader.asset.symbol || leader.asset.name)} ${leader.metric.change>=0?"+":""}${leader.metric.change.toFixed(2)} %</strong></span>
          <span><small>Retard</small><strong>${safeText(laggard.asset.symbol || laggard.asset.name)} ${laggard.metric.change>=0?"+":""}${laggard.metric.change.toFixed(2)} %</strong></span>
          <span><small>Dispersion</small><strong>${(leader.metric.change-laggard.metric.change).toFixed(2)} pt</strong></span>
          <span><small>Prévision</small><strong>AUCUNE</strong></span>
        </div>
      </section>` : "";
    rail.innerHTML = `
      <header><span class="eyebrow">DÉTAIL ACTIF</span><strong>Lecture ${cfg.title}</strong><small>Observation seulement · Source Truth publique</small></header>
      <div class="atlas-parallel-detail-state"><span><small>Domaine</small><b>${cfg.label}</b></span><span><small>Couverture</small><b>${payload.assets_count}/${cfg.expected}</b></span><span><small>Source</small><b>${safeText(payload.source || cfg.source)}</b></span><span><small>Build</small><b>${BUILD}</b></span></div>
      <section><b>Lecture synthétique</b><p>${leader ? `Leader ${safeText(leader.asset.name)} ; retard ${safeText(laggard.asset.name)}. Les séries restent indépendantes et sont comparées en Base 100.` : "Données insuffisantes."}</p></section>
      ${math}
      <section><b>Intégrité</b><p>Aucune valeur inventée · aucune moyenne inter-source · aucune exécution · décision humaine uniquement.</p></section>`;
  }

  function render(domain) {
    if (!ensureShell()) return;
    const cfg = CONFIG[domain]; if (!cfg) return;
    const payload = state.data.get(domain); if (!payload) return;
    const period = state.period.get(domain) || cfg.defaultPeriod;
    state.period.set(domain, period);
    document.documentElement.dataset.parallelMarketRuntime = domain;
    document.documentElement.dataset.parallelMarketBuild = BUILD;
    const shell = stage()?.querySelector("[data-parallel-live-shell]"); if (!shell) return;
    shell.querySelector("[data-parallel-title]").textContent = cfg.title;
    shell.querySelector("[data-parallel-subtitle]").textContent = domain === "cross-market" ? (payload.source_note || "Comparaison transversale Base 100.") : "Cotations publiques et historique conservés séparément · Base 100 pour la comparaison.";
    shell.querySelector("[data-parallel-source]").textContent = safeText(payload.source || cfg.source);
    shell.querySelector("[data-parallel-count]").textContent = `${payload.assets_count}/${cfg.expected}`;
    const buttons = toolbar()?.querySelectorAll("[data-parallel-period]") || [];
    buttons.forEach(b => { const p=b.getAttribute("data-parallel-period"); b.classList.toggle("is-active", p===period); b.disabled = domain==="cross-market" && p==="24h"; });
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
    if (summary) summary.innerHTML = ranked.length ? `<b>${series.length}/${cfg.expected} SÉRIES</b><span>Leader ${safeText(leader.asset.symbol||leader.asset.name)} ${leader.metric.change>=0?"+":""}${leader.metric.change.toFixed(2)} % · retard ${safeText(lag.asset.symbol||lag.asset.name)} ${lag.metric.change>=0?"+":""}${lag.metric.change.toFixed(2)} %</span>` : "Données insuffisantes";
    const legend = shell.querySelector("[data-parallel-legend]");
    if (legend) legend.innerHTML = metricByAsset.map((x,i)=>`<span style="--series:${COLORS[i%COLORS.length]}"><i></i><b>${safeText(x.asset.symbol||x.asset.name)}</b><small>${x.metric.change===null?"—":`${x.metric.change>=0?"+":""}${x.metric.change.toFixed(2)} %`}</small></span>`).join("");
    renderRail(domain,cfg,payload,rowsByAsset,metricByAsset);
    setStatus(domain,cfg,payload);
  }

  function showPending(domain) {
    const cfg = CONFIG[domain]; if (!cfg || !ensureShell()) return;
    const host = stage();
    if (host) host.innerHTML = `<div class="atlas-parallel-pending"><small>ERITH.IA · MARKETS OBSERVATORY</small><h3>${cfg.title}</h3><p>Domaine préparé. Source Truth non activée dans ce build.</p><b>PLANNED · INERT</b></div>`;
    const rail=detail(); if(rail) rail.innerHTML=`<header><span class="eyebrow">DÉTAIL ACTIF</span><strong>Lecture ${cfg.title}</strong><small>Aucune donnée inventée</small></header><section><b>État</b><p>PLANNED · INERT · activation après validation de la source, de l’unité, de l’historique et de la fraîcheur.</p></section>`;
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
      const host=stage(); if(host) host.innerHTML=`<div class="atlas-parallel-pending"><small>${CONFIG[domain].label}</small><h3>Archive indisponible</h3><p>${safeText(error?.message||error)}</p><b>UNKNOWN STATE = STOP</b></div>`;
      const rail=detail(); if(rail) rail.innerHTML=`<header><span class="eyebrow">DÉTAIL ACTIF</span><strong>Lecture ${CONFIG[domain].title}</strong></header><section><b>STOP</b><p>Source publique non lisible. Aucun calcul et aucune décision automatique.</p></section>`;
    }
  }

  document.addEventListener("erith:market-domain-change", event => sync(event?.detail?.domain || document.documentElement.dataset.cyclicMarketDomain || "crypto"));
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => sync(document.documentElement.dataset.cyclicMarketDomain || "crypto"), {once:true});
  else sync(document.documentElement.dataset.cyclicMarketDomain || "crypto");

  globalThis.ErithParallelMarketsRuntime = Object.freeze({ build:BUILD, active:[...ACTIVE], math_core:ENABLE_MATH, periods:PERIODS, source_truth:true, one_shared_surface:true, new_timer:false, new_observer:false, storage_owner:false, orders_allowed:false, refresh:domain=>{state.data.delete(domain);return sync(domain);} });
})();
