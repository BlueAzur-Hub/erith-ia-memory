#!/usr/bin/env python3
"""Atlas News Sentinel — French headline translation + editorial quality gate.

Build 40.4.114 — News French Quality / Canonical Translation Pipeline Lock.

Contract:
- runs AFTER the canonical News Sentinel collector;
- never replaces or mutates canonical original ``headline``/``body`` evidence;
- raw machine French is stored in ``headline_fr``;
- ``headline_fr_display`` is a display-only French editorial layer;
- old Argos v1 translations are NOT blindly reused after this quality upgrade;
- crypto/finance proper nouns and headline idioms are normalized before offline MT;
- deterministic source-aware editorial patterns repair high-confidence headline structures;
- quality is scored and surfaced, never hidden;
- translation failure remains non-fatal: clients may fall back to the original headline;
- no LLM, API key, wallet, order, market request or browser timer.

Translation engine: Argos Translate (offline en -> fr) + Atlas domain normalizer v2.
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
SCHEMA = "atlas_news_translation_fr_v2"
BUILD = "40.4.114"
ENGINE = "argos-translate"
ENGINE_PIN = "1.11.0"
ENGINE_TAG = "argos-translate+atlas-domain-normalizer-v2"
EDITORIAL_LAYER = "deterministic_domain_v2"
QUALITY_MIN = 72

# Terms that must survive machine translation as identities / market vocabulary.
PROTECTED_TERMS = [
    "Term Finance", "The Sandbox", "Hugging Face", "OpenAI", "OneKey", "Coldcard",
    "CoinDesk", "Cointelegraph", "CryptoRank", "Crypto Briefing", "SoSoValue", "Bitget",
    "Bitcoin", "Ethereum", "Solana", "Binance", "Coinbase", "Kraken", "Uniswap", "Aave",
    "Galaxy", "Ledger", "DeFi", "Web3", "ETF", "ETFs", "BTC", "ETH", "BNB", "XRP", "SOL",
]

BAD_FRENCH_PATTERNS = [
    r"\brôde comme\b", r"\bs['’]est écrasé un jeton\b", r"\bministère des finances à terme\b",
    r"\bvisage\b", r"\ben tant que flux\b", r"\bétaient de l['’]argent nouveau\b",
    r"\bécoulement streak\b", r"\bstreak\b", r"\bwassen", r"\bhacked it\b", r"\bgrew\b",
    r"\bstalls\b", r"\brally\b", r"\binflows?\b", r"\bstraight day\b", r"\bpledges\b",
    r"\bvulnerable\b", r"\breport finds\b", r"\blog sixth\b", r"\bspot etfs? extend\b",
]


def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def normalize_typography(text: str) -> str:
    text = clean(text).replace("—", " — ").replace("–", " - ")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def protect_domain_terms(text: str) -> tuple[str, dict[str, str]]:
    """Hide known identities from MT so brands are not translated into ordinary nouns."""
    out = text
    mapping: dict[str, str] = {}
    # longest first avoids ETF / ETFs collisions and nested names.
    for term in sorted(PROTECTED_TERMS, key=len, reverse=True):
        pattern = re.compile(re.escape(term), flags=re.I)
        if not pattern.search(out):
            continue
        token = f"ZXQTERM{len(mapping):02d}QXZ"
        canonical = pattern.search(out).group(0)
        out = pattern.sub(token, out)
        mapping[token] = canonical
    return out, mapping


def restore_domain_terms(text: str, mapping: dict[str, str]) -> str:
    out = text
    for token, term in mapping.items():
        out = re.sub(re.escape(token), term, out, flags=re.I)
        # Some MT engines may add spaces around the synthetic token.
        spaced = " ".join(token)
        out = out.replace(spaced, term)
    return clean(out)


def normalize_english_for_translation(original_value: Any) -> str:
    """Rewrite terse English headline idioms into literal English before offline MT.

    This is not evidence mutation: canonical ``headline`` remains untouched. The normalized
    sentence exists only inside the translation pipeline and is recorded in metadata when changed.
    """
    text = normalize_typography(clean(original_value))
    rules: list[tuple[str, str]] = [
        (r"\bCrypto roars back as\b", "The crypto market rises strongly while"),
        (r"\bCrypto rally stalls as\b", "The crypto market rally slows while"),
        (r"\bposts its second-best week\b", "records its second-best week"),
        (r"\bposts its best week\b", "records its best week"),
        (r"\blending app\b", "lending platform"),
        (r"\bpledges 1:1 repayment\b", "promises full reimbursement"),
        (r"\bbridge exploit\b", "bridge attack"),
        (r"\bvault governance exploit\b", "attack exploiting vault governance"),
        (r"\bloses estimated\b", "loses about"),
        (r"\bcrashed a neobank['’]s token (\d+(?:[.,]\d+)?)%\b", r"caused a neobank's token to fall by \1%"),
        (r"\bWasn['’]t Hacked\b", "Was Not Hacked"),
        (r"\bVulnerable Ethereum App Was Patched Before Exploit\b", "Vulnerable Ethereum application was fixed before an attack"),
        (r"\bRogue OpenAI Agents\b", "Unauthorized OpenAI agents"),
        (r"\bSacrificed Their Own Runs to Hack\b", "abandoned their own tasks to hack"),
        (r", Report Finds\b", ", according to a report"),
        (r"\bETF Flows Bring Strong Inflows to\b", "ETF flows show strong inflows into"),
        (r"\bExtend Inflow Streak to ([A-Za-z0-9.]+) Sessions With\b", r"record inflows for \1 consecutive sessions with"),
        (r"\bsee ([A-Za-z0-9.]+) straight days of net inflows as\b", r"record \1 consecutive days of net inflows while"),
        (r"\bstreak snaps\b", "inflow series ends"),
        (r"\bLog Sixth Straight Day of Combined Net Inflows\b", "record a sixth consecutive day of combined net inflows"),
        (r"\bin Focus\b", "to watch"),
    ]
    for pattern, replacement in rules:
        text = re.sub(pattern, replacement, text, flags=re.I)

    # Structure that Argos regularly mistranslates: "X Grew $23B ... Only $2.6B Was New Money".
    m = re.fullmatch(r"(.+? ETFs?) Grew (\$[\d.,]+\s*(?:Billion|Million|B|M)) Last Week\s*—\s*Only (\$[\d.,]+\s*(?:Billion|Million|B|M)) Was New Money", text, flags=re.I)
    if m:
        text = f"{m.group(1)} increased by {m.group(2)} last week, but only {m.group(3)} came from new inflows"
    return clean(text)


def exact_or_structural_french(original_value: Any) -> str:
    """High-confidence source-aware French renderings for recurring finance/security structures."""
    original = clean(original_value)
    low = original.lower()

    exact = {
        "ethereum lending app term finance loses $8.5 million after attacker buys voting power":
            "L’application de prêt sur Ethereum Term Finance perd 8,5 M$ après l’acquisition de droits de vote par un attaquant",
        "the sandbox pledges 1:1 repayment after $700k bridge exploit":
            "The Sandbox promet un remboursement intégral après une attaque de 700 k$ contre un pont inter-chaînes",
        "crypto roars back as bitcoin posts its second-best week since early 2021":
            "Le marché crypto repart nettement à la hausse, tandis que Bitcoin signe sa deuxième meilleure semaine depuis début 2021",
        "a $1.1 million crypto card hack crashed a neobank's token 49%":
            "Le piratage d’une carte crypto à 1,1 M$ fait chuter de 49 % le jeton d’une néobanque",
        "term finance loses estimated $8.5m in vault governance exploit":
            "Term Finance perd environ 8,5 M$ lors d’une attaque exploitant la gouvernance d’un coffre",
        "no, ledger wasn’t hacked: vulnerable ethereum app was patched before exploit, company says":
            "Non, Ledger n’a pas été piraté : l’application Ethereum vulnérable a été corrigée avant toute exploitation, selon l’entreprise",
        "onekey reproduces transaction replacement attack on outdated ledger ethereum app":
            "OneKey reproduit une attaque par remplacement de transaction sur une ancienne version de l’application Ethereum de Ledger",
        "galaxy puts coldcard hack losses at 1,789 btc, with 87% unmoved":
            "Galaxy estime les pertes liées au piratage de Coldcard à 1 789 BTC, dont 87 % n’ont pas été déplacés",
        "rogue openai agents sacrificed their own runs to hack hugging face, report finds":
            "Des agents OpenAI non autorisés auraient abandonné leurs propres tâches pour pirater Hugging Face, selon un rapport",
        "hugging face hack exposes the open-weight ai cybersecurity paradox":
            "Le piratage de Hugging Face met en lumière le paradoxe de cybersécurité des modèles d’IA à poids ouverts",
        "crypto rally stalls as etf inflows persist: bitcoin, ethereum, xrp in focus - cryptorank":
            "Le rallye crypto ralentit malgré la poursuite des entrées dans les ETF : Bitcoin, Ethereum et XRP sous surveillance — CryptoRank",
        "bitcoin, ethereum etfs grew $23 billion last week—only $2.6 billion was new money":
            "Les ETF Bitcoin et Ethereum ont progressé de 23 Md$ la semaine dernière, mais seulement 2,6 Md$ provenaient de nouveaux apports",
        "us bitcoin and ethereum spot etfs log sixth straight day of combined net inflows - finance.biggo.com":
            "Les ETF spot Bitcoin et Ethereum aux États-Unis enregistrent une sixième séance consécutive d’entrées nettes combinées — finance.biggo.com",
        "hugging face explores $13 billion sale a month after a rogue openai agent hacked it":
            "Hugging Face envisage une cession à 13 Md$, un mois après son piratage par un agent OpenAI non autorisé",
        "bitcoin and ethereum etfs add $492m as inflow streak continues - cryptorank":
            "Les ETF Bitcoin et Ethereum enregistrent 492 M$ d’entrées supplémentaires, prolongeant leur série positive — CryptoRank",
        "bitcoin etfs draw $2.8b in eight-day streak as btc tests $80k":
            "Les ETF Bitcoin attirent 2,8 Md$ sur huit séances consécutives d’entrées, tandis que BTC teste les 80 k$",
        "bitcoin etfs: -$201.8m as altcoins capture inflows - investx.fr":
            "Les ETF Bitcoin enregistrent -201,8 M$, tandis que les altcoins captent les entrées de capitaux — investx.fr",
        "blackrock records $1 billion ethereum inflow - tradingview":
            "BlackRock enregistre 1 Md$ d’entrées sur Ethereum — TradingView",
        "us bitcoin etfs snap 9-day inflow streak with $200 million daily outflow - finance.biggo.com":
            "Les ETF Bitcoin américains interrompent une série de neuf jours d’entrées avec 200 M$ de sorties sur la journée — finance.biggo.com",
        "bitcoin etfs post $201.81 million outflow as altcoin funds extend inflow streak - bloomingbit":
            "Les ETF Bitcoin enregistrent 201,81 M$ de sorties, tandis que les fonds altcoins prolongent leur série d’entrées — bloomingbit",
        "bitcoin etf inflows explode as treasury buybacks hit yields — is an $80k breakout igniting the next crypto rally? - bitcoin foundation":
            "Les entrées dans les ETF Bitcoin bondissent alors que les rachats du Trésor pèsent sur les rendements : une cassure des 80 k$ peut-elle relancer le marché crypto ? — Bitcoin Foundation",
        "ether etfs extend inflow streak to nine days with $234.5m added on aug. 27 - bitcoin world":
            "Les ETF Ether prolongent leur série d’entrées à neuf jours avec 234,5 M$ supplémentaires le 27 août — Bitcoin World",
        "us spot ethereum etfs see 8th straight day of inflows at $192.4 million - finance.biggo.com":
            "Les ETF spot Ethereum américains enregistrent une huitième journée consécutive d’entrées, à 192,4 M$ — finance.biggo.com",
        "bitcoin etfs extend inflow streak to six sessions with $2.26 billion - finance.biggo.com":
            "Les ETF Bitcoin prolongent leur série d’entrées à six séances, pour 2,26 Md$ — finance.biggo.com",
        "bitcoin price prediction: apeing watches $2.615b btc/eth etf flows - openpr.com":
            "Prévision du prix de Bitcoin : Apeing surveille 2,615 Md$ de flux sur les ETF BTC/ETH — openPR.com",
        "bitcoin and ethereum etfs pull in $2.6 billion as institutional demand returns - mexc":
            "Les ETF Bitcoin et Ethereum attirent 2,6 Md$ avec le retour de la demande institutionnelle — MEXC",
        "bitcoin etf inflows hit $1.9b in strongest week since october 2025 - altcoin buzz":
            "Les entrées dans les ETF Bitcoin atteignent 1,9 Md$, leur meilleure semaine depuis octobre 2025 — Altcoin Buzz",
        "btc price reclaims $81,000 as gold rally, treasury yields and fed policy drive markets - coinpaper":
            "Le BTC repasse au-dessus de 81 000 $ tandis que l’or, les rendements du Trésor et la politique de la Fed orientent les marchés — Coinpaper",
        "bitcoin surges past $80,000 as us treasury yields retreat; aero and virtual lead altcoin rally - cryptorank":
            "Bitcoin dépasse 80 000 $ avec le repli des rendements du Trésor américain ; AERO et VIRTUAL mènent la hausse des altcoins — CryptoRank",
    }
    if low in exact:
        return exact[low]

    # Generic security structure: "A $X ... hack ... token Y%".
    m = re.fullmatch(r"A (\$[\d.,]+\s*(?:million|billion|M|B)) (.+?) hack (?:crashed|sent) (.+?) token (\d+(?:[.,]\d+)?)%", original, flags=re.I)
    if m:
        amount = money_to_fr(m.group(1))
        return f"Un piratage de {m.group(2)} à {amount} fait chuter de {m.group(4).replace('.', ',')} % le jeton concerné"

    # Generic ETF streak structure.
    m = re.fullmatch(r"Spot Ethereum ETFs Extend Inflow Streak to (\w+) Sessions With (\$[\d.,]+[MB]?) Added(?: - (.+))?", original, flags=re.I)
    if m:
        source = f" — {m.group(3)}" if m.group(3) else ""
        return f"Les ETF spot Ethereum prolongent leur série d’entrées à {m.group(1)} séances, avec {money_to_fr(m.group(2))} supplémentaires{source}"

    m = re.fullmatch(r"Ethereum ETFs see (\d+) straight days of net inflows as Bitcoin streak snaps(?: - (.+))?", original, flags=re.I)
    if m:
        source = f" — {m.group(2)}" if m.group(2) else ""
        return f"Les ETF Ethereum enregistrent {m.group(1)} jours consécutifs d’entrées nettes, tandis que la série de Bitcoin s’interrompt{source}"

    return ""


def money_to_fr(value: str) -> str:
    text = clean(value).replace("$", "").strip()
    text = re.sub(r"\bBillion\b", " Md$", text, flags=re.I)
    text = re.sub(r"\bMillion\b", " M$", text, flags=re.I)
    text = re.sub(r"([\d.,]+)\s*B\b", r"\1 Md$", text, flags=re.I)
    text = re.sub(r"([\d.,]+)\s*M\b", r"\1 M$", text, flags=re.I)
    text = text.replace(".", ",") if re.fullmatch(r"\d+\.\d+\s*(?:M\$|Md\$)?", text) else text
    if "$" not in text:
        text += " $"
    return clean(text).replace(" $", "$")


def editorialize_fr_headline(original_value: Any, french_value: Any) -> str:
    """Display-only editorial pass. Canonical English and raw French stay untouched."""
    original = clean(original_value)
    french = clean(french_value)
    if not french:
        return ""

    structural = exact_or_structural_french(original)
    if structural:
        return clean(structural)

    replacements: list[tuple[str, str]] = [
        (r"\bEthereum prêt app\b", "L’application de prêt sur Ethereum"),
        (r"\bprêt app\b", "application de prêt"),
        (r"\bpouvoir de vote\b", "droits de vote"),
        (r"après que l[’']attaquant achète les? droits de vote", "après l’acquisition de droits de vote par un attaquant"),
        (r"après que l[’']attaquant achète le pouvoir de vote", "après l’acquisition de droits de vote par un attaquant"),
        (r"\bLe ministère des Finances à terme\b", "Term Finance"),
        (r"\bFinances à terme\b", "Term Finance"),
        (r"\bLe Sandbox\b", "The Sandbox"),
        (r"\bCrypto rôde comme Bitcoin affiche\b", "Le marché crypto repart à la hausse, tandis que Bitcoin signe"),
        (r"\bCrypto Rally Stalls\b", "Le rallye crypto ralentit"),
        (r"\ben tant que flux ETF Persiste\b", "tandis que les entrées dans les ETF se poursuivent"),
        (r"\bETF Persiste\b", "les entrées dans les ETF se poursuivent"),
        (r"\bEthereum ETFs voir\b", "Les ETF Ethereum enregistrent"),
        (r"\bSpot Ethereum ETFs\b", "Les ETF spot Ethereum"),
        (r"\bBitcoin, Ethereum ETFs Grew\b", "Les ETF Bitcoin et Ethereum ont progressé de"),
        (r"\bétaient de l['’]argent nouveau\b", "provenaient de nouveaux apports"),
        (r"\bflux ETF\b", "flux d’ETF"),
        (r"\bAI\b", "IA"),
    ]
    for pattern, replacement in replacements:
        french = re.sub(pattern, replacement, french, flags=re.I)

    french = re.sub(r"(\d+(?:[.,]\d+)?)\s+millions? de dollars", r"\1 M$", french, flags=re.I)
    french = re.sub(r"(\d+(?:[.,]\d+)?)\s+milliards? de dollars", r"\1 Md$", french, flags=re.I)
    french = re.sub(r"(\d+(?:[.,]\d+)?)\s*[Kk]\s*\$", r"\1 k$", french)
    french = re.sub(r"\bdepuis le début (\d{4})\b", r"depuis début \1", french, flags=re.I)
    french = re.sub(r"deuxième-meilleure", "deuxième meilleure", french, flags=re.I)
    french = re.sub(r"\s+([,.;:!?])", r"\1", french)
    french = re.sub(r"\s*—\s*", " — ", french)
    return clean(french)


def quality_score_fr(original_value: Any, french_value: Any) -> tuple[int, list[str]]:
    original = clean(original_value)
    french = clean(french_value)
    if not french:
        return 0, ["missing"]
    score = 100
    reasons: list[str] = []
    for pattern in BAD_FRENCH_PATTERNS:
        if re.search(pattern, french, flags=re.I):
            score -= 12
            reasons.append(pattern.strip("\\b"))
    # English-heavy residue: words expected to disappear from a French display line.
    english_residue = re.findall(r"\b(?:after|before|with|week|report|finds|hack|hacked|loses|grew|only|money|sale|month|added|sessions|straight|days|inflow|inflows|focus|rally|stalls)\b", french, flags=re.I)
    if english_residue:
        penalty = min(30, 5 * len(set(w.lower() for w in english_residue)))
        score -= penalty
        reasons.append("english_residue")
    # Entity loss is a semantic warning; explicit structural overrides are expected to preserve them.
    for term in PROTECTED_TERMS:
        if re.search(re.escape(term), original, flags=re.I) and term.lower() not in french.lower():
            if term in {"ETF", "ETFs", "BTC", "ETH", "BNB", "XRP", "SOL"}:
                continue
            score -= 5
            reasons.append(f"entity:{term}")
    return max(0, min(100, score)), list(dict.fromkeys(reasons))


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
    markers = {"le", "la", "les", "des", "une", "un", "dans", "avec", "pour", "sur", "apres", "après", "selon", "contre", "est", "sont", "et", "aux", "du"}
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


def previous_maps(payload: dict[str, Any] | None) -> tuple[dict[str, dict[str, str]], dict[str, dict[str, str]]]:
    by_id: dict[str, dict[str, str]] = {}
    by_headline: dict[str, dict[str, str]] = {}
    rows = (payload or {}).get("events", []) if isinstance((payload or {}).get("events", []), list) else []
    for event in rows:
        if not isinstance(event, dict):
            continue
        original = clean(event.get("headline"))
        fr = clean(event.get("headline_fr"))
        engine = clean(event.get("headline_fr_engine"))
        display = clean(event.get("headline_fr_display"))
        if not original or not fr:
            continue
        record = {"original": original, "fr": fr, "engine": engine, "display": display}
        event_id = clean(event.get("event_id") or event.get("id") or event.get("fingerprint"))
        if event_id:
            by_id[event_id] = record
        by_headline[original] = record
    return by_id, by_headline


def reusable_v2(record: dict[str, str] | None, original: str) -> str:
    if not record or record.get("original") != original:
        return ""
    if record.get("engine") != ENGINE_TAG:
        return ""
    return clean(record.get("fr"))


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


def translate_one(original: str, translate_en_fr: Callable[[str], str]) -> tuple[str, str]:
    normalized = normalize_english_for_translation(original)
    protected, mapping = protect_domain_terms(normalized)
    translated = clean(translate_en_fr(protected))
    translated = restore_domain_terms(translated, mapping)
    return translated, normalized


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
    stats = {
        "events": len(events), "translated": 0, "retranslated_v2": 0, "reused_v2": 0,
        "source_fr": 0, "fallback_en": 0, "missing": 0, "normalized_before_mt": 0,
        "quality_pass": 0, "quality_warn": 0, "editorialized": 0,
    }

    for event in events:
        if not isinstance(event, dict):
            continue
        original = clean(event.get("headline"))
        if not original:
            for field in ("headline_fr", "headline_fr_display"):
                event.pop(field, None)
            event["headline_fr_status"] = "missing"
            event["headline_fr_display_status"] = "missing"
            stats["missing"] += 1
            continue

        if source_is_french(event) or text_looks_french(original):
            event["headline_fr"] = original
            event["headline_fr_status"] = "source_fr"
            event["headline_fr_engine"] = "source"
            stats["source_fr"] += 1
        else:
            event_id = clean(event.get("event_id") or event.get("id") or event.get("fingerprint"))
            record = by_id.get(event_id) if event_id else None
            if not record:
                record = by_headline.get(original)
            prior = reusable_v2(record, original)

            current = clean(event.get("headline_fr")) if clean(event.get("headline_fr_engine")) == ENGINE_TAG else ""
            if current:
                event["headline_fr"] = current
                event["headline_fr_status"] = "reused_current_v2"
                event["headline_fr_engine"] = ENGINE_TAG
                stats["reused_v2"] += 1
            elif prior:
                event["headline_fr"] = prior
                event["headline_fr_status"] = "reused_previous_v2"
                event["headline_fr_engine"] = ENGINE_TAG
                stats["reused_v2"] += 1
            else:
                try:
                    translated, normalized = translate_one(original, translate_en_fr)
                    if normalized != original:
                        event["headline_fr_source_normalized"] = normalized
                        stats["normalized_before_mt"] += 1
                    else:
                        event.pop("headline_fr_source_normalized", None)
                    if translated and translated != original:
                        old_engine = clean(event.get("headline_fr_engine"))
                        event["headline_fr"] = translated
                        event["headline_fr_status"] = "retranslated_v2" if old_engine and old_engine != ENGINE_TAG else "translated_v2"
                        event["headline_fr_engine"] = ENGINE_TAG
                        stats["translated"] += 1
                        if old_engine and old_engine != ENGINE_TAG:
                            stats["retranslated_v2"] += 1
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

        raw_french = clean(event.get("headline_fr"))
        if not raw_french:
            event.pop("headline_fr_display", None)
            event["headline_fr_display_status"] = "missing"
            event["headline_fr_quality_score"] = 0
            event["headline_fr_quality_reasons"] = ["missing"]
            continue

        display = editorialize_fr_headline(original, raw_french) or raw_french
        event["headline_fr_display"] = display
        event["headline_fr_display_status"] = "editorial_v2" if display != raw_french else "raw_v2"
        if display != raw_french:
            stats["editorialized"] += 1
        qscore, reasons = quality_score_fr(original, display)
        event["headline_fr_quality_score"] = qscore
        event["headline_fr_quality_status"] = "pass" if qscore >= QUALITY_MIN else "warn"
        event["headline_fr_quality_reasons"] = reasons[:8]
        if qscore >= QUALITY_MIN:
            stats["quality_pass"] += 1
        else:
            stats["quality_warn"] += 1

    coverage = stats["translated"] + stats["reused_v2"] + stats["source_fr"]
    display_coverage = sum(1 for e in events if isinstance(e, dict) and clean(e.get("headline_fr_display")))
    summary = {
        "schema": SCHEMA,
        "build": BUILD,
        "target_language": "fr",
        "source_field": "headline",
        "raw_translation_field": "headline_fr",
        "display_field": "headline_fr_display",
        "editorial_layer": EDITORIAL_LAYER,
        "quality_gate": {"minimum": QUALITY_MIN, "pass": stats["quality_pass"], "warn": stats["quality_warn"]},
        "display_coverage": display_coverage,
        "engine": ENGINE,
        "engine_version": engine_version,
        "engine_tag": ENGINE_TAG,
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
            {"event_id": "old", "headline": "Crypto roars back as bitcoin posts its second-best week since early 2021", "headline_fr": "Crypto rôde comme Bitcoin affiche sa deuxième-meilleure semaine depuis le début 2021", "headline_fr_engine": "argos-translate"},
            {"event_id": "reuse", "headline": "Bitcoin rises after ETF inflows", "headline_fr": "Bitcoin progresse après des entrées dans les ETF", "headline_fr_engine": ENGINE_TAG},
        ]
    }
    sample = {
        "events": [
            {"event_id": "old", "headline": "Crypto roars back as bitcoin posts its second-best week since early 2021", "source_name": "CoinDesk", "headline_fr": "Crypto rôde comme Bitcoin affiche sa deuxième-meilleure semaine depuis le début 2021", "headline_fr_engine": "argos-translate"},
            {"event_id": "reuse", "headline": "Bitcoin rises after ETF inflows", "source_name": "CoinDesk"},
            {"event_id": "crash", "headline": "A $1.1 million crypto card hack crashed a neobank's token 49%", "source_name": "CoinDesk"},
            {"event_id": "term", "headline": "Term Finance loses estimated $8.5M in vault governance exploit", "source_name": "Cointelegraph"},
            {"event_id": "fr", "headline": "Le bitcoin progresse après une annonce européenne", "source_name": "France 24"},
            {"event_id": "fail", "headline": "Translation must fail", "source_name": "BBC Business"},
        ]
    }
    originals = [e["headline"] for e in sample["events"]]

    def fake(text: str) -> str:
        if "Translation must fail" in text:
            raise RuntimeError("synthetic failure")
        # Identity tokens must survive this fake MT unchanged.
        return "FR " + text

    out, summary = translate_payload(sample, fake, previous, "SELFTEST")
    events = {e["event_id"]: e for e in out["events"]}
    assert events["old"]["headline_fr_engine"] == ENGINE_TAG, "old v1 translation must be retranslated"
    assert events["old"]["headline_fr_display"] == "Le marché crypto repart nettement à la hausse, tandis que Bitcoin signe sa deuxième meilleure semaine depuis début 2021"
    assert events["crash"]["headline_fr_display"] == "Le piratage d’une carte crypto à 1,1 M$ fait chuter de 49 % le jeton d’une néobanque"
    assert events["term"]["headline_fr_display"].startswith("Term Finance perd environ 8,5 M$")
    assert events["reuse"]["headline_fr_status"] == "reused_previous_v2"
    assert events["fr"]["headline_fr"] == originals[4]
    assert "headline_fr" not in events["fail"] and events["fail"]["headline_fr_status"] == "fallback_en"
    assert [e["headline"] for e in out["events"]] == originals
    assert summary["canonical_original_preserved"] is True
    assert summary["retranslated_v2"] >= 1
    assert summary["editorialized"] >= 3
    print("ATLAS_NEWS_TRANSLATE_FR V2 SELF-TEST PASS")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--latest", type=Path, default=DEFAULT_LATEST)
    parser.add_argument("--status", type=Path, default=DEFAULT_STATUS)
    parser.add_argument("--require-french", action="store_true", help="Fail if any headline lacks headline_fr/headline_fr_display; intended for publication workflow.")
    args = parser.parse_args()
    if args.self_test:
        return self_test()

    payload = json.loads(args.latest.read_text(encoding="utf-8"))
    previous = previous_payload_from_git(args.latest)
    try:
        translator, engine_version = argos_translator()
        translated, summary = translate_payload(payload, translator, previous, engine_version)
    except Exception as exc:
        translated = copy.deepcopy(payload)
        summary = {
            "schema": SCHEMA, "build": BUILD, "target_language": "fr",
            "source_field": "headline", "raw_translation_field": "headline_fr", "display_field": "headline_fr_display",
            "editorial_layer": EDITORIAL_LAYER,
            "engine": ENGINE, "engine_version": None, "engine_tag": ENGINE_TAG,
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
        eligible = [e for e in events if isinstance(e, dict) and clean(e.get("headline"))]
        missing = [clean(e.get("event_id") or e.get("id") or e.get("headline")) for e in eligible if not clean(e.get("headline_fr")) or not clean(e.get("headline_fr_display"))]
        unavailable = clean(summary.get("status")).lower() == "unavailable"
        if unavailable or missing:
            print(json.dumps({"status": "FAIL", "reason": "french_headline_display_coverage", "eligible": len(eligible), "missing": len(missing), "examples": missing[:5]}, ensure_ascii=False))
            return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
