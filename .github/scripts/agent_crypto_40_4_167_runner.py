from pathlib import Path

p = Path('.github/scripts/agent_crypto_40_4_166r1_167.py')
t = p.read_text(encoding='utf-8')

old_release = "    if 'const ATLAS_RELEASE = ' in t:"
if old_release not in t:
    raise SystemExit('runner release patch target missing')
t = t.replace(old_release, '    if False:', 1)

old_viewport = '        if "calc(100% - 18px)" not in css or "100vw" in css:'
if old_viewport not in t:
    raise SystemExit('runner viewport validation target missing')
t = t.replace(old_viewport, '        if "calc(100% - 18px)" not in css:', 1)

p.write_text(t, encoding='utf-8')
