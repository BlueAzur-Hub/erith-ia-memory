from __future__ import annotations
import csv, hashlib, json, tempfile, unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch
from src import server
from src.catalog_source_v48 import SCHEMA, list_sources, read_source

class GenericCatalogSourceTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(); self.workspace=Path(self.temp.name)
        source_id='CAT_SOLUSDT_2024_1H_CERTIFIED'; folder=self.workspace/'catalog_sources'/source_id; folder.mkdir(parents=True)
        rows=[]
        for i in range(120):
            t=1704067200+i*3600; p=100+i*.1; rows.append((t,p,p+.5,p-.5,p+.1,1000+i))
        csvf=folder/'bars.csv'
        with csvf.open('w',encoding='utf-8',newline='') as f:
            w=csv.writer(f,lineterminator='\n'); w.writerow(('timestamp','open','high','low','close','volume')); w.writerows(rows)
        sha=hashlib.sha256(csvf.read_bytes()).hexdigest()
        manifest={'schema':SCHEMA,'id':source_id,'exchange':'Certified Research Corpus','pair':'SOL/USDT','base':'SOL','quote':'USDT',
                  'source_timeframe':'1h','available_timeframes':['1h','4h'],'rows':len(rows),'stored_csv_sha256':sha,
                  'first_utc':datetime.fromtimestamp(rows[0][0],timezone.utc).isoformat(),'last_utc':datetime.fromtimestamp(rows[-1][0],timezone.utc).isoformat(),
                  'close_boundary_utc':datetime.fromtimestamp(rows[-1][0]+3600,timezone.utc).isoformat(),'certification':'LOCAL_SHA256_CONTIGUOUS_TEST'}
        (folder/'manifest.json').write_text(json.dumps(manifest),encoding='utf-8'); self.source_id=source_id
    def tearDown(self): self.temp.cleanup()
    def test_generic_sol_source_loads_without_pair_allowlist_change(self):
        listed=list_sources(self.workspace); self.assertEqual([x['pair'] for x in listed],['SOL/USDT'])
        manifest,bars=read_source(self.workspace,self.source_id); self.assertEqual(len(bars),120); self.assertEqual(manifest['source_kind'],'CATALOG_REGISTERED_V1')
        with patch.object(server,'WORKSPACE',self.workspace):
            source,bars2=server._resolve_source(self.source_id); catalog=server._sources_catalog()
        self.assertEqual(source['base'],'SOL'); self.assertEqual(len(bars2),120)
        self.assertIn('SOL',catalog['facets']['assets']); self.assertTrue(any(x['source_id']==self.source_id for x in catalog['sources']))
if __name__=='__main__': unittest.main()
