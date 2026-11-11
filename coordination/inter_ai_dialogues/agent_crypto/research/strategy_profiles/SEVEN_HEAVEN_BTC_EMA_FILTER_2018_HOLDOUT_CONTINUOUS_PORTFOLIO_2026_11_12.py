#!/usr/bin/env python3
"""Reproducible Seven Heaven EMA10/30 2018 holdout / continuous BTC or cash PAPER audit.

Usage: python SEVEN_HEAVEN_BTC_EMA_FILTER_2018_HOLDOUT_CONTINUOUS_PORTFOLIO_2026_11_12.py \
  --source path/to/public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/bitcoin-Max.json.gz \
  --outdir /tmp/seven-ema-audit

No network access, no account keys, no orders and no modification of the source archive.
"""
import argparse, csv, gzip, hashlib, json, math
from datetime import datetime, timezone
from pathlib import Path

SOURCE_SHA = "812acb4a087cc43163760a6b397506bb7cb4bbcf8eca692fc686ef9f618b8bfd"
PROTOCOL_COMMIT = "3f831c1fabecb7fd9b5c0c57a2fddfc50d22cdff"
STEM = "SEVEN_HEAVEN_BTC_EMA_FILTER_2018_HOLDOUT_CONTINUOUS_PORTFOLIO_2026_11_12"
ONE_DAY_MS = 86_400_000

def load_source(path):
    raw = Path(path).read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    assert digest == SOURCE_SHA, (digest, SOURCE_SHA)
    obj = json.loads(gzip.decompress(raw))
    assert obj["pair"] == "BTCUSDT" and obj["interval"] == "1d"
    assert obj["columns"] == ["open_time_ms", "open", "high", "low", "close", "base_volume", "quote_volume", "trade_count"]
    rows = obj["rows"]
    assert len(rows) == 3075 and len(rows[0]) == 8
    assert datetime.fromtimestamp(rows[0][0] / 1000, timezone.utc).date().isoformat() == "2018-05-01"
    assert datetime.fromtimestamp(rows[-1][0] / 1000, timezone.utc).date().isoformat() == "2026-09-30"
    for prev, cur in zip(rows, rows[1:]):
        assert cur[0] - prev[0] == ONE_DAY_MS
        assert min(cur[1:5]) > 0 and cur[2] >= max(cur[1],cur[4]) and cur[3] <= min(cur[1],cur[4])
    return rows, digest

def daily_ema(values, length):
    out = []; v = None; alpha = 2 / (length + 1)
    for x in values:
        v = x if v is None else alpha*x + (1-alpha)*v
        out.append(v)
    return out

def indicators(rows):
    closes = [r[4] for r in rows]
    e10 = daily_ema(closes,10)
    e30 = daily_ema(closes,30)
    bull = [int(x>y and close>y) for x,y,close in zip(e10,e30,closes)]
    assert all(indicators_prefix(rows[:i])[0][-1] == bull[i-1] for i in [31,37,45,59,100,215,300,700,1000,1341] if i<=len(rows))
    return e10,e30,bull

def indicators_prefix(rows):
    closes=[r[4] for r in rows]
    a=daily_ema(closes,10); b=daily_ema(closes,30)
    return [int(x>y and z>y) for x,y,z in zip(a,b,closes)],a,b

def run_policy(rows,bull,start,end,policy="ema",cost_factor=1):
    fee=.001*cost_factor; slip=.0005*cost_factor
    cash=1000.; qty=0.; trades=[]; daily=[]; exposures=0; max_cash_run=0; run=0; peak=1000.; dd=0.
    for idx in range(start,end+1):
        row=rows[idx]; op=row[1]; cl=row[4]
        want = (bull[idx-1] if policy=="ema" else (policy=="hold100" or policy=="hold50"))
        if policy=="cash":want=False
        if policy=="hold50":
            if idx==start:
                amount=.5*cash; qty+=amount*(1-fee)/(op*(1+slip));cash-=amount
                trades.append({"date":date(row[0]),"side":"BUY_HALF","reference_open":op,"quantity":qty,"cash_after":cash})
        elif want and qty==0 and cash>1e-8:
            qty=cash*(1-fee)/(op*(1+slip));cash=0.
            trades.append({"date":date(row[0]),"side":"BUY","reference_open":op,"quantity":qty,"cash_after":cash})
        elif not want and qty>0 and policy=="ema":
            cash+=qty*op*(1-slip)*(1-fee);qty=0.
            trades.append({"date":date(row[0]),"side":"SELL","reference_open":op,"quantity":qty,"cash_after":cash})
        liquidatable=cash+qty*cl*(1-slip)*(1-fee)
        peak=max(peak,liquidatable);dd=min(dd,100*(liquidatable/peak-1))
        if qty>0:exposures+=1;run=0
        else:run+=1;max_cash_run=max(max_cash_run,run)
        daily.append({"date":date(row[0]),"strategy":policy,"cost_factor":cost_factor,"close":cl,"cash":cash,"quantity_btc":qty,"liquidatable_usdt":liquidatable,"drawdown_pct":dd,"in_btc":int(qty>0)})
    endcap=daily[-1]["liquidatable_usdt"]
    return {"strategy":policy,"cost_factor":cost_factor,"start_date":daily[0]["date"],"end_date":daily[-1]["date"],"days":len(daily),"capital_final_usdt":round(endcap,6),"return_pct":round(100*(endcap/1000-1),6),"max_drawdown_pct":round(dd,6),"executed_trades":len(trades),"btc_exposed_days":exposures,"btc_exposure_pct":round(100*exposures/len(daily),6),"longest_cash_streak_days":max_cash_run,"hypothetical_exit_cost_included":True},daily,trades

def date(ms):return datetime.fromtimestamp(ms/1000,timezone.utc).date().isoformat()

def first_rising_events(rows,start,end,ema10,ema30):
    events=[];last=-10000
    for i in range(max(start,30),end+1):
        peak=max(row[4] for row in rows[i-30:i]);prev=rows[i-1][4];cl=rows[i][4]
        if prev/peak-1 <= -0.025 and cl>prev and i-last>10:
            last=i; e={"date":date(rows[i][0]),"index":i,"censored":i+10>end}
            if not e["censored"]:
                c3=all(rows[j][4]>rows[j-1][4] for j in (i,i+1,i+2))
                ema=ema10[i+2]>ema30[i+2] and rows[i+2][4]>ema30[i+2]
                def pnl(b,s,m=1):return 100*((1-.001*m)**2*(1-.0005*m)/(1+.0005*m)*s/b-1)
                e.update({"c3":c3,"ema":ema,"c3_and_ema":c3 and ema,"entry_j1":rows[i+1][1],"entry_j3":rows[i+3][1],"end_j10":rows[i+10][4],"net_j3_j10_pct":round(pnl(rows[i+3][1],rows[i+10][4]),6),"net_c1_pct":round(pnl(rows[i+1][1],rows[i+10][4]),6)})
            events.append(e)
    return events

def main():
    a=argparse.ArgumentParser();a.add_argument("--source",type=Path,required=True);a.add_argument("--outdir",type=Path,required=True)
    args=a.parse_args();rows,digest=load_source(args.source);e10,e30,bull=indicators(rows)
    at={date(r[0]):i for i,r in enumerate(rows)}
    periods={"2018_historical_holdout":(at["2018-05-31"],at["2018-12-31"]),"2019_context":(at["2019-01-01"],at["2019-12-31"]),"2020_context":(at["2020-01-01"],at["2020-12-31"]),"2021_context":(at["2021-01-01"],at["2021-12-31"]),"2018_2021_continuous":(at["2018-05-31"],at["2021-12-31"])}
    summary={};equity=[];trades=[]
    for period,(start,end) in periods.items():
        summary[period]={}
        for policy in ["ema","hold100","hold50","cash"]:
            for factor in ([1,2] if policy!="cash" else [1]):
                result,daily,tx=run_policy(rows,bull,start,end,policy,factor)
                summary[period][policy+"_cost"+str(factor)]=result
                if period=="2018_2021_continuous":
                    equity.extend([{**item,"period":period} for item in daily])
                    trades.extend([{**item,"period":period,"strategy":policy,"cost_factor":factor} for item in tx])
    ev=first_rising_events(rows,at["2018-05-31"],at["2018-12-31"],e10,e30)
    ev_valid=[x for x in ev if not x["censored"]];c3=[x for x in ev_valid if x["c3"]]
    evsum={"candidates":len(ev),"evaluable":len(ev_valid),"confirmed_3_closes":len(c3),"c3_ema_yes":len([x for x in c3 if x["ema"]]),"c3_ema_no":len([x for x in c3 if not x["ema"]]),"events":ev}
    proofs={"schema":"seven-heaven.btc-ema-2018-holdout-continuous.v1","source_sha256":digest,"source_days":len(rows),"protocol_commit":PROTOCOL_COMMIT,"assumptions":{"fee_per_side":.001,"slippage_per_side":.0005,"strategy_signal":"EMA10>EMA30 and close>EMA30 at prior UTC daily close","decisions_execute":"next day open, no future data","capital_initial_usdt":1000},"portfolios":summary,"holdout_rebound_events":evsum,"caveats":["2018 historical comparison not future prospective proof","2019-2021 context already explored","Daily reconciled source has 5881 missing native minute observations","USDT credit/counterparty risk not modeled","Hypothetical fills on daily open; neither spread nor order book replay","Continuous and annual portfolios are different experiments"]}
    args.outdir.mkdir(parents=True,exist_ok=True)
    (args.outdir/(STEM+"_PROOFS.json")).write_text(json.dumps(proofs,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    for suffix,items in [("_EQUITY_DAILY.csv",equity),("_TRADES.csv",trades),("_2018_REBOUND_EVENTS.csv",ev)]:
        path=args.outdir/(STEM+suffix)
        if items:
            cols=list(dict.fromkeys(k for item in items for k in item))
            with path.open('w',newline='',encoding='utf-8') as f:
                w=csv.DictWriter(f,fieldnames=cols);w.writeheader();w.writerows(items)
    print(json.dumps({"source_sha256":digest,"years":{k:{mode:round(v[mode+"_cost1"]["return_pct"],4) for mode in ["ema","hold100","hold50","cash"]} for k,v in summary.items()},"holdout_events":{k:v for k,v in evsum.items() if k!="events"}},indent=2))

if __name__=="__main__":main()
