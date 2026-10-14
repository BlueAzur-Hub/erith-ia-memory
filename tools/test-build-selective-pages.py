#!/usr/bin/env python3
"""Offline tests for the candidate-only Pages packing workflow."""
from pathlib import Path
import importlib.util
import tempfile
import unittest
M = Path(__file__).with_name("build-selective-pages.py")
SPEC = importlib.util.spec_from_file_location("pages_builder",M)
builder = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(builder)

class PublishSelection(unittest.TestCase):
    def test_paths(self):
        self.assertTrue(builder.include("public/agent_crypto_erith_ia/administrator/index.html"))
        self.assertTrue(builder.include("assets/images/technical-reading/technical-random-20.png"))
        self.assertTrue(builder.include("public/agent_crypto_erith_ia/data/historical_archive_prototype/compact_v1/index.json"))
        self.assertFalse(builder.include("public/agent_crypto_erith_ia/administrator/index-40.6.543.html"))
        self.assertFalse(builder.include("public/agent_crypto_erith_ia/data/oracle_evidence/2026/09/30/a.jsonl"))
        self.assertFalse(builder.include("public/agent_crypto_erith_ia/administrator/archive.zip"))
        self.assertFalse(builder.include("coordination/inter_ai_dialogues/agent_crypto/old.bin"))
        self.assertFalse(builder.include("private/key.txt"))
    def test_html_url_reader(self):
        parser = builder.Refs()
        parser.feed('<iframe src="../administrator/index.html?surface=trader"></iframe>')
        parser.feed('<img src="../../../assets/images/technical-reading/technical-random-01.png">')
        self.assertEqual(len(parser.urls),2)
    def test_budget(self):
        self.assertEqual(builder.MAX_BYTES,900_000_000)
        self.assertIn("assets/images/visual/admin-chart-office.png",builder.REQUIRED)

if __name__=="__main__":
    unittest.main(verbosity=2)
