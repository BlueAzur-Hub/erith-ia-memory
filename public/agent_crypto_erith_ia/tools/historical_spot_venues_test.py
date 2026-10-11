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
    def test_gate_kucoin_exact_coin_identity_and_native_pair_grammar(self):
        for venue,pair in (("gate","OKB_USDT"),("kucoin","OKB-USDT")):
            with self.subTest(venue=venue):
                verified=m.exact_candidates([ticker(venue=venue)],COIN,venue)
                self.assertEqual(len(verified),1)
                self.assertEqual(verified[0]["market_pair_candidate"],pair)
                self.assertEqual(verified[0]["coin_id"],"okb")
                self.assertFalse(verified[0]["exchange_instrument_confirmed"])
                self.assertFalse(verified[0]["native_1m_month_confirmed"])
                self.assertEqual(m.exact_candidates(
                    [ticker(coin="wrong",venue=venue)],COIN,venue),[])
                self.assertEqual(m.exact_candidates(
                    [ticker(venue=venue,base="FAKE")],COIN,venue),[])
                self.assertEqual(m.exact_candidates(
                    [{**ticker(venue=venue),"trust_score":"red"}],COIN,venue),[])

    def test_only_officially_confirmed_gate_kucoin_venues_direct_exact_id_queries(self):
        proof={"schema":"aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1",
               "ranked":250,"assets":[
                 {"id":"okb","rank":42,"symbol":"OKB",
                  "instruments":[
                    {"venue":"gate","instrument":"OKB_USDT","base":"OKB",
                     "quote":"USDT","exchange_instrument_confirmed":True},
                    {"venue":"kucoin","instrument":"OKB-USDC","base":"OKB",
                     "quote":"USDC","exchange_instrument_confirmed":True}]}]}
        self.assertEqual(m.source_venues_for(COIN,proof),("gate","kucoin"))
        seen=[]
        def get(coin,venue,page):
            seen.append((coin,venue,page))
            return [ticker(venue=venue)]
        status,owners,_=m.inspect(COIN,get,exchanges=m.source_venues_for(COIN,proof))
        self.assertEqual(status,"exact_id_market_candidates")
        self.assertEqual({x["exchange"] for x in owners},{"gate","kucoin"})
        self.assertEqual({v for _,v,_ in seen},{"gate","kucoin"})
        self.assertFalse(any(x["exchange_instrument_confirmed"] for x in owners))
        # An instrument match cannot become an owner if its name/rank moved.
        altered=json.loads(json.dumps(proof))
        altered["assets"][0]["symbol"]="NOT-OKB"
        with self.assertRaisesRegex(ValueError,"owner changed"):
            m.source_venues_for(COIN,altered)
        altered=json.loads(json.dumps(proof))
        altered["assets"][0]["instruments"][0]["instrument"]="WRONG_USDT"
        with self.assertRaisesRegex(ValueError,"Unverified official"):
            m.source_venues_for(COIN,altered)
        altered=json.loads(json.dumps(proof))
        altered["assets"][0]["instruments"][0]["exchange_instrument_confirmed"]=False
        with self.assertRaisesRegex(ValueError,"Unverified official"):
            m.source_venues_for(COIN,altered)
        self.assertEqual(m.source_venues_for(
            {"id":"other","rank":1,"symbol":"AAA","name":"Other"},proof),
            ("okx","bitget"))
        with self.assertRaisesRegex(ValueError,"market venue cohort"):
            m.inspect(COIN,get,exchanges=("gate","gate"))
        with self.assertRaisesRegex(ValueError,"market venue cohort"):
            m.inspect(COIN,get,exchanges=("untrusted",))

    def test_kraken_and_coinbase_gdax_exact_coin_id_proof_is_never_symbol_only(self):
        kraken=m.exact_candidates([ticker(venue="kraken")],COIN,"kraken")
        gdax=m.exact_candidates([ticker(venue="gdax",quote="USDC")],COIN,"coinbase")
        self.assertEqual(kraken[0]["market_pair_candidate"],"OKB/USDT")
        self.assertEqual(gdax[0]["market_pair_candidate"],"OKB-USDC")
        self.assertEqual(gdax[0]["exchange"],"coinbase")
        self.assertFalse(gdax[0]["exchange_instrument_confirmed"])
        self.assertFalse(kraken[0]["native_1m_month_confirmed"])
        self.assertEqual(m.exact_candidates([ticker(venue="coinbase")],
                                            COIN,"coinbase"),[])
        self.assertEqual(m.exact_candidates([ticker(venue="gdax",
                                        coin="unrelated")],COIN,"coinbase"),[])
        self.assertEqual(m.exact_candidates([ticker(venue="kraken",
                                        base="ANOTHER")],COIN,"kraken"),[])
        self.assertEqual(m.exact_candidates([ticker(venue="kraken",
                                        quote="BTC")],COIN,"kraken"),[])

    def test_six_venue_official_quote_pair_routes_but_not_source_ownership(self):
        proof={"schema":"aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1",
               "ranked":250,"assets":[{"id":"okb","rank":42,"symbol":"OKB",
                   "instruments":[
                    {"venue":"kraken","instrument":"OKB/USDT",
                     "base":"OKB","quote":"USDT",
                     "exchange_instrument_confirmed":True},
                    {"venue":"coinbase","instrument":"OKB-USDC",
                     "base":"OKB","quote":"USDC",
                     "exchange_instrument_confirmed":True}]}]}
        self.assertEqual(m.source_venues_for(COIN,proof),("kraken","coinbase"))
        def get(coin,venue,page):
            self.assertEqual(coin,"okb")
            self.assertEqual(page,1)
            return [ticker(venue="gdax",quote="USDC") if venue=="coinbase"
                    else ticker(venue="kraken")]
        status,proofs,_=m.inspect(COIN,get,exchanges=("kraken","coinbase"))
        self.assertEqual(status,"exact_id_market_candidates")
        self.assertEqual({z["exchange"] for z in proofs},{"kraken","coinbase"})
        self.assertTrue(all(z["coin_id"]=="okb"
                            and z["exchange_instrument_confirmed"] is False
                            and z["native_1m_month_confirmed"] is False
                            for z in proofs))
        forged=json.loads(json.dumps(proof))
        forged["assets"][0]["instruments"][0]["instrument"]="OKB-USDT"
        with self.assertRaisesRegex(ValueError,"Unverified official"):
            m.source_venues_for(COIN,forged)

    def test_coinbase_gdax_api_paths_are_explicit_and_not_a_symbol_search(self):
        from unittest.mock import patch
        class FakeResponse:
            status=200
            def __enter__(self):return self
            def __exit__(self,*args):return False
            def read(self,n):return b'{"tickers":[]}'
        with patch.object(m.urllib.request,"urlopen",return_value=FakeResponse()) as opened:
            self.assertEqual(m.fetch("okb","coinbase",1),[])
            self.assertIn("exchange_ids=gdax",opened.call_args.args[0].full_url)
            self.assertNotIn("exchange_ids=coinbase",opened.call_args.args[0].full_url)
            self.assertEqual(m.fetch_exchange("okb","coinbase",1),[])
            self.assertIn("/exchanges/gdax/tickers",
                          opened.call_args.args[0].full_url)
            self.assertIn("coin_ids=okb",opened.call_args.args[0].full_url)

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

    def test_exact_contract_proof_requires_unique_id_chain_and_spot_pair(self):
        """A token ticker is never enough: both inventories must attest one contract."""
        coin={"id":"memecore","rank":47,"symbol":"M","name":"MemeCore"}
        address="0x"+"12"*20
        coins=[{"id":f"unrelated-{i}","symbol":"u","platforms":{}}
               for i in range(1001)]
        coins.append({"id":"memecore","symbol":"m",
                      "platforms":{"ethereum":address}})
        spot_rows=[{"coin":f"OTHER{i}","chains":[]} for i in range(101)]
        spot_rows.append({"coin":"M","chains":[{"chain":"ERC20",
                          "contractAddress":address.upper()}]})
        spot={"code":"00000","data":spot_rows}
        official={"schema":"aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1",
                  "ranked":250,"assets":[{"id":"memecore","rank":47,"symbol":"M",
                   "instruments":[{"venue":"bitget","instrument":"MUSDT",
                     "base":"M","quote":"USDT",
                     "exchange_instrument_confirmed":True}]}]}
        expected=m.contract_matches([coin],set(),official,coins,spot)
        self.assertEqual(expected["memecore"]["proof_method"],
                         "exact_coin_id_matching_evm_contract")
        self.assertEqual(expected["memecore"]["market_pair_candidate"],"MUSDT")
        self.assertFalse(expected["memecore"]["native_1m_month_confirmed"])
        self.assertEqual(m.contract_matches([coin],{"memecore"},
                         official,coins,spot),{})
        same_symbol_other_id=coins[:-1]+[
            {"id":"someone-else","symbol":"m",
             "platforms":{"ethereum":address}}]
        self.assertEqual(m.contract_matches(
            [coin],set(),official,same_symbol_other_id,spot),{})
        duplicated=coins+[{"id":"other-claim","symbol":"m",
                           "platforms":{"ethereum":address}}]
        self.assertEqual(m.contract_matches([coin],set(),
                         official,duplicated,spot),{})
        wrong_network={"code":"00000","data":spot_rows[:-1]+[
            {"coin":"M","chains":[{"chain":"UNKNOWN",
                                      "contractAddress":address}]}]}
        self.assertEqual(m.contract_matches([coin],set(),official,
                         coins,wrong_network),{})
        wrong_contract={"code":"00000","data":spot_rows[:-1]+[
            {"coin":"M","chains":[{"chain":"ERC20",
                          "contractAddress":"0x"+"34"*20}]}]}
        self.assertEqual(m.contract_matches([coin],set(),official,
                         coins,wrong_contract),{})
        bad_instrument={**official,"assets":[{
            **official["assets"][0],"instruments":[]}]}
        self.assertEqual(m.contract_matches([coin],set(),
                         bad_instrument,coins,spot),{})

    def test_exact_contract_ledger_enrichment_is_idempotent_fail_closed(self):
        coin={"id":"memecore","rank":47,"symbol":"M","name":"MemeCore"}
        address="0x"+"ab"*20
        coins=[{"id":f"else-{i}","symbol":"e","platforms":{}}
               for i in range(1001)]+[
            {"id":"memecore","symbol":"m","platforms":{"ethereum":address}}]
        spot={"code":"00000","data":[
            {"coin":f"OTHER{i}","chains":[]} for i in range(101)]+[
            {"coin":"M","chains":[{"chain":"ERC20","contractAddress":address}]}]}
        official={"schema":"aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1",
                  "ranked":250,"assets":[{"id":"memecore","rank":47,"symbol":"M",
                  "instruments":[{"venue":"bitget","instrument":"MUSDT",
                   "base":"M","quote":"USDT",
                   "exchange_instrument_confirmed":True}]}]}
        empty={"schema":m.SCHEMA,"source":"CoinGecko ID",
               "results":[],"checked_count":0,"market_candidate_count":0}
        filled,added=m.enrich_contracts([coin],set(),empty,official,coins,spot)
        self.assertEqual(added,["memecore"])
        self.assertEqual(filled["checked_count"],1)
        self.assertEqual(filled["market_candidate_count"],1)
        self.assertEqual(filled["results"][0]["status"],
                         "exact_id_market_candidates")
        unchanged,added=m.enrich_contracts(
            [coin],set(),filled,official,coins,spot)
        self.assertEqual(added,[])
        self.assertEqual(unchanged["results"],filled["results"])
        with self.assertRaisesRegex(ValueError,"partial asset inventory"):
            m.contract_matches([coin],set(),official,[],spot)
        self.assertIsNone(m.contract_address("0x"+"0"*40))
        self.assertIsNone(m.contract_address("invalid"))
        self.assertIsNone(m.contract_address(123))

    def test_batch_contract_inventory_precedes_individual_ticker_budget(self):
        """A 429 from many tickers must not precede the one-shot batch proof."""
        script=Path(m.__file__).read_text(encoding="utf-8")
        self.assertLess(script.index("coingecko_inventory=public_inventory(CG_PLATFORMS"),
                        script.index("    result=process(queue,prior,"))
        self.assertLess(script.index("bitget_inventory=public_inventory(BITGET_COINS"),
                        script.index("    result=process(queue,prior,"))
        workflow=(Path(m.__file__).resolve().parents[3] /
                  ".github/workflows/agent-crypto-top250-alt-venues.yml")
        source=workflow.read_text(encoding="utf-8")
        self.assertIn("--probe --batch-size 4 --sleep 20",source)
        self.assertIn("cron: '6,21,36,51 * * * *'",source)

    def test_original_named_spot_only_qualifies_exact_frozen_native_owner(self):
        owners=[{"id":f"asset-{i}","rank":i,"name":f"Asset {i}",
                 "symbol":f"C{i}"} for i in range(1,251)]
        official_rows=[]
        for cid,rank,symbol,name,venue,quote,notice in m.NAMED_ORIGINAL_SPOT_LISTINGS:
            owners[rank-1]={"id":cid,"rank":rank,"symbol":symbol,"name":name}
            pair=symbol+("_" if venue=="gate" else "-")+quote
            official_rows.append({"id":cid,"rank":rank,"symbol":symbol,
                "instruments":[{"venue":venue,"instrument":pair,
                                "base":symbol,"quote":quote,
                                "exchange_instrument_confirmed":True}]})
        doc={"schema":m.SCHEMA,"ranked":250,"results":[],
             "checked_count":0,"market_candidate_count":0,
             "source":"Original ranked CoinGecko owner"}
        official={"schema":"aerith.public.ohlcv.spot.top250.official-instrument-candidates.v1",
                  "ranked":250,"assets":official_rows}
        result,new=m.enrich_named_original_spot(owners,set(),doc,official)
        self.assertEqual(new,[t[0] for t in sorted(
            m.NAMED_ORIGINAL_SPOT_LISTINGS,key=lambda v:v[1])])
        self.assertEqual(result["market_candidate_count"],3)
        self.assertEqual({r["id"] for r in result["results"]},set(new))
        for record in result["results"]:
            original=next(x for x in owners if x["id"]==record["id"])
            self.assertTrue(m.named_original_spot_proof(original,record["markets"][0]))
            fake=json.loads(json.dumps(record["markets"][0]))
            fake["original_named_spot_notice"]="https://other-site.invalid"
            self.assertFalse(m.named_original_spot_proof(original,fake))
            fake=dict(record["markets"][0],quote="USD")
            self.assertFalse(m.named_original_spot_proof(original,fake))
            fake=dict(record["markets"][0],coin_id="other-asset")
            self.assertFalse(m.named_original_spot_proof(original,fake))
            fake_owner={**original,"name":"Unrelated owner"}
            self.assertFalse(m.named_original_spot_proof(fake_owner,record["markets"][0]))
        unchanged,added=m.enrich_named_original_spot(owners,set(),result,official)
        self.assertEqual(added,[])
        self.assertEqual(unchanged["results"],result["results"])
        after,added=m.enrich_named_original_spot(
            owners,{m.NAMED_ORIGINAL_SPOT_LISTINGS[0][0]},result,official)
        self.assertEqual(added,[])
        self.assertEqual(after["results"],result["results"])
        tampered=json.loads(json.dumps(official))
        tampered["assets"][0]["instruments"][0]["exchange_instrument_confirmed"]=False
        rebuilt,added=m.enrich_named_original_spot(owners,set(),doc,tampered)
        self.assertEqual(len(added),2)
        misnamed=list(owners)
        original=next(x for x in owners if x["id"]=="akash-network")
        misnamed[original["rank"]-1]={**original,"name":"Fake Cloud"}
        with self.assertRaisesRegex(ValueError,"ambiguous"):
            m.enrich_named_original_spot(misnamed,set(),doc,official)

    def test_real_catalogue_identity_alignment_without_network(self):
        queue,archived=m.universe()
        self.assertEqual(len(queue),250)
        self.assertTrue(50<=len(archived)<250)
        self.assertIn("bitcoin",archived)
        self.assertIn("okb",archived)

    def test_live_archive_union_skips_existing_minute_and_daily_without_id_guessing(self):
        queue=[{"id":f"asset-{i}","rank":i,"symbol":f"T{i}",
                "name":f"Asset {i}"} for i in range(1,251)]
        rows=[{"id":a["id"],"rank":a["rank"],"symbol":a["symbol"],
               "quote":"USDT","native_1m_count":0} for a in queue]
        rows[0]["native_1m_count"]=43200
        minute={"schema":"aerith.public.ohlcv.top250.federated-native-archives.v1",
                "ranked":250,"archived_assets":1,"assets":rows}
        bar={"id":"asset-2","rank":2,"symbol":"T2","quote":"USDT",
             "native_candles":20,"release_url":"https://github.com/source/release",
             "sha256":"a"*64}
        daily={"schema":"aerith.public.crypto.multiresolution-sources.v1",
               "asset_count":1,"assets":[bar]}
        self.assertEqual(m.active_archive_ids(queue,minute,daily),
                         {"asset-1","asset-2"})
        # An already archived asset is not discovered again when the older
        # Binance-only catalog does not know about its native daily history.
        import copy
        duplicate=copy.deepcopy(daily)
        duplicate["assets"][0]={**bar,"id":"asset-1","rank":1,"symbol":"T1"}
        self.assertEqual(m.active_archive_ids(queue,minute,duplicate),{"asset-1"})
        wrong=copy.deepcopy(daily)
        wrong["assets"][0]["symbol"]="WRONG"
        with self.assertRaisesRegex(ValueError,"Daily catalogue identity"):
            m.active_archive_ids(queue,minute,wrong)
        stale=copy.deepcopy(minute)
        stale["archived_assets"]=2
        with self.assertRaisesRegex(ValueError,"headline"):
            m.active_archive_ids(queue,stale,daily)
        invented=copy.deepcopy(daily)
        invented["assets"][0]["native_candles"]=0
        with self.assertRaisesRegex(ValueError,"Daily catalogue identity"):
            m.active_archive_ids(queue,minute,invented)

    def test_independent_contract_source_verifies_unique_original_owner(self):
        import prove_public_spot_contracts as contract
        owner={"id":"mantle","rank":56,"symbol":"MNT","name":"Mantle"}
        queue=[{"id":f"dummy-{i}","rank":i,"symbol":f"C{i}",
                "name":"Other"} for i in range(1,251)]
        queue[55]=owner
        addr="0x"+"ab"*20
        coins=[{"id":f"not-{i}","symbol":"other","platforms":{}}
               for i in range(1001)]
        coins.append({"id":"mantle","symbol":"mnt",
                      "platforms":{"ethereum":addr}})
        official={"schema":contract.SCHEMA,"ranked":250,
                  "assets":[{"id":"mantle","rank":56,"symbol":"MNT",
                      "instruments":[{"venue":"gate","base":"MNT",
                          "quote":"USDT","instrument":"MNT_USDT",
                          "exchange_instrument_confirmed":True},
                          {"venue":"kucoin","base":"MNT","quote":"USDC",
                          "instrument":"MNT-USDC",
                          "exchange_instrument_confirmed":True}]}]}
        gate=[{"currency":f"Other{i}","chains":[]} for i in range(101)]
        gate.append({"currency":"MNT","chains":[
            {"name":"ETH","addr":addr}],"trade_disabled":False})
        kucoin={"code":"200000","data":[
            {"currency":f"Other{i}","chains":[]} for i in range(101)]+[
            {"currency":"MNT","chains":[
                {"chainName":"ERC20","contractAddress":addr}]}]}
        a=contract.proven_contracts(queue,set(),official,coins,gate,"gate")
        b=contract.proven_contracts(queue,set(),official,coins,kucoin,"kucoin")
        self.assertEqual(a["mantle"]["market_pair_candidate"],"MNT_USDT")
        self.assertEqual(b["mantle"]["market_pair_candidate"],"MNT-USDC")
        self.assertEqual(a["mantle"]["coin_id"],"mantle")
        self.assertFalse(a["mantle"]["native_1m_month_confirmed"])
        self.assertFalse(b["mantle"]["exchange_instrument_confirmed"])
        self.assertEqual(contract.proven_contracts(
            queue,{"mantle"},official,coins,gate,"gate"),{})
        # One source symbol is never enough; contract must be unique.
        collision=coins+[{"id":"other-claim","symbol":"mnt",
                          "platforms":{"ethereum":addr}}]
        self.assertEqual(contract.proven_contracts(
            queue,set(),official,collision,gate,"gate"),{})
        wrong=json.loads(json.dumps(gate))
        wrong[-1]["chains"][0]["addr"]="0x"+"cd"*20
        self.assertEqual(contract.proven_contracts(
            queue,set(),official,coins,wrong,"gate"),{})
        wrongOfficial=json.loads(json.dumps(official))
        wrongOfficial["assets"][0]["instruments"][0]["instrument"]="WRONG_USDT"
        self.assertNotIn("mantle",contract.proven_contracts(
            queue,set(),wrongOfficial,coins,gate,"gate"))
        with self.assertRaisesRegex(ValueError,"incomplete"):
            contract.proven_contracts(queue,set(),official,[],gate,"gate")
        with self.assertRaisesRegex(ValueError,"KuCoin"):
            contract.proven_contracts(queue,set(),official,coins,
                {"code":"400","data":kucoin["data"]},"kucoin")
        self.assertNotIn("mantle",contract.proven_contracts(
            queue,set(),official,coins,
            gate[:-1]+[{"currency":"MNT","chains":gate[-1]["chains"],
                       "trade_disabled":True}],"gate"))

    def test_gate_kucoin_contract_provenance_updates_only_candidate_ledger(self):
        import prove_public_spot_contracts as contract
        addr="0x"+"12"*20
        queue=[{"id":f"dummy-{i}","rank":i,"symbol":f"Q{i}",
                "name":"Other"} for i in range(1,251)]
        queue[55]={"id":"mantle","rank":56,"symbol":"MNT","name":"Mantle"}
        official={"schema":contract.SCHEMA,"ranked":250,
                  "assets":[{"id":"mantle","rank":56,"symbol":"MNT",
                             "instruments":[{"venue":"gate","base":"MNT",
                                 "quote":"USDT","instrument":"MNT_USDT",
                                 "exchange_instrument_confirmed":True}]}]}
        cg=[{"id":f"other-{i}","symbol":"other","platforms":{}}
            for i in range(1001)]+[
            {"id":"mantle","symbol":"mnt","platforms":{"ethereum":addr}}]
        gate=[{"currency":f"OTHER{i}","chains":[]} for i in range(101)]+[
            {"currency":"MNT","chains":[{"name":"ETH","addr":addr}]}]
        empty={"schema":m.SCHEMA,"source":"CoinGecko exact ID",
               "results":[],"checked_count":0,"market_candidate_count":0}
        result,added=m.enrich_independent_contracts(
            queue,set(),empty,official,cg,{"gate":gate})
        self.assertEqual(added,["mantle"])
        self.assertEqual(result["market_candidate_count"],1)
        self.assertEqual(result["results"][0]["markets"][0]["exchange"],"gate")
        self.assertEqual(result["results"][0]["markets"][0]["quote"],"USDT")
        self.assertFalse(result["results"][0]["markets"][0]["native_1m_month_confirmed"])
        new,again=m.enrich_independent_contracts(
            queue,set(),result,official,cg,{"gate":gate})
        self.assertEqual(again,[])
        self.assertEqual(result["results"],new["results"])

    def test_real_ranked_universe_excludes_every_living_archive(self):
        # Integration check: the current source indexes drive discovery,
        # not old legacy-month counts or raw Spot instrument candidates.
        queue,excluded=m.universe()
        minute=json.loads(m.LIVE_MINUTE.read_text())
        daily=json.loads(m.LIVE_DAILY.read_text())
        observed={a["id"] for a in minute["assets"]
                  if a["native_1m_count"]>0}
        observed.update(a["id"] for a in daily["assets"])
        self.assertEqual(len(queue),250)
        self.assertEqual(excluded,observed)
        self.assertEqual(len(queue)-len(excluded),250-len(observed))

if __name__=="__main__":
    unittest.main(verbosity=2)
