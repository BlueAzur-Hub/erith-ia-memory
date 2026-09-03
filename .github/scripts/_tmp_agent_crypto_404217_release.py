#!/usr/bin/env python3
from pathlib import Path
import json, subprocess

REPO=Path('.')
ADMIN=REPO/'public/agent_crypto_erith_ia/administrator'
ROOT=ADMIN/'app.js'
GUARD=REPO/'.github/scripts/agent_crypto_version_truth_guard.py'
DOCS=REPO/'coordination/inter_ai_dialogues/agent_crypto'
WORKFLOW=REPO/'.github/workflows/agent-crypto-40-4-217-audit.yml'
AUDIT=REPO/'.github/scripts/_tmp_agent_crypto_404217_audit.py'
SELF=REPO/'.github/scripts/_tmp_agent_crypto_404217_release.py'


def run(*args):
    print('+',*map(str,args),flush=True)
    subprocess.run([str(x) for x in args],check=True)

def once(text,old,new,label):
    n=text.count(old)
    if n!=1: raise SystemExit(f'STOP {label}: expected 1, got {n}')
    return text.replace(old,new,1)

run('python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.216')

app=ROOT.read_text(encoding='utf-8')
budget_keys=('fetch(','setInterval(','setTimeout(','MutationObserver','IntersectionObserver','new WebSocket','requestAnimationFrame(','localStorage.setItem','sessionStorage.setItem')
before={k:app.count(k) for k in budget_keys}
before_add=app.count('addEventListener(')

start='''  [...els.marketRows.querySelectorAll("tr[data-id]")].forEach(row=>{'''
end='''  atlasMarketExtendedEnsureDelegation403116();'''
si=app.find(start)
if si<0: raise SystemExit('STOP core per-row binding start not found')
ei=app.find(end,si)
if ei<0: raise SystemExit('STOP extended delegation anchor not found')
old_block=app[si:ei]
if old_block.count('row.addEventListener("click",act);')!=1 or old_block.count('row.addEventListener("keydown",act);')!=1:
    raise SystemExit('STOP core row listener shape drift')
if old_block.count('els.marketRows.querySelectorAll("[data-market-action]").forEach')!=1:
    raise SystemExit('STOP action listener shape drift')
app=app[:si]+'  atlasMarketCoreEnsureDelegation404217();\n\n'+app[ei:]

anchor='''function renderEmptyMarket(message)'''
delegation='''/* ============================================================
   40.4.217 — MARKET TABLE CORE EVENT DELEGATION
   The Core page can render up to 100 rows. Historically every full render
   allocated click/keydown listeners per row plus one click listener per
   action button. Keep the exact operator semantics but bind one stable
   container owner for Core rows/actions, matching the already delegated
   Extended path. No data, ranking, chart, Atlas or Market Core change.
   ============================================================ */
function atlasMarketCoreEnsureDelegation404217(){
  if(!els.marketRows||els.marketRows.dataset.coreDelegation404217==="1")return;

  const activate=event=>{
    const actionButton=event.target?.closest?.("[data-market-action]");
    if(actionButton&&els.marketRows.contains(actionButton)){
      if(event.type!=="click")return;
      const row=actionButton.closest("tr[data-id]");
      if(!row)return;
      event.stopPropagation();
      const action=String(actionButton.dataset.marketAction||"");
      const coin=state.coins.find(c=>c.id===actionButton.dataset.coinId);
      atlasMarketHandleAction(action,coin,event);
      if(["open","compare"].includes(action))atlasGraphContextV7CommitMarket(`handler-market-${action}`);
      return;
    }

    const row=event.target?.closest?.("tr[data-id]");
    if(!row||!els.marketRows.contains(row))return;
    if(event.target!==row&&event.target.closest?.("button,a,input,select"))return;
    if(event.type==="keydown"){
      if(!["Enter"," "].includes(event.key))return;
      event.preventDefault();
    }
    const coin=state.coins.find(c=>c.id===row.dataset.id);
    if(!coin)return;
    atlasToggleComparisonCoin(coin);
    atlasGraphContextV7CommitMarket("handler-market-row-toggle");
  };

  els.marketRows.addEventListener("click",activate);
  els.marketRows.addEventListener("keydown",activate);
  els.marketRows.dataset.coreDelegation404217="1";
}

'''
if app.count(anchor)!=1: raise SystemExit(f'STOP renderEmpty anchor count={app.count(anchor)}')
app=app.replace(anchor,delegation+anchor,1)

if 'row.addEventListener("click",act);' in app or 'row.addEventListener("keydown",act);' in app:
    raise SystemExit('STOP legacy per-row listeners remain')
if 'els.marketRows.querySelectorAll("[data-market-action]").forEach' in app:
    raise SystemExit('STOP legacy per-action listener fanout remains')
after={k:app.count(k) for k in budget_keys}
if after!=before: raise SystemExit(f'STOP runtime primitive budget changed: {before} -> {after}')
if app.count('addEventListener(')>before_add:
    raise SystemExit(f'STOP static listener sites increased: {before_add} -> {app.count("addEventListener(")}')
ROOT.write_text(app,encoding='utf-8')

# Version Truth: preserve this hot-path ownership contract for future releases.
guard=GUARD.read_text(encoding='utf-8')
anchor_guard='''    files = manifest.get("files")'''
insert_guard='''    if current_num >= (40, 4, 217):
        required_market_delegation = (
            "40.4.217 — MARKET TABLE CORE EVENT DELEGATION",
            "function atlasMarketCoreEnsureDelegation404217()",
            'els.marketRows.dataset.coreDelegation404217==="1"',
            'els.marketRows.addEventListener("click",activate)',
            'els.marketRows.addEventListener("keydown",activate)',
        )
        for marker in required_market_delegation:
            if marker not in root:
                fail(f"40.4.217 Market table delegation regression: missing {marker}")
        retired_market_fanout = (
            'row.addEventListener("click",act);',
            'row.addEventListener("keydown",act);',
            'els.marketRows.querySelectorAll("[data-market-action]").forEach',
        )
        for marker in retired_market_fanout:
            if marker in root:
                fail(f"40.4.217 legacy Market listener fanout restored: {marker}")

    files = manifest.get("files")'''
if guard.count(anchor_guard)!=1: raise SystemExit(f'STOP guard anchor count={guard.count(anchor_guard)}')
guard=guard.replace(anchor_guard,insert_guard,1)
GUARD.write_text(guard,encoding='utf-8')

# Canonical continuity docs.
manifest=DOCS/'AGENT_CRYPTO_RELEASE_MANIFEST.md'
t=manifest.read_text(encoding='utf-8')
t=once(t,'Release courante : **40.4.216**','Release courante : **40.4.217**','manifest release')
t=once(t,'commit final 40.4.216','commit final 40.4.217','manifest archive')
if '40.4.217 est une release de **Market Table Event Delegation**' not in t:
    t += '\n40.4.217 est une release de **Market Table Event Delegation** : le Market Snapshot Core remplace le fan-out de listeners recréés à chaque rendu (lignes + boutons) par une délégation stable sur `marketRows`, en conservant les mêmes actions clavier/souris. Aucun fetch, timer, observer, WebSocket, donnée, rang, graphique, Atlas ou Market Core n’est modifié.\n'
manifest.write_text(t,encoding='utf-8')

prompt=DOCS/'PROMPT_REPRISE_AETHER_AGENT_CRYPTO.md'
t=prompt.read_text(encoding='utf-8')
t=once(t,'Version de reprise : **40.4.216**','Version de reprise : **40.4.217**','prompt version')
marker='''40.4.216 verrouille la **parité textuelle de cette couverture** : le footer secondaire du Market Snapshot réutilise `atlasMarketUniverseCoverageTruth404215()` et retire les anciens libellés de cardinalité `univers cumulé x/limit`, `Core x/250` et `Extended x/(limit-250)`. Aucun changement de données, de rang ou de comportement marché.\n'''
addition='''\n40.4.217 verrouille la **délégation événementielle du Market Snapshot Core** : les clics/clavier de lignes et les actions Solo/Suivi/Alerte/Sources sont possédés par un listener stable du conteneur, au lieu de recréer un listener par ligne/bouton à chaque rendu. L’Extended garde son propriétaire délégué 40.3.116.\n'''
if '40.4.217 verrouille la **délégation événementielle du Market Snapshot Core**' not in t:
    t=once(t,marker,marker+addition,'prompt 217 append')
prompt.write_text(t,encoding='utf-8')

ledger=DOCS/'AGENT_CRYPTO_FIN_DE_FIL_AETHER.md'
t=ledger.read_text(encoding='utf-8')
t=once(t,'Version canonique de clôture : **40.4.216**','Version canonique de clôture : **40.4.217**','ledger version')
t=once(t,'## 1. Cascade finale 40.4.205 → 40.4.216','## 1. Cascade finale 40.4.205 → 40.4.217','ledger heading')
marker='''- **40.4.216** — Market Coverage Footer Parity : le footer secondaire du Market Snapshot réutilise la vérité de couverture 40.4.215 ; suppression des ratios de cardinalité ambigus, sans modifier données, rangs ni runtime réseau.\n'''
addition='''- **40.4.217** — Market Table Event Delegation : retrait du fan-out de listeners Core recréés après chaque `innerHTML`; un propriétaire stable du conteneur conserve les mêmes actions ligne/boutons et réduit le travail de rendu/interactivité.\n'''
if '- **40.4.217**' not in t:
    t=once(t,marker,marker+addition,'ledger 217 append')
ledger.write_text(t,encoding='utf-8')

contract={
  'build':'40.4.217','scope':'market_snapshot_core_event_delegation','market_core':'38.15.11',
  'core_container_delegation':True,'extended_delegation_preserved':True,
  'row_click_semantics_preserved':True,'row_keyboard_semantics_preserved':True,
  'action_semantics_preserved':True,'per_render_listener_fanout_retired':True,
  'data_change':False,'ranking_change':False,'geometry_change':False,'atlas_behavior_change':False,
  'fetch_added':False,'timer_added':False,'observer_added':False,'websocket_added':False,'raf_added':False
}
cp=Path('/tmp/contract404217.json'); cp.write_text(json.dumps(contract,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
run('python','.github/scripts/agent_crypto_release_driver.py',
    '--build','40.4.217','--parent','40.4.216',
    '--release','MARKET TABLE EVENT DELEGATION · CORE LISTENER FANOUT RETIREMENT',
    '--status','market_table_event_delegation_404217_operator_validation_required',
    '--contract-key','market_table_event_delegation_404217','--contract-json',str(cp),
    '--lineage-note','40.4.217 retires per-render Core Market row/action listener fanout in favor of stable container delegation; Extended delegation and all market data semantics remain unchanged.')

run('node','--check',str(ROOT))
run('node','--check',str(ADMIN/'js/app.js'))
run('python','-m','py_compile','.github/scripts/agent_crypto_version_truth_guard.py','.github/scripts/agent_crypto_release_driver.py')
run('python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.217')

# Final bounded proof.
app=ROOT.read_text(encoding='utf-8')
assert '40.4.217 — MARKET TABLE CORE EVENT DELEGATION' in app
assert 'els.marketRows.dataset.coreDelegation404217="1"' in app
assert 'row.addEventListener("click",act);' not in app
assert 'els.marketRows.querySelectorAll("[data-market-action]").forEach' not in app
if subprocess.run(['bash','-lc',"git diff --name-only | grep '^public/agent_crypto_erith_ia/data/'"],capture_output=True).returncode==0:
    raise SystemExit('STOP data files changed')
run('git','diff','--check')

run('git','config','user.name','Aether Release')
run('git','config','user.email','41898282+github-actions[bot]@users.noreply.github.com')
for p in (WORKFLOW,AUDIT,SELF):
    run('git','rm',str(p))
for p in (GUARD,ROOT,ADMIN/'js/app.js',ADMIN/'index.html',ADMIN/'version.json',ADMIN/'administrator-version.json',ADMIN/'build.json',manifest,prompt,ledger):
    run('git','add',str(p))
run('git','commit','-m','release(agent-crypto): 40.4.217 market table event delegation lock')
run('git','pull','--rebase','origin','main')
run('python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.217')
run('git','push','origin','HEAD:main')
print(json.dumps({'ok':True,'build':'40.4.217','market_core':'38.15.11'},ensure_ascii=False))
