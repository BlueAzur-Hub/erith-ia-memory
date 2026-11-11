#!/usr/bin/env python3
"""Donchian 55: reproducible daily capital-protection simulation. Research only."""
import json
from pathlib import Path

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[4]
ORIGINAL=HERE/"SEVEN_HEAVEN_BTC_SWING_WIN_LOSS_CATALOG_2026_11_10.py"
BASELINE=HERE/"SEVEN_HEAVEN_BTC_SWING_WIN_LOSS_VERIFIED_EVIDENCE_2026_11_10.json"
ARCHIVE=ROOT/"public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/bitcoin-Max.json.gz"
NAME="SEVEN_HEAVEN_DONCHIAN55_DAILY_CAPITAL_PROTECTION_REPLAY_EVIDENCE_2026_11_11"

def replay():
    source=ORIGINAL.read_text(encoding="utf-8")
    source=source.split("if __name__=='__main__':")[0]
    # The canonical mathematics and signals are kept, with only stake sizing
    # and equity/trade-log recording added to the inner simulator.
    changes=[
      ("def sim(k,fee,slip):","def sim(k,fee,slip,allocation=1.0,include_daily=False):"),
      ("spent=cash;price=b['o']*(1+slip)","spent=cash*allocation;price=b['o']*(1+slip)"),
      ("qty=spent*(1-fee)/price;cash=0.;entered=(i,spent)","qty=spent*(1-fee)/price;cash-=spent;entered=(i,spent)"),
      ("trades.append(dict(bought=B[entered[0]]['date'],sold=b['date'],profit=proceeds-entered[1]))","trades.append(dict(bought=B[entered[0]]['date'],sold=b['date'],profit=proceeds-entered[1],entry_capital=entered[1],exit_proceeds=proceeds))"),
      ("  return dict(key=k,net_pct=round(100*(equity[-1]/1000-1),3),\n   max_dd_pct=round(maxdd,3),trades=trade_count,wins=wins,losses=losses,\n   exposure_pct=round(100*exposed/len(equity),2),yearly=yearly)",
       "  answer=dict(key=k,net_pct=round(100*(equity[-1]/1000-1),3),\n   max_dd_pct=round(maxdd,3),trades=trade_count,wins=wins,losses=losses,\n   exposure_pct=round(100*exposed/len(equity),2),yearly=yearly)\n  if include_daily:\n   answer['daily']=[dict(date=B[start+j]['date'],equity=round(v,8)) for j,v in enumerate(equity)]\n   answer['trade_log']=trades\n  return answer"),
      (" return dict(schema='seven.crypto.btc.strategy-failures.v1',read_only=True,orders_enabled=False,",
       " replays={str(int(a*100)):sim('DON55',.001,.0005,a,True) for a in (1.,.5,.25)}\n stress={str(int(a*100)):sim('DON55',.002,.001,a) for a in (1.,.5,.25)}\n return dict(schema='seven.crypto.btc.strategy-failures.v1',read_only=True,orders_enabled=False,"),
      ("double_costs=[dict(key=r['key'],net_pct=r['net_pct'],trades=r['trades']) for r in double])",
       "double_costs=[dict(key=r['key'],net_pct=r['net_pct'],trades=r['trades']) for r in double],daily_replays=replays,double_cost_replays=stress)"),
    ]
    for old,new in changes:
        if source.count(old)!=1:
            raise RuntimeError("Canonical source changed, refusing unverified patch: "+old[:65])
        source=source.replace(old,new,1)
    scope={"__name__":"donchian_daily_research","__file__":str(ORIGINAL)}
    exec(compile(source,str(ORIGINAL),"exec"),scope)
    study=scope["run"](str(ARCHIVE))
    canonical=json.loads(BASELINE.read_text(encoding="utf-8"))
    assert study["source"]["sha256"]==canonical["source"]["sha256"]
    orig={r["key"]:r for r in study["strategies"]}
    stored={r["key"]:r for r in canonical["strategies"]}
    for key,row in orig.items():
        for field in ("net_pct","max_dd_pct","trades","wins","losses","exposure_pct","yearly"):
            assert row[field]==stored[key][field],f"Canonical mismatch: {key}.{field}"
    outcomes=study["daily_replays"]
    for field in ("net_pct","max_dd_pct","trades","wins","losses","exposure_pct","yearly"):
        assert outcomes["100"][field]==stored["DON55"][field],f"Donchian baseline mismatch {field}"
    assert outcomes["100"]["trades"]==29 and outcomes["100"]["wins"]==16 and outcomes["100"]["losses"]==13
    dates=[(t["bought"],t["sold"]) for t in outcomes["100"]["trade_log"]]
    for allocation in ("100","50","25"):
        result=outcomes[allocation]
        assert result["trades"]==29 and len(result["trade_log"])==29 and len(result["daily"])==2830
        assert [(t["bought"],t["sold"]) for t in result["trade_log"]]==dates
        assert result["daily"][0]["date"]=="2019-01-01" and result["daily"][-1]["date"]=="2026-09-30"
    prior_double=next(r for r in canonical["double_costs"] if r["key"]=="DON55")
    assert study["double_cost_replays"]["100"]["net_pct"]==prior_double["net_pct"]
    assert study["double_cost_replays"]["100"]["trades"]==prior_double["trades"]
    return study

def report(study):
    outcome=study["daily_replays"]
    stressed=study["double_cost_replays"]
    lines=[
      "# Seven Heaven — Donchian 55: daily replay and capital protection",
      "",
      "Study: 11 November 2026. Historical window: 2019-01-01 to 2026-09-30.",
      "Research-only simulation, not an account statement or a trading instruction.",
      "",
      "## What was actually replayed",
      "",
      "- Original locally archived Binance Spot BTC/USDT daily candles, 3,075 rows, SHA-256 checked against the canonical source.",
      "- Identical 55-day high breakout, 20-day low exit, 3 × ATR14 trailing stop, 120-day maximum holding duration and next-day opens.",
      "- Same fees (0.10% per side) and assumed slippage (0.05% per side); double-cost stress also calculated.",
      "- Fictitious 1,000 USDT initial portfolio, long or cash only, no leverage.",
      "- Each entry deploys 100%, 50% or 25% of THEN-AVAILABLE CASH. The uninvested fraction remains cash. No annual rebalancing.",
      "- The daily portfolio is valued as retained cash plus the approximated net liquidation value of BTC.",
      "- Verification requires the 100% strategy to reproduce all canonical fields and every allocation to retain the same 29 trade dates.",
      "",
      "## Results (daily maximum drawdown, not year-end drawdown)",
      "",
      "| Allocation per entry | Final capital USDT | Total return | Maximum drawdown | 2022 return | Trades W/L | Double-cost return |",
      "|---|---:|---:|---:|---:|---:|---:|",
    ]
    for a in ("100","50","25"):
        r=outcome[a];s=stressed[a]
        lines.append(f"| {a}% | {1000*(1+r['net_pct']/100):,.2f} | {r['net_pct']:+.3f}% | {r['max_dd_pct']:.3f}% | {r['yearly']['2022']:+.3f}% | {r['trades']} ({r['wins']}/{r['losses']}) | {s['net_pct']:+.3f}% |")
    lines += ["", "## Annual returns, continuous portfolio", "", "| Year | 100% | 50% | 25% |", "|---|---:|---:|---:|"]
    for y in range(2019,2027):
        label=f"{y} (Jan-Sep)" if y==2026 else str(y)
        lines.append("| "+label+" | "+" | ".join(f"{outcome[a]['yearly'][str(y)]:+.3f}%" for a in ("100","50","25"))+" |")
    lines += [
      "", "## Ledger of the 29 historical trades, 100% allocation",
      "", "All three allocations have identical entry and exit dates; allocation-specific trade P/L is in the JSON.",
      "", "| # | Buy UTC | Sell UTC | Net profit/loss USDT | Net return on deployed stake |",
      "|---:|---|---|---:|---:|",
    ]
    for i,t in enumerate(outcome["100"]["trade_log"],1):
        lines.append(f"| {i} | {t['bought']} | {t['sold']} | {t['profit']:+.2f} | {100*t['profit']/t['entry_capital']:+.2f}% |")
    lines += [
      "",
      "## Scientific limitations",
      "",
      "- A daily OHLC-based simulated stop does not guarantee that price or execution on an exchange.",
      "- Daily maximum drawdown is NOT a worst possible loss; intraday gaps, order book depth, and exchange outages are not modeled.",
      "- Historical results are in-sample, not prospective validation. Fees and slippage are simplified assumptions.",
      "- These figures relate to Binance BTC/USDT, NOT OKX BTC/USDC; currencies and data origins must not be conflated.",
      "- The prior annual-allocation document is a different, approximate annual-rebalancing experiment, not a trade-by-trade replay.",
      "- This study makes no change to the Trader, Administrator, Bridge, exchange account or real portfolio.",
      "",
      "## Reproducibility",
      "",
      "Engine: coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_BTC_SWING_WIN_LOSS_CATALOG_2026_11_10.py",
      "Baseline: coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_BTC_SWING_WIN_LOSS_VERIFIED_EVIDENCE_2026_11_10.json",
      "Archive: public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/bitcoin-Max.json.gz",
      "",
    ]
    return "\n".join(lines)

def main():
    study=replay()
    evidence={
      "schema":"seven.crypto.donchian55-daily-capital-protection.v1",
      "research_only":True,"orders_enabled":False,
      "source":study["source"],"model":study["model"],
      "allocation_definition":"On each original strategy entry, spend fraction of available cash and hold the rest in cash.",
      "scenarios":study["daily_replays"],
      "double_cost_scenarios":study["double_cost_replays"],
      "verification":{"archive_sha256_checked":True,"canonical_full_exposure_matched":True,"29_identical_trade_dates":True},
    }
    folder=HERE
    (folder/(NAME+".json")).write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    (folder/(NAME+".md")).write_text(report(study),encoding="utf-8")
    print("DONCHIAN55_DAILY_REPLAY_VERIFIED")
    for a in ("100","50","25"):
        r=study["daily_replays"][a]
        print("ALLOCATION",a,"NET",r["net_pct"],"MAX_DRAWDOWN",r["max_dd_pct"],"TRADES",r["trades"],"2022",r["yearly"]["2022"])

if __name__=="__main__":
    main()
