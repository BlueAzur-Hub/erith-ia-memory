#!/usr/bin/env python3
"""Seven Heaven: bounded public-GET-only BTC/ETH frozen EMA diagnostic and forward research.

Run at repo root:
  python coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_BTC_ETH_FROZEN_NOVEMBER_HOLDOUT_AND_FORWARD_OBSERVATION_2026_11_13.py --selftest
  python coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_BTC_ETH_FROZEN_NOVEMBER_HOLDOUT_AND_FORWARD_OBSERVATION_2026_11_13.py --mode diagnostic
  python coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_BTC_ETH_FROZEN_NOVEMBER_HOLDOUT_AND_FORWARD_OBSERVATION_2026_11_13.py --mode forward

No account access, no trade endpoint, no real orders; never retunes frozen EMA.
"""
from __future__ import annotations
import argparse, csv, datetime as dt, hashlib, io, json, pathlib, sys, time
from urllib.parse import urlencode
from urllib.request import Request, urlopen
ROOT=pathlib.Path("coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles")
OUT=ROOT/"seven_heaven_ema_frozen_forward_evidence"
START_HIST="2023-04-01"
END_HIST="2026-10-31"
NOV_START="2026-11-01"
NOV_END="2026-11-12"
FORWARD_START="2026-11-14"
SOURCES={
 "BTC":{"market":"btcusd","pair":"BTC/USD",
        "file":"native_bitstamp_btc_eth_2024_2026_evidence/bitstamp_btcusd_daily_2023_2026.csv",
        "sha256":"89a85a2f419244b3140f0518fb731f37c06abc3b73734433eb3fbf4642907dbb",
        "baseline_pct":65.781857,"baseline_trades":68},
 "ETH":{"market":"ethusd","pair":"ETH/USD",
        "file":"native_bitstamp_eth_2024_2026_evidence/bitstamp_ethusd_daily_2023_2026.csv",
        "sha256":"881227ba20481322b6829c19d97b799d11a73ae155be8868cf5ec943039c6b49",
        "baseline_pct":89.548633,"baseline_trades":54}
}
FEE=.001
SLIP=.0005
METHODS=("HOLD","FAST","SLOW")
def utc_date(s):
 return dt.datetime.strptime(s,"%Y-%m-%d").replace(tzinfo=dt.timezone.utc)
def iso(x):
 return dt.datetime.fromtimestamp(int(x),dt.timezone.utc).isoformat()
def digest(x):
 return hashlib.sha256(x).hexdigest()
def parse_row(x):
 r={"date":str(x["date"]),"open":float(x["open"]),"high":float(x["high"]),
    "low":float(x["low"]),"close":float(x["close"]),"volume":float(x["volume"])}
 if not all(map(lambda k: __import__("math").isfinite(r[k]), ("open","high","low","close","volume"))):
  raise ValueError("Nonfinite OHLCV")
 if r["low"]<=0 or r["volume"]<0 or r["low"]>min(r["open"],r["close"]) or r["high"]<max(r["open"],r["close"]):
  raise ValueError("Invalid OHLCV "+r["date"])
 return r
def verify_calendar(rows,start,end):
 expected=(utc_date(end)-utc_date(start)).days+1
 if len(rows)!=expected or rows[0]["date"]!=start or rows[-1]["date"]!=end:
  raise ValueError(f"Expected {expected} days from {start} to {end}, got {len(rows)}")
 for i,r in enumerate(rows):
  day=(utc_date(start)+dt.timedelta(days=i)).date().isoformat()
  if day!=r["date"]:
   raise ValueError("Gap/duplicate at index "+str(i)+" expected "+day)
def read_baseline(spec):
 raw=(ROOT/spec["file"]).read_bytes()
 if digest(raw)!=spec["sha256"]:
  raise ValueError("Historical source SHA256 mismatch")
 rows=list(csv.DictReader(io.StringIO(raw.decode("utf-8"))))
 rows=[parse_row(r) for r in rows]
 verify_calendar(rows,START_HIST,END_HIST)
 assert len(rows)==1310
 return rows
def collect(market,pair,requested_end):
 # Exact fixed UTC day: end 23:59:59 so no current/future OHLC is accepted.
 end_epoch=int(utc_date(requested_end).timestamp())+86399
 url=f"https://www.bitstamp.net/api/v2/ohlc/{market}/?"+urlencode(
  {"step":86400,"limit":160,"end":end_epoch,"exclude_current_candle":"true"})
 raw=None
 for attempt in range(3):
  try:
   req=Request(url,headers={"Accept":"application/json",
    "User-Agent":"Seven-Heaven-ReadOnly-Frozen-EMA-Research/1.0"})
   with urlopen(req,timeout=35) as res:
    if res.status!=200: raise ValueError("HTTP non-200")
    raw=res.read(600000)
   break
  except Exception:
   if attempt==2: raise
   time.sleep(2*(attempt+1))
 data=json.loads(raw)
 source=data.get("data")
 if not isinstance(source,dict) or source.get("pair","").replace(" ","").upper()!=pair:
  raise ValueError("Wrong Bitstamp pair / data envelope for "+pair)
 entries=source.get("ohlc")
 if not isinstance(entries,list) or len(entries)>160:
  raise ValueError("Missing/too large OHLC list")
 seen={}
 for x in entries:
  instant=dt.datetime.fromtimestamp(int(x["timestamp"]),dt.timezone.utc)
  if instant.hour or instant.minute or instant.second:
   raise ValueError("Non-UTC midnight in official response")
  day=instant.date().isoformat()
  row=parse_row({"date":day,"open":x["open"],"high":x["high"],
                 "low":x["low"],"close":x["close"],"volume":x["volume"]})
  if day in seen and row!=seen[day]:
   raise ValueError("Conflicting duplicate Bitstamp OHLC "+day)
  seen[day]=row
 ordered=[seen[x] for x in sorted(seen) if NOV_START<=x<=requested_end]
 verify_calendar(ordered,NOV_START,requested_end)
 return ordered,{
  "url":url,"retrieved_utc":dt.datetime.now(dt.timezone.utc).isoformat(),
  "raw_http_body_sha256":digest(raw),"received_day_count":len(entries),
  "selected_day_count":len(ordered),
  "selected_ohlc_canonical_sha256":digest(
   json.dumps(ordered,ensure_ascii=False,sort_keys=True,separators=(",",":")).encode())
 }
def add_signals(rows):
 ema={n:rows[0]["close"] for n in (5,13,10,30)}
 for i,r in enumerate(rows):
  if i:
   for n in ema:
    ema[n]+=2/(n+1)*(r["close"]-ema[n])
  r["FAST"]=bool(ema[5]>ema[13] and r["close"]>ema[13])
  r["SLOW"]=bool(ema[10]>ema[30] and r["close"]>ema[30])
 return rows
def replay(rows,start,end,method,fee=FEE,slip=SLIP):
 first=next((i for i,r in enumerate(rows) if r["date"]==start),None)
 last=next((i for i,r in enumerate(rows) if r["date"]==end),None)
 if first is None or last is None or first<1 or last<first:
  raise ValueError("Nonexistent evaluation window")
 cash=1000.; qty=0.; peak=1000.; worst=0.; exposed=0
 trades=[]; curve=[]
 for i in range(first,last+1):
  today=rows[i]; yesterday=rows[i-1]
  want=method=="HOLD" or yesterday[method]
  if want and qty==0:
   qty=cash*(1-fee)/(today["open"]*(1+slip));cash=0.
   trades.append({"date":today["date"],"side":"BUY","open":today["open"]})
  elif not want and qty>0:
   cash=qty*today["open"]*(1-slip)*(1-fee);qty=0.
   trades.append({"date":today["date"],"side":"SELL","open":today["open"]})
  value=cash+qty*today["close"]*(1-slip)*(1-fee)
  peak=max(peak,value); worst=min(worst,100*(value/peak-1))
  exposed+=int(qty>0)
  curve.append({"date":today["date"],"equity":round(value,8),
                "exposed":bool(qty>0)})
 return {"start":start,"end":end,"days":len(curve),
  "return_pct":round(100*(curve[-1]["equity"]/1000-1),6),
  "capital_usd":round(curve[-1]["equity"],6),
  "max_drawdown_pct":round(worst,6),
  "transactions":len(trades),"exposed_days":exposed,
  "cash_days":len(curve)-exposed,
  "last_position":"ETH_OR_BTC" if qty>0 else "CASH",
  "trades":trades,"daily_equity":curve}
def selftest():
 assert (utc_date("2026-11-13")-utc_date("2026-11-01")).days==12
 for a in SOURCES.values():
  x=add_signals(read_baseline(a))
  baseline=replay(x,"2024-01-01","2026-10-31","SLOW")
  assert abs(baseline["return_pct"]-a["baseline_pct"])<0.00001,baseline
  assert baseline["transactions"]==a["baseline_trades"],baseline
  # Changing a future closed day must not alter earlier EMA states.
  a0=[(d["FAST"],d["SLOW"]) for d in x[:-1]]
  x[-1]["close"]*=1.21
  add_signals(x)
  assert [(d["FAST"],d["SLOW"]) for d in x[:-1]]==a0
 print("PASS: frozen historical source SHA, BTC/ETH 2024-2026 reference, causal prefixes")
def main():
 pa=argparse.ArgumentParser()
 pa.add_argument("--selftest",action="store_true")
 pa.add_argument("--mode",choices=["diagnostic","forward"])
 args=pa.parse_args()
 if args.selftest: selftest();return
 if not args.mode: pa.error("--mode required")
 now=dt.datetime.now(dt.timezone.utc)
 yesterday=(now.date()-dt.timedelta(days=1)).isoformat()
 if args.mode=="diagnostic":
  end=NOV_END;start=NOV_START
 else:
  start=FORWARD_START
  if yesterday<start:
   print("NO_CLOSED_PROSPECTIVE_DAYS; no forward performance claimed")
   return
  end=yesterday
  if (utc_date(end)-utc_date(FORWARD_START)).days+1>120:
   raise ValueError("Forward 120-day API window exceeded: new frozen protocol required")
 if yesterday<end: raise ValueError("Attempted to use an unclosed UTC daily candle")
 tag="2026_11_13_NOVEMBER_01_12" if args.mode=="diagnostic" else end.replace("-","_")
 prefix="SEVEN_HEAVEN_BTC_ETH_" + ("NOVEMBER_TEMPORAL_DIAGNOSTIC_" if args.mode=="diagnostic" else "PROSPECTIVE_")
 old_json=OUT/(prefix+tag+"_PROOFS.json")
 old_md=OUT/(prefix+tag+"_REPORT.md")
 if old_json.exists() and old_md.exists():
  print("IMMUTABLE_EVIDENCE_ALREADY_ARCHIVED; previously published files left unchanged: "+tag)
  return
 if old_json.exists() or old_md.exists():
  raise ValueError("Incomplete immutable pair, refusing to overwrite: "+tag)
 detail={}; calls={}; source={}
 for asset,spec in SOURCES.items():
  past=read_baseline(spec)
  new,request=collect(spec["market"],spec["pair"],end)
  combined=add_signals(past+new)
  verify_calendar(combined,START_HIST,end)
  baseline=replay(combined,"2024-01-01",END_HIST,"SLOW")
  if abs(baseline["return_pct"]-spec["baseline_pct"])>0.00001:
   raise ValueError("Prior frozen baseline changed for "+asset)
  source[asset]={"source_pair":spec["pair"],"historical_sha256":spec["sha256"],
   "http":request,"selected_closed_days":new}
  calls[asset]={}
  for method in METHODS:
   net=replay(combined,start,end,method)
   stressed=replay(combined,start,end,method,FEE*2,SLIP*2)
   net["double_cost_return_pct"]=stressed["return_pct"]
   calls[asset][method]=net
  detail[asset]={"historical_reference_reproduced":True,
                 "baseline_ema10_30_pct":baseline["return_pct"],
                 "final_day_closed":end,
                 "most_recent_signal_asof_last_close":{
                  "FAST":combined[-1]["FAST"],"SLOW":combined[-1]["SLOW"]}}
 assert calls["BTC"]["SLOW"]["days"]==calls["ETH"]["SLOW"]["days"]
 dual={}
 for method in METHODS:
  b=calls["BTC"][method];e=calls["ETH"][method]
  vals=[(x["equity"]+y["equity"])/2 for x,y in zip(b["daily_equity"],e["daily_equity"])]
  peak=1000.; worst=0.
  for value in vals:
   peak=max(peak,value);worst=min(worst,100*(value/peak-1))
  dual[method]={"return_pct":round(100*(vals[-1]/1000-1),6),
   "max_drawdown_pct":round(worst,6),
   "transactions":b["transactions"]+e["transactions"],
   "double_cost_return_pct":round((b["double_cost_return_pct"]+e["double_cost_return_pct"])/2,6)}
 confidence=("RETROSPECTIVE_LATER_DATE_DIAGNOSTIC_NOT_PROSPECTIVE" if args.mode=="diagnostic"
  else "PROSPECTIVE_OBSERVATION_" + ("LESS_THAN_14_DAYS" if calls["BTC"]["HOLD"]["days"]<14
  else "14_TO_29_DAYS" if calls["BTC"]["HOLD"]["days"]<30
  else "30_TO_89_DAYS" if calls["BTC"]["HOLD"]["days"]<90 else "90_TO_120_DAYS_NOT_PROOF"))
 doc={"schema":"seven-heaven.frozen-bitstamp-ema-diagnostic-forward.v1",
  "status":confidence,"run_utc":now.isoformat(),
  "frozen_protocol":"SEVEN_HEAVEN_BTC_ETH_EMA_PROSPECTIVE_NO_RETUNING_PROTOCOL_2026_11_13.md",
  "mode":args.mode,"evaluation_utc":[start,end],
  "source":source,"historical_controls":detail,
  "assumptions":{"fee_pct_side":0.1,"slippage_pct_side":0.05,
    "double_costs_factor":2,"capital_usd_per_asset":1000,
    "executable_orders":False,"leverage":False},
  "individual":calls,"portfolio_50_50":dual,
  "limits":["NOT ACTUAL TRADES; hypothetical next-day open fills",
   "Historical fiat USD values, not OKX BTC/USDC or ETH/USDC",
   "Static fees and slippage; risks, taxes and order queue omitted",
   "November 1-12 dates already happened before protocol freeze",
   "Even 90 forward days insufficient to establish reliable profitability"]}
 folder=OUT
 folder.mkdir(parents=True,exist_ok=True)
 tag="2026_11_13_NOVEMBER_01_12" if args.mode=="diagnostic" else end.replace("-","_")
 lead="SEVEN_HEAVEN_BTC_ETH_" + ("NOVEMBER_TEMPORAL_DIAGNOSTIC_" if args.mode=="diagnostic" else "PROSPECTIVE_")
 json_name=lead+tag+"_PROOFS.json"
 md_name=lead+tag+"_REPORT.md"
 # Avoid unreviewed mutable documents: never overwrite existing evidence path.
 if (folder/json_name).exists() or (folder/md_name).exists():
  raise ValueError("Immutable evidence already exists: "+tag)
 (folder/json_name).write_text(json.dumps(doc,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
 lines=[
  "# Seven Heaven — BTC / ETH, "+("November 1–12, 2026 retrospective diagnostic" if args.mode=="diagnostic" else "Frozen prospective observation as of "+end),
  "",
  "**Status:** "+confidence+". **No real orders.**",
  "",
  "**UTC evaluation:** "+start+" through "+end+"; "+str(calls["BTC"]["HOLD"]["days"])+" complete daily candles. USD, Bitstamp Spot only.",
  "",
  "| Instrument / portfolio | HOLD % | FAST EMA5/13 % | SLOW EMA10/30 % |",
  "|---|---:|---:|---:|"]
 for asset in ("BTC","ETH"):
  lines.append("| "+asset+"/USD | "+ " | ".join(f"{calls[asset][m]['return_pct']:+.3f}" for m in METHODS)+" |")
 lines+=["| 50/50 (two independent equal sleeves) | "+
  " | ".join(f"{dual[m]['return_pct']:+.3f}" for m in METHODS)+" |",
  "",
  "All returns are **net of assumed fee 0.10% + slippage 0.05% per side**, not executed returns.",
  "",
  "| Asset/portfolio and method | Max DD % | Orders | Cost ×2 return % |",
  "|---|---:|---:|---:|"]
 for asset in ("BTC","ETH"):
  for m in METHODS:
   x=calls[asset][m]
   lines.append(f"| {asset} {m} | {x['max_drawdown_pct']:.3f} | {x['transactions']} | {x['double_cost_return_pct']:+.3f} |")
 for m in METHODS:
  x=dual[m]
  lines.append(f"| 50/50 {m} | {x['max_drawdown_pct']:.3f} | {x['transactions']} | {x['double_cost_return_pct']:+.3f} |")
 lines+=["",
  "## Evidence and validity",
  "- Frozen protocol predates the retrieval performed by this workflow. For 1–12 Nov, price days still **predate protocol**: this is a **later-period retrospective diagnostic**, not a prospective trial.",
  "- Forward cohort uses only **fully closed** UTC days on or after 2026-11-13, with EMA warmed from original historical sources, and no configuration changes.",
  "- Frozen historical SHA256 and full 2024–October 2026 reference replay verified independently for BTC and ETH.",
  "- Official Bitstamp public OHLC API responses, timestamps, source-body hashes, selected daily prices, strategy actions, liquidation valuations and stress tests are in the adjacent JSON.",
  "- Unknown market impact, spread, connectivity, trade latency, minima and taxes prohibit any claim of actual execution.",
  "- No intervention in Administrator, Operator, Trader, Bridge, or private accounts.",
  "",
  "**Decision:** No method should be selected or promoted from fewer than 90 prospective complete daily candles. Even 90 observations would remain preliminary.",
  ""]
 (folder/md_name).write_text("\n".join(lines),encoding="utf-8")
 print(json.dumps({"status":confidence,"start":start,"end":end,
  "days":calls["BTC"]["HOLD"]["days"],"individual_returns_pct":{
    a:{k:calls[a][k]["return_pct"] for k in METHODS} for a in ("BTC","ETH")},
  "mix_returns_pct":{k:dual[k]["return_pct"] for k in METHODS},
  "proof":str(folder/json_name),"report":str(folder/md_name)},indent=2))
if __name__=="__main__":
 main()
