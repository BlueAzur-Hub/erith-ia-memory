#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, re, zipfile

ROOT=Path('public/agent_crypto_erith_ia/administrator')
OUTDIR=Path('coordination/inter_ai_dialogues/agent_crypto')
BUILD='40.6.16'; PARENT='40.6.15'; ENGINE='38.15.11'
RELEASE='AFTER-COST LEDGER CONSISTENCY · CORE FREEZE'
STATUS='after_cost_ledger_consistency_core_freeze_406016'
TOKEN=f'market-core-v2.0-alpha-build-{BUILD}'
NOW=datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')


def load(name):
    d=json.loads((ROOT/name).read_text(encoding='utf-8'))
    if not isinstance(d,dict): raise SystemExit(f'STOP {BUILD}: invalid {name}')
    return d

def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()

def once(text, old, new, label):
    count=text.count(old)
    if count != 1: raise SystemExit(f'STOP {BUILD}: {label} count={count}')
    return text.replace(old,new,1)

if str(load('version.json').get('build')) != PARENT:
    raise SystemExit(f'STOP {BUILD}: expected parent {PARENT}')
if str(load('build.json').get('engine')) != ENGINE:
    raise SystemExit(f'STOP {BUILD}: Market Core drift')

after_path=ROOT/'js/strategy-a-after-cost-metrics-404298.js'
index_path=ROOT/'index.html'

# Hard freeze everything outside the After-Cost owner + publication truth files.
frozen_paths=[
    ROOT/'admin-chronos.css',
    ROOT/'js/version-truth.js',
    ROOT/'js/app.js',
    ROOT/'js/core/admin-window-manager.js',
    ROOT/'style.css',
    ROOT/'parallel-markets.css',
    ROOT/'market-reading-depth.css',
    ROOT/'admin-visual-assets.css',
    ROOT/'admin-visual-cache.css',
    ROOT/'oracle-presentation-405010.css',
    ROOT/'oracle-fx-406013.css',
    ROOT/'js/oracle-fx-406013.js',
    ROOT/'js/strategy-a-paper-lifecycle-404295.js',
    ROOT/'js/strategy-a-auto-lifecycle-bridge-404297.js',
    ROOT/'js/strategy-a-safety-certification-404299.js',
    ROOT/'js/strategy-a-evidence-dossier-404295.js',
]
freeze={p:p.read_bytes() for p in frozen_paths}

# ------------------------------------------------------------------
# 1) AFTER-COST OWNER SURGERY — LEDGER CONSISTENCY
# ------------------------------------------------------------------
after=after_path.read_text(encoding='utf-8')
if 'ledger_consistency_406016:true' in after:
    raise SystemExit(f'STOP {BUILD}: ledger consistency already present')

after=once(after,
'''  Agent-Crypto Administrator — Strategy A actual Paper after-cost evidence\n  Build: 40.4.298\n  Responsibility: consume the canonical local Paper reconciliation 40.4.264.\n  UNKNOWN cost components are never coerced to zero. No profitability claim.''',
'''  Agent-Crypto Administrator — Strategy A actual Paper after-cost evidence\n  Build: 40.6.16\n  Responsibility: preserve one canonical after-cost row per Paper reconciliation.\n  Complete accounting identity is verified only when every required cost is known.\n  Incomplete cost models remain evidence but their identity is INDETERMINATE.\n  UNKNOWN cost components are never promoted to a verified zero. No profitability claim.''',
'after-cost header')
after=once(after,'  const BUILD="40.4.298";','  const BUILD="40.6.16";','after-cost build')
after=once(after,'  const SAMPLE_MIN=30;','  const SAMPLE_MIN=30;\n  const ACCOUNTING_TOLERANCE_EUR=1e-8;','accounting tolerance')

old_func='''  function fromReconciliation(row={}){\n    const id=identity(row); if(!id)return {ok:false,reason:"RECONCILIATION_ID_MISSING"};\n    if(ROWS.some(r=>r.identity===id))return {ok:false,reason:"DUPLICATE_RECONCILIATION",identity:id};\n    const qty=val(row.quantity_btc),entryRef=val(row.entry_reference_eur),exitRef=val(row.exit_reference_eur),net=val(row.net_pnl_eur);\n    if(!(qty>0)||!(entryRef>0)||!(exitRef>0)||net===null)return {ok:false,reason:"INCOMPLETE_RECONCILIATION_FACTS",identity:id};\n    const entryFee=nonneg(row.entry_fee_eur),exitFee=nonneg(row.exit_fee_eur),impact=nonneg(row.estimated_total_impact_eur);\n    const spread=nonneg(row.spread_eur),slippage=nonneg(row.slippage_eur);\n    const unknown=[]; if(spread===null)unknown.push("spread_eur"); if(slippage===null)unknown.push("slippage_eur");\n    if(entryFee===null||exitFee===null)unknown.push("fees_eur"); if(impact===null)unknown.push("impact_eur");\n    const fees=(entryFee??0)+(exitFee??0),knownImpact=impact??0,knownCosts=fees+knownImpact;\n    const referenceGross=(exitRef-entryRef)*qty;\n    const modeledNetKnown=referenceGross-knownCosts;\n    const identityError=net-modeledNetKnown;\n    const complete=unknown.length===0;\n    const totalCosts=complete?knownCosts+(spread??0)+(slippage??0):"UNKNOWN";\n    const out={\n      schema:SCHEMA,build:BUILD,identity:id,reconciliation_id:row.reconciliation_id||null,execution_id:row.execution_id||null,trade_id:row.execution_id||id,\n      at:String(row.closed_at||new Date().toISOString()),symbol:String(row.symbol||"BTC").toUpperCase(),paper_only:true,real_order:false,\n      quantity_btc:qty,entry_reference_eur:entryRef,exit_reference_eur:exitRef,reference_gross_pnl_eur:referenceGross,\n      costs:{entry_fee_eur:entryFee,exit_fee_eur:exitFee,fees_eur:entryFee===null||exitFee===null?"UNKNOWN":fees,impact_eur:impact,spread_eur:spread===null?"UNKNOWN":spread,slippage_eur:slippage===null?"UNKNOWN":slippage},\n      known_costs_eur:knownCosts,total_costs_eur:totalCosts,cost_completeness:complete?"COMPLETE":"PARTIAL_MODEL",unknown_cost_components:unknown,\n      authoritative_net_pnl_eur:net,net_pnl_eur:net,modeled_net_known_costs_eur:modeledNetKnown,accounting_identity_error_eur:identityError,\n      accounting_identity_ok:Math.abs(identityError)<=1e-8,profitability_claim:false,source_owner:"strategyAReconcile404264"\n    };\n    ROWS.push(out);render();return {ok:true,row:clone(out)};\n  }'''
new_func='''  function fromReconciliation(row={}){\n    const id=identity(row); if(!id)return {ok:false,reason:"RECONCILIATION_ID_MISSING"};\n    if(ROWS.some(r=>r.identity===id))return {ok:false,reason:"DUPLICATE_RECONCILIATION",identity:id};\n    const qty=val(row.quantity_btc),entryRef=val(row.entry_reference_eur),exitRef=val(row.exit_reference_eur),net=val(row.net_pnl_eur);\n    if(!(qty>0)||!(entryRef>0)||!(exitRef>0)||net===null)return {ok:false,reason:"INCOMPLETE_RECONCILIATION_FACTS",identity:id};\n\n    const entryFee=nonneg(row.entry_fee_eur),exitFee=nonneg(row.exit_fee_eur),impact=nonneg(row.estimated_total_impact_eur);\n    const spread=nonneg(row.spread_eur),slippage=nonneg(row.slippage_eur);\n    const unknown=[];\n    if(entryFee===null||exitFee===null)unknown.push("fees_eur");\n    if(impact===null)unknown.push("impact_eur");\n    if(spread===null)unknown.push("spread_eur");\n    if(slippage===null)unknown.push("slippage_eur");\n\n    const fees=entryFee===null||exitFee===null?null:entryFee+exitFee;\n    const knownComponents=[entryFee,exitFee,impact,spread,slippage].filter(v=>v!==null);\n    const knownCosts=knownComponents.reduce((sum,v)=>sum+v,0);\n    const referenceGross=(exitRef-entryRef)*qty;\n    const modeledNetKnown=referenceGross-knownCosts;\n    const complete=unknown.length===0;\n    const totalCosts=complete?knownCosts:"UNKNOWN";\n    const expectedNet=complete?referenceGross-knownCosts:null;\n    const identityError=complete?net-expectedNet:null;\n    const accountingOk=complete?Math.abs(identityError)<=ACCOUNTING_TOLERANCE_EUR:null;\n    const accountingStatus=complete?(accountingOk?"VERIFIED":"MISMATCH"):"INDETERMINATE_COSTS";\n\n    // A complete cost model with a contradictory accounting identity must never\n    // enter the canonical evidence ledger. Partial models are retained, but\n    // they are explicitly non-verifiable until their missing costs are known.\n    if(complete && !accountingOk){\n      return {\n        ok:false,reason:"ACCOUNTING_IDENTITY_MISMATCH",identity:id,\n        observed_net_pnl_eur:net,expected_net_pnl_eur:expectedNet,\n        accounting_identity_error_eur:identityError,\n        accounting_tolerance_eur:ACCOUNTING_TOLERANCE_EUR\n      };\n    }\n\n    const out={\n      schema:SCHEMA,build:BUILD,identity:id,reconciliation_id:row.reconciliation_id||null,execution_id:row.execution_id||null,trade_id:row.execution_id||id,\n      at:String(row.closed_at||new Date().toISOString()),symbol:String(row.symbol||"BTC").toUpperCase(),paper_only:true,real_order:false,\n      quantity_btc:qty,entry_reference_eur:entryRef,exit_reference_eur:exitRef,reference_gross_pnl_eur:referenceGross,\n      costs:{entry_fee_eur:entryFee,exit_fee_eur:exitFee,fees_eur:fees===null?"UNKNOWN":fees,impact_eur:impact===null?"UNKNOWN":impact,spread_eur:spread===null?"UNKNOWN":spread,slippage_eur:slippage===null?"UNKNOWN":slippage},\n      known_costs_eur:knownCosts,total_costs_eur:totalCosts,cost_completeness:complete?"COMPLETE":"PARTIAL_MODEL",unknown_cost_components:unknown,\n      authoritative_net_pnl_eur:net,net_pnl_eur:net,modeled_net_known_costs_eur:modeledNetKnown,\n      expected_net_pnl_eur:expectedNet,accounting_identity_error_eur:identityError,accounting_identity_ok:accountingOk,\n      accounting_identity_status:accountingStatus,accounting_tolerance_eur:ACCOUNTING_TOLERANCE_EUR,\n      ledger_consistency_status:complete?"VERIFIED":"PARTIAL_COST_MODEL",\n      profitability_claim:false,source_owner:"strategyAReconcile404264"\n    };\n    ROWS.push(out);render();return {ok:true,row:clone(out)};\n  }'''
after=once(after,old_func,new_func,'fromReconciliation ledger contract')

old_summary='''  function summary(rows=ROWS){\n    const list=(Array.isArray(rows)?rows:[]).filter(Boolean),n=list.length,complete=list.filter(r=>r.cost_completeness==="COMPLETE").length;\n    const wins=list.filter(r=>val(r.net_pnl_eur)>0).length,losses=list.filter(r=>val(r.net_pnl_eur)<0).length;\n    const refGross=list.reduce((a,r)=>a+(val(r.reference_gross_pnl_eur)||0),0),known=list.reduce((a,r)=>a+(val(r.known_costs_eur)||0),0),net=list.reduce((a,r)=>a+(val(r.net_pnl_eur)||0),0);\n    let equity=0,peak=0,maxDd=0;for(const r of list){equity+=val(r.net_pnl_eur)||0;peak=Math.max(peak,equity);maxDd=Math.max(maxDd,peak-equity);}\n    const allComplete=n>0&&complete===n;\n    return {schema:"agent_crypto_strategy_a_after_cost_summary_v2",build:BUILD,trades:n,complete_cost_trades:complete,winners:wins,losers:losses,win_rate_pct:n?wins/n*100:0,reference_gross_pnl_eur:refGross,known_costs_eur:known,total_costs_eur:allComplete?list.reduce((a,r)=>a+Number(r.total_costs_eur||0),0):"UNKNOWN",net_pnl_eur:net,expectancy_eur_per_trade:n?net/n:0,max_drawdown_eur:maxDd,sample_state:n<SAMPLE_MIN?"INSUFFICIENT_SAMPLE":allComplete?"SAMPLE_READY":"COST_MODEL_INCOMPLETE",sample_min:SAMPLE_MIN,cost_model_complete:allComplete,profitability_claim:false,paper_only:true};\n  }'''
new_summary='''  function summary(rows=ROWS){\n    const list=(Array.isArray(rows)?rows:[]).filter(Boolean),n=list.length,complete=list.filter(r=>r.cost_completeness==="COMPLETE").length;\n    const verified=list.filter(r=>r.accounting_identity_status==="VERIFIED").length;\n    const indeterminate=list.filter(r=>r.accounting_identity_status==="INDETERMINATE_COSTS").length;\n    const wins=list.filter(r=>val(r.net_pnl_eur)>0).length,losses=list.filter(r=>val(r.net_pnl_eur)<0).length;\n    const refGross=list.reduce((a,r)=>a+(val(r.reference_gross_pnl_eur)||0),0),known=list.reduce((a,r)=>a+(val(r.known_costs_eur)||0),0),net=list.reduce((a,r)=>a+(val(r.net_pnl_eur)||0),0);\n    let equity=0,peak=0,maxDd=0;for(const r of list){equity+=val(r.net_pnl_eur)||0;peak=Math.max(peak,equity);maxDd=Math.max(maxDd,peak-equity);}\n    const allComplete=n>0&&complete===n;\n    const allVerified=n>0&&verified===n;\n    return {schema:"agent_crypto_strategy_a_after_cost_summary_v2",build:BUILD,trades:n,complete_cost_trades:complete,verified_accounting_trades:verified,indeterminate_accounting_trades:indeterminate,winners:wins,losers:losses,win_rate_pct:n?wins/n*100:0,reference_gross_pnl_eur:refGross,known_costs_eur:known,total_costs_eur:allComplete?list.reduce((a,r)=>a+Number(r.total_costs_eur),0):"UNKNOWN",net_pnl_eur:net,expectancy_eur_per_trade:n?net/n:0,max_drawdown_eur:maxDd,sample_state:n<SAMPLE_MIN?"INSUFFICIENT_SAMPLE":allComplete&&allVerified?"SAMPLE_READY":"COST_MODEL_INCOMPLETE",sample_min:SAMPLE_MIN,cost_model_complete:allComplete,ledger_consistency_complete:allVerified,profitability_claim:false,paper_only:true};\n  }'''
after=once(after,old_summary,new_summary,'summary ledger consistency')

old_test='''  function selfTest(){\n    const saved=ROWS.splice(0);try{\n      const base={reconciliation_id:"T298",execution_id:"E298",closed_at:"2026-01-01T00:00:00Z",quantity_btc:1,entry_reference_eur:100,exit_reference_eur:110,entry_fee_eur:1,exit_fee_eur:1,estimated_total_impact_eur:2,net_pnl_eur:6};\n      const a=fromReconciliation(base),dup=fromReconciliation(base),s=summary();\n      const pass=a.ok===true&&dup.reason==="DUPLICATE_RECONCILIATION"&&a.row.cost_completeness==="PARTIAL_MODEL"&&a.row.total_costs_eur==="UNKNOWN"&&a.row.accounting_identity_ok===true&&s.sample_state==="INSUFFICIENT_SAMPLE"&&s.profitability_claim===false;\n      return {schema:"agent_crypto_strategy_a_after_cost_self_test_v2",build:BUILD,pass,checks:{actual_reconciliation_consumed:a.ok===true,duplicate_refused:dup.reason==="DUPLICATE_RECONCILIATION",unknown_not_zero:a.row.total_costs_eur==="UNKNOWN",accounting_identity:a.row.accounting_identity_ok===true,no_profitability_claim:s.profitability_claim===false}};\n    }finally{ROWS.splice(0);ROWS.push(...saved);render();}\n  }'''
new_test='''  function selfTest(){\n    const saved=ROWS.splice(0);try{\n      const partial={reconciliation_id:"T316-P",execution_id:"E316-P",closed_at:"2026-01-01T00:00:00Z",quantity_btc:1,entry_reference_eur:100,exit_reference_eur:110,entry_fee_eur:1,exit_fee_eur:1,estimated_total_impact_eur:2,net_pnl_eur:6};\n      const p=fromReconciliation(partial),dup=fromReconciliation(partial);\n      const complete={reconciliation_id:"T316-C",execution_id:"E316-C",closed_at:"2026-01-01T00:01:00Z",quantity_btc:1,entry_reference_eur:100,exit_reference_eur:110,entry_fee_eur:1,exit_fee_eur:1,estimated_total_impact_eur:1,spread_eur:2,slippage_eur:1,net_pnl_eur:5};\n      const c=fromReconciliation(complete);\n      const mismatch=fromReconciliation({...complete,reconciliation_id:"T316-M",execution_id:"E316-M",net_pnl_eur:6});\n      const s=summary();\n      const pass=p.ok===true&&dup.reason==="DUPLICATE_RECONCILIATION"&&p.row.cost_completeness==="PARTIAL_MODEL"&&p.row.total_costs_eur==="UNKNOWN"&&p.row.accounting_identity_ok===null&&p.row.accounting_identity_status==="INDETERMINATE_COSTS"&&c.ok===true&&c.row.accounting_identity_ok===true&&c.row.accounting_identity_status==="VERIFIED"&&c.row.total_costs_eur===5&&mismatch.reason==="ACCOUNTING_IDENTITY_MISMATCH"&&s.trades===2&&s.verified_accounting_trades===1&&s.indeterminate_accounting_trades===1&&s.sample_state==="INSUFFICIENT_SAMPLE"&&s.profitability_claim===false;\n      return {schema:"agent_crypto_strategy_a_after_cost_self_test_v3",build:BUILD,pass,checks:{partial_identity_indeterminate:p.row.accounting_identity_ok===null,duplicate_refused:dup.reason==="DUPLICATE_RECONCILIATION",complete_identity_verified:c.row.accounting_identity_ok===true,spread_slippage_in_complete_identity:c.row.total_costs_eur===5,contradictory_complete_identity_refused:mismatch.reason==="ACCOUNTING_IDENTITY_MISMATCH",mismatch_not_recorded:s.trades===2,no_profitability_claim:s.profitability_claim===false}};\n    }finally{ROWS.splice(0);ROWS.push(...saved);render();}\n  }'''
after=once(after,old_test,new_test,'ledger self-test')

after=once(after,
'''<div class="sam-sub">Réconciliation Paper réelle du moteur local · UNKNOWN ≠ 0 · aucune conclusion de rentabilité.</div>''',
'''<div class="sam-sub">Réconciliation Paper · identité comptable vérifiée seulement avec coûts complets · modèle partiel = indéterminé.</div>''','after-cost UI subtitle')
after=once(after,
'''<div class="sam-foot">Frais/impact connus · spread/slippage restent UNKNOWN tant qu’ils ne sont pas réellement mesurés/modélisés séparément.</div>''',
'''<div class="sam-foot">Ledger : doublon refusé · identité complète contradictoire refusée · UNKNOWN reste non vérifiable tant que le coût manque.</div>''','after-cost UI foot')

after=once(after,
'''unknown_cost_is_zero:false,actual_paper_connected:true});''',
'''unknown_cost_is_zero:false,actual_paper_connected:true,ledger_consistency_406016:true,complete_identity_mismatch_rejected:true,partial_cost_identity_indeterminate:true,accounting_tolerance_eur:ACCOUNTING_TOLERANCE_EUR});''','after-cost API flags')
after_path.write_text(after,encoding='utf-8')

# ------------------------------------------------------------------
# 2) PUBLICATION TRUTH + AFTER-COST CACHE TOKEN ONLY
# ------------------------------------------------------------------
index=index_path.read_text(encoding='utf-8')
protected=[
 'oracle-presentation-405010.css?v=administrator-build-40.6.13',
 'oracle-fx-406013.css?v=administrator-build-40.6.13',
 'oracle-fx-406013.js?v=administrator-build-40.6.13',
 './js/strategy-a-paper-lifecycle-404295.js?v=administrator-build-40.6.15',
 'grid-template-columns:minmax(128px,.66fr) minmax(124px,.66fr) minmax(170px,.94fr) minmax(255px,1.35fr) minmax(410px,2.05fr)!important;'
]
for t in protected:
    if t not in index: raise SystemExit(f'STOP {BUILD}: protected index contract missing: {t}')

for old,new,label in [
 ('<meta name="atlas-build" content="40.6.15" />','<meta name="atlas-build" content="40.6.16" />','atlas meta'),
 ('<meta name="administrator-build" content="40.6.15" />','<meta name="administrator-build" content="40.6.16" />','admin meta'),
 ('<meta name="administrator-release" content="PAPER SINGLE-USE AUTHORIZATION · CORE FREEZE" />',f'<meta name="administrator-release" content="{RELEASE}" />','release meta'),
 ('<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.15" />',f'<meta name="atlas-asset-token" content="{TOKEN}" />','asset token'),
 ('<title>Agent-Crypto @erith.IA — Build 40.6.15 · Administrator</title>','<title>Agent-Crypto @erith.IA — Build 40.6.16 · Administrator</title>','title'),
 ('./js/strategy-a-after-cost-metrics-404298.js?v=administrator-build-40.5.23','./js/strategy-a-after-cost-metrics-404298.js?v=administrator-build-40.6.16','after-cost cache bust')
]: index=once(index,old,new,label)

index,n1=re.subn(r'(id="atlasVersionTruthControl"[\s\S]{0,700}?aria-label="Version Agent-Crypto installée : Build )[^,\"]+(, mode Administrator\")',r'\g<1>40.6.16\g<2>',index,count=1)
index,n2=re.subn(r'(<span id="atlasVersionTruthText">Build )[^<]+(</span>)',r'\g<1>40.6.16\g<2>',index,count=1)
if n1!=1 or n2!=1: raise SystemExit(f'STOP {BUILD}: version badge mismatch')
index_path.write_text(index,encoding='utf-8')

# ------------------------------------------------------------------
# 3) RELEASE + MANIFESTS + CLEAN ARCHIVE
# ------------------------------------------------------------------
release_path=ROOT/'RELEASE_40_6_16.md'
release_path.write_text(f'''# Agent-Crypto @erith.IA — Build {BUILD}\n\n## {RELEASE}\n\nParent: **{PARENT}**  \nMarket Core: **{ENGINE} protected**\n\n### Correction\nLe propriétaire `js/strategy-a-after-cost-metrics-404298.js` ferme une ambiguïté du ledger After-Cost.\n\n- une ligne complète inclut frais, impact, spread et slippage dans son identité comptable ;\n- si tous les coûts sont connus et que `net observé != brut référence - coûts`, la ligne est refusée avec `ACCOUNTING_IDENTITY_MISMATCH` ;\n- si un coût est inconnu, la ligne reste admissible comme preuve partielle mais `accounting_identity_ok = null` et `accounting_identity_status = INDETERMINATE_COSTS` ;\n- aucune preuve partielle n'est présentée comme identité comptable vérifiée ;\n- déduplication par `reconciliation_id` / `execution_id` préservée ;\n- aucune conclusion de rentabilité ;\n- cache-bust appliqué uniquement au propriétaire After-Cost.\n\n### Gel dur\nPaper Lifecycle {PARENT}, Safety, Auto/Lifecycle Bridge, Evidence, Oracle 40.6.13 + FX, Chronos 40.6.9, Version Truth 40.6.8, largeur 40.6.10, Graphique, Lecture Technique, Window Manager, `js/app.js` et Market Core {ENGINE} restent intouchés.\n''',encoding='utf-8')

docs={n:load(n) for n in ('build.json','administrator-version.json','version.json')}
for n,d in docs.items():
    d['build']=BUILD; d['release']=RELEASE; d['status']=STATUS; d['parent_build']=PARENT; d['asset_token']=TOKEN
    if 'administrator_build' in d:d['administrator_build']=BUILD
    if 'build_label' in d:d['build_label']=f'Build {BUILD}'
    if 'release_status' in d:d['release_status']=RELEASE
    for k in ('timestamp','prepared_at','published_at'):
        if k in d:d[k]=NOW
    if isinstance(d.get('current_version_truth'),dict): d['current_version_truth']['loaded_build']=BUILD
    d['cascade_40_6_16']={
      'parent_build':PARENT,'release':RELEASE,
      'owner':'js/strategy-a-after-cost-metrics-404298.js',
      'one_row_per_reconciliation_identity':True,'duplicate_identity_rejected':True,
      'complete_identity_requires_all_costs':True,'complete_identity_includes':['fees','impact','spread','slippage'],
      'complete_identity_mismatch_rejected':True,'partial_cost_identity':'INDETERMINATE_COSTS',
      'partial_cost_row_retained_as_evidence':True,'profitability_claim':False,
      'after_cost_cache_bust':BUILD,'paper_lifecycle_modified':False,'safety_modified':False,
      'auto_lifecycle_bridge_modified':False,'evidence_modified':False,'market_core_modified':False,
      'oracle_modified':False,'chronos_modified':False,'version_truth_code_modified':False,
      'graph_modified':False,'technical_reading_modified':False,'window_manager_modified':False,
      'app_js_modified':False,'network_added':False,'storage_owner_added':False,'real_order':False
    }
for n in ('build.json','administrator-version.json'):
    (ROOT/n).write_text(json.dumps(docs[n],ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

ver=docs['version.json']; files=ver.setdefault('files',{})
for rel in ('index.html','js/strategy-a-after-cost-metrics-404298.js','js/strategy-a-paper-lifecycle-404295.js','js/strategy-a-auto-lifecycle-bridge-404297.js','build.json','administrator-version.json','RELEASE_40_6_16.md'):
    files[rel]=sha(ROOT/rel)
(ROOT/'version.json').write_text(json.dumps(ver,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

# ------------------------------------------------------------------
# 4) ANTI-DESTRUCTION PROOFS
# ------------------------------------------------------------------
for p,before in freeze.items():
    if p.read_bytes()!=before: raise SystemExit(f'STOP {BUILD}: protected owner changed: {p}')
final=index_path.read_text(encoding='utf-8')
for t in protected:
    if t not in final: raise SystemExit(f'STOP {BUILD}: protected index contract changed: {t}')
if './js/strategy-a-after-cost-metrics-404298.js?v=administrator-build-40.6.16' not in final:
    raise SystemExit(f'STOP {BUILD}: After-Cost cache bust missing')
if str(load('build.json').get('engine'))!=ENGINE: raise SystemExit(f'STOP {BUILD}: Market Core drift')
if 'ledger_consistency_406016:true' not in after_path.read_text(encoding='utf-8'):
    raise SystemExit(f'STOP {BUILD}: ledger flag missing')

OUTDIR.mkdir(parents=True,exist_ok=True)
out=OUTDIR/'AGENT_CRYPTO_BUILD_40_6_16_AFTER_COST_LEDGER_CONSISTENCY_CLEAN_UPLOAD_8_FILES.zip'
rels=['index.html','js/strategy-a-after-cost-metrics-404298.js','js/strategy-a-paper-lifecycle-404295.js','js/strategy-a-auto-lifecycle-bridge-404297.js','build.json','administrator-version.json','version.json','RELEASE_40_6_16.md']
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for rel in rels:z.write(ROOT/rel,(Path('public/agent_crypto_erith_ia/administrator')/rel).as_posix())
digest=sha(out)
Path(str(out)+'.sha256').write_text(f'{digest}  {out.name}\n',encoding='utf-8')
print(json.dumps({'ok':True,'build':BUILD,'zip':str(out),'sha256':digest,'ledger_consistency':True,'protected_owners_modified':False},ensure_ascii=False))
