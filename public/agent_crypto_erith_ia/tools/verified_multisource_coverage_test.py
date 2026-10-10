#!/usr/bin/env python3
"""Offline test: count only Bitget Spot original month ZIPs with true 1m continuity."""
import calendar
import csv
import hashlib
import io
import json
import unittest
import zipfile

import build_verified_multisource_coverage as m

class MultiSourceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalog=m.get_json(m.CATALOG)
        cls.alt=m.get_json(m.EXACT)
        cls.spot=m.get_json(m.INSTRUMENTS)

    def month(self, month="2026-09", ident="cosmos", break_at=None):
        asset=next(x for x in self.catalog["assets"] if x["id"]==ident)
        start,count=m.interval(month)
        pair=asset["symbol"]+"USDT"
        name=pair+"-1m-"+month+".csv"
        buf=io.StringIO(newline="")
        csvout=csv.writer(buf,lineterminator="\n")
        for i in range(count):
            ts=start+i*m.STEP
            if i==break_at:ts+=m.STEP
            csvout.writerow([ts,"10","11","9","10.5","2","21"])
        zipbuf=io.BytesIO()
        with zipfile.ZipFile(zipbuf,"w",compression=zipfile.ZIP_DEFLATED) as z:
            z.writestr(name,buf.getvalue())
        raw=zipbuf.getvalue()
        record={"asset_id":ident,"rank":asset["rank"],"symbol":asset["symbol"],
                "pair":pair,"quote":"USDT","month":month,"interval":"1m",
                "source":"Bitget Spot public native 1m API","status":"verified",
                "file":pair+"-1m-"+month+".zip","sha256":hashlib.sha256(raw).hexdigest(),
                "zip_bytes":len(raw),"candles":count}
        manifest={"schema":m.SOURCE_SCHEMA,"month":month,"interval":"1m",
                  "venue":"bitget","quote":"USDT","source":record["source"],
                  "no_synthetic_candles":True,"native_month_proven":True,
                  "requested":1,"verified":1,"unavailable":0,"candles":count,
                  "assets":[record]}
        tag="crypto-spot-bitget-"+month+"-1m-"+ident
        return tag,manifest,raw

    def test_accepted_independent_month_increases_unique_asset_count(self):
        tag,meta,raw=self.month()
        record=m.validate_month(tag,meta,raw,self.catalog,self.alt,self.spot)
        self.assertEqual(record["native_1m_candles"],43200)
        self.assertEqual(record["quote"],"USDT")
        index=m.build_index(self.catalog,[{"id":"cosmos",**record}])
        self.assertEqual(index["assets_with_verified_month"],
                         self.catalog["archived_assets"]+1)
        self.assertEqual(index["bitget_verified_months"],1)
        self.assertEqual(index["bitget_new_distinct_assets"],1)
        self.assertTrue(index["first_trade_not_proven"])
        self.assertTrue(index["does_not_replace_binance_readers"])
        expected=sum(max((len(span) for span in m.spans([x["month"] for x in a["months"]])),default=0)>=12 for a in self.catalog["assets"])
        self.assertEqual(index["assets_with_12_consecutive_months"],expected)

    def test_reject_tampered_zip_without_changing_catalog(self):
        tag,meta,raw=self.month()
        with self.assertRaisesRegex(ValueError,"checksum"):
            m.validate_month(tag,meta,raw+b"tamper",self.catalog,self.alt,self.spot)
        with self.assertRaisesRegex(ValueError,"SHA|checksum"):
            m.validate_month(tag,{**meta,"assets":[{**meta["assets"][0],
               "sha256":"0"*64}]},raw,self.catalog,self.alt,self.spot)

    def test_reject_missing_native_minute_even_with_matching_zip_digest(self):
        tag,meta,raw=self.month(break_at=4000)
        with self.assertRaisesRegex(ValueError,"gap"):
            m.validate_month(tag,meta,raw,self.catalog,self.alt,self.spot)

    def test_reject_spoofed_id_market_exchange_and_fake_month(self):
        tag,meta,raw=self.month()
        with self.assertRaisesRegex(ValueError,"exact-ID"):
            m.validate_month(tag.replace("cosmos","fakecoin"),meta,raw,
                             self.catalog,self.alt,self.spot)
        with self.assertRaisesRegex(ValueError,"Unqualified"):
            m.validate_month(tag,{**meta,"native_month_proven":False},raw,
                             self.catalog,self.alt,self.spot)

    def test_duplicate_same_month_refused_and_other_sources_never_added(self):
        tag,meta,raw=self.month()
        verified={"id":"cosmos",**m.validate_month(tag,meta,raw,
                       self.catalog,self.alt,self.spot)}
        with self.assertRaisesRegex(ValueError,"Repeated source"):
            m.build_index(self.catalog,[verified,verified])
        # Existing Binance history must not be counted a second time.
        id="bitcoin"
        existing=self.catalog["assets"][0]["months"][0]["month"]
        made={"id":id,"month":existing,"exchange":"bitget"}
        out=m.build_index(self.catalog,[made])
        self.assertEqual(out["assets_with_verified_month"],
                         self.catalog["archived_assets"])
        self.assertEqual(out["bitget_new_distinct_assets"],0)

if __name__=="__main__":unittest.main(verbosity=2)
