from pathlib import Path
import json, re

BASE = Path('public/agent_crypto_erith_ia/administrator')
js_p = BASE / 'js/parallel-markets.js'
css_p = BASE / 'parallel-markets.css'
index_p = BASE / 'index.html'
system_p = BASE / 'js/views/system-presentation.js'
manifest_p = BASE / 'version.json'
retired_p = BASE / 'market-visual-master-parity.css'

js = js_p.read_text(encoding='utf-8')
css = css_p.read_text(encoding='utf-8')
index = index_p.read_text(encoding='utf-8')
system = system_p.read_text(encoding='utf-8')
manifest = json.loads(manifest_p.read_text(encoding='utf-8'))

def one(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 occurrence, got {count}')
    return text.replace(old, new, 1)

# ---------------------------------------------------------------------------
# Parallel renderer: retire the permanent pinned numeric HUD.
# Historical inspection remains pointer-driven and uses real nearest points.
# ---------------------------------------------------------------------------
js = one(js, 'const BUILD = "40.4.236";', 'const BUILD = "40.4.237";', 'parallel BUILD')
pattern = re.compile(r'\n  function renderPinnedCanvasTable\(\) \{.*?\n  \}\n\n  function clearCanvasHover\(\) \{\n    renderPinnedCanvasTable\(\);\n  \}', re.S)
replacement = '''
  /* 40.4.237 — permanent pinned values table retired.
     The graph owns curves + pointer inspection only; numeric context remains
     in the right rail. Leaving the canvas clears the inspection overlay. */
  function clearCanvasHover() {
    emptyCanvasOverlay();
  }'''
js, count = pattern.subn(replacement, js, count=1)
if count != 1:
    raise SystemExit(f'pinned HUD retirement: expected 1 block, got {count}')
if 'renderPinnedCanvasTable' in js:
    raise SystemExit('pinned HUD symbol still resident after retirement')

# ---------------------------------------------------------------------------
# Toolbar topology: exactly three operator groups, matching the protected
# Crypto/Metals slot contract. Long histories live inside PÉRIODE instead of
# creating a fourth auto-placed group.
# ---------------------------------------------------------------------------
toolbar_pattern = re.compile(r'      bar\.innerHTML = `\n.*?`;\n      bar\.addEventListener\("click", event => \{', re.S)
toolbar_html = '''      bar.innerHTML = `
        <span class="mirror-group atlas-toolbar-view-404228"><small>VUE</small><b class="active">Base 100</b></span>
        <span class="mirror-group atlas-toolbar-period-404228 atlas-parallel-periods"><small>PÉRIODE</small>${PERIODS.map(p => `<button type="button" data-parallel-period="${p}">${p}</button>`).join("")}${LONG_PERIODS.map(p => `<button type="button" data-parallel-long-period="${p}" title="Historique long chargé uniquement à la demande">${p === "max" ? "MAX" : p}</button>`).join("")}</span>
        <span class="mirror-group atlas-toolbar-inspection-404228"><small>INSPECTION</small><b class="active">Survol</b><span>Valeurs réelles</span></span>`;
      bar.addEventListener("click", event => {'''
js, count = toolbar_pattern.subn(toolbar_html, js, count=1)
if count != 1:
    raise SystemExit(f'toolbar topology: expected 1 block, got {count}')
if 'atlas-toolbar-history-404228' in js:
    raise SystemExit('legacy fourth toolbar group still resident')

# ---------------------------------------------------------------------------
# Single visual owner: consolidate the useful current presentation in the
# existing parallel-markets.css owner; retire the separate final override file.
# No chart dimensions / data / period semantics are changed here.
# ---------------------------------------------------------------------------
marker = '40.4.237 — PARALLEL CANONICAL OWNER CONSOLIDATION'
if marker in css:
    raise SystemExit('40.4.237 CSS already present')
css += r'''

/* =========================================================
   40.4.237 — PARALLEL CANONICAL OWNER CONSOLIDATION
   One owner only: parallel-markets.css. Crypto/Metals operator slots remain
   the geometry master. No canvas dimension, data, source, history, Math,
   Window Manager or Market Core ownership change.
   ========================================================= */
@media (min-width:901px){
  html[data-cyclic-market-mode="parallel"] .atlas-parallel-live-shell{
    position:relative!important;
    isolation:isolate!important;
    overflow:hidden!important;
    border:1px solid color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 28%,rgba(98,236,255,.14))!important;
    border-radius:16px!important;
    background:linear-gradient(180deg,rgba(2,8,17,.20),rgba(2,8,17,.34)),url("./assets/visual/admin-chart-office.png") center/cover no-repeat!important;
    box-shadow:inset 0 0 0 1px rgba(255,255,255,.022),0 14px 36px rgba(0,0,0,.18)!important;
  }
  html[data-cyclic-market-mode="parallel"] .atlas-parallel-live-heading{display:none!important}
  html[data-cyclic-market-mode="parallel"] .atlas-parallel-live-stage{
    border-radius:13px!important;
    border-color:color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 25%,rgba(98,236,255,.12))!important;
    background:linear-gradient(180deg,rgba(1,7,14,.30),rgba(1,8,15,.16)),radial-gradient(circle at 74% 18%,color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 8%,transparent),transparent 36%)!important;
    box-shadow:inset 0 0 32px rgba(30,150,205,.04)!important;
  }

  /* Protected operator slots: LECTURE | VUE | reserved scale | INSPECTION | PÉRIODE. */
  html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168{
    --atlas-master-label-slot:55px;
    --atlas-master-view-slot:140px;
    --atlas-master-scale-slot:150px;
    --atlas-master-display-slot:250px;
    display:grid!important;
    grid-template-columns:var(--atlas-master-label-slot) var(--atlas-master-view-slot) var(--atlas-master-scale-slot) var(--atlas-master-display-slot) minmax(480px,1fr)!important;
    align-items:center!important;
    width:100%!important;
    min-width:0!important;
    min-height:46px!important;
    padding:5px 8px 5px 0!important;
    border:1px solid rgba(98,236,255,.11)!important;
    border-radius:12px!important;
    background:linear-gradient(180deg,rgba(4,13,24,.76),rgba(2,8,17,.60))!important;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.03),0 7px 18px rgba(0,0,0,.14)!important;
    box-sizing:border-box!important;
    overflow:visible!important;
  }
  html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168::before{
    content:"LECTURE";grid-column:1;align-self:center;justify-self:start;color:#9eb0bd;font:950 8px/1 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;
  }
  html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168 .atlas-toolbar-view-404228{
    grid-column:2!important;display:grid!important;grid-template-columns:42px minmax(72px,1fr)!important;align-items:center!important;gap:4px!important;
  }
  html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168 .atlas-toolbar-inspection-404228{
    grid-column:4!important;display:grid!important;grid-template-columns:64px 58px minmax(70px,1fr)!important;align-items:center!important;gap:4px!important;min-width:0!important;
  }
  html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168 .atlas-toolbar-period-404228{
    grid-column:5!important;display:grid!important;grid-template-columns:52px repeat(9,minmax(31px,1fr))!important;align-items:center!important;gap:4px!important;min-width:0!important;
  }
  html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168 .mirror-group{margin:0!important;min-width:0!important;min-height:30px!important;box-sizing:border-box!important}
  html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168 .mirror-group>small{color:#8ea4b3!important;font-size:7px!important;font-weight:950!important;letter-spacing:.11em!important;white-space:nowrap!important}
  html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168 button,
  html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168 .mirror-group>b{
    min-height:28px!important;padding:5px 7px!important;border-radius:9px!important;border:1px solid rgba(255,255,255,.12)!important;background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(0,0,0,.14))!important;color:#c8d6df!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.03)!important;box-sizing:border-box!important;
  }
  html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168 button.is-active,
  html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168 .mirror-group>b.active{
    color:#f7fbff!important;border-color:color-mix(in srgb,var(--cyclic-market-accent,#d8c07a) 66%,rgba(255,255,255,.16))!important;background:linear-gradient(180deg,color-mix(in srgb,var(--cyclic-market-accent,#d8c07a) 22%,rgba(7,20,32,.86)),rgba(3,10,18,.88))!important;box-shadow:0 0 12px color-mix(in srgb,var(--cyclic-market-accent,#d8c07a) 16%,transparent),inset 0 1px 0 rgba(255,255,255,.05)!important;
  }

  /* One light synthesis, no second table. */
  html[data-cyclic-market-mode="parallel"] .atlas-parallel-live-summary{
    position:absolute!important;z-index:4!important;top:66px!important;left:24px!important;right:auto!important;
    display:flex!important;align-items:center!important;gap:9px!important;
    width:auto!important;max-width:min(760px,calc(100% - 48px))!important;min-height:34px!important;padding:6px 9px!important;
    border:1px solid color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 34%,rgba(255,255,255,.07))!important;border-left:2px solid color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 78%,white)!important;border-radius:11px!important;
    background:linear-gradient(100deg,rgba(3,13,23,.88),rgba(5,19,29,.73))!important;box-shadow:0 8px 20px rgba(0,0,0,.18),inset 0 0 0 1px rgba(255,255,255,.018)!important;pointer-events:none!important;
  }
  html[data-cyclic-market-mode="parallel"] .atlas-parallel-live-summary>b{font-size:12px!important;color:#fff0c9!important;white-space:nowrap!important}
  html[data-cyclic-market-mode="parallel"] .atlas-parallel-live-summary>span:not(.atlas-parallel-summary-assets-404236){color:#9eb2bf!important;font-size:8px!important;font-weight:800!important;white-space:nowrap!important}
  html[data-cyclic-market-mode="parallel"] .atlas-parallel-summary-assets-404236{display:flex!important;align-items:center!important;gap:7px!important;min-width:0!important;margin-left:auto!important;overflow:hidden!important}
  html[data-cyclic-market-mode="parallel"] .atlas-parallel-summary-assets-404236>span{display:flex!important;align-items:center!important;gap:4px!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;white-space:nowrap!important}
  html[data-cyclic-market-mode="parallel"] .atlas-parallel-summary-assets-404236 i{width:6px!important;height:6px!important;border-radius:50%!important;background:var(--series,#fff)!important;box-shadow:0 0 7px color-mix(in srgb,var(--series,#fff) 52%,transparent)!important}
  html[data-cyclic-market-mode="parallel"] .atlas-parallel-summary-assets-404236 b{color:#cbd8df!important;font-size:7px!important;font-weight:900!important}
  html[data-cyclic-market-mode="parallel"] .atlas-parallel-live-legend,
  html[data-cyclic-market-mode="parallel"] .atlas-parallel-cockpit-status-404228{display:none!important}

  /* Right rail owns numeric/context detail; selection remains compact. */
  html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketInertDetail404168{
    padding:13px!important;border-radius:15px!important;background:linear-gradient(180deg,rgba(3,12,22,.94),rgba(3,10,19,.90))!important;border:1px solid color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 28%,rgba(98,236,255,.13))!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.018),0 18px 36px rgba(0,0,0,.20)!important;
  }
  html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketInertDetail404168 header{padding-bottom:10px!important;margin-bottom:10px!important;border-bottom:1px solid rgba(255,255,255,.09)!important}
  html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketInertDetail404168 header strong{font-size:19px!important;line-height:1.05!important;color:color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 42%,#fff0c9)!important}
  html[data-cyclic-market-mode="parallel"] .atlas-parallel-asset-selector-404236 ul{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px!important}
  html[data-cyclic-market-mode="parallel"] .atlas-parallel-asset-selector-404236 li{min-height:0!important;padding:7px 8px!important}

  html[data-cyclic-market-mode="parallel"] .atlas-parallel-memory-strip-404228,
  html[data-cyclic-market-mode="parallel"] .atlas-parallel-truth-strip-404228{
    min-height:34px!important;border-radius:10px!important;border:1px solid rgba(98,236,255,.13)!important;background:linear-gradient(90deg,rgba(3,14,24,.86),rgba(3,10,18,.68))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.018)!important;
  }
}

@media(max-width:1100px){
  html[data-cyclic-market-mode="parallel"] .atlas-parallel-live-summary{flex-wrap:wrap!important}
  html[data-cyclic-market-mode="parallel"] .atlas-parallel-summary-assets-404236{width:100%!important;margin-left:0!important}
}
'''

# ---------------------------------------------------------------------------
# Technical Reading: one framing truth. The repository portraits are complete
# phone-format compositions; legacy COVER rules must not crop them after the
# canonical CONTAIN rule.
# ---------------------------------------------------------------------------
cover_count = index.count('object-fit:cover!important;')
if cover_count != 2:
    raise SystemExit(f'Technical Reading cover conflict: expected 2, got {cover_count}')
index = index.replace('object-fit:cover!important;', 'object-fit:contain!important;')

# Retire the separate final market visual owner from HTML and manifest.
link = '  <link rel="stylesheet" href="./market-visual-master-parity.css?v=40.4.236" data-market-visual-master-parity="true" />\n'
index = one(index, link, '', 'retired market visual owner link')
index = one(index, '<link rel="stylesheet" href="./parallel-markets.css?v=40.4.236" />', '<link rel="stylesheet" href="./parallel-markets.css?v=40.4.237" />', 'parallel css token')
index = one(index, '<script src="./js/parallel-markets.js?v=administrator-build-40.4.236"></script>', '<script src="./js/parallel-markets.js?v=administrator-build-40.4.237"></script>', 'parallel js token')
index = one(index, '<script src="./js/views/system-presentation.js?v=administrator-build-40.4.236"></script>', '<script src="./js/views/system-presentation.js?v=administrator-build-40.4.237"></script>', 'system loader token')
system = one(system, 'const SOURCE="./views/system.html?v=administrator-build-40.4.236";', 'const SOURCE="./views/system.html?v=administrator-build-40.4.237";', 'system source token')

files = manifest.get('files')
if not isinstance(files, dict):
    raise SystemExit('manifest files map missing')
if 'market-visual-master-parity.css' not in files:
    raise SystemExit('retired market visual owner missing from manifest')
files.pop('market-visual-master-parity.css')

js_p.write_text(js, encoding='utf-8')
css_p.write_text(css, encoding='utf-8')
index_p.write_text(index, encoding='utf-8')
system_p.write_text(system, encoding='utf-8')
manifest_p.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
if retired_p.exists():
    retired_p.unlink()
else:
    raise SystemExit('retired market visual owner file not found')

print('MARKET_OWNER_CONSOLIDATION_404237_PASS')
