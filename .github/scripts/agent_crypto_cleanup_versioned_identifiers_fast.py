#!/usr/bin/env python3
from __future__ import annotations

from collections import defaultdict
from pathlib import Path
import json
import re

ROOT = Path('public/agent_crypto_erith_ia/administrator')
TEXT_SUFFIXES = {'.js', '.html', '.css'}
DECL_RE = re.compile(r'\b(?:function|class|const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)')
VERSIONED_RE = re.compile(r'^(?P<base>[A-Za-z_$][A-Za-z0-9_$]*?)(?:_)?(?P<stamp>(?:39|40)\d{2,4})$')
TOKEN_RE = re.compile(r'(?<![A-Za-z0-9_$])([A-Za-z_$][A-Za-z0-9_$]*)(?![A-Za-z0-9_$])')

files = [p for p in ROOT.rglob('*') if p.is_file() and p.suffix.lower() in TEXT_SUFFIXES]
texts: dict[Path, str] = {}
all_tokens: set[str] = set()
declared: set[str] = set()
versioned_declared: set[str] = set()

for path in files:
    try:
        text = path.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        continue
    texts[path] = text
    all_tokens.update(TOKEN_RE.findall(text))
    for name in DECL_RE.findall(text):
        declared.add(name)
        if VERSIONED_RE.match(name):
            versioned_declared.add(name)

by_base: dict[str, list[str]] = defaultdict(list)
for name in sorted(versioned_declared):
    match = VERSIONED_RE.match(name)
    if not match:
        continue
    base = match.group('base').rstrip('_')
    if len(base) >= 4:
        by_base[base].append(name)

mapping: dict[str, str] = {}
skipped = []
for base, originals in sorted(by_base.items()):
    if len(originals) != 1:
        skipped.append({'base': base, 'reason': 'collision', 'originals': originals})
        continue
    old = originals[0]
    if base in all_tokens or base in declared:
        skipped.append({'base': base, 'reason': 'canonical-name-already-present', 'originals': originals})
        continue
    mapping[old] = base

changed_files = []
replacements = 0
for path, text in texts.items():
    local_count = 0
    def replace(match: re.Match[str]) -> str:
        nonlocal_box[0] += 1 if match.group(1) in mapping else 0
        return mapping.get(match.group(1), match.group(1))
    nonlocal_box = [0]
    new_text = TOKEN_RE.sub(replace, text)
    local_count = nonlocal_box[0]
    if new_text != text:
        path.write_text(new_text, encoding='utf-8')
        changed_files.append(str(path.relative_to(ROOT)))
        replacements += local_count

print(json.dumps({
    'declared_versioned_identifiers': len(versioned_declared),
    'renamed_identifiers': len(mapping),
    'total_replacements': replacements,
    'changed_files': len(changed_files),
    'mapping': mapping,
    'skipped_count': len(skipped),
    'skipped_preview': skipped[:100],
}, ensure_ascii=False, indent=2, sort_keys=True))
