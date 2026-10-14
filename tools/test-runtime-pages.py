import importlib.util,unittest
from pathlib import Path
p=Path(__file__).with_name("build-runtime-pages.py")
s=importlib.util.spec_from_file_location("runtime",p)
r=importlib.util.module_from_spec(s);s.loader.exec_module(r)
class TestRuntime(unittest.TestCase):
 def test_archive_excluded(self):
  for p in ("public/agent_crypto_erith_ia/data/historical_archive_prototype/compact_v1/index.json","public/agent_crypto_erith_ia/data/oracle_evidence/manifest.json","public/agent_crypto_erith_ia/administrator/index-40.6.545.html","assets/images/technical-reading/technical-random-01.png","coordination/inter_ai_dialogues/agent_crypto/archive.zip"):
   self.assertFalse(r.include(p),p)
 def test_ui_preserved(self):
  for p in ("index.html","public/agent_crypto_erith_ia/administrator/index.html","public/agent_crypto_erith_ia/trader/trading-desk.html","public/agent_crypto_erith_ia/trader/ai-verified-history-reader.js","public/agent_crypto_erith_ia/laboratoire/cas-ecole-concrete.md"):
   self.assertTrue(r.include(p),p)
 def test_router_and_image(self):
  s=b'<head><img src="../../../assets/images/technical-reading/technical-random-01.png">'
  out=r.transform("public/agent_crypto_erith_ia/administrator/index.html",s).decode()
  self.assertIn('src="../web/vault-data-router.js"',out)
  self.assertIn(r.RAW+"assets/images/technical-reading/technical-random-01.png",out)
 def test_preview_image_revision(self):
  revision="f941c6d56fbc509d1c567ed81042ad55cda01dbf"
  snippet=b'<head><img src="../../../assets/images/technical-reading/technical-random-01.png">'
  page=r.transform("public/agent_crypto_erith_ia/administrator/index.html",snippet,image_ref=revision).decode()
  self.assertIn(r.IMAGE_RAW_ROOT+revision+"/assets/images/technical-reading/technical-random-01.png",page)
  self.assertNotIn(r.RAW+"assets/images/",page)
  with self.assertRaises(ValueError):r.image_raw_base("../main")
 def test_local_images(self):
  s=b'const i="./assets/images/missions_de_vie_constellation_bg.png";'
  self.assertEqual(r.transform("public/agent_crypto_erith_ia/administrator/js/x.js",s),s)
 def test_bounded(self):self.assertLessEqual(r.BUDGET,180000000)
if __name__=="__main__":unittest.main(verbosity=2)
