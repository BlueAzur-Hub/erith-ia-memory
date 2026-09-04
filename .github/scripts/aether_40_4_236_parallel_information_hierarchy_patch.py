#!/usr/bin/env python3
from pathlib import Path
import re

BASE = Path('public/agent_crypto_erith_ia/administrator')
JS = BASE / 'js/parallel-markets.js'
CSS = BASE / 'market-visual-master-parity.css'
INDEX = BASE / 'index.html'
SYSTEM = BASE / 'js/views/system-presentation.js'

js = JS.read_text(encoding='utf-8')
css = CSS.read_text(encoding='utf-8')
index = INDEX.read_text(encoding='utf-8')
system = SYSTEM.read_text(encoding='utf-8')

def one(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 occurrence, got {count}')
    return text.replace(old, new, 1)

def sub1(text, pattern, replacement, label):
    out, count = re.subn(pattern, replacement, text, count=1)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 regex occurrence, got {count}')
    return out

js = one(js, 'const BUILD = "40.4.235";', 'const BUILD = "40.4.236";', 'parallel BUILD')

# Remove the redundant five-cell status row introduced in 40.4.228.
status_block = '''          <div class="atlas-parallel-cockpit-status-404228" aria-label="Contexte du graphique parallèle">\n            <span><small>LECTURE</small><b>BASE 100</b></span>\n            <span><small>FENÊTRE ACTIVE</small><b data-parallel-window>—</b></span>\n            <span><small>SOURCE</small><b data-parallel-status-source>—</b></span>\n            <span><small>COUVERTURE</small><b data-parallel-status-count>0/0</b></span>\n            <span><small>VÉRITÉ</small><b>HISTORIQUE RÉEL</b></span>\n          </div>\n'''
js = one(js, status_block, '', 'redundant cockpit status row')

# Rail basket remains the asset selector, but no longer duplicates value/change data already owned by the HUD.
old_basket_row = '''      return `<li${selectedId===assetId?' class="is-selected"':""}>${depthActive?`<button type="button" data-parallel-asset="${esc(assetId)}" title="Ouvrir la fiche ${esc(name)}">`:"<span>"}<span><b>${esc(symbol)}</b><small>${esc(name)}</small></span><strong>${esc(value)}${unit ? ` ${esc(unit)}` : ""}</strong><em>${esc(change)}</em>${depthActive?"</button>":"</span>"}</li>`;'''
new_basket_row = '''      return `<li${selectedId===assetId?' class="is-selected"':""}>${depthActive?`<button type="button" data-parallel-asset="${esc(assetId)}" title="Sélectionner ${esc(name)}">`:"<span>"}<span><b>${esc(symbol)}</b><small>${esc(name)}</small></span>${depthActive?"</button>":"</span>"}</li>`;'''
js = one(js, old_basket_row, new_basket_row, 'rail basket selector row')
js = one(js, '<section class="atlas-parallel-basket-404189"><b>Panier actif · ${esc(state.period.get(domain) || cfg.defaultPeriod)}</b><ul>${basket || "<li>Données insuffisantes.</li>"}</ul></section>', '<section class="atlas-parallel-basket-404189 atlas-parallel-asset-selector-404236"><b>Sélection actif · ${esc(state.period.get(domain) || cfg.defaultPeriod)}</b><ul>${basket || "<li>Données insuffisantes.</li>"}</ul></section>', 'rail basket section role')

# Left readout becomes a light synthesis. Series identity moves into it; the separate full legend is retired.
old_summary = '''    const summary = shell.querySelector("[data-parallel-summary]");\n    if (summary) summary.innerHTML = ranked.length ? `<b>${series.length}/${cfg.expected} SÉRIES</b><span>Leader ${esc(leader.asset.symbol||leader.asset.name)} ${pct(leader.metric.change)} · retard ${esc(lag.asset.symbol||lag.asset.name)} ${pct(lag.metric.change)}</span>` : "Données insuffisantes";\n    const legend = shell.querySelector("[data-parallel-legend]");\n    if (legend) legend.innerHTML = metricByAsset.map(x=>`<span style="--series:${x.color}"><i></i><b>${esc(x.asset.symbol||x.asset.name)}</b><small>${pct(x.metric.change)}</small></span>`).join("");'''
new_summary = '''    const summary = shell.querySelector("[data-parallel-summary]");\n    if (summary) {\n      const identities = metricByAsset.map(x=>`<span style="--series:${x.color}"><i></i><b>${esc(x.asset.symbol||x.asset.name)}</b></span>`).join("");\n      summary.innerHTML = ranked.length ? `<b>${series.length}/${cfg.expected}</b><span>Leader ${esc(leader.asset.symbol||leader.asset.name)} ${pct(leader.metric.change)} · retard ${esc(lag.asset.symbol||lag.asset.name)} ${pct(lag.metric.change)}</span><span class="atlas-parallel-summary-assets-404236">${identities}</span>` : "Données insuffisantes";\n    }\n    const legend = shell.querySelector("[data-parallel-legend]");\n    if (legend) { legend.replaceChildren(); legend.hidden = true; }'''
js = one(js, old_summary, new_summary, 'summary + legend hierarchy')
js = one(js, '    values_hud_crypto_panel_parity:true,', '    values_hud_crypto_panel_parity:true,\n    information_hierarchy_single_table:true,\n    redundant_status_row_removed:true,\n    rail_selector_values_removed:true,', 'runtime hierarchy flags')

marker = '40.4.236 — PARALLEL INFORMATION HIERARCHY LOCK'
if marker in css:
    raise SystemExit('40.4.236 CSS already present')
css += r'''

/* =========================================================
   40.4.236 — PARALLEL INFORMATION HIERARCHY LOCK
   One numeric table inside the graph: VALEURS OBSERVÉES.
   Left = light synthesis + series identity. Right rail = context + selector.
   Existing geometry, renderer, data, Base 100, histories and Market Core stay owned elsewhere.
   ========================================================= */
html[data-cyclic-market-mode="parallel"] .atlas-parallel-cockpit-status-404228{
  display:none!important;
}

html[data-cyclic-market-mode="parallel"] .atlas-parallel-live-summary{
  min-height:34px!important;
  padding:6px 9px!important;
  gap:9px!important;
  border-left-width:2px!important;
  max-width:min(760px,calc(100% - 52px))!important;
  background:linear-gradient(100deg,rgba(3,13,23,.88),rgba(5,19,29,.74))!important;
  box-shadow:0 8px 20px rgba(0,0,0,.18),inset 0 0 0 1px rgba(255,255,255,.018)!important;
}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-live-summary>b{
  font-size:12px!important;
  color:#fff0c9!important;
  white-space:nowrap;
}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-live-summary>span:not(.atlas-parallel-summary-assets-404236){
  color:#9eb2bf!important;
  font-size:8px!important;
  font-weight:800!important;
  white-space:nowrap;
}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-summary-assets-404236{
  display:flex!important;
  align-items:center!important;
  gap:7px!important;
  min-width:0!important;
  margin-left:auto!important;
  overflow:hidden!important;
}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-summary-assets-404236>span{
  display:flex!important;
  align-items:center!important;
  gap:4px!important;
  min-width:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  box-shadow:none!important;
  white-space:nowrap!important;
}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-summary-assets-404236 i{
  width:6px!important;
  height:6px!important;
  border-radius:50%!important;
  background:var(--series,#fff)!important;
  box-shadow:0 0 7px color-mix(in srgb,var(--series,#fff) 52%,transparent)!important;
}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-summary-assets-404236 b{
  color:#cbd8df!important;
  font-size:7px!important;
  font-weight:900!important;
}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-live-legend{
  display:none!important;
}

html[data-cyclic-market-mode="parallel"] .atlas-parallel-asset-selector-404236 ul{
  display:flex!important;
  flex-wrap:wrap!important;
  gap:5px!important;
  margin-top:7px!important;
}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-asset-selector-404236 li{
  flex:1 1 92px!important;
  min-width:0!important;
  padding:5px 7px!important;
  border-radius:9px!important;
  background:rgba(1,9,16,.42)!important;
}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-asset-selector-404236 li>button{
  display:block!important;
  width:100%!important;
  min-width:0!important;
}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-asset-selector-404236 li>button>span,
html[data-cyclic-market-mode="parallel"] .atlas-parallel-asset-selector-404236 li>span>span{
  display:grid!important;
  gap:1px!important;
  min-width:0!important;
}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-asset-selector-404236 li b{
  color:#e9f1f5!important;
  font-size:8px!important;
}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-asset-selector-404236 li small{
  color:#7e95a4!important;
  font-size:7px!important;
  white-space:nowrap!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
}

@media(max-width:1100px){
  html[data-cyclic-market-mode="parallel"] .atlas-parallel-live-summary{
    flex-wrap:wrap!important;
  }
  html[data-cyclic-market-mode="parallel"] .atlas-parallel-summary-assets-404236{
    width:100%!important;
    margin-left:0!important;
  }
}
'''

# Cache-bust the three owners touched/validated by this release.
index = sub1(index, r'(\./parallel-markets\.css)(?:\?v=[^"\']*)?', r'\1?v=40.4.236', 'parallel css token')
index = sub1(index, r'(\./market-visual-master-parity\.css)(?:\?v=[^"\']*)?', r'\1?v=40.4.236', 'visual master css token')
index = sub1(index, r'(\./js/parallel-markets\.js)(?:\?v=[^"\']*)?', r'\1?v=administrator-build-40.4.236', 'parallel js token')
index = sub1(index, r'(\./js/views/system-presentation\.js)(?:\?v=[^"\']*)?', r'\1?v=administrator-build-40.4.236', 'system loader token')
system = sub1(system, r'(\./views/system\.html\?v=administrator-build-)40\.4\.235', r'\g<1>40.4.236', 'system source token')

JS.write_text(js, encoding='utf-8')
CSS.write_text(css, encoding='utf-8')
INDEX.write_text(index, encoding='utf-8')
SYSTEM.write_text(system, encoding='utf-8')
print('PARALLEL_INFORMATION_HIERARCHY_PATCH_PASS')
