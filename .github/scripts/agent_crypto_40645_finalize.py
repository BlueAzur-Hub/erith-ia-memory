from __future__ import annotations

import base64
import hashlib
import json
import re
import shutil
import zipfile
from datetime import datetime, timezone
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
ROOT = REPO / "public/agent_crypto_erith_ia/administrator"
STAGING = REPO / ".github/staging"
BUILD = "40.6.45"
PARENT = "40.6.44"
ENGINE = "38.15.11"
RELEASE = "AETHER FINAL EMBROIDERY · HQ BACKPLATE · TRUE EXPLICIT OPEN · TRUST NO-JUMP"
STATUS = "aether_final_embroidery_hq_backplate_true_explicit_open_trust_no_jump_406045"
ASSET = ROOT / "assets/aether/aether-observatory-empty-ui-406045.webp"
ASSET_SHA256 = "f934d7941dfd2992407649bfb7a3d568d47f55afd9eb309c1f5f9fbae159a7fc"
ASSET_SIZE = 221040
PART_GLOB = "aether_406045_q75.part*"
CSS_SOURCE = ROOT / "aether-406045.css"
CSS_CANON = ROOT / "admin-ribbons.css"


def must(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(message)


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    must(count == 1, f"{label}: expected 1 occurrence, got {count}")
    return text.replace(old, new, 1)


def assemble_asset() -> None:
    parts = sorted(STAGING.glob(PART_GLOB))
    must(len(parts) >= 2, f"backplate transport incomplete: {len(parts)} parts")
    encoded = "".join(p.read_text(encoding="utf-8").strip() for p in parts)
    image = base64.b64decode(encoded, validate=True)
    must(image[:4] == b"RIFF" and image[8:12] == b"WEBP", "assembled backplate is not WEBP")
    must(len(image) == ASSET_SIZE, f"backplate size mismatch: {len(image)} != {ASSET_SIZE}")
    digest = hashlib.sha256(image).hexdigest()
    must(digest == ASSET_SHA256, f"backplate sha mismatch: {digest}")
    ASSET.parent.mkdir(parents=True, exist_ok=True)
    ASSET.write_bytes(image)


def consolidate_css() -> None:
    base = CSS_CANON.read_text(encoding="utf-8")
    final = CSS_SOURCE.read_text(encoding="utf-8").strip() + "\n"
    marker = "/* 40.6.42 — AETHER COMPONENT FOUNDATION"
    idx = base.find(marker)
    must(idx >= 0, "40.6.42 Aether presentation marker missing")
    tail = base[idx:]
    must("40.6.43 — AETHER EMPTY BACKPLATE" in tail, "40.6.43 marker missing")
    must("40.6.44 — AETHER EXPLICIT OPEN GATE" in tail, "40.6.44 marker missing")
    base = base[:idx].rstrip() + "\n\n" + final
    must(base.count("FINAL SINGLE PRESENTATION OWNER") == 1, "single .45 CSS owner gate failed")
    must("40.6.42 — AETHER COMPONENT FOUNDATION" not in base, "legacy .42 presentation survived")
    must("40.6.43 — AETHER EMPTY BACKPLATE" not in base, "legacy .43 presentation survived")
    must("40.6.44 — AETHER EXPLICIT OPEN GATE" not in base, "legacy .44 presentation survived")
    CSS_CANON.write_text(base, encoding="utf-8", newline="\n")
    CSS_SOURCE.unlink()


def patch_aether_boot() -> None:
    path = ROOT / "js/aether.js"
    text = path.read_text(encoding="utf-8")
    must("40.6.45 — TRUE EXPLICIT OPEN AFTER WINDOW RESTORE" not in text, "Aether .45 boot patch already present")
    anchor = "  const api=Object.freeze({\n"
    must(text.count(anchor) == 1, "Aether API anchor not unique")
    patch = r'''  /* 40.6.45 — TRUE EXPLICIT OPEN AFTER WINDOW RESTORE
     Visibility is session-ephemeral. The Administrator Window Manager may restore
     geometry, but Aether must always boot hidden until a direct operator click. */
  function aetherBootClosed406045(){
    const panel=aetherPanelEnsure4084();
    if(!panel)return false;
    panel.dataset.aetherOperatorOpen406044="0";
    const button=document.getElementById("atlasAetherStatusToggle4084");
    if(button)button.setAttribute("aria-expanded","false");
    const manager=aetherNativeWindowManager406040();
    if(manager){
      panel.hidden=false;
      manager.hide("aether-watch",true);
    }else{
      panel.hidden=true;
    }
    document.documentElement.dataset.aetherExplicitBoot406045="closed";
    return true;
  }
  window.addEventListener("erith:administrator-mirror-ready",aetherBootClosed406045,{once:true,passive:true});
  queueMicrotask(()=>{try{if(aetherNativeWindowManager406040())aetherBootClosed406045();}catch(_){}});

'''
    text = text.replace(anchor, patch + anchor, 1)
    path.write_text(text, encoding="utf-8", newline="\n")


def patch_trust_no_jump() -> tuple[str, int]:
    # Preserve explicit Atlas MANUEL -> Trust -> Atlas. Only the Administration
    # entry is allowed to lose the implicit #local-ai-hub destination.
    candidates = []
    pattern = re.compile(r"atlasAccessOpen\(\s*([\"'])#local-ai-hub\1\s*\)")
    for path in [ROOT / "index.html", *ROOT.rglob("*.js")]:
        try:
            text = path.read_text(encoding="utf-8")
        except Exception:
            continue
        for match in pattern.finditer(text):
            before = text[max(0, match.start()-6000):match.start()]
            score = 0
            if "btnAdminAccountToggle" in before: score += 5
            if "atlasAdminAccountToggle" in before: score += 5
            if "Administration" in before: score += 1
            candidates.append((score, path, match.start(), match.end(), match.group(0)))
    must(candidates, "Trust no-jump: no atlasAccessOpen(#local-ai-hub) candidate found")
    candidates.sort(key=lambda row: row[0], reverse=True)
    best = candidates[0]
    must(best[0] >= 5, "Trust no-jump: could not prove Administration-owned target")
    must(sum(1 for row in candidates if row[0] == best[0]) == 1, "Trust no-jump: Administration target is ambiguous")
    _, path, start, end, _ = best
    text = path.read_text(encoding="utf-8")
    text = text[:start] + 'atlasAccessOpen("")' + text[end:]
    path.write_text(text, encoding="utf-8", newline="\n")
    return str(path.relative_to(REPO)), len(candidates)


def patch_index() -> None:
    p = ROOT / "index.html"
    text = p.read_text(encoding="utf-8")
    text = replace_once(text, '<meta name="atlas-build" content="40.6.44" />', '<meta name="atlas-build" content="40.6.45" />', "index atlas build")
    text = replace_once(text, '<meta name="administrator-build" content="40.6.44" />', '<meta name="administrator-build" content="40.6.45" />', "index admin build")
    text = replace_once(text, 'content="AETHER STABILIZATION · EXPLICIT OPERATOR OPEN · VISUAL 40.6.43 PRESERVED"', f'content="{RELEASE}"', "index release")
    text = replace_once(text, 'content="market-core-v2.0-alpha-build-40.6.44"', 'content="market-core-v2.0-alpha-build-40.6.45"', "index asset token")
    text = replace_once(text, 'Build 40.6.44 · Administrator', 'Build 40.6.45 · Administrator', "index title")
    text = replace_once(text, './admin-ribbons.css?v=administrator-build-40.6.44', './admin-ribbons.css?v=administrator-build-40.6.45', "ribbons cache")
    text = replace_once(text, './js/aether.js?v=administrator-build-40.6.44', './js/aether.js?v=administrator-build-40.6.45', "aether cache")
    p.write_text(text, encoding="utf-8", newline="\n")


def patch_json(path: Path, *, build_truth: bool = False) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    data["build"] = BUILD
    data["release"] = RELEASE
    data["status"] = STATUS
    data["asset_token"] = f"market-core-v2.0-alpha-build-{BUILD}"
    data["parent_build"] = PARENT
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    if "prepared_at" in data: data["prepared_at"] = now
    if "published_at" in data: data["published_at"] = now
    if "timestamp" in data: data["timestamp"] = now
    if build_truth:
        data["published"] = True
        data["administrator_build"] = BUILD
        data["build_label"] = f"Build {BUILD}"
        data["release_status"] = RELEASE
        cvt = data.get("current_version_truth")
        if isinstance(cvt, dict): cvt["loaded_build"] = BUILD
        data["cascade_40_6_45"] = {
            "parent_build": PARENT,
            "release": RELEASE,
            "presentation_owner": "admin-ribbons.css · single 40.6.45 Aether block",
            "backplate": "assets/aether/aether-observatory-empty-ui-406045.webp",
            "backplate_sha256": ASSET_SHA256,
            "backplate_dimensions": "1672x941",
            "nine_zone_radial_geometry": True,
            "same_canvas_window_and_f11": True,
            "transparent_live_dom_embroidery": True,
            "lotus_center_preserved": True,
            "explicit_operator_open_after_window_restore": True,
            "persisted_geometry_preserved": True,
            "persisted_visibility_forbidden": True,
            "administrator_trust_implicit_atlas_jump_removed": True,
            "explicit_atlas_manual_trust_route_preserved": True,
            "market_core": ENGINE,
            "market_core_modified": False,
            "graph_modified": False,
            "technical_reading_modified": False,
            "chronos_modified": False,
            "oracle_engine_modified": False,
            "workbench_modified": False,
            "new_recurring_timer": False,
            "new_observer": False,
            "new_network_owner": False,
            "new_storage_owner": False,
            "automatic_order": False,
            "real_order": False,
        }
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")


def release_notes(auth_file: str, auth_candidates: int) -> None:
    p = ROOT / "RELEASE_40_6_45.md"
    p.write_text(f"""# Agent-Crypto {BUILD} — {RELEASE}\n\nParent: {PARENT}  \nEngine: Market Core {ENGINE} (protected)\n\n## Final scope\n\n- One Aether presentation owner: `admin-ribbons.css`; legacy 40.6.42/43/44 Aether presentation blocks removed.\n- HQ empty backplate: `assets/aether/aether-observatory-empty-ui-406045.webp` · 1672×941 · SHA-256 `{ASSET_SHA256}`.\n- Nine live DOM zones aligned to the painted Observatory geometry; no second opaque card layer.\n- Lotus/central rings remain visible; Aether attention is text embroidery, not an opaque disk.\n- Window and F11 share the same 1672:941 coordinate canvas; only scale changes.\n- Aether is forced closed after Window Manager restore; geometry persists, visibility does not.\n- Plain Administration/Aether Trust no longer carries an implicit Atlas target. Explicit Atlas MANUEL authentication remains distinct.\n\nAuth owner patched: `{auth_file}` (candidates inspected: {auth_candidates}).\n\n## Protected\n\nMarket Core {ENGINE}, Graphique, Lecture Technique, Chronos, Oracle engine and Aether Workbench are outside this surgery. No automatic or real order path added.\n""", encoding="utf-8", newline="\n")


def make_zip() -> None:
    name = f"AGENT_CRYPTO_BUILD_40_6_45_AETHER_FINAL_EMBROIDERY_HQ_TRUE_OPEN_TRUST_NO_JUMP_CLEAN_UPLOAD_7_FILES.zip"
    zpath = ROOT / name
    items = [
        ROOT / "index.html",
        ROOT / "js/aether.js",
        ROOT / "admin-ribbons.css",
        ROOT / "build.json",
        ROOT / "administrator-version.json",
        ROOT / "version.json",
        ASSET,
    ]
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for item in items:
            z.write(item, item.relative_to(ROOT))
    (ROOT / f"{name}.sha256").write_text(f"{hashlib.sha256(zpath.read_bytes()).hexdigest()}  {name}\n", encoding="utf-8")


def main() -> None:
    must(ROOT.exists(), "Administrator root missing")
    assemble_asset()
    consolidate_css()
    patch_aether_boot()
    auth_file, auth_candidates = patch_trust_no_jump()
    patch_index()
    patch_json(ROOT / "build.json", build_truth=True)
    patch_json(ROOT / "administrator-version.json")
    patch_json(ROOT / "version.json")
    release_notes(auth_file, auth_candidates)
    make_zip()
    print(f"40.6.45 finalized · auth={auth_file} · candidates={auth_candidates}")


if __name__ == "__main__":
    main()
