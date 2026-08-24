#!/usr/bin/env python3
"""40.3.67 AETHER extension for Atlas News Sentinel.

Extends the existing bounded RSS/Atom collector with macro/liquidity and
institutional money-flow coverage while preserving observation-only semantics.
No trading action, no causal claim, no browser polling.
"""

from __future__ import annotations

import html
import re
import sys
import urllib.parse
from datetime import timedelta
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

import atlas_news_collector as base

VERSION = "V1.1-alpha.26.47.3"
BUILD = "40.3.67"

base.VERSION = VERSION
base.MAX_EVENTS = 120
base.MAX_PER_SOURCE = 50


def google_news_rss(query: str) -> str:
    return (
        "https://news.google.com/rss/search?q="
        + urllib.parse.quote_plus(query)
        + "&hl=en-US&gl=US&ceid=US:en"
    )


TREASURY_SOURCE = base.Source(
    "us_treasury_press",
    "U.S. Treasury",
    "https://home.treasury.gov/news/press-releases",
    "primary",
    "en",
    94,
)

DISCOVERY_SOURCES = (
    base.Source(
        "google_news_etf_flows",
        "Google News · ETF flows discovery",
        google_news_rss('bitcoin ethereum ETF inflows outflows institutional when:7d'),
        "finance",
        "en",
        58,
    ),
    base.Source(
        "google_news_macro_liquidity",
        "Google News · macro liquidity discovery",
        google_news_rss('bitcoin crypto Treasury yields buybacks liquidity Federal Reserve when:7d'),
        "finance",
        "en",
        58,
    ),
    base.Source(
        "google_news_crypto_regulation",
        "Google News · crypto regulation discovery",
        google_news_rss('bitcoin crypto Clarity Act market structure Congress SEC stablecoin when:7d'),
        "finance",
        "en",
        58,
    ),
)

# Existing 11 sources remain untouched; these four extend discovery/primary coverage.
base.SOURCES = tuple(base.SOURCES) + (TREASURY_SOURCE,) + DISCOVERY_SOURCES

MONEY_FLOW_KEYWORDS = (
    "net inflow", "net inflows", "inflow", "inflows", "outflow", "outflows",
    "redemption", "redemptions", "subscriptions", "fund flows", "etf flows",
    "spot bitcoin etf", "spot ether etf", "spot ethereum etf", "institutional buying",
    "institutional demand", "institutional selling", "asset manager buying",
    "record inflow", "daily inflow", "daily outflow", "capital inflow", "capital outflow",
)

TREASURY_LIQUIDITY_KEYWORDS = (
    "treasury buyback", "treasury buybacks", "liquidity support buyback",
    "liquidity support buybacks", "long-end liquidity", "long end liquidity",
    "long-end buyback", "long end buyback", "nominal long-end", "nominal long end",
    "quarterly refunding", "debt management", "bond buyback", "bond buybacks",
    "treasury yield", "treasury yields", "bond yield", "bond yields",
)

REGULATION_MARKET_KEYWORDS = (
    "clarity act", "genius act", "crypto market structure", "market structure bill",
    "digital asset market structure", "stablecoin legislation", "crypto legislation",
)

base.KEYWORD_GROUPS = (
    ("money_flow", 7, MONEY_FLOW_KEYWORDS),
    ("treasury_liquidity", 7, TREASURY_LIQUIDITY_KEYWORDS),
    ("regulation_market", 5, REGULATION_MARKET_KEYWORDS),
    *tuple(base.KEYWORD_GROUPS),
)

base.EVENT_RULES = (
    (
        "etf_flow",
        "ETF / flux institutionnels",
        78,
        MONEY_FLOW_KEYWORDS,
        "flux de demande/offre à qualifier ; causalité non présumée",
    ),
    (
        "treasury_liquidity",
        "Trésor US / liquidité obligataire",
        77,
        TREASURY_LIQUIDITY_KEYWORDS,
        "contexte de liquidité macro à qualifier ; causalité non présumée",
    ),
    (
        "market_structure_regulation",
        "Réglementation / structure de marché",
        75,
        REGULATION_MARKET_KEYWORDS,
        "prime de risque réglementaire à qualifier ; causalité non présumée",
    ),
    *tuple(base.EVENT_RULES),
)


def _strip_tags(value: str) -> str:
    value = re.sub(r"<script[\s\S]*?</script>", " ", value, flags=re.I)
    value = re.sub(r"<style[\s\S]*?</style>", " ", value, flags=re.I)
    value = re.sub(r"<[^>]+>", " ", value)
    return re.sub(r"\s+", " ", html.unescape(value)).strip()


def parse_treasury_press_html(payload: bytes | str, source: base.Source = TREASURY_SOURCE) -> list[dict[str, Any]]:
    """Extract Treasury press-release links + nearby dates from the public listing."""
    text = payload.decode("utf-8", errors="replace") if isinstance(payload, (bytes, bytearray)) else str(payload or "")
    pattern = re.compile(
        r'<a[^>]+href=["\'](?P<href>/news/press-releases/[^"\'#?]+)["\'][^>]*>(?P<title>[\s\S]*?)</a>',
        flags=re.I,
    )
    rows: list[dict[str, Any]] = []
    seen: set[str] = set()
    for match in pattern.finditer(text):
        href = match.group("href")
        if href in seen:
            continue
        seen.add(href)
        title = _strip_tags(match.group("title"))
        if not title or len(title) < 8:
            continue
        nearby = text[max(0, match.start() - 900): min(len(text), match.end() + 900)]
        date_match = re.search(
            r'\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+([0-3]?\d),\s+(20\d{2})\b',
            _strip_tags(nearby),
            flags=re.I,
        )
        raw_date = " ".join(date_match.groups()) if date_match else ""
        published = base.parse_date(raw_date) if raw_date else base.utc_now()
        rows.append({
            "source_id": source.id,
            "source_name": source.name,
            "source_group": source.group,
            "source_language": source.language,
            "source_trust": source.trust,
            "headline": base.clean_text(title, 260),
            "summary": "U.S. Treasury press release.",
            "url": base.canonical_url(urllib.parse.urljoin("https://home.treasury.gov", href)),
            "published_at": published.isoformat(),
        })
        if len(rows) >= base.MAX_PER_SOURCE:
            break
    return rows


_base_fetch_source = base.fetch_source


def fetch_source(source: base.Source):
    if source.id != TREASURY_SOURCE.id:
        return _base_fetch_source(source)
    started = base.time.monotonic()
    last_error = ""
    for attempt in range(2):
        try:
            request = base.urllib.request.Request(
                source.url,
                headers={"User-Agent": base.USER_AGENT, "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5"},
            )
            with base.urllib.request.urlopen(request, timeout=12) as response:
                payload = response.read(4_000_000)
            items = parse_treasury_press_html(payload, source)
            latency = int((base.time.monotonic() - started) * 1000)
            return source, items, {
                "id": source.id,
                "name": source.name,
                "group": source.group,
                "url": source.url,
                "status": "ok" if items else "empty",
                "fetched_count": len(items),
                "qualified_count": 0,
                "latency_ms": latency,
                "error": None,
            }
        except Exception as exc:
            last_error = f"{type(exc).__name__}: {exc}"
            if attempt == 0:
                base.time.sleep(1.25)
    latency = int((base.time.monotonic() - started) * 1000)
    return source, [], {
        "id": source.id,
        "name": source.name,
        "group": source.group,
        "url": source.url,
        "status": "error",
        "fetched_count": 0,
        "qualified_count": 0,
        "latency_ms": latency,
        "error": last_error[:300],
    }


base.fetch_source = fetch_source

DRIVER_PATTERNS = {
    "macro_liquidity": re.compile(
        r"\b(treasury|buybacks?|bond yields?|treasury yields?|federal reserve|\bfed\b|interest rates?|rate cuts?|liquidity|dollar)\b",
        re.I,
    ),
    "institutional_flows": re.compile(
        r"\b(etf|institutional|asset manager|fund flows?)\b.{0,130}\b(inflows?|outflows?|redemptions?|buying|selling|demand|subscriptions?)\b|"
        r"\b(inflows?|outflows?|redemptions?)\b.{0,130}\b(etf|bitcoin|ether|ethereum|institutional|fund)\b",
        re.I,
    ),
    "regulation": re.compile(
        r"\b(clarity act|genius act|market structure bill|digital asset market structure|crypto legislation|regulation|regulatory|\bsec\b|\bcftc\b)\b",
        re.I,
    ),
    "leverage": re.compile(
        r"\b(short squeeze|long squeeze|shorts?|longs?|bearish bets?|liquidations?)\b.{0,130}\b(liquidat|wiped|forced|squeeze|lost|lose|covered|buy back|sell)\b|"
        r"\b(liquidations?|wiped out)\b.{0,130}\b(shorts?|longs?|bearish bets?)\b",
        re.I,
    ),
}


def driver_domains_for_text(text: str, matched_topics: list[str] | tuple[str, ...] | None = None) -> list[str]:
    raw = str(text or "")
    topics = {str(v) for v in (matched_topics or [])}
    domains: list[str] = []
    if "treasury_liquidity" in topics or DRIVER_PATTERNS["macro_liquidity"].search(raw):
        domains.append("macro_liquidity")
    if "money_flow" in topics or DRIVER_PATTERNS["institutional_flows"].search(raw):
        domains.append("institutional_flows")
    if "regulation_market" in topics or DRIVER_PATTERNS["regulation"].search(raw):
        domains.append("regulation")
    if DRIVER_PATTERNS["leverage"].search(raw):
        domains.append("leverage")
    return domains


_base_analyze_item = base.analyze_item


def analyze_item(item: dict[str, Any]):
    analyzed = _base_analyze_item(item)
    if not analyzed:
        return None
    text = f"{item.get('headline', '')} {item.get('summary', '')}"
    analyzed["driver_domains"] = driver_domains_for_text(text, analyzed.get("matched_topics"))
    analyzed["driver_coverage_build"] = BUILD
    analyzed["causal_claim"] = False
    return analyzed


base.analyze_item = analyze_item

_base_build_summary = base.build_summary


def build_summary(events: list[dict[str, Any]], source_status: list[dict[str, Any]]) -> dict[str, Any]:
    summary = _base_build_summary(events, source_status)
    cutoff = base.utc_now() - timedelta(hours=72)
    recent = [event for event in events if base.parse_date(event.get("event_time", "")) >= cutoff]
    coverage = {key: 0 for key in DRIVER_PATTERNS}
    distinct_sources = {key: set() for key in DRIVER_PATTERNS}
    for event in recent:
        domains = event.get("driver_domains") or driver_domains_for_text(
            f"{event.get('headline', '')} {event.get('body', '')}", event.get("matched_topics")
        )
        for domain in domains:
            if domain not in coverage:
                continue
            coverage[domain] += 1
            for name in event.get("source_names") or [event.get("source_name")]:
                if name:
                    distinct_sources[domain].add(str(name))
    summary["driver_coverage"] = {
        domain: {"events_72h": count, "distinct_sources": len(distinct_sources[domain])}
        for domain, count in coverage.items()
    }
    summary["driver_coverage_build"] = BUILD
    summary["causal_claim"] = False
    return summary


base.build_summary = build_summary


def self_test() -> int:
    # Keep all legacy assertions first.
    assert base.self_test() == 0

    sample_html = """
    <div class="press-content">
      <time>August 19, 2026</time>
      <a href="/news/press-releases/sb0421">Treasury Announces Increased Sizes of Nominal Long-End Liquidity Support Buybacks Beginning September 9</a>
    </div>
    """
    parsed = parse_treasury_press_html(sample_html)
    assert len(parsed) == 1
    assert "Liquidity Support Buybacks" in parsed[0]["headline"]
    treasury = analyze_item(parsed[0])
    assert treasury is not None
    assert treasury["event_type"] == "treasury_liquidity"
    assert "macro_liquidity" in treasury["driver_domains"]

    etf_item = {
        "source_group": "finance",
        "source_trust": 76,
        "headline": "Spot Bitcoin ETFs draw $517 million in net inflows as institutional demand returns",
        "summary": "Ether ETFs also post inflows while crypto prices rise.",
        "published_at": base.utc_now().isoformat(),
        "source_name": "Test Finance",
        "source_id": "test_finance",
        "url": "https://example.com/flows",
    }
    etf = analyze_item(etf_item)
    assert etf is not None
    assert etf["event_type"] == "etf_flow"
    assert "institutional_flows" in etf["driver_domains"]

    reg_item = {
        "source_group": "finance",
        "source_trust": 76,
        "headline": "Congress revives Clarity Act debate on crypto market structure",
        "summary": "The measure would clarify digital asset market structure rules.",
        "published_at": base.utc_now().isoformat(),
        "source_name": "Test Finance",
        "source_id": "test_reg",
        "url": "https://example.com/reg",
    }
    reg = analyze_item(reg_item)
    assert reg is not None
    assert reg["event_type"] == "market_structure_regulation"
    assert "regulation" in reg["driver_domains"]

    summary = build_summary([treasury, etf, reg], [{"status": "ok"}])
    assert summary["driver_coverage"]["macro_liquidity"]["events_72h"] >= 1
    assert summary["driver_coverage"]["institutional_flows"]["events_72h"] >= 1
    assert summary["driver_coverage"]["regulation"]["events_72h"] >= 1
    assert summary["causal_claim"] is False
    print("Atlas News Sentinel AETHER 40.3.67 self-test: OK")
    return 0


def main() -> int:
    parser = base.argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    return self_test() if args.self_test else base.collect()


if __name__ == "__main__":
    raise SystemExit(main())
