from pathlib import Path
import hashlib
import unittest

ROOT = Path(__file__).resolve().parents[1]


class DonchianKnowledgeV48(unittest.TestCase):
    def test_donchian_article_matches_native_engine_contract(self):
        from src.strategy_knowledge import article, catalog
        payload = article("donchian")
        dc = payload["article"]
        self.assertTrue(payload["paper_only"])
        self.assertGreaterEqual(catalog()["count"], 3)
        for key in ("summary","what_it_measures","formula","reading","breakouts","parameters","strengths","limits","seven_engine","local_evidence","analysis_checklist","references"):
            self.assertTrue(dc.get(key), key)
        self.assertIn("55 bougies", dc["seven_engine"]["entry"])
        self.assertIn("20 bougies", dc["seven_engine"]["exit"])
        self.assertIn("bougie déjà clôturée", dc["seven_engine"]["execution"])
        self.assertIn("ouverture", dc["seven_engine"]["execution"])

    def test_ui_has_full_donchian_professional_sheet(self):
        html=(ROOT/"web/index.html").read_text(encoding="utf-8")
        for dom_id in (
            "donchian-knowledge-panel","donchian-knowledge-title","donchian-knowledge-summary",
            "donchian-formula-upper","donchian-reading-list","donchian-breakout-confirmed",
            "donchian-parameter-asymmetry","donchian-seven-entry","donchian-evidence-grid","donchian-evidence-conclusion","donchian-analysis-checklist",
            "donchian-action-chart","donchian-action-prepare","donchian-action-compare","donchian-action-results"
        ):
            self.assertIn(f'id="{dom_id}"',html)
        self.assertIn("55 / 20",html)
        self.assertIn("Faux breakout",html)
        self.assertIn("PREUVES LOCALES SEVEN",html)

    def test_frontend_routes_donchian_to_knowledge_layer(self):
        app=(ROOT/"web/app.js").read_text(encoding="utf-8")
        for text in ('api("/api/strategy-knowledge/donchian")',"openDonchianKnowledge",'entry.kind==="DONCHIAN"',"updateDonchianKnowledgeNumbers()"):
            self.assertIn(text,app)

    def test_engine_hash_unchanged(self):
        digest=hashlib.sha256((ROOT/"src/engine.py").read_bytes()).hexdigest()
        self.assertEqual(digest,"f4de4a9cb8dbfd17a665785b6b06cfff3473039624457e721d3f3fd9e2aeb7c2")


if __name__ == "__main__":
    unittest.main()
