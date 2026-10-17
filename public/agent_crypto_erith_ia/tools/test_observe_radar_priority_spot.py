"""Offline verification for prospective public Spot ICNT / FLUID archives."""
import datetime as dt
import json
import pathlib
import tempfile
import unittest
from observe_radar_priority_spot import (
    HOUR, SCHEMA, TARGETS, observe, save, validate_book, validate_candles
)

NOW = dt.datetime(2026, 10, 18, 4, 20, tzinfo=dt.timezone.utc)
MS = int(NOW.timestamp() * 1000)
LAST = (MS // HOUR - 1) * HOUR

def candles(venue):
    values = []
    for i in range(26):
        t = LAST - (25-i) * HOUR
        c = .15 + .001 * i if venue == "Bitget" else 2.0 + .01 * i
        row = [str(t), str(c), str(c+.002), str(c-.002), str(c),
               str(1000+i), str(450+i)]
        if venue == "OKX":
            row = [*row, str(700+i), "1"]
        values.append(row)
    return values

def fetch(venue, path, params):
    pair = "ICNTUSDT" if venue == "Bitget" else "FLUID-USDT"
    if venue == "Bitget":
        assert params.get("category") == "SPOT" and params.get("symbol") == pair
        if path.endswith("instruments"):
            return [{"category":"SPOT","symbol":pair,"baseCoin":"ICNT",
                     "quoteCoin":"USDT","status":"online"}]
        if path.endswith("candles"):
            return candles(venue)
        if path.endswith("orderbook"):
            return {"ts":str(MS-20000),"b":[["0.174","500"]],"a":[["0.176","400"]]}
    else:
        assert params.get("instId") == pair
        if path.endswith("instruments"):
            return [{"instType":"SPOT","instId":pair,"baseCcy":"FLUID",
                     "quoteCcy":"USDT","state":"live"}]
        if path.endswith("candles"):
            return candles(venue)
        if path.endswith("books"):
            return [{"ts":str(MS-20000),"bids":[["2.24","50","1"]],
                     "asks":[["2.26","60","1"]]}]
    raise AssertionError(path)

class PrioritySpotTests(unittest.TestCase):
    def test_both_pairs_and_paper_storage(self):
        with tempfile.TemporaryDirectory() as folder:
            for target in TARGETS:
                row=observe(target,fetch,NOW)
                self.assertEqual(row["quote"],"USDT")
                self.assertFalse(row["executed_order"])
                self.assertFalse(row["orders_enabled"])
                self.assertFalse(row["identity_status"].endswith("VERIFIED"))
                self.assertTrue(row["candles"]["last_21_bars_contiguous"])
                self.assertTrue(save(row,pathlib.Path(folder)))
                self.assertFalse(save(row,pathlib.Path(folder)))
                state=json.loads((pathlib.Path(folder)/target["symbol"].lower()/"state.json").read_text())
                self.assertEqual(state["schema"],SCHEMA)
                self.assertEqual(len(state["recent_observations"]),1)
                self.assertEqual(state["market"],target["pair"])
                self.assertFalse(state["identity_market_pair_certified"])
    def test_no_forged_contract_or_futures_instrument(self):
        def wrong(venue,path,params):
            if path.endswith("instruments"):
                if venue=="Bitget":
                    return [{"category":"FUTURES","symbol":"ICNTUSDT",
                             "baseCoin":"ICNT","quoteCoin":"USDT","status":"online"}]
                return [{"instType":"SWAP","instId":"FLUID-USDT",
                         "baseCcy":"FLUID","quoteCcy":"USDT","state":"live"}]
            return fetch(venue,path,params)
        for target in TARGETS:
            with self.assertRaisesRegex(ValueError,"Spot non certifié"):
                observe(target,wrong,NOW)
    def test_reject_gaps_stale_candles_and_open_okx_candle(self):
        for venue in ["Bitget","OKX"]:
            rows=candles(venue)
            rows[12][0]=str(int(rows[12][0])+30000)
            with self.assertRaisesRegex(ValueError,"discontinues"):
                validate_candles(rows,NOW,venue)
            rows=candles(venue)
            for row in rows: row[0]=str(int(row[0])-3*HOUR)
            with self.assertRaisesRegex(ValueError,"périmée|absente"):
                validate_candles(rows,NOW,venue)
        rows=candles("OKX")
        for row in rows: row[8]="0"
        with self.assertRaisesRegex(ValueError,"moins de 21"):
            validate_candles(rows,NOW,"OKX")
    def test_no_future_crossed_or_wrong_quote_market(self):
        with self.assertRaisesRegex(ValueError,"futur ou périmé"):
            validate_book({"ts":str(MS-300000),"b":[[".17","1"]],
                           "a":[[".18","1"]]},NOW,"Bitget")
        with self.assertRaisesRegex(ValueError,"croisé"):
            validate_book([{"ts":str(MS-1000),"bids":[["2.3","20"]],
                            "asks":[["2.2","20"]]}],NOW,"OKX")
        with tempfile.TemporaryDirectory() as folder:
            fake=observe(TARGETS[0],fetch,NOW)
            fake["quote"]="USD"
            with self.assertRaisesRegex(ValueError,"incompatible"):
                save(fake,pathlib.Path(folder))
if __name__=="__main__":
    unittest.main()
