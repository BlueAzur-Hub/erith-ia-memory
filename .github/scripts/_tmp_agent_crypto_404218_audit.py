#!/usr/bin/env python3
from pathlib import Path
import re, subprocess, json

ROOT=Path('public/agent_crypto_erith_ia/administrator')
subprocess.run(['python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.217'],check=True)

needles=(
    'atlasVersionControlText',
    'Market Core V2.0-Alpha',
    'keepGlobalVersionVisible',
    'administratorBuild',
    'agentCryptoBuild',
    'Version Agent-Crypto installée',
)
files=[]
for ext in ('*.js','*.html','*.json'):
    files.extend(ROOT.rglob(ext))

print('===== GLOBAL VERSION WRITER AUDIT =====')
for p in sorted(set(files)):
    text=p.read_text(encoding='utf-8',errors='replace')
    hits=[]
    for needle in needles:
        pos=[m.start() for m in re.finditer(re.escape(needle),text)]
        if pos: hits.append((needle,pos))
    if not hits: continue
    print(f'FILE {p.relative_to(ROOT)}')
    for needle,pos in hits:
        print(f'  {needle}: {len(pos)}')
        for i in pos[:8]:
            lo=max(0,i-500); hi=min(len(text),i+len(needle)+700)
            print('---')
            print(text[lo:hi].replace('\r',''))

print('===== DIRECT BADGE WRITE SHAPES =====')
patterns=(
    r'getElementById\(["\']atlasVersionControlText["\']\)',
    r'byId\(["\']atlasVersionControlText["\']\)',
    r'atlasVersionControlText[^\n]{0,240}(?:textContent|innerHTML|replaceChildren)',
    r'versionText[^\n]{0,240}(?:textContent|innerHTML|replaceChildren)',
)
for p in sorted(ROOT.rglob('*.js')):
    text=p.read_text(encoding='utf-8',errors='replace')
    for pat in patterns:
        ms=list(re.finditer(pat,text,re.I))
        if ms:
            print(p.relative_to(ROOT),pat,'hits',len(ms))
            for m in ms[:12]: print(text[max(0,m.start()-350):min(len(text),m.end()+500)].replace('\r',''))

print('===== VERSION OBSERVER COUNTS =====')
for rel in ('js/app.js','js/version-truth.js','js/market-stack.js','app.js'):
    p=ROOT/rel; text=p.read_text(encoding='utf-8')
    print(rel,{
        'MutationObserver':text.count('MutationObserver'),
        'atlasVersionControlText':text.count('atlasVersionControlText'),
        'keepGlobalVersionVisible':text.count('keepGlobalVersionVisible'),
        'MarketCoreBadgeLiteral':text.count('Market Core V2.0-Alpha'),
    })

# Hard facts expected after 40.4.211.
market=(ROOT/'js/market-stack.js').read_text(encoding='utf-8')
if 'atlasVersionControlText' in market:
    raise SystemExit('STOP market-stack still references global version badge')
version=(ROOT/'js/version-truth.js').read_text(encoding='utf-8')
admin=(ROOT/'js/app.js').read_text(encoding='utf-8')
if admin.count('function keepGlobalVersionVisible()')!=1:
    raise SystemExit('STOP compatibility observer shape unexpected')
if admin.count('keepGlobalVersionVisible();')!=1:
    raise SystemExit('STOP compatibility observer call shape unexpected')
if admin.count('new MutationObserver')<1:
    raise SystemExit('STOP no observer to audit')
print('AUDIT_404218_OK')
