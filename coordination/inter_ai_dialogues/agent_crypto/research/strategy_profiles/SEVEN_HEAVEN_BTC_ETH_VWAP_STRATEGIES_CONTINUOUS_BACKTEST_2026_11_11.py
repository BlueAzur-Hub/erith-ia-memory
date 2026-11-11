#!/usr/bin/env python3
"""VWAP study on six SHA-256 verified hourly BTC/ETH archives.
No exchange accounts or order execution; research only."""
import datetime as dt
import importlib.util
import json
import math
from collections import deque
from pathlib import Path

HERE=Path(__file__).resolve().parent
STEM="SEVEN_HEAVEN_BTC_ETH_VWAP_STRATEGIES_CONTINUOUS_BACKTEST_2026_11_11"
ARCHIVE_READER=HERE/"SEVEN_HEAVEN_BTC_ETH_USDT_REBALANCING_VWAP_SOURCE_AUDIT_2026_11_11.py"
FIRST="2024-02-01"
LAST="2026-10-31"
FEES=.001
SLIP=.0005
CAPITAL=1000.
METHODS={
 "WINDOW300":"HLC3 × volume, VWAP glissant 300 heures",
 "SESSION_UTC":"HLC3 × volume, VWAP séance UTC",
 "QUOTE24":"Volumes base/quote, VWAP glissant 24 heures",
 "FILTER24":"VWAP quote/base 24h + EMA24/72 + écart 0,5 %, deux confirmations",
 "EMA5_13":"Croisement EMA5/13 horaire (témoin)",
 "HOLD":"Buy & Hold (témoin)",
 "CASH":"Liquidités (témoin)"
}
PERIODS=(("continuous",FIRST,LAST),("2024",FIRST,"2024-12-31"),
         ("2025","2025-01-01","2025-12-31"),
         ("2026","2026-01-01",LAST))

def load():
    spec=importlib.util.spec_from_file_location("seven_verified_rebalance_reader",str(ARCHIVE_READER))
    mod=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    candles,lineage,sha=mod.candles()
    assert set(candles)=={"bitcoin","ethereum"}
    assert all(len(x)==24840 for x in candles.values())
    assert [x[0] for x in candles["bitcoin"]]==[x[0] for x in candles["ethereum"]]
    return candles,lineage,sha

def ema(values,n):
    a=2/(n+1);out=[]
    for x in values:out.append(x if not out else a*x+(1-a)*out[-1])
    return out

def indicators(rows):
    n=len(rows)
    closes=[float(r[4]) for r in rows]
    e5,e13,e24,e72=(ema(closes,p) for p in (5,13,24,72))
    window=[None]*n;quote24=[None]*n;session=[None]*n
    ring300=deque();ring24=deque()
    pv300=vol300=volume24=amount24=0.
    current_day=None;session_pv=session_vol=0.
    diffs=[]
    for i,r in enumerate(rows):
        ts,o,h,l,c,volume,quote,trades=r
        assert volume>0 and quote>0 and l*.999<=quote/volume<=h*1.001
        day=int(ts)//86400000
        if day!=current_day:
            current_day=day;session_pv=session_vol=0.
        typical=(h+l+c)/3
        pv=typical*volume
        session_pv+=pv;session_vol+=volume
        session[i]=session_pv/session_vol
        ring300.append((pv,volume));pv300+=pv;vol300+=volume
        if len(ring300)>300:
            a,b=ring300.popleft();pv300-=a;vol300-=b
        if len(ring300)==300:window[i]=pv300/vol300
        ring24.append((quote,volume));amount24+=quote;volume24+=volume
        if len(ring24)>24:
            a,b=ring24.popleft();amount24-=a;volume24-=b
        if len(ring24)==24:quote24[i]=amount24/volume24
        diffs.append(abs(100*(quote/volume/typical-1)))
    for i in (299,300,1000,n-1):
        p=rows[i-299:i+1]
        expected=sum((x[2]+x[3]+x[4])/3*x[5] for x in p)/sum(x[5] for x in p)
        assert abs(window[i]/expected-1)<1e-10
    for i in (0,24,24*365,24*700):
        assert abs(session[i]-(rows[i][2]+rows[i][3]+rows[i][4])/3)<1e-8
    entry={k:[False]*n for k in METHODS}
    exit_={k:[False]*n for k in METHODS}
    def crossing(i,line,up):
        a=line[i-1];b=line[i]
        if a is None or b is None:return False
        if up:return closes[i-1]<=a and closes[i]>b
        return closes[i-1]>=a and closes[i]<b
    for i in range(1,n):
        for k,v in (("WINDOW300",window),("QUOTE24",quote24)):
            entry[k][i]=crossing(i,v,True)
            exit_[k][i]=crossing(i,v,False)
        if rows[i][0]//86400000==rows[i-1][0]//86400000:
            entry["SESSION_UTC"][i]=crossing(i,session,True)
            exit_["SESSION_UTC"][i]=crossing(i,session,False)
        if i>=2 and quote24[i-1] is not None:
            enter=lambda j: closes[j]>quote24[j]*1.005 and e24[j]>e72[j]
            leave=lambda j: closes[j]<quote24[j]*.995 or e24[j]<e72[j]
            entry["FILTER24"][i]=enter(i) and enter(i-1)
            exit_["FILTER24"][i]=leave(i) and leave(i-1)
        entry["EMA5_13"][i]=e5[i-1]<=e13[i-1] and e5[i]>e13[i]
        exit_["EMA5_13"][i]=e5[i-1]>=e13[i-1] and e5[i]<e13[i]
    assert all(not (entry[k][i] and exit_[k][i]) for k in METHODS for i in range(n))
    quality=dict(mean_absolute_quote_vs_hlc3_pct=round(sum(diffs)/n,5),
                 p95_absolute_quote_vs_hlc3_pct=round(sorted(diffs)[int(.95*(n-1))],5),
                 max_absolute_quote_vs_hlc3_pct=round(max(diffs),5))
    return entry,exit_,quality

def run(rows,dates,entry,exit_,key,a_date,z_date,weight,fee,slip,include_equity):
    assert weight in (.25,1.) and key in METHODS
    index={d:i for i,d in enumerate(dates)}
    a=index[a_date]*24;z=index[z_date]*24+23
    assert a>=300 and z>1000 and z<len(rows)
    cash=CAPITAL;qty=0.;spent=0.;entered_at=None;pending=None
    entries=exits=exposed=0;ledger=[];daily=[]
    buy_factor=(1-fee)/(1+slip)
    sell_factor=(1-fee)*(1-slip)
    for i in range(a,z+1):
        r=rows[i];price=float(r[1])
        if key=="HOLD" and i==a:
            allocated=cash*weight
            qty=allocated*buy_factor/price;cash-=allocated
            entered_at=i;spent=allocated;entries+=1
        elif key not in ("HOLD","CASH"):
            if pending=="sell" and qty>0:
                received=qty*price*sell_factor;cash+=received
                ledger.append([dates[entered_at//24],dates[i//24],round(received-spent,6)])
                qty=0.;spent=0.;entered_at=None;exits+=1
            elif pending=="buy" and qty==0:
                allocated=cash*weight
                qty=allocated*buy_factor/price;cash-=allocated
                spent=allocated;entered_at=i;entries+=1
            pending=None
        if qty>0:exposed+=1
        if key not in ("HOLD","CASH") and i<z:
            if qty>0 and exit_[key][i]:pending="sell"
            elif qty==0 and entry[key][i]:pending="buy"
        if i%24==23:
            v=cash+qty*r[4]*sell_factor
            assert v>0 and math.isfinite(v)
            daily.append([dates[i//24],round(v,8)])
    if qty>0:
        received=qty*rows[z][4]*sell_factor;cash+=received
        ledger.append([dates[entered_at//24],dates[z//24],round(received-spent,6)])
        qty=0.;spent=0.;exits+=1
        daily[-1][1]=round(cash,8)
    assert len(daily)==(dt.date.fromisoformat(z_date)-dt.date.fromisoformat(a_date)).days+1
    assert entries==exits==len(ledger)
    peak=CAPITAL;worst=0.;underwater=longest=streak=0
    years={};prior=CAPITAL
    for i,(date,v) in enumerate(daily):
        peak=max(peak,v);worst=min(worst,100*(v/peak-1))
        if v<peak-1e-7:underwater+=1;streak+=1;longest=max(longest,streak)
        else:streak=0
        if i==len(daily)-1 or daily[i+1][0][:4]!=date[:4]:
            years[date[:4]]=round(100*(v/prior-1),4);prior=v
    out=dict(method=key,from_utc=a_date,to_utc=z_date,days=len(daily),allocation_pct=int(weight*100),
             final_usdt=round(daily[-1][1],4),net_pct=round(100*(daily[-1][1]/CAPITAL-1),4),
             max_daily_dd_pct=round(worst,4),longest_underwater_days=longest,
             time_exposed_pct=round(100*exposed/(z-a+1),2),
             buys=entries,sells=exits,wins=sum(t[2]>0 for t in ledger),
             losses=sum(t[2]<=0 for t in ledger),
             annual_net_pct=years,trade_log=ledger)
    if include_equity:out["daily_equity"]=daily
    if key=="CASH":assert out["net_pct"]==0 and entries==0
    if key=="HOLD":assert entries==exits==1
    return out

def report(e):
    main={w["asset"]:w for w in e["windows"] if w["period"]=="continuous"}
    lines=[
        "# Seven Heaven — VWAP : étude réelle des signaux sur BTC et ETH",
        "",
        "**11 novembre 2026.** Etude rétrospective ; prix et volume issus des archives du Coffre.",
        "",
        "## Ce que fait réellement le graphique Bougies",
        "",
        "La fonction vwap(rows) de market-microscope-candles.js calcule un cumul du prix typique (haut+bas+clôture)/3 multiplié par le volume des bougies CHARGÉES. Elle ne se réinitialise pas chaque jour.",
        "Le profil Niveaux inclut déjà VWAP. Aucun nouveau profil ou changement de l'interface n'est nécessaire.",
        "La capture montre du BTC/USDC OKX en 15 minutes : nos expériences portent sur BTC/USDT et ETH/USDT Binance en 1 heure. Le VWAP 300 heures glissant n'est donc PAS identique au VWAP calculé sur les ~300 bougies de 15 minutes du graphique.",
        "",
        "## Paramètres déclarés avant les résultats",
        "",
        "- WINDOW300 : prix traversant le VWAP HLC3 pondéré sur les 300 heures écoulées, fenêtre glissante. Proxy pédagogique du VWAP fenêtre, pas son implémentation exacte en continu.",
        "- SESSION_UTC : VWAP HLC3 pondéré depuis le début de la journée UTC. Les inversions au passage de minuit sont ignorées pour éviter de faux signaux ; une position peut rester ouverte plusieurs jours.",
        "- QUOTE24 : ratio cumulé volume de cotation / volume de base sur 24 heures, franchissement par le cours.",
        "- FILTER24 : au moins deux clôtures au-dessus de QUOTE24 de 0,5 % et EMA24 supérieure à EMA72 pour entrer ; au moins deux clôtures sous QUOTE24 de 0,5 % OU EMA24 sous EMA72 pour sortir.",
        "- Témoins : EMA5/13 horaire, Buy & Hold, liquidités.",
        "- Aucun short, aucune optimisation à partir des résultats, aucun horizon futur connu des règles de décision.",
        "",
        "## Données et protocole",
        "",
        "- Six fichiers historiques horaires BTC/USDT et ETH/USDT, années 2024, 2025 et janvier–octobre 2026, SHA-256 et continuité vérifiés avant calcul.",
        "- 24 840 heures par actif ; du 1er janvier 2024 au 31 octobre 2026. Test continu du 1er février 2024 au 31 octobre 2026, préchauffage de plus de 300 heures.",
        "- Capital initial 1 000 USDT ; exposition fictive 100 % ou 25 % des liquidités à chaque entrée ; frais 0,1 % / côté et glissement supposé 0,05 % / côté ; test à coûts doublés.",
        "- Signal uniquement sur bougie horaire clôturée ; achat ou vente fictif à l'ouverture de l'heure suivante ; liquidations de fin d'étude pour valoriser le capital.",
        "- Drawdown calculé sur valeur liquidable aux clôtures journalières, non sur les pires mouvements intrajournaliers.",
        "- Résultats annuels séparés : le capital repart à 1 000 USDT en 2024, 2025 et 2026 ; ne pas additionner ces trois expériences au résultat continu.",
        "- La comparaison ETH teste un deuxième actif, pas une deuxième plateforme ; l'étude n'est ni prospective ni une évaluation de carnets d'ordres.",
        "",
        "## BTC/USDT — historique continu (allocation 25 %)",
        "",
        "| Méthode | Rendement | Pire drawdown | Achats | Gains/pertes des transactions | Coûts doublés |",
        "|---|---:|---:|---:|---:|---:|",
    ]
    for key,label in e["methods"].items():
        x=main["bitcoin"]["methods"][key];r=x["quarter25"]
        lines.append(f"| {label} | {r['net_pct']:+.2f}% | {r['max_daily_dd_pct']:.2f}% | {r['buys']} | {r['wins']}/{r['losses']} | {x['double_cost_return25_pct']:+.2f}% |")
    lines+=["","## ETH/USDT — contrôle sur un autre actif (allocation 25 %)","",
            "| Méthode | Rendement | Drawdown | Achats |","|---|---:|---:|---:|"]
    for key,label in e["methods"].items():
        r=main["ethereum"]["methods"][key]["quarter25"]
        lines.append(f"| {label} | {r['net_pct']:+.2f}% | {r['max_daily_dd_pct']:.2f}% | {r['buys']} |")
    lines+=["","## Fenêtres annuelles indépendantes (allocation 25 %)","",
            "| Stratégie | BTC 2024 | BTC 2025 | BTC 2026 | ETH 2025 |",
            "|---|---:|---:|---:|---:|"]
    def annual(asset,period,key):
        w=next(x for x in e["windows"] if x["asset"]==asset and x["period"]==period)
        return w["methods"][key]["quarter25"]["net_pct"]
    for key,label in e["methods"].items():
        lines.append(f"| {label} | {annual('bitcoin','2024',key):+.2f}% | {annual('bitcoin','2025',key):+.2f}% | {annual('bitcoin','2026',key):+.2f}% | {annual('ethereum','2025',key):+.2f}% |")
    lines+=["","## Principales limites","",
        "- Le volume-quote / volume-base reflète le prix moyen pondéré dans les agrégats Binance, alors que l'indicateur Administrator calcule HLC3 pondéré ; ces deux mesures diffèrent.",
        "- Les croisements fréquents peuvent engendrer de nombreux frais ; une stratégie qui évite les pertes dans un test peut rater les hausses dans un autre.",
        "- Aucun prix VWAP ni signal de ce rapport ne doit être pris comme la valeur instantanée du graphique OKX en 15 min.",
        "- Données historiques déjà connues ; aucun test hors-échantillon prospectif ni preuve que ces paramètres soient optimaux.",
        "- Les actifs BTC personnels conservés en Swing / Buy & Hold ne sont pas modélisés dans ces portefeuilles fictifs.",
        "",
        "## Reproduction et sources","",
        "- Script : "+STEM+".py",
        "- JSON : "+STEM+".json",
        "- Archives : public/agent_crypto_erith_ia/data/historical_archive_prototype/calendar_year_hourly_shards/",
        "- Graphique Administrator : public/agent_crypto_erith_ia/administrator/js/market-microscope-candles.js",
        "- Référence pédagogique : https://fr.tradingview.com/support/solutions/43000502018/",
        ""]
    return "\n".join(lines)

def main():
    raw,lineage,sha=load()
    windows=[];quality={}
    for asset in ("bitcoin","ethereum"):
        rows=raw[asset]
        date_list=[dt.datetime.fromtimestamp(rows[i][0]/1000,dt.timezone.utc).date().isoformat()
                    for i in range(0,len(rows),24)]
        assert len(date_list)==1035 and len(set(date_list))==1035
        entry,exits,qual=indicators(rows);quality[asset]=qual
        for period,start,end in PERIODS:
            tests={}
            for key in METHODS:
                full=run(rows,date_list,entry,exits,key,start,end,1.,FEES,SLIP,False)
                quarter=run(rows,date_list,entry,exits,key,start,end,.25,FEES,SLIP,period=="continuous")
                stress=run(rows,date_list,entry,exits,key,start,end,.25,.002,.001,False)
                assert full["buys"]==quarter["buys"]==stress["buys"]
                assert full["sells"]==quarter["sells"]==stress["sells"]
                tests[key]=dict(full100=full,quarter25=quarter,double_cost_return25_pct=stress["net_pct"])
            windows.append(dict(asset=asset,period=period,from_utc=start,to_utc=end,methods=tests))
    assert len(windows)==8
    assert all(len(w["methods"])==len(METHODS) for w in windows)
    result=dict(schema="seven.crypto.vwap.hourly.btc-eth.v1",
        study_date="2026-11-11",research_only=True,orders_enabled=False,
        quote="USDT",source_index_sha256=sha,asset_source_shards=lineage,
        hourly_bars_per_asset=24840,parameters_declared_before_test=True,
        starting_capital=CAPITAL,fee_per_side=FEES,slippage_per_side=SLIP,
        chart_cumulative_loaded_history_not_daily_reset=True,
        research_rolling300_is_not_exact_runtime_indicator=True,
        methods=METHODS,quote_vs_hlc3=quality,windows=windows)
    (HERE/(STEM+".json")).write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    (HERE/(STEM+".md")).write_text(report(result),encoding="utf-8")
    print("SEVEN_VWAP_BTC_ETH_RESEARCH_VERIFIED")
    for w in windows:
        if w["period"]=="continuous":
            for key,x in w["methods"].items():
                r=x["quarter25"]
                print("RESULT",w["asset"],key,"NET",r["net_pct"],"DD",r["max_daily_dd_pct"],
                    "BUYS",r["buys"],"WIN",r["wins"],"LOSS",r["losses"],
                    "STRESS",x["double_cost_return25_pct"])
    print("SOURCE_QUALITY",quality)

if __name__=="__main__":
    main()
