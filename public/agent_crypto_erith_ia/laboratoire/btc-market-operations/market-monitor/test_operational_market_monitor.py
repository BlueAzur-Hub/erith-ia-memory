"""Offline deterministic operational BTC monitoring regressions (no network)."""
import importlib.util
import json
import tempfile
import unittest
from datetime import datetime,timezone
from pathlib import Path

HERE=Path(__file__).parent

def load(name):
    s=importlib.util.spec_from_file_location(name,HERE/(name+'.py'))
    m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m

spot=load('collect_btc_spot_hourly')
monitor=load('build_btc_public_observation_report')
NOW=1794326400000
H=3_600_000

def sample(count=72, missing=-1,duplicate=False,open_last=False,now=NOW):
    start=now-(count*H)
    rows=[]
    for i in range(count):
        if i==missing:continue
        t=start+i*H
        rows.append([str(t),'75000','76000','74000','75500',str(i+1),'0','80000','0' if open_last and i==count-1 else '1'])
    if duplicate:rows.append(list(rows[-1]))
    return {'code':'0','data':rows[::-1]}

def event(provider='bybit',t=NOW-H):
    return {'event_key':provider+str(t),'provider':provider,'venue_market':'DERIVATIVES','orders_enabled':False,
            'event_ts_ms':t,'event_at_utc':monitor.stamp(t), 'indicative_notional_usdt':None}

def candle(t=NOW-H,close='75500'):
    return {'instrument':'BTC-USDC','t':t,'utc':monitor.stamp(t),'bar':'1H',
            'venue':'OKX','market_type':'SPOT','o':'75000','h':'76000','l':'74000','c':close,
            'v_btc':'2.5','v_usdc_quote':'187000','confirm':'1','orders_enabled':False}

def run(t=NOW-H,provider='bybit',connection_ms=3_000):
    return {'health':[{'provider':provider,'started_at_utc':monitor.stamp(t),
                       'finished_at_utc':monitor.stamp(t+6_000),
                       'observed_connection_ms':connection_ms,'status':'OBSERVED_PARTIAL_EXCHANGE_FEED'}]}

class SpotCollectionTests(unittest.TestCase):
    def test_accept_72_confirmed_hours(self):
        r=spot.parse_rows(sample(),NOW)
        self.assertEqual(len(r),72)
        self.assertEqual(r[-1]['t'],NOW-H)
        self.assertEqual(r[0]['t'],NOW-72*H)
    def test_never_assume_latest_open_candle(self):
        r=sample();r['data'].insert(0,[str(NOW),'75000','76000','74000','75500','2','0','90000','0'])
        self.assertEqual(len(spot.parse_rows(r,NOW)),72)
    def test_reject_unclosed_historic(self):
        with self.assertRaises(spot.SourceError): spot.parse_rows(sample(open_last=True),NOW)
    def test_reject_missing_hour(self):
        with self.assertRaises(spot.SourceError): spot.parse_rows(sample(missing=21),NOW)
    def test_reject_duplicate_hour(self):
        with self.assertRaises(spot.SourceError): spot.parse_rows(sample(duplicate=True),NOW)
    def test_reject_ohlc(self):
        s=sample();s['data'][0][2]='74000'
        with self.assertRaises(spot.SourceError):spot.parse_rows(s,NOW)
    def test_reject_nonfinite(self):
        s=sample();s['data'][0][5]='Infinity'
        with self.assertRaises(spot.SourceError):spot.parse_rows(s,NOW)
    def test_fail_closed_wrong_exchange_response(self):
        with self.assertRaises(spot.SourceError):spot.parse_rows({'code':'51000','data':[]},NOW)
    def test_immutable_republish_idempotent(self):
        with tempfile.TemporaryDirectory() as t:
            rows=spot.parse_rows(sample(),NOW);p=Path(t)
            a=spot.archive(rows,{'url':'public OKX','response_sha256':'a'},p,NOW)
            before=(p/'status.json').read_text()
            spot.archive(rows,{'url':'public OKX','response_sha256':'a'},p,NOW)
            self.assertEqual(before,(p/'status.json').read_text())
            self.assertTrue((p/'status.json').exists())
            self.assertTrue(a['orders_enabled'] is False)
    def test_conflict_preserves_original_archive(self):
        with tempfile.TemporaryDirectory() as t:
            rows=spot.parse_rows(sample(),NOW);p=Path(t)
            spot.archive(rows,{'url':'test'},p,NOW)
            old=(p/'status.json').read_text()
            changed=[dict(x) for x in rows]
            changed[-1]['c']='75499'
            with self.assertRaises(spot.SourceError):spot.archive(changed,{'url':'test'},p,NOW)
            self.assertEqual(old,(p/'status.json').read_text())
    def test_spot_never_private(self):
        r=spot.parse_rows(sample(),NOW)[-1]
        self.assertFalse(r['orders_enabled'])
        for key in ('api_key','account','funding','wallet','secret'):
            self.assertNotIn(key,r)

class MonitorTests(unittest.TestCase):
    def test_news_event_does_not_cause_candle(self):
        d=monitor.assemble(NOW,[candle()],[event()], [run()],
                           {'events':[{'assets':['BTC'],'event_time':monitor.stamp(NOW-H+1000),
                                       'headline':'BTC headline','source_url':'https://news.example/test'}]})
        self.assertEqual(d['hourly'][-1]['news_published_in_hour'],1)
        self.assertFalse(d['hourly'][-1]['causal_claim'])
        self.assertFalse(d['news']['causality_proven'])
    def test_no_liquidation_is_not_zero_market_claim(self):
        d=monitor.assemble(NOW,[candle()],[],[],{'events':[]})
        self.assertEqual(d['hourly'][-1]['coverage_status'],'NO_DOCUMENTED_OBSERVATION')
        self.assertEqual(d['derivatives']['events_observed_in_24h'],0)
        self.assertFalse(d['derivatives']['claim_market_total'])
        self.assertFalse(d['derivatives']['claim_24_7'])
        self.assertEqual(d['status'],'DEGRADED_OR_UNVERIFIED')
    def test_recent_connection_without_liquidations_is_fresh_but_partial(self):
        d=monitor.assemble(NOW,[candle()],[],[run(NOW-180_000)],{'events':[]})
        self.assertTrue(d['derivatives']['fresh_coverage_evidence'])
        self.assertEqual(d['status'],'OPERATIONAL_PARTIAL_COVERAGE')
        self.assertEqual(d['derivatives']['events_observed_in_24h'],0)
        self.assertFalse(d['derivatives']['claim_24_7'])
    def test_notional_never_added_to_spot_volume(self):
        d=monitor.assemble(NOW,[candle()],[event('bybit'),event('okx',NOW-H+40)],
                           [run()],{'events':[]})
        self.assertEqual(d['hourly'][-1]['spot_volume_btc'],'2.5')
        self.assertEqual(d['derivatives']['events_observed_in_24h'],2)
        self.assertEqual(d['hourly'][-1]['observed_derivative_liquidation_messages_by_provider'],
                         {'bybit':1,'binance':0,'okx':1})
    def test_ledger_health_not_liquidation_event(self):
        d=monitor.assemble(NOW,[candle()],[],[run()],{'events':[]})
        self.assertEqual(d['derivatives']['connection_windows_in_24h'],1)
        self.assertEqual(d['hourly'][-1]['providers_with_any_connection_in_hour'],['bybit'])
    def test_separate_news_from_candle_time(self):
        d=monitor.assemble(NOW,[candle()],[],[],{'events':[
            {'assets':['BTC'],'event_time':monitor.stamp(NOW-H-2),'headline':'older'},
            {'assets':['BTC'],'event_time':monitor.stamp(NOW-H+12),'headline':'in hour'}]})
        self.assertEqual(d['hourly'][-1]['news_published_in_hour'],1)
    def test_invalid_nonbtc_and_private_rows_ignored(self):
        fake=dict(candle());fake['instrument']='ETH-USDC'
        private=dict(candle());private['orders_enabled']=True
        d=monitor.assemble(NOW,[fake,private],[],[],{'events':[]})
        self.assertEqual(d['spot']['closed_hours_in_window'],0)
    def test_timestamp_requires_timezone(self):
        self.assertIsNone(monitor.utc('2026-11-10T15:00:00'))
        self.assertIsNotNone(monitor.utc('2026-11-10T15:00:00Z'))
    def test_output_history_and_source_flags(self):
        with tempfile.TemporaryDirectory() as t:
            d=monitor.assemble(NOW,[candle()],[],[run()],{'events':[]})
            s=monitor.write_outputs(d,Path(t),NOW)
            self.assertTrue(Path(s['history']).exists())
            self.assertTrue(Path(s['latest']).exists())
            p=json.loads(Path(s['latest']).read_text())
            self.assertFalse(p['orders_enabled'])
            self.assertIn('24/7',monitor.render_md(p))

if __name__=='__main__':unittest.main(verbosity=2)
