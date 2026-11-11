#!/usr/bin/env python3
"""Seven Heaven | BTC/USDT Spot Grid Jan-Oct 2026 | PAPER-only.

Independent extension of the 2026-11-11 native-minute study, using its
published Binance Spot monthly archives and SHA-256 registry. No account/API key.

Run:
    py SEVEN_HEAVEN_SPOT_GRID_BTC_2026_JAN_OCT_CONTINUOUS_REPLAY.py --self-test
    py SEVEN_HEAVEN_SPOT_GRID_BTC_2026_JAN_OCT_CONTINUOUS_REPLAY.py --download

Archives may instead be placed in ./seven_grid_2026_data/ and run without --download.
Outputs go in ./seven_grid_2026_results/.
"""
from __future__ import annotations
import argparse
import calendar
import csv
import datetime as dt
import hashlib
import json
import math
import os
import sys
import tempfile
import time
import urllib.request
import zipfile
from pathlib import Path

MANIFEST = {
 "2026-01": ("d28b369da32a6ea84ba0af517b1847ab67b2fcc1e0e111c1b24d56ae07240cb9",44640),
 "2026-02": ("cee2e913ed07e02834e2387c65ca430fe3576f620588bad8a02229238f385407",40320),
 "2026-03": ("a2c1e689d39aa7877e218f436f15162e9a4436778a377d32e9d9b81b081381cd",44640),
 "2026-04": ("318afd4f5acfbcfbb40fbe727a77eee8e9e7b54d8941589c78a32283d90b4a01",43200),
 "2026-05": ("62983d93c35e26ec6c29116c629e443b7ddfe3d301aca83331ff58112199d8d0",44640),
 "2026-06": ("c8e1d5e70b766dd2312fc9cd7085785bb25708e27e75c21a5a5aaba61a6d07f5",43200),
 "2026-07": ("3ef15c84353da48e1c7c5fd99b9751cb036bf8986ed47f7cd1be63359c0d4f6b",44640),
 "2026-08": ("acab442e02745177063031d402929703ae983715010064b40cf811c4beb843d4",44640),
 "2026-09": ("7a021fb5981cfdb1a56457d68fa81360ab27350c981ddfe63112b2322df44b56",43200),
 "2026-10": ("17168f260306752e39177a6c038bb8952f52bf08ff20e36d8da6068732621f1c",44640),
}
EXPECTED_N = 437760
REPO = "BlueAzur-Hub/erith-ia-memory"
SOURCE_INDEX = "public/agent_crypto_erith_ia/data/historical_archive_prototype/calendar_year_hourly_shards/index.json"
ORIGINAL_STUDY = "SEVEN_HEAVEN_SPOT_GRID_NATIVE_MINUTE_BTC_INVENTORY_REPLAY_2026_11_11"
NOW_DATE = "2026-11-11"
DEFAULT_FEE = .001
DEFAULT_SLIP = .0005
INITIAL = 1000.0


def sha256_file(path):
    sha=hashlib.sha256()
    with open(path,"rb") as f:
        for chunk in iter(lambda:f.read(1_048_576),b""):
            sha.update(chunk)
    return sha.hexdigest()


def get_assets_monthly(data_dir, download):
    data_dir.mkdir(parents=True,exist_ok=True)
    verified=[]
    for month,(digest,count) in MANIFEST.items():
        name=f"BTCUSDT-1m-{month}.zip"
        path=data_dir/name
        url=(f"https://github.com/{REPO}/releases/download/"
             f"crypto-spot-bulk-{month}-1m/{name}")
        if not path.exists():
            if not download:
                raise FileNotFoundError(
                    f"Archive absente: {path}. Fournir les 10 ZIP ou relancer avec --download.")
            print("TELECHARGEMENT",name,flush=True)
            with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"Seven-Heaven-Research/1.0"}),timeout=100) as src:
                with tempfile.NamedTemporaryFile(dir=data_dir,prefix=name+".",suffix=".part",delete=False) as dst:
                    part=Path(dst.name)
                    while True:
                        chunk=src.read(512*1024)
                        if not chunk:break
                        dst.write(chunk)
                        if dst.tell()>40_000_000:raise ValueError("Archive plus grande que prévu")
            try:
                if sha256_file(part)!=digest:
                    raise ValueError(f"SHA-256 incorrect pour {month}: le fichier téléchargé est refusé")
                part.replace(path)
            finally:
                if part.exists():part.unlink()
        got=sha256_file(path)
        if got!=digest: raise ValueError(f"SHA-256 invalide : {name} attendu={digest} obtenu={got}")
        verified.append({"month":month,"file":name,"sha256":got,"expected_candles":count,"url":url,
                         "bytes":path.stat().st_size})
        print("ARCHIVE_VERIFIEE",month,count,got[:16],flush=True)
    return verified


def load_data(data_dir):
    rows=[]
    month_start=[]
    previous_ms=None
    volume_total=0.
    for month,(digest,expected) in MANIFEST.items():
        name=f"BTCUSDT-1m-{month}"
        path=data_dir/(name+".zip")
        year,mo=map(int,month.split('-'))
        start=int(dt.datetime(year,mo,1,tzinfo=dt.timezone.utc).timestamp()*1000)
        month_start.append(len(rows))
        n=0; precision=None
        with zipfile.ZipFile(path) as z:
            if z.namelist()!=[name+'.csv']:
                raise ValueError(f"Nom ZIP inattendu pour {month}: {z.namelist()}")
            inf=z.getinfo(name+'.csv')
            if inf.file_size>25_000_000:raise ValueError("CSV trop grand")
            import io
            with z.open(inf) as stream:
                rdr=csv.reader(io.TextIOWrapper(stream,encoding="utf-8-sig",newline=""))
                for rec in rdr:
                    if len(rec)!=12:raise ValueError(f"12 colonnes attendues : {month}, ligne {n+1}")
                    raw_t=int(rec[0]); raw_end=int(rec[6]);unit='us' if raw_t>=10**15 else 'ms'
                    precision=precision or unit
                    if unit!=precision:raise ValueError("Mix de précision d'horodatage")
                    t=raw_t//1000 if unit=='us' else raw_t
                    t_end=raw_end//1000 if unit=='us' else raw_end
                    if t != start+n*60000:raise ValueError(f"Manque ou doublon 1m : {month} / {n} / {t}")
                    if not (t<=t_end<=t+60000):raise ValueError("Fin de bougie incorrecte")
                    op,hi,lo,cl=map(float,rec[1:5])
                    vol=float(rec[5]);quote=float(rec[7]);trades=int(rec[8])
                    if not(all(map(math.isfinite,(op,hi,lo,cl,vol,quote))) and
                           0<lo<=min(op,cl)<=max(op,cl)<=hi and vol>=0 and quote>=0 and trades>=0):
                        raise ValueError(f"OHLCV invalide : {month} ligne {n+1}")
                    if previous_ms is not None and t!=previous_ms+60000:
                        raise ValueError(f"Discontinuité entre mois: {month}, {t}")
                    previous_ms=t
                    rows.append((t,op,hi,lo,cl))
                    volume_total+=vol
                    n+=1
        if n!=expected:raise ValueError(f"Nombre de bougies invalide {month}: {n}!={expected}")
        print("BOUGIES_CONTINUES",month,n,flush=True)
    if len(rows)!=EXPECTED_N:raise ValueError(f"Total != {EXPECTED_N}")
    next_month_starts=set(month_start[1:])
    daily_ends=[]
    for i in range(len(rows)):
        if i==len(rows)-1 or rows[i][0]//86400000 != rows[i+1][0]//86400000:
            daily_ends.append(i)
    if len(daily_ends)!=304:raise ValueError("Nombre de journées inattendu")
    return rows,next_month_starts,set(daily_ends),volume_total


def levels_from(center):
    return [center*(.90+i*.02) for i in range(11)]


def simulate_grid(rows,monthly_reset,fill_model,fee,slip,day_ends,month_starts):
    assert fill_model in ('TOUCH','CLOSE')
    buyfactor=(1-fee)/(1+slip);sellfactor=(1-fee)*(1-slip)
    lots=[];grid=[];cycle_pnl=0.;cycles=0;buys=0;sells=0;reset_count=0;reset_sale_pnl=0.
    daily=[];peak=INITIAL; maxdd=0.;multi_levels=0;below_minutes=0;above_minutes=0; ambig=0
    reset_log=[];month_switch_valuation=[]
    for k,(t,op,hi,lo,cl) in enumerate(rows):
        if k==0 or (monthly_reset and k in month_starts):
            if k==0:
                wealth=INITIAL
            else:
                wealth=sum(s['cash']+s['btc']*op*sellfactor for s in lots)
                reset_sale_pnl += sum((s['btc']*op*sellfactor-s['basis']) for s in lots if s['btc'])
                reset_count+=1
                month_switch_valuation.append(round(wealth,6))
            grid=levels_from(op)
            # Rebalance 50% cash / 50% BTC at each scheduled reset.
            # Every BTC holding from the prior grid is liquidated first at the
            # new month's open with the same assumed sell cost, then re-bought.
            lots=[];piece=wealth/10
            for j in range(10):
                if j<5:
                    lots.append({'index':j,'cash':piece,'btc':0.,'basis':0.})
                else:
                    lots.append({'index':j,'cash':0.,'btc':piece*buyfactor/op,'basis':piece})
            reset_log.append({'date':dt.datetime.fromtimestamp(t/1000,dt.timezone.utc).strftime('%Y-%m-%d'),
                              'open':round(op,6),'capital_after_liquidation':round(wealth,6),
                              'lower':round(grid[0],6),'upper':round(grid[-1],6)})
        # The original study's TOUCH and CLOSE fill conventions are retained
        # for comparability, including their gap-related optimism.
        if lo<grid[0]:below_minutes+=1
        if hi>grid[-1]:above_minutes+=1
        multi_levels+=sum(lo<=p<=hi for p in grid)>1
        for s in lots:
            j=s['index'];buy=grid[j];sell=grid[j+1]
            two_sides=lo<=buy and hi>=sell
            if s['btc']==0:
                trigger=(lo<=buy if fill_model=='TOUCH' else cl<=buy)
                if trigger:
                    stake=s['cash']
                    s['btc']=stake*buyfactor/buy;s['basis']=stake;s['cash']=0.
                    buys+=1
                    if two_sides:ambig+=1
            else:
                trigger=(hi>=sell if fill_model=='TOUCH' else cl>=sell)
                if trigger:
                    proceeds=s['btc']*sell*sellfactor
                    cycle_pnl+=proceeds-s['basis'];cycles+=1
                    s['cash']=proceeds;s['btc']=0.;s['basis']=0.
                    sells+=1
                    if two_sides:ambig+=1
        if k in day_ends:
            btc_total=sum(s['btc'] for s in lots)
            cash=sum(s['cash'] for s in lots)
            wealth=cash+btc_total*cl*sellfactor
            peak=max(wealth,peak)
            maxdd=min(maxdd,100*(wealth/peak-1))
            daily.append((t,wealth,cash,btc_total))
    endvalue=daily[-1][1]
    return {
       'strategy':('GRID_MONTHLY_RESET_' if monthly_reset else 'GRID_FIXED_')+fill_model,
       'equity':round(endvalue,6), 'return_pct':round(100*(endvalue/INITIAL-1),4),
       'max_drawdown_daily_pct':round(maxdd,4),
       'hypothetical_buys':buys,'hypothetical_sells':sells,'hypothetical_completed_cycles':cycles,
       'hypothetical_closed_cycle_pnl_usdt':round(cycle_pnl,6),
       'hypothetical_reset_liquidation_pnl_usdt':round(reset_sale_pnl,6),
       'grid_resets_after_initial':reset_count,
       'end_cash_usdt':round(daily[-1][2],6),'end_btc_qty':round(daily[-1][3],10),
       'ambiguous_intraminute_events':ambig,
       'minutes_low_below_lower_bound':below_minutes,
       'minutes_high_above_upper_bound':above_minutes,
       'minutes_touching_multiple_levels':multi_levels,
       'reset_log':reset_log,
       'daily':daily,
       'hypothetical_fills_only':True
    }


def simulate_hold(rows,exposure,fee,slip,day_ends):
    buyfactor=(1-fee)/(1+slip);sellfactor=(1-fee)*(1-slip)
    btc=INITIAL*exposure*buyfactor/rows[0][1]
    cash=INITIAL*(1-exposure)
    daily=[];peak=INITIAL;min_dd=0.
    for k,(t,op,hi,lo,cl) in enumerate(rows):
        if k in day_ends:
            value=cash+btc*cl*sellfactor
            peak=max(peak,value);min_dd=min(min_dd,100*(value/peak-1))
            daily.append((t,value,cash,btc))
    v=daily[-1][1]
    return {'strategy':f'HOLD_{int(100*exposure)}', 'equity':round(v,6),
            'return_pct':round(100*(v/INITIAL-1),4),'max_drawdown_daily_pct':round(min_dd,4),
            'end_cash_usdt':round(cash,6),'end_btc_qty':round(btc,10),'daily':daily}


def write_report(out_dir,verified,results,volume_total):
    out_dir.mkdir(parents=True,exist_ok=True)
    trace=out_dir/'SEVEN_HEAVEN_SPOT_GRID_CONTINUOUS_BTC_2026_JAN_OCT_EQUITY_DAILY.csv'
    names=[x['strategy'] for x in results]
    with trace.open('w',encoding='utf-8',newline='') as f:
        w=csv.writer(f)
        w.writerow(['utc_day']+names)
        for i in range(304):
            date=dt.datetime.fromtimestamp(results[0]['daily'][i][0]/1000,dt.timezone.utc).strftime('%Y-%m-%d')
            w.writerow([date]+[f"{r['daily'][i][1]:.6f}" for r in results])
    result_data={
       'schema':'seven.heaven.crypto.spot-grid-ten-month-continuous.v1',
       'period_utc':'2026-01-01T00:00:00Z to 2026-10-31T23:59:00Z',
       'source':'Binance Spot BTCUSDT native 1m, archived GitHub release ZIP',
       'registry':f'https://github.com/{REPO}/blob/main/{SOURCE_INDEX}',
       'verified_archive_months':verified, 'minutes_verified':EXPECTED_N,
       'days_verified':304,'aggregate_base_volume_btc':round(volume_total,6),
       'assumptions':{'initial_capital_usdt':1000.0,'initial_btc_allocation_pct':50,
           'grid_levels':10,'grid_range_pct_around_initial_center':10,
           'reference_fees_per_side':.001,'reference_slippage_per_side':.0005,
           'stress_fees_per_side':.002,'stress_slippage_per_side':.001,
           'touch_model':'legacy candle low/high threshold: optimistic gap fills possible',
           'close_model':'legacy close cross, hypothetical fill at threshold, not proof of execution',
           'monthly_reset':'January initialization + nine first-minute month resets; sell all BTC and rebuy 50% at observed monthly open; no lookahead',
           'daily_mark':'cash + BTC * close * hypothetical selling factor',
           'no_leverage':True,'no_orders':True},
       'warning':'Retrospective PAPER only. Prices touching limits do not prove executable fills; maker queue, spreads, latency, tick size, actual OKX costs and taxes not modeled.',
       'results':[{k:v for k,v in r.items() if k!='daily'} for r in results],
    }
    jsonpath=out_dir/'SEVEN_HEAVEN_SPOT_GRID_CONTINUOUS_BTC_2026_JAN_OCT_PROOFS.json'
    jsonpath.write_text(json.dumps(result_data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    report=out_dir/'SEVEN_HEAVEN_SPOT_GRID_CONTINUOUS_BTC_2026_JAN_OCT_REPORT.md'
    lines=[
     '# Seven Heaven — Replay continu du Spot Grid BTC (janvier–octobre 2026)',
     '', '**Statut :** étude rétrospective PAPER, capital fictif conservé, aucun ordre réel.',
     '**Source :** dix ZIP mensuels Binance Spot BTC/USDT 1 minute, tous contrôlés par SHA-256 du Coffre.',
     '**Couverture vérifiée :** 437 760 minutes / 304 journées UTC ; aucune lacune, aucun doublon.',
     '', '## Résultats — valeur nette liquidable du portefeuille', '',
     '| Scénario | Valeur finale (USDT) | Rendement | Pire baisse quotidienne | Achats fictifs | Ventes fictives |',
     '|---|---:|---:|---:|---:|---:|',
    ]
    for r in results:
        lines.append(f"| {r['strategy']} | {r['equity']:.2f} | {r['return_pct']:+.2f}% | {r['max_drawdown_daily_pct']:.2f}% | {r.get('hypothetical_buys','—')} | {r.get('hypothetical_sells','—')} |")
    lines.extend(['', '## Règles fixées sans connaissance du futur','',
        '- Janvier : 1 000 USDT, moitié BTC, moitié liquidités ; dix intervalles arithmétiques de 2% autour du cours initial, bornes ±10%.',
        '- Grille fixe : bornes conservées pendant 304 jours, même lorsque le prix sort de la grille.',
        '- Grille réajustée : réinitialisation le premier jour de chaque mois UTC au prix d’ouverture, liquidation des BTC restants et réallocation 50/50 ; neuf changements.',
        '- TOUCH : plus haut/plus bas déclenche un remplissage hypothétique. CLOSE : clôture franchissant un seuil. Dans les deux cas, la limite est utilisée comme prix fictif de transaction.',
        '- Pour chaque lot : maximum une exécution fictive par minute, jamais achat et vente du même lot dans la même bougie.',
        '- Frais standard 0,10% par côté + glissement 0,05% par côté ; stress = 0,20% + 0,10%.',
        '- Valorisation quotidienne nette des frais estimés de liquidation du BTC détenu. Aucun apport supplémentaire, aucun levier, aucun compte.',
        '', '## Limites', '',
        '- Un prix touché ne garantit pas un ordre limite exécuté. Les modèles TOUCH et CLOSE ne sont ni des bornes probabilistes, ni des preuves de profit.',
        '- Un gap peut provoquer une exécution simulée au seuil alors que le meilleur prix exécutable serait différent.',
        '- Le prix de marché et les frais de Binance Spot BTC/USDT ne sont pas exactement ceux du compte OKX BTC/USDC.',
        '- Les réajustements mensuels ont été imposés avant lecture du résultat, mais le choix de ces deux politiques n’est pas optimisé ou validé hors échantillon.',
        '- La pire baisse est mesurée à la clôture de chaque journée, pas intra-minute.',
        '- Carnets, minimums de trading, volume réellement disponible, imposition et incidents de marché non modélisés.',
        '', '## Reproductibilité', '',
        f'- Registre original : https://github.com/{REPO}/blob/main/{SOURCE_INDEX}',
        f'- Étude précédente : {ORIGINAL_STUDY}',
        '- JSON produit : `SEVEN_HEAVEN_SPOT_GRID_CONTINUOUS_BTC_2026_JAN_OCT_PROOFS.json`',
        '- Courbes quotidiennes : `SEVEN_HEAVEN_SPOT_GRID_CONTINUOUS_BTC_2026_JAN_OCT_EQUITY_DAILY.csv`',
        '- Script autonome : `SEVEN_HEAVEN_SPOT_GRID_BTC_2026_JAN_OCT_CONTINUOUS_REPLAY.py`',
        '', '**Verdict :** les résultats sont expérimentaux ; les stratégies réelles nécessitent validation des exécutions avant toute conclusion pratique.',
        ''])
    report.write_text('\n'.join(lines),encoding='utf-8')
    return report,jsonpath,trace


def self_test():
    # Three 1-minute bars over two months, prices chosen to trigger fills in both directions.
    t0=int(dt.datetime(2026,1,31,23,59,tzinfo=dt.timezone.utc).timestamp()*1000)
    rows=[(t0,100,101,98,99),
          (t0+60000,99,103,96,102),
          (t0+120000,102,104,97,100)]
    for model in ['TOUCH','CLOSE']:
        for reset in [False,True]:
            r=simulate_grid(rows,reset,model,.001,.0005,{2},{1})
            assert math.isfinite(r['equity']) and r['equity']>0
            assert 0<=r['grid_resets_after_initial']<=1
            assert r['hypothetical_buys']>=0 and r['hypothetical_sells']>=0
            assert len(r['daily'])==1
            assert r['grid_resets_after_initial']==int(reset)
    h=simulate_hold(rows,.5,.001,.0005,{2})
    assert h['equity']>0
    assert len(MANIFEST)==10 and sum(x[1] for x in MANIFEST.values())==EXPECTED_N
    assert all(len(x[0])==64 for x in MANIFEST.values())
    # No-free-profit in flat market if no grid trade is triggered: fees reduce equity.
    flat=[(t0+i*60000,100,100,100,100) for i in range(4)]
    assert simulate_hold(flat,1,.001,.0005,{3})['equity']<INITIAL
    assert simulate_grid(flat,False,'TOUCH',.001,.0005,{3},set())['equity']<INITIAL
    print('TESTS_LOCAUX_OK : modèles, reset, coûts, calendrier et structure du manifeste')


def main():
    ap=argparse.ArgumentParser(description=__doc__,formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--zip-dir',default=str(Path(__file__).resolve().parent/'seven_grid_2026_data'))
    ap.add_argument('--out-dir',default=str(Path(__file__).resolve().parent/'seven_grid_2026_results'))
    ap.add_argument('--download',action='store_true',help='télécharger les ZIP publics manquants de GitHub Releases')
    ap.add_argument('--self-test',action='store_true',help='tester le moteur sans archives')
    args=ap.parse_args()
    if args.self_test:
        self_test();return
    verified=get_assets_monthly(Path(args.zip_dir),args.download)
    rows,month_starts,day_ends,vol=load_data(Path(args.zip_dir))
    scenarios=[]
    for model in ('TOUCH','CLOSE'):
        for reset in (False,True):
            s=simulate_grid(rows,reset,model,DEFAULT_FEE,DEFAULT_SLIP,day_ends,month_starts)
            scenarios.append(s)
            print('SIM',s['strategy'],s['return_pct'],s['max_drawdown_daily_pct'],flush=True)
    scenarios.extend([simulate_hold(rows,.5,DEFAULT_FEE,DEFAULT_SLIP,day_ends),
                      simulate_hold(rows,1.,DEFAULT_FEE,DEFAULT_SLIP,day_ends)])
    for model in ('TOUCH','CLOSE'):
        for reset in (False,True):
            s=simulate_grid(rows,reset,model,2*DEFAULT_FEE,2*DEFAULT_SLIP,day_ends,month_starts)
            s['strategy']=s['strategy'].replace('GRID_','GRID_COSTS_X2_',1)
            scenarios.append(s)
    # Trade simulation comparisons must have precisely one date row per day.
    assert len(scenarios)==10 and all(len(s['daily'])==304 for s in scenarios)
    files=write_report(Path(args.out_dir),verified,scenarios,vol)
    print('ETUDE_CONTINUE_TERMINEE_VALIDEE',*(str(x) for x in files),sep='\n')

if __name__=='__main__':
    try:main()
    except (OSError,ValueError,AssertionError,zipfile.BadZipFile) as e:
        print('CONTROLE_REFUSE :',str(e),file=sys.stderr);sys.exit(2)
