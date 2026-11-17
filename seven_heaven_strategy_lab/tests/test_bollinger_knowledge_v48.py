from pathlib import Path
import hashlib
import unittest

ROOT = Path(__file__).resolve().parents[1]


class BollingerKnowledgeV48(unittest.TestCase):
    def test_bollinger_article_is_deep_and_paper_only(self):
        from src.strategy_knowledge import article, catalog
        payload = article("bollinger")
        bb = payload["article"]
        self.assertTrue(payload["paper_only"])
        self.assertGreaterEqual(catalog()["count"], 2)
        for key in ("summary", "what_it_measures", "formula", "reading", "patterns", "strengths", "limits", "seven_engine", "analysis_checklist", "references"):
            self.assertTrue(bb.get(key), key)
        self.assertIn("sous la bande basse", bb["seven_engine"]["entry"])
        self.assertIn("au-dessus de la bande haute", bb["seven_engine"]["exit"])
        self.assertIn("ouverture", bb["seven_engine"]["execution"])

    def test_ui_has_full_bollinger_professional_sheet(self):
        html = (ROOT / "web/index.html").read_text(encoding="utf-8")
        for dom_id in (
            "bollinger-knowledge-panel", "bollinger-knowledge-title", "bollinger-knowledge-summary",
            "bollinger-formula-middle", "bollinger-reading-list", "bollinger-squeeze-text",
            "bollinger-seven-entry", "bollinger-analysis-checklist", "bollinger-action-chart",
            "bollinger-action-prepare", "bollinger-action-compare", "bollinger-action-results"
        ):
            self.assertIn(f'id="{dom_id}"', html)
        self.assertIn("Squeeze", html)
        self.assertIn("20 × 2", html)

    def test_frontend_routes_bollinger_to_knowledge_layer(self):
        app = (ROOT / "web/app.js").read_text(encoding="utf-8")
        for text in (
            'api("/api/strategy-knowledge/bollinger")', "openBollingerKnowledge",
            'entry.kind==="BOLLINGER"', "updateBollingerKnowledgeNumbers()"
        ):
            self.assertIn(text, app)

    def test_source_buttons_have_reserved_width(self):
        css = (ROOT / "web/styles.css").read_text(encoding="utf-8")
        self.assertIn("scrollbar-gutter:stable", css)
        self.assertIn("width:94px", css)
        self.assertIn("grid-template-columns:minmax(170px,1.25fr)", css)

    def test_engine_hash_unchanged(self):
        digest = hashlib.sha256((ROOT / "src/engine.py").read_bytes()).hexdigest()
        self.assertEqual(digest, "f4de4a9cb8dbfd17a665785b6b06cfff3473039624457e721d3f3fd9e2aeb7c2")


if __name__ == "__main__":
    unittest.main()
