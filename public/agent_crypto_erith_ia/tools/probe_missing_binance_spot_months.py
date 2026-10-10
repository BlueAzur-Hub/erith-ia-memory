#!/usr/bin/env python3
"""Read-only archived Binance Spot 1m discovery for Top250 assets still missing.

Official ZIP and .CHECKSUM verify the EXCHANGE pair and candles, NOT the
CoinGecko ownership of a reused symbol. This script NEVER publishes a Release
or changes the canonical Top250. Exact coin-id attribution is a separate gate.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
import tempfile
import import_historical_bulk as bulk

ROOT=bulk.ROOT/"data/historical_archive_prototype"
CATALOG=ROOT/"top250_multisource_coverage/index.json"
IDS=(
    "pancakeswap-token","jupiter-exchange-solana","dogwifcoin",
    "polygon-ecosystem-token","render-token","theta-token",
    "bitcoin-cash-sv","blockstack","conflux-token","compound-governance-token",
    "eigenlayer","jito-governance-token","flare-networks","kaspa",
    "aethir","mantle","kinesis-gold","kucoin-shares","dai",
    "crypto-com-chain","okb","memecore","fartcoin","sonic-3",
    "akash-network","origintrail","monad","spx6900",
)
MONTHS=("2026-09","2025-09","2023-12")
LIMIT=32

def require(ok,msg):
    if not ok: raise ValueError(msg)

def candidates(catalog):
    require(catalog.get("schema")=="aerith.public.ohlcv.top250.federated-native-archives.v1" and
            catalog.get("ranked")==250 and len(catalog.get("assets",[]))==250,
            "Top250 federated truth invalid")
    indexed={a["id"]:a for a in catalog["assets"]}
    require(len(indexed)==250 and len(set(IDS))==len(IDS) and
            len(IDS)<=LIMIT and set(IDS)<=set(indexed),
            "Missing or repeated coin identity")
    result=[]
    for cid in IDS:
        asset=indexed[cid]
        require(asset["months"]==0 and asset["source"] is None,
                "Owner was already archived; refresh source queue")
        symbol=asset["symbol"]
        pair=symbol+"USDT"
        if bulk.PAIR.fullmatch(pair) is None: continue
        result.append({"id":cid,"rank":asset["rank"],"symbol":symbol,
                       "pair":pair,"archive_owner":"CANDIDATE_ONLY_UNPROVEN"})
    require(result and len({a["pair"] for a in result})==len(result),
            "No unique source pair candidates")
    return sorted(result,key=lambda a:a["rank"])

def run(catalog,months=MONTHS,importer=bulk.execute):
    chosen=candidates(catalog)
    allrows=[]
    for month in months:
        require(month in MONTHS,"Only bounded documented months")
        with tempfile.TemporaryDirectory(prefix="seven-source-discovery-") as td:
            manifest=importer(month,"1m",Path(td),workers=4,
                              limit=len(chosen),assets=chosen)
            require(manifest["requested"]==len(chosen) and
                    manifest["verified"]+manifest["unavailable"]==len(chosen),
                    "Native source coverage proof malformed")
            verified=[]
            for row in manifest["assets"]:
                if row["status"]=="verified":
                    require(row["candles"]==bulk.bounds(month,"1m")[1] and
                            (Path(td)/row["file"]).is_file(),
                            "Verified source file missing or not full native month")
                    verified.append({"id_candidate":row["asset_id"],
                        "pair":row["pair"],"month":month,
                        "source_zip_sha256":row["sha256"],
                        "native_1m":row["candles"],
                        "exact_id_attribution_certified":False,
                        "published":False})
            print("MISSING BINANCE SOURCE PROBE "+
                  json.dumps({"month":month,"verified":len(verified),
                    "unavailable":manifest["unavailable"],
                    "candidate_ids":[v["id_candidate"] for v in verified]},
                    sort_keys=True),flush=True)
            allrows.extend(verified)
    return {"schema":"aerith.source.discover.spot-native-candidates.v1",
            "ranked":250,"source":"Binance Spot original ZIP + .CHECKSUM",
            "quote":"USDT","months_probed":list(months),"assets_considered":len(chosen),
            "candidate_months_verified":len(allrows),
            "candidate_owners":sorted({a["id_candidate"] for a in allrows}),
            "coin_id_attribution_certified":False,
            "catalog_updated":False,"releases_published":0,
            "source_proofs":allrows}

def main():
    p=argparse.ArgumentParser()
    mode=p.add_mutually_exclusive_group(required=True)
    mode.add_argument("--plan",action="store_true")
    mode.add_argument("--probe",action="store_true")
    p.add_argument("--output",type=Path)
    args=p.parse_args()
    data=json.loads(CATALOG.read_text())
    assets=candidates(data)
    result=({"mode":"SOURCE_DISCOVERY_ONLY","candidate_count":len(assets),
             "months":list(MONTHS),"coin_ids":[a["id"] for a in assets]}
            if args.plan else run(data))
    if args.output:
        args.output.parent.mkdir(parents=True,exist_ok=True)
        args.output.write_text(json.dumps(result,indent=2,sort_keys=True)+"\n")
    print("TOP250 MISSING SOURCE "+json.dumps(result,sort_keys=True),flush=True)

if __name__=="__main__":main()
