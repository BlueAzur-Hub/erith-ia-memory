#!/usr/bin/env python3
"""Seven Heaven -- reproducible BTC '3 daily closed candles' event audit.

RETROSPECTIVE, explanatory, PAPER ONLY. Reuses historical windows already
explored, not an independent holdout. Rules frozen in adjacent PROTOCOL.md
(commit 42c4be6) BEFORE script execution. No real orders or network calls.
Requires 22 original Binance BTCUSDT monthly 1m ZIPs and the canonical
SEVEN_HEAVEN_BTC_SIGNAL_DURABILITY_DELAY_COST_AUDIT_2026_11_11_PROOFS.json
in --zip-dir. Produces a report, JSON proof, events CSV, daily-features CSV.
"""
from __future__ import annotations
import argparse
import calendar
import csv
import datetime as dt
import hashlib
import io
import json
import math
from pathlib import Path
from statistics import mean, median
import zipfile

HERE=Path(__file__).resolve().parent
STEM='SEVEN_HEAVEN_BTC_THREE_DAILY_CANDLES_REBOUND_STRUCTURE_VOLUME_AUDIT_2026_11_11'
UPSTREAM='SEVEN_HEAVEN_BTC_SIGNAL_DURABILITY_DELAY_COST_AUDIT_2026_11_11_PROOFS.json'
PERIODS={'2022':['2022-04','2022-05','2022-06'],
         '2023':['2023-04','2023-05','2023-06'],
         '2024':['2024-01','2024-02','2024-03'],
         '2025':['2025-01','2025-02','2025-03'],
         '2026':[f'2026-{m:02d}' for m in range(1,11)]}
CAPITAL=1000.0
FEE=.001
SLIP=.0005
LAG=3
EVAL_DAY=10
COOLDOWN_DAYS=21
MIN_HISTORY=30
DECLINE_THRESHOLD=.05
RALLY_THRESHOLD=.05


def name(ms):
    return dt.datetime.fromtimestamp(ms/1000,dt.timezone.utc).strftime('%Y-%m-%d')


def month_daily(zipdir,month,expected):
    f=zipdir/f'BTCUSDT-1m-{month}.zip'
    assert f.is_file(),f'Missing source ZIP: {f}'
    raw=f.read_bytes()
    actual_sha=hashlib.sha256(raw).hexdigest()
    assert actual_sha==expected['sha256_verified'],f'SHA mismatch: {month}'
    if 'zip_size_bytes' in expected:
        assert len(raw)==expected['zip_size_bytes'],f'ZIP bytes mismatch: {month}'
    y,mo=map(int,month.split('-'))
    days_expected=calendar.monthrange(y,mo)[1]
    minutes_expected=days_expected*1440
    assert expected['minute_candles_verified']==minutes_expected
    start_ms=int(dt.datetime(y,mo,1,tzinfo=dt.timezone.utc).timestamp()*1000)
    rows=[];count=0;prev_ms=None;unit=None;day=None
    with zipfile.ZipFile(io.BytesIO(raw)) as z:
        expected_entry=f'BTCUSDT-1m-{month}.csv'
        assert z.namelist()==[expected_entry]
        assert z.getinfo(expected_entry).file_size < 30000000
        reader=csv.reader(io.TextIOWrapper(z.open(expected_entry),encoding='utf-8-sig',newline=''))
        for parts in reader:
            assert len(parts)==12,f'Unexpected candle columns in {month}'
            timestamp=int(parts[0]);curunit='us' if timestamp>=10**15 else 'ms'
            if unit is None:unit=curunit
            assert curunit==unit
            timestamp_ms=timestamp//1000 if curunit=='us' else timestamp
            assert timestamp_ms==start_ms+count*60000,f'Gap/duplicate in {month} at minute {count}'
            o,h,l,c=map(float,parts[1:5]);base=float(parts[5]);quote=float(parts[7])
            assert all(math.isfinite(x) for x in (o,h,l,c,base,quote))
            assert 0<l<=min(o,c)<=max(o,c)<=h and base>=0 and quote>=0
            d=timestamp_ms//86400000
            if day is None or day['daynum']!=d:
                if day is not None:
                    assert day['count']==1440
                    rows.append(day)
                day=dict(daynum=d,ms=timestamp_ms,o=o,h=h,l=l,c=c,base=0.0,quote=0.0,count=0)
            assert day['count']==(timestamp_ms%86400000)//60000
            day['h']=max(day['h'],h);day['l']=min(day['l'],l);day['c']=c
            day['base']+=base;day['quote']+=quote;day['count']+=1
            count+=1
    assert day is not None and day['count']==1440
    rows.append(day)
    assert count==minutes_expected and len(rows)==days_expected
    assert rows[0]['ms']==start_ms and rows[-1]['ms']==start_ms+(days_expected-1)*86400000
    if 'first_open_price_usdt' in expected:
        assert abs(rows[0]['o']-expected['first_open_price_usdt'])<.0001
    if 'last_close_price_usdt' in expected:
        assert abs(rows[-1]['c']-expected['last_close_price_usdt'])<.0001
    if 'base_volume_btc' in expected:
        assert abs(sum(r['base'] for r in rows)-expected['base_volume_btc'])<max(.01,expected['base_volume_btc']*1e-7)
    return rows,dict(month=month,sha256=actual_sha,minute_count=count,daily_count=len(rows),timestamp_unit=unit,zip_bytes=len(raw),base_volume_btc=round(sum(r['base'] for r in rows),6))


def load(zipdir):
    original=json.loads((zipdir/UPSTREAM).read_text(encoding='utf-8'))
    assert original['total_minutes']==960480 and len(original['verified_months'])==22
    bymonth={m['month']:m for m in original['verified_months']}
    assert set(bymonth)==set(sum(PERIODS.values(),[]))
    out={};manifest=[]
    for period,months in PERIODS.items():
        d=[]
        for m in months:
            rows,record=month_daily(zipdir,m,bymonth[m])
            if d: assert rows[0]['ms']==d[-1]['ms']+86400000
            d.extend(rows);manifest.append(record)
        out[period]=d
    assert sum(r['minute_count'] for r in manifest)==960480
    return out,manifest


def exp_ema(values,days):
    alpha=2/(days+1);v=None;res=[]
    for c in values:
        v=c if v is None else alpha*c+(1-alpha)*v
        res.append(v)
    return res


def signal_candidates(d,direction):
    assert direction in ('UP','DOWN')
    result=[];last_accept=-COOLDOWN_DAYS-1
    for i in range(MIN_HISTORY,len(d)):
        look=[x['c'] for x in d[i-30:i]]
        past=float(d[i-1]['c']);today=float(d[i]['c'])
        if direction=='UP':
            context=100*(past/max(look)-1)
            eligible=context<=-100*DECLINE_THRESHOLD and today>past
        else:
            context=100*(past/min(look)-1)
            eligible=context>=100*RALLY_THRESHOLD and today<past
        if eligible and i-last_accept>COOLDOWN_DAYS:
            result.append((i,context))
            last_accept=i
    return result


def pct(x):return round(100*x,5)


def mark_return(buy_price,close,fee_mult=1):
    buyfac=(1-FEE*fee_mult)/(1+SLIP*fee_mult)
    sellfac=(1-FEE*fee_mult)*(1-SLIP*fee_mult)
    return 100*(buyfac*sellfac*close/buy_price-1)


def episode_data(period,d,i,context,dir,ema10,ema30):
    e=dict(period=period,direction=dir,event_date=name(d[i]['ms']),event_idx=i,
        candidate_prior_30d_context_pct=round(context,5),
        first_close_usdt=d[i]['c'],right_censored=i+EVAL_DAY>=len(d))
    if e['right_censored']:
        return e
    sign=1 if dir=='UP' else -1
    c3=all(sign*(d[k]['c']-d[k-1]['c'])>0 for k in (i,i+1,i+2))
    structure=all(sign*(d[k]['l' if dir=='UP' else 'h']-d[k-1]['l' if dir=='UP' else 'h'])>0 for k in (i,i+1,i+2))
    avgvol=mean(d[k]['base'] for k in range(i+2-20,i+2))
    assert len(range(i+2-20,i+2))==20
    highvol=d[i+2]['base']>=avgvol
    # EMA defined only for the UP continuation policy; bearish check is descriptive.
    trend_up=ema10[i+2]>ema30[i+2] and d[i+2]['c']>ema30[i+2]
    p1=float(d[i+1]['o']);p3=float(d[i+3]['o']);last=float(d[i+10]['c'])
    change3=100*(last/p3-1)
    label=('RISE_GE3' if change3>=3 else ('FALL_LE_MINUS3' if change3<=-3 else 'RANGE_ABS_LT3'))
    e.update(c3=c3,structure_higher_lows_or_lower_highs=structure,
       high_volume_vs_prior_20d=highvol,ema_up_at_confirmation=trend_up,
       open_jplus1=p1,open_jplus3=p3,close_jplus10=last,
       gross_future_j3_to_j10_pct=round(change3,5),ex_post_class=label,
       entry_delay_price_move_pct=round(100*(p3/p1-1),5))
    if dir=='UP':
        c1=mark_return(p1,last)
        c3ret=mark_return(p3,last) if c3 else 0.0
        c3stress=mark_return(p3,last,2) if c3 else 0.0
        filters={'C3':c3,
                 'C3_STRUCTURE':c3 and structure,
                 'C3_VOLUME':c3 and highvol,
                 'C3_FULL':c3 and structure and highvol and trend_up}
        e.update(c1_net_pct=round(c1,5),c1_costs_2x_net_pct=round(mark_return(p1,last,2),5),
            c3_net_or_cash_pct=round(c3ret,5),c3_costs_2x_net_or_cash_pct=round(c3stress,5),
            c3_minus_c1_pp=round(c3ret-c1,5),
            c3_policy_indicators=filters,
            missed_c1_winner=not c3 and c1>0,
            avoided_c1_loser=not c3 and c1<0)
    return e


def wilson(success,n,z=1.96):
    if not n:return None
    phat=success/n;den=1+z*z/n
    mid=(phat+z*z/(2*n))/den
    rad=z*math.sqrt(phat*(1-phat)/n+z*z/(4*n*n))/den
    return [round(100*(mid-rad),2),round(100*(mid+rad),2)]


def summarize_up(events):
    all=[e for e in events if not e['right_censored']]
    assert all
    filters=['C3','C3_STRUCTURE','C3_VOLUME','C3_FULL']
    outcome={}
    for k in filters:
        chosen=[e for e in all if e['c3_policy_indicators'][k]]
        r=[mark_return(e['open_jplus3'],e['close_jplus10']) if e['c3_policy_indicators'][k] else 0 for e in all]
        stress=[mark_return(e['open_jplus3'],e['close_jplus10'],2) if e['c3_policy_indicators'][k] else 0 for e in all]
        outcome[k]=dict(trades_hypothetical=len(chosen),skipped=len(all)-len(chosen),
          mean_standalone_episode_pct=round(mean(r),4),median_standalone_episode_pct=round(median(r),4),
          positive_nonzero_events=sum(v>0 for v in r),
          mean_stress2x_standalone_episode_pct=round(mean(stress),4))
    c1=[e['c1_net_pct'] for e in all]
    c3ok=[e for e in all if e['c3']]
    c3gap=[e['entry_delay_price_move_pct'] for e in c3ok]
    groups={lab:sum(e['ex_post_class']==lab for e in all) for lab in ('RISE_GE3','FALL_LE_MINUS3','RANGE_ABS_LT3')}
    base_rates={lab:dict(n=n,rate_pct=round(100*n/len(all),2),wilson95_pct=wilson(n,len(all))) for lab,n in groups.items()}
    return dict(n_candidates=len(events),n_scored=len(all),n_right_censored=len(events)-len(all),
        c1_mean_episode_pct=round(mean(c1),4),c1_median_episode_pct=round(median(c1),4),c1_positive_events=sum(v>0 for v in c1),
        c3_confirmed=len(c3ok),c3_rejected=len(all)-len(c3ok),
        mean_confirmed_entry_price_delay_pct=round(mean(c3gap),4) if c3gap else None,
        median_confirmed_entry_price_delay_pct=round(median(c3gap),4) if c3gap else None,
        rejected_would_have_been_profitable_c1=sum(e['missed_c1_winner'] for e in all),
        rejected_would_have_lost_c1=sum(e['avoided_c1_loser'] for e in all),
        observed_j3_to_j10_outcomes=base_rates,standalone_policies=outcome)


def checks(data,events):
    n=0
    # Candidates must be invariant to future data (excluding right-edge grading).
    for period,d in data.items():
        for direction in ('UP','DOWN'):
            full=[i for i,_ in signal_candidates(d,direction)]
            for prefix in sorted(set([40,48,63,75,89,104,130,200,len(d)-1])):
                if prefix>=len(d):continue
                short=[i for i,_ in signal_candidates(d[:prefix+1],direction)]
                assert full[:len(short)]==short,(period,direction,prefix)
                n+=1
    # Scored decisions must depend on closes before hypothetical execution.
    for e in events:
        if e['right_censored']:continue
        period=e['period'];d=data[period];i=e['event_idx'];up=e['direction']=='UP'
        k=i+2
        expect=all((d[j]['c']>d[j-1]['c'] if up else d[j]['c']<d[j-1]['c']) for j in (i,i+1,k))
        assert e['c3']==expect
        assert e['open_jplus1']==d[i+1]['o'] and e['open_jplus3']==d[i+3]['o'] and e['close_jplus10']==d[i+10]['c']
        if up:
            assert abs(e['c1_net_pct']-mark_return(d[i+1]['o'],d[i+10]['c']))<.00001
            expected=mark_return(d[i+3]['o'],d[i+10]['c']) if expect else 0.0
            assert abs(e['c3_net_or_cash_pct']-expected)<.00001
            # Since mark_return computes ratio of 1000 USDT hypothetical portfolio,
            # it is independent of initial nominal capital.
            assert abs(CAPITAL*(1+expected/100)-CAPITAL*(1+e['c3_net_or_cash_pct']/100))<.0001
        n+=4
    return n


def export_csv(p,rows,cols):
    with p.open('w',encoding='utf-8',newline='') as f:
        w=csv.DictWriter(f,fieldnames=cols,extrasaction='ignore');w.writeheader();w.writerows(rows)


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--zip-dir',default=str(HERE));args=ap.parse_args()
    root=Path(args.zip_dir)
    dmap,manifest=load(root)
    all_events=[];features=[];summary={}
    for period,d in dmap.items():
        assert all(d[k+1]['ms']-d[k]['ms']==86400000 for k in range(len(d)-1))
        ema10=exp_ema([x['c'] for x in d],10)
        ema30=exp_ema([x['c'] for x in d],30)
        for k,x in enumerate(d):
            features.append(dict(period=period,date_utc=name(x['ms']),open=x['o'],high=x['h'],low=x['l'],close=x['c'],
              volume_btc=round(x['base'],6),volume_usdt=round(x['quote'],4),ema10=round(ema10[k],5),ema30=round(ema30[k],5)))
        up=[episode_data(period,d,i,context,'UP',ema10,ema30) for i,context in signal_candidates(d,'UP')]
        down=[episode_data(period,d,i,context,'DOWN',ema10,ema30) for i,context in signal_candidates(d,'DOWN')]
        all_events+=up+down
        ups=summarize_up(up) if any(not x['right_censored'] for x in up) else None
        downs=[x for x in down if not x['right_censored']]
        summary[period]=dict(daily_count=len(d),up=ups,
          down=dict(n_candidates=len(down),n_scored=len(downs),n_right_censored=len(down)-len(downs),
              confirmed_c3=sum(e['c3'] for e in downs),
              mean_j3_to_j10_pct=round(mean(e['gross_future_j3_to_j10_pct'] for e in downs),4) if downs else None,
              j3_to_j10_outcome_counts={x:sum(e['ex_post_class']==x for e in downs) for x in ('RISE_GE3','FALL_LE_MINUS3','RANGE_ABS_LT3')}))
        print('PERIOD',period,'days',len(d),'up',len(up),'scored_up',ups['n_scored'] if ups else 0,
              'C3',ups['c3_confirmed'] if ups else 0,'down',len(down),flush=True)
    nc=checks(dmap,all_events)
    bydirection={dir:[e for e in all_events if e['direction']==dir] for dir in ('UP','DOWN')}
    all_up=summarize_up(bydirection['UP'])
    downside=[e for e in bydirection['DOWN'] if not e['right_censored']]
    manifest_count=sum(v['minute_count'] for v in manifest)
    assert len(manifest)==22 and manifest_count==960480
    c3=[e for e in bydirection['UP'] if not e['right_censored'] and e['c3']]
    assert all(e['c3_policy_indicators']['C3_FULL']<=e['c3_policy_indicators']['C3'] for e in bydirection['UP'] if not e['right_censored'])
    data=dict(schema='seven-heaven.btc-three-day-structure-volume-event-audit.v1',
      study_date='2026-11-11',paper_only=True,orders_sent=0,previously_explored_windows=True,
      protocol_file=STEM+'_PROTOCOL.md',protocol_github_commit='42c4be6b605ae82cd16f512fc7019ea54599bc6e',
      script_sha256=hashlib.sha256((HERE/(STEM+'.py')).read_bytes()).hexdigest(),
      upstream_22_month_sha_registry=UPSTREAM,
      source_months=manifest,minute_candles_verified=manifest_count,
      daily_bars_verified=sum(len(v) for v in dmap.values()),
      periods=summary,aggregate_up=all_up,
      aggregate_down=dict(n_candidates=len(bydirection['DOWN']),n_scored=len(downside),
        c3_confirmed=sum(e['c3'] for e in downside),
        future_outcome_counts={x:sum(e['ex_post_class']==x for e in downside) for x in ('RISE_GE3','FALL_LE_MINUS3','RANGE_ABS_LT3')}),
      causal_and_ledger_assertions=nc,
      settings=dict(max_lookback_days=30,lookback_peak_drawdown_pct=5,one_event_per_22_days=True,
        confirmation='3 strictly increasing daily UTC closes',rising_lows='3 strictly increasing daily UTC lows',
        volume='day J+2 BTC base volume >= preceding 20 complete days average',
        trend='EMA10>EMA30 and close>EMA30 after day J+2',
        comparison='C1 buy at J+1 open, C3 buy at J+3 open if confirmed, common hypothetical sale J+10 close',
        fee_side=FEE,slip_side=SLIP,stress_cost_factor=2,ex_post_outcome_threshold_pct=3),
      warnings=['All source windows have been studied before; NO out-of-sample or independent validation',
       'Event selection uses chronological 21-day cooldown and can undercount clustered signals',
       'Episode returns are isolated and MUST NOT be summed or treated as a continuous portfolio',
       'C3 buys later than C1, so common liquidation horizon implies different holding durations',
       'Binance Spot BTCUSDT is not OKX BTCUSDC and hypothetical open/close fills are not executable order proofs',
       'Visual infographic scenario percentages 40/35/25 are not calibrated; outcome rates here are retrospective only',
       'The current 15min screenshot cannot itself establish any daily 3-close signal'])
    (HERE/(STEM+'_PROOFS.json')).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    cols=['period','direction','event_date','candidate_prior_30d_context_pct','right_censored',
      'c3','structure_higher_lows_or_lower_highs','high_volume_vs_prior_20d','ema_up_at_confirmation',
      'open_jplus1','open_jplus3','close_jplus10','gross_future_j3_to_j10_pct','ex_post_class',
      'entry_delay_price_move_pct','c1_net_pct','c1_costs_2x_net_pct','c3_net_or_cash_pct',
      'c3_costs_2x_net_or_cash_pct','c3_minus_c1_pp','missed_c1_winner','avoided_c1_loser',
      'full_filter_entry_qualifies']
    rows=[]
    for e in all_events:
        flat={k:v for k,v in e.items() if k!='c3_policy_indicators'}
        flat['full_filter_entry_qualifies']=(e.get('c3_policy_indicators') or {}).get('C3_FULL','')
        rows.append(flat)
    export_csv(HERE/(STEM+'_EVENTS.csv'),rows,cols)
    export_csv(HERE/(STEM+'_DAILY_FEATURES.csv'),features,
       ['period','date_utc','open','high','low','close','volume_btc','volume_usdt','ema10','ema30'])
    write_report(data)
    print('VALIDATED',manifest_count,'1m',len(features),'daily',nc,'causal/ledger assertions',flush=True)


def fmt(x):return '—' if x is None else str(x)

def write_report(data):
    all_up=data['aggregate_up'];all_down=data['aggregate_down']
    lines=['# Seven Heaven — « Règle des 3 jours » : bougies quotidiennes, structure, volumes et coût du retard',
      '', '**11 novembre 2026 · recherche rétrospective PAPER, sans ordres ni changements de production.**',
      '', '## Ce que les images montrent — et ne prouvent pas', '',
      '- Les visuels fournis illustrent l’observation de **trois clôtures quotidiennes**, les **creux et sommets**, les **EMA** et les **volumes**. Les images de synthèse sont datées du **7 novembre 2026** tandis que la capture de l’Administrator est du **11 novembre 2026** : ne pas mélanger les cours ou niveaux.',
      '- Les scénarios « reprise 40 % / consolidation 35 % / baisse 25 % » de l’infographie ne sont pas des probabilités statistiquement mesurées. **Nous ne les conservons pas comme probabilités.**',
      '- La vue Administrator affichée est en **15 minutes**, elle ne valide aucune règle fondée sur trois clôtures **journalières**. L’horodatage et le cache doivent également être examinés avant tout diagnostic actuel.',
      '', '## Protocole figé avant les calculs', '',
      f'- **[Protocole](./{STEM}_PROTOCOL.md)** publié au commit `42c4be6` avant ce calcul.',
      f'- 22 ZIP BTCUSDT Binance Spot 1m, **{data["minute_candles_verified"]:,} minutes** et **{data["daily_bars_verified"]} bougies UTC** ; chaque ZIP a son empreinte SHA-256 vérifiée.',
      '- Candidature : un premier jour haussier après un repli ≥5 % sous le maximum des clôtures des 30 jours précédents. Une nouvelle candidature n’est pas retenue avant 22 jours (21 jours bloqués).',
      '- C1 : une clôture haussière → achat fictif ouverture J+1. C3 : trois clôtures haussières consécutives → achat fictif ouverture J+3 ; sinon rester en USDT. Vente fictive commune à la clôture J+10.',
      '- Étages descriptifs à J+2 : creux haussiers, volume base BTC ≥ moyenne des 20 jours précédents, EMA10>EMA30 et clôture>EMA30.',
      '- Coûts fictifs : 0,10 % de frais + 0,05 % de glissement par côté ; doublement en stress. Chaque épisode reprend fictivement 1 000 USDT pour isoler un effet ; **ce ne sont pas des rendements de portefeuille continu**.',
      '- Étiquettes J+3→J+10 ex post : hausse ≥3 %, baisse ≤−3 %, autre consolidation. Informations futures jamais utilisées pour décider.',
      '', '## Résultats par période', '',
      '| Période | Reprises évaluées | Confirmations C3 | C1 moyenne par épisode | C3-ou-cash moyenne | Rejets C3 : gagnants C1 / perdants C1 |',
      '|---|---:|---:|---:|---:|---:|']
    for p,z in data['periods'].items():
        a=z['up']
        if a:
            c3=a['standalone_policies']['C3']['mean_standalone_episode_pct']
            lines.append(f'| {p} | {a["n_scored"]} | {a["c3_confirmed"]} | {a["c1_mean_episode_pct"]:+.3f} % | {c3:+.3f} % | {a["rejected_would_have_been_profitable_c1"]} / {a["rejected_would_have_lost_c1"]} |')
        else:lines.append(f'| {p} | 0 | 0 | — | — | — |')
    lines+=['', '## Synthèse et coûts du filtrage', '',
      f'- Reprises détectées {all_up["n_candidates"]}, dont **{all_up["n_scored"]} évaluables** et {all_up["n_right_censored"]} censurées.',
      f'- C3 confirme **{all_up["c3_confirmed"]}/{all_up["n_scored"]}** événements ; en rejette {all_up["c3_rejected"]}. Parmi ceux rejetés : **{all_up["rejected_would_have_been_profitable_c1"]}** épisodes où l’achat C1 aurait gagné, **{all_up["rejected_would_have_lost_c1"]}** où il aurait perdu (hors coûts futurs d’autres événements).',
      f'- Prix d’entrée retardé de C1 à C3 (événements confirmés) : décalage médian **{fmt(all_up["median_confirmed_entry_price_delay_pct"])} %** ; comparer un coût d’entrée, pas l’alpha de portefeuille.',
      '', '| Filtre d’entrée à J+3 | Confirmations parmi épisodes | Rendement moyen isolé sur TOUS les épisodes (cash = 0 %) | Moyenne si coûts ×2 |',
      '|---|---:|---:|---:|']
    for k,label in [('C3','3 clôtures'),('C3_STRUCTURE','3 clôtures + creux ascendants'),('C3_VOLUME','3 clôtures + volume'),('C3_FULL','3 clôtures + creux + volume + EMA')]:
        x=all_up['standalone_policies'][k]
        lines.append(f'| {label} | {x["trades_hypothetical"]}/{all_up["n_scored"]} | {x["mean_standalone_episode_pct"]:+.3f} % | {x["mean_stress2x_standalone_episode_pct"]:+.3f} % |')
    lines+=['', '## Classification rétrospective du marché à J+10', '',
      'Ces trois classes sont observées **après coup**, depuis l’ouverture de J+3 jusqu’à la clôture de J+10. Ne pas les afficher comme une prévision ni les additionner aux probabilités inventées des visuels.',
      '', '| Issue observée | Nombre / reprises évaluées | Fréquence observée | Intervalle Wilson 95 % descriptif |',
      '|---|---:|---:|---:|']
    human={'RISE_GE3':'BTC +3 % ou plus','FALL_LE_MINUS3':'BTC −3 % ou moins','RANGE_ABS_LT3':'Entre −3 % et +3 %'}
    for k,z in all_up['observed_j3_to_j10_outcomes'].items():
        interval=z['wilson95_pct'];ci=f'{interval[0]}–{interval[1]} %' if interval else '—'
        lines.append(f'| {human[k]} | {z["n"]}/{all_up["n_scored"]} | {z["rate_pct"]:.2f} % | {ci} |')
    lines+=['', '## Contrôle baissier et limites', '',
      f'- Après une hausse préalable de ≥5 %, **{all_down["n_candidates"]}** journées de premier repli observées, dont {all_down["n_scored"]} évaluables et {all_down["c3_confirmed"]} séquences de trois baisses confirmées.',
      '- Les périodes **ont déjà été utilisées** pour d’autres recherches : aucune validation indépendante, aucune calibration de probabilité future, aucune stratégie gagnante démontrée.',
      '- Événements espacés par une règle de blocage de 21 jours, non indépendants économiquement entre fenêtres de marché ; effectifs parfois faibles. Les intervalles Wilson descriptifs supposent des observations indépendantes et sont donc indicatifs, potentiellement trop étroits.',
      '- Le prix d’achat hypothétique à une ouverture ne garantit aucune exécution sur OKX, et Binance BTCUSDT diffère de BTC/USDC OKX. Volumes Binance Spot seulement, pas volumes globaux.',
      '- Les écarts C1/C3 reflètent aussi **deux jours d’exposition différents**. Comparer sur le même J+10 permet un prix de sortie commun, pas une expérience causalement randomisée.',
      '', '## Passation inter-IA et reproductibilité', '',
      f'- Code : `{STEM}.py` — exécuter `python {STEM}.py --zip-dir <dossier-des-22-ZIP-et-manifeste>`.',
      f'- Preuves : `{STEM}_PROOFS.json` — SHA-256 de chaque mois, code SHA, protocole, métriques et contrôles.',
      f'- Événements : `{STEM}_EVENTS.csv` ; caractéristiques quotidiennes : `{STEM}_DAILY_FEATURES.csv`.',
      f'- Contrôles causaux, arithmétiques et d’horizon : **{data["causal_and_ledger_assertions"]}** assertions auditées.',
      '- Registre SHA requis : `SEVEN_HEAVEN_BTC_SIGNAL_DURABILITY_DELAY_COST_AUDIT_2026_11_11_PROOFS.json` dans le dossier des ZIP. Ne pas publier les ZIP dans Git main, ils restent dans Releases.',
      '- Périmètre : recherche PAPER, sans accès compte, sans ordre, sans écriture dans Administrator, Operator, Trader ou Bridge.',
      '', '**Verdict :** trois bougies quotidiennes constituent une observation **vérifiable**, mais le filtre n’est pas une prédiction. Mesurer les hausses manquées et les baisses évitées sur un autre historique préalablement réservé sera nécessaire avant toute idée d’intégration.']
    (HERE/(STEM+'_REPORT.md')).write_text('\n'.join(lines)+'\n',encoding='utf-8')


if __name__=='__main__':main()
