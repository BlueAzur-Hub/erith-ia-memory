from pathlib import Path
import json

ROOT = Path('public/agent_crypto_erith_ia/administrator')
INDEX = ROOT / 'index.html'
CSS = ROOT / 'market-cascade.css'
JS = ROOT / 'js/market-stack.js'
VERSION_FILES = [ROOT / 'version.json', ROOT / 'administrator-version.json']

BUILD = '40.4.167'
REVISION = 'R2'
RELEASE = 'CYCLIC MULTI-MARKET ROUTER · ONE-CLICK DOMAIN LOOP'
STATUS = 'cyclic_multi_market_router_one_click_domain_loop'


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly one occurrence, got {count}')
    return text.replace(old, new, 1)


def patch_index():
    t = INDEX.read_text(encoding='utf-8')
    t = replace_once(t,
        '<meta name="administrator-revision" content="R1" />',
        '<meta name="administrator-revision" content="R2" />',
        'administrator revision')
    t = replace_once(t,
        '<meta name="administrator-release" content="TRUE MARKET STACK · CRYPTO THEN METALS COCKPIT PARITY" />',
        f'<meta name="administrator-release" content="{RELEASE}" />',
        'administrator release')
    t = replace_once(t,
        './market-cascade.css?v=administrator-build-40.4.167R1',
        './market-cascade.css?v=administrator-build-40.4.167R2',
        'market css token')
    t = replace_once(t,
        './js/market-stack.js?v=administrator-build-40.4.167R1',
        './js/market-stack.js?v=administrator-build-40.4.167R2',
        'market router js token')
    INDEX.write_text(t, encoding='utf-8')


def write_js():
    JS.write_text(r'''(() => {
  "use strict";

  const BUILD = "40.4.167";
  const REVISION = "R2";
  const CONTRACT = "CYCLIC_MULTI_MARKET_ROUTER_404167R2";
  const ORDER = Object.freeze([
    Object.freeze({ id: "crypto", label: "CRYPTO", title: "Crypto", inert: false, native: "crypto" }),
    Object.freeze({ id: "metals", label: "MÉTAUX", title: "Métaux précieux et industriels", inert: false, native: "metals" }),
    Object.freeze({ id: "indices", label: "INDICES", title: "Indices / Bourse", inert: true, description: "Domaine préparé uniquement. Aucun symbole, fournisseur, historique ou graphique n’est activé avant audit Source Truth." }),
    Object.freeze({ id: "energy", label: "ÉNERGIE", title: "Énergie & matières premières", inert: true, description: "Pétrole, gaz et matières premières restent inertes jusqu’à qualification des unités, marchés, licences, historiques et fraîcheur." }),
    Object.freeze({ id: "cross-market", label: "CROSS", title: "Cross-Market Observatory", inert: true, description: "Couche transversale finale. Base 100 et mesures comparables seulement au-dessus de domaines déjà validés, sans moyenne inter-source ni donnée synthétique." })
  ]);

  let current = "crypto";
  let nativeBypass = false;

  const byId = id => document.getElementById(id);
  const specFor = id => ORDER.find(item => item.id === id) || ORDER[0];
  const indexOf = id => Math.max(0, ORDER.findIndex(item => item.id === id));
  const nextOf = id => ORDER[(indexOf(id) + 1) % ORDER.length];

  function nativeDomain() {
    const button = byId("atlasMarketDomainSwitch");
    return String(button?.dataset?.domain || "crypto") === "metals" ? "metals" : "crypto";
  }

  function ensureHosts() {
    const chartShell = document.querySelector("#analyste .chart-shell");
    const head = document.querySelector("#analyste .chart-v2-recovery-line");
    const metalsDetail = byId("atlasMetalsDetailPanel");
    if (!chartShell || !head || !metalsDetail) return false;

    if (!byId("atlasCyclicMarketInertStage404167R2")) {
      const stage = document.createElement("section");
      stage.id = "atlasCyclicMarketInertStage404167R2";
      stage.className = "atlas-cyclic-market-inert-stage-404167r2";
      stage.hidden = true;
      stage.innerHTML = `
        <div class="atlas-cyclic-market-inert-grid-404167r2" aria-live="polite">
          <div class="atlas-cyclic-market-inert-hero-404167r2">
            <small>ERITH.IA · MARKETS OBSERVATORY</small>
            <h3 data-cyclic-market-title>DOMAINE FUTUR</h3>
            <p data-cyclic-market-description>Aucune donnée active.</p>
            <div class="atlas-cyclic-market-inert-line-404167r2" aria-hidden="true"></div>
          </div>
          <div class="atlas-cyclic-market-inert-gates-404167r2">
            <span><small>SOURCE TRUTH</small><b>NON QUALIFIÉE</b></span>
            <span><small>HISTORIQUE</small><b>NON CONNECTÉ</b></span>
            <span><small>UNITÉS</small><b>À VALIDER</b></span>
            <span><small>MOTEUR</small><b>INERT</b></span>
          </div>
          <footer><b>AUCUN PRIX INVENTÉ</b><span>Le cockpit existe comme emplacement de routage uniquement.</span></footer>
        </div>`;
      chartShell.appendChild(stage);
    }

    if (!byId("atlasCyclicMarketInertToolbar404167R2")) {
      const toolbar = document.createElement("div");
      toolbar.id = "atlasCyclicMarketInertToolbar404167R2";
      toolbar.className = "chart-head-actions atlas-cyclic-market-inert-toolbar-404167r2";
      toolbar.hidden = true;
      toolbar.innerHTML = '<span>DOMAINE FUTUR</span><b data-cyclic-market-toolbar-state>INERT · SOURCE TRUTH REQUISE</b>';
      head.appendChild(toolbar);
    }

    if (!byId("atlasCyclicMarketInertDetail404167R2")) {
      const detail = document.createElement("article");
      detail.id = "atlasCyclicMarketInertDetail404167R2";
      detail.className = "panel glass atlas-cyclic-market-inert-detail-404167r2";
      detail.hidden = true;
      detail.innerHTML = `
        <header><span class="eyebrow">DÉTAIL ACTIF</span><strong data-cyclic-market-detail-title>Marché futur</strong><small>Observation seulement · aucune donnée inventée</small></header>
        <div class="atlas-cyclic-market-inert-detail-state-404167r2"><span><small>État</small><b>PLANNED · INERT</b></span><span><small>Collecte</small><b>AUCUNE</b></span></div>
        <section><b>Conditions d’activation</b><p>Source, unité, historique, fraîcheur, fallback et Source Truth doivent être validés avant activation du domaine.</p></section>
        <section><b>Routeur</b><p data-cyclic-market-detail-next>Cliquer sur MARCHÉ pour continuer la boucle.</p></section>`;
      metalsDetail.insertAdjacentElement("afterend", detail);
    }
    return true;
  }

  function setInertContent(domain) {
    const spec = specFor(domain);
    const stage = byId("atlasCyclicMarketInertStage404167R2");
    const toolbar = byId("atlasCyclicMarketInertToolbar404167R2");
    const detail = byId("atlasCyclicMarketInertDetail404167R2");
    if (!stage || !toolbar || !detail) return;

    stage.querySelector("[data-cyclic-market-title]").textContent = spec.title;
    stage.querySelector("[data-cyclic-market-description]").textContent = spec.description || "Domaine non activé.";
    toolbar.querySelector("[data-cyclic-market-toolbar-state]").textContent = `${spec.label} · INERT · SOURCE TRUTH REQUISE`;
    detail.querySelector("[data-cyclic-market-detail-title]").textContent = spec.title;
    detail.querySelector("[data-cyclic-market-detail-next]").textContent = `Suivant : ${nextOf(domain).title}. Cliquer sur MARCHÉ pour continuer.`;
  }

  function setInertVisible(visible) {
    const stage = byId("atlasCyclicMarketInertStage404167R2");
    const toolbar = byId("atlasCyclicMarketInertToolbar404167R2");
    const detail = byId("atlasCyclicMarketInertDetail404167R2");
    if (stage) stage.hidden = !visible;
    if (toolbar) toolbar.hidden = !visible;
    if (detail) detail.hidden = !visible;
  }

  function updateButton(domain) {
    const button = byId("atlasMarketDomainSwitch");
    const value = byId("atlasMarketDomainSwitchValue");
    if (!button || !value) return;
    const spec = specFor(domain);
    const next = nextOf(domain);
    value.textContent = spec.label;
    button.dataset.cyclicMarketDomain = spec.id;
    button.dataset.cyclicMarketNext = next.id;
    button.setAttribute("aria-label", `Marché ${spec.title}. Cliquer pour afficher ${next.title}.`);
    button.title = `Suivant : ${next.title}`;
  }

  function ensureNativeDomain(target) {
    const button = byId("atlasMarketDomainSwitch");
    if (!button || (target !== "crypto" && target !== "metals")) return;
    if (nativeDomain() === target) return;
    nativeBypass = true;
    try { button.click(); } catch (_) {}
    nativeBypass = false;
  }

  function applyDomain(domain, options = {}) {
    const spec = specFor(domain);
    current = spec.id;
    document.documentElement.dataset.cyclicMarketDomain = spec.id;
    document.documentElement.dataset.cyclicMarketMode = spec.inert ? "inert" : "active";
    document.documentElement.dataset.cyclicMarketRevision = REVISION;

    if (!spec.inert) {
      if (!options.nativeAlreadyHandled) ensureNativeDomain(spec.native);
      setInertVisible(false);
    } else {
      setInertContent(spec.id);
      setInertVisible(true);
    }
    updateButton(spec.id);
  }

  function onMarketSwitchClick(event) {
    if (nativeBypass) return;
    const next = nextOf(current);

    if (current === "crypto" && next.id === "metals") {
      current = "metals";
      document.documentElement.dataset.cyclicMarketDomain = "metals";
      document.documentElement.dataset.cyclicMarketMode = "active";
      setInertVisible(false);
      requestAnimationFrame(() => updateButton("metals"));
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    applyDomain(next.id);
  }

  function init() {
    document.getElementById("atlasTrueMarketStackMetals404167R1")?.remove();
    document.getElementById("atlasMarketCascade404167")?.remove();
    if (!ensureHosts()) {
      document.documentElement.dataset.cyclicMarketRouter404167R2 = "missing-owner";
      return;
    }

    current = nativeDomain();
    const button = byId("atlasMarketDomainSwitch");
    if (!button) return;
    button.dataset.cyclicMarketRouter404167R2 = "bound";
    button.addEventListener("click", onMarketSwitchClick, true);
    applyDomain(current, { nativeAlreadyHandled: true });
    document.documentElement.dataset.cyclicMarketRouter404167R2 = "ready";

    globalThis.ErithCyclicMultiMarketRouter404167R2 = Object.freeze({
      build: BUILD,
      revision: REVISION,
      contract: CONTRACT,
      order: ORDER.map(item => item.id),
      active_domains: ["crypto", "metals"],
      inert_domains: ["indices", "energy", "cross-market"],
      current: () => current,
      next: () => applyDomain(nextOf(current).id),
      go: domain => applyDomain(specFor(domain).id),
      native_crypto_metals_reused: true,
      single_cockpit_surface: true,
      wraparound: true,
      new_chart_engine: false,
      new_fetch_owner: false,
      new_timer: false,
      new_observer: false,
      new_storage_owner: false
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
''', encoding='utf-8')


def write_css():
    CSS.write_text(r'''/* 40.4.167R2 — CYCLIC MULTI-MARKET ROUTER + Firefox 100% viewport fit.
   One cockpit surface, one-click loop: Crypto → Metals → Indices → Energy → Cross-Market → Crypto.
   Crypto/Metals reuse native owners. Future domains are inert presentation only. */
body.atlas-administrator-mirror .shell{
  width:min(1660px,calc(100% - 18px))!important;
  max-width:calc(100% - 18px)!important;
  min-width:0!important;
  margin-left:auto!important;
  margin-right:auto!important;
}
body.atlas-administrator-mirror .shell>*,
body.atlas-administrator-mirror .atlas-market-zone,
body.atlas-administrator-mirror #analyste,
body.atlas-administrator-mirror #marketWorkspaceGrid,
body.atlas-administrator-mirror .market-workspace-grid,
body.atlas-administrator-mirror #market-workspace,
body.atlas-administrator-mirror #atlasMetalsMathHost,
body.atlas-administrator-mirror #atlasMetalsMarketArea,
body.atlas-administrator-mirror #atlasMetalsAnalysisFoundation{
  min-width:0!important;
  max-width:100%!important;
}
#atlasMarketCascade404167,
#atlasTrueMarketStackMetals404167R1{display:none!important}

/* Native Metals keeps the visual parity work, but remains in the shared cockpit. */
html[data-cyclic-market-domain="metals"] #atlasParallelMarketFoundation{
  width:100%!important;max-width:100%!important;min-width:0!important;
  margin:0!important;padding:10px!important;border-radius:18px!important;box-sizing:border-box!important
}
html[data-cyclic-market-domain="metals"] #atlasParallelMarketFoundation .atlas-parallel-market-head{
  min-height:0!important;margin:0 0 7px!important;padding:4px 5px 7px!important
}
html[data-cyclic-market-domain="metals"] #atlasParallelMarketFoundation .atlas-parallel-market-head h3{
  margin:2px 0!important;font-size:17px!important;line-height:1.15!important
}
html[data-cyclic-market-domain="metals"] #atlasParallelMarketFoundation .atlas-parallel-market-head p{
  margin:2px 0 0!important;font-size:10px!important;line-height:1.3!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis
}
html[data-cyclic-market-domain="metals"] .atlas-metals-empty-chart-stage{
  height:520px!important;min-height:520px!important;max-height:520px!important
}
html[data-cyclic-market-domain="metals"] #atlasMetalsChartCanvas{width:100%!important;max-width:100%!important}
html[data-cyclic-market-domain="metals"] #atlasMetalsDetailPanel{
  min-width:0!important;max-width:100%!important;min-height:640px!important;box-sizing:border-box!important
}

.atlas-cyclic-market-inert-toolbar-404167r2{
  display:none;align-items:center;justify-content:flex-end;gap:8px;min-width:0
}
.atlas-cyclic-market-inert-toolbar-404167r2 span,
.atlas-cyclic-market-inert-toolbar-404167r2 b{
  padding:7px 10px;border:1px solid rgba(154,174,195,.22);border-radius:999px;background:rgba(9,18,31,.72);font-size:9px;letter-spacing:.08em
}
.atlas-cyclic-market-inert-toolbar-404167r2 span{color:#91a8bb}.atlas-cyclic-market-inert-toolbar-404167r2 b{color:var(--cyclic-market-accent,#b4c2cf)}

.atlas-cyclic-market-inert-stage-404167r2{display:none!important;position:absolute;inset:0;z-index:29;padding:14px;border-radius:15px;box-sizing:border-box;background:linear-gradient(180deg,rgba(4,12,22,.992),rgba(7,18,30,.985));border:1px solid color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 32%,transparent);overflow:hidden}
.atlas-cyclic-market-inert-grid-404167r2{display:grid;grid-template-rows:minmax(0,1fr) auto auto;gap:12px;height:100%;min-height:0}
.atlas-cyclic-market-inert-hero-404167r2{position:relative;display:grid;place-content:center;justify-items:center;text-align:center;min-height:0;padding:30px;border:1px solid rgba(255,255,255,.055);border-radius:16px;background:radial-gradient(circle at 50% 46%,color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 13%,transparent),transparent 43%),linear-gradient(180deg,rgba(255,255,255,.018),rgba(255,255,255,.005));overflow:hidden}
.atlas-cyclic-market-inert-hero-404167r2 small{font-size:9px;letter-spacing:.18em;font-weight:900;color:#7892a8}
.atlas-cyclic-market-inert-hero-404167r2 h3{margin:10px 0 8px;font-size:28px;color:#f0f3f5;letter-spacing:.01em}
.atlas-cyclic-market-inert-hero-404167r2 p{max-width:680px;margin:0;color:#9db0c0;font-size:12px;line-height:1.55}
.atlas-cyclic-market-inert-line-404167r2{width:min(520px,76%);height:2px;margin-top:28px;background:linear-gradient(90deg,transparent,var(--cyclic-market-accent,#a9b9c7),transparent);box-shadow:0 0 24px color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 38%,transparent)}
.atlas-cyclic-market-inert-gates-404167r2{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.atlas-cyclic-market-inert-gates-404167r2 span{display:grid;gap:3px;padding:10px 12px;border:1px solid rgba(255,255,255,.075);border-radius:12px;background:rgba(255,255,255,.025)}
.atlas-cyclic-market-inert-gates-404167r2 small{font-size:8px;letter-spacing:.11em;color:#6f879b}.atlas-cyclic-market-inert-gates-404167r2 b{font-size:10px;color:#c1ccd5}
.atlas-cyclic-market-inert-grid-404167r2 footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 4px 2px;color:#7f98ab;font-size:10px}.atlas-cyclic-market-inert-grid-404167r2 footer b{color:var(--cyclic-market-accent,#b9c5cf)}

.atlas-cyclic-market-inert-detail-404167r2{display:none!important;min-width:0;min-height:640px;padding:14px!important;overflow:auto!important}
.atlas-cyclic-market-inert-detail-404167r2 header{padding:2px 2px 14px;border-bottom:1px solid rgba(255,255,255,.09)}
.atlas-cyclic-market-inert-detail-404167r2 header strong{display:block;margin:5px 0;color:#f0f3f5;font-size:19px}.atlas-cyclic-market-inert-detail-404167r2 header small{color:#7f98ab;font-size:10px}
.atlas-cyclic-market-inert-detail-state-404167r2{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}.atlas-cyclic-market-inert-detail-state-404167r2 span,.atlas-cyclic-market-inert-detail-404167r2 section{padding:11px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(255,255,255,.025)}
.atlas-cyclic-market-inert-detail-state-404167r2 small{display:block;color:#6f879b;font-size:8px;text-transform:uppercase;letter-spacing:.1em}.atlas-cyclic-market-inert-detail-state-404167r2 b{display:block;margin-top:4px;color:var(--cyclic-market-accent,#becbd4);font-size:10px}.atlas-cyclic-market-inert-detail-404167r2 section{margin-top:8px}.atlas-cyclic-market-inert-detail-404167r2 section>b{color:#d9e3ea;font-size:11px}.atlas-cyclic-market-inert-detail-404167r2 section p{margin:6px 0 0;color:#92a8b8;font-size:10px;line-height:1.5}

html[data-cyclic-market-domain="indices"]{--cyclic-market-accent:#aa91ee}
html[data-cyclic-market-domain="energy"]{--cyclic-market-accent:#e79b57}
html[data-cyclic-market-domain="cross-market"]{--cyclic-market-accent:#dce5ec}

html[data-cyclic-market-mode="inert"] #analyste .chart-v2-toolbar,
html[data-cyclic-market-mode="inert"] #atlasMetalsUnifiedToolbar{display:none!important}
html[data-cyclic-market-mode="inert"] #atlasCyclicMarketInertToolbar404167R2{display:flex!important}
html[data-cyclic-market-mode="inert"] #analyste .chart-shell>*:not(#atlasCyclicMarketInertStage404167R2){display:none!important}
html[data-cyclic-market-mode="inert"] #atlasCyclicMarketInertStage404167R2{display:block!important}
html[data-cyclic-market-mode="inert"] #detailPanel,
html[data-cyclic-market-mode="inert"] #atlasMetalsDetailPanel{display:none!important}
html[data-cyclic-market-mode="inert"] #atlasCyclicMarketInertDetail404167R2{display:block!important}
html[data-cyclic-market-mode="inert"] #market-workspace,
html[data-cyclic-market-mode="inert"] #atlasMetalsMathHost,
html[data-cyclic-market-mode="inert"] #atlasMetalsMarketArea,
html[data-cyclic-market-mode="inert"] #atlasMetalsAnalysisFoundation,
html[data-cyclic-market-mode="inert"] .atlas-metals-public-report,
html[data-cyclic-market-mode="inert"] .atlas-metals-report{display:none!important}

@media(max-width:900px){
  html[data-cyclic-market-domain="metals"] .atlas-metals-empty-chart-stage{height:440px!important;min-height:440px!important;max-height:440px!important}
  .atlas-cyclic-market-inert-gates-404167r2{grid-template-columns:1fr 1fr}
  .atlas-cyclic-market-inert-detail-404167r2{min-height:0}
}
@media(max-width:620px){
  body.atlas-administrator-mirror .shell{width:calc(100% - 12px)!important;max-width:calc(100% - 12px)!important}
  html[data-cyclic-market-domain="metals"] .atlas-metals-empty-chart-stage{height:360px!important;min-height:360px!important;max-height:360px!important}
  .atlas-cyclic-market-inert-gates-404167r2{grid-template-columns:1fr}
  .atlas-cyclic-market-inert-grid-404167r2 footer{align-items:flex-start;flex-direction:column}
  .atlas-cyclic-market-inert-hero-404167r2 h3{font-size:22px}
}
''', encoding='utf-8')


def patch_manifests():
    contract = {
        'schema': 'erith.admin.cyclic-multi-market-router.v1',
        'build': BUILD,
        'revision': REVISION,
        'domain_order': ['crypto', 'metals', 'indices', 'energy', 'cross-market'],
        'interaction': 'one_click_next_wraparound',
        'single_cockpit_surface': True,
        'active_domains': ['crypto', 'metals'],
        'inert_domains': ['indices', 'energy', 'cross-market'],
        'native_crypto_metals_router_reused': True,
        'r1_true_market_stack_retired': True,
        'viewport_fit_100_percent_preserved': True,
        'market_core_modified': False,
        'new_chart_engine': False,
        'new_fetch': False,
        'new_timer': False,
        'new_observer': False,
        'new_storage_owner': False,
        'future_domain_fake_data_forbidden': True
    }
    for path in VERSION_FILES:
        data = json.loads(path.read_text(encoding='utf-8'))
        if data.get('build') != BUILD:
            raise SystemExit(f'{path}: expected build {BUILD}, got {data.get("build")}')
        data['release'] = RELEASE
        data['status'] = STATUS
        data['revision'] = REVISION
        data['parent_build'] = '40.4.167R1'
        data.setdefault('contracts', {})['cyclic_multi_market_router_404167r2'] = contract
        lineage = str(data.get('lineage') or '')
        marker = '40.4.167R2 cyclic multi-market router one-click domain loop'
        if marker not in lineage:
            data['lineage'] = (lineage + ' → ' + marker).strip(' →')
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def validate():
    index = INDEX.read_text(encoding='utf-8')
    js = JS.read_text(encoding='utf-8')
    css = CSS.read_text(encoding='utf-8')
    required_index = [
        'administrator-revision" content="R2',
        'CYCLIC MULTI-MARKET ROUTER · ONE-CLICK DOMAIN LOOP',
        'market-cascade.css?v=administrator-build-40.4.167R2',
        'market-stack.js?v=administrator-build-40.4.167R2'
    ]
    for token in required_index:
        if token not in index:
            raise SystemExit(f'index validation missing: {token}')
    for token in ['CYCLIC_MULTI_MARKET_ROUTER_404167R2', 'crypto', 'metals', 'indices', 'energy', 'cross-market', 'wraparound: true']:
        if token not in js:
            raise SystemExit(f'js validation missing: {token}')
    for forbidden in ['fetch(', 'setInterval(', 'setTimeout(', 'IntersectionObserver', 'localStorage', 'sessionStorage', 'new Chart(']:
        if forbidden in js:
            raise SystemExit(f'forbidden R2 runtime owner found: {forbidden}')
    if 'data-cyclic-market-mode="inert"' not in css or '100% - 18px' not in css:
        raise SystemExit('css validation failed')
    for path in VERSION_FILES:
        data = json.loads(path.read_text(encoding='utf-8'))
        if data.get('revision') != REVISION or data.get('status') != STATUS:
            raise SystemExit(f'{path}: manifest revision/status mismatch')


patch_index()
write_js()
write_css()
patch_manifests()
validate()
print('40.4.167R2 cyclic router patch prepared and validated')
