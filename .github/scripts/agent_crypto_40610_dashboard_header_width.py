#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import re
import zipfile

ROOT = Path("public/agent_crypto_erith_ia/administrator")
BUILD = "40.6.10"
PARENT = "40.6.9"
ENGINE = "38.15.11"
RELEASE = "DASHBOARD HEADER WIDTH CONTRACT · CHRONOS/VERSION FREEZE"
STATUS = "dashboard_header_width_contract_chronos_version_freeze_406010"
TOKEN = f"market-core-v2.0-alpha-build-{BUILD}"
NOW = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def load(name: str) -> dict:
    data = json.loads((ROOT / name).read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise SystemExit(f"STOP 40.6.10: invalid JSON root {name}")
    return data


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


# ---------------------------------------------------------------------------
# PRE-SURGERY TRUTH / FREEZE
# ---------------------------------------------------------------------------
current = load("version.json")
if str(current.get("build") or "") != PARENT:
    raise SystemExit(f"STOP 40.6.10: expected parent {PARENT}, found {current.get('build')}")
if str(load("build.json").get("engine") or "") != ENGINE:
    raise SystemExit("STOP 40.6.10: Market Core drift before surgery")

version_truth_path = ROOT / "js/version-truth.js"
chronos_path = ROOT / "admin-chronos.css"
version_truth_before = version_truth_path.read_bytes()
chronos_before = chronos_path.read_bytes()
version_truth_sha_before = hashlib.sha256(version_truth_before).hexdigest()
chronos_sha_before = hashlib.sha256(chronos_before).hexdigest()

# 40.6.9 accepted/frozen contract.
EXPECTED_VERSION_TRUTH_SHA = "749da2802a65a006928a96c44ff33d691233e3e80a8356bb9541dfc37d09e03a"
if version_truth_sha_before != EXPECTED_VERSION_TRUTH_SHA:
    raise SystemExit("STOP 40.6.10: Version Truth is not the accepted 40.6.8/40.6.9 payload")
if b"40.4.107" not in chronos_before:
    raise SystemExit("STOP 40.6.10: Chronos is not the accepted 40.4.107 checkpoint owner")

# ---------------------------------------------------------------------------
# BOUNDED SURGERY — shared status/header grid only.
# Root cause proven in current index.html:
# 170 + 170 + 230 + 340 + 520 + (4 * 6 gap) = 1454 px minimum.
# Above the old 1366px breakpoint this can exceed the real hero content width.
# Keep the same proportional fractions, lower ONLY hard minima to the already
# proven compact values, and do not touch Chronos typography or runtime.
# New minimum: 128 + 124 + 170 + 255 + 410 + (4 * 6) = 1111 px.
# ---------------------------------------------------------------------------
index_path = ROOT / "index.html"
index = index_path.read_text(encoding="utf-8")

old_grid = "grid-template-columns:minmax(170px,.66fr) minmax(170px,.66fr) minmax(230px,.94fr) minmax(340px,1.35fr) minmax(520px,2.05fr)!important;"
new_grid = "grid-template-columns:minmax(128px,.66fr) minmax(124px,.66fr) minmax(170px,.94fr) minmax(255px,1.35fr) minmax(410px,2.05fr)!important;"

if index.count(old_grid) != 1:
    raise SystemExit(f"STOP 40.6.10: expected exactly one active wide status grid, found {index.count(old_grid)}")
if new_grid in index:
    raise SystemExit("STOP 40.6.10: new grid already present before surgery")
index = index.replace(old_grid, new_grid, 1)

# The <=1366 compact contract is evidence and must stay present unchanged.
compact_grid = "grid-template-columns:minmax(128px,.58fr) minmax(124px,.56fr) minmax(170px,.78fr) minmax(255px,1.18fr) minmax(410px,1.90fr)!important;"
if compact_grid not in index:
    raise SystemExit("STOP 40.6.10: compact <=1366 status grid evidence missing")

# PUBLICATION IDENTITY — Version Truth script URL/bytes deliberately stay frozen.
replacements = {
    '<meta name="atlas-build" content="40.6.9" />': '<meta name="atlas-build" content="40.6.10" />',
    '<meta name="administrator-build" content="40.6.9" />': '<meta name="administrator-build" content="40.6.10" />',
    '<meta name="administrator-release" content="CHRONOS VALIDATED CHECKPOINT RESTORE · VERSION BUTTON FREEZE" />': f'<meta name="administrator-release" content="{RELEASE}" />',
    '<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.9" />': f'<meta name="atlas-asset-token" content="{TOKEN}" />',
    '<title>Agent-Crypto @erith.IA — Build 40.6.9 · Administrator</title>': '<title>Agent-Crypto @erith.IA — Build 40.6.10 · Administrator</title>',
}
for old, new in replacements.items():
    if old not in index:
        raise SystemExit(f"STOP 40.6.10: missing index identity token: {old}")
    index = index.replace(old, new, 1)

# Do not alter ./js/version-truth.js?v=40.6.8 and do not churn admin-chronos.css URL.
if './js/version-truth.js?v=40.6.8' not in index:
    raise SystemExit("STOP 40.6.10: frozen Version Truth URL missing")
if './admin-chronos.css?v=administrator-build-40.6.9' not in index:
    raise SystemExit("STOP 40.6.10: accepted Chronos cache URL missing")

index, n1 = re.subn(
    r'(id="atlasVersionTruthControl"[\s\S]{0,700}?aria-label="Version Agent-Crypto installée : Build )[^,\"]+(, mode Administrator\")',
    r'\g<1>40.6.10\g<2>', index, count=1,
)
index, n2 = re.subn(
    r'(<span id="atlasVersionTruthText">Build )[^<]+(</span>)',
    r'\g<1>40.6.10\g<2>', index, count=1,
)
if n1 != 1 or n2 != 1:
    raise SystemExit(f"STOP 40.6.10: first-paint badge mismatch {n1}/{n2}")

index_path.write_text(index, encoding="utf-8")

# ---------------------------------------------------------------------------
# RELEASE NOTE
# ---------------------------------------------------------------------------
release_path = ROOT / "RELEASE_40_6_10.md"
release_path.write_text(f'''# Agent-Crypto @erith.IA — Build {BUILD}\n\n## {RELEASE}\n\nParent: **{PARENT}**  \nMarket Core: **{ENGINE} protected**\n\n### Défaut reproduit\nLe propriétaire actif du bandeau `#livecheck.command-bar` dans `index.html` imposait, au-dessus de 1366 px, cinq minima de colonnes : `170 + 170 + 230 + 340 + 520 px`, plus quatre gaps de `6 px`, soit **1454 px minimum**. Le breakpoint compact s'arrêtait à 1366 px : à 1367 px et sur certaines largeurs intermédiaires, la grille pouvait donc réclamer plus de largeur que le contenu réel du header.\n\n### Chirurgie 40.6.10\n- Propriétaire modifié : **uniquement la grille partagée du bandeau supérieur dans `index.html`**.\n- Fractions/proportions conservées : `.66fr / .66fr / .94fr / 1.35fr / 2.05fr`.\n- Minima durs ramenés à `128 / 124 / 170 / 255 / 410 px`.\n- Nouveau minimum structurel : **1111 px** gaps inclus, au lieu de **1454 px**.\n- Le contrat compact `<=1366 px` reste inchangé.\n- **Aucune réduction de police Chronos** : `admin-chronos.css` reste byte-for-byte le checkpoint validé 40.4.107.\n- **Bouton Version inchangé** : `js/version-truth.js` reste byte-for-byte le contrat 40.6.8 validé en 40.6.9.\n- Aucun changement Graphique, Lecture Technique, Atlas, Oracle, Aether/News, Strategy A/Paper, Window Manager ou Market Core.\n\n### Firefox — preuve opérateur attendue\n1. À largeur ~1367–1500 px, le bandeau supérieur ne doit plus déborder horizontalement.\n2. Chronos doit conserver exactement la présentation validée en 40.6.9.\n3. Le bouton Build doit annoncer 40.6.10 depuis 40.6.9 puis charger la nouvelle version une seule fois ; sur 40.6.10 à jour, il doit rester dans son comportement historique validé.\n''', encoding="utf-8")

# ---------------------------------------------------------------------------
# MANIFESTS — identity + bounded cascade record only.
# ---------------------------------------------------------------------------
docs = {name: load(name) for name in ("build.json", "administrator-version.json", "version.json")}
for name, data in docs.items():
    data["build"] = BUILD
    data["release"] = RELEASE
    data["status"] = STATUS
    data["parent_build"] = PARENT
    data["asset_token"] = TOKEN
    if "administrator_build" in data:
        data["administrator_build"] = BUILD
    if "build_label" in data:
        data["build_label"] = f"Build {BUILD}"
    if "release_status" in data:
        data["release_status"] = RELEASE
    for key in ("timestamp", "prepared_at", "published_at"):
        if key in data:
            data[key] = NOW

    truth = data.get("current_version_truth")
    if not isinstance(truth, dict):
        raise SystemExit(f"STOP 40.6.10: missing current_version_truth in {name}")
    truth["loaded_build"] = BUILD

    data["cascade_40_6_10"] = {
        "parent_build": PARENT,
        "release": RELEASE,
        "scope": "shared_header_status_grid_only",
        "owner": "index.html inline 40.3.121 shared status geometry",
        "old_minimum_width_px": 1454,
        "new_minimum_width_px": 1111,
        "breakpoint_discontinuity_at_1367_removed": True,
        "fractional_track_weights_preserved": True,
        "compact_1366_contract_modified": False,
        "chronos_modified": False,
        "chronos_sha256": chronos_sha_before,
        "version_truth_js_modified": False,
        "version_truth_js_sha256": version_truth_sha_before,
        "version_button_406008_contract_frozen": True,
        "market_core_modified": False,
        "graph_modified": False,
        "technical_reading_modified": False,
        "atlas_modified": False,
        "oracle_modified": False,
        "strategy_a_modified": False,
        "window_manager_modified": False,
        "new_recurring_timer": False,
        "new_observer": False,
        "new_network_owner": False,
        "new_storage_owner": False,
        "automatic_order": False,
        "real_order": False,
    }

for name in ("build.json", "administrator-version.json"):
    (ROOT / name).write_text(json.dumps(docs[name], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

version = docs["version.json"]
files = version.get("files")
if not isinstance(files, dict):
    files = {}
    version["files"] = files
for rel in (
    "index.html",
    "admin-chronos.css",
    "js/version-truth.js",
    "build.json",
    "administrator-version.json",
    "RELEASE_40_6_10.md",
):
    files[rel] = sha256(ROOT / rel)
if isinstance(version.get("integrity"), dict) and isinstance(version["integrity"].get("files"), int):
    version["integrity"]["files"] = len(files)
(ROOT / "version.json").write_text(json.dumps(version, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# ---------------------------------------------------------------------------
# HARD PROOFS
# ---------------------------------------------------------------------------
if version_truth_path.read_bytes() != version_truth_before:
    raise SystemExit("STOP 40.6.10: Version Truth bytes changed")
if chronos_path.read_bytes() != chronos_before:
    raise SystemExit("STOP 40.6.10: Chronos bytes changed")
if sha256(version_truth_path) != version_truth_sha_before:
    raise SystemExit("STOP 40.6.10: Version Truth SHA changed")
if sha256(chronos_path) != chronos_sha_before:
    raise SystemExit("STOP 40.6.10: Chronos SHA changed")

final_index = index_path.read_text(encoding="utf-8")
if old_grid in final_index or final_index.count(new_grid) != 1:
    raise SystemExit("STOP 40.6.10: wide status-grid surgery proof failed")
if compact_grid not in final_index:
    raise SystemExit("STOP 40.6.10: compact status-grid contract drift")
for name in ("build.json", "administrator-version.json", "version.json"):
    if str(load(name).get("build") or "") != BUILD:
        raise SystemExit(f"STOP 40.6.10: build drift {name}")
if str(load("build.json").get("engine") or "") != ENGINE:
    raise SystemExit("STOP 40.6.10: Market Core drift")

# ---------------------------------------------------------------------------
# CLEAN UPLOAD — includes the two frozen evidence owners.
# ---------------------------------------------------------------------------
outdir = Path("coordination/inter_ai_dialogues/agent_crypto")
outdir.mkdir(parents=True, exist_ok=True)
out = outdir / "AGENT_CRYPTO_BUILD_40_6_10_DASHBOARD_HEADER_WIDTH_CONTRACT_CLEAN_UPLOAD_7_FILES.zip"
rels = [
    "index.html",
    "build.json",
    "administrator-version.json",
    "version.json",
    "RELEASE_40_6_10.md",
    "admin-chronos.css",
    "js/version-truth.js",
]
with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for rel in rels:
        archive.write(ROOT / rel, (Path("public/agent_crypto_erith_ia/administrator") / rel).as_posix())
digest = sha256(out)
Path(str(out) + ".sha256").write_text(f"{digest}  {out.name}\n", encoding="utf-8")

print(json.dumps({
    "ok": True,
    "build": BUILD,
    "parent": PARENT,
    "owner": "index.html shared status grid",
    "old_minimum_width_px": 1454,
    "new_minimum_width_px": 1111,
    "chronos_sha256": chronos_sha_before,
    "version_truth_sha256": version_truth_sha_before,
    "market_core": ENGINE,
    "zip": out.as_posix(),
    "sha256": digest,
}, ensure_ascii=False))
