"""Seven Heaven V4.2: deterministic READ-ONLY historical market microscope.

Consumes precisely the same SHA-verified candles/timeframe as a saved PAPER run.
Nothing here places an order, modifies the user's workspace, requests live data,
or introduces a dependency on third-party chart/bot engines.
"""
from __future__ import annotations

from collections import deque
import math

from src.engine import LabError
from src.observatory import aggregate_bars

ALLOWED_WINDOWS = (60, 90, 120, 180)


def _finite(value):
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        raise LabError("Valeur non numérique dans l'historique")
    value = float(value)
    if not math.isfinite(value):
        raise LabError("Valeur non finie dans l'historique")
    return value


def _indicators(bars: list, params: dict):
    """Display-only indicators from current and earlier CLOSED candles.

    Markers are *executed* at next bar open and are not indicator signals.
    EMA calculations match the reference EMA recurrence (adjust=False).
    SMA20/Bollinger close-window and UTC-daily approximate OHLCV VWAP.
    """
    fast_period = params.get("ema_fast", 10)
    slow_period = params.get("ema_slow", 30)
    bb_period = params.get("bb_period", 20)
    sigma = params.get("bb_sigma", 2)
    if (type(fast_period) is not int or not 2 <= fast_period <= 250
            or type(slow_period) is not int or not fast_period < slow_period <= 500
            or type(bb_period) is not int or not 2 <= bb_period <= 250
            or not isinstance(sigma, (int, float)) or isinstance(sigma, bool)
            or not math.isfinite(sigma) or not 0.1 <= sigma <= 5):
        raise LabError("Paramètres d'indicateurs enregistrés invalides")
    fast = slow = None
    alpha_fast, alpha_slow = 2 / (fast_period + 1), 2 / (slow_period + 1)
    sma_window = deque(maxlen=20)
    bb_window = deque(maxlen=bb_period)
    utc_day = None
    volume_sum = weighted_sum = 0.0
    output = []
    for ts, o, h, l, close, volume in bars:
        close, h, l, volume = map(_finite, (close, h, l, volume))
        if close <= 0 or l <= 0 or volume < 0:
            raise LabError("Prix ou volume incohérent dans l'historique")
        if fast is None:
            fast = slow = close
        else:
            fast += alpha_fast * (close - fast)
            slow += alpha_slow * (close - slow)
        sma_window.append(close)
        bb_window.append(close)
        sma = sum(sma_window) / 20 if len(sma_window) == 20 else None
        middle = upper = lower = None
        if len(bb_window) == bb_period:
            middle = sum(bb_window) / bb_period
            sd = math.sqrt(sum((x - middle) ** 2 for x in bb_window) / bb_period)
            upper, lower = middle + sigma * sd, middle - sigma * sd
        day = int(ts) // 86400
        if utc_day != day:
            utc_day = day
            volume_sum = weighted_sum = 0.0
        volume_sum += volume
        weighted_sum += (h + l + close) / 3 * volume
        daily_vwap = weighted_sum / volume_sum if volume_sum else None
        output.append({
            "ema_fast": round(fast, 5),
            "ema_slow": round(slow, 5),
            "sma20": round(sma, 5) if sma is not None else None,
            "bb_middle": round(middle, 5) if middle is not None else None,
            "bb_upper": round(upper, 5) if upper is not None else None,
            "bb_lower": round(lower, 5) if lower is not None else None,
            "vwap_daily": round(daily_vwap, 5) if daily_vwap is not None else None,
        })
    return output


def build_microscope(raw_bars, record, source, *, limit=120, start_index=None):
    """Produce a bounded OHLCV/indicator/marker viewport for ONE saved run.

    Compare saved run metadata against the current verified archive to prevent
    a historical result being attached to the wrong market or data revision.
    """
    if type(limit) is not int or limit not in ALLOWED_WINDOWS:
        raise LabError("Fenêtre microscope non autorisée")
    if not isinstance(record, dict) or not isinstance(source, dict):
        raise LabError("Rapport ou source manquant")
    run = record.get("run")
    if not isinstance(run, dict):
        raise LabError("Rapport PAPER non valide")
    data, params = run.get("data"), run.get("params")
    if not isinstance(data, dict) or not isinstance(params, dict):
        raise LabError("Métadonnées de simulation absentes")
    if not isinstance(record.get("id"), str):
        raise LabError("Identifiant du rapport absent")
    if (record.get("source_sha256") != source.get("sha256")
            or not source.get("sha256")
            or data.get("source_id", record.get("source", {}).get("id")) != source.get("id")
            or data.get("source_sha256", source["sha256"]) != source["sha256"]):
        raise LabError("Le rapport et l'archive vérifiée ne correspondent pas")
    timeframe = data.get("timeframe")
    bars = aggregate_bars(raw_bars, timeframe, source_timeframe=source["source_timeframe"])
    total = len(bars)
    if (data.get("rows") != total or data.get("first_utc") != bars[0][0]
            or data.get("last_utc") != bars[-1][0]):
        raise LabError("La chronologie diffère de celle du rapport conservé")
    if start_index is None:
        start_index = max(0, total - limit)
    if (type(start_index) is not int or not 0 <= start_index <= max(0, total - limit)):
        raise LabError("Position de lecture hors historique")
    end_index = min(total, start_index + limit)
    indicators = _indicators(bars, params)
    candles = []
    for index in range(start_index, end_index):
        ts, o, h, l, c, v = bars[index]
        candles.append({
            "t": ts, "o": _finite(o), "h": _finite(h),
            "l": _finite(l), "c": _finite(c), "v": _finite(v),
            **indicators[index],
        })
    start_ts = candles[0]["t"]
    end_ts = candles[-1]["t"]
    markers = []
    for fill in run.get("trades", []):
        t = fill.get("timestamp")
        if (type(t) is int and start_ts <= t <= end_ts
                and fill.get("side") in ("BUY", "SELL")):
            markers.append({
                "t": t, "side": fill["side"], "price": _finite(fill["price"]),
                "qty": _finite(fill["qty"]), "fee": _finite(fill["fee"]),
                "kind": "HYPOTHETICAL_NEXT_BAR_OPEN_FILL",
            })
    return {
        "schema": "seven.heaven.market_microscope.v4_2",
        "status": "SAME_VERIFIED_HISTORICAL_RUN_PAPER_ONLY",
        "record_id": record["id"],
        "source_id": source["id"],
        "source_sha256": source["sha256"],
        "pair": source["pair"],
        "exchange": source["exchange"],
        "base": source["base"],
        "quote": source["quote"],
        "timeframe": timeframe,
        "source_timeframe": source["source_timeframe"],
        "total_bars": total,
        "start_index": start_index,
        "end_index_exclusive": end_index,
        "visible_bars": len(candles),
        "first_utc": bars[0][0],
        "last_utc": bars[-1][0],
        "ema_fast_period": params["ema_fast"],
        "ema_slow_period": params["ema_slow"],
        "bb_period": params["bb_period"],
        "bb_sigma": params["bb_sigma"],
        "candles": candles,
        "markers": markers,
        "warnings": [
            "Visible market candles match the exact source SHA-256 and timeframe of this saved PAPER run.",
            "EMA, SMA, Bollinger and UTC-daily VWAP overlays are analytical visualizations, not automated orders.",
            "VWAP is an OHLCV typical-price daily approximation, not a tick-level execution VWAP.",
            "Trade markers show hypothetical next-bar-open fills, not pure signal detections.",
            "No historical order book, real liquidity or guaranteed fills; no account access or live trading.",
        ],
        "safety": {"paper_only": True, "orders_real": 0, "account_keys": False},
    }
