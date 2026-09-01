from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path("public/agent_crypto_erith_ia/administrator")
APP = ROOT / "app.js"
JSAPP = ROOT / "js/app.js"
INDEX = ROOT / "index.html"
CONTRACT = ROOT / "js/markets-domain-contract.js"
ARCH = ROOT / "architecture/markets-domain-canonical.json"
VERSION = ROOT / "version.json"
ADMIN_VERSION = ROOT / "administrator-version.json"
CSS = ROOT / "market-cascade.css"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def replace_once(text: str, pattern: str, repl: str, label: str, flags=0) -> str:
    out, count = re.subn(pattern, repl, text, count=1, flags=flags)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one replacement, got {count}")
    return out


def contract_text(build: str, revision: str, cascade: bool) -> str:
    cascade_block = ""
    if cascade:
        cascade_block = r'''

  const MARKET_CASCADE = Object.freeze({
    build: "40.4.167",
    state: "PRESENTATION_SHELL_ONLY",
    order: Object.freeze(["crypto","metals","indices","commodities","cross-market"]),
    floors: Object.freeze({
      crypto: Object.freeze({state:"ACTIVE",runtime:"existing Market Core 38.15.11"}),
      metals: Object.freeze({state:"ACTIVE_DEMAND",runtime:"AtlasParallelMarketDemand40465.ensure"}),
      indices: Object.freeze({state:"PLANNED_INERT"}),
      commodities: Object.freeze({state:"PLANNED_INERT"}),
      cross_market: Object.freeze({state:"WAITING_VALIDATED_DOMAINS"})
    }),
    shell_visible_does_not_mean_runtime_active: true,
    existing_crypto_engine_reused: true,
    existing_metals_engine_reused: true,
    second_chart_engine_created: false,
    future_domain_fetches: 0,
    new_network_owner: false,
    new_timer: false,
    new_observer: false,
    new_listener: false,
    new_storage_owner: false,
    snapshot() {
      return Object.freeze({
        build: "40.4.167",
        shell_count: document.querySelectorAll("#atlasMarketCascade404167 [data-domain]").length,
        shell_present: Boolean(document.getElementById("atlasMarketCascade404167")),
        contract_build: document.documentElement.dataset.marketsDomainContractBuild || ""
      });
    }
  });
  globalThis.ErithMarketCascade404167 = MARKET_CASCADE;
'''
    return f'''(() => {{
  "use strict";
  const BUILD = "{build}";
  const REVISION = "{revision}";

  const METALS_FOUNDATION = Object.freeze({{
    build: "40.4.164",
    canonical_revision: "40.4.166R1",
    state: "CANONICAL_EXISTING_RUNTIME",
    routing_owner: "app.js::atlasParallelMarketSetDomain + atlasParallelMarketInit",
    demand_owner: "globalThis.AtlasParallelMarketDemand40465.ensure",
    archive_root: "../data/metals/",
    symbols: Object.freeze(["XAU","XAG","XPT","XPD","HG"]),
    asset_ids: Object.freeze(["gold","silver","platinum","palladium","copper"]),
    current_quote_source: "Gold API public archive",
    history_source: "Yahoo Finance Futures public archive",
    eur_conversion: "ECB indicative only",
    structural_sources: Object.freeze(["USGS","IEA","RMIS","World Bank"]),
    current_quote_and_futures_history_separate: true,
    structural_data_never_replaces_market_quote: true,
    crypto_cache_reuse_forbidden: true,
    fabricated_values_forbidden: true,
    observation_only: true,
    default_crypto_boot_metals_dormant: true,
    market_core_changed: false,
    new_network_owner: false,
    new_timer: false,
    new_observer: false,
    new_storage_owner: false
  }});
  globalThis.ErithMetalsFoundation404164 = METALS_FOUNDATION;

  const METALS_MULTI_HORIZON = Object.freeze({{
    build: "40.4.165",
    canonical_revision: "40.4.166R1",
    state: "CANONICAL_EXISTING_ENGINE",
    owner: "app.js::atlasMetalsQuoteFoundationHorizonReading + atlasMetalsQuoteFoundationRenderAnalysisHorizons",
    horizons: Object.freeze([
      Object.freeze({{id:"24h",hours:24,series:"Yahoo Finance Futures intraday",interval:"5m",measured:true}}),
      Object.freeze({{id:"7d",days:7,series:"Yahoo Finance Futures daily",measured:true}}),
      Object.freeze({{id:"30d",days:30,series:"Yahoo Finance Futures daily",measured:true}}),
      Object.freeze({{id:"90d",days:90,series:"Yahoo Finance Futures daily",measured:true}}),
      Object.freeze({{id:"1y",days:365,series:"Yahoo Finance Futures daily",measured:true}})
    ]),
    current_quote_excluded_from_historical_return_path: true,
    spot_futures_mix_forbidden: true,
    sample_count_must_be_visible: true,
    source_period_and_units_preserved: true,
    no_new_calculation_engine: true,
    no_new_fetch: true,
    no_new_timer: true,
    market_core_changed: false,
    audit() {{
      const demand = globalThis.AtlasParallelMarketDemand40465;
      return Object.freeze({{
        build: BUILD,
        revision: REVISION,
        demand_owner_available: typeof demand?.ensure === "function",
        dom_horizons: Object.freeze([...document.querySelectorAll("[data-metals-analysis-horizon]")].map(node => Number(node.dataset.metalsAnalysisHorizon)).filter(Number.isFinite))
      }});
    }}
  }});
  globalThis.ErithMetalsMultiHorizon404165 = METALS_MULTI_HORIZON;

  const PARALLEL_MARKETS_ROUTER = Object.freeze({{
    build: BUILD,
    revision: REVISION,
    state: "CANONICAL_FACADE_OVER_EXISTING_PARALLEL_MARKET_RUNTIME",
    routing_owner: "app.js::atlasParallelMarketSetDomain + atlasParallelMarketInit",
    metals_demand_owner: "globalThis.AtlasParallelMarketDemand40465.ensure",
    active_domains: Object.freeze({{
      crypto: Object.freeze({{id:"crypto",state:"ACTIVE",engine:"Market Core 38.15.11",data_scope:"crypto only"}}),
      metals: Object.freeze({{id:"metals",state:"ACTIVE_DEMAND",engine:"existing Parallel Markets / Metals runtime",data_scope:"metals only"}})
    }}),
    future_domains: Object.freeze({{
      indices: Object.freeze({{id:"indices",state:"PLANNED_INERT"}}),
      energy: Object.freeze({{id:"energy",state:"PLANNED_INERT"}}),
      commodities: Object.freeze({{id:"commodities",state:"PLANNED_INERT"}}),
      cross_market: Object.freeze({{id:"cross_market",state:"PLANNED_INERT"}})
    }}),
    separation: Object.freeze({{
      crypto_state_is_authority_for_crypto: true,
      metals_state_is_authority_for_metals: true,
      cross_domain_cache_reuse_forbidden: true,
      source_truth_kept_per_domain: true,
      no_cross_domain_average: true,
      no_automatic_financial_action: true
    }}),
    readiness() {{
      return Object.freeze({{
        crypto: true,
        metals_router: typeof globalThis.atlasParallelMarketInit === "function",
        metals_demand_owner: typeof globalThis.AtlasParallelMarketDemand40465?.ensure === "function",
        indices: false,
        energy: false,
        commodities: false,
        cross_market: false
      }});
    }},
    direct_reinitialize_forbidden: true,
    second_engine_created: false,
    new_network_owner: false,
    new_timer: false,
    new_observer: false,
    new_storage_owner: false
  }});
  globalThis.ErithParallelMarketsRouter404166 = PARALLEL_MARKETS_ROUTER;{cascade_block}

  document.documentElement.dataset.marketsDomainContractBuild = BUILD;
  document.documentElement.dataset.marketsDomainContractRevision = REVISION;
}})();
'''


def phase_r1():
    for p in (VERSION, ADMIN_VERSION):
        d = load_json(p)
        if d.get("build") != "40.4.166":
            raise SystemExit(f"{p}: expected build 40.4.166, got {d.get('build')}")

    status = load_json(Path("public/agent_crypto_erith_ia/data/metals/status.json"))
    assert status.get("assets_received") == 5
    assert status.get("intraday_24h", {}).get("available") is True
    assert status.get("intraday_24h", {}).get("source_id") == "yahoo_finance"

    app_text = APP.read_text(encoding="utf-8")
    for token in ("AtlasParallelMarketDemand40465", "function atlasParallelMarketInit", "atlasParallelMarketSetDomain"):
        if token not in app_text:
            raise SystemExit(f"historical owner missing: {token}")

    CONTRACT.write_text(contract_text("40.4.166", "R1", False), encoding="utf-8")

    arch = load_json(ARCH)
    arch["revision"] = "R1"
    arch["release"] = "PARALLEL MARKETS TRUTH SEAL · DEMAND OWNER + 24H INTRADAY PROVENANCE LOCK"
    arch["contracts"]["metals_foundation"].update({
        "canonical_revision": "40.4.166R1",
        "routing_owner": "atlasParallelMarketSetDomain + atlasParallelMarketInit",
        "demand_owner": "AtlasParallelMarketDemand40465.ensure",
        "default_crypto_boot_metals_dormant": True,
    })
    arch["contracts"]["multi_horizon"].update({
        "canonical_revision": "40.4.166R1",
        "horizons": ["24h", "7d", "30d", "90d", "1y"],
        "intraday_24h_series": "Yahoo Finance Futures intraday 5m",
        "intraday_24h_currently_available": True,
    })
    arch["contracts"]["parallel_router"].update({
        "canonical_revision": "40.4.166R1",
        "routing_owner": "atlasParallelMarketSetDomain + atlasParallelMarketInit",
        "metals_demand_owner": "AtlasParallelMarketDemand40465.ensure",
        "direct_reinitialize_forbidden": True,
    })
    arch["collector_provenance"] = {
        "collector_manifest_version": "2.3.0",
        "legacy_build_target": "28.2.67",
        "meaning": "collector lineage metadata only; never Administrator build identity",
        "administrator_identity_owner": "administrator/version.json + administrator-version.json",
    }
    save_json(ARCH, arch)

    for p in (VERSION, ADMIN_VERSION):
        d = load_json(p)
        d["revision"] = "R1"
        d["release"] = "PARALLEL MARKETS TRUTH SEAL · DEMAND OWNER + 24H INTRADAY PROVENANCE LOCK"
        d["status"] = "parallel_markets_truth_seal_404166r1"
        d.setdefault("contracts", {})["parallel_markets_truth_404166r1"] = {
            "routing_owner": "app.js::atlasParallelMarketSetDomain + atlasParallelMarketInit",
            "metals_demand_owner": "globalThis.AtlasParallelMarketDemand40465.ensure",
            "direct_reinitialize_forbidden": True,
            "default_crypto_boot_metals_dormant": True,
            "metals_intraday_24h": "Yahoo Finance Futures 5m · available",
            "collector_legacy_build_target_28_2_67_is_not_admin_identity": True,
            "market_core_changed": False,
            "new_fetch": False,
            "new_timer": False,
            "new_observer": False,
            "new_storage_owner": False,
        }
        if "40.4.166R1" not in d.get("lineage", ""):
            d["lineage"] = d.get("lineage", "") + " → 40.4.166R1 Parallel Markets truth seal: Metals demand-owner restored as canonical load path; 24h Futures intraday truth recorded; direct router reinitialization forbidden."
        save_json(p, d)


def viewport_css() -> str:
    return r'''/* 40.4.167 — Market Cascade Shell + Firefox 100% Viewport Fit Lock.
   Presentation only. The 100% fix deliberately uses the layout viewport rather
   than 100vw so Firefox's vertical scrollbar gutter cannot clip the right edge. */
body.atlas-administrator-mirror .shell{
  width:min(1660px,calc(100% - 18px))!important;
  max-width:calc(100% - 18px)!important;
  min-width:0!important;
  margin-left:auto!important;
  margin-right:auto!important;
}
body.atlas-administrator-mirror .shell>*{
  min-width:0!important;
  max-width:100%!important;
}
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
.atlas-market-cascade-404167{min-width:0;max-width:100%;margin:18px 0 22px;padding:14px;border:1px solid rgba(78,211,220,.28);border-radius:22px;background:linear-gradient(180deg,rgba(7,20,34,.94),rgba(5,14,25,.9));box-shadow:0 18px 48px rgba(0,0,0,.18);overflow:hidden}
.atlas-market-cascade-head-404167{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;padding:4px 6px 14px;min-width:0}.atlas-market-cascade-head-404167>div{min-width:0}.atlas-market-cascade-head-404167 span{display:block;font-size:11px;letter-spacing:.22em;font-weight:900;color:#77dce4}.atlas-market-cascade-head-404167 h2{margin:5px 0 0;font-size:24px;color:#f6f3e9}.atlas-market-cascade-head-404167 p{margin:0;max-width:680px;text-align:right;color:#9fb3c7;font-size:12px;line-height:1.45}
.atlas-market-cascade-grid-404167{display:grid;gap:10px;min-width:0}.atlas-market-floor-404167{position:relative;display:grid;grid-template-columns:62px minmax(0,.7fr) minmax(0,1.5fr) auto;align-items:center;gap:14px;min-width:0;min-height:88px;padding:12px 14px;border:1px solid rgba(118,151,178,.2);border-radius:17px;background:linear-gradient(100deg,rgba(14,27,43,.94),rgba(10,20,34,.8));overflow:hidden}.atlas-market-floor-404167::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--market-floor-accent,#6edce7)}.atlas-market-floor-index-404167{display:grid;place-items:center;width:48px;height:48px;border:1px solid color-mix(in srgb,var(--market-floor-accent,#6edce7) 55%,transparent);border-radius:15px;color:var(--market-floor-accent,#6edce7);font-size:16px;font-weight:950}.atlas-market-floor-copy-404167,.atlas-market-floor-contract-404167{min-width:0}.atlas-market-floor-copy-404167 small{display:block;color:#809bb1;font-size:10px;letter-spacing:.16em;font-weight:850;text-transform:uppercase}.atlas-market-floor-copy-404167 b{display:block;margin-top:4px;color:#f1f5f7;font-size:17px}.atlas-market-floor-contract-404167{color:#a9bbca;font-size:12px;line-height:1.45}.atlas-market-floor-state-404167{justify-self:end;white-space:nowrap;padding:7px 10px;border:1px solid rgba(126,158,185,.25);border-radius:999px;color:#b6c6d3;font-size:10px;font-weight:900;letter-spacing:.06em}.atlas-market-floor-404167[data-state="active"] .atlas-market-floor-state-404167{border-color:color-mix(in srgb,var(--market-floor-accent) 45%,transparent);color:var(--market-floor-accent)}.atlas-market-floor-404167[data-state="inert"]{opacity:.72}.atlas-market-floor-404167[data-domain="crypto"]{--market-floor-accent:#64dde8}.atlas-market-floor-404167[data-domain="metals"]{--market-floor-accent:#e8c766}.atlas-market-floor-404167[data-domain="indices"]{--market-floor-accent:#aa91ee}.atlas-market-floor-404167[data-domain="commodities"]{--market-floor-accent:#e79b57}.atlas-market-floor-404167[data-domain="cross-market"]{--market-floor-accent:#e7edf4}
.atlas-market-cascade-rule-404167{margin:11px 5px 1px;color:#7894aa;font-size:10px;letter-spacing:.04em}.atlas-market-cascade-rule-404167 b{color:#82d7de}
@media(max-width:900px){.atlas-market-cascade-head-404167{align-items:flex-start;flex-direction:column}.atlas-market-cascade-head-404167 p{text-align:left}.atlas-market-floor-404167{grid-template-columns:50px minmax(0,1fr) auto}.atlas-market-floor-contract-404167{grid-column:2/-1}.atlas-market-floor-index-404167{width:42px;height:42px}.atlas-market-floor-state-404167{align-self:start}}
@media(max-width:620px){body.atlas-administrator-mirror .shell{width:calc(100% - 12px)!important;max-width:calc(100% - 12px)!important}.atlas-market-floor-404167{grid-template-columns:44px minmax(0,1fr)}.atlas-market-floor-state-404167{grid-column:2;justify-self:start}.atlas-market-floor-contract-404167{grid-column:1/-1}.atlas-market-cascade-head-404167 h2{font-size:20px}}
'''


def cascade_shell() -> str:
    return r'''

    <section class="atlas-market-cascade-404167"
             id="atlasMarketCascade404167"
             aria-labelledby="atlasMarketCascadeTitle404167"
             data-market-cascade-build="40.4.167">
      <header class="atlas-market-cascade-head-404167">
        <div>
          <span>ERITH.IA · MARKETS OBSERVATORY · CASCADE</span>
          <h2 id="atlasMarketCascadeTitle404167">Marchés parallèles · architecture verticale</h2>
        </div>
        <p>Les domaines validés conservent leurs moteurs actuels. Les futurs étages restent inertes jusqu’à validation de leurs sources, unités, historiques et replis.</p>
      </header>
      <div class="atlas-market-cascade-grid-404167">
        <article class="atlas-market-floor-404167" data-domain="crypto" data-state="active">
          <span class="atlas-market-floor-index-404167">01</span><div class="atlas-market-floor-copy-404167"><small>Domaine canonique</small><b>Crypto</b></div><div class="atlas-market-floor-contract-404167">Market Core 38.15.11 · graphique, Market, Oracle et historiques existants · aucune duplication.</div><span class="atlas-market-floor-state-404167">ACTIF · RÉSIDENT</span>
        </article>
        <article class="atlas-market-floor-404167" data-domain="metals" data-state="active">
          <span class="atlas-market-floor-index-404167">02</span><div class="atlas-market-floor-copy-404167"><small>Domaine canonique à la demande</small><b>Métaux</b></div><div class="atlas-market-floor-contract-404167">XAU · XAG · XPT · XPD · HG · Gold API + Yahoo Futures + BCE · runtime lourd uniquement sur demande.</div><span class="atlas-market-floor-state-404167">ACTIF · DEMAND</span>
        </article>
        <article class="atlas-market-floor-404167" data-domain="indices" data-state="inert">
          <span class="atlas-market-floor-index-404167">03</span><div class="atlas-market-floor-copy-404167"><small>Prochain domaine</small><b>Indices / Bourse</b></div><div class="atlas-market-floor-contract-404167">Emplacement réservé. Aucun symbole, fournisseur, historique ou graphique n’est activé avant audit Source Truth.</div><span class="atlas-market-floor-state-404167">PLANNED · INERT</span>
        </article>
        <article class="atlas-market-floor-404167" data-domain="commodities" data-state="inert">
          <span class="atlas-market-floor-index-404167">04</span><div class="atlas-market-floor-copy-404167"><small>Domaine futur</small><b>Énergie & matières premières</b></div><div class="atlas-market-floor-contract-404167">Pétrole, gaz et denrées uniquement après qualification des unités, marchés, licences, historique et fraîcheur.</div><span class="atlas-market-floor-state-404167">PLANNED · INERT</span>
        </article>
        <article class="atlas-market-floor-404167" data-domain="cross-market" data-state="inert">
          <span class="atlas-market-floor-index-404167">05</span><div class="atlas-market-floor-copy-404167"><small>Couche transversale finale</small><b>Cross-Market Observatory</b></div><div class="atlas-market-floor-contract-404167">Base 100 et mesures comparables au-dessus de domaines déjà validés · aucune moyenne inter-source ni donnée synthétique.</div><span class="atlas-market-floor-state-404167">WAITING · DOMAINS</span>
        </article>
      </div>
      <p class="atlas-market-cascade-rule-404167"><b>Règle 40.4.167 :</b> shell visible ≠ moteur actif · aucun nouveau Chart.js · aucun nouveau fetch · aucune collecte de domaine futur.</p>
    </section>
'''


def phase_167():
    # Existing runtime identities only; business logic remains untouched.
    t = APP.read_text(encoding="utf-8")
    t = replace_once(t, r'const ATLAS_BUILD = "40\.4\.166";', 'const ATLAS_BUILD = "40.4.167";', "ATLAS_BUILD")
    if 'const ATLAS_RELEASE = ' in t:
        t = replace_once(t, r'const ATLAS_RELEASE = "[^"]*";', 'const ATLAS_RELEASE = "Market Core V2.0-Alpha · Build 40.4.167";', "ATLAS_RELEASE")
    APP.write_text(t, encoding="utf-8")

    t = JSAPP.read_text(encoding="utf-8")
    t = replace_once(t, r'const ADMIN_BUILD = "40\.4\.166";', 'const ADMIN_BUILD = "40.4.167";', "ADMIN_BUILD")
    t = replace_once(t, r'const ADMIN_RELEASE = "[^"]*";', 'const ADMIN_RELEASE = "MARKET CASCADE SHELL · VERTICAL MULTI-DOMAIN OBSERVATORY FOUNDATION";', "ADMIN_RELEASE")
    JSAPP.write_text(t, encoding="utf-8")

    html = INDEX.read_text(encoding="utf-8")
    html = replace_once(html, r'<meta name="atlas-build" content="[^"]*" />', '<meta name="atlas-build" content="40.4.167" />', "meta atlas-build")
    html = replace_once(html, r'<meta name="administrator-build" content="[^"]*" />', '<meta name="administrator-build" content="40.4.167" />', "meta administrator-build")
    html = replace_once(html, r'<meta name="administrator-release" content="[^"]*" />', '<meta name="administrator-release" content="MARKET CASCADE SHELL · VERTICAL MULTI-DOMAIN OBSERVATORY FOUNDATION" />', "meta administrator-release")
    html = replace_once(html, r'<meta name="atlas-asset-token" content="[^"]*" />', '<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.4.167" />', "meta asset token")
    html = replace_once(html, r'<title>Agent-Crypto @erith\.IA — Build [^<]+</title>', '<title>Agent-Crypto @erith.IA — Build 40.4.167 · Administrator</title>', "title")
    html = html.replace("administrator-build-40.4.166", "administrator-build-40.4.167")
    # Static footer/display occurrences only.
    html = html.replace("Build 40.4.166", "Build 40.4.167")

    css_link = '  <link rel="stylesheet" href="./market-cascade.css?v=administrator-build-40.4.167" />'
    if "./market-cascade.css" not in html:
        anchor = '  <link rel="stylesheet" href="./admin-visual-cache.css" />'
        if anchor not in html:
            raise SystemExit("CSS insertion anchor missing")
        html = html.replace(anchor, anchor + "\n" + css_link, 1)

    if 'id="atlasMarketCascade404167"' not in html:
        anchor = '    <section class="market-ribbon-stack" id="market-workspace" aria-label="Bandeaux marché V2">'
        if anchor not in html:
            raise SystemExit("cascade insertion anchor missing")
        html = html.replace(anchor, cascade_shell() + "\n" + anchor, 1)
    INDEX.write_text(html, encoding="utf-8")

    CSS.write_text(viewport_css(), encoding="utf-8")
    CONTRACT.write_text(contract_text("40.4.167", "MARKET_CASCADE_SHELL", True), encoding="utf-8")

    arch = load_json(ARCH)
    arch["build"] = "40.4.167"
    arch["parent_build"] = "40.4.166R1"
    arch.pop("revision", None)
    arch["release"] = "MARKET CASCADE SHELL · VERTICAL MULTI-DOMAIN OBSERVATORY FOUNDATION"
    arch["market_cascade"] = {
        "canonical_from": "40.4.167",
        "order": ["crypto", "metals", "indices", "commodities", "cross-market"],
        "crypto": "ACTIVE_EXISTING_ENGINE",
        "metals": "ACTIVE_EXISTING_DEMAND_ENGINE",
        "indices": "PLANNED_INERT",
        "commodities": "PLANNED_INERT",
        "cross_market": "WAITING_VALIDATED_DOMAINS",
        "shell_visible_does_not_mean_runtime_active": True,
        "second_chart_engine_created": False,
        "future_domain_fetches": 0,
        "firefox_100_percent_viewport_fit": "layout viewport 100% replaces vulnerable 100vw shell ownership",
    }
    save_json(ARCH, arch)

    for p in (VERSION, ADMIN_VERSION):
        d = load_json(p)
        d["build"] = "40.4.167"
        d.pop("revision", None)
        d["parent_build"] = "40.4.166R1"
        d["release"] = "MARKET CASCADE SHELL · VERTICAL MULTI-DOMAIN OBSERVATORY FOUNDATION"
        d["status"] = "market_cascade_shell_vertical_multi_domain_foundation"
        d["asset_token"] = "market-core-v2.0-alpha-build-40.4.167"
        d["global_versioning"] = "40.4.167"
        d.setdefault("contracts", {})["market_cascade_shell_404167"] = {
            "order": ["crypto", "metals", "indices", "commodities", "cross-market"],
            "crypto_engine_reused": True,
            "metals_engine_reused": True,
            "future_domains_inert": True,
            "second_chart_engine_created": False,
            "firefox_100_percent_viewport_fit": True,
            "shell_width_owner": "layout viewport percentage, not 100vw",
            "new_fetch": False,
            "new_timer": False,
            "new_observer": False,
            "new_listener": False,
            "new_storage_owner": False,
            "market_core_changed": False,
        }
        if "40.4.167 Market Cascade Shell" not in d.get("lineage", ""):
            d["lineage"] = d.get("lineage", "") + " → 40.4.167 Market Cascade Shell: vertical five-floor Markets Observatory presentation + Firefox 100% viewport-fit lock; Crypto + Metals owners preserved; Indices/Commodities/Cross-Market remain inert."
        save_json(p, d)


def validate(phase: str):
    for p in (VERSION, ADMIN_VERSION, ARCH):
        load_json(p)
    contract = CONTRACT.read_text(encoding="utf-8")
    if "initializeExistingRouter" in contract:
        raise SystemExit("unsafe direct router initializer still exposed")
    if "AtlasParallelMarketDemand40465.ensure" not in contract:
        raise SystemExit("Metals demand owner missing")
    if phase == "167":
        if load_json(VERSION).get("build") != "40.4.167":
            raise SystemExit("version build mismatch")
        html = INDEX.read_text(encoding="utf-8")
        if html.count('id="atlasMarketCascade404167"') != 1:
            raise SystemExit("cascade shell count mismatch")
        ids = re.findall(r'\bid="([^"]+)"', html)
        if len(ids) != len(set(ids)):
            raise SystemExit("duplicate HTML IDs introduced")
        css = CSS.read_text(encoding="utf-8")
        if "calc(100% - 18px)" not in css or "100vw" in css:
            raise SystemExit("viewport fit lock invalid")
        for token in ("fetch(", "setInterval(", "setTimeout(", "MutationObserver", "addEventListener(", "new Chart("):
            if token in css:
                raise SystemExit(f"behavior token leaked into CSS: {token}")


if __name__ == "__main__":
    if len(sys.argv) != 2 or sys.argv[1] not in {"r1", "167", "validate-r1", "validate-167"}:
        raise SystemExit("usage: script.py r1|167|validate-r1|validate-167")
    arg = sys.argv[1]
    if arg == "r1":
        phase_r1()
    elif arg == "167":
        phase_167()
    elif arg == "validate-r1":
        validate("r1")
    else:
        validate("167")
