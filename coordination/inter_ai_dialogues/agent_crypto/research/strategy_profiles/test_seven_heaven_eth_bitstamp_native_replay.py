"""Offline tests for Seven Heaven native Bitstamp ETH replay; no network or orders."""
import io
import importlib.util
import json
import tempfile
import hashlib
import pathlib
import unittest
from datetime import datetime, timedelta, timezone
from urllib.parse import urlparse, parse_qs
from unittest.mock import patch

SCRIPT = pathlib.Path(__file__).with_name('SEVEN_HEAVEN_ETH_BITSTAMP_NATIVE_REPLAY_2026_11_12.py')
spec = importlib.util.spec_from_file_location('seven_eth_native', SCRIPT)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


def synthetic_candles():
    begin = datetime(2023, 4, 1, tzinfo=timezone.utc)
    records = []
    for i in range(1310):
        t = int((begin + timedelta(days=i)).timestamp())
        price = 1200. + i * 0.6 + (50 if i % 20 < 10 else -40)
        records.append({'timestamp':str(t),'open':str(price),
                        'high':str(price+20),'low':str(price-20),
                        'close':str(price+2),'volume':'10'})
    return records


class NativeReplayTests(unittest.TestCase):
    def test_paged_fetch_exact_calendar_and_replay(self):
        synthetic = synthetic_candles()
        calls = []
        def fake_open(request, timeout):
            q = parse_qs(urlparse(request.full_url).query)
            end = int(q['end'][0])
            chosen = [x for x in synthetic if int(x['timestamp']) <= end][-1000:]
            calls.append(end)
            payload = {'data':{'pair':'ETH/USD','ohlc':chosen}}
            return io.BytesIO(json.dumps(payload).encode())
        with patch.object(mod,'urlopen',side_effect=fake_open):
            series, history = mod.collect()
        self.assertEqual(len(calls),2)
        self.assertEqual(len(history),2)
        self.assertEqual(len(series),1310)
        self.assertEqual(series[0]['date'],'2023-04-01')
        self.assertEqual(series[-1]['date'],'2026-10-31')
        mod.add_ema(series)
        ema=mod.paper(series,'EMA')
        hold=mod.paper(series,'HOLD')
        self.assertEqual(len(ema['curve']),1035)
        self.assertEqual(len(hold['curve']),1035)
        self.assertEqual(hold['trades'],1)

    def test_export_csv_uses_lf_only(self):
        rows = [mod.parse_row(x) for x in synthetic_candles()]
        mod.add_ema(rows)
        signals = mod.paper(rows, 'EMA')['curve']
        bench = [{'date': r['date'], 'eth_exposed': r['exposed'],
                  'eth_hold': rows[i + 275]['close']}
                 for i, r in enumerate(signals)]
        with tempfile.TemporaryDirectory() as scratch:
            out = pathlib.Path(scratch)
            doc = mod.export(rows, [], bench, out)
            raw_prices = (out/'bitstamp_ethusd_daily_2023_2026.csv').read_bytes()
            raw_disagree = (out/'eth_ema_binance_bitstamp_disagreements.csv').read_bytes()
            self.assertNotIn(bytes((13,)), raw_prices)
            self.assertNotIn(bytes((13,)), raw_disagree)
            self.assertEqual(hashlib.sha256(raw_prices).hexdigest(), doc['source_sha256'])
            self.assertEqual(len(raw_prices.splitlines()), 1311)


    def test_gap_is_rejected(self):
        rows = [mod.parse_row(x) for x in synthetic_candles()]
        del rows[200]
        with self.assertRaises(ValueError):
            mod.validate_days(rows)

    def test_non_midnight_or_bad_ohlc_is_rejected(self):
        r = synthetic_candles()[0]
        with self.assertRaises(ValueError):
            mod.parse_row({**r,'timestamp':str(int(r['timestamp'])+1)})
        with self.assertRaises(ValueError):
            mod.parse_row({**r,'high':'0'})


if __name__ == '__main__': unittest.main()
