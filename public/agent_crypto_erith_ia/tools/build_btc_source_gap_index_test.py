#!/usr/bin/env python3
"""No-network SHA-256 and data-truth tests for partial BTC Release indexing."""
import copy
import hashlib
import json
import unittest
from datetime import datetime,timezone

import build_btc_source_gap_index as m


def source(month='2020-12',anomaly=False):
    first=int(datetime(2020,12,1,tzinfo=timezone.utc).timestamp()*1000)
    gap={'start_ms':first+60000,'end_ms_exclusive':first+3*60000,'minutes':2}
    record={'schema':'seven.btc.native.source-quality.v1',
            'month':month,'pair':'BTCUSDT','quote':'USDT','interval':'1m',
            'canonical_import':False,'synthetic_rows':0,
            'source_zip_sha256':'a'*64,'sqlite_sha256':'b'*64,
            'native_rows':44638,'missing_minutes':2,'expected_minutes':44640,
            'gaps':[gap],'first_open_ms':first,'last_open_ms':first+44639*60000,
            'status':'source_with_gaps_and_close_time_anomaly' if anomaly else 'source_verified_gaps',
            'close_time_anomalies':[{'open_time_ms':first+3*60000,
              'source_close_time_ms':first+2*60000,
              'offset_from_open_ms':-60000}] if anomaly else [],
            'close_time_anomaly_count':int(anomaly)}
    raw=(json.dumps(record,sort_keys=True)+'\n').encode()
    names={kind:f'BTCUSDT-1m-{month}'+suffix for kind,suffix in
           [('archive','.zip'),('checksum','.zip.CHECKSUM'),
            ('sqlite','.sqlite'),('manifest','.json')]}
    hashes={'archive':record['source_zip_sha256'],
            'sqlite':record['sqlite_sha256'],
            'checksum':'c'*64,'manifest':hashlib.sha256(raw).hexdigest()}
    assets=[{'name':v,'digest':'sha256:'+hashes[k],
             'size':len(raw) if k=='manifest' else 999}
            for k,v in names.items()]
    release={'tag_name':f'btc-spot-native-gap-{month}',
             'draft':False,'assets':assets}
    return release,raw


class SourceIndexTests(unittest.TestCase):
    def test_immutable_manifest_and_original_binaries_are_indexed(self):
        release,raw=source(anomaly=True)
        obj=m.build([release],lambda tag,name:raw)
        self.assertEqual(obj['source_release_count'],1)
        self.assertEqual(obj['verified_native_rows'],44638)
        row=obj['months'][0]
        self.assertEqual(row['close_time_anomaly_count'],1)
        self.assertEqual(row['gaps'][0]['missing_minutes'],2)
        self.assertEqual(row['files']['archive']['sha256'],'a'*64)
        self.assertFalse(row['can_extend_strict_contiguous_year_views'])
    def test_reject_modified_manifest(self):
        release,raw=source()
        with self.assertRaisesRegex(ValueError,'digest mismatch'):
            m.build([release],lambda tag,name:raw+b'tampered')
    def test_reject_source_zip_digest_mismatch(self):
        release,raw=source()
        release['assets'][0]['digest']='sha256:'+'0'*64
        with self.assertRaisesRegex(ValueError,'ZIP or SQLite'):
            m.build([release],lambda tag,name:raw)
    def test_reject_bad_calendar_total(self):
        release,raw=source()
        obj=json.loads(raw);obj['native_rows']+=1
        raw=(json.dumps(obj,sort_keys=True)+'\n').encode()
        release['assets'][-1]['digest']='sha256:'+hashlib.sha256(raw).hexdigest()
        release['assets'][-1]['size']=len(raw)
        with self.assertRaisesRegex(ValueError,'qualified partial'):
            m.build([release],lambda tag,name:raw)
    def test_dedupe_requires_unique_release_month(self):
        release,raw=source()
        with self.assertRaisesRegex(ValueError,'Duplicate'):
            m.build([release,release],lambda tag,name:raw)
    def test_bad_or_draft_release_is_not_trusted(self):
        release,raw=source()
        release['draft']=True
        with self.assertRaisesRegex(ValueError,'No source gaps'):
            m.build([release],lambda tag,name:raw)


if __name__=='__main__':
    unittest.main(verbosity=2)
