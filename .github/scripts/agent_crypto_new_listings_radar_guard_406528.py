#!/usr/bin/env python3
from pathlib import Path
import json, subprocess
ROOT=Path(__file__).resolve().parents[2]
ADMIN=ROOT/'public/agent_crypto_erith_ia/administrator'

def need(v,m):
    if not v:
        raise SystemExit('NEW_LISTINGS_RADAR_406528_FAIL: '+m)

build=json.loads((ADMIN/'build.json').read_text(encoding='utf-8'))
index=(ADMIN/'index.html').read_text(encoding='utf-8')
js=(ADMIN/'js/new-listings.js').read_text(encoding='utf-8')

need(build.get('build')=='40.6.528','build')
need(build.get('parent_build')=='40.6.527','parent')
need(build.get('market_core')=='38.15.11' and build.get('market_core_modified') is False,'market core')
need('new-listings.js?v=40.6.528' in index,'module not loaded')
need('button.textContent="Nouveaux listings"' in js,'generic radar button missing')
need('RADAR NOUVEAUX LISTINGS' in js,'radar title missing')
need('canonical_key:"concrete|ct|2026-09-30"' in js,'canonical Concrete identity missing')
need('Ticker CT non unique' in js,'ticker ambiguity warning missing')
need('pair:"CT/USDC"' in js and 'exchange:"MEXC"' in js,'MEXC CT/USDC missing')
need('pair:"CT/USD"' in js and 'exchange:"OKX Europe"' in js,'OKX Europe CT/USD missing')
need('Recherche Web externe' in js and 'result_ingestion:false' in js,'external research boundary missing')
need('state_coins_injection:false' in js and 'ranking_mutation:false' in js and 'price_fabrication:false' in js,'market truth guard')
need('storage_write:false' in js and 'recurring_timer:false' in js and 'mutation_observer:false' in js,'passive runtime guard')
need('real_order:false' in js and 'wallet:false' in js,'financial safety guard')

def blob(p):
    return subprocess.check_output(['git','hash-object',str(p)],text=True).strip()

need(blob(ADMIN/'app.js')=='3507514b8a90366a7ca1b5d86e5cf3f700be31ab','app changed')
need(blob(ADMIN/'js/okx-local-backend-transport.js')=='fa4660cdf1f8176c9e4c40cd0a20be3b05d583ad','transport changed')
need(blob(ADMIN/'js/okx-microstructure-406499.js')=='c324309cd69acdda04502b0a88894fbc94ba5a0a','depth changed')
need(blob(ADMIN/'js/new-listings.js')=='e1f58e8b45eae43521b6e939a1d78ad511fdfe92','radar blob mismatch')

print(json.dumps({
    'ok':True,
    'build':'40.6.528',
    'module_blob':'e1f58e8b45eae43521b6e939a1d78ad511fdfe92',
    'terrain':'PENDING_FIREFOX'
}))
