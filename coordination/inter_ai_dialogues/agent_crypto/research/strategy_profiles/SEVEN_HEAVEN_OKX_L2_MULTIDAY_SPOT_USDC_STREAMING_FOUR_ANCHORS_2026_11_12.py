#!/usr/bin/env python3
"""Read-only streamed audit of selected 2026-08-15 / 2026-09-15 BTC and ETH L2.

No large decompressed file is written: parse NDJSON from gzip tar stream.
Fixed observations: first valid reconstructed state at/after UTC 00/06/12/18.
Source event order has no seqId/prevSeqId in preflight; no full logical
sequence integrity can be claimed even after validating gzip CRC.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
import csv
import gzip
import hashlib
import io
import json
from pathlib import Path
import tarfile
from urllib.request import Request, urlopen
from urllib.parse import urlencode

ROOT=Path("coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles")
OUT=ROOT/"okx_l2_calendar_multiday_2026_11_12_evidence"
PAIR_ALLOWED=("BTC-USDC","ETH-USDC")
ACTIVE_PAIR="BTC-USDC"
DATES_ALLOWED=("2026-08-15","2026-09-15")
URL=""
MEMBER=""
START=1792022400000
END=1792108800000
ANCHOR_HOURS=(0,6,12,18)
ANCHOR_MS=tuple(START+hour*3600000 for hour in ANCHOR_HOURS)
NOTIONAL=(10,100,1000,10000,100000)
BPS=Decimal(10000)
MAX_COMPRESSED=230_000_000
MAX_UNPACKED=1_400_000_000
MAX_EVENT_LINE=150_000
START=1792022400000
END=1792108800000
ANCHOR_HOURS=(0,6,12,18)
ANCHOR_MS=tuple(START+hour*3600000 for hour in ANCHOR_HOURS)
NOTIONAL=(10,100,1000,10000,100000)
BPS=Decimal(10000)

def timestamp():
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00","Z")

def sha256(raw):
    return hashlib.sha256(raw).hexdigest()

def blob_sha(raw):
    return hashlib.sha1(b"blob "+str(len(raw)).encode()+b"\0"+raw).hexdigest()

class HashingLimitedRaw:
    def __init__(self,raw,limit=MAX_COMPRESSED):
        self.raw=raw
        self.limit=limit
        self.count=0
        self.h=hashlib.sha256()
    def read(self,n=-1):
        remaining=self.limit-self.count
        if remaining<=0:
            # A caller may legitimately read at exact EOF; fail rather than truncate.
            chunk=self.raw.read(1)
            if chunk:
                raise ValueError("Compressed bytes exceed safety cap")
            return b""
        n=remaining if n is None or n<0 else min(n,remaining)
        chunk=self.raw.read(n)
        self.count+=len(chunk)
        self.h.update(chunk)
        return chunk

def decimal(v):
    try:
        x=Decimal(str(v))
    except (InvalidOperation,TypeError,ValueError) as exc:
        raise ValueError("Nondecimal level") from exc
    if not x.is_finite():
        raise ValueError("Non-finite level")
    return x

def parse_levels(values,side,is_snapshot):
    if not isinstance(values,list):
        raise ValueError("Missing "+side+" in event")
    levels={}
    previous=None
    for item in values:
        if not isinstance(item,list) or len(item)<2:
            raise ValueError("Malformed "+side+" level")
        px=decimal(item[0]);size=decimal(item[1])
        if px<=0 or size<0 or (is_snapshot and size==0):
            raise ValueError("Nonpositive price or bad size in "+side)
        if px in levels:
            raise ValueError("Duplicate price in a single event")
        if is_snapshot and previous is not None and (
             (side=="asks" and px<=previous) or (side=="bids" and px>=previous)):
            raise ValueError("Snapshot levels unsorted")
        levels[px]=size
        previous=px
    return levels

def apply_levels(book,delta):
    deletes,upserts=0,0
    for px,sz in delta.items():
        if sz==0:
            book.pop(px,None)
            deletes+=1
        else:
            book[px]=sz
            upserts+=1
    return upserts,deletes

def top_book_metrics(asks,bids,ts,anchor):
    """Read only the current top 400 prices, never make up missing liquidity."""
    if not asks or not bids:
        raise ValueError("Empty book for sample")
    buy_side=sorted(asks.items())[:400]
    sell_side=sorted(bids.items(),reverse=True)[:400]
    best_ask=buy_side[0][0]
    best_bid=sell_side[0][0]
    if best_bid>=best_ask:
        raise ValueError("Crossed book at sample")
    mid=(best_bid+best_ask)/2
    spread=(best_ask-best_bid)/mid*BPS
    row={
        "anchor_utc":datetime.fromtimestamp(anchor/1000,timezone.utc).isoformat(),
        "sample_utc":datetime.fromtimestamp(ts/1000,timezone.utc).isoformat(),
        "offset_ms_after_anchor":ts-anchor,
        "best_bid":str(best_bid),"best_ask":str(best_ask),
        "spread_bps":round(float(spread),8),
        "asks_active":len(asks),"bids_active":len(bids),
        "asks_used_for_depth":len(buy_side),"bids_used_for_depth":len(sell_side),
        "notionals":[]}
    for cost in NOTIONAL:
        amount=Decimal(cost)
        remaining=amount
        acquired=Decimal(0)
        level_count=0
        for px,sz in buy_side:
            if remaining<=0:
                break
            spent=min(remaining,px*sz)
            acquired+=spent/px
            remaining-=spent
            level_count+=1
        if remaining>Decimal("0.00000000001") or acquired<=0:
            buy={"status":"insufficient_visible_depth"}
        else:
            vwap=amount/acquired
            buy={"status":"complete","vwap":str(vwap),"levels":level_count,
                 "mid_to_vwap_bps":round(float((vwap/mid-1)*BPS),6)}
        qty=amount/mid
        left=qty
        proceeds=Decimal(0)
        level_count=0
        for px,sz in sell_side:
            if left<=0:
                break
            available=min(left,sz)
            proceeds+=px*available
            left-=available
            level_count+=1
        if left>Decimal("0.00000000001") or proceeds<=0:
            sell={"status":"insufficient_visible_depth"}
        else:
            vwap=proceeds/qty
            sell={"status":"complete","vwap":str(vwap),"levels":level_count,
                  "mid_to_vwap_bps":round(float((1-vwap/mid)*BPS),6)}
        row["notionals"].append({"usdc":cost,"buy":buy,"sell":sell})
    return row

def confirm_archive_metadata(pair,day):
    """Require official public metadata listing for the exact preselected pair and UTC day."""
    compact=day.replace("-","")
    start_ms=int(datetime.strptime(day,"%Y-%m-%d").replace(tzinfo=timezone.utc).timestamp()*1000)
    url="https://www.okx.com/api/v5/public/market-data-history?"+urlencode({
        "module":"4","instType":"SPOT","instIdList":pair,
        "dateAggrType":"daily","begin":str(start_ms),"end":str(start_ms)})
    request=Request(url,headers={"Accept":"application/json",
                                  "User-Agent":"Seven-Heaven-Calendar-L2-Research/1.0"})
    with urlopen(request,timeout=35) as response:
        raw=response.read(500000)
    answer=json.loads(raw)
    if str(answer.get("code"))!="0":
        raise ValueError("Official archive listing API rejected query")
    filename=f"{pair}-L2orderbook-400lv-{day}.tar.gz"
    canonical=(f"https://static.okx.com/cdn/okx/match/orderbook/pro/L2/"
               f"400lv/daily/{compact}/{filename}")
    entries=[]
    for section in answer.get("data",[]):
        for details in section.get("details",[]):
            if details.get("instId")!=pair or details.get("instType")!="SPOT":
                continue
            for entry in details.get("groupDetails",[]):
                if entry.get("filename")==filename and entry.get("url")==canonical:
                    entries.append(entry)
    if len(entries)!=1:
        raise ValueError("Official metadata lacks exact expected pair/day CDN archive")
    return {"metadata_api_sha256":hashlib.sha256(raw).hexdigest(),
            "metadata_received_at_utc":timestamp(),"metadata_bytes":len(raw),
            "metadata_url":url,"cdn_url":canonical,
            "file_name":filename,"advertised_sizeMB":entries[0].get("sizeMB")}


class FullDayReplay:
    def __init__(self,expected_hashes):
        self.expected_hashes=expected_hashes
        self.asks={}
        self.bids={}
        self.best_ask=None
        self.best_bid=None
        self.prior_ts=None
        self.prior_seq=None
        self.events=0
        self.snapshots=0
        self.updates=0
        self.removals=0
        self.unsequenced=0
        self.sequence_links=0
        self.max_gap_ms=0
        self.anchor_states=[]
        self.first=None
        self.last=None
        self.first_twenty_event_sha256=[]

    def update_best(self,book,delta,old,ask_side):
        # Only rescan all active levels if the old best was removed.
        if not book:
            raise ValueError("No active levels")
        if old is None or (old in delta and delta[old]==0):
            return min(book) if ask_side else max(book)
        positives=[p for p,q in delta.items() if q>0]
        if not positives:
            return old
        candidate=min(positives) if ask_side else max(positives)
        return min(old,candidate) if ask_side else max(old,candidate)

    def process(self,line):
        if len(line)>MAX_EVENT_LINE:
            raise ValueError("L2 NDJSON line exceeds 150000 bytes")
        line=line.rstrip(b"\r\n")
        if not line:
            raise ValueError("Unexpected blank record")
        obj=json.loads(line)
        if not isinstance(obj,dict) or obj.get("instId")!=ACTIVE_PAIR:
            raise ValueError("Wrong instrument or JSON format")
        act=obj.get("action")
        if act not in ("snapshot","update"):
            raise ValueError("Unknown action")
        ts=int(obj["ts"])
        if not START<=ts<END or (self.prior_ts is not None and ts<self.prior_ts):
            raise ValueError("Invalid / nonmonotonic UTC timestamp")
        if self.events<20:
            self.first_twenty_event_sha256.append(sha256(line))
        snap=act=="snapshot"
        da=parse_levels(obj.get("asks"),"asks",snap)
        db=parse_levels(obj.get("bids"),"bids",snap)
        seq=int(obj["seqId"]) if str(obj.get("seqId","")).strip() else None
        prev=int(obj["prevSeqId"]) if str(obj.get("prevSeqId","")).strip() else None
        if snap:
            self.asks=da.copy()
            self.bids=db.copy()
            self.best_ask=min(self.asks)
            self.best_bid=max(self.bids)
            self.snapshots+=1
        else:
            if self.snapshots==0:
                raise ValueError("Update before any snapshot")
            if self.prior_seq is not None and prev is not None:
                if self.prior_seq!=prev:
                    raise ValueError("Sequence gap")
                self.sequence_links+=1
            else:
                self.unsequenced+=1
            _,deleted_a=apply_levels(self.asks,da)
            _,deleted_b=apply_levels(self.bids,db)
            self.removals+=deleted_a+deleted_b
            self.best_ask=self.update_best(self.asks,da,self.best_ask,True)
            self.best_bid=self.update_best(self.bids,db,self.best_bid,False)
            self.updates+=1
        if self.best_ask is None or self.best_bid is None or self.best_bid>=self.best_ask:
            raise ValueError("Crossed or empty reconstructed BTC book")
        if self.prior_ts is not None:
            self.max_gap_ms=max(self.max_gap_ms,ts-self.prior_ts)
        self.prior_ts=ts
        self.prior_seq=seq
        self.events+=1
        if self.first is None:
            self.first=ts
        self.last=ts
        next_idx=len(self.anchor_states)
        if next_idx<len(ANCHOR_MS) and ts>=ANCHOR_MS[next_idx]:
            anchor=ANCHOR_MS[next_idx]
            if ts-anchor>60_000:
                raise ValueError("No update within 60 seconds of required anchor")
            sampled=top_book_metrics(self.asks,self.bids,ts,anchor)
            sampled["after_event_number"]=self.events
            self.anchor_states.append(sampled)

    def result(self):
        return {
            "total_events":self.events,"snapshots":self.snapshots,
            "updates":self.updates,"level_removals":self.removals,
            "sequence_links_checked":self.sequence_links,
            "updates_without_sequence_verification":self.unsequenced,
            "global_logical_continuity_proven":False,
            "maximum_gap_between_events_ms":self.max_gap_ms,
            "first_ts_ms":self.first,"last_ts_ms":self.last,
            "first_twenty_sha256_recorded":len(self.first_twenty_event_sha256)==20,
            "first_twenty_event_sha256":self.first_twenty_event_sha256,
            "prior_prefix_sha_comparison_performed":False,
            "anchors":self.anchor_states}

def read_full_archive(expected_hashes):
    req=Request(URL,headers={
        "Accept":"application/octet-stream",
        "User-Agent":"Seven-Heaven-ReadOnly-FullDay-BTC-L2-Streaming/1.0"})
    with urlopen(req,timeout=60) as response:
        http=int(response.status)
        if http!=200:
            raise ValueError("Expected full HTTP 200 download, got "+str(http))
        http_length=response.headers.get("Content-Length")
        bounded=HashingLimitedRaw(response)
        with gzip.GzipFile(fileobj=bounded,mode="rb") as stream:
            with tarfile.open(fileobj=stream,mode="r|") as tar:
                member_count=0
                replay=FullDayReplay(expected_hashes)
                unpacked_sha=hashlib.sha256()
                unpacked_bytes=0
                for member in tar:
                    if not member.isfile():
                        continue
                    member_count+=1
                    if member_count!=1 or member.name!=MEMBER or not (0<member.size<=MAX_UNPACKED):
                        raise ValueError("Unexpected archive member name/size or extra file")
                    declared_size=member.size
                    f=tar.extractfile(member)
                    if f is None:
                        raise ValueError("Cannot stream L2 member")
                    for line in f:
                        if not line.endswith(b"\n"):
                            raise ValueError("NDJSON line without final newline")
                        unpacked_bytes+=len(line)
                        if unpacked_bytes>MAX_UNPACKED:
                            raise ValueError("Unpacked 1.4GB safety cap exceeded")
                        unpacked_sha.update(line)
                        replay.process(line)
                if member_count!=1 or unpacked_bytes!=declared_size:
                    raise ValueError("Full .data byte count mismatch")
            # Force gzip footer/CRC validation and consume any tail.
            while stream.read(1024*1024):
                pass
        # Ensure raw archive SHA covers every compressed byte.
        while bounded.read(1024*1024):
            pass
        if http_length is not None and bounded.count!=int(http_length):
            raise ValueError("HTTP Content-Length / downloaded byte count mismatch")
    return {
        "source_url":URL,"http_status":http,
        "http_content_length":http_length,
        "archive_downloaded_compressed_bytes":bounded.count,
        "archive_sha256":bounded.h.hexdigest(),
        "member_uncompressed_bytes":unpacked_bytes,
        "member_declared_bytes":declared_size,
        "member_sha256":unpacked_sha.hexdigest(),
        "gzip_read_to_eof_crc_checked":True,
        "only_compact_outputs_saved":True,
        "market":replay.result()}

def create_outputs(folder,payload):
    market=payload.get("result",{}).get("market",{})
    anchor_list=market.get("anchors",[])
    p=(folder/"SEVEN_HEAVEN_OKX_L2_MULTIDAY_FOUR_ANCHORS_PROOFS.json")
    p.write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    keys=["hour_utc","actual_utc","delay_ms","event_number",
          "best_bid","best_ask","spread_bps","notional_usdc","side",
          "depth_status","vwap","mid_to_vwap_bps","levels_consumed"]
    with (folder/"SEVEN_HEAVEN_OKX_L2_MULTIDAY_FOUR_ANCHORS_COSTS.csv").open(
         "w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=keys,lineterminator="\n")
        w.writeheader()
        for anchor in anchor_list:
            for n in anchor["notionals"]:
                for side in ("buy","sell"):
                    v=n[side]
                    w.writerow({
                        "hour_utc":anchor["anchor_utc"],
                        "actual_utc":anchor["sample_utc"],
                        "delay_ms":anchor["offset_ms_after_anchor"],
                        "event_number":anchor["after_event_number"],
                        "best_bid":anchor["best_bid"],"best_ask":anchor["best_ask"],
                        "spread_bps":anchor["spread_bps"],"notional_usdc":n["usdc"],
                        "side":side,"depth_status":v["status"],
                        "vwap":v.get("vwap",""),
                        "mid_to_vwap_bps":v.get("mid_to_vwap_bps",""),
                        "levels_consumed":v.get("levels","")})
    text=[
        "# Seven Heaven — Archive L2 Spot sur date calendaire : analyse en flux",
        "",
        "Statut : "+payload["status"],
        "L'archive reste externe ; SHA-256 complets et mesures compactes dans le JSON.",
        "Il ne s'agit pas de transactions ni d'ordres réels.",
        "",
        "| Heure fixe UTC | Heure réellement observée | Spread (bp) |",
        "|---|---|---:|"
    ]
    for a in anchor_list:
        text.append("| "+a["anchor_utc"]+" | "+a["sample_utc"]+" | "+str(a["spread_bps"])+" |")
    text.extend(["",
      "Absence de seqId/prevSeqId dans les premières mises à jour :",
      "le replay ordonné ne prouve pas la continuité logique du flux source.",
      "Les quatre horaires ne constituent pas une distribution représentative.",
      "Frais, acceptation d'ordre, latence et taille exécutable non évalués.",
      ""])
    (folder/"SEVEN_HEAVEN_OKX_L2_MULTIDAY_FOUR_ANCHORS_REPORT.md").write_text(
        "\n".join(text),encoding="utf-8")

def selftest():
    e=[sha256(b"a")]
    full=FullDayReplay(e)
    snap={"instId":"BTC-USDC","action":"snapshot","ts":str(START+5),
          "asks":[["100.1","2","1"],["100.2","4","1"]],
          "bids":[["100.0","3","1"],["99.9","2","1"]]}
    # Override test hash with canonical raw synthetic event.
    raw=json.dumps(snap,separators=(",",":")).encode()
    full=FullDayReplay([sha256(raw)])
    full.process(raw)
    assert full.events==1 and len(full.anchor_states)==1
    assert len(full.first_twenty_event_sha256)==1
    v=full.anchor_states[0]
    assert v["offset_ms_after_anchor"]==5 and v["spread_bps"]>0
    delta={"instId":"BTC-USDC","action":"update","ts":str(START+15),
           "asks":[["100.1","0","0"],["100.15","1","1"]],"bids":[]}
    full.process(json.dumps(delta).encode())
    assert full.removals==1 and full.best_ask==Decimal("100.15")
    assert not full.result()["global_logical_continuity_proven"]
    assert full.result()["updates_without_sequence_verification"]==1
    assert len(full.result()["anchors"])==1
    raw=io.BytesIO()
    with gzip.GzipFile(fileobj=raw,mode="wb") as zipped:
        zipped.write(b"synthetic gzip verify")
    stream=io.BytesIO(raw.getvalue())
    h=HashingLimitedRaw(stream)
    with gzip.GzipFile(fileobj=h) as z:
        assert z.read()==b"synthetic gzip verify"
    assert h.count==len(raw.getvalue())
    print("PASS: streamed hash/gzip, deterministic anchors and L2 deletion handling")

def main():
    global URL, MEMBER, START, END, ANCHOR_MS, ACTIVE_PAIR
    ap=argparse.ArgumentParser()
    ap.add_argument("--repo-root",type=Path,default=Path("."))
    ap.add_argument("--output",type=Path)
    ap.add_argument("--selftest",action="store_true")
    ap.add_argument("--day",choices=DATES_ALLOWED)
    ap.add_argument("--pair",choices=PAIR_ALLOWED)
    args=ap.parse_args()
    if args.selftest:
        selftest()
        return
    if not args.day or not args.pair:
        ap.error("--day and --pair required for archive reads")
    ACTIVE_PAIR=args.pair
    START=int(datetime.strptime(args.day,"%Y-%m-%d").replace(tzinfo=timezone.utc).timestamp()*1000)
    END=START+86400000
    ANCHOR_MS=tuple(START+h*3600000 for h in ANCHOR_HOURS)
    dest=args.output or args.repo_root/OUT/args.day/args.pair.lower().replace("-","_")
    dest.mkdir(parents=True,exist_ok=True)
    initiated=timestamp()
    try:
        metadata=confirm_archive_metadata(args.pair,args.day)
        URL=metadata["cdn_url"]
        MEMBER=metadata["file_name"].replace(".tar.gz",".data")
        data=read_full_archive([])
        market=data["market"]
        if len(market["anchors"])!=4 or market["total_events"]<20 or not market["first_twenty_sha256_recorded"]:
            raise ValueError("Full day did not yield all four anchors or first 20 events")
        result={"status":"full_archive_replayed_four_anchors","at_utc":initiated,
                "completed_at_utc":timestamp(),
                "read_only":True,"orders_enabled":False,
                "source_archive_fully_read":True,
                "sequence_continuity_proven":False,
                "pair":args.pair,"day_utc":args.day,
                "metadata":metadata,"result":data,
                "limitations":["Gzip CRC and byte SHA verify the copy, not upstream logical sequence completeness.",
                    "Four fixed snapshots on one historical day are not representative of a multi-year market.",
                    "No simulated fills occurred; orderbook depth is not guaranteed executable.",
                    "No account trading fees; quote asset USDC not equal USD/USDT."]}
    except Exception as exc:
        result={"status":"failed_quality_or_access_check","at_utc":initiated,
                "pair":args.pair,"day_utc":args.day,
                "completed_at_utc":timestamp(),"read_only":True,
                "orders_enabled":False,"source_archive_fully_read":False,
                "error_type":type(exc).__name__,"error":str(exc)[:400],
                "no_results_invented":True}
    create_outputs(dest,result)
    print(json.dumps({"status":result["status"],
                      "error":result.get("error"),
                      "events":result.get("result",{}).get("market",{}).get("total_events"),
                      "anchors":len(result.get("result",{}).get("market",{}).get("anchors",[]))},
                     indent=2))

if __name__=="__main__":
    main()
