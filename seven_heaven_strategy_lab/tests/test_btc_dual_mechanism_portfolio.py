from datetime import datetime,timezone
import math
import unittest

from tools.btc_dual_mechanism_portfolio import run_dual_mechanism_portfolio


def sample(start,n):
    out=[]
    for i in range(n):
        ts=start+i*4*3600
        o=100+i*.02+6*math.sin(i/11)
        c=100+(i+1)*.02+6*math.sin((i+1)/11)
        out.append((ts,o,max(o,c)+.3,min(o,c)-.3,c,10.0))
    return out


class BtcDualMechanismPortfolioTests(unittest.TestCase):
    def test_fixed_weights_and_parity_guards(self):
        start=int(datetime(2024,1,1,tzinfo=timezone.utc).timestamp())
        out=run_dual_mechanism_portfolio(sample(start,2200))
        self.assertEqual(out["params"]["sleeve_capital"],5000.0)
        self.assertFalse(out["methodology"]["cross_sleeve_transfers"])
        self.assertTrue(out["methodology"]["donchian_parity_guard"])
        self.assertTrue(out["methodology"]["bollinger_parity_guard"])
        self.assertEqual(out["safety"]["orders_real"],0)


if __name__=="__main__":
    unittest.main()
