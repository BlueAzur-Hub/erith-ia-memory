#!/usr/bin/env python3
"""Remove historical price relabel/temporary global formatter overrides."""
from pathlib import Path
import subprocess
p=Path("public/agent_crypto_erith_ia/administrator/js/graph-native-usd-406520.js")
old=subprocess.check_output(["git","hash-object",str(p)],text=True).strip()
assert old=="76cf098509c4ebb295bca3d38392b74acf91396b",old
s=p.read_text(encoding="utf-8")
patterns=[
 ('const text=v=>!usd()?v:String(v??"").replaceAll("Prix EUR","Prix USD").replaceAll("PRIX EUR","PRIX USD").replaceAll("CoinGecko EUR","CoinGecko USD").replaceAll("Binance EUR DIRECT","CoinGecko USD DIRECT");\n',''),
 ('function withFmt(cb){if(!usd()||typeof globalThis.atlasFormatEUR!=="function")return cb();const s=globalThis.atlasFormatEUR;try{globalThis.atlasFormatEUR=money;return cb()}finally{globalThis.atlasFormatEUR=s}}\n',''),
 (' const r=parity?o.apply(this,a):withFmt(()=>o.apply(this,a));',
  ' // The app.js renderer owns currency-qualified values. Never swap a global EUR formatter.\n const r=o.apply(this,a);')
]
for a,b in patterns:
    assert s.count(a)==1,(a[:70],s.count(a))
    s=s.replace(a,b,1)
p.write_text(s,encoding="utf-8",newline="\n")
print("USD display module no longer rewrites EUR text or global formatter")
print("source_blob="+subprocess.check_output(["git","hash-object",str(p)],text=True).strip())
