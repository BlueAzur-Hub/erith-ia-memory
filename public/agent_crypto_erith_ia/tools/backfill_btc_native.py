#!/usr/bin/env python3
"""Acquire older *original* Binance Spot BTCUSDT 1m months independently.

Only official Binance ZIP + .CHECKSUM and complete native months are promoted
to the canonical Top250 monthly Release family. Months with trading gaps go
to a separate gap-aware process: NEVER synthesize OHLCV or overwrite releases.
No Trader, Interface, Bridge, cache or Javascript changes.
"""
from __future__ import annotations
import argparse
import json
import os
from pathlib import Path
import subprocess
import tempfile

import import_historical_bulk as bulk
from orchestrate_historical_bulk import month_before, verify_month_output
import supplement_historical_bulk as supplement
from btc_gap_acquire import acquire as acquire_gap

CATALOG=bulk.ROOT/"data/historical_archive_prototype/top250_history_catalog/index.json"
FIRST_BINANCE_SCAN="2017-08"
MAX_BATCH=6
IDENTITY="bitcoin"
EXPECTED_PAIR="BTCUSDT"


def require(ok, reason):
    if not ok: raise ValueError(reason)


def btc_owner(catalog):
    require(catalog.get("ranked")==250 and catalog.get("quote")=="USDT",
            "Unrecognized official monthly catalogue")
    canonical=next((x for x in catalog["assets"] if x["id"]==IDENTITY),None)
    owner=next((x for x in bulk.inventory() if x["id"]==IDENTITY),None)
    require(canonical and owner and
            canonical["rank"]==owner["rank"]==1 and
            canonical["symbol"]=="BTC" and owner["pair"]==EXPECTED_PAIR,
            "Original Bitcoin Spot identity not confirmed")
    require(canonical.get("months"),"Existing BTC monthly sources not catalogued")
    return canonical,owner


def gap_tag(month):
    return 'btc-spot-native-gap-'+month


def is_release_published(tag):
    proc=subprocess.run(['gh','release','view',tag,'--json','tagName'],
                        capture_output=True,text=True,timeout=40)
    return proc.returncode==0


def plan(catalog,months=MAX_BATCH,has_gap=None):
    require(1<=months<=MAX_BATCH,"Unbounded BTC batch")
    item,owner=btc_owner(catalog)
    known={x["month"] for x in item["months"]}
    floor=min(known)
    pending=[]
    cursor=month_before(floor)
    while cursor>=FIRST_BINANCE_SCAN and len(pending)<months:
        if cursor not in known and not (has_gap and has_gap(cursor)):
            pending.append(cursor)
        cursor=month_before(cursor)
    return pending,owner


def publish_gap(month,folder,proof):
    tag=gap_tag(month)
    required=[folder/(f'BTCUSDT-1m-{month}'+suffix)
              for suffix in ('.zip','.zip.CHECKSUM','.sqlite','.json')]
    require(all(x.is_file() for x in required),'Missing complete gap proof bundle')
    require(proof.get('missing_minutes',0)>0 and proof.get('native_rows',0)>0,
            'Not a gap-qualified native source')
    require(not is_release_published(tag),'Refuse overwrite of immutable gap source')
    subprocess.run(['gh','release','create',tag,*map(str,required),
                    '--target',os.environ['GITHUB_SHA'],
                    '--title',f'BTCUSDT original Binance 1m source with gaps {month}',
                    '--notes','Original SHA-256-verified Binance Spot BTCUSDT ZIP and CHECKSUM, precise gaps, full native rows, and queryable SQLite. RESEARCH: not a complete calendar month; never synthesize trades.',
                    '--latest=false'],check=True,timeout=240)
    x=subprocess.run(['gh','release','view',tag,'--json','assets,url,isDraft'],
                     check=True,capture_output=True,text=True,timeout=60)
    published=json.loads(x.stdout)
    require(not published.get('isDraft') and
            {a['name'] for a in published['assets']}=={p.name for p in required},
            'Published research Release differs from verified local archive')
    return published['url']


def run(catalog,months=MAX_BATCH,collect=None,publish=None,exists=None,
        collect_gap=None,publish_partial=None,known_gap=None):
    has_gap=known_gap or ((lambda mo:False) if (collect or publish) else
                          (lambda mo:is_release_published(gap_tag(mo))))
    pending,asset=plan(catalog,months,has_gap=has_gap)
    do_collect=collect or (lambda month,folder:bulk.execute(
        month,"1m",folder,workers=1,limit=1,assets=[asset]))
    do_publish=publish or (lambda month,folder,index: supplement.publish(
        month,folder,index,[asset]))
    def release_exists(month):
        tag=supplement.add_tag(month,[asset])
        proc=subprocess.run(["gh","release","view",tag,"--json","tagName"],
                            capture_output=True,text=True,timeout=40)
        return proc.returncode==0
    already=exists or release_exists
    do_collect_gap=collect_gap or (lambda mo,folder:acquire_gap(mo,folder))
    do_publish_gap=publish_partial or publish_gap
    results=[]
    for month in pending:
        tag=supplement.add_tag(month,[asset])
        if already(month):
            results.append({"month":month,"status":"existing_release_wait_for_catalog","tag":tag})
            continue
        with tempfile.TemporaryDirectory(prefix="seven-btc-earlier-") as scratch:
            folder=Path(scratch)
            manifest=do_collect(month,folder)
            count=verify_month_output(folder,manifest,[asset],month)
            if manifest["verified"]!=1:
                issue=next(a for a in manifest["assets"] if a["status"]=="unavailable")
                reason=issue.get('reason','No verified source data')
                if ('Missing/duplicate/unaligned candle' in reason or
                    'Month incomplete:' in reason):
                    try:
                        partial=do_collect_gap(month,folder)
                        require(partial.get('missing_minutes',0)>0 and
                                partial.get('native_rows',0)>0 and
                                partial.get('synthetic_rows',0)==0,
                                'Partial source did not qualify as native gap')
                        if has_gap(month):
                            url='https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/'+gap_tag(month)
                        else:
                            url=do_publish_gap(month,folder,partial)
                        results.append({'month':month,'status':'published_with_gaps',
                                        'native_1m_candles':partial['native_rows'],
                                        'missing_minutes':partial['missing_minutes'],
                                        'source_sha256':partial['source_zip_sha256'],
                                        'tag':gap_tag(month),'url':url})
                        print('BTC OLDER AUTHENTIC GAPS '+json.dumps(results[-1],sort_keys=True),flush=True)
                        continue
                    except (OSError,RuntimeError,ValueError) as err:
                        reason+='; gap qualifier: '+str(err)[:150]
                results.append({'month':month,'status':'source_unavailable_or_incomplete',
                                'reason':reason,'candles_added':0})
                continue
            require(count==bulk.bounds(month,"1m")[1],"Native count not full month")
            url=do_publish(month,folder,manifest)
            results.append({"month":month,"status":"published",
                            "native_1m_candles":count,"tag":tag,
                            "source_sha256":manifest["assets"][0]["sha256"],"url":url})
            print("BTC OLDER VERIFIED "+json.dumps(results[-1],sort_keys=True),flush=True)
    return {"schema":"seven.btc.native-backfill.summary.v1",
            "source":"Official Binance Spot BTCUSDT 1m archive ZIP plus CHECKSUM",
            "first_exchange_trade_proven":False,"floor":FIRST_BINANCE_SCAN,
            "requested_months":pending,"results":results,
            "published":sum(r["status"] in ('published','published_with_gaps') for r in results),
            "full_months":sum(r["status"]=='published' for r in results),
            "gap_months":sum(r["status"]=='published_with_gaps' for r in results),
            "added_native_candles":sum(r.get("native_1m_candles",0) for r in results),
            "canonical_catalog_updated":False}


def main():
    cli=argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--plan",action="store_true")
    cli.add_argument("--collect",action="store_true")
    cli.add_argument("--months",type=int,default=MAX_BATCH)
    args=cli.parse_args()
    require(args.plan!=args.collect,"Choose --plan or --collect")
    catalog=json.loads(CATALOG.read_text(encoding="utf-8"))
    tasks,owner=plan(catalog,args.months)
    if args.plan:
        result={"status":"PLAN_ONLY","owner":owner["id"],"pair":owner["pair"],
                "quote":"USDT","months":tasks,"earliest_market_trade_proven":False}
    else:
        require(os.environ.get("GITHUB_ACTIONS")=="true" and
                os.environ.get("GH_TOKEN") and
                os.environ.get("GITHUB_REPOSITORY")=="BlueAzur-Hub/erith-ia-memory" and
                os.environ.get("GITHUB_SHA"),"Only authorized GitHub Actions may publish source releases")
        result=run(catalog,args.months)
    print("BTC NATIVE BACKFILL "+json.dumps(result,sort_keys=True),flush=True)


if __name__=="__main__":
    main()
