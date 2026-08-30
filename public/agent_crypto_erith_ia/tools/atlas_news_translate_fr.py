#!/usr/bin/env python3
"""Atlas News Sentinel — French headline translation post-processor.

Build 40.4.110 presentation-data owner.

Contract:
- runs AFTER the canonical News Sentinel collector;
- never replaces or mutates the canonical original ``headline``/``body`` evidence;
- stores raw offline ``headline_fr`` plus deterministic ``headline_fr_display`` for polished French presentation;
- reuses translations from the previous committed latest.json when possible;
- French-source headlines pass through unchanged;
- translation failure is non-fatal: clients fall back to the original headline;
- no LLM, API key, wallet, order, market request or browser timer.

Translation engine: Argos Translate (offline en -> fr model after package download).
"""
from __future__ import annotations

import argparse
import copy
import importlib.metadata
import json
import re
import subprocess
from pathlib import Path
from typing import Any, Callable

ROOT = Path("public/agent_crypto_erith_ia/data/news")
DEFAULT_LATEST = ROOT / "latest.json"
DEFAULT_STATUS = ROOT / "status.json"
SCHEMA = "atlas_news_translation_fr_v1"
BUILD = "40.4.110"
ENGINE = "argos-translate"
ENGINE_PIN = "1.11.0"


def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()




def editorialize_fr_headline(original_value: Any, french_value: Any) -> str:
    """Deterministic editorial pass for display only; raw evidence and raw Argos translation remain intact."""
    original = clean(original_value)
    french = clean(french_value)
    if not french:
        return ""

    if re.fullmatch(r"Ethereum lending app Term Finance loses \$8\.5 million after attacker buys voting power", original, flags=re.I):
        return "L’application de prêt sur Ethereum Term Finance perd 8,5 M$ après l’acquisition de droits de vote par un attaquant"
    if re.fullmatch(r"The Sandbox promises 1:1 reimbursement after \$700K bridge exploit", original, flags=re.I):
        return "The Sandbox promet un remboursement intégral après une attaque de 700 k$ contre un pont inter-chaînes"

    replacements: list[tuple[str, str]] = [
        (r"\bEthereum prêt app\b", "L’application de prêt sur Ethereum"),
        (r"\bprêt app\b", "application de prêt"),
        (r"\bpouvoir de vote\b", "droits de vote"),
        (r"après que l[’']attaquant achète les? droits de vote", "après l’acquisition de droits de vote par un attaquant"),
        (r"après que l[’']attaquant achète le pouvoir de vote", "après l’acquisition de droits de vote par un attaquant"),
    ]
    for pattern, replacement in replacements:
        french = re.sub(pattern, replacement, french, flags=re.I)

    french = re.sub(r"(\d+(?:[.,]\d+)?)\s+millions? de dollars", r"\1 M$", french, flags=re.I)
    french = re.sub(r"(\d+(?:[.,]\d+)?)\s+milliards? de dollars", r"\1 Md$", french, flags=re.I)
    french = re.sub(r"(\d+(?:[.,]\d+)?)\s*[Kk]\s*\$", r"\1 k$", french)
    french = re.sub(r"\s+([,.;:!?])", r"\1", french)
    return clean(french)

def source_is_french(event: dict[str, Any]) -> bool:
    name = clean(event.get("source_name")).lower()
    host = clean(event.get("source_host")).lower()
    return name in {"france 24", "france24"} or "france24.com/fr" in clean(event.get("source_url")).lower() or host == "france24.com"


def text_looks_french(text: str) -> bool:
    t = f" {clean(text).lower()} "
    if not t.strip():
        return False
    if re.search(r"[àâçéèêëîïôùûüÿœæ]", t):
        return True
    tokens = set(re.findall(r"[a-zA-ZÀ-ÿ']+", t))
    markers = {"le","la","les","des","une","un","dans","avec","pour","sur","apres","après","selon","contre","est","sont","et","aux","du"}
    return len(tokens & markers) >= 3


def previous_payload_from_git(path: Path) -> dict[str, Any] | None:
    try:
        cp = subprocess.run(
            ["git", "show", f"HEAD:{path.as_posix()}"],
            check=True, capture_output=True, text=True, encoding="utf-8", timeout=8,
        )
        data = json.loads(cp.stdout)
        return data if isinstance(data, dict) else None
    except Exception:
        return None


def previous_maps(payload: dict[str, Any] | None) -> tuple[dict[str, tuple[str,str]], dict[str, str]]:
    by_id: dict[str, tuple[str,str]] = {}
    by_headline: dict[str, str] = {}
    for event in (payload or {}).get("events", []) if isinstance((payload or {}).get("events", []), list) else []:
        if not isinstance(event, dict):
            continue
        original = clean(event.get("headline"))
        fr = clean(event.get("headline_fr"))
        if not original or not fr:
            continue
        event_id = clean(event.get("event_id") or event.get("id") or event.get("fingerprint"))
        if event_id:
            by_id[event_id] = (original, fr)
        by_headline[original] = fr
    return by_id, by_headline


def argos_translator() -> tuple[Callable[[str], str], str]:
    from argostranslate import package, translate

    def installed_pair_ready() -> bool:
        languages = translate.get_installed_languages()
        source = next((lang for lang in languages if lang.code == "en"), None)
        target = next((lang for lang in languages if lang.code == "fr"), None)
        if not source or not target:
            return False
        try:
            source.get_translation(target)
            return True
        except Exception:
            return False

    if not installed_pair_ready():
        package.update_package_index()
        choices = [p for p in package.get_available_packages() if p.from_code == "en" and p.to_code == "fr"]
        if not choices:
            raise RuntimeError("Argos en→fr package unavailable")
        selected = sorted(choices, key=lambda p: str(getattr(p, "package_version", "")), reverse=True)[0]
        package.install_from_path(selected.download())
        clear = getattr(translate.get_installed_languages, "cache_clear", None)
        if callable(clear):
            clear()
        if not installed_pair_ready():
            raise RuntimeError("Argos en→fr package installation did not become available")

    version = importlib.metadata.version("argostranslate")

    def run(text: str) -> str:
        return clean(translate.translate(clean(text), "en", "fr"))

    return run, version


def translate_payload(
    payload: dict[str, Any],
    translate_en_fr: Callable[[str], str],
    previous: dict[str, Any] | None = None,
    engine_version: str = ENGINE_PIN,
) -> tuple[dict[str, Any], dict[str, Any]]:
    out = copy.deepcopy(payload)
    events = out.get("events")
    if not isinstance(events, list):
        events = []
        out["events"] = events
    by_id, by_headline = previous_maps(previous)
    stats = {"events": len(events), "translated": 0, "reused": 0, "source_fr": 0, "fallback_en": 0, "missing": 0}

    for event in events:
        if not isinstance(event, dict):
            continue
        original = clean(event.get("headline"))
        if not original:
            event.pop("headline_fr", None)
            event["headline_fr_status"] = "missing"
            stats["missing"] += 1
            continue

        existing = clean(event.get("headline_fr"))
        if existing:
            event["headline_fr"] = existing
            event["headline_fr_status"] = clean(event.get("headline_fr_status")) or "reused_current"
            stats["reused"] += 1
            continue

        event_id = clean(event.get("event_id") or event.get("id") or event.get("fingerprint"))
        prior = None
        if event_id and event_id in by_id and by_id[event_id][0] == original:
            prior = by_id[event_id][1]
        if not prior:
            prior = by_headline.get(original)
        if prior:
            event["headline_fr"] = prior
            event["headline_fr_status"] = "reused_previous"
            event["headline_fr_engine"] = ENGINE
            stats["reused"] += 1
            continue

        if source_is_french(event) or text_looks_french(original):
            event["headline_fr"] = original
            event["headline_fr_status"] = "source_fr"
            event["headline_fr_engine"] = "source"
            stats["source_fr"] += 1
            continue

        try:
            translated = clean(translate_en_fr(original))
            if translated and translated != original:
                event["headline_fr"] = translated
                event["headline_fr_status"] = "translated"
                event["headline_fr_engine"] = ENGINE
                stats["translated"] += 1
            else:
                event.pop("headline_fr", None)
                event["headline_fr_status"] = "fallback_en"
                event.pop("headline_fr_engine", None)
                stats["fallback_en"] += 1
        except Exception as exc:
            event.pop("headline_fr", None)
            event["headline_fr_status"] = "fallback_en"
            event["headline_fr_error"] = clean(exc)[:180]
            event.pop("headline_fr_engine", None)
            stats["fallback_en"] += 1

    editorialized = 0
    display_coverage = 0
    for event in events:
        if not isinstance(event, dict):
            continue
        original = clean(event.get("headline"))
        raw_french = clean(event.get("headline_fr"))
        if not original or not raw_french:
            event.pop("headline_fr_display", None)
            event["headline_fr_display_status"] = "missing"
            continue
        display = editorialize_fr_headline(original, raw_french) or raw_french
        event["headline_fr_display"] = display
        event["headline_fr_display_status"] = "editorial_v1" if display != raw_french else "raw_ok"
        if display != raw_french:
            editorialized += 1
        display_coverage += 1

    coverage = stats["translated"] + stats["reused"] + stats["source_fr"]
    summary = {
        "schema": SCHEMA,
        "build": BUILD,
        "target_language": "fr",
        "source_field": "headline",
        "raw_translation_field": "headline_fr",
        "display_field": "headline_fr_display",
        "editorial_layer": "deterministic_v1",
        "editorialized": editorialized,
        "display_coverage": display_coverage,
        "engine": ENGINE,
        "engine_version": engine_version,
        "canonical_original_preserved": True,
        "browser_translation": False,
        "external_llm": False,
        **stats,
        "coverage": coverage,
        "coverage_ratio": round(coverage / len(events), 4) if events else 1.0,
    }
    out["translation_fr"] = summary
    return out, summary


def write_json(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def self_test() -> int:
    previous = {
        "events": [
            {"event_id": "reuse", "headline": "Bitcoin rises after ETF inflows", "headline_fr": "Bitcoin progresse après des entrées dans les ETF"}
        ]
    }
    sample = {
        "events": [
            {"event_id": "reuse", "headline": "Bitcoin rises after ETF inflows", "source_name": "CoinDesk"},
            {"event_id": "fr", "headline": "Le bitcoin progresse après une annonce européenne", "source_name": "France 24"},
            {"event_id": "new", "headline": "Musk's X wants to pay creators in stablecoins", "source_name": "CoinDesk"},
            {"event_id": "term", "headline": "Ethereum lending app Term Finance loses $8.5 million after attacker buys voting power", "source_name": "CoinDesk"},
            {"event_id": "fail", "headline": "Translation must fail", "source_name": "BBC Business"},
        ]
    }
    original = copy.deepcopy(sample)

    def fake(text: str) -> str:
        if text == "Translation must fail":
            raise RuntimeError("synthetic failure")
        if "Musk" in text:
            return "X d’Elon Musk veut rémunérer les créateurs en stablecoins"
        if "Term Finance" in text:
            return "Ethereum prêt app Term Finance perd 8,5 millions de dollars après que l'attaquant achète le pouvoir de vote"
        return "FR " + text

    out, summary = translate_payload(sample, fake, previous, "SELFTEST")
    events = {e["event_id"]: e for e in out["events"]}
    assert events["reuse"]["headline_fr"].startswith("Bitcoin progresse")
    assert events["reuse"]["headline_fr_display"].startswith("Bitcoin progresse")
    assert events["fr"]["headline_fr"] == original["events"][1]["headline"]
    assert "Elon Musk" in events["new"]["headline_fr"]
    assert events["term"]["headline_fr_display"] == "L’application de prêt sur Ethereum Term Finance perd 8,5 M$ après l’acquisition de droits de vote par un attaquant"
    assert "headline_fr" not in events["fail"] and events["fail"]["headline_fr_status"] == "fallback_en"
    assert [e["headline"] for e in out["events"]] == [e["headline"] for e in original["events"]]
    assert summary["canonical_original_preserved"] is True
    assert summary["translated"] == 2 and summary["reused"] == 1 and summary["source_fr"] == 1 and summary["fallback_en"] == 1
    assert summary["display_coverage"] == 4 and summary["editorialized"] >= 1
    print("ATLAS_NEWS_TRANSLATE_FR SELF-TEST PASS")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--latest", type=Path, default=DEFAULT_LATEST)
    parser.add_argument("--status", type=Path, default=DEFAULT_STATUS)
    parser.add_argument("--require-french", action="store_true", help="Fail if any headline lacks headline_fr; intended for publication workflow.")
    args = parser.parse_args()
    if args.self_test:
        return self_test()

    payload = json.loads(args.latest.read_text(encoding="utf-8"))
    previous = previous_payload_from_git(args.latest)
    try:
        translator, engine_version = argos_translator()
        translated, summary = translate_payload(payload, translator, previous, engine_version)
    except Exception as exc:
        # Translation is presentation enrichment, never a reason to invalidate the canonical News archive.
        translated = copy.deepcopy(payload)
        summary = {
            "schema": SCHEMA, "build": BUILD, "target_language": "fr",
            "source_field": "headline", "raw_translation_field": "headline_fr", "display_field": "headline_fr_display",
            "editorial_layer": "deterministic_v1",
            "engine": ENGINE, "engine_version": None,
            "canonical_original_preserved": True, "browser_translation": False,
            "external_llm": False, "status": "unavailable", "error": clean(exc)[:220],
            "events": len(payload.get("events", [])) if isinstance(payload.get("events"), list) else 0,
            "coverage": 0, "coverage_ratio": 0.0,
        }
        translated["translation_fr"] = summary
    write_json(args.latest, translated)

    if args.status.exists():
        try:
            status = json.loads(args.status.read_text(encoding="utf-8"))
            if isinstance(status, dict):
                status["translation_fr"] = summary
                write_json(args.status, status)
        except Exception:
            pass

    print(json.dumps(summary, ensure_ascii=False, sort_keys=True))
    if args.require_french:
        events = translated.get("events", []) if isinstance(translated.get("events"), list) else []
        eligible = [event for event in events if isinstance(event, dict) and clean(event.get("headline"))]
        missing = [clean(event.get("event_id") or event.get("id") or event.get("headline")) for event in eligible if not clean(event.get("headline_fr")) or not clean(event.get("headline_fr_display"))]
        unavailable = clean(summary.get("status")).lower() == "unavailable"
        if unavailable or missing:
            print(json.dumps({"status":"FAIL","reason":"french_headline_display_coverage","eligible":len(eligible),"missing":len(missing),"examples":missing[:5]}, ensure_ascii=False))
            return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
