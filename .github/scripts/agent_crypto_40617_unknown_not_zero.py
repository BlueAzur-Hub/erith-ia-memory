#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, re, zipfile

ROOT = Path('public/agent_crypto_erith_ia/administrator')
OUTDIR = Path('coordination/inter_ai_dialogues/agent_crypto')
BUILD = '40.6.17'
PARENT = '40.6.16'
ENGINE = '38.15.11'
RELEASE = 'UNKNOWN ≠ 0 · STRICT AFTER-COST TRUTH GATE'
STATUS = 'unknown_not_zero_strict_after_cost_truth_406017'
TOKEN = f'market-core-v2.0-alpha-build-{BUILD}'
NOW = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')


def load(name):
    data = json.loads((ROOT / name).read_text(encoding='utf-8'))
    if not isinstance(data, dict):
        raise SystemExit(f'STOP {BUILD}: invalid {name}')
    return data


def dump(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'STOP {BUILD}: {label} count={count}')
    return text.replace(old, new, 1)


version_before = load('version.json')
build_before = load('build.json')
if str(version_before.get('build')) != PARENT:
    raise SystemExit(f'STOP {BUILD}: expected parent {PARENT}, got {version_before.get("build")}')
if str(build_before.get('engine')) != ENGINE:
    raise SystemExit(f'STOP {BUILD}: Market Core drift')

index_path = ROOT / 'index.html'
after_path = ROOT / 'js/strategy-a-after-cost-metrics-404298.js'

# Hard freeze: only After-Cost + publication truth may move in 40.6.17.
frozen_paths = [
    ROOT / 'admin-chronos.css',
    ROOT / 'js/version-truth.js',
    ROOT / 'js/app.js',
    ROOT / 'js/core/admin-window-manager.js',
    ROOT / 'style.css',
    ROOT / 'parallel-markets.css',
    ROOT / 'market-reading-depth.css',
    ROOT / 'admin-visual-assets.css',
    ROOT / 'admin-visual-cache.css',
    ROOT / 'oracle-presentation-405010.css',
    ROOT / 'oracle-fx-406013.css',
    ROOT / 'js/oracle-fx-406013.js',
    ROOT / 'js/strategy-a-paper-lifecycle-404295.js',
    ROOT / 'js/strategy-a-auto-lifecycle-bridge-404297.js',
    ROOT / 'js/strategy-a-safety-certification-404299.js',
    ROOT / 'js/strategy-a-evidence-dossier-404295.js',
]
freeze = {p: p.read_bytes() for p in frozen_paths}

# ---------------------------------------------------------------------------
# 1) AFTER-COST — UNKNOWN MUST NEVER ENTER THROUGH JS NUMERIC COERCION AS ZERO
# ---------------------------------------------------------------------------
after = after_path.read_text(encoding='utf-8')
if 'strict_unknown_semantics_406017:true' in after:
    raise SystemExit(f'STOP {BUILD}: strict unknown gate already present')

after = once(
    after,
    '''  Build: 40.6.16\n  Responsibility: preserve one canonical after-cost row per Paper reconciliation.\n  Complete accounting identity is verified only when every required cost is known.\n  Incomplete cost models remain evidence but their identity is INDETERMINATE.\n  UNKNOWN cost components are never promoted to a verified zero. No profitability claim.''',
    '''  Build: 40.6.17\n  Responsibility: preserve one canonical after-cost row per Paper reconciliation.\n  Complete accounting identity is verified only when every required cost is known.\n  Null, blank, boolean, missing and invalid external numeric facts stay UNKNOWN.\n  Negative cost facts are invalid evidence, never silently clamped to zero.\n  Incomplete cost models remain evidence but their identity is INDETERMINATE.\n  UNKNOWN cost components are never promoted to a verified zero. No profitability claim.''',
    'after-cost header',
)
after = once(after, '  const BUILD="40.6.16";', '  const BUILD="40.6.17";', 'after-cost build')

after = once(
    after,
    '''  const finite=v=>Number.isFinite(Number(v));\n  const val=v=>finite(v)?Number(v):null;\n  const nonneg=v=>finite(v)?Math.max(0,Number(v)):null;''',
    '''  const finite=v=>{\n    if(v===null||v===undefined||typeof v==="boolean")return false;\n    if(typeof v==="string"&&!v.trim())return false;\n    return Number.isFinite(Number(v));\n  };\n  const val=v=>finite(v)?Number(v):null;\n  const nonneg=v=>{const n=val(v);return n!==null&&n>=0?n:null;};''',
    'strict numeric parser',
)

after = once(
    after,
    '''    const knownComponents=[entryFee,exitFee,impact,spread,slippage].filter(v=>v!==null);\n    const knownCosts=knownComponents.reduce((sum,v)=>sum+v,0);\n    const referenceGross=(exitRef-entryRef)*qty;''',
    '''    const knownComponents=[entryFee,exitFee,impact,spread,slippage].filter(v=>v!==null);\n    const knownCostCount=knownComponents.length;\n    const knownCosts=knownComponents.reduce((sum,v)=>sum+v,0);\n    const knownCostsValue=knownCostCount>0?knownCosts:"UNKNOWN";\n    const referenceGross=(exitRef-entryRef)*qty;''',
    'known-cost evidence count',
)

after = once(
    after,
    '      known_costs_eur:knownCosts,total_costs_eur:totalCosts,cost_completeness:complete?"COMPLETE":"PARTIAL_MODEL",unknown_cost_components:unknown,',
    '      known_costs_eur:knownCostsValue,known_cost_components:knownCostCount,total_costs_eur:totalCosts,cost_completeness:complete?"COMPLETE":"PARTIAL_MODEL",unknown_cost_components:unknown,',
    'row known-cost truth',
)

old_summary = '''  function summary(rows=ROWS){\n    const list=(Array.isArray(rows)?rows:[]).filter(Boolean),n=list.length,complete=list.filter(r=>r.cost_completeness==="COMPLETE").length;\n    const verified=list.filter(r=>r.accounting_identity_status==="VERIFIED").length;\n    const indeterminate=list.filter(r=>r.accounting_identity_status==="INDETERMINATE_COSTS").length;\n    const wins=list.filter(r=>val(r.net_pnl_eur)>0).length,losses=list.filter(r=>val(r.net_pnl_eur)<0).length;\n    const refGross=list.reduce((a,r)=>a+(val(r.reference_gross_pnl_eur)||0),0),known=list.reduce((a,r)=>a+(val(r.known_costs_eur)||0),0),net=list.reduce((a,r)=>a+(val(r.net_pnl_eur)||0),0);\n    let equity=0,peak=0,maxDd=0;for(const r of list){equity+=val(r.net_pnl_eur)||0;peak=Math.max(peak,equity);maxDd=Math.max(maxDd,peak-equity);}\n    const allComplete=n>0&&complete===n;\n    const allVerified=n>0&&verified===n;\n    return {schema:"agent_crypto_strategy_a_after_cost_summary_v2",build:BUILD,trades:n,complete_cost_trades:complete,verified_accounting_trades:verified,indeterminate_accounting_trades:indeterminate,winners:wins,losers:losses,win_rate_pct:n?wins/n*100:0,reference_gross_pnl_eur:refGross,known_costs_eur:known,total_costs_eur:allComplete?list.reduce((a,r)=>a+Number(r.total_costs_eur),0):"UNKNOWN",net_pnl_eur:net,expectancy_eur_per_trade:n?net/n:0,max_drawdown_eur:maxDd,sample_state:n<SAMPLE_MIN?"INSUFFICIENT_SAMPLE":allComplete&&allVerified?"SAMPLE_READY":"COST_MODEL_INCOMPLETE",sample_min:SAMPLE_MIN,cost_model_complete:allComplete,ledger_consistency_complete:allVerified,profitability_claim:false,paper_only:true};\n  }'''
new_summary = '''  function summary(rows=ROWS){\n    const list=(Array.isArray(rows)?rows:[]).filter(Boolean),n=list.length,complete=list.filter(r=>r.cost_completeness==="COMPLETE").length;\n    const verified=list.filter(r=>r.accounting_identity_status==="VERIFIED").length;\n    const indeterminate=list.filter(r=>r.accounting_identity_status==="INDETERMINATE_COSTS").length;\n    const wins=list.filter(r=>val(r.net_pnl_eur)>0).length,losses=list.filter(r=>val(r.net_pnl_eur)<0).length;\n    const refGross=list.reduce((a,r)=>a+(val(r.reference_gross_pnl_eur)??0),0),net=list.reduce((a,r)=>a+(val(r.net_pnl_eur)??0),0);\n    const knownValues=list.map(r=>val(r.known_costs_eur)).filter(v=>v!==null);\n    const known=knownValues.length?knownValues.reduce((a,v)=>a+v,0):"UNKNOWN";\n    let equity=0,peak=0,maxDd=0;for(const r of list){equity+=val(r.net_pnl_eur)??0;peak=Math.max(peak,equity);maxDd=Math.max(maxDd,peak-equity);}\n    const allComplete=n>0&&complete===n;\n    const allVerified=n>0&&verified===n;\n    return {schema:"agent_crypto_strategy_a_after_cost_summary_v2",build:BUILD,trades:n,complete_cost_trades:complete,verified_accounting_trades:verified,indeterminate_accounting_trades:indeterminate,winners:wins,losers:losses,win_rate_pct:n?wins/n*100:0,reference_gross_pnl_eur:refGross,known_cost_rows:knownValues.length,known_costs_eur:known,total_costs_eur:allComplete?list.reduce((a,r)=>a+Number(r.total_costs_eur),0):"UNKNOWN",net_pnl_eur:net,expectancy_eur_per_trade:n?net/n:0,max_drawdown_eur:maxDd,sample_state:n<SAMPLE_MIN?"INSUFFICIENT_SAMPLE":allComplete&&allVerified?"SAMPLE_READY":"COST_MODEL_INCOMPLETE",sample_min:SAMPLE_MIN,cost_model_complete:allComplete,ledger_consistency_complete:allVerified,profitability_claim:false,paper_only:true};\n  }'''
after = once(after, old_summary, new_summary, 'summary unknown semantics')

old_test = '''  function selfTest(){\n    const saved=ROWS.splice(0);try{\n      const partial={reconciliation_id:"T316-P",execution_id:"E316-P",closed_at:"2026-01-01T00:00:00Z",quantity_btc:1,entry_reference_eur:100,exit_reference_eur:110,entry_fee_eur:1,exit_fee_eur:1,estimated_total_impact_eur:2,net_pnl_eur:6};\n      const p=fromReconciliation(partial),dup=fromReconciliation(partial);\n      const complete={reconciliation_id:"T316-C",execution_id:"E316-C",closed_at:"2026-01-01T00:01:00Z",quantity_btc:1,entry_reference_eur:100,exit_reference_eur:110,entry_fee_eur:1,exit_fee_eur:1,estimated_total_impact_eur:1,spread_eur:2,slippage_eur:1,net_pnl_eur:4};\n      const c=fromReconciliation(complete);\n      const mismatch=fromReconciliation({...complete,reconciliation_id:"T316-M",execution_id:"E316-M",net_pnl_eur:5});\n      const s=summary();\n      const pass=p.ok===true&&dup.reason==="DUPLICATE_RECONCILIATION"&&p.row.cost_completeness==="PARTIAL_MODEL"&&p.row.total_costs_eur==="UNKNOWN"&&p.row.accounting_identity_ok===null&&p.row.accounting_identity_status==="INDETERMINATE_COSTS"&&c.ok===true&&c.row.accounting_identity_ok===true&&c.row.accounting_identity_status==="VERIFIED"&&c.row.total_costs_eur===6&&mismatch.reason==="ACCOUNTING_IDENTITY_MISMATCH"&&s.trades===2&&s.verified_accounting_trades===1&&s.indeterminate_accounting_trades===1&&s.sample_state==="INSUFFICIENT_SAMPLE"&&s.profitability_claim===false;\n      return {schema:"agent_crypto_strategy_a_after_cost_self_test_v3",build:BUILD,pass,checks:{partial_identity_indeterminate:p.row.accounting_identity_ok===null,duplicate_refused:dup.reason==="DUPLICATE_RECONCILIATION",complete_identity_verified:c.row.accounting_identity_ok===true,spread_slippage_in_complete_identity:c.row.total_costs_eur===6,contradictory_complete_identity_refused:mismatch.reason==="ACCOUNTING_IDENTITY_MISMATCH",mismatch_not_recorded:s.trades===2,no_profitability_claim:s.profitability_claim===false}};\n    }finally{ROWS.splice(0);ROWS.push(...saved);render();}\n  }'''
new_test = '''  function selfTest(){\n    const saved=ROWS.splice(0);try{\n      const partial={reconciliation_id:"T317-P",execution_id:"E317-P",closed_at:"2026-01-01T00:00:00Z",quantity_btc:1,entry_reference_eur:100,exit_reference_eur:110,entry_fee_eur:1,exit_fee_eur:1,estimated_total_impact_eur:2,net_pnl_eur:6};\n      const p=fromReconciliation(partial),dup=fromReconciliation(partial);\n      const complete={reconciliation_id:"T317-C",execution_id:"E317-C",closed_at:"2026-01-01T00:01:00Z",quantity_btc:1,entry_reference_eur:100,exit_reference_eur:110,entry_fee_eur:1,exit_fee_eur:1,estimated_total_impact_eur:1,spread_eur:2,slippage_eur:1,net_pnl_eur:4};\n      const c=fromReconciliation(complete);\n      const mismatch=fromReconciliation({...complete,reconciliation_id:"T317-M",execution_id:"E317-M",net_pnl_eur:5});\n      const unknown=fromReconciliation({reconciliation_id:"T317-U",execution_id:"E317-U",closed_at:"2026-01-01T00:02:00Z",quantity_btc:1,entry_reference_eur:100,exit_reference_eur:110,entry_fee_eur:null,exit_fee_eur:"",estimated_total_impact_eur:false,spread_eur:null,slippage_eur:"   ",net_pnl_eur:10});\n      const s=summary();\n      const unknownTruth=unknown.ok===true&&unknown.row.known_costs_eur==="UNKNOWN"&&unknown.row.known_cost_components===0&&unknown.row.total_costs_eur==="UNKNOWN"&&unknown.row.accounting_identity_ok===null&&unknown.row.accounting_identity_status==="INDETERMINATE_COSTS"&&unknown.row.unknown_cost_components.includes("fees_eur")&&unknown.row.unknown_cost_components.includes("impact_eur")&&unknown.row.unknown_cost_components.includes("spread_eur")&&unknown.row.unknown_cost_components.includes("slippage_eur");\n      const pass=p.ok===true&&dup.reason==="DUPLICATE_RECONCILIATION"&&p.row.cost_completeness==="PARTIAL_MODEL"&&p.row.total_costs_eur==="UNKNOWN"&&p.row.accounting_identity_ok===null&&c.ok===true&&c.row.accounting_identity_ok===true&&c.row.total_costs_eur===6&&mismatch.reason==="ACCOUNTING_IDENTITY_MISMATCH"&&unknownTruth&&s.trades===3&&s.verified_accounting_trades===1&&s.indeterminate_accounting_trades===2&&s.known_cost_rows===2&&s.total_costs_eur==="UNKNOWN"&&s.profitability_claim===false;\n      return {schema:"agent_crypto_strategy_a_after_cost_self_test_v4",build:BUILD,pass,checks:{unknown_null_blank_boolean_not_zero:unknownTruth,partial_identity_indeterminate:p.row.accounting_identity_ok===null,duplicate_refused:dup.reason==="DUPLICATE_RECONCILIATION",complete_identity_verified:c.row.accounting_identity_ok===true,spread_slippage_in_complete_identity:c.row.total_costs_eur===6,contradictory_complete_identity_refused:mismatch.reason==="ACCOUNTING_IDENTITY_MISMATCH",mismatch_not_recorded:s.trades===3,no_profitability_claim:s.profitability_claim===false}};\n    }finally{ROWS.splice(0);ROWS.push(...saved);render();}\n  }'''
after = once(after, old_test, new_test, 'strict unknown self-test')

after = once(
    after,
    'set("gross",`${s.reference_gross_pnl_eur.toFixed(2)} €`);set("costs",`${s.known_costs_eur.toFixed(2)} €`);set("net",`${s.net_pnl_eur.toFixed(2)} €`);set("sample",s.sample_state);return true;}',
    'const eur=v=>typeof v==="number"&&Number.isFinite(v)?`${v.toFixed(2)} €`:"UNKNOWN";set("gross",eur(s.reference_gross_pnl_eur));set("costs",eur(s.known_costs_eur));set("net",eur(s.net_pnl_eur));set("sample",s.sample_state);return true;}',
    'unknown-safe renderer',
)

after = once(
    after,
    'ledger_consistency_406016:true,complete_identity_mismatch_rejected:true,partial_cost_identity_indeterminate:true,accounting_tolerance_eur:ACCOUNTING_TOLERANCE_EUR',
    'ledger_consistency_406016:true,strict_unknown_semantics_406017:true,null_blank_boolean_unknown:true,negative_cost_not_zero:true,known_costs_unknown_when_none_known:true,complete_identity_mismatch_rejected:true,partial_cost_identity_indeterminate:true,accounting_tolerance_eur:ACCOUNTING_TOLERANCE_EUR',
    '40.6.17 API marker',
)
after_path.write_text(after, encoding='utf-8')

# ---------------------------------------------------------------------------
# 2) PUBLICATION IDENTITY — cache-bust only the owner changed in 40.6.17
# ---------------------------------------------------------------------------
index = index_path.read_text(encoding='utf-8')
for old, new, label in [
    ('<meta name="atlas-build" content="40.6.16" />', '<meta name="atlas-build" content="40.6.17" />', 'atlas meta'),
    ('<meta name="administrator-build" content="40.6.16" />', '<meta name="administrator-build" content="40.6.17" />', 'administrator meta'),
    ('<meta name="administrator-release" content="AFTER-COST LEDGER CONSISTENCY · CORE FREEZE" />', f'<meta name="administrator-release" content="{RELEASE}" />', 'release meta'),
    ('<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.16" />', f'<meta name="atlas-asset-token" content="{TOKEN}" />', 'asset meta'),
    ('<title>Agent-Crypto @erith.IA — Build 40.6.16 · Administrator</title>', '<title>Agent-Crypto @erith.IA — Build 40.6.17 · Administrator</title>', 'title'),
]:
    index = once(index, old, new, label)

pattern = r'(strategy-a-after-cost-metrics-404298\.js\?v=administrator-build-)40\.6\.16'
index, n = re.subn(pattern, rf'\g<1>{BUILD}', index, count=1)
if n != 1:
    raise SystemExit(f'STOP {BUILD}: after-cost cache token count={n}')
index_path.write_text(index, encoding='utf-8')

# ---------------------------------------------------------------------------
# 3) MANIFEST TRUTH — preserve all existing structure and append one bounded gate
# ---------------------------------------------------------------------------
cascade = {
    'parent_build': PARENT,
    'release': RELEASE,
    'status': STATUS,
    'owner': 'js/strategy-a-after-cost-metrics-404298.js',
    'scope': 'after_cost_external_numeric_truth_only',
    'null_blank_boolean_missing_numeric_is_unknown': True,
    'negative_cost_clamped_to_zero': False,
    'known_costs_zero_when_no_cost_component_known': False,
    'ledger_consistency_406016_preserved': True,
    'paper_common_safety_gate_406014_preserved': True,
    'single_use_authorization_406015_preserved': True,
    'oracle_406013_modified': False,
    'chronos_modified': False,
    'header_width_406010_modified': False,
    'market_core_modified': False,
    'graph_modified': False,
    'technical_reading_modified': False,
    'window_manager_modified': False,
    'automatic_order': False,
    'real_order': False,
    'new_network_owner': False,
    'new_storage_owner': False,
    'new_timer': False,
    'new_observer': False,
}

v = load('version.json')
v.update({'release': RELEASE, 'build': BUILD, 'asset_token': TOKEN, 'status': STATUS, 'prepared_at': NOW, 'published_at': NOW, 'parent_build': PARENT})
if isinstance(v.get('lineage'), str) and '40.6.17 strict UNKNOWN' not in v['lineage']:
    v['lineage'] += ' → 40.6.17 strict UNKNOWN≠0 After-Cost numeric truth gate'
v['cascade_40_6_17'] = cascade
dump(ROOT / 'version.json', v)

b = load('build.json')
b.update({'build': BUILD, 'engine': ENGINE, 'release': RELEASE, 'published': True, 'status': STATUS, 'parent_build': PARENT, 'asset_token': TOKEN, 'administrator_build': BUILD, 'build_label': f'Build {BUILD}', 'release_status': RELEASE, 'timestamp': NOW})
if isinstance(b.get('current_version_truth'), dict):
    b['current_version_truth']['loaded_build'] = BUILD
b['cascade_40_6_17'] = cascade
dump(ROOT / 'build.json', b)

a = load('administrator-version.json')
a.update({'build': BUILD, 'release': RELEASE, 'status': STATUS, 'prepared_at': NOW, 'published_at': NOW, 'parent_build': PARENT, 'asset_token': TOKEN})
a['cascade_40_6_17'] = cascade
dump(ROOT / 'administrator-version.json', a)

# ---------------------------------------------------------------------------
# 4) RELEASE PROOF + CLEAN RESTORE ZIP
# ---------------------------------------------------------------------------
release_path = ROOT / 'RELEASE_40_6_17.md'
release_path.write_text(f'''# Agent-Crypto {BUILD} — {RELEASE}\n\n- Parent: `{PARENT}`\n- Market Core: `{ENGINE}` — protected / unchanged.\n- Changed runtime owner: `js/strategy-a-after-cost-metrics-404298.js`.\n- `null`, blank strings, booleans, missing and invalid numeric facts remain **UNKNOWN**.\n- Negative cost values are not silently clamped to zero.\n- If no cost component is known, `known_costs_eur` is **UNKNOWN**, not `0`.\n- Complete accounting identity gate from 40.6.16 remains mandatory.\n- Oracle 40.6.13, Paper Safety 40.6.14, single-use authorization 40.6.15, Chronos, Graphique, Lecture Technique, Window Manager and header width 40.6.10 remain frozen.\n- No real order, no new network/storage/timer/observer owner.\n\nGenerated: `{NOW}`\n''', encoding='utf-8')

# Frozen-owner byte proof.
for path, before in freeze.items():
    if path.read_bytes() != before:
        raise SystemExit(f'STOP {BUILD}: protected owner modified: {path}')

OUTDIR.mkdir(parents=True, exist_ok=True)
zip_path = OUTDIR / 'AGENT_CRYPTO_BUILD_40_6_17_UNKNOWN_NOT_ZERO_CLEAN_UPLOAD_8_FILES.zip'
payload = [
    index_path,
    after_path,
    ROOT / 'build.json',
    ROOT / 'administrator-version.json',
    ROOT / 'version.json',
    release_path,
    Path('.github/scripts/agent_crypto_40617_unknown_not_zero.py'),
]
restore_lines = [f'Agent-Crypto {BUILD} restore manifest', f'Parent={PARENT}', f'Engine={ENGINE}', '']
for p in payload:
    restore_lines.append(f'{sha256(p)}  {p.as_posix()}')
with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for p in payload:
        z.write(p, p.as_posix())
    z.writestr('RESTORE_MANIFEST.txt', '\n'.join(restore_lines) + '\n')
zip_sha = sha256(zip_path)
(zip_path.with_suffix(zip_path.suffix + '.sha256')).write_text(f'{zip_sha}  {zip_path.name}\n', encoding='utf-8')

print(json.dumps({
    'ok': True,
    'build': BUILD,
    'parent': PARENT,
    'owner': str(after_path),
    'strict_unknown': True,
    'protected_owners_modified': False,
    'zip': str(zip_path),
    'sha256': zip_sha,
}, ensure_ascii=False))
