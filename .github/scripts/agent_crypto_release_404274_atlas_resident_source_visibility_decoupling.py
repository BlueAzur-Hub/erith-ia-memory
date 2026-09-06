from pathlib import Path
import hashlib, json, re, subprocess, zipfile

REPO=Path.cwd()
BASE=REPO/'public/agent_crypto_erith_ia/administrator'
APP=BASE/'app.js'
COORD=REPO/'coordination/inter_ai_dialogues/agent_crypto'
DRIVER=REPO/'.github/scripts/agent_crypto_release_driver.py'
GUARD=REPO/'.github/scripts/agent_crypto_version_truth_guard.py'
BUILD='40.4.274'; PARENT='40.4.273'; ENGINE='38.15.11'
RELEASE='ATLAS RESIDENT CURRENT SNAPSHOT · SOURCE-STATE VISIBILITY DECOUPLING LOCK'
STATUS='atlas_resident_current_snapshot_source_state_visibility_decoupling_lock_404274'
ZIP_NAME='AGENT_CRYPTO_40_4_274_ATLAS_RESIDENT_CURRENT_SNAPSHOT_VISIBILITY_DECOUPLING.zip'
SHA_NAME='AGENT_CRYPTO_40_4_274_ATLAS_RESIDENT_CURRENT_SNAPSHOT_VISIBILITY_DECOUPLING_SHA256.txt'
REPORT_NAME='AGENT_CRYPTO_40_4_274_ATLAS_RESIDENT_CURRENT_SNAPSHOT_VISIBILITY_DECOUPLING_REPORT.md'
OWNER='/* 40.4.274 — ATLAS RESIDENT CURRENT SNAPSHOT · SOURCE-STATE VISIBILITY DECOUPLING LOCK */'

def run(*args):
    return subprocess.run(list(args),cwd=REPO,check=True,text=True)

truth=json.loads((BASE/'build.json').read_text(encoding='utf-8'))
if str(truth.get('build'))!=PARENT: raise SystemExit(f'404274_FAIL: expected parent {PARENT}, found {truth.get("build")}')
if str(truth.get('engine'))!=ENGINE: raise SystemExit('404274_FAIL: protected Market Core identity changed')

text=APP.read_text(encoding='utf-8')
if OWNER in text: raise SystemExit('404274_FAIL: owner already present')

# Locate the existing canonical public-market loader across its real multiline signature.
sig=re.search(r'(?ms)^async function atlasLoadPublicCryptoMarket\s*\(.*?\)\s*\{',text)
if not sig: raise SystemExit('404274_FAIL: atlasLoadPublicCryptoMarket signature not found')
# Bound the surgery to this top-level function only.
candidates=[p for p in (text.find('\nasync function ',sig.end()),text.find('\nfunction ',sig.end())) if p!=-1]
end=min(candidates) if candidates else min(len(text),sig.end()+12000)
body=text[sig.start():end]

entry_re=re.compile(r'\n([ \t]*)if\s*\(\s*!atlasPulseVisible\(\)\s*\)\s*return\s+null\s*;')
post_re=re.compile(r'if\s*\(\s*controller\.signal\.aborted\s*\|\|\s*!atlasPulseVisible\(\)\s*\)\s*return\s+false\s*;')
entry_matches=list(entry_re.finditer(body)); post_matches=list(post_re.finditer(body))
print(json.dumps({'404274_diag':{'signature':sig.group(0),'entry_visibility_guards':len(entry_matches),'post_visibility_guards':len(post_matches),'body_chars':len(body)}},ensure_ascii=False))
if len(entry_matches) not in (0,1): raise SystemExit(f'404274_FAIL: loader entry visibility guard count={len(entry_matches)}')
if len(post_matches)!=1: raise SystemExit(f'404274_FAIL: loader post-fetch visibility guard count={len(post_matches)}')

if entry_matches:
    body=entry_re.sub(lambda m:'\n'+m.group(1)+'/* 40.4.274: canonical source ingestion remains resident while Atlas UI is hidden. */',body,count=1)
body=post_re.sub('if (controller.signal.aborted) return false;',body,count=1)

wake_re=re.compile(r'(atlasPublicCryptoMarketLastFetchAt\s*=\s*Date\.now\(\)\s*;)(\s*\n\s*)return\s+true\s*;')
if len(list(wake_re.finditer(body)))!=1: raise SystemExit(f'404274_FAIL: canonical cache completion count={len(list(wake_re.finditer(body)))}')
body=wake_re.sub(r'\1\2/* 40.4.274: wake the existing 40.4.137 CURRENT owner from fresh canonical source state. */\2try { atlasCurrentPendingRefresh137("public-market-source-404274"); } catch (_) {}\2return true;',body,count=1)

contract_js=f'''{OWNER}\n/* Canonical source ingestion is resident state, not a panel-render concern. */\ntry{{globalThis.ErithAtlasResidentCurrent404274=Object.freeze({{\n  build:"40.4.274",parent:"40.4.273",canonical_pending_owner:"atlasCurrentPendingMarket137",\n  public_market_source_visibility_independent:true,ui_render_visibility_contract_unchanged:true,\n  new_timer:false,new_observer:false,new_fetch_owner:false,new_websocket:false,new_storage_owner:false,\n  market_core_changed:false,oracle_changed:false,strategy_a_changed:false\n}});}}catch(_){{}}\n'''
body=contract_js+body
text=text[:sig.start()]+body+text[end:]
APP.write_text(text,encoding='utf-8')

contract={
  'schema':'agent_crypto_atlas_resident_current_snapshot_404274_v1',
  'build':BUILD,'parent':PARENT,'engine':ENGINE,
  'canonical_pending_owner':'atlasCurrentPendingMarket137',
  'public_market_source_visibility_independent':True,
  'hidden_or_closed_atlas_must_not_block_canonical_source_ingestion':True,
  'fresh_source_wakes_existing_pending_owner':True,
  'ui_render_visibility_contract_unchanged':True,
  'new_timer':False,'new_observer':False,'new_fetch_owner':False,'new_websocket':False,'new_storage_owner':False,
  'market_core_changed':False,'oracle_changed':False,'strategy_a_changed':False,
  'readiness_guard_changed':False,'livecheck_guard_changed':False,'backoff_guard_changed':False,
  'real_orders':False
}
contract_path=Path('/tmp/agent_crypto_404274_contract.json')
contract_path.write_text(json.dumps(contract,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
run('python',str(DRIVER),'--build',BUILD,'--parent',PARENT,'--release',RELEASE,'--status',STATUS,
    '--contract-key','atlas_resident_current_snapshot_visibility_decoupling_404274','--contract-json',str(contract_path),
    '--lineage-note','40.4.274 Atlas resident CURRENT canonical-source visibility decoupling')
run('node','--check',str(APP))
run('node','--check',str(BASE/'js/app.js'))
run('python',str(GUARD),'--expected-build',BUILD,'--expected-release',RELEASE)

final=APP.read_text(encoding='utf-8')
required=[OWNER,'public_market_source_visibility_independent:true','canonical_pending_owner:"atlasCurrentPendingMarket137"','if (controller.signal.aborted) return false;','atlasCurrentPendingRefresh137("public-market-source-404274")','const ATLAS_BUILD = "40.4.274";']
for item in required:
    if item not in final: raise SystemExit(f'404274_FAIL: missing runtime marker {item}')
if final.count(OWNER)!=1: raise SystemExit('404274_FAIL: duplicate owner')
# Prove the old visibility coupling is gone from the canonical loader body.
verify_sig=re.search(r'(?ms)^async function atlasLoadPublicCryptoMarket\s*\(.*?\)\s*\{',final)
if not verify_sig: raise SystemExit('404274_FAIL: patched atlasLoadPublicCryptoMarket signature not found')
verify_candidates=[p for p in (final.find('\nasync function ',verify_sig.end()),final.find('\nfunction ',verify_sig.end())) if p!=-1]
verify_end=min(verify_candidates) if verify_candidates else min(len(final),verify_sig.end()+12000)
verify_body=final[verify_sig.start():verify_end]
if re.search(r'if\s*\(\s*!atlasPulseVisible\(\)\s*\)\s*return\s+null\s*;',verify_body): raise SystemExit('404274_FAIL: entry visibility gate survived')
if 'controller.signal.aborted || !atlasPulseVisible()' in verify_body: raise SystemExit('404274_FAIL: post-fetch visibility gate survived')

COORD.mkdir(parents=True,exist_ok=True)
report=COORD/REPORT_NAME
report.write_text(f'''# Agent-Crypto {BUILD} — Atlas Resident CURRENT Snapshot · Source-State Visibility Decoupling

- Parent: {PARENT}
- Protected Market Core: {ENGINE}
- Release: {RELEASE}

## Fault isolated
The canonical public crypto source loader's post-fetch/cache-commit path rejected resident state when `atlasPulseVisible()` was false. This allowed UI visibility to suppress commitment of an otherwise fetched and normalized fresh canonical snapshot, contradicting the existing 40.4.137 canonical pending CURRENT contract.

## Surgery
- Canonical public market state commitment no longer depends on Atlas panel visibility.
- Abort semantics remain intact.
- A successful canonical-source cache update wakes the existing `atlasCurrentPendingRefresh137` owner.
- UI rendering visibility rules are not broadened.
- No new timer, observer, fetch owner, WebSocket or storage owner.
- Readiness, livecheck, backoff, Bridge auth recovery and report sequencing are unchanged.
- Market Core remains {ENGINE}; Oracle and Strategy A are untouched.

## Firefox acceptance target
1. Open Administrator and let Atlas/Aerith initialize.
2. Hide/close the Atlas panel while leaving the Administrator page alive.
3. Let a newer canonical `data/crypto/latest.json` snapshot arrive.
4. Verify resident state detects the new market snapshot and the 40.4.137 pending CURRENT owner is refreshed without reopening Atlas.
5. Once the existing true-report readiness gates are satisfied, verify CURRENT analysis proceeds through the normal Atlas owner.
6. Reopen Atlas and confirm the visible CURRENT corresponds to the newest snapshot rather than a stale Historical conclusion.

This build intentionally does not create a second scheduler or a second pending owner.
''',encoding='utf-8')

zip_path=COORD/ZIP_NAME
files=[BASE/'index.html',BASE/'app.js',BASE/'js/app.js',BASE/'build.json',BASE/'version.json',BASE/'administrator-version.json',report]
with zipfile.ZipFile(zip_path,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as zf:
    for path in files: zf.write(path,path.relative_to(REPO))
digest=hashlib.sha256(zip_path.read_bytes()).hexdigest()
sha_path=COORD/SHA_NAME
sha_path.write_text(f'{digest}  {ZIP_NAME}\n',encoding='utf-8')
with zipfile.ZipFile(zip_path,'r') as zf:
    bad=zf.testzip()
    if bad: raise SystemExit(f'404274_FAIL: bad ZIP member {bad}')
print(json.dumps({'ok':True,'build':BUILD,'zip':str(zip_path),'sha256':digest},ensure_ascii=False))