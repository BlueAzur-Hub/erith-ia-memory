#!/usr/bin/env python3
"""Reconstruct native Binance 1m candle sequences and stress a hypothetical Spot Grid.

Four immutable monthly BTCUSDT ZIPs from this repository's GitHub Releases.
Exact SHA-256 checked against the pre-existing annual hourly archive registry.
No real orders, no orderbook, no claim that touched limit prices were filled.
"""
import argparse
import calendar
import csv
import datetime as dt
import gzip
import hashlib
import io
import json
import math
import zipfile
from pathlib import Path

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[4]
SOURCE=ROOT/"public/agent_crypto_erith_ia/data/historical_archive_prototype/calendar_year_hourly_shards"
STEM="SEVEN_HEAVEN_SPOT_GRID_NATIVE_MINUTE_BTC_INVENTORY_REPLAY_2026_11_11"
MONTHS=("2024-01","2025-01","2026-01","2026-10")
FEE=.001
SLIP=.0005
INITIAL=1000.
CENTER=5
INTERVALS=10
WIDTH=.10

def iso(ms):
    return dt.datetime.fromtimestamp(ms/1000,dt.timezone.utc).isoformat()

def date(ms):
    return iso(ms)[:10]

def money(x):
    assert math.isfinite(x)
    return round(x,5)

def input_metadata():
    index=json.loads((SOURCE/"index.json").read_text(encoding="utf-8"))
    assert index["schema"]=="aerith.public.ohlcv.calendar-year-hourly-shard-index.v1"
    assert index["quote"]=="USDT" and index["source"]=="Binance Spot original checked monthly 1m ZIPs"
    btc=next(a for a in index["assets"] if a["id"]=="bitcoin")
    assert btc["pair"]=="BTCUSDT"
    catalog={}
    for shard in btc["shards"]:
        for month in shard["source_months"]:
            if month["month"] in MONTHS:
                assert month["month"] not in catalog
                catalog[month["month"]]=dict(
                    source_sha256=month["source_zip_sha256"],
                    source_minutes=month["native_1m_count"],
                    year=shard["year"],hourly_file=shard["file"],
                    hourly_sha256=shard["sha256"],
                    hourly_bytes=shard["bytes"],
                    github_release=month["release"])
    assert set(catalog)==set(MONTHS)
    return catalog

def minute_rows(zip_path,month,expect):
    raw=zip_path.read_bytes()
    observed=hashlib.sha256(raw).hexdigest()
    assert observed==expect["source_sha256"], "ZIP SHA-256 mismatches Coffre: "+month
    year,mo=map(int,month.split("-"))
    expected=calendar.monthrange(year,mo)[1]*1440
    assert expected==expect["source_minutes"]
    begin=int(dt.datetime(year,mo,1,tzinfo=dt.timezone.utc).timestamp()*1000)
    rows=[];prev_ms=None;normalized_unit=None
    with zipfile.ZipFile(io.BytesIO(raw)) as z:
        expected_name="BTCUSDT-1m-"+month+".csv"
        assert z.namelist()==[expected_name]
        zi=z.getinfo(expected_name)
        assert zi.file_size<20_000_000
        with z.open(zi) as f:
            stream=csv.reader(io.TextIOWrapper(f,encoding="utf-8-sig",newline=""))
            for fields in stream:
                assert len(fields)==12
                t=int(fields[0]);end=int(fields[6])
                unit="us" if t>=10**15 else "ms"
                normalized_unit=normalized_unit or unit
                assert unit==normalized_unit
                ms=t//1000 if unit=="us" else t
                end_ms=end//1000 if unit=="us" else end
                assert ms==begin+len(rows)*60000
                assert end_ms>=ms and end_ms<=ms+60000
                o,h,l,c=map(float,fields[1:5])
                base=float(fields[5]);quote=float(fields[7]);trades=int(fields[8])
                assert 0<l<=min(o,c)<=max(o,c)<=h and base>=0 and quote>=0 and trades>=0
                assert all(math.isfinite(x) for x in (o,h,l,c,base,quote))
                rows.append((ms,o,h,l,c,base,quote,trades))
                assert len(rows)<=expected
    assert len(rows)==expected
    assert rows[-1][0]==begin+(expected-1)*60000
    return rows,dict(zip_sha256=observed,minute_count=expected,
                     timestamp_unit=normalized_unit,
                     first_open_utc=iso(rows[0][0]),last_open_utc=iso(rows[-1][0]),
                     release_tag=expect["github_release"],
                     release_asset=zip_path.name)

def compare_hourly(minute,month,meta):
    path=SOURCE/meta["hourly_file"]
    zipped=path.read_bytes()
    assert len(zipped)==meta["hourly_bytes"] and hashlib.sha256(zipped).hexdigest()==meta["hourly_sha256"]
    stored=json.loads(gzip.decompress(zipped))
    assert stored["asset_id"]=="bitcoin" and stored["quote"]=="USDT" and stored["year"]==meta["year"]
    hours=[row for row in stored["series"] if date(row[0])[:7]==month]
    assert len(hours)==len(minute)//60
    assert all(int(hours[i][0])==int(minute[60*i][0]) for i in range(len(hours)))
    max_price_error=0.;max_volume_error=0.
    for i,hour in enumerate(hours):
        chunk=minute[60*i:60*(i+1)]
        t,o,h,l,c,v,q,n=hour
        values=(int(chunk[0][0]),chunk[0][1],
            max(x[2] for x in chunk),min(x[3] for x in chunk),
            chunk[-1][4],sum(x[5] for x in chunk),
            sum(x[6] for x in chunk),sum(x[7] for x in chunk))
        for k,(actual,target) in enumerate(zip(values,hour)):
            delta=abs(actual-target)
            if k<5:max_price_error=max(max_price_error,delta)
            else:max_volume_error=max(max_volume_error,delta)
            if k==0 or k==7:assert delta==0,"Hourly timestamp/trade count differs"
            else:
                assert delta<=max(1e-6,abs(target)*1e-7), "Minute/hour aggregation mismatch"
    return dict(hour_count=len(hours),hourly_sha256=meta["hourly_sha256"],
                all_hourly_ohlcv_match_native_minute=True,
                max_absolute_price_difference=max_price_error,
                max_absolute_base_or_quote_volume_difference=max_volume_error)

def get_levels(price):
    bottom=price*(1-WIDTH)
    top=price*(1+WIDTH)
    step=(top-bottom)/INTERVALS
    levels=[bottom+k*step for k in range(INTERVALS+1)]
    assert abs(levels[CENTER]-price)/price<1e-12
    return levels,step

def simulate(minute,fill_model):
    """Ten independent grid slots, each starts with 100 USDT of notional.

    Five cash slots wait to buy at lower levels; five BTC slots bought on day
    one wait to sell at upper levels. Each slot alternates buy and sell at
    fixed adjacent levels; never more than one hypothetical fill per minute.
    TOUCH: minute low/high reaches limit (hypothetical fill, not observed).
    CLOSE: minute close passes limit before a fill is assumed.
    Conservative sequencing: any opposite-side touch in the same minute is
    NOT allowed to create a second trade (unknown high/low order).
    """
    assert fill_model in ("TOUCH","CLOSE")
    levels,step=get_levels(minute[0][1])
    slots=[]
    buyfactor=(1-FEE)/(1+SLIP)
    sellfactor=(1-FEE)*(1-SLIP)
    for i in range(INTERVALS):
        if i<CENTER:
            slots.append(dict(index=i,btc=0.,cash=100.,state="cash",buys=0,sells=0,
                              ambiguity=0,lot_start=None,cycles=[],initial_btc=False))
        else:
            btc=100.*buyfactor/minute[0][1]
            slots.append(dict(index=i,btc=btc,cash=0.,state="btc",buys=1,sells=0,
                              ambiguity=0,lot_start=100.,cycles=[],initial_btc=True))
    cost=5*100*(1-buyfactor)
    all_fills=[]
    daily=[]
    peak=INITIAL
    dd=0.
    quote_consumed=0.
    for k,(t,o,h,l,c,base,quote,ntrades) in enumerate(minute):
        touches_for_grid=[ix for ix,p in enumerate(levels) if l<=p<=h]
        # Intraminute ordering becomes ambiguous if multiple levels touched.
        for s in slots:
            j=s["index"]
            b,ss=levels[j],levels[j+1]
            if s["state"]=="cash":
                filled=(l<=b if fill_model=="TOUCH" else c<=b)
                ambiguous=bool(l<=b and h>=ss)
                if filled:
                    stake=s["cash"]
                    s["btc"]=stake*buyfactor/b
                    s["cash"]=0.
                    s["state"]="btc";s["lot_start"]=stake;s["buys"]+=1
                    cost+=stake*(1-buyfactor)
                    if ambiguous:s["ambiguity"]+=1
                    all_fills.append((date(t),"buy",j,round(b,4),round(stake,4)))
            else:
                filled=(h>=ss if fill_model=="TOUCH" else c>=ss)
                ambiguous=bool(l<=b and h>=ss)
                if filled:
                    proceeds=s["btc"]*ss*sellfactor
                    pnl=proceeds-s["lot_start"]
                    s["cycles"].append(round(pnl,6))
                    s["cash"]=proceeds;s["btc"]=0.
                    s["state"]="cash";s["sells"]+=1
                    s["lot_start"]=None
                    cost+=proceeds*(1-sellfactor)
                    if ambiguous:s["ambiguity"]+=1
                    all_fills.append((date(t),"sell",j,round(ss,4),round(proceeds,4)))
        if k%1440==1439:
            btc_total=sum(s["btc"] for s in slots)
            cash_total=sum(s["cash"] for s in slots)
            net=cash_total+btc_total*c*sellfactor
            peak=max(peak,net)
            dd=min(dd,100*(net/peak-1))
            daily.append(dict(date=date(t),value_net_usdt=round(net,6),
                              cash_usdt=round(cash_total,6),
                              btc_quantity=round(btc_total,10)))
    assert len(daily)==len(minute)//1440
    trades=sum(s["buys"]+s["sells"]-(1 if s["initial_btc"] else 0) for s in slots)
    unrealized=sum((s["btc"]*minute[-1][4]*sellfactor-s["lot_start"]) for s in slots if s["state"]=="btc")
    realized=sum(sum(s["cycles"]) for s in slots)
    # initial BTC lots cost 100 USDT each; the total capital already reflects their initial costs.
    net=daily[-1]["value_net_usdt"]
    assert abs((net-INITIAL)-(realized+unrealized))<0.02,"P&L ledger mismatch"
    closed=sum(len(s["cycles"]) for s in slots)
    return dict(fill_assumption=fill_model,capital_initial_usdt=INITIAL,
       final_net_liquidation_usdt=money(net),net_return_pct=round(100*(net/INITIAL-1),3),
       max_daily_drawdown_pct=round(dd,3),
       theoretical_limit_fills_after_initial=trades,
       theoretical_initial_btc_buys=5,
       completed_buy_sell_cycles=closed,
       total_realized_lot_usdt=money(realized),
       total_unrealized_lot_usdt=money(unrealized),
       estimated_fee_slippage_cost_proxy_usdt=money(cost),
       at_final_btc_qty=round(sum(s["btc"] for s in slots),10),
       at_final_cash_usdt=money(sum(s["cash"] for s in slots)),
       slots_left_with_btc=sum(s["state"]=="btc" for s in slots),
       ambiguous_fills_same_minute=sum(s["ambiguity"] for s in slots),
       net_equity_daily=daily,
       fills_are_assumed_not_verified=True)

def hold_baseline(minute,exposure):
    assert exposure in (.5,1.)
    buyfactor=(1-FEE)/(1+SLIP)
    sellfactor=(1-FEE)*(1-SLIP)
    btc=INITIAL*exposure*buyfactor/minute[0][1]
    cash=INITIAL*(1-exposure)
    equity=[]
    peak=INITIAL;dd=0
    for k,r in enumerate(minute):
        if k%1440==1439:
            price=r[4]
            value=cash+btc*price*sellfactor
            peak=max(peak,value)
            dd=min(dd,100*(value/peak-1))
            equity.append(dict(date=date(r[0]),value_net_usdt=round(value,6)))
    return dict(exposure_pct=int(100*exposure),
        final_net_liquidation_usdt=money(equity[-1]["value_net_usdt"]),
        net_return_pct=round(100*(equity[-1]["value_net_usdt"]/INITIAL-1),3),
        max_daily_drawdown_pct=round(dd,3),
        net_equity_daily=equity)

def read_month(minute_dir,month,catalog):
    path=minute_dir/("BTCUSDT-1m-"+month+".zip")
    assert path.is_file(), "Missing verified release ZIP: "+str(path)
    data,zip_info=minute_rows(path,month,catalog[month])
    hour_info=compare_hourly(data,month,catalog[month])
    return data,dict(**zip_info,**hour_info)

def describe(d):
    lines=[
      "# Seven Heaven — Spot Grid sur 4 archives natives BTC/USDT a la minute",
      "",
      "**Date : 11 novembre 2026.** Experience fictive sur bougies historiques 1 minute.",
      "",
      "## Provenance et controles",
      "",
      "- Quatre ZIP originaux de publications GitHub du Coffre, janvier 2024, janvier 2025, janvier 2026, octobre 2026.",
      "- SHA-256 du ZIP verifie contre les empreintes des archives horaires canoniques, soit 44 640 minutes par mois.",
      "- OHLCV, volume de cotation et nombre de transactions agreges heure par heure et compares aux archives horaires deja publiees.",
      "- Timestamps normalises en millisecondes (microsecondes Binance a partir de 2025), aucune bougie synthetique.",
      "",
      "## Hypotheses identiques, declarees avant le test",
      "",
      "- Chaque mois est une experience separee avec capital fictif initial de 1 000 USDT.",
      "- Prix initial de grille : premier open du mois. Bande fixe +/-10 %, dix intervalles arithmetiques (ecart de 2 % du prix initial).",
      "- Cinq lots de 100 USDT de BTC achetes initialement et cinq lots de 100 USDT de liquidites pour niveaux inferieurs.",
      "- Chaque lot alterne entre un achat a son niveau bas et une vente au niveau haut adjacent; les profits et pertes restent dans le lot.",
      "- Cout de chaque achat/vente : frais 0,10 % et glissement 0,05 %; tous les portefeuilles sont valorises en valeur nette liquidable a chaque cloture quotidienne.",
      "- Mode TOUCH : si le high/low minute atteint la limite, remplissage fictif suppose. Ce n'est PAS un remplissage observe.",
      "- Mode CLOSE : remplir fictivement seulement si une cloture minute depasse le niveau; ce n'est PAS une garantie de remplissage.",
      "- Au plus une transaction par lot et par minute : le passage inverse dans la meme minute est interdit car sa chronologie est inconnue.",
      "- Les seuils atteints sont distincts d'ordres et de fills reels; carnet, files d'attente et spread manquent. Aucun mode n'est une borne certaine.",
      "",
      "## Comparaison : valorisation totale (realise + non realise + frais) ",
      "",
      "| Mois | Cloture sous bande (% minutes) | Bougies 1m multi-paliers | 1h multi-paliers | Grille TOUCH | Grille CLOSE | Conserver 50 % BTC | Conserver 100 % BTC |",
      "|---|---:|---:|---:|---:|---:|---:|---:|",
    ]
    for m in d["months"]:
        a=d["periods"][m]
        lines.append("| "+m+" | "+str(a["minute_band_coverage"]["close_below_pct"])+"% | "+
           str(a["multi_level_minutes"])+"/"+str(a["source"]["minute_count"])+" | "+
           str(a["multi_level_hours"])+"/"+str(a["source"]["hour_count"])+" | "+
           f"{a['simulations']['TOUCH']['net_return_pct']:+.2f}% | "+
           f"{a['simulations']['CLOSE']['net_return_pct']:+.2f}% | "+
           f"{a['baselines']['HOLD50']['net_return_pct']:+.2f}% | "+
           f"{a['baselines']['HOLD100']['net_return_pct']:+.2f}% |")
    lines+=["",
      "## Transparence sur les chiffres",
      "",
      "Ce sont deux scenarios de remplissage THEORIQUES. Ni le mode TOUCH ni le mode CLOSE ne certifient un ordre execute par OKX ou Binance.",
      "Il n'est pas legitime d'interpreter la difference entre les deux comme intervalle statistique de profits,",
      "ni comme une borne inferieure/superieure stricte du P&L possible; la queue des ordres et les gaps peuvent changer les signes.",
      "",
      "Le capital initial est repar­ti entre plusieurs lots; les BTC en fin de mois sont comptes au prix de cloture,",
      "apres estimation des couts de liquidation. Les gains clotures sont distingues des positions encore ouvertes.",
      "",
      "## Amelioration par rapport au controle horaire",
      "",
      "La minute reduit les cas ou plusieurs niveaux sont traverses dans une meme bougie, mais n'indique toujours pas",
      "l'ordre exact des hauts et des bas a l'interieur de la minute. Les ordres limites ne sont pas des garanties de fill.",
      "La source publiee est Binance Spot BTC/USDT et non OKX BTC/USDC.",
      "",
      "## Suite technique",
      "",
      "1. Si necessaire, etendre a des mois contigus sans modifier les bornes apres observation (ou dater chaque reset).",
      "2. Verifier un moteur de remplissage pessimiste sur carnets synchronises ou transactions reelles, avec latence et prix limites.",
      "3. Documenter les minima OKX et frais maker/taker avant toute interpretation d'executabilite de ces montants.",
      "",
      "## Reproduction dans le Coffre",
      "",
      "- Code : "+STEM+".py",
      "- Donnees JSON : "+STEM+".json",
      "- Les ZIP restent les sources IMMUTABLES des Releases; ils ne sont pas dupliques en Git.",
      "",
    ]
    return "\n".join(lines)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--zip-dir",required=True)
    args=ap.parse_args()
    folder=Path(args.zip_dir)
    catalog=input_metadata()
    periods={}
    for month in MONTHS:
        rows,source=read_month(folder,month,catalog)
        levels,step=get_levels(rows[0][1])
        multi_minutes=sum(sum(1 for p in levels if r[3]<=p<=r[2])>1 for r in rows)
        multi_hours=sum(sum(1 for p in levels if min(x[3] for x in rows[i:i+60])<=p<=max(x[2] for x in rows[i:i+60]))>1 for i in range(0,len(rows),60))
        below=sum(r[4]<levels[0] for r in rows)
        within=sum(levels[0]<=r[4]<=levels[-1] for r in rows)
        above=len(rows)-below-within
        sim={kind:simulate(rows,kind) for kind in ("TOUCH","CLOSE")}
        hold={"HOLD50":hold_baseline(rows,.5),"HOLD100":hold_baseline(rows,1.)}
        periods[month]=dict(
            source=source,
            grid=dict(start_price=round(rows[0][1],5),lower=round(levels[0],5),
                      upper=round(levels[-1],5),levels=INTERVALS,step_price=round(step,5)),
            minute_band_coverage=dict(close_below_pct=round(100*below/len(rows),3),
                                      close_inside_pct=round(100*within/len(rows),3),
                                      close_above_pct=round(100*above/len(rows),3)),
            multi_level_minutes=multi_minutes,multi_level_hours=multi_hours,
            simulations=sim,baselines=hold)
        print("VERIFIED_MONTH",month,source["zip_sha256"],"1m",source["minute_count"],
              "HOUR_MATCH",source["all_hourly_ohlcv_match_native_minute"],
              "MULTI_LEVEL_1M",multi_minutes,"1H",multi_hours)
        for k,v in sim.items():
            print("PAPER_GRID",month,k,"NET",v["net_return_pct"],"DD",v["max_daily_drawdown_pct"],
                  "FILLS",v["theoretical_limit_fills_after_initial"],
                  "CYCLES",v["completed_buy_sell_cycles"],"UNREALIZED",v["total_unrealized_lot_usdt"])
    output=dict(schema="seven.crypto.native-minute-grid-inventory-replay.v1",
        date="2026-11-11",asset="BTCUSDT Spot Binance",research_only=True,orders_enabled=False,
        true_exchange_order_fills_verified=False,
        minute_ohlcv_and_hourly_reconciliation_verified=True,
        registered_releases={m:catalog[m]["github_release"] for m in MONTHS},
        months=list(MONTHS),capital=INITIAL,grid_bounds_pct=10,grid_levels=10,
        assumptions=dict(fee_side=FEE,slip_side=SLIP,initial_btc_lots=5,initial_cash_lots=5,
                         lot_initial_notional=100,fill_models=["TOUCH","CLOSE"],
                         one_fill_per_slot_per_minute=True,
                         forced_liquidation_of_inventory_at_end_for_comparison=True),
        periods=periods)
    (HERE/(STEM+".json")).write_text(json.dumps(output,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    (HERE/(STEM+".md")).write_text(describe(output),encoding="utf-8")
    print("SEVEN_MINUTE_GRID_SOURCE_AND_INVENTORY_STUDY_PASSED")

if __name__=="__main__":
    main()
