from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import subprocess
import zipfile

ROOT = Path('public/agent_crypto_erith_ia/administrator')
CSS = ROOT / 'admin-ribbons.css'
INDEX = ROOT / 'index.html'
BUILD = ROOT / 'build.json'
ADMIN_VERSION = ROOT / 'administrator-version.json'
VERSION = ROOT / 'version.json'
AETHER_JS = ROOT / 'js/aether.js'
ASSET = ROOT / 'assets/aether/aether-observatory-background-406032.webp'
RELEASE_MD = ROOT / 'RELEASE_40_6_34.md'
ZIP = Path('coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_BUILD_40_6_34_AETHER_SINGLE_STAGE_CODE_ONLY_LOCK_CLEAN_UPLOAD_7_FILES.zip')
SHA = Path(str(ZIP) + '.sha256')

PARENT = '40.6.33'
BUILD_NO = '40.6.34'
ENGINE = '38.15.11'
RELEASE = 'AETHER OBSERVATORY · SINGLE STAGE 16:9 · CODE-ONLY LOCK'
STATUS = 'aether_observatory_single_stage_16_9_code_only_lock_406034'
ASSET_SHA = '5c4d61e9410d4a701372e2d30640d6523938dfe603f65902d493b354c5f2e7b2'
AETHER_SHA = '2620262676958c0e4c10f6f70427f353624e35cf6ed2794bea32a33bb13cf87d'
MARKER = '/* 40.6.34 — AETHER SINGLE STAGE 16:9 · CODE-ONLY LOCK */'


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def require(ok, message):
    if not ok:
        raise SystemExit(message)

require(json.loads(BUILD.read_text(encoding='utf-8')).get('build') == PARENT, 'parent build drift')
require(sha256(AETHER_JS) == AETHER_SHA, 'Aether runtime drift')
require(sha256(ASSET) == ASSET_SHA, 'exact artwork drift')

css_text = CSS.read_text(encoding='utf-8').rstrip()
require(MARKER not in css_text, '40.6.34 marker already present')

css_406034 = r'''

/* 40.6.34 — AETHER SINGLE STAGE 16:9 · CODE-ONLY LOCK */
/*
   One coordinate system only:
   - the Aether panel IS the exact 16:9 artwork stage;
   - the live DOM grid fills that same stage;
   - no nested stage, no full-screen blank shell, no SVG replacement;
   - History/Details stay bounded inside the same stage.
   Runtime and selected artwork remain untouched.
*/
@media (min-width:901px){
  #atlasAetherStatusPanel4084{
    position:fixed!important;
    left:50%!important;
    right:auto!important;
    top:calc(50vh + 99px)!important;
    bottom:auto!important;
    transform:translate(-50%,-50%)!important;
    width:min(1450px,calc(100vw - 32px),calc(177.777vh - 352px))!important;
    width:min(1450px,calc(100vw - 32px),calc(177.777dvh - 352px))!important;
    height:auto!important;
    aspect-ratio:16/9!important;
    max-width:none!important;
    max-height:none!important;
    min-width:0!important;
    min-height:0!important;
    overflow:hidden!important;
    padding:0!important;
    border:1px solid rgba(73,211,255,.40)!important;
    border-radius:18px!important;
    background:url('./assets/aether/aether-observatory-background-406032.webp') center/100% 100% no-repeat!important;
    box-shadow:0 28px 90px rgba(0,0,0,.68),0 0 0 1px rgba(94,210,255,.08)!important;
    isolation:isolate!important;
    z-index:2147483000!important;
  }

  /* Retire the 40.6.31/33 outer-image layers: there is now exactly one artwork owner. */
  #atlasAetherStatusPanel4084::before,
  #atlasAetherStatusPanel4084::after{content:none!important;display:none!important}

  #atlasAetherStatusPanel4084 .atlas-aether-panel-head-4084{
    position:absolute!important;inset:0!important;z-index:80!important;pointer-events:none!important;
    padding:0!important;border:0!important;background:transparent!important;
  }
  #atlasAetherStatusPanel4084 .atlas-aether-panel-head-4084 b{display:none!important}
  #atlasAetherStatusPanel4084 [data-aether-close-4084]{
    pointer-events:auto!important;position:absolute!important;right:12px!important;top:12px!important;z-index:90!important;
    width:34px!important;height:34px!important;border-radius:50%!important;
    color:#bdeeff!important;background:rgba(2,12,25,.88)!important;border:1px solid rgba(92,216,255,.48)!important;
    box-shadow:0 6px 20px rgba(0,0,0,.34)!important;
  }

  /* The live grid fills the panel: one box, one ratio, one coordinate map. */
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030{
    position:absolute!important;inset:0!important;left:0!important;top:0!important;
    width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;aspect-ratio:auto!important;
    transform:none!important;display:block!important;margin:0!important;padding:0!important;gap:0!important;
    overflow:hidden!important;border-radius:inherit!important;background:none!important;box-shadow:none!important;isolation:isolate!important;
  }
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030::after{content:none!important;display:none!important}

  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030]{display:contents!important}
  #atlasAetherStatusPanel4084 [data-aether-focus-shell-406030]{display:contents!important;position:static!important;border:0!important;background:transparent!important;overflow:visible!important}
  #atlasAetherStatusPanel4084 .aether-focus-viewport-406030{position:static!important;width:auto!important;height:auto!important;min-height:0!important;max-height:none!important;padding:0!important;overflow:visible!important}
  #atlasAetherStatusPanel4084 [data-aether-focus-view-406030="glance"]{display:contents!important}
  #atlasAetherStatusPanel4084 [data-aether-focus-view-406030][hidden]{display:none!important}

  /* Reassert absolute ownership after the old <=1180 / short-height fallback. */
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article,
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article,
  #atlasAetherStatusPanel4084 [data-aether-focus-view-406030="glance"] > article{
    position:absolute!important;float:none!important;box-sizing:border-box!important;margin:0!important;transform:none!important;
    min-width:0!important;min-height:0!important;overflow:hidden!important;z-index:8!important;
    border:1px solid rgba(70,214,255,.46)!important;border-radius:18px!important;
    background:linear-gradient(90deg,rgba(2,12,28,.24) 0 24%,rgba(2,12,28,.96) 30%,rgba(2,12,28,.92) 100%)!important;
    box-shadow:0 10px 26px rgba(0,0,0,.30),inset 0 0 24px rgba(28,150,225,.05)!important;
    backdrop-filter:blur(2px) saturate(1.03)!important;-webkit-backdrop-filter:blur(2px) saturate(1.03)!important;
    padding:9px 12px 8px 27%!important;
  }
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 article > span,
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article > span{
    display:block!important;margin:0 0 4px!important;font-size:clamp(9.5px,.72vw,11px)!important;line-height:1.12!important;
    letter-spacing:.07em!important;color:#69e6ff!important;text-transform:uppercase!important;font-weight:850!important;
  }
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 article > b,
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article > b{
    font-size:clamp(10.8px,.86vw,13.2px)!important;line-height:1.23!important;color:#f3f8ff!important;font-weight:800!important;
  }

  /* Artwork anchors — percentages are relative to the panel itself. */
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article:has([data-aether-row-4084="convergence"]){left:37.6%!important;top:5.0%!important;width:25.2%!important;height:14.9%!important;padding-left:26%!important}
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article:has([data-aether-row-4084="divergence"]){left:64.7%!important;top:15.2%!important;width:23.8%!important;height:15.5%!important}
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article:has([data-aether-row-4084="market"]){left:65.3%!important;top:32.0%!important;width:24.0%!important;height:21.4%!important}
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="system"]){left:11.3%!important;top:15.2%!important;width:24.0%!important;height:15.3%!important}
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="sources"]){left:11.3%!important;top:32.7%!important;width:23.2%!important;height:16.1%!important}
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="atlas"]){left:11.4%!important;top:52.7%!important;width:23.2%!important;height:23.1%!important}
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="oracle"]){left:24.3%!important;top:78.0%!important;width:22.0%!important;height:13.2%!important}
  #atlasAetherStatusPanel4084 [data-aether-timeline-card-406027]{left:65.2%!important;top:56.3%!important;width:23.2%!important;height:19.9%!important;padding-left:25%!important}
  #atlasAetherStatusPanel4084 [data-aether-weather-406030]{left:52.8%!important;top:78.0%!important;width:22.2%!important;height:13.2%!important;padding-left:27%!important;display:block!important}

  /* Central live masks. Keep the lotus/rings visible; replace only baked text/value zones. */
  #atlasAetherStatusPanel4084 [data-aether-level-406030]{
    position:absolute!important;left:50%!important;top:47.0%!important;transform:translate(-50%,-50%)!important;
    width:25.4%!important;height:18.0%!important;z-index:12!important;text-align:center!important;
    border:0!important;border-radius:50%!important;padding:30px 22px 10px!important;
    background:radial-gradient(circle,rgba(2,11,27,.985) 0 55%,rgba(2,11,27,.92) 70%,rgba(2,11,27,.16) 87%,transparent 100%)!important;
    box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;
  }
  #atlasAetherStatusPanel4084 [data-aether-level-406030]::before{
    content:"AETHER\A ATTENTION WATCH"!important;white-space:pre!important;display:block!important;margin:0 0 7px!important;
    font-family:Georgia,serif!important;font-size:clamp(15px,1.3vw,20px)!important;line-height:1.03!important;letter-spacing:.075em!important;
    color:#dce8ff!important;text-shadow:0 0 15px rgba(80,177,255,.68)!important;
  }
  #atlasAetherStatusPanel4084 [data-aether-level-406030] > span{font-size:clamp(8.5px,.68vw,10px)!important;color:#73e9ff!important;margin-bottom:4px!important}
  #atlasAetherStatusPanel4084 [data-aether-level-406030] [data-aether-row-4084="level"]{display:block!important;font-size:clamp(12px,1.05vw,16.5px)!important;line-height:1.16!important;color:#ffd66d!important;overflow:hidden!important}

  #atlasAetherStatusPanel4084 [data-aether-action-406030]{
    position:absolute!important;left:50%!important;top:62.0%!important;transform:translate(-50%,-50%)!important;
    width:30.0%!important;height:13.3%!important;z-index:12!important;text-align:center!important;
    border:0!important;border-radius:16px!important;padding:8px 14px!important;background:rgba(2,11,27,.94)!important;
    box-shadow:0 8px 22px rgba(0,0,0,.22)!important;display:block!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;
  }
  #atlasAetherStatusPanel4084 [data-aether-action-406030] > span{font-size:clamp(8.5px,.68vw,10px)!important;color:#73e9ff!important;margin-bottom:3px!important}
  #atlasAetherStatusPanel4084 [data-aether-action-406030] > b{display:block!important;font-size:clamp(9.5px,.78vw,12.2px)!important;line-height:1.2!important;color:#f4e4a0!important;max-height:48px!important;overflow:hidden!important}
  #atlasAetherStatusPanel4084 [data-aether-action-406030] > small{display:block!important;margin-top:3px!important;font-size:clamp(8.5px,.68vw,10.6px)!important;line-height:1.16!important;color:#ffc8e6!important;max-height:27px!important;overflow:hidden!important}

  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article > small{display:block!important;margin-top:4px!important;font-size:clamp(8.5px,.65vw,10.2px)!important;line-height:1.16!important;color:#79f0d1!important;font-weight:750!important}
  #atlasAetherStatusPanel4084 [data-aether-weather-406030] > b{white-space:pre-line!important;font-size:clamp(9.5px,.76vw,11.7px)!important;line-height:1.23!important}
  #atlasAetherStatusPanel4084 [data-aether-weather-406030] > small{font-size:clamp(8px,.64vw,9.8px)!important;line-height:1.16!important;color:#bcecff!important}
  #atlasAetherStatusPanel4084 [data-aether-timeline-preview-406028]{display:grid!important;gap:3px!important;margin-top:3px!important}
  #atlasAetherStatusPanel4084 .aether-timeline-row-406027{grid-template-columns:43px 42px 46px minmax(0,1fr)!important;gap:3px!important;padding:2px 3px!important;font-size:clamp(8px,.62vw,9.6px)!important;line-height:1.1!important;background:rgba(1,9,20,.38)!important}
  #atlasAetherStatusPanel4084 .aether-timeline-detail-406027{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;font-size:inherit!important}

  /* One toolbar and one bounded secondary layer. No full-panel replacement and no blank shell. */
  #atlasAetherStatusPanel4084 .aether-focus-toolbar-406030{
    position:absolute!important;right:1.6%!important;bottom:1.4%!important;z-index:50!important;display:flex!important;justify-content:flex-end!important;
    border:1px solid rgba(91,210,255,.22)!important;background:rgba(2,12,25,.84)!important;border-radius:10px!important;padding:4px!important;
  }
  #atlasAetherStatusPanel4084 .aether-focus-toolbar-406030 > b{display:none!important}
  #atlasAetherStatusPanel4084 [data-aether-focus-button-406030]{font-size:10px!important;padding:5px 8px!important}

  #atlasAetherStatusPanel4084 [data-aether-focus-view-406030="history"],
  #atlasAetherStatusPanel4084 [data-aether-focus-view-406030="details"]{
    position:absolute!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;
    width:58%!important;height:46%!important;z-index:45!important;box-sizing:border-box!important;
    padding:13px!important;border:1px solid rgba(81,210,255,.50)!important;border-radius:18px!important;
    background:rgba(2,12,27,.975)!important;box-shadow:0 18px 60px rgba(0,0,0,.62)!important;overflow:hidden!important;
  }
  #atlasAetherStatusPanel4084 [data-aether-focus-view-406030="history"] [data-aether-timeline-406027],
  #atlasAetherStatusPanel4084 .aether-details-grid-406030{height:calc(100% - 25px)!important;overflow-y:auto!important;overflow-x:hidden!important;scrollbar-gutter:stable!important}
  #atlasAetherStatusPanel4084 .aether-details-grid-406030{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important}
  #atlasAetherStatusPanel4084 .aether-details-grid-406030 article{position:static!important;transform:none!important;width:auto!important;height:auto!important;margin:0!important;padding:9px!important;background:rgba(4,20,38,.82)!important}
}
'''

CSS.write_text(css_text + css_406034.rstrip() + '\n', encoding='utf-8')

index = INDEX.read_text(encoding='utf-8')
for old, new in [
    ('content="40.6.33"', 'content="40.6.34"'),
    ('AETHER OBSERVATORY · EXACT ARTWORK STAGE · RESPONSIVE ALIGNMENT LOCK', RELEASE),
    ('market-core-v2.0-alpha-build-40.6.33', 'market-core-v2.0-alpha-build-40.6.34'),
    ('Build 40.6.33 · Administrator', 'Build 40.6.34 · Administrator'),
    ('admin-ribbons.css?v=administrator-build-40.6.33', 'admin-ribbons.css?v=administrator-build-40.6.34'),
]:
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
        data['asset_token'] = 'market-core-v2.0-alpha-build-40.6.34'
    if 'administrator_build' in data:
        data['administrator_build'] = BUILD_NO
    if 'build_label' in data:
        data['build_label'] = 'Build 40.6.34'
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
    data['cascade_40_6_34'] = {
        'parent_build': PARENT,
        'release': RELEASE,
        'status': STATUS,
        'scope': 'presentation_only',
        'single_coordinate_stage': True,
        'panel_is_16_9_stage': True,
        'nested_stage_retired': True,
        'exact_artwork_preserved': True,
        'code_only': True,
        'aether_runtime_modified': False,
        'market_core_modified': False,
        'window_manager_modified': False,
        'new_timer': False,
        'new_observer': False,
        'new_network_owner': False,
        'new_storage_owner': False,
    }
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

RELEASE_MD.write_text(f'''# Agent-Crypto 40.6.34 — AETHER OBSERVATORY · SINGLE STAGE 16:9 · CODE-ONLY LOCK

Parent: **{PARENT}**  
Market Core: **{ENGINE} — protected**  
Generated: **{now}**

## Cause
40.6.33 still had two geometry owners: a large modal shell and a nested 16:9 artwork stage. On Firefox, short-height/compact rules could therefore size the shell and the live cards against different boxes, producing the large empty right-hand surface and clipped content seen in the operator capture.

## Correction
- The Aether panel itself is now the single 16:9 coordinate stage.
- The selected artwork is the only background owner.
- The live DOM grid fills exactly the same box.
- Existing radial percentages are resolved against that one stage only.
- The historical <=1180 / short-height stacked fallback is overridden on desktop.
- History and Details remain bounded secondary overlays inside the same stage.
- No image generation and no SVG replacement.

## Protected
- `js/aether.js` byte-for-byte unchanged.
- Exact selected artwork byte-for-byte unchanged.
- Market Core 38.15.11 unchanged.
- Graphique, Lecture Technique, Oracle runtime, Chronos, Version Truth, Window Manager, Paper/Safety and Parker untouched.
- No timer, observer, storage, fetch or network owner added.

## Operator test
Firefox: Ctrl+F5 → Aether Attention → verify the whole Observatory is one centered 16:9 surface → Historique → Détails → Vue → close.
''', encoding='utf-8')

require(sha256(AETHER_JS) == AETHER_SHA, 'Aether runtime changed')
require(sha256(ASSET) == ASSET_SHA, 'artwork changed')
require(MARKER in CSS.read_text(encoding='utf-8'), '40.6.34 CSS marker missing')
require('content="40.6.34"' in INDEX.read_text(encoding='utf-8'), 'index build token missing')
require('admin-ribbons.css?v=administrator-build-40.6.34' in INDEX.read_text(encoding='utf-8'), 'CSS cache token missing')
for path in (BUILD, ADMIN_VERSION, VERSION):
    json.loads(path.read_text(encoding='utf-8'))

subprocess.run(['node', '--check', str(AETHER_JS)], check=True)
subprocess.run(['git', 'diff', '--check'], check=True)

ZIP.parent.mkdir(parents=True, exist_ok=True)
if ZIP.exists():
    ZIP.unlink()
files = {
    'administrator/admin-ribbons.css': CSS,
    'administrator/index.html': INDEX,
    'administrator/build.json': BUILD,
    'administrator/administrator-version.json': ADMIN_VERSION,
    'administrator/version.json': VERSION,
    'administrator/RELEASE_40_6_34.md': RELEASE_MD,
    'administrator/assets/aether/aether-observatory-background-406032.webp': ASSET,
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
print(f'Aether runtime SHA preserved: {sha256(AETHER_JS)}')
print(f'Artwork SHA preserved: {sha256(ASSET)}')
print(f'ZIP SHA256: {zip_sha}')
