from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import subprocess
import zipfile

ROOT = Path('public/agent_crypto_erith_ia/administrator')
CSS = ROOT / 'admin-ribbons.css'
PATCH = Path('.github/scripts/aether_40636_typography_calibration.css')
INDEX = ROOT / 'index.html'
BUILD = ROOT / 'build.json'
ADMIN_VERSION = ROOT / 'administrator-version.json'
VERSION = ROOT / 'version.json'
AETHER_JS = ROOT / 'js/aether.js'
ASSET = ROOT / 'assets/aether/aether-observatory-background-406032.webp'
RELEASE_MD = ROOT / 'RELEASE_40_6_36.md'
ZIP = Path('coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_BUILD_40_6_36_AETHER_TYPOGRAPHY_CALIBRATION_PAINTED_LANE_LOCK_CLEAN_UPLOAD_7_FILES.zip')
SHA = Path(str(ZIP) + '.sha256')

PARENT = '40.6.35'
BUILD_NO = '40.6.36'
ENGINE = '38.15.11'
RELEASE = 'AETHER OBSERVATORY · TYPOGRAPHY CALIBRATION · PAINTED-LANE LOCK'
STATUS = 'aether_observatory_typography_calibration_painted_lane_lock_406036'
ASSET_SHA = '5c4d61e9410d4a701372e2d30640d6523938dfe603f65902d493b354c5f2e7b2'
AETHER_SHA = '2620262676958c0e4c10f6f70427f353624e35cf6ed2794bea32a33bb13cf87d'
PARENT_MARKER = '/* 40.6.35 — AETHER LIVE EMBROIDERY · BACKGROUND-FIRST UI */'
MARKER = '/* 40.6.36 — AETHER TYPOGRAPHY CALIBRATION · PAINTED-LANE LOCK */'


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def require(ok, message):
    if not ok:
        raise SystemExit(message)


truth = json.loads(BUILD.read_text(encoding='utf-8'))
require(truth.get('build') == PARENT, f'parent build drift: {truth.get("build")}')
require(truth.get('engine') == ENGINE, 'Market Core drift')
require(sha256(AETHER_JS) == AETHER_SHA, 'Aether runtime drift')
require(sha256(ASSET) == ASSET_SHA, 'exact artwork drift')
require(PATCH.exists(), 'typography patch missing')

css = CSS.read_text(encoding='utf-8').rstrip()
patch = PATCH.read_text(encoding='utf-8').strip()
require(PARENT_MARKER in css, '40.6.35 embroidery marker missing')
require(MARKER not in css, '40.6.36 marker already present')
require(patch.startswith(MARKER), '40.6.36 patch marker mismatch')
CSS.write_text(css + '\n\n' + patch + '\n', encoding='utf-8')

index = INDEX.read_text(encoding='utf-8')
for old, new in [
    ('content="40.6.35"', 'content="40.6.36"'),
    ('AETHER OBSERVATORY · LIVE EMBROIDERY · BACKGROUND-FIRST UI', RELEASE),
    ('market-core-v2.0-alpha-build-40.6.35', 'market-core-v2.0-alpha-build-40.6.36'),
    ('Build 40.6.35 · Administrator', 'Build 40.6.36 · Administrator'),
    ('admin-ribbons.css?v=administrator-build-40.6.35', 'admin-ribbons.css?v=administrator-build-40.6.36'),
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
        data['asset_token'] = 'market-core-v2.0-alpha-build-40.6.36'
    if 'administrator_build' in data:
        data['administrator_build'] = BUILD_NO
    if 'build_label' in data:
        data['build_label'] = 'Build 40.6.36'
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
    data['cascade_40_6_36'] = {
        'parent_build': PARENT,
        'release': RELEASE,
        'status': STATUS,
        'scope': 'presentation_only',
        'background_first_406035_preserved': True,
        'exact_1440x810_coordinate_baseline': True,
        'stale_geometry_reset': True,
        'convergence_transform_retired': True,
        'timeline_width_100_retired': True,
        'painted_text_lanes_calibrated': True,
        'center_attention_compacted': True,
        'center_watch_compacted': True,
        'exact_artwork_preserved': True,
        'image_generation': False,
        'svg_replacement': False,
        'aether_runtime_modified': False,
        'market_core_modified': False,
        'window_manager_modified': False,
        'new_timer': False,
        'new_observer': False,
        'new_network_owner': False,
        'new_storage_owner': False,
    }
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

RELEASE_MD.write_text(f'''# Agent-Crypto 40.6.36 — AETHER OBSERVATORY · TYPOGRAPHY CALIBRATION · PAINTED-LANE LOCK

Parent: **{PARENT}**  
Market Core: **{ENGINE} — protected**  
Generated: **{now}**

## Visual diagnosis from Firefox 40.6.35
The background-first architecture is validated. Remaining defects are typography/coordinate debt, not architecture debt.

Two inherited CSS contracts were still visible:
- Convergence kept an old `translateX(-50%)`, shifting its live value out of the painted card.
- Events preview kept an old `width:100%`, so absolute left/right placement overflowed the painted Events card.

The other cards were broadly aligned but needed local mask, line-height and text-lane calibration against the exact 1440x810 artwork.

## Correction
- Keeps the paid artwork as the only cockpit skin.
- Resets stale `right`, `bottom` and `transform` geometry on painted-card owners.
- Removes the inherited Events preview `width:100%` conflict.
- Calibrates Convergence, Divergence, System, Sources, Atlas, Market, Oracle, Weather and Events text lanes.
- Makes masks nearly opaque only over baked sample values; icons, titles, card shells and ornaments remain artwork-owned.
- Compacts the central Attention value into its painted capsule.
- Compacts the center Watch text below the painted yellow heading and keeps the note to one quiet line.
- Preserves History and Details as separate interactive views.

## Protected
- `js/aether.js` byte-for-byte unchanged.
- Exact Observatory artwork byte-for-byte unchanged.
- Market Core 38.15.11 unchanged.
- Graphique, Lecture Technique, Oracle runtime, Chronos, Version Truth, Window Manager, Paper/Safety and Parker untouched.
- No timer, observer, storage, fetch or network owner added.

## Firefox acceptance
Ctrl+F5 → Aether Attention. Verify first: Convergence returns inside its painted card; Events rows stay inside Events; central Attention/Watch no longer cross into adjacent cards. Then inspect all nine live lanes and test Historique → Détails → Vue → close.
''', encoding='utf-8')

require(sha256(AETHER_JS) == AETHER_SHA, 'Aether runtime changed')
require(sha256(ASSET) == ASSET_SHA, 'artwork changed')
final_css = CSS.read_text(encoding='utf-8')
require(PARENT_MARKER in final_css, '40.6.35 marker lost')
require(MARKER in final_css, '40.6.36 CSS marker missing')
final_index = INDEX.read_text(encoding='utf-8')
require('content="40.6.36"' in final_index, 'index build token missing')
require('admin-ribbons.css?v=administrator-build-40.6.36' in final_index, 'CSS cache token missing')
for path in (BUILD, ADMIN_VERSION, VERSION):
    data = json.loads(path.read_text(encoding='utf-8'))
    require(data.get('build') == BUILD_NO, f'{path.name}: build update failed')
require(json.loads(BUILD.read_text(encoding='utf-8')).get('engine') == ENGINE, 'build.json Market Core drift')

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
    'administrator/RELEASE_40_6_36.md': RELEASE_MD,
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