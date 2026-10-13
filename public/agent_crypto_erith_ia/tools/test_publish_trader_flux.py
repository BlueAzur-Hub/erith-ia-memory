import tempfile
import unittest
import json
import hashlib
from pathlib import Path
from unittest.mock import patch

import publish_trader_flux as mod
from eth_flow_pilot import MONTH_START_MS, InvalidArchive


class PublishedViewsTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.zip = self.root/'ETHUSDT-1m-2026-09.zip'
        self.zip.write_bytes(b'fake-but-isolated')
        self.digest = hashlib.sha256(self.zip.read_bytes()).hexdigest()
        self.rows=[]
        for h in range(720):
            q=120.0 + (h % 11)*5
            self.rows.append(dict(timestamp_ms=MONTH_START_MS + h*3600000,
                open=2500+h/100, high=2505+h/100, low=2495+h/100,
                close=2501+h/100, base_volume=q/2500, quote_volume=q,
                taker_buy_quote=.60*q, taker_sell_quote=.40*q,
                taker_buy_share=.60, trades=30,
                taker_buy_base=.60*q/2500))
        self.source = {'file_name':self.zip.name,'sha256':self.digest,
                       'minutes':43200, 'hours':720, 'timestamps_unit':'us',
                       'source':'SYNTHETIC TEST ONLY','quote':'USDT'}

    def tearDown(self):
        self.tmp.cleanup()

    def _build(self):
        with patch.object(mod,'parse_native_archive', return_value=(self.source,self.rows)) as parser:
            idx, summary=mod.create_views(self.zip,self.root/'output',self.digest)
            parser.assert_called_once_with(self.zip,self.digest)
            return idx, summary

    def test_thirty_days_and_full_hourly_coverage(self):
        idx,_=self._build()
        j=json.loads(idx.read_text())
        self.assertEqual(len(j['days']),30)
        self.assertEqual(sum(x['rows'] for x in j['days']),720)
        self.assertEqual(j['minute_rows_checked'],43200)
        for day in j['days']:
            path=idx.parent/day['file']
            self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(),day['sha256'])
            data=json.loads(path.read_text())
            self.assertEqual(len(data['rows']),24)
            self.assertEqual(data['quote'],'USDT')
            self.assertFalse(data['signal_authorized'])

    def test_day_values_are_real_source_rows_not_relabelled_usd(self):
        idx,_=self._build()
        d=json.loads((idx.parent/'days'/'01.json').read_text())
        self.assertEqual(d['columns'][1], 'open_usdt')
        self.assertEqual(d['columns'][8], 'taker_buy_pct')
        self.assertEqual(d['rows'][0][1],2500)
        self.assertEqual(d['rows'][0][8],60)
        self.assertEqual(d['rows'][1][0]-d['rows'][0][0],3600000)

    def test_summary_is_descriptive_not_a_permission(self):
        _,summary=self._build()
        s=json.loads(summary.read_text())
        self.assertFalse(s['strategy_certified'])
        self.assertEqual(len(s['trials']),24)
        self.assertAlmostEqual(s['observed']['weighted_taker_buy_share_pct'],60)
        self.assertTrue(s['methods']['no_live_orders'])
        self.assertNotIn('deals',str(s['trials']))

    def test_published_output_is_identical_for_same_input(self):
        idx,_=self._build()
        h1=hashlib.sha256(idx.read_bytes()).hexdigest()
        self._build()
        h2=hashlib.sha256(idx.read_bytes()).hexdigest()
        self.assertEqual(h1,h2)

    def test_incomplete_month_never_published(self):
        bad_rows=self.rows[:-1]
        with patch.object(mod,'parse_native_archive',return_value=(self.source,bad_rows)):
            with self.assertRaisesRegex(ValueError, 'incomplete'):
                mod.create_views(self.zip,self.root/'fail',self.digest)
        self.assertFalse((self.root/'fail').exists())

    def test_empty_archive_or_wrong_digest_blocked_by_real_parser(self):
        with self.assertRaises(InvalidArchive):
            mod.create_views(self.zip,self.root/'bad','0'*64)
        self.assertFalse((self.root/'bad').exists())

if __name__=='__main__':unittest.main()
