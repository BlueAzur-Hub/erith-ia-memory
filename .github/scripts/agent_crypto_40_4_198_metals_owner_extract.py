from pathlib import Path
import re

APP = Path('public/agent_crypto_erith_ia/administrator/app.js')
INDEX = Path('public/agent_crypto_erith_ia/administrator/index.html')
OUT = Path('.github/diagnostics/agent_crypto_40_4_198_metals_owner_focus.txt')
app = APP.read_text(encoding='utf-8')
index = INDEX.read_text(encoding='utf-8')


def balanced_function(text, name):
    m = re.search(rf'function\s+{re.escape(name)}\s*\(', text)
    if not m:
        return f'FUNCTION {name}: NOT FOUND\n'
    brace = text.find('{', m.start())
    if brace < 0:
        return f'FUNCTION {name}: OPEN BRACE NOT FOUND\n'
    depth = 0
    quote = None
    escape = False
    for i in range(brace, len(text)):
        ch = text[i]
        if quote:
            if escape:
                escape = False
            elif ch == '\\':
                escape = True
            elif ch == quote:
                quote = None
            continue
        if ch in ('"', "'", '`'):
            quote = ch
            continue
        if ch == '{': depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                return text[m.start():i+1] + '\n'
    return f'FUNCTION {name}: UNBALANCED\n'

chunks=[]
for name in [
    'atlasParallelMarketMetalsState',
    'atlasMetalsQuoteFoundationPeriodRows',
    'atlasMetalsQuoteFoundationAssetPoints',
    'atlasMetalsQuoteFoundationChartSeries',
    'atlasRenderParallelMarket',
    'atlasRenderParallelMarketToolbar',
    'atlasRenderMetalsChart',
]:
    chunks.append(f'### FUNCTION {name}\n{balanced_function(app, name)}')

for source_name, text in [('APP', app), ('INDEX', index)]:
    for needle in ['data-metals-period', 'atlasMetalsUnifiedToolbar', 'atlasMarketDomainSwitch', 'metals.period', 'atlasParallelMarketMetalsState().period']:
        positions=[m.start() for m in re.finditer(re.escape(needle), text)]
        chunks.append(f'### {source_name} NEEDLE {needle} count={len(positions)} positions={positions[:20]}\n')
        for n,pos in enumerate(positions[:10],1):
            lo=max(0,pos-900); hi=min(len(text),pos+1500)
            chunks.append(f'--- {n} @{pos} ---\n{text[lo:hi]}\n--- END ---\n')

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text('\n'.join(chunks), encoding='utf-8')
print(f'wrote {OUT} {OUT.stat().st_size} bytes')
