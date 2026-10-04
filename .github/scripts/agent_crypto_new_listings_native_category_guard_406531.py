#!/usr/bin/env python3
from pathlib import Path
import json, subprocess
ROOT=Path(__file__).resolve().parents[2]
ADMIN=ROOT/'public/agent_crypto_erith_ia/administrator'

def need(v,m):
    if not v:
        raise SystemExit('NEW_LISTINGS_NATIVE_CATEGORY_406531_FAIL: '+m)

build=json.loads((ADMIN/'build.json').read_text(encoding='utf-8'))
index=(ADMIN/'index.html').read_text(encoding='utf-8')
live=(ADMIN/'js/new-listings-live-asset-406529.js').read_text(encoding='utf-8')
native=(ADMIN/'js/new-listings-native-category-406531.js').read_text(encoding='utf-8')

need(build.get('build')=='40.6.531','build')
need(build.get('parent_build')=='40.6.530','parent')
need(build.get('market_core')=='38.15.11' and build.get('market_core_modified') is False,'market core')
need('new-listings-native-category-406531.js?v=40.6.531' in index,'531 module not loaded')
need('new-listings-native-market-406530.js?v=40.6.531' not in index,'530 module still loaded')
need(index.index('new-listings-live-asset-406529.js?v=40.6.531') < index.index('new-listings-native-category-406531.js?v=40.6.531') < index.index('market-microscope-candles-406498.js?v=40.6.531'),'load order')
need('NEW_LISTINGS_NATIVE_MARKET_CATEGORY_MULTI_ASSET' in (ADMIN/'build.json').read_text(encoding='utf-8'),'destination')
need('nativeCategoryOwnsUx' in live,'legacy UX gate missing')
need('native_only:true' in native,'native-only owner missing')
need('category_not_ct_only:true' in native,'multi-asset category missing')
need('second_listing_supported' in native,'second listing proof missing')
need('discoverBitget' in native,'live discovery missing')
need('/api/v3/market/tickers' in native,'ticker enrichment missing')
need('FRIENDLY' in native and 'MHA' in native and 'MCAT' in native and 'PONS' in native and 'CNPY' in native,'known identity enrichment missing')
need('legacy_new_ribbon_hidden:true' in native,'legacy ribbon not suppressed')
need('return_market_button_removed:true' in native,'Retour Market not removed')
need('native_main_line_graph_reused:true' in native,'main line reuse missing')
need('native_candles_owner_reused:true' in native,'candles reuse missing')
need('native_depth_owner_reused:true' in native,'depth reuse missing')
need('globalThis.atlasExternalChartDraw' in native,'existing graph owner not reused')
need('AgentCryptoNewListingLiveAsset?.fetchCandles' in native,'exchange line source missing')
need('AgentCryptoMarketMicroscope?.setMode?.("native")' in native,'native Line restore missing')
need('explicit_stablecoin_fx_not_relabel:true' in native,'stablecoin truth missing')
need('conversion refusée' in native,'no-fabrication FX refusal missing')
need('state_coins_injection:false' in native and 'ranking_mutation:false' in native,'Market Core injection')
need('duplicate_graph:false' in native and 'duplicate_fiche:false' in native and 'duplicate_depth:false' in native,'duplicate UX')
need('real_order:false' in native and 'wallet:false' in native,'financial safety')
need('recurring_timer:false' in native and 'mutation_observer:false' in native and 'storage_write:false' in native,'runtime safety')

def blob(p):
    return subprocess.check_output(['git','hash-object',str(p)],text=True).strip()

need(blob(ADMIN/'app.js')=='3507514b8a90366a7ca1b5d86e5cf3f700be31ab','app.js changed')
need(blob(ADMIN/'js/new-listings.js')=='e1f58e8b45eae43521b6e939a1d78ad511fdfe92','Radar owner changed')
need(blob(ADMIN/'js/okx-local-backend-transport.js')=='fa4660cdf1f8176c9e4c40cd0a20be3b05d583ad','OKX transport changed')
need(blob(ADMIN/'js/okx-microstructure-406499.js')=='aaa9f60b994f12e2f80a0d05f8b247422c2e7e8f','Depth owner changed')
need(blob(ADMIN/'js/graph-native-usd-406520.js')=='23db576e3a9035c6df92f0bfafeb830f1e7d9ffa','native USD graph owner changed')
need(blob(ADMIN/'js/market-fiche-display-406518.js')=='5a399f8cc76cb391ce3352dc015c6a28f8b726df','Market/Fiche owner changed')
need(blob(ADMIN/'js/market-microscope-candles-406498.js')=='e64eed8ab8283370385efdaaf90543ff6291807d','candles owner changed')
need(blob(ADMIN/'js/new-listings-live-asset-406529.js')=='0e3f7bb2d9f604178c429e87f55ab1481400625b','live bridge blob mismatch')
need(blob(ADMIN/'js/new-listings-native-category-406531.js')=='88bd6eefae6d2c3b38e1ef46e38f79c50f4be678','531 module blob mismatch')

print(json.dumps({'ok':True,'build':'40.6.531','market_core':'38.15.11','native_category_blob':'88bd6eefae6d2c3b38e1ef46e38f79c50f4be678','live_bridge_blob':'0e3f7bb2d9f604178c429e87f55ab1481400625b','terrain':'PENDING_FIREFOX'}))
