#!/usr/bin/env python3
"""Offline exact-ID identity crosswalk tests for Top250 Binance Spot."""
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import json

import verify_historical_top250_identity as m

def ticker(base="HYPE",coin_id="hyperliquid",market="binance",target="USDT",anomaly=False):
    return {"base":base,"target":target,"market":{"identifier":market},
            "coin_id":coin_id,"target_coin_id":"tether","is_anomaly":anomaly,
            "is_stale":False,"trust_score":"green",
            "trade_url":"https://www.binance.com/en/trade/HYPE_USDT"}

def audit():
    assets=[]
    for i in range(1,251):
        assets.append({"rank":i,"id":"asset-"+str(i),"symbol":"COIN"+str(i),
                       "proposed_pair":"COIN"+str(i)+"USDT","status":"pair_absent"})
    assets[10].update(id="hyperliquid",symbol="HYPE",
                      proposed_pair="HYPEUSDT",status="spot_candidate_identity_unverified")
    assets[31].update(id="the-open-network",symbol="GRAM",
                      proposed_pair="GRAMUSDT",status="spot_candidate_identity_unverified")
    assets[50].update(id="polkadot",symbol="DOT",
                      proposed_pair="DOTUSDT",status="spot_candidate_identity_unverified")
    return {"schema":m.AUDIT_SCHEMA,"total_ranked":250,"assets":assets}

class IdentityTests(unittest.TestCase):
    def test_requires_exact_id_spot_market_quote_and_valid_signal(self):
        a=m.candidates(audit())[0]
        self.assertEqual(len(m.extract([ticker()],a)),1)
        for obj in (ticker(coin_id="someone-else"),ticker(market="okx"),
                    ticker(target="BUSD"),ticker(anomaly=True),
                    {**ticker(),"is_stale":True},
                    {**ticker(),"trust_score":"red"}):
            self.assertFalse(m.extract([obj],a))
    def test_batch_processes_multiple_exact_ids_without_guessing(self):
        counts=[]
        def getter(a,p):
            counts.append((a,p))
            if a=="hyperliquid":return [ticker()]
            if a=="the-open-network":return [ticker(base="GRAM",coin_id="different-gram")]
            return []
        ledger,attempts=m.process(audit(),batch_size=3,fetcher=getter,delay=0,now="test-date")
        self.assertEqual(len(attempts),3)
        self.assertEqual(ledger["approved_count"],1)
        self.assertEqual(ledger["checked_count"],3)
        self.assertEqual(ledger["results"][1]["status"],"identity_not_confirmed")
        self.assertEqual(len(counts),3)
        self.assertEqual(ledger["candidate_count"],3)
    def test_resume_never_rechecks_approved_or_denied(self):
        requests=[]
        def getter(a,p):requests.append(a);return [ticker()] if a=="hyperliquid" else []
        current,_=m.process(audit(),batch_size=1,fetcher=getter,delay=0)
        updated,_=m.process(audit(),existing=current,batch_size=3,fetcher=getter,delay=0)
        self.assertEqual(requests,["hyperliquid","the-open-network","polkadot"])
        self.assertEqual(updated["checked_count"],3)
        again,attempts=m.process(audit(),existing=updated,batch_size=3,fetcher=getter,delay=0)
        self.assertEqual(len(attempts),0)
        self.assertEqual(again["approved_count"],1)
    def test_independent_exchange_route_requires_exact_source_coin_id(self):
        item=m.candidates(audit())[0]
        denied=m.inspect_asset(item,fetcher=lambda a,p:[],
             exchange_fetcher=lambda a,p:[ticker(coin_id="wrong-coin")])
        self.assertEqual(denied["status"],"identity_not_confirmed")
        verified=m.inspect_asset(item,fetcher=lambda a,p:[],
             exchange_fetcher=lambda a,p:[ticker(coin_id="hyperliquid")])
        self.assertEqual(verified["status"],"approved_coingecko_binance_spot")
        self.assertEqual(verified["evidence"][0]["ticker_coin_id"],"hyperliquid")
        self.assertEqual(verified["pages"],2)

    def test_recheck_denied_is_bounded_and_never_changes_approved(self):
        ledger,_=m.process(audit(),batch_size=3,
             fetcher=lambda coin,page:[ticker()] if coin=="hyperliquid" else [],
             delay=0,now="2026-01-01T00:00:00+00:00")
        calls=[]
        def exchange(coin,page):
            calls.append(coin)
            return [ticker(base="GRAM",coin_id="the-open-network")] if coin=="the-open-network" else []
        review,attempts=m.process(audit(),existing=ledger,batch_size=1,
             fetcher=lambda coin,page:[],exchange_fetcher=exchange,
             rescan_denied=True,delay=0,now="2026-01-02T00:00:00+00:00")
        self.assertEqual(len(attempts),1)
        self.assertEqual(attempts[0]["id"],"the-open-network")
        self.assertEqual(review["approved_count"],2)
        self.assertEqual(calls,["the-open-network"])
        self.assertEqual(next(x for x in review["results"] if x["id"]=="hyperliquid"),
                         next(x for x in ledger["results"] if x["id"]=="hyperliquid"))
        follow,attempts=m.process(audit(),existing=review,batch_size=1,
             fetcher=lambda coin,page:[],exchange_fetcher=lambda coin,page:[],
             rescan_denied=True,delay=0,now="2026-01-03T00:00:00+00:00")
        self.assertEqual(attempts[0]["id"],"polkadot")
        self.assertEqual(follow["approved_count"],2)

    def test_api_error_does_not_grant_approval(self):
        def error(a,p):raise OSError("temporary upstream failure")
        item=m.inspect_asset(m.candidates(audit())[0],error)
        self.assertEqual(item["status"],"source_unavailable")
        self.assertEqual(item["evidence"],[])
        existing={"schema":m.SCHEMA,"results":[
          {"id":"hyperliquid","rank":11,"pair":"HYPEUSDT","status":"source_unavailable"},
          {"id":"the-open-network","rank":32,"pair":"GRAMUSDT","status":"identity_not_confirmed"},
          {"id":"polkadot","rank":51,"pair":"DOTUSDT","status":"identity_not_confirmed"}]}
        v,_=m.process(audit(),existing=existing,batch_size=1,
                      fetcher=lambda a,p:[ticker()],delay=0)
        self.assertEqual(v["approved_count"],1)
    def test_unfinished_pagination_never_approves(self):
        item=m.inspect_asset(m.candidates(audit())[0],
              lambda a,p:[ticker()]*100)
        self.assertEqual(item["status"],"source_pagination_incomplete")
    def test_no_mutating_wrong_pair_or_fake_proof(self):
        ledger={"schema":m.SCHEMA,"results":[{
          "id":"hyperliquid","rank":11,"pair":"GRUMUSDT",
          "status":"approved_coingecko_binance_spot","evidence":[{"coin_id":"hyperliquid",
                "base":"HYPE","target":"USDT","market_identifier":"binance"}]}]}
        with self.assertRaisesRegex(ValueError,"no longer matches"):
            m.validate_ledger(ledger,audit())
        ledger["results"][0]["pair"]="HYPEUSDT"
        ledger["results"][0]["evidence"][0]["coin_id"]="wrong"
        with self.assertRaisesRegex(ValueError,"without exact identity"):
            m.validate_ledger(ledger,audit())
    def test_eight_candidates_are_bounded_and_resumable(self):
        source=audit()
        for asset in source["assets"][59:66]:
            asset["status"]="spot_candidate_identity_unverified"
        request_ids=[]
        def getter(coin_id,page):
            request_ids.append(coin_id)
            return []
        ledger,attempts=m.process(source,batch_size=8,fetcher=getter,delay=0)
        self.assertEqual(len(attempts),8)
        self.assertEqual(ledger["checked_count"],8)
        self.assertEqual(len(request_ids),8)
        resumed,remaining=m.process(source,existing=ledger,batch_size=8,
                                     fetcher=getter,delay=0)
        self.assertEqual(len(remaining),2)
        self.assertEqual(resumed["checked_count"],10)
        self.assertEqual(len(set(request_ids)),10)
        with self.assertRaisesRegex(ValueError,"Unbounded"):
            m.process(source,batch_size=9,fetcher=getter,delay=0)

    def test_250_rank_frozen_no_arbitrary_batch(self):
        with self.assertRaisesRegex(ValueError,"Unbounded"):
            m.process(audit(),batch_size=250,fetcher=lambda a,p:[])
        x=audit();x["assets"].pop()
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/"audit.json";path.write_text(json.dumps(x))
            with self.assertRaisesRegex(ValueError,"incomplete"):
                m.load_audit(path)

if __name__=="__main__":
    unittest.main(verbosity=2)
