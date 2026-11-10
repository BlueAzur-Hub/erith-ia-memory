"""Safe, offline checks for the existing hourly BTC strategy research context."""
import importlib.util
import unittest
from pathlib import Path

MODULE = Path(__file__).with_name("build_btc_public_observation_report.py")
spec = importlib.util.spec_from_file_location("btc_monitor_strategy_study", MODULE)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
H = 3600000
T = 1794200000000 // H * H

def sample(n=40, direction=1):
    return [{'instrument': 'BTC-USDC', 'market_type': 'SPOT', 'venue': 'OKX',
             'bar': '1H', 'confirm': '1', 'orders_enabled': False,
             't': T + i*H, 'c': str(70000 + direction*i*100)}
            for i in range(n)]

class StrategyContextTests(unittest.TestCase):
    def test_rising_40_closed_hours_is_observation_not_signal(self):
        candles=sample()
        result=module.assess_swing_context(candles, T+40*H)
        self.assertEqual(result['status'], 'OBSERVED_NOT_BACKTESTED')
        self.assertEqual(result['observed_condition'], 'ALIGNEMENT_HAUSSIER_HORAIRE')
        self.assertEqual(result['observed_hours'], 40)
        self.assertFalse(result['strategy_validated'])
        self.assertFalse(result['orders_enabled'])
        self.assertTrue(result['ema_5_usdc']>result['ema_13_usdc']>result['ema_34_usdc'])

    def test_falling_40_closed_hours(self):
        result=module.assess_swing_context(sample(direction=-1),T+40*H)
        self.assertEqual(result['observed_condition'], 'ALIGNEMENT_BAISSIER_HORAIRE')

    def test_less_than_34_hours_is_not_an_ema_34(self):
        result=module.assess_swing_context(sample(n=24),T+24*H)
        self.assertEqual(result['status'], 'INSUFFICIENT_EVIDENCE')
        self.assertFalse(result['strategy_validated'])

    def test_gap_fails_closed(self):
        candles=sample()
        del candles[15]
        result=module.assess_swing_context(candles,T+40*H)
        self.assertEqual(result['status'], 'INSUFFICIENT_EVIDENCE')
        self.assertIn('Discontinuous', result['reason'])

    def test_mixed_venue_fails_closed(self):
        candles=sample()
        candles[5]['venue']='Binance'
        result=module.assess_swing_context(candles,T+40*H)
        self.assertEqual(result['status'], 'INSUFFICIENT_EVIDENCE')
        self.assertFalse(result['orders_enabled'])

    def test_open_candle_is_never_used(self):
        candles=sample()
        candles[39]['confirm']='0'
        result=module.assess_swing_context(candles,T+40*H)
        self.assertEqual(result['status'], 'INSUFFICIENT_EVIDENCE')

if __name__=='__main__':
    unittest.main()
