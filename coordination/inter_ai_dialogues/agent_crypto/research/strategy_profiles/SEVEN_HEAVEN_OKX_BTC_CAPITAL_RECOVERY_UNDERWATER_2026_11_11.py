#!/usr/bin/env python3
"""Study duration below previous capital peaks: 25% BTC Buy & Hold vs frozen Donchian 55.
Existing verified OKX BTC-USDC daily candles only; no network, accounts or orders.
"""
import datetime as dt
import importlib.util
import json
from pathlib import Path

HERE=Path(__file__).resolve().parent
SOURCE=HERE/"SEVEN_HEAVEN_DONCHIAN55_OKX_INDEPENDENT_VALIDATION_2026_11_11.json"
METHOD=HERE/"SEVEN_HEAVEN_DONCHIAN55_OKX_INDEPENDENT_VALIDATION_2026_11_11.py"
STEM="SEVEN_HEAVEN_OKX_BTC_CAPITAL_RECOVERY_UNDERWATER_2026_11_11"
START="2026-04-01";END="2026-11-10";FEE=.001;SLIP=.0005

def underwater(rows):
    assert rows and len(rows)==len({x["date"] for x in rows})
    peak=1000.;peak_date="capital initial fictif"
    underwater_days=0;longest=0;streak=0;ending_streak=0
    active=None;episodes=[]
    worst=0.
    for row in rows:
        date=row["date"];equity=float(row["equity"])
        dd=100*(equity/peak-1)
        worst=min(worst,dd)
        if equity>=peak-1e-7:
            if active:
                active["recovery_date"]=date
                active["ongoing_at_end"]=False
                episodes.append(active)
                active=None
            peak=max(peak,equity)
            peak_date=date
            streak=0
        else:
            underwater_days+=1;streak+=1;longest=max(longest,streak)
            if active is None:
                active=dict(peak_date=peak_date,first_underwater_date=date,
                            trough_date=date,trough_equity=round(equity,4),
                            worst_decline_pct=round(dd,4))
            if dd<active["worst_decline_pct"]:
                active["trough_date"]=date
                active["trough_equity"]=round(equity,4)
                active["worst_decline_pct"]=round(dd,4)
            active["underwater_days"]=streak
    if active:
        active["recovery_date"]=None
        active["ongoing_at_end"]=True
        episodes.append(active)
        ending_streak=streak
    return dict(daily_count=len(rows),underwater_days=underwater_days,
                percent_days_underwater=round(100*underwater_days/len(rows),2),
                longest_consecutive_underwater_days=longest,
                ongoing_underwater_days_at_end=ending_streak,
                all_time_high_equity=round(peak,4),
                ending_equity=round(rows[-1]["equity"],4),
                ending_below_initial_capital=rows[-1]["equity"]<1000,
                max_drawdown_pct=round(worst,3),
                recovered_episodes=sum(e["recovery_date"] is not None for e in episodes),
                unfinished_episodes=sum(e["recovery_date"] is None for e in episodes),
                episodes=episodes)

def passive(bars,allocation):
    assert allocation in (.25,1.)
    dates={x["date"]:x for x in bars}
    initial=dates[START]["o"]
    qty=1000*allocation*(1-FEE)/(initial*(1+SLIP))
    cash=1000*(1-allocation)
    series=[]
    for b in bars:
        if START<=b["date"]<=END:
            equity=cash+qty*b["c"]*(1-SLIP)*(1-FEE)
            series.append(dict(date=b["date"],equity=round(equity,8)))
    return series

def load_and_validate():
    x=json.loads(SOURCE.read_text(encoding="utf-8"))
    assert x["sources"]["okx_meta"]["instrument"]=="BTC-USDC" and x["sources"]["okx_meta"]["bar"]=="1Dutc"
    assert x["sources"]["okx_meta"]["closed_candles"]==447
    assert x["verification"]["okx_confirmed_contiguous"]
    bars=x["okx_daily_candles"]
    assert len(bars)==447
    idx={b["date"]:b for b in bars}
    assert START in idx and END in idx
    previous=next(w for w in x["windows"] if w["venue"]=="OKX" and w["period"]=="combined")
    assert previous["model25"]["days"]==224
    spec=importlib.util.spec_from_file_location("seven_frozen_don55",str(METHOD))
    mod=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    sim=mod.simulate(bars,START,END,.25)
    for k in ("net_pct","max_dd_pct","trades","wins","losses","daily_equity"):
        assert sim[k]==previous["model25"][k], "Original Donchian replay has changed: "+k
    hold25=passive(bars,.25)
    hold100=passive(bars,1.)
    assert len(hold25)==len(sim["daily_equity"])==224
    assert round(100*(hold25[-1]["equity"]/1000-1),3)==previous["passive25_pct"]
    assert round(100*(hold100[-1]["equity"]/1000-1),3)==mod.passive(bars,START,END,1.)
    return x,sim,hold25,hold100

def make_report(data):
    rows=data["scenarios"]
    lines=[
      "# Seven Heaven — Rester sous son sommet : étude des délais de récupération du capital",
      "",
      "**Date de recherche : 11 novembre 2026.** Source : OKX Spot BTC-USDC, bougies quotidiennes UTC **confirmées**, du 1er avril au 10 novembre 2026.",
      "**Usage : recherche sur portefeuille fictif. Aucun ordre et aucun calcul sur les véritables actifs de l'utilisateur.**",
      "",
      "## Question",
      "",
      "Quand un investisseur conserve ses BTC, combien de journées son portefeuille fictif reste-t-il sous son sommet précédent,",
      "et en quoi la situation diffère-t-elle de Donchian 55 ?",
      "",
      "Un jour **sous son sommet** signifie que la valeur estimée à la clôture du portefeuille est inférieure au maximum historique observé depuis le démarrage du test.",
      "Ce n'est **pas** la même chose que « être sous le prix de mon achat » ou « être en perte par rapport à ma mise initiale ».",
      "",
      "## Hypothèses communes",
      "",
      "- Capital initial : 1 000 **USDC** fictifs, aucune marge, pas de vente à découvert.",
      "- Buy & Hold 25 % : 250 USDC de BTC achetés fictivement le 1er avril ; 750 USDC conservés en liquidités jusqu'au 10 novembre.",
      "- Donchian 55 25 % : investissement de 25 % des liquidités aux signaux de cassure 55 jours, sortie 20 jours, stop 3×ATR14, durée maximum 120 jours.",
      "- Buy & Hold 100 % est un **scénario de stress distinct**, pas une comparaison à risque égal avec les deux modèles 25 %.",
      "- Frais fictifs 0,10 % par côté et glissement 0,05 % par côté. Les BTC sont valorisés chaque jour au produit de liquidation hypothétique, sans prétendre que des ventes ont eu lieu.",
      "- Les 447 bougies OKX ont déjà été conservées dans l'étude précédente ; les 224 clôtures de la fenêtre commune sont utilisées ici.",
      "- Le résultat Donchian est rejoué avec le même programme et vérifié champ par champ contre le JSON source, y compris son évolution quotidienne.",
      "",
      "## Résultats contrôlés",
      "",
      "| Hypothèse | Variation finale | Pire baisse depuis le sommet | Jours sous un sommet | Plus longue séquence sous sommet | Séquence en cours au 10 novembre |",
      "|---|---:|---:|---:|---:|---:|",
    ]
    for key in ("DON55_25","HOLD_25","HOLD_100"):
        r=rows[key]
        m=r["recovery"]
        lines.append("| "+r["label"]+" | "+str(r["net_return_pct"])+" % | "+
                     str(m["max_drawdown_pct"])+" % | "+str(m["underwater_days"])+" / "+
                     str(m["daily_count"])+" | "+str(m["longest_consecutive_underwater_days"])+
                     " jours | "+str(m["ongoing_underwater_days_at_end"])+" jours |")
    lines+= [
      "",
      "## Lecture des épisodes de baisse",
      "",
    ]
    for key in ("DON55_25","HOLD_25","HOLD_100"):
        r=rows[key];m=r["recovery"]
        lines.append("### "+r["label"])
        lines.append("- Épisodes récupérés depuis un sommet : **"+str(m["recovered_episodes"])+
                     "** ; épisodes encore ouverts : **"+str(m["unfinished_episodes"])+"**.")
        lines.append("- Fin sous le capital initial de 1 000 USDC : **"+
                     ("oui" if m["ending_below_initial_capital"] else "non")+"**.")
        for e in m["episodes"][-3:]:
            lines.append("- Début sous sommet "+e["first_underwater_date"]+
                         " ; pire baisse "+str(e["worst_decline_pct"])+" % le "+e["trough_date"]+
                         " ; retour au sommet "+str(e["recovery_date"] or "non observé avant la fin de la fenêtre")+
                         " ; durée "+str(e["underwater_days"])+" jours.")
        lines.append("")
    lines+= [
      "## Ce que cette étude ne permet pas de conclure",
      "",
      "- Attendre une remontée n'assure pas un retour au prix d'achat ; aucune durée future de récupération ne peut être promise.",
      "- Le calendrier de son achat personnel, les quantités effectivement détenues et les frais réels du compte n'ont pas été utilisés.",
      "- Les maxima et minima du portefeuille sont calculés en FIN DE JOURNÉE seulement ; des creux intrajournaliers peuvent être plus graves.",
      "- Les USDC sont supposés rester à valeur stable dans ce modèle : il ne mesure pas le risque propre au stablecoin.",
      "- La stratégie Donchian a été évaluée sur des prix passés déjà connus, sans validation prospective ; les stops théoriques peuvent glisser.",
      "- Le scénario Buy & Hold n'implique aucun achat, vente ou recommandation pour les BTC personnels.",
      "- La source 2022–2025 sur OKX reste limitée pour cette API : ce test documente uniquement avril–novembre 2026.",
      "",
      "## Provenance et reproduction",
      "",
      "- Calcul : "+STEM+".py",
      "- Données, trajectoires et épisodes : "+STEM+".json",
      "- Série OKX 447 jours et Donchian validé : SEVEN_HEAVEN_DONCHIAN55_OKX_INDEPENDENT_VALIDATION_2026_11_11.json",
      "",
    ]
    return "\n".join(lines)

def main():
    source,sim,hold25,hold100=load_and_validate()
    streams={
        "DON55_25":dict(label="Donchian 55 · 25 %",data=sim["daily_equity"]),
        "HOLD_25":dict(label="Buy & Hold · 25 %",data=hold25),
        "HOLD_100":dict(label="Buy & Hold · 100 % (stress)",data=hold100),
    }
    scenarios={}
    for name,s in streams.items():
        points=s["data"]
        score=underwater(points)
        scenarios[name]=dict(label=s["label"],
            final_usdc=score["ending_equity"],
            net_return_pct=round(100*(score["ending_equity"]/1000-1),3),
            recovery=score,daily_equity=points)
    assert scenarios["DON55_25"]["net_return_pct"]==sim["net_pct"]
    assert scenarios["DON55_25"]["recovery"]["max_drawdown_pct"]==sim["max_dd_pct"]
    assert scenarios["HOLD_25"]["net_return_pct"]==1.974
    assert scenarios["HOLD_25"]["recovery"]["max_drawdown_pct"]==-8.23
    data=dict(
        schema="seven.crypto.btc.capital-recovery-underwater.v1",
        study_date="2026-11-11",
        source="Preverified OKX BTC-USDC 1Dutc, 447 closed daily candles",
        source_file=SOURCE.name,from_utc=START,to_utc=END,
        read_only=True,orders_enabled=False,
        model_assumptions=dict(initial_capital=1000,currency="USDC",
             buy_hold_allocation25=.25,don55_allocation_per_entry=.25,
             buy_hold_full_exposure_stress=1.,fee_per_side=FEE,slippage_per_side=SLIP,
             no_leverage=True,passive_liquidation_mark_to_market=True),
        scenarios=scenarios,
        verification=dict(original_don55_224_daily_rows_identical=True,
                          original_25pct_buyhold_net_and_dd_identical=True,
                          224_days_in_each_scenario=True),
    )
    (HERE/(STEM+".json")).write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    (HERE/(STEM+".md")).write_text(make_report(data),encoding="utf-8")
    print("SEVEN_BTC_CAPITAL_RECOVERY_STUDY_VERIFIED")
    for k,r in scenarios.items():
        m=r["recovery"]
        print("SCENARIO",k,"RETURN",r["net_return_pct"],
              "DD",m["max_drawdown_pct"],"UNDERWATER_DAYS",m["underwater_days"],
              "LONGEST",m["longest_consecutive_underwater_days"],
              "ONGOING",m["ongoing_underwater_days_at_end"],
              "EPISODES",len(m["episodes"]))

if __name__=="__main__":
    main()
