from pathlib import Path
from datetime import datetime, timezone
import json

root = Path('public/agent_crypto_erith_ia/administrator')
release = 'TOOLBAR SEMANTIC PARITY · ACTIVE AVAILABLE DISABLED INFO LOCK'
status = 'toolbar_semantic_parity_404196'
now = datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00','Z')

p = root / 'js' / 'parallel-markets.js'
s = p.read_text(encoding='utf-8')
if 'const BUILD = "40.4.195";' not in s:
    raise SystemExit('parallel-markets build anchor missing')
s = s.replace('const BUILD = "40.4.195";', 'const BUILD = "40.4.196";', 1)
s = s.replace('const DEPTH_LEVEL = 195;', 'const DEPTH_LEVEL = 196;', 1)
s = s.replace('<small>SECTION</small><b data-parallel-state>Source Truth</b>', '<small>AFFICHER</small><b class="atlas-toolbar-info-404196" data-parallel-state>Source Truth</b>', 1)
s = s.replace('<button type="button" disabled aria-disabled="true">Prix</button>', '<button type="button" disabled aria-disabled="true" title="Vue Prix non disponible pour ce domaine">Prix</button>', 1)
s = s.replace('<button type="button" disabled aria-disabled="true">Normale</button><button type="button" disabled aria-disabled="true">Log</button>', '<button type="button" disabled aria-disabled="true" title="Échelle native non disponible pour ce domaine">Normale</button><button type="button" disabled aria-disabled="true" title="Échelle logarithmique non disponible pour ce domaine">Log</button>', 1)
p.write_text(s, encoding='utf-8')

p = root / 'js' / 'market-stack.js'
s = p.read_text(encoding='utf-8')
if 'const BUILD = "40.4.195";' not in s:
    raise SystemExit('market-stack build anchor missing')
s = s.replace('const BUILD = "40.4.195";', 'const BUILD = "40.4.196";', 1)
s = s.replace('<small>SECTION</small><b data-cyclic-market-toolbar-state>Source Truth publique</b>', '<small>AFFICHER</small><b class="atlas-toolbar-info-404196" data-cyclic-market-toolbar-state>Source Truth publique</b>', 1)
s = s.replace('<button type="button" disabled aria-disabled="true">Prix</button>', '<button type="button" disabled aria-disabled="true" title="Vue Prix non disponible pour ce domaine">Prix</button>', 1)
s = s.replace('<button type="button" disabled aria-disabled="true">Normale</button><button type="button" disabled aria-disabled="true">Log</button>', '<button type="button" disabled aria-disabled="true" title="Échelle native non disponible pour ce domaine">Normale</button><button type="button" disabled aria-disabled="true" title="Échelle logarithmique non disponible pour ce domaine">Log</button>', 1)
p.write_text(s, encoding='utf-8')

p = root / 'parallel-markets.css'
css = p.read_text(encoding='utf-8')
block = '''

/* =========================================================
   40.4.196 — TOOLBAR SEMANTIC PARITY
   Geometry remains locked by 40.4.195. This layer only makes
   ACTIVE / AVAILABLE / DISABLED / INFORMATION states explicit.
   No market-data, chart-engine, Atlas, Oracle or collector change.
   ========================================================= */
html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168 .atlas-toolbar-info-404196{
  min-height:28px!important;padding:0 10px!important;border:1px solid rgba(111,225,240,.18)!important;
  border-radius:999px!important;background:rgba(73,185,205,.055)!important;color:#a8c8d5!important;
  font-size:9px!important;font-weight:850!important;letter-spacing:.01em!important;pointer-events:none!important;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.012)!important
}
html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168 button[disabled],
html[data-cyclic-market-domain="metals"] #atlasMetalsUnifiedToolbar button[disabled]{
  opacity:.34!important;color:#70808d!important;border-color:rgba(145,160,172,.12)!important;
  background:rgba(80,92,103,.055)!important;box-shadow:none!important;text-shadow:none!important;cursor:not-allowed!important
}
html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168 button:not([disabled]):not(.is-active){
  color:#91a5b2!important;border-color:rgba(145,175,192,.16)!important;background:rgba(255,255,255,.025)!important
}
html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168 button.is-active,
html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168 .active{
  color:#ffffff!important;border-color:rgba(84,231,241,.72)!important;
  background:linear-gradient(180deg,rgba(18,191,207,.36),rgba(10,102,126,.36))!important;
  box-shadow:inset 0 0 0 1px rgba(185,252,255,.12),0 0 12px rgba(43,221,235,.12)!important
}
html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168 .mirror-group>small,
html[data-cyclic-market-domain="metals"] #atlasMetalsUnifiedToolbar [role="group"]>span:first-child{
  color:#879ba8!important;font-size:8px!important;font-weight:950!important;letter-spacing:.10em!important;text-transform:uppercase!important
}
'''
if '40.4.196 — TOOLBAR SEMANTIC PARITY' not in css:
    css += block
p.write_text(css, encoding='utf-8')

p = root / 'js' / 'app.js'
s = p.read_text(encoding='utf-8')
if 'const ADMIN_BUILD = "40.4.195";' not in s:
    raise SystemExit('js/app build anchor missing')
s = s.replace('const ADMIN_BUILD = "40.4.195";', 'const ADMIN_BUILD = "40.4.196";', 1)
for line in s.splitlines():
    if line.strip().startswith('const ADMIN_RELEASE = '):
        s = s.replace(line, f'  const ADMIN_RELEASE = "{release}";', 1)
        break
p.write_text(s, encoding='utf-8')

p = root / 'index.html'
s = p.read_text(encoding='utf-8')
if '40.4.195' not in s:
    raise SystemExit('index current build marker missing')
s = s.replace('40.4.195', '40.4.196')
s = s.replace('GRAPH TOOLBAR PARITY LOCK · AETHER NORMAL ALL MARKETS · STATIC SHELL', release)
p.write_text(s, encoding='utf-8')

for name in ('version.json','administrator-version.json'):
    p = root / name
    data = json.loads(p.read_text(encoding='utf-8'))
    data['build'] = '40.4.196'
    data['release'] = release
    data['status'] = status
    data['asset_token'] = 'market-core-v2.0-alpha-build-40.4.196'
    data['parent_build'] = '40.4.195'
    data['prepared_at'] = now
    data['published_at'] = now
    if 'global_versioning' in data:
        data['global_versioning'] = '40.4.196'
    lineage = str(data.get('lineage',''))
    suffix = ' → 40.4.196 toolbar semantic parity: active/available/disabled/information grammar normalized; 40.4.195 geometry preserved.'
    if '40.4.196 toolbar semantic parity' not in lineage:
        data['lineage'] = lineage + suffix
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

assert 'AFFICHER</small><b class="atlas-toolbar-info-404196"' in (root/'js'/'parallel-markets.js').read_text(encoding='utf-8')
assert '40.4.196 — TOOLBAR SEMANTIC PARITY' in (root/'parallel-markets.css').read_text(encoding='utf-8')
assert json.loads((root/'version.json').read_text(encoding='utf-8'))['build'] == '40.4.196'
print('40.4.196 semantic toolbar patch validated')
