#!/usr/bin/env python3
from pathlib import Path
import json, subprocess
ROOT=Path(__file__).resolve().parents[2]; ADMIN=ROOT/'public/agent_crypto_erith_ia/administrator'
def need(v,m):
    if not v: raise SystemExit('OKX_TRANSPORT_406526_FAIL: '+m)
build=json.loads((ADMIN/'build.json').read_text(encoding='utf-8')); index=(ADMIN/'index.html').read_text(encoding='utf-8'); js=(ADMIN/'js/okx-local-backend-transport.js').read_text(encoding='utf-8')
need(build.get('build')=='40.6.526','build'); need(build.get('market_core')=='38.15.11' and build.get('market_core_modified') is False,'market core')
need('okx-local-backend-transport.js?v=40.6.526' in index,'canonical transport not loaded'); need('okx-local-backend-transport-406500.js?v=40.6.526' not in index,'historical transport still loaded')
need('const BUILD="40.6.526"' in js,'transport build'); need('requestSignal(input,init)' in js,'signal resolver missing'); need('signal});' in js,'signal not forwarded'); need('abort_signal_preserved:true' in js,'abort contract missing')
def blob(p): return subprocess.check_output(['git','hash-object',str(p)],text=True).strip()
need(blob(ADMIN/'app.js')=='3507514b8a90366a7ca1b5d86e5cf3f700be31ab','app changed')
need(blob(ADMIN/'js/okx-microstructure-406499.js')=='c324309cd69acdda04502b0a88894fbc94ba5a0a','depth changed')
need(blob(ADMIN/'js/market-microscope-candles-406498.js')=='ea2ef80af94fa6e2be539886287c7f754025fe9b','candles changed')
need(blob(ADMIN/'js/okx-local-backend-transport.js')=='fa4660cdf1f8176c9e4c40cd0a20be3b05d583ad','transport blob mismatch')
print(json.dumps({'ok':True,'build':'40.6.526','transport_blob':'fa4660cdf1f8176c9e4c40cd0a20be3b05d583ad','terrain':'PENDING_FIREFOX'}))
