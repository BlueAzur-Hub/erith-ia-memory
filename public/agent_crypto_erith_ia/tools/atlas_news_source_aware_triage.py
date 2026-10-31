#!/usr/bin/env python3
"""Source-aware News Sentinel triage over the canonical archive; no trading.

Do not infer AI trading profits from hacks, and never conflate several stories
in a weekly security digest. No second RSS request, external scripts or orders.
Only conservative RSS summary-level provenance is available to this classifier.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
import re

SCHEMA="atlas_news_source_aware_article_triage_v1"
BUILD="news-truth-2026-10-31"
DEFAULT=Path("public/agent_crypto_erith_ia/data/news/latest.json")
LOSS=re.compile(r"\b(hackers?|hacked|hack|drained?|stolen|steal|stole|loot(?:ed)?|breach|exploit(?:ed)?)\b",re.I)
AGENT=re.compile(r"\bai agents?\b.{0,100}\b(rescue|security|scan|audit|fork|vulnerabilit)",re.I)
BOT=re.compile(r"\b(?:trading|telegram)\s+bot\b|\bbot\s+(?:hack|hacker|wallet|exploit)",re.I)
USD=re.compile(r"\$\s*(\d+(?:[,.]\d+)?)(?:\s*([KMB]))?\b",re.I)
DIGEST=re.compile(r"\bhodler[’']?s digest\b|\bweekly digest\b|\brecap\b",re.I)


def need(ok,detail):
    if not ok:raise ValueError(detail)


def usd_amount(text):
    m=USD.search(text or "")
    if not m:return None
    digits=m.group(1)
    suffix=(m.group(2) or "").upper()
    if suffix and ("," in digits or digits.count(".")>1):return None
    if not suffix:digits=digits.replace(",","")
    try:amount=float(digits)*(1000 if suffix=="K" else
              1_000_000 if suffix=="M" else
              1_000_000_000 if suffix=="B" else 1)
    except ValueError:return None
    return int(amount) if 0<amount<1_000_000_000_000 else None


def classify(event):
    need(isinstance(event,dict),"News event must be an object")
    headline=str(event.get("headline_original") or event.get("headline") or "")
    body=str(event.get("body") or "")
    story=headline+" "+body
    count=event.get("source_count",0)
    need(type(count) is int and count>=0,"Invalid News Sentinel source count")
    multi=bool(DIGEST.search(story))
    security=bool(LOSS.search(story))
    bot=bool(BOT.search(story))
    research=bool(AGENT.search(story))
    if multi:
        category,watch,money="MULTI_STORY_DIGEST","REVIEW_STORIES_SEPARATELY","UNCLASSIFIED"
    elif security and bot:
        category,watch,money="TRADING_BOT_SECURITY_INCIDENT","SECURITY_AND_CUSTODY_REVIEW","REPORTED_THEFT_NOT_PROFIT"
    elif research:
        category,watch,money="AI_ASSISTED_SECURITY_RESEARCH","DEFENSIVE_RESEARCH_REVIEW","NOT_A_TRADING_RESULT"
    elif security:
        category,watch="REPORTED_SECURITY_INCIDENT","SECURITY_SOURCE_VERIFICATION"
        money=("REPORTED_THEFT_NOT_PROFIT" if re.search(r"\b(stolen|drained?|loot(?:ed)?|steal)\b",story,re.I)
               else "UNCLASSIFIED")
    else:
        category,watch,money="GENERAL_NEWS_NO_EXECUTION","CONTEXT_ONLY","UNCLASSIFIED"
    contradictory=bool(category=="TRADING_BOT_SECURITY_INCIDENT" and
        re.search(r"\bno (?:private )?keys?\b.{0,40}\b(?:accessed|compromised)\b",story,re.I) and
        re.search(r"\b(drained?|hackers?|loot(?:ed)?|stolen)\b",story,re.I))
    amount=(usd_amount(headline) or usd_amount(body)) if money=="REPORTED_THEFT_NOT_PROFIT" else None
    return {
        "schema":SCHEMA,"build":BUILD,"category":category,"watch":watch,
        "money_role":money,"reported_usd_loss":amount,"reported_usd_profit":None,
        "automated_trading_profit_proven":False,
        "bot_is_ai_agent_confirmed":False,
        "claim_conflict_requires_review":contradictory,
        "multi_story_requires_separation":multi,
        "independent_primary_confirmation_in_feed":False,
        "publisher_article_count":count,
        "source_truth":"RSS_SUMMARY_ONLY_NOT_FULL_ARTICLE_FACT_CHECK",
        "market_causality_proven":False,"direct_market_trade_approved":False,
        "read_only":True}


def enrich(doc):
    need(isinstance(doc,dict),"News document must be object")
    events=doc.get("events")
    need(isinstance(events,list) and len(events)<=120,"Unexpected News Sentinel archive")
    counts={}
    for event in events:
        item=classify(event)
        event["news_intelligence"]=item
        counts[item["category"]]=counts.get(item["category"],0)+1
    doc["source_aware_article_triage"]={
        "schema":SCHEMA,"build":BUILD,"events_scanned":len(events),
        "category_counts":dict(sorted(counts.items())),
        "generated_from_canonical_news_only":True,
        "second_collector":False,"article_body_fetch":False,
        "llm_tool_execution_from_article":False,
        "automatic_order":False,"financial_signal":False,
        "market_causality":False,
        "note":"RSS-level conservative classification; human must verify primary evidence."}
    return doc


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--input",type=Path,default=DEFAULT)
    p.add_argument("--output",type=Path)
    p.add_argument("--check-only",action="store_true")
    args=p.parse_args()
    doc=enrich(json.loads(args.input.read_text(encoding="utf-8")))
    if not args.check_only:
        target=args.output or args.input
        target.write_text(json.dumps(doc,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(doc["source_aware_article_triage"],sort_keys=True))


if __name__=="__main__":
    main()
