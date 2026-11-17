from pathlib import Path
import hashlib
import unittest

ROOT = Path(__file__).resolve().parents[1]


class EmaKnowledgeV48(unittest.TestCase):
    def test_ema_article_is_professional_and_paper_only(self):
        from src.strategy_knowledge import article, catalog
        payload = article("ema")
        ema = payload["article"]
        self.assertEqual(payload["schema"], "seven.strategy_knowledge.v1")
        self.assertTrue(payload["paper_only"])
        self.assertGreaterEqual(catalog()["count"], 2)
        for key in (
            "summary", "what_it_measures", "sma_difference", "formula", "reading",
            "crossover", "strengths", "limits", "context_tools", "seven_engine",
            "analysis_checklist", "references"
        ):
            self.assertTrue(ema.get(key), key)
        self.assertIn("bougie déjà clôturée", ema["seven_engine"]["execution"])
        self.assertIn("ouverture de la bougie suivante", ema["seven_engine"]["execution"])
        self.assertIn("sans levier", ema["seven_engine"]["positioning"])

    def test_server_exposes_knowledge_layer_without_live_trading(self):
        server = (ROOT / "src/server.py").read_text(encoding="utf-8")
        self.assertIn('"strategy_knowledge_v1_enabled": True', server)
        self.assertIn('path == "/api/strategy-knowledge"', server)
        self.assertIn('r"/api/strategy-knowledge/[a-z0-9_-]+"', server)
        self.assertIn('"live_trading": False', server)

    def test_ema_panel_has_visual_formula_engine_rules_and_actions(self):
        html = (ROOT / "web/index.html").read_text(encoding="utf-8")
        for dom_id in (
            "ema-knowledge-panel", "ema-knowledge-title", "ema-knowledge-summary",
            "ema-formula-alpha", "ema-current-weights", "ema-reading-list",
            "ema-seven-entry", "ema-seven-execution", "ema-analysis-checklist",
            "ema-action-chart", "ema-action-prepare", "ema-action-compare",
            "ema-action-results", "guided-atlas-knowledge"
        ):
            self.assertIn(f'id="{dom_id}"', html)
        self.assertIn("Croisement haussier", html)
        self.assertIn("Règles exactes du moteur PAPER", html)

    def test_frontend_opens_full_ema_article_and_calculates_timeframe_meaning(self):
        app = (ROOT / "web/app.js").read_text(encoding="utf-8")
        for text in (
            'api("/api/strategy-knowledge/ema")',
            "updateEmaKnowledgeNumbers()",
            "timeframeMinutes(tf)",
            "openEmaKnowledge",
            'entry.kind==="EMA_CROSS"',
        ):
            self.assertIn(text, app)

    def test_engine_remains_canonical_rc1_hash(self):
        digest = hashlib.sha256((ROOT / "src/engine.py").read_bytes()).hexdigest()
        self.assertEqual(digest, "f4de4a9cb8dbfd17a665785b6b06cfff3473039624457e721d3f3fd9e2aeb7c2")


if __name__ == "__main__":
    unittest.main()
