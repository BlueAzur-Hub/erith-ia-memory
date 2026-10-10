import hashlib
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

from verify_kraken_ohlcvt import stage

START=1751328000 # 2025-07-01 00:00:00 UTC

class KrakenStageTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root=Path(self.tmp.name)
        self.archive=self.root/'Kraken_OHLCVT_sample.zip'
        with zipfile.ZipFile(self.archive,'w',compression=zipfile.ZIP_DEFLATED) as z:
            z.writestr('XMRUSD_1.csv',
                '\n'.join([f'{START},100,102,99,101,3,4',
                           f'{START+120},101,105,100,103,2,1'])+'\n')
        self.sha=hashlib.sha256(self.archive.read_bytes()).hexdigest()
        assets=[{'id':f'id-{i}','symbol':f'K{i}','rank':i,'months':0,'name':f'Asset {i}'}
                for i in range(1,251)]
        assets[13]={'id':'monero','symbol':'XMR','rank':14,'months':0,'name':'Monero'}
        self.catalog=self.root/'index.json'
        self.catalog.write_text(json.dumps({
            'schema':'aerith.public.ohlcv.top250.federated-native-archives.v1',
            'ranked':250,'assets':assets}))
        self.out=self.root/'out'

    def call(self,**kw):
        a=dict(archive=self.archive,trusted_sha=self.sha,catalog_path=self.catalog,
               coin_id='monero',pair='XMRUSD',quote='USD',month='2025-07',
               member='XMRUSD_1.csv',output=self.out)
        a.update(kw)
        return stage(**a)

    def test_preserves_real_sparse_intervals_and_quote(self):
        m=self.call()
        self.assertEqual(m['source_1m_rows'],2)
        self.assertEqual(m['possible_minutes'],44640)
        self.assertEqual(m['minutes_without_trades'],44638)
        self.assertEqual(m['quote'],'USD')
        self.assertFalse(m['counted_in_coffre'])
        self.assertFalse(m['empty_minutes_interpolated'])
        self.assertEqual(len(list(self.out.glob('*.gz'))),1)

    def test_rejects_wrong_sha(self):
        with self.assertRaisesRegex(ValueError,'SHA-256 mismatch'):
            self.call(trusted_sha='0'*64)

    def test_rejects_cross_asset_symbol(self):
        with self.assertRaisesRegex(ValueError,'exact-ID'):
            self.call(coin_id='id-20')

    def test_rejects_repeat_publication(self):
        self.call()
        with self.assertRaisesRegex(ValueError,'already exists'):
            self.call()

    def test_rejects_fake_minute(self):
        with zipfile.ZipFile(self.archive,'w') as z:
            z.writestr('XMRUSD_1.csv',f'{START+1},100,102,99,101,3,4\n')
        with self.assertRaisesRegex(ValueError,'timestamp'):
            self.call(trusted_sha=hashlib.sha256(self.archive.read_bytes()).hexdigest())

    def test_rejects_zero_trades(self):
        with zipfile.ZipFile(self.archive,'w') as z:
            z.writestr('XMRUSD_1.csv',f'{START},100,102,99,101,3,0\n')
        with self.assertRaisesRegex(ValueError,'positive trade count'):
            self.call(trusted_sha=hashlib.sha256(self.archive.read_bytes()).hexdigest())

if __name__ == '__main__':
    unittest.main()
