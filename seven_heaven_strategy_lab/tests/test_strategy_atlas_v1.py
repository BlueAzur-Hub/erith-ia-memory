from __future__ import annotations
import unittest
from src.engine import KINDS, options
from src.strategy_atlas import SCHEMA, catalog, template

class StrategyAtlasV1Tests(unittest.TestCase):
    def test_atlas_exposes_only_native_executable_families(self):
        atlas=catalog(); self.assertEqual(atlas['schema'],SCHEMA); self.assertEqual(atlas['count'],8)
        for item in atlas['entries']:
            self.assertIn(item['kind'],KINDS)
            self.assertTrue(item['paper_only'])
            options({'kind':item['kind'],'capital':1000,'fee':.001,'slippage':.0005,**item['defaults']})
    def test_donchian_template_is_55_20_and_external_engines_optional(self):
        item=template('trend.donchian')
        self.assertEqual(item['defaults'],{'donchian_entry':55,'donchian_exit':20})
        self.assertTrue(all('OPTIONAL' in v for v in item['external_validators'].values()))
if __name__=='__main__': unittest.main()
