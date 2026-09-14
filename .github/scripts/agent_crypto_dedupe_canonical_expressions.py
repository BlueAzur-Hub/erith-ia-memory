#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import json
import re

ROOT = Path('public/agent_crypto_erith_ia/administrator')
TEXT_SUFFIXES = {'.html', '.js'}

# Consecutive identical simple global assignments, including multiple statements on one line.
ASSIGN_DUP_RE = re.compile(
    r'(?P<first>\b(?P<ns>globalThis|window)\.(?P<name>[A-Za-z_$][\w$]*)\s*=\s*(?P<rhs>[A-Za-z_$][\w$]*)\s*;)'
    r'(?P<rest>(?:\s*(?P=ns)\.(?P=name)\s*=\s*(?P=rhs)\s*;)+)'
)

# Fallbacks created by canonicalization, e.g. globalThis.X || globalThis.X.
OR_DUP_RE = re.compile(
    r'(?P<expr>\b(?:globalThis|window)\.[A-Za-z_$][\w$]*)\s*\|\|\s*(?P=expr)'
)

changed=[]
assignment_groups=0
or_groups=0
for path in ROOT.rglob('*'):
    if not path.is_file() or path.suffix.lower() not in TEXT_SUFFIXES:
        continue
    try:
        text=path.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        continue
    original=text
    while True:
        text,n=ASSIGN_DUP_RE.subn(lambda m:m.group('first'),text)
        assignment_groups+=n
        if n==0:
            break
    while True:
        text,n=OR_DUP_RE.subn(lambda m:m.group('expr'),text)
        or_groups+=n
        if n==0:
            break
    if text!=original:
        path.write_text(text,encoding='utf-8')
        changed.append(str(path.relative_to(ROOT)))

# Guard: no duplicate pattern remains.
remaining=[]
for path in ROOT.rglob('*'):
    if not path.is_file() or path.suffix.lower() not in TEXT_SUFFIXES:
        continue
    try:
        text=path.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        continue
    if ASSIGN_DUP_RE.search(text):
        remaining.append(f'{path.relative_to(ROOT)}:duplicate-assignment')
    if OR_DUP_RE.search(text):
        remaining.append(f'{path.relative_to(ROOT)}:duplicate-or')
if remaining:
    raise SystemExit('Canonical expression dedupe guard failed:\n'+'\n'.join(remaining[:100]))

print(json.dumps({
    'changed_files':len(changed),
    'duplicate_assignment_groups_removed':assignment_groups,
    'duplicate_or_groups_removed':or_groups,
    'files':changed,
},ensure_ascii=False,indent=2,sort_keys=True))
