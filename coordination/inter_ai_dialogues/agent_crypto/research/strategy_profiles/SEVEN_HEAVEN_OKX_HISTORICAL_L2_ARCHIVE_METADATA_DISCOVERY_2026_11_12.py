#!/usr/bin/env python3
"""Read-only probe for OFFICIAL OKX historical Spot L2 400-level archive metadata.

Never downloads L2 ZIP files; never uses credentials; never places orders.
One selected historical day: 2026-10-15 UTC, BTC-USDC and ETH-USDC.
"""
from __future__ import annotations
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlsplit, urlunsplit
from urllib.request import Request, urlopen

BASE=Path("coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles")
DEST=BASE/"okx_historical_l2_archive_discovery_2026_11_12_evidence"
PAIRS=("BTC-USDC","ETH-USDC")
DOMAINS=("https://www.okx.com","https://eea.okx.com")
ENDPOINT="/api/v5/public/market-data-history"
BEGIN=1792022400000
END=1792108799000
QUERY={"module":"4","instType":"SPOT","dateAggrType":"daily",
       "begin":str(BEGIN),"end":str(END)}

def iso_now():
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00","Z")

def digest(data):
    return hashlib.sha256(data).hexdigest()

def safe_url(url):
    p=urlsplit(url)
    if p.scheme not in ("https","http"):
        return None
    return urlunsplit((p.scheme,p.netloc,p.path,"",""))

def summarize_data(payload):
    if not isinstance(payload,dict):
        raise ValueError("Expected JSON object")
    code=str(payload.get("code",""))
    data=payload.get("data")
    total=len(data) if isinstance(data,list) else None
    examples=[]
    recognized=[]
    def visit(value,trail="",depth=0):
        if depth>5 or len(examples)>60:
            return
        if isinstance(value,dict):
            for k,v in value.items():
                sub=(trail+"."+k).strip(".")
                if isinstance(v,(str,int,float,bool)):
                    sv=str(v)
                    if k.lower() in ("url","link","href","filehref","downloadurl","downloadlink") or (
                            isinstance(v,str) and (sv.startswith("https://") or sv.startswith("http://"))):
                        clean=safe_url(sv)
                        recognized.append({"key":sub,"public_path":clean})
                    elif any(key in k.lower() for key in (
                            "instid","module","date","filename","filesize","size","status","state",
                            "expire","type","count","file")) and len(sv)<=150:
                        examples.append({"key":sub,"value":sv})
                elif isinstance(v,(list,dict)):
                    visit(v,sub,depth+1)
        elif isinstance(value,list):
            for i,x in enumerate(value[:4]):
                visit(x,f"{trail}[{i}]",depth+1)
    visit(data)
    return {"api_code":code,"api_msg":str(payload.get("msg",""))[:200],
            "data_type":type(data).__name__,"data_entries":total,
            "data_keys_first_entry":sorted(data[0].keys()) if isinstance(data,list) and data and isinstance(data[0],dict) else [],
            "metadata_examples":examples[:40],"archive_links_without_query":recognized[:30],
            "archive_link_count_within_inspected_records":len(recognized),
            "archive_available_confirmed": bool(code=="0" and recognized),
            "interpretation":"API discovery only: listing entries do not certify an actual downloaded L2 archive"}

def probe(pair,out):
    if pair not in PAIRS:
        raise ValueError("Pair not allowed")
    q=dict(QUERY)
    q["instIdList"]=pair
    attempts=[]
    for origin in DOMAINS:
        url=origin+ENDPOINT+"?"+urlencode(q)
        start=iso_now()
        try:
            request=Request(url,headers={"Accept":"application/json",
                "User-Agent":"Seven-Heaven-Research-Historical-L2-Metadata-ReadOnly"})
            with urlopen(request,timeout=25) as response:
                body=response.read(500000)
                status=response.status
            received=iso_now()
            rawfile=f"okx_{pair.lower().replace('-','_')}_historical_l2_metadata_raw.json"
            (out/rawfile).write_bytes(body)
            obj=json.loads(body)
            summary=summarize_data(obj)
            return {"pair":pair,"status":("archive_link_listed" if summary["archive_available_confirmed"]
                                         else "metadata_only" if summary["api_code"]=="0"
                                         else "api_error"),
                    "attempts":attempts,
                    "response":{"http_status":status,"url_without_auth":url,"requested_at_utc":start,
                                "received_at_utc":received,"raw_file":rawfile,
                                "raw_sha256":digest(body),"response_bytes":len(body)},
                    "summary":summary}
        except (HTTPError,URLError,ValueError,TimeoutError,json.JSONDecodeError,OverflowError) as exc:
            attempts.append({"domain":origin,"at_utc":start,"error_type":type(exc).__name__,
                             "http_code":exc.code if isinstance(exc,HTTPError) else None,
                             "error":str(exc)[:250]})
            # Retry on EEA public domain after any failure, not silently.
    return {"pair":pair,"status":"unavailable","attempts":attempts}

def selftest():
    a={"code":"0","msg":"","data":[{"instId":"BTC-USDC","fileHref":"https://static.okx.com/a.zip?signature=secret",
                                      "dataDate":"2026-10-15"}]}
    b=summarize_data(a)
    assert b["archive_available_confirmed"] and b["data_entries"]==1
    assert b["archive_links_without_query"][0]["public_path"]=="https://static.okx.com/a.zip"
    c=summarize_data({"code":"0","data":[]})
    assert not c["archive_available_confirmed"] and c["data_entries"]==0
    try:
        probe("BTC-USDT",Path("."))
    except ValueError: pass
    else: raise AssertionError("wrong pair accepted")
    print("PASS: one-day query, link sanitization, empty result, pair allowlist")

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--repo-root",type=Path,default=Path("."))
    ap.add_argument("--output",type=Path)
    ap.add_argument("--selftest",action="store_true")
    args=ap.parse_args()
    if args.selftest:
        selftest()
        return
    output=args.output or args.repo_root/DEST
    output.mkdir(parents=True,exist_ok=True)
    results=[probe(pair,output) for pair in PAIRS]
    state=("links_listed" if any(x["status"]=="archive_link_listed" for x in results)
           else "metadata_only" if any(x["status"]=="metadata_only" for x in results)
           else "unavailable")
    evidence={
        "schema":"seven-heaven.okx-historical-l2-archive-discovery.v1",
        "status":state,"generated_at_utc":iso_now(),
        "read_only":True,"orders_enabled":False,
        "archive_downloads_performed":False,"l2_market_depth_analysed":False,
        "query":{**QUERY,"day":"2026-10-15","instIdList":list(PAIRS)},
        "results":results,
        "limits":["Only metadata; no ZIP or tick-level L2 data downloaded.",
                  "An archive endpoint may list temporary links; actual file accessibility unverified.",
                  "The venue advertises archives since March 2023, not each Spot USDC pair.",
                  "Two intraday books are not representative time-series data.",
                  "No prospective strategy validation or execution cost history obtained."]}
    (output/"SEVEN_HEAVEN_OKX_HISTORICAL_L2_DISCOVERY_EVIDENCE.json").write_text(
        json.dumps(evidence,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    report=["# Seven Heaven — Vérification de disponibilité des archives L2 OKX", "",
        "**Requête publique, métadonnées uniquement ; aucun téléchargement des archives.**",
        "","Journée UTC contrôlée : 15 octobre 2026 ; module=4 (400 niveaux) ; Spot USDC.","",
        "| Paire | Statut métadonnées | Nombre d'entrées listées | Liens vus (échantillon) |",
        "|---|---|---:|---:|"]
    for r in results:
        s=r.get("summary",{})
        report.append(f"| {r['pair']} | {r['status']} | {s.get('data_entries','—')} | "
                      f"{s.get('archive_link_count_within_inspected_records',0)} |")
    report.extend(["","## Limites","",
       "Un lien listé peut expirer ; une réponse API positive ne prouve pas que les ZIP ont",
       "été ouverts, leurs formats validés ou leurs séquences L2 reconstruites.",
       "Les réponses brutes SHA-256 et les erreurs détaillées sont dans les preuves.",
       "Cette étude n'ajoute aucune donnée de carnet historique au replay EMA.",
       "Aucune opération réelle ni surveillance périodique.",""])
    (output/"SEVEN_HEAVEN_OKX_HISTORICAL_L2_DISCOVERY_REPORT.md").write_text(
        "\n".join(report),encoding="utf8")
    print(json.dumps({"status":state,"results":[{"pair":r["pair"],"status":r["status"],
       "entries":r.get("summary",{}).get("data_entries")} for r in results]},indent=2))

if __name__=="__main__":
    main()
