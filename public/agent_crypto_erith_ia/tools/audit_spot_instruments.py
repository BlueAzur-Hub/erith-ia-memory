#!/usr/bin/env python3
"""Read-only cross-venue SPOT instrument census for the existing Top250.

An exchange instrument confirms that a SYMBOL/QUOTE pair exists. It does not
prove that a CoinGecko ID owns the symbol, that a candle is available, or that
a historical month is complete. No orders, archive writes, or synthetic prices.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
from pathlib import Path
import re
import urllib.request

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/"data/historical_archive_prototype"
CATALOG=BASE/"top250_history_catalog/index.json"
OUTPUT=BASE/"top250-official-spot-instruments.json"
SCHEMA="aerith.public.ohlcv.spot.top250.instrument-audit.v1"
OKX_URL="https://www.okx.com/api/v5/public/instruments?instType=SPOT"
BITGET_URL="https://api.bitget.com/api/v2/spot/public/symbols"
ASSET_ID=re.compile(r"^[a-z0-9-]{2,100}$")
SYMBOL=re.compile(r"^[A-Z0-9]{1,30}$")
QUOTES=("USDT","USDC")
MAX_RESPONSE=8_000_000

def need(ok, message):
    if not ok:
        raise ValueError(message)

def load_catalog(path=CATALOG):
    catalog=json.loads(Path(path).read_text(encoding="utf-8"))
    rows=catalog.get("assets")
    need(catalog.get("ranked")==250 and isinstance(rows,list)
         and len(rows)==250 and isinstance(catalog.get("archived_assets"),int),
         "Canonical Top250 catalog is missing or incomplete")
    need({r.get("rank") for r in rows}==set(range(1,251))
         and len({r.get("id") for r in rows})==250,
         "Repeated or missing canonical ranks/identities")
    for r in rows:
        need(isinstance(r.get("id"),str) and ASSET_ID.fullmatch(r["id"])
             and isinstance(r.get("symbol"),str)
             and isinstance(r.get("months"),list),
             "Bad canonical Top250 record")
    need(sum(bool(r["months"]) for r in rows)==catalog["archived_assets"],
         "Canonical archived count mismatch")
    return catalog

def fetch_document(url, opener=urllib.request.urlopen):
    need(url in (OKX_URL,BITGET_URL),"Only two public instrument endpoints allowed")
    request=urllib.request.Request(url,headers={
        "User-Agent":"SevenHeaven-Official-Spot-Instrument-Audit/1.0",
        "Accept":"application/json"})
    with opener(request,timeout=35) as response:
        need(response.status==200,"Spot exchange response non-200")
        raw=response.read(MAX_RESPONSE+1)
    need(0<len(raw)<=MAX_RESPONSE,"Spot instruments response incomplete or oversized")
    data=json.loads(raw)
    need(isinstance(data,dict),"Exchange instruments response is not JSON object")
    return data,hashlib.sha256(raw).hexdigest()

def spot_index(document, venue):
    """Extract only currently active SPOT USDT/USDC instruments, never derivatives."""
    need(venue in ("okx","bitget") and isinstance(document,dict),"Invalid venue")
    expected_code="0" if venue=="okx" else "00000"
    need(str(document.get("code"))==expected_code
         and isinstance(document.get("data"),list)
         and len(document["data"])>0,"Exchange instrument response failed")
    instruments=set()
    for r in document["data"]:
        if not isinstance(r,dict):
            continue
        if venue=="okx":
            if r.get("instType")!="SPOT" or r.get("state")!="live":
                continue
            base,quote,inst=r.get("baseCcy"),r.get("quoteCcy"),r.get("instId")
            if quote not in QUOTES or not isinstance(base,str) or not SYMBOL.fullmatch(base):
                continue
            if inst!=base+"-"+quote:
                continue
        else:
            if r.get("status")!="online":
                continue
            base,quote,inst=r.get("baseCoin"),r.get("quoteCoin"),r.get("symbol")
            if quote not in QUOTES or not isinstance(base,str) or not SYMBOL.fullmatch(base):
                continue
            if inst!=base+quote:
                continue
        instruments.add((base,quote,inst))
    need(len(instruments)>0,"No validated active Spot instruments from "+venue)
    return instruments

def build(catalog, okx, bitget, digests=None, observed_at=None):
    need(catalog.get("ranked")==250 and isinstance(catalog.get("assets"),list)
         and len(catalog["assets"])==250,"Not Top250")
    index={"okx":okx,"bitget":bitget}
    for venue, values in index.items():
        need(isinstance(values,set)
             and all(isinstance(t,tuple) and len(t)==3 for t in values),
             "Invalid "+venue+" source set")
    rows=[];total=0
    for asset in sorted(catalog["assets"],key=lambda a:a["rank"]):
        if asset["months"]:
            continue
        symbol=asset["symbol"]
        matched=[]
        if SYMBOL.fullmatch(symbol):
            for venue in ("okx","bitget"):
                for quote in QUOTES:
                    match=symbol+"-"+quote if venue=="okx" else symbol+quote
                    if (symbol,quote,match) in index[venue]:
                        matched.append({"exchange":venue,"pair":match,
                                        "quote":quote,"base":symbol,
                                        "exact_coingecko_id_proven":False,
                                        "full_native_1m_month_proven":False})
        rows.append({"id":asset["id"],"rank":asset["rank"],"symbol":symbol,
                     "status":"symbol_instrument_candidate" if matched else "no_symbol_instrument",
                     "instruments":matched})
        total+=bool(matched)
    need(len(rows)==250-catalog["archived_assets"],"Lost non-archived identities")
    return {"schema":SCHEMA,"source":"OKX public SPOT instruments and Bitget public SPOT symbols",
            "observed_at":observed_at or dt.datetime.now(dt.timezone.utc).isoformat(),
            "quote":"USDT/USDC (never silently converted)",
            "ranked":250,"archived_assets":catalog["archived_assets"],
            "remaining":len(rows),"symbol_candidate_assets":total,
            "instrument_counts":{"okx":len(okx),"bitget":len(bitget)},
            "source_sha256":digests or {},
            "symbol_only_not_identity_proof":True,
            "none_are_archive_claims":True,
            "note":"Active Spot pair existence only. CoinGecko exact-ID linkage and authentic complete native monthly candles require independent proof before adding any historical asset.",
            "assets":rows}

def main():
    cli=argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--output",type=Path,default=OUTPUT)
    cli.add_argument("--plan",action="store_true")
    cli.add_argument("--probe",action="store_true")
    args=cli.parse_args()
    need(args.plan != args.probe,"Choose --plan or --probe")
    catalog=load_catalog()
    if args.plan:
        print("OFFICIAL SPOT AUDIT PLAN "+json.dumps({
            "ranked":250,"archived":catalog["archived_assets"],
            "remaining":250-catalog["archived_assets"],
            "public_endpoints":["okx","bitget"],"writes_archive":False},
            sort_keys=True),flush=True)
        return
    responses={}
    digests={}
    for venue,url in (("okx",OKX_URL),("bitget",BITGET_URL)):
        doc,sha=fetch_document(url)
        responses[venue]=spot_index(doc,venue)
        digests[venue]=sha
    result=build(catalog,responses["okx"],responses["bitget"],digests)
    args.output.parent.mkdir(parents=True,exist_ok=True)
    tmp=args.output.with_suffix(".tmp")
    tmp.write_text(json.dumps(result,indent=2,ensure_ascii=False,sort_keys=True)+"\n",
                   encoding="utf-8")
    tmp.replace(args.output)
    print("OFFICIAL SPOT INSTRUMENT AUDIT "+json.dumps({
        "remaining":result["remaining"],
        "symbol_candidate_assets":result["symbol_candidate_assets"],
        "instruments":result["instrument_counts"],
        "native_months_created":0},sort_keys=True),flush=True)

if __name__=="__main__":
    main()
