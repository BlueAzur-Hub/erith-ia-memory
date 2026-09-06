from pathlib import Path
import hashlib, json, subprocess, zipfile

REPO=Path.cwd()
BASE=REPO/'public/agent_crypto_erith_ia/administrator'
APP=BASE/'app.js'
COORD=REPO/'coordination/inter_ai_dialogues/agent_crypto'
DRIVER=REPO/'.github/scripts/agent_crypto_release_driver.py'
GUARD=REPO/'.github/scripts/agent_crypto_version_truth_guard.py'
WORKFLOW=REPO/'.github/workflows/agent-crypto-404273-atlas-state-truth-auth-recovery.yml'
SCRIPT=REPO/'.github/scripts/agent_crypto_release_404273_atlas_state_truth_auth_recovery.py'
BUILD='40.4.273'; PARENT='40.4.272'; ENGINE='38.15.11'
RELEASE='ATLAS STATE TRUTH · BRIDGE AUTH RECOVERY LOCK'
STATUS='atlas_state_truth_bridge_auth_recovery_lock_404273'
ZIP_NAME='AGENT_CRYPTO_40_4_273_ATLAS_STATE_TRUTH_BRIDGE_AUTH_RECOVERY.zip'
SHA_NAME='AGENT_CRYPTO_40_4_273_ATLAS_STATE_TRUTH_BRIDGE_AUTH_RECOVERY_SHA256.txt'
REPORT_NAME='AGENT_CRYPTO_40_4_273_ATLAS_STATE_TRUTH_BRIDGE_AUTH_RECOVERY_REPORT.md'

def run(*args):
    return subprocess.run(list(args),cwd=REPO,check=True,text=True)

truth=json.loads((BASE/'build.json').read_text(encoding='utf-8'))
if str(truth.get('build'))!=PARENT: raise SystemExit(f'404273_FAIL: expected parent {PARENT}, found {truth.get("build")}')
if str(truth.get('engine'))!=ENGINE: raise SystemExit('404273_FAIL: protected Market Core identity changed')

text=APP.read_text(encoding='utf-8')
owner='/* 40.4.273 — ATLAS STATE TRUTH + BRIDGE AUTH RECOVERY LOCK */'
assert owner not in text

# 1 helper inserted before failure kind
marker='function atlasLocalBridgeRequestFailureKind(error) {'
assert text.count(marker)==1
helper=r'''/* 40.4.273 — ATLAS STATE TRUTH + BRIDGE AUTH RECOVERY LOCK */
/*
   Atlas must distinguish loopback reachability from privileged Bridge auth.
   No new timer, observer, network owner or storage schema is introduced.
   The existing pending CURRENT owner survives auth loss and post-auth rearm.
*/
function atlasBridgeAuthExpiryMs404273(){
  let raw="";try{raw=String(sessionStorage.getItem(ATLAS_BRIDGE_AUTH_40375_EXPIRES_KEY)||"").trim();}catch(_){}
  if(!raw)return null;
  const numeric=Number(raw);
  if(Number.isFinite(numeric)&&numeric>0){
    if(numeric>1e12)return numeric;
    if(numeric>1e9)return numeric*1000;
  }
  const parsed=Date.parse(raw);return Number.isFinite(parsed)?parsed:null;
}
function atlasBridgeAuthLocalState404273(){
  const token=atlasBridgeAuthToken40375();
  const expiresMs=atlasBridgeAuthExpiryMs404273();
  const expired=Number.isFinite(expiresMs)&&expiresMs<=Date.now()+1000;
  return {token_present:!!token,expires_at_ms:expiresMs,expired,valid:!!token&&!expired};
}
function atlasBridgeAuthNeedsTrust404273(){
  if(!atlasAccessIsAuthorized())return false;
  return !atlasBridgeAuthLocalState404273().valid;
}
function atlasAtlasStateTruth404273(snapshot,completed=0,auth="OK",detail=""){
  const snap=snapshot?"SNAPSHOT OK":"SNAPSHOT ?";
  const current=snapshot?"CURRENT OK":"CURRENT ?";
  const bridge=atlasLocalDialogueState?.connected?"BRIDGE OK":"BRIDGE ?";
  const model=String(atlasLocalDialogueState?.model||"").trim()?"OLLAMA OK":"OLLAMA À CONFIRMER";
  const suffix=detail?` · ${detail}`:"";
  const line=`${snap} · ${current} · ${bridge} · AUTH ${auth} · ${model} · ATLAS ${Number(completed||0)}/4${suffix}`;
  setText(document.getElementById("atlasLocalReportsMeta"),line);
  try{document.documentElement.dataset.atlasStateTruth404273=auth==="OK"?"ready":"auth-required";}catch(_){}
  return line;
}
function atlasBridgeAuthRequireTrust404273(reason="bridge-auth-required",pendingHash="#local-ai-hub",error=null){
  atlasBridgeAuthClear40375();
  atlasLocalReportsState.authBlocked404273=true;
  atlasLocalReportsState.authBlockedReason404273=String(reason||"bridge-auth-required");
  atlasLocalReportsState.authBlockedAt404273=Date.now();
  atlasLocalReportsState.authBlockedFingerprint404273=String(atlasLocalReportsState.transactionFingerprint||atlasLocalReportsState.lastAutoAttemptFingerprint||"");
  atlasLocalReportsClearAutoTimer();
  atlasLocalReportsState.deferredRetryReason="";
  atlasLocalReportsState.deferredRetryDelayMs=0;
  atlasLocalReportsState.deferredRetryRequestedAt=0;
  atlasLocalReportsSetSuiteStatus("AUTH BRIDGE REQUISE · Atlas en pause · Aether Trust doit rétablir la session Administrator.","wait");
  atlasAnalysisProgressRender(0,"error","Bridge joignable mais session Administrator invalide · Atlas suspendu sans avancer vers le rapport suivant.");
  try{atlasAtlasStateTruth404273(atlasBuildCryptoPageSnapshot(),0,"REQUISE","AETHER TRUST");}catch(_){}
  try{atlasLocalDialogueSetConnection(true,"Bridge Ryzen joignable · authentification Administrator requise pour Atlas/Aerith.");}catch(_){}
  try{atlasAccessOpen(pendingHash||"#local-ai-hub");}catch(_){}
  return {ok:false,reason:String(reason||"bridge-auth-required"),message:String(error?.message||"")};
}
function atlasBridgeAuthRecoveryResolved404273(){
  atlasLocalReportsState.authBlocked404273=false;
  atlasLocalReportsState.authBlockedReason404273="";
  atlasLocalReportsState.authBlockedAt404273=0;
  atlasLocalReportsState.authBlockedFingerprint404273="";
  try{delete document.documentElement.dataset.atlasStateTruth404273;}catch(_){}
  return true;
}
try{globalThis.ErithAtlasStateTruth404273=Object.freeze({
  build:"40.4.273",parent:"40.4.272",auth_state:atlasBridgeAuthLocalState404273,
  auth_required:atlasBridgeAuthNeedsTrust404273,state_truth:atlasAtlasStateTruth404273,
  pending_current_preserved:true,post_auth_rearm_reuses_existing_owner:true,
  report_01_failure_stops_sequence:true,new_timer:false,new_observer:false,new_fetch_owner:false,
  new_storage_owner:false,market_core_changed:false,oracle_changed:false,strategy_a_changed:false,
  nox_changed:false,aerith_business_changed:false
});}catch(_){}

'''
text=text.replace(marker,helper+marker,1)

# 2 classify auth failures
old='''function atlasLocalBridgeRequestFailureKind(error) {\n  if (error?.name === "AbortError" || error?.name === "AtlasBridgeTimeoutError") return "timeout";\n  if (error?.name === "TypeError") return "offline";\n  const message = String(error?.message || "").toLowerCase();\n  if (message.includes("networkerror") || message.includes("failed to fetch") || message.includes("network")) return "offline";\n  return "bridge-error";\n}'''
new='''function atlasLocalBridgeRequestFailureKind(error) {\n  if (error?.name === "AbortError" || error?.name === "AtlasBridgeTimeoutError") return "timeout";\n  if (error?.name === "AtlasBridgeAuthError" || [401,403].includes(Number(error?.status))) return "auth";\n  if (error?.name === "TypeError") return "offline";\n  const message = String(error?.message || "").toLowerCase();\n  if (message.includes("networkerror") || message.includes("failed to fetch") || message.includes("network")) return "offline";\n  if (message.includes("authentification") || message.includes("authentication") || message.includes("unauthorized") || message.includes("forbidden")) return "auth";\n  return "bridge-error";\n}'''
assert text.count(old)==1
text=text.replace(old,new,1)

# 3 auth branch failure owner
old='''function atlasLocalBridgeRequestFailure(error, path = "") {\n  const kind = atlasLocalBridgeRequestFailureKind(error);\n  if (!["timeout", "offline"].includes(kind)) return kind;\n\n  atlasLocalDialogueState.connected = false;'''
new='''function atlasLocalBridgeRequestFailure(error, path = "") {\n  const kind = atlasLocalBridgeRequestFailureKind(error);\n  if (kind === "auth") {\n    atlasBridgeAuthRequireTrust404273(`protected-route:${String(path||"unknown")}`,"#local-ai-hub",error);\n    return kind;\n  }\n  if (!["timeout", "offline"].includes(kind)) return kind;\n\n  atlasLocalDialogueState.connected = false;'''
assert text.count(old)==1
text=text.replace(old,new,1)

# 4 preflight local token and preserve status on protected response
old='''async function atlasLocalBridgeRequest(path, payload, timeoutMs = ATLAS_LOCAL_BRIDGE_REQUEST_TIMEOUT_386_MS) {\n  if (!atlasDeviceComputeAllowed()) {\n    const error = new Error(atlasDeviceComputeBlockedMessage());\n    error.name = "AtlasDeviceObserverError";\n    throw error;\n  }\n  const controller = new AbortController();'''
new='''async function atlasLocalBridgeRequest(path, payload, timeoutMs = ATLAS_LOCAL_BRIDGE_REQUEST_TIMEOUT_386_MS) {\n  if (!atlasDeviceComputeAllowed()) {\n    const error = new Error(atlasDeviceComputeBlockedMessage());\n    error.name = "AtlasDeviceObserverError";\n    throw error;\n  }\n  if (atlasAccessIsAuthorized() && !atlasBridgeAuthLocalState404273().valid) {\n    const error = new Error("Authentification Administrator Bridge requise.");\n    error.name = "AtlasBridgeAuthError";\n    error.status = 401;\n    atlasLocalBridgeRequestFailure(error,path);\n    throw error;\n  }\n  const controller = new AbortController();'''
assert text.count(old)==1
text=text.replace(old,new,1)

old='''    const result = await response.json().catch(() => ({}));\n    if (!response.ok || result?.ok === false) {\n      throw new Error(result?.error || `Bridge HTTP ${response.status}`);\n    }'''
new='''    const result = await response.json().catch(() => ({}));\n    if (!response.ok || result?.ok === false) {\n      const raised = new Error(result?.error || `Bridge HTTP ${response.status}`);\n      raised.status = response.status;\n      raised.bridgePayload = result;\n      if ([401,403].includes(Number(response.status)) || /authentification|authentication|unauthorized|forbidden/i.test(String(raised.message||""))) raised.name = "AtlasBridgeAuthError";\n      throw raised;\n    }'''
assert text.count(old)==1
text=text.replace(old,new,1)

# 5 fast fail auth in report request
old='''      if (["timeout", "offline"].includes(failureKind)) {\n        // Fast fail: do not hammer the same endpoint a second time while\n        // the Bridge recovery watchdog is already taking ownership.\n        throw error;\n      }'''
new='''      if (["timeout", "offline", "auth"].includes(failureKind)) {\n        // Fast fail: do not hammer the same protected endpoint. Auth recovery\n        // belongs to Aether Trust; network recovery belongs to the Bridge watcher.\n        throw error;\n      }'''
assert text.count(old)==1
text=text.replace(old,new,1)

# 6 run preflight after local owner auth
old='''  if (!atlasAccessIsAuthorized()) {\n    atlasAccessOpen("#local-ai-hub");\n    return false;\n  }\n  if (\n    atlasLocalReportsState.running'''
new='''  if (!atlasAccessIsAuthorized()) {\n    atlasAccessOpen("#local-ai-hub");\n    return false;\n  }\n  if (!atlasBridgeAuthLocalState404273().valid) {\n    atlasBridgeAuthRequireTrust404273("atlas-preflight","#local-ai-hub");\n    return false;\n  }\n  if (\n    atlasLocalReportsState.running'''
assert text.count(old)==1
text=text.replace(old,new,1)

# 7 state truth start
old='''  setText(\n    document.getElementById("atlasLocalReportsMeta"),\n    `Snapshot ${atlasLocalReportSnapshotLabel(snapshot)} · quatre tâches séquentielles · lecture seule`\n  );'''
new='''  atlasAtlasStateTruth404273(snapshot,0,"OK",`snapshot ${atlasLocalReportSnapshotLabel(snapshot)} · quatre tâches séquentielles`);'''
assert text.count(old)==1
text=text.replace(old,new,1)

# 8 after successful stored update truth
old='''          if (atlasLocalDialogueState.activeResponseView === "conclusion") {\n            atlasLocalResponseRenderStored("conclusion");\n          }\n        } else throw new Error("Rapport local vide ou non affichable");'''
new='''          atlasAtlasStateTruth404273(snapshot,completed,"OK",`${label} terminé`);\n          if (atlasLocalDialogueState.activeResponseView === "conclusion") {\n            atlasLocalResponseRenderStored("conclusion");\n          }\n        } else throw new Error("Rapport local vide ou non affichable");'''
assert text.count(old)==1
text=text.replace(old,new,1)

# 9 inner catch auth branch before timeout
old='''        const bridgeFailure = atlasLocalBridgeRequestFailureKind(error);\n        if (["timeout", "offline"].includes(bridgeFailure)) {'''
new='''        const bridgeFailure = atlasLocalBridgeRequestFailureKind(error);\n        if (bridgeFailure === "auth") {\n          if (options.automatic === true && Number(atlasLocalReportsState.automaticModelRunAttempts||0)>0) atlasLocalReportsState.automaticModelRunAttempts -= 1;\n          atlasLocalReportsState.authBlocked404273 = true;\n          atlasLocalReportsState.authBlockedFingerprint404273 = fingerprint;\n          atlasLocalReportsSetSuiteStatus(`AUTH BRIDGE REQUISE · Atlas bloqué ${completed}/4 · ${label} non produit · reprise du même CURRENT après Aether Trust.`,"wait");\n          atlasAnalysisProgressRender(completed,"error",`${label} interrompu : authentification Administrator Bridge requise · aucun passage au rapport suivant.`);\n          atlasAtlasStateTruth404273(snapshot,completed,"REQUISE",`${label} BLOQUÉ`);\n          break;\n        }\n        if (["timeout", "offline"].includes(bridgeFailure)) {'''
assert text.count(old)==1
text=text.replace(old,new,1)

# 10 prevent generic retry when auth blocked
marker='''    atlasLocalReportsSetSuiteStatus(\n      completed\n        ? `${completed}/4 rapports prêts · reprise automatique des rapports manquants.`\n        : "0/4 rapport prêt · nouvelle tentative automatique programmée.",'''
insert='''    if (atlasLocalReportsState.authBlocked404273) {\n      return completed > 0;\n    }\n\n'''
assert text.count(marker)==1
text=text.replace(marker,insert+marker,1)

# 11 suppress schedule while auth blocked
old='''function atlasLocalReportsScheduleAutomatic(reason = "snapshot", options = {}) {\n  if (!atlasDeviceComputeAllowed()) {'''
new='''function atlasLocalReportsScheduleAutomatic(reason = "snapshot", options = {}) {\n  if (atlasLocalReportsState.authBlocked404273) return false;\n  if (!atlasDeviceComputeAllowed()) {'''
assert text.count(old)==1
text=text.replace(old,new,1)

# 12 flush deferred blocked
old='''function atlasLocalReportsFlushDeferredRetry() {\n  if (atlasLocalReportsState.automaticCycleClosed) {'''
new='''function atlasLocalReportsFlushDeferredRetry() {\n  if (atlasLocalReportsState.authBlocked404273) return false;\n  if (atlasLocalReportsState.automaticCycleClosed) {'''
assert text.count(old)==1
text=text.replace(old,new,1)

# 13 admin button recognizes stale bridge auth
old='''function atlasAdminAccountToggleAction40449() {\n  if (atlasAccessIsAuthorized()) {\n    atlasV2SyncShareableUrl("advanced");'''
new='''function atlasAdminAccountToggleAction40449() {\n  if (atlasAccessIsAuthorized() && atlasBridgeAuthNeedsTrust404273()) {\n    atlasAccessOpen("#local-ai-hub");\n    return;\n  }\n  if (atlasAccessIsAuthorized()) {\n    atlasV2SyncShareableUrl("advanced");'''
assert text.count(old)==1
text=text.replace(old,new,1)

# 14 resolve blocked state after successful Bridge auth, before existing post-auth rearm
old='''    atlasAccessSetSession(ATLAS_ACCESS_OWNER_ROLE);\n    atlasAccessSetStatus(bridgeAuth40375.ok ? "Accès Christophe + Bridge validés." : "Accès Christophe validé · Bridge hors ligne.", "ok");'''
new='''    atlasAccessSetSession(ATLAS_ACCESS_OWNER_ROLE);\n    if (bridgeAuth40375.ok) atlasBridgeAuthRecoveryResolved404273();\n    atlasAccessSetStatus(bridgeAuth40375.ok ? "Accès Christophe + Bridge validés." : "Accès Christophe validé · Bridge hors ligne.", "ok");'''
assert text.count(old)==1
text=text.replace(old,new,1)

# 15 status text uses expiry-aware truth
old='''function atlasBridgeAuthStatusText40375(){
  const token=atlasBridgeAuthToken40375();
  if(!atlasDeviceComputeAllowed())return "Book · aucun Bridge local";
  return token?"Bridge · session Administrator authentifiée":"Bridge · session Administrator non authentifiée";
}'''
new='''function atlasBridgeAuthStatusText40375(){
  if(!atlasDeviceComputeAllowed())return "Book · aucun Bridge local";
  return atlasBridgeAuthLocalState404273().valid?"Bridge · session Administrator authentifiée":"Bridge · session Administrator non authentifiée";
}'''
assert text.count(old)==1
text=text.replace(old,new,1)

APP.write_text(text,encoding='utf-8')

contract={
  'build':BUILD,'parent':PARENT,'scope':'atlas-state-truth-bridge-auth-recovery',
  'bridge_health_distinct_from_privileged_auth':True,
  'local_token_expiry_checked_before_protected_model_request':True,
  'http_401_403_classified_as_auth':True,
  'auth_failure_opens_existing_aether_trust':True,
  'administration_button_reopens_trust_when_bridge_session_missing_or_expired':True,
  'auth_failure_stops_report_sequence_before_next_mode':True,
  'same_pending_current_preserved_until_successful_close':True,
  'post_auth_rearm_reuses_existing_4051_40137_owner':True,
  'automatic_model_attempt_not_consumed_by_auth_failure':True,
  'new_timer':False,'new_observer':False,'new_fetch_owner':False,'new_storage_owner':False,
  'market_core_changed':False,'oracle_changed':False,'strategy_a_changed':False,
  'nox_changed':False,'aerith_business_changed':False,'bridge_protocol_changed':False
}
contract_path=Path('/tmp/agent_crypto_404273_contract.json')
contract_path.write_text(json.dumps(contract,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
run('python',str(DRIVER),'--build',BUILD,'--parent',PARENT,'--release',RELEASE,'--status',STATUS,
    '--contract-key','atlas_state_truth_bridge_auth_recovery_404273','--contract-json',str(contract_path),
    '--lineage-note','40.4.273 Atlas state truth + Bridge auth recovery')
run('node','--check',str(APP))
run('node','--check',str(BASE/'js/app.js'))
run('python',str(GUARD),'--expected-build',BUILD,'--expected-release',RELEASE)

final=APP.read_text(encoding='utf-8')
required=[owner,'function atlasBridgeAuthLocalState404273()','AtlasBridgeAuthError','AUTH BRIDGE REQUISE',
          'atlasLocalReportsState.authBlocked404273','atlasAccessIsAuthorized() && atlasBridgeAuthNeedsTrust404273()',
          'atlasBridgeAuthRecoveryResolved404273()','report_01_failure_stops_sequence:true',
          'if (atlasLocalReportsState.authBlocked404273) return false;']
for item in required:
    if item not in final: raise SystemExit(f'404273_FAIL: missing runtime marker {item}')
if final.count(owner)!=1: raise SystemExit('404273_FAIL: duplicate owner')
if 'const ATLAS_BUILD = "40.4.273";' not in final: raise SystemExit('404273_FAIL: runtime build identity')

COORD.mkdir(parents=True,exist_ok=True)
report=COORD/REPORT_NAME
report.write_text(f'''# Agent-Crypto {BUILD} — Atlas State Truth + Bridge Auth Recovery

- Parent: {PARENT}
- Market Core protected: {ENGINE}
- Scope: Atlas/Bridge authentication boundary only.

## Operator regression reproduced

Firefox remained in Administrator role while the privileged Bridge session was no longer valid. `/health` could still prove loopback reachability, while `/summary` or `/chat` rejected privileged work. The old runtime then hid the real cause and could advance the visible task label while remaining at 0/4.

## 40.4.273 correction

- Distinguishes Bridge reachability from privileged Administrator authentication.
- Reads the existing session token expiry before protected model calls when parseable.
- Preserves HTTP 401/403 and classifies them as `auth`, not generic `bridge-error`.
- Reopens the existing Aether Trust gate when privileged auth is missing or expired.
- The Administration header button also reopens Trust when Firefox still has owner role but Bridge auth is stale.
- Atlas stops on the failing report; it never advances to the next report while the counter remains unchanged.
- Automatic retries are suspended while auth is blocked.
- The existing pending CURRENT key remains untouched and the existing post-auth 40.4.51 / 40.4.137 rearm owner resumes the same pending canonical transaction after successful Trust authentication.
- Auth failure does not consume an automatic model-attempt budget.
- Existing Atlas meta exposes a compact truth chain: SNAPSHOT / CURRENT / BRIDGE / AUTH / OLLAMA / ATLAS n/4.

## Protected surfaces

- Market Core {ENGINE}: unchanged.
- Strategy A 40.4.272 logic: unchanged.
- Oracle: unchanged.
- NØX/Aerith business semantics: unchanged.
- Bridge protocol/backend: unchanged.
- No new recurring timer, observer, fetch owner or storage owner.

## Validation

- `node --check` root runtime: PASS.
- `node --check` Administrator runtime: PASS.
- Canonical version-truth guard: PASS.
- Static markers for auth classification, Trust re-entry, stop-sequence and retry suspension: PASS.

Firefox acceptance target: let a Bridge session become invalid while Firefox remains Administrator. A protected Atlas action must show `AUTH BRIDGE REQUISE`, open Aether Trust, remain on the same pending CURRENT, then resume once after successful authentication.
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
    if bad: raise SystemExit(f'404273_FAIL: bad ZIP member {bad}')
print(json.dumps({'ok':True,'build':BUILD,'zip':str(zip_path),'sha256':digest},ensure_ascii=False))
