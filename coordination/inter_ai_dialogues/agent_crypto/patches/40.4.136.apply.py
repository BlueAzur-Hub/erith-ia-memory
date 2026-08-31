from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, re, zipfile

ROOT=Path('public/agent_crypto_erith_ia/administrator')
REQ=Path('coordination/inter_ai_dialogues/agent_crypto/patches/40.4.136.request.json')
BUILD='40.4.136'; PARENT='40.4.135'
RELEASE='LOCAL AI TRUTH CONSISTENCY · BRIDGE R13 VERSION LOCK · DETERMINISTIC COMMENT GUARD'
STATUS='candidate_local_ai_truth_consistency_operator_validation_required'
EXPECTED_PARENT_APP='aa699adda604c73ef60f509cc5fa1179aaa55aed8c5b413668b3d6f131a820e6'
EXPECTED_PARENT_INDEX='a6f5225788357c67e048bfa1c24cc6c3dd9a6a8336b01e8ebea75eb279ee809a'

def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def replace_once(path, old, new, label):
    text=path.read_text(encoding='utf-8')
    n=text.count(old)
    if n != 1: raise SystemExit(f'STOP {label}: expected 1, found {n}')
    path.write_text(text.replace(old,new,1),encoding='utf-8')

req=json.loads(REQ.read_text(encoding='utf-8'))
if req.get('schema')!='agent_crypto_404136_truth_consistency_v1' or req.get('build')!=BUILD or req.get('parent_build')!=PARENT:
    raise SystemExit('STOP request schema/build mismatch')

ver=json.loads((ROOT/'version.json').read_text(encoding='utf-8'))
if ver.get('build') != PARENT or str((ver.get('engine') or {}).get('reference_build')) != '38.15.11':
    raise SystemExit('STOP parent build / Market Core mismatch')
if sha(ROOT/'app.js') != EXPECTED_PARENT_APP or sha(ROOT/'index.html') != EXPECTED_PARENT_INDEX:
    raise SystemExit('STOP parent Administrator bytes diverged from validated 40.4.135')

budget_markers=('setInterval(','MutationObserver','IntersectionObserver','new WebSocket','localStorage.setItem')
budget_before={}
for rel in ('app.js','js/app.js'):
    text=(ROOT/rel).read_text(encoding='utf-8',errors='replace')
    budget_before[rel]={m:text.count(m) for m in budget_markers}

protected=[
    'admin-ribbons.css','admin-chronos.css','private-backend-sources.css',
    'js/views/private-backend-sources.js','js/views/atlas-presentation.js',
    'js/views/atlas-peripheral-lazy.js','js/views/learning-presentation.js',
    'js/views/learning-parser-gate.js','js/views/residency-audit.js'
]
protected_before={rel:sha(ROOT/rel) for rel in protected}

index=ROOT/'index.html'
text=index.read_text(encoding='utf-8')
exact={
  '<meta name="atlas-build" content="40.4.135" />':f'<meta name="atlas-build" content="{BUILD}" />',
  '<meta name="administrator-build" content="40.4.135" />':f'<meta name="administrator-build" content="{BUILD}" />',
  '<meta name="administrator-release" content="ADMINISTRATION CANONICAL ENTRY RECOVERY · ATLAS CURRENT RECOVERY FREEZE" />':f'<meta name="administrator-release" content="{RELEASE}" />',
  '<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.4.135" />':f'<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-{BUILD}" />',
  '<title>Agent-Crypto @erith.IA — Build 40.4.135 · Administrator</title>':f'<title>Agent-Crypto @erith.IA — Build {BUILD} · Administrator</title>'
}
for old,new in exact.items():
    if text.count(old)!=1: raise SystemExit(f'STOP index identity missing: {old[:70]}')
    text=text.replace(old,new,1)
text=text.replace('administrator-build-40.4.135',f'administrator-build-{BUILD}')
text=text.replace('data-administrator-build="40.4.135"',f'data-administrator-build="{BUILD}"')
text=text.replace('Version Agent-Crypto installée : Build 40.4.135',f'Version Agent-Crypto installée : Build {BUILD}')
text=text.replace('>Build 40.4.135</span>',f'>Build {BUILD}</span>')
text=text.replace('Agent-Crypto @erith.IA · Build 40.4.135 · Administrator',f'Agent-Crypto @erith.IA · Build {BUILD} · Administrator')
index.write_text(text,encoding='utf-8')

app=ROOT/'app.js'
text=app.read_text(encoding='utf-8')
if text.count('const ATLAS_BUILD = "40.4.135";')!=1: raise SystemExit('STOP ATLAS_BUILD parent missing')
text=text.replace('const ATLAS_BUILD = "40.4.135";',f'const ATLAS_BUILD = "{BUILD}";',1)
if text.count('V2.3.2R5') < 1 or text.count('V1.9.5') < 1 or text.count('1.9.5') < 1:
    raise SystemExit('STOP stale local stack markers not found')
text=text.replace('V2.3.2R5','V2.3.2R13').replace('V1.9.5','V1.9.11').replace('1.9.5','1.9.11')

anchor='function atlasLocalNormalizeAtlasSuiteClaims(text) {'
if text.count(anchor)!=1: raise SystemExit('STOP guard insertion anchor mismatch')
guard=r'''function atlasLocalBoundedCommentTruthGuard(mode, body, snapshot) {
  const source = String(body || "").replace(/\r\n?/g, "\n");
  if (mode !== "top5") return { conflict: false, reason: "", body: source };

  const top5 = snapshot?.strict_contract?.canonical_top5 || {};
  const assets = Array.isArray(top5.assets) ? top5.assets : [];
  const available = assets.filter(row => row?.available === true).length;
  const complete = top5.complete === true || (assets.length >= 5 && available >= 5);
  if (!complete) return { conflict: false, reason: "", body: source };

  const normalized = source.toLocaleLowerCase("fr-FR").replace(/[’']/g, "'");
  const contradictions = [
    /aucune information[^\n]{0,140}(?:top\s*5|cinq actifs|cinq principaux|cinq meilleurs)/,
    /aucune donn(?:ée|e)[^\n]{0,140}(?:top\s*5|cinq actifs|cinq principaux|cinq meilleurs)/,
    /(?:absence|indisponibilit(?:é|e))[^\n]{0,100}(?:top\s*5|cinq actifs|cinq principaux)/,
    /(?:top\s*5|cinq actifs|cinq principaux|cinq meilleurs)[^\n]{0,140}(?:non disponible|indisponible|absent|manquant)/,
    /(?:impossible|pas possible)[^\n]{0,120}(?:identifier|d(?:é|e)terminer)[^\n]{0,120}(?:top\s*5|cinq actifs|cinq principaux|cinq meilleurs)/,
    /no (?:top\s*5|top five|five assets|information|data)[^\n]{0,120}(?:available|provided)/,
    /(?:top\s*5|top five|five assets)[^\n]{0,120}(?:unavailable|not available|missing)/,
    /cannot[^\n]{0,120}(?:identify|determine)[^\n]{0,120}(?:top\s*5|top five|five assets)/
  ];
  const conflict = contradictions.some(pattern => pattern.test(normalized));
  return {
    conflict,
    reason: conflict ? "deterministic_top5_5_5_conflict" : "",
    body: source,
    available,
    expected: assets.length || 5
  };
}

'''
text=text.replace(anchor,guard+anchor,1)
needle='''  if (match) {\n    const tail = answer.slice(match.index + match[0].length);\n    const next = /\\n####\\s+\\d+\\./m.exec(tail);\n    const body = next ? tail.slice(0, next.index) : tail;\n    if (atlasTextEnglishMarkerScore(body) >= 1) {\n      answer = atlasMarkdownReplaceNamedSection(answer, "Commentaire local borné", atlasLocalFrenchCommentFallback(mode, snapshot));\n    }\n  }\n\n  // One evidence vocabulary everywhere. Raw scores remain secondary metadata only.'''
replacement='''  let deterministicCommentRejected = false;\n  let deterministicCommentRejectReason = "";\n  if (match) {\n    const tail = answer.slice(match.index + match[0].length);\n    const next = /\\n####\\s+\\d+\\./m.exec(tail);\n    const body = next ? tail.slice(0, next.index) : tail;\n    if (atlasTextEnglishMarkerScore(body) >= 1) {\n      answer = atlasMarkdownReplaceNamedSection(answer, "Commentaire local borné", atlasLocalFrenchCommentFallback(mode, snapshot));\n    }\n    const guarded = atlasLocalBoundedCommentTruthGuard(mode, body, snapshot);\n    if (guarded.conflict) {\n      answer = atlasMarkdownReplaceNamedSection(answer, "Commentaire local borné", atlasLocalFrenchCommentFallback(mode, snapshot));\n      deterministicCommentRejected = true;\n      deterministicCommentRejectReason = guarded.reason;\n    }\n  }\n\n  // One evidence vocabulary everywhere. Raw scores remain secondary metadata only.'''
if text.count(needle)!=1: raise SystemExit('STOP truth polish body mismatch')
text=text.replace(needle,replacement,1)
old_return='  return { ...result, answer, language_normalized: true, evidence_normalized: !!evidence, atlas_suite_context_normalized: true };'
new_return='''  return {
    ...result,
    answer,
    language_normalized: true,
    evidence_normalized: !!evidence,
    atlas_suite_context_normalized: true,
    deterministic_comment_rejected: deterministicCommentRejected,
    deterministic_comment_reject_reason: deterministicCommentRejectReason,
    model_comment_used: deterministicCommentRejected ? false : result?.model_comment_used === true
  };'''
if text.count(old_return)!=1: raise SystemExit('STOP truth polish return mismatch')
text=text.replace(old_return,new_return,1)
app.write_text(text,encoding='utf-8')

replace_once(ROOT/'js/app.js','  const ADMIN_BUILD = "40.4.135";',f'  const ADMIN_BUILD = "{BUILD}";','ADMIN_BUILD')
aether=ROOT/'js/aether.js'
text=aether.read_text(encoding='utf-8')
if text.count('40.4.135')!=2: raise SystemExit('STOP Aether build identity count mismatch')
aether.write_text(text.replace('40.4.135',BUILD),encoding='utf-8')
atlas=ROOT/'views/atlas.html'
text=atlas.read_text(encoding='utf-8')
if 'V2.3.2R5' not in text or 'V1.9.5' not in text: raise SystemExit('STOP Atlas stable stack static markers missing')
atlas.write_text(text.replace('V2.3.2R5','V2.3.2R13').replace('V1.9.5','V1.9.11'),encoding='utf-8')

feature={
 'build':BUILD,'control_center_expected':'V2.3.2R13','bridge_expected':'V1.9.11','bridge_numeric_expected':'1.9.11',
 'stable_stack_runtime_truth_aligned':True,'deterministic_top5_comment_guard':True,
 'deterministic_contract_precedence':True,'model_comment_rejected_on_top5_5_5_absence_conflict':True,
 'model_comment_fallback':'deterministic French bounded comment','aether_ribbon_changed':False,'graph_changed':False,
 'oracle_engine_changed':False,'market_core_changed':False,'current_transaction_logic_changed':False,
 'news_pipeline_changed':False,'window_manager_changed':False,'bridge_binary_changed':False,'control_center_binary_changed':False
}
note=(f'{BUILD} — Local AI truth consistency: aligns the Administrator expected local stack with the already validated '
      'Aether Control 2.3.2R13 / Bridge V1.9.11 and adds a deterministic Top 5 commentary guard. When the canonical '
      'snapshot contains BTC/ETH/BNB/XRP/SOL 5/5, a local model comment claiming the Top 5 is absent/unavailable is '
      'rejected and replaced by the deterministic French bounded fallback. No Bridge binary, Control Center binary, '
      'Market Core 38.15.11, Graph, Oracle, CURRENT, News, Aether ribbon or Window Manager logic is changed.')
now=datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')

def update_manifest(path, admin_sha=None):
    d=json.loads(path.read_text(encoding='utf-8'))
    d['build']=BUILD; d['release']=RELEASE; d['status']=STATUS; d['parent_build']=PARENT
    d['prepared_at']=now; d['published_at']=None; d['asset_token']=f'market-core-v2.0-alpha-build-{BUILD}'
    if 'global_versioning' in d: d['global_versioning']=BUILD
    lineage=str(d.get('lineage') or '')
    marker='40.4.136 local AI truth consistency'
    if marker not in lineage:
        d['lineage']=(lineage+' → '+marker+' + Bridge R13/V1.9.11 truth + deterministic Top5 comment guard').strip(' →')
    d.setdefault('features',{})['local_ai_truth_consistency_404136']=feature.copy()
    d.setdefault('integrity',{})['local_ai_truth_consistency_404136']=feature.copy()
    pub=d.setdefault('integrity',{}).setdefault('publication_identity',{})
    pub.update({'build':BUILD,'asset_token':f'market-core-v2.0-alpha-build-{BUILD}','status':STATUS,'app_sha256':sha(ROOT/'app.js')})
    if admin_sha is not None: pub['administrator_version_sha256']=admin_sha
    notes=d.setdefault('release_notes',[])
    if not notes or notes[0]!=note: notes.insert(0,note)
    d.setdefault('validation',{}).update({
      'control_center_r13_version_truth_404136_required':True,'bridge_v1_9_11_version_truth_404136_required':True,
      'top5_deterministic_comment_guard_404136_required':True,'top5_5_5_model_absence_claim_rejected_404136_required':True,
      'aether_ribbon_non_regression_404136_required':True,'graph_non_regression_404136_required':True,
      'oracle_non_regression_404136_required':True,'current_non_regression_404136_required':True,
      'market_core_38_15_11_non_regression_404136_required':True
    })
    files=d.get('files') or {}
    for rel in list(files):
        target=(ROOT/rel).resolve()
        if not target.is_file(): raise SystemExit(f'STOP manifest file absent {rel}')
        files[rel]=sha(target)
    path.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

update_manifest(ROOT/'administrator-version.json')
update_manifest(ROOT/'version.json',sha(ROOT/'administrator-version.json'))
idx=index.read_text(encoding='utf-8'); js=app.read_text(encoding='utf-8')
if '40.4.135' in idx: raise SystemExit('STOP stale active index build 40.4.135')
if 'V1.9.5' in js or 'V2.3.2R5' in js: raise SystemExit('STOP stale expected local stack in app.js')
if 'atlasLocalBoundedCommentTruthGuard' not in js or 'deterministic_top5_5_5_conflict' not in js: raise SystemExit('STOP deterministic Top5 guard missing')
ids=re.findall(r'\bid=["\']([^"\']+)["\']',idx)
if len(ids)!=len(set(ids)): raise SystemExit('STOP duplicated HTML IDs')
for rel in ('app.js','js/app.js'):
    body=(ROOT/rel).read_text(encoding='utf-8',errors='replace')
    after={m:body.count(m) for m in budget_markers}
    for marker in budget_markers:
        if after[marker] > budget_before[rel][marker]: raise SystemExit(f'STOP runtime budget increased {rel} {marker}')
for rel,h in protected_before.items():
    if sha(ROOT/rel)!=h: raise SystemExit(f'STOP protected file changed unexpectedly: {rel}')
for name in ('administrator-version.json','version.json'):
    d=json.loads((ROOT/name).read_text(encoding='utf-8'))
    if d.get('build')!=BUILD: raise SystemExit(f'STOP manifest build mismatch {name}')
    for rel,h in (d.get('files') or {}).items():
        if sha((ROOT/rel).resolve())!=h: raise SystemExit(f'STOP hash mismatch {name} {rel}')
vd=json.loads((ROOT/'version.json').read_text(encoding='utf-8'))
if str((vd.get('engine') or {}).get('reference_build'))!='38.15.11': raise SystemExit('STOP Market Core reference changed')
if vd.get('integrity',{}).get('publication_identity',{}).get('administrator_version_sha256')!=sha(ROOT/'administrator-version.json'):
    raise SystemExit('STOP manifest cross-hash mismatch')

files=list((vd.get('files') or {}).keys())
for rel in ('version.json','administrator-version.json'):
    if rel not in files: files.append(rel)
out=Path('coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_BUILD_40_4_136_LOCAL_AI_TRUTH_CONSISTENCY.zip')
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for rel in files:
        p=(ROOT/rel).resolve(); z.write(p,arcname=p.relative_to(Path('.').resolve()).as_posix())
digest=sha(out)
Path(str(out)+'.sha256').write_text(f'{digest}  {out.name}\n',encoding='utf-8')
report=Path('coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_40_4_136_VALIDATION_REPORT.md')
report.write_text(f'''# Agent-Crypto 40.4.136 — Validation Report

- Parent: `40.4.135`
- Market Core: `38.15.11` protected
- Expected local stack: `Aether Control V2.3.2R13 / Bridge V1.9.11`
- Deterministic Top 5 guard: active
- ZIP SHA-256: `{digest}`

## Scope

Only local-stack version truth + deterministic Top 5 model-comment guard. No Bridge/Control Center binary, Graph, Oracle, CURRENT, News, Aether ribbon, Chronos, Window Manager or Market Core business-logic change.

## Pre-JS gates

- parent bytes: PASS
- manifest hashes: PASS
- HTML IDs unique: PASS
- runtime budget: unchanged
- protected files: byte-identical
- stale expected V1.9.5/R5: removed
- deterministic Top 5 guard marker: present

## JS gate

Pending workflow `node --check` step.
''',encoding='utf-8')
print(f'PASS PRE-JS {BUILD} · ZIP {digest}')
