#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import re
import zipfile

ROOT = Path("public/agent_crypto_erith_ia/administrator")
BUILD = "40.6.12"
PARENT = "40.6.11"
ENGINE = "38.15.11"
RELEASE = "ORACLE FX LIGHT SURFACE · PRICE TICK FLASH · CORE FREEZE"
STATUS = "oracle_fx_light_surface_price_tick_flash_core_freeze_406012"
TOKEN = f"market-core-v2.0-alpha-build-{BUILD}"
NOW = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def load(name: str) -> dict:
    data = json.loads((ROOT / name).read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise SystemExit(f"STOP 40.6.12: invalid JSON root {name}")
    return data


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


# ---------------------------------------------------------------------------
# PRE-SURGERY TRUTH / HARD FREEZE
# ---------------------------------------------------------------------------
if str(load("version.json").get("build") or "") != PARENT:
    raise SystemExit(f"STOP 40.6.12: expected parent {PARENT}")
if str(load("build.json").get("engine") or "") != ENGINE:
    raise SystemExit("STOP 40.6.12: Market Core drift before surgery")

index_path = ROOT / "index.html"
oracle_css_path = ROOT / "oracle-presentation-405010.css"
old_js_path = ROOT / "js/oracle-semantic-bias-406011.js"
fx_js_path = ROOT / "js/oracle-fx-406012.js"
chronos_path = ROOT / "admin-chronos.css"
version_truth_path = ROOT / "js/version-truth.js"
app_path = ROOT / "js/app.js"

chronos_before = chronos_path.read_bytes()
version_truth_before = version_truth_path.read_bytes()
app_before = app_path.read_bytes()
old_js_before = old_js_path.read_bytes()
chronos_sha = hashlib.sha256(chronos_before).hexdigest()
version_truth_sha = hashlib.sha256(version_truth_before).hexdigest()
app_sha = hashlib.sha256(app_before).hexdigest()

EXPECTED_VERSION_TRUTH_SHA = "749da2802a65a006928a96c44ff33d691233e3e80a8356bb9541dfc37d09e03a"
if version_truth_sha != EXPECTED_VERSION_TRUTH_SHA:
    raise SystemExit("STOP 40.6.12: Version Truth drift")
if b"40.4.107" not in chronos_before:
    raise SystemExit("STOP 40.6.12: Chronos validated checkpoint missing")

index = index_path.read_text(encoding="utf-8")
wide_grid_406010 = "grid-template-columns:minmax(128px,.66fr) minmax(124px,.66fr) minmax(170px,.94fr) minmax(255px,1.35fr) minmax(410px,2.05fr)!important;"
old_overflow_grid = "grid-template-columns:minmax(170px,.66fr) minmax(170px,.66fr) minmax(230px,.94fr) minmax(340px,1.35fr) minmax(520px,2.05fr)!important;"
if index.count(wide_grid_406010) != 1 or old_overflow_grid in index:
    raise SystemExit("STOP 40.6.12: validated 40.6.10 width contract drift")
if './js/version-truth.js?v=40.6.8' not in index:
    raise SystemExit("STOP 40.6.12: Version button frozen owner URL missing")
if './admin-chronos.css?v=administrator-build-40.6.9' not in index:
    raise SystemExit("STOP 40.6.12: Chronos frozen owner URL missing")

# ---------------------------------------------------------------------------
# ORACLE PRESENTATION OWNER — replace 40.6.11 semantic block, do not stack.
# ---------------------------------------------------------------------------
css = oracle_css_path.read_text(encoding="utf-8")
marker_11 = "/* ==========================================================================" + "\n   BUILD 40.6.11 — ORACLE SEMANTIC BIAS SURFACE"
pos = css.find(marker_11)
if pos < 0:
    raise SystemExit("STOP 40.6.12: 40.6.11 semantic block not found")
base_css = css[:pos].rstrip()

css_block = r'''

/* ==========================================================================
   BUILD 40.6.12 — ORACLE FX LIGHT SURFACE
   Presentation only. One local FX switch controls the semantic accent and
   real-price tick flash. Oracle math/canvas/model remain untouched.
   ========================================================================== */
#atlasOracleV0 .atlas-oracle-hero-head-406012{
  display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;
}
#atlasOracleV0 .atlas-oracle-hero-head-406012>small{
  display:block;font-size:8px;letter-spacing:.14em;text-transform:uppercase;color:#7fa0b2;font-weight:950;margin:0;
}
#atlasOracleV0 .atlas-oracle-fx-toggle-406012{
  display:inline-flex;align-items:center;gap:4px;min-width:0;padding:2px 6px;border-radius:999px;
  border:1px solid rgba(140,190,220,.20);background:rgba(7,18,28,.38);color:#a9bdc9;
  font:950 7.5px/1 system-ui,sans-serif;letter-spacing:.08em;cursor:pointer;
  box-shadow:none;transition:border-color .16s ease,background .16s ease,color .16s ease,opacity .16s ease;
}
#atlasOracleV0 .atlas-oracle-fx-toggle-406012:hover{border-color:rgba(117,222,255,.34);background:rgba(12,29,43,.55)}
#atlasOracleV0 .atlas-oracle-fx-dot-406012{font-size:8px;line-height:1;color:#72dfff;text-shadow:0 0 7px rgba(114,223,255,.28)}
#atlasOracleV0 .atlas-oracle-fx-toggle-406012[aria-pressed="false"]{opacity:.62;background:rgba(255,255,255,.025);border-color:rgba(255,255,255,.11)}
#atlasOracleV0 .atlas-oracle-fx-toggle-406012[aria-pressed="false"] .atlas-oracle-fx-dot-406012{color:#71818a;text-shadow:none}

/* FX ON: semantic signal is deliberately light — thin edge + small inner glow. */
body.atlas-administrator-mirror #atlasOracleV0 .atlas-oracle-readout[data-oracle-fx="on"],
body.atlas-admin-v3 #atlasOracleV0 .atlas-oracle-readout[data-oracle-fx="on"]{
  --oracle-fx-accent:#f2d18a;--oracle-fx-line:rgba(242,209,138,.34);--oracle-fx-soft:rgba(242,209,138,.025);
  border-color:var(--oracle-fx-line)!important;
  box-shadow:inset 2px 0 0 var(--oracle-fx-accent),inset 0 0 14px var(--oracle-fx-soft),0 10px 24px rgba(0,0,0,.20)!important;
  transition:border-color .16s ease,box-shadow .16s ease;
}
body.atlas-administrator-mirror #atlasOracleV0 .atlas-oracle-readout[data-oracle-fx="on"][data-oracle-bias-state="bull"],
body.atlas-admin-v3 #atlasOracleV0 .atlas-oracle-readout[data-oracle-fx="on"][data-oracle-bias-state="bull"]{
  --oracle-fx-accent:#69e89f;--oracle-fx-line:rgba(105,232,159,.35);--oracle-fx-soft:rgba(83,226,145,.022);
}
body.atlas-administrator-mirror #atlasOracleV0 .atlas-oracle-readout[data-oracle-fx="on"][data-oracle-bias-state="bear"],
body.atlas-admin-v3 #atlasOracleV0 .atlas-oracle-readout[data-oracle-fx="on"][data-oracle-bias-state="bear"]{
  --oracle-fx-accent:#ff8294;--oracle-fx-line:rgba(255,130,148,.35);--oracle-fx-soft:rgba(255,92,117,.022);
}

/* Only the hero receives a subtle semantic edge. Secondary cards stay native. */
body.atlas-administrator-mirror #atlasOracleV0 .atlas-oracle-readout[data-oracle-fx="on"] .atlas-oracle-hero,
body.atlas-admin-v3 #atlasOracleV0 .atlas-oracle-readout[data-oracle-fx="on"] .atlas-oracle-hero{
  border-color:color-mix(in srgb,var(--oracle-fx-accent) 34%,rgba(98,236,255,.16))!important;
  border-left-color:var(--oracle-fx-accent)!important;
  background:linear-gradient(115deg,var(--oracle-fx-soft),rgba(255,255,255,.018))!important;
}

/* Price base accent follows Oracle bias; tick flash itself follows real price movement. */
body.atlas-administrator-mirror #atlasOracleV0 .atlas-oracle-readout[data-oracle-fx="on"][data-oracle-bias-state="bull"] #atlasOraclePrice,
body.atlas-admin-v3 #atlasOracleV0 .atlas-oracle-readout[data-oracle-fx="on"][data-oracle-bias-state="bull"] #atlasOraclePrice{
  color:#a9f7c8!important;text-shadow:0 0 8px rgba(105,232,159,.16)!important;
}
body.atlas-administrator-mirror #atlasOracleV0 .atlas-oracle-readout[data-oracle-fx="on"][data-oracle-bias-state="bear"] #atlasOraclePrice,
body.atlas-admin-v3 #atlasOracleV0 .atlas-oracle-readout[data-oracle-fx="on"][data-oracle-bias-state="bear"] #atlasOraclePrice{
  color:#ffb0bd!important;text-shadow:0 0 8px rgba(255,130,148,.16)!important;
}
body.atlas-administrator-mirror #atlasOracleV0 .atlas-oracle-readout[data-oracle-fx="on"][data-oracle-bias-state="neutral"] #atlasOraclePrice,
body.atlas-admin-v3 #atlasOracleV0 .atlas-oracle-readout[data-oracle-fx="on"][data-oracle-bias-state="neutral"] #atlasOraclePrice{
  color:#f4fbff!important;text-shadow:none!important;
}

/* FX OFF: original Oracle presentation wins naturally; no semantic override. */
#atlasOracleV0 .atlas-oracle-readout[data-oracle-fx="off"]{box-shadow:none}
'''
oracle_css_path.write_text(base_css + css_block, encoding="utf-8")

# ---------------------------------------------------------------------------
# INDEX — real button in the Oracle hero header, replace 40.6.11 reader with 40.6.12 FX owner.
# ---------------------------------------------------------------------------
old_header = '<div class="atlas-oracle-hero">\n                <small>Lecture Oracle</small>'
new_header = '''<div class="atlas-oracle-hero">\n                <div class="atlas-oracle-hero-head-406012">\n                  <small>Lecture Oracle</small>\n                  <button id="atlasOracleFxToggle406012" class="atlas-oracle-fx-toggle-406012" type="button" aria-pressed="true" title="Effets Oracle : ON"><span>FX</span><span class="atlas-oracle-fx-dot-406012" aria-hidden="true">●</span></button>\n                </div>'''
if index.count(old_header) != 1:
    raise SystemExit("STOP 40.6.12: Oracle hero header owner not uniquely found")
index = index.replace(old_header, new_header, 1)

replacements = {
    '<meta name="atlas-build" content="40.6.11" />': '<meta name="atlas-build" content="40.6.12" />',
    '<meta name="administrator-build" content="40.6.11" />': '<meta name="administrator-build" content="40.6.12" />',
    '<meta name="administrator-release" content="ORACLE SEMANTIC BIAS SURFACE · CHRONOS/VERSION/WIDTH FREEZE" />': f'<meta name="administrator-release" content="{RELEASE}" />',
    '<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.11" />': f'<meta name="atlas-asset-token" content="{TOKEN}" />',
    '<title>Agent-Crypto @erith.IA — Build 40.6.11 · Administrator</title>': '<title>Agent-Crypto @erith.IA — Build 40.6.12 · Administrator</title>',
    '<link rel="stylesheet" href="./oracle-presentation-405010.css?v=administrator-build-40.6.11" />': '<link rel="stylesheet" href="./oracle-presentation-405010.css?v=administrator-build-40.6.12" />',
    '<script defer src="./js/oracle-semantic-bias-406011.js?v=administrator-build-40.6.11"></script>': '<script defer src="./js/oracle-fx-406012.js?v=administrator-build-40.6.12"></script>',
}
for old, new in replacements.items():
    if old not in index:
        raise SystemExit(f"STOP 40.6.12: missing index token: {old}")
    index = index.replace(old, new, 1)

index, n1 = re.subn(r'(id="atlasVersionTruthControl"[\s\S]{0,700}?aria-label="Version Agent-Crypto installée : Build )[^,\"]+(, mode Administrator\")', r'\g<1>40.6.12\g<2>', index, count=1)
index, n2 = re.subn(r'(<span id="atlasVersionTruthText">Build )[^<]+(</span>)', r'\g<1>40.6.12\g<2>', index, count=1)
if n1 != 1 or n2 != 1:
    raise SystemExit(f"STOP 40.6.12: first-paint version badge mismatch {n1}/{n2}")
index_path.write_text(index, encoding="utf-8")

# ---------------------------------------------------------------------------
# ORACLE FX JS — presentation only, no market/model owner.
# ---------------------------------------------------------------------------
js = r'''(() => {
  "use strict";
  const BUILD = "40.6.12";
  const STORAGE_KEY = "agent_crypto_oracle_fx_enabled_v1";
  const root = () => document.getElementById("atlasOracleV0");
  const readout = () => root()?.querySelector(".atlas-oracle-readout") || null;
  const bull = () => document.getElementById("atlasOracleBull");
  const price = () => document.getElementById("atlasOraclePrice");
  const toggle = () => document.getElementById("atlasOracleFxToggle406012");
  let bullObserver = null;
  let priceObserver = null;
  let lastPrice = null;

  function readEnabled() {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw === null ? true : raw === "1"; }
    catch (_) { return true; }
  }
  function writeEnabled(value) {
    try { localStorage.setItem(STORAGE_KEY, value ? "1" : "0"); } catch (_) {}
  }
  function readBullStrength(text) {
    const m = String(text || "").replace(",", ".").match(/Force\s+(-?\d+(?:\.\d+)?)\s*\/\s*100/i);
    if (!m) return null;
    const value = Number(m[1]);
    return Number.isFinite(value) ? value : null;
  }
  function biasState(score) {
    if (score === null || score === 50) return "neutral";
    return score > 50 ? "bull" : "bear";
  }
  function parsePrice(text) {
    let raw = String(text || "").replace(/[\s\u00a0\u202f]/g, "").replace(/[^0-9,.-]/g, "");
    if (!raw) return null;
    if (raw.includes(",")) raw = raw.replace(/\./g, "").replace(",", ".");
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  }
  function applyBias() {
    const ro = readout(), b = bull();
    if (!ro || !b) return false;
    const score = readBullStrength(b.textContent);
    ro.dataset.oracleBiasState = biasState(score);
    if (score === null) delete ro.dataset.oracleBiasScore;
    else ro.dataset.oracleBiasScore = String(score);
    return true;
  }
  function applyEnabled(enabled = readEnabled()) {
    const ro = readout(), btn = toggle();
    if (ro) ro.dataset.oracleFx = enabled ? "on" : "off";
    if (btn) {
      btn.setAttribute("aria-pressed", enabled ? "true" : "false");
      btn.title = enabled ? "Effets Oracle : ON" : "Effets Oracle : OFF";
    }
    return enabled;
  }
  function flashPrice(next) {
    const el = price();
    if (!el || next === null) return false;
    const previous = lastPrice;
    lastPrice = next;
    if (previous === null || next === previous || !readEnabled()) return false;
    const up = next > previous;
    if (typeof el.animate === "function") {
      el.getAnimations?.().forEach(animation => animation.cancel());
      el.animate([
        { color: up ? "#7dffad" : "#ff879b", textShadow: up ? "0 0 12px rgba(88,255,157,.68)" : "0 0 12px rgba(255,93,122,.68)" },
        { color: "", textShadow: "" }
      ], { duration: 360, easing: "ease-out" });
    }
    el.dataset.oraclePriceTick = up ? "up" : "down";
    return true;
  }
  function syncPrice() { return flashPrice(parsePrice(price()?.textContent)); }
  function bind() {
    const ro = readout(), b = bull(), p = price(), btn = toggle();
    if (!ro || !b || !p || !btn) return false;
    applyBias();
    applyEnabled(readEnabled());
    lastPrice = parsePrice(p.textContent);

    if (btn.dataset.oracleFxBound406012 !== "1") {
      btn.dataset.oracleFxBound406012 = "1";
      btn.addEventListener("click", () => {
        const next = !readEnabled();
        writeEnabled(next);
        applyEnabled(next);
      });
    }
    if (!bullObserver) {
      bullObserver = new MutationObserver(applyBias);
      bullObserver.observe(b, { childList: true, subtree: true, characterData: true });
    }
    if (!priceObserver) {
      priceObserver = new MutationObserver(syncPrice);
      priceObserver.observe(p, { childList: true, subtree: true, characterData: true });
    }
    document.documentElement.dataset.oracleFx406012 = "ready";
    return true;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind, { once: true });
  else bind();

  globalThis.ErithOracleFx406012 = Object.freeze({
    build: BUILD,
    bind,
    apply_bias: applyBias,
    apply_enabled: applyEnabled,
    enabled: readEnabled,
    rule: ">50 bull · =50 neutral · <50 bear",
    price_flash_source: "real rendered #atlasOraclePrice tick",
    presentation_only: true,
    oracle_model_modified: false,
    oracle_canvas_modified: false,
    network_request_added: false,
    recurring_timer_added: false
  });
})();
'''
for forbidden in ("fetch(", "WebSocket(", "setInterval(", "setTimeout(", "requestAnimationFrame("):
    if forbidden in js:
        raise SystemExit(f"STOP 40.6.12: forbidden runtime owner {forbidden}")
fx_js_path.write_text(js, encoding="utf-8")

# ---------------------------------------------------------------------------
# RELEASE NOTE
# ---------------------------------------------------------------------------
release_path = ROOT / "RELEASE_40_6_12.md"
release_path.write_text(f'''# Agent-Crypto @erith.IA — Build {BUILD}\n\n## {RELEASE}\n\nParent: **{PARENT}**  \nMarket Core: **{ENGINE} protected**\n\n### Destination\nAlléger la colorimétrie Oracle de 40.6.11 et ajouter un contrôle local **FX ●** sans toucher au moteur Oracle.\n\n### Contrat FX\n- Mini bouton **FX ●** placé dans le header `LECTURE ORACLE`.\n- **ON par défaut**, persistant localement.\n- FX OFF restaure la présentation Oracle native : aucun halo sémantique et aucun flash prix.\n- Biais Oracle : `>50` vert léger, `=50` neutre, `<50` rouge léger.\n- Le biais ne recolore plus toute la colonne : fine bordure + halo intérieur discret + hero seulement.\n- Le **prix Oracle** prend une teinte de base selon le biais, puis effectue un flash court **vert si le prix réel monte / rouge s'il baisse**.\n- Les cartes `Oracle hausse` et `Oracle baisse` gardent leurs couleurs natives indépendantes.\n\n### Anti-destruction\n- Oracle math/model/canvas : inchangés.\n- `js/app.js` : byte-for-byte.\n- Chronos 40.6.9 : byte-for-byte.\n- Version Truth 40.6.8 : byte-for-byte.\n- Dashboard width contract 40.6.10 : conservé.\n- Market Core 38.15.11 : inchangé.\n- Aucun fetch/WebSocket/timer récurrent ajouté.\n\n### Preuve Firefox\n1. `FX ●` visible à droite de `LECTURE ORACLE`.\n2. FX ON : bordure/hero légèrement vert, or ou rouge selon le score Oracle.\n3. Le prix change légèrement de teinte avec le biais et flashe brièvement au tick réel.\n4. FX OFF : retour visuel natif, sans flash ; les calculs continuent normalement.\n5. Rechargement : l'état FX est conservé localement.\n''', encoding="utf-8")

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
    if "administrator_build" in data: data["administrator_build"] = BUILD
    if "build_label" in data: data["build_label"] = f"Build {BUILD}"
    if "release_status" in data: data["release_status"] = RELEASE
    for key in ("timestamp", "prepared_at", "published_at"):
        if key in data: data[key] = NOW
    truth = data.get("current_version_truth")
    if not isinstance(truth, dict): raise SystemExit(f"STOP 40.6.12: missing current_version_truth in {name}")
    truth["loaded_build"] = BUILD
    data["cascade_40_6_12"] = {
        "parent_build": PARENT,
        "release": RELEASE,
        "scope": "oracle_fx_presentation_only",
        "fx_toggle": "FX ●",
        "fx_default": "ON",
        "fx_storage_key": "agent_crypto_oracle_fx_enabled_v1",
        "semantic_rule": {"bull": ">50", "neutral": "=50", "bear": "<50"},
        "price_tick_flash": "real rendered price; up green, down red",
        "oracle_model_modified": False,
        "oracle_canvas_modified": False,
        "oracle_numeric_values_modified": False,
        "old_406011_reader_unreferenced": True,
        "market_core_modified": False,
        "app_js_modified": False,
        "app_js_sha256": app_sha,
        "width_contract_406010_preserved": True,
        "chronos_modified": False,
        "chronos_sha256": chronos_sha,
        "version_truth_js_modified": False,
        "version_truth_js_sha256": version_truth_sha,
        "new_network_owner": False,
        "new_recurring_timer": False,
        "new_storage_owner": True,
        "storage_scope": "single boolean FX preference only",
        "paper_strategy_modified": False,
        "real_order": False,
    }

for name in ("build.json", "administrator-version.json"):
    (ROOT / name).write_text(json.dumps(docs[name], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

version = docs["version.json"]
files = version.get("files")
if not isinstance(files, dict): files = {}; version["files"] = files
for rel in (
    "index.html", "oracle-presentation-405010.css", "js/oracle-fx-406012.js",
    "admin-chronos.css", "js/version-truth.js", "js/app.js",
    "build.json", "administrator-version.json", "RELEASE_40_6_12.md",
):
    files[rel] = sha256(ROOT / rel)
if isinstance(version.get("integrity"), dict) and isinstance(version["integrity"].get("files"), int):
    version["integrity"]["files"] = len(files)
(ROOT / "version.json").write_text(json.dumps(version, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# ---------------------------------------------------------------------------
# HARD PROOFS
# ---------------------------------------------------------------------------
if chronos_path.read_bytes() != chronos_before: raise SystemExit("STOP 40.6.12: Chronos changed")
if version_truth_path.read_bytes() != version_truth_before: raise SystemExit("STOP 40.6.12: Version Truth changed")
if app_path.read_bytes() != app_before: raise SystemExit("STOP 40.6.12: js/app.js changed")
if old_js_path.read_bytes() != old_js_before: raise SystemExit("STOP 40.6.12: 40.6.11 reader changed")

final_index = index_path.read_text(encoding="utf-8")
if final_index.count(wide_grid_406010) != 1 or old_overflow_grid in final_index: raise SystemExit("STOP 40.6.12: width contract drift")
if final_index.count('id="atlasOracleFxToggle406012"') != 1: raise SystemExit("STOP 40.6.12: FX button wiring failed")
if final_index.count('./js/oracle-fx-406012.js?v=administrator-build-40.6.12') != 1: raise SystemExit("STOP 40.6.12: FX JS wiring failed")
if 'oracle-semantic-bias-406011.js?v=' in final_index: raise SystemExit("STOP 40.6.12: old 40.6.11 reader still active")
final_css = oracle_css_path.read_text(encoding="utf-8")
if "BUILD 40.6.11 — ORACLE SEMANTIC BIAS SURFACE" in final_css: raise SystemExit("STOP 40.6.12: stacked 40.6.11 semantic CSS remains")
if final_css.count("BUILD 40.6.12 — ORACLE FX LIGHT SURFACE") != 1: raise SystemExit("STOP 40.6.12: FX CSS owner missing")

for name in ("build.json", "administrator-version.json", "version.json"):
    if str(load(name).get("build") or "") != BUILD: raise SystemExit(f"STOP 40.6.12: build drift {name}")
if str(load("build.json").get("engine") or "") != ENGINE: raise SystemExit("STOP 40.6.12: Market Core drift")

# ---------------------------------------------------------------------------
# CLEAN UPLOAD — exactly seven release files.
# ---------------------------------------------------------------------------
outdir = Path("coordination/inter_ai_dialogues/agent_crypto")
outdir.mkdir(parents=True, exist_ok=True)
out = outdir / "AGENT_CRYPTO_BUILD_40_6_12_ORACLE_FX_LIGHT_SURFACE_CLEAN_UPLOAD_7_FILES.zip"
rels = [
    "index.html", "oracle-presentation-405010.css", "js/oracle-fx-406012.js",
    "build.json", "administrator-version.json", "version.json", "RELEASE_40_6_12.md",
]
with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for rel in rels:
        archive.write(ROOT / rel, (Path("public/agent_crypto_erith_ia/administrator") / rel).as_posix())
digest = sha256(out)
Path(str(out) + ".sha256").write_text(f"{digest}  {out.name}\n", encoding="utf-8")

print(json.dumps({
    "ok": True, "build": BUILD, "parent": PARENT, "release": RELEASE,
    "scope": "Oracle FX presentation only", "fx": "FX ●", "market_core": ENGINE,
    "chronos_sha256": chronos_sha, "version_truth_sha256": version_truth_sha,
    "app_js_sha256": app_sha, "zip": out.as_posix(), "sha256": digest,
}, ensure_ascii=False))
