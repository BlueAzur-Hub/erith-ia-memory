#!/usr/bin/env python3
from pathlib import Path
import json, subprocess
ROOT=Path(__file__).resolve().parents[2]; ADMIN=ROOT/'public/agent_crypto_erith_ia/administrator'
def need(v,m):
    if not v: raise SystemExit('NEW_LISTINGS_406527_FAIL: '+m)
build=json.loads((ADMIN/'build.json').read_text(encoding='utf-8')); index=(ADMIN/'index.html').read_text(encoding='utf-8'); js=(ADMIN/'js/new-listings.js').read_text(encoding='utf-8')
need(build.get('build')=='40.6.527','build'); need(build.get('market_core')=='38.15.11' and build.get('market_core_modified') is False,'market core')
need('new-listings.js?v=40.6.527' in index,'module not loaded')
need('exchange:"MEXC"' in js and 'pair:"CT/USDC"' in js,'missing MEXC CT/USDC')
need('exchange:"OKX Europe"' in js and 'pair:"CT/USD"' in js and 'pair:"CT/EUR"' in js,'missing OKX Europe CT/USD or CT/EUR')
need('exchange:"OKX"' in js and 'pair:"CT/USDT"' in js,'missing OKX CT/USDT')
need('exchange:"OKX",pair:"CT/USDC"' not in js and 'exchange:"OKX Europe",pair:"CT/USDC"' not in js,'fake OKX CT/USDC')
need('state_coins_injection:false' in js and 'price_fabrication:false' in js,'truth guard')
def blob(p): return subprocess.check_output(['git','hash-object',str(p)],text=True).strip()
need(blob(ADMIN/'app.js')=='3507514b8a90366a7ca1b5d86e5cf3f700be31ab','app changed')
need(blob(ADMIN/'js/okx-local-backend-transport.js')=='fa4660cdf1f8176c9e4c40cd0a20be3b05d583ad','transport changed')
need(blob(ADMIN/'js/okx-microstructure-406499.js')=='c324309cd69acdda04502b0a88894fbc94ba5a0a','depth changed')
need(blob(ADMIN/'js/new-listings.js')=='9eabd9227640a4fe4a74cc743ec36cdddd9a811f','new listings blob mismatch')
print(json.dumps({'ok':True,'build':'40.6.527','module_blob':'9eabd9227640a4fe4a74cc743ec36cdddd9a811f','terrain':'PENDING_FIREFOX'}))
