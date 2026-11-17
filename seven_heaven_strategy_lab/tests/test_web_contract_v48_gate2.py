from pathlib import Path
import unittest
ROOT=Path(__file__).resolve().parents[1]
class WebContractV48Gate2(unittest.TestCase):
    def test_guided_catalog_atlas_and_spec_controls_exist(self):
        html=(ROOT/'web/index.html').read_text(encoding='utf-8')
        for dom_id in ('guided-mode','guided-asset','guided-exchange','guided-timeframe','guided-source','guided-atlas-template','guided-atlas-apply','strategy-spec-name','save-strategy-spec','saved-strategy-specs','replay-strategy-spec'):
            self.assertIn(f'id="{dom_id}"',html)
    def test_browser_uses_seven_local_contracts_not_external_runtimes(self):
        app=(ROOT/'web/app.js').read_text(encoding='utf-8')
        for path in ('/api/sources','/api/strategy-atlas','/api/strategy-specs','/api/strategy-spec-run'):
            self.assertIn(path,app)
        self.assertNotIn('freqtrade trade',app.lower()); self.assertNotIn('hummingbot',app.lower())
        self.assertIn('source_catalog_v1_enabled',app); self.assertIn('strategy_atlas_v1_enabled',app)
if __name__=='__main__': unittest.main()
