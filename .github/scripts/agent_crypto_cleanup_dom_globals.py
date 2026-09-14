#!/usr/bin/env python3
from __future__ import annotations

from collections import defaultdict
from pathlib import Path
import json
import re

ROOT = Path('public/agent_crypto_erith_ia/administrator')
TEXT_SUFFIXES = {'.js', '.html', '.css'}
files = [p for p in ROOT.rglob('*') if p.is_file() and p.suffix.lower() in TEXT_SUFFIXES]
texts: dict[Path, str] = {}
for path in files:
    try:
        texts[path] = path.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        pass

IDENT_SUFFIX = re.compile(r'^(?P<base>[A-Za-z_$][A-Za-z0-9_$]*?)(?:_)?(?P<stamp>(?:39|40)\d{2,4})$')
DASH_SUFFIX = re.compile(r'^(?P<base>[A-Za-z_][A-Za-z0-9_-]*?)-(?P<stamp>(?:39|40)\d{2,4})$')
TOKEN_RE = re.compile(r'(?<![A-Za-z0-9_$])([A-Za-z_$][A-Za-z0-9_$]*)(?![A-Za-z0-9_$])')
GLOBAL_RE = re.compile(r'\b(?:globalThis|window)\.([A-Za-z_$][A-Za-z0-9_$]*)')
DATASET_RE = re.compile(r'\.dataset\.([A-Za-z_$][A-Za-z0-9_$]*)')
ID_ATTR_RE = re.compile(r'\bid=["\']([^"\']+)["\']', re.I)
GET_ID_RE = re.compile(r'getElementById\(\s*["\']([^"\']+)["\']\s*\)')
CSS_ID_RE = re.compile(r'#([A-Za-z_][A-Za-z0-9_-]*)')
CLASS_ATTR_RE = re.compile(r'\bclass=["\']([^"\']+)["\']', re.I)
CSS_CLASS_RE = re.compile(r'(?<![A-Za-z0-9_-])\.([A-Za-z_][A-Za-z0-9_-]*)')
DATA_ATTR_RE = re.compile(r'\b(data-[A-Za-z0-9_-]+)(?=\s*=|\]|\s|>)', re.I)

all_tokens = set()
globals_seen = set()
dataset_seen = set()
ids_seen = set()
classes_seen = set()
data_attrs_seen = set()
for text in texts.values():
    all_tokens.update(TOKEN_RE.findall(text))
    globals_seen.update(GLOBAL_RE.findall(text))
    dataset_seen.update(DATASET_RE.findall(text))
    ids_seen.update(ID_ATTR_RE.findall(text))
    ids_seen.update(GET_ID_RE.findall(text))
    ids_seen.update(CSS_ID_RE.findall(text))
    for raw in CLASS_ATTR_RE.findall(text):
        classes_seen.update(x for x in re.split(r'\s+', raw.strip()) if x)
    classes_seen.update(CSS_CLASS_RE.findall(text))
    data_attrs_seen.update(DATA_ATTR_RE.findall(text))


def build_mapping(values: set[str], suffix_re: re.Pattern[str], namespace: str, canonical_exists: set[str], token_guard: bool = False):
    grouped: dict[str, list[str]] = defaultdict(list)
    for old in sorted(values):
        match = suffix_re.match(old)
        if not match:
            continue
        base = match.group('base').rstrip('_-')
        if len(base) < 4:
            continue
        grouped[base].append(old)
    mapping = {}
    skipped = []
    for base, originals in sorted(grouped.items()):
        if len(originals) != 1:
            skipped.append({'namespace': namespace, 'base': base, 'reason': 'collision', 'originals': originals})
            continue
        if base in canonical_exists or (token_guard and base in all_tokens):
            skipped.append({'namespace': namespace, 'base': base, 'reason': 'canonical-name-already-present', 'originals': originals})
            continue
        mapping[originals[0]] = base
    return mapping, skipped

m_global, s_global = build_mapping(globals_seen, IDENT_SUFFIX, 'global', globals_seen, token_guard=True)
m_dataset, s_dataset = build_mapping(dataset_seen, IDENT_SUFFIX, 'dataset', dataset_seen)
m_id, s_id = build_mapping(ids_seen, IDENT_SUFFIX, 'id', ids_seen)
# IDs may also be dashed.
mid_dash, sid_dash = build_mapping(ids_seen, DASH_SUFFIX, 'id-dash', ids_seen)
for old, new in mid_dash.items():
    if old not in m_id and new not in m_id.values():
        m_id[old] = new
m_class, s_class = build_mapping(classes_seen, DASH_SUFFIX, 'class', classes_seen)
# data-* names retain the data- prefix; strip only a trailing release stamp.
data_values = {x[5:] for x in data_attrs_seen if x.lower().startswith('data-')}
m_data_core, s_data = build_mapping(data_values, DASH_SUFFIX, 'data-attr', data_values)
m_data = {'data-' + old: 'data-' + new for old, new in m_data_core.items()}

mapping = {}
for namespace_map in (m_global, m_dataset, m_id, m_class, m_data):
    for old, new in namespace_map.items():
        if old in mapping and mapping[old] != new:
            continue
        mapping[old] = new

# Replace with identifier/hyphen token boundaries so substrings are not touched.
ordered = sorted(mapping, key=len, reverse=True)
if ordered:
    combined = re.compile(r'(?<![A-Za-z0-9_$-])(' + '|'.join(re.escape(x) for x in ordered) + r')(?![A-Za-z0-9_$-])')
else:
    combined = None

changed = []
replacements = 0
for path, text in texts.items():
    if not combined:
        continue
    local = [0]
    def repl(match: re.Match[str]) -> str:
        old = match.group(1)
        new = mapping.get(old, old)
        if new != old:
            local[0] += 1
        return new
    new_text = combined.sub(repl, text)
    if new_text != text:
        path.write_text(new_text, encoding='utf-8')
        changed.append(str(path.relative_to(ROOT)))
        replacements += local[0]

print(json.dumps({
    'global_renames': len(m_global),
    'dataset_renames': len(m_dataset),
    'id_renames': len(m_id),
    'class_renames': len(m_class),
    'data_attr_renames': len(m_data),
    'total_unique_names': len(mapping),
    'total_replacements': replacements,
    'changed_files': len(changed),
    'skipped_count': len(s_global+s_dataset+s_id+sid_dash+s_class+s_data),
    'mapping': mapping,
    'skipped_preview': (s_global+s_dataset+s_id+sid_dash+s_class+s_data)[:120],
}, ensure_ascii=False, indent=2, sort_keys=True))
