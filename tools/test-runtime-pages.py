import importlib.util,unittest,json,subprocess,tempfile
from pathlib import Path
p=Path(__file__).with_name("build-runtime-pages.py")
s=importlib.util.spec_from_file_location("runtime",p)
r=importlib.util.module_from_spec(s);s.loader.exec_module(r)
class TestRuntime(unittest.TestCase):
 def test_archive_excluded(self):
  for p in (".nojekyll","public/other/index.html","public/agent_crypto_erith_ia/data/historical_archive_prototype/compact_v1/index.json","public/agent_crypto_erith_ia/data/oracle_evidence/manifest.json","public/agent_crypto_erith_ia/administrator/index-40.6.545.html","assets/images/technical-reading/technical-random-01.png","assets/images/visual/admin-chart-office.png","coordination/inter_ai_dialogues/agent_crypto/archive.zip"):
   self.assertFalse(r.include(p),p)
 def test_ui_preserved(self):
  for p in ("index.html","app.js","style.css","public/index.html",
            "public/lego/rising-phoenix/index.html","public/liora-jardin-reves-doux/index.html",
            "assets/images/noctilux_dossier_flux_anomaly_v1.png",
            "public/agent_crypto_erith_ia/administrator/index.html","public/agent_crypto_erith_ia/trader/trading-desk.html","public/agent_crypto_erith_ia/trader/ai-verified-history-reader.js","public/agent_crypto_erith_ia/laboratoire/cas-ecole-concrete.md"):
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
 def test_bounded(self):self.assertLessEqual(r.BUDGET,360000000)
 def test_multisite_real_git_build(self):
  with tempfile.TemporaryDirectory() as tmp:
   src=Path(tmp)/"repo"; dst=Path(tmp)/"published";src.mkdir()
   for name in r.REQUIRED+r.SHARED_REQUIRED:
    path=src/name;path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text("<html><head></head><body>Crypto</body></html>" if name.endswith(".html") else "test",encoding="utf-8")
   for name in ("index.html","app.js","style.css",
                "public/lego/rising-phoenix/index.html",
                "public/liora-jardin-reves-doux/index.html",
                "public/agent_crypto_erith_ia/data/oracle_evidence/manifest.json",
                "public/agent_crypto_erith_ia/data/historical_archive_prototype/compact_v1/index.json",
                "assets/images/technical-reading/technical-random-01.png"):
    path=src/name;path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text("not a published file",encoding="utf-8")
   subprocess.run(["git","init","-q",str(src)],check=True)
   subprocess.run(["git","-C",str(src),"add","-A"],check=True)
   report=r.build(src,dst)
   self.assertEqual(report["publication_scope"],"shared-root+public-projects+agent-crypto")
   self.assertEqual(report["runtime_files"],len(r.REQUIRED)+len(r.SHARED_REQUIRED))
   self.assertTrue((dst/r.MANIFEST).is_file())
   self.assertTrue((dst/"index.html").exists())
   self.assertTrue((dst/"public/lego/rising-phoenix/index.html").exists())
   self.assertFalse((dst/"public/agent_crypto_erith_ia/data").exists())
   self.assertTrue((dst/"public/liora-jardin-reves-doux/index.html").exists())
   output=[p.relative_to(dst).as_posix() for p in dst.rglob("*") if p.is_file()]
   self.assertTrue(all(r.include(n) or n==".nojekyll" for n in output))

 def test_real_git_tree_plan(self):
  with tempfile.TemporaryDirectory() as tmp:
   src=Path(tmp)/"repo";src.mkdir()
   for n in r.REQUIRED+r.SHARED_REQUIRED:
    p=src/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_text("ok",encoding="utf-8")
   huge=src/"public/agent_crypto_erith_ia/data/oracle_evidence/large.jsonl"
   huge.parent.mkdir(parents=True,exist_ok=True);huge.write_text("private evidence",encoding="utf-8")
   img=src/"assets/images/visual/admin-chart-office.png"
   img.parent.mkdir(parents=True,exist_ok=True);img.write_bytes(b"binary")
   subprocess.run(["git","init","-q",str(src)],check=True)
   subprocess.run(["git","-C",str(src),"add","-A"],check=True)
   subprocess.run(["git","-C",str(src),"-c","user.name=CI","-c","user.email=ci@example.com","commit","-qm","sample"],check=True)
   item=r.plan(src)
   self.assertTrue(item["selection_complete"])
   self.assertFalse(item["budget_verified"])
   self.assertEqual(item["file_count"],len(r.REQUIRED+r.SHARED_REQUIRED))
   self.assertFalse(item["cold_vault_included"])
   self.assertGreater(item["excluded_file_count"],0)
   self.assertEqual(item["group_file_count"]["shared"],len(r.SHARED_REQUIRED))

if __name__=="__main__":unittest.main(verbosity=2)
