#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import hashlib
import json
import re

ROOT = Path('public/agent_crypto_erith_ia/administrator')
SHELL = ROOT / 'runtime-shell.html'
TEXT_SUFFIXES = {'.html', '.js', '.css', '.json', '.md', '.txt'}
RESOURCE_SUFFIXES = {'.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.ico'}

# Release stamps only. Semantic names such as v1/v2 remain untouched.
STAMP_PATTERNS = (
    re.compile(r'^(?P<base>.+)-(?P<stamp>(?:39|40)\d{2,4})$'),
    re.compile(r'^(?P<base>.+)-(?P<stamp>40\.\d+\.\d+)$'),
)

HTML_REF_RE = re.compile(r'(?:src|href)=["\'](?P<ref>\./[^"\']+)["\']', re.I)
CSS_URL_RE = re.compile(r'url\(\s*["\']?(?P<ref>(?:\.\.?/)[^"\')]+)["\']?\s*\)', re.I)
QUOTED_REL_RE = re.compile(r'["\'](?P<ref>\./[^"\']+\.(?:css|js|png|jpe?g|webp|svg|gif|ico)(?:\?[^"\']*)?)["\']', re.I)
CACHE_VERSION_RE = re.compile(r'(?P<path>(?:\.\.?/)[^"\'\)\s?#]+)(?:\?v=(?:39|40)(?:\.\d+){1,3}|\?v=(?:39|40)\d{2,4})(?P<tail>(?:[&#][^"\'\)\s]*)?)', re.I)


def strip_query(ref: str) -> str:
    return ref.split('?', 1)[0].split('#', 1)[0]


def resolve(base_file: Path, ref: str) -> Path | None:
    """Resolve runtime refs using the same practical base rules as the app.

    Classic scripts in this project construct paths against document.baseURI, so
    './js/x.js' inside js/foo.js still means Administrator/js/x.js. CSS url(...)
    remains stylesheet-relative. If only one of root-relative/source-relative
    candidates physically exists, that evidence wins.
    """
    clean = strip_query(ref)
    if not clean.startswith(('./', '../')):
        return None
    try:
        root_abs = ROOT.resolve()
        if clean.startswith('../'):
            return (base_file.parent / clean).resolve().relative_to(root_abs)

        root_candidate = (ROOT / clean[2:]).resolve()
        source_candidate = (base_file.parent / clean).resolve()
        root_exists = root_candidate.exists()
        source_exists = source_candidate.exists()

        if root_exists and not source_exists:
            return root_candidate.relative_to(root_abs)
        if source_exists and not root_exists:
            return source_candidate.relative_to(root_abs)
        if root_exists and source_exists:
            preferred = source_candidate if base_file.suffix.lower() == '.css' else root_candidate
            return preferred.relative_to(root_abs)

        preferred = source_candidate if base_file.suffix.lower() == '.css' else root_candidate
        return preferred.relative_to(root_abs)
    except Exception:
        return None


def rel_string(path: Path) -> str:
    return str(path).replace('\\', '/')


def canonical_target(rel: Path) -> Path | None:
    if rel.suffix.lower() not in RESOURCE_SUFFIXES:
        return None
    stem = rel.stem
    for pattern in STAMP_PATTERNS:
        match = pattern.match(stem)
        if match:
            base = match.group('base').rstrip('-_')
            if not base:
                return None
            return rel.with_name(base + rel.suffix)
    return None


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

# Build the active resource graph, beginning with runtime-shell.html.
queue: list[Path] = [Path('runtime-shell.html')]
seen_text: set[Path] = set()
active_refs: set[Path] = set()

while queue:
    rel = queue.pop(0)
    if rel in seen_text:
        continue
    full = ROOT / rel
    if not full.is_file() or full.suffix.lower() not in TEXT_SUFFIXES:
        continue
    seen_text.add(rel)
    try:
        text = full.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        continue
    refs = [m.group('ref') for m in HTML_REF_RE.finditer(text)]
    refs += [m.group('ref') for m in CSS_URL_RE.finditer(text)]
    refs += [m.group('ref') for m in QUOTED_REL_RE.finditer(text)]
    for ref in refs:
        resolved = resolve(full, ref)
        if resolved is None:
            continue
        active_refs.add(resolved)
        target = ROOT / resolved
        if target.suffix.lower() in {'.css', '.js', '.html', '.json'} and target.is_file():
            queue.append(resolved)

# Only canonicalize resources reachable from the live runtime graph.
candidates: dict[Path, Path] = {}
for rel in sorted(active_refs, key=lambda p: rel_string(p)):
    full = ROOT / rel
    if not full.is_file():
        continue
    target = canonical_target(rel)
    if target and target != rel:
        candidates[rel] = target

# Multiple active files collapsing to the same canonical name are semantic collisions.
by_target: dict[Path, list[Path]] = {}
for old, new in candidates.items():
    by_target.setdefault(new, []).append(old)

mapping: dict[Path, Path] = {}
skipped: list[dict[str, object]] = []
for target, sources in sorted(by_target.items(), key=lambda item: rel_string(item[0])):
    if len(sources) != 1:
        skipped.append({'target': rel_string(target), 'reason': 'collision', 'sources': [rel_string(x) for x in sources]})
        continue
    old = sources[0]
    old_full = ROOT / old
    target_full = ROOT / target
    if target_full.exists():
        if target_full.is_file() and digest(old_full) == digest(target_full):
            mapping[old] = target
        else:
            skipped.append({'target': rel_string(target), 'reason': 'different-canonical-target-exists', 'sources': [rel_string(old)]})
            continue
    else:
        mapping[old] = target

# Rename first when target does not yet exist; identical duplicates are removed after refs rewrite.
identical_duplicates: list[Path] = []
for old, new in mapping.items():
    old_full = ROOT / old
    new_full = ROOT / new
    new_full.parent.mkdir(parents=True, exist_ok=True)
    if new_full.exists():
        identical_duplicates.append(old)
    else:
        old_full.rename(new_full)

# Rewrite path references everywhere in Administrator text; Git history preserves old names.
text_files = [p for p in ROOT.rglob('*') if p.is_file() and p.suffix.lower() in TEXT_SUFFIXES]
changed_files: set[str] = set()
reference_replacements = 0
for path in text_files:
    try:
        text = path.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        continue
    original = text
    for old, new in mapping.items():
        old_rel = rel_string(old)
        new_rel = rel_string(new)
        old_name = old.name
        new_name = new.name
        before = text
        text = text.replace(old_rel, new_rel)
        text = text.replace(old_name, new_name)
        reference_replacements += before.count(old_rel) + before.count(old_name)
    # Release query strings are cache plumbing, not identity/version authority.
    text = CACHE_VERSION_RE.sub(lambda m: m.group('path') + (m.group('tail') or ''), text)
    if text != original:
        path.write_text(text, encoding='utf-8')
        changed_files.add(str(path.relative_to(ROOT)))

for old in identical_duplicates:
    old_full = ROOT / old
    if old_full.exists():
        old_full.unlink()

# Verify the active graph again after migration.
missing: list[str] = []
queue = [Path('runtime-shell.html')]
seen_after: set[Path] = set()
while queue:
    rel = queue.pop(0)
    if rel in seen_after:
        continue
    full = ROOT / rel
    if not full.is_file() or full.suffix.lower() not in TEXT_SUFFIXES:
        continue
    seen_after.add(rel)
    try:
        text = full.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        continue
    refs = [m.group('ref') for m in HTML_REF_RE.finditer(text)]
    refs += [m.group('ref') for m in CSS_URL_RE.finditer(text)]
    refs += [m.group('ref') for m in QUOTED_REL_RE.finditer(text)]
    for ref in refs:
        resolved = resolve(full, ref)
        if resolved is None:
            continue
        target = ROOT / resolved
        if not target.exists():
            missing.append(f'{rel_string(rel)} -> {ref}')
            continue
        if target.suffix.lower() in {'.css', '.js', '.html', '.json'}:
            queue.append(resolved)

if missing:
    raise SystemExit('Missing active resources after canonicalization:\n' + '\n'.join(sorted(set(missing))))

print(json.dumps({
    'active_text_nodes': len(seen_text),
    'active_resource_refs': len(active_refs),
    'versioned_active_candidates': len(candidates),
    'canonicalized_resources': len(mapping),
    'changed_text_files': len(changed_files),
    'reference_replacements_estimate': reference_replacements,
    'skipped_count': len(skipped),
    'mapping': {rel_string(k): rel_string(v) for k, v in mapping.items()},
    'skipped': skipped,
}, ensure_ascii=False, indent=2, sort_keys=True))
