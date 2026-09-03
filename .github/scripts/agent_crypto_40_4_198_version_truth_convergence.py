from pathlib import Path
from datetime import datetime, timezone
import json

ROOT = Path('public/agent_crypto_erith_ia/administrator')
BUILD = '40.4.198'
ENGINE = '38.15.11'
RELEASE = 'COMMODITY HISTORICAL DEPTH · LAZY ENERGY METALS · VERSION TRUTH'
STATUS = 'commodity_historical_depth_lazy_energy_metals_version_truth_404198'
STAMP = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected exactly 1 occurrence, got {count}')
    return text.replace(old, new, 1)

# Canonical full manifest
p = ROOT / 'version.json'
s = p.read_text(encoding='utf-8')
s = replace_once(s,
    '  "release": "HISTORICAL DEPTH FOUNDATION · LAZY LONG HISTORY · INDICES 5Y 10Y MAX",',
    f'  "release": "{RELEASE}",', 'version release')
s = replace_once(s, '  "build": "40.4.197",', f'  "build": "{BUILD}",', 'version build')
s = replace_once(s,
    '  "asset_token": "market-core-v2.0-alpha-build-40.4.197",',
    f'  "asset_token": "market-core-v2.0-alpha-build-{BUILD}",', 'version asset token')
s = replace_once(s,
    '  "status": "historical_depth_lazy_indices_404197",',
    f'  "status": "{STATUS}",', 'version status')
s = replace_once(s,
    '  "prepared_at": "2026-09-03T02:34:26Z",',
    f'  "prepared_at": "{STAMP}",', 'version prepared_at')
s = replace_once(s,
    '  "published_at": "2026-09-03T02:34:26Z",',
    f'  "published_at": "{STAMP}",', 'version published_at')
s = replace_once(s,
    '  "parent_build": "40.4.196",',
    '  "parent_build": "40.4.197",', 'version parent build')
p.write_text(s, encoding='utf-8')

# Administrator mirror manifest
p = ROOT / 'administrator-version.json'
s = p.read_text(encoding='utf-8')
s = replace_once(s, '  "build": "40.4.197",', f'  "build": "{BUILD}",', 'admin mirror build')
s = replace_once(s,
    '  "release": "HISTORICAL DEPTH FOUNDATION · LAZY LONG HISTORY · INDICES 5Y 10Y MAX",',
    f'  "release": "{RELEASE}",', 'admin mirror release')
s = replace_once(s,
    '  "status": "historical_depth_lazy_indices_404197",',
    f'  "status": "{STATUS}",', 'admin mirror status')
s = replace_once(s,
    '  "prepared_at": "2026-09-03T02:34:26Z",',
    f'  "prepared_at": "{STAMP}",', 'admin mirror prepared_at')
s = replace_once(s,
    '  "published_at": "2026-09-03T02:34:26Z",',
    f'  "published_at": "{STAMP}",', 'admin mirror published_at')
s = replace_once(s,
    '  "global_versioning": "40.4.197",',
    f'  "global_versioning": "{BUILD}",', 'admin mirror global version')
p.write_text(s, encoding='utf-8')

# Convergence gate: all four active truth authorities must agree.
index = (ROOT / 'index.html').read_text(encoding='utf-8')
build = json.loads((ROOT / 'build.json').read_text(encoding='utf-8'))
version = json.loads((ROOT / 'version.json').read_text(encoding='utf-8'))
admin = json.loads((ROOT / 'administrator-version.json').read_text(encoding='utf-8'))

assert f'<meta name="atlas-build" content="{BUILD}" />' in index
assert f'<meta name="administrator-build" content="{BUILD}" />' in index
assert f'<meta name="atlas-engine-build" content="{ENGINE}" />' in index
assert build['build'] == BUILD and build['engine'] == ENGINE
assert version['build'] == BUILD
assert version['engine']['reference_build'] == ENGINE
assert version['asset_token'] == f'market-core-v2.0-alpha-build-{BUILD}'
assert admin['build'] == BUILD and admin['global_versioning'] == BUILD
assert admin['protected_base']['market_core_modified'] is False

print('40.4.198 VERSION TRUTH CONVERGED:', BUILD, 'ENGINE', ENGINE)
