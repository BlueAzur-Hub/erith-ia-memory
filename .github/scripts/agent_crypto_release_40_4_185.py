from pathlib import Path
import json, re, hashlib
from datetime import datetime, timezone

root = Path('public/agent_crypto_erith_ia/administrator')
build = '40.4.185'
parent = '40.4.184'
release = 'UNIFIED GRAPH SHELL · SOFT MARKET TRANSITION · CRYPTO GEOMETRY MASTER'
stamp = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')

def sub_file(rel, pattern, repl, flags=0, required=True):
    p = root / rel
    s = p.read_text(encoding='utf-8')
    ns, n = re.subn(pattern, repl, s, count=1, flags=flags)
    if required and n != 1:
        raise SystemExit(f'{rel}: expected one match for {pattern!r}, got {n}')
    p.write_text(ns, encoding='utf-8')

# Router identity + runtime geometry lock.
p = root / 'js/market-stack.js'
s = p.read_text(encoding='utf-8')
s = re.sub(r'const BUILD = "40\.4\.\d+";', f'const BUILD = "{build}";', s, count=1)
s = re.sub(r'const REVISION = "[^"]+";', 'const REVISION = "V3";', s, count=1)
s = re.sub(r'const CONTRACT = "[^"]+";', 'const CONTRACT = "UNIFIED_GRAPH_SHELL_SOFT_TRANSITION_404185";', s, count=1)
marker = '  function captureCryptoGeometry(){'
if marker not in s:
    raise SystemExit('captureCryptoGeometry owner missing')
inject = '''  function visibleLargeAncestor(node){\n    const deck = byId("analyste");\n    let cur = node?.parentElement || null, best = null;\n    while(cur && cur !== deck && cur !== document.body){\n      const r = cur.getBoundingClientRect();\n      const cs = getComputedStyle(cur);\n      if(r.width > 700 && r.height > 300 && cs.display !== "none" && cs.visibility !== "hidden") best = cur;\n      cur = cur.parentElement;\n    }\n    return best;\n  }\n\n  function clearUnifiedGeometry(){\n    document.querySelectorAll(".atlas-unified-domain-shell-404185,.atlas-unified-domain-rail-404185").forEach(node => {\n      node.classList.remove("atlas-unified-domain-shell-404185","atlas-unified-domain-rail-404185");\n      ["--atlas-unified-dx","--atlas-unified-dy","--atlas-unified-w","--atlas-unified-h"].forEach(k => node.style.removeProperty(k));\n    });\n  }\n\n  function alignActiveGeometry(domain){\n    const deck = byId("analyste");\n    if(!deck || domain === "crypto") { clearUnifiedGeometry(); return; }\n    const masterShell = document.querySelector("#analyste .chart-shell");\n    const masterRail = byId("detailPanel");\n    const activeToolbar = domain === "metals" ? byId("atlasMetalsUnifiedToolbar") : byId("atlasCyclicMarketMirrorToolbar404168");\n    const activeRail = domain === "metals" ? byId("atlasMetalsDetailPanel") : byId("atlasCyclicMarketInertDetail404168");\n    const activeShell = visibleLargeAncestor(activeToolbar);\n    if(!masterShell || !activeShell) return;\n    clearUnifiedGeometry();\n    const mr = masterShell.getBoundingClientRect(), ar = activeShell.getBoundingClientRect();\n    activeShell.classList.add("atlas-unified-domain-shell-404185");\n    activeShell.style.setProperty("--atlas-unified-dx", `${Math.round(mr.left-ar.left)}px`);\n    activeShell.style.setProperty("--atlas-unified-dy", `${Math.round(mr.top-ar.top)}px`);\n    activeShell.style.setProperty("--atlas-unified-w", `${Math.round(mr.width)}px`);\n    activeShell.style.setProperty("--atlas-unified-h", `${Math.round(mr.height)}px`);\n    if(masterRail && activeRail){\n      const rr=masterRail.getBoundingClientRect(), xr=activeRail.getBoundingClientRect();\n      activeRail.classList.add("atlas-unified-domain-rail-404185");\n      activeRail.style.setProperty("--atlas-unified-dx", `${Math.round(rr.left-xr.left)}px`);\n      activeRail.style.setProperty("--atlas-unified-dy", `${Math.round(rr.top-xr.top)}px`);\n      activeRail.style.setProperty("--atlas-unified-w", `${Math.round(rr.width)}px`);\n      activeRail.style.setProperty("--atlas-unified-h", `${Math.round(rr.height)}px`);\n    }\n    document.documentElement.dataset.unifiedGraphShell404185 = domain;\n  }\n\n  function beginSoftMarketTransition(){\n    const deck=byId("analyste");\n    if(!deck) return;\n    deck.classList.add("atlas-market-soft-transition-404185");\n    requestAnimationFrame(() => requestAnimationFrame(() => deck.classList.remove("atlas-market-soft-transition-404185")));\n  }\n\n'''
s = s.replace(marker, inject + marker, 1)
s = s.replace('    const s = specFor(domain);\n    current = s.id;', '    const s = specFor(domain);\n    beginSoftMarketTransition();\n    current = s.id;', 1)
s = s.replace('      if(s.id === "crypto") captureCryptoGeometry();\n      emitDomain(s.id);', '      if(s.id === "crypto") captureCryptoGeometry();\n      requestAnimationFrame(() => alignActiveGeometry(s.id));\n      emitDomain(s.id);', 1)
s = s.replace('      requestAnimationFrame(() => { installFixedAnchor(); syncPanels("metals"); updateButton("metals"); emitDomain("metals"); });', '      beginSoftMarketTransition();\n      requestAnimationFrame(() => { installFixedAnchor(); syncPanels("metals"); updateButton("metals"); requestAnimationFrame(() => alignActiveGeometry("metals")); emitDomain("metals"); });', 1)
s = s.replace('single_cockpit_surface:true, new_chart_engine:false', 'single_cockpit_surface:true, unified_geometry_runtime:true, soft_transition:true, new_chart_engine:false', 1)
p.write_text(s, encoding='utf-8')

css = root / 'parallel-markets.css'
cs = css.read_text(encoding='utf-8')
block = '''\n\n/* 40.4.185 — UNIFIED GRAPH SHELL */\n#analyste{position:relative!important}\n#analyste .chart-shell,.atlas-unified-domain-shell-404185,#detailPanel,.atlas-unified-domain-rail-404185{transition:transform 160ms cubic-bezier(.2,.72,.2,1),opacity 140ms ease,width 160ms ease,height 160ms ease!important;will-change:transform}\n.atlas-unified-domain-shell-404185{transform:translate(var(--atlas-unified-dx,0px),var(--atlas-unified-dy,0px))!important;width:var(--atlas-unified-w,auto)!important;min-height:var(--atlas-unified-h,0px)!important;box-sizing:border-box!important;transform-origin:top left!important}\n.atlas-unified-domain-rail-404185{transform:translate(var(--atlas-unified-dx,0px),var(--atlas-unified-dy,0px))!important;width:var(--atlas-unified-w,auto)!important;min-height:var(--atlas-unified-h,0px)!important;box-sizing:border-box!important;transform-origin:top left!important}\n#analyste.atlas-market-soft-transition-404185 .chart-shell,#analyste.atlas-market-soft-transition-404185 .atlas-unified-domain-shell-404185,#analyste.atlas-market-soft-transition-404185 #detailPanel,#analyste.atlas-market-soft-transition-404185 .atlas-unified-domain-rail-404185{opacity:.72!important}\nhtml[data-cyclic-market-domain="metals"] #atlasAetherRibbon4084,html[data-cyclic-market-domain="indices"] #atlasAetherRibbon4084,html[data-cyclic-market-domain="energy"] #atlasAetherRibbon4084,html[data-cyclic-market-domain="cross-market"] #atlasAetherRibbon4084{display:none!important}\n@media(max-width:900px){.atlas-unified-domain-shell-404185,.atlas-unified-domain-rail-404185{transform:none!important;width:auto!important;min-height:0!important}}\n'''
if '40.4.185 — UNIFIED GRAPH SHELL' not in cs:
    cs += block
css.write_text(cs, encoding='utf-8')

sub_file('app.js', r'^const ATLAS_BUILD = "40\.4\.\d+";', f'const ATLAS_BUILD = "{build}";', re.M)
sub_file('app.js', r'^const ATLAS_ASSET_TOKEN = "market-core-v2\.0-alpha-build-40\.4\.\d+";', f'const ATLAS_ASSET_TOKEN = "market-core-v2.0-alpha-build-{build}";', re.M, required=False)
sub_file('js/app.js', r'^  const ADMIN_BUILD = "40\.4\.\d+";', f'  const ADMIN_BUILD = "{build}";', re.M)
sub_file('js/app.js', r'^  const ADMIN_RELEASE = ".*?";', f'  const ADMIN_RELEASE = "{release}";', re.M)
sub_file('js/parallel-markets.js', r'^  const BUILD = "40\.4\.\d+";', f'  const BUILD = "{build}";', re.M)

p = root / 'index.html'
h = p.read_text(encoding='utf-8')
h = re.sub(r'<meta name="atlas-build" content="40\.4\.\d+" />', f'<meta name="atlas-build" content="{build}" />', h, count=1)
h = re.sub(r'<meta name="administrator-build" content="40\.4\.\d+" />', f'<meta name="administrator-build" content="{build}" />', h, count=1)
h = re.sub(r'<meta name="administrator-revision" content="[^"]+" />', '<meta name="administrator-revision" content="V4" />', h, count=1)
h = re.sub(r'<meta name="administrator-release" content="[^"]+" />', f'<meta name="administrator-release" content="{release}" />', h, count=1)
h = re.sub(r'<meta name="atlas-asset-token" content="market-core-v2\.0-alpha-build-40\.4\.\d+" />', f'<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-{build}" />', h, count=1)
h = re.sub(r'<title>Agent-Crypto @erith\.IA — Build 40\.4\.\d+ · Administrator</title>', f'<title>Agent-Crypto @erith.IA — Build {build} · Administrator</title>', h, count=1)
h = re.sub(r'Agent-Crypto @erith\.IA · Market Core · Build 40\.4\.\d+ · Version : Parker Lewis Can\'t Lose', f'Agent-Crypto @erith.IA · Market Core · Build {build} · Version : Parker Lewis Can\'t Lose', h, count=1)
for asset in ['market-cascade.css','parallel-markets.css','app.js','js/app.js','js/market-stack.js','js/parallel-markets.js']:
    h = re.sub(rf'({re.escape(asset)}\?v=administrator-build-)40\.4\.\d+', rf'\g<1>{build}', h)
p.write_text(h, encoding='utf-8')

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
vp = root / 'version.json'
v = json.loads(vp.read_text(encoding='utf-8'))
v.update(build=build, parent_build=parent, release=release, asset_token=f'market-core-v2.0-alpha-build-{build}', status='unified_graph_shell_soft_transition_404185', prepared_at=stamp, published_at=stamp)
for rel in ['index.html','app.js','js/app.js','js/market-stack.js','parallel-markets.css','js/parallel-markets.js','market-cascade.css']:
    if rel in v.get('files',{}):
        v['files'][rel] = sha(root/rel)
vp.write_text(json.dumps(v, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

ap = root / 'administrator-version.json'
av = json.loads(ap.read_text(encoding='utf-8'))
for k in ['build','administrator_build','primary_build','global_versioning']:
    if k in av or k in ['build','administrator_build','global_versioning']:
        av[k] = build
av.update(build_label=f'Build {build}', release=release, status='unified_graph_shell_soft_transition_404185', prepared_at=stamp, published_at=stamp, timestamp=stamp)
if 'asset_token' in av: av['asset_token'] = f'market-core-v2.0-alpha-build-{build}'
if 'parent_build' in av: av['parent_build'] = parent
ap.write_text(json.dumps(av, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

assert f'const BUILD = "{build}";' in (root/'js/market-stack.js').read_text(encoding='utf-8')
assert 'UNIFIED_GRAPH_SHELL_SOFT_TRANSITION_404185' in (root/'js/market-stack.js').read_text(encoding='utf-8')
assert '40.4.185 — UNIFIED GRAPH SHELL' in (root/'parallel-markets.css').read_text(encoding='utf-8')
assert '<meta name="atlas-engine-build" content="38.15.11" />' in (root/'index.html').read_text(encoding='utf-8')
print('40.4.185 STATIC PASS')
