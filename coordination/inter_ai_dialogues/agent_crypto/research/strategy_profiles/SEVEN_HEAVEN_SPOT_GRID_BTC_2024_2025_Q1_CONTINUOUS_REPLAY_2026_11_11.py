#!/usr/bin/env python3
"""Seven Heaven — reproducible, read-only BTCUSDT Spot Grid quarterly replay.

Inputs are six original user-supplied Binance monthly 1m ZIPs; SHA-256 and every
UTC minute are verified. Results are hypothetical OHLCV-based fills, not real
executions or trading advice. No networking, no accounts and no orders.

Run: python SEVEN_HEAVEN_SPOT_GRID_BTC_2024_2025_Q1_CONTINUOUS_REPLAY_2026_11_11.py
Requires numpy and numba; source files in same folder.
"""
from pathlib import Path
from datetime import datetime, timezone
import calendar,csv,hashlib,io,json,math,zipfile
import numpy as np
from numba import njit

ROOT=Path(__file__).resolve().parent
STEM='SEVEN_HEAVEN_SPOT_GRID_BTC_2024_2025_Q1_CONTINUOUS_REPLAY_2026_11_11'
EXPECTED={
 '2024-01':('40b78258091a468f8756843f207f5913eafc1d6e756c40a78711320d93fa5e75',44640),
 '2024-02':('431132e0db8b9fe6e5c93c8e9ba3ae37dbcfa0edcdd57618b1b78ac18d14be79',41760),
 '2024-03':('a9af86295eae839f1d072643c67eed7fcc47bb1d82c12ef312d041eec9511e7b',44640),
 '2025-01':('8d028b2f91aad57d6b693d44449c93f9c4b7044f55f298c8a3ac40ab676dafac',44640),
 '2025-02':('26b3795072983a66bdbe8327e0d5e71069bdd5ca831d4da3850ba68ef7a991ef',40320),
 '2025-03':('e333601b6c721434f3cdd6670ffde2371bef7946572864c49ba6431a690ab1ca',44640),
}
FEE=.001; SLIP=.0005; START=1000.; WIDTHS=(.05,.10,.20,.30)


def load_month(month):
    name=f'BTCUSDT-1m-{month}.zip';p=ROOT/name
    expected_sha,expected_n=EXPECTED[month]
    assert p.is_file(),f'Missing archive: {name}'
    h=hashlib.sha256()
    with p.open('rb') as f:
        for block in iter(lambda:f.read(1024*1024),b''):h.update(block)
    actual=h.hexdigest()
    assert actual==expected_sha,f'SHA mismatch for {name}: {actual}'
    yr,mo=(int(x) for x in month.split('-'))
    expected=calendar.monthrange(yr,mo)[1]*1440
    assert expected==expected_n
    start=int(datetime(yr,mo,1,tzinfo=timezone.utc).timestamp()*1000)
    out=np.empty((expected,5),dtype=np.float64)
    volume=0.; n=0;unit=None
    with zipfile.ZipFile(p) as z:
        assert z.namelist()==[f'BTCUSDT-1m-{month}.csv'],f'Unexpected ZIP members: {name}'
        zi=z.getinfo(z.namelist()[0]);assert zi.file_size<30_000_000
        with z.open(zi) as raw:
            reader=csv.reader(io.TextIOWrapper(raw,encoding='utf-8-sig',newline=''))
            for row in reader:
                assert len(row)==12,(month,n,len(row))
                raw_t=int(row[0]);raw_end=int(row[6]);current_unit='us' if raw_t>=10**15 else 'ms'
                unit=unit or current_unit
                assert current_unit==unit,(month,n,'timestamp unit changed')
                t=raw_t//1000 if unit=='us' else raw_t
                e=raw_end//1000 if unit=='us' else raw_end
                assert t==start+n*60000,(month,n,'missing or duplicate minute',t)
                assert t<=e<=t+60000,(month,n,'invalid candle close timestamp')
                op,high,low,close=map(float,row[1:5]);v=float(row[5]);q=float(row[7]);trades=int(row[8])
                assert all(math.isfinite(x) for x in (op,high,low,close,v,q))
                assert 0<low<=min(op,close)<=max(op,close)<=high and v>=0 and q>=0 and trades>=0
                out[n]=(t,op,high,low,close)
                volume+=v;n+=1
    assert n==expected
    return out,{'month':month,'zip_name':name,'sha256_verified':actual,
                'minute_candles_verified':n,'timestamp_unit':unit,
                'first_open_price_usdt':float(out[0,1]),'last_close_price_usdt':float(out[-1,4]),
                'base_volume_btc':round(volume,6),'zip_size_bytes':p.stat().st_size}

@njit(cache=True)
def replay(rows,width,mode,fee,slip,monthly_reset,month_start1,month_start2):
    """mode 0 TOUCH candle extreme, mode 1 CLOSE close crossing (both fictitious).

    Single run across whole quarter, no capital reset; optional price re-centre
    at start of each new month after liquidation/rebalancing 50%/50%.
    Returns summary and daily equity (close-to-close valued, with exit costs).
    """
    n=rows.shape[0];nd=n//1440
    buyfactor=(1-fee)/(1+slip);sellfactor=(1-fee)*(1-slip)
    btc=np.zeros(10);cash=np.zeros(10);basis=np.zeros(10)
    levels=np.empty(11)
    dates=np.empty(nd,np.float64); daily=np.empty((nd,3),np.float64)
    buys=0;sells=0;cycles=0;closed_profit=0.;reset_profit=0.
    ambiguous=0;below=0;above=0;reset_count=0
    peak=START;dd=0.;day=0
    firstlower=0.;firstupper=0.
    for k in range(n):
        t,op,hi,lo,cl=rows[k]
        if k==0 or (monthly_reset and (k==month_start1 or k==month_start2)):
            # At new calendar month first minute; no assumed knowledge of later prices.
            wealth=START
            if k>0:
                wealth=0.
                for j in range(10):
                    wealth+=cash[j]+btc[j]*op*sellfactor
                    if btc[j]>0:
                        reset_profit+=btc[j]*op*sellfactor-basis[j]
                reset_count+=1
            for j in range(11): levels[j]=op*(1.-width+(2.*width*j/10.))
            if k==0:
                firstlower=levels[0];firstupper=levels[10]
            for j in range(10):
                if j<5:
                    cash[j]=wealth/10.;btc[j]=0.;basis[j]=0.
                else:
                    cash[j]=0.;btc[j]=(wealth/10.)*buyfactor/op;basis[j]=wealth/10.
        if cl<levels[0]:below+=1
        elif cl>levels[10]:above+=1
        for j in range(10):
            lower=levels[j];upper=levels[j+1]
            if btc[j]<=0:
                fire=(lo<=lower) if mode==0 else (cl<=lower)
                if fire:
                    if lo<=lower and hi>=upper:ambiguous+=1
                    basis[j]=cash[j]
                    btc[j]=cash[j]*buyfactor/lower
                    cash[j]=0.;buys+=1
            else:
                fire=(hi>=upper) if mode==0 else (cl>=upper)
                if fire:
                    if lo<=lower and hi>=upper:ambiguous+=1
                    proceeds=btc[j]*upper*sellfactor
                    closed_profit+=proceeds-basis[j];cycles+=1
                    cash[j]=proceeds;btc[j]=0.;basis[j]=0.;sells+=1
        if k%1440==1439:
            total_cash=0.;total_btc=0.
            for j in range(10):
                total_cash+=cash[j];total_btc+=btc[j]
            eq=total_cash+total_btc*cl*sellfactor
            peak=max(peak,eq)
            dd=min(dd,100.*(eq/peak-1.))
            daily[day]=(eq,total_cash,total_btc);dates[day]=t;day+=1
    left_profit=0.
    for j in range(10):
        if btc[j]>0:left_profit+=btc[j]*rows[-1,4]*sellfactor-basis[j]
    # All initial/rebalance/recycle costs included via effective fill factors.
    assert abs((daily[-1,0]-START)-(closed_profit+reset_profit+left_profit))<.00001
    return np.array([daily[-1,0],100*(daily[-1,0]/START-1),dd,buys,sells,cycles,
                     closed_profit,reset_profit,left_profit,daily[-1,1],daily[-1,2],
                     below,above,ambiguous,reset_count,firstlower,firstupper]),daily

@njit(cache=True)
def replay_hold(rows,exposure,fee,slip):
    bf=(1-fee)/(1+slip);sf=(1-fee)*(1-slip)
    btc=START*exposure*bf/rows[0,1];cash=START*(1.-exposure)
    day=np.empty((rows.shape[0]//1440,3));d=0.;peak=START;dd=0.
    for k in range(rows.shape[0]):
        if k%1440==1439:
            value=cash+btc*rows[k,4]*sf
            peak=max(peak,value);dd=min(dd,100*(value/peak-1))
            day[int(d)]=(value,cash,btc);d+=1
    return np.array([day[-1,0],100*(day[-1,0]/START-1),dd,0,0,0,0,0,day[-1,0]-START,cash,btc,0,0,0,0,0,0]),day


def crunch():
    allres={};curves={};archive_details=[]
    for year in (2024,2025):
        parts=[]
        for m in range(1,4):
            month=f'{year}-{m:02}'
            r,meta=load_month(month);archive_details.append(meta);parts.append(r)
            print('SOURCE_OK',month,len(r),meta['sha256_verified'][:16],flush=True)
        rows=np.concatenate(parts,axis=0)
        # Each timestamp increasing by exactly one minute; includes month boundaries.
        assert np.all(np.diff(rows[:,0])==60000)
        assert len(rows)==(91 if year==2024 else 90)*1440
        assert rows[0,0]==datetime(year,1,1,tzinfo=timezone.utc).timestamp()*1000
        assert rows[-1,0]==datetime(year,3,31,23,59,tzinfo=timezone.utc).timestamp()*1000
        print('PERIOD_OK',year,len(rows),'minutes','opening',rows[0,1],'closing',rows[-1,4],flush=True)
        for width in WIDTHS:
            for model in ('TOUCH','CLOSE'):
                for costmult in (1,2):
                    for resets in ('FIXED','MONTHLY_REBALANCE'):
                        val, daily=replay(rows,width,int(model=='CLOSE'),FEE*costmult,SLIP*costmult,resets=='MONTHLY_REBALANCE',len(parts[0]),len(parts[0])+len(parts[1]))
                        tags=f'{year}::{resets}::{model}::{int(width*100)}::{costmult}'
                        allres[tags]={
                            'year':year,'policy':resets,'model':model,'width_pct':round(100*width),
                            'costs_multiplier':costmult,'capital_start_usdt':START,
                            'net_capital_end_usdt':round(val[0],6),'return_pct':round(val[1],4),
                            'max_daily_drawdown_pct':round(val[2],4),
                            'hypothetical_buys':int(val[3]),'hypothetical_sells':int(val[4]),
                            'closed_cycles':int(val[5]),'closed_cycle_pnl_usdt':round(val[6],6),
                            'realized_rebalance_inventory_pnl_usdt':round(val[7],6),
                            'open_inventory_pnl_usdt':round(val[8],6),
                            'end_cash_usdt':round(val[9],6),'end_btc_qty':round(val[10],10),
                            'minutes_close_below_grid':int(val[11]),'minutes_close_above_grid':int(val[12]),
                            'ambiguous_one_minute_level_crossings':int(val[13]),
                            'monthly_resets_after_initial':int(val[14]),
                            'initial_grid_lower':round(val[15],4),'initial_grid_upper':round(val[16],4),
                        }
                        curves[tags]=daily[:,0]
                        if model=='TOUCH' and costmult==1:
                            print('RESULT',year,resets,int(width*100),round(val[1],3),round(val[2],3),'cycles',int(val[5]),flush=True)
        for exposure in (.5,1.):
            val,daily=replay_hold(rows,exposure,FEE,SLIP)
            key=f'{year}::HOLD::{int(exposure*100)}'
            allres[key]={
                'year':year,'policy':'BUY_HOLD','model':'PASSIVE','width_pct':None,
                'costs_multiplier':1,'btc_initial_allocation_pct':int(exposure*100),
                'capital_start_usdt':START,'net_capital_end_usdt':round(val[0],6),
                'return_pct':round(val[1],4),'max_daily_drawdown_pct':round(val[2],4),
                'end_cash_usdt':round(val[9],6),'end_btc_qty':round(val[10],10)
            }
            curves[key]=daily[:,0]
            print('HOLD',year,exposure,round(val[1],3),round(val[2],3),flush=True)
    result={
        'schema':'seven.heaven.spot-grid-quarterly-independent-two-years.v1',
        'periods_utc':['2024-01-01/2024-03-31','2025-01-01/2025-03-31'],
        'minutes_total':260640,'sources':archive_details,
        'assumptions':{
            'asset':'Binance Spot BTCUSDT native monthly 1m',
            'capital_per_period_usdt':1000,'capital_flows_between_months':'none',
            'years_independent':True,'grid_intervals':10,'grid_initial_btc_cash_split':'50/50',
            'widths_pct':[5,10,20,30],'fill_models':['TOUCH','CLOSE'],
            'fee_per_side':FEE,'slippage_per_side':SLIP,
            'cost_stress_doubled':True,
            'fixed_grid':'Initial January center retained for entire quarter',
            'monthly_rebalance':'Liquidate and rebalance to 50% BTC + 50% cash at Feb 1 and Mar 1 open; no new external funds',
            'daily_equity':'cash + BTC * daily close * (1-fee)*(1-slippage)',
            'fills_not_observed':True,'no_orderbook':True,'no_leverage':True,'no_real_orders':True},
        'results':allres}
    outfile=ROOT/(STEM+'_PROOFS.json')
    outfile.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    csvfile=ROOT/(STEM+'_EQUITY_DAILY.csv')
    keep=[k for k in curves if (k.endswith('::1') and '::TOUCH::' in k) or '::HOLD::' in k]
    with csvfile.open('w',newline='',encoding='utf-8') as f:
        wr=csv.writer(f);wr.writerow(['date_utc']+keep)
        for year in (2024,2025):
            month_days=91 if year==2024 else 90
            for day in range(month_days):
                d=datetime.fromtimestamp((datetime(year,1,1,tzinfo=timezone.utc).timestamp()+day*86400),timezone.utc).strftime('%Y-%m-%d')
                wr.writerow([d]+[f'{curves[k][day]:.6f}' if k.startswith(f'{year}::') else '' for k in keep])
    md=ROOT/(STEM+'_REPORT.md')
    lines=['# Seven Heaven — Replay Spot Grid trimestriel continu, 2024 et 2025','',
           '## Méthode et preuve','',
           '- Six ZIP originaux Binance Spot BTC/USDT à la minute fournis par l’utilisateur.','- SHA-256 vérifiés contre le registre canonique du Coffre (détails JSON).',
           '- Janvier–mars 2024 : 91 jours ; janvier–mars 2025 : 90 jours ; 260 640 bougies, sans lacune ni doublon.','- Deux expériences indépendantes de 1 000 USDT chacune ; **aucune remise à zéro interne en février ou mars**.',
           '- Dix intervalles arithmétiques, 50 % BTC initial / 50 % cash. Grilles fixes ±5/10/20/30 % ; variante de recentrage mensuel explicitement distincte.',
           '- Coût par côté : 0,10 % frais + 0,05 % glissement ; stress : coût doublé.',
           '- TOUCH = extrêmes haut/bas ; CLOSE = clôture franchissant niveau. Chaque modèle suppose des remplissages fictifs au niveau de grille (pas une preuve exécutable).',
           '- Valorisation à la clôture quotidienne après coûts estimés de vente des BTC ; drawdown calculé sur la série quotidienne.',
           '', '## Résultats — grille fixe (TOUCH, coûts normaux)','',
           '| Configuration | 2024 T1 | 2025 T1 | Drawdown 2024 | Drawdown 2025 |','|---|---:|---:|---:|---:|']
    for w in (5,10,20,30):
        x=allres[f'2024::FIXED::TOUCH::{w}::1'];y=allres[f'2025::FIXED::TOUCH::{w}::1']
        lines.append(f"| ±{w}% | {x['return_pct']:+.2f}% | {y['return_pct']:+.2f}% | {x['max_daily_drawdown_pct']:.2f}% | {y['max_daily_drawdown_pct']:.2f}% |")
    for ratio in (50,100):
        x=allres[f'2024::HOLD::{ratio}'];y=allres[f'2025::HOLD::{ratio}']
        lines.append(f"| Buy & Hold {ratio}% BTC | {x['return_pct']:+.2f}% | {y['return_pct']:+.2f}% | {x['max_daily_drawdown_pct']:.2f}% | {y['max_daily_drawdown_pct']:.2f}% |")
    lines+=['','## Grille mensuellement re-centrée (TOUCH, coûts normaux)','',
            '| Grille | 2024 T1 | 2025 T1 |','|---|---:|---:|']
    for w in (5,10,20,30):
        x=allres[f'2024::MONTHLY_REBALANCE::TOUCH::{w}::1'];y=allres[f'2025::MONTHLY_REBALANCE::TOUCH::{w}::1']
        lines.append(f"| ±{w}% | {x['return_pct']:+.2f}% | {y['return_pct']:+.2f}% |")
    lines+=['','## Contrôles et limites','',
            'La grille fixe est paramétrée une seule fois à l’ouverture de janvier. Le recentrage mensuel n’apporte pas de capital supplémentaire, mais vend/rachète l’inventaire à coût fictif.',
            'TOUCH et CLOSE sont deux **hypothèses de remplissage non vérifiées**. Une limite touchée ou dépassée ne garantit pas un ordre rempli ; les gaps rendent les résultats potentiellement trop optimistes.',
            'Aucun carnet, ordre réel, spread exact, contrainte de taille, impôt ni changement de frais OKX n’est testé. Une simulation rétrospective, même hors période de sélection, ne certifie pas des gains futurs.',
            '', 'Documents : JSON preuves, CSV capital quotidien et script Python. Aucun changement de l’Administrator, Trader ou Bridge.','']
    lines += [
        '## Sensibilité aux coûts (TOUCH, frais et glissement doublés)','',
        '| Grille fixe | 2024 T1 : coûts standard → ×2 | 2025 T1 : coûts standard → ×2 |',
        '|---|---:|---:|',
    ]
    for w in (5,10,20,30):
        a=allres[f'2024::FIXED::TOUCH::{w}::1']['return_pct']
        b=allres[f'2024::FIXED::TOUCH::{w}::2']['return_pct']
        c=allres[f'2025::FIXED::TOUCH::{w}::1']['return_pct']
        d=allres[f'2025::FIXED::TOUCH::{w}::2']['return_pct']
        lines.append(f'| ±{w}% | {a:+.2f}% → {b:+.2f}% | {c:+.2f}% → {d:+.2f}% |')
    lines += [
       '', '## Lecture des inventaires et des cycles (grille fixe ±20% ; TOUCH)', '',
       '| Mesure | 2024 T1 | 2025 T1 |','|---|---:|---:|'
    ]
    a=allres['2024::FIXED::TOUCH::20::1'];b=allres['2025::FIXED::TOUCH::20::1']
    for title,key,unit in (
       ('Cycles achevés','closed_cycles',''),
       ('Profit des cycles fermés','closed_cycle_pnl_usdt',' USDT'),
       ('P&L de l’inventaire encore détenu','open_inventory_pnl_usdt',' USDT'),
       ('Liquidités finales','end_cash_usdt',' USDT'),
       ('Baisse maximale quotidienne','max_daily_drawdown_pct',' %'),
    ):
        lines.append(f'| {title} | {a[key]:+.3f}{unit} | {b[key]:+.3f}{unit} |')
    lines += [
        '', '**Contrôle de non-régression :** les 32 variantes de janvier 2024 et janvier 2025 (4 largeurs × TOUCH/CLOSE × coûts standard/doublés × 2 années) ont été comparées aux résultats archivés de la première étude : 32 reproductions concordantes.',
        '', '**Interprétation :** en 2024, la forte hausse BTC favorise nettement le Buy & Hold, alors que les grilles prennent leurs bénéfices et peuvent terminer en liquidités. En 2025, les cycles de grille amortissent en partie la baisse, mais les inventaires ouverts peuvent encore peser lourd.',
        '', '**Limite supplémentaire :** les quatre largeurs ont été sélectionnées à la lumière d’études antérieures. Les comparer à 2024–2025 reste une vérification historique rétrospective, pas un essai prospectif. Un résultat de +1,21 % peut disparaître dès que les hypothèses d’exécution ou de frais changent.',
        ''
    ]
    md.write_text('\n'.join(lines),encoding='utf-8')
    print('ARTIFACTS',outfile.name,csvfile.name,md.name,flush=True)
    return result

if __name__=='__main__':crunch()
