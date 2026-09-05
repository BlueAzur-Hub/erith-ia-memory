#!/usr/bin/env python3
from pathlib import Path
import json
import re
import subprocess

BASE = Path('public/agent_crypto_erith_ia/administrator')
BUILD = '40.4.256'
PARENT = '40.4.255'
RELEASE = 'ATLAS AUTO · RESIDENT WAKE OWNER CONSOLIDATION LOCK'
STATUS = 'atlas_auto_resident_wake_owner_consolidation_404256'


def must(text: str, marker: str) -> None:
    if marker not in text:
        raise RuntimeError(f'missing marker: {marker}')


def patch() -> None:
    manifest = json.loads((BASE/'version.json').read_text(encoding='utf-8'))
    assert manifest['build'] == PARENT, manifest['build']
    assert manifest['engine']['reference_build'] == '38.15.11'
    assert manifest['engine']['status'] == 'protected'

    # The root 40.4.137 pending-CURRENT mechanism already contains the proven N+1 contract.
    root = (BASE/'app.js').read_text(encoding='utf-8')
    for marker in (
        '40.4.137 — ATLAS AUTO RESIDENT WAKE RECOVERY',
        'function atlasCurrentPendingMarket137(',
        'atlasAutomation341RememberPendingMarket',
        'atlasAutomation341ReadPendingMarket',
        'atlasAutomation341ReadLastCurrentMarketId',
        'atlasLocalReportsReadiness',
        'atlasLocalReportsScheduleAutomatic',
        '__AGENT_CRYPTO_ATLAS_AUTO_WAKE_404137__',
    ):
        must(root, marker)

    # Retire only the older 40.4.133 view-lifecycle monkey-patch layer.
    life_path = BASE/'js/views/view-lifecycle.js'
    life = life_path.read_text(encoding='utf-8')
    start_marker = 'const atlasResidentWakeState40133='
    end_marker = 'atlasResidentInstall40133();'
    must(life, start_marker)
    must(life, end_marker)
    start = life.index(start_marker)
    end = life.index(end_marker, start) + len(end_marker)
    retired = '''globalThis.ErithAtlasResidentWake40133Retired404256=Object.freeze({
  build:"40.4.256",
  retired_owner:"40.4.133 view-lifecycle Atlas resident wake wrapper",
  canonical_owner:"app.js atlasCurrentPendingMarket137",
  reason:"duplicate active monkey-patch layer retired; proven 40.4.137 pending owner remains authoritative",
  market_pulse_40499r1_preserved:true,
  heartbeat_404212_preserved:true,
  duplicate_wrapper:false,
  new_timer:false,
  new_fetch:false,
  new_observer:false,
  new_storage_write:false,
  ui_disclosure_dependency:false
});'''
    life = life[:start] + retired + life[end:]
    must(life, 'MARKET_PULSE_WAKEUP_R1')
    must(life, 'return document.hidden!==true;')
    for marker in ('atlasResidentWakeState40133','atlasResidentPending40133','atlasResidentWake40133','atlasResidentWrap40133','atlasResidentInstall40133'):
        assert marker not in life, marker
    life_path.write_text(life, encoding='utf-8')

    # Keep the canonical 40.4.220 heartbeat contract byte-stable: it calls .137 first
    # and only uses the historical owner as a boot-time fallback if .137 is absent.
    hb = (BASE/'js/atlas-heartbeat-rearm.js').read_text(encoding='utf-8')
    for marker in (
        'const BUILD = "40.4.212";',
        'canonical_pending_owner:"atlasCurrentPendingMarket137"',
        'fallback_existing_owner:"atlasCurrentPendingAutoKick4051"',
        'strategy:"boot-complete-one-shot-canonical-rearm"',
        'new_timer:false', 'new_observer:false', 'new_fetch:false', 'new_websocket:false',
    ):
        must(hb, marker)

    # Cache-bust only the lifecycle layer changed by this release.
    index_path = BASE/'index.html'
    index = index_path.read_text(encoding='utf-8')
    index, n1 = re.subn(
        r'<script src="\./js/views/view-lifecycle\.js\?v=[^"]+"></script>',
        '<script src="./js/views/view-lifecycle.js?v=administrator-build-40.4.256"></script>',
        index,
        count=1,
    )
    assert n1 == 1, n1

    # Version-truth requires the System static presentation source to carry the
    # current build cache identity; this is cache identity only, not a System behavior change.
    index, n2 = re.subn(
        r'<script src="\./js/views/system-presentation\.js\?v=administrator-build-[^"]+"></script>',
        '<script src="./js/views/system-presentation.js?v=administrator-build-40.4.256"></script>',
        index,
        count=1,
    )
    assert n2 == 1, n2
    index_path.write_text(index, encoding='utf-8')

    system_path = BASE/'js/views/system-presentation.js'
    system = system_path.read_text(encoding='utf-8')
    system, n3 = re.subn(
        r'const SOURCE="\./views/system\.html\?v=administrator-build-[^"]+";',
        'const SOURCE="./views/system.html?v=administrator-build-40.4.256";',
        system,
        count=1,
    )
    assert n3 == 1, n3
    system_path.write_text(system, encoding='utf-8')

    contract = {
        'build': BUILD,
        'parent': PARENT,
        'canonical_pending_owner': 'atlasCurrentPendingMarket137',
        'canonical_pending_owner_source': 'app.js / 40.4.137',
        'legacy_view_lifecycle_40133_retired': True,
        'heartbeat_404212_preserved': True,
        'heartbeat_primary_owner': 'atlasCurrentPendingMarket137',
        'heartbeat_fallback_preserved_for_boot_missing_owner_only': True,
        'market_pulse_40499r1_preserved': True,
        'pending_survives_readiness_miss': True,
        'same_snapshot_noop_preserved': True,
        'ui_disclosure_dependency': False,
        'new_timer': False,
        'new_recurring_scheduler': False,
        'new_observer': False,
        'new_fetch_owner': False,
        'new_websocket': False,
        'new_storage_owner': False,
        'technical_reading_changed': False,
        'technical_reading_reference_build': '40.4.255',
        'market_graph_changed': False,
        'atlas_reports_semantics_changed': False,
        'nox_changed': False,
        'aerith_changed': False,
        'market_core_changed': False,
        'protected_market_core': '38.15.11'
    }
    Path('/tmp/contract-404256.json').write_text(json.dumps(contract, ensure_ascii=False, indent=2), encoding='utf-8')

    subprocess.run([
        'python', '.github/scripts/agent_crypto_release_driver.py',
        '--build', BUILD,
        '--parent', PARENT,
        '--release', RELEASE,
        '--status', STATUS,
        '--contract-key', 'atlas_auto_resident_wake_owner_consolidation_404256',
        '--contract-json', '/tmp/contract-404256.json',
        '--lineage-note', '40.4.256 retires the obsolete active 40.4.133 view-lifecycle Atlas wake monkey-patch; proven 40.4.137 pending-CURRENT remains authoritative, while the 40.4.99 R1 visible-tab market pulse and canonical boot-complete heartbeat safety contract remain intact'
    ], check=True)


def verify() -> None:
    root = (BASE/'app.js').read_text(encoding='utf-8')
    life = (BASE/'js/views/view-lifecycle.js').read_text(encoding='utf-8')
    hb = (BASE/'js/atlas-heartbeat-rearm.js').read_text(encoding='utf-8')
    index = (BASE/'index.html').read_text(encoding='utf-8')
    system = (BASE/'js/views/system-presentation.js').read_text(encoding='utf-8')
    version = json.loads((BASE/'version.json').read_text(encoding='utf-8'))

    assert version['build'] == BUILD
    assert version['parent_build'] == PARENT
    assert version['engine']['reference_build'] == '38.15.11'
    assert version['engine']['status'] == 'protected'

    for marker in (
        '40.4.137 — ATLAS AUTO RESIDENT WAKE RECOVERY',
        'function atlasCurrentPendingMarket137(',
        'atlasAutomation341RememberPendingMarket',
        'atlasAutomation341ReadPendingMarket',
        'atlasAutomation341ReadLastCurrentMarketId',
        'atlasLocalReportsReadiness',
        'const atlasAfterLivecheck404137Base = atlasAfterLivecheck;',
        'atlasAfterLivecheck = function atlasAfterLivecheck404137',
        'atlasRenderExchangeFeedStatus = function atlasRenderExchangeFeedStatus404137',
        '__AGENT_CRYPTO_ATLAS_AUTO_WAKE_404137__',
        'ui_disclosure_dependency:false',
        'new_recurring_timer:false',
    ):
        must(root, marker)

    must(life, 'ErithAtlasResidentWake40133Retired404256')
    for marker in ('atlasResidentWakeState40133','atlasResidentPending40133','atlasResidentWake40133','atlasResidentWrap40133','atlasResidentInstall40133'):
        assert marker not in life, marker
    must(life, 'MARKET_PULSE_WAKEUP_R1')
    must(life, 'return document.hidden!==true;')

    for marker in (
        'const BUILD = "40.4.212";',
        'canonical_pending_owner:"atlasCurrentPendingMarket137"',
        'fallback_existing_owner:"atlasCurrentPendingAutoKick4051"',
        'strategy:"boot-complete-one-shot-canonical-rearm"',
        'new_timer:false', 'new_observer:false', 'new_fetch:false', 'new_websocket:false',
    ):
        must(hb, marker)

    must(index, '<script src="./js/views/view-lifecycle.js?v=administrator-build-40.4.256"></script>')
    must(index, '<script src="./js/atlas-heartbeat-rearm.js?v=40.4.212"></script>')
    must(index, '<script src="./js/views/system-presentation.js?v=administrator-build-40.4.256"></script>')
    must(index, 'admin-visual-assets.css?v=administrator-build-40.4.255')
    must(system, 'const SOURCE="./views/system.html?v=administrator-build-40.4.256";')

    for path in (BASE/'app.js', BASE/'js/app.js', BASE/'js/views/view-lifecycle.js', BASE/'js/atlas-heartbeat-rearm.js', BASE/'js/views/system-presentation.js'):
        subprocess.run(['node','--check',str(path)], check=True)
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
        'public/agent_crypto_erith_ia/administrator/js/views/system-presentation.js',
        'public/agent_crypto_erith_ia/administrator/js/views/view-lifecycle.js',
        'public/agent_crypto_erith_ia/administrator/version.json',
    }
    changed = set(subprocess.check_output(['git','diff','--name-only'], text=True).splitlines())
    assert changed == allowed, (sorted(changed), sorted(allowed))
    print('40.4.256 static proof: PASS')


if __name__ == '__main__':
    patch()
    verify()
