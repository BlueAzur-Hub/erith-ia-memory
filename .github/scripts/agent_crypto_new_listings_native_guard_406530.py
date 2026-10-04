#!/usr/bin/env python3
from pathlib import Path
import json, subprocess
ROOT=Path(__file__).resolve().parents[2]
ADMIN=ROOT/'public/agent_crypto_erith_ia/administrator'

def need(v,m):
    if not v:
        raise SystemExit('NEW_LISTINGS_NATIVE_406530_FAIL: '+m)

build=json.loads((ADMIN/'build.json').read_text(encoding='utf-8'))
index=(ADMIN/'index.html').read_text(encoding='utf-8')
live=(ADMIN/'js/new-listings-live-asset-406529.js').read_text(encoding='utf-8')
native=(ADMIN/'js/new-listings-native-market-406530.js').read_text(encoding='utf-8')
candles=(ADMIN/'js/market-microscope-candles-406498.js').read_text(encoding='utf-8')

need(build.get('build')=='40.6.530','build')
need(build.get('parent_build')=='40.6.529','parent')
need(build.get('market_core')=='38.15.11' and build.get('market_core_modified') is False,'market core')
need('new-listings-live-asset-406529.js?v=40.6.530' in index,'live module load')
need('new-listings-native-market-406530.js?v=40.6.530' in index,'native module load')
need(index.index('new-listings-live-asset-406529.js?v=40.6.530') < index.index('new-listings-native-market-406530.js?v=40.6.530') < index.index('market-microscope-candles-406498.js?v=40.6.530'),'load order')
need('NEW_LISTINGS_AS_MARKET_SOURCE_NOT_SECOND_WORKSPACE' in (ADMIN/'build.json').read_text(encoding='utf-8'),'destination contract')
need('state.active=frozen({...ctx,marketTicker' in live,'quote overwrite not fixed')
need('quoteCurrency:ctx.quote' in live,'ticker quote truth missing')
need('nativeMarket:options?.nativeMarket===true' in live,'native load option missing')
need('new_listing_is_market_source:true' in native,'native market source missing')
need('native_fiche_reused:true' in native,'Fiche reuse missing')
need('native_line_graph_reused:true' in native,'line graph reuse missing')
need('native_candles_owner_reused:true' in native,'candles reuse missing')
need('native_depth_owner_reused:true' in native,'depth reuse missing')
need('duplicate_graph:false' in native and 'duplicate_fiche:false' in native and 'duplicate_depth:false' in native,'duplicate UX regression')
need('state_coins_injection:false' in native and 'ranking_mutation:false' in native,'Market Core injection')
need('AtlasExternalChart?.open?.(coin,1)' in native,'existing line graph not reused')
need('AgentCryptoNewListingLiveAsset?.load?.' in native,'exchange context bridge missing')
need('document.getElementById(LEGACY_PANEL_ID);if(legacy)legacy.hidden=true' in native,'legacy panel not hidden')
need('state.mode==="candles")' in candles,'candles mode guard missing')
need('classList.toggle("is-open",state.mode==="candles")' in candles,'native line still covered by candle shell')
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
need(blob(ADMIN/'js/new-listings-live-asset-406529.js')=='b50fc8b61a78694c5aa7df3204efe361c0c19a5e','live bridge blob mismatch')
need(blob(ADMIN/'js/new-listings-native-market-406530.js')=='4f66e8b622437fb3e4796f0eb42298a39213370a','native module blob mismatch')
need(blob(ADMIN/'js/market-microscope-candles-406498.js')=='e64eed8ab8283370385efdaaf90543ff6291807d','candles blob mismatch')

print(json.dumps({
  'ok':True,
  'build':'40.6.530',
  'app_protected':True,
  'market_core':'38.15.11',
  'native_market_blob':'4f66e8b622437fb3e4796f0eb42298a39213370a',
  'live_bridge_blob':'b50fc8b61a78694c5aa7df3204efe361c0c19a5e',
  'candles_blob':'e64eed8ab8283370385efdaaf90543ff6291807d',
  'terrain':'PENDING_FIREFOX'
}))
