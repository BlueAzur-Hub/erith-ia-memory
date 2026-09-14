#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import collections
import json
import re

ROOT = Path('public/agent_crypto_erith_ia/administrator')
TEXT_SUFFIXES = {'.html', '.js', '.css', '.json', '.md', '.txt'}

# Runtime-style release suffixes only. Semantic V2/V3 names stay intact.
SUFFIX_RE = re.compile(r'^(?P<base>[A-Za-z_$][\w$]*?)(?P<stamp>(?:39|40)\d{2,4})$')
ASSIGN_RE = re.compile(r'\b(?P<ns>globalThis|window)\.(?P<name>[A-Za-z_$][\w$]*)\s*=')
ALIAS_RE = re.compile(
    r'\b(?P<lhs_ns>globalThis|window)\.(?P<lhs>[A-Za-z_$][\w$]*)\s*=\s*'
    r'(?P<rhs_ns>globalThis|window)\.(?P<rhs>[A-Za-z_$][\w$]*)\s*;'
)


def base_of(name: str) -> str | None:
    m = SUFFIX_RE.match(name)
    return m.group('base') if m else None


def text_files() -> list[Path]:
    return [p for p in ROOT.rglob('*') if p.is_file() and p.suffix.lower() in TEXT_SUFFIXES]

files = text_files()
texts: dict[Path, str] = {}
for path in files:
    try:
        texts[path] = path.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        pass

assignments: dict[str, list[tuple[Path, bool, str | None]]] = collections.defaultdict(list)
alias_edges: dict[str, set[str]] = collections.defaultdict(set)
all_names: set[str] = set()
canonical_assigned: set[str] = set()

for path, text in texts.items():
    alias_spans: dict[tuple[int, int], tuple[str, str]] = {}
    for m in ALIAS_RE.finditer(text):
        lhs, rhs = m.group('lhs'), m.group('rhs')
        alias_spans[(m.start(), m.end())] = (lhs, rhs)
        all_names.update((lhs, rhs))
        if base_of(lhs) and base_of(lhs) == base_of(rhs):
            alias_edges[lhs].add(rhs)

    for m in ASSIGN_RE.finditer(text):
        name = m.group('name')
        all_names.add(name)
        # Determine whether this assignment begins an exact alias statement.
        alias_rhs = None
        is_alias = False
        for am in ALIAS_RE.finditer(text, max(0, m.start() - 8), min(len(text), m.end() + 160)):
            if am.start() == m.start() and am.group('lhs') == name:
                alias_rhs = am.group('rhs')
                is_alias = True
                break
        assignments[name].append((path, is_alias, alias_rhs))
        if base_of(name) is None:
            canonical_assigned.add(name)

# Group versioned globals by their unversioned canonical base.
groups: dict[str, set[str]] = collections.defaultdict(set)
for name in all_names:
    base = base_of(name)
    if base:
        groups[base].add(name)

safe_groups: dict[str, set[str]] = {}
skipped: list[dict[str, object]] = []

for base, names in sorted(groups.items()):
    if len(names) < 2:
        continue
    if base in canonical_assigned:
        skipped.append({'base': base, 'reason': 'canonical-owner-already-assigned', 'names': sorted(names)})
        continue

    roots: list[str] = []
    bad_alias = False
    for name in names:
        records = assignments.get(name, [])
        if not records:
            # A referenced-only versioned name is allowed only if reached as alias RHS.
            continue
        non_alias = [r for r in records if not r[1]]
        if non_alias:
            roots.append(name)
        for _, is_alias, rhs in records:
            if is_alias and (rhs is None or rhs not in names or base_of(rhs) != base):
                bad_alias = True

    roots = sorted(set(roots))
    if bad_alias or len(roots) != 1:
        skipped.append({'base': base, 'reason': 'multiple-or-unclear-owners', 'roots': roots, 'names': sorted(names)})
        continue

    root = roots[0]

    # Every non-root assigned name must be alias-only and must eventually reach root.
    ok = True
    for name in names:
        if name == root:
            continue
        records = assignments.get(name, [])
        if any(not r[1] for r in records):
            ok = False
            break
        current = name
        seen: set[str] = set()
        reached = False
        while current not in seen:
            seen.add(current)
            targets = sorted(alias_edges.get(current, set()))
            if not targets:
                break
            # Multiple direct alias targets are ambiguous.
            if len(targets) != 1:
                break
            current = targets[0]
            if current == root:
                reached = True
                break
        if records and not reached:
            ok = False
            break

    if not ok:
        skipped.append({'base': base, 'reason': 'alias-chain-does-not-converge', 'root': root, 'names': sorted(names)})
        continue

    safe_groups[base] = names

changed_files: set[str] = set()
replacement_count = 0
removed_noops = 0

for path, text in texts.items():
    original = text
    for base, names in safe_groups.items():
        # Longest first avoids accidental partial overlap.
        for name in sorted(names, key=len, reverse=True):
            count = len(re.findall(rf'\b{re.escape(name)}\b', text))
            if count:
                text = re.sub(rf'\b{re.escape(name)}\b', base, text)
                replacement_count += count

    # Remove exact self-alias statements created by the consolidation.
    before = text
    text, n1 = re.subn(r'(?m)^[ \t]*(?:globalThis|window)\.([A-Za-z_$][\w$]*)\s*=\s*(?:globalThis|window)\.\1\s*;[ \t]*\n?', '', text)
    removed_noops += n1

    if text != original:
        path.write_text(text, encoding='utf-8')
        changed_files.add(str(path.relative_to(ROOT)))

# Guard: no safe group's numbered names may remain.
remaining: list[str] = []
for path in text_files():
    try:
        text = path.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        continue
    for base, names in safe_groups.items():
        for name in names:
            if re.search(rf'\b{re.escape(name)}\b', text):
                remaining.append(f'{path.relative_to(ROOT)}:{name}')
if remaining:
    raise SystemExit('Versioned alias-chain names remain:\n' + '\n'.join(remaining[:100]))

print(json.dumps({
    'safe_group_count': len(safe_groups),
    'safe_groups': {base: sorted(names) for base, names in safe_groups.items()},
    'changed_files': len(changed_files),
    'replacement_count': replacement_count,
    'removed_self_alias_statements': removed_noops,
    'skipped_count': len(skipped),
    'skipped_preview': skipped[:80],
}, ensure_ascii=False, indent=2, sort_keys=True))
