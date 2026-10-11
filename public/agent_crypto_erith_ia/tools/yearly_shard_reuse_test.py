"""Offline verification: unchanged year reuse and invalidation of stale archives."""
import hashlib
import tempfile
import unittest
from pathlib import Path
from yearly_shard_reuse import reuse


def digest(x):
    return hashlib.sha256(x).hexdigest()


class YearlyShardReuseTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.folder = Path(self.temp.name)
        self.data = b'previous verified 1m-derived 1h shard'
        self.sha = digest(self.data)
        self.name = f'bitcoin-2023-span1-{self.sha}.json.gz'
        (self.folder / self.name).write_bytes(self.data)
        self.group = {'year': 2023, 'span': 1, 'source_months': [
            {'month':'2023-04','release':'rel-2023-04','sha256':'a'*64,'candles':43200}]}
        self.previous = {'source_signature':'old-due-to-updated-2022','shards': [
            {'file':self.name,'year':2023,'span':1,'sha256':self.sha,
             'bytes':len(self.data),'source_months':[{
                 'month':'2023-04','release':'rel-2023-04',
                 'source_zip_sha256':'a'*64,'native_1m_count':43200}]}]}

    def test_reuse_unchanged_year_despite_changed_asset_signature(self):
        result = reuse(self.group,self.previous,self.folder,digest)
        self.assertEqual(result[1],self.data)
        self.assertEqual(result[2]['sha256'],self.sha)

    def test_reject_changed_source_sha(self):
        self.group['source_months'][0]['sha256']='b'*64
        self.assertIsNone(reuse(self.group,self.previous,self.folder,digest))

    def test_reject_new_source_month(self):
        self.group['source_months'].append({
            'month':'2023-05','release':'other','sha256':'c'*64,'candles':44640})
        self.assertIsNone(reuse(self.group,self.previous,self.folder,digest))

    def test_reject_tampered_archive(self):
        (self.folder / self.name).write_bytes(b'altered')
        self.assertIsNone(reuse(self.group,self.previous,self.folder,digest))

    def test_reject_wrong_size(self):
        self.previous['shards'][0]['bytes'] += 1
        self.assertIsNone(reuse(self.group,self.previous,self.folder,digest))

    def test_reject_missing_file(self):
        (self.folder / self.name).unlink()
        self.assertIsNone(reuse(self.group,self.previous,self.folder,digest))

    def test_reject_different_year_or_span(self):
        self.group['year']=2024
        self.assertIsNone(reuse(self.group,self.previous,self.folder,digest))
        self.group['year']=2023;self.group['span']=0
        self.assertIsNone(reuse(self.group,self.previous,self.folder,digest))

    def test_reject_unsafe_archive_name(self):
        self.previous['shards'][0]['file']='../../spoofed.json.gz'
        self.assertIsNone(reuse(self.group,self.previous,self.folder,digest))


if __name__ == '__main__':
    unittest.main(verbosity=2)
