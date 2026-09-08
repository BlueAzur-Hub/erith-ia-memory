from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import re
import shutil
import subprocess
import zipfile

ROOT = Path('public/agent_crypto_erith_ia/administrator')
INDEX = ROOT / 'index.html'
BUILD = ROOT / 'build.json'
ADMIN_VERSION = ROOT / 'administrator-version.json'
VERSION = ROOT / 'version.json'
AETHER_JS = ROOT / 'js/aether.js'
WORKBENCH = ROOT / 'js/aether-workbench-406038.js'
WORKBENCH_STAGE = Path('.github/scripts/aether_40638_workbench.js')
ASSET = ROOT / 'assets/aether/aether-observatory-background-406032.webp'
CSS = ROOT / 'admin-ribbons.css'
RELEASE_MD = ROOT / 'RELEASE_40_6_38.md'
ZIP = Path('coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_BUILD_40_6_38_AETHER_FLOATING_WORKBENCH_LAZY_INTERACTION_CLEAN_UPLOAD_7_FILES.zip')
SHA = Path(str(ZIP) + '.sha256')

PARENT = '40.6.37'
BUILD_NO = '40.6.38'
ENGINE = '38.15.11'
RELEASE = 'AETHER FLOATING WORKBENCH · LAZY INTERACTION'
STATUS = 'aether_floating_workbench_lazy_interaction_406038'
ASSET_SHA = '5c4d61e9410d4a701372e2d30640d6523938dfe603f65902d493b354c5f2e7b2'
AETHER_PARENT_SHA = '1ffb9e3c8ff4b1291b96c3f9fc1ac22de63b0cea35d23ec000d34deaa96a4427'
CSS_MARKER = '/* 40.6.36 — AETHER TYPOGRAPHY CALIBRATION · PAINTED-LANE LOCK */'
PARENT_JS_MARKER = '/* 40.6.37 — GRAPH-FIRST LAZY HYDRATION · INTERACTION-ON-DEMAND LOCK */'
JS_MARKER = '/* 40.6.38 — AETHER FLOATING WORKBENCH · LAZY INTERACTION */'


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def require(ok, message):
    if not ok:
        raise SystemExit(message)


def replace_once(text: str, old: str, new: str, label: str) -> str:
    require(old in text, f'missing patch anchor: {label}')
    require(text.count(old) == 1, f'non-unique patch anchor: {label} ({text.count(old)})')
    return text.replace(old, new, 1)


truth = json.loads(BUILD.read_text(encoding='utf-8'))
require(truth.get('build') == PARENT, f'parent build drift: {truth.get("build")}')
require(truth.get('engine') == ENGINE, 'Market Core drift')
require(sha256(AETHER_JS) == AETHER_PARENT_SHA, f'Aether parent runtime drift: {sha256(AETHER_JS)}')
require(sha256(ASSET) == ASSET_SHA, 'exact artwork drift')
require(CSS_MARKER in CSS.read_text(encoding='utf-8'), '40.6.36 typography checkpoint missing')
require(WORKBENCH_STAGE.exists(), '40.6.38 workbench staging source missing')

workbench_source = WORKBENCH_STAGE.read_text(encoding='utf-8')
require(workbench_source.startswith(JS_MARKER), 'workbench marker mismatch')
for forbidden in ('fetch(', 'setInterval(', 'MutationObserver', 'localStorage', 'sessionStorage'):
    require(forbidden not in workbench_source, f'workbench forbidden owner: {forbidden}')
WORKBENCH.parent.mkdir(parents=True, exist_ok=True)
shutil.copyfile(WORKBENCH_STAGE, WORKBENCH)

js = AETHER_JS.read_text(encoding='utf-8')
require(PARENT_JS_MARKER in js, '40.6.37 graph-first checkpoint missing')
require(JS_MARKER not in js, '40.6.38 already applied')

focus_pattern = re.compile(
    r"  function aetherPanelFocus406030\(mode,panel=document\.getElementById\('atlasAetherStatusPanel4084'\)\)\{.*?\n  function aetherDetailsRender406037",
    re.S,
)
focus_match = focus_pattern.search(js)
require(focus_match is not None, 'focus function block not found')

new_focus = r'''  /* 40.6.38 — AETHER FLOATING WORKBENCH · LAZY INTERACTION */
  const AETHER_WORKBENCH_SRC_406038='./js/aether-workbench-406038.js?v=administrator-build-40.6.38';
  let aetherWorkbenchPromise406038=null;
  function aetherWorkbenchLoad406038(){
    if(globalThis.AgentCryptoAetherWorkbench406038)return Promise.resolve(globalThis.AgentCryptoAetherWorkbench406038);
    if(aetherWorkbenchPromise406038)return aetherWorkbenchPromise406038;
    aetherWorkbenchPromise406038=new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src=AETHER_WORKBENCH_SRC_406038;
      script.async=true;
      script.dataset.aetherWorkbench406038='1';
      script.onload=()=>globalThis.AgentCryptoAetherWorkbench406038?resolve(globalThis.AgentCryptoAetherWorkbench406038):reject(new Error('Aether Workbench API absent'));
      script.onerror=()=>{aetherWorkbenchPromise406038=null;reject(new Error('Aether Workbench load failed'));};
      document.head.appendChild(script);
    });
    return aetherWorkbenchPromise406038;
  }
  function aetherWorkbenchPayload406038(mode){
    const snapshot=aetherSnapshot4084();
    const watch=aetherOperatorWatch406026();
    return Object.freeze({
      build:'40.6.38',
      mode,
      timeline:aetherTimelineState406027.entries.map(row=>Object.freeze({...row})),
      details:Object.freeze({
        why:aetherOperatorWhy405012(),
        semantic:aetherNewsMarketSemantic405013(),
        attention:aetherAttention40133(),
        news:snapshot.news
      }),
      watch:Object.freeze({...watch})
    });
  }
  function aetherPanelFocusEmbedded406038(target,panel){
    if(!panel)return;
    const embedded=['glance','history','details'].includes(target)?target:'glance';
    panel.dataset.aetherFocus406030=embedded;
    panel.querySelectorAll('[data-aether-focus-view-406030]').forEach(node=>{node.hidden=node.getAttribute('data-aether-focus-view-406030')!==embedded;});
    panel.querySelectorAll('[data-aether-focus-button-406030]').forEach(button=>{
      const active=button.getAttribute('data-aether-focus-button-406030')===embedded;
      button.setAttribute('aria-pressed',active?'true':'false');
      button.dataset.active=active?'1':'0';
    });
    if(embedded==='history')aetherTimelineRender406027(panel,{includeFull:true});
    if(embedded==='details')aetherDetailsRender406037(panel);
  }
  function aetherWorkbenchOpen406038(mode,panel=document.getElementById('atlasAetherStatusPanel4084')){
    const target=mode==='details'?'details':mode==='history'?'history':'events';
    return aetherWorkbenchLoad406038()
      .then(api=>api.open(aetherWorkbenchPayload406038(target)))
      .catch(()=>aetherPanelFocusEmbedded406038(target==='events'?'history':target,panel));
  }
  function aetherPanelFocus406030(mode,panel=document.getElementById('atlasAetherStatusPanel4084')){
    if(!panel)return;
    const target=['glance','history','details'].includes(mode)?mode:'glance';
    if(target==='glance')return aetherPanelFocusEmbedded406038('glance',panel);
    // Keep the paid artwork fully visible behind the local Workbench; rich views float above it.
    aetherPanelFocusEmbedded406038('glance',panel);
    void aetherWorkbenchOpen406038(target,panel);
  }
  function aetherDetailsRender406037'''
js, count = focus_pattern.subn(new_focus, js, count=1)
require(count == 1, f'focus patch count: {count}')

old_bind = '''    panel.querySelector("[data-aether-close-4084]")?.addEventListener("click",()=>aetherPanelSet4084(false));
    panel.querySelectorAll("[data-aether-focus-button-406030]").forEach(button=>button.addEventListener("click",()=>aetherPanelFocus406030(button.getAttribute("data-aether-focus-button-406030"),panel)));
    aetherPanelFocus406030("glance",panel);
'''
new_bind = '''    panel.querySelector("[data-aether-close-4084]")?.addEventListener("click",()=>aetherPanelSet4084(false));
    panel.querySelectorAll("[data-aether-focus-button-406030]").forEach(button=>button.addEventListener("click",()=>aetherPanelFocus406030(button.getAttribute("data-aether-focus-button-406030"),panel)));
    const eventsCard=panel.querySelector('[data-aether-timeline-card-406027]');
    if(eventsCard&&eventsCard.dataset.aetherWorkbenchBound406038!=="1"){
      eventsCard.dataset.aetherWorkbenchBound406038="1";
      eventsCard.setAttribute('role','button');
      eventsCard.setAttribute('tabindex','0');
      eventsCard.setAttribute('aria-label','Ouvrir les événements récents dans Aether Workbench');
      eventsCard.setAttribute('title','Ouvrir les événements récents');
      eventsCard.style.cursor='pointer';
      const openEvents=()=>void aetherWorkbenchOpen406038('events',panel);
      eventsCard.addEventListener('click',openEvents);
      eventsCard.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openEvents();}});
    }
    aetherPanelFocus406030("glance",panel);
'''
js = replace_once(js, old_bind, new_bind, 'events card workbench binding')

old_api = '''    aether_attention_graph_first_lazy_build:"40.6.37",
    aether_attention_graph_first_signal:"existing atlasAfterLivecheck completion",
'''
new_api = '''    aether_attention_graph_first_lazy_build:"40.6.37",
    aether_attention_graph_first_signal:"existing atlasAfterLivecheck completion",
    aether_attention_floating_workbench:true,
    aether_attention_floating_workbench_build:"40.6.38",
    aether_attention_workbench_lazy_script:true,
    aether_attention_workbench_modes:"events|history|details",
    aether_attention_workbench_local_drag:true,
    aether_attention_workbench_storage:false,
    aether_attention_workbench_global_window_manager:false,
'''
js = replace_once(js, old_api, new_api, 'API workbench contract')
AETHER_JS.write_text(js, encoding='utf-8')

index = INDEX.read_text(encoding='utf-8')
for old, new in [
    ('content="40.6.37"', 'content="40.6.38"'),
    ('AETHER GRAPH-FIRST LAZY HYDRATION · INTERACTION-ON-DEMAND LOCK', RELEASE),
    ('market-core-v2.0-alpha-build-40.6.37', 'market-core-v2.0-alpha-build-40.6.38'),
    ('Build 40.6.37 · Administrator', 'Build 40.6.38 · Administrator'),
    ('admin-ribbons.css?v=administrator-build-40.6.37', 'admin-ribbons.css?v=administrator-build-40.6.38'),
    ('js/aether.js?v=administrator-build-40.6.37', 'js/aether.js?v=administrator-build-40.6.38'),
]:
    require(old in index, f'index token missing: {old}')
    index = index.replace(old, new)
require('aether-workbench-406038.js' not in index, 'workbench must remain dynamically loaded')
INDEX.write_text(index, encoding='utf-8')

now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')
for path in (BUILD, ADMIN_VERSION, VERSION):
    data = json.loads(path.read_text(encoding='utf-8'))
    require(data.get('build') == PARENT, f'{path.name}: parent build drift')
    data['build'] = BUILD_NO
    data['release'] = RELEASE
    data['status'] = STATUS
    data['parent_build'] = PARENT
    if 'asset_token' in data:
        data['asset_token'] = 'market-core-v2.0-alpha-build-40.6.38'
    if 'administrator_build' in data:
        data['administrator_build'] = BUILD_NO
    if 'build_label' in data:
        data['build_label'] = 'Build 40.6.38'
    if 'release_status' in data:
        data['release_status'] = RELEASE
    if 'timestamp' in data:
        data['timestamp'] = now
    if 'prepared_at' in data:
        data['prepared_at'] = now
    if 'published_at' in data:
        data['published_at'] = now
    if isinstance(data.get('current_version_truth'), dict):
        data['current_version_truth']['loaded_build'] = BUILD_NO
    data['cascade_40_6_38'] = {
        'parent_build': PARENT,
        'release': RELEASE,
        'status': STATUS,
        'aether_graph_first_406037_preserved': True,
        'workbench_owner': 'js/aether-workbench-406038.js',
        'workbench_dynamic_load_only': True,
        'workbench_modes': ['events', 'history', 'details'],
        'workbench_draggable': True,
        'workbench_clamped_to_viewport': True,
        'workbench_position_persistence': 'runtime-memory-only',
        'events_card_opens_workbench': True,
        'embedded_views_fallback_only': True,
        'global_window_manager_modified': False,
        'exact_artwork_preserved': True,
        'admin_ribbons_css_modified': False,
        'market_core_modified': False,
        'graph_runtime_modified': False,
        'oracle_runtime_modified': False,
        'new_recurring_timer': False,
        'new_observer': False,
        'new_network_owner': False,
        'new_storage_owner': False,
        'automatic_order': False,
        'real_order': False,
    }
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

subprocess.run(['node', '--check', str(AETHER_JS)], check=True)
subprocess.run(['node', '--check', str(WORKBENCH)], check=True)
require(sha256(ASSET) == ASSET_SHA, 'artwork changed')
require(CSS_MARKER in CSS.read_text(encoding='utf-8'), 'typography CSS changed checkpoint')
require(JS_MARKER in AETHER_JS.read_text(encoding='utf-8'), '40.6.38 runtime marker missing')
require('aether-workbench-406038.js?v=administrator-build-40.6.38' in AETHER_JS.read_text(encoding='utf-8'), 'lazy workbench source missing')
require('aether-workbench-406038.js' not in INDEX.read_text(encoding='utf-8'), 'workbench statically loaded unexpectedly')
for forbidden in ('fetch(', 'setInterval(', 'MutationObserver', 'localStorage', 'sessionStorage'):
    require(forbidden not in WORKBENCH.read_text(encoding='utf-8'), f'workbench forbidden owner after copy: {forbidden}')

new_aether_sha = sha256(AETHER_JS)
new_workbench_sha = sha256(WORKBENCH)
RELEASE_MD.write_text(f'''# Agent-Crypto 40.6.38 — AETHER FLOATING WORKBENCH · LAZY INTERACTION

Parent: **{PARENT}**  
Market Core: **{ENGINE} — protected**  
Generated: **{now}**

## Firefox diagnosis from 40.6.37
The graph-first lazy contract is validated and the Observatory View is close to final. History and Details now deserve a larger, movable reading surface; the embedded central overlay hides the strongest part of the artwork and compresses long evidence text. The painted Events card also needs a direct path to the same rich reader.

## 40.6.38 contract
- Adds `js/aether-workbench-406038.js` as an Aether-local floating reader.
- The Workbench script is not present in `index.html`; it is requested only on first History, Details or Events interaction.
- Workbench modes: Events / History / Details.
- The window is draggable by its title bar, viewport-clamped, recenterable and closable with `×` or Escape.
- Position is retained only in runtime memory for the current page; no localStorage/sessionStorage owner is added.
- History uses larger rows with independent time/type/level/detail lanes and internal scrolling.
- Details uses a roomy 2×2 explanatory grid on desktop, one column on narrow screens.
- Clicking the painted `Événements récents` card in View opens the Workbench directly in Events mode.
- The paid Observatory artwork remains visible behind the floating Workbench; the embedded History/Details surfaces remain fallback-only if lazy loading fails.

## Protected
- 40.6.37 graph-first scheduling preserved.
- Exact Observatory artwork byte-for-byte preserved (`{ASSET_SHA}`).
- `admin-ribbons.css` unchanged from the 40.6.36/37 visual checkpoint.
- Market Core 38.15.11, Graphique runtime, Oracle runtime, Lecture Technique, Chronos, Version Truth and global Window Manager untouched.
- No fetch, recurring timer, MutationObserver or storage owner in the Workbench.
- No automatic or real order.

## Runtime hashes
- Parent Aether: `{AETHER_PARENT_SHA}`
- 40.6.38 Aether: `{new_aether_sha}`
- Workbench: `{new_workbench_sha}`

## Firefox acceptance
1. Ctrl+F5: graph-first behavior from 40.6.37 must remain.
2. Open Aether: View remains the default and artwork geometry stays unchanged.
3. Click the painted Events card: Workbench appears in Events mode.
4. Drag Workbench to each edge: it must remain recoverable inside the viewport; `Centrer` restores center.
5. Close, then click History: larger readable timeline opens in Workbench.
6. Switch Workbench to Details: four explanatory cards remain readable without hiding content by overflow.
7. Close and reopen Aether: no persistent position is written to browser storage.
''', encoding='utf-8')

subprocess.run(['git', 'diff', '--check'], check=True)

ZIP.parent.mkdir(parents=True, exist_ok=True)
if ZIP.exists():
    ZIP.unlink()
files = {
    'administrator/index.html': INDEX,
    'administrator/build.json': BUILD,
    'administrator/administrator-version.json': ADMIN_VERSION,
    'administrator/version.json': VERSION,
    'administrator/js/aether.js': AETHER_JS,
    'administrator/js/aether-workbench-406038.js': WORKBENCH,
    'administrator/RELEASE_40_6_38.md': RELEASE_MD,
}
with zipfile.ZipFile(ZIP, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
    for arcname, src in files.items():
        zf.write(src, arcname)
with zipfile.ZipFile(ZIP) as zf:
    packed = [n for n in zf.namelist() if not n.endswith('/')]
    require(len(packed) == 7, f'ZIP file-count gate failed: {packed}')
    require(zf.testzip() is None, 'ZIP integrity gate failed')

zip_sha = sha256(ZIP)
SHA.write_text(f'{zip_sha}  {ZIP.name}\n', encoding='utf-8')
print(f'{BUILD_NO} prepared: {RELEASE}')
print(f'Aether SHA256: {new_aether_sha}')
print(f'Workbench SHA256: {new_workbench_sha}')
print(f'Artwork SHA256 preserved: {sha256(ASSET)}')
print(f'ZIP SHA256: {zip_sha}')
