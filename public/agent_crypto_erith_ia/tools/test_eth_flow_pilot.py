import unittest, tempfile, zipfile, hashlib, io, csv, datetime as dt
from pathlib import Path
from eth_flow_pilot import (
    parse_native_archive, run_paper, report, InvalidArchive,
    EXPECTED_MINUTES, MONTH_START_MS, CSV_NAME,
)

class TestETHFlow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        cls.root=Path(cls.temp.name)
        def write(rows, name):
            p=cls.root/name
            with zipfile.ZipFile(p,'w',compression=zipfile.ZIP_DEFLATED) as z:
                payload=io.StringIO();w=csv.writer(payload)
                w.writerows(rows)
                z.writestr(CSV_NAME,payload.getvalue())
            return p, hashlib.sha256(p.read_bytes()).hexdigest()
        def generator(mode=None):
            for i in range(EXPECTED_MINUTES):
                t=(MONTH_START_MS+i*60000)*1000  # microseconds: Binance 2026 style
                share=0.6
                if mode=='overflow' and i==100:
                    share=1.1
                if mode=='gap' and i==80:
                    t+=60000000
                yield [t,2500,2510,2490,2501,2,(t+59999000),5002,10,2*share,5002*share,0]
        cls.good,cls.digest=write(generator(),'good.zip')
        cls.overflow,cls.bad_digest=write(generator('overflow'),'overflow.zip')
        cls.gap,cls.gap_digest=write(generator('gap'),'gap.zip')
    @classmethod
    def tearDownClass(cls): cls.temp.cleanup()
    def test_full_month_microsecond_integrity(self):
        info,hours=parse_native_archive(self.good,self.digest)
        self.assertEqual(info['minutes'],43200)
        self.assertEqual(info['hours'],720)
        self.assertEqual(info['timestamps_unit'],'us')
        self.assertAlmostEqual(hours[0]['taker_buy_share'],0.6)
        self.assertAlmostEqual(hours[0]['quote_volume'],5002*60)
        self.assertEqual(hours[0]['trades'],600)
    def test_wrong_sha_blocks(self):
        with self.assertRaisesRegex(InvalidArchive,'SHA-256'):
            parse_native_archive(self.good,'0'*64)
    def test_taker_volume_exceeds_total_blocks(self):
        with self.assertRaisesRegex(InvalidArchive,'taker-buy'):
            parse_native_archive(self.overflow,self.bad_digest)
    def test_minute_gap_blocks(self):
        with self.assertRaisesRegex(InvalidArchive,'minute manquante'):
            parse_native_archive(self.gap,self.gap_digest)
    def test_no_trades_if_volume_does_not_exceed_history(self):
        _,h=parse_native_archive(self.good,self.digest)
        v=run_paper(h,threshold=.55,hold_hours=12,start_hour=0,end_hour=720)
        self.assertEqual(v['trades'],0)  # constant hourly volumes = never above rolling median
    def test_no_fake_market_results_if_no_archive(self):
        with self.assertRaisesRegex(InvalidArchive,'Archive absente'):
            parse_native_archive(self.root/'missing.zip')
    def test_fees_and_entry_only_after_completed_signal(self):
        fake=[]
        for h in range(120):
            fake.append(dict(timestamp_ms=MONTH_START_MS+h*3600000,
                open=(100.5 if h==38 else 100.0),quote_volume=200 if h==25 else 100,
                taker_buy_share=0.65 if h==25 else .45))
        result=run_paper(fake,threshold=.60,hold_hours=12,start_hour=0,end_hour=120)
        self.assertEqual(result['trades'],1)
        d=result['deals'][0]
        self.assertEqual(d['entry_at_utc'], dt.datetime.fromtimestamp((MONTH_START_MS+26*3600000)/1000,dt.timezone.utc).isoformat())
        self.assertEqual(d['exit_at_utc'], dt.datetime.fromtimestamp((MONTH_START_MS+38*3600000)/1000,dt.timezone.utc).isoformat())
        self.assertAlmostEqual(d['gross_pct'],0.5)
        self.assertAlmostEqual(d['net_pct'],(1.005*.992-1)*100)
        self.assertLess(d['profit_usdt'],0)
    def test_report_schema_and_no_real_orders(self):
        info,h=parse_native_archive(self.good,self.digest)
        obj=report(info,h)
        self.assertEqual(len(obj['trials']),24)
        self.assertTrue(obj['methods']['no_live_orders'])
        self.assertAlmostEqual(obj['observed']['weighted_taker_buy_share_pct'],60)

if __name__=='__main__': unittest.main()
