#!/usr/bin/env python3
import json
from pathlib import Path
R=Path("public/agent_crypto_erith_ia/administrator")
page=(R/"trading-desk.html").read_text();css=(R/"trading-desk.css").read_text();js=(R/"js/trading-desk-foundation-406561.js").read_text();index=(R/"index.html").read_text();b=json.loads((R/"build.json").read_text())
def need(x,m):
    if not x: raise SystemExit("TRADING_DESK_406561_FAIL: "+m)
need(b.get("build")=="40.6.561","build");need(b.get("parent_build")=="40.6.560","parent");need(b.get("market_core")=="38.15.11","core")
need("40.6.561" in page and "trading-desk.css?v=40.6.561" in page,"page version");need("40.6.561" in index,"admin version")
for token in ["deskMarket","GRAPHIQUE · BOUGIES","PROFONDEUR","LECTURE TECHNIQUE","MATH CORE","VENTE","REDIVIDER"]:
    need(token in page,"missing "+token)
need("data-pair-truth" in page and 'pair:"BTC-USDC"' in js,"pair truth")
need("@media(max-width:980px)" in css and ".desk-market.is-open" in css,"responsive drawer")
for forbidden in ["fetch(","XMLHttpRequest","WebSocket(","localStorage","sessionStorage","apiKey","api_secret","placeOrder","createOrder"]:
    need(forbidden not in js,"forbidden "+forbidden)
s=b.get("trading_desk_foundation_406561") or {};need(s.get("scope")=="TRADING_DESK_READ_ONLY_LAYOUT_FOUNDATION_ONLY","scope")
need(s.get("single_responsive_html") is True,"responsive");need(s.get("no_aether_ticker") is True,"aether");need(s.get("real_order") is False and s.get("simulated_order") is False,"orders")
need(s.get("network_request") is False and s.get("storage_write") is False and s.get("api_secrets") is False,"safety")
print(json.dumps({"ok":True,"build":"40.6.561","page":"trading-desk.html","mode":"READ_ONLY_FOUNDATION","terrain":"PENDING_FIREFOX"}))
