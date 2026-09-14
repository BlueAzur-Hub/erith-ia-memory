#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path('public/agent_crypto_erith_ia/administrator')
SHELL = ROOT / 'runtime-shell.html'

text = SHELL.read_text(encoding='utf-8')
original = text

# Release truth is injected by boot.js from build.json. The shell itself carries
# no release number and no build-number cache token.
text = re.sub(r'<meta\s+name="atlas-build"\s+content="[^"]*"\s*/?>', '<meta name="atlas-build" content="" />', text, count=1)
text = re.sub(r'<meta\s+name="administrator-build"\s+content="[^"]*"\s*/?>', '<meta name="administrator-build" content="" />', text, count=1)
text = re.sub(r'<meta\s+name="administrator-release"\s+content="[^"]*"\s*/?>', '<meta name="administrator-release" content="" />', text, count=1)
text = re.sub(r'<meta\s+name="atlas-asset-token"\s+content="[^"]*"\s*/?>', '<meta name="atlas-asset-token" content="runtime" />', text, count=1)
text = re.sub(r'<title>[\s\S]*?</title>', '<title>Agent-Crypto @erith.IA · Administrator</title>', text, count=1)
text = re.sub(r'\?v=administrator-build-\d+\.\d+\.\d+', '', text)
text = re.sub(r'\?v=market-core-v2\.0-alpha-build-\d+\.\d+\.\d+', '', text)

# Canonical owners now loaded by runtime-modules.js. Their historical release
# candidates must not execute in the active document.
retired = (
    'generated-report-version-truth-406103.js',
    'pedagogy-version-truth-406104.js',
    'tradus-strategy-a-reconcile-406105.js',
    'local-ai-contract-consistency-406106.js',
    'visible-version-surface-truth-406107.js',
    'local-dialogue-presentation-406108.js',
    'tradus-canonical-strategy-reader-406123.js',
    'strategy-a-auto-owner-autostart-406124.js',
    'tradus-autonomous-refresh-406119.js',
    'version-truth-406086-authority-lock.js',
)
for name in retired:
    text = re.sub(r'\s*<script\b[^>]*src=["\'][^"\']*' + re.escape(name) + r'[^"\']*["\'][^>]*>\s*</script>', '', text, flags=re.I)

# One stable version owner, once, at the end of the shell.
text = re.sub(r'\s*<script\b[^>]*src=["\'][^"\']*/?js/version-truth\.js[^"\']*["\'][^>]*>\s*</script>', '', text, flags=re.I)
anchor = '</body>'
if anchor not in text:
    raise SystemExit('runtime-shell.html: missing </body>')
text = text.replace(anchor, '  <script src="./js/version-truth.js"></script>\n</body>', 1)

# Direct proof that the shell no longer owns a product release.
for forbidden in ('administrator-build-40.6.', 'version-truth-406086-authority-lock.js'):
    if forbidden in text:
        raise SystemExit(f'runtime-shell cleanup failed: {forbidden}')

if text == original:
    raise SystemExit('runtime-shell cleanup made no change')

SHELL.write_text(text, encoding='utf-8')
print('RUNTIME_SHELL_DECONTAMINATED')
