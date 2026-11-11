#!/usr/bin/env python3
"""Compare twelve canonical BTC strategies at 25 percent entry allocation. Research only."""
import json
from pathlib import Path

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[4]
ORIGINAL=HERE/"SEVEN_HEAVEN_BTC_SWING_WIN_LOSS_CATALOG_2026_11_10.py"
BASELINE=HERE/"SEVEN_HEAVEN_BTC_SWING_WIN_LOSS_VERIFIED_EVIDENCE_2026_11_10.json"
ARCHIVE=ROOT/"public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/bitcoin-Max.json.gz"
NAME="SEVEN_HEAVEN_BTC_25PCT_CAPITAL_STRATEGY_COMPARISON_2026_11_11"

def replay():
    source=ORIGINAL.read_text(encoding="utf-8")
    source=source.split("if __name__=='__main__':")[0]
    # The canonical mathematics and signals are kept, with only stake sizing
    # and equity/trade-log recording added to the inner simulator.
    changes=[
      ("def sim(k,fee,slip):","def sim(k,fee,slip,allocation=1.0,include_daily=False):"),
      ("spent=cash;price=b['o']*(1+slip)","spent=cash*allocation;price=b['o']*(1+slip)"),
      ("qty=spent*(1-fee)/price;cash=0.;entered=(i,spent)","qty=spent*(1-fee)/price;cash-=spent;entered=(i,spent)"),
      ("trades.append(dict(bought=B[entered[0]]['date'],sold=b['date'],profit=proceeds-entered[1]))","trades.append(dict(bought=B[entered[0]]['date'],sold=b['date'],profit=proceeds-entered[1],entry_capital=entered[1],exit_proceeds=proceeds))"),
      ("  return dict(key=k,net_pct=round(100*(equity[-1]/1000-1),3),\n   max_dd_pct=round(maxdd,3),trades=trade_count,wins=wins,losses=losses,\n   exposure_pct=round(100*exposed/len(equity),2),yearly=yearly)",
       "  answer=dict(key=k,net_pct=round(100*(equity[-1]/1000-1),3),\n   max_dd_pct=round(maxdd,3),trades=trade_count,wins=wins,losses=losses,\n   exposure_pct=round(100*exposed/len(equity),2),yearly=yearly)\n  if include_daily:\n   answer['daily']=[dict(date=B[start+j]['date'],equity=round(v,8)) for j,v in enumerate(equity)]\n   answer['trade_log']=trades\n  return answer"),
      (" return dict(schema='seven.crypto.btc.strategy-failures.v1',read_only=True,orders_enabled=False,",
       " replays={str(int(a*100)):sim('DON55',.001,.0005,a,True) for a in (1.,.5,.25)}\n stress={str(int(a*100)):sim('DON55',.002,.001,a) for a in (1.,.5,.25)}\n comparisons={k:sim(k,.001,.0005,.25,True) for k in NAMES if k not in ('CASH','BUY_HOLD')}\n stress_comparisons={k:sim(k,.002,.001,.25) for k in NAMES if k not in ('CASH','BUY_HOLD')}\n return dict(schema='seven.crypto.btc.strategy-failures.v1',read_only=True,orders_enabled=False,"),
      ("double_costs=[dict(key=r['key'],net_pct=r['net_pct'],trades=r['trades']) for r in double])",
       "double_costs=[dict(key=r['key'],net_pct=r['net_pct'],trades=r['trades']) for r in double],daily_replays=replays,double_cost_replays=stress,comparisons25=comparisons,comparison_stress25=stress_comparisons)"),
    ]
    for old,new in changes:
        if source.count(old)!=1:
            raise RuntimeError("Canonical source changed, refusing unverified patch: "+old[:65])
        source=source.replace(old,new,1)
    scope={"__name__":"donchian_daily_research","__file__":str(ORIGINAL)}
    exec(compile(source,str(ORIGINAL),"exec"),scope)
    study=scope["run"](str(ARCHIVE))
    canonical=json.loads(BASELINE.read_text(encoding="utf-8"))
    assert study["source"]["sha256"]==canonical["source"]["sha256"]
    orig={r["key"]:r for r in study["strategies"]}
    stored={r["key"]:r for r in canonical["strategies"]}
    for key,row in orig.items():
        for field in ("net_pct","max_dd_pct","trades","wins","losses","exposure_pct","yearly"):
            assert row[field]==stored[key][field],f"Canonical mismatch: {key}.{field}"
    outcomes=study["daily_replays"]
    for field in ("net_pct","max_dd_pct","trades","wins","losses","exposure_pct","yearly"):
        assert outcomes["100"][field]==stored["DON55"][field],f"Donchian baseline mismatch {field}"
    assert outcomes["100"]["trades"]==29 and outcomes["100"]["wins"]==16 and outcomes["100"]["losses"]==13
    dates=[(t["bought"],t["sold"]) for t in outcomes["100"]["trade_log"]]
    for allocation in ("100","50","25"):
        result=outcomes[allocation]
        assert result["trades"]==29 and len(result["trade_log"])==29 and len(result["daily"])==2830
        assert [(t["bought"],t["sold"]) for t in result["trade_log"]]==dates
        assert result["daily"][0]["date"]=="2019-01-01" and result["daily"][-1]["date"]=="2026-09-30"
    prior_double=next(r for r in canonical["double_costs"] if r["key"]=="DON55")
    assert study["double_cost_replays"]["100"]["net_pct"]==prior_double["net_pct"]
    assert study["double_cost_replays"]["100"]["trades"]==prior_double["trades"]
    comparison=study["comparisons25"]
    stress_comparison=study["comparison_stress25"]
    assert len(comparison)==12 and len(stress_comparison)==12
    assert comparison["DON55"]==study["daily_replays"]["25"],"Donchian benchmark changed"
    for key,result in comparison.items():
        assert key in stored and key not in ("CASH","BUY_HOLD")
        reference=stored[key]
        assert result["trades"]==reference["trades"] and result["wins"]==reference["wins"] and result["losses"]==reference["losses"],f"Trade accounting altered for {key}"
        assert len(result["daily"])==2830
        assert result["daily"][0]["date"]=="2019-01-01" and result["daily"][-1]["date"]=="2026-09-30"
        assert result["net_pct"] > -100 and -100 <= result["max_dd_pct"] <= 0
        assert stress_comparison[key]["trades"]==reference["trades"],f"Stress trade count altered: {key}"
    return study


def extract_comparison(study):
    results=study["comparisons25"]
    stress=study["comparison_stress25"]
    baseline=results["DON55"]
    max_loss=abs(baseline["max_dd_pct"])
    methods=[]
    for key,r in results.items():
        methods.append({
            "key":key,
            "label":next(x["label"] for x in study["strategies"] if x["key"]==key),
            "initial_usdt":1000,
            "final_usdt":round(1000*(1+r["net_pct"]/100),2),
            "net_return_pct":r["net_pct"],
            "max_daily_drawdown_pct":r["max_dd_pct"],
            "trade_count":r["trades"],
            "wins":r["wins"],
            "losses":r["losses"],
            "days_in_market_pct":r["exposure_pct"],
            "annual_returns_pct":r["yearly"],
            "double_cost_return_pct":stress[key]["net_pct"],
            "beats_don55_return":r["net_pct"]>baseline["net_pct"],
            "no_worse_historical_daily_drawdown":r["max_dd_pct"]>=baseline["max_dd_pct"],
            "meets_both_historical_criteria":r["net_pct"]>baseline["net_pct"] and r["max_dd_pct"]>=baseline["max_dd_pct"],
            "trade_log":r["trade_log"],
        })
    return sorted(methods,key=lambda r:r["net_return_pct"],reverse=True)


def make_report(study,methods):
    baseline=next(x for x in methods if x["key"]=="DON55")
    good=[x for x in methods if x["meets_both_historical_criteria"]]
    lines=[
        "# SEVEN HEAVEN — Douze stratégies Bitcoin à exposition réduite (25 %)",
        "",
        "**Étude : 11 novembre 2026.** **Fenêtre : du 1er janvier 2019 au 30 septembre 2026.**",
        "**Statut : recherche historique uniquement, aucun ordre réel.**",
        "",
        "## Question testée",
        "",
        "Une stratégie du catalogue peut-elle dépasser Donchian 55 (à 25 % du capital disponible engagé lors de chaque entrée),",
        "tout en gardant un drawdown quotidien historique inférieur ou égal en valeur absolue ?",
        "",
        "Il s'agit d'une comparaison DES DEUX MESURES HISTORIQUES, pas d'une promesse de moindre risque global ni d'une sélection automatique.",
        "",
        "## Règles communes et vérification",
        "",
        "- Source **Binance Spot BTC/USDT**, 3 075 bougies quotidiennes dans l'archive d'origine, empreinte SHA-256 contrôlée par le moteur canonique.",
        "- Fenêtre identique : 2 830 journées de 2019 à septembre 2026, capital initial fictif **1 000 USDT**, non réinitialisé chaque année.",
        "- Frais 0,10 % par côté, glissement présumé de 0,05 % par côté, ordre à l'ouverture quotidienne suivante ; long ou liquidités, sans levier.",
        "- À chaque entrée, engager **25 % des liquidités disponibles**, conserver le reste, réinvestir seulement lors d'un prochain signal ; sans rééquilibrage annuel.",
        "- Les **règles d'entrée, sortie, ATR et durée maximale** sont celles de chaque méthode déjà enregistrée : elles ne sont pas ajustées en fonction des résultats.",
        "- Chaque original à 100 % est recomputé et comparé CHAMP PAR CHAMP au référentiel existant ; les comptes d'opérations à 25 % doivent également correspondre.",
        "- Stress séparé avec frais et glissement doublés (0,20 % et 0,10 % par côté).",
        "- Le drawdown est évalué quotidiennement sur le portefeuille fictif complet, liquidités comprises.",
        "",
        "## Résultats sur la même période",
        "",
        "| Méthode | Capital final USDT | Gain net | Drawdown max. | Opérations G/P | Temps avec BTC | Gain si coûts doublés | Pareto face à Donchian 25 % ? |",
        "|---|---:|---:|---:|---:|---:|---:|---|",
    ]
    for r in methods:
        verdict="OUI" if r["meets_both_historical_criteria"] else ("RÉFÉRENCE" if r["key"]=="DON55" else "NON")
        lines.append(
            f"| {r['label']} ({r['key']}) | {r['final_usdt']:,.2f} | {r['net_return_pct']:+.3f}% "
            f"| {r['max_daily_drawdown_pct']:.3f}% | {r['trade_count']} ({r['wins']}/{r['losses']}) "
            f"| {r['days_in_market_pct']:.2f}% | {r['double_cost_return_pct']:+.3f}% | {verdict} |"
        )
    lines += [
        "",
        "## Verdict de recherche",
        "",
        f"- Donchian 55 à 25 % : **{baseline['net_return_pct']:+.3f} %** de variation finale, **{baseline['max_daily_drawdown_pct']:.3f} %** de pire baisse quotidienne, sur **{baseline['trade_count']} opérations**.",
        f"- Méthodes dépassant son rendement sans dépasser son drawdown historique : **{len(good)}**.",
    ]
    if good:
        for r in good:
            lines.append(f"  - **{r['label']}** : {r['net_return_pct']:+.3f} % de gain, {r['max_daily_drawdown_pct']:.3f} % de drawdown.")
    else:
        lines.append("- **Aucune méthode n'atteint les deux critères sur cette fenêtre historique.** Cela ne signifie pas que Donchian 55 est optimal ou sûr.")
    lines += [
        "",
        "## Exemples de situations difficiles : années 2022, 2025 et 2026 (partielle)",
        "",
        "| Méthode | 2022 | 2025 | 2026 janv.-sept. |",
        "|---|---:|---:|---:|",
    ]
    for r in methods:
        a=r["annual_returns_pct"]
        lines.append(f"| {r['key']} | {a['2022']:+.3f}% | {a['2025']:+.3f}% | {a['2026']:+.3f}% |")
    lines += [
        "",
        "## Réserves indispensables",
        "",
        "- Les données historiques ont déjà servi au développement des hypothèses : **aucune validation prospective indépendante** n'a été faite ici.",
        "- Douze méthodes apparentées ont été comparées après coup : **biais de sélection / multiple testing** ; une supériorité apparente ne devient pas une règle fiable.",
        "- Un plus faible drawdown passé ne signifie pas une moindre perte possible à l'avenir : liquidité, sauts de cours, dysfonctionnements d'exchange, et exécution des stops ne sont pas garantis.",
        "- Le système n'est pas un trader multi-actifs : les fonds non investis sont supposés rester disponibles en USDT et n'intègrent ni taux, ni risque propre au stablecoin.",
        "- Les transactions historiques restent modélisées avec des bougies OHLC journalières ; pas de carnet historique ni de test de gap d'exécution réel.",
        "- Ce test **n'utilise pas le BTC/USDC d'OKX** ni les bougies intrajournalières 15 min affichées dans l'Administrator. Les signaux ne sont pas transposables tels quels.",
        "- Aucune donnée de portefeuille utilisateur, aucun ordre, aucune écriture dans Administrator, Trader, Operator ou Bridge.",
        "",
        "## Fichiers partagés",
        "",
        "- **Script** : SEVEN_HEAVEN_BTC_25PCT_CAPITAL_STRATEGY_COMPARISON_2026_11_11.py",
        "- **Données structurées** : SEVEN_HEAVEN_BTC_25PCT_CAPITAL_STRATEGY_COMPARISON_2026_11_11.json",
        "- **Trajectoires quotidiennes** : SEVEN_HEAVEN_BTC_25PCT_CAPITAL_STRATEGY_COMPARISON_2026_11_11.csv",
        "",
        "Tous les fichiers sont sous coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/.",
        "",
    ]
    return "\n".join(lines)


def main():
    import csv
    from datetime import datetime,timezone
    study=replay()
    methods=extract_comparison(study)
    base=HERE/NAME
    output_json={
        "schema":"seven.crypto.btc.25pct-comparison.v1",
        "date":"2026-11-11",
        "computed_at_utc":datetime.now(timezone.utc).isoformat(),
        "research_only":True,
        "orders_enabled":False,
        "source":study["source"],
        "model":study["model"],
        "allocation_rule":"Invest 25 percent of remaining cash at each original entry. Other cash stays uninvested; full account drawdown includes cash.",
        "comparison_rule":"Net return strictly greater than 25 percent Donchian, maximum daily historical drawdown no worse than 25 percent Donchian.",
        "original_baseline_verified":True,
        "methods":methods,
    }
    (HERE/(NAME+".json")).write_text(json.dumps(output_json,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    (HERE/(NAME+".md")).write_text(make_report(study,methods),encoding="utf-8")
    source=study["comparisons25"]
    keys=sorted(source.keys())
    with (HERE/(NAME+".csv")).open("w",encoding="utf-8",newline="") as fh:
        writer=csv.writer(fh)
        writer.writerow(["date_utc"]+["equity_usdt_"+k for k in keys])
        for i in range(2830):
            writer.writerow([source[keys[0]]["daily"][i]["date"]]+[f"{source[k]['daily'][i]['equity']:.8f}" for k in keys])
    winner=[m for m in methods if m["meets_both_historical_criteria"]]
    print("SEVEN_TWELVE_STRATEGIES_25PCT_REPLAY_VERIFIED",len(methods),"comparisons")
    print("BENCHMARK",next(m for m in methods if m["key"]=="DON55"))
    print("STRICTLY_SUPERIOR_HISTORICAL_CANDIDATES",[(m["key"],m["net_return_pct"],m["max_daily_drawdown_pct"]) for m in winner])
    for method in methods:
        print("STRATEGY",method["key"],"NET",method["net_return_pct"],"DD",method["max_daily_drawdown_pct"],"TRADES",method["trade_count"])
    print("OUTPUTS",NAME+".md",NAME+".json",NAME+".csv")

if __name__=="__main__":
    main()
