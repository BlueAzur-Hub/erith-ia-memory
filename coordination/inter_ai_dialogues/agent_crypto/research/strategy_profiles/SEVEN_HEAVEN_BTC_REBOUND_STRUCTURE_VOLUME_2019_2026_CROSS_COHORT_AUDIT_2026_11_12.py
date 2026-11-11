#!/usr/bin/env python3
"""Seven Heaven: replay the 2019–2026 BTC rebound cross-cohort statistics.

Input: two previously published CSV event ledgers, not downloaded by this script.
The two cohorts were already studied; this is descriptive validation, not a new
prospective or out-of-sample trial. No exchange connection, no orders.

Run from a clone of the public repository in strategy_profiles/:
  python SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_2019_2026_CROSS_COHORT_AUDIT_2026_11_12.py
"""
from __future__ import annotations
import argparse
import csv
import hashlib
import json
import math
import statistics
from pathlib import Path

HERE = Path(__file__).resolve().parent
STEM = 'SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_2019_2026_CROSS_COHORT_AUDIT_2026_11_12'
OLD = 'SEVEN_HEAVEN_BTC_REBOUND_2019_2021_DAILY_HOLDOUT_AUDIT_2026_11_11_EVENTS.csv'
NEW = 'SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_EXPANDED_EVENTS_2026_11_11_EVENTS.csv'
EXPECTED = {'candidates': 119, 'evaluable': 113, 'censored': 6, 'c3': 28}
FIELDS = ['cohort','year','date_utc','censored','c3','low3','vol','ema','net_pct','stress_pct','net_c1_pct','delay_pct','volume_ratio']


def read_csv(path):
    with path.open(encoding='utf-8', newline='') as f:
        return list(csv.DictReader(f))


def as_bool(value):
    if value in ('true','True'):
        return True
    if value in ('false','False'):
        return False
    raise ValueError(f'Unexpected Boolean: {value!r}')


def as_number(value):
    x = float(value)
    if not math.isfinite(x):
        raise ValueError('Non-finite number')
    return x


def normalize(old, new):
    normalized=[]
    for cohort, raw in [('2019-2021',old), ('2022-2026-fragments',new)]:
        old_schema = cohort == '2019-2021'
        for r in raw:
            year = int(r['year' if old_schema else 'period'])
            date = r['date_utc' if old_schema else 'event_date']
            if len(date) != 10 or int(date[:4]) != year:
                raise ValueError('Invalid date/year')
            censored = as_bool(r['right_censored'])
            e = dict(cohort=cohort,year=year,date_utc=date,censored=censored)
            if not censored:
                def bv(old_field,new_field):
                    return as_bool(r[old_field if old_schema else new_field])
                def nv(old_field,new_field):
                    return as_number(r[old_field if old_schema else new_field])
                e.update(c3=bv('c3','c3'),low3=bv('low3','higher_lows_3d'),
                  vol=bv('vol','volume_ge_20day_mean'),ema=bv('trend','ema_up'),
                  net_pct=nv('net_j3_j10_pct','net_jplus3_to_jplus10_pct'),
                  stress_pct=nv('stress_j3_j10_pct','net_jplus3_to_jplus10_costs_x2_pct'),
                  net_c1_pct=nv('net_c1_pct','net_c1_jplus1_to_jplus10_pct'),
                  delay_pct=nv('delay_price_move_pct','delayed_entry_price_move_pct'),
                  volume_ratio=nv('volume_ratio','volume_ratio'))
                if abs(e['net_pct'])>150 or abs(e['delay_pct'])>90 or e['volume_ratio']<0:
                    raise ValueError('Implausible event')
            normalized.append(e)
    normalized.sort(key=lambda e:e['date_utc'])
    if len(set(e['date_utc'] for e in normalized)) != len(normalized):
        raise ValueError('Duplicate event dates')
    return normalized


def rounded(x):
    return round(x,5)


def describe(a):
    n=len(a)
    if not n:
        return dict(n=0,wins=0,win_pct=None,mean_pct=None,median_pct=None,
                    stress_mean_pct=None,wilson95_pct=None)
    arr=[e['net_pct'] for e in a]
    w=sum(x>0 for x in arr)
    p=w/n;z=1.96;d=1+z*z/n
    m=(p+z*z/(2*n))/d
    rad=z/d*math.sqrt(p*(1-p)/n+z*z/(4*n*n))
    return dict(n=n,wins=w,win_pct=rounded(100*p),
      mean_pct=rounded(statistics.mean(arr)),median_pct=rounded(statistics.median(arr)),
      stress_mean_pct=rounded(statistics.mean(e['stress_pct'] for e in a)),
      wilson95_pct=[rounded(100*(m-rad)),rounded(100*(m+rad))])


def diff(a,b):
    if not a or not b:
        return None
    return rounded(statistics.mean(e['net_pct'] for e in a)-statistics.mean(e['net_pct'] for e in b))


def summarize(data):
    eligible=[e for e in data if not e['censored']]
    confirmed=[e for e in eligible if e['c3']]
    def groups(xs):
        return {name:describe([e for e in xs if
          name=='ALL' or (e['c3'] and (name=='C3' or
          (name=='C3_LOW3' and e['low3']) or
          (name=='C3_VOL' and e['vol']) or
          (name=='C3_EMA' and e['ema']) or
          (name=='C3_ALL' and e['low3'] and e['vol'] and e['ema'])))])
          for name in ['ALL','C3','C3_LOW3','C3_VOL','C3_EMA','C3_ALL']}
    features={}
    years=sorted(set(e['year'] for e in eligible))
    for key in ['low3','vol','ema']:
        yes=[e for e in confirmed if e[key]]
        no=[e for e in confirmed if not e[key]]
        comparable=[]
        for y in years:
            sub=[e for e in confirmed if e['year']==y]
            a=[e for e in sub if e[key]]
            b=[e for e in sub if not e[key]]
            if a and b:
                comparable.append(dict(year=y,yes=len(a),no=len(b),
                                     diff_pp=diff(a,b),weight=len(sub)))
        weight=sum(e['weight'] for e in comparable)
        weighted=sum(e['weight']*e['diff_pp'] for e in comparable)/weight if weight else None
        loo={}
        for y in years:
            sub=[e for e in confirmed if e['year']!=y]
            a=[e for e in sub if e[key]]
            b=[e for e in sub if not e[key]]
            loo[str(y)]=dict(yes=len(a),no=len(b),diff_pp=diff(a,b))
        features[key]=dict(yes=describe(yes),no=describe(no),
            pooled_difference_pp=diff(yes,no),within_year_comparable=comparable,
            within_year_weighted_difference_pp=rounded(weighted) if weighted is not None else None,
            leave_one_year_out=loo)
    groups_per_year={}
    for y in years:
        all_y=[e for e in data if e['year']==y]
        good=[e for e in all_y if not e['censored']]
        c=[e for e in good if e['c3']]
        groups_per_year[str(y)]=dict(cohort=all_y[0]['cohort'],
          candidates=len(all_y),censored=len(all_y)-len(good),evaluable=len(good),
          confirmed=len(c),group=groups(good),
          feature_count={k:sum(e[k] for e in c) for k in ['low3','vol','ema']},
          c1_wins_rejected=sum((not e['c3'] and e['net_c1_pct']>0) for e in good),
          c1_losses_rejected=sum((not e['c3'] and e['net_c1_pct']<=0) for e in good))
    by_cohort={}
    for k in sorted(set(e['cohort'] for e in data)):
        events=[e for e in data if e['cohort']==k]
        by_cohort[k]=dict(candidates=len(events),
          evaluable=sum(not e['censored'] for e in events),
          groups=groups([e for e in events if not e['censored']]))
    return dict(n_candidates=len(data),n_evaluable=len(eligible),
         n_censored=len(data)-len(eligible),group=groups(eligible),
         features=features,years=groups_per_year,cohorts=by_cohort)


def git_blob_sha(path):
    data=path.read_bytes()
    return hashlib.sha1(f'blob {len(data)}\0'.encode()+data).hexdigest()


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--research-dir',default=str(HERE))
    ap.add_argument('--check-proof',action='store_true')
    args=ap.parse_args();root=Path(args.research_dir)
    old=read_csv(root/OLD);new=read_csv(root/NEW)
    rows=normalize(old,new)
    stats=summarize(rows)
    assert (stats['n_candidates'],stats['n_evaluable'],stats['n_censored'],stats['group']['C3']['n'])==tuple(EXPECTED.values())
    checks=0
    for yr,info in stats['years'].items():
        assert sum(e['year']==int(yr) for e in rows)==info['candidates'];checks+=1
    assert sum(x['censored'] for x in stats['years'].values())==6
    checks+=1
    if args.check_proof:
        proof=json.loads((root/(STEM+'_PROOFS.json')).read_text(encoding='utf-8'))
        for record in proof['source_files']:
            assert git_blob_sha(root/record['path']) == record['git_blob_sha'],record['path']
            checks+=1
        # The original capture computed with JS; use tiny rounding tolerance to
        # account for differing ties-to-even versus ties-up arithmetic.
        expected=proof['statistics']
        assert stats['n_evaluable']==expected['n_evaluable']
        for name in ['low3','vol','ema']:
            a=stats['features'][name];b=expected['features'][name]
            assert a['yes']['n']==b['yes']['n'] and a['no']['n']==b['no']['n']
            assert abs(a['pooled_difference_pp']-b['pooled_difference_pp'])<0.00002
            checks+=3
        print('EXACT SOURCE GIT BLOBS AND RESEARCH PROOF MATCHED')
    print(json.dumps(dict(verified_events=stats['n_evaluable'],confirmed=stats['group']['C3'],
      feature_differences={k:v['pooled_difference_pp'] for k,v in stats['features'].items()},
      checks=checks),ensure_ascii=False,indent=2))
    print('PAPER-only; historical comparison; not independent forward validation.')


if __name__=='__main__':
    main()
