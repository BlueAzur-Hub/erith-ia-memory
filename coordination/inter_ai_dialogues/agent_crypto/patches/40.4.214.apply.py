from pathlib import Path
import json
import subprocess

REPO = Path('.')
ROOT = REPO / 'public/agent_crypto_erith_ia/administrator'
DATA = REPO / 'public/agent_crypto_erith_ia/data/crypto'
DOCS = REPO / 'coordination/inter_ai_dialogues/agent_crypto'
BUILD = '40.4.214'
PARENT = '40.4.213'
ENGINE = '38.15.11'
RELEASE = 'EXTENDED MARKET UNIVERSE INGESTION RECOVERY · RESTORED 500/1000 REARM LOCK'
STATUS = 'extended_market_universe_ingestion_recovery_404214_operator_validation_required'


def once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'STOP {label}: expected 1, found {count}')
    return text.replace(old, new, 1)


def load(path: Path):
    return json.loads(path.read_text(encoding='utf-8'))


# Baseline / producer truth.
version = load(ROOT / 'version.json')
if version.get('build') != PARENT or str((version.get('engine') or {}).get('reference_build')) != ENGINE:
    raise SystemExit('STOP parent build or protected Market Core drift')
extended = load(DATA / 'extended.json')
extended_status = load(DATA / 'extended_status.json')
if extended_status.get('status') != 'ready':
    raise SystemExit('STOP Extended producer not ready')
if extended.get('schema') != 'agent_crypto_public_extended_market_snapshot_v1':
    raise SystemExit('STOP Extended schema drift')
rows = extended.get('coins') or []
if len(rows) < 700 or int(extended.get('assets_count') or 0) != len(rows):
    raise SystemExit(f'STOP Extended payload incomplete: {len(rows)}')
build_truth = load(ROOT / 'build.json')
if build_truth.get('build') != '40.4.211':
    raise SystemExit(f'STOP reproduced build.json baseline changed: {build_truth.get("build")}')

# 1) Runtime cause: workspace restore can happen after the fixed 900 ms warm-up.
app_path = ROOT / 'app.js'
app = app_path.read_text(encoding='utf-8')
budget_keys = ('setInterval(', 'setTimeout(', 'MutationObserver', 'IntersectionObserver', 'fetch(', 'new WebSocket', 'localStorage.setItem')
budget_before = {key: app.count(key) for key in budget_keys}
app = once(
    app,
    '''  state.marketVisibleLimit = ATLAS_MARKET_VIEW_LIMITS.includes(Number(saved.marketVisibleLimit)) ? Number(saved.marketVisibleLimit) : 50;\n  atlasSyncMarketUniverseControls();''',
    '''  state.marketVisibleLimit = ATLAS_MARKET_VIEW_LIMITS.includes(Number(saved.marketVisibleLimit)) ? Number(saved.marketVisibleLimit) : 50;\n  atlasSyncMarketUniverseControls();\n\n  /* 40.4.214 — EXTENDED UNIVERSE RESTORE REARM.\n     A persisted 500/1000 view can be restored after the historical 900 ms\n     warm-up already observed the default 50. Reuse the existing 40.3.115\n     loader at the one-shot workspace restoration boundary. */\n  if (atlasMarketUniverseExtendedRequested403115(state.marketVisibleLimit)) {\n    void atlasMarketUniverseEnsure403115(state.marketVisibleLimit);\n  }''',
    'workspace Extended rearm',
)
app = once(
    app,
    '''window.setTimeout(()=>{\n  atlasSyncMarketUniverseControls();\n  if(atlasMarketUniverseLimit403115()>250){\n    void atlasMarketUniverseEnsure403115(atlasMarketUniverseLimit403115());\n  }\n},900);''',
    '''window.setTimeout(()=>{\n  atlasSyncMarketUniverseControls();\n  const limit404214=atlasMarketUniverseLimit403115();\n  if(\n    limit404214>250\n    && atlasMarketUniverseState403115.status!=="loading"\n    && !atlasExtendedMarketCache403103.payload\n  ){\n    void atlasMarketUniverseEnsure403115(limit404214);\n  }\n},900);''',
    '900ms fallback dedupe',
)
budget_after = {key: app.count(key) for key in budget_keys}
if budget_after != budget_before:
    raise SystemExit(f'STOP recurring/network owner budget changed: {budget_before} -> {budget_after}')
app_path.write_text(app, encoding='utf-8')

# 2) Publication truth: build.json becomes a first-class release authority.
driver_path = REPO / '.github/scripts/agent_crypto_release_driver.py'
driver = driver_path.read_text(encoding='utf-8')
driver = once(
    driver,
    '''    manifest_path = BASE / "version.json"\n    mirror_path = BASE / "administrator-version.json"\n    manifest = load_json(manifest_path)\n    mirror = load_json(mirror_path)''',
    '''    manifest_path = BASE / "version.json"\n    mirror_path = BASE / "administrator-version.json"\n    build_truth_path = BASE / "build.json"\n    manifest = load_json(manifest_path)\n    mirror = load_json(mirror_path)\n    build_truth = load_json(build_truth_path)''',
    'release driver build.json load',
)
driver = once(
    driver,
    '''    if str((manifest.get("engine") or {}).get("reference_build") or "") != PROTECTED_ENGINE:\n        die("protected Market Core manifest identity changed before release")''',
    '''    if str((manifest.get("engine") or {}).get("reference_build") or "") != PROTECTED_ENGINE:\n        die("protected Market Core manifest identity changed before release")\n    if str(build_truth.get("engine") or "") != PROTECTED_ENGINE:\n        die("protected Market Core build.json identity changed before release")''',
    'release driver build.json engine',
)
driver = once(
    driver,
    '''    write(index_path, index)\n\n    manifest["release"] = release''',
    '''    write(index_path, index)\n\n    build_truth["build"] = build\n    build_truth["engine"] = PROTECTED_ENGINE\n    build_truth["release"] = release\n    build_truth["published"] = True\n    build_truth["status"] = status\n    write(build_truth_path, json.dumps(build_truth, ensure_ascii=False, indent=2) + "\\n")\n\n    manifest["release"] = release''',
    'release driver build.json write',
)
driver = once(
    driver,
    '''    files = manifest.get("files")\n    if not isinstance(files, dict) or not files:\n        die("version.json files hash map missing")\n    for rel in list(files):''',
    '''    files = manifest.get("files")\n    if not isinstance(files, dict) or not files:\n        die("version.json files hash map missing")\n    files["build.json"] = sha256(build_truth_path)\n    for rel in list(files):''',
    'release driver build.json hash',
)
driver_path.write_text(driver, encoding='utf-8')

# 3) Permanent validator: build.json + Extended restore lifecycle are guarded.
guard_path = REPO / '.github/scripts/agent_crypto_version_truth_guard.py'
guard = guard_path.read_text(encoding='utf-8')
guard = once(
    guard,
    '''    manifest = load_json(base / "version.json")\n    mirror = load_json(base / "administrator-version.json")''',
    '''    manifest = load_json(base / "version.json")\n    mirror = load_json(base / "administrator-version.json")\n    build_truth = load_json(base / "build.json")''',
    'guard build.json load',
)
guard = once(
    guard,
    '''    if actual["meta_release"] != release or actual["admin_release"] != release:\n        fail("release identity drift between manifest / HTML / administrator runtime")\n\n    if str(mirror.get("build") or "").strip() != build:''',
    '''    if actual["meta_release"] != release or actual["admin_release"] != release:\n        fail("release identity drift between manifest / HTML / administrator runtime")\n\n    if str(build_truth.get("build") or "").strip() != build:\n        fail("build.json build drift")\n    if str(build_truth.get("engine") or "").strip() != PROTECTED_ENGINE:\n        fail("build.json protected Market Core drift")\n    if str(build_truth.get("release") or "").strip() != release:\n        fail("build.json release drift")\n    if str(build_truth.get("status") or "").strip() != str(manifest.get("status") or "").strip():\n        fail("build.json status drift")\n    if build_truth.get("published") is not True:\n        fail("build.json published truth missing")\n\n    if str(mirror.get("build") or "").strip() != build:''',
    'guard build.json truth',
)
guard = once(
    guard,
    '''    for domain in ("crypto", "metals", "indices", "energy", "cross-market"):\n        if not str((domains.get(domain) or {}).get("state") or "").startswith("ACTIVE"):\n            fail(f"market architecture active-domain drift: {domain}")\n\n    files = manifest.get("files")''',
    '''    for domain in ("crypto", "metals", "indices", "energy", "cross-market"):\n        if not str((domains.get(domain) or {}).get("state") or "").startswith("ACTIVE"):\n            fail(f"market architecture active-domain drift: {domain}")\n\n    if current_num >= (40, 4, 214):\n        required = (\n            "40.4.214 — EXTENDED UNIVERSE RESTORE REARM",\n            "atlasMarketUniverseExtendedRequested403115(state.marketVisibleLimit)",\n            "void atlasMarketUniverseEnsure403115(state.marketVisibleLimit);",\n            "atlasMarketUniverseState403115.status!==\\\"loading\\\"",\n            "!atlasExtendedMarketCache403103.payload",\n        )\n        for marker in required:\n            if marker not in root:\n                fail(f"40.4.214 Extended ingestion regression: missing {marker}")\n\n    files = manifest.get("files")''',
    'guard Extended lifecycle',
)
guard_path.write_text(guard, encoding='utf-8')

# 4) Catch handoff truth up from textual checkpoint .211.
manifest_path = DOCS / 'AGENT_CRYPTO_RELEASE_MANIFEST.md'
text = manifest_path.read_text(encoding='utf-8')
text = once(text, 'Release courante : **40.4.211**  \n', 'Release courante : **40.4.214**\n', 'manifest version')
text = once(text, 'commit final 40.4.211', 'commit final 40.4.214', 'manifest archive')
text += '''\n40.4.212 est une release de **Atlas Heartbeat Rearm** : réarmement one-shot du propriétaire CURRENT canonique après boot complet, sans nouveau scheduler.\n\n40.4.213 est une release de **Market Architecture Truth Convergence** : Crypto/Métaux/Indices/Énergie/Cross et leurs propriétaires actifs deviennent la vérité canonique ; les contrats 40.4.166/167 sont historiques.\n\n40.4.214 est une release de **Extended Market Universe Ingestion Recovery** : une vue 500/1000 restaurée depuis l’espace mémorisé réarme le loader Extended existant après hydratation du Market. `build.json` rejoint le release driver et le Version Truth Guard.\n'''
manifest_path.write_text(text, encoding='utf-8')

prompt_path = DOCS / 'PROMPT_REPRISE_AETHER_AGENT_CRYPTO.md'
text = prompt_path.read_text(encoding='utf-8')
text = once(text, 'Version de reprise : **40.4.211**  \n', 'Version de reprise : **40.4.214**\n', 'prompt version')
marker = '40.4.211 verrouille l’**autorité unique d’affichage de version** : `market-stack.js` ne peut plus écrire `#atlasVersionControlText`; le badge first-paint est synchronisé par le release driver, `version-truth.js` reste l’autorité runtime globale, et les versions de module sont explicitement séparées de la release Agent-Crypto.\n'
text = once(text, marker, marker + '''\n40.4.212 réarme **Atlas CURRENT** une seule fois après boot complet via le propriétaire canonique existant, sans nouveau timer/observer/fetch/scheduler.\n\n40.4.213 converge la **vérité d’architecture Markets** : cycle Crypto → Métaux → Indices → Énergie → Cross, `market-stack.js` routeur, `parallel-markets.js` propriétaire des domaines parallèles, contrats 40.4.166/167 historiques.\n\n40.4.214 restaure l’**ingestion de l’univers Extended** lorsque la vue mémorisée 500/1000 est appliquée après hydratation du Market ; le loader 40.3.115 existant est réutilisé. `build.json` est désormais écrit et validé par l’infrastructure canonique de release.\n''', 'prompt releases')
prompt_path.write_text(text, encoding='utf-8')

ledger_path = DOCS / 'AGENT_CRYPTO_FIN_DE_FIL_AETHER.md'
text = ledger_path.read_text(encoding='utf-8')
text = once(text, 'Version canonique de clôture : **40.4.211**  \n', 'Version canonique de clôture : **40.4.214**\n', 'ledger version')
text = once(text, '## 1. Cascade finale 40.4.205 → 40.4.211', '## 1. Cascade finale 40.4.205 → 40.4.214', 'ledger heading')
marker = '- **40.4.211** — Version Display Single Authority lock : suppression de l’écriture globale de version par `market-stack.js`, first-paint synchronisé, `version-truth.js` autorité runtime, cache tokens des propriétaires modifiés convergents, et libellé `Module` pour la version locale des marchés parallèles.\n'
text = once(text, marker, marker + '''- **40.4.212** — Atlas Heartbeat Rearm : réarmement one-shot du propriétaire CURRENT canonique après boot complet ; HOT core et gates préservés.\n- **40.4.213** — Market Architecture Truth Convergence : vérité canonique du cycle Crypto/Métaux/Indices/Énergie/Cross et propriétaires runtime actifs ; 40.4.166/167 historiques.\n- **40.4.214** — Extended Market Universe Ingestion Recovery : correction de la course warm-up 900 ms / restauration tardive de la vue 500/1000 ; loader Extended réarmé depuis le lifecycle one-shot de l’espace mémorisé ; `build.json` rejoint writer + guard canoniques.\n''', 'ledger releases')
ledger_path.write_text(text, encoding='utf-8')

# 5) Canonical release writer.
contract_path = Path('/tmp/agent_crypto_404214_contract.json')
contract_path.write_text(json.dumps({
    'schema': 'erith.admin.extended-market-universe-ingestion-recovery.v1',
    'build': BUILD,
    'parent_build': PARENT,
    'cause': 'Persisted 500/1000 could restore after the fixed 900 ms warm-up observed default 50, leaving Extended cold.',
    'owner': 'app.js::atlasWorkspaceRestoreAfterMarket + atlasMarketUniverseEnsure403115',
    'extended_source': '../data/crypto/extended.json',
    'restored_500_1000_rearm': True,
    'existing_900ms_fallback_deduped': True,
    'state_coins_core_mutated': False,
    'comparison_extended_injection': False,
    'oracle_extended_injection': False,
    'new_network_owner': False,
    'new_timer': False,
    'new_observer': False,
    'new_storage_owner': False,
    'market_core_modified': False,
    'build_json_release_truth_added': True,
    'firefox_operator_validation_required': True,
}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
subprocess.run([
    'python', '.github/scripts/agent_crypto_release_driver.py',
    '--build', BUILD,
    '--parent', PARENT,
    '--release', RELEASE,
    '--status', STATUS,
    '--contract-key', 'extended_market_universe_ingestion_recovery_404214',
    '--contract-json', str(contract_path),
    '--lineage-note', '40.4.214 restores Extended 500/1000 ingestion after one-shot workspace hydration and adds build.json to canonical release truth.',
], check=True)

# Final static assertions before workflow gates.
final_truth = load(ROOT / 'build.json')
final_version = load(ROOT / 'version.json')
final_mirror = load(ROOT / 'administrator-version.json')
if not (final_truth.get('build') == final_version.get('build') == final_mirror.get('build') == BUILD):
    raise SystemExit('STOP final version identity divergence')
if final_truth.get('engine') != ENGINE or final_truth.get('published') is not True:
    raise SystemExit('STOP build.json final truth')
if not final_version.get('files', {}).get('build.json'):
    raise SystemExit('STOP build.json missing from manifest hash map')
print({'ok': True, 'build': BUILD, 'core': len(load(DATA/'latest.json').get('coins') or []), 'extended': len(rows)})
