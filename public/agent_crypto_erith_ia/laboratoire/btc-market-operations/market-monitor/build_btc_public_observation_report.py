#!/usr/bin/env python3
"""Seven Heaven operational BTC evidence digest: read public Spot, News, Derivatives.

No orders, no predictions, no claims of 24/7 coverage or news causality.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

SCHEMA='seven.crypto.btc-evidence-monitor.v1'
ROOT=Path('public/agent_crypto_erith_ia')
SPOT=ROOT/'laboratoire/btc-market-operations/spot-hourly'
LIQ=ROOT/'laboratoire/liquidation-monitor/observations'
NEWS=ROOT/'data/news/latest.json'
OUT=ROOT/'laboratoire/btc-market-operations/reports'
HOUR_MS=3600000
DAY_MS=24*HOUR_MS
PROVIDERS=('bybit','binance','okx')


def utc(s):
    try:
        dt=datetime.fromisoformat(str(s).replace('Z','+00:00'))
        if dt.tzinfo is None: return None
        return int(dt.timestamp()*1000)
    except (TypeError,ValueError,OverflowError): return None


def stamp(t): return datetime.fromtimestamp(t/1000,timezone.utc).isoformat(timespec='seconds').replace('+00:00','Z')


def read_json(path):
    if not path.exists():return None
    return json.loads(path.read_text(encoding='utf-8'))


def read_lines(folder,days):
    arr=[]
    for day in days:
        file=folder/(day+'.jsonl')
        if not file.exists():continue
        for line in file.read_text(encoding='utf-8').splitlines():
            if line.strip():arr.append(json.loads(line))
    return arr


def days_between(now_ms,lookback_ms):
    first=datetime.fromtimestamp((now_ms-lookback_ms)/1000,timezone.utc).date()
    last=datetime.fromtimestamp(now_ms/1000,timezone.utc).date()
    from datetime import timedelta
    return [(first+timedelta(days=i)).isoformat() for i in range((last-first).days+1)]



def assess_swing_context(spot, now_ms):
    """Observed hourly EMA structure only: not a swing strategy backtest or trade signal.

    Uses the already archived public 72h Spot OKX BTC-USDC candles.
    Missing candles, mixed venues or invalid rows fail closed.
    """
    unavailable={'status':'INSUFFICIENT_EVIDENCE','strategy':'SWING_EMA_5_13_34',
                 'instrument':'BTC-USDC','venue':'OKX','bar':'1H',
                 'strategy_validated':False,'orders_enabled':False,
                 'reason':'Historical coverage insufficient for a verified EMA 34 reading'}
    start=now_ms-72*HOUR_MS
    candidates=[c for c in spot if isinstance(c,dict)
                and isinstance(c.get('t'),int) and start<=c['t']
                and c['t']+HOUR_MS<=now_ms]
    if not candidates:
        return unavailable
    for c in candidates:
        if (c.get('instrument')!='BTC-USDC' or c.get('market_type')!='SPOT'
            or c.get('venue')!='OKX' or c.get('bar')!='1H'
            or c.get('confirm')!='1' or c.get('orders_enabled') is not False
            or c['t']%HOUR_MS):
            return unavailable | {'reason':'Inconsistent source or unfinished candle'}
    candles=sorted(candidates,key=lambda c:c['t'])
    stamps=[c['t'] for c in candles]
    if len(set(stamps))!=len(stamps) or any(b-a!=HOUR_MS for a,b in zip(stamps,stamps[1:])):
        return unavailable | {'reason':'Discontinuous or duplicated hourly evidence'}
    try:
        import math
        closes=[float(c['c']) for c in candles]
        if not all(math.isfinite(v) and v>0 for v in closes):
            raise ValueError('Invalid close')
    except (ValueError,TypeError,KeyError,OverflowError):
        return unavailable | {'reason':'Invalid or missing close'}
    if len(closes)<34:
        return unavailable | {'observed_hours':len(closes)}
    def ema(period):
        value=sum(closes[:period])/period
        alpha=2/(period+1)
        for close in closes[period:]:
            value+=alpha*(close-value)
        return value
    e5,e13,e34=ema(5),ema(13),ema(34)
    last=closes[-1]
    if last>e34 and e5>e13>e34:
        condition='ALIGNEMENT_HAUSSIER_HORAIRE'
    elif last<e34 and e5<e13<e34:
        condition='ALIGNEMENT_BAISSIER_HORAIRE'
    else:
        condition='STRUCTURE_HORAIRE_MIXTE'
    return {'status':'OBSERVED_NOT_BACKTESTED','strategy':'SWING_EMA_5_13_34',
            'instrument':'BTC-USDC','venue':'OKX','bar':'1H',
            'from_utc':stamp(stamps[0]),'to_utc':stamp(stamps[-1]),
            'observed_hours':len(closes),'last_close_usdc':last,
            'ema_5_usdc':round(e5,2),'ema_13_usdc':round(e13,2),
            'ema_34_usdc':round(e34,2),'observed_condition':condition,
            'strategy_validated':False,'orders_enabled':False,
            'limitations':['Hourly EMA structure, not a tested multi-day swing strategy',
                           'No entry/exit decisions, fees, slippage or performance backtest',
                           'Observations are not a signal or investment recommendation']}

def assemble(now_ms,spot,liquidations,coverage_runs,news,spot_status=None,liq_status=None):
    """Pure deterministic assembly for regression tests and archive rebuild."""
    since=now_ms-DAY_MS
    market=sorted((c for c in spot if isinstance(c,dict) and c.get('instrument')=='BTC-USDC'
                   and c.get('confirm')=='1' and c.get('orders_enabled') is False
                   and isinstance(c.get('t'),int) and since<=c['t']<now_ms),key=lambda x:x['t'])
    unique_market={x['t']:x for x in market}
    market=list(unique_market.values())
    liquid=[]
    for ev in liquidations:
        if not isinstance(ev,dict) or ev.get('provider') not in PROVIDERS:continue
        if ev.get('venue_market')!='DERIVATIVES' or ev.get('orders_enabled') is not False:continue
        t=ev.get('event_ts_ms')
        if isinstance(t,int) and since<=t<=now_ms:liquid.append(ev)
    unique_liquid={x['event_key']:x for x in liquid if isinstance(x.get('event_key'),str)}
    liquid=sorted(unique_liquid.values(),key=lambda x:x['event_ts_ms'])
    events=[]
    for e in (news or {}).get('events',[]):
        if not isinstance(e,dict) or 'BTC' not in (e.get('assets') or []):continue
        t=utc(e.get('event_time'))
        if t is None or not since<=t<=now_ms:continue
        events.append({'event_id':str(e.get('event_id') or e.get('id') or ''),
                       'event_at_utc':stamp(t),'event_ms':t,
                       'headline':str(e.get('headline') or '')[:200],
                       'source_name':str(e.get('source_name') or '')[:120],
                       'source_url':str(e.get('source_url') or '')[:500],
                       'driver_domains':e.get('driver_domains') or [],
                       'causal_claim':False})
    events.sort(key=lambda x:x['event_ms'])
    windows=[]
    for run in coverage_runs:
        if not isinstance(run,dict):continue
        for h in run.get('health',[]):
            if h.get('provider') not in PROVIDERS:continue
            start=utc(h.get('started_at_utc'));end=utc(h.get('finished_at_utc'))
            if start is None or end is None or end<=start:continue
            if end<since or start>now_ms:continue
            windows.append({'provider':h['provider'],'start':max(start,since),
                            'end':min(end,now_ms),'observed_connection_ms':int(h.get('observed_connection_ms') or 0),
                            'errors':h.get('errors') or [],'status':h.get('status')})
    per_provider={p:{'recorded_events':sum(e['provider']==p for e in liquid),
                    'observed_windows':sum(x['provider']==p for x in windows),
                    'last_event_utc':next((e['event_at_utc'] for e in reversed(liquid) if e['provider']==p),None),
                    'stream_has_gaps':True,'market_total_certified':False}
                  for p in PROVIDERS}
    hourly=[]
    for candle in market:
        t=candle['t']
        if t%HOUR_MS:continue
        relevant=[e for e in liquid if t<=e['event_ts_ms']<t+HOUR_MS]
        nearby_news=[e for e in events if t<=e['event_ms']<t+HOUR_MS]
        window_ids=[x['provider'] for x in windows if x['start']<t+HOUR_MS and x['end']>t]
        hourly.append({'hour_utc':stamp(t),'open_usdc':candle['o'],'close_usdc':candle['c'],
                       'spot_volume_btc':candle.get('v_btc'),'spot_volume_usdc':candle.get('v_usdc_quote'),
                       'observed_derivative_liquidation_messages_by_provider':
                       {p:sum(e['provider']==p for e in relevant) for p in PROVIDERS},
                       'providers_with_any_connection_in_hour':sorted(set(window_ids)),
                       'coverage_status':'SAMPLED_WITH_GAPS' if window_ids else 'NO_DOCUMENTED_OBSERVATION',
                       'news_published_in_hour':len(nearby_news),'causal_claim':False})
    newest=max((c['t'] for c in market),default=None)
    spot_age=now_ms-(newest+HOUR_MS) if newest is not None else None
    spot_fresh=newest is not None and 0<=spot_age<=2*HOUR_MS
    latest_liquid=max((x['event_ts_ms'] for x in liquid),default=None)
    # A healthy connection can observe ZERO events. Never use event recency as feed health.
    last_window=max((x['end'] for x in windows),default=None)
    liq_fresh=last_window is not None and 0<=now_ms-last_window<=2*HOUR_MS
    status='OPERATIONAL_PARTIAL_COVERAGE' if spot_fresh and liq_fresh else 'DEGRADED_OR_UNVERIFIED'
    return {'schema':SCHEMA,'generated_at_utc':stamp(now_ms),
            'window_start_utc':stamp(since),'window_end_utc':stamp(now_ms),
            'status':status,'observation_only':True,'orders_enabled':False,'real_orders':0,
            'spot':{'instrument':'BTC-USDC','market_type':'SPOT','venue':'OKX','bar':'1H',
                    'closed_hours_in_window':len(hourly),'latest_hour_utc':stamp(newest) if newest else None,
                    'fresh':spot_fresh,'age_after_close_ms':spot_age,
                    'archive_last_success_at':(spot_status or {}).get('updated_at_utc'),
                    'source_exchange_signed':False},
            'derivatives':{'providers':per_provider,'events_observed_in_24h':len(liquid),
                           'connection_windows_in_24h':len(windows),
                           'last_window_end_utc':stamp(last_window) if last_window else None,
                           'fresh_coverage_evidence':liq_fresh,
                           'coverage':'SAMPLED_WINDOWS_WITH_UNOBSERVED_GAPS',
                           'claim_24_7':False,'claim_market_total':False,
                           'okx_notional_usdt_unavailable':True},
            'news':{'owner':'Interface Administrator','events_relevant_to_btc_24h':len(events),
                    'source_generated_at':(news or {}).get('generated_at'),
                    'event_examples':events[-12:],'causality_proven':False},
            'hourly':hourly,
            'strategy_context':assess_swing_context(spot,now_ms),
            'limitations':['GitHub cron may be delayed or dropped; no 24/7 claim',
                           'Derivatives subscriptions are partial or venue-sampled; not market totals',
                           'No recorded feed event does not imply no liquidation',
                           'News event timestamp is not proof of a price catalyst',
                           'Exchange original market samples not cryptographically signed',
                           'Spot quote USDC is not derivatives notional USDT',
                           'Not personal financial advice and never an order']}


def render_md(doc):
    spot=doc['spot'];liq=doc['derivatives'];news=doc['news']
    rows=[f"# Seven Heaven — suivi public BTC : {doc['generated_at_utc']}",
          '',f"**Statut : {doc['status']}** — lecture seule, couverture partielle documentée, aucune exécution réelle.",
          '',f"Fenêtre UTC : {doc['window_start_utc']} au {doc['window_end_utc']}.",
          '', '## Santé et provenance',
          '',f"- **OKX Spot BTC-USDC 1H** : {spot['closed_hours_in_window']} bougies clôturées dans cette fenêtre ; dernière bougie {spot['latest_hour_utc'] or 'INCONNUE'} ; source fraîche : {'OUI' if spot['fresh'] else 'NON'}.",
          f"- **Liquidations dérivées** : {liq['events_observed_in_24h']} messages observés dans les archives ; {liq['connection_windows_in_24h']} fenêtres de connexion par fournisseur (les périodes sans connexion sont inconnues, **pas des liquidations nulles**).",
          f"- **Actualités de l'Interface** : {news['events_relevant_to_btc_24h']} événements BTC ; relevé source {news['source_generated_at'] or 'INCONNU'}.",
          '', '| Source dérivés | Messages observés | Fenêtres de connexion |',
          '|---|---:|---:|']
    for name,p in liq['providers'].items():
        rows.append(f"| {name} | {p['recorded_events']} | {p['observed_windows']} |")
    rows.extend(['','## Interprétation autorisée',
                 '','Ce rapport constate des **coïncidences temporelles** quand des données sont présentes. Il ne déduit aucune vente Spot d’une liquidation sur dérivés et ne prouve **aucune causalité** des articles.',
                 '', 'Les montants OKX en contrats ne sont pas convertis en USDT sans multiplicateur vérifié. Les messages Bybit/Binance ne constituent pas un total mondial.',
                 '', '## Dernières heures Spot archivées',
                 '', '| UTC | Ouverture (USDC) | Clôture (USDC) | Volume Spot BTC | Messages de liquidations observés | Couverture |',
                 '|---|---:|---:|---:|---:|---|'])
    for h in doc['hourly'][-12:]:
        n=sum(h['observed_derivative_liquidation_messages_by_provider'].values())
        rows.append(f"| {h['hour_utc']} | {h['open_usdc']} | {h['close_usdc']} | {h['spot_volume_btc']} | {n} | {h['coverage_status']} |")

    study=doc.get('strategy_context') or {}
    rows.extend(['', '## Étude de stratégie — structure EMA 5/13/34 (observation, pas backtest)', ''])
    if study.get('status')=='OBSERVED_NOT_BACKTESTED':
        rows.extend([
            f"- Source : OKX Spot BTC-USDC 1H ; {study['observed_hours']} bougies consécutives du {study['from_utc']} au {study['to_utc']}.",
            f"- Dernière clôture : {study['last_close_usdc']} USDC/BTC ; EMA 5 : {study['ema_5_usdc']} ; EMA 13 : {study['ema_13_usdc']} ; EMA 34 : {study['ema_34_usdc']} USDC.",
            f"- Structure horaire observée : **{study['observed_condition']}**.",
            '- **Stratégie Swing Trading NON validée** : cet échantillon horaire ne démontre ni rentabilité, ni règles de sortie, ni tenue sur plusieurs jours. Aucun conseil d\'achat ou de vente.',
        ])
    else:
        rows.append(f"- Étude impossible sur les archives disponibles : {study.get('reason','couverture insuffisante')}. Aucune EMA ni conclusion inventée.")

    rows.extend(['','## Restrictions','']+['- '+s for s in doc['limitations']])
    rows.extend(['', 'Fichiers sources : `../spot-hourly/`, `../../liquidation-monitor/observations/` et `../../../data/news/latest.json`.', ''])
    return '\n'.join(rows)


def write_outputs(doc,output,now_ms):
    output=Path(output)
    output.mkdir(parents=True,exist_ok=True)
    current=json.dumps(doc,ensure_ascii=False,sort_keys=True,indent=2)+'\n'
    (output/'latest.json').write_text(current,encoding='utf-8')
    (output/'latest.md').write_text(render_md(doc),encoding='utf-8')
    # One digest per UTC hour, preserve older snapshots for later evidence reconstruction.
    key=datetime.fromtimestamp(now_ms/1000,timezone.utc).strftime('%Y-%m-%dT%H')
    index=output/'history';index.mkdir(exist_ok=True)
    p=index/(key+'.json')
    if not p.exists():p.write_text(current,encoding='utf-8')
    return {'latest':str(output/'latest.json'),'history':str(p),'sha256':hashlib.sha256(current.encode('utf-8')).hexdigest()}


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--spot',type=Path,default=SPOT)
    p.add_argument('--liquidations',type=Path,default=LIQ)
    p.add_argument('--news',type=Path,default=NEWS)
    p.add_argument('--out',type=Path,default=OUT)
    p.add_argument('--now-utc')
    args=p.parse_args()
    now=utc(args.now_utc) if args.now_utc else int(datetime.now(timezone.utc).timestamp()*1000)
    if now is None: raise SystemExit('invalid --now-utc')
    dates=days_between(now,3*DAY_MS+HOUR_MS)
    spot=read_lines(args.spot,dates)
    liquid=read_lines(args.liquidations,dates)
    ledger=read_lines(args.liquidations/'run-ledger',dates)
    news=read_json(args.news)
    if not news or not spot: raise SystemExit('Cannot write public monitor: news or OKX Spot evidence unavailable')
    doc=assemble(now,spot,liquid,ledger,news,read_json(args.spot/'status.json'),read_json(args.liquidations/'status.json'))
    output=write_outputs(doc,args.out,now)
    print(json.dumps({'status':doc['status'],'spot_hours':doc['spot']['closed_hours_in_window'],
                      'observed_liquidations':doc['derivatives']['events_observed_in_24h'],
                      'sources_fresh':doc['spot']['fresh'] and doc['derivatives']['fresh_coverage_evidence'],
                      **output},ensure_ascii=False))

if __name__=='__main__': main()
