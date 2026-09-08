from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
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
RELEASE_MD = ROOT / 'RELEASE_40_6_41.md'
ZIP = Path('coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_BUILD_40_6_41_AETHER_FREE_RESIZE_SHELL_STAGE_SEPARATION_CLEAN_UPLOAD_7_FILES.zip')
SHA = Path(str(ZIP) + '.sha256')

PARENT = '40.6.40'
BUILD_NO = '40.6.41'
ENGINE = '38.15.11'
RELEASE = 'AETHER FREE RESIZE · SHELL / 16:9 STAGE SEPARATION'
STATUS = 'aether_free_resize_shell_stage_separation_406041'
APP_BLOB = '1cd18ff77a2e1ae42a8aac22ca029376e9d0d393'
AETHER_BLOB = 'cd627cbdf454be000a414d9ff185b55fb2fde5fe'
CSS_BLOB = '27c13c023d8c5b52b2015ccb88aa6f3e609b5d95'
WORKBENCH_BLOB = '21145af3e8695dd4cb6366423d5d8c9f62ab9aa1'
ASSET_SHA = '5c4d61e9410d4a701372e2d30640d6523938dfe603f65902d493b354c5f2e7b2'
CSS_MARKER = '/* 40.6.41 — AETHER FREE RESIZE · SHELL / 16:9 STAGE SEPARATION */'


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


def replace_required(text: str, old: str, new: str, label: str) -> str:
    require(old in text, f'missing patch anchor: {label}')
    return text.replace(old, new)


truth = json.loads(BUILD.read_text(encoding='utf-8'))
require(truth.get('build') == PARENT, f'parent build drift: {truth.get("build")}')
require(truth.get('engine') == ENGINE, 'Market Core drift')
require(git_blob(APP_JS) == APP_BLOB, f'app.js drift: {git_blob(APP_JS)}')
require(git_blob(AETHER_JS) == AETHER_BLOB, f'aether.js drift: {git_blob(AETHER_JS)}')
require(git_blob(CSS) == CSS_BLOB, f'admin-ribbons drift: {git_blob(CSS)}')
require(git_blob(WORKBENCH) == WORKBENCH_BLOB, f'workbench drift: {git_blob(WORKBENCH)}')
require(sha256(ASSET) == ASSET_SHA, 'exact Aether artwork drift')

# Presentation-only correction: the native Aether window becomes a freely
# resizable shell while the calibrated artwork/live coordinate map remains a
# contained 16:9 inner stage. The existing Window Manager already persists
# directFixed geometry on pointerup, so no second resize observer/owner is added.
css = CSS.read_text(encoding='utf-8')
require(CSS_MARKER not in css, '40.6.41 CSS already applied')
css += r'''

/* 40.6.41 — AETHER FREE RESIZE · SHELL / 16:9 STAGE SEPARATION */
/*
   The Administrator window is now the resizable owner.
   The paid Observatory artwork + calibrated live lanes remain one undistorted 16:9 inner stage.
   No runtime/data owner, observer or parallel geometry persistence is introduced.
*/
@media (min-width:901px){
  #atlasAetherStatusPanel4084.admin-native-window-aether-watch.admin-native-direct-floating:not(.admin-native-maximized){
    aspect-ratio:auto!important;
    resize:both!important;
    box-sizing:border-box!important;
    min-width:720px!important;
    min-height:405px!important;
    max-width:calc(100vw - 24px)!important;
    max-height:calc(100vh - 24px)!important;
    overflow:hidden!important;
    container-type:size!important;
    container-name:aether-shell-406041!important;
    background:
      radial-gradient(circle at 50% 48%,rgba(16,66,104,.22),transparent 42%),
      radial-gradient(circle at 12% 18%,rgba(62,215,255,.08),transparent 28%),
      radial-gradient(circle at 88% 82%,rgba(149,99,255,.07),transparent 30%),
      #010711!important;
    border-color:rgba(73,211,255,.46)!important;
    box-shadow:0 28px 90px rgba(0,0,0,.68),inset 0 0 0 1px rgba(92,215,255,.035)!important;
  }

  /* The image is no longer the window box. It is a centered content stage. */
  #atlasAetherStatusPanel4084.admin-native-window-aether-watch.admin-native-direct-floating:not(.admin-native-maximized) .aether-first-glance-grid-406030{
    position:absolute!important;
    inset:auto!important;
    left:50%!important;
    top:50%!important;
    height:calc(100% - 14px)!important;
    width:auto!important;
    max-width:none!important;
    max-height:none!important;
    aspect-ratio:16/9!important;
    transform:translate(-50%,-50%)!important;
    margin:0!important;
    padding:0!important;
    overflow:hidden!important;
    border-radius:15px!important;
    background:url('./assets/aether/aether-observatory-background-406032.webp') center/100% 100% no-repeat!important;
    box-shadow:0 0 0 1px rgba(82,210,255,.16),0 18px 55px rgba(0,0,0,.34)!important;
    isolation:isolate!important;
  }

  /* Wide shell -> fit stage by height. Narrow/tall shell -> fit stage by width. */
  @container aether-shell-406041 (max-aspect-ratio: 16 / 9){
    #atlasAetherStatusPanel4084.admin-native-window-aether-watch.admin-native-direct-floating:not(.admin-native-maximized) .aether-first-glance-grid-406030{
      width:calc(100% - 14px)!important;
      height:auto!important;
    }
  }

  /* Small, non-intercepting visual cue for Firefox's native bottom-right resize grip. */
  #atlasAetherStatusPanel4084.admin-native-window-aether-watch.admin-native-direct-floating:not(.admin-native-maximized)::after{
    content:""!important;
    display:block!important;
    position:absolute!important;
    right:3px!important;
    bottom:3px!important;
    width:17px!important;
    height:17px!important;
    z-index:170!important;
    pointer-events:none!important;
    opacity:.72!important;
    background:
      linear-gradient(135deg,transparent 0 45%,rgba(106,232,255,.72) 46% 51%,transparent 52% 63%,rgba(106,232,255,.46) 64% 69%,transparent 70%)!important;
  }

  #atlasAetherStatusPanel4084.admin-native-window-aether-watch.admin-native-maximized{
    resize:none!important;
    container-type:normal!important;
  }
}
'''
CSS.write_text(css, encoding='utf-8')

# Build/version truth + CSS cache bust only. Runtime JS stays byte-for-byte.
index = INDEX.read_text(encoding='utf-8')
index = replace_required(index, 'content="40.6.40"', 'content="40.6.41"', 'build meta')
index = replace_required(index, 'AETHER NATIVE WINDOW · ADMINISTRATOR MANAGER INTEGRATION', RELEASE, 'release meta')
index = replace_required(index, 'market-core-v2.0-alpha-build-40.6.40', 'market-core-v2.0-alpha-build-40.6.41', 'asset token')
index = replace_required(index, 'Build 40.6.40 · Administrator', 'Build 40.6.41 · Administrator', 'build label')
index = replace_required(index, 'admin-ribbons.css?v=administrator-build-40.6.40', 'admin-ribbons.css?v=administrator-build-40.6.41', 'CSS cache bust')
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
        data['asset_token'] = 'market-core-v2.0-alpha-build-40.6.41'
    if 'administrator_build' in data:
        data['administrator_build'] = BUILD_NO
    if 'build_label' in data:
        data['build_label'] = 'Build 40.6.41'
    if 'release_status' in data:
        data['release_status'] = RELEASE
    for key in ('timestamp','prepared_at','published_at'):
        if key in data:
            data[key] = now
    if isinstance(data.get('current_version_truth'), dict):
        data['current_version_truth']['loaded_build'] = BUILD_NO
    data['cascade_40_6_41'] = {
        'parent_build': PARENT,
        'release': RELEASE,
        'status': STATUS,
        'aether_native_window_406040_preserved': True,
        'free_resize': True,
        'resize_owner': 'browser native CSS resize + existing Administrator Window Manager pointerup persistence',
        'shell_aspect_ratio_locked': False,
        'inner_stage_aspect_ratio': '16/9',
        'inner_stage_fit': 'contain via CSS size-container aspect query',
        'artwork_is_window_box': False,
        'artwork_is_inner_stage': True,
        'artwork_modified': False,
        'live_embroidery_coordinates_modified': False,
        'aether_runtime_modified': False,
        'workbench_runtime_modified': False,
        'window_manager_core_modified': False,
        'app_native_definition_modified': False,
        'new_resize_observer': False,
        'new_recurring_timer': False,
        'new_network_owner': False,
        'new_storage_owner': False,
        'market_core_modified': False,
        'graph_runtime_modified': False,
        'oracle_runtime_modified': False,
        'technical_reading_modified': False,
        'chronos_modified': False,
        'automatic_order': False,
        'real_order': False
    }
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

RELEASE_MD.write_text(f'''# Agent-Crypto {BUILD_NO} — {RELEASE}

Parent: {PARENT}  
Engine: Market Core {ENGINE}

## Corrective target

The 40.6.40 native Aether window was movable and maximizable, but its normal shell still inherited the historical 16:9 artwork geometry. That made the image effectively own the window size.

40.6.41 separates those responsibilities:

- **outer shell** = free native Administrator window, resizable in width and height;
- **inner stage** = existing calibrated 16:9 Observatory artwork + live DOM embroidery;
- unused shell space uses a restrained code-only dark Observatory fill;
- the current artwork is never stretched;
- Firefox native resize geometry is persisted by the already-existing directFixed `pointerup -> persistGeometry()` path in the canonical Window Manager.

## Operator test

1. Open Aether.
2. Resize from the bottom-right corner: wider, taller, then narrower/taller.
3. Confirm the shell changes ratio while the Observatory stage remains undistorted and centered.
4. Move the resized window, close/reopen or reload, and verify the saved geometry returns.
5. Maximize/restore and verify the native 40.6.40 path still works.

## Preserved

- Aether runtime byte-for-byte.
- 40.6.39 Workbench byte-for-byte.
- `js/core/admin-window-manager.js` untouched.
- `js/app.js` native Aether definition untouched.
- paid Observatory artwork byte-for-byte.
- Market Core 38.15.11, Graph, Oracle, Lecture Technique, Chronos and Version Truth behavior.
- no new observer, recurring timer, network/storage owner, automatic order or real order.

The final wider/textless artwork remains deliberately deferred until this free-resize shell is visually validated.
''', encoding='utf-8')

# Gates.
subprocess.run(['node', '--check', str(APP_JS)], check=True)
subprocess.run(['node', '--check', str(AETHER_JS)], check=True)
subprocess.run(['node', '--check', str(WORKBENCH)], check=True)
require(git_blob(APP_JS) == APP_BLOB, 'app.js changed unexpectedly')
require(git_blob(AETHER_JS) == AETHER_BLOB, 'aether.js changed unexpectedly')
require(git_blob(WORKBENCH) == WORKBENCH_BLOB, 'Workbench changed unexpectedly')
require(sha256(ASSET) == ASSET_SHA, 'artwork changed unexpectedly')
require(CSS_MARKER in CSS.read_text(encoding='utf-8'), 'free-resize marker missing')
require('resize:both!important' in CSS.read_text(encoding='utf-8'), 'native resize missing')
require('container-name:aether-shell-406041!important' in CSS.read_text(encoding='utf-8'), 'shell container missing')
require('@container aether-shell-406041 (max-aspect-ratio: 16 / 9)' in CSS.read_text(encoding='utf-8'), 'stage contain query missing')
require('"engine": "38.15.11"' in BUILD.read_text(encoding='utf-8'), 'engine truth changed')

files = [INDEX, BUILD, ADMIN_VERSION, VERSION, CSS, APP_JS, RELEASE_MD]
ZIP.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(ZIP, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for src in files:
        z.write(src, Path('administrator') / src.relative_to(ROOT))
with zipfile.ZipFile(ZIP) as z:
    names = [n for n in z.namelist() if not n.endswith('/')]
    require(len(names) == 7, f'ZIP file count drift: {len(names)} {names}')
    require(z.testzip() is None, 'ZIP integrity failed')
    require('administrator/admin-ribbons.css' in names, 'free-resize CSS absent from ZIP')

zip_sha = sha256(ZIP)
SHA.write_text(f'{zip_sha}  {ZIP.name}\n', encoding='utf-8')
print(json.dumps({'build': BUILD_NO, 'zip_sha256': zip_sha, 'files': 7}, ensure_ascii=False))
