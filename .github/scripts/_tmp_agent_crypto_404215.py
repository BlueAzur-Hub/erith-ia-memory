#!/usr/bin/env python3
from pathlib import Path
from collections import defaultdict
import json

repo=Path('.')
admin=repo/'public/agent_crypto_erith_ia/administrator'
data=repo/'public/agent_crypto_erith_ia/data/crypto'

def once(text, old, new, label):
    n=text.count(old)
    if n!=1:
        raise SystemExit(f'STOP {label}: expected 1, found {n}')
    return text.replace(old,new,1)

# Snapshot audit: unique IDs are row truth; provider ranks may tie.
core=json.loads((data/'latest.json').read_text(encoding='utf-8'))
ext=json.loads((data/'extended.json').read_text(encoding='utf-8'))
rows=[('core',c) for c in (core.get('coins') or [])]+[('extended',c) for c in (ext.get('coins') or [])]
ids=[str(c.get('id') or '') for _,c in rows]
if len(ids)!=len(set(ids)):
    raise SystemExit('STOP duplicate coin IDs across Core+Extended')
by_rank=defaultdict(list)
for source,c in rows:
    rank=int(c.get('rank') or 0)
    if not 1<=rank<=1000:
        raise SystemExit(f'STOP rank outside 1..1000: {source}:{c.get("id")}={rank}')
    by_rank[rank].append(str(c.get('id') or ''))
missing=[r for r in range(1,1001) if r not in by_rank]
dups={r:v for r,v in by_rank.items() if len(v)>1}
audit={
    'core_rows':len(core.get('coins') or []),
    'extended_rows':len(ext.get('coins') or []),
    'unique_ids':len(set(ids)),
    'unique_ranks':len(by_rank),
    'duplicate_rank_positions':len(dups),
    'missing_rank_labels':len(missing),
    'min_rank':min(by_rank),
    'max_rank':max(by_rank),
    'core_max_rank':max(int(c.get('rank') or 0) for c in core.get('coins') or []),
    'extended_max_rank':max(int(c.get('rank') or 0) for c in ext.get('coins') or []),
    'missing_ranks':missing,
    'duplicate_ranks':sorted(dups),
    'core_snapshot':core.get('snapshot_id'),
    'extended_snapshot':ext.get('snapshot_id'),
}
Path('/tmp/coverage404215.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('COVERAGE_404215='+json.dumps(audit,ensure_ascii=False,sort_keys=True))

app_path=admin/'app.js'
app=app_path.read_text(encoding='utf-8')
budget_keys=('setInterval(','setTimeout(','MutationObserver','IntersectionObserver','fetch(','new WebSocket','localStorage.setItem')
before={k:app.count(k) for k in budget_keys}

anchor='function atlasMarketUniverseFind403115(coinId){'
helper='''/* 40.4.215 — MARKET COVERAGE TRUTH.
   The Market buttons are provider-rank caps, not promises of exact row cardinality.
   CoinGecko can expose equal market_cap_rank labels; unique asset IDs remain the row truth.
   No rank is fabricated, renumbered or backfilled. */
function atlasMarketRankRanges404215(values){
  const ordered=[...new Set((Array.isArray(values)?values:[]).map(Number).filter(Number.isFinite))].sort((a,b)=>a-b);
  if(!ordered.length)return "—";
  const ranges=[];
  let start=ordered[0],prev=ordered[0];
  for(let i=1;i<ordered.length;i+=1){
    const value=ordered[i];
    if(value===prev+1){prev=value;continue;}
    ranges.push(start===prev?String(start):`${start}–${prev}`);
    start=prev=value;
  }
  ranges.push(start===prev?String(start):`${start}–${prev}`);
  return ranges.join(", ");
}

function atlasMarketUniverseCoverageTruth404215(limit=atlasMarketUniverseLimit403115()){
  const cap=Math.max(1,Number(limit)||50);
  const logical=atlasMarketUniverseCoins403115(cap);
  const rankMap=new Map();
  for(const coin of logical){
    const rank=Number(coin?.rank);
    if(!Number.isFinite(rank)||rank<1||rank>cap)continue;
    if(!rankMap.has(rank))rankMap.set(rank,[]);
    rankMap.get(rank).push(String(coin?.id||""));
  }
  const ranks=[...rankMap.keys()].sort((a,b)=>a-b);
  const missing=[];
  for(let rank=1;rank<=cap;rank+=1){if(!rankMap.has(rank))missing.push(rank);}
  const duplicateRanks=ranks.filter(rank=>(rankMap.get(rank)?.length||0)>1);
  return Object.freeze({
    rankCap:cap,
    assetCount:logical.length,
    uniqueRankCount:ranks.length,
    duplicateRankPositions:duplicateRanks.length,
    duplicateRanks:Object.freeze(duplicateRanks),
    missingRankCount:missing.length,
    missingRanks:Object.freeze(missing),
    missingRankRanges:atlasMarketRankRanges404215(missing),
    minRank:ranks.length?ranks[0]:null,
    maxRank:ranks.length?ranks[ranks.length-1]:null,
    rank_cap_is_not_exact_cardinality:true,
    provider_rank_ties_preserved:true,
    synthetic_rank_backfill:false
  });
}

globalThis.ErithMarketUniverseCoverageTruth404215=Object.freeze({
  build:"40.4.215",
  derive:(limit)=>atlasMarketUniverseCoverageTruth404215(limit),
  rank_cap_is_not_exact_cardinality:true,
  provider_rank_ties_preserved:true,
  unique_asset_id_is_row_authority:true,
  synthetic_rank_backfill:false,
  data_mutation:false,
  fetch_added:false,
  timer_added:false,
  observer_added:false
});

function atlasMarketUniverseFind403115(coinId){'''
app=once(app,anchor,helper,'coverage helper insertion')

old='''    if(limit<=250){
      status.textContent=`Core 250 : ${coreCount}/${frame?.requestedAssets||250} actifs validés · ${atlasMarketFrameShortId(frame)}`;
    }else if(atlasMarketUniverseState403115.status==="loading"){
      status.textContent=`Extended ${limit} : chargement GitHub Actions… · Core ${coreCount}/250`;
    }else if(atlasMarketUniverseState403115.status==="error"){
      status.textContent=`Extended ${limit} indisponible · Core ${coreCount}/250 · ${atlasMarketUniverseState403115.error}`;
    }else{
      const extended=atlasMarketUniverseExtendedRows403115(limit);
      const logical=atlasMarketUniverseCoins403115(limit);
      const stamp=atlasMarketUniverseState403115.generatedAt
        ?new Date(atlasMarketUniverseState403115.generatedAt).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})
        :"—";
      status.textContent=`Univers cumulé ${limit} : ${logical.length}/${limit} actifs · Core ${coreCount} + Extended ${extended.length} · ${stamp}`;
    }'''
new='''    if(limit<=250){
      const coverage=atlasMarketUniverseCoverageTruth404215(limit);
      const tie=coverage.duplicateRankPositions?` · ${coverage.duplicateRankPositions} rangs ex æquo`:"";
      status.textContent=`Core rang ≤ ${limit} : ${coverage.assetCount} actifs uniques · ${coverage.uniqueRankCount} rangs distincts${tie} · max observé ${coverage.maxRank??"—"} · ${atlasMarketFrameShortId(frame)}`;
      status.title=coverage.missingRankCount?`Rangs non représentés dans ce snapshot : ${coverage.missingRankRanges}. Le rang fournisseur n’est pas un index dense de lignes.`:"Couverture de rang sans trou dans ce snapshot.";
    }else if(atlasMarketUniverseState403115.status==="loading"){
      status.textContent=`Extended rang ≤ ${limit} : chargement GitHub Actions… · Core ${coreCount}`;
      status.title="Le bouton sélectionne un plafond de rang fournisseur, pas un nombre exact de lignes.";
    }else if(atlasMarketUniverseState403115.status==="error"){
      status.textContent=`Extended rang ≤ ${limit} indisponible · Core ${coreCount} · ${atlasMarketUniverseState403115.error}`;
      status.title="Le Core reste disponible ; aucune ligne Extended n’est inventée.";
    }else{
      const extended=atlasMarketUniverseExtendedRows403115(limit);
      const coverage=atlasMarketUniverseCoverageTruth404215(limit);
      const stamp=atlasMarketUniverseState403115.generatedAt
        ?new Date(atlasMarketUniverseState403115.generatedAt).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})
        :"—";
      const tie=coverage.duplicateRankPositions?` · ${coverage.duplicateRankPositions} rangs ex æquo`:"";
      status.textContent=`Univers rang ≤ ${limit} : ${coverage.assetCount} actifs uniques · ${coverage.uniqueRankCount} rangs distincts${tie} · max observé ${coverage.maxRank??"—"} · Core ${coreCount} + Extended ${extended.length} · ${stamp}`;
      status.title=coverage.missingRankCount?`Rangs non représentés dans ce snapshot : ${coverage.missingRankRanges}. Les ex æquo CoinGecko sont conservés ; aucun rang synthétique n’est créé.`:"Couverture de rang sans trou dans ce snapshot.";
    }'''
app=once(app,old,new,'Market coverage status truth')
app=once(app,
'''   The logical universe is complete; the visual table is paged at 100 rows.
   Search/filter/sort operate on the full selected logical universe first.''',
'''   The logical universe is complete for unique loaded IDs under the selected provider-rank cap.
   Provider rank labels may be tied and are not a dense row index; no synthetic rank is created.
   The visual table is paged at 100 rows; search/filter/sort operate on the full selected logical universe first.''',
'Market universe semantics comment')
after={k:app.count(k) for k in budget_keys}
if after!=before:
    raise SystemExit(f'STOP runtime owner budget changed: {before} -> {after}')
app_path.write_text(app,encoding='utf-8')

# Permanent release guard.
guard_path=repo/'.github/scripts/agent_crypto_version_truth_guard.py'
g=guard_path.read_text(encoding='utf-8')
anchor_guard='    files = manifest.get("files")'
insert='''    if current_num >= (40, 4, 215):
        required_coverage = (
            "40.4.215 — MARKET COVERAGE TRUTH",
            "atlasMarketUniverseCoverageTruth404215",
            "rank_cap_is_not_exact_cardinality:true",
            "provider_rank_ties_preserved:true",
            "Univers rang ≤ ${limit}",
            "rangs distincts",
            "rangs ex æquo",
        )
        for marker in required_coverage:
            if marker not in root:
                fail(f"40.4.215 Market coverage truth regression: missing {marker}")
        if "Univers cumulé ${limit} : ${logical.length}/${limit} actifs" in root:
            fail("40.4.215 ambiguous rank-cap/cardinality wording restored")

    files = manifest.get("files")'''
g=once(g,anchor_guard,insert,'guard coverage insertion')
guard_path.write_text(g,encoding='utf-8')

# Handoff documents.
docs=repo/'coordination/inter_ai_dialogues/agent_crypto'
manifest=docs/'AGENT_CRYPTO_RELEASE_MANIFEST.md'
t=manifest.read_text(encoding='utf-8')
t=once(t,'Release courante : **40.4.214**','Release courante : **40.4.215**','manifest release')
t=once(t,'commit final 40.4.214','commit final 40.4.215','manifest archive')
if '40.4.215 est une release' not in t:
    t += '\n40.4.215 est une release de **Market Coverage Truth** : les boutons 50/100/250/500/1000 sont des plafonds de rang fournisseur, pas des promesses de cardinalité exacte. Les ex æquo CoinGecko sont conservés, les IDs uniques restent l’autorité de ligne, aucun rang synthétique n’est inventé.\n'
manifest.write_text(t,encoding='utf-8')

prompt=docs/'PROMPT_REPRISE_AETHER_AGENT_CRYPTO.md'
t=prompt.read_text(encoding='utf-8')
t=once(t,'Version de reprise : **40.4.214**','Version de reprise : **40.4.215**','prompt version')
if '40.4.215 verrouille la **vérité de couverture Market**' not in t:
    needle='40.4.214 restaure l’**ingestion de l’univers Extended**'
    pos=t.find(needle)
    if pos<0: raise SystemExit('STOP prompt 40.4.214 anchor missing')
    end=t.find('\n',pos)
    if end<0: end=len(t)
    addition='\n\n40.4.215 verrouille la **vérité de couverture Market** : 50/100/250/500/1000 sont des plafonds de rang CoinGecko, pas des nombres de lignes garantis. Les rangs ex æquo sont préservés, les actifs sont uniques par ID, la couverture réelle expose rangs distincts/max observé et aucun rang manquant n’est fabriqué.'
    t=t[:end]+addition+t[end:]
prompt.write_text(t,encoding='utf-8')

ledger=docs/'AGENT_CRYPTO_FIN_DE_FIL_AETHER.md'
t=ledger.read_text(encoding='utf-8')
t=once(t,'Version canonique de clôture : **40.4.214**','Version canonique de clôture : **40.4.215**','ledger version')
t=once(t,'## 1. Cascade finale 40.4.205 → 40.4.214','## 1. Cascade finale 40.4.205 → 40.4.215','ledger heading')
if '- **40.4.215**' not in t:
    needle='- **40.4.214**'
    pos=t.find(needle)
    if pos<0: raise SystemExit('STOP ledger 40.4.214 anchor missing')
    end=t.find('\n',pos)
    if end<0: end=len(t)
    addition='\n- **40.4.215** — Market Coverage Truth : séparation explicite entre plafond de rang fournisseur et cardinalité de lignes ; actifs uniques par ID, rangs ex æquo préservés, rangs distincts/max observé exposés, aucun backfill synthétique.'
    t=t[:end]+addition+t[end:]
ledger.write_text(t,encoding='utf-8')

contract={
  'schema':'erith.admin.market-coverage-truth.v1',
  'build':'40.4.215',
  'parent_build':'40.4.214',
  'selected_market_limit_semantics':'provider_rank_cap',
  'rank_cap_is_not_exact_cardinality':True,
  'provider_rank_ties_preserved':True,
  'unique_asset_id_is_row_authority':True,
  'synthetic_rank_backfill':False,
  'data_rows_modified':False,
  'collector_modified':False,
  'new_network_owner':False,
  'new_timer':False,
  'new_observer':False,
  'market_core_modified':False,
  'operator_validation_required':True,
  'release_audit':audit,
}
Path('/tmp/contract404215.json').write_text(json.dumps(contract,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
