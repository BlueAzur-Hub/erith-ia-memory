from datetime import datetime,timezone
import math
import unittest

from tools.donchian_equal_sleeve_portfolio import FIXED_SYMBOLS,equal_sleeve_portfolio


def bars(start,n):
    out=[]
    for i in range(n):
        ts=start+i*4*3600
        o=100+i*.04+4*math.sin(i/10)
        c=100+(i+1)*.04+4*math.sin((i+1)/10)
        out.append((ts,o,max(o,c)+.3,min(o,c)-.3,c,10.0))
    return out


class DonchianEqualSleevePortfolioTests(unittest.TestCase):
    def test_identical_assets_preserve_return_and_drawdown(self):
        start=int(datetime(2026,1,1,tzinfo=timezone.utc).timestamp())
        sample=bars(start,1000)
        panel={s:list(sample) for s in FIXED_SYMBOLS}
        out=equal_sleeve_portfolio(panel,total_capital=10000)
        first=out["sleeves"]["BTCUSDT"]
        self.assertEqual(out["portfolio"]["return_pct"],first["return_pct"])
        self.assertEqual(out["portfolio"]["max_drawdown_pct"],first["max_drawdown_pct"])
        self.assertEqual(out["portfolio"]["hypothetical_fills"],5*first["hypothetical_fills"])
        self.assertFalse(out["methodology"]["cross_asset_transfers"])
        self.assertEqual(out["safety"]["orders_real"],0)


if __name__=="__main__":
    unittest.main()
