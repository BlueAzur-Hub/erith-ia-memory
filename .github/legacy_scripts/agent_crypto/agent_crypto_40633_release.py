from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import re
import shutil
import subprocess
import zipfile

ROOT = Path("public/agent_crypto_erith_ia/administrator")
CSS = ROOT / "admin-ribbons.css"
INDEX = ROOT / "index.html"
BUILD = ROOT / "build.json"
VERSION = ROOT / "version.json"
ADMIN_VERSION = ROOT / "administrator-version.json"
AETHER_JS = ROOT / "js/aether.js"
ASSET = ROOT / "assets/aether/aether-observatory-background-406032.webp"
RELEASE_MD = ROOT / "RELEASE_40_6_33.md"
ZIP = Path("coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_BUILD_40_6_33_AETHER_EXACT_STAGE_RESPONSIVE_ALIGNMENT_CLEAN_UPLOAD_7_FILES.zip")
SHA = Path(str(ZIP) + ".sha256")

PARENT = "40.6.32"
BUILD_NO = "40.6.33"
ENGINE = "38.15.11"
ASSET_SHA = "5c4d61e9410d4a701372e2d30640d6523938dfe603f65902d493b354c5f2e7b2"
RELEASE = "AETHER OBSERVATORY · EXACT ARTWORK STAGE · RESPONSIVE ALIGNMENT LOCK"
STATUS = "aether_observatory_exact_artwork_stage_responsive_alignment_lock_406033"
MARKER = "/* 40.6.33 — AETHER EXACT ARTWORK STAGE · RESPONSIVE ALIGNMENT LOCK */"


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for block in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(message)


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    require(count == 1, f"{label}: expected exactly one parent token, found {count}: {old}")
    return text.replace(old, new, 1)


require(ROOT.is_dir(), "Administrator root missing")
require(ASSET.is_file(), "Exact Aether artwork missing")
require(sha256(ASSET) == ASSET_SHA, "Exact Aether artwork SHA mismatch")
require(AETHER_JS.is_file(), "Aether runtime missing")
aether_before = sha256(AETHER_JS)

build = json.loads(BUILD.read_text(encoding="utf-8"))
require(build.get("build") == PARENT, f"Parent build must be {PARENT}, got {build.get('build')}")
require(build.get("engine") == ENGINE, "Market Core drift detected")
require(MARKER not in CSS.read_text(encoding="utf-8"), "40.6.33 CSS already present")

css_block = r'''

/* 40.6.33 — AETHER EXACT ARTWORK STAGE · RESPONSIVE ALIGNMENT LOCK
   Presentation-only. The selected 16:9 artwork is the coordinate stage; live DOM cards stay the data owner.
   Desktop no longer falls into the historical short-height stacked-card fallback. */
@media (min-width:901px){
  #atlasAetherStatusPanel4084{
    inset:10px!important;top:10px!important;left:10px!important;right:10px!important;bottom:10px!important;
    width:auto!important;height:auto!important;max-height:none!important;overflow:hidden!important;
    z-index:2147483000!important;background:#010610!important;border:1px solid rgba(66,206,255,.34)!important;
    border-radius:18px!important;box-shadow:0 28px 90px rgba(0,0,0,.68)!important;isolation:isolate!important;
  }
  #atlasAetherStatusPanel4084::before{
    content:""!important;display:block!important;position:absolute!important;inset:-28px!important;z-index:-4!important;
    background:url('./assets/aether/aether-observatory-background-406032.webp') center 56%/cover no-repeat!important;
    opacity:.62!important;filter:blur(15px) brightness(.30) saturate(.88)!important;transform:scale(1.045)!important;
  }
  #atlasAetherStatusPanel4084::after{
    content:""!important;display:block!important;position:absolute!important;inset:0!important;z-index:-3!important;pointer-events:none!important;
    background:radial-gradient(circle at 50% 52%,rgba(2,10,22,.05) 0 42%,rgba(1,7,16,.24) 74%,rgba(1,7,16,.48) 100%),linear-gradient(180deg,rgba(1,7,16,.08),rgba(1,7,16,.28))!important;
  }
  #atlasAetherStatusPanel4084 .atlas-aether-panel-head-4084{position:absolute!important;inset:0!important;z-index:60!important;pointer-events:none!important}
  #atlasAetherStatusPanel4084 .atlas-aether-panel-head-4084 b{display:none!important}
  #atlasAetherStatusPanel4084 [data-aether-close-4084]{
    pointer-events:auto!important;position:absolute!important;right:14px!important;top:14px!important;z-index:70!important;
    width:34px!important;height:34px!important;border-radius:50%!important;background:rgba(2,12,25,.88)!important;
    border:1px solid rgba(92,216,255,.48)!important;color:#bdeeff!important;box-shadow:0 6px 20px rgba(0,0,0,.34)!important;
  }

  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030{
    position:absolute!important;left:50%!important;top:50.5%!important;inset:auto!important;
    height:calc(100% - 18px)!important;width:auto!important;max-width:calc(100% - 18px)!important;aspect-ratio:16/9!important;
    transform:translate(-50%,-50%)!important;display:block!important;margin:0!important;padding:0!important;gap:0!important;
    overflow:hidden!important;border-radius:15px!important;isolation:isolate!important;
    background:linear-gradient(180deg,rgba(2,10,23,.10),rgba(2,10,23,.18)),url('./assets/aether/aether-observatory-background-406032.webp') center/100% 100% no-repeat!important;
    box-shadow:0 0 0 1px rgba(82,210,255,.14),0 24px 60px rgba(0,0,0,.30)!important;
  }
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030::after{
    content:"";position:absolute;right:1.0%;top:1.2%;width:18.8%;height:12.9%;z-index:1;pointer-events:none;
    border-radius:16px;background:linear-gradient(145deg,rgba(3,18,35,.96),rgba(2,11,25,.93));box-shadow:inset 0 0 24px rgba(32,155,230,.04);
  }

  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article,
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article,
  #atlasAetherStatusPanel4084 [data-aether-focus-view-406030="glance"] > article{
    position:absolute!important;box-sizing:border-box!important;margin:0!important;transform:none!important;min-height:0!important;
    overflow:hidden!important;z-index:5!important;border:1px solid rgba(70,214,255,.48)!important;border-radius:18px!important;
    background:linear-gradient(90deg,rgba(2,12,28,.50) 0 23%,rgba(2,12,28,.93) 31%,rgba(2,12,28,.90) 100%)!important;
    box-shadow:0 10px 26px rgba(0,0,0,.32),inset 0 0 24px rgba(28,150,225,.05)!important;
    backdrop-filter:blur(2px) saturate(1.03)!important;-webkit-backdrop-filter:blur(2px) saturate(1.03)!important;
    padding:10px 12px 9px 27%!important;
  }
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 article > span,
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article > span{
    display:block!important;margin:0 0 5px!important;font-size:11px!important;line-height:1.14!important;letter-spacing:.075em!important;
    color:#69e6ff!important;text-transform:uppercase!important;font-weight:850!important;
  }
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 article > b,
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article > b{
    font-size:13.2px!important;line-height:1.25!important;color:#f3f8ff!important;font-weight:800!important;
  }
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030]{display:contents!important}
  #atlasAetherStatusPanel4084 [data-aether-focus-shell-406030]{display:contents!important;position:static!important;border:0!important;background:transparent!important;overflow:visible!important}
  #atlasAetherStatusPanel4084 .aether-focus-viewport-406030{position:static!important;width:auto!important;height:auto!important;min-height:0!important;max-height:none!important;padding:0!important;overflow:visible!important}
  #atlasAetherStatusPanel4084 [data-aether-focus-view-406030="glance"]{display:contents!important}

  /* Exact artwork anchors: live glass covers baked text while leaving the art/icon lane visible. */
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article:has([data-aether-row-4084="convergence"]){left:37.6%!important;top:5.0%!important;width:25.2%!important;height:14.9%!important;padding-left:26%!important}
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article:has([data-aether-row-4084="divergence"]){left:64.7%!important;top:15.2%!important;width:23.8%!important;height:15.5%!important}
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article:has([data-aether-row-4084="market"]){left:65.3%!important;top:32.0%!important;width:24.0%!important;height:21.4%!important}
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="system"]){left:11.3%!important;top:15.2%!important;width:24.0%!important;height:15.3%!important}
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="sources"]){left:11.3%!important;top:32.7%!important;width:23.2%!important;height:16.1%!important}
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="atlas"]){left:11.4%!important;top:52.7%!important;width:23.2%!important;height:23.1%!important}
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="oracle"]){left:24.3%!important;top:78.0%!important;width:22.0%!important;height:13.2%!important}
  #atlasAetherStatusPanel4084 [data-aether-timeline-card-406027]{left:65.2%!important;top:56.3%!important;width:23.2%!important;height:19.9%!important;padding-left:25%!important}
  #atlasAetherStatusPanel4084 [data-aether-weather-406030]{left:52.8%!important;top:78.0%!important;width:22.2%!important;height:13.2%!important;padding-left:27%!important;display:block!important}

  /* Center hub: one controlled mask hides baked labels, the live DOM remains authoritative. */
  #atlasAetherStatusPanel4084 [data-aether-level-406030]{
    left:50%!important;top:47.0%!important;transform:translate(-50%,-50%)!important;width:25.4%!important;height:18.0%!important;z-index:8!important;
    text-align:center!important;border:0!important;border-radius:50%!important;padding:30px 22px 10px!important;
    background:radial-gradient(circle,rgba(2,11,27,.98) 0 56%,rgba(2,11,27,.91) 70%,rgba(2,11,27,.18) 87%,transparent 100%)!important;
    box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;
  }
  #atlasAetherStatusPanel4084 [data-aether-level-406030]::before{
    content:"AETHER\A ATTENTION WATCH"!important;white-space:pre!important;display:block!important;margin:0 0 7px!important;
    font-family:Georgia,serif!important;font-size:20px!important;line-height:1.03!important;letter-spacing:.075em!important;color:#dce8ff!important;text-shadow:0 0 15px rgba(80,177,255,.68)!important;
  }
  #atlasAetherStatusPanel4084 [data-aether-level-406030] > span{font-size:10px!important;color:#73e9ff!important;margin-bottom:4px!important}
  #atlasAetherStatusPanel4084 [data-aether-level-406030] [data-aether-row-4084="level"]{
    display:block!important;font-size:16.5px!important;line-height:1.18!important;color:#ffd66d!important;max-width:100%!important;overflow:hidden!important;
  }
  #atlasAetherStatusPanel4084 [data-aether-action-406030]{
    left:50%!important;top:62.0%!important;transform:translate(-50%,-50%)!important;width:30.0%!important;height:13.3%!important;z-index:8!important;
    text-align:center!important;border:0!important;padding:9px 16px!important;background:rgba(2,11,27,.93)!important;border-radius:16px!important;box-shadow:0 8px 22px rgba(0,0,0,.22)!important;
    display:block!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;
  }
  #atlasAetherStatusPanel4084 [data-aether-action-406030] > span{font-size:10px!important;color:#73e9ff!important;margin-bottom:3px!important}
  #atlasAetherStatusPanel4084 [data-aether-action-406030] > b{display:block!important;font-size:12.2px!important;line-height:1.22!important;color:#f4e4a0!important;max-height:48px!important;overflow:hidden!important}
  #atlasAetherStatusPanel4084 [data-aether-action-406030] > small{display:block!important;margin-top:3px!important;font-size:10.6px!important;line-height:1.18!important;color:#ffc8e6!important;max-height:27px!important;overflow:hidden!important}

  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article > small{display:block!important;margin-top:4px!important;font-size:10.2px!important;line-height:1.18!important;color:#79f0d1!important;font-weight:750!important}
  #atlasAetherStatusPanel4084 [data-aether-weather-406030] > b{white-space:pre-line!important;font-size:11.7px!important;line-height:1.25!important}
  #atlasAetherStatusPanel4084 [data-aether-weather-406030] > small{font-size:9.8px!important;line-height:1.18!important;color:#bcecff!important}
  #atlasAetherStatusPanel4084 [data-aether-timeline-preview-406028]{display:grid!important;gap:3px!important;margin-top:3px!important}
  #atlasAetherStatusPanel4084 .aether-timeline-row-406027{grid-template-columns:46px 44px 50px minmax(0,1fr)!important;gap:4px!important;padding:3px 4px!important;font-size:9.6px!important;line-height:1.12!important;background:rgba(1,9,20,.38)!important}
  #atlasAetherStatusPanel4084 .aether-timeline-time-406027,#atlasAetherStatusPanel4084 .aether-timeline-type-406027,#atlasAetherStatusPanel4084 .aether-timeline-level-406027{font-size:9.5px!important}
  #atlasAetherStatusPanel4084 .aether-timeline-detail-406027{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;font-size:9.6px!important}

  #atlasAetherStatusPanel4084 .aether-focus-toolbar-406030{
    position:absolute!important;right:1.6%!important;bottom:1.4%!important;z-index:30!important;display:flex!important;justify-content:flex-end!important;
    border:1px solid rgba(91,210,255,.22)!important;background:rgba(2,12,25,.78)!important;border-radius:10px!important;padding:4px!important;
  }
  #atlasAetherStatusPanel4084 .aether-focus-toolbar-406030 > b{display:none!important}
  #atlasAetherStatusPanel4084 [data-aether-focus-button-406030]{font-size:10px!important;padding:5px 8px!important}
  #atlasAetherStatusPanel4084 [data-aether-focus-view-406030="history"],
  #atlasAetherStatusPanel4084 [data-aether-focus-view-406030="details"]{
    position:absolute!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;width:58%!important;height:46%!important;z-index:40!important;
    padding:13px!important;border:1px solid rgba(81,210,255,.50)!important;border-radius:18px!important;background:rgba(2,12,27,.965)!important;box-shadow:0 18px 60px rgba(0,0,0,.62)!important;overflow:hidden!important;
  }
  #atlasAetherStatusPanel4084 [data-aether-focus-view-406030="history"] [data-aether-timeline-406027],
  #atlasAetherStatusPanel4084 .aether-details-grid-406030{height:calc(100% - 25px)!important;overflow-y:auto!important;overflow-x:hidden!important;scrollbar-gutter:stable!important}
  #atlasAetherStatusPanel4084 .aether-details-grid-406030{grid-template-columns:repeat(2,minmax(0,1fr))!important}
  #atlasAetherStatusPanel4084 .aether-details-grid-406030 article{position:static!important;transform:none!important;width:auto!important;height:auto!important;padding:9px!important;background:rgba(4,20,38,.72)!important}
}

/* Portrait-ish desktop: fit the same 16:9 coordinate stage by width, never switch coordinate systems. */
@media (min-width:901px) and (max-aspect-ratio:16/9){
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030{width:calc(100% - 18px)!important;height:auto!important;max-width:none!important}
}
'''

css_text = CSS.read_text(encoding="utf-8").rstrip() + css_block + "\n"
# Appended block integrity gate before touching metadata.
tail = css_text[css_text.index(MARKER):]
brace_test = re.sub(r"/\*.*?\*/", "", tail, flags=re.S)
require(brace_test.count("{") == brace_test.count("}"), "40.6.33 CSS brace mismatch")
CSS.write_text(css_text, encoding="utf-8")

now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
html = INDEX.read_text(encoding="utf-8")
html = replace_once(html, '<meta name="atlas-build" content="40.6.32"', '<meta name="atlas-build" content="40.6.33"', "atlas build")
html = replace_once(html, '<meta name="administrator-build" content="40.6.32"', '<meta name="administrator-build" content="40.6.33"', "administrator build")
html = replace_once(html, 'AETHER CENTRAL OBSERVATORY · EXACT BACKGROUND · LIVE GLASS OVERLAY', RELEASE, "release")
html = replace_once(html, 'market-core-v2.0-alpha-build-40.6.32', 'market-core-v2.0-alpha-build-40.6.33', "asset token")
html = replace_once(html, 'Build 40.6.32 · Administrator', 'Build 40.6.33 · Administrator', "title")
html = replace_once(html, 'admin-ribbons.css?v=administrator-build-40.6.32', 'admin-ribbons.css?v=administrator-build-40.6.33', "CSS cache token")
INDEX.write_text(html, encoding="utf-8")

build.update({
    "build": BUILD_NO,
    "release": RELEASE,
    "status": STATUS,
    "parent_build": PARENT,
    "asset_token": "market-core-v2.0-alpha-build-40.6.33",
    "administrator_build": BUILD_NO,
    "build_label": f"Build {BUILD_NO}",
    "release_status": RELEASE,
    "timestamp": now,
})
if isinstance(build.get("current_version_truth"), dict):
    build["current_version_truth"]["loaded_build"] = BUILD_NO
build["cascade_40_6_33"] = {
    "parent_build": PARENT,
    "release": RELEASE,
    "status": STATUS,
    "owner": "admin-ribbons.css",
    "scope": "presentation_only",
    "exact_artwork_sha256": ASSET_SHA,
    "desktop_stage": "16:9 coordinate stage centered inside full-screen Aether modal",
    "short_height_fallback_retired_on_desktop": True,
    "live_dom_owner_preserved": True,
    "aether_runtime_modified": False,
    "market_core_modified": False,
    "graph_modified": False,
    "technical_reading_modified": False,
    "oracle_runtime_modified": False,
    "window_manager_modified": False,
    "new_recurring_timer": False,
    "new_observer": False,
    "new_network_owner": False,
    "new_storage_owner": False,
    "automatic_order": False,
    "real_order": False,
}
BUILD.write_text(json.dumps(build, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

for path in (VERSION, ADMIN_VERSION):
    data = json.loads(path.read_text(encoding="utf-8"))
    require(data.get("build") == PARENT, f"{path.name}: parent build drift")
    data["build"] = BUILD_NO
    data["release"] = RELEASE
    data["status"] = STATUS
    data["prepared_at"] = now
    data["published_at"] = now
    data["parent_build"] = PARENT
    if "asset_token" in data:
        data["asset_token"] = "market-core-v2.0-alpha-build-40.6.33"
    if isinstance(data.get("current_version_truth"), dict):
        data["current_version_truth"]["loaded_build"] = BUILD_NO
    data["cascade_40_6_33"] = {
        "parent_build": PARENT,
        "release": RELEASE,
        "status": STATUS,
        "presentation_only": True,
        "exact_artwork_stage": True,
        "desktop_short_height_radial_preserved": True,
        "aether_runtime_modified": False,
        "market_core_modified": False,
        "window_manager_modified": False,
        "new_timer": False,
        "new_observer": False,
    }
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

RELEASE_MD.write_text(
    f"""# Agent-Crypto 40.6.33 — AETHER OBSERVATORY · EXACT ARTWORK STAGE\n\n"
    f"Parent: **{PARENT}**  \nMarket Core: **{ENGINE} — protected**  \nGenerated: **{now}**\n\n"
    "## Cause\n"
    "40.6.32 uses the selected artwork, but the live cards were positioned against the modal viewport while the 16:9 artwork was cropped independently. "
    "On short Firefox viewports the historical `max-height:720px` fallback also turned the radial DOM back into stacked cards, producing two incompatible layouts.\n\n"
    "## Correction\n"
    "- The exact selected 16:9 artwork is now the coordinate stage for the live overlay.\n"
    "- The Aether modal becomes a dedicated focus surface while open.\n"
    "- Radial cards are positioned relative to that same stage, so artwork and DOM scale together.\n"
    "- Desktop short-height no longer activates the historical stacked-card fallback.\n"
    "- Glass cards preserve the artwork icon lane while masking baked text/value regions.\n"
    "- History and Details remain one bounded central overlay.\n\n"
    "## Protected\n"
    "- `js/aether.js` byte-for-byte unchanged.\n"
    "- Market Core 38.15.11 unchanged.\n"
    "- Graphique, Lecture Technique, Oracle runtime, Chronos, Version Truth, Window Manager, Paper/Safety and Parker untouched by this release.\n"
    "- Exact artwork bytes unchanged.\n"
    "- No timer, observer, storage, fetch or network owner added.\n\n"
    "## Operator test\n"
    "Firefox: Ctrl+F5 → Aether Attention → inspect Vue at normal height and a shorter browser viewport → Historique → Détails → close and confirm the underlying Administrator is untouched.\n"
    """,
    encoding="utf-8",
)

# Post-write guards.
require(sha256(AETHER_JS) == aether_before, "Aether runtime changed")
require(sha256(ASSET) == ASSET_SHA, "Artwork changed")
for path in (BUILD, VERSION, ADMIN_VERSION):
    json.loads(path.read_text(encoding="utf-8"))
require('content="40.6.33"' in INDEX.read_text(encoding="utf-8"), "Index build token missing")
require("aether-observatory-radial-406031.svg" not in CSS.read_text(encoding="utf-8"), "Retired SVG reference returned")

subprocess.run(["node", "--check", str(AETHER_JS)], check=True)
subprocess.run(["git", "diff", "--check"], check=True)

ZIP.parent.mkdir(parents=True, exist_ok=True)
if ZIP.exists():
    ZIP.unlink()
files = {
    "administrator/admin-ribbons.css": CSS,
    "administrator/index.html": INDEX,
    "administrator/build.json": BUILD,
    "administrator/administrator-version.json": ADMIN_VERSION,
    "administrator/version.json": VERSION,
    "administrator/RELEASE_40_6_33.md": RELEASE_MD,
    "administrator/assets/aether/aether-observatory-background-406032.webp": ASSET,
}
with zipfile.ZipFile(ZIP, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
    for arcname, src in files.items():
        zf.write(src, arcname)
with zipfile.ZipFile(ZIP) as zf:
    require(len([n for n in zf.namelist() if not n.endswith("/")]) == 7, "ZIP file-count gate failed")
    require(zf.testzip() is None, "ZIP integrity gate failed")
zip_sha = sha256(ZIP)
SHA.write_text(f"{zip_sha}  {ZIP.name}\n", encoding="utf-8")

print(f"40.6.33 prepared: {RELEASE}")
print(f"Aether runtime SHA preserved: {aether_before}")
print(f"Artwork SHA preserved: {ASSET_SHA}")
print(f"ZIP SHA256: {zip_sha}")
