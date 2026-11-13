#!/usr/bin/env python3
"""Bounded public-data-only OKX Spot BTC-USDC / ETH-USDC order-eligibility audit.
No trading, account, credentials, bridge, or orders. Prints a dated report and JSON.
Run from repository root. Python >=3.10 standard library only.
"""
from __future__ import annotations
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import sys
import time
from decimal import Decimal, ROUND_FLOOR
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path("coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles")
TARGET = ROOT / "seven_heaven_okx_public_eligibility_evidence"
PAIRS = ("BTC-USDC", "ETH-USDC")
BASES = ("https://www.okx.com", "https://eea.okx.com")
TAKER = Decimal("0.001")    # Observed account display 6/9/12 Nov; not a public fee guarantee
V5_SLIP = Decimal("0.0005") # Hypothesis, not measured impact
BUDGETS = ("10", "20", "100", "1000")
def stamp():
    return dt.datetime.now(dt.timezone.utc).isoformat()
def get(endpoint, params):
    query = urlencode(params)
    errs = []
    for host in BASES:
        url = host + endpoint + "?" + query
        try:
            req=Request(url,headers={"Accept":"application/json","User-Agent":"SevenHeavenSpotReadOnlyResearch/1.0"})
            with urlopen(req,timeout=23) as rsp:
                if rsp.status!=200: raise ValueError(f"HTTP {rsp.status}")
                raw=rsp.read(350_000)
            o=json.loads(raw)
            if not isinstance(o,dict) or o.get("code")!="0":
                raise ValueError("OKX response code="+str(o.get("code"))+" msg="+str(o.get("msg")))
            return o,{"url":url,"host":host,"sha256":hashlib.sha256(raw).hexdigest(),
                       "retrieved_utc":stamp(),"code":o.get("code")}
        except Exception as exc:
            errs.append({"url":url,"error_type":type(exc).__name__,"message":str(exc)[:180]})
    raise RuntimeError("Public API lookup failed: "+json.dumps(errs))
def dec(v):
    d=Decimal(str(v))
    if not d.is_finite() or d<=0:raise ValueError("Non-positive/invalid number")
    return d
def budget_table(info,ticker):
    min_size=dec(info["minSz"]);lot=dec(info["lotSz"]);ask=dec(ticker["askPx"])
    min_notional=min_size*ask
    out=[]
    for item in BUDGETS:
        nominal=Decimal(item)
        raw_qty=nominal/(ask*(1+TAKER))
        qty=(raw_qty/lot).to_integral_value(rounding=ROUND_FLOOR)*lot
        out.append({"budget_usdc":item,"qty_approx_base":str(qty),
                    "estimated_ask_notional_usdc":str(qty*ask),
                    "above_minSz_only":qty>=min_size,
                    "note":"Approximate only: other min-notional rules, quote rounding, fees in crypto, and account eligibility NOT tested"})
    return {"minimum_base_qty":str(min_size),"minimum_base_notional_at_ask_usdc":str(min_notional),
            "budget_scenarios":out}
def main():
    started=stamp()
    out={"schema":"seven-heaven.okx-public-spot-order-eligibility-v1",
         "started_utc":started,"status":"PUBLIC_DATA_ONLY_NO_ORDERS",
         "account_reference":{"maker_pct":"0.08","taker_pct":"0.10",
           "source":"Notion OKX MEMORY CORE 01 Trading Fees, authenticated screenshots 6,9,12 Nov 2026",
           "account_fee_verified_against_trade_fills":False},
         "v5_fixed_slippage_pct_side":"0.05",
         "scope":"Public OKX Spot instrument and ticker fields, not EEA account trading permission",
         "pairs":{},"errors":[]}
    factor=(1-TAKER)/(1+V5_SLIP)*(1-V5_SLIP)*(1-TAKER)
    out["v5_flat_price_roundtrip"]={"factor":str(factor),
       "cost_pct":str((1-factor)*100),
       "break_even_price_rise_pct":str((1/factor-1)*100),
       "cost_by_budget_usdc":{x:str(Decimal(x)*(1-factor)) for x in BUDGETS}}
    for pair in PAIRS:
        try:
            data,p=get("/api/v5/public/instruments",{"instType":"SPOT","instId":pair})
            matches=[v for v in data.get("data",[]) if v.get("instId")==pair and v.get("instType")=="SPOT"]
            if len(matches)!=1:raise ValueError("No single exact instrument entry returned for "+pair)
            ins=matches[0]
            recorded={"instrument_request":p,"instrument":{
                k:ins.get(k) for k in ("instId","instType","state","baseCcy","quoteCcy",
                    "lotSz","minSz","tickSz","tradeQuoteCcyList","ruleType")}}
            if ins.get("state")!="live":
                recorded["warning"]="Public instrument not marked live; no eligibility calculation"
                out["pairs"][pair]=recorded
                continue
            tick,q=get("/api/v5/market/ticker",{"instId":pair})
            matchs=[v for v in tick.get("data",[]) if v.get("instId")==pair]
            if len(matchs)!=1:raise ValueError("No single exact ticker entry returned")
            t=matchs[0]
            recorded["ticker_request"]=q
            recorded["ticker"]={k:t.get(k) for k in ("instId","last","bidPx","askPx","ts")}
            try:
                age=(dt.datetime.now(dt.timezone.utc).timestamp()*1000-int(t["ts"]))/1000
                recorded["ticker_age_seconds_at_check"]=round(age,2)
                if age<0 or age>120:
                    recorded["warning"]="Ticker stale or future-dated; budget results not credible"
                else:
                    recorded["order_size_estimates"]=budget_table(ins,t)
            except Exception as e:
                recorded["warning"]="Ticker age/market size not calculated: "+str(e)
            out["pairs"][pair]=recorded
        except Exception as e:
            out["errors"].append({"pair":pair,"error_type":type(e).__name__,"message":str(e)[:800]})
    out["completed_utc"]=stamp()
    out["limitations"]=[
        "Public instrument state is NOT proof of permission for a specific France/EEA account",
        "Minimum base size alone may not capture min quote amount or exchange order validity",
        "Ticker is a snapshot, not historical execution or an orderbook fill",
        "No maker queue, effective fee discounts, market pair exception, order rounding or conversion",
        "V5 5 bp slip is a fixed research assumption; never double-count spread against real VWAP",
        "No orders or authenticated API operations. No credentials used."]
    if len(out["pairs"])!=2 or out["errors"]:
        print(json.dumps({"status":"INCOMPLETE_NO_REPORT","errors":out["errors"],"returned_pairs":list(out["pairs"])},indent=2))
        raise SystemExit(2)
    # Refuse to write incomplete/inconsistent evidence as a validated report.
    for pair in PAIRS:
        if "order_size_estimates" not in out["pairs"][pair]:
            print(json.dumps({"status":"INCOMPLETE_NO_REPORT", "pair":pair,"details":out["pairs"][pair]},indent=2))
            raise SystemExit(2)
    TARGET.mkdir(parents=True,exist_ok=True)
    tag="2026_11_13"
    jpath=TARGET/("SEVEN_HEAVEN_OKX_BTC_ETH_USDC_PUBLIC_ELIGIBILITY_"+tag+"_PROOFS.json")
    mpath=TARGET/("SEVEN_HEAVEN_OKX_BTC_ETH_USDC_PUBLIC_ELIGIBILITY_"+tag+"_REPORT.md")
    if jpath.exists() or mpath.exists():raise ValueError("Immutable snapshot already exists")
    jpath.write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    lines=["# Seven Heaven — OKX Spot BTC/ETH USDC public instrument eligibility",
       "","**2026-11-13 · READ ONLY, no account access or order.**","",
       "## Current public instrument snapshot (NOT proof of account-specific EEA trade eligibility)",
       "","| Pair | Public state | minSz base | lotSz base | tickSz quote | Bid USDC | Ask USDC | Minimum at ask USDC |",
       "|---|---|---:|---:|---:|---:|---:|---:|"]
    for pair in PAIRS:
        z=out["pairs"][pair];ins=z["instrument"];t=z["ticker"];q=z["order_size_estimates"]
        lines.append("| "+pair+" | "+" | ".join(str(v) for v in (
            ins["state"],ins["minSz"],ins["lotSz"],ins["tickSz"],t["bidPx"],t["askPx"],
            q["minimum_base_notional_at_ask_usdc"]))+" |")
    lines+=["","## Budget feasibility at public ask (indicative only)","",
     "Each calculation reserves 0.1% of quote budget for an assumed taker fee, floors base quantity to lotSz and checks ONLY minSz.",
     "It does not test any additional quote-side minimum, account eligibility, actual fee currency, trading limits or eventual fill.",
     "","| Pair | Budget USDC | Estimated base quantity | minSz check only |","|---|---:|---:|---:|"]
    for pair in PAIRS:
        for item in out["pairs"][pair]["order_size_estimates"]["budget_scenarios"]:
            lines.append(f"| {pair} | {item['budget_usdc']} | {item['qty_approx_base']} | {'PASS' if item['above_minSz_only'] else 'FAIL'} |")
    lines+=["","## Cost hypotheses — do not double count","",
     "From the project's **authenticated fee screenshots** (06, 09 and 12 Nov 2026) the reference **Spot taker** is 0.10% per side, **Spot maker** 0.08% per side.",
     "The **V5** slippage 0.05% per side is a **modelling choice**. At unchanged underlying price, hypothetical taker/taker V5 break-even rise is about "+
      str(out["v5_flat_price_roundtrip"]["break_even_price_rise_pct"])+" percent and a 10 USDC roundtrip consumes about "+
      str(out["v5_flat_price_roundtrip"]["cost_by_budget_usdc"]["10"])+" USDC, excluding additional conditions.",
     "The prior **historical L2 book study** measured much smaller *book friction at fixed historical snapshots* and includes spread in that friction; **do not add spread twice**. Different models have different scopes.",
     "",
     "## Date, provenance, caveats","",
     "- Retrieved UTC: "+out["completed_utc"],
     "- Pair-specific public API request URLs and SHA-256 hashes of response bodies are preserved in adjacent JSON.",
     "- Public API state live does NOT establish accessibility to a specific EEA account or permission to execute orders.",
     "- No authenticated trade or order, no personal account details, no Bridge changes.",
     "- Prices are one-time quotes, **not** predictions, recommendations, or execution prices.",
     "- Source of account-displayed fee: Notion OKX MEMORY CORE → 01 Trading Fees; DO NOT overwrite with generic EEA advertising tables.",
     "- Next decision: retain PAPER-only; a human order-eligibility check for any actual account or pair remains separate.",
     ""]
    mpath.write_text("\n".join(lines),encoding="utf-8")
    print(json.dumps({"status":"SUCCESS_PUBLIC_DATA_SNAPSHOT", "snapshot":str(jpath),"report":str(mpath),
       "summary":{k:{"minSz":v["instrument"]["minSz"],"lotSz":v["instrument"]["lotSz"],
       "askPx":v["ticker"]["askPx"],"minQuote":v["order_size_estimates"]["minimum_base_notional_at_ask_usdc"]}
       for k,v in out["pairs"].items()}},indent=2))
if __name__=="__main__":main()
