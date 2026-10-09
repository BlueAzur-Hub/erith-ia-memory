#!/usr/bin/env python3
"""Build a read-only Top250 coverage index from immutable monthly Releases."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import tempfile
from collect_historical_universe import ROOT
import import_historical_bulk as bulk

SCHEMA="aerith.public.ohlcv.top250.monthly-coverage-catalog.v1"
HOME=ROOT/"data/historical_archive_prototype"
TAG=re.compile(r"^crypto-spot-bulk-(20\d{2}-(?:0[1-9]|1[0-2]))-1m$")
ADDENDUM=re.compile(r"^crypto-spot-bulk-add-(20\d{2}-(?:0[1-9]|1[0-2]))-1m-[a-f0-9]{12}$")
REPO="BlueAzur-Hub/erith-ia-memory"

def need(ok,message):
    if not ok:raise ValueError(message)

def listed_releases():
    result=[]
    for page in range(1,8):
        x=subprocess.run(["gh","api",f"repos/{REPO}/releases?per_page=100&page={page}"],
                         check=True,capture_output=True,text=True,timeout=90)
        rows=json.loads(x.stdout)
        need(isinstance(rows,list),"Invalid release list")
        result.extend(rows)
        if len(rows)<100:break
    else:raise ValueError("Too many pages")
    return result

def gather(releases,download):
    months={}
    for release in releases:
        match=TAG.fullmatch(release.get("tag_name","")) or ADDENDUM.fullmatch(release.get("tag_name",""))
        if not match or release.get("draft"):continue
        month=match.group(1)
        need(release["tag_name"] not in months,"Repeated Release tag")
        manifest=[a for a in release["assets"] if a["name"]=="manifest.json"]
        need(len(manifest)==1,"Missing Release manifest")
        m=manifest[0]
        need(re.fullmatch(r"sha256:[a-f0-9]{64}",m.get("digest","")),
             "Unverifiable Release manifest SHA256")
        raw=download(release["tag_name"])
        need(len(raw)==m["size"] and
             hashlib.sha256(raw).hexdigest()==m["digest"][7:],
             "Manifest checksum mismatch: "+month)
        data=json.loads(raw)
        need(data.get("schema")==bulk.SCHEMA and data.get("month")==month and
             data.get("interval")=="1m" and
             data.get("verified",0)+data.get("unavailable",0)==data.get("requested",0) and
             len(data.get("assets",[]))==data.get("requested",0),
             "Invalid Release manifest")
        months[release["tag_name"]]=(release,data)
    need(0<len(months)<=150,"No usable monthly source or excessive history")
    return dict(sorted(months.items(),key=lambda item:(item[1][1]["month"],item[0])))

def build(venue,monthly):
    need(venue.get("total_ranked")==250 and len(venue.get("assets",[]))==250,
         "Top250 audit invalid")
    rows={}
    for a in venue["assets"]:
        need(a["id"] not in rows and 1<=a["rank"]<=250,"Repeated/invalid asset")
        rows[a["id"]]={"id":a["id"],"rank":a["rank"],"symbol":a["symbol"],
                       "name":a["name"],"market_status":a["status"],
                       "months":[],"missing_months":[],"candles":0}
    need({v["rank"] for v in rows.values()}==set(range(1,251)),
         "Top250 ranking incomplete")
    summaries=[]
    for _,(release,manifest) in monthly.items():
        month=manifest["month"]
        present=set()
        for item in manifest["assets"]:
            aid=item["asset_id"]
            need(aid in rows and aid not in present,"Unknown/duplicate asset")
            present.add(aid)
            need(item["quote"]=="USDT" and
                 item["source"]=="Binance Spot public monthly CSV",
                 "Source, currency or ID mismatched")
            if rows[aid]["months"]:
                need(rows[aid]["months"][0]["pair"]==item["pair"],
                     "Pair changed for exact CoinGecko ID")
            if item["status"]=="verified":
                filename=item["file"]
                asset=[x for x in release["assets"] if x["name"]==filename]
                need(len(asset)==1 and asset[0].get("digest")=="sha256:"+item["sha256"]
                     and item["candles"]==bulk.bounds(month,"1m")[1],
                     "Unverified ZIP reference")
                need(not any(x["month"]==month for x in rows[aid]["months"]),
                     "Duplicate original/addendum month for asset")
                if month in rows[aid]["missing_months"]:
                    rows[aid]["missing_months"].remove(month)
                rows[aid]["months"].append({"month":month,"pair":item["pair"],
                     "file":filename,"sha256":item["sha256"],
                     "candles":item["candles"],"release":release["tag_name"]})
                rows[aid]["candles"]+=item["candles"]
            else:
                need(item["status"]=="unavailable","Unknown evidence status")
                if (month not in rows[aid]["missing_months"] and
                    not any(x["month"]==month for x in rows[aid]["months"])):
                    rows[aid]["missing_months"].append(month)
        summaries.append({"month":month,"release":release["tag_name"],
           "verified":manifest["verified"],"unavailable":manifest["unavailable"],
           "candles":manifest["candles"]})
    assets=sorted(rows.values(),key=lambda r:r["rank"])
    for asset in assets:
        asset["months"].sort(key=lambda row:row["month"])
        asset["missing_months"].sort()
    groups=[{"top":n,"with_history":sum(bool(a["months"]) for a in assets[:n])}
            for n in (10,50,100,250)]
    return {"schema":SCHEMA,"source":"Binance Spot official monthly ZIPs",
            "quote":"USDT","ranked":250,
            "rank_snapshot":venue.get("market_snapshot_at"),
            "release_months":len({r["month"] for r in summaries}),
            "release_count":len(summaries),
            "archived_assets":groups[-1]["with_history"],
            "native_1m_candles":sum(a["candles"] for a in assets),
            "groups":groups,"months":summaries,"assets":assets,
            "note":"250 ranked assets are NOT 250 collected histories. Only verified monthly ZIPs count."}

def main():
    cli=argparse.ArgumentParser()
    cli.add_argument("--output",type=Path,default=HOME/"top250_history_catalog/index.json")
    args=cli.parse_args()
    venue=json.loads((HOME/"top250-venue-audit.json").read_text())
    releases=listed_releases()
    with tempfile.TemporaryDirectory() as td:
        root=Path(td)
        def download(tag):
            folder=root/tag;folder.mkdir()
            subprocess.run(["gh","release","download",tag,"--pattern",
               "manifest.json","--dir",str(folder)],check=True,timeout=120)
            return (folder/"manifest.json").read_bytes()
        result=build(venue,gather(releases,download))
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
    print("TOP250 HISTORY "+json.dumps({"ranked":250,
          "archives":result["archived_assets"],
          "candles":result["native_1m_candles"],
          "months":result["release_months"]},sort_keys=True))

if __name__=="__main__":
    main()
