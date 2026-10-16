"""Offline deterministic tests for the public-only BTC/CT automatic PAPER observer."""
import importlib.util
import json
import pathlib
import tempfile
import unittest

TARGET = pathlib.Path(__file__).resolve().parent / "btc_ct_auto_observer.py"
SPEC = importlib.util.spec_from_file_location("btc_ct_auto", TARGET)
m = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(m)
H = m.HOUR
NOW = 1792141200000  # exact completed-hour boundary in UTC


def rows(n=55, first=NOW - 55 * H, price=100):
    return [{"t": first+i*H, "o":price, "h":price*1.002, "l":price*.998,
             "c":price, "v":10.0} for i in range(n)]


def binance(r):
    return [[x["t"],str(x["o"]),str(x["h"]),str(x["l"]),str(x["c"]),
             str(x["v"]),x["t"]+H-1, "0"] for x in r]


def okx(r):
    return {"code":"0","data":[[str(x["t"]),str(x["o"]),str(x["h"]),
            str(x["l"]),str(x["c"]),str(x["v"]),"0","0","1"] for x in reversed(r)]}


class AutoPaperTests(unittest.TestCase):
    def test_schema_and_isolation(self):
        state=m.blank()
        self.assertFalse(state["orders_enabled"])
        self.assertFalse(state["account_access"])
        self.assertTrue(state["simulation_only"])
        self.assertEqual(set(state["markets"]), {"BTC","CT"})
        self.assertLess(m.CONFIG["paper_notional_usdt"], 10)
        with self.assertRaises(ValueError):
            m.public_json("https://www.okx.com/api/v5/trade/order")
        with self.assertRaises(ValueError):
            m.public_json("https://example.com/bitcoin")

    def test_no_unclosed_candles_and_instrument_identity(self):
        b=rows()
        fake=binance(b)+[[NOW,100,101,99,100,10,NOW+H-1]]
        accepted=m.parse_btc(fake,NOW)
        self.assertEqual(len(accepted),len(b))
        o=okx(b)
        o["data"].append([str(NOW), "100","101","99","100","10","0","0","0"])
        self.assertEqual(len(m.parse_ct(o,NOW)),len(b))
        self.assertEqual(m.acquire("CT",NOW,lambda u:okx(b))[-1]["c"],100)
        self.assertEqual(m.acquire("BTC",NOW,lambda u:binance(b))[-1]["c"],100)
        with self.assertRaises(ValueError):
            m.acquire("XRP",NOW,lambda u:[])
        bad=rows();bad[-12]["t"]+=2*H
        with self.assertRaisesRegex(ValueError,"Missing"):
            m.acquire("BTC",NOW,lambda u:binance(bad))
        with self.assertRaisesRegex(ValueError,"Stale"):
            m.acquire("CT",NOW,lambda u:okx(rows(first=NOW-100*H)))

    def test_rebound_and_breakout_signals(self):
        dip=rows()
        for idx, price in [(-3,99),(-2,95),(-1,96)]:
            x=dip[idx]
            x.update(o=price, h=price*1.002,l=price*.998,c=price,v=100 if idx==-1 else 10)
        self.assertEqual(m.choose_signal(dip)["kind"],"REBOUND")
        trending=rows()
        for i in range(35,54):
            price=100+(i-35)*.2
            trending[i].update(o=price,h=price*1.002,l=price*.998,c=price,v=10)
        trending[-1].update(o=104,h=111,l=103.9,c=110,v=100)
        self.assertEqual(m.choose_signal(trending)["kind"],"BREAKOUT")
        self.assertEqual(m.choose_signal(rows())["kind"],"WAIT")

    def test_paper_lifecycle_and_no_same_bar_reentry(self):
        s=m.blank()
        r=rows()
        signal=lambda _: {"kind":"REBOUND","why":"synthetic closed candle"}
        e=m.advance(s,"CT",r,signal)
        self.assertEqual(e["type"],"PAPER_SIGNAL")
        self.assertFalse(e["executed_order"])
        self.assertIsNone(m.advance(s,"CT",r,signal))
        r2=r[1:]+[{"t":r[-1]["t"]+H,"o":100,"h":101,"l":99,"c":100,"v":10}]
        e=m.advance(s,"CT",r2,signal)
        self.assertEqual(e["type"],"PAPER_OPEN")
        self.assertIsNotNone(s["markets"]["CT"]["open"])
        r3=r2[1:]+[{"t":r2[-1]["t"]+H,"o":104,"h":105,"l":103,"c":104,"v":10}]
        e=m.advance(s,"CT",r3,signal)
        self.assertEqual(e["type"],"EXIT_PAPER")
        self.assertEqual(e["reason"],"TAKE_PROFIT")
        self.assertGreater(e["net_usdt"],0)
        self.assertEqual(s["markets"]["CT"]["closed"],1)
        self.assertIsNone(s["markets"]["CT"]["open"])
        self.assertIsNone(m.advance(s,"CT",r3,signal))
        self.assertEqual(s["markets"]["BTC"]["closed"],0)

    def test_gap_refuses_fabricated_fills(self):
        s=m.blank()
        r=rows()
        m.advance(s,"BTC",r,lambda _:{"kind":"REBOUND","why":"test"})
        gap=r[3:]+[{"t":r[-1]["t"]+4*H,"o":100,"h":101,"l":99,"c":100,"v":10}]
        e=m.advance(s,"BTC",gap)
        self.assertEqual(e["type"],"GAP_PAUSE")
        self.assertIsNone(s["markets"]["BTC"]["pending"])

    def test_schedule_run_is_public_only_and_idempotent(self):
        generated=rows()
        def fake_reader(url):
            if "BTCUSDT" in url:return binance(generated)
            if "CT-USDT" in url:return okx(generated)
            raise AssertionError("unapproved endpoint")
        with tempfile.TemporaryDirectory() as t:
            out=pathlib.Path(t)
            state=m.run(now=NOW,reader=fake_reader,out=out)
            self.assertEqual(len(state["events"]),2)
            self.assertEqual(state["markets"]["BTC"]["decision"],"WAIT")
            self.assertEqual(state["markets"]["CT"]["decision"],"WAIT")
            state2=m.run(now=NOW,reader=fake_reader,out=out)
            self.assertEqual(len(state2["events"]),2)
            files=list((out/"journal").glob("*.json"))
            self.assertEqual(len(files),1)
            self.assertEqual(len(json.loads(files[0].read_text())),2)
            self.assertFalse(state2["orders_enabled"])
            self.assertFalse(state2["account_access"])

    def test_failure_does_not_invent_price_or_trade(self):
        with tempfile.TemporaryDirectory() as t:
            state=m.run(now=NOW,reader=lambda _: (_ for _ in ()).throw(OSError("blocked")),out=pathlib.Path(t))
            for name in m.PAIR:
                self.assertIsNone(state["markets"][name]["last_price_usdt"])
                self.assertEqual(state["markets"][name]["decision"],"SOURCE_UNAVAILABLE")
                self.assertIsNone(state["markets"][name]["open"])
            self.assertEqual(state["events"],[])


if __name__=="__main__":
    unittest.main()
