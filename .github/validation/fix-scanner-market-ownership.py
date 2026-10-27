#!/usr/bin/env python3
from pathlib import Path
import hashlib, subprocess
p=Path('public/agent_crypto_erith_ia/administrator/app.js')
initial=subprocess.check_output(['git','hash-object',str(p)],text=True).strip()
assert initial=='edd211448c1babc6c5f13838dadaa735a2e1b8e3',f'Unexpected main source {initial}'
s=p.read_text(encoding='utf-8')
changes=[
('    .filter(coin => atlasHasPositiveQuote(coin?.priceEur ?? coin?.price))',
 '    .filter(coin => atlasHasPositiveQuote(coin?.priceEur)\n      || atlasHasPositiveQuote(coin?.priceUsd)\n      || atlasHasPositiveQuote(coin?.price))',2),
('      candidateIds: pool.map(coin => coin.id),\n      cacheChecked: 0,',
 '      candidateIds: pool.map(coin => coin.id),\n      // Freeze the exact Market candidates, not the potentially stale state.coins copy.\n      candidateCoins: pool.map(coin => ({ ...coin })),\n      cacheChecked: 0,',1),
('  const coins = tx.candidateIds\n    .map(id => state.coins.find(coin => coin.id === id))\n    .filter(Boolean);\n  const networkQueue = [];',
 '  // The Market universe owns selection. state.coins may lag its latest snapshot.\n  const selectedMarketCoins = Array.isArray(tx.candidateCoins)\n    ? tx.candidateCoins\n    : (Array.isArray(state.coins) ? state.coins : []);\n  const coins = tx.candidateIds\n    .map(id => selectedMarketCoins.find(coin => coin.id === id))\n    .filter(Boolean);\n  const networkQueue = [];',1)
]
for old,new,count in changes:
    assert s.count(old)==count,(old[:60],s.count(old),count)
    s=s.replace(old,new)
expected='88118759a8ce7eff1bae4944edd9973681e16444'
p.write_text(s,encoding='utf-8',newline='\n')
digest=subprocess.check_output(['git','hash-object',str(p)],text=True).strip()
assert digest==expected,(digest,expected)
print('PATCH_APPLIED_SOURCE_HASH='+digest)
