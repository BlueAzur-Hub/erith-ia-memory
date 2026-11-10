"""Offline deterministic regression tests. No HTTP or credentials."""
import hashlib
import json
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

import collect_okx_btc_hourly as m


def sample(day, *, missing=None, duplicate=None, open_candle=None, bad_ohlc=None, zero_volume=None):
    end = m.utc_ms(day) + 24 * m.HOUR_MS
    result = []
    # Newest first, 100 rows as on OKX; include 76 older rows.
    for j in range(100):
        t = end - (j + 1) * m.HOUR_MS
        h = (t - m.utc_ms(day)) // m.HOUR_MS
        if h == missing:
            continue
        price = 70000 + (h + 76) * 10
        row = [str(t), str(price), str(price + 50), str(price - 50), str(price + 10),
               "1.1", "77000", "77000", "1"]
        if h == open_candle:
            row[8] = "0"
        if h == bad_ohlc:
            row[2] = str(price - 5)
        if h == zero_volume:
            row[5] = "0"
        result.append(row)
        if h == duplicate:
            result.append(row.copy())
    return result


def public_reply(url, **kwargs):
    q = url.split("after=")[1].split("&")[0]
    day = "2026-11-05" if int(q) == m.utc_ms("2026-11-05") + 24*m.HOUR_MS else "2026-11-08"
    return json.dumps({"code": "0", "msg": "", "data": sample(day, **kwargs)}).encode()


class TestCollector(unittest.TestCase):
    def test_exact_two_utc_days_have_24_rows(self):
        for day in m.DAYS:
            rows = m.extract_day(sample(day), day)
            self.assertEqual(len(rows), 24)
            self.assertEqual(rows[0]["t"], m.utc_ms(day))
            self.assertEqual(rows[-1]["t"], m.utc_ms(day)+23*m.HOUR_MS)
            self.assertEqual(rows[0]["confirm"], "1")

    def test_after_timestamp_is_next_utc_midnight_and_hour_bar(self):
        seen = []
        def fetch(url):
            seen.append(url)
            return public_reply(url)
        m.build_day("2026-11-05", fetch=fetch, captured_at="2026-11-10T00:00:00Z")
        self.assertIn("instId=BTC-USDC", seen[0])
        self.assertIn("bar=1H", seen[0])
        self.assertIn("after=" + str(m.utc_ms("2026-11-06")), seen[0])
        self.assertEqual(len(seen), 1)

    def test_dates_are_strictly_whitelisted(self):
        with self.assertRaises(m.EvidenceError):
            m.build_day("2026-11-09", fetch=lambda _: b"{}")

    def test_malformed_ohlc_rejected(self):
        with self.assertRaisesRegex(m.EvidenceError, "OHLC invalid"):
            m.extract_day(sample("2026-11-08", bad_ohlc=9), "2026-11-08")

    def test_unclosed_utc_hour_rejected(self):
        with self.assertRaisesRegex(m.EvidenceError, "Unclosed"):
            m.extract_day(sample("2026-11-08", open_candle=17), "2026-11-08")

    def test_missing_hour_rejected(self):
        with self.assertRaisesRegex(m.EvidenceError, "Missing 1/24"):
            m.extract_day(sample("2026-11-05", missing=12), "2026-11-05")

    def test_duplicate_hour_rejected(self):
        with self.assertRaisesRegex(m.EvidenceError, "Duplicate"):
            m.extract_day(sample("2026-11-05", duplicate=12), "2026-11-05")

    def test_zero_volume_allowed(self):
        rows = m.extract_day(sample("2026-11-05", zero_volume=8), "2026-11-05")
        self.assertEqual(rows[8]["v_btc"], "0")

    def test_invalid_utc_or_row_shape_rejected(self):
        s = sample("2026-11-05")
        s[23][0] = str(m.utc_ms("2026-11-05")+3000)
        with self.assertRaisesRegex(m.EvidenceError,"Non-hourly UTC"):
            m.extract_day(s, "2026-11-05")
        s = sample("2026-11-05")
        s[23].pop()
        with self.assertRaisesRegex(m.EvidenceError,"nine columns"):
            m.extract_day(s, "2026-11-05")

    def test_invalid_response_not_accepted_as_success(self):
        for value in (None, {}, {"code": "51000", "data": []}, {"code":"0"}):
            with self.assertRaises(m.EvidenceError):
                m.validate_api(value)

    def test_failed_network_never_publishes_partial_files(self):
        def fetch(url):
            if str(m.utc_ms("2026-11-09")) in url:
                return json.dumps({"code":"0","data":sample("2026-11-08",missing=9)}).encode()
            return public_reply(url)
        with tempfile.TemporaryDirectory() as td:
            with self.assertRaises(m.EvidenceError):
                m.publish(td,fetch=fetch)
            self.assertEqual(list(Path(td).rglob("*.json")),[])

    def test_success_two_day_manifest_and_sha256(self):
        with tempfile.TemporaryDirectory() as td:
            m.publish(td,fetch=public_reply,captured_at="2026-11-10T00:00:00Z")
            idx = json.loads((Path(td)/"index.json").read_text())
            self.assertEqual(idx["total_candles"],48)
            self.assertEqual(idx["complete_days"],2)
            self.assertFalse(idx["orders_enabled"])
            for f in idx["files"]:
                b=(Path(td)/f["file"]).read_bytes()
                self.assertEqual(hashlib.sha256(b).hexdigest(),f["sha256"])
                payload=json.loads(b)
                self.assertEqual(payload["hour_count"],24)
                self.assertEqual(payload["venue"],"OKX")
                self.assertEqual(payload["instrument"],"BTC-USDC")
                self.assertFalse(payload["private_account_access"])
            # Repeat is idempotent: recorded payloads remain immutable.
            before=(Path(td)/idx["files"][0]["file"]).read_bytes()
            m.publish(td,fetch=public_reply,captured_at="2026-11-12T00:00:00Z")
            self.assertEqual(before,(Path(td)/idx["files"][0]["file"]).read_bytes())

    def test_prior_source_conflict_cannot_be_overwritten(self):
        with tempfile.TemporaryDirectory() as td:
            m.publish(td,fetch=public_reply,captured_at="2026-11-10T00:00:00Z")
            fp=Path(td)/"btc-usdc-okx-1h-2026-11-08.json"
            doc=json.loads(fp.read_text())
            doc["rows"][0]["c"]="999999"
            fp.write_text(json.dumps(doc))
            with self.assertRaisesRegex(m.EvidenceError,"Refuse to overwrite"):
                m.publish(td,fetch=public_reply,captured_at="2026-11-12T00:00:00Z")

    def test_no_authentication_or_order_endpoints_in_source(self):
        source=Path(m.__file__).read_text()
        self.assertNotIn("/api/v5/trade/",source)
        self.assertNotIn("Authorization",source)
        self.assertNotIn("apiKey",source)


if __name__ == "__main__":
    unittest.main()
