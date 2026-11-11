#!/usr/bin/env python3
"""Reproducible, read-only cross-method audit of the 10 EXISTING 2022-2025 BTC simulations.

This is a comparative audit, NOT a new market-data backtest. The historical
year-specific runs reset their fictional capital every January 22.
"""
import json
from pathlib import Path

HERE=Path(__file__).resolve().parent
INPUT=HERE/"SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_FIELD_GUIDE_COFFRE_SIMULATIONS_AND_PAPER_PROFILES_2026_11_07.md"
STEM="SEVEN_HEAVEN_BTC_TEN_STRATEGY_2022_2025_RESILIENCE_AUDIT_2026_11_11"
YEARS=("2022","2023","2024","2025")
HEADINGS={
  "return":"### Performance annuelle fictive (%)",
  "drawdown":"### Drawdown maximal sur la valeur liquidable à la clôture (%)",
  "operations":"### Nombre d’opérations simulées",
}
EXPECTED={
  "Buy & Hold", "DCA mensuel", "EMA 5/13", "EMA 10/20", "SMA 50/200",
  "MACD 12/26/9", "RSI 14, entrée 30 / sortie 55", "Bollinger 20/2",
  "Breakout 20/10", "SuperTrend 10×3"
}

def read_table(content, heading):
    if content.count(heading)!=1:
        raise ValueError("Source table heading missing or ambiguous: "+heading)
    block=content.split(heading,1)[1].split("\n### ",1)[0]
    lines=[line.strip() for line in block.splitlines() if line.strip().startswith("|")]
    if len(lines)<12:
        raise ValueError("Incomplete table following "+heading)
    hdr=[part.strip() for part in lines[0].strip("|").split("|")]
    if hdr[1:]!=list(YEARS):
        raise ValueError("Year columns changed: "+str(hdr))
    values={}
    for line in lines[2:]:
        parts=[part.strip() for part in line.strip("|").split("|")]
        if len(parts)!=5:
            break
        name=parts[0]
        if name in values:
            raise ValueError("Repeated strategy: "+name)
        values[name]={year:float(x.replace("%","").replace(",",".")) for year,x in zip(YEARS,parts[1:])}
    if set(values)!=EXPECTED:
        raise ValueError("Source strategy names changed: "+str(set(values)^EXPECTED))
    return values

def analyze(content):
    tables={metric:read_table(content,title) for metric,title in HEADINGS.items()}
    assert set(tables)=={"return","drawdown","operations"}
    for name in EXPECTED:
        for y in YEARS:
            if tables["drawdown"][name][y]>0:
                raise ValueError("Positive maximum drawdown")
            if tables["operations"][name][y]<0:
                raise ValueError("Negative trade count")
    hold="Buy & Hold"
    results=[]
    for name in sorted(EXPECTED):
        years={}
        for y in YEARS:
            gain=tables["return"][name][y]
            dd=tables["drawdown"][name][y]
            baseline_gain=tables["return"][hold][y]
            baseline_dd=tables["drawdown"][hold][y]
            years[y]=dict(
                net_pct=gain,max_daily_drawdown_pct=dd,number_of_model_operations=int(tables["operations"][name][y]),
                difference_from_buy_hold_return_percentage_points=round(gain-baseline_gain,2),
                drawdown_improvement_vs_buy_hold_percentage_points=round(dd-baseline_dd,2),
                higher_return_than_buy_hold=gain>baseline_gain,
                shallower_drawdown_than_buy_hold=dd>baseline_dd,
                dominates_buy_hold_within_year=(gain>=baseline_gain and dd>=baseline_dd and (gain>baseline_gain or dd>baseline_dd)),
            )
        results.append(dict(
            name=name,years=years,
            positive_final_years=sum(x["net_pct"]>0 for x in years.values()),
            beating_hold_years=sum(x["higher_return_than_buy_hold"] for x in years.values()),
            dominating_hold_years=sum(x["dominates_buy_hold_within_year"] for x in years.values()),
            worst_calendar_return_pct=min(x["net_pct"] for x in years.values()),
            deepest_daily_drawdown_pct=min(x["max_daily_drawdown_pct"] for x in years.values()),
            total_model_operations=sum(x["number_of_model_operations"] for x in years.values()),
        ))
    return dict(
        schema="seven.crypto.btc.ten-method-resilience-2022-2025.v1",
        date="2026-11-11",status="REANALYSIS_OF_EXISTING_HISTORICAL_RESULTS_NOT_NEW_BACKTEST",
        read_only=True,orders_enabled=False,
        source_file=INPUT.name,
        tested_method_count=10,years=list(YEARS),
        original_protocol=dict(market="Binance Spot BTC/USDT",resolution="1d",
             study_window_each_year="Jan 22–Dec 31",capital_per_year_usdt=1000,
             annual_capital_reset=True,signal_at_daily_close=True,
             hypothetical_next_open_fills=True,
             fee_per_side=.001,assumed_slippage_per_side=.0005,
             no_leverage=True),
        findings=results)

def report(e):
    index={r["name"]:r for r in e["findings"]}
    order=[
      "Buy & Hold","DCA mensuel","EMA 5/13","EMA 10/20","SMA 50/200",
      "MACD 12/26/9","RSI 14, entrée 30 / sortie 55","Bollinger 20/2",
      "Breakout 20/10","SuperTrend 10×3"]
    lines=[
      "# Seven Heaven — Dix stratégies BTC : analyse des mauvais marchés et de la protection du capital",
      "",
      "**11 novembre 2026 — étude de synthèse vérifiable de résultats déjà présents dans le Coffre.**",
      "**Ce document NE prétend PAS avoir exécuté un nouveau backtest ni ajouté des prix.**",
      "",
      "## Périmètre et comparabilité",
      "",
      "- Dix méthodes du **catalogue pédagogique P01–P10**, toutes étudiées : Buy & Hold, DCA mensuel, EMA5/13, EMA10/20, SMA50/200, MACD12/26/9, RSI14 (30/55), Bollinger20/2, Breakout20/10, SuperTrend10×3.",
      "- Source existante : Binance Spot BTC/USDT quotidien, **22 janvier–31 décembre de chaque année 2022–2025**.",
      "- Capital fictif **réinitialisé à 1 000 USDT chaque année** ; préchauffage des indicateurs sur données antérieures.",
      "- Prix de signal à la clôture et transaction fictive à l'ouverture suivante ; frais 0,10 % et glissement 0,05 % par côté ; sans levier.",
      "- Le DCA ne verse aucun capital externe : il étale sur douze achats un budget de 1 000 USDT déjà disponible.",
      "- **Interdiction de fusionner ou annualiser ces résultats** avec le second catalogue de douze variantes quantitatives suivi continûment depuis 2019.",
      "- Plus faible drawdown historique ne signifie PAS perte future limitée, ni stop garanti.",
      "",
      "## Performances annuelles historiques (%)",
      "",
      "| Méthode | 2022 baisse | 2023 reprise | 2024 hausse | 2025 correction |",
      "|---|---:|---:|---:|---:|",
    ]
    for name in order:
        rows=index[name]["years"]
        lines.append("| "+name+" | "+" | ".join(f"{rows[y]['net_pct']:+.2f} %" for y in YEARS)+" |")
    lines += [
      "",
      "## Drawdowns maximaux historiques (% du portefeuille depuis son sommet)",
      "",
      "| Méthode | 2022 | 2023 | 2024 | 2025 |",
      "|---|---:|---:|---:|---:|",
    ]
    for name in order:
        rows=index[name]["years"]
        lines.append("| "+name+" | "+" | ".join(f"{rows[y]['max_daily_drawdown_pct']:.2f} %" for y in YEARS)+" |")
    lines += [
      "",
      "## Récapitulatif multi-critères sur quatre fenêtres ANNUELLES indépendantes",
      "",
      "| Méthode | Années de gain final | Années où rendement > Buy & Hold | Années dominant Buy & Hold sur rendement ET drawdown | Pire rendement annuel | Pire drawdown observé | Opérations fictives cumulées |",
      "|---|---:|---:|---:|---:|---:|---:|",
    ]
    for name in order:
        r=index[name]
        lines.append(f"| {name} | {r['positive_final_years']}/4 | {r['beating_hold_years']}/4 | {r['dominating_hold_years']}/4 | {r['worst_calendar_return_pct']:+.2f}% | {r['deepest_daily_drawdown_pct']:.2f}% | {r['total_model_operations']} |")
    lines += [
      "",
      "## Leçons sur 2022 et 2025",
      "",
      "- 2022 est une année de choc : lire **ensemble** le rendement final et le drawdown du parcours. Une stratégie peut finir positive tout en ayant subi une très lourde baisse temporaire.",
      "- 2025 est une autre configuration : Bollinger 20/2 termine à +16,12 %, alors que Buy & Hold finit à −17,67 %, **mais** ce constat connu après coup n'indique pas que Bollinger conviendra à la prochaine baisse.",
      "- Les années 2023 et 2024 rappellent le coût potentiel des sorties : Buy & Hold capte davantage de forte tendance que la plupart des règles actives dans cette simulation.",
      "- SMA 50/200 à 0 % en 2022 : pas d'opération, pas une stratégie miraculeuse. Les opérations et le temps exposé sont essentiels pour interpréter un gain de 0.",
      "",
      "## Travail scientifique restant",
      "",
      "1. Rejouer **les dix règles complètes** avec protocole de portefeuille continu, allocations comparables, mêmes dates, coûts et données de validation indépendantes : les seuls tableaux annuels ne suffisent pas.",
      "2. Tester **des fenêtres OKX ou Kraken** qualifiées ; l'archive OKX validée couvre seulement 447 jours, donc pas de prétention de validation multicycle OKX.",
      "3. Pour DCA : tester une politique de budget fixe et une politique de versements réellement externes dans deux expériences explicitement différentes.",
      "4. Pour EMA/MACD/Bollinger/SuperTrend : tester la robustesse et la fréquence des mauvais signaux sur plusieurs fenêtres, puis une observation prospective.",
      "5. Pour toutes les méthodes : coûts doublés, séries de pertes, drawdown quotidien, durée sous sommet et inactivité. Préserver aussi les expériences négatives.",
      "",
      "## Limites",
      "",
      "- Le catalogue actuel compare **quatre périodes annuelles réinitialisées**, pas un portefeuille de quatre années détenu sans interruption.",
      "- Les calculs ici sont extraits mécaniquement de tableaux documentaires. Le script refuse de publier si les dix noms et les années ne correspondent plus.",
      "- Aucun retour anticipé sur les choix d'investissement réels ; les positions BTC personnelles suivent leur plan séparé.",
      "",
      "## Provenance et reproduction",
      "",
      "- Source : "+e["source_file"],
      "- Script : "+STEM+".py",
      "- Données structurées : "+STEM+".json",
      "- Index multi-stratégies : SEVEN_HEAVEN_ALL_STRATEGIES_SOURCE_COVERAGE_AND_RESEARCH_MATRIX_2026_11_11.md",
      "",
    ]
    return "\n".join(lines)

def main():
    source=INPUT.read_text(encoding="utf-8")
    result=analyze(source)
    payload=json.dumps(result,ensure_ascii=False,indent=2)+"\n"
    text=report(result)
    assert len(result["findings"])==10 and len(text)>2500
    assert result["findings"] and next(x for x in result["findings"] if x["name"]=="Buy & Hold")["years"]["2022"]["net_pct"]==-54.75
    assert next(x for x in result["findings"] if x["name"]=="Bollinger 20/2")["years"]["2025"]["net_pct"]==16.12
    (HERE/(STEM+".json")).write_text(payload,encoding="utf-8")
    (HERE/(STEM+".md")).write_text(text,encoding="utf-8")
    print("SEVEN_TEN_STRATEGY_EXISTING_EVIDENCE_REANALYSIS_VERIFIED")
    for r in result["findings"]:
        print("METHOD",r["name"],"positive_years",r["positive_final_years"],
              "beats_hold",r["beating_hold_years"],
              "dominates_hold",r["dominating_hold_years"],
              "worst_return",r["worst_calendar_return_pct"],
              "worst_dd",r["deepest_daily_drawdown_pct"])
    print("OUTPUT",STEM+".md",STEM+".json")

if __name__=="__main__":
    main()
