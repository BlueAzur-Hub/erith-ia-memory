#!/usr/bin/env python3
"""Regression checks: Coinbase and Kraken evidence can't be fabricated or confused with Binance."""
import gzip
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from urllib.parse import parse_qs,urlparse

import compare_btc_cross_venue as m


def coinbase_response():
    # Synthetic 80 native OHLCV rows for offline test only.
    return {"status":"http_200","sha256":"a"*64,
      "json":[[int((m.START+i*m.MINUTE)/1000),
          27900.0,28000.0,27920.0,27950.0,1.25]
        for i in range(80)]}


def kraken_trade(t):
    return {"status":"http_200","sha256":"b"*64,
      "json":{"error":[],"result":{
        "XXBTZUSD":[["27950.0","0.025",(t+3000)/1000,"b","m","",17]],
        "last":str((t+3000)*1_000_000)}}}


class CrossVenueChecks(unittest.TestCase):
    def test_binance_80_minutes_exact_and_sha(self):
        x=m.source_check()
        self.assertEqual(len(x),64)
        self.assertEqual(m.EXPECTED,80)
        self.assertEqual(m.iso(m.START),"2023-03-24T12:40:00Z")
        self.assertEqual(m.iso(m.END),"2023-03-24T14:00:00Z")

    def test_coinbase_all_80_real_native_minutes_and_quotes(self):
        a=m.check_coinbase(coinbase_response())
        self.assertEqual(a["pair"],"BTC-USD")
        self.assertEqual(a["quote"],"USD")
        self.assertEqual(a["minute_candles"],80)
        self.assertEqual(a["positive_volume_minutes"],80)
        self.assertEqual(a["missing_minutes"],0)
        self.assertTrue(a["all_80_minutes_present"])
        self.assertEqual(a["conclusion"],
            "historic_btc_usd_trading_verified_entire_interval")

    def test_coinbase_bogus_candle_rejected(self):
        bad=coinbase_response()
        bad["json"][0][2]=27800.0
        with self.assertRaisesRegex(ValueError,"Invalid Coinbase"):
            m.check_coinbase(bad)
        dup=coinbase_response()
        dup["json"].append(dup["json"][0])
        with self.assertRaisesRegex(ValueError,"duplicate"):
            m.check_coinbase(dup)

    def test_unavailable_coinbase_cannot_be_called_no_trading(self):
        x=m.check_coinbase({"status":"http_restricted","http_status":403})
        self.assertEqual(x["conclusion"],"inconclusive_source_unavailable")
        self.assertEqual(x["positive_volume_minutes"],0)

    def test_kraken_exact_historic_trade_and_source(self):
        timepoint=m.START + 39*m.MINUTE
        x=m.check_kraken_probe(timepoint,kraken_trade(timepoint))
        self.assertEqual(x["source_status"],"http_200")
        self.assertEqual(x["trades_at_exact_minute"],1)
        self.assertTrue(x["verified_trade_in_this_minute"])
        self.assertEqual(x["example"]["price_usd"],"27950.0")
        url=urlparse(m.kraken_url(timepoint))
        q=parse_qs(url.query)
        self.assertEqual(q["pair"],["XBTUSD"])
        self.assertEqual(q["since"],[str(timepoint*1_000_000)])

    def test_kraken_unrelated_trade_is_not_proof(self):
        t=m.START + m.MINUTE
        x=m.check_kraken_probe(t,kraken_trade(t+10*m.MINUTE))
        self.assertFalse(x["verified_trade_in_this_minute"])
        self.assertEqual(x["conclusion"],
            "no_exact_minute_trade_in_first_page_not_proof_of_no_trading")

    def test_kraken_api_error_is_inconclusive(self):
        obj={"status":"http_200","json":{"error":["EGeneral:Permission denied"],
              "result":{}}}
        x=m.check_kraken_probe(m.START,obj)
        self.assertEqual(x["conclusion"],"inconclusive_kraken_api_error")

    def test_entire_audit_preserves_binance_and_sources(self):
        def mock(url,base):
            if base==m.COINBASE_ENDPOINT:
                return coinbase_response()
            t=int(parse_qs(urlparse(url).query)["since"][0])//1_000_000
            return kraken_trade(t)
        with TemporaryDirectory() as tmp:
            result=m.audit(output=tmp,fetch=mock)
            saved=json.loads((Path(tmp)/"index.json").read_text())
        self.assertEqual(result["coinbase_exchange"]["positive_volume_minutes"],80)
        self.assertEqual(result["kraken_spot"]["exact_minute_trade_probes"],5)
        self.assertTrue(result["other_venues_trading_during_binance_outage"])
        self.assertEqual(saved["binance_missing_1m_recovered"],0)
        self.assertTrue(saved["comparing_not_replacing_binance_bars"])


if __name__=="__main__": unittest.main(verbosity=2)
