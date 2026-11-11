#!/usr/bin/env python3
"""Seven Heaven — Parabolic SAR (D19), daily BTC 2019–2026.

Read-only historical study. Reuses the existing continuous P01–P10 simulator
for identical capital accounting, baselines, costs and calendar conventions.
No credentials, account connections, derivatives or orders.
"""
import datetime as dt
import importlib.util
import json
from pathlib import Path

HERE=Path(__file__).resolve().parent
STEM="SEVEN_HEAVEN_PARABOLIC_SAR_BTC_CONTINUOUS_BINANCE_OKX_RESEARCH_2026_11_11"
PRIOR=HERE/"SEVEN_HEAVEN_TEN_STRATEGIES_CONTINUOUS_BTC_BINANCE_OKX_BACKTEST_2026_11_11.json"
MOTOR=HERE/"SEVEN_HEAVEN_TEN_STRATEGIES_CONTINUOUS_BTC_BINANCE_OKX_BACKTEST_2026_11_11.py"
VARIANTS={
  "SAR_STANDARD": dict(label="SAR Wilder classique 0.02/0.02/0.20",start=.02,step=.02,maximum=.20),
  "SAR_SLOW": dict(label="SAR plus lent 0.01/0.01/0.10",start=.01,step=.01,maximum=.10),
  "SAR_FAST": dict(label="SAR plus rapide 0.04/0.04/0.20",start=.04,step=.04,maximum=.20),
}
PERIODS=(
  ("long","Binance BTC/USDT","2019-01-01","2026-09-30"),
  ("matched","Binance BTC/USDT","2026-04-01","2026-09-30"),
  ("matched","OKX BTC/USDC","2026-04-01","2026-09-30"),
  ("recent_continuous","OKX BTC/USDC","2026-04-01","2026-11-10"),
)

def psar(bars,start,step,maximum):
    """Wilder-style PSAR; initial two-bar direction by close comparison.

    Each candle's reversal uses that completed candle's high/low. The signals
    are therefore acted on at NEXT day's opening only, never at the SAR level.
    Tentative SAR is checked for a reversal before previous-two-bar clamp.
    Variant convention is frozen and disclosed, not promised bit-identical to UI.
    """
    assert len(bars)>=4 and 0<start<=maximum and 0<step<=maximum
    n=len(bars);values=[None]*n;trend=[None]*n
    trend[1]=bars[1]["c"]>=bars[0]["c"]
    values[1]=bars[0]["l"] if trend[1] else bars[0]["h"]
    extreme=max(bars[0]["h"],bars[1]["h"]) if trend[1] else min(bars[0]["l"],bars[1]["l"])
    acceleration=start
    flips=[]
    for i in range(2,n):
        up=trend[i-1]
        projected=values[i-1]+acceleration*(extreme-values[i-1])
        if up:
            if bars[i]["l"]<=projected:
                trend[i]=False;values[i]=extreme
                extreme=bars[i]["l"];acceleration=start
                flips.append(dict(date=bars[i]["date"],direction="bearish",sar=round(values[i],5)))
            else:
                trend[i]=True
                values[i]=min(projected,bars[i-1]["l"],bars[i-2]["l"])
                if bars[i]["h"]>extreme:
                    extreme=bars[i]["h"]
                    acceleration=min(maximum,acceleration+step)
                assert values[i]<=min(bars[i-1]["l"],bars[i-2]["l"])+1e-8
        else:
            if bars[i]["h"]>=projected:
                trend[i]=True;values[i]=extreme
                extreme=bars[i]["h"];acceleration=start
                flips.append(dict(date=bars[i]["date"],direction="bullish",sar=round(values[i],5)))
            else:
                trend[i]=False
                values[i]=max(projected,bars[i-1]["h"],bars[i-2]["h"])
                if bars[i]["l"]<extreme:
                    extreme=bars[i]["l"]
                    acceleration=min(maximum,acceleration+step)
                assert values[i]>=max(bars[i-1]["h"],bars[i-2]["h"])-1e-8
        assert values[i]>0 and values[i]==values[i]
    entry=[False]*n;exit_=[False]*n
    for i in range(2,n):
        entry[i]=trend[i] and not trend[i-1]
        exit_[i]=(not trend[i]) and trend[i-1]
    assert sum(entry)+sum(exit_)==len(flips)
    return dict(values=values,bullish=trend,entry=entry,exit=exit_,flips=flips)

def synthetic_tests():
    base=dt.date(2020,1,1)
    def make(vals):
        return [dict(date=(base+dt.timedelta(days=i)).isoformat(),
           o=p,h=p+2,l=p-2,c=p,v=5) for i,p in enumerate(vals)]
    for points in (
        [100+2*i for i in range(30)]+[160-4*i for i in range(30)]+[40+4*i for i in range(30)],
        [100+(-1)**i*2 for i in range(90)],
    ):
        b=make(points)
        for c in VARIANTS.values():
            out=psar(b,c["start"],c["step"],c["maximum"])
            assert len(out["values"])==len(b)
            assert all(not(a and z) for a,z in zip(out["entry"],out["exit"]))
            assert len(out["flips"])==sum(out["entry"])+sum(out["exit"])
    # Strictly monotonic source should produce no flip from its initial direction.
    increasing=psar(make([100+3*i for i in range(80)]),.02,.02,.2)
    assert not any(increasing["exit"]) and not any(increasing["entry"])
    decreasing=psar(make([500-3*i for i in range(80)]),.02,.02,.2)
    assert not any(decreasing["exit"]) and not any(decreasing["entry"])
    return True

def load_simulator():
    s=importlib.util.spec_from_file_location("seven_prior_continuous",str(MOTOR))
    mod=importlib.util.module_from_spec(s);s.loader.exec_module(mod)
    return mod

def study_one(mod,bars,name,venue,start,end):
    all_signals={}
    for key,spec in VARIANTS.items():
        all_signals[key]=psar(bars,spec["start"],spec["step"],spec["maximum"])
        mod.METHODS[key]=spec["label"]
    entries={key:x["entry"] for key,x in all_signals.items()}
    exits={key:x["exit"] for key,x in all_signals.items()}
    methods=[]
    for key in VARIANTS:
        ref=all_signals[key]
        full,_=mod.simulate(bars,entries,exits,key,start,end,1.,.001,.0005)
        limited,curve=mod.simulate(bars,entries,exits,key,start,end,.25,.001,.0005)
        costlier,_=mod.simulate(bars,entries,exits,key,start,end,.25,.002,.001)
        assert full["buys"]==limited["buys"]==costlier["buys"]
        assert full["sells"]==limited["sells"]==costlier["sells"]
        same=[f for f in ref["flips"] if start<=f["date"]<=end]
        latest=next((f for f in reversed(ref["flips"]) if f["date"]<=end),None)
        methods.append(dict(key=key,params=VARIANTS[key],
            settings_frozen_before_test=True,
            direction_end="bullish" if ref["bullish"][next(i for i,b in enumerate(bars) if b["date"]==end)] else "bearish",
            sar_end=round(ref["values"][next(i for i,b in enumerate(bars) if b["date"]==end)],5),
            recent_flip=latest,flip_count_in_window=len(same),
            flip_dates_in_window=[x["date"]+":"+x["direction"] for x in same],
            long100=full,quarter25=limited,
            quarter25_double_cost_return_pct=costlier["return_pct"],
            # Retain the main continuous curve only; per-trade detail is in each result.
            daily_curve25=curve if name=="long" and key=="SAR_STANDARD" else []))
    dummy={key:[False]*len(bars) for key in ("BUY_HOLD","CASH")}
    hold100,_=mod.simulate(bars,dummy,dummy,"BUY_HOLD",start,end,1.,.001,.0005)
    hold25,_=mod.simulate(bars,dummy,dummy,"BUY_HOLD",start,end,.25,.001,.0005)
    cash,_=mod.simulate(bars,dummy,dummy,"CASH",start,end,1.,.001,.0005)
    return dict(window=name,venue=venue,start_utc=start,end_utc=end,
        days=hold100["days"],methods=methods,
        baselines=dict(buy_hold100=hold100,buy_hold25=hold25,cash=cash))

def verify_existing_baselines(windows):
    old=json.loads(PRIOR.read_text(encoding="utf-8"))
    assert old["sources"]["binance_daily_candles"]==3075
    assert old["sources"]["okx_confirmed_utc_candles"]==447
    assert len(old["windows"])==4
    for a,b in zip(windows,old["windows"]):
        assert (a["window"],a["venue"],a["days"])==(b["window"],b["venue"],b["days"])
        original=next(x for x in b["methods"] if x["key"]=="BUY_HOLD")
        for key,target in (("buy_hold100","full100"),("buy_hold25","quarter25")):
            got=a["baselines"][key];expected=original[target]
            for metric in ("return_pct","max_daily_drawdown_pct","buys","sells","days","final","annual_returns_pct"):
                assert got[metric]==expected[metric],f"Baseline changed at {a['window']} {metric}"
    return True

def draft(out):
    windows=out["windows"]
    long=windows[0];bn=windows[1];ok=windows[2];recent=windows[3]
    lines=[
        "# Seven Heaven — SAR parabolique : étude des retournements BTC",
        "",
        "**11 novembre 2026** · Recherche historique rétrospective, paramètres déclarés à l'avance, sur Spot uniquement.",
        "",
        "## Comprendre le SAR",
        "",
        "Le SAR de J. Welles Wilder place des points **sous** les prix lors d'une tendance haussière, et **au-dessus** lors d'une tendance baissière. Le changement de côté est un retournement hypothétique, non une prévision.",
        "Dans l'expérience Spot : après un passage baissier→haussier sur **bougie quotidienne clôturée**, achat fictif le lendemain à l'ouverture ; après passage haussier→baissier, vente fictive à l'ouverture suivante et attente en liquidités.",
        "**Aucun short ni vente automatique au niveau théorique SAR.** Il peut donc y avoir un écart important entre le niveau du point et l'exécution hypothétique.",
        "",
        "## Définition / conventions figées",
        "",
        "- Trois variantes prédéclarées, **sans optimisation postérieure** : standard 0,02/0,02/0,20 ; lente 0,01/0,01/0,10 ; rapide 0,04/0,04/0,20.",
        "- Initialisation : direction première/ deuxième clôture ; SAR initial = extrême de la bougie précédente ; EP initial = extrême des deux premières ; facteur d'accélération remis au départ sur chaque inversion.",
        "- À chaque bougie : candidat = SAR précédent + AF × (EP précédent − SAR précédent) ; tester retournement sur haut/bas **de cette bougie clôturée** ; sinon, clamp sur les deux bougies précédentes et mettre à jour EP/AF sur nouvel extrême.",
        "- Cette convention est explicite, inspirée de la description de TradingView, **pas certifiée identique au SAR de l'interface Administrator** (qui peut avoir d'autres règles d'initialisation et un horizon 1h).",
        "- La sensibilité rapide peut produire davantage d'inversions ; aucune variante n'est déclarée meilleure a priori.",
        "",
        "## Sources, capital et témoins",
        "",
        "- Binance Spot BTC/USDT, archive quotidienne du Coffre : 3 075 journées du 1er mai 2018 au 30 septembre 2026, vérifiée SHA-256 par le moteur existant.",
        "- Portefeuille continu : **1er janvier 2019 – 30 septembre 2026**, 2 830 journées ; aucun redémarrage annuel.",
        "- OKX Spot BTC/USDC : 447 journées déjà validées, du 21 août 2025 au 10 novembre 2026 ; comparaison appariée aux **183 jours avril–septembre 2026** sur Binance BTC/USDT.",
        "- Une quatrième fenêtre suit sans redémarrage le portefeuille OKX d'avril jusqu'au 10 novembre 2026 : **224 jours**.",
        "- Capital initial fictif 1 000 unités de cotation ; variante 100 % des liquidités ou 25 % par entrée ; frais **0,10 % par côté** et glissement **0,05 % par côté**, stress coûts doublés.",
        "- Contrôles Buy & Hold 100 %, Buy & Hold 25 % et liquidités ; **baselines vérifiées identiques** aux résultats du moteur continu P01–P10 archivé.",
        "- BTC/USDT et BTC/USDC sont deux paires différentes : cette comparaison ne fusionne pas leurs prix.",
        "",
        "## Binance 2019–2026 : SAR et Buy & Hold",
        "",
        "| Méthode | Rendement 25 % | Drawdown 25 % | Achats | Rendement 100 % | Drawdown 100 % |",
        "|---|---:|---:|---:|---:|---:|",
    ]
    for m in long["methods"]:
        a=m["quarter25"];b=m["long100"]
        lines.append(f"| {m['params']['label']} | {a['return_pct']:+.2f}% | {a['max_daily_drawdown_pct']:.2f}% | {a['buys']} | {b['return_pct']:+.2f}% | {b['max_daily_drawdown_pct']:.2f}% |")
    h=long["baselines"]
    for k,label in (("buy_hold25","Buy & Hold 25 %"),("buy_hold100","Buy & Hold 100 %"),("cash","Cash")):
        r=h[k]
        lines.append(f"| {label} | {r['return_pct']:+.2f}% | {r['max_daily_drawdown_pct']:.2f}% | {r['buys']} | — | — |")
    lines += [
        "",
        "## 183 jours identiques, Binance / OKX",
        "",
        "| Variante SAR à 25 % | Binance BTC/USDT | OKX BTC/USDC | Drawdown OKX | Achats OKX | Inversions de tendance OKX |",
        "|---|---:|---:|---:|---:|---:|",
    ]
    for b,o in zip(bn["methods"],ok["methods"]):
        q=o["quarter25"]
        lines.append(f"| {o['params']['label']} | {b['quarter25']['return_pct']:+.2f}% | {q['return_pct']:+.2f}% | {q['max_daily_drawdown_pct']:.2f}% | {q['buys']} | {o['flip_count_in_window']} |")
    lines += [
        "",
        "## OKX 224 jours continus jusqu'au 10 novembre 2026",
        "",
        "| Variante SAR à 25 % | Rendement | Drawdown | Achats | Résultat coûts doublés | SAR au 10 novembre / tendance calculée |",
        "|---|---:|---:|---:|---:|---|",
    ]
    for m in recent["methods"]:
        q=m["quarter25"]
        lines.append(f"| {m['params']['label']} | {q['return_pct']:+.2f}% | {q['max_daily_drawdown_pct']:.2f}% | {q['buys']} | {m['quarter25_double_cost_return_pct']:+.2f}% | {m['sar_end']:,.2f} / {m['direction_end']} |")
    lines += [
        "",
        "## Contradictions et risques",
        "",
        "- **Aucun rendement historique** ne garantit le futur. Les trois réglages sont examinés tous, y compris en cas d'échec.",
        "- Le SAR suit une tendance, il ne mesure pas sa force. Dans un range il peut enchaîner les faux signaux et les frais.",
        "- Quand une bougie traverse le SAR, l'étude calcule la direction uniquement **après la clôture**, puis simule l'ouverture suivante ; elle ne suppose jamais que le stop historique est exécuté au point SAR.",
        "- Un SAR configuré sur bougies quotidiennes n'a pas les mêmes valeurs ni les mêmes signaux que sur les bougies horaires de la capture Firefox.",
        "- Ne pas convertir la direction calculée sur la dernière journée archivée en information du marché actuel : les prix peuvent avoir changé depuis.",
        "- Test non prospectif, pas d'étude d'impact de marché ni des risques des stablecoins ; aucun transfert de paramètres dans le Trader.",
        "",
        "## Provenance reproductible",
        "",
        "- Script de ce backtest : "+STEM+".py",
        "- Journal des positions et résultats : "+STEM+".json",
        "- Capitalisation / témoins : SEVEN_HEAVEN_TEN_STRATEGIES_CONTINUOUS_BTC_BINANCE_OKX_BACKTEST_2026_11_11.py",
        "- Source officielle de la logique : https://fr.tradingview.com/support/solutions/43000502597/",
        "- Référence indépendante des limites : https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/PSAR",
        "",
    ]
    return "\n".join(lines)

def main():
    assert synthetic_tests()
    mod=load_simulator()
    bn,matched,okx=mod.load()
    windows=[
      study_one(mod,bn,"long","Binance BTC/USDT","2019-01-01","2026-09-30"),
      study_one(mod,matched,"matched","Binance BTC/USDT","2026-04-01","2026-09-30"),
      study_one(mod,okx,"matched","OKX BTC/USDC","2026-04-01","2026-09-30"),
      study_one(mod,okx,"recent_continuous","OKX BTC/USDC","2026-04-01","2026-11-10"),
    ]
    assert [x["days"] for x in windows]==[2830,183,183,224]
    assert verify_existing_baselines(windows)
    assert all(len(x["methods"])==3 for x in windows)
    d=dict(schema="seven.crypto.parabolic-sar.daily.research.v1",
         study_date="2026-11-11",research_only=True,orders_enabled=False,
         previous_model=MOTOR.name,
         source_dates=dict(binance_first="2018-05-01",binance_last="2026-09-30",
                           okx_first="2025-08-21",okx_last="2026-11-10"),
         rules=dict(ohlc_daily=True,classic_start=.02,classic_step=.02,classic_max=.20,
             indicator_evaluated_on_closed_bar=True,trade_next_day_open=True,
             reverse_to_cash_not_short=True,fees_each_side=.001,
             assumed_slippage_each_side=.0005,double_cost_test=True,
             same_pricing_as_existing_ten_method_engine=True,
             no_lookahead_signal=True,no_automatic_stop_execution_claim=True),
         baseline_reproduction_verified=True,
         synthetic_invariant_tests_passed=True,
         windows=windows)
    (HERE/(STEM+".json")).write_text(json.dumps(d,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    (HERE/(STEM+".md")).write_text(draft(d),encoding="utf-8")
    print("SEVEN_PARABOLIC_SAR_BTC_STUDY_VERIFIED")
    for w in windows:
        print("WINDOW",w["window"],w["venue"],w["days"])
        for m in w["methods"]:
            q=m["quarter25"]
            print("SAR",m["key"],"NET25",q["return_pct"],"DD25",q["max_daily_drawdown_pct"],
                  "TRADES",q["completed_positions"],"FLIPS",m["flip_count_in_window"],
                  "STRESS",m["quarter25_double_cost_return_pct"])
    print("OUTPUT",STEM+".md",STEM+".json")

if __name__=="__main__":
    main()
