#!/usr/bin/env python3
"""Research only: BAT, ALT, REZ native-project token references vs archival Spot pairs.

No symbol => contract mapping inference. No live account, no trading, no network
calls and no new collection timer. Rebuilt from the canonical Oct 20 snapshots;
primary token references are manually sourced, NOT exchange identity proofs.
"""
from __future__ import annotations

import datetime as dt
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
BASE = ROOT / "data/crypto/radar-opportunities"
QUALIFICATION = BASE / "qualification-latest.json"
IDENTITIES = BASE / "spot-identity-latest.json"
OUTPUT = BASE / "focus-identity-review.json"
SCHEMA = "erith.radar.focus-identity-review.v1"

# These references establish the project token on a specified chain only.
# They do NOT prove which asset Binance or OKX lists for the same ticker.
SOURCES = (
    ("basic-attention-token", "BAT", "BATUSDT", "ethereum",
     "0x0d8775f648430679a709e98d2b0cb6250d2887ef",
     "PROJECT_PRIMARY", "https://basicattentiontoken.org/FAQ/"),
    ("altlayer", "ALT", "ALTUSDT", "ethereum",
     "0x8457ca5040ad67fdebbcc8edce889a335bc0fbfb",
     "COINGECKO_CONTRACT_REFERENCE", "https://www.coingecko.com/en/coins/altlayer"),
    ("renzo", "REZ", "REZUSDT", "ethereum",
     "0x3b50805453023a91a8bf641e279401a0b23fa6f9",
     "PROJECT_PRIMARY", "https://docs.renzoprotocol.com/docs/contracts/ethereum-mainnet"),
)


def require(condition, reason):
    if not condition:
        raise ValueError(reason)


def instant(value):
    require(isinstance(value,str) and
            re.fullmatch(r"\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z",value),
            "Date de collecte non UTC")
    stamp = dt.datetime.fromisoformat(value.replace("Z","+00:00"))
    require(stamp.utcoffset() == dt.timedelta(0), "Horodatage non UTC")
    return stamp


def build(qualification, identities):
    require(qualification.get("schema") == "erith.radar.spot-qualification.v1"
            and qualification.get("real_orders_enabled") is False
            and qualification.get("actual_execution_permissions") is False
            and qualification.get("coin_id_matches_exchange_symbol_verified") is False
            and qualification.get("universe_preselected") == 20
            and len(qualification.get("priority_research_ids",[])) == 10
            and identities.get("schema") == "erith.radar.spot-identity-prospective.v1"
            and identities.get("orders_enabled") is False
            and identities.get("real_orders") == 0
            and identities.get("candidate_count") == 20, "Catalogue Radar non conforme")
    qualified_at = instant(qualification.get("qualified_at_utc"))
    identity_at = instant(identities.get("collected_at_utc"))
    require(qualified_at <= identity_at and
            identities.get("qualification_at_utc") == qualification["qualified_at_utc"] and
            identities.get("source_radar_day_utc") == qualification["source_observation_date_utc"],
            "Sources de recherche non contemporaines")
    qc = qualification.get("candidates")
    ic = identities.get("candidates")
    require(isinstance(qc,list) and len(qc)==20 and
            isinstance(ic,list) and len(ic)==20, "Inventaire incomplet")
    qm = {c["id"]:c for c in qc}
    im = {c["coin_id"]:c for c in ic}
    require(len(qm)==len(im)==20, "IDs candidats en doublon")
    rows=[]
    for coin_id,symbol,pair,network,contract,source_level,source_url in SOURCES:
        q=qm.get(coin_id)
        i=im.get(coin_id)
        require(q and i and coin_id in qualification["priority_research_ids"],
                "Priorité non retrouvée")
        m=q.get("market") or {}
        require(q.get("symbol")==i.get("symbol")==symbol and
                m.get("provider")==i.get("venue")=="Binance" and
                m.get("pair")==i.get("pair")==pair and
                m.get("quote")==i.get("quote")=="USDT" and
                q.get("pair_status")=="SPOT_SYMBOL_PAIR_OBSERVED" and
                q.get("identity_status")=="SYMBOL_ONLY_NOT_COIN_ID_PROVEN" and
                i.get("status")=="NATIVE_CONTRACT_SOURCE_NOT_SUPPORTED" and
                i.get("identity_proven") is False and
                i.get("contract_address") is None and
                i.get("paper_entry_price_usdt") is None and
                i.get("paper_pnl_usdt") is None and i.get("real_orders")==0,
                "L'identité de la paire aurait évolué : nouvel audit requis")
        require(re.fullmatch(r"0x[0-9a-f]{40}",contract) and
                source_url.startswith("https://"), "Référence de contrat invalide")
        okx=q.get("okx_spot") or {}
        okx_pair = okx.get("pair") if okx.get("pair_observed") is True else None
        if symbol=="BAT":
            require(okx_pair=="BAT-USDT" and
                    okx.get("contract_identity_proven") is False,
                    "La preuve OKX BAT doit rester non certifiée")
        else:
            require(okx_pair is None, "Nouvelle paire OKX découverte : requalification nécessaire")
        rows.append({
            "coin_id":coin_id,"symbol":symbol,"research_priority_rank":
                qualification["priority_research_ids"].index(coin_id)+1,
            "research_pair":pair,"research_venue":"Binance","quote":"USDT",
            "research_pair_observed_as_of_utc":qualified_at.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "secondary_okx_pair_historical":okx_pair,
            "project_token_reference":{"chain":network,"address":contract,
                "source_level":source_level,"source_url":source_url,
                "exchange_identity_evidence":False},
            "binance_native_token_contract_crosscheck":"NOT_AVAILABLE_IN_PUBLIC_EXCHANGE_INFO",
            "exchange_coin_id_mapping_proven":False,
            "exchange_contract_identity_proven":False,
            "spot_pair_fresh_now":False,
            "hourly_target_enabled":False,
            "paper_decision":"IDENTITY_REVIEW_ONLY",
            "next_evidence":"INDEPENDENT_NATIVE_EXCHANGE_CONTRACT_OR_OFFICIAL_LISTING_LINK_REQUIRED",
            "orders_enabled":False,"real_orders":0})
    return {
        "schema":SCHEMA,
        "qualification_at_utc":qualification["qualified_at_utc"],
        "identity_catalogue_at_utc":identities["collected_at_utc"],
        "priority_source_day_utc":qualification["source_observation_date_utc"],
        "evidence_scope":"ARCHIVED_2026_10_20_PLUS_PROJECT_TOKEN_REFERENCES",
        "target_count":len(rows),"targets":rows,
        "pending_identity_count":len(rows),
        "candidate_count":20,"priority_count":10,
        "native_exchange_contract_mapping_verified_count":0,
        "hourly_targets_activated":0,"new_network_requests":0,
        "no_promotion_by_symbol":True,"observation_only":True,
        "no_real_market_data_in_this_report":True,
        "source_urls_are_references_not_native_exchange_proof":True,
        "orders_enabled":False,"real_orders":0,
        "notes":[
            "La preuve d'un contrat de projet ne prouve pas la correspondance du ticker sur un exchange.",
            "Les métadonnées Binance ExchangeInfo Spot n'apportent pas seules un contrat natif de token.",
            "L'absence de champ timestamp sur un ancien book Binance n'est pas une fraîcheur certifiée.",
            "Aucun nouveau marché BR/JCT/BEAM ou ZEC/AXIS ajouté ici ; aucun ordre ni simulation exécutée.",
        ],
    }


def main():
    if "--check" in sys.argv:
        document=json.loads(OUTPUT.read_text(encoding="utf-8"))
        generated=build(json.loads(QUALIFICATION.read_text(encoding="utf-8")),
                        json.loads(IDENTITIES.read_text(encoding="utf-8")))
        require(document == generated,"Audit ciblé absent ou divergences : ne pas publier")
        print("Focus dossier verified: BAT, ALT, REZ / 0 exchange mappings proven")
        return
    result=build(json.loads(QUALIFICATION.read_text(encoding="utf-8")),
                 json.loads(IDENTITIES.read_text(encoding="utf-8")))
    OUTPUT.write_text(json.dumps(result,ensure_ascii=False,indent=2,sort_keys=True)+"\n",
                      encoding="utf-8")
    print("Focus dossier created: three priorities; all mappings blocked; orders disabled")

if __name__ == "__main__":
    main()
