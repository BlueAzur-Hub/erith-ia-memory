"""V4.8 StrategySpec / guided-mode browser contract.

This is a product-flow contract only. The financial engine remains covered by
existing V4.6.2 and native Donchian tests.
"""
from __future__ import annotations

from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class WebContractV48(unittest.TestCase):
    def test_guided_mode_and_strategyspec_controls_are_present(self):
        html = (ROOT / "web" / "index.html").read_text(encoding="utf-8")
        for dom_id in (
            "guided-mode",
            "guide-learn",
            "guide-create",
            "guide-compare",
            "guide-paper",
            "guide-expert",
            "strategy-spec-name",
            "save-strategy-spec",
            "saved-strategy-specs",
            "strategy-spec-explanation",
            "strategy-spec-title",
            "strategy-spec-intent",
            "strategy-spec-execution",
            "strategy-spec-weakness",
            "strategy-spec-fingerprint",
            "replay-strategy-spec",
        ):
            self.assertIn(f'id="{dom_id}"', html)
        self.assertIn("STRATEGYSPEC v1", html)
        self.assertIn("V4.8 PREVIEW", html)

    def test_browser_uses_local_strategyspec_api_only(self):
        app = (ROOT / "web" / "app.js").read_text(encoding="utf-8")
        self.assertIn('/api/strategy-specs', app)
        self.assertIn('/api/strategy-spec-run', app)
        self.assertIn('health.strategy_spec_v1_enabled', app)
        self.assertIn('selectedStrategySpec', app)
        self.assertIn('renderStrategySpec', app)
        self.assertNotIn('freqtrade', app.lower())
        self.assertNotIn('hummingbot', app.lower())

    def test_guided_paper_button_explicitly_keeps_v5_inactive(self):
        app = (ROOT / "web" / "app.js").read_text(encoding="utf-8")
        self.assertIn(
            "Robot PAPER Seven : étape V5 planifiée. Aucun automate temps réel n'est activé",
            app,
        )


if __name__ == "__main__":
    unittest.main()
