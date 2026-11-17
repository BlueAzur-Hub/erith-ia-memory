from pathlib import Path
import hashlib
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]


class UnifiedHelpLayerV48(unittest.TestCase):
    def test_one_global_help_trigger_and_layer_contract(self):
        html = (ROOT / "web" / "index.html").read_text(encoding="utf-8")
        self.assertEqual(html.count('id="labHelpToggle"'), 1)
        masthead = html.split('<header class="masthead">', 1)[1].split('</header>', 1)[0]
        guided = html.split('<section id="guided-mode"', 1)[1].split('</section>', 1)[0]
        self.assertIn('id="labHelpToggle"', masthead)
        self.assertNotIn('id="labHelpToggle"', guided)
        self.assertIn('>?</button>', masthead)
        self.assertIn('id="labHelpLayer"', html)
        self.assertIn('id="labHelpLive"', html)
        self.assertIn('id="open-glossary"', html)
        self.assertIn('hidden tabindex="-1"', html)
        self.assertRegex(html, r'/lab-help-layer\.js\?v=v48-(?:help-v1-global|step5-passive|historical-vault-v1)-20261116|/lab-help-layer\.js\?v=v48-(?:workspace-steward-v2|historical-v2-steward-v3)-20261117')
        self.assertRegex(html, r'/styles\.css\?v=v48-(?:help-v1-global|step5-passive|historical-vault-v1)-20261116|/styles\.css\?v=v48-(?:workspace-steward-v2|historical-v2-steward-v3)-20261117')

    def test_help_layer_is_global_presentation_only_and_immediate_on_click(self):
        js = (ROOT / "web" / "lab-help-layer.js").read_text(encoding="utf-8")
        self.assertRegex(js, r'V4\.(?:8-(?:HELP-LAYER-V1-GLOBAL|KNOWLEDGE-STEP5-PASSIVE|HISTORICAL-V2-STEWARD-V3)|9-HISTORICAL-V3-MULTI-ASSET-CORPUS-V1)')
        self.assertIn('button.addEventListener("click", () => setActive(!active))', js)
        self.assertIn('if (active) overview(); else hide();', js)
        self.assertIn('late_mount_safe:true', js)
        for selector in ('#observatory', '#guided-mode', '.source-panel', '#laboratory', '#results', '#market-microscope', '#quant-desk', '#forensic-desk', '#comparison', '#robustness', '#strategy-research', '#vault'):
            self.assertIn('selector:"' + selector + '"', js)
        for forbidden in ('fetch(', 'localStorage', 'sessionStorage', '/api/', 'WebSocket', 'XMLHttpRequest'):
            self.assertNotIn(forbidden, js)
        self.assertIn('Examiner effectue réellement un nouveau calcul PAPER', js)

    def test_dynamic_and_saved_result_actions_are_covered(self):
        js = (ROOT / "web" / "lab-help-layer.js").read_text(encoding="utf-8")
        for selector in ('.study-button', '#history .history-item', '#comparison-history .history-item'):
            self.assertIn(selector, js)
        self.assertIn('querySelectorAll(item.selector)', js)
        self.assertIn('element.matches(topic.selector)', js)

    def test_server_serves_help_asset_and_engine_contract_is_untouched(self):
        server = (ROOT / "src" / "server.py").read_text(encoding="utf-8")
        self.assertIn('"/lab-help-layer.js": ("lab-help-layer.js", "text/javascript; charset=utf-8")', server)
        self.assertIn('path = urlsplit(self.path).path', server)
        engine = ROOT / "src" / "engine.py"
        self.assertEqual(
            hashlib.sha256(engine.read_bytes()).hexdigest(),
            "f4de4a9cb8dbfd17a665785b6b06cfff3473039624457e721d3f3fd9e2aeb7c2",
        )


if __name__ == '__main__':
    unittest.main()
