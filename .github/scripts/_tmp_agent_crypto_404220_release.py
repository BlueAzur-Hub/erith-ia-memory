#!/usr/bin/env python3
from pathlib import Path
import json, subprocess

REPO=Path('.')
ADMIN=REPO/'public/agent_crypto_erith_ia/administrator'
GUARD=REPO/'.github/scripts/agent_crypto_version_truth_guard.py'
DOCS=REPO/'coordination/inter_ai_dialogues/agent_crypto'
WORKFLOW=REPO/'.github/workflows/agent-crypto-40-4-220-atlas-heartbeat-guard.yml'
SELF=REPO/'.github/scripts/_tmp_agent_crypto_404220_release.py'


def run(*args):
    print('+',*map(str,args),flush=True)
    subprocess.run([str(x) for x in args],check=True)

def once(text,old,new,label):
    n=text.count(old)
    if n!=1: raise SystemExit(f'STOP {label}: expected 1, got {n}')
    return text.replace(old,new,1)

run('python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.219')

heartbeat_path=ADMIN/'js/atlas-heartbeat-rearm.js'
heartbeat=heartbeat_path.read_text(encoding='utf-8')
required=(
    'ATLAS HEARTBEAT · BOOT-COMPLETE ONE-SHOT REARM',
    'queueMicrotask(() => rearm("boot-complete"))',
    'window.addEventListener("load", autoRearm, {once:true})',
    'canonical_pending_owner:"atlasCurrentPendingMarket137"',
    'fallback_existing_owner:"atlasCurrentPendingAutoKick4051"',
    'strategy:"boot-complete-one-shot-canonical-rearm"',
    'new_timer:false', 'new_observer:false', 'new_fetch:false', 'new_websocket:false', 'new_scheduler:false'
)
for marker in required:
    if marker not in heartbeat: raise SystemExit(f'STOP Atlas heartbeat baseline missing {marker}')
for forbidden in ('fetch(','setInterval(','setTimeout(','new MutationObserver(','new IntersectionObserver(','new WebSocket(','requestAnimationFrame('):
    if forbidden in heartbeat: raise SystemExit(f'STOP Atlas heartbeat owns forbidden executable primitive: {forbidden}')
if heartbeat.count('addEventListener(')!=1:
    raise SystemExit(f'STOP Atlas heartbeat listener count drift: {heartbeat.count("addEventListener(")}')

# Make the already-proven 40.4.212 one-shot Atlas CURRENT contract a permanent Version Truth invariant.
guard=GUARD.read_text(encoding='utf-8')
anchor='''    files = manifest.get("files")'''
insert='''    if current_num >= (40, 4, 220):
        atlas_heartbeat = read(base / "js/atlas-heartbeat-rearm.js")
        required_atlas_heartbeat = (
            "ATLAS HEARTBEAT · BOOT-COMPLETE ONE-SHOT REARM",
            'queueMicrotask(() => rearm("boot-complete"))',
            'window.addEventListener("load", autoRearm, {once:true})',
            'canonical_pending_owner:"atlasCurrentPendingMarket137"',
            'fallback_existing_owner:"atlasCurrentPendingAutoKick4051"',
            'strategy:"boot-complete-one-shot-canonical-rearm"',
            "new_timer:false",
            "new_observer:false",
            "new_fetch:false",
            "new_websocket:false",
            "new_scheduler:false",
        )
        for marker in required_atlas_heartbeat:
            if marker not in atlas_heartbeat:
                fail(f"40.4.220 Atlas heartbeat one-shot contract regression: missing {marker}")
        forbidden_atlas_heartbeat = (
            "fetch(",
            "setInterval(",
            "setTimeout(",
            "new MutationObserver(",
            "new IntersectionObserver(",
            "new WebSocket(",
            "requestAnimationFrame(",
        )
        for marker in forbidden_atlas_heartbeat:
            if marker in atlas_heartbeat:
                fail(f"40.4.220 Atlas heartbeat gained forbidden runtime primitive: {marker}")
        if atlas_heartbeat.count("addEventListener(") != 1:
            fail(f"40.4.220 Atlas heartbeat listener owner drift: {atlas_heartbeat.count('addEventListener(')}")

    files = manifest.get("files")'''
if guard.count(anchor)!=1: raise SystemExit(f'STOP guard files anchor count={guard.count(anchor)}')
guard=guard.replace(anchor,insert,1)
GUARD.write_text(guard,encoding='utf-8')

release_manifest=DOCS/'AGENT_CRYPTO_RELEASE_MANIFEST.md'
t=release_manifest.read_text(encoding='utf-8')
t=once(t,'Release courante : **40.4.219**','Release courante : **40.4.220**','manifest release')
t=once(t,'commit final 40.4.219','commit final 40.4.220','manifest archive')
if '40.4.220 est une release de **Atlas Heartbeat Owner Guard**' not in t:
    t += '\n40.4.220 est une release de **Atlas Heartbeat Owner Guard** : le Version Truth Guard protège désormais explicitement le contrat Atlas CURRENT 40.4.212 — réarmement unique après `load`, via les propriétaires canoniques existants, sans fetch, timer, observer, WebSocket, rAF ni scheduler ajouté. Le payload Atlas reste inchangé.\n'
release_manifest.write_text(t,encoding='utf-8')

prompt=DOCS/'PROMPT_REPRISE_AETHER_AGENT_CRYPTO.md'
t=prompt.read_text(encoding='utf-8')
t=once(t,'Version de reprise : **40.4.219**','Version de reprise : **40.4.220**','prompt version')
marker='''40.4.219 étend la **Version Truth aux assets réellement chargés** : chaque JavaScript/CSS local référencé par `index.html` doit désormais être présent dans la table SHA-256 de `version.json`. Cette couverture inclut les anciens propriétaires chargés mais jusque-là hors manifest ; aucune URL de cache ni logique métier n’est modifiée.\n'''
addition='''\n40.4.220 verrouille le **propriétaire Atlas Heartbeat CURRENT** : `atlas-heartbeat-rearm.js` doit rester un réarmement boot-complete one-shot qui réutilise `atlasCurrentPendingMarket137` (fallback existant `atlasCurrentPendingAutoKick4051`) et ne peut acquérir fetch, timer, observer, WebSocket, rAF ou scheduler. Le guard surveille désormais cette forme à chaque release.\n'''
if '40.4.220 verrouille le **propriétaire Atlas Heartbeat CURRENT**' not in t:
    t=once(t,marker,marker+addition,'prompt 220 append')
prompt.write_text(t,encoding='utf-8')

ledger=DOCS/'AGENT_CRYPTO_FIN_DE_FIL_AETHER.md'
t=ledger.read_text(encoding='utf-8')
t=once(t,'Version canonique de clôture : **40.4.219**','Version canonique de clôture : **40.4.220**','ledger version')
t=once(t,'## 1. Cascade finale 40.4.205 → 40.4.219','## 1. Cascade finale 40.4.205 → 40.4.220','ledger heading')
marker='''- **40.4.219** — Loaded Asset Manifest Coverage : tous les JavaScript/CSS locaux chargés par le shell Administrator sont désormais sous hash SHA-256 canonique ; le guard refuse tout futur asset chargé hors autorité du manifest.\n'''
addition='''- **40.4.220** — Atlas Heartbeat Owner Guard : le contrat one-shot CURRENT 40.4.212 devient invariant de CI ; propriétaire canonique, fallback existant et absence de primitives récurrentes/réseau sont vérifiés à chaque release.\n'''
if '- **40.4.220**' not in t:
    t=once(t,marker,marker+addition,'ledger 220 append')
ledger.write_text(t,encoding='utf-8')

contract={
  'build':'40.4.220','scope':'atlas_current_heartbeat_owner_guard','market_core':'38.15.11',
  'atlas_heartbeat_payload_modified':False,'boot_complete_one_shot_required':True,
  'canonical_pending_owner_required':'atlasCurrentPendingMarket137',
  'existing_fallback_owner_required':'atlasCurrentPendingAutoKick4051',
  'load_listener_once_required':True,'queue_microtask_rearm_required':True,
  'fetch_forbidden':True,'timer_forbidden':True,'observer_forbidden':True,
  'websocket_forbidden':True,'raf_forbidden':True,'scheduler_forbidden':True,
  'data_change':False,'geometry_change':False,'atlas_behavior_change':False,'market_behavior_change':False
}
cp=Path('/tmp/contract404220.json'); cp.write_text(json.dumps(contract,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
run('python','.github/scripts/agent_crypto_release_driver.py',
    '--build','40.4.220','--parent','40.4.219',
    '--release','ATLAS HEARTBEAT OWNER GUARD · ONE-SHOT CURRENT LOCK',
    '--status','atlas_heartbeat_owner_guard_404220_operator_validation_required',
    '--contract-key','atlas_heartbeat_owner_guard_404220','--contract-json',str(cp),
    '--lineage-note','40.4.220 turns the proven 40.4.212 Atlas CURRENT boot-complete one-shot rearm shape into a permanent Version Truth invariant without modifying the Atlas heartbeat payload.')

run('node','--check',str(ADMIN/'app.js')); run('node','--check',str(ADMIN/'js/app.js')); run('node','--check',str(heartbeat_path))
run('python','-m','py_compile','.github/scripts/agent_crypto_version_truth_guard.py','.github/scripts/agent_crypto_release_driver.py')
run('python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.220')
# Prove heartbeat payload bytes themselves did not change in the release diff.
changed=subprocess.run(['git','diff','--name-only'],capture_output=True,text=True,check=True).stdout.splitlines()
if 'public/agent_crypto_erith_ia/administrator/js/atlas-heartbeat-rearm.js' in changed:
    raise SystemExit('STOP Atlas heartbeat payload changed during guard-only release')
if any(x.startswith('public/agent_crypto_erith_ia/data/') for x in changed):
    raise SystemExit('STOP data files changed')
run('git','diff','--check')

run('git','config','user.name','Aether Release'); run('git','config','user.email','41898282+github-actions[bot]@users.noreply.github.com')
run('git','rm',str(WORKFLOW)); run('git','rm',str(SELF))
for p in (GUARD,ADMIN/'app.js',ADMIN/'js/app.js',ADMIN/'index.html',ADMIN/'version.json',ADMIN/'administrator-version.json',ADMIN/'build.json',release_manifest,prompt,ledger): run('git','add',str(p))
run('git','commit','-m','release(agent-crypto): 40.4.220 guard Atlas heartbeat one-shot owner')
run('git','pull','--rebase','origin','main')
run('python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.220')
run('git','push','origin','HEAD:main')
print(json.dumps({'ok':True,'build':'40.4.220','market_core':'38.15.11','atlas_payload_changed':False},ensure_ascii=False))
