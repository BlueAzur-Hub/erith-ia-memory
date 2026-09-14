from pathlib import Path
import json
import re

ROOT = Path('public/agent_crypto_erith_ia/administrator')
shell_path = ROOT / 'runtime-shell.html'
app_path = ROOT / 'app.js'
js_app_path = ROOT / 'js/app.js'
visual_cache_path = ROOT / 'js/admin-visual-cache.js'
build_path = ROOT / 'build.json'

shell = shell_path.read_text(encoding='utf-8')
app = app_path.read_text(encoding='utf-8')
js_app = js_app_path.read_text(encoding='utf-8')
visual_cache = visual_cache_path.read_text(encoding='utf-8')
build = json.loads(build_path.read_text(encoding='utf-8'))

if build.get('build') != '40.6.124' or build.get('engine') != '38.15.11':
    raise SystemExit(f"STOP build truth drift: {build.get('build')} / {build.get('engine')}")

old_build = 'const ATLAS_BUILD = "40.6.86";'
new_build = '''const ATLAS_BUILD = String(
  document.querySelector('meta[name="administrator-build"]')?.content
  || document.querySelector('meta[name="atlas-build"]')?.content
  || "UNKNOWN"
).trim();'''
if app.count(old_build) != 1:
    raise SystemExit(f'STOP expected one legacy ATLAS_BUILD owner, found {app.count(old_build)}')
app = app.replace(old_build, new_build, 1)

legacy_footer = '''  setText(
    document.getElementById("footerRelease"),
    `Agent-Crypto @erith.IA · Market Core · Build ${ATLAS_BUILD} · Version : Parker Lewis Can't Lose`
  );'''
footer_count = app.count(legacy_footer)
if footer_count < 1:
    raise SystemExit('STOP legacy root footer writer not found')
app = app.replace(legacy_footer, '  // Footer version is rendered only by js/version-truth.js from build.json.')

init_call = '\natlasVersionAwarenessInit();\n'
if app.count(init_call) != 1:
    raise SystemExit(f'STOP legacy version awareness init count={app.count(init_call)}')
app = app.replace(init_call, '\n// Legacy version-awareness runtime disabled: build.json/js/version-truth.js are authoritative.\n', 1)

legacy_js_footer = '''    const footer = byId("footerRelease");
    if (footer) footer.textContent = `Agent-Crypto @erith.IA · Administrator ${ADMIN_BUILD} · Market Core ${ENGINE_BUILD} · Web Classic · manifeste`;'''
if legacy_js_footer not in js_app:
    raise SystemExit('STOP js/app.js footer writer not found')
js_app = js_app.replace(legacy_js_footer, '    // Footer version is owned exclusively by js/version-truth.js.', 1)

# Remove the temporary 40.6.124 PREBOOT VERSION AUTHORITY IIFE from the visual-cache file.
# js/boot.js already hydrates build.json into the shell before any application script executes.
preboot_marker = '/* Agent-Crypto @erith.IA — 40.6.124 maintenance: PREBOOT VERSION AUTHORITY.'
visual_owner_marker = '(() => {\n  "use strict";\n\n  const BUILD = "40.4.254";'
if not visual_cache.startswith(preboot_marker):
    raise SystemExit('STOP visual-cache preboot authority marker missing')
visual_start = visual_cache.find(visual_owner_marker)
if visual_start < 0:
    raise SystemExit('STOP visual-cache canonical owner marker missing')
visual_cache = '/* Visual cache only. Application version authority: build.json -> js/boot.js -> js/version-truth.js. */\n' + visual_cache[visual_start:]

replacements = {
    'aria-label="Version Agent-Crypto installée : Build 40.6.86, mode Administrator"': 'aria-label="Version Agent-Crypto en initialisation"',
    '<span id="atlasVersionTruthText">Build 40.6.86</span>': '<span id="atlasVersionTruthText">Build —</span>',
    '<span id="footerRelease">Administrator 40.6.86 · Market Core 38.15.11 · Web Classic · vérification… · Version : Parker Lewis Can\'t Lose</span>': '<span id="footerRelease">Agent-Crypto @erith.IA · version en initialisation</span>',
    '  <script src="./js/footer-version-truth.js"></script>\n': '',
}
for old, new in replacements.items():
    if old not in shell:
        raise SystemExit(f'STOP runtime-shell target missing: {old[:100]}')
    shell = shell.replace(old, new, 1)

cvt = build.setdefault('current_version_truth', {})
for key in (
    'compatibility_shim', 'compatibility_shim_logic_owner',
    'immutable_entry', 'immutable_entry_mode', 'immutable_entry_path_authority',
    'canonical_build_param_fallback'
):
    cvt.pop(key, None)
cvt.update({
    'boot_owner': 'js/boot.js',
    'runtime_owner': 'js/version-truth.js',
    'runtime_owner_name': 'version-truth',
    'published_truth_source': 'build.json',
    'loaded_build_authority': 'js/boot.js hydrates runtime-shell metadata from build.json before application scripts execute',
    'footer_owner': 'js/version-truth.js',
    'legacy_runtime_version_awareness_active': False,
    'legacy_footer_version_truth_active': False,
    'legacy_preboot_version_authority_active': False,
    'current_build_hardcoded_in_runtime': False,
    'single_visible_owner': True,
    'recurring_timer': False,
    'observer': False,
    'storage_write': False,
})

shell_path.write_text(shell, encoding='utf-8')
app_path.write_text(app, encoding='utf-8')
js_app_path.write_text(js_app, encoding='utf-8')
visual_cache_path.write_text(visual_cache, encoding='utf-8')
build_path.write_text(json.dumps(build, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')

# Static proof after surgery.
shell = shell_path.read_text(encoding='utf-8')
app = app_path.read_text(encoding='utf-8')
js_app = js_app_path.read_text(encoding='utf-8')
visual_cache = visual_cache_path.read_text(encoding='utf-8')
build = json.loads(build_path.read_text(encoding='utf-8'))

assert build['build'] == '40.6.124'
assert build['engine'] == '38.15.11'
assert '40.6.86' not in shell
assert './js/footer-version-truth.js' not in shell
assert 'const ATLAS_BUILD = "40.6.86";' not in app
assert '\natlasVersionAwarenessInit();\n' not in app
assert 'Agent-Crypto @erith.IA · Market Core · Build ${ATLAS_BUILD} · Version : Parker Lewis Can\'t Lose' not in app
assert 'footerRelease' not in js_app
assert 'PREBOOT VERSION AUTHORITY' not in visual_cache
assert 'footerRelease' not in visual_cache
assert 'const CURRENT_BUILD = "40.6.124";' not in visual_cache

script_srcs = re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', shell, flags=re.I)
writers = []
for src in script_srcs:
    if src.startswith(('http://', 'https://')):
        continue
    clean = src.split('?', 1)[0].lstrip('./')
    path = ROOT / clean
    if path.is_file() and 'footerRelease' in path.read_text(encoding='utf-8', errors='ignore'):
        writers.append(src)
if writers != ['./js/version-truth.js']:
    raise SystemExit(f'STOP footer writers active={writers!r}')

cvt = build['current_version_truth']
assert cvt['published_truth_source'] == 'build.json'
assert cvt['boot_owner'] == 'js/boot.js'
assert cvt['footer_owner'] == 'js/version-truth.js'
assert cvt['legacy_runtime_version_awareness_active'] is False
assert cvt['legacy_footer_version_truth_active'] is False
assert cvt['legacy_preboot_version_authority_active'] is False
assert 'compatibility_shim' not in cvt

print('VERSIONECTOMY_STATIC_PASS', build['build'], writers)
