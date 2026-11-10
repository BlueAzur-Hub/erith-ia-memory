import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

HERE=Path(__file__).parent
spec=importlib.util.spec_from_file_location('merge_witness',HERE/'merge_public_liquidation_archive.py')
mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)

def event(key,ts=1):
    return {'event_key':key,'event_ts_ms':ts,'provider':'bybit','venue_market':'DERIVATIVES',
            'causal_claim':False,'orders_enabled':False}

def run(key):
    return {'run_key':key,'health':[{'provider':'bybit'}],
            'started_at_utc':'2026-11-10T15:00:00Z','orders_enabled':False}

def write(path,records):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(''.join(json.dumps(x)+'\n' for x in records),encoding='utf-8')

class MergeTests(unittest.TestCase):
    def test_concurrent_runs_union_events(self):
        with tempfile.TemporaryDirectory() as t:
            p=Path(t);src=p/'incoming';dst=p/'dest';name='2026-11-10.jsonl'
            write(src/name,[event('b',2),event('c',3)])
            write(dst/name,[event('a',1),event('b',2)])
            mod.merge(src,dst)
            self.assertEqual([json.loads(x)['event_key'] for x in (dst/name).read_text().splitlines()],['a','b','c'])
    def test_ledger_union_including_zero_events(self):
        with tempfile.TemporaryDirectory() as t:
            p=Path(t);s=p/'incoming';d=p/'dest';name=Path('run-ledger/2026-11-10.jsonl')
            write(s/name,[run('run2')]);write(d/name,[run('run1')]);mod.merge(s,d)
            self.assertEqual(len((d/name).read_text().splitlines()),2)
    def test_latest_status_preserves_newer(self):
        with tempfile.TemporaryDirectory() as t:
            p=Path(t);s=p/'incoming';d=p/'dest';s.mkdir();d.mkdir()
            obj=lambda date:{'schema':'seven.crypto.public-liquidation-witness.v1','orders_enabled':False,'updated_at_utc':date}
            (s/'status.json').write_text(json.dumps(obj('2026-11-10T15:00:00Z')))
            (d/'status.json').write_text(json.dumps(obj('2026-11-10T16:00:00Z')))
            mod.merge(s,d)
            self.assertEqual(json.loads((d/'status.json').read_text())['updated_at_utc'],'2026-11-10T16:00:00Z')
    def test_event_key_conflict_rejected(self):
        with tempfile.TemporaryDirectory() as t:
            p=Path(t);s=p/'incoming';d=p/'dest';name='2026-11-10.jsonl'
            write(s/name,[event('a',2)]);write(d/name,[event('a',1)])
            with self.assertRaises(mod.ArchiveError):mod.merge(s,d)
    def test_no_mutation_if_a_file_is_invalid(self):
        with tempfile.TemporaryDirectory() as t:
            p=Path(t);s=p/'incoming';d=p/'dest';name='2026-11-10.jsonl'
            write(s/name,[event('new',3)])
            write(s/'run-ledger/2026-11-10.jsonl',[{'run_key':'bad','health':[],'orders_enabled':True}])
            write(d/name,[event('original',1)])
            before=(d/name).read_text()
            with self.assertRaises(mod.ArchiveError):mod.merge(s,d)
            self.assertEqual((d/name).read_text(),before)
    def test_unexpected_path_rejected(self):
        with tempfile.TemporaryDirectory() as t:
            p=Path(t);s=p/'incoming';s.mkdir();(s/'PRIVATE_KEYS').write_text('bad')
            with self.assertRaises(mod.ArchiveError):mod.merge(s,p/'dest')
    def test_no_trade_or_private_event(self):
        with tempfile.TemporaryDirectory() as t:
            p=Path(t);s=p/'incoming';write(s/'2026-11-10.jsonl',[dict(event('bad'),orders_enabled=True)])
            with self.assertRaises(mod.ArchiveError):mod.merge(s,p/'dest')

if __name__=='__main__':unittest.main(verbosity=2)
