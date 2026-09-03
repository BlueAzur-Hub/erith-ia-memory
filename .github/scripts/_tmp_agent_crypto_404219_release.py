#!/usr/bin/env python3
from pathlib import Path
from urllib.parse import urlsplit
import json, re, subprocess

REPO=Path('.')
ADMIN=REPO/'public/agent_crypto_erith_ia/administrator'
GUARD=REPO/'.github/scripts/agent_crypto_version_truth_guard.py'
DOCS=REPO/'coordination/inter_ai_dialogues/agent_crypto'
WORKFLOW=REPO/'.github/workflows/agent-crypto-40-4-219-cache-atlas-audit.yml'
AUDIT=REPO/'.github/scripts/_tmp_agent_crypto_404219_audit.py'
SELF=REPO/'.github/scripts/_tmp_agent_crypto_404219_release.py'


def run(*args):
    print('+',*map(str,args),flush=True)
    subprocess.run([str(x) for x in args],check=True)

def once(text,old,new,label):
    n=text.count(old)
    if n!=1: raise SystemExit(f'STOP {label}: expected 1, got {n}')
    return text.replace(old,new,1)

run('python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.218')

# 40.4.219 — Loaded Asset Manifest Coverage.
# Add every local JS/CSS actually loaded by index.html to the canonical hash map.
# No browser URL or payload content is changed by this surgery.
index=(ADMIN/'index.html').read_text(encoding='utf-8')
manifest_path=ADMIN/'version.json'
manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
files=manifest.get('files')
if not isinstance(files,dict) or not files:
    raise SystemExit('STOP version.json files map missing')

loaded=set()
for match in re.finditer(r'<(?:script|link)\b[^>]*(?:src|href)=["\']([^"\']+)["\'][^>]*>',index,re.I):
    url=match.group(1).strip()
    if url.startswith(('http://','https://','//','#','data:')): continue
    raw=urlsplit(url).path
    if raw.startswith('./'): raw=raw[2:]
    elif raw.startswith('/'): raw=raw[1:]
    else: raw=raw
    if not raw.lower().endswith(('.js','.css')): continue
    payload=ADMIN/raw
    if not payload.is_file():
        raise SystemExit(f'STOP loaded local asset missing: {raw}')
    loaded.add(raw)

before_keys=set(map(str,files.keys()))
missing=sorted(loaded-before_keys)
for rel in missing:
    files[rel]='PENDING_RELEASE_DRIVER_HASH'
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'loaded_js_css':len(loaded),'previously_hashed':len(loaded & before_keys),'added_to_manifest':len(missing),'added':missing},ensure_ascii=False))
if not missing:
    raise SystemExit('STOP no loaded asset hash coverage debt found; do not mint empty release')

# Future Version Truth invariant: every local JS/CSS loaded by index must be hash-covered.
guard=GUARD.read_text(encoding='utf-8')
anchor='''    files = manifest.get("files")
    if not isinstance(files, dict) or not files:
        fail("version.json files hash map missing")'''
insert='''    files = manifest.get("files")
    if not isinstance(files, dict) or not files:
        fail("version.json files hash map missing")

    if current_num >= (40, 4, 219):
        loaded_local_js_css = set()
        for asset_url in re.findall(r'<(?:script|link)\\b[^>]*(?:src|href)=["\\\']([^"\\\']+)["\\\'][^>]*>', index, re.I):
            value = str(asset_url or "").strip()
            if value.startswith(("http://", "https://", "//", "#", "data:")):
                continue
            raw = value.split("?", 1)[0].split("#", 1)[0]
            if raw.startswith("./"):
                raw = raw[2:]
            elif raw.startswith("/"):
                raw = raw[1:]
            if not raw.lower().endswith((".js", ".css")):
                continue
            if not (base / raw).is_file():
                fail(f"40.4.219 loaded local asset missing: {raw}")
            loaded_local_js_css.add(raw)
        missing_loaded_hashes = sorted(loaded_local_js_css - set(map(str, files.keys())))
        if missing_loaded_hashes:
            fail(f"40.4.219 loaded JS/CSS outside manifest hash authority: {missing_loaded_hashes}")'''
if guard.count(anchor)!=1:
    raise SystemExit(f'STOP guard files anchor count={guard.count(anchor)}')
guard=guard.replace(anchor,insert,1)
GUARD.write_text(guard,encoding='utf-8')

# Continuity docs.
release_manifest=DOCS/'AGENT_CRYPTO_RELEASE_MANIFEST.md'
t=release_manifest.read_text(encoding='utf-8')
t=once(t,'Release courante : **40.4.218**','Release courante : **40.4.219**','manifest release')
t=once(t,'commit final 40.4.218','commit final 40.4.219','manifest archive')
if '40.4.219 est une release de **Loaded Asset Manifest Coverage**' not in t:
    t += '\n40.4.219 est une release de **Loaded Asset Manifest Coverage** : tous les fichiers JavaScript/CSS locaux réellement chargés par `index.html` rejoignent l’autorité SHA-256 de `version.json`. Les URL de cache et les contenus de ces payloads restent inchangés ; la release ajoute une preuve d’intégrité, pas un nouveau comportement runtime.\n'
release_manifest.write_text(t,encoding='utf-8')

prompt=DOCS/'PROMPT_REPRISE_AETHER_AGENT_CRYPTO.md'
t=prompt.read_text(encoding='utf-8')
t=once(t,'Version de reprise : **40.4.218**','Version de reprise : **40.4.219**','prompt version')
marker='''40.4.218 retire le **MutationObserver de compatibilité du badge global** devenu sans propriétaire adversaire après 40.4.211. `version-truth.js` conserve la réconciliation publiée, le runtime racine conserve les états de cohérence/publication skew et l’Administrator conserve le first-runtime identity. `market-stack.js` reste interdit d’écriture sur `#atlasVersionControlText`.\n'''
addition='''\n40.4.219 étend la **Version Truth aux assets réellement chargés** : chaque JavaScript/CSS local référencé par `index.html` doit désormais être présent dans la table SHA-256 de `version.json`. Cette couverture inclut les anciens propriétaires chargés mais jusque-là hors manifest ; aucune URL de cache ni logique métier n’est modifiée.\n'''
if '40.4.219 étend la **Version Truth aux assets réellement chargés**' not in t:
    t=once(t,marker,marker+addition,'prompt 219 append')
prompt.write_text(t,encoding='utf-8')

ledger=DOCS/'AGENT_CRYPTO_FIN_DE_FIL_AETHER.md'
t=ledger.read_text(encoding='utf-8')
t=once(t,'Version canonique de clôture : **40.4.218**','Version canonique de clôture : **40.4.219**','ledger version')
t=once(t,'## 1. Cascade finale 40.4.205 → 40.4.218','## 1. Cascade finale 40.4.205 → 40.4.219','ledger heading')
marker='''- **40.4.218** — Version Observer Retirement : suppression du `MutationObserver` de compatibilité du badge global devenu redondant depuis la Single Authority 40.4.211 ; autorités runtime/publication conservées et `market-stack.js` toujours exclu du badge global.\n'''
addition='''- **40.4.219** — Loaded Asset Manifest Coverage : tous les JavaScript/CSS locaux chargés par le shell Administrator sont désormais sous hash SHA-256 canonique ; le guard refuse tout futur asset chargé hors autorité du manifest.\n'''
if '- **40.4.219**' not in t:
    t=once(t,marker,marker+addition,'ledger 219 append')
ledger.write_text(t,encoding='utf-8')

contract={
  'build':'40.4.219','scope':'loaded_local_js_css_manifest_integrity','market_core':'38.15.11',
  'all_loaded_local_js_css_manifest_hashed':True,
  'loaded_asset_count_at_release':len(loaded),'newly_hash_covered_count':len(missing),
  'browser_cache_url_change':False,'payload_content_change':False,
  'data_change':False,'geometry_change':False,'atlas_behavior_change':False,'market_behavior_change':False,
  'fetch_added':False,'timer_added':False,'observer_added':False,'websocket_added':False,'raf_added':False
}
cp=Path('/tmp/contract404219.json'); cp.write_text(json.dumps(contract,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
run('python','.github/scripts/agent_crypto_release_driver.py',
    '--build','40.4.219','--parent','40.4.218',
    '--release','LOADED ASSET MANIFEST COVERAGE · STATIC INTEGRITY LOCK',
    '--status','loaded_asset_manifest_coverage_404219_operator_validation_required',
    '--contract-key','loaded_asset_manifest_coverage_404219','--contract-json',str(cp),
    '--lineage-note','40.4.219 brings every local JS/CSS loaded by the Administrator shell under canonical SHA-256 manifest authority without changing payload contents or cache URLs.')

run('node','--check',str(ADMIN/'app.js')); run('node','--check',str(ADMIN/'js/app.js'))
run('python','-m','py_compile','.github/scripts/agent_crypto_version_truth_guard.py','.github/scripts/agent_crypto_release_driver.py')
run('python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.219')

# Re-prove exact loaded coverage from the published manifest.
final_manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
final_files=set(map(str,(final_manifest.get('files') or {}).keys()))
left=sorted(loaded-final_files)
if left: raise SystemExit(f'STOP loaded assets still outside manifest: {left}')
for rel in loaded:
    h=str(final_manifest['files'].get(rel) or '')
    if not re.fullmatch(r'[0-9a-f]{64}',h):
        raise SystemExit(f'STOP invalid published hash for loaded asset {rel}: {h}')
if subprocess.run(['bash','-lc',"git diff --name-only | grep '^public/agent_crypto_erith_ia/data/'"],capture_output=True).returncode==0:
    raise SystemExit('STOP data files changed')
run('git','diff','--check')

run('git','config','user.name','Aether Release'); run('git','config','user.email','41898282+github-actions[bot]@users.noreply.github.com')
for p in (WORKFLOW,AUDIT,SELF): run('git','rm',str(p))
for p in (GUARD,ADMIN/'app.js',ADMIN/'js/app.js',ADMIN/'index.html',ADMIN/'version.json',ADMIN/'administrator-version.json',ADMIN/'build.json',release_manifest,prompt,ledger): run('git','add',str(p))
run('git','commit','-m','release(agent-crypto): 40.4.219 lock loaded asset manifest coverage')
run('git','pull','--rebase','origin','main')
run('python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.219')
run('git','push','origin','HEAD:main')
print(json.dumps({'ok':True,'build':'40.4.219','market_core':'38.15.11','loaded_js_css':len(loaded),'new_hash_coverage':len(missing)},ensure_ascii=False))
