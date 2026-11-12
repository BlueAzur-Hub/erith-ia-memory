"""Offline synthetic regression tests: native Bitstamp BTC+ETH 50/50 research, no account/order."""
import importlib.util
import io
import json
import pathlib
import tempfile
import unittest
from datetime import date,datetime,timedelta,timezone
from unittest.mock import patch
from urllib.parse import parse_qs,urlparse

FILE=pathlib.Path(__file__).with_name(
    "SEVEN_HEAVEN_BTC_ETH_50_50_NATIVE_BITSTAMP_VS_BINANCE_REPLAY_2026_11_12.py")
s=importlib.util.spec_from_file_location("seven_dual_native",FILE)
mod=importlib.util.module_from_spec(s)
s.loader.exec_module(mod)
eng=mod.engine_from(pathlib.Path(__file__).with_name(
    "SEVEN_HEAVEN_ETH_BITSTAMP_NATIVE_REPLAY_2026_11_12.py"))


def synth():
    begin=datetime(2023,4,1,tzinfo=timezone.utc)
    rows=[]
    for i in range(1310):
        v=10000+i*3+(100 if i%12<6 else -80)
        rows.append({"timestamp":str(int((begin+timedelta(days=i)).timestamp())),
                     "open":str(v),"high":str(v+30),"low":str(v-30),
                     "close":str(v+3),"volume":"12"})
    return rows


class ReplayChecks(unittest.TestCase):
    def test_two_page_read_only_btc_pagination(self):
        source=synth()
        count=[]
        def fake(request,timeout):
            self.assertIn("/ohlc/btcusd/",request.full_url)
            ts=int(parse_qs(urlparse(request.full_url).query)["end"][0])
            chosen=[x for x in source if int(x["timestamp"])<=ts][-1000:]
            count.append(len(chosen))
            return io.BytesIO(json.dumps({"data":{"pair":"BTC/USD","ohlc":chosen}}).encode())
        with patch("urllib.request.urlopen",side_effect=fake):
            rows,receipts=mod.collect_btc_native(eng)
        self.assertEqual(count,[1000,310])
        self.assertEqual(len(rows),1310)
        self.assertEqual(len(receipts),2)
        self.assertEqual(rows[0]["date"],"2023-04-01")
        self.assertEqual(rows[-1]["date"],"2026-10-31")

    def test_unexpected_pair_rejected(self):
        def fake(request,timeout):
            return io.BytesIO(json.dumps({"data":{"pair":"ETH/USD","ohlc":[synth()[0]]}}).encode())
        with patch("urllib.request.urlopen",side_effect=fake):
            with self.assertRaises(ValueError):
                mod.collect_btc_native(eng)

    def test_portfolio_partition_and_no_rebalance(self):
        a={"curve":[],"trades":2}
        b={"curve":[],"trades":3}
        begin=date(2024,1,1)
        for i in range(1035):
            dt=(begin+timedelta(days=i)).isoformat()
            a["curve"].append({"date":dt,"equity":1200+i/10,"exposed":int(i%2==0)})
            b["curve"].append({"date":dt,"equity":800-i/20,"exposed":int(i%3==0)})
        result,rows=mod.combine(a,b)
        self.assertEqual(result["trades"],5)
        self.assertEqual(result["days_both_cash"]+result["days_both_exposed"]+
                         result["days_btc_only"]+result["days_eth_only"],1035)
        self.assertAlmostEqual(rows[-1]["equity"],(a["curve"][-1]["equity"]+
                                                    b["curve"][-1]["equity"])/2)

    def test_csv_is_lf_and_hashable(self):
        with tempfile.TemporaryDirectory() as folder:
            p=pathlib.Path(folder)/"sample.csv"
            mod.write_csv(p,["date","value"],[{"date":"2024-01-01","value":1}])
            data=p.read_bytes()
            self.assertNotIn(bytes((13,)),data)
            self.assertEqual(data.count(bytes((10,))),2)

    def test_drawdown_math(self):
        self.assertAlmostEqual(mod.max_drawdown([1000,1100,880]),-20)
        self.assertAlmostEqual(mod.corr([1,2,3],[2,4,6]),1)


if __name__ == "__main__":
    unittest.main()
