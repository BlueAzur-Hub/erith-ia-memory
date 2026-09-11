from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import re
import zipfile

root = Path("public/agent_crypto_erith_ia/administrator")
index = root / "index.html"
admin_app = root / "js/app.js"
version_truth = root / "js/version-truth.js"
manifest = root / "build.json"
release_note = root / "RELEASE_40_6_85.md"

BUILD = "40.6.85"
PARENT = "40.6.84"
ENGINE = "38.15.11"
RELEASE = "AETHER V2 · LEFT BOOT + VERSION ACTION LOCK"
STATUS = "aether_v2_left_boot_version_action_lock_406085"

protected_paths = [
    root / "app.js",
    root / "js/core/admin-window-manager.js",
    root / "js/aether.js",
    root / "assets/aether/aether-observatory-master-v2-406074.png",
    root / "aether-v2-406075.css",
    root / "admin-chronos.css",
]
protected = {str(p): hashlib.sha256(p.read_bytes()).hexdigest() for p in protected_paths}

data = json.loads(manifest.read_text(encoding="utf-8"))
assert data.get("build") == PARENT, data.get("build")
assert data.get("engine") == ENGINE, data.get("engine")

# -----------------------------------------------------------------------------
# index.html — build truth + cache token only. No visual/layout surgery.
# -----------------------------------------------------------------------------
html = index.read_text(encoding="utf-8")
assert '<meta name="administrator-build" content="40.6.84"' in html
assert '<meta name="atlas-engine-build" content="38.15.11"' in html
assert './js/version-truth.js?v=40.6.8' in html

pairs = {
    "atlas-build": BUILD,
    "administrator-build": BUILD,
    "administrator-revision": "V20",
    "administrator-release": RELEASE,
    "atlas-asset-token": f"market-core-v2.0-alpha-build-{BUILD}",
}
for name, value in pairs.items():
    html, count = re.subn(
        rf'(<meta name="{re.escape(name)}" content=")[^"]*("\s*/>)',
        rf'\g<1>{value}\2',
        html,
        count=1,
    )
    assert count == 1, f"meta {name} count={count}"

html, count = re.subn(
    r'<title>Agent-Crypto @erith\.IA — Build [^<]+ · Administrator</title>',
    f'<title>Agent-Crypto @erith.IA — Build {BUILD} · Administrator</title>',
    html,
    count=1,
)
assert count == 1
html = html.replace("administrator-build-40.6.84", f"administrator-build-{BUILD}")
html = html.replace('./js/version-truth.js?v=40.6.8', f'./js/version-truth.js?v={BUILD}')
index.write_text(html, encoding="utf-8")

# -----------------------------------------------------------------------------
# js/app.js — Aether position owner correction.
# 1. Default is LEFT x=12, not centered.
# 2. One-time migration only for a persisted geometry that is actually centered
#    in the current viewport. Operator geometry that is not centered is preserved.
# -----------------------------------------------------------------------------
js = admin_app.read_text(encoding="utf-8")
anchor = 'id: "aether-watch"'
pos = js.find(anchor)
assert pos >= 0
pref = js.find("preferredFloatGeometry: () => {", pos)
assert pref >= 0
end = js.find("\n        resolveEntries:", pref)
assert end > pref
block = js[pref:end]
old_x = 'x: Math.max(12, Math.round((vw - fittedWidth) / 2)),'
assert old_x in block, "40.6.84 centered Aether default not found"
block = block.replace(old_x, 'x: 12,', 1)
js = js[:pref] + block + js[end:]

migration_code = r'''

  // 40.6.85 — Aether left-boot repair.
  // Scope is exactly one persisted Aether presentation record, one time.
  // A non-centered operator position is never rewritten.
  const AETHER_LEFT_406085_MIGRATION_KEY = `${STORAGE_PREFIX}:migration:aether-left-406085`;
  function migrateAetherCenteredState406085() {
    try {
      if (localStorage.getItem(AETHER_LEFT_406085_MIGRATION_KEY) === "1") return "already";
      const key = `${STORAGE_PREFIX}:window:aether-watch`;
      const raw = JSON.parse(localStorage.getItem(key) || "null");
      if (!raw || typeof raw !== "object") {
        localStorage.setItem(AETHER_LEFT_406085_MIGRATION_KEY, "1");
        return "no-state";
      }
      const x = Number(raw.x), y = Number(raw.y), width = Number(raw.width), height = Number(raw.height);
      if (![x, y, width, height].every(Number.isFinite)) {
        localStorage.setItem(AETHER_LEFT_406085_MIGRATION_KEY, "1");
        return "invalid-state-preserved";
      }
      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const centeredX = Math.max(12, Math.round((vw - width) / 2));
      const centered = x > 26 && Math.abs(x - centeredX) <= 14;
      if (centered && raw.maximized !== true) {
        localStorage.setItem(key, JSON.stringify({ ...raw, x: 12 }));
        localStorage.setItem(AETHER_LEFT_406085_MIGRATION_KEY, "1");
        document.documentElement.dataset.aetherLeftMigration406085 = "migrated";
        return "migrated";
      }
      localStorage.setItem(AETHER_LEFT_406085_MIGRATION_KEY, "1");
      document.documentElement.dataset.aetherLeftMigration406085 = "preserved";
      return "preserved";
    } catch (_) {
      document.documentElement.dataset.aetherLeftMigration406085 = "storage-unavailable";
      return "storage-unavailable";
    }
  }
'''
boot_marker = "\n  function boot() {"
assert boot_marker in js
assert "migrateAetherCenteredState406085" not in js
js = js.replace(boot_marker, migration_code + boot_marker, 1)
call_anchor = "    stageAdministratorDefaultFamilyCollapse40361();\n"
assert call_anchor in js
js = js.replace(call_anchor, call_anchor + "    migrateAetherCenteredState406085();\n", 1)
admin_app.write_text(js, encoding="utf-8")

# -----------------------------------------------------------------------------
# js/version-truth.js — remove silent no-op on update click.
# A newer manifest now navigates immediately to a cache-busted document URL.
# If publication is still propagating, the reloaded page remains on the old build
# and the normal startup check keeps showing the newer build as available.
# -----------------------------------------------------------------------------
vt = version_truth.read_text(encoding="utf-8")
assert 'const OWNER="version-truth-40608";' in vt
assert "async function publishedIndexMatches(build)" in vt
assert "if(!(await publishedIndexMatches(published))){render(result);return false;}" in vt
vt = vt.replace('const OWNER="version-truth-40608";', 'const OWNER="version-truth-406085";', 1)

preflight_re = re.compile(
    r'\n  async function publishedIndexMatches\(build\)\{.*?\n  \}\n  async function applyAvailableUpdate\(\)\{',
    re.S,
)
vt, count = preflight_re.subn('\n  async function applyAvailableUpdate(){', vt, count=1)
assert count == 1, f"publishedIndexMatches removal count={count}"
vt = vt.replace(
    '      if(!(await publishedIndexMatches(published))){render(result);return false;}\n',
    '',
    1,
)
vt = vt.replace(
    '    current_click_reloads:false,update_available_click_reloads:true,\n    recurring_timer:false,observer:false',
    '    current_click_reloads:false,update_available_click_reloads:true,\n    update_available_click_requires_index_preflight:false,\n    update_available_click_navigation:"cache-busted-location-replace",\n    recurring_timer:false,observer:false',
    1,
)
assert "publishedIndexMatches" not in vt
assert "location.replace(url.toString())" in vt
version_truth.write_text(vt, encoding="utf-8")

# -----------------------------------------------------------------------------
# build.json — current truth and bounded debt record.
# -----------------------------------------------------------------------------
data.update({
    "build": BUILD,
    "engine": ENGINE,
    "release": RELEASE,
    "published": True,
    "status": STATUS,
    "parent_build": PARENT,
    "asset_token": f"market-core-v2.0-alpha-build-{BUILD}",
    "administrator_build": BUILD,
    "build_label": f"Build {BUILD} · Administrator",
    "release_status": STATUS,
    "timestamp": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
})
if isinstance(data.get("current_version_truth"), dict):
    data["current_version_truth"].update({
        "loaded_build": BUILD,
        "manual_update_click_requires_published_index_match": False,
        "manual_update_click_navigation": "cache-busted-location-replace",
        "silent_noop_on_index_preflight_mismatch": False,
    })

data["cascade_40_6_85"] = {
    "parent_build": PARENT,
    "release": RELEASE,
    "status": STATUS,
    "scope": "aether_left_boot_and_version_update_action_only",
    "aether_default_x": 12,
    "aether_centered_state_one_time_migration": True,
    "aether_non_centered_operator_geometry_preserved": True,
    "version_truth_owner": "js/version-truth.js",
    "version_update_silent_preflight_noop_removed": True,
    "version_update_navigation": "cache-busted-location-replace",
    "market_core_modified": False,
    "market_core": ENGINE,
    "window_manager_modified": False,
    "aether_visual_modified": False,
    "aether_backplate_modified": False,
    "technical_reading_modified": False,
    "web_classic_business_runtime_modified": False,
    "new_recurring_timer": False,
    "new_observer": False,
    "new_network_owner": False,
    "new_storage_owner": False,
}
manifest.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

release_note.write_text(
    f"# Administrator {BUILD} — Aether left boot + version action lock\n\n"
    f"Parent: {PARENT}  \nMarket Core: {ENGINE} — unchanged.\n\n"
    "## Deux défauts corrigés\n\n"
    "1. **Aether au centre au chargement** : la 40.6.84 avait laissé une géométrie par défaut centrée. La géométrie initiale canonique revient à `x = 12`. Une migration 40.6.85 unique déplace uniquement un état Aether sauvegardé qui correspond encore à une position centrée ; une position opérateur non centrée est préservée.\n"
    "2. **Bouton de mise à jour sans action visible** : le contrôleur pouvait détecter une Build plus récente puis refuser silencieusement la navigation si son second contrôle `index.html` n'était pas encore aligné. Ce précontrôle bloquant est supprimé. Quand une Build plus récente est disponible, le clic lance directement `location.replace()` avec un paramètre anti-cache.\n\n"
    "## Protections\n\n"
    f"- Market Core {ENGINE} inchangé.\n"
    "- Window Manager canonique inchangé.\n"
    "- Aether master/backplate inchangé.\n"
    "- Lecture Technique inchangée.\n"
    "- Web Classique / moteur métier inchangé.\n"
    "- Aucun nouveau timer, observer ou propriétaire réseau.\n\n"
    "## Test Firefox attendu\n\n"
    "1. Charger Administrator 40.6.85.\n"
    "2. Aether doit apparaître à gauche (`x ≈ 12`) si l'ancien état sauvegardé était centré.\n"
    "3. Déplacer Aether ailleurs, F5 : la position opérateur non centrée doit revenir.\n"
    "4. Lorsqu'une Build plus récente est affichée comme disponible, un clic sur le badge doit provoquer immédiatement une navigation/relecture du document, jamais un silence.\n",
    encoding="utf-8",
)

# -----------------------------------------------------------------------------
# Acceptance checks.
# -----------------------------------------------------------------------------
html2 = index.read_text(encoding="utf-8")
js2 = admin_app.read_text(encoding="utf-8")
vt2 = version_truth.read_text(encoding="utf-8")
data2 = json.loads(manifest.read_text(encoding="utf-8"))

assert f'administrator-build" content="{BUILD}' in html2
assert f'atlas-build" content="{BUILD}' in html2
assert 'atlas-engine-build" content="38.15.11' in html2
assert f'./js/version-truth.js?v={BUILD}' in html2
assert "administrator-build-40.6.84" not in html2

ap = js2.find(anchor)
pp = js2.find("preferredFloatGeometry: () => {", ap)
ee = js2.find("\n        resolveEntries:", pp)
aether_block = js2[pp:ee]
assert "x: 12," in aether_block
assert "Math.round((vw - fittedWidth) / 2)" not in aether_block
assert "localStorage" not in aether_block
assert js2.count("migrateAetherCenteredState406085();") == 1
assert "AETHER_LEFT_406085_MIGRATION_KEY" in js2

assert 'const OWNER="version-truth-406085";' in vt2
assert "publishedIndexMatches" not in vt2
assert 'update_available_click_requires_index_preflight:false' in vt2
assert "location.replace(url.toString())" in vt2

assert data2["build"] == BUILD and data2["engine"] == ENGINE
assert data2["cascade_40_6_85"]["window_manager_modified"] is False
assert data2["cascade_40_6_85"]["technical_reading_modified"] is False

for path, digest in protected.items():
    now = hashlib.sha256(Path(path).read_bytes()).hexdigest()
    assert now == digest, f"protected file changed: {path}"

assert "./assets/aether/aether-observatory-master-v2-406074.png" in html2
assert "admin-tech-portrait-r3" in html2

# Clean upload package.
dist = Path("dist")
dist.mkdir(exist_ok=True)
out = dist / "AGENT_CRYPTO_BUILD_40_6_85_AETHER_LEFT_BOOT_VERSION_ACTION_LOCK_CLEAN_UPLOAD.zip"
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for path in sorted(root.rglob("*")):
        if path.is_file():
            archive.write(path, path.relative_to(root.parent))
digest = hashlib.sha256(out.read_bytes()).hexdigest()
(out.with_suffix(out.suffix + ".sha256")).write_text(f"{digest}  {out.name}\n", encoding="utf-8")

print("40.6.85 surgical acceptance: OK")
print(out)
print(digest)
