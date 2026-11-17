from pathlib import Path
import hashlib
import unittest

from src.strategy_knowledge import article, catalog

ROOT = Path(__file__).resolve().parents[1]


class PassiveKnowledgeV48(unittest.TestCase):
    def test_catalog_contains_all_step5_reference_articles(self):
        ids = {item["id"] for item in catalog()["articles"]}
        self.assertTrue({"ema","bollinger","donchian","dca","hold_50","hold_100","cash"}.issubset(ids))
        self.assertGreaterEqual(catalog()["count"], 7)

    def test_dca_contract_matches_observatory_conversion_and_engine(self):
        dca = article("dca")["article"]
        text = " ".join(dca["mechanics"] + dca["reading"] + list(dca["parameters"].values()) + list(dca["seven_engine"].values()))
        self.assertIn("minutes", text)
        self.assertIn("bougies", text)
        self.assertIn("arrondi", text)
        self.assertIn("aucune vente", text.lower())
        self.assertIn("dernière clôture", text)
        observatory = (ROOT / "src" / "observatory.py").read_text(encoding="utf-8")
        self.assertIn("math.ceil(requested_dca_minutes / minutes)", observatory)
        self.assertIn('result["data"]["dca_effective_minutes"]', observatory)

    def test_hold_and_cash_articles_match_engine_baselines(self):
        engine = (ROOT / "src" / "engine.py").read_text(encoding="utf-8")
        self.assertIn('kind in ("HOLD_50", "HOLD_100")', engine)
        self.assertIn('capital * (0.5 if kind == "HOLD_50" else 1.0)', engine)
        self.assertIn('final = cash + quantity * bars[-1][4]', engine)
        h50 = article("hold_50")["article"]
        h100 = article("hold_100")["article"]
        cash = article("cash")["article"]
        self.assertIn("50 %", h50["parameters"]["allocation"])
        self.assertIn("capital disponible", h100["parameters"]["allocation"])
        self.assertIn("Aucun ordre PAPER", " ".join(cash["mechanics"]))
        self.assertIn("0 % nominal", cash["role"])

    def test_web_exposes_one_reusable_step5_panel_and_routes_four_kinds(self):
        html = (ROOT / "web" / "index.html").read_text(encoding="utf-8")
        js = (ROOT / "web" / "app.js").read_text(encoding="utf-8")
        self.assertEqual(html.count('id="passive-knowledge-panel"'), 1)
        for token in ("passive-mechanics-list","passive-reading-list","passive-seven-entry","passive-analysis-checklist","passive-reference-list"):
            self.assertIn(token, html)
        for kind, article_id in (("DCA","dca"),("HOLD_50","hold_50"),("HOLD_100","hold_100"),("CASH","cash")):
            self.assertIn(f'{kind}:"{article_id}"', js)
        self.assertIn('openPassiveKnowledge', js)
        self.assertIn('api("/api/strategy-knowledge/"+articleId)', js)
        self.assertIn('knowledgeKinds=["EMA_CROSS","BOLLINGER","DONCHIAN","DCA","HOLD_50","HOLD_100","CASH"]', js)

    def test_help_layer_covers_step5_actions_without_network(self):
        js = (ROOT / "web" / "lab-help-layer.js").read_text(encoding="utf-8")
        self.assertIn("#passive-action-prepare", js)
        self.assertIn("#passive-action-compare", js)
        self.assertIn("#passive-action-results", js)
        for forbidden in ("fetch(", "/api/", "localStorage", "sessionStorage"):
            self.assertNotIn(forbidden, js)

    def test_engine_is_unchanged(self):
        engine = ROOT / "src" / "engine.py"
        self.assertEqual(hashlib.sha256(engine.read_bytes()).hexdigest(), "f4de4a9cb8dbfd17a665785b6b06cfff3473039624457e721d3f3fd9e2aeb7c2")


if __name__ == "__main__":
    unittest.main()
