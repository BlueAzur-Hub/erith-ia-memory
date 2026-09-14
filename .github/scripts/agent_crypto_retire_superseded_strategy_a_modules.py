#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import json
import re

ROOT = Path('public/agent_crypto_erith_ia/administrator')
ENTRY = Path('runtime-shell.html')

# Intentionally narrow. Compatibility continuity/autostart files are NOT candidates.
CANDIDATES = {
    Path('js/strategy-a-after-cost-metrics-404292.js'): Path('js/strategy-a-after-cost-metrics.js'),
    Path('js/strategy-a-evidence-dossier-404294.js'): Path('js/strategy-a-evidence-dossier.js'),
    Path('js/strategy-a-paper-after-cost-acceptance-406062.js'): Path('js/strategy-a-paper-after-cost-acceptance.js'),
    Path('js/strategy-a-paper-lifecycle-404291.js'): Path('js/strategy-a-paper-lifecycle.js'),
    Path('js/strategy-a-safety-certification-404293.js'): Path('js/strategy-a-safety-certification.js'),
    Path('js/strategy-a-safety-certification-404295.js'): Path('js/strategy-a-safety-certification.js'),
}

HTML_JS_RE = re.compile(r'(?:src|href)=["\'](?P<ref>[^"\']+\.js(?:\?[^"\']*)?)["\']', re.I)
# Covers ordinary quoted strings and template literals such as ./js/x.js?v=${...}.
JS_PATH_RE = re.compile(r'(?P<ref>(?:\.\.?/|/)?js/[A-Za-z0-9_./-]+\.js)(?:\?[^"\'`\s)]*)?', re.I)
REL_JS_RE = re.compile(r'(?P<ref>\.\.?/[A-Za-z0-9_./-]+\.js)(?:\?[^"\'`\s)]*)?', re.I)


def strip_query(ref: str) -> str:
    return ref.split('?', 1)[0].split('#', 1)[0]


def resolve_candidates(source_rel: Path, ref: str) -> set[Path]:
    """Conservative runtime path resolution.

    The project mixes classic DOM-injected scripts resolved against document.baseURI
    with source-relative references. If both interpretations physically exist, mark
    both reachable rather than guessing and accidentally deleting a live module.
    """
    clean = strip_query(ref).replace('\\', '/')
    out: set[Path] = set()

    if clean.startswith('/'):
        rel = Path(clean.lstrip('/'))
        if (ROOT / rel).is_file():
            out.add(rel)
        return out

    if clean.startswith('js/'):
        rel = Path(clean)
        if (ROOT / rel).is_file():
            out.add(rel)
        return out

    if clean.startswith('./js/'):
        rel = Path(clean[2:])
        if (ROOT / rel).is_file():
            out.add(rel)
        # Also keep the source-relative interpretation if it exists.
        src_rel = (source_rel.parent / clean).resolve()
        try:
            src_rel = src_rel.relative_to(ROOT.resolve())
            if (ROOT / src_rel).is_file():
                out.add(src_rel)
        except Exception:
            pass
        return out

    if clean.startswith(('./', '../')):
        try:
            abs_source = (ROOT / source_rel).resolve()
            rel = (abs_source.parent / clean).resolve().relative_to(ROOT.resolve())
            if (ROOT / rel).is_file():
                out.add(rel)
        except Exception:
            pass
        # Classic runtime scripts often resolve './foo.js' against document.baseURI.
        if clean.startswith('./'):
            root_rel = Path(clean[2:])
            if (ROOT / root_rel).is_file():
                out.add(root_rel)
    return out


def extract_refs(source_rel: Path, text: str) -> list[str]:
    refs = [m.group('ref') for m in HTML_JS_RE.finditer(text)]
    refs += [m.group('ref') for m in JS_PATH_RE.finditer(text)]
    refs += [m.group('ref') for m in REL_JS_RE.finditer(text)]
    # Preserve order but remove duplicates.
    return list(dict.fromkeys(refs))


def build_runtime_graph() -> tuple[set[Path], dict[Path, set[Path]], dict[Path, str]]:
    queue = [ENTRY]
    seen: set[Path] = set()
    edges: dict[Path, set[Path]] = {}
    texts: dict[Path, str] = {}

    while queue:
        rel = queue.pop(0)
        if rel in seen:
            continue
        full = ROOT / rel
        if not full.is_file():
            continue
        if full.suffix.lower() not in {'.html', '.js'}:
            continue
        try:
            text = full.read_text(encoding='utf-8')
        except UnicodeDecodeError:
            continue
        seen.add(rel)
        texts[rel] = text
        targets: set[Path] = set()
        for ref in extract_refs(rel, text):
            targets.update(resolve_candidates(rel, ref))
        edges[rel] = targets
        for target in sorted(targets, key=str):
            if target.suffix.lower() in {'.html', '.js'} and target not in seen:
                queue.append(target)
    return seen, edges, texts


def inbound(edges: dict[Path, set[Path]], target: Path) -> list[str]:
    return sorted(str(src) for src, targets in edges.items() if target in targets)


def current_metadata_mentions(filename: str) -> list[str]:
    hits: list[str] = []
    # Current runtime/package metadata only. Historical docs are deliberately ignored.
    meta_files = [ROOT / 'build.json']
    meta_files += sorted(ROOT.glob('*manifest*.json'))
    meta_files += sorted(ROOT.glob('runtime*.json'))
    meta_files += sorted(ROOT.glob('package*.json'))
    for path in dict.fromkeys(meta_files):
        if not path.is_file():
            continue
        try:
            text = path.read_text(encoding='utf-8')
        except UnicodeDecodeError:
            continue
        if filename in text:
            hits.append(str(path.relative_to(ROOT)))
    return hits

reachable, edges, texts = build_runtime_graph()
report: dict[str, object] = {
    'runtime_nodes_before': len(reachable),
    'candidates': {},
    'deleted': [],
    'skipped': [],
    'compatibility_files_explicitly_protected': [
        'js/strategy-a-auto-session-continuity-406120.js',
        'js/strategy-a-auto-session-continuity-406121.js',
        'js/strategy-a-auto-owner-autostart-406124.js',
        'js/strategy-a-auto-owner-autostart-406124.selftest.js',
    ],
}

for old, successor in CANDIDATES.items():
    old_full = ROOT / old
    successor_full = ROOT / successor
    reasons: list[str] = []

    if not old_full.is_file():
        reasons.append('candidate-already-absent')
    if not successor_full.is_file():
        reasons.append('canonical-successor-missing')
    if old in reachable:
        reasons.append('candidate-runtime-reachable')
    if successor not in reachable:
        reasons.append('canonical-successor-not-runtime-reachable')

    inbound_refs = inbound(edges, old)
    if inbound_refs:
        reasons.append('active-inbound-reference:' + ','.join(inbound_refs))

    metadata_hits = current_metadata_mentions(old.name)
    if metadata_hits:
        reasons.append('current-metadata-reference:' + ','.join(metadata_hits))

    # Literal old filename in any reachable source is a blocker even if resolver
    # could not map it (defensive against unusual loader syntax).
    literal_sources = sorted(
        str(src) for src, text in texts.items()
        if old.name in text
    )
    if literal_sources:
        reasons.append('literal-reference-in-reachable-source:' + ','.join(literal_sources))

    report['candidates'][str(old)] = {
        'successor': str(successor),
        'candidate_exists': old_full.is_file(),
        'candidate_reachable': old in reachable,
        'successor_reachable': successor in reachable,
        'inbound_from': inbound_refs,
        'metadata_hits': metadata_hits,
        'literal_reachable_sources': literal_sources,
        'decision': 'delete' if not reasons else 'skip',
        'reasons': reasons,
    }

    if reasons:
        report['skipped'].append({'path': str(old), 'reasons': reasons})
        continue

    old_full.unlink()
    report['deleted'].append(str(old))

# Rebuild graph after deletion and ensure all canonical successors remain reachable.
reachable_after, edges_after, texts_after = build_runtime_graph()
problems: list[str] = []
for old_path in report['deleted']:
    old = Path(old_path)
    if (ROOT / old).exists():
        problems.append(f'{old}:delete-failed')
    for src, text in texts_after.items():
        if old.name in text:
            problems.append(f'{old}:still-referenced-by:{src}')
    successor = CANDIDATES[old]
    if successor not in reachable_after:
        problems.append(f'{successor}:successor-lost-from-runtime-graph')

# Compatibility chain must remain physically present regardless of current reachability.
for protected in report['compatibility_files_explicitly_protected']:
    if not (ROOT / protected).is_file():
        problems.append(f'{protected}:protected-compatibility-file-missing')

if problems:
    raise SystemExit('Strategy A retirement guard failed:\n' + '\n'.join(problems))

report['runtime_nodes_after'] = len(reachable_after)
report['deleted_count'] = len(report['deleted'])
report['skipped_count'] = len(report['skipped'])
print(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True))
