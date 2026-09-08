#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, re, zipfile

ROOT=Path('public/agent_crypto_erith_ia/administrator')
OUTDIR=Path('coordination/inter_ai_dialogues/agent_crypto')
BUILD='40.6.18'; PARENT='40.6.17'; ENGINE='38.15.11'
RELEASE='END-TO-END UNKNOWN PROPAGATION · PAPER BRIDGE TRUTH'
STATUS='end_to_end_unknown_propagation_paper_bridge_truth_406018'
TOKEN=f'market-core-v2.0-alpha-build-{BUILD}'
NOW=datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')


def load(name):
    data=json.loads((ROOT/name).read_text(encoding='utf-8'))
    if not isinstance(data,dict): raise SystemExit(f'STOP {BUILD}: invalid {name}')
    return data

def dump(path,data): path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def sha256(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def once(text,old,new,label):
    count=text.count(old)
    if count!=1: raise SystemExit(f'STOP {BUILD}: {label} count={count}')
    return text.replace(old,new,1)

if str(load('version.json').get('build'))!=PARENT: raise SystemExit(f'STOP {BUILD}: expected parent {PARENT}')
if str(load('build.json').get('engine'))!=ENGINE: raise SystemExit(f'STOP {BUILD}: Market Core drift')

bridge_path=ROOT/'js/strategy-a-auto-lifecycle-bridge-404297.js'
index_path=ROOT/'index.html'
frozen_paths=[
    ROOT/'admin-chronos.css',ROOT/'js/version-truth.js',ROOT/'js/app.js',ROOT/'js/core/admin-window-manager.js',
    ROOT/'style.css',ROOT/'parallel-markets.css',ROOT/'market-reading-depth.css',ROOT/'admin-visual-assets.css',ROOT/'admin-visual-cache.css',
    ROOT/'oracle-presentation-405010.css',ROOT/'oracle-fx-406013.css',ROOT/'js/oracle-fx-406013.js',
    ROOT/'js/strategy-a-paper-lifecycle-404295.js',ROOT/'js/strategy-a-after-cost-metrics-404298.js',
    ROOT/'js/strategy-a-safety-certification-404299.js',ROOT/'js/strategy-a-evidence-dossier-404295.js',
]
freeze={p:p.read_bytes() for p in frozen_paths}

# ------------------------------------------------------------------
# 1) BRIDGE OWNER — external UNKNOWN facts stay null / fail closed
# ------------------------------------------------------------------
bridge=bridge_path.read_text(encoding='utf-8')
if 'unknown_propagation_406018:true' in bridge: raise SystemExit(f'STOP {BUILD}: bridge gate already present')
bridge=once(bridge,
'''  Agent-Crypto Administrator — Strategy A Auto/Paper ↔ Lifecycle bridge\n  Build: 40.4.297\n  Responsibility: synchronize the actual local Paper execution owner with the\n  corrected deterministic Lifecycle state machine. Accounting remains owned by\n  Paper 40.4.263/40.4.264. No network, no real order, no wallet, no credentials.''',
'''  Agent-Crypto Administrator — Strategy A Auto/Paper ↔ Lifecycle bridge\n  Build: 40.6.18\n  Responsibility: synchronize actual local Paper execution facts with the deterministic lifecycle.\n  External null/blank/boolean/missing numeric facts stay UNKNOWN; they are never defaulted to zero.\n  Asset notional may be derived only from price×quantity or authorized-notional−known-fee.\n  Contradictory known notional facts fail closed. No network, real order, wallet or credentials.''',
'bridge header')
bridge=once(bridge,'  const BUILD="40.4.297";','  const BUILD="40.6.18";','bridge build')
bridge=once(bridge,
'  const num=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;',
'''  const num=v=>{\n    if(v===null||v===undefined||typeof v==="boolean")return null;\n    if(typeof v==="string"&&!v.trim())return null;\n    const n=Number(v);return Number.isFinite(n)?n:null;\n  };\n  const positive=v=>{const n=num(v);return n!==null&&n>0?n:null;};\n  const nonnegative=v=>{const n=num(v);return n!==null&&n>=0?n:null;};\n  const NOTIONAL_TOLERANCE_EUR=0.01;''',
'strict bridge numeric parser')
bridge=once(bridge,
'  function preflight(){return {schema:SCHEMA,build:BUILD,ready:apiReady()&&!blockedReason,api_available:apiReady(),blocked_reason:blockedReason,paper_only:true,accounting_owner:"40.4.263/40.4.264",lifecycle_owner:"40.4.295",real_orders:false,network:false};}',
'  function preflight(){const a=lifecycle();return {schema:SCHEMA,build:BUILD,ready:apiReady()&&!blockedReason,api_available:apiReady(),blocked_reason:blockedReason,paper_only:true,accounting_owner:"40.4.263/40.4.264",lifecycle_owner:a?.build||null,real_orders:false,network:false};}',
'preflight lifecycle truth')

insert_after='  function fail(reason,error=null){blockedReason=String(reason||"LIFECYCLE_BRIDGE_ERROR");return {ok:false,reason:blockedReason,error:error?String(error?.message||error):null,bridge_blocked:true};}\n'
open_facts='''  function normalizeOpenFacts(fill={}){\n    const fillPrice=positive(fill?.fill_price_eur);\n    const qty=positive(fill?.quantity_btc);\n    const authorized=positive(fill?.authorized_notional_eur);\n    const entryFee=nonnegative(fill?.entry_fee_eur);\n    const direct=fillPrice!==null&&qty!==null?fillPrice*qty:null;\n    const derived=authorized!==null&&entryFee!==null&&authorized>entryFee?authorized-entryFee:null;\n    const both=direct!==null&&derived!==null;\n    const tolerance=both?Math.max(NOTIONAL_TOLERANCE_EUR,Math.max(Math.abs(direct),Math.abs(derived))*1e-6):NOTIONAL_TOLERANCE_EUR;\n    const contradictory=both&&Math.abs(direct-derived)>tolerance;\n    const assetNotional=contradictory?null:(direct!==null?direct:derived);\n    const unknown=[];\n    if(fillPrice===null)unknown.push("fill_price_eur");\n    if(qty===null)unknown.push("quantity_btc");\n    if(authorized===null)unknown.push("authorized_notional_eur");\n    if(entryFee===null)unknown.push("entry_fee_eur");\n    return {\n      fill_price_eur:fillPrice,quantity_btc:qty,authorized_notional_eur:authorized,entry_fee_eur:entryFee,\n      direct_asset_notional_eur:direct,derived_asset_notional_eur:derived,asset_notional_eur:assetNotional,\n      asset_notional_source:direct!==null?"FILL_PRICE_X_QUANTITY":derived!==null?"AUTHORIZED_MINUS_ENTRY_FEE":null,\n      contradictory,notional_tolerance_eur:tolerance,unknown_external_numeric_fields:unknown,\n      lifecycle_ready:!contradictory&&fillPrice!==null&&assetNotional!==null&&assetNotional>0\n    };\n  }\n  function selfTest(){\n    const direct=normalizeOpenFacts({fill_price_eur:100,quantity_btc:.5,authorized_notional_eur:null,entry_fee_eur:null});\n    const incomplete=normalizeOpenFacts({fill_price_eur:100,quantity_btc:null,authorized_notional_eur:51,entry_fee_eur:null});\n    const fallback=normalizeOpenFacts({fill_price_eur:100,quantity_btc:null,authorized_notional_eur:51,entry_fee_eur:1});\n    const contradiction=normalizeOpenFacts({fill_price_eur:100,quantity_btc:.5,authorized_notional_eur:60,entry_fee_eur:1});\n    const blank=normalizeOpenFacts({fill_price_eur:"",quantity_btc:false,authorized_notional_eur:null,entry_fee_eur:"   "});\n    const pass=direct.lifecycle_ready===true&&direct.asset_notional_eur===50&&direct.entry_fee_eur===null&&incomplete.lifecycle_ready===false&&incomplete.asset_notional_eur===null&&fallback.lifecycle_ready===true&&fallback.asset_notional_eur===50&&fallback.quantity_btc===null&&contradiction.contradictory===true&&contradiction.asset_notional_eur===null&&blank.fill_price_eur===null&&blank.quantity_btc===null&&blank.entry_fee_eur===null;\n    return {schema:"agent_crypto_strategy_a_auto_lifecycle_bridge_self_test_v2",build:BUILD,pass,checks:{direct_without_fee_preserves_unknown:direct.entry_fee_eur===null&&direct.asset_notional_eur===50,missing_fee_cannot_fake_fallback_zero:incomplete.asset_notional_eur===null,known_fee_fallback:fallback.asset_notional_eur===50,contradictory_notional_fails:contradiction.contradictory===true,blank_boolean_null_not_zero:blank.fill_price_eur===null&&blank.quantity_btc===null&&blank.entry_fee_eur===null}};\n  }\n'''
bridge=once(bridge,insert_after,insert_after+open_facts,'normalize open facts insertion')

old_open='''  function onOpen({proposal=null,risk=null,fill=null}={}){\n    try{\n      if(!apiReady())return fail("LIFECYCLE_API_UNAVAILABLE");\n      const executionId=String(fill?.execution_id||"").trim();\n      if(!executionId)return fail("EXECUTION_ID_MISSING");\n      if(BRIDGED.has(executionId))return {ok:true,duplicate:true,execution_id:executionId,state:clone(BRIDGED.get(executionId))};\n      const fillPrice=num(fill?.fill_price_eur),qty=num(fill?.quantity_btc);\n      const assetNotional=fillPrice>0&&qty>0?fillPrice*qty:Math.max(0,num(fill?.authorized_notional_eur)-num(fill?.entry_fee_eur));\n      if(!(assetNotional>0)&&!(fillPrice>0))return fail("EXECUTION_FACTS_INCOMPLETE");\n      const a=lifecycle();\n      let env=a.create({decision_id:String(proposal?.proposal_id||risk?.proposal_id||executionId),trade_id:executionId,proposal_id:proposal?.proposal_id||risk?.proposal_id||null,risk_id:risk?.risk_id||fill?.risk_id||null,symbol:fill?.symbol||"BTC",authorized_notional_eur:assetNotional});\n      if(env?.state!=="PROPOSAL")return fail("LIFECYCLE_CREATE_REFUSED");\n      env=a.risk_approve(env,String(risk?.decision||"ACCEPT"));\n      env=a.submit(env); env=a.acknowledge(env); env=a.fill(env,assetNotional,fillPrice);\n      if(!["FILLED","PARTIAL"].includes(String(env?.state)))return fail(`LIFECYCLE_OPEN_SYNC_${String(env?.state||"UNKNOWN")}`);\n      const row={schema:SCHEMA,build:BUILD,execution_id:executionId,opened_at:new Date().toISOString(),paper_authorized_notional_eur:num(fill?.authorized_notional_eur),asset_notional_eur:assetNotional,entry_fee_eur:num(fill?.entry_fee_eur),fill_price_eur:fillPrice,quantity_btc:qty,envelope:env,status:"OPEN_SYNCED",paper_only:true};\n      BRIDGED.set(executionId,row);return {ok:true,execution_id:executionId,state:clone(row)};\n    }catch(error){return fail("LIFECYCLE_OPEN_SYNC_EXCEPTION",error);}\n  }'''
new_open='''  function onOpen({proposal=null,risk=null,fill=null}={}){\n    try{\n      if(!apiReady())return fail("LIFECYCLE_API_UNAVAILABLE");\n      const executionId=String(fill?.execution_id||"").trim();\n      if(!executionId)return fail("EXECUTION_ID_MISSING");\n      if(BRIDGED.has(executionId))return {ok:true,duplicate:true,execution_id:executionId,state:clone(BRIDGED.get(executionId))};\n      const facts=normalizeOpenFacts(fill||{});\n      if(facts.contradictory)return fail("EXECUTION_FACTS_CONTRADICTORY");\n      if(!facts.lifecycle_ready)return fail("EXECUTION_FACTS_INCOMPLETE");\n      const fillPrice=facts.fill_price_eur,assetNotional=facts.asset_notional_eur;\n      const a=lifecycle();\n      let env=a.create({decision_id:String(proposal?.proposal_id||risk?.proposal_id||executionId),trade_id:executionId,proposal_id:proposal?.proposal_id||risk?.proposal_id||null,risk_id:risk?.risk_id||fill?.risk_id||null,symbol:fill?.symbol||"BTC",authorized_notional_eur:assetNotional});\n      if(env?.state!=="PROPOSAL")return fail("LIFECYCLE_CREATE_REFUSED");\n      env=a.risk_approve(env,String(risk?.decision||"ACCEPT"));\n      env=a.submit(env); env=a.acknowledge(env); env=a.fill(env,assetNotional,fillPrice);\n      if(!["FILLED","PARTIAL"].includes(String(env?.state)))return fail(`LIFECYCLE_OPEN_SYNC_${String(env?.state||"UNKNOWN")}`);\n      const row={schema:SCHEMA,build:BUILD,execution_id:executionId,opened_at:new Date().toISOString(),paper_authorized_notional_eur:facts.authorized_notional_eur,asset_notional_eur:assetNotional,asset_notional_source:facts.asset_notional_source,entry_fee_eur:facts.entry_fee_eur,fill_price_eur:fillPrice,quantity_btc:facts.quantity_btc,unknown_external_numeric_fields:facts.unknown_external_numeric_fields,envelope:env,status:"OPEN_SYNCED",paper_only:true};\n      BRIDGED.set(executionId,row);return {ok:true,execution_id:executionId,state:clone(row)};\n    }catch(error){return fail("LIFECYCLE_OPEN_SYNC_EXCEPTION",error);}\n  }'''
bridge=once(bridge,old_open,new_open,'onOpen strict propagation')

bridge=once(bridge,
'      let env=row.envelope;\n      env=a.reconcile(env,{state:"FILLED",filled_notional_eur:num(env?.filled_notional_eur)});',
'      let env=row.envelope;\n      const filledNotional=positive(env?.filled_notional_eur);\n      if(filledNotional===null)return fail("LIFECYCLE_FILLED_NOTIONAL_UNKNOWN");\n      env=a.reconcile(env,{state:"FILLED",filled_notional_eur:filledNotional});',
'onClose filled notional truth')
bridge=once(bridge,
'row.net_pnl_eur=Number.isFinite(Number(reconciliation?.net_pnl_eur))?Number(reconciliation.net_pnl_eur):null;',
'row.net_pnl_eur=num(reconciliation?.net_pnl_eur);',
'onClose net pnl strict parser')
bridge=once(bridge,
'  const api=Object.freeze({build:BUILD,schema:SCHEMA,preflight,on_open:onOpen,on_close:onClose,read,summary,operator_clear_bridge_block:clearBlockForOperatorReview,paper_only:true,real_orders:false,network:false,storage_write:false,accounting_owner_changed:false,lifecycle_shadow_connected:true});',
'  const api=Object.freeze({build:BUILD,schema:SCHEMA,preflight,on_open:onOpen,on_close:onClose,normalize_open_facts:normalizeOpenFacts,self_test:selfTest,read,summary,operator_clear_bridge_block:clearBlockForOperatorReview,paper_only:true,real_orders:false,network:false,storage_write:false,accounting_owner_changed:false,lifecycle_shadow_connected:true,unknown_propagation_406018:true,unknown_numeric_is_zero:false,contradictory_notional_fails_closed:true});',
'bridge API markers')
bridge_path.write_text(bridge,encoding='utf-8')

# ------------------------------------------------------------------
# 2) Publication truth / cache only changed bridge
# ------------------------------------------------------------------
index=index_path.read_text(encoding='utf-8')
for old,new,label in [
    ('<meta name="atlas-build" content="40.6.17" />','<meta name="atlas-build" content="40.6.18" />','atlas meta'),
    ('<meta name="administrator-build" content="40.6.17" />','<meta name="administrator-build" content="40.6.18" />','administrator meta'),
    ('<meta name="administrator-release" content="UNKNOWN ≠ 0 · STRICT AFTER-COST TRUTH GATE" />',f'<meta name="administrator-release" content="{RELEASE}" />','release meta'),
    ('<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.17" />',f'<meta name="atlas-asset-token" content="{TOKEN}" />','asset meta'),
    ('<title>Agent-Crypto @erith.IA — Build 40.6.17 · Administrator</title>','<title>Agent-Crypto @erith.IA — Build 40.6.18 · Administrator</title>','title'),
]: index=once(index,old,new,label)
pattern=r'(strategy-a-auto-lifecycle-bridge-404297\.js\?v=administrator-build-)[^"\']+'
index,n=re.subn(pattern,rf'\g<1>{BUILD}',index,count=1)
if n!=1: raise SystemExit(f'STOP {BUILD}: bridge cache token count={n}')
index_path.write_text(index,encoding='utf-8')

cascade={
 'parent_build':PARENT,'release':RELEASE,'status':STATUS,'owner':'js/strategy-a-auto-lifecycle-bridge-404297.js','scope':'paper_bridge_external_numeric_truth_only',
 'external_null_blank_boolean_missing_is_unknown':True,'unknown_entry_fee_defaulted_zero':False,'unknown_authorized_notional_defaulted_zero':False,
 'asset_notional_sources':['FILL_PRICE_X_QUANTITY','AUTHORIZED_MINUS_ENTRY_FEE'],'contradictory_known_notional_fails_closed':True,
 'after_cost_406017_preserved':True,'ledger_consistency_406016_preserved':True,'paper_lifecycle_406015_modified':False,'oracle_406013_modified':False,
 'chronos_modified':False,'header_width_406010_modified':False,'market_core_modified':False,'graph_modified':False,'technical_reading_modified':False,
 'window_manager_modified':False,'automatic_order':False,'real_order':False,'new_network_owner':False,'new_storage_owner':False,'new_timer':False,'new_observer':False,
}
v=load('version.json');v.update({'release':RELEASE,'build':BUILD,'asset_token':TOKEN,'status':STATUS,'prepared_at':NOW,'published_at':NOW,'parent_build':PARENT});
if isinstance(v.get('lineage'),str) and '40.6.18 end-to-end UNKNOWN' not in v['lineage']: v['lineage']+=' → 40.6.18 end-to-end UNKNOWN propagation through Auto/Paper bridge'
v['cascade_40_6_18']=cascade;dump(ROOT/'version.json',v)
b=load('build.json');b.update({'build':BUILD,'engine':ENGINE,'release':RELEASE,'published':True,'status':STATUS,'parent_build':PARENT,'asset_token':TOKEN,'administrator_build':BUILD,'build_label':f'Build {BUILD}','release_status':RELEASE,'timestamp':NOW});
if isinstance(b.get('current_version_truth'),dict): b['current_version_truth']['loaded_build']=BUILD
b['cascade_40_6_18']=cascade;dump(ROOT/'build.json',b)
a=load('administrator-version.json');a.update({'build':BUILD,'release':RELEASE,'status':STATUS,'prepared_at':NOW,'published_at':NOW,'parent_build':PARENT,'asset_token':TOKEN});a['cascade_40_6_18']=cascade;dump(ROOT/'administrator-version.json',a)

release_path=ROOT/'RELEASE_40_6_18.md'
release_path.write_text(f'''# Agent-Crypto {BUILD} — {RELEASE}\n\n- Parent: `{PARENT}`\n- Market Core `{ENGINE}` protected / unchanged.\n- Changed runtime owner: `js/strategy-a-auto-lifecycle-bridge-404297.js`.\n- External `null`, blank, boolean, missing or invalid numerics stay `null`/UNKNOWN.\n- Missing entry fee can no longer become `0` to fabricate `authorized_notional - fee`.\n- Price×quantity remains a valid direct asset-notional proof even when fee/authorized notional are unknown.\n- Authorized-notional−fee fallback requires both values to be known.\n- Contradictory known direct/fallback notionals fail closed.\n- Filled-notional reconciliation refuses UNKNOWN.\n- After-Cost 40.6.17, Ledger 40.6.16, Paper authorization 40.6.15, Safety 40.6.14, Oracle 40.6.13, Chronos, Graphique, Lecture Technique and Window Manager are frozen.\n- No real order / network / storage / timer / observer owner added.\n\nGenerated: `{NOW}`\n''',encoding='utf-8')

for p,before in freeze.items():
    if p.read_bytes()!=before: raise SystemExit(f'STOP {BUILD}: protected owner modified: {p}')

OUTDIR.mkdir(parents=True,exist_ok=True)
zip_path=OUTDIR/'AGENT_CRYPTO_BUILD_40_6_18_UNKNOWN_PROPAGATION_BRIDGE_CLEAN_UPLOAD_8_FILES.zip'
payload=[index_path,bridge_path,ROOT/'build.json',ROOT/'administrator-version.json',ROOT/'version.json',release_path,Path('.github/scripts/agent_crypto_40618_unknown_propagation_bridge.py')]
lines=[f'Agent-Crypto {BUILD} restore manifest',f'Parent={PARENT}',f'Engine={ENGINE}','']+[f'{sha256(p)}  {p.as_posix()}' for p in payload]
with zipfile.ZipFile(zip_path,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in payload:z.write(p,p.as_posix())
    z.writestr('RESTORE_MANIFEST.txt','\n'.join(lines)+'\n')
zip_sha=sha256(zip_path);zip_path.with_suffix(zip_path.suffix+'.sha256').write_text(f'{zip_sha}  {zip_path.name}\n',encoding='utf-8')
print(json.dumps({'ok':True,'build':BUILD,'parent':PARENT,'unknown_propagation':True,'protected_owners_modified':False,'zip':str(zip_path),'sha256':zip_sha},ensure_ascii=False))
