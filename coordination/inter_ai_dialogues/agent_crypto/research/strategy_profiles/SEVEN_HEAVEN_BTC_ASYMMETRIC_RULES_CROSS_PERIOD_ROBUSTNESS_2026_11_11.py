#!/usr/bin/env python3
"""Read-only cross-period anti-overfitting audit of previously published PAPER proof.

No data fetching, no new strategy optimization, no live orders. This uses the
published proof of 108 strategies on FOUR ALREADY EXAMINED windows, so its
leave-one-window-out selection diagnostics are NOT genuinely unseen tests.
"""
import csv, hashlib, json, math, statistics
from pathlib import Path

ROOT=Path(__file__).resolve().parent
STEM='SEVEN_HEAVEN_BTC_ASYMMETRIC_RULES_CROSS_PERIOD_ROBUSTNESS_2026_11_11'
SOURCE=ROOT/'SEVEN_HEAVEN_BTC_ENTRY_EXIT_ASYMMETRIC_CONFIRMATION_AUDIT_2026_11_11_PROOFS.json'
PERIODS=('2023','2024','2025','2026')
FAMILIES=('EMA','SUPERTREND','CONSENSUS')
CANDIDATES=('ENTRY1_EXIT1','ENTRY3_EXIT1','ENTRY1_EXIT3','ENTRY2_EXIT2')


def money(x):return round(float(x),4)


def main():
    raw=SOURCE.read_bytes();d=json.loads(raw)
    assert d['schema']=='seven-heaven.btc-entry-exit-asymmetric-confirmation-audit.v1'
    assert d['already_explored_samples'] is True
    assert d['minutes_verified']==829440
    assert set(d['results'])==set(PERIODS)
    assert d['previous_symmetric_replay_exact_matches']==36
    assert d['independent_ledger_daily_checks']==12684
    panel=[]
    for p in PERIODS:
        v=d['results'][p]
        assert v['simulated_days'] in (59,60,61,273)
        hold=v['buy_hold_benchmark']
        assert 0<float(hold['final_equity_usdt']) and float(hold['return_pct'])>-100
        for fam in FAMILIES:
            assert sum(k.startswith('ENTRY') and '_EXIT' in k for k in v['families'][fam])==9
            for policy in CANDIDATES:
                x=v['families'][fam][policy]
                assert x['entry_confirmation_closes'] in (1,2,3)
                assert x['exit_confirmation_closes'] in (1,2,3)
                eq=float(x['final_equity_usdt'])
                assert abs((eq/1000.-1)*100-x['return_pct'])<0.0002
                assert math.isfinite(eq) and eq>0
                holdval=float(hold['final_equity_usdt'])
                # Difference of log growth, normalized by simulation duration.
                log_excess_day=math.log(eq/holdval)/v['simulated_days']
                panel.append(dict(period=p,days=v['simulated_days'],family=fam,policy=policy,
                    return_pct=money(x['return_pct']),stress2x_pct=money(x['stress2x_return_pct']),
                    hold_return_pct=money(hold['return_pct']),excess_hold_pp=money(x['return_pct']-hold['return_pct']),
                    log_relative_growth_day=round(log_excess_day,9),
                    max_daily_drawdown_pct=money(x['max_daily_drawdown_pct']),
                    operations=int(x['trades']),cash_days=int(x['cash_days']),
                    cash_share_pct=money(100*x['cash_days']/v['simulated_days'])))
    assert len(panel)==4*3*4
    summary=[];wide={}
    for fam in FAMILIES:
        for policy in CANDIDATES:
            a=[z for z in panel if z['family']==fam and z['policy']==policy]
            assert len(a)==4
            summary.append(dict(family=fam,policy=policy,
                periods_positive_return=sum(x['return_pct']>0 for x in a),
                periods_above_hold=sum(x['excess_hold_pp']>0 for x in a),
                periods_below_hold=sum(x['excess_hold_pp']<0 for x in a),
                worst_period_return_pct=money(min(x['return_pct'] for x in a)),
                median_period_return_pct=money(statistics.median(x['return_pct'] for x in a)),
                worst_daily_drawdown_pct=money(min(x['max_daily_drawdown_pct'] for x in a)),
                median_excess_hold_pp=money(statistics.median(x['excess_hold_pp'] for x in a)),
                total_operations=sum(x['operations'] for x in a),
                total_cash_days=sum(x['cash_days'] for x in a),
                total_observed_days=sum(x['days'] for x in a),
                periods_positive_stress2x=sum(x['stress2x_pct']>0 for x in a)))
            wide[(fam,policy)]={x['period']:x for x in a}
    paired=[]
    for fam in FAMILIES:
        for policy in CANDIDATES[1:]:
            diffs=[]
            for p in PERIODS:
                base=wide[(fam,'ENTRY1_EXIT1')][p]
                alt=wide[(fam,policy)][p]
                delta=money(alt['return_pct']-base['return_pct'])
                diffs.append(delta)
                paired.append(dict(period=p,family=fam,alternative=policy,base='ENTRY1_EXIT1',
                    return_delta_pp=delta,
                    drawdown_delta_pp=money(alt['max_daily_drawdown_pct']-base['max_daily_drawdown_pct']),
                    cost_stress_delta_pp=money(alt['stress2x_pct']-base['stress2x_pct'])))
            assert len(diffs)==4
    loo=[]
    for holdout in PERIODS:
        train=[p for p in PERIODS if p!=holdout]
        ranks=[]
        for fam in FAMILIES:
            for pol in CANDIDATES:
                a=wide[(fam,pol)]
                vals=[a[p]['log_relative_growth_day'] for p in train]
                ranks.append((statistics.median(vals),fam,pol))
        # deterministic tie-breaker alphabetical; used only as diagnostic of reusing four explored windows
        ranks.sort(key=lambda x:(-x[0],x[1],x[2]))
        rank,fam,pol=ranks[0]
        x=wide[(fam,pol)][holdout]
        loo.append(dict(evaluation_period=holdout,training_periods='+'.join(train),
            selected_family=fam,selected_policy=pol,
            median_training_log_excess_day=round(rank,9),
            evaluation_return_pct=x['return_pct'],
            evaluation_hold_return_pct=x['hold_return_pct'],
            evaluation_excess_hold_pp=x['excess_hold_pp'],
            evaluation_max_drawdown_pct=x['max_daily_drawdown_pct'],
            diagnostic_only_already_explored=True))
    record={
        'schema':'seven-heaven.btc-asymmetric-cross-period-descriptive-robustness.v1',
        'research_date':'2026-11-11',
        'source_proof':SOURCE.name,
        'source_proof_sha256':hashlib.sha256(raw).hexdigest(),
        'source_proof_original_minutes_verified':829440,
        'source_verification':'Published upstream study previously validated 19 native-minute ZIPs; this scorecard reads its JSON proof, not the ZIPs again.',
        'windows':{p:dict(start=d['results'][p]['from_utc'],end=d['results'][p]['to_utc'],days=d['results'][p]['simulated_days'],buy_hold_pct=d['results'][p]['buy_hold_benchmark']['return_pct']) for p in PERIODS},
        'families':list(FAMILIES),'fixed_candidate_policies':list(CANDIDATES),
        'all_windows_already_explored':True,
        'true_new_out_of_sample_validation':False,
        'leave_one_out_not_independent_due_to_prior_research':True,
        'selection_metric':'median log(strategy final equity / buy-and-hold final equity) divided by window days, on other 3 previously explored windows',
        'costs':'Same as source: fee 0.10% + slippage 0.05% per side; stress double both',
        'panel':panel,'candidate_summary':summary,'paired_alternative_to_E1S1':paired,'leave_one_out_diagnostic':loo,
        'limitations':[
            'Different calendar-window durations (59, 60, 61, 273 days) prevent interpreting median raw returns as annualized performance',
            'Source series and variants have already been examined; leave-one-out ranking here does NOT erase previous selection bias',
            'Three indicator families on one Binance BTCUSDT asset, market venue mismatch vs OKX BTCUSDC',
            'Every fill is hypothetical on next-day open; spreads, taxes, outages and minimum sizes are absent',
            'Only four nonoverlapping windows; no reliable inference on future behavior or p-values',
            'A strategy with zero trades and 0% return can simply be fully in cash and miss all upside',
            'No new settings or look-ahead trading rules used'
        ],
        'orders_executed':False,
    }
    proof=ROOT/(STEM+'_PROOFS.json')
    proof.write_text(json.dumps(record,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    for path,records in ((STEM+'_CANDIDATE_PANEL.csv',panel),(STEM+'_SCORECARD.csv',summary),(STEM+'_PAIRED_DIFFS.csv',paired),(STEM+'_LOO_DIAGNOSTIC.csv',loo)):
        with (ROOT/path).open('w',encoding='utf-8',newline='') as f:
            w=csv.DictWriter(f,fieldnames=list(records[0]));w.writeheader();w.writerows(records)
    lines=[
      '# Seven Heaven — Robustesse inter-périodes des confirmations asymétriques BTC', '',
      '**11 novembre 2026 · Étude documentaire PAPER, fondée sur les preuves publiées.**', '',
      '## Périmètre et prudence méthodologique', '',
      '- Source : `'+SOURCE.name+'` (empreinte SHA-256 dans le JSON ci-joint), couvrant 19 ZIP Binance BTCUSDT 1m, déjà vérifiés par la recherche source.',
      '- Quatre fenêtres **déjà examinées** : 2023 mai–juin (61 j), 2024 fév.–mars (60 j), 2025 fév.–mars (59 j), 2026 fév.–oct. (273 j).',
      '- Comparaison **figée des variantes** E1/S1, E3/S1, E1/S3, E2/S2 pour chaque famille EMA, SuperTrend, consensus (2 sur 3). Tous les résultats ci-dessous sont extraits sans modifier le calcul primaire.',
      '- Définition : E1/S3 = achat dès 1 clôture haussière, vente après 3 clôtures baissières ; E3/S1 = entrée lente / sortie rapide.',
      '- Capital fictif initial 1 000 USDT et coûts identiques à l’étude source ; retour, stress de coûts ×2 et drawdown journalier.',
      '- **Ceci n’est pas une validation indépendante.** Les séries 2023–2026 et les candidats sont déjà connus ; la sélection leave-one-out est purement diagnostique.', '',
      '## Tableau de robustesse descriptif (4 fenêtres)', '',
      '| Famille | Règle | Fenêtres nettes positives | Fenêtres devant Buy & Hold | Pire rendement | Pire drawdown | Médiane écart vs Hold (pp) |',
      '|---|---|---:|---:|---:|---:|---:|',
    ]
    for z in summary:
        lines.append(f"| {z['family']} | {z['policy']} | {z['periods_positive_return']}/4 | {z['periods_above_hold']}/4 | {z['worst_period_return_pct']:+.2f} % | {z['worst_daily_drawdown_pct']:.2f} % | {z['median_excess_hold_pp']:+.2f} |");
    lines+=['', 'Les quatre fenêtres n’ont pas la même durée. Les valeurs de chaque portefeuille **ne sont ni additionnées ni présentées comme un capital continu**. La médiane des écarts en points de pourcentage est descriptive, non une espérance de rendement.',
      '', '## Diagnostic anti-surajustement : une période laissée de côté', '',
      'Algorithme à titre de contrôle : pour chaque période, sélectionner le couple famille/règle maximisant la médiane des **log-croissances relatives quotidiennes** sur les trois autres périodes (déjà connues du laboratoire), puis examiner sa performance sur la quatrième.',
      '| Période évaluée | Règle choisie sur les trois autres | Retour évalué | Buy & Hold | Écart (pp) |', '|---|---|---:|---:|---:|']
    for z in loo:lines.append(f"| {z['evaluation_period']} | {z['selected_family']} {z['selected_policy']} | {z['evaluation_return_pct']:+.2f} % | {z['evaluation_hold_return_pct']:+.2f} % | {z['evaluation_excess_hold_pp']:+.2f} |")
    n=sum(z['evaluation_excess_hold_pp']>0 for z in loo)
    lines+=['',f'Le sélecteur descriptif bat Buy & Hold dans **{n}/4** évaluations. Cela **ne constitue pas un score hors échantillon**, car les quatre périodes ont déjà participé à la recherche et à la sélection des idées.',
      '', '## Coût asymétrique du retard : comparaisons appariées', '',
      'Le CSV `'+STEM+'_PAIRED_DIFFS.csv` compare séparément pour chaque famille les variantes à E1/S1 (rendement net, stress de coûts, drawdown), sans confondre les changements d’exposition avec le coût d’une transaction unique.',
      '', '## Décision scientifique', '',
      '- Aucun résultat ne suffit à promouvoir une politique asymétrique comme choix universel. Les rendements dépendent fortement du contexte et du temps d’exposition.',
      '- Les alternatives E3/S1 (sortie rapide) et E1/S3 (entrée rapide) décrivent des risques de nature différente ; les deux restent à examiner dans un jeu *réellement inédit*.',
      '- Le protocole 2022 Q2 est gelé dans un document séparé avant d’accéder à la série nouvelle ; il permettra un vrai test après vérification des ZIP.',
      '', '## Reproduction pour les autres IA', '',
      f'- Script : `{STEM}.py` — Python 3 standard library, aucun accès réseau ni compte.',
      f'- Entrée : `{SOURCE.name}` issue du Coffre, SHA-256 contrôlé.',
      f'- Sorties : `{STEM}_PROOFS.json`, `_CANDIDATE_PANEL.csv`, `_SCORECARD.csv`, `_PAIRED_DIFFS.csv`, `_LOO_DIAGNOSTIC.csv`.',
      '- Sans exécution d’ordre ni modification d’Administrator, Operator, Trader ou Bridge.', '']
    (ROOT/(STEM+'_REPORT.md')).write_text('\n'.join(lines),encoding='utf-8')
    print(json.dumps({'source_sha256':record['source_proof_sha256'],'panels':len(panel),'candidates':len(summary),
     'paired':len(paired),'loo_win_vs_hold':n,'loo':loo,
     'scorecard':summary},indent=2))

if __name__=='__main__':main()
