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
OLD_WORKBENCH = ROOT / 'js/aether-workbench-406038.js'
WORKBENCH = ROOT / 'js/aether-workbench-406039.js'
WORKBENCH_STAGE = Path('.github/scripts/aether_40639_workbench.js')
ASSET = ROOT / 'assets/aether/aether-observatory-background-406032.webp'
CSS = ROOT / 'admin-ribbons.css'
RELEASE_MD = ROOT / 'RELEASE_40_6_39.md'
ZIP = Path('coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_BUILD_40_6_39_AETHER_WORKBENCH_FOCUS_READABILITY_Z_ORDER_CLEAN_UPLOAD_7_FILES.zip')
SHA = Path(str(ZIP) + '.sha256')

PARENT = '40.6.38'
BUILD_NO = '40.6.39'
ENGINE = '38.15.11'
RELEASE = 'AETHER WORKBENCH FOCUS · READABILITY · Z-ORDER LOCK'
STATUS = 'aether_workbench_focus_readability_z_order_lock_406039'
ASSET_SHA = '5c4d61e9410d4a701372e2d30640d6523938dfe603f65902d493b354c5f2e7b2'
AETHER_PARENT_SHA = '493a9e605930fdfecdfe50299633a4c7b9898060617632aca5235e593fc7a193'
OLD_WORKBENCH_SHA = 'f8502dc018b92f12ba58ff8ae6ec2f3502c7943463f5fa8b4ddf2a687ca0b8a8'
CSS_BLOB = '703db90f758c2988bbef2a494c0f9313a13c3b3f'
PARENT_MARKER = '/* 40.6.38 — AETHER FLOATING WORKBENCH · LAZY INTERACTION */'
JS_MARKER = '/* 40.6.39 — AETHER WORKBENCH FOCUS · READABILITY · Z-ORDER LOCK */'


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def git_blob(path: Path) -> str:
    return subprocess.check_output(['git', 'hash-object', str(path)], text=True).strip()


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
require(sha256(OLD_WORKBENCH) == OLD_WORKBENCH_SHA, '40.6.38 workbench drift')
require(sha256(ASSET) == ASSET_SHA, 'exact artwork drift')
require(git_blob(CSS) == CSS_BLOB, f'admin-ribbons drift: {git_blob(CSS)}')
require(WORKBENCH_STAGE.exists(), '40.6.39 workbench staging source missing')

workbench_source = WORKBENCH_STAGE.read_text(encoding='utf-8')
require(workbench_source.startswith(JS_MARKER), '40.6.39 workbench marker mismatch')
for forbidden in ('fetch(', 'setInterval(', 'MutationObserver', 'ResizeObserver', 'localStorage', 'sessionStorage'):
    require(forbidden not in workbench_source, f'workbench forbidden owner: {forbidden}')
WORKBENCH.parent.mkdir(parents=True, exist_ok=True)
shutil.copyfile(WORKBENCH_STAGE, WORKBENCH)

js = AETHER_JS.read_text(encoding='utf-8')
require(PARENT_MARKER in js, '40.6.38 Workbench checkpoint missing')
require(JS_MARKER not in js, '40.6.39 already applied')

focus_pattern = re.compile(
    r"  /\* 40\.6\.38 — AETHER FLOATING WORKBENCH · LAZY INTERACTION \*/.*?\n  function aetherDetailsRender406037",
    re.S,
)
require(focus_pattern.search(js) is not None, '40.6.38 workbench runtime block not found')
new_focus = r'''  /* 40.6.39 — AETHER WORKBENCH FOCUS · READABILITY · Z-ORDER LOCK */
  const AETHER_WORKBENCH_SRC_406039='./js/aether-workbench-406039.js?v=administrator-build-40.6.39';
  let aetherWorkbenchPromise406039=null;
  function aetherWorkbenchLoad406039(){
    if(globalThis.AgentCryptoAetherWorkbench406039)return Promise.resolve(globalThis.AgentCryptoAetherWorkbench406039);
    if(aetherWorkbenchPromise406039)return aetherWorkbenchPromise406039;
    aetherWorkbenchPromise406039=new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src=AETHER_WORKBENCH_SRC_406039;
      script.async=true;
      script.dataset.aetherWorkbench406039='1';
      script.onload=()=>globalThis.AgentCryptoAetherWorkbench406039?resolve(globalThis.AgentCryptoAetherWorkbench406039):reject(new Error('Aether Workbench API absent'));
      script.onerror=()=>{aetherWorkbenchPromise406039=null;reject(new Error('Aether Workbench load failed'));};
      document.head.appendChild(script);
    });
    return aetherWorkbenchPromise406039;
  }
  function aetherWorkbenchPayload406039(mode){
    const snapshot=aetherSnapshot4084();
    const watch=aetherOperatorWatch406026();
    return Object.freeze({
      build:'40.6.39',
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
  function aetherPanelFocusEmbedded406039(target,panel){
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
  function aetherWorkbenchOpen406039(mode,panel=document.getElementById('atlasAetherStatusPanel4084')){
    const target=mode==='details'?'details':mode==='history'?'history':'events';
    return aetherWorkbenchLoad406039()
      .then(api=>api.open(aetherWorkbenchPayload406039(target)))
      .catch(()=>aetherPanelFocusEmbedded406039(target==='events'?'history':target,panel));
  }
  function aetherPanelFocus406030(mode,panel=document.getElementById('atlasAetherStatusPanel4084')){
    if(!panel)return;
    const target=['glance','history','details'].includes(mode)?mode:'glance';
    if(target==='glance')return aetherPanelFocusEmbedded406039('glance',panel);
    // Rich reading stays lazy and floats ABOVE the artwork; embedded surfaces are failure fallback only.
    aetherPanelFocusEmbedded406039('glance',panel);
    void aetherWorkbenchOpen406039(target,panel);
  }
  function aetherDetailsRender406037'''
js, count = focus_pattern.subn(new_focus, js, count=1)
require(count == 1, f'workbench runtime patch count: {count}')

js = replace_once(js, 'aetherWorkbenchBound406038', 'aetherWorkbenchBound406039', 'events card binding dataset')
js = replace_once(js, "aetherWorkbenchOpen406038('events',panel)", "aetherWorkbenchOpen406039('events',panel)", 'events card open function')

old_api = '''    aether_attention_floating_workbench:true,
    aether_attention_floating_workbench_build:"40.6.38",
    aether_attention_workbench_lazy_script:true,
    aether_attention_workbench_modes:"events|history|details",
    aether_attention_workbench_local_drag:true,
    aether_attention_workbench_storage:false,
    aether_attention_workbench_global_window_manager:false,
'''
new_api = '''    aether_attention_floating_workbench:true,
    aether_attention_floating_workbench_build:"40.6.39",
    aether_attention_workbench_lazy_script:true,
    aether_attention_workbench_modes:"events|history|details",
    aether_attention_workbench_local_drag:true,
    aether_attention_workbench_local_maximize:true,
    aether_attention_workbench_focus_scrim:true,
    aether_attention_workbench_above_observatory:true,
    aether_attention_workbench_readability_lock:true,
    aether_attention_workbench_storage:false,
    aether_attention_workbench_global_window_manager:false,
'''
js = replace_once(js, old_api, new_api, 'API workbench 40.6.39 contract')
AETHER_JS.write_text(js, encoding='utf-8')

index = INDEX.read_text(encoding='utf-8')
for old, new in [
    ('content="40.6.38"', 'content="40.6.39"'),
    ('AETHER FLOATING WORKBENCH · LAZY INTERACTION', RELEASE),
    ('market-core-v2.0-alpha-build-40.6.38', 'market-core-v2.0-alpha-build-40.6.39'),
    ('Build 40.6.38 · Administrator', 'Build 40.6.39 · Administrator'),
    ('admin-ribbons.css?v=administrator-build-40.6.38', 'admin-ribbons.css?v=administrator-build-40.6.39'),
    ('js/aether.js?v=administrator-build-40.6.38', 'js/aether.js?v=administrator-build-40.6.39'),
]:
    require(old in index, f'index token missing: {old}')
    index = index.replace(old, new)
require('aether-workbench-406039.js' not in index, 'workbench must remain dynamically loaded')
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
        data['asset_token'] = 'market-core-v2.0-alpha-build-40.6.39'
    if 'administrator_build' in data:
        data['administrator_build'] = BUILD_NO
    if 'build_label' in data:
        data['build_label'] = 'Build 40.6.39'
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
    data['cascade_40_6_39'] = {
        'parent_build': PARENT,
        'release': RELEASE,
        'status': STATUS,
        'aether_graph_first_406037_preserved': True,
        'workbench_owner': 'js/aether-workbench-406039.js',
        'workbench_dynamic_load_only': True,
        'workbench_modes': ['events', 'history', 'details'],
        'workbench_z_index_above_aether_stage': True,
        'workbench_focus_scrim': True,
        'workbench_wider_default_surface': True,
        'workbench_maximize_restore': True,
        'workbench_history_column_header': True,
        'workbench_detail_readability': True,
        'workbench_details_long_cards_wide': True,
        'workbench_draggable': True,
        'workbench_clamped_to_viewport': True,
        'workbench_position_persistence': 'runtime-memory-only',
        'wide_aether_stage_geometry_modified': False,
        'wide_stage_reason': 'freeze exact 16:9 coordinate map until final wider textless master background',
        'exact_artwork_preserved': True,
        'admin_ribbons_css_modified': False,
        'market_core_modified': False,
        'graph_runtime_modified': False,
        'oracle_runtime_modified': False,
        'technical_reading_modified': False,
        'chronos_modified': False,
        'version_truth_modified': False,
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
require(git_blob(CSS) == CSS_BLOB, 'admin-ribbons changed')
require(JS_MARKER in AETHER_JS.read_text(encoding='utf-8'), '40.6.39 runtime marker missing')
require('aether-workbench-406039.js?v=administrator-build-40.6.39' in AETHER_JS.read_text(encoding='utf-8'), 'lazy 40.6.39 source missing')
require('aether-workbench-406039.js' not in INDEX.read_text(encoding='utf-8'), 'workbench statically loaded unexpectedly')
for forbidden in ('fetch(', 'setInterval(', 'MutationObserver', 'ResizeObserver', 'localStorage', 'sessionStorage'):
    require(forbidden not in WORKBENCH.read_text(encoding='utf-8'), f'workbench forbidden owner after copy: {forbidden}')

new_aether_sha = sha256(AETHER_JS)
new_workbench_sha = sha256(WORKBENCH)
RELEASE_MD.write_text(f'''# Agent-Crypto 40.6.39 — {RELEASE}

Parent: **{PARENT}**  
Market Core: **{ENGINE} — protected**  
Generated: **{now}**

## Firefox diagnosis from 40.6.38
The Workbench interaction is valid, but the Observatory's historical stage uses a near-maximum z-index. This lets the 16:9 Aether artwork render above the floating reader when the two overlap. History and Details are functionally correct but need stronger visual priority, more room and more legible reading lanes.

## 40.6.39 correction
- Replaces the lazy Workbench payload owner with `js/aether-workbench-406039.js`.
- Raises the Workbench above the existing Aether stage without touching the Aether stage z-index or global Window Manager.
- Adds a passive focus scrim below the Workbench and above the Observatory so the artwork remains visible but visually quiet while reading.
- Increases default Workbench width/height while keeping viewport clamps.
- Adds local `Agrandir / Restaurer` mode; no browser storage and no global window ownership.
- History gains explicit Heure / Type / Niveau / Lecture column headers, larger rows and more readable typography.
- Details uses wider long-form cards, larger line-height and preserved cyan + gold hierarchy.
- Events / History / Details continue to share the same lazy-loaded Workbench.
- The exact 16:9 Aether stage geometry stays frozen for this build. Full-width/F11 geometry is deferred until the final wider textless master background so the live percentage anchors are not distorted.

## Protected
- 40.6.37 graph-first scheduling preserved.
- Exact Observatory artwork byte-for-byte preserved (`{ASSET_SHA}`).
- `admin-ribbons.css` byte-for-byte preserved at the validated 40.6.36 visual checkpoint.
- Market Core 38.15.11, Graphique runtime, Oracle runtime, Lecture Technique, Chronos, Version Truth and global Window Manager untouched.
- No fetch, recurring timer, observer or storage owner in the Workbench.
- No automatic or real order.

## Runtime hashes
- Parent Aether: `{AETHER_PARENT_SHA}`
- 40.6.39 Aether: `{new_aether_sha}`
- 40.6.39 Workbench: `{new_workbench_sha}`

## Firefox acceptance
1. Ctrl+F5 and confirm Build 40.6.39; graph-first behavior must remain.
2. Open Aether View: the 16:9 artwork geometry must be unchanged.
3. Click Details: the Workbench must appear above Aether, never behind it; the scene is dimmed but still visible.
4. Drag the Workbench; `Centrer` must recover it.
5. Click `Agrandir`, then `Restaurer`; both modes remain viewport-safe.
6. History must expose readable Heure / Type / Niveau / Lecture lanes without the Observatory crossing in front.
7. Events must use the same Workbench and no new network/storage/timer owner may appear.
''', encoding='utf-8')

files = [INDEX, BUILD, ADMIN_VERSION, VERSION, AETHER_JS, WORKBENCH, RELEASE_MD]
ZIP.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(ZIP, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for src in files:
        rel = src.relative_to(ROOT)
        z.write(src, Path('administrator') / rel)
with zipfile.ZipFile(ZIP) as z:
    names = [n for n in z.namelist() if not n.endswith('/')]
    require(len(names) == 7, f'ZIP file count drift: {len(names)} {names}')
    require(z.testzip() is None, 'ZIP integrity failed')
    require('administrator/js/aether-workbench-406039.js' in names, 'new Workbench absent from ZIP')
zip_sha = sha256(ZIP)
SHA.write_text(f'{zip_sha}  {ZIP.name}\n', encoding='utf-8')
print(json.dumps({'build': BUILD_NO, 'aether_sha256': new_aether_sha, 'workbench_sha256': new_workbench_sha, 'zip_sha256': zip_sha, 'files': 7}, ensure_ascii=False))
