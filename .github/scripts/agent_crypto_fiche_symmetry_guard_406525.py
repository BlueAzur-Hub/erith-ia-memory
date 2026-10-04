#!/usr/bin/env python3
from pathlib import Path
import json, subprocess

ROOT=Path(__file__).resolve().parents[2]
ADMIN=ROOT/'public/agent_crypto_erith_ia/administrator'

def need(v,m):
    if not v:
        raise SystemExit('FICHE_SYMMETRY_406525_FAIL: '+m)

build=json.loads((ADMIN/'build.json').read_text(encoding='utf-8'))
index=(ADMIN/'index.html').read_text(encoding='utf-8')
module=(ADMIN/'js/market-fiche-display-406518.js').read_text(encoding='utf-8')

need(build.get('build')=='40.6.525','build')
need(build.get('parent_build')=='40.6.524','parent')
need(build.get('release')=='FICHE USD DE-DUP + EUR SYMMETRY','release')
need(build.get('market_core')=='38.15.11' and build.get('market_core_modified') is False,'market core')
need('Build 40.6.525 · Administrator' in index,'index identity')
need('market-fiche-display-406518.js?v=40.6.525' in index,'fiche cache bust')
need('const BUILD="40.6.525"' in module,'module build')
need('"Source USD"' in module,'USD source metric missing')
need('label==="Prix USD marché"||label==="Source USD"' in module,'source/price selector not symmetric')
need('setHelpMetric(first,"Prix direct EUR"' in module,'EUR first metric restore missing')
need('setHelpMetric(second,"Prix USD marché"' in module,'EUR second metric restore missing')
need('fiche_usd_second_metric_is_source:true' in module,'de-dup contract missing')
need('fiche_eur_restore_symmetric:true' in module,'EUR symmetry contract missing')
need('eur_to_usd_conversion:false' in module,'conversion prohibition missing')

def blob(p):
    return subprocess.check_output(['git','hash-object',str(p)],text=True).strip()

hashes={
 'app':blob(ADMIN/'app.js'),
 'target_flow':blob(ADMIN/'js/target-flow-display-406524.js'),
 'depth':blob(ADMIN/'js/okx-microstructure-406499.js'),
 'graph':blob(ADMIN/'js/graph-native-usd-406520.js'),
 'quote':blob(ADMIN/'js/quote-currency-architecture-406497.js'),
 'domain':blob(ADMIN/'js/currency-domain-v2-406517.js'),
 'oracle_aether':blob(ADMIN/'js/oracle-aether-display-406519.js'),
 'candles':blob(ADMIN/'js/market-microscope-candles-406498.js'),
 'market_fiche':blob(ADMIN/'js/market-fiche-display-406518.js'),
}
need(hashes['app']=='3507514b8a90366a7ca1b5d86e5cf3f700be31ab','app changed')
need(hashes['target_flow']=='8bc00821c2e710f4a4800749bec0a36b19cb7742','target flow changed')
need(hashes['depth']=='c324309cd69acdda04502b0a88894fbc94ba5a0a','depth changed')
need(hashes['graph']=='23db576e3a9035c6df92f0bfafeb830f1e7d9ffa','graph changed')
need(hashes['quote']=='4495120737a24e7404dc71c9451220ace630d5c7','quote changed')
need(hashes['domain']=='f057f588a914d1602179c288dd6303888cfd75ce','domain changed')
need(hashes['oracle_aether']=='2d43bc7913c6f7000417e62b99d4ee2e9e05a701','oracle/aether changed')
need(hashes['candles']=='ea2ef80af94fa6e2be539886287c7f754025fe9b','candles changed')
need(hashes['market_fiche']=='5a399f8cc76cb391ce3352dc015c6a28f8b726df','market fiche mismatch')

scope=build.get('fiche_currency_symmetry_406525') or {}
need(scope.get('enabled') is True,'scope')
need(scope.get('depth_changed') is False,'depth protection')
need(scope.get('target_flow_changed') is False,'target flow protection')
need(scope.get('browser_eur_to_usd_conversion') is False,'conversion scope')

print(json.dumps({
 'ok':True,
 'build':'40.6.525',
 'release':build.get('release'),
 'market_fiche_blob':'5a399f8cc76cb391ce3352dc015c6a28f8b726df',
 'protected_hashes':hashes,
 'terrain':'PENDING_FIREFOX'
},ensure_ascii=False))
