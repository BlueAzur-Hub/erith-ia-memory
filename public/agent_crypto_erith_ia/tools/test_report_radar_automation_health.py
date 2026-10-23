#!/usr/bin/env python3
import copy
import datetime as dt
import pathlib
import sys
import unittest

sys.path.insert(0,str(pathlib.Path(__file__).resolve().parent))
from report_radar_automation_health import observe

DAY=dt.datetime(2026,10,20,8,15,tzinfo=dt.timezone.utc)
ARCHIVE={"observed_date_utc":"2026-10-20"}
Q={"schema":"erith.radar.spot-qualification.v1",
   "source_observation_date_utc":"2026-10-20",
   "qualified_at_utc":"2026-10-20T08:07:00Z",
   "real_orders_enabled":False,"actual_execution_permissions":False,
   "candidates":[{"id":str(i)} for i in range(20)]}
J={"schema":"erith.radar.okx.hurdle-followups.v1","orders_enabled":False,
   "real_orders":0,"paper_fills":0,"backtest":False,
   "snapshots":[{"qualified_at_utc":Q["qualified_at_utc"],"candidates":20,
                 "orders_enabled":False}],
   "studies":[{"followups":[]}]}


class HealthTests(unittest.TestCase):
 def test_first_snapshot_waiting_is_visible_not_fictional(self):
  x=observe(DAY,None,Q,None)
  self.assertEqual(x["status"],"WAITING_DAILY_ARCHIVE")
  self.assertFalse(x["healthy_current_qualification"])
  self.assertFalse(x["journal_published"])
  self.assertEqual(x["prospective_studies_archived"],0)

 def test_expected_archive_missing_after_fallback_is_reported(self):
  later=DAY.replace(hour=16)
  x=observe(later,None,Q,None)
  self.assertEqual(x["status"],"DAILY_ARCHIVE_MISSING")

 def test_archive_today_but_qualification_old_is_not_healthy(self):
  stale={**Q,"source_observation_date_utc":"2026-10-19",
         "qualified_at_utc":"2026-10-19T23:59:33Z"}
  x=observe(DAY,ARCHIVE,stale,J)
  self.assertEqual(x["status"],"WAITING_TODAY_QUALIFICATION")
  self.assertFalse(x["journal_contains_today_qualification"])

 def test_actual_17_candidacies_cannot_be_promoted_to_20(self):
  archive={**ARCHIVE,"groups":{
   "momentum_24h_7d":[{"id":"momentum-"+str(i)} for i in range(12)],
   "rebound_24h_only":[{"id":"rebound-"+str(i)} for i in range(5)]},
   "scout_candidates":[{"id":"momentum-0"},{"id":"momentum-1"},{"id":"extra"}]}
  stale={**Q,"source_observation_date_utc":"2026-10-19",
         "qualified_at_utc":"2026-10-19T08:07:00Z"}
  x=observe(DAY,archive,stale,J)
  self.assertEqual(x["status"],"INSUFFICIENT_RADAR_CANDIDATES")
  self.assertEqual(x["radar_momentum_rebound_candidates_today"],17)
  self.assertEqual(x["radar_candidate_shortfall"],3)
  self.assertEqual(x["radar_target_candidates"],20)
  self.assertFalse(x["healthy_current_qualification"])
  self.assertFalse(x["qualification_today_published"])

 def test_today_qualification_without_journal_is_a_failure_not_0_opportunities(self):
  x=observe(DAY,ARCHIVE,Q,None)
  self.assertEqual(x["status"],"JOURNAL_NOT_PUBLISHED_FOR_TODAY")
  self.assertFalse(x["healthy_current_qualification"])

 def test_valid_empty_journal_is_healthy_not_a_fabricated_win(self):
  empty={**J,"studies":[]}
  x=observe(DAY,ARCHIVE,Q,empty)
  self.assertEqual(x["status"],"PROSPECTIVE_JOURNAL_PUBLISHED")
  self.assertTrue(x["journal_contains_today_qualification"])
  self.assertTrue(x["healthy_current_qualification"])
  self.assertEqual(x["prospective_studies_archived"],0)
  self.assertEqual(x["paper_fills"],0)
  self.assertEqual(x["real_orders"],0)

 def test_journal_must_match_qualification_not_just_exist(self):
  old=copy.deepcopy(J)
  old["snapshots"][0]["qualified_at_utc"]="2026-10-19T23:59:33Z"
  self.assertEqual(observe(DAY,ARCHIVE,Q,old)["status"],
                   "JOURNAL_NOT_PUBLISHED_FOR_TODAY")
  old["snapshots"]=[{**J["snapshots"][0],"orders_enabled":True}]
  self.assertFalse(observe(DAY,ARCHIVE,Q,old)["healthy_current_qualification"])

 def test_no_live_orders_ever_qualified_as_success(self):
  fake={**Q,"real_orders_enabled":True}
  self.assertEqual(observe(DAY,ARCHIVE,fake,J)["status"],
                   "WAITING_TODAY_QUALIFICATION")
  fake={**J,"paper_fills":1}
  self.assertFalse(observe(DAY,ARCHIVE,Q,fake)["journal_published"])

if __name__=="__main__":unittest.main()
