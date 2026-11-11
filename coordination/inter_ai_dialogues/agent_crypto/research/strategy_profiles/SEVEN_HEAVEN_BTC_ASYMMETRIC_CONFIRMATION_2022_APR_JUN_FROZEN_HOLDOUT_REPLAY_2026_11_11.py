#!/usr/bin/env python3
"""Frozen BTC 2022 Q2 independent historical audit: NO parameter tuning.

Requires 3 original Binance Spot BTCUSDT monthly 1m ZIPs and previous canonical
Seven Heaven Python source files in the SAME directory (same as existing replay).
No network, credentials, trades or modifications to production interfaces.
Use --selftest with a deterministic synthetic series without touching 2022 ZIPs.
"""
from __future__ import annotations
import argparse, csv, datetime as dt, hashlib, importlib.util, json
from pathlib import Path
import numpy as np

HERE=Path(__file__).resolve().parent
STEM='SEVEN_HEAVEN_BTC_ASYMMETRIC_CONFIRMATION_2022_APR_JUN_FROZEN_HOLDOUT_REPLAY_2026_11_11'
EXPECTED={
 '2022-04':('6e840c81076ac25e6acdbfe4aaeb7aa8b1895a70d8111a3c2908c5134072f097',43200),
 '2022-05':('154311f08aa264e233b0c7b472aa490c8cfd1b6083ba86cf6c18134e50536b89',44640),
 '2022-06':('0ced8899e9c3b2c098e1c5fc4993250bac22d8684d2d38404310351f35e32c0c',43200),
}
WARMUP=30
FAMILIES={'EMA':'EMA_RAW','SUPERTREND':'ST_RAW','CONSENSUS':'CONSENSUS_RAW'}
PAIRS=((1,1),(3,1),(1,3),(2,2))

def import_local(n):
    p=HERE/n
    assert p.is_file(),f'Missing canonical script: {p}'
    sp=importlib.util.spec_from_file_location('seven_2022_'+n.replace('.','_'),p)
    m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m)
    return m

def day(ms):return dt.datetime.fromtimestamp(float(ms)/1000,dt.timezone.utc).strftime('%Y-%m-%d')

def get_daily(zipdir,grid,ema):
    assert zipdir.resolve()==Path(grid.ROOT).resolve(), 'Pass ZIPs next to the canonical source scripts'
    chunks=[];meta=[]
    for month,(sha,n) in EXPECTED.items():
        grid.EXPECTED[month]=(sha,n)
        a,m=grid.load_month(month)  # SHA-256 / 12 cols / 1m timestamp / OHLC checks
        assert len(a)==n and m['sha256_verified']==sha
        chunks.append(a);meta.append(m)
        print('SHA256_VERIFIED',month,sha,n,flush=True)
    minute=np.concatenate(chunks)
    assert len(minute)==131040
    assert np.all(np.diff(minute[:,0])==60000)
    assert day(minute[0,0])=='2022-04-01' and day(minute[-1,0])=='2022-06-30'
    d=ema.daily_candles(minute)
    assert d.shape==(91,5)
    assert day(d[29,0])=='2022-04-30' and day(d[30,0])=='2022-05-01' and day(d[-1,0])=='2022-06-30'
    for i in range(91):
        part=minute[i*1440:(i+1)*1440]
        assert d[i,0]==part[0,0] and d[i,1]==part[0,1] and d[i,4]==part[-1,4]
        assert abs(d[i,2]-max(part[:,2]))<1e-8 and abs(d[i,3]-min(part[:,3]))<1e-8
    return d,meta

def signals(old,d):
    raw=old.signals(d)
    return {fam:{f'E{en}_S{ex}':old.confirm(raw[base],en,ex) for en,ex in PAIRS}
            for fam,base in FAMILIES.items()}

def checks(old,asym,d):
    n=0
    for end in (29,30,31,33,35,39,45,52,60,74,88,90):
        smaller=signals(old,d[:end+1])
        for fam in FAMILIES:
            for rule in smaller[fam]:
                assert bool(smaller[fam][rule][-1])==bool(asym[fam][rule][end]),('future leak',fam,rule,end)
                n+=1
    assert n==12*3*4
    return n

def ledger_verify(d,sim,mult):
    buyfac=(1-.001*mult)/(1+.0005*mult);sellfac=(1-.001*mult)*(1-.0005*mult)
    trade_map={t['date_utc']:t for t in sim['trade_ledger']}
    assert len(trade_map)==len(sim['trade_ledger'])
    cash=1000.;btc=0.;n=0
    for i in range(WARMUP,len(d)):
        name=day(d[i,0]);row=trade_map.get(name)
        if row:
            assert day(d[i-1,0])==row['signal_date_utc']
            if row['side']=='BUY':
                assert cash>0 and btc==0;btc=cash*buyfac/d[i,1];cash=0.
            else:
                assert btc>0 and cash==0;cash=btc*d[i,1]*sellfac;btc=0.
        value=cash+btc*d[i,4]*sellfac
        assert abs(value-sim['daily'][n]['equity_usdt'])<.00002
        n+=1
    assert n==61 and abs(value-sim['final_equity_usdt'])<.00002
    return n

def writecsv(name,rows,fields):
    with (HERE/name).open('w',newline='',encoding='utf-8') as f:
        w=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore');w.writeheader();w.writerows(rows)

def evaluate(d,old,meta,synthetic=False):
    # Canonical simulator has global WARMUP=31 for 2024-2026. April uses 30.
    old.prev.BEGIN_DAY=WARMUP
    old.WARMUP_DAYS=WARMUP
    asym=signals(old,d)
    causality=checks(old,asym,d)
    rows=[];daily=[];trades={};ledger=0
    for fam in FAMILIES:
        for en,ex in PAIRS:
            rule=f'E{en}_S{ex}';sig=asym[fam][rule]
            sim=old.prev.simulate(d,sig)
            stress=old.prev.simulate(d,sig,2)
            ledger+=ledger_verify(d,sim,1)
            ledger+=ledger_verify(d,stress,2)
            a=dict(family=fam,policy=rule,entry_closes=en,exit_closes=ex,
                final_equity_usdt=sim['final_equity_usdt'],return_net_pct=sim['net_return_pct'],
                stress2x_return_pct=stress['net_return_pct'],
                max_daily_drawdown_pct=sim['max_close_to_close_drawdown_pct'],
                trades=sim['total_trades'],btc_days=sim['exposure_days'],cash_days=61-sim['exposure_days'])
            rows.append(a);trades[f'{fam}_{rule}']=sim['trade_ledger']
            for rec in sim['daily']:daily.append(dict(family=fam,policy=rule,**rec))
    ones=np.ones(len(d),bool)
    h=old.prev.simulate(d,ones);h2=old.prev.simulate(d,ones,2)
    ledger+=ledger_verify(d,h,1)+ledger_verify(d,h2,2)
    hold=dict(family='BENCHMARK',policy='BUY_HOLD_BTC',entry_closes=1,exit_closes=0,
        final_equity_usdt=h['final_equity_usdt'],return_net_pct=h['net_return_pct'],
        stress2x_return_pct=h2['net_return_pct'],
        max_daily_drawdown_pct=h['max_close_to_close_drawdown_pct'],trades=h['total_trades'],
        btc_days=h['exposure_days'],cash_days=61-h['exposure_days'])
    rows.append(hold);trades['BENCHMARK_BUY_HOLD_BTC']=h['trade_ledger']
    for rec in h['daily']:daily.append(dict(family='BENCHMARK',policy='BUY_HOLD_BTC',**rec))
    assert len(rows)==13 and len(daily)==13*61 and ledger==13*61*2
    if synthetic:return dict(selftest_ok=True,causality_checks=causality,ledger_checks=ledger)
    source=(HERE/(STEM+'.py')).read_bytes()
    proof=dict(schema='seven-heaven.btc-2022-q2-frozen-asymmetric-holdout.v1',
        protocol='SEVEN_HEAVEN_BTC_ASYMMETRIC_CONFIRMATION_2022_APR_JUN_FROZEN_HOLDOUT_PROTOCOL_2026_11_11.md',
        protocol_frozen_prior_to_receipt=True,market='Binance BTCUSDT Spot native 1m',
        source_zip_checks=meta,minutes_verified=sum(z['minute_candles_verified'] for z in meta),
        warmup_days=30,portfolio_start_utc='2022-05-01',portfolio_end_utc='2022-06-30',portfolio_days=61,
        capital_usdt=1000,fee_side=0.001,slip_side=0.0005,cost_stress_factor=2,
        signal_day='D UTC completed close',trade_execution='hypothetical D+1 UTC open',
        causal_prefix_assertions=causality,independent_daily_ledger_checks=ledger,
        script_sha256=hashlib.sha256(source).hexdigest(),results=rows,trade_ledgers=trades,
        no_real_orders=True,no_parameter_refit=True,
        warnings=['Only one 61-day historical holdout; not prospective or statistical proof of robustness',
          'Simulated fills at open and costs, no orderbook or actual execution','Binance BTCUSDT differs from OKX BTCUSDC']);
    (HERE/(STEM+'_PROOFS.json')).write_text(json.dumps(proof,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    writecsv(STEM+'_RESULTS.csv',rows,list(rows[0]));writecsv(STEM+'_EQUITY_DAILY.csv',daily,list(daily[0]));
    lines=['# Seven Heaven — Validation historique 2022 Q2 des entrées/sorties BTC asymétriques','',
      '**Test rétrospectif figé avant accès aux cours. Binance Spot BTCUSDT, PAPER uniquement.**', '',
      '- Source : trois ZIP originaux SHA-256 vérifiés ; 131 040 minutes du 1er avril au 30 juin 2022.',
      '- Avril = chauffe seulement ; résultats du 1er mai au 30 juin, 61 jours continus, 1 000 USDT fictifs.',
      '- EMA10/30, SuperTrend ATR14×3, consensus EMA/MACD/ADX et Buy & Hold. Quatre règles E1/S1, E3/S1, E1/S3 et E2/S2, identiques au protocole prépublié.',
      '- Exécution fictive au prochain open UTC après signal clôturé; frais 0,10% et slippage 0,05% / côté.',
      '', '| Famille | Politique | Rendement | Coûts ×2 | Drawdown max | Transactions | Jours cash |',
      '|---|---|---:|---:|---:|---:|---:|']
    for x in rows:
        lines.append(f"| {x['family']} | {x['policy']} | {x['return_net_pct']:+.2f}% | {x['stress2x_return_pct']:+.2f}% | {x['max_daily_drawdown_pct']:.2f}% | {x['trades']} | {x['cash_days']} |")
    lines+=['','## Interprétation','',
      'Ce jeu de 61 jours constitue un historique inédit *dans cette ligne de recherche* mais ne transforme pas les simulations de transactions en exécutions réelles. Le gagnant du tableau ne peut pas être choisi a posteriori pour prétendre à une supériorité généralisable.',
      '',f'- Contrôles : {causality} préfixes causaux et {ledger} valorisations indépendantes (coûts normaux et doublés).',
      f'- Sources de preuve : `{STEM}_PROOFS.json`, `{STEM}_RESULTS.csv`, `{STEM}_EQUITY_DAILY.csv`, `{STEM}.py`.',
      '- Aucune modification du système de trading, aucune connexion OKX, aucun ordre réel.', '']
    (HERE/(STEM+'_REPORT.md')).write_text('\n'.join(lines),encoding='utf-8')
    return dict(minutes=proof['minutes_verified'],checks=causality,ledger=ledger,results=rows)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--zip-dir',default=str(HERE))
    ap.add_argument('--selftest',action='store_true',help='Use a deterministic synthetic 91-day OHLC series; do not read 2022 prices')
    args=ap.parse_args();folder=Path(args.zip_dir)
    em=import_local('SEVEN_HEAVEN_EMA_SUPERTREND_VOLATILITY_GRID_HOLD_REGIME_STUDY_2026_11_11.py')
    old=import_local('SEVEN_HEAVEN_BTC_REVERSAL_CONFIRMATION_FALSE_SIGNALS_CASH_COST_2026_11_11.py')
    if args.selftest:
        start=int(dt.datetime(2022,4,1,tzinfo=dt.timezone.utc).timestamp()*1000)
        d=np.empty((91,5),float)
        for i in range(91):
            price=30000+22*i+2200*np.sin(i*.17)+550*np.sin(i*.69)
            op=price-90;cl=price+75
            d[i]=(start+i*86400000,op,max(op,cl)+230,min(op,cl)-230,cl)
        print('SELFTEST (synthetic, not 2022 historical)',evaluate(d,old,[],True),flush=True)
        return
    grid=em.grid
    assert Path(grid.ROOT).resolve()==folder.resolve(), 'Place original ZIPs alongside the source scripts'
    d,meta=get_daily(folder,grid,em)
    print('HOLDOUT_COMPLETE',evaluate(d,old,meta),flush=True)

if __name__=='__main__':main()
