#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import collections
import json
import re

ROOT = Path('public/agent_crypto_erith_ia/administrator')
TEXT_SUFFIXES = {'.html', '.js', '.css', '.json', '.md', '.txt'}
SUFFIX_RE = re.compile(r'^(?P<base>[A-Za-z_$][\w$]*?)(?P<stamp>(?:39|40)\d{2,4})$')
ASSIGN_RE = re.compile(r'\b(?P<ns>globalThis|window)\.(?P<name>[A-Za-z_$][\w$]*)\s*=')
SIMPLE_RE = re.compile(r'\b(?P<ns>globalThis|window)\.(?P<name>[A-Za-z_$][\w$]*)\s*=\s*(?P<rhs>[A-Za-z_$][\w$]*)\s*;')


def base_of(name: str) -> str | None:
    m = SUFFIX_RE.match(name)
    return m.group('base') if m else None

files = [p for p in ROOT.rglob('*') if p.is_file() and p.suffix.lower() in TEXT_SUFFIXES]
texts: dict[Path, str] = {}
for path in files:
    try:
        texts[path] = path.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        pass

assign_count: dict[str, int] = collections.Counter()
simple_assigns: dict[str, list[tuple[Path, str]]] = collections.defaultdict(list)
canonical_assigned: set[str] = set()
all_versioned: set[str] = set()

for path, text in texts.items():
    for m in ASSIGN_RE.finditer(text):
        name = m.group('name')
        assign_count[name] += 1
        base = base_of(name)
        if base:
            all_versioned.add(name)
        else:
            canonical_assigned.add(name)
    for m in SIMPLE_RE.finditer(text):
        simple_assigns[m.group('name')].append((path, m.group('rhs')))

groups: dict[str, set[str]] = collections.defaultdict(set)
for name in all_versioned:
    groups[base_of(name)].add(name)

safe: dict[str, dict[str, object]] = {}
skipped: list[dict[str, object]] = []

for base, names in sorted(groups.items()):
    if len(names) < 2:
        continue
    if base in canonical_assigned:
        skipped.append({'base': base, 'reason': 'canonical-owner-already-assigned', 'names': sorted(names)})
        continue
    rhs_values: list[str] = []
    ok = True
    for name in sorted(names):
        records = simple_assigns.get(name, [])
        # Every assignment to this global must be a simple assignment and at least one must exist.
        if not records or len(records) != assign_count.get(name, 0):
            ok = False
            break
        rhs_values.extend(rhs for _, rhs in records)
    if not ok or not rhs_values or len(set(rhs_values)) != 1:
        skipped.append({'base': base, 'reason': 'not-one-identical-simple-source', 'names': sorted(names), 'rhs': sorted(set(rhs_values))})
        continue
    rhs = rhs_values[0]
    # Do not collapse if RHS itself is one of the versioned globals or the future canonical global.
    if rhs in names or rhs == base or base_of(rhs):
        skipped.append({'base': base, 'reason': 'unsafe-source-symbol', 'names': sorted(names), 'rhs': rhs})
        continue
    safe[base] = {'names': sorted(names), 'rhs': rhs}

changed_files: set[str] = set()
replacements = 0
deduped_assignments = 0

for path, text in texts.items():
    original = text
    for base, info in safe.items():
        for name in sorted(info['names'], key=len, reverse=True):
            pattern = rf'\b{re.escape(name)}\b'
            n = len(re.findall(pattern, text))
            if n:
                text = re.sub(pattern, base, text)
                replacements += n

    # Remove repeated canonical assignments to the same simple source in each file.
    lines = text.splitlines(keepends=True)
    seen: set[tuple[str, str, str]] = set()
    out: list[str] = []
    line_re = re.compile(r'^(?P<indent>\s*)(?P<ns>globalThis|window)\.(?P<name>[A-Za-z_$][\w$]*)\s*=\s*(?P<rhs>[A-Za-z_$][\w$]*)\s*;(?P<end>\s*(?://.*)?)$')
    for line in lines:
        m = line_re.match(line.rstrip('\r\n'))
        if m and m.group('name') in safe and m.group('rhs') == safe[m.group('name')]['rhs']:
            key = (m.group('ns'), m.group('name'), m.group('rhs'))
            if key in seen:
                deduped_assignments += 1
                continue
            seen.add(key)
        out.append(line)
    text = ''.join(out)

    if text != original:
        path.write_text(text, encoding='utf-8')
        changed_files.add(str(path.relative_to(ROOT)))

# Guard: all selected historical names are gone and each canonical base is assigned.
problems: list[str] = []
joined = '\n'.join(texts.keys().__str__() for _ in [])  # keep lint-simple; rebuilt below
post_texts=[]
for path in [p for p in ROOT.rglob('*') if p.is_file() and p.suffix.lower() in TEXT_SUFFIXES]:
    try:
        post_texts.append((path, path.read_text(encoding='utf-8')))
    except UnicodeDecodeError:
        pass
for base, info in safe.items():
    for name in info['names']:
        for path, text in post_texts:
            if re.search(rf'\b{re.escape(name)}\b', text):
                problems.append(f'{path.relative_to(ROOT)}:{name}')
    canonical_assigns=sum(len(re.findall(rf'\b(?:globalThis|window)\.{re.escape(base)}\s*=', text)) for _, text in post_texts)
    if canonical_assigns < 1:
        problems.append(f'{base}:canonical-assignment-missing')
if problems:
    raise SystemExit('Same-source canonicalization guard failed:\n'+'\n'.join(problems[:100]))

print(json.dumps({
    'safe_group_count': len(safe),
    'safe_groups': safe,
    'changed_files': len(changed_files),
    'replacement_count': replacements,
    'deduped_assignments': deduped_assignments,
    'skipped_count': len(skipped),
    'skipped_preview': skipped[:80]
}, ensure_ascii=False, indent=2, sort_keys=True))
