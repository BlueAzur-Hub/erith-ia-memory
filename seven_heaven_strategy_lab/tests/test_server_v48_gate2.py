from __future__ import annotations
import http.client, json, tempfile, threading, unittest
from pathlib import Path
from unittest.mock import patch
from src import server
from src.binance_monthly_source_v46 import install, SOURCE_ID
from tests.test_binance_monthly_v46 import fixture

class ServerV48Gate2(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(); self.workspace=Path(self.temp.name)
        self.wp=patch.object(server,'WORKSPACE',self.workspace); self.wp.start()
        archive,checksum=fixture(2020,1)
        with patch('src.binance_monthly_source_v46._download',side_effect=[checksum.encode('ascii'),archive]): install(self.workspace)
    def tearDown(self): self.wp.stop(); self.temp.cleanup()
    def request(self,method,path,body=None):
        httpd=server.ThreadingHTTPServer(('127.0.0.1',0),server.Handler); th=threading.Thread(target=httpd.serve_forever,daemon=True); th.start()
        try:
            conn=http.client.HTTPConnection('127.0.0.1',httpd.server_port,timeout=8); payload=None if body is None else json.dumps(body)
            headers={'Host':f'127.0.0.1:{httpd.server_port}'}
            if payload is not None: headers['Content-Type']='application/json'
            conn.request(method,path,body=payload,headers=headers); resp=conn.getresponse(); data=json.loads(resp.read().decode()); conn.close(); return resp.status,data
        finally: httpd.shutdown(); httpd.server_close(); th.join(timeout=5)
    def params(self):
        return {'kind':'DONCHIAN','timeframe':'1h','source_id':SOURCE_ID,'capital':1000,'fee':.001,'slippage':.0005,'donchian_entry':55,'donchian_exit':20}
    def test_catalog_atlas_and_strategyspec_end_to_end(self):
        status,health=self.request('GET','/api/health'); self.assertEqual(status,200); self.assertTrue(health['source_catalog_v1_enabled']); self.assertTrue(health['strategy_atlas_v1_enabled']); self.assertTrue(health['strategy_spec_v1_enabled']); self.assertFalse(health['live_trading'])
        status,cat=self.request('GET','/api/sources'); self.assertEqual(status,200); self.assertEqual(cat['schema'],'seven.source_catalog.v1'); self.assertEqual(cat['count'],1); self.assertEqual(cat['sources'][0]['source_id'],SOURCE_ID); self.assertEqual(cat['sources'][0]['integrity']['status'],'OFFICIAL_CHECKSUM_MATCHED_COMPLETE_MONTH')
        status,atlas=self.request('GET','/api/strategy-atlas'); self.assertEqual(status,200); self.assertEqual(atlas['schema'],'seven.strategy_atlas.v1'); self.assertTrue(any(x['atlas_id']=='trend.donchian' for x in atlas['entries']))
        status,created=self.request('POST','/api/strategy-specs',{'name':'Gate 2 Donchian','params':self.params()}); self.assertEqual(status,201); spec=created['strategy_spec']; self.assertEqual(spec['market']['source_id'],SOURCE_ID)
        status,replay=self.request('POST','/api/strategy-spec-run',{'strategy_spec_id':spec['id']}); self.assertEqual(status,201); self.assertEqual(replay['report']['safety']['orders_real'],0); self.assertEqual(replay['report']['strategy_spec_fingerprint_sha256'],spec['fingerprint_sha256'])
if __name__=='__main__': unittest.main()
