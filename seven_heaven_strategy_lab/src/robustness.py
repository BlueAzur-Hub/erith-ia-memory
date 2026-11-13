"""V4.3 Aether Scientific: chronological, bounded WALK-FORWARD PAPER research.

On each fold, choose a small, fixed EMA configuration grid using ONLY
earlier training candles; apply chosen parameters to strictly LATER candles.
Reinitialize portfolio and indicator warmup per fold; previous folds NEVER
transfer holdings or capital. Report this limitation openly: a same-history
analysis chosen after looking at results is NOT a blind untouched holdout.

No accounts, no third-party bots, no trading APIs, no library downloads,
no future candles used when selecting historical hyperparameters.
"""
from __future__ import annotations

import math

from src.engine import LabError, options, simulate
from src.observatory import aggregate_bars, TIMEFRAMES

EMA_PRESETS = ((8, 21), (10, 30), (12, 32), (20, 50))
MIN_WINDOW = 60
MIN_RESEARCH = 150
MAX_SOURCE_BARS = 50000


def _schedule(count):
    if count < MIN_RESEARCH:
        raise LabError(
            "Robustesse : au moins 150 bougies du timeframe choisi sont nécessaires. "
            "Sur OKX en 4h, collecte 30 jours ou davantage ; sinon utilise 1h."
        )
    if count >= 300:
        a = count // 2
        b = 3 * count // 4
        windows = [(a, b), (b, count)]
    else:
        windows = [(count * 3 // 5, count)]
    if any(end < 60 or end - start < MIN_WINDOW for start, end in windows):
        raise LabError("Fenêtres chronologiques insuffisantes pour une étude reproductible")
    return windows


def _execute(bars, canonical_params, *, timeframe, fee=None, slippage=None):
    """Same unmodified legacy PAPER engine, new cash portfolio per independent slice."""
    params = {**canonical_params}
    params["dca_every"] = max(1, math.ceil(params["dca_every"] / TIMEFRAMES[timeframe]))
    if fee is not None:
        params["fee"] = fee
    if slippage is not None:
        params["slippage"] = slippage
    return simulate(bars, params)


def _metrics(run):
    results, stats = run["results"], run["analytics"]
    return {
        "return_pct": results["return_pct"],
        "equity_final": results["equity_final"],
        "max_drawdown_pct": results["max_drawdown_pct"],
        "fees_paid_quote": results["fees_paid_usdt"],
        "hypothetical_fills": results["hypothetical_fills"],
        "closed_positions": stats["closed_positions"],
        "win_rate_pct": stats["win_rate_pct"],
        "time_in_position_pct": stats["time_in_position_pct"],
        "cash_final": results["cash_final"],
        "base_inventory": results["base_inventory_btc"],
    }


def _grid(params):
    # Parameter variations affect existing EMA and personal-rule logic ONLY;
    # DCA/Bollinger/HOLD/CASH do not optimize an irrelevant EMA.
    if params["kind"] not in {"EMA_CROSS", "CUSTOM_RULES"}:
        return [dict(params)]
    pairs = [(params["ema_fast"], params["ema_slow"]), *EMA_PRESETS]
    seen = set()
    choices = []
    for fast, slow in pairs:
        if (fast, slow) in seen:
            continue
        seen.add((fast, slow))
        choices.append({**params, "ema_fast": fast, "ema_slow": slow})
    # Only 5 strictly predetermined candidates, NOT an unconstrained search.
    return choices


def study(raw_bars, requested, source):
    """Run 1-2 expanding chronological folds on a SHA-gated Spot archive.

    Caller must have verified source bytes via normal _resolve_source().
    We verify source contract and bar bounds once more and never access network.
    """
    if (not isinstance(source, dict) or not isinstance(source.get("id"), str)
            or len(source["id"]) > 180 or not isinstance(source.get("sha256"), str)
            or len(source["sha256"]) < 12 or not isinstance(source.get("source_timeframe"), str)
            or not isinstance(source.get("pair"), str)):
        raise LabError("Archive historique sans provenance vérifiable")
    if not isinstance(raw_bars, list) or not MIN_RESEARCH <= len(raw_bars) <= MAX_SOURCE_BARS:
        raise LabError("Historique de recherche absent ou hors limites")
    if not isinstance(requested, dict):
        raise LabError("Configuration de recherche invalide")
    timeframe = requested.get("timeframe", "1m")
    if timeframe not in TIMEFRAMES:
        raise LabError("Horizon temporel inconnu")
    allowed = source.get("available_timeframes")
    if allowed is not None and timeframe not in allowed:
        raise LabError("Timeframe incompatible avec la source vérifiée")
    bars = aggregate_bars(raw_bars, timeframe, source_timeframe=source["source_timeframe"])
    count = len(bars)
    windows = _schedule(count)
    canonical = options(requested)
    choices = _grid(canonical)
    timeline = []
    for fold_idx, (train_end, test_end) in enumerate(windows, start=1):
        train = bars[:train_end]
        test = bars[train_end:test_end]
        # Selection ONLY sees historical training, never later candles.
        scored = []
        for candidate in choices:
            train_run = _execute(train, candidate, timeframe=timeframe)
            result = train_run["results"]
            # Negative max_drawdown_pct subtracts risk: maximize net return
            # with 0.35*drawdown, with deterministic candidate-order tie break.
            score = result["return_pct"] + 0.35 * result["max_drawdown_pct"]
            scored.append((score, candidate, train_run))
        best = max(enumerate(scored), key=lambda pair: (pair[1][0], -pair[0]))[1]
        score, selected, fitted_run = best
        checked_run = _execute(test, selected, timeframe=timeframe)
        hold_run = _execute(test, {**selected, "kind": "HOLD_50"}, timeframe=timeframe)
        cash_run = _execute(test, {**selected, "kind": "CASH"}, timeframe=timeframe)
        fee_double = min(0.01, selected["fee"] * 2)
        slip_double = min(0.02, selected["slippage"] * 2)
        stress_fee = _execute(test, selected, timeframe=timeframe,
                              fee=fee_double)
        stress_slip = _execute(test, selected, timeframe=timeframe,
                               slippage=slip_double)
        stress_both = _execute(test, selected, timeframe=timeframe,
                               fee=fee_double, slippage=slip_double)
        timeline.append({
            "fold": fold_idx,
            "training": {
                "first_bar_utc": train[0][0],
                "last_bar_utc": train[-1][0],
                "bars": len(train),
                "metrics": _metrics(fitted_run),
                "selection_objective": round(score, 5),
            },
            "holdout": {
                "first_bar_utc": test[0][0],
                "last_bar_utc": test[-1][0],
                "bars": len(test),
                "metrics": _metrics(checked_run),
                "benchmark_hold_50": _metrics(hold_run),
                "benchmark_cash": _metrics(cash_run),
                "fee_x2": _metrics(stress_fee),
                "slippage_x2": _metrics(stress_slip),
                "both_x2": _metrics(stress_both),
            },
            "selection": {
                "kind": selected["kind"],
                "ema_fast": selected["ema_fast"],
                "ema_slow": selected["ema_slow"],
                "candidates_considered": len(choices),
                "selected_on_training_only": True,
                "other_rules_unchanged": True,
            },
            "stress_assumptions": {
                "fee_per_side_base_pct": round(selected["fee"] * 100, 5),
                "slippage_per_side_base_pct": round(selected["slippage"] * 100, 5),
                "fee_per_side_double_pct": round(fee_double * 100, 5),
                "slippage_per_side_double_pct": round(slip_double * 100, 5),
                "fee_slippage_caps_from_legacy_engine": True,
            },
        })
    returns = [fold["holdout"]["metrics"]["return_pct"] for fold in timeline]
    declines = [fold["holdout"]["metrics"]["max_drawdown_pct"] for fold in timeline]
    stressed = [fold["holdout"]["both_x2"]["return_pct"] for fold in timeline]
    return {
        "schema": "seven.heaven.strategy_lab.aether_scientific.walk_forward.v4_3",
        "status": "CHRONOLOGICAL_PAPER_RESEARCH_NOT_UNTOUCHED_BLIND_OOS",
        "source": {
            "id": source["id"],
            "sha256": source["sha256"],
            "exchange": source.get("exchange"),
            "pair": source["pair"],
            "base": source.get("base"),
            "quote": source.get("quote"),
            "source_timeframe": source["source_timeframe"],
        },
        "timeframe": timeframe,
        "first_bar_utc": bars[0][0],
        "last_bar_utc": bars[-1][0],
        "total_bars": count,
        "capital_per_independent_window": canonical["capital"],
        "selected_kind": canonical["kind"],
        "original_params": {**canonical, "timeframe": timeframe},
        "candidate_ema_pairs": [
            {"fast": p["ema_fast"], "slow": p["ema_slow"]} for p in choices
        ],
        "selection_score": "NET_RETURN_PCT_PLUS_0_35_X_NEGATIVE_MAX_DRAWDOWN_PCT",
        "folds": timeline,
        "summary": {
            "holdout_windows": len(timeline),
            "positive_holdout_windows": sum(v > 0 for v in returns),
            "mean_holdout_return_pct": round(sum(returns) / len(returns), 5),
            "worst_holdout_return_pct": min(returns),
            "worst_holdout_drawdown_pct": min(declines),
            "mean_holdout_double_cost_return_pct": round(sum(stressed) / len(stressed), 5),
        },
        "methodology": {
            "chronology": "EXPANDING_TRAIN_THEN_STRICTLY_LATER_DISJOINT_TEST_WINDOWS",
            "training_only_selection": True,
            "no_future_candles_for_training": True,
            "fresh_portfolio_each_window": True,
            "warmup": "INDICATORS_REINITIALIZE_AT_TEST_WINDOW_START_AND_REQUIRE_THEIR_NORMAL_CLOSED_BAR_WARMUP",
            "limits": [
                "No strategy is promising future performance. User-chosen parameters may already reflect prior inspection of these same dates.",
                "Not a fully blind untouched out-of-sample experiment unless rules/dataset were frozen before examination.",
                "Expanding training for later folds includes preceding validation dates; validation windows themselves never overlap.",
                "Training and validation are separately simulated with fresh starting cash; no open inventory transfers across a boundary.",
                "Candidate EMA list is small and fixed; only prior training data choose the winner. All other strategy rules stay fixed.",
                "Fees/slippage doubled for testing only, never charged to the saved portfolio. Values capped at engine limits 1%/2% per side.",
                "No liquidity, queue position, historical order book or realistic guaranteed stop fills; hypothetical next-bar-open only.",
            ],
        },
        "safety": {"paper_only": True, "orders_real": 0, "keys": False},
    }
