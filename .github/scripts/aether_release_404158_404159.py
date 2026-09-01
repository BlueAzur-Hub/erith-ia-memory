from pathlib import Path
import hashlib
import json
import re
import struct
import sys
import zipfile
from datetime import datetime, timezone

ADMIN = Path("public/agent_crypto_erith_ia/administrator")
INDEX = ADMIN / "index.html"
ROOT_APP = ADMIN / "app.js"
MODULAR_APP = ADMIN / "js/app.js"
LAYOUT = ADMIN / "js/layout-repair.js"
MANIFESTS = [ADMIN / "version.json", ADMIN / "administrator-version.json"]
ARCHIVE_DIR = Path("coordination/inter_ai_dialogues/agent_crypto")
RND_ASSET_REL = "assets/visual/technical-reading/technical-random-10.png"
RND_ASSET = ADMIN / RND_ASSET_REL

STAGES = {
    "158": {
        "build": "40.4.158",
        "parent": "40.4.157",
        "release": "GRAPH DIRECT-FLOAT BODY PORTAL · GLOBAL STACKING LOCK",
        "status": "graph_direct_float_body_portal_global_stacking_lock",
        "lineage": "40.4.158 Graph direct-float body portal global stacking lock",
    },
    "159": {
        "build": "40.4.159",
        "parent": "40.4.158",
        "release": "TECHNICAL READING RND · AETHER OFFICE LIBRARY 10 LOCK",
        "status": "technical_reading_rnd_aether_office_library_10_lock",
        "lineage": "40.4.159 Technical Reading RND Aether office library 10 lock",
    },
}

GRAPH_PATCH = r'''

/* ==========================================================================
   40.4.158 — GRAPH DIRECT-FLOAT BODY PORTAL REPAIR
   ========================================================================== */
(() => {
  "use strict";

  /*
     PURPOSE
     - Keep Graphique + Lecture technique in viewport/global stacking coordinates.
     - Prevent Administrator sections (Analyse & décision / multi-horizon / Market)
       from crossing above the graph while the graph is moved.
     - Mirror the proven 40.4.156R1 Oracle body-portal strategy without changing
       the existing Window Manager drag, resize, persistence or z-order owner.

     CONTRACT
     - #analyste presentation/DOM placement only.
     - Body portal only while .admin-native-direct-floating is active.
     - Existing Window Manager remains drag, resize, persistence and z-order owner.
     - NO chart engine, Oracle, Market Core, Atlas, News, Simulation or fetch change.
     - One attribute-only observer scoped to #analyste class changes; no document observer.
  */

  const BUILD = "40.4.158";
  const GRAPH_ID = "analyste";
  const FLOAT_CLASS = "admin-native-direct-floating";
  let homeMarker = null;
  let classObserver = null;

  function fixedPx(value) {
    const number = Number(value);
    return `${Number.isFinite(number) ? Math.round(number * 100) / 100 : 0}px`;
  }

  function rememberHome(node) {
    if (!(node instanceof HTMLElement) || node.parentNode === document.body) return false;
    if (homeMarker?.parentNode) return true;
    homeMarker = document.createComment("agent-crypto-graph-home-40.4.158");
    node.parentNode?.insertBefore(homeMarker, node);
    return !!homeMarker.parentNode;
  }

  function portalFloatingGraph(node) {
    if (!(node instanceof HTMLElement) || !node.classList.contains(FLOAT_CLASS)) return false;
    if (node.parentNode === document.body) {
      node.dataset.graphDirectBodyPortal = BUILD;
      return true;
    }

    const rect = node.getBoundingClientRect();
    if (!rememberHome(node)) return false;

    // Preserve the exact visual rectangle while changing containing/stacking block.
    // Window Manager already assigned the floating z-index; as a direct body child
    // that z-index finally competes in the global workspace rather than a nested one.
    document.body.appendChild(node);
    node.style.setProperty("position", "fixed", "important");
    node.style.setProperty("left", fixedPx(rect.left), "important");
    node.style.setProperty("top", fixedPx(rect.top), "important");
    node.style.setProperty("right", "auto", "important");
    node.style.setProperty("bottom", "auto", "important");
    node.style.setProperty("width", fixedPx(rect.width), "important");
    node.style.setProperty("height", fixedPx(rect.height), "important");
    node.style.setProperty("transform", "none", "important");
    node.style.setProperty("isolation", "isolate", "important");
    node.dataset.graphDirectBodyPortal = BUILD;
    document.documentElement.dataset.graphDirectBodyPortal404158 = "active";
    return true;
  }

  function restoreDockedGraph(node) {
    if (!(node instanceof HTMLElement) || node.classList.contains(FLOAT_CLASS)) return false;
    if (!(homeMarker?.parentNode)) return false;

    const parent = homeMarker.parentNode;
    parent.insertBefore(node, homeMarker);
    homeMarker.remove();
    homeMarker = null;
    node.style.removeProperty("isolation");
    delete node.dataset.graphDirectBodyPortal;
    document.documentElement.dataset.graphDirectBodyPortal404158 = "docked";
    return true;
  }

  function reconcile(node = document.getElementById(GRAPH_ID)) {
    if (!(node instanceof HTMLElement)) return false;
    if (node.classList.contains(FLOAT_CLASS)) return portalFloatingGraph(node);
    return restoreDockedGraph(node);
  }

  function install() {
    const node = document.getElementById(GRAPH_ID);
    if (!(node instanceof HTMLElement)) return false;

    reconcile(node);
    if (!classObserver && typeof MutationObserver === "function") {
      classObserver = new MutationObserver(() => { try { reconcile(node); } catch (_) {} });
      classObserver.observe(node, { attributes: true, attributeFilter: ["class"] });
    }

    globalThis.ErithGraphDirectFloatRepair404158 = Object.freeze({
      build: BUILD,
      graph_id: GRAPH_ID,
      body_portal_only_while_floating: true,
      window_manager_remains_drag_owner: true,
      window_manager_remains_resize_owner: true,
      window_manager_remains_z_owner: true,
      observer_scope: "analyste-class-only",
      chart_engine_changed: false,
      oracle_changed: false,
      market_core_changed: false,
      atlas_changed: false,
      repair: () => reconcile(node),
      status: () => Object.freeze({
        floating: node.classList.contains(FLOAT_CLASS),
        body_child: node.parentNode === document.body,
        marker_present: !!homeMarker?.parentNode
      })
    });
    return true;
  }

  try { install(); } catch (_) {}
  queueMicrotask(() => { try { install(); } catch (_) {} });
  window.addEventListener("load", () => { try { install(); } catch (_) {} }, { once: true });
})();
'''


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def replace_once(text: str, pattern: str, replacement: str, label: str, flags: int = 0) -> str:
    output, count = re.subn(pattern, replacement, text, count=1, flags=flags)
    if count != 1:
        raise SystemExit(f"{label}: replacement count={count}, expected 1")
    return output


def current_build() -> str:
    data = json.loads((ADMIN / "version.json").read_text(encoding="utf-8"))
    return str(data.get("build") or "")


def patch_publication_identity(value, build: str, status: str):
    if isinstance(value, dict):
        for key, child in value.items():
            if key == "publication_identity" and isinstance(child, dict):
                child["build"] = build
                child["asset_token"] = f"market-core-v2.0-alpha-build-{build}"
                child["status"] = status
                if "app_sha256" in child:
                    child["app_sha256"] = sha256(ROOT_APP)
            else:
                patch_publication_identity(child, build, status)
    elif isinstance(value, list):
        for child in value:
            patch_publication_identity(child, build, status)


def bump_identity(build: str, release: str) -> None:
    html = INDEX.read_text(encoding="utf-8")
    html = replace_once(html, r'(<meta name="atlas-build" content=")[^"]+(" />)', rf'\g<1>{build}\2', "atlas meta")
    html = replace_once(html, r'(<meta name="administrator-build" content=")[^"]+(" />)', rf'\g<1>{build}\2', "administrator meta")
    html = replace_once(html, r'(<meta name="administrator-release" content=")[^"]+(" />)', rf'\g<1>{release}\2', "release meta")
    html = replace_once(html, r'(<meta name="atlas-asset-token" content=")[^"]+(" />)', rf'\g<1>market-core-v2.0-alpha-build-{build}\2', "asset token meta")
    html = replace_once(html, r'(<title>Agent-Crypto @erith\.IA — Build )40\.4\.\d+( · Administrator</title>)', rf'\g<1>{build}\2', "title")
    html = re.sub(r'(\?v=administrator-build-)40\.4\.\d+', rf'\g<1>{build}', html)
    html = re.sub(
        r"(Agent-Crypto @erith\.IA · Market Core · Build )40\.4\.\d+( · Version : Parker Lewis Can't Lose)",
        rf'\g<1>{build}\2',
        html,
    )
    INDEX.write_text(html, encoding="utf-8", newline="\n")

    root = ROOT_APP.read_text(encoding="utf-8")
    root = replace_once(root, r'const ATLAS_BUILD = "40\.4\.\d+";', f'const ATLAS_BUILD = "{build}";', "root ATLAS_BUILD")
    ROOT_APP.write_text(root, encoding="utf-8", newline="\n")

    modular = MODULAR_APP.read_text(encoding="utf-8")
    modular = replace_once(modular, r'const ADMIN_BUILD = "40\.4\.\d+";', f'const ADMIN_BUILD = "{build}";', "modular ADMIN_BUILD")
    modular = replace_once(modular, r'const ADMIN_RELEASE = "[^"]*";', f'const ADMIN_RELEASE = "{release}";', "modular ADMIN_RELEASE")
    MODULAR_APP.write_text(modular, encoding="utf-8", newline="\n")


def verify_preserved_contracts() -> None:
    layout = LAYOUT.read_text(encoding="utf-8")
    for token in (
        "40.4.156R1 — ORACLE DIRECT-FLOAT BODY PORTAL REPAIR",
        "window_manager_remains_drag_owner: true",
        "window_manager_remains_z_owner: true",
    ):
        if token not in layout:
            raise SystemExit(f"Oracle 40.4.156R1 preservation failed: {token}")

    index = INDEX.read_text(encoding="utf-8")
    if 'const RANDOM_LIBRARY=Object.freeze([' not in index:
        raise SystemExit("Technical Reading RND owner missing")
    if index.count('data-tech-random="1"') != 1:
        raise SystemExit("Technical Reading RND button contract changed")


def patch_graph_158() -> None:
    if current_build() != "40.4.157":
        raise SystemExit(f"40.4.158 expected parent 40.4.157, found {current_build()}")
    text = LAYOUT.read_text(encoding="utf-8")
    marker = "40.4.158 — GRAPH DIRECT-FLOAT BODY PORTAL REPAIR"
    if marker in text:
        raise SystemExit("40.4.158 graph patch already present before release")
    if "40.4.156R1 — ORACLE DIRECT-FLOAT BODY PORTAL REPAIR" not in text:
        raise SystemExit("Oracle body portal prerequisite missing")
    LAYOUT.write_text(text.rstrip() + GRAPH_PATCH + "\n", encoding="utf-8", newline="\n")


def verify_png(path: Path) -> tuple[int, int]:
    raw = path.read_bytes()
    if len(raw) < 24 or raw[:8] != b"\x89PNG\r\n\x1a\n":
        raise SystemExit("technical-random-10.png is not a valid PNG")
    width, height = struct.unpack(">II", raw[16:24])
    if (width, height) != (1080, 1920):
        raise SystemExit(f"technical-random-10.png unexpected dimensions: {width}x{height}")
    return width, height


def patch_rnd_159() -> None:
    if current_build() != "40.4.158":
        raise SystemExit(f"40.4.159 expected parent 40.4.158, found {current_build()}")
    if not RND_ASSET.is_file():
        raise SystemExit("technical-random-10.png missing before RND release")
    verify_png(RND_ASSET)

    text = INDEX.read_text(encoding="utf-8")
    if 'technical-random-10.png' in text:
        raise SystemExit("technical-random-10.png already registered")
    old = '    Object.freeze({file:"technical-random-09.png",label:"Archives de réflexion",x:50,y:41})\n  ]);'
    new = '    Object.freeze({file:"technical-random-09.png",label:"Archives de réflexion",x:50,y:41}),\n    Object.freeze({file:"technical-random-10.png",label:"Aether au bureau",x:50,y:40})\n  ]);'
    if text.count(old) != 1:
        raise SystemExit(f"RND library anchor count={text.count(old)}, expected 1")
    text = text.replace(old, new, 1)
    INDEX.write_text(text, encoding="utf-8", newline="\n")


def update_manifests(stage: str) -> None:
    cfg = STAGES[stage]
    build = cfg["build"]
    parent = cfg["parent"]
    release = cfg["release"]
    status = cfg["status"]
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")

    if stage == "158":
        key = "graph_direct_float_body_portal_404158"
        verification = {
            "build": build,
            "parent_build": parent,
            "graph_id": "analyste",
            "strategy": "body portal only while direct-floating",
            "global_stacking_context": True,
            "return_to_canonical_dom_on_dock": True,
            "window_manager_drag_owner_preserved": True,
            "window_manager_resize_owner_preserved": True,
            "window_manager_z_owner_preserved": True,
            "oracle_404156r1_preserved": True,
            "observer_scope": "analyste class attribute only",
            "new_timer": False,
            "new_fetch_owner": False,
            "chart_engine_changed": False,
            "market_core_changed": False,
            "atlas_changed": False,
            "news_changed": False,
            "simulation_changed": False,
        }
    else:
        key = "technical_reading_rnd_aether_404159"
        width, height = verify_png(RND_ASSET)
        verification = {
            "build": build,
            "parent_build": parent,
            "asset": RND_ASSET_REL,
            "asset_sha256": sha256(RND_ASSET),
            "asset_dimensions": f"{width}x{height}",
            "library_count": 10,
            "existing_rnd_button_reused": True,
            "one_click_one_image_preserved": True,
            "immediate_repeat_avoidance_preserved": True,
            "preload_before_swap_preserved": True,
            "auto_cycle_preserved": True,
            "new_menu": False,
            "new_button": False,
            "new_engine": False,
            "graph_404158_preserved": True,
            "oracle_404156r1_preserved": True,
            "market_core_changed": False,
            "atlas_changed": False,
            "news_changed": False,
            "simulation_changed": False,
        }

    for path in MANIFESTS:
        data = json.loads(path.read_text(encoding="utf-8"))
        data["build"] = build
        data["release"] = release
        data["asset_token"] = f"market-core-v2.0-alpha-build-{build}"
        data["status"] = status
        data["parent_build"] = parent
        data["prepared_at"] = now
        data["published_at"] = now
        if "global_versioning" in data:
            data["global_versioning"] = build

        lineage = str(data.get("lineage") or "")
        if cfg["lineage"] not in lineage:
            data["lineage"] = (lineage + " → " + cfg["lineage"]).strip(" →")

        files = data.setdefault("files", {})
        if stage == "159":
            files[RND_ASSET_REL] = sha256(RND_ASSET)
        for relative in list(files):
            candidate = ADMIN / relative
            if candidate.is_file() and candidate.resolve() != path.resolve():
                files[relative] = sha256(candidate)

        data.setdefault("verification", {})[key] = verification
        patch_publication_identity(data, build, status)
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")


def build_archive(stage: str) -> tuple[Path, Path, str]:
    build = STAGES[stage]["build"]
    manifest = json.loads((ADMIN / "version.json").read_text(encoding="utf-8"))
    files = list((manifest.get("files") or {}).keys())
    for required in ("version.json", "administrator-version.json"):
        if required not in files:
            files.append(required)

    missing = [relative for relative in files if not (ADMIN / relative).is_file()]
    if missing:
        raise SystemExit("Canonical archive missing files: " + ", ".join(missing))

    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    safe_build = build.replace(".", "_")
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


def release_158() -> None:
    verify_preserved_contracts()
    patch_graph_158()
    bump_identity(STAGES["158"]["build"], STAGES["158"]["release"])
    update_manifests("158")
    archive, digest_file, digest = build_archive("158")
    print("40.4.158 PATCH PASS")
    print("Graph direct-float body portal PASS")
    print("Oracle 40.4.156R1 PRESERVED")
    print(f"ARCHIVE={archive}")
    print(f"SHA_FILE={digest_file}")
    print(f"DIGEST={digest}")


def release_159() -> None:
    verify_preserved_contracts()
    layout = LAYOUT.read_text(encoding="utf-8")
    if "40.4.158 — GRAPH DIRECT-FLOAT BODY PORTAL REPAIR" not in layout:
        raise SystemExit("40.4.158 graph portal missing before 40.4.159")
    patch_rnd_159()
    bump_identity(STAGES["159"]["build"], STAGES["159"]["release"])
    update_manifests("159")
    archive, digest_file, digest = build_archive("159")
    index = INDEX.read_text(encoding="utf-8")
    if index.count('technical-random-10.png') != 1:
        raise SystemExit("RND 10 registration count invalid after release")
    print("40.4.159 PATCH PASS")
    print("Technical Reading RND library 10/10 PASS")
    print("Graph 40.4.158 PRESERVED")
    print("Oracle 40.4.156R1 PRESERVED")
    print(f"ARCHIVE={archive}")
    print(f"SHA_FILE={digest_file}")
    print(f"DIGEST={digest}")


def main() -> None:
    if len(sys.argv) != 2 or sys.argv[1] not in STAGES:
        raise SystemExit("usage: aether_release_404158_404159.py 158|159")
    stage = sys.argv[1]
    if stage == "158":
        release_158()
    else:
        release_159()


if __name__ == "__main__":
    main()
