from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ADMIN = ROOT / "public" / "agent_crypto_erith_ia" / "administrator"

style = (ADMIN / "style.css").read_text(encoding="utf-8")
help_css = (ADMIN / "help-layer.css").read_text(encoding="utf-8")
index = (ADMIN / "index.html").read_text(encoding="utf-8")
app = (ADMIN / "app.js").read_text(encoding="utf-8")
build = (ADMIN / "build.json").read_text(encoding="utf-8")

required = {
    "blocking help selector remains explicit": "#atlasHelpLayer.atlas-help-layer{" in help_css.replace(" ", ""),
    "interactive crypto selector restored": "#atlasHelpLayer.atlas-help-layer[data-market-help-coin-id]:not([hidden])" in style,
    "interactive crypto pointer enabled": "pointer-events: auto;" in style,
    "style cache token 40.6.547": './style.css?v=40.6.547' in index,
    "native mode buttons preserved": 'data-market-card-mode="floating"' in app and 'data-market-card-mode="dock"' in app,
    "native click owner preserved": 'event.target.closest?.("[data-market-card-mode]")' in app,
    "native mode setter preserved": "function atlasSetMarketCardMode(mode)" in app,
    "native dock renderer preserved": "function atlasRenderMarketCardDock(target, definition)" in app,
    "historic market width preserved": "ATLAS_MARKET_CARD_DOCK_MIN_MARKET_WIDTH = 980" in app,
    "historic card width preserved": "ATLAS_MARKET_CARD_DOCK_PANEL_MIN_WIDTH = 320" in app,
    "build 40.6.547": '"build": "40.6.547"' in build,
    "market core protected": '"market_core": "38.15.11"' in build,
}
failed = [name for name, ok in required.items() if not ok]
for name, ok in required.items():
    print(("PASS" if ok else "FAIL"), name)
if failed:
    raise SystemExit("40.6.547 guard failed: " + ", ".join(failed))
print("40.6.547 Fiche Latérale pointer restore guard PASS")
