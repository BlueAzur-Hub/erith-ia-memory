from pathlib import Path
import hashlib, json, subprocess, zipfile

REPO=Path.cwd()
BASE=REPO/'public/agent_crypto_erith_ia/administrator'
INDEX=BASE/'index.html'
APP=BASE/'app.js'
SYSTEM_PRESENTATION=BASE/'js/views/system-presentation.js'
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

def replace_once(text, old, new, label):
    count=text.count(old)
    if count!=1:
        raise SystemExit(f'404274_FAIL: {label} expected exactly once, found {count}')
    return text.replace(old,new,1)

truth=json.loads((BASE/'build.json').read_text(encoding='utf-8'))
if str(truth.get('build'))!=PARENT: raise SystemExit(f'404274_FAIL: expected parent {PARENT}, found {truth.get("build")}')
if str(truth.get('engine'))!=ENGINE: raise SystemExit('404274_FAIL: protected Market Core identity changed')

text=APP.read_text(encoding='utf-8')
if OWNER in text: raise SystemExit('404274_FAIL: owner already present')

# 40.4.274 real owner audit:
# - canonical public source fetch is SourceAdapter.publicCryptoMarket() inside runLivecheck();
# - atlasPulseVisible() is browser document visibility, not Atlas disclosure visibility;
# - the existing 40.4.137 pending owner is atlasCurrentPendingMarket137;
# - therefore keep the existing market cadence alive as resident source work while hidden,
#   but continue pausing spot/chart visual work and do not create another scheduler/fetch owner.

old_pause='''function atlasPauseMarketPulse() {
  state.marketPulse.paused = true;
  if (state.auto.timer) clearTimeout(state.auto.timer);
  state.auto.timer = null;
  state.auto.nextAt = null;
  atlasClearPulseTimer("spot");
  atlasClearPulseTimer("chart");
  atlasAbortPulseController(state.marketPulse.marketController);
  atlasAbortPulseController(state.marketPulse.spotController);
  atlasAbortPulseController(state.chartEngineV2?.controller);
  updateAutoCountdown();
}'''
new_pause='''function atlasPauseMarketPulse() {
  state.marketPulse.paused = true;
  /* 40.4.274: the canonical public-market cadence is resident state work.
     Keep its existing timer/controller alive while the document is hidden;
     only spot/chart presentation work is paused. */
  atlasClearPulseTimer("spot");
  atlasClearPulseTimer("chart");
  atlasAbortPulseController(state.marketPulse.spotController);
  atlasAbortPulseController(state.chartEngineV2?.controller);
  updateAutoCountdown();
}'''
text=replace_once(text,old_pause,new_pause,'atlasPauseMarketPulse owner')

old_schedule_hidden='''  if (!atlasPulseVisible()) {
    state.auto.nextAt = null;
    updateAutoCountdown();
    return;
  }

'''
text=replace_once(text,old_schedule_hidden,'','scheduleAutoRead hidden cancellation')

old_schedule_callback='''  state.auto.timer = setTimeout(() => {
    state.auto.timer = null;
    if (state.auto?.enabled && atlasPulseVisible()) {
      void refreshMarketOnly({ reason: "market-pulse" });
    }
  }, delay);'''
new_schedule_callback='''  state.auto.timer = setTimeout(() => {
    state.auto.timer = null;
    if (state.auto?.enabled) {
      void refreshMarketOnly({
        reason: "market-pulse",
        residentOnly: !atlasPulseVisible()
      });
    }
  }, delay);'''
text=replace_once(text,old_schedule_callback,new_schedule_callback,'scheduleAutoRead resident callback')

old_refresh='''async function refreshMarketOnly(options = {}) {
  if (state.auto?.livecheckBusy || !state.auto?.enabled || !atlasPulseVisible()) return false;
  return runLivecheck({ ...options, reason: options.reason || "public-market-pulse" });
}'''
new_refresh='''async function refreshMarketOnly(options = {}) {
  if (state.auto?.livecheckBusy || !state.auto?.enabled) return false;
  return runLivecheck({
    ...options,
    reason: options.reason || "public-market-pulse",
    residentOnly: options.residentOnly === true || !atlasPulseVisible()
  });
}'''
text=replace_once(text,old_refresh,new_refresh,'refreshMarketOnly visibility gate')

old_livecheck_entry='''async function runLivecheck(options = {}) {
  if (state.auto?.livecheckBusy || !atlasPulseVisible()) return false;

  state.auto.livecheckBusy = true;'''
new_livecheck_entry='''async function runLivecheck(options = {}) {
  if (state.auto?.livecheckBusy) return false;
  const residentOnly = options.residentOnly === true || !atlasPulseVisible();

  state.auto.livecheckBusy = true;'''
text=replace_once(text,old_livecheck_entry,new_livecheck_entry,'runLivecheck entry visibility gate')

old_post='''    const result = await SourceAdapter.publicCryptoMarket({ signal: controller.signal });
    if (controller.signal.aborted || !atlasPulseVisible()) return false;
    const latencyMs = Math.round(performance.now() - startedAt);'''
new_post='''    const result = await SourceAdapter.publicCryptoMarket({ signal: controller.signal });
    if (controller.signal.aborted) return false;
    const latencyMs = Math.round(performance.now() - startedAt);'''
text=replace_once(text,old_post,new_post,'runLivecheck post-fetch visibility gate')

old_chart='''    atlasStartSelectedChart(160, true);
    await atlasDelay(260);
    await atlasWaitForChartIdle(30_000);
    return true;'''
new_chart='''    if (!residentOnly) {
      atlasStartSelectedChart(160, true);
      await atlasDelay(260);
      await atlasWaitForChartIdle(30_000);
    }
    return true;'''
text=replace_once(text,old_chart,new_chart,'runLivecheck hidden chart suppression')

old_retry='''    } else if (state.auto?.enabled && atlasPulseVisible()) {
      const retryDelay = atlasMarketRetryDelay(state.marketPulse.marketFailures || 1);
      atlasAnnounceDirectRetry(retryDelay, "Snapshot public Crypto indisponible");
      scheduleAutoRead(retryDelay);
    }'''
new_retry='''    } else if (state.auto?.enabled) {
      const retryDelay = atlasMarketRetryDelay(state.marketPulse.marketFailures || 1);
      if (!residentOnly) atlasAnnounceDirectRetry(retryDelay, "Snapshot public Crypto indisponible");
      scheduleAutoRead(retryDelay);
    }'''
text=replace_once(text,old_retry,new_retry,'runLivecheck hidden retry cadence')

contract_js=f'''\n\n{OWNER}\ntry {{\n  globalThis.ErithAtlasResidentCurrent404274 = Object.freeze({{\n    build:"40.4.274",\n    parent:"40.4.273",\n    canonical_source_owner:"runLivecheck -> SourceAdapter.publicCryptoMarket",\n    canonical_pending_owner:"atlasCurrentPendingMarket137",\n    document_hidden_source_cadence_preserved:true,\n    atlas_disclosure_visibility_dependency:false,\n    hidden_spot_chart_work_preserved_paused:true,\n    existing_market_timer_reused:true,\n    new_timer:false,\n    new_observer:false,\n    new_fetch_owner:false,\n    new_websocket:false,\n    new_storage_owner:false,\n    market_core_changed:false,\n    oracle_changed:false,\n    strategy_a_changed:false,\n    real_orders:false\n  }});\n}} catch (_) {{}}\n'''
text += contract_js
APP.write_text(text,encoding='utf-8')

# Version-truth invariant introduced in 40.4.221: the parser-shell System source
# cache token and its loaded script token must advance with the Administrator build.
system_presentation=SYSTEM_PRESENTATION.read_text(encoding='utf-8')
system_presentation=replace_once(
    system_presentation,
    f'const SOURCE="./views/system.html?v=administrator-build-{PARENT}";',
    f'const SOURCE="./views/system.html?v=administrator-build-{BUILD}";',
    'System source cache token'
)
SYSTEM_PRESENTATION.write_text(system_presentation,encoding='utf-8')

index_text=INDEX.read_text(encoding='utf-8')
index_text=replace_once(
    index_text,
    f'system-presentation.js?v=administrator-build-{PARENT}',
    f'system-presentation.js?v=administrator-build-{BUILD}',
    'System presentation index cache token'
)
INDEX.write_text(index_text,encoding='utf-8')

contract={
  'schema':'agent_crypto_atlas_resident_current_snapshot_404274_v2',
  'build':BUILD,'parent':PARENT,'engine':ENGINE,
  'canonical_source_owner':'runLivecheck -> SourceAdapter.publicCryptoMarket',
  'canonical_pending_owner':'atlasCurrentPendingMarket137',
  'document_hidden_source_cadence_preserved':True,
  'atlas_disclosure_visibility_dependency':False,
  'hidden_spot_chart_work_preserved_paused':True,
  'existing_market_timer_reused':True,
  'new_timer':False,'new_observer':False,'new_fetch_owner':False,'new_websocket':False,'new_storage_owner':False,
  'market_core_changed':False,'oracle_changed':False,'strategy_a_changed':False,
  'readiness_guard_changed':False,'bridge_auth_recovery_changed':False,'report_sequence_changed':False,
  'real_orders':False
}
contract_path=Path('/tmp/agent_crypto_404274_contract.json')
contract_path.write_text(json.dumps(contract,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
run('python',str(DRIVER),'--build',BUILD,'--parent',PARENT,'--release',RELEASE,'--status',STATUS,
    '--contract-key','atlas_resident_current_snapshot_visibility_decoupling_404274','--contract-json',str(contract_path),
    '--lineage-note','40.4.274 resident canonical market cadence decoupled from document visibility; existing 40.4.137 pending owner reused')
run('node','--check',str(APP))
run('node','--check',str(BASE/'js/app.js'))
run('node','--check',str(SYSTEM_PRESENTATION))
run('python',str(GUARD),'--expected-build',BUILD,'--expected-release',RELEASE)

final=APP.read_text(encoding='utf-8')
required=[
  OWNER,
  'canonical_pending_owner:"atlasCurrentPendingMarket137"',
  'canonical_source_owner:"runLivecheck -> SourceAdapter.publicCryptoMarket"',
  'residentOnly: !atlasPulseVisible()',
  'residentOnly: options.residentOnly === true || !atlasPulseVisible()',
  'if (controller.signal.aborted) return false;',
  'if (!residentOnly) {\n      atlasStartSelectedChart(160, true);',
  'const ATLAS_BUILD = "40.4.274";'
]
for item in required:
    if item not in final: raise SystemExit(f'404274_FAIL: missing runtime marker {item}')
if final.count(OWNER)!=1: raise SystemExit('404274_FAIL: duplicate owner')
if 'async function atlasLoadPublicCryptoMarket' in final: raise SystemExit('404274_FAIL: non-canonical invented loader appeared')
if final.count('function atlasCurrentPendingMarket137(')!=1: raise SystemExit('404274_FAIL: canonical pending owner count changed')
if f'const SOURCE="./views/system.html?v=administrator-build-{BUILD}";' not in SYSTEM_PRESENTATION.read_text(encoding='utf-8'):
    raise SystemExit('404274_FAIL: System presentation source token did not advance')
if f'system-presentation.js?v=administrator-build-{BUILD}' not in INDEX.read_text(encoding='utf-8'):
    raise SystemExit('404274_FAIL: System presentation index token did not advance')

COORD.mkdir(parents=True,exist_ok=True)
report=COORD/REPORT_NAME
report.write_text(f'''# Agent-Crypto {BUILD} — Atlas Resident CURRENT Snapshot · Source-State Visibility Decoupling

- Parent: {PARENT}
- Protected Market Core: {ENGINE}
- Release: {RELEASE}

## Corrected owner audit
The abandoned release attempt targeted a non-existent `atlasLoadPublicCryptoMarket()` function. The canonical {PARENT} runtime instead owns the public snapshot through `SourceAdapter.publicCryptoMarket()` called by `runLivecheck()`.

`atlasPulseVisible()` means browser document visibility (`document.visibilityState != hidden`); it is not the Atlas disclosure/open-state predicate. The existing Atlas CURRENT scheduler already states that analysis authorization is independent from which UI view is open, and 40.4.137 remains the single pending CURRENT owner.

## Actual upstream loss point
When Firefox moved the Administrator document to hidden state, `atlasPauseMarketPulse()` cancelled/aborted the public-market cadence, `scheduleAutoRead()` refused to keep a market timer, `refreshMarketOnly()` refused hidden work, and `runLivecheck()` rejected both at entry and after fetch. A newer canonical JSON therefore could remain unknown to resident CURRENT until a visibility-return event rearmed market ingestion.

## Surgery
- Keep the existing 5-minute public-market timer/controller alive as resident source-state work while the document is hidden.
- Reuse the existing `runLivecheck -> SourceAdapter.publicCryptoMarket` fetch owner; no second fetch owner is created.
- Remove document-visibility rejection from canonical market fetch/commit.
- Suppress the selected-chart refresh while running resident-only hidden market work.
- Continue pausing spot/chart presentation pulses while hidden.
- Reuse `atlasAfterLivecheck` and therefore the existing 40.4.137 `atlasCurrentPendingMarket137` reconciliation path.
- Advance the existing System parser-shell cache tokens to the same Administrator build; no System behavior changes.
- No new timer, observer, WebSocket or storage owner.
- Atlas readiness, Bridge auth recovery and report sequencing are unchanged.
- Market Core remains {ENGINE}; Oracle and Strategy A are untouched.

## Firefox acceptance target
1. Open Administrator and let the normal market/Atlas state initialize.
2. Leave AUTO market cadence enabled.
3. Put the Administrator browser tab/window in a genuinely hidden state (switch tab or minimize); merely collapsing the Atlas disclosure is not this test.
4. Allow a newer canonical `data/crypto/latest.json` snapshot to be published while hidden.
5. Return to Administrator and verify that resident market state/pending CURRENT has advanced without requiring Ctrl+F5 or opening Atlas first.
6. Verify the existing chain continues through readiness -> Atlas 1/4..4/4 -> NØX -> Aerith -> CURRENT -> REPOS.
7. Confirm visible graph/spot presentation resumes normally after visibility return.

This build does not add a second scheduler or a second pending CURRENT owner.
''',encoding='utf-8')

zip_path=COORD/ZIP_NAME
files=[INDEX,APP,BASE/'js/app.js',SYSTEM_PRESENTATION,BASE/'build.json',BASE/'version.json',BASE/'administrator-version.json',report]
with zipfile.ZipFile(zip_path,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as zf:
    for path in files: zf.write(path,path.relative_to(REPO))
digest=hashlib.sha256(zip_path.read_bytes()).hexdigest()
sha_path=COORD/SHA_NAME
sha_path.write_text(f'{digest}  {ZIP_NAME}\n',encoding='utf-8')
with zipfile.ZipFile(zip_path,'r') as zf:
    bad=zf.testzip()
    if bad: raise SystemExit(f'404274_FAIL: bad ZIP member {bad}')
print(json.dumps({'ok':True,'build':BUILD,'zip':str(zip_path),'sha256':digest},ensure_ascii=False))