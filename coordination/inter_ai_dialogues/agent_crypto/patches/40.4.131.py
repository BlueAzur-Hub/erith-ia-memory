from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import re
import subprocess
import zipfile

ROOT = Path("public/agent_crypto_erith_ia/administrator")
REQUEST = Path("coordination/inter_ai_dialogues/agent_crypto/patches/40.4.131.request.json")
SELF = Path("coordination/inter_ai_dialogues/agent_crypto/patches/40.4.131.py")
BUILD = "40.4.131"
PARENT = "40.4.130"
RELEASE = "AETHER 12-STORY READING FLOW · SYSTEM AFTER BATCH · RESPONSIVE AUTH TRUTH PANEL LOCK"
STATUS = "candidate_aether_12_story_reading_flow_responsive_auth_operator_validation_required"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def replace_once(path: Path, old: str, new: str, label: str) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"STOP: {label} attendu 1 occurrence, trouvé {count}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


def guard_request() -> None:
    req = json.loads(REQUEST.read_text(encoding="utf-8"))
    if req.get("build") != BUILD or req.get("parent_build") != PARENT:
        raise SystemExit("STOP: requête 40.4.131 invalide")
    current = json.loads((ROOT / "version.json").read_text(encoding="utf-8"))
    if current.get("build") != PARENT:
        raise SystemExit(f"STOP: parent build attendu {PARENT}, trouvé {current.get('build')}")


def patch_ribbons() -> None:
    path = ROOT / "admin-ribbons.css"
    replace_once(
        path,
        "   Outer cadence remains 30 s NORMAL · 15 s INFO · 36 s FEED · 9 s SYSTEM = 90 s.\n   Inside the 36 s FEED phase, the 40.4.112 9 s CSS pulse is preserved unchanged.\n   40.4.114 changes News French production quality only; Aether cadence and geometry are untouched.",
        "   40.4.131 cadence: 30 s NORMAL · 15 s INFO · 216 s VEILLE (12 × 18 s) · 9 s SYSTEM = 270 s.\n   The first visible pulse only arms the feed; eleven later pulses advance through stories 2→12.\n   CPU/GPU/RAM therefore cannot interrupt the twelve-story reading batch.",
        "Aether cadence comment",
    )
    old_keyframes = (
        "@keyframes atlasStatusNativePhase{\n"
        "  0%,33.332%{opacity:1;visibility:visible}\n"
        "  33.333%,100%{opacity:0;visibility:hidden}\n"
        "}\n"
        "@keyframes atlasAetherBandPhase{\n"
        "  0%,33.332%{opacity:0;visibility:hidden}\n"
        "  33.333%,100%{opacity:1;visibility:visible}\n"
        "}\n"
        "@keyframes atlasAetherInfoPhase{\n"
        "  0%,33.332%{opacity:0;visibility:hidden}\n"
        "  33.333%,49.999%{opacity:1;visibility:visible}\n"
        "  50%,100%{opacity:0;visibility:hidden}\n"
        "}\n"
        "@keyframes atlasAetherVeillePhase{\n"
        "  0%,49.999%{opacity:0;visibility:hidden}\n"
        "  50%,89.999%{opacity:1;visibility:visible}\n"
        "  90%,100%{opacity:0;visibility:hidden}\n"
        "}\n"
        "@keyframes atlasAetherSystemPhase{\n"
        "  0%,89.999%{opacity:0;visibility:hidden}\n"
        "  90%,100%{opacity:1;visibility:visible}\n"
        "}"
    )
    new_keyframes = (
        "@keyframes atlasStatusNativePhase{\n"
        "  0%,11.110%{opacity:1;visibility:visible}\n"
        "  11.111%,100%{opacity:0;visibility:hidden}\n"
        "}\n"
        "@keyframes atlasAetherBandPhase{\n"
        "  0%,11.110%{opacity:0;visibility:hidden}\n"
        "  11.111%,100%{opacity:1;visibility:visible}\n"
        "}\n"
        "@keyframes atlasAetherInfoPhase{\n"
        "  0%,11.110%{opacity:0;visibility:hidden}\n"
        "  11.111%,16.666%{opacity:1;visibility:visible}\n"
        "  16.667%,100%{opacity:0;visibility:hidden}\n"
        "}\n"
        "@keyframes atlasAetherVeillePhase{\n"
        "  0%,16.666%{opacity:0;visibility:hidden}\n"
        "  16.667%,96.666%{opacity:1;visibility:visible}\n"
        "  96.667%,100%{opacity:0;visibility:hidden}\n"
        "}\n"
        "@keyframes atlasAetherSystemPhase{\n"
        "  0%,96.666%{opacity:0;visibility:hidden}\n"
        "  96.667%,100%{opacity:1;visibility:visible}\n"
        "}"
    )
    replace_once(path, old_keyframes, new_keyframes, "Aether phase keyframes")
    replace_once(path, "The FEED pulse stays at 9 s; short overflows stay still.", "The VEILLE pulse is 18 s; short overflows stay still.", "marquee pulse comment")
    for old, new, label in (
        ("animation:atlasStatusNativePhase 90s steps(1,end) infinite!important;", "animation:atlasStatusNativePhase 270s steps(1,end) infinite!important;", "native 270s"),
        ("animation:atlasAetherBandPhase 90s steps(1,end) infinite!important;", "animation:atlasAetherBandPhase 270s steps(1,end) infinite!important;", "band 270s"),
        ("animation:atlasAetherInfoPhase 90s steps(1,end) infinite!important;", "animation:atlasAetherInfoPhase 270s steps(1,end) infinite!important;", "info 270s"),
        ("atlasAetherVeillePhase 90s steps(1,end) infinite,\n      atlasAetherFeedPulse40112 9s 4.5s steps(1,end) infinite!important;", "atlasAetherVeillePhase 270s steps(1,end) infinite,\n      atlasAetherFeedPulse40112 18s 9s steps(1,end) infinite!important;", "veille 12-story phase"),
        ("animation:atlasAetherSystemPhase 90s steps(1,end) infinite!important;", "animation:atlasAetherSystemPhase 270s steps(1,end) infinite!important;", "system 270s"),
    ):
        replace_once(path, old, new, label)


def patch_aether() -> None:
    path = ROOT / "js/aether.js"
    replace_once(path, "  Build: 40.4.130", "  Build: 40.4.131", "Aether header build")
    replace_once(
        path,
        "  Revision: 40.4.130 Aether semantic-lane recovery. The rejected 40.4.129 global INFO marquee is retired. INFO returns to fixed semantic owners Atlas / Oracle / Sources / Book in the same physical lane; VEILLE alone owns long scrolling News text. 40.4.121 constant-read-speed VEILLE, 40.4.125 canonical French News, 40.4.127 canonical deduplication, 40.4.128 representative family selection and 40.4.129 continuous 12-story cursor are preserved.",
        "  Revision: 40.4.131 Aether 12-story reading-flow lock. NORMAL 30 s -> INFO 15 s -> VEILLE 12 × 18 s -> SYSTEM 9 s. The entry pulse only arms VEILLE visibility; the next eleven pulses advance through the remaining eleven stories, so CPU/GPU/RAM cannot interrupt the batch. 40.4.130 semantic INFO owners and the constant-speed News marquee are preserved.",
        "Aether revision",
    )
    replace_once(
        path,
        "        if(visible){\n          aetherVeilleState4087.feedWasVisible=true;\n          aetherVeilleAdvance4087();\n        }else if(aetherVeilleState4087.feedWasVisible){",
        "        if(visible){\n          // 40.4.131 — first visible pulse arms the batch; story 1 keeps its full reading slot.\n          if(!aetherVeilleState4087.feedWasVisible){\n            aetherVeilleState4087.feedWasVisible=true;\n            return;\n          }\n          aetherVeilleAdvance4087();\n        }else if(aetherVeilleState4087.feedWasVisible){",
        "first visible pulse guard",
    )
    replace_once(path, '    build:"40.4.130",', '    build:"40.4.131",', "Aether API build")
    replace_once(path, "    veille_feed_pulse_seconds:9,", "    veille_feed_pulse_seconds:18,", "Aether pulse API")
    replace_once(path, "    cadence_seconds:90,", "    cadence_seconds:270,", "Aether cadence API")
    replace_once(path, "    veille_seconds:36,", "    veille_seconds:216,", "Aether veille API")
    replace_once(
        path,
        "    system_seconds:9,",
        "    system_seconds:9,\n    veille_full_batch_before_system:true,\n    veille_first_visible_pulse_advances:false,",
        "Aether batch contract",
    )


def patch_version_truth() -> None:
    replace_once(ROOT / "app.js", 'const ATLAS_BUILD = "40.4.130";', 'const ATLAS_BUILD = "40.4.131";', "ATLAS_BUILD")
    replace_once(ROOT / "js/app.js", '  const ADMIN_BUILD = "40.4.130";', '  const ADMIN_BUILD = "40.4.131";', "ADMIN_BUILD")
    index = ROOT / "index.html"
    for old, new, label in (
        ('<meta name="atlas-build" content="40.4.130" />', '<meta name="atlas-build" content="40.4.131" />', "index atlas-build"),
        ('<meta name="administrator-build" content="40.4.130" />', '<meta name="administrator-build" content="40.4.131" />', "index administrator-build"),
        ('<meta name="administrator-release" content="AETHER INFORMATION ONLY · NO DISCLAIMER RIBBON · CONTEXT LABEL DEDUP · VERSION TRUTH LOCK" />', f'<meta name="administrator-release" content="{RELEASE}" />', "index release"),
        ('<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.4.130" />', '<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.4.131" />', "index asset token"),
        ('<title>Agent-Crypto @erith.IA — Build 40.4.130 · Administrator</title>', '<title>Agent-Crypto @erith.IA — Build 40.4.131 · Administrator</title>', "index title"),
        ("./admin-ribbons.css?v=administrator-build-40.4.130", "./admin-ribbons.css?v=administrator-build-40.4.131", "ribbons cache token"),
    ):
        replace_once(index, old, new, label)


def patch_auth_responsive() -> None:
    path = ROOT / "index.html"
    text = path.read_text(encoding="utf-8")
    pattern = re.compile(
        r"@media \(max-width:1180px\)\{\s*"
        r"\.atlas-access-portal-grid-40380\{inset:78px 24px 74px;grid-template-columns:minmax\(330px,44%\) 1fr\}"
        r"\.atlas-access-truth-panel-40380\{display:none\}"
        r"\.atlas-access-system-signals-40382>span:first-child\{display:none\}"
        r"\.atlas-access-modules-40382\{left:24px;right:24px;bottom:16px;grid-template-columns:repeat\(5,minmax\(0,1fr\)\)\}"
        r"\.atlas-access-modules-40382 span:nth-child\(n\+6\)\{display:none\}"
        r"\.atlas-access-portal-shade-40380\{background:linear-gradient\(90deg,rgba\(1,8,14,.93\) 0 43%,rgba\(1,8,14,.06\) 58% 100%\),linear-gradient\(180deg,rgba\(1,6,10,.34\),transparent 22% 78%,rgba\(1,6,10,.54\)\)\}\s*"
        r"\}"
    )
    replacement = (
        "@media (max-width:1180px){\n"
        "      .atlas-access-portal-grid-40380{inset:78px 24px 74px;grid-template-columns:minmax(330px,1.08fr) minmax(278px,.92fr);gap:18px}\n"
        "      .atlas-access-live-panel-40380{grid-column:1;min-width:0}\n"
        "      .atlas-access-door-clearance-40380{display:none!important}\n"
        "      .atlas-access-truth-panel-40380{display:grid!important;grid-column:2;align-self:center;margin:0;min-width:0}\n"
        "      .atlas-access-system-signals-40382>span:first-child{display:none}\n"
        "      .atlas-access-modules-40382{left:24px;right:24px;bottom:16px;grid-template-columns:repeat(5,minmax(0,1fr))}\n"
        "      .atlas-access-modules-40382 span:nth-child(n+6){display:none}\n"
        "      .atlas-access-portal-shade-40380{background:linear-gradient(90deg,rgba(1,8,14,.93) 0 44%,rgba(1,8,14,.16) 56% 66%,rgba(1,8,14,.88) 79% 100%),linear-gradient(180deg,rgba(1,6,10,.34),transparent 22% 78%,rgba(1,6,10,.54))}\n"
        "    }"
    )
    text, count = pattern.subn(replacement, text, count=1)
    if count != 1:
        raise SystemExit(f"STOP: responsive auth owner attendu 1 occurrence, trouvé {count}")
    path.write_text(text, encoding="utf-8")


def sync_manifests() -> None:
    prepared = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    feature = {
        "build": BUILD,
        "normal_seconds": 30,
        "info_seconds": 15,
        "veille_story_count": 12,
        "veille_seconds_per_story": 18,
        "veille_seconds_total": 216,
        "system_seconds": 9,
        "cadence_seconds": 270,
        "first_visible_pulse_advances": False,
        "system_interrupts_story_batch": False,
        "marquee_constant_speed_px_s": 72,
        "responsive_auth_truth_panel_hidden_at_1180": False,
        "responsive_auth_layout_1180": "two-column auth + truth; decorative door column released",
        "mobile_truth_panel_preserved": True,
        "market_core_changed": False,
        "graph_changed": False,
        "atlas_current_changed": False,
        "oracle_changed": False,
        "bridge_changed": False,
        "news_source_pipeline_changed": False,
        "new_recurring_timer": False,
        "new_observer": False,
        "new_network_owner": False,
    }
    note = (
        "40.4.131 — AETHER 12-STORY READING FLOW · SYSTEM AFTER BATCH · RESPONSIVE AUTH TRUTH PANEL LOCK: "
        "VEILLE keeps one complete twelve-story batch at 18 seconds per story before the 9-second System phase; "
        "the first visible CSS pulse only arms the feed and does not consume story 1. At <=1180 CSS px the authentication sas becomes two-column Auth + Vérité opérateur, "
        "releasing only the decorative door column instead of hiding the truth panel. Market Core 38.15.11, graph, CURRENT, Atlas, Oracle, Bridge and News source pipeline are unchanged."
    )
    app_sha = sha(ROOT / "app.js")

    def update(path: Path, admin_hash: str | None = None) -> None:
        d = json.loads(path.read_text(encoding="utf-8"))
        d["build"] = BUILD
        d["release"] = RELEASE
        d["status"] = STATUS
        d["prepared_at"] = prepared
        d["published_at"] = None
        d["global_versioning"] = BUILD
        d["asset_token"] = f"market-core-v2.0-alpha-build-{BUILD}"
        d["parent_build"] = PARENT
        suffix = "40.4.131 Aether 12-story reading flow + System-after-batch + responsive auth truth panel lock"
        if isinstance(d.get("lineage"), str) and suffix not in d["lineage"]:
            d["lineage"] += " → " + suffix
        integrity = d.setdefault("integrity", {})
        pi = integrity.setdefault("publication_identity", {})
        pi["build"] = BUILD
        pi["asset_token"] = f"market-core-v2.0-alpha-build-{BUILD}"
        pi["status"] = STATUS
        pi["app_sha256"] = app_sha
        if admin_hash is not None:
            pi["administrator_version_sha256"] = admin_hash
        integrity["aether_12_story_reading_flow_responsive_auth_404131"] = feature.copy()
        d.setdefault("features", {})["aether_12_story_reading_flow_responsive_auth_404131"] = feature.copy()
        files = d.setdefault("files", {})
        for rel in list(files):
            target = ROOT / rel
            if not target.is_file():
                raise SystemExit(f"STOP: fichier manifest absent {rel}")
            files[rel] = sha(target)
        notes = d.setdefault("release_notes", [])
        if not notes or notes[0] != note:
            notes.insert(0, note)
        d.setdefault("validation", {}).update(
            {
                "aether_12_story_batch_404131_required": True,
                "aether_story_read_seconds_404131_expected": 18,
                "aether_system_after_full_batch_404131_expected": True,
                "auth_truth_panel_visible_under_1180_404131_expected": True,
                "market_core_38_15_11_non_regression_404131_required": True,
            }
        )
        path.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    admin = ROOT / "administrator-version.json"
    update(admin)
    update(ROOT / "version.json", sha(admin))


def validate() -> None:
    for rel in ("app.js", "js/app.js", "js/aether.js"):
        subprocess.run(["node", "--check", str(ROOT / rel)], check=True)
    css = (ROOT / "admin-ribbons.css").read_text(encoding="utf-8")
    js = (ROOT / "js/aether.js").read_text(encoding="utf-8")
    idx = (ROOT / "index.html").read_text(encoding="utf-8")
    app = (ROOT / "app.js").read_text(encoding="utf-8")
    admin_js = (ROOT / "js/app.js").read_text(encoding="utf-8")
    required_css = (
        "atlasStatusNativePhase 270s",
        "atlasAetherBandPhase 270s",
        "atlasAetherInfoPhase 270s",
        "atlasAetherVeillePhase 270s",
        "atlasAetherFeedPulse40112 18s 9s",
        "atlasAetherSystemPhase 270s",
        "16.667%,96.666%{opacity:1;visibility:visible}",
        "96.667%,100%{opacity:1;visibility:visible}",
    )
    if not all(token in css for token in required_css):
        raise SystemExit("STOP: contrat cadence CSS 40.4.131 incomplet")
    if "veille_feed_pulse_seconds:18" not in js or "veille_seconds:216" not in js or "cadence_seconds:270" not in js:
        raise SystemExit("STOP: contrat runtime Aether 40.4.131 incomplet")
    if "if(!aetherVeilleState4087.feedWasVisible)" not in js or "veille_first_visible_pulse_advances:false" not in js:
        raise SystemExit("STOP: first-pulse guard absent")
    if ".atlas-access-truth-panel-40380{display:grid!important;grid-column:2" not in idx:
        raise SystemExit("STOP: Vérité opérateur responsive absente")
    if "inset:78px 24px 74px;grid-template-columns:minmax(330px,44%) 1fr}.atlas-access-truth-panel-40380{display:none}" in idx:
        raise SystemExit("STOP: ancien masquage Vérité opérateur encore actif")
    if 'const ATLAS_BUILD = "40.4.131";' not in app or 'const ADMIN_BUILD = "40.4.131";' not in admin_js:
        raise SystemExit("STOP: version runtime non alignée")
    if '<meta name="atlas-build" content="40.4.131" />' not in idx or "administrator-build-40.4.131" not in idx:
        raise SystemExit("STOP: index version truth faux")
    ids = re.findall(r'\bid=["\']([^"\']+)["\']', idx)
    if len(ids) != len(set(ids)):
        raise SystemExit("STOP: IDs HTML dupliqués")
    for fn in ("administrator-version.json", "version.json"):
        d = json.loads((ROOT / fn).read_text(encoding="utf-8"))
        if d.get("build") != BUILD:
            raise SystemExit(f"STOP: build faux {fn}")
        if d.get("asset_token") != f"market-core-v2.0-alpha-build-{BUILD}":
            raise SystemExit(f"STOP: asset token faux {fn}")
        if str((d.get("engine") or {}).get("reference_build")) != "38.15.11":
            raise SystemExit("STOP: Market Core modifié")
        for rel, expected in (d.get("files") or {}).items():
            p = ROOT / rel
            if not p.is_file() or sha(p) != expected:
                raise SystemExit(f"STOP: hash faux {rel}")
    vd = json.loads((ROOT / "version.json").read_text(encoding="utf-8"))
    if vd["integrity"]["publication_identity"].get("administrator_version_sha256") != sha(ROOT / "administrator-version.json"):
        raise SystemExit("STOP: chaîne administrator-version SHA incorrecte")
    subprocess.run(["git", "diff", "--check"], check=True)


def build_archive() -> tuple[Path, Path]:
    manifest = json.loads((ROOT / "version.json").read_text(encoding="utf-8"))
    files = list((manifest.get("files") or {}).keys())
    for required in ("version.json", "administrator-version.json"):
        if required not in files:
            files.append(required)
    outdir = Path("coordination/inter_ai_dialogues/agent_crypto")
    outdir.mkdir(parents=True, exist_ok=True)
    out = outdir / "AGENT_CRYPTO_BUILD_40_4_131_AUTO_CANONICAL.zip"
    with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for rel in files:
            src = ROOT / rel
            if not src.is_file():
                raise SystemExit(f"STOP: archive source absente {rel}")
            zf.write(src, arcname=(Path("public/agent_crypto_erith_ia/administrator") / rel).as_posix())
    sha_path = Path(str(out) + ".sha256")
    sha_path.write_text(f"{sha(out)}  {out.name}\n", encoding="utf-8")
    return out, sha_path


def main() -> None:
    guard_request()
    patch_ribbons()
    patch_aether()
    patch_version_truth()
    patch_auth_responsive()
    sync_manifests()
    validate()
    archive, digest = build_archive()
    print(f"PASS {BUILD} · 12-story reading flow · System after batch · responsive auth truth panel")
    print(archive)
    print(digest)
    REQUEST.unlink()
    SELF.unlink()


if __name__ == "__main__":
    main()
