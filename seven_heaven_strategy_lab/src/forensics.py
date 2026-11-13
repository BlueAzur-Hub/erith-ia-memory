"""V4.4 Aether Forensics: postmortem of VERIFIED, SAVED PAPER fills.

Replays the unchanged simulation on the same immutable SHA-verified candles,
then proves the old fills match the replay before attributing trace reasons.
This module does not place orders, change strategy rules or save files.
MFE and MAE are AFTER-THE-FACT candle high/low observations, not guaranteed
tradable moves, not causal inputs to the strategy, and not realized PnL.
"""
from __future__ import annotations

import math

from src.engine import LabError
from src.observatory import aggregate_bars, run_one

VIEW_LIMIT = 36
MAX_FILLS = 50000
COMPARE_FIELDS = ("timestamp", "side", "price", "qty", "fee", "cash_after")


def _asfloat(value):
    if isinstance(value, bool) or not isinstance(value, (float, int)):
        raise LabError("Transaction hypothétique incohérente")
    result = float(value)
    if not math.isfinite(result):
        raise LabError("Transaction hypothetique avec valeur non finie")
    return result


def _same_fills(saved, replayed):
    if not isinstance(saved, list) or not isinstance(replayed, list) or len(saved) != len(replayed):
        raise LabError("Transactions sauvegardées différentes du moteur PAPER : analyse refusée")
    if len(saved) > MAX_FILLS:
        raise LabError("Journal de simulation hors limites")
    for original, actual in zip(saved, replayed):
        if not isinstance(original, dict) or not isinstance(actual, dict):
            raise LabError("Transaction historique mal formée")
        if original.get("timestamp") != actual.get("timestamp") or original.get("side") != actual.get("side"):
            raise LabError("L'horodatage ou le sens des transactions ne correspond plus")
        for key in COMPARE_FIELDS[2:]:
            a,b=_asfloat(original.get(key)),_asfloat(actual.get(key))
            if not math.isclose(a,b,rel_tol=0,abs_tol=0.000012):
                raise LabError("Le journal PAPER diffère du moteur à la clé "+key)


def diagnose(saved_record, raw_bars, source):
    """Explain exact saved paper fills, not current draft settings or live market.

    Database identity and chronology must match; historical replays may lack
    V4.4 'reason' fields, but deterministic replay reconstructs them. Explicit
    refusal on divergence prevents falsely explaining changed fills.
    """
    if not isinstance(saved_record,dict) or not isinstance(source,dict):
        raise LabError("Rapport PAPER ou source indisponible")
    source_id=source.get("id")
    sha=source.get("sha256")
    if not isinstance(source_id,str) or not isinstance(sha,str) or len(sha)<12:
        raise LabError("Archive non identifiée cryptographiquement")
    run=saved_record.get("run")
    if not isinstance(run,dict):
        raise LabError("Rapport PAPER absent")
    data=run.get("data")
    params=run.get("params")
    if not isinstance(data,dict) or not isinstance(params,dict):
        raise LabError("Rapport ou paramètres PAPER incorrects")
    saved_sha=saved_record.get("source_sha256")
    if (saved_sha!=sha or data.get("source_id",saved_record.get("source",{}).get("id"))!=source_id
            or data.get("source_sha256",sha)!=sha):
        raise LabError("Le rapport et les bougies SHA-256 ne correspondent pas")
    if not isinstance(raw_bars,list) or len(raw_bars)<60:
        raise LabError("Bougies originales introuvables")
    timeframe=data.get("timeframe")
    expected=aggregate_bars(raw_bars,timeframe,source_timeframe=source["source_timeframe"])
    if (data.get("rows")!=len(expected) or data.get("first_utc")!=expected[0][0]
            or data.get("last_utc")!=expected[-1][0]):
        raise LabError("La fenêtre historique ne correspond plus au rapport PAPER")
    replayed=run_one(raw_bars,{**params,"timeframe":timeframe},
                     source_timeframe=source["source_timeframe"])
    result=run.get("results")
    if not isinstance(result,dict):
        raise LabError("Bilan de simulation manquant")
    original_final=_asfloat(result.get("equity_final"))
    replay_final=replayed["results"]["equity_final"]
    if not math.isclose(original_final,replay_final,rel_tol=0,abs_tol=0.00002):
        raise LabError("Le capital final diffère du rapport enregistré : diagnostic refusé")
    original_trades=run.get("trades",[])
    reconstructed=replayed.get("trades",[])
    _same_fills(original_trades,reconstructed)

    index={c[0]:i for i,c in enumerate(expected)}
    records=[]
    buys=[]
    for t in reconstructed:
        time=t["timestamp"]
        if time not in index:
            raise LabError("Horodatage d'exécution absent des bougies de simulation")
        if t["side"]=="BUY":
            buys.append(t)
        else:
            if not buys:
                raise LabError("Vente PAPER sans achat enregistré")
            records.append(_one_position(buys,t,expected,index,source))
            buys=[]
    if buys:
        records.append(_one_position(buys,None,expected,index,source))
    closed=[p for p in records if p["status"]=="CLOSED"]
    open_positions=[p for p in records if p["status"]=="OPEN"]
    realized=sum(p["net_pnl_quote"] for p in closed)
    saved_analytics=run.get("analytics",{})
    if isinstance(saved_analytics,dict):
        existing=saved_analytics.get("realized_pnl_quote")
        if existing is not None and not math.isclose(realized,_asfloat(existing),
                         rel_tol=0,abs_tol=0.04):
            raise LabError("Reconstruction du résultat réalisé incohérente")
    gains=sum(p["net_pnl_quote"]>0.00001 for p in closed)
    losses=sum(p["net_pnl_quote"]<-0.00001 for p in closed)
    reasons={}
    for p in records:
        code=p["exit_reason_code"]
        if code:
            reasons[code]=reasons.get(code,0)+1
    evidence_count=sum(len(p["entries"])+(1 if p["exit"] else 0) for p in records)
    if evidence_count!=len(reconstructed):
        raise LabError("Journal des opérations incomplet")
    return {
        "schema":"seven.heaven.paper_trade_forensics.v4_4",
        "status":"DETERMINISTIC_REPLAY_MATCHES_SAVED_PAPER_FILLS",
        "record_id":saved_record.get("id"),
        "source":{"id":source_id,"sha256":sha,"pair":source.get("pair"),
                  "exchange":source.get("exchange"),"base":source.get("base"),
                  "quote":source.get("quote")},
        "timeframe":timeframe,
        "period":{"first_bar_utc":expected[0][0],"last_bar_utc":expected[-1][0],
                  "bars":len(expected)},
        "strategy":params["kind"],
        "metrics":{
            "all_positions":len(records),"closed_positions":len(closed),
            "open_positions":len(open_positions),
            "winning_closed_positions":gains,"losing_closed_positions":losses,
            "realized_net_pnl_quote":round(realized,5),
            "total_original_fills_verified":len(original_trades),
            "exit_causes":reasons
        },
        "positions_latest_first":list(reversed(records[-VIEW_LIMIT:])),
        "display_limit":VIEW_LIMIT,
        "methodology":{
            "causal_reasons":"EXACT_ENGINE_TRACE_REPLAY_MATCHED_TO_UNCHANGED_SAVED_FILLS",
            "source_assurance":"SAME_SOURCE_SHA_FIRST_LAST_UTC_AND_SAVED_EXECUTION_MATCH",
            "fees_in_net":True,
            "slippage_in_hypothetical_execution_prices":True,
            "excursions_are_ex_post":True,
            "mae_mfe_on_ohlc_wicks":True,
            "intrabar_sequence_unknown":True,
            "dca_multiple_entries_excursions_unavailable":True,
            "open_positions_excluded_from_win_rate":True,
            "warnings":[
                "MFE/MAE refer to candle high/low after hypothetical entry and before hypothetical exit, not tradable fills.",
                "High and low order within a candle is unknown; never infer stop or target triggering from these excursions.",
                "Multiple buys (e.g., DCA) invalidate a single-entry excursion, so MFE/MAE are omitted.",
                "A trigger on the previous CLOSED candle is executed hypothetically at NEXT candle open; real price not guaranteed.",
                "This diagnoses why trades happened using the configured rules; avoiding a loss with an alternative filter requires a separate controlled backtest, not hindsight inference.",
                "No predictions, real account access, exchange order, brokerage or bot dependency."
            ]
        },
        "safety":{"paper_only":True,"orders_real":0,"account_keys":False},
    }


def _one_position(buys, sell, bars, index, source):
    start=index[buys[0]["timestamp"]]
    stop=index[sell["timestamp"]] if sell else len(bars)
    if stop<start:
        raise LabError("Ordre chronologique des exécutions incorrect")
    cost=sum(_asfloat(b["qty"])*_asfloat(b["price"])+_asfloat(b["fee"]) for b in buys)
    qty=sum(_asfloat(b["qty"]) for b in buys)
    entry_fees=sum(_asfloat(b["fee"]) for b in buys)
    if qty<=0:
        raise LabError("Quantité hypothétique invalide")
    if sell:
        sold_qty=_asfloat(sell["qty"])
        if not math.isclose(sold_qty,qty,rel_tol=0,abs_tol=0.0000001):
            raise LabError("La quantité vendue diffère de l'inventaire des achats")
        gross=_asfloat(sell["price"])*qty-sum(
            _asfloat(b["price"])*_asfloat(b["qty"]) for b in buys)
        exit_fee=_asfloat(sell["fee"])
        pnl=gross-entry_fees-exit_fee
        status="CLOSED"
        exit_price=_asfloat(sell["price"])
    else:
        gross=qty*bars[-1][4]-sum(_asfloat(b["price"])*_asfloat(b["qty"]) for b in buys)
        exit_fee=0
        pnl=gross-entry_fees
        status="OPEN"
        exit_price=None
    price_excursion=None
    if len(buys)==1 and stop>start:
        # The exit bar is excluded: exit is at that bar OPEN, so its later
        # HIGH/LOW is not a price the position held. Entry bar is included.
        highs=[bar[2] for bar in bars[start:stop]]
        lows=[bar[3] for bar in bars[start:stop]]
        entry=_asfloat(buys[0]["price"])
        if highs and lows:
            price_excursion={
                "max_favorable_pct":round(100*(max(highs)/entry-1),5),
                "max_adverse_pct":round(100*(min(lows)/entry-1),5),
                "highest_wick":round(max(highs),5),
                "lowest_wick":round(min(lows),5),
                "source":"AFTER_THE_FACT_HISTORICAL_OHLC_WICKS_NO_FILL_OR_ORDER_GUARANTEE",
            }
    return {
        "status":status,
        "base_unit":source.get("base"),
        "quote_unit":source.get("quote"),
        "entry_count":len(buys),
        "opened_utc":buys[0]["timestamp"],
        "closed_utc":sell["timestamp"] if sell else None,
        "holding_bars":stop-start,
        "quantity_base":round(qty,8),
        "average_entry_fill":round(sum(b["price"]*b["qty"] for b in buys)/qty,5),
        "exit_fill_price":round(exit_price,5) if exit_price is not None else None,
        "gross_pnl_quote":round(gross,5),
        "entry_fees_quote":round(entry_fees,5),
        "exit_fee_quote":round(exit_fee,5),
        "total_fees_quote":round(entry_fees+exit_fee,5),
        "net_pnl_quote":round(pnl,5),
        "net_return_on_cost_pct":round(100*pnl/cost,5),
        "exit_reason_code":sell["reason_code"] if sell else None,
        "entries":[_fill_summary(b) for b in buys],
        "exit":_fill_summary(sell) if sell else None,
        "price_excursion":price_excursion,
        "explanation_status":"RECONSTRUCTED_CAUSAL_TRIGGER_WITH_VERIFIED_FILLS",
        "notes":[
            "MFE/MAE suppressed for multiple entries" if len(buys)>1
              else "MFE/MAE observed after entry; not known to the strategy at entry",
            "Unclosed positions marked at final historical close, not counted as wins/losses"
              if not sell else "Fully closed simulated position",
        ]
    }


def _fill_summary(t):
    return {
        "utc":t["timestamp"],"side":t["side"],
        "price":t["price"],"qty":t["qty"],"fee":t["fee"],
        "reason_code":t["reason_code"],
        "signal_bar_open_utc":t["signal_bar_open_utc"],
        "signal_context":t["signal_context"],
    }
