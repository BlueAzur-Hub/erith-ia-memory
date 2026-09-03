#!/usr/bin/env python3
from pathlib import Path
import json

ROOT = Path('public/agent_crypto_erith_ia/administrator')
INDEX = ROOT / 'index.html'
STACK = ROOT / 'js/market-stack.js'
PARALLEL = ROOT / 'js/parallel-markets.js'
DRIVER = Path('.github/scripts/agent_crypto_release_driver.py')
GUARD = Path('.github/scripts/agent_crypto_version_truth_guard.py')
BUILD_JSON = ROOT / 'build.json'
PROMPT = Path('coordination/inter_ai_dialogues/agent_crypto/PROMPT_REPRISE_AETHER_AGENT_CRYPTO.md')
LEDGER = Path('coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_FIN_DE_FIL_AETHER.md')
MANIFEST = Path('coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_RELEASE_MANIFEST.md')
RELEASE = 'VERSION DISPLAY SINGLE AUTHORITY LOCK · GLOBAL RELEASE TRUTH OWNER CONSOLIDATION'
STATUS = 'version_display_single_authority_lock_404211'


def one(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'404211_FAIL {label}: expected 1 exact match, got {count}')
    return text.replace(old, new, 1)


def main() -> int:
    stack = STACK.read_text(encoding='utf-8')
    stack = one(stack, 'const BUILD = "40.4.204";', 'const BUILD = "40.4.211";', 'market-stack module build')
    old = '''  function publishBuildTruth(){\n    const text = byId("atlasVersionControlText");\n    if(text) text.textContent = `Build ${BUILD}`;\n    document.documentElement.dataset.agentCryptoBuild = BUILD;\n    document.documentElement.dataset.marketShellContract = CONTRACT;\n  }'''
    new = '''  function publishBuildTruth(){\n    /* 40.4.211 — market-stack is a module owner, never the global release badge owner. */\n    const releaseBuild = document.querySelector('meta[name="administrator-build"]')?.content\n      || document.querySelector('meta[name="atlas-build"]')?.content\n      || "";\n    if(releaseBuild) document.documentElement.dataset.agentCryptoBuild = releaseBuild;\n    document.documentElement.dataset.marketStackBuild = BUILD;\n    document.documentElement.dataset.marketShellContract = CONTRACT;\n  }'''
    stack = one(stack, old, new, 'market-stack global badge ownership removal')
    STACK.write_text(stack, encoding='utf-8')

    parallel = PARALLEL.read_text(encoding='utf-8')
    parallel = one(parallel, 'const BUILD = "40.4.209";', 'const BUILD = "40.4.211";', 'parallel module build')
    parallel = one(parallel, '<small>Build</small><b>${BUILD}</b>', '<small>Module</small><b>${BUILD}</b>', 'parallel rail semantic label')
    PARALLEL.write_text(parallel, encoding='utf-8')

    index = INDEX.read_text(encoding='utf-8')
    index = one(index, 'Version Agent-Crypto installée : Build 40.4.168, mode Administrator', 'Version Agent-Crypto installée : Build 40.4.211, mode Administrator', 'static badge aria')
    index = one(index, '<span id="atlasVersionControlText">Build 40.4.168</span>', '<span id="atlasVersionControlText">Build 40.4.211</span>', 'static badge text')
    index = one(index, './js/market-stack.js?v=40.4.204', './js/market-stack.js?v=40.4.211', 'market-stack cache token')
    index = one(index, './js/parallel-markets.js?v=40.4.210', './js/parallel-markets.js?v=40.4.211', 'parallel cache token')
    index = one(index, './js/version-truth.js?v=40.4.198', './js/version-truth.js?v=40.4.211', 'version-truth cache token')
    INDEX.write_text(index, encoding='utf-8')

    driver = DRIVER.read_text(encoding='utf-8')
    anchor = '''    index = sub_one(index, r'<title>Agent-Crypto @erith\\.IA — Build [^ ]+ · Administrator</title>', f'<title>Agent-Crypto @erith.IA — Build {build} · Administrator</title>', "index title")\n'''
    addition = anchor + '''    index = sub_one(index, r'(<button\\s+[^>]*id="atlasVersionControl"[\\s\\S]*?aria-label="Version Agent-Crypto installée : Build )[^,\"]+(, mode Administrator")', rf'\\g<1>{build}\\g<2>', "first-paint version aria")\n    index = sub_one(index, r'(<span\\s+id="atlasVersionControlText">Build )[^<]+(</span>)', rf'\\g<1>{build}\\g<2>', "first-paint version badge")\n    index = sub_one(index, r'<script\\s+src="\\./js/version-truth\\.js\\?v=[^"]+"></script>', f'<script src="./js/version-truth.js?v={build}"></script>', "version truth cache token")\n'''
    driver = one(driver, anchor, addition, 'release driver first-paint authority')
    DRIVER.write_text(driver, encoding='utf-8')

    guard = GUARD.read_text(encoding='utf-8')
    guard = one(guard, '    admin_js = read(base / "js/app.js")\n', '    admin_js = read(base / "js/app.js")\n    market_stack = read(base / "js/market-stack.js")\n', 'guard market-stack read')
    marker = '''        "footer_build": one(r"id=\\\"footerRelease\\\"[^>]*>[^<]*Market Core · Build ([^ ]+) · Version : Parker Lewis Can't Lose</span>", index, "footer build"),\n'''
    add = marker + '''        "first_paint_badge_build": one(r'<span\\s+id="atlasVersionControlText">Build ([^<]+)</span>', index, "first-paint badge build"),\n        "first_paint_aria_build": one(r'id="atlasVersionControl"[\\s\\S]*?aria-label="Version Agent-Crypto installée : Build ([^,\"]+), mode Administrator"', index, "first-paint aria build"),\n        "version_truth_cache_build": one(r'<script\\s+src="\\./js/version-truth\\.js\\?v=([^"]+)"></script>', index, "version truth cache build"),\n'''
    guard = one(guard, marker, add, 'guard actual first paint fields')
    list_anchor = '''        "footer_build",\n    ):\n'''
    list_add = '''        "footer_build",\n        "first_paint_badge_build",\n        "first_paint_aria_build",\n        "version_truth_cache_build",\n    ):\n'''
    guard = one(guard, list_anchor, list_add, 'guard build authority list')
    after = '''    if actual["meta_asset_token"] != expected_token:\n        fail("HTML asset token drift")\n'''
    after_add = after + '''    if "atlasVersionControlText" in market_stack:\n        fail("market-stack illegally owns the global version badge")\n'''
    guard = one(guard, after, after_add, 'guard market-stack badge ownership')
    GUARD.write_text(guard, encoding='utf-8')

    build = json.loads(BUILD_JSON.read_text(encoding='utf-8'))
    if build.get('build') != '40.4.210' or build.get('engine') != '38.15.11':
        raise SystemExit(f"404211_FAIL unexpected build truth: {build.get('build')} / {build.get('engine')}")
    build.update(build='40.4.211', release=RELEASE, status=STATUS, published=True)
    BUILD_JSON.write_text(json.dumps(build, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    prompt = PROMPT.read_text(encoding='utf-8')
    prompt = one(prompt, 'Version de reprise : **40.4.210**', 'Version de reprise : **40.4.211**', 'prompt build')
    anchor_prompt = '40.4.210 est un verrou de **Cache Truth** : les quatre payloads marché effectivement modifiés par 40.4.205→40.4.209 (`parallel-markets.css`, `market-reading-depth.css`, `js/parallel-markets.js`, `js/market-reading-depth.js`) sont désormais appelés par des URL versionnées 40.4.210. Leur contenu fonctionnel reste inchangé ; `market-stack.js` et `version-truth.js` ne sont pas artificiellement republiés.'
    addition_prompt = anchor_prompt + '\n\n40.4.211 verrouille l’**autorité unique d’affichage de version** : `market-stack.js` ne peut plus écrire `#atlasVersionControlText`; le badge first-paint est synchronisé par le release driver, `version-truth.js` reste l’autorité runtime globale, et les versions de module sont explicitement séparées de la release Agent-Crypto.'
    prompt = one(prompt, anchor_prompt, addition_prompt, 'prompt 211 note')
    PROMPT.write_text(prompt, encoding='utf-8')

    ledger = LEDGER.read_text(encoding='utf-8')
    ledger = one(ledger, 'Version canonique de clôture : **40.4.210**', 'Version canonique de clôture : **40.4.211**', 'ledger build')
    ledger = one(ledger, '## 1. Cascade finale 40.4.205 → 40.4.210', '## 1. Cascade finale 40.4.205 → 40.4.211', 'ledger heading')
    bullet = '- **40.4.210** — Cache Truth lock : convergence explicite des URL versionnées des quatre payloads marché modifiés par la cascade 40.4.205→40.4.209 ; aucun changement de moteur, de données, de géométrie ou de contenu fonctionnel de ces payloads.'
    bullet2 = bullet + '\n- **40.4.211** — Version Display Single Authority lock : suppression de l’écriture globale de version par `market-stack.js`, first-paint synchronisé, `version-truth.js` autorité runtime, cache tokens des propriétaires modifiés convergents, et libellé `Module` pour la version locale des marchés parallèles.'
    ledger = one(ledger, bullet, bullet2, 'ledger 211 bullet')
    LEDGER.write_text(ledger, encoding='utf-8')

    manifest = MANIFEST.read_text(encoding='utf-8')
    manifest = one(manifest, 'Release courante : **40.4.210**', 'Release courante : **40.4.211**', 'manifest build')
    manifest = one(manifest, 'commit final 40.4.210', 'commit final 40.4.211', 'manifest archive build')
    manifest += '\n40.4.211 est une release de **Version Display Single Authority** : une seule vérité globale de release est affichée ; les versions locales de modules ne peuvent plus réécrire le badge global.\n'
    MANIFEST.write_text(manifest, encoding='utf-8')

    contract = {
        'kind': 'version_display_single_authority_lock',
        'build': '40.4.211',
        'parent_build': '40.4.210',
        'market_core': '38.15.11',
        'global_badge_owner': 'version-truth.js + release metadata',
        'first_paint_badge_synced_by_release_driver': True,
        'market_stack_global_badge_write': False,
        'market_stack_module_build': '40.4.211',
        'parallel_markets_module_build': '40.4.211',
        'parallel_rail_version_label': 'Module',
        'new_fetch': False,
        'new_timer': False,
        'new_mutation_observer': False,
        'new_websocket': False,
        'new_request_animation_frame': False,
        'data_change': False,
        'geometry_change': False,
        'market_core_change': False,
    }
    Path('/tmp/agent_crypto_404211_contract.json').write_text(json.dumps(contract, ensure_ascii=False, indent=2), encoding='utf-8')
    print('404211_SURGERY_PASS')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
