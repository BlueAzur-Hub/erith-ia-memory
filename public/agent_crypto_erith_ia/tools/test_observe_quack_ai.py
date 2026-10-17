"""Off-network regression tests for Q Spot PAPER journal."""
import datetime as dt
import json
import pathlib
import tempfile
import unittest
from observe_quack_ai import HOUR, observe, save, validate_book, validate_candles, SCHEMA

NOW=dt.datetime(2026,10,17,19,45,tzinfo=dt.timezone.utc)
MILLIS=int(NOW.timestamp()*1000)
LATEST=(MILLIS // HOUR - 1)*HOUR

def fixtures():
    candles=[]
    for i in range(26):
        start=LATEST - (25-i)*HOUR
        close=0.100 + 0.001*i
        candles.append([str(start),str(close),str(close+0.002),str(close-0.003),
                        str(close),str(1000+i),str(100+i)])
    return candles

def getter(url,params):
    assert params['category']=='SPOT' and params['symbol']=='QUSDT'
    if url.endswith('instruments'):
        return [{'category':'SPOT','symbol':'QUSDT','baseCoin':'Q','quoteCoin':'USDT','status':'online'}]
    if url.endswith('candles'):return fixtures()
    if url.endswith('orderbook'):
        return {'ts':str(MILLIS-20_000),'b':[['0.124','500'],['0.122','600']],
                'a':[['0.125','500'],['0.126','600']]}
    raise AssertionError(url)

class Tests(unittest.TestCase):
    def test_fresh_historical_disjoint(self):
        entry=observe(getter,NOW)
        self.assertEqual(entry['market'],'QUSDT')
        self.assertTrue(entry['paper_only'])
        self.assertFalse(entry['executed_order'])
        self.assertEqual(entry['candles']['last_21_bars_contiguous'],True)
        self.assertLess(entry['book']['spread_bps'],100)
        with tempfile.TemporaryDirectory() as d:
            base=pathlib.Path(d)
            self.assertTrue(save(entry,base))
            self.assertFalse(save(entry,base))
            state=json.loads((base/'state.json').read_text())
            self.assertEqual(state['schema'],SCHEMA)
            self.assertEqual(len(state['recent_observations']),1)
            archive=json.loads((base/'observations/2026-10-17.json').read_text())
            self.assertEqual(len(archive['observations']),1)
    def test_no_stale_or_future_book(self):
        with self.assertRaisesRegex(ValueError,'périmé'):
            validate_book({'ts':str(MILLIS-180000),'b':[['0.124','5']],'a':[['0.125','5']]},NOW)
        with self.assertRaisesRegex(ValueError,'futur'):
            validate_book({'ts':str(MILLIS+9000),'b':[['0.124','5']],'a':[['0.125','5']]},NOW)
    def test_candle_gap_disallowed(self):
        x=fixtures()
        x[-4][0]=str(int(x[-4][0])+60_000)
        with self.assertRaisesRegex(ValueError,'discontinues'):
            validate_candles(x,NOW)
    def test_wrong_market_rejected(self):
        def bad(url,params):
            if url.endswith('instruments'):return [{'category':'FUTURES','symbol':'QUSDT','baseCoin':'Q','quoteCoin':'USDT','status':'online'}]
            return getter(url,params)
        with self.assertRaisesRegex(ValueError,'non confirmé'):
            observe(bad,NOW)
    def test_no_negative_depth(self):
        with self.assertRaisesRegex(ValueError,'invalide'):
            validate_book({'ts':str(MILLIS-1000),'b':[['0.124','-3']],'a':[['0.125','2']]},NOW)

if __name__=='__main__':unittest.main()
