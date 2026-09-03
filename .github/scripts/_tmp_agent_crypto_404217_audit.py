#!/usr/bin/env python3
from pathlib import Path
import re, json, hashlib, subprocess

ROOT=Path('public/agent_crypto_erith_ia/administrator')

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()[:16]
def txt(p): return p.read_text(encoding='utf-8', errors='replace')
def section(name): print(f'\n===== {name} =====')

def snippets(text, needles, radius=650):
    for needle in needles:
        start=0; n=0
        while True:
            i=text.find(needle,start)
            if i<0: break
            n+=1
            lo=max(0,i-radius); hi=min(len(text),i+len(needle)+radius)
            print(f'--- {needle!r} hit {n} @ char {i} ---')
            print(text[lo:hi].replace('\r',''))
            start=i+len(needle)
            if n>=4:
                print('... capped at 4 hits')
                break
        if n==0: print(f'--- {needle!r}: 0 hits ---')

section('BASELINE')
subprocess.run(['python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.216'],check=True)
for p in [ROOT/'version.json',ROOT/'build.json',ROOT/'administrator-version.json']:
    d=json.loads(txt(p)); print(p.name, {k:d.get(k) for k in ('build','engine','release','status','parent_build','asset_token')})

section('FILE SIZES')
files=[]
for ext in ('*.js','*.css','*.html','*.json'):
    files += list(ROOT.rglob(ext))
for p in sorted(set(files), key=lambda p:p.stat().st_size, reverse=True)[:45]:
    t=txt(p)
    print(f'{p.relative_to(ROOT)}\tbytes={p.stat().st_size}\tlines={t.count(chr(10))+1}\tsha={sha(p)}')

section('RUNTIME PRIMITIVE BUDGETS')
keys=['fetch(','setInterval(','setTimeout(','MutationObserver','IntersectionObserver','new WebSocket','requestAnimationFrame(','addEventListener(','querySelectorAll(','innerHTML','insertAdjacentHTML','localStorage.setItem','sessionStorage.setItem','getBoundingClientRect(','offsetWidth','offsetHeight','clientWidth','clientHeight']
jsfiles=sorted(ROOT.rglob('*.js'), key=lambda p:p.stat().st_size, reverse=True)
for p in jsfiles:
    t=txt(p)
    counts={k:t.count(k) for k in keys}
    if any(counts.values()): print(p.relative_to(ROOT), json.dumps(counts, ensure_ascii=False))

section('INDEX IDS / LOADED ASSETS / CACHE TOKENS')
index=txt(ROOT/'index.html')
ids=re.findall(r'\bid=["\']([^"\']+)',index)
dup={x:ids.count(x) for x in sorted(set(ids)) if ids.count(x)>1}
print('id_count',len(ids),'unique',len(set(ids)),'duplicates',dup)
assets=[]
for m in re.finditer(r'<(?:script|link)\b[^>]*(?:src|href)=["\']([^"\']+)["\'][^>]*>',index,re.I): assets.append(m.group(1))
for a in assets: print('ASSET',a)
print('loaded_assets',len(assets),'versioned',sum('?v=' in a for a in assets),'unversioned',sum('?v=' not in a and not a.startswith(('http:','https:','#')) for a in assets))
for token in sorted(set(re.findall(r'40\.4\.\d+', '\n'.join(assets)))): print('CACHE_BUILD_TOKEN',token)

section('STALE/LOCAL BUILD MARKERS IN LOADED JS')
for p in jsfiles:
    t=txt(p)
    builds=sorted(set(re.findall(r'40\.4\.\d+',t)), key=lambda s:tuple(map(int,s.split('.'))))
    if builds:
        print(p.relative_to(ROOT), 'min=',builds[0],'max=',builds[-1],'tail=',builds[-12:])

root=txt(ROOT/'app.js')
admin=txt(ROOT/'js/app.js')
section('ROOT APP HOT OWNER SNIPPETS')
snippets(root,[
    'function renderMarket',
    'renderMarket(',
    'atlasMarketUniverseCoverageTruth404215',
    'atlasMarketUniverseEnsure403115',
    'marketRows.querySelectorAll',
    'marketRows.addEventListener',
    'els.marketRows.innerHTML',
    'ATLAS DATA',
    'Atlas :',
    'atlasHeartbeat',
    'CURRENT',
    'Market Flow',
    'données historiques anciennes',
],radius=850)

section('ADMIN APP / ATLAS / VERSION SNIPPETS')
snippets(admin,[
    'ADMIN_BUILD',
    'ADMIN_RELEASE',
    'atlasVersionControlText',
    'ATLAS DATA',
    'CURRENT',
    'heartbeat',
    'Atlas',
],radius=800)

section('LISTENER SHAPES ROOT APP')
for pat in [r'\.forEach\([^\n]{0,120}addEventListener', r'for\s*\([^\n]{0,160}addEventListener', r'querySelectorAll\([^\n]{0,180}forEach', r'marketRows[^\n]{0,240}addEventListener']:
    hits=list(re.finditer(pat,root,re.I))
    print('PATTERN',pat,'hits',len(hits))
    for m in hits[:8]: print(root[max(0,m.start()-250):min(len(root),m.end()+350)].replace('\r',''))

section('SUSPICIOUS DUPLICATE LARGE LITERALS')
# Exact long lines repeated in root app can expose accidental code copies. Ignore braces/comments/very short lines.
lines=[ln.strip() for ln in root.splitlines() if len(ln.strip())>=120 and not ln.strip().startswith(('//','/*','*'))]
from collections import Counter
for ln,n in Counter(lines).most_common(25):
    if n>1: print('REPEAT',n,ln[:260])

section('NODE CHECK ALL JS')
fail=[]
for p in jsfiles:
    r=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
    if r.returncode: fail.append((str(p),r.stderr[-1000:]))
print('node_checked',len(jsfiles),'failures',len(fail))
for x in fail: print(x)
if fail: raise SystemExit(2)

section('GIT STATUS')
subprocess.run(['git','status','--short'],check=True)
print('AUDIT_OK')
