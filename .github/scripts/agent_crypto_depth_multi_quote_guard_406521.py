#!/usr/bin/env python3
from pathlib import Path
import json, subprocess
ROOT=Path(__file__).resolve().parents[2]
ADMIN=ROOT/'public/agent_crypto_erith_ia/administrator'
def need(v,m):
    if not v: raise SystemExit('DEPTH_MULTI_QUOTE_406521_FAIL: '+m)
build=json.loads((ADMIN/'build.json').read_text(encoding='utf-8'))
index=(ADMIN/'index.html').read_text(encoding='utf-8')
depth=(ADMIN/'js/okx-microstructure-406499.js').read_text(encoding='utf-8')
need(build.get('build')=='40.6.521','build')
need(build.get('parent_build')=='40.6.520','parent')
need(build.get('release')=='OKX DEPTH MULTI-QUOTE · USD→USDC/USDT TRUTH','release')
need(build.get('market_core')=='38.15.11' and build.get('market_core_modified') is False,'market core')
need('Build 40.6.521 · Administrator' in index,'index identity')
need('OKX DEPTH MULTI-QUOTE · USD→USDC/USDT TRUTH' in index,'release meta')
need('const BUILD="40.6.521"' in depth,'depth build')
need('quoteCandidates=()=>displayCurrency()==="USD"?["USDC","USDT"]:["EUR"]' in depth,'quote candidates')
need('stablecoin_never_relabelled_usd:true' in depth,'stablecoin truth')
need('normalizePublicOkxBook' in depth and 'https://www.okx.com/api/v5/market/books' in depth,'OKX public books route')
need('requestedQuote="EUR"' in depth,'dynamic quote validation')
need('quotes:Object.freeze(["EUR","USDC","USDT"])' in depth,'validation contract')
need(index.index('okx-local-backend-transport-406500.js') < index.index('okx-microstructure-406499.js'),'transport load order')
def blob(p): return subprocess.check_output(['git','hash-object',str(p)],text=True).strip()
hashes={
 'app':blob(ADMIN/'app.js'),
 'graph':blob(ADMIN/'js/graph-native-usd-406520.js'),
 'quote':blob(ADMIN/'js/quote-currency-architecture-406497.js'),
 'domain':blob(ADMIN/'js/currency-domain-v2-406517.js'),
 'market_fiche':blob(ADMIN/'js/market-fiche-display-406518.js'),
 'oracle_aether':blob(ADMIN/'js/oracle-aether-display-406519.js'),
 'aether':blob(ADMIN/'js/aether.js'),
 'candles':blob(ADMIN/'js/market-microscope-candles-406498.js'),
 'transport':blob(ADMIN/'js/okx-local-backend-transport-406500.js'),
}
need(hashes['app']=='3507514b8a90366a7ca1b5d86e5cf3f700be31ab','app changed')
need(hashes['graph']=='23db576e3a9035c6df92f0bfafeb830f1e7d9ffa','graph changed')
need(hashes['quote']=='4495120737a24e7404dc71c9451220ace630d5c7','quote architecture changed')
need(hashes['domain']=='f057f588a914d1602179c288dd6303888cfd75ce','domain changed')
need(hashes['market_fiche']=='8fb3a066b7e2bc492a2c7234b43a3e08ac7ed533','market/fiche changed')
need(hashes['oracle_aether']=='2d43bc7913c6f7000417e62b99d4ee2e9e05a701','oracle/aether changed')
need(hashes['aether']=='143cbc3dd81690b551afe07156bafecec626d88b','aether changed')
need(hashes['candles']=='ea2ef80af94fa6e2be539886287c7f754025fe9b','candles changed')
need(hashes['transport']=='7de14a725f39b72bddf7a659df1151e078173377','OKX transport changed')
scope=build.get('okx_depth_multi_quote_406521') or {}
need(scope.get('enabled') is True,'scope')
need(scope.get('display_usd_preference')==['USDC','USDT'],'USD preference')
need(scope.get('stablecoins_are_distinct_from_usd') is True,'stablecoin truth scope')
need(scope.get('backend_source_code_changed') is False and scope.get('local_transport_changed') is False,'backend/transport protection')
need(scope.get('graph_changed') is False and scope.get('candles_changed') is False,'graph/candles protection')
need(scope.get('strategy_changed') is False and scope.get('bridge_changed') is False,'strategy/bridge protection')
print(json.dumps({'ok':True,'build':'40.6.521','release':build.get('release'),'protected_hashes':hashes,'terrain':'PENDING_FIREFOX'},ensure_ascii=False))
