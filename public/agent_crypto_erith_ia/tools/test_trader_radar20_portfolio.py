import datetime as dt
import hashlib
import json
import math
import os
import tempfile
import unittest
import zipfile
from pathlib import Path

import trader_radar20_portfolio as mod


class LedgerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.series = {}
        for pos, s in enumerate(mod.SYMBOLS):
            rows=[]
            for i in range(mod.TOTAL_HOURS):
                price=100 + pos
                # All symbols generate valid buy pressure, but only one shock is near hour 24.
                # The first eligible entry is at hour 25 (after a completed hour 24).
                v=1000 if i==24 else 100
                rows.append([mod.BASE_MS+i*mod.HOURLY_MS,price,price,price,price,v,v*.6,v*.4,60.,10])
            cls.series[s]=rows

    def test_cash_balance_four_slots_and_fees_without_price_move(self):
        p=mod.simulate(self.series,50,12,.008)
        self.assertEqual(p['max_held_positions'],4)
        self.assertEqual(p['completed_trades'],4)
        self.assertGreaterEqual(p['final_cash_usdt'],0)
        self.assertLess(p['total_profit_net_usdt'],0)
        self.assertAlmostEqual(p['total_profit_net_usdt'],4*(100/(1+.004)*(1-.004)-100),5)
        self.assertAlmostEqual(p['theoretical_matched_20asset_basket_profit_net_usdt'],p['total_profit_net_usdt'],5)
        self.assertEqual(len(p['equity_hourly']),mod.TOTAL_HOURS)
        self.assertTrue(all(x[2]<=4 and x[3]>=-1e-8 for x in p['equity_hourly']))
        self.assertTrue(all(t['entry_utc']=='2026-07-02T01:00:00Z' for t in p['trades']))

    def test_completed_signal_only_no_lookahead(self):
        p=mod.simulate(self.series,50,12,.008)
        self.assertEqual(p['trades'][0]['entry_utc'],'2026-07-02T01:00:00Z')
        self.assertEqual(p['trades'][0]['exit_utc'],'2026-07-02T13:00:00Z')

    def test_no_positions_if_no_volume_acceleration(self):
        data={}
        for sym,arr in self.series.items():
            data[sym]=[r[:] for r in arr]
            data[sym][24][5]=100
        p=mod.simulate(data,50,48,.008)
        self.assertEqual(p['completed_trades'],0)
        self.assertEqual(p['final_cash_usdt'],400)

    def test_buyhold_same_price_is_fee_only(self):
        b=mod.buy_hold(self.series,.008)
        expected=400*(1-.004)/(1+.004)-400
        self.assertAlmostEqual(b['total_profit_net_usdt'],expected,5)
        self.assertTrue(b['not_executable_as_is'])

    def test_invalid_configs_rejected(self):
        for kwargs in ({'threshold':101},{'hold':0},{'fee':-.2},{'ticket':0},{'capital':0},{'max_positions':0}):
            with self.subTest(kwargs=kwargs),self.assertRaises(ValueError):
                mod.simulate(self.series,**kwargs)

    def test_no_future_window_entry(self):
        data={s:[r[:] for r in arr] for s,arr in self.series.items()}
        for s in mod.SYMBOLS:
            data[s][24][5]=100
            data[s][-2][5]=1000
        p=mod.simulate(data,50,48,.008)
        self.assertEqual(p['completed_trades'],0)


class SourceGuardTests(unittest.TestCase):
    def test_real_archive_shas_and_timestamps_if_present(self):
        source=Path(os.environ.get('RADAR20_SOURCE_ZIP','/mnt/data/radar20-flux-verifies.zip'))
        if not source.exists(): self.skipTest('Local verified source archive not supplied')
        series,provenance=mod.load_verified_zip(source)
        self.assertEqual(len(series),20)
        self.assertEqual(provenance['source_entries'],60)
        self.assertEqual(sum(map(len,series.values())),44160)
        self.assertEqual(series['ETH'][0][0],mod.BASE_MS)
        self.assertEqual(series['ETH'][-1][0],mod.BASE_MS+(mod.TOTAL_HOURS-1)*mod.HOURLY_MS)

    def test_integrity_tampering_rejected(self):
        source=Path(os.environ.get('RADAR20_SOURCE_ZIP','/mnt/data/radar20-flux-verifies.zip'))
        if not source.exists(): self.skipTest('Local verified source archive not supplied')
        with tempfile.TemporaryDirectory() as temp:
            dst=Path(temp)/'corrupt.zip'
            with zipfile.ZipFile(source) as inp,zipfile.ZipFile(dst,'w',compression=zipfile.ZIP_DEFLATED) as out:
                for name in inp.namelist():
                    raw=inp.read(name)
                    if name=='ETHUSDT/2026-09.json':raw=raw.replace(b'ETHUSDT',b'ETXUSDT',1)
                    out.writestr(name,raw)
            with self.assertRaisesRegex(ValueError,'SHA/size mismatch'):
                mod.load_verified_zip(dst)

if __name__=='__main__':unittest.main()
