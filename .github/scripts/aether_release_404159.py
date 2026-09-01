from pathlib import Path
import hashlib
import json
import re
import struct
import zipfile
from datetime import datetime, timezone

BUILD = "40.4.159"
PARENT = "40.4.158"
RELEASE = "TECHNICAL READING RND · AETHER OFFICE LIBRARY 10 LOCK"
STATUS = "technical_reading_rnd_aether_office_library_10_lock"
LINEAGE_NOTE = "40.4.159 Technical Reading RND Aether office library 10 lock"

ADMIN = Path("public/agent_crypto_erith_ia/administrator")
INDEX = ADMIN / "index.html"
ROOT_APP = ADMIN / "app.js"
MODULAR_APP = ADMIN / "js/app.js"
LAYOUT = ADMIN / "js/layout-repair.js"
MANIFESTS = [ADMIN / "version.json", ADMIN / "administrator-version.json"]
ARCHIVE_DIR = Path("coordination/inter_ai_dialogues/agent_crypto")
ASSET_REL = "assets/visual/technical-reading/technical-random-10.png"
ASSET = ADMIN / ASSET_REL


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def replace_once(text: str, pattern: str, replacement: str, label: str, flags: int = 0) -> str:
    output, count = re.subn(pattern, replacement, text, count=1, flags=flags)
    if count != 1:
        raise SystemExit(f"{label}: replacement count={count}, expected 1")
    return output


def verify_png(path: Path) -> tuple[int, int]:
    raw = path.read_bytes()
    if len(raw) < 24 or raw[:8] != b"\x89PNG\r\n\x1a\n":
        raise SystemExit("technical-random-10.png is not a PNG")
    width, height = struct.unpack(">II", raw[16:24])
    if width < 720 or height < 1280:
        raise SystemExit(f"technical-random-10.png too small: {width}x{height}")
    ratio = width / height
    if not (0.54 <= ratio <= 0.59):
        raise SystemExit(f"technical-random-10.png unexpected portrait ratio: {width}x{height}")
    return width, height


def patch_publication_identity(value):
    if isinstance(value, dict):
        for key, child in value.items():
            if key == "publication_identity" and isinstance(child, dict):
                child["build"] = BUILD
                child["asset_token"] = f"market-core-v2.0-alpha-build-{BUILD}"
                child["status"] = STATUS
                if "app_sha256" in child:
                    child["app_sha256"] = sha256(ROOT_APP)
            else:
                patch_publication_identity(child)
    elif isinstance(value, list):
        for child in value:
            patch_publication_identity(child)


def verify_parent_and_contracts() -> None:
    data = json.loads((ADMIN / "version.json").read_text(encoding="utf-8"))
    if str(data.get("build")) != PARENT:
        raise SystemExit(f"Expected parent {PARENT}, found {data.get('build')}")
    if not ASSET.is_file():
        raise SystemExit(f"Missing uploaded asset: {ASSET_REL}")
    verify_png(ASSET)

    layout = LAYOUT.read_text(encoding="utf-8")
    required = [
        "40.4.156R1 — ORACLE DIRECT-FLOAT BODY PORTAL REPAIR",
        "40.4.158 — GRAPH DIRECT-FLOAT BODY PORTAL REPAIR",
        "ErithOracleDirectFloatRepair404156R1",
        "ErithGraphDirectFloatRepair404158",
    ]
    missing = [token for token in required if token not in layout]
    if missing:
        raise SystemExit("Protected floating contracts missing: " + ", ".join(missing))

    index = INDEX.read_text(encoding="utf-8")
    if index.count('data-tech-random="1"') != 1:
        raise SystemExit("RND button owner count changed")
    if 'const RANDOM_LIBRARY=Object.freeze([' not in index:
        raise SystemExit("RND library owner missing")
    if 'technical-random-10.png' in index:
        raise SystemExit("technical-random-10.png already registered before release")


def patch_rnd_library() -> None:
    text = INDEX.read_text(encoding="utf-8")
    old = '    Object.freeze({file:"technical-random-09.png",label:"Archives de réflexion",x:50,y:41})\n  ]);'
    new = '    Object.freeze({file:"technical-random-09.png",label:"Archives de réflexion",x:50,y:41}),\n    Object.freeze({file:"technical-random-10.png",label:"Aether au bureau",x:50,y:40})\n  ]);'
    if text.count(old) != 1:
        raise SystemExit(f"RND library anchor count={text.count(old)}, expected 1")
    text = text.replace(old, new, 1)
    INDEX.write_text(text, encoding="utf-8", newline="\n")


def bump_identity() -> None:
    html = INDEX.read_text(encoding="utf-8")
    html = replace_once(html, r'(<meta name="atlas-build" content=")[^"]+(" />)', rf'\g<1>{BUILD}\2', "atlas meta")
    html = replace_once(html, r'(<meta name="administrator-build" content=")[^"]+(" />)', rf'\g<1>{BUILD}\2', "administrator meta")
    html = replace_once(html, r'(<meta name="administrator-release" content=")[^"]+(" />)', rf'\g<1>{RELEASE}\2', "release meta")
    html = replace_once(html, r'(<meta name="atlas-asset-token" content=")[^"]+(" />)', rf'\g<1>market-core-v2.0-alpha-build-{BUILD}\2', "asset token meta")
    html = replace_once(html, r'(<title>Agent-Crypto @erith\.IA — Build )40\.4\.\d+( · Administrator</title>)', rf'\g<1>{BUILD}\2', "title")
    html = re.sub(r'(\?v=administrator-build-)40\.4\.\d+', rf'\g<1>{BUILD}', html)
    html = re.sub(
        r"(Agent-Crypto @erith\.IA · Market Core · Build )40\.4\.\d+( · Version : Parker Lewis Can't Lose)",
        rf'\g<1>{BUILD}\2',
        html,
    )
    INDEX.write_text(html, encoding="utf-8", newline="\n")

    root = ROOT_APP.read_text(encoding="utf-8")
    root = replace_once(root, r'const ATLAS_BUILD = "40\.4\.\d+";', f'const ATLAS_BUILD = "{BUILD}";', "root ATLAS_BUILD")
    ROOT_APP.write_text(root, encoding="utf-8", newline="\n")

    modular = MODULAR_APP.read_text(encoding="utf-8")
    modular = replace_once(modular, r'const ADMIN_BUILD = "40\.4\.\d+";', f'const ADMIN_BUILD = "{BUILD}";', "modular ADMIN_BUILD")
    modular = replace_once(modular, r'const ADMIN_RELEASE = "[^"]*";', f'const ADMIN_RELEASE = "{RELEASE}";', "modular ADMIN_RELEASE")
    MODULAR_APP.write_text(modular, encoding="utf-8", newline="\n")


def update_manifests() -> None:
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    width, height = verify_png(ASSET)
    verification = {
        "build": BUILD,
        "parent_build": PARENT,
        "asset": ASSET_REL,
        "asset_sha256": sha256(ASSET),
        "asset_dimensions": f"{width}x{height}",
        "library_count": 10,
        "existing_rnd_button_reused": True,
        "one_click_one_image_preserved": True,
        "immediate_repeat_avoidance_preserved": True,
        "preload_before_swap_preserved": True,
        "auto_cycle_preserved": True,
        "private_local_image_override_preserved": True,
        "new_menu": False,
        "new_button": False,
        "new_engine": False,
        "graph_404158_preserved": True,
        "oracle_404156r1_preserved": True,
        "market_core_changed": False,
        "atlas_changed": False,
        "news_changed": False,
        "simulation_changed": False,
        "window_manager_changed": False,
    }

    for path in MANIFESTS:
        data = json.loads(path.read_text(encoding="utf-8"))
        data["build"] = BUILD
        data["release"] = RELEASE
        data["asset_token"] = f"market-core-v2.0-alpha-build-{BUILD}"
        data["status"] = STATUS
        data["parent_build"] = PARENT
        data["prepared_at"] = now
        data["published_at"] = now
        if "global_versioning" in data:
            data["global_versioning"] = BUILD

        lineage = str(data.get("lineage") or "")
        if LINEAGE_NOTE not in lineage:
            data["lineage"] = (lineage + " → " + LINEAGE_NOTE).strip(" →")

        files = data.setdefault("files", {})
        files[ASSET_REL] = sha256(ASSET)
        for relative in list(files):
            candidate = ADMIN / relative
            if candidate.is_file() and candidate.resolve() != path.resolve():
                files[relative] = sha256(candidate)

        data.setdefault("verification", {})["technical_reading_rnd_aether_404159"] = verification
        patch_publication_identity(data)
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")


def build_archive() -> tuple[Path, Path, str]:
    manifest = json.loads((ADMIN / "version.json").read_text(encoding="utf-8"))
    files = list((manifest.get("files") or {}).keys())
    for required in ("version.json", "administrator-version.json"):
        if required not in files:
            files.append(required)

    missing = [relative for relative in files if not (ADMIN / relative).is_file()]
    if missing:
        raise SystemExit("Canonical archive missing files: " + ", ".join(missing))

    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    safe_build = BUILD.replace(".", "_")
    archive = ARCHIVE_DIR / f"AGENT_CRYPTO_BUILD_{safe_build}_AUTO_CANONICAL.zip"
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as bundle:
        for relative in files:
            source = ADMIN / relative
            target = Path("public/agent_crypto_erith_ia/administrator") / relative
            bundle.write(source, arcname=target.as_posix())

    digest = sha256(archive)
    digest_file = Path(str(archive) + ".sha256")
    digest_file.write_text(f"{digest}  {archive.name}\n", encoding="utf-8")
    return archive, digest_file, digest


def main() -> None:
    verify_parent_and_contracts()
    patch_rnd_library()
    bump_identity()
    update_manifests()
    archive, digest_file, digest = build_archive()

    index = INDEX.read_text(encoding="utf-8")
    if index.count('technical-random-10.png') != 1:
        raise SystemExit("RND 10 registration count invalid")

    print("40.4.159 PATCH PASS")
    print("Technical Reading RND library 10/10 PASS")
    print("Graph 40.4.158 PRESERVED")
    print("Oracle 40.4.156R1 PRESERVED")
    print(f"ASSET_SHA256={sha256(ASSET)}")
    print(f"ARCHIVE={archive}")
    print(f"SHA_FILE={digest_file}")
    print(f"DIGEST={digest}")


if __name__ == "__main__":
    main()
