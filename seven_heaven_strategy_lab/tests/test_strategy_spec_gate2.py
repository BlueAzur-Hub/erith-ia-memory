from __future__ import annotations
import math, unittest
from src.engine import simulate
from src.strategy_spec import build_strategy_spec, strategy_spec_to_params

def sample(n=800):
    rows=[]
    for i in range(n):
        x=100+.02*i+5*math.sin(i/15); y=100+.02*(i+1)+5*math.sin((i+1)/15)
        rows.append((1704067200+i*3600,x,max(x,y)+.4,min(x,y)-.4,y,100+i%7))
    return rows
class StrategySpecGate2Tests(unittest.TestCase):
    def test_donchian_roundtrip_keeps_financial_semantics(self):
        raw={'kind':'DONCHIAN','capital':1000,'fee':.001,'slippage':.0005,'donchian_entry':55,'donchian_exit':20,'timeframe':'1h','source_id':'TEST'}
        spec=build_strategy_spec('Donchian 55/20',raw,spec_id='1'*32)
        replay=strategy_spec_to_params(spec)
        a=simulate(sample(),raw); b=simulate(sample(),replay)
        self.assertEqual(a['results'],b['results']); self.assertEqual(a['trades'],b['trades'])
        self.assertEqual(spec['market'],{'source_id':'TEST','timeframe':'1h'})
        self.assertFalse(spec['execution']['real_orders'])
if __name__=='__main__': unittest.main()
