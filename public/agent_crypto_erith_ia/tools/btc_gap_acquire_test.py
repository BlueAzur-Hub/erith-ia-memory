"""Offline tests of native BTC ZIP, official checksums and SQLite preservation."""
import hashlib
import io
import sqlite3
import tempfile
import unittest
import zipfile
from datetime import datetime,timezone
from pathlib import Path

from btc_gap_archive import verify, AdmissionError
from btc_gap_acquire import acquire


def sample(minutes=(0,1,4,5),invalid=False,close_anomalies=()):
    start=int(datetime(2023,3,1,tzinfo=timezone.utc).timestamp()*1000)
    records=[]
    for i,minute in enumerate(minutes):
        t=start+minute*60000
        op='25000' if invalid and i==2 else '22000'
        close_stamp=t-1299479 if i in close_anomalies else t+59999
        records.append(','.join(str(x) for x in (
            t,op,23000,21000,22500,'0.31',close_stamp,'6975',5,'0.10','2250','0')))
    buffer=io.BytesIO()
    with zipfile.ZipFile(buffer,'w',zipfile.ZIP_DEFLATED) as z:
        z.writestr('BTCUSDT-1m-2023-03.csv','\n'.join(records)+'\n')
    return buffer.getvalue()


class BTCNativeGapTests(unittest.TestCase):
    def test_gap_is_preserved_without_fabrication(self):
        raw=sample()
        proof,rows=verify(raw,hashlib.sha256(raw).hexdigest(),'2023-03')
        self.assertEqual(len(rows),4)
        self.assertEqual(proof['gaps'][0]['minutes'],2)
        self.assertEqual(proof['native_rows']+proof['missing_minutes'],44640)
        self.assertEqual(proof['synthetic_rows'],0)
    def test_one_original_bad_close_time_remains_unchanged_and_flagged(self):
        raw=sample(close_anomalies=(2,))
        proof,rows=verify(raw,hashlib.sha256(raw).hexdigest(),'2023-03')
        self.assertEqual(proof['close_time_anomaly_count'],1)
        self.assertTrue(proof['close_time_anomalies_kept_original'])
        self.assertEqual(proof['status'],'source_with_gaps_and_close_time_anomaly')
        self.assertEqual(rows[2][6],rows[2][0]-1299479)
        self.assertEqual(proof['synthetic_rows'],0)

    def test_multiple_source_timestamp_errors_fail_quarantine_threshold(self):
        raw=sample(close_anomalies=(0,1,2))
        with self.assertRaisesRegex(AdmissionError,'Too many source close-time'):
            verify(raw,hashlib.sha256(raw).hexdigest(),'2023-03')

    def test_bad_checksum(self):
        with self.assertRaisesRegex(AdmissionError,'checksum'):
            verify(sample(),'0'*64,'2023-03')
    def test_invalid_ohlc(self):
        raw=sample(invalid=True)
        with self.assertRaisesRegex(AdmissionError,'OHLCV'):
            verify(raw,hashlib.sha256(raw).hexdigest(),'2023-03')
    def test_duplicate_rejected(self):
        raw=sample((0,1,1,2))
        with self.assertRaisesRegex(AdmissionError,'Duplicate'):
            verify(raw,hashlib.sha256(raw).hexdigest(),'2023-03')
    def test_real_sqlite_structure_and_original_preserved(self):
        raw=sample()
        def fake(url,cap):
            return (hashlib.sha256(raw).hexdigest()+' archive.zip\n').encode() if url.endswith('.CHECKSUM') else raw
        with tempfile.TemporaryDirectory() as tmp:
            result=acquire('2023-03',tmp,fake)
            self.assertEqual(result['native_rows'],4)
            root=Path(tmp)
            self.assertEqual((root/'BTCUSDT-1m-2023-03.zip').read_bytes(),raw)
            with sqlite3.connect(root/result['sqlite_file']) as db:
                self.assertEqual(db.execute('SELECT COUNT(*) FROM btc_1m').fetchone()[0],4)
                self.assertEqual(db.execute('PRAGMA quick_check').fetchone()[0],'ok')
    def test_bad_checksum_creates_no_archives(self):
        raw=sample()
        def fake(url,cap):return b'0'*64 if url.endswith('.CHECKSUM') else raw
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(AdmissionError):acquire('2023-03',tmp,fake)
            self.assertEqual(list(Path(tmp).iterdir()),[])


if __name__=='__main__':
    unittest.main(verbosity=2)
