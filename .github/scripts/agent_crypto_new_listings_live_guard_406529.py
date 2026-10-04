#!/usr/bin/env python3
from pathlib import Path
import json, subprocess
ROOT=Path(__file__).resolve().parents[2]
ADMIN=ROOT/'public/agent_crypto_erith_ia/administrator'

def need(v,m):
    if not v:
        raise SystemExit('NEW_LISTINGS_LIVE_406529_FAIL: '+m)

build=json.loads((ADMIN/'build.json').read_text(encoding='utf-8'))
index=(ADMIN/'index.html').read_text(encoding='utf-8')
live=(ADMIN/'js/new-listings-live-asset-406529.js').read_text(encoding='utf-8')
candles=(ADMIN/'js/market-microscope-candles-406498.js').read_text(encoding='utf-8')
depth=(ADMIN/'js/okx-microstructure-406499.js').read_text(encoding='utf-8')

need(build.get('build')=='40.6.529','build')
need(build.get('parent_build')=='40.6.528','parent')
need(build.get('market_core')=='38.15.11' and build.get('market_core_modified') is False,'market core')
need('new-listings-live-asset-406529.js?v=40.6.529' in index,'live module not loaded')
need(index.index('new-listings.js?v=40.6.529') < index.index('new-listings-live-asset-406529.js?v=40.6.529') < index.index('market-microscope-candles-406498.js?v=40.6.529'),'load order')
need('TEMPORARY_EXTERNAL_SPOT_ANALYSIS_CONTEXT' in (ADMIN/'build.json').read_text(encoding='utf-8'),'manifest context')
need('discoverBitget' in live and 'launchTime' in live,'Bitget discovery missing')
need('fetchCandles' in live and 'fetchOrderBook' in live,'external market adapters missing')
need('providers:frozen(["okx","bitget"])' in live,'provider set missing')
need('top1000_injection:false' in live and 'ranking_mutation:false' in live,'Top1000 guard')
need('real_order:false' in live and 'wallet:false' in live,'financial safety')
need('recurring_timer:false' in live and 'mutation_observer:false' in live and 'storage_write:false' in live,'runtime safety')
need('external_asset_supported:true' in candles,'candles extension missing')
need('NEW LISTING · LIGNE' in candles and 'NEW LISTING · BOUGIES' in candles,'external chart modes missing')
need('external_asset_supported:true' in depth,'depth extension missing')
need('AgentCryptoNewListingLiveAsset?.fetchOrderBook' in depth,'depth adapter missing')

def blob(p):
    return subprocess.check_output(['git','hash-object',str(p)],text=True).strip()

need(blob(ADMIN/'app.js')=='3507514b8a90366a7ca1b5d86e5cf3f700be31ab','app changed')
need(blob(ADMIN/'js/new-listings.js')=='e1f58e8b45eae43521b6e939a1d78ad511fdfe92','Radar 528 changed')
need(blob(ADMIN/'js/okx-local-backend-transport.js')=='fa4660cdf1f8176c9e4c40cd0a20be3b05d583ad','OKX transport changed')
need(blob(ADMIN/'js/graph-native-usd-406520.js')=='23db576e3a9035c6df92f0bfafeb830f1e7d9ffa','native USD graph owner changed')
need(blob(ADMIN/'js/new-listings-live-asset-406529.js')=='de2e3c52fb644b1892a4e2c8383c21bdf67fdb2c','live module blob mismatch')
need(blob(ADMIN/'js/market-microscope-candles-406498.js')=='d5882d987da56204b2d8c2857dd8e33ea68c7457','candles blob mismatch')
need(blob(ADMIN/'js/okx-microstructure-406499.js')=='91fd38becd255096c36897570e06ec13254c3288','depth blob mismatch')

print(json.dumps({
  'ok':True,
  'build':'40.6.529',
  'live_blob':'de2e3c52fb644b1892a4e2c8383c21bdf67fdb2c',
  'candles_blob':'d5882d987da56204b2d8c2857dd8e33ea68c7457',
  'depth_blob':'91fd38becd255096c36897570e06ec13254c3288',
  'terrain':'PENDING_FIREFOX'
}))
