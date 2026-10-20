#!/usr/bin/env python3
"""Report whether the self-hosted GitHub Radar publication really produced data.

This is a public-data-only heartbeat, not a live quote, investment signal or trade.
A workflow scheduled successfully is not itself a successful daily observation.
"""
from __future__ import annotations
import argparse
import datetime as dt
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/"data/crypto/radar-opportunities"
OUT=DATA/"radar-automation-health.json"
SCHEMA="erith.radar.automation-health.v1"


def load(path):
    try:
        value=json.loads(path.read_text(encoding="utf-8"))
        return value if isinstance(value,dict) else None
    except (OSError,ValueError):
        return None


def parse_time(value):
    if not isinstance(value,str) or not value.endswith("Z"):
        return None
    try:
        got=dt.datetime.fromisoformat(value.replace("Z","+00:00"))
        if got.utcoffset()!=dt.timedelta(0):
            return None
        return got
    except ValueError:
        return None


def observe(at,archive,qualification,journal):
    assert at.tzinfo is not None and at.utcoffset()==dt.timedelta(0)
    day=at.date().isoformat()
    archive_present=isinstance(archive,dict) and archive.get("observed_date_utc")==day
    q=qualification if isinstance(qualification,dict) else {}
    qualified_time=parse_time(q.get("qualified_at_utc"))
    qualification_today=(
        q.get("schema")=="erith.radar.spot-qualification.v1" and
        q.get("source_observation_date_utc")==day and qualified_time is not None and
        qualified_time.date()==at.date() and qualified_time<=at and
        q.get("real_orders_enabled") is False and
        q.get("actual_execution_permissions") is False and
        isinstance(q.get("candidates"),list) and len(q["candidates"])==20
    )
    j=journal if isinstance(journal,dict) else {}
    journal_ok=(
        j.get("schema")=="erith.radar.okx.hurdle-followups.v1" and
        j.get("orders_enabled") is False and j.get("real_orders")==0 and
        j.get("paper_fills")==0 and j.get("backtest") is False and
        isinstance(j.get("snapshots"),list) and isinstance(j.get("studies"),list)
    )
    snapshots=j.get("snapshots",[]) if journal_ok else []
    latest_q=q.get("qualified_at_utc") if qualification_today else None
    matching=(journal_ok and qualification_today and any(
        x.get("qualified_at_utc")==latest_q and x.get("candidates")==20 and
        x.get("orders_enabled") is False for x in snapshots if isinstance(x,dict)))
    if not archive_present:
        status="WAITING_DAILY_ARCHIVE" if at.hour<15 or (at.hour==15 and at.minute<30) else "DAILY_ARCHIVE_MISSING"
    elif not qualification_today:
        status="WAITING_TODAY_QUALIFICATION" if at.hour<15 or (at.hour==15 and at.minute<30) else "QUALIFICATION_MISSING"
    elif not matching:
        status="JOURNAL_NOT_PUBLISHED_FOR_TODAY"
    else:
        status="PROSPECTIVE_JOURNAL_PUBLISHED"
    studies=j.get("studies",[]) if journal_ok else []
    followups=sum(len(s.get("followups",[])) for s in studies if isinstance(s,dict) and isinstance(s.get("followups"),list))
    return {
        "schema":SCHEMA,"checked_at_utc":at.isoformat(timespec="seconds").replace("+00:00","Z"),
        "expected_observation_date_utc":day,
        "status":status,"healthy_current_qualification":bool(matching),
        "archive_today_published":archive_present,
        "qualification_today_published":qualification_today,
        "last_qualification_at_utc":q.get("qualified_at_utc") if qualified_time else None,
        "journal_published":journal_ok,
        "journal_contains_today_qualification":bool(matching),
        "prospective_studies_archived":len(studies),
        "future_public_book_observations":followups,
        "real_orders":0,"paper_fills":0,"orders_enabled":False,
        "note":"GitHub task health; only actual dated public archives count. Empty ≠ profitable; no real fills."
    }


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--require-ready",action="store_true",
        help="Fail publication if current daily qualification has no matching immutable journal")
    args=parser.parse_args()
    now=dt.datetime.now(dt.timezone.utc)
    q=load(DATA/"qualification-latest.json")
    report=observe(now,load(DATA/(now.date().isoformat()+".json")),
        q,load(DATA/"okx-hurdle-followups.json"))
    serialized=json.dumps(report,ensure_ascii=False,sort_keys=True,indent=2)+"\n"
    if not OUT.exists() or OUT.read_text(encoding="utf-8")!=serialized:
        OUT.write_text(serialized,encoding="utf-8")
    print(json.dumps({k:report[k] for k in (
        "status","archive_today_published","qualification_today_published",
        "journal_published","journal_contains_today_qualification",
        "prospective_studies_archived","future_public_book_observations")}))
    if args.require_ready and not report["healthy_current_qualification"]:
        raise SystemExit("RADAR_NOT_READY: daily qualification not fully archived; refusing publication")


if __name__=="__main__":
    main()
