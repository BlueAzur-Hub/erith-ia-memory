"""V4.6 server gates for certified sources and fixed public import."""
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


class ServerV46(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.workspace = Path(self.temp.name)
        self.workspace_patch = patch.object(server, "WORKSPACE", self.workspace)
        self.workspace_patch.start()

    def tearDown(self):
        self.workspace_patch.stop()
        self.temp.cleanup()

    def _install_fixture(self):
        archive, checksum = fixture(2020, 1)
        with patch("src.binance_monthly_source_v46._download",
                   side_effect=[checksum.encode("ascii"), archive]):
            return install(self.workspace)

    def _request(self, method, path, body=None):
        httpd = server.ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        thread.start()
        try:
            connection = http.client.HTTPConnection("127.0.0.1", httpd.server_port, timeout=5)
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

    def test_catalog_and_resolver_keep_binance_monthly_distinct(self):
        manifest = self._install_fixture()
        catalog = server._sources_catalog()
        self.assertEqual(len(catalog["sources"]), 1)
        source = catalog["sources"][0]
        self.assertEqual(source["id"], SOURCE_ID)
        self.assertEqual(source["source_kind"], "BINANCE_MONTHLY_CERTIFIED")
        resolved, bars = server._resolve_source(SOURCE_ID)
        self.assertEqual(resolved["source_kind"], "BINANCE_MONTHLY_CERTIFIED")
        self.assertEqual(resolved["source_archive_sha256"], manifest["archive_sha256_observed"])
        self.assertEqual(len(bars), 744)

    def test_health_and_sources_expose_v46_contract(self):
        self._install_fixture()
        status, health = self._request("GET", "/api/health")
        self.assertEqual(status, 200)
        self.assertEqual(health["version"], "4.6.2")
        self.assertTrue(health["certified_binance_monthly_enabled"])
        self.assertTrue(health["explicit_no_trade_warmup_enabled"])
        status, catalog = self._request("GET", "/api/sources")
        self.assertEqual(status, 200)
        self.assertEqual(catalog["sources"][0]["id"], SOURCE_ID)

    def test_monthly_import_refuses_any_user_selected_url_or_symbol(self):
        with patch.object(server, "install_binance_monthly") as installer:
            status, payload = self._request(
                "POST", "/api/binance-monthly-import",
                {"url": "https://example.invalid/data.zip", "symbol": "ETHUSDT"},
            )
        self.assertEqual(status, 400)
        self.assertIn("aucun paramètre libre", payload["error"])
        installer.assert_not_called()


if __name__ == "__main__":
    unittest.main()
