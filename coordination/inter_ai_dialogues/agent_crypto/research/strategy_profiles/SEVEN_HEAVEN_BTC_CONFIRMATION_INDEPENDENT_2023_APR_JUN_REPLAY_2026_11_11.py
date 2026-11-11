#!/usr/bin/env python3
"""Seven Heaven: genuine held-out April-June 2023 Bitcoin confirmation study.

FROZEN BEFORE 2023 DATA were supplied:
SEVEN_HEAVEN_BTC_CONFIRMATION_INDEPENDENT_2023_APR_JUN_FROZEN_PROTOCOL_2026_11_11.md
This exact test period and indicator parameters are not selected from 2023 returns.

Three SHA-verified native Binance BTCUSDT minute ZIPs; April = 30-day
initialization (no trade), May-June = 61-day PAPER period. Every signal after
UTC close D; hypothetical fills at D+1 UTC open, no real order/API/account.

Dependencies in the same directory: the already published research scripts
SEVEN_HEAVEN_SPOT_GRID_BTC_2024_2025_Q1_CONTINUOUS_REPLAY_2026_11_11.py
SEVEN_HEAVEN_EMA_SUPERTREND_VOLATILITY_GRID_HOLD_REGIME_STUDY_2026_11_11.py
SEVEN_HEAVEN_BTC_REVERSAL_LATENCY_EMA_SUPERTREND_VOLATILITY_2026_11_11.py
SEVEN_HEAVEN_BTC_RSI_MACD_ADX_MARKET_REVERSAL_RESEARCH_2026_11_11.py
SEVEN_HEAVEN_BTC_REVERSAL_CONFIRMATION_FALSE_SIGNALS_CASH_COST_2026_11_11.py
Dependencies use numpy and numba. Data ZIPs are sourced from GitHub Releases
and expected in --zip-dir (default script directory). No binary archives in Git.
"""
from __future__ import annotations
import argparse,calendar,csv,datetime as dt,hashlib,importlib.util,json,math
from pathlib import Path
import numpy as np

HERE=Path(__file__).resolve().parent
STEM='SEVEN_HEAVEN_BTC_CONFIRMATION_INDEPENDENT_2023_APR_JUN_REPLAY_2026_11_11'
EXPECTED={
    '2023-04':'c71baedea84f9fc1a0ad297b383505b1cb84c0a7fc111caa149aa6fb2defa5da',
    '2023-05':'c83bd079dc67b9e542d07fe9491f8b1bf513185d6d7cc4ce17710f21c8d0037b',
    '2023-06':'d8cf5d1817fa1d8cba8eaf4d189614cf05b15d7233e9e29a0156d2dee2cfaad1',
}
WARMUP=30; CAPITAL=1000.; FEE=.001; SLIP=.0005
SIGNAL_BASE={'EMA':'EMA_RAW','SUPERTREND':'ST_RAW','CONSENSUS':'CONSENSUS_RAW'}

def loadmodule(name):
    path=HERE/name
    assert path.is_file(), 'Missing canonical script '+str(path)
    s=importlib.util.spec_from_file_location('seven_2023_'+name.replace('.','_'),path)
    m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
    return m

def datestr(ms):return dt.datetime.fromtimestamp(float(ms)/1000,dt.timezone.utc).date().isoformat()

def raw_sha(path):
    h=hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda:f.read(1024*1024),b''): h.update(chunk)
    return h.hexdigest()

def get_daily(zipdir,grid,ema):
    parts=[];verified=[]
    for m,sha in EXPECTED.items():
        path=zipdir/f'BTCUSDT-1m-{m}.zip'
        assert path.is_file(), 'Missing ZIP '+str(path)
        digest=raw_sha(path)
        assert sha==digest, f'Frozen SHA mismatch {m}'
        yy,mm=map(int,m.split('-')); n=calendar.monthrange(yy,mm)[1]*1440
        grid.EXPECTED[m]=(sha,n)
        # Existing canonical parser checks exact minute timestamps, OHLC
        # consistency, 12 CSV columns, native ZIP member and decimal values.
        # It expects files adjacent to its source: scripts/ZIPs in zipdir.
        assert Path(grid.ROOT).resolve()==zipdir.resolve(), 'Place scripts and ZIP in the same directory'
        a,meta=grid.load_month(m)
        assert a.shape==(n,5)
        assert meta['sha256_verified']==sha and meta['minute_candles_verified']==n
        verified.append(meta);parts.append(a)
        print('ARCHIVE_SHA_OK',m,n,sha,flush=True)
    a=np.concatenate(parts)
    assert a.shape==(131040,5)
    assert np.all(np.diff(a[:,0])==60000), 'Missing/duplicated minute across months'
    assert datestr(a[0,0])=='2023-04-01' and datestr(a[-1,0])=='2023-06-30'
    d=ema.daily_candles(a)
    assert d.shape==(91,5), '30 warm-up days + 61 evaluation days required'
    assert datestr(d[29,0])=='2023-04-30' and datestr(d[30,0])=='2023-05-01'
    assert datestr(d[-1,0])=='2023-06-30'
    for i in range(len(d)):
        idx=i*1440
        assert d[i,0]==a[idx,0] and d[i,1]==a[idx,1] and d[i,4]==a[idx+1439,4]
        assert abs(d[i,2]-np.max(a[idx:idx+1440,2]))<1e-8
        assert abs(d[i,3]-np.min(a[idx:idx+1440,3]))<1e-8
    print('CONTIGUOUS_1M_AND_DAILY_OHLC_OK',len(a),'minutes',len(d),'days',flush=True)
    return d,verified

def independently_ledger(d,trades,cost_factor):
    """Second accounting implementation crosschecks original portfolio engine."""
    bf=(1-FEE*cost_factor)/(1+SLIP*cost_factor)
    sf=(1-FEE*cost_factor)*(1-SLIP*cost_factor)
    cash=CAPITAL;btc=0.;trbydate={t['date_utc']:t for t in trades}
    values=[]
    for i in range(WARMUP,len(d)):
        day=datestr(d[i,0]);t=trbydate.get(day)
        if t:
            if t['side']=='BUY':
                assert btc==0 and cash>0;btc=cash*bf/d[i,1];cash=0.
            else:
                assert cash==0 and btc>0;cash=btc*d[i,1]*sf;btc=0.
        values.append(cash+btc*d[i,4]*sf)
    return np.asarray(values),cash,btc

def sale_events(d,trades):
    lookup={datestr(row[0]):i for i,row in enumerate(d)};ret=[]
    for t in trades:
        if t['side']!='SELL':continue
        i=lookup[t['date_utc']];j=i+7;price=float(d[i,1])
        if j>=len(d):
            ret.append(dict(sale_date=t['date_utc'],sale_open_usdt=round(price,5),
                            day7_date='',btc_change_pct='',status='CENSORED',reentry_7d=False))
        else:
            pct=100*(float(d[j,4])/price-1)
            label='BTC_UP_GE_3PCT' if pct>=3 else ('BTC_DOWN_LE_MINUS_3PCT' if pct<=-3 else 'NEUTRAL')
            ret.append(dict(sale_date=t['date_utc'],sale_open_usdt=round(price,5),
                day7_date=datestr(d[j,0]),btc_change_pct=round(pct,4),status=label,
                reentry_7d=any(z['side']=='BUY' and i<lookup[z['date_utc']]<=j for z in trades)))
    return ret

def test_prefix_states(d,old):
    allraw=old.signals(d);full={}
    for f,base in SIGNAL_BASE.items():
        for k in (1,2,3):full[f+'_C'+str(k)]=old.confirm(allraw[base],k,k)
    checks=0
    for idx in (29,30,31,32,33,35,39,44,49,55,65,75,84,90):
        prefix=old.signals(d[:idx+1])
        for f,base in SIGNAL_BASE.items():
            for k in (1,2,3):
                calc=old.confirm(prefix[base],k,k)
                assert bool(calc[-1])==bool(full[f+'_C'+str(k)][idx]),('LOOKAHEAD',idx,f,k)
                checks+=1
    # Cross-check N consecutive states really wait appropriately.
    pattern=np.array([0,1,1,0,1,1,1,0,0],dtype=bool)
    assert old.confirm(pattern,2,2).tolist()==[False,False,True,True,True,True,True,True,False]
    assert old.confirm(pattern,3,1).tolist()==[False,False,False,False,False,False,True,False,False]
    return full,checks+2

def export(path,rows,fields):
    with path.open('w',encoding='utf-8',newline='') as fp:
        writer=csv.DictWriter(fp,fieldnames=fields,extrasaction='ignore')
        writer.writeheader();writer.writerows(rows)

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--zip-dir',default=str(HERE),help='Directory holding 2023 ZIPs and installed study .py scripts')
    args=parser.parse_args();zipdir=Path(args.zip_dir)
    ema=loadmodule('SEVEN_HEAVEN_EMA_SUPERTREND_VOLATILITY_GRID_HOLD_REGIME_STUDY_2026_11_11.py')
    old=loadmodule('SEVEN_HEAVEN_BTC_REVERSAL_CONFIRMATION_FALSE_SIGNALS_CASH_COST_2026_11_11.py')
    rawsim=old.prev
    grid=ema.grid
    # Only change the warm-up LENGTH to account for 30-day April, as required
    # by frozen protocol; no thresholds, formulas or costs change.
    rawsim.BEGIN_DAY=WARMUP
    old.WARMUP_DAYS=WARMUP
    d,archives=get_daily(zipdir,grid,ema)
    states,checks=test_prefix_states(d,old)
    states['HOLD_BTC']=np.ones(len(d),dtype=bool)
    curves=[];cashrows=[];salesrows=[];summaries={};trade_ledger={}
    for name,state in states.items():
        sim=rawsim.simulate(d,state)
        stress=rawsim.simulate(d,state,2)
        assert len(sim['daily'])==61 and sim['days']==61
        if name!='HOLD_BTC':
            cash=old.cash_windows(d,sim)
        else:cash=old.cash_windows(d,sim)
        sold=sale_events(d,sim['trade_ledger'])
        measured,remaining_cash,remaining_btc=independently_ledger(d,sim['trade_ledger'],1)
        assert np.allclose([x['equity_usdt'] for x in sim['daily']],measured,atol=1e-5)
        assert abs(sim['final_equity_usdt']-measured[-1])<1e-5
        assert sum(t['side']=='BUY' for t in sim['trade_ledger'])==sim['buys']
        assert sum(t['side']=='SELL' for t in sim['trade_ledger'])==sim['sells']
        for t in sim['trade_ledger']:
            idx=next(i for i in range(WARMUP,len(d)) if datestr(d[i,0])==t['date_utc'])
            assert t['signal_date_utc']==datestr(d[idx-1,0]);assert state[idx-1]==(t['side']=='BUY')
        summary={
          'final_net_usdt':sim['final_equity_usdt'],'return_pct':sim['net_return_pct'],
          'daily_max_drawdown_pct':sim['max_close_to_close_drawdown_pct'],
          'costs_x2_return_pct':stress['net_return_pct'],'operations':sim['total_trades'],
          'buys':sim['buys'],'sells':sim['sells'],
          'cash_days':cash['cash_days'],'cash_share_pct':cash['cash_share_pct'],
          'initial_cash_days':cash['initial_cash_days'],
          'post_sale_cash_days':cash['post_sale_cash_days'],
          'whipsaws_7d':cash['short_cash_whipsaws_7d'],
          'short_cash_windows_with_price_rise':cash['short_cash_whipsaws_and_missed_rise'],
          'closed_cash_windows_with_btc_price_rise':cash['closed_cash_windows_ended_with_btc_rise'],
          'closed_cash_windows_with_btc_price_decline':cash['closed_cash_windows_ended_with_btc_drop'],
          'sale_7d_tags':{tag:sum(ev['status']==tag for ev in sold) for tag in ('BTC_UP_GE_3PCT','BTC_DOWN_LE_MINUS_3PCT','NEUTRAL','CENSORED')},
          'final_cash_usdt':round(remaining_cash,6),
          'final_btc_qty':round(remaining_btc,10),
        }
        summaries[name]=summary;trade_ledger[name]=sim['trade_ledger']
        for x in sim['daily']:curves.append(dict(policy=name,**x))
        for x in cash['windows']:cashrows.append(dict(policy=name,**x))
        for x in sold:salesrows.append(dict(policy=name,**x))
        print('PAPER',name,'net',summary['return_pct'],'costsX2',summary['costs_x2_return_pct'],
          'DD',summary['daily_max_drawdown_pct'],'trades',summary['operations'],
          'cash_days',summary['cash_days'],'whipsaws',summary['whipsaws_7d'],flush=True)
    assert len(curves)==10*61
    print('PREFIX_CAUSALITY_TESTS_PASSED',checks,flush=True)
    script_sha=hashlib.sha256((HERE/(STEM+'.py')).read_bytes()).hexdigest()
    proof=dict(schema='seven-heaven.btc-heldout-2023-q2-confirmation.v1',
      research_date_utc='2026-11-11',
      freeze_protocol='SEVEN_HEAVEN_BTC_CONFIRMATION_INDEPENDENT_2023_APR_JUN_FROZEN_PROTOCOL_2026_11_11.md',
      protocol_published_before_archive_receipt=True,
      source='Binance Spot BTCUSDT 1m, original releases SHA checked',
      archive_months=archives,verified_minutes=sum(x['minute_candles_verified'] for x in archives),
      validated_days=91,warmup_days=30,portfolio_days=61,
      first_portfolio_day='2023-05-01',last_portfolio_day='2023-06-30',
      capital_usdt=CAPITAL,fees_per_side=FEE,slippage_per_side=SLIP,
      stress_costs_multiplier=2,unit='USDT',no_real_orders=True,
      indicator_families=list(SIGNAL_BASE),confirmations=[1,2,3],
      trades='hypothetical: signal as of completed day D UTC, trade at D+1 opening',
      comparison='Buy & Hold 100% BTC',
      script_sha256=script_sha,causal_prefix_checks=checks,
      ledger_equity_crosschecked_for_all_policies=True,
      results=summaries,trade_ledgers=trade_ledger,
      limitations=['Only 61 trading days: not a statistically decisive general validation',
        'Binance BTCUSDT, not OKX BTCUSDC',
        'Assumed next-open fills, no live order book, taxes, exchange minimums or downtime',
        'Hindsight labels do not enter trading signals',
        'No data or thresholds retuned based on 2023 outcomes']);
    (HERE/(STEM+'_PROOFS.json')).write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    export(HERE/(STEM+'_EQUITY_DAILY.csv'),curves,['policy','date_utc','equity_usdt','holding_btc'])
    export(HERE/(STEM+'_CASH_WINDOWS.csv'),cashrows,
           ['policy','kind','start_day','end_day','exit_day','days','start_price','end_price','btc_price_change_pct','censored','short_cash_whipsaw','short_cash_missed_rally'])
    export(HERE/(STEM+'_SALES_7D.csv'),salesrows,
           ['policy','sale_date','sale_open_usdt','day7_date','btc_change_pct','status','reentry_7d'])
    report=['# Seven Heaven — Validation historique hors exploration : BTC 2023 Q2, confirmations C1 / C2 / C3','',
       '**11 novembre 2026 · PAPER uniquement · aucune connexion aux comptes ni ordre.**','',
       '## Protocole préenregistré et sources','',
       '- Règles gelées avant réception des données : `'+proof['freeze_protocol']+'`. Aucun nouveau seuil.',
       '- ZIP originaux Binance Spot BTC/USDT à la minute ; les trois SHA-256 coïncident exactement avec le protocole et le registre public.',
       '- 131 040 bougies 1m strictement consécutives / 91 jours UTC, OHLC journaliers reconstruits et contrôlés.',
       '- **Avril (30 jours) : chauffage des indicateurs, aucune opération. Mai–juin : 61 jours, capital de 1 000 USDT, pas de réinitialisation en juin.**',
       '- Politiques : EMA10/30 (avec clôture > EMA30), SuperTrend ATR14×3, consensus haussier si au moins 2/3 EMA/MACD12/26/9/ADX14≥20 +DI > −DI.',
       '- C1/C2/C3 : 1, 2 ou 3 clôtures consécutives, règle symétrique pour entrer/sortir, sans accès aux clôtures futures.',
       '- Achat/vente fictifs à l’ouverture du lendemain ; 0,10 % frais + 0,05 % glissement par côté et contrôle à coûts doublés ; valorisation nette des frais de liquidation.',
       '', '## Résultats nets, risques et faux allers-retours','',
       '| Portefeuille | Rendement net | Coûts ×2 | Baisse journalière max. | Opérations | Jours en cash | Allers-retours ≤7j |',
       '|---|---:|---:|---:|---:|---:|---:|']
    for name,s in summaries.items():
        report.append(f"| {name} | {s['return_pct']:+.2f} % | {s['costs_x2_return_pct']:+.2f} % | {s['daily_max_drawdown_pct']:+.2f} % | {s['operations']} | {s['cash_days']}/61 | {s['whipsaws_7d']} |")
    report+=['','## Sorties et étiquettes futures uniquement pour évaluer','',
       'À chaque vente hypothétique, l’étude marque ensuite (a posteriori) le prix BTC à la clôture sept jours plus tard : hausse ≥3 %, baisse ≤−3 %, neutre ou censuré. Un intervalle de cash commencé à la vente puis terminé à l’achat ≤7 jours est un aller-retour court. **Ces variations du prix ne sont ni des rendements de portefeuille ni un bénéfice réalisable.**','',
       '| Portefeuille | Sorties suivies de BTC +3 % | Sorties suivies de BTC −3 % | Neutres | Censurées |',
       '|---|---:|---:|---:|---:|']
    for name,s in summaries.items():
        tags=s['sale_7d_tags'];report.append(f"| {name} | {tags['BTC_UP_GE_3PCT']} | {tags['BTC_DOWN_LE_MINUS_3PCT']} | {tags['NEUTRAL']} | {tags['CENSORED']} |")
    report+=['','## Contrôles et lecture critique','',
       f"- **{checks} tests d’invariance des signaux par recalcul sur les préfixes**, avant toute décision future.",
       '- Empreintes, continuité à chaque minute et au passage de chaque mois, agrégats journaliers, ledger de positions et équité du portefeuille recoupés indépendamment.',
       '- Les politiques n’ont pas été adaptées aux rendements observés en 2023 : il s’agit d’une vraie fenêtre de contrôle post-figement, bien que rétrospective.',
       '- Un seul échantillon indépendant, seulement 61 jours, ne suffit pas pour proclamer une supériorité statistique.',
       '- Tous les coûts sont des hypothèses ; le carnet et les frais exacts du compte OKX ne sont pas simulés.',
       '', '## Passation inter-IA et reproduction','',
       f'- Source Python : `{STEM}.py` ; dépend des sources d’indicateurs et de parseur déjà publiées dans le même répertoire.',
       '- Lancer le script après avoir placé les trois ZIP 2023 dans le dossier des scripts ; aucune clé API requise.',
       f'- JSON structuré : `{STEM}_PROOFS.json`, courbe quotidienne `{STEM}_EQUITY_DAILY.csv`, cash `{STEM}_CASH_WINDOWS.csv`, événements de vente `{STEM}_SALES_7D.csv`.',
       '- Ne pas publier les ZIP de données dans Git main ; utiliser les GitHub Releases en contrôlant les empreintes.',
       '- Les liens vers le protocole figé et les preuves sont dans l’index de la bibliothèque.',
       '', '**Statut : étude PAPER, lecture seule. Aucun changement aux interfaces, Trader, Operator ou Bridge.**','']
    (HERE/(STEM+'_REPORT.md')).write_text('\n'.join(report),encoding='utf-8')
    print('STUDY_COMPLETE',STEM,flush=True)
    return proof

if __name__=='__main__':main()
