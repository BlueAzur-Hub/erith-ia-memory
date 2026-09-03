#!/usr/bin/env python3
from pathlib import Path
import json, subprocess

REPO=Path('.')
ADMIN=REPO/'public/agent_crypto_erith_ia/administrator'
ADMIN_JS=ADMIN/'js/app.js'
GUARD=REPO/'.github/scripts/agent_crypto_version_truth_guard.py'
DOCS=REPO/'coordination/inter_ai_dialogues/agent_crypto'
WORKFLOW=REPO/'.github/workflows/agent-crypto-40-4-218-version-writer-audit.yml'
AUDIT=REPO/'.github/scripts/_tmp_agent_crypto_404218_audit.py'
SELF=REPO/'.github/scripts/_tmp_agent_crypto_404218_release.py'


def run(*args):
    print('+',*map(str,args),flush=True)
    subprocess.run([str(x) for x in args],check=True)

def once(text,old,new,label):
    n=text.count(old)
    if n!=1: raise SystemExit(f'STOP {label}: expected 1, got {n}')
    return text.replace(old,new,1)

run('python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.217')

# 40.4.211 already established a single global release authority. Audit 40.4.218
# proves market-stack no longer writes the badge, root app owns runtime truth/failure
# states, and version-truth owns published-version reconciliation. Retire the old
# compatibility MutationObserver that only reverted a historical Market Core label.
text=ADMIN_JS.read_text(encoding='utf-8')
before={
    'MutationObserver':text.count('MutationObserver'),
    'fetch(':text.count('fetch('),
    'setInterval(':text.count('setInterval('),
    'setTimeout(':text.count('setTimeout('),
    'WebSocket':text.count('WebSocket'),
    'requestAnimationFrame(':text.count('requestAnimationFrame('),
    'addEventListener(':text.count('addEventListener('),
}
old='''  function keepGlobalVersionVisible() {
    const versionText = byId("atlasVersionControlText");
    const observer = versionText ? new MutationObserver(() => {
      const text = String(versionText.textContent || "");
      if (/Market Core V2\\.0-Alpha\\s*·\\s*Build 38\\.15\\.11/i.test(text)) {
        versionText.textContent = `Build ${ADMIN_BUILD} · Administrator`;
      }
    }) : null;
    if (versionText) observer.observe(versionText, { childList: true, characterData: true, subtree: true });
  }

'''
text=once(text,old,'','legacy global-version compatibility observer')
text=once(text,'    keepGlobalVersionVisible();\n','','legacy global-version compatibility boot call')
after={
    'MutationObserver':text.count('MutationObserver'),
    'fetch(':text.count('fetch('),
    'setInterval(':text.count('setInterval('),
    'setTimeout(':text.count('setTimeout('),
    'WebSocket':text.count('WebSocket'),
    'requestAnimationFrame(':text.count('requestAnimationFrame('),
    'addEventListener(':text.count('addEventListener('),
}
if after['MutationObserver'] != before['MutationObserver']-1:
    raise SystemExit(f'STOP expected exactly one MutationObserver retirement: {before} -> {after}')
for key in ('fetch(','setInterval(','setTimeout(','WebSocket','requestAnimationFrame(','addEventListener('):
    if after[key]!=before[key]: raise SystemExit(f'STOP {key} budget drift: {before[key]} -> {after[key]}')
if 'keepGlobalVersionVisible' in text:
    raise SystemExit('STOP legacy version observer remains')
ADMIN_JS.write_text(text,encoding='utf-8')

# Confirm current version authorities before publishing.
market=(ADMIN/'js/market-stack.js').read_text(encoding='utf-8')
truth=(ADMIN/'js/version-truth.js').read_text(encoding='utf-8')
root=(ADMIN/'app.js').read_text(encoding='utf-8')
if 'atlasVersionControlText' in market:
    raise SystemExit('STOP market-stack regained global badge ownership')
if 'function patchVersionControl(remote)' not in truth or 'atlasVersionControlText' not in truth:
    raise SystemExit('STOP version-truth authority missing')
if 'function atlasVersionControlElements()' not in root or 'atlasVersionControlText' not in root:
    raise SystemExit('STOP root runtime version truth authority missing')

# Future guard: no resurrection of the compatibility observer or market-stack badge write.
guard=GUARD.read_text(encoding='utf-8')
anchor='''    files = manifest.get("files")'''
insert='''    if current_num >= (40, 4, 218):
        if "keepGlobalVersionVisible" in admin_js:
            fail("40.4.218 retired global-version compatibility observer restored")
        market_stack = read(base / "js/market-stack.js")
        if "atlasVersionControlText" in market_stack:
            fail("40.4.218 market-stack global badge writer restored")
        version_truth = read(base / "js/version-truth.js")
        if "function patchVersionControl(remote)" not in version_truth or "atlasVersionControlText" not in version_truth:
            fail("40.4.218 version-truth global authority missing")
        if "function installGlobalVersionIdentity()" not in admin_js or "atlasVersionControlText" not in admin_js:
            fail("40.4.218 Administrator first-runtime version authority missing")

    files = manifest.get("files")'''
if guard.count(anchor)!=1: raise SystemExit(f'STOP guard anchor count={guard.count(anchor)}')
guard=guard.replace(anchor,insert,1)
GUARD.write_text(guard,encoding='utf-8')

# Continuity docs.
manifest=DOCS/'AGENT_CRYPTO_RELEASE_MANIFEST.md'
t=manifest.read_text(encoding='utf-8')
t=once(t,'Release courante : **40.4.217**','Release courante : **40.4.218**','manifest release')
t=once(t,'commit final 40.4.217','commit final 40.4.218','manifest archive')
if '40.4.218 est une release de **Version Observer Retirement**' not in t:
    t += '\n40.4.218 est une release de **Version Observer Retirement** : l’ancien `MutationObserver` de compatibilité qui surveillait en permanence le badge global pour corriger un ancien libellé Market Core est retiré. Depuis 40.4.211, `market-stack.js` ne possède plus ce badge ; `version-truth.js`, le runtime racine et l’identité Administrator restent les autorités explicites. Aucun changement de Market Core, Atlas, données ou géométrie.\n'
manifest.write_text(t,encoding='utf-8')

prompt=DOCS/'PROMPT_REPRISE_AETHER_AGENT_CRYPTO.md'
t=prompt.read_text(encoding='utf-8')
t=once(t,'Version de reprise : **40.4.217**','Version de reprise : **40.4.218**','prompt version')
marker='''40.4.217 verrouille la **délégation événementielle du Market Snapshot Core** : les clics/clavier de lignes et les actions Solo/Suivi/Alerte/Sources sont possédés par un listener stable du conteneur, au lieu de recréer un listener par ligne/bouton à chaque rendu. L’Extended garde son propriétaire délégué 40.3.116.\n'''
addition='''\n40.4.218 retire le **MutationObserver de compatibilité du badge global** devenu sans propriétaire adversaire après 40.4.211. `version-truth.js` conserve la réconciliation publiée, le runtime racine conserve les états de cohérence/publication skew et l’Administrator conserve le first-runtime identity. `market-stack.js` reste interdit d’écriture sur `#atlasVersionControlText`.\n'''
if '40.4.218 retire le **MutationObserver de compatibilité du badge global**' not in t:
    t=once(t,marker,marker+addition,'prompt 218 append')
prompt.write_text(t,encoding='utf-8')

ledger=DOCS/'AGENT_CRYPTO_FIN_DE_FIL_AETHER.md'
t=ledger.read_text(encoding='utf-8')
t=once(t,'Version canonique de clôture : **40.4.217**','Version canonique de clôture : **40.4.218**','ledger version')
t=once(t,'## 1. Cascade finale 40.4.205 → 40.4.217','## 1. Cascade finale 40.4.205 → 40.4.218','ledger heading')
marker='''- **40.4.217** — Market Table Event Delegation : retrait du fan-out de listeners Core recréés après chaque `innerHTML`; un propriétaire stable du conteneur conserve les mêmes actions ligne/boutons et réduit le travail de rendu/interactivité.\n'''
addition='''- **40.4.218** — Version Observer Retirement : suppression du `MutationObserver` de compatibilité du badge global devenu redondant depuis la Single Authority 40.4.211 ; autorités runtime/publication conservées et `market-stack.js` toujours exclu du badge global.\n'''
if '- **40.4.218**' not in t:
    t=once(t,marker,marker+addition,'ledger 218 append')
ledger.write_text(t,encoding='utf-8')

contract={
  'build':'40.4.218','scope':'global_version_compatibility_observer_retirement','market_core':'38.15.11',
  'single_authority_404211_preserved':True,'market_stack_global_badge_writer':False,
  'version_truth_authority_preserved':True,'root_runtime_truth_authority_preserved':True,
  'administrator_identity_authority_preserved':True,'compatibility_mutation_observer_retired':True,
  'data_change':False,'geometry_change':False,'atlas_behavior_change':False,'market_behavior_change':False,
  'fetch_added':False,'timer_added':False,'observer_delta':-1,'websocket_added':False,'raf_added':False
}
cp=Path('/tmp/contract404218.json'); cp.write_text(json.dumps(contract,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
run('python','.github/scripts/agent_crypto_release_driver.py',
    '--build','40.4.218','--parent','40.4.217',
    '--release','VERSION OBSERVER RETIREMENT · SINGLE AUTHORITY CLEANUP LOCK',
    '--status','version_observer_retirement_404218_operator_validation_required',
    '--contract-key','version_observer_retirement_404218','--contract-json',str(cp),
    '--lineage-note','40.4.218 retires the obsolete global-version compatibility MutationObserver after 40.4.211 single-authority convergence; explicit runtime/publication version owners remain.')

run('node','--check',str(ADMIN_JS)); run('node','--check',str(ADMIN/'app.js'))
run('python','-m','py_compile','.github/scripts/agent_crypto_version_truth_guard.py','.github/scripts/agent_crypto_release_driver.py')
run('python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.218')
if subprocess.run(['bash','-lc',"git diff --name-only | grep '^public/agent_crypto_erith_ia/data/'"],capture_output=True).returncode==0:
    raise SystemExit('STOP data files changed')
run('git','diff','--check')

run('git','config','user.name','Aether Release'); run('git','config','user.email','41898282+github-actions[bot]@users.noreply.github.com')
for p in (WORKFLOW,AUDIT,SELF): run('git','rm',str(p))
for p in (GUARD,ADMIN_JS,ADMIN/'app.js',ADMIN/'index.html',ADMIN/'version.json',ADMIN/'administrator-version.json',ADMIN/'build.json',manifest,prompt,ledger): run('git','add',str(p))
run('git','commit','-m','release(agent-crypto): 40.4.218 retire legacy version observer')
run('git','pull','--rebase','origin','main')
run('python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.218')
run('git','push','origin','HEAD:main')
print(json.dumps({'ok':True,'build':'40.4.218','market_core':'38.15.11','observer_delta':-1},ensure_ascii=False))
