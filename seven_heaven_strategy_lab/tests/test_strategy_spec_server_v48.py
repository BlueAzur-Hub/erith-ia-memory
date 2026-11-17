"""Local API proof for StrategySpec v1 save/reload/replay.

The test uses the certified Binance monthly fixture and proves that a saved
StrategySpec replays through the existing Seven engine with identical financial
results to the current parameter API.
"""
from __future__ import annotations

import http.client
import json
from pathlib import Path
import tempfile
import threading
import unittest
from unittest.mock import patch

from src import server
from src.binance_monthly_source_v46 import SOURCE_ID, install
from tests.test_binance_monthly_v46 import fixture


class StrategySpecServerTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.workspace = Path(self.temp.name)
        self.workspace_patch = patch.object(server, "WORKSPACE", self.workspace)
        self.workspace_patch.start()
        archive, checksum = fixture(2020, 1)
        with patch(
            "src.binance_monthly_source_v46._download",
            side_effect=[checksum.encode("ascii"), archive],
        ):
            install(self.workspace)

    def tearDown(self):
        self.workspace_patch.stop()
        self.temp.cleanup()

    def _request(self, method, path, body=None):
        httpd = server.ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        thread.start()
        try:
            connection = http.client.HTTPConnection(
                "127.0.0.1", httpd.server_port, timeout=8
            )
            payload = None if body is None else json.dumps(body)
            headers = {"Host": "127.0.0.1:8777"}
            if payload is not None:
                headers["Content-Type"] = "application/json"
            connection.request(method, path, body=payload, headers=headers)
            response = connection.getresponse()
            parsed = json.loads(response.read().decode("utf-8"))
            connection.close()
            return response.status, parsed
        finally:
            httpd.shutdown()
            httpd.server_close()
            thread.join(timeout=5)

    def params(self):
        return {
            "kind": "DONCHIAN",
            "timeframe": "1h",
            "source_id": SOURCE_ID,
            "capital": 1000,
            "fee": 0.001,
            "slippage": 0.0005,
            "donchian_entry": 55,
            "donchian_exit": 20,
        }

    def test_save_list_reload_and_replay_matches_current_run(self):
        status, created = self._request(
            "POST",
            "/api/strategy-specs",
            {"name": "Donchian 55/20 · pilote", "params": self.params()},
        )
        self.assertEqual(status, 201)
        spec = created["strategy_spec"]
        self.assertEqual(spec["schema"], "seven.strategy_spec.v1")
        self.assertEqual(spec["strategy"]["kind"], "DONCHIAN")
        self.assertEqual(spec["market"]["source_id"], SOURCE_ID)
        self.assertFalse(spec["execution"]["real_orders"])
        self.assertIn("55", created["explanation"]["intent"])

        stored = self.workspace / "strategy_specs" / f"{spec['id']}.json"
        self.assertTrue(stored.is_file())

        status, listed = self._request("GET", "/api/strategy-specs")
        self.assertEqual(status, 200)
        self.assertEqual(len(listed["strategy_specs"]), 1)
        self.assertEqual(listed["strategy_specs"][0]["id"], spec["id"])

        status, loaded = self._request(
            "GET", f"/api/strategy-specs/{spec['id']}"
        )
        self.assertEqual(status, 200)
        self.assertEqual(loaded["strategy_spec"], spec)

        status, direct = self._request(
            "POST", "/api/run", {"params": self.params()}
        )
        self.assertEqual(status, 201)

        status, replay = self._request(
            "POST",
            "/api/strategy-spec-run",
            {"strategy_spec_id": spec["id"]},
        )
        self.assertEqual(status, 201)
        self.assertEqual(replay["report"]["safety"]["orders_real"], 0)
        self.assertEqual(
            replay["report"]["strategy_spec_fingerprint_sha256"],
            spec["fingerprint_sha256"],
        )

        direct_run = direct["report"]["run"]
        replay_run = replay["report"]["run"]
        self.assertEqual(direct_run["params"], replay_run["params"])
        self.assertEqual(direct_run["results"], replay_run["results"])
        self.assertEqual(direct_run["trades"], replay_run["trades"])
        self.assertEqual(direct_run["series"], replay_run["series"])

    def test_health_declares_internal_strategyspec_without_external_dependency(self):
        status, health = self._request("GET", "/api/health")
        self.assertEqual(status, 200)
        self.assertTrue(health["strategy_spec_v1_enabled"])
        self.assertFalse(health["strategy_spec_external_engine_required"])
        self.assertFalse(health["live_trading"])


if __name__ == "__main__":
    unittest.main()
