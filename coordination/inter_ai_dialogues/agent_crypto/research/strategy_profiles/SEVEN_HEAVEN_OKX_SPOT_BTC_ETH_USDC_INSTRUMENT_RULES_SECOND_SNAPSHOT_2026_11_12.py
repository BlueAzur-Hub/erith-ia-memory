#!/usr/bin/env python3
"""Seven Heaven: public OKX Spot instrument rules and second market snapshot.

Exactly two instruments, read-only HTTP GET. No accounts, POST, API credentials,
order execution, trading, recurring schedule or personal data.
Run from repository root. Python >=3.10, standard library only.
"""
from __future__ import annotations
import argparse
from datetime import datetime, timezone
from decimal import Decimal, ROUND_FLOOR
import hashlib
import importlib.util
import csv
import io
import json
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urlencode

BASE=Path("coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles")
OUT=BASE/"okx_spot_instrument_rules_second_snapshot_2026_11_12_evidence"
ENGINE=BASE/"SEVEN_HEAVEN_OKX_SPOT_BTC_ETH_USDC_ORDERBOOK_ONE_SHOT_2026_11_12.py"
ENGINE_BLOB="a690583ffe9d1a1780e1ee1f52d9a1cb6ad7c0ae"
OLD=BASE/"okx_spot_usdc_orderbook_2026_11_12_evidence/SEVEN_HEAVEN_OKX_SPOT_USDC_ORDERBOOK_COST_EVIDENCE.json"
OLD_BLOB="2d7ff439b9699f14b07c5eed5588664aa6503b77"
PAIR=("BTC-USDC","ETH-USDC")
NOTIONAL=("10","20","100","1000")
META_URL="https://www.okx.com/api/v5/public/instruments"
BOOK_URL="https://www.okx.com/api/v5/market/books"


def sha256(raw):
    return hashlib.sha256(raw).hexdigest()


def sha1blob(raw):
    return hashlib.sha1(b"blob "+str(len(raw)).encode()+b"\0"+raw).hexdigest()


def check_bytes(path,sha):
    raw=path.read_bytes()
    if sha1blob(raw)!=sha:
        raise ValueError("Canonical source changed: "+str(path))
    return raw


def load_book_math(root):
    file=root/ENGINE
    check_bytes(file,ENGINE_BLOB)
    spec=importlib.util.spec_from_file_location("seven_book_costs",file)
    module=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def utc():
    return datetime.now(timezone.utc)


def utc_iso(value):
    return value.isoformat(timespec="milliseconds").replace("+00:00","Z")


def get_public(url,query):
    target=url+"?"+urlencode(query)
    req=Request(target,headers={"Accept":"application/json",
                                 "User-Agent":"Seven-Heaven-PAPER-Instrument-Research/1.0"})
    with urlopen(req,timeout=35) as resp:
        raw=resp.read(2000000)
    got_at=utc()
    return target,raw,got_at


def decimal_positive(raw,name):
    value=Decimal(str(raw))
    if not value.is_finite() or value<=0:
        raise ValueError(name+" is not positive")
    return value


def read_metadata(payload,pair):
    if str(payload.get("code"))!="0":
        raise ValueError("OKX metadata response error code "+str(payload.get("code")))
    data=payload.get("data")
    if not isinstance(data,list) or len(data)!=1:
        raise ValueError("Expected exactly one instrument")
    instrument=data[0]
    base=pair.split("-")[0]
    if (instrument.get("instType")!="SPOT" or instrument.get("instId")!=pair
        or instrument.get("baseCcy")!=base or instrument.get("quoteCcy")!="USDC"):
        raise ValueError("Unexpected instrument/pair/base/quote")
    fields={k:decimal_positive(instrument.get(k),k)
            for k in ("minSz","lotSz","tickSz")}
    result={"instId":pair,"instType":"SPOT","baseCcy":base,"quoteCcy":"USDC",
            "state":instrument.get("state"),
            "minSz":str(fields["minSz"]),"lotSz":str(fields["lotSz"]),
            "tickSz":str(fields["tickSz"])}
    for k in ("maxLmtSz","maxMktSz","maxLmtAmt","maxMktAmt","listTime","contTdSwTime"):
        if k in instrument:
            result[k]=instrument.get(k)
    return result


def estimate_limit_size(notional,ask,metadata):
    budget=Decimal(str(notional))
    price=decimal_positive(ask,"best ask")
    minsz=decimal_positive(metadata["minSz"],"minSz")
    lot=decimal_positive(metadata["lotSz"],"lotSz")
    tick=decimal_positive(metadata["tickSz"],"tickSz")
    lots=(budget/price/lot).to_integral_value(rounding=ROUND_FLOOR)
    quantity=lots*lot
    spent=quantity*price
    ticks=price/tick
    on_tick=ticks==ticks.to_integral_value()
    return {
        "budget_usdc":str(budget),
        "best_ask_usdc":str(price),
        "theoretical_base_quantity_at_best_ask":str(quantity),
        "theoretical_quote_used_usdc":str(spent),
        "unspent_budget_usdc":str(budget-spent),
        "base_quantity_at_least_minSz":quantity>=minsz,
        "best_ask_is_tick_grid_aligned":on_tick,
        "not_an_executable_order":True,
        "caveat":"Limit-size illustration only, excludes fees, notional thresholds, balance/region rules and liquidity changes"
    }


def take_one(pair,out,book_engine):
    safe=pair.lower().replace("-","_")
    result={"pair":pair,"status":"unavailable"}
    for resource,url,query in (
        ("instrument",META_URL,{"instType":"SPOT","instId":pair}),
        ("book",BOOK_URL,{"instId":pair,"sz":"400"})):
        try:
            actual_url,raw,received=get_public(url,query)
            filename=f"okx_{safe}_{resource}_raw.json"
            (out/filename).write_bytes(raw)
            result[resource+"_retrieval"]={
                "url":actual_url,"file":filename,"received_at_utc":utc_iso(received),
                "sha256":sha256(raw)}
            payload=json.loads(raw)
            if resource=="instrument":
                result["instrument"]=read_metadata(payload,pair)
            else:
                result["book_analysis"]=book_engine.analyse_book(payload,pair,received)
        except Exception as error:
            result[resource+"_error"]={"type":type(error).__name__,
                                        "message":str(error)[:250]}
    if "instrument" in result and "book_analysis" in result:
        result["status"]="complete"
        book=result["book_analysis"]
        result["limit_size_examples"]=[
            estimate_limit_size(n,book["best_ask"],result["instrument"])
            for n in NOTIONAL]
    elif "instrument" in result or "book_analysis" in result:
        result["status"]="partial"
    return result


def previous_values(raw):
    payload=json.loads(raw)
    if payload.get("schema")!="seven-heaven.okx-usdc-spot-orderbook-point-in-time-costs.v1":
        raise ValueError("Old study schema mismatch")
    samples={}
    for item in payload["snapshots"]:
        if item.get("status")!="complete" or item.get("pair") not in PAIR:
            raise ValueError("Pinned prior snapshot not fully validated")
        a=item["analysis"]
        samples[item["pair"]]={"book_at_utc":a["exchange_ts_utc"],
                               "spread_bps":a["spread_bps"],
                               "best_bid":a["best_bid"],"best_ask":a["best_ask"]}
    if set(samples)!=set(PAIR):
        raise ValueError("Missing old pair")
    return samples


def produce(results,old,out):
    status=("complete" if all(r["status"]=="complete" for r in results)
            else "partial" if any(r["status"] in ("partial","complete") for r in results)
            else "unavailable")
    rows=[]
    comparisons=[]
    for r in results:
        pair=r["pair"]
        if "book_analysis" in r:
            book=r["book_analysis"]
            now_spread=Decimal(str(book["spread_bps"]))
            old_spread=Decimal(str(old[pair]["spread_bps"]))
            comparisons.append({
                "pair":pair,
                "first_timestamp_utc":old[pair]["book_at_utc"],
                "second_timestamp_utc":book["exchange_ts_utc"],
                "first_spread_bps":float(old_spread),
                "second_spread_bps":float(now_spread),
                "change_in_spread_bps":round(float(now_spread-old_spread),6),
                "meaning":"two observations only, not a volatility model"
            })
        for n in NOTIONAL:
            x=next((x for x in r.get("limit_size_examples",[])
                    if x["budget_usdc"]==n),None)
            rows.append({"pair":pair,"budget_usdc":n,
                         "status":r["status"],
                         "instrument_state":r.get("instrument",{}).get("state",""),
                         "minSz":r.get("instrument",{}).get("minSz",""),
                         "lotSz":r.get("instrument",{}).get("lotSz",""),
                         "tickSz":r.get("instrument",{}).get("tickSz",""),
                         "best_ask":x["best_ask_usdc"] if x else "",
                         "theoretical_base_quantity":x["theoretical_base_quantity_at_best_ask"] if x else "",
                         "quantity_meets_minSz":x["base_quantity_at_least_minSz"] if x else "",
                         "best_ask_tick_aligned":x["best_ask_is_tick_grid_aligned"] if x else "",
                         "not_executable_ticket":True})
    evidence={
        "schema":"seven-heaven.okx-spot-instrument-rules-second-book-snapshot.v1",
        "research_date":"2026-11-12",
        "status":status,
        "read_only":True,
        "order_execution":False,
        "protocol":"SEVEN_HEAVEN_OKX_SPOT_BTC_ETH_USDC_INSTRUMENT_RULES_AND_SECOND_SNAPSHOT_PROTOCOL_2026_11_12.md",
        "original_observation_git_sha1":OLD_BLOB,
        "book_math_engine_git_sha1":ENGINE_BLOB,
        "comparisons":comparisons,
        "pair_results":results,
        "limits":[
            "A limit-size illustration is not validated order execution.",
            "Only public instruments metadata: account/region restrictions and precise fee schedule remain unverified.",
            "Market-order sz can be in quote or base currency depending on tgtCcy.",
            "Prices at a book snapshot are not guaranteed fill prices.",
            "Two snapshots at different times do not establish an hourly pattern, historical slippage, or future returns.",
            "The existing EMA backtest is not recalculated using these two instantaneous observations."
        ]}
    (out/"SEVEN_HEAVEN_OKX_INSTRUMENT_RULES_SECOND_SNAPSHOT_EVIDENCE.json").write_text(
        json.dumps(evidence,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    with (out/"SEVEN_HEAVEN_OKX_INSTRUMENT_RULES_LIMIT_SIZE_EXAMPLES.csv").open(
         "w",newline="",encoding="utf8") as f:
        keys=list(rows[0])
        writer=csv.DictWriter(f,fieldnames=keys,lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    report=["# Seven Heaven — OKX Spot : contraintes d'instrument et deuxième relevé",
            "","**Étude publique, lecture seule : aucune opération, aucune recommandation de trading.**",
            "","## Données instrument récupérées",
            "",
            "| Paire | État API | minSz (base) | lotSz (base) | tickSz (USDC) |",
            "|---|---|---:|---:|---:|"]
    for x in results:
        q=x.get("instrument",{})
        report.append("| "+ " | ".join([x["pair"],str(q.get("state","indisponible")),
              str(q.get("minSz","—")),str(q.get("lotSz","—")),
              str(q.get("tickSz","—"))])+" |")
    report.extend(["","## Deux observations, pas une tendance horaire","",
                   "| Paire | Spread ancien (bp) | Nouveau (bp) | Écart (bp) |",
                   "|---|---:|---:|---:|"])
    for c in comparisons:
        report.append(f"| {c['pair']} | {c['first_spread_bps']:.6f} | "
                      f"{c['second_spread_bps']:.6f} | {c['change_in_spread_bps']:+.6f} |")
    report.extend(["","Les heures UTC des deux captures, les octets JSON publics et leurs SHA-256",
                   "sont conservés dans les preuves JSON et les fichiers bruts.",
                   "Le CSV des exemples contient les montants théoriques 10/20/100/1000 USDC.",
                   "",
                   "**Avertissement :** minSz et lotSz sont des quantités en monnaie de base.",
                   "tickSz est un pas de prix en USDC. Les règles d'ordres au marché",
                   "peuvent utiliser tgtCcy=quote_ccy ou base_ccy, et la disponibilité",
                   "effective d'un instrument dépend aussi du compte, des restrictions",
                   "régionales, des soldes et des limites non modélisées.",
                   "Deux instantanés ne révèlent pas la variation des spreads par heure.",
                   "Aucune donnée n'a été injectée dans le backtest EMA 2024–2026.",
                   ""])
    (out/"SEVEN_HEAVEN_OKX_INSTRUMENT_RULES_SECOND_SNAPSHOT_REPORT.md").write_text(
        "\n".join(report),encoding="utf8")
    return evidence


def selftest():
    meta={"minSz":"0.0001","lotSz":"0.0001","tickSz":"0.01"}
    q=estimate_limit_size("10","2000",meta)
    assert q["theoretical_base_quantity_at_best_ask"]=="0.0050"
    assert q["base_quantity_at_least_minSz"]
    assert q["best_ask_is_tick_grid_aligned"]
    q=estimate_limit_size("0.01","2000",meta)
    assert not q["base_quantity_at_least_minSz"]
    try:
        read_metadata({"code":"0","data":[{"instType":"SWAP","instId":"BTC-USDC"}]},
                      "BTC-USDC")
    except ValueError:
        pass
    else:
        raise AssertionError("Non-SPOT instrument accepted")
    print("PASS: decimal sizing, minSz and tickSz, incorrect instrument rejected")


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--repo-root",type=Path,default=Path("."))
    p.add_argument("--output",type=Path)
    p.add_argument("--selftest",action="store_true")
    a=p.parse_args()
    if a.selftest:
        selftest()
        return
    root=a.repo_root
    dest=a.output or root/OUT
    dest.mkdir(parents=True,exist_ok=True)
    book_engine=load_book_math(root)
    old=previous_values(check_bytes(root/OLD,OLD_BLOB))
    result=[take_one(pair,dest,book_engine) for pair in PAIR]
    doc=produce(result,old,dest)
    print(json.dumps({"status":doc["status"],"pairs":{x["pair"]:x["status"] for x in result},
                      "comparisons":doc["comparisons"]},indent=2,ensure_ascii=False))


if __name__=="__main__":
    main()
