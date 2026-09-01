from pathlib import Path
import hashlib
import json
import re
import zipfile
from datetime import datetime, timezone

BUILD = "40.4.157"
PARENT = "40.4.156"
RELEASE = "AETHER NEWS SENTINEL FRENCH LIVE FEED LOCK"
STATUS = "aether_news_sentinel_french_live_feed_lock"
LINEAGE_NOTE = "40.4.157 Aether News Sentinel French live feed lock"

ADMIN = Path("public/agent_crypto_erith_ia/administrator")
INDEX = ADMIN / "index.html"
ROOT_APP = ADMIN / "app.js"
MODULAR_APP = ADMIN / "js/app.js"
AETHER = ADMIN / "js/aether.js"
LAYOUT = ADMIN / "js/layout-repair.js"
MANIFESTS = [ADMIN / "version.json", ADMIN / "administrator-version.json"]
ARCHIVE_DIR = Path("coordination/inter_ai_dialogues/agent_crypto")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def replace_once(text: str, pattern: str, replacement: str, label: str, flags: int = 0) -> str:
    output, count = re.subn(pattern, replacement, text, count=1, flags=flags)
    if count != 1:
        raise SystemExit(f"{label}: replacement count={count}, expected 1")
    return output


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


def patch_aether() -> None:
    text = AETHER.read_text(encoding="utf-8")

    invariant_before = {
        "setInterval": text.count("setInterval("),
        "fetch": text.count("fetch("),
        "MutationObserver": text.count("new MutationObserver"),
        "IntersectionObserver": text.count("new IntersectionObserver"),
        "top12": text.count("const AETHER_VEILLE_TOP_4087=12;"),
    }
    if invariant_before["top12"] != 1:
        raise SystemExit("Aether: 12-story live-feed owner missing")

    old = '''function aetherNewsHeadlineSource40133(event,fallback="Event to qualify"){
  const canonical=aetherNewsCanonicalFrenchEvent40110(event)||event||{};
  const original=String(canonical?.headline||event?.headline||"").replace(/\\s+/g," ").trim();
  return original||aetherNewsHeadlineFr40104(canonical,fallback);
}'''
    new = '''function aetherNewsHeadlineSource40133(event,fallback="Événement à qualifier"){
  const canonical=aetherNewsCanonicalFrenchEvent40110(event)||event||{};
  // 40.4.157 — the canonical French presentation helper owns Aether display.
  // Source-original remains preserved in News Sentinel as evidence, not as the first visible headline.
  return aetherNewsHeadlineFr40104(canonical,fallback);
}'''
    if text.count(old) != 1:
        raise SystemExit(f"Aether French headline owner: exact source count={text.count(old)}, expected 1")
    text = text.replace(old, new, 1)

    text = replace_once(
        text,
        r'news_display_language:"source-original"',
        'news_display_language:"fr-FR"',
        "Aether display language diagnostic",
    )
    text = replace_once(
        text,
        r'news_source_original_headline_first:true',
        'news_source_original_headline_first:false',
        "Aether source-first diagnostic",
    )
    text = replace_once(
        text,
        r'news_translation_preferred:"headline_fr_display → headline_fr \(secondary data retained\)"',
        'news_translation_preferred:"headline_fr_display → headline_fr → deterministic French factual fallback"',
        "Aether French priority diagnostic",
    )
    text = replace_once(
        text,
        r'news_translation_story_owner:"News Sentinel source-original headline owns VEILLE; translated fields remain preserved"',
        'news_translation_story_owner:"News Sentinel French presentation owns VEILLE; source-original headline remains preserved as evidence"',
        "Aether story owner diagnostic",
    )
    text = replace_once(
        text,
        r'news_translation_raw_english_in_aether:true,',
        'news_translation_raw_english_in_aether:false,\n    news_source_original_preserved_not_display_owner:true,\n    news_display_contract_build:"40.4.157",',
        "Aether raw-English diagnostic",
    )

    invariant_after = {
        "setInterval": text.count("setInterval("),
        "fetch": text.count("fetch("),
        "MutationObserver": text.count("new MutationObserver"),
        "IntersectionObserver": text.count("new IntersectionObserver"),
        "top12": text.count("const AETHER_VEILLE_TOP_4087=12;"),
    }
    if invariant_before != invariant_after:
        raise SystemExit(f"Aether runtime ownership changed: {invariant_before} -> {invariant_after}")
    if text.count("aetherNewsHeadlineSource40133(") < 3:
        raise SystemExit("Aether French headline helper consumers unexpectedly missing")
    if "return aetherNewsHeadlineFr40104(canonical,fallback);" not in text:
        raise SystemExit("Aether canonical French helper is not the visible owner")

    AETHER.write_text(text, encoding="utf-8", newline="\n")


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


def verify_oracle_hotfix() -> None:
    if not LAYOUT.is_file():
        raise SystemExit("Oracle 40.4.156R1 layout hotfix file missing")
    text = LAYOUT.read_text(encoding="utf-8")
    required = [
        "40.4.156R1 — ORACLE DIRECT-FLOAT BODY PORTAL REPAIR",
        'const BUILD = "40.4.156R1";',
        "window_manager_remains_drag_owner: true",
        "window_manager_remains_z_owner: true",
    ]
    missing = [token for token in required if token not in text]
    if missing:
        raise SystemExit("Oracle 40.4.156R1 preservation failed: " + ", ".join(missing))


def update_manifests() -> None:
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    verification = {
        "build": BUILD,
        "parent_build": PARENT,
        "display_owner": "js/aether.js::aetherNewsHeadlineSource40133 -> aetherNewsHeadlineFr40104",
        "headline_priority": ["headline_fr_display", "headline_fr", "deterministic French factual fallback"],
        "canonical_original_preserved": True,
        "source_original_display_owner": False,
        "story_slots": 12,
        "story_slot_seconds": 18,
        "news_collector_changed": False,
        "news_translator_changed": False,
        "marquee_changed": False,
        "new_timer": False,
        "new_observer": False,
        "new_fetch_owner": False,
        "market_core_changed": False,
        "oracle_changed": False,
        "oracle_404156r1_preserved": True,
        "atlas_changed": False,
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
        files["js/layout-repair.js"] = sha256(LAYOUT)
        for relative in list(files):
            candidate = ADMIN / relative
            if candidate.is_file() and candidate.resolve() != path.resolve():
                files[relative] = sha256(candidate)

        data.setdefault("verification", {})["aether_news_sentinel_french_live_feed_404157"] = verification
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
    patch_aether()
    bump_identity()
    verify_oracle_hotfix()
    update_manifests()
    archive, digest_file, digest = build_archive()
    Path("/tmp/aether_404157_env").write_text(
        f"ARCHIVE={archive.as_posix()}\nSHA_FILE={digest_file.as_posix()}\nDIGEST={digest}\n",
        encoding="utf-8",
    )
    print("40.4.157 PATCH PASS")
    print("Aether canonical French headline owner PASS")
    print("Aether 12-story live-feed ownership PRESERVED")
    print("Oracle 40.4.156R1 PRESERVED")
    print(f"Canonical archive: {archive}")
    print(f"SHA-256: {digest}")


if __name__ == "__main__":
    main()
