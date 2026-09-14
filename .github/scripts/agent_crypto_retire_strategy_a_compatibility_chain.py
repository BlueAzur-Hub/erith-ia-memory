#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import json
import re

ROOT = Path('public/agent_crypto_erith_ia/administrator')
ENTRY = Path('runtime-shell.html')
REGISTRY = Path('js/runtime-modules.js')
CANONICAL_OWNER = Path('js/strategy-a-auto-start.js')
OLD_RUNTIME_FILES = [
    Path('js/strategy-a-auto-session-continuity-406120.js'),
    Path('js/strategy-a-auto-session-continuity-406121.js'),
    Path('js/strategy-a-auto-owner-autostart-406124.js'),
]
OLD_SELFTEST = Path('js/strategy-a-auto-owner-autostart-406124.selftest.js')
CANONICAL_SELFTEST = Path('js/strategy-a-auto-start.selftest.js')

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

build_path = ROOT / 'build.json'
build = json.loads(build_path.read_text(encoding='utf-8'))
if str(build.get('build')) != '40.6.124':
    raise SystemExit(f'Expected cleanup baseline build 40.6.124, got {build.get("build")!r}')
engine = str(build.get('engine') or build.get('market_core') or '')
if '38.15.11' not in engine:
    raise SystemExit(f'Market Core lock violated before cleanup: {engine!r}')

registry_text = (ROOT / REGISTRY).read_text(encoding='utf-8')
if '"./js/strategy-a-auto-start.js"' not in registry_text:
    raise SystemExit('Canonical Strategy A auto-start missing from runtime registry')
if 'versioned_filenames: false' not in registry_text:
    raise SystemExit('Runtime registry does not assert stable filenames')

reachable, edges, texts = graph()
if CANONICAL_OWNER not in reachable:
    raise SystemExit('Canonical Strategy A auto-start is not runtime reachable')

# Current entry surfaces must not depend on the old compatibility filenames.
entry_surfaces = [ROOT / 'index.html', ROOT / 'index-40.6.124.html', ROOT / 'runtime-shell.html', ROOT / REGISTRY]
blockers: list[str] = []
for old in OLD_RUNTIME_FILES + [OLD_SELFTEST]:
    if not (ROOT / old).is_file():
        blockers.append(f'{old}:expected-file-missing-before-retirement')
        continue
    if old in reachable:
        blockers.append(f'{old}:runtime-reachable')
    for src, text in texts.items():
        if old.name in text:
            blockers.append(f'{old}:referenced-by-active:{src}')
    for surface in entry_surfaces:
        if not surface.is_file(): continue
        text = surface.read_text(encoding='utf-8')
        if old.name in text:
            blockers.append(f'{old}:referenced-by-entry-surface:{surface.relative_to(ROOT)}')

if blockers:
    raise SystemExit('Strategy A compatibility retirement blocked:\n' + '\n'.join(sorted(set(blockers))))

# Preserve the useful self-test under the stable owner identity.
if (ROOT / CANONICAL_SELFTEST).exists():
    raise SystemExit(f'Canonical self-test already exists: {CANONICAL_SELFTEST}')
(ROOT / CANONICAL_SELFTEST).write_text(
    '(() => {\n'
    '  "use strict";\n'
    '  globalThis.AgentCryptoStrategyAAutoStartSelfTest = () => {\n'
    '    const api = globalThis.AgentCryptoStrategyAAutoStart;\n'
    '    return { present: !!api, snapshot: api?.snapshot?.() || null };\n'
    '  };\n'
    '})();\n',
    encoding='utf-8'
)

for old in OLD_RUNTIME_FILES + [OLD_SELFTEST]:
    (ROOT / old).unlink()

# Correct current build-truth fields while retaining release history explicitly.
def retire_historical_section(key: str, old_path: str) -> None:
    section = build.get(key)
    if not isinstance(section, dict):
        raise SystemExit(f'build.json section missing: {key}')
    if section.get('runtime_patch') == old_path:
        section['historical_runtime_patch'] = old_path
    section['runtime_patch'] = 'retired'
    section['runtime_active'] = False
    section['retired_by'] = 'js/runtime-modules.js stable filename registry'
    if 'loader' in section:
        section['historical_loader'] = section.get('loader')
        section['loader'] = 'retired'

retire_historical_section('strategy_a_auto_session_continuity', 'js/strategy-a-auto-session-continuity-406120.js')
retire_historical_section('strategy_a_paper_auto_continuity_v2', 'js/strategy-a-auto-session-continuity-406121.js')

owner = build.get('strategy_a_owner_api_auto_start')
if not isinstance(owner, dict):
    raise SystemExit('build.json section missing: strategy_a_owner_api_auto_start')
if owner.get('runtime_patch') == 'js/strategy-a-auto-owner-autostart-406124.js':
    owner['historical_runtime_patch'] = owner['runtime_patch']
owner['runtime_patch'] = 'js/strategy-a-auto-start.js'
if owner.get('compatibility_loader'):
    owner['historical_compatibility_loader'] = owner.get('compatibility_loader')
owner['compatibility_loader'] = 'js/runtime-modules.js'
owner['canonical_owner'] = 'AgentCryptoAutoPaperRunner'
owner['runtime_owner_api'] = 'AgentCryptoStrategyAAutoStart'
owner['runtime_active'] = True
owner['stable_filename'] = True
owner['versioned_compatibility_files_retired'] = True
owner['self_test'] = 'js/strategy-a-auto-start.selftest.js'

cleanup = build.setdefault('versioning_cleanup', {})
if isinstance(cleanup, dict):
    cleanup['strategy_a_auto_runtime_owner'] = 'js/strategy-a-auto-start.js'
    cleanup['strategy_a_auto_self_test'] = 'js/strategy-a-auto-start.selftest.js'
    cleanup['strategy_a_versioned_compatibility_retired'] = [str(p) for p in OLD_RUNTIME_FILES]
    cleanup['strategy_a_runtime_registry'] = 'js/runtime-modules.js'

build_path.write_text(json.dumps(build, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')

reachable_after, edges_after, texts_after = graph()
problems: list[str] = []
if CANONICAL_OWNER not in reachable_after:
    problems.append('canonical-auto-start-lost-from-runtime')
for old in OLD_RUNTIME_FILES + [OLD_SELFTEST]:
    if (ROOT / old).exists(): problems.append(f'{old}:still-exists')
    for src, text in texts_after.items():
        if old.name in text: problems.append(f'{old}:active-reference-remains:{src}')
if not (ROOT / CANONICAL_SELFTEST).is_file():
    problems.append('canonical-selftest-missing')

post_build = json.loads(build_path.read_text(encoding='utf-8'))
post_owner = post_build.get('strategy_a_owner_api_auto_start', {})
if post_owner.get('runtime_patch') != 'js/strategy-a-auto-start.js':
    problems.append('build-truth-current-runtime-patch-not-canonical')
if post_owner.get('compatibility_loader') != 'js/runtime-modules.js':
    problems.append('build-truth-runtime-loader-not-canonical')
if post_owner.get('canonical_owner') != 'AgentCryptoAutoPaperRunner':
    problems.append('build-truth-owner-name-not-canonical')

if problems:
    raise SystemExit('Strategy A compatibility retirement guard failed:\n' + '\n'.join(problems))

print(json.dumps({
    'build': post_build.get('build'),
    'market_core': post_build.get('market_core') or post_build.get('engine'),
    'runtime_nodes_before': len(reachable),
    'runtime_nodes_after': len(reachable_after),
    'canonical_owner_reachable': CANONICAL_OWNER in reachable_after,
    'retired_runtime_files': [str(p) for p in OLD_RUNTIME_FILES],
    'selftest_renamed': {'from': str(OLD_SELFTEST), 'to': str(CANONICAL_SELFTEST)},
    'build_truth_runtime_patch': post_owner.get('runtime_patch'),
    'build_truth_loader': post_owner.get('compatibility_loader'),
    'historical_paths_preserved_in_build_truth': True,
}, ensure_ascii=False, indent=2, sort_keys=True))
