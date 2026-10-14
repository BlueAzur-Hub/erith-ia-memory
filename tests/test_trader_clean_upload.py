#!/usr/bin/env python3
"""Check that a Trader patch never includes an unchanged file or vault data."""
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
import zipfile

SCRIPT = Path(__file__).resolve().parents[1] / "tools" / "trader-clean-upload.py"
spec = importlib.util.spec_from_file_location("trader_clean_upload", SCRIPT)
patch = importlib.util.module_from_spec(spec)
spec.loader.exec_module(patch)

def git(*args):
    return subprocess.check_output(["git", *args], stderr=subprocess.DEVNULL).decode().strip()

class CleanUploadTests(unittest.TestCase):
    def test_scope(self):
        self.assertTrue(patch.allowed("public/agent_crypto_erith_ia/trader/trader-historical-panel.js"))
        self.assertTrue(patch.allowed("public/agent_crypto_erith_ia/administrator/index.html"))
        self.assertFalse(patch.allowed("public/lego/rising-phoenix/script.js"))
        self.assertFalse(patch.allowed("public/agent_crypto_erith_ia/data/historical_archive.json"))
        self.assertFalse(patch.allowed("public/agent_crypto_erith_ia/trader/../../private/key.txt"))
        self.assertFalse(patch.allowed("index.html"))
    def test_real_git_patch(self):
        old = Path.cwd()
        try:
            with tempfile.TemporaryDirectory() as tmp:
                root = Path(tmp)
                os.chdir(root)
                git("init", "-q")
                git("config", "user.name", "Trader CI")
                git("config", "user.email", "trader-ci@example.invalid")
                for name, text in {
                    "public/agent_crypto_erith_ia/trader/modified.js": "before",
                    "public/agent_crypto_erith_ia/trader/unchanged.js": "keep",
                    "public/agent_crypto_erith_ia/trader/deleted.js": "remove me",
                    "public/lego/rising-phoenix/index.html": "LEGO",
                    "public/agent_crypto_erith_ia/data/oracle_evidence/manifest.json": "Coffre",
                }.items():
                    file = root / name
                    file.parent.mkdir(parents=True, exist_ok=True)
                    file.write_text(text)
                git("add", ".")
                git("commit", "-qm", "base")
                base = git("rev-parse", "HEAD")
                (root/"public/agent_crypto_erith_ia/trader/modified.js").write_text("after")
                (root/"public/agent_crypto_erith_ia/trader/deleted.js").unlink()
                (root/"public/lego/rising-phoenix/index.html").write_text("new LEGO")
                (root/"public/agent_crypto_erith_ia/data/oracle_evidence/manifest.json").write_text("new Coffre")
                new_asset = root/"public/agent_crypto_erith_ia/trader/illustration.png"
                new_asset.write_bytes(b"asset separate")
                git("add", ".")
                git("commit", "-qm", "one Trader fix and unrelated updates")
                head = git("rev-parse", "HEAD")
                report = patch.pack(base, head, root/"small.zip")
                self.assertEqual(len(report["modified_files"]), 1)
                self.assertEqual(report["deleted_files"], [
                    "public/agent_crypto_erith_ia/trader/deleted.js"])
                self.assertEqual(report["media_excluded_separate_delivery_required"], [
                    "public/agent_crypto_erith_ia/trader/illustration.png"])
                with zipfile.ZipFile(root/"small.zip") as zipped:
                    self.assertEqual(set(zipped.namelist()),{
                        "public/agent_crypto_erith_ia/trader/modified.js",
                        "CLEAN_UPLOAD_MANIFEST.json"
                    })
                    self.assertEqual(zipped.read("public/agent_crypto_erith_ia/trader/modified.js"),b"after")
                    data = json.loads(zipped.read("CLEAN_UPLOAD_MANIFEST.json"))
                    self.assertFalse(data["self_contained"])
                self.assertLess((root/"small.zip").stat().st_size,1_000_000)
        finally:
            os.chdir(old)

if __name__ == "__main__":
    unittest.main(verbosity=2)
