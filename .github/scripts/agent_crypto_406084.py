from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import re
import zipfile

root = Path("public/agent_crypto_erith_ia/administrator")
index = root / "index.html"
admin_app = root / "js/app.js"
manifest = root / "build.json"
release_note = root / "RELEASE_40_6_84.md"

BUILD = "40.6.84"
PARENT = "40.6.83"
ENGINE = "38.15.11"
RELEASE = "AETHER V2 · PERSISTED GEOMETRY OWNERSHIP LOCK"
STATUS = "aether_v2_persisted_geometry_ownership_lock_406084"

protected_paths = [
    root / "app.js",
    root / "js/core/admin-window-manager.js",
    root / "js/aether.js",
    root / "assets/aether/aether-observatory-master-v2-406074.png",
    root / "aether-v2-406075.css",
]
protected = {str(p): hashlib.sha256(p.read_bytes()).hexdigest() for p in protected_paths}

data = json.loads(manifest.read_text(encoding="utf-8"))
assert data.get("build") == PARENT, data.get("build")
assert data.get("engine") == ENGINE, data.get("engine")

html = index.read_text(encoding="utf-8")
assert '<meta name="administrator-build" content="40.6.83"' in html
assert '<meta name="atlas-engine-build" content="38.15.11"' in html
assert html.count('id="aetherLegacyCenterPreboot406083"') == 1

# Remove the 40.6.83 preboot storage mutation. No replacement migration.
preboot_re = re.compile(
    r'\n\s*<!-- 40\.6\.83 — one-time stale Aether center migration before Window Manager init\. -->\s*'
    r'<script id="aetherLegacyCenterPreboot406083">.*?</script>\s*',
    re.S,
)
html, count = preboot_re.subn("\n", html, count=1)
assert count == 1, f"preboot removal count={count}"
assert "aetherLegacyCenterPreboot406083" not in html
assert "migration:aether-watch-left-406083" not in html

pairs = {
    "atlas-build": BUILD,
    "administrator-build": BUILD,
    "administrator-revision": "V19",
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
assert count == 1, "title replacement failed"
html = html.replace("administrator-build-40.6.83", f"administrator-build-{BUILD}")
index.write_text(html, encoding="utf-8")

# Aether default geometry becomes DEFAULT ONLY. Persistence belongs to Window Manager.
js = admin_app.read_text(encoding="utf-8")
anchor = 'id: "aether-watch"'
pos = js.find(anchor)
assert pos >= 0, "aether-watch definition missing"
pref = js.find("preferredFloatGeometry: () => {", pos)
assert pref >= 0, "aether preferredFloatGeometry missing"
next_marker = js.find("\n        resolveEntries:", pref)
assert next_marker > pref, "aether preferred geometry block boundary missing"
old_block = js[pref:next_marker]
assert 'localStorage.getItem(`${STORAGE_PREFIX}:window:aether-watch`)' in old_block
assert "legacyAutoCenter" in old_block

new_block = "\n".join([
    "preferredFloatGeometry: () => {",
    "          const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);",
    "          const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);",
    "          const width = Math.max(720, Math.min(1450, vw - 32, (vh * 1.7777777778) - 352));",
    "          const height = Math.max(405, Math.min(vh - 24, width * 9 / 16));",
    "          const fittedWidth = Math.min(width, height * 16 / 9);",
    "          const fittedHeight = fittedWidth * 9 / 16;",
    "          return {",
    "            x: Math.max(12, Math.round((vw - fittedWidth) / 2)),",
    "            y: Math.max(12, Math.round((vh * .5 + 99) - fittedHeight / 2)),",
    "            width: Math.round(fittedWidth),",
    "            height: Math.round(fittedHeight)",
    "          };",
    "        },",
])
js = js[:pref] + new_block + js[next_marker:]
admin_app.write_text(js, encoding="utf-8")

# Publish build truth.
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
    data["current_version_truth"]["loaded_build"] = BUILD

data["cascade_40_6_84"] = {
    "parent_build": PARENT,
    "release": RELEASE,
    "status": STATUS,
    "scope": "aether_window_geometry_ownership_only",
    "preboot_geometry_migration_removed": True,
    "preferred_geometry_storage_read_removed": True,
    "saved_operator_geometry_authority": "ErithAdministratorWindows",
    "default_geometry_only_when_no_saved_geometry": True,
    "boot_open_focus_recenter_of_saved_geometry": False,
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
    f"# Administrator {BUILD} — Aether V2 persisted geometry ownership lock\n\n"
    f"Parent: {PARENT}  \nMarket Core: {ENGINE} — unchanged.\n\n"
    "## Correction\n\n"
    "- Supprime la migration préboot 40.6.83 qui pouvait réécrire la géométrie Aether sauvegardée avant l'initialisation du Window Manager.\n"
    "- `aether-watch.preferredFloatGeometry()` ne lit plus le stockage et ne fournit qu'une géométrie initiale lorsqu'aucune géométrie opérateur valide n'existe.\n"
    "- Une géométrie opérateur valide (`x`, `y`, `width`, `height`) reste la vérité et est restaurée exclusivement par `ErithAdministratorWindows`.\n"
    "- Aucun recentrage ni forçage à gauche n'est appliqué au boot, à l'ouverture, au focus ou après F5 quand une géométrie sauvegardée existe.\n\n"
    "## Protections\n\n"
    f"- Market Core {ENGINE} inchangé.\n"
    "- Window Manager canonique inchangé.\n"
    "- Visuel Aether / backplate inchangé.\n"
    "- Lecture Technique inchangée.\n"
    "- Web Classique / moteur métier inchangé.\n"
    "- Aucun nouveau timer, observer, fetch, propriétaire de stockage ou migration.\n\n"
    "## Test opérateur attendu\n\n"
    "1. Ouvrir Aether.\n"
    "2. Déplacer la fenêtre à une position volontairement non centrée.\n"
    "3. Recharger avec F5.\n"
    "4. Vérifier que `x`, `y`, largeur et hauteur reviennent à la géométrie sauvegardée.\n"
    "5. Fermer/réouvrir Aether et vérifier qu'aucun recentrage n'intervient.\n",
    encoding="utf-8",
)

# Surgical acceptance checks.
html2 = index.read_text(encoding="utf-8")
js2 = admin_app.read_text(encoding="utf-8")
data2 = json.loads(manifest.read_text(encoding="utf-8"))
assert f'administrator-build" content="{BUILD}' in html2
assert f'atlas-build" content="{BUILD}' in html2
assert 'atlas-engine-build" content="38.15.11' in html2
assert "aetherLegacyCenterPreboot406083" not in html2
assert "migration:aether-watch-left-406083" not in html2

aether_pos = js2.find(anchor)
aether_pref = js2.find("preferredFloatGeometry: () => {", aether_pos)
aether_end = js2.find("\n        resolveEntries:", aether_pref)
block = js2[aether_pref:aether_end]
assert "legacyAutoCenter" not in block
assert "localStorage" not in block
assert "STORAGE_PREFIX" not in block
assert "x: Math.max(12, Math.round((vw - fittedWidth) / 2))" in block
assert data2["build"] == BUILD and data2["engine"] == ENGINE

for path, digest in protected.items():
    now = hashlib.sha256(Path(path).read_bytes()).hexdigest()
    assert now == digest, f"protected file changed: {path}"

assert "./assets/aether/aether-observatory-master-v2-406074.png" in html2
assert "admin-tech-portrait-r3" in html2

# Clean upload artifact is produced in Actions but not committed to main.
dist = Path("dist")
dist.mkdir(exist_ok=True)
out = dist / "AGENT_CRYPTO_BUILD_40_6_84_AETHER_PERSISTED_GEOMETRY_LOCK_CLEAN_UPLOAD.zip"
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for path in sorted(root.rglob("*")):
        if path.is_file():
            archive.write(path, path.relative_to(root.parent))
digest = hashlib.sha256(out.read_bytes()).hexdigest()
(out.with_suffix(out.suffix + ".sha256")).write_text(f"{digest}  {out.name}\n", encoding="utf-8")

print("40.6.84 surgical acceptance: OK")
print(out)
print(digest)
