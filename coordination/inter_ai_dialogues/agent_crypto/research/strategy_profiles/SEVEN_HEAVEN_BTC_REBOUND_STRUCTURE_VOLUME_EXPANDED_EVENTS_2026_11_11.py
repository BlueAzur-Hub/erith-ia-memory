#!/usr/bin/env python3
"""Seven Heaven | 2.5%/10-day expanded BTC rebound event study.

RESEARCH ONLY, PAPER, no orders. Parameters frozen before first event replay
in the corresponding GitHub protocol (commit 79b89463555680c2678344f3d2bd4436cb00345a).
Uses the 22 SHA-verified Binance Spot BTCUSDT 1m ZIPs via the legacy validated
reader and its signed upstream SHA registry. No external network required.
The reused historical windows are NOT an independent out-of-sample set.
"""
from __future__ import annotations
import argparse, csv, datetime as dt, hashlib, importlib.util, json, math
from pathlib import Path
from statistics import mean, median

HERE=Path(__file__).resolve().parent
STEM='SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_EXPANDED_EVENTS_2026_11_11'
PARENT='SEVEN_HEAVEN_BTC_THREE_DAILY_CANDLES_REBOUND_STRUCTURE_VOLUME_AUDIT_2026_11_11.py'
PROTOCOL=STEM.replace('_2026_11_11','_PROTOCOL_2026_11_11')+'.md'
PROTOCOL_COMMIT='79b89463555680c2678344f3d2bd4436cb00345a'
WARMUP=30
DRAWDOWN=0.025
COOLDOWN=10
EXIT_J=10
FEE=0.001
SLIP=0.0005


def read_model(directory):
    spec=importlib.util.spec_from_file_location('seven_previous_three_day_audit',directory/PARENT)
    model=importlib.util.module_from_spec(spec);spec.loader.exec_module(model)
    return model


def candidates(d,threshold,cooldown):
    out=[];last=-cooldown-100
    for i in range(WARMUP,len(d)):
        peak=max(r['c'] for r in d[i-30:i])
        yesterday=d[i-1]['c']; today=d[i]['c']
        if yesterday/peak-1<=-threshold+1e-12 and today>yesterday and i-last>cooldown:
            out.append((i,100*(yesterday/peak-1)))
            last=i
    return out


def future_label(move):
    if move>=3:return 'RISE_GE3'
    if move<=-3:return 'FALL_LE_MINUS3'
    return 'RANGE'


def wilson(p,n):
    if not n:return None
    z=1.96;v=p/n;den=1+z*z/n
    ctr=(v+z*z/(2*n))/den
    radius=(z/den)*math.sqrt(v*(1-v)/n+z*z/(4*n*n))
    return [round(100*(ctr-radius),2),round(100*(ctr+radius),2)]


def obs(period,d,i,context,ema10,ema30,model):
    row=dict(period=period,event_date=model.name(d[i]['ms']),event_index=i,
        drawdown_before_rebound_pct=round(context,5),right_censored=i+EXIT_J>=len(d))
    if row['right_censored']:return row
    c3=all(d[j]['c']>d[j-1]['c'] for j in (i,i+1,i+2))
    structure=all(d[j]['l']>d[j-1]['l'] for j in (i,i+1,i+2))
    vol20=mean(d[j]['base'] for j in range(i-18,i+2)) # prior 20 complete daily volumes before J+2
    assert len(range(i-18,i+2))==20 and (i-18)>=0
    volume=d[i+2]['base']>=vol20
    trend=ema10[i+2]>ema30[i+2] and d[i+2]['c']>ema30[i+2]
    p1=d[i+1]['o'];p3=d[i+3]['o'];end=d[i+10]['c']
    # C1 and C3 are independent nominal entries, both marked at same future date.
    p1net=model.mark_return(p1,end)
    p3net=model.mark_return(p3,end)
    row.update(c3=c3,higher_lows_3d=structure,volume_ge_20day_mean=volume,
       ema_up=trend,all_filters=c3 and structure and volume and trend,
       volume_ratio=round(d[i+2]['base']/vol20,6) if vol20 else None,
       open_jplus1=round(p1,6),open_jplus3=round(p3,6),close_jplus10=round(end,6),
       gross_jplus3_to_jplus10_pct=round(100*(end/p3-1),5),
       net_jplus3_to_jplus10_pct=round(p3net,5),
       net_jplus3_to_jplus10_costs_x2_pct=round(model.mark_return(p3,end,2),5),
       net_c1_jplus1_to_jplus10_pct=round(p1net,5),
       net_c1_costs_x2_pct=round(model.mark_return(p1,end,2),5),
       policy_c3_return_or_cash_pct=round(p3net if c3 else 0.0,5),
       policy_c3_costs_x2_or_cash_pct=round(model.mark_return(p3,end,2) if c3 else 0.0,5),
       delayed_entry_price_move_pct=round(100*(p3/p1-1),5),
       outcome_class=future_label(100*(end/p3-1)),
       c1_profitable=p1net>0,marked_jplus3_profitable=p3net>0,
       c3_rejected_but_c1_profitable=(not c3 and p1net>0),
       c3_rejected_and_c1_unprofitable=(not c3 and p1net<=0))
    return row


def group_summary(rows,name):
    n=len(rows)
    if not n:return dict(name=name,n=0,win_count=0,win_rate_pct=None,wilson95_pct=None,
                         mean_net_pct=None,median_net_pct=None,mean_net_costs_x2_pct=None,
                         positive_3pct_count=0,negative_3pct_count=0)
    wins=sum(x['marked_jplus3_profitable'] for x in rows)
    return dict(name=name,n=n,win_count=wins,win_rate_pct=round(100*wins/n,2),
      wilson95_pct=wilson(wins,n),mean_net_pct=round(mean(x['net_jplus3_to_jplus10_pct'] for x in rows),4),
      median_net_pct=round(median(x['net_jplus3_to_jplus10_pct'] for x in rows),4),
      mean_net_costs_x2_pct=round(mean(x['net_jplus3_to_jplus10_costs_x2_pct'] for x in rows),4),
      positive_3pct_count=sum(x['outcome_class']=='RISE_GE3' for x in rows),
      negative_3pct_count=sum(x['outcome_class']=='FALL_LE_MINUS3' for x in rows))


def audit_dataset(data,model):
    full=[];per={};daily=[];assertions=0
    for period,d in data.items():
        prices=[r['c'] for r in d];ema10=model.exp_ema(prices,10);ema30=model.exp_ema(prices,30)
        base=candidates(d,DRAWDOWN,COOLDOWN)
        legacy=candidates(d,.05,21)
        original=model.signal_candidates(d,'UP')
        assert [i for i,_ in legacy]==[i for i,_ in original],('LEGACY_CANDIDATE_MISMATCH',period)
        assertions+=len(legacy)+1
        events=[obs(period,d,i,ctx,ema10,ema30,model) for i,ctx in base]
        # Event windows J0..J+10 do not overlap due strictly >10-day cooldown.
        assert all(base[j+1][0]-base[j][0]>=11 for j in range(len(base)-1))
        assertions+=max(0,len(base)-1)
        eligible=[e for e in events if not e['right_censored']]
        per[period]=dict(daily_count=len(d),candidate_count=len(events),censored=len(events)-len(eligible),
          scored_count=len(eligible),legacy_5pct_21d_count=len(legacy),
          c3_confirmed=sum(e['c3'] for e in eligible),
          structure_higher_lows=sum(e['higher_lows_3d'] for e in eligible),
          volume_strong=sum(e['volume_ge_20day_mean'] for e in eligible),
          full_filter=sum(e['all_filters'] for e in eligible),
          c1_positive=sum(e['c1_profitable'] for e in eligible),
          c3_rejected_c1_winners=sum(e['c3_rejected_but_c1_profitable'] for e in eligible),
          c3_rejected_c1_losers=sum(e['c3_rejected_and_c1_unprofitable'] for e in eligible),
          mean_net_c1_pct=round(mean(e['net_c1_jplus1_to_jplus10_pct'] for e in eligible),4) if eligible else None,
          mean_c3_policy_pct=round(mean(e['policy_c3_return_or_cash_pct'] for e in eligible),4) if eligible else None)
        full.extend(events)
        for i,r in enumerate(d):daily.append(dict(period=period,date_utc=model.name(r['ms']),o=r['o'],h=r['h'],l=r['l'],c=r['c'],volume_btc=round(r['base'],6),ema10=round(ema10[i],5),ema30=round(ema30[i],5)))
        # Prefix invariance: candidate windows calculated at time i are future-invariant.
        for idx in sorted(set([30,35,40,49,60,75,100,130,len(d)-1])):
            if idx>=len(d):continue
            prefix=candidates(d[:idx+1],DRAWDOWN,COOLDOWN)
            assert [i for i,_ in prefix]==[i for i,_ in base if i<=idx],('PREFIX_LEAK',period,idx)
            assertions+=1
        for e in eligible:
            i=e['event_index'];k=i+2
            assert k+1==i+3
            assert e['c3']==all(d[j]['c']>d[j-1]['c'] for j in (i,i+1,i+2))
            assert e['higher_lows_3d']==all(d[j]['l']>d[j-1]['l'] for j in (i,i+1,i+2))
            assert e['volume_ge_20day_mean']==(d[k]['base']>=mean(d[j]['base'] for j in range(k-20,k)))
            assert e['ema_up']==(ema10[k]>ema30[k] and d[k]['c']>ema30[k])
            assert abs(e['net_jplus3_to_jplus10_pct']-model.mark_return(d[i+3]['o'],d[i+10]['c']))<1e-4
            assert abs(e['net_c1_jplus1_to_jplus10_pct']-model.mark_return(d[i+1]['o'],d[i+10]['c']))<1e-4
            assertions+=6
    return full,per,daily,assertions


def table_effect(rows,indicator):
    yes=[r for r in rows if r[indicator]];no=[r for r in rows if not r[indicator]]
    a=group_summary(yes,'YES');b=group_summary(no,'NO')
    return dict(yes=a,no=b,
      delta_win_rate_pp=round(a['win_rate_pct']-b['win_rate_pct'],2) if a['n'] and b['n'] else None,
      delta_mean_return_pp=round(a['mean_net_pct']-b['mean_net_pct'],4) if a['n'] and b['n'] else None,
      usable_for_directional_inference=(a['n']>=5 and b['n']>=5))


def write_csv(path,rows,fields):
    with path.open('w',encoding='utf-8',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore');w.writeheader();w.writerows(rows)


def run():
    ap=argparse.ArgumentParser();ap.add_argument('--zip-dir',default=str(HERE));args=ap.parse_args();root=Path(args.zip_dir)
    model=read_model(root)
    data,manifest=model.load(root)
    assert len(manifest)==22 and sum(m['minute_count'] for m in manifest)==960480
    assert sum(len(d) for d in data.values())==667
    events,byperiod,daily,assertions=audit_dataset(data,model)
    eligible=[e for e in events if not e['right_censored']]
    group_names={
      'ALL':lambda x:True,'C3':lambda x:x['c3'],
      'C3_AND_LOWS':lambda x:x['c3'] and x['higher_lows_3d'],
      'C3_AND_VOLUME':lambda x:x['c3'] and x['volume_ge_20day_mean'],
      'C3_AND_TREND':lambda x:x['c3'] and x['ema_up'],
      'C3_AND_ALL':lambda x:x['all_filters']}
    groups={n:group_summary([e for e in eligible if fn(e)],n) for n,fn in group_names.items()}
    incremental={feature:table_effect([e for e in eligible if e['c3']],feature) for feature in ('higher_lows_3d','volume_ge_20day_mean','ema_up')}
    global_effects={feature:table_effect(eligible,feature) for feature in ('c3','higher_lows_3d','volume_ge_20day_mean','ema_up')}
    summary=dict(schema='seven-heaven.btc-expanded-rebound-volume-structure-exploratory.v1',
      study_utc_date='2026-11-11',protocol_file=PROTOCOL,protocol_commit=PROTOCOL_COMMIT,
      code_sha256=hashlib.sha256((HERE/(STEM+'.py')).read_bytes()).hexdigest(),
      source='Binance Spot BTCUSDT native 1m original ZIPs, SHA-256 checked',
      manifest=manifest,minute_count=sum(m['minute_count'] for m in manifest),daily_count=len(daily),
      data_windows_previously_studied=True,true_independent_out_of_sample=False,
      n_candidate=len(events),n_evaluable=len(eligible),n_right_censored=len(events)-len(eligible),
      per_period=byperiod,groups=groups,incremental_among_c3=incremental,global_indicator_associations=global_effects,
      c1_positive_count=sum(e['c1_profitable'] for e in eligible),
      c3_rejected_but_c1_profitable=sum(e['c3_rejected_but_c1_profitable'] for e in eligible),
      c3_rejected_c1_unprofitable=sum(e['c3_rejected_and_c1_unprofitable'] for e in eligible),
      confirmation_delay_median_price_move_pct=round(median(e['delayed_entry_price_move_pct'] for e in eligible if e['c3']),4) if any(e['c3'] for e in eligible) else None,
      c1_average_isolated_return_pct=round(mean(e['net_c1_jplus1_to_jplus10_pct'] for e in eligible),4),
      c3_or_cash_average_isolated_return_pct=round(mean(e['policy_c3_return_or_cash_pct'] for e in eligible),4),
      assertion_count=assertions,
      definitions=dict(candidate_drawdown_pct=2.5,candidate_cooldown_days=10,history_days=30,pre_trade_three_closes=True,
         strong_volume='Base BTC volume at J+2 ≥ mean base BTC volumes on 20 completed earlier UTC days',
         structure='strictly ascending daily lows J-1, J0, J+1, J+2',
         outcome='hypothetical buy at J+3 open to sell at J+10 close, including fee/slippage, for ALL events including non-C3',
         isolated_capital_usdt=1000,fee_side=FEE,slippage_side=SLIP,stress_x2=True),
      youtube_source=dict(channel='Les Rois du Bitcoin',channel_url='https://www.youtube.com/channel/UCv9sIj-mKR4qEr_yYAywR1A',
         observed_topics=['technical chart analysis','support and resistance','volume','4 Kings strategy'],
         rule_of_three_days_video_exactly_identified=False,
         disclosures='Some analyzed video descriptions have exchange/financial affiliate links; topics are not evidence of predictive performance'),
      caveats=['Previously explored windows: exploratory sensitivity, NOT new holdout',
        'Reduced threshold expands events but changes the definition of a correction',
        'Candidate spacing >=11 days avoids overlapping J0 to J+10 horizons, but market dependency remains',
        'All historical associations are ex post, no optimized thresholds, no causal claims',
        'Small C3 group makes incremental feature comparisons unstable',
        'Binance BTCUSDT volume is not OKX BTCUSDC or global exchange volume',
        'Trades and fills at daily opens/closes are hypothetical, not executable guarantees',
        'Average isolated episode returns are NOT portfolio compounded returns',
        'No specific 3-day rule could be attributed to the YouTube creator from accessible sources'])
    (HERE/(STEM+'_PROOFS.json')).write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    event_fields=['period','event_date','event_index','drawdown_before_rebound_pct','right_censored','c3','higher_lows_3d','volume_ge_20day_mean','ema_up','all_filters','volume_ratio','open_jplus1','open_jplus3','close_jplus10','gross_jplus3_to_jplus10_pct','net_jplus3_to_jplus10_pct','net_jplus3_to_jplus10_costs_x2_pct','net_c1_jplus1_to_jplus10_pct','net_c1_costs_x2_pct','policy_c3_return_or_cash_pct','policy_c3_costs_x2_or_cash_pct','delayed_entry_price_move_pct','outcome_class','c1_profitable','marked_jplus3_profitable','c3_rejected_but_c1_profitable','c3_rejected_and_c1_unprofitable']
    write_csv(HERE/(STEM+'_EVENTS.csv'),events,event_fields)
    groups_list=[dict(group=n,**{k:v for k,v in g.items() if k!='name'}) for n,g in groups.items()]
    write_csv(HERE/(STEM+'_GROUPS.csv'),groups_list,['group','n','win_count','win_rate_pct','wilson95_pct','mean_net_pct','median_net_pct','mean_net_costs_x2_pct','positive_3pct_count','negative_3pct_count'])
    write_report(summary)
    print('COMPLETED',STEM,'candles',summary['minute_count'],'days',summary['daily_count'],'events',len(events),'scored',len(eligible),'C3',sum(e['c3'] for e in eligible),'assertions',assertions,flush=True)
    for n,g in groups.items():print('GROUP',n,'n=',g['n'],'wins=',g['win_count'],'rate=',g['win_rate_pct'],'netmean=',g['mean_net_pct'],flush=True)
    for n,t in incremental.items():print('INCREMENTAL among C3',n,t['yes']['n'],t['no']['n'],'delta wins pp',t['delta_win_rate_pp'], 'usable',t['usable_for_directional_inference'],flush=True)
    return summary


def write_report(p):
    lines=['# Seven Heaven — Épisodes de rebond BTC élargis : creux ascendants et volumes',
      '', '**11 novembre 2026 | recherche PAPER exploratoire, sans ordre et sans modification des interfaces.**',
      '', f'**Protocole préalable :** [version figée avant calcul](./{PROTOCOL}) · commit `{PROTOCOL_COMMIT[:8]}`.',
      '', '## Étude documentaire de la chaîne YouTube',
      '', '- Chaîne identifiée : **Les Rois du Bitcoin**, analyses graphiques et pédagogie Bitcoin ; présentateur cité **Hermès** dans la présentation publique et des sources externes.',
      '- Vidéos vérifiables par métadonnées : [volumes et analyse Bitcoin, 22 août 2023](https://www.youtube.com/watch?v=c_goJ7VV1vs) ; [supports et analyse Bitcoin, 1er septembre 2025](https://www.youtube.com/watch?v=ay2lG11OHBo). Dans les descriptions, présence de renvois commerciaux/affiliation : relever la date et séparer observation, interprétation et intérêts commerciaux.',
      '- [Chaîne source](https://www.youtube.com/channel/UCv9sIj-mKR4qEr_yYAywR1A). **L’origine exacte de la « règle des trois jours » n’a pas été retrouvée dans une vidéo identifiée.** Ne pas attribuer cette règle à cette chaîne sans horodatage/vidéo.',
      '- Une vidéo de vulgarisation peut suggérer une hypothèse sur supports/creux/volumes, mais ne prouve ni performance de trading ni probabilité de reprise.',
      '', '## Question, période et méthode',
      '', '- **22 ZIP natifs Binance Spot BTC/USDT**, SHA-256 vérifiés : '+f'{p["minute_count"]:,} bougies minute ; {p["daily_count"]} journées UTC sur cinq fenêtres disjointes de 2022 à 2026.',
      '- Nouveau seuil choisi AVANT calcul : une première clôture montante alors que la clôture précédente est ≥2,5 % sous son maximum des 30 jours précédents ; pas de nouvel épisode avant 11 jours. 30 premières journées de chaque séquence réservées à l’historique.',
      '- Déclencheur C3 : trois clôtures montantes, toutes déjà achevées ; creux ascendants J−1 à J+2 ; volume base BTC à J+2 comparé à la moyenne des 20 jours clos précédents ; EMA10>EMA30 et clôture>EMA30 à J+2.',
      '- Pour l’analyse statistique, toutes les issues sont prises de l’ouverture J+3 à la clôture J+10, **même si un filtre rejette l’épisode**, afin de comparer un horizon identique. Rendements nets de frais 0,10 % et glissement 0,05 % par côté, stress à coûts doublés.',
      '- Les opérations C1 et C3 utilisent un horizon commun de vente J+10 mais C1 est exposée deux jours de plus. **Chaque épisode est isolé et remis fictivement à 1 000 USDT : les rendements ne constituent pas un portefeuille continu.**',
      '- Les 22 mois ont déjà servi aux études précédentes : **aucun vrai test indépendant, aucune prédiction validée**.',
      '', '## Résultats globaux',
      '', f'- Candidats = **{p["n_candidate"]}** ; évaluables à J+10 = **{p["n_evaluable"]}** ; censurés = {p["n_right_censored"]}.',
      f'- **C3** confirmés = {p["groups"]["C3"]["n"]}/{p["n_evaluable"]}; sous-groupe C3+creux = {p["groups"]["C3_AND_LOWS"]["n"]}; C3+volume = {p["groups"]["C3_AND_VOLUME"]["n"]}; C3+EMA = {p["groups"]["C3_AND_TREND"]["n"]}; C3+les trois filtres = {p["groups"]["C3_AND_ALL"]["n"]}.',
      f'- Sur les rejets C3 : {p["c3_rejected_but_c1_profitable"]} épisodes où C1 aurait gagné et {p["c3_rejected_c1_unprofitable"]} où C1 aurait été perdant/net nul.',
      f'- Déplacement médian du prix d’entrée C1→C3 sur les confirmés : {p["confirmation_delay_median_price_move_pct"]} % ; **ce n’est pas un gain ou une perte du portefeuille**.',
      '', '| Groupe | N | Résultats J+3→J+10 positifs | Fréquence descriptive | Moy. nette par épisode | Moy. si coûts doublés |',
      '|---|---:|---:|---:|---:|---:|']
    for g in p['groups'].values():
        rate=f'{g["win_rate_pct"]:.2f} %' if g['win_rate_pct'] is not None else '—'
        pnl=f'{g["mean_net_pct"]:+.3f} %' if g['mean_net_pct'] is not None else '—'
        stress=f'{g["mean_net_costs_x2_pct"]:+.3f} %' if g['mean_net_costs_x2_pct'] is not None else '—'
        lines.append(f'| {g["name"]} | {g["n"]} | {g["win_count"]} | {rate} | {pnl} | {stress} |')
    lines+=['', '## Est-ce que les creux ascendants et les volumes ajoutent de l’information *à l’intérieur* de C3 ?', '',
            '| Critère après C3 | Oui, n | Non, n | Écart des taux de succès | Écart des moyennes nettes | Taille adéquate (≥5 de chaque côté) ? |',
            '|---|---:|---:|---:|---:|---|']
    for name,row in p['incremental_among_c3'].items():
        d_rate='—' if row['delta_win_rate_pp'] is None else f'{row["delta_win_rate_pp"]:+.2f} points'
        d_mean='—' if row['delta_mean_return_pp'] is None else f'{row["delta_mean_return_pp"]:+.3f} points'
        lines.append(f'| {name} | {row["yes"]["n"]} | {row["no"]["n"]} | {d_rate} | {d_mean} | {"oui" if row["usable_for_directional_inference"] else "non"} |')
    lines+=['', '## Audit par période : contrôle de la dépendance au régime', '',
            '| Fenêtre | Candidats | Évaluables | C3 | C3+volume | Rejets où C1 aurait gagné/perdu |',
            '|---|---:|---:|---:|---:|---:|']
    for yr,s in p['per_period'].items():
      lines.append(f'| {yr} | {s["candidate_count"]} | {s["scored_count"]} | {s["c3_confirmed"]} | {s["full_filter"]} (filtre complet) | {s["c3_rejected_c1_winners"]} / {s["c3_rejected_c1_losers"]} |')
    lines+=['', '## Contrôles et limites', '',
            f'- Vérifiés : **{p["minute_count"]:,} minutes / {p["daily_count"]} jours**, **{p["assertion_count"]} assertions** de causalité/événements/équations, reproduction exacte des candidats historiques du témoin **5 % / 21 jours**.',
            '- C3 est une sous-population sélectionnée, pas un traitement aléatoire. Comparer le signe d’une association n’autorise pas une interprétation causale.',
            '- Les intervalles de Wilson sont descriptifs ; la dépendance entre périodes de marché et la sélection de candidats peuvent les rendre optimistes.',
            '- Les volumes sont ceux de Binance Spot BTC/USDT, pas de tout le marché ni ceux du carnet OKX BTC/USDC. Frais et ouvertures sont hypothétiques.',
            '- Les seuils de cette étude ont été figés, mais les années 2022–2026 avaient déjà été étudiées ; **surajustement historique possible**, même sans optimisation automatique.',
            '', '## Reprise pour les autres IA', '',
            f'- Code : `{STEM}.py`, dépend du parseur validé `{PARENT}` et de son manifeste amont SHA.',
            f'- JSON détaillé : `{STEM}_PROOFS.json` ; épisodes auditables : `{STEM}_EVENTS.csv` ; résumé : `{STEM}_GROUPS.csv`.',
            f'- Réexécution locale : `python {STEM}.py --zip-dir DOSSIER_22_ARCHIVES`. Les ZIP historiques restent sur GitHub Releases, non copiés dans Git main.',
            '- Ne jamais afficher les fréquences historiques comme les probabilités des trois scénarios des infographies. Aucune modification Administrator, Operator, Trader, Bridge ; aucune transaction.',
            '', '**Conclusion :** mesurer les creux ascendants, volumes et EMA sur les épisodes confirmés peut étayer une hypothèse, mais l’effectif et l’absence de nouveau jeu indépendant interdisent tout conseil de trading automatisé.', '']
    (HERE/(STEM+'_REPORT.md')).write_text('\n'.join(lines),encoding='utf-8')

if __name__=='__main__':run()
