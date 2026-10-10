#!/usr/bin/env python3
"""Offline regression: exchange Spot instruments are not proven coin identities."""
import io
import json
import unittest

import audit_spot_instruments as a

def universe():
    rows=[{"id":"asset-"+str(i),"rank":i,"symbol":"COIN"+str(i),
           "months":[]} for i in range(1,251)]
    rows[41].update(id="okb",symbol="OKB")
    rows[72].update(id="kaspa",symbol="KAS")
    rows[73].update(id="kaspa-copy",symbol="KAS")  # symbol collision stays unproven
    rows[0]["months"]=[{"month":"2026-09"}]
    return {"ranked":250,"assets":rows,"archived_assets":1}

def okx(symbol="OKB",quote="USDT",state="live",kind="SPOT"):
    return {"baseCcy":symbol,"quoteCcy":quote,"state":state,"instType":kind,
            "instId":symbol+"-"+quote}

def bitget(symbol="OKB",quote="USDT",state="online"):
    return {"baseCoin":symbol,"quoteCoin":quote,"symbol":symbol+quote,
            "status":state}

class OfficialSpotAuditTests(unittest.TestCase):
    def test_extract_active_spot_only_never_derivatives_or_unlisted(self):
        ok=a.spot_index({"code":"0","data":[okx(),okx("KAS","USDC"),
            okx("BTC","USDT",kind="SWAP"),okx("ABC","USDT",state="suspend"),
            {**okx("EVIL"),"instId":"EVIL-USDC"},
            okx("EUR","EUR"),{"instType":"SPOT","state":"live","instId":"BAD"}]},
            "okx")
        self.assertEqual(ok,{("OKB","USDT","OKB-USDT"),("KAS","USDC","KAS-USDC")})
        bg=a.spot_index({"code":"00000","data":[bitget(),bitget("KAS","USDC"),
            bitget("NO","USDT",state="offline"),
            {**bitget("FAIL"),"symbol":"FAILUSDC"},
            bitget("EUR","EUR")]}, "bitget")
        self.assertEqual(bg,{("OKB","USDT","OKBUSDT"),("KAS","USDC","KASUSDC")})
        for venue,doc in [("okx",{"code":"501","data":[okx()]}),
                          ("bitget",{"code":"429","data":[bitget()]})]:
            with self.assertRaisesRegex(ValueError,"failed"):
                a.spot_index(doc,venue)

    def test_source_cannot_claim_identity_or_full_month(self):
        ok={("OKB","USDT","OKB-USDT"),("KAS","USDC","KAS-USDC")}
        bg={("OKB","USDT","OKBUSDT")}
        result=a.build(universe(),ok,bg,observed_at="2026-10-10T00:00:00+00:00")
        self.assertEqual(result["remaining"],249)
        self.assertEqual(result["symbol_candidate_assets"],3)
        self.assertTrue(result["none_are_archive_claims"])
        self.assertTrue(result["symbol_only_not_identity_proof"])
        found={x["id"]:x for x in result["assets"]}
        self.assertEqual(len(found["okb"]["instruments"]),2)
        self.assertEqual(found["kaspa"]["instruments"][0]["quote"],"USDC")
        self.assertEqual(len(found["kaspa-copy"]["instruments"]),1)
        self.assertTrue(all(not m["exact_coingecko_id_proven"] and
                            not m["full_native_1m_month_proven"]
                            for row in result["assets"] for m in row["instruments"]))
        self.assertNotIn("asset-1",found)
        self.assertEqual(found["asset-2"]["status"],"no_symbol_instrument")

    def test_reject_bad_response_and_unapproved_host(self):
        class FakeResponse(io.BytesIO):
            status=200
            def __enter__(self):return self
            def __exit__(self,*args):self.close()
        def fake(request,timeout):
            self.assertEqual(timeout,35)
            self.assertEqual(request.full_url,a.OKX_URL)
            return FakeResponse(json.dumps({"code":"0","data":[okx()]}).encode())
        doc,rawsha=a.fetch_document(a.OKX_URL,opener=fake)
        self.assertEqual(a.spot_index(doc,"okx"),{("OKB","USDT","OKB-USDT")})
        self.assertEqual(len(rawsha),64)
        with self.assertRaisesRegex(ValueError,"Only two public"):
            a.fetch_document("https://example.com/anything",opener=fake)
        def oversized(request,timeout):
            return FakeResponse(b"x"*(a.MAX_RESPONSE+1))
        with self.assertRaisesRegex(ValueError,"incomplete or oversized"):
            a.fetch_document(a.OKX_URL,opener=oversized)

    def test_real_top250_source_never_changes_history(self):
        catalog=a.load_catalog()
        self.assertEqual(len(catalog["assets"]),250)
        self.assertGreaterEqual(catalog["archived_assets"],90)
        self.assertLess(catalog["archived_assets"],250)
        self.assertIn("okb",{x["id"] for x in catalog["assets"]})
        probe=a.build(catalog,{("OKB","USDT","OKB-USDT")},
                      {("OKB","USDT","OKBUSDT")},observed_at="fixture")
        self.assertEqual(probe["remaining"],250-catalog["archived_assets"])
        self.assertTrue(probe["none_are_archive_claims"])

if __name__=="__main__":
    unittest.main(verbosity=2)
