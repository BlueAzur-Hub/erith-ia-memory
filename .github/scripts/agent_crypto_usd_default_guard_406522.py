#!/usr/bin/env python3
from pathlib import Path
import json, subprocess
ROOT=Path(__file__).resolve().parents[2]
ADMIN=ROOT/'public/agent_crypto_erith_ia/administrator'
def need(v,m):
    if not v: raise SystemExit('USD_DEFAULT_406522_FAIL: '+m)
build=json.loads((ADMIN/'build.json').read_text(encoding='utf-8'))
index=(ADMIN/'index.html').read_text(encoding='utf-8')
module=(ADMIN/'js/display-default-usd-406522.js').read_text(encoding='utf-8')
need(build.get('build')=='40.6.522','build')
need(build.get('parent_build')=='40.6.521','parent')
need(build.get('release')=='USD DEFAULT DISPLAY · OWNER CHAIN COMPLETE','release')
need(build.get('market_core')=='38.15.11' and build.get('market_core_modified') is False,'market core')
need('Build 40.6.522 · Administrator' in index,'index identity')
need('USD DEFAULT DISPLAY · OWNER CHAIN COMPLETE' in index,'release meta')
need('display-default-usd-406522.js' in index,'default module missing')
owner_scripts=['quote-currency-architecture-406497.js','currency-domain-v2-406517.js','graph-native-usd-406520.js','market-fiche-display-406518.js','oracle-aether-display-406519.js','market-microscope-candles-406498.js','okx-microstructure-406499.js']
default_pos=index.index('display-default-usd-406522.js')
for owner in owner_scripts: need(index.index(owner)<default_pos,'default loaded before '+owner)
need('const BUILD="40.6.522"' in module,'module build')
need('setDisplayCurrency("USD"' in module,'USD target')
need('default_display_currency:"USD"' in module,'contract target')
need('operator_eur_return:true' in module,'EUR return')
need('one_shot_boot_policy:true' in module,'one-shot contract')
need('persistent_preference:false' in module,'persistence contract')
need('localStorage' not in module,'storage added')
need('setInterval' not in module,'timer added')
need('MutationObserver' not in module,'observer added')
need('fetch(' not in module,'network added')
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
 'depth':blob(ADMIN/'js/okx-microstructure-406499.js'),
}
need(hashes['app']=='3507514b8a90366a7ca1b5d86e5cf3f700be31ab','app changed')
need(hashes['graph']=='23db576e3a9035c6df92f0bfafeb830f1e7d9ffa','graph changed')
need(hashes['quote']=='4495120737a24e7404dc71c9451220ace630d5c7','quote changed')
need(hashes['domain']=='f057f588a914d1602179c288dd6303888cfd75ce','domain changed')
need(hashes['market_fiche']=='8fb3a066b7e2bc492a2c7234b43a3e08ac7ed533','market/fiche changed')
need(hashes['oracle_aether']=='2d43bc7913c6f7000417e62b99d4ee2e9e05a701','oracle/aether changed')
need(hashes['aether']=='143cbc3dd81690b551afe07156bafecec626d88b','aether changed')
need(hashes['candles']=='ea2ef80af94fa6e2be539886287c7f754025fe9b','candles changed')
need(hashes['transport']=='7de14a725f39b72bddf7a659df1151e078173377','transport changed')
need(hashes['depth']=='c324309cd69acdda04502b0a88894fbc94ba5a0a','depth 40.6.521 changed')
scope=build.get('usd_default_display_406522') or {}
need(scope.get('enabled') is True,'scope')
need(scope.get('default_display_currency')=='USD','default scope')
need(scope.get('operator_can_return_eur') is True,'EUR scope')
need(scope.get('execution_instrument_unchanged')=='BTC-EUR','exec changed')
need(scope.get('settlement_asset_unchanged')=='EUR','settle changed')
need(scope.get('conversion_added') is False,'conversion added')
need(scope.get('strategy_changed') is False and scope.get('backend_changed') is False,'protected business owners')
print(json.dumps({'ok':True,'build':'40.6.522','release':build.get('release'),'protected_hashes':hashes,'terrain':'PENDING_FIREFOX'},ensure_ascii=False))
