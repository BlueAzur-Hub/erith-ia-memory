#!/usr/bin/env python3
from pathlib import Path
import json
import subprocess

BASE = Path('public/agent_crypto_erith_ia/administrator')
BUILD = '40.4.257'
PARENT = '40.4.256'
RELEASE = 'GRAPH DEFAULT TOP 5 BOOT STATE LOCK'
STATUS = 'graph_default_top5_boot_state_lock_404257'


def must(text: str, marker: str) -> None:
    if marker not in text:
        raise RuntimeError(f'missing marker: {marker}')


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected 1 match, got {count}')
    return text.replace(old, new, 1)


def patch() -> None:
    manifest = json.loads((BASE/'version.json').read_text(encoding='utf-8'))
    assert manifest['build'] == PARENT, manifest['build']
    assert manifest['engine']['reference_build'] == '38.15.11'
    assert manifest['engine']['status'] == 'protected'

    root_path = BASE/'app.js'
    root = root_path.read_text(encoding='utf-8')

    old_neutral = '''  return {
    period: 1,
    selectedCoinId: null,
    comparisonIds: [],
    comparisonPreset: "empty",
    selectionCleared: true,
    selectionIntent: "explicit-empty",
    graphMode: "normal",
    detailCollapsed: deck?.classList.contains("detail-collapsed") === true,'''
    new_neutral = '''  return {
    period: 1,
    selectedCoinId: ATLAS_CURATED_TOP5_IDS[0],
    comparisonIds: [...ATLAS_CURATED_TOP5_IDS],
    comparisonPreset: "rank-5",
    selectionCleared: false,
    selectionIntent: "selected",
    graphMode: "normal",
    detailCollapsed: deck?.classList.contains("detail-collapsed") === true,'''
    root = replace_once(root, old_neutral, new_neutral, 'Graph Context V7 neutral market default')

    oracle_marker = 'function atlasGraphContextV7NormalizeOracle(raw = {}) {'
    helper = '''function atlasGraphContextV7IsLegacyEmptySeed404257(context) {
  if (!context || typeof context !== "object") return false;
  const market = context.market && typeof context.market === "object" ? context.market : {};
  const ids = Array.isArray(market.comparisonIds) ? market.comparisonIds.filter(Boolean) : [];
  const lastAction = String(context.lastAction || "");
  return Number(context.sequence || 0) === 0
    && ["", "v7-neutral", "v7-first-db-seed", "v7-first-boot-neutral"].includes(lastAction)
    && ids.length === 0
    && market.comparisonPreset === "empty"
    && market.selectionCleared === true
    && market.selectionIntent === "explicit-empty";
}

'''
    must(root, oracle_marker)
    assert 'function atlasGraphContextV7IsLegacyEmptySeed404257(' not in root
    root = root.replace(oracle_marker, helper + oracle_marker, 1)

    root = replace_once(
        root,
        '''  // 40.1.97: DO NOT seed/apply Vide before IndexedDB has been read.
  // The neutral state is created only after a confirmed missing-row result.''',
        '''  // 40.4.257: DO NOT seed/apply the default Top 5 before IndexedDB has been read.
  // Persisted operator intent stays authoritative; the default exists only after a confirmed missing-row result.''',
        'Graph Context V7 boot comment'
    )

    root = replace_once(
        root,
        '''    let persisted = null;
    let readFailed = false;
    atlasGraphContextV7BootPhase = "reading";''',
        '''    let persisted = null;
    let readFailed = false;
    let migratedLegacyEmptySeed404257 = false;
    atlasGraphContextV7BootPhase = "reading";''',
        'Graph Context V7 migration flag'
    )

    old_persisted = '''    if (persisted) {
      // Persisted IndexedDB is the sole restart authority. No boot/runtime state may outrank it.
      atlasGraphContextV7Memory = atlasGraphContextV7Normalize(persisted);
    } else if (!readFailed) {
      // Confirmed first use only: create a neutral context after the database returned no row.
      atlasGraphContextV7Memory = atlasGraphContextV7Normalize({
        activeSurface:"market",
        market:atlasGraphContextV7NeutralMarket(),
        oracle:{}
      });
    }'''
    new_persisted = '''    if (persisted) {
      // Persisted IndexedDB remains the restart authority. 40.4.257 migrates only
      // the legacy sequence-0 system seed that represented “Vide”; an operator
      // Clear has sequence/action evidence and is therefore preserved exactly.
      migratedLegacyEmptySeed404257 = atlasGraphContextV7IsLegacyEmptySeed404257(persisted);
      if (migratedLegacyEmptySeed404257) {
        const migratedAt404257 = Date.now();
        atlasGraphContextV7Memory = atlasGraphContextV7Normalize({
          ...persisted,
          activeSurface:"market",
          market:atlasGraphContextV7NeutralMarket(),
          savedAt:new Date(migratedAt404257).toISOString(),
          savedAtMs:migratedAt404257,
          sequence:1,
          lastAction:"system-default-top5-404257"
        });
      } else {
        atlasGraphContextV7Memory = atlasGraphContextV7Normalize(persisted);
      }
    } else if (!readFailed) {
      // Confirmed first use only: Top 5 is the canonical non-empty graph default.
      atlasGraphContextV7Memory = atlasGraphContextV7Normalize({
        activeSurface:"market",
        market:atlasGraphContextV7NeutralMarket(),
        oracle:{},
        lastAction:"system-default-top5-404257"
      });
    }'''
    root = replace_once(root, old_persisted, new_persisted, 'Graph Context V7 persisted/first-use branch')

    old_write = '''    if (!readFailed && persisted) {
      atlasGraphContextV7Persistence.state = "ok";
      atlasGraphContextV7Persistence.verifiedSequence = Number(persisted.sequence || 0);
      atlasGraphContextV7Persistence.lastWriteAt = persisted.savedAt || "";
    } else if (!readFailed && atlasGraphContextV7Memory) {
      atlasGraphContextV7Persistence.state = "pending";
      // First-ever row creation is a system seed, never an operator event.
      await atlasGraphContextV7QueuePersist(atlasGraphContextV7Read(),"v7-first-db-seed");
    }'''
    new_write = '''    if (!readFailed && persisted) {
      if (migratedLegacyEmptySeed404257) {
        // One-time system migration of the old accidental empty seed.
        await atlasGraphContextV7QueuePersist(atlasGraphContextV7Read(),"system-default-top5-404257");
      } else {
        atlasGraphContextV7Persistence.state = "ok";
        atlasGraphContextV7Persistence.verifiedSequence = Number(persisted.sequence || 0);
        atlasGraphContextV7Persistence.lastWriteAt = persisted.savedAt || "";
      }
    } else if (!readFailed && atlasGraphContextV7Memory) {
      atlasGraphContextV7Persistence.state = "pending";
      // First-ever row creation is a system seed, never an operator event.
      await atlasGraphContextV7QueuePersist(atlasGraphContextV7Read(),"system-default-top5-404257");
    }'''
    root = replace_once(root, old_write, new_write, 'Graph Context V7 persistence migration')
    root_path.write_text(root, encoding='utf-8')

    index_path = BASE/'index.html'
    index = index_path.read_text(encoding='utf-8')
    index = replace_once(
        index,
        '<button class="compare-btn" id="btnChartTop5" aria-label="Comparer Bitcoin, Ethereum, BNB, XRP et Solana" type="button">Top 5</button>',
        '<button class="compare-btn active" id="btnChartTop5" aria-label="Comparer Bitcoin, Ethereum, BNB, XRP et Solana" type="button">Top 5</button>',
        'Top 5 initial active indicator'
    )
    index = replace_once(
        index,
        '<script src="./js/views/system-presentation.js?v=administrator-build-40.4.256"></script>',
        '<script src="./js/views/system-presentation.js?v=administrator-build-40.4.257"></script>',
        'System presentation cache identity'
    )
    index = replace_once(
        index,
        '<script src="./js/views/view-lifecycle.js?v=administrator-build-40.4.256"></script>',
        '<script src="./js/views/view-lifecycle.js?v=administrator-build-40.4.257"></script>',
        'View lifecycle cache identity'
    )
    index_path.write_text(index, encoding='utf-8')

    contract = {
        'build': BUILD,
        'parent': PARENT,
        'graph_context_owner': 'app.js / Graph Context V7',
        'new_first_boot_default': 'rank-5',
        'new_first_boot_ids': ['bitcoin','ethereum','binancecoin','ripple','solana'],
        'legacy_system_empty_seed_migrated': True,
        'legacy_seed_migration_scope': 'sequence 0 + system-neutral action + explicit-empty only',
        'intentional_user_clear_preserved': True,
        'persisted_valid_operator_selection_preserved': True,
        'indexeddb_schema_changed': False,
        'graph_data_loader_changed': False,
        'historical_fetch_changed': False,
        'new_fetch_owner': False,
        'new_timer': False,
        'new_observer': False,
        'new_storage_owner': False,
        'technical_reading_changed': False,
        'parallel_markets_changed': False,
        'atlas_changed': False,
        'oracle_changed': False,
        'window_manager_changed': False,
        'classic_web_changed': False,
        'market_core_changed': False,
        'protected_market_core': '38.15.11'
    }
    Path('/tmp/contract-404257.json').write_text(json.dumps(contract, ensure_ascii=False, indent=2), encoding='utf-8')

    subprocess.run([
        'python', '.github/scripts/agent_crypto_release_driver.py',
        '--build', BUILD,
        '--parent', PARENT,
        '--release', RELEASE,
        '--status', STATUS,
        '--contract-key', 'graph_default_top5_boot_state_lock_404257',
        '--contract-json', '/tmp/contract-404257.json',
        '--lineage-note', '40.4.257 makes Graph Context V7 first-use non-empty by defaulting to the curated Top 5; only the legacy sequence-0 system-seeded Vide context is migrated, while explicit operator Clear and every valid persisted selection remain authoritative'
    ], check=True)


def verify() -> None:
    root = (BASE/'app.js').read_text(encoding='utf-8')
    index = (BASE/'index.html').read_text(encoding='utf-8')
    admin_js = (BASE/'js/app.js').read_text(encoding='utf-8')
    version = json.loads((BASE/'version.json').read_text(encoding='utf-8'))
    mirror = json.loads((BASE/'administrator-version.json').read_text(encoding='utf-8'))
    build_truth = json.loads((BASE/'build.json').read_text(encoding='utf-8'))

    assert version['build'] == BUILD and version['parent_build'] == PARENT
    assert mirror['build'] == BUILD
    assert build_truth['build'] == BUILD and build_truth['engine'] == '38.15.11'
    assert version['engine']['reference_build'] == '38.15.11'
    assert version['engine']['status'] == 'protected'

    for marker in (
        'selectedCoinId: ATLAS_CURATED_TOP5_IDS[0]',
        'comparisonIds: [...ATLAS_CURATED_TOP5_IDS]',
        'comparisonPreset: "rank-5"',
        'selectionCleared: false',
        'selectionIntent: "selected"',
        'function atlasGraphContextV7IsLegacyEmptySeed404257(context)',
        'Number(context.sequence || 0) === 0',
        'market.selectionIntent === "explicit-empty"',
        'migratedLegacyEmptySeed404257 = atlasGraphContextV7IsLegacyEmptySeed404257(persisted)',
        'lastAction:"system-default-top5-404257"',
        'await atlasGraphContextV7QueuePersist(atlasGraphContextV7Read(),"system-default-top5-404257")',
        'const ATLAS_BUILD = "40.4.257";'
    ):
        must(root, marker)

    must(index, '<button class="compare-btn active" id="btnChartTop5"')
    must(index, '<script src="./app.js?v=administrator-build-40.4.257"></script>')
    must(index, '<script src="./js/app.js?v=administrator-build-40.4.257"></script>')
    must(index, '<script src="./js/views/view-lifecycle.js?v=administrator-build-40.4.257"></script>')
    must(index, '<script src="./js/views/system-presentation.js?v=administrator-build-40.4.257"></script>')
    must(index, '<script src="./js/version-truth.js?v=40.4.257"></script>')
    must(index, 'admin-visual-assets.css?v=administrator-build-40.4.255')
    must(admin_js, 'const ADMIN_BUILD = "40.4.257";')
    must(admin_js, 'const ADMIN_RELEASE = "GRAPH DEFAULT TOP 5 BOOT STATE LOCK";')

    contract = version.get('contracts', {}).get('graph_default_top5_boot_state_lock_404257')
    assert contract and contract['intentional_user_clear_preserved'] is True
    assert contract['classic_web_changed'] is False
    assert contract['technical_reading_changed'] is False
    assert contract['market_core_changed'] is False

    subprocess.run(['node','--check',str(BASE/'app.js')], check=True)
    subprocess.run(['node','--check',str(BASE/'js/app.js')], check=True)
    subprocess.run([
        'python','.github/scripts/agent_crypto_version_truth_guard.py',
        '--expected-build',BUILD,
        '--expected-release',RELEASE
    ], check=True)

    allowed = {
        'public/agent_crypto_erith_ia/administrator/administrator-version.json',
        'public/agent_crypto_erith_ia/administrator/app.js',
        'public/agent_crypto_erith_ia/administrator/build.json',
        'public/agent_crypto_erith_ia/administrator/index.html',
        'public/agent_crypto_erith_ia/administrator/js/app.js',
        'public/agent_crypto_erith_ia/administrator/version.json',
    }
    changed = set(subprocess.check_output(['git','diff','--name-only'], text=True).splitlines())
    assert changed == allowed, (sorted(changed), sorted(allowed))
    print('40.4.257 static proof: PASS')


if __name__ == '__main__':
    patch()
    verify()
