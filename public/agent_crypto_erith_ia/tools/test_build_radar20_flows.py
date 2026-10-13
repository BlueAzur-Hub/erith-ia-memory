import calendar
import csv
import hashlib
import io
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

import build_radar20_flows as mod


class Radar20SourceTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name)
    def tearDown(self): self.tmp.cleanup()
    def fake_catalog(self):
        assets=[{'id':'dummy-'+str(i),'symbol':'D'+str(i),'months':[]} for i in range(230)]
        for symbol in mod.SYMBOLS:
            assets.append({'id':symbol.lower(),'symbol':symbol,'months':[
                {'month':month,'pair':symbol+'USDT','file':symbol+'USDT-1m-'+month+'.zip',
                 'sha256':'a'*64,'release':'crypto-spot-bulk-'+month+'-1m',
                 'candles':calendar.monthrange(*map(int,month.split('-')))[1]*1440}
                for month in mod.MONTHS]})
        return {'schema':'aerith.public.ohlcv.top250.monthly-coverage-catalog.v1',
                'ranked':250,'quote':'USDT','assets':assets}
    def test_inventory_20x3(self):
        rows=mod.source_inventory(self.fake_catalog())
        self.assertEqual(len(rows),60)
        self.assertEqual(len({(x['pair'],x['month']) for x in rows}),60)
    def test_missing_source_blocks_all(self):
        cat=self.fake_catalog();cat['assets'][-1]['months'].pop()
        with self.assertRaisesRegex(ValueError,'Missing/duplicate'):
            mod.source_inventory(cat)
    def test_identity_pair_mismatch_blocks_all(self):
        cat=self.fake_catalog();cat['assets'][-1]['months'][0]['pair']='BTCUSDT'
        with self.assertRaisesRegex(ValueError,'Pair mismatch'):
            mod.source_inventory(cat)
    def make_archive(self, month='2026-09'):
        pair='ETHUSDT';filename=pair+'-1m-'+month+'.zip'
        path=self.root/filename
        from datetime import datetime, timezone
        year,mo=map(int,month.split('-'))
        start=int(datetime(year,mo,1,tzinfo=timezone.utc).timestamp()*1000)
        count=calendar.monthrange(*map(int,month.split('-')))[1]*1440
        b=io.StringIO();writer=csv.writer(b)
        for i in range(count):
            t=(start+i*60000)*1000
            writer.writerow([t,100,110,90,102,1,t+59_999_000,100,7,.6,60,0])
        with zipfile.ZipFile(path,'w',compression=zipfile.ZIP_DEFLATED) as z:
            z.writestr(filename[:-4]+'.csv',b.getvalue())
        return path,dict(file=filename,pair=pair,asset_id='ethereum',month=month,
                        sha256=hashlib.sha256(path.read_bytes()).hexdigest(),candles=count,
                        release='crypto-spot-bulk-'+month+'-1m')
    def test_native_12_columns_aggregated_hourly(self):
        path,meta=self.make_archive()
        rows=mod.parse_verified_zip(path,meta)
        self.assertEqual(len(rows),720)
        self.assertEqual(rows[0]['quote_volume'],6000)
        self.assertAlmostEqual(rows[0]['taker_buy_share'],.6)
        self.assertEqual(rows[0]['trades'],420)
        report=mod.summarize(meta,rows)
        self.assertEqual(report['row_count'],720)
        self.assertEqual(len(report['experiments']),24)
        self.assertFalse(report['strategy_certified'])
        self.assertEqual(report['quote'],'USDT')
        self.assertEqual(report['method']['test_last_days'],10)
    def test_wrong_sha_rejected(self):
        path,meta=self.make_archive();meta['sha256']='0'*64
        with self.assertRaisesRegex(ValueError,'checksum mismatch'):
            mod.parse_verified_zip(path,meta)
    def test_corrupted_minutes_rejected(self):
        path,meta=self.make_archive();meta['candles']+=1
        # row count expected from calendar, source claims must be checked in inventory
        cat=self.fake_catalog();cat['assets'][-1]['months'][0]['candles']+=1
        with self.assertRaisesRegex(ValueError,'Catalog source incomplete'):
            mod.source_inventory(cat)

if __name__=='__main__': unittest.main()