from pathlib import Path

p = Path('.github/scripts/agent_crypto_40_4_166r1_167.py')
t = p.read_text(encoding='utf-8')
old = "    if 'const ATLAS_RELEASE = ' in t:"
if old not in t:
    raise SystemExit('runner patch target missing')
p.write_text(t.replace(old, '    if False:', 1), encoding='utf-8')
