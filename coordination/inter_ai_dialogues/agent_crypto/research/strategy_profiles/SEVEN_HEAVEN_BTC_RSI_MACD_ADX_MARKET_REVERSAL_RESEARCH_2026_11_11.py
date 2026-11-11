#!/usr/bin/env python3
"""Seven Heaven: causal BTC reversal research with RSI, MACD, ADX, EMA, SuperTrend.

Uses only supplied original Binance Spot BTCUSDT 1m monthly ZIPs, SHA256
verification via the published Seven Heaven parsers. Runs daily-close signals
and hypothetical next UTC daily-open fills. Never places orders or uses keys.

Parameters declared before review of outcomes; exploratory historical research,
not independent forward validation. Only the 16 available months are examined.
"""
import csv, json, datetime as dt, math, hashlib
from pathlib import Path
import numpy as np
import importlib.util

HERE=Path(__file__).resolve().parent
STEM='SEVEN_HEAVEN_BTC_RSI_MACD_ADX_MARKET_REVERSAL_RESEARCH_2026_11_11'
REVSRC=HERE/'SEVEN_HEAVEN_BTC_REVERSAL_LATENCY_EMA_SUPERTREND_VOLATILITY_2026_11_11.py'
spec=importlib.util.spec_from_file_location('sh_previous_reversal',REVSRC)
rev=importlib.util.module_from_spec(spec); spec.loader.exec_module(rev)
BASE=rev.prior
CAPITAL=1000.
BEGIN_DAY=31  # Jan used solely as warm-up, earliest actual trades Feb 1 UTC
FEE=.001; SLIP=.0005
STRATEGIES=('BUY_HOLD','EMA10_30','SUPERTREND_ATR14_X3','RSI14_50','MACD_12_26_9','ADX14_DI_20','TWO_OF_THREE')

def name_day(ms):return dt.datetime.fromtimestamp(float(ms)/1000,dt.timezone.utc).strftime('%Y-%m-%d')

def ema(values,n):
    a=2/(n+1);o=np.empty(len(values),dtype=float);o[0]=values[0]
    for i in range(1,len(values)):o[i]=a*values[i]+(1-a)*o[i-1]
    return o

def indicators(d):
    """Daily OHLC with causal Wilder RSI14, Wilder ADX14/+DI/-DI and MACD 12/26/9.

    Wilder RSI seed: 14 differences at position 14. ADX first computed at
    position 27 from 14 consecutive DX values indices 14..27.
    MACD signal exponential begins on day 1; 31 days used to warm up.
    """
    high=d[:,2];low=d[:,3];cl=d[:,4];n=len(d)
    rsi=np.full(n,np.nan); adx=np.full(n,np.nan);pdi=np.full(n,np.nan);mdi=np.full(n,np.nan)
    dif=np.diff(cl);gain=np.maximum(dif,0);loss=np.maximum(-dif,0)
    if n>=15:
        ag=float(np.mean(gain[:14]));al=float(np.mean(loss[:14]))
        for i in range(14,n):
            if i>14:
                ag=(ag*13+gain[i-1])/14;al=(al*13+loss[i-1])/14
            rsi[i]=50. if ag==0 and al==0 else (100. if al==0 else 100-100/(1+ag/al))
    tr=np.zeros(n);pdm=np.zeros(n);mdm=np.zeros(n)
    for i in range(1,n):
        up=high[i]-high[i-1];dn=low[i-1]-low[i]
        pdm[i]=up if up>dn and up>0 else 0
        mdm[i]=dn if dn>up and dn>0 else 0
        tr[i]=max(high[i]-low[i], abs(high[i]-cl[i-1]),abs(low[i]-cl[i-1]))
    tr[0]=high[0]-low[0]
    dx=np.full(n,np.nan);atr14=np.full(n,np.nan)
    if n>=28:
        t14=float(np.sum(tr[1:15]));p14=float(np.sum(pdm[1:15]));m14=float(np.sum(mdm[1:15]))
        for i in range(14,n):
            if i>14:
                t14=t14-t14/14+tr[i]
                p14=p14-p14/14+pdm[i]
                m14=m14-m14/14+mdm[i]
            atr14[i]=t14/14
            pdi[i]=100*p14/t14 if t14 else 0
            mdi[i]=100*m14/t14 if t14 else 0
            den=pdi[i]+mdi[i]
            dx[i]=100*abs(pdi[i]-mdi[i])/den if den else 0
            if i==27: adx[i]=float(np.mean(dx[14:28]))
            elif i>27: adx[i]=(adx[i-1]*13+dx[i])/14
    m=ema(cl,12)-ema(cl,26); ms=ema(m,9);hist=m-ms
    prev=BASE.lagged_features(d)
    return {'rsi14':rsi,'macd':m,'macd_signal':ms,'macd_hist':hist,
            'adx14':adx,'pdi14':pdi,'mdi14':mdi,'atr14':atr14,
            'atr_pct':100*atr14/cl,
            'ema10':prev['ema10'],'ema30':prev['ema30'],'supertrend_bull':prev['st_trend']>0}

def states(d,f):
    cl=d[:,4];ema_b=(f['ema10']>f['ema30'])&(cl>f['ema30']);st=f['supertrend_bull']
    macd=(f['macd_hist']>0)&(f['macd']>0)
    rsi=f['rsi14']>=50
    adx=(f['adx14']>=20)&(f['pdi14']>f['mdi14'])
    two=(ema_b.astype(int)+macd.astype(int)+adx.astype(int))>=2
    return {'BUY_HOLD':np.ones(len(d),bool),'EMA10_30':ema_b,'SUPERTREND_ATR14_X3':st,
            'RSI14_50':rsi,'MACD_12_26_9':macd,'ADX14_DI_20':adx,'TWO_OF_THREE':two}

def simulate(d,st,cost_factor=1):
    buyfac=(1-FEE*cost_factor)/(1+SLIP*cost_factor)
    sellfac=(1-FEE*cost_factor)*(1-SLIP*cost_factor)
    cash=CAPITAL;btc=0.;peak=CAPITAL;worst=0.;exposed=0;trades=[];daily=[]
    open_longs=[];current_entry=None
    for i in range(BEGIN_DAY,len(d)):
        t=name_day(d[i,0]);prevday=name_day(d[i-1,0]);want=bool(st[i-1]);price=float(d[i,1]);close=float(d[i,4])
        if want and btc==0:
            btc=cash*buyfac/price;cash=0.;current_entry=i
            trades.append({'date_utc':t,'signal_date_utc':prevday,'side':'BUY','open_usdt':round(price,4)})
        elif not want and btc>0:
            cash=btc*price*sellfac;btc=0.;open_longs.append(i-current_entry);current_entry=None
            trades.append({'date_utc':t,'signal_date_utc':prevday,'side':'SELL','open_usdt':round(price,4)})
        if btc:exposed+=1
        net=cash+btc*close*sellfac
        peak=max(peak,net);worst=min(worst,100*(net/peak-1))
        daily.append({'date_utc':t,'equity_usdt':round(net,6),'holding_btc':int(btc>0)})
    if current_entry is not None:open_longs.append(len(d)-current_entry)
    net=daily[-1]['equity_usdt'];ntr=len(trades)
    return {'final_equity_usdt':round(net,6),'net_return_pct':round(100*(net/CAPITAL-1),4),
            'max_close_to_close_drawdown_pct':round(worst,4),'exposure_days':exposed,'days':len(daily),
            'buys':sum(t['side']=='BUY' for t in trades),'sells':sum(t['side']=='SELL' for t in trades),
            'total_trades':ntr,'long_intervals_under_4_days':sum(x<4 for x in open_longs),
            'trade_ledger':trades,'daily':daily}

def events(d,signals,features):
    """Non-overlapping 10% rolling-30d close drawdown episodes; persistence label
    uses the NEXT 14 days solely in retrospective evaluation (never signals)."""
    _,dd=rev.rolling30_drawdown(d);cl=d[:,4];done=[];armed=True
    for i in range(BEGIN_DAY,len(d)):
        if armed and dd[i]<=-10:
            peak_lo=max(0,i-29);p=peak_lo+int(np.argmax(cl[peak_lo:i+1]));peak=float(cl[p]);
            future=i+14
            ev={'date_utc':name_day(d[i,0]),'peak_utc':name_day(d[p,0]),
                'drawdown_at_event_pct':round(float(dd[i]),3),'days_to_threshold':i-p,
                'after_14d_status':('CENSORED' if future>=len(d) else ('PERSISTENT' if cl[future]/peak-1<=-.05 else 'RECOVERED')),
                'after_14d_change_vs_event_pct':None if future>=len(d) else round(100*(cl[future]/cl[i]-1),3),
                'indicators':{}}
            for nm in STRATEGIES[1:]:
                sig=signals[nm];off=not bool(sig[i]);later=next((k for k in range(i+1,min(len(d),i+31)) if not sig[k]),None)
                ev['indicators'][nm]={'already_risk_off_at_event_close':off,
                  'days_to_first_later_off_signal':0 if off else (None if later is None else later-i),
                  'change_before_later_exit_signal_pct':None if off or later is None else round(100*(cl[later]/cl[i]-1),3)}
            done.append(ev);armed=False
        elif not armed and dd[i]>-5:armed=True
    return done

def prefix_checks(d,full,indices):
    n=0
    for k in indices:
        if k<35 or k>=len(d):continue
        f=indicators(d[:k+1]);st=states(d[:k+1],f)
        for nm in STRATEGIES:
            assert bool(st[nm][-1])==bool(full[nm][k]),('future-leak',nm,k)
            n+=1
    return n

def run():
    sample,sources=rev.read_all()
    byyear={};equity_rows=[];event_rows=[];source_shas={}
    for source in sources:
        source_shas[source['month']]=source
    for year,d in sample.items():
        assert (len(d)==91 if year=='2024' else len(d)==90 if year=='2025' else len(d)==304)
        f=indicators(d);s=states(d,f)
        checks=prefix_checks(d,s,[35,39,45,50,60,75,89,120,180,220,280,len(d)-1])
        out={x:simulate(d,s[x]) for x in STRATEGIES}
        stress={x:simulate(d,s[x],2) for x in STRATEGIES}
        ev=events(d,s,f)
        for name in STRATEGIES:
            for a in out[name]['daily']:equity_rows.append({'year':year,'method':name,**a})
        for e in ev:
            event_rows.append({'year':year,'date_utc':e['date_utc'],'peak_utc':e['peak_utc'],
              'drawdown_at_event_pct':e['drawdown_at_event_pct'],'after_14d_status':e['after_14d_status'],
              'after_14d_change_vs_event_pct':e['after_14d_change_vs_event_pct'],
              'EMA_off':int(e['indicators']['EMA10_30']['already_risk_off_at_event_close']),
              'MACD_off':int(e['indicators']['MACD_12_26_9']['already_risk_off_at_event_close']),
              'RSI_off':int(e['indicators']['RSI14_50']['already_risk_off_at_event_close']),
              'ADX_off':int(e['indicators']['ADX14_DI_20']['already_risk_off_at_event_close'])})
        # Record daily features for audit of model input and false signals
        indicators_rows=[]
        for i in range(BEGIN_DAY,len(d)):
            row={'date_utc':name_day(d[i,0]),'close_usdt':round(float(d[i,4]),5),
                 'rsi14':round(float(f['rsi14'][i]),4),'macd_hist':round(float(f['macd_hist'][i]),4),
                 'adx14':round(float(f['adx14'][i]),4),'di_plus':round(float(f['pdi14'][i]),4),
                 'di_minus':round(float(f['mdi14'][i]),4),'atr_pct':round(float(f['atr_pct'][i]),4)}
            indicators_rows.append(row)
        byyear[year]={'sample_start':name_day(d[BEGIN_DAY,0]),'sample_end':name_day(d[-1,0]),
            'verified_daily_bars':len(d),'trade_days':len(d)-BEGIN_DAY,
            'prefix_invariance_checks':checks,'returns':{x:{k:v for k,v in out[x].items() if k not in ('daily','trade_ledger')} for x in STRATEGIES},
            'stress_results':{x:{k:v for k,v in stress[x].items() if k not in ('daily','trade_ledger')} for x in STRATEGIES},
            'events':ev,'transaction_ledgers':{x:out[x]['trade_ledger'] for x in STRATEGIES},
            'indicator_daily':indicators_rows}
        print('CALCULATED',year,'bars',len(d),'checks',checks,'events',len(ev),flush=True)
        for method in STRATEGIES:print(' ',method,out[method]['net_return_pct'],out[method]['max_close_to_close_drawdown_pct'],'trades',out[method]['total_trades'],flush=True)
    out={'schema':'seven.heaven.btc.daily-reversal-rsi-macd-adx-v1',
        'study_date':'2026-11-11','read_only':True,'no_real_orders':True,
        'minute_source':'16 supplied Binance BTCUSDT 1m ZIPs 2024Q1, 2025Q1, 2026 Jan-Oct',
        'reference_source_registry':'GitHub public monthly archive registry; verified against archived SHA in reference parsers',
        'total_minute_bars_verified':sum(x['minute_candles_verified'] for x in sources),
        'source_verification':source_shas,
        'protocol':{'daily_signal':'evaluate after UTC close D; trade at D+1 UTC open',
           'entry':'100% BTC when risk on, otherwise 100% cash',
           'warmup':'first 31 calendar days of January 2024/25/26, portfolios start Feb 1 with 1000 USDT',
           'costs':{'fee_per_side':FEE,'slip_per_side':SLIP,'stress_factor':2},
           'parameters':['RSI Wilder 14 bullish RSI>=50','MACD EMA12-EMA26, signal EMA9, bullish histogram>0 and MACD>0','ADX Wilder 14 bullish ADX>=20 and +DI>-DI',
              'two-of-three EMA10/30, MACD, ADX; no weight tuning',
              'SuperTrend and EMA10/30 reused from preceding canonical study'],
           'event':'first 10% close-to-close drop from rolling 30d closing max; repeat after recovery above -5%; NEXT 14 days used ONLY for hindsight labeling',
           'trade_fill':'fictional next open, fees and slippage; no book/slippage/tax validation',
           'caveat':'thresholds chosen as fixed education rules, uncalibrated, studies retrospective and NOT prospectively validated'},
        'results':byyear}
    report=build_report(out)
    (HERE/(STEM+'_PROOFS.json')).write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    with (HERE/(STEM+'_EQUITY_DAILY.csv')).open('w',newline='',encoding='utf-8') as fp:
        w=csv.DictWriter(fp,fieldnames=['year','method','date_utc','equity_usdt','holding_btc']);w.writeheader();w.writerows(equity_rows)
    with (HERE/(STEM+'_DRAWDOWN_EVENTS.csv')).open('w',newline='',encoding='utf-8') as fp:
        w=csv.DictWriter(fp,fieldnames=['year','date_utc','peak_utc','drawdown_at_event_pct','after_14d_status','after_14d_change_vs_event_pct','EMA_off','MACD_off','RSI_off','ADX_off']);w.writeheader();w.writerows(event_rows)
    (HERE/(STEM+'_REPORT.md')).write_text(report,encoding='utf-8')
    print('COMPLETE',STEM,flush=True)

def build_report(doc):
    results=doc['results'];lines=['# Seven Heaven — Distinguer le repli et le retournement : RSI / MACD / ADX / ATR',
    '', '**Date :** 11 novembre 2026  ', '**Mode :** recherche historique, 100 % PAPER, lecture seule, aucune exécution réelle.',
    '', '## Périmètre de vérité', '',
    '- 16 archives ZIP originales BTCUSDT Binance Spot à la minute (2024 T1, 2025 T1, 2026 janvier–octobre), chaque SHA-256 vérifié ; 698 400 bougies vérifiées sans interruption à l’intérieur de chaque période.',
    '- Signaux évalués sur la dernière **journée UTC clôturée**, achat/vente **fictifs à l’ouverture suivante**, jamais sur la clôture ayant déclenché le signal.',
    '- Janvier sert de chauffage. Trois simulations distinctes démarrent au 1er février avec 1 000 USDT, sans apport en cours de période.',
    '- Coût simulé par opération : frais 0,10 % par côté et glissement 0,05 % ; contrôle de sensibilité avec frais et glissement doublés.',
    '- Les réglages RSI14, MACD12/26/9, ADX14 seuil 20, EMA10/30, SuperTrend ATR14 ×3 et consensus 2/3 sont documentés dans le code. Aucun réglage optimisé sur les rendements observés.',
    '', '## Rendements nets des portefeuilles fictifs', '',
    '| Méthode | Fév.–mars 2024 | Fév.–mars 2025 | Fév.–oct. 2026 |',
    '|---|---:|---:|---:|']
    for name in STRATEGIES:
        v=[results[y]['returns'][name]['net_return_pct'] for y in ('2024','2025','2026')]
        lines.append('| '+name+' | '+' | '.join(f'{x:+.2f} %' for x in v)+' |')
    lines+=['','## Dégradation des rendements lorsque les coûts doublent','','| Méthode | 2024 | 2025 | 2026 |','|---|---:|---:|---:|']
    for name in STRATEGIES:
        v=[results[y]['stress_results'][name]['net_return_pct'] for y in ('2024','2025','2026')]
        lines.append('| '+name+' | '+' | '.join(f'{x:+.2f} %' for x in v)+' |')
    lines+=['','## Risque, fréquence des ordres et pertes transitoires', '',
       '| Période | Stratégie | Drawdown quotidien maximum | Opérations fictives | Exposition BTC (jours) | Intervalles longs moins de 4 jours |',
       '|---|---|---:|---:|---:|---:|']
    for y in ('2024','2025','2026'):
        for name in STRATEGIES:
            a=results[y]['returns'][name];lines.append(f'| {y} | {name} | {a["max_close_to_close_drawdown_pct"]:.2f} % | {a["total_trades"]} | {a["exposure_days"]}/{a["days"]} | {a["long_intervals_under_4_days"]} |')
    lines+=['','## Mesurer le repli et le retournement', '',
    'Une **baisse de 10 % depuis le plus haut de clôture des 30 jours précédents** sert ici de marqueur d’épisode, pas de prédicteur. Pour qualifier rétrospectivement un épisode de **persistant**, le prix doit encore être à au moins 5 % sous son sommet de référence 14 jours plus tard. En cas de fin de série, l’épisode est indiqué « CENSORED » plutôt que de deviner la suite.',
    '', 'Ce label utilise les prix FUTURS uniquement pour **évaluer a posteriori**. Aucune stratégie de ce rapport ne peut lire cette étiquette.',
    '','| Année | Date seuil −10 % | Repli 14 jours après | EMA déjà en liquidités | MACD déjà en liquidités | RSI déjà en liquidités | ADX déjà en liquidités |',
    '|---|---|---|---|---|---|---|']
    for y in ('2024','2025','2026'):
        for e in results[y]['events']:
            z=e['indicators'];fmt=lambda x:'oui' if z[x]['already_risk_off_at_event_close'] else 'non'
            lines.append('| '+y+' | '+e['date_utc']+' | '+e['after_14d_status']+' | '+fmt('EMA10_30')+' | '+fmt('MACD_12_26_9')+' | '+fmt('RSI14_50')+' | '+fmt('ADX14_DI_20')+' |')
    lines+=['','## Contrôles, interprétation et limites', '',
       '- Les prix historiques, la rentabilité fictive et les épisodes de baisse sont des résultats descriptifs, non des probabilités de gains futurs.',
       '- L’ADX exprime la force d’une tendance, **pas sa direction** : ici, +DI et −DI définissent le sens ; l’ATR exprime l’amplitude, **pas une prévision**.',
       '- Les indicateurs plus rapides peuvent sortir tôt, mais peuvent multiplier les faux signaux et les frais. Les filtres lents peuvent protéger contre le bruit, mais leur retard coûte pendant une chute brutale.',
       '- Périodes non synchrones et courtes pour 2024–2025 ; aucune preuve statistique de supériorité, aucun test prospectif en conditions OKX.',
       '- Les prix sont Binance BTCUSDT, non OKX BTCUSDC. Pas de carnet, file d’attente, liquidité disponible, contraintes de lot, fiscalité ni frais réels du compte.',
       '- L’étude ne modifie ni Administrator, Trader, Operator, Market Core, Bridge ou stratégie en service.',
       '- Preuves : '+STEM+'_PROOFS.json ; séries '+STEM+'_EQUITY_DAILY.csv et épisodes '+STEM+'_DRAWDOWN_EVENTS.csv ; script '+STEM+'.py',
       '', '## Arrêt de recherche', '',
       'Décision : ne pas déclarer de règle gagnante ; le prochain vrai test serait une validation sur des mois ultérieurs encore non étudiés, en conservant les mêmes seuils **sans optimisation**. Aucun ordre, aucune action sur l’interface.', '']
    return '\n'.join(lines)

if __name__=='__main__':run()
