from datetime import datetime,timezone
import math
import unittest

from tools.donchian_mechanism_regime import analyze_asset_year,summarize


def trending_wave(start,hours):
    bars=[]
    for i in range(hours):
        ts=start+i*4*3600
        center=100+i*0.03+4*math.sin(i/12)
        nxt=100+(i+1)*0.03+4*math.sin((i+1)/12)
        o=center;c=nxt
        bars.append((ts,o,max(o,c)+.4,min(o,c)-.4,c,20.0))
    return bars


class DonchianMechanismRegimeTests(unittest.TestCase):
    def test_descriptive_only_and_causal_preentry(self):
        start=int(datetime(2024,1,1,tzinfo=timezone.utc).timestamp())
        bars=trending_wave(start,2200)
        report=analyze_asset_year("TESTUSDT",2024,bars)
        out=summarize([report,report])
        self.assertEqual(out["windows"],2)
        self.assertFalse(out["methodology"]["threshold_search_performed"])
        self.assertFalse(out["methodology"]["classifier_trained"])
        self.assertTrue(out["methodology"]["pre_entry_variables_causal"])
        self.assertEqual(out["safety"]["orders_real"],0)
        if report["closed_trades"]:
            row=report["closed_trades"][0]
            for key in ("breakout_excess_pct","channel_width_pct","directional_return_55_pct",
                        "efficiency_ratio_55","atr20_relative_pct","mfe_pct","mae_pct"):
                self.assertIn(key,row)


if __name__=="__main__":
    unittest.main()
