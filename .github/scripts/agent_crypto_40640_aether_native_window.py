from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import re
import subprocess
import zipfile

ROOT = Path('public/agent_crypto_erith_ia/administrator')
INDEX = ROOT / 'index.html'
BUILD = ROOT / 'build.json'
ADMIN_VERSION = ROOT / 'administrator-version.json'
VERSION = ROOT / 'version.json'
APP_JS = ROOT / 'js/app.js'
AETHER_JS = ROOT / 'js/aether.js'
WORKBENCH = ROOT / 'js/aether-workbench-406039.js'
CSS = ROOT / 'admin-ribbons.css'
ASSET = ROOT / 'assets/aether/aether-observatory-background-406032.webp'
RELEASE_MD = ROOT / 'RELEASE_40_6_40.md'
ZIP = Path('coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_BUILD_40_6_40_AETHER_NATIVE_WINDOW_MANAGER_INTEGRATION_CLEAN_UPLOAD_7_FILES.zip')
SHA = Path(str(ZIP) + '.sha256')

PARENT = '40.6.39'
BUILD_NO = '40.6.40'
ENGINE = '38.15.11'
RELEASE = 'AETHER NATIVE WINDOW · ADMINISTRATOR MANAGER INTEGRATION'
STATUS = 'aether_native_window_administrator_manager_integration_406040'
APP_BLOB = '86d6fb0988142fb324e2867559ef2c7d04ca3d54'
AETHER_BLOB = 'df37d8af9563b1b991c7e8ff341606ad0f076cae'
CSS_BLOB = '703db90f758c2988bbef2a494c0f9313a13c3b3f'
WORKBENCH_BLOB = '21145af3e8695dd4cb6366423d5d8c9f62ab9aa1'
ASSET_SHA = '5c4d61e9410d4a701372e2d30640d6523938dfe603f65902d493b354c5f2e7b2'
CSS_MARKER = '/* 40.6.40 — AETHER NATIVE WINDOW · ADMINISTRATOR MANAGER INTEGRATION */'
AETHER_MARKER = '/* 40.6.40 — AETHER NATIVE WINDOW MANAGER BRIDGE */'


def require(ok, message):
    if not ok:
        raise SystemExit(message)


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def git_blob(path: Path) -> str:
    return subprocess.check_output(['git', 'hash-object', str(path)], text=True).strip()


def replace_once(text: str, old: str, new: str, label: str) -> str:
    require(old in text, f'missing patch anchor: {label}')
    require(text.count(old) == 1, f'non-unique patch anchor: {label} ({text.count(old)})')
    return text.replace(old, new, 1)


truth = json.loads(BUILD.read_text(encoding='utf-8'))
require(truth.get('build') == PARENT, f'parent build drift: {truth.get("build")}')
require(truth.get('engine') == ENGINE, 'Market Core drift')
require(git_blob(APP_JS) == APP_BLOB, f'app.js drift: {git_blob(APP_JS)}')
require(git_blob(AETHER_JS) == AETHER_BLOB, f'aether.js drift: {git_blob(AETHER_JS)}')
require(git_blob(CSS) == CSS_BLOB, f'admin-ribbons drift: {git_blob(CSS)}')
require(git_blob(WORKBENCH) == WORKBENCH_BLOB, '40.6.39 Workbench drift')
require(sha256(ASSET) == ASSET_SHA, 'exact Aether artwork drift')

# ---------------------------------------------------------------------------
# app.js — register Aether as a first-class native Administrator window.
# Window Manager core itself remains byte-for-byte untouched.
# ---------------------------------------------------------------------------
app = APP_JS.read_text(encoding='utf-8')
require('id: "aether-watch"' not in app, 'Aether native definition already present')

native_anchor = '''  function nativeDefinitions() {
    return [
      {
        id: "graphique",
'''
native_patch = '''  function nativeDefinitions() {
    return [
      {
        id: "aether-watch",
        title: "Aether · Attention Watch",
        tone: "cyan",
        directFixed: true,
        geometryPolicy: { minWidth: 720, minHeight: 405, keepFullyVisible: true },
        preferredFloatGeometry: () => {
          const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
          const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
          const width = Math.max(720, Math.min(1450, vw - 32, (vh * 1.7777777778) - 352));
          const height = Math.max(405, Math.min(vh - 24, width * 9 / 16));
          const fittedWidth = Math.min(width, height * 16 / 9);
          const fittedHeight = fittedWidth * 9 / 16;
          return {
            x: Math.max(12, Math.round((vw - fittedWidth) / 2)),
            y: Math.max(12, Math.round((vh * .5 + 99) - fittedHeight / 2)),
            width: Math.round(fittedWidth),
            height: Math.round(fittedHeight)
          };
        },
        resolveEntries: () => [entry(byId("atlasAetherStatusPanel4084"))].filter(Boolean),
        resolveAnchor: nodes => nodes[0],
        resolveControlHosts: nodes => [nodes[0]?.querySelector(".atlas-aether-panel-head-4084")].filter(Boolean),
        placeholderPolicy: "preserve"
      },
      {
        id: "graphique",
'''
app = replace_once(app, native_anchor, native_patch, 'nativeDefinitions Aether insertion')

init_anchor = '''    const bootRole40312 = presentationRole40312();
    const state = manager.init({ restorePersistedPresentation: bootRole40312 === "administrator" });
'''
init_patch = '''    const bootRole40312 = presentationRole40312();
    let aetherNativeStateExists406040 = false;
    try { aetherNativeStateExists406040 = localStorage.getItem(`${STORAGE_PREFIX}:window:aether-watch`) !== null; } catch {}
    const state = manager.init({ restorePersistedPresentation: bootRole40312 === "administrator" });
    // 40.6.40 — the shell is pre-created by aether.js solely so the canonical
    // Window Manager can register it during this one normal init pass.
    // HTML hidden is then released; the manager becomes the only presentation owner.
    const aetherPanel406040 = byId("atlasAetherStatusPanel4084");
    const aetherWindow406040 = manager.getWindow("aether-watch");
    if (aetherPanel406040 && aetherWindow406040) {
      aetherPanel406040.hidden = false;
      if (!aetherNativeStateExists406040) {
        // Aether is already conceptually a portal. First registration therefore
        // starts as a hidden floating native window, preserving the old closed boot
        // while giving the first operator open the complete five-button menu.
        manager.float("aether-watch", true);
        manager.hide("aether-watch", true);
      }
    }
'''
app = replace_once(app, init_anchor, init_patch, 'manager init Aether ownership')
APP_JS.write_text(app, encoding='utf-8')

# ---------------------------------------------------------------------------
# aether.js — shell preseed + toggle bridge to the existing native manager.
# Graph-first hydration and Workbench lazy loading are preserved.
# ---------------------------------------------------------------------------
aether = AETHER_JS.read_text(encoding='utf-8')
require(AETHER_MARKER not in aether, '40.6.40 Aether bridge already applied')

panel_pattern = re.compile(
    r'  function aetherPanelSet4084\(open\)\{.*?\}\n  function renderAether4084\(\)\{',
    re.S,
)
require(panel_pattern.search(aether) is not None, 'aetherPanelSet4084 anchor missing')
new_panel = r'''  /* 40.6.40 — AETHER NATIVE WINDOW MANAGER BRIDGE */
  function aetherNativeWindowManager406040(){
    const manager=globalThis.ErithAdministratorWindows;
    return manager?.getWindow?.('aether-watch')?manager:null;
  }
  function aetherPanelSet4084(open){
    const button=document.getElementById("atlasAetherStatusToggle4084");
    const panel=open?aetherPanelEnsure4084():document.getElementById("atlasAetherStatusPanel4084");
    const manager=aetherNativeWindowManager406040();
    if(panel){
      if(manager){
        // HTML hidden is bootstrap-only. From here the canonical Administrator
        // manager owns hide/minimize/float/maximize/z-order and persisted geometry.
        panel.hidden=false;
        if(open){
          manager.hide('aether-watch',false);
          manager.minimize('aether-watch',false);
          manager.focus('aether-watch');
        }else{
          manager.hide('aether-watch',true);
        }
      }else{
        panel.hidden=!open;
      }
    }
    if(button)button.setAttribute("aria-expanded",open?"true":"false");
    if(open){
      aetherPanelFocus406030("glance",panel);
      aetherCorePaint406037();
      if(aetherMarketDataReady406037())aetherMarkMarketReady406037("operator-open");
    }
  }
  function renderAether4084(){'''
aether, count = panel_pattern.subn(new_panel, aether, count=1)
require(count == 1, f'Aether manager bridge patch count: {count}')

old_click = 'button.addEventListener("click",()=>aetherPanelSet4084(button.getAttribute("aria-expanded")!=="true"));'
new_click = '''button.addEventListener("click",()=>{
        const manager=aetherNativeWindowManager406040();
        const win=manager?.getWindow?.('aether-watch');
        const shouldOpen=win?Boolean(win.hidden||win.minimized):button.getAttribute("aria-expanded")!=="true";
        aetherPanelSet4084(shouldOpen);
      });'''
aether = replace_once(aether, old_click, new_click, 'Aether toolbar toggle native state')

api_anchor = '''    aether_attention_floating_workbench_build:"40.6.39",
    aether_attention_workbench_lazy_script:true,
'''
api_patch = '''    aether_attention_floating_workbench_build:"40.6.39",
    aether_attention_native_window_manager:true,
    aether_attention_native_window_build:"40.6.40",
    aether_attention_native_window_id:"aether-watch",
    aether_attention_native_window_direct_fixed:true,
    aether_attention_native_window_controls:"move|minimize|dock|maximize|hide",
    aether_attention_native_window_default:"floating-hidden",
    aether_attention_native_window_geometry_persistence:"existing-admin-window-manager",
    aether_attention_native_window_fullscreen_path:"native maximize 97vw x 97vh / Firefox F11 viewport",
    aether_attention_final_wide_textless_background_pending:true,
    aether_attention_workbench_lazy_script:true,
'''
aether = replace_once(aether, api_anchor, api_patch, 'Aether API native window contract')

boot_anchor = '''  globalThis.AgentCryptoAetherSystem4086=api;

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bindAether,{once:true});
'''
boot_patch = '''  globalThis.AgentCryptoAetherSystem4086=api;

  /* 40.6.40 — DOM shell preseed only. This runs before app.js initializes the
     canonical Administrator Window Manager. No Aether data, weather, news or
     history hydration is started here; 40.6.37 graph-first scheduling remains intact. */
  try{aetherPanelEnsure4084();}catch(_){}

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bindAether,{once:true});
'''
aether = replace_once(aether, boot_anchor, boot_patch, 'Aether shell preseed before app manager')
AETHER_JS.write_text(aether, encoding='utf-8')

# ---------------------------------------------------------------------------
# CSS — expose the SAME five-button manager menu without disturbing artwork.
# Maximized mode letterboxes the exact 16:9 coordinate stage instead of stretching it.
# ---------------------------------------------------------------------------
css = CSS.read_text(encoding='utf-8')
require(CSS_MARKER not in css, '40.6.40 CSS already applied')
css += r'''

/* 40.6.40 — AETHER NATIVE WINDOW · ADMINISTRATOR MANAGER INTEGRATION */
/* Window chrome only. Paid 16:9 artwork and all 40.6.36 live embroidery coordinates remain unchanged. */
@media (min-width:901px){
  #atlasAetherStatusPanel4084.admin-native-window-aether-watch .atlas-aether-panel-head-4084{
    pointer-events:none!important;
    z-index:120!important;
  }
  #atlasAetherStatusPanel4084.admin-native-window-aether-watch .atlas-aether-panel-head-4084 > .admin-native-controls{
    position:absolute!important;
    top:7px!important;
    right:8px!important;
    bottom:auto!important;
    left:auto!important;
    width:max-content!important;
    max-width:calc(100% - 16px)!important;
    margin:0!important;
    transform:none!important;
    z-index:140!important;
    pointer-events:auto!important;
  }
  /* The canonical manager owns Hide now; retire the parallel historical X. */
  #atlasAetherStatusPanel4084.admin-native-window-aether-watch [data-aether-close-4084]{display:none!important}

  /* Direct-floating manager geometry outranks the historical centered portal geometry. */
  #atlasAetherStatusPanel4084.admin-native-window-aether-watch.admin-native-direct-floating{
    right:auto!important;
    bottom:auto!important;
  }

  /* Native maximize is intentionally a viewport workspace (97vw x 97vh).
     Preserve the calibrated 16:9 artwork as an inner stage so no live lane stretches. */
  #atlasAetherStatusPanel4084.admin-native-window-aether-watch.admin-native-maximized{
    background:#010711!important;
  }
  #atlasAetherStatusPanel4084.admin-native-window-aether-watch.admin-native-maximized .aether-first-glance-grid-406030{
    inset:auto!important;
    left:50%!important;
    top:50%!important;
    width:min(calc(100% - 12px),calc((100vh - 36px) * 16 / 9))!important;
    height:auto!important;
    aspect-ratio:16/9!important;
    transform:translate(-50%,-50%)!important;
    border-radius:16px!important;
    background:url('./assets/aether/aether-observatory-background-406032.webp') center/100% 100% no-repeat!important;
    box-shadow:0 0 0 1px rgba(82,210,255,.18),0 28px 80px rgba(0,0,0,.34)!important;
  }

  /* Keep manager chrome available above the inner stage in maximized/F11 operation. */
  #atlasAetherStatusPanel4084.admin-native-window-aether-watch.admin-native-maximized .atlas-aether-panel-head-4084 > .admin-native-controls{
    top:8px!important;
    right:10px!important;
  }
}
'''
CSS.write_text(css, encoding='utf-8')

# ---------------------------------------------------------------------------
# Build/version truth.
# ---------------------------------------------------------------------------
index = INDEX.read_text(encoding='utf-8')
for old, new in [
    ('content="40.6.39"', 'content="40.6.40"'),
    ('AETHER WORKBENCH FOCUS · READABILITY · Z-ORDER LOCK', RELEASE),
    ('market-core-v2.0-alpha-build-40.6.39', 'market-core-v2.0-alpha-build-40.6.40'),
    ('Build 40.6.39 · Administrator', 'Build 40.6.40 · Administrator'),
    ('admin-ribbons.css?v=administrator-build-40.6.39', 'admin-ribbons.css?v=administrator-build-40.6.40'),
    ('js/aether.js?v=administrator-build-40.6.39', 'js/aether.js?v=administrator-build-40.6.40'),
    ('js/app.js?v=administrator-build-40.6.25', 'js/app.js?v=administrator-build-40.6.40'),
]:
    require(old in index, f'index token missing: {old}')
    index = index.replace(old, new)
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
        data['asset_token'] = 'market-core-v2.0-alpha-build-40.6.40'
    if 'administrator_build' in data:
        data['administrator_build'] = BUILD_NO
    if 'build_label' in data:
        data['build_label'] = 'Build 40.6.40'
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
    data['cascade_40_6_40'] = {
        'parent_build': PARENT,
        'release': RELEASE,
        'status': STATUS,
        'aether_window_id': 'aether-watch',
        'aether_registered_in_native_definitions': True,
        'aether_window_manager_core_modified': False,
        'aether_window_manager_registry_modified': True,
        'aether_native_controls': ['move', 'minimize', 'dock', 'maximize', 'hide'],
        'aether_direct_fixed': True,
        'aether_default_presentation': 'floating-hidden',
        'aether_existing_manager_storage_owner_reused': True,
        'aether_geometry_persisted_by_existing_manager': True,
        'aether_workspace_profiles_compatible': True,
        'aether_native_maximize_97vw_97vh': True,
        'aether_maximized_inner_stage_16_9_preserved': True,
        'firefox_f11_viewport_path_ready': True,
        'graph_first_406037_preserved': True,
        'workbench_406039_preserved': True,
        'workbench_lazy_preserved': True,
        'exact_artwork_preserved': True,
        'final_wide_textless_background_deferred_until_geometry_validation': True,
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

RELEASE_MD.write_text(f'''# Agent-Crypto {BUILD_NO} — {RELEASE}

Parent: {PARENT}  
Engine: Market Core {ENGINE}

## Operator change

Aether Attention Watch is now a first-class window of the existing Administrator Window Manager.
The Observatory itself—not only its lazy Workbench—gets the canonical five-button controls:
move, minimize, detach/dock, maximize/restore and hide/restore through WINDOWS.

## Geometry contract

- Default first registration: floating + hidden, preserving the historical closed boot.
- First Aether open restores the exact current 16:9 Observatory as a movable native window.
- Native maximize uses the manager's 97vw × 97vh workspace.
- In maximize/F11, the paid 16:9 artwork remains an undistorted inner coordinate stage.
- The future wider/textless master background is deliberately deferred until this geometry is visually validated.

## Preserved

- 40.6.37 graph-first lazy hydration.
- 40.6.39 Events / History / Details Workbench and its lazy loading.
- Paid Observatory artwork byte-for-byte.
- Market Core {ENGINE}, Graph, Oracle, Lecture Technique, Chronos and Version Truth.
- No new recurring timer, observer, network owner, storage owner, automatic order or real order.
''', encoding='utf-8')

# ---------------------------------------------------------------------------
# Gates.
# ---------------------------------------------------------------------------
subprocess.run(['node', '--check', str(APP_JS)], check=True)
subprocess.run(['node', '--check', str(AETHER_JS)], check=True)
subprocess.run(['node', '--check', str(WORKBENCH)], check=True)
require(sha256(ASSET) == ASSET_SHA, 'artwork changed')
require(git_blob(WORKBENCH) == WORKBENCH_BLOB, 'Workbench changed')
require('id: "aether-watch"' in APP_JS.read_text(encoding='utf-8'), 'native Aether definition absent')
require(AETHER_MARKER in AETHER_JS.read_text(encoding='utf-8'), 'Aether manager bridge absent')
require(CSS_MARKER in CSS.read_text(encoding='utf-8'), 'Aether native chrome CSS absent')
require('manager.float("aether-watch", true)' in APP_JS.read_text(encoding='utf-8'), 'default native floating state absent')
require('aether_attention_native_window_manager:true' in AETHER_JS.read_text(encoding='utf-8'), 'Aether API native contract absent')
require('js/app.js?v=administrator-build-40.6.40' in INDEX.read_text(encoding='utf-8'), 'app.js cache truth not bumped')
require('js/aether.js?v=administrator-build-40.6.40' in INDEX.read_text(encoding='utf-8'), 'aether.js cache truth not bumped')
require('admin-ribbons.css?v=administrator-build-40.6.40' in INDEX.read_text(encoding='utf-8'), 'CSS cache truth not bumped')

# Clean upload = seven changed runtime files. Release note stays repository-side.
files = [INDEX, BUILD, ADMIN_VERSION, VERSION, APP_JS, AETHER_JS, CSS]
ZIP.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(ZIP, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for src in files:
        rel = src.relative_to(ROOT)
        z.write(src, Path('administrator') / rel)
with zipfile.ZipFile(ZIP) as z:
    names = [n for n in z.namelist() if not n.endswith('/')]
    require(len(names) == 7, f'ZIP file count drift: {len(names)} {names}')
    require(z.testzip() is None, 'ZIP integrity failed')
    require('administrator/js/app.js' in names, 'app.js absent from ZIP')
    require('administrator/js/aether.js' in names, 'aether.js absent from ZIP')
    require('administrator/admin-ribbons.css' in names, 'admin-ribbons.css absent from ZIP')
zip_sha = sha256(ZIP)
SHA.write_text(f'{zip_sha}  {ZIP.name}\n', encoding='utf-8')

print(json.dumps({
    'build': BUILD_NO,
    'app_blob': git_blob(APP_JS),
    'aether_blob': git_blob(AETHER_JS),
    'css_blob': git_blob(CSS),
    'zip_sha256': zip_sha,
    'files': 7
}, ensure_ascii=False))
