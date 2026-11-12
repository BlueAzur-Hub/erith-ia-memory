#!/usr/bin/env python3
"""Seven Heaven native Bitstamp Spot BTC/USD + ETH/USD equal-date 50/50 PAPER replay.

Historical research only. Uses the existing audited Bitstamp public OHLC collector
for BTC, an immutable already-published Bitstamp ETH CSV, and a pinned Binance
reference. Never accesses an account or places any orders.

From the repository root:
python coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_BTC_ETH_50_50_NATIVE_BITSTAMP_VS_BINANCE_REPLAY_2026_11_12.py
python ...py --selftest
"""
from __future__ import annotations

import argparse
import csv
from datetime import date, timedelta
import hashlib
import importlib.util
import io
import json
from pathlib import Path

BASE = Path("coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles")
ENGINE_FILE = BASE / "SEVEN_HEAVEN_ETH_BITSTAMP_NATIVE_REPLAY_2026_11_12.py"
ETH_SOURCE = BASE / "native_bitstamp_eth_2024_2026_evidence/bitstamp_ethusd_daily_2023_2026.csv"
ETH_SHA256 = "881227ba20481322b6829c19d97b799d11a73ae155be8868cf5ec943039c6b49"
ETH_BLOB = "49e8f3e8f89fdc2929d2e37d1cc5e4904813621e"
BINANCE_SOURCE = BASE / "SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_REPLAY_2026_11_12_EQUITY_DAILY.csv"
BINANCE_BLOB = "c8ed2a206ea616ea87eeb83e31f7138d5b131588"
PROOFS_SOURCE = BASE / "SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_REPLAY_2026_11_12_PROOFS.json"
PROOFS_BLOB = "43aba5f666df19c9369a58866165c5684b77ecba"
OUT_DIR = BASE / "native_bitstamp_btc_eth_2024_2026_evidence"
BITSTAMP_BTC_API = "https://www.bitstamp.net/api/v2/ohlc/btcusd/"
PROTO = "a62234ee956601fc9567813a8009928d0a2ade96"


def engine_from(path: Path):
    spec = importlib.util.spec_from_file_location("seven_native_ohlc", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("Cannot load audited Bitstamp reader")
    engine = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(engine)
    return engine


def source_checked(path: Path, blob: str, sha256: str | None = None) -> bytes:
    raw = path.read_bytes()
    got = hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest()
    if got != blob:
        raise ValueError(f"Git blob changed for {path}: {got} != {blob}")
    if sha256 is not None and hashlib.sha256(raw).hexdigest() != sha256:
        raise ValueError(f"SHA-256 changed for {path}")
    return raw


def parse_native_csv(raw: bytes, eth_engine) -> list[dict]:
    rows = []
    for record in csv.DictReader(io.StringIO(raw.decode("utf-8-sig"))):
        rows.append({
            "date": record["date"], "open": float(record["open"]),
            "high": float(record["high"]), "low": float(record["low"]),
            "close": float(record["close"]), "volume": float(record["volume"])})
    eth_engine.validate_days(rows)
    return rows


def write_csv(path: Path, fields: list[str], rows: list[dict]):
    with path.open("w", newline="", encoding="utf-8") as fp:
        w = csv.DictWriter(fp, fieldnames=fields, lineterminator="\n")
        w.writeheader()
        w.writerows(rows)


def max_drawdown(series: list[float]) -> float:
    peak = 1000.0
    low = 0.0
    for equity in series:
        peak = max(peak, equity)
        low = min(low, 100*(equity/peak-1))
    return low


def avg(x):
    return sum(x)/len(x)


def sd(x):
    mean = avg(x)
    return (sum((v-mean)**2 for v in x)/len(x))**0.5


def corr(x,y):
    mx,my=avg(x),avg(y)
    return avg([(v-mx)*(w-my) for v,w in zip(x,y)])/(sd(x)*sd(y))


def r6(x):
    return round(float(x),6)


def combine(first: dict, second: dict) -> tuple[dict,list[dict]]:
    a,b=first["curve"],second["curve"]
    if len(a)!=1035 or len(b)!=1035:
        raise ValueError("Wrong count of combined daily equity")
    rows=[]
    for x,y in zip(a,b):
        if x["date"]!=y["date"]:
            raise ValueError("Mismatched pair dates")
        rows.append({"date":x["date"],"equity":(x["equity"]+y["equity"])/2,
                     "btc_exposed":x["exposed"],"eth_exposed":y["exposed"]})
    final=rows[-1]["equity"]
    stats={"final_usd":r6(final),
           "return_pct":r6(100*(final/1000-1)),
           "max_drawdown_pct":r6(max_drawdown([r["equity"] for r in rows])),
           "trades":first["trades"]+second["trades"],
           "days_both_cash":sum(not r["btc_exposed"] and not r["eth_exposed"] for r in rows),
           "days_both_exposed":sum(bool(r["btc_exposed"]) and bool(r["eth_exposed"]) for r in rows),
           "days_btc_only":sum(bool(r["btc_exposed"]) and not r["eth_exposed"] for r in rows),
           "days_eth_only":sum(not r["btc_exposed"] and bool(r["eth_exposed"]) for r in rows)}
    if sum(stats[k] for k in ("days_both_cash","days_both_exposed","days_btc_only","days_eth_only"))!=1035:
        raise ValueError("Portfolio exposure partition is not complete")
    return stats,rows


def summarize_one(x:dict) -> dict:
    return {k:r6(x[k]) if k in ("final_usd","return_pct","max_drawdown_pct") else x[k]
            for k in ("final_usd","return_pct","max_drawdown_pct","trades","exposed_days")}


def run(repo_root:Path, result_path:Path) -> dict:
    source_root=repo_root/BASE
    native=engine_from(repo_root/ENGINE_FILE)
    if native.API_URL != "https://www.bitstamp.net/api/v2/ohlc/ethusd/":
        raise ValueError("Underlying read-only collector source changed unexpectedly")
    native.API_URL = BITSTAMP_BTC_API

    eth_raw = source_checked(repo_root/ETH_SOURCE,ETH_BLOB,ETH_SHA256)
    btc_rows,btc_requests = native.collect()
    eth_rows = parse_native_csv(eth_raw,native)
    native.validate_days(btc_rows)
    assert len(btc_rows)==len(eth_rows)==1310
    assert [r["date"] for r in btc_rows]==[r["date"] for r in eth_rows]

    baseline_raw=source_checked(repo_root/BINANCE_SOURCE,BINANCE_BLOB)
    proof_raw=source_checked(repo_root/PROOFS_SOURCE,PROOFS_BLOB)
    benchmark=list(csv.DictReader(io.StringIO(baseline_raw.decode("utf-8"))))
    proofs=json.loads(proof_raw)
    if len(benchmark)!=1035 or benchmark[0]["date"]!="2024-01-01" or benchmark[-1]["date"]!="2026-10-31":
        raise ValueError("Binance benchmark incomplete")
    bin_ref=proofs["periods"]["2024_2026_CONTINUOUS"]
    native.add_ema(btc_rows)
    native.add_ema(eth_rows)
    btc_ema=native.paper(btc_rows,"EMA")
    eth_ema=native.paper(eth_rows,"EMA")
    btc_hold=native.paper(btc_rows,"HOLD")
    eth_hold=native.paper(eth_rows,"HOLD")
    btc_stress=native.paper(btc_rows,"EMA",2)
    eth_stress=native.paper(eth_rows,"EMA",2)
    btc_holdstress=native.paper(btc_rows,"HOLD",2)
    eth_holdstress=native.paper(eth_rows,"HOLD",2)
    for label,single in [("BTC",btc_ema),("ETH",eth_ema)]:
        if len(single["curve"])!=1035:
            raise ValueError(f"{label} strategy output not 1,035 days")
    dual_ema,mix_ema=combine(btc_ema,eth_ema)
    dual_hold,mix_hold=combine(btc_hold,eth_hold)
    dual_ema2,mix_ema2=combine(btc_stress,eth_stress)
    dual_hold2,mix_hold2=combine(btc_holdstress,eth_holdstress)
    discord={"BTC":[],"ETH":[]}
    daily=[]
    for i,(o,h,bo,eo,bs,es) in enumerate(zip(mix_ema,mix_hold,btc_ema["curve"],eth_ema["curve"],
                                                btc_hold["curve"],eth_hold["curve"])):
        ref=benchmark[i]
        if o["date"]!=ref["date"] or h["date"]!=ref["date"]:
            raise ValueError("Historical dates do not match")
        if abs(o["equity"]-(bo["equity"]+eo["equity"])/2)>1e-8:
            raise ValueError("Dual EMA sleeve identity failed")
        if int(ref["btc_exposed"])!=o["btc_exposed"]:
            discord["BTC"].append(o["date"])
        if int(ref["eth_exposed"])!=o["eth_exposed"]:
            discord["ETH"].append(o["date"])
        daily.append({"date":o["date"],"btc_ema":r6(bo["equity"]),"eth_ema":r6(eo["equity"]),
                      "dual_ema":r6(o["equity"]),"btc_hold":r6(bs["equity"]),
                      "eth_hold":r6(es["equity"]),"dual_hold":r6(h["equity"]),
                      "btc_exposed":o["btc_exposed"],"eth_exposed":o["eth_exposed"]})
    if len(daily)!=1035:
        raise ValueError("Test days wrong")
    close_btc=[r["close"] for r in btc_rows[275:]]
    close_eth=[r["close"] for r in eth_rows[275:]]
    rets_btc=[close_btc[i]/close_btc[i-1]-1 for i in range(1,1035)]
    rets_eth=[close_eth[i]/close_eth[i-1]-1 for i in range(1,1035)]
    joint=sum(a<0 and b<0 for a,b in zip(rets_btc,rets_eth))
    daily_mix_returns=[daily[i]["dual_ema"]/daily[i-1]["dual_ema"]-1 for i in range(1,1035)]
    daily_hold_returns=[daily[i]["dual_hold"]/daily[i-1]["dual_hold"]-1 for i in range(1,1035)]
    bin_mix_returns=[float(benchmark[i]["dual_ema"])/float(benchmark[i-1]["dual_ema"])-1 for i in range(1,1035)]
    stats={
       "schema":"seven-heaven.btc-eth-50-50-native-bitstamp-compare-v1",
       "research_date":"2026-11-12",
       "status":"NATIVE_BITSTAMP_BTC_ETH_PAPER_REPLAY_EXECUTED",
       "no_orders":True,
       "protocol_commit":PROTO,
       "sources":{
          "bitstamp_btc":{"api":BITSTAMP_BTC_API,"requests":btc_requests},
          "bitstamp_eth":{"relative_path":str(ETH_SOURCE),"git_blob_sha1":ETH_BLOB,
                          "sha256":ETH_SHA256},
          "binance_reference":{"relative_path":str(BINANCE_SOURCE),"git_blob_sha1":BINANCE_BLOB,
                               "proofs_git_blob_sha1":PROOFS_BLOB}},
       "coverage":{"start_warmup":"2023-04-01","start_test":"2024-01-01","end_test":"2026-10-31",
                   "days_per_asset":1310,"warmup_days":275,"test_days":1035,"daily_returns":1034},
       "assumptions":{"signal":"EMA10>EMA30 and close>EMA30 at prior UTC close",
                     "execution":"theoretical next UTC daily open",
                     "initial_capital_total":1000,
                     "weights":"two independent 500 USD sleeves, no rebalancing",
                     "fee_per_side":0.001,"slippage_per_side":0.0005,
                     "stress_cost_factor":2},
       "bitstamp":{
           "btc_ema":summarize_one(btc_ema),"eth_ema":summarize_one(eth_ema),
           "btc_hold":summarize_one(btc_hold),"eth_hold":summarize_one(eth_hold),
           "dual_ema":dual_ema,"dual_hold":dual_hold,"dual_ema_cost2":dual_ema2,
           "dual_hold_cost2":dual_hold2},
       "binance":{"dual_ema":bin_ref["cost1"]["DUAL_EMA_50_50"],
                  "dual_hold":bin_ref["cost1"]["DUAL_HOLD_50_50"],
                  "dual_ema_cost2":bin_ref["cost2"]["DUAL_EMA_50_50"],
                  "btc_ema":bin_ref["cost1"]["BTC_EMA"],
                  "eth_ema":bin_ref["cost1"]["ETH_EMA"]},
       "cross_source":{
           "btc_exposure_disagreement_dates":discord["BTC"],
           "eth_exposure_disagreement_dates":discord["ETH"],
           "joint_position_agreement_days":sum(
               (ref["btc_exposed"]==str(x["btc_exposed"]) and
                ref["eth_exposed"]==str(x["eth_exposed"]))
               for x,ref in zip(daily,benchmark)),
           "daily_portfolio_ema_return_correlation":r6(corr(daily_mix_returns,bin_mix_returns)),
           "ema_return_diff_bitstamp_minus_binance_pp":r6(
               dual_ema["return_pct"]-bin_ref["cost1"]["DUAL_EMA_50_50"]["return_pct"])},
       "risk":{
           "native_btc_eth_daily_pearson":r6(corr(rets_btc,rets_eth)),
           "joint_down_days":joint,
           "btc_down_days":sum(x<0 for x in rets_btc),
           "eth_down_days":sum(x<0 for x in rets_eth),
           "volatility_daily_pct":{
              "btc_hold":r6(sd(rets_btc)*100),
              "eth_hold":r6(sd(rets_eth)*100),
              "mixed_hold":r6(sd(daily_hold_returns)*100),
              "mixed_ema":r6(sd(daily_mix_returns)*100)}},
       "limits":["Same explored 2024-2026 BTC/ETH market regime; not new prospective holdout",
                 "Bitstamp USD vs Binance USDT are different quote assets",
                 "Theoretical next-open executions and synthetic fixed costs",
                 "Bitstamp public API payloads are not exchange-signed",
                 "Historical strategy signal concordance does not guarantee future profit"]
    }
    result_path.mkdir(parents=True,exist_ok=True)
    btc_csv=result_path/"bitstamp_btcusd_daily_2023_2026.csv"
    equity_csv=result_path/"bitstamp_btc_eth_50_50_daily_equity_2024_2026.csv"
    btc_fields=["date","open","high","low","close","volume"]
    write_csv(btc_csv,btc_fields,[{k:r[k] for k in btc_fields} for r in btc_rows])
    eq_fields=["date","btc_ema","eth_ema","dual_ema","btc_hold","eth_hold",
               "dual_hold","btc_exposed","eth_exposed"]
    write_csv(equity_csv,eq_fields,daily)
    stats["sources"]["bitstamp_btc"]["csv_sha256"]=hashlib.sha256(btc_csv.read_bytes()).hexdigest()
    stats["source_integrity"]={
       "bitstamp_btc_sha256":stats["sources"]["bitstamp_btc"]["csv_sha256"],
       "bitstamp_eth_sha256":ETH_SHA256,
       "combined_daily_equity_sha256":hashlib.sha256(equity_csv.read_bytes()).hexdigest(),
       "native_calendar_valid":True,"no_missing_days":True,
       "sleeves_reconciled":1035}
    (result_path/"bitstamp_btc_eth_50_50_proofs.json").write_text(
        json.dumps(stats,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    report=[
       "# Seven Heaven — BTC/ETH 50/50 : deux sources natives Bitstamp vs Binance",
       "",
       "**Rejeu PAPER rétrospectif sur 1 035 dates communes** du 2024-01-01 au 2026-10-31.",
       "EMA 10/30 figées, 275 jours de chauffe, deux poches indépendantes de 500 unités.",
       "",
       "| Portefeuille | Bitstamp USD | Binance USDT |",
       "|---|---:|---:|",
    ]
    def row(label, bs, bn):
        return f"| {label} | {bs:+.2f} % | {bn:+.2f} % |"
    report.extend([
       row("EMA 50/50 rendement",dual_ema["return_pct"],bin_ref["cost1"]["DUAL_EMA_50_50"]["return_pct"]),
       row("EMA 50/50 drawdown",dual_ema["max_drawdown_pct"],bin_ref["cost1"]["DUAL_EMA_50_50"]["max_drawdown_pct"]),
       row("EMA 50/50 coûts doublés",dual_ema2["return_pct"],bin_ref["cost2"]["DUAL_EMA_50_50"]["return_pct"]),
       row("Buy & Hold 50/50",dual_hold["return_pct"],bin_ref["cost1"]["DUAL_HOLD_50_50"]["return_pct"]),
       row("Buy & Hold 50/50 drawdown",dual_hold["max_drawdown_pct"],bin_ref["cost1"]["DUAL_HOLD_50_50"]["max_drawdown_pct"]),
       "",
       f"**Jours où BTC et ETH baissent ensemble : {joint}/1034.**",
       f"**Corrélation BTC/ETH des rendements quotidiens Bitstamp : {stats['risk']['native_btc_eth_daily_pearson']:.6f}.**",
       f"**Désaccords de positions : BTC {len(discord['BTC'])} ; ETH {len(discord['ETH'])} sur 1 035 dates.**",
       f"**Les deux poches en liquidités : {dual_ema['days_both_cash']} journées.**",
       "",
       "**Limites :** mêmes dates historiques explorées sur Binance, absence de validation temporelle indépendante,",
       "USD n'est pas USDT, frais / slippage théoriques, aucun ordre réel.",
       "Le manifeste JSON fournit les SHA, l'historique des requêtes de BTC Bitstamp, les métriques et les écarts.",
       ""
    ])
    (result_path/"SEVEN_HEAVEN_BTC_ETH_NATIVE_BITSTAMP_50_50_COMPARATIVE_REPORT.md").write_text(
        "\n".join(report),encoding="utf-8")
    return stats


def selftest():
    assert abs(max_drawdown([1000,1100,880])+20)<1e-10
    assert r6(corr([1,2,3],[2,4,6]))==1.0
    a={"curve":[{"date":"2024-01-01","equity":1000,"exposed":0}]*1035,"trades":0}
    x,rows=combine(a,a)
    assert len(rows)==1035 and x["return_pct"]==0 and x["days_both_cash"]==1035
    print("PASS: normalized sleeve arithmetic, drawdown and correlation")


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root",type=Path,default=Path("."))
    parser.add_argument("--output",type=Path)
    parser.add_argument("--selftest",action="store_true")
    args=parser.parse_args()
    if args.selftest:
        selftest()
        return
    result=run(args.repo_root,args.output or args.repo_root/OUT_DIR)
    print(json.dumps({"status":result["status"],"bitstamp_dual":result["bitstamp"]["dual_ema"],
                      "binance_dual":result["binance"]["dual_ema"],
                      "cross_source":result["cross_source"],"risk":result["risk"]},
                     indent=2,ensure_ascii=False))


if __name__ == "__main__":
    main()
