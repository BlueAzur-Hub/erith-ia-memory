#!/usr/bin/env python3
"""Bounded OKX BTC-USDC 2026-10-15 official L2 event-prefix reconstruction.
At most 2MiB compressed, 512KiB decompressed, 20 complete NDJSON records.
Read-only; no account, orders, or recurring work.
"""
from __future__ import annotations
import argparse
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
import hashlib
import io
import json
from pathlib import Path
import tarfile
from urllib.request import Request, urlopen

ROOT=Path("coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles")
OUTPUT=ROOT/"okx_l2_btc_usdc_complete_event_prefix_2026_11_12_evidence"
URL=("https://static.okx.com/cdn/okx/match/orderbook/pro/L2/400lv/"
     "daily/20261015/BTC-USDC-L2orderbook-400lv-2026-10-15.tar.gz")
MEMBER="BTC-USDC-L2orderbook-400lv-2026-10-15.data"
COMPRESSED_MAX=2*1024*1024
DECOMPRESSED_MAX=512*1024
MAX_EVENTS=20
MAX_LINE=100000
START_MS=1792022400000
END_MS=1792108800000

def stamp():
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00","Z")

def sha(raw:bytes)->str:
    return hashlib.sha256(raw).hexdigest()

def number(v):
    try:
        d=Decimal(str(v))
    except (InvalidOperation,ValueError,TypeError) as e:
        raise ValueError("Invalid decimal in L2 event") from e
    if not d.is_finite():
        raise ValueError("Non-finite decimal")
    return d

class LimitedReader:
    def __init__(self,stream,limit=COMPRESSED_MAX):
        self.stream=stream
        self.limit=limit
        self.count=0
        self.h=hashlib.sha256()
    def read(self,n=-1):
        left=self.limit-self.count
        if left<=0:
            return b""
        count=left if n is None or n<0 else min(left,n)
        raw=self.stream.read(count)
        self.count+=len(raw)
        self.h.update(raw)
        return raw

def extract_prefix(stream):
    limited=LimitedReader(stream)
    member_info=None
    prefix=b""
    with tarfile.open(fileobj=limited,mode="r|gz") as archive:
        for member in archive:
            if not member.isfile():
                continue
            if member.name!=MEMBER:
                raise ValueError("Unexpected first regular tar member: "+member.name[:180])
            if member.size<=0 or member.size>2_000_000_000:
                raise ValueError("Unreasonable uncompressed member size")
            member_info={"name":member.name,"reported_uncompressed_size_bytes":member.size}
            handle=archive.extractfile(member)
            if handle is None:
                raise ValueError("Member not readable")
            prefix=handle.read(DECOMPRESSED_MAX)
            break
    if member_info is None:
        raise ValueError("No regular member")
    if limited.count>COMPRESSED_MAX or len(prefix)>DECOMPRESSED_MAX:
        raise ValueError("Byte bound exceeded")
    return {"compressed_prefix_bytes_read":limited.count,
            "compressed_prefix_sha256":limited.h.hexdigest(),
            "uncompressed_prefix_bytes_read":len(prefix),
            "uncompressed_prefix_sha256":sha(prefix),
            "member":member_info},prefix

def complete_lines(raw):
    # The trailing fragment is discarded unless terminated by newline.
    pieces=raw.split(b"\n")
    lines=[]
    for item in pieces[:-1]:
        line=item.rstrip(b"\r")
        if not line:
            continue
        if len(line)>MAX_LINE:
            raise ValueError("Full NDJSON line too large")
        lines.append(line)
        if len(lines)>=MAX_EVENTS:
            break
    return lines, len(pieces[-1]) if not raw.endswith(b"\n") else 0

def levels(field,side,allow_zero):
    if not isinstance(field,list):
        raise ValueError("Missing "+side+" list")
    result={}
    previous=None
    for item in field:
        if not isinstance(item,list) or len(item)<2:
            raise ValueError("Malformed "+side+" level")
        px,sz=number(item[0]),number(item[1])
        if px<=0 or sz<0 or (sz==0 and not allow_zero):
            raise ValueError("Invalid level in "+side)
        if px in result:
            raise ValueError("Duplicate price within one L2 event")
        if previous is not None and not allow_zero:
            if side=="asks" and px<=previous:
                raise ValueError("Snapshot asks unsorted")
            if side=="bids" and px>=previous:
                raise ValueError("Snapshot bids unsorted")
        result[px]=sz
        previous=px
    return result

def apply(book,changes):
    updated=deleted=0
    for price,size in changes.items():
        if size==0:
            book.pop(price,None)
            deleted+=1
        else:
            book[price]=size
            updated+=1
    return updated,deleted

def inspect_events(lines):
    if not lines:
        return {"status":"no_complete_event","events_count":0,
                "continuity":"not_assessable"}
    asks,bids={},{}
    started=False
    prior_time=None
    prior_seq=None
    sequence_pairs=0
    unsequenced_updates=0
    actions={"snapshot":0,"update":0}
    events=[]
    first_keys=None
    for idx,line in enumerate(lines):
        try:
            item=json.loads(line.decode("utf-8"))
            if not isinstance(item,dict) or item.get("instId")!="BTC-USDC":
                raise ValueError("Wrong instrument or event structure")
            action=item.get("action")
            if action not in ("snapshot","update"):
                raise ValueError("Unknown action")
            ts=int(item["ts"])
            if not START_MS<=ts<END_MS:
                raise ValueError("Timestamp outside 15 October 2026 UTC")
            if prior_time is not None and ts<prior_time:
                raise ValueError("Timestamps reversed")
            snapshot=action=="snapshot"
            delta_a=levels(item.get("asks"),"asks",not snapshot)
            delta_b=levels(item.get("bids"),"bids",not snapshot)
            if first_keys is None:
                first_keys=sorted(item.keys())
            seq=int(item["seqId"]) if str(item.get("seqId","")).strip() else None
            prev=int(item["prevSeqId"]) if str(item.get("prevSeqId","")).strip() else None
            if snapshot:
                asks,bids=delta_a.copy(),delta_b.copy()
                started=True
                n_ask,n_bid=len(delta_a),len(delta_b)
                del_ask=del_bid=0
            else:
                if not started:
                    raise ValueError("Delta before snapshot")
                if prior_seq is not None and prev is not None:
                    if prev!=prior_seq:
                        raise ValueError("Sequence gap: prevSeqId mismatch")
                    sequence_pairs+=1
                else:
                    unsequenced_updates+=1
                n_ask,del_ask=apply(asks,delta_a)
                n_bid,del_bid=apply(bids,delta_b)
            if not asks or not bids:
                raise ValueError("Empty reconstructed book")
            ask=min(asks)
            bid=max(bids)
            if bid>=ask:
                raise ValueError("Crossed or locked reconstructed book")
            mid=(bid+ask)/2
            spread=(ask-bid)/mid*Decimal(10000)
            events.append({
                "event":idx+1,"ts_unix_ms":ts,"action":action,
                "line_sha256":sha(line),
                "asks_in_event":len(delta_a),"bids_in_event":len(delta_b),
                "ask_updates":n_ask,"bid_updates":n_bid,
                "ask_deletions":del_ask,"bid_deletions":del_bid,
                "asks_active":len(asks),"bids_active":len(bids),
                "best_ask":str(ask),"best_bid":str(bid),
                "spread_bps":round(float(spread),8),
                "seqId":seq,"prevSeqId":prev,
                "checksum":str(item["checksum"]) if "checksum" in item else None
            })
            actions[action]+=1
            prior_time=ts
            prior_seq=seq
        except Exception as e:
            return {"status":"invalid_event","events_count":len(events),
                    "failed_event":idx+1,"error_type":type(e).__name__,
                    "error":str(e)[:240],"first_event_keys":first_keys,
                    "events":events,"continuity":"invalid"}
    status=("snapshot_only" if actions["update"]==0 else
            "valid_local_updates_without_sequence_proof" if unsequenced_updates else
            "valid_local_updates_with_sequence_links")
    return {"status":status,"events_count":len(events),
            "actions":actions,"first_event_keys":first_keys,
            "sequence_pairs_checked":sequence_pairs,
            "unsequenced_updates":unsequenced_updates,
            "full_day_continuity_proven":False,
            "continuity":"prefix_only",
            "events":events}

def run(out):
    requested=stamp()
    try:
        req=Request(URL,headers={"Range":f"bytes=0-{COMPRESSED_MAX-1}",
            "Accept":"application/octet-stream",
            "User-Agent":"Seven-Heaven-L2-BTC-ReadOnly/1.0"})
        with urlopen(req,timeout=35) as reply:
            http_status=int(reply.status)
            info,raw=extract_prefix(reply)
        lines,cut=complete_lines(raw)
        analysis=inspect_events(lines)
        detail={"status":analysis["status"],"url":URL,
                "http_status":http_status,"requested_at_utc":requested,
                "completed_at_utc":stamp(),
                "http_range_may_have_been_ignored":http_status==200,
                "range_requested":f"bytes=0-{COMPRESSED_MAX-1}",
                "bounds":info,"complete_json_lines_examined":len(lines),
                "trailing_partial_line_bytes_dropped":cut,
                "analysis":analysis}
    except Exception as e:
        detail={"status":"unavailable","url":URL,
                "requested_at_utc":requested,"completed_at_utc":stamp(),
                "error_type":type(e).__name__,"error":str(e)[:240]}
    proof={
        "schema":"seven-heaven.okx-l2-btc-usdc-bounded-complete-events.v1",
        "date":"2026-11-12","read_only":True,"orders_enabled":False,
        "full_archive_downloaded":False,
        "max_compressed_bytes":COMPRESSED_MAX,
        "max_decompressed_bytes":DECOMPRESSED_MAX,
        "max_complete_events":MAX_EVENTS,"source":detail,
        "limitations":[
            "Prefix cannot establish continuity or validity for the full 457MB day.",
            "Missing seqId or prevSeqId means no sequence continuity proof.",
            "Only best bid/ask locally reconstructed; no historic cost distribution.",
            "SHA-256 prefix is NOT a whole archive digest.",
            "No market orders, no trading and no EMA strategy changes."
        ]}
    (out/"SEVEN_HEAVEN_OKX_L2_BTC_COMPLETE_EVENT_PREFIX_PROOFS.json").write_text(
        json.dumps(proof,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    analysis=detail.get("analysis",{})
    report=[
        "# Seven Heaven — BTC/USDC L2 : événements complets, préfixe borné",
        "",
        "**Recherche publique, lecture limitée ; aucun ordre réel.**",
        "",
        "Statut : "+detail["status"],
        "Événements JSON complets : "+str(analysis.get("events_count","indisponible")),
        "Type de continuité : "+str(analysis.get("continuity","non démontrée")),
        "",
        "Les clés, actions, séries best bid/ask et différences sont dans les preuves JSON.",
        "Aucun hash de préfixe n'est un hash d'archive complète.",
        "La reconstruction ne couvre pas la journée complète ni les coûts historiques EMA.",""]
    (out/"SEVEN_HEAVEN_OKX_L2_BTC_COMPLETE_EVENT_PREFIX_REPORT.md").write_text(
        "\n".join(report),encoding="utf-8")
    return proof

def selftest():
    snap={"instId":"BTC-USDC","action":"snapshot","ts":str(START_MS+10),
          "asks":[["100.1","1","1"],["100.2","2","1"]],
          "bids":[["100","3","1"],["99.9","2","1"]]}
    delta={"instId":"BTC-USDC","action":"update","ts":str(START_MS+20),
          "asks":[["100.1","0","0"],["100.15","2","1"]],
          "bids":[["100","4","1"]]}
    data=(json.dumps(snap)+"\n"+json.dumps(delta)+"\n"+'{"truncated":').encode()
    parsed,cut=complete_lines(data)
    assert len(parsed)==2 and cut>0
    test=inspect_events(parsed)
    assert test["events_count"]==2 and test["actions"]["update"]==1
    assert test["events"][1]["best_ask"]=="100.15"
    assert test["events"][1]["ask_deletions"]==1
    assert test["status"]=="valid_local_updates_without_sequence_proof"
    raw=io.BytesIO()
    with tarfile.open(fileobj=raw,mode="w:gz") as tar:
        x=tarfile.TarInfo(MEMBER)
        x.size=len(data)
        tar.addfile(x,io.BytesIO(data))
    meta,unpacked=extract_prefix(io.BytesIO(raw.getvalue()))
    assert unpacked==data and meta["compressed_prefix_bytes_read"]<=COMPRESSED_MAX
    a=dict(snap,seqId="1",prevSeqId="-1")
    b=dict(delta,seqId="7",prevSeqId="3")
    invalid=inspect_events([json.dumps(a).encode(),json.dumps(b).encode()])
    assert invalid["status"]=="invalid_event" and "Sequence" in invalid["error"]
    print("PASS: bounded tar.gz, full NDJSON lines, snapshot and delta removals, sequence gap rejection")

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--repo-root",type=Path,default=Path("."))
    ap.add_argument("--output",type=Path)
    ap.add_argument("--selftest",action="store_true")
    args=ap.parse_args()
    if args.selftest:
        selftest()
        return
    dest=args.output or args.repo_root/OUTPUT
    dest.mkdir(parents=True,exist_ok=True)
    doc=run(dest)
    result=doc["source"].get("analysis",{})
    print(json.dumps({"status":doc["source"]["status"],
        "events":result.get("events_count"),
        "actions":result.get("actions"),
        "first_keys":result.get("first_event_keys"),
        "linked_sequences":result.get("sequence_pairs_checked")},indent=2))

if __name__=="__main__":
    main()
