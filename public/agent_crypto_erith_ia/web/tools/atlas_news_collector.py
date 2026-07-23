#!/usr/bin/env python3
"""Atlas News Sentinel — collecteur World-to-Market public et borné.

Aucune clé privée. Aucune exécution financière. Le script collecte des flux RSS/Atom
publiquement déclarés, filtre les événements susceptibles d'influencer les marchés,
déduplique, qualifie la source et écrit une archive JSON pour GitHub Pages.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import html
import json
import math
import os
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Any, Iterable

VERSION = "V1.1-alpha.26.47.2"
SCHEMA = "atlas_news_sentinel_world_to_market_v1"
ROOT = Path("public/agent_crypto_erith_ia/data/news")
MAX_EVENTS = 80
MAX_AGE_DAYS = 7
MAX_PER_SOURCE = 30

USER_AGENT = (
    "ERITHIA-NewsSentinel/1.0 "
    "(+https://github.com/BlueAzur-Hub/erith-ia-memory)"
)


@dataclass(frozen=True)
class Source:
    id: str
    name: str
    url: str
    group: str
    language: str = "en"
    trust: int = 60


SOURCES: tuple[Source, ...] = (
    Source("coindesk", "CoinDesk", "https://www.coindesk.com/arc/outboundfeeds/rss/", "crypto", "en", 66),
    Source("decrypt", "Decrypt", "https://decrypt.co/feed", "crypto", "en", 60),
    Source("cointelegraph", "Cointelegraph", "https://cointelegraph.com/rss", "crypto", "en", 54),
    Source("bbc_world", "BBC World", "https://feeds.bbci.co.uk/news/world/rss.xml", "world", "en", 74),
    Source("bbc_business", "BBC Business", "https://feeds.bbci.co.uk/news/business/rss.xml", "finance", "en", 76),
    Source("france24_fr", "France 24", "https://www.france24.com/fr/rss", "world", "fr", 72),
    Source("sec", "U.S. SEC", "https://www.sec.gov/news/pressreleases.rss", "primary", "en", 92),
    Source("fed", "Federal Reserve", "https://www.federalreserve.gov/feeds/press_all.xml", "primary", "en", 92),
    Source("ecb", "Banque centrale européenne", "https://www.ecb.europa.eu/rss/press.html", "primary", "en", 92),
    Source("cftc", "U.S. CFTC", "https://www.cftc.gov/RSS/RSSGP/rssgp.xml", "primary", "en", 90),
    Source("cisa", "CISA Cybersecurity Advisories", "https://www.cisa.gov/cybersecurity-advisories/all.xml", "primary", "en", 88),
)

SOURCE_GROUP_LABELS = {
    "primary": "Source primaire / institutionnelle",
    "finance": "Presse économique reconnue",
    "world": "Presse mondiale reconnue",
    "crypto": "Média crypto spécialisé",
}

# Les poids servent uniquement à filtrer et hiérarchiser. Ils ne sont pas un signal financier.
KEYWORD_GROUPS: tuple[tuple[str, int, tuple[str, ...]], ...] = (
    (
        "crypto",
        6,
        (
            "bitcoin", "ethereum", "crypto", "cryptocurrency", "digital asset", "blockchain",
            "stablecoin", "token", "defi", "exchange", "binance", "coinbase", "kraken",
            "solana", "xrp", "ripple", "tether", "usdc", "etf crypto", "spot etf",
        ),
    ),
    (
        "regulation",
        5,
        (
            "sec", "cftc", "regulation", "regulator", "regulatory", "mica", "esma", "amf",
            "securities law", "enforcement", "lawsuit", "court ruling", "ban", "licence",
            "reglementation", "regulateur", "sanction", "justice", "interdiction",
        ),
    ),
    (
        "macro",
        5,
        (
            "federal reserve", "fed", "ecb", "central bank", "interest rate", "rate cut",
            "rate hike", "inflation", "cpi", "pce", "jobs report", "unemployment", "gdp",
            "recession", "bond yield", "treasury yield", "dollar", "euro", "liquidity",
            "banque centrale", "taux", "inflation", "emploi", "recession", "dette",
        ),
    ),
    (
        "geopolitics",
        4,
        (
            "war", "conflict", "missile", "air strike", "attack", "ceasefire", "sanctions",
            "tariff", "trade war", "trump", "white house", "nato", "ukraine", "russia",
            "iran", "israel", "gaza", "china", "taiwan", "middle east", "red sea",
            "guerre", "conflit", "frappe", "attaque", "cessez-le-feu", "sanctions",
            "droits de douane", "maison-blanche", "otan", "proche-orient",
        ),
    ),
    (
        "energy",
        4,
        (
            "oil", "crude", "brent", "opec", "gas price", "energy shock", "pipeline",
            "petrole", "gaz", "energie", "opep",
        ),
    ),
    (
        "security",
        6,
        (
            "hack", "exploit", "breach", "cyberattack", "ransomware", "stolen funds",
            "drained", "vulnerability", "outage", "withdrawals suspended", "bankruptcy",
            "insolvency", "liquidation", "piratage", "faille", "fonds voles", "retraits suspendus",
            "faillite", "insolvabilite",
        ),
    ),
    (
        "institutional",
        4,
        (
            "etf", "blackrock", "fidelity", "institutional", "asset manager", "treasury reserve",
            "sovereign wealth", "pension fund", "banque", "institutionnel", "fonds",
        ),
    ),
    (
        "market_structure",
        3,
        (
            "listing", "delisting", "token unlock", "token burn", "mainnet", "hard fork",
            "upgrade", "governance vote", "network upgrade", "listing", "delisting",
            "deverrouillage", "mise a niveau", "gouvernance",
        ),
    ),
)

EVENT_RULES: tuple[tuple[str, str, int, tuple[str, ...], str], ...] = (
    ("security", "Hack / exploit / sécurité", 86, ("hack", "exploit", "breach", "cyberattack", "ransomware", "stolen", "drained", "piratage", "faille"), "pression négative potentielle"),
    ("bankruptcy", "Faillite / liquidité / retraits", 88, ("bankruptcy", "insolvency", "withdrawals suspended", "liquidation", "faillite", "insolvabilite", "retraits suspendus"), "pression négative potentielle"),
    ("regulation", "Régulation / justice", 78, ("regulation", "regulatory", "sec", "cftc", "mica", "lawsuit", "enforcement", "reglementation", "sanction", "justice"), "orientation mixte selon la décision"),
    ("etf", "ETF / institutionnels", 76, ("etf", "blackrock", "fidelity", "institutional", "asset manager", "institutionnel"), "catalyseur potentiel, sens à confirmer"),
    ("macro", "Macroéconomie / banque centrale", 74, ("federal reserve", "central bank", "interest rate", "inflation", "cpi", "pce", "recession", "ecb", "fed", "banque centrale", "taux"), "impact de marché large, sens à confirmer"),
    ("geopolitics", "Géopolitique / guerre / sanctions", 72, ("war", "conflict", "air strike", "sanctions", "tariff", "trump", "ukraine", "russia", "iran", "israel", "china", "guerre", "conflit", "frappe", "droits de douane"), "impact global potentiel, sens à confirmer"),
    ("energy", "Énergie / pétrole / matières premières", 68, ("oil", "brent", "opec", "gas price", "pipeline", "petrole", "gaz", "opep"), "impact macro et liquidité potentiel"),
    ("listing", "Listing / delisting", 62, ("listing", "delisting", "listed on", "retire de la cote"), "volatilité potentielle"),
    ("tokenomics", "Tokenomics / unlock / burn", 61, ("token unlock", "token burn", "vesting", "supply", "deverrouillage", "emission"), "pression d’offre potentielle"),
    ("network", "Upgrade / mainnet / réseau", 56, ("mainnet", "hard fork", "network upgrade", "protocol upgrade", "mise a niveau"), "catalyseur technique potentiel"),
)

ASSET_PATTERNS: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("BTC", ("bitcoin", "btc")),
    ("ETH", ("ethereum", "eth")),
    ("SOL", ("solana", "sol")),
    ("BNB", ("bnb", "binance coin")),
    ("XRP", ("xrp", "ripple")),
    ("USDT", ("usdt", "tether")),
    ("USDC", ("usdc", "usd coin")),
    ("ADA", ("cardano", "ada")),
    ("DOGE", ("dogecoin", "doge")),
    ("AVAX", ("avalanche", "avax")),
    ("LINK", ("chainlink", "link")),
    ("SUI", ("sui",)),
    ("UNI", ("uniswap", "uni")),
    ("AAVE", ("aave",)),
    ("XMR", ("monero", "xmr")),
)

STOPWORDS = {
    "the", "and", "for", "with", "from", "that", "this", "into", "after", "over", "amid",
    "les", "des", "une", "dans", "avec", "pour", "sur", "apres", "plus", "vers", "aux",
    "news", "says", "said", "announces", "annonce", "market", "marche", "crypto", "cryptocurrency",
}


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def normalize_text(value: str) -> str:
    value = html.unescape(str(value or ""))
    value = re.sub(r"<[^>]+>", " ", value)
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    value = value.lower()
    value = re.sub(r"https?://\S+", " ", value)
    value = re.sub(r"[^a-z0-9%$€]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def clean_text(value: str, max_len: int = 1000) -> str:
    value = html.unescape(str(value or ""))
    value = re.sub(r"<script[\s\S]*?</script>", " ", value, flags=re.I)
    value = re.sub(r"<style[\s\S]*?</style>", " ", value, flags=re.I)
    value = re.sub(r"<[^>]+>", " ", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value[:max_len]


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1].lower()


def child_text(node: ET.Element, names: Iterable[str]) -> str:
    wanted = {name.lower() for name in names}
    for child in list(node):
        if local_name(child.tag) in wanted:
            if child.text and child.text.strip():
                return child.text.strip()
            if "href" in child.attrib:
                return child.attrib["href"].strip()
    return ""


def entry_link(node: ET.Element) -> str:
    for child in list(node):
        if local_name(child.tag) != "link":
            continue
        href = child.attrib.get("href", "").strip()
        rel = child.attrib.get("rel", "alternate")
        if href and rel in ("alternate", ""):
            return href
        if child.text and child.text.strip():
            return child.text.strip()
    return child_text(node, ("guid",))


def parse_date(raw: str) -> datetime:
    raw = str(raw or "").strip()
    if not raw:
        return utc_now()
    try:
        dt = parsedate_to_datetime(raw)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except Exception:
        pass
    try:
        dt = datetime.fromisoformat(raw.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except Exception:
        return utc_now()


def canonical_url(raw: str) -> str:
    try:
        parsed = urllib.parse.urlsplit(str(raw or "").strip())
        if parsed.scheme not in ("http", "https"):
            return ""
        query = urllib.parse.parse_qsl(parsed.query, keep_blank_values=False)
        query = [(k, v) for k, v in query if not k.lower().startswith(("utm_", "ref", "source", "campaign"))]
        return urllib.parse.urlunsplit((parsed.scheme, parsed.netloc.lower(), parsed.path.rstrip("/"), urllib.parse.urlencode(query), ""))
    except Exception:
        return ""


def parse_feed(xml_bytes: bytes, source: Source) -> list[dict[str, Any]]:
    root = ET.fromstring(xml_bytes)
    entries = [node for node in root.iter() if local_name(node.tag) in ("item", "entry")]
    results: list[dict[str, Any]] = []
    for node in entries[:MAX_PER_SOURCE]:
        title = clean_text(child_text(node, ("title",)), 260)
        if not title:
            continue
        link = canonical_url(entry_link(node))
        summary = clean_text(child_text(node, ("description", "summary", "content", "encoded")), 1200)
        published_raw = child_text(node, ("pubdate", "published", "updated", "date"))
        published = parse_date(published_raw)
        results.append({
            "source_id": source.id,
            "source_name": source.name,
            "source_group": source.group,
            "source_language": source.language,
            "source_trust": source.trust,
            "headline": title,
            "summary": summary,
            "url": link,
            "published_at": published.isoformat(),
        })
    return results


def fetch_source(source: Source) -> tuple[Source, list[dict[str, Any]], dict[str, Any]]:
    started = time.monotonic()
    last_error = ""
    for attempt in range(2):
        try:
            request = urllib.request.Request(
                source.url,
                headers={
                    "User-Agent": USER_AGENT,
                    "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*;q=0.5",
                },
            )
            with urllib.request.urlopen(request, timeout=12) as response:
                payload = response.read(4_000_000)
            items = parse_feed(payload, source)
            latency = int((time.monotonic() - started) * 1000)
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
        except Exception as exc:  # chaque source échoue indépendamment
            last_error = f"{type(exc).__name__}: {exc}"
            if attempt == 0:
                time.sleep(1.25)
    latency = int((time.monotonic() - started) * 1000)
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


def contains_phrase(text: str, phrase: str) -> bool:
    normalized = normalize_text(phrase)
    if not normalized:
        return False
    return f" {normalized} " in f" {text} "


def relevance(item: dict[str, Any]) -> tuple[int, list[str]]:
    text = normalize_text(f"{item.get('headline', '')} {item.get('summary', '')}")
    score = 0
    matched: list[str] = []
    for label, weight, phrases in KEYWORD_GROUPS:
        if any(contains_phrase(text, phrase) for phrase in phrases):
            score += weight
            matched.append(label)
    # Une source crypto contenant un actif ou un terme marché passe plus facilement.
    if item.get("source_group") == "crypto" and any(label in matched for label in ("crypto", "regulation", "security", "macro", "institutional", "market_structure")):
        score += 2
    # Une publication institutionnelle doit tout de même parler d'un thème de marché.
    if item.get("source_group") == "primary" and matched:
        score += 2
    return score, matched


def detect_assets(text: str) -> list[str]:
    normalized = normalize_text(text)
    assets: list[str] = []
    padded = f" {normalized} "
    for symbol, phrases in ASSET_PATTERNS:
        if any(f" {normalize_text(phrase)} " in padded for phrase in phrases):
            assets.append(symbol)
    return assets[:12]


def detect_sectors(text: str, matched: list[str]) -> list[str]:
    value = normalize_text(text)
    sectors: list[str] = []
    mapping = (
        ("DeFi", ("defi", "dex", "lending", "bridge")),
        ("Stablecoins", ("stablecoin", "usdt", "usdc", "depeg")),
        ("Exchanges", ("exchange", "binance", "coinbase", "kraken", "listing", "delisting")),
        ("Layer 1", ("bitcoin", "ethereum", "solana", "avalanche", "cardano", "sui")),
        ("IA", ("artificial intelligence", "intelligence artificielle", "ai", "gpu", "compute")),
        ("RWA", ("real world asset", "rwa", "tokenization", "tokenisation")),
        ("Marché global", ("fed", "ecb", "central bank", "inflation", "interest rate", "tariff", "sanctions", "war", "oil")),
        ("Cybersécurité", ("hack", "exploit", "cyberattack", "ransomware", "breach")),
    )
    padded = f" {value} "
    for label, phrases in mapping:
        if any(f" {normalize_text(phrase)} " in padded for phrase in phrases):
            sectors.append(label)
    if "geopolitics" in matched and "Marché global" not in sectors:
        sectors.append("Marché global")
    return sectors[:8]


def detect_event(text: str) -> tuple[str, str, int, str]:
    normalized = normalize_text(text)
    padded = f" {normalized} "
    for event_id, label, base, phrases, direction in EVENT_RULES:
        if any(f" {normalize_text(phrase)} " in padded for phrase in phrases):
            return event_id, label, base, direction
    return "general", "Information de marché à qualifier", 46, "orientation indéterminée"


def freshness(published_at: str) -> dict[str, Any]:
    dt = parse_date(published_at)
    hours = max(0.0, (utc_now() - dt).total_seconds() / 3600)
    if hours < 2:
        label = "Immédiate · moins de 2 h"
    elif hours < 12:
        label = "Fraîche · moins de 12 h"
    elif hours < 48:
        label = "Récente · moins de 48 h"
    elif hours < 168:
        label = "Cette semaine"
    else:
        label = "Ancienne · plus de 7 jours"
    return {"iso": dt.isoformat(), "hours": round(hours, 2), "label": label, "inferred": False}


def evidence_level(score: int) -> str:
    if score >= 82:
        return "Élevé"
    if score >= 65:
        return "Assez élevé"
    if score >= 45:
        return "Moyen"
    if score >= 25:
        return "Faible"
    return "Très faible"


def impact_level(score: int) -> str:
    if score >= 85:
        return "Critique"
    if score >= 68:
        return "Fort"
    if score >= 48:
        return "Modéré"
    return "Faible"


def manipulation_level(score: int) -> str:
    if score >= 70:
        return "Élevé"
    if score >= 45:
        return "Modéré"
    return "Faible"


def analyze_item(item: dict[str, Any]) -> dict[str, Any] | None:
    score, matched = relevance(item)
    threshold = 5 if item.get("source_group") in ("world", "finance") else 4
    if item.get("source_id") == "cisa" and "crypto" not in matched and "institutional" not in matched:
        return None
    if score < threshold:
        return None

    combined = f"{item.get('headline', '')} {item.get('summary', '')}"
    event_id, event_label, event_base, direction = detect_event(combined)
    assets = detect_assets(combined)
    sectors = detect_sectors(combined, matched)
    fresh = freshness(item.get("published_at", ""))

    impact_score = event_base + min(12, max(0, score - threshold) * 2)
    if assets:
        impact_score += min(5, len(assets))
    if "geopolitics" in matched and "macro" in matched:
        impact_score += 6
    impact_score = max(0, min(100, impact_score))

    evidence_score = int(item.get("source_trust", 50))
    if item.get("source_group") == "primary":
        evidence_score += 4
    evidence_score = max(0, min(100, evidence_score))

    manipulation_score = {
        "primary": 8,
        "finance": 16,
        "world": 18,
        "crypto": 30,
    }.get(str(item.get("source_group")), 42)
    text_norm = normalize_text(combined)
    if any(term in text_norm for term in ("rumor", "unconfirmed", "insider", "leak", "rumeur", "non confirme")):
        manipulation_score += 24
    manipulation_score = max(0, min(100, manipulation_score))

    if evidence_score < 45 or manipulation_score >= 70:
        decision = {
            "action": "Attendre une source primaire",
            "checks": "Chercher un communiqué officiel ou deux sources concordantes.",
            "tone": "danger",
        }
    elif impact_score >= 85 and evidence_score >= 65:
        decision = {
            "action": "Alerte prioritaire · observation",
            "checks": "Vérifier la source primaire, la réaction du marché et Risk Sentinel. Aucun ordre automatique.",
            "tone": "danger",
        }
    elif impact_score >= 68 and evidence_score >= 55:
        decision = {
            "action": "Surveillance renforcée",
            "checks": "Comparer la réaction 24 h / 7 j, les confirmations et la mémoire Atlas.",
            "tone": "warn",
        }
    else:
        decision = {
            "action": "Surveillance",
            "checks": "Conserver le contexte et attendre une confirmation supplémentaire.",
            "tone": "neutral",
        }

    normalized_title = normalize_text(item.get("headline", ""))
    fingerprint = hashlib.sha256(f"{event_id}|{normalized_title}".encode("utf-8")).hexdigest()[:16]
    source_host = urllib.parse.urlsplit(item.get("url", "")).netloc.replace("www.", "") or urllib.parse.urlsplit(next((s.url for s in SOURCES if s.id == item.get("source_id")), "")).netloc
    published = parse_date(item.get("published_at", ""))
    now_iso = utc_now().isoformat()

    return {
        "id": f"feed_{fingerprint}",
        "event_id": f"feed_{fingerprint}",
        "fingerprint": fingerprint,
        "version": VERSION,
        "origin": "github_news_collector",
        "headline": clean_text(item.get("headline", ""), 260),
        "body": clean_text(item.get("summary", ""), 1000),
        "source_name": item.get("source_name", "Source"),
        "source_url": item.get("url", ""),
        "source_host": source_host,
        "source_group": item.get("source_group", "unknown"),
        "source_class": SOURCE_GROUP_LABELS.get(str(item.get("source_group")), "Source non qualifiée"),
        "source_count": 1,
        "source_names": [item.get("source_name", "Source")],
        "source_urls": [item.get("url", "")],
        "declared_status": "confirmed" if item.get("source_group") == "primary" else "reported",
        "event_type": event_id,
        "event_label": event_label,
        "event_time": published.isoformat(),
        "first_seen_at": now_iso,
        "last_seen_at": now_iso,
        "freshness": fresh,
        "evidence": {"score": evidence_score, "level": evidence_level(evidence_score)},
        "impact": {"score": impact_score, "level": impact_level(impact_score)},
        "direction": direction,
        "assets": assets,
        "sectors": sectors,
        "manipulation": {"score": manipulation_score, "level": manipulation_level(manipulation_score)},
        "priced": {
            "label": "À comparer au marché",
            "detail": "Le collecteur qualifie l'événement ; l'interface compare ensuite le contexte au snapshot courant sans prouver de causalité.",
        },
        "decision": decision,
        "confirmations": 1,
        "relevance_score": score,
        "matched_topics": matched,
        "observation_only": True,
    }


def title_tokens(title: str) -> set[str]:
    return {
        token
        for token in normalize_text(title).split()
        if len(token) >= 3 and token not in STOPWORDS and not token.isdigit()
    }


def jaccard(a: set[str], b: set[str]) -> float:
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def merge_event(base: dict[str, Any], other: dict[str, Any]) -> dict[str, Any]:
    merged = dict(base)
    names = list(dict.fromkeys([*(base.get("source_names") or [base.get("source_name")]), *(other.get("source_names") or [other.get("source_name")])]))
    urls = [url for url in dict.fromkeys([*(base.get("source_urls") or [base.get("source_url")]), *(other.get("source_urls") or [other.get("source_url")])]) if url]
    merged["source_names"] = names
    merged["source_urls"] = urls
    merged["source_count"] = len(names)
    merged["confirmations"] = max(int(base.get("confirmations", 1)), int(other.get("confirmations", 1)), len(names))
    merged["last_seen_at"] = max(str(base.get("last_seen_at", "")), str(other.get("last_seen_at", "")))
    merged["evidence"] = dict(base.get("evidence") or {})
    merged["evidence"]["score"] = min(100, max(int(base.get("evidence", {}).get("score", 0)), int(other.get("evidence", {}).get("score", 0))) + min(12, (len(names) - 1) * 5))
    merged["evidence"]["level"] = evidence_level(int(merged["evidence"]["score"]))
    merged["impact"] = max((base.get("impact") or {}, other.get("impact") or {}), key=lambda value: int(value.get("score", 0)))
    merged["assets"] = list(dict.fromkeys([*(base.get("assets") or []), *(other.get("assets") or [])]))[:12]
    merged["sectors"] = list(dict.fromkeys([*(base.get("sectors") or []), *(other.get("sectors") or [])]))[:8]
    if len(names) >= 2 and int(merged["evidence"]["score"]) >= 65 and int(merged.get("impact", {}).get("score", 0)) >= 68:
        merged["decision"] = {
            "action": "Surveillance renforcée",
            "checks": f"{len(names)} sources concordantes. Vérifier la source primaire et la réaction du marché.",
            "tone": "warn",
        }
    return merged


def deduplicate(events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    clusters: list[dict[str, Any]] = []
    for event in sorted(events, key=lambda item: item.get("event_time", ""), reverse=True):
        event_time = parse_date(event.get("event_time", ""))
        event_tokens = title_tokens(event.get("headline", ""))
        matched_index = None
        for index, existing in enumerate(clusters):
            existing_time = parse_date(existing.get("event_time", ""))
            if abs((event_time - existing_time).total_seconds()) > 48 * 3600:
                continue
            same_url = bool(event.get("source_url") and event.get("source_url") == existing.get("source_url"))
            same_type = event.get("event_type") == existing.get("event_type")
            similarity = jaccard(event_tokens, title_tokens(existing.get("headline", "")))
            if same_url or (same_type and similarity >= 0.46):
                matched_index = index
                break
        if matched_index is None:
            clusters.append(event)
        else:
            clusters[matched_index] = merge_event(clusters[matched_index], event)
    return clusters


def load_previous() -> list[dict[str, Any]]:
    path = ROOT / "latest.json"
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
        events = payload.get("events", [])
        return events if isinstance(events, list) else []
    except Exception:
        return []


def event_sort_key(event: dict[str, Any]) -> tuple[int, int, float]:
    impact = int(event.get("impact", {}).get("score", 0))
    evidence = int(event.get("evidence", {}).get("score", 0))
    timestamp = parse_date(event.get("event_time", "")).timestamp()
    return impact, evidence, timestamp


def build_summary(events: list[dict[str, Any]], source_status: list[dict[str, Any]]) -> dict[str, Any]:
    now = utc_now()
    last24 = [event for event in events if (now - parse_date(event.get("event_time", ""))) <= timedelta(hours=24)]
    critical = [event for event in last24 if int(event.get("impact", {}).get("score", 0)) >= 85]
    strong = [event for event in last24 if 68 <= int(event.get("impact", {}).get("score", 0)) < 85]
    ok_sources = [source for source in source_status if source.get("status") in ("ok", "empty")]
    failed_sources = [source for source in source_status if source.get("status") == "error"]
    lead = max(last24 or events, key=event_sort_key, default=None)
    return {
        "events_24h": len(last24),
        "critical_24h": len(critical),
        "strong_24h": len(strong),
        "sources_ok": len(ok_sources),
        "sources_total": len(source_status),
        "sources_failed": len(failed_sources),
        "lead_event_id": lead.get("id") if lead else None,
        "decision": "Surveillance renforcée" if critical or strong else "Surveillance normale",
    }


def collect() -> int:
    ROOT.mkdir(parents=True, exist_ok=True)
    (ROOT / "history").mkdir(parents=True, exist_ok=True)

    all_items: list[dict[str, Any]] = []
    statuses: list[dict[str, Any]] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        futures = [pool.submit(fetch_source, source) for source in SOURCES]
        for future in concurrent.futures.as_completed(futures):
            source, items, status = future.result()
            qualified = 0
            for item in items:
                analyzed = analyze_item(item)
                if analyzed:
                    all_items.append(analyzed)
                    qualified += 1
            status["qualified_count"] = qualified
            statuses.append(status)

    statuses.sort(key=lambda row: row["id"])
    previous = load_previous()
    cutoff = utc_now() - timedelta(days=MAX_AGE_DAYS)
    fresh_previous = [event for event in previous if parse_date(event.get("event_time", "")) >= cutoff]
    combined = deduplicate([*all_items, *fresh_previous])
    combined = [event for event in combined if parse_date(event.get("event_time", "")) >= cutoff]
    combined.sort(key=event_sort_key, reverse=True)
    events = combined[:MAX_EVENTS]

    ok_count = sum(1 for status in statuses if status["status"] in ("ok", "empty"))
    if ok_count == 0:
        status_value = "error"
    elif ok_count < max(3, len(SOURCES) // 2):
        status_value = "partial"
    else:
        status_value = "ok"

    generated_at = utc_now().isoformat()
    summary = build_summary(events, statuses)
    payload = {
        "schema": SCHEMA,
        "version": VERSION,
        "generated_at": generated_at,
        "status": status_value,
        "observation_only": True,
        "archive_only": True,
        "collector": "github-actions",
        "message": "Flux mondial et crypto filtré par pertinence marché. Aucun conseil financier, aucun ordre automatique.",
        "summary": summary,
        "source_status": statuses,
        "events": events,
    }
    (ROOT / "latest.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    status_payload = {
        "schema": "atlas_news_sentinel_status_v1",
        "version": VERSION,
        "updated_at": generated_at,
        "status": status_value,
        "events_count": len(events),
        "events_24h": summary["events_24h"],
        "sources_ok": summary["sources_ok"],
        "sources_total": summary["sources_total"],
        "sources_failed": summary["sources_failed"],
        "message": payload["message"],
    }
    (ROOT / "status.json").write_text(json.dumps(status_payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    history_path = ROOT / "history" / f"{generated_at[:10]}.jsonl"
    with history_path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps({
            "generated_at": generated_at,
            "status": status_value,
            "summary": summary,
            "lead_event": next((event for event in events if event.get("id") == summary.get("lead_event_id")), None),
        }, ensure_ascii=False) + "\n")

    print(json.dumps(status_payload, ensure_ascii=False, indent=2))
    return 0 if ok_count > 0 else 1


def self_test() -> int:
    sample = b"""<?xml version='1.0'?><rss><channel><item><title>SEC approves new spot Bitcoin ETF framework</title><link>https://example.com/a?utm_source=x</link><description>Institutional crypto regulation update.</description><pubDate>Wed, 22 Jul 2026 10:00:00 GMT</pubDate></item></channel></rss>"""
    source = Source("test", "Test", "https://example.com/feed", "primary", "en", 90)
    items = parse_feed(sample, source)
    assert len(items) == 1
    analyzed = analyze_item(items[0])
    assert analyzed is not None
    assert analyzed["event_type"] in ("regulation", "etf")
    assert "BTC" in analyzed["assets"]
    assert analyzed["source_url"] == "https://example.com/a"

    duplicate = dict(analyzed)
    duplicate["source_name"] = "Second Source"
    duplicate["source_names"] = ["Second Source"]
    duplicate["source_url"] = "https://second.example/b"
    duplicate["source_urls"] = ["https://second.example/b"]
    merged = deduplicate([analyzed, duplicate])
    assert len(merged) == 1
    assert merged[0]["source_count"] == 2
    assert merged[0]["confirmations"] >= 2

    irrelevant = {
        "source_group": "world",
        "source_trust": 70,
        "headline": "Local football team wins friendly match",
        "summary": "No financial or market context.",
        "published_at": utc_now().isoformat(),
        "source_name": "Test",
        "source_id": "test",
        "url": "https://example.com/sport",
    }
    assert analyze_item(irrelevant) is None
    print("Atlas News Sentinel self-test: OK")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    return self_test() if args.self_test else collect()


if __name__ == "__main__":
    raise SystemExit(main())
