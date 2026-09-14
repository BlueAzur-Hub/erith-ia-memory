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
for path in files:
    try:
        texts[path] = path.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        pass

all_tokens = set()
declared = set()
versioned_declared = set()
for text in texts.values():
    all_tokens.update(TOKEN_RE.findall(text))
    for name in DECL_RE.findall(text):
        declared.add(name)
        if VERSIONED_RE.match(name):
            versioned_declared.add(name)

by_base: dict[str, list[str]] = defaultdict(list)
for name in sorted(versioned_declared):
    m = VERSIONED_RE.match(name)
    if not m:
        continue
    base = m.group('base').rstrip('_')
    if len(base) < 4:
        continue
    by_base[base].append(name)

mapping: dict[str, str] = {}
skipped = []
for base, originals in sorted(by_base.items()):
    if len(originals) != 1:
        skipped.append({'base': base, 'reason': 'collision', 'originals': originals})
        continue
    original = originals[0]
    if base in all_tokens or base in declared:
        skipped.append({'base': base, 'reason': 'canonical-name-already-present', 'originals': originals})
        continue
    mapping[original] = base

changed_files = []
replacements = 0
for path, text in texts.items():
    original_text = text
    for old, new in mapping.items():
        pattern = re.compile(rf'(?<![A-Za-z0-9_$]){re.escape(old)}(?![A-Za-z0-9_$])')
        text, count = pattern.subn(new, text)
        replacements += count
    if text != original_text:
        path.write_text(text, encoding='utf-8')
        changed_files.append(str(path.relative_to(ROOT)))

print(json.dumps({
    'declared_versioned_identifiers': len(versioned_declared),
    'renamed_identifiers': len(mapping),
    'total_replacements': replacements,
    'changed_files': len(changed_files),
    'mapping': mapping,
    'skipped_count': len(skipped),
    'skipped_preview': skipped[:80],
}, ensure_ascii=False, indent=2, sort_keys=True))
