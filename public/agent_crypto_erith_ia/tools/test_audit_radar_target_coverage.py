"""Only real committed public archives are used for the base fixture.
Mutated follow-ups below are synthetic, never published in the market Coffre.
"""
import copy
import datetime as dt
import json
import pathlib
import tempfile
import unittest
import audit_radar_target_coverage as report
from collect_radar_verified_targets import ROOT

SOURCE=ROOT/"data/crypto/radar-verified-target-hourly"
Q=ROOT/"data/crypto/radar-opportunities/qualification-latest.json"
I=ROOT/"data/crypto/radar-opportunities/spot-identity-latest.json"

def first_hour_fixture(folder):
    source=json.loads((SOURCE/"2026-10-22.json").read_text(encoding="utf-8"))
    first=copy.deepcopy(source["hours"][0])
    day={"schema":source["schema"],"date_utc":"2026-10-22",
         "hours":[first],"orders_enabled":False,"real_orders":0}
    status={"schema":"erith.radar.verified-target-hourly.latest.v1",
            "hour_utc":first["hour_utc"],"observed_at_utc":first["observed_at_utc"],
            "source_date_utc":"2026-10-22","target_count":3,
            "markets_observed":first["markets_observed"],
            "orders_enabled":False,"real_orders":0}
    write(folder,day,status)
    return day,status

def write(root,day,status):
    (root/(day["date_utc"]+".json")).write_text(json.dumps(day),encoding="utf-8")
    (root/"latest.json").write_text(json.dumps(status),encoding="utf-8")

def shifted(record,hours):
    updated=copy.deepcopy(record)
    old=dt.datetime.fromisoformat(record["observed_at_utc"].replace("Z","+00:00"))
    def shift(s):
        return (dt.datetime.fromisoformat(s.replace("Z","+00:00"))+
                dt.timedelta(hours=hours)).isoformat(timespec="seconds").replace("+00:00","Z")
    updated["hour_utc"]=(old+dt.timedelta(hours=hours)).strftime("%Y-%m-%dT%HZ")
    updated["observed_at_utc"]=shift(record["observed_at_utc"])
    for market in updated["markets"]:
        proof=market["proof"]
        for x in ("native_checked_at_utc",):
            proof["identity"][x]=shift(proof["identity"][x])
        for part in ("ticker","book"):
            proof[part]["source_at_utc"]=shift(proof[part]["source_at_utc"])
        for bar in proof["closed_15m"]:
            bar["open_at_utc"]=shift(bar["open_at_utc"])
    return updated

class Audit(unittest.TestCase):
    def test_first_real_hour_means_no_change_and_10_priorities(self):
        with tempfile.TemporaryDirectory() as t:
            root=pathlib.Path(t)
            day,status=first_hour_fixture(root)
            r=report.analyze(root,Q,I)
            self.assertEqual(r["coverage"]["hours_archived"],1)
            self.assertEqual(r["coverage"]["expected_hours_since_first"],1)
            self.assertEqual(r["coverage"]["markets_observed_latest"],3)
            self.assertEqual(r["priority_count"],10)
            self.assertEqual(r["candidate_count"],20)
            self.assertEqual(sum(x["hourly_target_enabled"] for x in r["priority_queue"]),1)
            self.assertEqual([x["symbol"] for x in r["assets"]],["BR","JCT","BEAM"])
            self.assertTrue(all(x["change_last_consecutive_hour_pct"] is None
                                for x in r["assets"]))
            self.assertTrue(all(x["latest_hour_observed"] for x in r["assets"]))
            self.assertFalse(r["orders_enabled"])
            self.assertTrue(report.save(r,root)["changed"])
            self.assertFalse(report.save(r,root)["changed"])

    def test_two_consecutive_measurements_can_compute_delta_but_no_signal(self):
        with tempfile.TemporaryDirectory() as t:
            root=pathlib.Path(t)
            day,status=first_hour_fixture(root)
            nxt=shifted(day["hours"][0],1)
            nxt["markets"][0]["proof"]["ticker"]["last"]=str(
                 float(nxt["markets"][0]["proof"]["ticker"]["last"])*1.01)
            day["hours"].append(nxt)
            status["hour_utc"]=nxt["hour_utc"]
            status["observed_at_utc"]=nxt["observed_at_utc"]
            write(root,day,status)
            r=report.analyze(root,Q,I)
            self.assertEqual(r["coverage"]["hours_archived"],2)
            self.assertEqual(r["assets"][0]["hours_observed"],2)
            self.assertIsNotNone(r["assets"][0]["change_last_consecutive_hour_pct"])
            self.assertEqual(r["assets"][0]["reversal_certified"],False)
            self.assertEqual(r["real_orders"],0)

    def test_missing_hour_and_failed_contract_revoke_hourly_delta(self):
        with tempfile.TemporaryDirectory() as t:
            root=pathlib.Path(t)
            day,status=first_hour_fixture(root)
            nxt=shifted(day["hours"][0],2)
            nxt["markets"][1]["status"]="UNAVAILABLE"
            nxt["markets"][1]["proof"]=None
            nxt["markets"][1]["unavailable_reason"]="ValueError"
            nxt["markets_observed"]=2
            day["hours"].append(nxt)
            status["hour_utc"]=nxt["hour_utc"]
            status["observed_at_utc"]=nxt["observed_at_utc"]
            status["markets_observed"]=2
            write(root,day,status)
            r=report.analyze(root,Q,I)
            self.assertEqual(r["coverage"]["hours_without_archive"],1)
            self.assertEqual(r["assets"][1]["hours_unavailable"],1)
            self.assertEqual(r["assets"][1]["latest_real_price_usdt"],None)
            self.assertEqual(r["assets"][0]["change_last_consecutive_hour_pct"],None)

    def test_identity_mutation_crossed_book_or_duplicate_time_fails_closed(self):
        with tempfile.TemporaryDirectory() as t:
            root=pathlib.Path(t)
            day,status=first_hour_fixture(root)
            day["hours"][0]["markets"][0]["proof"]["identity"]["contract_address"]="0x"+"1"*40
            write(root,day,status)
            with self.assertRaisesRegex(ValueError,"Contrat"):
                report.analyze(root,Q,I)
            day,status=first_hour_fixture(root)
            day["hours"][0]["markets"][0]["proof"]["book"]["best_bid"]="90000"
            write(root,day,status)
            with self.assertRaisesRegex(ValueError,"spread"):
                report.analyze(root,Q,I)
            day,status=first_hour_fixture(root)
            day["hours"].append(copy.deepcopy(day["hours"][0]))
            write(root,day,status)
            with self.assertRaisesRegex(ValueError,"doublonnée"):
                report.analyze(root,Q,I)

    def test_priority_does_not_promote_symbol_only_candidates(self):
        with tempfile.TemporaryDirectory() as t:
            root=pathlib.Path(t)
            first_hour_fixture(root)
            q=json.loads(Q.read_text())
            self.assertIn("auction",q["priority_research_ids"])
            copies=root/"qual.json"
            q["priority_research_ids"][1]="unlisted-fiction"
            copies.write_text(json.dumps(q))
            with self.assertRaisesRegex(ValueError,"hors qualification"):
                report.analyze(root,copies,I)

if __name__=="__main__":
    unittest.main()
