#!/usr/bin/env python3
"""Seven Heaven: ten pedagogical BTC methods, continuous historical portfolios.
Independent, explicit research implementations of guide P01-P10 (2026-11-07).
Binance BTC/USDT 2019-2026; matched Binance vs OKX BTC/USDC during 2026.
Read-only; never access exchange accounts or order endpoints.
"""
import csv
import datetime as dt
import gzip
import hashlib
import json
import math
from pathlib import Path

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[4]
NAME="SEVEN_HEAVEN_TEN_STRATEGIES_CONTINUOUS_BTC_BINANCE_OKX_BACKTEST_2026_11_11"
BIN_ARCHIVE=ROOT/"public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/bitcoin-Max.json.gz"
BIN_SHA="812acb4a087cc43163760a6b397506bb7cb4bbcf8eca692fc686ef9f618b8bfd"
OKX_EVIDENCE=HERE/"SEVEN_HEAVEN_DONCHIAN55_OKX_INDEPENDENT_VALIDATION_2026_11_11.json"
GUIDE=HERE/"SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_FIELD_GUIDE_COFFRE_SIMULATIONS_AND_PAPER_PROFILES_2026_11_07.md"
CONT_START="2019-01-01"
CONT_END="2026-09-30"
WARM="2025-08-21"
MATCH_START="2026-04-01"
MATCH_END="2026-09-30"
OKX_END="2026-11-10"
START_USD=1000.
METHODS={
    "BUY_HOLD":"Buy & Hold",
    "DCA12":"DCA: 12 mensualités, budget initial fixe",
    "EMA5_13":"EMA 5/13",
    "EMA10_20":"EMA 10/20",
    "SMA50_200":"SMA 50/200",
    "MACD12_26_9":"MACD 12/26/9",
    "RSI14_30_55":"RSI14 achat sous 30, sortie au-dessus 55",
    "BOLL20_2":"Bollinger 20/2",
    "BREAKOUT20_10":"Cassure haut 20j / sortie bas 10j",
    "SUPERTREND10_3":"SuperTrend 10×3 (convention explicitée)",
    "CASH":"Liquidités fictives — témoin"
}
REAL_METHODS=[k for k in METHODS if k!="CASH"]

def date_of(ts):
    return dt.datetime.fromtimestamp(int(ts)/1000,dt.timezone.utc).date().isoformat()

def load():
    assert "P03 — EMA 5/13" in GUIDE.read_text(encoding="utf-8")
    data=BIN_ARCHIVE.read_bytes()
    assert hashlib.sha256(data).hexdigest()==BIN_SHA, "Frozen Binance source digest changed"
    archive=json.loads(gzip.decompress(data))
    assert archive["pair"]=="BTCUSDT" and archive["interval"]=="1d"
    assert len(archive["rows"])==3075
    bn=[]
    for row in archive["rows"]:
        ts,o,h,l,c,v=row[:6]
        item=dict(date=date_of(ts),t=int(ts),o=float(o),h=float(h),l=float(l),c=float(c),v=float(v))
        assert 0<item["l"]<=min(item["o"],item["c"])<=max(item["o"],item["c"])<=item["h"]
        bn.append(item)
    assert bn[0]["date"]=="2018-05-01" and bn[-1]["date"]==CONT_END
    assert all(bn[i]["t"]-bn[i-1]["t"]==86400000 for i in range(1,len(bn)))
    prior=json.loads(OKX_EVIDENCE.read_text(encoding="utf-8"))
    assert prior["verification"]["okx_confirmed_contiguous"] is True
    assert prior["sources"]["okx_meta"]["instrument"]=="BTC-USDC"
    assert prior["sources"]["okx_meta"]["bar"]=="1Dutc"
    okx=prior["okx_daily_candles"]
    assert len(okx)==447 and okx[0]["date"]==WARM and okx[-1]["date"]==OKX_END
    assert all(int(okx[i]["t"])-int(okx[i-1]["t"])==86400000 for i in range(1,len(okx)))
    matched_bn=[b for b in bn if WARM<=b["date"]<=MATCH_END]
    assert len(matched_bn)==406
    assert [b["date"] for b in matched_bn]==[b["date"] for b in okx if b["date"]<=MATCH_END]
    return bn,matched_bn,okx

def ema(values,n):
    out=[]
    a=2/(n+1)
    for i,v in enumerate(values):
        out.append(v if i==0 else a*v+(1-a)*out[-1])
    return out

def sma(values,n):
    out=[None]*len(values)
    running=0.
    for i,v in enumerate(values):
        running+=v
        if i>=n:running-=values[i-n]
        if i>=n-1:out[i]=running/n
    return out

def rsi_wilder14(closes):
    out=[None]*len(closes)
    gains=[max(closes[i]-closes[i-1],0) for i in range(1,len(closes))]
    losses=[max(closes[i-1]-closes[i],0) for i in range(1,len(closes))]
    n=14
    if len(closes)<=n:return out
    g=sum(gains[:n])/n
    l=sum(losses[:n])/n
    def index(g,l):
        if l==0:return 100. if g>0 else 50.
        return 100.-100./(1+g/l)
    out[n]=index(g,l)
    for i in range(n+1,len(closes)):
        g=(g*(n-1)+gains[i-1])/n
        l=(l*(n-1)+losses[i-1])/n
        out[i]=index(g,l)
    return out

def atr_wilder(bars,n):
    tr=[]
    for i,b in enumerate(bars):
        prev=bars[i-1]["c"] if i else b["c"]
        tr.append(max(b["h"]-b["l"],abs(b["h"]-prev),abs(b["l"]-prev)))
    out=[None]*len(bars)
    if len(bars)<n:return out
    running=sum(tr[:n])/n
    out[n-1]=running
    for i in range(n,len(bars)):
        running=(running*(n-1)+tr[i])/n
        out[i]=running
    return out

def supertrend_direction(bars,atr,multiple=3):
    """Documented illustrative final-band convention.
    Initialize as bearish on first ATR-valid candle; change direction only
    after a close crossing the PRIOR final upper/lower band.
    """
    bullish=[False]*len(bars)
    upper=lower=None
    for i,b in enumerate(bars):
        if atr[i] is None:continue
        mid=(b["h"]+b["l"])/2
        bu=mid+multiple*atr[i]
        bl=mid-multiple*atr[i]
        if upper is None:
            upper,lower=bu,bl
            continue
        was_up=bullish[i-1]
        if b["c"]>upper:
            bullish[i]=True
        elif b["c"]<lower:
            bullish[i]=False
        else:
            bullish[i]=was_up
        next_upper=bu if bu<upper or bars[i-1]["c"]>upper else upper
        next_lower=bl if bl>lower or bars[i-1]["c"]<lower else lower
        upper,lower=next_upper,next_lower
    return bullish

def indicators(bars):
    closes=[x["c"] for x in bars]
    n=len(bars)
    i5=ema(closes,5);i13=ema(closes,13)
    i10=ema(closes,10);i20=ema(closes,20)
    s50=sma(closes,50);s200=sma(closes,200)
    macd=[a-b for a,b in zip(ema(closes,12),ema(closes,26))]
    macd_sig=ema(macd,9)
    rsi=rsi_wilder14(closes)
    bolmid=sma(closes,20)
    bollower=[None]*n
    for i in range(19,n):
        sample=closes[i-19:i+1]
        mu=bolmid[i]
        sd=math.sqrt(sum((p-mu)**2 for p in sample)/20)
        bollower[i]=mu-2*sd
    hi20=[None if i<20 else max(b["h"] for b in bars[i-20:i]) for i in range(n)]
    lo10=[None if i<10 else min(b["l"] for b in bars[i-10:i]) for i in range(n)]
    st=supertrend_direction(bars,atr_wilder(bars,10),3)
    def crossing_above(a,b,i):
        return i>=1 and all(x is not None for x in (a[i-1],b[i-1],a[i],b[i])) and a[i-1]<=b[i-1] and a[i]>b[i]
    def crossing_below(a,b,i):
        return i>=1 and all(x is not None for x in (a[i-1],b[i-1],a[i],b[i])) and a[i-1]>=b[i-1] and a[i]<b[i]
    entry={k:[False]*n for k in METHODS}
    exit_={k:[False]*n for k in METHODS}
    for i in range(1,n):
        entry["EMA5_13"][i]=crossing_above(i5,i13,i)
        exit_["EMA5_13"][i]=crossing_below(i5,i13,i)
        entry["EMA10_20"][i]=crossing_above(i10,i20,i)
        exit_["EMA10_20"][i]=crossing_below(i10,i20,i)
        entry["SMA50_200"][i]=crossing_above(s50,s200,i)
        exit_["SMA50_200"][i]=crossing_below(s50,s200,i)
        entry["MACD12_26_9"][i]=crossing_above(macd,macd_sig,i)
        exit_["MACD12_26_9"][i]=crossing_below(macd,macd_sig,i)
        entry["RSI14_30_55"][i]=rsi[i] is not None and rsi[i]<30
        exit_["RSI14_30_55"][i]=rsi[i] is not None and rsi[i]>55
        entry["BOLL20_2"][i]=bollower[i] is not None and closes[i]<bollower[i]
        exit_["BOLL20_2"][i]=bolmid[i] is not None and closes[i]>bolmid[i]
        entry["BREAKOUT20_10"][i]=hi20[i] is not None and closes[i]>hi20[i]
        exit_["BREAKOUT20_10"][i]=lo10[i] is not None and closes[i]<lo10[i]
        entry["SUPERTREND10_3"][i]=st[i] and not st[i-1]
        exit_["SUPERTREND10_3"][i]=not st[i] and st[i-1]
    return entry,exit_

def simulate(bars,entry_signals,exit_signals,method,start,end,weight=1.,fee=.001,slip=.0005):
    assert method in METHODS and weight in (1.,.25) and fee>=0 and slip>=0
    lookup={b["date"]:i for i,b in enumerate(bars)}
    assert start in lookup and end in lookup and start<end
    a,z=lookup[start],lookup[end]
    assert a>=200,"Insufficient prewarming before the start date"
    cash=START_USD
    qty=0.
    position_cost=0.
    first_entry=None
    buy_count=0;sell_count=0
    current_month=dt.date.fromisoformat(start).replace(day=1)
    monthly_paid=0
    pending=None
    completed=[]
    portfolio=[]
    exposure=0
    def buy(date,price,stake):
        nonlocal cash,qty,position_cost,first_entry,buy_count
        stake=min(stake,cash)
        if stake<=1e-7:return
        received=stake*(1-fee)/(price*(1+slip))
        assert received>0
        qty+=received
        cash-=stake
        position_cost+=stake
        if first_entry is None:first_entry=date
        buy_count+=1
    def sell(date,price,reason):
        nonlocal cash,qty,position_cost,first_entry,sell_count
        if qty<=0:return
        proceeds=qty*price*(1-slip)*(1-fee)
        completed.append(dict(entry=first_entry,exit=date,reason=reason,
                invested=round(position_cost,6),proceeds=round(proceeds,6),
                profit_usdt=round(proceeds-position_cost,6),
                profit_pct=round(100*(proceeds/position_cost-1),4)))
        cash+=proceeds
        qty=0.;position_cost=0.;first_entry=None;sell_count+=1
    for i in range(a,z+1):
        bar=bars[i]
        date=bar["date"]
        if method=="BUY_HOLD" and i==a:
            buy(date,bar["o"],START_USD*weight)
        elif method=="DCA12":
            day=dt.date.fromisoformat(date)
            month_index=(day.year-current_month.year)*12+day.month-current_month.month
            if day.day==22 and 0<=month_index<12:
                buy(date,bar["o"],START_USD*weight/12)
                monthly_paid+=1
        elif method!="CASH":
            if pending=="sell" and qty>0:
                sell(date,bar["o"],"prior closing exit signal")
            elif pending=="buy" and qty<=0:
                buy(date,bar["o"],cash*weight)
            pending=None
        if qty>0:
            exposure+=1
        # All decisions for signal methods rely solely on this completed candle.
        if method not in ("BUY_HOLD","DCA12","CASH") and i<z:
            if qty>0 and exit_signals[method][i]:
                pending="sell"
            elif qty==0 and entry_signals[method][i]:
                pending="buy"
        estimated=cash+qty*bar["c"]*(1-slip)*(1-fee)
        assert estimated>=0 and math.isfinite(estimated)
        portfolio.append(dict(date=date,equity=round(estimated,8)))
    if qty>0:
        sell(end,bars[z]["c"],"end-of-study hypothetical liquidation")
        portfolio[-1]["equity"]=round(cash,8)
    assert all(p["equity"]>0 for p in portfolio)
    peak=START_USD;dd=0.
    underwater_days=0;run=longest=0
    annual={};last_boundary=START_USD
    for i,p in enumerate(portfolio):
        equity=p["equity"]
        peak=max(peak,equity)
        delta=100*(equity/peak-1)
        dd=min(dd,delta)
        if equity<peak-1e-7:
            run+=1;underwater_days+=1;longest=max(longest,run)
        else:run=0
        if i==len(portfolio)-1 or portfolio[i+1]["date"][:4]!=p["date"][:4]:
            annual[p["date"][:4]]=round(100*(equity/last_boundary-1),3)
            last_boundary=equity
    losses=0;worst_streak=0
    for trade in completed:
        if trade["profit_usdt"]<0:
            losses+=1;worst_streak=max(worst_streak,losses)
        else:losses=0
    result=dict(method=method,allocation_pct=int(weight*100),start_utc=start,end_utc=end,
        days=len(portfolio),initial=START_USD,final=round(portfolio[-1]["equity"],4),
        return_pct=round(100*(portfolio[-1]["equity"]/START_USD-1),3),
        max_daily_drawdown_pct=round(dd,3),underwater_days=underwater_days,
        longest_underwater_days=longest,exposure_days=exposure,
        exposed_days_pct=round(100*exposure/len(portfolio),2),
        buys=buy_count,sells=sell_count,completed_positions=len(completed),
        losing_positions=sum(t["profit_usdt"]<0 for t in completed),
        longest_losing_streak=worst_streak,
        annual_returns_pct=annual,dca_months_bought=monthly_paid,
        trades=completed)
    if method=="CASH":
        assert result["return_pct"]==result["max_daily_drawdown_pct"]==0
        assert buy_count==0 and sell_count==0
    if method=="DCA12":
        expected=min(12,len([day for day in (dt.date.fromisoformat(start)+dt.timedelta(days=k) for k in range(len(portfolio))) if day.day==22]))
        assert monthly_paid==expected
        assert result["buys"]==expected and result["sells"]==1
    if method=="BUY_HOLD":
        assert buy_count==1 and sell_count==1
    return result,portfolio

def bundle(bars,start,end,venue,window):
    ent,ex=indicators(bars)
    tests=[]
    daily={}
    for method in METHODS:
        s100,_=simulate(bars,ent,ex,method,start,end,1.,.001,.0005)
        s25,curve=simulate(bars,ent,ex,method,start,end,.25,.001,.0005)
        expensive,_=simulate(bars,ent,ex,method,start,end,.25,.002,.001)
        assert s100["buys"]==s25["buys"],"Sizing changed number of entry signals: "+method
        assert s100["sells"]==s25["sells"],"Sizing changed exits: "+method
        assert expensive["buys"]==s25["buys"],"Cost stress changed signals: "+method
        tests.append(dict(key=method,label=METHODS[method],
             full100=s100,quarter25=s25,double_cost25_return_pct=expensive["return_pct"]))
        daily[method]=curve
    assert len({x["key"] for x in tests})==11 and len(daily)==11
    return dict(venue=venue,window=window,from_utc=start,to_utc=end,days=tests[0]["full100"]["days"],
                methods=tests),daily

def make_report(data):
    common={x["window"]+x["venue"]:x for x in data["windows"]}
    long=next(w for w in data["windows"] if w["window"]=="long")
    okx=next(w for w in data["windows"] if w["window"]=="matched" and w["venue"]=="OKX BTC/USDC")
    bn=next(w for w in data["windows"] if w["window"]=="matched" and w["venue"]=="Binance BTC/USDT")
    merged=next(w for w in data["windows"] if w["window"]=="recent_continuous")
    lines=[
        "# Seven Heaven — Backtest CONTINU : dix méthodes Bitcoin, puis contrôle OKX",
        "",
        "**Datation : 11 novembre 2026.** Statut : backtest pédagogique indépendant, recherche rétrospective, jamais une preuve de performance future.",
        "",
        "## Corpus et protocole",
        "",
        "- **Archive canonique Binance Spot BTC/USDT** : 3 075 bougies 1 jour, du 1er mai 2018 au 30 septembre 2026, SHA-256 contrôlé.",
        "- **Période continue principale** : 1er janvier 2019 – 30 septembre 2026, **2 830 journées**, portefeuille fictif de 1 000 USDT **jamais réinitialisé** chaque année.",
        "- **OKX BTC/USDC** : 447 bougies 1Dutc déjà qualifiées et enregistrées ; mêmes dates de préchauffage (21 août 2025), comparaison Binance–OKX **1er avril – 30 septembre 2026 (183 jours)**.",
        "- Le test continu OKX couvre aussi avril – 10 novembre 2026 (224 jours) sans réinitialisation le 1er octobre.",
        "- Signaux exclusivement sur **clôtures déjà connues** ; ventes/achats simulés à **l'ouverture du jour suivant**. Les achats calendrier Buy & Hold et DCA sont planifiés à l'avance et exécutés à l'ouverture du jour connu.",
        "- Capital fictif de départ 1 000 unités de cotation ; profils **100 % et 25 % d'allocation** (pour les signaux : fraction des liquidités au moment de chaque entrée). Frais **0,10 % / côté**, glissement supposé **0,05 % / côté**, coûts doublés comme stress. Liquidités non investies sans rendement ni risque d'émetteur.",
        "- DCA12 : **une fois**, douze mensualités de 1/12 du budget initial, chaque 22 du mois ; **aucun versement externe**. Sur 224 jours la fenêtre n'en contient que 7 ou 8 : le DCA reste partiellement déployé ; ne pas le comparer comme un DCA perpétuel.",
        "- Toutes les positions restantes sont clôturées **fictivement** en fin de fenêtre pour comparer le capital net, sans implication de vente réelle.",
        "- Nous conservons **les dix méthodes P01–P10** et un témoin liquidités. Ce nouveau moteur réimplémente explicitement leurs règles pédagogiques, **mais ne revendique PAS une reproduction bit-à-bit du moteur original de novembre 7**, qui n'a pas été retrouvé sous forme exécutable. Résultats anciens annuels et nouveaux résultats continus doivent rester séparés.",
        "",
        "## Paramètres précis à connaître",
        "",
        "- EMA 5/13 et EMA 10/20 : croisement haussier des deux EMA pour entrer, croisement baissier pour sortir.",
        "- SMA 50/200 : croisements de deux moyennes simples.",
        "- MACD 12/26/9 : croisement de la ligne MACD et de la ligne signal EMA9.",
        "- RSI14 Wilder : achat si RSI < 30 et sortie si RSI > 55 (signal à la clôture).",
        "- Bollinger 20/2 : achat si clôture sous moyenne - 2 écarts types population ; vente après clôture au-dessus de SMA20.",
        "- Breakout 20/10 : achat si clôture dépasse le plus haut des **20 bougies précédentes**, sortie sous plus bas des **10 bougies précédentes** ; sans anticipation.",
        "- SuperTrend 10×3 : ATR Wilder 10 jours et bandes médianes ×3 ; transition bearish→bullish uniquement sur franchissement à la clôture de la bande finale **précédente**, et vice versa. Initialisation bearish, implémentation illustrative. Une autre convention SuperTrend peut donner des résultats différents.",
        "- Aucun arrêt-loss supplémentaire n'a été inventé pour les règles qui n'en avaient pas.",
        "",
        "## Résultats de la période Binance continue (2019 à septembre 2026)",
        "",
        "| Méthode | Rendement 100 % | Drawdown max. 100 % | Rendement 25 % | Drawdown max. 25 % | Entrées à 100 % | Plus longue période sous sommet à 25 % |",
        "|---|---:|---:|---:|---:|---:|---:|",
    ]
    for a in long["methods"]:
        b=a["full100"];q=a["quarter25"]
        lines.append(f"| {a['label']} | {b['return_pct']:+.3f}% | {b['max_daily_drawdown_pct']:.3f}% | {q['return_pct']:+.3f}% | {q['max_daily_drawdown_pct']:.3f}% | {b['buys']} | {q['longest_underwater_days']} j |")
    lines += [
        "",
        "**Attention :** un modèle investi 25 % des liquidités à chaque signal n'a pas la même exposition qu'un portefeuille alloué une seule fois à 25 %, ni qu'un DCA financé chaque mois par de nouveaux versements.",
        "",
        "## Contrôle indépendant : mêmes 183 jours Binance / OKX",
        "",
        "| Méthode | Binance 25 % | OKX 25 % | DD OKX à 25 % | Nombre d'achats OKX |",
        "|---|---:|---:|---:|---:|",
    ]
    bb={x["key"]:x for x in bn["methods"]}
    for a in okx["methods"]:
        q=a["quarter25"]
        lines.append(f"| {a['label']} | {bb[a['key']]['quarter25']['return_pct']:+.3f}% | {q['return_pct']:+.3f}% | {q['max_daily_drawdown_pct']:.3f}% | {q['buys']} |")
    lines += [
        "",
        "## Contrôle OKX continu : 1er avril – 10 novembre 2026",
        "",
        "| Méthode | Rendement 25 % | DD max. 25 % | Achats | Années touchées |",
        "|---|---:|---:|---:|---|",
    ]
    for a in merged["methods"]:
        q=a["quarter25"]
        lines.append(f"| {a['label']} | {q['return_pct']:+.3f}% | {q['max_daily_drawdown_pct']:.3f}% | {q['buys']} | {', '.join(q['annual_returns_pct'])} |")
    lines += [
        "",
        "## Réserves / ce qui reste à vérifier",
        "",
        "- Toutes les données historiques ont déjà été vues par les chercheurs. Ce test est **rétrospectif et in-sample sur les hypothèses générales**, pas une validation prospective.",
        "- La courte fenêtre commune n'offre pas assez d'opérations pour juger statistiquement les méthodes peu actives ; un zéro opération n'est pas une stratégie « sans risque ».",
        "- Aucun test d'exécution réelle des stops, carnet d'ordres, impact de marché ou arbitrage de prix entre BTC/USDT et BTC/USDC.",
        "- Une bonne année 2022 ou un cycle complet favorable ne prouve rien pour une future correction du BTC.",
        "- Le patrimoine personnel conservé en Swing Trading / Buy & Hold n'est pas modélisé, car les dates et montants réels de tous les achats ne sont pas nécessaires à cette étude générale.",
        "- Ajouter un protocole prospectif figé, et réconcilier méthodologiquement chaque méthode avec les simulations annuelles anciennes avant de parler de réplication exacte.",
        "",
        "## Traçabilité / partages",
        "",
        "- Script : "+NAME+".py",
        "- Tableau et journal des opérations, provenance : "+NAME+".json",
        "- Courbes continues Binance 25 % : "+NAME+".csv",
        "- Ancien dossier des dix méthodes, protocoles annuels différents : SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_FIELD_GUIDE_COFFRE_SIMULATIONS_AND_PAPER_PROFILES_2026_11_07.md",
        "- Archive historique et contrôle OKX : voir les liens de provenance contenus dans le JSON.",
        "",
    ]
    return "\n".join(lines)

def main():
    bn,bn_matched,okx=load()
    windows=[]
    charts={}
    for title,bars,start,end,venue in (
        ("long",bn,CONT_START,CONT_END,"Binance BTC/USDT"),
        ("matched",bn_matched,MATCH_START,MATCH_END,"Binance BTC/USDT"),
        ("matched",okx,MATCH_START,MATCH_END,"OKX BTC/USDC"),
        ("recent_continuous",okx,MATCH_START,OKX_END,"OKX BTC/USDC"),
    ):
        group,daily=bundle(bars,start,end,venue,title)
        windows.append(group)
        if title=="long":charts=daily
    assert len(windows)==4
    assert windows[0]["days"]==2830
    assert windows[1]["days"]==windows[2]["days"]==183
    assert windows[3]["days"]==224
    assert all(len(w["methods"])==11 for w in windows)
    for w in windows:
        for a in w["methods"]:
            assert a["quarter25"]["days"]==w["days"]
            assert a["full100"]["buys"]==a["quarter25"]["buys"]
            assert a["quarter25"]["max_daily_drawdown_pct"]<=0
            assert a["quarter25"]["return_pct"]>-100
    assert next(x for x in windows[0]["methods"] if x["key"]=="DCA12")["full100"]["dca_months_bought"]==12
    assert next(x for x in windows[0]["methods"] if x["key"]=="CASH")["full100"]["return_pct"]==0
    data=dict(schema="seven.crypto.ten-pedagogical-methods-continuous.v1",study_date="2026-11-11",
        research_only=True,orders_enabled=False,
        method_status="INDEPENDENT_REIMPLEMENTATION_NOT_IDENTICAL_TO_2026_11_07_ENGINE",
        sources=dict(binance_market="BTCUSDT Spot",binance_archive_sha256=BIN_SHA,
                     binance_daily_candles=len(bn),
                     okx_market="BTC-USDC Spot",okx_confirmed_utc_candles=len(okx),
                     okx_provenance_file=OKX_EVIDENCE.name,
                     quote_currencies_different=True),
        assumptions=dict(starting_capital=1000,allocation_fractions=[1.,.25],
             fees_per_side=.001,assumed_slippage_per_side=.0005,
             doubled_fees_per_side=.002,doubled_slippage_per_side=.001,
             signal_at_confirmed_daily_close=True,trade_at_next_open=True,
             no_leverage=True,dca_initial_budget_months=12,
             dca_fixed_purchase_day=22,never_annual_reset=True),
        methods=METHODS,windows=windows)
    (HERE/(NAME+".json")).write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    (HERE/(NAME+".md")).write_text(make_report(data),encoding="utf-8")
    keys=list(METHODS)
    with (HERE/(NAME+".csv")).open("w",newline="",encoding="utf-8") as f:
        writer=csv.writer(f)
        writer.writerow(["date_utc"]+["equity_usdt_"+key for key in keys])
        for i in range(2830):
            writer.writerow([charts[keys[0]][i]["date"]]+[f"{charts[key][i]['equity']:.8f}" for key in keys])
    print("SEVEN_TEN_METHODS_CONTINUOUS_HISTORICAL_REPLAY_PASSED")
    for w in windows:
        print("WINDOW",w["window"],w["venue"],w["days"])
        for a in w["methods"]:
            q=a["quarter25"]
            print("METHOD",a["key"],"RETURN_25",q["return_pct"],
                  "DD_25",q["max_daily_drawdown_pct"],"BUYS",q["buys"])
    print("FILES",NAME+".md",NAME+".json",NAME+".csv")

if __name__=="__main__":
    main()
