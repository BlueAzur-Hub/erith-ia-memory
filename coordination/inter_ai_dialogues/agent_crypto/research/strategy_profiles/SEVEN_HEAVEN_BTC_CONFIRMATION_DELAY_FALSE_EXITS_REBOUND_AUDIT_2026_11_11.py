#!/usr/bin/env python3
"""Seven Heaven -- controlled PAPER audit of confirmation delay and cash regret.

Uses exclusively user-provided, registry SHA256-verified native Binance Spot BTCUSDT
one-minute ZIPs. Signal evaluated on completed UTC daily bar, hypothetical fill
on next day's open. Price-future labels evaluate outcomes only; never trade inputs.

This is a sensitivity audit on REUSED windows, NOT out-of-sample validation.
It compares fixed 1/2/3-consecutive-close confirmation for the SAME pre-existing
EMA10/30, SuperTrend ATR14x3 and consensus EMA/MACD/ADX signals.

No network, private account data, exchange APIs, or orders.
"""
from __future__ import annotations
import csv, datetime as dt, importlib.util, json, math, hashlib
from pathlib import Path
import numpy as np

HERE=Path(__file__).resolve().parent
STEM='SEVEN_HEAVEN_BTC_CONFIRMATION_DELAY_FALSE_EXITS_REBOUND_AUDIT_2026_11_11'
SOURCE=HERE/'SEVEN_HEAVEN_BTC_REVERSAL_CONFIRMATION_FALSE_SIGNALS_CASH_COST_2026_11_11.py'
sp=importlib.util.spec_from_file_location('seven_confirm_prev',SOURCE)
old=importlib.util.module_from_spec(sp);sp.loader.exec_module(old)
PAIRS={'EMA':'EMA_RAW', 'SUPERTREND':'ST_RAW','CONSENSUS':'CONSENSUS_RAW'}
CONFIRM_COUNTS=(1,2,3)
PERIODS=('2024','2025','2026')


def name_date(ms):
    return dt.datetime.fromtimestamp(int(ms)/1000,dt.timezone.utc).strftime('%Y-%m-%d')


def candidate_runs(signal, start):
    """Number of raw flips reversing in <N close samples, not necessarily harmful."""
    x=np.asarray(signal,dtype=bool)
    runs=[]; cur=bool(x[0]);beg=0
    for i in range(1,len(x)):
        if bool(x[i])!=cur:
            if i>=start:runs.append((beg,i,i-beg,cur))
            beg=i;cur=bool(x[i])
    # discard final censored run rather than calling it an ignorable false signal
    return [dict(start_idx=a,end_idx=b,length_days=n,signal_bull=state)
            for a,b,n,state in runs if a>=start-1]


def evaluate_sale_events(d,sim):
    """Look-ahead labels attached ONLY to evaluations of hypothetical sells.

    Seven-day BTC price movement from sale OPEN to seventh later day's CLOSE.
    A sell followed by +3% is labeled a missed *potential* rally, -3% an
    avoided *potential* decline; actual portfolio may have repurchased earlier.
    'Would have' cannot be inferred from these labels or individual events.
    """
    index={name_date(r[0]):i for i,r in enumerate(d)}
    rows=[]
    for t in sim['trade_ledger']:
        if t['side']!='SELL':continue
        i=index[t['date_utc']];entry=float(d[i,1]);j=i+7
        if j>=len(d):
            rows.append(dict(sell_date=t['date_utc'],sell_open_usdt=entry,
                day7_date=None,day7_close_usdt=None,btc_7d_change_pct=None,
                label='RIGHT_CENSORED',reentry_within_7d=False))
            continue
        gain=100*(float(d[j,4])/entry-1)
        bought_again=any(q['side']=='BUY' and index[q['date_utc']]>i and index[q['date_utc']]<=j for q in sim['trade_ledger'])
        label='BTC_ROSE_GE_3PCT' if gain>=3 else ('BTC_FELL_LE_MINUS_3PCT' if gain<=-3 else 'NEUTRAL_ABS_LT_3PCT')
        rows.append(dict(sell_date=t['date_utc'],sell_open_usdt=round(entry,5),
            day7_date=name_date(d[j,0]),day7_close_usdt=round(float(d[j,4]),5),
            btc_7d_change_pct=round(gain,4),label=label,reentry_within_7d=bool(bought_again)))
    return rows


def compare_policies(d, raw):
    """Respect correct 31-day pre-trade signal warm-up; all runs causal."""
    result={};equity=[];sales=[];winrows=[]
    for family in PAIRS:
        state=raw[PAIRS[family]]
        for k in CONFIRM_COUNTS:
            key=f'{family}_C{k}'
            sig=state if k==1 else old.confirm(state,k,k)
            sim=old.simulate(d,sig)
            stress=old.simulate(d,sig,2)
            windows=old.cash_windows(d,sim)
            labeled=evaluate_sale_events(d,sim)
            trades=sim['trade_ledger']
            # Independently verify next-open execution lag for every simulated trade
            ix={name_date(x[0]):i for i,x in enumerate(d)}
            for t in trades:
                j=ix[t['date_utc']]
                assert j>=31 and bool(sig[j-1]) == (t['side']=='BUY')
                assert t['signal_date_utc']==name_date(d[j-1,0])
            counts={k:sum(v['label']==k for v in labeled) for k in ('BTC_ROSE_GE_3PCT','BTC_FELL_LE_MINUS_3PCT','NEUTRAL_ABS_LT_3PCT','RIGHT_CENSORED')}
            summary={
                'return_net_pct':sim['net_return_pct'],
                'final_equity_usdt':sim['final_equity_usdt'],
                'max_daily_drawdown_pct':sim['max_close_to_close_drawdown_pct'],
                'operations':sim['total_trades'],
                'cash_days':windows['cash_days'],
                'cash_share_pct':windows['cash_share_pct'],
                'post_sale_cash_days':windows['post_sale_cash_days'],
                'post_sale_cash_windows_closed':windows['closed_post_sale_windows'],
                'whipsaws_cash_7d':windows['short_cash_whipsaws_7d'],
                'cash_windows_with_btc_rise':windows['closed_cash_windows_ended_with_btc_rise'],
                'cash_windows_with_btc_decline':windows['closed_cash_windows_ended_with_btc_drop'],
                'sale_event_7d_evaluation':counts,
                'stress_2x_return_pct':stress['net_return_pct'],
                'position_exposure_days':sim['exposure_days'],
                'initial_preentry_cash_days':windows['initial_cash_days'],
                'trade_ledger':trades,
            }
            result[key]=summary
            for row in sim['daily']:
                equity.append(dict(policy=key,**row))
            for w in windows['windows']:
                winrows.append(dict(policy=key,**w))
            for ev in labeled:
                sales.append(dict(policy=key,**ev))
    return result,equity,sales,winrows


def validate_prefix(d, raw):
    """Prefix invariance: the same historical closes must yield same signals."""
    n=0
    indices=sorted(set([32,34,35,39,42,59,65,75,89,130,210,len(d)-1]))
    full={f'{family}_C{k}':(raw[base] if k==1 else old.confirm(raw[base],k,k)) for family,base in PAIRS.items() for k in CONFIRM_COUNTS}
    for j in indices:
        if j>=len(d):continue
        compact=old.signals(d[:j+1])
        for family,base in PAIRS.items():
            for k in CONFIRM_COUNTS:
                sig=compact[base] if k==1 else old.confirm(compact[base],k,k)
                assert bool(sig[-1]) == bool(full[f'{family}_C{k}'][j]),('future leak',family,k,j)
                n+=1
    return n


def export_csv(path,rows,fields):
    with path.open('w',encoding='utf-8',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore')
        w.writeheader();w.writerows(rows)


def run():
    sources,meta=old.prev.rev.read_all()
    assert set(sources)==set(PERIODS)
    total_minutes=sum(x['minute_candles_verified'] for x in meta)
    assert total_minutes==698400 and len(meta)==16
    output={};equity=[];sales=[];cash=[];total_checks=0
    for year in PERIODS:
        d=sources[year]
        raw=old.signals(d)
        checks=validate_prefix(d,raw);total_checks+=checks
        summaries,curves,events,windows=compare_policies(d,raw)
        output[year]=dict(day_count=len(d),paper_trading_days=len(d)-31,
            period_begin=name_date(d[31,0]),period_end=name_date(d[-1,0]),
            causal_prefix_assertions=checks,strategies=summaries)
        equity.extend(dict(year=year,**x) for x in curves)
        sales.extend(dict(year=year,**x) for x in events)
        cash.extend(dict(year=year,**x) for x in windows)
        print('PERIOD',year,'checks',checks,flush=True)
        for family in PAIRS:
            for k in CONFIRM_COUNTS:
                key=f'{family}_C{k}';v=summaries[key]
                print(key, 'return',v['return_net_pct'], 'DD',v['max_daily_drawdown_pct'],
                      'trades',v['operations'],'cash_days',v['cash_days'],
                      'whips',v['whipsaws_cash_7d'],flush=True)
        # Exact reference replay for pre-existing raw and 2-close returns
        for family,base in PAIRS.items():
            for k in (1,2):
                name=f'{family}_C{k}'
                expect_name=base if k==1 else ('EMA_CONFIRM_2D' if family=='EMA' else ('ST_CONFIRM_2D' if family=='SUPERTREND' else 'CONSENSUS_CONFIRM_2D'))
                reference=old.simulate(d,old.signals(d)[expect_name])
                assert abs(reference['net_return_pct']-summaries[name]['return_net_pct'])<1e-7
        print('REFERENCE_REPLAY_MATCHED',year,flush=True)
    e_sha=hashlib.sha256((HERE/(STEM+'.py')).read_bytes()).hexdigest()
    proof=dict(schema='seven-heaven.btc-confirmation-delay-and-false-exits-audit.v1',
        generated_utc=dt.datetime.now(dt.timezone.utc).isoformat(),
        source='Binance Spot BTCUSDT original 1m ZIP, user-provided and SHA-256 validated',
        verified_months=meta,minutes_verified=total_minutes,
        script_sha256=e_sha,initial_capital_usdt=1000.,
        fee_side=0.001,slippage_side=0.0005,stress_factor=2,
        early_data_use='January of each independent period for daily indicator warm-up only',
        trades='Hypothetical next UTC day open, triggered by prior completed UTC daily candle',
        compared_confirmations=[1,2,3],families=list(PAIRS.keys()),
        sale_7d_label='Ex-post BTC change from SELL open to close of seventh subsequent UTC trading day; >=+3% missed rebound, <=-3% avoided drop, otherwise neutral; label not used for trading',
        warnings=['Already explored periods; no genuine new out-of-sample test','One price series Binance BTCUSDT only, not OKX BTCUSDC','Estimated fees/slippage and fills, no order book','Gross BTC changes in cash windows are not additive P&L', 'Censored windows/events excluded from right-edge directional counts', 'Any apparent best configuration is ex-post and must not be promoted as robust or prospective'],
        prefix_causality_checks=total_checks,by_year=output)
    (HERE/(STEM+'_PROOFS.json')).write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    export_csv(HERE/(STEM+'_SALE_EVENTS_7D.csv'),sales,
        ['year','policy','sell_date','sell_open_usdt','day7_date','day7_close_usdt','btc_7d_change_pct','label','reentry_within_7d'])
    export_csv(HERE/(STEM+'_CASH_WINDOWS.csv'),cash,
        ['year','policy','kind','start_day','end_day','exit_day','days','start_price','end_price','btc_price_change_pct','censored','short_cash_whipsaw','short_cash_missed_rally'])
    export_csv(HERE/(STEM+'_EQUITY_DAILY.csv'),equity,
        ['year','policy','date_utc','equity_usdt','holding_btc'])
    lines=['# Seven Heaven — Confirmation des retournements : coût du retard et faux signaux',
        '', '**11 novembre 2026 · recherche PAPER documentaire · aucune exécution d’ordre.**',
        '', '## Objet et sources',
        '', f'- 16 fichiers ZIP natifs Binance Spot BTC/USDT 1m vérifiés SHA-256 : **{total_minutes:,} minutes**.',
        '- Échantillons 2024 T1, 2025 T1 et janvier–octobre 2026 ; janvier sert à initialiser les indicateurs, l’étude des portefeuilles commence au 1er février.',
        '- Trois états existants et inchangés : EMA 10/30 (et close > EMA30), SuperTrend ATR14×3, consensus 2/3 EMA/MACD/ADX.',
        '- Confirmation symétrique : état brut (C1), 2 clôtures consécutives (C2), 3 clôtures (C3). Position initiale cash, jusqu’à premier signal haussier confirmé.',
        '- Toute décision est prise à la clôture UTC du jour D avec exécution fictive à l’ouverture de D+1.',
        '- Capital 1 000 USDT, frais 0,10 % et glissement 0,05 % par côté ; deuxième scénario à coûts doublés ; mark-to-liquidation quotidien.',
        '', '## Résultats : rentabilité / baisse maximale / transactions / liquidités', '']
    for yr in PERIODS:
        a=output[yr]
        lines.extend([f'### {yr} — {a["paper_trading_days"]} jours PAPER', '',
                      '| Stratégie | Rendement net | Coûts ×2 | Drawdown | Opérations | Cash jours | Allers-retours cash ≤7j |',
                      '|---|---:|---:|---:|---:|---:|---:|'])
        for fam in PAIRS:
            for k in CONFIRM_COUNTS:
                z=a['strategies'][f'{fam}_C{k}']
                lines.append(f'| {fam} {k} clôture(s) | {z["return_net_pct"]:+.2f} % | {z["stress_2x_return_pct"]:+.2f} % | {z["max_daily_drawdown_pct"]:.2f} % | {z["operations"]} | {z["cash_days"]} | {z["whipsaws_cash_7d"]} |')
        lines+=['']
    lines+=['## Sorties fictives : ce que Bitcoin fait dans les sept jours', '',
        'La classification suivante est faite **après les sept jours** et **n’entre jamais dans un signal**. Pour chaque vente fictive, le cours BTC de clôture à J+7 est comparé au prix d’ouverture de vente. Un retour >+3 % signale une reprise potentiellement manquée, une baisse <-3 % une exposition potentiellement évitée. Certaines stratégies rachètent avant J+7 : les catégories **ne sont pas des profits ou des économies réalisées**.', '']
    for yr in PERIODS:
        lines.extend([f'### {yr}', '', '| Méthode | Sorties J+7 BTC ≥ +3 % | Sorties J+7 BTC ≤ −3 % | Neutres | Censurées |', '|---|---:|---:|---:|---:|'])
        for fam in PAIRS:
            for k in CONFIRM_COUNTS:
                z=output[yr]['strategies'][f'{fam}_C{k}']['sale_event_7d_evaluation']
                lines.append(f'| {fam} C{k} | {z["BTC_ROSE_GE_3PCT"]} | {z["BTC_FELL_LE_MINUS_3PCT"]} | {z["NEUTRAL_ABS_LT_3PCT"]} | {z["RIGHT_CENSORED"]} |')
        lines+=['']
    lines += ['## Lecture critique', '',
        '- **Un signal confirmé fait moins de transactions, mais peut sortir plus tard.** Il faut regarder simultanément rendement, drawdown, jours en liquidités et rebonds après vente.',
        '- Les séries 2024–2026 sont **déjà exploitées** par les études précédentes : elles ne peuvent ni servir de holdout inédit, ni donner un gagnant universel. Comparaison de sensibilité seulement.',
        '- Un « faux signal » est un jugement rétrospectif ; notre définition opérationnelle d’un aller-retour est vente puis rachat en ≤7 jours, tandis que la classe de J+7 étudie le comportement du prix. Ces mesures ne doivent pas être confondues.',
        '- Une stratégie passant 100 % de la fenêtre en liquidités peut afficher 0 % en évitant tout risque BTC, mais ne produit aucune alpha ; elle peut manquer tout un marché haussier.',
        '- Aucun prix de carnet ni contrôle de file d’attente ; les frais OKX européens et tailles minimales ne sont pas renseignés. Les valorisations et les transactions sont seulement simulées.',
        '', '## Passation inter-IA : reproduire', '',
        f'- Programme : `{STEM}.py` (nécessite Python 3 et numpy).',
        f'- Preuves détaillées : `{STEM}_PROOFS.json`, empreintes SHA-256 des 16 mois et journal de transactions inclus.',
        f'- Sorties : `{STEM}_SALE_EVENTS_7D.csv`, `{STEM}_CASH_WINDOWS.csv`, `{STEM}_EQUITY_DAILY.csv`.',
        '- Script source dépend du moteur confirmé publié : `SEVEN_HEAVEN_BTC_REVERSAL_CONFIRMATION_FALSE_SIGNALS_CASH_COST_2026_11_11.py` et de ses modules antérieurs dans le même dossier.',
        '- Les ZIP d’origine restent des actifs GitHub Releases, ne pas les dupliquer dans Git. Les audits locaux vérifient leur SHA-256 avant toute analyse.',
        f'- Contrôle causal : **{total_checks} comparaisons préfixes/série complète** et concordance exacte des rendements avec les modèles C1/C2 de l’étude précédente.',
        '- Pour une validation indépendante sans réutiliser ces fenêtres, ouvrir une série chronologique non déjà étudiée (par exemple 2023), geler les seuils C1/C2/C3 ici définis, et vérifier coût de la sortie tardive ainsi que les occasions manquées.',
        '', '**Aucune modification de l’Administrator, Operator, Trader ou Bridge. Aucune transaction réelle.**', '']
    (HERE/(STEM+'_REPORT.md')).write_text('\n'.join(lines),encoding='utf-8')
    print('VERIFIED',total_minutes,'minutes,',total_checks,'causality assertions; proof and 4 outputs written',flush=True)
    return proof

if __name__=='__main__':run()
