from pathlib import Path

base=Path('public/agent_crypto_erith_ia/administrator')
js_p=base/'js/parallel-markets.js'
css_p=base/'parallel-markets.css'
idx_p=base/'index.html'
sys_p=base/'js/views/system-presentation.js'
js=js_p.read_text(encoding='utf-8')
css=css_p.read_text(encoding='utf-8')
idx=idx_p.read_text(encoding='utf-8')
system=sys_p.read_text(encoding='utf-8')

primitives=('fetch(','setInterval(','setTimeout(','MutationObserver(','WebSocket(','requestAnimationFrame(')
before={t:js.count(t) for t in primitives}

def one(text, old, new, label):
    count=text.count(old)
    if count!=1:
        raise SystemExit(f'{label}: expected 1, got {count}')
    return text.replace(old,new,1)

js=one(js,'const BUILD = "40.4.227";','const BUILD = "40.4.228";','parallel BUILD')

old_shell='''        <div class="atlas-parallel-live-shell" data-parallel-live-shell>
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
        </div>'''
new_shell='''        <div class="atlas-parallel-live-shell atlas-parallel-cockpit-404228" data-parallel-live-shell>
          <div class="atlas-parallel-live-heading">
            <div><small>ERITH.IA · MARKETS OBSERVATORY</small><h3 data-parallel-title>Marché</h3><p data-parallel-subtitle>Source Truth publique · observation uniquement.</p></div>
            <div class="atlas-parallel-live-badges"><span data-parallel-source>Source</span><span data-parallel-count>0/0</span></div>
          </div>
          <div class="atlas-parallel-cockpit-status-404228" aria-label="Contexte du graphique parallèle">
            <span><small>LECTURE</small><b>BASE 100</b></span>
            <span><small>FENÊTRE ACTIVE</small><b data-parallel-window>—</b></span>
            <span><small>SOURCE</small><b data-parallel-status-source>—</b></span>
            <span><small>COUVERTURE</small><b data-parallel-status-count>0/0</b></span>
            <span><small>VÉRITÉ</small><b>HISTORIQUE RÉEL</b></span>
          </div>
          <div class="atlas-parallel-live-stage">
            <canvas id="atlasParallelLiveCanvas404170" aria-label="Graphique marché parallèle"></canvas>
            <div class="atlas-parallel-live-overlay" data-parallel-overlay></div>
          </div>
          <div class="atlas-parallel-live-summary" data-parallel-summary>En attente du domaine.</div>
          <div class="atlas-parallel-live-legend" data-parallel-legend></div>
          <div class="atlas-parallel-memory-strip-404228"><span>ESPACE MÉMORISÉ</span><b data-parallel-memory>—</b><small>Source · période · couverture · choix locaux uniquement</small></div>
          <div class="atlas-parallel-truth-strip-404228"><b data-parallel-truth-title>MARCHÉ</b><span data-parallel-truth>Observation historique · aucune prévision</span></div>
        </div>'''
js=one(js,old_shell,new_shell,'parallel shell')

old_toolbar='''        <span class="mirror-group atlas-toolbar-view-404195"><small>VUE</small><button type="button" disabled aria-disabled="true" title="Vue Prix non disponible pour ce domaine">Prix</button><b class="active">Base 100</b></span>
        <span class="mirror-group atlas-toolbar-scale-404195 atlas-toolbar-disabled-slot-404195"><small>ÉCHELLE</small><button type="button" disabled aria-disabled="true" title="Échelle native non disponible pour ce domaine">Normale</button><button type="button" disabled aria-disabled="true" title="Échelle logarithmique non disponible pour ce domaine">Log</button></span>
        <span class="mirror-group atlas-toolbar-section-404195 atlas-toolbar-history-404197"><small>AFFICHER</small><button type="button" data-parallel-long-period="5a" title="Historique long chargé uniquement à la demande">5a</button><button type="button" data-parallel-long-period="10a" title="Historique long chargé uniquement à la demande">10a</button><button type="button" data-parallel-long-period="max" title="Historique MAX hebdomadaire chargé uniquement à la demande">MAX</button></span>
        <span class="mirror-group atlas-toolbar-period-404195 atlas-parallel-periods"><small>PÉRIODE</small>${PERIODS.map(p => `<button type="button" data-parallel-period="${p}">${p}</button>`).join("")}</span>'''
new_toolbar='''        <span class="mirror-group atlas-toolbar-view-404228"><small>VUE</small><b class="active">Base 100</b></span>
        <span class="mirror-group atlas-toolbar-period-404228 atlas-parallel-periods"><small>PÉRIODE</small>${PERIODS.map(p => `<button type="button" data-parallel-period="${p}">${p}</button>`).join("")}</span>
        <span class="mirror-group atlas-toolbar-history-404228"><small>HISTORIQUE</small><button type="button" data-parallel-long-period="5a" title="Historique long chargé uniquement à la demande">5a</button><button type="button" data-parallel-long-period="10a" title="Historique long chargé uniquement à la demande">10a</button><button type="button" data-parallel-long-period="max" title="Historique MAX chargé uniquement à la demande">MAX</button></span>
        <span class="mirror-group atlas-toolbar-inspection-404228"><small>INSPECTION</small><b class="active">Survol</b><span>Valeurs réelles</span></span>'''
js=one(js,old_toolbar,new_toolbar,'parallel toolbar')

old_updates='''    shell.querySelector("[data-parallel-source]").textContent = safeText(payload.source || cfg.source);
    shell.querySelector("[data-parallel-count]").textContent = `${payload.assets_count}/${cfg.expected}`;'''
new_updates='''    const sourceText = safeText(payload.source || cfg.source);
    const coverageText = `${payload.assets_count}/${cfg.expected}`;
    const windowText = period.toUpperCase();
    const snapshotText = dateText(payload.generated_at || payload.updated_at || payload.as_of || payload.timestamp);
    shell.querySelector("[data-parallel-source]").textContent = sourceText;
    shell.querySelector("[data-parallel-count]").textContent = coverageText;
    const windowNode = shell.querySelector("[data-parallel-window]"); if (windowNode) windowNode.textContent = windowText;
    const statusSource = shell.querySelector("[data-parallel-status-source]"); if (statusSource) statusSource.textContent = sourceText;
    const statusCount = shell.querySelector("[data-parallel-status-count]"); if (statusCount) statusCount.textContent = coverageText;
    const memory = shell.querySelector("[data-parallel-memory]"); if (memory) memory.textContent = `${cfg.label} · ${windowText} · Base 100 · ${coverageText} séries`;
    const truthTitle = shell.querySelector("[data-parallel-truth-title]"); if (truthTitle) truthTitle.textContent = `MARCHÉ ${cfg.label}`;
    const truth = shell.querySelector("[data-parallel-truth]"); if (truth) truth.textContent = `${sourceText} · snapshot ${snapshotText} · comparaison Base 100 · aucune prévision`;'''
js=one(js,old_updates,new_updates,'parallel context updates')

old_state='''      <div class="atlas-parallel-detail-state"><span><small>Domaine</small><b>${esc(cfg.label)}</b></span><span><small>Couverture</small><b>${payload.assets_count}/${cfg.expected}</b></span><span><small>Source</small><b>${esc(payload.source || cfg.source)}</b></span><span><small>Module</small><b>${BUILD}</b></span></div>
      <section><b>Lecture synthétique</b><p>${leader ? `Leader ${esc(leader.asset.name)} ; retard ${esc(laggard.asset.name)}. Les séries restent indépendantes et sont comparées en Base 100.` : "Données insuffisantes."}</p></section>'''
new_state='''      <div class="atlas-parallel-detail-state atlas-parallel-detail-state-404228"><span><small>Domaine</small><b>${esc(cfg.label)}</b></span><span><small>Fenêtre active</small><b>${esc((state.period.get(domain) || cfg.defaultPeriod).toUpperCase())}</b></span><span><small>Couverture</small><b>${payload.assets_count}/${cfg.expected}</b></span><span><small>Source</small><b>${esc(payload.source || cfg.source)}</b></span></div>
      <section class="atlas-parallel-rail-context-404228"><b>État des données</b><p>Snapshot ${esc(dateText(payload.generated_at || payload.updated_at || payload.as_of || payload.timestamp))} · historique réel · comparaison Base 100 · aucune interpolation inventée.</p></section>
      <section class="atlas-parallel-rail-decision-404228"><span><small>DÉCISION</small><b>Observer / comparer</b></span><span><small>PRÉVISION</small><b>AUCUNE</b></span></section>
      <section><b>Lecture synthétique</b><p>${leader ? `Leader ${esc(leader.asset.name)} ${pct(leader.metric.change)} ; retard ${esc(laggard.asset.name)} ${pct(laggard.metric.change)}. Les séries restent indépendantes et sont comparées en Base 100.` : "Données insuffisantes."}</p></section>'''
js=one(js,old_state,new_state,'parallel rail state')

after={t:js.count(t) for t in primitives}
if before!=after:
    raise SystemExit(f'primitive drift {before}->{after}')

marker='40.4.228 — PARALLEL MARKETS / FULL COCKPIT PARITY WITH CRYPTO + METALS'
if marker in css:
    raise SystemExit('40.4.228 CSS already present')
css += r'''

/* =========================================================
   40.4.228 — PARALLEL MARKETS / FULL COCKPIT PARITY WITH CRYPTO + METALS
   Presentation and information architecture only. Crypto remains the dynamic
   master; Metals remains the historical/structural reference. Indices, Energy
   and Cross expose their already-existing truth with the same cockpit quality.
   No data, Base 100 math, source, period, history, Atlas or Market Core change.
   ========================================================= */
html[data-cyclic-market-mode="parallel"] .atlas-parallel-cockpit-404228{grid-template-rows:auto minmax(0,1fr) auto auto!important;gap:7px!important;padding:9px!important;background:radial-gradient(circle at 78% 14%,color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 9%,transparent),transparent 32%),linear-gradient(180deg,rgba(3,10,18,.985),rgba(4,15,24,.975))!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.018),0 14px 38px rgba(0,0,0,.18)!important}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-cockpit-status-404228{display:grid;grid-template-columns:.72fr .9fr 1.35fr .8fr 1.05fr;gap:6px;align-items:stretch;min-width:0}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-cockpit-status-404228>span{display:grid;gap:2px;padding:6px 8px;min-width:0;border:1px solid color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 24%,rgba(255,255,255,.07));border-radius:10px;background:linear-gradient(135deg,rgba(255,255,255,.035),rgba(2,11,19,.70))}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-cockpit-status-404228 small{font:900 7px/1.1 system-ui,sans-serif;letter-spacing:.11em;color:#7893a5;white-space:nowrap}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-cockpit-status-404228 b{font:900 9px/1.2 system-ui,sans-serif;color:color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 54%,#f6f2e6);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-live-stage{border-radius:13px!important;border-color:color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 31%,rgba(110,181,214,.15))!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.015),inset 0 0 34px rgba(33,142,190,.038)!important}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-memory-strip-404228,html[data-cyclic-market-mode="parallel"] .atlas-parallel-truth-strip-404228{display:grid;align-items:center;min-width:0;border:1px solid color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 24%,rgba(255,255,255,.06));border-radius:10px;background:rgba(2,12,20,.76);box-sizing:border-box}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-memory-strip-404228{grid-template-columns:auto minmax(0,1fr) auto;gap:10px;padding:6px 10px}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-memory-strip-404228>span{font:950 8px/1 system-ui,sans-serif;letter-spacing:.12em;color:#69e5f1}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-memory-strip-404228>b{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font:850 9px/1.2 system-ui,sans-serif;color:#eef1e8}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-memory-strip-404228>small{font:750 7px/1 system-ui,sans-serif;color:#758d9c;white-space:nowrap}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-truth-strip-404228{grid-template-columns:auto minmax(0,1fr);gap:12px;padding:5px 10px}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-truth-strip-404228>b{font:950 8px/1 system-ui,sans-serif;color:color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 65%,#fff0c9);letter-spacing:.06em;white-space:nowrap}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-truth-strip-404228>span{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font:800 8px/1.2 system-ui,sans-serif;color:#91a7b4}
@media (min-width:901px){html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168{display:grid!important;grid-template-columns:minmax(120px,.72fr) minmax(430px,2.5fr) minmax(190px,.92fr) minmax(190px,.96fr)!important;gap:8px!important;align-items:center!important;min-height:52px!important;padding:4px 8px!important;overflow:visible!important}html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168::before{display:none!important;content:none!important}html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168>.mirror-group{grid-column:auto!important;min-width:0!important;min-height:34px!important;margin:0!important;padding:4px 6px!important;border:1px solid rgba(255,255,255,.055);border-radius:10px;background:linear-gradient(180deg,rgba(255,255,255,.025),rgba(2,10,18,.25));box-sizing:border-box!important}html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168>.mirror-group:nth-of-type(1){display:grid!important;grid-template-columns:auto minmax(58px,1fr)!important;gap:6px!important;align-items:center!important}html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168>.mirror-group:nth-of-type(2){display:grid!important;grid-template-columns:52px repeat(6,minmax(40px,1fr))!important;gap:4px!important;align-items:center!important}html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168>.mirror-group:nth-of-type(3){display:grid!important;grid-template-columns:auto repeat(3,minmax(42px,1fr))!important;gap:4px!important;align-items:center!important;overflow:visible!important}html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168>.mirror-group:nth-of-type(4){display:grid!important;grid-template-columns:auto auto minmax(72px,1fr)!important;gap:6px!important;align-items:center!important}}
html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168 .mirror-group>small{position:static!important;display:block!important;margin:0!important;color:#8198a8!important;font:950 7px/1 system-ui,sans-serif!important;letter-spacing:.11em!important;white-space:nowrap!important}
html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168 button,html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168 .mirror-group>b.active{min-height:26px!important;padding:5px 8px!important;border-radius:999px!important;border:1px solid rgba(255,255,255,.11)!important;background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(4,13,22,.76))!important;color:#b8c8d2!important;font:900 8px/1 system-ui,sans-serif!important;text-align:center!important;box-sizing:border-box!important;white-space:nowrap!important}
html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168 button.is-active,html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168 .mirror-group>b.active{color:#f7fbff!important;border-color:color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 72%,rgba(255,255,255,.18))!important;background:linear-gradient(180deg,color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 25%,rgba(9,22,32,.92)),rgba(5,14,23,.92))!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.035),0 0 12px color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 14%,transparent)!important}
html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168 .atlas-toolbar-inspection-404228>span{padding:5px 7px;border-radius:999px;color:#8298a7;background:rgba(255,255,255,.025);font:800 7px/1 system-ui,sans-serif;white-space:nowrap;text-align:center}
html[data-cyclic-market-mode="parallel"] #atlasParallelDomainRailHost404189,html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketInertDetail404168{padding:12px!important;border-radius:15px!important;background:radial-gradient(circle at 80% 5%,color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 7%,transparent),transparent 30%),linear-gradient(180deg,rgba(4,13,22,.985),rgba(5,17,27,.975))!important}
html[data-cyclic-market-mode="parallel"] #atlasParallelDomainRailHost404189>header,html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketInertDetail404168>header{padding-bottom:10px;margin-bottom:9px;border-bottom:1px solid color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 20%,rgba(255,255,255,.07))}
html[data-cyclic-market-mode="parallel"] #atlasParallelDomainRailHost404189>header strong,html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketInertDetail404168>header strong{display:block;margin:4px 0;color:color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 48%,#fff1d1)!important;font-size:20px!important;line-height:1.05!important}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-detail-state-404228{gap:7px!important;margin:9px 0!important}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-detail-state-404228>span{padding:8px!important;background:linear-gradient(135deg,rgba(255,255,255,.035),rgba(2,11,19,.66))!important;border-color:color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 20%,rgba(255,255,255,.07))!important}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-rail-context-404228,html[data-cyclic-market-mode="parallel"] .atlas-parallel-rail-decision-404228,html[data-cyclic-market-mode="parallel"] .atlas-parallel-math,html[data-cyclic-market-mode="parallel"] .parallel-depth-section,html[data-cyclic-market-mode="parallel"] .parallel-depth-sheet,html[data-cyclic-market-mode="parallel"] .atlas-parallel-basket-404189{margin:8px 0!important;padding:10px!important;border:1px solid color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 18%,rgba(255,255,255,.07))!important;border-radius:11px!important;background:linear-gradient(135deg,rgba(255,255,255,.028),rgba(2,11,19,.48))!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.012)!important}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-rail-context-404228>p{margin:5px 0 0;color:#91a6b5;font-size:9px;line-height:1.45}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-rail-decision-404228{display:grid;grid-template-columns:1fr 1fr;gap:7px}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-rail-decision-404228>span{display:grid;gap:3px;padding:7px;border-radius:9px;background:rgba(0,0,0,.13)}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-rail-decision-404228 small{font:900 7px/1 system-ui,sans-serif;color:#7d94a4;letter-spacing:.1em}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-rail-decision-404228 b{font:900 10px/1.15 system-ui,sans-serif;color:color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 54%,#f5efd9)}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-basket-404189 ul{display:grid;gap:5px;margin-top:7px}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-basket-404189 li{border-radius:9px!important;background:rgba(1,9,16,.56)!important;border-color:rgba(255,255,255,.065)!important}
@media(max-width:900px){html[data-cyclic-market-mode="parallel"] .atlas-parallel-cockpit-404228{grid-template-rows:auto minmax(360px,1fr) auto auto auto!important}html[data-cyclic-market-mode="parallel"] .atlas-parallel-cockpit-status-404228{grid-template-columns:1fr 1fr}html[data-cyclic-market-mode="parallel"] .atlas-parallel-cockpit-status-404228>span:last-child{grid-column:1/-1}html[data-cyclic-market-mode="parallel"] .atlas-parallel-memory-strip-404228{grid-template-columns:1fr;gap:4px}html[data-cyclic-market-mode="parallel"] .atlas-parallel-memory-strip-404228>small{white-space:normal}html[data-cyclic-market-mode="parallel"] .atlas-parallel-truth-strip-404228{grid-template-columns:1fr;gap:4px}html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168{display:flex!important;flex-wrap:wrap!important;gap:6px!important;padding:5px!important}html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168>.mirror-group{flex:1 1 220px!important}}
'''

js_p.write_text(js,encoding='utf-8')
css_p.write_text(css,encoding='utf-8')

for old,new in {
    './parallel-markets.css?v=40.4.227':'./parallel-markets.css?v=40.4.228',
    './js/parallel-markets.js?v=40.4.227':'./js/parallel-markets.js?v=40.4.228',
    'system-presentation.js?v=administrator-build-40.4.227':'system-presentation.js?v=administrator-build-40.4.228'
}.items():
    idx=one(idx,old,new,f'index cache {old}')
idx_p.write_text(idx,encoding='utf-8')

old_source='const SOURCE="./views/system.html?v=administrator-build-40.4.227";'
new_source='const SOURCE="./views/system.html?v=administrator-build-40.4.228";'
system=one(system,old_source,new_source,'System SOURCE')
sys_p.write_text(system,encoding='utf-8')
print('PARALLEL_FULL_COCKPIT_PARITY_PASS')
