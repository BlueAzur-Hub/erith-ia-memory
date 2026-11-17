from __future__ import annotations
import unittest
from src.engine import LabError
from src.source_catalog import SCHEMA, ENTRY_SCHEMA, build_catalog, normalize_source

SHA='a'*64
class SourceCatalogV1Tests(unittest.TestCase):
    def sample(self):
        return {"id":"TEST_SOLUSDT_1H","source_kind":"TEST_CERTIFIED","exchange":"Test Spot",
                "pair":"SOL/USDT","base":"SOL","quote":"USDT","source_timeframe":"1h",
                "available_timeframes":["1h","4h"],"rows":744,"sha256":SHA,
                "first_utc":"2024-01-01T00:00:00+00:00","last_utc":"2024-01-31T23:00:00+00:00",
                "close_boundary_utc":"2024-02-01T00:00:00+00:00","certification":"TEST_CHECKSUM_OK"}
    def test_normalized_contract_is_explicit_and_private_path_free(self):
        item=normalize_source(self.sample())
        self.assertEqual(item['schema'],ENTRY_SCHEMA)
        self.assertEqual(item['source_id'],'TEST_SOLUSDT_1H')
        self.assertEqual(item['pair'],'SOL/USDT')
        self.assertEqual(item['coverage']['rows'],744)
        self.assertEqual(item['integrity']['sha256'],SHA)
        self.assertFalse(item['storage']['private_absolute_path_exposed'])
        self.assertEqual(item['safety']['orders_real'],0)
    def test_catalog_facets_are_data_driven(self):
        catalog=build_catalog([self.sample()],free_bytes=10_000,reserve_bytes=5_000)
        self.assertEqual(catalog['schema'],SCHEMA)
        self.assertEqual(catalog['facets']['assets'],['SOL'])
        self.assertEqual(catalog['facets']['timeframes'],['1h','4h'])
        self.assertEqual(catalog['count'],1)
    def test_bad_sha_is_rejected(self):
        raw=self.sample(); raw['sha256']='not-a-sha'
        with self.assertRaises(LabError): normalize_source(raw)
if __name__=='__main__': unittest.main()
