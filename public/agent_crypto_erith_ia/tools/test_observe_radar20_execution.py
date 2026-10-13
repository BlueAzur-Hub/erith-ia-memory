import datetime as dt
import json
import pathlib
import tempfile
import unittest
from unittest.mock import patch

import observe_radar20_execution as obs

UTC=dt.timezone.utc
H=obs.HOUR_MS
DAY=dt.datetime(2026,10,14,tzinfo=UTC)
DEC=int(DAY.timestamp()*1000)


def candles(decision_ms=DEC, *, signal=False):
    seq=[]
    for i in range(73):
        ts=decision_ms-(73-i)*H
        close=100*(1.04 if i==72 else 1)
        volume=1000*(2 if i==72 and signal else 1)
        taker=volume*.6
        seq.append([ts,100,105,99,close,1,ts+H-1,volume,10,0,taker,0])
    return seq


def book(at_ms=DEC+6*60000):
    return {'code':'0','data':[{'ts':str(at_ms),'asks':[['101','10','0','2']],
                                 'bids':[['100','10','0','2']]}]}

class HourlyObserver(unittest.TestCase):
    def test_73_historical_hours_and_signal_ranking(self):
        hours={s:obs.parse_hourly_73(candles(signal=(s=='ETH')),DEC) for s in obs.SYMBOLS}
        trend,candidates=obs.compute_candidates(hours)
        self.assertEqual(len(candidates),1)
        self.assertEqual(candidates[0]['pair'],'ETH-USDT')
        self.assertTrue(candidates[0]['candidate_A'])
        self.assertTrue(candidates[0]['candidate_B'])
        self.assertGreaterEqual(trend,3)

    def test_missing_hour_or_future_hour_fails_closed(self):
        arr=candles()
        arr[-1][0]+=H
        with self.assertRaisesRegex(ValueError,'Missing'):
            obs.parse_hourly_73(arr,DEC)
        with self.assertRaisesRegex(ValueError,'73'):
            obs.parse_hourly_73(candles()[:-1],DEC)

    def test_buy_and_sell_100_quote_depth_without_fee(self):
        x=obs.estimate_book(book()['data'][0],now_ms=DEC+6*60000)
        self.assertAlmostEqual(x['public_book_immediate_resale_usdt'],100*100/101,6)
        self.assertFalse(x['account_fee_included'])
        self.assertFalse(x['future_fill_guaranteed'])
        self.assertGreater(x['instant_spread_depth_only_cost_pct'],0)

    def test_stale_or_insufficient_book_is_rejected(self):
        with self.assertRaisesRegex(ValueError,'stale'):
            obs.estimate_book(book()['data'][0],now_ms=DEC+40*60000)
        b=book()['data'][0];b['asks']=[['101','0.1']]
        with self.assertRaisesRegex(ValueError,'ask liquidity'):
            obs.estimate_book(b,now_ms=DEC+6*60000)

    def test_complete_sample_keeps_real_observation_time(self):
        now=DAY+dt.timedelta(minutes=6)
        with patch.object(obs,'utcnow',return_value=now):
            r=obs.snapshot(DAY,now=now,
                klines_fetch=lambda sym:candles(signal=sym=='ETH'),
                book_fetch=lambda sym:book(int(now.timestamp()*1000)))
        self.assertEqual(r['source_status'],'ALL_20_COMPLETE')
        self.assertEqual(r['signals'][0]['pair'],'ETH-USDT')
        self.assertEqual(r['signals'][0]['candidate_B'],True)
        self.assertEqual(len(r['okx_books']),1)
        self.assertEqual(r['offset_after_hour_seconds'],360.)
        self.assertFalse(r['authenticated_fee_included'])
        self.assertIn('NOT at',r['latency_note'])

    def test_missing_one_binance_pair_blocks_global_classification(self):
        def fetch(sym):
            if sym=='ADA':raise OSError('blocked')
            return candles(signal=True)
        r=obs.snapshot(DAY,now=DAY+dt.timedelta(minutes=6),klines_fetch=fetch,
            book_fetch=lambda sym:self.fail('No OKX calls before complete input'))
        self.assertEqual(r['source_status'],'INCOMPLETE_BINANCE_INPUT_NO_SIGNALS')
        self.assertEqual(r['signals'],[])
        self.assertEqual(len(r['missing']),1)

    def test_late_run_does_not_invent_at_signal_snapshot(self):
        r=obs.snapshot(DAY,now=DAY+dt.timedelta(minutes=46),
             klines_fetch=lambda sym:self.fail('No network'),book_fetch=lambda sym:self.fail('No network'))
        self.assertEqual(r['source_status'],'TOO_LATE_FOR_OBSERVATION')
        self.assertEqual(r['okx_books'],[])

    def test_append_only_provenance_and_idempotence(self):
        now=DAY+dt.timedelta(minutes=6)
        with tempfile.TemporaryDirectory() as tmp, patch.object(obs,'validate_protocol',return_value=None),patch.object(obs,'utcnow',return_value=now):
            path=pathlib.Path(tmp)
            first=obs.run(now=now,out=path,klines_fetch=lambda s:candles(signal=s=='ETH'),
                      book_fetch=lambda s:book(int(now.timestamp()*1000)))
            self.assertEqual(first['source_status'],'ALL_20_COMPLETE')
            index=json.loads((path/'index.json').read_text())
            self.assertEqual(len(index['observations']),1)
            self.assertIsNone(obs.run(now=now,out=path))
            self.assertEqual((path/index['observations'][0]['file']).is_file(),True)
            (path/index['observations'][0]['file']).write_text('{}')
            with self.assertRaisesRegex(ValueError,'Previous hourly evidence changed'):
                obs.run(now=now+dt.timedelta(hours=1),out=path,klines_fetch=lambda s:candles(signal=False))

    def test_start_and_stop_without_network_or_output(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(obs,'validate_protocol',return_value=None):
            path=pathlib.Path(tmp)
            self.assertIsNone(obs.run(now=DAY-dt.timedelta(minutes=1),out=path))
            self.assertIsNone(obs.run(now=obs.END,out=path))
            self.assertFalse(list(path.iterdir()))

if __name__=='__main__':unittest.main()
