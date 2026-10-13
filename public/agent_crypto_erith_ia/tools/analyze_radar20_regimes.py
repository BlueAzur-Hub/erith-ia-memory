#!/usr/bin/env python3
"""Exploratory no-lookahead diagnostic of FROZEN Radar20 paper decisions.

Uses verified, already-public monthly JSONs and published paper journals. This
script neither changes the strategy nor fits thresholds for a better return.
Not a signal engine, not investment advice, no network access or orders.
"""
from __future__ import annotations
import argparse, calendar, datetime as dt, hashlib, json, math, statistics
from collections import Counter, defaultdict
from pathlib import Path

SYMBOLS = ('ETH','SOL','XRP','ADA','LINK','AVAX','SUI','NEAR','UNI','AAVE','LTC','BCH','DOT','HBAR','XLM','DOGE','PEPE','SHIB','APT','ARB')
COLUMNS=['timestamp_ms','open_usdt','high_usdt','low_usdt','close_usdt','volume_usdt','taker_buy_usdt','taker_sell_usdt','taker_buy_pct','trades']
HOUR = 3600000
PERIODS=(('2026-04','2026-05','2026-06'),('2026-07','2026-08','2026-09'))


def must(test, reason):
    if not test:raise ValueError(reason)


def canonical(value):
    return (json.dumps(value,ensure_ascii=False,sort_keys=True,allow_nan=False,separators=(',',':'))+'\n').encode('utf-8')


def read_data(root, months):
    manifest_raw=(root/'index.json').read_bytes()
    manifest=json.loads(manifest_raw)
    must(manifest['schema']=='erith.trader.radar20.flows.index.v1','Invalid archive source schema')
    must(manifest['markets']==20 and tuple(manifest['months'])==months and len(manifest['entries'])==60,'Incomplete archive selection')
    series={s:[] for s in SYMBOLS}
    paths=set()
    for entry in manifest['entries']:
        pair,month=entry['pair'],entry['month']
        must(pair.endswith('USDT') and pair[:-4] in SYMBOLS and month in months,'Unexpected asset/month')
        path=f'{pair}/{month}.json'
        must(entry['path']==path and path not in paths,'Invalid archive path or duplicate')
        paths.add(path)
        raw=(root/path).read_bytes()
        must(hashlib.sha256(raw).hexdigest()==entry['sha256'] and len(raw)==entry['bytes'],'Archive JSON digest differs')
        payload=json.loads(raw)
        must(payload['pair']==pair and payload['month']==month and payload['columns']==COLUMNS and payload['quote']=='USDT','Asset schema/pair invalid')
        must(payload['source']['sha256']==entry['source_zip_sha256'] and payload['source']['native_minutes_verified']==calendar.monthrange(*map(int,month.split('-')))[1]*1440, 'Native source proof differs')
        y,m=map(int,month.split('-'))
        n=calendar.monthrange(y,m)[1]*24
        origin=int(dt.datetime(y,m,1,tzinfo=dt.timezone.utc).timestamp()*1000)
        rows=payload['rows']
        must(len(rows)==n==entry['hours'],'Missing source hours')
        must(all(len(r)==10 and r[0]==origin+i*HOUR for i,r in enumerate(rows)),'Source has hourly gaps')
        series[pair[:-4]].extend(rows)
    must(len(paths)==60,'Expected 60 verified monthly files')
    length=sum(calendar.monthrange(*map(int,m.split('-')))[1]*24 for m in months)
    start=int(dt.datetime(*map(int,months[0].split('-')),1,tzinfo=dt.timezone.utc).timestamp()*1000)
    for sym in SYMBOLS:
        series[sym].sort(key=lambda r:r[0])
        must(len(series[sym])==length and all(x[0]==start+i*HOUR for i,x in enumerate(series[sym])),'Cross-month price gap')
    return series, {'sha256':hashlib.sha256(manifest_raw).hexdigest(),'months':list(months),'files':len(paths),'hours_per_asset':length}


def market_features(series):
    """At entry hour h, use ONLY data ending at h-1 for regimes."""
    size=len(series['ETH'])
    timestamps=[r[0] for r in series['ETH']]
    market_log_returns=[None]
    for h in range(1,size):
        market_log_returns.append(sum(math.log(series[s][h][4]/series[s][h-1][4]) for s in SYMBOLS)/20)
    features=[]
    for h in range(size):
        prior=h-1
        trend='insufficient_history'
        if prior>=72:
            returns=[series[s][prior][4]/series[s][prior-72][4]-1 for s in SYMBOLS]
            median=statistics.median(returns)
            trend='baisse_72h' if median<=-.03 else 'hausse_72h' if median>=.03 else 'lateral_72h'
        else:median=None
        vol='insufficient_history'
        current_sigma=baseline_sigma=None
        if prior>=192:
            # The signal hour and all historic comparison hours have already closed.
            current=market_log_returns[prior-23:prior+1]
            baseline=market_log_returns[prior-191:prior-23]
            current_sigma=statistics.pstdev(current)
            baseline_sigma=statistics.pstdev(baseline)
            vol='volatilite_elevee' if current_sigma>=1.5*baseline_sigma else 'volatilite_ordinaire'
        features.append({'trend':trend,'trend_return_median_pct':None if median is None else round(median*100,5),
                         'volatility':vol,'sigma24':current_sigma,'sigma7d_prior':baseline_sigma})
    return features


def classify_pressure(p):
    return 'pression_60_plus' if p>=60 else 'pression_55_60' if p>=55 else 'pression_50_55'


def classify_volume(v):
    return 'volume_2x_plus' if v>=2 else 'volume_1_5_2x' if v>=1.5 else 'volume_1_1_5x'


def breakdown(deals,group_key):
    bucket=defaultdict(list)
    for d in deals:bucket[d[group_key]].append(d)
    result=[]
    for name,x in sorted(bucket.items()):
        pnl=sum(d['pnl_usdt'] for d in x)
        alt=sum(d['matched_basket_usdt'] for d in x)
        win=sum(d['pnl_usdt']>0 for d in x)
        result.append({'group':name,'trades':len(x),'winning_trades':win,'losing_trades':len(x)-win,
                       'win_pct':round(win/len(x)*100,2),'pnl_usdt':round(pnl,5),
                       'mean_per_trade_usdt':round(pnl/len(x),5),
                       'matched_basket_pnl_usdt':round(alt,5),
                       'pnl_minus_matched_basket_usdt':round(pnl-alt,5)})
    return result


def evaluate(root):
    partitions=[(PERIODS[0],root/'radar20_retro_stress'/'sources',root/'radar20_retro_stress'),
                (PERIODS[1],root/'radar20',root/'radar20_portfolio')]
    all_deals=[];proofs=[];quarters=[];skipped=Counter()
    for months,market_root,report_root in partitions:
        series,proof=read_data(market_root,months)
        features=market_features(series)
        report=json.loads((report_root/'summary.json').read_text())
        rawtrades=json.loads((report_root/'trades.json').read_text())
        original=rawtrades['trades']
        must(len(original)==report['primary']['completed_trades'],'Journal size mismatches portfolio')
        must(abs(sum(t['profit_net_usdt'] for t in original)-report['primary']['total_profit_net_usdt'])<.0005,'Cash ledger does not match journal')
        primary=report['primary']
        must(primary['capital_usdt']==400 and primary['threshold_pct']==50 and primary['hold_hours']==48 and primary['max_simultaneous']==4 and abs(primary['assumed_roundtrip_fee_pct']-.8)<1e-9,'Original rules not frozen')
        start=series['ETH'][0][0];trades=[]
        for x in original:
            sym=x['pair'][:-4]
            must(sym in SYMBOLS,'Non-Radar asset in journal')
            entry_ms=int(dt.datetime.fromisoformat(x['entry_utc'].replace('Z','+00:00')).timestamp()*1000)
            exit_ms=int(dt.datetime.fromisoformat(x['exit_utc'].replace('Z','+00:00')).timestamp()*1000)
            h=(entry_ms-start)//HOUR
            must(entry_ms==start+h*HOUR and exit_ms-entry_ms==48*HOUR,'Trade chronology/hold inconsistent')
            prior=h-1
            row=series[sym][prior]
            prior_volume=statistics.median(series[sym][i][5] for i in range(prior-24,prior))
            buy_pct=row[8]
            volume_ratio=row[5]/prior_volume if prior_volume>0 else math.inf
            must(prior>=24 and buy_pct>=50 and row[5]>prior_volume, 'Published trade contradicts prior completed signal')
            must(math.isclose(x['entry_open'],series[sym][h][1],rel_tol=.0001,abs_tol=1e-9) and math.isclose(x['exit_open'],series[sym][h+48][1],rel_tol=.0001,abs_tol=1e-9),'Published trade does not match archived prices')
            feat=features[h]
            one={'pair':x['pair'],'quarter':months[0]+'..'+months[-1],'month':x['entry_utc'][:7],
                 'entry_utc':x['entry_utc'],'exit_utc':x['exit_utc'],
                 'pnl_usdt':x['profit_net_usdt'],'matched_basket_usdt':x['basket_matched_profit_usdt'],
                 'pnl_vs_basket_usdt':round(x['profit_net_usdt']-x['basket_matched_profit_usdt'],7),
                 'winning_trade':x['profit_net_usdt']>0,
                 'trend':feat['trend'],'trend_return_median_pct':feat['trend_return_median_pct'],
                 'volatility':feat['volatility'],
                 'pressure':classify_pressure(buy_pct),'taker_buy_pct':round(buy_pct,5),
                 'volume_band':classify_volume(volume_ratio),'volume_multiplier':round(volume_ratio,5),
                 'feature_cutoff_utc':dt.datetime.fromtimestamp(row[0]/1000,tz=dt.timezone.utc).isoformat().replace('+00:00','Z')}
            must(row[0]<entry_ms,'Future data included in entry feature')
            trades.append(one);all_deals.append(one)
            if feat['trend']=='insufficient_history':skipped['trend_not_enough_history']+=1
            if feat['volatility']=='insufficient_history':skipped['volatility_not_enough_history']+=1
        proofs.append({'quarter':months[0]+'..'+months[-1],**proof,'trades_verified':len(trades)})
        quarters.append({'period':months[0]+'..'+months[-1], 'trades':len(trades),
                         'profit_usdt':round(sum(x['pnl_usdt'] for x in trades),5),
                         'reference_same_slots_usdt':round(sum(x['matched_basket_usdt'] for x in trades),5),
                         'drawdown_usdt':primary['drawdown_usdt'],'drawdown_pct':primary['drawdown_pct'],
                         'market_groups':breakdown(trades,'trend')})
    summary={
      'schema':'erith.trader.radar20.regime-diagnostic.v1',
      'status':'EXPLORATORY_RETROSPECTIVE_NO_SIGNALS',
      'periods':quarters,'source_integrity':proofs,'total_trades':len(all_deals),
      'total_win_trades':sum(x['winning_trade'] for x in all_deals),
      'grouped_by':{field:breakdown(all_deals,field) for field in ['quarter','month','pair','trend','volatility','pressure','volume_band']},
      'grouped_by_quarter_trend':breakdown([{**x,'quarter_trend':x['quarter']+' | '+x['trend']} for x in all_deals],'quarter_trend'),
      'grouped_by_quarter_volatility':breakdown([{**x,'quarter_volatility':x['quarter']+' | '+x['volatility']} for x in all_deals],'quarter_volatility'),
      'unknown_features':dict(skipped),
      'method':{
        'rules_not_changed':'BUY >=50% taker pressure, prior-hour volume above previous 24 hourly median, entry next hourly open, hold 48h, 400 USDT initial each quarter, 100 USDT ticket, maximum 4 simultaneous, 0.8% roundtrip cost',
        'trend':'At signal close h-1: median of the 20 assets 72h trailing close/close return; down <= -3%; up >= +3%; else sideways',
        'volatility':'At signal close h-1: std of 20-asset equal-weight log hourly return over prior 24h, high if >= 1.5 times std of earlier 168 hours; first 193h unknown',
        'volume':'Signal-hour asset quote-volume relative to the MEDIAN of preceding 24 closed hours; bands 1-1.5x, 1.5-2x, >=2x',
        'pressure':'Signal-hour Binance Spot taker buy share; bands 50-55%, 55-60%, >=60%',
        'ex_post_groups_are_descriptive':True,
        'features_only_use_information_known_before_entry':True,
        'no_model_fitting_or_filter_applied':True,
        'separate_quarters_reset_capital':True,
        'hypotheses_are_not_causal':True},
      'warnings':['The two portfolios each begin with 400 USDT; combined trade PnL is not a single six-month shared-capital portfolio.',
                  'Grouping rules were defined for diagnosis after seeing outcomes; they are NOT tested trading filters. Comparing groups without a fresh sample risks selection bias.',
                  'Original 20 assets were selected with information available after some historical dates (survivorship / lookahead selection bias).',
                  'Binance Spot USDT history is not OKX European fills; 0.8% is an assumption, no observed spreads/slippage/min-order compliance.',
                  'Equal-slot 20-asset basket is a theoretical comparator, not an independently executable portfolio.',
                  'Taker buy share records aggressor direction, NOT cash entering exchange or future price direction.',
                  'No live signal, no orders and no profitability certification.'],
      'orders_enabled':False,'strategy_certified':False,
    }
    return summary,all_deals


def main():
    p=argparse.ArgumentParser()
    p.add_argument('--data-root',type=Path,default=Path(__file__).resolve().parents[1]/'data'/'trader_flux')
    p.add_argument('--out',type=Path,required=True)
    a=p.parse_args()
    summary,trades=evaluate(a.data_root)
    a.out.mkdir(parents=True,exist_ok=True)
    d=(a.out/'summary.json');d.write_bytes(canonical(summary))
    e=(a.out/'annotated_trades.json');e.write_bytes(canonical({'schema':summary['schema']+'.trades','orders_enabled':False,'trades':trades}))
    idx={'schema':summary['schema']+'.index','sources':summary['source_integrity'],
         'data':[{'file':file.name,'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'bytes':file.stat().st_size} for file in (d,e)],
         'orders_enabled':False,'strategy_certified':False}
    (a.out/'index.json').write_bytes(canonical(idx))
    print(json.dumps({'status':'PASS','trades':summary['total_trades'],'period_pnl_usdt':[q['profit_usdt'] for q in summary['periods']], 'output':str(a.out)}))

if __name__=='__main__':main()
