from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class GuidedWorkflowV48(unittest.TestCase):
    def test_guided_panel_uses_full_product_width(self):
        css = (ROOT / 'web/styles.css').read_text(encoding='utf-8')
        self.assertIn('.guided-panel{margin:0 0 20px;width:100%;max-width:none;', css)

    def test_guided_progress_and_actions_exist(self):
        html = (ROOT / 'web/index.html').read_text(encoding='utf-8')
        for dom_id in (
            'guided-step-source', 'guided-step-atlas', 'guided-step-composer',
            'guided-step-spec', 'guide-learn', 'guide-create', 'guide-compare',
            'guide-paper', 'guide-expert'
        ):
            self.assertIn(f'id="{dom_id}"', html)

        app = (ROOT / 'web/app.js').read_text(encoding='utf-8')
        self.assertIn('syncGuidedProgress()', app)
        self.assertIn('guidedAtlasApplied=true', app)
        self.assertIn('guided_workflow_v1_enabled', app)

    def test_server_declares_guided_workflow_without_touching_live_trading(self):
        server = (ROOT / 'src/server.py').read_text(encoding='utf-8')
        self.assertIn('"guided_workflow_v1_enabled": True', server)
        self.assertIn('"live_trading": False', server)


if __name__ == '__main__':
    unittest.main()
