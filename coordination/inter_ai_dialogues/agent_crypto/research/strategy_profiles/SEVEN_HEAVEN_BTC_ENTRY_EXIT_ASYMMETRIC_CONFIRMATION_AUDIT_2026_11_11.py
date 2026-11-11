#!/usr/bin/env python3
"""Seven Heaven: entry confirmation versus exit confirmation, causal PAPER audit.

Uses original, SHA-verified Binance Spot BTCUSDT native minute ZIPs, plus the
already published canonical indicator and portfolio engine. Four PREVIOUSLY
EXPLORED windows (2023 Q2, 2024 Q1, 2025 Q1, 2026 Feb-Oct); NO holdout claim.

All signal parameters and 3x3 comparisons are fixed in adjacent _PROTOCOL.md.
Signals use completed UTC D close; hypothetical fill at UTC D+1 open.
No accounts, exchange APIs, real orders, network, or deployment writes.
"""
from __future__ import annotations
import csv, datetime as dt, hashlib, importlib.util, json, math
from pathlib import Path
from statistics import median
import numpy as np

ROOT=Path(__file__).resolve().parent
STEM='SEVEN_HEAVEN_BTC_ENTRY_EXIT_ASYMMETRIC_CONFIRMATION_AUDIT_2026_11_11'
PERIODS=('2023','2024','2025','2026')
FAMILIES={'EMA':'EMA_RAW','SUPERTREND':'ST_RAW','CONSENSUS':'CONSENSUS_RAW'}
CAPITAL=1000.


def import_file(filename):
    path=ROOT/filename
    assert path.is_file(),f'Missing reproducibility module: {filename}'
    spec=importlib.util.spec_from_file_location('seven_audit_'+filename.replace('.','_'),path)
    mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
    return mod


def date(ms):
    return dt.datetime.fromtimestamp(float(ms)/1000, dt.timezone.utc).date().isoformat()


def load_series():
    old=import_file('SEVEN_HEAVEN_BTC_REVERSAL_CONFIRMATION_FALSE_SIGNALS_CASH_COST_2026_11_11.py')
    m2023=import_file('SEVEN_HEAVEN_BTC_CONFIRMATION_INDEPENDENT_2023_APR_JUN_REPLAY_2026_11_11.py')
    em=import_file('SEVEN_HEAVEN_EMA_SUPERTREND_VOLATILITY_GRID_HOLD_REGIME_STUDY_2026_11_11.py')
    grid=em.grid
    d2023,meta2023=m2023.get_daily(ROOT,grid,em)
    others,metas=old.prev.rev.read_all()
    assert set(others)=={'2024','2025','2026'} and len(metas)==16
    assert len(meta2023)==3
    full={'2023':d2023,**others}
    assert len(d2023)==91 and sum(m['minute_candles_verified'] for m in meta2023)==131040
    assert sum(m['minute_candles_verified'] for m in metas)==698400
    return old,full,meta2023+metas


def run_policy(old,d,raw,on_days,off_days,warmup,stress=1):
    state=old.confirm(raw,on_days,off_days)
    old.prev.BEGIN_DAY=warmup
    old.WARMUP_DAYS=warmup
    sim=old.prev.simulate(d,state,stress)
    assert len(sim['daily'])==len(d)-warmup
    return state,sim


def ledger_check(d,sim,warmup,multiplier=1):
    """Independent position accounting, unlike the canonical engine."""
    buyfac=(1-.001*multiplier)/(1+.0005*multiplier)
    sellfac=(1-.001*multiplier)*(1-.0005*multiplier)
    cash=CAPITAL;btc=0.;checks=0
    trades={t['date_utc']:t for t in sim['trade_ledger']}
    for i in range(warmup,len(d)):
        x=trades.get(date(d[i,0]))
        if x:
            if x['side']=='BUY':
                assert btc==0 and cash>0
                btc=cash*buyfac/float(d[i,1]);cash=0.
            else:
                assert btc>0 and cash==0
                cash=btc*float(d[i,1])*sellfac;btc=0.
        equity=cash+btc*float(d[i,4])*sellfac
        assert abs(equity-float(sim['daily'][i-warmup]['equity_usdt']))<.00002
        checks+=1
    assert abs(equity-sim['final_equity_usdt'])<.00002
    return checks


def prefix_check(d,old,raw_all):
    check_count=0
    check_dates=sorted(set([29,30,31,33,38,45,60,75,90,130,210,len(d)-1]))
    for last in check_dates:
        if last>=len(d):continue
        small=old.signals(d[:last+1])
        for fam,key in FAMILIES.items():
            for entry_days in (1,2,3):
                for exit_days in (1,2,3):
                    a=old.confirm(raw_all[key],entry_days,exit_days)[last]
                    b=old.confirm(small[key],entry_days,exit_days)[-1]
                    assert bool(a)==bool(b),(fam,entry_days,exit_days,date(d[last,0]))
                    check_count+=1
    return check_count


def post_sale_cash(old,d,sim,warmup):
    old.WARMUP_DAYS=warmup
    result=old.cash_windows(d,sim)
    assert result['cash_days']==sum(x['holding_btc']==0 for x in sim['daily'])
    return result


def map_raw_transitions(d,raw,warmup):
    transitions=[]
    for i in range(warmup-1,len(d)-1):
        if bool(raw[i])!=bool(raw[i-1]):
            end=next((k for k in range(i+1,len(d)) if bool(raw[k])!=bool(raw[i])),len(d))
            transitions.append(dict(index=i,signal_date=date(d[i,0]),side='BUY' if bool(raw[i]) else 'SELL',
                                    last_signal_index=end-1))
    return transitions


def trade_idx(d,sim):
    indices={date(v[0]):i for i,v in enumerate(d)}
    return [(indices[x['date_utc']],x) for x in sim['trade_ledger']]


def matched_execution_events(period,family,d,raw,sim_by_pair,warmup):
    """Compare C1,C1 with entry3/exit1 and entry1/exit3 when events match.

    A transition is comparable only when both portfolios execute the expected
    side *within the same uninterrupted raw signal run*. Never force a match
    across divergent exposure or claim an event price gap equals P&L.
    """
    baseline=trade_idx(d,sim_by_pair[(1,1)])
    entry3=trade_idx(d,sim_by_pair[(3,1)])
    exit3=trade_idx(d,sim_by_pair[(1,3)])
    events=[]
    for ev in map_raw_transitions(d,raw,warmup):
        i=ev['index'];j=ev['last_signal_index'];side=ev['side']
        if side=='BUY':alternative=entry3;label='ENTRY_DELAY_C3_VS_C1'
        else:alternative=exit3;label='EXIT_DELAY_C3_VS_C1'
        # An execution at daily open i+1..j+1 is causally linked to this raw run.
        a=[t for k,t in baseline if i+1<=k<=j+1 and t['side']==side]
        b=[t for k,t in alternative if i+1<=k<=j+1 and t['side']==side]
        ta=a[0] if len(a)==1 else None
        tb=b[0] if len(b)==1 else None
        if not ta or not tb:
            events.append(dict(period=period,family=family,type=label,signal_date_utc=ev['signal_date'],
                baseline_trade_date=ta['date_utc'] if ta else '',alternative_trade_date=tb['date_utc'] if tb else '',
                matched=False,delay_days='',market_price_change_pct='',adverse_price_move_pct=''))
            continue
        ia=next(k for k,t in baseline if t is ta)
        ib=next(k for k,t in alternative if t is tb)
        if ib < ia: raise AssertionError('C3 executed sooner than C1')
        price_a=float(d[ia,1]); price_b=float(d[ib,1])
        move=100*(price_b/price_a-1)
        # adverse: buy later dearer / sell later cheaper
        adverse=move if side=='BUY' else -move
        events.append(dict(period=period,family=family,type=label,signal_date_utc=ev['signal_date'],
            baseline_trade_date=ta['date_utc'],alternative_trade_date=tb['date_utc'],
            matched=True,delay_days=ib-ia,market_price_change_pct=round(move,5),
            adverse_price_move_pct=round(adverse,5)))
    return events


def write_csv(filename,records,fields):
    with (ROOT/filename).open('w',encoding='utf-8',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore');w.writeheader();w.writerows(records)


def main():
    old,series,meta=load_series()
    assert sum(x['minute_candles_verified'] for x in meta)==829440
    assert len(meta)==19
    prev2023=json.loads((ROOT/'SEVEN_HEAVEN_BTC_CONFIRMATION_INDEPENDENT_2023_APR_JUN_REPLAY_2026_11_11_PROOFS.json').read_text())
    prev2026=json.loads((ROOT/'SEVEN_HEAVEN_BTC_CONFIRMATION_DELAY_FALSE_EXITS_REBOUND_AUDIT_2026_11_11_PROOFS.json').read_text())
    previous_hold=json.loads((ROOT/'SEVEN_HEAVEN_BTC_REVERSAL_CONFIRMATION_FALSE_SIGNALS_CASH_COST_2026_11_11_PROOFS.json').read_text())
    output={};events=[];equities=[];decision_rows=[];checks=0;ledger_checks=0;baseline_match=0
    for period,d in series.items():
        warmup=30 if period=='2023' else 31
        assert d.shape[1]==5 and len(d)>warmup
        old.prev.BEGIN_DAY=warmup;old.WARMUP_DAYS=warmup
        raw=old.signals(d)
        current_prefix=prefix_check(d,old,raw);checks+=current_prefix
        by_family={}
        for fam,rawname in FAMILIES.items():
            simulations={};stats={}
            for en in (1,2,3):
                for ex in (1,2,3):
                    state,sim=run_policy(old,d,raw[rawname],en,ex,warmup)
                    _,stress=run_policy(old,d,raw[rawname],en,ex,warmup,2)
                    calc=post_sale_cash(old,d,sim,warmup)
                    ledger_checks+=ledger_check(d,sim,warmup)
                    assert len(sim['trade_ledger'])==sim['total_trades']
                    for trade in sim['trade_ledger']:
                        j=next(i for i in range(warmup,len(d)) if date(d[i,0])==trade['date_utc'])
                        assert date(d[j-1,0])==trade['signal_date_utc']
                        assert bool(state[j-1])==(trade['side']=='BUY')
                    key=f'ENTRY{en}_EXIT{ex}'
                    simulations[(en,ex)]=sim
                    info=dict(entry_confirmation_closes=en,exit_confirmation_closes=ex,
                          final_equity_usdt=sim['final_equity_usdt'],return_pct=sim['net_return_pct'],
                          stress2x_return_pct=stress['net_return_pct'],
                          max_daily_drawdown_pct=sim['max_close_to_close_drawdown_pct'],
                          trades=sim['total_trades'],buys=sim['buys'],sells=sim['sells'],
                          btc_exposure_days=sim['exposure_days'],cash_days=calc['cash_days'],
                          whipsaws_cash_7d=calc['short_cash_whipsaws_7d'],
                          post_sale_cash_days=calc['post_sale_cash_days'])
                    stats[key]=info
                    decision_rows.append(dict(period=period,family=fam,policy=key,**info))
                    for eq in sim['daily']:
                        equities.append(dict(period=period,family=fam,policy=key,**eq))
                    if en==ex:
                        prev=(prev2023['results'][f'{fam}_C{en}']['return_pct'] if period=='2023' else
                              prev2026['by_year'][period]['strategies'][f'{fam}_C{en}']['return_net_pct'])
                        assert abs(prev-sim['net_return_pct'])<1e-7,('Historical reproduction failed',period,fam,en,prev,sim['net_return_pct'])
                        baseline_match+=1
            this_events=matched_execution_events(period,fam,d,raw[rawname],simulations,warmup)
            events.extend(this_events)
            for label,type_ in [('entry_delay','ENTRY_DELAY_C3_VS_C1'),('exit_delay','EXIT_DELAY_C3_VS_C1')]:
                valid=[x for x in this_events if x['type']==type_ and x['matched']]
                stats[label+'_matched_events']=len(valid)
                stats[label+'_unmatched_events']=sum(x['type']==type_ and not x['matched'] for x in this_events)
                stats[label+'_median_days']=median([x['delay_days'] for x in valid]) if valid else None
                stats[label+'_median_adverse_btc_price_move_pct']=round(median([x['adverse_price_move_pct'] for x in valid]),4) if valid else None
                stats[label+'_event_details_file']=STEM+'_MATCHED_TRANSITIONS.csv'
            by_family[fam]=stats
        # Unchanged Buy & Hold baseline for the same calendar window and costs.
        _,hold=run_policy(old,d,np.ones(len(d),dtype=bool),1,1,warmup)
        _,hold_stress=run_policy(old,d,np.ones(len(d),dtype=bool),1,1,warmup,2)
        ledger_checks+=ledger_check(d,hold,warmup)
        historical_hold=(prev2023['results']['HOLD_BTC']['return_pct'] if period=='2023'
                         else previous_hold['by_period'][period]['results']['BUY_HOLD']['net_return_pct'])
        assert abs(historical_hold-hold['net_return_pct'])<1e-7
        hold_summary=dict(return_pct=hold['net_return_pct'],
                          final_equity_usdt=hold['final_equity_usdt'],
                          stress2x_return_pct=hold_stress['net_return_pct'],
                          max_daily_drawdown_pct=hold['max_close_to_close_drawdown_pct'],
                          trades=hold['total_trades'])
        for eq in hold['daily']:
            equities.append(dict(period=period,family='BASELINE',policy='BUY_HOLD',**eq))
        decision_rows.append(dict(period=period,family='BASELINE',policy='BUY_HOLD',
                             final_equity_usdt=hold['final_equity_usdt'],
                             return_pct=hold['net_return_pct'],
                             stress2x_return_pct=hold_stress['net_return_pct'],
                             max_daily_drawdown_pct=hold['max_close_to_close_drawdown_pct'],
                             trades=hold['total_trades'],btc_exposure_days=hold['exposure_days'],
                             cash_days=0))
        output[period]=dict(buy_hold_benchmark=hold_summary,warmup_days=warmup,simulated_days=len(d)-warmup,
                    from_utc=date(d[warmup,0]),to_utc=date(d[-1,0]),
                    prefix_invariance_checks=current_prefix,families=by_family)
        print('PERIOD',period,'daily',len(d),'prefix checks',current_prefix,'baselines',baseline_match,flush=True)
        for fam,stats in by_family.items():
            print(fam,'EXIT_FAST_ENTRY_SLOW',stats['ENTRY3_EXIT1']['return_pct'],
                  'ENTRY_FAST_EXIT_SLOW',stats['ENTRY1_EXIT3']['return_pct'],
                  'baseline',stats['ENTRY1_EXIT1']['return_pct'],
                  'DD of slow entry',stats['ENTRY3_EXIT1']['max_daily_drawdown_pct'],flush=True)
    assert baseline_match==36  # 4 periods x 3 families x 3 diagonal variants
    assert sum(x['simulated_days'] for x in output.values())==61+60+59+273
    assert checks>=1000 and ledger_checks>10000
    evsumm={}
    for period in PERIODS:
        evsumm[period]={}
        for fam in FAMILIES:
            a=output[period]['families'][fam]
            base=a['ENTRY1_EXIT1']; quicksell=a['ENTRY3_EXIT1']; quickbuy=a['ENTRY1_EXIT3']
            evsumm[period][fam]={
              'base_C1_C1_return_pct':base['return_pct'],
              'slow_entry_fast_exit_C3_C1_return_pct':quicksell['return_pct'],
              'fast_entry_slow_exit_C1_C3_return_pct':quickbuy['return_pct'],
              'slow_entry_minus_base_percentage_points':round(quicksell['return_pct']-base['return_pct'],4),
              'slow_exit_minus_base_percentage_points':round(quickbuy['return_pct']-base['return_pct'],4),
              'entry_delay_median_days_when_matched':a['entry_delay_median_days'],
              'exit_delay_median_days_when_matched':a['exit_delay_median_days'],
              'entry_delay_median_adverse_price_pct_when_matched':a['entry_delay_median_adverse_btc_price_move_pct'],
              'exit_delay_median_adverse_price_pct_when_matched':a['exit_delay_median_adverse_btc_price_move_pct'],
              'matched_entry_events':a['entry_delay_matched_events'],
              'matched_exit_events':a['exit_delay_matched_events']}
    proof=dict(schema='seven-heaven.btc-entry-exit-asymmetric-confirmation-audit.v1',
       research_date_utc='2026-11-11',research_only=True,real_orders=False,
       protocol=STEM+'_PROTOCOL.md',already_explored_samples=True,
       market='Binance Spot BTCUSDT native 1-minute SHA-256-verified archives',
       verified_months=meta,minutes_verified=sum(z['minute_candles_verified'] for z in meta),
       initial_capital_usdt=CAPITAL,fee_per_side=.001,slippage_per_side=.0005,
       double_cost_stress=True,latency='closed UTC day D -> hypothetical trade at UTC D+1 opening',
       sample_note='2023 April warmup/May-June trading; 2024/25 January warmup/Feb-Mar trading; 2026 January warmup/Feb-Oct trading',
       comparison_grid='3x3 entry/exit streaks in {1,2,3} for EMA, SuperTrend and consensus',
       side_delayed_cost_definition='Price change for matched events only (does not equal realized portfolio P&L)',
       causality_prefix_assertions=checks,independent_ledger_daily_checks=ledger_checks,
       previous_symmetric_replay_exact_matches=baseline_match,
       previous_buy_hold_baselines_exact_matches=4,
       script_sha256=hashlib.sha256((ROOT/(STEM+'.py')).read_bytes()).hexdigest(),
       results=output,side_comparisons=evsumm,
       warnings=['EXPLORATORY ONLY: the same market periods were examined in prior research',
                 'C1/C2/C3 portfolio paths diverge; event price differences are not additive P&L',
                 'Only 4 contiguous windows with one underlying BTC exchange/pair',
                 'No live exchange spread, order book, taxes, partial fills or OKX BTCUSDC costs',
                 'Do not select a winner after comparing these 9 combinations and claim out-of-sample validation'])
    (ROOT/(STEM+'_PROOFS.json')).write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    write_csv(STEM+'_RESULTS.csv',decision_rows,
              ['period','family','policy','entry_confirmation_closes','exit_confirmation_closes','final_equity_usdt','return_pct','stress2x_return_pct','max_daily_drawdown_pct','trades','buys','sells','btc_exposure_days','cash_days','whipsaws_cash_7d','post_sale_cash_days'])
    write_csv(STEM+'_EQUITY_DAILY.csv',equities,['period','family','policy','date_utc','equity_usdt','holding_btc'])
    write_csv(STEM+'_MATCHED_TRANSITIONS.csv',events,
              ['period','family','type','signal_date_utc','baseline_trade_date','alternative_trade_date','matched','delay_days','market_price_change_pct','adverse_price_move_pct'])
    lines=['# Seven Heaven — Retards asymétriques à l’entrée et à la sortie BTC','',
       '**Étude du 11 novembre 2026 · uniquement PAPER, aucun ordre, aucune modification de l’interface.**','',
       '## Méthode et antériorité','',
       '- Protocole de ce test : `'+STEM+'_PROTOCOL.md`, avec les 9 combinaisons par famille fixées avant ce calcul.',
       f'- **{proof["minutes_verified"]:,} bougies natives BTCUSDT 1m**, 19 ZIP d’origine validés SHA-256 (2023 Q2, 2024 Q1, 2025 Q1, 2026 janvier–octobre).',
       '- Les indicateurs sont inchangés : EMA10/30 (+ close > EMA30), SuperTrend ATR14×3 et consensus 2/3 EMA/MACD/ADX.',
       '- Une confirmation de N jours = N clôtures journalières UTC consécutives identiques. Entrée (achat BTC) et sortie (vente BTC) peuvent attendre un nombre différent de clôtures.',
       '- Portefeuille : 1 000 USDT, une position intégrale BTC ou cash, signal après clôture D et exécution fictive à l’ouverture D+1, frais 0,10 % et glissement 0,05 % par côté.',
       '- Comparer aussi les coûts ×2 et les drawdowns quotidiens. Aucune année n’est réinitialisée à l’intérieur de sa période simulée.',
       '- **Limite impérative : 2023, 2024, 2025, 2026 ont déjà été exploitées par notre équipe. Cette étude n’est PAS un test hors échantillon inédit.**',
       '', '## Résultat : comparaison asymétrique pré-déclarée','',
       'Signification : `E1/S1` = entrée après 1 clôture, sortie après 1 ; `E3/S1` = entrée lente, sortie rapide ; `E1/S3` = entrée rapide, sortie lente. Valeurs nettes simulées, en %.','']
    for period in PERIODS:
        lines += [f'### {period} — {output[period]["from_utc"]} à {output[period]["to_utc"]}', '',
           '| Indicateur | E1/S1 | E3/S1 | E1/S3 | E2/S2 | E3/S3 | E3/S1 : écart au témoin | E1/S3 : écart au témoin |',
           '|---|---:|---:|---:|---:|---:|---:|---:|']
        for fam,z in output[period]['families'].items():
            b=z['ENTRY1_EXIT1']['return_pct']; a=z['ENTRY3_EXIT1']['return_pct'];c=z['ENTRY1_EXIT3']['return_pct']
            lines.append(f'| {fam} | {b:+.2f} % | {a:+.2f} % | {c:+.2f} % | {z["ENTRY2_EXIT2"]["return_pct"]:+.2f} % | {z["ENTRY3_EXIT3"]["return_pct"]:+.2f} % | {a-b:+.2f} pp | {c-b:+.2f} pp |')
        lines.append(f"\nTémoin Buy & Hold 100 % BTC : {output[period]['buy_hold_benchmark']['return_pct']:+.2f} % net.\n")
    lines += ['## Coût du retard d’un côté, sans le confondre avec le rendement complet','',
       'Les changements de position survenant après un renversement d’état brut sont rapprochés **uniquement** si les deux simulations effectuent le même côté (achat ou vente) pendant la **même séquence ininterrompue** du signal brut.',
       'Pour une entrée retardée, une hausse du prix entre les deux achats est défavorable ; pour une vente retardée, une baisse est défavorable. Ces mouvements de prix sont **des diagnostics locaux, jamais un P&L additionnable**. Les transitions sans paire comparable restent marquées `matched=false` dans le CSV.', '',
       '| Période | Famille | Entrées comparables | Entrée retardée : médiane jours | Mouvement adverse médian | Sorties comparables | Sortie retardée : médiane jours | Mouvement adverse médian |',
       '|---|---|---:|---:|---:|---:|---:|---:|']
    for period in PERIODS:
        for fam,z in output[period]['families'].items():
            fmt=lambda x: '—' if x is None else str(x)
            lines.append(f'| {period} | {fam} | {z["entry_delay_matched_events"]} | {fmt(z["entry_delay_median_days"])} | {fmt(z["entry_delay_median_adverse_btc_price_move_pct"])} % | {z["exit_delay_matched_events"]} | {fmt(z["exit_delay_median_days"])} | {fmt(z["exit_delay_median_adverse_btc_price_move_pct"])} % |')
    lines += ['', '## Contrôles effectués','',
      f'- **{checks} assertions de causalité** par préfixe de séries et **{ledger_checks} comparaisons** du portefeuille avec un livre comptable indépendant.',
      f'- **{baseline_match} résultats symétriques** (C1/C2/C3) retrouvés exactement dans les études antérieures.',
      '- Les chemins de portefeuille divergent quand on modifie les délais ; un écart de rendement global ne peut pas être imputé à une seule transaction.',
      '- Les performances d’une stratégie en liquidités peuvent refléter une hausse manquée ; une sortie rapide peut aussi éviter une baisse. Examiner ensemble rendement, capital final, drawdown, coûts et temps d’exposition.',
      '', '## Reproductibilité et passation','',
      f'- Code : `{STEM}.py`; protocole : `{STEM}_PROTOCOL.md`.',
      f'- JSON détaillé avec sources SHA, matrice complète, stress de coûts, contrôle causal : `{STEM}_PROOFS.json`.',
      f'- Résumé tabulaire : `{STEM}_RESULTS.csv` ; courbes quotidiennes : `{STEM}_EQUITY_DAILY.csv` ; appariement des délais : `{STEM}_MATCHED_TRANSITIONS.csv`.',
      '- Modules source requis : précédents scripts d’indicateurs, de simulation, de parsing, et de validation 2023 déjà publiés dans le répertoire partagé.',
      '- Les ZIP binaires de marché restent dans GitHub Releases ; ils ne sont pas dupliqués dans Git main.',
      '- **Il faut geler une règle retenue et l’évaluer sur une nouvelle période non encore explorée avant toute conclusion de robustesse.**',
      '', '**Aucun ordre réel, aucune mise à jour du Trader, Operator, Administrator ou Bridge.**','']
    (ROOT/(STEM+'_REPORT.md')).write_text('\n'.join(lines),encoding='utf-8')
    print('COMPLETE',STEM,flush=True)

if __name__=='__main__':main()
