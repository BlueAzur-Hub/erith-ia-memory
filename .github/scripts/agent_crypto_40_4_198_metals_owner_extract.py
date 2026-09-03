from pathlib import Path
import re

SRC = Path('public/agent_crypto_erith_ia/administrator/app.js')
OUT = Path('.github/diagnostics/agent_crypto_40_4_198_metals_owner.txt')
text = SRC.read_text(encoding='utf-8')

needles = [
    'atlasMetalsQuoteFoundationAssetPoints',
    'atlasMetalsQuoteFoundationPeriodRows',
    'atlasMetalsQuoteFoundationHorizonReading',
    'atlasMetalsQuoteFoundationRenderAnalysisHorizons',
    'data-metals-period',
    'atlasMetalsUnifiedToolbar',
    'atlasMetalsPeriod',
]

chunks=[]
for needle in needles:
    positions=[m.start() for m in re.finditer(re.escape(needle), text)]
    chunks.append(f'### {needle} occurrences={len(positions)} positions={positions[:20]}\n')
    for n,pos in enumerate(positions[:8],1):
        lo=max(0,pos-2200); hi=min(len(text),pos+4200)
        snippet=text[lo:hi]
        chunks.append(f'--- {needle} #{n} @{pos} ---\n{snippet}\n--- END ---\n')

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text('\n'.join(chunks), encoding='utf-8')
print(f'wrote {OUT} {OUT.stat().st_size} bytes')
