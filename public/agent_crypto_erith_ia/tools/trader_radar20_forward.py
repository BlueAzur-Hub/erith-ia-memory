#!/usr/bin/env python3
"""Frozen forward-only Radar20 paper A/B; public Binance and OKX only."""
import datetime as dt, json, hashlib, csv, io, zipfile, re, math, statistics, time, pathlib, urllib.request, urllib.parse
from urllib.error import HTTPError, URLError
SYMBOLS=('ETH','SOL','XRP','ADA','LINK','AVAX','SUI','NEAR','UNI','AAVE','LTC','BCH','DOT','HBAR','XLM','DOGE','PEPE','SHIB','APT','ARB')
START='2026-10-14'; DAYS=90; HOUR=3600000; CAPITAL=400.; TICKET=100.
COSTS=(.8,1.2,1.6); ROOT=pathlib.Path(__file__).resolve().parents[1]/'data/trader_flux/radar20_forward'
CFG_SHA='212833da065e71420bc01dc77fb296749b993ee0f6d7856cc5e2b0b560d833d6'
COLS=['timestamp_ms','open_usdt','high_usdt','low_usdt','close_usdt','volume_usdt','taker_buy_usdt','buy_pct','trades']
def chk(ok,message):
    if not ok:raise ValueError(message)
def rawj(obj):return (json.dumps(obj,sort_keys=True,separators=(',',':'),ensure_ascii=False,allow_nan=False)+'\n').encode()
def digest(b):return hashlib.sha256(b).hexdigest()
def save(path,obj):
    path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(rawj(obj))
def dateplus(day,n):return (dt.date.fromisoformat(day)+dt.timedelta(days=n)).isoformat()
def millis(day):return int(dt.datetime.fromisoformat(day).replace(tzinfo=dt.timezone.utc).timestamp()*1000)
def grab(url,limit=4000000):
    req=urllib.request.Request(url,headers={'User-Agent':'Erith-Radar20-Forward-Research','Accept':'application/octet-stream'})
    with urllib.request.urlopen(req,timeout=30) as f:
        data=f.read(limit+1);chk(f.status==200 and 0<len(data)<=limit,'bounded public download failed');return data
def load_protocol():
    path=ROOT/'experiment.json';body=path.read_bytes();chk(digest(body)==CFG_SHA,'PROTOCOL CHANGED')
    p=json.loads(body)
    chk(p['start_day_utc']==START and p['symbols']==list(SYMBOLS) and p['test_days']==DAYS
        and p['capital_usdt']==400 and p['ticket_usdt']==100 and p['holding_hours']==48
        and p['market_trend_threshold_pct']==3 and p['taker_buy_threshold_pct']==50
        and p['max_positions']==4 and p['roundtrip_cost_scenarios_pct']==list(COSTS),'PROTOCOL UNEXPECTED')
    return p
def parse_native(sym,day,blob,checksum):
    name=f'{sym}USDT-1h-{day}.zip';parts=checksum.decode('ascii').split()
    chk(len(parts)==2 and parts[1].lstrip('*')==name and parts[0]==digest(blob),'Official Binance SHA mismatch')
    records=[];t0=millis(day)
    with zipfile.ZipFile(io.BytesIO(blob)) as z:
        csvname=name[:-4]+'.csv';chk(z.namelist()==[csvname],'Unexpected ZIP entries')
        info=z.getinfo(csvname);chk(800<=info.file_size<=150000 and info.compress_size>0 and info.file_size<=info.compress_size*200,'Unbounded ZIP')
        with z.open(csvname) as stream:
            for line in csv.reader(io.TextIOWrapper(stream,encoding='utf-8-sig',newline='')):
                chk(len(line)==12,'Expected 12 native columns');i=len(records)
                stamp=int(line[0]);stamp=stamp//1000 if stamp>=10**15 else stamp
                chk(i<24 and stamp==t0+i*HOUR,'Missing or duplicate hourly candle')
                closed=int(line[6]);closed=closed//1000 if closed>=10**15 else closed
                chk(stamp<=closed<stamp+HOUR,'Invalid closing stamp')
                op,hi,lo,cl,vol,buy=(float(line[k]) for k in (1,2,3,4,7,10))
                chk(all(math.isfinite(v) for v in (op,hi,lo,cl,vol,buy)) and 0<lo<=min(op,cl)
                    and max(op,cl)<=hi and 0<=buy<=vol*(1+1e-8),'Invalid OHLCV or taker buy')
                tr=int(line[8]);chk(tr>=0,'Invalid trade count')
                records.append([stamp,op,hi,lo,cl,vol,buy,round(100*buy/vol,8) if vol else None,tr])
    chk(len(records)==24,'Incomplete day')
    return {'pair':sym+'USDT','source_zip_sha256':digest(blob),'columns':COLS,'rows':records}
def day_source(day):
    markets=[]
    for sym in SYMBOLS:
        name=f'{sym}USDT-1h-{day}.zip'
        url=f'https://data.binance.vision/data/spot/daily/klines/{sym}USDT/1h/{name}'
        markets.append(parse_native(sym,day,grab(url),grab(url+'.CHECKSUM',8192)))
    return {'schema':'erith.radar20.forward.source.v1','day':day,'markets':markets,'complete':True}
def validate_old():
    idx=ROOT/'index.json'
    if not idx.exists():return
    old=json.loads(idx.read_bytes());chk(old['config_sha256']==CFG_SHA,'Old study changed')
    for item in old.get('days',[])+old.get('okx',[])+old.get('outputs',[]):
        rel=item['file'];chk('..' not in pathlib.PurePosixPath(rel).parts and not rel.startswith('/'),'Unsafe path')
        path=ROOT/rel;chk(path.is_file() and digest(path.read_bytes())==item['sha256'],'Previous evidence changed')
def read_days():
    folder=ROOT/'observations';files=sorted(folder.glob('????-??-??.json')) if folder.exists() else []
    arrays={sym:[] for sym in SYMBOLS};proof=[]
    for j,path in enumerate(files):
        day=dateplus(START,j);chk(path.name==day+'.json','Missing contiguous day')
        content=path.read_bytes();doc=json.loads(content)
        chk(doc['day']==day and doc['complete'] and len(doc['markets'])==20,'Invalid daily document')
        seen=[]
        for source in doc['markets']:
            sym=source['pair'][:-4];chk(sym in SYMBOLS and source['pair']==sym+'USDT' and source['columns']==COLS
                and len(source['rows'])==24,'Wrong pair or rows')
            seen.append(sym)
            for k,row in enumerate(source['rows']):
                chk(len(row)==9 and row[0]==millis(day)+k*HOUR and row[1]>0 and row[3]>0
                    and row[5]>=0 and row[6]>=0 and (row[7] is None or 0<=row[7]<=100),'Bad archived hour')
                arrays[sym].append(row)
        chk(set(seen)==set(SYMBOLS) and len(seen)==20,'Duplicate/missing pair')
        proof.append({'day':day,'file':'observations/'+path.name,'sha256':digest(content)})
    return arrays,proof
def markettrend(rows,h):
    if h<73:return None
    return statistics.median(100*(rows[s][h-1][4]/rows[s][h-73][4]-1) for s in SYMBOLS)
def simulate(data,p,filter_enabled,fee_pct):
    n=len(data['ETH']);chk(all(len(data[s])==n for s in SYMBOLS),'Unsynchronised assets')
    cash=CAPITAL;hold=48;half=fee_pct/200;positions={};deals=[];equity=[]
    rejected={'filter':0,'existing':0,'capacity':0,'cash':0};signals=0;peak=CAPITAL;maxdd=0
    for h in range(n):
        ts=data['ETH'][h][0]
        for sym,item in list(positions.items()):
            if item['exit_h']!=h:continue
            proceeds=item['units']*data[sym][h][1]*(1-half);cash+=proceeds
            deals.append({'pair':sym+'USDT','entry_ms':item['at'],'exit_ms':ts,
                'pnl_net_usdt':round(proceeds-TICKET,8),'buy_share_pct':item['share'],
                'market_trend_72h_pct':item['trend']})
            del positions[sym]
        if 73<=h<min(n,DAYS*24):
            trend=markettrend(data,h);choices=[]
            for sym in SYMBOLS:
                prev=data[sym][h-1];previous=[data[sym][i][5] for i in range(h-25,h-1)]
                median=statistics.median(previous)
                if prev[7] is not None and prev[7]>=50 and prev[5]>median and prev[5]>0:
                    signals+=1;choices.append((sym,prev[7],prev[5]/max(median,1e-9)))
            choices.sort(key=lambda x:(-x[1],-x[2],x[0]))
            for sym,share,ratio in choices:
                if filter_enabled and trend<3:rejected['filter']+=1;continue
                if sym in positions:rejected['existing']+=1;continue
                if len(positions)>=4:rejected['capacity']+=1;continue
                if cash+1e-9<TICKET:rejected['cash']+=1;continue
                entry=data[sym][h][1];cash-=TICKET
                positions[sym]={'units':TICKET/(1+half)/entry,'at':ts,'exit_h':h+hold,
                                'share':share,'trend':round(trend,7)}
        value=cash+sum(item['units']*data[sym][h][4]*(1-half) for sym,item in positions.items())
        peak=max(peak,value);maxdd=max(maxdd,peak-value)
        equity.append([ts,round(value,7),round(cash,7),len(positions)])
    realized=sum(x['pnl_net_usdt'] for x in deals)
    unrealized=sum(item['units']*data[sym][-1][4]*(1-half)-TICKET for sym,item in positions.items()) if n else 0
    final=equity[-1][1] if n else CAPITAL
    chk(abs(final-CAPITAL-realized-unrealized)<.005,'Ledger out of balance')
    return {'model':'B_trend_3pct' if filter_enabled else 'A_original','cost_pct':fee_pct,
        'closed_trades':len(deals),'wins':sum(x['pnl_net_usdt']>0 for x in deals),
        'open_positions':len(positions),'realized_usdt':round(realized,6),
        'unrealized_usdt':round(unrealized,6),'equity_usdt':round(final,6),
        'worst_drawdown_usdt':round(maxdd,6),'signals':signals,'rejected':rejected,
        'trades':deals,'equity_history':equity}
def passive(data,fee_pct):
    if not data['ETH']:return None
    per=CAPITAL/20;half=fee_pct/200
    v=sum(per/(1+half)*data[s][-1][4]/data[s][0][1]*(1-half) for s in SYMBOLS)
    return {'pnl_net_usdt':round(v-CAPITAL,6),'different_exposure':True,'not_guaranteed_executable':True}
def okx_snapshot():
    date=dt.datetime.now(dt.timezone.utc).isoformat();entries=[]
    for sym in SYMBOLS:
        market=sym+'-USDT'
        try:
            url='https://www.okx.com/api/v5/market/books?'+urllib.parse.urlencode({'instId':market,'sz':5})
            obj=json.loads(grab(url,500000));chk(obj['code']=='0','No OKX pair')
            book=obj['data'][0];bid=float(book['bids'][0][0]);ask=float(book['asks'][0][0])
            chk(0<bid<=ask and abs(int(book['ts'])-time.time()*1000)<120000,'Invalid or stale book')
            spread=(ask-bid)/((ask+bid)/2)*10000
            entries.append({'pair':market,'status':'OBSERVED_PUBLIC_BOOK','bid':bid,'ask':ask,
                            'exchange_ms':int(book['ts']),'spread_bps':round(spread,5)})
        except Exception as ex:entries.append({'pair':market,'status':'UNAVAILABLE','reason':type(ex).__name__})
    return {'observation_utc':date,'markets':entries,'user_fee_authenticated':False,
            'fills_at_previous_hours_verified':False,'note':'Current public spreads only, not actual OKX execution costs.'}
def execute():
    protocol=load_protocol();validate_old()
    readings,days=read_days();today=dt.datetime.now(dt.timezone.utc).date()
    target=(today-dt.timedelta(days=1)).isoformat();nextday=dateplus(START,len(days));added=0;waiting=None
    while nextday<=target and nextday<dateplus(START,DAYS+2) and added<4:
        try:doc=day_source(nextday)
        except (OSError,ValueError,zipfile.BadZipFile) as ex:
            waiting={'day':nextday,'type':type(ex).__name__};break
        save(ROOT/'observations'/(nextday+'.json'),doc);nextday=dateplus(nextday,1);added+=1
    readings,days=read_days();outputs=[];variants={}
    for fee in COSTS:
        for filter_enabled in (False,True):
            label=('B' if filter_enabled else 'A')+f'_{fee:.1f}'
            result=simulate(readings,protocol,filter_enabled,fee)
            variants[label]={k:v for k,v in result.items() if k not in ('trades','equity_history')}
            if fee==.8:
                name='B' if filter_enabled else 'A'
                save(ROOT/f'trades_{name}.json',{'simulation_only':True,'trades':result['trades']})
                save(ROOT/f'equity_{name}.json',{'columns':['timestamp_ms','equity_usdt','cash_usdt','positions'],'rows':result['equity_history']})
                outputs.extend([f'trades_{name}.json',f'equity_{name}.json'])
    save(ROOT/'summary.json',{'schema':'erith.radar20.forward.summary.v1','protocol_sha256':CFG_SHA,
         'status':'WAITING_FOR_FIRST_DAY' if not days else 'COMPLETE' if len(days)==DAYS+2 else 'RUNNING',
         'days_collected':len(days),'hours_per_market':len(readings['ETH']),
         'no_live_orders':True,'strategy_certified':False,'fee_costs_hypothetical':True,
         'okx_account_fee_not_available':True,'waiting_source':waiting,'variants':variants,
         'passive':{str(f):passive(readings,f) for f in COSTS}})
    outputs.append('summary.json')
    if days:
        snap=ROOT/'okx_snapshots'/(today.isoformat()+'.json')
        if not snap.exists():save(snap,okx_snapshot())
    snapshots=sorted((ROOT/'okx_snapshots').glob('????-??-??.json')) if (ROOT/'okx_snapshots').is_dir() else []
    save(ROOT/'index.json',{'schema':'erith.radar20.forward.index.v1','config_sha256':CFG_SHA,
        'start_day':START,'days':days,'okx':[{'file':'okx_snapshots/'+q.name,'sha256':digest(q.read_bytes())} for q in snapshots],
        'outputs':[{'file':n,'sha256':digest((ROOT/n).read_bytes())} for n in outputs],
        'read_only_market_data':True,'orders_enabled':False})
    print(json.dumps({'status':'WAITING' if not days else 'RUNNING','archived_days':len(days),
                      'new_days':added,'source_pending':waiting,'closed_A':variants['A_0.8']['closed_trades'],
                      'closed_B':variants['B_0.8']['closed_trades']}))
if __name__=='__main__':execute()
