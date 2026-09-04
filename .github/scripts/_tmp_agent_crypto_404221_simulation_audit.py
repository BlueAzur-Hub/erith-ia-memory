#!/usr/bin/env python3
from pathlib import Path
import re, json, subprocess

ROOT=Path('public/agent_crypto_erith_ia/administrator')
FILES=[ROOT/'index.html', ROOT/'app.js', ROOT/'js/app.js']

subprocess.run(['python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.220'],check=True)

needles=[
 'Simulation micro-transactions','PAPER TRADING SANDBOX','Profil 100','Profil actif',
 'Solo Débutant','Solo Progression','1 000','1000','profile','PROFILE',
 'Mode école','MODE ÉCOLE','Parcours terminé','AGENTS À VENIR','ASSISTANT DE REPRISE',
 'KRAKEN PAPER','SIMULATION PASS','erith-strategy-b','paper workspace','workspace',
 'capital virtuel','Capital virtuel','ticket conseillé','Ticket conseillé',
]

for p in FILES:
    text=p.read_text(encoding='utf-8',errors='replace')
    lines=text.splitlines()
    print('\n===== FILE',p,'lines',len(lines),'=====')
    for needle in needles:
        hits=[i for i,l in enumerate(lines,1) if needle.lower() in l.lower()]
        if not hits: continue
        print(f'\n### {needle!r} hits={len(hits)} lines={hits[:30]}')
        for ln in hits[:12]:
            lo=max(1,ln-10); hi=min(len(lines),ln+18)
            print(f'--- {p.name}:{ln} ---')
            for j in range(lo,hi+1): print(f'{j:06d}: {lines[j-1]}')

# Find profile-ish function / const definitions and render owners.
print('\n===== PROFILE OWNER DEFINITIONS =====')
for p in FILES[1:]:
    text=p.read_text(encoding='utf-8',errors='replace')
    lines=text.splitlines()
    pats=[
      r'\b(?:function|const|let|var)\s+[A-Za-z0-9_$]*(?:profile|profil|simulation|paper|school|learn)[A-Za-z0-9_$]*',
      r'\b[A-Za-z0-9_$]*(?:profile|profil)[A-Za-z0-9_$]*\s*=\s*',
    ]
    for pat in pats:
        for m in re.finditer(pat,text,re.I):
            ln=text.count('\n',0,m.start())+1
            print(f'{p}:{ln}: {lines[ln-1].strip()}')

# Extract all ids from the Simulation neighborhood in HTML and report references in runtimes.
index=(ROOT/'index.html').read_text(encoding='utf-8',errors='replace')
start=index.lower().find('paper trading sandbox')
if start<0: start=index.lower().find('simulation micro-transactions')
end=index.lower().find('tests simples',start) if start>=0 else -1
if start>=0 and end<0: end=min(len(index),start+100000)
chunk=index[start:end] if start>=0 else ''
ids=re.findall(r'\bid=["\']([^"\']+)',chunk,re.I)
print('\n===== SIMULATION HTML IDS =====')
print(json.dumps(ids,ensure_ascii=False,indent=2))
for idv in ids:
    refs=[]
    for p in FILES[1:]:
        t=p.read_text(encoding='utf-8',errors='replace')
        c=t.count(idv)
        if c: refs.append((str(p),c))
    if refs: print(idv,refs)

# Find literal conflicting labels currently visible and likely owners.
print('\n===== CONFLICT LITERALS =====')
for p in FILES:
    t=p.read_text(encoding='utf-8',errors='replace')
    for literal in ['Profil 100 €','Solo Débutant 100 €','Solo Progression 1 000 €','Capital virtuel','Ticket conseillé','Maximum opération','Exposition maximale','Réserve minimale','AGENTS À VENIR','Créer un 3e snapshot plus tard','Préparer V1.2-local-plan après repos']:
        for m in re.finditer(re.escape(literal),t,re.I):
            ln=t.count('\n',0,m.start())+1
            lines=t.splitlines(); lo=max(1,ln-8); hi=min(len(lines),ln+14)
            print(f'--- {p}:{ln} {literal!r} ---')
            for j in range(lo,hi+1): print(f'{j:06d}: {lines[j-1]}')

# Report storage keys in functions touching profile/paper state.
print('\n===== STORAGE KEYS NEAR PROFILE OWNERS =====')
for p in FILES[1:]:
    t=p.read_text(encoding='utf-8',errors='replace')
    for m in re.finditer(r'(?i).{0,80}(?:profile|profil|paper|simulation).{0,180}(?:localStorage|indexedDB|idb|storage)|(?:localStorage|indexedDB|idb|storage).{0,180}(?:profile|profil|paper|simulation)',t):
        ln=t.count('\n',0,m.start())+1
        print(f'{p}:{ln}: {m.group(0)[:400].replace(chr(10)," ")}')

# Ensure current JS parses before any change.
print('\n===== NODE CHECK =====')
for p in sorted(ROOT.rglob('*.js')):
    r=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
    if r.returncode:
        print(r.stderr); raise SystemExit(2)
print('NODE_OK')
print('AUDIT_404221_OK')
