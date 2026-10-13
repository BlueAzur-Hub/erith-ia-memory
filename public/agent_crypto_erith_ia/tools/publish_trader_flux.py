#!/usr/bin/env python3
"""Build small, public, deterministic ETH taker-flow views from a VERIFIED native ZIP.

Read-only source operation. Outputs target a separate derived directory, never
rewrite historical source archives or the active Trader runtime.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
from pathlib import Path

from eth_flow_pilot import parse_native_archive, report, MONTH, PAIR, EXPECTED_MINUTES, GITHUB_SHA256

SCHEMA = 'erith.trader.market-flows.hourly.v1'
INDEX_SCHEMA = 'erith.trader.market-flows.index.v1'
COLUMNS = ['timestamp_utc', 'open_usdt', 'high_usdt', 'low_usdt',
           'close_usdt', 'volume_usdt', 'taker_buy_usdt',
           'taker_sell_usdt', 'taker_buy_pct', 'trades']


def write_json(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(',', ':')) + '\n',
                    encoding='utf-8')


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def rounded(x, digits=6):
    if x is None:
        return None
    v = round(float(x), digits)
    if not math.isfinite(v):
        raise ValueError('Non-finite numeric output')
    return v


def create_views(zip_path: Path, target_root: Path, expected_sha=GITHUB_SHA256):
    # parse_native_archive enforces 12 Binance fields, contiguous 1m candles,
    # OHLC, sums of volume, time units, and exact verified source ZIP SHA-256.
    source, hourly = parse_native_archive(zip_path, expected_sha)
    if source['minutes'] != EXPECTED_MINUTES or len(hourly) != 720:
        raise ValueError('Hourly coverage incomplete: refuse partial publication')
    location = target_root / PAIR / MONTH
    manifest_days = []
    for day in range(1, 31):
        chunk = hourly[(day-1)*24:day*24]
        if len(chunk) != 24:
            raise ValueError('Day hourly count invalid')
        points = []
        for h in chunk:
            # Keep literal USDT. NEVER silently rename USDT to USD.
            points.append([
                h['timestamp_ms'], rounded(h['open'], 8), rounded(h['high'], 8),
                rounded(h['low'], 8), rounded(h['close'], 8),
                rounded(h['quote_volume'], 8), rounded(h['taker_buy_quote'], 8),
                rounded(h['taker_sell_quote'], 8),
                rounded(h['taker_buy_share'] * 100, 6) if h['taker_buy_share'] is not None else None,
                int(h['trades'])
            ])
        filename = f'{day:02d}.json'
        pathname = location / 'days' / filename
        write_json(pathname, {
            'schema': SCHEMA, 'pair': PAIR, 'quote': 'USDT', 'source': 'Binance Spot',
            'day_utc': f'{MONTH}-{day:02d}', 'columns': COLUMNS, 'rows': points,
            'source_zip_sha256': source['sha256'], 'rows_count': 24,
            'not_live': True, 'signal_authorized': False
        })
        manifest_days.append({'date': f'{MONTH}-{day:02d}',
                              'file': 'days/' + filename,
                              'sha256': digest(pathname), 'rows': 24,
                              'bytes': pathname.stat().st_size})
    results = report(source, hourly)
    # Export compact aggregates and simulation diagnostics only; this does not
    # imply profitability. Raw archive stays in Releases (single source of truth).
    summary = {
        'schema': 'erith.trader.market-flows.summary.v1', 'pair': PAIR,
        'month': MONTH, 'quote': 'USDT', 'source': source,
        'observed': results['observed'], 'methods': results['methods'],
        'result_status': 'HISTORICAL_RESEARCH_NOT_LIVE',
        'strategy_certified': False,
        'trials': {k: {phase: {key: val for key,val in series[phase].items() if key != 'deals'}
                        for phase in ('train','test')}
                   for k,series in results['trials'].items()}
    }
    summary_path = location / 'summary.json'
    write_json(summary_path, summary)
    month_index = {
        'schema': INDEX_SCHEMA, 'pair': PAIR, 'month': MONTH,
        'asset_id': 'ethereum', 'quote': 'USDT', 'resolution': '1h',
        'source': 'Binance Spot public native monthly 1m CSV',
        'source_release': f'crypto-spot-bulk-{MONTH}-1m',
        'source_filename': zip_path.name,
        'source_zip_sha256': source['sha256'],
        'source_integrity_verified': True,
        'data_origin': 'VERIFIED_SOURCE_ZIP_NOT_SYNTHETIC',
        'hourly_rows': len(hourly), 'minute_rows_checked': source['minutes'],
        'columns': COLUMNS, 'days': manifest_days,
        'summary': {'file': 'summary.json', 'sha256': digest(summary_path),
                    'bytes': summary_path.stat().st_size},
        'not_live': True, 'real_orders': False,
        'disclaimer': 'Archived taker BUY share measures liquidity-taking trades on Binance Spot, not future returns or money inflow.'
    }
    month_index_path=location/'index.json'
    write_json(month_index_path, month_index)
    collection_index = {'schema':'erith.trader.market-flows.collection.v1',
                        'month_count': 1, 'markets': [{
                            'pair':PAIR, 'month':MONTH,
                            'index':f'{PAIR}/{MONTH}/index.json',
                            'sha256':digest(month_index_path),
                            'quote':'USDT', 'hours':720}],
                        'not_live':True}
    write_json(target_root/'index.json', collection_index)
    return month_index_path, summary_path


def main():
    p=argparse.ArgumentParser(description='Publishable ETH flow projections from verified Binance ZIP')
    p.add_argument('--zip', type=Path, required=True)
    p.add_argument('--out', type=Path, required=True)
    args=p.parse_args()
    index, summary=create_views(args.zip,args.out)
    print(json.dumps({'status':'DERIVED_VERIFIED','index':str(index),'summary':str(summary)},ensure_ascii=False))

if __name__=='__main__':
    main()
