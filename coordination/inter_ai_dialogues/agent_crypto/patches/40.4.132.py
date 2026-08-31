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


def sub_optional(path: Path, pattern: str, repl: str, label: str, flags: int = 0) -> None:
    text = path.read_text(encoding="utf-8")
    out, count = re.subn(pattern, repl, text, count=1, flags=flags)
    if count > 1:
        raise SystemExit(f"STOP: {label} ambigu, trouvé {count}")
    if count:
        path.write_text(out, encoding="utf-8")


def guard_request() -> None:
    req = json.loads(REQUEST.read_text(encoding="utf-8"))
    if req.get("schema") != "agent_crypto_guarded_patch_request_v1":
        raise SystemExit("STOP: schéma requête 40.4.132 invalide")
    if req.get("build") != BUILD or req.get("parent_build") != PARENT:
        raise SystemExit("STOP: requête 40.4.132 invalide")
    current = json.loads((ROOT / "version.json").read_text(encoding="utf-8"))
    if current.get("build") != PARENT:
        raise SystemExit(f"STOP: parent build attendu {PARENT}, trouvé {current.get('build')}")
    engine = current.get("engine") or {}
    if str(engine.get("reference_build")) != "38.15.11":
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

    old_pools = (
        '    const pools=[];\n'
        '    if(typeof newsFeedState!=="undefined"&&Array.isArray(newsFeedState?.events))pools.push(newsFeedState.events);\n'
        '    if(typeof newsFeedState!=="undefined"&&Array.isArray(newsFeedState?.payload?.events))pools.push(newsFeedState.payload.events);'
    )
    new_pools = (
        '    const pools=[];\n'
        '    // 40.4.132 — canonical translated collector payload is the first matching authority.\n'
        '    if(typeof newsFeedState!=="undefined"&&Array.isArray(newsFeedState?.payload?.events))pools.push(newsFeedState.payload.events);\n'
        '    if(typeof newsFeedState!=="undefined"&&Array.isArray(newsFeedState?.events))pools.push(newsFeedState.events);'
    )
    replace_once(path, old_pools, new_pools, "canonical matching pool order")

    explicit = '    const explicitFrench=String(canonical?.headline_fr_display||canonical?.headline_fr||"").replace(/\\s+/g," ").trim();\n    try{'
    explicit_first = (
        '    const explicitFrench=String(canonical?.headline_fr_display||canonical?.headline_fr||"").replace(/\\s+/g," ").trim();\n'
        '    // 40.4.132 — never let a derived presentation helper overwrite a canonical French headline.\n'
        '    if(explicitFrench)return explicitFrench;\n'
        '    try{'
    )
    replace_once(path, explicit, explicit_first, "explicit French priority")
    replace_once(
        path,
        '    if(explicitFrench)return explicitFrench;\n    // 40.4.124 — no “traduction en attente” and no raw English leakage in the scarce Aether ribbon.',
        '    // 40.4.124 — no “traduction en attente” and no raw English leakage in the scarce Aether ribbon.',
        "retire late explicit French branch",
    )

    old_queue = (
        '  function aetherVeilleEvents4087(){\n'
        '    const events=[];\n'
        '    const addPool=pool=>{if(!Array.isArray(pool))return;for(const event of pool)if(event)events.push(event);};\n'
        '    try{if(typeof newsFeedState!=="undefined"){addPool(newsFeedState?.events);addPool(newsFeedState?.payload?.events);}}catch(_){}'
    )
    new_queue = (
        '  function aetherVeilleEvents4087(){\n'
        '    const events=[];\n'
        '    const addPool=pool=>{if(!Array.isArray(pool))return;for(const event of pool)if(event)events.push(event);};\n'
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


def patch_version_identity() -> None:
    replace_once(ROOT / "app.js", 'const ATLAS_BUILD = "40.4.131";', 'const ATLAS_BUILD = "40.4.132";', "ATLAS_BUILD")
    replace_once(ROOT / "js/app.js", '  const ADMIN_BUILD = "40.4.131";', '  const ADMIN_BUILD = "40.4.132";', "ADMIN_BUILD")

    index = ROOT / "index.html"
    sub_once(index, r'(<meta name="atlas-build" content=")[^"]+("\s*/>)', rf'\g<1>{BUILD}\2', "index atlas-build")
    sub_once(index, r'(<meta name="administrator-build" content=")[^"]+("\s*/>)', rf'\g<1>{BUILD}\2', "index administrator-build")
    sub_once(index, r'(<meta name="administrator-release" content=")[^"]+("\s*/>)', rf'\g<1>{RELEASE}\2', "index release")
    sub_once(index, r'(<meta name="atlas-asset-token" content=")[^"]+("\s*/>)', rf'\g<1>market-core-v2.0-alpha-build-{BUILD}\2', "index asset token")
    sub_once(index, r'<title>Agent-Crypto @erith\.IA — Build [^<]+ · Administrator</title>', f'<title>Agent-Crypto @erith.IA — Build {BUILD} · Administrator</title>', "index title")
    sub_once(index, r'(\./admin-ribbons\.css\?v=administrator-build-)[^"\']+', rf'\g<1>{BUILD}', "ribbons cache token")
    sub_once(index, r'(\./js/aether\.js\?v=administrator-build-)[^"\']+', rf'\g<1>{BUILD}', "Aether cache token")
    sub_optional(index, r'(\./app\.js\?v=administrator-build-)[^"\']+', rf'\g<1>{BUILD}', "app cache token")
    sub_optional(index, r'(\./js/app\.js\?v=administrator-build-)[^"\']+', rf'\g<1>{BUILD}', "admin app cache token")
    sub_optional(index, r'(data-administrator-build=")[^"]+(")', rf'\g<1>{BUILD}\2', "body administrator build")
    sub_optional(index, r'(aria-label="Version Agent-Crypto installée : Build )[^"]+(, mode Administrator")', rf'\g<1>{BUILD}\2', "version aria label")
    sub_optional(index, r'(<span id="atlasVersionControlText">Build )[^<]+(</span>)', rf'\g<1>{BUILD}\2', "version control text")
    sub_optional(index, r'(<span id="atlasV2ReleaseBadge">Agent-Crypto @erith\.IA · Build )[^<]+( · Administrator</span>)', rf'\g<1>{BUILD}\2', "release badge")
    sub_optional(index, r'(<span id="footerRelease">Agent-Crypto @erith\.IA · Build )[^<]+( · Administrator</span>)', rf'\g<1>{BUILD}\2', "footer release")


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
        "minimum_story_slots_target": 12,
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

    validation = data.setdefault("validation", {})
    validation.update({
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


def synchronize_manifests() -> None:
    admin = ROOT / "administrator-version.json"
    version = ROOT / "version.json"
    update_manifest(admin)
    update_manifest(version, sha(admin))


def validate() -> None:
    app = (ROOT / "app.js").read_text(encoding="utf-8", errors="replace")
    admin_js = (ROOT / "js/app.js").read_text(encoding="utf-8", errors="replace")
    aether = (ROOT / "js/aether.js").read_text(encoding="utf-8", errors="replace")
    css = (ROOT / "admin-ribbons.css").read_text(encoding="utf-8", errors="replace")
    index = (ROOT / "index.html").read_text(encoding="utf-8", errors="replace")

    if 'const ATLAS_BUILD = "40.4.132";' not in app or 'const ADMIN_BUILD = "40.4.132";' not in admin_js:
        raise SystemExit("STOP: version runtime 40.4.132 non alignée")
    if 'build:"40.4.132"' not in aether:
        raise SystemExit("STOP: Aether API build non aligné")
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

    latest_path = Path("public/agent_crypto_erith_ia/data/news/latest.json")
    latest = json.loads(latest_path.read_text(encoding="utf-8"))
    rows = [e for e in (latest.get("events") or []) if str(e.get("headline") or "").strip()]
    translated = [e for e in rows if str(e.get("headline_fr_display") or e.get("headline_fr") or "").strip()]
    if len(rows) < 12 or len(translated) < 12:
        raise SystemExit(f"STOP: payload News canonique insuffisant pour 12 lectures: rows={len(rows)} translated={len(translated)}")
    if any(not str(e.get("headline_fr_display") or e.get("headline_fr") or "").strip() for e in rows[:12]):
        raise SystemExit("STOP: une des 12 premières News canoniques n'a pas de titre FR")

    ids = re.findall(r'\bid=["\']([^"\']+)["\']', index)
    if len(ids) != len(set(ids)):
        dup = sorted({x for x in ids if ids.count(x) > 1})[:10]
        raise SystemExit("STOP: IDs HTML dupliqués: " + ", ".join(dup))

    admin = json.loads((ROOT / "administrator-version.json").read_text(encoding="utf-8"))
    version = json.loads((ROOT / "version.json").read_text(encoding="utf-8"))
    for name, data in (("administrator-version.json", admin), ("version.json", version)):
        if data.get("build") != BUILD or data.get("asset_token") != f"market-core-v2.0-alpha-build-{BUILD}":
            raise SystemExit(f"STOP: identité manifest fausse {name}")
        if (data.get("protected_base") or {}).get("market_core_modified") is not False:
            raise SystemExit(f"STOP: Market Core déclaré modifié dans {name}")
        for rel, expected in (data.get("files") or {}).items():
            target = ROOT / rel
            if not target.is_file():
                raise SystemExit(f"STOP: fichier manifest absent {rel}")
            actual = sha(target)
            if actual != expected:
                raise SystemExit(f"STOP: hash manifest faux {name} {rel}: {actual} != {expected}")
    if str((version.get("engine") or {}).get("reference_build")) != "38.15.11":
        raise SystemExit("STOP: Market Core 38.15.11 non préservé")
    admin_hash = sha(ROOT / "administrator-version.json")
    if version.get("integrity", {}).get("publication_identity", {}).get("administrator_version_sha256") != admin_hash:
        raise SystemExit("STOP: chaîne administrator-version SHA incorrecte")

    print(f"PASS {BUILD} · canonical translated News owner · 12-story 18s cadence preserved · Market Core 38.15.11 protected")


def build_archive() -> None:
    manifest = json.loads((ROOT / "version.json").read_text(encoding="utf-8"))
    files = list((manifest.get("files") or {}).keys())
    for required in ("version.json", "administrator-version.json"):
        if required not in files:
            files.append(required)
    missing = [rel for rel in files if not (ROOT / rel).is_file()]
    if missing:
        raise SystemExit("STOP: archive, fichiers absents: " + ", ".join(missing))
    archive_dir = Path("coordination/inter_ai_dialogues/agent_crypto")
    archive_dir.mkdir(parents=True, exist_ok=True)
    out = archive_dir / "AGENT_CRYPTO_BUILD_40_4_132_AUTO_CANONICAL.zip"
    with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for rel in files:
            zf.write(ROOT / rel, arcname=(ROOT / rel).as_posix())
    digest = sha(out)
    Path(str(out) + ".sha256").write_text(f"{digest}  {out.name}\n", encoding="utf-8")
    print(f"ARCHIVE {out} {digest}")


def main() -> None:
    guard_request()
    before = {}
    markers = ("setInterval(", "MutationObserver", "IntersectionObserver", "new WebSocket", "localStorage.setItem")
    for rel in ("app.js", "js/app.js"):
        text = (ROOT / rel).read_text(encoding="utf-8", errors="replace")
        before[rel] = {marker: text.count(marker) for marker in markers}

    patch_aether()
    patch_version_identity()
    synchronize_manifests()

    for rel in ("app.js", "js/app.js"):
        text = (ROOT / rel).read_text(encoding="utf-8", errors="replace")
        for marker in markers:
            if text.count(marker) > before[rel][marker]:
                raise SystemExit(f"STOP: budget runtime augmenté {rel} {marker}")

    validate()
    build_archive()


if __name__ == "__main__":
    main()
