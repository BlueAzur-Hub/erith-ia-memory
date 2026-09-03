#!/usr/bin/env python3
from pathlib import Path
import json
import subprocess

REPO=Path('.')
ADMIN=REPO/'public/agent_crypto_erith_ia/administrator'
WORKFLOW=REPO/'.github/workflows/agent-crypto-40-4-216-footer-parity.yml'
SELF=REPO/'.github/scripts/_tmp_agent_crypto_404216.py'


def run(*args):
    print('+', *map(str,args), flush=True)
    subprocess.run([str(a) for a in args], check=True)


def once(text, old, new, label):
    count=text.count(old)
    if count != 1:
        raise SystemExit(f'STOP {label}: expected 1, found {count}')
    return text.replace(old,new,1)


run('python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.215')

app_path=ADMIN/'app.js'
app=app_path.read_text(encoding='utf-8')
budget_keys=('setInterval(','setTimeout(','MutationObserver','IntersectionObserver','fetch(','new WebSocket','requestAnimationFrame(','localStorage.setItem')
before={k:app.count(k) for k in budget_keys}
old='''  const universeText=limit>250
    ?`univers cumulé ${logicalCount}/${limit} · Core ${coreCount}/250 + Extended ${extendedCount}/${Math.max(0,limit-250)}`
    :`Core ${coreCount}/250 · vue ${limit}`;'''
new='''  /* 40.4.216 — MARKET COVERAGE FOOTER PARITY.
     Reuse the 40.4.215 provider-rank truth in the secondary Market footer.
     No exact-cardinality promise, synthetic rank or data mutation. */
  const coverageFooter404216=atlasMarketUniverseCoverageTruth404215(limit);
  const coverageFooterTie404216=coverageFooter404216.duplicateRankPositions
    ?` · ${coverageFooter404216.duplicateRankPositions} rangs ex æquo`
    :"";
  const universeText=limit>250
    ?`rang ≤ ${limit} : ${coverageFooter404216.assetCount} actifs uniques · ${coverageFooter404216.uniqueRankCount} rangs distincts${coverageFooterTie404216} · max observé ${coverageFooter404216.maxRank??"—"} · Core ${coreCount} + Extended ${extendedCount}`
    :`Core rang ≤ ${limit} : ${coverageFooter404216.assetCount} actifs uniques · ${coverageFooter404216.uniqueRankCount} rangs distincts${coverageFooterTie404216} · max observé ${coverageFooter404216.maxRank??"—"}`;'''
app=once(app,old,new,'residual Market footer semantics')
after={k:app.count(k) for k in budget_keys}
if after != before:
    raise SystemExit(f'STOP runtime owner budget changed: {before} -> {after}')
if 'univers cumulé ${logicalCount}/${limit}' in app:
    raise SystemExit('STOP legacy cumulative-cardinality footer remains')
if 'Core ${coreCount}/250 · vue ${limit}' in app:
    raise SystemExit('STOP legacy Core cardinality footer remains')
app_path.write_text(app,encoding='utf-8')

guard_path=REPO/'.github/scripts/agent_crypto_version_truth_guard.py'
guard=guard_path.read_text(encoding='utf-8')
anchor='''    files = manifest.get("files")'''
insert='''    if current_num >= (40, 4, 216):
        required_footer = (
            "40.4.216 — MARKET COVERAGE FOOTER PARITY",
            "coverageFooter404216=atlasMarketUniverseCoverageTruth404215(limit)",
            "rang ≤ ${limit} : ${coverageFooter404216.assetCount} actifs uniques",
            "Core rang ≤ ${limit} : ${coverageFooter404216.assetCount} actifs uniques",
            "max observé ${coverageFooter404216.maxRank",
        )
        for marker in required_footer:
            if marker not in root:
                fail(f"40.4.216 Market coverage footer parity regression: missing {marker}")
        legacy_footer = (
            "univers cumulé ${logicalCount}/${limit}",
            "Core ${coreCount}/250 · vue ${limit}",
        )
        for marker in legacy_footer:
            if marker in root:
                fail(f"40.4.216 legacy cardinality footer restored: {marker}")

    files = manifest.get("files")'''
if guard.count(anchor) != 1:
    raise SystemExit(f'STOP guard anchor count={guard.count(anchor)}')
guard=guard.replace(anchor,insert,1)
guard_path.write_text(guard,encoding='utf-8')

docs=REPO/'coordination/inter_ai_dialogues/agent_crypto'
manifest_path=docs/'AGENT_CRYPTO_RELEASE_MANIFEST.md'
text=manifest_path.read_text(encoding='utf-8')
text=once(text,'Release courante : **40.4.215**','Release courante : **40.4.216**','manifest release')
text=once(text,'commit final 40.4.215','commit final 40.4.216','manifest archive')
if '40.4.216 est une release de **Market Coverage Footer Parity**' not in text:
    text += '\n40.4.216 est une release de **Market Coverage Footer Parity** : le footer secondaire du Market Snapshot réutilise la vérité de couverture 40.4.215 et ne présente plus un plafond de rang fournisseur comme une cardinalité exacte (`991/1000`, `249/250`, `742/750`). Aucun rang ni actif n’est modifié.\n'
manifest_path.write_text(text,encoding='utf-8')

prompt_path=docs/'PROMPT_REPRISE_AETHER_AGENT_CRYPTO.md'
text=prompt_path.read_text(encoding='utf-8')
text=once(text,'Version de reprise : **40.4.215**','Version de reprise : **40.4.216**','prompt version')
marker='''40.4.215 verrouille la **vérité de couverture Market** : 50/100/250/500/1000 sont des plafonds de rang CoinGecko, pas des nombres de lignes garantis. Les rangs ex æquo sont préservés, les actifs sont uniques par ID, la couverture réelle expose rangs distincts/max observé et aucun rang manquant n’est fabriqué.\n'''
addition='''\n40.4.216 verrouille la **parité textuelle de cette couverture** : le footer secondaire du Market Snapshot réutilise `atlasMarketUniverseCoverageTruth404215()` et retire les anciens libellés de cardinalité `univers cumulé x/limit`, `Core x/250` et `Extended x/(limit-250)`. Aucun changement de données, de rang ou de comportement marché.\n'''
if '40.4.216 verrouille la **parité textuelle de cette couverture**' not in text:
    text=once(text,marker,marker+addition,'prompt 216 append')
prompt_path.write_text(text,encoding='utf-8')

ledger_path=docs/'AGENT_CRYPTO_FIN_DE_FIL_AETHER.md'
text=ledger_path.read_text(encoding='utf-8')
text=once(text,'Version canonique de clôture : **40.4.215**','Version canonique de clôture : **40.4.216**','ledger version')
text=once(text,'## 1. Cascade finale 40.4.205 → 40.4.215','## 1. Cascade finale 40.4.205 → 40.4.216','ledger heading')
marker='''- **40.4.215** — Market Coverage Truth : séparation explicite entre plafond de rang fournisseur et cardinalité de lignes ; actifs uniques par ID, rangs ex æquo préservés, rangs distincts/max observé exposés, aucun backfill synthétique.\n'''
addition='''- **40.4.216** — Market Coverage Footer Parity : le footer secondaire du Market Snapshot réutilise la vérité de couverture 40.4.215 ; suppression des ratios de cardinalité ambigus, sans modifier données, rangs ni runtime réseau.\n'''
if '- **40.4.216**' not in text:
    text=once(text,marker,marker+addition,'ledger 216 append')
ledger_path.write_text(text,encoding='utf-8')

contract={
    'build':'40.4.216',
    'scope':'market_snapshot_footer_text_parity',
    'market_core':'38.15.11',
    'reuses_market_coverage_truth_404215':True,
    'provider_rank_cap_semantics':True,
    'legacy_cardinality_footer_retired':True,
    'synthetic_rank_backfill':False,
    'data_change':False,
    'geometry_change':False,
    'market_behavior_change':False,
    'fetch_added':False,
    'timer_added':False,
    'observer_added':False,
    'websocket_added':False,
}
contract_path=Path('/tmp/contract404216.json')
contract_path.write_text(json.dumps(contract,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
run('python','.github/scripts/agent_crypto_release_driver.py',
    '--build','40.4.216','--parent','40.4.215',
    '--release','MARKET COVERAGE FOOTER PARITY · RANK-CAP COPY LOCK',
    '--status','market_coverage_footer_parity_404216_operator_validation_required',
    '--contract-key','market_coverage_footer_parity_404216',
    '--contract-json',str(contract_path),
    '--lineage-note','40.4.216 aligns the secondary Market Snapshot footer with 40.4.215 provider-rank semantics; no cardinality promise, synthetic rank or data mutation.')

run('node','--check',str(ADMIN/'app.js'))
run('node','--check',str(ADMIN/'js/app.js'))
run('python','-m','py_compile','.github/scripts/agent_crypto_version_truth_guard.py','.github/scripts/agent_crypto_release_driver.py')
run('python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.216')

app=(ADMIN/'app.js').read_text(encoding='utf-8')
assert '40.4.216 — MARKET COVERAGE FOOTER PARITY' in app
assert 'coverageFooter404216=atlasMarketUniverseCoverageTruth404215(limit)' in app
assert 'rang ≤ ${limit} : ${coverageFooter404216.assetCount} actifs uniques' in app
assert 'Core rang ≤ ${limit} : ${coverageFooter404216.assetCount} actifs uniques' in app
assert 'univers cumulé ${logicalCount}/${limit}' not in app
assert 'Core ${coreCount}/250 · vue ${limit}' not in app
version=json.loads((ADMIN/'version.json').read_text(encoding='utf-8'))
build=json.loads((ADMIN/'build.json').read_text(encoding='utf-8'))
mirror=json.loads((ADMIN/'administrator-version.json').read_text(encoding='utf-8'))
assert version['build']==build['build']==mirror['build']=='40.4.216'
assert version['engine']['reference_build']=='38.15.11' and build['engine']=='38.15.11'
contract_live=version['contracts']['market_coverage_footer_parity_404216']
assert contract_live['reuses_market_coverage_truth_404215'] is True
assert contract_live['legacy_cardinality_footer_retired'] is True
assert contract_live['data_change'] is False
assert contract_live['market_behavior_change'] is False

changed=subprocess.check_output(['git','diff','--name-only'],text=True).splitlines()
if any(p.startswith('public/agent_crypto_erith_ia/data/') for p in changed):
    raise SystemExit('STOP data files changed during 40.4.216')
run('git','diff','--check')

run('git','config','user.name','Aether Release')
run('git','config','user.email','41898282+github-actions[bot]@users.noreply.github.com')
run('git','rm',str(WORKFLOW))
run('git','rm',str(SELF))
for path in (
    '.github/scripts/agent_crypto_version_truth_guard.py',
    'public/agent_crypto_erith_ia/administrator/app.js',
    'public/agent_crypto_erith_ia/administrator/js/app.js',
    'public/agent_crypto_erith_ia/administrator/index.html',
    'public/agent_crypto_erith_ia/administrator/version.json',
    'public/agent_crypto_erith_ia/administrator/administrator-version.json',
    'public/agent_crypto_erith_ia/administrator/build.json',
    'coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_RELEASE_MANIFEST.md',
    'coordination/inter_ai_dialogues/agent_crypto/PROMPT_REPRISE_AETHER_AGENT_CRYPTO.md',
    'coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_FIN_DE_FIL_AETHER.md',
):
    run('git','add',path)
run('git','commit','-m','release(agent-crypto): 40.4.216 market coverage footer parity lock')
run('git','pull','--rebase','origin','main')
run('python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.216')
run('git','push','origin','HEAD:main')
print(json.dumps({'ok':True,'build':'40.4.216','market_core':'38.15.11'},ensure_ascii=False))
