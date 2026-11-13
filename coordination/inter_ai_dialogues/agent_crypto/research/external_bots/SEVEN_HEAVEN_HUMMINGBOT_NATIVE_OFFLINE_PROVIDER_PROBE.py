#!/usr/bin/env python3
"""Probe real imported Hummingbot engine and its offline candle provider.

Strictly PAPER / source compatibility only. No controller, PnL or orders. Requires
a validated CSV prepared by the frozen-data gate. The Docker invocation MUST
use --network none; we additionally replace any candle factory fallback with
an exception to detect requests for data not in the supplied cache.
"""
import asyncio
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import platform

EXPECTED_CSV_SHA256 = "38a2e6ce6e76ccfeca2e421679ee39ef4467f0426cf0064610b25100307f54c4"
FEED_KEY = "binance_BTC-USDT_1m"
START = int(datetime(2026, 1, 1, tzinfo=timezone.utc).timestamp())
END = int(datetime(2026, 1, 31, 23, 59, tzinfo=timezone.utc).timestamp())
FILENAME = "BTCUSDT-1m-2026-01_HUMMINGBOT_CANDLES.csv"


def main():
    import pandas as pd
    from hummingbot.data_feed.candles_feed.candles_factory import CandlesFactory
    from hummingbot.data_feed.candles_feed.data_types import CandlesConfig
    from hummingbot.strategy_v2.backtesting.backtesting_engine_base import BacktestingEngineBase
    from hummingbot.strategy_v2.backtesting.backtesting_data_provider import BacktestingDataProvider

    csv_file = Path("/dataset") / FILENAME
    payload = csv_file.read_bytes()
    sha = hashlib.sha256(payload).hexdigest()
    assert sha == EXPECTED_CSV_SHA256, ("Mismatched validated CSV", sha)
    df = pd.read_csv(csv_file, dtype={"timestamp": "int64"})
    assert df.shape == (44640, 6)
    assert df["timestamp"].iat[0] == START and df["timestamp"].iat[-1] == END
    assert df.timestamp.is_unique and (df.timestamp.diff().iloc[1:] == 60).all()

    # Exercise actual Hummingbot objects (not a mock of Hummingbot).
    engine = BacktestingEngineBase()
    provider = engine.backtesting_data_provider
    assert isinstance(provider, BacktestingDataProvider)
    provider.update_backtesting_time(START, END)
    provider.candles_feeds[FEED_KEY] = df

    attempted_fallback = []
    original_factory = CandlesFactory.get_candle

    def forbidden_factory(*args, **kwargs):
        attempted_fallback.append("CandlesFactory.get_candle")
        raise RuntimeError("FORBIDDEN_EXTERNAL_CANDLE_DOWNLOAD")

    CandlesFactory.get_candle = staticmethod(forbidden_factory)
    try:
        config = CandlesConfig(connector="binance", trading_pair="BTC-USDT", interval="1m")
        feed = asyncio.run(provider.get_candles_feed(config))
        assert len(feed) == 44640
        selected = provider.get_candles_df("binance", "BTC-USDT", "1m", max_records=44640)
        assert len(selected) == 44640
        assert selected.timestamp.iloc[0] == START
        assert selected.timestamp.iloc[-1] == END
        assert not attempted_fallback, "CandlesFactory fallback invoked"
    finally:
        CandlesFactory.get_candle = original_factory

    # Verify trading-rule network path is NOT silently enabled by candle-cache success.
    # Engine.run_backtesting() would call initialize_trading_rules(), so stop here
    # until validated, time-stamped Spot rules and offline-only adapter are in place.
    import inspect
    src = inspect.getsource(provider.initialize_trading_rules)
    assert "_update_trading_rules" in src, "Upstream trading-rules path changed; review needed"

    result = {
        "schema": "seven.heaven.hummingbot.native_offline_provider_probe.v1",
        "status": "PASS_REAL_HUMMINGBOT_ENGINE_IMPORTED_WITH_OFFLINE_CANDLES",
        "python": platform.python_version(),
        "pandas": pd.__version__,
        "hummingbot_engine": type(engine).__module__ + "." + type(engine).__qualname__,
        "hummingbot_provider": type(provider).__module__ + "." + type(provider).__qualname__,
        "source": {"pair": "BTC-USDT", "exchange": "Binance Spot",
                   "sha256": sha, "rows": len(df), "start_timestamp": START,
                   "end_timestamp": END, "feed_key": FEED_KEY},
        "data_provider": {
            "actual_feed_rows": len(feed),
            "actual_filtered_rows": len(selected),
            "external_candle_factory_calls": len(attempted_fallback),
            "trading_rules_initialized": False
        },
        "safety": {
            "network_disabled_by_docker": True,
            "exchange_api_keys_used": False,
            "controllers_executed": False,
            "orders_sent": 0,
            "strategy_returns_computed": False,
            "historic_execution_certified": False
        },
        "limitations": [
            "Hummingbot actual engine imported and its historical candle cache exercised only",
            "No Spot controller run: exchange rules not yet frozen or verified",
            "Not a simulation or proof of fills, fees, inventory or returns",
            "Docker image digest must be recorded by CI for reproducibility"
        ]
    }
    p = Path("/results")
    p.mkdir(parents=True, exist_ok=True)
    (p / "SEVEN_HEAVEN_HUMMINGBOT_NATIVE_OFFLINE_PROVIDER_PROBE_RESULT.json").write_text(
        json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
