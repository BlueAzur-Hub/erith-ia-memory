#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import json
import re

ROOT = Path('public/agent_crypto_erith_ia/administrator')
ENTRY = Path('runtime-shell.html')
REGISTRY = Path('js/runtime-modules.js')

CANDIDATES = {
    Path('js/tradus-autonomous-refresh-406119.js'): Path('js/tradus-autonomous-refresh.js'),
    Path('js/tradus-canonical-strategy-reader-406123.js'): Path('js/tradus-canonical-strategy-reader.js'),
    Path('js/tradus-shadow-adapter-406064.js'): Path('js/tradus-shadow-adapter.js'),
    Path('js/tradus-shadow-adapter-406065.js'): Path('js/tradus-shadow-adapter.js'),
    Path('js/tradus-strategy-a-reconcile-406105.js'): Path('js/tradus-strategy-a-reconcile.js'),
}

HTML_JS_RE = re.compile(r'(?:src|href)=["\'](?P<ref>[^"\']+\.js(?:\?[^"\']*)?)["\']', re.I)
JS_PATH_RE = re.compile(r'(?P<ref>(?:\.\.?/|/)?js/[A-Za-z0-9_./-]+\.js)(?:\?[^"\'`\s)]*)?', re.I)
REL_JS_RE = re.compile(r'(?P<ref>\.\.?/[A-Za-z0-9_./-]+\.js)(?:\?[^"\'`\s)]*)?', re.I)


def strip_query(ref: str) -> str:
    return ref.split('?', 1)[0].split('#', 1)[0]


def resolve_candidates(source_rel: Path, ref: str) -> set[Path]:
    clean = strip_query(ref).replace('\\', '/')
    out: set[Path] = set()
    if clean.startswith('/'):
        rel = Path(clean.lstrip('/'))
        if (ROOT / rel).is_file(): out.add(rel)
        return out
    if clean.startswith('js/'):
        rel = Path(clean)
        if (ROOT / rel).is_file(): out.add(rel)
        return out
    if clean.startswith('./js/'):
        root_rel = Path(clean[2:])
        if (ROOT / root_rel).is_file(): out.add(root_rel)
        try:
            src_rel = ((ROOT / source_rel).parent / clean).resolve().relative_to(ROOT.resolve())
            if (ROOT / src_rel).is_file(): out.add(src_rel)
        except Exception:
            pass
        return out
    if clean.startswith(('./', '../')):
        try:
            src_rel = ((ROOT / source_rel).parent / clean).resolve().relative_to(ROOT.resolve())
            if (ROOT / src_rel).is_file(): out.add(src_rel)
        except Exception:
            pass
        if clean.startswith('./'):
            root_rel = Path(clean[2:])
            if (ROOT / root_rel).is_file(): out.add(root_rel)
    return out


def extract_refs(text: str) -> list[str]:
    refs = [m.group('ref') for m in HTML_JS_RE.finditer(text)]
    refs += [m.group('ref') for m in JS_PATH_RE.finditer(text)]
    refs += [m.group('ref') for m in REL_JS_RE.finditer(text)]
    return list(dict.fromkeys(refs))


def graph() -> tuple[set[Path], dict[Path, set[Path]], dict[Path, str]]:
    queue = [ENTRY]
    seen: set[Path] = set()
    edges: dict[Path, set[Path]] = {}
    texts: dict[Path, str] = {}
    while queue:
        rel = queue.pop(0)
        if rel in seen: continue
        full = ROOT / rel
        if not full.is_file() or full.suffix.lower() not in {'.html', '.js'}: continue
        try: text = full.read_text(encoding='utf-8')
        except UnicodeDecodeError: continue
        seen.add(rel); texts[rel] = text
        targets: set[Path] = set()
        for ref in extract_refs(text): targets.update(resolve_candidates(rel, ref))
        edges[rel] = targets
        for target in sorted(targets, key=str):
            if target.suffix.lower() in {'.html', '.js'} and target not in seen:
                queue.append(target)
    return seen, edges, texts


def inbound(edges: dict[Path, set[Path]], target: Path) -> list[str]:
    return sorted(str(src) for src, targets in edges.items() if target in targets)


def preserve_and_replace(section: dict, field: str, old: str, new: str) -> None:
    current = section.get(field)
    if current == old:
        hist = f'historical_{field}'
        if hist not in section:
            section[hist] = old
        section[field] = new
    elif current != new:
        raise SystemExit(f'Unexpected build truth {field}: expected {old!r} or {new!r}, got {current!r}')

build_path = ROOT / 'build.json'
build = json.loads(build_path.read_text(encoding='utf-8'))
if str(build.get('build')) != '40.6.124':
    raise SystemExit(f'Expected cleanup baseline build 40.6.124, got {build.get("build")!r}')
engine = str(build.get('market_core') or build.get('engine') or '')
if '38.15.11' not in engine:
    raise SystemExit(f'Market Core lock violated before cleanup: {engine!r}')

registry_text = (ROOT / REGISTRY).read_text(encoding='utf-8')
for canonical in sorted(set(CANDIDATES.values()), key=str):
    token = f'"./{canonical.as_posix()}"'
    if token not in registry_text and canonical.name not in (ROOT / ENTRY).read_text(encoding='utf-8'):
        # shadow-adapter is loaded directly by runtime-shell; all others are registry-owned.
        raise SystemExit(f'Canonical TRADUS successor not declared by stable runtime surfaces: {canonical}')
if 'versioned_filenames: false' not in registry_text:
    raise SystemExit('Stable runtime registry does not assert versioned_filenames: false')

reachable, edges, texts = graph()
entry_surfaces = [ROOT/'index.html', ROOT/'index-40.6.124.html', ROOT/ENTRY, ROOT/REGISTRY]
report: dict[str, object] = {'runtime_nodes_before': len(reachable), 'candidates': {}, 'deleted': [], 'skipped': []}

for old, successor in CANDIDATES.items():
    old_full = ROOT / old
    successor_full = ROOT / successor
    reasons: list[str] = []
    if not old_full.is_file(): reasons.append('candidate-already-absent')
    if not successor_full.is_file(): reasons.append('canonical-successor-missing')
    if old in reachable: reasons.append('candidate-runtime-reachable')
    if successor not in reachable: reasons.append('canonical-successor-not-runtime-reachable')
    incoming = inbound(edges, old)
    if incoming: reasons.append('active-inbound-reference:' + ','.join(incoming))
    active_literals = sorted(str(src) for src, text in texts.items() if old.name in text)
    if active_literals: reasons.append('literal-reference-in-reachable-source:' + ','.join(active_literals))
    surface_hits=[]
    for surface in entry_surfaces:
        if surface.is_file() and old.name in surface.read_text(encoding='utf-8'):
            surface_hits.append(str(surface.relative_to(ROOT)))
    if surface_hits: reasons.append('entry-surface-reference:' + ','.join(surface_hits))

    report['candidates'][str(old)] = {
        'successor': str(successor),
        'candidate_reachable': old in reachable,
        'successor_reachable': successor in reachable,
        'inbound_from': incoming,
        'active_literal_sources': active_literals,
        'entry_surface_hits': surface_hits,
        'decision': 'delete' if not reasons else 'skip',
        'reasons': reasons,
    }
    if reasons:
        report['skipped'].append({'path': str(old), 'reasons': reasons})
    else:
        old_full.unlink()
        report['deleted'].append(str(old))

# This is a bounded retirement: every intended predecessor must be proven removable.
if report['skipped']:
    raise SystemExit('TRADUS retirement not fully proven; refusing partial commit:\n' + json.dumps(report, ensure_ascii=False, indent=2))

# Correct build truth for the two release-era routes that still named historical files.
auto = build.get('tradus_autonomous_shadow_refresh')
if not isinstance(auto, dict): raise SystemExit('build.json missing tradus_autonomous_shadow_refresh')
preserve_and_replace(auto, 'runtime_patch', 'js/tradus-autonomous-refresh-406119.js', 'js/tradus-autonomous-refresh.js')
preserve_and_replace(auto, 'loader', 'version-truth runtime layer from 40.6.119 onward', 'js/runtime-modules.js')
auto['runtime_owner'] = 'AgentCryptoTradusAutonomousRefresh'
auto['stable_filename'] = True
auto['versioned_406119_candidate_retired'] = True

reader = build.get('tradus_canonical_strategy_reader')
if not isinstance(reader, dict): raise SystemExit('build.json missing tradus_canonical_strategy_reader')
preserve_and_replace(reader, 'runtime_patch', 'js/tradus-canonical-strategy-reader-406123.js', 'js/tradus-canonical-strategy-reader.js')
preserve_and_replace(reader, 'compatibility_loader', 'js/tradus-autonomous-refresh-406119.js', 'js/runtime-modules.js')
reader['runtime_owner'] = 'AgentCryptoTradusCanonicalStrategyReader'
reader['stable_filename'] = True
reader['versioned_406123_candidate_retired'] = True

cleanup = build.setdefault('versioning_cleanup', {})
if not isinstance(cleanup, dict): raise SystemExit('build.json versioning_cleanup is not an object')
cleanup['tradus_runtime_registry'] = 'js/runtime-modules.js'
cleanup['tradus_versioned_predecessors_retired'] = [str(p) for p in CANDIDATES]
cleanup['tradus_canonical_owners'] = sorted({str(p) for p in CANDIDATES.values()})

build_path.write_text(json.dumps(build, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')

reachable_after, edges_after, texts_after = graph()
problems: list[str] = []
for old, successor in CANDIDATES.items():
    if (ROOT / old).exists(): problems.append(f'{old}:still-exists')
    if successor not in reachable_after: problems.append(f'{successor}:canonical-successor-lost')
    for src, text in texts_after.items():
        if old.name in text: problems.append(f'{old}:active-reference-remains:{src}')

post = json.loads(build_path.read_text(encoding='utf-8'))
if post['tradus_autonomous_shadow_refresh'].get('runtime_patch') != 'js/tradus-autonomous-refresh.js':
    problems.append('build-truth:tradus-autonomous-refresh-not-canonical')
if post['tradus_canonical_strategy_reader'].get('runtime_patch') != 'js/tradus-canonical-strategy-reader.js':
    problems.append('build-truth:tradus-reader-not-canonical')
if post['tradus_autonomous_shadow_refresh'].get('loader') != 'js/runtime-modules.js':
    problems.append('build-truth:tradus-auto-loader-not-stable-registry')
if post['tradus_canonical_strategy_reader'].get('compatibility_loader') != 'js/runtime-modules.js':
    problems.append('build-truth:tradus-reader-loader-not-stable-registry')
if str(post.get('build')) != '40.6.124': problems.append('build-drift')
if '38.15.11' not in str(post.get('market_core') or post.get('engine') or ''): problems.append('market-core-drift')

if problems:
    raise SystemExit('TRADUS post-retirement guard failed:\n' + '\n'.join(problems))

report['runtime_nodes_after'] = len(reachable_after)
report['deleted_count'] = len(report['deleted'])
report['build'] = post.get('build')
report['market_core'] = post.get('market_core') or post.get('engine')
report['current_runtime_paths'] = {
    'autonomous_refresh': post['tradus_autonomous_shadow_refresh'].get('runtime_patch'),
    'canonical_reader': post['tradus_canonical_strategy_reader'].get('runtime_patch'),
    'loader': 'js/runtime-modules.js',
}
print(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True))
