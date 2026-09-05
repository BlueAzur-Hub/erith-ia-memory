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
  reason:"duplicate monkey-patch layer retired; proven 40.4.137 pending owner remains authoritative",
  market_pulse_40499r1_preserved:true,
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

    hb_path = BASE/'js/atlas-heartbeat-rearm.js'
    hb = hb_path.read_text(encoding='utf-8')
    must(hb, 'const BUILD = "40.4.212";')
    must(hb, 'atlasCurrentPendingMarket137')
    must(hb, 'atlasCurrentPendingAutoKick4051')
    hb = hb.replace('const BUILD = "40.4.212";', 'const BUILD = "40.4.256";', 1)
    old = '      bridge_rearm_owner_available: typeof globalThis.atlasCurrentPendingAutoKick4051 === "function"'
    new = '      legacy_bridge_rearm_owner_available: typeof globalThis.atlasCurrentPendingAutoKick4051 === "function"'
    must(hb, old); hb = hb.replace(old, new, 1)
    old = '    if (!before.pending_owner_available && !before.bridge_rearm_owner_available) return "OWNER_MISSING";'
    new = '    if (!before.pending_owner_available) return "OWNER_MISSING";'
    must(hb, old); hb = hb.replace(old, new, 1)
    old_rearm = '''      if (typeof globalThis.atlasCurrentPendingMarket137 === "function") {
        result = Boolean(globalThis.atlasCurrentPendingMarket137(`heartbeat-${String(reason || "manual")}`));
      } else if (typeof globalThis.atlasCurrentPendingAutoKick4051 === "function") {
        result = Boolean(globalThis.atlasCurrentPendingAutoKick4051(`heartbeat-${String(reason || "manual")}`));
      }'''
    new_rearm = '''      if (typeof globalThis.atlasCurrentPendingMarket137 === "function") {
        result = Boolean(globalThis.atlasCurrentPendingMarket137(`heartbeat-${String(reason || "manual")}`));
      }'''
    must(hb, old_rearm); hb = hb.replace(old_rearm, new_rearm, 1)
    must(hb, '    strategy:"boot-complete-one-shot-canonical-rearm",')
    hb = hb.replace('    strategy:"boot-complete-one-shot-canonical-rearm",', '    strategy:"boot-complete-one-shot-canonical-137-rearm",', 1)
    must(hb, '    fallback_existing_owner:"atlasCurrentPendingAutoKick4051",')
    hb = hb.replace('    fallback_existing_owner:"atlasCurrentPendingAutoKick4051",', '    fallback_existing_owner:null,', 1)
    hb_path.write_text(hb, encoding='utf-8')

    index_path = BASE/'index.html'
    index = index_path.read_text(encoding='utf-8')
    index, n1 = re.subn(r'<script src="\./js/views/view-lifecycle\.js\?v=[^"]+"></script>', '<script src="./js/views/view-lifecycle.js?v=administrator-build-40.4.256"></script>', index, count=1)
    index, n2 = re.subn(r'<script src="\./js/atlas-heartbeat-rearm\.js\?v=[^"]+"></script>', '<script src="./js/atlas-heartbeat-rearm.js?v=40.4.256"></script>', index, count=1)
    assert n1 == 1 and n2 == 1, (n1, n2)
    index_path.write_text(index, encoding='utf-8')

    contract = {
        'build': BUILD,
        'parent': PARENT,
        'canonical_pending_owner': 'atlasCurrentPendingMarket137',
        'canonical_pending_owner_source': 'app.js / 40.4.137',
        'legacy_view_lifecycle_40133_retired': True,
        'heartbeat_boot_one_shot_preserved': True,
        'heartbeat_fallback_to_4051': False,
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
        '--lineage-note', '40.4.256 retires the obsolete 40.4.133 view-lifecycle Atlas wake monkey-patch and makes the proven 40.4.137 pending-CURRENT owner the sole resident wake authority; the 40.4.99 R1 visible-tab market pulse and load-complete one-shot intent are preserved without adding a scheduler'
    ], check=True)


def verify() -> None:
    root = (BASE/'app.js').read_text(encoding='utf-8')
    life = (BASE/'js/views/view-lifecycle.js').read_text(encoding='utf-8')
    hb = (BASE/'js/atlas-heartbeat-rearm.js').read_text(encoding='utf-8')
    index = (BASE/'index.html').read_text(encoding='utf-8')
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
        'atlasCurrentPendingWrap137("atlasAfterLivecheck"',
        'atlasCurrentPendingWrap137("atlasRenderExchangeFeedStatus"',
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

    must(hb, 'const BUILD = "40.4.256";')
    must(hb, 'strategy:"boot-complete-one-shot-canonical-137-rearm"')
    must(hb, 'fallback_existing_owner:null')
    assert hb.count('atlasCurrentPendingMarket137(`heartbeat-') == 1
    assert 'atlasCurrentPendingAutoKick4051(`heartbeat-' not in hb
    for marker in ('new_timer:false','new_observer:false','new_fetch:false','new_websocket:false'):
        must(hb, marker)

    must(index, '<script src="./js/views/view-lifecycle.js?v=administrator-build-40.4.256"></script>')
    must(index, '<script src="./js/atlas-heartbeat-rearm.js?v=40.4.256"></script>')
    must(index, 'admin-visual-assets.css?v=administrator-build-40.4.255')

    for path in (BASE/'app.js', BASE/'js/app.js', BASE/'js/views/view-lifecycle.js', BASE/'js/atlas-heartbeat-rearm.js'):
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
        'public/agent_crypto_erith_ia/administrator/js/atlas-heartbeat-rearm.js',
        'public/agent_crypto_erith_ia/administrator/js/views/view-lifecycle.js',
        'public/agent_crypto_erith_ia/administrator/version.json',
    }
    changed = set(subprocess.check_output(['git','diff','--name-only'], text=True).splitlines())
    assert changed == allowed, (sorted(changed), sorted(allowed))
    print('40.4.256 static proof: PASS')


if __name__ == '__main__':
    patch()
    verify()
