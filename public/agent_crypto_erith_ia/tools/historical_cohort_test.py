#!/usr/bin/env python3
"""No-network Top 50 pilot tests: identities, validation, immutable archives."""
import gzip
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import collect_historical_cohort as cohort
from collect_historical_universe import encoded

PROTECTED = {
    "bitcoin":"BTC","ethereum":"ETH","binancecoin":"BNB",
    "ripple":"XRP","solana":"SOL","tron":"TRX","zcash":"ZEC",
    "usd-coin":"USDC","dogecoin":"DOGE","chainlink":"LINK",
    "cardano":"ADA","stellar":"XLM",
}
CANDIDATES = {
    "near":"NEAR","bitcoin-cash":"BCH","litecoin":"LTC",
    "uniswap":"UNI","avalanche-2":"AVAX","sui":"SUI",
    "hedera-hashgraph":"HBAR","shiba-inu":"SHIB","bittensor":"TAO",
    "crypto-com-chain":"CRO","ethena":"ENA","aave":"AAVE",
    "ondo-finance":"ONDO",
}


def fixture(path):
    root = Path(path)
    ids = list(PROTECTED.items()) + list(CANDIDATES.items())
    ids.extend([(f"unapproved-token-{i}",f"TEST_{i}") for i in range(25)])
    assert len(ids) == 50
    coins = [{"id":aid,"symbol":symbol,"rank":i+1,"name":aid}
             for i,(aid,symbol) in enumerate(ids)]
    market=root/"market.json"
    market.write_bytes(encoded({"coins":coins}))
    registry=root/"registry.json"
    registry.write_bytes(encoded({"schema":cohort.REGISTRY_SCHEMA,
                                  "cohort":"top50","candidate_symbols":CANDIDATES}))
    universe=root/"universe.json"
    universe.write_bytes(encoded({"publication":"MANUAL_BOUNDED_PILOT_NOT_LIVE",
                                  "quote":"USDT",
                                  "blocks":[{"id":i} for i in range(15)],
                                  "assets":[{"id":aid,"symbol":symbol,
                                            "qualification":"legacy_preserved" if i<7
                                            else "qualified_spot"}
                                            for i,(aid,symbol) in enumerate(PROTECTED.items())]}))
    return market,registry,universe,root/"output"


def fake_get(path, args, missing=False):
    if path.endswith("/exchangeInfo"):
        pair=args["symbol"]
        return {"symbols":[{"symbol":pair,"baseAsset":pair[:-4],
                "quoteAsset":"USDT","status":"TRADING","isSpotTradingAllowed":True,
                "permissionSets":[["SPOT"]]}]}
    step,count=next((x[1],x[2]) for x in cohort.PERIODS.values()
                    if x[0]==args["interval"])
    if missing and args["symbol"]=="NEARUSDT" and args["interval"]=="5m":
        count-=1
    return [[args["startTime"]+i*step,"10","12","9","11","3",
             args["startTime"]+(i+1)*step-1,"33",2,"0","0","0"]
             for i in range(count)]


class CohortTests(unittest.TestCase):
    def test_top50_plan_protects_twelve_and_never_guesses_symbols(self):
        with tempfile.TemporaryDirectory() as d:
            market,reg,old,out=fixture(d)
            rows,_=cohort.assemble(market,reg,old)
            self.assertEqual(len(rows),50)
            self.assertEqual(sum(x["status"]=="existing_archive_protected" for x in rows),12)
            self.assertEqual(sum(x["status"]=="candidate" for x in rows),13)
            self.assertEqual(sum(x["status"]=="identity_review_required" for x in rows),25)
            self.assertTrue(all(x["pair"] is None for x in rows if x["status"]!="candidate"))
            self.assertEqual(cohort.verify(out)["mode"],"NOT_COLLECTED")

    def test_collect_thirteen_real_shapes_then_integrity_and_immutability(self):
        with tempfile.TemporaryDirectory() as d:
            market,reg,old,out=fixture(d)
            snapshot=market.read_bytes(); registry=reg.read_bytes(); legacy=old.read_bytes()
            fixed=1_800_000_000
            with patch.object(cohort,"get_json",side_effect=fake_get),patch.object(cohort.time,"time",return_value=fixed):
                result=cohort.collect(market,reg,old,out)
            self.assertEqual(result["new_assets"],13)
            self.assertEqual(result["series"],39)
            self.assertEqual(result["candles"],13*(288+168+180))
            self.assertEqual(cohort.verify(out),result)
            index=json.loads((out/"index.json").read_bytes())
            self.assertEqual(len(index["assets"]),50)
            self.assertEqual({x["asset_id"] for x in index["blocks"]},set(CANDIDATES))
            self.assertEqual(index["quote"],"USDT")
            self.assertEqual(market.read_bytes(),snapshot)
            self.assertEqual(reg.read_bytes(),registry)
            self.assertEqual(old.read_bytes(),legacy)
            with self.assertRaisesRegex(ValueError,"immutable"):
                cohort.collect(market,reg,old,out)
            block=out/index["blocks"][0]["file"]
            block.write_bytes(block.read_bytes()+b"x")
            with self.assertRaisesRegex(ValueError,"SHA-256"):
                cohort.verify(out)

    def test_missing_candles_skip_entire_asset_not_partial_series(self):
        with tempfile.TemporaryDirectory() as d:
            market,reg,old,out=fixture(d)
            with patch.object(cohort,"get_json",side_effect=lambda p,a:fake_get(p,a,missing=True)),patch.object(cohort.time,"time",return_value=1_800_000_000):
                result=cohort.collect(market,reg,old,out)
            self.assertEqual(result["new_assets"],12)
            self.assertEqual(result["series"],36)
            index=json.loads((out/"index.json").read_bytes())
            self.assertEqual(next(x for x in index["assets"] if x["id"]=="near")["status"],
                             "historical_data_incomplete")
            self.assertFalse(any(x["asset_id"]=="near" for x in index["blocks"]))

    def test_ambiguous_coin_identity_and_malformed_rank_fail_closed(self):
        with tempfile.TemporaryDirectory() as d:
            market,reg,old,out=fixture(d)
            parsed=json.loads(market.read_bytes())
            parsed["coins"][12]["symbol"]="BROKEN_IDENTITY"
            market.write_bytes(encoded(parsed))
            rows,_=cohort.assemble(market,reg,old)
            self.assertEqual(rows[12]["status"],"identity_review_required")
            parsed["coins"][3]["rank"]=44
            market.write_bytes(encoded(parsed))
            with self.assertRaisesRegex(ValueError,"ranking or identity"):
                cohort.assemble(market,reg,old)


if __name__ == "__main__":
    unittest.main(verbosity=2)
