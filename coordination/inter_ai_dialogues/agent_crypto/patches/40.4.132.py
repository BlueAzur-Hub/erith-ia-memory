from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import re
import zipfile

ROOT = Path("public/agent_crypto_erith_ia/administrator")
REQUEST = Path("coordination/inter_ai_dialogues/agent_crypto/patches/40.4.132.request.json")
BUILD = "40.4.132"
PARENT = "40.4.131"
RELEASE = "AETHER CANONICAL NEWS STORY RECOVERY · FRENCH HEADLINE OWNER · 12-STORY CONTENT LOCK"
STATUS = "candidate_aether_canonical_news_story_recovery_operator_validation_required"
NOTE = (
    "40.4.132 — Aether VEILLE reading-content recovery: canonical collector payload events now own the "
    "12-story reading queue whenever available; explicit canonical French headlines outrank derived/UI "
    "presentation helpers; derived rows become fallback-only. The 40.4.131 18-second story slots, full "
    "12-story batch before SYSTEM, responsive authentication truth panel and Market Core 38.15.11 remain unchanged."
)


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def replace_once(path: Path, old: str, new: str, label: str) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"STOP: {label} attendu 1 occurrence, trouvé {count}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


def sub_once(path: Path, pattern: str, repl: str, label: str, flags: int = 0) -> None:
    text = path.read_text(encoding="utf-8")
    out, count = re.subn(pattern, repl, text, count=1, flags=flags)
    if count != 1:
        raise SystemExit(f"STOP: {label} attendu 1 occurrence, trouvé {count}")
    path.write_text(out, encoding="utf-8")


def sub_optional(path: Path, pattern: str, repl: str, flags: int = 0) -> None:
    text = path.read_text(encoding="utf-8")
    out, count = re.subn(pattern, repl, text, count=1, flags=flags)
    if count:
        path.write_text(out, encoding="utf-8")


def guard() -> None:
    req = json.loads(REQUEST.read_text(encoding="utf-8"))
    if req.get("schema") != "agent_crypto_guarded_patch_request_v1" or req.get("build") != BUILD or req.get("parent_build") != PARENT:
        raise SystemExit("STOP: requête 40.4.132 invalide")
    current = json.loads((ROOT / "version.json").read_text(encoding="utf-8"))
    if current.get("build") != PARENT:
        raise SystemExit(f"STOP: parent build attendu {PARENT}, trouvé {current.get('build')}")
    if str((current.get("engine") or {}).get("reference_build")) != "38.15.11":
        raise SystemExit("STOP: Market Core parent inattendu")


def patch_aether() -> None:
    path = ROOT / "js/aether.js"
    replace_once(path, "  Build: 40.4.131", "  Build: 40.4.132", "Aether header build")
    sub_once(
        path,
        r"  Revision: 40\.4\.131[^\n]*",
        "  Revision: 40.4.132 canonical News story recovery. Canonical collector payload events own VEILLE reading whenever available; explicit headline_fr_display/headline_fr is the first presentation authority. Derived/UI rows are fallback-only and can no longer replace a translated source headline with taxonomy. 40.4.131 timing and 12-story continuity are preserved unchanged.",
        "Aether revision",
    )

    # Canonical translated payload must be searched before transformed UI rows.
    old_match = (
        '      const pools=[];\n'
        '      if(typeof newsFeedState!=="undefined"&&Array.isArray(newsFeedState?.events))pools.push(newsFeedState.events);\n'
        '      if(typeof newsFeedState!=="undefined"&&Array.isArray(newsFeedState?.payload?.events))pools.push(newsFeedState.payload.events);'
    )
    new_match = (
        '      const pools=[];\n'
        '      // 40.4.132 — canonical translated collector payload is the first matching authority.\n'
        '      if(typeof newsFeedState!=="undefined"&&Array.isArray(newsFeedState?.payload?.events))pools.push(newsFeedState.payload.events);\n'
        '      if(typeof newsFeedState!=="undefined"&&Array.isArray(newsFeedState?.events))pools.push(newsFeedState.events);'
    )
    replace_once(path, old_match, new_match, "canonical matching pool order")

    # Explicit canonical French is authoritative before any derived presentation helper.
    explicit_line = '    const explicitFrench=String(canonical?.headline_fr_display||canonical?.headline_fr||"").replace(/\\s+/g," ").trim();\n    try{'
    replace_once(
        path,
        explicit_line,
        '    const explicitFrench=String(canonical?.headline_fr_display||canonical?.headline_fr||"").replace(/\\s+/g," ").trim();\n'
        '    // 40.4.132 — never let a derived presentation helper overwrite a canonical French headline.\n'
        '    if(explicitFrench)return explicitFrench;\n'
        '    try{',
        "explicit French priority",
    )
    replace_once(
        path,
        '    if(explicitFrench)return explicitFrench;\n    // 40.4.124 — no “traduction en attente” and no raw English leakage in the scarce Aether ribbon.',
        '    // 40.4.124 — no “traduction en attente” and no raw English leakage in the scarce Aether ribbon.',
        "retire late explicit French branch",
    )

    # Reading queue: canonical collector payload only when available. Derived rows are fallback-only.
    old_queue = '    try{if(typeof newsFeedState!=="undefined"){addPool(newsFeedState?.events);addPool(newsFeedState?.payload?.events);}}catch(_){}'
    new_queue = (
        '    try{\n'
        '      if(typeof newsFeedState!=="undefined"){\n'
        '        const canonical=(Array.isArray(newsFeedState?.payload?.events)?newsFeedState.payload.events:[])\n'
        '          .filter(event=>String(event?.headline_fr_display||event?.headline_fr||event?.headline||"").replace(/\\s+/g," ").trim());\n'
        '        // 40.4.132 — VEILLE is a story reader: canonical content-bearing events own the queue.\n'
        '        // Derived/UI rows remain usable only when the canonical payload is genuinely absent.\n'
        '        if(canonical.length)addPool(canonical);\n'
        '        else addPool(newsFeedState?.events);\n'
        '      }\n'
        '    }catch(_){}'
    )
    replace_once(path, old_queue, new_queue, "canonical VEILLE queue owner")

    replace_once(path, '    build:"40.4.131",', '    build:"40.4.132",', "Aether API build")
    replace_once(
        path,
        '    news_feed_pool_union:"newsFeedState.events + newsFeedState.payload.events",',
        '    news_feed_pool_union:"canonical newsFeedState.payload.events; derived newsFeedState.events only if canonical payload absent",\n'
        '    news_feed_primary_pool:"newsFeedState.payload.events",\n'
        '    news_feed_canonical_headline_required:true,\n'
        '    news_feed_derived_rows_reading_fallback_only:true,\n'
        '    news_feed_derived_rows_can_displace_canonical_story:false,',
        "Aether News pool contract",
    )


def patch_identity() -> None:
    replace_once(ROOT / "app.js", 'const ATLAS_BUILD = "40.4.131";', 'const ATLAS_BUILD = "40.4.132";', "ATLAS_BUILD")
    replace_once(ROOT / "js/app.js", '  const ADMIN_BUILD = "40.4.131";', '  const ADMIN_BUILD = "40.4.132";', "ADMIN_BUILD")

    path = ROOT / "index.html"
    sub_once(path, r'(<meta name="atlas-build" content=")[^"]+("\s*/>)', rf'\g<1>{BUILD}\2', "index atlas-build")
    sub_once(path, r'(<meta name="administrator-build" content=")[^"]+("\s*/>)', rf'\g<1>{BUILD}\2', "index administrator-build")
    sub_once(path, r'(<meta name="administrator-release" content=")[^"]+("\s*/>)', rf'\g<1>{RELEASE}\2', "index release")
    sub_once(path, r'(<meta name="atlas-asset-token" content=")[^"]+("\s*/>)', rf'\g<1>market-core-v2.0-alpha-build-{BUILD}\2', "index asset token")
    sub_once(path, r'<title>Agent-Crypto @erith\.IA — Build [^<]+ · Administrator</title>', f'<title>Agent-Crypto @erith.IA — Build {BUILD} · Administrator</title>', "index title")
    sub_once(path, r'(\./admin-ribbons\.css\?v=administrator-build-)[^"\']+', rf'\g<1>{BUILD}', "ribbons cache token")
    sub_once(path, r'(\./js/aether\.js\?v=administrator-build-)[^"\']+', rf'\g<1>{BUILD}', "Aether cache token")
    sub_optional(path, r'(\./app\.js\?v=administrator-build-)[^"\']+', rf'\g<1>{BUILD}')
    sub_optional(path, r'(\./js/app\.js\?v=administrator-build-)[^"\']+', rf'\g<1>{BUILD}')
    sub_optional(path, r'(data-administrator-build=")[^"]+(")', rf'\g<1>{BUILD}\2')
    sub_optional(path, r'(aria-label="Version Agent-Crypto installée : Build )[^"]+(, mode Administrator")', rf'\g<1>{BUILD}\2')
    sub_optional(path, r'(<span id="atlasVersionControlText">Build )[^<]+(</span>)', rf'\g<1>{BUILD}\2')
    sub_optional(path, r'(<span id="atlasV2ReleaseBadge">Agent-Crypto @erith\.IA · Build )[^<]+( · Administrator</span>)', rf'\g<1>{BUILD}\2')
    sub_optional(path, r'(<span id="footerRelease">Agent-Crypto @erith\.IA · Build )[^<]+( · Administrator</span>)', rf'\g<1>{BUILD}\2')


def update_manifest(path: Path, administrator_sha: str | None = None) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    data["build"] = BUILD
    data["release"] = RELEASE
    data["status"] = STATUS
    data["prepared_at"] = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    data["published_at"] = None
    if "global_versioning" in data:
        data["global_versioning"] = BUILD
    data["asset_token"] = f"market-core-v2.0-alpha-build-{BUILD}"
    data["parent_build"] = PARENT
    suffix = "40.4.132 canonical translated News story owner + derived-row fallback-only content recovery"
    if isinstance(data.get("lineage"), str) and suffix not in data["lineage"]:
        data["lineage"] += " → " + suffix

    feature = {
        "build": BUILD,
        "canonical_queue_owner": "newsFeedState.payload.events",
        "canonical_french_headline_first": True,
        "derived_ui_rows_fallback_only": True,
        "derived_rows_can_displace_canonical_story": False,
        "story_slots": 12,
        "story_slot_seconds": 18,
        "full_batch_before_system": True,
        "cadence_seconds": 270,
        "market_core_changed": False,
        "graph_changed": False,
        "atlas_current_changed": False,
        "oracle_changed": False,
        "bridge_changed": False,
        "news_collector_changed": False,
        "new_recurring_timer": False,
        "new_observer": False,
        "new_network_owner": False,
    }
    data.setdefault("features", {})["aether_canonical_news_story_recovery_404132"] = feature.copy()
    data.setdefault("integrity", {})["aether_canonical_news_story_recovery_404132"] = feature.copy()
    pub = data.setdefault("integrity", {}).setdefault("publication_identity", {})
    pub["build"] = BUILD
    pub["asset_token"] = f"market-core-v2.0-alpha-build-{BUILD}"
    pub["status"] = STATUS
    pub["app_sha256"] = sha(ROOT / "app.js")
    if administrator_sha is not None:
        pub["administrator_version_sha256"] = administrator_sha

    notes = data.setdefault("release_notes", [])
    if not notes or notes[0] != NOTE:
        notes.insert(0, NOTE)
    data.setdefault("validation", {}).update({
        "aether_canonical_news_queue_404132_required": True,
        "aether_explicit_french_headline_priority_404132_required": True,
        "aether_derived_rows_fallback_only_404132_required": True,
        "aether_12_story_18s_cadence_404131_preserved": True,
        "auth_truth_panel_404131_preserved": True,
        "market_core_38_15_11_non_regression_404132_required": True,
    })

    files = data.get("files") or {}
    if isinstance(files, dict):
        for rel in list(files):
            target = ROOT / rel
            if not target.is_file():
                raise SystemExit(f"STOP: fichier manifest absent pendant resynchronisation {rel}")
            files[rel] = sha(target)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def sync_manifests() -> None:
    admin = ROOT / "administrator-version.json"
    update_manifest(admin)
    update_manifest(ROOT / "version.json", sha(admin))


def validate() -> None:
    app = (ROOT / "app.js").read_text(encoding="utf-8", errors="replace")
    admin_js = (ROOT / "js/app.js").read_text(encoding="utf-8", errors="replace")
    aether = (ROOT / "js/aether.js").read_text(encoding="utf-8", errors="replace")
    css = (ROOT / "admin-ribbons.css").read_text(encoding="utf-8", errors="replace")
    index = (ROOT / "index.html").read_text(encoding="utf-8", errors="replace")

    if 'const ATLAS_BUILD = "40.4.132";' not in app or 'const ADMIN_BUILD = "40.4.132";' not in admin_js or 'build:"40.4.132"' not in aether:
        raise SystemExit("STOP: version runtime 40.4.132 non alignée")
    if 'news_feed_primary_pool:"newsFeedState.payload.events"' not in aether:
        raise SystemExit("STOP: owner canonique VEILLE absent")
    if 'if(canonical.length)addPool(canonical);' not in aether or 'else addPool(newsFeedState?.events);' not in aether:
        raise SystemExit("STOP: fallback-only derived rows absent")
    if 'addPool(newsFeedState?.events);addPool(newsFeedState?.payload?.events);' in aether:
        raise SystemExit("STOP: ancien union dérivé+canonique encore actif")
    explicit_pos = aether.find('if(explicitFrench)return explicitFrench;')
    helper_pos = aether.find('const owner=globalThis.AgentCryptoNewsFrenchPresentation40104;')
    if explicit_pos < 0 or helper_pos < 0 or explicit_pos > helper_pos:
        raise SystemExit("STOP: headline canonique FR ne précède pas le helper dérivé")

    required_css = (
        "animation:atlasStatusNativePhase 270s steps(1,end) infinite!important;",
        "animation:atlasAetherBandPhase 270s steps(1,end) infinite!important;",
        "animation:atlasAetherInfoPhase 270s steps(1,end) infinite!important;",
        "atlasAetherVeillePhase 270s steps(1,end) infinite,",
        "atlasAetherFeedPulse40112 18s 9s steps(1,end) infinite!important;",
        "animation:atlasAetherSystemPhase 270s steps(1,end) infinite!important;",
    )
    if not all(token in css for token in required_css):
        raise SystemExit("STOP: cadence CSS 40.4.131 non préservée")
    for token in ("veille_feed_pulse_seconds:18", "cadence_seconds:270", "veille_seconds:216", "veille_full_batch_before_system:true", "veille_first_visible_pulse_advances:false"):
        if token not in aether:
            raise SystemExit(f"STOP: contrat Aether 40.4.131 perdu: {token}")
    if '.atlas-access-truth-panel-40380{display:grid!important;grid-column:2' not in index:
        raise SystemExit("STOP: Vérité opérateur responsive 40.4.131 perdue")

    latest = json.loads(Path("public/agent_crypto_erith_ia/data/news/latest.json").read_text(encoding="utf-8"))
    rows = [e for e in (latest.get("events") or []) if str(e.get("headline") or "").strip()]
    translated = [e for e in rows if str(e.get("headline_fr_display") or e.get("headline_fr") or "").strip()]
    if len(rows) < 12 or len(translated) < 12:
        raise SystemExit(f"STOP: payload News canonique insuffisant: rows={len(rows)} translated={len(translated)}")

    ids = re.findall(r'\bid=["\']([^"\']+)["\']', index)
    if len(ids) != len(set(ids)):
        raise SystemExit("STOP: IDs HTML dupliqués")

    admin = json.loads((ROOT / "administrator-version.json").read_text(encoding="utf-8"))
    version = json.loads((ROOT / "version.json").read_text(encoding="utf-8"))
    for name, data in (("administrator-version.json", admin), ("version.json", version)):
        if data.get("build") != BUILD or data.get("asset_token") != f"market-core-v2.0-alpha-build-{BUILD}":
            raise SystemExit(f"STOP: identité manifest fausse {name}")
        if (data.get("protected_base") or {}).get("market_core_modified") is not False:
            raise SystemExit(f"STOP: Market Core déclaré modifié dans {name}")
        for rel, expected in (data.get("files") or {}).items():
            target = ROOT / rel
            if not target.is_file() or sha(target) != expected:
                raise SystemExit(f"STOP: hash manifest faux {name} {rel}")
    if str((version.get("engine") or {}).get("reference_build")) != "38.15.11":
        raise SystemExit("STOP: Market Core 38.15.11 non préservé")
    if version.get("integrity", {}).get("publication_identity", {}).get("administrator_version_sha256") != sha(ROOT / "administrator-version.json"):
        raise SystemExit("STOP: chaîne administrator-version SHA incorrecte")

    print(f"PASS {BUILD} · canonical translated News owner · 12-story 18s cadence preserved · Market Core 38.15.11 protected")


def build_archive() -> None:
    manifest = json.loads((ROOT / "version.json").read_text(encoding="utf-8"))
    files = list((manifest.get("files") or {}).keys())
    for required in ("version.json", "administrator-version.json"):
        if required not in files:
            files.append(required)
    outdir = Path("coordination/inter_ai_dialogues/agent_crypto")
    outdir.mkdir(parents=True, exist_ok=True)
    out = outdir / "AGENT_CRYPTO_BUILD_40_4_132_AUTO_CANONICAL.zip"
    with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for rel in files:
            src = ROOT / rel
            if not src.is_file():
                raise SystemExit(f"STOP: archive fichier absent {rel}")
            zf.write(src, arcname=src.as_posix())
    digest = sha(out)
    Path(str(out) + ".sha256").write_text(f"{digest}  {out.name}\n", encoding="utf-8")
    print(f"ARCHIVE {out} {digest}")


def main() -> None:
    guard()
    markers = ("setInterval(", "MutationObserver", "IntersectionObserver", "new WebSocket", "localStorage.setItem")
    before = {}
    for rel in ("app.js", "js/app.js"):
        text = (ROOT / rel).read_text(encoding="utf-8", errors="replace")
        before[rel] = {m: text.count(m) for m in markers}
    patch_aether()
    patch_identity()
    sync_manifests()
    for rel in ("app.js", "js/app.js"):
        text = (ROOT / rel).read_text(encoding="utf-8", errors="replace")
        for marker in markers:
            if text.count(marker) > before[rel][marker]:
                raise SystemExit(f"STOP: budget runtime augmenté {rel} {marker}")
    validate()
    build_archive()


if __name__ == "__main__":
    main()
