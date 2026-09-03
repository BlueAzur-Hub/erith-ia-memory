#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path("public/agent_crypto_erith_ia/administrator")
PAR = ROOT / "js/parallel-markets.js"
READING = ROOT / "js/market-reading-depth.js"
CSS = ROOT / "parallel-markets.css"
BUILD_JSON = ROOT / "build.json"
PROMPT = Path("coordination/inter_ai_dialogues/agent_crypto/PROMPT_REPRISE_AETHER_AGENT_CRYPTO.md")
LEDGER = Path("coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_FIN_DE_FIL_AETHER.md")
RELEASE_MANIFEST = Path("coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_RELEASE_MANIFEST.md")
SELF = Path(".github/scripts/agent_crypto_40_4_205_209_cascade.py")
WORKFLOW = Path(".github/workflows/agent-crypto-40-4-205-209-cascade.yml")
RELEASE_DRIVER = Path(".github/scripts/agent_crypto_release_driver.py")
GUARD = Path(".github/scripts/agent_crypto_version_truth_guard.py")
ENGINE = "38.15.11"


def run(*args: str) -> str:
    cp = subprocess.run(args, check=True, text=True, capture_output=True)
    if cp.stdout.strip():
        print(cp.stdout.strip())
    return cp.stdout.strip()


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"CASCADE_FAIL {label}: expected 1 exact match, got {count}")
    return text.replace(old, new, 1)


def regex_once(text: str, pattern: str, replacement: str, label: str, flags: int = 0) -> str:
    out, count = re.subn(pattern, replacement, text, count=1, flags=flags)
    if count != 1:
        raise SystemExit(f"CASCADE_FAIL {label}: expected 1 regex match, got {count}")
    return out


def set_const_build(path: Path, build: str) -> None:
    text = read(path)
    text = regex_once(text, r'const BUILD = "40\.4\.\d+";', f'const BUILD = "{build}";', f"{path} BUILD")
    write(path, text)


def update_build_json(build: str, release: str, status: str) -> None:
    data = json.loads(read(BUILD_JSON))
    if data.get("engine") != ENGINE:
        raise SystemExit("CASCADE_FAIL protected build.json engine drift")
    data["build"] = build
    data["release"] = release
    data["status"] = status
    data["published"] = True
    write(BUILD_JSON, json.dumps(data, ensure_ascii=False, indent=2) + "\n")


def release(build: str, parent: str, release_name: str, status: str, lineage: str, contract: dict | None = None) -> None:
    update_build_json(build, release_name, status)
    cmd = [
        "python", str(RELEASE_DRIVER),
        "--build", build,
        "--parent", parent,
        "--release", release_name,
        "--status", status,
        "--lineage-note", lineage,
    ]
    contract_path = Path("/tmp/agent_crypto_release_contract.json")
    if contract is not None:
        contract_path.write_text(json.dumps(contract, ensure_ascii=False, indent=2), encoding="utf-8")
        cmd += ["--contract-key", "market_color_parity_404209", "--contract-json", str(contract_path)]
    run(*cmd)
    run("python", str(GUARD), "--expected-build", build, "--expected-release", release_name)
    run("node", "--check", str(PAR))
    run("node", "--check", str(READING))
    verify_protected()


def commit(message: str) -> None:
    run("git", "add", "-A")
    staged = run("git", "diff", "--cached", "--name-only")
    if not staged.strip():
        raise SystemExit(f"CASCADE_FAIL no staged changes for {message}")
    run("git", "commit", "-m", message)


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


PROTECTED = [
    ROOT / "js/core/admin-window-manager.js",
    ROOT / "admin-windows.css",
]
PROTECTED_HASH = {str(p): sha(p) for p in PROTECTED if p.is_file()}
BASE_DATA_STATUS = run("git", "status", "--porcelain", "--", "public/agent_crypto_erith_ia/data")
BASE_COUNTS = {
    "fetch": read(PAR).count("fetch(") + read(READING).count("fetch("),
    "interval": read(PAR).count("setInterval(") + read(READING).count("setInterval("),
    "observer": read(PAR).count("MutationObserver") + read(READING).count("MutationObserver"),
    "websocket": read(PAR).count("WebSocket") + read(READING).count("WebSocket"),
    "raf": read(PAR).count("requestAnimationFrame(") + read(READING).count("requestAnimationFrame("),
}


def verify_protected() -> None:
    for path_s, digest in PROTECTED_HASH.items():
        p = Path(path_s)
        if sha(p) != digest:
            raise SystemExit(f"CASCADE_FAIL protected geometry owner changed: {p}")
    data_status = run("git", "status", "--porcelain", "--", "public/agent_crypto_erith_ia/data")
    if data_status != BASE_DATA_STATUS:
        raise SystemExit("CASCADE_FAIL data directory modified by cascade")
    current_counts = {
        "fetch": read(PAR).count("fetch(") + read(READING).count("fetch("),
        "interval": read(PAR).count("setInterval(") + read(READING).count("setInterval("),
        "observer": read(PAR).count("MutationObserver") + read(READING).count("MutationObserver"),
        "websocket": read(PAR).count("WebSocket") + read(READING).count("WebSocket"),
        "raf": read(PAR).count("requestAnimationFrame(") + read(READING).count("requestAnimationFrame("),
    }
    if current_counts != BASE_COUNTS:
        raise SystemExit(f"CASCADE_FAIL runtime scheduling/network owner count drift: {current_counts} != {BASE_COUNTS}")
    manifest = json.loads(read(ROOT / "version.json"))
    if manifest.get("engine", {}).get("reference_build") != ENGINE:
        raise SystemExit("CASCADE_FAIL Market Core manifest changed")
    if f'const ENGINE_BUILD = "{ENGINE}";' not in read(ROOT / "js/app.js"):
        raise SystemExit("CASCADE_FAIL Market Core runtime changed")


def finalize_205() -> None:
    manifest = json.loads(read(ROOT / "version.json"))
    remote = json.loads(read(BUILD_JSON))
    if manifest.get("build") == "40.4.205":
        print("40.4.205 already canonical; skip convergence commit")
        return
    if manifest.get("build") != "40.4.204" or remote.get("build") != "40.4.205":
        raise SystemExit(f"CASCADE_FAIL unexpected starting truth: canonical={manifest.get('build')} published={remote.get('build')}")
    set_const_build(READING, "40.4.205")
    release(
        "40.4.205", "40.4.204",
        "MARKET VISUAL PARITY · ASSET COLOR IDENTITY · REAL-TIME AXIS · HISTORICAL HOVER",
        "market_asset_color_temporal_hover_parity_404205",
        "40.4.205 asset color identity + real temporal axis + historical hover + version truth convergence",
    )
    commit("release(agent-crypto): finalize 40.4.205 version truth")


def patch_206() -> None:
    set_const_build(PAR, "40.4.206")
    text = read(PAR)
    old_clear = '''  function clearCanvasHover() {
    const overlay = stage()?.querySelector?.("[data-parallel-overlay]");
    if (!overlay) return;
    overlay.replaceChildren();
    overlay.removeAttribute("style");
  }
'''
    new_clear = '''  function emptyCanvasOverlay() {
    const overlay = stage()?.querySelector?.("[data-parallel-overlay]");
    if (!overlay) return;
    overlay.replaceChildren();
    overlay.removeAttribute("style");
  }

  function renderPinnedCanvasTable() {
    const overlay = stage()?.querySelector?.("[data-parallel-overlay]");
    const model = state.hover;
    if (!overlay || !model?.series?.length || !ACTIVE.has(model.domain)) return emptyCanvasOverlay();
    const rows = model.series.map(series => {
      const point = series.points?.[series.points.length - 1];
      if (!point) return null;
      const unit = safeText(series.asset?.currency || series.asset?.unit || "");
      const symbol = safeText(series.asset?.symbol || series.asset?.name || "ACTIF");
      const name = safeText(series.asset?.name || series.asset?.label || symbol);
      return {series, point, unit, symbol, name, change:point.value-100, time:pointTimeMs(point)};
    }).filter(Boolean);
    if (!rows.length) return emptyCanvasOverlay();
    const latestTime = Math.max(...rows.map(row => row.time || 0));
    overlay.style.cssText = "position:absolute;inset:0;z-index:5;pointer-events:none;color:#dbe8ef;font-family:system-ui,sans-serif";
    overlay.innerHTML = `<section class="atlas-parallel-chart-table-404206" aria-hidden="true">
      <header><span><b>VALEURS OBSERVÉES</b><small>${esc(CONFIG[model.domain]?.title || model.domain)} · Base 100</small></span><strong>${esc(dateText(latestTime))}</strong></header>
      <div class="atlas-parallel-chart-table-body-404206">${rows.map(row => `<div class="atlas-parallel-chart-table-row-404206" style="--asset-color:${row.series.color}">
        <i></i><span><b>${esc(row.symbol)}</b><small>${esc(row.name)}</small></span><strong>${num(row.point.raw,4)}${row.unit?` ${esc(row.unit)}`:""}</strong><em>${pct(row.change)}</em>
      </div>`).join("")}</div>
      <footer><b>${esc(model.period.toUpperCase())}</b><span>derniers points réels · survol = inspection historique</span></footer>
    </section>`;
  }

  function clearCanvasHover() {
    renderPinnedCanvasTable();
  }
'''
    text = replace_once(text, old_clear, new_clear, "40.4.206 pinned table clear owner")
    text = replace_once(text, "    drawCanvas(series, period, cfg.accent);\n", "    drawCanvas(series, period, cfg.accent);\n    renderPinnedCanvasTable();\n", "40.4.206 pinned table render call")
    text = replace_once(text, 'return `<section class="parallel-depth-sheet">\n', 'return `<section class="parallel-depth-sheet" style="--asset-color:${selected.color || CONFIG[domain]?.accent || "#dce5ec"}">\n', "40.4.206 selected sheet color")
    text = replace_once(text, "    asset_color_identity:true,\n", "    asset_color_identity:true,\n    chart_table_parity:true,\n    rail_asset_color_identity:true,\n", "40.4.206 runtime flags")
    write(PAR, text)

    css = read(CSS)
    marker = "/* 40.4.206 — PARALLEL CHART TABLE + RAIL ASSET COLOR PARITY */"
    if marker not in css:
        css += '''

/* 40.4.206 — PARALLEL CHART TABLE + RAIL ASSET COLOR PARITY */
.atlas-parallel-chart-table-404206{position:absolute;right:18px;top:50%;transform:translateY(-42%);width:min(360px,34%);padding:11px 12px 9px;border:1px solid color-mix(in srgb,var(--cyclic-market-accent,#9eddea) 38%,rgba(255,255,255,.08));border-radius:13px;background:linear-gradient(150deg,rgba(4,14,24,.965),rgba(5,22,31,.945));box-shadow:0 14px 34px rgba(0,0,0,.38),inset 0 0 0 1px rgba(255,255,255,.025);box-sizing:border-box}
.atlas-parallel-chart-table-404206>header{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:5px}.atlas-parallel-chart-table-404206>header span{display:grid}.atlas-parallel-chart-table-404206>header b{font-size:11px;color:#fff0cc;letter-spacing:.04em}.atlas-parallel-chart-table-404206>header small{font-size:7px;color:#7994a6}.atlas-parallel-chart-table-404206>header strong{font-size:8px;color:#9dddea;white-space:nowrap}
.atlas-parallel-chart-table-row-404206{display:grid;grid-template-columns:12px minmax(72px,1fr) minmax(86px,auto) minmax(60px,auto);gap:7px;align-items:center;padding:6px 0;border-top:1px solid rgba(255,255,255,.065)}.atlas-parallel-chart-table-row-404206>i{width:8px;height:8px;border-radius:50%;background:var(--asset-color,#dce5ec);box-shadow:0 0 7px color-mix(in srgb,var(--asset-color,#dce5ec) 62%,transparent)}.atlas-parallel-chart-table-row-404206>span{display:grid;min-width:0}.atlas-parallel-chart-table-row-404206>span b{color:#eef6fa;font-size:10px}.atlas-parallel-chart-table-row-404206>span small{color:#7993a5;font-size:7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.atlas-parallel-chart-table-row-404206>strong{color:#e8f0f5;font-size:10px;text-align:right}.atlas-parallel-chart-table-row-404206>em{font-style:normal;color:#dce7ed;font-size:9px;font-weight:900;text-align:right}.atlas-parallel-chart-table-404206>footer{display:flex;justify-content:space-between;gap:8px;margin-top:6px;padding-top:6px;border-top:1px solid rgba(104,218,236,.15);font-size:7px;color:#7895a7}.atlas-parallel-chart-table-404206>footer b{color:#74e5ef}
html[data-cyclic-market-domain="indices"] .atlas-parallel-basket-404189 li:nth-child(1),html[data-cyclic-market-domain="energy"] .atlas-parallel-basket-404189 li:nth-child(1),html[data-cyclic-market-domain="cross-market"] .atlas-parallel-basket-404189 li:nth-child(1){--asset-color:#ffd35b}html[data-cyclic-market-domain="indices"] .atlas-parallel-basket-404189 li:nth-child(2),html[data-cyclic-market-domain="energy"] .atlas-parallel-basket-404189 li:nth-child(2),html[data-cyclic-market-domain="cross-market"] .atlas-parallel-basket-404189 li:nth-child(2){--asset-color:#72d8ff}html[data-cyclic-market-domain="indices"] .atlas-parallel-basket-404189 li:nth-child(3),html[data-cyclic-market-domain="energy"] .atlas-parallel-basket-404189 li:nth-child(3),html[data-cyclic-market-domain="cross-market"] .atlas-parallel-basket-404189 li:nth-child(3){--asset-color:#89f4d1}html[data-cyclic-market-domain="indices"] .atlas-parallel-basket-404189 li:nth-child(4),html[data-cyclic-market-domain="cross-market"] .atlas-parallel-basket-404189 li:nth-child(4){--asset-color:#cf93f4}html[data-cyclic-market-domain="indices"] .atlas-parallel-basket-404189 li:nth-child(5),html[data-cyclic-market-domain="cross-market"] .atlas-parallel-basket-404189 li:nth-child(5){--asset-color:#ff8b5c}
.atlas-parallel-basket-404189 li{box-shadow:inset 3px 0 0 color-mix(in srgb,var(--asset-color,#dce5ec) 72%,transparent)}.atlas-parallel-basket-404189 li.is-selected{border-color:color-mix(in srgb,var(--asset-color,#dce5ec) 58%,rgba(255,255,255,.08));box-shadow:inset 4px 0 0 var(--asset-color,#dce5ec),0 0 12px color-mix(in srgb,var(--asset-color,#dce5ec) 10%,transparent)}
.parallel-depth-sheet{border-left:3px solid var(--asset-color,var(--cyclic-market-accent,#dce5ec))!important}
@media(max-width:900px){.atlas-parallel-chart-table-404206{right:10px;width:min(340px,56%);padding:9px 10px}.atlas-parallel-chart-table-row-404206{grid-template-columns:10px minmax(58px,1fr) minmax(70px,auto);}.atlas-parallel-chart-table-row-404206>em{display:none}}
'''
    write(CSS, css)

    release(
        "40.4.206", "40.4.205",
        "MARKET CHART TABLE PARITY · PERSISTENT VALUES · RAIL ASSET COLOR",
        "market_chart_table_rail_color_parity_404206",
        "40.4.206 persistent on-chart values table + rail asset color parity",
    )
    commit("feat(market): 40.4.206 chart table and rail color parity")


def patch_207() -> None:
    set_const_build(PAR, "40.4.207")
    set_const_build(READING, "40.4.207")
    css = read(CSS)
    marker = "/* 40.4.207 — DEEP READING ASSET COLOR + TABLE PARITY */"
    if marker not in css:
        css += '''

/* 40.4.207 — DEEP READING ASSET COLOR + TABLE PARITY */
#atlasMarketReadingDepth404199 tbody tr{--asset-color:var(--cyclic-market-accent,#dce5ec);box-shadow:inset 3px 0 0 color-mix(in srgb,var(--asset-color) 72%,transparent)}#atlasMarketReadingDepth404199 tbody tr th:first-child{position:relative;padding-left:22px}#atlasMarketReadingDepth404199 tbody tr th:first-child::before{content:"";position:absolute;left:8px;top:50%;width:7px;height:7px;border-radius:50%;background:var(--asset-color);box-shadow:0 0 7px color-mix(in srgb,var(--asset-color) 58%,transparent);transform:translateY(-50%)}
html[data-cyclic-market-domain="metals"] #atlasMarketReadingDepth404199 tbody tr:nth-child(1),html[data-cyclic-market-domain="indices"] #atlasMarketReadingDepth404199 tbody tr:nth-child(1),html[data-cyclic-market-domain="energy"] #atlasMarketReadingDepth404199 tbody tr:nth-child(1),html[data-cyclic-market-domain="cross-market"] #atlasMarketReadingDepth404199 tbody tr:nth-child(1){--asset-color:#ffd35b}html[data-cyclic-market-domain="metals"] #atlasMarketReadingDepth404199 tbody tr:nth-child(2),html[data-cyclic-market-domain="indices"] #atlasMarketReadingDepth404199 tbody tr:nth-child(2),html[data-cyclic-market-domain="energy"] #atlasMarketReadingDepth404199 tbody tr:nth-child(2),html[data-cyclic-market-domain="cross-market"] #atlasMarketReadingDepth404199 tbody tr:nth-child(2){--asset-color:#72d8ff}html[data-cyclic-market-domain="metals"] #atlasMarketReadingDepth404199 tbody tr:nth-child(3),html[data-cyclic-market-domain="indices"] #atlasMarketReadingDepth404199 tbody tr:nth-child(3),html[data-cyclic-market-domain="energy"] #atlasMarketReadingDepth404199 tbody tr:nth-child(3),html[data-cyclic-market-domain="cross-market"] #atlasMarketReadingDepth404199 tbody tr:nth-child(3){--asset-color:#89f4d1}html[data-cyclic-market-domain="metals"] #atlasMarketReadingDepth404199 tbody tr:nth-child(4),html[data-cyclic-market-domain="indices"] #atlasMarketReadingDepth404199 tbody tr:nth-child(4),html[data-cyclic-market-domain="cross-market"] #atlasMarketReadingDepth404199 tbody tr:nth-child(4){--asset-color:#cf93f4}html[data-cyclic-market-domain="metals"] #atlasMarketReadingDepth404199 tbody tr:nth-child(5),html[data-cyclic-market-domain="indices"] #atlasMarketReadingDepth404199 tbody tr:nth-child(5),html[data-cyclic-market-domain="cross-market"] #atlasMarketReadingDepth404199 tbody tr:nth-child(5){--asset-color:#ff8b5c}
html[data-cyclic-market-domain="indices"] #atlasMarketReadingDepth404199 .atlas-reading-structure-404199 article:nth-child(1),html[data-cyclic-market-domain="energy"] #atlasMarketReadingDepth404199 .atlas-reading-structure-404199 article:nth-child(1),html[data-cyclic-market-domain="cross-market"] #atlasMarketReadingDepth404199 .atlas-reading-structure-404199 article:nth-child(1){--asset-color:#ffd35b}html[data-cyclic-market-domain="indices"] #atlasMarketReadingDepth404199 .atlas-reading-structure-404199 article:nth-child(2),html[data-cyclic-market-domain="energy"] #atlasMarketReadingDepth404199 .atlas-reading-structure-404199 article:nth-child(2),html[data-cyclic-market-domain="cross-market"] #atlasMarketReadingDepth404199 .atlas-reading-structure-404199 article:nth-child(2){--asset-color:#72d8ff}html[data-cyclic-market-domain="indices"] #atlasMarketReadingDepth404199 .atlas-reading-structure-404199 article:nth-child(3),html[data-cyclic-market-domain="energy"] #atlasMarketReadingDepth404199 .atlas-reading-structure-404199 article:nth-child(3),html[data-cyclic-market-domain="cross-market"] #atlasMarketReadingDepth404199 .atlas-reading-structure-404199 article:nth-child(3){--asset-color:#89f4d1}html[data-cyclic-market-domain="indices"] #atlasMarketReadingDepth404199 .atlas-reading-structure-404199 article:nth-child(4),html[data-cyclic-market-domain="cross-market"] #atlasMarketReadingDepth404199 .atlas-reading-structure-404199 article:nth-child(4){--asset-color:#cf93f4}html[data-cyclic-market-domain="indices"] #atlasMarketReadingDepth404199 .atlas-reading-structure-404199 article:nth-child(5),html[data-cyclic-market-domain="cross-market"] #atlasMarketReadingDepth404199 .atlas-reading-structure-404199 article:nth-child(5){--asset-color:#ff8b5c}
#atlasMarketReadingDepth404199 .atlas-reading-structure-404199 article{border-left:3px solid var(--asset-color,var(--cyclic-market-accent,#dce5ec));box-shadow:inset 10px 0 18px color-mix(in srgb,var(--asset-color,var(--cyclic-market-accent,#dce5ec)) 5%,transparent)}
'''
    write(CSS, css)
    release(
        "40.4.207", "40.4.206",
        "DEEP READING COLOR PARITY · ASSET TABLE IDENTITY · SOURCE TRUTH",
        "deep_reading_asset_table_color_parity_404207",
        "40.4.207 deep reading measurement tables + structure cards inherit asset identity",
    )
    commit("feat(reading): 40.4.207 deep reading asset color parity")


def patch_208() -> None:
    set_const_build(PAR, "40.4.208")
    set_const_build(READING, "40.4.208")
    text = read(PAR)
    text = replace_once(
        text,
        '<span><small>Leader</small><strong>${esc(leader.asset.symbol || leader.asset.name)} ${pct(leader.metric.change)}</strong></span>',
        '<span class="atlas-parallel-math-asset-404208" style="--asset-color:${colorForAsset(domain,leader.asset,0)}"><small>Leader</small><strong>${esc(leader.asset.symbol || leader.asset.name)} ${pct(leader.metric.change)}</strong></span>',
        "40.4.208 Math leader semantic color",
    )
    text = replace_once(
        text,
        '<span><small>Retard</small><strong>${esc(laggard.asset.symbol || laggard.asset.name)} ${pct(laggard.metric.change)}</strong></span>',
        '<span class="atlas-parallel-math-asset-404208" style="--asset-color:${colorForAsset(domain,laggard.asset,0)}"><small>Retard</small><strong>${esc(laggard.asset.symbol || laggard.asset.name)} ${pct(laggard.metric.change)}</strong></span>',
        "40.4.208 Math laggard semantic color",
    )
    text = replace_once(text, "    rail_asset_color_identity:true,\n", "    rail_asset_color_identity:true,\n    math_semantic_color:true,\n    color_redundant_with_text:true,\n", "40.4.208 runtime flags")
    write(PAR, text)
    css = read(CSS)
    marker = "/* 40.4.208 — HISTORICAL MATH SEMANTIC COLOR LOCK */"
    if marker not in css:
        css += '''

/* 40.4.208 — HISTORICAL MATH SEMANTIC COLOR LOCK */
.atlas-parallel-math-asset-404208{border-left:3px solid var(--asset-color,var(--cyclic-market-accent,#dce5ec))!important;box-shadow:inset 10px 0 18px color-mix(in srgb,var(--asset-color,var(--cyclic-market-accent,#dce5ec)) 6%,transparent)}.atlas-parallel-math-asset-404208 small,.atlas-parallel-math-asset-404208 strong{color:inherit}.atlas-parallel-math-asset-404208 strong{color:#eef4f7!important}
/* Color remains redundant: symbol, name, value and role stay written in text for accessibility and Source Truth. */
'''
    write(CSS, css)
    release(
        "40.4.208", "40.4.207",
        "HISTORICAL MATH SEMANTIC COLOR · REDUNDANT ACCESSIBLE IDENTITY · NO FORMULA CHANGE",
        "historical_math_semantic_color_lock_404208",
        "40.4.208 Math Core leader/laggard semantic colors; calculations unchanged; color redundant with text",
    )
    commit("feat(math): 40.4.208 historical math semantic color lock")


def final_docs() -> None:
    prompt = '''# AETHER — PROMPT DE REPRISE AGENT-CRYPTO

Version de reprise : **40.4.209**  
Market Core : **38.15.11 — PROTÉGÉ**  
Mode : **Administrator**

## Démarrage minimal

Lire d'abord :
1. `public/agent_crypto_erith_ia/administrator/version.json` ;
2. `coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_FIN_DE_FIL_AETHER.md` ;
3. `public/agent_crypto_erith_ia/administrator/js/market-stack.js` ;
4. `public/agent_crypto_erith_ia/administrator/js/parallel-markets.js` ;
5. `public/agent_crypto_erith_ia/administrator/js/market-reading-depth.js`.

Ne charger une mémoire privée que si elle change réellement la décision. Pour le code, conserver la méthode chirurgicale : lire → diagnostiquer → cibler → corriger → vérifier → s'arrêter.

## État canonique

Le cycle marché est : **Crypto → Métaux → Indices → Énergie → Cross → Crypto**. Crypto reste le maître de géométrie. La géométrie validée 40.4.189/40.4.195, le rail droit, le Window Manager, Atlas, Oracle, Bridge et Backend ne doivent pas être rouverts sans preuve de régression.

40.4.209 consolide la parité visuelle : identité couleur stable par actif, axe temporel réel, inspection historique, tableau permanent superposé sur Indices/Énergie/Cross, propagation couleur au rail, aux tableaux de lecture profonde et aux rôles leader/retard du Math Core.

## Vérités protégées

- Market Core **38.15.11** inchangé.
- Aucun nouveau moteur de graphique.
- Aucun nouveau fetch, timer, MutationObserver, WebSocket ou requestAnimationFrame dans les propriétaires parallèles/lecture profonde.
- Historique 5a/10a/MAX toujours lazy et chargé uniquement à l'appel.
- Futures continus ≠ spot.
- Base 100 = comparaison relative.
- Corrélation ≠ causalité.
- Aucune valeur inventée, aucune prévision, aucun ordre.
- La couleur est redondante avec symbole/nom/valeur : elle ne porte jamais seule l'information.

## Règle de travail

Une dette → un propriétaire → une chirurgie → une preuve → un commit → stop. Ne jamais revenir à un ancien commit pour reconstruire une version : partir du `main` courant et préserver les mises à jour de données automatiques.
'''
    ledger = '''# AGENT-CRYPTO — FIN DE FIL AETHER

Version canonique de clôture : **40.4.209**  
Market Core : **38.15.11 — PROTÉGÉ**

## 1. Cascade finale 40.4.205 → 40.4.209

- **40.4.205** — identité couleur stable par actif, axe temporel réel, inspection historique au pointeur, convergence Version Truth.
- **40.4.206** — tableau permanent de valeurs observées superposé dans Indices/Énergie/Cross + propagation couleur au rail et à la fiche active.
- **40.4.207** — identité couleur propagée aux tableaux de Lecture profonde et cartes structurelles.
- **40.4.208** — leader/retard du Historical Math Core colorés selon l'actif sans modifier les formules ; information textuelle conservée.
- **40.4.209** — consolidation finale, Version Truth, cache-busting, contrat et reprise canonique.

## 2. Dette utilisateur soldée

Les domaines parallèles possèdent désormais, comme Crypto/Métaux, une lecture tabulaire visible directement dans le graphique. Le tableau permanent utilise uniquement les derniers points réels déjà chargés ; le survol remplace temporairement ce tableau par l'inspection historique puis le restaure. Aucune interpolation n'est ajoutée.

Les couleurs restent stables par position canonique du panier : jaune/or, cyan, menthe, violet, orange. Cette identité est répétée dans la courbe, la légende, le tableau graphique, le rail, la fiche active, la lecture profonde et les rôles Math Core lorsque l'actif est explicitement identifié.

## 3. Protections vérifiées

- Market Core 38.15.11 protégé.
- `admin-window-manager.js` et `admin-windows.css` non modifiés par la cascade.
- Aucun fichier de `public/agent_crypto_erith_ia/data` modifié par la cascade.
- Comptes `fetch`, `setInterval`, `MutationObserver`, `WebSocket` et `requestAnimationFrame` inchangés dans `parallel-markets.js` + `market-reading-depth.js`.
- `node --check` passé sur les deux propriétaires JavaScript à chaque release.
- `agent_crypto_version_truth_guard.py` passé sur chaque build canonique.

## 4. Architecture conservée

Un seul cockpit ; Crypto reste le maître physique. Cycle : **Crypto → Métaux → Indices → Énergie → Cross → Crypto**. Les historiques longs restent lazy. Les séries, unités et sources restent séparées. Aucune moyenne inter-source artificielle, aucune prévision, aucune exécution.

## 5. Reprise

Lire `version.json`, ce ledger et `PROMPT_REPRISE_AETHER_AGENT_CRYPTO.md`. Toute nouvelle dette doit partir du `main` courant. Ne pas rouvrir la géométrie 40.4.189/40.4.195 ni les propriétaires protégés sans preuve réelle.
'''
    manifest = '''# AGENT-CRYPTO — RELEASE MANIFEST

Release courante : **40.4.209**  
Market Core : **38.15.11**

## Surface canonique

- `public/agent_crypto_erith_ia/administrator/`
- `public/agent_crypto_erith_ia/data/indices/`
- `public/agent_crypto_erith_ia/data/energy/`
- `public/agent_crypto_erith_ia/data/cross_market/`
- `public/agent_crypto_erith_ia/data/metals/`
- `coordination/inter_ai_dialogues/agent_crypto/PROMPT_REPRISE_AETHER_AGENT_CRYPTO.md`
- `coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_FIN_DE_FIL_AETHER.md`

Le ZIP cumulatif fiable est l'archive GitHub du commit final 40.4.209 : il contient le dépôt complet et évite un paquet différentiel incomplet. La release ne modifie pas les archives de données automatiques pendant sa construction.
'''
    write(PROMPT, prompt)
    write(LEDGER, ledger)
    write(RELEASE_MANIFEST, manifest)


def patch_209() -> None:
    set_const_build(PAR, "40.4.209")
    set_const_build(READING, "40.4.209")
    final_docs()
    css = read(CSS)
    if "/* 40.4.209 — MARKET COLOR PARITY FINAL LOCK */" not in css:
        css += '''

/* 40.4.209 — MARKET COLOR PARITY FINAL LOCK */
/* Presentation-only lock: no geometry owner, chart engine, source, storage or scheduling change. */
'''
        write(CSS, css)
    contract = {
        "asset_color_identity": True,
        "real_time_axis": True,
        "historical_hover": True,
        "persistent_chart_values_table": True,
        "rail_asset_color_identity": True,
        "deep_reading_table_color_identity": True,
        "math_semantic_color": True,
        "color_redundant_with_text": True,
        "historical_long_lazy": True,
        "geometry_404189_404195_preserved": True,
        "market_core": ENGINE,
        "new_chart_engine": False,
        "new_fetch": False,
        "new_timer": False,
        "new_observer": False,
        "new_websocket": False,
        "orders_allowed": False,
    }
    release(
        "40.4.209", "40.4.208",
        "MARKET COLOR PARITY FINAL · CHART TABLES · DEEP READING · MATH SEMANTICS · VERSION TRUTH LOCK",
        "market_color_table_reading_math_semantic_final_404209",
        "40.4.209 market color/table/deep-reading/Math semantic parity final lock",
        contract=contract,
    )
    # Temporary cascade machinery must not survive the final product release.
    for path in (SELF, WORKFLOW):
        if path.exists():
            path.unlink()
    verify_protected()
    commit("release(agent-crypto): 40.4.209 market color parity final lock")


def main() -> int:
    run("git", "config", "user.name", "github-actions[bot]")
    run("git", "config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com")
    verify_protected()
    finalize_205()
    patch_206()
    patch_207()
    patch_208()
    patch_209()
    # Data workflows can advance main while this cascade runs. Rebase only on their newer commits; admin conflicts stop the job.
    run("git", "pull", "--rebase", "origin", "main")
    run("python", str(GUARD), "--expected-build", "40.4.209", "--expected-release", "MARKET COLOR PARITY FINAL · CHART TABLES · DEEP READING · MATH SEMANTICS · VERSION TRUTH LOCK")
    run("git", "push", "origin", "HEAD:main")
    print("CASCADE_PASS 40.4.209")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
