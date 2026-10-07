#!/usr/bin/env python3
"""Stable guard for the current Agent-Crypto Carnet / Profondeur owner."""

from __future__ import annotations

import json
import re
from pathlib import Path

ADMIN = Path("public/agent_crypto_erith_ia/administrator")
DEPTH = ADMIN / "js/okx-microstructure-406499.js"
PAIR = ADMIN / "js/okx-market-pair-resolver.js"
RESOLVER = ADMIN / "js/market-instrument-resolver.js"
INDEX = ADMIN / "index.html"
BUILD = ADMIN / "build.json"


def fail(message: str) -> None:
    raise SystemExit("DEPTH_CURRENT_FAIL: " + message)


def need(value: bool, message: str) -> None:
    if not value:
        fail(message)


manifest = json.loads(BUILD.read_text(encoding="utf-8"))
depth = DEPTH.read_text(encoding="utf-8")
pair = PAIR.read_text(encoding="utf-8")
resolver = RESOLVER.read_text(encoding="utf-8")
index = INDEX.read_text(encoding="utf-8")
current = str(manifest.get("build") or "").strip()

need(bool(re.fullmatch(r"\d+\.\d+\.\d+", current)), "invalid current build")
need(manifest.get("market_core") == "38.15.11", "Market Core drift")
need(f"okx-microstructure-406499.js?v={current}" in index, "current depth cache token")
need('const BUILD="40.6.570"' in depth, "40.6.570 repaired depth owner not loaded")
need("const quoteAmount=" in depth, "quoteAmount helper missing")
need(re.search(r"\beur\s*\(", depth) is None, "legacy eur() call resurrected")
need("function renderDepth(body,m)" in depth, "renderDepth missing")
need("${quoteAmount(bid)} / ${quoteAmount(ask)}" in depth, "depth bands do not use quoteAmount")
need("const bands=[5,10,25]" in depth, "depth bands changed")
need('state.tab==="depth"' in depth, "depth tab routing missing")
need("document.body.appendChild(root)" in depth, "independent body portal missing")
need(f"okx-market-pair-resolver.js?v={current}" in index, "shared pair resolver cache token")
need(f"market-instrument-resolver.js?v={current}" in index, "market instrument resolver cache token")
need(index.find("js/okx-market-pair-resolver.js") < index.find("js/market-instrument-resolver.js") < index.find("js/okx-microstructure-406499.js"), "market resolver must load before Depth")
need("AgentCryptoMarketInstrumentResolver" in depth, "Depth does not consume market instrument resolver")
need("market_instrument_resolver:true" in depth, "Depth resolver export missing")
need("fetchBook" in resolver and "btw_bitget_fallback" in resolver, "resolver book/Bitget contract missing")
need("AgentCryptoOkxMarketPairResolver" in depth, "Depth does not consume shared pair resolver")
need("normalizeSelectedAsset" in depth and "pairResolver()?.normalizeAsset" in depth, "Depth canonical asset normalizer missing")
need("{2,16}" not in depth, "Depth private 2-char asset grammar resurrected")
need("typeof globalThis.getSelectedCoin" in depth, "canonical dynamic selection fallback missing")
need("BTC|ETH|BNB|XRP|SOL|ADA" not in depth, "hardcoded selected-asset whitelist resurrected")
need('["USDC","USDT"]' in pair, "USD pair order missing")
need('asset:"OKB",currency:"USD"' in pair, "OKB pair self-test missing")

resolver_scope = manifest.get("market_instrument_resolver_406619") or {}
need(resolver_scope.get("enabled") is True, "market resolver manifest missing")
need(resolver_scope.get("book_providers") == ["okx","bitget"], "book provider manifest drift")
need(resolver_scope.get("backend_required") == "1.4.6", "resolver backend version drift")

scope = manifest.get("okx_depth_multi_quote_render_repair_406570") or {}
need(scope.get("enabled") is True, "40.6.570 repair manifest missing")
need(scope.get("scope") == "DEPTH_TAB_RENDER_ONLY", "repair scope drift")
need(scope.get("dock_406513_modified") is False, "40.6.513 dock contract modified")
need(scope.get("bridge_modified") is False, "Bridge modified")
need(scope.get("backend_modified") is False, "Backend modified")
need(scope.get("private_api") is False, "private API introduced")
need(scope.get("real_order") is False, "real order introduced")
need(scope.get("wallet") is False, "wallet introduced")

print(json.dumps({
    "ok": True,
    "current_build": current,
    "depth_owner_build": "40.6.570",
    "market_core": manifest.get("market_core"),
    "legacy_eur_calls": 0,
    "depth_bands_bp": [5, 10, 25],
    "pair_resolver": "js/okx-market-pair-resolver.js",
    "terrain": scope.get("terrain"),
}, ensure_ascii=False, sort_keys=True))