#!/usr/bin/env python3
"""Offline fail-closed OKX/Bitget candidate identity checks."""
import unittest
import discover_historical_spot_venues as m

COIN={"id":"okb","symbol":"OKB","rank":42,"name":"OKB"}
def ticker(coin="okb",venue="okx",base="OKB",quote="USDT"):
    return {"coin_id":coin,"base":base,"target":quote,
            "target_coin_id":"tether" if quote=="USDT" else "usd-coin",
            "market":{"identifier":venue},"is_anomaly":False,
            "is_stale":False,"trust_score":"green"}

class AlternativeMarketTests(unittest.TestCase):
    def test_exact_coin_id_exchange_and_quote(self):
        x=m.exact_candidates([ticker()],COIN,"okx")
        self.assertEqual(len(x),1)
        self.assertEqual(x[0]["market_pair_candidate"],"OKB-USDT")
        self.assertFalse(x[0]["exchange_instrument_confirmed"])
        self.assertFalse(x[0]["native_1m_month_confirmed"])
        for bad in (ticker(coin="someone-else"),ticker(base="OTHER"),
                    ticker(quote="BTC"),ticker(venue="bitget"),
                    {**ticker(),"is_anomaly":True},
                    {**ticker(),"is_stale":True},
                    {**ticker(),"trust_score":"red"},
                    {**ticker(),"coin_id":None}):
            self.assertEqual(m.exact_candidates([bad],COIN,"okx"),[])
        b=m.exact_candidates([ticker(venue="bitget",quote="USDC")],COIN,"bitget")
        self.assertEqual(b[0]["quote"],"USDC")
        self.assertEqual(b[0]["market_pair_candidate"],"OKBUSDC")
    def test_source_error_and_pagination_fail_closed(self):
        def getter(coin,venue,page):
            if venue=="bitget":raise OSError("API blocked")
            return [ticker()]
        status,proof,_=m.inspect(COIN,getter)
        self.assertEqual(status,"source_unavailable")
        self.assertEqual(proof,[])
        status,proof,_=m.inspect(COIN,lambda *args:[ticker()]*100)
        self.assertEqual(status,"source_pagination_incomplete")
        self.assertEqual(proof,[])
    def test_batch_is_bounded_resume_and_has_no_archive_claim(self):
        other={"id":"monero","symbol":"XMR","rank":14,"name":"Monero"}
        queue=[other,COIN]
        def check(a):
            if a["id"]=="okb":
                return "exact_id_market_candidates",m.exact_candidates([ticker()],a,"okx"),1
            return "market_not_confirmed",[],2
        first=m.process(queue,batch=1,checker=check,delay=0)
        self.assertEqual(first["checked_count"],1)
        second=m.process(queue,first,batch=1,checker=check,delay=0)
        self.assertEqual(second["checked_count"],2)
        self.assertEqual(second["market_candidate_count"],1)
        self.assertTrue(second["market_only_not_archived"])
        with self.assertRaisesRegex(ValueError,"Unbounded"):
            m.process(queue,batch=250,checker=check,delay=0)
        last=m.process(queue,second,batch=1,checker=check,delay=0,excluded={"monero"})
        self.assertEqual(last["checked_count"],1)
    def test_real_catalogue_identity_alignment_without_network(self):
        queue,archived=m.universe()
        self.assertEqual(len(queue),250)
        self.assertTrue(50<=len(archived)<250)
        self.assertIn("bitcoin",archived)
        self.assertIn("okb",{a["id"] for a in queue if a["id"] not in archived})

if __name__=="__main__":
    unittest.main(verbosity=2)
