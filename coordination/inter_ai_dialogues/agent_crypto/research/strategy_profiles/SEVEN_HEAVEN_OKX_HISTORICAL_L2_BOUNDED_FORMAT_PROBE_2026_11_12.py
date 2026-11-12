#!/usr/bin/env python3
"""Read-only bounded inspection of official OKX historical L2 .tar.gz archives.

Reads no more than 2 MB compressed per file; samples no more than 16 KiB
of the first regular member. Does not download or validate the full archive.
No accounts, credentials, trade APIs or persistent watcher.
"""
from __future__ import annotations
import argparse
from datetime import datetime,timezone
import hashlib
import io
import json
from pathlib import Path
import tarfile
from urllib.request import Request,urlopen

ROOT=Path("coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles")
OUT=ROOT/"okx_historical_l2_format_probe_2026_11_12_evidence"
ALLOWED={
 "BTC-USDC":"https://static.okx.com/cdn/okx/match/orderbook/pro/L2/400lv/daily/20261015/BTC-USDC-L2orderbook-400lv-2026-10-15.tar.gz",
 "ETH-USDC":"https://static.okx.com/cdn/okx/match/orderbook/pro/L2/400lv/daily/20261015/ETH-USDC-L2orderbook-400lv-2026-10-15.tar.gz",
}
COMPRESSED_LIMIT=2_000_000
MEMBER_SAMPLE_LIMIT=16*1024

def now():
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00","Z")

class CountingLimitedReader:
    def __init__(self,inner,limit=COMPRESSED_LIMIT):
        self.inner=inner
        self.limit=limit
        self.amount=0
        self.hasher=hashlib.sha256()
    def read(self,n=-1):
        available=self.limit-self.amount
        if available<=0:
            return b""
        n=available if n is None or n<0 else min(available,n)
        chunk=self.inner.read(n)
        self.amount+=len(chunk)
        self.hasher.update(chunk)
        return chunk

def inspect_tar_prefix(source):
    bounded=CountingLimitedReader(source)
    out={"status":"unavailable","prefix_bytes_consumed":0,
         "prefix_sha256":None,"sample_is_not_full_file_verification":True}
    try:
        with tarfile.open(fileobj=bounded,mode="r|gz") as archive:
            names=[]
            for item in archive:
                names.append({"name":item.name[:250],"size_uncompressed_bytes":item.size,
                              "regular_file":item.isfile()})
                if not item.isfile():
                    if len(names)>=5:
                        break
                    continue
                stream=archive.extractfile(item)
                if stream is None:
                    continue
                raw=stream.read(MEMBER_SAMPLE_LIMIT)
                text=raw.decode("utf-8",errors="replace")
                out.update({"status":"first_member_sampled",
                            "tar_member_names_first":names,
                            "first_regular_member":item.name[:250],
                            "member_reported_uncompressed_bytes":item.size,
                            "sample_bytes":len(raw),
                            "sample_prefix_sha256":hashlib.sha256(raw).hexdigest(),
                            "first_five_text_lines":[line[:350] for line in text.splitlines()[:5]],
                            "utf8_replacement_in_sample":"\ufffd" in text,
                            "sampling_incomplete":True})
                break
            if not names:
                out["reason"]="No readable tar members in bounded prefix"
    except (tarfile.TarError,EOFError,OSError,ValueError) as exc:
        out["error_type"]=type(exc).__name__
        out["error_message"]=str(exc)[:250]
    out["prefix_bytes_consumed"]=bounded.amount
    out["prefix_sha256"]=bounded.hasher.hexdigest()
    if out["prefix_bytes_consumed"]>COMPRESSED_LIMIT or out.get("sample_bytes",0)>MEMBER_SAMPLE_LIMIT:
        raise ValueError("Safety bound exceeded")
    return out

def inspect_one(pair):
    if pair not in ALLOWED:
        raise ValueError("Unexpected pair")
    url=ALLOWED[pair]
    req=Request(url,headers={
        "User-Agent":"Seven-Heaven-PAPER-L2-Bounded-Format-Probe/1.0",
        "Accept":"application/octet-stream",
        "Range":f"bytes=0-{COMPRESSED_LIMIT-1}"})
    received=now()
    try:
        with urlopen(req,timeout=35) as res:
            httpstatus=int(res.status)
            reported_size=res.headers.get("Content-Length")
            result=inspect_tar_prefix(res)
        result.update({"pair":pair,"url":url,"http_status":httpstatus,
                       "http_content_length_reported":reported_size,
                       "requested_at_utc":received,"completed_at_utc":now(),
                       "range_request_bytes":f"0-{COMPRESSED_LIMIT-1}",
                       "range_header_may_be_ignored":httpstatus==200})
    except Exception as exc:
        result={"pair":pair,"url":url,"status":"unavailable",
                "requested_at_utc":received,"completed_at_utc":now(),
                "error_type":type(exc).__name__,"error_message":str(exc)[:300]}
    return result

def selftest():
    raw=io.BytesIO()
    data=(b"ts,ask,bid\n"+b"1792022400000,100.2,100.1\n")
    with tarfile.open(fileobj=raw,mode="w:gz") as f:
        item=tarfile.TarInfo("test.csv")
        item.size=len(data)
        f.addfile(item,io.BytesIO(data))
    sample=inspect_tar_prefix(io.BytesIO(raw.getvalue()))
    assert sample["status"]=="first_member_sampled"
    assert sample["first_regular_member"]=="test.csv"
    assert sample["first_five_text_lines"][0]=="ts,ask,bid"
    assert sample["sample_bytes"]==len(data)
    assert sample["prefix_bytes_consumed"]<=COMPRESSED_LIMIT
    print("PASS: bounded compressed tar inspection and no full-archive claim")

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--repo-root",type=Path,default=Path("."))
    parser.add_argument("--output",type=Path)
    parser.add_argument("--selftest",action="store_true")
    args=parser.parse_args()
    if args.selftest:
        selftest()
        return
    out=args.output or args.repo_root/OUT
    out.mkdir(parents=True,exist_ok=True)
    records=[inspect_one(p) for p in ALLOWED]
    doc={"schema":"seven-heaven.okx-official-l2-bounded-archive-format-probe.v1",
         "date":"2026-11-12","status":"partial_prefix_probe",
         "max_compressed_read_bytes_per_pair":COMPRESSED_LIMIT,
         "max_uncompressed_sample_bytes":MEMBER_SAMPLE_LIMIT,
         "full_archive_downloaded":False,"read_only":True,"orders_enabled":False,
         "records":records,
         "limits":["First regular tar member only; content may not cover full day.",
                   "A hash of compressed PREFIX is NOT a hash of complete archive.",
                   "No full CSV integrity, complete candle, book reconstruction or statistical spread validation.",
                   "Downloaded bytes were bounded; sources remain external on OKX CDN."]}
    (out/"SEVEN_HEAVEN_OKX_HISTORICAL_L2_ARCHIVE_FORMAT_EVIDENCE.json").write_text(
        json.dumps(doc,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    report=["# Seven Heaven — Format des archives L2 OKX : sondage borné",
            "",
            "**Inspection des préfixes seulement, jamais d'archive intégrale.**",
            "",
            "| Paire | Statut | Premier membre | Octets compressés consommés |",
            "|---|---|---|---:|"]
    for row in records:
        report.append(f"| {row['pair']} | {row['status']} | "
                      f"{row.get('first_regular_member','—')} | {row.get('prefix_bytes_consumed','—')} |")
    report.extend(["","Les cinq premières lignes de chaque premier fichier, si disponibles, sont",
                   "dans la preuve JSON. Aucune analyse temporelle ni coût historique n'a",
                   "été calculé ; les archives de dizaines de Mo restent sur le CDN officiel.",
                   ""])
    (out/"SEVEN_HEAVEN_OKX_HISTORICAL_L2_ARCHIVE_FORMAT_REPORT.md").write_text(
        "\n".join(report),encoding="utf8")
    print(json.dumps({"records":[{"pair":r["pair"],"status":r["status"],
                                  "member":r.get("first_regular_member"),
                                  "prefix_bytes":r.get("prefix_bytes_consumed")}
                                 for r in records]},indent=2))

if __name__=="__main__":
    main()
