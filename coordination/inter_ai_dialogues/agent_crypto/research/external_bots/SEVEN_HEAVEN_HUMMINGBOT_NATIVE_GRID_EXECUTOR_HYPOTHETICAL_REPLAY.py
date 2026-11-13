#!/usr/bin/env python3
"""Direct official Hummingbot GridExecutorSimulator experiment (not controller).

Use the previously SHA-validated January 2026 Binance 1m data and the official
pinned Docker image with --network none. Prints hypothetical replay traces.
Does NOT assert equivalence to an OKX Spot Grid or an account-executable strategy.
"""
from collections import Counter
from decimal import Decimal
import hashlib
import json
from pathlib import Path

EXPECTED_CSV_SHA = "38a2e6ce6e76ccfeca2e421679ee39ef4467f0426cf0064610b25100307f54c4"
FILENAME = "BTCUSDT-1m-2026-01_HUMMINGBOT_CANDLES.csv"

def main():
    import pandas as pd
    from hummingbot.core.data_type.common import OrderType, TradeType
    from hummingbot.strategy_v2.backtesting.executors_simulator.grid_executor_simulator import GridExecutorSimulator
    from hummingbot.strategy_v2.executors.grid_executor.data_types import GridExecutorConfig
    from hummingbot.strategy_v2.executors.position_executor.data_types import TripleBarrierConfig

    p = Path("/dataset") / FILENAME
    assert hashlib.sha256(p.read_bytes()).hexdigest() == EXPECTED_CSV_SHA
    df = pd.read_csv(p, dtype={"timestamp":"int64"}).set_index("timestamp", drop=False)
    assert len(df)==44640 and df.index.is_unique
    assert (df.index.to_series().diff().iloc[1:] == 60).all()

    config = GridExecutorConfig(
        timestamp=float(df["timestamp"].iat[0]),
        connector_name="binance", trading_pair="BTC-USDT", side=TradeType.BUY,
        start_price=Decimal("78883.389"), end_price=Decimal("96413.031"),
        limit_price=Decimal("0"),
        total_amount_quote=Decimal("1000"),
        min_spread_between_orders=Decimal("0.022"),
        min_order_amount_quote=Decimal("5"),
        max_open_orders=10, max_orders_per_batch=10, order_frequency=60,
        triple_barrier_config=TripleBarrierConfig(
            take_profit=Decimal("0.01"),
            open_order_type=OrderType.LIMIT_MAKER,
            take_profit_order_type=OrderType.LIMIT_MAKER,
        ),
        leverage=1, keep_position=True,
    )
    model = GridExecutorSimulator()
    outcomes=[]
    for label, fee in [("REFERENCE_TAKER_ASSUMPTION", 0.001),
                       ("MAKER_ASSUMPTION_ONLY", 0.0008)]:
        result = model.simulate(df, config, trade_cost=fee, trading_rules=None)
        trace=result.executor_simulation
        assert len(trace)>0
        assert trace.index.is_monotonic_increasing
        events=list(result.fill_events)
        counts=Counter(e["side"] for e in events)
        assert set(counts).issubset({"entry","tp"})
        assert all(0<=float(e["timestamp"]) for e in events)
        outcomes.append({
            "scenario":label,
            "trade_cost_fraction_per_fill_assumed":fee,
            "simulated_rows":len(trace),
            "first_minute":int(trace["timestamp"].iat[0]),
            "last_simulated_minute":int(trace["timestamp"].iat[-1]),
            "termination":str(result.close_type),
            "event_counts":dict(counts),
            "hypothetical_event_count":len(events),
            "open_entry_events_minus_tp_events":counts["entry"]-counts["tp"],
            "reported_net_pnl_quote_usdt":float(trace["net_pnl_quote"].iat[-1]),
            "reported_cum_fees_quote_usdt":float(trace["cum_fees_quote"].iat[-1]),
            "generated_grid_level_prices":list(map(float,result.grid_level_prices)),
            "event_samples_first_three":events[:3],
            "event_samples_last_three":events[-3:],
        })
    report={
        "schema":"seven.heaven.hummingbot.native_grid_executor_probe.v1",
        "status":"HYPOTHETICAL_NATIVE_SIMULATOR_RUN_MODEL_NON_EQUIVALENT",
        "replay_source":"Frozen Binance BTCUSDT Jan 2026 1m",
        "normalized_csv_sha256":EXPECTED_CSV_SHA,
        "input_candles":len(df),
        "native_class":type(model).__module__+"."+type(model).__qualname__,
        "config":{
            "connector_name":"binance","pair":"BTC-USDT","side":"BUY",
            "leverage":1,"max_open_orders_configured":10,
            "price_lower":"78883.389","price_upper":"96413.031",
            "min_spread_between_orders":"0.022",
            "take_profit_fraction":"0.01",
            "capital_quote_usdt":1000,
            "instrument_rules":None,"live_order_commands":False
        },
        "scenarios":outcomes,
        "limitations":[
            "Native grid executor simulator, not full Strategy V2 controller or a true Spot wallet",
            "Hummingbot simulator uses OHLC low/high threshold fills, not actual maker queue",
            "Model does not establish order-level affordability, exact Binance tick/lot, or orderbook liquidity",
            "Configured max_open_orders may not be enforced by this simulator",
            "This long-only directional grid with executor TP differs from symmetric 50/50 inventory Spot Grid",
            "Both simulated fee assumptions come from observed OKX Spot user tier, NOT January Binance actual fees",
            "Do not convert this simulator PnL to certified portfolio return or compare directly with ERITH reference"
        ],
        "paper_only":True,"exchange_keys_used":False,"orders_real":0
    }
    out=Path("/results")
    out.mkdir(parents=True,exist_ok=True)
    (out/"SEVEN_HEAVEN_HUMMINGBOT_NATIVE_GRID_EXECUTOR_HYPOTHETICAL_REPLAY_RESULT.json").write_text(json.dumps(report,indent=2)+"\n")
    print(json.dumps(report,indent=2))

if __name__=="__main__":
    main()
