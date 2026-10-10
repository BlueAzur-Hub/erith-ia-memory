#!/usr/bin/env python3
"""Offline proof: a Bitget month is exactly all native one-minute SPOT rows."""
import csv
import datetime as dt
import hashlib
import io
import json
from pathlib import Path
import tempfile
import unittest
import zipfile
import urllib.parse

import collect_native_bitget_month as m

ASSET={"id":"cosmos","rank":75,"symbol":"ATOM",
       "pair":"ATOMUSDT","quote":"USDT","venue":"bitget"}

def correct(pair,start,end,count):
    assert pair=="ATOMUSDT"
    assert end-start==count*m.STEP
    return ([[str(start+i*m.STEP),"10.000","12.000","9.000","11.000",
             "2.000","20.000"] for i in range(count)],"a"*64)

class NativeBitgetMonthTests(unittest.TestCase):
    def test_immutable_exact_43200_rows_and_seven_authentic_columns(self):
        with tempfile.TemporaryDirectory() as temp:
            output=Path(temp)
            result=m.execute_one(ASSET,"2026-09",output,
                                 fetcher=correct,delay=0)
            self.assertEqual(result["verified"],1)
            self.assertEqual(result["candles"],43200)
            self.assertTrue(result["not_exchange_signed"])
            self.assertTrue(result["no_synthetic_candles"])
            entry=result["assets"][0]
            self.assertEqual(len(entry["raw_api_response_sha256"]),44)
            self.assertEqual(entry["source"],m.SOURCE)
            raw=(output/entry["file"]).read_bytes()
            self.assertEqual(hashlib.sha256(raw).hexdigest(),entry["sha256"])
            with zipfile.ZipFile(io.BytesIO(raw)) as archive:
                self.assertEqual(archive.namelist(),["ATOMUSDT-1m-2026-09.csv"])
                with archive.open("ATOMUSDT-1m-2026-09.csv") as stream:
                    rows=list(csv.reader(io.TextIOWrapper(stream)))
            self.assertEqual(len(rows),43200)
            self.assertTrue(all(len(row)==7 for row in rows))
            self.assertEqual(rows[0][0],str(m.bounds("2026-09")[0]))
            self.assertEqual(rows[-1][0],str(m.bounds("2026-09")[1]-m.STEP))
            result2=m.execute_one(ASSET,"2026-09",output,
                                  fetcher=correct,delay=0)
            self.assertEqual(result2["assets"][0]["sha256"],entry["sha256"])

    def test_one_incomplete_recent_page_falls_back_to_authentic_history(self):
        first=m.bounds("2026-09")[0]
        def insufficient_recent(pair,start,end,count):
            rows,sha=correct(pair,start,end,count)
            return (rows[:-1] if start==first else rows),sha
        history=[]
        def exact_history(pair,start,end,count):
            history.append((start,count))
            self.assertLessEqual(count,100)
            return correct(pair,start,end,count)
        with tempfile.TemporaryDirectory() as work:
            result=m.execute_one(ASSET,"2026-09",Path(work),
                        fetcher=insufficient_recent,delay=0,
                        historical_fetcher=exact_history)
            self.assertEqual(result["verified"],1)
            self.assertEqual(len(history),10)
            self.assertEqual(len(result["assets"][0]["raw_api_response_sha256"]),53)

    def test_missing_duplicate_wrong_quote_or_bad_value_halts(self):
        start,_,_=m.bounds("2026-09")
        good=[[str(start+i*m.STEP),"10","12","9","11","2","20"]
              for i in range(5)]
        for bad in [good[:-1],good[:4]+[good[3]],
                    good[:4]+[[str(start+4*m.STEP),"10","8","9","11","2","20"]],
                    good[:4]+[[str(start+4*m.STEP),"10","12","9","11","nan","20"]]]:
            with self.assertRaises(ValueError):
                m.verify_page(bad,start,5)
        with self.assertRaisesRegex(ValueError,"exact-ID"):
            m.verified_month({**ASSET,"quote":"USDC"},"2026-09",
                             fetcher=correct,delay=0)

    def test_bad_second_page_never_creates_partial_archive(self):
        def broken(pair,start,end,count):
            rows,digest=correct(pair,start,end,count)
            if start>m.bounds("2026-09")[0]:
                rows.pop()
            return rows,digest
        with tempfile.TemporaryDirectory() as temp:
            with self.assertRaisesRegex(ValueError,"Historical Bitget 1m page rejected"):
                m.execute_one(ASSET,"2026-09",Path(temp),
                              fetcher=broken,historical_fetcher=broken,delay=0)
            self.assertEqual(list(Path(temp).iterdir()),[])

    def test_history_and_recent_api_boundaries_are_distinct(self):
        start=m.bounds("2026-09")[0]
        end=start+100*m.STEP
        requested=[]
        class FakeResponse(io.BytesIO):
            status=200
            def __enter__(self):return self
            def __exit__(self,*args):self.close()
        def fake_open(req,timeout):
            parsed=urllib.parse.urlparse(req.full_url)
            params=urllib.parse.parse_qs(parsed.query)
            requested.append((parsed.path,int(params["startTime"][0]),
                              int(params["endTime"][0])))
            return FakeResponse(b'{"code":"00000","data":[]}')
        for endpoint in (m.API,m.HISTORY_API):
            rows,digest=m.fetch_page("ATOMUSDT",start,end,100,
                                      opener=fake_open,endpoint=endpoint)
            self.assertEqual(rows,[])
            self.assertEqual(len(digest),64)
        self.assertEqual(requested,[
            ("/api/v3/market/candles",start-m.STEP,end-m.STEP),
            ("/api/v3/market/history-candles",start,end)])
        with self.assertRaisesRegex(ValueError,"Unsafe native"):
            m.fetch_page("ATOMUSDT",start,end,101,
                         opener=fake_open,endpoint=m.HISTORY_API)


    def test_automatic_closed_month_skips_published_tags_and_walks_back(self):
        now=dt.datetime(2026,10,10,17,0,tzinfo=dt.timezone.utc)
        self.assertEqual(m.latest_closed_month(now),"2026-09")
        self.assertEqual(m.previous_month("2026-01"),"2025-12")
        sep={m.release_tag(ASSET,"2026-09")}
        self.assertEqual(m.choose_missing_month([ASSET],sep,now),"2026-08")
        aug=sep|{m.release_tag(ASSET,"2026-08")}
        self.assertEqual(m.choose_missing_month([ASSET],aug,now),"2026-07")
        months=set()
        month="2026-09"
        for _ in range(12):
            months.add(m.release_tag(ASSET,month))
            month=m.previous_month(month)
        self.assertIsNone(m.choose_missing_month([ASSET],months,now))
        with self.assertRaisesRegex(ValueError,"backfill window"):
            m.choose_missing_month([ASSET],sep,now,lookback=13)
        with self.assertRaisesRegex(ValueError,"closed"):
            m.bounds(dt.datetime.now(dt.timezone.utc).strftime("%Y-%m"))

    def test_new_fourth_exact_id_not_starved_by_three_older_assets(self):
        """Regression: new eligible coin must not wait a year behind three backfills."""
        now=dt.datetime(2026,10,10,17,0,tzinfo=dt.timezone.utc)
        qualified=[{**ASSET,"rank":75+i,"id":f"proven-{i}","symbol":f"T{i}",
                    "pair":f"T{i}USDT"} for i in range(4)]
        september={m.release_tag(a,"2026-09") for a in qualified[:3]}
        month,batch=m.select_pending_assets(qualified,september,now,limit=3)
        self.assertEqual(month,"2026-09")
        self.assertEqual([a["id"] for a in batch],["proven-3"])
        august=september|{m.release_tag(qualified[-1],"2026-09")}
        month,batch=m.select_pending_assets(qualified,august,now,limit=3)
        self.assertEqual(month,"2026-08")
        self.assertEqual([a["id"] for a in batch],["proven-0","proven-1","proven-2"])
        no_backlog=set()
        cursor="2026-09"
        for _ in range(12):
            no_backlog.update(m.release_tag(a,cursor) for a in qualified)
            cursor=m.previous_month(cursor)
        self.assertEqual(m.select_pending_assets(qualified,no_backlog,now),
                         (None,[]))
        with self.assertRaisesRegex(ValueError,"Duplicate"):
            m.select_pending_assets([qualified[0],qualified[0]],set(),now)
        with self.assertRaisesRegex(ValueError,"batch"):
            m.select_pending_assets(qualified,set(),now,limit=4)

    def test_scheduled_rotation_escapes_missing_month_and_first_three(self):
        """Repeated failures of one month/asset cannot block older real sources."""
        now=dt.datetime(2026,10,10,17,0,tzinfo=dt.timezone.utc)
        coins=[{**ASSET,"rank":70+i,"id":f"source-{i}","symbol":f"R{i}",
                "pair":f"R{i}USDT"} for i in range(5)]
        september={m.release_tag(a,"2026-09") for a in coins}
        first_month,first=m.select_pending_assets(
            coins,september,now,limit=3,rotation=0)
        self.assertEqual(first_month,"2026-08")
        self.assertEqual([a["id"] for a in first],
                         ["source-0","source-1","source-2"])
        month,second=m.select_pending_assets(
            coins,september,now,limit=3,rotation=1)
        self.assertEqual(month,"2026-07")
        self.assertEqual([a["id"] for a in second],
                         ["source-1","source-2","source-3"])
        month,third=m.select_pending_assets(
            coins,september,now,limit=3,rotation=2)
        self.assertEqual(month,"2026-06")
        self.assertEqual([a["id"] for a in third],
                         ["source-2","source-3","source-4"])

    def test_new_proven_assets_prioritized_without_starving_backfill(self):
        now=dt.datetime(2026,10,10,17,0,tzinfo=dt.timezone.utc)
        coins=[{**ASSET,"rank":70+i,"id":f"known-{i}","symbol":f"K{i}",
                "pair":f"K{i}USDT"} for i in range(4)]
        newcomer={**ASSET,"rank":90,"id":"new-proof","symbol":"NEW",
                  "pair":"NEWUSDT"}
        september={m.release_tag(a,"2026-09") for a in coins}
        for slot in (0,1,2,3):
            month,group=m.select_pending_assets(
                coins+[newcomer],september,now,limit=3,rotation=slot)
            self.assertEqual(month,"2026-09")
            self.assertEqual([a["id"] for a in group],["new-proof"])
        older,group=m.select_pending_assets(
            coins+[newcomer],september,now,limit=3,rotation=4)
        self.assertNotEqual(older,"2026-09")
        self.assertTrue(group)
        self.assertNotIn("new-proof",{a["id"] for a in group})
        with self.assertRaisesRegex(ValueError,"rotation"):
            m.select_pending_assets(coins,september,now,rotation=-1)
        with self.assertRaisesRegex(ValueError,"rotation"):
            m.select_pending_assets(coins,september,now,rotation=True)

    def test_selection_never_promotes_unqualified_symbols(self):
        src=json.loads(m.proof.CATALOG.read_text())
        alt=json.loads(m.proof.EXACT.read_text())
        venue=json.loads(m.proof.INSTRUMENTS.read_text())
        qualified=m.proof.candidates(src,alt,venue)
        exact_ids={a["id"] for a in qualified}
        self.assertTrue({"cosmos","lighter","stable-2"}<=exact_ids)
        self.assertEqual(len(exact_ids),len(qualified))
        month,batch=m.select_pending_assets(qualified,set(),
                 dt.datetime(2026,10,10,tzinfo=dt.timezone.utc),limit=3)
        self.assertEqual(month,"2026-09")
        self.assertEqual(len(batch),3)
        self.assertTrue({a["id"] for a in batch}<=exact_ids)

    def test_automatic_collect_is_wired_to_new_exact_id_evidence_only(self):
        """New proof runs the existing verified collector; negatives never promote."""
        workflow=Path(__file__).resolve().parents[3] / ".github/workflows/agent-crypto-bitget-native-monthly.yml"
        text=workflow.read_text(encoding="utf-8")
        self.assertIn("'public/agent_crypto_erith_ia/data/historical_archive_prototype/top250-alt-market-evidence.json'",text)
        self.assertIn("'public/agent_crypto_erith_ia/data/historical_archive_prototype/top250-official-spot-instruments.json'",text)
        self.assertIn("new_ids=updated_ids-old_ids",text)
        self.assertIn("permitted=bool(new_ids)",text)
        self.assertIn("steps.eligible.outputs.collect == 'true'",text)
        self.assertIn("--collect --month auto --lookback-months 12 --limit 3",text)
        self.assertIn("fetch-depth: 0",text)
        self.assertIn("29 1,7,13,19 * * *",text)
        self.assertIn("Agent Crypto Top250 Alternative Spot Market Discovery",text)
        self.assertIn("github.event.workflow_run.conclusion == 'success'",text)
        self.assertIn("github.event.workflow_run.head_branch == 'main'",text)
        self.assertIn("DISCOVERY_BASE_SHA",text)
        self.assertIn("'merge-base','--is-ancestor',before,'HEAD'",text)
        self.assertIn("if event=='push' and (workflow in changed or collector in changed)",text)
        self.assertIn("steps.eligible.outputs.collect == 'true'",text)
        self.assertIn("cancel-in-progress: false",text)

    def test_closed_month_and_release_identity(self):
        self.assertEqual(m.bounds("2026-09")[2],43200)
        self.assertEqual(m.release_tag(ASSET,"2026-09"),
                         "crypto-spot-bitget-2026-09-1m-cosmos")
        for unsafe in ({**ASSET,"pair":"BTCUSDT"},
                       {**ASSET,"id":"../../bad"},
                       {**ASSET,"symbol":"ATOM;rm"}):
            with self.assertRaises(ValueError):
                m.release_tag(unsafe,"2026-09")
        with self.assertRaises(ValueError):
            m.bounds("2026-13")

    def test_no_unsupported_id_claims_from_current_proof(self):
        src=json.loads(m.proof.CATALOG.read_text())
        alt=json.loads(m.proof.EXACT.read_text())
        venue=json.loads(m.proof.INSTRUMENTS.read_text())
        matches=m.proof.candidates(src,alt,venue)
        self.assertTrue(all(a["pair"]==a["symbol"]+"USDT"
                            and a["venue"]=="bitget" for a in matches))
        self.assertTrue(all(not next(c for c in src["assets"]
                           if c["id"]==a["id"])["months"] for a in matches))

if __name__=="__main__":
    unittest.main(verbosity=2)
