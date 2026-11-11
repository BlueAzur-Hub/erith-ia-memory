#!/usr/bin/env python3
"""Seven Heaven: event-based BTC signal survival and confirmation-delay diagnostic.

READ-ONLY PAPER research. Uses existing SHA256-checked Binance Spot BTCUSDT
minute ZIPs and canonical Seven Heaven indicators. Produces tables, proof JSON,
and Markdown handoff; no trading, no network, no change to production code.

Important: All periods are PREVIOUSLY STUDIED. Outcome labels after 7 days are
ex post research diagnostics, never inputs to any signal or trade.
"""
from __future__ import annotations
import csv
import datetime as dt
import hashlib
import importlib.util
import json
import math
from pathlib import Path
from statistics import median
import numpy as np

ROOT=Path(__file__).resolve().parent
STEM='SEVEN_HEAVEN_BTC_SIGNAL_DURABILITY_DELAY_COST_AUDIT_2026_11_11'
FAMILIES={'EMA':'EMA_RAW','SUPERTREND':'ST_RAW','CONSENSUS':'CONSENSUS_RAW'}
WARMUP={'2022':30,'2023':30,'2024':31,'2025':31,'2026':31}


def import_script(name):
    p=ROOT/name
    assert p.is_file(),p
    spec=importlib.util.spec_from_file_location('seven_event_'+name.replace('.','_'),p)
    m=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def day(timestamp_ms):
    return dt.datetime.fromtimestamp(float(timestamp_ms)/1000,dt.timezone.utc).date().isoformat()


def write_csv(name,rows,cols):
    with (ROOT/name).open('w',newline='',encoding='utf-8') as f:
        w=csv.DictWriter(f,fieldnames=cols,extrasaction='ignore');w.writeheader();w.writerows(rows)


def flatten_sources():
    audit=import_script('SEVEN_HEAVEN_BTC_ENTRY_EXIT_ASYMMETRIC_CONFIRMATION_AUDIT_2026_11_11.py')
    old,periods,meta=audit.load_series()
    r22=import_script('SEVEN_HEAVEN_BTC_ASYMMETRIC_CONFIRMATION_2022_APR_JUN_FROZEN_HOLDOUT_REPLAY_2026_11_11.py')
    ema=import_script('SEVEN_HEAVEN_EMA_SUPERTREND_VOLATILITY_GRID_HOLD_REGIME_STUDY_2026_11_11.py')
    d22,m22=r22.get_daily(ROOT,ema.grid,ema)
    periods={'2022':d22,**periods}
    months=m22+meta
    assert len(months)==22
    assert sum(x['minute_candles_verified'] for x in months)==960480
    assert set(periods)==set(WARMUP)
    # Controls source native ZIP SHA and exact minute count are performed by get_daily/load_series
    return old,periods,months


def events_for_one(period,family,d,states,warmup):
    raw=np.asarray(states,dtype=bool)
    assert len(raw)==len(d)
    # Include state flips from the final warm-up close onward. No initial-state
    # pseudo flip is created, so counts are NOT transaction counts.
    out=[]
    for i in range(warmup-1,len(d)-1):
        if bool(raw[i])==bool(raw[i-1]):continue
        bull=bool(raw[i]);side='ENTRY' if bull else 'EXIT'
        nxt=i+1
        while nxt<len(raw) and bool(raw[nxt])==bull:
            nxt+=1
        run_len=nxt-i
        p1=float(d[i+1,1])
        # C1 => hypothetically act at day i+1 open, provided portfolio state fits
        j7=i+8
        if j7<len(d):
            f7=float(d[j7,4]);g7=100*(f7/p1-1)
            # favorable to the underlying signal (buy favors rise, sell favors fall).
            favorable=g7 if bull else -g7
            label='FAVORABLE_GE_3' if favorable>=3 else ('ADVERSE_GE_3' if favorable<=-3 else 'NEUTRAL')
            censored=False
        else:
            g7=favorable=None;label='CENSORED';censored=True
        can_c2=run_len>=2 and i+2<len(d)
        can_c3=run_len>=3 and i+3<len(d)
        p2=float(d[i+2,1]) if can_c2 else None
        p3=float(d[i+3,1]) if can_c3 else None
        adverse2=100*(p2/p1-1)*(1 if bull else -1) if p2 is not None else None
        adverse3=100*(p3/p1-1)*(1 if bull else -1) if p3 is not None else None
        out.append(dict(period=period,family=family,signal_close_date_utc=day(d[i,0]),side=side,
                        raw_signal_run_days=run_len,short_run_lt3=run_len<3,
                        theoretical_c1_open_date=day(d[i+1,0]),c1_open_price_usdt=round(p1,6),
                        c2_possible=can_c2,c2_open_price_usdt=round(p2,6) if p2 is not None else '',
                        c3_possible=can_c3,c3_open_price_usdt=round(p3,6) if p3 is not None else '',
                        c2_adverse_price_move_pct=round(adverse2,6) if adverse2 is not None else '',
                        c3_adverse_price_move_pct=round(adverse3,6) if adverse3 is not None else '',
                        j7_btc_change_pct=round(g7,6) if g7 is not None else '',
                        j7_signal_direction_change_pct=round(favorable,6) if favorable is not None else '',
                        ex_post_7d_label=label,right_censored=censored))
    return out


def summarize(rows):
    nonc=[x for x in rows if not x['right_censored']]
    c3=[x for x in rows if x['c3_possible']]
    adverse=[float(x['c3_adverse_price_move_pct']) for x in c3]
    short=[x for x in rows if x['short_run_lt3']]
    short_eval=[x for x in short if not x['right_censored']]
    result={
       'candidate_raw_transitions':len(rows),
       'entries':sum(x['side']=='ENTRY' for x in rows),
       'exits':sum(x['side']=='EXIT' for x in rows),
       'runs_lt3_days':len(short),'runs_lt3_pct':round(100*len(short)/len(rows),3) if rows else None,
       'runs_ge3_days':sum(x['raw_signal_run_days']>=3 for x in rows),
       'short_runs_favorable_at_j7_ge3_pct':sum(x['ex_post_7d_label']=='FAVORABLE_GE_3' for x in short_eval),
       'short_runs_adverse_at_j7_ge3_pct':sum(x['ex_post_7d_label']=='ADVERSE_GE_3' for x in short_eval),
       'short_runs_neutral_j7':sum(x['ex_post_7d_label']=='NEUTRAL' for x in short_eval),
       'short_runs_right_censored':len(short)-len(short_eval),
       'c3_possible':len(c3),
       'c3_adverse_price_move_median_pct':round(median(adverse),4) if adverse else None,
       'c3_adverse_price_move_positive_count':sum(v>0 for v in adverse),
       'c3_adverse_price_move_negative_count':sum(v<0 for v in adverse),
       'c3_adverse_price_move_zero_count':sum(v==0 for v in adverse),
       'j7_favorable_ge3':sum(x['ex_post_7d_label']=='FAVORABLE_GE_3' for x in nonc),
       'j7_adverse_ge3':sum(x['ex_post_7d_label']=='ADVERSE_GE_3' for x in nonc),
       'j7_neutral':sum(x['ex_post_7d_label']=='NEUTRAL' for x in nonc),
       'j7_censored':len(rows)-len(nonc)
    }
    assert result['runs_lt3_days']+result['runs_ge3_days']==len(rows)
    assert sum(result[k] for k in ('j7_favorable_ge3','j7_adverse_ge3','j7_neutral','j7_censored'))==len(rows)
    return result


def causal_checks(old,d,raw):
    checks=0
    for j in [33,35,40,45,59,75,89,130,210,len(d)-1]:
        if j>=len(d):continue
        short=old.signals(d[:j+1])
        for fam,name in FAMILIES.items():
            assert bool(short[name][-1])==bool(raw[name][j]),('lookahead',fam,j)
            checks+=1
    return checks


def run():
    old,periods,meta=flatten_sources()
    out={};events=[];checks=0
    for period,d in periods.items():
        assert d.shape[1]==5
        assert all(int(d[k+1,0]-d[k,0])==86400000 for k in range(len(d)-1))
        raw=old.signals(d)
        checks+=causal_checks(old,d,raw)
        out[period]={}
        for fam,k in FAMILIES.items():
            sub=events_for_one(period,fam,d,raw[k],WARMUP[period])
            out[period][fam]=summarize(sub)
            events+=sub
        print('PERIOD',period,'events',sum(x['candidate_raw_transitions'] for x in out[period].values()),flush=True)
    assert len(meta)==22 and checks>=120
    # Cross-check 2022 negative-control: NO portfolio transactions in frozen 2022 replay;
    # raw signal transitions may still exist and need not be actionable.
    prior22=json.loads((ROOT/'SEVEN_HEAVEN_BTC_ASYMMETRIC_CONFIRMATION_2022_APR_JUN_FROZEN_HOLDOUT_REPLAY_2026_11_11_PROOFS.json').read_text())
    assert all(x['trades']==0 for x in prior22['results'] if x['family']!='BENCHMARK')
    aggregate={fam:summarize([x for x in events if x['family']==fam]) for fam in FAMILIES}
    aggregate['all']=summarize(events)
    outpath=ROOT/(STEM+'_TRANSITION_EVENTS.csv')
    cols=['period','family','signal_close_date_utc','side','raw_signal_run_days','short_run_lt3',
      'theoretical_c1_open_date','c1_open_price_usdt','c2_possible','c2_open_price_usdt',
      'c3_possible','c3_open_price_usdt','c2_adverse_price_move_pct','c3_adverse_price_move_pct',
      'j7_btc_change_pct','j7_signal_direction_change_pct','ex_post_7d_label','right_censored']
    write_csv(outpath.name,events,cols)
    report=['# Seven Heaven — Durabilité des signaux et coût local du délai de confirmation BTC','',
      '**11 novembre 2026 — recherche explicative rétrospective, uniquement PAPER.**', '',
      '## Question et provenance','',
      '- 22 ZIP natifs Binance Spot BTC/USDT 1 minute vérifiés SHA-256 ; **960 480 bougies**.',
      '- Fenêtres 2022 mai–juin, 2023 mai–juin, 2024 février–mars, 2025 février–mars, 2026 février–octobre.',
      '- EMA10/30, SuperTrend ATR14×3 et consensus 2/3 EMA/MACD/ADX, paramètres déjà publiés.',
      '- **Toutes ces fenêtres ont déjà été explorées : il ne s’agit PAS d’un test inédit de performance.**',
      '- Étude événementielle des bascules brutes de signal, et non simulation de nouveaux ordres ; une bascule n’implique pas que le portefeuille soit positionné pour négocier.',
      '- C1 : agir fictivement à ouverture de D+1 après clôture D. C3 : attendre 3 clôtures concordantes, puis ouverture D+3.',
      '- Une bascule brute durant moins de 3 jours ne satisfait pas C3. Ceci ne prouve pas qu’elle soit fausse.',
      '- Étiquetage J+7 : cours de clôture du **septième jour suivant l’ouverture C1**, comparé à cette ouverture ; hausse favorable à entrée, baisse favorable à sortie. Seuil ±3 %, constat ex post non utilisable pour décider.',
      '- Prix C1→C3 : pour achat, hausse = délai défavorable ; pour vente, baisse = délai défavorable. Ce différentiel local NE constitue PAS un P&L de portefeuille.',
      '', '## Table des transitions brutes (événements, et non transactions)', '',
      '| Période | EMA : transitions / courtes | SuperTrend : transitions / courtes | Consensus : transitions / courtes |',
      '|---|---:|---:|---:|']
    for period in sorted(out):
        report.append('| '+period+' | '+' | '.join(f'{out[period][f]["candidate_raw_transitions"]} / {out[period][f]["runs_lt3_days"]}' for f in FAMILIES)+' |')
    report+=['','## Contrôle des pertes de temps C3 lorsque les trois clôtures existent','',
       '| Famille | Transitions | Durée <3 j | Transitions C3 admissibles | C3 prix local adverse médian | C3 adverse / favorable |',
       '|---|---:|---:|---:|---:|---:|']
    for fam in FAMILIES:
        x=aggregate[fam]
        fmt='—' if x['c3_adverse_price_move_median_pct'] is None else f'{x["c3_adverse_price_move_median_pct"]:+.3f} %'
        report.append(f'| {fam} | {x["candidate_raw_transitions"]} | {x["runs_lt3_days"]} | {x["c3_possible"]} | {fmt} | {x["c3_adverse_price_move_positive_count"]} / {x["c3_adverse_price_move_negative_count"]} |')
    report+=['', '## Short runs : rappel du risque de filtrer un vrai départ','',
      '| Famille | Runs <3j | Suivis de mouvement favorable ≥3 % à J+7 | Défavorable ≥3 % | Neutres | Censurés |',
      '|---|---:|---:|---:|---:|---:|']
    for fam in FAMILIES:
        x=aggregate[fam]
        report.append(f'| {fam} | {x["runs_lt3_days"]} | {x["short_runs_favorable_at_j7_ge3_pct"]} | {x["short_runs_adverse_at_j7_ge3_pct"]} | {x["short_runs_neutral_j7"]} | {x["short_runs_right_censored"]} |')
    report+=['','## Interprétation / garde-fous', '',
       '- La confirmation C3 supprime mécaniquement les épisodes bruts qui durent un ou deux jours. Il faut regarder le mouvement du BTC **après** ces épisodes avant de les qualifier de « faux ».',
       '- Le prix à J+7, la durée totale de l’épisode et les classes favorable/défavorable sont des **informations futures uniquement utilisées pour l’audit**, jamais des entrées d’un signal.',
       '- Les trois familles observent le même BTC aux mêmes dates et les événements se recouvrent : les comptes ne constituent PAS des essais indépendants ni une signification statistique.',
       '- L’étude ne chiffre pas le rendement d’une stratégie nouvelle : les performances complètes E1/S1, E3/S1 et E1/S3 sont documentées dans le précédent audit asymétrique.',
       '- À défaut de nouvelles périodes avec retournements, une règle C2/C3 ne peut être déclarée supérieure et ne doit pas être déployée.',
       '- Le contrôle négatif 2022 est inclus. Les indicateurs peuvent connaître des bascules brutes sans que les règles figées n’exécutent de transaction.',
       '', '## Publication et reproduction inter-IA','',
       f'- Code : `{STEM}.py`, lance depuis le dossier avec les 22 ZIP originaux et les scripts historiques Python publiés.',
       f'- Journal exhaustif : `{STEM}_TRANSITION_EVENTS.csv`.',
       f'- Preuves et SHA : `{STEM}_PROOFS.json`.',
       '- Les ZIP ne sont pas recopiés dans Git main ; leurs empreintes figurent dans les preuves.',
       '- Aucune modification des programmes Administrator, Operator, Trader et Bridge. Aucun ordre réel.', '']
    (ROOT/(STEM+'_REPORT.md')).write_text('\n'.join(report),encoding='utf-8')
    proof=dict(schema='seven-heaven.btc-signal-durability-local-delay-audit.v1',created_utc=dt.datetime.now(dt.timezone.utc).isoformat(),
       research_only=True,orders_sent=0,already_explored_windows=True,
       sources='22 registry SHA256 checked Binance Spot BTCUSDT native 1m ZIP',
       verified_months=meta,total_minutes=sum(m['minute_candles_verified'] for m in meta),
       local_script_sha256=hashlib.sha256((ROOT/(STEM+'.py')).read_bytes()).hexdigest(),
       signal_evaluation='end completed day UTC; hypothetical open of next UTC day',
       future_information='only for ex post run length and J+7 labels, not signals',
       j7_definition='close at day i+8 for signal on close i, versus hypothetical day i+1 open',
       causal_prefix_checks=checks,period_summary=out,aggregate=aggregate,
       control_2022_zero_portfolio_trades_confirmed=True,
       warnings=['not new holdout', 'overlapping correlated BTC signal events', 'no event-level price move sums to actual portfolio profit', 'OHLC next-day opens theoretical fills', 'no real execution/tax/spread modeled'])
    (ROOT/(STEM+'_PROOFS.json')).write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('COMPLETE',STEM,'events',len(events),'prefix_checks',checks,'minutes',proof['total_minutes'],flush=True)
    return proof

if __name__=='__main__':run()
