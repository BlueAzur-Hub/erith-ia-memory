#!/usr/bin/env python3
"""Offline fail-closed OKX/Bitget candidate identity checks."""
import unittest
import datetime as dt
import json
import tempfile
from pathlib import Path
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
        # A complete OKX exact-ID proof remains valid even when Bitget is down.
        self.assertEqual(status,"exact_id_market_candidates")
        self.assertEqual(len(proof),1)
        self.assertEqual(proof[0]["exchange"],"okx")
        status,proof,_=m.inspect(COIN,lambda *args:[ticker()]*100)
        self.assertEqual(status,"source_pagination_incomplete")
        self.assertEqual(proof,[])
        status,proof,_=m.inspect(COIN,lambda *args:(_ for _ in ()).throw(OSError("both unavailable")))
        self.assertEqual(status,"source_unavailable")
        self.assertEqual(proof,[])
    def test_exchange_fallback_only_approves_explicit_original_coin_id(self):
        def primary(coin,venue,page):return []
        def alternative(coin,venue,page):
            return [ticker(coin="okb",venue=venue)] if venue=="okx" else []
        status,proof,pages=m.inspect(COIN,primary,alternative)
        self.assertEqual(status,"exact_id_market_candidates")
        self.assertEqual(len(proof),1)
        self.assertEqual(proof[0]["coin_id"],"okb")
        self.assertEqual(pages,4)
        status,proof,_=m.inspect(COIN,primary,
            lambda coin,venue,page:[ticker(coin="wrong",venue=venue)])
        self.assertEqual(status,"market_not_confirmed")
        self.assertFalse(proof)

    def test_fallback_after_primary_api_failure_still_enforces_both_markets(self):
        def fails(coin,venue,page):raise OSError("first CoinGecko route unavailable")
        status,proof,_=m.inspect(COIN,fails,
             lambda coin,venue,page:[ticker(coin="okb",venue=venue)])
        self.assertEqual(status,"exact_id_market_candidates")
        self.assertEqual(len(proof),2)
        self.assertTrue(all(not item["exchange_instrument_confirmed"]
                            and not item["native_1m_month_confirmed"] for item in proof))
        status,proof,_=m.inspect(COIN,fails,
             lambda coin,venue,page:(_ for _ in ()).throw(OSError("second unavailable")))
        self.assertEqual(status,"source_unavailable")
        self.assertFalse(proof)

    def test_official_instrument_priority_is_only_a_work_queue_hint(self):
        queue=[{"id":"asset-"+str(i),"rank":i,"symbol":"SYM"+str(i),"name":"Test"}
               for i in range(1,251)]
        archived={"asset-"+str(i) for i in range(3,251)}
        payload={"schema":"aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1",
                 "ranked":250,"archived_assets_at_audit":248,
                 "assets":[{"id":"asset-1","rank":1,"symbol":"SYM1","instruments":[]},
                           {"id":"asset-2","rank":2,"symbol":"SYM2",
                            "instruments":[{"exchange":"okx","instrument":"SYM2-USDT"}]}]}
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/"spot.json"
            path.write_text(json.dumps(payload))
            preferred=m.official_priority(queue,archived,path)
            self.assertEqual(preferred,{"asset-2"})
            selected=[]
            def checked(asset):
                selected.append(asset["id"])
                return "market_not_confirmed",[],1
            result=m.process(queue,batch=1,checker=checked,delay=0,
                             excluded=archived,preferred=preferred)
            self.assertEqual(selected,["asset-2"])
            self.assertEqual(result["market_candidate_count"],0)
            payload["assets"][1]["symbol"]="TAMPERED"
            path.write_text(json.dumps(payload))
            with self.assertRaisesRegex(ValueError,"does not belong"):
                m.official_priority(queue,archived,path)
            payload["archived_assets_at_audit"]=247
            path.write_text(json.dumps(payload))
            self.assertEqual(m.official_priority(queue,archived,path),set())

    def test_official_priority_survives_real_archival_growth_without_symbol_proof(self):
        """A 104-asset audit stays useful at 106, but only as a work queue."""
        queue=[{"id":f"asset-{i}","rank":i,"symbol":f"SYM{i}","name":"Test"}
               for i in range(1,251)]
        archive_before={f"asset-{i}" for i in range(3,251)}
        doc={"schema":"aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1",
             "ranked":250,"archived_assets_at_audit":248,
             "assets":[
                 {"id":"asset-1","rank":1,"symbol":"SYM1",
                  "instruments":[{"venue":"bitget","instrument":"SYM1USDT"}]},
                 {"id":"asset-2","rank":2,"symbol":"SYM2",
                  "instruments":[{"venue":"bitget","instrument":"SYM2USDT"}]}
             ]}
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/"official.json"
            path.write_text(json.dumps(doc))
            self.assertEqual(m.official_priority(queue,archive_before,path),
                             {"asset-1","asset-2"})
            archive_after=archive_before|{"asset-2"}
            self.assertEqual(m.official_priority(queue,archive_after,path),
                             {"asset-1"})
            self.assertEqual(m.official_priority(queue,set(),path),set())
            # Never allow a snapshot that excludes an unarchived new member.
            doc["assets"][0]["id"]="another-coin"
            path.write_text(json.dumps(doc))
            with self.assertRaisesRegex(ValueError,"does not belong"):
                m.official_priority(queue,archive_after,path)

    def test_retries_rotate_oldest_failed_assets_first(self):
        now=dt.datetime.now(dt.timezone.utc)
        queue=[{"id":f"coin-{i}","rank":i,"symbol":f"C{i}","name":"Test"}
               for i in range(1,9)]
        prior={"schema":m.SCHEMA,"results":[
            {"id":"coin-1","rank":1,"symbol":"C1","status":"source_unavailable",
             "markets":[],"checked_at":(now-dt.timedelta(hours=2)).isoformat()},
            {"id":"coin-2","rank":2,"symbol":"C2","status":"source_unavailable",
             "markets":[],"checked_at":(now-dt.timedelta(hours=5)).isoformat()},
            {"id":"coin-3","rank":3,"symbol":"C3","status":"source_unavailable",
             "markets":[],"checked_at":(now-dt.timedelta(hours=3)).isoformat()},
            {"id":"coin-4","rank":4,"symbol":"C4","status":"source_unavailable",
             "markets":[],"checked_at":(now-dt.timedelta(minutes=7)).isoformat()}
        ]}
        scanned=[]
        result=m.process(queue,prior,batch=6,delay=0,
            checker=lambda a:(scanned.append(a["id"]) or
                  ("market_not_confirmed",[],1)),
            preferred={"coin-1","coin-5"})
        self.assertEqual(scanned[:2],["coin-2","coin-3"])
        self.assertEqual(scanned[2:],["coin-5","coin-6","coin-7","coin-8"])
        self.assertNotIn("coin-4",scanned)
        self.assertEqual(result["market_candidate_count"],0)

    def test_failing_bitget_never_erases_okx_source_proof(self):
        def get(coin,venue,page):
            if venue=="bitget":raise OSError("CoinGecko unavailable")
            return [ticker()]
        result=m.inspect(COIN,get)
        self.assertEqual(result[0],"exact_id_market_candidates")
        self.assertEqual(result[1][0]["market_pair_candidate"],"OKB-USDT")
        self.assertTrue(all(not x["native_1m_month_confirmed"] for x in result[1]))

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
    def test_aged_source_errors_get_fair_retries_without_starving_new_assets(self):
        now=dt.datetime.now(dt.timezone.utc)
        old=(now-dt.timedelta(hours=4)).isoformat()
        fresh=(now-dt.timedelta(minutes=5)).isoformat()
        queue=[{"id":f"coin-{n}","rank":n,"symbol":f"C{n}","name":f"Coin {n}"}
               for n in range(1,10)]
        prior={"schema":m.SCHEMA,"results":[
            {"id":"coin-1","rank":1,"symbol":"C1","status":"source_unavailable",
             "markets":[],"checked_at":old},
            {"id":"coin-2","rank":2,"symbol":"C2","status":"source_unavailable",
             "markets":[],"checked_at":fresh}]}
        seen=[]
        def check(a):
            seen.append(a["id"])
            return "market_not_confirmed",[],1
        result=m.process(queue,prior,batch=6,checker=check,delay=0,
                         preferred={"coin-1","coin-3","coin-4"})
        self.assertEqual(seen[0],"coin-1")
        self.assertEqual(seen[1:3],["coin-3","coin-4"])
        self.assertNotIn("coin-2",seen)
        self.assertEqual(result["checked_count"],7)
        self.assertEqual(result["market_candidate_count"],0)
        self.assertTrue(result["market_only_not_archived"])

    def test_real_catalogue_identity_alignment_without_network(self):
        queue,archived=m.universe()
        self.assertEqual(len(queue),250)
        self.assertTrue(50<=len(archived)<250)
        self.assertIn("bitcoin",archived)
        self.assertIn("okb",{a["id"] for a in queue if a["id"] not in archived})

if __name__=="__main__":
    unittest.main(verbosity=2)
