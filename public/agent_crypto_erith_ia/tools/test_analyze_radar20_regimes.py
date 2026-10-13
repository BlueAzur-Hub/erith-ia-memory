"""Regression tests for descriptive, no-lookahead Radar20 market regime audit."""
import datetime as dt
import json
import os
from pathlib import Path
import tempfile
import unittest

import analyze_radar20_regimes as m


class RegimeLogicTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        origin=int(dt.datetime(2026,4,1,tzinfo=dt.timezone.utc).timestamp()*1000)
        cls.series={}
        for s in m.SYMBOLS:
            rows=[]
            for h in range(230):
                p=100*(1.0001**h)
                rows.append([origin+h*m.HOUR,p,p,p,p,100,60,40,60,10])
            cls.series[s]=rows

    def test_future_modification_does_not_change_prior_regime(self):
        baseline=m.market_features(self.series)[200]
        altered={s:[r[:] for r in self.series[s]] for s in m.SYMBOLS}
        for s in m.SYMBOLS:
            for i in range(200,230):altered[s][i][4]*=5
        same=m.market_features(altered)[200]
        self.assertEqual(baseline,same)
        self.assertEqual(baseline['trend'],'lateral_72h')
        self.assertEqual(baseline['volatility'],'volatilite_ordinaire')

    def test_thresholds_are_fixed_descriptive_groups(self):
        self.assertEqual(m.classify_pressure(60),'pression_60_plus')
        self.assertEqual(m.classify_pressure(55),'pression_55_60')
        self.assertEqual(m.classify_pressure(50),'pression_50_55')
        self.assertEqual(m.classify_volume(2),'volume_2x_plus')
        self.assertEqual(m.classify_volume(1.5),'volume_1_5_2x')
        self.assertEqual(m.classify_volume(1.0001),'volume_1_1_5x')

    def test_group_pnl_partition_is_exact(self):
        a=[dict(kind='a',pnl_usdt=-3,matched_basket_usdt=1),dict(kind='b',pnl_usdt=4,matched_basket_usdt=-1)]
        grouped=m.breakdown(a,'kind')
        self.assertEqual(sum(z['trades'] for z in grouped),2)
        self.assertEqual(sum(z['pnl_usdt'] for z in grouped),1)


class HistoricalProofTests(unittest.TestCase):
    root=Path(os.environ.get('RADAR20_REGIME_DATA_ROOT', str(Path(__file__).resolve().parents[1]/'data'/'trader_flux')))

    def test_authentic_sources_and_journal_reconcile_when_available(self):
        if not (self.root/'radar20'/'index.json').exists():self.skipTest('Install public repo data root first')
        summary,trades=m.evaluate(self.root)
        self.assertEqual(len(trades),258)
        self.assertEqual(summary['total_trades'],258)
        self.assertEqual(summary['total_win_trades'],94)
        self.assertEqual([x['trades'] for x in summary['periods']],[109,149])
        self.assertEqual([x['profit_usdt'] for x in summary['periods']],[-222.35885,97.74946])
        self.assertEqual([x['files'] for x in summary['source_integrity']],[60,60])
        self.assertTrue(summary['method']['features_only_use_information_known_before_entry'])
        self.assertFalse(summary['orders_enabled'])
        self.assertFalse(summary['strategy_certified'])
        for field in ['trend','volatility','pressure','volume_band']:
            self.assertEqual(sum(r['trades'] for r in summary['grouped_by'][field]),258)

    def test_tampered_month_must_fail(self):
        root=self.root/'radar20'
        if not (root/'index.json').exists():self.skipTest('Install public repo data root first')
        source=json.loads((root/'index.json').read_text())
        with tempfile.TemporaryDirectory() as d:
            temp=Path(d);(temp/'index.json').write_bytes((root/'index.json').read_bytes())
            first=source['entries'][0]
            target=temp/first['path'];target.parent.mkdir(parents=True)
            target.write_bytes((root/first['path']).read_bytes()+b'altered')
            with self.assertRaisesRegex(ValueError,'digest'):
                m.read_data(temp,m.PERIODS[1])


if __name__=='__main__':unittest.main()
