"""Seven Heaven V2 - auditable, deterministic multi-timeframe PAPER comparison.

All prices come from the exact same SHA-verified one-minute source. Higher
intervals are formed from completed 1m OHLCV candles; signals remain causal.
This is a research comparator, NOT a Freqtrade/Hummingbot or OKX execution.
"""
from __future__ import annotations
import math

from src.engine import KINDS, LabError, options, simulate

TIMEFRAMES = {"1m": 1, "5m": 5, "15m": 15, "1h": 60, "4h": 240}
ORDER = ("EMA_CROSS", "BOLLINGER", "DCA", "HOLD_50", "HOLD_100", "CASH")
NAMES = {
    "EMA_CROSS": "Croisement EMA", "BOLLINGER": "Bandes de Bollinger",
    "DCA": "DCA programmé", "HOLD_50": "Buy & Hold 50 %",
    "HOLD_100": "Buy & Hold 100 %", "CASH": "Conservation USDT",
    "CUSTOM_RULES": "Stratégie personnalisée",
}


def aggregate_bars(source: list, timeframe: str, *, source_timeframe: str = '1m') -> list:
    if timeframe not in TIMEFRAMES:
        raise LabError("Période de bougies non autorisée")
    if source_timeframe not in ("1m", "1h"):
        raise LabError("Origine temporelle de source non autorisée")
    source_minutes = TIMEFRAMES[source_timeframe]
    if TIMEFRAMES[timeframe] < source_minutes or TIMEFRAMES[timeframe] % source_minutes:
        raise LabError("Impossible de fabriquer des bougies plus fines que la source")
    step = TIMEFRAMES[timeframe] // source_minutes
    if not isinstance(source, list) or len(source) < 60 or len(source) % step:
        raise LabError("Historique incomplet pour cette période de bougies")
    if source[0][0] % (TIMEFRAMES[timeframe] * 60) != 0:
        raise LabError("Historique désaligné pour cette période")
    if step == 1:
        return source
    out = []
    for pos in range(0, len(source), step):
        segment = source[pos:pos + step]
        start = segment[0][0]
        if any(c[0] != start + source_minutes * 60 * i for i, c in enumerate(segment)):
            raise LabError("Bougies manquantes ou non continues")
        out.append((
            start,
            segment[0][1],
            max(c[2] for c in segment),
            min(c[3] for c in segment),
            segment[-1][4],
            sum(c[5] for c in segment),
        ))
    if len(out) < 60:
        raise LabError("Nombre de bougies insuffisant à cette échelle")
    return out


def _request(params: dict) -> tuple[dict, str]:
    p = options(params)
    timeframe = params.get("timeframe", "1m")
    if timeframe not in TIMEFRAMES:
        raise LabError("Échelle temporelle inconnue")
    return p, timeframe


def run_one(source: list, raw_params: dict, *, kind: str | None = None,
            zero_cost: bool = False, source_timeframe: str = "1m") -> dict:
    """Run a specified scenario on the identical frozen raw minute source."""
    p, timeframe = _request(raw_params)
    if kind is not None:
        if kind not in KINDS:
            raise LabError("Stratégie inconnue")
        p["kind"] = kind
    if zero_cost:
        p["fee"] = 0.0
        p["slippage"] = 0.0
    bars = aggregate_bars(source, timeframe, source_timeframe=source_timeframe)
    minutes = TIMEFRAMES[timeframe]
    requested_dca_minutes = p["dca_every"]
    # V1's engine defines DCA intervals in number of bars. Convert explicitly:
    # e.g. daily (1440 minutes) -> 96 steps of 15m; never silently 1440 x 15m.
    effective_steps = max(1, math.ceil(requested_dca_minutes / minutes))
    p["dca_every"] = effective_steps
    result = simulate(bars, p)
    result["params"]["dca_every"] = requested_dca_minutes
    result["data"]["timeframe"] = timeframe
    result["data"]["source_interval"] = source_timeframe
    result["data"]["source_candles"] = len(source)
    result["data"]["aggregated_completed_candles"] = len(bars)
    result["data"]["execution_model"] = "hypothetical NEXT candle OPEN"
    if result["params"]["kind"] == "DCA":
        result["data"]["dca_requested_minutes"] = requested_dca_minutes
        result["data"]["dca_effective_minutes"] = effective_steps * minutes
    result["data"]["strictly_paper"] = True
    return result


def compare(source: list, raw_params: dict, *, source_timeframe: str = "1m", source_label: str = "Binance Spot BTC/USDT, 2026-01") -> dict:
    """Same source/timeframe/cost assumptions for six reference methods and optional custom rules."""
    p, timeframe = _request(raw_params)
    rows = []
    kinds = ORDER + (("CUSTOM_RULES",) if p["kind"] == "CUSTOM_RULES" else ())
    for kind in kinds:
        result = run_one(source, {**p, "timeframe": timeframe}, kind=kind, source_timeframe=source_timeframe)
        r = result["results"]
        rows.append({
            "kind": kind,
            "label": NAMES[kind],
            "equity_final": r["equity_final"],
            "return_pct": r["return_pct"],
            "max_drawdown_pct": r["max_drawdown_pct"],
            "fees_paid_usdt": r["fees_paid_usdt"],
            "hypothetical_fills": r["hypothetical_fills"],
            "cash_final": r["cash_final"],
            "base_inventory_btc": r["base_inventory_btc"],
            "rejected_orders": r["rejected_orders"],
        })
    return {
        "schema": "seven.heaven.strategy_lab.comparison.v2",
        "status": "SEVEN_MODELS_PAPER_ONLY" if p["kind"] == "CUSTOM_RULES" else "SIX_MODELS_PAPER_ONLY",
        "timeframe": timeframe,
        "input_source_candles": len(source),
        "input_1m_candles": len(source) if source_timeframe == "1m" else None,
        "source_timeframe": source_timeframe,
        "aggregated_candles": len(source) * TIMEFRAMES[source_timeframe] // TIMEFRAMES[timeframe],
        "common_source": source_label,
        "params": {**p, "timeframe": timeframe},
        "rows": rows,
        "warnings": [
            "Six reference models and optionally one personalized model, not a forecast",
            "Same EMA lengths in bars imply different clock horizons per timeframe",
            "Fills are assumed at next candle open; no historical orderbook",
            "Instrument rules are observed at collection, NOT historical fill constraints",
            "0.10% OKX Taker is a scenario, not historical Binance realized fees",
            "DCA frequency entered in minutes and rounded up to full timeframe bars",
            "Freqtrade and Hummingbot not executed by this comparator",
        ],
        "safety": {"paper_only": True, "orders_real": 0, "account_keys": False},
    }


def run_with_diagnostics(source: list, raw_params: dict, *, source_timeframe: str = "1m") -> tuple[dict, dict]:
    run = run_one(source, raw_params, source_timeframe=source_timeframe)
    ideal = run_one(source, raw_params, zero_cost=True, source_timeframe=source_timeframe)
    r, zero = run["results"], ideal["results"]
    return run, {
        "status": "COUNTERFACTUAL_IDEAL_FILLS_ONLY",
        "zero_friction_return_pct": zero["return_pct"],
        "zero_friction_equity_final": zero["equity_final"],
        "actual_model_return_pct": r["return_pct"],
        "difference_final_usdt": round(zero["equity_final"] - r["equity_final"], 6),
        "not_additive_fee_decomposition": True,
        "warning": "Zero-cost is hypothetical. The portfolio path changes; do not subtract fees from an unrelated trade path."
    }
