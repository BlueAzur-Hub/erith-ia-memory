from datetime import datetime, timezone
import math
import unittest

from src.engine import simulate
from tools.bollinger_age_negative_exit import simulate_bollinger_age_negative


def oscillating(start_ts,hours):
    out=[]
    for i in range(hours):
        ts=start_ts+i*3600
        o=100+6*math.sin(i/8)
        c=100+6*math.sin((i+1)/8)
        out.append((ts,o,max(o,c)+.2,min(o,c)-.2,c,10.0))
    return out


class BollingerAgeNegativeExitTests(unittest.TestCase):
    def test_baseline_parity_with_stable_engine(self):
        start=int(datetime(2024,1,1,tzinfo=timezone.utc).timestamp())
        bars=oscillating(start,24*120)
        params={"kind":"BOLLINGER","capital":10000,"fee":0.001,"slippage":0.0005,"bb_period":20,"bb_sigma":2}
        stable=simulate(bars,params,trade_start_index=720)
        research=simulate_bollinger_age_negative(bars,params,age_hours=None,trade_start_index=720)
        self.assertEqual(research["return_pct"],stable["results"]["return_pct"])
        self.assertEqual(research["max_drawdown_pct"],stable["results"]["max_drawdown_pct"])
        self.assertEqual(research["hypothetical_fills"],stable["results"]["hypothetical_fills"])
        self.assertEqual(research["fees_paid_usdt"],stable["results"]["fees_paid_usdt"])
        self.assertEqual(research["safety"]["orders_real"],0)

    def test_only_predeclared_horizons_allowed(self):
        start=int(datetime(2024,1,1,tzinfo=timezone.utc).timestamp())
        bars=oscillating(start,24*120)
        with self.assertRaises(Exception):
            simulate_bollinger_age_negative(bars,{"kind":"BOLLINGER"},age_hours=30,trade_start_index=720)


if __name__=="__main__":
    unittest.main()
