#!/usr/bin/env python3
"""Seven Heaven: one-shot public OKX Spot BTC/USDC and ETH/USDC orderbook research.

No credentials, no order endpoints, no account operations. One GET per pair.
One frozen orderbook is not historical execution evidence or a trading signal.

Run from repository root:
python coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_OKX_SPOT_BTC_ETH_USDC_ORDERBOOK_ONE_SHOT_2026_11_12.py
python ...py --self-test
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation, getcontext
import csv
import hashlib
import json
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

getcontext().prec = 38

RESEARCH_BASE = Path("coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles")
DEFAULT_OUTPUT = RESEARCH_BASE / "okx_spot_usdc_orderbook_2026_11_12_evidence"
ENDPOINT = "https://www.okx.com/api/v5/market/books"
PAIR_IDS = ("BTC-USDC", "ETH-USDC")
QUOTE_AMOUNTS = ("10", "100", "1000", "10000", "100000")
FEE_SCENARIOS = {"illustrative_taker_0_10_pct": Decimal("10"),
                 "illustrative_taker_0_35_pct": Decimal("35")}
BP = Decimal("10000")
ZERO = Decimal("0")


def utc_now():
    return datetime.now(timezone.utc)


def iso(dt):
    return dt.isoformat(timespec="milliseconds").replace("+00:00", "Z")


def dec(x):
    try:
        v = Decimal(str(x))
    except (InvalidOperation, ValueError) as e:
        raise ValueError("Nondecimal orderbook field") from e
    if not v.is_finite():
        raise ValueError("Infinite/NaN orderbook field")
    return v


def fp(x, digits=8):
    return float(round(x, digits)) if x is not None else None


def read_levels(rows, side):
    if not isinstance(rows, list) or not rows:
        raise ValueError("Missing or empty " + side)
    out = []
    for row in rows:
        if not isinstance(row, list) or len(row) < 2:
            raise ValueError("Malformed " + side + " level")
        price, qty = dec(row[0]), dec(row[1])
        if price <= 0 or qty <= 0:
            raise ValueError("Nonpositive " + side + " level")
        if out and (price < out[-1][0] if side == "asks" else price > out[-1][0]):
            raise ValueError(side + " levels not ordered best first")
        out.append((price, qty))
    return out


def buy_fixed_quote(asks, amount):
    """Assume Q units of USDC are spent on asks; return weighted average buy px."""
    remaining = amount
    acquired = ZERO
    touched = 0
    for price, size in asks:
        if remaining <= 0:
            break
        spend = min(remaining, size * price)
        acquired += spend / price
        remaining -= spend
        touched += 1
    if remaining > Decimal("0.00000000001") or acquired <= 0:
        return None
    return {"vwap": amount/acquired, "base_qty": acquired, "levels": touched}


def sell_fixed_mid_notional(bids, amount, mid):
    """Sell base quantity Q/mid on bids, report USDC proceeds and VWAP."""
    qty = amount/mid
    remaining = qty
    proceeds = ZERO
    touched = 0
    for price, size in bids:
        if remaining <= 0:
            break
        take = min(remaining, size)
        proceeds += take*price
        remaining -= take
        touched += 1
    if remaining > Decimal("0.00000000001") or proceeds <= 0:
        return None
    return {"vwap": proceeds/qty, "base_qty": qty, "proceeds": proceeds,
            "levels": touched}


def analyse_book(payload, pair_id, received_at):
    if not isinstance(payload, dict) or str(payload.get("code")) != "0":
        raise ValueError("OKX code not 0: " + str(payload.get("code"))[:70])
    data = payload.get("data")
    if not isinstance(data, list) or len(data) != 1:
        raise ValueError("Expected exactly one OKX book")
    book = data[0]
    asks = read_levels(book.get("asks"), "asks")
    bids = read_levels(book.get("bids"), "bids")
    best_ask, best_bid = asks[0][0], bids[0][0]
    if best_ask <= best_bid:
        raise ValueError("Crossed or locked book: cannot estimate mid spread")
    ts_millis = int(str(book.get("ts", "")))
    if ts_millis < 1600000000000:
        raise ValueError("Missing/unreasonable millisecond exchange timestamp")
    source_at = datetime.fromtimestamp(ts_millis / 1000, timezone.utc)
    age_millis = (received_at-source_at).total_seconds()*1000
    if age_millis > 300000 or age_millis < -30000:
        raise ValueError("Book timestamp stale or future-skewed; refusing metric")
    mid = (best_ask+best_bid)/2
    spread_bps = (best_ask-best_bid)/mid*BP
    meta = {
        "pair": pair_id,
        "quote_currency": "USDC",
        "base_currency": pair_id.split("-")[0],
        "received_at_utc": iso(received_at),
        "exchange_ts_utc": iso(source_at),
        "exchange_ts_unix_ms": ts_millis,
        "source_age_milliseconds": fp(Decimal(str(age_millis)),1),
        "ask_levels_available": len(asks),
        "bid_levels_available": len(bids),
        "best_ask": str(best_ask),
        "best_bid": str(best_bid),
        "mid": str(mid),
        "spread_bps": fp(spread_bps,6),
        "half_spread_bps": fp(spread_bps/2,6),
        "amounts": [],
        "caveat": "Frozen public visible orderbook, not executed orders or future liquidity."
    }
    for value in QUOTE_AMOUNTS:
        amount = dec(value)
        buy = buy_fixed_quote(asks, amount)
        sell = sell_fixed_mid_notional(bids, amount, mid)
        output = {"notional_usdc": value}
        for label, side in (("buy", buy), ("sell", sell)):
            if side is None:
                output[label] = {"status": "insufficient_visible_depth"}
                continue
            vwap = side["vwap"]
            cost_bps = ((vwap/mid-1)*BP if label=="buy"
                        else (1-vwap/mid)*BP)
            walk_bps = cost_bps - spread_bps/2
            output[label] = {
                "status": "complete",
                "base_qty": str(side["base_qty"]),
                "vwap": str(vwap),
                "book_levels_consumed": side["levels"],
                "mid_to_vwap_bps": fp(cost_bps,6),
                "beyond_half_spread_bps": fp(walk_bps,6),
                "illustrative_all_in_one_side_bps": {
                    key: fp(cost_bps+fee,6)
                    for key,fee in FEE_SCENARIOS.items()
                },
                "comparison_to_old_model_15bp_per_side": (
                    "higher" if cost_bps+Decimal("10")>Decimal("15")
                    else "lower_or_equal")
            }
        meta["amounts"].append(output)
    return meta


def one_pair(pair_id, output):
    if pair_id not in PAIR_IDS:
        raise ValueError("Unapproved symbol")
    url = ENDPOINT + "?" + urlencode({"instId":pair_id,"sz":400})
    request = Request(url, headers={
        "Accept": "application/json",
        "User-Agent": "Seven-Heaven-OKX-OrderBook-PAPER-Research/1.0"})
    report = {"pair":pair_id,"url":url,"status":"unavailable"}
    try:
        with urlopen(request,timeout=25) as response:
            raw = response.read(2000000)
        received = utc_now()
        report["received_at_utc"] = iso(received)
        report["http_raw_sha256"] = hashlib.sha256(raw).hexdigest()
        payload = json.loads(raw.decode("utf-8"))
        # Preserve EXACT bytes actually obtained from OKX.
        rawfile = "okx_"+pair_id.lower().replace("-","_")+"_orderbook_raw.json"
        (output/rawfile).write_bytes(raw)
        report["raw_data_file"] = rawfile
        analysis = analyse_book(payload,pair_id,received)
        report.update({"status":"complete","analysis":analysis})
    except (HTTPError, URLError, ValueError, TypeError, KeyError,
            OverflowError, json.JSONDecodeError) as e:
        report["status"] = "unavailable"
        report["error_type"] = type(e).__name__
        report["error_message"] = str(e)[:300]
        if isinstance(e, HTTPError):
            report["http_status"] = e.code
    return report


def write_artifacts(out, entries):
    status = ("complete" if all(x["status"]=="complete" for x in entries)
              else "partial" if any(x["status"]=="complete" for x in entries)
              else "unavailable")
    doc = {
        "schema": "seven-heaven.okx-usdc-spot-orderbook-point-in-time-costs.v1",
        "status": status,
        "research_date": "2026-11-12",
        "public_api_only": True,
        "live_trading": False,
        "order_execution": False,
        "endpoint": ENDPOINT,
        "instruments_requested": list(PAIR_IDS),
        "notional_usdc": list(QUOTE_AMOUNTS),
        "illustrative_taker_fee_bps_per_side": {
            k:float(v) for k,v in FEE_SCENARIOS.items()},
        "prespecified_historical_comparators": {
            "reference_total_one_side_bps":15.0,
            "ema_equals_hold_historical_threshold_bps":55.0629,
            "old_result_is_historical_not_a_predictive_cost_limit":True},
        "snapshots": entries,
        "limits": [
            "One public book per instrument; not historical bid-ask execution costs.",
            "Snapshot changes before orders could execute; no market impact or latency.",
            "Fees are illustrative, not the user's verified actual account fees.",
            "BTC-USDC and ETH-USDC have independent timestamps, no simultaneous-book claim.",
            "No inferential update to historical EMA P&L from a current orderbook.",
            "No private account, authentication, order placement or trading permission."
        ]
    }
    (out/"SEVEN_HEAVEN_OKX_SPOT_USDC_ORDERBOOK_COST_EVIDENCE.json").write_text(
        json.dumps(doc,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    rows = []
    for entry in entries:
        if entry["status"]!="complete":
            for q in QUOTE_AMOUNTS:
                for side in ("buy","sell"):
                    rows.append({"pair":entry["pair"],"amount_usdc":q,"side":side,
                                 "status":"unavailable","spread_bps":"",
                                 "price_cost_bps":"","walk_bps":"",
                                 "price_plus_fee10_bps":"","price_plus_fee35_bps":""})
            continue
        book = entry["analysis"]
        for amount in book["amounts"]:
            for side in ("buy","sell"):
                v=amount[side]
                good=v["status"]=="complete"
                rows.append({
                    "pair":book["pair"],"amount_usdc":amount["notional_usdc"],
                    "side":side,"status":v["status"],
                    "spread_bps":book["spread_bps"],
                    "price_cost_bps":v["mid_to_vwap_bps"] if good else "",
                    "walk_bps":v["beyond_half_spread_bps"] if good else "",
                    "price_plus_fee10_bps":v["illustrative_all_in_one_side_bps"]
                        ["illustrative_taker_0_10_pct"] if good else "",
                    "price_plus_fee35_bps":v["illustrative_all_in_one_side_bps"]
                        ["illustrative_taker_0_35_pct"] if good else ""
                })
    with (out/"SEVEN_HEAVEN_OKX_SPOT_USDC_COST_BY_NOTIONAL.csv").open(
          "w",newline="",encoding="utf-8") as f:
        names=("pair","amount_usdc","side","status","spread_bps",
               "price_cost_bps","walk_bps","price_plus_fee10_bps",
               "price_plus_fee35_bps")
        writer=csv.DictWriter(f,fieldnames=names,lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    r=["# Seven Heaven — OKX Spot BTC/USDC et ETH/USDC : instantané du carnet",
       "",
       "**Étude de lecture publique ponctuelle, sans compte ni ordre réel.**",
       "L'observation ne peut pas reconstituer les coûts historiques du replay EMA.",
       "",
       "Le prix moyen estimé dépend des tailles visibles au carnet de ce seul instant.",
       "La partie frais reste illustrative : taker 0,10 % ou 0,35 % par côté ;",
       "les frais applicables à un compte doivent être vérifiés séparément.",
       "",
       "| Paire | Capture UTC / état | Spread (bp) |",
       "|---|---|---:|"]
    for e in entries:
        if e["status"]=="complete":
            x=e["analysis"]
            r.append(f"| {e['pair']} | {x['exchange_ts_utc']} | {x['spread_bps']} |")
        else:
            r.append(f"| {e['pair']} | INDISPONIBLE : {e.get('error_type','unknown')} | — |")
    r.extend(["",
        "Consulter le CSV pour les scénarios de 10, 100, 1 000, 10 000 et 100 000 USDC",
        "en achat et vente. \`insufficient_visible_depth\` signifie qu'aucun coût n'a",
        "été inventé pour un ordre dépassant la profondeur visible.",
        "",
        "**Limite centrale :** une observation de spread et de profondeur ponctuelle",
        "ne peut ni valider ni invalider les 122 opérations historiques EMA.",
        "Les facteurs de coût observés ici ne sont pas des frais d'exécution réalisés.",
        "",
        "Documentation : https://www.okx.com/docs-v5/en/",
        "Barème EEE : https://www.okx.com/en-eu/help/what-are-the-new-trading-fees-for-eea-users",
        ""])
    (out/"SEVEN_HEAVEN_OKX_SPOT_USDC_ORDERBOOK_COST_REPORT.md").write_text(
        "\n".join(r),encoding="utf-8")
    return doc


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--output",type=Path,default=DEFAULT_OUTPUT)
    p.add_argument("--self-test",action="store_true")
    opt=p.parse_args()
    if opt.self_test:
        # Deterministic synthetic two-level order book with defined VWAP.
        at=datetime(2026,11,12,tzinfo=timezone.utc)
        ts=str(int(at.timestamp()*1000))
        payload={"code":"0","data":[{"ts":ts,
                 "asks":[["100","1","0","1"],["101","5","0","1"]],
                 "bids":[["99","1","0","1"],["98","5","0","1"]]}]}
        result=analyse_book(payload,"ETH-USDC",at)
        assert result["spread_bps"]>0
        assert result["amounts"][0]["buy"]["status"]=="complete"
        assert result["amounts"][-1]["buy"]["status"]=="insufficient_visible_depth"
        assert result["amounts"][-1]["sell"]["status"]=="insufficient_visible_depth"
        assert result["amounts"][0]["buy"]["mid_to_vwap_bps"]>0
        assert result["amounts"][0]["sell"]["mid_to_vwap_bps"]>0
        try:
            analyse_book({"code":"50011"}, "ETH-USDC", at)
        except ValueError:
            pass
        else:
            raise AssertionError("Invalid exchange response accepted")
        print("PASS: VWAP buy/sell, fixed quote amounts, depth rejection, spread, invalid API refusal")
        return
    opt.output.mkdir(parents=True,exist_ok=True)
    records=[one_pair(pair,opt.output) for pair in PAIR_IDS]
    report=write_artifacts(opt.output,records)
    print(json.dumps({"status":report["status"],"pair_statuses":
         {x["pair"]:x["status"] for x in records},
         "output":str(opt.output)},indent=2))


if __name__=="__main__":
    main()
