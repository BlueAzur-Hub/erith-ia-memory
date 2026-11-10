import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from datetime import datetime, timezone

HERE = Path(__file__).parent
spec=importlib.util.spec_from_file_location("liquidation_witness",HERE/"collect_btc_liquidation_witness.py")
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
NOW=1794335000000

class CollectorTest(unittest.TestCase):
    def bybit(self, s="Buy", v="0.2", p="76000", t=NOW-2000):
        return {"topic":"allLiquidation.BTCUSDT","data":[{"T":t,"s":"BTCUSDT","S":s,"v":v,"p":p}]}
    def binance(self, **kw):
        o={"s":"BTCUSDT","S":"SELL","X":"FILLED","z":"0.3","ap":"75500","T":NOW-1000}
        o.update(kw)
        return {"e":"forceOrder","E":NOW-900,"o":o}
    def okx(self, sym="BTC-USDT-SWAP",side="buy",sz="3",price="75000"):
        return {"arg":{"channel":"liquidation-orders"},"data":[{"instId":sym,"details":[{"side":side,"sz":sz,"bkPx":price,"ts":str(NOW-3000)}]}]}
    def test_bybit_long_and_reference_notional(self):
        r=mod.parse("bybit",self.bybit(),NOW)[0]
        self.assertEqual(r['liquidated_position_side'],'long')
        self.assertEqual(r['indicative_notional_usdt'],'15200.0')
        self.assertEqual(r['price_kind'],'BANKRUPTCY_NOT_EXECUTED_PRICE')
    def test_bybit_sell_is_short(self):
        self.assertEqual(mod.parse("bybit",self.bybit(s='Sell'),NOW)[0]['liquidated_position_side'],'short')
    def test_bybit_wrong_symbol_ignored(self):
        p=self.bybit();p['data'][0]['s']='ETHUSDT'
        self.assertEqual(mod.parse('bybit',p,NOW),[])
    def test_bybit_wrong_topic_ignored(self):
        p=self.bybit();p['topic']='allLiquidation.ETHUSDT'
        self.assertEqual(mod.parse('bybit',p,NOW),[])
    def test_binance_fill_is_long_with_average_fill_price(self):
        r=mod.parse('binance',self.binance(),NOW)[0]
        self.assertEqual(r['liquidated_position_side'],'long')
        self.assertEqual(r['indicative_notional_usdt'],'22650.0')
        self.assertEqual(r['price_kind'],'AVERAGE_FILL_PRICE')
    def test_binance_unfilled_ignored(self):
        self.assertEqual(mod.parse('binance',self.binance(X='NEW'),NOW),[])
    def test_binance_coin_margin_ignored(self):
        p=self.binance();p['st']=2
        self.assertEqual(mod.parse('binance',p,NOW),[])
    def test_binance_side_inverse(self):
        self.assertEqual(mod.parse('binance',self.binance(S='BUY'),NOW)[0]['liquidated_position_side'],'short')
    def test_okx_contracts_not_usd(self):
        r=mod.parse('okx',self.okx(),NOW)[0]
        self.assertIsNone(r['indicative_notional_usdt'])
        self.assertEqual(r['size_unit'],'CONTRACTS_UNVERIFIED_MULTIPLIER')
        self.assertEqual(r['liquidated_position_side'],'short')
    def test_okx_long_liquidated_on_sell(self):
        r=mod.parse('okx',self.okx(side='sell'),NOW)[0]
        self.assertEqual(r['liquidated_position_side'],'long')
    def test_okx_wrong_contract_ignored(self):
        self.assertEqual(mod.parse('okx',self.okx(sym='ETH-USDT-SWAP'),NOW),[])
    def test_okx_wrong_channel_ignored(self):
        p=self.okx();p['arg']['channel']='orders'
        self.assertEqual(mod.parse('okx',p,NOW),[])
    def test_future_timestamp_rejected(self):
        with self.assertRaises(ValueError): mod.parse('bybit',self.bybit(t=NOW+130000),NOW)
    def test_old_timestamp_rejected(self):
        with self.assertRaises(ValueError): mod.parse('bybit',self.bybit(t=NOW-13*3600_000),NOW)
    def test_negative_quantity_rejected(self):
        with self.assertRaises(ValueError): mod.parse('bybit',self.bybit(v='-1'),NOW)
    def test_infinite_price_rejected(self):
        with self.assertRaises(ValueError): mod.parse('bybit',self.bybit(p='Infinity'),NOW)
    def test_unknown_provider_fails(self):
        with self.assertRaises(ValueError): mod.parse('unknown',self.bybit(),NOW)
    def test_empty_data_not_zero_claim(self):
        with tempfile.TemporaryDirectory() as d:
            x=mod.store(Path(d),[],[{'provider':'bybit','observed_connection_ms':0,'status':'NO_VERIFIED_COVERAGE'}])
            self.assertEqual(x['observed_events_this_run'],0)
            self.assertFalse(x['claim_complete_market_total'])
            self.assertIn('SAMPLED',x['coverage'])
    def test_dedup_same_day(self):
        ev=mod.parse('bybit',self.bybit(),NOW)[0]
        with tempfile.TemporaryDirectory() as d:
            p=Path(d);mod.store(p,[ev],[]);mod.store(p,[ev],[])
            text=(p/(ev['event_at_utc'][:10]+'.jsonl')).read_text().splitlines()
            self.assertEqual(len(text),1)
    def test_sorted_cross_provider(self):
        a=mod.parse('okx',self.okx(),NOW)[0];b=mod.parse('bybit',self.bybit(),NOW)[0]
        with tempfile.TemporaryDirectory() as d:
            p=Path(d);mod.store(p,[b,a],[])
            rows=[json.loads(x) for x in (p/(a['event_at_utc'][:10]+'.jsonl')).read_text().splitlines()]
            self.assertEqual([x['event_ts_ms'] for x in rows],sorted([a['event_ts_ms'],b['event_ts_ms']]))
    def test_no_private_fields_in_document(self):
        r=mod.parse('bybit',self.bybit(),NOW)[0]
        self.assertFalse(r['orders_enabled'])
        for k in ('api_key','account_id','user_id','wallet','position_id'):
            self.assertNotIn(k,r)
    def test_deterministic_event_key(self):
        self.assertEqual(mod.parse('bybit',self.bybit(),NOW)[0]['event_key'],mod.parse('bybit',self.bybit(),NOW)[0]['event_key'])
    def test_coverage_not_24_7(self):
        with tempfile.TemporaryDirectory() as d:
            dct=mod.store(Path(d),[],[])
            self.assertFalse(dct['historical_backfill'])
            self.assertEqual(dct['coverage'],'SAMPLED_RUNS_WITH_GAPS_NOT_24_7')

if __name__=='__main__': unittest.main(verbosity=2)
