#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import json
import re

ROOT = Path('public/agent_crypto_erith_ia/administrator')
SHELL = ROOT / 'runtime-shell.html'

SCRIPT_RE = re.compile(r'<script\b[^>]*src=["\'](?P<src>\./js/[^"\']+\.js)[^"\']*["\'][^>]*>', re.I)
VERSIONED = re.compile(r'^(?P<base>.+)-(?P<stamp>\d{5,6})\.js$', re.I)
TEXT_SUFFIXES = {'.html', '.js', '.css', '.json', '.md', '.py', '.yml', '.yaml', '.txt'}

shell = SHELL.read_text(encoding='utf-8')
active_sources = []
for match in SCRIPT_RE.finditer(shell):
    src = match.group('src').split('?', 1)[0]
    if src not in active_sources:
        active_sources.append(src)

candidates = []
for src in active_sources:
    rel = src.removeprefix('./')
    path = ROOT / rel
    m = VERSIONED.match(path.name)
    if m and path.is_file():
        candidates.append((src, path, path.with_name(m.group('base') + '.js')))

by_target: dict[Path, list[tuple[str, Path, Path]]] = {}
for item in candidates:
    by_target.setdefault(item[2], []).append(item)

safe = []
skipped = []
for target, items in sorted(by_target.items(), key=lambda kv: str(kv[0])):
    if len(items) != 1:
        skipped.append({'target': str(target.relative_to(ROOT)), 'reason': 'collision', 'sources': [str(x[1].relative_to(ROOT)) for x in items]})
        continue
    src, old, new = items[0]
    if new.exists():
        skipped.append({'target': str(new.relative_to(ROOT)), 'reason': 'canonical-target-exists', 'sources': [str(old.relative_to(ROOT))]})
        continue
    safe.append((src, old, new))

# Never touch the central app owners or protected market core naming through this
# mechanical pass. They require semantic consolidation, not filename surgery.
protected_names = {'app.js', 'version-truth.js', 'runtime-modules.js', 'boot.js'}
filtered = []
for item in safe:
    if item[1].name in protected_names or item[2].name in protected_names:
        skipped.append({'target': str(item[2].relative_to(ROOT)), 'reason': 'protected-owner', 'sources': [str(item[1].relative_to(ROOT))]})
    else:
        filtered.append(item)
safe = filtered

mapping = {}
for src, old, new in safe:
    old_rel = str(old.relative_to(ROOT)).replace('\\', '/')
    new_rel = str(new.relative_to(ROOT)).replace('\\', '/')
    mapping[old_rel] = new_rel
    old.rename(new)

# Rewrite references everywhere inside Administrator. Historical Git commits retain
# the old names; the current tree does not need duplicate runtime aliases.
text_files = [p for p in ROOT.rglob('*') if p.is_file() and p.suffix.lower() in TEXT_SUFFIXES]
for path in text_files:
    try:
        text = path.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        continue
    original = text
    for old_rel, new_rel in mapping.items():
        old_name = Path(old_rel).name
        new_name = Path(new_rel).name
        text = text.replace(old_rel, new_rel)
        text = text.replace('./' + old_rel, './' + new_rel)
        text = text.replace(old_name, new_name)
    if text != original:
        path.write_text(text, encoding='utf-8')

print(json.dumps({
    'active_scripts_seen': len(active_sources),
    'versioned_active_candidates': len(candidates),
    'renamed': len(mapping),
    'mapping': mapping,
    'skipped': skipped,
}, ensure_ascii=False, indent=2, sort_keys=True))
