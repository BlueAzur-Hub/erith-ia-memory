from pathlib import Path
from datetime import datetime, timezone
import importlib.util
import tempfile
import unittest

SRC = Path(__file__).parent / "UPGRADE_SEVEN_HEAVEN_STRATEGY_LAB_V3_TO_V3_1.py"
spec = importlib.util.spec_from_file_location("updater", SRC)
up = importlib.util.module_from_spec(spec)
spec.loader.exec_module(up)

SAMPLES = {
"src/okx_public.py": '''from datetime import datetime, timezone
import re
class PublicMarketError(Exception): pass
class _P: pass
MIN_FREE_BYTES=1
BASE_INTERVAL_SECONDS=3600
COUNT=240
MAX_PAGES=6
PAGE_LIMIT=100
HISTORY_PATH="history"

def collect(workspace: Path, pair: str, *, transport=None, now=None, min_free_bytes=MIN_FREE_BYTES):
    # Use the last COMPLETE 4H UTC boundary, so the 240 x 1H candles
    # can also replay 60 x full 4H candles without hidden partial bars.
    end = int(now // (4 * BASE_INTERVAL_SECONDS)) * (4 * BASE_INTERVAL_SECONDS)
    start = end - COUNT * BASE_INTERVAL_SECONDS
    source_id = f"OKX_{pair.replace('-', '_')}_1H_{end}"
    after = None
    previous_oldest = None
    for page in range(MAX_PAGES):
        pass
    manifest = {
        "collected_at_utc": datetime.fromtimestamp(now, timezone.utc).isoformat(),
        "meaning": "Recent public CLOSED candles, not a realtime trade or a historic book; "
                   "instrument rules at collection are not automatically used for fills.",
    }
    manifest["debug_cursor"] = after
    manifest["debug_start"] = start
    manifest["debug_end"] = end
    return manifest
''',
"src/server.py": '''class X:
    def f(self, data, collect_okx, WORKSPACE):
        self._send({"name": "Seven Heaven Strategy Lab", "version": "3.0.0",
                    "status": "LOCAL_PAPER_ONLY"})
        self._send({"source": collect_okx(WORKSPACE, data.get("pair"))}, 201)
''',
"web/app.js": '''const other = 3;
    const pair=$("okx-pair").value;
    notice("OKX public : contrôle des règles Spot, bougies clôturées et cache SHA-256…");
    try {
      const result=await api("/api/okx-import",{pair});
      await refreshSources(result.source.id);
      notice("OKX "+pair+" : 240 bougies 1h fermées et vérifiées sur la clé. "+
             "Tu peux comparer les stratégies en 1h ou 4h. Aucun ordre réel.","success");
    }catch(e){notice(e.message,"error");}
notice(ok?"Seven Heaven V3 opérationnel · Archive V1/V2 conservée · OKX public disponible.":
        "Seven Heaven V3 opérationnel. Charge une archive Binance ou OKX publique.","success");
''',
"web/index.html": '''<div>BUILD 3.0.0</div>
<div class="overline">V3 / PUBLIC MARKET CONNECTORS</div>
        <div class="connected-source-grid active-source-row">
        </div>
Les 240 bougies OKX couvrent les dix derniers jours complets alignés à la clôture 4h UTC.
<footer>BUILD 3.0.0</footer>
'''
}

class UpgradeTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        (self.root / "workspace").mkdir()
        (self.root / "workspace" / "profile.json").write_bytes(b'{"keep":"unchanged"}')
        for k, v in SAMPLES.items():
            path=self.root / k
            path.parent.mkdir(parents=True,exist_ok=True)
            path.write_bytes(v.encode("utf8"))
    def tearDown(self):
        self.tmp.cleanup()
    def test_success_and_preservation(self):
        got=up.upgrade(self.root, enforce_versions=False, require_stopped=False, verbose=False)
        self.assertEqual(len(got), 4)
        self.assertEqual((self.root/"workspace"/"profile.json").read_bytes(), b'{"keep":"unchanged"}')
        self.assertIn('end_date=data.get("end_date")',(self.root/"src/server.py").read_text())
        self.assertIn('"version": "3.1.0"',(self.root/"src/server.py").read_text())
        self.assertIn('after = end * 1000 if historical else None',(self.root/"src/okx_public.py").read_text())
        self.assertIn('"okx-history-date"',(self.root/"web/app.js").read_text())
        self.assertIn('id="okx-history-date"',(self.root/"web/index.html").read_text())
        self.assertEqual((self.root/"backup_seven_heaven_strategy_lab_before_v3_1"/"web/app.js").read_bytes(), SAMPLES["web/app.js"].encode())
    def test_exact_source_rejection_does_not_change_files(self):
        with self.assertRaisesRegex(RuntimeError,"différente"):
            up.upgrade(self.root, enforce_versions=True, require_stopped=False, verbose=False)
        self.assertEqual((self.root/"web/index.html").read_text(), SAMPLES["web/index.html"])
        self.assertFalse((self.root/"backup_seven_heaven_strategy_lab_before_v3_1").exists())
    def test_unknown_anchor_fails_before_writing(self):
        (self.root/"web/app.js").write_text('not v3')
        with self.assertRaisesRegex(RuntimeError,"Ancrage"):
            up.upgrade(self.root, enforce_versions=False, require_stopped=False, verbose=False)
        self.assertEqual((self.root/"src/server.py").read_text(), SAMPLES["src/server.py"])
        self.assertFalse((self.root/"backup_seven_heaven_strategy_lab_before_v3_1").exists())
    def test_historical_date_pagination_and_utc_alignment(self):
        program = up.patch_okx(SAMPLES["src/okx_public.py"])
        ns={"Path": Path}
        exec(compile(program, "synthetic_okx.py", "exec"), ns)
        now=datetime(2026,11,13,8,45,tzinfo=timezone.utc).timestamp()
        recent=ns["collect"](self.root, "BTC-USDC", now=now)
        self.assertIsNone(recent["debug_cursor"])
        past=ns["collect"](self.root, "BTC-USDC", now=now,end_date="2026-11-03")
        midnight=int(datetime(2026,11,3,tzinfo=timezone.utc).timestamp())
        self.assertEqual(past["debug_cursor"], midnight*1000)
        self.assertEqual(past["debug_end"], midnight)
        self.assertEqual(past["debug_start"], midnight-240*3600)
    def test_historical_date_is_strict_and_future_rejected(self):
        program = up.patch_okx(SAMPLES["src/okx_public.py"])
        ns={"Path": Path}
        exec(compile(program, "synthetic_okx.py", "exec"), ns)
        now=datetime(2026,11,13,8,45,tzinfo=timezone.utc).timestamp()
        for bad in ("2026-11-20", "2026-11-3", "2026-13-01", "../../../private", 123):
            with self.subTest(bad=bad):
                with self.assertRaises(ns["PublicMarketError"]):
                    ns["collect"](self.root, "BTC-USDC", now=now, end_date=bad)
    def test_stops_on_existing_backup(self):
        (self.root/"backup_seven_heaven_strategy_lab_before_v3_1").mkdir()
        with self.assertRaisesRegex(RuntimeError,"Sauvegarde"):
            up.upgrade(self.root, enforce_versions=False, require_stopped=False, verbose=False)

if __name__=="__main__":
    unittest.main(verbosity=2)
