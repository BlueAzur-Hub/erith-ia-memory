#!/usr/bin/env python3
import importlib.util
from pathlib import Path
import unittest
spec=importlib.util.spec_from_file_location("patch",Path(__file__).with_name("build-code-patch.py"))
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

class TestSmallCodePatch(unittest.TestCase):
 def test_active(self):
  for p in ("public/agent_crypto_erith_ia/trader/trader-okx-account.js","public/agent_crypto_erith_ia/administrator/index.html","public/agent_crypto_erith_ia/administrator/build.json","index.html"):
   self.assertTrue(m.include(p),p)
 def test_excluded(self):
  for p in ("public/agent_crypto_erith_ia/data/oracle_evidence/manifest.json","assets/images/technical-reading/technical-random-01.png","public/agent_crypto_erith_ia/administrator/index-40.6.545.html","public/agent_crypto_erith_ia/trader/downloads/old.json","coordination/inter_ai_dialogues/agent_crypto/old.md"):
   self.assertFalse(m.include(p),p)
 def test_traversal(self):
  for p in ("../../escape.js","/tmp/test.js","public/agent_crypto_erith_ia/administrator/../private/file.js"):
   self.assertFalse(m.include(p))
 def test_budget(self):self.assertEqual(m.LIMIT,1_000_000)

if __name__=="__main__":unittest.main(verbosity=2)
