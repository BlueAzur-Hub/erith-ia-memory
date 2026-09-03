from pathlib import Path
import re

APP = Path('public/agent_crypto_erith_ia/administrator/app.js')
INDEX = Path('public/agent_crypto_erith_ia/administrator/index.html')
OUT = Path('.github/diagnostics/agent_crypto_40_4_198_metals_owner_focus.txt')
app = APP.read_text(encoding='utf-8')
index = INDEX.read_text(encoding='utf-8')


def function_slice(text, name):
    m = re.search(rf'(?m)^function\s+{re.escape(name)}\s*\(', text)
    if not m:
        return f'FUNCTION {name}: NOT FOUND\n'
    nxt = re.search(r'(?m)^function\s+[A-Za-z_$][\w$]*\s*\(', text[m.end():])
    end = m.end() + nxt.start() if nxt else min(len(text), m.start() + 12000)
    return text[m.start():end].rstrip() + '\n'

names = [
    'atlasParallelMarketMetalsState',
    'atlasParallelMarketSetMetalsPeriod',
    'atlasMetalsMathCoreMetrics',
    'atlasMetalsQuoteFoundationPeriodRows',
    'atlasMetalsQuoteFoundationAssetPoints',
    'atlasMetalsQuoteFoundationChartSeries',
    'atlasMetalsQuoteFoundationHorizonReading',
    'atlasMetalsHumanReadingPeriodLabel',
    'atlasMetalsQuoteFoundationRenderHumanReading',
    'atlasParallelMarketRenderMetals',
]
chunks = [f'### FUNCTION {name}\n{function_slice(app, name)}' for name in names]

for source_name, text in [('APP', app), ('INDEX', index)]:
    for needle in ['data-metals-period', 'atlasMetalsUnifiedToolbar']:
        positions=[m.start() for m in re.finditer(re.escape(needle), text)]
        chunks.append(f'### {source_name} NEEDLE {needle} count={len(positions)} positions={positions[:20]}\n')
        for n,pos in enumerate(positions[:6],1):
            lo=max(0,pos-700); hi=min(len(text),pos+1200)
            chunks.append(f'--- {n} @{pos} ---\n{text[lo:hi]}\n--- END ---\n')

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text('\n'.join(chunks), encoding='utf-8')
print(f'wrote {OUT} {OUT.stat().st_size} bytes')
