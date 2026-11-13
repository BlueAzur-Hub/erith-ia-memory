"""V4.5 Aether Research: controlled, non-blind comparison of declarative entry filters.

Only a short, preregistered filter grid is tried. The common entry, exit,
capital, dates, pricing model, fixed fee and fixed slippage remain unchanged.
Choice is made on earlier TRAINING candles only, then evaluated on strictly
later holdouts. All candidate holdout results are disclosed for inspection,
not mined to choose a winner. Cash restarts and indicators warm up for each
slice. No market data downloads, workspace writes, accounts, Freqtrade,
Hummingbot, or exchange orders. No claim of causal performance improvement.
"""
from __future__ import annotations

import math

from src.engine import LabError, options
from src.observatory import aggregate_bars, TIMEFRAMES
from src.robustness import _execute, _metrics, _schedule, MIN_RESEARCH, MAX_SOURCE_BARS

MAX_CANDIDATES = 5
VERSION = "seven.heaven.aether_research.controlled_filters.v4_5"
RULES = (
    ("NO_FILTER", "Sans filtre"),
    ("RSI_60", "RSI sous 60", "RSI_BELOW", 60.0),
    ("RSI_45", "RSI sous 45", "RSI_BELOW", 45.0),
    ("VOLUME_1_2", "Volume ≥ 1,2 × moyenne", "VOLUME_ABOVE", 1.2),
)


def _variations(canonical):
    if canonical["kind"] not in {"EMA_CROSS", "CUSTOM_RULES"}:
        raise LabError(
            "Aether Research V4.5 étudie uniquement les croisements EMA ou "
            "les stratégies personnelles fondées sur le même moteur d'entrée."
        )
    base = dict(canonical)
    from_standard_ema = base["kind"] == "EMA_CROSS"
    base["kind"] = "CUSTOM_RULES"
    if from_standard_ema:
        base["entry_rule"] = "EMA_CROSS_UP"
        base["exit_rule"] = "EMA_CROSS_DOWN"
        base["filter_rule"] = "NONE"
    result = []
    seen = set()

    def add(key, label, choice, note):
        rule = choice["filter_rule"]
        sig = (rule, choice["rsi_entry_max"] if rule == "RSI_BELOW"
               else choice["volume_multiplier"] if rule == "VOLUME_ABOVE" else None)
        if sig in seen:
            return
        seen.add(sig)
        result.append({"key":key, "label":label, "params":choice, "description":note})

    add("OWNER", "Ta configuration d'origine",dict(base),
        "Tous les réglages demandés, inchangés ; référence de comparaison.")
    add("NO_FILTER","Sans filtre d'entrée",{**base,"filter_rule":"NONE"},
        "Même entrée et sortie, sans filtre complémentaire.")
    add("RSI_60","Filtre RSI < 60",
        {**base,"filter_rule":"RSI_BELOW","rsi_entry_max":60.0},
        "RSI inférieur à 60 sur la bougie close précédente.")
    add("RSI_45","Filtre RSI < 45",
        {**base,"filter_rule":"RSI_BELOW","rsi_entry_max":45.0},
        "RSI inférieur à 45 sur la bougie close précédente.")
    add("VOLUME_1_2","Filtre volume ≥ 1,2×",
        {**base,"filter_rule":"VOLUME_ABOVE","volume_multiplier":1.2},
        "Volume de la bougie close précédente au moins 1,2× sa moyenne.")
    if not 1 <= len(result) <= MAX_CANDIDATES:
        raise LabError("Nombre de variantes non autorisé")
    return result, from_standard_ema, base


def _small_metric(run):
    r, stats = run["results"], run["analytics"]
    return {
        "return_pct":r["return_pct"],
        "equity_final":r["equity_final"],
        "max_drawdown_pct":r["max_drawdown_pct"],
        "fees_paid_quote":r["fees_paid_usdt"],
        "hypothetical_fills":r["hypothetical_fills"],
        "closed_positions":stats["closed_positions"],
        "win_rate_pct":stats["win_rate_pct"],
        "base_inventory":r["base_inventory_btc"],
        "rejected_orders":r["rejected_orders"],
    }


def _mean(values):
    return round(sum(values)/len(values),5)


def study(raw_bars, requested, source):
    if not isinstance(requested,dict):
        raise LabError("Paramètres Aether Research invalides")
    if (not isinstance(source,dict) or not isinstance(source.get("id"),str)
            or len(source["id"])>180 or not isinstance(source.get("sha256"),str)
            or len(source["sha256"])<12 or source.get("source_timeframe") not in ("1m","1h")
            or not isinstance(source.get("pair"),str)):
        raise LabError("Source historique SHA-256 sans provenance exploitable")
    if not isinstance(raw_bars,list) or not MIN_RESEARCH<=len(raw_bars)<=MAX_SOURCE_BARS:
        raise LabError("Historique trop court ou hors limite pour les filtres")
    timeframe=requested.get("timeframe","1m")
    if timeframe not in TIMEFRAMES:
        raise LabError("Horizon historique incorrect")
    available=source.get("available_timeframes")
    if available is not None and timeframe not in available:
        raise LabError("Cette période n'est pas disponible pour l'archive")
    # The source is validated by server._resolve_source and cannot be upsampled.
    bars=aggregate_bars(raw_bars,timeframe,source_timeframe=source["source_timeframe"])
    folds=_schedule(len(bars))
    canonical=options(requested)
    candidates,converted,base=_variations(canonical)
    train_results=[]
    hold_results=[]
    fold_reports=[]
    for fold_number,(train_end,test_end) in enumerate(folds,start=1):
        train=bars[:train_end]
        holdout=bars[train_end:test_end]
        scored=[]
        for candidate in candidates:
            train_run=_execute(train,candidate["params"],timeframe=timeframe)
            train_metric=_small_metric(train_run)
            score=round(train_metric["return_pct"]+0.35*train_metric["max_drawdown_pct"],5)
            eligible=train_metric["closed_positions"]>=1 and train_metric["hypothetical_fills"]>=2
            scored.append((candidate,train_metric,score,eligible))
        # Eligibility rule was fixed BEFORE any holdout is inspected.
        qualified=[(i,v) for i,v in enumerate(scored) if v[3]]
        if qualified:
            i_best,best=max(qualified,key=lambda x:(x[1][2],-x[0]))
            selection_status="AT_LEAST_ONE_CLOSED_TRADE_ON_TRAINING_ONLY"
        else:
            # No completed training trade => no defensible "best".
            i_best,best=0,scored[0]
            selection_status="NO_TRAINING_CLOSED_TRADE_RETAIN_OWNER_BASELINE"
        selected=best[0]
        benchmark_hold=_small_metric(_execute(
            holdout,{**base,"kind":"HOLD_50"},timeframe=timeframe))
        benchmark_cash=_small_metric(_execute(
            holdout,{**base,"kind":"CASH"},timeframe=timeframe))
        checked=[]
        for i,(candidate,metric,score,eligible) in enumerate(scored):
            run=_execute(holdout,candidate["params"],timeframe=timeframe)
            checked.append({
                "key":candidate["key"],"label":candidate["label"],
                "description":candidate["description"],
                "filter_rule":candidate["params"]["filter_rule"],
                "rsi_entry_max":candidate["params"]["rsi_entry_max"]
                    if candidate["params"]["filter_rule"]=="RSI_BELOW" else None,
                "volume_multiplier":candidate["params"]["volume_multiplier"]
                    if candidate["params"]["filter_rule"]=="VOLUME_ABOVE" else None,
                "selected_on_training":i==i_best,
                "is_owner_baseline":i==0,
                "training":metric,
                "selection_score":score,
                "eligible_on_training":eligible,
                "verification":_small_metric(run),
            })
        selected_row=checked[i_best]
        owner_row=checked[0]
        stress=_execute(holdout,selected["params"],timeframe=timeframe,
                        fee=min(.01,selected["params"]["fee"]*2),
                        slippage=min(.02,selected["params"]["slippage"]*2))
        chosen=selected_row["verification"]
        original=owner_row["verification"]
        fold_reports.append({
            "fold":fold_number,
            "training":{"first_bar_utc":train[0][0],"last_bar_utc":train[-1][0],
                        "bars":len(train)},
            "verification":{"first_bar_utc":holdout[0][0],"last_bar_utc":holdout[-1][0],
                            "bars":len(holdout)},
            "candidate_count":len(checked),
            "selection":{
                "key":selected["key"],"label":selected["label"],
                "criterion":"NET_TRAINING_RETURN_PLUS_0_35_X_TRAINING_NEGATIVE_DRAWDOWN",
                "status":selection_status,
                "training_only":True,
                "holdout_data_used_to_choose":False,
            },
            "candidates":checked,
            "benchmarks":{"owner_original":original,
                          "buy_and_hold_50":benchmark_hold,
                          "cash":benchmark_cash},
            "selected_verification":chosen,
            "selected_double_cost_verification":_small_metric(stress),
            "selected_minus_owner_return_pct_points":round(
                chosen["return_pct"]-original["return_pct"],5),
            "selected_minus_cash_return_pct_points":chosen["return_pct"],
        })
    selected_returns=[fold["selected_verification"]["return_pct"] for fold in fold_reports]
    owner_returns=[fold["benchmarks"]["owner_original"]["return_pct"] for fold in fold_reports]
    stressed=[fold["selected_double_cost_verification"]["return_pct"] for fold in fold_reports]
    nontrivial=sum(fold["selected_verification"]["hypothetical_fills"]>0 for fold in fold_reports)
    return {
        "schema":VERSION,
        "status":"NONBLIND_PREDECLARED_TRAIN_ONLY_SELECTION_INDEPENDENT_LATER_HOLDOUTS",
        "source":{"id":source["id"],"sha256":source["sha256"],
                  "exchange":source.get("exchange"),"pair":source["pair"],
                  "base":source.get("base"),"quote":source.get("quote"),
                  "source_timeframe":source["source_timeframe"]},
        "timeframe":timeframe,
        "total_bars":len(bars),
        "original_kind":canonical["kind"],
        "ema_converted_to_equivalent_custom_rules":converted,
        "entry_rule":base["entry_rule"],
        "exit_rule":base["exit_rule"],
        "ema_fast":base["ema_fast"],"ema_slow":base["ema_slow"],
        "capital_per_window":base["capital"],
        "fee_per_side_pct":base["fee"]*100,
        "slippage_per_side_pct":base["slippage"]*100,
        "stop_loss_pct":base["stop_loss_pct"],
        "take_profit_pct":base["take_profit_pct"],
        "variant_family":"ENTRY_FILTER_ONLY_KEEP_ALL_OTHER_RULES_FIXED",
        "folds":fold_reports,
        "summary":{
            "verification_windows":len(fold_reports),
            "variants_compared":len(candidates),
            "mean_selected_return_pct":_mean(selected_returns),
            "mean_owner_return_pct":_mean(owner_returns),
            "mean_selected_minus_owner_pct_points":round(
                _mean(selected_returns)-_mean(owner_returns),5),
            "worst_selected_return_pct":min(selected_returns),
            "mean_selected_double_cost_return_pct":_mean(stressed),
            "folds_with_selected_paper_activity":nontrivial,
            "selected_positive_windows":sum(v>0 for v in selected_returns),
            "claim_of_profitable_future":False,
        },
        "methodology":{
            "candidates_predeclared":True,
            "candidate_grid_maximum":MAX_CANDIDATES,
            "only_entry_filter_changed":True,
            "same_source_and_chronological_holdout_per_variant":True,
            "selection_uses_training_only":True,
            "qualification_closed_positions_minimum":1,
            "training_selection_metric":"NET_RETURN_PLUS_0_35_X_NEGATIVE_DRAWDOWN",
            "no_valid_training_trades_owner_fallback":True,
            "holdout_all_candidates_reported_but_not_used_to_pick":True,
            "folds_disjoint_verification":True,
            "later_training_reuses_previous_verification_history":True,
            "each_portfolio_resets_at_boundary":True,
            "no_indicator_carryover":True,
            "user_may_have_already_inspected_these_dates":True,
            "no_new_workspace_files":True,
            "limits":[
                "Research conducted on already observable market history, not an untouched blind out-of-sample test.",
                "Five predeclared or fewer filter alternatives; this does not search every possible strategy or guarantee advantage.",
                "Only entry filters change; common EMA, entry, exit, stop, take-profit, RSI/volume period, fees, slippage, market and capital are identical.",
                "The selected variant is chosen on training candles only, with >=1 closed position required; if no eligible candidate, original configuration is kept.",
                "Validation results for ALL alternatives are shown to expose selection bias, not to reselect based on their outcomes.",
                "Each test slice restarts EMAs, RSI, volume, capital and positions. This can suppress trades or produce zero-fills; such windows cannot prove profitability.",
                "Each later expanding training set includes all older candles, including earlier tests; holdout windows themselves do not overlap.",
                "No historic order book, slippage discovery, exchange fill proof or intrabar native protective stop. Real trading disabled."
            ],
        },
        "safety":{"paper_only":True,"orders_real":0,"private_keys":False,
                  "bots_connected":False,"accounts_read":False},
    }
