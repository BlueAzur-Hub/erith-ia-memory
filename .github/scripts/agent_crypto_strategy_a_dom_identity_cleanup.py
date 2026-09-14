#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import collections
import json
import re

ROOT = Path('public/agent_crypto_erith_ia/administrator')

TARGETS = {
    Path('js/strategy-a-after-cost-metrics.js'): {
        'strategyAAfterCostStyle404292': 'strategyAAfterCostStyle',
        'strategyAAfterCostStyle404298': 'strategyAAfterCostStyle',
        'strategyAAfterCostExport404298': 'strategyAAfterCostExport',
    },
    Path('js/strategy-a-evidence-dossier.js'): {
        'strategyADossierStyle404294': 'strategyADossierStyle',
        'strategyADossierStyle404295': 'strategyADossierStyle',
    },
    Path('js/strategy-a-paper-lifecycle.js'): {
        'strategyAPaperLifecycleStyle404291': 'strategyAPaperLifecycleStyle',
        'strategyAPaperLifecycleStyle404295': 'strategyAPaperLifecycleStyle',
    },
    Path('js/strategy-a-safety-certification.js'): {
        'strategyASafetyStyle404293': 'strategyASafetyStyle',
        'strategyASafetyStyle404295': 'strategyASafetyStyle',
        'strategyASafetyStyle404299': 'strategyASafetyStyle',
        'strategyASafetyExport404299': 'strategyASafetyExport',
    },
    Path('js/strategy-a-paper-after-cost-acceptance.js'): {
        'strategyAPaperAfterCostProofStyle406063': 'strategyAPaperAfterCostProofStyle',
        'strategyAPaperAfterCostProof406063': 'strategyAPaperAfterCostProof',
        'strategyAPaperAfterCostRun406063': 'strategyAPaperAfterCostRun',
        'strategyAPaperAfterCostExport406063': 'strategyAPaperAfterCostExport',
    },
}

# Exact legacy-removal patterns are normalized BEFORE identifier replacement so a
# former predecessor cleanup never turns into "remove canonical then recreate".
NORMALIZATIONS = {
    Path('js/strategy-a-after-cost-metrics.js'): [
        (
            'function ensureStyle(){if(typeof document==="undefined")return;document.getElementById("strategyAAfterCostStyle404292")?.remove();if(document.getElementById("strategyAAfterCostStyle404298"))return;',
            'function ensureStyle(){if(typeof document==="undefined")return;if(document.getElementById("strategyAAfterCostStyle"))return;'
        ),
    ],
    Path('js/strategy-a-evidence-dossier.js'): [
        (
            'function ensureStyle(){if(typeof document==="undefined"||document.getElementById("strategyADossierStyle404295"))return;document.getElementById("strategyADossierStyle404294")?.remove();',
            'function ensureStyle(){if(typeof document==="undefined"||document.getElementById("strategyADossierStyle"))return;'
        ),
    ],
    Path('js/strategy-a-paper-lifecycle.js'): [
        (
            'if (document.getElementById("strategyAPaperLifecycleStyle404295")) return;\n    document.getElementById("strategyAPaperLifecycleStyle404291")?.remove();',
            'if (document.getElementById("strategyAPaperLifecycleStyle")) return;'
        ),
    ],
    Path('js/strategy-a-safety-certification.js'): [
        (
            'function ensureStyle(){if(typeof document==="undefined")return;document.getElementById("strategyASafetyStyle404295")?.remove();document.getElementById("strategyASafetyStyle404293")?.remove();if(document.getElementById("strategyASafetyStyle404299"))return;',
            'function ensureStyle(){if(typeof document==="undefined")return;if(document.getElementById("strategyASafetyStyle"))return;'
        ),
    ],
}

# Only these current canonical modules are allowed to be modified in this pass.
# Historical files remain untouched until their implementation ownership is retired explicitly.
all_old = {old for mapping in TARGETS.values() for old in mapping}
changed = []
counts = collections.Counter()

for rel, mapping in TARGETS.items():
    path = ROOT / rel
    if not path.is_file():
        raise SystemExit(f'Missing canonical Strategy A module: {rel}')
    text = path.read_text(encoding='utf-8')
    original = text

    for before, after in NORMALIZATIONS.get(rel, []):
        if before not in text:
            raise SystemExit(f'Expected normalization pattern missing in {rel}: {before[:100]}')
        text = text.replace(before, after, 1)
        counts['normalized_legacy_style_guards'] += 1

    for old, new in mapping.items():
        n = text.count(old)
        if n:
            text = text.replace(old, new)
            counts[f'{old}->{new}'] += n

    if text != original:
        path.write_text(text, encoding='utf-8')
        changed.append(str(rel))

# Guard 1: every mapped historical ID is absent from its canonical target module.
remaining = []
for rel, mapping in TARGETS.items():
    text = (ROOT / rel).read_text(encoding='utf-8')
    for old in mapping:
        if old in text:
            remaining.append(f'{rel}:{old}')
if remaining:
    raise SystemExit('Historical Strategy A DOM IDs remain in canonical modules:\n' + '\n'.join(remaining))

# Guard 2: canonical modules must not contain duplicate literal id="..." values internally.
local_dups = []
for rel in TARGETS:
    text = (ROOT / rel).read_text(encoding='utf-8')
    ids = re.findall(r'\bid=["\']([^"\']+)["\']', text)
    for ident, count in collections.Counter(ids).items():
        if count > 1:
            local_dups.append(f'{rel}:{ident}x{count}')
if local_dups:
    raise SystemExit('Duplicate literal IDs inside canonical Strategy A modules:\n' + '\n'.join(local_dups))

# Guard 3: no canonical style helper may remove its own canonical style immediately.
self_remove = []
for rel in TARGETS:
    text = (ROOT / rel).read_text(encoding='utf-8')
    for ident in ('strategyAAfterCostStyle','strategyADossierStyle','strategyAPaperLifecycleStyle','strategyASafetyStyle'):
        if f'getElementById("{ident}")?.remove()' in text:
            self_remove.append(f'{rel}:{ident}')
if self_remove:
    raise SystemExit('Canonical style self-removal detected:\n' + '\n'.join(self_remove))

print(json.dumps({
    'changed_files': changed,
    'changed_file_count': len(changed),
    'replacement_counts': dict(counts),
    'historical_ids_targeted': len(all_old),
    'market_core_touched': False,
}, ensure_ascii=False, indent=2, sort_keys=True))
