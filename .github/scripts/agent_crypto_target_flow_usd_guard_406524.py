#!/usr/bin/env python3
from pathlib import Path
import json, subprocess

ROOT=Path(__file__).resolve().parents[2]
ADMIN=ROOT/'public/agent_crypto_erith_ia/administrator'

def need(v,m):
    if not v:
        raise SystemExit('TARGET_FLOW_USD_406524_FAIL: '+m)

build=json.loads((ADMIN/'build.json').read_text(encoding='utf-8'))
index=(ADMIN/'index.html').read_text(encoding='utf-8')
module=(ADMIN/'js/target-flow-display-406524.js').read_text(encoding='utf-8')

need(build.get('build')=='40.6.524','build')
need(build.get('parent_build')=='40.6.523','parent')
need(build.get('release')=='TARGET TOP + MARKET FLOW USD DISPLAY','release')
need(build.get('market_core')=='38.15.11' and build.get('market_core_modified') is False,'market core')
need('Build 40.6.524 · Administrator' in index,'index identity')
need('target-flow-display-406524.js?v=40.6.524' in index,'target-flow module missing')
need('const BUILD="40.6.524"' in module,'module build')
need('wrap("atlasRenderTopFiveRibbon"' in module,'Target Top renderer not rebound')
need('wrap("atlasPatchTickerSpot"' in module,'Target Top late spot writer not rebound')
need('wrap("atlasRenderMarketFlowRibbon"' in module,'Market Flow renderer not rebound')
need('coin?.priceUsd' in module,'explicit USD field missing')
need('eur_to_usd_conversion:false' in module,'conversion prohibition missing')

def blob(p):
    return subprocess.check_output(['git','hash-object',str(p)],text=True).strip()

hashes={
 'app':blob(ADMIN/'app.js'),
 'market_fiche':blob(ADMIN/'js/market-fiche-display-406518.js'),
 'graph':blob(ADMIN/'js/graph-native-usd-406520.js'),
 'quote':blob(ADMIN/'js/quote-currency-architecture-406497.js'),
 'domain':blob(ADMIN/'js/currency-domain-v2-406517.js'),
 'oracle_aether':blob(ADMIN/'js/oracle-aether-display-406519.js'),
 'aether':blob(ADMIN/'js/aether.js'),
 'candles':blob(ADMIN/'js/market-microscope-candles-406498.js'),
 'transport':blob(ADMIN/'js/okx-local-backend-transport-406500.js'),
 'depth':blob(ADMIN/'js/okx-microstructure-406499.js'),
 'default_usd':blob(ADMIN/'js/display-default-usd-406522.js'),
 'target_flow':blob(ADMIN/'js/target-flow-display-406524.js'),
}
need(hashes['app']=='3507514b8a90366a7ca1b5d86e5cf3f700be31ab','app changed')
need(hashes['market_fiche']=='a010523ad602bd97a3b7afda1ef2e61f95ab9a53','market/fiche .523 changed')
need(hashes['graph']=='23db576e3a9035c6df92f0bfafeb830f1e7d9ffa','graph changed')
need(hashes['quote']=='4495120737a24e7404dc71c9451220ace630d5c7','quote changed')
need(hashes['domain']=='f057f588a914d1602179c288dd6303888cfd75ce','domain changed')
need(hashes['oracle_aether']=='2d43bc7913c6f7000417e62b99d4ee2e9e05a701','oracle/aether changed')
need(hashes['aether']=='143cbc3dd81690b551afe07156bafecec626d88b','aether changed')
need(hashes['candles']=='ea2ef80af94fa6e2be539886287c7f754025fe9b','candles changed')
need(hashes['transport']=='7de14a725f39b72bddf7a659df1151e078173377','transport changed')
need(hashes['depth']=='c324309cd69acdda04502b0a88894fbc94ba5a0a','depth changed')
need(hashes['default_usd']=='ede05804f0b2c18021eee4ab022a70001f6a1d2b','USD default changed')
need(hashes['target_flow']=='8bc00821c2e710f4a4800749bec0a36b19cb7742','target-flow owner mismatch')

scope=build.get('target_flow_display_406524') or {}
need(scope.get('enabled') is True,'scope')
need(scope.get('browser_eur_to_usd_conversion') is False,'conversion scope')
need(scope.get('app_js_changed') is False and scope.get('market_core_modified') is False,'core protection')
need(scope.get('market_fiche_changed') is False,'market fiche protection')
need(scope.get('graph_changed') is False and scope.get('oracle_aether_changed') is False,'graph/oracle protection')
need(scope.get('candles_changed') is False and scope.get('depth_changed') is False,'candles/depth protection')
need(scope.get('strategy_changed') is False and scope.get('backend_changed') is False,'strategy/backend protection')

print(json.dumps({
 'ok':True,
 'build':'40.6.524',
 'release':build.get('release'),
 'target_flow_blob':'8bc00821c2e710f4a4800749bec0a36b19cb7742',
 'protected_hashes':hashes,
 'terrain':'PENDING_FIREFOX'
},ensure_ascii=False))
