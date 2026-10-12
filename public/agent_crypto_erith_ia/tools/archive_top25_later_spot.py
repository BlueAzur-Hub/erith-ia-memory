#!/usr/bin/env python3
"""Top25 six-asset historical original Binance Spot OHLCV, Jan 2020-Apr 2021.
Venue-exact DOGE LINK ADA XLM BCH LTC source 1m ZIPs and .CHECKSUM,
unmodified SQLite OHLCV, explicit pre-listing and invalid-source statuses.

No source replacement, no OHLCV interpolation, no Trader/Interface mutation.
"""
from __future__ import annotations
import argparse
from concurrent.futures import ThreadPoolExecutor,as_completed
from datetime import datetime,timezone
import hashlib
import json
import os
from pathlib import Path
import sqlite3
import tempfile
import audit_top5_incomplete_months as source
import archive_top5_partial_months as storage

REPO="BlueAzur-Hub/erith-ia-memory"
ROOT=Path(__file__).resolve().parents[1]/"data/historical_archive_prototype"
CATALOG=ROOT/"top250_multisource_coverage/index.json"
PLAN=ROOT/"top25_historical_expansion/index.json"
ASSETS={
 "dogecoin":{"rank":12,"symbol":"DOGE","pair":"DOGEUSDT","first_pair_utc":"2019-07-05T12:00:00Z",
     "official_notice":"https://www.binance.com/en-IN/support/announcement/detail/360030488211"},
 "chainlink":{"rank":16,"symbol":"LINK","pair":"LINKUSDT","first_pair_utc":None,"official_notice":None},
 "cardano":{"rank":17,"symbol":"ADA","pair":"ADAUSDT","first_pair_utc":None,
    "official_notice":"https://www.binance.com/en/support/announcement/detail/360002770711"},
 "stellar":{"rank":20,"symbol":"XLM","pair":"XLMUSDT","first_pair_utc":None,"official_notice":None},
 "bitcoin-cash":{"rank":22,"symbol":"BCH","pair":"BCHUSDT","first_pair_utc":None,"official_notice":None},
 "litecoin":{"rank":23,"symbol":"LTC","pair":"LTCUSDT","first_pair_utc":None,"official_notice":None}
}
BATCHES={f"2020-q{q}":tuple(f"2020-{m:02d}" for m in range((q-1)*3+1,q*3+1))
         for q in range(1,5)}
BATCHES["2021-q1"]=("2021-01","2021-02","2021-03")
BATCHES["2021-apr"]=("2021-04",)
STATUS_OK={"native_1m_complete","native_1m_partial","original_timestamp_quarantine"}

def need(test,why):
 if not test:raise ValueError(why)
def file_sha(b):return hashlib.sha256(b).hexdigest()
def pin_catalog():
 raw=CATALOG.read_bytes();j=json.loads(raw)
 plan=json.loads(PLAN.read_text(encoding="utf-8"))
 need(j["ranked"]==250 and j["quote"]=="USDT" and plan["schema"]=="seven.crypto.top25-expansion-plan.v1",
      "Frozen Top250/Top25 identity not found")
 need(plan["source_ranked_catalog_git_blob_sha"]!="" and
      {x["id"] for x in plan["added_assets"]}=={x["id"] for x in j["assets"][10:25]}
      and set(ASSETS)==set(plan["pilot_market_ids"]),
      "Top25 source identity changed")
 indexed={x["id"]:x for x in j["assets"]}
 for aid,cfg in ASSETS.items():
    entry=indexed[aid]
    need(entry["rank"]==cfg["rank"] and entry["symbol"]==cfg["symbol"] and
         entry["source"]=="Binance Spot official native 1m ZIPs" and
         entry["quote"]=="USDT" and entry["months"]>=55,
         "Wrong token, quote or original source identity for "+aid)
 return {"top250_catalog_sha256":file_sha(raw),"expansion_plan_sha256":file_sha(PLAN.read_bytes())}
def release_tag(batch):
 return "crypto-top25-later-original-spot-"+batch
def source_urls(pair,month):
 need(pair in {v["pair"] for v in ASSETS.values()} and source.MONTH.fullmatch(month),
      "Unapproved Spot pair/date")
 path=f"{source.SOURCE}{pair}/1m/{pair}-1m-{month}.zip"
 return path,path+".CHECKSUM"
def iso_ms(s):return int(datetime.fromisoformat(s.replace("Z","+00:00")).timestamp()*1000)
def queryable_sqlite(raw,pair,month,output):
 # In irregular originals, preserve raw epoch milliseconds, never round to minute.
 stats=storage.write_sqlite(raw,pair,month,output)
 first,end,total=source.month_bounds(month)
 with sqlite3.connect(output) as db:
    count,unique,offgrid,outside=db.execute(
      "SELECT COUNT(*),COUNT(DISTINCT open_time_ms),"
      "SUM(CASE WHEN (open_time_ms-?)%60000<>0 THEN 1 ELSE 0 END),"
      "SUM(CASE WHEN open_time_ms<? OR open_time_ms>=? THEN 1 ELSE 0 END) FROM candles",
      (first,first,end)).fetchone()
 need(count==unique==stats["native_rows"] and not outside,"Untrustworthy native original timestamps")
 return {**stats,"offgrid_original_rows":offgrid or 0}
def one(aid,month,output,download=source.fetch):
 cfg=ASSETS[aid];pair=cfg["pair"]
 start,end,minutes=source.month_bounds(month)
 first=cfg["first_pair_utc"]
 base={"asset_id":aid,"rank":cfg["rank"],"symbol":cfg["symbol"],
       "venue":"Binance Spot","pair":pair,"quote":"USDT",
       "resolution":"1m","month":month,"calendar_minutes":minutes,
       "first_pair_date_proven_by_official_notice":bool(first),
       "official_pair_notice":cfg["official_notice"],
       "original_source_trades_absent_not_inferred":True,
       "no_synthetic_ohlcv":True}
 if first and end<=iso_ms(first):
    return {**base,"status":"before_official_pair_listing","native_rows":0,
            "missing_original_1m_not_interpreted_as_outage":True,
            "source_http_not_requested":True}
 url,checkurl=source_urls(pair,month);name=f"{pair}-1m-{month}.zip"
 base.update({"original_source_url":url,"original_checksum_url":checkurl})
 compressed=download(url,source.MAX_ZIP)
 if compressed["status"]!="downloaded":
    return {**base,"status":"source_unavailable","native_rows":0,
            "http_code":compressed.get("http_code"),"transport_status":compressed.get("status"),
            "source_unavailable_does_not_prove_pair_nonexistence":True}
 checks=download(checkurl,2048)
 if checks["status"]!="downloaded":
    return {**base,"status":"checksum_unavailable","native_rows":0,
            "http_code":checks.get("http_code"),"transport_status":checks.get("status")}
 binary,ck=compressed["bytes"],checks["bytes"]
 source.check_checksum(ck,binary,name)
 anomaly=None;verified=None
 try:verified=source.inspect_zip(binary,pair,month)
 except (ValueError,OverflowError,UnicodeError) as err:anomaly=f"{type(err).__name__}: {str(err)[:130]}"
 sql=output/f"{pair}-1m-{month}.sqlite"
 try:details=queryable_sqlite(binary,pair,month,sql)
 except (ValueError,sqlite3.Error) as err:
    sql.unlink(missing_ok=True)
    # No unsupported ZIP is saved as market data and no original source is mutated.
    return {**base,"status":"original_requires_manual_source_review",
            "native_rows":0,"original_zip_sha256":file_sha(binary),
            "original_checksum_sha256":file_sha(ck),
            "reason":f"{type(err).__name__}: {str(err)[:150]}"}
 if verified is not None:
    need(details["native_rows"]==verified["source_rows"] and details["offgrid_original_rows"]==0,
         "Source calendar and stored exact opens disagree")
    status="native_1m_complete" if verified["missing_1m"]==0 and verified["close_time_anomalies"]==0 else "native_1m_partial"
    missing=verified["missing_1m"];gaps=verified["gaps"]
 else:
    need(details["offgrid_original_rows"]>0,
         "Malformed source not proven to have off-grid timestamps")
    status="original_timestamp_quarantine"
    missing=None;gaps=[]
 if first:
    need(details["sqlite_first_open_ms"]>=iso_ms(first),
         "Original source predates official trading opening; requires manual source review")
 if status=="native_1m_complete":
    with sqlite3.connect(sql) as db:
        db.execute("UPDATE metadata SET value='true' WHERE key='is_source_complete'")
        db.commit()
 details["sqlite_sha256"]=storage.sha_file(sql)
 details["sqlite_bytes"]=sql.stat().st_size
 prefix=f"https://github.com/{REPO}/releases/download/{release_tag(BATCH)}/"
 result={**base,"status":status,"native_rows":details["native_rows"],
         "strict_utc_aligned":status!="original_timestamp_quarantine",
         "offgrid_native_rows":details["offgrid_original_rows"],
         "missing_1m_minutes":missing,
         "missing_intervals":gaps,
         "close_time_anomalies":verified["close_time_anomalies"] if verified else None,
         "source_validation_note":anomaly,
         "first_source_open_utc":datetime.fromtimestamp(details["sqlite_first_open_ms"]/1000,timezone.utc).isoformat(),
         "last_source_open_utc":datetime.fromtimestamp(details["sqlite_last_open_ms"]/1000,timezone.utc).isoformat(),
         "source_zip":{"name":name,"bytes":len(binary),"sha256":file_sha(binary),"url":prefix+name},
         "official_checksum":{"name":name+".CHECKSUM","bytes":len(ck),"sha256":file_sha(ck),"url":prefix+name+".CHECKSUM"},
         "sqlite":{"name":sql.name,"bytes":details["sqlite_bytes"],"sha256":details["sqlite_sha256"],"url":prefix+sql.name},
         "original_price_and_volume_strings_preserved":True,
         "excluded_from_utc_1m_calendar":status=="original_timestamp_quarantine"}
 for filename,blob in ((name,binary),(name+".CHECKSUM",ck)):
    (output/filename).write_bytes(blob)
 return result
# Only the direct stage function may set this per-job immutable Release destination.
BATCH="unset"
def stage(batch,out):
 global BATCH
 need(batch in BATCHES and not out.exists(),"Invalid original target batch")
 BATCH=batch
 pins=pin_catalog();out.mkdir(parents=True)
 results=[]
 with ThreadPoolExecutor(max_workers=3) as pool:
    requests={pool.submit(one,asset,month,out):(asset,month)
              for asset in ASSETS for month in BATCHES[batch]}
    for future in as_completed(requests):
       row=future.result()
       need((row["asset_id"],row["month"])==requests[future],"Source paired to wrong token")
       results.append(row)
       print("TOP25 NATIVE SPOT SOURCE "+json.dumps({
          "asset":row["asset_id"],"month":row["month"],
          "status":row["status"],"rows":row["native_rows"],
          "missing":row.get("missing_1m_minutes")},sort_keys=True),flush=True)
 results.sort(key=lambda x:(x["asset_id"],x["month"]))
 got=[x for x in results if x["status"] in STATUS_OK]
 regular=[x for x in got if x["strict_utc_aligned"]]
 original=sum(x["native_rows"] for x in got)
 docs={
  "schema":"seven.crypto.top25-later-spot-batch.v1","batch":batch,
  "months":list(BATCHES[batch]),"assets":list(ASSETS),
  "release_tag":release_tag(batch),
  "release_page":f"https://github.com/{REPO}/releases/tag/{release_tag(batch)}",
  "top25_reference":pins,"target_month_pairs":len(results),
  "source_verified_month_pairs":len(got),
  "strict_1m_month_pairs":len(regular),
  "quarantined_original_month_pairs":len(got)-len(regular),
  "pre_pair_listing_month_pairs":sum(x["status"]=="before_official_pair_listing" for x in results),
  "unavailable_or_unverified_month_pairs":sum(x["status"] in
         ("source_unavailable","checksum_unavailable","original_requires_manual_source_review") for x in results),
  "original_native_ohlcv_rows":original,
  "strict_utc_aligned_native_rows":sum(x["native_rows"] for x in regular),
  "quarantined_native_rows":sum(x["native_rows"] for x in got if x not in regular),
  "native_1m_missing_minutes_in_strict_sources":sum(x["missing_1m_minutes"] for x in regular),
  "no_synthetic_bars":True,"distinct_venue_quote_pairs":True,
  "not_all_time_guaranteed":True,"trader_interface_modified":False,
  "raw_original_source_zips_stored_in_release":True,
  "records":results}
 need(len(results)==6*len(BATCHES[batch]) and
      docs["strict_utc_aligned_native_rows"]+docs["quarantined_native_rows"]==original,
      "Source data count mismatch")
 expected={"manifest.json"}|{x[k]["name"] for x in got
                                  for k in ("source_zip","official_checksum","sqlite")}
 need({f.name for f in out.iterdir()}|{"manifest.json"}==expected,
      "Unrecognized/duplicate original sources")
 (out/"manifest.json").write_text(json.dumps(docs,indent=2,sort_keys=True)+"\n")
 print("TOP25 HISTORICAL SOURCE BATCH "+json.dumps({
   "batch":batch,"verified_months":len(got),"native_rows":original,
   "quarantined_months":docs["quarantined_original_month_pairs"],
   "strict_missing":docs["native_1m_missing_minutes_in_strict_sources"]},sort_keys=True),flush=True)
 return docs
def self_test():
 storage.self_test()
 pin_catalog()
 need(len(BATCHES)==6 and len(ASSETS)==6
      and ASSETS["dogecoin"]["first_pair_utc"]=="2019-07-05T12:00:00Z"
      and all("2020-01"<=m<="2021-04" for ms in BATCHES.values() for m in ms),
      "Source scope or Binance Spot instrument changed")
 need(sum(len(ms)*len(ASSETS) for ms in BATCHES.values())==96,
      "Wrong original quote-pair month count")
 print("PASS: 96 genuine Top25 pair-months, source ZIP CHECKSUM and original OHLCV")

if __name__=="__main__":
 p=argparse.ArgumentParser()
 opts=p.add_mutually_exclusive_group(required=True)
 opts.add_argument("--batch",choices=BATCHES)
 opts.add_argument("--self-test",action="store_true")
 p.add_argument("--output",type=Path)
 args=p.parse_args()
 if args.self_test:self_test()
 else:
    need(args.output and os.environ.get("GITHUB_ACTIONS")=="true" and
         os.environ.get("GITHUB_REPOSITORY")==REPO,
         "Top 25 pilot original source backfill only in authorized GitHub Actions")
    stage(args.batch,args.output)
