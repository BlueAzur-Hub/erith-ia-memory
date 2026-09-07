#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import re
import subprocess
import zipfile

ROOT = Path("public/agent_crypto_erith_ia/administrator")
BUILD = "40.6.9"
PARENT = "40.6.8"
ENGINE = "38.15.11"
SOURCE_BUILD = "40.4.107"
SOURCE_COMMIT = "c4f68eb64c538439715a560874b413cb209cf227"
RELEASE = "CHRONOS VALIDATED CHECKPOINT RESTORE · VERSION BUTTON FREEZE"
STATUS = "chronos_validated_checkpoint_restore_version_button_freeze_406009"
TOKEN = f"market-core-v2.0-alpha-build-{BUILD}"
NOW = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def load(name: str) -> dict:
    data = json.loads((ROOT / name).read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise SystemExit(f"STOP 40.6.9: invalid JSON root {name}")
    return data


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


current = load("version.json")
if str(current.get("build") or "") != PARENT:
    raise SystemExit(f"STOP 40.6.9: expected parent {PARENT}, found {current.get('build')}")
if str(load("build.json").get("engine") or "") != ENGINE:
    raise SystemExit("STOP 40.6.9: Market Core drift before surgery")

# FREEZE — the now-correct historical version button is untouchable in this build.
version_truth_path = ROOT / "js/version-truth.js"
version_truth_before = version_truth_path.read_bytes()
version_truth_sha_before = hashlib.sha256(version_truth_before).hexdigest()

# CHRONOS — restore the exact checkpoint explicitly accepted in the Crypto thread.
# 40.4.107 predates the 40.5.2 <=620/520px shrink layer that reduced the date to 8.8/8px.
chronos_rel = "public/agent_crypto_erith_ia/administrator/admin-chronos.css"
historical_css = subprocess.check_output(["git", "show", f"{SOURCE_COMMIT}:{chronos_rel}"])
(ROOT / "admin-chronos.css").write_bytes(historical_css)
if (ROOT / "admin-chronos.css").read_bytes() != historical_css:
    raise SystemExit("STOP 40.6.9: Chronos restore is not byte-for-byte 40.4.107")
if b"40.5.2" in historical_css or b"@container (max-width:620px)" in historical_css or b"@container (max-width:520px)" in historical_css:
    raise SystemExit("STOP 40.6.9: later shrink layer survived in restored checkpoint")

# PUBLICATION IDENTITY — no version-button script cache token change.
index_path = ROOT / "index.html"
index = index_path.read_text(encoding="utf-8")
replacements = {
    '<meta name="atlas-build" content="40.6.8" />': '<meta name="atlas-build" content="40.6.9" />',
    '<meta name="administrator-build" content="40.6.8" />': '<meta name="administrator-build" content="40.6.9" />',
    '<meta name="administrator-release" content="HISTORICAL FUNCTIONAL CONTRACT RESTORE · VERSION + CHRONOS" />': f'<meta name="administrator-release" content="{RELEASE}" />',
    '<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.8" />': f'<meta name="atlas-asset-token" content="{TOKEN}" />',
    '<title>Agent-Crypto @erith.IA — Build 40.6.8 · Administrator</title>': '<title>Agent-Crypto @erith.IA — Build 40.6.9 · Administrator</title>',
    './admin-chronos.css?v=administrator-build-40.6.8': './admin-chronos.css?v=administrator-build-40.6.9',
}
for old, new in replacements.items():
    if old not in index:
        raise SystemExit(f"STOP 40.6.9: missing index token: {old}")
    index = index.replace(old, new, 1)
# Deliberately DO NOT replace ./js/version-truth.js?v=40.6.8 : script bytes and URL stay frozen.
index, n1 = re.subn(
    r'(id="atlasVersionTruthControl"[\s\S]{0,700}?aria-label="Version Agent-Crypto installée : Build )[^,\"]+(, mode Administrator\")',
    r'\g<1>40.6.9\g<2>', index, count=1,
)
index, n2 = re.subn(
    r'(<span id="atlasVersionTruthText">Build )[^<]+(</span>)',
    r'\g<1>40.6.9\g<2>', index, count=1,
)
if n1 != 1 or n2 != 1:
    raise SystemExit(f"STOP 40.6.9: first-paint badge mismatch {n1}/{n2}")
index_path.write_text(index, encoding="utf-8")

release_path = ROOT / "RELEASE_40_6_9.md"
release_path.write_text(f'''# Agent-Crypto @erith.IA — Build {BUILD}\n\n## {RELEASE}\n\nParent: **{PARENT}**  \nMarket Core: **{ENGINE} protected**\n\nCette version ne cherche pas une nouvelle solution : elle restaure un état déjà validé.\n\n- `admin-chronos.css` : restauration **octet pour octet** depuis le checkpoint validé **{SOURCE_BUILD}** (`{SOURCE_COMMIT}`).\n- Le Fil Crypto avait explicitement qualifié 40.4.107 de checkpoint utilisable et demandé de ne plus toucher Chronos sans défaut mesurable.\n- Les couches ultérieures de réduction 40.5.2 (`<=620px` / `<=520px`, date 8.8/8px) ne font pas partie du fichier restauré.\n- `js/version-truth.js` : **gelé byte-for-byte depuis 40.6.8** ; son SHA-256 doit rester `{version_truth_sha_before}`.\n- Aucun changement Graphique, Lecture Technique, Atlas, Oracle, Aether/News, Strategy A/Paper, Window Manager ou Market Core.\n\n### Firefox\n1. Depuis 40.6.8, le bouton Build doit annoncer 40.6.9 disponible puis la charger une seule fois.\n2. Sur 40.6.9 à jour, recliquer Build ne doit pas recharger la page.\n3. Chronos doit reprendre exactement la présentation du checkpoint 40.4.107, sans les réductions 40.5.2.\n''', encoding="utf-8")

# MANIFESTS — identity only; Version Truth behavior metadata is preserved.
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
        raise SystemExit(f"STOP 40.6.9: missing current_version_truth in {name}")
    truth["loaded_build"] = BUILD
    # Do not alter any behavioral Version Truth field from 40.6.8.
    data["cascade_40_6_9"] = {
        "parent_build": PARENT,
        "release": RELEASE,
        "restoration_only": True,
        "chronos_source_build": SOURCE_BUILD,
        "chronos_source_commit": SOURCE_COMMIT,
        "chronos_byte_for_byte_restored": True,
        "later_405002_shrink_layer_removed_by_restore": True,
        "version_truth_js_modified": False,
        "version_truth_js_sha256": version_truth_sha_before,
        "version_button_406008_contract_frozen": True,
        "market_core_modified": False,
        "graph_modified": False,
        "technical_reading_modified": False,
        "atlas_modified": False,
        "oracle_modified": False,
        "new_recurring_timer": False,
        "new_observer": False,
        "new_network_owner": False,
        "new_storage_owner": False,
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
    "RELEASE_40_6_9.md",
):
    files[rel] = sha256(ROOT / rel)
if isinstance(version.get("integrity"), dict) and isinstance(version["integrity"].get("files"), int):
    version["integrity"]["files"] = len(files)
(ROOT / "version.json").write_text(json.dumps(version, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# HARD PROOFS.
if version_truth_path.read_bytes() != version_truth_before:
    raise SystemExit("STOP 40.6.9: Version Truth bytes changed")
if sha256(version_truth_path) != version_truth_sha_before:
    raise SystemExit("STOP 40.6.9: Version Truth SHA changed")
for name in ("build.json", "administrator-version.json", "version.json"):
    if str(load(name).get("build") or "") != BUILD:
        raise SystemExit(f"STOP 40.6.9: build drift {name}")
if str(load("build.json").get("engine") or "") != ENGINE:
    raise SystemExit("STOP 40.6.9: Market Core drift")

# CLEAN UPLOAD.
outdir = Path("coordination/inter_ai_dialogues/agent_crypto")
outdir.mkdir(parents=True, exist_ok=True)
out = outdir / "AGENT_CRYPTO_BUILD_40_6_9_CHRONOS_VALIDATED_CHECKPOINT_RESTORE_CLEAN_UPLOAD_7_FILES.zip"
rels = [
    "index.html",
    "admin-chronos.css",
    "build.json",
    "administrator-version.json",
    "version.json",
    "RELEASE_40_6_9.md",
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
    "chronos": f"{SOURCE_BUILD} byte-for-byte",
    "version_truth_sha256": version_truth_sha_before,
    "version_button": "40.6.8 byte-for-byte frozen",
    "market_core": ENGINE,
    "zip": out.as_posix(),
    "sha256": digest,
}, ensure_ascii=False))
