#!/usr/bin/env python3
from pathlib import Path
import datetime
import hashlib
import json

BASE = Path('public/agent_crypto_erith_ia/administrator')
OLD = '40.4.232'
NEW = '40.4.233'
RELEASE = 'TECHNICAL READING · CANONICAL 40.3.38 OWNER RESTORE LOCK'
STATUS = 'technical_reading_canonical_owner_restore_404233'
DUPLICATE_OWNER = BASE / 'technical-reading-cockpit-parity.css'
WORKFLOW = Path('.github/workflows/aether-40-4-233-technical-reading-owner-restore.yml')
SELF = Path('.github/scripts/aether_40_4_233_technical_reading_owner_restore.py')
NOW = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')


def text(path: Path) -> str:
    return path.read_text(encoding='utf-8')


def write(path: Path, value: str) -> None:
    path.write_text(value, encoding='utf-8')


def one(value: str, old: str, new: str, label: str) -> str:
    count = value.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 occurrence, got {count}')
    return value.replace(old, new, 1)


def sha(rel: str) -> str:
    return hashlib.sha256((BASE / rel).read_bytes()).hexdigest()


# Preconditions: this release corrects only the reproduced 40.4.232 regression.
version = json.loads(text(BASE / 'version.json'))
if version.get('build') != OLD:
    raise SystemExit(f'Expected canonical build {OLD}, got {version.get("build")!r}')
if not DUPLICATE_OWNER.is_file():
    raise SystemExit('40.4.231/232 duplicate Technical Reading owner is missing')

canonical_owner = text(BASE / 'admin-visual-cache.css')
for marker in (
    '40.3.38 TECHNICAL READING — METALLIC DEPTH OPACITY',
    '--atlas-tr-depth-kpi: rgba(2,9,18,.78)',
    '--atlas-tr-classic-primary: rgba(2,9,18,.24)',
    '--atlas-tr-classic-shell: rgba(3,11,22,.10)',
):
    if marker not in canonical_owner:
        raise SystemExit(f'Canonical 40.3.38 Technical Reading owner drift: missing {marker}')

# 1) Retire the duplicate final stylesheet from the document. Do not add a replacement.
idx_path = BASE / 'index.html'
idx = text(idx_path)
idx = one(
    idx,
    '  <link rel="stylesheet" href="./technical-reading-cockpit-parity.css?v=40.4.232" data-technical-reading-cockpit-parity="true" />\n',
    '',
    'duplicate Technical Reading stylesheet link',
)
if idx.count('<link rel="stylesheet" href="./admin-visual-cache.css"') != 1:
    raise SystemExit('Canonical admin-visual-cache.css owner is not loaded exactly once')

# Version-truth surfaces only.
idx = one(idx, '<meta name="atlas-build" content="40.4.232" />', '<meta name="atlas-build" content="40.4.233" />', 'meta atlas-build')
idx = one(idx, '<meta name="administrator-build" content="40.4.232" />', '<meta name="administrator-build" content="40.4.233" />', 'meta administrator-build')
idx = one(idx, '<meta name="administrator-release" content="TECHNICAL READING · HISTORICAL FULL-FRAME NEAR-ZERO GLASS RESTORE LOCK" />', f'<meta name="administrator-release" content="{RELEASE}" />', 'meta release')
idx = one(idx, '<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.4.232" />', '<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.4.233" />', 'asset token')
idx = one(idx, '<title>Agent-Crypto @erith.IA — Build 40.4.232 · Administrator</title>', '<title>Agent-Crypto @erith.IA — Build 40.4.233 · Administrator</title>', 'title build')
idx = one(idx, 'aria-label="Version Agent-Crypto installée : Build 40.4.232, mode Administrator"', 'aria-label="Version Agent-Crypto installée : Build 40.4.233, mode Administrator"', 'first-paint aria build')
idx = one(idx, '<span id="atlasVersionControlText">Build 40.4.232</span>', '<span id="atlasVersionControlText">Build 40.4.233</span>', 'first-paint badge')
idx = one(idx, '<script src="./js/views/system-presentation.js?v=administrator-build-40.4.232"></script>', '<script src="./js/views/system-presentation.js?v=administrator-build-40.4.233"></script>', 'System loader token')
idx = one(idx, 'Agent-Crypto @erith.IA · Market Core · Build 40.4.232 · Version : Parker Lewis Can\'t Lose', 'Agent-Crypto @erith.IA · Market Core · Build 40.4.233 · Version : Parker Lewis Can\'t Lose', 'footer build')
idx = one(idx, '<script src="./app.js?v=administrator-build-40.4.232"></script>', '<script src="./app.js?v=administrator-build-40.4.233"></script>', 'root app cache token')
idx = one(idx, '<script src="./js/app.js?v=administrator-build-40.4.232"></script>', '<script src="./js/app.js?v=administrator-build-40.4.233"></script>', 'Administrator app cache token')
idx = one(idx, '<script src="./js/version-truth.js?v=40.4.232"></script>', '<script src="./js/version-truth.js?v=40.4.233"></script>', 'version truth token')
write(idx_path, idx)

# 2) Runtime identity only. No functional handler/data changes.
root_app = text(BASE / 'app.js')
root_app = one(root_app, 'const ATLAS_BUILD = "40.4.232";', 'const ATLAS_BUILD = "40.4.233";', 'root runtime build')
write(BASE / 'app.js', root_app)

admin_app = text(BASE / 'js/app.js')
admin_app = one(admin_app, 'const ADMIN_BUILD = "40.4.232";', 'const ADMIN_BUILD = "40.4.233";', 'Administrator runtime build')
admin_app = one(admin_app, 'const ADMIN_RELEASE = "TECHNICAL READING · HISTORICAL FULL-FRAME NEAR-ZERO GLASS RESTORE LOCK";', f'const ADMIN_RELEASE = "{RELEASE}";', 'Administrator release')
write(BASE / 'js/app.js', admin_app)

system_path = BASE / 'js/views/system-presentation.js'
system = text(system_path)
system = one(system, 'const SOURCE="./views/system.html?v=administrator-build-40.4.232";', 'const SOURCE="./views/system.html?v=administrator-build-40.4.233";', 'System presentation cache token')
write(system_path, system)

# 3) Build/mirror identity.
build_path = BASE / 'build.json'
build = json.loads(text(build_path))
build['build'] = NEW
build['release'] = RELEASE
build['status'] = STATUS
write(build_path, json.dumps(build, ensure_ascii=False, indent=2) + '\n')

contract = {
    'state': 'active',
    'scope': 'technical_reading_canonical_owner_restore',
    'reproduced_from_user_screenshot': True,
    'root_cause': '40.4.231/232 duplicate final stylesheet overrode the already-canonical Technical Reading stack',
    'retired_duplicate_css_owner': True,
    'retired_file': 'technical-reading-cockpit-parity.css',
    'canonical_visual_owner': 'admin-visual-cache.css',
    'canonical_visual_reference': '40.3.38',
    'canonical_geometry_preserved': True,
    'duplicate_final_stylesheet_loaded': False,
    'rnd_changed': False,
    'local_upload_changed': False,
    'portrait_source_changed': False,
    'image_assets_changed': False,
    'market_graph_changed': False,
    'parallel_markets_changed': False,
    'renderer_changed': False,
    'data_changed': False,
    'math_changed': False,
    'atlas_changed': False,
    'window_manager_changed': False,
    'bridge_changed': False,
    'storage_changed': False,
    'market_core_modified': False,
    'new_timer': False,
    'new_observer': False,
    'new_fetch': False,
    'new_websocket': False,
    'new_scheduler': False,
}

mirror_path = BASE / 'administrator-version.json'
mirror = json.loads(text(mirror_path))
mirror.update({
    'build': NEW,
    'release': RELEASE,
    'status': STATUS,
    'prepared_at': NOW,
    'published_at': NOW,
    'global_versioning': NEW,
    'asset_token': f'market-core-v2.0-alpha-build-{NEW}',
    'parent_build': OLD,
})
mirror.setdefault('contracts', {})['technical_reading_canonical_owner_restore_404233'] = contract
write(mirror_path, json.dumps(mirror, ensure_ascii=False, indent=2) + '\n')

# 4) Canonical manifest + payload hashes.
version = json.loads(text(BASE / 'version.json'))
version.update({
    'build': NEW,
    'release': RELEASE,
    'status': STATUS,
    'prepared_at': NOW,
    'published_at': NOW,
    'asset_token': f'market-core-v2.0-alpha-build-{NEW}',
    'parent_build': OLD,
})
version.setdefault('contracts', {})['technical_reading_canonical_owner_restore_404233'] = contract
version['lineage'] = str(version.get('lineage', '')) + (
    ' → 40.4.233 Technical Reading canonical owner restore: 40.4.231/232 duplicate final stylesheet retired; '
    'existing geometry and admin-visual-cache.css 40.3.38 metallic depth resume authority; RND/local images, Graph, '
    'markets, Atlas, Math, Window Manager and Market Core unchanged.'
)
version.setdefault('files', {}).pop('technical-reading-cockpit-parity.css', None)
write(BASE / 'version.json', json.dumps(version, ensure_ascii=False, indent=2) + '\n')

version = json.loads(text(BASE / 'version.json'))
for rel in ('index.html', 'app.js', 'js/app.js', 'js/views/system-presentation.js', 'build.json', 'administrator-version.json'):
    if rel not in version['files']:
        raise SystemExit(f'Missing canonical hash slot: {rel}')
    version['files'][rel] = sha(rel)
write(BASE / 'version.json', json.dumps(version, ensure_ascii=False, indent=2) + '\n')

# 5) Retire the bad 40.4.231/232 owner itself. Existing owners are not edited.
DUPLICATE_OWNER.unlink()

# The release commit cleans up its temporary arming files too.
WORKFLOW.unlink(missing_ok=True)
SELF.unlink(missing_ok=True)

# Final focused assertions before the repository guard runs in the next workflow step.
idx = text(BASE / 'index.html')
version = json.loads(text(BASE / 'version.json'))
if 'technical-reading-cockpit-parity.css' in idx or 'technical-reading-cockpit-parity.css' in version.get('files', {}):
    raise SystemExit('Duplicate Technical Reading owner still referenced')
if version.get('engine', {}).get('reference_build') != '38.15.11':
    raise SystemExit('Protected Market Core drift')
for rel in ('index.html', 'app.js', 'js/app.js', 'js/views/system-presentation.js', 'build.json', 'administrator-version.json'):
    if version['files'][rel] != sha(rel):
        raise SystemExit(f'Hash drift after finalization: {rel}')

print('TECHNICAL_READING_CANONICAL_OWNER_RESTORE_404233_PASS')
