#!/usr/bin/env python3
"""Read-only consolidated Radar20 paper portfolio from already-published verified monthly views.

One simulated cash ledger, chronological entry/exit events and position limits.
The synchronised equal-weight reference is a theoretical index, not executable orders.
There is no wallet, key, API order, network write or live trading code.
"""
import argparse
import calendar
import datetime as dt
import hashlib
import io
import json
import math
import statistics
import zipfile
from collections import defaultdict
from pathlib import Path

SYMBOLS = ('ETH','SOL','XRP','ADA','LINK','AVAX','SUI','NEAR','UNI','AAVE','LTC','BCH','DOT','HBAR','XLM','DOGE','PEPE','SHIB','APT','ARB')
MONTHS = ('2026-07','2026-08','2026-09')
BASE_MS = int(dt.datetime(2026,7,1,tzinfo=dt.timezone.utc).timestamp()*1000)
TOTAL_HOURS = 92*24
HOURLY_MS = 3_600_000
FIELDS = ['timestamp_ms','open_usdt','high_usdt','low_usdt','close_usdt','volume_usdt','taker_buy_usdt','taker_sell_usdt','taker_buy_pct','trades']
CAPITAL = 400.0
TICKET = 100.0
MAX_POSITIONS = 4
SCHEMA = 'erith.trader.radar20.shared-capital-paper.v1'


def need(ok, msg):
    if not ok: raise ValueError(msg)


def canonical(obj):
    return (json.dumps(obj,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False)+'\n').encode('utf8')


def utc(ms):
    return dt.datetime.fromtimestamp(ms/1000,dt.timezone.utc).isoformat().replace('+00:00','Z')


def digest(b): return hashlib.sha256(b).hexdigest()


def load_verified_zip(path):
    """Validate SHA for all 60 files and 20 complete synchronised hourly series."""
    result={}
    with zipfile.ZipFile(path) as z:
        names=z.namelist()
        need(len(names)==61 and len(set(names))==61, 'Expected exactly 60 monthly JSON and index')
        manifest=json.loads(z.read('index.json'))
        need(manifest.get('schema')=='erith.trader.radar20.flows.index.v1','Wrong source index schema')
        need(manifest.get('markets')==20 and manifest.get('months')==list(MONTHS), 'Wrong universe or period')
        entries=manifest.get('entries')
        need(isinstance(entries,list) and len(entries)==60,'Missing archive records')
        expected_files=set()
        for rec in entries:
            sym=rec['pair'][:-4]
            month=rec['month']
            need(sym in SYMBOLS and rec['pair']==sym+'USDT' and month in MONTHS,'Unexpected identity')
            expected_path=f'{rec["pair"]}/{month}.json'
            need(rec['path']==expected_path and rec['path'] in names,'Unsafe/missing archive path')
            expected_files.add(expected_path)
            raw=z.read(rec['path'])
            need(digest(raw)==rec['sha256'] and len(raw)==rec['bytes'],'Derived JSON SHA/size mismatch')
            payload=json.loads(raw)
            need(payload.get('schema')=='erith.trader.radar20.flows.monthly.v1' and
                 payload.get('pair')==rec['pair'] and payload.get('month')==month and
                 payload.get('resolution')=='1h' and payload.get('quote')=='USDT' and
                 not payload.get('live') and not payload.get('orders_enabled'), 'Wrong month source contract')
            need(payload.get('columns')==FIELDS and payload['source']['sha256']==rec['source_zip_sha256'], 'Source provenance differs')
            y,m=map(int,month.split('-'))
            size=calendar.monthrange(y,m)[1]*24
            rows=payload.get('rows')
            need(len(rows)==size==rec['hours']==payload['row_count'],'Monthly hour coverage incomplete')
            month_start=int(dt.datetime(y,m,1,tzinfo=dt.timezone.utc).timestamp()*1000)
            for i,r in enumerate(rows):
                need(len(r)==10 and r[0]==month_start+i*HOURLY_MS, 'Missing/duplicate timestamp')
                open_,high,low,close,vol,buy,sell,share=r[1:9]
                need(all(isinstance(v,(int,float)) and math.isfinite(v) for v in (open_,high,low,close,vol,buy,sell)),'Nonfinite market value')
                need(0<low<=min(open_,close)<=max(open_,close)<=high and 0<=buy<=vol*1.000001 and sell>=0, 'Invalid OHLCV/taker volume')
                need((share is None and vol==0) or (share is not None and 0<=share<=100),'Invalid pressure fraction')
                need(isinstance(r[9],int) and r[9]>=0,'Invalid trades')
            result[(sym,month)] = rows
        need(set(names)==expected_files|{'index.json'} and len(expected_files)==60,'Foreign/missing files')
    series={}
    for sym in SYMBOLS:
        flattened=[r for month in MONTHS for r in result[(sym,month)]]
        need(len(flattened)==TOTAL_HOURS and all(r[0]==BASE_MS+i*HOURLY_MS for i,r in enumerate(flattened)), 'Gap in combined historical series')
        series[sym]=flattened
    return series, {'source_schema':manifest['schema'],'source_entries':len(entries),'source_manifest_sha256':digest(canonical(manifest)),'source_zip_sha256':digest(path.read_bytes()),'hours_per_market':TOTAL_HOURS,'markets':len(series)}


def simulate(series, threshold=50, hold=48, fee=.008, *, capital=CAPITAL, ticket=TICKET, max_positions=MAX_POSITIONS):
    need(0<=threshold<=100 and hold>=1 and 0<=fee<.3 and ticket>0 and capital>0 and 1<=max_positions<=20,'Bad simulation settings')
    sides=fee/2
    cash=capital
    positions={}
    records=[]
    equity=[]
    rejected=defaultdict(int)
    signals=0
    fees_total=0.
    max_open=0
    invested_hours=0.
    wins=losses=0
    peak=capital
    worst_dollars=0.
    worst_pct=0.
    previous_losses=longest_losses=0
    exposure_matched_reference_pnl=0.
    gross_notional=ticket/(1+sides)
    # Entry opens at hour h, using only bar h-1 and its preceding 24 bars.
    for h in range(TOTAL_HOURS):
        for sym, pos in list(positions.items()):
            if pos['exit_index']!=h:continue
            sell=series[sym][h][1]
            proceeds=pos['units']*sell*(1-sides)
            pnl=proceeds-ticket
            cash+=proceeds
            fees_total+=pos['units']*sell*sides
            wins+=pnl>0
            losses+=pnl<=0
            previous_losses=0 if pnl>0 else previous_losses+1
            longest_losses=max(longest_losses,previous_losses)
            # Equal-weight basket return with same *entry/exit hours and notional*.
            basket_growth=sum(series[s][h][1]/series[s][pos['entry_index']][1] for s in SYMBOLS)/len(SYMBOLS)
            basket_net=gross_notional*basket_growth*(1-sides)-ticket
            exposure_matched_reference_pnl+=basket_net
            records.append({'pair':sym+'USDT','entry_utc':utc(series[sym][pos['entry_index']][0]),'exit_utc':utc(series[sym][h][0]),'entry_open':round(pos['buy'],9),'exit_open':round(sell,9),'gross_usdt':round(gross_notional,8),'profit_net_usdt':round(pnl,7),'basket_matched_profit_usdt':round(basket_net,7),'fee_fraction_roundtrip_assumed':fee})
            del positions[sym]
        if h>=25 and h+hold<TOTAL_HOURS:
            candidates=[]
            prior=h-1
            for sym in SYMBOLS:
                bar=series[sym][prior]
                previous=[series[sym][i][5] for i in range(prior-24,prior)]
                if bar[8] is None or bar[5]<=0 or bar[8]<threshold:continue
                if bar[5]<=statistics.median(previous):continue
                signals+=1
                candidates.append((sym,bar[8],bar[5]/max(statistics.median(previous),1e-12)))
            # Deterministic ranking: strongest completed taker-buy share, then volume ratio, then symbol.
            candidates.sort(key=lambda x:(-x[1],-x[2],x[0]))
            for sym,share,volratio in candidates:
                if sym in positions:
                    rejected['existing_position']+=1
                    continue
                if len(positions)>=max_positions:
                    rejected['max_positions']+=1
                    continue
                if cash+1e-9<ticket:
                    rejected['insufficient_cash']+=1
                    continue
                price=series[sym][h][1]
                units=gross_notional/price
                cash-=ticket
                fees_total+=gross_notional*sides
                positions[sym]={'buy':price,'units':units,'entry_index':h,'exit_index':h+hold}
                invested_hours+=gross_notional*hold
                max_open=max(max_open,len(positions))
        eq=cash+sum(pos['units']*series[sym][h][1] for sym,pos in positions.items())
        peak=max(peak,eq)
        worst_dollars=max(worst_dollars,peak-eq)
        worst_pct=max(worst_pct,(peak-eq)/peak*100)
        equity.append([series[SYMBOLS[0]][h][0],round(eq,7),len(positions),round(cash,7)])
    need(not positions,'Unclosed positions at series end')
    profit=cash-capital
    need(abs(profit-sum(r['profit_net_usdt'] for r in records))<.0005,'Ledger sum does not balance')
    return {'threshold_pct':threshold,'hold_hours':hold,'assumed_roundtrip_fee_pct':fee*100,
            'capital_usdt':capital,'ticket_including_entry_fee_usdt':ticket,'max_simultaneous':max_positions,
            'signals':signals,'completed_trades':len(records),'winners':wins,'losers':losses,
            'total_profit_net_usdt':round(profit,6),'final_cash_usdt':round(cash,6),
            'fees_paid_usdt':round(fees_total,6),'max_held_positions':max_open,
            'drawdown_usdt':round(worst_dollars,6),'drawdown_pct':round(worst_pct,6),
            'max_consecutive_losses':longest_losses,'avg_exposure_pct_of_capital':round(invested_hours/(TOTAL_HOURS*capital)*100,4),
            'rejected':dict(rejected),'theoretical_matched_20asset_basket_profit_net_usdt':round(exposure_matched_reference_pnl,6),
            'trades':records,'equity_hourly':equity}


def fixed_trade_cost_stress(trades, fees=(.008,.012,.016)):
    # Same ENTRY/EXIT selections and prices; not a second cash-constrained replay.
    return {str(fee):round(sum(
        TICKET/(1+fee/2)*(t['exit_open']/t['entry_open'])*(1-fee/2)-TICKET
        for t in trades),6) for fee in fees}


def monthly_breakdown(trades):
    result=[]
    for month in MONTHS:
        t=[r for r in trades if r['exit_utc'].startswith(month)]
        result.append({'exit_month':month,'closed_trades':len(t),
                       'strategy_pnl_usdt':round(sum(r['profit_net_usdt'] for r in t),6),
                       'matched_basket_pnl_usdt':round(sum(r['basket_matched_profit_usdt'] for r in t),6)})
    return result


def buy_hold(series,fee=.008, capital=CAPITAL):
    half=fee/2
    unit_cash=capital/len(SYMBOLS)
    invested=unit_cash/(1+half)
    value=sum(invested*series[s][-1][1]/series[s][0][1]*(1-half) for s in SYMBOLS)
    # Liquidation-equivalent mark at each hourly open; one passive basket, no rebalancing.
    peak=capital
    worst=0.0
    for hour in range(TOTAL_HOURS):
        v=sum(invested*series[s][hour][1]/series[s][0][1]*(1-half) for s in SYMBOLS)
        peak=max(peak,v)
        worst=max(worst,peak-v)
    return {'capital_usdt':capital,'assumed_roundtrip_fee_pct':fee*100,'final_value_usdt':round(value,6),
            'drawdown_usdt':round(worst,6),'drawdown_pct_of_initial_usdt':round(worst/capital*100,4),
            'total_profit_net_usdt':round(value-capital,6),'full_period_exposure_pct':100,
            'not_executable_as_is':True,'caveat':'20 micropositions of 20 USDT each; differs in invested capital, timing and risk from active signals.'}


def main():
    p=argparse.ArgumentParser()
    p.add_argument('--zip',type=Path,required=True)
    p.add_argument('--out',type=Path,required=True)
    args=p.parse_args()
    series,provenance=load_verified_zip(args.zip)
    configs=[]
    for threshold in (50,55,60,65):
        for hold in (12,48):
            for fee in (.008,.012,.016):
                r=simulate(series,threshold,hold,fee)
                configs.append({k:v for k,v in r.items() if k not in ('trades','equity_hourly')})
    primary=simulate(series,50,48,.008)
    benchmarks={str(fee):buy_hold(series,fee) for fee in (.008,.012,.016)}
    payload={'schema':SCHEMA,'status':'HISTORICAL_RESEARCH_ONLY','period_utc':['2026-07-01','2026-09-30'],
             'capital_shared_usdt':CAPITAL,'market_count':len(SYMBOLS),'hours_per_market':TOTAL_HOURS,
             'sources':provenance,'primary_preselected':{'threshold_pct':50,'hold_hours':48,'fee_roundtrip_pct':.8},
             'primary':{k:v for k,v in primary.items() if k not in ('trades','equity_hourly')},
             'primary_fixed_trade_cost_sensitivity_usdt':fixed_trade_cost_stress(primary['trades']),
             'primary_closed_by_month':monthly_breakdown(primary['trades']),
             'scenarios':configs,'benchmarks_full_time':benchmarks,
             'notes':[
                 'The 20-way equal-weight matched basket is a theoretical benchmark for EXACTLY the strategy accepted entry/exit slots and notional. Its trade sizes across 20 underlying assets may violate exchange minimums.',
                 'Full-time passive buy-and-hold has different invested duration, exposure and risk; not evidence of strategy underperformance at equal risk.',
                 'September ETH was already studied when threshold/hold rules were discussed: these months are NOT an independent out-of-sample test.',
                 'USDT is not USD; Binance Spot historic prices are not verified OKX fills.',
                 'Higher fees change capital availability and selected trades in the full replays; fixed_trade_cost_sensitivity prices the SAME primary trades but is not separately cash-constrained.',
                 'Fee hypotheses are not verified execution costs; spread, slippage, funding, taxes and minimum orders not represented.',
                 'No order execution or profitability certification; no live signal.'
             ],'orders_enabled':False,'strategy_certified':False}
    args.out.mkdir(parents=True,exist_ok=True)
    (args.out/'summary.json').write_bytes(canonical(payload))
    (args.out/'trades.json').write_bytes(canonical({'schema':SCHEMA+'.trades','primary_preselected':payload['primary_preselected'],'trades':primary['trades'],'orders_enabled':False}))
    (args.out/'equity.json').write_bytes(canonical({'schema':SCHEMA+'.equity','capital_initial_usdt':CAPITAL,'columns':['timestamp_ms','equity_usdt','open_positions','cash_usdt'],'rows':primary['equity_hourly']}))
    manifest={'schema':SCHEMA+'.index','source_manifest_sha256':provenance['source_manifest_sha256'],'data':[{'path':f,'bytes':(args.out/f).stat().st_size,'sha256':digest((args.out/f).read_bytes())} for f in ('summary.json','trades.json','equity.json')],'orders_enabled':False}
    (args.out/'index.json').write_bytes(canonical(manifest))
    print(json.dumps({'result':'PASS','trades':primary['completed_trades'],'pnl_usdt':primary['total_profit_net_usdt'],'benchmark_matched_usdt':primary['theoretical_matched_20asset_basket_profit_net_usdt'],'buy_hold_usdt':benchmarks['0.008']['total_profit_net_usdt'],'drawdown_usdt':primary['drawdown_usdt'],'data':str(args.out)},ensure_ascii=False))

if __name__=='__main__':main()
