#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import json
import re

ROOT=Path('public/agent_crypto_erith_ia/administrator')
ENTRY=Path('runtime-shell.html')

STAMP_RE=re.compile(r'^(?P<base>.+?)-(?P<stamp>(?:39|40)\d{2,4}|40\.\d+\.\d+)(?P<tail>(?:\.[A-Za-z0-9_-]+)?)$')
HTML_JS_RE=re.compile(r'(?:src|href)=["\'](?P<ref>[^"\']+\.js(?:\?[^"\']*)?)["\']',re.I)
JS_PATH_RE=re.compile(r'(?P<ref>(?:\.\.?/|/)?js/[A-Za-z0-9_./-]+\.js)(?:\?[^"\'`\s)]*)?',re.I)
REL_JS_RE=re.compile(r'(?P<ref>\.\.?/[A-Za-z0-9_./-]+\.js)(?:\?[^"\'`\s)]*)?',re.I)

def strip_query(ref:str)->str:
    return ref.split('?',1)[0].split('#',1)[0]

def resolve_candidates(source_rel:Path,ref:str)->set[Path]:
    clean=strip_query(ref).replace('\\','/')
    out:set[Path]=set()
    if clean.startswith('/'):
        rel=Path(clean.lstrip('/'))
        if (ROOT/rel).is_file(): out.add(rel)
        return out
    if clean.startswith('js/'):
        rel=Path(clean)
        if (ROOT/rel).is_file(): out.add(rel)
        return out
    if clean.startswith('./js/'):
        root_rel=Path(clean[2:])
        if (ROOT/root_rel).is_file(): out.add(root_rel)
        try:
            src_rel=((ROOT/source_rel).parent/clean).resolve().relative_to(ROOT.resolve())
            if (ROOT/src_rel).is_file(): out.add(src_rel)
        except Exception: pass
        return out
    if clean.startswith(('./','../')):
        try:
            src_rel=((ROOT/source_rel).parent/clean).resolve().relative_to(ROOT.resolve())
            if (ROOT/src_rel).is_file(): out.add(src_rel)
        except Exception: pass
        if clean.startswith('./'):
            root_rel=Path(clean[2:])
            if (ROOT/root_rel).is_file(): out.add(root_rel)
    return out

def refs(text:str)->list[str]:
    r=[m.group('ref') for m in HTML_JS_RE.finditer(text)]
    r += [m.group('ref') for m in JS_PATH_RE.finditer(text)]
    r += [m.group('ref') for m in REL_JS_RE.finditer(text)]
    return list(dict.fromkeys(r))

def graph():
    queue=[ENTRY]; seen:set[Path]=set(); edges:dict[Path,set[Path]]={}; texts:dict[Path,str]={}
    while queue:
        rel=queue.pop(0)
        if rel in seen: continue
        full=ROOT/rel
        if not full.is_file() or full.suffix.lower() not in {'.html','.js'}: continue
        try: text=full.read_text(encoding='utf-8')
        except UnicodeDecodeError: continue
        seen.add(rel); texts[rel]=text
        targets:set[Path]=set()
        for ref in refs(text): targets.update(resolve_candidates(rel,ref))
        edges[rel]=targets
        for target in sorted(targets,key=str):
            if target.suffix.lower() in {'.html','.js'} and target not in seen: queue.append(target)
    return seen,edges,texts

reachable,edges,texts=graph()
all_js=sorted((p.relative_to(ROOT) for p in (ROOT/'js').rglob('*.js')),key=str)
entries=[]
for rel in all_js:
    m=STAMP_RE.match(rel.stem)
    if not m: continue
    canonical=rel.with_name(m.group('base')+m.group('tail')+rel.suffix)
    if not (ROOT/canonical).is_file(): continue
    inbound=sorted(str(src) for src,targets in edges.items() if rel in targets)
    literals=sorted(str(src) for src,text in texts.items() if rel.name in text)
    entries.append({
        'versioned':str(rel),
        'canonical':str(canonical),
        'versioned_reachable':rel in reachable,
        'canonical_reachable':canonical in reachable,
        'active_inbound':inbound,
        'active_literal_sources':literals,
        'proven_orphan_candidate': rel not in reachable and canonical in reachable and not inbound and not literals,
        'versioned_bytes':(ROOT/rel).stat().st_size,
        'canonical_bytes':(ROOT/canonical).stat().st_size,
    })

safe=[e for e in entries if e['proven_orphan_candidate']]
blocked=[e for e in entries if not e['proven_orphan_candidate']]
print(json.dumps({
    'build':json.loads((ROOT/'build.json').read_text(encoding='utf-8')).get('build'),
    'runtime_nodes':len(reachable),
    'versioned_with_canonical_sibling':len(entries),
    'proven_orphan_candidates':len(safe),
    'blocked_or_active':len(blocked),
    'safe':safe,
    'blocked':blocked,
},ensure_ascii=False,indent=2,sort_keys=True))
