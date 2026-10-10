#!/usr/bin/env python3
"""Stage a verified Kraken 1m OHLCVT month; never updates the canonical Coffre.

Requires an original ZIP and a separately trusted SHA-256. Kraken omits
minutes without trades: sparse months are kept sparse, never invented.
"""
from __future__ import annotations
import argparse
import csv
import datetime as dt
from decimal import Decimal, InvalidOperation
import gzip
import hashlib
import io
import json
from pathlib import Path
import re
import zipfile

SCHEMA = 'aerith.kraken.ohlcvt.verified-sparse-month.v1'
PAIR = re.compile(r'^[A-Z0-9]{2,35}$')
MONTH = re.compile(r'^20\d{2}-(?:0[1-9]|1[0-2])$')
SHA = re.compile(r'^[0-9a-f]{64}$')
QUOTES = ('USD', 'USDT', 'USDC', 'EUR', 'EURC', 'BTC', 'ETH')


def check(ok, msg):
    if not ok:
        raise ValueError(msg)


def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(8 * 1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def decimal(raw):
    try:
        check(isinstance(raw, str), 'Invalid CSV cell type')
        value = Decimal(raw)
        check(value.is_finite(), 'Nonfinite OHLCVT value')
        return value
    except InvalidOperation as e:
        raise ValueError('Invalid OHLCVT decimal') from e


def month_window(month):
    check(bool(MONTH.fullmatch(month)), 'Invalid source month')
    year, number = map(int, month.split('-'))
    start = dt.datetime(year, number, 1, tzinfo=dt.timezone.utc)
    end = dt.datetime(year + int(number == 12), number % 12 + 1, 1,
                      tzinfo=dt.timezone.utc)
    check(end <= dt.datetime.now(dt.timezone.utc), 'Source month not yet closed')
    return int(start.timestamp()), int(end.timestamp())


def exact_owner(catalog, coin_id, pair, quote):
    check(catalog.get('schema') == 'aerith.public.ohlcv.top250.federated-native-archives.v1',
          'Untrusted Top250 catalog schema')
    check(catalog.get('ranked') == 250 and len(catalog.get('assets', [])) == 250,
          'Untrusted Top250 identity set')
    assets = [a for a in catalog['assets'] if a.get('id') == coin_id]
    check(len(assets) == 1, 'Unknown or ambiguous exact-ID owner')
    asset = assets[0]
    symbol = asset['symbol']
    check(re.fullmatch(r'[A-Z0-9]{1,30}', symbol) is not None and
          pair == symbol + quote and pair != quote + quote,
          'Pair does not match exact-ID symbol / quote')
    check(asset.get('months') == 0, 'Owner already represented by Binance or Bitget')
    return {'rank': asset['rank'], 'id': asset['id'], 'symbol': symbol,
            'name': asset['name']}


def source_member(z, member, pair):
    check(member and not member.startswith('/') and '\\' not in member and
          '..' not in member.split('/'), 'Unsafe ZIP member path')
    parts = member.split('/')
    check(len(parts) <= 4 and all(p for p in parts), 'Unsafe ZIP nesting')
    base = parts[-1].upper()
    check(base.startswith(pair) and base.endswith('.CSV') and
          re.fullmatch(re.escape(pair) + r'[_\-](?:1|1M)(?:[_\-]OHLCVT)?\.CSV', base),
          'ZIP member must be the specified native 1m market, not a different interval')
    check(member in z.namelist(), 'Exact source member absent')
    info = z.getinfo(member)
    check(info.file_size <= 1_500_000_000 and info.file_size > 0,
          'CSV member exceeds safe size cap')
    return info


def verify_rows(z, member, month):
    start, end = month_window(month)
    result = []
    previous_ts = None
    with z.open(member, 'r') as raw, io.TextIOWrapper(raw, encoding='utf-8-sig', newline='') as handle:
        reader = csv.reader(handle)
        for line, row in enumerate(reader, start=1):
            check(len(row) == 7, 'Kraken OHLCVT must have seven native columns')
            check(row[0].isdigit(), 'Kraken timestamp must be Unix seconds')
            ts = int(row[0])
            check(0 < ts < 4_102_444_800 and ts % 60 == 0 and
                  (previous_ts is None or ts > previous_ts),
                  'Non-monotonic, repeated or unaligned 1m timestamp')
            previous_ts = ts
            if not start <= ts < end:
                continue
            o, h, l, c, v = [decimal(x) for x in row[1:6]]
            check(min(o, h, l, c) > 0 and l <= min(o, c) <= max(o, c) <= h and v >= 0,
                  'Invalid native OHLCV invariants')
            check(row[6].isdigit() and int(row[6]) > 0,
                  'Trade-bearing Kraken interval must have a positive trade count')
            result.append([ts * 1000] + row[1:7])
            check(len(result) <= 44_640, "More than one month of possible 1m bars")
    check(result, 'No native 1m trading interval for this source month')
    missing = (end - start) // 60 - len(result)
    check(missing >= 0, 'Native 1m month overfilled')
    return result, missing, (end-start)//60


def stage(archive, trusted_sha, catalog_path, coin_id, pair, quote, month, member, output):
    check(archive.is_file() and catalog_path.is_file(), 'Archive and canonical catalog required')
    check(bool(SHA.fullmatch(trusted_sha)), 'Trusted official SHA-256 required')
    check(bool(PAIR.fullmatch(pair)) and quote in QUOTES, 'Unsafe native market/quote')
    owner = exact_owner(json.loads(catalog_path.read_text(encoding='utf-8')),
                        coin_id, pair, quote)
    actual = digest(archive)
    check(actual == trusted_sha, 'Original Kraken archive SHA-256 mismatch')
    with zipfile.ZipFile(archive) as z:
        # zipfile verifies the selected member CRC while consuming its stream.
        source_member(z, member, pair)
        rows, gaps, expected = verify_rows(z, member, month)
    payload = {'schema': SCHEMA, 'owner': owner, 'pair': pair,
               'quote': quote, 'interval': '1m', 'month': month,
               'source': 'Kraken official historical OHLCVT CSV',
               'source_zip_sha256': actual, 'source_zip_member': member,
               'native_columns': ['open_time_ms', 'open', 'high', 'low', 'close',
                                  'base_volume', 'trades'],
               'source_1m_rows': len(rows), 'possible_minutes': expected,
               'minutes_without_trades': gaps, 'empty_minutes_interpolated': False,
               'native_trade_intervals': rows}
    raw = (json.dumps(payload, sort_keys=True, separators=(',', ':')) + '\n').encode()
    blob = gzip.compress(raw, mtime=0)
    file = f'{coin_id}-{pair}-{month}-kraken-1m.json.gz'
    out_file = output / file
    output.mkdir(parents=True, exist_ok=True)
    check(not out_file.exists(), 'Immutable staged file already exists')
    out_file.write_bytes(blob)
    manifest = {k: v for k, v in payload.items() if k != 'native_trade_intervals'}
    manifest.update({'staged_file': file, 'staged_bytes': len(blob),
                     'staged_sha256': hashlib.sha256(blob).hexdigest(),
                     'status': 'VERIFIED_SOURCE_STAGE_NOT_FEDERATED',
                     'counted_in_coffre': False})
    manifest_path = output / (file + '.manifest.json')
    check(not manifest_path.exists(), 'Immutable manifest already exists')
    manifest_path.write_text(json.dumps(manifest, indent=2, sort_keys=True)+'\n')
    return manifest


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    for arg in ('archive','catalog','coin-id','pair','quote','month','member','output','expected-sha256'):
        ap.add_argument('--'+arg, required=True)
    a = ap.parse_args()
    result=stage(Path(a.archive),a.expected_sha256,Path(a.catalog),a.coin_id,
                 a.pair,a.quote,a.month,a.member,Path(a.output))
    print(json.dumps(result,sort_keys=True))


if __name__ == '__main__':
    main()
