#!/usr/bin/env python3
from pathlib import Path
import re, subprocess

ROOT=Path('public/agent_crypto_erith_ia/administrator')
subprocess.run(['python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.220'],check=True)

TOKENS=[
 'simProfileTitle','simProfileBadge','simProfileCapital','simProfileTicket','simProfileMaxOperation',
 'simProfileMaxExposure','simProfileMinReserve','simProfileAllowedAssets','simCash','simPositionsValue',
 'simTotalValue','simPnL','simProfileStatus','learningCockpitProfile','learningCockpitPortfolio',
 'data-sim-profile','Solo Débutant 100 €','Solo Progression 1 000 €','Profil actif : Solo Débutant 100 €',
 'Capital virtuel','Ticket conseillé','Maximum opération','Exposition maximale','Réserve minimale'
]

def textfiles():
    for p in ROOT.rglob('*'):
        if p.is_file() and p.suffix.lower() in ('.js','.html','.htm','.css','.json','.md','.txt'):
            yield p

def ctx(lines,ln,b=4,a=8):
    lo=max(1,ln-b); hi=min(len(lines),ln+a)
    for j in range(lo,hi+1): print(f'{j:06d}: {lines[j-1]}')

print('===== RECURSIVE SIMULATION SURFACE OWNER SCAN =====')
for p in textfiles():
    text=p.read_text(encoding='utf-8',errors='replace')
    matched=[t for t in TOKENS if t in text]
    if not matched: continue
    print(f'\n### FILE {p.relative_to(ROOT)} tokens={matched}')
    lines=text.splitlines()
    shown=set()
    for token in matched:
        for i,l in enumerate(lines,1):
            if token not in l: continue
            key=(i,token)
            if key in shown: continue
            shown.add(key)
            print(f'\n--- token {token!r} @ {i} ---')
            ctx(lines,i)

print('\n===== PROFILE/WORKSPACE SWITCH FUNCTIONS =====')
app=(ROOT/'app.js').read_text(encoding='utf-8',errors='replace')
lines=app.splitlines()
for pat in (
 r'function\s+switchSimulationProfile',
 r'function\s+.*Workspace.*404142',
 r'PAPER_WORKSPACE_404142\s*=',
 r'PAPER_WORKSPACE_ACTIVE_KEY_404142',
 r'function\s+renderSimulation\s*\(',
 r'function\s+loadSimulation\s*\(',
 r'function\s+renderLearningJourneyCockpit\s*\(',
):
    print('\nPATTERN',pat)
    for m in re.finditer(pat,app,re.I):
        ln=app.count('\n',0,m.start())+1
        ctx(lines,ln,7,28)

print('\n===== SIMULATION STATIC DOM ORIGIN SUMMARY =====')
for idv in ('simProfileTitle','simProfileCapital','simCash','learningCockpitProfile'):
    owners=[]
    for p in textfiles():
        text=p.read_text(encoding='utf-8',errors='replace')
        if idv in text:
            owners.append(str(p.relative_to(ROOT)))
    print(idv,owners)

for p in sorted(ROOT.rglob('*.js')):
    r=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
    if r.returncode: print(r.stderr); raise SystemExit(2)
print('NODE_OK')
print('FOCUS3_404221_OK')
