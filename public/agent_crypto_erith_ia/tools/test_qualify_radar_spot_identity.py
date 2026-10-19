#!/usr/bin/env python3
"""Offline guardrail tests: no symbol-based or retroactive trading proof."""
import datetime as dt
import pathlib
import sys
import unittest
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from qualify_radar_spot_identity import build, instrument_metadata, coingecko_owners

NOW=dt.datetime(2026,10,20,8,17,tzinfo=dt.timezone.utc)
CONTRACT="0x"+("1"*40)
OTHER="0x"+("2"*40)


def qual():
    entries=[{"id":"quack-ai","symbol":"Q",
              "market":{"provider":"Bitget","pair":"QUSDT","quote":"USDT",
                        "book":{"best_bid_usdt":.1,"best_ask_usdt":.11}}}]
    entries.extend({"id":"unknown-"+str(i),"symbol":"T"+str(i),"market":None}
                   for i in range(19))
    return {"schema":"erith.radar.spot-qualification.v1",
            "source_observation_date_utc":"2026-10-20",
            "qualified_at_utc":"2026-10-20T08:16:00Z",
            "real_orders_enabled":False,"actual_execution_permissions":False,
            "coin_id_matches_exchange_symbol_verified":False,"candidates":entries}


def coins():
    return [{"id":"quack-ai","symbol":"q","platforms":{"ethereum":CONTRACT}},
            {"id":"another","symbol":"q","platforms":{"ethereum":OTHER}},
            {"id":"another-chain","symbol":"other","platforms":{}}]


def native():
    return {"code":"00000","data":[{"coin":"Q","chains":[
        {"chain":"ETH","contractAddress":CONTRACT}]}]}


def inst():
    return {"code":"00000","data":[{"category":"SPOT","baseCoin":"Q",
            "quoteCoin":"USDT","symbol":"QUSDT","status":"online",
            "minOrderAmount":"5","minOrderQty":"0.01",
            "quantityPrecision":"2","pricePrecision":"4",
            "symbolType":"crypto","isRwa":"NO"}]}


class Tests(unittest.TestCase):
    def qualify(self, q=None, rows=None, coin=None, metadata=None):
        return build(q or qual(), rows or coins(),
                     lambda sym:coin if coin is not None else native(),
                     lambda pair:metadata if metadata is not None else inst(),
                     NOW, strict_catalog=False)

    def test_exact_unique_chain_and_market_allow_identity_study_not_trade(self):
        o=self.qualify()
        self.assertEqual(o["candidate_count"],20)
        self.assertEqual(o["identity_proven_count"],1)
        q=o["candidates"][0]
        self.assertTrue(q["identity_proven"])
        self.assertEqual(q["platform"],"ethereum")
        self.assertEqual(q["contract_address"],CONTRACT)
        self.assertEqual(q["min_order_usdt"],"5")
        # Bitget minOrderQty belongs to FUTURES; a Spot minimum is not evidenced.
        self.assertIsNone(q["spot_exit_rules"])
        self.assertEqual(q["paper_entry_decision"],"AWAIT_NEXT_DATED_BOOK_AND_COST_CHECK")
        self.assertIsNone(q["paper_entry_price_usdt"])
        self.assertIsNone(q["paper_pnl_usdt"])
        self.assertEqual(o["paper_orders"],0)
        self.assertEqual(o["real_orders"],0)

    def test_future_only_min_order_qty_never_certifies_spot_size(self):
        v=inst()
        v["data"][0]["minOrderQty"]="10"
        v["data"][0]["quantityPrecision"]="8"
        self.assertIsNone(self.qualify(metadata=v)["candidates"][0]["spot_exit_rules"])

    def test_instrument_filters_missing_or_invalid_do_not_invent_trade_rules(self):
        for field, value in (("minOrderQty", None), ("minOrderQty", "0"),
                             ("quantityPrecision", "20"), ("pricePrecision", "-1")):
            v = inst()
            if value is None:
                v["data"][0].pop(field)
            else:
                v["data"][0][field] = value
            row = self.qualify(metadata=v)["candidates"][0]
            self.assertTrue(row["identity_proven"])
            self.assertIsNone(row["spot_exit_rules"])
            self.assertEqual(row["paper_entry_decision"], "AWAIT_NEXT_DATED_BOOK_AND_COST_CHECK")

    def test_name_or_symbol_only_never_establishes_identity(self):
        source=native()
        source["data"][0]["chains"][0]["contractAddress"]=OTHER
        o=self.qualify(coin=source)
        self.assertEqual(o["identity_proven_count"],0)
        self.assertEqual(o["candidates"][0]["status"],"PUBLIC_IDENTITY_EVIDENCE_MISSING")

    def test_duplicate_contract_owners_fail_closed(self):
        items=coins()
        items[1]["platforms"]={"ethereum":CONTRACT}
        o=self.qualify(rows=items)
        self.assertFalse(o["candidates"][0]["identity_proven"])

    def test_wrong_instrument_or_minimum_fail_closed(self):
        v=inst();v["data"][0]["baseCoin"]="BTC"
        self.assertEqual(self.qualify(metadata=v)["identity_proven_count"],0)
        v=inst();v["data"][0]["minOrderAmount"]="0"
        self.assertEqual(self.qualify(metadata=v)["identity_proven_count"],0)

    def test_future_or_old_qualification_rejected(self):
        for age in ("2026-10-20T08:18:00Z","2026-10-20T07:00:00Z"):
            q=qual();q["qualified_at_utc"]=age
            with self.assertRaisesRegex(ValueError,"ancienne ou future"):
                self.qualify(q=q)
        q=qual();q["source_observation_date_utc"]="2026-10-19"
        with self.assertRaisesRegex(ValueError,"jour Radar"):
            self.qualify(q=q)

    def test_wrong_coingecko_id_or_spot_market_is_not_proved(self):
        q=qual()
        q["candidates"][0]["symbol"]="QQ"
        self.assertEqual(self.qualify(q=q)["identity_proven_count"],0)
        q=qual()
        q["candidates"][0]["market"]["provider"]="OKX"
        r=self.qualify(q=q)
        self.assertEqual(r["candidates"][0]["status"],"NATIVE_CONTRACT_SOURCE_NOT_SUPPORTED")

    def test_duplicate_coingecko_id_is_rejected_not_guessed(self):
        with self.assertRaisesRegex(ValueError,"dupliquée"):
            coingecko_owners([coins()[0],coins()[0]],strict=False)


if __name__=="__main__":
    unittest.main()
