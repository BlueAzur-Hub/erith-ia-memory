#!/usr/bin/env python3
"""Additional Top50 Spot qualification and immutable OHLCV: offline regressions."""
from pathlib import Path
import json
import tempfile
import unittest
from unittest.mock import patch

import collect_historical_remaining as additional
import collect_historical_cohort as source
import audit_historical_coverage as coverage
from historical_cohort_test import fake_get


def api(endpoint, args, all_bad=False, missing=False):
    if endpoint.endswith("/exchangeInfo"):
        pair = args["symbol"]
        if all_bad or pair in {"XMRUSDT", "CROUSDT"}:
            return {"symbols": []}
        return {"symbols": [{"symbol": pair, "baseAsset": pair[:-4],
                             "quoteAsset": "USDT", "status": "TRADING",
                             "isSpotTradingAllowed": True,
                             "permissionSets": [["SPOT"]]}]}
    if missing and args["symbol"] == "HYPEUSDT" and args["interval"] == "5m":
        rows = fake_get(endpoint, args)
        return rows[:-1]
    return fake_get(endpoint, args)


class RemainingCoverageTests(unittest.TestCase):
    def test_complete_26_identity_classification(self):
        rows, proof = additional.assemble()
        self.assertEqual(len(rows),50)
        self.assertEqual(sum(x["status"] == "existing_archive_protected" for x in rows),24)
        self.assertEqual(sum(x["status"] == "candidate" for x in rows),15)
        self.assertEqual(sum(x["status"] == "identity_review_required" for x in rows),11)
        self.assertEqual(sum(x["pair"] is not None for x in rows),15)
        self.assertEqual(len(proof["baseline_sha256"]),64)
        self.assertEqual(additional.verify()["mode"],"VERIFIED")
        self.assertEqual(additional.verify()["new_assets"],7)
        self.assertIsNone(next(x for x in rows if x["id"]=="tether")["pair"])
        self.assertIsNone(next(x for x in rows if x["id"]=="memecore")["pair"])

    def test_read_only_probe_reports_unavailable_pairs_and_no_files(self):
        with tempfile.TemporaryDirectory() as d:
            with patch.object(source, "get_json", side_effect=api):
                info=additional.probe()
            self.assertEqual(info["mode"],"PROBE_NO_WRITES")
            self.assertEqual(info["proposed"],15)
            self.assertEqual(info["qualified"],13)
            self.assertFalse((Path(d)/"index.json").exists())

    def test_archive_thirteen_spot_assets_without_touching_existing_archive(self):
        with tempfile.TemporaryDirectory() as d:
            output=Path(d)/"supplement"
            original=(additional.BASELINE/"index.json").read_bytes()
            with patch.object(source, "get_json", side_effect=api), (
                 patch.object(additional.time,"time",return_value=1_800_000_000)):
                result=additional.collect(output)
            self.assertEqual(result["mode"],"VERIFIED")
            self.assertEqual(result["new_assets"],13)
            self.assertEqual(result["series"],39)
            self.assertEqual(result["candles"],13*(288+168+180))
            self.assertEqual((additional.BASELINE/"index.json").read_bytes(),original)
            new=json.loads((output/"index.json").read_bytes())
            self.assertEqual(len(new["assets"]),50)
            self.assertEqual(len(new["blocks"]),39)
            self.assertEqual(new["assets"][2]["status"],"identity_review_required")
            self.assertEqual(additional.verify(output),result)
            with self.assertRaisesRegex(ValueError,"never overwrite"):
                additional.collect(output)
            report=coverage.summarize(additional_dir=output)
            self.assertEqual(report["archived_assets"],37)
            self.assertEqual(report["unarchived_assets"],13)
            self.assertEqual(report["archive_owners"]["top50_additional"],13)
            self.assertEqual(report["original_series"],111)
            extra=output/new["blocks"][0]["file"]
            extra.write_bytes(extra.read_bytes()+b"tamper")
            with self.assertRaisesRegex(ValueError,"SHA-256"):
                additional.verify(output)

    def test_incomplete_asset_does_not_publish_partial_history(self):
        with tempfile.TemporaryDirectory() as d:
            output=Path(d)/"extra"
            with patch.object(source,"get_json",
                              side_effect=lambda p,a:api(p,a,missing=True)), (
                 patch.object(additional.time,"time",return_value=1_800_000_000)):
                result=additional.collect(output)
            self.assertEqual(result["new_assets"],12)
            report=json.loads((output/"index.json").read_bytes())
            self.assertEqual(next(x for x in report["assets"] if x["id"]=="hyperliquid")["status"],
                             "historical_data_incomplete")
            self.assertFalse(any(x["asset_id"]=="hyperliquid" for x in report["blocks"]))

    def test_every_pair_rejected_fails_closed_with_no_archive(self):
        with tempfile.TemporaryDirectory() as d:
            output=Path(d)/"empty"
            with patch.object(source,"get_json",
                              side_effect=lambda p,a:api(p,a,all_bad=True)), (
                 patch.object(additional.time,"time",return_value=1_800_000_000)):
                with self.assertRaisesRegex(ValueError,"no publication"):
                    additional.collect(output)
            self.assertFalse((output/"index.json").exists())

    def test_wrong_symbol_registry_cannot_relabel_existing_identity(self):
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/"registry.json"
            obj=json.loads(additional.REGISTRY.read_bytes())
            obj["candidate_symbols"]["hyperliquid"]="BTC"
            path.write_text(json.dumps(obj))
            with self.assertRaisesRegex(ValueError,"symbol identity mismatch"):
                additional.assemble(registry=path)


if __name__ == "__main__":
    unittest.main(verbosity=2)
