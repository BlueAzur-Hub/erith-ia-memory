#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, re, zipfile

ROOT=Path('public/agent_crypto_erith_ia/administrator')
OUTDIR=Path('coordination/inter_ai_dialogues/agent_crypto')
BUILD='40.6.19'; PARENT='40.6.18'; ENGINE='38.15.11'
RELEASE='EVIDENCE READINESS TRUTH · STRICT DATASET COMPLETENESS'
STATUS='evidence_readiness_truth_strict_dataset_completeness_406019'
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

dossier_path=ROOT/'js/strategy-a-evidence-dossier-404295.js'
index_path=ROOT/'index.html'
frozen_paths=[
    ROOT/'admin-chronos.css',ROOT/'js/version-truth.js',ROOT/'js/app.js',ROOT/'js/core/admin-window-manager.js',
    ROOT/'style.css',ROOT/'parallel-markets.css',ROOT/'market-reading-depth.css',ROOT/'admin-visual-assets.css',ROOT/'admin-visual-cache.css',
    ROOT/'oracle-presentation-405010.css',ROOT/'oracle-fx-406013.css',ROOT/'js/oracle-fx-406013.js',
    ROOT/'js/strategy-a-paper-lifecycle-404295.js',ROOT/'js/strategy-a-after-cost-metrics-404298.js',
    ROOT/'js/strategy-a-auto-lifecycle-bridge-404297.js',ROOT/'js/strategy-a-safety-certification-404299.js',
]
freeze={p:p.read_bytes() for p in frozen_paths}

# ------------------------------------------------------------------
# 1) EVIDENCE DOSSIER — strict after-cost dataset readiness
# ------------------------------------------------------------------
dossier=dossier_path.read_text(encoding='utf-8')
if 'strict_dataset_completeness_406019:true' in dossier: raise SystemExit(f'STOP {BUILD}: evidence readiness gate already present')
dossier=once(dossier,
'''  Agent-Crypto Administrator — Strategy A Paper V2 evidence dossier passive truth lock\n  Build: 40.4.295\n  Responsibility: read existing evidence without executing hidden self-tests or mutating lab state.\n  No backtest fabrication, no network, no exchange call, no real order.''',
'''  Agent-Crypto Administrator — Strategy A Paper V2 evidence dossier passive truth lock\n  Build: 40.6.19\n  Responsibility: read existing evidence without executing hidden self-tests or mutating lab state.\n  After-cost readiness requires strict numeric facts plus COMPLETE + VERIFIED accounting truth.\n  Null, blank, boolean and partial rows never count as complete evidence.\n  No backtest fabrication, no network, no exchange call, no real order.''',
'dossier header')
dossier=once(dossier,'  const BUILD="40.4.295";','  const BUILD="40.6.19";','dossier build')
dossier=once(dossier,
'  const num=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;',
'''  const num=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;\n  const knownNumber=v=>{\n    if(v===null||v===undefined||typeof v==="boolean")return null;\n    if(typeof v==="string"&&!v.trim())return null;\n    const n=Number(v);return Number.isFinite(n)?n:null;\n  };''',
'strict known number helper')

old_dataset='''  function datasetReadiness(rows=[],kind="generic"){\n    const list=(Array.isArray(rows)?rows:[]).filter(r=>r&&typeof r==="object");\n    const ids=new Set(),dups=[];let chronological=true,last=-Infinity,complete=0,missingId=0,missingTimestamp=0;\n    for(const row of list){\n      const id=String(row.trade_id||row.cycle_id||row.replay_id||"").trim();\n      if(!id)missingId++;else{if(ids.has(id))dups.push(id);ids.add(id);}\n      const t=Date.parse(row.at||row.captured_at||row.timestamp||row.created_at||"");\n      if(!Number.isFinite(t))missingTimestamp++;else{if(t<last)chronological=false;last=Math.max(last,t);}\n      if(row.trade_id&&Number.isFinite(Number(row.net_pnl_eur))&&Number.isFinite(Number(row.total_costs_eur)))complete++;\n    }\n    const duplicateIds=[...new Set(dups)];\n    const integrityReady=list.length>0&&missingId===0&&missingTimestamp===0&&duplicateIds.length===0&&chronological;\n    const allAfterCostComplete=kind==="after_cost"&&list.length>0&&complete===list.length;\n    return {\n      schema:"agent_crypto_strategy_a_dataset_readiness_v2",build:BUILD,kind,rows:list.length,unique_ids:ids.size,\n      duplicate_ids:duplicateIds,missing_ids:missingId,missing_timestamps:missingTimestamp,chronological,\n      after_cost_complete_rows:complete,data_integrity_ready:integrityReady,\n      backtest_ready:false,out_of_sample_ready:false,walk_forward_ready:false,\n      monte_carlo_ready:integrityReady&&allAfterCostComplete&&complete>=30,\n      reason:!list.length?"No evidence rows supplied.":!integrityReady?"Evidence integrity incomplete: duplicates, IDs, timestamps or chronology must be resolved.":kind==="after_cost"&&!allAfterCostComplete?"After-cost rows are incomplete.":"Evidence collected; historical market replay dataset and certified outcome labels still required.",\n      fabricated_data:false\n    };\n  }'''
new_dataset='''  function datasetReadiness(rows=[],kind="generic"){\n    const list=(Array.isArray(rows)?rows:[]).filter(r=>r&&typeof r==="object");\n    const ids=new Set(),dups=[];let chronological=true,last=-Infinity,complete=0,missingId=0,missingTimestamp=0;\n    let numericUnknownRows=0,unverifiedAfterCostRows=0;\n    for(const row of list){\n      const id=String(row.trade_id||row.cycle_id||row.replay_id||"").trim();\n      if(!id)missingId++;else{if(ids.has(id))dups.push(id);ids.add(id);}\n      const t=Date.parse(row.at||row.captured_at||row.timestamp||row.created_at||"");\n      if(!Number.isFinite(t))missingTimestamp++;else{if(t<last)chronological=false;last=Math.max(last,t);}\n      if(row.trade_id){\n        const net=knownNumber(row.net_pnl_eur),totalCosts=knownNumber(row.total_costs_eur);\n        const numericKnown=net!==null&&totalCosts!==null&&totalCosts>=0;\n        const accountingVerified=kind!=="after_cost"||(row.cost_completeness==="COMPLETE"&&row.accounting_identity_status==="VERIFIED"&&row.accounting_identity_ok===true);\n        if(!numericKnown)numericUnknownRows++;\n        else if(kind==="after_cost"&&!accountingVerified)unverifiedAfterCostRows++;\n        if(numericKnown&&accountingVerified)complete++;\n      }\n    }\n    const duplicateIds=[...new Set(dups)];\n    const integrityReady=list.length>0&&missingId===0&&missingTimestamp===0&&duplicateIds.length===0&&chronological;\n    const allAfterCostComplete=kind==="after_cost"&&list.length>0&&complete===list.length;\n    return {\n      schema:"agent_crypto_strategy_a_dataset_readiness_v3",build:BUILD,kind,rows:list.length,unique_ids:ids.size,\n      duplicate_ids:duplicateIds,missing_ids:missingId,missing_timestamps:missingTimestamp,chronological,\n      after_cost_complete_rows:complete,numeric_unknown_rows:numericUnknownRows,unverified_after_cost_rows:unverifiedAfterCostRows,data_integrity_ready:integrityReady,\n      strict_numeric_truth:true,after_cost_requires_verified_identity:kind==="after_cost",\n      backtest_ready:false,out_of_sample_ready:false,walk_forward_ready:false,\n      monte_carlo_ready:integrityReady&&allAfterCostComplete&&complete>=30,\n      reason:!list.length?"No evidence rows supplied.":!integrityReady?"Evidence integrity incomplete: duplicates, IDs, timestamps or chronology must be resolved.":kind==="after_cost"&&!allAfterCostComplete?"After-cost rows are incomplete, numerically unknown or not VERIFIED.":"Evidence collected; historical market replay dataset and certified outcome labels still required.",\n      fabricated_data:false\n    };\n  }'''
dossier=once(dossier,old_dataset,new_dataset,'dataset readiness strict truth')

old_test='''  function selfTest(){\n    const bad=datasetReadiness([{trade_id:"A",at:"2026-01-01T00:00:00Z",net_pnl_eur:1,total_costs_eur:.1},{trade_id:"A",at:"",net_pnl_eur:-1,total_costs_eur:.1}],"after_cost");\n    const before=JSON.stringify({life:(globalThis.AgentCryptoStrategyAPaperLifecycle404295||globalThis.AgentCryptoStrategyAPaperLifecycle404291)?.diagnostic_snapshot?.()||null,safety:(globalThis.AgentCryptoStrategyASafetyCertification404295||globalThis.AgentCryptoStrategyASafetyCertification404293)?.snapshot?.()||null,metrics:globalThis.AgentCryptoStrategyAAfterCostMetrics404292?.read?.()||[]});\n    const d=snapshot();\n    const after=JSON.stringify({life:(globalThis.AgentCryptoStrategyAPaperLifecycle404295||globalThis.AgentCryptoStrategyAPaperLifecycle404291)?.diagnostic_snapshot?.()||null,safety:(globalThis.AgentCryptoStrategyASafetyCertification404295||globalThis.AgentCryptoStrategyASafetyCertification404293)?.snapshot?.()||null,metrics:globalThis.AgentCryptoStrategyAAfterCostMetrics404292?.read?.()||[]});\n    const pass=bad.data_integrity_ready===false&&bad.monte_carlo_ready===false&&d.certification.certified_for_live===false&&d.fabricated_backtest===false&&d.paper_only===true&&before===after;\n    return {schema:"agent_crypto_strategy_a_evidence_dossier_self_test_v2",build:BUILD,pass,checks:{bad_dataset_rejected:bad.data_integrity_ready===false,no_fake_monte_carlo:bad.monte_carlo_ready===false,no_fake_backtest:d.dataset.after_cost.backtest_ready===false,micro_live_locked:d.certification.micro_live_locked===true,paper_only:d.paper_only===true,passive_snapshot_no_state_mutation:before===after}};\n  }'''
new_test='''  function selfTest(){\n    const bad=datasetReadiness([{trade_id:"A",at:"2026-01-01T00:00:00Z",net_pnl_eur:1,total_costs_eur:.1,cost_completeness:"COMPLETE",accounting_identity_status:"VERIFIED",accounting_identity_ok:true},{trade_id:"A",at:"",net_pnl_eur:-1,total_costs_eur:.1,cost_completeness:"COMPLETE",accounting_identity_status:"VERIFIED",accounting_identity_ok:true}],"after_cost");\n    const unknown=datasetReadiness([{trade_id:"U1",at:"2026-01-01T00:00:00Z",net_pnl_eur:null,total_costs_eur:"",cost_completeness:"COMPLETE",accounting_identity_status:"VERIFIED",accounting_identity_ok:true},{trade_id:"U2",at:"2026-01-01T00:01:00Z",net_pnl_eur:false,total_costs_eur:0,cost_completeness:"COMPLETE",accounting_identity_status:"VERIFIED",accounting_identity_ok:true}],"after_cost");\n    const partial=datasetReadiness([{trade_id:"P1",at:"2026-01-01T00:00:00Z",net_pnl_eur:1,total_costs_eur:0,cost_completeness:"PARTIAL_MODEL",accounting_identity_status:"INDETERMINATE_COSTS",accounting_identity_ok:null}],"after_cost");\n    const before=JSON.stringify({life:(globalThis.AgentCryptoStrategyAPaperLifecycle404295||globalThis.AgentCryptoStrategyAPaperLifecycle404291)?.diagnostic_snapshot?.()||null,safety:(globalThis.AgentCryptoStrategyASafetyCertification404295||globalThis.AgentCryptoStrategyASafetyCertification404293)?.snapshot?.()||null,metrics:globalThis.AgentCryptoStrategyAAfterCostMetrics404292?.read?.()||[]});\n    const d=snapshot();\n    const after=JSON.stringify({life:(globalThis.AgentCryptoStrategyAPaperLifecycle404295||globalThis.AgentCryptoStrategyAPaperLifecycle404291)?.diagnostic_snapshot?.()||null,safety:(globalThis.AgentCryptoStrategyASafetyCertification404295||globalThis.AgentCryptoStrategyASafetyCertification404293)?.snapshot?.()||null,metrics:globalThis.AgentCryptoStrategyAAfterCostMetrics404292?.read?.()||[]});\n    const strictUnknown=unknown.after_cost_complete_rows===0&&unknown.numeric_unknown_rows===2&&unknown.monte_carlo_ready===false;\n    const strictVerified=partial.after_cost_complete_rows===0&&partial.unverified_after_cost_rows===1&&partial.monte_carlo_ready===false;\n    const pass=bad.data_integrity_ready===false&&bad.monte_carlo_ready===false&&strictUnknown&&strictVerified&&d.certification.certified_for_live===false&&d.fabricated_backtest===false&&d.paper_only===true&&before===after;\n    return {schema:"agent_crypto_strategy_a_evidence_dossier_self_test_v3",build:BUILD,pass,checks:{bad_dataset_rejected:bad.data_integrity_ready===false,null_blank_boolean_not_complete:strictUnknown,partial_unverified_not_complete:strictVerified,no_fake_monte_carlo:bad.monte_carlo_ready===false,no_fake_backtest:d.dataset.after_cost.backtest_ready===false,micro_live_locked:d.certification.micro_live_locked===true,paper_only:d.paper_only===true,passive_snapshot_no_state_mutation:before===after}};\n  }'''
dossier=once(dossier,old_test,new_test,'evidence dossier self-test')
dossier=once(dossier,
'  const api=Object.freeze({build:BUILD,schema:SCHEMA,snapshot,dataset_readiness:datasetReadiness,self_test:selfTest,export_json:exportJson,render,paper_only:true,real_orders:false,network:false,profitability_claim:false,fabricated_backtest:false,passive_read:true,implicit_self_tests:false});',
'  const api=Object.freeze({build:BUILD,schema:SCHEMA,snapshot,dataset_readiness:datasetReadiness,self_test:selfTest,export_json:exportJson,render,paper_only:true,real_orders:false,network:false,profitability_claim:false,fabricated_backtest:false,passive_read:true,implicit_self_tests:false,strict_dataset_completeness_406019:true,null_blank_boolean_complete_row:false,after_cost_verified_identity_required:true});',
'dossier API marker')
dossier_path.write_text(dossier,encoding='utf-8')

# ------------------------------------------------------------------
# 2) Publication truth / cache only changed dossier
# ------------------------------------------------------------------
index=index_path.read_text(encoding='utf-8')
for old,new,label in [
    ('<meta name="atlas-build" content="40.6.18" />','<meta name="atlas-build" content="40.6.19" />','atlas meta'),
    ('<meta name="administrator-build" content="40.6.18" />','<meta name="administrator-build" content="40.6.19" />','administrator meta'),
    ('<meta name="administrator-release" content="END-TO-END UNKNOWN PROPAGATION · PAPER BRIDGE TRUTH" />',f'<meta name="administrator-release" content="{RELEASE}" />','release meta'),
    ('<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.18" />',f'<meta name="atlas-asset-token" content="{TOKEN}" />','asset meta'),
    ('<title>Agent-Crypto @erith.IA — Build 40.6.18 · Administrator</title>','<title>Agent-Crypto @erith.IA — Build 40.6.19 · Administrator</title>','title'),
]: index=once(index,old,new,label)
pattern=r'(strategy-a-evidence-dossier-404295\.js\?v=administrator-build-)[^"\']+'
index,n=re.subn(pattern,rf'\g<1>{BUILD}',index,count=1)
if n!=1: raise SystemExit(f'STOP {BUILD}: dossier cache token count={n}')
index_path.write_text(index,encoding='utf-8')

cascade={
 'parent_build':PARENT,'release':RELEASE,'status':STATUS,'owner':'js/strategy-a-evidence-dossier-404295.js','scope':'passive_evidence_readiness_truth_only',
 'strict_numeric_truth':True,'null_blank_boolean_count_as_numeric':False,'after_cost_complete_requires':['strict finite net_pnl_eur','strict finite nonnegative total_costs_eur','cost_completeness=COMPLETE','accounting_identity_status=VERIFIED','accounting_identity_ok=true'],
 'partial_after_cost_can_count_complete':False,'monte_carlo_requires_all_complete_verified_and_min_30':True,'backtest_ready_forced_false':True,
 'unknown_propagation_406018_preserved':True,'after_cost_406017_preserved':True,'ledger_consistency_406016_preserved':True,'paper_lifecycle_406015_modified':False,
 'safety_governor_modified':False,'oracle_406013_modified':False,'chronos_modified':False,'header_width_406010_modified':False,'market_core_modified':False,'graph_modified':False,'technical_reading_modified':False,'window_manager_modified':False,
 'automatic_order':False,'real_order':False,'new_network_owner':False,'new_storage_owner':False,'new_timer':False,'new_observer':False,'implicit_self_tests':False,
}
v=load('version.json');v.update({'release':RELEASE,'build':BUILD,'asset_token':TOKEN,'status':STATUS,'prepared_at':NOW,'published_at':NOW,'parent_build':PARENT});
if isinstance(v.get('lineage'),str) and '40.6.19 strict evidence readiness' not in v['lineage']: v['lineage']+=' → 40.6.19 strict evidence readiness / verified After-Cost dataset truth'
v['cascade_40_6_19']=cascade;dump(ROOT/'version.json',v)
b=load('build.json');b.update({'build':BUILD,'engine':ENGINE,'release':RELEASE,'published':True,'status':STATUS,'parent_build':PARENT,'asset_token':TOKEN,'administrator_build':BUILD,'build_label':f'Build {BUILD}','release_status':RELEASE,'timestamp':NOW});
if isinstance(b.get('current_version_truth'),dict): b['current_version_truth']['loaded_build']=BUILD
b['cascade_40_6_19']=cascade;dump(ROOT/'build.json',b)
a=load('administrator-version.json');a.update({'build':BUILD,'release':RELEASE,'status':STATUS,'prepared_at':NOW,'published_at':NOW,'parent_build':PARENT,'asset_token':TOKEN});a['cascade_40_6_19']=cascade;dump(ROOT/'administrator-version.json',a)

release_path=ROOT/'RELEASE_40_6_19.md'
release_path.write_text(f'''# Agent-Crypto {BUILD} — {RELEASE}\n\n- Parent: `{PARENT}`\n- Market Core `{ENGINE}` protected / unchanged.\n- Changed runtime owner: `js/strategy-a-evidence-dossier-404295.js`.\n- After-Cost evidence no longer treats `null`, blank strings or booleans as numeric zero.\n- A row counts complete only with strict numeric net/cost facts and `COMPLETE + VERIFIED + accounting_identity_ok=true`.\n- Partial/indeterminate rows never promote Monte Carlo readiness.\n- Backtest/out-of-sample/walk-forward remain explicitly unavailable; no fabricated evidence.\n- Passive snapshot remains passive; no implicit self-test or state mutation.\n- Bridge 40.6.18, After-Cost 40.6.17, Ledger 40.6.16, Paper 40.6.15, Safety 40.6.14, Oracle 40.6.13, Chronos, Graphique, Lecture Technique and Window Manager frozen.\n- No real order / network / storage / timer / observer owner added.\n\nGenerated: `{NOW}`\n''',encoding='utf-8')

for p,before in freeze.items():
    if p.read_bytes()!=before: raise SystemExit(f'STOP {BUILD}: protected owner modified: {p}')

OUTDIR.mkdir(parents=True,exist_ok=True)
zip_path=OUTDIR/'AGENT_CRYPTO_BUILD_40_6_19_EVIDENCE_READINESS_TRUTH_CLEAN_UPLOAD_8_FILES.zip'
payload=[index_path,dossier_path,ROOT/'build.json',ROOT/'administrator-version.json',ROOT/'version.json',release_path,Path('.github/scripts/agent_crypto_40619_evidence_readiness_truth.py')]
lines=[f'Agent-Crypto {BUILD} restore manifest',f'Parent={PARENT}',f'Engine={ENGINE}','']+[f'{sha256(p)}  {p.as_posix()}' for p in payload]
with zipfile.ZipFile(zip_path,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in payload:z.write(p,p.as_posix())
    z.writestr('RESTORE_MANIFEST.txt','\n'.join(lines)+'\n')
zip_sha=sha256(zip_path);zip_path.with_suffix(zip_path.suffix+'.sha256').write_text(f'{zip_sha}  {zip_path.name}\n',encoding='utf-8')
print(json.dumps({'ok':True,'build':BUILD,'parent':PARENT,'strict_dataset_completeness':True,'protected_owners_modified':False,'zip':str(zip_path),'sha256':zip_sha},ensure_ascii=False))
