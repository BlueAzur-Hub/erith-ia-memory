#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, re, zipfile

ROOT = Path('public/agent_crypto_erith_ia/administrator')
OUTDIR = Path('coordination/inter_ai_dialogues/agent_crypto')
BUILD='40.6.14'; PARENT='40.6.13'; ENGINE='38.15.11'
RELEASE='PAPER COMMON SAFETY GATE · CORE FREEZE'
STATUS='paper_common_safety_gate_core_freeze_406014'
TOKEN=f'market-core-v2.0-alpha-build-{BUILD}'
NOW=datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')


def load(name):
    data=json.loads((ROOT/name).read_text(encoding='utf-8'))
    if not isinstance(data,dict): raise SystemExit(f'STOP {BUILD}: invalid {name}')
    return data

def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()

def replace_once(text, old, new, label):
    count=text.count(old)
    if count != 1: raise SystemExit(f'STOP {BUILD}: {label} count={count}')
    return text.replace(old,new,1)

if str(load('version.json').get('build')) != PARENT:
    raise SystemExit(f'STOP {BUILD}: expected parent {PARENT}')
if str(load('build.json').get('engine')) != ENGINE:
    raise SystemExit(f'STOP {BUILD}: Market Core drift')

paper_path=ROOT/'js/strategy-a-paper-lifecycle-404295.js'
index_path=ROOT/'index.html'

# Hard-frozen owners. 40.6.14 is allowed to modify only the Paper lifecycle owner,
# publication truth files and the release note/clean archive.
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
    ROOT/'js/strategy-a-safety-certification-404299.js',
    ROOT/'js/strategy-a-auto-lifecycle-bridge-404297.js',
]
freeze={p:p.read_bytes() for p in frozen_paths}

# ------------------------------------------------------------------
# 1) PAPER OWNER SURGERY — COMMON SAFETY GATE
# ------------------------------------------------------------------
paper=paper_path.read_text(encoding='utf-8')
if 'common_safety_gate_406014: true' in paper:
    raise SystemExit(f'STOP {BUILD}: safety gate already present')
paper=replace_once(paper,
'''  Agent-Crypto Administrator — Strategy A Paper V2 lifecycle integrity corrective lock\n  Build: 40.4.295\n  Responsibility: deterministic Paper-only execution/reconciliation lifecycle.\n  Corrects partial-fill average price, contradictory reconciliation and self-test state mutation.\n  No network, no Kraken order, no wallet, no credentials, no live Paper ledger mutation.''',
'''  Agent-Crypto Administrator — Strategy A Paper V2 lifecycle + common safety gate\n  Build: 40.6.14\n  Responsibility: deterministic Paper-only execution/reconciliation lifecycle.\n  Adds a fail-closed common Safety Governor gate for NEW Paper entries only.\n  Existing submitted Paper positions remain monitorable/reconcilable/closable.\n  No network, no Kraken order, no wallet, no credentials, no live Paper ledger mutation.''',
'paper header')
paper=replace_once(paper,'  const BUILD = "40.4.295";','  const BUILD = "40.6.14";','paper build')

anchor='''  const iso = () => new Date().toISOString();\n  const hash = text => {'''
injection='''  const iso = () => new Date().toISOString();\n\n  // 40.6.14 — one common gate for every NEW Strategy A Paper entry path.\n  // Safety is resolved at call time because the governor script is loaded after\n  // this lifecycle owner. Fail closed for creation/submission, but never strand\n  // an already-submitted Paper position that still needs reconciliation/closure.\n  function safetyGovernor() {\n    return globalThis.AgentCryptoStrategyASafetyCertification404299\n      || globalThis.AgentCryptoStrategyASafetyCertification404295\n      || globalThis.AgentCryptoStrategyASafetyCertification404293\n      || null;\n  }\n\n  function safetyGateSnapshot() {\n    const governor = safetyGovernor();\n    if (!governor || typeof governor.snapshot !== "function") {\n      return { allowed: false, level: "UNAVAILABLE", reason: "SAFETY_GOVERNOR_UNAVAILABLE", new_trades_allowed: false };\n    }\n    try {\n      const snap = governor.snapshot() || {};\n      const level = String(snap.level || "UNKNOWN").toUpperCase();\n      const allowed = level === "NORMAL" && snap.new_trades_allowed === true;\n      return {\n        allowed,\n        level,\n        reason: String(snap.reason || (allowed ? "NORMAL" : "SAFETY_GOVERNOR_BLOCK")),\n        new_trades_allowed: snap.new_trades_allowed === true,\n        existing_paper_monitoring_allowed: snap.existing_paper_monitoring_allowed !== false,\n        governor_build: snap.build || governor.build || null\n      };\n    } catch (error) {\n      return { allowed: false, level: "ERROR", reason: "SAFETY_GOVERNOR_SNAPSHOT_ERROR", new_trades_allowed: false, error: String(error?.message || error) };\n    }\n  }\n\n  function safetyReject(envelope, stage, gate) {\n    envelope.state = "REJECTED";\n    envelope.reason = `SAFETY_GOVERNOR_BLOCK_${stage}`;\n    envelope.retry_allowed = false;\n    envelope.updated_at = iso();\n    envelope.safety_gate = clone(gate) || gate;\n    LIVE_IDS.delete(envelope.trade_id);\n    audit(envelope, envelope.reason, {\n      stage, level: gate?.level || "UNKNOWN", governor_reason: gate?.reason || null,\n      new_trades_allowed: gate?.new_trades_allowed === true\n    });\n    return envelope;\n  }\n\n  const hash = text => {'''
paper=replace_once(paper,anchor,injection,'safety helper anchor')

old_create='''    if (envelope.state !== "REJECTED") LIVE_IDS.add(tradeId);\n    audit(envelope, "CREATE", { authorized_notional_eur: authorized });\n    return envelope;'''
new_create='''    if (envelope.state !== "REJECTED") {\n      const gate = safetyGateSnapshot();\n      envelope.safety_gate = clone(gate) || gate;\n      if (!gate.allowed) return safetyReject(envelope, "CREATE", gate);\n      LIVE_IDS.add(tradeId);\n    }\n    audit(envelope, "CREATE", { authorized_notional_eur: authorized, safety_gate: envelope.safety_gate || null });\n    return envelope;'''
paper=replace_once(paper,old_create,new_create,'create safety gate')

old_submit='''  function submit(envelope) {\n    if (!guard(envelope, ["RISK_APPROVED"], "SUBMIT")) return envelope;\n    envelope.state = "SUBMITTED";'''
new_submit='''  function submit(envelope) {\n    if (!guard(envelope, ["RISK_APPROVED"], "SUBMIT")) return envelope;\n    const gate = safetyGateSnapshot();\n    envelope.safety_gate = clone(gate) || gate;\n    if (!gate.allowed) return safetyReject(envelope, "SUBMIT", gate);\n    envelope.state = "SUBMITTED";'''
paper=replace_once(paper,old_submit,new_submit,'submit safety gate')

paper=replace_once(paper,
'''<div class="spl-sub">Trade Envelope unique · ACK · partial fill · reconciliation contradictoire refusée · protection · clôture. Correctif intégrité 40.4.295.</div>''',
'''<div class="spl-sub">Trade Envelope unique · Safety Governor commun sur nouvelles entrées · ACK · partial fill · reconciliation · protection · clôture. Gate 40.6.14.</div>''',
'paper UI subtitle')
paper=replace_once(paper,
'''<div class="spl-safety">PAPER ONLY · aucun réseau · aucun Kraken · aucune clé · aucune écriture Auto A · lecture/test sans effacement des identifiants actifs.</div>''',
'''<div class="spl-safety">PAPER ONLY · Safety Governor obligatoire pour CREATE/SUBMIT · une position déjà soumise reste réconciliable/closable · aucun réseau · aucun Kraken · aucune clé.</div>''',
'paper UI safety line')

api_anchor='''    diagnostic_snapshot: diagnosticSnapshot,\n    render,\n    terminal_states: [...TERMINAL],'''
api_new='''    diagnostic_snapshot: diagnosticSnapshot,\n    safety_gate_snapshot: safetyGateSnapshot,\n    render,\n    terminal_states: [...TERMINAL],'''
paper=replace_once(paper,api_anchor,api_new,'api safety snapshot')
paper=replace_once(paper,
'''    corrective_lock_404295: true\n  });''',
'''    corrective_lock_404295: true,\n    common_safety_gate_406014: true,\n    new_entry_fail_closed: true,\n    existing_submitted_monitoring_preserved: true\n  });''',
'api safety flags')
paper_path.write_text(paper,encoding='utf-8')

# ------------------------------------------------------------------
# 2) PUBLICATION TRUTH — ONLY GLOBAL BUILD TOKENS, NO ORACLE/CHRONOS SURGERY
# ------------------------------------------------------------------
index=index_path.read_text(encoding='utf-8')
protected_index_tokens=[
  'oracle-presentation-405010.css?v=administrator-build-40.6.13',
  'oracle-fx-406013.css?v=administrator-build-40.6.13',
  'oracle-fx-406013.js?v=administrator-build-40.6.13',
  'grid-template-columns:minmax(128px,.66fr) minmax(124px,.66fr) minmax(170px,.94fr) minmax(255px,1.35fr) minmax(410px,2.05fr)!important;',
]
for token in protected_index_tokens:
    if token not in index: raise SystemExit(f'STOP {BUILD}: protected index contract missing before surgery: {token}')

repls={
 '<meta name="atlas-build" content="40.6.13" />':'<meta name="atlas-build" content="40.6.14" />',
 '<meta name="administrator-build" content="40.6.13" />':'<meta name="administrator-build" content="40.6.14" />',
 '<meta name="administrator-release" content="ORACLE STRUCTURE RESTORE · RESTRAINED SEMANTIC FX · CORE FREEZE" />':f'<meta name="administrator-release" content="{RELEASE}" />',
 '<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.13" />':f'<meta name="atlas-asset-token" content="{TOKEN}" />',
 '<title>Agent-Crypto @erith.IA — Build 40.6.13 · Administrator</title>':'<title>Agent-Crypto @erith.IA — Build 40.6.14 · Administrator</title>',
}
for old,new in repls.items(): index=replace_once(index,old,new,old)
index,n1=re.subn(r'(id="atlasVersionTruthControl"[\s\S]{0,700}?aria-label="Version Agent-Crypto installée : Build )[^,\"]+(, mode Administrator\")',r'\g<1>40.6.14\g<2>',index,count=1)
index,n2=re.subn(r'(<span id="atlasVersionTruthText">Build )[^<]+(</span>)',r'\g<1>40.6.14\g<2>',index,count=1)
if n1!=1 or n2!=1: raise SystemExit(f'STOP {BUILD}: version badge mismatch')
index_path.write_text(index,encoding='utf-8')

# ------------------------------------------------------------------
# 3) RELEASE NOTE + MANIFESTS
# ------------------------------------------------------------------
release_path=ROOT/'RELEASE_40_6_14.md'
release_path.write_text(f'''# Agent-Crypto @erith.IA — Build {BUILD}\n\n## {RELEASE}\n\nParent: **{PARENT}**  \nMarket Core: **{ENGINE} protected**\n\n### Correction\nLe propriétaire réel du lifecycle Paper (`js/strategy-a-paper-lifecycle-404295.js`) possède désormais un gate commun vers le Safety Governor.\n\n- `CREATE` : fail-closed si Safety est absent ou hors `NORMAL`.\n- `SUBMIT` : seconde validation juste avant engagement Paper.\n- `ACK / FILL / RECONCILE / PROTECT / CLOSE` : restent disponibles pour une position déjà soumise afin de ne jamais la bloquer en cours de suivi.\n- aucune reprise automatique ; aucun blind retry ; aucun ordre réel.\n\n### Propriétaires préservés\n- Oracle 40.6.13 + FX : intouchés ;\n- Chronos 40.6.9 : intouché ;\n- Version Truth 40.6.8 : code intouché ;\n- largeur 40.6.10 : contrat conservé ;\n- Graphique / Lecture Technique : intouchés ;\n- Market Core **{ENGINE}** : intouché ;\n- Safety Governor 40.4.299 et Auto/Lifecycle Bridge 40.4.297 : code intouché, consommés comme dépendances.\n\n### Tests de release\nLe workflow 40.6.14 vérifie : syntaxe JS, lifecycle complet en Safety NORMAL, refus CREATE en PAUSE, refus SUBMIT après bascule PAUSE, et capacité de terminer un lifecycle déjà SUBMITTED malgré PAUSE.\n''',encoding='utf-8')

docs={n:load(n) for n in ('build.json','administrator-version.json','version.json')}
for n,d in docs.items():
    d['build']=BUILD; d['release']=RELEASE; d['status']=STATUS; d['parent_build']=PARENT; d['asset_token']=TOKEN
    if 'administrator_build' in d:d['administrator_build']=BUILD
    if 'build_label' in d:d['build_label']=f'Build {BUILD}'
    if 'release_status' in d:d['release_status']=RELEASE
    for k in ('timestamp','prepared_at','published_at'):
        if k in d:d[k]=NOW
    if isinstance(d.get('current_version_truth'),dict): d['current_version_truth']['loaded_build']=BUILD
    d['cascade_40_6_14']={
      'parent_build':PARENT,'release':RELEASE,
      'paper_lifecycle_owner':'js/strategy-a-paper-lifecycle-404295.js',
      'safety_governor_owner':'js/strategy-a-safety-certification-404299.js',
      'auto_lifecycle_bridge_owner':'js/strategy-a-auto-lifecycle-bridge-404297.js',
      'common_new_entry_gate':True,'create_fail_closed':True,'submit_recheck':True,
      'existing_submitted_monitoring_preserved':True,'blind_retry_forbidden':True,
      'paper_only':True,'real_order':False,'network_added':False,'storage_owner_added':False,
      'market_core_modified':False,'oracle_modified':False,'chronos_modified':False,
      'version_truth_code_modified':False,'graph_modified':False,'technical_reading_modified':False,
      'window_manager_modified':False
    }
for n in ('build.json','administrator-version.json'):
    (ROOT/n).write_text(json.dumps(docs[n],ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
ver=docs['version.json']; files=ver.setdefault('files',{})
for rel in ('index.html','js/strategy-a-paper-lifecycle-404295.js','js/strategy-a-safety-certification-404299.js','js/strategy-a-auto-lifecycle-bridge-404297.js','build.json','administrator-version.json','RELEASE_40_6_14.md'):
    files[rel]=sha(ROOT/rel)
(ROOT/'version.json').write_text(json.dumps(ver,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

# ------------------------------------------------------------------
# 4) HARD ANTI-DESTRUCTION PROOFS
# ------------------------------------------------------------------
for p,before in freeze.items():
    if p.read_bytes()!=before: raise SystemExit(f'STOP {BUILD}: protected owner changed: {p}')
final=index_path.read_text(encoding='utf-8')
for token in protected_index_tokens:
    if token not in final: raise SystemExit(f'STOP {BUILD}: protected index contract changed: {token}')
if str(load('build.json').get('engine'))!=ENGINE: raise SystemExit(f'STOP {BUILD}: Market Core drift')
if 'common_safety_gate_406014: true' not in paper_path.read_text(encoding='utf-8'):
    raise SystemExit(f'STOP {BUILD}: common gate missing')

OUTDIR.mkdir(parents=True,exist_ok=True)
out=OUTDIR/'AGENT_CRYPTO_BUILD_40_6_14_PAPER_COMMON_SAFETY_GATE_CLEAN_UPLOAD_8_FILES.zip'
rels=['index.html','js/strategy-a-paper-lifecycle-404295.js','js/strategy-a-safety-certification-404299.js','js/strategy-a-auto-lifecycle-bridge-404297.js','build.json','administrator-version.json','version.json','RELEASE_40_6_14.md']
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for rel in rels:z.write(ROOT/rel,(Path('public/agent_crypto_erith_ia/administrator')/rel).as_posix())
digest=sha(out)
Path(str(out)+'.sha256').write_text(f'{digest}  {out.name}\n',encoding='utf-8')
print(json.dumps({'ok':True,'build':BUILD,'zip':str(out),'sha256':digest,'paper_owner_modified':True,'protected_owners_modified':False},ensure_ascii=False))
