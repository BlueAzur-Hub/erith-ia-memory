from pathlib import Path
from datetime import datetime, timezone
import base64
import hashlib
import json
import subprocess
import zipfile

ROOT = Path("public/agent_crypto_erith_ia/administrator")
INDEX = ROOT / "index.html"
CSS = ROOT / "admin-ribbons.css"
BUILD = ROOT / "build.json"
ADMIN_VERSION = ROOT / "administrator-version.json"
VERSION = ROOT / "version.json"
APP_JS = ROOT / "js/app.js"
AETHER_JS = ROOT / "js/aether.js"
WORKBENCH = ROOT / "js/aether-workbench-406039.js"
ASSET = ROOT / "assets/aether/aether-observatory-empty-ui-406043.webp"
RELEASE_MD = ROOT / "RELEASE_40_6_43.md"

CSS_PARTS = [
    Path(".github/scripts/aether43-css-part01.b64"),
    Path(".github/scripts/aether43-css-part02.b64"),
    Path(".github/scripts/aether43-css-part03.b64"),
]
ASSET_PARTS = [
    Path(".github/assets/aether43q15-part01.b64"),
    Path(".github/assets/aether43q15-part02.b64"),
    Path(".github/assets/aether43q15-part03.b64"),
]

PARENT = "40.6.42"
BUILD_NO = "40.6.43"
ENGINE = "38.15.11"
RELEASE = "AETHER EMPTY BACKPLATE · LIVE UI RECONSTRUCTION"
STATUS = "aether_empty_backplate_live_ui_reconstruction_406043"
TOKEN = "market-core-v2.0-alpha-build-40.6.43"
ASSET_SHA256 = "fa073142c956a92144f7bc39e69d8401cd9a2a5a2d0cd20c5a0517ddba0466a5"
MARKER = "/* 40.6.43 — AETHER EMPTY BACKPLATE · LIVE UI RECONSTRUCTION"

EXPECTED_BLOBS = {
    APP_JS: "1cd18fb77a2e1ae42a8aac22ca029376e9d0d393",
    AETHER_JS: "897b0d9759de9b9467db1395e633d52cafcfdd2a",
    CSS: "89e50d79e1646b3c12a51e5d9c1f61c2a46a45e5",
    WORKBENCH: "21145af3e8695dd4cb6366423d5d8c9f62ab9aa1",
    INDEX: "034b587fc942b9bb2a3859a4ecd0847287457465",
}

ZIP = Path("coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_BUILD_40_6_43_AETHER_EMPTY_BACKPLATE_LIVE_UI_RECONSTRUCTION_CLEAN_UPLOAD_7_FILES.zip")
ZIP_SHA = Path(str(ZIP) + ".sha256")


def require(condition, message):
    if not condition:
        raise SystemExit(message)


def git_blob(path):
    return subprocess.check_output(["git", "hash-object", str(path)], text=True).strip()


def sha256_bytes(data):
    return hashlib.sha256(data).hexdigest()


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path, payload):
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def decode_parts(paths):
    for path in paths:
        require(path.exists(), f"missing staged part: {path}")
    encoded = "".join(path.read_text(encoding="utf-8").strip() for path in paths)
    return base64.b64decode(encoded, validate=True)


truth = read_json(BUILD)
require(truth.get("build") == PARENT, f"parent build drift: {truth.get('build')}")
require(truth.get("engine") == ENGINE, f"Market Core drift: {truth.get('engine')}")
for path, expected in EXPECTED_BLOBS.items():
    require(path.exists(), f"protected file missing: {path}")
    require(git_blob(path) == expected, f"protected checkpoint drift: {path}")

css_patch = decode_parts(CSS_PARTS).decode("utf-8")
require(css_patch.count("{") == css_patch.count("}"), "40.6.43 CSS braces unbalanced")
require(MARKER in css_patch, "40.6.43 CSS marker absent")
require("aether-observatory-empty-ui-406043.webp" in css_patch, "new empty backplate is not referenced")
require("grid-template-areas:'core core'" not in css_patch, "rejected 40.6.42 vertical dashboard leaked into 40.6.43")

asset_bytes = decode_parts(ASSET_PARTS)
require(sha256_bytes(asset_bytes) == ASSET_SHA256, "40.6.43 empty backplate SHA-256 drift")
require(asset_bytes[:4] == b"RIFF" and asset_bytes[8:12] == b"WEBP", "40.6.43 asset is not WebP")
ASSET.parent.mkdir(parents=True, exist_ok=True)
ASSET.write_bytes(asset_bytes)

css_before = CSS.read_text(encoding="utf-8")
require(MARKER not in css_before, "40.6.43 CSS already applied")
CSS.write_text(css_before.rstrip() + "\n\n" + css_patch.rstrip() + "\n", encoding="utf-8")

# Presentation-only cache/version truth. Aether runtime bytes stay protected.
index = INDEX.read_text(encoding="utf-8")
replacements = {
    '<meta name="atlas-build" content="40.6.42" />': '<meta name="atlas-build" content="40.6.43" />',
    '<meta name="administrator-build" content="40.6.42" />': '<meta name="administrator-build" content="40.6.43" />',
    '<meta name="administrator-release" content="AETHER COMPONENT FOUNDATION · RESPONSIVE INFORMATION ARCHITECTURE" />': '<meta name="administrator-release" content="AETHER EMPTY BACKPLATE · LIVE UI RECONSTRUCTION" />',
    '<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.42" />': '<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.43" />',
    '<title>Agent-Crypto @erith.IA — Build 40.6.42 · Administrator</title>': '<title>Agent-Crypto @erith.IA — Build 40.6.43 · Administrator</title>',
    './admin-ribbons.css?v=administrator-build-40.6.42': './admin-ribbons.css?v=administrator-build-40.6.43',
}
for old, new in replacements.items():
    require(old in index, f"index checkpoint missing: {old}")
    index = index.replace(old, new, 1)
INDEX.write_text(index, encoding="utf-8")

now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")

truth.update({
    "build": BUILD_NO,
    "engine": ENGINE,
    "release": RELEASE,
    "published": True,
    "status": STATUS,
    "parent_build": PARENT,
    "asset_token": TOKEN,
    "administrator_build": BUILD_NO,
    "build_label": f"Build {BUILD_NO}",
    "release_status": RELEASE,
})
truth["aether_attention_layout"] = "radial-observatory-live-dom-over-empty-backplate"
truth["aether_attention_backplate"] = str(ASSET.relative_to(ROOT)).replace("\\", "/")
truth["aether_attention_backplate_sha256"] = ASSET_SHA256
truth["aether_attention_rejected_406042_vertical_dashboard"] = True
truth["aether_attention_workbench_lazy_preserved"] = True
truth["aether_attention_window_manager_preserved"] = True
truth["aether_attention_network_owner_added"] = False
truth["aether_attention_timer_owner_added"] = False
truth["aether_attention_storage_owner_added"] = False
truth["aether_attention_real_order"] = False
write_json(BUILD, truth)


def update_manifest(path):
    data = read_json(path)
    for key, value in (
        ("build", BUILD_NO),
        ("release", RELEASE),
        ("status", STATUS),
        ("parent_build", PARENT),
        ("asset_token", TOKEN),
        ("prepared_at", now),
        ("published_at", now),
    ):
        if key in data or key in {"build", "release", "status"}:
            data[key] = value
    data["aether_attention_layout"] = "radial-observatory-live-dom-over-empty-backplate"
    data["aether_attention_empty_backplate"] = True
    data["aether_attention_backplate_sha256"] = ASSET_SHA256
    data["aether_attention_component_view_model_406042_reused"] = True
    data["aether_attention_graph_first_lazy_preserved"] = True
    data["aether_attention_window_manager_preserved"] = True
    data["aether_attention_workbench_406039_preserved"] = True
    data["aether_attention_automatic_order"] = False
    data["aether_attention_real_order"] = False
    write_json(path, data)


update_manifest(ADMIN_VERSION)
update_manifest(VERSION)

RELEASE_MD.write_text(f"""# Agent-Crypto {BUILD_NO} — {RELEASE}

Parent: {PARENT}  
Engine: Market Core {ENGINE}

## Purpose

40.6.43 rejects the visual direction of 40.6.42 while retaining its structured live Aether view-model. The validated Aether Observatory returns as a radial first-glance cockpit over the user-approved empty cosmic backplate.

## Visual contract

- Empty backplate is visual geometry only: no readable truth is baked into the image.
- All readable titles, values, statuses, events and Aether attention text remain live HTML/CSS/JS DOM.
- Convergence stays top-center; System/Sources/Atlas left; Divergence/Market/Events right; Oracle/Weather bottom; Aether Core central.
- Desktop never falls back to the rejected vertical page/dashboard layout.
- Small windows shed secondary prose before changing the Observatory identity.
- The Administrator shell remains freely movable, detachable, resizable and maximizable through the native Window Manager.

## Preserved owners

- Market Core {ENGINE}.
- Graph-first lazy behavior from 40.6.37.
- Aether Workbench 40.6.39 (Events / History / Details).
- Native Administrator Window Manager bridge from 40.6.40/40.6.41.
- `js/app.js`, `js/aether.js`, Workbench runtime bytes unchanged.
- Graphique, Lecture Technique, Oracle business engine, Atlas pipeline, Chronos, Paper/Safety and order paths unchanged.
- no new fetch, WebSocket, recurring timer, observer or storage owner.
- no automatic or real order.

## Backplate

`assets/aether/aether-observatory-empty-ui-406043.webp`  
SHA-256: `{ASSET_SHA256}`
""", encoding="utf-8")

# Anti-destruction gates after surgery.
require(git_blob(APP_JS) == EXPECTED_BLOBS[APP_JS], "app.js changed unexpectedly")
require(git_blob(AETHER_JS) == EXPECTED_BLOBS[AETHER_JS], "aether.js changed unexpectedly")
require(git_blob(WORKBENCH) == EXPECTED_BLOBS[WORKBENCH], "Workbench changed unexpectedly")
require(MARKER in CSS.read_text(encoding="utf-8"), "40.6.43 CSS missing after write")
require(sha256_bytes(ASSET.read_bytes()) == ASSET_SHA256, "asset changed after write")
require(read_json(BUILD).get("build") == BUILD_NO, "build truth not updated")
require(read_json(BUILD).get("engine") == ENGINE, "engine truth changed")

# Clean Upload contract: exactly seven deployable Administrator files.
package = [
    INDEX,
    CSS,
    AETHER_JS,
    BUILD,
    ADMIN_VERSION,
    VERSION,
    ASSET,
]
require(len(package) == 7 and len(set(package)) == 7, "clean upload file count is not seven")
ZIP.parent.mkdir(parents=True, exist_ok=True)
if ZIP.exists():
    ZIP.unlink()
with zipfile.ZipFile(ZIP, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
    for path in package:
        arc = Path("administrator") / path.relative_to(ROOT)
        zf.write(path, arc.as_posix())
with zipfile.ZipFile(ZIP, "r") as zf:
    names = zf.namelist()
    require(len(names) == 7 and len(set(names)) == 7, f"ZIP file count drift: {names}")
    require(zf.testzip() is None, "ZIP integrity failure")
zip_digest = hashlib.sha256(ZIP.read_bytes()).hexdigest()
ZIP_SHA.write_text(f"{zip_digest}  {ZIP.name}\n", encoding="utf-8")

print(f"BUILD={BUILD_NO}")
print(f"ENGINE={ENGINE}")
print(f"ASSET_SHA256={ASSET_SHA256}")
print(f"ZIP={ZIP}")
print(f"ZIP_SHA256={zip_digest}")
print("FILES=7")
print("PROTECTED_APP_JS=OK")
print("PROTECTED_AETHER_JS=OK")
print("PROTECTED_WORKBENCH=OK")
