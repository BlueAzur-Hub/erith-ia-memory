#!/usr/bin/env python3
from pathlib import Path
import hashlib, json, re

ROOT = Path('public/agent_crypto_erith_ia/administrator')
BUILD = '40.6.66'
ENGINE = '38.15.11'

def read(path):
    return path.read_text(encoding='utf-8')

def write(path, value):
    path.write_text(value, encoding='utf-8', newline='\n')

def sub1(value, pattern, repl, label, flags=0):
    out, count = re.subn(pattern, repl, value, count=1, flags=flags)
    if count != 1:
        raise SystemExit(f'R1 FAIL {label}: expected exactly 1 match, got {count}')
    return out

def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

manifest_path = ROOT / 'version.json'
manifest = json.loads(read(manifest_path))
if str(manifest.get('build') or '') != BUILD:
    raise SystemExit(f'R1 refuses manifest build {manifest.get("build")!r}')
if str(manifest.get('parent_build') or '') != '40.6.65':
    raise SystemExit(f'R1 refuses parent {manifest.get("parent_build")!r}')
engine = manifest.get('engine')
engine_value = str(engine.get('reference_build') if isinstance(engine, dict) else engine)
if engine_value != ENGINE:
    raise SystemExit(f'R1 refuses Market Core drift {engine!r}')
expected_token = f'market-core-v2.0-alpha-build-{BUILD}'

index_path = ROOT / 'index.html'
index = read(index_path)
index = sub1(index,
    r'(id="atlasVersionTruthControl"[\s\S]*?aria-label="Version Agent-Crypto installée : Build )[^,\"]+(, mode Administrator")',
    rf'\g<1>{BUILD}\g<2>', 'first-paint aria')
index = sub1(index,
    r'(<span\s+id="atlasVersionTruthText">Build )[^<]+(</span>)',
    rf'\g<1>{BUILD}\g<2>', 'first-paint badge')
index = sub1(index,
    r'(<span\s+id="footerRelease">Administrator )[^ ]+( · Market Core 38\.15\.11 · Web Classic · vérification… · Version : Parker Lewis Can\'t Lose</span>)',
    rf'\g<1>{BUILD}\g<2>', 'first-paint footer')
index = sub1(index,
    r'\./app\.js\?v=administrator-build-[0-9]+\.[0-9]+\.[0-9]+',
    f'./app.js?v=administrator-build-{BUILD}', 'root app cache token')
if './js/version-truth.js?v=' in index:
    index = sub1(index,
        r'\./js/version-truth\.js\?v=[^\"]+',
        f'./js/version-truth.js?v={BUILD}', 'version-truth cache token')
write(index_path, index)

root_app_path = ROOT / 'app.js'
root_app = read(root_app_path)
root_app = sub1(root_app,
    r'const\s+ATLAS_BUILD\s*=\s*[\"\'][^\"\']+[\"\']\s*;',
    f'const ATLAS_BUILD = "{BUILD}";', 'root ATLAS_BUILD')
write(root_app_path, root_app)

adapter_path = ROOT / 'js/tradus-shadow-adapter-406066.js'
adapter = read(adapter_path)
adapter = sub1(adapter,
    r'    if \(/NO TRADE\|OFF\|WAIT\|INCONNU/\.test\(state\)\) return "WAIT";',
    '    if (/^OFF$|ARR[ÊE]T[ÉE]?|INACTIF/.test(state)) return "OFF";\n    if (/NO TRADE|WAIT|INCONNU/.test(state)) return "WAIT";',
    'Strategy A OFF classifier')
adapter = sub1(adapter,
    r'(    const bDirectional = bAction === "BUY" \|\| bAction === "SELL";\n)',
    r'\1\n    if (aState === "OFF") {\n      return { state:"NON COMPARABLE", text:`A OFF · TRADUS ${bAction === "NO_TRADE" ? "attend" : bAction}` };\n    }\n',
    'Strategy A OFF comparison')
adapter = sub1(adapter,
    r'    const stopBuy=compare\(\{decision:"STOP"\},buy\);',
    '    const offBuy=compare({decision:"OFF"},buy);\n    const stopBuy=compare({decision:"STOP"},buy);',
    'OFF self-test fixture')
adapter = sub1(adapter,
    r'&&stopBuy\.state==="OPPOSITION SÉCURITÉ"&&waitBuy\.state==="DIVERGENCE"&&paperBuy\.state==="CONVERGENCE POTENTIELLE";',
    '&&offBuy.state==="NON COMPARABLE"&&stopBuy.state==="OPPOSITION SÉCURITÉ"&&waitBuy.state==="DIVERGENCE"&&paperBuy.state==="CONVERGENCE POTENTIELLE";',
    'OFF self-test assertion')
adapter = sub1(adapter,
    r'stale:stale\.reason,stop_buy:stopBuy\.state,wait_buy:waitBuy\.state,paper_buy:paperBuy\.state',
    'stale:stale.reason,off_buy:offBuy.state,stop_buy:stopBuy.state,wait_buy:waitBuy.state,paper_buy:paperBuy.state',
    'OFF self-test receipt')
write(adapter_path, adapter)

contract_path = ROOT / 'data/tradus-shadow-contract.json'
contract = json.loads(read(contract_path))
truth = contract.setdefault('comparison_truth', {})
truth['OFF_plus_directional_tradus'] = 'NON COMPARABLE'
truth['OFF_plus_no_trade_tradus'] = 'NON COMPARABLE'
write(contract_path, json.dumps(contract, ensure_ascii=False, indent=2) + '\n')

# Align the Administrator mirror with the canonical manifest. This is release identity only.
mirror_path = ROOT / 'administrator-version.json'
mirror = json.loads(read(mirror_path))
mirror['build'] = BUILD
mirror['global_versioning'] = BUILD
mirror['release'] = str(manifest.get('release') or '')
mirror['asset_token'] = expected_token
mirror['parent_build'] = str(manifest.get('parent_build') or '')
if str(manifest.get('revision') or '').strip():
    mirror['revision'] = str(manifest.get('revision')).strip()
write(mirror_path, json.dumps(mirror, ensure_ascii=False, indent=2) + '\n')

r1_path = ROOT / 'RELEASE_40_6_66_R1.md'
write(r1_path, '''# Agent-Crypto Administrator — 40.6.66 R1

## TRUTH · ARCHIVE · OFF SEMANTICS

Functional build remains **40.6.66**. Parent remains **40.6.65**.  
Market Core **38.15.11** remains protected.

R1 is a bounded correction, not a new feature release:

- Strategy A `OFF` is now a distinct state;
- `OFF` + TRADUS directional/waiting signal = `NON COMPARABLE`, never `DIVERGENCE`;
- first-paint badge, ARIA, footer and root app cache identity are aligned on 40.6.66;
- root `ATLAS_BUILD` runtime identity is aligned on 40.6.66;
- Administrator mirror release/token/parent/revision identity is aligned to the canonical manifest;
- dead manifest references `RELEASE_40_6_58.md` and `RELEASE_40_6_59.md` are removed;
- SHA-256 manifest authority is recalculated from the files actually present;
- every loaded local JS/CSS remains covered by manifest hash authority.

Protected / unchanged: Aether composition, Strategy A thresholds, Market Core, Graph, Technical Reading, Oracle and Atlas business logic.

Safety: TRADUS remains **SHADOW ONLY**; Strategy A remains **PAPER ONLY**; no API key, no wallet, no real order.
''')

files = dict(manifest.get('files') or {})
for dead in ('RELEASE_40_6_58.md', 'RELEASE_40_6_59.md'):
    files.pop(dead, None)
missing = [rel for rel in files if not (ROOT / str(rel)).is_file()]
if missing:
    raise SystemExit(f'R1 FAIL unexpected missing manifest targets: {missing}')
for rel in list(files):
    files[rel] = sha256(ROOT / str(rel))

loaded = set()
for match in re.finditer(r'(?:src|href)="\./([^"?]+\.(?:js|css))(?:\?[^\"]*)?"', index):
    rel = match.group(1)
    path = ROOT / rel
    if not path.is_file():
        raise SystemExit(f'R1 FAIL loaded local asset missing: {rel}')
    loaded.add(rel)
    files[rel] = sha256(path)

for rel in (
    'index.html','app.js','administrator-version.json','RELEASE_40_6_66.md','RELEASE_40_6_66_R1.md',
    'data/tradus-shadow-contract.json','data/tradus-shadow-ledger-contract.json',
    'js/tradus-shadow-adapter-406066.js','js/tradus-shadow-ledger-406066.js',
):
    path = ROOT / rel
    if not path.is_file():
        raise SystemExit(f'R1 FAIL release scope missing: {rel}')
    files[rel] = sha256(path)

vendor = ROOT / 'vendor/tradus-v1.0-r1'
if vendor.is_dir():
    for path in vendor.rglob('*'):
        if path.is_file() and '__pycache__' not in path.parts and '.pytest_cache' not in path.parts and path.suffix != '.pyc':
            rel = path.relative_to(ROOT).as_posix()
            files[rel] = sha256(path)

manifest['files'] = files
manifest['r1'] = {
    'label': '40.6.66 R1',
    'functional_build_unchanged': True,
    'strategy_a_off_comparison': 'NON COMPARABLE',
    'root_runtime_build_truth_repaired': True,
    'first_paint_truth_repaired': True,
    'administrator_mirror_truth_repaired': True,
    'dead_release_refs_removed': ['RELEASE_40_6_58.md', 'RELEASE_40_6_59.md'],
    'loaded_hash_authority_count': len(loaded),
    'market_core_modified': False,
    'aether_modified': False,
    'strategy_a_thresholds_modified': False,
    'real_order': False,
}
write(manifest_path, json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')

assert f'<span id="atlasVersionTruthText">Build {BUILD}</span>' in index
assert f'const ATLAS_BUILD = "{BUILD}";' in root_app
assert 'return "OFF";' in adapter
assert 'state:"NON COMPARABLE"' in adapter
assert mirror['asset_token'] == expected_token
assert mirror['parent_build'] == '40.6.65'
assert truth['OFF_plus_directional_tradus'] == 'NON COMPARABLE'
assert truth['OFF_plus_no_trade_tradus'] == 'NON COMPARABLE'
assert all(isinstance(v, str) and re.fullmatch(r'[0-9a-f]{64}', v) for v in manifest['files'].values())
assert loaded.issubset(set(manifest['files']))
print(f'R1 prepared: {len(files)} manifest payloads; {len(loaded)} loaded JS/CSS covered')
