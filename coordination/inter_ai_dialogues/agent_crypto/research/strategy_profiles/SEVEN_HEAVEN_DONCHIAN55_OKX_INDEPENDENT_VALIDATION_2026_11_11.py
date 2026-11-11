#!/usr/bin/env python3
"""Read-only comparison of frozen Donchian 55 on OKX BTC-USDC and Binance BTC-USDT."""
import datetime as dt
import gzip
import hashlib
import importlib.util
import json
from pathlib import Path

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[4]
BASELINE=HERE/"SEVEN_HEAVEN_BTC_SWING_WIN_LOSS_VERIFIED_EVIDENCE_2026_11_10.json"
COLLECTOR=HERE/"SEVEN_HEAVEN_EMA2050_INDEPENDENT_OKX_VALIDATION_2026_11_10.py"
ARCHIVE=ROOT/"public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/bitcoin-Max.json.gz"
NAME="SEVEN_HEAVEN_DONCHIAN55_OKX_INDEPENDENT_VALIDATION_2026_11_11"
SHA="812acb4a087cc43163760a6b397506bb7cb4bbcf8eca692fc686ef9f618b8bfd"
WARM="2025-08-21"
OVERLAP_START="2026-04-01"
OVERLAP_END="2026-09-30"
RECENT_START="2026-10-01"
RECENT_END="2026-11-10"

def load():
    raw=ARCHIVE.read_bytes()
    assert hashlib.sha256(raw).hexdigest()==SHA,"Binance SHA changed"
    obj=json.loads(gzip.decompress(raw))
    assert obj["pair"]=="BTCUSDT" and obj["interval"]=="1d" and len(obj["rows"])==3075
    bn=[]
    for row in obj["rows"]:
        stamp,o,h,l,c,v=row[:6]
        day=dt.datetime.fromtimestamp(stamp/1000,dt.timezone.utc).date().isoformat()
        bn.append(dict(t=stamp,date=day,o=o,h=h,l=l,c=c,v=v))
    assert bn[0]["date"]<"2019-01-01" and bn[-1]["date"]==OVERLAP_END
    assert all(bn[i]["t"]-bn[i-1]["t"]==86400000 for i in range(1,len(bn)))
    spec=importlib.util.spec_from_file_location("seven_okx_reader",str(COLLECTOR))
    mod=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    mod.WARM=WARM
    mod.END=RECENT_END
    okx,meta=mod.okx()
    assert meta["instrument"]=="BTC-USDC" and meta["bar"]=="1Dutc"
    assert okx[0]["date"]==WARM and okx[-1]["date"]==RECENT_END
    assert len(okx)==meta["closed_candles"] and len(okx)>=440
    shared=[b for b in bn if WARM<=b["date"]<=OVERLAP_END]
    assert shared[0]["date"]==WARM and shared[-1]["date"]==OVERLAP_END
    return bn,shared,okx,meta

def signals(bars):
    n=len(bars)
    ranges=[bars[0]["h"]-bars[0]["l"]]
    for i in range(1,n):
        b=bars[i];previous=bars[i-1]["c"]
        ranges.append(max(b["h"]-b["l"],abs(b["h"]-previous),abs(b["l"]-previous)))
    atr=[None]*n
    avg=sum(ranges[:14])/14
    atr[13]=avg
    for i in range(14,n):
        avg=(avg*13+ranges[i])/14
        atr[i]=avg
    upper=[None if i<55 else max(r["h"] for r in bars[i-55:i]) for i in range(n)]
    lower=[None if i<20 else min(r["l"] for r in bars[i-20:i]) for i in range(n)]
    return atr,upper,lower

def simulate(bars,begin,end,weight,fee=.001,slip=.0005):
    indexes={b["date"]:i for i,b in enumerate(bars)}
    assert begin in indexes and end in indexes and begin<end
    start,finish=indexes[begin],indexes[end]
    assert start>=55 and weight in (.25,1.)
    atr,upper,lower=signals(bars)
    cash=1000.;qty=0.;entered=None;stop=None;pending=None
    ledger=[];daily=[];days_exposed=0
    def sell(i,price,reason):
        nonlocal cash,qty,entered,stop
        proceeds=qty*price*(1-slip)*(1-fee)
        ledger.append(dict(entry_utc=bars[entered[0]]["date"],exit_utc=bars[i]["date"],
                           reason=reason,spent=entered[1],received=proceeds,
                           profit=proceeds-entered[1]))
        cash+=proceeds;qty=0.;entered=None;stop=None
    for i in range(start,finish+1):
        b=bars[i]
        if pending=="sell" and qty>0:
            sell(i,b["o"],"close based exit, next open")
        elif pending=="buy" and qty==0:
            spent=cash*weight
            price=b["o"]*(1+slip)
            qty=spent*(1-fee)/price
            cash-=spent
            entered=(i,spent)
            stop=price-3*atr[i-1]
            assert stop>0
        pending=None
        if qty>0:
            if b["o"]<=stop:
                sell(i,b["o"],"gap below stop")
            elif b["l"]<=stop:
                sell(i,stop,"stop touched")
        if qty>0:
            days_exposed+=1
            if b["c"]<lower[i] or i-entered[0]+1>=120:
                pending="sell"
            stop=max(stop,b["c"]-3*atr[i])
        elif i<finish and b["c"]>upper[i]:
            pending="buy"
        daily.append(dict(date=b["date"],equity=round(cash+qty*b["c"]*(1-slip)*(1-fee),8)))
    if qty>0:
        sell(finish,bars[finish]["c"],"end of study only")
        daily[-1]["equity"]=round(cash,8)
    peak=1000.;worst=0.
    years={};previous=1000.
    for j,x in enumerate(daily):
        v=x["equity"]
        peak=max(peak,v);worst=min(worst,100*(v/peak-1))
        if j==len(daily)-1 or daily[j+1]["date"][:4]!=x["date"][:4]:
            years[x["date"][:4]]=round(100*(v/previous-1),3);previous=v
    return dict(start=begin,end=end,days=len(daily),weight_pct=int(100*weight),
                final=round(daily[-1]["equity"],4),net_pct=round(100*(daily[-1]["equity"]/1000-1),3),
                max_dd_pct=round(worst,3),trades=len(ledger),
                wins=sum(t["profit"]>0 for t in ledger),
                losses=sum(t["profit"]<=0 for t in ledger),
                exposure_pct=round(100*days_exposed/len(daily),2),
                years=years,trade_log=ledger,daily_equity=daily)

def passive(bars,start,end,weight):
    d={b["date"]:b for b in bars}
    qty=1000*weight*(1-.001)/(d[start]["o"]*(1+.0005))
    final=1000*(1-weight)+qty*d[end]["c"]*(1-.001)*(1-.0005)
    return round(100*(final/1000-1),3)

def passive_drawdown(bars,start,end,weight,fee=.001,slip=.0005):
    dates={b["date"]:i for i,b in enumerate(bars)}
    a,z=dates[start],dates[end]
    retained=1000*(1-weight)
    btc=1000*weight*(1-fee)/(bars[a]["o"]*(1+slip))
    peak=1000.;worst=0.
    for i in range(a,z+1):
        equity=retained+btc*bars[i]["c"]*(1-fee)*(1-slip)
        peak=max(peak,equity)
        worst=min(worst,100*(equity/peak-1))
    return round(worst,3)

def main():
    all_bn,bn,okx,meta=load()
    original=json.loads(BASELINE.read_text(encoding="utf-8"))
    expected=next(x for x in original["strategies"] if x["key"]=="DON55")
    full=simulate(all_bn,"2019-01-01",OVERLAP_END,1.)
    for a,b in dict(net_pct=expected["net_pct"],max_dd_pct=expected["max_dd_pct"],
                    trades=expected["trades"],wins=expected["wins"],
                    losses=expected["losses"],exposure_pct=expected["exposure_pct"]).items():
        assert full[a]==b,f"Canonical model mismatch: {a} {full[a]} vs {b}"
    assert full["years"]==expected["yearly"] and full["days"]==2830
    quarter=simulate(all_bn,"2019-01-01",OVERLAP_END,.25)
    assert (quarter["net_pct"],quarter["max_dd_pct"],quarter["trades"])==(61.872,-12.018,29)
    windows=[]
    for venue,bars,periods in (
        ("OKX",okx,[(OVERLAP_START,OVERLAP_END,"overlap"),
                   (RECENT_START,RECENT_END,"recent"),
                   (OVERLAP_START,RECENT_END,"combined")]),
        ("BINANCE",bn,[(OVERLAP_START,OVERLAP_END,"overlap")]),
    ):
        for start,end,label in periods:
            windows.append(dict(venue=venue,period=label,
                model25=simulate(bars,start,end,.25),
                model100=simulate(bars,start,end,1.),
                stress25=simulate(bars,start,end,.25,.002,.001),
                passive25_pct=passive(bars,start,end,.25),
                passive25_max_dd_pct=passive_drawdown(bars,start,end,.25)))
    bindex={x["date"]:i for i,x in enumerate(bn)}
    oindex={x["date"]:i for i,x in enumerate(okx)}
    _,bh,_=signals(bn);_,oh,_=signals(okx)
    matched=[x["date"] for x in bn if OVERLAP_START<=x["date"]<=OVERLAP_END]
    mismatch=[d for d in matched if (bn[bindex[d]]["c"]>bh[bindex[d]])!=(okx[oindex[d]]["c"]>oh[oindex[d]])]
    study=dict(schema="seven.crypto.donchian55.okx-binance-independent-validation.v1",
        study_date="2026-11-11",research_only=True,orders_enabled=False,
        no_blind_future_validation=True,
        sources=dict(binance_pair="BTCUSDT",binance_archive_sha256=SHA,binance_rows=len(all_bn),
                     okx_pair="BTC-USDC",okx_meta=meta,quote_currencies_different=True),
        methodology=dict(lookback_entry=55,lookback_exit=20,atr14_stop_multiplier=3,
                         maximum_holding_days=120,fee_per_side=.001,slippage_per_side=.0005,
                         allocated_fraction=.25,capital_start=1000,reference_warmup=WARM),
        verification=dict(canonical_100pct_matches=True,canonical_25pct_matches=True,
                          okx_confirmed_contiguous=True),
        okx_daily_candles=okx,signal_overlap=dict(days=len(matched),mismatch_dates=mismatch),
        windows=windows)
    report=[
        "# Seven Heaven — Donchian 55 : vérification indépendante OKX BTC/USDC",
        "",
        "Étude du 11 novembre 2026. Recherche historique uniquement, aucun ordre réel.",
        "",
        "## Sources et règles inchangées",
        "",
        "- Binance Spot BTC/USDT : 3 075 bougies, archive SHA-256 vérifiée.",
        "- OKX Spot BTC/USDC : bougies 1Dutc confirmées, collecte publique sans API privée, période du "+WARM+" au "+RECENT_END+".",
        "- Les deux devises de cotation sont différentes (USDT et USDC).",
        "- Entrée si clôture au-dessus du plus haut des 55 jours précédents ; sortie si clôture sous le plus bas des 20 jours précédents ; stop suiveur à 3 fois ATR14, durée maximale 120 jours.",
        "- Capital fictif 1 000 unités, 25 % des liquidités engagées à chaque entrée, sans levier.",
        "- Coûts : frais 0,10 % et glissement fictif 0,05 % par côté ; stress à coûts doublés.",
        "- Vérification préalable automatique : les résultats canoniques Binance 2019–septembre 2026 sont reproduits à 100 % et à 25 %, dont les 29 transactions.",
        "",
        "## Résultats comparés",
        "",
        "| Source | Fenêtre | Opérations | Rendement Donchian 25 % | Baisse maximale Donchian | Rendement Buy & Hold 25 % | Baisse maximale Buy & Hold 25 % | Donchian, coûts doublés |",
        "|---|---|---:|---:|---:|---:|---:|---:|",
    ]
    for w in windows:
        r=w["model25"]
        report.append(f"| {w['venue']} | {w['period']} ({r['days']} jours) | {r['trades']} | {r['net_pct']:+.3f} % | {r['max_dd_pct']:.3f} % | {w['passive25_pct']:+.3f} % | {w['passive25_max_dd_pct']:.3f} % | {w['stress25']['net_pct']:+.3f} % |")
    report+=["", "## Concordance des signaux Binance / OKX",
             "",f"- {len(matched)} jours en commun ; {len(mismatch)} divergences de signaux de cassure journalière.",
             "- Dates précises des divergences et données OKX conservées dans le JSON partagé.",
             "", "## Point de méthode : deux expériences distinctes",
             "", "- Le test recent commence le 1er octobre avec le capital entièrement en liquidités. Son résultat de zéro transaction ne signifie pas que la stratégie continue était hors marché.",
             "- Dans la fenêtre combined, la position ouverte le 22 septembre 2026 traverse le 1er octobre et le stop fictif la clôture le 15 octobre 2026.",
             "- Dans la fenêtre overlap, cette position a été liquidée fictivement le 30 septembre uniquement pour arrêter la comparaison avec Binance. Il ne faut donc pas additionner les rendements des différentes fenêtres.",
             "", "## Limites et incertitudes",
             "", "- Ces résultats ne sont pas une validation prospective aveugle.",
             "- Peu de transactions sur une fenêtre courte ne prouvent aucune fiabilité future.",
             "- Les stops simulés sur bougies quotidiennes ne garantissent aucune exécution réelle.",
             "- Un bilan en fin de fenêtre impose une liquidation fictive pour comparer les études, sans recommander une vente réelle.",
             "- Le plan Swing Trading / Buy & Hold personnel reste indépendant de ce laboratoire.",
             "- Aucun changement à Administrator, Trader, Operator, Bridge ou aux actifs du compte.",
             "", "## Fichiers",
             "", "- Programme : "+NAME+".py",
             "- Données et transactions : "+NAME+".json", ""]
    (HERE/(NAME+".json")).write_text(json.dumps(study,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    (HERE/(NAME+".md")).write_text("\n".join(report),encoding="utf-8")
    print("SEVEN_DONCHIAN55_OKX_VALIDATED",meta["retrieved_at_utc"])
    print("SIGNAL_MISMATCHES",len(mismatch),mismatch)
    for w in windows:
        r=w["model25"]
        print("WINDOW",w["venue"],w["period"],"trades",r["trades"],"return_pct",r["net_pct"],"dd_pct",r["max_dd_pct"],"passive",w["passive25_pct"])

if __name__=="__main__":
    main()
