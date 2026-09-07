#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, re, zipfile

ROOT=Path('public/agent_crypto_erith_ia/administrator')
OUTDIR=Path('coordination/inter_ai_dialogues/agent_crypto')
BUILD='40.6.15'; PARENT='40.6.14'; ENGINE='38.15.11'
RELEASE='PAPER SINGLE-USE AUTHORIZATION · CORE FREEZE'
STATUS='paper_single_use_authorization_core_freeze_406015'
TOKEN=f'market-core-v2.0-alpha-build-{BUILD}'
NOW=datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')

def load(name):
    d=json.loads((ROOT/name).read_text(encoding='utf-8'))
    if not isinstance(d,dict): raise SystemExit(f'STOP {BUILD}: invalid {name}')
    return d

def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()

def once(text, old, new, label):
    c=text.count(old)
    if c!=1: raise SystemExit(f'STOP {BUILD}: {label} count={c}')
    return text.replace(old,new,1)

if str(load('version.json').get('build'))!=PARENT: raise SystemExit(f'STOP {BUILD}: expected parent {PARENT}')
if str(load('build.json').get('engine'))!=ENGINE: raise SystemExit(f'STOP {BUILD}: Market Core drift')

paper_path=ROOT/'js/strategy-a-paper-lifecycle-404295.js'
index_path=ROOT/'index.html'

# Everything validated outside the Paper lifecycle owner stays byte-identical.
frozen_paths=[
 ROOT/'admin-chronos.css', ROOT/'js/version-truth.js', ROOT/'js/app.js', ROOT/'js/core/admin-window-manager.js',
 ROOT/'style.css', ROOT/'parallel-markets.css', ROOT/'market-reading-depth.css', ROOT/'admin-visual-assets.css', ROOT/'admin-visual-cache.css',
 ROOT/'oracle-presentation-405010.css', ROOT/'oracle-fx-406013.css', ROOT/'js/oracle-fx-406013.js',
 ROOT/'js/strategy-a-safety-certification-404299.js', ROOT/'js/strategy-a-auto-lifecycle-bridge-404297.js',
 ROOT/'js/strategy-a-after-cost-metrics-404298.js', ROOT/'js/strategy-a-evidence-dossier-404295.js'
]
freeze={p:p.read_bytes() for p in frozen_paths}

paper=paper_path.read_text(encoding='utf-8')
if 'single_use_authorization_406015: true' in paper: raise SystemExit(f'STOP {BUILD}: authorization lock already present')
paper=once(paper,'Build: 40.6.14','Build: 40.6.15','paper header build')
paper=once(paper,'  const BUILD = "40.6.14";','  const BUILD = "40.6.15";','paper const build')
paper=once(paper,
'''  const LIVE_IDS = new Set();\n  const AUDIT = [];''',
'''  const LIVE_IDS = new Set();\n  // Authorization identities are consumed exactly once at successful Paper SUBMIT.\n  // They are intentionally never released by close/reject/cancel.\n  const CONSUMED_AUTHORIZATIONS = new Set();\n  const AUDIT = [];''','authorization registry')

hash_anchor='''  const hash = text => {\n    let h = 2166136261;\n    for (const c of String(text || "")) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }\n    return (h >>> 0).toString(16).padStart(8, "0");\n  };\n\n  function audit'''
hash_new='''  const hash = text => {\n    let h = 2166136261;\n    for (const c of String(text || "")) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }\n    return (h >>> 0).toString(16).padStart(8, "0");\n  };\n\n  // 40.6.15 — canonical one-shot authorization identity.\n  // Prefer the explicit Risk authorization. If the current caller does not\n  // provide one, decision/proposal identity remains a deterministic fail-safe.\n  function authorizationKey(envelope) {\n    const clean = value => {\n      const v = String(value ?? "").trim();\n      if (!v || /^(UNKNOWN|NONE|NULL|N\\/A)$/i.test(v) || /-UNKNOWN$/i.test(v)) return null;\n      return v;\n    };\n    const risk = clean(envelope?.risk_id);\n    if (risk) return `RISK:${risk}`;\n    const decision = clean(envelope?.decision_id);\n    if (decision) return `DECISION:${decision}`;\n    const proposal = clean(envelope?.proposal_id);\n    if (proposal) return `PROPOSAL:${proposal}`;\n    return null;\n  }\n\n  function authorizationReject(envelope, reason, key = null) {\n    envelope.state = "REJECTED";\n    envelope.reason = reason;\n    envelope.retry_allowed = false;\n    envelope.updated_at = iso();\n    envelope.authorization = {\n      key: key ? hash(key) : null,\n      source: key ? key.split(":", 1)[0] : null,\n      consumed: false,\n      rejected_at: envelope.updated_at\n    };\n    LIVE_IDS.delete(envelope.trade_id);\n    audit(envelope, reason, { authorization_key_hash: envelope.authorization.key });\n    return envelope;\n  }\n\n  function authorizationSnapshot() {\n    return {\n      build: BUILD,\n      consumed_count: CONSUMED_AUTHORIZATIONS.size,\n      consumed_key_hashes: [...CONSUMED_AUTHORIZATIONS].map(hash)\n    };\n  }\n\n  function audit'''
paper=once(paper,hash_anchor,hash_new,'authorization helpers')

old_submit='''  function submit(envelope) {\n    if (!guard(envelope, ["RISK_APPROVED"], "SUBMIT")) return envelope;\n    const gate = safetyGateSnapshot();\n    envelope.safety_gate = clone(gate) || gate;\n    if (!gate.allowed) return safetyReject(envelope, "SUBMIT", gate);\n    envelope.state = "SUBMITTED";\n    envelope.submitted_notional_eur = envelope.authorized_notional_eur;\n    envelope.updated_at = iso();\n    envelope.retry_allowed = false;\n    audit(envelope, "SUBMIT_PAPER", { notional_eur: envelope.submitted_notional_eur });\n    return envelope;\n  }'''
new_submit='''  function submit(envelope) {\n    if (!guard(envelope, ["RISK_APPROVED"], "SUBMIT")) return envelope;\n    const gate = safetyGateSnapshot();\n    envelope.safety_gate = clone(gate) || gate;\n    if (!gate.allowed) return safetyReject(envelope, "SUBMIT", gate);\n\n    const authorizationKeyValue = authorizationKey(envelope);\n    if (!authorizationKeyValue) return authorizationReject(envelope, "AUTHORIZATION_ID_REQUIRED");\n    if (CONSUMED_AUTHORIZATIONS.has(authorizationKeyValue)) {\n      return authorizationReject(envelope, "AUTHORIZATION_ALREADY_CONSUMED", authorizationKeyValue);\n    }\n\n    // JS execution is single-threaded here: check + consume is synchronous and\n    // occurs immediately before the SUBMITTED transition. Never release this key.\n    CONSUMED_AUTHORIZATIONS.add(authorizationKeyValue);\n    envelope.authorization = {\n      key: hash(authorizationKeyValue),\n      source: authorizationKeyValue.split(":", 1)[0],\n      consumed: true,\n      consumed_at: iso()\n    };\n    envelope.state = "SUBMITTED";\n    envelope.submitted_notional_eur = envelope.authorized_notional_eur;\n    envelope.updated_at = iso();\n    envelope.retry_allowed = false;\n    audit(envelope, "SUBMIT_PAPER", {\n      notional_eur: envelope.submitted_notional_eur,\n      authorization_key_hash: envelope.authorization.key,\n      authorization_source: envelope.authorization.source,\n      authorization_consumed_once: true\n    });\n    return envelope;\n  }'''
paper=once(paper,old_submit,new_submit,'single-use submit')

paper=once(paper,
'''  function diagnosticSnapshot() {\n    return { build: BUILD, live_ids: [...LIVE_IDS], audit: clone(AUDIT) || [] };\n  }\n\n  function restoreInternal(snapshot) {\n    AUDIT.splice(0, AUDIT.length, ...(clone(snapshot?.audit) || []));\n    LIVE_IDS.clear();\n    for (const id of snapshot?.live_ids || []) LIVE_IDS.add(id);\n  }''',
'''  function diagnosticSnapshot() {\n    return {\n      build: BUILD,\n      live_ids: [...LIVE_IDS],\n      consumed_authorizations: [...CONSUMED_AUTHORIZATIONS],\n      audit: clone(AUDIT) || []\n    };\n  }\n\n  function restoreInternal(snapshot) {\n    AUDIT.splice(0, AUDIT.length, ...(clone(snapshot?.audit) || []));\n    LIVE_IDS.clear();\n    for (const id of snapshot?.live_ids || []) LIVE_IDS.add(id);\n    CONSUMED_AUTHORIZATIONS.clear();\n    for (const key of snapshot?.consumed_authorizations || []) CONSUMED_AUTHORIZATIONS.add(key);\n  }''','diagnostic authorization preservation')

paper=once(paper,
'''Trade Envelope unique · Safety Governor commun sur nouvelles entrées · ACK · partial fill · reconciliation · protection · clôture. Gate 40.6.14.''',
'''Trade Envelope unique · Safety Governor commun · autorisation consommable une seule fois · ACK · fill · reconciliation · protection · clôture. Gate 40.6.15.''','UI subtitle')
paper=once(paper,
'''PAPER ONLY · Safety Governor obligatoire pour CREATE/SUBMIT · une position déjà soumise reste réconciliable/closable · aucun réseau · aucun Kraken · aucune clé.''',
'''PAPER ONLY · Safety Governor + autorisation unique obligatoires au SUBMIT · une autorisation consommée ne renaît pas après clôture · aucun réseau · aucun Kraken.''','UI safety')

paper=once(paper,
'''    safety_gate_snapshot: safetyGateSnapshot,\n    render,''',
'''    safety_gate_snapshot: safetyGateSnapshot,\n    authorization_snapshot: authorizationSnapshot,\n    render,''','api authorization snapshot')
paper=once(paper,
'''    existing_submitted_monitoring_preserved: true\n  });''',
'''    existing_submitted_monitoring_preserved: true,\n    single_use_authorization_406015: true,\n    authorization_consumed_at_submit: true,\n    authorization_reuse_forbidden: true\n  });''','api flags')
paper_path.write_text(paper,encoding='utf-8')

# Index truth + Paper-only cache bust. Oracle/Chronos/width wiring remains frozen.
index=index_path.read_text(encoding='utf-8')
protected=[
 'oracle-presentation-405010.css?v=administrator-build-40.6.13',
 'oracle-fx-406013.css?v=administrator-build-40.6.13',
 'oracle-fx-406013.js?v=administrator-build-40.6.13',
 'grid-template-columns:minmax(128px,.66fr) minmax(124px,.66fr) minmax(170px,.94fr) minmax(255px,1.35fr) minmax(410px,2.05fr)!important;'
]
for t in protected:
    if t not in index: raise SystemExit(f'STOP {BUILD}: protected index contract missing: {t}')
for old,new,label in [
 ('<meta name="atlas-build" content="40.6.14" />','<meta name="atlas-build" content="40.6.15" />','atlas meta'),
 ('<meta name="administrator-build" content="40.6.14" />','<meta name="administrator-build" content="40.6.15" />','admin meta'),
 ('<meta name="administrator-release" content="PAPER COMMON SAFETY GATE · CORE FREEZE" />',f'<meta name="administrator-release" content="{RELEASE}" />','release meta'),
 ('<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.14" />',f'<meta name="atlas-asset-token" content="{TOKEN}" />','asset token'),
 ('<title>Agent-Crypto @erith.IA — Build 40.6.14 · Administrator</title>','<title>Agent-Crypto @erith.IA — Build 40.6.15 · Administrator</title>','title'),
 ('./js/strategy-a-paper-lifecycle-404295.js?v=administrator-build-40.5.23','./js/strategy-a-paper-lifecycle-404295.js?v=administrator-build-40.6.15','paper cache bust')
]: index=once(index,old,new,label)
index,n1=re.subn(r'(id="atlasVersionTruthControl"[\s\S]{0,700}?aria-label="Version Agent-Crypto installée : Build )[^,\"]+(, mode Administrator\")',r'\g<1>40.6.15\g<2>',index,count=1)
index,n2=re.subn(r'(<span id="atlasVersionTruthText">Build )[^<]+(</span>)',r'\g<1>40.6.15\g<2>',index,count=1)
if n1!=1 or n2!=1: raise SystemExit(f'STOP {BUILD}: version badge mismatch')
index_path.write_text(index,encoding='utf-8')

release_path=ROOT/'RELEASE_40_6_15.md'
release_path.write_text(f'''# Agent-Crypto @erith.IA — Build {BUILD}\n\n## {RELEASE}\n\nParent: **{PARENT}**  \nMarket Core: **{ENGINE} protected**\n\n### Correction\nLe propriétaire Paper consomme désormais une autorisation logique exactement une fois au passage `RISK_APPROVED → SUBMITTED`.\n\nPriorité d’identité : `risk_id` → `decision_id` → `proposal_id`. Les valeurs UNKNOWN sont ignorées.\n\n- première soumission : autorisation consommée ;\n- réutilisation par un autre trade : `AUTHORIZATION_ALREADY_CONSUMED` ;\n- absence totale d’identité : `AUTHORIZATION_ID_REQUIRED` ;\n- clôture, cancel ou reject d’exécution ne libèrent jamais une autorisation déjà consommée ;\n- le self-test sauvegarde/restaure le registre pour ne jamais polluer le runtime ;\n- cache-bust appliqué uniquement au propriétaire Paper.\n\n### Gel dur préservé\nOracle 40.6.13 + FX, Chronos 40.6.9, Version Truth 40.6.8 code, largeur 40.6.10, Graphique, Lecture Technique, Window Manager et Market Core {ENGINE} restent intouchés.\n''',encoding='utf-8')

docs={n:load(n) for n in ('build.json','administrator-version.json','version.json')}
for n,d in docs.items():
    d['build']=BUILD; d['release']=RELEASE; d['status']=STATUS; d['parent_build']=PARENT; d['asset_token']=TOKEN
    if 'administrator_build' in d:d['administrator_build']=BUILD
    if 'build_label' in d:d['build_label']=f'Build {BUILD}'
    if 'release_status' in d:d['release_status']=RELEASE
    for k in ('timestamp','prepared_at','published_at'):
        if k in d:d[k]=NOW
    if isinstance(d.get('current_version_truth'),dict): d['current_version_truth']['loaded_build']=BUILD
    d['cascade_40_6_15']={
      'parent_build':PARENT,'release':RELEASE,'paper_owner':'js/strategy-a-paper-lifecycle-404295.js',
      'single_use_authorization':True,'authorization_priority':['risk_id','decision_id','proposal_id'],
      'unknown_authorization_ignored':True,'consume_stage':'SUBMIT','reuse_forbidden':True,
      'release_on_close':False,'diagnostic_state_preserved':True,'paper_cache_bust':BUILD,
      'market_core_modified':False,'oracle_modified':False,'chronos_modified':False,
      'version_truth_code_modified':False,'graph_modified':False,'technical_reading_modified':False,
      'window_manager_modified':False,'network_added':False,'real_order':False
    }
for n in ('build.json','administrator-version.json'):
    (ROOT/n).write_text(json.dumps(docs[n],ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
ver=docs['version.json']; files=ver.setdefault('files',{})
for rel in ('index.html','js/strategy-a-paper-lifecycle-404295.js','js/strategy-a-safety-certification-404299.js','js/strategy-a-auto-lifecycle-bridge-404297.js','build.json','administrator-version.json','RELEASE_40_6_15.md'):
    files[rel]=sha(ROOT/rel)
(ROOT/'version.json').write_text(json.dumps(ver,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

for p,before in freeze.items():
    if p.read_bytes()!=before: raise SystemExit(f'STOP {BUILD}: protected owner changed: {p}')
final=index_path.read_text(encoding='utf-8')
for t in protected:
    if t not in final: raise SystemExit(f'STOP {BUILD}: protected index contract changed: {t}')
if './js/strategy-a-paper-lifecycle-404295.js?v=administrator-build-40.6.15' not in final: raise SystemExit(f'STOP {BUILD}: Paper cache bust missing')
if str(load('build.json').get('engine'))!=ENGINE: raise SystemExit(f'STOP {BUILD}: Market Core drift')
if 'single_use_authorization_406015: true' not in paper_path.read_text(encoding='utf-8'): raise SystemExit(f'STOP {BUILD}: single-use flag missing')

OUTDIR.mkdir(parents=True,exist_ok=True)
out=OUTDIR/'AGENT_CRYPTO_BUILD_40_6_15_SINGLE_USE_AUTHORIZATION_CLEAN_UPLOAD_8_FILES.zip'
rels=['index.html','js/strategy-a-paper-lifecycle-404295.js','js/strategy-a-safety-certification-404299.js','js/strategy-a-auto-lifecycle-bridge-404297.js','build.json','administrator-version.json','version.json','RELEASE_40_6_15.md']
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for rel in rels:z.write(ROOT/rel,(Path('public/agent_crypto_erith_ia/administrator')/rel).as_posix())
digest=sha(out); Path(str(out)+'.sha256').write_text(f'{digest}  {out.name}\n',encoding='utf-8')
print(json.dumps({'ok':True,'build':BUILD,'zip':str(out),'sha256':digest,'single_use_authorization':True,'protected_owners_modified':False},ensure_ascii=False))
