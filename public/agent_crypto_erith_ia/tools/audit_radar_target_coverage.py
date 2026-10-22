#!/usr/bin/env python3
"""Read-only reconciliation of archived PUBLIC Bitget Spot targets and Radar queue.

Reuses the existing hourly GitHub workflow. No exchange call, order, prediction
or retroactive interpolation. A catalogue dated two days ago stays dated.
"""
from __future__ import annotations

import datetime as dt
import hashlib
import json
import os
import pathlib
import re
from decimal import Decimal, InvalidOperation

from collect_radar_verified_targets import ROOT, OUTPUT, TARGETS, SCHEMA

QUALIFICATION = ROOT / "data/crypto/radar-opportunities/qualification-latest.json"
IDENTITIES = ROOT / "data/crypto/radar-opportunities/spot-identity-latest.json"
REPORT_SCHEMA = "erith.radar.target-coverage-and-queue.v1"
UTC = dt.timezone.utc


def ensure(predicate, reason):
    if not predicate:
        raise ValueError(reason)


def parse_utc(value):
    ensure(isinstance(value, str) and re.fullmatch(
        r"\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ", value), "Horodatage UTC invalide")
    try:
        result = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValueError("Date UTC non valide") from exc
    return result


def positive(raw, allow_zero=False):
    ensure(isinstance(raw, str) and 0 < len(raw) < 55,
           "Prix decimal attendu")
    try:
        d = Decimal(raw)
    except InvalidOperation as exc:
        raise ValueError("Prix décimal invalide") from exc
    ensure(d.is_finite() and d < Decimal("1e24") and
           (d >= 0 if allow_zero else d > 0), "Prix hors bornes")
    return d


def archive_hour(value):
    ensure(isinstance(value, str) and
           re.fullmatch(r"\d{4}-\d\d-\d\dT\d\dZ", value),
           "Heure archive invalide")
    try:
        out = dt.datetime.strptime(value, "%Y-%m-%dT%HZ").replace(tzinfo=UTC)
    except ValueError as exc:
        raise ValueError("Heure impossible") from exc
    return out


def validate_market(row, target, at):
    coin_id, sym, pair, network, contract = target
    ensure(isinstance(row, dict) and
           row.get("coin_id") == coin_id and row.get("symbol") == sym and
           row.get("pair") == pair and row.get("venue") == "Bitget" and
           row.get("type") == "SPOT" and row.get("quote") == "USDT" and
           row.get("platform") == network and row.get("contract_address") == contract,
           "Identité Spot candidate changeante")
    ensure(row.get("status") in ("OBSERVED", "UNAVAILABLE"), "Statut invalide")
    if row["status"] == "UNAVAILABLE":
        ensure(row.get("proof") is None, "Prix interdit sans source")
        return None
    proof = row.get("proof")
    ensure(isinstance(proof, dict) and
           proof.get("execution_proven") is False and
           proof.get("account_rules_verified") is False,
           "Interdiction des ordres")
    ident, ticker, book = (proof.get(x) for x in ("identity", "ticker", "book"))
    ensure(isinstance(ident, dict) and ident.get("coin_id") == coin_id and
           ident.get("platform") == network and
           ident.get("contract_address") == contract and
           ident.get("same_chain_and_address") is True,
           "Contrat natif non prouvé")
    ensure(isinstance(ticker, dict) and isinstance(book, dict) and
           book.get("fill_proven") is False, "Données de carnet absentes")
    for stamp in [ident.get("native_checked_at_utc"),
                  ticker.get("source_at_utc"), book.get("source_at_utc")]:
        ensure(abs((parse_utc(stamp) - at).total_seconds()) <= 300,
               "Source Spot non contemporaine")
    last = positive(ticker.get("last"))
    bid = positive(book.get("best_bid"))
    ask = positive(book.get("best_ask"))
    spread = positive(book.get("spread_bps"), True)
    ensure(bid < ask and
           abs(spread - (ask - bid) * Decimal(10000) / ((ask + bid) / 2))
              <= Decimal("0.03"), "Carnet croisé / spread incohérent")
    positive(book.get("top5_bid_quote_depth"), True)
    positive(book.get("top5_ask_quote_depth"), True)
    bars=proof.get("closed_15m")
    ensure(isinstance(bars, list) and 1 <= len(bars) <= 4,
           "Bougies 15m absentes")
    last_bar=None
    for bar in bars:
        t=parse_utc(bar.get("open_at_utc"))
        ensure(t.minute in (0,15,30,45) and t.second == 0 and
               t + dt.timedelta(minutes=15,seconds=15) <= at and
               (last_bar is None or t > last_bar), "Bougie non close ou désordonnée")
        last_bar=t
        op, hi, lo, cl = [positive(bar.get(x)) for x in
                           ("open", "high", "low", "close")]
        ensure(lo <= min(op,cl) <= max(op,cl) <= hi, "OHLC incohérent")
    return {"last_usdt":str(last),"spread_bps":str(spread),
            "best_bid_usdt":str(bid),"best_ask_usdt":str(ask)}


def analyze(root=OUTPUT, qualification=QUALIFICATION, identities=IDENTITIES):
    status_path=root/"latest.json"
    ensure(status_path.is_file(), "Aucune collecte réelle ciblée")
    latest=json.loads(status_path.read_text(encoding="utf-8"))
    ensure(latest.get("schema") ==
           "erith.radar.verified-target-hourly.latest.v1" and
           latest.get("orders_enabled") is False and latest.get("real_orders")==0 and
           latest.get("target_count")==3, "État principal invalide")
    last_hour=archive_hour(latest.get("hour_utc"))
    ensure(latest.get("source_date_utc")==last_hour.date().isoformat(),
           "Date du journal incohérente")
    latest_at=parse_utc(latest.get("observed_at_utc"))
    ensure(latest_at.strftime("%Y-%m-%dT%HZ")==latest["hour_utc"],
           "Heure d'observation incohérente")
    days=[]
    prior=last_hour.date()-dt.timedelta(days=1)
    for date in (prior,last_hour.date()):
        path=root/(date.isoformat()+".json")
        if date==last_hour.date():
            ensure(path.is_file(), "Dernier jour manquant")
        if path.is_file():
            original=path.read_bytes()
            data=json.loads(original)
            ensure(data.get("schema")==SCHEMA and
                   data.get("date_utc")==date.isoformat() and
                   data.get("orders_enabled") is False and data.get("real_orders")==0
                   and isinstance(data.get("hours"),list) and
                   1 <= len(data["hours"]) <= 24, "Jour cible invalide")
            days.append((data,hashlib.sha256(original).hexdigest()))
    history=[]
    for day,digest in days:
        for record in day["hours"]:
            hour=archive_hour(record.get("hour_utc"))
            if hour < last_hour-dt.timedelta(hours=47):
                continue
            ensure(hour.date().isoformat()==day["date_utc"] and hour<=last_hour and
                   record.get("schema")==SCHEMA and
                   record.get("orders_enabled") is False and
                   record.get("real_orders")==0 and record.get("paper_fills")==0 and
                   record.get("total_targets")==3 and
                   len(record.get("markets",[]))==3, "Archive horaire incohérente")
            at=parse_utc(record.get("observed_at_utc"))
            ensure(at.strftime("%Y-%m-%dT%HZ")==record["hour_utc"],
                   "Moment de mesure incompatible")
            normalized=[]
            for i,target in enumerate(TARGETS):
                normalized.append(validate_market(record["markets"][i],target,at))
            ensure(record.get("markets_observed")==sum(x is not None for x in normalized),
                   "Nombre de marchés incohérent")
            history.append((hour,at,normalized))
    history.sort(key=lambda x:x[0])
    hours=[x[0] for x in history]
    ensure(history and len(hours)==len(set(hours)) and
           hours[-1]==last_hour and history[-1][1]==latest_at,
           "Archive introuvable, décalée ou doublonnée")
    count=sum(x is not None for x in history[-1][2])
    ensure(count==latest.get("markets_observed"), "Dernier compteur non concordant")
    expected_hours=int((last_hour-hours[0]).total_seconds()/3600)+1
    ensure(1<=expected_hours<=48,"Fenêtre invalide")
    assets=[]
    for i,(_,sym,pair,network,contract) in enumerate(TARGETS):
        observed=[(h,a,row[i]) for h,a,row in history if row[i] is not None]
        first,last=(observed[0],observed[-1]) if observed else (None,None)
        latest_present=last is not None and last[0]==last_hour
        previous_present=(len(observed)>=2 and latest_present and
                           observed[-2][0]==last_hour-dt.timedelta(hours=1))
        percent=None
        if previous_present:
            begin=Decimal(observed[-2][2]["last_usdt"])
            end=Decimal(last[2]["last_usdt"])
            percent=str((end/begin-1)*100)
        assets.append({
            "symbol":sym,"pair":pair,"venue":"Bitget","quote":"USDT",
            "contract":contract,"platform":network,
            "hours_observed":len(observed),
            "hours_unavailable":len(history)-len(observed),
            "hours_unarchived":expected_hours-len(history),
            "first_hour_utc":first[0].strftime("%Y-%m-%dT%HZ") if first else None,
            "last_hour_utc":last[0].strftime("%Y-%m-%dT%HZ") if last else None,
            "latest_hour_observed":latest_present,
            "latest_real_price_usdt":last[2]["last_usdt"] if latest_present else None,
            "latest_spread_bps":last[2]["spread_bps"] if latest_present else None,
            "change_last_consecutive_hour_pct":percent,
            "reversal_certified":False,"fill_certified":False
        })
    q=json.loads(qualification.read_text(encoding="utf-8"))
    ids=json.loads(identities.read_text(encoding="utf-8"))
    ensure(q.get("schema")=="erith.radar.spot-qualification.v1" and
           q.get("priority_target_count")==10 and
           q.get("real_orders_enabled") is False and
           q.get("actual_execution_permissions") is False and
           len(q.get("priority_research_ids",[]))==10,
           "Ancienne qualification non fiable")
    ensure(ids.get("schema")=="erith.radar.spot-identity-prospective.v1" and
           ids.get("candidate_count")==20 and ids.get("orders_enabled") is False and
           ids.get("real_orders")==0 and
           len(ids.get("candidates",[]))==20,
           "Identités Radar absentes")
    all_candidates={x.get("id"):x for x in q["candidates"]}
    all_identities={x.get("coin_id"):x for x in ids["candidates"]}
    ensure(len(all_candidates)==len(q["candidates"]) and
           len(all_identities)==20, "Candidate IDs non uniques")
    queue=[]
    for order,cid in enumerate(q["priority_research_ids"],1):
        cq=all_candidates.get(cid)
        ci=all_identities.get(cid)
        ensure(cq and ci and cq["symbol"]==ci["symbol"],
               "Priorité hors qualification")
        verified=(ci.get("identity_proven") is True and
                  ci.get("status")=="CONTRACT_MATCH_AT_COLLECTION")
        followed=any(t[0]==cid for t in TARGETS)
        ensure(not followed or verified, "Cible suivie non prouvée")
        queue.append({"priority_rank":order,"coin_id":cid,
            "symbol":cq["symbol"],"research_source_day_utc":
                q["source_observation_date_utc"],
            "venue_from_qualification":ci.get("venue"),
            "spot_pair_from_qualification":ci.get("pair"),
            "identity_evidence_status":ci["status"],
            "identity_verified_at_catalogue":verified,
            "hourly_target_enabled":followed,
            "next_action":"CONTINUE_VERIFIED_SPOT_OBSERVATION"
                  if followed else "VERIFY_IDENTITY_BEFORE_ANY_HOURLY_PROMOTION",
            "real_orders":0})
    source_info=[{"date_utc":d["date_utc"],"sha256":digest}
                 for d,digest in days]
    return {
        "schema":REPORT_SCHEMA,"as_of_observed_at_utc":latest["observed_at_utc"],
        "latest_hour_utc":latest["hour_utc"],
        "source_daily_files":source_info,
        "coverage":{"hours_archived":len(history),"expected_hours_since_first":expected_hours,
                    "hours_without_archive":expected_hours-len(history),
                    "markets_observed_latest":count,"target_count":3,
                    "window_max_hours":48},
        "assets":assets,
        "queue_source_qualified_at_utc":q["qualified_at_utc"],
        "identity_catalogue_collected_at_utc":ids["collected_at_utc"],
        "candidate_count":20,"priority_count":len(queue),
        "priority_queue":queue,
        "observation_only":True,"no_inferred_prices":True,
        "no_backfill":True,"no_new_exchange_requests":True,
        "orders_enabled":False,"real_orders":0,
        "remark":"A dated coverage report, not a live market, backtest, or signal."}


def save(report,root=OUTPUT):
    ensure(report.get("schema")==REPORT_SCHEMA and
           report.get("orders_enabled") is False and report.get("real_orders")==0
           and len(report.get("priority_queue",[]))==10,
           "Rapport hors politique")
    root.mkdir(parents=True,exist_ok=True)
    output=root/"coverage-latest.json"
    contents=json.dumps(report,ensure_ascii=False,indent=2,allow_nan=False)+"\n"
    if output.is_file() and output.read_text(encoding="utf-8")==contents:
        return {"changed":False,"status":"UNCHANGED"}
    temp=output.with_suffix(".writing")
    temp.write_text(contents,encoding="utf-8")
    os.replace(temp,output)
    return {"changed":True,"file":str(output)}

if __name__=="__main__":
    print(json.dumps(save(analyze())))
