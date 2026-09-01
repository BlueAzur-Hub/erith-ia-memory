from pathlib import Path
import json

ROOT = Path('public/agent_crypto_erith_ia/administrator')
INDEX = ROOT / 'index.html'
CSS = ROOT / 'market-cascade.css'
JS = ROOT / 'js/market-stack.js'
VERSION_FILES = [ROOT / 'version.json', ROOT / 'administrator-version.json']

BUILD = '40.4.167'
REVISION = 'R1'
RELEASE = 'TRUE MARKET STACK · CRYPTO THEN METALS COCKPIT PARITY'
STATUS = 'true_market_stack_crypto_then_metals_cockpit_parity'


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly one occurrence, got {count}')
    return text.replace(old, new, 1)


def patch_index():
    t = INDEX.read_text(encoding='utf-8')
    if 'id="atlasMarketCascade404167"' not in t:
        raise SystemExit('40.4.167 cascade shell marker missing')
    start = t.index('    <section class="atlas-market-cascade-404167"')
    next_section = '    <section class="market-ribbon-stack" id="market-workspace"'
    end = t.index(next_section, start)
    t = t[:start] + t[end:]

    t = replace_once(
        t,
        '<meta name="administrator-release" content="MARKET CASCADE SHELL · VERTICAL MULTI-DOMAIN OBSERVATORY FOUNDATION" />',
        f'<meta name="administrator-release" content="{RELEASE}" />',
        'administrator release meta'
    )
    if '<meta name="administrator-revision"' not in t:
        t = replace_once(
            t,
            '<meta name="administrator-build" content="40.4.167" />',
            '<meta name="administrator-build" content="40.4.167" />\n  <meta name="administrator-revision" content="R1" />',
            'administrator revision meta'
        )
    t = replace_once(
        t,
        './market-cascade.css?v=administrator-build-40.4.167',
        './market-cascade.css?v=administrator-build-40.4.167R1',
        'market stack css token'
    )

    script_tag = '  <script src="./js/market-stack.js?v=administrator-build-40.4.167R1"></script>\n'
    if script_tag not in t:
        t = replace_once(t, '</body>', script_tag + '</body>', 'market stack script load')

    INDEX.write_text(t, encoding='utf-8')


def write_js():
    JS.write_text(r'''(() => {
  "use strict";

  const BUILD = "40.4.167";
  const REVISION = "R1";
  const CONTRACT = "TRUE_MARKET_STACK_404167R1";

  function wakeMetalsOnce(stack) {
    if (!stack || stack.dataset.metalsWakeRequested === "1") return;
    stack.dataset.metalsWakeRequested = "1";
    const demand = globalThis.AtlasParallelMarketDemand40465;
    if (typeof demand?.ensure === "function") {
      Promise.resolve(demand.ensure()).catch(() => {});
    }
  }

  function installMetalsDemandGate(stack) {
    if (!stack) return;
    if (!("IntersectionObserver" in globalThis)) {
      wakeMetalsOnce(stack);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      wakeMetalsOnce(stack);
    }, { rootMargin: "900px 0px" });
    observer.observe(stack);
  }

  function keepCryptoAsPrimaryDomain(stack) {
    const marketSwitch = document.getElementById("atlasMarketDomainSwitch");
    if (!marketSwitch) return;

    try {
      if (String(marketSwitch.dataset.domain || "crypto") !== "crypto") marketSwitch.click();
    } catch (_) {}

    marketSwitch.dataset.trueMarketStack404167R1 = "crypto-primary";
    marketSwitch.setAttribute("aria-label", "Marché Crypto principal. Cliquer pour descendre au cockpit Métaux.");
    marketSwitch.title = "Voir le cockpit Métaux plus bas";

    marketSwitch.addEventListener("click", event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      stack?.scrollIntoView?.({ behavior: "smooth", block: "start" });
      wakeMetalsOnce(stack);
    }, true);
  }

  function buildStack() {
    if (document.getElementById("atlasTrueMarketStackMetals404167R1")) return;

    const cryptoDeck = document.getElementById("analyste");
    const cryptoRibbons = document.getElementById("market-workspace");
    const foundation = document.getElementById("atlasParallelMarketFoundation");
    const metalsDetail = document.getElementById("atlasMetalsDetailPanel");
    const metalsToolbar = document.getElementById("atlasMetalsUnifiedToolbar");
    const metalsStatus = document.getElementById("atlasMetalsDomainStatus");

    if (!cryptoDeck || !cryptoRibbons || !foundation || !metalsDetail || !metalsToolbar) {
      document.documentElement.dataset.trueMarketStack404167R1 = "missing-owner";
      return;
    }

    document.getElementById("atlasMarketCascade404167")?.remove();

    const stack = document.createElement("section");
    stack.className = "atlas-true-market-stack-metals-404167r1";
    stack.id = "atlasTrueMarketStackMetals404167R1";
    stack.dataset.marketDomain = "metals";
    stack.dataset.marketStackBuild = BUILD;
    stack.dataset.marketStackRevision = REVISION;
    stack.setAttribute("aria-label", "Cockpit Métaux précieux et industriels");
    stack.innerHTML = `
      <header class="atlas-true-market-stack-head-404167r1">
        <div class="atlas-true-market-stack-title-404167r1">
          <span class="atlas-true-market-stack-domain-404167r1">MARCHÉ <b>MÉTAUX</b></span>
          <div>
            <small>ERITH.IA · MARKETS OBSERVATORY · 02</small>
            <strong>Métaux précieux et industriels</strong>
          </div>
        </div>
        <div class="atlas-true-market-stack-toolbar-404167r1" id="atlasTrueMarketStackToolbar404167R1"></div>
      </header>
      <div class="atlas-true-market-stack-grid-404167r1">
        <div class="atlas-true-market-stack-chart-404167r1" id="atlasTrueMarketStackChart404167R1"></div>
        <div class="atlas-true-market-stack-detail-404167r1" id="atlasTrueMarketStackDetail404167R1"></div>
      </div>
      <footer class="atlas-true-market-stack-foot-404167r1">
        <span>02 · MÉTAUX · XAU / XAG / XPT / XPD / HG</span>
        <small>Gold API · Yahoo Finance Futures · BCE · USGS / IEA / RMIS · observation uniquement</small>
      </footer>`;

    cryptoRibbons.insertAdjacentElement("afterend", stack);

    const toolbarHost = stack.querySelector("#atlasTrueMarketStackToolbar404167R1");
    const chartHost = stack.querySelector("#atlasTrueMarketStackChart404167R1");
    const detailHost = stack.querySelector("#atlasTrueMarketStackDetail404167R1");

    toolbarHost.appendChild(metalsToolbar);
    chartHost.appendChild(foundation);
    if (metalsStatus) chartHost.appendChild(metalsStatus);
    detailHost.appendChild(metalsDetail);

    metalsToolbar.hidden = false;
    foundation.hidden = false;
    metalsDetail.hidden = false;
    if (metalsStatus) metalsStatus.hidden = false;

    document.documentElement.dataset.trueMarketStack404167R1 = "ready";
    document.documentElement.dataset.marketStackPrimary = "crypto";
    document.documentElement.dataset.marketStackSecondary = "metals";

    keepCryptoAsPrimaryDomain(stack);
    installMetalsDemandGate(stack);

    requestAnimationFrame(() => {
      foundation.hidden = false;
      metalsDetail.hidden = false;
      metalsToolbar.hidden = false;
      if (metalsStatus) metalsStatus.hidden = false;
    });

    globalThis.ErithTrueMarketStack404167R1 = Object.freeze({
      build: BUILD,
      revision: REVISION,
      contract: CONTRACT,
      crypto_owner_reused: "#analyste",
      metals_chart_owner_reused: "#atlasParallelMarketFoundation / #atlasMetalsChartCanvas",
      metals_detail_owner_reused: "#atlasMetalsDetailPanel",
      metals_demand_owner_reused: "AtlasParallelMarketDemand40465.ensure",
      second_chart_engine_created: false,
      new_market_fetch_owner: false,
      recurring_observer: false,
      stack: () => document.getElementById("atlasTrueMarketStackMetals404167R1")
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildStack, { once: true });
  } else {
    buildStack();
  }
})();
''', encoding='utf-8')


def write_css():
    CSS.write_text(r'''/* 40.4.167R1 — TRUE MARKET STACK + Firefox 100% viewport fit.
   Crypto remains the first canonical cockpit. Existing Metals owners are physically
   re-homed below it; no canvas, chart engine, market fetcher or storage owner is cloned. */
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

/* Old 40.4.167 roadmap cards are retired from the visual path. */
#atlasMarketCascade404167{display:none!important}

.atlas-true-market-stack-metals-404167r1{
  position:relative;
  min-width:0;
  max-width:100%;
  margin:10px 0 12px;
  padding:10px;
  border:1px solid rgba(232,199,102,.28);
  border-radius:22px;
  background:linear-gradient(180deg,rgba(8,18,30,.96),rgba(5,14,24,.94));
  box-shadow:inset 0 0 0 1px rgba(255,222,145,.045),0 18px 48px rgba(0,0,0,.17);
  scroll-margin-top:8px;
  overflow:hidden;
}
.atlas-true-market-stack-metals-404167r1::before{
  content:"";
  position:absolute;
  inset:0 auto 0 0;
  width:3px;
  background:linear-gradient(180deg,#f1d273,#bd824a 62%,transparent);
  pointer-events:none;
}
.atlas-true-market-stack-head-404167r1{
  display:grid;
  grid-template-columns:minmax(250px,.75fr) minmax(0,1.7fr);
  align-items:center;
  gap:12px;
  min-width:0;
  min-height:58px;
  padding:5px 8px 9px 12px;
}
.atlas-true-market-stack-title-404167r1{display:flex;align-items:center;gap:12px;min-width:0}
.atlas-true-market-stack-domain-404167r1{
  flex:0 0 auto;
  display:inline-flex;
  gap:5px;
  align-items:center;
  padding:9px 12px;
  border:1px solid rgba(232,199,102,.42);
  border-radius:999px;
  color:#b9c8d5;
  font-size:10px;
  font-weight:900;
  letter-spacing:.05em;
  background:rgba(55,39,15,.34);
}
.atlas-true-market-stack-domain-404167r1 b{color:#f0d577}
.atlas-true-market-stack-title-404167r1 small{display:block;color:#7392a8;font-size:9px;font-weight:850;letter-spacing:.14em}
.atlas-true-market-stack-title-404167r1 strong{display:block;margin-top:3px;color:#f4f1e8;font-size:16px;line-height:1.15}
.atlas-true-market-stack-toolbar-404167r1{min-width:0;justify-self:end;width:100%}

.atlas-true-market-stack-grid-404167r1{
  display:grid;
  grid-template-columns:minmax(0,1fr) minmax(300px,360px);
  gap:10px;
  min-width:0;
  align-items:stretch;
}
.atlas-true-market-stack-chart-404167r1,
.atlas-true-market-stack-detail-404167r1{min-width:0;max-width:100%}

/* Existing Metals toolbar becomes the true cockpit toolbar instead of replacing Crypto. */
.atlas-true-market-stack-metals-404167r1 #atlasMetalsUnifiedToolbar,
.atlas-true-market-stack-metals-404167r1 #atlasMetalsUnifiedToolbar[hidden]{
  display:flex!important;
  position:relative!important;
  inset:auto!important;
  width:100%!important;
  max-width:100%!important;
  min-width:0!important;
  margin:0!important;
  justify-content:flex-end!important;
}

/* Existing Metals chart owner: same hero tension as Crypto, without the old nested-card feeling. */
.atlas-true-market-stack-metals-404167r1 #atlasParallelMarketFoundation,
.atlas-true-market-stack-metals-404167r1 #atlasParallelMarketFoundation[hidden]{
  display:block!important;
  position:relative!important;
  inset:auto!important;
  width:100%!important;
  max-width:100%!important;
  min-width:0!important;
  height:auto!important;
  margin:0!important;
  padding:10px!important;
  transform:none!important;
  border-radius:18px!important;
  box-sizing:border-box!important;
}
.atlas-true-market-stack-metals-404167r1 .atlas-parallel-market-head{
  min-height:0!important;
  margin:0 0 7px!important;
  padding:4px 5px 7px!important;
}
.atlas-true-market-stack-metals-404167r1 .atlas-parallel-market-head h3{
  margin:2px 0!important;
  font-size:17px!important;
  line-height:1.15!important;
}
.atlas-true-market-stack-metals-404167r1 .atlas-parallel-market-head p{
  margin:2px 0 0!important;
  font-size:10px!important;
  line-height:1.3!important;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.atlas-true-market-stack-metals-404167r1 .atlas-metals-empty-chart{
  min-width:0!important;
  width:100%!important;
  margin:0!important;
  border-radius:15px!important;
}
.atlas-true-market-stack-metals-404167r1 .atlas-metals-empty-chart-stage{
  height:520px!important;
  min-height:520px!important;
  max-height:520px!important;
}
.atlas-true-market-stack-metals-404167r1 #atlasMetalsChartCanvas{
  width:100%!important;
  max-width:100%!important;
}
.atlas-true-market-stack-metals-404167r1 .atlas-metals-basket,
.atlas-true-market-stack-metals-404167r1 .atlas-metals-graph-market-note,
.atlas-true-market-stack-metals-404167r1 .atlas-parallel-market-foot{
  min-width:0!important;
  max-width:100%!important;
}

/* Existing Metals detail owner becomes the right rail, parallel to Lecture technique. */
.atlas-true-market-stack-metals-404167r1 #atlasMetalsDetailPanel,
.atlas-true-market-stack-metals-404167r1 #atlasMetalsDetailPanel[hidden]{
  display:block!important;
  position:relative!important;
  inset:auto!important;
  width:100%!important;
  min-width:0!important;
  max-width:100%!important;
  height:100%!important;
  min-height:640px!important;
  margin:0!important;
  overflow:auto!important;
  border-radius:18px!important;
  box-sizing:border-box!important;
}
.atlas-true-market-stack-metals-404167r1 #atlasMetalsDomainStatus,
.atlas-true-market-stack-metals-404167r1 #atlasMetalsDomainStatus[hidden]{
  display:flex!important;
  min-width:0!important;
  max-width:100%!important;
  margin:7px 2px 0!important;
}
.atlas-true-market-stack-foot-404167r1{
  display:flex;
  justify-content:space-between;
  gap:12px;
  min-width:0;
  padding:8px 7px 2px 12px;
  color:#7895a9;
  font-size:10px;
}
.atlas-true-market-stack-foot-404167r1 span{color:#dfc676;font-weight:850}
.atlas-true-market-stack-foot-404167r1 small{min-width:0;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* Future domains remain contract-only. No visible roadmap block until their real cockpit exists. */
.atlas-future-market-anchor-404167r1{display:none!important}

@media(max-width:1180px){
  .atlas-true-market-stack-grid-404167r1{grid-template-columns:minmax(0,1fr) minmax(280px,330px)}
  .atlas-true-market-stack-head-404167r1{grid-template-columns:1fr}
  .atlas-true-market-stack-toolbar-404167r1{justify-self:stretch}
}
@media(max-width:900px){
  .atlas-true-market-stack-grid-404167r1{grid-template-columns:1fr}
  .atlas-true-market-stack-metals-404167r1 .atlas-metals-empty-chart-stage{height:440px!important;min-height:440px!important;max-height:440px!important}
  .atlas-true-market-stack-metals-404167r1 #atlasMetalsDetailPanel{min-height:0!important;max-height:none!important}
  .atlas-true-market-stack-foot-404167r1{flex-direction:column}
  .atlas-true-market-stack-foot-404167r1 small{text-align:left;white-space:normal}
}
@media(max-width:620px){
  body.atlas-administrator-mirror .shell{width:calc(100% - 12px)!important;max-width:calc(100% - 12px)!important}
  .atlas-true-market-stack-title-404167r1{align-items:flex-start;flex-direction:column}
  .atlas-true-market-stack-metals-404167r1 .atlas-metals-empty-chart-stage{height:360px!important;min-height:360px!important;max-height:360px!important}
}
''', encoding='utf-8')


def patch_versions():
    for p in VERSION_FILES:
        d = json.loads(p.read_text(encoding='utf-8'))
        if d.get('build') != BUILD:
            raise SystemExit(f'{p}: expected build {BUILD}, got {d.get("build")}')
        d['revision'] = REVISION
        d['release'] = RELEASE
        d['status'] = STATUS
        d['parent_build'] = '40.4.167'
        d.setdefault('contracts', {})['true_market_stack_404167r1'] = {
            'order': ['crypto', 'metals', 'indices', 'energy_commodities', 'cross_market'],
            'visible_now': ['crypto', 'metals'],
            'crypto_owner_reused': '#analyste + #mainChart + #detailPanel',
            'metals_chart_owner_reused': '#atlasParallelMarketFoundation + #atlasMetalsChartCanvas',
            'metals_detail_owner_reused': '#atlasMetalsDetailPanel',
            'metals_demand_owner_reused': 'globalThis.AtlasParallelMarketDemand40465.ensure',
            'old_vertical_roadmap_cards_retired': True,
            'future_domains_visible_only_when_real_cockpit_exists': True,
            'metals_one_shot_near_viewport_wake': True,
            'second_chart_engine_created': False,
            'new_market_fetch_owner': False,
            'new_storage_owner': False,
            'recurring_observer': False,
            'market_core_changed': False,
            'firefox_100_percent_viewport_fit_preserved': True
        }
        lineage = d.get('lineage', '')
        marker = '40.4.167R1 True Market Stack'
        if marker not in lineage:
            d['lineage'] = lineage + ' → 40.4.167R1 True Market Stack: old roadmap-card cascade retired; existing Metals canvas/detail owners re-homed below Crypto with one-shot demand wake and cockpit geometry parity; no duplicate engine or source.'
        p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def validate():
    idx = INDEX.read_text(encoding='utf-8')
    css = CSS.read_text(encoding='utf-8')
    js = JS.read_text(encoding='utf-8')
    if 'atlasMarketCascade404167' in idx:
        raise SystemExit('old visible cascade shell still present in index')
    if 'market-stack.js?v=administrator-build-40.4.167R1' not in idx:
        raise SystemExit('true market stack script not loaded')
    if 'market-cascade.css?v=administrator-build-40.4.167R1' not in idx:
        raise SystemExit('true market stack css token not loaded')
    if 'atlasTrueMarketStackMetals404167R1' not in js:
        raise SystemExit('metals stack owner missing')
    if 'appendChild(foundation)' not in js or 'appendChild(metalsDetail)' not in js:
        raise SystemExit('existing Metals owners are not re-homed')
    if 'new Chart' in js or 'fetch(' in js:
        raise SystemExit('forbidden new chart/fetch detected in stack runtime')
    if 'IntersectionObserver' not in js or 'observer.disconnect()' not in js:
        raise SystemExit('one-shot Metals demand gate missing')
    if 'calc(100% - 18px)' not in css:
        raise SystemExit('Firefox viewport fit lock missing')
    if 'grid-template-columns:minmax(0,1fr) minmax(300px,360px)' not in css:
        raise SystemExit('Metals cockpit parity grid missing')
    if 'height:520px!important' not in css:
        raise SystemExit('Metals hero graph height lock missing')
    for p in VERSION_FILES:
        d = json.loads(p.read_text(encoding='utf-8'))
        assert d['build'] == BUILD
        assert d['revision'] == REVISION
        assert d['status'] == STATUS
        c = d['contracts']['true_market_stack_404167r1']
        assert c['second_chart_engine_created'] is False
        assert c['new_market_fetch_owner'] is False


def main():
    patch_index()
    write_js()
    write_css()
    patch_versions()
    validate()


if __name__ == '__main__':
    main()
