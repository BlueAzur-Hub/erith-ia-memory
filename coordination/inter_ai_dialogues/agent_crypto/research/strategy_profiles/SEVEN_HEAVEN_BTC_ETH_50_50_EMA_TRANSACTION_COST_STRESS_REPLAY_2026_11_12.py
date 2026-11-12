#!/usr/bin/env python3
"""Seven Heaven BTC/ETH 50/50 EMA10/30 fee+slippage sensitivity, PAPER only.

Reuses exact frozen native-Bitstamp EMA engine. No network, API credentials or orders.
Run from repository root (Python 3.10+):
 python coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_BTC_ETH_50_50_EMA_TRANSACTION_COST_STRESS_REPLAY_2026_11_12.py
 python ...py --selftest
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import importlib.util
import io
import json
from pathlib import Path

ROOT = Path("coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles")
BTC_FILE = ROOT/"native_bitstamp_btc_eth_2024_2026_evidence/bitstamp_btcusd_daily_2023_2026.csv"
ETH_FILE = ROOT/"native_bitstamp_eth_2024_2026_evidence/bitstamp_ethusd_daily_2023_2026.csv"
PROOF_FILE = ROOT/"native_bitstamp_btc_eth_2024_2026_evidence/bitstamp_btc_eth_50_50_proofs.json"
FROZEN_EVIDENCE = ROOT/"SEVEN_HEAVEN_BTC_ETH_50_50_EMA_TRANSACTION_COST_STRESS_EVIDENCE_2026_11_12.json"
ENGINE_FILE = ROOT/"SEVEN_HEAVEN_ETH_BITSTAMP_NATIVE_REPLAY_2026_11_12.py"
OUTPUT_DIR = ROOT/"transaction_cost_stress_evidence"
SOURCES = {
    "BTC": ("e770ca75bcdb4821e0c1e86a0b47e5478e5c8fba",
            "89a85a2f419244b3140f0518fb731f37c06abc3b73734433eb3fbf4642907dbb"),
    "ETH": ("49e8f3e8f89fdc2929d2e37d1cc5e4904813621e",
            "881227ba20481322b6829c19d97b799d11a73ae155be8868cf5ec943039c6b49"),
    "ORIGINAL": ("ab15dc23da2e5b8adc5e72ea0eef893b79b79aeb", None)
}
FACTORS = (0,1,2,3,4,6,8,10)


def git_sha1(data: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()


def check_source(path:Path, sha1:str, sha256:str|None=None) -> bytes:
    raw=path.read_bytes()
    if git_sha1(raw)!=sha1:
        raise ValueError(f"Unexpected Git blob for {path}")
    if sha256 is not None and hashlib.sha256(raw).hexdigest()!=sha256:
        raise ValueError(f"Unexpected SHA-256 for {path}")
    return raw


def get_engine(path:Path):
    spec=importlib.util.spec_from_file_location("seven_eth_replay_source",path)
    if spec is None or spec.loader is None:
        raise ValueError("Engine missing")
    mod=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def load_ohlc(data:bytes, engine):
    rows=[]
    for r in csv.DictReader(io.StringIO(data.decode("utf-8-sig"))):
        rows.append({"date":r["date"], **{k:float(r[k]) for k in
                     ("open","high","low","close","volume")}})
    engine.validate_days(rows)
    engine.add_ema(rows)
    return rows


def portfolio(btc,eth,engine,method:str,factor:float):
    if method not in ("EMA","HOLD") or factor<0 or factor>10:
        raise ValueError("Out-of-protocol method or factor")
    left=engine.paper(btc,method,factor)
    right=engine.paper(eth,method,factor)
    if len(left["curve"]) != 1035 or len(right["curve"]) != 1035:
        raise ValueError("Unexpected replay row count")
    max_equity=1000.0
    mdd=0.0
    curve=[]
    for l,r in zip(left["curve"],right["curve"]):
        if l["date"]!=r["date"]:
            raise ValueError("BTC and ETH calendar mismatch")
        balance=(l["equity"]+r["equity"])/2
        max_equity=max(max_equity,balance)
        mdd=min(mdd,100*(balance/max_equity-1))
        curve.append((l["date"],balance,l["exposed"],r["exposed"]))
    return {
        "final":curve[-1][1],
        "return_pct":100*(curve[-1][1]/1000-1),
        "max_drawdown_pct":mdd,
        "trades":left["trades"]+right["trades"],
        "btc_exposed_days":left["exposed_days"],
        "eth_exposed_days":right["exposed_days"],
        "curve":curve,
    }


def render(btc,eth,engine,factor):
    ema=portfolio(btc,eth,engine,"EMA",factor)
    hold=portfolio(btc,eth,engine,"HOLD",factor)
    round6=lambda x:round(x,6)
    scenario={
        "factor":factor,
        "fee_per_side_pct":round6(0.1*factor),
        "slippage_per_side_pct":round6(0.05*factor),
        "hypothetical_total_cost_per_side_pct":round6(0.15*factor),
        "EMA":{"final_usd":round6(ema["final"]),"return_pct":round6(ema["return_pct"]),
               "max_drawdown_pct":round6(ema["max_drawdown_pct"]),"trades":ema["trades"]},
        "BUY_HOLD":{"final_usd":round6(hold["final"]),"return_pct":round6(hold["return_pct"]),
                    "max_drawdown_pct":round6(hold["max_drawdown_pct"]),"trades":hold["trades"]},
        "EMA_minus_HOLD_percentage_points":round6(ema["return_pct"]-hold["return_pct"]),
    }
    return scenario,ema,hold


def threshold(btc,eth,engine,target:str):
    def value(factor):
        a=portfolio(btc,eth,engine,"EMA",factor)["return_pct"]
        if target=="EMA_ZERO":
            return a
        if target=="EMA_VS_HOLD":
            return a-portfolio(btc,eth,engine,"HOLD",factor)["return_pct"]
        raise ValueError("Unknown threshold type")
    low,high=0.0,10.0
    first=value(low)
    last=value(high)
    if first*last>0:
        raise ValueError("Target does not cross within frozen range 0..10")
    for _ in range(40):
        middle=(low+high)/2
        if value(middle)*first>0:
            low=middle
            first=value(middle)
        else:
            high=middle
    factor=(low+high)/2
    return {"factor":round(factor,6),
            "fee_per_side_pct":round(0.1*factor,6),
            "slippage_per_side_pct":round(0.05*factor,6),
            "hypothetical_per_side_total_pct":round(0.15*factor,6)}


def match(n,expected,context,tol=0.000002):
    if abs(float(n)-float(expected))>tol:
        raise ValueError(f"Reproduction mismatch {context}: {n} vs {expected}")


def calculate(repo_root:Path):
    engine=get_engine(repo_root/ENGINE_FILE)
    btc=load_ohlc(check_source(repo_root/BTC_FILE,*SOURCES["BTC"]),engine)
    eth=load_ohlc(check_source(repo_root/ETH_FILE,*SOURCES["ETH"]),engine)
    ref=json.loads(check_source(repo_root/PROOF_FILE,*SOURCES["ORIGINAL"]))
    published=json.loads((repo_root/FROZEN_EVIDENCE).read_text(encoding="utf8"))
    if len(btc)!=1310 or len(eth)!=1310:
        raise ValueError("Wrong source coverage")
    if [b["date"] for b in btc]!=[e["date"] for e in eth]:
        raise ValueError("Not matching asset calendars")
    grid=[]
    baseline_curve=None
    first_signals=None
    for factor in FACTORS:
        scenario,ema,hold=render(btc,eth,engine,factor)
        grid.append(scenario)
        signals=[(r[0],r[2],r[3]) for r in ema["curve"]]
        if first_signals is None:
            first_signals=signals
        if signals!=first_signals or ema["trades"]!=122:
            raise ValueError("Cost changed fixed EMA signals or trade count")
        if factor==1:
            baseline_curve=ema["curve"]
            match(ema["return_pct"],ref["bitstamp"]["dual_ema"]["return_pct"],"EMA base %")
            match(ema["max_drawdown_pct"],ref["bitstamp"]["dual_ema"]["max_drawdown_pct"],"EMA base drawdown")
            match(hold["return_pct"],ref["bitstamp"]["dual_hold"]["return_pct"],"hold base %")
        if factor==2:
            match(ema["return_pct"],ref["bitstamp"]["dual_ema_cost2"]["return_pct"],"EMA 2x")
        old=next((r for r in published["scenario_grid"] if r["factor"]==factor),None)
        if old is None:
            raise ValueError("New factor not in frozen protocol")
        for field in ("final_usd","return_pct","max_drawdown_pct"):
            match(scenario["EMA"][field],old["EMA"][field],f"factor={factor} EMA {field}")
            match(scenario["BUY_HOLD"][field],old["BUY_HOLD"][field],
                  f"factor={factor} HOLD {field}")
    thresholds={
        "ema_zero_return":threshold(btc,eth,engine,"EMA_ZERO"),
        "ema_equals_buy_and_hold":threshold(btc,eth,engine,"EMA_VS_HOLD"),
    }
    for k,val in thresholds.items():
        match(val["factor"],published["descriptive_thresholds"][k]["factor"],
              "Threshold "+k,tol=0.000004)
    by_year={}
    for year in ("2024","2025","2026"):
        positions=[i for i,p in enumerate(baseline_curve) if p[0][:4]==year]
        first=positions[0]
        previous=baseline_curve[first-1][1] if first else 1000
        final=baseline_curve[positions[-1]][1]
        by_year[year]=round(100*(final/previous-1),6)
        match(by_year[year],published["continuous_calendar_year_subreturns"][year]
              ["return_continuous_ema_pct"],"year "+year)
    return {
        "schema":"seven-heaven.btc-eth-50-50-cost-stress-python-validation.v1",
        "status":"REPRODUCED_ON_PUBLISHED_PINNED_CSVS",
        "read_only":True,"orders_enabled":False,
        "input_git_blob_sha1":{key:SOURCES[key][0] for key in SOURCES},
        "full_calendar_days":1310,"warmup_days":275,"paper_days":1035,
        "fixed_ema_trades":122,
        "verified_grid_scenarios":len(grid),
        "all_replayed_figures_match_previously_published_evidence":True,
        "scenario_grid":grid,
        "thresholds":thresholds,
        "year_continuous_ema_return_pct":by_year,
        "limits":["Same historical years already studied, not a prospective trial.",
                  "Grid does not represent real historical Bitstamp or OKX fees.",
                  "No orderbook or actual fill evidence.",
                  "No changes to EMA10/EMA30 or chronological decision rules."]}


def self_test():
    assert git_sha1(b"hello")=="b6fc4c620b67d95f953a5c1c1230aaab5db5a1b0"
    assert 0.1*3==0.30000000000000004 or abs(0.1*3-0.3)<1e-10
    class Dummy:
        @staticmethod
        def paper(d,method,factor):
            n=1035
            return {"curve":[{"date":str(i),"equity":1000.0,
                              "exposed":0} for i in range(n)],
                    "trades":0,"exposed_days":0}
    a=portfolio([],[],Dummy,"EMA",1)
    assert a["trades"]==0 and len(a["curve"])==1035 and a["return_pct"]==0
    print("PASS: checksum and nonrebalancing sleeve aggregation on synthetic data")


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--repo-root",type=Path,default=Path("."))
    p.add_argument("--output",type=Path,help="write results in existing or new directory")
    p.add_argument("--selftest",action="store_true")
    args=p.parse_args()
    if args.selftest:
        self_test()
        return
    evidence=calculate(args.repo_root)
    target=args.output or args.repo_root/OUTPUT_DIR
    target.mkdir(parents=True,exist_ok=True)
    (target/"SEVEN_HEAVEN_BTC_ETH_50_50_COST_STRESS_PYTHON_VERIFICATION.json").write_text(
        json.dumps(evidence,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    with (target/"SEVEN_HEAVEN_BTC_ETH_50_50_COST_STRESS_GRID.csv").open(
          "w",newline="",encoding="utf8") as f:
        fields=("factor","fee_per_side_pct","slippage_per_side_pct",
                "hypothetical_total_cost_per_side_pct","ema_return_pct",
                "hold_return_pct","ema_minus_hold_pp","ema_mdd_pct",
                "hold_mdd_pct","ema_trades")
        w=csv.DictWriter(f,fieldnames=fields,lineterminator="\n")
        w.writeheader()
        for row in evidence["scenario_grid"]:
            w.writerow({"factor":row["factor"],
                "fee_per_side_pct":row["fee_per_side_pct"],
                "slippage_per_side_pct":row["slippage_per_side_pct"],
                "hypothetical_total_cost_per_side_pct":
                    row["hypothetical_total_cost_per_side_pct"],
                "ema_return_pct":row["EMA"]["return_pct"],
                "hold_return_pct":row["BUY_HOLD"]["return_pct"],
                "ema_minus_hold_pp":row["EMA_minus_HOLD_percentage_points"],
                "ema_mdd_pct":row["EMA"]["max_drawdown_pct"],
                "hold_mdd_pct":row["BUY_HOLD"]["max_drawdown_pct"],
                "ema_trades":row["EMA"]["trades"]})
    print(json.dumps({
        "status":evidence["status"],"scenario_count":len(evidence["scenario_grid"]),
        "thresholds":evidence["thresholds"],
        "reference_ret":next(x for x in evidence["scenario_grid"] if x["factor"]==1)["EMA"]["return_pct"],
        "trades":evidence["fixed_ema_trades"],
        "outdir":str(target)},ensure_ascii=False,indent=2))


if __name__=="__main__":
    main()
