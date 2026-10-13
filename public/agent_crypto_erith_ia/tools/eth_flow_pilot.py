#!/usr/bin/env python3
"""ERITH.IA — read-only ETH/USDT historical taker-buy experiment.

Inputs are official 12-column Binance Spot 1m archives, already present in
GitHub Releases; this program neither downloads nor modifies anything remotely.
Outputs contain source digests, hourly pressure, out-of-sample paper diagnostics.
No real orders, exchange login, account data or inferred USD/USDC conversion.
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
import statistics
import sys
import zipfile

PAIR = 'ETHUSDT'
MONTH = '2026-09'
CSV_NAME = f'{PAIR}-1m-{MONTH}.csv'
ZIP_NAME = f'{PAIR}-1m-{MONTH}.zip'
GITHUB_SHA256 = '827b46043bdc877d542edf8ff178dc0411cfa166a56fa73f2f850ad06c951b50'
MONTH_START_MS = int(dt.datetime(2026, 9, 1, tzinfo=dt.timezone.utc).timestamp() * 1000)
EXPECTED_MINUTES = calendar.monthrange(2026, 9)[1] * 1440
MAX_ZIP_BYTES = 40_000_000
MAX_CSV_BYTES = 160_000_000
HOURLY_COUNT = EXPECTED_MINUTES // 60
RATIO_THRESHOLDS = (0.50, 0.55, 0.60, 0.65)
FEE_FRACTIONS = (0.008, 0.012, 0.016)  # 0.8%, 1.2%, 1.6% round trip scenarios; not measured
CAPITAL_USDT = 400.0
POSITION_USDT = 100.0


class InvalidArchive(ValueError):
    pass


def require(condition, message):
    if not condition:
        raise InvalidArchive(message)


def iso(ms):
    return dt.datetime.fromtimestamp(ms / 1000, tz=dt.timezone.utc).isoformat()


def parse_native_archive(path: Path, expected_sha: str = GITHUB_SHA256):
    require(path.is_file(), f'Archive absente: {path}')
    require(0 < path.stat().st_size <= MAX_ZIP_BYTES, 'Taille ZIP invalide')
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    require(digest == expected_sha.lower(), f'SHA-256 incorrect: {digest}')
    rows = []
    hourly = []
    unit = None
    count = 0
    with zipfile.ZipFile(path) as archive:
        names = archive.namelist()
        require(names == [CSV_NAME], f'Le ZIP doit contenir uniquement {CSV_NAME}')
        info = archive.getinfo(CSV_NAME)
        require(0 < info.file_size <= MAX_CSV_BYTES and info.compress_size > 0,
                'Taille du CSV non autorisée')
        require(info.file_size <= max(info.compress_size * 200, 160_000),
                'Ratio compression suspect')
        with archive.open(info) as stream:
            reader = csv.reader(io.TextIOWrapper(stream, encoding='utf-8-sig', newline=''))
            for idx, f in enumerate(reader):
                count = idx + 1
                require(len(f) == 12, f'Ligne {idx+1}: 12 colonnes attendues')
                raw_ms = int(f[0])
                local_unit = 'us' if raw_ms >= 10**15 else 'ms'
                if unit is None:
                    unit = local_unit
                require(local_unit == unit, 'Unités temporelles mélangées')
                ms = raw_ms // 1000 if unit == 'us' else raw_ms
                require(idx < EXPECTED_MINUTES and ms == MONTH_START_MS + idx * 60000,
                        f'Ligne {idx+1}: minute manquante, dupliquée ou hors mois')
                raw_close = int(f[6])
                close_ms = raw_close // 1000 if unit == 'us' else raw_close
                require(ms <= close_ms < ms + 60000, f'Ligne {idx+1}: fermeture hors minute')
                values = [float(f[k]) for k in (1,2,3,4,5,7,9,10)]
                op, hi, lo, cl, base_vol, quote_vol, taker_base, taker_quote = values
                require(all(math.isfinite(v) for v in values), f'Ligne {idx+1}: NaN/Inf')
                require(0 < lo <= min(op, cl) and max(op, cl) <= hi,
                        f'Ligne {idx+1}: OHLC incohérent')
                require(base_vol >= 0 and quote_vol >= 0 and taker_base >= 0 and taker_quote >= 0,
                        f'Ligne {idx+1}: volumes négatifs')
                tolerance = 1e-7
                require(taker_base <= base_vol + tolerance*max(base_vol,1) and
                        taker_quote <= quote_vol + tolerance*max(quote_vol,1),
                        f'Ligne {idx+1}: taker-buy dépasse le volume total')
                require((base_vol == 0) == (quote_vol == 0), f'Ligne {idx+1}: volumes zéro incompatibles')
                require(quote_vol == 0 or (base_vol>0 and
                        lo*(1-tolerance) <= quote_vol/base_vol <= hi*(1+tolerance)),
                        f'Ligne {idx+1}: volume de cotation non cohérent avec OHLC')
                trades = int(f[8]); require(trades >= 0, 'Nombre de transactions négatif')
                if idx % 60 == 0:
                    rows.append(dict(timestamp_ms=ms, open=op, high=hi, low=lo,
                        close=cl, base_volume=0., quote_volume=0., taker_buy_base=0.,
                        taker_buy_quote=0., trades=0))
                h = rows[-1]
                h['high']=max(h['high'],hi);h['low']=min(h['low'],lo);h['close']=cl
                h['base_volume']+=base_vol;h['quote_volume']+=quote_vol
                h['taker_buy_base']+=taker_base;h['taker_buy_quote']+=taker_quote;h['trades']+=trades
    require(count == EXPECTED_MINUTES, f'Mois incomplet: {count}/{EXPECTED_MINUTES}')
    require(len(rows) == HOURLY_COUNT, f'Heures manquantes: {len(rows)}')
    for h in rows:
        q=h['quote_volume']
        h['taker_buy_share']=h['taker_buy_quote']/q if q>0 else None
        h['taker_sell_quote']=q-h['taker_buy_quote']
        require(h['taker_buy_share'] is None or -1e-9 <= h['taker_buy_share'] <= 1+1e-9,
            'Part achat impossible')
    return dict(file_name=path.name, sha256=digest, timestamps_unit=unit,
                source='Binance Spot / ETHUSDT / official native 1m monthly CSV',
                quote='USDT', minutes=EXPECTED_MINUTES, hours=len(rows),
                first_hour_utc=iso(rows[0]['timestamp_ms']),last_hour_utc=iso(rows[-1]['timestamp_ms'])),rows


def run_paper(rows, *, threshold, hold_hours, start_hour, end_hour, fee_fraction=0.008):
    """Pre-declared simple baseline; hour h signal, BUY hour h+1 OPEN, SELL h+1+hold OPEN.

    Signals use only historical data available at end of h. Non-overlapping trades.
    Current hour quote_volume must exceed median of previous 24 hours. Threshold
    uses taker_buy_share of h, not knowledge of future bars.
    """
    require(0 <= fee_fraction < 1, 'Frais de simulation invalides')
    deals = []
    last_exit = start_hour
    for h in range(max(start_hour,24), min(end_hour, len(rows))):
        entry_hour = h + 1
        exit_hour = entry_hour + hold_hours
        if exit_hour >= end_hour or exit_hour >= len(rows) or entry_hour < last_exit:
            continue
        previous = [r['quote_volume'] for r in rows[h-24:h]]
        if not previous or rows[h]['quote_volume'] <= statistics.median(previous):
            continue
        share = rows[h]['taker_buy_share']
        if share is None or share < threshold:
            continue
        entry, exit_ = rows[entry_hour]['open'], rows[exit_hour]['open']
        gross_pct = (exit_/entry - 1)*100
        net_pct = ((exit_/entry)*(1-fee_fraction)-1)*100
        pnl = POSITION_USDT*net_pct/100
        deals.append(dict(signal_at_utc=iso(rows[h]['timestamp_ms']+3600000),
            entry_at_utc=iso(rows[entry_hour]['timestamp_ms']),
            exit_at_utc=iso(rows[exit_hour]['timestamp_ms']),
            entry_usdt=entry,exit_usdt=exit_,pressure_pct=share*100,
            gross_pct=gross_pct,net_pct=net_pct,profit_usdt=pnl))
        last_exit=exit_hour+1
    equity=CAPITAL_USDT;top=equity;max_dd=0.;loss_streak=0;max_loss_streak=0
    for d in deals:
        equity+=d['profit_usdt'];top=max(top,equity)
        max_dd=max(max_dd,top-equity)
        loss_streak=loss_streak+1 if d['profit_usdt']<0 else 0
        max_loss_streak=max(max_loss_streak,loss_streak)
    return dict(threshold_pct=int(threshold*100),hold_hours=hold_hours,fees_roundtrip_pct=fee_fraction*100,
        start_hour=start_hour,end_hour=end_hour,trades=len(deals),
        total_profit_usdt=round(equity-CAPITAL_USDT,8),
        wins=sum(d['profit_usdt']>0 for d in deals),losses=sum(d['profit_usdt']<0 for d in deals),
        worst_drawdown_usdt=round(max_dd,8),max_consecutive_losses=max_loss_streak,
        deals=deals)


def report(source, rows):
    total_q=sum(x['quote_volume'] for x in rows)
    total_taker=sum(x['taker_buy_quote'] for x in rows)
    active=[x['taker_buy_share'] for x in rows if x['taker_buy_share'] is not None]
    out=dict(schema='erith.trader.eth.taker-buy-proof.v1',scope='ETH/USDT Binance Spot September 2026',
        source=source,interpretation='Taker BUY quote volume / traded quote volume; not net money inflow; not all venue volume',
        observed=dict(total_quote_volume_usdt=total_q,total_taker_buy_quote_usdt=total_taker,
            total_taker_sell_quote_usdt=total_q-total_taker,
            weighted_taker_buy_share_pct=100*total_taker/total_q if total_q else None,
            hourly_share_median_pct=100*statistics.median(active) if active else None,
            hours_with_volume=len(active),hours_over_55pct=sum(v>=.55 for v in active),
            hours_over_60pct=sum(v>=.60 for v in active),
            hours_over_65pct=sum(v>=.65 for v in active)),
        methods=dict(capital_usdt=CAPITAL_USDT,position_usdt=POSITION_USDT,
            fee_total_roundtrip_pct_scenarios=[v*100 for v in FEE_FRACTIONS],
            entry='opening price of hour after a completed hourly signal',
            exit='opening price of hour after N hold hours',
            volume_filter='signal hour volume > median of previous 24 completed hours',
            exclusive_positions=True,no_slippage_proof=True,no_live_orders=True,
            train_hours='2026-09-01 through 2026-09-20 UTC',
            test_hours='2026-09-21 through 2026-09-30 UTC',
            warning='Diagnostic research only: 10-day test and fees assumed; no confirmed strategy'),
        trials={})
    for horizon in (12,48):
        for threshold in RATIO_THRESHOLDS:
            for fee in FEE_FRACTIONS:
                key=f'pressure_{int(threshold*100)}_hold_{horizon}h_cost_{round(fee*100,1)}pct'
                out['trials'][key]={
                    'train':run_paper(rows,threshold=threshold,hold_hours=horizon,start_hour=0,end_hour=20*24,fee_fraction=fee),
                    'test':run_paper(rows,threshold=threshold,hold_hours=horizon,start_hour=20*24,end_hour=30*24,fee_fraction=fee)}
    return out


def save_hourly(out: Path, rows):
    keys=['timestamp_ms','open','high','low','close','base_volume','quote_volume','taker_buy_base',
          'taker_buy_quote','taker_sell_quote','trades','taker_buy_share']
    with out.open('w',encoding='utf-8',newline='') as f:
        writer=csv.DictWriter(f,fieldnames=keys);writer.writeheader();writer.writerows(rows)


def main(argv=None):
    p=argparse.ArgumentParser(description='Pilote ETH: contrôle des archives et flux acheteurs agressifs (lecture seule)')
    p.add_argument('--zip',required=True,type=Path,help='Archive native ETHUSDT-1m-2026-09.zip, jamais téléchargée automatiquement')
    p.add_argument('--out',required=True,type=Path,help='Dossier de résultats local')
    args=p.parse_args(argv)
    try:
        source,rows=parse_native_archive(args.zip)
        result=report(source,rows)
        args.out.mkdir(parents=True,exist_ok=True)
        (args.out/'eth_flow_results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
        save_hourly(args.out/'eth_hourly_flows.csv',rows)
        print(json.dumps({'status':'VERIFIED', 'source':source,
           'weighted_share_pct':result['observed']['weighted_taker_buy_share_pct'],
           'results_json':str(args.out/'eth_flow_results.json'),
           'hourly_csv':str(args.out/'eth_hourly_flows.csv')},ensure_ascii=False,indent=2))
        return 0
    except (InvalidArchive,zipfile.BadZipFile,ValueError,OSError) as err:
        print(json.dumps({'status':'BLOCKED','reason':str(err),'no_market_results_claimed':True},ensure_ascii=False),file=sys.stderr)
        return 2

if __name__=='__main__':
    sys.exit(main())
