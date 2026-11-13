"""Original Seven Heaven EMA(10/30) directional Spot validation for Freqtrade.

Research-only strategy (not copied from upstream GPL source). Designed as a
separate engine benchmark, NOT byte-identical to our local PAPER portfolio.
No shorting, no optimization, no real trading, no private exchange keys.
"""
from pandas import DataFrame
from freqtrade.strategy import IStrategy


class SevenHeavenEMA1030Frozen(IStrategy):
    INTERFACE_VERSION = 3
    timeframe = "1m"
    can_short = False
    process_only_new_candles = True
    startup_candle_count = 30

    # Explicitly avoid ROI/profit-taking as an extra reason to exit.
    minimal_roi = {"0": 100.0}
    stoploss = -0.99
    trailing_stop = False
    use_exit_signal = True
    exit_profit_only = False
    ignore_roi_if_entry_signal = False
    position_adjustment_enable = False
    order_types = {
        "entry": "market",
        "exit": "market",
        "stoploss": "market",
        "stoploss_on_exchange": False,
    }
    order_time_in_force = {"entry": "GTC", "exit": "GTC"}

    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe["ema_fast"] = dataframe["close"].ewm(span=10, adjust=False).mean()
        dataframe["ema_slow"] = dataframe["close"].ewm(span=30, adjust=False).mean()
        dataframe["diff"] = dataframe["ema_fast"] - dataframe["ema_slow"]
        return dataframe

    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        cross_up = (dataframe["diff"] > 0) & (dataframe["diff"].shift(1) <= 0)
        dataframe.loc[cross_up & (dataframe["volume"] > 0), "enter_long"] = 1
        return dataframe

    def populate_exit_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        cross_down = (dataframe["diff"] < 0) & (dataframe["diff"].shift(1) >= 0)
        dataframe.loc[cross_down, "exit_long"] = 1
        return dataframe
