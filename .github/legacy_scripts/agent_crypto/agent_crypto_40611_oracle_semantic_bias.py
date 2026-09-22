#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import re
import zipfile

ROOT = Path("public/agent_crypto_erith_ia/administrator")
BUILD = "40.6.11"
PARENT = "40.6.10"
ENGINE = "38.15.11"
RELEASE = "ORACLE SEMANTIC BIAS SURFACE · CHRONOS/VERSION/WIDTH FREEZE"
STATUS = "oracle_semantic_bias_surface_chronos_version_width_freeze_406011"
TOKEN = f"market-core-v2.0-alpha-build-{BUILD}"
NOW = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def load(name: str) -> dict:
    data = json.loads((ROOT / name).read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise SystemExit(f"STOP 40.6.11: invalid JSON root {name}")
    return data


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


# ---------------------------------------------------------------------------
# PRE-SURGERY TRUTH / FREEZE
# ---------------------------------------------------------------------------
current = load("version.json")
if str(current.get("build") or "") != PARENT:
    raise SystemExit(f"STOP 40.6.11: expected parent {PARENT}, found {current.get('build')}")
if str(load("build.json").get("engine") or "") != ENGINE:
    raise SystemExit("STOP 40.6.11: Market Core drift before surgery")

version_truth_path = ROOT / "js/version-truth.js"
chronos_path = ROOT / "admin-chronos.css"
app_path = ROOT / "js/app.js"
index_path = ROOT / "index.html"
oracle_css_path = ROOT / "oracle-presentation-405010.css"
oracle_bias_js_path = ROOT / "js/oracle-semantic-bias-406011.js"

version_truth_before = version_truth_path.read_bytes()
chronos_before = chronos_path.read_bytes()
app_before = app_path.read_bytes()
version_truth_sha_before = hashlib.sha256(version_truth_before).hexdigest()
chronos_sha_before = hashlib.sha256(chronos_before).hexdigest()
app_sha_before = hashlib.sha256(app_before).hexdigest()

EXPECTED_VERSION_TRUTH_SHA = "749da2802a65a006928a96c44ff33d691233e3e80a8356bb9541dfc37d09e03a"
if version_truth_sha_before != EXPECTED_VERSION_TRUTH_SHA:
    raise SystemExit("STOP 40.6.11: Version Truth drift")
if b"40.4.107" not in chronos_before:
    raise SystemExit("STOP 40.6.11: Chronos checkpoint owner missing")

index = index_path.read_text(encoding="utf-8")
wide_grid_406010 = "grid-template-columns:minmax(128px,.66fr) minmax(124px,.66fr) minmax(170px,.94fr) minmax(255px,1.35fr) minmax(410px,2.05fr)!important;"
old_overflow_grid = "grid-template-columns:minmax(170px,.66fr) minmax(170px,.66fr) minmax(230px,.94fr) minmax(340px,1.35fr) minmax(520px,2.05fr)!important;"
if index.count(wide_grid_406010) != 1 or old_overflow_grid in index:
    raise SystemExit("STOP 40.6.11: validated 40.6.10 width contract not present")

# ---------------------------------------------------------------------------
# ORACLE SEMANTIC BIAS — PRESENTATION ONLY
# Existing Oracle already renders `Force N/100` in #atlasOracleBull.
# This layer mirrors that canonical rendered value into a presentation state:
# >50 bull, =50 neutral, <50 bear. No forecasting/math/network/storage owner.
# ---------------------------------------------------------------------------
css = oracle_css_path.read_text(encoding="utf-8")
marker = "BUILD 40.6.11 — ORACLE SEMANTIC BIAS SURFACE"
if marker in css:
    raise SystemExit("STOP 40.6.11: Oracle semantic bias CSS already present")

css_block = r'''

/* ==========================================================================
   BUILD 40.6.11 — ORACLE SEMANTIC BIAS SURFACE
   Presentation only. The state is mirrored from the existing rendered
   Oracle bullStrength readout: >50 bull, =50 neutral, <50 bear.
   Scope: Lecture Oracle column only. Canvas/model/runtime remain untouched.
   ========================================================================== */
body.atlas-administrator-mirror #atlasOracleV0 .atlas-oracle-readout[data-oracle-bias-state],
body.atlas-admin-v3 #atlasOracleV0 .atlas-oracle-readout[data-oracle-bias-state] {
  --oracle-bias-accent:#f4d386;
  --oracle-bias-soft:rgba(244,211,134,.08);
  --oracle-bias-line:rgba(244,211,134,.34);
  transition:box-shadow .18s ease,border-color .18s ease,background-color .18s ease;
}

body.atlas-administrator-mirror #atlasOracleV0 .atlas-oracle-readout[data-oracle-bias-state="bull"],
body.atlas-admin-v3 #atlasOracleV0 .atlas-oracle-readout[data-oracle-bias-state="bull"] {
  --oracle-bias-accent:#69e89f;
  --oracle-bias-soft:rgba(83,226,145,.085);
  --oracle-bias-line:rgba(105,232,159,.42);
}
body.atlas-administrator-mirror #atlasOracleV0 .atlas-oracle-readout[data-oracle-bias-state="neutral"],
body.atlas-admin-v3 #atlasOracleV0 .atlas-oracle-readout[data-oracle-bias-state="neutral"] {
  --oracle-bias-accent:#f4d386;
  --oracle-bias-soft:rgba(244,211,134,.08);
  --oracle-bias-line:rgba(244,211,134,.38);
}
body.atlas-administrator-mirror #atlasOracleV0 .atlas-oracle-readout[data-oracle-bias-state="bear"],
body.atlas-admin-v3 #atlasOracleV0 .atlas-oracle-readout[data-oracle-bias-state="bear"] {
  --oracle-bias-accent:#ff7589;
  --oracle-bias-soft:rgba(255,92,117,.085);
  --oracle-bias-line:rgba(255,117,137,.42);
}

/* State accent: no geometry change, no canvas spill. */
body.atlas-administrator-mirror #atlasOracleV0 .atlas-oracle-readout[data-oracle-bias-state],
body.atlas-admin-v3 #atlasOracleV0 .atlas-oracle-readout[data-oracle-bias-state] {
  border-color:var(--oracle-bias-line)!important;
  box-shadow:
    inset 3px 0 0 var(--oracle-bias-accent),
    inset 0 0 24px var(--oracle-bias-soft),
    0 12px 30px rgba(0,0,0,.24)!important;
}

/* Existing hero/runtime/micro cards inherit only a subtle semantic edge.
   Native Oracle hausse/baisse cards remain independently green/red. */
body.atlas-administrator-mirror #atlasOracleV0 .atlas-oracle-readout[data-oracle-bias-state] .atlas-oracle-hero,
body.atlas-admin-v3 #atlasOracleV0 .atlas-oracle-readout[data-oracle-bias-state] .atlas-oracle-hero {
  border-left-color:var(--oracle-bias-accent)!important;
  border-color:color-mix(in srgb,var(--oracle-bias-accent) 42%,rgba(98,236,255,.16))!important;
  background:linear-gradient(115deg,var(--oracle-bias-soft),rgba(255,255,255,.018))!important;
}
body.atlas-administrator-mirror #atlasOracleV0 .atlas-oracle-readout[data-oracle-bias-state] .atlas-oracle-runtime-40232d,
body.atlas-administrator-mirror #atlasOracleV0 .atlas-oracle-readout[data-oracle-bias-state] .atlas-oracle-stethoscope-40232d,
body.atlas-admin-v3 #atlasOracleV0 .atlas-oracle-readout[data-oracle-bias-state] .atlas-oracle-runtime-40232d,
body.atlas-admin-v3 #atlasOracleV0 .atlas-oracle-readout[data-oracle-bias-state] .atlas-oracle-stethoscope-40232d,
body.atlas-administrator-mirror #atlasOracleV0 .atlas-oracle-readout[data-oracle-bias-state] .atlas-oracle-micro,
body.atlas-admin-v3 #atlasOracleV0 .atlas-oracle-readout[data-oracle-bias-state] .atlas-oracle-micro {
  border-color:color-mix(in srgb,var(--oracle-bias-accent) 31%,rgba(98,236,255,.12))!important;
}

/* Secondary reading cells become easier to scan without becoming signals. */
body.atlas-administrator-mirror #atlasOracleV0 .atlas-oracle-readout[data-oracle-bias-state] .atlas-oracle-metric,
body.atlas-administrator-mirror #atlasOracleV0 .atlas-oracle-readout[data-oracle-bias-state] .atlas-oracle-horizon-cell,
body.atlas-administrator-mirror #atlasOracleV0 .atlas-oracle-readout[data-oracle-bias-state] .atlas-oracle-lab-mini,
body.atlas-admin-v3 #atlasOracleV0 .atlas-oracle-readout[data-oracle-bias-state] .atlas-oracle-metric,
body.atlas-admin-v3 #atlasOracleV0 .atlas-oracle-readout[data-oracle-bias-state] .atlas-oracle-horizon-cell,
body.atlas-admin-v3 #atlasOracleV0 .atlas-oracle-readout[data-oracle-bias-state] .atlas-oracle-lab-mini {
  border-color:color-mix(in srgb,var(--oracle-bias-accent) 18%,rgba(255,255,255,.08))!important;
}

/* Active horizon gets the same accent, but numerical content is untouched. */
body.atlas-administrator-mirror #atlasOracleV0 .atlas-oracle-readout[data-oracle-bias-state] .atlas-oracle-horizon-cell[data-active="true"],
body.atlas-admin-v3 #atlasOracleV0 .atlas-oracle-readout[data-oracle-bias-state] .atlas-oracle-horizon-cell[data-active="true"] {
  border-color:var(--oracle-bias-line)!important;
  box-shadow:inset 0 0 0 1px var(--oracle-bias-soft)!important;
}

/* Do not let the dominant-bias accent erase the two native force cards. */
body.atlas-administrator-mirror #atlasOracleV0 .atlas-oracle-readout .atlas-oracle-card.is-bull,
body.atlas-admin-v3 #atlasOracleV0 .atlas-oracle-readout .atlas-oracle-card.is-bull {
  border-color:rgba(168,255,98,.38)!important;
}
body.atlas-administrator-mirror #atlasOracleV0 .atlas-oracle-readout .atlas-oracle-card.is-bear,
body.atlas-admin-v3 #atlasOracleV0 .atlas-oracle-readout .atlas-oracle-card.is-bear {
  border-color:rgba(255,105,121,.34)!important;
}
'''
oracle_css_path.write_text(css + css_block, encoding="utf-8")

js = r'''(() => {
  "use strict";
  const BUILD = "40.6.11";
  const ROOT_ID = "atlasOracleV0";
  const BULL_ID = "atlasOracleBull";
  let observer = null;

  function readBullStrength(text) {
    const match = String(text || "").replace(",", ".").match(/Force\s+(-?\d+(?:\.\d+)?)\s*\/\s*100/i);
    if (!match) return null;
    const value = Number(match[1]);
    return Number.isFinite(value) ? value : null;
  }

  function stateFromScore(score) {
    if (score === null) return "neutral";
    if (score > 50) return "bull";
    if (score < 50) return "bear";
    return "neutral";
  }

  function apply() {
    const root = document.getElementById(ROOT_ID);
    const bull = document.getElementById(BULL_ID);
    const readout = root?.querySelector(".atlas-oracle-readout");
    if (!root || !bull || !readout) return false;
    const score = readBullStrength(bull.textContent);
    const state = stateFromScore(score);
    root.dataset.oracleBiasState = state;
    readout.dataset.oracleBiasState = state;
    if (score === null) delete readout.dataset.oracleBiasScore;
    else readout.dataset.oracleBiasScore = String(score);
    return true;
  }

  function bind() {
    if (!apply()) return false;
    if (observer) return true;
    const bull = document.getElementById(BULL_ID);
    if (!bull) return false;
    observer = new MutationObserver(apply);
    observer.observe(bull, { childList: true, subtree: true, characterData: true });
    document.documentElement.dataset.oracleSemanticBias406011 = "ready";
    return true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind, { once: true });
  } else {
    bind();
  }

  globalThis.ErithOracleSemanticBias406011 = Object.freeze({
    build: BUILD,
    apply,
    rule: ">50 bull · =50 neutral · <50 bear",
    source: "#atlasOracleBull rendered Force N/100",
    presentation_only: true,
    oracle_model_modified: false,
    network_request_added: false,
    timer_added: false,
    storage_write_added: false
  });
})();
'''
if any(token in js for token in ("fetch(", "WebSocket(", "setInterval(", "setTimeout(", "localStorage", "sessionStorage", "requestAnimationFrame(")):
    raise SystemExit("STOP 40.6.11: forbidden runtime owner in semantic bias layer")
oracle_bias_js_path.write_text(js, encoding="utf-8")

# ---------------------------------------------------------------------------
# INDEX — identity + cache-bust changed Oracle CSS + deferred semantic reader.
# ---------------------------------------------------------------------------
replacements = {
    '<meta name="atlas-build" content="40.6.10" />': '<meta name="atlas-build" content="40.6.11" />',
    '<meta name="administrator-build" content="40.6.10" />': '<meta name="administrator-build" content="40.6.11" />',
    '<meta name="administrator-release" content="DASHBOARD HEADER WIDTH CONTRACT · CHRONOS/VERSION FREEZE" />': f'<meta name="administrator-release" content="{RELEASE}" />',
    '<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.10" />': f'<meta name="atlas-asset-token" content="{TOKEN}" />',
    '<title>Agent-Crypto @erith.IA — Build 40.6.10 · Administrator</title>': '<title>Agent-Crypto @erith.IA — Build 40.6.11 · Administrator</title>',
    '<link rel="stylesheet" href="./oracle-presentation-405010.css?v=administrator-build-40.5.23" />': '<link rel="stylesheet" href="./oracle-presentation-405010.css?v=administrator-build-40.6.11" />\n  <script defer src="./js/oracle-semantic-bias-406011.js?v=administrator-build-40.6.11"></script>',
}
for old, new in replacements.items():
    if old not in index:
        raise SystemExit(f"STOP 40.6.11: missing index token: {old}")
    index = index.replace(old, new, 1)

if './js/version-truth.js?v=40.6.8' not in index:
    raise SystemExit("STOP 40.6.11: frozen Version Truth URL missing")
if './admin-chronos.css?v=administrator-build-40.6.9' not in index:
    raise SystemExit("STOP 40.6.11: frozen Chronos URL missing")

index, n1 = re.subn(
    r'(id="atlasVersionTruthControl"[\s\S]{0,700}?aria-label="Version Agent-Crypto installée : Build )[^,\"]+(, mode Administrator\")',
    r'\g<1>40.6.11\g<2>', index, count=1,
)
index, n2 = re.subn(
    r'(<span id="atlasVersionTruthText">Build )[^<]+(</span>)',
    r'\g<1>40.6.11\g<2>', index, count=1,
)
if n1 != 1 or n2 != 1:
    raise SystemExit(f"STOP 40.6.11: first-paint badge mismatch {n1}/{n2}")
index_path.write_text(index, encoding="utf-8")

# ---------------------------------------------------------------------------
# RELEASE NOTE
# ---------------------------------------------------------------------------
release_path = ROOT / "RELEASE_40_6_11.md"
release_path.write_text(f'''# Agent-Crypto @erith.IA — Build {BUILD}\n\n## {RELEASE}\n\nParent: **{PARENT}**  \nMarket Core: **{ENGINE} protected**\n\n### Cible\nRendre le biais Oracle lisible immédiatement dans **la colonne Lecture Oracle uniquement**, sans créer de second moteur, sans toucher au canvas et sans modifier le calcul de scénario.\n\n### Règle sémantique\nLa source reste la valeur Oracle déjà rendue dans `#atlasOracleBull` (`Force N/100`), issue du `bullStrength` existant :\n- `> 50` → accent **haussier / vert** ;\n- `= 50` → accent **neutre / or** ;\n- `< 50` → accent **baissier / rouge**.\n\nLe texte de régime (`MIXTE`, etc.) et toutes les valeurs numériques restent autoritaires. La couleur est une aide de lecture, **pas un signal de trading**.\n\n### Chirurgie 40.6.11\n- `oracle-presentation-405010.css` reste le propriétaire de présentation Oracle ; ajout d'un bloc colorimétrique strictement scoped à `.atlas-oracle-readout`.\n- Nouveau lecteur passif `js/oracle-semantic-bias-406011.js` : il observe uniquement le texte déjà rendu de `#atlasOracleBull` et pose `data-oracle-bias-state`.\n- Aucun timer, fetch, WebSocket, storage ou calcul prédictif ajouté.\n- Les cartes natives **Oracle hausse** et **Oracle baisse** gardent leurs couleurs propres vert/rouge.\n- Canvas Oracle, courbes, historique, horizons, Evidence, V2 shadow, Atlas, Aerith et modèle mathématique inchangés.\n- **40.6.10 width contract gelé** : minimum structurel 1111 px conservé.\n- **Chronos 40.6.9 gelé byte-for-byte**.\n- **Version Truth 40.6.8 gelé byte-for-byte**.\n- Strategy A / `js/app.js` gelé byte-for-byte.\n\n### Preuve Firefox attendue\nAvec la valeur visible de ton exemple `Oracle hausse Force 48/100`, la colonne Lecture Oracle doit prendre un accent **baissier rouge** car `48 < 50`, tandis que la carte Hausse reste verte et la carte Baisse rouge. À `>50`, l'accent global passe vert ; à `50`, il devient neutre/or.\n''', encoding="utf-8")

# ---------------------------------------------------------------------------
# MANIFESTS
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
        raise SystemExit(f"STOP 40.6.11: missing current_version_truth in {name}")
    truth["loaded_build"] = BUILD

    data["cascade_40_6_11"] = {
        "parent_build": PARENT,
        "release": RELEASE,
        "scope": "oracle_readout_semantic_bias_presentation_only",
        "semantic_source": "existing #atlasOracleBull Force N/100",
        "semantic_rule": {"bull": ">50", "neutral": "=50", "bear": "<50"},
        "oracle_presentation_owner": "oracle-presentation-405010.css",
        "passive_dom_mirror": "js/oracle-semantic-bias-406011.js",
        "oracle_model_modified": False,
        "oracle_canvas_modified": False,
        "oracle_numeric_values_modified": False,
        "oracle_bull_bear_native_cards_preserved": True,
        "market_core_modified": False,
        "strategy_a_modified": False,
        "app_js_modified": False,
        "app_js_sha256": app_sha_before,
        "width_contract_406010_preserved": True,
        "width_minimum_px": 1111,
        "chronos_modified": False,
        "chronos_sha256": chronos_sha_before,
        "version_truth_js_modified": False,
        "version_truth_js_sha256": version_truth_sha_before,
        "new_recurring_timer": False,
        "new_network_owner": False,
        "new_storage_owner": False,
        "new_observer": True,
        "observer_scope": "#atlasOracleBull text mutations only",
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
    "oracle-presentation-405010.css",
    "js/oracle-semantic-bias-406011.js",
    "admin-chronos.css",
    "js/version-truth.js",
    "js/app.js",
    "build.json",
    "administrator-version.json",
    "RELEASE_40_6_11.md",
):
    files[rel] = sha256(ROOT / rel)
if isinstance(version.get("integrity"), dict) and isinstance(version["integrity"].get("files"), int):
    version["integrity"]["files"] = len(files)
(ROOT / "version.json").write_text(json.dumps(version, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# ---------------------------------------------------------------------------
# HARD PROOFS
# ---------------------------------------------------------------------------
if version_truth_path.read_bytes() != version_truth_before:
    raise SystemExit("STOP 40.6.11: Version Truth bytes changed")
if chronos_path.read_bytes() != chronos_before:
    raise SystemExit("STOP 40.6.11: Chronos bytes changed")
if app_path.read_bytes() != app_before:
    raise SystemExit("STOP 40.6.11: js/app.js bytes changed")

final_index = index_path.read_text(encoding="utf-8")
if final_index.count(wide_grid_406010) != 1 or old_overflow_grid in final_index:
    raise SystemExit("STOP 40.6.11: 40.6.10 width contract drift")
if final_index.count('./js/oracle-semantic-bias-406011.js?v=administrator-build-40.6.11') != 1:
    raise SystemExit("STOP 40.6.11: semantic bias script wiring proof failed")
if final_index.count('./oracle-presentation-405010.css?v=administrator-build-40.6.11') != 1:
    raise SystemExit("STOP 40.6.11: Oracle CSS cache owner proof failed")

final_css = oracle_css_path.read_text(encoding="utf-8")
if final_css.count(marker) != 1:
    raise SystemExit("STOP 40.6.11: semantic CSS marker proof failed")
final_js = oracle_bias_js_path.read_text(encoding="utf-8")
for token in ('score > 50', 'score < 50', 'return "neutral"', 'MutationObserver(apply)'):
    if token not in final_js:
        raise SystemExit(f"STOP 40.6.11: semantic JS proof missing {token}")
for name in ("build.json", "administrator-version.json", "version.json"):
    if str(load(name).get("build") or "") != BUILD:
        raise SystemExit(f"STOP 40.6.11: build drift {name}")
if str(load("build.json").get("engine") or "") != ENGINE:
    raise SystemExit("STOP 40.6.11: Market Core drift")

# ---------------------------------------------------------------------------
# CLEAN UPLOAD — exactly seven release files.
# ---------------------------------------------------------------------------
outdir = Path("coordination/inter_ai_dialogues/agent_crypto")
outdir.mkdir(parents=True, exist_ok=True)
out = outdir / "AGENT_CRYPTO_BUILD_40_6_11_ORACLE_SEMANTIC_BIAS_SURFACE_CLEAN_UPLOAD_7_FILES.zip"
rels = [
    "index.html",
    "oracle-presentation-405010.css",
    "js/oracle-semantic-bias-406011.js",
    "build.json",
    "administrator-version.json",
    "version.json",
    "RELEASE_40_6_11.md",
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
    "release": RELEASE,
    "semantic_rule": ">50 bull | =50 neutral | <50 bear",
    "scope": "Oracle readout only",
    "chronos_sha256": chronos_sha_before,
    "version_truth_sha256": version_truth_sha_before,
    "app_js_sha256": app_sha_before,
    "market_core": ENGINE,
    "zip": out.as_posix(),
    "sha256": digest,
}, ensure_ascii=False))
