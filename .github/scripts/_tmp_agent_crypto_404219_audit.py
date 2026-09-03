#!/usr/bin/env python3
from pathlib import Path
from urllib.parse import urlsplit
import re, json, subprocess, hashlib

REPO=Path('.')
ADMIN=REPO/'public/agent_crypto_erith_ia/administrator'
subprocess.run(['python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.218'],check=True)

index=(ADMIN/'index.html').read_text(encoding='utf-8')
manifest=json.loads((ADMIN/'version.json').read_text(encoding='utf-8'))
hashed=set(str(x) for x in (manifest.get('files') or {}).keys())

print('===== LOADED LOCAL ASSET CACHE / HASH AUDIT =====')
raw=[]
for m in re.finditer(r'<(?:script|link)\b[^>]*(?:src|href)=["\']([^"\']+)["\'][^>]*>',index,re.I):
    u=m.group(1)
    if u.startswith(('http://','https://','//','#','data:')): continue
    path=urlsplit(u).path
    if not path or path.endswith('/') or path.startswith('../'): continue
    rel=path[2:] if path.startswith('./') else path.lstrip('/')
    p=ADMIN/rel
    if p.is_file(): raw.append((u,rel,p))

print('loaded_local_assets',len(raw))
for u,rel,p in raw:
    query=urlsplit(u).query
    token=''
    for part in query.split('&'):
        if part.startswith('v='): token=part[2:]
    builds=re.findall(r'40\.4\.\d+',token)
    # last commit touching file; release subject when available
    log=subprocess.run(['git','log','-1','--format=%H%x09%s','--',str(p)],capture_output=True,text=True,check=True).stdout.strip()
    last_sha,last_subject=(log.split('\t',1)+[''])[:2] if '\t' in log else (log,'')
    last_builds=re.findall(r'40\.4\.\d+',last_subject)
    in_hash=rel in hashed
    short=hashlib.sha256(p.read_bytes()).hexdigest()[:12]
    print(json.dumps({
        'url':u,'rel':rel,'token':token or None,'token_build':builds[-1] if builds else None,
        'manifest_hashed':in_hash,'sha256_12':short,'last_commit':last_sha[:12],
        'last_subject':last_subject,'last_release_build':last_builds[-1] if last_builds else None
    },ensure_ascii=False))

print('===== STALE NUMERIC TOKEN CANDIDATES =====')
def tup(s): return tuple(int(x) for x in s.split('.'))
stale=[]
for u,rel,p in raw:
    q=urlsplit(u).query
    tm=re.search(r'(40\.4\.\d+)',q)
    if not tm: continue
    token_build=tm.group(1)
    history=subprocess.run(['git','log','--format=%H%x09%s','--',str(p)],capture_output=True,text=True,check=True).stdout.splitlines()
    latest_release=None
    for line in history:
        if '\t' not in line: continue
        _,subject=line.split('\t',1)
        ms=re.findall(r'40\.4\.\d+',subject)
        if ms:
            latest_release=ms[-1]; break
    if latest_release and tup(latest_release)>tup(token_build):
        stale.append((rel,token_build,latest_release,u))
        print('STALE?',rel,'token',token_build,'latest_release_touch',latest_release,'url',u)
print('stale_candidate_count',len(stale))

print('===== UNVERSIONED SCRIPT/STYLE ASSETS =====')
unversioned=[]
for u,rel,p in raw:
    if '?' not in u and p.suffix.lower() in ('.js','.css'):
        unversioned.append(rel); print(rel)
print('unversioned_js_css_count',len(unversioned))

print('===== LOADED ASSETS NOT IN VERSION MANIFEST HASH MAP =====')
not_hashed=[]
for _,rel,p in raw:
    if p.suffix.lower() in ('.js','.css') and rel not in hashed:
        not_hashed.append(rel); print(rel)
print('loaded_js_css_not_hashed_count',len(not_hashed))

print('===== ATLAS CURRENT / HEARTBEAT OWNER AUDIT =====')
hb=ADMIN/'js/atlas-heartbeat-rearm.js'
if not hb.is_file(): raise SystemExit('STOP atlas-heartbeat-rearm.js missing')
h=hb.read_text(encoding='utf-8')
print({k:h.count(k) for k in ('fetch(','setInterval(','setTimeout(','MutationObserver','IntersectionObserver','WebSocket','requestAnimationFrame(','addEventListener(')})
for needle in ('CURRENT','heartbeat','atlas','dispatchEvent','DOMContentLoaded','load'):
    if needle.lower() in h.lower():
        print('MARKER',needle,'present')
print(h[:12000])
if h.count('setInterval(') or h.count('fetch(') or h.count('MutationObserver') or h.count('WebSocket'):
    raise SystemExit('STOP Atlas heartbeat rearm owns forbidden recurring/network primitive')

print('AUDIT_404219_OK')
