"""Offline tests for three project contract references. Never create a trade."""
import copy
import json
import pathlib
import unittest
import build_radar_focus_identity_review as focus

def fixture():
    return (json.loads(focus.QUALIFICATION.read_text(encoding="utf-8")),
            json.loads(focus.IDENTITIES.read_text(encoding="utf-8")))

class FocusReview(unittest.TestCase):
    def test_canonical_three_priorities_remain_in_review(self):
        q,i=fixture()
        doc=focus.build(q,i)
        self.assertEqual(doc["target_count"],3)
        self.assertEqual(doc["pending_identity_count"],3)
        self.assertEqual(doc["hourly_targets_activated"],0)
        self.assertEqual(doc["native_exchange_contract_mapping_verified_count"],0)
        self.assertEqual(doc["new_network_requests"],0)
        self.assertEqual(doc["real_orders"],0)
        self.assertEqual([t["symbol"] for t in doc["targets"]],["BAT","ALT","REZ"])
        self.assertEqual([t["research_priority_rank"] for t in doc["targets"]],[3,5,2])
        self.assertEqual([t["secondary_okx_pair_historical"] for t in doc["targets"]],
                         ["BAT-USDT",None,None])
        for t in doc["targets"]:
            self.assertFalse(t["exchange_contract_identity_proven"])
            self.assertFalse(t["exchange_coin_id_mapping_proven"])
            self.assertFalse(t["hourly_target_enabled"])
            self.assertFalse(t["project_token_reference"]["exchange_identity_evidence"])
            self.assertEqual(t["paper_decision"],"IDENTITY_REVIEW_ONLY")
            self.assertEqual(len(t["project_token_reference"]["address"]),42)

    def test_public_dossier_is_deterministic(self):
        q,i=fixture()
        actual=json.loads(focus.OUTPUT.read_text(encoding="utf-8"))
        self.assertEqual(actual,focus.build(q,i))
        self.assertEqual(actual["priority_source_day_utc"],"2026-10-20")
        self.assertEqual(actual["orders_enabled"],False)

    def test_wrong_coin_id_pair_and_forged_native_proof_fail_closed(self):
        q,i=fixture()
        q2=copy.deepcopy(q)
        q2["candidates"]=[x for x in q2["candidates"] if x["id"]!="altlayer"]
        with self.assertRaises(ValueError):focus.build(q2,i)
        q2=copy.deepcopy(q)
        next(x for x in q2["candidates"] if x["id"]=="renzo")["market"]["pair"]="BATMa"
        with self.assertRaises(ValueError):focus.build(q2,i)
        i2=copy.deepcopy(i)
        next(x for x in i2["candidates"] if x["coin_id"]=="basic-attention-token")["identity_proven"]=True
        with self.assertRaises(ValueError):focus.build(q,i2)
        i2=copy.deepcopy(i)
        next(x for x in i2["candidates"] if x["coin_id"]=="renzo")["venue"]="OKX"
        with self.assertRaises(ValueError):focus.build(q,i2)
        q2=copy.deepcopy(q)
        q2["qualified_at_utc"]="2026-10-25T18:37:23Z"
        with self.assertRaises(ValueError):focus.build(q2,i)

    def test_project_address_is_not_binance_mapping(self):
        q,i=fixture()
        d=focus.build(q,i)
        self.assertEqual({x["research_venue"] for x in d["targets"]},{"Binance"})
        self.assertTrue(all(x["binance_native_token_contract_crosscheck"]==
              "NOT_AVAILABLE_IN_PUBLIC_EXCHANGE_INFO" for x in d["targets"]))
        self.assertTrue(all(x["spot_pair_fresh_now"] is False for x in d["targets"]))
        self.assertTrue(d["no_promotion_by_symbol"])
        self.assertTrue(d["source_urls_are_references_not_native_exchange_proof"])

if __name__=="__main__":
    unittest.main()
