#!/usr/bin/env python3
from pathlib import Path

BASE=Path('public/agent_crypto_erith_ia/administrator')
PARENT='40.4.264'
BUILD='40.4.265'

index=BASE/'index.html'
text=index.read_text(encoding='utf-8')
old=f'./js/views/system-presentation.js?v=administrator-build-{PARENT}'
new=f'./js/views/system-presentation.js?v=administrator-build-{BUILD}'
if text.count(old)!=1:
    raise SystemExit(f'404265_SYNC_FAIL: index System token count={text.count(old)}')
index.write_text(text.replace(old,new,1),encoding='utf-8')

system=BASE/'js/views/system-presentation.js'
text=system.read_text(encoding='utf-8')
old=f'const SOURCE="./views/system.html?v=administrator-build-{PARENT}";'
new=f'const SOURCE="./views/system.html?v=administrator-build-{BUILD}";'
if text.count(old)!=1:
    raise SystemExit(f'404265_SYNC_FAIL: System SOURCE token count={text.count(old)}')
system.write_text(text.replace(old,new,1),encoding='utf-8')

# The current root app contains two historical 40.4.144 comment markers.
# Anchor the one-shot .265 owner on the unique .261 Strategy owner instead.
driver=Path('.github/scripts/agent_crypto_404265_auto_paper_runner.py')
text=driver.read_text(encoding='utf-8')
old='KRAKEN_MARKER = "/* 40.4.144 — KRAKEN CLI LOCAL READ-ONLY HANDSHAKE"'
new='KRAKEN_MARKER = "/* 40.4.261 — STRATEGY A TRADE PROPOSAL ENVELOPE FOUNDATION LOCK */"'
if text.count(old)!=1:
    raise SystemExit(f'404265_SYNC_FAIL: driver anchor count={text.count(old)}')
driver.write_text(text.replace(old,new,1),encoding='utf-8')

print('40.4.265 SYSTEM TOKEN + DRIVER ANCHOR SYNC PASS')
