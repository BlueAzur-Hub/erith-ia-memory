#!/usr/bin/env python3
"""Reconcile existing Radar signals against dated archive outcomes, read only.

NO strategy fit on validation dates. Top50 data are retrospectively assembled;
the temporal split is a diagnostic, never a genuine prospective holdout.
USD CoinGecko returns cannot be executed on OKX/USDT.
"""
from __future__ import annotations

from collections import Counter
from datetime import date, datetime, timedelta, timezone
import json
import math
from pathlib import Path
from statistics import mean, median

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data/crypto/radar-opportunities"
VAULT = ROOT / "data/historical_archive_prototype/okx_verified_daily/index.json"
DEST = SOURCE / "signal-evidence.json"
SCHEMA = "erith.radar.signal-evidence-audit.v1"
CUTOFF = "2026-09-19"  # fixed historical diagnostic, not retroactively optimized
VALIDATION = "2026-09-27"  # 7-calendar-day embargo: 20-26 September
COSTS = (0.8, 1.2, 1.6)
TOP50_RULE = "TOP50_RETROSPECTIVE_MOMENTUM_WITH_EUR_VOLUME_AND_CAP_FILTER"
GROUPS = ("momentum_24h_7d", "rebound_24h_only")


def require(ok, reason):
    if not ok:
        raise ValueError(reason)


def day(value):
    require(isinstance(value, str) and len(value) == 10, "Date manquante")
    result = date.fromisoformat(value)
    require(result.isoformat() == value, "Date invalide")
    return result


def utc(value):
    require(isinstance(value, str) and value.endswith("Z"), "Timestamp UTC manquant")
    value = datetime.fromisoformat(value.replace("Z", "+00:00"))
    require(value.utcoffset() == timedelta(0), "Timestamp non UTC")
    return value


def number(value):
    return type(value) in (int, float) and math.isfinite(value)


def pct_summary(rows):
    """Missing observations remain in denominator, never silently zeroed."""
    observed = [r["observed_return_pct"] for r in rows if r["observed_return_pct"] is not None]
    out = {
        "signals_total": len(rows),
        "followups_observed": len(observed),
        "followups_missing": len(rows) - len(observed),
        "distinct_signal_days": len({r["entry_day_utc"] for r in rows}),
        "distinct_assets": len({r["coin_id"] for r in rows}),
        "mean_observed_gross_change_pct": round(mean(observed), 5) if observed else None,
        "median_observed_gross_change_pct": round(median(observed), 5) if observed else None,
        "observed_positive": sum(x > 0 for x in observed),
        "observed_non_positive": sum(x <= 0 for x in observed),
    }
    return out


def strict_top50(doc):
    require(doc.get("schema") == "erith.radar.top50-retrospective-review.v1"
            and doc.get("record_kind") == "retrospective_descriptive_check_not_paper_trades"
            and doc.get("followup_returns_ignore_fees") is True
            and doc.get("trade_executions_recorded") is False
            and doc.get("forward_horizon_days") == 7
            and isinstance(doc.get("observations"), list), "Archive Top50 incompatible")
    rows = []
    seen = set()
    for r in doc["observations"]:
        coin = r.get("id")
        when = utc(r.get("observed_at"))
        at = when.date()
        target = day(r.get("future_7d_date"))
        require(target - at == timedelta(days=7)
                and isinstance(coin, str) and coin and
                r.get("selection_rule") == TOP50_RULE and
                number(r.get("price_usd")) and r["price_usd"] > 0,
                "Signal Top50 non daté ou incomplet")
        key = (at.isoformat(), coin)
        require(key not in seen, "Signal Top50 répété")
        seen.add(key)
        status = r.get("followup_status")
        observed_return = None
        if status == "OBSERVED_MARKET_SNAPSHOT":
            later = utc(r.get("observed_followup_at"))
            price = r.get("observed_followup_price_usd")
            recorded = r.get("followup_change_pct")
            require(later > when and later.date() == target and
                    number(price) and price > 0 and number(recorded),
                    "Suivi Top50 pas à J+7")
            computed = (price / r["price_usd"] - 1) * 100
            require(abs(computed - recorded) < 0.051,
                    "Variation Top50 contradictoire")
            observed_return = computed
        else:
            require(status in ("ASSET_NOT_IN_TOP50", "FOLLOWUP_SNAPSHOT_MISSING")
                    and r.get("observed_followup_at") is None
                    and r.get("observed_followup_price_usd") is None
                    and r.get("followup_change_pct") is None,
                    "Échec de suivi Top50 non décrit")
        rows.append({"entry_day_utc": at.isoformat(), "coin_id": coin,
                     "observed_return_pct": observed_return,
                     "status": status})
    return rows


def top50_eval(rows):
    periods = {
        "selection_descriptive": [x for x in rows if x["entry_day_utc"] <= CUTOFF],
        "embargo_7_days_excluded": [x for x in rows if CUTOFF < x["entry_day_utc"] < VALIDATION],
        "later_descriptive_validation": [x for x in rows if x["entry_day_utc"] >= VALIDATION],
    }
    output = {}
    for name, part in periods.items():
        record = pct_summary(part)
        scenarios = {}
        for cost in COSTS:
            changes = [x["observed_return_pct"] for x in part
                       if x["observed_return_pct"] is not None]
            modeled = [v - cost for v in changes]
            scenarios[str(cost)] = {
                "roundtrip_friction_pct_assumption": cost,
                "above_friction_on_observed": sum(x > 0 for x in modeled),
                "below_or_equal_friction_on_observed": sum(x <= 0 for x in modeled),
                "mean_observed_gross_minus_assumed_friction_pct":
                    round(mean(modeled), 5) if modeled else None,
                "is_executable_okx_return": False
            }
        output[name] = {**record, "cost_sensitivity_descriptive_only": scenarios}
    return {
        "rule": TOP50_RULE,
        "horizon": "7 calendar days (observed market snapshots, not fills)",
        "selection_dates_inclusive": ["2026-08-21", CUTOFF],
        "embargo_dates_inclusive": ["2026-09-20", "2026-09-26"],
        "validation_starts": VALIDATION,
        "fixed_rule_reused_not_fitted_here": True,
        "true_unseen_holdout": False,
        "source_quote": "USD",
        "reference_no_trade_change_pct": 0,
        "result_is_spot_pnl": False,
        "periods": output
    }


def strict_dynamic(doc):
    require(doc.get("schema") == "erith.radar.dynamic-forward-observations.v1"
            and doc.get("record_kind") == "descriptive_daily_followup_not_paper_trades"
            and doc.get("quote") == "USD"
            and doc.get("orders_enabled") is False
            and doc.get("trade_executions_recorded") is False
            and doc.get("fees_included") is False
            and doc.get("identity_market_pair_certified") is False
            and isinstance(doc.get("observations"), list)
            and isinstance(doc.get("source_archive_dates"), list),
            "Archive Radar prospective incompatible")
    dates = sorted(set(doc["source_archive_dates"]))
    require(all(day(x).isoformat() == x for x in dates), "Dates sources invalides")
    records = []
    seen = set()
    for r in doc["observations"]:
        at = utc(r.get("observed_at_utc"))
        d = day(r.get("first_seen_date_utc"))
        coin = r.get("id")
        group = r.get("group")
        require(at.date() == d and d.isoformat() in dates and group in GROUPS
                and isinstance(coin, str) and coin and
                number(r.get("initial_price_usd")) and r["initial_price_usd"] > 0,
                "Signal Radar Top1000 incomplet")
        key = (d.isoformat(), coin)
        require(key not in seen, "Signal dupliqué")
        seen.add(key)
        follow = r.get("followup_1d")
        require(isinstance(follow, dict) and
                day(follow.get("target_date_utc")) - d == timedelta(days=1),
                "J+1 incohérent")
        change = None
        if follow.get("status") == "OBSERVED_DAILY_SNAPSHOT":
            later = utc(follow.get("at_utc"))
            price = follow.get("price_usd")
            require(later > at and later.date() == d + timedelta(days=1)
                    and number(price) and price > 0
                    and number(follow.get("change_pct")),
                    "J+1 non vérifié")
            change = (price / r["initial_price_usd"] - 1) * 100
            require(abs(change - follow["change_pct"]) < 0.051,
                    "Variation J+1 incohérente")
        else:
            require(follow.get("status") in
                    ("NO_MATCHING_VERIFIED_PRICE", "MISSING_DATED_SNAPSHOT", "AWAITING_FUTURE_DAY")
                    and follow.get("at_utc") is None
                    and follow.get("price_usd") is None
                    and follow.get("change_pct") is None,
                    "Suivi J+1 absent mais prétendument mesuré")
        records.append({"entry_day_utc": d.isoformat(), "coin_id": coin,
                        "group": group, "observed_return_pct": change,
                        "status": follow.get("status")})
    return dates, records


def dynamic_eval(dates, rows):
    buckets = {}
    for group in GROUPS:
        mine = [r for r in rows if r["group"] == group]
        buckets[group] = {**pct_summary(mine),
                          "status_counts": dict(Counter(r["status"] for r in mine)),
                          "trading_costs_applied": False,
                          "okx_spot_identity_proven": False}
    return {
        "source_dates": dates, "horizon": "J+1 dated CoinGecko USD observations",
        "quote": "USD", "notional": None,
        "days_available": len(dates), "historical_holdout": False,
        "needs_prospective_observations": True,
        "fixed_existing_groups_not_tuned_here": list(GROUPS),
        "reference_no_trade_change_pct": 0,
        "buckets": buckets
    }


def okx_context(qualification, journal, vault):
    require(qualification.get("schema") == "erith.radar.spot-qualification.v1"
            and qualification.get("real_orders_enabled") is False
            and qualification.get("coin_id_matches_exchange_symbol_verified") is False
            and len(qualification.get("candidates", [])) == 20,
            "Qualification OKX non certifiée")
    candidates = qualification["candidates"]
    okx = [x for x in candidates if x.get("okx_spot", {}).get("pair_observed") is True]
    rules = [x for x in okx if x["okx_spot"].get("native_rules_verified") is True]
    books = [x for x in rules if x["okx_spot"].get("best_book_status") == "DATED_PUBLIC_BOOK"]
    native = None
    if vault is not None:
        require(vault.get("schema") ==
                "aerith.public.ohlcv.okx.native-utc-daily-source-index.v1"
                and isinstance(vault.get("assets"), list), "Index Coffre OKX incohérent")
        native = sum(x.get("id") in {a["id"] for a in rules} and
                     x.get("quote") == "USDT" for x in vault["assets"])
    count = None
    followups = None
    if journal is not None:
        require(journal.get("schema") == "erith.radar.okx.hurdle-followups.v1"
                and journal.get("orders_enabled") is False
                and journal.get("paper_fills") == 0
                and journal.get("real_orders") == 0
                and isinstance(journal.get("studies"), list), "Journal OKX invalide")
        count = len(journal["studies"])
        followups = sum(len(x.get("followups", [])) for x in journal["studies"])
    return {
        "qualification_at_utc": qualification.get("qualified_at_utc"),
        "radar_total": len(candidates), "okx_pairs_observed": len(okx),
        "okx_native_spot_rules": len(rules), "okx_public_books": len(books),
        "okx_native_daily_vault_overlap": native,
        "okx_hurdle_journal_published": journal is not None,
        "paper_cost_studies": count, "future_bid_followups": followups,
        "quote": "USDT", "contract_identity_proven": False,
        "no_executable_returns_derived_from_usd": True
    }


def build(history, dynamic, qualification, journal=None, vault=None):
    past = strict_top50(history)
    dates, recent = strict_dynamic(dynamic)
    return {
        "schema": SCHEMA, "kind": "RESEARCH_AUDIT_NOT_STRATEGY_SELECTION",
        "orders_enabled": False, "strategy_certified": False,
        "real_orders": 0, "paper_fills": 0,
        "data_provenance": {
            "top50": "data/crypto/radar-opportunities/historical-top50-forward.json",
            "top50_original_snapshots": "data/history/*.jsonl",
            "radar": "data/crypto/radar-opportunities/dynamic-followups.json",
            "okx": "data/crypto/radar-opportunities/qualification-latest.json",
            "okx_public_cost": "data/crypto/radar-opportunities/okx-hurdle-followups.json",
            "vault": "data/historical_archive_prototype/okx_verified_daily/index.json"
        },
        "top50_retro_7d": top50_eval(past),
        "radar_forward_j1": dynamic_eval(dates, recent),
        "okx_context": okx_context(qualification, journal, vault),
        "cautions": [
            "Chronological Top50 split assembled retrospectively; not a truly unseen holdout.",
            "Gross snapshots in USD minus assumed generic friction are NOT OKX USDT P&L.",
            "Missing followups remain missing, not losses or wins; survivor bias possible.",
            "Signals overlap and repeat assets; independent trials do not constitute a capital portfolio.",
            "No 24h/48h OKX PAPER strategy certified; account fees/contract identity not proven.",
            "Zero-trade benchmark 0 is nominal, not risk adjusted."
        ]
    }


def main():
    def read(path):
        return json.loads(path.read_text(encoding="utf-8"))
    report = build(
        read(SOURCE / "historical-top50-forward.json"),
        read(SOURCE / "dynamic-followups.json"),
        read(SOURCE / "qualification-latest.json"),
        read(SOURCE / "okx-hurdle-followups.json")
        if (SOURCE / "okx-hurdle-followups.json").exists() else None,
        read(VAULT) if VAULT.exists() else None)
    payload = json.dumps(report, indent=2, ensure_ascii=False, allow_nan=False) + "\n"
    if not DEST.exists() or DEST.read_text(encoding="utf-8") != payload:
        DEST.write_text(payload, encoding="utf-8")
    print(json.dumps({
        "top50": {p: v["followups_observed"] for p, v in
                  report["top50_retro_7d"]["periods"].items()},
        "radar_j1": {g: v["followups_observed"] for g, v in
                     report["radar_forward_j1"]["buckets"].items()},
        "okx_studies": report["okx_context"]["paper_cost_studies"],
        "report": str(DEST)}))


if __name__ == "__main__":
    main()
