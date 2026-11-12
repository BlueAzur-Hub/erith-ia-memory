#!/usr/bin/env python3
"""Read-only Aug/Sep event-time spread persistence and minute-resolution OKX L2 research.

No large source file written: parse NDJSON records from gzip tar stream.
96 pinned historical snapshots plus 1440 minute states; integrate event-to-event durations.
Source event order lacks seqId/prevSeqId in preflight; no full logical
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
import statistics
from pathlib import Path
import tarfile
from urllib.request import Request, urlopen

ROOT=Path("coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles")
OUT=ROOT/"okx_l2_aug_sep_one_minute_event_time_spread_persistence_2026_11_12_evidence"
PAIR_CONFIG={
 "2026-08-15|BTC-USDC":{
  "url":"https://static.okx.com/cdn/okx/match/orderbook/pro/L2/400lv/daily/20260815/BTC-USDC-L2orderbook-400lv-2026-08-15.tar.gz",
  "member":"BTC-USDC-L2orderbook-400lv-2026-08-15.data",
  "four_proof":ROOT/"okx_l2_calendar_multiday_2026_11_12_evidence/2026-08-15/btc_usdc/SEVEN_HEAVEN_OKX_L2_MULTIDAY_FOUR_ANCHORS_PROOFS.json",
  "four_blob":"7e78002061c8ecf01ef178e0ee90920480b665ce",
  "ref_96":ROOT/"okx_l2_aug_sep_96_quarter_hour_2026_11_12_evidence/2026-08-15/btc_usdc/SEVEN_HEAVEN_OKX_L2_96_STATES_SOURCE_PROOFS.json",
  "ref_96_blob":"ae4d975242a113f8ab81a28bca334b8d62973ce8",
  "sha_archive":"a8af512dabf96c6e5c8af37a0e19eb11ebce88ed232308cba9a63a37053fc130",
  "sha_member":"c7836a3f16229b1b211230ef4b40f46a3e25067196dee9193df0642c734e0050",
  "member_bytes":57596807
 },
 "2026-08-15|ETH-USDC":{
  "url":"https://static.okx.com/cdn/okx/match/orderbook/pro/L2/400lv/daily/20260815/ETH-USDC-L2orderbook-400lv-2026-08-15.tar.gz",
  "member":"ETH-USDC-L2orderbook-400lv-2026-08-15.data",
  "four_proof":ROOT/"okx_l2_calendar_multiday_2026_11_12_evidence/2026-08-15/eth_usdc/SEVEN_HEAVEN_OKX_L2_MULTIDAY_FOUR_ANCHORS_PROOFS.json",
  "four_blob":"65bd1adfbd7a4a1098b7392cfcc49f6b2059bbc8",
  "ref_96":ROOT/"okx_l2_aug_sep_96_quarter_hour_2026_11_12_evidence/2026-08-15/eth_usdc/SEVEN_HEAVEN_OKX_L2_96_STATES_SOURCE_PROOFS.json",
  "ref_96_blob":"afd81ec52fbbc03c51a946a0dea5ce93f9732275",
  "sha_archive":"9da303d949bce4f25248f7d3f6b7e34e2be6ed426b4945a395c3097d7932bfca",
  "sha_member":"403a2c22a53730a15a3deb826fd1df1a90e13c1486f60c5b0d84a69ffed5b870",
  "member_bytes":59989509
 },
 "2026-09-15|BTC-USDC":{
  "url":"https://static.okx.com/cdn/okx/match/orderbook/pro/L2/400lv/daily/20260915/BTC-USDC-L2orderbook-400lv-2026-09-15.tar.gz",
  "member":"BTC-USDC-L2orderbook-400lv-2026-09-15.data",
  "four_proof":ROOT/"okx_l2_calendar_multiday_2026_11_12_evidence/2026-09-15/btc_usdc/SEVEN_HEAVEN_OKX_L2_MULTIDAY_FOUR_ANCHORS_PROOFS.json",
  "four_blob":"214d213c6085e44636c4e34f2b46596cd4c73fea",
  "ref_96":ROOT/"okx_l2_aug_sep_96_quarter_hour_2026_11_12_evidence/2026-09-15/btc_usdc/SEVEN_HEAVEN_OKX_L2_96_STATES_SOURCE_PROOFS.json",
  "ref_96_blob":"1d173cd27be2ac971326850e1d81dfe5ad4a0857",
  "sha_archive":"53ab528063479e83dbd833be63615d09cee209897d39021403a88fd6f2d31460",
  "sha_member":"4a1b0c645c7c672c94f3a8e58c885def6441d34b9d8e7f6006f5d05f0e8e66ac",
  "member_bytes":491977909
 },
 "2026-09-15|ETH-USDC":{
  "url":"https://static.okx.com/cdn/okx/match/orderbook/pro/L2/400lv/daily/20260915/ETH-USDC-L2orderbook-400lv-2026-09-15.tar.gz",
  "member":"ETH-USDC-L2orderbook-400lv-2026-09-15.data",
  "four_proof":ROOT/"okx_l2_calendar_multiday_2026_11_12_evidence/2026-09-15/eth_usdc/SEVEN_HEAVEN_OKX_L2_MULTIDAY_FOUR_ANCHORS_PROOFS.json",
  "four_blob":"37f18a89b92b36e418775b4fd1e4fe19c90d7486",
  "ref_96":ROOT/"okx_l2_aug_sep_96_quarter_hour_2026_11_12_evidence/2026-09-15/eth_usdc/SEVEN_HEAVEN_OKX_L2_96_STATES_SOURCE_PROOFS.json",
  "ref_96_blob":"eb882de160670bc8f7099645af86a07ab3a31dd6",
  "sha_archive":"694464feb71a39dccff0188087079f3d200b50e51efc4a4120b454e4a9213924",
  "sha_member":"5e558436c384f8e8d6d9e21d29f3b322501072e642dfa276ce95d082bb4b6178",
  "member_bytes":408853414
 }
}
ACTIVE_DATE="2026-08-15"
ACTIVE_PAIR="BTC-USDC"
BASE_CONFIG=PAIR_CONFIG["2026-08-15|BTC-USDC"]
URL=BASE_CONFIG["url"]
MEMBER=BASE_CONFIG["member"]
PREFIX=BASE_CONFIG["four_proof"]
PREFIX_GIT_BLOB=BASE_CONFIG["four_blob"]
REFERENCE=BASE_CONFIG["ref_96"]
REFERENCE_BLOB=BASE_CONFIG["ref_96_blob"]
EXPECTED_ARCHIVE_SHA=BASE_CONFIG["sha_archive"]
EXPECTED_MEMBER_SHA=BASE_CONFIG["sha_member"]
EXPECTED_UNPACKED=BASE_CONFIG["member_bytes"]
MAX_COMPRESSED=230_000_000
MAX_UNPACKED=1_400_000_000
MAX_EVENT_LINE=150_000
START=1786752000000
END=1786838400000
ANCHOR_MINUTES=tuple(range(0,1440,15))
ANCHOR_MS=tuple(START+minute*60000 for minute in ANCHOR_MINUTES)
REFERENCE_HOURS=(0,6,12,18)
MINUTE_MS=tuple(START+i*60000 for i in range(1440))
THRESHOLDS={"0.1":0.1,"0.5":0.5,"1.0":1.0,"2.0":2.0}
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

def preflight_checks(repo_root):
    raw=(repo_root/PREFIX).read_bytes()
    if blob_sha(raw)!=PREFIX_GIT_BLOB:
        raise ValueError("Prior first-20 source proof Git blob mismatch")
    old=json.loads(raw)
    if old.get("status")!="full_archive_replayed_four_anchors":
        raise ValueError("Prior first-20 source proof is incomplete")
    r=old["result"]
    if r["archive_sha256"]!=EXPECTED_ARCHIVE_SHA or r["member_sha256"]!=EXPECTED_MEMBER_SHA:
        raise ValueError("Prior source archive/member SHA disagrees")
    hashes=r["market"].get("first_twenty_event_sha256",[])
    if len(hashes)!=20 or any(not isinstance(h,str) or len(h)!=64 for h in hashes):
        raise ValueError("Missing original twenty event line hashes")
    return hashes

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
        self.snapshot_events=[]
        self.minute_states=[]
        self.last_spread_bp=None
        self.time_weighted_spread_bp_ms=0.0
        self.covered_time_ms=0
        self.threshold_time_ms={k:0 for k in THRESHOLDS}
        self.active_episode_start_ms={k:None for k in THRESHOLDS}
        self.finished_episodes={k:{"count":0,"sum_duration_ms":0,"ge_1s":0,
                                    "ge_10s":0,"ge_60s":0,"max_duration_ms":0,
                                    "longest":[],"zero_duration_discarded":0} for k in THRESHOLDS}
        self.first=None
        self.last=None

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


    def record_episode(self,key,start,stop,censored=False):
        duration=stop-start
        if duration<0:
            raise ValueError("Negative event-time episode length")
        state=self.finished_episodes[key]
        if duration==0:
            state["zero_duration_discarded"]+=1
            return
        state["count"]+=1
        state["sum_duration_ms"]+=duration
        state["ge_1s"]+=int(duration>=1000)
        state["ge_10s"]+=int(duration>=10000)
        state["ge_60s"]+=int(duration>=60000)
        state["max_duration_ms"]=max(state["max_duration_ms"],duration)
        candidate={"start_utc":datetime.fromtimestamp(start/1000,timezone.utc).isoformat(),
                   "end_utc":datetime.fromtimestamp(stop/1000,timezone.utc).isoformat(),
                   "duration_ms":duration,"right_censored_at_final_event":censored}
        state["longest"].append(candidate)
        if len(state["longest"])>20:
            state["longest"].sort(key=lambda a:(-a["duration_ms"],a["start_utc"]))
            del state["longest"][20:]

    def accumulate_previous_state(self,ts):
        if self.prior_ts is None:
            return
        elapsed=ts-self.prior_ts
        if elapsed<0:
            raise ValueError("Negative event-time interval")
        self.covered_time_ms+=elapsed
        self.time_weighted_spread_bp_ms+=self.last_spread_bp*elapsed
        for key,threshold in THRESHOLDS.items():
            if self.last_spread_bp>threshold:
                self.threshold_time_ms[key]+=elapsed

    def mark_new_state(self,ts,spread):
        for key,threshold in THRESHOLDS.items():
            was_above=self.last_spread_bp is not None and self.last_spread_bp>threshold
            now_above=spread>threshold
            if was_above and not now_above:
                start=self.active_episode_start_ms[key]
                if start is None:
                    raise ValueError("Episode closing without opening")
                self.record_episode(key,start,ts)
                self.active_episode_start_ms[key]=None
            elif now_above and not was_above:
                self.active_episode_start_ms[key]=ts
        self.last_spread_bp=spread

    def event_time_summary(self):
        covered=self.covered_time_ms
        if covered<=0 or covered!=self.last-self.first:
            raise ValueError("Observed time coverage incorrect")
        thresholds={}
        for key in THRESHOLDS:
            orig=self.finished_episodes[key]
            state={x:y for x,y in orig.items() if x!="longest"}
            longest=list(orig["longest"])
            active=self.active_episode_start_ms[key]
            state["right_censored_at_final_event"]=active is not None
            if active is not None:
                duration=self.last-active
                if duration>0:
                    state["count"]+=1
                    state["sum_duration_ms"]+=duration
                    state["ge_1s"]+=int(duration>=1000)
                    state["ge_10s"]+=int(duration>=10000)
                    state["ge_60s"]+=int(duration>=60000)
                    state["max_duration_ms"]=max(state["max_duration_ms"],duration)
                    longest.append({"start_utc":datetime.fromtimestamp(active/1000,timezone.utc).isoformat(),
                                    "end_utc":datetime.fromtimestamp(self.last/1000,timezone.utc).isoformat(),
                                    "duration_ms":duration,"right_censored_at_final_event":True})
                else:
                    state["zero_duration_discarded"]+=1
            if state["sum_duration_ms"]!=self.threshold_time_ms[key]:
                raise ValueError("Episode durations do not equal integrated event-time durations")
            state["above_threshold_ms"]=self.threshold_time_ms[key]
            state["fraction_of_covered_time"]=self.threshold_time_ms[key]/covered
            state["longest_20"]=sorted(longest,key=lambda z:(-z["duration_ms"],z["start_utc"]))[:20]
            thresholds[key]=state
        return {"coverage_definition":"[first_event_ms,last_event_ms), no extrapolation after last event",
                "first_event_ts_ms":self.first,"last_event_ts_ms":self.last,
                "covered_ms":covered,
                "time_weighted_spread_bp":self.time_weighted_spread_bp_ms/covered,
                "threshold_operator":"> strictly",
                "thresholds_bp":thresholds}

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
        if self.events<len(self.expected_hashes) and sha256(line)!=self.expected_hashes[self.events]:
            raise ValueError("First-20 event hash mismatches previously audited prefix")
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
            raise ValueError("Crossed or empty reconstructed book")
        if self.prior_ts is not None:
            self.max_gap_ms=max(self.max_gap_ms,ts-self.prior_ts)
        self.accumulate_previous_state(ts)
        self.mark_new_state(ts,float((self.best_ask-self.best_bid)/((self.best_ask+self.best_bid)/2)*BPS))
        self.prior_ts=ts
        self.prior_seq=seq
        self.events+=1
        if snap:
            closest_index=min(95,max(0,(ts-START+450000)//900000))
            expected=ANCHOR_MS[closest_index]
            self.snapshot_events.append({
                "event_number":self.events,
                "event_utc":datetime.fromtimestamp(ts/1000,timezone.utc).isoformat(),
                "event_ts_ms":ts,
                "closest_quarter_hour_utc":datetime.fromtimestamp(expected/1000,timezone.utc).isoformat(),
                "offset_from_closest_quarter_ms":ts-expected,
                "closest_quarter_index":closest_index
            })
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
            sampled["source_event_action"]=act
            self.anchor_states.append(sampled)
        minute_idx=len(self.minute_states)
        if minute_idx<len(MINUTE_MS) and ts>=MINUTE_MS[minute_idx]:
            minute_anchor=MINUTE_MS[minute_idx]
            if ts-minute_anchor>60000:
                raise ValueError("No valid source event within 60 seconds of minute "+str(minute_idx))
            self.minute_states.append({
                "anchor_utc":datetime.fromtimestamp(minute_anchor/1000,timezone.utc).isoformat(),
                "sample_utc":datetime.fromtimestamp(ts/1000,timezone.utc).isoformat(),
                "offset_ms_after_anchor":ts-minute_anchor,
                "source_event_number":self.events,
                "source_event_action":act,
                "best_bid":str(self.best_bid),"best_ask":str(self.best_ask),
                "spread_bps":round(self.last_spread_bp,8),
                "asks_active":len(self.asks),"bids_active":len(self.bids)})

    def result(self):
        return {
            "total_events":self.events,"snapshots":self.snapshots,
            "updates":self.updates,"level_removals":self.removals,
            "sequence_links_checked":self.sequence_links,
            "updates_without_sequence_verification":self.unsequenced,
            "global_logical_continuity_proven":False,
            "maximum_gap_between_events_ms":self.max_gap_ms,
            "first_ts_ms":self.first,"last_ts_ms":self.last,
            "first_20_event_hashes_match_prior_proof":self.events>=20,
            "anchors":self.anchor_states,
            "snapshot_events":self.snapshot_events,
            "minute_states":self.minute_states,
            "event_time_persistence":self.event_time_summary() if self.events>1 else None}

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
                    if member_count!=1 or member.name!=MEMBER or member.size!=EXPECTED_UNPACKED:
                        raise ValueError("Unexpected archive member name/size or extra file")
                    f=tar.extractfile(member)
                    if f is None:
                        raise ValueError("Cannot stream L2 member")
                    for line in f:
                        unpacked_bytes+=len(line)
                        if unpacked_bytes>MAX_UNPACKED:
                            raise ValueError("Unpacked 600MB safety cap exceeded")
                        unpacked_sha.update(line)
                        replay.process(line)
                if member_count!=1 or unpacked_bytes!=EXPECTED_UNPACKED:
                    raise ValueError("Full .data byte count mismatch")
            # Force gzip footer/CRC validation and consume any tail.
            while stream.read(1024*1024):
                pass
        # Ensure raw archive SHA covers every compressed byte.
        while bounded.read(1024*1024):
            pass
        if http_length is not None and bounded.count!=int(http_length):
            raise ValueError("HTTP Content-Length / downloaded byte count mismatch")
    if bounded.h.hexdigest()!=EXPECTED_ARCHIVE_SHA:
        raise ValueError("Whole compressed archive SHA-256 differs from prior October audit")
    if unpacked_sha.hexdigest()!=EXPECTED_MEMBER_SHA:
        raise ValueError("Whole .data SHA-256 differs from prior October audit")
    return {
        "source_url":URL,"http_status":http,
        "http_content_length":http_length,
        "archive_downloaded_compressed_bytes":bounded.count,
        "archive_sha256":bounded.h.hexdigest(),
        "member_uncompressed_bytes":unpacked_bytes,
        "member_sha256":unpacked_sha.hexdigest(),
        "gzip_read_to_eof_crc_checked":True,
        "only_compact_outputs_saved":True,
        "market":replay.result()}

def percentile(values,p):
    """Type-7 linear interpolation of SORTED empirical anchor values."""
    xs=sorted(values)
    if not xs:
        return None
    h=(len(xs)-1)*p
    lo=int(h)
    hi=min(len(xs)-1,lo+1)
    return xs[lo]*(1-(h-lo))+xs[hi]*(h-lo)

def check_reference(repo_root,full_market):
    raw=(repo_root/REFERENCE).read_bytes()
    if blob_sha(raw)!=REFERENCE_BLOB:
        raise ValueError("Previously published 96-anchor Git blob changed")
    old=json.loads(raw)
    if old["status"]!="full_archive_replayed_ninety_six_states":
        raise ValueError("Four-hour prior proof not validated")
    source=old["result"]
    if source["archive_sha256"]!=EXPECTED_ARCHIVE_SHA or source["member_sha256"]!=EXPECTED_MEMBER_SHA:
        raise ValueError("Old archive hashes do not match source")
    anchor_map={a["anchor_utc"][11:16]:a for a in full_market["anchors"]}
    checks=[]
    for idx,original in enumerate(source["market"]["anchors"]):
        hh=original["anchor_utc"][11:16]
        if hh not in anchor_map:
            raise ValueError("Missing historical 15-minute grid anchor "+hh)
        a=anchor_map[hh]
        for key in ("anchor_utc","sample_utc","after_event_number",
                    "best_bid","best_ask","offset_ms_after_anchor"):
            if a[key]!=original[key]:
                raise ValueError(f"96-anchor prior evidence mismatch {hh} {key}")
        if abs(a["spread_bps"]-original["spread_bps"])>1e-9:
            raise ValueError(f"96-anchor historical spread mismatch at {hh}")
        for q in range(5):
            for side in ("buy","sell"):
                new=a["notionals"][q][side]
                oldside=original["notionals"][q][side]
                if new!=oldside:
                    raise ValueError(f"96-anchor book cost mismatch {hh} {q} {side}")
        checks.append({"hour_utc":hh,"verified":True,
                       "spread_bps":a["spread_bps"],"event_number":a["after_event_number"]})
    if len(checks)!=96:
        raise ValueError("Did not match every published 15-minute reference")
    return checks

def describe_states(anchors):
    values=[a["spread_bps"] for a in anchors]
    if not values:
        return {"n":0}
    result={"n":len(values),"mean_bps":statistics.mean(values),
            "median_bps":statistics.median(values),
            "p10_bps":percentile(values,.1),
            "p90_bps":percentile(values,.9),
            "min_bps":min(values),"max_bps":max(values),
            "quantile_definition":"Type-7 linear interpolation over sorted 96 fixed quarter-hour states"}
    for amount in (1000,100000):
        for side in ("buy","sell"):
            v=[n[side]["mid_to_vwap_bps"] for a in anchors
               for n in a["notionals"] if n["usdc"]==amount
               and n[side]["status"]=="complete"]
            result[f"{amount}_{side}_valid_points"]=len(v)
            result[f"{amount}_{side}_mean_price_cost_bps"]=statistics.mean(v) if v else None
            result[f"{amount}_{side}_p90_price_cost_bps"]=percentile(v,.9)
    return result

def create_outputs(folder,payload):
    market=payload.get("result",{}).get("market",{})
    minutes=market.get("minute_states",[])
    (folder/"SEVEN_HEAVEN_OKX_L2_ONE_MINUTE_PERSISTENCE_SOURCE_PROOFS.json").write_text(
        json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    fields=["anchor_utc","sample_utc","offset_ms_after_anchor","source_event_number",
            "source_event_action","best_bid","best_ask","spread_bps",
            "asks_active","bids_active"]
    with (folder/"SEVEN_HEAVEN_OKX_L2_ONE_MINUTE_SPREADS_1440.csv").open(
            "w",newline="",encoding="utf8") as output:
        writer=csv.DictWriter(output,fieldnames=fields,lineterminator="\n")
        writer.writeheader()
        for row in minutes:
            writer.writerow({k:row.get(k,"") for k in fields})
    values=market.get("event_time_persistence") or {}
    with (folder/"SEVEN_HEAVEN_OKX_L2_EVENT_TIME_LONGEST_SPREAD_EPISODES.csv").open(
            "w",newline="",encoding="utf8") as output:
        cols=["threshold_bp","start_utc","end_utc","duration_ms",
              "right_censored_at_final_event"]
        writer=csv.DictWriter(output,fieldnames=cols,lineterminator="\n")
        writer.writeheader()
        for key,details in values.get("thresholds_bp",{}).items():
            for ep in details["longest_20"]:
                writer.writerow({"threshold_bp":key,**ep})
    report=[
        "# Seven Heaven — Une minute et persistance en temps d'événements OKX L2",
        "",
        "Instrument : "+str(payload.get("pair"))+", journée UTC "+str(payload.get("day_utc"))+".",
        "Statut : "+payload["status"],
        "Relevés minute : "+str(len(minutes))+"/1440.",
        "Vérifications des 96 anciennes snapshots : "+str(len(payload.get("reference_quarter_checks",[])))+"/96.",
        "Archives SHA/CRC dans la preuve JSON ; aucun ordre réel.",
        "",
    ]
    if values:
        report.extend([
            "Durée observée événement à événement : "+str(values["covered_ms"])+" ms.",
            "Spread moyen pondéré par durée des événements (bp) : "+str(values["time_weighted_spread_bp"]),
            "Seuils : strictement supérieurs aux valeurs indiquées, sans extrapolation à 24:00.",
            "",
            "| Seuil bp | Durée cumulée ms | Part du temps couvert | Épisodes positifs | Épisode max ms |",
            "|---|---:|---:|---:|---:|",
        ])
        for key,x in values["thresholds_bp"].items():
            report.append(f'| >{key} | {x["above_threshold_ms"]} | {x["fraction_of_covered_time"]:.8f} | {x["count"]} | {x["max_duration_ms"]} |')
    else:
        report.append("Contrôles échoués : "+str(payload.get("error")))
    report.extend(["","Limite : la lecture SHA-256/CRC ne prouve pas qu'aucun événement manque en amont de l'archive."])
    (folder/"SEVEN_HEAVEN_OKX_L2_ONE_MINUTE_PERSISTENCE_READABLE_REPORT.md").write_text(
        "\n".join(report)+"\n",encoding="utf8")

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
    assert len(full.snapshot_events)==1
    v=full.anchor_states[0]
    assert v["offset_ms_after_anchor"]==5 and v["spread_bps"]>0
    delta={"instId":"BTC-USDC","action":"update","ts":str(START+15),
           "asks":[["100.1","0","0"],["100.15","1","1"]],"bids":[]}
    full.process(json.dumps(delta).encode())
    assert full.removals==1 and full.best_ask==Decimal("100.15")
    assert not full.result()["global_logical_continuity_proven"]
    assert full.result()["updates_without_sequence_verification"]==1
    assert len(full.result()["anchors"])==1
    assert len(ANCHOR_MS)==96
    assert len(MINUTE_MS)==1440
    assert full.minute_states[0]["offset_ms_after_anchor"]==5
    assert describe_states([full.anchor_states[0]])["n"]==1
    summary=full.event_time_summary()
    assert summary["covered_ms"]==10
    assert 0<=summary["time_weighted_spread_bp"]<100
    # Synthetic episode: 100 bp for one second, near-zero for one second,
    # high for one second, with final episode right-censored.
    test=FullDayReplay([])
    def msg(action,ms,asks,bids):
        return json.dumps({"instId":ACTIVE_PAIR,"action":action,"ts":str(START+ms),
            "asks":asks,"bids":bids},separators=(",",":")).encode()
    test.process(msg("snapshot",5,[["101","2","1"]],[["100","2","1"]]))
    test.process(msg("update",1005,[["101","0","0"],["100.0001","2","1"]],[]))
    test.process(msg("update",2005,[["100.0001","0","0"],["101","2","1"]],[]))
    test.process(msg("update",3005,[],[]))
    e=test.event_time_summary()
    assert e["covered_ms"]==3000
    for key in THRESHOLDS:
        z=e["thresholds_bp"][key]
        assert z["above_threshold_ms"]==2000
        assert z["sum_duration_ms"]==2000
        assert z["count"]==2 and z["ge_1s"]==2
        assert z["max_duration_ms"]==1000
        assert z["right_censored_at_final_event"]
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
    global ACTIVE_DATE, ACTIVE_PAIR, URL, MEMBER, PREFIX, PREFIX_GIT_BLOB, REFERENCE
    global REFERENCE_BLOB, EXPECTED_ARCHIVE_SHA, EXPECTED_MEMBER_SHA, EXPECTED_UNPACKED
    global START, END, ANCHOR_MS, MINUTE_MS
    ap=argparse.ArgumentParser()
    ap.add_argument("--repo-root",type=Path,default=Path("."))
    ap.add_argument("--output",type=Path)
    ap.add_argument("--selftest",action="store_true")
    ap.add_argument("--pair",choices=("BTC-USDC","ETH-USDC"))
    ap.add_argument("--day",choices=("2026-08-15","2026-09-15"))
    args=ap.parse_args()
    if args.selftest:
        selftest()
        return
    if not args.pair or not args.day:
        ap.error("--day and --pair required")
    ACTIVE_PAIR=args.pair
    ACTIVE_DATE=args.day
    START=int(datetime.strptime(ACTIVE_DATE,"%Y-%m-%d").replace(tzinfo=timezone.utc).timestamp()*1000)
    END=START+86400000
    ANCHOR_MS=tuple(START+i*900000 for i in range(96))
    MINUTE_MS=tuple(START+i*60000 for i in range(1440))
    config=PAIR_CONFIG[ACTIVE_DATE+"|"+ACTIVE_PAIR]
    URL=config["url"];MEMBER=config["member"]
    PREFIX=config["four_proof"];PREFIX_GIT_BLOB=config["four_blob"]
    REFERENCE=config["ref_96"];REFERENCE_BLOB=config["ref_96_blob"]
    EXPECTED_ARCHIVE_SHA=config["sha_archive"];EXPECTED_MEMBER_SHA=config["sha_member"]
    EXPECTED_UNPACKED=config["member_bytes"]
    dest=args.output or args.repo_root/OUT/ACTIVE_DATE/ACTIVE_PAIR.lower().replace("-","_")
    dest.mkdir(parents=True,exist_ok=True)
    initiated=timestamp()
    try:
        expected=preflight_checks(args.repo_root)
        data=read_full_archive(expected)
        market=data["market"]
        if len(market["anchors"])!=96 or market["total_events"]<20 or len(market["minute_states"])!=1440:
            raise ValueError("Missing quarter-hour or one-minute states")
        if market["event_time_persistence"]["covered_ms"]!=market["last_ts_ms"]-market["first_ts_ms"]:
            raise ValueError("Incorrect source event duration coverage")
        if market["snapshots"]!=96 or len(market["snapshot_events"])!=96:
            raise ValueError("Snapshot catalog completeness check failed")
        reference_matches=check_reference(args.repo_root,market)
        if len(reference_matches)!=96:
            raise ValueError("Historical 96 snapshots did not match exact reference")
        result={"status":"full_archive_replayed_one_minute_with_event_time_persistence","at_utc":initiated,
                "pair":ACTIVE_PAIR,"day_utc":ACTIVE_DATE,
                "preregistered_one_minute_hours":1440,"reference_quarter_checks":reference_matches,
                "summary_96_stable_states":describe_states(market["anchors"]),
                "completed_at_utc":timestamp(),
                "read_only":True,"orders_enabled":False,
                "source_archive_fully_read":True,
                "sequence_continuity_proven":False,
                "result":data,
                "limitations":["Gzip CRC and byte SHA verified, but L2 events lack sequence counters in preflight.",
                    "One thousand four hundred forty minute samples and event-held durations on one archived day do not establish a multi-day market distribution.",
                    "No simulated fills occurred; orderbook depth is not guaranteed executable.",
                    "No account trading fees; quote asset USDC not equal USD/USDT."]}
    except Exception as exc:
        result={"status":"failed_quality_or_access_check","at_utc":initiated,
                "pair":ACTIVE_PAIR,"day_utc":ACTIVE_DATE,
                "completed_at_utc":timestamp(),"read_only":True,
                "orders_enabled":False,"source_archive_fully_read":False,
                "error_type":type(exc).__name__,"error":str(exc)[:400],
                "no_results_invented":True}
    create_outputs(dest,result)
    print(json.dumps({"day":ACTIVE_DATE,"pair":ACTIVE_PAIR,"status":result["status"],
                      "error":result.get("error"),
                      "events":result.get("result",{}).get("market",{}).get("total_events"),
                      "minutes":len(result.get("result",{}).get("market",{}).get("minute_states",[]))},
                     indent=2))

if __name__=="__main__":
    main()
