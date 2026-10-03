#!/usr/bin/env python3
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[2]
ADMIN=ROOT/"public/agent_crypto_erith_ia/administrator"

build=json.loads((ADMIN/"build.json").read_text(encoding="utf-8"))
index=(ADMIN/"index.html").read_text(encoding="utf-8")
archive=(ADMIN/"index-40.6.510.html").read_text(encoding="utf-8")
atlas=(ADMIN/"views/atlas.html").read_text(encoding="utf-8")
loader=(ADMIN/"js/post-boot-runtime-loader.js").read_text(encoding="utf-8")
book=(ADMIN/"js/okx-microstructure-406499.js").read_text(encoding="utf-8")

checks={
    "build_510": build.get("build")=="40.6.510",
    "parent_509": build.get("parent_build")=="40.6.509",
    "release_truth": build.get("release")=="OKX ORDERBOOK CONTEXT + FRESHNESS TRUTH",
    "market_core_locked": build.get("market_core")=="38.15.11" and build.get("market_core_modified") is False,
    "index_510": 'Build 40.6.510 · Administrator' in index,
    "archive_510": 'Build 40.6.510 · Administrator' in archive,
    "meta_release": '<meta name="administrator-release" content="OKX ORDERBOOK CONTEXT + FRESHNESS TRUTH" />' in index,
    "atlas_interface_truth": 'id="atlasStableStackInterface">Build 40.6.510<' in atlas,
    "atlas_control_truth": 'id="atlasStableStackControl">V2.3.2R19<' in atlas,
    "atlas_bridge_truth": 'id="atlasStableStackBridge">V1.9.13 · non détecté<' in atlas,
    "loader_build_truth": 'const BUILD="40.6.510"' in loader,
    "book_build_truth": 'const BUILD="40.6.510"' in book,
    "freshness_bound": 'const FRESH_MAX_AGE_MS=15000;' in book,
    "future_bound": 'const FUTURE_TOLERANCE_MS=5000;' in book,
    "asset_identity": 'payloadAsset!==asset' in book,
    "pair_identity": 'pair.base!==asset' in book,
    "eur_quote": 'pair.quote!=="EUR"' in book,
    "source_time_required": 'SOURCE_TIME_INVALID' in book and 'parseSourceTime(payload?.observed_at_utc)' in book,
    "stale_rejected": 'STALE_BOOK' in book and 'ageMs > FRESH_MAX_AGE_MS' in book,
    "no_source_time_fabrication": 'payload?.observed_at_utc||new Date().toISOString()' not in book,
    "dynamic_units": 'Cumul ${esc(state.loadedAsset||state.requestedAsset||state.asset)}' in book,
    "freshness_states": all(token in book for token in ('"FRESH"','"STALE"','"OFFLINE"','"UNKNOWN"')),
    "old_levels_cleared_on_asset_change": 'if(state.loadedAsset!==requestAsset)clearBookForAsset(requestAsset);' in book,
    "superseded_response_guard": 'state.requestedAsset!==requestAsset' in book,
    "pending_asset_replay": 'queueMicrotask(()=>void refresh({automatic:true,asset:pending}))' in book,
    "depth_507_geometry_preserved": 'native_window_control_strip:true' in book and 'exact_lecture_technique_dock_sync:true' in book,
    "body_portal_preserved": 'document.body.appendChild(root)' in book,
    "live_interval_preserved": 'const LIVE_MS=2000;' in book,
    "no_real_order": build.get("real_order") is False,
    "no_new_timer": build.get("new_recurring_timer") is False,
    "no_new_observer": build.get("new_observer") is False,
}

failed=[k for k,v in checks.items() if not v]
for k,v in checks.items():
    print(f"{k}: {'PASS' if v else 'FAIL'}")
if failed:
    raise SystemExit("40.6.510 guard failed: "+", ".join(failed))
print("40.6.510 OKX ORDERBOOK CONTEXT + FRESHNESS TRUTH GUARD PASS")
