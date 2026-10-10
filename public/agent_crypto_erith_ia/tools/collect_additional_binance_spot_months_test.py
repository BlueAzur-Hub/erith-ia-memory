import datetime as dt
import unittest
from unittest.mock import patch
import collect_additional_binance_spot_months as a

def index():
    rows=[{'id':f'dummy-{i}','rank':i,'symbol':f'K{i}',
           'name':'Other','source':None,'quote':'USDT','months':0}
          for i in range(1,251)]
    for cid,name,symbol,rank,_ in a.SPECS:
        rows[rank-1]={'id':cid,'rank':rank,'symbol':symbol,
                      'name':name,'source':None,'quote':'USDT','months':0}
    return {'schema':'aerith.public.ohlcv.top250.federated-native-archives.v1',
            'ranked':250,'assets':rows}

class ThreeMoreBinanceTests(unittest.TestCase):
    def test_exact_names_and_pair_owners_are_distinct(self):
        own=a.owners(index())
        self.assertEqual([x['pair'] for x in own],
                         ['STXUSDT','COMPUSDT','THETAUSDT'])
        self.assertEqual(len(set(x['id'] for x in own)),3)
        self.assertTrue(all(x['official_listing'].endswith(
                            '/'+x['symbol']+'_USDT') for x in own))

    def test_refuse_symbol_collision_and_existing_other_exchange(self):
        for field,value in (('name','Wrong'),('symbol','STX2'),
                            ('source','Bitget Spot native 1m HTTPS')):
            c=index()
            c['assets'][90][field]=value
            if field=='source':c['assets'][90]['months']=1
            with self.assertRaisesRegex(ValueError,'changed'):
                a.owners(c)
        c=index()
        c['assets'][90]['source']='Binance Spot official native 1m ZIPs'
        c['assets'][90]['months']=12
        self.assertEqual(len(a.owners(c)),3)

    def test_checkpoint_is_independent_of_earlier_eight_owner_batch(self):
        now=dt.datetime(2026,10,12,tzinfo=dt.timezone.utc)
        jobs=a.select(index(),set(),now,2)
        self.assertEqual([j['month'] for j in jobs],['2026-09','2026-08'])
        self.assertEqual(len(jobs[0]['assets']),3)
        existing={jobs[0]['tag']}
        further=a.select(index(),existing,now,2)
        self.assertEqual(further[0]['month'],'2026-08')
        with self.assertRaisesRegex(ValueError,'Unsafe'):
            a.select(index(),set(),now,13)

if __name__=='__main__':unittest.main(verbosity=2)
